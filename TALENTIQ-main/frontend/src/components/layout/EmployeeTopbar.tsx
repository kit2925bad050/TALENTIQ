import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  Sparkles,
  LogOut,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { NotificationItem } from '../../types';
import { UserAvatar } from '../common/UserAvatar';

interface EmployeeTopbarProps {
  onDataRefresh?: () => void;
}

export const EmployeeTopbar: React.FC<EmployeeTopbarProps> = ({ onDataRefresh }) => {
  const { user, logout, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await apiService.getNotifications();
      setNotifications(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkRead = async () => {
    try {
      await apiService.markNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSignOut = async () => {
    await logout();
    navigate('/login');
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#070a13]/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Portal Label */}
        <Link to="/employee/dashboard" className="flex items-center space-x-3 group">
          <img
            src="/talentiq_logo.png"
            alt="TALENTIQ AI"
            className="h-9 w-auto object-contain transition-transform group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                TALENT<span className="text-cyan-400">IQ</span>
              </span>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold tracking-wider uppercase rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                Employee Portal
              </span>
            </div>
          </div>
        </Link>

        {/* Right Actions */}
        <div className="flex items-center space-x-3">
          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifs(!showNotifs);
                if (!showNotifs && unreadCount > 0) handleMarkRead();
              }}
              className="relative p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-400 hover:border-slate-700 transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-cyan-500 text-[9px] font-bold text-black animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifs && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl glass-panel p-4 border border-slate-700 shadow-2xl z-50">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
                  <div className="flex items-center space-x-1.5 text-xs font-semibold text-white">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Talent Development Alerts</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Live</span>
                </div>
                <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-500 py-3 text-center">No active notifications</p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/30 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <h4 className="text-xs font-medium text-cyan-200">{n.title}</h4>
                          <span className="text-[9px] text-slate-500">{n.timestamp}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Employee User Avatar */}
          <div className="flex items-center space-x-2.5 pl-2 border-l border-slate-800">
            <UserAvatar
              name={user?.name || 'Employee'}
              photoUrl={user?.profilePhotoUrl}
              employeeId={user?.id || 'me'}
              size="sm"
              editable={true}
              onPhotoUpdated={() => {
                refreshProfile();
                if (onDataRefresh) onDataRefresh();
              }}
            />
            <div className="hidden lg:block text-left">
              <p className="text-xs font-semibold text-white leading-tight truncate max-w-[140px]">
                {user?.name || 'Employee'}
              </p>
              <p className="text-[10px] text-slate-400 leading-tight truncate max-w-[140px]">
                {user?.designation || 'Specialist'}
              </p>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleSignOut}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/30 text-xs transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
