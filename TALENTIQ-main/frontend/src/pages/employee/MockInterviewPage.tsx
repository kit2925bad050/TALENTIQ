import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Mic,
  MessageSquare,
  Award,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  BookOpen,
  Sparkles,
  Loader2,
  Send,
  RotateCcw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { MockInterviewQuestion, MockInterviewEvaluationResponse } from '../../types';

export const MockInterviewPage: React.FC = () => {
  const { activeEmployeeId } = useAuth();
  const navigate = useNavigate();
  const [roleTitle, setRoleTitle] = useState('Machine Learning Engineer');
  const [interviewData, setInterviewData] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<MockInterviewEvaluationResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    startInterview();
  }, [activeEmployeeId, roleTitle]);

  const startInterview = async () => {
    if (!activeEmployeeId) return;
    try {
      setLoading(true);
      setCurrentQuestionIndex(0);
      setEvaluation(null);
      setUserAnswer('');
      const data = await apiService.startMockInterview(activeEmployeeId, roleTitle);
      setInterviewData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async () => {
    if (!userAnswer.trim() || !interviewData) return;
    const currentQ: MockInterviewQuestion = interviewData.allQuestions[currentQuestionIndex];

    try {
      setEvaluating(true);
      const res = await apiService.evaluateMockInterviewAnswer({
        interviewId: interviewData.interviewId,
        employeeId: activeEmployeeId,
        roleTitle,
        questionId: currentQ.questionId,
        questionNumber: currentQ.questionNumber,
        userAnswer
      });
      setEvaluation(res);
    } catch (e) {
      console.error(e);
    } finally {
      setEvaluating(false);
    }
  };

  const handleNextQuestion = () => {
    if (!interviewData) return;
    if (currentQuestionIndex < interviewData.allQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setEvaluation(null);
      setUserAnswer('');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        <p className="text-xs text-slate-400">Initializing AI Mock Interviewer...</p>
      </div>
    );
  }

  if (!interviewData) {
    return (
      <div className="rounded-3xl glass-panel p-8 text-center text-slate-400">
        Failed to initialize mock interview.
      </div>
    );
  }

  const currentQ: MockInterviewQuestion = interviewData.allQuestions[currentQuestionIndex];

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="relative rounded-3xl glass-panel p-6 sm:p-8 border border-cyan-500/30 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-cyan-400 mb-1">
              <MessageSquare className="w-4 h-4" />
              <span>Realistic On-the-Job Mock Assessment</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              AI Mock Interview: {roleTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              One-on-one adaptive technical and scenario questions evaluated on technical accuracy, relevance, and reasoning.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-cyan-300 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-xl">
              Question {currentQuestionIndex + 1} of {interviewData.totalQuestions}
            </span>
          </div>
        </div>
      </div>

      {/* Main Question & Answer Interface */}
      <div className="rounded-3xl glass-panel p-6 sm:p-8 border border-slate-800 space-y-6">
        <div className="flex items-center justify-between">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-purple-500/10 text-purple-300 border border-purple-500/30">
            {currentQ.category} Round
          </span>
          <span className="text-xs text-slate-400 font-mono">Question ID: {currentQ.questionId}</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800">
          <h3 className="text-lg font-bold text-white leading-relaxed">{currentQ.question}</h3>
          {currentQ.context && (
            <p className="text-xs text-cyan-300 mt-2">
              💡 <strong>Interviewer Context:</strong> {currentQ.context}
            </p>
          )}
        </div>

        <div className="space-y-3">
          <label className="text-xs font-semibold text-slate-300 block">Your Response:</label>
          <textarea
            rows={6}
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Type your structured answer (STAR methodology or technical breakdown)..."
            className="w-full p-4 bg-slate-950/80 border border-slate-800 rounded-2xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[11px] text-slate-500">Evaluates clarity, domain reasoning, and completeness</span>
          <button
            onClick={handleAnswer}
            disabled={evaluating || !userAnswer.trim()}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/30 transition flex items-center gap-2 disabled:opacity-50"
          >
            {evaluating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analyzing Response...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit Answer</span>
              </>
            )}
          </button>
        </div>

        {/* Evaluation Output */}
        {evaluation && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl bg-slate-950/90 border border-cyan-500/40 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Award className="w-5 h-5 text-cyan-400" />
                <h4 className="text-base font-bold text-white">Score: {evaluation.overallScore}/100</h4>
              </div>
              {!evaluation.isInterviewFinished ? (
                <button
                  onClick={handleNextQuestion}
                  className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs flex items-center gap-1.5 transition"
                >
                  <span>Next Question</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <span className="text-xs font-bold text-emerald-400 font-mono">Interview Complete!</span>
              )}
            </div>

            {/* Rubrics */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Accuracy</span>
                <span className="font-bold text-white font-mono">{evaluation.technicalAccuracyScore}%</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Relevance</span>
                <span className="font-bold text-white font-mono">{evaluation.relevanceScore}%</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Reasoning</span>
                <span className="font-bold text-white font-mono">{evaluation.reasoningScore}%</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Clarity</span>
                <span className="font-bold text-white font-mono">{evaluation.clarityScore}%</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Completeness</span>
                <span className="font-bold text-white font-mono">{evaluation.completenessScore}%</span>
              </div>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed">{evaluation.feedback}</p>

            {evaluation.learnConceptTrigger && (
              <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-800/50 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-purple-300 block">Reinforce Weak Spot with AI Teacher</span>
                  <p className="text-[11px] text-slate-400">{evaluation.learnConceptTrigger}</p>
                </div>
                <button
                  onClick={() => navigate('/mentor')}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shrink-0"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Learn Concept</span>
                </button>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};
