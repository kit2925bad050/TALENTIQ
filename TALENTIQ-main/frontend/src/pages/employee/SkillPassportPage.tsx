import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Sparkles,
  Award,
  CheckCircle2,
  FileText,
  Briefcase,
  Layers,
  ArrowUpRight,
  TrendingUp,
  BrainCircuit,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { SkillPassportResponse, SkillPassportItem, CertificateItem } from '../../types';
import { CertificateModal } from '../../components/common/CertificateModal';


export const SkillPassportPage: React.FC = () => {
  const { activeEmployeeId } = useAuth();
  const [passport, setPassport] = useState<SkillPassportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSkill, setSelectedSkill] = useState<SkillPassportItem | null>(null);
  const [selectedCert, setSelectedCert] = useState<CertificateItem | null>(null);
  const [showCertModal, setShowCertModal] = useState(false);
  const [generatingCert, setGeneratingCert] = useState(false);

  useEffect(() => {
    loadPassport();
  }, [activeEmployeeId]);

  const handleViewCertificate = async (skillName: string, score: number = 92, level: string = 'Advanced') => {
    if (!activeEmployeeId) return;
    try {
      setGeneratingCert(true);
      const cert = await apiService.generateCertificate({
        employeeId: activeEmployeeId,
        skillName,
        courseTitle: `${skillName} Verified Skill Mastery`,
        achievementScore: score,
        skillLevel: level,
        certificateType: 'Skill Mastery'
      });
      setSelectedCert(cert);
      setShowCertModal(true);
    } catch (e) {
      console.error('Failed to view certificate:', e);
    } finally {
      setGeneratingCert(false);
    }
  };

  const loadPassport = async () => {
    if (!activeEmployeeId) return;
    try {
      setLoading(true);
      const data = await apiService.getSkillPassport(activeEmployeeId);
      setPassport(data);
      if (data?.skills?.length) setSelectedSkill(data.skills[0]);
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
        <p className="text-xs text-slate-400">Synthesizing Verified Skill Passport...</p>
      </div>
    );
  }

  if (!passport || passport.skills.length === 0) {
    return (
      <div className="rounded-3xl glass-panel p-8 sm:p-12 border border-cyan-500/30 text-center space-y-4">
        <ShieldCheck className="w-12 h-12 text-cyan-400 mx-auto" />
        <h2 className="text-2xl font-bold text-white">No Verified Skill Passport Data</h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          Upload your official documents, certificates, or projects to generate your cryptographically verifiable AI Skill Passport.
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
              <ShieldCheck className="w-4 h-4" />
              <span>Verified Talent Identity • Provenance Grounded</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              AI Skill Passport
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Cryptographically backed competency verification distinguishing certified vs. inferred abilities.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-center">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Verified Skills</span>
              <span className="text-lg font-bold text-cyan-300">{passport.verifiedSkillsCount}</span>
            </div>
            <div className="px-4 py-2.5 rounded-2xl bg-purple-950/40 border border-purple-500/30 text-center">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">AI Inferred</span>
              <span className="text-lg font-bold text-purple-300">{passport.inferredSkillsCount}</span>
            </div>
            <div className="px-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-center">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Avg Mastery</span>
              <span className="text-lg font-bold text-white">{passport.averageMastery}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Skill Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {passport.skills.map((skill, idx) => {
          const isSelected = selectedSkill?.skillName === skill.skillName;
          const isVerified = skill.status === 'VERIFIED';

          return (
            <motion.div
              key={skill.skillName}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              onClick={() => setSelectedSkill(skill)}
              className={`rounded-2xl p-5 border cursor-pointer transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-900/90 border-cyan-400 shadow-lg shadow-cyan-500/20'
                  : 'glass-panel border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-base font-bold text-white">{skill.skillName}</h4>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">{skill.category}</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      isVerified
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                        : 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                    }`}
                  >
                    {skill.status}
                  </span>
                </div>

                {/* Score Rubrics */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Conceptual</span>
                    <span className="font-mono font-bold text-cyan-300">{skill.conceptualScore}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${skill.conceptualScore}%` }} />
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Practical Ability</span>
                    <span className="font-mono font-bold text-purple-300">{skill.practicalScore}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-purple-400 rounded-full" style={{ width: `${skill.practicalScore}%` }} />
                  </div>
                </div>

                {/* Evidence snippet */}
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-300 space-y-1">
                  <div className="font-semibold text-slate-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                    <span>Evidence Grounding:</span>
                  </div>
                  <p className="line-clamp-2 text-slate-300">{skill.evidence[0]}</p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-400">Mastery: <strong className="text-cyan-300">{skill.masteryLevel}</strong></span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewCertificate(skill.skillName, Math.round((skill.conceptualScore + skill.practicalScore) / 2), skill.masteryLevel);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-bold flex items-center space-x-1 transition-all active:scale-95"
                >
                  <Award className="w-3 h-3 text-amber-400" />
                  <span>View Certificate</span>
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Selected Skill Intelligence Detail Modal/Panel */}
      {selectedSkill && (
        <div className="rounded-3xl glass-panel p-6 sm:p-8 border border-cyan-500/40 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{selectedSkill.skillName} • Deep Evidence Breakdown</h3>
                <p className="text-xs text-slate-400">{selectedSkill.reasoning}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleViewCertificate(selectedSkill.skillName, Math.round((selectedSkill.conceptualScore + selectedSkill.practicalScore) / 2), selectedSkill.masteryLevel)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-extrabold text-xs flex items-center space-x-1.5 shadow-lg shadow-amber-500/20 transition-all active:scale-95"
              >
                <Award className="w-4 h-4 text-slate-950" />
                <span>🏆 Official Certificate</span>
              </button>
              <span className="px-3 py-1.5 rounded-xl text-xs font-bold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-400">
                {selectedSkill.masteryLevel}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Related Credentials</span>
              {selectedSkill.relatedCertifications.length > 0 ? (
                selectedSkill.relatedCertifications.map(c => (
                  <div key={c} className="text-xs text-cyan-200 font-medium flex items-center gap-1.5 mt-1">
                    <Award className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>{c}</span>
                  </div>
                ))
              ) : (
                <span className="text-xs text-slate-500">Verified via Document OCR</span>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Applied Projects</span>
              {selectedSkill.relatedProjects.length > 0 ? (
                selectedSkill.relatedProjects.map(p => (
                  <div key={p} className="text-xs text-purple-200 font-medium flex items-center gap-1.5 mt-1">
                    <Briefcase className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>{p}</span>
                  </div>
                ))
              ) : (
                <span className="text-xs text-slate-500">Document Grounded</span>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Verification Provenance</span>
              <span className="text-xs text-emerald-300 font-bold flex items-center gap-1.5 mt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Encrypted in S3 &bull; Grounded</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Official Certificate Modal */}
      <CertificateModal
        isOpen={showCertModal}
        onClose={() => setShowCertModal(false)}
        certificate={selectedCert}
      />
    </div>
  );
};

