import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/UserManagement.css';

export default function UsersManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingUser, setEditingUser] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = JSON.parse(localStorage.getItem('user'));
        
        if (!token || !userData || (userData.role !== 'admin' && userData.role !== 'librarian')) {
            navigate('/login');
            return;
        }
        
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        fetchUsers();
    }, [navigate]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:8000/api/users');
            if (response.data.success) {
                setUsers(response.data.data);
            }
        } catch (error) {
            setError('Gagal mengambil data pengguna');
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditUser = (user) => {
        setEditingUser(user);
        setShowModal(true);
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put(`http://localhost:8000/api/users/${editingUser.id}`, editingUser);
            if (response.data.success) {
                setUsers(users.map(user => 
                    user.id === editingUser.id ? response.data.data : user
                ));
                setShowModal(false);
                setEditingUser(null);
            }
        } catch (error) {
            setError('Gagal mengupdate pengguna');
            console.error('Error updating user:', error);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm('Yakin ingin menghapus pengguna ini?')) {
            try {
                const response = await axios.delete(`http://localhost:8000/api/users/${userId}`);
                if (response.data.success) {
                    setUsers(users.filter(user => user.id !== userId));
                }
            } catch (error) {
                setError('Gagal menghapus pengguna');
                console.error('Error deleting user:', error);
            }
        }
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'admin': return '#e74c3c';
            case 'librarian': return '#f39c12';
            case 'siswa': return '#3498db';
            default: return '#95a5a6';
        }
    };

    const getVerifiedColor = (verified) => {
        switch (verified) {
            case 'verified': return '#27ae60';
            case 'pending': return '#f39c12';
            case 'rejected': return '#e74c3c';
            default: return '#95a5a6';
        }
    };

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div className="user-management-container">
            <div className="page-header">
                <h1>👥 Manajemen Pengguna</h1>
                <p>Kelola data pengguna sistem perpustakaan</p>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="users-table-container">
                <div className="table-header">
                    <h3>Daftar Pengguna ({users.length})</h3>
                    <button 
                        className="btn-primary"
                        onClick={() => navigate('/admin/dashboard')}
                    >
                        ← Kembali ke Dashboard
                    </button>
                </div>

                <div className="table-responsive">
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nama Lengkap</th>
                                <th>Username</th>
                                <th>Email</th>
                                <th>NIM/NIS</th>
                                <th>Kelas</th>
                                <th>Jurusan</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Bergabung</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td>{user.user_code}</td>
                                    <td>{user.fullname}</td>
                                    <td>{user.username}</td>
                                    <td>{user.email}</td>
                                    <td>{user.student_id}</td>
                                    <td>{user.class}</td>
                                    <td>{user.jurusan}</td>
                                    <td>
                                        <span 
                                            className="role-badge"
                                            style={{ backgroundColor: getRoleColor(user.role) }}
                                        >
                                            {user.role}
                                        </span>
                                    </td>
                                    <td>
                                        <span 
                                            className="status-badge"
                                            style={{ backgroundColor: getVerifiedColor(user.verified) }}
                                        >
                                            {user.verified}
                                        </span>
                                    </td>
                                    <td>{new Date(user.join_date).toLocaleDateString('id-ID')}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <button 
                                                className="btn-edit"
                                                onClick={() => handleEditUser(user)}
                                            >
                                                ✏️ Edit
                                            </button>
                                            <button 
                                                className="btn-delete"
                                                onClick={() => handleDeleteUser(user.id)}
                                            >
                                                🗑️ Hapus
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Modal */}
            {showModal && editingUser && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Edit Pengguna</h3>
                            <button 
                                className="modal-close"
                                onClick={() => setShowModal(false)}
                            >
                                ×
                            </button>
                        </div>
                        
                        <form onSubmit={handleUpdateUser}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Nama Lengkap</label>
                                    <input
                                        type="text"
                                        value={editingUser.fullname}
                                        onChange={(e) => setEditingUser({
                                            ...editingUser,
                                            fullname: e.target.value
                                        })}
                                        required
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label>Username</label>
                                    <input
                                        type="text"
                                        value={editingUser.username}
                                        onChange={(e) => setEditingUser({
                                            ...editingUser,
                                            username: e.target.value
                                        })}
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        value={editingUser.email}
                                        onChange={(e) => setEditingUser({
                                            ...editingUser,
                                            email: e.target.value
                                        })}
                                        required
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label>NIM/NIS</label>
                                    <input
                                        type="text"
                                        value={editingUser.student_id}
                                        onChange={(e) => setEditingUser({
                                            ...editingUser,
                                            student_id: e.target.value
                                        })}
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Kelas</label>
                                    <select
                                        value={editingUser.class}
                                        onChange={(e) => setEditingUser({
                                            ...editingUser,
                                            class: e.target.value
                                        })}
                                        required
                                    >
                                        <option value="X">X</option>
                                        <option value="XI">XI</option>
                                        <option value="XII">XII</option>
                                    </select>
                                </div>
                                
                                <div className="form-group">
                                    <label>Jurusan</label>
                                    <select
                                        value={editingUser.jurusan}
                                        onChange={(e) => setEditingUser({
                                            ...editingUser,
                                            jurusan: e.target.value
                                        })}
                                        required
                                    >
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
                                        value={editingUser.role}
                                        onChange={(e) => setEditingUser({
                                            ...editingUser,
                                            role: e.target.value
                                        })}
                                        required
                                    >
                                        <option value="siswa">Siswa</option>
                                        <option value="librarian">Pustakawan</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                
                                <div className="form-group">
                                    <label>Status</label>
                                    <select
                                        value={editingUser.verified}
                                        onChange={(e) => setEditingUser({
                                            ...editingUser,
                                            verified: e.target.value
                                        })}
                                        required
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="verified">Verified</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div className="modal-footer">
                                <button type="button" onClick={() => setShowModal(false)}>
                                    Batal
                                </button>
                                <button type="submit" className="btn-primary">
                                    Simpan Perubahan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
