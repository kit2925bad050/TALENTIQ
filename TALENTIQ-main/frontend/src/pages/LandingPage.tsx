import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  BrainCircuit,
  Compass,
  GitCompare,
  TrendingUp,
  Shield,
  Zap,
  Users
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, role } = useAuth();

  const handleStartEmployee = () => {
    if (user && role === 'employee') {
      navigate('/employee/dashboard');
    } else {
      navigate('/login');
    }
  };

  const handleStartAdmin = () => {
    if (user && role === 'hr_admin') {
      navigate('/hr/dashboard');
    } else {
      navigate('/hr/login');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between overflow-hidden bg-[#060913] text-slate-100">
      {/* Background Neon Blobs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-cyan-600/15 via-purple-600/15 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Navigation */}
      <header className="relative z-20 max-w-7xl mx-auto w-full px-6 py-5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img
            src="/talentiq_logo.png"
            alt="TALENTIQ AI"
            className="h-10 w-auto object-contain"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div>
            <span className="text-xl font-bold tracking-tight text-white">
              TALENT<span className="text-cyan-400">IQ</span> <span className="text-xs text-purple-400 font-mono">AI</span>
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleStartEmployee}
            className="text-xs font-semibold px-4 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors"
          >
            Employee Portal
          </button>
          <button
            onClick={handleStartAdmin}
            className="text-xs font-semibold px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-glow-purple transition-all"
          >
            HR Intelligence
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12 lg:py-16 flex-1 flex flex-col items-center text-center">
        {/* Subtitle Pill */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-medium mb-6 backdrop-blur-md shadow-glow-cyan"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>AI-Powered Internal Talent Discovery & Career Mobility</span>
        </motion.div>

        {/* Hero Title */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl leading-[1.15]"
        >
          Discover the Talent{' '}
          <span className="glow-gradient-text">Already Inside</span> Your Organization.
        </motion.h1>

        {/* Hero Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-base sm:text-lg text-slate-400 max-w-2xl mt-6 leading-relaxed"
        >
          AI-powered talent intelligence that extracts hidden skills, matches employees to internal roles with explainable hybrid AI, and delivers personalized career roadmaps.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="flex flex-col sm:flex-row items-center gap-4 mt-8"
        >
          <button
            onClick={handleStartEmployee}
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-semibold text-sm shadow-glow-cyan flex items-center justify-center space-x-2 group transition-all"
          >
            <span>Explore Employee Portal</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={handleStartAdmin}
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-purple-500/40 text-sm font-semibold flex items-center justify-center space-x-2 transition-all"
          >
            <Shield className="w-4 h-4 text-purple-400" />
            <span>HR Talent Intelligence</span>
          </button>
        </motion.div>

        {/* Hero Animated Talent Network Visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.35 }}
          className="w-full max-w-5xl mt-14 p-6 sm:p-8 rounded-3xl glass-panel border border-cyan-500/30 shadow-2xl relative"
        >
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800">
            <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400">
              <Zap className="w-4 h-4" />
              <span>LIVE AI TALENT NETWORK TOPOLOGY</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Deterministic + Generative Hybrid Engine</span>
            </div>
          </div>

          {/* Connected Flow Architecture */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
            {/* Step 1: Employee */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-cyan-500/30 flex flex-col items-center text-center relative group hover:border-cyan-400 transition-colors">
              <div className="w-12 h-12 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 mb-3 shadow-glow-cyan">
                <Users className="w-6 h-6" />
              </div>
              <span className="text-[10px] uppercase font-mono font-bold text-cyan-400">Node 01</span>
              <h4 className="text-sm font-bold text-white mt-1">Employee Profile</h4>
              <p className="text-[11px] text-slate-400 mt-1">Alex Chen (Senior Data Analyst)</p>
            </div>

            {/* Step 2: Skills & Hidden Skills */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-purple-500/30 flex flex-col items-center text-center relative group hover:border-purple-400 transition-colors">
              <div className="w-12 h-12 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 mb-3 shadow-glow-purple">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <span className="text-[10px] uppercase font-mono font-bold text-purple-400">Node 02</span>
              <h4 className="text-sm font-bold text-white mt-1">Extracted & Hidden Skills</h4>
              <p className="text-[11px] text-purple-300 mt-1">+4 Transferable Traits Inferred</p>
            </div>

            {/* Step 3: Role Matching */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-emerald-500/30 flex flex-col items-center text-center relative group hover:border-emerald-400 transition-colors">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 mb-3 shadow-glow-emerald">
                <Compass className="w-6 h-6" />
              </div>
              <span className="text-[10px] uppercase font-mono font-bold text-emerald-400">Node 03</span>
              <h4 className="text-sm font-bold text-white mt-1">Internal Role Matching</h4>
              <p className="text-[11px] text-emerald-300 mt-1">87% Match • ML Engineer</p>
            </div>

            {/* Step 4: Career Path */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/30 flex flex-col items-center text-center relative group hover:border-amber-400 transition-colors">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 mb-3">
                <TrendingUp className="w-6 h-6" />
              </div>
              <span className="text-[10px] uppercase font-mono font-bold text-amber-400">Node 04</span>
              <h4 className="text-sm font-bold text-white mt-1">Career Roadmap</h4>
              <p className="text-[11px] text-amber-300 mt-1">4-Phase Targeted Progression</p>
            </div>
          </div>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mt-12 text-left">
          <div className="p-5 rounded-2xl glass-panel border border-slate-800">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 w-fit mb-3">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white mb-1">Transferable Skill Detection</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              AI analyzes project evidence to surface unlisted leadership, systems architecture, and storytelling capabilities.
            </p>
          </div>

          <div className="p-5 rounded-2xl glass-panel border border-slate-800">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 w-fit mb-3">
              <GitCompare className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white mb-1">Hybrid Explainable Matching</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Deterministic weighted scoring (55% Skill, 20% Exp, 15% Proj, 10% Cert) backed by AI "Why am I a match?" explanations.
            </p>
          </div>

          <div className="p-5 rounded-2xl glass-panel border border-slate-800">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 w-fit mb-3">
              <Sparkles className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white mb-1">TalentIQ Career Copilot</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Context-grounded AI conversational assistant that guides continuous learning and internal role mobility without hallucination.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-900 bg-[#04060d] py-6 px-6 text-center text-xs text-slate-500">
        <p>TALENTIQ AI • Built for KIT BUILDATHON 2026 • AI-Powered Talent Discovery & Career Mobility</p>
      </footer>
    </div>
  );
};
