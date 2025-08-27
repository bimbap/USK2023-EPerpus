import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/AdminPages.css';

export default function CategoriesManagement() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: ''
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
        fetchCategories();
    }, [navigate]);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://127.0.0.1:8000/api/categories');
            if (response.data.success) {
                setCategories(response.data.data);
            }
        } catch (error) {
            setError('Gagal mengambil data kategori');
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let response;
            if (editingCategory) {
                response = await axios.put(`http://127.0.0.1:8000/api/categories/${editingCategory.id}`, formData);
            } else {
                response = await axios.post('http://127.0.0.1:8000/api/categories', formData);
            }
            
            if (response.data.success) {
                fetchCategories();
                setShowModal(false);
                setEditingCategory(null);
                setFormData({ name: '', description: '' });
            }
        } catch (error) {
            setError(editingCategory ? 'Gagal mengupdate kategori' : 'Gagal menambah kategori');
            console.error('Error saving category:', error);
        }
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            description: category.description || ''
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Yakin ingin menghapus kategori ini?')) {
            try {
                const response = await axios.delete(`http://127.0.0.1:8000/api/categories/${id}`);
                if (response.data.success) {
                    fetchCategories();
                }
            } catch (error) {
                setError('Gagal menghapus kategori');
                console.error('Error deleting category:', error);
            }
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingCategory(null);
        setFormData({ name: '', description: '' });
    };

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div className="admin-page-container">
            <div className="page-header">
                <div className="header-content">
                    <h1>🏷️ Manajemen Kategori</h1>
                    <p>Kelola kategori buku perpustakaan</p>
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
                    <h3>Daftar Kategori ({categories.length})</h3>
                    <button 
                        className="btn-primary"
                        onClick={() => setShowModal(true)}
                    >
                        + Tambah Kategori
                    </button>
                </div>

                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>Nama Kategori</th>
                                <th>Deskripsi</th>
                                <th>Jumlah Buku</th>
                                <th>Dibuat</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map((category, index) => (
                                <tr key={category.id}>
                                    <td>{index + 1}</td>
                                    <td className="category-name">{category.name}</td>
                                    <td>{category.description || '-'}</td>
                                    <td>
                                        <span className="book-count">
                                            {category.books_count || 0} buku
                                        </span>
                                    </td>
                                    <td>{new Date(category.created_at).toLocaleDateString('id-ID')}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <button 
                                                className="btn-edit"
                                                onClick={() => handleEdit(category)}
                                            >
                                                ✏️ Edit
                                            </button>
                                            <button 
                                                className="btn-delete"
                                                onClick={() => handleDelete(category.id)}
                                            >
                                                🗑️ Hapus
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {categories.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="no-data">
                                        Belum ada kategori. Tambahkan kategori pertama!
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
                            <h3>{editingCategory ? 'Edit Kategori' : 'Tambah Kategori'}</h3>
                            <button 
                                className="modal-close"
                                onClick={handleCloseModal}
                            >
                                ×
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Nama Kategori *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        name: e.target.value
                                    })}
                                    placeholder="Contoh: Fiksi, Non-Fiksi, Referensi"
                                    required
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Deskripsi</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        description: e.target.value
                                    })}
                                    placeholder="Deskripsi kategori (opsional)"
                                    rows="3"
                                />
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
                                    {editingCategory ? 'Update' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
