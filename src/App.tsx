import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import AppLayout from './components/layout/AppLayout';
import AuthLayout from './features/auth/AuthLayout';

// Public & Auth Screens
import Splash from './features/public/Splash';
import Onboarding from './features/public/Onboarding';
import RoleSelect from './features/public/RoleSelect';
import Login from './features/auth/Login';
import Register from './features/auth/Register';
import ForgotPassword from './features/auth/ForgotPassword';
import ResetPassword from './features/auth/ResetPassword';

// Utility Screens
import Settings from './features/utility/Settings';
import ThemeCustomization from './features/utility/ThemeCustomization';
import PrivacySettings from './features/utility/PrivacySettings';
import NotificationSettings from './features/utility/NotificationSettings';
import HelpSupport from './features/utility/HelpSupport';
import TermsConditions from './features/utility/TermsConditions';
import AboutApplication from './features/utility/AboutApplication';

// Project Management Screens
import MainDashboard from './features/dashboard/MainDashboard';
import CreateProject from './features/projects/CreateProject';
import ProjectList from './features/projects/ProjectList';
import ProjectDetails from './features/projects/ProjectDetails';
import ProjectKanban from './features/projects/ProjectKanban';
import Messages from './features/communication/Messages';
import WalletDashboard from './features/billing/WalletDashboard';
import Profile from './features/profile/Profile';
import SearchResults from './features/search/SearchResults';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <Router>
          <Routes>
            {/* Initial Flow */}
            <Route path="/" element={<Splash />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/role-select" element={<RoleSelect />} />
            
            {/* Auth Flow */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
            </Route>
            
            {/* Protected Routes */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<MainDashboard />} />
              <Route path="/projects" element={<ProjectList />} />
              <Route path="/projects/create" element={<CreateProject />} />
              <Route path="/projects/:id" element={<ProjectDetails />} />
              <Route path="/projects/:id/tracker" element={<ProjectKanban />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/wallet" element={<WalletDashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/search" element={<SearchResults />} />
              
              {/* Utility Routes */}
              <Route path="/settings" element={<Settings />} />
              <Route path="/settings/appearance" element={<ThemeCustomization />} />
              <Route path="/settings/privacy" element={<PrivacySettings />} />
              <Route path="/settings/notifications" element={<NotificationSettings />} />
              <Route path="/support" element={<HelpSupport />} />
              <Route path="/terms" element={<TermsConditions />} />
              <Route path="/about" element={<AboutApplication />} />
            </Route>
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
