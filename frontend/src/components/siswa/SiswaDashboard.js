import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/SiswaDashboard.css';

const SiswaDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        activeBorrowings: 0,
        totalBorrowings: 0,
        overdueBorrowings: 0,
        availableBooks: 0
    });
    const [recentBorrowings, setRecentBorrowings] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('token');
            
            // Fetch user statistics
            const statsResponse = await axios.get('http://127.0.0.1:8000/api/user/dashboard-stats', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (statsResponse.data && statsResponse.data.success) {
                setStats(statsResponse.data.data);
            }
            
            // Fetch recent borrowings
            const borrowingsResponse = await axios.get('http://127.0.0.1:8000/api/user/recent-lendings', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (borrowingsResponse.data && borrowingsResponse.data.success) {
                setRecentBorrowings(borrowingsResponse.data.data || []);
            }
            
            // Fetch notifications
            const notificationsResponse = await axios.get('http://127.0.0.1:8000/api/user/notifications', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (notificationsResponse.data && notificationsResponse.data.success) {
                setNotifications(notificationsResponse.data.data || []);
            }
            
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('id-ID');
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            'borrowed': { class: 'borrowed', text: 'Dipinjam' },
            'returned': { class: 'returned', text: 'Dikembalikan' },
            'overdue': { class: 'overdue', text: 'Terlambat' }
        };
        
        return statusConfig[status] || { class: 'unknown', text: status };
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Memuat dashboard...</p>
            </div>
        );
    }

    return (
        <div className="siswa-dashboard">
            {/* Header */}
            <div className="dashboard-header">
                <div className="header-content">
                    <div className="welcome-section">
                        <h1>Selamat Datang, {user?.fullname}! 👋</h1>
                        <p>Kelola peminjaman buku Anda dengan mudah</p>
                    </div>
                    <div className="header-actions">
                        <div className="user-info">
                            <span className="role-badge siswa">SISWA</span>
                            <span className="username">{user?.fullname}</span>
                        </div>
                        <button className="logout-btn" onClick={logout}>
                            🚪 Keluar
                        </button>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="quick-stats">
                <div className="stat-card">
                    <div className="stat-icon">📚</div>
                    <div className="stat-content">
                        <div className="stat-number">{stats.activeBorrowings}</div>
                        <div className="stat-label">Buku Dipinjam</div>
                    </div>
                </div>
                
                <div className="stat-card">
                    <div className="stat-icon">📊</div>
                    <div className="stat-content">
                        <div className="stat-number">{stats.totalBorrowings}</div>
                        <div className="stat-label">Total Peminjaman</div>
                    </div>
                </div>
                
                <div className="stat-card">
                    <div className="stat-icon">⚠️</div>
                    <div className="stat-content">
                        <div className="stat-number">{stats.overdueBorrowings}</div>
                        <div className="stat-label">Terlambat</div>
                    </div>
                </div>
                
                <div className="stat-card">
                    <div className="stat-icon">📖</div>
                    <div className="stat-content">
                        <div className="stat-number">{stats.availableBooks}</div>
                        <div className="stat-label">Buku Tersedia</div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="dashboard-content">
                {/* Recent Borrowings */}
                <div className="content-section">
                    <div className="section-header">
                        <h2>📋 Peminjaman Terbaru</h2>
                        <button 
                            className="view-all-btn"
                            onClick={() => navigate('/siswa/lendings')}
                        >
                            Lihat Semua →
                        </button>
                    </div>
                    
                    <div className="recent-borrowings">
                        {recentBorrowings.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon">📚</div>
                                <h3>Belum Ada Peminjaman</h3>
                                <p>Anda belum meminjam buku. Hubungi pustakawan untuk meminjam buku.</p>
                            </div>
                        ) : (
                            recentBorrowings.slice(0, 5).map((borrowing) => {
                                const statusBadge = getStatusBadge(borrowing.status);
                                
                                return (
                                    <div key={borrowing.id} className="borrowing-card">
                                        <div className="book-info">
                                            <h4>{borrowing.book?.title || 'N/A'}</h4>
                                            <p className="author">oleh {borrowing.book?.author || 'N/A'}</p>
                                        </div>
                                        
                                        <div className="borrowing-details">
                                            <div className="dates">
                                                <span className="date-label">Dipinjam:</span>
                                                <span className="date-value">{formatDate(borrowing.borrowed_at)}</span>
                                            </div>
                                            <div className="dates">
                                                <span className="date-label">Jatuh Tempo:</span>
                                                <span className="date-value">{formatDate(borrowing.due_date)}</span>
                                            </div>
                                        </div>
                                        
                                        <div className="borrowing-status">
                                            <span className={`status-badge ${statusBadge.class}`}>
                                                {statusBadge.text}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Notifications */}
                <div className="content-section">
                    <div className="section-header">
                        <h2>🔔 Pemberitahuan</h2>
                    </div>
                    
                    <div className="notifications">
                        {notifications.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon">🔔</div>
                                <h3>Tidak Ada Pemberitahuan</h3>
                                <p>Semua pemberitahuan akan muncul di sini.</p>
                            </div>
                        ) : (
                            notifications.slice(0, 5).map((notification) => (
                                <div key={notification.id} className="notification-card">
                                    <div className="notification-icon">
                                        {notification.type === 'overdue' ? '⚠️' : 
                                         notification.type === 'due_soon' ? '⏰' :
                                         notification.type === 'returned' ? '✅' : '📢'}
                                    </div>
                                    <div className="notification-content">
                                        <h4>{notification.title}</h4>
                                        <p>{notification.message}</p>
                                        <span className="notification-time">
                                            {formatDate(notification.created_at)}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
                <h3>🚀 Aksi Cepat</h3>
                <div className="actions-grid">
                    <button 
                        className="action-btn"
                        onClick={() => navigate('/siswa/lendings')}
                    >
                        <div className="action-icon">📋</div>
                        <div className="action-text">
                            <strong>Lihat Peminjaman</strong>
                            <span>Cek status peminjaman buku</span>
                        </div>
                    </button>
                    
                    <button 
                        className="action-btn"
                        onClick={() => navigate('/siswa/profile')}
                    >
                        <div className="action-icon">👤</div>
                        <div className="action-text">
                            <strong>Edit Profil</strong>
                            <span>Perbarui informasi pribadi</span>
                        </div>
                    </button>
                    
                    <button 
                        className="action-btn"
                        onClick={() => navigate('/siswa/notifications')}
                    >
                        <div className="action-icon">🔔</div>
                        <div className="action-text">
                            <strong>Pemberitahuan</strong>
                            <span>Lihat semua notifikasi</span>
                        </div>
                    </button>
                    
                    <button 
                        className="action-btn"
                        onClick={() => window.open('mailto:pustakawan@sekolah.sch.id', '_blank')}
                    >
                        <div className="action-icon">📧</div>
                        <div className="action-text">
                            <strong>Hubungi Pustakawan</strong>
                            <span>Bantuan & pertanyaan</span>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SiswaDashboard;
