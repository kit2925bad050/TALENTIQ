import React, { useState, useEffect } from 'react';
import { Sparkles, MapPin, RefreshCw, Bot, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { CareerRoadmap, InternalRole } from '../../types';
import { VisualRoadmapGraph } from '../../components/roadmap/VisualRoadmapGraph';
import { AIProgressModal } from '../../components/common/AIProgressModal';
import { DocumentVerificationWizard } from '../../components/profile/DocumentVerificationWizard';

export const CareerRoadmapPage: React.FC = () => {
  const { activeEmployeeId } = useAuth();
  const navigate = useNavigate();
  const [roles, setRoles] = useState<InternalRole[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('role-ml-engineer');
  const [roadmap, setRoadmap] = useState<CareerRoadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
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
        setRoles([]);
        setRoadmap(null);
        return;
      }
      setProfileIncomplete(false);
      const allRoles = await apiService.getRoles();
      setRoles(allRoles);
      if (allRoles.length > 0) {
        const defaultRole = allRoles.find(r => r.id === 'role-ml-engineer') || allRoles[0];
        setSelectedRoleId(defaultRole.id);
        const map = await apiService.generateRoadmap(activeEmployeeId, defaultRole.id);
        setRoadmap(map);
      }
    } catch (e) {
      console.error(e);
      setProfileIncomplete(true);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateRoadmap = () => {
    setGenerating(true);
  };

  const handleAIComplete = async () => {
    try {
      const map = await apiService.generateRoadmap(activeEmployeeId, selectedRoleId);
      setRoadmap(map);
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-3">
          <Sparkles className="w-8 h-8 text-cyan-400 animate-spin" />
          <p className="text-xs text-slate-400">Synthesizing Career Roadmap...</p>
        </div>
      </div>
    );
  }

  if (profileIncomplete || !roadmap) {
    return (
      <div className="space-y-6 pb-12">
        <div className="relative rounded-3xl glass-panel p-8 sm:p-12 border border-cyan-500/30 overflow-hidden shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mx-auto shadow-lg shadow-cyan-500/20">
            <MapPin className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-xl mx-auto">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Roadmap Requires Verified Profile
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Your personalized multi-phase transition roadmap is crafted around your real verified credentials. Upload your documents to get started.
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
          onVerified={() => loadData()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="rounded-3xl glass-panel p-6 sm:p-8 border border-slate-800 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-cyan-400 mb-1">
              <MapPin className="w-4 h-4" />
              <span>Personalized Career Mobility Pathway</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Interactive Career Roadmap
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Step-by-step 4-phase progression roadmap synthesized by AI to transition from your current designation to your target internal role.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                Target Role Milestone
              </label>
              <select
                value={selectedRoleId}
                onChange={(e) => setSelectedRoleId(e.target.value)}
                className="bg-slate-900 border border-purple-500/40 text-xs text-purple-300 font-semibold rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-purple-500"
              >
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleGenerateRoadmap}
              className="mt-4 sm:mt-4 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold flex items-center justify-center space-x-1.5 shadow-glow-cyan"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Regenerate Roadmap</span>
            </button>
          </div>
        </div>
      </div>

      {/* Visual Roadmap Body */}
      <VisualRoadmapGraph roadmap={roadmap} />

      {/* AI Generating Modal */}
      <AIProgressModal
        isOpen={generating}
        title="Generating Multi-Phase Career Roadmap"
        customSteps={[
          "Aligning current skills with 6-month transition timeline...",
          "Mapping sprint deliverables and internal team shadowing...",
          "Structuring capstone project and performance milestones...",
          "Finalizing enterprise career mobility roadmap..."
        ]}
        onComplete={handleAIComplete}
      />
    </div>
  );
};
