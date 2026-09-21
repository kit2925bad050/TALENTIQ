import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  Sparkles,
  CheckCircle2,
  CircleDot,
  Clock,
  Play,
  Code2,
  Terminal,
  BookOpen,
  Award,
  AlertTriangle,
  RotateCcw,
  Check,
  ArrowRight,
  Send,
  HelpCircle,
  TrendingUp,
  MessageSquare,
  ShieldCheck,
  ChevronRight,
  Zap,
  FolderGit2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import {
  LearningPath,
  LessonTopic,
  TeachingContent,
  PracticeTask,
  EvaluationResult,
  Quiz,
  QuizResult,
  ReteachContent,
  SkillProgressItem,
  RoleReadinessResponse,
  LearningResourceItem,
  CertificateItem
} from '../../types';
import { MentorChatModal } from '../../components/mentor/MentorChatModal';
import { AIProgressModal } from '../../components/common/AIProgressModal';
import { DocumentVerificationWizard } from '../../components/profile/DocumentVerificationWizard';
import { CertificateModal } from '../../components/common/CertificateModal';
import { Upload, FileText, ExternalLink, Download } from 'lucide-react';


export const MentorLearningRoom: React.FC = () => {
  const { activeEmployeeId, refreshProfile } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const selectedSkillParam = searchParams.get('skill') || 'Docker';
  const targetRoleParam = searchParams.get('role') || 'role-ml-engineer';

  const [activeSkill, setActiveSkill] = useState<string>(selectedSkillParam);
  const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<LessonTopic | null>(null);
  const [teachingContent, setTeachingContent] = useState<TeachingContent | null>(null);
  const [practiceTask, setPracticeTask] = useState<PracticeTask | null>(null);
  const [resources, setResources] = useState<LearningResourceItem[]>([]);
  
  // Practice state
  const [userCode, setUserCode] = useState<string>('docker run -d -p 5000:8000 --name churn_predictor retention_model:v1');
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Re-teaching state
  const [reteachData, setReteachData] = useState<ReteachContent | null>(null);
  const [isReteaching, setIsReteaching] = useState(false);

  // Quiz state
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);

  // Project Submission state
  const [projectTitle, setProjectTitle] = useState('Production FastAPI Inference Container');
  const [projectCode, setProjectCode] = useState('FROM python:3.11-slim\nWORKDIR /app\nCOPY requirements.txt .\nRUN pip install -r requirements.txt\nCOPY . .\nEXPOSE 8000\nCMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]');
  const [projectResult, setProjectResult] = useState<EvaluationResult | null>(null);

  // HUD & Role Readiness state
  const [roleReadiness, setRoleReadiness] = useState<RoleReadinessResponse | null>(null);
  const [skillProgress, setSkillProgress] = useState<SkillProgressItem | null>(null);

  // Report Generation State
  const [generatingReport, setGeneratingReport] = useState(false);
  const [generatedReportUrl, setGeneratedReportUrl] = useState<string | null>(null);

  // Certificate State
  const [certificate, setCertificate] = useState<CertificateItem | null>(null);
  const [showCertModal, setShowCertModal] = useState(false);
  const [generatingCert, setGeneratingCert] = useState(false);

  // UI States
  const [activeTab, setActiveTab] = useState<'resources' | 'lesson' | 'practice' | 'project'>('lesson');
  const [showTutorChat, setShowTutorChat] = useState(false);
  const [loading, setLoading] = useState(true);
  const [aiProgressTitle, setAiProgressTitle] = useState<string | null>(null);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [profileIncomplete, setProfileIncomplete] = useState(false);

  const handleClaimCertificate = async () => {
    if (!activeEmployeeId) return;
    try {
      setGeneratingCert(true);
      const cert = await apiService.generateCertificate({
        employeeId: activeEmployeeId,
        skillName: activeSkill,
        courseTitle: `${activeSkill} Mastery & Applied Engineering`,
        achievementScore: quizResult?.score || evaluation?.technicalUnderstanding || 92,
        skillLevel: (quizResult?.score || 90) >= 90 ? 'Advanced' : 'Intermediate',
        certificateType: 'Skill Mastery'
      });
      setCertificate(cert);
      setShowCertModal(true);
    } catch (err) {
      console.error('Failed to generate certificate:', err);
    } finally {
      setGeneratingCert(false);
    }
  };


  useEffect(() => {
    loadLearningRoom();
  }, [activeEmployeeId, activeSkill]);

  const loadLearningRoom = async () => {
    if (!activeEmployeeId) {
      setLoading(false);
      setProfileIncomplete(true);
      return;
    }
    try {
      setLoading(true);
      const empData = await apiService.getEmployee(activeEmployeeId).catch(() => null);
      if (!empData || empData.profileStatus === 'INCOMPLETE' || (!empData.skills?.length && !empData.projects?.length && !empData.certifications?.length)) {
        setProfileIncomplete(true);
        setLearningPath(null);
        return;
      }
      setProfileIncomplete(false);

      // 1. Create / Load structured learning path
      const lp = await apiService.createLearningPath(activeEmployeeId, activeSkill, targetRoleParam);
      setLearningPath(lp);

      const topic = lp.topics[lp.currentTopicIndex] || lp.topics[0];
      setSelectedTopic(topic);

      // 2. Load Teaching Content, Practice, Resources, & Readiness
      const [teach, practice, readiness, progressList, resList] = await Promise.all([
        apiService.teachTopic(activeEmployeeId, activeSkill, topic?.id),
        apiService.generatePracticeTask(activeEmployeeId, activeSkill, topic?.title || 'Fundamentals'),
        apiService.getRoleReadiness(activeEmployeeId, targetRoleParam),
        apiService.getSkillProgress(activeEmployeeId),
        apiService.getSkillResources(activeSkill).catch(() => [])
      ]);

      setTeachingContent(teach);
      setPracticeTask(practice);
      setRoleReadiness(readiness);
      setResources(resList);

      const foundProg = progressList.find(p => p.skillName.toLowerCase() === activeSkill.toLowerCase());
      setSkillProgress(foundProg || {
        employeeId: activeEmployeeId,
        skillName: activeSkill,
        currentLevel: 30,
        targetLevel: 85,
        lessonsCompleted: 2,
        totalLessons: lp.topics.length,
        assessmentScore: 65,
        attempts: 1,
        masteryStatus: 'LEARNING'
      });

      if (teach.practiceStarterCode) {
        setUserCode(teach.practiceStarterCode);
      }
    } catch (e) {
      console.error(e);
      setProfileIncomplete(true);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCareerReport = async () => {
    try {
      setGeneratingReport(true);
      const rep = await apiService.generateCareerReport(activeEmployeeId, targetRoleParam);
      setGeneratedReportUrl(rep.downloadUrl);
      setTimeout(() => {
        window.open(rep.downloadUrl, '_blank');
      }, 500);
    } catch (e) {
      console.error(e);
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleSelectTopic = async (topic: LessonTopic) => {
    try {
      setSelectedTopic(topic);
      setEvaluation(null);
      setReteachData(null);
      setQuizResult(null);
      setActiveTab('lesson');
      
      const teach = await apiService.teachTopic(activeEmployeeId, activeSkill, topic.id);
      setTeachingContent(teach);
      const practice = await apiService.generatePracticeTask(activeEmployeeId, activeSkill, topic.title);
      setPracticeTask(practice);
      if (teach.practiceStarterCode) {
        setUserCode(teach.practiceStarterCode);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmitPractice = async () => {
    if (!practiceTask) return;
    try {
      setIsEvaluating(true);
      const res = await apiService.evaluateAnswer({
        employeeId: activeEmployeeId,
        skillName: activeSkill,
        topic: selectedTopic?.title || 'Fundamentals',
        taskPrompt: practiceTask.prompt,
        solutionText: userCode,
        codeSnippet: userCode
      });
      setEvaluation(res);

      if (res.recommendedAction === 'reteach') {
        // Automatically trigger AI re-teaching generator
        const ret = await apiService.reteachConcept({
          employeeId: activeEmployeeId,
          skillName: activeSkill,
          topic: selectedTopic?.title || 'Fundamentals',
          weakConcept: res.weakConcept || 'Port Mapping Order',
          previousMistake: userCode
        });
        setReteachData(ret);
      } else {
        // Refresh readiness & progress
        const readiness = await apiService.getRoleReadiness(activeEmployeeId, targetRoleParam);
        setRoleReadiness(readiness);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleStartQuiz = async () => {
    try {
      setQuizResult(null);
      setQuizAnswers({});
      const q = await apiService.generateQuiz(activeEmployeeId, activeSkill, selectedTopic?.title || 'Fundamentals', 3);
      setQuiz(q);
      setShowQuizModal(true);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!quiz) return;
    try {
      setIsSubmittingQuiz(true);
      const result = await apiService.evaluateQuiz({
        employeeId: activeEmployeeId,
        skillName: activeSkill,
        topic: selectedTopic?.title || 'Fundamentals',
        answers: quizAnswers
      });
      setQuizResult(result);

      // Refresh readiness upon quiz completion
      const [readiness, progressList] = await Promise.all([
        apiService.getRoleReadiness(activeEmployeeId, targetRoleParam),
        apiService.getSkillProgress(activeEmployeeId)
      ]);
      setRoleReadiness(readiness);
      const foundProg = progressList.find(p => p.skillName.toLowerCase() === activeSkill.toLowerCase());
      if (foundProg) setSkillProgress(foundProg);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmittingQuiz(false);
    }
  };

  const handleSubmitProject = async () => {
    try {
      const res = await apiService.evaluateProjectSubmission({
        employeeId: activeEmployeeId,
        skillName: activeSkill,
        projectTitle,
        codeSnippet: projectCode,
        explanation: 'Docker multi-stage container deployment for FastAPI prediction service'
      });
      setProjectResult(res);
      const readiness = await apiService.getRoleReadiness(activeEmployeeId, targetRoleParam);
      setRoleReadiness(readiness);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-3">
          <Sparkles className="w-8 h-8 text-cyan-400 animate-spin" />
          <p className="text-xs text-slate-400">Loading AI Mentor Learning Room...</p>
        </div>
      </div>
    );
  }

  if (profileIncomplete || !learningPath) {
    return (
      <div className="space-y-6 pb-12">
        <div className="relative rounded-3xl glass-panel p-8 sm:p-12 border border-cyan-500/30 overflow-hidden shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mx-auto shadow-lg shadow-cyan-500/20">
            <GraduationCap className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-xl mx-auto">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              AI Mentor Requires Verified Profile
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Your AI Technical Teacher builds personalized pedagogical curriculums and interactive code labs tailored to your verified competencies. Upload your credentials to begin learning.
            </p>
          </div>

          <div>
            <button
              onClick={() => setIsWizardOpen(true)}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-xl shadow-cyan-500/30 transition transform hover:scale-[1.02] active:scale-[0.98] inline-flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload Certificate / Resume
            </button>
          </div>
        </div>

        <DocumentVerificationWizard
          isOpen={isWizardOpen}
          onClose={() => setIsWizardOpen(false)}
          onVerified={async () => {
            await refreshProfile();
            loadLearningRoom();
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner Header */}
      <div className="rounded-3xl glass-panel p-6 border border-cyan-500/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-cyan-400 mb-1">
              <GraduationCap className="w-4 h-4" />
              <span>Personal Technical AI Teacher</span>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-2xl font-extrabold text-white tracking-tight">
                TalentIQ AI Mentor • Learning Room
              </h2>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                Skill: {activeSkill}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Target Role Alignment: <strong className="text-white">{roleReadiness?.targetRoleTitle || 'Machine Learning Engineer'}</strong> • Pedagogical loop: Explain → Demonstrate → Practice → Evaluate → Re-teach → Master.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowTutorChat(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold flex items-center space-x-2 shadow-glow-cyan transition-all active:scale-95"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Ask AI Mentor Tutor</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3-COLUMN AI MENTOR LEARNING ROOM (Section 17 Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ========================================================= */}
        {/* LEFT COLUMN: Structured Learning Path (3 Cols)           */}
        {/* ========================================================= */}
        <div className="lg:col-span-3 space-y-4">
          <div className="rounded-2xl glass-panel p-4 border border-slate-800">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2 text-xs font-bold text-white uppercase tracking-wider">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <span>Learning Path</span>
              </div>
              <span className="text-[10px] font-mono text-cyan-300">
                {learningPath?.topics.length || 7} Topics
              </span>
            </div>

            <div className="space-y-1.5">
              {learningPath?.topics.map((t, idx) => {
                const isSelected = selectedTopic?.id === t.id;
                const isCompleted = idx < (skillProgress?.lessonsCompleted || 0);

                return (
                  <button
                    key={t.id}
                    onClick={() => handleSelectTopic(t)}
                    className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start space-x-2.5 ${
                      isSelected
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-glow-cyan'
                        : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300 border border-slate-800/80'
                    }`}
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : isSelected ? (
                        <CircleDot className="w-4 h-4 text-cyan-400 animate-pulse" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-600 flex items-center justify-center text-[9px] text-slate-500 font-mono">
                          {idx + 1}
                        </div>
                      )}
                    </div>

                    <div className="overflow-hidden">
                      <p className="text-xs font-semibold truncate leading-tight">{t.title}</p>
                      <span className="text-[10px] text-slate-400">{t.estimatedMinutes} mins</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* CENTER COLUMN: AI Teacher Stage & Mission (6 Cols)        */}
        {/* ========================================================= */}
        <div className="lg:col-span-6 space-y-4">
          {/* 🎯 MISSION BANNER: 9-STEP PROGRESSION */}
          <div className="rounded-2xl glass-panel p-4 border border-cyan-500/40 bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950/40 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shrink-0">
                  MISSION DIRECTIVE
                </span>
                <h3 className="text-sm font-extrabold text-white">
                  Become Job-Ready in {activeSkill}
                </h3>
              </div>
              <div className="w-full sm:w-auto shrink-0 flex items-center justify-end">
                <button
                  onClick={handleGenerateCareerReport}
                  disabled={generatingReport}
                  className="w-full sm:w-auto px-3.5 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all shadow-sm active:scale-95"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{generatingReport ? 'Generating...' : 'Download S3 Career Plan'}</span>
                </button>
              </div>
            </div>

            {/* 9 Interactive Steps Responsive Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-5 xl:grid-cols-9 gap-2 pt-1 w-full">
              {/* 1. Learn */}
              <button
                onClick={() => setActiveTab('resources')}
                className={`min-w-0 w-full min-h-[54px] p-2 rounded-xl text-center border transition-all flex flex-col items-center justify-center active:scale-95 ${
                  activeTab === 'resources'
                    ? 'bg-cyan-500/25 text-cyan-200 border-cyan-400 shadow-glow-cyan'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                <span className="text-sm leading-none mb-1">📚</span>
                <span className="text-[11px] font-semibold leading-tight break-words text-center w-full">1. Learn</span>
              </button>

              {/* 2. AI Teacher */}
              <button
                onClick={() => setActiveTab('lesson')}
                className={`min-w-0 w-full min-h-[54px] p-2 rounded-xl text-center border transition-all flex flex-col items-center justify-center active:scale-95 ${
                  activeTab === 'lesson'
                    ? 'bg-cyan-500/25 text-cyan-200 border-cyan-400 shadow-glow-cyan'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                <span className="text-sm leading-none mb-1">🤖</span>
                <span className="text-[11px] font-semibold leading-tight break-words text-center w-full">2. AI Teacher</span>
              </button>

              {/* 3. Practice */}
              <button
                onClick={() => setActiveTab('practice')}
                className={`min-w-0 w-full min-h-[54px] p-2 rounded-xl text-center border transition-all flex flex-col items-center justify-center active:scale-95 ${
                  activeTab === 'practice'
                    ? 'bg-purple-500/25 text-purple-200 border-purple-400 shadow-glow-purple'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                <span className="text-sm leading-none mb-1">🧪</span>
                <span className="text-[11px] font-semibold leading-tight break-words text-center w-full">3. Practice</span>
              </button>

              {/* 4. Quiz */}
              <button
                onClick={handleStartQuiz}
                className={`min-w-0 w-full min-h-[54px] p-2 rounded-xl text-center border transition-all flex flex-col items-center justify-center active:scale-95 ${
                  quizResult?.passed
                    ? 'bg-emerald-500/25 text-emerald-200 border-emerald-400 shadow-glow-emerald'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-800 hover:border-amber-400/40'
                }`}
              >
                <span className="text-sm leading-none mb-1">📝</span>
                <span className="text-[11px] font-semibold leading-tight break-words text-center w-full">4. Quiz</span>
              </button>

              {/* 5. Project */}
              <button
                onClick={() => setActiveTab('project')}
                className={`min-w-0 w-full min-h-[54px] p-2 rounded-xl text-center border transition-all flex flex-col items-center justify-center active:scale-95 ${
                  activeTab === 'project'
                    ? 'bg-emerald-500/25 text-emerald-200 border-emerald-400 shadow-glow-emerald'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                <span className="text-sm leading-none mb-1">💻</span>
                <span className="text-[11px] font-semibold leading-tight break-words text-center w-full">5. Project</span>
              </button>

              {/* 6. Evaluation */}
              <button
                onClick={() => setActiveTab('practice')}
                className={`min-w-0 w-full min-h-[54px] p-2 rounded-xl text-center border transition-all flex flex-col items-center justify-center active:scale-95 ${
                  evaluation
                    ? 'bg-blue-500/25 text-blue-200 border-blue-400 shadow-sm'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-800 hover:border-cyan-400/40'
                }`}
              >
                <span className="text-sm leading-none mb-1">🔍</span>
                <span className="text-[11px] font-semibold leading-tight break-words text-center w-full">6. Evaluation</span>
              </button>

              {/* 7. Re-teach */}
              <button
                onClick={() => {
                  if (reteachData) {
                    setActiveTab('practice');
                  } else {
                    setUserCode('docker run -d -p 8000:5000 --name churn_predictor retention_model:v1');
                    setActiveTab('practice');
                  }
                }}
                className={`min-w-0 w-full min-h-[54px] p-2 rounded-xl text-center border transition-all flex flex-col items-center justify-center active:scale-95 ${
                  reteachData
                    ? 'bg-amber-500/25 text-amber-200 border-amber-400 shadow-glow-amber'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-800 hover:border-amber-400/40'
                }`}
              >
                <span className="text-sm leading-none mb-1">🔄</span>
                <span className="text-[11px] font-semibold leading-tight break-words text-center w-full">7. Re-teach</span>
              </button>

              {/* 8. Mastery */}
              <button
                onClick={handleClaimCertificate}
                className="min-w-0 w-full min-h-[54px] p-2 rounded-xl text-center border transition-all flex flex-col items-center justify-center active:scale-95 bg-emerald-500/25 hover:bg-emerald-500/35 text-emerald-200 border-emerald-400 shadow-glow-emerald cursor-pointer"
              >
                <span className="text-sm leading-none mb-1">🏆</span>
                <span className="text-[11px] font-bold leading-tight break-words text-center w-full">8. Certificate</span>
              </button>


              {/* 9. Role Match */}
              <button
                onClick={() => navigate('/roles')}
                className="min-w-0 w-full min-h-[54px] p-2 rounded-xl text-center border bg-slate-900/80 hover:bg-slate-800 text-cyan-300 border-slate-800 hover:border-cyan-400 transition-all flex flex-col items-center justify-center active:scale-95"
              >
                <span className="text-sm leading-none mb-1">🚀</span>
                <span className="text-[11px] font-semibold leading-tight break-words text-center w-full">9. Role Match</span>
              </button>
            </div>
          </div>

          {/* Stage Tabs (Learning Journey) */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 w-full">
            <button
              onClick={() => setActiveTab('resources')}
              className={`w-full min-h-[46px] py-2.5 px-3 rounded-xl flex items-center justify-center space-x-2 text-xs font-semibold transition-all min-w-0 active:scale-95 ${
                activeTab === 'resources'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-glow-cyan'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <BookOpen className="w-4 h-4 shrink-0" />
              <span className="truncate leading-tight">1. Verified Docs</span>
            </button>
            <button
              onClick={() => setActiveTab('lesson')}
              className={`w-full min-h-[46px] py-2.5 px-3 rounded-xl flex items-center justify-center space-x-2 text-xs font-semibold transition-all min-w-0 active:scale-95 ${
                activeTab === 'lesson'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-glow-cyan'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <Sparkles className="w-4 h-4 shrink-0" />
              <span className="truncate leading-tight">2. AI Teacher</span>
            </button>
            <button
              onClick={() => setActiveTab('practice')}
              className={`w-full min-h-[46px] py-2.5 px-3 rounded-xl flex items-center justify-center space-x-2 text-xs font-semibold transition-all min-w-0 active:scale-95 ${
                activeTab === 'practice'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-glow-purple'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <Terminal className="w-4 h-4 shrink-0" />
              <span className="truncate leading-tight">3. Hands-on Practice</span>
            </button>
            <button
              onClick={() => setActiveTab('project')}
              className={`w-full min-h-[46px] py-2.5 px-3 rounded-xl flex items-center justify-center space-x-2 text-xs font-semibold transition-all min-w-0 active:scale-95 ${
                activeTab === 'project'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-glow-emerald'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <FolderGit2 className="w-4 h-4 shrink-0" />
              <span className="truncate leading-tight">4. Project Evidence</span>
            </button>
          </div>

          {/* TAB 0: VERIFIED LEARNING RESOURCES */}
          {activeTab === 'resources' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl glass-panel p-6 border border-slate-800 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Verified {activeSkill} Learning Curriculum ({resources.length})
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-cyan-300">Audited Resources</span>
              </div>

              <div className="space-y-3">
                {resources.map((res, rIdx) => (
                  <div key={rIdx} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 hover:border-cyan-500/30 transition-all">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-xs font-bold text-white">{res.title}</h4>
                        <span className="text-[10px] text-cyan-300 font-mono">{res.provider} • {res.estimated_time}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[9px] bg-slate-800 text-slate-300 font-mono uppercase">
                        {res.resource_type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{res.description}</p>
                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">Difficulty: <strong className="text-cyan-300">{res.difficulty}</strong></span>
                      <a
                        href={res.url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[11px] font-semibold flex items-center space-x-1"
                      >
                        <span>Open Resource</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => setActiveTab('lesson')}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-glow-cyan"
                >
                  <span>Proceed to AI Teacher Lesson</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* TAB 1: AI LESSON & DEMONSTRATION */}
          {activeTab === 'lesson' && teachingContent && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl glass-panel p-6 border border-slate-800 space-y-5"
            >
              <div>
                <div className="flex items-center space-x-2 text-[10px] font-mono text-cyan-400 uppercase tracking-wider mb-1">
                  <span>Topic {selectedTopic?.sequence || 1} • {teachingContent.level}</span>
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">
                  {teachingContent.topic}
                </h3>
              </div>

              {/* Step 1: Explain */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-200 leading-relaxed space-y-2">
                <div className="flex items-center space-x-1.5 text-cyan-300 font-semibold text-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>STEP 1 — Explain</span>
                </div>
                <p>{teachingContent.explanation}</p>
                {teachingContent.analogy && (
                  <div className="p-2.5 rounded-lg bg-cyan-950/30 border border-cyan-800/40 text-[11px] text-cyan-200 italic mt-2">
                    💡 <strong>Analogy:</strong> {teachingContent.analogy}
                  </div>
                )}
              </div>

              {/* Step 2 & 3: Example & Demonstrate */}
              <div className="space-y-3">
                <div className="flex items-center space-x-1.5 text-purple-300 font-semibold text-xs">
                  <Code2 className="w-3.5 h-3.5" />
                  <span>STEP 2 & 3 — Demonstrate in Action</span>
                </div>

                {teachingContent.codeSnippet && (
                  <div className="p-3.5 rounded-xl bg-[#090d18] border border-slate-800 font-mono text-xs text-cyan-300 overflow-x-auto">
                    <pre>{teachingContent.codeSnippet}</pre>
                  </div>
                )}

                <div className="space-y-1.5 pt-1">
                  {teachingContent.stepByStepDemo.map((step, sIdx) => (
                    <div key={sIdx} className="flex items-start space-x-2 text-xs text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0" />
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={handleStartQuiz}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                >
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>Take Knowledge Quiz</span>
                </button>

                <button
                  onClick={() => setActiveTab('practice')}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-glow-purple transition-all"
                >
                  <span>Start Practice Task</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* TAB 2: HANDS-ON PRACTICE & EVALUATION */}
          {activeTab === 'practice' && practiceTask && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Practice Task Card */}
              <div className="rounded-2xl glass-panel p-5 border border-purple-500/30 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Terminal className="w-4 h-4 text-purple-400" />
                    <h4 className="text-sm font-bold text-white">
                      Practice Challenge: {practiceTask.topic}
                    </h4>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-purple-500/10 text-purple-300 border border-purple-500/20">
                    {practiceTask.difficulty}
                  </span>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed font-medium">
                  {practiceTask.prompt}
                </p>

                {/* Instructions */}
                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Requirements Checklist
                  </span>
                  {practiceTask.instructions.map((inst, i) => (
                    <div key={i} className="flex items-center space-x-2 text-[11px] text-slate-300">
                      <span className="w-1 h-1 rounded-full bg-cyan-400" />
                      <span>{inst}</span>
                    </div>
                  ))}
                </div>

                {/* Code Editor Sandbox */}
                <div>
                  <div className="flex items-center justify-between mb-1 text-[11px] text-slate-400">
                    <span>Solution Terminal Editor</span>
                    <button
                      onClick={() => setUserCode('docker run -d -p 8000:5000 --name churn_predictor retention_model:v1')}
                      className="text-amber-400 hover:underline text-[10px]"
                      title="Simulate common student mistake to test AI Re-teaching engine"
                    >
                      ⚡ Simulate Mistake (Test Re-teaching)
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    value={userCode}
                    onChange={(e) => setUserCode(e.target.value)}
                    className="w-full bg-[#080c16] border border-slate-700 focus:border-cyan-500 rounded-xl p-3 font-mono text-xs text-cyan-300 focus:outline-none focus:ring-1 focus:ring-cyan-500 resize-none"
                    placeholder="Type your command or implementation..."
                  />
                </div>

                {/* Submit Action */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => setUserCode('docker run -d -p 5000:8000 --name churn_predictor retention_model:v1')}
                    className="text-[10px] text-slate-400 hover:text-white"
                  >
                    Reset Ideal Solution
                  </button>

                  <button
                    onClick={handleSubmitPractice}
                    disabled={isEvaluating || !userCode.trim()}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center space-x-2 shadow-glow-cyan transition-all"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${isEvaluating ? 'animate-spin' : ''}`} />
                    <span>{isEvaluating ? 'AI is Evaluating...' : 'Submit for AI Evaluation'}</span>
                  </button>
                </div>
              </div>

              {/* EVALUATION FEEDBACK CARD */}
              {evaluation && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`rounded-2xl glass-panel p-5 border ${
                    evaluation.isCorrect ? 'border-emerald-500/40' : 'border-amber-500/40'
                  } space-y-4`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {evaluation.isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-amber-400" />
                      )}
                      <div>
                        <h4 className="text-sm font-bold text-white">
                          Evaluation: {evaluation.status}
                        </h4>
                        <span className="text-[10px] text-slate-400">
                          Score: {evaluation.score}% • Action: {evaluation.recommendedAction}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 text-xs font-mono">
                      <div className="text-right">
                        <span className="text-[9px] text-slate-500 block">Understanding</span>
                        <span className="text-cyan-300 font-bold">{evaluation.technicalUnderstanding}%</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-slate-500 block">Implementation</span>
                        <span className="text-purple-300 font-bold">{evaluation.implementationQuality}%</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-200 leading-relaxed bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    {evaluation.detailedFeedback}
                  </p>

                  {/* CRITICAL FEATURE: AI RE-TEACHING PANEL IF MISTAKE */}
                  {reteachData && (
                    <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/40 to-slate-900 border border-amber-500/40 space-y-3">
                      <div className="flex items-center space-x-2 text-xs font-bold text-amber-300">
                        <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
                        <span>AI Re-Teaching: {reteachData.weakConcept}</span>
                      </div>

                      <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line">
                        {reteachData.simplifiedExplanation}
                      </p>

                      <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-cyan-300 font-mono">
                        <pre>{reteachData.codeSnippet}</pre>
                      </div>

                      <div className="flex items-center justify-between pt-2 text-xs">
                        <span className="text-slate-400 text-[11px] italic">
                          "{reteachData.reassurance}"
                        </span>
                        <button
                          onClick={() => {
                            setUserCode('docker run -d -p 5000:8000 --name churn_predictor retention_model:v1');
                            setReteachData(null);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-semibold"
                        >
                          Apply Corrected Rule & Re-test
                        </button>
                      </div>
                    </div>
                  )}

                  {evaluation.isCorrect && (
                    <div className="flex justify-end">
                      <button
                        onClick={handleStartQuiz}
                        className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-semibold flex items-center space-x-1.5"
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>Proceed to Skill Mastery Quiz</span>
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}

          {/* TAB 3: PROJECT SUBMISSION */}
          {activeTab === 'project' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl glass-panel p-5 border border-emerald-500/30 space-y-4"
            >
              <div className="flex items-center space-x-2">
                <FolderGit2 className="w-4 h-4 text-emerald-400" />
                <h4 className="text-sm font-bold text-white">
                  Submit Production Project Evidence
                </h4>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Project Title</label>
                <input
                  type="text"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Dockerfile / Deployment Code Snippet</label>
                <textarea
                  rows={5}
                  value={projectCode}
                  onChange={(e) => setProjectCode(e.target.value)}
                  className="w-full bg-[#080c16] border border-slate-700 rounded-xl p-3 font-mono text-xs text-cyan-300 focus:outline-none"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSubmitProject}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-semibold shadow-glow-emerald"
                >
                  Submit Project for Review
                </button>
              </div>

              {projectResult && (
                <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-xs text-emerald-200">
                  <p className="font-bold mb-1">Project Score: {projectResult.score}% • Status: {projectResult.status}</p>
                  <p>{projectResult.detailedFeedback}</p>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: Live Mastery HUD & Role Readiness (3 Cols) */}
        {/* ========================================================= */}
        <div className="lg:col-span-3 space-y-4">
          {/* Skill Mastery State Card */}
          <div className="rounded-2xl glass-panel p-5 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Skill Mastery Status
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                skillProgress?.masteryStatus === 'MASTERED'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-glow-emerald'
                  : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              }`}>
                {skillProgress?.masteryStatus || 'LEARNING'}
              </span>
            </div>

            <div className="text-center py-2">
              <div className="text-3xl font-extrabold font-mono text-white mb-1">
                {skillProgress?.currentLevel || 30}%
              </div>
              <p className="text-[10px] text-slate-400">Verified Competency Proficiency</p>
            </div>

            {/* Mastery Progression Steps */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-[11px] text-slate-300">
                <span>Learning Curriculum</span>
                <span className="text-emerald-400 font-bold">✓ Active</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-300">
                <span>Hands-on Practice</span>
                <span className={evaluation?.isCorrect ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                  {evaluation?.isCorrect ? '✓ Complete' : '○ In Progress'}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-300">
                <span>Assessment Quiz</span>
                <span className={quizResult?.passed ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                  {quizResult?.passed ? '✓ 100% Passed' : '○ Pending'}
                </span>
              </div>
            </div>

            {/* Official Certificate Action Button */}
            <button
              onClick={handleClaimCertificate}
              disabled={generatingCert}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-600/20 hover:from-amber-500/30 hover:to-amber-600/30 border border-amber-500/50 text-amber-300 text-xs font-bold flex items-center justify-center space-x-2 shadow-lg shadow-amber-950/40 transition-all active:scale-95"
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span>{generatingCert ? 'Generating...' : '🏆 View Skill Certificate'}</span>
            </button>

          </div>

          {/* Target Role Readiness Card */}
          {roleReadiness && (
            <div className="rounded-2xl glass-panel p-5 border border-purple-500/30 space-y-3">
              <div className="flex items-center space-x-2 text-xs font-bold text-purple-300">
                <TrendingUp className="w-4 h-4" />
                <span>Target Role Readiness</span>
              </div>

              <div>
                <p className="text-xs font-bold text-white">{roleReadiness.targetRoleTitle}</p>
                <div className="text-2xl font-bold font-mono text-cyan-300 mt-1">
                  {roleReadiness.overallReadinessPercentage}%
                </div>
                <p className="text-[10px] text-slate-400">
                  {roleReadiness.masteredCount} of {roleReadiness.totalRequiredCount} skills mastered
                </p>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-cyan-400 to-purple-500 h-full rounded-full transition-all duration-700"
                  style={{ width: `${roleReadiness.overallReadinessPercentage}%` }}
                />
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
                <strong>Next Priority:</strong> {roleReadiness.nextBestSkillToLearn}
              </div>
            </div>
          )}

          {/* 1-on-1 AI Tutor Button */}
          <button
            onClick={() => setShowTutorChat(true)}
            className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-cyan-500/30 text-cyan-300 text-xs font-bold flex items-center justify-center space-x-2 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Open 1-on-1 AI Tutor Chat</span>
          </button>
        </div>
      </div>

      {/* INTERACTIVE QUIZ MODAL */}
      <AnimatePresence>
        {showQuizModal && quiz && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl rounded-3xl glass-panel p-6 border border-cyan-500/40 shadow-glow-cyan max-h-[90vh] overflow-y-auto space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-bold text-white">
                    {quiz.skillName} Knowledge Assessment
                  </h3>
                </div>
                <span className="text-xs font-mono text-cyan-300">{quiz.questions.length} Questions</span>
              </div>

              {!quizResult ? (
                <div className="space-y-4">
                  {quiz.questions.map((q, qIdx) => (
                    <div key={q.id} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5">
                      <p className="text-xs font-bold text-white">
                        {qIdx + 1}. {q.question}
                      </p>
                      <div className="space-y-1.5">
                        {q.options.map((opt) => (
                          <label
                            key={opt}
                            className={`flex items-center space-x-2 p-2.5 rounded-lg text-xs cursor-pointer transition-colors ${
                              quizAnswers[q.id] === opt
                                ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/40'
                                : 'bg-slate-950/60 text-slate-300 hover:bg-slate-800'
                            }`}
                          >
                            <input
                              type="radio"
                              name={q.id}
                              value={opt}
                              checked={quizAnswers[q.id] === opt}
                              onChange={() => setQuizAnswers({ ...quizAnswers, [q.id]: opt })}
                              className="hidden"
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}

                  <div className="flex justify-end space-x-3 pt-2">
                    <button
                      onClick={() => setShowQuizModal(false)}
                      className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmitQuiz}
                      disabled={isSubmittingQuiz || Object.keys(quizAnswers).length < quiz.questions.length}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold shadow-glow-cyan"
                    >
                      {isSubmittingQuiz ? 'Grading...' : 'Submit Quiz Answers'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className={`p-5 rounded-2xl ${quizResult.passed ? 'bg-emerald-950/40 border border-emerald-500/40' : 'bg-amber-950/40 border border-amber-500/40'} text-center space-y-2`}>
                    <div className="text-3xl font-extrabold font-mono text-white">
                      {quizResult.score}%
                    </div>
                    <h4 className="text-sm font-bold text-white">
                      {quizResult.passed ? '🎉 Assessment Passed • Skill Mastery Unlocked!' : '⚠️ Review Needed • Triggering AI Re-teaching'}
                    </h4>
                    <p className="text-xs text-slate-300 max-w-md mx-auto">{quizResult.detailedFeedback}</p>
                  </div>

                  <div className="space-y-2">
                    {quizResult.questionReview.map((rev, rIdx) => (
                      <div key={rIdx} className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white">{rev.question}</span>
                          <span className={rev.isCorrect ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                            {rev.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">{rev.explanation}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-center gap-2 pt-2">
                    {quizResult.passed && (
                      <button
                        onClick={() => {
                          setShowQuizModal(false);
                          handleClaimCertificate();
                        }}
                        className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-slate-950 font-bold text-xs flex items-center justify-center space-x-1.5 shadow-lg shadow-amber-500/30 active:scale-95"
                      >
                        <Award className="w-4 h-4" />
                        <span>🏆 View Official Skill Certificate</span>
                      </button>
                    )}
                    <button
                      onClick={() => setShowQuizModal(false)}
                      className="w-full sm:w-auto px-5 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-semibold"
                    >
                      Done & Update Dashboard
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 1-on-1 AI TUTOR CHAT MODAL */}
      <MentorChatModal
        isOpen={showTutorChat}
        onClose={() => setShowTutorChat(false)}
        employeeId={activeEmployeeId}
        skillName={activeSkill}
        currentTopic={selectedTopic?.title}
      />

      {/* OFFICIAL SKILL MASTERY CERTIFICATE MODAL */}
      <CertificateModal
        isOpen={showCertModal}
        onClose={() => setShowCertModal(false)}
        certificate={certificate}
      />
    </div>
  );
};

