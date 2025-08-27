import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/SiswaLendings.css';

const SiswaLendings = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [lendings, setLendings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    
    // Statistics
    const [stats, setStats] = useState({
        totalBorrowings: 0,
        activeBorrowings: 0,
        overdueBorrowings: 0,
        returnedBorrowings: 0
    });

    useEffect(() => {
        fetchUserLendings();
        fetchUserStats();
    }, []);

    const fetchUserLendings = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/user/lendings', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (response.data && response.data.success) {
                setLendings(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching user lendings:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserStats = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/user/lending-statistics', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (response.data && response.data.success) {
                setStats(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching user statistics:', error);
        }
    };

    // Filter and search logic
    const filteredLendings = lendings.filter(lending => {
        const matchesSearch = 
            lending.book?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lending.book?.author?.toLowerCase().includes(searchTerm.toLowerCase());
            
        const matchesStatus = !filterStatus || lending.status === filterStatus;
        
        return matchesSearch && matchesStatus;
    });

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentLendings = filteredLendings.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredLendings.length / itemsPerPage);

    const getStatusBadge = (status) => {
        const statusConfig = {
            'borrowed': { class: 'borrowed', text: 'Dipinjam' },
            'returned': { class: 'returned', text: 'Dikembalikan' },
            'overdue': { class: 'overdue', text: 'Terlambat' }
        };
        
        return statusConfig[status] || { class: 'unknown', text: status };
    };

    const calculateDaysOverdue = (dueDate, returnDate, status) => {
        if (status !== 'overdue' && status !== 'borrowed') return 0;
        
        const due = new Date(dueDate);
        const current = returnDate ? new Date(returnDate) : new Date();
        const diffTime = current - due;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays > 0 ? diffDays : 0;
    };

    const calculateDaysRemaining = (dueDate, status) => {
        if (status !== 'borrowed') return 0;
        
        const due = new Date(dueDate);
        const current = new Date();
        const diffTime = due - current;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays;
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID');
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Memuat data peminjaman...</p>
            </div>
        );
    }

    return (
        <div className="siswa-lendings">
            {/* Header */}
            <div className="page-header">
                <div className="header-content">
                    <div className="header-left">
                        <button className="back-btn" onClick={() => navigate('/siswa/dashboard')}>
                            ← Kembali
                        </button>
                        <div className="header-text">
                            <h1>📖 Riwayat Peminjaman</h1>
                            <p>Lihat riwayat peminjaman buku Anda</p>
                        </div>
                    </div>
                    <div className="header-right">
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

            {/* Statistics */}
            <div className="stats-section">
                <div className="stat-card">
                    <div className="stat-icon">📊</div>
                    <div className="stat-info">
                        <div className="stat-number">{stats.totalBorrowings}</div>
                        <div className="stat-label">Total Peminjaman</div>
                    </div>
                </div>
                
                <div className="stat-card">
                    <div className="stat-icon">📚</div>
                    <div className="stat-info">
                        <div className="stat-number">{stats.activeBorrowings}</div>
                        <div className="stat-label">Sedang Dipinjam</div>
                    </div>
                </div>
                
                <div className="stat-card">
                    <div className="stat-icon">⚠️</div>
                    <div className="stat-info">
                        <div className="stat-number">{stats.overdueBorrowings}</div>
                        <div className="stat-label">Terlambat</div>
                    </div>
                </div>
                
                <div className="stat-card">
                    <div className="stat-icon">✅</div>
                    <div className="stat-info">
                        <div className="stat-number">{stats.returnedBorrowings}</div>
                        <div className="stat-label">Dikembalikan</div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="controls-section">
                <div className="search-filter">
                    <div className="search-box">
                        <input
                            type="text"
                            placeholder="🔍 Cari judul buku atau penulis..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <div className="filters">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="">Semua Status</option>
                            <option value="borrowed">Dipinjam</option>
                            <option value="returned">Dikembalikan</option>
                            <option value="overdue">Terlambat</option>
                        </select>
                    </div>
                </div>
                
                <div className="result-count">
                    <span className="count-number">{filteredLendings.length}</span>
                    <span className="count-label">Hasil Pencarian</span>
                </div>
            </div>

            {/* Lending Cards (Mobile-Friendly) */}
            <div className="lendings-section">
                {currentLendings.length === 0 ? (
                    <div className="no-data">
                        <div className="no-data-icon">📚</div>
                        <h3>Tidak Ada Data</h3>
                        <p>
                            {searchTerm || filterStatus 
                                ? 'Tidak ada peminjaman yang sesuai dengan filter.' 
                                : 'Anda belum pernah meminjam buku.'
                            }
                        </p>
                    </div>
                ) : (
                    <div className="lendings-grid">
                        {currentLendings.map((lending) => {
                            const statusBadge = getStatusBadge(lending.status);
                            const daysOverdue = calculateDaysOverdue(lending.due_date, lending.returned_at, lending.status);
                            const daysRemaining = calculateDaysRemaining(lending.due_date, lending.status);
                            
                            return (
                                <div key={lending.id} className={`lending-card ${lending.status}`}>
                                    <div className="lending-header">
                                        <div className="book-info">
                                            <h3 className="book-title">{lending.book?.title || 'N/A'}</h3>
                                            <p className="book-author">oleh {lending.book?.author || 'N/A'}</p>
                                        </div>
                                        <span className={`status-badge ${statusBadge.class}`}>
                                            {statusBadge.text}
                                        </span>
                                    </div>
                                    
                                    <div className="lending-details">
                                        <div className="detail-item">
                                            <span className="detail-label">Tanggal Pinjam:</span>
                                            <span className="detail-value">{formatDate(lending.borrowed_at)}</span>
                                        </div>
                                        
                                        <div className="detail-item">
                                            <span className="detail-label">Jatuh Tempo:</span>
                                            <span className={`detail-value ${daysOverdue > 0 && lending.status === 'borrowed' ? 'overdue' : ''}`}>
                                                {formatDate(lending.due_date)}
                                            </span>
                                        </div>
                                        
                                        {lending.returned_at && (
                                            <div className="detail-item">
                                                <span className="detail-label">Tanggal Kembali:</span>
                                                <span className="detail-value">{formatDate(lending.returned_at)}</span>
                                            </div>
                                        )}
                                        
                                        {lending.status === 'borrowed' && (
                                            <div className="detail-item">
                                                <span className="detail-label">
                                                    {daysRemaining > 0 ? 'Sisa Waktu:' : 'Keterlambatan:'}
                                                </span>
                                                <span className={`detail-value ${daysRemaining <= 0 ? 'overdue' : daysRemaining <= 2 ? 'warning' : ''}`}>
                                                    {daysRemaining > 0 
                                                        ? `${daysRemaining} hari lagi`
                                                        : `${Math.abs(daysRemaining)} hari`
                                                    }
                                                </span>
                                            </div>
                                        )}
                                        
                                        {daysOverdue > 0 && lending.status === 'overdue' && (
                                            <div className="detail-item">
                                                <span className="detail-label">Keterlambatan:</span>
                                                <span className="detail-value overdue">
                                                    {daysOverdue} hari
                                                </span>
                                            </div>
                                        )}
                                        
                                        {lending.notes && (
                                            <div className="detail-item notes">
                                                <span className="detail-label">Catatan:</span>
                                                <span className="detail-value">{lending.notes}</span>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {lending.status === 'borrowed' && daysRemaining <= 2 && (
                                        <div className="reminder-notice">
                                            <div className="reminder-icon">⏰</div>
                                            <div className="reminder-text">
                                                {daysRemaining > 0 
                                                    ? `Jangan lupa kembalikan buku dalam ${daysRemaining} hari!`
                                                    : 'Buku sudah melewati batas waktu peminjaman!'
                                                }
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="pagination">
                        <button 
                            className="page-btn"
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            ← Sebelumnya
                        </button>
                        
                        <div className="page-numbers">
                            {[...Array(totalPages)].map((_, index) => (
                                <button
                                    key={index + 1}
                                    className={`page-number ${currentPage === index + 1 ? 'active' : ''}`}
                                    onClick={() => setCurrentPage(index + 1)}
                                >
                                    {index + 1}
                                </button>
                            ))}
                        </div>
                        
                        <button 
                            className="page-btn"
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                        >
                            Berikutnya →
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SiswaLendings;
