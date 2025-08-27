import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/SiswaNotifications.css';

const SiswaNotifications = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all'); // all, lending, overdue, returned, announcements
    const [userInfo, setUserInfo] = useState(null);

    const fetchNotifications = useCallback(async () => {
        try {
            setLoading(true);
            
            // Get user's lending history and generate notifications
            const lendingsResponse = await axios.get('/api/lendings/user', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const lendings = lendingsResponse.data;

            // Get system announcements (if any)
            let announcements = [];
            try {
                const announcementsResponse = await axios.get('/api/announcements', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                announcements = announcementsResponse.data;
            } catch (err) {
                // Announcements endpoint might not exist yet
            }

            // Generate notifications based on lendings
            const generatedNotifications = [];

            lendings.forEach(lending => {
                // Overdue notifications
                if (lending.status === 'borrowed' && new Date(lending.due_date) < new Date()) {
                    const daysOverdue = Math.floor((new Date() - new Date(lending.due_date)) / (1000 * 60 * 60 * 24));
                    generatedNotifications.push({
                        id: `overdue_${lending.id}`,
                        type: 'overdue',
                        title: 'Buku Terlambat Dikembalikan',
                        message: `Buku "${lending.book?.title}" sudah terlambat ${daysOverdue} hari. Harap segera dikembalikan ke perpustakaan.`,
                        date: lending.due_date,
                        read: false,
                        priority: 'high',
                        lending_id: lending.id,
                        book: lending.book
                    });
                }

                // Due soon notifications (1-2 days before due date)
                if (lending.status === 'borrowed') {
                    const daysUntilDue = Math.ceil((new Date(lending.due_date) - new Date()) / (1000 * 60 * 60 * 24));
                    if (daysUntilDue > 0 && daysUntilDue <= 2) {
                        generatedNotifications.push({
                            id: `due_soon_${lending.id}`,
                            type: 'lending',
                            title: 'Pengingat Pengembalian Buku',
                            message: `Buku "${lending.book?.title}" akan jatuh tempo dalam ${daysUntilDue} hari. Jangan lupa untuk dikembalikan.`,
                            date: lending.due_date,
                            read: false,
                            priority: 'medium',
                            lending_id: lending.id,
                            book: lending.book
                        });
                    }
                }

                // Recently returned notifications
                if (lending.status === 'returned' && lending.returned_date) {
                    const returnedDate = new Date(lending.returned_date);
                    const daysSinceReturned = Math.floor((new Date() - returnedDate) / (1000 * 60 * 60 * 24));
                    if (daysSinceReturned <= 7) { // Show for 1 week
                        generatedNotifications.push({
                            id: `returned_${lending.id}`,
                            type: 'returned',
                            title: 'Buku Berhasil Dikembalikan',
                            message: `Terima kasih! Buku "${lending.book?.title}" telah berhasil dikembalikan pada ${formatDate(lending.returned_date)}.`,
                            date: lending.returned_date,
                            read: false,
                            priority: 'low',
                            lending_id: lending.id,
                            book: lending.book
                        });
                    }
                }
            });

            // Add announcements
            announcements.forEach(announcement => {
                generatedNotifications.push({
                    id: `announcement_${announcement.id}`,
                    type: 'announcements',
                    title: announcement.title,
                    message: announcement.content,
                    date: announcement.created_at,
                    read: false,
                    priority: announcement.priority || 'medium'
                });
            });

            // Sort by date (newest first) and priority
            generatedNotifications.sort((a, b) => {
                const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
                if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
                    return priorityOrder[b.priority] - priorityOrder[a.priority];
                }
                return new Date(b.date) - new Date(a.date);
            });

            // Apply filter
            const filteredNotifications = generatedNotifications.filter(notification => {
                if (filter === 'all') return true;
                return notification.type === filter;
            });

            setNotifications(filteredNotifications);
            setError('');
        } catch (err) {
            console.error('Error fetching notifications:', err);
            setError('Gagal memuat notifikasi. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        setUserInfo(user);
        
        fetchNotifications();
    }, [fetchNotifications]);

    const markAsRead = (notificationId) => {
        setNotifications(prev => 
            prev.map(notification => 
                notification.id === notificationId 
                    ? { ...notification, read: true }
                    : notification
            )
        );
    };

    const markAllAsRead = () => {
        setNotifications(prev => 
            prev.map(notification => ({ ...notification, read: true }))
        );
    };

    const handleNotificationClick = (notification) => {
        markAsRead(notification.id);
        
        // Navigate to relevant page based on notification type
        if (notification.type === 'overdue' || notification.type === 'lending' || notification.type === 'returned') {
            navigate('/siswa/lendings');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatDateTime = (dateString) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getPriorityIcon = (priority) => {
        switch (priority) {
            case 'high': return '🚨';
            case 'medium': return '⚠️';
            case 'low': return 'ℹ️';
            default: return '📢';
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'overdue': return '⏰';
            case 'lending': return '📚';
            case 'returned': return '✅';
            case 'announcements': return '📢';
            default: return '📄';
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="siswa-notifications">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Memuat notifikasi...</p>
                </div>
            </div>
        );
    }

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="siswa-notifications">
            {/* Header */}
            <div className="page-header">
                <div className="header-content">
                    <div className="header-left">
                        <button onClick={() => navigate('/siswa/dashboard')} className="back-btn">
                            ← Kembali
                        </button>
                        <div className="header-text">
                            <h1>Notifikasi</h1>
                            <p>Kelola pemberitahuan dan pengingat Anda</p>
                        </div>
                    </div>
                    <div className="header-right">
                        <div className="user-info">
                            <span>👤 {userInfo?.name}</span>
                            <span className="role-badge siswa">Siswa</span>
                        </div>
                        <button onClick={handleLogout} className="logout-btn">
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Notification Controls */}
            <div className="notification-controls">
                <div className="notification-stats">
                    <div className="stats-item">
                        <span className="stats-number">{notifications.length}</span>
                        <span className="stats-label">Total Notifikasi</span>
                    </div>
                    <div className="stats-item">
                        <span className="stats-number unread">{unreadCount}</span>
                        <span className="stats-label">Belum Dibaca</span>
                    </div>
                </div>

                <div className="notification-filters">
                    <button 
                        onClick={() => setFilter('all')}
                        className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                    >
                        Semua ({notifications.length})
                    </button>
                    <button 
                        onClick={() => setFilter('overdue')}
                        className={`filter-btn ${filter === 'overdue' ? 'active' : ''}`}
                    >
                        Terlambat ({notifications.filter(n => n.type === 'overdue').length})
                    </button>
                    <button 
                        onClick={() => setFilter('lending')}
                        className={`filter-btn ${filter === 'lending' ? 'active' : ''}`}
                    >
                        Pengingat ({notifications.filter(n => n.type === 'lending').length})
                    </button>
                    <button 
                        onClick={() => setFilter('returned')}
                        className={`filter-btn ${filter === 'returned' ? 'active' : ''}`}
                    >
                        Dikembalikan ({notifications.filter(n => n.type === 'returned').length})
                    </button>
                    <button 
                        onClick={() => setFilter('announcements')}
                        className={`filter-btn ${filter === 'announcements' ? 'active' : ''}`}
                    >
                        Pengumuman ({notifications.filter(n => n.type === 'announcements').length})
                    </button>
                </div>

                {unreadCount > 0 && (
                    <div className="notification-actions">
                        <button onClick={markAllAsRead} className="mark-all-read-btn">
                            Tandai Semua Sudah Dibaca
                        </button>
                    </div>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <div className="error-message">
                    <p>{error}</p>
                    <button onClick={fetchNotifications}>Coba Lagi</button>
                </div>
            )}

            {/* Notifications List */}
            <div className="notifications-container">
                {notifications.length === 0 ? (
                    <div className="empty-notifications">
                        <div className="empty-icon">🔔</div>
                        <h3>Tidak Ada Notifikasi</h3>
                        <p>Anda tidak memiliki notifikasi saat ini.</p>
                    </div>
                ) : (
                    <div className="notifications-list">
                        {notifications.map(notification => (
                            <div 
                                key={notification.id}
                                className={`notification-item ${notification.read ? 'read' : 'unread'} ${notification.priority}`}
                                onClick={() => handleNotificationClick(notification)}
                            >
                                <div className="notification-icon">
                                    {getTypeIcon(notification.type)}
                                </div>
                                <div className="notification-content">
                                    <div className="notification-header">
                                        <h4>{notification.title}</h4>
                                        <div className="notification-meta">
                                            <span className="priority-indicator">
                                                {getPriorityIcon(notification.priority)}
                                            </span>
                                            <span className="notification-date">
                                                {formatDateTime(notification.date)}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="notification-message">
                                        {notification.message}
                                    </p>
                                    {notification.book && (
                                        <div className="notification-book">
                                            <span className="book-label">Buku:</span>
                                            <span className="book-title">{notification.book.title}</span>
                                        </div>
                                    )}
                                </div>
                                {!notification.read && (
                                    <div className="unread-indicator"></div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SiswaNotifications;
