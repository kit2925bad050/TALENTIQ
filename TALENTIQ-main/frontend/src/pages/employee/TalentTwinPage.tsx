import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Bot,
  Send,
  ShieldCheck,
  ArrowRight,
  BrainCircuit,
  Loader2,
  FileCheck,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { TalentTwinResponse } from '../../types';

export const TalentTwinPage: React.FC = () => {
  const { activeEmployeeId, user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'twin'; text: string; sources?: string[]; action?: string; actionUrl?: string }>>([
    {
      sender: 'twin',
      text: `Hello ${user?.name || 'there'}! I am your AI Talent Twin, synchronized with your verified skills, documents, and learning history. Ask me anything about your strengths, readiness gaps, or what to learn next.`,
      sources: ['Verified Employee Profile', 'Encrypted Document Data in S3']
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    'What should I learn next?',
    'Why am I not fully ready for Machine Learning Engineer?',
    'What are my strongest verified capabilities?',
    'Which practical project would prove my skills best?'
  ];

  const handleSend = async (queryText?: string) => {
    const q = (queryText || inputQuery).trim();
    if (!q || !activeEmployeeId) return;

    const newMsgs = [...messages, { sender: 'user' as const, text: q }];
    setMessages(newMsgs);
    setInputQuery('');
    setSending(true);

    try {
      const res: TalentTwinResponse = await apiService.chatTalentTwin({
        employeeId: activeEmployeeId,
        query: q
      });

      setMessages([
        ...newMsgs,
        {
          sender: 'twin',
          text: res.answer,
          sources: res.groundedEvidenceSources,
          action: res.recommendedAction,
          actionUrl: res.actionUrl
        }
      ]);
    } catch (e) {
      console.error(e);
      setMessages([
        ...newMsgs,
        {
          sender: 'twin',
          text: 'I encountered an error accessing your verified profile data. Please verify your connection.'
        }
      ]);
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="relative rounded-3xl glass-panel p-6 sm:p-8 border border-cyan-500/30 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-cyan-400 mb-1">
              <Bot className="w-4 h-4" />
              <span>Unified Grounded Talent Representation</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Talent Twin Autonomous Agent
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Conversational intelligence grounded in your verified documents, quiz evaluations, project deliverables, and career goals.
            </p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="rounded-3xl glass-panel border border-slate-800 flex flex-col h-[560px] overflow-hidden">
        {/* Messages Scroll Area */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((m, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xl rounded-2xl p-4 text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-br-sm'
                    : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-bl-sm space-y-2.5 shadow-md'
                }`}
              >
                <div className="flex items-center space-x-1.5 mb-1 text-[10px] text-slate-400">
                  {m.sender === 'twin' && <Sparkles className="w-3.5 h-3.5 text-cyan-400" />}
                  <span className="font-semibold text-white">{m.sender === 'user' ? 'You' : 'Talent Twin'}</span>
                </div>

                <p className="whitespace-pre-wrap">{m.text}</p>

                {m.sources && m.sources.length > 0 && (
                  <div className="pt-2 border-t border-slate-800/80 space-y-1">
                    <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      <span>Grounded Evidence Citations:</span>
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {m.sources.map((s, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-slate-950 text-[10px] text-cyan-300 font-mono">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {m.action && (
                  <div className="pt-2">
                    <button
                      onClick={() => m.actionUrl && navigate(m.actionUrl)}
                      className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs flex items-center gap-1.5 shadow transition"
                    >
                      <span>{m.action}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          {sending && (
            <div className="flex items-center space-x-2 text-xs text-slate-400 p-2">
              <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
              <span>Talent Twin synthesizing response from verified records...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts */}
        <div className="p-3 bg-slate-950/70 border-t border-slate-800 flex items-center gap-2 overflow-x-auto">
          {quickPrompts.map((p) => (
            <button
              key={p}
              onClick={() => handleSend(p)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-[11px] text-slate-300 whitespace-nowrap transition hover:text-cyan-300"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <div className="p-4 bg-slate-950/90 border-t border-slate-800 flex items-center gap-2">
          <input
            type="text"
            placeholder="Ask your Talent Twin anything about skills, gaps, readiness, or recommendations..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 px-4 py-3 bg-slate-900 border border-slate-700 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
          <button
            onClick={() => handleSend()}
            disabled={sending || !inputQuery.trim()}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 transition disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
