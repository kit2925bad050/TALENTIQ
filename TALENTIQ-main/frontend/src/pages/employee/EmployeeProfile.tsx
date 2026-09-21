import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  User,
  Mail,
  MapPin,
  GraduationCap,
  Briefcase,
  Award,
  Upload,
  BrainCircuit,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Plus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { Employee, HiddenSkill, DocumentItem } from '../../types';
import { SkillGraph } from '../../components/profile/SkillGraph';
import { HiddenSkillsCard } from '../../components/profile/HiddenSkillsCard';
import { DocumentVerificationWizard } from '../../components/profile/DocumentVerificationWizard';
import { UserAvatar } from '../../components/common/UserAvatar';

export const EmployeeProfile: React.FC = () => {
  const { activeEmployeeId, refreshProfile } = useAuth();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
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
      const [empData, docsData] = await Promise.all([
        apiService.getEmployee(activeEmployeeId).catch(() => null),
        apiService.getEmployeeDocuments(activeEmployeeId).catch(() => [])
      ]);
      setEmployee(empData);
      setDocuments(docsData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-3">
          <Sparkles className="w-8 h-8 text-cyan-400 animate-spin" />
          <p className="text-xs text-slate-400">Loading AI Profile Matrix...</p>
        </div>
      </div>
    );
  }

  // UNVERIFIED / EMPTY STATE
  if (!employee || employee.profileStatus === 'INCOMPLETE' || (!employee.skills?.length && !employee.projects?.length && !employee.certifications?.length)) {
    return (
      <div className="space-y-6 pb-12">
        <div className="relative rounded-3xl glass-panel p-8 sm:p-12 border border-cyan-500/30 overflow-hidden shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mx-auto shadow-lg shadow-cyan-500/20">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              AI Talent Profile Not Verified
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Your verified skills, hidden competencies, and certifications will be dynamically extracted once you upload your official documents.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 max-w-lg mx-auto text-xs text-slate-400">
            Upload your certificate (AWS, Azure, GCP, Coursera), university degree, or resume to build your verified talent graph.
          </div>

          <div>
            <button
              onClick={() => setIsWizardOpen(true)}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-base shadow-xl shadow-cyan-500/30 transition transform hover:scale-[1.02] active:scale-[0.98] inline-flex items-center gap-2"
            >
              <Upload className="w-5 h-5" />
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
    <div className="space-y-6 pb-12">
      {/* Profile Header Card */}
      <div className="rounded-3xl glass-panel p-6 sm:p-8 border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <UserAvatar
              name={employee.name}
              photoUrl={employee.profilePhotoUrl}
              employeeId={employee.id}
              size="2xl"
              editable={true}
              onPhotoUpdated={async (url) => {
                setEmployee(prev => prev ? { ...prev, profilePhotoUrl: url || undefined } : null);
                await refreshProfile();
              }}
            />

            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-2xl font-bold text-white tracking-tight">{employee.name}</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-cyan-400" />
                  Verified Profile
                </span>
              </div>
              <p className="text-sm text-cyan-300 font-medium mt-0.5">{employee.designation || 'Specialist'}</p>
              
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-2">
                <span className="flex items-center space-x-1">
                  <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                  <span>{employee.department || 'Engineering'} • {employee.experienceYears || 0} yrs exp</span>
                </span>
                {employee.location && (
                  <span className="flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>{employee.location}</span>
                  </span>
                )}
                {employee.education && (
                  <span className="flex items-center space-x-1">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-500" />
                    <span>{employee.education}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action to Verify More Documents */}
          <div className="flex flex-col items-start md:items-end gap-2">
            <button
              onClick={() => setIsWizardOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 border border-cyan-500/40 text-xs font-semibold text-cyan-300 flex items-center space-x-2 transition-all shadow-md shadow-cyan-500/10"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Verify Another Document</span>
            </button>
            <span className="text-[10px] text-slate-400">
              {documents.length} verified S3 document{documents.length === 1 ? '' : 's'} on record
            </span>
          </div>
        </div>

        {/* AI Executive Summary */}
        {employee.summary && (
          <div className="mt-6 pt-6 border-t border-slate-800">
            <div className="flex items-center space-x-2 text-xs font-semibold text-cyan-400 mb-2">
              <Sparkles className="w-4 h-4" />
              <span>AI Professional Capability Summary</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
              {employee.summary}
            </p>
          </div>
        )}
      </div>

      {/* Verified S3 Documents Evidence Bar */}
      {documents.length > 0 && (
        <div className="rounded-2xl glass-panel p-5 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Verified Documents & S3 Evidence Vault ({documents.length})
              </h3>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {documents.map((doc) => (
              <div key={doc.documentId} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-white truncate" title={doc.fileName}>{doc.fileName}</p>
                  <p className="text-[10px] text-slate-400 uppercase font-mono mt-0.5">{doc.documentType}</p>
                  <div className="flex items-center gap-1 mt-1 text-[10px] text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Verified in Firestore</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Major Feature: Hidden & Transferable Skill Detection */}
      <HiddenSkillsCard
        employeeId={employee.id}
        hiddenSkills={employee.hiddenSkills || []}
        onSkillsDiscovered={(discovered) => {
          setEmployee(prev => prev ? { ...prev, hiddenSkills: discovered } : null);
        }}
      />

      {/* Verified Skills Graph & Enterprise Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Skills Graph */}
        <div className="rounded-2xl glass-panel p-6 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-cyan-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Skill Intelligence Matrix ({employee.skills?.length || 0})
              </h3>
            </div>
          </div>
          <SkillGraph skills={employee.skills || []} />
        </div>

        {/* Enterprise Projects & Evidence */}
        <div className="rounded-2xl glass-panel p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Briefcase className="w-5 h-5 text-purple-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Verified Projects & Evidence ({employee.projects?.length || 0})
              </h3>
            </div>
          </div>

          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {(!employee.projects || employee.projects.length === 0) ? (
              <p className="text-xs text-slate-500 py-4 text-center">No projects extracted yet.</p>
            ) : (
              employee.projects.map((proj, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/80 hover:border-purple-500/30 transition-all space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white">{proj.title}</h4>
                      {proj.role && <span className="text-[10px] text-purple-300">{proj.role}</span>}
                    </div>
                  </div>

                  {proj.description && (
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {proj.description}
                    </p>
                  )}

                  {proj.impact && (
                    <div className="p-2 rounded-lg bg-cyan-950/20 border border-cyan-800/30 text-[11px] text-cyan-300">
                      <strong>Measured Impact:</strong> {proj.impact}
                    </div>
                  )}

                  {proj.technologies && proj.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {proj.technologies.map(t => (
                        <span key={t} className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Certifications */}
          <div className="pt-4 border-t border-slate-800">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Verified Certifications ({employee.certifications?.length || 0})
            </h4>
            <div className="space-y-2">
              {(!employee.certifications || employee.certifications.length === 0) ? (
                <p className="text-xs text-slate-500 py-2">No certifications listed.</p>
              ) : (
                employee.certifications.map((c, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                    <span className="font-semibold text-white">{c.name}</span>
                    <span className="text-[10px] text-slate-400">{c.issuer} {c.issueDate ? `• ${c.issueDate}` : ''}</span>
                  </div>
                ))
              )}
            </div>
          </div>
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
};
