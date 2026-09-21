import json
import logging
from fastapi.testclient import TestClient
from app.main import app
from app.services.db_service import db
from app.models.schemas import ExtractedProfileData, SkillItem, Certification, ProjectItem

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

client = TestClient(app)

def test_full_mission_docker_lifecycle():
    logger.info("==================================================")
    logger.info("🧪 TESTING FULL 9-STEP MISSION: BECOME JOB-READY IN DOCKER")
    logger.info("==================================================")

    test_uid = "firebase-user-docker-candidate-99"

    # STEP 1: New user check - Empty / Unverified Guard
    emp_res = client.get(f"/api/employees/{test_uid}")
    assert emp_res.status_code == 404, "New user must not have auto-generated mock profile"
    logger.info("✅ Step 1 Verified: Authentication does not auto-generate mock profile.")

    # STEP 2: Document Verification with Gemini Extraction & User Review Confirmation
    extract_res = client.post(
        "/api/documents/extract",
        data={
            "employeeId": test_uid,
            "documentType": "certificate",
            "rawText": "Course Certificate: AWS & Python Cloud Data Engineering. Candidate: David Lin. Skills: Python, SQL, Statistics, AWS S3. Projects: Customer Data Lakehouse."
        }
    )
    assert extract_res.status_code == 200
    extract_json = extract_res.json()
    assert extract_json["verificationStatus"] == "EXTRACTED"
    logger.info(f"✅ Step 2 Verified: Gemini extracted {len(extract_json['extractedData']['skills'])} skills with evidence.")

    # Confirm profile
    confirm_res = client.post(
        "/api/documents/confirm",
        json={
            "employeeId": test_uid,
            "documentId": extract_json["documentId"],
            "verifiedData": extract_json["extractedData"]
        }
    )
    assert confirm_res.status_code == 200
    verified_emp = confirm_res.json()
    assert verified_emp["profileStatus"] == "VERIFIED"
    logger.info("✅ Step 3 Verified: Profile confirmed & saved to Firestore with VERIFIED status.")

    # STEP 3: Verified Learning Resources Engine
    res_list = client.get("/api/mentor/resources/Docker")
    assert res_list.status_code == 200
    resources = res_list.json()
    assert len(resources) >= 2
    assert any("Docker" in r["skill"] for r in resources)
    logger.info(f"✅ Step 4 Verified: Fetched {len(resources)} verified Docker learning resources.")

    # STEP 4: AI Mentor Learning Path & Teaching Topic
    lp_res = client.post(
        "/api/mentor/create-learning-path",
        json={
            "employeeId": test_uid,
            "skillName": "Docker",
            "targetRoleId": "role-ml-engineer"
        }
    )
    assert lp_res.status_code == 200
    lp = lp_res.json()
    assert len(lp["topics"]) > 0

    teach_res = client.post(
        "/api/mentor/teach",
        json={
            "employeeId": test_uid,
            "skillName": "Docker",
            "topicId": lp["topics"][0]["id"]
        }
    )
    assert teach_res.status_code == 200
    teach = teach_res.json()
    assert len(teach["explanation"]) > 20
    assert len(teach["stepByStepDemo"]) > 0
    logger.info(f"✅ Step 5 Verified: AI Teacher generated structured pedagogical content for '{teach['topic']}'.")

    # STEP 5: Practice Generation & Submission
    practice_res = client.post(
        "/api/mentor/generate-practice",
        json={
            "employeeId": test_uid,
            "skillName": "Docker",
            "topic": teach["topic"],
            "difficulty": "Intermediate"
        }
    )
    assert practice_res.status_code == 200
    practice = practice_res.json()

    eval_res = client.post(
        "/api/mentor/evaluate-answer",
        json={
            "employeeId": test_uid,
            "skillName": "Docker",
            "topic": teach["topic"],
            "taskPrompt": practice["prompt"],
            "solutionText": "docker run -d -p 5000:8000 --name churn_predictor retention_model:v1",
            "codeSnippet": "docker run -d -p 5000:8000 --name churn_predictor retention_model:v1"
        }
    )
    assert eval_res.status_code == 200
    eval_json = eval_res.json()
    assert eval_json["score"] >= 80
    logger.info(f"✅ Step 6 Verified: Practice submission evaluated dynamically with score {eval_json['score']}%.")

    # STEP 6: Quiz Generation & Evaluation
    quiz_res = client.post(
        "/api/mentor/generate-quiz",
        json={
            "employeeId": test_uid,
            "skillName": "Docker",
            "topic": teach["topic"],
            "numQuestions": 3
        }
    )
    assert quiz_res.status_code == 200
    quiz = quiz_res.json()
    assert len(quiz["questions"]) >= 2

    # Answers map
    answers = {q["id"]: q["options"][0] for q in quiz["questions"]}
    quiz_eval = client.post(
        "/api/mentor/evaluate-quiz",
        json={
            "employeeId": test_uid,
            "skillName": "Docker",
            "topic": teach["topic"],
            "answers": answers
        }
    )
    assert quiz_eval.status_code == 200
    q_result = quiz_eval.json()
    assert "score" in q_result
    logger.info(f"✅ Step 7 Verified: Quiz evaluation processed with score {q_result['score']}%.")

    # STEP 7: Re-teaching Engine
    reteach_res = client.post(
        "/api/mentor/reteach",
        json={
            "employeeId": test_uid,
            "skillName": "Docker",
            "topic": teach["topic"],
            "weakConcept": "Port Mapping Flag (-p host:container)",
            "previousMistake": "docker run -p 8000:5000"
        }
    )
    assert reteach_res.status_code == 200
    reteach = reteach_res.json()
    assert len(reteach["simplifiedExplanation"]) > 20
    assert len(reteach["concreteAnalogy"]) > 10
    logger.info("✅ Step 8 Verified: AI Re-teaching engine provided analogy and simplified explanation.")

    # STEP 8: Project Evaluation & Mastery Update
    proj_eval = client.post(
        "/api/mentor/evaluate-project",
        json={
            "employeeId": test_uid,
            "skillName": "Docker",
            "projectTitle": "Production FastAPI Inference Container",
            "codeSnippet": "FROM python:3.11-slim\nWORKDIR /app\nCOPY requirements.txt .\nRUN pip install -r requirements.txt\nCOPY . .\nEXPOSE 8000\nCMD [\"uvicorn\", \"main:app\", \"--host\", \"0.0.0.0\", \"--port\", \"8000\"]",
            "explanation": "Built containerized microservice running FastAPI inference with non-root security principles."
        }
    )
    assert proj_eval.status_code == 200
    p_res = proj_eval.json()
    assert p_res["score"] >= 80

    mastery_res = client.get(f"/api/mentor/mastery/{test_uid}")
    assert mastery_res.status_code == 200
    mastery = mastery_res.json()
    logger.info(f"✅ Step 9 Verified: Mastery updated with overall readiness {mastery['overallReadiness']}%.")

    # STEP 9: Role Readiness Calculation
    readiness_res = client.post(
        "/api/mentor/role-readiness",
        json={
            "employeeId": test_uid,
            "targetRoleId": "role-ml-engineer"
        }
    )
    assert readiness_res.status_code == 200
    readiness = readiness_res.json()
    assert readiness["targetRoleTitle"] == "Machine Learning Engineer"
    logger.info(f"✅ Step 10 Verified: Target role readiness calculated: {readiness['overallReadinessPercentage']}%.")

    # STEP 10: S3 Career Development Report Generation & Document History
    report_res = client.post(
        "/api/documents/generate-career-report",
        json={
            "employeeId": test_uid,
            "targetRoleId": "role-ml-engineer"
        }
    )
    assert report_res.status_code == 200
    rep = report_res.json()
    assert rep["s3Key"].startswith(f"employees/{test_uid}/generated_reports/")
    assert "downloadUrl" in rep

    history_res = client.get(f"/api/documents/generated/{test_uid}")
    assert history_res.status_code == 200
    history = history_res.json()
    assert len(history) >= 1
    assert history[0]["documentId"] == rep["documentId"]
    logger.info(f"✅ Step 11 Verified: Generated Career Development Report saved in S3: {rep['s3Key']}.")

    logger.info("==================================================")
    logger.info("🎉 ALL 9-STEP MISSION ENDPOINTS TESTED & PASSED 100%!")
    logger.info("==================================================")

if __name__ == "__main__":
    test_full_mission_docker_lifecycle()
