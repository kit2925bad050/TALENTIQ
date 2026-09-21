import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users,
  Award,
  Briefcase,
  AlertTriangle,
  TrendingUp,
  Sparkles,
  Search,
  Plus,
  Zap,
  ArrowRight
} from 'lucide-react';
import { apiService } from '../../services/api';
import { WorkforceAnalytics } from '../../types';
import { AnimatedCounter } from '../../components/common/AnimatedCounter';
import { AnalyticsCharts } from '../../components/admin/AnalyticsCharts';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<WorkforceAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await apiService.getWorkforceAnalytics();
      setAnalytics(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Sparkles className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  // Section 27: Empty Database Experience
  if (!analytics || analytics.totalEmployees === 0) {
    return (
      <div className="p-12 text-center rounded-3xl glass-panel border border-slate-800 space-y-4">
        <Users className="w-12 h-12 text-slate-500 mx-auto" />
        <h3 className="text-lg font-bold text-white">No workforce data available yet</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Your organization has not added talent or internal vacancy data yet.
        </p>
        <div className="flex justify-center space-x-3 pt-4">
          <button
            onClick={() => navigate('/admin/roles')}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-glow-purple flex items-center space-x-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Post New Role</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="rounded-3xl glass-panel p-6 sm:p-8 border border-purple-500/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-purple-400 mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Enterprise Workforce Intelligence</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Talent IQ Workforce Command Center
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Real-time talent density, transferable skills coverage, internal mobility velocity, and organizational skill gap forecasts.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/admin/employees')}
              className="px-4 py-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search Talent</span>
            </button>
            <button
              onClick={() => navigate('/admin/roles')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-glow-purple"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Post New Role</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards (Section 19: Total Employees, Tracked Skills, Internal Opportunities, Critical Skill Gaps) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Employees */}
        <div className="p-5 rounded-2xl glass-panel border border-slate-800 hover:border-cyan-500/30 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">Total Employees</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-white">
            <AnimatedCounter value={analytics.totalEmployees} />
          </div>
          <p className="text-[10px] text-cyan-400 mt-1">100% active AI profiles</p>
        </div>

        {/* Tracked Skills */}
        <div className="p-5 rounded-2xl glass-panel border border-slate-800 hover:border-purple-500/30 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">Tracked Skills</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-white">
            <AnimatedCounter value={analytics.trackedSkills} />
          </div>
          <p className="text-[10px] text-purple-400 mt-1">Core + Transferable catalog</p>
        </div>

        {/* Internal Opportunities */}
        <div className="p-5 rounded-2xl glass-panel border border-slate-800 hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">Internal Opportunities</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-white">
            <AnimatedCounter value={analytics.internalOpportunities} />
          </div>
          <p className="text-[10px] text-emerald-400 mt-1">Open internal positions</p>
        </div>

        {/* Critical Skill Gaps */}
        <div className="p-5 rounded-2xl glass-panel border border-slate-800 hover:border-rose-500/30 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">Critical Skill Gaps</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-rose-300">
            <AnimatedCounter value={analytics.criticalSkillGaps} />
          </div>
          <p className="text-[10px] text-rose-400 mt-1">High-demand deficits</p>
        </div>
      </div>

      {/* Recharts Analytics Charts */}
      <AnalyticsCharts analytics={analytics} />

      {/* Emerging Skill Shortage Intelligence (Section 21) */}
      <div className="rounded-2xl glass-panel p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Emerging Skill Shortages & Demand Discrepancies
            </h3>
          </div>
          <button
            onClick={() => navigate('/admin/analytics')}
            className="text-xs text-cyan-400 hover:underline font-semibold"
          >
            View Full Analysis
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analytics.skillShortages.map((shortage, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-amber-500/40 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-white">{shortage.skill}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/10 text-rose-400 border border-rose-500/30">
                  Deficit: -{shortage.deficit}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                {shortage.insight}
              </p>
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                <span>Required in <strong>{shortage.demandRoles}</strong> vacancies</span>
                <span>Available: <strong>{shortage.availableEmployees}</strong> employees</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
