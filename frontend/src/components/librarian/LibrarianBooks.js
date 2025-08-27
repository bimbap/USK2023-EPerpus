import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/LibrarianBooks.css';

const LibrarianBooks = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [books, setBooks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [publishers, setPublishers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('add');
    const [selectedBook, setSelectedBook] = useState(null);
    
    // Search and filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterPublisher, setFilterPublisher] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    
    // Form states
    const [formData, setFormData] = useState({
        title: '',
        author: '',
        isbn: '',
        category_id: '',
        publisher_id: '',
        publication_year: '',
        pages: '',
        stock_quantity: '',
        description: ''
    });

    useEffect(() => {
        fetchBooks();
        fetchCategories();
        fetchPublishers();
    }, []);

    const fetchBooks = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/books', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (response.data && response.data.success) {
                setBooks(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching books:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/categories', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (response.data && response.data.success) {
                setCategories(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchPublishers = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/publishers', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (response.data && response.data.success) {
                setPublishers(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching publishers:', error);
        }
    };

    // Filter and search logic
    const filteredBooks = books.filter(book => {
        const matchesSearch = 
            book.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            book.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            book.isbn?.toLowerCase().includes(searchTerm.toLowerCase());
            
        const matchesCategory = !filterCategory || book.category_id?.toString() === filterCategory;
        const matchesPublisher = !filterPublisher || book.publisher_id?.toString() === filterPublisher;
        const matchesStatus = !filterStatus || 
            (filterStatus === 'available' && book.stock_quantity > 0) ||
            (filterStatus === 'out_of_stock' && book.stock_quantity === 0);
        
        return matchesSearch && matchesCategory && matchesPublisher && matchesStatus;
    });

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentBooks = filteredBooks.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const openModal = (type, book = null) => {
        setModalType(type);
        setSelectedBook(book);
        
        if (type === 'edit' && book) {
            setFormData({
                title: book.title || '',
                author: book.author || '',
                isbn: book.isbn || '',
                category_id: book.category_id || '',
                publisher_id: book.publisher_id || '',
                publication_year: book.publication_year || '',
                pages: book.pages || '',
                stock_quantity: book.stock_quantity || '',
                description: book.description || ''
            });
        } else {
            setFormData({
                title: '',
                author: '',
                isbn: '',
                category_id: '',
                publisher_id: '',
                publication_year: '',
                pages: '',
                stock_quantity: '',
                description: ''
            });
        }
        
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedBook(null);
        setFormData({
            title: '',
            author: '',
            isbn: '',
            category_id: '',
            publisher_id: '',
            publication_year: '',
            pages: '',
            stock_quantity: '',
            description: ''
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            if (modalType === 'add') {
                await axios.post('http://127.0.0.1:8000/api/books', formData, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                alert('Buku berhasil ditambahkan!');
            } else if (modalType === 'edit') {
                await axios.put(`http://127.0.0.1:8000/api/books/${selectedBook.id}`, formData, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                alert('Buku berhasil diperbarui!');
            }
            
            fetchBooks();
            closeModal();
        } catch (error) {
            console.error('Error saving book:', error);
            alert('Gagal menyimpan buku.');
        }
    };

    const handleDelete = async (book) => {
        if (window.confirm(`Apakah Anda yakin ingin menghapus buku "${book.title}"?`)) {
            try {
                await axios.delete(`http://127.0.0.1:8000/api/books/${book.id}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                alert('Buku berhasil dihapus!');
                fetchBooks();
            } catch (error) {
                console.error('Error deleting book:', error);
                alert('Gagal menghapus buku.');
            }
        }
    };

    const getCategoryName = (categoryId) => {
        const category = categories.find(cat => cat.id === categoryId);
        return category ? category.name : 'Tidak Diketahui';
    };

    const getPublisherName = (publisherId) => {
        const publisher = publishers.find(pub => pub.id === publisherId);
        return publisher ? publisher.name : 'Tidak Diketahui';
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Memuat data buku...</p>
            </div>
        );
    }

    return (
        <div className="librarian-books">
            {/* Header */}
            <div className="page-header">
                <div className="header-content">
                    <div className="header-left">
                        <button className="back-btn" onClick={() => navigate('/librarian/dashboard')}>
                            ← Kembali
                        </button>
                        <div className="header-text">
                            <h1>📚 Manajemen Buku</h1>
                            <p>Kelola koleksi buku perpustakaan</p>
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

            {/* Controls */}
            <div className="controls-section">
                <div className="search-filter">
                    <div className="search-box">
                        <input
                            type="text"
                            placeholder="🔍 Cari judul, penulis, atau ISBN..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <div className="filters">
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                        >
                            <option value="">Semua Kategori</option>
                            {categories.map(category => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                        
                        <select
                            value={filterPublisher}
                            onChange={(e) => setFilterPublisher(e.target.value)}
                        >
                            <option value="">Semua Penerbit</option>
                            {publishers.map(publisher => (
                                <option key={publisher.id} value={publisher.id}>
                                    {publisher.name}
                                </option>
                            ))}
                        </select>
                        
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="">Semua Status</option>
                            <option value="available">Tersedia</option>
                            <option value="out_of_stock">Habis</option>
                        </select>
                    </div>
                </div>
                
                <div className="action-buttons">
                    <button className="add-btn" onClick={() => openModal('add')}>
                        ➕ Tambah Buku
                    </button>
                </div>
            </div>

            {/* Statistics */}
            <div className="stats-row">
                <div className="stat-item">
                    <div className="stat-number">{books.length}</div>
                    <div className="stat-label">Total Buku</div>
                </div>
                <div className="stat-item">
                    <div className="stat-number">{books.filter(book => book.stock_quantity > 0).length}</div>
                    <div className="stat-label">Buku Tersedia</div>
                </div>
                <div className="stat-item">
                    <div className="stat-number">{filteredBooks.length}</div>
                    <div className="stat-label">Hasil Pencarian</div>
                </div>
            </div>

            {/* Books Table */}
            <div className="table-section">
                <div className="table-container">
                    <table className="books-table">
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>Judul</th>
                                <th>Penulis</th>
                                <th>ISBN</th>
                                <th>Kategori</th>
                                <th>Penerbit</th>
                                <th>Tahun</th>
                                <th>Stok</th>
                                <th>Status</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentBooks.length === 0 ? (
                                <tr>
                                    <td colSpan="10" className="no-data">
                                        {searchTerm || filterCategory || filterPublisher || filterStatus 
                                            ? 'Tidak ada buku yang sesuai dengan filter.' 
                                            : 'Belum ada data buku.'
                                        }
                                    </td>
                                </tr>
                            ) : (
                                currentBooks.map((book, index) => (
                                    <tr key={book.id}>
                                        <td>{indexOfFirstItem + index + 1}</td>
                                        <td className="book-title">
                                            <div>
                                                <strong>{book.title}</strong>
                                                {book.description && (
                                                    <p className="book-desc">{book.description.substring(0, 50)}...</p>
                                                )}
                                            </div>
                                        </td>
                                        <td>{book.author}</td>
                                        <td className="isbn">{book.isbn}</td>
                                        <td>{getCategoryName(book.category_id)}</td>
                                        <td>{getPublisherName(book.publisher_id)}</td>
                                        <td>{book.publication_year}</td>
                                        <td className="stock-quantity">
                                            <span className={`stock-badge ${book.stock_quantity > 0 ? 'available' : 'empty'}`}>
                                                {book.stock_quantity}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${book.stock_quantity > 0 ? 'available' : 'empty'}`}>
                                                {book.stock_quantity > 0 ? 'Tersedia' : 'Habis'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button 
                                                    className="edit-btn"
                                                    onClick={() => openModal('edit', book)}
                                                >
                                                    ✏️
                                                </button>
                                                <button 
                                                    className="delete-btn"
                                                    onClick={() => handleDelete(book)}
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
                            <h2>{modalType === 'add' ? '➕ Tambah Buku Baru' : '✏️ Edit Buku'}</h2>
                            <button className="close-btn" onClick={closeModal}>✖</button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="book-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Judul Buku *</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Penulis *</label>
                                    <input
                                        type="text"
                                        name="author"
                                        value={formData.author}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <label>ISBN</label>
                                    <input
                                        type="text"
                                        name="isbn"
                                        value={formData.isbn}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Kategori *</label>
                                    <select
                                        name="category_id"
                                        value={formData.category_id}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="">Pilih Kategori</option>
                                        {categories.map(category => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Penerbit *</label>
                                    <select
                                        name="publisher_id"
                                        value={formData.publisher_id}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="">Pilih Penerbit</option>
                                        {publishers.map(publisher => (
                                            <option key={publisher.id} value={publisher.id}>
                                                {publisher.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Tahun Terbit</label>
                                    <input
                                        type="number"
                                        name="publication_year"
                                        value={formData.publication_year}
                                        onChange={handleInputChange}
                                        min="1900"
                                        max={new Date().getFullYear()}
                                    />
                                </div>
                            </div>
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Jumlah Halaman</label>
                                    <input
                                        type="number"
                                        name="pages"
                                        value={formData.pages}
                                        onChange={handleInputChange}
                                        min="1"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Jumlah Stok *</label>
                                    <input
                                        type="number"
                                        name="stock_quantity"
                                        value={formData.stock_quantity}
                                        onChange={handleInputChange}
                                        min="0"
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div className="form-group">
                                <label>Deskripsi</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows="3"
                                ></textarea>
                            </div>
                            
                            <div className="form-actions">
                                <button type="button" className="cancel-btn" onClick={closeModal}>
                                    Batal
                                </button>
                                <button type="submit" className="submit-btn">
                                    {modalType === 'add' ? '➕ Tambah Buku' : '💾 Simpan Perubahan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LibrarianBooks;
