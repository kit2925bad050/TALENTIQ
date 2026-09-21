import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  BrainCircuit,
  Award,
  Layers,
  Search,
  Loader2,
  Plus,
  X
} from 'lucide-react';
import { apiService } from '../../services/api';
import { TeamBuilderResponse, TeamBuilderCandidate } from '../../types';
import { UserAvatar } from '../../components/common/UserAvatar';

export const TeamBuilderPage: React.FC = () => {
  const [projectName, setProjectName] = useState('Enterprise Real-Time AI Fraud Shield');
  const [projectDescription, setProjectDescription] = useState('Construct high-throughput event streaming and anomaly detection pipeline with FastAPI, Docker, and XGBoost.');
  const [requiredSkills, setRequiredSkills] = useState<string[]>(['Python', 'Machine Learning', 'SQL', 'Docker', 'FastAPI']);
  const [newSkill, setNewSkill] = useState('');
  const [loading, setLoading] = useState(false);
  const [teamResult, setTeamResult] = useState<TeamBuilderResponse | null>(null);

  const handleBuildTeam = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!projectName.trim() || requiredSkills.length === 0) return;

    try {
      setLoading(true);
      const res = await apiService.buildTeam({
        projectName,
        projectDescription,
        requiredSkills
      });
      setTeamResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const addSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSkill.trim() && !requiredSkills.includes(newSkill.trim())) {
      setRequiredSkills([...requiredSkills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setRequiredSkills(requiredSkills.filter(s => s !== skill));
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="relative rounded-3xl glass-panel p-6 sm:p-8 border border-purple-500/30 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-purple-400 mb-1">
              <Users className="w-4 h-4" />
              <span>Neural Project Team Synthesis</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              HR Team Builder
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Assemble optimal cross-functional teams matching complex project specifications from verified talent records.
            </p>
          </div>
        </div>
      </div>

      {/* Project Input Form */}
      <div className="rounded-3xl glass-panel p-6 sm:p-8 border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white">Project Specification</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Project Name:</label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-400"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Required Skills:</label>
            <form onSubmit={addSkill} className="flex gap-2">
              <input
                type="text"
                placeholder="Add skill requirement..."
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-400"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl transition"
              >
                Add
              </button>
            </form>
          </div>
        </div>

        {/* Skill Chips */}
        <div className="flex flex-wrap gap-2 pt-1">
          {requiredSkills.map((s) => (
            <span
              key={s}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-semibold"
            >
              <span>{s}</span>
              <button onClick={() => removeSkill(s)} className="hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1">Project Description & Scope:</label>
          <textarea
            rows={2}
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-400 resize-none"
          />
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={() => handleBuildTeam()}
            disabled={loading}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-500/25 transition flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Searching Verified Talent Pool...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Synthesize Optimal Team</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Team Results */}
      {teamResult && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Completeness Banner */}
          <div className="p-6 rounded-3xl glass-panel border border-purple-500/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono font-bold text-purple-300 uppercase tracking-wider block mb-1">
                AI Team Completeness Score
              </span>
              <h3 className="text-2xl font-extrabold text-white">
                {teamResult.teamCompletenessScore}% Skill Coverage
              </h3>
              <p className="text-xs text-slate-300 mt-1">{teamResult.strategicInsights}</p>
            </div>
          </div>

          {/* Recommended Roster Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teamResult.recommendedTeam.map((cand) => (
              <div
                key={cand.employeeId}
                className="p-6 rounded-3xl glass-panel border border-slate-800 hover:border-purple-500/40 transition space-y-4"
              >
                <div className="flex items-start space-x-3.5">
                  <UserAvatar
                    name={cand.employeeName}
                    photoUrl={cand.profilePhotoUrl}
                    size="lg"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-bold text-white truncate">{cand.employeeName}</h4>
                      <span className="font-mono font-bold text-purple-300 text-sm">
                        {cand.matchPercentage}% Match
                      </span>
                    </div>
                    <p className="text-xs text-purple-200">{cand.designation} &bull; {cand.department}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Matching Verified Skills:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {cand.matchingSkills.map((s) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                  "{cand.recommendationReason}"
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};
