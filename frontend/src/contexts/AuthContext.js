import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// Create AuthContext
export const AuthContext = createContext();

// AuthProvider component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Configure axios defaults
    useEffect(() => {
        axios.defaults.baseURL = 'http://127.0.0.1:8000';
        axios.defaults.headers.common['Accept'] = 'application/json';
        axios.defaults.headers.common['Content-Type'] = 'application/json';
        
        // Add token to all requests if exists
        const token = localStorage.getItem('token');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }

        // Check if user is already logged in
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (token && userData) {
            try {
                // Verify token with server
                const response = await axios.get('/api/user', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                
                setUser(response.data);
                setIsAuthenticated(true);
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            } catch (error) {
                console.error('Auth check failed:', error);
                // Token is invalid, clear storage
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                delete axios.defaults.headers.common['Authorization'];
                setUser(null);
                setIsAuthenticated(false);
            }
        }
        setLoading(false);
    };

    // Helper function untuk mendapatkan dashboard URL berdasarkan role
    const getDashboardUrl = (userRole) => {
        switch (userRole) {
            case 'admin':
                return '/admin/dashboard';
            case 'librarian':
                return '/librarian/dashboard';
            case 'siswa':
            default:
                return '/siswa/dashboard';
        }
    };

    const login = async (credentials) => {
        try {
            const response = await axios.post('/api/login', credentials);
            
            if (response.data.success && response.data.data) {
                const { token, user: userData } = response.data.data;
                
                // Store in localStorage
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(userData));
                
                // Set axios default header
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                
                // Update state
                setUser(userData);
                setIsAuthenticated(true);
                
                return { 
                    success: true, 
                    user: userData,
                    dashboardUrl: getDashboardUrl(userData.role)
                };
            } else {
                return { 
                    success: false, 
                    message: response.data.message || 'Login gagal. Silakan coba lagi.' 
                };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { 
                success: false, 
                message: error.response?.data?.message || 'Login gagal. Silakan coba lagi.' 
            };
        }
    };

    const register = async (userData) => {
        try {
            const response = await axios.post('/api/register', userData);
            
            if (response.data.success && response.data.data) {
                const { token, user: newUser } = response.data.data;
                
                // Store in localStorage
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(newUser));
                
                // Set axios default header
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                
                // Update state
                setUser(newUser);
                setIsAuthenticated(true);
                
                return { 
                    success: true, 
                    user: newUser,
                    dashboardUrl: getDashboardUrl(newUser.role)
                };
            } else {
                return { 
                    success: false, 
                    message: response.data.message || 'Registrasi gagal. Silakan coba lagi.' 
                };
            }
        } catch (error) {
            console.error('Register error:', error);
            return { 
                success: false, 
                message: error.response?.data?.message || 'Registrasi gagal. Silakan coba lagi.' 
            };
        }
    };

    const logout = async () => {
        try {
            // Call logout endpoint
            const token = localStorage.getItem('token');
            if (token) {
                await axios.post('http://127.0.0.1:8000/api/logout', {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Clear storage and state regardless of API call result
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            delete axios.defaults.headers.common['Authorization'];
            setUser(null);
            setIsAuthenticated(false);
            // Redirect to login page
            window.location.href = '/login';
        }
    };

    const updateUser = (updatedUser) => {
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    };

    const value = {
        user,
        loading,
        isAuthenticated,
        login,
        register,
        logout,
        updateUser,
        checkAuthStatus,
        getDashboardUrl
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
