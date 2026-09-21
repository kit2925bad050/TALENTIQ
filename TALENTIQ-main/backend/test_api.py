from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

HR_HEADERS = {"Authorization": "Bearer hr-admin-token"}
EMPLOYEE_HEADERS = {"Authorization": "Bearer emp-alex-chen"}

def test_health_check():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json() == {"status": "healthy"}

def test_employee_endpoints():
    res = client.get("/api/employees")
    assert res.status_code == 200
    employees = res.json()
    assert len(employees) > 0
    emp_id = employees[0]["id"]

    # Matches
    res = client.get(f"/api/employees/{emp_id}/matches")
    assert res.status_code == 200
    assert len(res.json()) > 0

def test_roles_endpoints():
    res = client.get("/api/roles")
    assert res.status_code == 200
    assert len(res.json()) > 0

def test_ai_talent_engine_endpoints():
    emp_id = "emp-alex-chen"
    # Skill Passport
    res = client.get(f"/api/employee/skill-passport?employee_id={emp_id}")
    assert res.status_code == 200
    assert res.json()["employeeId"] == emp_id

    # Skill DNA
    res = client.get(f"/api/employee/skill-dna?employee_id={emp_id}")
    assert res.status_code == 200

    # Evidence
    res = client.get(f"/api/employee/evidence?employee_id={emp_id}")
    assert res.status_code == 200

    # Skill Graph
    res = client.get(f"/api/employee/skill-graph?employee_id={emp_id}&target_skill=Docker")
    assert res.status_code == 200

def test_hr_role_authorization():
    # 1. Unauthenticated request to HR analytics -> 401 Unauthorized
    res = client.get("/api/analytics/workforce")
    assert res.status_code == 401

    # 2. Employee request to HR analytics -> 403 Forbidden
    res = client.get("/api/analytics/workforce", headers=EMPLOYEE_HEADERS)
    assert res.status_code == 403

    # 3. HR Admin request to HR analytics -> 200 OK
    res = client.get("/api/analytics/workforce", headers=HR_HEADERS)
    assert res.status_code == 200
    assert "totalEmployees" in res.json()

    # 4. Employee request to HR Team Builder -> 403 Forbidden
    res = client.post("/api/hr/team-builder", json={"projectName": "AI Initiative", "projectDescription": "Deep learning project", "requiredSkills": ["Python"]}, headers=EMPLOYEE_HEADERS)
    assert res.status_code == 403

    # 5. HR Admin request to HR Team Builder -> 200 OK
    res = client.post("/api/hr/team-builder", json={"projectName": "AI Initiative", "projectDescription": "Deep learning project", "requiredSkills": ["Python"]}, headers=HR_HEADERS)
    assert res.status_code == 200

def test_auth_login_endpoints():
    # Employee login
    res = client.post("/api/auth/login", json={"email": "alex.chen@talentiq.ai", "password": "password123"})
    assert res.status_code == 200
    assert res.json()["user"]["role"] == "employee"

    # HR login with authorized account
    res = client.post("/api/auth/hr-login", json={"email": "sarah.jenkins@talentiq.ai", "password": "password123"})
    assert res.status_code == 200
    assert res.json()["user"]["role"] == "hr_admin"

    # HR login with non-HR account -> 403 Forbidden
    res = client.post("/api/auth/hr-login", json={"email": "regular.employee@talentiq.ai", "password": "password123"})
    assert res.status_code == 403
