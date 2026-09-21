import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Terminal,
  Play,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Code2,
  Send,
  Loader2,
  Award,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { RoleSimulationStartResponse, RoleSimulationTask, RoleSimulationEvaluation } from '../../types';

export const RoleSimulatorPage: React.FC = () => {
  const { activeEmployeeId } = useAuth();
  const [simulation, setSimulation] = useState<RoleSimulationStartResponse | null>(null);
  const [activeTaskIndex, setActiveTaskIndex] = useState(0);
  const [userSubmission, setUserSubmission] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<RoleSimulationEvaluation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    startSimulation();
  }, [activeEmployeeId]);

  const startSimulation = async () => {
    if (!activeEmployeeId) return;
    try {
      setLoading(true);
      const data = await apiService.startRoleSimulation(activeEmployeeId, 'role-ml-engineer');
      setSimulation(data);
      if (data?.tasks?.length) {
        setUserSubmission(data.tasks[0].starterCodeOrContext || '');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskSwitch = (idx: number) => {
    setActiveTaskIndex(idx);
    setEvaluation(null);
    if (simulation && simulation.tasks[idx]) {
      setUserSubmission(simulation.tasks[idx].starterCodeOrContext || '');
    }
  };

  const handleSubmit = async () => {
    if (!simulation || !userSubmission.trim()) return;
    const currentTask = simulation.tasks[activeTaskIndex];
    try {
      setEvaluating(true);
      const res = await apiService.evaluateRoleSimulation({
        simulationId: simulation.simulationId,
        employeeId: activeEmployeeId,
        roleId: simulation.roleId,
        taskId: currentTask.taskId,
        userSubmission,
        taskCategory: currentTask.category
      });
      setEvaluation(res);
    } catch (e) {
      console.error(e);
    } finally {
      setEvaluating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        <p className="text-xs text-slate-400">Initializing Role Simulator Workspace...</p>
      </div>
    );
  }

  if (!simulation) {
    return (
      <div className="rounded-3xl glass-panel p-8 text-center text-slate-400">
        Failed to load role simulation scenario.
      </div>
    );
  }

  const currentTask = simulation.tasks[activeTaskIndex];

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="relative rounded-3xl glass-panel p-6 sm:p-8 border border-cyan-500/30 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-cyan-400 mb-1">
              <Terminal className="w-4 h-4" />
              <span>Job-Ready Role Simulator • Practical Evaluation</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Simulating: {simulation.roleTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Solve real production tasks. TalentIQ evaluates technical correctness, efficiency, code quality, and practical problem solving.
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900 border border-slate-700">
            {simulation.tasks.map((t, idx) => (
              <button
                key={t.taskId}
                onClick={() => handleTaskSwitch(idx)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  activeTaskIndex === idx
                    ? 'bg-cyan-500 text-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Task {t.taskNumber}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Task Specification & Code Editor Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Task Description */}
        <div className="lg:col-span-5 rounded-3xl glass-panel p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              {currentTask.category} &bull; {currentTask.difficulty}
            </span>
            <span className="text-xs text-slate-400 font-mono">Task {activeTaskIndex + 1} of {simulation.totalTasks}</span>
          </div>

          <h3 className="text-lg font-bold text-white leading-snug">{currentTask.title}</h3>
          <p className="text-xs text-slate-300 leading-relaxed">{currentTask.scenarioDescription}</p>

          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs space-y-1.5">
            <span className="font-semibold text-cyan-300 block">Expected Deliverable:</span>
            <p className="text-slate-400 text-[11px] leading-relaxed">{currentTask.expectedDeliverables}</p>
          </div>

          {currentTask.hints.length > 0 && (
            <div className="p-3 rounded-2xl bg-purple-950/30 border border-purple-800/40 text-xs">
              <span className="font-semibold text-purple-300 block mb-1">Architecture Hint:</span>
              <ul className="list-disc list-inside text-slate-300 text-[11px] space-y-0.5">
                {currentTask.hints.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right: Code / Solution Editor */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-3xl glass-panel border border-slate-800 overflow-hidden">
            <div className="px-4 py-2.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <Code2 className="w-4 h-4 text-cyan-400" />
                <span className="font-mono text-slate-300 font-semibold">solution_workspace.py / query.sql</span>
              </div>
              <span className="text-[10px] text-slate-500">Live Editor</span>
            </div>

            <textarea
              rows={12}
              value={userSubmission}
              onChange={(e) => setUserSubmission(e.target.value)}
              className="w-full p-4 bg-[#080c18] font-mono text-xs text-cyan-100 placeholder-slate-600 focus:outline-none resize-none"
              placeholder="Write your technical implementation or architectural explanation here..."
            />

            <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Evaluated against enterprise production rubric</span>
              <button
                onClick={handleSubmit}
                disabled={evaluating || !userSubmission.trim()}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 transition flex items-center gap-2 disabled:opacity-50"
              >
                {evaluating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Evaluating Solution...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    <span>Run AI Evaluation</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* AI Evaluation Rubric Card */}
          {evaluation && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl glass-panel p-6 border border-cyan-500/40 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">Evaluation Score: {evaluation.overallScore}/100</h4>
                    <span className="text-xs font-semibold text-cyan-300 uppercase tracking-wider font-mono">
                      {evaluation.verdict}
                    </span>
                  </div>
                </div>
              </div>

              {/* Rubric Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Correctness</span>
                  <span className="font-bold text-white font-mono">{evaluation.correctnessScore}%</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Problem Solving</span>
                  <span className="font-bold text-white font-mono">{evaluation.problemSolvingScore}%</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Efficiency</span>
                  <span className="font-bold text-white font-mono">{evaluation.efficiencyScore}%</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Code Quality</span>
                  <span className="font-bold text-white font-mono">{evaluation.codeQualityScore}%</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Practical Ability</span>
                  <span className="font-bold text-white font-mono">{evaluation.practicalAbilityScore}%</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Tech Understanding</span>
                  <span className="font-bold text-white font-mono">{evaluation.technicalUnderstandingScore}%</span>
                </div>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                {evaluation.feedback}
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
