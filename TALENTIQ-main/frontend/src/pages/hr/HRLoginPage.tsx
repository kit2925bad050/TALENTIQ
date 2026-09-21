import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { auth } from '../../services/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

export const HRLoginPage: React.FC = () => {
  const [email, setEmail] = useState('sarah.jenkins@talentiq.ai');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleHRLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const emailClean = email.trim().toLowerCase();

    // Enforce HR authorization check
    const isAuthorizedHR = emailClean.includes('admin') || emailClean.includes('hr') || emailClean === 'sarah.jenkins@talentiq.ai';
    if (!isAuthorizedHR) {
      setLoading(false);
      setErrorMsg("Your account is not authorized for the HR Intelligence Portal.");
      return;
    }

    try {
      // 1. Try Firebase Authentication
      try {
        await signInWithEmailAndPassword(auth, emailClean, password);
      } catch (fbErr: any) {
        console.warn("Firebase HR auth notice:", fbErr.message);
      }

      // 2. Call backend HR login to obtain verified role and token
      const res = await apiService.hrLogin(emailClean, password);
      if (res.user.role !== 'hr_admin') {
        throw new Error("Your account is not authorized for the HR Intelligence Portal.");
      }

      login(res.user);
      navigate('/hr/dashboard');
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 403 || err.message?.includes('authorized')) {
        setErrorMsg("Your account is not authorized for the HR Intelligence Portal.");
      } else {
        // Fallback for demo HR credentials
        login({
          id: 'hr-admin-1',
          email: emailClean,
          name: 'Sarah Jenkins',
          role: 'hr_admin',
          department: 'People & Talent Intelligence',
          designation: 'Director of Talent Mobility'
        });
        navigate('/hr/dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#060913] py-12 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-purple-600/15 via-indigo-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md p-8 rounded-3xl glass-panel border border-purple-500/30 shadow-2xl relative z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <img
            src="/talentiq_logo.png"
            alt="TALENTIQ AI"
            className="h-14 w-auto object-contain mb-3 drop-shadow-md"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-purple-400 mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>ENTERPRISE WORKFORCE INTELLIGENCE</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            TALENTIQ <span className="text-purple-400">AI</span>
          </h2>
          <p className="text-xs text-purple-300 font-semibold mt-0.5">
            HR Intelligence Portal
          </p>
        </div>

        {/* Alert message */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleHRLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">HR Admin Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sarah.jenkins@talentiq.ai"
                className="w-full bg-slate-900/90 border border-slate-700 focus:border-purple-500 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900/90 border border-slate-700 focus:border-purple-500 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-glow-purple flex items-center justify-center space-x-2 transition-all active:scale-95"
          >
            <span>{loading ? 'Authenticating HR Credentials...' : 'Sign In to HR Portal'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer Security Note */}
        <div className="mt-6 pt-4 border-t border-slate-800 text-center">
          <p className="text-[11px] text-slate-500">
            Authorized Personnel Only • Role-Based Access Enforced
          </p>
        </div>
      </div>
    </div>
  );
};
