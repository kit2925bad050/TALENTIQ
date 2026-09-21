import uuid
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_document_first_pipeline():
    print("\n========================================================")
    print("TESTING TALENTIQ REAL-DATA-FIRST PIPELINE")
    print("========================================================\n")
    
    test_uid = f"user-new-john-doe-{uuid.uuid4().hex[:6]}"
    
    # 1. Verify New User has NO pre-existing profile or fake data
    print("1. Checking that new user has NO auto-provisioned fake profile...")
    res = client.get(f"/api/employees/{test_uid}")
    print(f"   GET /employees/{test_uid} -> Status {res.status_code}")
    assert res.status_code == 404, f"Expected 404 for new unverified user, got {res.status_code}"
    print("   [OK] Verified: New user starts with empty profile.")

    # 2. Generate Presigned S3 URL
    print("\n2. Requesting secure presigned S3 upload URL...")
    res = client.post("/api/upload/presigned-url", json={
        "fileName": "AWS_Solutions_Architect_Certificate.pdf",
        "fileType": "application/pdf",
        "category": "certificate",
        "employeeId": test_uid
    })
    assert res.status_code == 200
    presigned = res.json()
    print(f"   [OK] S3 Key generated: {presigned.get('s3Key')}")
    assert f"employees/{test_uid}/documents/" in presigned.get("s3Key")

    # 3. Document OCR / Text Extraction
    print("\n3. Extracting factual talent information from uploaded document...")
    sample_cert_text = """
    Amazon Web Services Training and Certification
    This is to certify that
    John Doe
    has successfully achieved the certification:
    AWS Certified Solutions Architect - Associate
    
    Demonstrated competencies in:
    - Designing resilient cloud architectures on AWS
    - Containerization using Docker and orchestration with Kubernetes
    - Python microservices and FastAPI backend development
    - Relational database schema optimization with PostgreSQL and SQL
    
    Issue Date: 2025-02
    Verification ID: AWS-CERT-8849201
    """
    
    res = client.post(
        "/api/documents/extract",
        data={
            "employeeId": test_uid,
            "documentType": "certificate",
            "s3Key": presigned.get("s3Key"),
            "fileUrl": presigned.get("fileUrl"),
            "rawText": sample_cert_text
        }
    )
    assert res.status_code == 200
    extracted = res.json()
    doc_id = extracted.get("documentId")
    extracted_data = extracted.get("extractedData", {})
    
    print(f"   [OK] Extracted Candidate Name: {extracted_data.get('name')}")
    print(f"   [OK] Extracted Certificate: {extracted_data.get('certificate_name')}")
    print(f"   [OK] Extracted Skills Count: {len(extracted_data.get('skills', []))}")
    
    assert len(extracted_data.get("skills", [])) > 0
    # Every extracted skill must contain evidence
    for s in extracted_data.get("skills", []):
        assert bool(s.get("evidence")), f"Skill {s.get('name')} missing evidence quote!"

    # 4. User Reviews and Confirms Extracted Information
    print("\n4. User reviews and confirms extracted information...")
    extracted_data["designation"] = "Cloud & Backend Engineer"
    extracted_data["department"] = "Platform Engineering"
    extracted_data["experienceYears"] = 3.0
    extracted_data["summary"] = "Certified Cloud & Backend Engineer specializing in AWS, Docker, Kubernetes, and Python microservices."

    res = client.post("/api/documents/confirm", json={
        "employeeId": test_uid,
        "documentId": doc_id,
        "verifiedData": extracted_data
    })
    assert res.status_code == 200
    verified_profile = res.json()
    print(f"   [OK] Profile Verified: {verified_profile.get('name')} ({verified_profile.get('designation')})")
    print(f"   [OK] Profile Status: {verified_profile.get('profileStatus')}")
    assert verified_profile.get("profileStatus") == "VERIFIED"

    # 5. Fetch Verified Employee from API
    print("\n5. Fetching newly verified employee profile...")
    res = client.get(f"/api/employees/{test_uid}")
    assert res.status_code == 200
    emp = res.json()
    assert emp.get("name") == "John Doe"
    assert len(emp.get("skills", [])) > 0
    print(f"   [OK] Employee has {len(emp.get('skills', []))} verified skills saved in Firestore.")

    # 6. Test Downstream Features: Role Matching
    print("\n6. Running Deterministic Internal Role Matching for Verified Employee...")
    res = client.get(f"/api/employees/{test_uid}/matches")
    assert res.status_code == 200
    matches = res.json()
    print(f"   [OK] Role matches generated: {len(matches)}")
    assert len(matches) > 0
    top_match = matches[0]
    print(f"   Top Role Match: {top_match.get('roleTitle')} ({top_match.get('finalMatch')}%)")
    assert top_match.get("finalMatch") > 0

    # 7. AI Skill Mentor Assessment
    print("\n7. AI Skill Mentor Assessment based on Verified Credentials...")
    res = client.post("/api/mentor/assess-skill", json={
        "employeeId": test_uid,
        "targetRoleId": "role-ml-engineer"
    })
    assert res.status_code == 200
    assessment = res.json()
    print(f"   [OK] AI Mentor Readiness: {assessment.get('overallReadiness')}%")
    print(f"   Recommended Next Step: {assessment.get('recommendedNextStep')}")

    print("\n========================================================")
    print("ALL REAL-DATA-FIRST TESTS PASSED SUCCESSFULLY!")
    print("========================================================\n")

if __name__ == "__main__":
    test_document_first_pipeline()
