import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Sparkles,
  CheckCircle2,
  Compass,
  ArrowRight,
  Plus,
  X,
  BrainCircuit,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { CareerWhatIfResponse } from '../../types';

export const CareerSimulatorPage: React.FC = () => {
  const { activeEmployeeId } = useAuth();
  const [selectedSkills, setSelectedSkills] = useState<string[]>(['Docker', 'MLOps']);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [result, setResult] = useState<CareerWhatIfResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const availableSuggestions = ['Docker', 'MLOps', 'FastAPI', 'Kubernetes', 'AWS', 'PyTorch', 'CI/CD'];

  useEffect(() => {
    runSimulation(selectedSkills);
  }, [activeEmployeeId]);

  const runSimulation = async (skillsToSimulate: string[]) => {
    if (!activeEmployeeId) return;
    try {
      setLoading(true);
      const data = await apiService.simulateCareerWhatIf({
        employeeId: activeEmployeeId,
        addedSkills: skillsToSimulate,
        targetRoleTitle: 'Machine Learning Engineer'
      });
      setResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const addSkill = (skill: string) => {
    if (!selectedSkills.includes(skill)) {
      const updated = [...selectedSkills, skill];
      setSelectedSkills(updated);
      runSimulation(updated);
    }
  };

  const removeSkill = (skill: string) => {
    const updated = selectedSkills.filter(s => s !== skill);
    setSelectedSkills(updated);
    runSimulation(updated);
  };

  const handleCustomAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSkillInput.trim() && !selectedSkills.includes(newSkillInput.trim())) {
      const updated = [...selectedSkills, newSkillInput.trim()];
      setSelectedSkills(updated);
      setNewSkillInput('');
      runSimulation(updated);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="relative rounded-3xl glass-panel p-6 sm:p-8 border border-cyan-500/30 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-cyan-400 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span>Career What-If & Strategic Mobility Modeling</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Career What-If Simulator
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Simulate hypothetical skill acquisitions and forecast your alignment improvements across internal job openings.
            </p>
          </div>
        </div>
      </div>

      {/* Skill Scenario Selector */}
      <div className="rounded-3xl glass-panel p-6 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Simulated Skills Palette:
        </h3>

        {/* Selected Skill Tags */}
        <div className="flex flex-wrap gap-2">
          {selectedSkills.map((s) => (
            <span
              key={s}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-semibold"
            >
              <span>+ {s}</span>
              <button onClick={() => removeSkill(s)} className="hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>

        {/* Suggested Quick Add Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
          <span className="text-xs text-slate-400">Quick suggestions:</span>
          {availableSuggestions
            .filter((s) => !selectedSkills.includes(s))
            .map((s) => (
              <button
                key={s}
                onClick={() => addSkill(s)}
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-300 text-xs font-medium transition"
              >
                + {s}
              </button>
            ))}
        </div>

        {/* Custom Input */}
        <form onSubmit={handleCustomAdd} className="flex gap-2 pt-2">
          <input
            type="text"
            placeholder="Type any skill (e.g. Terraform, GraphQL)..."
            value={newSkillInput}
            onChange={(e) => setNewSkillInput(e.target.value)}
            className="flex-1 px-4 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs rounded-xl shadow transition"
          >
            Add Scenario
          </button>
        </form>
      </div>

      {/* Projection Results */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[30vh] space-y-3">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          <p className="text-xs text-slate-400">Recalculating Neural Alignment Graphs...</p>
        </div>
      ) : result ? (
        <div className="space-y-6">
          {/* Alignment Lift Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 rounded-3xl glass-panel border border-slate-800">
              <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Current Baseline Match</span>
              <div className="text-3xl font-extrabold text-slate-300 font-mono">{result.currentAlignment}%</div>
              <p className="text-xs text-slate-400 mt-1">Based on verified document portfolio</p>
            </div>

            <div className="p-6 rounded-3xl glass-panel border border-cyan-500/40 shadow-lg shadow-cyan-950/30">
              <span className="text-xs text-cyan-400 uppercase tracking-wider block mb-1">Projected Match with Simulation</span>
              <div className="text-3xl font-extrabold text-cyan-300 font-mono">
                {result.projectedAlignment}%{' '}
                <span className="text-base text-emerald-400 font-normal">
                  (+{result.projectedAlignment - result.currentAlignment}%)
                </span>
              </div>
              <p className="text-xs text-cyan-200 mt-1">Potential pathway unblocking 2 internal engineering openings</p>
            </div>
          </div>

          {/* Strategic Advice Card */}
          <div className="p-5 rounded-2xl bg-cyan-950/30 border border-cyan-800/40 text-xs text-cyan-200 leading-relaxed">
            ✨ <strong>Strategic Insight:</strong> {result.careerAdvice}
          </div>

          {/* Unlocked Roles Matrix */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>Projected Internal Mobility Alignment:</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.unlockedRoles.map((role) => (
                <div
                  key={role.roleTitle}
                  className="p-5 rounded-2xl glass-panel border border-slate-800 hover:border-cyan-500/40 transition space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-base font-bold text-white">{role.roleTitle}</h4>
                      <span className="text-xs text-slate-400">{role.department}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Alignment</span>
                      <span className="text-lg font-bold text-cyan-300 font-mono">{role.projectedMatch}%</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300">
                    Key Unlocking Skill: <strong className="text-cyan-300">{role.keyUnlockingSkill}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
