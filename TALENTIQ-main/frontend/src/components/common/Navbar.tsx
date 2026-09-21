import React from 'react';
import { EmployeeTopbar } from '../layout/EmployeeTopbar';
import { HRTopbar } from '../layout/HRTopbar';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC<{ onDataRefresh?: () => void }> = (props) => {
  const { role } = useAuth();
  if (role === 'hr_admin') {
    return <HRTopbar {...props} />;
  }
  return <EmployeeTopbar {...props} />;
};
