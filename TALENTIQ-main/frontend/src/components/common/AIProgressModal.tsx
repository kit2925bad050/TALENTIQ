import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, BrainCircuit, Cpu, CheckCircle2 } from 'lucide-react';

interface AIProgressModalProps {
  isOpen: boolean;
  title?: string;
  onComplete?: () => void;
  customSteps?: string[];
}

const DEFAULT_STEPS = [
  "Parsing work experience and project history...",
  "Analyzing technical skills and domain strengths...",
  "Discovering hidden & transferable skills via neural inference...",
  "Evaluating profile alignment across internal enterprise roles...",
  "Synthesizing personalized career acceleration insights..."
];

export const AIProgressModal: React.FC<AIProgressModalProps> = ({
  isOpen,
  title = "TalentIQ AI Intelligence Engine",
  onComplete,
  customSteps = DEFAULT_STEPS
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStepIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < customSteps.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          if (onComplete) {
            setTimeout(onComplete, 600);
          }
          return prev;
        }
      });
    }, 700);

    return () => clearInterval(interval);
  }, [isOpen, customSteps, onComplete]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-lg overflow-hidden rounded-2xl glass-panel p-6 border border-cyan-500/30 shadow-glow-cyan"
        >
          {/* Ambient Glows */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <BrainCircuit className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white tracking-wide">{title}</h3>
              <p className="text-xs text-slate-400">Grounded in organizational Firestore knowledge</p>
            </div>
          </div>

          {/* Live Animation Circle */}
          <div className="flex flex-col items-center justify-center py-6">
            <div className="relative flex items-center justify-center w-24 h-24 mb-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border-2 border-t-cyan-400 border-r-purple-500 border-b-transparent border-l-transparent"
              />
              <motion.div
                animate={{ scale: [0.95, 1.05, 0.95] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-500/20 to-purple-600/20 flex items-center justify-center border border-cyan-500/40"
              >
                <Sparkles className="w-8 h-8 text-cyan-300" />
              </motion.div>
            </div>

            <motion.p
              key={currentStepIndex}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm font-medium text-cyan-200 text-center max-w-xs"
            >
              {customSteps[currentStepIndex]}
            </motion.p>
          </div>

          {/* Step Progress Checklist */}
          <div className="space-y-2 mt-4 pt-4 border-t border-slate-800/80">
            {customSteps.map((step, idx) => (
              <div
                key={idx}
                className={`flex items-center space-x-2.5 text-xs transition-colors duration-300 ${
                  idx < currentStepIndex
                    ? 'text-emerald-400 font-medium'
                    : idx === currentStepIndex
                    ? 'text-cyan-300 font-medium'
                    : 'text-slate-500'
                }`}
              >
                {idx < currentStepIndex ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                ) : idx === currentStepIndex ? (
                  <Cpu className="w-4 h-4 text-cyan-400 animate-spin flex-shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-600 flex-shrink-0" />
                )}
                <span className="truncate">{step}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
