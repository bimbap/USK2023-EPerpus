import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Landing.css';

const Landing = () => {
    const navigate = useNavigate();

    return (
        <div className="landing-container">
            <div className="landing-header">
                <div className="header-content">
                    <h1>📚 Perpustakaan Digital USK</h1>
                    <p>Sistem Manajemen Perpustakaan Modern</p>
                </div>
                <div className="header-actions">
                    <button 
                        className="login-btn"
                        onClick={() => navigate('/login')}
                    >
                        Masuk
                    </button>
                    <button 
                        className="register-btn"
                        onClick={() => navigate('/register')}
                    >
                        Daftar
                    </button>
                </div>
            </div>

            <div className="landing-hero">
                <div className="hero-content">
                    <h2>Kelola Perpustakaan dengan Mudah</h2>
                    <p>Platform digital yang memudahkan pengelolaan buku, peminjaman, dan administrasi perpustakaan secara terintegrasi.</p>
                    
                    <div className="hero-stats">
                        <div className="stat-item">
                            <h3>📖</h3>
                            <p>Katalog Digital</p>
                            <span>Ribuan koleksi buku</span>
                        </div>
                        <div className="stat-item">
                            <h3>👥</h3>
                            <p>Multi User</p>
                            <span>Admin & Anggota</span>
                        </div>
                        <div className="stat-item">
                            <h3>📱</h3>
                            <p>Responsive</p>
                            <span>Mobile Friendly</span>
                        </div>
                        <div className="stat-item">
                            <h3>⚡</h3>
                            <p>Real-time</p>
                            <span>Update Langsung</span>
                        </div>
                    </div>

                    <div className="hero-actions">
                        <button 
                            className="primary-btn"
                            onClick={() => navigate('/register')}
                        >
                            🚀 Mulai Sekarang
                        </button>
                        <button 
                            className="secondary-btn"
                            onClick={() => navigate('/login')}
                        >
                            🔑 Sudah Punya Akun?
                        </button>
                    </div>
                </div>
                
                <div className="hero-image">
                    <div className="book-stack">
                        <div className="book book1">📚</div>
                        <div className="book book2">📖</div>
                        <div className="book book3">📓</div>
                        <div className="book book4">📔</div>
                    </div>
                </div>
            </div>

            <div className="features-section">
                <h2>Fitur Unggulan</h2>
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">📚</div>
                        <h3>Manajemen Buku</h3>
                        <p>Kelola koleksi buku dengan mudah. Tambah, edit, dan kategorikan buku dengan sistem yang terintegrasi.</p>
                    </div>
                    
                    <div className="feature-card">
                        <div className="feature-icon">🔄</div>
                        <h3>Peminjaman Digital</h3>
                        <p>Sistem peminjaman dan pengembalian yang otomatis dengan tracking real-time dan notifikasi.</p>
                    </div>
                    
                    <div className="feature-card">
                        <div className="feature-icon">👨‍💼</div>
                        <h3>Multi-Role Access</h3>
                        <p>Akses berbasis role untuk admin, pustakawan, dan anggota dengan permission yang sesuai.</p>
                    </div>
                    
                    <div className="feature-card">
                        <div className="feature-icon">📊</div>
                        <h3>Dashboard Analytics</h3>
                        <p>Statistik lengkap tentang aktivitas perpustakaan dengan visualisasi data yang menarik.</p>
                    </div>
                    
                    <div className="feature-card">
                        <div className="feature-icon">🔍</div>
                        <h3>Pencarian Canggih</h3>
                        <p>Cari buku berdasarkan judul, pengarang, kategori, atau penerbit dengan filter yang detail.</p>
                    </div>
                    
                    <div className="feature-card">
                        <div className="feature-icon">💬</div>
                        <h3>Sistem Pesan</h3>
                        <p>Komunikasi dua arah antara pustakawan dan anggota untuk koordinasi yang lebih baik.</p>
                    </div>
                </div>
            </div>

            <div className="cta-section">
                <div className="cta-content">
                    <h2>Siap Memulai?</h2>
                    <p>Bergabunglah dengan ribuan pengguna yang sudah merasakan kemudahan sistem perpustakaan digital kami.</p>
                    <div className="cta-actions">
                        <button 
                            className="cta-primary"
                            onClick={() => navigate('/register')}
                        >
                            Daftar Gratis
                        </button>
                        <button 
                            className="cta-secondary"
                            onClick={() => navigate('/login')}
                        >
                            Masuk ke Akun
                        </button>
                    </div>
                </div>
            </div>

            <div className="landing-footer">
                <div className="footer-content">
                    <div className="footer-section">
                        <h3>📚 Perpustakaan USK</h3>
                        <p>Sistem manajemen perpustakaan modern untuk era digital.</p>
                    </div>
                    
                    <div className="footer-section">
                        <h4>Fitur</h4>
                        <ul>
                            <li>Manajemen Buku</li>
                            <li>Sistem Peminjaman</li>
                            <li>Dashboard Analytics</li>
                            <li>Multi-User Access</li>
                        </ul>
                    </div>
                    
                    <div className="footer-section">
                        <h4>Akses Cepat</h4>
                        <ul>
                            <li><button onClick={() => navigate('/login')}>Masuk</button></li>
                            <li><button onClick={() => navigate('/register')}>Daftar</button></li>
                        </ul>
                    </div>
                </div>
                
                <div className="footer-bottom">
                    <p>&copy; 2025 Perpustakaan USK. Semua hak dilindungi.</p>
                </div>
            </div>
        </div>
    );
};

export default Landing;
