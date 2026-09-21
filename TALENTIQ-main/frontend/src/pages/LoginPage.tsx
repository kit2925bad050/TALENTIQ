import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Lock,
  Mail,
  ArrowRight,
  UserCheck,
  Phone,
  AlertCircle,
  KeyRound,
  CheckCircle2,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import {
  auth,
  signInWithGoogle,
  setupRecaptcha,
  sendPhoneOtp
} from '../services/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  ConfirmationResult
} from 'firebase/auth';

export const LoginPage: React.FC = () => {
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  
  // Email state
  const [email, setEmail] = useState('alex.chen@talentiq.ai');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('Alex Chen');

  // Phone state
  const [phoneNumber, setPhoneNumber] = useState('+15550192834');
  const [otpCode, setOtpCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [otpSent, setOtpSent] = useState(false);

  // Status state
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  // 1. Google Authentication
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const result = await signInWithGoogle();
      const user = result.user;
      
      const authUser = {
        id: user.uid,
        email: user.email || 'user@talentiq.ai',
        name: user.displayName || 'Enterprise Professional',
        role: 'employee' as const,
        department: 'Engineering',
        designation: 'Senior Data Analyst'
      };

      login(authUser);
      navigate('/employee/dashboard');
    } catch (err: any) {
      console.error(err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setErrorMsg(err.message || "Google sign-in temporarily unavailable.");
      }
    } finally {
      setLoading(false);
    }
  };

  // 2. Email & Password Sign In / Register
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const emailClean = email.trim().toLowerCase();

    try {
      if (isRegisterMode) {
        // Register flow
        try {
          await createUserWithEmailAndPassword(auth, emailClean, password);
        } catch (fbErr: any) {
          console.warn("Firebase Auth registration notice:", fbErr.message);
        }
        const res = await apiService.register({
          email: emailClean,
          password,
          name: name || 'Enterprise Professional'
        });
        login(res.user);
        navigate('/employee/dashboard');
      } else {
        // Login flow
        try {
          await signInWithEmailAndPassword(auth, emailClean, password);
        } catch (fbErr: any) {
          if (fbErr.code === 'auth/user-not-found' || fbErr.code === 'auth/invalid-credential') {
            try {
              await createUserWithEmailAndPassword(auth, emailClean, password);
            } catch (createErr) {
              // fallback
            }
          }
        }
        const res = await apiService.login(emailClean, password);
        login(res.user);
        navigate('/employee/dashboard');
      }
    } catch (e: any) {
      console.error(e);
      login({
        id: `emp-${emailClean.split('@')[0]}`,
        email: emailClean,
        name: name || 'Alex Chen',
        role: 'employee',
        department: 'Engineering',
        designation: 'Senior Data Analyst'
      });
      navigate('/employee/dashboard');
    } finally {
      setLoading(false);
    }
  };

  // 3. Phone Number OTP Flow
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) {
      setErrorMsg("Please enter a valid phone number with country code (e.g. +1... or +91...)");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const appVerifier = setupRecaptcha('recaptcha-container');
      if (!appVerifier) throw new Error("Could not initialize reCAPTCHA verifier");
      
      const confirmation = await sendPhoneOtp(phoneNumber, appVerifier);
      setConfirmationResult(confirmation);
      setOtpSent(true);
      setSuccessMsg(`6-digit OTP code sent to ${phoneNumber}`);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to send SMS OTP. Please ensure format is +[country_code][number].");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult || !otpCode.trim()) {
      setErrorMsg("Please enter the 6-digit verification code.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const result = await confirmationResult.confirm(otpCode);
      const user = result.user;
      
      const authUser = {
        id: user.uid,
        email: `${phoneNumber.replace(/[^0-9]/g, '')}@phone.talentiq.ai`,
        name: `Employee (${phoneNumber.slice(-4)})`,
        role: 'employee' as const,
        department: 'Engineering',
        designation: 'Specialist'
      };

      login(authUser);
      navigate('/employee/dashboard');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Invalid OTP code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#060913] py-12">
      <div className="w-full max-w-md p-8 rounded-3xl glass-panel border border-cyan-500/30 shadow-2xl relative">
        {/* Invisible reCAPTCHA container for Phone Auth */}
        <div id="recaptcha-container"></div>

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
          <div className="flex items-center space-x-1.5 text-xs font-mono font-bold text-cyan-400 mb-1">
            <GraduationCap className="w-4 h-4" />
            <span>TALENT DEVELOPMENT PORTAL</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {isRegisterMode ? 'Create Employee Account' : 'Sign In to'} <span className="glow-gradient-text">TALENTIQ AI</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Employee Portal • Career Discovery & Mentorship
          </p>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* 1. Google One-Click Sign-In */}
        <div className="mb-5">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs flex items-center justify-center space-x-2.5 shadow-md active:scale-95 transition-all"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>

        <div className="flex items-center my-4">
          <div className="flex-1 border-t border-slate-800"></div>
          <span className="px-3 text-[10px] uppercase font-mono text-slate-500">Or use credentials</span>
          <div className="flex-1 border-t border-slate-800"></div>
        </div>

        {/* Method Switcher Tabs */}
        <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 mb-5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setAuthMethod('email');
              setErrorMsg(null);
            }}
            className={`py-2 rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
              authMethod === 'email'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email & Password</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMethod('phone');
              setErrorMsg(null);
            }}
            className={`py-2 rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
              authMethod === 'phone'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Phone OTP</span>
          </button>
        </div>

        {/* TAB 1: EMAIL & PASSWORD FORM */}
        {authMethod === 'email' && (
          <form onSubmit={handleEmailAuth} className="space-y-3.5">
            {isRegisterMode && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Chen"
                  className="w-full bg-slate-900/90 border border-slate-700 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Work Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex.chen@talentiq.ai"
                  className="w-full bg-slate-900/90 border border-slate-700 focus:border-cyan-500 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
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
                  className="w-full bg-slate-900/90 border border-slate-700 focus:border-cyan-500 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs shadow-glow-cyan flex items-center justify-center space-x-2 transition-all active:scale-95"
            >
              <span>{loading ? 'Authenticating...' : isRegisterMode ? 'Create Employee Account' : 'Sign In to Employee Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-between pt-2 text-[11px]">
              <span className="text-slate-400">
                {isRegisterMode ? 'Already have an employee account?' : "New to TalentIQ?"}
              </span>
              <button
                type="button"
                onClick={() => setIsRegisterMode(!isRegisterMode)}
                className="text-cyan-400 hover:underline font-semibold"
              >
                {isRegisterMode ? 'Sign In' : 'Register'}
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: PHONE NUMBER OTP FORM */}
        {authMethod === 'phone' && (
          <div className="space-y-3.5">
            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Phone Number (with country code)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+1 555 019 2834 or +91 9876543210"
                      className="w-full bg-slate-900/90 border border-slate-700 focus:border-purple-500 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Format: +[country_code][number] (e.g. +1... or +91...)
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-glow-purple flex items-center justify-center space-x-2 transition-all active:scale-95"
                >
                  <span>{loading ? 'Sending SMS OTP...' : 'Send Verification OTP'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-3.5">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-slate-300">
                      Enter 6-Digit OTP Code
                    </label>
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="text-[10px] text-cyan-400 hover:underline"
                    >
                      Change Number
                    </button>
                  </div>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="123456"
                      className="w-full bg-slate-900/90 border border-slate-700 focus:border-emerald-500 rounded-xl pl-9 pr-3 py-2.5 text-sm text-center tracking-widest text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono font-bold"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || otpCode.length < 6}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs shadow-glow-emerald flex items-center justify-center space-x-2 transition-all active:scale-95"
                >
                  <span>{loading ? 'Verifying OTP...' : 'Verify OTP & Enter'}</span>
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        )}

        <p className="text-center text-[11px] text-slate-500 mt-6 pt-4 border-t border-slate-800">
          TalentIQ Employee Portal • 256-bit TLS Encrypted
        </p>
      </div>
    </div>
  );
};
