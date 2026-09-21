import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  HelpCircle,
  FileText,
  Briefcase,
  Award,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  BrainCircuit,
  Search,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { EvidenceExplorerItem } from '../../types';

export const EvidenceExplorerPage: React.FC = () => {
  const { activeEmployeeId } = useAuth();
  const [evidenceList, setEvidenceList] = useState<EvidenceExplorerItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeModalItem, setActiveModalItem] = useState<EvidenceExplorerItem | null>(null);

  useEffect(() => {
    loadEvidence();
  }, [activeEmployeeId]);

  const loadEvidence = async () => {
    if (!activeEmployeeId) return;
    try {
      setLoading(true);
      const data = await apiService.getEvidenceExplorer(activeEmployeeId);
      setEvidenceList(data.evidenceList || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = evidenceList.filter(
    e => e.skillName.toLowerCase().includes(searchTerm.toLowerCase()) ||
         e.sourceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
         e.reasoningSummary.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        <p className="text-xs text-slate-400">Loading AI Evidence Explorer...</p>
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
              <HelpCircle className="w-4 h-4" />
              <span>Evidence Transparency & Explainability</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Evidence Explorer
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              "Why does TalentIQ think I have this skill?" — Inspect verified provenance, document extractions, and reasoning traces.
            </p>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search evidence..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-900/90 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>
      </div>

      {/* Evidence Cards List */}
      {filtered.length === 0 ? (
        <div className="rounded-3xl glass-panel p-8 text-center text-slate-400">
          No matching evidence found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="rounded-2xl glass-panel p-5 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-base font-bold text-white">{item.skillName}</h4>
                    <span className="text-[10px] text-cyan-400 font-medium">Source: {item.sourceName}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                    {item.verificationStatus}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 mb-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    AI Reasoning Summary
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    "{item.reasoningSummary}"
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs">
                <span className="text-slate-400 font-mono text-[11px]">{item.timestamp}</span>
                <button
                  onClick={() => setActiveModalItem(item)}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Inspect Reasoning</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Inspect Reasoning Modal */}
      {activeModalItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
          onClick={() => setActiveModalItem(null)}
        >
          <div
            className="relative w-full max-w-lg p-6 bg-slate-900 border border-cyan-500/40 rounded-3xl shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{activeModalItem.skillName} • Verified Trace</h3>
                <span className="text-xs text-slate-400">Evidence Type: {activeModalItem.evidenceType}</span>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="font-semibold text-cyan-300 block mb-1">Source Artifact:</span>
                <p>{activeModalItem.sourceName}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="font-semibold text-cyan-300 block mb-1">Neural Reasoning:</span>
                <p className="leading-relaxed">{activeModalItem.reasoningSummary}</p>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="font-semibold">Security & Provenance:</span>
                </div>
                <span className="font-mono">{activeModalItem.confidence} Confidence</span>
              </div>
            </div>

            <button
              onClick={() => setActiveModalItem(null)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition"
            >
              Close Inspector
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
