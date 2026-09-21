import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  UserCheck,
  Compass,
  GitCompare,
  MapPin,
  Bot,
  Briefcase,
  TrendingUp,
  LogOut,
  Sparkles,
  GraduationCap,
  Award,
  Dna,
  HelpCircle,
  GitFork,
  Terminal,
  Zap,
  Mic,
  Target,
  FileText,
  LucideIcon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarLink {
  to: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
  highlight?: boolean;
}

export const EmployeeSidebar: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const employeeLinks: SidebarLink[] = [
    { to: '/employee/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/employee/profile', label: 'My AI Profile', icon: UserCheck },
    { to: '/employee/evidence', label: 'Documents & Evidence', icon: HelpCircle },
    { to: '/employee/skill-passport', label: 'AI Skill Passport', icon: Award, badge: 'Verified' },
    { to: '/employee/skill-dna', label: 'Skill DNA', icon: Dna },
    { to: '/employee/skill-gap', label: 'Skill Gap Analysis', icon: GitCompare },
    { to: '/employee/learning-feed', label: 'Learning Missions', icon: Target },
    { to: '/employee/mentor', label: 'AI Skill Mentor', icon: GraduationCap, badge: 'AI Teacher', highlight: true },
    { to: '/employee/skill-stress-test', label: 'Skill Stress Test', icon: Zap },
    { to: '/employee/role-simulator', label: 'Role Simulator', icon: Terminal, badge: 'Live' },
    { to: '/employee/mock-interview', label: 'AI Mock Interview', icon: Mic },
    { to: '/employee/roadmap', label: 'Career Roadmap', icon: MapPin },
    { to: '/employee/career-simulator', label: 'Career What-If', icon: TrendingUp },
    { to: '/employee/talent-twin', label: 'Talent Twin', icon: Bot, badge: 'Agent' },
    { to: '/employee/roles', label: 'Internal Opportunities', icon: Compass },
    { to: '/employee/internal-gigs', label: 'Internal Gigs', icon: Briefcase },
    { to: '/employee/progress', label: 'Skill Growth', icon: Sparkles }
  ];

  const handleSignOut = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 flex-shrink-0 hidden md:flex flex-col border-r border-slate-800/80 bg-[#070a13]/90 backdrop-blur-xl min-h-[calc(100vh-4rem)] p-4 justify-between">
      {/* Navigation Section */}
      <div className="space-y-4">
        {/* Portal Identifier Badge */}
        <div className="p-3 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 flex items-center space-x-2.5">
          <img
            src="/talentiq_logo.png"
            alt="Logo"
            className="w-8 h-8 object-contain drop-shadow"
          />
          <div>
            <p className="text-xs font-extrabold text-white tracking-wide">
              TALENTIQ AI
            </p>
            <p className="text-[10px] text-cyan-300 font-mono">
              Employee Portal
            </p>
          </div>
        </div>

        {/* Links List */}
        <nav className="space-y-1 max-h-[calc(100vh-14rem)] overflow-y-auto pr-1">
          <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
            Talent Development
          </p>
          {employeeLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 group ${
                    isActive
                      ? link.highlight
                        ? 'bg-gradient-to-r from-cyan-500/20 to-purple-600/20 text-cyan-300 border border-cyan-500/40 shadow-glow-cyan font-semibold'
                        : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive
                            ? 'text-cyan-400'
                            : link.highlight
                            ? 'text-purple-400 group-hover:text-cyan-400'
                            : 'text-slate-500 group-hover:text-slate-300'
                        }`}
                      />
                      <span className="truncate">{link.label}</span>
                    </div>
                    {link.badge && (
                      <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border shrink-0 ${
                        link.highlight
                          ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                          : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                      }`}>
                        {link.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Sign Out (NO Switch to HR) */}
      <div className="pt-3 border-t border-slate-800/80">
        <button
          onClick={handleSignOut}
          className="w-full py-2.5 px-3 rounded-xl bg-slate-900/60 hover:bg-rose-500/10 hover:border-rose-500/30 border border-slate-800 text-slate-400 hover:text-rose-400 text-xs font-semibold flex items-center justify-center space-x-2 transition-all active:scale-95"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
