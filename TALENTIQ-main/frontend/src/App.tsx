import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { EmployeeLayout } from './components/layout/EmployeeLayout';
import { HRLayout } from './components/layout/HRLayout';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { HRLoginPage } from './pages/hr/HRLoginPage';

// Employee Portal Pages
import { EmployeeDashboard } from './pages/employee/EmployeeDashboard';
import { EmployeeProfile } from './pages/employee/EmployeeProfile';
import { InternalRoles } from './pages/employee/InternalRoles';
import { SkillGapPage } from './pages/employee/SkillGapPage';
import { MentorLearningRoom } from './pages/employee/MentorLearningRoom';
import { CareerRoadmapPage } from './pages/employee/CareerRoadmapPage';
import { CareerCopilotPage } from './pages/employee/CareerCopilotPage';

// Talent Development Engine Pages
import { SkillPassportPage } from './pages/employee/SkillPassportPage';
import { SkillDNAPage } from './pages/employee/SkillDNAPage';
import { EvidenceExplorerPage } from './pages/employee/EvidenceExplorerPage';
import { SkillDependencyGraphPage } from './pages/employee/SkillDependencyGraphPage';
import { RoleSimulatorPage } from './pages/employee/RoleSimulatorPage';
import { SkillStressTestPage } from './pages/employee/SkillStressTestPage';
import { LearningFeedPage } from './pages/employee/LearningFeedPage';
import { MockInterviewPage } from './pages/employee/MockInterviewPage';
import { CareerSimulatorPage } from './pages/employee/CareerSimulatorPage';
import { TalentTwinPage } from './pages/employee/TalentTwinPage';
import { SkillGrowthPage } from './pages/employee/SkillGrowthPage';
import { InternalGigsPage } from './pages/employee/InternalGigsPage';

// HR Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminEmployees } from './pages/admin/AdminEmployees';
import { AdminRoles } from './pages/admin/AdminRoles';
import { AdminSkillsAnalytics } from './pages/admin/AdminSkillsAnalytics';
import { TeamBuilderPage } from './pages/admin/TeamBuilderPage';
import { HRSkillIntelligencePage } from './pages/admin/HRSkillIntelligencePage';

// Employee Protected Route Guard
const EmployeeProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, role } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // If HR admin attempts to enter Employee Portal, redirect to HR Portal
  if (role === 'hr_admin') {
    return <Navigate to="/hr/dashboard" replace />;
  }

  return <EmployeeLayout>{children}</EmployeeLayout>;
};

// HR Intelligence Protected Route Guard
const HRProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, role } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/hr/login" replace state={{ from: location }} />;
  }

  // If regular Employee attempts to enter HR Portal, redirect to Employee Portal
  if (role !== 'hr_admin') {
    return <Navigate to="/employee/dashboard" replace />;
  }

  return <HRLayout>{children}</HRLayout>;
};

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication & Landing */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/employee/login" element={<LoginPage />} />
          <Route path="/register" element={<LoginPage />} />
          <Route path="/hr/login" element={<HRLoginPage />} />

          {/* ========================================================== */}
          {/* 1. EMPLOYEE PORTAL (Protected)                             */}
          {/* ========================================================== */}
          <Route path="/employee/dashboard" element={<EmployeeProtectedRoute><EmployeeDashboard /></EmployeeProtectedRoute>} />
          <Route path="/employee/profile" element={<EmployeeProtectedRoute><EmployeeProfile /></EmployeeProtectedRoute>} />
          <Route path="/employee/evidence" element={<EmployeeProtectedRoute><EvidenceExplorerPage /></EmployeeProtectedRoute>} />
          <Route path="/employee/skill-passport" element={<EmployeeProtectedRoute><SkillPassportPage /></EmployeeProtectedRoute>} />
          <Route path="/employee/skill-dna" element={<EmployeeProtectedRoute><SkillDNAPage /></EmployeeProtectedRoute>} />
          <Route path="/employee/skill-gap" element={<EmployeeProtectedRoute><SkillGapPage /></EmployeeProtectedRoute>} />
          <Route path="/employee/skill-graph" element={<EmployeeProtectedRoute><SkillDependencyGraphPage /></EmployeeProtectedRoute>} />
          <Route path="/employee/learning-feed" element={<EmployeeProtectedRoute><LearningFeedPage /></EmployeeProtectedRoute>} />
          <Route path="/employee/learning-missions" element={<EmployeeProtectedRoute><LearningFeedPage /></EmployeeProtectedRoute>} />
          <Route path="/employee/mentor" element={<EmployeeProtectedRoute><MentorLearningRoom /></EmployeeProtectedRoute>} />
          <Route path="/employee/skill-stress-test" element={<EmployeeProtectedRoute><SkillStressTestPage /></EmployeeProtectedRoute>} />
          <Route path="/employee/role-simulator" element={<EmployeeProtectedRoute><RoleSimulatorPage /></EmployeeProtectedRoute>} />
          <Route path="/employee/mock-interview" element={<EmployeeProtectedRoute><MockInterviewPage /></EmployeeProtectedRoute>} />
          <Route path="/employee/roadmap" element={<EmployeeProtectedRoute><CareerRoadmapPage /></EmployeeProtectedRoute>} />
          <Route path="/employee/career-simulator" element={<EmployeeProtectedRoute><CareerSimulatorPage /></EmployeeProtectedRoute>} />
          <Route path="/employee/talent-twin" element={<EmployeeProtectedRoute><TalentTwinPage /></EmployeeProtectedRoute>} />
          <Route path="/employee/roles" element={<EmployeeProtectedRoute><InternalRoles /></EmployeeProtectedRoute>} />
          <Route path="/employee/internal-gigs" element={<EmployeeProtectedRoute><InternalGigsPage /></EmployeeProtectedRoute>} />
          <Route path="/employee/progress" element={<EmployeeProtectedRoute><SkillGrowthPage /></EmployeeProtectedRoute>} />

          {/* Employee Legacy URL Aliases */}
          <Route path="/dashboard" element={<Navigate to="/employee/dashboard" replace />} />
          <Route path="/employee" element={<Navigate to="/employee/dashboard" replace />} />
          <Route path="/profile" element={<Navigate to="/employee/profile" replace />} />
          <Route path="/roles" element={<Navigate to="/employee/roles" replace />} />
          <Route path="/skill-gap" element={<Navigate to="/employee/skill-gap" replace />} />
          <Route path="/mentor" element={<Navigate to="/employee/mentor" replace />} />
          <Route path="/roadmap" element={<Navigate to="/employee/roadmap" replace />} />
          <Route path="/assistant" element={<Navigate to="/employee/talent-twin" replace />} />

          {/* ========================================================== */}
          {/* 2. HR INTELLIGENCE PORTAL (Protected)                      */}
          {/* ========================================================== */}
          <Route path="/hr/dashboard" element={<HRProtectedRoute><AdminDashboard /></HRProtectedRoute>} />
          <Route path="/hr/employees" element={<HRProtectedRoute><AdminEmployees /></HRProtectedRoute>} />
          <Route path="/hr/roles" element={<HRProtectedRoute><AdminRoles /></HRProtectedRoute>} />
          <Route path="/hr/skill-intelligence" element={<HRProtectedRoute><HRSkillIntelligencePage /></HRProtectedRoute>} />
          <Route path="/hr/team-builder" element={<HRProtectedRoute><TeamBuilderPage /></HRProtectedRoute>} />
          <Route path="/hr/internal-gigs" element={<HRProtectedRoute><InternalGigsPage /></HRProtectedRoute>} />
          <Route path="/hr/analytics" element={<HRProtectedRoute><AdminSkillsAnalytics /></HRProtectedRoute>} />

          {/* HR Legacy URL Aliases */}
          <Route path="/hr" element={<Navigate to="/hr/dashboard" replace />} />
          <Route path="/admin" element={<Navigate to="/hr/dashboard" replace />} />
          <Route path="/admin/employees" element={<Navigate to="/hr/employees" replace />} />
          <Route path="/admin/roles" element={<Navigate to="/hr/roles" replace />} />
          <Route path="/admin/skills" element={<Navigate to="/hr/skill-intelligence" replace />} />
          <Route path="/admin/analytics" element={<Navigate to="/hr/analytics" replace />} />
          <Route path="/admin/team-builder" element={<Navigate to="/hr/team-builder" replace />} />
          <Route path="/admin/skill-intelligence" element={<Navigate to="/hr/skill-intelligence" replace />} />
          <Route path="/admin/internal-gigs" element={<Navigate to="/hr/internal-gigs" replace />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
