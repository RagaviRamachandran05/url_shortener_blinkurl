
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider }         from './context/ToastContext';
import { ThemeProvider }         from './context/ThemeContext';
import Navbar        from './components/Navbar';
import LoginPage     from './pages/LoginPage';
import SignupPage    from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import CreateUrlPage from './pages/CreateUrlPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ProfilePage   from './pages/ProfilePage';
import NotFoundPage  from './pages/NotFoundPage';
import ForgotPassword from './pages/ForgotPassword';
import ResetPasswordPage from './pages/ResetPasswordPage';
import BulkUploadPage from './pages/BulkUploadPage';
import PublicStatsPage from './pages/PublicStatsPage';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return (
    <div className="loading-center" style={{ height: '100vh' }}>
      <div className="spinner" /><span>Loading...</span>
    </div>
  );
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function GuestRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
}

// App routes wrapper
function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        {/* Core Directives */}
        <Route path="/"          element={<Navigate to="/dashboard" replace />} />
        
        {/* Guest Authentication Flow Routes */}
        <Route path="/login"     element={<GuestRoute><LoginPage  /></GuestRoute>} />
        <Route path="/signup"    element={<GuestRoute><SignupPage /></GuestRoute>} />
        <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
        <Route path="/reset-password/:token" element={<GuestRoute><ResetPasswordPage /></GuestRoute>} />
        
        {/* Private Protected Management Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/create"    element={<ProtectedRoute><CreateUrlPage /></ProtectedRoute>} />
        <Route path="/analytics/:id" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
        <Route path="/profile"   element={<ProtectedRoute><ProfilePage   /></ProtectedRoute>} />
        <Route path="/bulk" element={<ProtectedRoute><BulkUploadPage /></ProtectedRoute>} />
        
        {/* Unprotected Public Metrics View Page */}
        <Route path="/stats/:shortCode" element={<PublicStatsPage />} />
        
        {/* Fallback Catch-All Route */}
        <Route path="*"          element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    /* Active future flags to completely eliminate React Router v6 console warning clutter */
    <BrowserRouter 
      future={{ 
        v7_startTransition: true, 
        v7_relativeSplatPath: true 
      }}
    >
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <AppRoutes />
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}






// import React from 'react';
// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// import { AuthProvider, useAuth } from './context/AuthContext';
// import { ToastProvider }         from './context/ToastContext';
// import { ThemeProvider }         from './context/ThemeContext';
// import Navbar        from './components/Navbar';
// import LoginPage     from './pages/LoginPage';
// import SignupPage    from './pages/SignupPage';
// import DashboardPage from './pages/DashboardPage';
// import CreateUrlPage from './pages/CreateUrlPage';
// import AnalyticsPage from './pages/AnalyticsPage';
// import ProfilePage   from './pages/ProfilePage';
// import NotFoundPage  from './pages/NotFoundPage';
// import ForgotPassword from './pages/ForgotPassword';
// import ResetPasswordPage from './pages/ResetPasswordPage';
// import BulkUploadPage from './pages/BulkUploadPage';
// import PublicStatsPage from './pages/PublicStatsPage';

// function ProtectedRoute({ children }) {
//   const { isAuthenticated, loading } = useAuth();
//   if (loading) return (
//     <div className="loading-center" style={{ height: '100vh' }}>
//       <div className="spinner" /><span>Loading...</span>
//     </div>
//   );
//   return isAuthenticated ? children : <Navigate to="/login" replace />;
// }

// function GuestRoute({ children }) {
//   const { isAuthenticated, loading } = useAuth();
//   if (loading) return null;
//   return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
// }

// // App routes wrapper
// function AppRoutes() {
//   return (
//     <>
//       <Navbar />
//       <Routes>
//         <Route path="/"          element={<Navigate to="/dashboard" replace />} />
//         <Route path="/login"     element={<GuestRoute><LoginPage  /></GuestRoute>} />
//         <Route path="/signup"    element={<GuestRoute><SignupPage /></GuestRoute>} />
//         <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
//         <Route path="/create"    element={<ProtectedRoute><CreateUrlPage /></ProtectedRoute>} />
//         <Route path="/analytics/:id" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
//         <Route path="/profile"   element={<ProtectedRoute><ProfilePage   /></ProtectedRoute>} />
//         <Route path="/forgot-password" element={<ForgotPassword />} />
//         <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
//         <Route path="/bulk" element={<ProtectedRoute><BulkUploadPage /></ProtectedRoute>} />
//        <Route path="/stats/:shortCode" element={<PublicStatsPage />} />
//         <Route path="*"          element={<NotFoundPage />} />
//       </Routes>
//     </>
//   );
// }

// export default function App() {
//   return (
//     /* Added future flags here to completely eliminate console warning clutter */
//     <BrowserRouter 
//       future={{ 
//         v7_startTransition: true, 
//         v7_relativeSplatPath: true 
//       }}
//     >
//       <ThemeProvider>
//         <AuthProvider>
//           <ToastProvider>
//             <AppRoutes />
//           </ToastProvider>
//         </AuthProvider>
//       </ThemeProvider>
//     </BrowserRouter>
//   );
// }