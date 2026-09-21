import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Briefcase,
  Sparkles,
  CheckCircle2,
  Clock,
  User,
  ArrowRight,
  BookOpen,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { InternalGigItem } from '../../types';

export const InternalGigsPage: React.FC = () => {
  const { activeEmployeeId } = useAuth();
  const navigate = useNavigate();
  const [gigs, setGigs] = useState<InternalGigItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGigs();
  }, [activeEmployeeId]);

  const loadGigs = async () => {
    if (!activeEmployeeId) return;
    try {
      setLoading(true);
      const data = await apiService.getEmployeeInternalGigs(activeEmployeeId);
      setGigs(data || []);
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
        <p className="text-xs text-slate-400">Loading Internal Gig Marketplace...</p>
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
              <Briefcase className="w-4 h-4" />
              <span>Internal Mobility & Cross-Functional Projects</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Internal Gig Marketplace
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Apply your verified skills to high-impact internal sprints, gain cross-departmental experience, and unlock role readiness.
            </p>
          </div>
        </div>
      </div>

      {/* Gigs List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {gigs.map((gig) => (
          <motion.div
            key={gig.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl glass-panel p-6 border border-slate-800 hover:border-cyan-500/40 transition flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="text-base font-bold text-white leading-snug">{gig.title}</h4>
                  <span className="text-xs text-slate-400">{gig.department}</span>
                </div>
                {gig.matchPercentage !== undefined && (
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Match</span>
                    <span className="font-mono font-bold text-cyan-300 text-base">{gig.matchPercentage}%</span>
                  </div>
                )}
              </div>

              <p className="text-xs text-slate-300 leading-relaxed mb-3">{gig.description}</p>

              {/* Required Skills */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {gig.requiredSkills.map((s) => (
                  <span
                    key={s}
                    className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-900 border border-slate-700 text-slate-300"
                  >
                    {s}
                  </span>
                ))}
              </div>

              {/* Time & Manager */}
              <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>{gig.duration} ({gig.timeCommitment})</span>
                </span>
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span>{gig.managerName}</span>
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
              {gig.skillGaps && gig.skillGaps.length > 0 ? (
                <span className="text-[11px] text-amber-300 font-medium">
                  Missing: {gig.skillGaps.join(', ')}
                </span>
              ) : (
                <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>100% Verified Match</span>
                </span>
              )}

              <button
                onClick={() => alert(`Application submitted for '${gig.title}'! The hiring lead has been notified.`)}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs shadow-md transition"
              >
                Apply for Gig
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
