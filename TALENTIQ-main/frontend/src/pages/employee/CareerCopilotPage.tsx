import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Sparkles, UserCheck, ShieldCheck, Upload } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { Employee } from '../../types';
import { CareerCopilotChat } from '../../components/copilot/CareerCopilotChat';
import { DocumentVerificationWizard } from '../../components/profile/DocumentVerificationWizard';

export const CareerCopilotPage: React.FC = () => {
  const { activeEmployeeId, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [activeEmployeeId]);

  const loadProfile = async () => {
    if (!activeEmployeeId) {
      setLoading(false);
      setEmployee(null);
      return;
    }
    try {
      setLoading(true);
      const data = await apiService.getEmployee(activeEmployeeId);
      setEmployee(data);
    } catch (e) {
      setEmployee(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-3">
          <Sparkles className="w-8 h-8 text-cyan-400 animate-spin" />
          <p className="text-xs text-slate-400">Initializing AI Career Copilot...</p>
        </div>
      </div>
    );
  }

  if (!employee || employee.profileStatus === 'INCOMPLETE' || (!employee.skills?.length && !employee.projects?.length && !employee.certifications?.length)) {
    return (
      <div className="space-y-6 pb-12">
        <div className="relative rounded-3xl glass-panel p-8 sm:p-12 border border-cyan-500/30 overflow-hidden shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mx-auto shadow-lg shadow-cyan-500/20">
            <Bot className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-xl mx-auto">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Career Copilot Requires Verified Profile
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Your AI Career Copilot analyzes your real verified experience to provide personalized mobility guidance and role coaching. Upload your credentials to begin.
            </p>
          </div>

          <div>
            <button
              onClick={() => setIsWizardOpen(true)}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-xl shadow-cyan-500/30 transition transform hover:scale-[1.02] active:scale-[0.98] inline-flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload Certificate / Resume
            </button>
          </div>
        </div>

        <DocumentVerificationWizard
          isOpen={isWizardOpen}
          onClose={() => setIsWizardOpen(false)}
          onVerified={async (verifiedEmp) => {
            setEmployee(verifiedEmp);
            await refreshProfile();
            loadProfile();
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-8">
      <CareerCopilotChat
        employee={employee}
        onNavigateToRole={(roleId) => navigate('/roles')}
      />
    </div>
  );
};
