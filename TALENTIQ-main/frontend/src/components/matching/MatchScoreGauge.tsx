import React from 'react';
import { motion } from 'framer-motion';

interface MatchScoreGaugeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const MatchScoreGauge: React.FC<MatchScoreGaugeProps> = ({
  score,
  size = 'md',
  showLabel = true
}) => {
  const getColors = (val: number) => {
    if (val >= 80) return { text: 'text-emerald-400', border: 'border-emerald-500/40', bg: 'bg-emerald-500/10', glow: 'shadow-glow-emerald' };
    if (val >= 65) return { text: 'text-cyan-400', border: 'border-cyan-500/40', bg: 'bg-cyan-500/10', glow: 'shadow-glow-cyan' };
    return { text: 'text-amber-400', border: 'border-amber-500/40', bg: 'bg-amber-500/10', glow: '' };
  };

  const colors = getColors(score);

  const dimensionClasses = {
    sm: 'w-12 h-12 text-xs',
    md: 'w-16 h-16 text-sm',
    lg: 'w-24 h-24 text-xl'
  };

  return (
    <div className="flex flex-col items-center">
      <div
        className={`relative ${dimensionClasses[size]} rounded-full flex items-center justify-center font-bold font-mono ${colors.text} ${colors.bg} border-2 ${colors.border} ${colors.glow} backdrop-blur-sm`}
      >
        <span>{score}%</span>
      </div>
      {showLabel && (
        <span className="text-[10px] text-slate-400 font-medium mt-1">Profile Alignment</span>
      )}
    </div>
  );
};
