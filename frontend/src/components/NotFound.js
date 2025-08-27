import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/NotFound.css';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="not-found-container">
            <div className="not-found-content">
                <div className="error-code">404</div>
                <div className="error-icon">📚💔</div>
                <h1>Halaman Tidak Ditemukan</h1>
                <p>Maaf, halaman yang Anda cari tidak dapat ditemukan. Mungkin halaman tersebut telah dipindahkan atau dihapus.</p>
                
                <div className="error-actions">
                    <button 
                        className="home-btn"
                        onClick={() => navigate('/')}
                    >
                        🏠 Kembali ke Beranda
                    </button>
                    <button 
                        className="back-btn"
                        onClick={() => navigate(-1)}
                    >
                        ← Halaman Sebelumnya
                    </button>
                </div>

                <div className="suggestions">
                    <h3>Halaman yang mungkin Anda cari:</h3>
                    <div className="suggestion-links">
                        <button onClick={() => navigate('/login')}>🔑 Login</button>
                        <button onClick={() => navigate('/register')}>📝 Daftar</button>
                        <button onClick={() => navigate('/books')}>📚 Katalog Buku</button>
                        <button onClick={() => navigate('/dashboard')}>🏠 Dashboard</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
