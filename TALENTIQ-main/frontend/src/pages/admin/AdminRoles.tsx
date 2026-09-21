import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Briefcase,
  Plus,
  Trash2,
  Sparkles,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { apiService } from '../../services/api';
import { InternalRole } from '../../types';
import { RoleEditorModal } from '../../components/admin/RoleEditorModal';

export const AdminRoles: React.FC = () => {
  const [roles, setRoles] = useState<InternalRole[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const data = await apiService.getRoles();
      setRoles(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRole = async (newRoleData: Omit<InternalRole, 'id' | 'postedAt' | 'updatedAt'>) => {
    try {
      await apiService.createRole(newRoleData);
      loadRoles();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    try {
      await apiService.deleteRole(roleId);
      setRoles(roles.filter(r => r.id !== roleId));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="rounded-3xl glass-panel p-6 sm:p-8 border border-slate-800 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-purple-400 mb-1">
              <Briefcase className="w-4 h-4" />
              <span>Internal Mobility Pipeline</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Manage Internal Opportunities ({roles.length})
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Post and manage internal openings. Positions are instantaneously evaluated across all employee profiles for hybrid alignment.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-glow-purple"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Role</span>
          </button>
        </div>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {roles.map((role) => (
          <div
            key={role.id}
            className="rounded-2xl glass-panel p-5 border border-slate-800 hover:border-purple-500/40 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <span className="text-[10px] font-mono uppercase font-bold text-purple-400">
                    {role.department}
                  </span>
                  <h3 className="text-base font-bold text-white mt-0.5">{role.title}</h3>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  {role.openPositions} Position{role.openPositions > 1 ? 's' : ''}
                </span>
              </div>

              <p className="text-xs text-slate-300 line-clamp-3 mb-4 leading-relaxed">
                {role.description}
              </p>

              {/* Requirements */}
              <div className="space-y-2 mb-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Required Skills ({role.requiredSkills.length})
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {role.requiredSkills.map(sk => (
                      <span key={sk} className="px-2 py-0.5 rounded text-[10px] bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 font-medium">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                {role.preferredSkills.length > 0 && (
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      Preferred Skills ({role.preferredSkills.length})
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {role.preferredSkills.map(sk => (
                        <span key={sk} className="px-2 py-0.5 rounded text-[10px] bg-purple-500/10 border border-purple-500/20 text-purple-300">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Meta */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-3 text-slate-400 text-[11px]">
                <span>{role.experienceRequired} yrs exp</span>
                <span>•</span>
                <span>{role.location}</span>
              </div>

              <button
                onClick={() => handleDeleteRole(role.id)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <RoleEditorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveRole}
      />
    </div>
  );
};
