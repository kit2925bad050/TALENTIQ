import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Search,
  Sparkles,
  CheckCircle2,
  Award,
  Briefcase,
  GraduationCap,
  MapPin,
  X,
  BrainCircuit,
  ChevronRight
} from 'lucide-react';
import { apiService } from '../../services/api';
import { Employee } from '../../types';
import { TalentSearchFilter } from '../../components/admin/TalentSearchFilter';
import { SkillGraph } from '../../components/profile/SkillGraph';
import { UserAvatar } from '../../components/common/UserAvatar';

export const AdminEmployees: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEmployees();
  }, [searchQuery, selectedDept]);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const data = await apiService.getEmployees({
        search_skill: searchQuery || undefined,
        department: selectedDept || undefined
      });
      setEmployees(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const departments = Array.from(new Set(employees.map(e => e.department)));

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="rounded-3xl glass-panel p-6 sm:p-8 border border-slate-800 relative overflow-hidden">
        <div className="flex items-center space-x-2 text-xs font-semibold text-cyan-400 mb-1">
          <Users className="w-4 h-4" />
          <span>Talent Sourcing & Skills Discovery</span>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Workforce Talent Registry
        </h2>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl">
          Search and uncover employees matching core technical requirements or neural-inferred transferable capabilities.
        </p>
      </div>

      {/* Talent Search Filters */}
      <TalentSearchFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedDept={selectedDept}
        onDeptChange={setSelectedDept}
        departments={departments}
        totalResults={employees.length}
      />

      {/* Employee List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {employees.map((emp, idx) => (
          <motion.div
            key={emp.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => setSelectedEmployee(emp)}
            className="rounded-2xl glass-panel-interactive p-5 border border-slate-800 hover:border-cyan-500/40 cursor-pointer flex flex-col justify-between"
          >
            <div>
              {/* Header Profile */}
              <div className="flex items-start space-x-3 mb-3">
                <UserAvatar
                  name={emp.name}
                  photoUrl={emp.profilePhotoUrl}
                  size="md"
                />
                <div>
                  <h4 className="text-sm font-bold text-white leading-tight">{emp.name}</h4>
                  <p className="text-xs text-cyan-300 font-medium">{emp.designation}</p>
                  <span className="text-[10px] text-slate-400">
                    {emp.department} • {emp.experienceYears} yrs exp
                  </span>
                </div>
              </div>

              {/* Summary Snippet */}
              <p className="text-xs text-slate-300 line-clamp-2 mb-3">
                {emp.summary}
              </p>

              {/* Skills Tags */}
              <div className="space-y-1.5 mb-3">
                <div className="flex flex-wrap gap-1">
                  {emp.skills.slice(0, 4).map(s => (
                    <span
                      key={s.name}
                      className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                        searchQuery && s.name.toLowerCase().includes(searchQuery.toLowerCase())
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                          : 'bg-slate-900 text-slate-300 border border-slate-800'
                      }`}
                    >
                      {s.name}
                    </span>
                  ))}
                  {emp.skills.length > 4 && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400">
                      +{emp.skills.length - 4} more
                    </span>
                  )}
                </div>

                {/* Transferable traits */}
                {emp.hiddenSkills.length > 0 && (
                  <div className="flex items-center space-x-1 text-[10px] text-purple-300">
                    <Sparkles className="w-3 h-3 text-purple-400 flex-shrink-0" />
                    <span className="truncate">
                      Inferred: {emp.hiddenSkills.map(h => h.name).slice(0, 2).join(', ')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Action footer */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-cyan-400 font-semibold">
              <span>View Full Intelligence</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Candidate Full Intelligence Modal */}
      <AnimatePresence>
        {selectedEmployee && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-3xl rounded-3xl glass-panel p-6 sm:p-8 border border-cyan-500/40 shadow-glow-cyan max-h-[90vh] overflow-y-auto space-y-6"
            >
              <button
                onClick={() => setSelectedEmployee(null)}
                className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Profile Top */}
              <div className="flex items-center space-x-4">
                <UserAvatar
                  name={selectedEmployee.name}
                  photoUrl={selectedEmployee.profilePhotoUrl}
                  size="xl"
                />
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedEmployee.name}</h3>
                  <p className="text-xs text-cyan-300">{selectedEmployee.designation} • {selectedEmployee.department}</p>
                  <p className="text-[11px] text-slate-400">{selectedEmployee.email} • {selectedEmployee.location}</p>
                </div>
              </div>

              {/* AI Summary */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
                <div className="flex items-center space-x-2 text-xs font-semibold text-cyan-400 mb-1">
                  <Sparkles className="w-4 h-4" />
                  <span>AI Capability Profile</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedEmployee.summary}
                </p>
              </div>

              {/* Skills Matrix */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
                    Verified Technical Skills
                  </h4>
                  <SkillGraph skills={selectedEmployee.skills} />
                </div>

                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
                    Inferred Transferable Skills ({selectedEmployee.hiddenSkills.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedEmployee.hiddenSkills.map((h, i) => (
                      <div key={i} className="p-3 rounded-xl bg-purple-950/20 border border-purple-800/40 text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-purple-300">{h.name}</span>
                          <span className="font-mono text-[10px] text-cyan-400">{h.confidence}% Conf.</span>
                        </div>
                        <p className="text-[11px] text-slate-300">{h.explanation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
