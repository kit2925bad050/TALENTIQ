import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Briefcase, Sparkles } from 'lucide-react';
import { InternalRole } from '../../types';

interface RoleEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (roleData: Omit<InternalRole, 'id' | 'postedAt' | 'updatedAt'>) => Promise<void>;
  initialRole?: InternalRole | null;
}

export const RoleEditorModal: React.FC<RoleEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialRole
}) => {
  const [title, setTitle] = useState(initialRole?.title || '');
  const [department, setDepartment] = useState(initialRole?.department || 'Engineering');
  const [description, setDescription] = useState(initialRole?.description || '');
  const [experienceRequired, setExperienceRequired] = useState(initialRole?.experienceRequired || 3.0);
  const [openPositions, setOpenPositions] = useState(initialRole?.openPositions || 1);
  const [urgency, setUrgency] = useState(initialRole?.urgency || 'Medium');
  const [location, setLocation] = useState(initialRole?.location || 'Hybrid / HQ');
  const [reqSkillInput, setReqSkillInput] = useState('');
  const [requiredSkills, setRequiredSkills] = useState<string[]>(
    initialRole?.requiredSkills || ['Python', 'Docker']
  );
  const [prefSkillInput, setPrefSkillInput] = useState('');
  const [preferredSkills, setPreferredSkills] = useState<string[]>(
    initialRole?.preferredSkills || ['Kubernetes']
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleAddReqSkill = () => {
    if (reqSkillInput.trim() && !requiredSkills.includes(reqSkillInput.trim())) {
      setRequiredSkills([...requiredSkills, reqSkillInput.trim()]);
      setReqSkillInput('');
    }
  };

  const handleRemoveReqSkill = (skill: string) => {
    setRequiredSkills(requiredSkills.filter(s => s !== skill));
  };

  const handleAddPrefSkill = () => {
    if (prefSkillInput.trim() && !preferredSkills.includes(prefSkillInput.trim())) {
      setPreferredSkills([...preferredSkills, prefSkillInput.trim()]);
      setPrefSkillInput('');
    }
  };

  const handleRemovePrefSkill = (skill: string) => {
    setPreferredSkills(preferredSkills.filter(s => s !== skill));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    try {
      setIsSubmitting(true);
      await onSave({
        title,
        department,
        description,
        experienceRequired: Number(experienceRequired),
        openPositions: Number(openPositions),
        urgency,
        location,
        requiredSkills,
        preferredSkills
      });
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-2xl rounded-2xl glass-panel p-6 border border-purple-500/40 shadow-glow-purple max-h-[90vh] overflow-y-auto"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-300">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {initialRole ? 'Edit Internal Role' : 'Create New Internal Opportunity'}
              </h3>
              <p className="text-xs text-slate-400">
                New roles are immediately matched against the workforce skill graph.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Role Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Senior MLOps Engineer"
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="AI & Advanced Analytics">AI & Advanced Analytics</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Platform Engineering">Platform Engineering</option>
                  <option value="Product Engineering">Product Engineering</option>
                  <option value="Strategic Growth">Strategic Growth</option>
                  <option value="Product">Product</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Role Description</label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe key responsibilities and mission..."
                className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Min Exp (Yrs)</label>
                <input
                  type="number"
                  step="0.5"
                  value={experienceRequired}
                  onChange={(e) => setExperienceRequired(Number(e.target.value))}
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1">Open Positions</label>
                <input
                  type="number"
                  min="1"
                  value={openPositions}
                  onChange={(e) => setOpenPositions(Number(e.target.value))}
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1">Urgency</label>
                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>

            {/* Required Skills Input */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Required Skills (Used in 55% Match Weighting)
              </label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={reqSkillInput}
                  onChange={(e) => setReqSkillInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddReqSkill(); } }}
                  placeholder="e.g. Python, Docker, PyTorch"
                  className="flex-1 bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="button"
                  onClick={handleAddReqSkill}
                  className="px-3 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {requiredSkills.map(sk => (
                  <span
                    key={sk}
                    className="flex items-center space-x-1 px-2.5 py-0.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[11px]"
                  >
                    <span>{sk}</span>
                    <button type="button" onClick={() => handleRemoveReqSkill(sk)} className="hover:text-white">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Preferred Skills */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Preferred Skills
              </label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={prefSkillInput}
                  onChange={(e) => setPrefSkillInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddPrefSkill(); } }}
                  placeholder="e.g. Kubernetes, AWS"
                  className="flex-1 bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-purple-500"
                />
                <button
                  type="button"
                  onClick={handleAddPrefSkill}
                  className="px-3 py-1.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40 hover:bg-purple-500/30 flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {preferredSkills.map(sk => (
                  <span
                    key={sk}
                    className="flex items-center space-x-1 px-2.5 py-0.5 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[11px]"
                  >
                    <span>{sk}</span>
                    <button type="button" onClick={() => handleRemovePrefSkill(sk)} className="hover:text-white">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold flex items-center space-x-1.5 shadow-glow-purple"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{initialRole ? 'Save Changes' : 'Publish Internal Role'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
