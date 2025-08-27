import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/LibrarianReports.css';

const LibrarianReports = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [reportData, setReportData] = useState({
        bookStats: {
            totalBooks: 0,
            availableBooks: 0,
            borrowedBooks: 0,
            categoriesCount: 0
        },
        lendingStats: {
            totalLendings: 0,
            activeLendings: 0,
            overdueLendings: 0,
            returnedLendings: 0
        },
        memberStats: {
            totalMembers: 0,
            activeMembers: 0,
            membersWithBorrowings: 0
        }
    });
    
    const [selectedReport, setSelectedReport] = useState('overview');
    const [dateRange, setDateRange] = useState({
        start: '',
        end: ''
    });
    
    const [detailedData, setDetailedData] = useState({
        popularBooks: [],
        activeMembers: [],
        overdueItems: []
    });

    useEffect(() => {
        fetchReportData();
    }, []);

    const fetchReportData = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/librarian/reports', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (response.data && response.data.success) {
                setReportData(response.data.data);
            }
            
            // Fetch detailed data
            const detailedResponse = await axios.get('http://127.0.0.1:8000/api/librarian/detailed-reports', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (detailedResponse.data && detailedResponse.data.success) {
                setDetailedData(detailedResponse.data.data);
            }
            
        } catch (error) {
            console.error('Error fetching report data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDateRangeChange = (e) => {
        const { name, value } = e.target;
        setDateRange({
            ...dateRange,
            [name]: value
        });
    };

    const generateReport = async () => {
        if (!dateRange.start || !dateRange.end) {
            alert('Harap pilih rentang tanggal untuk laporan.');
            return;
        }
        
        try {
            setLoading(true);
            const response = await axios.get('http://127.0.0.1:8000/api/librarian/reports/custom', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                params: {
                    start_date: dateRange.start,
                    end_date: dateRange.end,
                    type: selectedReport
                }
            });
            
            if (response.data && response.data.success) {
                alert('Laporan berhasil dibuat!');
                // You can handle the report data here
                console.log('Custom report data:', response.data.data);
            }
        } catch (error) {
            console.error('Error generating report:', error);
            alert('Gagal membuat laporan.');
        } finally {
            setLoading(false);
        }
    };

    const exportReport = async (format = 'pdf') => {
        try {
            const response = await axios.get(`http://127.0.0.1:8000/api/librarian/reports/export`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                params: {
                    format,
                    type: selectedReport,
                    start_date: dateRange.start,
                    end_date: dateRange.end
                },
                responseType: 'blob'
            });
            
            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `laporan-${selectedReport}-${new Date().toISOString().split('T')[0]}.${format}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            
        } catch (error) {
            console.error('Error exporting report:', error);
            alert('Gagal mengekspor laporan.');
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Memuat data laporan...</p>
            </div>
        );
    }

    return (
        <div className="librarian-reports">
            {/* Header */}
            <div className="page-header">
                <div className="header-content">
                    <div className="header-left">
                        <button className="back-btn" onClick={() => navigate('/librarian/dashboard')}>
                            ← Kembali
                        </button>
                        <div className="header-text">
                            <h1>📊 Laporan Perpustakaan</h1>
                            <p>Lihat statistik dan buat laporan perpustakaan</p>
                        </div>
                    </div>
                    <div className="header-right">
                        <div className="user-info">
                            <span className="role-badge librarian">PUSTAKAWAN</span>
                            <span className="username">{user?.fullname}</span>
                        </div>
                        <button className="logout-btn" onClick={logout}>
                            🚪 Keluar
                        </button>
                    </div>
                </div>
            </div>

            {/* Report Controls */}
            <div className="report-controls">
                <div className="control-section">
                    <h3>🎯 Jenis Laporan</h3>
                    <div className="report-types">
                        <button 
                            className={`report-type-btn ${selectedReport === 'overview' ? 'active' : ''}`}
                            onClick={() => setSelectedReport('overview')}
                        >
                            📋 Overview
                        </button>
                        <button 
                            className={`report-type-btn ${selectedReport === 'books' ? 'active' : ''}`}
                            onClick={() => setSelectedReport('books')}
                        >
                            📚 Buku
                        </button>
                        <button 
                            className={`report-type-btn ${selectedReport === 'lendings' ? 'active' : ''}`}
                            onClick={() => setSelectedReport('lendings')}
                        >
                            📋 Peminjaman
                        </button>
                        <button 
                            className={`report-type-btn ${selectedReport === 'members' ? 'active' : ''}`}
                            onClick={() => setSelectedReport('members')}
                        >
                            👥 Anggota
                        </button>
                    </div>
                </div>
                
                <div className="control-section">
                    <h3>📅 Rentang Tanggal</h3>
                    <div className="date-range">
                        <input
                            type="date"
                            name="start"
                            value={dateRange.start}
                            onChange={handleDateRangeChange}
                            placeholder="Tanggal Mulai"
                        />
                        <span className="date-separator">s/d</span>
                        <input
                            type="date"
                            name="end"
                            value={dateRange.end}
                            onChange={handleDateRangeChange}
                            placeholder="Tanggal Akhir"
                        />
                    </div>
                </div>
                
                <div className="control-actions">
                    <button className="generate-btn" onClick={generateReport}>
                        🔄 Generate Laporan
                    </button>
                    <button className="export-btn" onClick={() => exportReport('pdf')}>
                        📄 Export PDF
                    </button>
                    <button className="export-btn excel" onClick={() => exportReport('excel')}>
                        📊 Export Excel
                    </button>
                </div>
            </div>

            {/* Statistics Overview */}
            <div className="statistics-overview">
                <div className="stats-section">
                    <h3>📚 Statistik Buku</h3>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon">📖</div>
                            <div className="stat-info">
                                <div className="stat-number">{reportData.bookStats.totalBooks}</div>
                                <div className="stat-label">Total Buku</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">✅</div>
                            <div className="stat-info">
                                <div className="stat-number">{reportData.bookStats.availableBooks}</div>
                                <div className="stat-label">Buku Tersedia</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">📚</div>
                            <div className="stat-info">
                                <div className="stat-number">{reportData.bookStats.borrowedBooks}</div>
                                <div className="stat-label">Sedang Dipinjam</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">🏷️</div>
                            <div className="stat-info">
                                <div className="stat-number">{reportData.bookStats.categoriesCount}</div>
                                <div className="stat-label">Kategori</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="stats-section">
                    <h3>📋 Statistik Peminjaman</h3>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon">📊</div>
                            <div className="stat-info">
                                <div className="stat-number">{reportData.lendingStats.totalLendings}</div>
                                <div className="stat-label">Total Peminjaman</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">🔄</div>
                            <div className="stat-info">
                                <div className="stat-number">{reportData.lendingStats.activeLendings}</div>
                                <div className="stat-label">Aktif</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">⚠️</div>
                            <div className="stat-info">
                                <div className="stat-number">{reportData.lendingStats.overdueLendings}</div>
                                <div className="stat-label">Terlambat</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">✅</div>
                            <div className="stat-info">
                                <div className="stat-number">{reportData.lendingStats.returnedLendings}</div>
                                <div className="stat-label">Dikembalikan</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="stats-section">
                    <h3>👥 Statistik Anggota</h3>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon">👥</div>
                            <div className="stat-info">
                                <div className="stat-number">{reportData.memberStats.totalMembers}</div>
                                <div className="stat-label">Total Anggota</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">✅</div>
                            <div className="stat-info">
                                <div className="stat-number">{reportData.memberStats.activeMembers}</div>
                                <div className="stat-label">Anggota Aktif</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">📚</div>
                            <div className="stat-info">
                                <div className="stat-number">{reportData.memberStats.membersWithBorrowings}</div>
                                <div className="stat-label">Sedang Meminjam</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">📈</div>
                            <div className="stat-info">
                                <div className="stat-number">
                                    {Math.round((reportData.memberStats.membersWithBorrowings / reportData.memberStats.activeMembers) * 100 || 0)}%
                                </div>
                                <div className="stat-label">Tingkat Aktif</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Detailed Reports */}
            <div className="detailed-reports">
                <div className="report-section">
                    <h3>🔥 Buku Populer</h3>
                    <div className="popular-books">
                        {detailedData.popularBooks.length === 0 ? (
                            <div className="empty-data">
                                <p>Tidak ada data buku populer.</p>
                            </div>
                        ) : (
                            detailedData.popularBooks.slice(0, 5).map((book, index) => (
                                <div key={book.id || index} className="popular-book-item">
                                    <div className="book-rank">#{index + 1}</div>
                                    <div className="book-info">
                                        <h4>{book.title || 'N/A'}</h4>
                                        <p>oleh {book.author || 'N/A'}</p>
                                    </div>
                                    <div className="book-stats">
                                        <span className="borrow-count">{book.borrow_count || 0} kali dipinjam</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="report-section">
                    <h3>⚠️ Peminjaman Terlambat</h3>
                    <div className="overdue-items">
                        {detailedData.overdueItems.length === 0 ? (
                            <div className="empty-data">
                                <p>Tidak ada peminjaman yang terlambat.</p>
                            </div>
                        ) : (
                            detailedData.overdueItems.slice(0, 5).map((item, index) => (
                                <div key={item.id || index} className="overdue-item">
                                    <div className="overdue-info">
                                        <h4>{item.book?.title || 'N/A'}</h4>
                                        <p>Peminjam: {item.user?.fullname || 'N/A'}</p>
                                    </div>
                                    <div className="overdue-details">
                                        <span className="due-date">
                                            Jatuh tempo: {new Date(item.due_date).toLocaleDateString('id-ID')}
                                        </span>
                                        <span className="days-overdue">
                                            {Math.ceil((new Date() - new Date(item.due_date)) / (1000 * 60 * 60 * 24))} hari terlambat
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="report-section">
                    <h3>🎯 Anggota Aktif</h3>
                    <div className="active-members">
                        {detailedData.activeMembers.length === 0 ? (
                            <div className="empty-data">
                                <p>Tidak ada data anggota aktif.</p>
                            </div>
                        ) : (
                            detailedData.activeMembers.slice(0, 5).map((member, index) => (
                                <div key={member.id || index} className="active-member-item">
                                    <div className="member-info">
                                        <h4>{member.fullname || 'N/A'}</h4>
                                        <p>@{member.username || 'N/A'} • {member.kelas || 'N/A'}</p>
                                    </div>
                                    <div className="member-stats">
                                        <span className="borrow-count">
                                            {member.total_borrowings || 0} peminjaman
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LibrarianReports;
