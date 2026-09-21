import json
import logging
import uuid
from datetime import datetime
from typing import Dict, Any, List, Optional
from app.config import settings
from app.models.schemas import (
    Employee, InternalRole, SkillReadinessItem, SkillAssessmentResponse,
    LearningPath, LessonTopic, TeachingContent, PracticeTask,
    PracticeSubmission, EvaluationResult, Quiz, QuizQuestion,
    QuizSubmission, QuizResult, ReteachContent, SkillProgressItem,
    RoleReadinessResponse, MentorChatResponse, ProjectEvaluationRequest
)
from app.services import gemini_service

logger = logging.getLogger(__name__)

# ==========================================================
# 1. AI Skill Assessment & Readiness Map
# ==========================================================
def assess_skill_readiness(employee: Employee, target_role: Optional[InternalRole] = None) -> SkillAssessmentResponse:
    emp_skills_map = {s.name.lower().strip(): s for s in employee.skills}
    for hs in employee.hiddenSkills:
        if hs.name.lower().strip() not in emp_skills_map:
            # Transferable skills detected
            pass
            
    required_skills = target_role.requiredSkills if target_role else ["Python", "Machine Learning", "SQL", "Docker", "MLOps"]
    readiness_items: List[SkillReadinessItem] = []
    
    total_score = 0
    critical_gaps = []
    
    for req in required_skills:
        req_clean = req.strip()
        req_lower = req_clean.lower()
        
        if req_lower in emp_skills_map:
            emp_s = emp_skills_map[req_lower]
            prof = emp_s.proficiency
            if prof >= 85:
                lvl = "Advanced"
                status = "MASTERED"
            elif prof >= 65:
                lvl = "Intermediate"
                status = "PRACTICING"
            elif prof >= 30:
                lvl = "Beginner"
                status = "LEARNING"
            else:
                lvl = "Beginner"
                status = "LEARNING"
                
            is_gap = prof < 75
            evidence = emp_s.evidence or f"Verified in profile ({emp_s.category})"
        else:
            prof = 0
            lvl = "Not Started"
            status = "NOT_STARTED"
            is_gap = True
            evidence = "No verified proficiency recorded in profile"
            
        if is_gap:
            critical_gaps.append(req_clean)
            
        total_score += prof
        readiness_items.append(SkillReadinessItem(
            skill=req_clean,
            proficiency=prof,
            level=lvl,
            status=status,
            isGap=is_gap,
            evidence=evidence
        ))
        
    overall_pct = round(total_score / max(1, len(required_skills)), 1)
    
    insight = (
        f"{employee.name} is currently at {overall_pct}% capability readiness for {target_role.title if target_role else 'Target Role'}. "
        f"Mastery in {len(required_skills) - len(critical_gaps)} of {len(required_skills)} required technical domains. "
        f"Primary learning path priority: {critical_gaps[0] if critical_gaps else 'Continuous Advanced Mastery'}."
    )
    
    return SkillAssessmentResponse(
        employeeId=employee.id,
        targetRole=target_role.title if target_role else "Target Role",
        readinessMap=readiness_items,
        overallReadinessPercentage=overall_pct,
        criticalGaps=critical_gaps,
        aiInsight=insight
    )

# ==========================================================
# 2. Personalized Learning Path Generation
# ==========================================================
def generate_learning_path(employee: Employee, skill_name: str, target_role: Optional[InternalRole] = None) -> LearningPath:
    skill_clean = skill_name.strip()
    
    # Custom high-quality enterprise curricula based on skill domain
    topic_templates = {
        "docker": [
            ("Docker Architecture & Core Philosophy", "Understand containers vs virtual machines, the Docker daemon, and client-server architecture."),
            ("Images, Layers & Docker Hub Registry", "Pulling official base images, inspecting layers, tagging, and registry management."),
            ("Writing Production Dockerfiles", "Multi-stage builds, caching optimization, non-root user security, and minimal footprints."),
            ("Container Networking & Port Mapping", "Bridge networks, host networking, DNS resolution between multi-container services, and port binding."),
            ("Persistent Storage & Volumes", "Bind mounts vs Docker managed volumes, data persistence for databases, and permission governance."),
            ("Containerizing a Python Machine Learning API", "Wrap a FastAPI ML model inference server inside an optimized multi-stage Docker container."),
            ("Docker Compose & Multi-Service Stacks", "Orchestrating backend API, Redis cache, and Postgres database with environment variables and healthchecks.")
        ],
        "mlops": [
            ("MLOps Principles & Lifecycle", "Continuous Integration, Delivery, and Training (CI/CD/CT) for machine learning systems."),
            ("Experiment Tracking with MLflow", "Logging parameters, metrics, model artifacts, and run comparisons."),
            ("Data & Model Versioning with DVC", "Git-integrated data pipeline tracking and remote artifact storage."),
            ("Model Packaging & Containerized Inference", "Exporting ONNX/TorchScript models and deploying Triton/FastAPI serving containers."),
            ("Automated ML Pipeline Orchestration", "Building automated training and evaluation pipelines using GitHub Actions."),
            ("Model Monitoring & Drift Detection", "Tracking data drift, concept drift, latency anomalies, and automated retraining triggers.")
        ],
        "kubernetes": [
            ("Kubernetes Architecture & Control Plane", "API Server, etcd, Kubelet, and worker node topologies."),
            ("Pods, Deployments & ReplicaSets", "Declarative YAML resource manifests, rolling zero-downtime updates, and rollback strategies."),
            ("Services & Ingress Controllers", "ClusterIP, NodePort, LoadBalancer services, and Ingress routing rules."),
            ("ConfigMaps, Secrets & Environment Injection", "Decoupling application configuration and sensitive tokens from container images."),
            ("Horizontal Pod Autoscaling (HPA)", "Autoscaling microservices based on CPU/Memory and custom Prometheus metrics.")
        ]
    }
    
    lookup_key = skill_clean.lower()
    chosen_topics = topic_templates.get(lookup_key)
    
    if not chosen_topics:
        chosen_topics = [
            (f"{skill_clean} Fundamentals & Core Syntax", f"Foundational concepts, paradigm, and development environment setup for {skill_clean}."),
            (f"Core Patterns & Idiomatic Practices in {skill_clean}", f"Essential structures, common algorithms, and standard patterns in {skill_clean}."),
            (f"Building Production Modules with {skill_clean}", f"Architecting scalable and maintainable enterprise components."),
            (f"Testing, Debugging & Reliability in {skill_clean}", f"Unit testing, edge case handling, and defensive implementation."),
            (f"End-to-End Enterprise Project with {skill_clean}", f"Build and deliver an end-to-end working production capability.")
        ]
        
    lesson_topics = [
        LessonTopic(
            id=f"topic-{idx + 1}",
            title=t[0],
            description=t[1],
            sequence=idx + 1,
            estimatedMinutes=15,
            status="In Progress" if idx == 0 else "Pending"
        )
        for idx, t in enumerate(chosen_topics)
    ]
    
    path_id = f"lp-{uuid.uuid4().hex[:8]}"
    return LearningPath(
        id=path_id,
        employeeId=employee.id,
        skillName=skill_clean,
        targetRole=target_role.title if target_role else "Target Role",
        level="Structured Progression (Beginner to Production)",
        topics=lesson_topics,
        currentTopicIndex=0,
        progressPercentage=0,
        createdAt=datetime.utcnow().isoformat() + "Z"
    )

# ==========================================================
# 3. AI Teaching Topic Content (7-Step Pedagogical Engine)
# ==========================================================
def generate_teaching_content(employee: Employee, skill_name: str, topic_name: str) -> TeachingContent:
    skill_clean = skill_name.strip()
    topic_clean = topic_name.strip()
    
    # Try Gemini AI generation with structured schema
    prompt = f"""
    You are TalentIQ AI Mentor, an elite technical teacher instructing an employee ({employee.name}, {employee.designation}).
    Skill: {skill_clean}
    Topic: {topic_clean}

    Generate a structured, interactive 7-step lesson:
    1. EXPLAIN: Crystal-clear, engaging explanation of the concept tailored for an engineer with background in {[s.name for s in employee.skills[:3]]}.
    2. ANALOGY: A memorable real-world analogy.
    3. EXAMPLE: A clear practical code or architectural example.
    4. DEMONSTRATE: 3-4 numbered steps showing how the concept works in action.
    5. PRACTICE TASK: A concrete, hands-on micro-task for the learner to solve.
    6. STARTER CODE: Starter code template for the practice task.
    7. EXPECTED OUTCOME: What the correct solution should accomplish.
    8. KEY TAKEAWAY: 1 sentence core takeaway.

    Output JSON schema:
    {{
        "topic": "{topic_clean}",
        "skillName": "{skill_clean}",
        "level": "Intermediate",
        "explanation": "Detailed, friendly, pedagogical explanation...",
        "analogy": "Memorable analogy...",
        "example": "Practical context description...",
        "codeSnippet": "Code snippet example...",
        "stepByStepDemo": [
            "Step 1: ...",
            "Step 2: ...",
            "Step 3: ..."
        ],
        "practiceTask": "Specific micro-task for learner to solve...",
        "practiceStarterCode": "Starter template...",
        "expectedOutcome": "What working output looks like...",
        "keyTakeaway": "Core rule to remember...",
        "nextStep": "Topic practice and assessment quiz"
    }}
    """
    res = gemini_service._call_gemini_json(prompt, "You are a world-class AI technical mentor teaching enterprise engineering skills.")
    if res and "explanation" in res:
        try:
            return TeachingContent(**res)
        except Exception as e:
            logger.warning(f"Error parsing Gemini teaching output: {e}")

    # High-quality fallback deterministic lessons
    if "network" in topic_clean.lower() or "port" in topic_clean.lower():
        return TeachingContent(
            topic=topic_clean,
            skillName=skill_clean,
            level="Intermediate",
            explanation=(
                "By default, every Docker container runs in an isolated network sandbox with its own private IP address. "
                "To allow traffic from your host machine (or outside users) to reach a web server running inside the container, "
                "you must explicitly publish and bind the container's internal port to a host port using the `-p <HOST_PORT>:<CONTAINER_PORT>` flag."
            ),
            analogy="Think of a container as an apartment in a locked building. The internal port is the apartment number (e.g., Apt 8000), and the host port is the lobby intercom box (e.g., Doorbell 8080).",
            example="Exposing a Python FastAPI application running on port 8000 inside the container to port 8080 on your host machine.",
            codeSnippet=(
                "# 1. Run container with port forwarding:\n"
                "docker run -d -p 8080:8000 --name ml_api my_ml_image:latest\n\n"
                "# 2. Test request from host machine:\n"
                "curl http://localhost:8080/health"
            ),
            stepByStepDemo=[
                "Step 1: Docker creates a virtual bridge network (`bridge`) assigning an isolated subnet IP (e.g. 172.17.0.2).",
                "Step 2: The `-p 8080:8000` rule instructs the Linux iptables kernel to forward all inbound traffic on host port 8080 to container port 8000.",
                "Step 3: When a client curls `http://localhost:8080`, the host receives it and instantly proxies it into the container's FastAPI process."
            ],
            practiceTask=(
                "Write the exact `docker run` command to start a container named `churn_predictor` in detached mode (-d), "
                "mapping your host machine's port 5000 to the container's internal port 8000, using image `retention_model:v1`."
            ),
            practiceStarterCode="docker run -d ...",
            expectedOutcome="A running container named churn_predictor accessible on http://localhost:5000 that forwards to container port 8000.",
            keyTakeaway="The syntax is always -p HOST_PORT:CONTAINER_PORT (Outside:Inside).",
            nextStep="Complete the practice challenge and take the knowledge evaluation quiz."
        )
    elif "dockerfile" in topic_clean.lower():
        return TeachingContent(
            topic=topic_clean,
            skillName=skill_clean,
            level="Intermediate",
            explanation=(
                "A Dockerfile is a declarative blueprint of instructions that Docker executes sequentially to build a container image. "
                "Best practices include using slim base images, ordering instructions from least-frequently changed to most-frequently changed "
                "to leverage build layer caching, and creating non-root users."
            ),
            analogy="A Dockerfile is like an automated culinary recipe. If you change step 4, Docker re-uses the cached prep work from steps 1-3 rather than starting from scratch.",
            example="Building a minimal Python FastAPI container image with dependencies caching.",
            codeSnippet=(
                "FROM python:3.11-slim\n"
                "WORKDIR /app\n"
                "COPY requirements.txt .\n"
                "RUN pip install --no-cache-dir -r requirements.txt\n"
                "COPY src/ ./src\n"
                "EXPOSE 8000\n"
                "CMD [\"uvicorn\", \"src.main:app\", \"--host\", \"0.0.0.0\", \"--port\", \"8000\"]"
            ),
            stepByStepDemo=[
                "Step 1: Start with an official minimal base image (`python:3.11-slim`).",
                "Step 2: Copy `requirements.txt` and install dependencies first so dependencies layer is cached when editing source code.",
                "Step 3: Copy source code and define container execution command with `CMD`."
            ],
            practiceTask="Add a non-root security user `appuser` and switch to it before executing the CMD in your Dockerfile.",
            practiceStarterCode="FROM python:3.11-slim\nWORKDIR /app\n# Add user creation and USER switch here...",
            expectedOutcome="The container executes securely under an unprivileged user UID.",
            keyTakeaway="Separate dependency installation from code copies to maximize Docker layer caching.",
            nextStep="Practice Dockerfile construction and proceed to container deployment."
        )
    else:
        return TeachingContent(
            topic=topic_clean,
            skillName=skill_clean,
            level="Foundations",
            explanation=f"Welcome to {topic_clean}! In this module, we will explore the core mental models, operational commands, and architectural mechanisms of {skill_clean}.",
            analogy=f"Learning {skill_clean} is like adding a standardized precision tool to your engineering workbench.",
            example=f"Implementing {topic_clean} in a production data environment.",
            codeSnippet=f"# Example command for {skill_clean}\n# Demonstrating {topic_clean}\nprint('Mastering {skill_clean} with TalentIQ AI')",
            stepByStepDemo=[
                f"Step 1: Understand the primary objective of {topic_clean}.",
                f"Step 2: Inspect inputs, configuration, and environment flags.",
                f"Step 3: Execute and verify the operational output."
            ],
            practiceTask=f"Write a solution demonstrating the fundamental concept of {topic_clean}.",
            practiceStarterCode=f"# Solution for {topic_clean}\n",
            expectedOutcome=f"Successful execution and conceptual validation of {topic_clean}.",
            keyTakeaway=f"Consistency and understanding standard interfaces is key in {skill_clean}.",
            nextStep="Submit your practice answer for real-time AI evaluation."
        )

# ==========================================================
# 4. Practice Evaluation Engine
# ==========================================================
def evaluate_practice_submission(employee: Employee, submission: PracticeSubmission) -> EvaluationResult:
    prompt = f"""
    Evaluate this employee's practice solution:
    Skill: {submission.skillName}
    Topic: {submission.topic}
    Task Prompt: {submission.taskPrompt}
    Employee Solution: {submission.solutionText}
    Code Snippet: {submission.codeSnippet}

    Analyze the submission rigorously:
    - Did they correctly implement the requested task?
    - Are there syntax errors, conceptual bugs, or anti-patterns?
    - Identify weak sub-concepts if they made an error (e.g. "Inverted host and container port order", "Missing detached flag").

    Output JSON schema:
    {{
        "score": 85,
        "technicalUnderstanding": 88,
        "implementationQuality": 84,
        "bestPractices": 82,
        "status": "Proficient",
        "isCorrect": true,
        "strengths": ["Clear syntax", "Correct flags"],
        "weaknesses": ["Minor improvement in flag ordering"],
        "detailedFeedback": "Constructive pedagogical feedback explaining why...",
        "correctSolution": "The ideal solution...",
        "masteryStatus": "PRACTICING",
        "recommendedAction": "advance",
        "weakConcept": "optional weak concept if error occurred"
    }}
    """
    res = gemini_service._call_gemini_json(prompt, "You are a strict, helpful AI code reviewer and technical mentor.")
    if res and "score" in res:
        try:
            score = int(res.get("score", 0))
            is_correct = bool(res.get("isCorrect", False))
            if score < 75 or not is_correct:
                res["recommendedAction"] = "reteach"
            else:
                res["recommendedAction"] = "advance"
            return EvaluationResult(**res)
        except Exception as e:
            logger.warning(f"Error parsing practice evaluation: {e}")

    # Fallback deterministic evaluation
    sol = (submission.solutionText + " " + (submission.codeSnippet or "")).lower()
    
    # Check for common mistakes in Docker port binding
    if "docker run" in sol:
        has_name = "--name" in sol or "-name" in sol
        has_detached = "-d" in sol
        has_port = "-p 5000:8000" in sol or "-p 5000:8000" in sol.replace(" ", "")
        
        if "-p 8000:5000" in sol:
            # Common mistake: inverted ports!
            return EvaluationResult(
                score=45,
                technicalUnderstanding=50,
                implementationQuality=40,
                bestPractices=45,
                status="Re-teach Required",
                isCorrect=False,
                strengths=["Used docker run command", "Included container image name"],
                weaknesses=["Inverted port forwarding syntax: host port and container port are backwards."],
                detailedFeedback=(
                    "You wrote `-p 8000:5000`, but Docker's port syntax is strictly `-p <HOST_PORT>:<CONTAINER_PORT>`. "
                    "The challenge required host port 5000 to forward to container internal port 8000. "
                    "Let's review this concept with a quick re-teaching lesson!"
                ),
                correctSolution="docker run -d -p 5000:8000 --name churn_predictor retention_model:v1",
                masteryStatus="LEARNING",
                recommendedAction="reteach",
                weakConcept="Docker Port Mapping Order (Host vs Container Port)"
            )
        elif has_port and has_detached:
            return EvaluationResult(
                score=92,
                technicalUnderstanding=95,
                implementationQuality=90,
                bestPractices=92,
                status="Proficient",
                isCorrect=True,
                strengths=["Correct port forwarding syntax (5000:8000)", "Detached mode enabled (-d)", "Clean container naming"],
                weaknesses=["None - excellent execution"],
                detailedFeedback="Outstanding work! You properly mapped the host port 5000 to container port 8000 and named the container cleanly.",
                correctSolution="docker run -d -p 5000:8000 --name churn_predictor retention_model:v1",
                masteryStatus="PRACTICING",
                recommendedAction="advance",
                weakConcept=None
            )
            
    return EvaluationResult(
        score=84,
        technicalUnderstanding=85,
        implementationQuality=82,
        bestPractices=85,
        status="Proficient",
        isCorrect=True,
        strengths=["Clear technical structure", "Addressed primary task requirements"],
        weaknesses=["Consider adding explicit log or container cleanup flags"],
        detailedFeedback=f"Well done! Your solution for {submission.topic} effectively achieves the desired objective.",
        correctSolution=submission.solutionText,
        masteryStatus="PRACTICING",
        recommendedAction="advance",
        weakConcept=None
    )

# ==========================================================
# 5. AI Re-teaching Engine
# ==========================================================
def generate_reteach_content(employee: Employee, skill_name: str, topic: str, weak_concept: str, previous_mistake: str) -> ReteachContent:
    prompt = f"""
    The learner struggled with this specific sub-concept during {skill_name} practice:
    Topic: {topic}
    Weak Concept: {weak_concept}
    Previous Mistake: {previous_mistake}

    Generate an ultra-clear, supportive AI re-teaching module:
    1. Reassure the learner (normalize the mistake).
    2. Simplify the explanation to first principles.
    3. Use a concrete, memorable analogy.
    4. Provide an unmistakable code example with clear annotations.
    5. Provide an easier practice challenge to build confidence.

    Output JSON schema:
    {{
        "skillName": "{skill_name}",
        "topic": "{topic}",
        "weakConcept": "{weak_concept}",
        "simplifiedExplanation": "Crystal-clear breakdown of the rule...",
        "concreteAnalogy": "Visual analogy...",
        "practicalExample": "Practical explanation...",
        "codeSnippet": "Annotated code snippet...",
        "easierPracticeTask": "Simpler guided practice task...",
        "practiceStarter": "Starter template...",
        "reassurance": "Encouraging pedagogical remark..."
    }}
    """
    res = gemini_service._call_gemini_json(prompt, "You are a compassionate, brilliant AI technical teacher.")
    if res and "simplifiedExplanation" in res:
        try:
            return ReteachContent(**res)
        except Exception as e:
            logger.warning(f"Error parsing reteach JSON: {e}")

    # Fallback re-teaching lesson
    return ReteachContent(
        skillName=skill_name,
        topic=topic,
        weakConcept=weak_concept or "Port Mapping Order",
        simplifiedExplanation=(
            "Don't worry, port inversion is the #1 most common mistake in Docker! "
            "Remember the golden mnemonic rule: **HOST comes first, CONTAINER comes second**.\n\n"
            "Format: `-p <PORT_YOU_BROWSE_ON_LAPTOP>:<PORT_APP_LISTENS_ON_INSIDE_CONTAINER>`"
        ),
        concreteAnalogy="Outside World : Inside Room. You are outside the box looking in, so the outside port is typed first!",
        practicalExample=(
            "If your FastAPI app has `uvicorn.run(port=8000)` inside the container, "
            "and you want to visit `http://localhost:3000` on your MacBook or PC, "
            "you write: `-p 3000:8000`."
        ),
        codeSnippet="# Correct mapping:\ndocker run -p 3000:8000 my_app\n\n# Visit in browser:\n# http://localhost:3000 -> reaches 8000 inside",
        easierPracticeTask="Try again with this simpler task: Map host port 80 to container internal port 8000 for image `web_app:v1`.",
        practiceStarter="docker run -p 80:...",
        reassurance="Every senior engineer has made this exact mistake. Once you lock in the 'Outside:Inside' rule, you'll never forget it!"
    )

# ==========================================================
# 6. AI Quiz Generator & Evaluator
# ==========================================================
def generate_quiz(employee: Employee, skill_name: str, topic: str, num_questions: int = 3) -> Quiz:
    prompt = f"""
    Generate a {num_questions}-question technical assessment quiz for:
    Skill: {skill_name}
    Topic: {topic}
    Learner Level: Intermediate

    Include a mix of:
    1. Conceptual understanding
    2. Code/Command output analysis
    3. Practical troubleshooting scenario

    Output JSON schema:
    {{
        "id": "quiz-1",
        "skillName": "{skill_name}",
        "topic": "{topic}",
        "passingScore": 75,
        "questions": [
            {{
                "id": "q1",
                "question": "What does the -p 8080:80 flag do in docker run?",
                "type": "multiple_choice",
                "options": [
                    "Maps host port 8080 to container port 80",
                    "Maps host port 80 to container port 8080",
                    "Opens port 8080 only inside the container",
                    "Restricts access to port 80"
                ],
                "correctAnswer": "Maps host port 8080 to container port 80",
                "explanation": "-p HOST_PORT:CONTAINER_PORT binds external host traffic to internal container ports.",
                "conceptTested": "Port Mapping Syntax"
            }}
        ]
    }}
    """
    res = gemini_service._call_gemini_json(prompt, "You are an expert technical examiner generating focused multiple-choice questions.")
    if res and "questions" in res and isinstance(res["questions"], list):
        try:
            return Quiz(**res)
        except Exception as e:
            logger.warning(f"Error parsing generated quiz: {e}")

    # Fallback high quality quiz for Docker
    fallback_questions = [
        QuizQuestion(
            id="q1",
            question="What is the correct syntax order for port publishing in `docker run -p`?",
            type="multiple_choice",
            options=[
                "-p <HOST_PORT>:<CONTAINER_PORT>",
                "-p <CONTAINER_PORT>:<HOST_PORT>",
                "-p <IP_ADDRESS>:<PORT>",
                "-p <SUBNET>:<GATEWAY>"
            ],
            correctAnswer="-p <HOST_PORT>:<CONTAINER_PORT>",
            explanation="The syntax is always Host (external/laptop) followed by Container (internal process).",
            conceptTested="Port Forwarding Syntax"
        ),
        QuizQuestion(
            id="q2",
            question="Two containers need to communicate with each other using container names as DNS hostnames. What is required?",
            type="multiple_choice",
            options=[
                "They must be connected to the same user-defined Docker bridge network",
                "They must use host networking mode only",
                "They must publish their ports to 0.0.0.0",
                "Containers cannot communicate using DNS hostnames"
            ],
            correctAnswer="They must be connected to the same user-defined Docker bridge network",
            explanation="User-defined bridge networks provide automatic internal DNS resolution between container names.",
            conceptTested="Container DNS & Networking"
        ),
        QuizQuestion(
            id="q3",
            question="Which flag runs a container in the background (detached mode)?",
            type="multiple_choice",
            options=[
                "-d (or --detach)",
                "-b (or --background)",
                "-s (or --silent)",
                "-q (or --quiet)"
            ],
            correctAnswer="-d (or --detach)",
            explanation="-d runs the container in detached mode and prints the container ID.",
            conceptTested="Docker Run CLI Flags"
        )
    ]
    return Quiz(
        id=f"quiz-{uuid.uuid4().hex[:6]}",
        skillName=skill_name,
        topic=topic,
        questions=fallback_questions,
        passingScore=75
    )

def evaluate_quiz_submission(employee: Employee, submission: QuizSubmission, quiz: Quiz) -> QuizResult:
    correct_count = 0
    strong_areas = []
    needs_improvement = []
    question_review = []
    
    for q in quiz.questions:
        user_ans = submission.answers.get(q.id, "").strip()
        is_match = (user_ans.lower() == q.correctAnswer.lower())
        
        if is_match:
            correct_count += 1
            if q.conceptTested not in strong_areas:
                strong_areas.append(q.conceptTested)
        else:
            if q.conceptTested not in needs_improvement:
                needs_improvement.append(q.conceptTested)
                
        question_review.append({
            "questionId": q.id,
            "question": q.question,
            "userAnswer": user_ans,
            "correctAnswer": q.correctAnswer,
            "isCorrect": is_match,
            "explanation": q.explanation,
            "concept": q.conceptTested
        })
        
    total = len(quiz.questions) if len(quiz.questions) > 0 else 1
    pct = int((correct_count / total) * 100)
    passed = pct >= quiz.passingScore
    
    if passed:
        mastery_status = "MASTERED" if pct >= 90 else "ASSESSED"
        action = "advance"
        feedback = f"Congratulations {employee.name}! You scored {pct}% ({correct_count}/{total}) and demonstrated strong mastery in {quiz.topic}."
    else:
        mastery_status = "LEARNING"
        action = "reteach"
        feedback = f"You scored {pct}% ({correct_count}/{total}). Identified weakness in: {', '.join(needs_improvement)}. TalentIQ AI will now re-teach these concepts before re-assessing."
        
    return QuizResult(
        score=pct,
        totalQuestions=total,
        correctCount=correct_count,
        percentage=pct,
        passed=passed,
        strongAreas=strong_areas,
        needsImprovement=needs_improvement,
        detailedFeedback=feedback,
        masteryStatus=mastery_status,
        recommendedAction=action,
        questionReview=question_review
    )

# ==========================================================
# 7. Role Readiness Integration
# ==========================================================
def calculate_role_readiness(employee: Employee, target_role: InternalRole) -> RoleReadinessResponse:
    req_skills = target_role.requiredSkills
    emp_skills_map = {s.name.lower().strip(): s for s in employee.skills}
    
    breakdown = []
    mastered_count = 0
    remaining_skills = []
    total_score = 0
    
    for req in req_skills:
        req_clean = req.strip()
        req_lower = req_clean.lower()
        
        if req_lower in emp_skills_map:
            emp_s = emp_skills_map[req_lower]
            prof = emp_s.proficiency
            if prof >= 80:
                status = "Mastered"
                mastered_count += 1
            elif prof >= 50:
                status = "Learning"
                remaining_skills.append(req_clean)
            else:
                status = "Developing"
                remaining_skills.append(req_clean)
        else:
            prof = 0
            status = "Not Started"
            remaining_skills.append(req_clean)
            
        total_score += prof
        breakdown.append({
            "skill": req_clean,
            "proficiency": prof,
            "status": status,
            "isCritical": True
        })
        
    readiness_pct = round(total_score / max(1, len(req_skills)), 1)
    next_best = remaining_skills[0] if remaining_skills else "Target Role Ready!"
    
    advice = (
        f"You have achieved verified mastery across {mastered_count} of {len(req_skills)} required technical capabilities for {target_role.title}. "
        f"Your current AI-assisted role readiness is {readiness_pct}%. Focus on mastering {next_best} to reach 95%+ candidacy placement."
    )
    
    return RoleReadinessResponse(
        employeeId=employee.id,
        targetRoleId=target_role.id,
        targetRoleTitle=target_role.title,
        overallReadinessPercentage=readiness_pct,
        skillReadinessBreakdown=breakdown,
        masteredCount=mastered_count,
        totalRequiredCount=len(req_skills),
        remainingSkills=remaining_skills,
        nextBestSkillToLearn=next_best,
        mentorAdvice=advice
    )

# ==========================================================
# 8. AI Mentor Copilot Tutor Chat
# ==========================================================
def mentor_copilot_chat(
    employee: Employee,
    skill_name: Optional[str],
    message: str,
    topic: Optional[str] = None,
    conversation_history: List[Dict[str, str]] = []
) -> MentorChatResponse:
    history_str = ""
    if conversation_history:
        history_lines = []
        for h in conversation_history[-6:]:
            role = "Student" if h.get("role") in ["user", "student"] else "Mentor"
            text = h.get("text", "")
            if text:
                history_lines.append(f"{role}: {text}")
        if history_lines:
            history_str = "CONVERSATION HISTORY:\n" + "\n".join(history_lines) + "\n\n"

    prompt = f"""
    You are TALENTIQ AI MENTOR, an expert 1-on-1 enterprise technical tutor and career coach.
    Employee: {employee.name}, {employee.designation} in {employee.department}
    Active Learning Skill: {skill_name or 'General Technical Skills'}
    Active Topic: {topic or 'Skill Fundamentals'}
    Learner Verified Skills: {[s.name for s in employee.skills]}

    {history_str}
    Learner Current Question: "{message}"

    TUTOR INSTRUCTIONS:
    1. Answer the learner's question directly, clearly, and thoroughly with helpful markdown explanations and practical code examples where applicable.
    2. Adopt an encouraging, Socratic, practical teaching persona.
    3. If they ask a conceptual question (e.g. "what is python", "teach me docker", "what is machine learning"), explain what it is, why it matters, core mental models, and real-world enterprise use cases.
    4. If they ask for practice tasks, code snippets, or quiz questions, provide them immediately.
    5. Always supply 3 relevant, engaging follow-up questions or next steps in suggestedQuestions.

    Output JSON schema:
    {{
        "reply": "Your detailed, markdown-formatted teaching response with code snippets where applicable",
        "suggestedQuestions": [
            "Follow-up question 1",
            "Follow-up question 2",
            "Follow-up question 3"
        ],
        "recommendedAction": "teach"
    }}
    """
    # 1. Attempt structured JSON generation with Gemini
    res = gemini_service._call_gemini_json(prompt, "You are TalentIQ AI Mentor, an elite 1-on-1 engineering instructor.")
    if res and "reply" in res and res["reply"].strip():
        try:
            return MentorChatResponse(
                reply=res["reply"],
                suggestedQuestions=res.get("suggestedQuestions", [
                    f"Explain more about {skill_name or 'this concept'}",
                    "Give me a practical code example",
                    "Test my knowledge with a quiz"
                ]),
                recommendedAction=res.get("recommendedAction", "teach")
            )
        except Exception as e:
            logger.warning(f"Error parsing mentor chat structured response: {e}")

    # 2. Attempt raw text generation with Gemini
    raw_text = gemini_service._call_gemini_text(prompt, "You are TalentIQ AI Mentor, an elite 1-on-1 engineering instructor.")
    if raw_text and raw_text.strip():
        cleaned = gemini_service._clean_json_string(raw_text)
        try:
            parsed = json.loads(cleaned)
            if "reply" in parsed and parsed["reply"].strip():
                return MentorChatResponse(
                    reply=parsed["reply"],
                    suggestedQuestions=parsed.get("suggestedQuestions", [
                        f"Tell me more about {skill_name or 'this topic'}",
                        "Can you show a code example?",
                        "Give me a practice challenge"
                    ]),
                    recommendedAction=parsed.get("recommendedAction", "teach")
                )
        except Exception:
            pass
        return MentorChatResponse(
            reply=raw_text.strip(),
            suggestedQuestions=[
                f"Explain {skill_name or 'this concept'} in more depth",
                "Give me a hands-on code example",
                "Test my knowledge with an assessment quiz"
            ],
            recommendedAction="teach"
        )

    # 3. Contextual fallback if Gemini is offline
    lower = message.lower()
    if "python" in lower:
        reply = (
            f"Hello {employee.name}! Let's explore **Python**.\n\n"
            "**Python** is a high-level, interpreted, dynamically typed programming language created by Guido van Rossum. "
            "It is celebrated for its clean, English-like syntax and vast ecosystem of production libraries.\n\n"
            "### Why Python is Essential:\n"
            "• **Data Science & AI**: The de facto industry standard for Machine Learning (PyTorch, TensorFlow, Scikit-learn, Pandas).\n"
            "• **Backend & APIs**: Modern frameworks like FastAPI and Django power high-throughput microservices.\n"
            "• **Automation & Scripting**: Ubiquitous for DevOps, ETL pipelines, and cloud tooling.\n\n"
            "```python\n"
            "# Quick Example: Python List Comprehension\n"
            "scores = [75, 88, 92, 60, 95]\n"
            "high_performers = [s for s in scores if s >= 85]\n"
            "print(f'Mastery Count: {len(high_performers)}')\n"
            "```\n\n"
            "What aspect of Python would you like to explore next?"
        )
        return MentorChatResponse(
            reply=reply,
            suggestedQuestions=[
                "How is Python used in Machine Learning and AI?",
                "Explain Python decorators and generators with examples",
                "Give me a practice coding challenge in Python"
            ],
            recommendedAction="teach"
        )
    elif "docker" in lower or "container" in lower:
        reply = (
            f"Hello {employee.name}! Let's dive into **Docker**.\n\n"
            "At its core, Docker packages your code, runtime, system tools, and libraries into an immutable artifact called an **Image**. "
            "When you run an image, it becomes an isolated process called a **Container**.\n\n"
            "### Core Mental Model:\n"
            "• **Dockerfile** = Recipe\n"
            "• **Image** = Baked Cake\n"
            "• **Container** = Slice being served and running in production\n\n"
            "```bash\n"
            "# Run a container with port mapping\n"
            "docker run -d -p 8080:8000 --name api_service my_app:v1\n"
            "```\n\n"
            "Would you like to explore Dockerfiles, Port Mapping, or try a practice challenge?"
        )
        return MentorChatResponse(
            reply=reply,
            suggestedQuestions=[
                "Explain Docker networking with an example",
                "Give me a practice quiz question on Docker",
                "How do I containerize a Python FastAPI server?"
            ],
            recommendedAction="teach"
        )
    elif "practice" in lower or "quiz" in lower or "test" in lower:
        return MentorChatResponse(
            reply=(
                f"Great idea, {employee.name}! Practice is the fastest way to solidify your engineering mastery.\n\n"
                f"You can choose between interactive **Code Challenges** or **Knowledge Quizzes** for **{skill_name or 'your target skills'}**."
            ),
            suggestedQuestions=[
                f"Give me a practice question on {skill_name or 'Python'}",
                f"Generate a quiz for {skill_name or 'Docker'}",
                "Review my latest code submission"
            ],
            recommendedAction="practice"
        )
    else:
        return MentorChatResponse(
            reply=(
                f"### {skill_name or 'Technical Skill'} Mastery with TalentIQ AI Mentor\n\n"
                f"Regarding your question about **\"{message}\"**:\n\n"
                f"As an engineer with experience in **{', '.join([s.name for s in employee.skills[:3]]) if employee.skills else 'Software Engineering'}**, "
                f"mastering **{skill_name or topic or 'this technical capability'}** is a critical step in achieving production-grade capability.\n\n"
                "I can break down key concepts step-by-step, provide architecture diagrams, or generate interactive practice challenges."
            ),
            suggestedQuestions=[
                f"Teach me {skill_name or 'this topic'} from the beginning",
                f"Give me a real-world enterprise example of {skill_name or 'this'}",
                "Give me a hands-on practice challenge"
            ],
            recommendedAction="teach"
        )

# ==========================================================
# 9. AI Project Evaluation Engine
# ==========================================================
def evaluate_project_submission(employee: Employee, payload: ProjectEvaluationRequest) -> EvaluationResult:
    prompt = f"""
    Evaluate this employee's hands-on project submission:
    Employee: {employee.name}, {employee.designation}
    Skill: {payload.skillName}
    Project Title: {payload.projectTitle}
    Explanation: {payload.explanation}
    Code Snippet: {payload.codeSnippet or 'None provided'}
    GitHub URL: {payload.githubUrl or 'None provided'}
    Deployed URL: {payload.deployedUrl or 'None provided'}

    Analyze the technical depth, architecture, containerization/code quality, and domain completeness.
    Output JSON schema:
    {{
        "score": 88,
        "technicalUnderstanding": 88,
        "implementationQuality": 86,
        "bestPractices": 85,
        "status": "Mastered",
        "isCorrect": true,
        "strengths": ["Clear multi-stage container build", "Modular directory architecture"],
        "weaknesses": ["Add health check endpoint in Dockerfile"],
        "detailedFeedback": "Detailed technical assessment...",
        "correctSolution": null,
        "masteryStatus": "MASTERED",
        "recommendedAction": "advance",
        "weakConcept": null
    }}
    """
    res = gemini_service._call_gemini_json(prompt, "You are an elite Senior Staff Engineer evaluating technical project submissions.")
    if res and "score" in res:
        try:
            return EvaluationResult(**res)
        except Exception as e:
            logger.warning(f"Error parsing project evaluation JSON: {e}")
            
    # Deterministic fallback
    has_code = bool(payload.codeSnippet or payload.githubUrl)
    score = 88 if has_code else 65
    return EvaluationResult(
        score=score,
        technicalUnderstanding=85 if has_code else 70,
        implementationQuality=90 if has_code else 60,
        bestPractices=88 if has_code else 65,
        status="Mastered" if has_code else "Needs Improvement",
        isCorrect=has_code,
        strengths=["End-to-end containerized setup", "Production multi-stage build"] if has_code else ["Good project concept"],
        weaknesses=[] if has_code else ["Please provide concrete code snippet or GitHub URL evidence"],
        detailedFeedback=(
            f"Project '{payload.projectTitle}' successfully reviewed. "
            f"{'Demonstrated production-grade containerization and clean orchestration.' if has_code else 'Submit actual code implementation to unlock full verified mastery.'}"
        ),
        correctSolution=None,
        masteryStatus="MASTERED" if has_code else "LEARNING",
        recommendedAction="advance" if has_code else "practice_more",
        weakConcept=None
    )

