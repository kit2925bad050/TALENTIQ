import React from 'react';
import { EmployeeSidebar } from '../layout/EmployeeSidebar';
import { HRSidebar } from '../layout/HRSidebar';
import { useAuth } from '../../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { role } = useAuth();
  if (role === 'hr_admin') {
    return <HRSidebar />;
  }
  return <EmployeeSidebar />;
};
