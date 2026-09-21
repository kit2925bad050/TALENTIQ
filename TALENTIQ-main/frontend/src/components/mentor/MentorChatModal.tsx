import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  Send,
  Sparkles,
  X,
  User,
  Lightbulb,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { apiService } from '../../services/api';

interface Message {
  id: string;
  sender: 'user' | 'mentor';
  text: string;
  timestamp: string;
  suggestedQuestions?: string[];
}

interface MentorChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId: string;
  skillName: string;
  currentTopic?: string;
}

export const MentorChatModal: React.FC<MentorChatModalProps> = ({
  isOpen,
  onClose,
  employeeId,
  skillName,
  currentTopic
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          sender: 'mentor',
          text: `Hello! I am your **TalentIQ AI Mentor** for **${skillName}**.\n\nWe are currently learning **${currentTopic || 'Core Architecture'}**. Ask me to explain concepts, give you an analogy, review code, or generate a practice challenge!`,
          timestamp: 'Just now',
          suggestedQuestions: [
            `Explain ${currentTopic || skillName} with a real-world example`,
            `Why is ${skillName} critical for Machine Learning Engineers?`,
            "Give me a quick 1-question check"
          ]
        }
      ]);
    }
  }, [isOpen, skillName, currentTopic]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const handleSend = async (queryToSend?: string) => {
    const text = (queryToSend || input).trim();
    if (!text || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        text: m.text
      }));

      const res = await apiService.mentorChat({
        employeeId,
        message: text,
        skillName,
        topic: currentTopic,
        conversationHistory: history
      });

      const mentorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'mentor',
        text: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedQuestions: res.suggestedQuestions
      };

      setMessages(prev => [...prev, mentorMsg]);
    } catch (e) {
      console.error(e);
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'mentor',
          text: "I am syncing with the technical curriculum engine. Please ask your question again in a moment.",
          timestamp: 'Just now'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl h-[80vh] rounded-3xl glass-panel border border-cyan-500/40 shadow-glow-cyan flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 p-0.5 shadow-glow-cyan">
                <div className="p-1.5 bg-slate-950 rounded-[10px]">
                  <GraduationCap className="w-5 h-5 text-cyan-300 animate-pulse" />
                </div>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  TalentIQ AI Mentor • 1-on-1 Tutoring
                </h3>
                <p className="text-[11px] text-cyan-300 font-mono">
                  Subject: {skillName} • {currentTopic}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`flex items-start space-x-2.5 max-w-[85%] ${
                    msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs ${
                      msg.sender === 'user'
                        ? 'bg-purple-600 text-white'
                        : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    }`}
                  >
                    {msg.sender === 'user' ? <User className="w-4 h-4" /> : <GraduationCap className="w-4 h-4" />}
                  </div>

                  <div>
                    <div
                      className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-purple-600 text-white rounded-tr-none'
                          : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-none whitespace-pre-line'
                      }`}
                    >
                      {msg.text}
                    </div>

                    {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {msg.suggestedQuestions.map((q, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSend(q)}
                            className="text-[10px] px-2.5 py-1 rounded-full bg-slate-900 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition-colors text-left"
                          >
                            ⚡ {q}
                          </button>
                        ))}
                      </div>
                    )}

                    <span className="text-[9px] text-slate-500 mt-1 block px-1">
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center space-x-2 text-xs text-cyan-300 p-2 rounded-xl bg-slate-900/60 w-fit">
                <Sparkles className="w-4 h-4 animate-spin text-cyan-400" />
                <span>AI Mentor is composing step-by-step guidance...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="p-3 border-t border-slate-800 bg-[#080c18]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center space-x-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Ask anything about ${skillName} concepts, code, or troubleshooting...`}
                className="flex-1 bg-slate-900/90 border border-slate-700 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-glow-cyan transition-all"
              >
                <span>Ask</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
