import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  GitFork,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  BookOpen,
  TrendingUp,
  Layers,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { SkillGraphResponse } from '../../types';

export const SkillDependencyGraphPage: React.FC = () => {
  const { activeEmployeeId } = useAuth();
  const navigate = useNavigate();
  const [selectedTarget, setSelectedTarget] = useState('MLOps');
  const [graphData, setGraphData] = useState<SkillGraphResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGraph();
  }, [activeEmployeeId, selectedTarget]);

  const loadGraph = async () => {
    if (!activeEmployeeId) return;
    try {
      setLoading(true);
      const data = await apiService.getSkillDependencyGraph(activeEmployeeId, selectedTarget);
      setGraphData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
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
              <GitFork className="w-4 h-4" />
              <span>Prerequisite DAG Graph & Sequencing</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Skill Dependency Graph
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Deterministic prerequisite ordering that bridges capability gaps without skipping foundational concepts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {['MLOps', 'Docker'].map((tgt) => (
              <button
                key={tgt}
                onClick={() => setSelectedTarget(tgt)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedTarget === tgt
                    ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/30'
                    : 'bg-slate-900 text-slate-300 border border-slate-700 hover:border-cyan-400'
                }`}
              >
                Target: {tgt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-3">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          <p className="text-xs text-slate-400">Computing prerequisite DAG sequence...</p>
        </div>
      ) : graphData ? (
        <div className="space-y-6">
          {/* Summary KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl glass-panel border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400">Mastered Prerequisites</span>
                <p className="text-2xl font-bold text-emerald-400 font-mono mt-1">{graphData.masteredCount}</p>
              </div>
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            </div>

            <div className="p-5 rounded-2xl glass-panel border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400">Missing Gaps</span>
                <p className="text-2xl font-bold text-amber-400 font-mono mt-1">{graphData.missingCount}</p>
              </div>
              <AlertCircle className="w-6 h-6 text-amber-400" />
            </div>

            <div className="p-5 rounded-2xl glass-panel border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400">Optimal Learning Steps</span>
                <p className="text-2xl font-bold text-cyan-300 font-mono mt-1">{graphData.recommendedLearningSequence.length}</p>
              </div>
              <TrendingUp className="w-6 h-6 text-cyan-400" />
            </div>
          </div>

          {/* Flowchart Visualization */}
          <div className="rounded-3xl glass-panel p-6 sm:p-8 border border-slate-800 space-y-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Recommended Learning Sequence to Reach {graphData.targetSkill}</span>
            </h3>

            <div className="space-y-4">
              {graphData.nodes.map((node, idx) => {
                const isMastered = node.status === 'MASTERED';
                const isInProgress = node.status === 'IN_PROGRESS';

                return (
                  <div key={node.skillName} className="relative">
                    {idx < graphData.nodes.length - 1 && (
                      <div className="absolute left-6 top-14 bottom-0 w-0.5 bg-slate-800 -z-0" />
                    )}

                    <div
                      className={`relative z-10 p-5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                        isMastered
                          ? 'bg-slate-950/60 border-emerald-500/30'
                          : isInProgress
                          ? 'bg-cyan-950/30 border-cyan-500/50 shadow-md shadow-cyan-950/40'
                          : 'bg-slate-900/80 border-slate-800'
                      }`}
                    >
                      <div className="flex items-start space-x-4">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                            isMastered
                              ? 'bg-emerald-500 text-black'
                              : isInProgress
                              ? 'bg-cyan-500 text-black animate-pulse'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          {node.recommendedOrder}
                        </div>

                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="text-base font-bold text-white">{node.skillName}</h4>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                isMastered
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : isInProgress
                                  ? 'bg-cyan-500/20 text-cyan-300'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {node.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 mt-1">{node.description}</p>
                          {node.prerequisites.length > 0 && (
                            <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-400">
                              <span>Prerequisites:</span>
                              {node.prerequisites.map((p) => (
                                <span key={p} className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
                                  {p}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                          <span className="text-[10px] text-slate-400 block">Proficiency</span>
                          <span className="font-mono font-bold text-sm text-white">{node.proficiency}%</span>
                        </div>
                        {!isMastered && (
                          <button
                            onClick={() => navigate('/mentor')}
                            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs shadow-md shadow-cyan-500/20 transition flex items-center gap-1.5"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>Learn Now</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
