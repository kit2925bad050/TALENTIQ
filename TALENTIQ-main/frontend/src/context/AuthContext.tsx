import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserAuth, Employee } from '../types';
import { auth } from '../services/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { apiService } from '../services/api';

interface AuthContextType {
  user: UserAuth | null;
  role: 'employee' | 'hr_admin';
  profileStatus: 'INCOMPLETE' | 'EXTRACTED' | 'VERIFIED';
  employeeProfile: Employee | null;
  login: (user: UserAuth) => void;
  logout: () => Promise<void>;
  activeEmployeeId: string;
  refreshProfile: () => Promise<Employee | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserAuth | null>(() => {
    const saved = localStorage.getItem('talentiq_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [employeeProfile, setEmployeeProfile] = useState<Employee | null>(null);
  const [profileStatus, setProfileStatus] = useState<'INCOMPLETE' | 'EXTRACTED' | 'VERIFIED'>('INCOMPLETE');

  const role = user?.role || 'employee';
  const activeEmployeeId = user?.id || '';

  const refreshProfile = async (): Promise<Employee | null> => {
    if (!user?.id || user.role === 'hr_admin') {
      setEmployeeProfile(null);
      setProfileStatus('INCOMPLETE');
      return null;
    }
    try {
      const emp = await apiService.getEmployee(user.id);
      if (emp) {
        if (emp.profilePhotoUrl !== user.profilePhotoUrl) {
          setUser(prev => prev ? { ...prev, profilePhotoUrl: emp.profilePhotoUrl } : prev);
        }
        if (emp.profileStatus === 'VERIFIED' || (emp.skills && emp.skills.length > 0)) {
          setEmployeeProfile(emp);
          setProfileStatus('VERIFIED');
          return emp;
        }
      }
      setEmployeeProfile(null);
      setProfileStatus('INCOMPLETE');
      return null;
    } catch (e) {
      setEmployeeProfile(null);
      setProfileStatus('INCOMPLETE');
      return null;
    }
  };

  useEffect(() => {
    if (user) {
      localStorage.setItem('talentiq_user', JSON.stringify(user));
      if (user.role === 'employee') {
        refreshProfile();
      }
    } else {
      localStorage.removeItem('talentiq_user');
      setEmployeeProfile(null);
      setProfileStatus('INCOMPLETE');
    }
  }, [user?.id, user?.role]);

  // Listen for Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // If current state already has user with specific role, preserve or resolve
        const emailLower = (firebaseUser.email || '').toLowerCase();
        const isHR = emailLower.includes('admin') || emailLower.includes('hr') || emailLower === 'sarah.jenkins@talentiq.ai';
        const displayName = firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'User');
        
        setUser(prev => {
          const resolvedRole = prev?.role || (isHR ? 'hr_admin' : 'employee');
          return {
            id: firebaseUser.uid,
            email: firebaseUser.email || `${firebaseUser.uid}@talentiq.local`,
            name: displayName,
            role: resolvedRole,
            department: resolvedRole === 'hr_admin' ? 'People & Talent Intelligence' : 'Engineering',
            designation: resolvedRole === 'hr_admin' ? 'Director of Talent Mobility' : 'Candidate',
            profilePhotoUrl: prev?.profilePhotoUrl
          };
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const login = (newUser: UserAuth) => {
    setUser(newUser);
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      // ignore
    }
    setUser(null);
    setEmployeeProfile(null);
    setProfileStatus('INCOMPLETE');
    localStorage.removeItem('talentiq_user');
  };

  return (
    <AuthContext.Provider value={{
      user,
      role,
      profileStatus,
      employeeProfile,
      login,
      logout,
      activeEmployeeId,
      refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
