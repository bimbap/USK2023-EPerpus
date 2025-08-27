import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const PublicRoute = ({ children }) => {
    const { isAuthenticated, user, getDashboardUrl, loading } = useContext(AuthContext);

    // Show loading spinner while checking auth
    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                fontSize: '18px'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                        border: '4px solid rgba(255, 255, 255, 0.3)',
                        borderTop: '4px solid white',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 20px'
                    }}></div>
                    Memuat...
                </div>
            </div>
        );
    }

    // Redirect to appropriate dashboard if authenticated
    if (isAuthenticated && user) {
        return <Navigate to={getDashboardUrl(user.role)} replace />;
    }

    return children;
};

export default PublicRoute;
