import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Dashboard.css';

export default function UserDashboard() {
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({
        totalBooks: 0,
        borrowedBooks: 0,
        overdueBooks: 0
    });
    const [recentBooks, setRecentBooks] = useState([]);
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user'));
        setUser(userData);

        // Get dashboard stats
        fetchDashboardData();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchDashboardData = async () => {
        try {
            // Get books
            const booksRes = await axios.get('http://localhost:8000/api/books', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Get user's lending history
            const lendingRes = await axios.get('http://localhost:8000/api/lendings/history', {
                headers: { Authorization: `Bearer ${token}` }
            });

            setStats({
                totalBooks: booksRes.data.data?.length || 0,
                borrowedBooks: lendingRes.data.filter(l => !l.return_date).length,
                overdueBooks: lendingRes.data.filter(l => !l.return_date && new Date(l.lend_date) < new Date(Date.now() - 14*24*60*60*1000)).length
            });

            // Set recent books (first 6)
            setRecentBooks(booksRes.data.data?.slice(0, 6) || []);
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
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div className="header-left">
                    <h1>Dashboard Anggota</h1>
                    <p>Selamat datang, {user.fullname}</p>
                </div>
                <div className="header-right">
                    <span className="user-info">
                        {user.student_id} | {user.class}
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
                    <div className="stat-icon">📖</div>
                    <div className="stat-content">
                        <h3>{stats.borrowedBooks}</h3>
                        <p>Sedang Dipinjam</p>
                    </div>
                </div>
                
                <div className="stat-card warning">
                    <div className="stat-icon">⚠️</div>
                    <div className="stat-content">
                        <h3>{stats.overdueBooks}</h3>
                        <p>Terlambat</p>
                    </div>
                </div>
            </div>

            <div className="dashboard-content">
                <div className="dashboard-menu">
                    <h3>Menu Utama</h3>
                    <div className="menu-grid">
                        <button onClick={() => navigate('/user/books')} className="menu-card">
                            <div className="menu-icon">📚</div>
                            <span>Daftar Buku</span>
                        </button>
                        
                        <button onClick={() => navigate('/user/peminjaman')} className="menu-card">
                            <div className="menu-icon">📝</div>
                            <span>Peminjaman</span>
                        </button>
                        
                        <button onClick={() => navigate('/user/profile')} className="menu-card">
                            <div className="menu-icon">👤</div>
                            <span>Profil</span>
                        </button>
                        
                        <button onClick={() => navigate('/user/messages')} className="menu-card">
                            <div className="menu-icon">💬</div>
                            <span>Pesan</span>
                        </button>
                    </div>
                </div>

                <div className="recent-books">
                    <h3>Buku Terbaru</h3>
                    <div className="books-grid">
                        {recentBooks.map(book => (
                            <div key={book.id} className="book-card">
                                {/* NOTE: Add book cover placeholder image - book_placeholder.jpg */}
                                <div className="book-cover">
                                    <img src="/images/book_placeholder.jpg" alt={book.title} />
                                </div>
                                <div className="book-info">
                                    <h4>{book.title}</h4>
                                    <p>Penulis: {book.author}</p>
                                    <p>Tahun: {book.year_published}</p>
                                    <span className={`book-status ${book.available_copies > 0 ? 'available' : 'unavailable'}`}>
                                        {book.available_copies > 0 ? 'Tersedia' : 'Tidak Tersedia'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
