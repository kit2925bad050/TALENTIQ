import React from 'react';
import { EmployeeTopbar } from './EmployeeTopbar';
import { EmployeeSidebar } from './EmployeeSidebar';

interface EmployeeLayoutProps {
  children: React.ReactNode;
}

export const EmployeeLayout: React.FC<EmployeeLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 flex flex-col">
      <EmployeeTopbar />
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <EmployeeSidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-5xl">
          {children}
        </main>
      </div>
    </div>
  );
};
