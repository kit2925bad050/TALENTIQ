import React from 'react';
import { HRTopbar } from './HRTopbar';
import { HRSidebar } from './HRSidebar';

interface HRLayoutProps {
  children: React.ReactNode;
}

export const HRLayout: React.FC<HRLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 flex flex-col">
      <HRTopbar />
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <HRSidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-5xl">
          {children}
        </main>
      </div>
    </div>
  );
};
