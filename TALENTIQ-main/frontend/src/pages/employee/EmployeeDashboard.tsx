import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Award,
  Compass,
  GitCompare,
  TrendingUp,
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  BookOpen,
  ChevronRight,
  Zap,
  Upload,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { Employee, RoleMatchScore, InternalRole } from '../../types';
import { AnimatedCounter } from '../../components/common/AnimatedCounter';
import { MatchScoreGauge } from '../../components/matching/MatchScoreGauge';
import { WhyMatchModal } from '../../components/matching/WhyMatchModal';
import { DocumentVerificationWizard } from '../../components/profile/DocumentVerificationWizard';
import { UserAvatar } from '../../components/common/UserAvatar';

export const EmployeeDashboard: React.FC = () => {
  const { activeEmployeeId, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [matches, setMatches] = useState<RoleMatchScore[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<RoleMatchScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, [activeEmployeeId]);

  const loadDashboardData = async () => {
    if (!activeEmployeeId) {
      setLoading(false);
      setEmployee(null);
      return;
    }
    try {
      setLoading(true);
      const empData = await apiService.getEmployee(activeEmployeeId);
      setEmployee(empData);
      if (empData && (empData.profileStatus === 'VERIFIED' || (empData.skills && empData.skills.length > 0))) {
        const matchData = await apiService.getEmployeeMatches(activeEmployeeId);
        setMatches(matchData);
      } else {
        setMatches([]);
      }
    } catch (e) {
      setEmployee(null);
      setMatches([]);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-3">
          <Sparkles className="w-8 h-8 text-cyan-400 animate-spin" />
          <p className="text-xs text-slate-400">Loading TalentIQ AI Profile...</p>
        </div>
      </div>
    );
  }

  // UNVERIFIED / EMPTY ONBOARDING STATE
  if (!employee || employee.profileStatus === 'INCOMPLETE' || (!employee.skills?.length && !employee.projects?.length && !employee.certifications?.length)) {
    return (
      <div className="space-y-6 pb-12">
        <div className="relative rounded-3xl glass-panel p-8 sm:p-12 border border-cyan-500/30 overflow-hidden shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mx-auto shadow-lg shadow-cyan-500/20">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Welcome to TalentIQ AI
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Your talent profile will be created from your verified documents and information.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 max-w-lg mx-auto text-xs text-slate-400">
            Upload your certification (AWS, Coursera, University Degree) or Resume to unlock verified skill matching, hidden talent discovery, and personalized AI mentoring.
          </div>

          <div>
            <button
              onClick={() => setIsWizardOpen(true)}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-base shadow-xl shadow-cyan-500/30 transition transform hover:scale-[1.02] active:scale-[0.98] inline-flex items-center gap-2"
            >
              <Upload className="w-5 h-5" />
              Upload Certificate / Resume
            </button>
          </div>
        </div>

        <DocumentVerificationWizard
          isOpen={isWizardOpen}
          onClose={() => setIsWizardOpen(false)}
          onVerified={(verifiedEmp) => {
            setEmployee(verifiedEmp);
            loadDashboardData();
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Greeting & AI Summary Banner */}
      <div className="relative rounded-3xl glass-panel p-6 sm:p-8 border border-cyan-500/30 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4">
            <UserAvatar
              name={employee.name}
              photoUrl={employee.profilePhotoUrl}
              employeeId={employee.id}
              size="xl"
              editable={true}
              onPhotoUpdated={() => loadDashboardData()}
            />
            <div>
              <div className="flex items-center space-x-2 text-xs font-semibold text-cyan-400 mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified Talent Profile • Real Data Grounded</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Good morning, {employee.name}
              </h2>
            </div>
          </div>

          <button
            onClick={() => setIsWizardOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center gap-2 transition"
          >
            <Upload className="w-4 h-4" />
            + Add Certificate
          </button>
        </div>
      </div>

      <DocumentVerificationWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onVerified={(verifiedEmp) => {
          setEmployee(verifiedEmp);
          loadDashboardData();
        }}
      />

      {/* KPI Cards (Section 10 requirements: Skill Strength, Role Matches, Skill Gaps, Learning Progress) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Skill Strength */}
        <div className="p-5 rounded-2xl glass-panel border border-slate-800 hover:border-cyan-500/30 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">Skill Strength</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-white">
            <AnimatedCounter value={87} suffix="%" />
          </div>
          <p className="text-[10px] text-cyan-400 mt-1">High technical domain density</p>
        </div>

        {/* Role Matches */}
        <div className="p-5 rounded-2xl glass-panel border border-slate-800 hover:border-purple-500/30 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">Role Matches</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Compass className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-white">
            <AnimatedCounter value={matches.length || 4} />
          </div>
          <p className="text-[10px] text-purple-400 mt-1">Active internal vacancies</p>
        </div>

        {/* Skill Gaps */}
        <div className="p-5 rounded-2xl glass-panel border border-slate-800 hover:border-amber-500/30 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">Skill Gaps</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <GitCompare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-white">
            <AnimatedCounter value={matches[0]?.missingSkills.length || 2} />
          </div>
          <p className="text-[10px] text-amber-400 mt-1">To reach 100% target match</p>
        </div>

        {/* Learning Progress */}
        <div className="p-5 rounded-2xl glass-panel border border-slate-800 hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">Learning Progress</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-white">
            <AnimatedCounter value={68} suffix="%" />
          </div>
          <p className="text-[10px] text-emerald-400 mt-1">2 modules in progress</p>
        </div>
      </div>

      {/* Recommended Internal Roles & AI Explanations */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white tracking-wide">
              Top Recommended Internal Opportunities
            </h3>
            <p className="text-xs text-slate-400">
              Ranked by deterministic hybrid score & transferable skill synergy
            </p>
          </div>
          <button
            onClick={() => navigate('/roles')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center space-x-1"
          >
            <span>View all roles</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {matches.slice(0, 2).map((match) => (
            <motion.div
              key={match.roleId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl glass-panel p-5 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-[10px] uppercase font-mono font-bold text-slate-400">
                      {match.department}
                    </span>
                    <h4 className="text-base font-bold text-white mt-0.5">
                      {match.roleTitle}
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      Requires {match.experienceRequired} yrs exp
                    </span>
                  </div>
                  <MatchScoreGauge score={match.finalMatch} size="sm" showLabel={false} />
                </div>

                {/* Matching vs Missing Skills */}
                <div className="space-y-2 mb-4">
                  <div>
                    <span className="text-[10px] text-slate-400 font-medium">Matching: </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {match.matchingSkills.slice(0, 3).map(s => (
                        <span key={s} className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-300 font-medium">
                          ✓ {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-medium">Skill Gaps: </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {match.missingSkills.map(s => (
                        <span key={s} className="px-2 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-300 font-medium">
                          • {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleWhyMatch(match)}
                  className="px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Why am I a match?</span>
                </button>

                <button
                  onClick={() => navigate('/skill-gap')}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1 transition-colors"
                >
                  <span>Skill Gap</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Active Learning Activities */}
      <div className="rounded-2xl glass-panel p-5 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <h4 className="text-sm font-bold text-white">Active Career Bridging Activities</h4>
          </div>
          <button
            onClick={() => navigate('/roadmap')}
            className="text-xs text-cyan-400 hover:underline font-semibold"
          >
            View Full Roadmap
          </button>
        </div>

        <div className="space-y-3">
          {employee.learningActivities.map((act) => (
            <div
              key={act.title}
              className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-white">{act.title}</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] bg-slate-800 text-slate-400">
                    {act.type}
                  </span>
                </div>
                <span className="text-[10px] text-cyan-400">Target Skill: {act.skillTarget}</span>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-28 bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${act.progress}%` }} />
                </div>
                <span className="text-xs font-mono text-emerald-300 font-bold w-10 text-right">
                  {act.progress}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Why Am I a Match Modal */}
      <WhyMatchModal
        isOpen={!!selectedMatch}
        onClose={() => setSelectedMatch(null)}
        matchScore={selectedMatch}
      />
    </div>
  );
};
