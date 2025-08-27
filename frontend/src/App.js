import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext, AuthProvider } from './contexts/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import AdminDashboard from './components/AdminDashboard';
import LibrarianDashboard from './components/LibrarianDashboard';
import SiswaDashboard from './components/SiswaDashboard';
import SiswaBooks from './components/SiswaBooks';
import AdminBooks from './components/AdminBooks';
import CategoriesManagement from './components/CategoriesManagement';
import PublishersManagement from './components/PublishersManagement';
import UserProfile from './components/UserProfile';
import Books from './components/Books';
import UsersManagement from './components/UsersManagement';
import LendingManagement from './components/LendingManagement';
import Unauthorized from './components/Unauthorized';
import './App.css';

// Protected Route component  
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
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
  const { isAuthenticated, user, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (isAuthenticated && user) {
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
                <CategoriesManagement />
              </ProtectedRoute>
            } />
            <Route path="/admin/publishers" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <PublishersManagement />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <UsersManagement />
              </ProtectedRoute>
            } />
            <Route path="/admin/lending" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <LendingManagement />
              </ProtectedRoute>
            } />

            {/* Librarian Routes */}
            <Route path="/librarian/dashboard" element={
              <ProtectedRoute allowedRoles={['librarian', 'admin']}>
                <LibrarianDashboard />
              </ProtectedRoute>
            } />
            <Route path="/librarian/books" element={
              <ProtectedRoute allowedRoles={['librarian', 'admin']}>
                <Books />
              </ProtectedRoute>
            } />
            <Route path="/librarian/lending" element={
              <ProtectedRoute allowedRoles={['librarian', 'admin']}>
                <LendingManagement />
              </ProtectedRoute>
            } />

            {/* Siswa Routes */}
            <Route path="/siswa/dashboard" element={
              <ProtectedRoute allowedRoles={['siswa', 'admin', 'librarian']}>
                <SiswaDashboard />
              </ProtectedRoute>
            } />
            <Route path="/siswa/books" element={
              <ProtectedRoute allowedRoles={['siswa', 'admin', 'librarian']}>
                <SiswaBooks />
              </ProtectedRoute>
            } />

            {/* Shared Routes */}
            <Route path="/profile" element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            } />

            {/* Error Routes */}
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Default Routes */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;