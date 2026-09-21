import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, CheckCircle2, AlertCircle, Award, Briefcase, GraduationCap, Code } from 'lucide-react';
import { RoleMatchScore } from '../../types';

interface WhyMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchScore: RoleMatchScore | null;
}

export const WhyMatchModal: React.FC<WhyMatchModalProps> = ({
  isOpen,
  onClose,
  matchScore
}) => {
  if (!isOpen || !matchScore) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-2xl overflow-hidden rounded-2xl glass-panel p-6 border border-cyan-500/40 shadow-glow-cyan max-h-[90vh] overflow-y-auto"
        >
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="flex items-start space-x-3 mb-6">
            <div className="p-3 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-bold text-white">
                  Why Am I a Match?
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500/20 border border-cyan-500/30 text-cyan-300">
                  {matchScore.finalMatch}% Alignment
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Target Role: <strong className="text-white">{matchScore.roleTitle}</strong> ({matchScore.department})
              </p>
            </div>
          </div>

          {/* AI Narrative Explanation */}
          <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-800/40 mb-6">
            <div className="flex items-center space-x-2 text-xs font-semibold text-cyan-300 mb-2">
              <Sparkles className="w-4 h-4" />
              <span>TalentIQ AI Synthesis</span>
            </div>
            <div className="text-xs text-slate-200 leading-relaxed space-y-2 whitespace-pre-line">
              {matchScore.aiExplanation || "AI is synthesizing detailed role alignment insights..."}
            </div>
          </div>

          {/* Deterministic Hybrid Formula Breakdown */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Hybrid Alignment Breakdown
              </h4>
              <span className="text-[10px] text-slate-400 font-mono">
                Formula: 0.55*Skill + 0.20*Exp + 0.15*Proj + 0.10*Cert
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="flex items-center space-x-1.5 text-slate-400 mb-1">
                  <Code className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-[11px]">Skill Overlap</span>
                </div>
                <div className="text-base font-bold font-mono text-cyan-300">{matchScore.skillMatch}%</div>
                <span className="text-[9px] text-slate-500">Weight 55%</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="flex items-center space-x-1.5 text-slate-400 mb-1">
                  <Briefcase className="w-3.5 h-3.5 text-purple-400" />
                  <span className="text-[11px]">Experience</span>
                </div>
                <div className="text-base font-bold font-mono text-purple-300">{matchScore.experienceMatch}%</div>
                <span className="text-[9px] text-slate-500">Weight 20%</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="flex items-center space-x-1.5 text-slate-400 mb-1">
                  <Award className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[11px]">Project Relevancy</span>
                </div>
                <div className="text-base font-bold font-mono text-emerald-300">{matchScore.projectMatch}%</div>
                <span className="text-[9px] text-slate-500">Weight 15%</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="flex items-center space-x-1.5 text-slate-400 mb-1">
                  <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[11px]">Certifications</span>
                </div>
                <div className="text-base font-bold font-mono text-amber-300">{matchScore.certificationMatch}%</div>
                <span className="text-[9px] text-slate-500">Weight 10%</span>
              </div>
            </div>
          </div>

          {/* Matched vs Missing Skills */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
            <div>
              <div className="flex items-center space-x-1.5 text-xs font-semibold text-emerald-400 mb-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Matching Capabilities ({matchScore.matchingSkills.length})</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {matchScore.matchingSkills.map(skill => (
                  <span
                    key={skill}
                    className="px-2 py-1 rounded-lg text-xs bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-medium"
                  >
                    ✓ {skill}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-1.5 text-xs font-semibold text-amber-400 mb-2">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Skill Gaps to Bridge ({matchScore.missingSkills.length})</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {matchScore.missingSkills.map(skill => (
                  <span
                    key={skill}
                    className="px-2 py-1 rounded-lg text-xs bg-amber-500/10 border border-amber-500/30 text-amber-300 font-medium"
                  >
                    • {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 text-xs font-semibold rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 transition-all"
            >
              Close Explanation
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
