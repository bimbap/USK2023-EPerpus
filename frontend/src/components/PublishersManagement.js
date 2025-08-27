import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/AdminPages.css';

export default function PublishersManagement() {
  const [publishers, setPublishers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPublisher, setEditingPublisher] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    email: '',
    phone: ''
  });

  const navigate = useNavigate();

  // Optional: set baseURL once (ubah jika bukan itu)
  axios.defaults.baseURL = 'http://127.0.0.1:8000';

  useEffect(() => {
    const token = localStorage.getItem('token');
    let userData;
    try {
      userData = JSON.parse(localStorage.getItem('user'));
    } catch (err) {
      userData = null;
    }

    if (!token || !userData || (userData.role !== 'admin' && userData.role !== 'librarian')) {
      // kalau tidak auth => redirect ke login
      navigate('/login');
      return;
    }

    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    fetchPublishers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const fetchPublishers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get('/api/publishers');
      // asumsi response.data.success dan data di data
      if (response?.data?.success) {
        setPublishers(response.data.data || []);
      } else {
        // fallback: kalau API mengembalikan list langsung
        setPublishers(response?.data?.data ?? response?.data ?? []);
      }
    } catch (err) {
      console.error('Error fetching publishers:', err);
      // handle unauthorized -> redirect login
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
        return;
      }
      setError('Gagal mengambil data penerbit');
      setPublishers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // simple validation
    if (!formData.name.trim()) {
      setError('Nama penerbit harus diisi');
      return;
    }

    try {
      setSaving(true);
      setError('');
      let response;
      if (editingPublisher) {
        response = await axios.put(`/api/publishers/${editingPublisher.id}`, formData);
      } else {
        response = await axios.post('/api/publishers', formData);
      }

      if (response?.data?.success) {
        await fetchPublishers();
        handleCloseModal();
      } else {
        // jika API tidak mengembalikan success flag, tampilkan msg dari API bila ada
        setError(response?.data?.message || 'Terjadi kesalahan saat menyimpan data');
      }
    } catch (err) {
      console.error('Error saving publisher:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
        return;
      }
      setError(editingPublisher ? 'Gagal mengupdate penerbit' : 'Gagal menambah penerbit');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (publisher) => {
    setEditingPublisher(publisher);
    setFormData({
      name: publisher.name || '',
      address: publisher.address || '',
      email: publisher.email || '',
      phone: publisher.phone || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus penerbit ini?')) return;

    try {
      setError('');
      const response = await axios.delete(`/api/publishers/${id}`);
      if (response?.data?.success) {
        await fetchPublishers();
      } else {
        setError(response?.data?.message || 'Gagal menghapus penerbit');
      }
    } catch (err) {
      console.error('Error deleting publisher:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
        return;
      }
      setError('Gagal menghapus penerbit');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPublisher(null);
    setFormData({ name: '', address: '', email: '', phone: '' });
    setError('');
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="admin-page-container">
      <div className="page-header">
        <div className="header-content">
          <h1>🏢 Manajemen Penerbit</h1>
          <p>Kelola data penerbit buku</p>
        </div>
        <button
          className="btn-back"
          onClick={() => navigate('/admin/dashboard')}
        >
          ← Kembali
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="content-card">
        <div className="card-header">
          <h3>Daftar Penerbit ({publishers.length})</h3>
          <button
            className="btn-primary"
            onClick={() => { setShowModal(true); setEditingPublisher(null); setError(''); }}
          >
            + Tambah Penerbit
          </button>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Nama Penerbit</th>
                <th>Alamat</th>
                <th>Email</th>
                <th>Telepon</th>
                <th>Jumlah Buku</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {publishers.length > 0 ? publishers.map((publisher, index) => (
                <tr key={publisher.id ?? publisher._id ?? index}>
                  <td>{index + 1}</td>
                  <td className="publisher-name">{publisher.name}</td>
                  <td>{publisher.address || '-'}</td>
                  <td>{publisher.email || '-'}</td>
                  <td>{publisher.phone || '-'}</td>
                  <td>
                    <span className="book-count">
                      {publisher.books_count ?? publisher.book_count ?? 0} buku
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-edit"
                        onClick={() => handleEdit(publisher)}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(publisher.id ?? publisher._id)}
                      >
                        🗑️ Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="7" className="no-data">
                    Belum ada penerbit. Tambahkan penerbit pertama!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingPublisher ? 'Edit Penerbit' : 'Tambah Penerbit'}</h3>
              <button
                className="modal-close"
                onClick={handleCloseModal}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nama Penerbit *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Contoh: Gramedia, Erlangga"
                  required
                />
              </div>

              <div className="form-group">
                <label>Alamat</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Alamat lengkap penerbit"
                  rows={3}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="email@penerbit.com"
                  />
                </div>

                <div className="form-group">
                  <label>Telepon</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="021-12345678"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn-secondary"
                  disabled={saving}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={saving}
                >
                  {saving ? (editingPublisher ? 'Updating...' : 'Saving...') : (editingPublisher ? 'Update' : 'Simpan')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
