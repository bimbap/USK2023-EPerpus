import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/SiswaDashboard.css';

const SiswaDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalBorrowed: 0,
        currentlyBorrowed: 0,
        overdue: 0,
        returned: 0
    });
    const [recentBorrowings, setRecentBorrowings] = useState([]);
    const [recommendedBooks, setRecommendedBooks] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = useCallback(async () => {
        if (!user?.id) {
            setLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            
            // Fetch user's borrowings and books
            const [lendingsRes, booksRes] = await Promise.all([
                axios.get('http://127.0.0.1:8000/api/lendings', {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get('http://127.0.0.1:8000/api/books', {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            const allLendings = Array.isArray(lendingsRes.data) ? lendingsRes.data : 
                              (lendingsRes.data.success ? lendingsRes.data.data : []);
            const books = Array.isArray(booksRes.data) ? booksRes.data : 
                         (booksRes.data.success ? booksRes.data.data : []);

            // Filter user's lendings
            const userLendings = allLendings.filter(lending => 
                lending.user_id === user?.id
            );

            // Calculate statistics
            const currentlyBorrowed = userLendings.filter(lending => 
                lending.status === 'dipinjam'
            ).length;

            const overdue = userLendings.filter(lending => 
                lending.status === 'dipinjam' && 
                new Date(lending.tanggal_kembali) < new Date()
            ).length;

            const returned = userLendings.filter(lending => 
                lending.status === 'dikembalikan'
            ).length;

            setStats({
                totalBorrowed: userLendings.length,
                currentlyBorrowed,
                overdue,
                returned
            });

            // Set recent borrowings (user's own)
            setRecentBorrowings(userLendings.slice(0, 5));

            // Set recommended books (random selection)
            const availableBooks = books.filter(book => book.jumlah_buku > 0);
            setRecommendedBooks(availableBooks.slice(0, 4));

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const quickActions = [
        {
            title: 'Cari Buku',
            description: 'Temukan buku yang ingin dipinjam',
            icon: '🔍',
            path: '/siswa/books',
            color: 'blue'
        },
        {
            title: 'Peminjaman Saya',
            description: 'Lihat riwayat peminjaman buku',
            icon: '📚',
            path: '/siswa/lendings',
            color: 'green'
        },
        {
            title: 'Perpanjang Pinjaman',
            description: 'Perpanjang masa peminjaman buku',
            icon: '⏰',
            path: '/siswa/extend',
            color: 'orange'
        },
        {
            title: 'Notifikasi',
            description: 'Lihat notifikasi dan pengingat',
            icon: '🔔',
            path: '/siswa/notifications',
            color: 'purple'
        }
    ];

    const handleNavigation = (path) => {
        navigate(path);
    };

    if (loading) {
        return (
            <div className="dashboard-container">
                <div className="loading">
                    <div className="loading-spinner"></div>
                    <p>Memuat dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            {/* Header */}
            <div className="dashboard-header">
                <div className="header-content">
                    <div className="welcome-section">
                        <h1>Dashboard Siswa</h1>
                        <p>Selamat datang, <strong>{user?.fullname}</strong></p>
                        <p className="user-info">
                            Kelas: {user?.class} {user?.jurusan} | 
                            Kode: {user?.user_code}
                        </p>
                        <p className="date">{new Date().toLocaleDateString('id-ID', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        })}</p>
                    </div>
                    <div className="header-actions">
                        <button 
                            className="btn-profile"
                            onClick={() => navigate('/profile')}
                        >
                            👤 Profil
                        </button>
                        <button 
                            className="btn-logout"
                            onClick={() => {
                                logout();
                                navigate('/login');
                            }}
                        >
                            🚪 Keluar
                        </button>
                    </div>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="stats-grid">
                <div className="stat-card blue">
                    <div className="stat-icon">📚</div>
                    <div className="stat-content">
                        <h3>{stats.totalBorrowed}</h3>
                        <p>Total Dipinjam</p>
                    </div>
                </div>
                <div className="stat-card green">
                    <div className="stat-icon">📖</div>
                    <div className="stat-content">
                        <h3>{stats.currentlyBorrowed}</h3>
                        <p>Sedang Dipinjam</p>
                    </div>
                </div>
                <div className="stat-card orange">
                    <div className="stat-icon">✅</div>
                    <div className="stat-content">
                        <h3>{stats.returned}</h3>
                        <p>Sudah Dikembalikan</p>
                    </div>
                </div>
                <div className="stat-card red">
                    <div className="stat-icon">⚠️</div>
                    <div className="stat-content">
                        <h3>{stats.overdue}</h3>
                        <p>Terlambat</p>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
                <h2>Aksi Cepat</h2>
                <div className="actions-grid">
                    {quickActions.map((action, index) => (
                        <div 
                            key={index}
                            className={`action-card ${action.color}`}
                            onClick={() => handleNavigation(action.path)}
                        >
                            <div className="action-icon">{action.icon}</div>
                            <div className="action-content">
                                <h3>{action.title}</h3>
                                <p>{action.description}</p>
                            </div>
                            <div className="action-arrow">→</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Borrowings */}
            <div className="recent-section">
                <h2>Peminjaman Terbaru</h2>
                <div className="borrowings-list">
                    {recentBorrowings.length > 0 ? (
                        recentBorrowings.map((borrowing, index) => (
                            <div key={index} className="borrowing-item">
                                <div className="borrowing-icon">
                                    {borrowing.status === 'dipinjam' ? '📖' : '✅'}
                                </div>
                                <div className="borrowing-content">
                                    <h4>{borrowing.book?.judul || 'Buku'}</h4>
                                    <p>Dipinjam: {new Date(borrowing.tanggal_pinjam).toLocaleDateString('id-ID')}</p>
                                    <p>Kembali: {new Date(borrowing.tanggal_kembali).toLocaleDateString('id-ID')}</p>
                                </div>
                                <div className="borrowing-status">
                                    <span className={`status-badge ${borrowing.status}`}>
                                        {borrowing.status === 'dipinjam' ? 'Dipinjam' : 'Dikembalikan'}
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="no-borrowings">
                            <p>Belum ada peminjaman</p>
                            <button 
                                className="btn-browse"
                                onClick={() => navigate('/siswa/books')}
                            >
                                Cari Buku Sekarang
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Recommended Books */}
            <div className="recommendations">
                <h2>Rekomendasi Buku</h2>
                <div className="books-grid">
                    {recommendedBooks.length > 0 ? (
                        recommendedBooks.map((book, index) => (
                            <div key={index} className="book-card">
                                <div className="book-cover">📚</div>
                                <div className="book-info">
                                    <h4>{book.judul}</h4>
                                    <p>oleh {book.pengarang}</p>
                                    <p className="book-available">
                                        Tersedia: {book.jumlah_buku} buku
                                    </p>
                                    <button 
                                        className="btn-borrow"
                                        onClick={() => navigate('/siswa/books')}
                                    >
                                        Pinjam
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="no-recommendations">
                            <p>Tidak ada rekomendasi saat ini</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SiswaDashboard;
