from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from app.models.schemas import (
    SkillAssessmentRequest, SkillAssessmentResponse,
    CreateLearningPathRequest, LearningPath,
    TeachRequest, TeachingContent,
    GeneratePracticeRequest, PracticeTask,
    PracticeSubmission, EvaluationResult,
    GenerateQuizRequest, Quiz,
    QuizSubmission, QuizResult,
    ReteachRequest, ReteachContent,
    ProjectEvaluationRequest,
    SkillProgressItem, SkillMasteryResponse,
    MentorChatRequest, MentorChatResponse,
    RoleReadinessResponse, LearningResourceItem
)
import logging
from app.services.db_service import db
from app.services import mentor_service
from app.services.resource_service import get_resources_for_skill

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/mentor", tags=["AI Skill Mentor"])

# ==========================================================
# 1. Skill Assessment & Gap Readiness
# ==========================================================
@router.post("/assess-skill", response_model=SkillAssessmentResponse)
def assess_skill(payload: SkillAssessmentRequest):
    logger.info(f"[AI Mentor] /assess-skill requested for employeeId='{payload.employeeId}', roleId='{payload.targetRoleId}'")
    emp = db.get_employee(payload.employeeId)
    if not emp:
        logger.warning(f"[AI Mentor] Employee '{payload.employeeId}' not found")
        raise HTTPException(status_code=404, detail="Employee not found")
    role = db.get_role(payload.targetRoleId) if payload.targetRoleId else None
    return mentor_service.assess_skill_readiness(emp, role)

# ==========================================================
# 2. Structured Learning Path
# ==========================================================
@router.post("/create-learning-path", response_model=LearningPath)
def create_learning_path(payload: CreateLearningPathRequest):
    logger.info(f"[AI Mentor] /create-learning-path for employeeId='{payload.employeeId}', skill='{payload.skillName}', role='{payload.targetRoleId}'")
    emp = db.get_employee(payload.employeeId)
    if not emp:
        logger.warning(f"[AI Mentor] Employee '{payload.employeeId}' not found")
        raise HTTPException(status_code=404, detail="Employee not found")
    role = db.get_role(payload.targetRoleId) if payload.targetRoleId else None
    
    # Check if existing path exists
    existing = db.get_learning_path(payload.employeeId, payload.skillName)
    if existing:
        return existing
        
    lp = mentor_service.generate_learning_path(emp, payload.skillName, role)
    db.save_learning_path(lp)
    return lp

# ==========================================================
# 3. AI Teaching Topic
# ==========================================================
@router.post("/teach", response_model=TeachingContent)
def teach_topic(payload: TeachRequest):
    logger.info(f"[AI Mentor] /teach requested for emp='{payload.employeeId}', skill='{payload.skillName}', topicId='{payload.topicId}'")
    emp = db.get_employee(payload.employeeId)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
        
    topic_name = payload.topicId or "Foundations & Core Mental Models"
    
    # Look up learning path topic name if ID was passed
    lp = db.get_learning_path(payload.employeeId, payload.skillName)
    if lp:
        for t in lp.topics:
            if t.id == payload.topicId:
                topic_name = t.title
                break
                
    content = mentor_service.generate_teaching_content(emp, payload.skillName, topic_name)
    return content

# ==========================================================
# 4. Generate Practice Task
# ==========================================================
@router.post("/generate-practice", response_model=PracticeTask)
def generate_practice(payload: GeneratePracticeRequest):
    logger.info(f"[AI Mentor] /generate-practice for emp='{payload.employeeId}', skill='{payload.skillName}', topic='{payload.topic}'")
    emp = db.get_employee(payload.employeeId)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
        
    return PracticeTask(
        id=f"pt-{payload.skillName.lower()}-1",
        skillName=payload.skillName,
        topic=payload.topic,
        difficulty=payload.difficulty or "Intermediate",
        prompt=f"Containerize a Python API and map host port 5000 to internal port 8000 using image `retention_model:v1` in detached mode.",
        instructions=[
            "Use the `docker run` command.",
            "Include `-d` to run in detached mode.",
            "Apply the `-p` flag with correct host and container port mapping.",
            "Assign the container name `churn_predictor`."
        ],
        starterCode="docker run ...",
        expectedOutput="Container churn_predictor running on 0.0.0.0:5000 -> 8000/tcp",
        hints=["Remember: -p <HOST_PORT>:<CONTAINER_PORT>", "Use --name churn_predictor"]
    )

# ==========================================================
# 5. Evaluate Practice Answer
# ==========================================================
@router.post("/evaluate-answer", response_model=EvaluationResult)
def evaluate_answer(payload: PracticeSubmission):
    logger.info(f"[AI Mentor] /evaluate-answer for emp='{payload.employeeId}', skill='{payload.skillName}', topic='{payload.topic}'")
    emp = db.get_employee(payload.employeeId)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
        
    res = mentor_service.evaluate_practice_submission(emp, payload)
    
    # Update employee skill progress in database
    prog = db.get_skill_progress(payload.employeeId, payload.skillName) or SkillProgressItem(
        employeeId=payload.employeeId,
        skillName=payload.skillName,
        currentLevel=20,
        targetLevel=85,
        lessonsCompleted=1,
        totalLessons=6,
        assessmentScore=res.score,
        attempts=1,
        masteryStatus="PRACTICING"
    )
    
    prog.attempts += 1
    prog.assessmentScore = max(prog.assessmentScore, res.score)
    
    if res.isCorrect and res.score >= 85:
        prog.currentLevel = min(100, max(prog.currentLevel, 75))
        prog.lessonsCompleted = min(prog.totalLessons, prog.lessonsCompleted + 1)
        prog.masteryStatus = "PRACTICING"
    elif not res.isCorrect:
        prog.masteryStatus = "LEARNING"
        
    db.save_skill_progress(prog)
    return res

# ==========================================================
# 6. AI Re-teaching Engine
# ==========================================================
@router.post("/reteach", response_model=ReteachContent)
def reteach_concept(payload: ReteachRequest):
    logger.info(f"[AI Mentor] /reteach for emp='{payload.employeeId}', skill='{payload.skillName}', weakConcept='{payload.weakConcept}'")
    emp = db.get_employee(payload.employeeId)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
        
    return mentor_service.generate_reteach_content(
        employee=emp,
        skill_name=payload.skillName,
        topic=payload.topic,
        weak_concept=payload.weakConcept,
        previous_mistake=payload.previousMistake
    )

# ==========================================================
# 7. AI Quiz Generation & Evaluation
# ==========================================================
@router.post("/generate-quiz", response_model=Quiz)
def generate_quiz_endpoint(payload: GenerateQuizRequest):
    logger.info(f"[AI Mentor] /generate-quiz for emp='{payload.employeeId}', skill='{payload.skillName}', topic='{payload.topic}'")
    emp = db.get_employee(payload.employeeId)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
        
    quiz = mentor_service.generate_quiz(emp, payload.skillName, payload.topic, payload.numQuestions)
    db.quizzes[f"{payload.employeeId}_{payload.skillName.lower()}"] = quiz
    return quiz

@router.post("/evaluate-quiz", response_model=QuizResult)
def evaluate_quiz_endpoint(payload: QuizSubmission):
    logger.info(f"[AI Mentor] /evaluate-quiz for emp='{payload.employeeId}', skill='{payload.skillName}', topic='{payload.topic}'")
    emp = db.get_employee(payload.employeeId)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
        
    quiz = db.quizzes.get(f"{payload.employeeId}_{payload.skillName.lower()}")
    if not quiz:
        quiz = mentor_service.generate_quiz(emp, payload.skillName, payload.topic)
        
    result = mentor_service.evaluate_quiz_submission(emp, payload, quiz)
    
    if result.passed and result.score >= 80:
        db.update_employee_skill_mastery(
            emp_id=emp.id,
            skill_name=payload.skillName,
            new_proficiency=max(85, result.score),
            is_mastered=True
        )
        
        prog = db.get_skill_progress(payload.employeeId, payload.skillName) or SkillProgressItem(
            employeeId=payload.employeeId,
            skillName=payload.skillName,
            currentLevel=85,
            targetLevel=85,
            lessonsCompleted=6,
            totalLessons=6,
            assessmentScore=result.score,
            attempts=2,
            masteryStatus="MASTERED"
        )
        prog.masteryStatus = "MASTERED"
        prog.currentLevel = max(88, result.score)
        prog.lessonsCompleted = prog.totalLessons
        prog.assessmentScore = result.score
        db.save_skill_progress(prog)
        
    return result

# ==========================================================
# 8. Evaluate Real Project Submission
# ==========================================================
@router.post("/evaluate-project", response_model=EvaluationResult)
def evaluate_project_endpoint(payload: ProjectEvaluationRequest):
    logger.info(f"[AI Mentor] /evaluate-project for emp='{payload.employeeId}', project='{payload.projectTitle}'")
    emp = db.get_employee(payload.employeeId)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
        
    res = mentor_service.evaluate_project_submission(emp, payload)
    
    if res.isCorrect and res.score >= 80:
        db.update_employee_skill_mastery(emp.id, payload.skillName, max(85, res.score), is_mastered=True)
        
    return res

# ==========================================================
# 9. Progress & Mastery Retrieval
# ==========================================================
@router.get("/progress/{employee_id}", response_model=List[SkillProgressItem])
def get_employee_progress(employee_id: str):
    logger.info(f"[AI Mentor] GET /progress/{employee_id}")
    return db.get_all_employee_progress(employee_id)

@router.get("/mastery/{employee_id}", response_model=SkillMasteryResponse)
def get_employee_mastery(employee_id: str):
    logger.info(f"[AI Mentor] GET /mastery/{employee_id}")
    emp = db.get_employee(employee_id)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
        
    mastered = [s.name for s in emp.skills if s.proficiency >= 80]
    in_progress = [{"name": s.name, "proficiency": s.proficiency} for s in emp.skills if s.proficiency < 80]
    
    badges = [
        {"title": "Docker Practitioner", "skill": "Docker", "level": "Verified Master"},
        {"title": "Data Pipeline Architect", "skill": "Python & SQL", "level": "Advanced"}
    ] if "Docker" in mastered else [
        {"title": "Data Pipeline Architect", "skill": "Python & SQL", "level": "Advanced"}
    ]
    
    return SkillMasteryResponse(
        employeeId=employee_id,
        masteredSkills=mastered,
        inProgressSkills=in_progress,
        overallReadiness=min(98, int(len(mastered) / max(1, len(emp.skills)) * 100)),
        badgesEarned=badges
    )

# ==========================================================
# 10. Role Readiness Metric
# ==========================================================
class RoleReadinessRequest(BaseModel):
    employeeId: str
    targetRoleId: Optional[str] = None

@router.post("/role-readiness", response_model=RoleReadinessResponse)
def get_role_readiness_endpoint(payload: RoleReadinessRequest):
    logger.info(f"[AI Mentor] /role-readiness for emp='{payload.employeeId}', role='{payload.targetRoleId}'")
    emp = db.get_employee(payload.employeeId)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    role = db.get_role(payload.targetRoleId)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
        
    return mentor_service.calculate_role_readiness(emp, role)

# ==========================================================
# 11. AI Mentor Conversational Chat
# ==========================================================
@router.post("/chat", response_model=MentorChatResponse)
def mentor_chat_endpoint(payload: MentorChatRequest):
    logger.info(f"[AI Mentor] /chat for emp='{payload.employeeId}', skill='{payload.skillName}', topic='{payload.topic}', msg='{payload.message[:30]}...'")
    emp = db.get_employee(payload.employeeId)
    if not emp:
        from app.models.schemas import Employee
        emp = Employee(
            id=payload.employeeId or "learner",
            name="Learner",
            email=f"{payload.employeeId or 'learner'}@talentiq.local",
            department="Engineering",
            designation="Software Engineer",
            experienceYears=2.0,
            summary="TalentIQ Learner",
            skills=[],
            hiddenSkills=[],
            certifications=[],
            projects=[],
            learningActivities=[]
        )
        
    return mentor_service.mentor_copilot_chat(
        employee=emp,
        skill_name=payload.skillName,
        message=payload.message,
        topic=payload.topic,
        conversation_history=payload.conversationHistory or []
    )

# ==========================================================
# 12. Verified Learning Resources
# ==========================================================
@router.get("/resources/{skill_name}", response_model=List[LearningResourceItem])
def get_learning_resources_endpoint(skill_name: str):
    logger.info(f"[AI Mentor] GET /resources/{skill_name}")
    return get_resources_for_skill(skill_name)

# ==========================================================
# 13. Persistent Mentor Memory
# ==========================================================
@router.get("/memory", response_model=Dict[str, Any])
def get_mentor_memory_endpoint(employee_id: str = Query(..., description="Employee UID or ID")):
    logger.info(f"[AI Mentor] GET /memory for {employee_id}")
    memories = db.get_mentor_memory(employee_id)
    return {
        "employeeId": employee_id,
        "memories": memories
    }


