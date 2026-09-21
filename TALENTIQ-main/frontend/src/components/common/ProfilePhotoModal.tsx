import React, { useState, useRef } from 'react';
import { Camera, Trash2, Eye, Upload, X, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { apiService } from '../../services/api';

interface ProfilePhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId: string;
  name: string;
  currentPhotoUrl?: string | null;
  onPhotoUpdated: (newPhotoUrl: string | null) => void;
}

export const ProfilePhotoModal: React.FC<ProfilePhotoModalProps> = ({
  isOpen,
  onClose,
  employeeId,
  name,
  currentPhotoUrl,
  onPhotoUpdated
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isViewingFull, setIsViewingFull] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const initialLetter = name?.trim() ? name.trim().charAt(0).toUpperCase() : 'U';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      setErrorMsg('Invalid file format. Allowed formats: JPG, JPEG, PNG, WEBP.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('File size exceeds the 5 MB limit. Please choose a smaller image.');
      return;
    }

    setSelectedFile(file);
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // 1. Request presigned URL
      const presignedRes = await apiService.getAvatarPresignedUrl({
        employeeId,
        fileName: selectedFile.name,
        fileType: selectedFile.type,
        fileSize: selectedFile.size
      });

      const { uploadUrl, fileUrl, s3Key } = presignedRes;

      // 2. Upload file
      const backendBase = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/api\/?$/, '');
      const fullUploadUrl = uploadUrl.startsWith('http') ? uploadUrl : `${backendBase}${uploadUrl}`;

      if (fullUploadUrl.includes('amazonaws.com')) {
        await fetch(fullUploadUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': selectedFile.type
          },
          body: selectedFile
        });
      } else {
        // Local upload endpoint fallback
        const formData = new FormData();
        formData.append('file', selectedFile);
        const delim = fullUploadUrl.includes('?') ? '&' : '?';
        await fetch(`${fullUploadUrl}${delim}employee_id=${encodeURIComponent(employeeId)}`, {
          method: 'POST',
          body: formData
        });
      }


      // 3. Confirm avatar persistence
      await apiService.confirmAvatar({
        employeeId,
        s3Key,
        photoUrl: fileUrl
      });

      setSuccessMsg('Profile photo updated successfully!');
      onPhotoUpdated(fileUrl);
      setTimeout(() => {
        onClose();
        setSelectedFile(null);
        setPreviewUrl(null);
        setSuccessMsg(null);
      }, 1000);
    } catch (err: any) {
      console.error('Avatar upload failed:', err);
      setErrorMsg(err.response?.data?.detail || err.message || 'Failed to upload profile photo.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to remove your profile photo? Your avatar will revert to your name initial.')) {
      return;
    }
    setIsDeleting(true);
    setErrorMsg(null);
    try {
      await apiService.deleteAvatar(employeeId);
      setSuccessMsg('Profile photo removed.');
      onPhotoUpdated(null);
      setSelectedFile(null);
      setPreviewUrl(null);
      setTimeout(() => {
        onClose();
        setSuccessMsg(null);
      }, 800);
    } catch (err: any) {
      console.error('Failed to remove photo:', err);
      setErrorMsg(err.response?.data?.detail || err.message || 'Failed to remove profile photo.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md p-6 bg-slate-900/90 border border-slate-700/60 rounded-2xl shadow-2xl shadow-cyan-950/40 text-slate-100">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent mb-1">
          Profile Photo Settings
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          Customize your real identity avatar across TALENTIQ AI.
        </p>

        {/* Current Avatar / Preview Preview */}
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="relative group">
            {previewUrl || currentPhotoUrl ? (
              <img
                src={previewUrl || currentPhotoUrl!}
                alt={name}
                className="w-28 h-28 rounded-full object-cover border-2 border-cyan-500/50 shadow-lg shadow-cyan-500/20 ring-4 ring-cyan-500/10"
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-cyan-600 via-blue-700 to-slate-900 border-2 border-cyan-400 flex items-center justify-center text-4xl font-extrabold text-white shadow-xl shadow-cyan-500/20">
                {initialLetter}
              </div>
            )}
          </div>
          <p className="mt-3 text-sm font-medium text-slate-200">{name}</p>
          <span className="text-xs text-slate-400">
            {currentPhotoUrl ? 'Custom Photo Active' : 'Initial Letter Avatar'}
          </span>
        </div>

        {/* Status Alerts */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/jpg"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Action Buttons */}
        <div className="space-y-2.5">
          {selectedFile ? (
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-cyan-500/25 disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Uploading to Secure Storage...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Confirm & Save Photo</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 font-medium rounded-xl transition-all"
            >
              <Camera className="w-4 h-4" />
              <span>{currentPhotoUrl ? '🔄 Change Photo' : '📷 Upload Photo'}</span>
            </button>
          )}

          {currentPhotoUrl && !selectedFile && (
            <>
              <button
                onClick={() => setIsViewingFull(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white font-medium rounded-xl transition-colors"
              >
                <Eye className="w-4 h-4 text-slate-400" />
                <span>👁 View Full Photo</span>
              </button>

              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 hover:text-rose-200 font-medium rounded-xl transition-colors disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-rose-400" />
                    <span>Removing...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>🗑 Remove Photo</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>

        <div className="mt-4 text-center">
          <p className="text-[11px] text-slate-500">
            Supported formats: JPG, PNG, WEBP &bull; Max 5 MB &bull; Encrypted in S3
          </p>
        </div>
      </div>

      {/* Full Photo Modal Viewer */}
      {isViewingFull && (previewUrl || currentPhotoUrl) && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg animate-in fade-in"
          onClick={() => setIsViewingFull(false)}
        >
          <div className="relative max-w-lg max-h-[85vh] p-2 bg-slate-900 border border-cyan-500/40 rounded-2xl overflow-hidden">
            <img
              src={previewUrl || currentPhotoUrl!}
              alt={name}
              className="max-h-[75vh] w-auto rounded-xl object-contain mx-auto"
            />
            <button
              onClick={() => setIsViewingFull(false)}
              className="mt-3 w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium"
            >
              Close Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
