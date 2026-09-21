from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class SkillItem(BaseModel):
    name: str
    category: str = "Core"  # Core, Advanced, Emerging, Transferable, Soft
    proficiency: int = 80  # 1 - 100
    verified: bool = True
    evidence: Optional[str] = None

class HiddenSkill(BaseModel):
    name: str
    detectedFrom: str
    confidence: int = 85  # 1 - 100
    category: str = "Transferable"
    explanation: str

class Certification(BaseModel):
    name: str
    issuer: str
    issueDate: Optional[str] = None
    credentialUrl: Optional[str] = None

class ProjectItem(BaseModel):
    title: str
    role: str
    description: str
    technologies: List[str] = []
    impact: Optional[str] = None

class LearningActivity(BaseModel):
    title: str
    type: str  # Course, Project, Certification, Hands-on Lab
    skillTarget: str
    status: str = "In Progress"  # In Progress, Completed, Recommended
    progress: int = 0
    estimatedHours: int = 10

class Employee(BaseModel):
    id: str
    name: str
    email: str
    department: str = "Engineering"
    designation: str = "Candidate"
    experienceYears: float = 0.0
    summary: str = ""
    location: str = "Remote"
    education: str = ""
    profilePhotoUrl: Optional[str] = None
    profilePhotoKey: Optional[str] = None
    resumeUrl: Optional[str] = None
    profileStatus: str = "INCOMPLETE"  # INCOMPLETE, EXTRACTED, VERIFIED
    skills: List[SkillItem] = []
    hiddenSkills: List[HiddenSkill] = []
    certifications: List[Certification] = []
    projects: List[ProjectItem] = []
    learningActivities: List[LearningActivity] = []
    targetRoleId: Optional[str] = None
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None

class EmployeeCreate(BaseModel):
    name: str
    email: str
    department: str
    designation: str
    experienceYears: float
    summary: str
    location: Optional[str] = "Remote"
    education: Optional[str] = "Degree"
    skills: List[SkillItem] = []

class InternalRole(BaseModel):
    id: str
    title: str
    department: str
    description: str
    requiredSkills: List[str] = []
    preferredSkills: List[str] = []
    experienceRequired: float
    openPositions: int = 1
    urgency: str = "Medium"  # High, Medium, Low
    location: str = "Hybrid / HQ"
    postedAt: Optional[str] = None
    updatedAt: Optional[str] = None

class InternalRoleCreate(BaseModel):
    title: str
    department: str
    description: str
    requiredSkills: List[str] = []
    preferredSkills: List[str] = []
    experienceRequired: float
    openPositions: int = 1
    urgency: str = "Medium"
    location: str = "Hybrid / HQ"

class RoleMatchScore(BaseModel):
    roleId: str
    roleTitle: str
    department: str
    experienceRequired: float
    finalMatch: float  # 0 to 100 percentage
    skillMatch: float
    experienceMatch: float
    projectMatch: float
    certificationMatch: float
    matchingSkills: List[str] = []
    missingSkills: List[str] = []
    label: str = "AI-assisted profile alignment"
    aiExplanation: Optional[str] = None

class SkillGapItem(BaseModel):
    skillName: str
    isCritical: bool = True
    currentLevel: int = 0
    requiredLevel: int = 80
    recommendations: List[Dict[str, str]] = []

class SkillGapAnalysis(BaseModel):
    employeeId: str
    targetRoleId: str
    targetRoleTitle: str
    matchScore: float
    matchingSkills: List[str] = []
    missingSkills: List[str] = []
    detailedGaps: List[SkillGapItem] = []
    summary: str

class RoadmapMilestone(BaseModel):
    phase: int
    title: str
    timeline: str
    description: str
    targetSkills: List[str] = []
    actionItems: List[str] = []
    deliverable: str
    status: str = "Pending"  # Completed, Current, Pending

class CareerRoadmap(BaseModel):
    employeeId: str
    targetRoleId: str
    targetRoleTitle: str
    currentRole: str
    readinessScore: int
    milestones: List[RoadmapMilestone] = []
    aiAdvice: str

class AIChatRequest(BaseModel):
    employeeId: str
    message: str
    conversationHistory: Optional[List[Dict[str, str]]] = []

class AIChatResponse(BaseModel):
    reply: str
    suggestedQuestions: List[str] = []
    relatedRoleId: Optional[str] = None

class PresignedUrlRequest(BaseModel):
    fileName: str
    fileType: str
    category: str = "certificate"  # certificate, resume, project_doc, photo
    employeeId: Optional[str] = None
    documentId: Optional[str] = None

class PresignedUrlResponse(BaseModel):
    uploadUrl: str
    fileUrl: str
    s3Key: str
    documentId: Optional[str] = None

# ==========================================================
# DOCUMENT EXTRACTION & VERIFICATION SCHEMAS
# ==========================================================

class ExtractedProfileData(BaseModel):
    name: Optional[str] = None
    institution: Optional[str] = None
    qualification: Optional[str] = None
    course: Optional[str] = None
    certificate_name: Optional[str] = None
    certificate_issuer: Optional[str] = None
    issue_date: Optional[str] = None
    designation: Optional[str] = None
    department: Optional[str] = None
    experienceYears: Optional[float] = None
    summary: Optional[str] = None
    education: Optional[str] = None
    skills: List[SkillItem] = []
    technologies: List[str] = []
    certifications: List[Certification] = []
    projects: List[ProjectItem] = []
    achievements: List[str] = []

class DocumentItem(BaseModel):
    documentId: str
    ownerUid: str
    s3Key: str
    fileName: str
    fileUrl: Optional[str] = None
    documentType: str = "certificate"  # certificate, resume, project_doc, course_certificate
    extractedText: Optional[str] = None
    extractedData: Optional[ExtractedProfileData] = None
    verificationStatus: str = "EXTRACTED"  # EXTRACTED, VERIFIED
    uploadedAt: Optional[str] = None

class DocumentExtractRequest(BaseModel):
    employeeId: str
    documentType: str = "certificate"
    s3Key: Optional[str] = None
    fileUrl: Optional[str] = None
    fileName: Optional[str] = None
    rawText: Optional[str] = None

class DocumentExtractionResponse(BaseModel):
    documentId: str
    ownerUid: str
    fileName: str
    s3Key: str
    fileUrl: Optional[str] = None
    documentType: str = "certificate"
    verificationStatus: str = "EXTRACTED"
    extractedData: ExtractedProfileData

class VerifyProfileRequest(BaseModel):
    employeeId: str
    documentId: Optional[str] = None
    verifiedData: ExtractedProfileData

# ==========================================================
# AI SKILL MENTOR SCHEMAS
# ==========================================================

class SkillReadinessItem(BaseModel):
    skill: str
    proficiency: int
    level: str  # Beginner, Intermediate, Advanced, Mastered, Not Started
    status: str  # NOT_STARTED, LEARNING, PRACTICING, ASSESSED, MASTERED
    isGap: bool
    evidence: Optional[str] = None

class SkillAssessmentRequest(BaseModel):
    employeeId: str
    targetRoleId: Optional[str] = None

class SkillAssessmentResponse(BaseModel):
    employeeId: str
    targetRole: Optional[str] = None
    readinessMap: List[SkillReadinessItem] = []
    overallReadinessPercentage: float
    criticalGaps: List[str] = []
    aiInsight: str

class LessonTopic(BaseModel):
    id: str
    title: str
    description: str
    sequence: int
    estimatedMinutes: int = 15
    status: str = "Pending"  # Completed, In Progress, Pending

class LearningPath(BaseModel):
    id: str
    employeeId: str
    skillName: str
    targetRole: Optional[str] = None
    level: str = "Beginner to Intermediate"
    topics: List[LessonTopic] = []
    currentTopicIndex: int = 0
    progressPercentage: int = 0
    createdAt: Optional[str] = None

class CreateLearningPathRequest(BaseModel):
    employeeId: str
    skillName: str
    targetRoleId: Optional[str] = None

class TeachingContent(BaseModel):
    topic: str
    skillName: str
    level: str
    explanation: str
    analogy: Optional[str] = None
    example: str
    codeSnippet: Optional[str] = None
    stepByStepDemo: List[str] = []
    practiceTask: str
    practiceStarterCode: Optional[str] = None
    expectedOutcome: str
    keyTakeaway: str
    nextStep: str

class TeachRequest(BaseModel):
    employeeId: str
    skillName: str
    topicId: Optional[str] = None
    currentProficiency: Optional[int] = None

class PracticeTask(BaseModel):
    id: str
    skillName: str
    topic: str
    difficulty: str  # Beginner, Intermediate, Advanced
    prompt: str
    instructions: List[str] = []
    starterCode: Optional[str] = None
    expectedOutput: str
    hints: List[str] = []

class GeneratePracticeRequest(BaseModel):
    employeeId: str
    skillName: str
    topic: str
    difficulty: Optional[str] = "Intermediate"

class PracticeSubmission(BaseModel):
    employeeId: str
    skillName: str
    topic: str
    taskPrompt: str
    solutionText: str
    codeSnippet: Optional[str] = None
    submissionType: str = "code"  # code, explanation, project_url

class EvaluationResult(BaseModel):
    score: int  # 0 - 100
    technicalUnderstanding: int
    implementationQuality: int
    bestPractices: int
    status: str  # Mastered, Proficient, Needs Improvement, Re-teach Required
    isCorrect: bool
    strengths: List[str] = []
    weaknesses: List[str] = []
    detailedFeedback: str
    correctSolution: Optional[str] = None
    masteryStatus: str  # NOT_STARTED, LEARNING, PRACTICING, ASSESSED, MASTERED
    recommendedAction: str  # advance, reteach, practice_more
    weakConcept: Optional[str] = None

class ProjectEvaluationRequest(BaseModel):
    employeeId: str
    skillName: str
    projectTitle: str
    codeSnippet: Optional[str] = None
    explanation: str
    githubUrl: Optional[str] = None
    deployedUrl: Optional[str] = None

class QuizQuestion(BaseModel):
    id: str
    question: str
    type: str  # multiple_choice, true_false, code_analysis
    options: List[str] = []
    correctAnswer: str
    explanation: str
    conceptTested: str

class Quiz(BaseModel):
    id: str
    skillName: str
    topic: str
    questions: List[QuizQuestion] = []
    passingScore: int = 75

class GenerateQuizRequest(BaseModel):
    employeeId: str
    skillName: str
    topic: str
    numQuestions: int = 3

class QuizSubmission(BaseModel):
    employeeId: str
    skillName: str
    topic: str
    answers: Dict[str, str]  # questionId -> selectedOption

class QuizResult(BaseModel):
    score: int
    totalQuestions: int
    correctCount: int
    percentage: int
    passed: bool
    strongAreas: List[str] = []
    needsImprovement: List[str] = []
    detailedFeedback: str
    masteryStatus: str
    recommendedAction: str
    questionReview: List[Dict[str, Any]] = []

class ReteachRequest(BaseModel):
    employeeId: str
    skillName: str
    topic: str
    weakConcept: str
    previousMistake: str

class ReteachContent(BaseModel):
    skillName: str
    topic: str
    weakConcept: str
    simplifiedExplanation: str
    concreteAnalogy: str
    practicalExample: str
    codeSnippet: Optional[str] = None
    easierPracticeTask: str
    practiceStarter: Optional[str] = None
    reassurance: str

class SkillProgressItem(BaseModel):
    employeeId: str
    skillName: str
    currentLevel: int  # 0 - 100
    targetLevel: int = 80
    lessonsCompleted: int = 0
    totalLessons: int = 5
    assessmentScore: int = 0
    attempts: int = 0
    masteryStatus: str = "NOT_STARTED"  # NOT_STARTED, LEARNING, PRACTICING, ASSESSED, MASTERED
    lastActivityAt: Optional[str] = None

class SkillMasteryResponse(BaseModel):
    employeeId: str
    masteredSkills: List[str] = []
    inProgressSkills: List[Dict[str, Any]] = []
    overallReadiness: int = 0
    badgesEarned: List[Dict[str, str]] = []

class MentorChatRequest(BaseModel):
    employeeId: str
    skillName: Optional[str] = None
    message: str
    topic: Optional[str] = None
    conversationHistory: Optional[List[Dict[str, str]]] = []

class MentorChatResponse(BaseModel):
    reply: str
    suggestedQuestions: List[str] = []
    teachingCard: Optional[TeachingContent] = None
    recommendedAction: Optional[str] = None

class RoleReadinessResponse(BaseModel):
    employeeId: str
    targetRoleId: str
    targetRoleTitle: str
    overallReadinessPercentage: float
    skillReadinessBreakdown: List[Dict[str, Any]] = []
    masteredCount: int
    totalRequiredCount: int
    remainingSkills: List[str] = []
    nextBestSkillToLearn: str
    mentorAdvice: str

class LearningResourceItem(BaseModel):
    title: str
    provider: str
    skill: str
    difficulty: str = "Intermediate"  # Beginner, Intermediate, Advanced
    estimated_time: str = "4 hours"
    resource_type: str = "Official Documentation"  # Official Documentation, Course, Tutorial, Lab, Certification
    url: str
    description: str

class GenerateReportRequest(BaseModel):
    employeeId: str
    reportType: str = "career_development"  # roadmap, learning_plan, skill_report, career_development
    targetRoleId: Optional[str] = None
    skillName: Optional[str] = None

class GeneratedDocumentItem(BaseModel):
    documentId: str
    ownerUid: str
    documentType: str
    title: str
    s3Key: str
    downloadUrl: str
    createdAt: str
    metadata: Dict[str, Any] = {}

class AvatarPresignedUrlRequest(BaseModel):
    employeeId: str
    fileName: str
    fileType: str
    fileSize: Optional[int] = None

class AvatarConfirmRequest(BaseModel):
    employeeId: str
    s3Key: str
    photoUrl: str

class AvatarResponse(BaseModel):
    employeeId: str
    profilePhotoUrl: Optional[str] = None
    profilePhotoKey: Optional[str] = None
    message: str = "Success"

# ==========================================================
# ADVANCED TALENT DEVELOPMENT ENGINE SCHEMAS
# ==========================================================

class SkillPassportItem(BaseModel):
    skillName: str
    category: str = "Technical"
    status: str = "VERIFIED"  # VERIFIED, AI-INFERRED, ASSESSED, USER-DECLARED
    overallMastery: int = 80
    masteryLevel: str = "INTERMEDIATE"  # BEGINNER, INTERMEDIATE, ADVANCED, MASTER
    conceptualScore: int = 80
    practicalScore: int = 75
    problemSolvingScore: int = 80
    learningProgress: int = 65
    lastEvaluated: str = "Recently"
    confidence: str = "High"
    evidence: List[str] = []
    relatedProjects: List[str] = []
    relatedCertifications: List[str] = []
    reasoning: str = ""

class SkillPassportResponse(BaseModel):
    employeeId: str
    employeeName: str
    targetRole: Optional[str] = None
    verifiedSkillsCount: int = 0
    inferredSkillsCount: int = 0
    averageMastery: int = 0
    skills: List[SkillPassportItem] = []

class SkillDNAEvidenceNode(BaseModel):
    name: str
    type: str  # Certificate, Project, Assessment, Practical Task, Document
    source: str
    confidence: int = 90

class SkillDNAItem(BaseModel):
    skillName: str
    category: str  # Programming, Data, Cloud, AI/ML, Tools, Platforms, Communication, Leadership, Transferable, Domain
    mastery: int = 80
    evidenceNodes: List[SkillDNAEvidenceNode] = []

class SkillDNAResponse(BaseModel):
    employeeId: str
    employeeName: str
    categories: Dict[str, List[SkillDNAItem]] = {}
    totalTrackedSkills: int = 0

class EvidenceExplorerItem(BaseModel):
    skillName: str
    evidenceType: str  # Document, Project, Assessment, Practical
    sourceName: str
    reasoningSummary: str
    confidence: str = "High"
    verificationStatus: str = "VERIFIED"
    documentId: Optional[str] = None
    timestamp: str = ""

class EvidenceExplorerResponse(BaseModel):
    employeeId: str
    evidenceList: List[EvidenceExplorerItem] = []

class SkillDependencyNode(BaseModel):
    skillName: str
    category: str
    status: str  # MASTERED, IN_PROGRESS, MISSING
    proficiency: int = 0
    prerequisites: List[str] = []
    recommendedOrder: int = 1
    description: str = ""

class SkillGraphResponse(BaseModel):
    targetSkill: str
    targetRole: Optional[str] = None
    masteredCount: int = 0
    missingCount: int = 0
    nodes: List[SkillDependencyNode] = []
    recommendedLearningSequence: List[str] = []

class RoleSimulationTask(BaseModel):
    taskId: str
    taskNumber: int = 1
    title: str
    category: str  # Technical, Coding, Debugging, System/Architecture, Data, Scenario, Practical
    difficulty: str = "Intermediate"
    scenarioDescription: str
    starterCodeOrContext: Optional[str] = None
    expectedDeliverables: str
    hints: List[str] = []

class RoleSimulationStartResponse(BaseModel):
    simulationId: str
    employeeId: str
    roleId: str
    roleTitle: str
    totalTasks: int = 4
    tasks: List[RoleSimulationTask] = []

class RoleSimulationSubmission(BaseModel):
    simulationId: str
    employeeId: str
    roleId: str
    taskId: str
    userSubmission: str
    taskCategory: str = "Technical"

class RoleSimulationEvaluation(BaseModel):
    taskId: str
    simulationId: str
    correctnessScore: int  # 0-100
    problemSolvingScore: int
    technicalUnderstandingScore: int
    efficiencyScore: int
    codeQualityScore: int
    practicalAbilityScore: int
    overallScore: int
    verdict: str  # EXCEEDS_EXPECTATIONS, MEETS_EXPECTATIONS, NEEDS_IMPROVEMENT
    feedback: str
    strengths: List[str] = []
    weakSpots: List[str] = []
    recommendedNextStep: str = ""

class SkillStressQuestion(BaseModel):
    level: int  # 1 to 5
    levelTitle: str  # Concept, Application, Problem Solving, Real-World Scenario, Advanced Challenge
    scenario: str
    codeSnippet: Optional[str] = None
    options: Optional[List[str]] = None
    questionType: str = "open_ended"  # open_ended, multiple_choice

class StressTestSubmission(BaseModel):
    employeeId: str
    skillName: str
    level: int
    userAnswer: str
    previousAttempts: Optional[int] = 0

class StressTestResult(BaseModel):
    skillName: str
    level: int
    passed: bool
    score: int
    feedback: str
    correctExplanation: str
    triggerAdaptiveTeacher: bool = False
    weakConceptDetected: Optional[str] = None
    nextLevel: Optional[int] = None

class MentorMemoryItem(BaseModel):
    employeeId: str
    skill: str
    concept: str
    attempts: int = 1
    mistakes: List[str] = []
    successfulConcepts: List[str] = []
    completedLessons: List[str] = []
    lastActivity: str
    masteryStatus: str = "LEARNING"
    preferredStyle: Optional[str] = "Step-by-step with practical examples"

class MentorMemoryResponse(BaseModel):
    employeeId: str
    memories: List[MentorMemoryItem] = []

class LearningFeedItem(BaseModel):
    id: str
    title: str
    skill: str
    whyRecommended: str
    difficulty: str  # Beginner, Intermediate, Advanced
    estimatedEffort: str
    resourceType: str  # Official Documentation, Interactive Lab, Video Curriculum, Practice Project
    source: str
    url: Optional[str] = None
    status: str = "NOT_STARTED"  # NOT_STARTED, IN_PROGRESS, COMPLETED

class LearningMissionStage(BaseModel):
    stageNumber: int  # 1 to 8
    stageName: str  # Learn, Understand, Practice, Quiz, Project, Evaluate, Re-teach, Master
    description: str
    status: str = "LOCKED"  # LOCKED, ACTIVE, COMPLETED
    score: Optional[int] = None
    evidenceUrl: Optional[str] = None

class LearningMissionItem(BaseModel):
    missionId: str
    employeeId: str
    skillName: str
    targetRole: str
    currentStage: int = 1
    totalStages: int = 8
    progressPercent: int = 0
    stages: List[LearningMissionStage] = []
    createdAt: str
    updatedAt: str

class LearningMissionAdvanceRequest(BaseModel):
    missionId: str
    employeeId: str
    stageNumber: int
    evidenceOrAnswer: Optional[str] = None

class MockInterviewQuestion(BaseModel):
    questionId: str
    questionNumber: int
    category: str  # Technical, Behavioral, Scenario, Problem Solving
    question: str
    context: Optional[str] = None
    evaluationCriteria: List[str] = []

class MockInterviewAnswerRequest(BaseModel):
    interviewId: str
    employeeId: str
    roleTitle: str
    questionId: str
    questionNumber: int
    userAnswer: str

class MockInterviewEvaluationResponse(BaseModel):
    interviewId: str
    questionId: str
    technicalAccuracyScore: int
    relevanceScore: int
    reasoningScore: int
    clarityScore: int
    completenessScore: int
    overallScore: int
    feedback: str
    weakConcept: Optional[str] = None
    learnConceptTrigger: Optional[str] = None
    isInterviewFinished: bool = False
    finalSummary: Optional[str] = None

class CareerWhatIfRequest(BaseModel):
    employeeId: str
    addedSkills: List[str]
    targetRoleTitle: Optional[str] = None

class CareerWhatIfResponse(BaseModel):
    employeeId: str
    scenarioSkillsAdded: List[str]
    currentAlignment: int
    projectedAlignment: int
    unlockedRoles: List[Dict[str, Any]] = []
    missingGapsRemaining: List[str] = []
    careerAdvice: str

class TalentTwinQueryRequest(BaseModel):
    employeeId: str
    query: str
    conversationHistory: Optional[List[Dict[str, str]]] = []

class TalentTwinResponse(BaseModel):
    employeeId: str
    answer: str
    groundedEvidenceSources: List[str] = []
    recommendedAction: Optional[str] = None
    actionUrl: Optional[str] = None

class TeamBuilderRequest(BaseModel):
    projectName: str
    projectDescription: str
    requiredSkills: List[str]
    department: Optional[str] = None

class TeamBuilderCandidate(BaseModel):
    employeeId: str
    employeeName: str
    designation: str
    department: str
    profilePhotoUrl: Optional[str] = None
    matchPercentage: int
    matchingSkills: List[str] = []
    missingSkills: List[str] = []
    verifiedEvidenceSummary: str
    recommendationReason: str

class TeamBuilderResponse(BaseModel):
    projectName: str
    teamCompletenessScore: int
    recommendedTeam: List[TeamBuilderCandidate] = []
    strategicInsights: str

class InternalGigItem(BaseModel):
    id: str
    title: str
    department: str
    description: str
    requiredSkills: List[str]
    duration: str
    timeCommitment: str
    managerName: str
    status: str = "OPEN"  # OPEN, IN_PROGRESS, COMPLETED
    matchPercentage: Optional[int] = None
    skillGaps: Optional[List[str]] = None

class SkillGrowthHistoryItem(BaseModel):
    skillName: str
    baselineScore: int
    latestScore: int
    delta: int
    masteryStatus: str
    assessmentCount: int
    lastAssessedAt: str

class SkillGrowthResponse(BaseModel):
    employeeId: str
    growthItems: List[SkillGrowthHistoryItem] = []
    totalSkillsGrown: int = 0
    averageDelta: int = 0
    hasMasteryCredential: bool = False
    credentialId: Optional[str] = None

# ==========================================================
# CERTIFICATE & SKILL MASTERY SCHEMAS
# ==========================================================

class CertificateItem(BaseModel):
    id: str  # e.g., TIQ-SM-2026-000124
    employeeId: str
    recipientName: str
    skillName: str
    courseTitle: Optional[str] = None
    achievementScore: int = 92
    skillLevel: str = "Advanced"  # Beginner, Intermediate, Advanced, Master
    issuedOn: str
    certificateType: str = "Skill Mastery"  # Skill Mastery, Mock Interview, Role Simulation, Stress Test
    qrCodeUrl: Optional[str] = None
    verifyUrl: str
    signatory1Name: str = "Sridharan V.R"
    signatory1Title: str = "Founder, TALENTIQ AI"
    signatory2Name: str = "Authorized Signatory"
    signatory2Title: str = "TALENTIQ AI"
    description: Optional[str] = "The recipient has successfully completed the assigned learning missions, practical exercises, assessments and AI-guided evaluation conducted through the TALENTIQ AI Skill Mentor platform."
    metadata: Optional[Dict[str, Any]] = None
    createdAt: Optional[str] = None

class CertificateGenerateRequest(BaseModel):
    employeeId: str
    skillName: str
    courseTitle: Optional[str] = None
    achievementScore: Optional[int] = 92
    skillLevel: Optional[str] = "Advanced"
    certificateType: Optional[str] = "Skill Mastery"
    recipientName: Optional[str] = None



