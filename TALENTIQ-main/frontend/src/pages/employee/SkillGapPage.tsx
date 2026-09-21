import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GitCompare, Sparkles, MapPin, ArrowRight, Upload, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { InternalRole, SkillGapAnalysis } from '../../types';
import { SkillGapComparison } from '../../components/gap/SkillGapComparison';
import { AIProgressModal } from '../../components/common/AIProgressModal';
import { DocumentVerificationWizard } from '../../components/profile/DocumentVerificationWizard';

export const SkillGapPage: React.FC = () => {
  const { activeEmployeeId } = useAuth();
  const navigate = useNavigate();
  const [roles, setRoles] = useState<InternalRole[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('role-ml-engineer');
  const [gapAnalysis, setGapAnalysis] = useState<SkillGapAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [profileIncomplete, setProfileIncomplete] = useState(false);

  useEffect(() => {
    loadRolesAndGap();
  }, [activeEmployeeId]);

  const loadRolesAndGap = async () => {
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
        setRoles([]);
        setGapAnalysis(null);
        return;
      }
      setProfileIncomplete(false);
      const allRoles = await apiService.getRoles();
      setRoles(allRoles);
      if (allRoles.length > 0) {
        const defaultRole = allRoles.find(r => r.id === 'role-ml-engineer') || allRoles[0];
        setSelectedRoleId(defaultRole.id);
        const analysis = await apiService.analyzeSkillGap(activeEmployeeId, defaultRole.id);
        setGapAnalysis(analysis);
      }
    } catch (e) {
      console.error(e);
      setProfileIncomplete(true);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (roleId: string) => {
    setSelectedRoleId(roleId);
    setAnalyzing(true);
  };

  const handleAIComplete = async () => {
    try {
      const analysis = await apiService.analyzeSkillGap(activeEmployeeId, selectedRoleId);
      setGapAnalysis(analysis);
    } catch (e) {
      console.error(e);
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-3">
          <Sparkles className="w-8 h-8 text-cyan-400 animate-spin" />
          <p className="text-xs text-slate-400">Synthesizing Competency Gap Matrix...</p>
        </div>
      </div>
    );
  }

  if (profileIncomplete || !gapAnalysis) {
    return (
      <div className="space-y-6 pb-12">
        <div className="relative rounded-3xl glass-panel p-8 sm:p-12 border border-cyan-500/30 overflow-hidden shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mx-auto shadow-lg shadow-cyan-500/20">
            <GitCompare className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-xl mx-auto">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Skill Gap Analysis Requires Verified Profile
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Upload your certificate or resume to extract your verified skills and benchmark them against internal target roles.
            </p>
          </div>

          <div>
            <button
              onClick={() => setIsWizardOpen(true)}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-xl shadow-cyan-500/30 transition transform hover:scale-[1.02] active:scale-[0.98] inline-flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload Certificate / Resume
            </button>
          </div>
        </div>

        <DocumentVerificationWizard
          isOpen={isWizardOpen}
          onClose={() => setIsWizardOpen(false)}
          onVerified={() => loadRolesAndGap()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Role Selector */}
      <div className="rounded-3xl glass-panel p-6 sm:p-8 border border-slate-800 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-cyan-400 mb-1">
              <GitCompare className="w-4 h-4" />
              <span>Skill Gap Analysis & Learning Synthesis</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Target Role Benchmarking
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Compare your current verified profile against specific organizational vacancies and generate tailored skill acquisition blueprints.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                Select Target Role
              </label>
              <select
                value={selectedRoleId}
                onChange={(e) => handleRoleChange(e.target.value)}
                className="bg-slate-900 border border-cyan-500/40 text-xs text-cyan-300 font-semibold rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              >
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title} ({r.department})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => navigate('/roadmap')}
              className="mt-4 sm:mt-4 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center justify-center space-x-1.5 shadow-glow-purple"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Generate Roadmap</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Gap Comparison Body */}
      <SkillGapComparison gapAnalysis={gapAnalysis} />

      {/* AI Analyzing Transition Modal */}
      <AIProgressModal
        isOpen={analyzing}
        title="Analyzing Competency Differential"
        customSteps={[
          "Comparing candidate profile with target role prerequisites...",
          "Calculating normalized capability delta across required skills...",
          "Synthesizing modular enterprise learning recommendations...",
          "Calibrating estimated bridging timeline..."
        ]}
        onComplete={handleAIComplete}
      />
    </div>
  );
};
