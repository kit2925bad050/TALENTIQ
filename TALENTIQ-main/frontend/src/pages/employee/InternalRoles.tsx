import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Compass,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Search,
  Filter
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { RoleMatchScore, InternalRole } from '../../types';
import { MatchScoreGauge } from '../../components/matching/MatchScoreGauge';
import { WhyMatchModal } from '../../components/matching/WhyMatchModal';
import { DocumentVerificationWizard } from '../../components/profile/DocumentVerificationWizard';

export const InternalRoles: React.FC = () => {
  const { activeEmployeeId } = useAuth();
  const navigate = useNavigate();
  const [matches, setMatches] = useState<RoleMatchScore[]>([]);
  const [roles, setRoles] = useState<InternalRole[]>([]);
  const [search, setSearch] = useState('');
  const [selectedMatch, setSelectedMatch] = useState<RoleMatchScore | null>(null);
  const [loading, setLoading] = useState(true);

  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [profileIncomplete, setProfileIncomplete] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeEmployeeId]);

  const loadData = async () => {
    if (!activeEmployeeId) {
      setLoading(false);
      setProfileIncomplete(true);
      return;
    }
    try {
      setLoading(true);
      const empData = await apiService.getEmployee(activeEmployeeId).catch(() => null);
      if (!empData || empData.profileStatus === 'INCOMPLETE' || (!empData.skills?.length && !empData.projects?.length && !empData.certifications?.length)) {
        setProfileIncomplete(true);
        setMatches([]);
        setRoles([]);
        return;
      }
      setProfileIncomplete(false);
      const [matchesData, rolesData] = await Promise.all([
        apiService.getEmployeeMatches(activeEmployeeId).catch(() => []),
        apiService.getRoles().catch(() => [])
      ]);
      setMatches(matchesData);
      setRoles(rolesData);
    } catch (e) {
      console.error(e);
      setProfileIncomplete(true);
    } finally {
      setLoading(false);
    }
  };

  const handleWhyMatch = async (match: RoleMatchScore) => {
    try {
      const detailed = await apiService.explainRoleMatch(activeEmployeeId, match.roleId);
      setSelectedMatch(detailed);
    } catch (e) {
      setSelectedMatch(match);
    }
  };

  const filteredMatches = matches.filter(m =>
    m.roleTitle.toLowerCase().includes(search.toLowerCase()) ||
    m.department.toLowerCase().includes(search.toLowerCase()) ||
    m.matchingSkills.some(s => s.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-3">
          <Sparkles className="w-8 h-8 text-cyan-400 animate-spin" />
          <p className="text-xs text-slate-400">Calculating Role Match Indices...</p>
        </div>
      </div>
    );
  }

  if (profileIncomplete || matches.length === 0) {
    return (
      <div className="space-y-6 pb-12">
        <div className="relative rounded-3xl glass-panel p-8 sm:p-12 border border-cyan-500/30 overflow-hidden shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mx-auto shadow-lg shadow-cyan-500/20">
            <Compass className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-xl mx-auto">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Role Matching Requires Verified Profile
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Internal mobility matching computes deterministic role compatibility based on your verified skills and certifications. Upload your credentials to calculate your match scores.
            </p>
          </div>

          <div>
            <button
              onClick={() => setIsWizardOpen(true)}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-xl shadow-cyan-500/30 transition transform hover:scale-[1.02] active:scale-[0.98] inline-flex items-center gap-2"
            >
              <Briefcase className="w-4 h-4" />
              Upload Certificate / Resume
            </button>
          </div>
        </div>

        <DocumentVerificationWizard
          isOpen={isWizardOpen}
          onClose={() => setIsWizardOpen(false)}
          onVerified={() => loadData()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="rounded-3xl glass-panel p-6 sm:p-8 border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-cyan-400 mb-1">
              <Compass className="w-4 h-4" />
              <span>Internal Talent Mobility Registry</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Recommended Internal Opportunities
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Matched against your verified competencies and transferable skills using deterministic multi-factor weighting.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700 text-xs font-mono text-cyan-300">
              {filteredMatches.length} Roles Available
            </span>
          </div>
        </div>

        {/* Search */}
        <div className="mt-6 pt-4 border-t border-slate-800">
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by role title, department, or skill match..."
              className="w-full bg-slate-900/90 border border-slate-700 focus:border-cyan-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>
        </div>
      </div>

      {/* Role Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredMatches.map((match, idx) => (
          <motion.div
            key={match.roleId}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            className="rounded-2xl glass-panel p-6 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-400">
                    {match.department}
                  </span>
                  <h3 className="text-lg font-bold text-white mt-0.5">
                    {match.roleTitle}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Experience Required: <strong className="text-slate-300">{match.experienceRequired} years</strong>
                  </p>
                </div>
                <MatchScoreGauge score={match.finalMatch} size="md" />
              </div>

              {/* Matching Skills */}
              <div className="space-y-3 mb-4">
                <div>
                  <div className="flex items-center space-x-1.5 text-xs font-semibold text-emerald-400 mb-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Matching Skills ({match.matchingSkills.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {match.matchingSkills.map(s => (
                      <span key={s} className="px-2 py-0.5 rounded-lg text-xs bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-medium">
                        ✓ {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Skill Gaps */}
                <div>
                  <div className="flex items-center space-x-1.5 text-xs font-semibold text-amber-400 mb-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Skill Gaps ({match.missingSkills.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {match.missingSkills.map(s => (
                      <span key={s} className="px-2 py-0.5 rounded-lg text-xs bg-amber-500/10 border border-amber-500/30 text-amber-300 font-medium">
                        • {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
              <button
                onClick={() => handleWhyMatch(match)}
                className="px-3.5 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Why am I a match?</span>
              </button>

              <button
                onClick={() => navigate('/skill-gap')}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-glow-purple transition-all"
              >
                <span>Analyze Skill Gap</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <WhyMatchModal
        isOpen={!!selectedMatch}
        onClose={() => setSelectedMatch(null)}
        matchScore={selectedMatch}
      />
    </div>
  );
};
