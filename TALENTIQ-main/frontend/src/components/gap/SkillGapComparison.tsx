import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SkillGapAnalysis, SkillGapItem } from '../../types';
import { BookOpen, FolderGit2, Terminal, CheckCircle, AlertTriangle, ArrowRight, GraduationCap, Sparkles } from 'lucide-react';

interface SkillGapComparisonProps {
  gapAnalysis: SkillGapAnalysis | null;
}

export const SkillGapComparison: React.FC<SkillGapComparisonProps> = ({ gapAnalysis }) => {
  const navigate = useNavigate();

  if (!gapAnalysis) {
    return (
      <div className="p-8 text-center rounded-2xl glass-panel border border-slate-800">
        <p className="text-sm text-slate-400">Select a target role to view detailed skill gap intelligence.</p>
      </div>
    );
  }

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'course':
        return <BookOpen className="w-4 h-4 text-cyan-400" />;
      case 'project':
        return <FolderGit2 className="w-4 h-4 text-purple-400" />;
      default:
        return <Terminal className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="rounded-2xl glass-panel p-6 border border-slate-800 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
              Target Role Analysis
            </span>
            <h3 className="text-xl font-bold text-white mt-0.5">
              {gapAnalysis.targetRoleTitle}
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
              {gapAnalysis.summary}
            </p>
          </div>

          <div className="flex items-center space-x-4 p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div>
              <p className="text-[10px] text-slate-400 uppercase">Match Score</p>
              <p className="text-2xl font-bold font-mono text-cyan-300">{gapAnalysis.matchScore}%</p>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase">Skill Gaps</p>
              <p className="text-2xl font-bold font-mono text-amber-400">{gapAnalysis.missingSkills.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Side-by-side Visual Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Your Current Verified Capabilities */}
        <div className="rounded-2xl glass-panel p-5 border border-emerald-500/20">
          <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400 mb-3">
            <CheckCircle className="w-4 h-4" />
            <span>YOUR MATCHING CAPABILITIES ({gapAnalysis.matchingSkills.length})</span>
          </div>
          <div className="space-y-2">
            {gapAnalysis.matchingSkills.map(skill => (
              <div key={skill} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-xs font-medium text-slate-200">{skill}</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 font-semibold">
                  Verified Match
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Required Role Gaps with 1-Click Launch AI Mentor */}
        <div className="rounded-2xl glass-panel p-5 border border-amber-500/20">
          <div className="flex items-center space-x-2 text-xs font-bold text-amber-400 mb-3">
            <AlertTriangle className="w-4 h-4" />
            <span>MISSING ROLE REQUIREMENTS ({gapAnalysis.missingSkills.length})</span>
          </div>
          <div className="space-y-2">
            {gapAnalysis.missingSkills.map(skill => (
              <div key={skill} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <div>
                  <span className="text-xs font-medium text-slate-200">{skill}</span>
                  <span className="block text-[10px] text-amber-400 font-mono">Deficit Gap</span>
                </div>

                <button
                  onClick={() => navigate(`/mentor?skill=${encodeURIComponent(skill)}&role=${encodeURIComponent(gapAnalysis.targetRoleId)}`)}
                  className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-[11px] font-semibold flex items-center space-x-1 shadow-glow-purple transition-all"
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Start AI Mentor</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Learning & Action Plan for each missing skill */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
          <span>AI-Recommended Learning Pathways</span>
        </h4>

        {gapAnalysis.detailedGaps.map((gap) => (
          <div
            key={gap.skillName}
            className="rounded-2xl glass-panel p-5 border border-slate-800 hover:border-cyan-500/30 transition-all space-y-4"
          >
            {/* Skill Gap Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-white">{gap.skillName}</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono">
                  Current: {gap.currentLevel}% → Target: {gap.requiredLevel}%
                </span>
              </div>
              
              <button
                onClick={() => navigate(`/mentor?skill=${encodeURIComponent(gap.skillName)}&role=${encodeURIComponent(gapAnalysis.targetRoleId)}`)}
                className="px-3 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/40 text-xs font-semibold flex items-center space-x-1.5 w-fit"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Launch Interactive AI Mentor Room</span>
              </button>
            </div>

            {/* Recommendations Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {gap.recommendations.map((rec, rIdx) => (
                <div
                  key={rIdx}
                  className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-1.5">
                        {getTypeIcon(rec.type)}
                        <span className="text-[11px] font-semibold text-slate-300">{rec.type}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{rec.duration}</span>
                    </div>
                    <h5 className="text-xs font-bold text-white mb-1.5 line-clamp-2">
                      {rec.title}
                    </h5>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {rec.description}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px]">
                    <button
                      onClick={() => navigate(`/mentor?skill=${encodeURIComponent(gap.skillName)}&role=${encodeURIComponent(gapAnalysis.targetRoleId)}`)}
                      className="text-cyan-400 font-medium flex items-center space-x-1 hover:underline"
                    >
                      <span>Teach in Mentor</span>
                      <ArrowRight className="w-3 h-3 ml-0.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
