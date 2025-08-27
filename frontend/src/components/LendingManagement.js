import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/AdminPages.css';

export default function LendingManagement() {
    const [lendings, setLendings] = useState([]);
    const [books, setBooks] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [filter, setFilter] = useState('all');
    const [formData, setFormData] = useState({
        user_id: '',
        book_id: '',
        loan_date: new Date().toISOString().split('T')[0],
        return_date: '',
        status: 'active'
    });
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = JSON.parse(localStorage.getItem('user'));
        
        if (!token || !userData || (userData.role !== 'admin' && userData.role !== 'librarian')) {
            navigate('/login');
            return;
        }
        
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        fetchData();
    }, [navigate]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [lendingsRes, booksRes, usersRes] = await Promise.all([
                axios.get('http://localhost:8000/api/lendings'),
                axios.get('http://localhost:8000/api/books'),
                axios.get('http://localhost:8000/api/users')
            ]);
            
            if (lendingsRes.data.success) {
                setLendings(lendingsRes.data.data);
            }
            if (booksRes.data.success) {
                setBooks(booksRes.data.data.filter(book => book.stock > 0));
            }
            if (usersRes.data.success) {
                setUsers(usersRes.data.data.filter(user => user.role === 'siswa'));
            }
        } catch (error) {
            setError('Gagal mengambil data');
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8000/api/lendings', formData);
            
            if (response.data.success) {
                fetchData();
                setShowModal(false);
                setFormData({
                    user_id: '',
                    book_id: '',
                    loan_date: new Date().toISOString().split('T')[0],
                    return_date: '',
                    status: 'active'
                });
            }
        } catch (error) {
            setError('Gagal menambah peminjaman');
            console.error('Error saving lending:', error);
        }
    };

    const handleReturn = async (id) => {
        if (window.confirm('Konfirmasi pengembalian buku?')) {
            try {
                const response = await axios.patch(`http://localhost:8000/api/lendings/${id}/return`);
                if (response.data.success) {
                    fetchData();
                }
            } catch (error) {
                setError('Gagal memproses pengembalian');
                console.error('Error returning book:', error);
            }
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Yakin ingin menghapus record peminjaman ini?')) {
            try {
                const response = await axios.delete(`http://localhost:8000/api/lendings/${id}`);
                if (response.data.success) {
                    fetchData();
                }
            } catch (error) {
                setError('Gagal menghapus peminjaman');
                console.error('Error deleting lending:', error);
            }
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return '#3498db';
            case 'returned': return '#27ae60';
            case 'overdue': return '#e74c3c';
            default: return '#95a5a6';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'active': return 'Dipinjam';
            case 'returned': return 'Dikembalikan';
            case 'overdue': return 'Terlambat';
            default: return 'Unknown';
        }
    };

    const filteredLendings = lendings.filter(lending => {
        if (filter === 'all') return true;
        return lending.status === filter;
    });

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div className="admin-page-container">
            <div className="page-header">
                <div className="header-content">
                    <h1>📝 Manajemen Peminjaman</h1>
                    <p>Kelola peminjaman dan pengembalian buku</p>
                </div>
                <button 
                    className="btn-back"
                    onClick={() => navigate('/admin/dashboard')}
                >
                    ← Kembali
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="content-card">
                <div className="card-header">
                    <div className="header-left">
                        <h3>Daftar Peminjaman ({filteredLendings.length})</h3>
                        <div className="filter-buttons">
                            <button 
                                className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                                onClick={() => setFilter('all')}
                            >
                                Semua
                            </button>
                            <button 
                                className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
                                onClick={() => setFilter('active')}
                            >
                                Dipinjam
                            </button>
                            <button 
                                className={`filter-btn ${filter === 'returned' ? 'active' : ''}`}
                                onClick={() => setFilter('returned')}
                            >
                                Dikembalikan
                            </button>
                            <button 
                                className={`filter-btn ${filter === 'overdue' ? 'active' : ''}`}
                                onClick={() => setFilter('overdue')}
                            >
                                Terlambat
                            </button>
                        </div>
                    </div>
                    <button 
                        className="btn-primary"
                        onClick={() => setShowModal(true)}
                    >
                        + Tambah Peminjaman
                    </button>
                </div>

                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>Peminjam</th>
                                <th>Buku</th>
                                <th>Tgl Pinjam</th>
                                <th>Tgl Kembali</th>
                                <th>Status</th>
                                <th>Denda</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLendings.map((lending, index) => (
                                <tr key={lending.id}>
                                    <td>{index + 1}</td>
                                    <td>
                                        <div className="user-info">
                                            <strong>{lending.user?.fullname}</strong>
                                            <small>{lending.user?.student_id}</small>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="book-info">
                                            <strong>{lending.book?.title}</strong>
                                            <small>ISBN: {lending.book?.isbn}</small>
                                        </div>
                                    </td>
                                    <td>{new Date(lending.loan_date).toLocaleDateString('id-ID')}</td>
                                    <td>
                                        {lending.return_date 
                                            ? new Date(lending.return_date).toLocaleDateString('id-ID')
                                            : '-'
                                        }
                                    </td>
                                    <td>
                                        <span 
                                            className="status-badge"
                                            style={{ backgroundColor: getStatusColor(lending.status) }}
                                        >
                                            {getStatusText(lending.status)}
                                        </span>
                                    </td>
                                    <td>
                                        {lending.fine_amount > 0 
                                            ? `Rp ${lending.fine_amount.toLocaleString('id-ID')}`
                                            : '-'
                                        }
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            {lending.status === 'active' && (
                                                <button 
                                                    className="btn-return"
                                                    onClick={() => handleReturn(lending.id)}
                                                >
                                                    📚 Kembalikan
                                                </button>
                                            )}
                                            <button 
                                                className="btn-delete"
                                                onClick={() => handleDelete(lending.id)}
                                            >
                                                🗑️ Hapus
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredLendings.length === 0 && (
                                <tr>
                                    <td colSpan="8" className="no-data">
                                        {filter === 'all' 
                                            ? 'Belum ada peminjaman.' 
                                            : `Tidak ada peminjaman dengan status "${getStatusText(filter)}".`
                                        }
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Tambah Peminjaman Buku</h3>
                            <button 
                                className="modal-close"
                                onClick={() => setShowModal(false)}
                            >
                                ×
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Pilih Peminjam *</label>
                                <select
                                    value={formData.user_id}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        user_id: e.target.value
                                    })}
                                    required
                                >
                                    <option value="">-- Pilih Siswa --</option>
                                    {users.map(user => (
                                        <option key={user.id} value={user.id}>
                                            {user.fullname} ({user.student_id})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="form-group">
                                <label>Pilih Buku *</label>
                                <select
                                    value={formData.book_id}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        book_id: e.target.value
                                    })}
                                    required
                                >
                                    <option value="">-- Pilih Buku --</option>
                                    {books.map(book => (
                                        <option key={book.id} value={book.id}>
                                            {book.title} (Stok: {book.stock})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Tanggal Pinjam *</label>
                                    <input
                                        type="date"
                                        value={formData.loan_date}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            loan_date: e.target.value
                                        })}
                                        required
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label>Tanggal Jatuh Tempo</label>
                                    <input
                                        type="date"
                                        value={formData.due_date}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            due_date: e.target.value
                                        })}
                                        min={formData.loan_date}
                                    />
                                </div>
                            </div>
                            
                            <div className="modal-footer">
                                <button 
                                    type="button" 
                                    onClick={() => setShowModal(false)}
                                    className="btn-secondary"
                                >
                                    Batal
                                </button>
                                <button 
                                    type="submit" 
                                    className="btn-primary"
                                >
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
