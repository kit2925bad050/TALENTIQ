import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Compass,
  Briefcase,
  TrendingUp,
  LogOut,
  ShieldCheck,
  Award,
  Layers,
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

export const HRSidebar: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const hrLinks: SidebarLink[] = [
    { to: '/hr/dashboard', label: 'Workforce Dashboard', icon: LayoutDashboard },
    { to: '/hr/employees', label: 'Talent Search', icon: Users, badge: 'Neural' },
    { to: '/hr/skill-intelligence', label: 'Skill Intelligence', icon: TrendingUp, badge: 'Intel' },
    { to: '/hr/roles', label: 'Role Management', icon: Compass },
    { to: '/hr/team-builder', label: 'Team Builder', icon: Users, badge: 'Synergy', highlight: true },
    { to: '/hr/internal-gigs', label: 'Manage Gigs', icon: Briefcase },
    { to: '/hr/analytics', label: 'Learning Analytics', icon: Layers }
  ];

  const handleSignOut = async () => {
    await logout();
    navigate('/hr/login');
  };

  return (
    <aside className="w-64 flex-shrink-0 hidden md:flex flex-col border-r border-purple-900/40 bg-[#070a13]/90 backdrop-blur-xl min-h-[calc(100vh-4rem)] p-4 justify-between">
      {/* Navigation Section */}
      <div className="space-y-4">
        {/* Portal Identifier Badge */}
        <div className="p-3 rounded-2xl bg-purple-950/20 border border-purple-500/30 flex items-center space-x-2.5">
          <img
            src="/talentiq_logo.png"
            alt="Logo"
            className="w-8 h-8 object-contain drop-shadow"
          />
          <div>
            <p className="text-xs font-extrabold text-white tracking-wide">
              TALENTIQ AI
            </p>
            <p className="text-[10px] text-purple-300 font-mono">
              HR Intelligence Portal
            </p>
          </div>
        </div>

        {/* Links List */}
        <nav className="space-y-1">
          <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
            Workforce Management
          </p>
          {hrLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 group ${
                    isActive
                      ? link.highlight
                        ? 'bg-gradient-to-r from-purple-500/20 to-indigo-600/20 text-purple-200 border border-purple-500/40 shadow-glow-purple font-semibold'
                        : 'bg-purple-500/10 text-purple-300 border border-purple-500/30 font-semibold'
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
                            ? 'text-purple-400'
                            : link.highlight
                            ? 'text-purple-400 group-hover:text-purple-300'
                            : 'text-slate-500 group-hover:text-slate-300'
                        }`}
                      />
                      <span className="truncate">{link.label}</span>
                    </div>
                    {link.badge && (
                      <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border shrink-0 ${
                        link.highlight
                          ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                          : 'bg-purple-500/10 text-purple-300 border-purple-500/20'
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

      {/* Bottom Sign Out (NO Switch to Employee) */}
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
