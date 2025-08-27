import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/AdminMemberManagement.css';

const AdminMemberManagement = () => {
    const navigate = useNavigate();
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [classFilter, setClassFilter] = useState('');
    const [jurusanFilter, setJurusanFilter] = useState('');
    const [userInfo, setUserInfo] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [selectedMember, setSelectedMember] = useState(null);
    const [memberForm, setMemberForm] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        class: '',
        jurusan: '',
        nisn: '',
        status: 'active'
    });
    const [statistics, setStatistics] = useState({
        totalMembers: 0,
        activeMembers: 0,
        inactiveMembers: 0,
        membersByClass: {}
    });

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        setUserInfo(user);
        
        fetchMembers();
        fetchStatistics();
    }, []);

    const fetchMembers = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://127.0.0.1:8000/api/members', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            setMembers(response.data.data || response.data);
            setError('');
        } catch (err) {
            console.error('Error fetching members:', err);
            setError('Gagal memuat data anggota. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    const fetchStatistics = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/admin/member-statistics', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            setStatistics(response.data);
        } catch (err) {
            console.error('Error fetching statistics:', err);
        }
    };

    const handleAddMember = () => {
        setModalMode('add');
        setSelectedMember(null);
        setMemberForm({
            name: '',
            email: '',
            phone: '',
            address: '',
            class: '',
            jurusan: '',
            nisn: '',
            status: 'active'
        });
        setShowModal(true);
    };

    const handleEditMember = (member) => {
        setModalMode('edit');
        setSelectedMember(member);
        setMemberForm({
            name: member.name || '',
            email: member.email || '',
            phone: member.phone || '',
            address: member.address || '',
            class: member.class || '',
            jurusan: member.jurusan || '',
            nisn: member.nisn || '',
            status: member.status || 'active'
        });
        setShowModal(true);
    };

    const handleDeleteMember = async (member) => {
        if (window.confirm(`Apakah Anda yakin ingin menghapus anggota ${member.name}?`)) {
            try {
                await axios.delete(`http://127.0.0.1:8000/api/members/${member.id}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                
                fetchMembers();
                fetchStatistics();
                alert('Anggota berhasil dihapus!');
            } catch (err) {
                console.error('Error deleting member:', err);
                alert('Gagal menghapus anggota. Silakan coba lagi.');
            }
        }
    };

    const handleSubmitMember = async (e) => {
        e.preventDefault();
        
        try {
            const submitData = {
                ...memberForm,
                role: 'member' // Always set role as member
            };

            if (modalMode === 'add') {
                await axios.post('http://127.0.0.1:8000/api/members', submitData, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                alert('Anggota berhasil ditambahkan!');
            } else {
                await axios.put(`http://127.0.0.1:8000/api/members/${selectedMember.id}`, submitData, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                alert('Anggota berhasil diperbarui!');
            }
            
            setShowModal(false);
            fetchMembers();
            fetchStatistics();
        } catch (err) {
            console.error('Error saving member:', err);
            alert('Gagal menyimpan data anggota. Silakan coba lagi.');
        }
    };

    const toggleMemberStatus = async (member) => {
        try {
            const newStatus = member.status === 'active' ? 'inactive' : 'active';
            
            await axios.put(`http://127.0.0.1:8000/api/members/${member.id}`, {
                status: newStatus
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            fetchMembers();
            fetchStatistics();
            alert(`Status anggota berhasil ${newStatus === 'active' ? 'diaktifkan' : 'dinonaktifkan'}!`);
        } catch (err) {
            console.error('Error updating member status:', err);
            alert('Gagal mengubah status anggota. Silakan coba lagi.');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    // Filter and search members
    const filteredMembers = members.filter(member => {
        const matchesSearch = member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             member.nisn?.includes(searchTerm);
        const matchesClass = !classFilter || member.class === classFilter;
        const matchesJurusan = !jurusanFilter || member.jurusan === jurusanFilter;
        
        return matchesSearch && matchesClass && matchesJurusan;
    });

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentMembers = filteredMembers.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);

    if (loading) {
        return (
            <div className="admin-member-management">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Memuat data anggota...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-member-management">
            {/* Header */}
            <div className="page-header">
                <div className="header-content">
                    <div className="header-left">
                        <button onClick={() => navigate('/admin/dashboard')} className="back-btn">
                            ← Kembali
                        </button>
                        <div className="header-text">
                            <h1>Kelola Anggota Perpustakaan</h1>
                            <p>Manajemen data anggota perpustakaan</p>
                        </div>
                    </div>
                    <div className="header-right">
                        <div className="user-info">
                            <span>👤 {userInfo?.name}</span>
                            <span className="role-badge admin">Admin</span>
                        </div>
                        <button onClick={handleLogout} className="logout-btn">
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Member Statistics */}
            <div className="member-management-controls">
                <div className="member-stats">
                    <div className="stat-card">
                        <div className="stat-icon">👨‍🎓</div>
                        <div className="stat-content">
                            <div className="stat-number">{statistics.totalMembers || filteredMembers.length}</div>
                            <div className="stat-label">Total Anggota</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">✅</div>
                        <div className="stat-content">
                            <div className="stat-number">{filteredMembers.filter(m => m.status === 'active').length}</div>
                            <div className="stat-label">Anggota Aktif</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">❌</div>
                        <div className="stat-content">
                            <div className="stat-number">{filteredMembers.filter(m => m.status === 'inactive').length}</div>
                            <div className="stat-label">Anggota Nonaktif</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">📚</div>
                        <div className="stat-content">
                            <div className="stat-number">{Object.keys(statistics.membersByClass || {}).length}</div>
                            <div className="stat-label">Total Kelas</div>
                        </div>
                    </div>
                </div>

                <div className="controls-section">
                    <div className="search-filters">
                        <input
                            type="text"
                            placeholder="Cari anggota (nama, email, NISN)..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                        <select
                            value={classFilter}
                            onChange={(e) => setClassFilter(e.target.value)}
                            className="class-filter"
                        >
                            <option value="">Semua Kelas</option>
                            <option value="X">Kelas X</option>
                            <option value="XI">Kelas XI</option>
                            <option value="XII">Kelas XII</option>
                        </select>
                        <select
                            value={jurusanFilter}
                            onChange={(e) => setJurusanFilter(e.target.value)}
                            className="jurusan-filter"
                        >
                            <option value="">Semua Jurusan</option>
                            <option value="IPA">IPA</option>
                            <option value="IPS">IPS</option>
                            <option value="Bahasa">Bahasa</option>
                            <option value="TKJ">TKJ</option>
                            <option value="RPL">RPL</option>
                            <option value="MM">Multimedia</option>
                        </select>
                    </div>

                    <div className="control-actions">
                        <button onClick={handleAddMember} className="add-member-btn">
                            + Tambah Anggota
                        </button>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="error-message">
                    <p>{error}</p>
                    <button onClick={fetchMembers}>Coba Lagi</button>
                </div>
            )}

            {/* Members Table */}
            <div className="members-table-container">
                <div className="table-header">
                    <div className="table-title">Data Anggota Perpustakaan</div>
                    <div className="table-info">
                        Menampilkan {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredMembers.length)} dari {filteredMembers.length} anggota
                    </div>
                </div>

                <table className="members-table">
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>Informasi Anggota</th>
                            <th>NISN</th>
                            <th>Kelas/Jurusan</th>
                            <th>Kontak</th>
                            <th>Status</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentMembers.map((member, index) => (
                            <tr key={member.id}>
                                <td>{indexOfFirstItem + index + 1}</td>
                                <td>
                                    <div className="member-info-cell">
                                        <div className="member-avatar">
                                            {member.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="member-details">
                                            <h4>{member.name}</h4>
                                            <p>{member.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td>{member.nisn || '-'}</td>
                                <td>
                                    <div className="class-info">
                                        <span className="class-badge">{member.class}</span>
                                        <span className="jurusan-badge">{member.jurusan}</span>
                                    </div>
                                </td>
                                <td>
                                    <div className="contact-info">
                                        <div>{member.phone || '-'}</div>
                                        <div className="address">{member.address || '-'}</div>
                                    </div>
                                </td>
                                <td>
                                    <span className={`status-badge ${member.status}`}>
                                        {member.status === 'active' ? 'Aktif' : 'Nonaktif'}
                                    </span>
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <button
                                            onClick={() => handleEditMember(member)}
                                            className="action-btn edit-btn"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => toggleMemberStatus(member)}
                                            className={`action-btn ${member.status === 'active' ? 'ban-btn' : 'activate-btn'}`}
                                        >
                                            {member.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
                                        </button>
                                        <button
                                            onClick={() => handleDeleteMember(member)}
                                            className="action-btn delete-btn"
                                        >
                                            Hapus
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Pagination */}
                <div className="pagination">
                    <div className="pagination-info">
                        Halaman {currentPage} dari {totalPages}
                    </div>
                    <div className="pagination-controls">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="pagination-btn"
                        >
                            Sebelumnya
                        </button>
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i + 1}
                                onClick={() => setCurrentPage(i + 1)}
                                className={`pagination-btn ${currentPage === i + 1 ? 'active' : ''}`}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="pagination-btn"
                        >
                            Selanjutnya
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal for Add/Edit Member */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>{modalMode === 'add' ? 'Tambah Anggota Baru' : 'Edit Data Anggota'}</h3>
                            <button onClick={() => setShowModal(false)} className="close-btn">×</button>
                        </div>
                        
                        <form onSubmit={handleSubmitMember} className="member-form">
                            <div className="form-group">
                                <label>Nama Lengkap</label>
                                <input
                                    type="text"
                                    value={memberForm.name}
                                    onChange={(e) => setMemberForm({...memberForm, name: e.target.value})}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    value={memberForm.email}
                                    onChange={(e) => setMemberForm({...memberForm, email: e.target.value})}
                                    required
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>NISN</label>
                                    <input
                                        type="text"
                                        value={memberForm.nisn}
                                        onChange={(e) => setMemberForm({...memberForm, nisn: e.target.value})}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>No. Telepon</label>
                                    <input
                                        type="tel"
                                        value={memberForm.phone}
                                        onChange={(e) => setMemberForm({...memberForm, phone: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Kelas</label>
                                    <select
                                        value={memberForm.class}
                                        onChange={(e) => setMemberForm({...memberForm, class: e.target.value})}
                                        required
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
                                        value={memberForm.jurusan}
                                        onChange={(e) => setMemberForm({...memberForm, jurusan: e.target.value})}
                                        required
                                    >
                                        <option value="">Pilih Jurusan</option>
                                        <option value="IPA">IPA</option>
                                        <option value="IPS">IPS</option>
                                        <option value="Bahasa">Bahasa</option>
                                        <option value="TKJ">TKJ</option>
                                        <option value="RPL">RPL</option>
                                        <option value="MM">Multimedia</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Alamat</label>
                                <textarea
                                    value={memberForm.address}
                                    onChange={(e) => setMemberForm({...memberForm, address: e.target.value})}
                                    rows={3}
                                />
                            </div>

                            <div className="form-group">
                                <label>Status</label>
                                <select
                                    value={memberForm.status}
                                    onChange={(e) => setMemberForm({...memberForm, status: e.target.value})}
                                >
                                    <option value="active">Aktif</option>
                                    <option value="inactive">Nonaktif</option>
                                </select>
                            </div>

                            <div className="form-actions">
                                <button type="button" onClick={() => setShowModal(false)} className="cancel-btn">
                                    Batal
                                </button>
                                <button type="submit" className="submit-btn">
                                    {modalMode === 'add' ? 'Tambah Anggota' : 'Simpan Perubahan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminMemberManagement;
