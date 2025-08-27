import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Profile.css';

const UserProfile = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [profileData, setProfileData] = useState({
        fullname: '',
        email: '',
        phone_number: '',
        class: '',
        jurusan: ''
    });

    const [passwordData, setPasswordData] = useState({
        current_password: '',
        password: '',
        password_confirmation: ''
    });

    const [showPasswordChange, setShowPasswordChange] = useState(false);

    // Load profile data on component mount
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`http://127.0.0.1:8000/api/profile`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                
                if (response.data.success) {
                    const userData = response.data.data;
                    setProfileData({
                        fullname: userData.fullname || '',
                        email: userData.email || '',
                        phone_number: userData.phone_number || '',
                        class: userData.class || '',
                        jurusan: userData.jurusan || ''
                    });
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
            }
        };

        if (user) {
            fetchProfile();
        }
    }, [user]);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(`http://127.0.0.1:8000/api/profile`, profileData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            if (response.data.success) {
                alert('Profil berhasil diperbarui!');
                setIsEditing(false);
                
                // Update local storage
                const updatedUser = response.data.data;
                localStorage.setItem('user', JSON.stringify(updatedUser));
                window.location.reload(); // Refresh to update context
            } else {
                alert(response.data.message || 'Gagal memperbarui profil.');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            if (error.response?.data?.message) {
                alert(error.response.data.message);
            } else {
                alert('Gagal memperbarui profil.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        
        if (passwordData.password !== passwordData.password_confirmation) {
            alert('Password baru dan konfirmasi password tidak cocok!');
            return;
        }

        setLoading(true);
        
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`http://127.0.0.1:8000/api/change-password`, {
                current_password: passwordData.current_password,
                password: passwordData.password,
                password_confirmation: passwordData.password_confirmation
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            if (response.data.success) {
                alert('Password berhasil diubah!');
                setShowPasswordChange(false);
                setPasswordData({
                    current_password: '',
                    password: '',
                    password_confirmation: ''
                });
            } else {
                alert(response.data.message || 'Gagal mengubah password.');
            }
        } catch (error) {
            console.error('Error changing password:', error);
            if (error.response?.data?.message) {
                alert(error.response.data.message);
            } else {
                alert('Gagal mengubah password. Periksa password lama Anda.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setProfileData({
            ...profileData,
            [e.target.name]: e.target.value
        });
    };

    const handlePasswordInputChange = (e) => {
        setPasswordData({
            ...passwordData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="profile-container">
            <div className="profile-header">
                <div className="header-left">
                    <h1>👤 Profil Saya</h1>
                    <p>Kelola informasi akun Anda</p>
                </div>
                <div className="header-right">
                    <span className="user-info">
                        {user?.fullname} ({user?.user_code})
                    </span>
                    <button 
                        className="back-btn"
                        onClick={() => navigate('/dashboard')}
                    >
                        ← Kembali ke Dashboard
                    </button>
                </div>
            </div>

            <div className="profile-content">
                <div className="profile-card">
                    <div className="profile-avatar">
                        <div className="avatar-circle">
                            {user?.fullname?.charAt(0).toUpperCase()}
                        </div>
                        <h2>{user?.fullname}</h2>
                        <p className="user-role">{user?.role === 'admin' ? 'Administrator' : 'Anggota Perpustakaan'}</p>
                        <p className="user-code">Kode Pengguna: {user?.user_code}</p>
                    </div>

                    <div className="profile-tabs">
                        <button 
                            className={`tab-btn ${!showPasswordChange ? 'active' : ''}`}
                            onClick={() => setShowPasswordChange(false)}
                        >
                            📝 Informasi Profil
                        </button>
                        <button 
                            className={`tab-btn ${showPasswordChange ? 'active' : ''}`}
                            onClick={() => setShowPasswordChange(true)}
                        >
                            🔒 Ubah Password
                        </button>
                    </div>

                    {!showPasswordChange ? (
                        <div className="profile-form-section">
                            <div className="section-header">
                                <h3>Informasi Personal</h3>
                                <button 
                                    className={`edit-btn ${isEditing ? 'active' : ''}`}
                                    onClick={() => setIsEditing(!isEditing)}
                                >
                                    {isEditing ? '❌ Batal' : '✏️ Edit Profil'}
                                </button>
                            </div>

                            <form onSubmit={handleProfileUpdate} className="profile-form">
                                <div className="form-group">
                                    <label>Nama Lengkap</label>
                                    <input
                                        type="text"
                                        name="fullname"
                                        value={profileData.fullname}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={profileData.email}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Nomor Telepon</label>
                                    <input
                                        type="tel"
                                        name="phone_number"
                                        value={profileData.phone_number}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        placeholder="Contoh: 08123456789"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Kelas</label>
                                    <select
                                        name="class"
                                        value={profileData.class}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
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
                                        value={profileData.jurusan}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
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

                                <div className="form-group readonly">
                                    <label>Kode Pengguna</label>
                                    <input
                                        type="text"
                                        value={user?.user_code}
                                        disabled
                                    />
                                </div>

                                {user?.student_id && (
                                    <div className="form-group readonly">
                                        <label>NIM/ID Mahasiswa</label>
                                        <input
                                            type="text"
                                            value={user?.student_id}
                                            disabled
                                        />
                                    </div>
                                )}

                                <div className="form-group readonly">
                                    <label>Role</label>
                                    <input
                                        type="text"
                                        value={user?.role === 'admin' ? 'Administrator' : user?.role === 'librarian' ? 'Pustakawan' : 'Anggota'}
                                        disabled
                                    />
                                </div>

                                {isEditing && (
                                    <div className="form-actions">
                                        <button 
                                            type="button" 
                                            className="cancel-btn"
                                            onClick={() => {
                                                setIsEditing(false);
                                                setProfileData({
                                                    fullname: user?.fullname || '',
                                                    email: user?.email || '',
                                                    phone_number: user?.phone_number || '',
                                                    address: user?.address || ''
                                                });
                                            }}
                                        >
                                            Batal
                                        </button>
                                        <button 
                                            type="submit" 
                                            className="submit-btn"
                                            disabled={loading}
                                        >
                                            {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                                        </button>
                                    </div>
                                )}
                            </form>
                        </div>
                    ) : (
                        <div className="password-form-section">
                            <div className="section-header">
                                <h3>Ubah Password</h3>
                            </div>

                            <form onSubmit={handlePasswordChange} className="password-form">
                                <div className="form-group">
                                    <label>Password Saat Ini</label>
                                    <input
                                        type="password"
                                        name="current_password"
                                        value={passwordData.current_password}
                                        onChange={handlePasswordInputChange}
                                        required
                                        placeholder="Masukkan password saat ini"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Password Baru</label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={passwordData.password}
                                        onChange={handlePasswordInputChange}
                                        required
                                        placeholder="Masukkan password baru"
                                        minLength="6"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Konfirmasi Password Baru</label>
                                    <input
                                        type="password"
                                        name="password_confirmation"
                                        value={passwordData.password_confirmation}
                                        onChange={handlePasswordInputChange}
                                        required
                                        placeholder="Konfirmasi password baru"
                                        minLength="6"
                                    />
                                </div>

                                <div className="password-requirements">
                                    <p>Persyaratan password:</p>
                                    <ul>
                                        <li>Minimal 6 karakter</li>
                                        <li>Disarankan menggunakan kombinasi huruf dan angka</li>
                                    </ul>
                                </div>

                                <div className="form-actions">
                                    <button 
                                        type="button" 
                                        className="cancel-btn"
                                        onClick={() => {
                                            setPasswordData({
                                                current_password: '',
                                                new_password: '',
                                                confirm_password: ''
                                            });
                                        }}
                                    >
                                        Reset Form
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="submit-btn"
                                        disabled={loading}
                                    >
                                        {loading ? 'Mengubah...' : 'Ubah Password'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="profile-actions">
                        <button 
                            className="logout-btn"
                            onClick={() => {
                                if (window.confirm('Apakah Anda yakin ingin keluar?')) {
                                    logout();
                                    navigate('/login');
                                }
                            }}
                        >
                            🚪 Keluar dari Akun
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;