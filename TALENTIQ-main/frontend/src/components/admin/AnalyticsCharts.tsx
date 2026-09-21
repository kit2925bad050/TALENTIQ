import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, CartesianGrid
} from 'recharts';
import { WorkforceAnalytics } from '../../types';

interface AnalyticsChartsProps {
  analytics: WorkforceAnalytics;
}

const COLORS = ['#00f2fe', '#8a2be2', '#00f5a0', '#fbbf24', '#f43f5e', '#3b82f6'];

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ analytics }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Tracked Skills Distribution */}
      <div className="rounded-2xl glass-panel p-5 border border-slate-800">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center justify-between">
          <span>Top Tracked Skills in Workforce</span>
          <span className="text-[10px] text-cyan-400 font-mono">Employee Count</span>
        </h4>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics.topSkills} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 10 }} angle={-25} textAnchor="end" />
              <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }}
                cursor={{ fill: 'rgba(0, 242, 254, 0.05)' }}
              />
              <Bar dataKey="count" fill="#00f2fe" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Department Distribution */}
      <div className="rounded-2xl glass-panel p-5 border border-slate-800">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center justify-between">
          <span>Department Talent Distribution</span>
          <span className="text-[10px] text-purple-400 font-mono">Headcount</span>
        </h4>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={analytics.departmentDistribution}
                dataKey="employees"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                innerRadius={45}
                paddingAngle={4}
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
              >
                {analytics.departmentDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Internal Mobility Trends */}
      <div className="rounded-2xl glass-panel p-5 border border-slate-800 lg:col-span-2">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center justify-between">
          <span>Internal Talent Mobility Velocity (Matches vs Transfers)</span>
          <span className="text-[10px] text-emerald-400 font-mono">6-Month Trend</span>
        </h4>
        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={analytics.mobilityTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorMatches" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00f2fe" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#00f2fe" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorTransfers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00f5a0" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#00f5a0" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 10 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }}
              />
              <Area type="monotone" dataKey="internalMatches" stroke="#00f2fe" fillOpacity={1} fill="url(#colorMatches)" name="AI Role Matches" />
              <Area type="monotone" dataKey="transfersCompleted" stroke="#00f5a0" fillOpacity={1} fill="url(#colorTransfers)" name="Transfers Completed" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
