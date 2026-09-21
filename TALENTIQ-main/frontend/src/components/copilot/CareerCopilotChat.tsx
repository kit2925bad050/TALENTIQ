import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bot, Send, Sparkles, User, ArrowRight, CornerDownLeft, RefreshCw } from 'lucide-react';
import { apiService } from '../../services/api';
import { Employee } from '../../types';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedQuestions?: string[];
  relatedRoleId?: string;
}

interface CareerCopilotChatProps {
  employee: Employee;
  onNavigateToRole?: (roleId: string) => void;
}

export const CareerCopilotChat: React.FC<CareerCopilotChatProps> = ({
  employee,
  onNavigateToRole
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello **${employee.name}**! I'm your **TalentIQ Career Copilot**.\n\nI have loaded your profile with **${employee.skills.length} core skills**, **${employee.hiddenSkills.length} discovered transferable skills**, and current organizational opportunities in **${employee.department}**.\n\nHow can I help advance your career mobility today?`,
      timestamp: 'Just now',
      suggestedQuestions: [
        "What roles match my profile?",
        "What skills am I missing for ML Engineer?",
        "What transferable skills did AI detect?",
        "How can I bridge my career roadmap gaps?"
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
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

      const res = await apiService.chatCopilot(employee.id, query, history);

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedQuestions: res.suggestedQuestions,
        relatedRoleId: res.relatedRoleId
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (e) {
      console.error(e);
      const errMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: "AI Career Copilot is temporarily synchronizing with the talent registry. Please ask again in a moment.",
        timestamp: 'Just now'
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[75vh] rounded-2xl glass-panel border border-cyan-500/30 overflow-hidden shadow-2xl relative">
      {/* Copilot Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 p-0.5 shadow-glow-cyan">
            <div className="p-1.5 bg-slate-950 rounded-[10px]">
              <Bot className="w-5 h-5 text-cyan-300 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-white tracking-wide">
                TalentIQ Career Copilot
              </h3>
              <span className="flex items-center text-[9px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-ping" />
                Live Context
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Grounded in verified profile & enterprise role database
            </p>
          </div>
        </div>

        <button
          onClick={() => setMessages([messages[0]])}
          title="Reset conversation"
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-start space-x-2.5 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs ${
                  msg.sender === 'user'
                    ? 'bg-purple-600 text-white'
                    : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
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

                  {msg.relatedRoleId && onNavigateToRole && (
                    <div className="mt-3 pt-2 border-t border-slate-800">
                      <button
                        onClick={() => onNavigateToRole(msg.relatedRoleId!)}
                        className="flex items-center space-x-1.5 text-xs text-cyan-400 hover:underline font-semibold"
                      >
                        <span>View Matched Role Opportunity</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Suggested prompt chips */}
                {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {msg.suggestedQuestions.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(q)}
                        className="text-[10px] px-2.5 py-1 rounded-full bg-slate-900/90 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition-colors text-left"
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
          </motion.div>
        ))}

        {isLoading && (
          <div className="flex items-center space-x-2 text-xs text-cyan-300 p-2 rounded-xl bg-slate-900/60 w-fit">
            <Sparkles className="w-4 h-4 animate-spin text-cyan-400" />
            <span>Copilot is reasoning with your profile skills & internal registry...</span>
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
            placeholder="Ask anything about roles, skill gaps, or career roadmaps..."
            className="flex-1 bg-slate-900/90 border border-slate-700/80 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-glow-cyan active:scale-95 transition-all"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
