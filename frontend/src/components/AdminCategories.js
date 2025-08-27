import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/AdminCategories.css';

const AdminCategories = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [categoryForm, setCategoryForm] = useState({
        name: '',
        description: ''
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/categories', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (response.data && response.data.success) {
                setCategories(Array.isArray(response.data.data) ? response.data.data : []);
            } else if (Array.isArray(response.data)) {
                setCategories(response.data);
            } else {
                setCategories([]);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            setCategories([]);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setCategoryForm({
            ...categoryForm,
            [e.target.name]: e.target.value
        });
    };

    const handleAddCategory = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://127.0.0.1:8000/api/categories', categoryForm, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            alert('Kategori berhasil ditambahkan!');
            setShowAddModal(false);
            setCategoryForm({ name: '', description: '' });
            fetchCategories();
        } catch (error) {
            console.error('Error adding category:', error);
            alert('Gagal menambahkan kategori: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleEditCategory = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`http://127.0.0.1:8000/api/categories/${selectedCategory.id}`, categoryForm, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            alert('Kategori berhasil diperbarui!');
            setShowEditModal(false);
            setSelectedCategory(null);
            fetchCategories();
        } catch (error) {
            console.error('Error updating category:', error);
            alert('Gagal memperbarui kategori: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleDeleteCategory = async (categoryId) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus kategori ini?')) {
            try {
                await axios.delete(`http://127.0.0.1:8000/api/categories/${categoryId}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                alert('Kategori berhasil dihapus!');
                fetchCategories();
            } catch (error) {
                console.error('Error deleting category:', error);
                alert('Gagal menghapus kategori: ' + (error.response?.data?.message || error.message));
            }
        }
    };

    const openEditModal = (category) => {
        setSelectedCategory(category);
        setCategoryForm({
            name: category.name || category.nama,
            description: category.description || category.deskripsi || ''
        });
        setShowEditModal(true);
    };

    // Filter categories
    const filteredCategories = categories.filter(category => {
        const name = category.name || category.nama || '';
        return name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="admin-categories-container">
                <div className="loading">Memuat data kategori...</div>
            </div>
        );
    }

    return (
        <div className="admin-categories-container">
            {/* Header */}
            <div className="header">
                <div className="header-content">
                    <div className="header-left">
                        <button 
                            onClick={() => navigate('/admin/dashboard')} 
                            className="back-btn"
                        >
                            ← Kembali
                        </button>
                        <div className="title-section">
                            <h1>Kelola Kategori</h1>
                            <p>Manajemen kategori buku perpustakaan</p>
                        </div>
                    </div>
                    <div className="header-right">
                        <span className="user-info">
                            👤 {user?.fullname} | Admin
                        </span>
                        <button onClick={handleLogout} className="logout-btn">
                            Keluar
                        </button>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="controls">
                <div className="search-section">
                    <input
                        type="text"
                        placeholder="Cari kategori..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
                <div className="action-section">
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="add-btn"
                    >
                        + Tambah Kategori
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="stats-cards">
                <div className="stat-card">
                    <div className="stat-icon">🏷️</div>
                    <div className="stat-info">
                        <div className="stat-number">{categories.length}</div>
                        <div className="stat-label">Total Kategori</div>
                    </div>
                </div>
            </div>

            {/* Categories Table */}
            <div className="categories-table">
                <div className="table-header">
                    <h3>Daftar Kategori</h3>
                    <p>Menampilkan {filteredCategories.length} dari {categories.length} kategori</p>
                </div>
                
                {filteredCategories.length === 0 ? (
                    <div className="empty-state">
                        <p>Tidak ada kategori ditemukan</p>
                    </div>
                ) : (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>Nama Kategori</th>
                                <th>Deskripsi</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCategories.map((category, index) => (
                                <tr key={category.id}>
                                    <td>{index + 1}</td>
                                    <td>{category.name || category.nama}</td>
                                    <td>{category.description || category.deskripsi || '-'}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                onClick={() => openEditModal(category)}
                                                className="edit-btn"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCategory(category.id)}
                                                className="delete-btn"
                                            >
                                                Hapus
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Add Category Modal */}
            {showAddModal && (
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Tambah Kategori Baru</h3>
                            <button 
                                onClick={() => setShowAddModal(false)}
                                className="close-btn"
                            >
                                ×
                            </button>
                        </div>
                        <form onSubmit={handleAddCategory} className="category-form">
                            <div className="form-group">
                                <label>Nama Kategori</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={categoryForm.name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Deskripsi</label>
                                <textarea
                                    name="description"
                                    value={categoryForm.description}
                                    onChange={handleInputChange}
                                    rows="3"
                                />
                            </div>

                            <div className="form-actions">
                                <button type="button" onClick={() => setShowAddModal(false)} className="cancel-btn">
                                    Batal
                                </button>
                                <button type="submit" className="submit-btn">
                                    Tambah Kategori
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Category Modal */}
            {showEditModal && (
                <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Edit Kategori</h3>
                            <button 
                                onClick={() => setShowEditModal(false)}
                                className="close-btn"
                            >
                                ×
                            </button>
                        </div>
                        <form onSubmit={handleEditCategory} className="category-form">
                            <div className="form-group">
                                <label>Nama Kategori</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={categoryForm.name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Deskripsi</label>
                                <textarea
                                    name="description"
                                    value={categoryForm.description}
                                    onChange={handleInputChange}
                                    rows="3"
                                />
                            </div>

                            <div className="form-actions">
                                <button type="button" onClick={() => setShowEditModal(false)} className="cancel-btn">
                                    Batal
                                </button>
                                <button type="submit" className="submit-btn">
                                    Update Kategori
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCategories;
