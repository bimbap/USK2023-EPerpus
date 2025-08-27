import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/LibrarianMemberManagement.css';

const LibrarianMemberManagement = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('add');
    const [selectedMember, setSelectedMember] = useState(null);
    
    // Search and filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [filterClass, setFilterClass] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    
    // Form states
    const [formData, setFormData] = useState({
        fullname: '',
        username: '',
        email: '',
        password: '',
        kelas: '',
        jurusan: '',
        status: 'active'
    });
    
    // Statistics
    const [stats, setStats] = useState({
        totalMembers: 0,
        activeMembers: 0,
        inactiveMembers: 0,
        membersWithBorrowings: 0
    });

    useEffect(() => {
        fetchMembers();
        fetchStats();
    }, []);

    const fetchMembers = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/users', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (response.data && response.data.success) {
                // Filter only siswa (students)
                const students = (response.data.data || []).filter(u => u.role === 'siswa');
                setMembers(students);
            }
        } catch (error) {
            console.error('Error fetching members:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/librarian/member-statistics', {
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
    const filteredMembers = members.filter(member => {
        const matchesSearch = 
            member.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.email?.toLowerCase().includes(searchTerm.toLowerCase());
            
        const matchesClass = !filterClass || member.kelas === filterClass;
        const matchesStatus = !filterStatus || member.status === filterStatus;
        
        return matchesSearch && matchesClass && matchesStatus;
    });

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentMembers = filteredMembers.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const openModal = (type, member = null) => {
        setModalType(type);
        setSelectedMember(member);
        
        if (type === 'edit' && member) {
            setFormData({
                fullname: member.fullname || '',
                username: member.username || '',
                email: member.email || '',
                password: '',
                kelas: member.kelas || '',
                jurusan: member.jurusan || '',
                status: member.status || 'active'
            });
        } else {
            setFormData({
                fullname: '',
                username: '',
                email: '',
                password: '',
                kelas: '',
                jurusan: '',
                status: 'active'
            });
        }
        
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedMember(null);
        setFormData({
            fullname: '',
            username: '',
            email: '',
            password: '',
            kelas: '',
            jurusan: '',
            status: 'active'
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const submitData = { ...formData, role: 'siswa' };
            
            if (modalType === 'add') {
                await axios.post('http://127.0.0.1:8000/api/users', submitData, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                alert('Anggota berhasil ditambahkan!');
            } else if (modalType === 'edit') {
                // Don't send password if it's empty for update
                if (!submitData.password) {
                    delete submitData.password;
                }
                
                await axios.put(`http://127.0.0.1:8000/api/users/${selectedMember.id}`, submitData, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                alert('Anggota berhasil diperbarui!');
            }
            
            fetchMembers();
            fetchStats();
            closeModal();
        } catch (error) {
            console.error('Error saving member:', error);
            const errorMessage = error.response?.data?.message || 'Gagal menyimpan anggota.';
            alert(errorMessage);
        }
    };

    const handleDelete = async (member) => {
        if (window.confirm(`Apakah Anda yakin ingin menghapus anggota "${member.fullname}"?`)) {
            try {
                await axios.delete(`http://127.0.0.1:8000/api/users/${member.id}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                alert('Anggota berhasil dihapus!');
                fetchMembers();
                fetchStats();
            } catch (error) {
                console.error('Error deleting member:', error);
                const errorMessage = error.response?.data?.message || 'Gagal menghapus anggota.';
                alert(errorMessage);
            }
        }
    };

    const toggleMemberStatus = async (member) => {
        const newStatus = member.status === 'active' ? 'inactive' : 'active';
        
        try {
            await axios.put(`http://127.0.0.1:8000/api/users/${member.id}`, {
                ...member,
                status: newStatus
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            alert(`Status anggota berhasil diubah menjadi ${newStatus === 'active' ? 'aktif' : 'tidak aktif'}!`);
            fetchMembers();
            fetchStats();
        } catch (error) {
            console.error('Error updating member status:', error);
            alert('Gagal mengubah status anggota.');
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Memuat data anggota...</p>
            </div>
        );
    }

    return (
        <div className="librarian-members">
            {/* Header */}
            <div className="page-header">
                <div className="header-content">
                    <div className="header-left">
                        <button className="back-btn" onClick={() => navigate('/librarian/dashboard')}>
                            ← Kembali
                        </button>
                        <div className="header-text">
                            <h1>👥 Manajemen Anggota</h1>
                            <p>Kelola data anggota perpustakaan (siswa)</p>
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
                    <div className="stat-icon">👥</div>
                    <div className="stat-info">
                        <div className="stat-number">{stats.totalMembers}</div>
                        <div className="stat-label">Total Anggota</div>
                    </div>
                </div>
                
                <div className="stat-card">
                    <div className="stat-icon">✅</div>
                    <div className="stat-info">
                        <div className="stat-number">{stats.activeMembers}</div>
                        <div className="stat-label">Anggota Aktif</div>
                    </div>
                </div>
                
                <div className="stat-card">
                    <div className="stat-icon">❌</div>
                    <div className="stat-info">
                        <div className="stat-number">{stats.inactiveMembers}</div>
                        <div className="stat-label">Anggota Tidak Aktif</div>
                    </div>
                </div>
                
                <div className="stat-card">
                    <div className="stat-icon">📚</div>
                    <div className="stat-info">
                        <div className="stat-number">{stats.membersWithBorrowings}</div>
                        <div className="stat-label">Sedang Meminjam</div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="controls-section">
                <div className="search-filter">
                    <div className="search-box">
                        <input
                            type="text"
                            placeholder="🔍 Cari nama, username, atau email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <div className="filters">
                        <select
                            value={filterClass}
                            onChange={(e) => setFilterClass(e.target.value)}
                        >
                            <option value="">Semua Kelas</option>
                            <option value="X">Kelas X</option>
                            <option value="XI">Kelas XI</option>
                            <option value="XII">Kelas XII</option>
                        </select>
                        
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="">Semua Status</option>
                            <option value="active">Aktif</option>
                            <option value="inactive">Tidak Aktif</option>
                        </select>
                    </div>
                </div>
                
                <div className="action-buttons">
                    <button className="add-btn" onClick={() => openModal('add')}>
                        ➕ Tambah Anggota
                    </button>
                </div>
            </div>

            {/* Members Table */}
            <div className="table-section">
                <div className="table-container">
                    <table className="members-table">
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>Nama Lengkap</th>
                                <th>Username</th>
                                <th>Email</th>
                                <th>Kelas</th>
                                <th>Jurusan</th>
                                <th>Status</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentMembers.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="no-data">
                                        {searchTerm || filterClass || filterStatus 
                                            ? 'Tidak ada anggota yang sesuai dengan filter.' 
                                            : 'Belum ada data anggota.'
                                        }
                                    </td>
                                </tr>
                            ) : (
                                currentMembers.map((member, index) => (
                                    <tr key={member.id}>
                                        <td>{indexOfFirstItem + index + 1}</td>
                                        <td className="member-name">
                                            <strong>{member.fullname}</strong>
                                        </td>
                                        <td className="username">@{member.username}</td>
                                        <td className="email">{member.email}</td>
                                        <td className="class-badge">
                                            <span className="class-label">{member.kelas || 'N/A'}</span>
                                        </td>
                                        <td className="major">{member.jurusan || 'N/A'}</td>
                                        <td>
                                            <span className={`status-badge ${member.status}`}>
                                                {member.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button 
                                                    className="edit-btn"
                                                    onClick={() => openModal('edit', member)}
                                                >
                                                    ✏️
                                                </button>
                                                <button 
                                                    className={`toggle-btn ${member.status}`}
                                                    onClick={() => toggleMemberStatus(member)}
                                                    title={member.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
                                                >
                                                    {member.status === 'active' ? '🔒' : '🔓'}
                                                </button>
                                                <button 
                                                    className="delete-btn"
                                                    onClick={() => handleDelete(member)}
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
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

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{modalType === 'add' ? '➕ Tambah Anggota Baru' : '✏️ Edit Anggota'}</h2>
                            <button className="close-btn" onClick={closeModal}>✖</button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="member-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Nama Lengkap *</label>
                                    <input
                                        type="text"
                                        name="fullname"
                                        value={formData.fullname}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Username *</label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Email *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Password {modalType === 'edit' ? '(kosongkan jika tidak diubah)' : '*'}</label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        required={modalType === 'add'}
                                    />
                                </div>
                            </div>
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Kelas</label>
                                    <select
                                        name="kelas"
                                        value={formData.kelas}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Pilih Kelas</option>
                                        <option value="X">Kelas X</option>
                                        <option value="XI">Kelas XI</option>
                                        <option value="XII">Kelas XII</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Jurusan</label>
                                    <select
                                        name="jurusan"
                                        value={formData.jurusan}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Pilih Jurusan</option>
                                        <option value="IPA">IPA</option>
                                        <option value="IPS">IPS</option>
                                        <option value="Bahasa">Bahasa</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div className="form-group">
                                <label>Status</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                >
                                    <option value="active">Aktif</option>
                                    <option value="inactive">Tidak Aktif</option>
                                </select>
                            </div>
                            
                            <div className="form-actions">
                                <button type="button" className="cancel-btn" onClick={closeModal}>
                                    Batal
                                </button>
                                <button type="submit" className="submit-btn">
                                    {modalType === 'add' ? '➕ Tambah Anggota' : '💾 Simpan Perubahan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LibrarianMemberManagement;
