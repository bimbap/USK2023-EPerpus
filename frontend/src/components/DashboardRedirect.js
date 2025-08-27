import React, { useContext, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

// Component untuk redirect otomatis ke dashboard sesuai role
const DashboardRedirect = () => {
    const { user, isAuthenticated, getDashboardUrl } = useContext(AuthContext);

    useEffect(() => {
        // Auto redirect setelah component mount
        if (isAuthenticated && user) {
            // This will be handled by Navigate component below
        }
    }, [isAuthenticated, user]);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (user) {
        return <Navigate to={getDashboardUrl(user.role)} replace />;
    }

    // Fallback loading state
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
                Mengarahkan ke dashboard...
            </div>
        </div>
    );
};

export default DashboardRedirect;
