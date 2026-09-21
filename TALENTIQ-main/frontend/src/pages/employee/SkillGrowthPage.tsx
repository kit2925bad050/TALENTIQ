import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Award,
  ShieldCheck,
  CheckCircle2,
  Download,
  Sparkles,
  ArrowUpRight,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { SkillGrowthResponse } from '../../types';

export const SkillGrowthPage: React.FC = () => {
  const { activeEmployeeId, user } = useAuth();
  const [growthData, setGrowthData] = useState<SkillGrowthResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGrowth();
  }, [activeEmployeeId]);

  const loadGrowth = async () => {
    if (!activeEmployeeId) return;
    try {
      setLoading(true);
      const data = await apiService.getSkillGrowth(activeEmployeeId);
      setGrowthData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        <p className="text-xs text-slate-400">Loading Skill Growth & Verified Trajectory...</p>
      </div>
    );
  }

  if (!growthData || growthData.growthItems.length === 0) {
    return (
      <div className="rounded-3xl glass-panel p-8 sm:p-12 border border-cyan-500/30 text-center space-y-4">
        <TrendingUp className="w-12 h-12 text-cyan-400 mx-auto" />
        <h2 className="text-2xl font-bold text-white">No Growth Data Yet</h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          Complete learning modules, quizzes, and role simulations to populate your historical skill growth timeline.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="relative rounded-3xl glass-panel p-6 sm:p-8 border border-cyan-500/30 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-cyan-400 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span>Grounded Growth Tracking & Mastery</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Before / After Skill Growth
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Authentic performance delta between baseline assessments and latest verified competency evaluations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-center">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Average Delta</span>
              <span className="text-xl font-bold text-emerald-400 font-mono">+{growthData.averageDelta}%</span>
            </div>
            <div className="px-4 py-2 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-center">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Grown Skills</span>
              <span className="text-xl font-bold text-cyan-300 font-mono">{growthData.totalSkillsGrown}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Growth Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {growthData.growthItems.map((item) => (
          <div
            key={item.skillName}
            className="p-6 rounded-3xl glass-panel border border-slate-800 hover:border-cyan-500/30 transition space-y-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-base font-bold text-white">{item.skillName}</h4>
                <span className="text-[10px] text-slate-400 font-mono">Last Assessed: {item.lastAssessedAt}</span>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                +{item.delta}% Lift
              </span>
            </div>

            {/* Before vs After Visual Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Baseline Assessment</span>
                <span className="font-mono text-slate-400">{item.baselineScore}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-slate-500 rounded-full" style={{ width: `${item.baselineScore}%` }} />
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-cyan-300 font-semibold">Latest Verified Assessment</span>
                <span className="font-mono font-bold text-cyan-300">{item.latestScore}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full"
                  style={{ width: `${item.latestScore}%` }}
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
              <span>Status: <strong className="text-emerald-400">{item.masteryStatus}</strong></span>
              <span>{item.assessmentCount} Recorded Assessments</span>
            </div>
          </div>
        ))}
      </div>

      {/* Official Skill Mastery Credential */}
      {growthData.hasMasteryCredential && (
        <div className="rounded-3xl glass-panel p-6 sm:p-8 border border-cyan-400/50 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-4">
              <div className="p-4 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/40 shadow-glow-cyan shrink-0">
                <Award className="w-8 h-8" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest block mb-1">
                  Official Internal Certification
                </span>
                <h3 className="text-xl font-bold text-white">TalentIQ Skill Mastery Credential</h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Issued to <strong>{user?.name || 'Candidate'}</strong> &bull; Credential ID: <span className="font-mono text-cyan-300">{growthData.credentialId}</span>
                </p>
              </div>
            </div>

            <span className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold font-mono">
              Verified in S3 Ledger
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
