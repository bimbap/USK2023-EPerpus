import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/LandingPage.css';

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="landing-container">
            <div className="landing-header">
                <div className="logo">
                    <span className="logo-icon">📚</span>
                    <h1>Library System USK 2023</h1>
                </div>
                <div className="auth-buttons">
                    <button 
                        className="btn-outline"
                        onClick={() => navigate('/login')}
                    >
                        Masuk
                    </button>
                    <button 
                        className="btn-primary"
                        onClick={() => navigate('/register')}
                    >
                        Daftar
                    </button>
                </div>
            </div>

            <div className="landing-content">
                <div className="hero-section">
                    <h2>Selamat Datang di Sistem Perpustakaan</h2>
                    <p>
                        Sistem manajemen perpustakaan digital yang memudahkan 
                        pengelolaan buku, peminjaman, dan administrasi perpustakaan.
                    </p>
                    
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon">📖</div>
                            <h3>Katalog Buku</h3>
                            <p>Jelajahi ribuan koleksi buku digital dengan mudah</p>
                        </div>
                        
                        <div className="feature-card">
                            <div className="feature-icon">⏰</div>
                            <h3>Peminjaman Online</h3>
                            <p>Pinjam buku secara online tanpa perlu datang ke perpustakaan</p>
                        </div>
                        
                        <div className="feature-card">
                            <div className="feature-icon">📊</div>
                            <h3>Manajemen Data</h3>
                            <p>Kelola data buku, anggota, dan laporan dengan efisien</p>
                        </div>
                        
                        <div className="feature-card">
                            <div className="feature-icon">🔒</div>
                            <h3>Keamanan Terjamin</h3>
                            <p>Sistem keamanan berlapis untuk melindungi data Anda</p>
                        </div>
                    </div>

                    <div className="cta-section">
                        <h3>Mulai Gunakan Sekarang</h3>
                        <div className="cta-buttons">
                            <button 
                                className="cta-btn primary"
                                onClick={() => navigate('/register')}
                            >
                                Daftar Sebagai Siswa
                            </button>
                            <button 
                                className="cta-btn secondary"
                                onClick={() => navigate('/login')}
                            >
                                Masuk ke Akun
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="landing-footer">
                <p>&copy; 2025 Library System USK 2023. All rights reserved.</p>
            </div>
        </div>
    );
};

export default LandingPage;