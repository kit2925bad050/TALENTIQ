import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Dna,
  Layers,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  FolderGit2,
  Award,
  CheckCircle2,
  FileCheck,
  BrainCircuit,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { SkillDNAResponse, SkillDNAItem } from '../../types';

export const SkillDNAPage: React.FC = () => {
  const { activeEmployeeId } = useAuth();
  const [dna, setDna] = useState<SkillDNAResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null);

  useEffect(() => {
    loadDNA();
  }, [activeEmployeeId]);

  const loadDNA = async () => {
    if (!activeEmployeeId) return;
    try {
      setLoading(true);
      const data = await apiService.getSkillDNA(activeEmployeeId);
      setDna(data);
      // Auto expand first skill
      for (const cat of Object.values(data?.categories || {}) as SkillDNAItem[][]) {
        if (cat.length > 0) {
          setExpandedSkill(cat[0].skillName);
          break;
        }
      }
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
        <p className="text-xs text-slate-400">Mapping Hierarchical Skill DNA & Provenance Tree...</p>
      </div>
    );
  }

  if (!dna || Object.keys(dna.categories).length === 0) {
    return (
      <div className="rounded-3xl glass-panel p-8 sm:p-12 border border-cyan-500/30 text-center space-y-4">
        <Dna className="w-12 h-12 text-cyan-400 mx-auto" />
        <h2 className="text-2xl font-bold text-white">No Skill DNA Available</h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          Upload certificates or projects to generate your visual Skill DNA profile.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="relative rounded-3xl glass-panel p-6 sm:p-8 border border-cyan-500/30 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-cyan-400 mb-1">
              <Dna className="w-4 h-4" />
              <span>Hierarchical Competency Genome</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Skill DNA Profile
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Multi-tiered provenance trees connecting abilities to verified credentials, projects, and assessments.
            </p>
          </div>

          <div className="px-4 py-2 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Tracked Skills</span>
            <span className="text-xl font-bold text-cyan-300">{dna.totalTrackedSkills}</span>
          </div>
        </div>
      </div>

      {/* Categories & Skill Trees */}
      <div className="space-y-6">
        {Object.entries(dna.categories).map(([categoryName, skills], catIdx) => (
          <motion.div
            key={categoryName}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: catIdx * 0.05 }}
            className="rounded-3xl glass-panel p-6 border border-slate-800 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <h3 className="text-base font-bold text-white">{categoryName}</h3>
              </div>
              <span className="text-xs font-mono text-cyan-300 bg-cyan-950/60 px-2.5 py-0.5 rounded-full border border-cyan-800/60">
                {skills.length} skills
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {skills.map((skill) => {
                const isExpanded = expandedSkill === skill.skillName;

                return (
                  <div
                    key={skill.skillName}
                    className={`rounded-2xl p-4 border transition-all ${
                      isExpanded
                        ? 'bg-slate-900/90 border-cyan-500/50 shadow-md shadow-cyan-950/40'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => setExpandedSkill(isExpanded ? null : skill.skillName)}
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-xs">
                          {skill.mastery}%
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">{skill.skillName}</h4>
                          <span className="text-[10px] text-slate-400">{skill.evidenceNodes.length} Provenance Nodes</span>
                        </div>
                      </div>
                      <ChevronRight
                        className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-90 text-cyan-400' : ''}`}
                      />
                    </div>

                    {/* Hierarchical Provenance Tree */}
                    {isExpanded && (
                      <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2">
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-cyan-400 flex items-center gap-1 mb-2">
                          <FolderGit2 className="w-3.5 h-3.5" />
                          <span>Evidence Tree Provenance:</span>
                        </div>

                        {skill.evidenceNodes.map((node, nIdx) => (
                          <div
                            key={nIdx}
                            className="flex items-start space-x-2.5 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs"
                          >
                            <div className="p-1 rounded-lg bg-cyan-500/10 text-cyan-400 shrink-0 mt-0.5">
                              {node.type === 'Certificate' ? (
                                <Award className="w-3.5 h-3.5" />
                              ) : node.type === 'Project' ? (
                                <FolderGit2 className="w-3.5 h-3.5" />
                              ) : (
                                <FileCheck className="w-3.5 h-3.5" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-slate-200 truncate">{node.name}</span>
                                <span className="text-[10px] text-emerald-400 font-mono">{node.confidence}% conf</span>
                              </div>
                              <p className="text-[11px] text-slate-400 mt-0.5">{node.source}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
