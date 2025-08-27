import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext, AuthProvider } from './contexts/AuthContext';
import Login from './components/Login';
import Register from './components/Register';

// Admin Components
import AdminDashboard from './components/AdminDashboard';
import AdminBooks from './components/AdminBooks';
import AdminCategories from './components/AdminCategories';
import AdminPublishers from './components/AdminPublishers';
import AdminUserManagement from './components/admin/AdminUserManagement';
import AdminMemberManagement from './components/admin/AdminMemberManagement';
import AdminLendingManagement from './components/admin/AdminLendingManagement';
import AdminSettings from './components/admin/AdminSettings';

// Librarian Components
import LibrarianDashboard from './components/LibrarianDashboard';
import LibrarianBooks from './components/librarian/LibrarianBooks';
import LibrarianLendingManagement from './components/librarian/LibrarianLendingManagement';
import LibrarianMemberManagement from './components/librarian/LibrarianMemberManagement';
import LibrarianReports from './components/librarian/LibrarianReports';

// Siswa Components
import SiswaDashboard from './components/SiswaDashboard';
import SiswaBooks from './components/SiswaBooks';
import SiswaLendings from './components/siswa/SiswaLendings';
import SiswaNotifications from './components/siswa/SiswaNotifications';

// Shared Components
import Profile from './components/Profile';
import Books from './components/Books';
import UserPeminjaman from './components/UserPeminjaman';
import Unauthorized from './components/Unauthorized';
import NotFound from './components/NotFound';
import LandingPage from './components/LandingPage';
import './App.css';

// Protected Route component  
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has required role
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

// Public Route component (redirect to dashboard if already authenticated)
const PublicRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  if (user) {
    // Redirect to appropriate dashboard
    switch (user.role) {
      case 'admin':
        return <Navigate to="/admin/dashboard" replace />;
      case 'librarian':
        return <Navigate to="/librarian/dashboard" replace />;
      case 'siswa':
      default:
        return <Navigate to="/siswa/dashboard" replace />;
    }
  }

  return children;
};

// Main App component
function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Landing Page */}
            <Route path="/" element={<LandingPage />} />

            {/* Public Routes */}
            <Route path="/login" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />
            <Route path="/register" element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/books" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminBooks />
              </ProtectedRoute>
            } />
            <Route path="/admin/categories" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminCategories />
              </ProtectedRoute>
            } />
            <Route path="/admin/publishers" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminPublishers />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminUserManagement />
              </ProtectedRoute>
            } />
            <Route path="/admin/members" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminMemberManagement />
              </ProtectedRoute>
            } />
            <Route path="/admin/lendings" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLendingManagement />
              </ProtectedRoute>
            } />
            <Route path="/admin/settings" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminSettings />
              </ProtectedRoute>
            } />

            {/* Librarian Routes */}
            <Route path="/librarian/dashboard" element={
              <ProtectedRoute allowedRoles={['librarian']}>
                <LibrarianDashboard />
              </ProtectedRoute>
            } />
            <Route path="/librarian/books" element={
              <ProtectedRoute allowedRoles={['librarian']}>
                <LibrarianBooks />
              </ProtectedRoute>
            } />
            <Route path="/librarian/lendings" element={
              <ProtectedRoute allowedRoles={['librarian']}>
                <LibrarianLendingManagement />
              </ProtectedRoute>
            } />
            <Route path="/librarian/members" element={
              <ProtectedRoute allowedRoles={['librarian']}>
                <LibrarianMemberManagement />
              </ProtectedRoute>
            } />
            <Route path="/librarian/reports" element={
              <ProtectedRoute allowedRoles={['librarian']}>
                <LibrarianReports />
              </ProtectedRoute>
            } />

            {/* Siswa Routes */}
            <Route path="/siswa/dashboard" element={
              <ProtectedRoute allowedRoles={['siswa']}>
                <SiswaDashboard />
              </ProtectedRoute>
            } />
            <Route path="/siswa/books" element={
              <ProtectedRoute allowedRoles={['siswa']}>
                <SiswaBooks />
              </ProtectedRoute>
            } />
            <Route path="/siswa/lendings" element={
              <ProtectedRoute allowedRoles={['siswa']}>
                <SiswaLendings />
              </ProtectedRoute>
            } />
            <Route path="/siswa/notifications" element={
              <ProtectedRoute allowedRoles={['siswa']}>
                <SiswaNotifications />
              </ProtectedRoute>
            } />

            {/* Shared Routes */}
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/books" element={
              <ProtectedRoute>
                <Books />
              </ProtectedRoute>
            } />
            <Route path="/user/peminjaman" element={
              <ProtectedRoute>
                <UserPeminjaman />
              </ProtectedRoute>
            } />

            {/* Error Routes */}
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;