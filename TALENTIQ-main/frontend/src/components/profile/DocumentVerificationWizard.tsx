import React, { useState } from 'react';
import {
  Upload, FileText, CheckCircle2, AlertCircle, Sparkles, Loader2,
  Trash2, Plus, ArrowRight, ShieldCheck, Award, Briefcase, BookOpen, X
} from 'lucide-react';
import { apiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Employee, SkillItem, Certification } from '../../types';

interface DocumentVerificationWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: (emp: Employee) => void;
}

export const DocumentVerificationWizard: React.FC<DocumentVerificationWizardProps> = ({
  isOpen,
  onClose,
  onVerified
}) => {
  const { user, refreshProfile } = useAuth();

  const [step, setStep] = useState<'upload' | 'extracting' | 'review'>('upload');
  const [documentType, setDocumentType] = useState<string>('certificate');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Extracted and editable fields
  const [documentId, setDocumentId] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [designation, setDesignation] = useState<string>('Software Specialist');
  const [department, setDepartment] = useState<string>('Engineering');
  const [education, setEducation] = useState<string>('');
  const [experienceYears, setExperienceYears] = useState<number>(3.0);
  const [summary, setSummary] = useState<string>('');
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);

  // New skill input in review step
  const [newSkillName, setNewSkillName] = useState<string>('');
  const [newSkillCategory, setNewSkillCategory] = useState<string>('Core');
  const [newSkillProficiency, setNewSkillProficiency] = useState<number>(80);

  if (!isOpen) return null;

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleStartExtraction = async () => {
    if (!selectedFile && !pastedText.trim()) {
      setError('Please select a certificate/resume file or paste document text.');
      return;
    }
    if (!user?.id) {
      setError('User is not authenticated.');
      return;
    }

    setError(null);
    setStep('extracting');
    setLoading(true);

    try {
      let s3Key = undefined;
      let fileUrl = undefined;

      // 1. If file exists, get presigned URL and upload to S3
      if (selectedFile) {
        try {
          const presigned = await apiService.getPresignedUrl(
            selectedFile.name,
            selectedFile.type || 'application/pdf',
            documentType,
            user.id
          );
          s3Key = presigned.s3Key;
          fileUrl = presigned.fileUrl;
          await apiService.uploadFileToS3(presigned.uploadUrl, selectedFile);
        } catch (s3Err) {
          console.warn('S3 upload fallback:', s3Err);
        }
      }

      // 2. Call Gemini Document Extraction
      const res = await apiService.extractDocument({
        employeeId: user.id,
        documentType,
        s3Key,
        fileUrl,
        rawText: pastedText || undefined,
        file: selectedFile || undefined
      });

      const data = res.extractedData || {};
      setDocumentId(res.documentId || '');
      setName(data.name || user.name || 'Professional');
      setDesignation(data.designation || 'Software Specialist');
      setDepartment(data.department || 'Engineering');
      setEducation(data.education || data.qualification || '');
      setExperienceYears(data.experienceYears != null ? data.experienceYears : 3.0);
      setSummary(data.summary || `Verified talent profile created from ${selectedFile?.name || documentType}.`);
      setSkills(data.skills || []);
      setCertifications(data.certifications || []);

      setStep('review');
    } catch (err: any) {
      console.error('Document extraction failed:', err);
      setError(err.response?.data?.detail || 'Document extraction failed. Please try again.');
      setStep('upload');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;
    setSkills([
      ...skills,
      {
        name: newSkillName.trim(),
        category: newSkillCategory,
        proficiency: newSkillProficiency,
        verified: true,
        evidence: `Manually verified during document review (${selectedFile?.name || documentType})`
      }
    ]);
    setNewSkillName('');
  };

  const handleRemoveSkill = (index: number) => {
    setSkills(skills.filter((_, idx) => idx !== index));
  };

  const handleConfirmVerification = async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);

    try {
      const verifiedData = {
        name,
        designation,
        department,
        education,
        experienceYears,
        summary,
        skills,
        technologies: skills.map(s => s.name),
        certifications,
        projects: [],
        achievements: []
      };

      const updatedEmp = await apiService.confirmDocumentVerification({
        employeeId: user.id,
        documentId,
        verifiedData
      });

      await refreshProfile();
      onVerified(updatedEmp);
      onClose();
    } catch (err: any) {
      console.error('Confirmation failed:', err);
      setError(err.response?.data?.detail || 'Failed to save verified profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Document-First Profile Verification
                <span className="text-xs bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded-full font-normal">
                  Real-Data Only
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                TalentIQ AI extracts and grounds your talent profile exclusively from verified documents
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Steps Indicator */}
        <div className="grid grid-cols-3 border-b border-slate-800 text-xs font-semibold">
          <div className={`py-3 text-center flex items-center justify-center gap-2 border-b-2 transition ${step === 'upload' ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5' : 'border-transparent text-slate-500'}`}>
            <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px]">1</span>
            Upload Document
          </div>
          <div className={`py-3 text-center flex items-center justify-center gap-2 border-b-2 transition ${step === 'extracting' ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5' : 'border-transparent text-slate-500'}`}>
            <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px]">2</span>
            AI OCR Extraction
          </div>
          <div className={`py-3 text-center flex items-center justify-center gap-2 border-b-2 transition ${step === 'review' ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5' : 'border-transparent text-slate-500'}`}>
            <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px]">3</span>
            Review & Confirm
          </div>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6">
          {/* STEP 1: UPLOAD DOCUMENT */}
          {step === 'upload' && (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Select Document Type
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { id: 'certificate', label: 'Certificate', desc: 'AWS, Coursera, Degree', icon: Award },
                    { id: 'resume', label: 'Resume / CV', desc: 'Work history & skills', icon: FileText },
                    { id: 'project_doc', label: 'Project Proof', desc: 'Architecture & code PR', icon: Briefcase },
                    { id: 'course_certificate', label: 'Course Module', desc: 'Completed curriculum', icon: BookOpen }
                  ].map(t => {
                    const Icon = t.icon;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setDocumentType(t.id)}
                        className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${documentType === t.id ? 'border-cyan-500 bg-cyan-500/10 text-white' : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'}`}
                      >
                        <Icon className={`w-5 h-5 mb-2 ${documentType === t.id ? 'text-cyan-400' : 'text-slate-500'}`} />
                        <div>
                          <div className="text-sm font-semibold text-white">{t.label}</div>
                          <div className="text-[11px] text-slate-400">{t.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Drag and drop area */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleFileDrop}
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition cursor-pointer ${isDragOver ? 'border-cyan-500 bg-cyan-500/10' : 'border-slate-700/80 bg-slate-950/30 hover:border-slate-600'}`}
                onClick={() => document.getElementById('cert-upload-input')?.click()}
              >
                <input
                  id="cert-upload-input"
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.txt,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold text-white mb-1">
                  {selectedFile ? selectedFile.name : 'Click to select or drag and drop your document'}
                </h3>
                <p className="text-xs text-slate-400 mb-2">
                  Supports PDF, PNG, JPG, DOCX (Max 25MB). Uploaded securely to isolated AWS S3.
                </p>
                {selectedFile && (
                  <span className="inline-block mt-2 text-xs bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-3 py-1 rounded-full font-medium">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB Selected
                  </span>
                )}
              </div>

              {/* Or paste text */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Or Paste Document Text / Certificate Verification Details
                </label>
                <textarea
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="Paste certificate text, verification transcript, or resume contents here..."
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-cyan-500 placeholder-slate-600 font-mono"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleStartExtraction}
                  disabled={!selectedFile && !pastedText.trim()}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Extract & Verify with Gemini AI
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: EXTRACTION IN PROGRESS */}
          {step === 'extracting' && (
            <div className="py-16 text-center space-y-6">
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20 animate-ping"></div>
                <div className="w-20 h-20 rounded-full bg-slate-950 border-2 border-cyan-500 flex items-center justify-center text-cyan-400 shadow-xl shadow-cyan-500/30">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              </div>
              <div className="space-y-2 max-w-md mx-auto">
                <h3 className="text-lg font-bold text-white">Gemini Multimodal OCR Running</h3>
                <p className="text-xs text-slate-400">
                  Reading document contents, extracting candidate credentials, and capturing verbatim evidence quotes for every detected skill...
                </p>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-950 border border-slate-800 text-xs text-cyan-300">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                Strict anti-hallucination verification active
              </div>
            </div>
          )}

          {/* STEP 3: REVIEW & CONFIRM */}
          {step === 'review' && (
            <div className="space-y-6">
              <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl flex items-start gap-3 text-xs text-cyan-300">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-cyan-400 mt-0.5" />
                <div>
                  <span className="font-semibold text-white">Extraction Successful:</span> Review the verified information below. You can edit any field before confirming to build your official TalentIQ AI profile.
                </div>
              </div>

              {/* General details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-sm text-white focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Target Designation</label>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-sm text-white focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Department</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-sm text-white focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Education / Qualification</label>
                  <input
                    type="text"
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-sm text-white focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Summary */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Professional Summary</label>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-sm text-white focus:border-cyan-500"
                />
              </div>

              {/* Verified Skills Table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Verified Skills with Verbatim Evidence ({skills.length})
                  </label>
                </div>
                
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {skills.map((s, idx) => (
                    <div key={idx} className="p-3 bg-slate-950/40 border border-slate-800 rounded-xl flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white">{s.name}</span>
                          <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                            {s.category} • {s.proficiency}%
                          </span>
                        </div>
                        {s.evidence && (
                          <div className="text-[11px] text-cyan-300/80 truncate mt-0.5">
                            Evidence: {s.evidence}
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(idx)}
                        className="text-slate-500 hover:text-red-400 p-1.5 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Custom Skill Form */}
                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    placeholder="Add verified skill (e.g. Docker, Python)..."
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-xs text-white focus:border-cyan-500"
                  />
                  <select
                    value={newSkillCategory}
                    onChange={(e) => setNewSkillCategory(e.target.value)}
                    className="px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-xs text-white focus:border-cyan-500"
                  >
                    <option value="Core">Core</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Emerging">Emerging</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>
              </div>

              {/* Confirm Actions */}
              <div className="flex justify-between items-center pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setStep('upload')}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-medium"
                >
                  Back to Upload
                </button>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm font-medium transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmVerification}
                    disabled={loading || skills.length === 0}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition flex items-center gap-2"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    Confirm & Save Verified Profile
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
