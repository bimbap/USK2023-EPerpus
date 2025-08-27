import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import '../styles/Unauthorized.css';

const Unauthorized = () => {
    const { isAuthenticated, user, getDashboardUrl } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleGoHome = () => {
        if (isAuthenticated && user) {
            // Redirect ke dashboard sesuai role
            navigate(getDashboardUrl(user.role), { replace: true });
        } else {
            // Redirect ke landing page
            navigate('/', { replace: true });
        }
    };

    return (
        <div className="unauthorized-container">
            <div className="unauthorized-card">
                <div className="unauthorized-icon">🚫</div>
                <h1>Akses Tidak Diizinkan</h1>
                <p>
                    {isAuthenticated 
                        ? `Halaman ini tidak tersedia untuk role Anda (${user?.role}). Anda akan dialihkan ke dashboard yang sesuai.`
                        : 'Anda perlu login terlebih dahulu untuk mengakses halaman ini.'
                    }
                </p>
                <div className="unauthorized-actions">
                    <button 
                        className="btn-primary"
                        onClick={handleGoHome}
                    >
                        {isAuthenticated ? '🏠 Ke Dashboard' : '🏠 Ke Beranda'}
                    </button>
                    {!isAuthenticated && (
                        <button 
                            className="btn-secondary"
                            onClick={() => navigate('/login')}
                        >
                            🔑 Login
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Unauthorized;
