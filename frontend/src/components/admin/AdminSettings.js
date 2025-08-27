import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/AdminSettings.css';

const AdminSettings = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [settings, setSettings] = useState({
        siteName: 'Library System USK 2023',
        maxBooksPerUser: 3,
        borrowDays: 7,
        fineDayRate: 1000,
        allowRegistration: true,
        maintenanceMode: false
    });

    const [backupData, setBackupData] = useState({
        lastBackup: null,
        backupSize: null
    });

    const [statistics, setStatistics] = useState({
        totalUsers: 0,
        totalBooks: 0,
        totalBorrowings: 0,
        totalCategories: 0,
        totalPublishers: 0,
        diskUsage: '0 MB'
    });

    useEffect(() => {
        fetchSettings();
        fetchStatistics();
        fetchBackupInfo();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/admin/settings', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (response.data && response.data.success) {
                setSettings(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        }
    };

    const fetchStatistics = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/admin/statistics', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (response.data && response.data.success) {
                setStatistics(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching statistics:', error);
        }
    };

    const fetchBackupInfo = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/admin/backup/info', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (response.data && response.data.success) {
                setBackupData(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching backup info:', error);
        }
    };

    const handleSettingChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings({
            ...settings,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSaveSettings = async () => {
        try {
            setLoading(true);
            await axios.put('http://127.0.0.1:8000/api/admin/settings', settings, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            alert('Pengaturan berhasil disimpan!');
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('Gagal menyimpan pengaturan.');
        } finally {
            setLoading(false);
        }
    };

    const handleBackupDatabase = async () => {
        if (window.confirm('Apakah Anda yakin ingin membuat backup database?')) {
            try {
                setLoading(true);
                const response = await axios.post('http://127.0.0.1:8000/api/admin/backup', {}, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                
                if (response.data && response.data.success) {
                    alert('Backup database berhasil dibuat!');
                    fetchBackupInfo();
                }
            } catch (error) {
                console.error('Error creating backup:', error);
                alert('Gagal membuat backup database.');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleClearCache = async () => {
        if (window.confirm('Apakah Anda yakin ingin membersihkan cache aplikasi?')) {
            try {
                setLoading(true);
                await axios.post('http://127.0.0.1:8000/api/admin/cache/clear', {}, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                alert('Cache aplikasi berhasil dibersihkan!');
            } catch (error) {
                console.error('Error clearing cache:', error);
                alert('Gagal membersihkan cache.');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleResetSystem = async () => {
        const confirmation = window.prompt(
            'PERINGATAN: Ini akan menghapus semua data dan mengembalikan sistem ke pengaturan awal.\n\n' +
            'Ketik "RESET SYSTEM" untuk melanjutkan:'
        );
        
        if (confirmation === 'RESET SYSTEM') {
            try {
                setLoading(true);
                await axios.post('http://127.0.0.1:8000/api/admin/system/reset', {}, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                alert('Sistem berhasil direset!');
                logout(); // Logout user after reset
            } catch (error) {
                console.error('Error resetting system:', error);
                alert('Gagal mereset sistem.');
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="admin-settings">
            {/* Header */}
            <div className="page-header">
                <div className="header-content">
                    <div className="header-left">
                        <button className="back-btn" onClick={() => navigate('/admin/dashboard')}>
                            ← Kembali
                        </button>
                        <div className="header-text">
                            <h1>⚙️ Pengaturan Sistem</h1>
                            <p>Kelola konfigurasi dan pengaturan aplikasi</p>
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

            {/* System Statistics */}
            <div className="content-section">
                <div className="section-header">
                    <h2>📊 Statistik Sistem</h2>
                </div>
                
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">👥</div>
                        <div className="stat-info">
                            <div className="stat-number">{statistics.totalUsers}</div>
                            <div className="stat-label">Total Pengguna</div>
                        </div>
                    </div>
                    
                    <div className="stat-card">
                        <div className="stat-icon">📚</div>
                        <div className="stat-info">
                            <div className="stat-number">{statistics.totalBooks}</div>
                            <div className="stat-label">Total Buku</div>
                        </div>
                    </div>
                    
                    <div className="stat-card">
                        <div className="stat-icon">📋</div>
                        <div className="stat-info">
                            <div className="stat-number">{statistics.totalBorrowings}</div>
                            <div className="stat-label">Total Peminjaman</div>
                        </div>
                    </div>
                    
                    <div className="stat-card">
                        <div className="stat-icon">🏷️</div>
                        <div className="stat-info">
                            <div className="stat-number">{statistics.totalCategories}</div>
                            <div className="stat-label">Kategori Buku</div>
                        </div>
                    </div>
                    
                    <div className="stat-card">
                        <div className="stat-icon">🏢</div>
                        <div className="stat-info">
                            <div className="stat-number">{statistics.totalPublishers}</div>
                            <div className="stat-label">Penerbit</div>
                        </div>
                    </div>
                    
                    <div className="stat-card">
                        <div className="stat-icon">💾</div>
                        <div className="stat-info">
                            <div className="stat-number">{statistics.diskUsage}</div>
                            <div className="stat-label">Penggunaan Disk</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Application Settings */}
            <div className="content-section">
                <div className="section-header">
                    <h2>🔧 Pengaturan Aplikasi</h2>
                </div>
                
                <div className="settings-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label>Nama Aplikasi</label>
                            <input
                                type="text"
                                name="siteName"
                                value={settings.siteName}
                                onChange={handleSettingChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Maksimal Buku per User</label>
                            <input
                                type="number"
                                name="maxBooksPerUser"
                                value={settings.maxBooksPerUser}
                                onChange={handleSettingChange}
                                min="1"
                                max="10"
                            />
                        </div>
                    </div>
                    
                    <div className="form-row">
                        <div className="form-group">
                            <label>Durasi Peminjaman (hari)</label>
                            <input
                                type="number"
                                name="borrowDays"
                                value={settings.borrowDays}
                                onChange={handleSettingChange}
                                min="1"
                                max="30"
                            />
                        </div>
                        <div className="form-group">
                            <label>Denda per Hari (Rp)</label>
                            <input
                                type="number"
                                name="fineDayRate"
                                value={settings.fineDayRate}
                                onChange={handleSettingChange}
                                min="0"
                                step="500"
                            />
                        </div>
                    </div>
                    
                    <div className="form-group checkbox-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                name="allowRegistration"
                                checked={settings.allowRegistration}
                                onChange={handleSettingChange}
                            />
                            <span className="checkbox-text">Izinkan pendaftaran user baru</span>
                        </label>
                    </div>
                    
                    <div className="form-group checkbox-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                name="maintenanceMode"
                                checked={settings.maintenanceMode}
                                onChange={handleSettingChange}
                            />
                            <span className="checkbox-text">Mode Maintenance (hanya admin yang bisa akses)</span>
                        </label>
                    </div>
                    
                    <div className="form-actions">
                        <button 
                            className="save-btn"
                            onClick={handleSaveSettings}
                            disabled={loading}
                        >
                            {loading ? 'Menyimpan...' : '💾 Simpan Pengaturan'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Database & System Management */}
            <div className="content-section">
                <div className="section-header">
                    <h2>🗄️ Manajemen Database</h2>
                </div>
                
                <div className="database-section">
                    <div className="backup-info">
                        <h3>Backup Terakhir</h3>
                        <p>
                            {backupData.lastBackup 
                                ? `${new Date(backupData.lastBackup).toLocaleString('id-ID')} (${backupData.backupSize})`
                                : 'Belum pernah backup'
                            }
                        </p>
                    </div>
                    
                    <div className="database-actions">
                        <button 
                            className="backup-btn"
                            onClick={handleBackupDatabase}
                            disabled={loading}
                        >
                            {loading ? 'Memproses...' : '💾 Backup Database'}
                        </button>
                        
                        <button 
                            className="cache-btn"
                            onClick={handleClearCache}
                            disabled={loading}
                        >
                            {loading ? 'Memproses...' : '🗑️ Clear Cache'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="content-section danger-zone">
                <div className="section-header danger">
                    <h2>⚠️ Danger Zone</h2>
                    <p>Aksi-aksi berikut bersifat permanen dan tidak dapat dibatalkan!</p>
                </div>
                
                <div className="danger-actions">
                    <div className="danger-action">
                        <div className="danger-info">
                            <h3>Reset Sistem</h3>
                            <p>Menghapus semua data dan mengembalikan ke pengaturan awal</p>
                        </div>
                        <button 
                            className="danger-btn"
                            onClick={handleResetSystem}
                            disabled={loading}
                        >
                            {loading ? 'Memproses...' : '🔄 Reset Sistem'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
