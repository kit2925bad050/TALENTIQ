import React, { useRef } from 'react';
import {
  X,
  Printer,
  Share2,
  BookOpen,
  BarChart3,
  Calendar,
  CreditCard,
  BrainCircuit,
  BarChart2,
  Users,
  ShieldCheck,
  Lightbulb,
  Award,
  QrCode,
  Sparkles
} from 'lucide-react';
import { CertificateItem } from '../../types';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificate: CertificateItem | null;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  onClose,
  certificate
}) => {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !certificate) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(certificate.verifyUrl || `https://tiq.ai/verify/${certificate.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto print:p-0 print:bg-white animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl my-auto bg-slate-900/95 border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden print:border-none print:shadow-none print:rounded-none">
        
        {/* Top Action Toolbar (Hidden in Print) */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-800 bg-[#070a13] print:hidden">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Award className="w-4 h-4" />
            </span>
            <span className="text-sm font-bold text-white tracking-wide">
              Official TALENTIQ AI Certificate of Achievement
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
              {certificate.id}
            </span>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={handleCopyLink}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center space-x-1.5 border border-slate-700 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copied ? 'Copied!' : 'Share Link'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 text-xs font-extrabold flex items-center space-x-1.5 shadow-lg shadow-amber-500/25 transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Canvas Area */}
        <div className="p-3 sm:p-6 flex justify-center bg-slate-950/90 overflow-x-auto print:p-0 print:bg-white">
          <div
            ref={certificateRef}
            id="printable-certificate"
            className="relative w-[1020px] min-h-[680px] bg-[#fcfdff] text-slate-900 rounded-2xl shadow-2xl overflow-hidden border-[10px] border-[#070e22] select-none print:w-full print:min-h-screen print:border-none print:shadow-none print:rounded-none flex flex-col justify-between"
            style={{
              fontFamily: "'Inter', sans-serif"
            }}
          >
            {/* Top Right & Bottom Right Dark Navy + Gold Angular Ribbon Geometry */}
            <div className="absolute top-0 right-0 w-44 h-44 bg-gradient-to-bl from-[#070e22] via-[#0b1736] to-transparent pointer-events-none" />
            <div className="absolute top-0 right-0 w-48 h-8 bg-gradient-to-l from-[#d4af37] via-[#f3e5ab] to-transparent opacity-90 pointer-events-none" />
            <div className="absolute bottom-6 right-0 w-40 h-40 bg-gradient-to-tl from-[#070e22] via-[#0b1736] to-transparent pointer-events-none" />

            {/* Inner Fine Gold Border Line */}
            <div className="absolute inset-3 border-2 border-[#d4af37]/70 rounded-xl pointer-events-none" />
            <div className="absolute inset-4 border border-[#0b1736]/15 rounded-lg pointer-events-none" />

            <div className="relative z-10 flex flex-1">
              
              {/* ========================================================= */}
              {/* LEFT VERTICAL NAVY PANEL WITH ICONS & QUOTE */}
              {/* ========================================================= */}
              <div className="w-44 bg-gradient-to-b from-[#050b1c] via-[#071330] to-[#040817] text-white p-4 flex flex-col justify-between border-r-2 border-[#d4af37]">
                
                {/* Vertical Features List */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center space-x-2 text-[9px] font-bold tracking-wider text-slate-200">
                    <div className="p-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/30 shrink-0">
                      <BrainCircuit className="w-3.5 h-3.5" />
                    </div>
                    <span className="leading-tight uppercase">AI-POWERED<br />LEARNING</span>
                  </div>

                  <div className="flex items-center space-x-2 text-[9px] font-bold tracking-wider text-slate-200">
                    <div className="p-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/30 shrink-0">
                      <BarChart2 className="w-3.5 h-3.5" />
                    </div>
                    <span className="leading-tight uppercase">SKILL<br />INTELLIGENCE</span>
                  </div>

                  <div className="flex items-center space-x-2 text-[9px] font-bold tracking-wider text-slate-200">
                    <div className="p-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/30 shrink-0">
                      <Users className="w-3.5 h-3.5" />
                    </div>
                    <span className="leading-tight uppercase">CAREER<br />GROWTH</span>
                  </div>

                  <div className="flex items-center space-x-2 text-[9px] font-bold tracking-wider text-slate-200">
                    <div className="p-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/30 shrink-0">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                    <span className="leading-tight uppercase">VERIFIED<br />ACHIEVEMENTS</span>
                  </div>

                  <div className="flex items-center space-x-2 text-[9px] font-bold tracking-wider text-slate-200">
                    <div className="p-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/30 shrink-0">
                      <Lightbulb className="w-3.5 h-3.5" />
                    </div>
                    <span className="leading-tight uppercase">A BRIGHTER<br />TOMORROW</span>
                  </div>
                </div>

                {/* Left Panel Bottom Gold Serif Quote */}
                <div className="pt-4 border-t border-[#d4af37]/40 text-left">
                  <p 
                    className="text-[10px] text-[#e5ca72] italic font-serif leading-relaxed"
                  >
                    &ldquo;Discover<br />
                    Talent.<br />
                    Develop Skills.<br />
                    Prove Readiness.&rdquo;
                  </p>
                </div>
              </div>

              {/* ========================================================= */}
              {/* MAIN CERTIFICATE BODY */}
              {/* ========================================================= */}
              <div className="flex-1 p-6 sm:p-7 flex flex-col justify-between relative bg-white">
                
                {/* TOP HEADER: Logo Left & Tagline Right */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  {/* Brand Logo */}
                  <div className="flex items-center space-x-2.5">
                    <img
                      src="/talentiq_logo.png"
                      alt="TALENTIQ AI"
                      className="h-9 w-auto object-contain drop-shadow"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div>
                      <h4 className="text-base font-black tracking-tight text-[#071330]">
                        TALENT<span className="text-cyan-500">IQ</span> <span className="text-purple-600">AI</span>
                      </h4>
                      <p className="text-[7px] text-slate-500 font-mono tracking-widest uppercase">
                        • DISCOVER • DEVELOP • DEPLOY •
                      </p>
                    </div>
                  </div>

                  {/* Top Right Tagline with Gold Line */}
                  <div className="text-right pr-6">
                    <p className="text-[9px] font-extrabold tracking-widest text-[#071330] uppercase leading-tight font-mono">
                      SKILLS TODAY<br />
                      A STRONGER<br />
                      TOMORROW
                    </p>
                    <div className="w-16 h-0.5 bg-[#d4af37] ml-auto mt-1" />
                  </div>
                </div>

                {/* CERTIFICATE TITLE */}
                <div className="text-center my-1">
                  <h1 
                    className="text-4xl font-extrabold tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-[#b38b22] via-[#d4af37] to-[#8c6510]"
                    style={{ fontFamily: "'Cinzel', 'Playfair Display', serif", letterSpacing: '4px' }}
                  >
                    CERTIFICATE
                  </h1>
                  
                  <div className="flex items-center justify-center space-x-3 my-0.5">
                    <span className="h-[1.5px] w-16 bg-[#d4af37]" />
                    <span className="text-[11px] font-bold uppercase tracking-widest text-[#071330]">
                      OF ACHIEVEMENT
                    </span>
                    <span className="h-[1.5px] w-16 bg-[#d4af37]" />
                  </div>

                  <p className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest mt-1.5">
                    THIS CERTIFICATE IS PROUDLY PRESENTED TO
                  </p>
                </div>

                {/* RECIPIENT NAME IN ELEGANT CURSIVE CALLIGRAPHY */}
                <div className="text-center my-1">
                  <h2 
                    className="text-4xl sm:text-5xl text-[#081a44] font-normal tracking-wide py-1"
                    style={{ fontFamily: "'Brush Script MT', 'Great Vibes', 'Playfair Display', cursive" }}
                  >
                    {certificate.recipientName || 'Srii Csse'}
                  </h2>
                  <div className="flex items-center justify-center space-x-2 my-1">
                    <span className="w-24 h-[1px] bg-gradient-to-r from-transparent to-[#d4af37]" />
                    <span className="text-[#d4af37] text-xs">✦</span>
                    <span className="w-24 h-[1px] bg-gradient-to-l from-transparent to-[#d4af37]" />
                  </div>
                </div>

                {/* SKILL / COURSE DESCRIPTION */}
                <div className="text-center max-w-xl mx-auto space-y-1">
                  <p className="text-[11px] text-slate-600 font-medium">
                    for successfully completing the learning and skill development journey in
                  </p>
                  <h3 className="text-2xl font-black text-[#071330] tracking-tight uppercase">
                    {certificate.skillName}
                  </h3>
                  <p className="text-[10px] text-slate-500 leading-relaxed max-w-lg mx-auto">
                    {certificate.description || 'The recipient has successfully completed the assigned learning missions, practical exercises, assessments and AI-guided evaluation conducted through the TALENTIQ AI Skill Mentor platform.'}
                  </p>
                </div>

                {/* 4 PILLARS METRIC ROW WITH BLUE CIRCULAR ICONS & DIVIDERS */}
                <div className="grid grid-cols-4 gap-2 max-w-2xl mx-auto my-2 w-full p-2 rounded-xl bg-slate-50 border border-slate-200/80">
                  
                  {/* 1. Achievement Score */}
                  <div className="flex items-center space-x-2 px-2 border-r border-slate-200">
                    <div className="w-7 h-7 rounded-full bg-[#0b2055] text-white flex items-center justify-center shrink-0 shadow-sm">
                      <BookOpen className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-[7px] text-slate-500 font-bold uppercase block tracking-wider">Achievement Score</span>
                      <span className="text-xs font-black text-[#071330]">{certificate.achievementScore}%</span>
                    </div>
                  </div>

                  {/* 2. Skill Level */}
                  <div className="flex items-center space-x-2 px-2 border-r border-slate-200">
                    <div className="w-7 h-7 rounded-full bg-[#0b2055] text-white flex items-center justify-center shrink-0 shadow-sm">
                      <BarChart3 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-[7px] text-slate-500 font-bold uppercase block tracking-wider">Skill Level</span>
                      <span className="text-xs font-black text-[#071330]">{certificate.skillLevel}</span>
                    </div>
                  </div>

                  {/* 3. Issued On */}
                  <div className="flex items-center space-x-2 px-2 border-r border-slate-200">
                    <div className="w-7 h-7 rounded-full bg-[#0b2055] text-white flex items-center justify-center shrink-0 shadow-sm">
                      <Calendar className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-[7px] text-slate-500 font-bold uppercase block tracking-wider">Issued On</span>
                      <span className="text-xs font-black text-[#071330]">{certificate.issuedOn}</span>
                    </div>
                  </div>

                  {/* 4. Certificate ID */}
                  <div className="flex items-center space-x-2 px-2">
                    <div className="w-7 h-7 rounded-full bg-[#0b2055] text-white flex items-center justify-center shrink-0 shadow-sm">
                      <CreditCard className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-[7px] text-slate-500 font-bold uppercase block tracking-wider">Certificate ID</span>
                      <span className="text-[10px] font-black font-mono text-[#071330]">{certificate.id}</span>
                    </div>
                  </div>
                </div>

                {/* GOLD LUXURY WREATH SEAL (Floating Top Right) */}
                <div className="absolute top-14 right-4 hidden sm:flex flex-col items-center pointer-events-none">
                  <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#ffd700] via-[#d4af37] to-[#8a5d0e] p-1.5 shadow-2xl flex items-center justify-center text-center border-2 border-white">
                    <div className="w-full h-full rounded-full border border-dashed border-amber-200 flex flex-col items-center justify-center p-1.5 bg-[#08173d] text-white">
                      <span className="text-amber-400 text-xs leading-none">👑</span>
                      <span className="text-[8px] font-black uppercase text-amber-300 tracking-wider leading-tight mt-0.5">
                        LEARN<br />
                        PRACTICE<br />
                        GROW<br />
                        SUCCEED
                      </span>
                      <span className="text-[7px] text-amber-300 tracking-widest mt-0.5">★ ★ ★</span>
                    </div>
                  </div>
                  {/* Ribbon tails */}
                  <div className="flex space-x-2 -mt-2.5">
                    <div className="w-4 h-9 bg-[#d4af37] transform -rotate-12 border-t border-amber-600 shadow-md" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)' }} />
                    <div className="w-4 h-9 bg-[#d4af37] transform rotate-12 border-t border-amber-600 shadow-md" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)' }} />
                  </div>
                </div>

                {/* SIGNATURES & QR CODE SECTION */}
                <div className="grid grid-cols-4 gap-4 items-end pt-2 border-t border-slate-200 mt-1">
                  
                  {/* Signature 1: Founder */}
                  <div className="text-center">
                    <p 
                      className="text-2xl text-[#071330] font-normal leading-none"
                      style={{ fontFamily: "'Brush Script MT', 'Great Vibes', cursive" }}
                    >
                      Sridharan V.R.
                    </p>
                    <div className="w-28 h-0.5 bg-[#071330] mx-auto my-1" />
                    <p className="text-[10px] font-black text-[#071330] leading-tight">
                      Sridharan V.R
                    </p>
                    <p className="text-[8px] text-slate-500 font-medium">
                      Founder<br />
                      TALENTIQ AI
                    </p>
                  </div>

                  {/* Center Brand Authenticity & Initiative */}
                  <div className="text-center col-span-2">
                    <h5 className="text-xs font-black text-[#071330] tracking-wider uppercase">
                      TALENT<span className="text-cyan-600">IQ</span> <span className="text-purple-600">AI</span>
                    </h5>
                    <p className="text-[7px] font-bold text-slate-600 uppercase tracking-wider mt-0.5">
                      AI-POWERED TALENT INTELLIGENCE & SKILL DEVELOPMENT
                    </p>
                    <div className="w-36 h-[1px] bg-[#d4af37] mx-auto my-1" />
                    <p className="text-[7px] text-slate-500 font-mono">
                      An Initiative by <strong>SC TECH</strong> | &copy; {new Date().getFullYear()}
                    </p>
                  </div>

                  {/* Signature 2: Authorized Signatory */}
                  <div className="text-center">
                    <p 
                      className="text-2xl text-[#071330] font-normal leading-none"
                      style={{ fontFamily: "'Brush Script MT', 'Great Vibes', cursive" }}
                    >
                      Jyotsna
                    </p>
                    <div className="w-28 h-0.5 bg-[#071330] mx-auto my-1" />
                    <p className="text-[10px] font-black text-[#071330] leading-tight">
                      Authorized Signatory
                    </p>
                    <p className="text-[8px] text-slate-500 font-medium">
                      TALENTIQ AI
                    </p>
                  </div>
                </div>

                {/* QR Verification Box Bottom Right */}
                <div className="flex justify-end items-center pt-2">
                  <div className="flex items-center space-x-2 px-2.5 py-1 rounded-lg bg-white border border-slate-300 shadow-sm">
                    <QrCode className="w-6 h-6 text-slate-900" />
                    <div className="text-left text-[7px] font-mono">
                      <span className="font-bold text-slate-900 block uppercase">Verify Certificate</span>
                      <span className="text-cyan-700">{certificate.verifyUrl || 'https://tiq.ai/verify'}</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* ========================================================= */}
            {/* BOTTOM NAVY BANNER STRIP */}
            {/* ========================================================= */}
            <div className="bg-[#040816] text-[#e5ca72] py-1.5 px-6 border-t-2 border-[#d4af37] flex items-center justify-center space-x-4 text-[9px] font-mono tracking-widest uppercase">
              <span>EMPOWERING PEOPLE</span>
              <span>|</span>
              <span>BUILDING BETTER FUTURES</span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
