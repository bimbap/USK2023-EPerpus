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
