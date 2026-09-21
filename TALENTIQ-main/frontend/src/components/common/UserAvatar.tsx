import React, { useState } from 'react';
import { Camera } from 'lucide-react';
import { ProfilePhotoModal } from './ProfilePhotoModal';

export interface UserAvatarProps {
  name?: string;
  photoUrl?: string | null;
  employeeId?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  editable?: boolean;
  onPhotoUpdated?: (newPhotoUrl: string | null) => void;
  className?: string;
  showOnlineStatus?: boolean;
}

const sizeClasses = {
  xs: {
    container: 'w-6 h-6 text-xs',
    camera: 'w-2 h-2',
    status: 'w-1.5 h-1.5 bottom-0 right-0'
  },
  sm: {
    container: 'w-8 h-8 text-sm font-semibold',
    camera: 'w-2.5 h-2.5',
    status: 'w-2 h-2 bottom-0 right-0'
  },
  md: {
    container: 'w-10 h-10 text-base font-bold',
    camera: 'w-3 h-3',
    status: 'w-2.5 h-2.5 bottom-0 right-0'
  },
  lg: {
    container: 'w-12 h-12 text-lg font-bold',
    camera: 'w-3.5 h-3.5',
    status: 'w-3 h-3 bottom-0.5 right-0.5'
  },
  xl: {
    container: 'w-16 h-16 text-2xl font-bold',
    camera: 'w-4 h-4',
    status: 'w-3.5 h-3.5 bottom-1 right-1'
  },
  '2xl': {
    container: 'w-24 h-24 text-4xl font-extrabold',
    camera: 'w-5 h-5',
    status: 'w-4 h-4 bottom-1 right-1'
  }
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name = 'User',
  photoUrl,
  employeeId = 'me',
  size = 'md',
  editable = false,
  onPhotoUpdated,
  className = '',
  showOnlineStatus = false
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  const initialLetter = name?.trim() ? name.trim().charAt(0).toUpperCase() : 'U';
  const currentSize = sizeClasses[size] || sizeClasses.md;

  const handleClick = (e: React.MouseEvent) => {
    if (editable) {
      e.stopPropagation();
      setIsModalOpen(true);
    }
  };

  const handlePhotoUpdated = (newUrl: string | null) => {
    setImgError(false);
    if (onPhotoUpdated) {
      onPhotoUpdated(newUrl);
    }
  };

  const hasPhoto = !!photoUrl && !imgError;

  return (
    <>
      <div
        onClick={handleClick}
        className={`relative inline-flex shrink-0 items-center justify-center rounded-full select-none transition-all ${
          editable ? 'cursor-pointer group hover:ring-2 hover:ring-cyan-400 hover:ring-offset-2 hover:ring-offset-slate-900' : ''
        } ${className}`}
      >
        {hasPhoto ? (
          <img
            src={photoUrl}
            alt={name}
            onError={() => setImgError(true)}
            className={`${currentSize.container} rounded-full object-cover border border-cyan-500/30 shadow-md shadow-cyan-950/40`}
          />
        ) : (
          <div
            className={`${currentSize.container} rounded-full bg-gradient-to-br from-cyan-600 via-blue-700 to-slate-900 border border-cyan-400/40 text-cyan-50 flex items-center justify-center shadow-md shadow-cyan-950/40`}
          >
            {initialLetter}
          </div>
        )}

        {/* Camera Overlay Badge for Editable mode */}
        {editable && (
          <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <Camera className={`${currentSize.camera} text-white drop-shadow`} />
          </div>
        )}

        {/* Online Status Indicator */}
        {showOnlineStatus && (
          <span
            className={`absolute ${currentSize.status} rounded-full bg-emerald-500 ring-2 ring-slate-900`}
          />
        )}
      </div>

      {editable && (
        <ProfilePhotoModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          employeeId={employeeId}
          name={name}
          currentPhotoUrl={hasPhoto ? photoUrl : null}
          onPhotoUpdated={handlePhotoUpdated}
        />
      )}
    </>
  );
};
