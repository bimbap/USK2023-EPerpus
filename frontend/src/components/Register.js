import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import '../styles/Auth.css';

export default function Register() {
    const [formData, setFormData] = useState({
        fullname: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        student_id: '',
        class: '',
        jurusan: '',
        phone_number: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    // eslint-disable-next-line no-unused-vars
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();
    const { register } = useContext(AuthContext);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Validate password confirmation
        if (formData.password !== formData.confirmPassword) {
            setError('Password dan konfirmasi password tidak cocok!');
            setLoading(false);
            return;
        }

        // Remove confirmPassword from submission data and add password_confirmation
        const submitData = { 
            ...formData,
            password_confirmation: formData.confirmPassword
        };
        delete submitData.confirmPassword;

        try {
            const result = await register(submitData);
            
            if (result.success) {
                // Auto redirect ke dashboard setelah register berhasil
                navigate(result.dashboardUrl, { replace: true });
            } else {
                if (typeof result.message === 'object') {
                    // Handle validation errors
                    const errorMessages = Object.values(result.message).flat().join(', ');
                    setError(errorMessages);
                } else {
                    setError(result.message);
                }
            }
        } catch (error) {
            setError('Pendaftaran gagal. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card register-card">
                <div className="auth-header">
                    <h1>📚 Library System</h1>
                    <h2>Daftar Anggota Baru</h2>
                </div>
                
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label>Nama Lengkap</label>
                            <input
                                type="text"
                                name="fullname"
                                value={formData.fullname}
                                onChange={handleChange}
                                placeholder="Nama lengkap"
                                required
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>NIM/NIS</label>
                            <input
                                type="text"
                                name="student_id"
                                value={formData.student_id}
                                onChange={handleChange}
                                placeholder="Nomor induk"
                                required
                            />
                        </div>
                    </div>
                    
                    <div className="form-row">
                        <div className="form-group">
                            <label>Username</label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="Username"
                                required
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Email"
                                required
                            />
                        </div>
                    </div>
                    
                    <div className="form-row">
                        <div className="form-group">
                            <label>Kelas</label>
                            <select
                                name="class"
                                value={formData.class}
                                onChange={handleChange}
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
                                value={formData.jurusan}
                                onChange={handleChange}
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
                            <label>Password</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Password"
                                required
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>Konfirmasi Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Konfirmasi password"
                                required
                            />
                        </div>
                    </div>
                    
                    <div className="form-group">
                        <label>No. Telepon</label>
                        <input
                            type="tel"
                            name="phone_number"
                            value={formData.phone_number}
                            onChange={handleChange}
                            placeholder="Nomor telepon"
                            required
                        />
                    </div>
                    
                    {error && <div className="error-message">{error}</div>}
                    {success && <div className="success-message">{success}</div>}
                    
                    <button type="submit" disabled={loading} className="auth-btn">
                        {loading ? 'Memproses...' : 'Daftar'}
                    </button>
                    
                    <div className="auth-link">
                        Sudah punya akun? <button type="button" onClick={() => navigate('/login')}>Masuk di sini</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
