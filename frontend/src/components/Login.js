import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import '../styles/Auth.css';

export default function Login() {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

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

        try {
            const result = await login(formData);
            
            if (result.success) {
                // Redirect langsung ke dashboard berdasarkan role
                navigate(result.dashboardUrl, { replace: true });
            } else {
                setError(result.message);
            }
        } catch (error) {
            setError('Login gagal. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>📚 Library System</h1>
                    <h2>Masuk ke Sistem</h2>
                </div>
                
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label>Username</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="Masukkan username"
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Masukkan password"
                            required
                        />
                    </div>
                    
                    {error && <div className="error-message">{error}</div>}
                    
                    <button type="submit" disabled={loading} className="auth-btn">
                        {loading ? 'Memproses...' : 'Masuk'}
                    </button>
                    
                    <div className="auth-link">
                        Belum punya akun? <button type="button" onClick={() => navigate('/register')}>Daftar di sini</button>
                    </div>
                </form>
            </div>
            
            {/* NOTE: Add background image here - library_bg.jpg */}
            <div className="auth-bg">
                {/* Background image placeholder */}
            </div>
        </div>
    );
}
