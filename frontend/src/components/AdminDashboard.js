import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Dashboard.css';

export default function AdminDashboard() {
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({
        totalBooks: 0,
        totalMembers: 0,
        activeLendings: 0,
        overdueBooks: 0,
        totalCategories: 0,
        totalPublishers: 0
    });
    const [recentLendings, setRecentLendings] = useState([]);
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user'));
        setUser(userData);
        fetchDashboardData();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchDashboardData = async () => {
        try {
            const [booksRes, lendingsRes, categoriesRes, publishersRes, membersRes] = await Promise.all([
                axios.get('http://localhost:8000/api/books', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('http://localhost:8000/api/admin/lendings', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('http://localhost:8000/api/categories', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('http://localhost:8000/api/publishers', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('http://localhost:8000/api/members', { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: { data: [] } })) // Fallback if members endpoint doesn't exist
            ]);

            const lendings = lendingsRes.data.data || lendingsRes.data;
            const members = membersRes.data.data || membersRes.data || [];
            
            setStats({
                totalBooks: booksRes.data.data?.length || 0,
                totalMembers: members.length,
                activeLendings: lendings.filter(l => !l.return_date).length,
                overdueBooks: lendings.filter(l => !l.return_date && new Date(l.lend_date) < new Date(Date.now() - 14*24*60*60*1000)).length,
                totalCategories: categoriesRes.data.data?.length || 0,
                totalPublishers: publishersRes.data.data?.length || 0
            });

            setRecentLendings(lendings.slice(0, 5));
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    if (!user) return <div>Loading...</div>;

    return (
        <div className="dashboard-container admin">
            <div className="dashboard-header">
                <div className="header-left">
                    <h1>Dashboard Administrator</h1>
                    <p>Selamat datang, {user.fullname}</p>
                </div>
                <div className="header-right">
                    <span className="user-info">
                        {user.role?.toUpperCase()}
                    </span>
                    <button onClick={handleLogout} className="logout-btn">Keluar</button>
                </div>
            </div>

            <div className="dashboard-stats">
                <div className="stat-card">
                    <div className="stat-icon">📚</div>
                    <div className="stat-content">
                        <h3>{stats.totalBooks}</h3>
                        <p>Total Buku</p>
                    </div>
                </div>
                
                <div className="stat-card">
                    <div className="stat-icon">👥</div>
                    <div className="stat-content">
                        <h3>{stats.totalMembers}</h3>
                        <p>Total Anggota</p>
                    </div>
                </div>
                
                <div className="stat-card">
                    <div className="stat-icon">📖</div>
                    <div className="stat-content">
                        <h3>{stats.activeLendings}</h3>
                        <p>Peminjaman Aktif</p>
                    </div>
                </div>
                
                <div className="stat-card warning">
                    <div className="stat-icon">⚠️</div>
                    <div className="stat-content">
                        <h3>{stats.overdueBooks}</h3>
                        <p>Terlambat</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">🏷️</div>
                    <div className="stat-content">
                        <h3>{stats.totalCategories}</h3>
                        <p>Kategori</p>
                    </div>
                </div>
                
                <div className="stat-card">
                    <div className="stat-icon">🏢</div>
                    <div className="stat-content">
                        <h3>{stats.totalPublishers}</h3>
                        <p>Penerbit</p>
                    </div>
                </div>
            </div>

            <div className="dashboard-content">
                <div className="dashboard-menu">
                    <h3>Menu Administrasi</h3>
                    <div className="menu-grid admin-menu">
                        <button onClick={() => navigate('/admin/books')} className="menu-card">
                            <div className="menu-icon">📚</div>
                            <span>Kelola Buku</span>
                        </button>
                        
                        <button onClick={() => navigate('/admin/categories')} className="menu-card">
                            <div className="menu-icon">🏷️</div>
                            <span>Kategori</span>
                        </button>
                        
                        <button onClick={() => navigate('/admin/publishers')} className="menu-card">
                            <div className="menu-icon">🏢</div>
                            <span>Penerbit</span>
                        </button>
                        
                        <button onClick={() => navigate('/admin/lendings')} className="menu-card">
                            <div className="menu-icon">📝</div>
                            <span>Peminjaman</span>
                        </button>
                        
                        <button onClick={() => navigate('/admin/users')} className="menu-card">
                            <div className="menu-icon">👥</div>
                            <span>Kelola User</span>
                        </button>

                        <button onClick={() => navigate('/admin/members')} className="menu-card">
                            <div className="menu-icon">👨‍🎓</div>
                            <span>Kelola Anggota</span>
                        </button>
                        
                        <button onClick={() => navigate('/admin/settings')} className="menu-card">
                            <div className="menu-icon">⚙️</div>
                            <span>Pengaturan</span>
                        </button>
                    </div>
                </div>

                <div className="recent-activities">
                    <h3>Peminjaman Terbaru</h3>
                    <div className="activities-list">
                        {recentLendings.map(lending => (
                            <div key={lending.id} className="activity-item">
                                <div className="activity-info">
                                    <strong>{lending.user?.fullname}</strong>
                                    <span>meminjam</span>
                                    <strong>{lending.book?.title}</strong>
                                </div>
                                <div className="activity-date">
                                    {new Date(lending.lend_date).toLocaleDateString('id-ID')}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
