import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/AdminUserManagement.css';

const AdminUserManagement = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [showUserModal, setShowUserModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const usersPerPage = 10;

    const [userForm, setUserForm] = useState({
        fullname: '',
        username: '',
        email: '',
        student_id: '',
        class: '',
        jurusan: '',
        phone_number: '',
        role: 'siswa',
        verified: 'verified'
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/admin/users', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (response.data && response.data.success) {
                setUsers(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setUserForm({
            ...userForm,
            [e.target.name]: e.target.value
        });
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://127.0.0.1:8000/api/admin/users', userForm, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            alert('User berhasil ditambahkan!');
            setShowUserModal(false);
            resetForm();
            fetchUsers();
        } catch (error) {
            console.error('Error adding user:', error);
            alert('Gagal menambahkan user.');
        }
    };

    const handleEditUser = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`http://127.0.0.1:8000/api/admin/users/${editingUser.id}`, userForm, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            alert('User berhasil diperbarui!');
            setShowUserModal(false);
            setEditingUser(null);
            resetForm();
            fetchUsers();
        } catch (error) {
            console.error('Error updating user:', error);
            alert('Gagal memperbarui user.');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus user ini?')) {
            try {
                await axios.delete(`http://127.0.0.1:8000/api/admin/users/${userId}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                alert('User berhasil dihapus!');
                fetchUsers();
            } catch (error) {
                console.error('Error deleting user:', error);
                alert('Gagal menghapus user.');
            }
        }
    };

    const handleEditClick = (userItem) => {
        setEditingUser(userItem);
        setUserForm({
            fullname: userItem.fullname,
            username: userItem.username,
            email: userItem.email,
            student_id: userItem.student_id,
            class: userItem.class,
            jurusan: userItem.jurusan,
            phone_number: userItem.phone_number,
            role: userItem.role,
            verified: userItem.verified
        });
        setShowUserModal(true);
    };

    const resetForm = () => {
        setUserForm({
            fullname: '',
            username: '',
            email: '',
            student_id: '',
            class: '',
            jurusan: '',
            phone_number: '',
            role: 'siswa',
            verified: 'verified'
        });
    };

    const filteredUsers = users.filter(userItem => {
        const matchesSearch = userItem.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             userItem.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             userItem.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === '' || userItem.role === roleFilter;
        const matchesStatus = statusFilter === '' || userItem.verified === statusFilter;
        
        return matchesSearch && matchesRole && matchesStatus;
    });

    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    return (
        <div className="admin-user-management">
            {/* Header */}
            <div className="page-header">
                <div className="header-content">
                    <div className="header-left">
                        <button className="back-btn" onClick={() => navigate('/admin/dashboard')}>
                            ← Kembali
                        </button>
                        <div className="header-text">
                            <h1>👥 Kelola User</h1>
                            <p>Manajemen pengguna sistem perpustakaan</p>
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

            {/* Filters and Search */}
            <div className="filters-section">
                <div className="search-group">
                    <input
                        type="text"
                        placeholder="Cari user berdasarkan nama, username, atau email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
                <div className="filter-group">
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="filter-select"
                    >
                        <option value="">Semua Role</option>
                        <option value="admin">Admin</option>
                        <option value="librarian">Librarian</option>
                        <option value="siswa">Siswa</option>
                    </select>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="filter-select"
                    >
                        <option value="">Semua Status</option>
                        <option value="verified">Verified</option>
                        <option value="pending">Pending</option>
                        <option value="suspended">Suspended</option>
                    </select>
                    <button 
                        className="add-btn"
                        onClick={() => {
                            setEditingUser(null);
                            resetForm();
                            setShowUserModal(true);
                        }}
                    >
                        + Tambah User
                    </button>
                </div>
            </div>

            {/* Users Table */}
            <div className="content-section">
                <div className="users-header">
                    <h3>Daftar User ({filteredUsers.length})</h3>
                </div>

                {loading ? (
                    <div className="loading">Memuat data user...</div>
                ) : (
                    <div className="users-table-container">
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nama Lengkap</th>
                                    <th>Username</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th>Kelas/Jurusan</th>
                                    <th>Bergabung</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentUsers.length > 0 ? (
                                    currentUsers.map((userItem) => (
                                        <tr key={userItem.id}>
                                            <td>{userItem.user_code}</td>
                                            <td className="user-name">
                                                <div className="user-avatar">
                                                    {userItem.fullname?.charAt(0)?.toUpperCase()}
                                                </div>
                                                <div className="user-details">
                                                    <span className="name">{userItem.fullname}</span>
                                                    <span className="student-id">{userItem.student_id}</span>
                                                </div>
                                            </td>
                                            <td>{userItem.username}</td>
                                            <td>{userItem.email}</td>
                                            <td>
                                                <span className={`role-badge ${userItem.role}`}>
                                                    {userItem.role.toUpperCase()}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`status-badge ${userItem.verified}`}>
                                                    {userItem.verified}
                                                </span>
                                            </td>
                                            <td>{userItem.class} {userItem.jurusan}</td>
                                            <td>{new Date(userItem.join_date).toLocaleDateString('id-ID')}</td>
                                            <td className="actions">
                                                <button
                                                    className="edit-btn"
                                                    onClick={() => handleEditClick(userItem)}
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    className="delete-btn"
                                                    onClick={() => handleDeleteUser(userItem.id)}
                                                >
                                                    🗑️
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="9" className="no-data">
                                            Tidak ada user yang ditemukan
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

            {/* User Modal */}
            {showUserModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h2>{editingUser ? 'Edit User' : 'Tambah User Baru'}</h2>
                            <button 
                                className="close-btn"
                                onClick={() => setShowUserModal(false)}
                            >
                                ✖️
                            </button>
                        </div>
                        <form onSubmit={editingUser ? handleEditUser : handleAddUser}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Nama Lengkap</label>
                                    <input
                                        type="text"
                                        name="fullname"
                                        value={userForm.fullname}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Username</label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={userForm.username}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={userForm.email}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Student ID</label>
                                    <input
                                        type="text"
                                        name="student_id"
                                        value={userForm.student_id}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Kelas</label>
                                    <select
                                        name="class"
                                        value={userForm.class}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="">Pilih Kelas</option>
                                        <option value="X">X</option>
                                        <option value="XI">XI</option>
                                        <option value="XII">XII</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Jurusan</label>
                                    <select
                                        name="jurusan"
                                        value={userForm.jurusan}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="">Pilih Jurusan</option>
                                        <option value="AKL 1">AKL 1</option>
                                        <option value="AKL 2">AKL 2</option>
                                        <option value="BD">BD</option>
                                        <option value="BR">BR</option>
                                        <option value="ML">ML</option>
                                        <option value="MP">MP</option>
                                        <option value="RPL">RPL</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Role</label>
                                    <select
                                        name="role"
                                        value={userForm.role}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="siswa">Siswa</option>
                                        <option value="librarian">Librarian</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Status</label>
                                    <select
                                        name="verified"
                                        value={userForm.verified}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="verified">Verified</option>
                                        <option value="pending">Pending</option>
                                        <option value="suspended">Suspended</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div className="form-group">
                                <label>Nomor Telepon</label>
                                <input
                                    type="text"
                                    name="phone_number"
                                    value={userForm.phone_number}
                                    onChange={handleInputChange}
                                />
                            </div>
                            
                            <div className="modal-footer">
                                <button type="button" className="cancel-btn" onClick={() => setShowUserModal(false)}>
                                    Batal
                                </button>
                                <button type="submit" className="submit-btn">
                                    {editingUser ? 'Perbarui' : 'Tambah'} User
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUserManagement;
