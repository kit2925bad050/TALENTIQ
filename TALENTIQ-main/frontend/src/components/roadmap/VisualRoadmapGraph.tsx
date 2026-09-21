import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CareerRoadmap, RoadmapMilestone } from '../../types';
import {
  CheckCircle2,
  Clock,
  CircleDot,
  ArrowDown,
  Sparkles,
  Award,
  ChevronRight,
  X,
  Target,
  FileCheck
} from 'lucide-react';

interface VisualRoadmapGraphProps {
  roadmap: CareerRoadmap | null;
}

export const VisualRoadmapGraph: React.FC<VisualRoadmapGraphProps> = ({ roadmap }) => {
  const [selectedMilestone, setSelectedMilestone] = useState<RoadmapMilestone | null>(null);

  if (!roadmap) {
    return (
      <div className="p-8 text-center rounded-2xl glass-panel border border-slate-800">
        <p className="text-sm text-slate-400">Generate a personalized career roadmap to view the visual pathway.</p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return {
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
          color: 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10'
        };
      case 'current':
        return {
          icon: <CircleDot className="w-4 h-4 text-cyan-400 animate-pulse" />,
          color: 'text-cyan-300 border-cyan-500/40 bg-cyan-500/10 shadow-glow-cyan'
        };
      default:
        return {
          icon: <Clock className="w-4 h-4 text-slate-500" />,
          color: 'text-slate-400 border-slate-700 bg-slate-900'
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Strategic Advisory Header */}
      <div className="rounded-2xl glass-panel p-5 border border-cyan-500/30 bg-gradient-to-r from-cyan-950/30 via-slate-900/60 to-purple-950/30">
        <div className="flex items-start space-x-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 flex-shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              AI Career Transition Strategy
            </h4>
            <p className="text-xs text-slate-200 mt-1 leading-relaxed">
              {roadmap.aiAdvice}
            </p>
          </div>
        </div>
      </div>

      {/* Start and Target Nodes Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
        <div className="flex items-center space-x-2">
          <span className="text-slate-400">Starting Point:</span>
          <span className="font-bold text-white px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
            {roadmap.currentRole}
          </span>
        </div>
        <div className="hidden sm:block text-cyan-400 font-mono">────────►</div>
        <div className="flex items-center space-x-2 mt-2 sm:mt-0">
          <span className="text-slate-400">Target Role Destination:</span>
          <span className="font-bold text-cyan-300 px-2.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 shadow-glow-cyan">
            {roadmap.targetRoleTitle}
          </span>
        </div>
      </div>

      {/* Interactive Milestones Flow */}
      <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-cyan-500 before:via-purple-500 before:to-emerald-500">
        {roadmap.milestones.map((milestone, idx) => {
          const status = getStatusBadge(milestone.status);
          const isSelected = selectedMilestone?.phase === milestone.phase;

          return (
            <motion.div
              key={milestone.phase}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.15 }}
              onClick={() => setSelectedMilestone(milestone)}
              className={`relative cursor-pointer rounded-2xl glass-panel-interactive p-5 transition-all ${
                isSelected
                  ? 'border-cyan-400 shadow-glow-cyan bg-slate-900/90'
                  : 'hover:border-slate-700'
              }`}
            >
              {/* Milestone Indicator Node */}
              <div className="absolute -left-[30px] sm:-left-[34px] top-6 w-5 h-5 rounded-full bg-[#070a13] border-2 border-cyan-400 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                    Phase {milestone.phase}
                  </span>
                  <h4 className="text-sm font-bold text-white">{milestone.title}</h4>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-[11px] font-mono text-slate-400">{milestone.timeline}</span>
                  <div className={`flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${status.color}`}>
                    {status.icon}
                    <span>{milestone.status}</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-300 mb-3">{milestone.description}</p>

              {/* Target Skills Tags */}
              <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800/80">
                <span className="text-[10px] text-slate-400 font-medium mr-1">Skills:</span>
                {milestone.targetSkills.map((sk) => (
                  <span
                    key={sk}
                    className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700"
                  >
                    {sk}
                  </span>
                ))}
                <span className="ml-auto text-[10px] text-cyan-400 font-medium flex items-center">
                  Click for details <ChevronRight className="w-3 h-3 ml-0.5" />
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Selected Milestone Details Modal */}
      <AnimatePresence>
        {selectedMilestone && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg rounded-2xl glass-panel p-6 border border-cyan-500/40 shadow-glow-cyan"
            >
              <button
                onClick={() => setSelectedMilestone(null)}
                className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center space-x-2 text-xs text-cyan-400 font-mono mb-1">
                <span>Phase {selectedMilestone.phase}</span>
                <span>•</span>
                <span>{selectedMilestone.timeline}</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{selectedMilestone.title}</h3>
              <p className="text-xs text-slate-300 mb-4">{selectedMilestone.description}</p>

              {/* Action items */}
              <div className="space-y-2 mb-4">
                <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Action Deliverables & Tasks
                </h5>
                {selectedMilestone.actionItems.map((act, aIdx) => (
                  <div
                    key={aIdx}
                    className="flex items-start space-x-2 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-200"
                  >
                    <Target className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span>{act}</span>
                  </div>
                ))}
              </div>

              {/* Key Deliverable */}
              <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-800/40 mb-4">
                <div className="flex items-center space-x-2 text-xs font-semibold text-purple-300 mb-1">
                  <FileCheck className="w-4 h-4 text-purple-400" />
                  <span>Phase Deliverable Milestone</span>
                </div>
                <p className="text-xs text-slate-200">{selectedMilestone.deliverable}</p>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setSelectedMilestone(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
