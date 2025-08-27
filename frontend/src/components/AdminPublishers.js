import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/AdminPublishers.css';

const AdminPublishers = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [publishers, setPublishers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedPublisher, setSelectedPublisher] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [publisherForm, setPublisherForm] = useState({
        name: '',
        address: '',
        phone: ''
    });

    useEffect(() => {
        fetchPublishers();
    }, []);

    const fetchPublishers = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/publishers', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (response.data && response.data.success) {
                setPublishers(Array.isArray(response.data.data) ? response.data.data : []);
            } else if (Array.isArray(response.data)) {
                setPublishers(response.data);
            } else {
                setPublishers([]);
            }
        } catch (error) {
            console.error('Error fetching publishers:', error);
            setPublishers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setPublisherForm({
            ...publisherForm,
            [e.target.name]: e.target.value
        });
    };

    const handleAddPublisher = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://127.0.0.1:8000/api/publishers', publisherForm, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            alert('Penerbit berhasil ditambahkan!');
            setShowAddModal(false);
            setPublisherForm({ name: '', address: '', phone: '' });
            fetchPublishers();
        } catch (error) {
            console.error('Error adding publisher:', error);
            alert('Gagal menambahkan penerbit: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleEditPublisher = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`http://127.0.0.1:8000/api/publishers/${selectedPublisher.id}`, publisherForm, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            alert('Penerbit berhasil diperbarui!');
            setShowEditModal(false);
            setSelectedPublisher(null);
            fetchPublishers();
        } catch (error) {
            console.error('Error updating publisher:', error);
            alert('Gagal memperbarui penerbit: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleDeletePublisher = async (publisherId) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus penerbit ini?')) {
            try {
                await axios.delete(`http://127.0.0.1:8000/api/publishers/${publisherId}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                alert('Penerbit berhasil dihapus!');
                fetchPublishers();
            } catch (error) {
                console.error('Error deleting publisher:', error);
                alert('Gagal menghapus penerbit: ' + (error.response?.data?.message || error.message));
            }
        }
    };

    const openEditModal = (publisher) => {
        setSelectedPublisher(publisher);
        setPublisherForm({
            name: publisher.name || publisher.nama,
            address: publisher.address || publisher.alamat || '',
            phone: publisher.phone || publisher.telepon || ''
        });
        setShowEditModal(true);
    };

    // Filter publishers
    const filteredPublishers = publishers.filter(publisher => {
        const name = publisher.name || publisher.nama || '';
        return name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="admin-publishers-container">
                <div className="loading">Memuat data penerbit...</div>
            </div>
        );
    }

    return (
        <div className="admin-publishers-container">
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
                            <h1>Kelola Penerbit</h1>
                            <p>Manajemen penerbit buku perpustakaan</p>
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
                        placeholder="Cari penerbit..."
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
                        + Tambah Penerbit
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="stats-cards">
                <div className="stat-card">
                    <div className="stat-icon">🏢</div>
                    <div className="stat-info">
                        <div className="stat-number">{publishers.length}</div>
                        <div className="stat-label">Total Penerbit</div>
                    </div>
                </div>
            </div>

            {/* Publishers Table */}
            <div className="publishers-table">
                <div className="table-header">
                    <h3>Daftar Penerbit</h3>
                    <p>Menampilkan {filteredPublishers.length} dari {publishers.length} penerbit</p>
                </div>
                
                {filteredPublishers.length === 0 ? (
                    <div className="empty-state">
                        <p>Tidak ada penerbit ditemukan</p>
                    </div>
                ) : (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>Nama Penerbit</th>
                                <th>Alamat</th>
                                <th>Telepon</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPublishers.map((publisher, index) => (
                                <tr key={publisher.id}>
                                    <td>{index + 1}</td>
                                    <td>{publisher.name || publisher.nama}</td>
                                    <td>{publisher.address || publisher.alamat || '-'}</td>
                                    <td>{publisher.phone || publisher.telepon || '-'}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                onClick={() => openEditModal(publisher)}
                                                className="edit-btn"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeletePublisher(publisher.id)}
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

            {/* Add Publisher Modal */}
            {showAddModal && (
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Tambah Penerbit Baru</h3>
                            <button 
                                onClick={() => setShowAddModal(false)}
                                className="close-btn"
                            >
                                ×
                            </button>
                        </div>
                        <form onSubmit={handleAddPublisher} className="publisher-form">
                            <div className="form-group">
                                <label>Nama Penerbit</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={publisherForm.name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Alamat</label>
                                <textarea
                                    name="address"
                                    value={publisherForm.address}
                                    onChange={handleInputChange}
                                    rows="3"
                                />
                            </div>

                            <div className="form-group">
                                <label>Telepon</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={publisherForm.phone}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="form-actions">
                                <button type="button" onClick={() => setShowAddModal(false)} className="cancel-btn">
                                    Batal
                                </button>
                                <button type="submit" className="submit-btn">
                                    Tambah Penerbit
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Publisher Modal */}
            {showEditModal && (
                <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Edit Penerbit</h3>
                            <button 
                                onClick={() => setShowEditModal(false)}
                                className="close-btn"
                            >
                                ×
                            </button>
                        </div>
                        <form onSubmit={handleEditPublisher} className="publisher-form">
                            <div className="form-group">
                                <label>Nama Penerbit</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={publisherForm.name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Alamat</label>
                                <textarea
                                    name="address"
                                    value={publisherForm.address}
                                    onChange={handleInputChange}
                                    rows="3"
                                />
                            </div>

                            <div className="form-group">
                                <label>Telepon</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={publisherForm.phone}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="form-actions">
                                <button type="button" onClick={() => setShowEditModal(false)} className="cancel-btn">
                                    Batal
                                </button>
                                <button type="submit" className="submit-btn">
                                    Update Penerbit
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPublishers;
