import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/AdminPages.css';

export default function PublishersManagement() {
    const [publishers, setPublishers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingPublisher, setEditingPublisher] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        email: '',
        phone: ''
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
        fetchPublishers();
    }, [navigate]);

    const fetchPublishers = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://127.0.0.1:8000/api/publishers');
            if (response.data.success) {
                setPublishers(response.data.data);
            } else {
                setPublishers([]);
            }
        } catch (error) {
            setError('Gagal mengambil data penerbit');
            console.error('Error fetching publishers:', error);
            setPublishers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let response;
            if (editingPublisher) {
                response = await axios.put(`http://127.0.0.1:8000/api/publishers/${editingPublisher.id}`, formData);
            } else {
                response = await axios.post('http://127.0.0.1:8000/api/publishers', formData);
            }
            
            if (response.data.success) {
                fetchPublishers();
                setShowModal(false);
                setEditingPublisher(null);
                setFormData({ name: '', address: '', email: '', phone: '' });
            }
        } catch (error) {
            setError(editingPublisher ? 'Gagal mengupdate penerbit' : 'Gagal menambah penerbit');
            console.error('Error saving publisher:', error);
        }
    };

    const handleEdit = (publisher) => {
        setEditingPublisher(publisher);
        setFormData({
            name: publisher.name,
            address: publisher.address || '',
            email: publisher.email || '',
            phone: publisher.phone || ''
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Yakin ingin menghapus penerbit ini?')) {
            try {
                const response = await axios.delete(`http://127.0.0.1:8000/api/publishers/${id}`);
                if (response.data.success) {
                    fetchPublishers();
                }
            } catch (error) {
                setError('Gagal menghapus penerbit');
                console.error('Error deleting publisher:', error);
            }
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingPublisher(null);
        setFormData({ name: '', address: '', email: '', phone: '' });
    };

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div className="admin-page-container">
            <div className="page-header">
                <div className="header-content">
                    <h1>🏢 Manajemen Penerbit</h1>
                    <p>Kelola data penerbit buku</p>
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
                    <h3>Daftar Penerbit ({publishers.length})</h3>
                    <button 
                        className="btn-primary"
                        onClick={() => setShowModal(true)}
                    >
                        + Tambah Penerbit
                    </button>
                </div>

                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>Nama Penerbit</th>
                                <th>Alamat</th>
                                <th>Email</th>
                                <th>Telepon</th>
                                <th>Jumlah Buku</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {publishers.map((publisher, index) => (
                                <tr key={publisher.id}>
                                    <td>{index + 1}</td>
                                    <td className="publisher-name">{publisher.name}</td>
                                    <td>{publisher.address || '-'}</td>
                                    <td>{publisher.email || '-'}</td>
                                    <td>{publisher.phone || '-'}</td>
                                    <td>
                                        <span className="book-count">
                                            {publisher.books_count || 0} buku
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button 
                                                className="btn-edit"
                                                onClick={() => handleEdit(publisher)}
                                            >
                                                ✏️ Edit
                                            </button>
                                            <button 
                                                className="btn-delete"
                                                onClick={() => handleDelete(publisher.id)}
                                            >
                                                🗑️ Hapus
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {publishers.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="no-data">
                                        Belum ada penerbit. Tambahkan penerbit pertama!
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
                            <h3>{editingPublisher ? 'Edit Penerbit' : 'Tambah Penerbit'}</h3>
                            <button 
                                className="modal-close"
                                onClick={handleCloseModal}
                            >
                                ×
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Nama Penerbit *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        name: e.target.value
                                    })}
                                    placeholder="Contoh: Gramedia, Erlangga"
                                    required
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Alamat</label>
                                <textarea
                                    value={formData.address}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        address: e.target.value
                                    })}
                                    placeholder="Alamat lengkap penerbit"
                                    rows="3"
                                />
                            </div>
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            email: e.target.value
                                        })}
                                        placeholder="email@penerbit.com"
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label>Telepon</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            phone: e.target.value
                                        })}
                                        placeholder="021-12345678"
                                    />
                                </div>
                            </div>
                            
                            <div className="modal-footer">
                                <button 
                                    type="button" 
                                    onClick={handleCloseModal}
                                    className="btn-secondary"
                                >
                                    Batal
                                </button>
                                <button 
                                    type="submit" 
                                    className="btn-primary"
                                >
                                    {editingPublisher ? 'Update' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
