import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/AdminLendingManagement.css';

const AdminLendingManagement = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [lendings, setLendings] = useState([]);
    const [books, setBooks] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [showLendingModal, setShowLendingModal] = useState(false);
    const lendingsPerPage = 10;

    const [lendingForm, setLendingForm] = useState({
        user_id: '',
        book_id: '',
        borrow_date: new Date().toISOString().split('T')[0],
        due_date: '',
        status: 'borrowed'
    });

    useEffect(() => {
        fetchLendings();
        fetchBooks();
        fetchUsers();
    }, []);

    const fetchLendings = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/admin/lendings', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (response.data && response.data.success) {
                setLendings(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching lendings:', error);
        } finally {
            setLoading(false);
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
                setBooks(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching books:', error);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/admin/users', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (response.data && response.data.success) {
                setUsers(response.data.data.filter(u => u.role === 'siswa'));
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const handleInputChange = (e) => {
        setLendingForm({
            ...lendingForm,
            [e.target.name]: e.target.value
        });
    };

    const handleAddLending = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://127.0.0.1:8000/api/admin/lendings', lendingForm, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            alert('Peminjaman berhasil ditambahkan!');
            setShowLendingModal(false);
            resetForm();
            fetchLendings();
        } catch (error) {
            console.error('Error adding lending:', error);
            alert('Gagal menambahkan peminjaman.');
        }
    };

    const handleReturnBook = async (lendingId) => {
        if (window.confirm('Konfirmasi pengembalian buku ini?')) {
            try {
                await axios.put(`http://127.0.0.1:8000/api/admin/lendings/${lendingId}/return`, {}, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                alert('Buku berhasil dikembalikan!');
                fetchLendings();
            } catch (error) {
                console.error('Error returning book:', error);
                alert('Gagal mengembalikan buku.');
            }
        }
    };

    const handleDeleteLending = async (lendingId) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus data peminjaman ini?')) {
            try {
                await axios.delete(`http://127.0.0.1:8000/api/admin/lendings/${lendingId}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                alert('Data peminjaman berhasil dihapus!');
                fetchLendings();
            } catch (error) {
                console.error('Error deleting lending:', error);
                alert('Gagal menghapus data peminjaman.');
            }
        }
    };

    const resetForm = () => {
        setLendingForm({
            user_id: '',
            book_id: '',
            borrow_date: new Date().toISOString().split('T')[0],
            due_date: '',
            status: 'borrowed'
        });
    };

    const filteredLendings = lendings.filter(lending => {
        const matchesSearch = lending.user?.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             lending.book?.judul?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             lending.user?.student_id?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === '' || lending.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });

    const indexOfLastLending = currentPage * lendingsPerPage;
    const indexOfFirstLending = indexOfLastLending - lendingsPerPage;
    const currentLendings = filteredLendings.slice(indexOfFirstLending, indexOfLastLending);
    const totalPages = Math.ceil(filteredLendings.length / lendingsPerPage);

    const getStatusBadge = (status) => {
        const statusMap = {
            borrowed: { text: 'Dipinjam', class: 'borrowed' },
            returned: { text: 'Dikembalikan', class: 'returned' },
            overdue: { text: 'Terlambat', class: 'overdue' }
        };
        return statusMap[status] || { text: status, class: 'default' };
    };

    const isOverdue = (dueDate, status) => {
        if (status === 'returned') return false;
        return new Date(dueDate) < new Date();
    };

    return (
        <div className="admin-lending-management">
            {/* Header */}
            <div className="page-header">
                <div className="header-content">
                    <div className="header-left">
                        <button className="back-btn" onClick={() => navigate('/admin/dashboard')}>
                            ← Kembali
                        </button>
                        <div className="header-text">
                            <h1>📋 Kelola Peminjaman</h1>
                            <p>Manajemen peminjaman buku perpustakaan</p>
                        </div>
                    </div>
                    <div className="header-right">
                        <div className="user-info">
                            <span className="role-badge admin">ADMIN</span>
                            <span className="username">{user?.fullname}</span>
                        </div>
                        <button className="logout-btn" onClick={logout}>
                            🚪 Keluar
                        </button>
                    </div>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="stats-grid">
                <div className="stat-card total">
                    <div className="stat-icon">📚</div>
                    <div className="stat-info">
                        <div className="stat-number">{lendings.length}</div>
                        <div className="stat-label">Total Peminjaman</div>
                    </div>
                </div>
                
                <div className="stat-card borrowed">
                    <div className="stat-icon">📖</div>
                    <div className="stat-info">
                        <div className="stat-number">
                            {lendings.filter(l => l.status === 'borrowed').length}
                        </div>
                        <div className="stat-label">Sedang Dipinjam</div>
                    </div>
                </div>
                
                <div className="stat-card returned">
                    <div className="stat-icon">✅</div>
                    <div className="stat-info">
                        <div className="stat-number">
                            {lendings.filter(l => l.status === 'returned').length}
                        </div>
                        <div className="stat-label">Sudah Dikembalikan</div>
                    </div>
                </div>
                
                <div className="stat-card overdue">
                    <div className="stat-icon">⚠️</div>
                    <div className="stat-info">
                        <div className="stat-number">
                            {lendings.filter(l => isOverdue(l.due_date, l.status)).length}
                        </div>
                        <div className="stat-label">Terlambat</div>
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="filters-section">
                <div className="search-group">
                    <input
                        type="text"
                        placeholder="Cari berdasarkan nama siswa, judul buku, atau student ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
                <div className="filter-group">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="filter-select"
                    >
                        <option value="">Semua Status</option>
                        <option value="borrowed">Dipinjam</option>
                        <option value="returned">Dikembalikan</option>
                        <option value="overdue">Terlambat</option>
                    </select>
                    <button 
                        className="add-btn"
                        onClick={() => {
                            resetForm();
                            setShowLendingModal(true);
                        }}
                    >
                        + Tambah Peminjaman
                    </button>
                </div>
            </div>

            {/* Lendings Table */}
            <div className="content-section">
                <div className="lendings-header">
                    <h3>Daftar Peminjaman ({filteredLendings.length})</h3>
                </div>

                {loading ? (
                    <div className="loading">Memuat data peminjaman...</div>
                ) : (
                    <div className="lendings-table-container">
                        <table className="lendings-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Peminjam</th>
                                    <th>Buku</th>
                                    <th>Tanggal Pinjam</th>
                                    <th>Tanggal Kembali</th>
                                    <th>Status</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentLendings.length > 0 ? (
                                    currentLendings.map((lending) => {
                                        const statusInfo = getStatusBadge(lending.status);
                                        const overdue = isOverdue(lending.due_date, lending.status);
                                        
                                        return (
                                            <tr key={lending.id} className={overdue ? 'overdue-row' : ''}>
                                                <td>{lending.lending_code}</td>
                                                <td className="user-info">
                                                    <div className="user-avatar">
                                                        {lending.user?.fullname?.charAt(0)?.toUpperCase()}
                                                    </div>
                                                    <div className="user-details">
                                                        <span className="name">{lending.user?.fullname}</span>
                                                        <span className="student-id">{lending.user?.student_id}</span>
                                                    </div>
                                                </td>
                                                <td className="book-info">
                                                    <div className="book-title">{lending.book?.judul}</div>
                                                    <div className="book-author">oleh {lending.book?.pengarang}</div>
                                                </td>
                                                <td>{new Date(lending.borrow_date).toLocaleDateString('id-ID')}</td>
                                                <td>{new Date(lending.due_date).toLocaleDateString('id-ID')}</td>
                                                <td>
                                                    <span className={`status-badge ${overdue ? 'overdue' : statusInfo.class}`}>
                                                        {overdue && lending.status === 'borrowed' ? 'Terlambat' : statusInfo.text}
                                                    </span>
                                                </td>
                                                <td className="actions">
                                                    {lending.status === 'borrowed' && (
                                                        <button
                                                            className="return-btn"
                                                            onClick={() => handleReturnBook(lending.id)}
                                                            title="Kembalikan Buku"
                                                        >
                                                            📥
                                                        </button>
                                                    )}
                                                    <button
                                                        className="delete-btn"
                                                        onClick={() => handleDeleteLending(lending.id)}
                                                        title="Hapus Data"
                                                    >
                                                        🗑️
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="no-data">
                                            Tidak ada data peminjaman yang ditemukan
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="pagination">
                        <button
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="pagination-btn"
                        >
                            ← Sebelumnya
                        </button>
                        
                        {Array.from({ length: totalPages }, (_, index) => (
                            <button
                                key={index + 1}
                                onClick={() => setCurrentPage(index + 1)}
                                className={`pagination-number ${currentPage === index + 1 ? 'active' : ''}`}
                            >
                                {index + 1}
                            </button>
                        ))}
                        
                        <button
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="pagination-btn"
                        >
                            Selanjutnya →
                        </button>
                    </div>
                )}
            </div>

            {/* Lending Modal */}
            {showLendingModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h2>Tambah Peminjaman Baru</h2>
                            <button 
                                className="close-btn"
                                onClick={() => setShowLendingModal(false)}
                            >
                                ✖️
                            </button>
                        </div>
                        <form onSubmit={handleAddLending}>
                            <div className="form-group">
                                <label>Pilih Siswa</label>
                                <select
                                    name="user_id"
                                    value={lendingForm.user_id}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Pilih Siswa</option>
                                    {users.map(userItem => (
                                        <option key={userItem.id} value={userItem.id}>
                                            {userItem.fullname} ({userItem.student_id})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="form-group">
                                <label>Pilih Buku</label>
                                <select
                                    name="book_id"
                                    value={lendingForm.book_id}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Pilih Buku</option>
                                    {books.filter(book => book.jumlah_buku > 0).map(book => (
                                        <option key={book.id} value={book.id}>
                                            {book.judul} (Tersedia: {book.jumlah_buku})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Tanggal Pinjam</label>
                                    <input
                                        type="date"
                                        name="borrow_date"
                                        value={lendingForm.borrow_date}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Tanggal Kembali</label>
                                    <input
                                        type="date"
                                        name="due_date"
                                        value={lendingForm.due_date}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div className="modal-footer">
                                <button type="button" className="cancel-btn" onClick={() => setShowLendingModal(false)}>
                                    Batal
                                </button>
                                <button type="submit" className="submit-btn">
                                    Tambah Peminjaman
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminLendingManagement;
