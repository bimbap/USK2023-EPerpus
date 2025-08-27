import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/UserPages.css';

export default function UserBooks() {
    const [books, setBooks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        fetchData();
    }, [navigate]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [booksRes, categoriesRes] = await Promise.all([
                axios.get('http://localhost:8000/api/books'),
                axios.get('http://localhost:8000/api/categories')
            ]);
            
            if (booksRes.data.success) {
                setBooks(booksRes.data.data);
            }
            if (categoriesRes.data.success) {
                setCategories(categoriesRes.data.data);
            }
        } catch (error) {
            setError('Gagal mengambil data buku');
            console.error('Error fetching books:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBorrowRequest = async (bookId) => {
        try {
            const response = await axios.post('http://localhost:8000/api/lendings', {
                book_id: bookId,
                loan_date: new Date().toISOString().split('T')[0]
            });
            
            if (response.data.success) {
                alert('Permintaan peminjaman berhasil disubmit!');
                fetchData(); // Refresh data
                setShowModal(false);
            }
        } catch (error) {
            setError('Gagal mengajukan peminjaman');
            console.error('Error requesting book:', error);
        }
    };

    const filteredBooks = books.filter(book => {
        const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            book.isbn.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === '' || book.category?.id === parseInt(selectedCategory);
        return matchesSearch && matchesCategory && book.stock > 0;
    });

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div className="user-page-container">
            <div className="page-header">
                <div className="header-content">
                    <h1>📚 Katalog Buku</h1>
                    <p>Temukan dan pinjam buku favorit Anda</p>
                </div>
                <button 
                    className="btn-back"
                    onClick={() => navigate('/user/dashboard')}
                >
                    ← Kembali
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="search-section">
                <div className="search-filters">
                    <div className="search-box">
                        <input
                            type="text"
                            placeholder="🔍 Cari judul, penulis, atau ISBN..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="category-filter">
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                            <option value="">Semua Kategori</option>
                            {categories.map(category => (
                                <option key={category.id} value={category.id}>
                                    {category.name || category.category_name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="results-info">
                    Ditemukan {filteredBooks.length} buku
                </div>
            </div>

            <div className="books-grid">
                {filteredBooks.map(book => (
                    <div key={book.id} className="book-card">
                        <div className="book-cover">
                            {book.cover_image ? (
                                <img src={book.cover_image} alt={book.title} />
                            ) : (
                                <div className="book-placeholder">📖</div>
                            )}
                        </div>
                        <div className="book-info">
                            <h3 className="book-title">{book.title}</h3>
                            <p className="book-author">oleh {book.author}</p>
                            <div className="book-details">
                                <span className="book-category">
                                    🏷️ {book.category?.name || book.category?.category_name || 'Umum'}
                                </span>
                                <span className="book-stock">
                                    📦 {book.stock} tersedia
                                </span>
                            </div>
                            <div className="book-meta">
                                <small>ISBN: {book.isbn}</small>
                                <small>Penerbit: {book.publisher?.name || book.publisher?.publisher_name}</small>
                            </div>
                            <div className="book-actions">
                                <button 
                                    className="btn-detail"
                                    onClick={() => {
                                        setSelectedBook(book);
                                        setShowModal(true);
                                    }}
                                >
                                    👁️ Detail
                                </button>
                                <button 
                                    className="btn-borrow"
                                    onClick={() => handleBorrowRequest(book.id)}
                                    disabled={book.stock === 0}
                                >
                                    📚 Pinjam
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                
                {filteredBooks.length === 0 && (
                    <div className="no-books">
                        <div className="no-books-icon">📚</div>
                        <h3>Tidak ada buku ditemukan</h3>
                        <p>Coba ubah kata kunci pencarian atau filter kategori</p>
                    </div>
                )}
            </div>

            {/* Modal Detail Buku */}
            {showModal && selectedBook && (
                <div className="modal-overlay">
                    <div className="modal-content book-detail-modal">
                        <div className="modal-header">
                            <h3>Detail Buku</h3>
                            <button 
                                className="modal-close"
                                onClick={() => setShowModal(false)}
                            >
                                ×
                            </button>
                        </div>
                        
                        <div className="book-detail-content">
                            <div className="book-detail-cover">
                                {selectedBook.cover_image ? (
                                    <img src={selectedBook.cover_image} alt={selectedBook.title} />
                                ) : (
                                    <div className="book-placeholder large">📖</div>
                                )}
                            </div>
                            
                            <div className="book-detail-info">
                                <h2>{selectedBook.title}</h2>
                                <p className="author"><strong>Penulis:</strong> {selectedBook.author}</p>
                                
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <strong>ISBN:</strong> {selectedBook.isbn}
                                    </div>
                                    <div className="detail-item">
                                        <strong>Kategori:</strong> {selectedBook.category?.name || selectedBook.category?.category_name || 'Umum'}
                                    </div>
                                    <div className="detail-item">
                                        <strong>Penerbit:</strong> {selectedBook.publisher?.name || selectedBook.publisher?.publisher_name}
                                    </div>
                                    <div className="detail-item">
                                        <strong>Tahun Terbit:</strong> {selectedBook.publication_year || 'N/A'}
                                    </div>
                                    <div className="detail-item">
                                        <strong>Stok:</strong> {selectedBook.stock} buku
                                    </div>
                                    <div className="detail-item">
                                        <strong>Lokasi:</strong> {selectedBook.location || 'Rak Utama'}
                                    </div>
                                </div>
                                
                                {selectedBook.description && (
                                    <div className="book-description">
                                        <strong>Deskripsi:</strong>
                                        <p>{selectedBook.description}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="modal-footer">
                            <button 
                                onClick={() => setShowModal(false)}
                                className="btn-secondary"
                            >
                                Tutup
                            </button>
                            <button 
                                onClick={() => handleBorrowRequest(selectedBook.id)}
                                className="btn-primary"
                                disabled={selectedBook.stock === 0}
                            >
                                📚 Pinjam Buku
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
