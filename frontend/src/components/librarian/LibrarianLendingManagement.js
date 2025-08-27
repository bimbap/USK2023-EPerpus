import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/LibrarianLendingManagement.css';

const LibrarianLendingManagement = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [lendings, setLendings] = useState([]);
    const [users, setUsers] = useState([]);
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('lend');
    
    // Search and filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterUser, setFilterUser] = useState('');
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    
    // Form states
    const [formData, setFormData] = useState({
        user_id: '',
        book_id: '',
        notes: ''
    });
    
    // Statistics
    const [stats, setStats] = useState({
        totalBorrowings: 0,
        activeBorrowings: 0,
        overdueBorrowings: 0,
        returnedBorrowings: 0
    });

    useEffect(() => {
        fetchLendings();
        fetchUsers();
        fetchBooks();
        fetchStats();
    }, []);

    const fetchLendings = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/lendings', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (response.data && response.data.success) {
                setLendings(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching lendings:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/users', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (response.data && response.data.success) {
                setUsers(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const fetchBooks = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/books', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (response.data && response.data.success) {
                setBooks(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching books:', error);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/lendings/statistics', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (response.data && response.data.success) {
                setStats(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching statistics:', error);
        }
    };

    // Filter and search logic
    const filteredLendings = lendings.filter(lending => {
        const matchesSearch = 
            lending.user?.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lending.book?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lending.user?.username?.toLowerCase().includes(searchTerm.toLowerCase());
            
        const matchesStatus = !filterStatus || lending.status === filterStatus;
        const matchesUser = !filterUser || lending.user_id?.toString() === filterUser;
        
        return matchesSearch && matchesStatus && matchesUser;
    });

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentLendings = filteredLendings.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredLendings.length / itemsPerPage);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const openModal = (type) => {
        setModalType(type);
        setFormData({
            user_id: '',
            book_id: '',
            notes: ''
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setFormData({
            user_id: '',
            book_id: '',
            notes: ''
        });
    };

    const handleLendBook = async (e) => {
        e.preventDefault();
        
        try {
            await axios.post('http://127.0.0.1:8000/api/lendings', formData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            alert('Buku berhasil dipinjamkan!');
            fetchLendings();
            fetchBooks(); // Refresh books to update stock
            fetchStats();
            closeModal();
        } catch (error) {
            console.error('Error lending book:', error);
            const errorMessage = error.response?.data?.message || 'Gagal meminjamkan buku.';
            alert(errorMessage);
        }
    };

    const handleReturnBook = async (lending) => {
        if (window.confirm(`Apakah Anda yakin ingin mengembalikan buku "${lending.book?.title}"?`)) {
            try {
                await axios.put(`http://127.0.0.1:8000/api/lendings/${lending.id}/return`, {}, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                alert('Buku berhasil dikembalikan!');
                fetchLendings();
                fetchBooks(); // Refresh books to update stock
                fetchStats();
            } catch (error) {
                console.error('Error returning book:', error);
                const errorMessage = error.response?.data?.message || 'Gagal mengembalikan buku.';
                alert(errorMessage);
            }
        }
    };

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
        <div className="librarian-lending">
            {/* Header */}
            <div className="page-header">
                <div className="header-content">
                    <div className="header-left">
                        <button className="back-btn" onClick={() => navigate('/librarian/dashboard')}>
                            ← Kembali
                        </button>
                        <div className="header-text">
                            <h1>📋 Manajemen Peminjaman</h1>
                            <p>Kelola peminjaman dan pengembalian buku</p>
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
                    <div className="stat-icon">📖</div>
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
                            placeholder="🔍 Cari nama siswa atau judul buku..."
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
                        
                        <select
                            value={filterUser}
                            onChange={(e) => setFilterUser(e.target.value)}
                        >
                            <option value="">Semua Siswa</option>
                            {users.filter(u => u.role === 'siswa').map(user => (
                                <option key={user.id} value={user.id}>
                                    {user.fullname}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                
                <div className="action-buttons">
                    <button className="lend-btn" onClick={() => openModal('lend')}>
                        📚 Pinjamkan Buku
                    </button>
                </div>
            </div>

            {/* Lendings Table */}
            <div className="table-section">
                <div className="table-container">
                    <table className="lendings-table">
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>Siswa</th>
                                <th>Buku</th>
                                <th>Tgl Pinjam</th>
                                <th>Tgl Jatuh Tempo</th>
                                <th>Tgl Kembali</th>
                                <th>Status</th>
                                <th>Keterlambatan</th>
                                <th>Catatan</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentLendings.length === 0 ? (
                                <tr>
                                    <td colSpan="10" className="no-data">
                                        {searchTerm || filterStatus || filterUser 
                                            ? 'Tidak ada data peminjaman yang sesuai dengan filter.' 
                                            : 'Belum ada data peminjaman.'
                                        }
                                    </td>
                                </tr>
                            ) : (
                                currentLendings.map((lending, index) => {
                                    const statusBadge = getStatusBadge(lending.status);
                                    const daysOverdue = calculateDaysOverdue(lending.due_date, lending.returned_at, lending.status);
                                    
                                    return (
                                        <tr key={lending.id}>
                                            <td>{indexOfFirstItem + index + 1}</td>
                                            <td className="user-info">
                                                <div>
                                                    <strong>{lending.user?.fullname || 'N/A'}</strong>
                                                    <p className="username">@{lending.user?.username || 'N/A'}</p>
                                                </div>
                                            </td>
                                            <td className="book-info">
                                                <div>
                                                    <strong>{lending.book?.title || 'N/A'}</strong>
                                                    <p className="author">{lending.book?.author || 'N/A'}</p>
                                                </div>
                                            </td>
                                            <td>{formatDate(lending.borrowed_at)}</td>
                                            <td className={daysOverdue > 0 && lending.status === 'borrowed' ? 'overdue-date' : ''}>
                                                {formatDate(lending.due_date)}
                                            </td>
                                            <td>{formatDate(lending.returned_at)}</td>
                                            <td>
                                                <span className={`status-badge ${statusBadge.class}`}>
                                                    {statusBadge.text}
                                                </span>
                                            </td>
                                            <td className="overdue-days">
                                                {daysOverdue > 0 && (
                                                    <span className="overdue-badge">
                                                        {daysOverdue} hari
                                                    </span>
                                                )}
                                            </td>
                                            <td className="notes">
                                                {lending.notes || '-'}
                                            </td>
                                            <td>
                                                {lending.status === 'borrowed' && (
                                                    <button 
                                                        className="return-btn"
                                                        onClick={() => handleReturnBook(lending)}
                                                    >
                                                        ↩️ Kembalikan
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

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

            {/* Lend Book Modal */}
            {showModal && modalType === 'lend' && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>📚 Pinjamkan Buku</h2>
                            <button className="close-btn" onClick={closeModal}>✖</button>
                        </div>
                        
                        <form onSubmit={handleLendBook} className="lend-form">
                            <div className="form-group">
                                <label>Siswa *</label>
                                <select
                                    name="user_id"
                                    value={formData.user_id}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Pilih Siswa</option>
                                    {users.filter(user => user.role === 'siswa').map(user => (
                                        <option key={user.id} value={user.id}>
                                            {user.fullname} (@{user.username})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="form-group">
                                <label>Buku *</label>
                                <select
                                    name="book_id"
                                    value={formData.book_id}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Pilih Buku</option>
                                    {books.filter(book => book.stock_quantity > 0).map(book => (
                                        <option key={book.id} value={book.id}>
                                            {book.title} - {book.author} (Stok: {book.stock_quantity})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="form-group">
                                <label>Catatan</label>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleInputChange}
                                    rows="3"
                                    placeholder="Catatan tambahan (opsional)"
                                ></textarea>
                            </div>
                            
                            <div className="form-actions">
                                <button type="button" className="cancel-btn" onClick={closeModal}>
                                    Batal
                                </button>
                                <button type="submit" className="submit-btn">
                                    📚 Pinjamkan Buku
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LibrarianLendingManagement;
