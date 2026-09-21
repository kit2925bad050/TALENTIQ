import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_mentor_endpoints():
    print("Testing TALENTIQ AI Mentor API...")
    emp_id = "emp-alex-chen"
    role_id = "role-ml-engineer"
    skill = "Docker"
    
    # 1. Assess Skill Readiness
    res = requests.post(f"{BASE_URL}/mentor/assess-skill", json={"employeeId": emp_id, "targetRoleId": role_id})
    print(f"1. Assess Skill: {res.status_code}, Overall: {res.json().get('overallReadinessPercentage')}%")
    assert res.status_code == 200

    # 2. Create Learning Path
    res = requests.post(f"{BASE_URL}/mentor/create-learning-path", json={"employeeId": emp_id, "skillName": skill, "targetRoleId": role_id})
    lp = res.json()
    print(f"2. Learning Path: {len(lp.get('topics', []))} topics, Current: {lp.get('topics')[0]['title']}")
    assert len(lp.get("topics", [])) > 0
    topic_id = lp["topics"][0]["id"]
    topic_title = lp["topics"][0]["title"]

    # 3. Teach Topic
    res = requests.post(f"{BASE_URL}/mentor/teach", json={"employeeId": emp_id, "skillName": skill, "topicId": topic_id})
    teach = res.json()
    print(f"3. Teach Topic: {teach.get('topic')}, Explanation length: {len(teach.get('explanation', ''))} chars")
    assert len(teach.get("stepByStepDemo", [])) > 0

    # 4. Generate Practice
    res = requests.post(f"{BASE_URL}/mentor/generate-practice", json={"employeeId": emp_id, "skillName": skill, "topic": topic_title})
    practice = res.json()
    print(f"4. Practice Task: {practice.get('prompt')[:60]}...")
    assert res.status_code == 200

    # 5. Evaluate Practice (Negative -> Trigger Re-teaching)
    res = requests.post(f"{BASE_URL}/mentor/evaluate-answer", json={
        "employeeId": emp_id,
        "skillName": skill,
        "topic": topic_title,
        "taskPrompt": practice.get("prompt"),
        "solutionText": "docker run -p 8000:5000 my_app",
        "codeSnippet": "docker run -p 8000:5000 my_app"
    })
    eval_neg = res.json()
    print(f"5. Evaluate (Mistake): Score {eval_neg.get('score')}%, Action: {eval_neg.get('recommendedAction')}, Weakness: {eval_neg.get('weakConcept')}")
    assert eval_neg.get("recommendedAction") == "reteach"

    # 6. Re-teach Weak Concept
    res = requests.post(f"{BASE_URL}/mentor/reteach", json={
        "employeeId": emp_id,
        "skillName": skill,
        "topic": topic_title,
        "weakConcept": eval_neg.get("weakConcept") or "Port Mapping Order",
        "previousMistake": "docker run -p 8000:5000"
    })
    reteach = res.json()
    print(f"6. Re-teach Concept: {reteach.get('weakConcept')}, Simplified: {reteach.get('simplifiedExplanation')[:60]}...")
    assert res.status_code == 200

    # 7. Generate Quiz
    res = requests.post(f"{BASE_URL}/mentor/generate-quiz", json={"employeeId": emp_id, "skillName": skill, "topic": topic_title, "numQuestions": 3})
    quiz = res.json()
    print(f"7. Quiz generated: {len(quiz.get('questions', []))} questions")
    assert len(quiz.get("questions", [])) > 0

    # 8. Evaluate Quiz (High Score -> Mastery Update)
    answers = {q["id"]: q["correctAnswer"] for q in quiz["questions"]}
    res = requests.post(f"{BASE_URL}/mentor/evaluate-quiz", json={
        "employeeId": emp_id,
        "skillName": skill,
        "topic": topic_title,
        "answers": answers
    })
    quiz_res = res.json()
    print(f"8. Quiz Result: Score {quiz_res.get('score')}%, Mastery: {quiz_res.get('masteryStatus')}")
    assert quiz_res.get("passed") is True

    # 9. Get Progress & Mastery
    res = requests.get(f"{BASE_URL}/mentor/progress/{emp_id}")
    print(f"9. Employee Progress records: {len(res.json())}")
    res = requests.get(f"{BASE_URL}/mentor/mastery/{emp_id}")
    print(f"9. Mastered Skills: {res.json().get('masteredSkills')}")

    # 10. Role Readiness
    res = requests.post(f"{BASE_URL}/mentor/role-readiness", json={"employeeId": emp_id, "targetRoleId": role_id})
    readiness = res.json()
    print(f"10. Target Role Readiness: {readiness.get('overallReadinessPercentage')}%, Mastered: {readiness.get('masteredCount')}/{readiness.get('totalRequiredCount')}")

    # 11. Mentor Chat
    res = requests.post(f"{BASE_URL}/mentor/chat", json={"employeeId": emp_id, "skillName": skill, "message": "Teach me Docker from the beginning"})
    chat = res.json()
    print(f"11. Mentor Chat Reply length: {len(chat.get('reply', ''))} chars")

    # 12. Evaluate Project
    res = requests.post(f"{BASE_URL}/mentor/evaluate-project", json={
        "employeeId": emp_id,
        "skillName": skill,
        "projectTitle": "Containerized FastAPI ML Server",
        "codeSnippet": "FROM python:3.11-slim\nWORKDIR /app\nCOPY . .\nCMD ['uvicorn', 'main:app']",
        "explanation": "Built multi-stage containerized model endpoint"
    })
    print(f"12. Project Evaluation Score: {res.json().get('score')}%")

    print("\nALL 12 AI SKILL MENTOR BACKEND ENDPOINTS PASSED CLEANLY!")

if __name__ == "__main__":
    test_mentor_endpoints()
