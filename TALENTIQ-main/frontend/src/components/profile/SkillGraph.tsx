import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SkillItem } from '../../types';
import { CheckCircle2, Award, Zap, Sparkles } from 'lucide-react';

interface SkillGraphProps {
  skills: SkillItem[];
}

export const SkillGraph: React.FC<SkillGraphProps> = ({ skills }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Core', 'Advanced', 'Emerging'];
  const filteredSkills = selectedCategory === 'All'
    ? skills
    : skills.filter(s => s.category.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <div className="space-y-4">
      {/* Category Filter Pills */}
      <div className="flex items-center space-x-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              selectedCategory === cat
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Skills Bars Grid */}
      <div className="space-y-3">
        {filteredSkills.map((skill, index) => (
          <div
            key={skill.name}
            className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-cyan-500/30 transition-all group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors">
                  {skill.name}
                </span>
                {skill.verified && (
                  <span className="flex items-center text-[10px] text-cyan-400/90 font-medium">
                    <CheckCircle2 className="w-3 h-3 mr-0.5 inline" /> Verified
                  </span>
                )}
                <span className="px-1.5 py-0.2 rounded text-[9px] bg-slate-800 text-slate-400 border border-slate-700">
                  {skill.category}
                </span>
              </div>
              <span className="text-xs font-mono font-medium text-cyan-400">
                {skill.proficiency}%
              </span>
            </div>

            {/* Animated Progress Track */}
            <div className="w-full h-2 rounded-full bg-slate-800/80 overflow-hidden relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${skill.proficiency}%` }}
                transition={{ duration: 0.8, delay: index * 0.08, ease: "easeOut" }}
                className={`h-full rounded-full ${
                  skill.proficiency >= 90
                    ? 'bg-gradient-to-r from-cyan-400 to-blue-500 shadow-glow-cyan'
                    : skill.proficiency >= 80
                    ? 'bg-gradient-to-r from-teal-400 to-cyan-500'
                    : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                }`}
              />
            </div>

            {skill.evidence && (
              <p className="text-[10px] text-slate-400 mt-1.5 italic">
                Evidence: {skill.evidence}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
