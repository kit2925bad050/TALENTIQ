import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Zap,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  BookOpen,
  HelpCircle,
  Loader2,
  RotateCcw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { StressTestResult } from '../../types';

export const SkillStressTestPage: React.FC = () => {
  const { activeEmployeeId } = useAuth();
  const navigate = useNavigate();
  const [selectedSkill, setSelectedSkill] = useState('Docker');
  const [currentLevel, setCurrentLevel] = useState(1);
  const [questionData, setQuestionData] = useState<any>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [result, setResult] = useState<StressTestResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLevelQuestion(currentLevel);
  }, [activeEmployeeId, selectedSkill, currentLevel]);

  const loadLevelQuestion = async (lvl: number) => {
    if (!activeEmployeeId) return;
    try {
      setLoading(true);
      setResult(null);
      setUserAnswer('');
      const data = await apiService.startSkillStressTest(activeEmployeeId, selectedSkill, lvl);
      setQuestionData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluate = async () => {
    if (!userAnswer.trim()) return;
    try {
      setEvaluating(true);
      const res = await apiService.evaluateSkillStressTest({
        employeeId: activeEmployeeId,
        skillName: selectedSkill,
        level: currentLevel,
        userAnswer
      });
      setResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="relative rounded-3xl glass-panel p-6 sm:p-8 border border-cyan-500/30 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-cyan-400 mb-1">
              <Zap className="w-4 h-4" />
              <span>5-Level Progressive Adaptive Challenge</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Skill Stress Test: {selectedSkill}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Progressively difficult production challenges that adapt dynamically based on your mastery evidence.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {['Docker', 'Python', 'FastAPI'].map((s) => (
              <button
                key={s}
                onClick={() => {
                  setSelectedSkill(s);
                  setCurrentLevel(1);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedSkill === s
                    ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/30'
                    : 'bg-slate-900 text-slate-300 border border-slate-700 hover:border-cyan-400'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Progress Levels Bar */}
      <div className="grid grid-cols-5 gap-2">
        {[1, 2, 3, 4, 5].map((lvl) => (
          <div
            key={lvl}
            onClick={() => setCurrentLevel(lvl)}
            className={`p-3 rounded-2xl border text-center cursor-pointer transition-all ${
              currentLevel === lvl
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-950/40'
                : lvl < currentLevel
                ? 'bg-slate-950/70 border-emerald-500/30 text-emerald-300'
                : 'bg-slate-950/40 border-slate-800 text-slate-500'
            }`}
          >
            <span className="text-[10px] uppercase font-bold tracking-wider block">Level {lvl}</span>
            <span className="text-xs font-semibold">
              {lvl === 1 ? 'Concept' : lvl === 2 ? 'Application' : lvl === 3 ? 'Problem' : lvl === 4 ? 'Scenario' : 'Advanced'}
            </span>
          </div>
        ))}
      </div>

      {/* Main Question & Answer Panel */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-3">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          <p className="text-xs text-slate-400">Synthesizing Level {currentLevel} Scenario...</p>
        </div>
      ) : questionData ? (
        <div className="rounded-3xl glass-panel p-6 sm:p-8 border border-slate-800 space-y-6">
          <div>
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest block mb-1">
              {questionData.levelTitle}
            </span>
            <h3 className="text-lg font-bold text-white leading-relaxed">{questionData.scenario}</h3>
          </div>

          {questionData.codeSnippet && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-300 overflow-x-auto">
              {questionData.codeSnippet}
            </div>
          )}

          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-300 block">Your Technical Solution & Reasoning:</label>
            <textarea
              rows={5}
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Explain the architectural mechanism, commands, or technical steps in detail..."
              className="w-full p-4 bg-slate-950/80 border border-slate-800 rounded-2xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-slate-500">Evaluates depth and identifies weak conceptual areas</span>
            <button
              onClick={handleEvaluate}
              disabled={evaluating || !userAnswer.trim()}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/30 transition disabled:opacity-50"
            >
              {evaluating ? 'Evaluating Answer...' : 'Submit Challenge'}
            </button>
          </div>

          {/* Result Card */}
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-6 rounded-2xl border space-y-4 ${
                result.passed
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {result.passed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-rose-400" />
                  )}
                  <h4 className="text-base font-bold text-white">
                    {result.passed ? 'Level Passed!' : 'Needs Conceptual Reinforcement'} &bull; {result.score}/100
                  </h4>
                </div>
                {result.nextLevel && (
                  <button
                    onClick={() => setCurrentLevel(result.nextLevel!)}
                    className="px-4 py-1.5 rounded-xl bg-emerald-500 text-black font-bold text-xs flex items-center gap-1.5 shadow-md"
                  >
                    <span>Proceed to Level {result.nextLevel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <p className="text-xs text-slate-200 leading-relaxed">{result.feedback}</p>

              {result.triggerAdaptiveTeacher && (
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-cyan-300 block">Trigger Adaptive AI Teacher</span>
                    <p className="text-[11px] text-slate-400">
                      Weak concept detected: <strong>{result.weakConceptDetected}</strong>. Learn step-by-step with real analogies.
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/mentor')}
                    className="px-4 py-2 rounded-xl bg-cyan-500 text-black font-bold text-xs flex items-center gap-1.5 shrink-0"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Open AI Teacher</span>
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </div>
      ) : null}
    </div>
  );
};
