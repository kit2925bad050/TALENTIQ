from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_talent_development_engine():
    test_emp_id = "emp-alex-chen"

    # 1. Skill Passport
    res_passport = client.get(f"/api/employee/skill-passport?employee_id={test_emp_id}")
    assert res_passport.status_code == 200, res_passport.text
    passport_data = res_passport.json()
    assert passport_data["employeeId"] == test_emp_id
    assert len(passport_data["skills"]) > 0
    assert "status" in passport_data["skills"][0]

    # 2. Skill DNA
    res_dna = client.get(f"/api/employee/skill-dna?employee_id={test_emp_id}")
    assert res_dna.status_code == 200, res_dna.text
    dna_data = res_dna.json()
    assert "categories" in dna_data
    assert dna_data["totalTrackedSkills"] > 0

    # 3. Evidence Explorer
    res_evidence = client.get(f"/api/employee/evidence?employee_id={test_emp_id}")
    assert res_evidence.status_code == 200, res_evidence.text
    evidence_data = res_evidence.json()
    assert len(evidence_data["evidenceList"]) > 0

    # 4. Skill Dependency Graph
    res_graph = client.get(f"/api/employee/skill-graph?employee_id={test_emp_id}&target_skill=MLOps")
    assert res_graph.status_code == 200, res_graph.text
    graph_data = res_graph.json()
    assert graph_data["targetSkill"] == "MLOps"
    assert len(graph_data["nodes"]) > 0
    assert len(graph_data["recommendedLearningSequence"]) > 0

    # 5. Role Simulator: Start & Evaluate
    res_sim_start = client.post(f"/api/employee/role-simulator/start?employee_id={test_emp_id}&role_id=role-ml-engineer")
    assert res_sim_start.status_code == 200, res_sim_start.text
    sim_data = res_sim_start.json()
    assert len(sim_data["tasks"]) == 4

    res_sim_eval = client.post("/api/employee/role-simulator/evaluate", json={
        "simulationId": sim_data["simulationId"],
        "employeeId": test_emp_id,
        "roleId": "role-ml-engineer",
        "taskId": sim_data["tasks"][0]["taskId"],
        "userSubmission": "SELECT user_id, AVG(amount) OVER(PARTITION BY user_id ROWS BETWEEN 29 PRECEDING AND CURRENT ROW) as moving_avg FROM txs;",
        "taskCategory": "Data"
    })
    assert res_sim_eval.status_code == 200, res_sim_eval.text
    eval_data = res_sim_eval.json()
    assert eval_data["overallScore"] >= 75
    assert "verdict" in eval_data

    # 6. Skill Stress Test: Start & Evaluate
    res_stress_start = client.post(f"/api/employee/skill-stress-test/start?employee_id={test_emp_id}&skill_name=Docker&level=1")
    assert res_stress_start.status_code == 200, res_stress_start.text
    stress_data = res_stress_start.json()
    assert stress_data["level"] == 1

    res_stress_eval = client.post("/api/employee/skill-stress-test/evaluate", json={
        "employeeId": test_emp_id,
        "skillName": "Docker",
        "level": 1,
        "userAnswer": "An image layer is immutable and read-only, while a container layer adds a thin read-write union mount on top."
    })
    assert res_stress_eval.status_code == 200, res_stress_eval.text
    stress_res_data = res_stress_eval.json()
    assert stress_res_data["passed"] is True
    assert stress_res_data["nextLevel"] == 2

    # 7. Learning Feed & Missions
    res_feed = client.get(f"/api/employee/learning-feed?employee_id={test_emp_id}")
    assert res_feed.status_code == 200, res_feed.text
    assert len(res_feed.json()) > 0

    res_missions = client.get(f"/api/employee/learning-missions?employee_id={test_emp_id}")
    assert res_missions.status_code == 200, res_missions.text
    missions_data = res_missions.json()
    assert len(missions_data) > 0

    mission_id = missions_data[0]["missionId"]
    res_advance = client.post("/api/employee/learning-mission/advance", json={
        "missionId": mission_id,
        "employeeId": test_emp_id,
        "stageNumber": 1,
        "evidenceOrAnswer": "Completed Docker fundamentals."
    })
    assert res_advance.status_code == 200, res_advance.text
    assert res_advance.json()["currentStage"] == 2

    # 8. Mock Interview
    res_interview = client.post(f"/api/employee/mock-interview/start?employee_id={test_emp_id}&role_title=Machine%20Learning%20Engineer")
    assert res_interview.status_code == 200, res_interview.text
    interview_start = res_interview.json()
    assert interview_start["totalQuestions"] == 3

    res_interview_ans = client.post("/api/employee/mock-interview/answer", json={
        "interviewId": interview_start["interviewId"],
        "employeeId": test_emp_id,
        "roleTitle": "Machine Learning Engineer",
        "questionId": "q-1",
        "questionNumber": 1,
        "userAnswer": "I construct multi-stage Dockerfiles with FastAPI and gunicorn workers, setting up healthcheck endpoints and memory cgroup limits to ensure resilience."
    })
    assert res_interview_ans.status_code == 200, res_interview_ans.text
    assert res_interview_ans.json()["overallScore"] >= 75

    # 9. Career What-If Simulator
    res_whatif = client.post("/api/employee/career-simulator", json={
        "employeeId": test_emp_id,
        "addedSkills": ["Docker", "MLOps"],
        "targetRoleTitle": "Machine Learning Engineer"
    })
    assert res_whatif.status_code == 200, res_whatif.text
    whatif_data = res_whatif.json()
    assert whatif_data["projectedAlignment"] > whatif_data["currentAlignment"]

    # 10. Talent Twin Chat
    res_twin = client.post("/api/employee/talent-twin/chat", json={
        "employeeId": test_emp_id,
        "query": "What should I learn next?"
    })
    assert res_twin.status_code == 200, res_twin.text
    assert "Docker" in res_twin.json()["answer"]
    assert len(res_twin.json()["groundedEvidenceSources"]) > 0

    # 11. Skill Growth History
    res_growth = client.get(f"/api/employee/progress?employee_id={test_emp_id}")
    assert res_growth.status_code == 200, res_growth.text
    growth_data = res_growth.json()
    assert growth_data["totalSkillsGrown"] > 0
    assert growth_data["hasMasteryCredential"] is True

    # 12. Internal Gigs
    res_gigs = client.get(f"/api/employee/internal-gigs?employee_id={test_emp_id}")
    assert res_gigs.status_code == 200, res_gigs.text
    assert len(res_gigs.json()) > 0

    # 13. HR Team Builder
    res_team = client.post("/api/hr/team-builder", json={
        "projectName": "Real-Time Fraud Shield",
        "projectDescription": "Deploy ML anomaly detection microservices.",
        "requiredSkills": ["Python", "SQL", "Machine Learning"]
    })
    assert res_team.status_code == 200, res_team.text
    team_data = res_team.json()
    assert team_data["teamCompletenessScore"] > 0
    assert len(team_data["recommendedTeam"]) > 0

    # 14. HR Skill Intelligence
    res_hr_intel = client.get("/api/hr/skill-intelligence")
    assert res_hr_intel.status_code == 200, res_hr_intel.text
    assert "criticalSkillGaps" in res_hr_intel.json()

    # 15. Mentor Memory
    res_mem = client.get(f"/api/mentor/memory?employee_id={test_emp_id}")
    assert res_mem.status_code == 200, res_mem.text
    assert "memories" in res_mem.json()

    print("All Talent Development Engine integration tests passed successfully!")

if __name__ == "__main__":
    test_talent_development_engine()
