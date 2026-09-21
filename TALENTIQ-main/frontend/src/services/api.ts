import axios from 'axios';
import {
  Employee,
  InternalRole,
  RoleMatchScore,
  SkillGapAnalysis,
  CareerRoadmap,
  WorkforceAnalytics,
  HiddenSkill,
  NotificationItem,
  UserAuth,
  SkillAssessmentResponse,
  LearningPath,
  TeachingContent,
  PracticeTask,
  EvaluationResult,
  Quiz,
  QuizResult,
  ReteachContent,
  SkillProgressItem,
  RoleReadinessResponse,
  CertificateItem,
  CertificateGenerateRequest
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const savedUser = localStorage.getItem('talentiq_user');
  if (savedUser) {
    try {
      const u = JSON.parse(savedUser);
      if (u.token) {
        config.headers.Authorization = `Bearer ${u.token}`;
      } else if (u.role === 'hr_admin') {
        config.headers.Authorization = `Bearer hr-admin-${u.id || 'token'}`;
      } else if (u.id) {
        config.headers.Authorization = `Bearer emp-${u.id}`;
      }
    } catch (e) {
      // ignore
    }
  }
  return config;
});

export const apiService = {
  // Auth
  login: async (email: string, password: string): Promise<{ token: string; user: UserAuth }> => {
    const res = await apiClient.post('/auth/login', { email, password });
    return res.data;
  },

  hrLogin: async (email: string, password: string): Promise<{ token: string; user: UserAuth }> => {
    const res = await apiClient.post('/auth/hr-login', { email, password });
    return res.data;
  },

  getMe: async (): Promise<UserAuth> => {
    const res = await apiClient.get('/auth/me');
    return res.data;
  },

  register: async (data: { email: string; password: string; name: string; department?: string; designation?: string }): Promise<{ token: string; user: UserAuth }> => {
    const res = await apiClient.post('/auth/register', data);
    return res.data;
  },

  // Employees
  getEmployees: async (params?: { skip?: number; limit?: number; search_skill?: string; department?: string }): Promise<Employee[]> => {
    const res = await apiClient.get('/employees', { params });
    return res.data;
  },

  getEmployee: async (id: string): Promise<Employee> => {
    const res = await apiClient.get(`/employees/${id}`);
    return res.data;
  },

  updateEmployee: async (id: string, updates: Partial<Employee>): Promise<Employee> => {
    const res = await apiClient.patch(`/employees/${id}`, updates);
    return res.data;
  },

  getEmployeeMatches: async (id: string): Promise<RoleMatchScore[]> => {
    const res = await apiClient.get(`/employees/${id}/matches`);
    return res.data;
  },

  // Internal Roles
  getRoles: async (params?: { skip?: number; limit?: number; search?: string; department?: string }): Promise<InternalRole[]> => {
    const res = await apiClient.get('/roles', { params });
    return res.data;
  },

  getRole: async (id: string): Promise<InternalRole> => {
    const res = await apiClient.get(`/roles/${id}`);
    return res.data;
  },

  createRole: async (role: Omit<InternalRole, 'id' | 'postedAt' | 'updatedAt'>): Promise<InternalRole> => {
    const res = await apiClient.post('/roles', role);
    return res.data;
  },

  updateRole: async (id: string, updates: Partial<InternalRole>): Promise<InternalRole> => {
    const res = await apiClient.patch(`/roles/${id}`, updates);
    return res.data;
  },

  deleteRole: async (id: string): Promise<{ status: string }> => {
    const res = await apiClient.delete(`/roles/${id}`);
    return res.data;
  },

  // AI Operations
  analyzeProfile: async (employeeId: string): Promise<any> => {
    const res = await apiClient.post('/ai/analyze-profile', { employeeId });
    return res.data;
  },

  detectHiddenSkills: async (employeeId: string): Promise<HiddenSkill[]> => {
    const res = await apiClient.post('/ai/detect-hidden-skills', { employeeId });
    return res.data;
  },

  explainRoleMatch: async (employeeId: string, roleId: string): Promise<RoleMatchScore> => {
    const res = await apiClient.post('/ai/match-role', { employeeId, roleId });
    return res.data;
  },

  analyzeSkillGap: async (employeeId: string, targetRoleId: string): Promise<SkillGapAnalysis> => {
    const res = await apiClient.post('/ai/analyze-skill-gap', { employeeId, targetRoleId });
    return res.data;
  },

  generateRoadmap: async (employeeId: string, targetRoleId: string): Promise<CareerRoadmap> => {
    const res = await apiClient.post('/ai/generate-roadmap', { employeeId, targetRoleId });
    return res.data;
  },

  chatCopilot: async (employeeId: string, message: string, history: any[] = []): Promise<{ reply: string; suggestedQuestions: string[]; relatedRoleId?: string }> => {
    const res = await apiClient.post('/ai/chat', { employeeId, message, conversationHistory: history });
    return res.data;
  },

  // ==========================================================
  // AI SKILL MENTOR API
  // ==========================================================
  assessSkillReadiness: async (employeeId: string, targetRoleId?: string): Promise<SkillAssessmentResponse> => {
    const res = await apiClient.post('/mentor/assess-skill', { employeeId, targetRoleId });
    return res.data;
  },

  createLearningPath: async (employeeId: string, skillName: string, targetRoleId?: string): Promise<LearningPath> => {
    const res = await apiClient.post('/mentor/create-learning-path', { employeeId, skillName, targetRoleId });
    return res.data;
  },

  teachTopic: async (employeeId: string, skillName: string, topicId?: string): Promise<TeachingContent> => {
    const res = await apiClient.post('/mentor/teach', { employeeId, skillName, topicId });
    return res.data;
  },

  generatePracticeTask: async (employeeId: string, skillName: string, topic: string, difficulty?: string): Promise<PracticeTask> => {
    const res = await apiClient.post('/mentor/generate-practice', { employeeId, skillName, topic, difficulty });
    return res.data;
  },

  evaluateAnswer: async (data: { employeeId: string; skillName: string; topic: string; taskPrompt: string; solutionText: string; codeSnippet?: string }): Promise<EvaluationResult> => {
    const res = await apiClient.post('/mentor/evaluate-answer', data);
    return res.data;
  },

  reteachConcept: async (data: { employeeId: string; skillName: string; topic: string; weakConcept: string; previousMistake: string }): Promise<ReteachContent> => {
    const res = await apiClient.post('/mentor/reteach', data);
    return res.data;
  },

  generateQuiz: async (employeeId: string, skillName: string, topic: string, numQuestions: number = 3): Promise<Quiz> => {
    const res = await apiClient.post('/mentor/generate-quiz', { employeeId, skillName, topic, numQuestions });
    return res.data;
  },

  evaluateQuiz: async (data: { employeeId: string; skillName: string; topic: string; answers: Record<string, string> }): Promise<QuizResult> => {
    const res = await apiClient.post('/mentor/evaluate-quiz', data);
    return res.data;
  },

  evaluateProjectSubmission: async (data: { employeeId: string; skillName: string; projectTitle: string; codeSnippet?: string; explanation: string; githubUrl?: string }): Promise<EvaluationResult> => {
    const res = await apiClient.post('/mentor/evaluate-project', data);
    return res.data;
  },

  getSkillProgress: async (employeeId: string): Promise<SkillProgressItem[]> => {
    const res = await apiClient.get(`/mentor/progress/${employeeId}`);
    return res.data;
  },

  getRoleReadiness: async (employeeId: string, targetRoleId: string): Promise<RoleReadinessResponse> => {
    const res = await apiClient.post('/mentor/role-readiness', { employeeId, targetRoleId });
    return res.data;
  },

  mentorChat: async (data: { employeeId: string; message: string; skillName?: string; topic?: string; conversationHistory?: any[] }): Promise<{ reply: string; suggestedQuestions: string[] }> => {
    const res = await apiClient.post('/mentor/chat', data);
    return res.data;
  },

  // HR Analytics
  getWorkforceAnalytics: async (): Promise<WorkforceAnalytics> => {
    const res = await apiClient.get('/analytics/workforce');
    return res.data;
  },

  getNotifications: async (): Promise<NotificationItem[]> => {
    const res = await apiClient.get('/analytics/notifications');
    return res.data;
  },

  markNotificationsRead: async (): Promise<void> => {
    await apiClient.post('/analytics/notifications/read');
  },

  // Demo management
  seedDemo: async (): Promise<any> => {
    const res = await apiClient.post('/demo/seed');
    return res.data;
  },

  clearData: async (): Promise<any> => {
    const res = await apiClient.post('/demo/clear');
    return res.data;
  },

  // Upload & S3 Presigned URL
  getPresignedUrl: async (fileName: string, fileType: string, category: string = 'certificate', employeeId?: string, documentId?: string) => {
    const res = await apiClient.post('/upload/presigned-url', { fileName, fileType, category, employeeId, documentId });
    return res.data;
  },

  uploadFileToS3: async (uploadUrl: string, file: File): Promise<void> => {
    if (uploadUrl.startsWith('/api/')) {
      const formData = new FormData();
      formData.append('file', file);
      await apiClient.post(uploadUrl.replace('/api', ''), formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return;
    }
    // Direct AWS S3 presigned PUT
    await axios.put(uploadUrl, file, {
      headers: {
        'Content-Type': file.type || 'application/octet-stream'
      }
    });
  },

  // Document Verification & OCR
  extractDocument: async (data: {
    employeeId: string;
    documentType?: string;
    s3Key?: string;
    fileUrl?: string;
    rawText?: string;
    file?: File;
  }): Promise<any> => {
    const formData = new FormData();
    formData.append('employeeId', data.employeeId);
    formData.append('documentType', data.documentType || 'certificate');
    if (data.s3Key) formData.append('s3Key', data.s3Key);
    if (data.fileUrl) formData.append('fileUrl', data.fileUrl);
    if (data.rawText) formData.append('rawText', data.rawText);
    if (data.file) formData.append('file', data.file);

    const res = await apiClient.post('/documents/extract', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  confirmDocumentVerification: async (payload: {
    employeeId: string;
    documentId?: string;
    verifiedData: any;
  }): Promise<Employee> => {
    const res = await apiClient.post('/documents/confirm', payload);
    return res.data;
  },

  getEmployeeDocuments: async (employeeId: string): Promise<any[]> => {
    const res = await apiClient.get(`/documents/employee/${employeeId}`);
    return res.data;
  },

  getSkillResources: async (skillName: string): Promise<any[]> => {
    const res = await apiClient.get(`/mentor/resources/${encodeURIComponent(skillName)}`);
    return res.data;
  },

  generateCareerReport: async (employeeId: string, targetRoleId?: string): Promise<any> => {
    const res = await apiClient.post('/documents/generate-career-report', { employeeId, targetRoleId });
    return res.data;
  },

  generateRoadmapReport: async (employeeId: string, targetRoleId?: string): Promise<any> => {
    const res = await apiClient.post('/documents/generate-roadmap', { employeeId, targetRoleId });
    return res.data;
  },

  generateLearningReport: async (employeeId: string, targetRoleId?: string): Promise<any> => {
    const res = await apiClient.post('/documents/generate-learning-report', { employeeId, targetRoleId });
    return res.data;
  },

  generateSkillReport: async (employeeId: string, targetRoleId?: string): Promise<any> => {
    const res = await apiClient.post('/documents/generate-skill-report', { employeeId, targetRoleId });
    return res.data;
  },

  getGeneratedDocuments: async (employeeId: string): Promise<any[]> => {
    const res = await apiClient.get(`/documents/generated/${employeeId}`);
    return res.data;
  },

  // Avatar Management
  getAvatarPresignedUrl: async (data: { employeeId: string; fileName: string; fileType: string; fileSize?: number }): Promise<{ uploadUrl: string; fileUrl: string; s3Key: string }> => {
    const res = await apiClient.post('/profile/avatar/presigned-url', data);
    return res.data;
  },

  confirmAvatar: async (data: { employeeId: string; s3Key: string; photoUrl: string }): Promise<{ employeeId: string; profilePhotoUrl: string | null; profilePhotoKey: string | null; message: string }> => {
    const res = await apiClient.post('/profile/avatar/confirm', data);
    return res.data;
  },

  deleteAvatar: async (employeeId: string): Promise<{ employeeId: string; profilePhotoUrl: null; profilePhotoKey: null; message: string }> => {
    const res = await apiClient.delete(`/profile/avatar/${employeeId}`);
    return res.data;
  },

  // ==========================================================
  // TALENT DEVELOPMENT ENGINE METHODS
  // ==========================================================
  getSkillPassport: async (employeeId: string) => {
    const res = await apiClient.get('/employee/skill-passport', { params: { employee_id: employeeId } });
    return res.data;
  },

  getSkillDNA: async (employeeId: string) => {
    const res = await apiClient.get('/employee/skill-dna', { params: { employee_id: employeeId } });
    return res.data;
  },

  getEvidenceExplorer: async (employeeId: string) => {
    const res = await apiClient.get('/employee/evidence', { params: { employee_id: employeeId } });
    return res.data;
  },

  getSkillDependencyGraph: async (employeeId: string, targetSkill: string = 'MLOps') => {
    const res = await apiClient.get('/employee/skill-graph', { params: { employee_id: employeeId, target_skill: targetSkill } });
    return res.data;
  },

  startRoleSimulation: async (employeeId: string, roleId: string = 'role-ml-engineer') => {
    const res = await apiClient.post('/employee/role-simulator/start', null, { params: { employee_id: employeeId, role_id: roleId } });
    return res.data;
  },

  evaluateRoleSimulation: async (submission: { simulationId: string; employeeId: string; roleId: string; taskId: string; userSubmission: string; taskCategory?: string }) => {
    const res = await apiClient.post('/employee/role-simulator/evaluate', submission);
    return res.data;
  },

  startSkillStressTest: async (employeeId: string, skillName: string = 'Docker', level: number = 1) => {
    const res = await apiClient.post('/employee/skill-stress-test/start', null, { params: { employee_id: employeeId, skill_name: skillName, level } });
    return res.data;
  },

  evaluateSkillStressTest: async (submission: { employeeId: string; skillName: string; level: number; userAnswer: string; previousAttempts?: number }) => {
    const res = await apiClient.post('/employee/skill-stress-test/evaluate', submission);
    return res.data;
  },

  getPersonalLearningFeed: async (employeeId: string) => {
    const res = await apiClient.get('/employee/learning-feed', { params: { employee_id: employeeId } });
    return res.data;
  },

  getLearningMissions: async (employeeId: string) => {
    const res = await apiClient.get('/employee/learning-missions', { params: { employee_id: employeeId } });
    return res.data;
  },

  advanceLearningMission: async (data: { missionId: string; employeeId: string; stageNumber: number; evidenceOrAnswer?: string }) => {
    const res = await apiClient.post('/employee/learning-mission/advance', data);
    return res.data;
  },

  startMockInterview: async (employeeId: string, roleTitle: string = 'Machine Learning Engineer') => {
    const res = await apiClient.post('/employee/mock-interview/start', null, { params: { employee_id: employeeId, role_title: roleTitle } });
    return res.data;
  },

  evaluateMockInterviewAnswer: async (data: { interviewId: string; employeeId: string; roleTitle: string; questionId: string; questionNumber: number; userAnswer: string }) => {
    const res = await apiClient.post('/employee/mock-interview/answer', data);
    return res.data;
  },

  simulateCareerWhatIf: async (data: { employeeId: string; addedSkills: string[]; targetRoleTitle?: string }) => {
    const res = await apiClient.post('/employee/career-simulator', data);
    return res.data;
  },

  chatTalentTwin: async (data: { employeeId: string; query: string; conversationHistory?: { role: string; content: string }[] }) => {
    const res = await apiClient.post('/employee/talent-twin/chat', data);
    return res.data;
  },

  getSkillGrowth: async (employeeId: string) => {
    const res = await apiClient.get('/employee/progress', { params: { employee_id: employeeId } });
    return res.data;
  },

  getEmployeeInternalGigs: async (employeeId: string) => {
    const res = await apiClient.get('/employee/internal-gigs', { params: { employee_id: employeeId } });
    return res.data;
  },

  getHRInternalGigs: async () => {
    const res = await apiClient.get('/hr/internal-gigs');
    return res.data;
  },

  createInternalGig: async (gig: any) => {
    const res = await apiClient.post('/hr/internal-gigs', gig);
    return res.data;
  },

  buildTeam: async (data: { projectName: string; projectDescription: string; requiredSkills: string[]; department?: string }) => {
    const res = await apiClient.post('/hr/team-builder', data);
    return res.data;
  },

  getHRSkillIntelligence: async () => {
    const res = await apiClient.get('/hr/skill-intelligence');
    return res.data;
  },

  getMentorMemory: async (employeeId: string) => {
    const res = await apiClient.get('/mentor/memory', { params: { employee_id: employeeId } });
    return res.data;
  },

  // ==========================================================
  // CERTIFICATES & SKILL MASTERY API
  // ==========================================================
  getEmployeeCertificates: async (employeeId: string): Promise<CertificateItem[]> => {
    const res = await apiClient.get(`/certificates/employee/${encodeURIComponent(employeeId)}`);
    return res.data;
  },

  generateCertificate: async (data: CertificateGenerateRequest): Promise<CertificateItem> => {
    const res = await apiClient.post('/certificates/generate', data);
    return res.data;
  },

  getCertificateById: async (certificateId: string): Promise<CertificateItem> => {
    const res = await apiClient.get(`/certificates/${encodeURIComponent(certificateId)}`);
    return res.data;
  },

  verifyCertificate: async (certificateId: string): Promise<CertificateItem> => {
    const res = await apiClient.get(`/certificates/verify/${encodeURIComponent(certificateId)}`);
    return res.data;
  }
};



