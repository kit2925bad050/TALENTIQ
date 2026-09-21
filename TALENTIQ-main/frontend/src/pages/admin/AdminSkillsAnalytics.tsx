import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Zap,
  Award,
  AlertTriangle,
  Sparkles,
  BarChart2,
  ShieldAlert
} from 'lucide-react';
import { apiService } from '../../services/api';
import { WorkforceAnalytics } from '../../types';
import { AnalyticsCharts } from '../../components/admin/AnalyticsCharts';

export const AdminSkillsAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<WorkforceAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
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

  if (loading || !analytics) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Sparkles className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="rounded-3xl glass-panel p-6 sm:p-8 border border-slate-800 relative overflow-hidden">
        <div className="flex items-center space-x-2 text-xs font-semibold text-cyan-400 mb-1">
          <TrendingUp className="w-4 h-4" />
          <span>Macro Skill Intelligence & Strategic Forecasting</span>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Emerging Skills & Organizational Deficit Intelligence
        </h2>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl">
          Automated cross-referencing between open role requirements and internal talent supply to identify critical capability bottlenecks before they affect delivery.
        </p>
      </div>

      {/* Strategic Shortages Feed (Section 21) */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <span>Critical Skill Shortage Warnings</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analytics.skillShortages.map((shortage, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl glass-panel border border-amber-500/30 space-y-3 relative overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase font-mono font-bold text-amber-400">
                    High Demand Deficit
                  </span>
                  <h4 className="text-base font-bold text-white mt-0.5">{shortage.skill}</h4>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-rose-500/10 border border-rose-500/30 text-rose-300">
                  Deficit: -{shortage.deficit}
                </span>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                {shortage.insight}
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 pt-1">
                <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] block">Role Openings</span>
                  <span className="font-bold text-white font-mono">{shortage.demandRoles} Vacancies</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] block">Internal Supply</span>
                  <span className="font-bold text-cyan-300 font-mono">{shortage.availableEmployees} Employees</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recharts Analytics Charts */}
      <AnalyticsCharts analytics={analytics} />
    </div>
  );
};
