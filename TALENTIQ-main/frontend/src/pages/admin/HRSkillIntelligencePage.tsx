import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  AlertTriangle,
  Users,
  Briefcase,
  Layers,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { apiService } from '../../services/api';
import { WorkforceAnalytics } from '../../types';

export const HRSkillIntelligencePage: React.FC = () => {
  const [analytics, setAnalytics] = useState<WorkforceAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIntelligence();
  }, []);

  const loadIntelligence = async () => {
    try {
      setLoading(true);
      const data = await apiService.getHRSkillIntelligence();
      setAnalytics(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
        <p className="text-xs text-slate-400">Aggregating Enterprise Skill Intelligence & Shortage Heatmaps...</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="rounded-3xl glass-panel p-8 text-center text-slate-400">
        No workforce intelligence data available.
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="relative rounded-3xl glass-panel p-6 sm:p-8 border border-purple-500/30 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-purple-400 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span>Enterprise Skill Shortage & Demand Heatmap</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Skill Intelligence & Workforce Analytics
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Real-time talent supply vs. organizational demand modeling to resolve internal hiring bottlenecks.
            </p>
          </div>
        </div>
      </div>

      {/* Top Level KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl glass-panel border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Verified Employees</span>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-white">{analytics.totalEmployees}</div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Tracked Skills</span>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-cyan-300">{analytics.trackedSkills}</div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Critical Skill Shortages</span>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-rose-400">{analytics.criticalSkillGaps}</div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Internal Opportunities</span>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-purple-300">{analytics.internalOpportunities}</div>
        </div>
      </div>

      {/* Critical Shortage Heatmap */}
      <div className="rounded-3xl glass-panel p-6 sm:p-8 border border-rose-500/30 shadow-xl space-y-4">
        <div className="flex items-center space-x-2 text-base font-bold text-white">
          <AlertTriangle className="w-5 h-5 text-rose-400" />
          <span>Critical Talent Deficit & Shortage Heatmap</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analytics.skillShortages.map((shortage) => (
            <div
              key={shortage.skill}
              className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white">{shortage.skill}</h4>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-300 border border-rose-500/30 font-mono">
                  Deficit: -{shortage.deficit}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{shortage.insight}</p>
              <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                <span>Required in {shortage.demandRoles} role(s)</span>
                <span>Available: {shortage.availableEmployees} employee(s)</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobility Trends */}
      <div className="rounded-3xl glass-panel p-6 sm:p-8 border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-purple-400" />
          <span>Internal Talent Mobility Trajectory (Monthly)</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {analytics.mobilityTrends.map((trend) => (
            <div key={trend.month} className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-center">
              <span className="text-xs font-bold text-purple-300 block mb-1">{trend.month}</span>
              <div className="text-lg font-bold font-mono text-white">{trend.internalMatches}</div>
              <span className="text-[10px] text-slate-400">Matches Generated</span>
              <div className="text-xs font-semibold text-emerald-400 mt-1">+{trend.transfersCompleted} Transferred</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
