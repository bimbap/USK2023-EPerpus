import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/LibrarianDashboard.css';

const LibrarianDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalBooks: 0,
        totalBorrowings: 0,
        pendingReturns: 0,
        overdueBooks: 0
    });
    const [recentActivities, setRecentActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('token');
            
            // Fetch dashboard statistics
            const [booksRes, lendingsRes] = await Promise.all([
                axios.get('http://127.0.0.1:8000/api/books', {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get('http://127.0.0.1:8000/api/lendings', {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            const books = Array.isArray(booksRes.data) ? booksRes.data : 
                          (booksRes.data.success ? booksRes.data.data : []);
            const lendings = Array.isArray(lendingsRes.data) ? lendingsRes.data : 
                            (lendingsRes.data.success ? lendingsRes.data.data : []);

            // Calculate statistics
            const pendingReturns = lendings.filter(lending => 
                lending.status === 'dipinjam'
            ).length;

            const overdueBooks = lendings.filter(lending => 
                lending.status === 'dipinjam' && 
                new Date(lending.tanggal_kembali) < new Date()
            ).length;

            setStats({
                totalBooks: books.length,
                totalBorrowings: lendings.length,
                pendingReturns,
                overdueBooks
            });

            // Set recent activities (recent lendings)
            setRecentActivities(lendings.slice(0, 10));

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const quickActions = [
        {
            title: 'Kelola Peminjaman',
            description: 'Proses peminjaman dan pengembalian buku',
            icon: '📚',
            path: '/librarian/lendings',
            color: 'blue'
        },
        {
            title: 'Kelola Buku',
            description: 'Tambah, edit, atau hapus koleksi buku',
            icon: '📖',
            path: '/librarian/books',
            color: 'green'
        },
        {
            title: 'Laporan',
            description: 'Lihat laporan peminjaman dan statistik',
            icon: '📊',
            path: '/librarian/reports',
            color: 'orange'
        },
        {
            title: 'Anggota',
            description: 'Kelola data anggota perpustakaan',
            icon: '👥',
            path: '/librarian/members',
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
                        <h1>Dashboard Pustakawan</h1>
                        <p>Selamat datang, <strong>{user?.fullname}</strong></p>
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
                        <h3>{stats.totalBooks}</h3>
                        <p>Total Buku</p>
                    </div>
                </div>
                <div className="stat-card green">
                    <div className="stat-icon">📖</div>
                    <div className="stat-content">
                        <h3>{stats.totalBorrowings}</h3>
                        <p>Total Peminjaman</p>
                    </div>
                </div>
                <div className="stat-card orange">
                    <div className="stat-icon">⏰</div>
                    <div className="stat-content">
                        <h3>{stats.pendingReturns}</h3>
                        <p>Menunggu Kembali</p>
                    </div>
                </div>
                <div className="stat-card red">
                    <div className="stat-icon">⚠️</div>
                    <div className="stat-content">
                        <h3>{stats.overdueBooks}</h3>
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

            {/* Recent Activities */}
            <div className="recent-activities">
                <h2>Aktivitas Terbaru</h2>
                <div className="activities-list">
                    {recentActivities.length > 0 ? (
                        recentActivities.map((activity, index) => (
                            <div key={index} className="activity-item">
                                <div className="activity-icon">
                                    {activity.status === 'dipinjam' ? '📖' : 
                                     activity.status === 'dikembalikan' ? '✅' : '⏰'}
                                </div>
                                <div className="activity-content">
                                    <p className="activity-title">
                                        {activity.user?.fullname || 'User'} - 
                                        {activity.book?.judul || 'Buku'}
                                    </p>
                                    <p className="activity-subtitle">
                                        Status: {activity.status} | 
                                        {new Date(activity.tanggal_pinjam).toLocaleDateString('id-ID')}
                                    </p>
                                </div>
                                <div className="activity-status">
                                    <span className={`status-badge ${activity.status}`}>
                                        {activity.status}
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="no-activities">
                            <p>Belum ada aktivitas terbaru</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LibrarianDashboard;
