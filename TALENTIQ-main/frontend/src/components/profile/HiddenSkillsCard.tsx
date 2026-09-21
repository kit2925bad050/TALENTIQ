import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiddenSkill } from '../../types';
import { BrainCircuit, Sparkles, Lightbulb, ShieldCheck, ArrowRight, Zap } from 'lucide-react';
import { apiService } from '../../services/api';
import { AIProgressModal } from '../common/AIProgressModal';

interface HiddenSkillsCardProps {
  employeeId: string;
  hiddenSkills: HiddenSkill[];
  onSkillsDiscovered?: (skills: HiddenSkill[]) => void;
}

export const HiddenSkillsCard: React.FC<HiddenSkillsCardProps> = ({
  employeeId,
  hiddenSkills,
  onSkillsDiscovered
}) => {
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [skillsList, setSkillsList] = useState<HiddenSkill[]>(hiddenSkills);

  const handleRunDiscovery = async () => {
    setShowAIModal(true);
  };

  const handleAIModalComplete = async () => {
    try {
      const discovered = await apiService.detectHiddenSkills(employeeId);
      setSkillsList(discovered);
      if (onSkillsDiscovered) onSkillsDiscovered(discovered);
    } catch (e) {
      console.error(e);
    } finally {
      setShowAIModal(false);
    }
  };

  return (
    <div className="rounded-2xl glass-panel p-6 border border-purple-500/30 relative overflow-hidden">
      {/* Background Accent Gradient */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-800 relative z-10">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-semibold text-white">
                Transferable & Hidden Skill Discovery
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300">
                AI Inferred
              </span>
            </div>
            <p className="text-xs text-slate-400">
              AI extracted competencies detected from project impact, leadership, and deliverables
            </p>
          </div>
        </div>

        <button
          onClick={handleRunDiscovery}
          className="flex items-center justify-center space-x-2 px-4 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-glow-purple active:scale-95 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
          <span>Run AI Skill Discovery</span>
        </button>
      </div>

      {/* Discovery Count Banner */}
      <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-800/40 flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2 text-xs text-purple-200">
          <Zap className="w-4 h-4 text-cyan-400" />
          <span>
            TalentIQ AI discovered <strong className="text-white font-bold">{skillsList.length} transferable competencies</strong> from your project history.
          </span>
        </div>
        <span className="text-[10px] text-purple-300 font-mono">Neural Inference Engine</span>
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <AnimatePresence>
          {skillsList.map((skill, index) => (
            <motion.div
              key={skill.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-purple-500/40 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                    {skill.name}
                  </span>
                  <div className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[10px] font-mono text-cyan-300">
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    <span>{skill.confidence}% Confidence</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  {skill.explanation}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                <span className="truncate pr-2">
                  <strong className="text-slate-300">Evidence:</strong> {skill.detectedFrom}
                </span>
                <span className="flex-shrink-0 text-purple-400 font-medium">Transferable</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* AI Progress Modal */}
      <AIProgressModal
        isOpen={showAIModal}
        title="Analyzing Project History & Achievements"
        customSteps={[
          "Scanning enterprise project milestones and metrics...",
          "Extracting leadership, architecture & execution evidence...",
          "Running semantic transferable skill inference...",
          "Validating skill confidence scores with department taxonomy...",
          "Finalizing discovered transferable skill matrix..."
        ]}
        onComplete={handleAIModalComplete}
      />
    </div>
  );
};
