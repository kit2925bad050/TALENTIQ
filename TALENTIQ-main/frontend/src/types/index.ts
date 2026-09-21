export interface SkillItem {
  name: string;
  category: string; // Core, Advanced, Emerging, Transferable, Soft
  proficiency: number;
  verified: boolean;
  evidence?: string;
}

export interface HiddenSkill {
  name: string;
  detectedFrom: string;
  confidence: number;
  category: string;
  explanation: string;
}

export interface Certification {
  name: string;
  issuer: string;
  issueDate?: string;
  credentialUrl?: string;
}

export interface ProjectItem {
  title: string;
  role: string;
  description: string;
  technologies: string[];
  impact?: string;
}

export interface LearningActivity {
  title: string;
  type: string;
  skillTarget: string;
  status: string; // In Progress, Completed, Recommended
  progress: number;
  estimatedHours: number;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  designation: string;
  experienceYears: number;
  summary: string;
  location: string;
  education: string;
  profilePhotoUrl?: string;
  resumeUrl?: string;
  profileStatus?: 'INCOMPLETE' | 'EXTRACTED' | 'VERIFIED';
  skills: SkillItem[];
  hiddenSkills: HiddenSkill[];
  certifications: Certification[];
  projects: ProjectItem[];
  learningActivities: LearningActivity[];
  targetRoleId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExtractedProfileData {
  name?: string | null;
  institution?: string | null;
  qualification?: string | null;
  course?: string | null;
  certificate_name?: string | null;
  certificate_issuer?: string | null;
  issue_date?: string | null;
  designation?: string | null;
  department?: string | null;
  experienceYears?: number | null;
  summary?: string | null;
  education?: string | null;
  skills: SkillItem[];
  technologies: string[];
  certifications: Certification[];
  projects: ProjectItem[];
  achievements: string[];
}

export interface DocumentItem {
  documentId: string;
  ownerUid: string;
  s3Key: string;
  fileName: string;
  fileUrl?: string;
  documentType: string;
  extractedText?: string;
  extractedData?: ExtractedProfileData;
  verificationStatus: 'EXTRACTED' | 'VERIFIED';
  uploadedAt?: string;
}

export interface DocumentExtractionResponse {
  documentId: string;
  ownerUid: string;
  fileName: string;
  s3Key: string;
  fileUrl?: string;
  documentType: string;
  verificationStatus: 'EXTRACTED' | 'VERIFIED';
  extractedData: ExtractedProfileData;
}

export interface InternalRole {
  id: string;
  title: string;
  department: string;
  description: string;
  requiredSkills: string[];
  preferredSkills: string[];
  experienceRequired: number;
  openPositions: number;
  urgency: string; // High, Medium, Low
  location: string;
  postedAt?: string;
  updatedAt?: string;
}

export interface RoleMatchScore {
  roleId: string;
  roleTitle: string;
  department: string;
  experienceRequired: number;
  finalMatch: number;
  skillMatch: number;
  experienceMatch: number;
  projectMatch: number;
  certificationMatch: number;
  matchingSkills: string[];
  missingSkills: string[];
  label: string;
  aiExplanation?: string;
}

export interface LearningRecommendation {
  type: string;
  title: string;
  duration: string;
  description: string;
}

export interface SkillGapItem {
  skillName: string;
  isCritical: boolean;
  currentLevel: number;
  requiredLevel: number;
  recommendations: LearningRecommendation[];
}

export interface SkillGapAnalysis {
  employeeId: string;
  targetRoleId: string;
  targetRoleTitle: string;
  matchScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  detailedGaps: SkillGapItem[];
  summary: string;
}

export interface RoadmapMilestone {
  phase: number;
  title: string;
  timeline: string;
  description: string;
  targetSkills: string[];
  actionItems: string[];
  deliverable: string;
  status: string; // Completed, Current, Pending
}

export interface CareerRoadmap {
  employeeId: string;
  targetRoleId: string;
  targetRoleTitle: string;
  currentRole: string;
  readinessScore: number;
  milestones: RoadmapMilestone[];
  aiAdvice: string;
}

export interface WorkforceAnalytics {
  totalEmployees: number;
  trackedSkills: number;
  internalOpportunities: number;
  criticalSkillGaps: number;
  topSkills: { name: string; count: number }[];
  departmentDistribution: { name: string; employees: number }[];
  skillShortages: {
    skill: string;
    demandRoles: number;
    availableEmployees: number;
    deficit: number;
    insight: string;
  }[];
  mobilityTrends: {
    month: string;
    internalMatches: number;
    transfersCompleted: number;
  }[];
}

export interface UserAuth {
  id: string;
  email: string;
  name: string;
  role: 'employee' | 'hr_admin';
  department: string;
  designation: string;
  profilePhotoUrl?: string;
  profilePhotoKey?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'match' | 'ai' | 'role';
}

// ==========================================================
// AI SKILL MENTOR TYPES
// ==========================================================

export interface SkillReadinessItem {
  skill: string;
  proficiency: number;
  level: string; // Beginner, Intermediate, Advanced, Mastered, Not Started
  status: string; // NOT_STARTED, LEARNING, PRACTICING, ASSESSED, MASTERED
  isGap: boolean;
  evidence?: string;
}

export interface SkillAssessmentResponse {
  employeeId: string;
  targetRole?: string;
  readinessMap: SkillReadinessItem[];
  overallReadinessPercentage: number;
  criticalGaps: string[];
  aiInsight: string;
}

export interface LessonTopic {
  id: string;
  title: string;
  description: string;
  sequence: number;
  estimatedMinutes: number;
  status: 'Completed' | 'In Progress' | 'Pending';
}

export interface LearningPath {
  id: string;
  employeeId: string;
  skillName: string;
  targetRole?: string;
  level: string;
  topics: LessonTopic[];
  currentTopicIndex: number;
  progressPercentage: number;
  createdAt?: string;
}

export interface TeachingContent {
  topic: string;
  skillName: string;
  level: string;
  explanation: string;
  analogy?: string;
  example: string;
  codeSnippet?: string;
  stepByStepDemo: string[];
  practiceTask: string;
  practiceStarterCode?: string;
  expectedOutcome: string;
  keyTakeaway: string;
  nextStep: string;
}

export interface PracticeTask {
  id: string;
  skillName: string;
  topic: string;
  difficulty: string;
  prompt: string;
  instructions: string[];
  starterCode?: string;
  expectedOutput: string;
  hints: string[];
}

export interface EvaluationResult {
  score: number;
  technicalUnderstanding: number;
  implementationQuality: number;
  bestPractices: number;
  status: string;
  isCorrect: boolean;
  strengths: string[];
  weaknesses: string[];
  detailedFeedback: string;
  correctSolution?: string;
  masteryStatus: 'NOT_STARTED' | 'LEARNING' | 'PRACTICING' | 'ASSESSED' | 'MASTERED';
  recommendedAction: 'advance' | 'reteach' | 'practice_more';
  weakConcept?: string;
}

export interface ReteachContent {
  skillName: string;
  topic: string;
  weakConcept: string;
  simplifiedExplanation: string;
  concreteAnalogy: string;
  practicalExample: string;
  codeSnippet?: string;
  easierPracticeTask: string;
  practiceStarter?: string;
  reassurance: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  conceptTested: string;
}

export interface Quiz {
  id: string;
  skillName: string;
  topic: string;
  questions: QuizQuestion[];
  passingScore: number;
}

export interface QuizResult {
  score: number;
  totalQuestions: number;
  correctCount: number;
  percentage: number;
  passed: boolean;
  strongAreas: string[];
  needsImprovement: string[];
  detailedFeedback: string;
  masteryStatus: string;
  recommendedAction: string;
  questionReview: {
    questionId: string;
    question: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    explanation: string;
    concept: string;
  }[];
}

export interface SkillProgressItem {
  employeeId: string;
  skillName: string;
  currentLevel: number;
  targetLevel: number;
  lessonsCompleted: number;
  totalLessons: number;
  assessmentScore: number;
  attempts: number;
  masteryStatus: 'NOT_STARTED' | 'LEARNING' | 'PRACTICING' | 'ASSESSED' | 'MASTERED';
  lastActivityAt?: string;
}

export interface RoleReadinessResponse {
  employeeId: string;
  targetRoleId: string;
  targetRoleTitle: string;
  overallReadinessPercentage: number;
  skillReadinessBreakdown: {
    skill: string;
    proficiency: number;
    status: string;
    isCritical: boolean;
  }[];
  masteredCount: number;
  totalRequiredCount: number;
  remainingSkills: string[];
  nextBestSkillToLearn: string;
  mentorAdvice: string;
}

export interface LearningResourceItem {
  title: string;
  provider: string;
  skill: string;
  difficulty: string;
  estimated_time: string;
  resource_type: string;
  url: string;
  description: string;
}

export interface GeneratedDocumentItem {
  documentId: string;
  ownerUid: string;
  documentType: string;
  title: string;
  s3Key: string;
  downloadUrl: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

// ==========================================================
// TALENT DEVELOPMENT ENGINE TYPES
// ==========================================================

export interface SkillPassportItem {
  skillName: string;
  category: string;
  status: 'VERIFIED' | 'AI-INFERRED' | 'ASSESSED' | 'USER-DECLARED';
  overallMastery: number;
  masteryLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'MASTER';
  conceptualScore: number;
  practicalScore: number;
  problemSolvingScore: number;
  learningProgress: number;
  lastEvaluated: string;
  confidence: string;
  evidence: string[];
  relatedProjects: string[];
  relatedCertifications: string[];
  reasoning: string;
}

export interface SkillPassportResponse {
  employeeId: string;
  employeeName: string;
  targetRole?: string;
  verifiedSkillsCount: number;
  inferredSkillsCount: number;
  averageMastery: number;
  skills: SkillPassportItem[];
}

export interface SkillDNAEvidenceNode {
  name: string;
  type: string;
  source: string;
  confidence: number;
}

export interface SkillDNAItem {
  skillName: string;
  category: string;
  mastery: number;
  evidenceNodes: SkillDNAEvidenceNode[];
}

export interface SkillDNAResponse {
  employeeId: string;
  employeeName: string;
  categories: Record<string, SkillDNAItem[]>;
  totalTrackedSkills: number;
}

export interface EvidenceExplorerItem {
  skillName: string;
  evidenceType: string;
  sourceName: string;
  reasoningSummary: string;
  confidence: string;
  verificationStatus: string;
  documentId?: string;
  timestamp: string;
}

export interface EvidenceExplorerResponse {
  employeeId: string;
  evidenceList: EvidenceExplorerItem[];
}

export interface SkillDependencyNode {
  skillName: string;
  category: string;
  status: 'MASTERED' | 'IN_PROGRESS' | 'MISSING';
  proficiency: number;
  prerequisites: string[];
  recommendedOrder: number;
  description: string;
}

export interface SkillGraphResponse {
  targetSkill: string;
  targetRole?: string;
  masteredCount: number;
  missingCount: number;
  nodes: SkillDependencyNode[];
  recommendedLearningSequence: string[];
}

export interface RoleSimulationTask {
  taskId: string;
  taskNumber: number;
  title: string;
  category: string;
  difficulty: string;
  scenarioDescription: string;
  starterCodeOrContext?: string;
  expectedDeliverables: string;
  hints: string[];
}

export interface RoleSimulationStartResponse {
  simulationId: string;
  employeeId: string;
  roleId: string;
  roleTitle: string;
  totalTasks: number;
  tasks: RoleSimulationTask[];
}

export interface RoleSimulationEvaluation {
  taskId: string;
  simulationId: string;
  correctnessScore: number;
  problemSolvingScore: number;
  technicalUnderstandingScore: number;
  efficiencyScore: number;
  codeQualityScore: number;
  practicalAbilityScore: number;
  overallScore: number;
  verdict: string;
  feedback: string;
  strengths: string[];
  weakSpots: string[];
  recommendedNextStep: string;
}

export interface StressTestQuestion {
  skillName: string;
  level: number;
  levelTitle: string;
  scenario: string;
  codeSnippet?: string;
  questionType: string;
}

export interface StressTestResult {
  skillName: string;
  level: number;
  passed: boolean;
  score: number;
  feedback: string;
  correctExplanation: string;
  triggerAdaptiveTeacher: boolean;
  weakConceptDetected?: string;
  nextLevel?: number;
}

export interface LearningFeedItem {
  id: string;
  title: string;
  skill: string;
  whyRecommended: string;
  difficulty: string;
  estimatedEffort: string;
  resourceType: string;
  source: string;
  url?: string;
  status: string;
}

export interface LearningMissionStage {
  stageNumber: number;
  stageName: string;
  description: string;
  status: 'LOCKED' | 'ACTIVE' | 'COMPLETED';
  score?: number;
  evidenceUrl?: string;
}

export interface LearningMissionItem {
  missionId: string;
  employeeId: string;
  skillName: string;
  targetRole: string;
  currentStage: number;
  totalStages: number;
  progressPercent: number;
  stages: LearningMissionStage[];
  createdAt: string;
  updatedAt: string;
}

export interface MockInterviewQuestion {
  questionId: string;
  questionNumber: number;
  category: string;
  question: string;
  context?: string;
  evaluationCriteria: string[];
}

export interface MockInterviewEvaluationResponse {
  interviewId: string;
  questionId: string;
  technicalAccuracyScore: number;
  relevanceScore: number;
  reasoningScore: number;
  clarityScore: number;
  completenessScore: number;
  overallScore: number;
  feedback: string;
  weakConcept?: string;
  learnConceptTrigger?: string;
  isInterviewFinished: boolean;
  finalSummary?: string;
}

export interface CareerWhatIfResponse {
  employeeId: string;
  scenarioSkillsAdded: string[];
  currentAlignment: number;
  projectedAlignment: number;
  unlockedRoles: {
    roleTitle: string;
    department: string;
    currentMatch: number;
    projectedMatch: number;
    keyUnlockingSkill: string;
  }[];
  missingGapsRemaining: string[];
  careerAdvice: string;
}

export interface TalentTwinResponse {
  employeeId: string;
  answer: string;
  groundedEvidenceSources: string[];
  recommendedAction?: string;
  actionUrl?: string;
}

export interface TeamBuilderCandidate {
  employeeId: string;
  employeeName: string;
  designation: string;
  department: string;
  profilePhotoUrl?: string;
  matchPercentage: number;
  matchingSkills: string[];
  missingSkills: string[];
  verifiedEvidenceSummary: string;
  recommendationReason: string;
}

export interface TeamBuilderResponse {
  projectName: string;
  teamCompletenessScore: number;
  recommendedTeam: TeamBuilderCandidate[];
  strategicInsights: string;
}

export interface InternalGigItem {
  id: string;
  title: string;
  department: string;
  description: string;
  requiredSkills: string[];
  duration: string;
  timeCommitment: string;
  managerName: string;
  status: string;
  matchPercentage?: number;
  skillGaps?: string[];
}

export interface SkillGrowthHistoryItem {
  skillName: string;
  baselineScore: number;
  latestScore: number;
  delta: number;
  masteryStatus: string;
  assessmentCount: number;
  lastAssessedAt: string;
}

export interface SkillGrowthResponse {
  employeeId: string;
  growthItems: SkillGrowthHistoryItem[];
  totalSkillsGrown: number;
  averageDelta: number;
  hasMasteryCredential: boolean;
  credentialId?: string;
}

export interface CertificateItem {
  id: string;
  employeeId: string;
  recipientName: string;
  skillName: string;
  courseTitle?: string | null;
  achievementScore: number;
  skillLevel: string;
  issuedOn: string;
  certificateType: string;
  qrCodeUrl?: string | null;
  verifyUrl: string;
  signatory1Name: string;
  signatory1Title: string;
  signatory2Name: string;
  signatory2Title: string;
  description?: string | null;
  metadata?: Record<string, any> | null;
  createdAt?: string | null;
}

export interface CertificateGenerateRequest {
  employeeId: string;
  skillName: string;
  courseTitle?: string;
  achievementScore?: number;
  skillLevel?: string;
  certificateType?: string;
  recipientName?: string;
}



