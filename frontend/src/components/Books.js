import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Books.css';

const Books = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [books, setBooks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [publishers, setPublishers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedPublisher, setSelectedPublisher] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const booksPerPage = 12;

    useEffect(() => {
        fetchBooks();
        fetchCategories();
        fetchPublishers();
    }, []);

    const fetchBooks = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/books`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setBooks(response.data);
        } catch (error) {
            console.error('Error fetching books:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/categories`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchPublishers = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/publishers`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setPublishers(response.data);
        } catch (error) {
            console.error('Error fetching publishers:', error);
        }
    };

    const handleBorrow = async (bookId) => {
        if (window.confirm('Apakah Anda yakin ingin meminjam buku ini?')) {
            try {
                await axios.post(`${process.env.REACT_APP_API_URL}/api/lendings`, {
                    book_id: bookId
                }, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                alert('Buku berhasil dipinjam!');
                fetchBooks(); // Refresh books list
            } catch (error) {
                console.error('Error borrowing book:', error);
                alert('Gagal meminjam buku. Silakan coba lagi.');
            }
        }
    };

    // Filter books based on search and filters
    const filteredBooks = books.filter(book => {
        const matchesSearch = book.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            book.pengarang.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === '' || book.kategori_id === parseInt(selectedCategory);
        const matchesPublisher = selectedPublisher === '' || book.penerbit_id === parseInt(selectedPublisher);
        
        return matchesSearch && matchesCategory && matchesPublisher;
    });

    // Pagination
    const indexOfLastBook = currentPage * booksPerPage;
    const indexOfFirstBook = indexOfLastBook - booksPerPage;
    const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);
    const totalPages = Math.ceil(filteredBooks.length / booksPerPage);

    if (loading) {
        return (
            <div className="books-container">
                <div className="loading">Memuat data buku...</div>
            </div>
        );
    }

    return (
        <div className="books-container">
            <div className="books-header">
                <div className="header-left">
                    <h1>📚 Katalog Buku</h1>
                    <p>Temukan dan pinjam buku yang Anda inginkan</p>
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

            <div className="books-filters">
                <div className="filter-group">
                    <input
                        type="text"
                        placeholder="Cari judul buku atau pengarang..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
                
                <div className="filter-group">
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="filter-select"
                    >
                        <option value="">Semua Kategori</option>
                        {categories.map(category => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="filter-group">
                    <select
                        value={selectedPublisher}
                        onChange={(e) => setSelectedPublisher(e.target.value)}
                        className="filter-select"
                    >
                        <option value="">Semua Penerbit</option>
                        {publishers.map(publisher => (
                            <option key={publisher.id} value={publisher.id}>
                                {publisher.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="results-info">
                    Menampilkan {filteredBooks.length} buku
                </div>
            </div>

            <div className="books-grid">
                {currentBooks.map(book => (
                    <div key={book.id} className="book-card">
                        <div className="book-cover">
                            {/* Note: Replace with actual book cover images */}
                            <div className="book-placeholder">
                                📖
                            </div>
                        </div>
                        <div className="book-info">
                            <h3 className="book-title">{book.judul}</h3>
                            <p className="book-author">oleh {book.pengarang}</p>
                            <p className="book-details">
                                <span>📚 {book.category?.kategori}</span>
                                <span>🏢 {book.publisher?.nama_penerbit}</span>
                            </p>
                            <p className="book-details">
                                <span>📅 {book.tahun_terbit}</span>
                                <span>📄 {book.jumlah_halaman} hal</span>
                            </p>
                            <div className="book-stock">
                                <span className={`stock-badge ${book.jumlah_buku > 0 ? 'available' : 'unavailable'}`}>
                                    {book.jumlah_buku > 0 ? `Tersedia (${book.jumlah_buku})` : 'Tidak Tersedia'}
                                </span>
                            </div>
                            <div className="book-actions">
                                {book.jumlah_buku > 0 && (
                                    <button 
                                        className="borrow-btn"
                                        onClick={() => handleBorrow(book.id)}
                                    >
                                        📚 Pinjam Buku
                                    </button>
                                )}
                                <button 
                                    className="detail-btn"
                                    onClick={() => navigate(`/book-detail/${book.id}`)}
                                >
                                    ℹ️ Detail
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredBooks.length === 0 && (
                <div className="no-books">
                    <h3>📭 Tidak ada buku yang ditemukan</h3>
                    <p>Coba ubah kata kunci pencarian atau filter yang dipilih.</p>
                </div>
            )}

            {totalPages > 1 && (
                <div className="pagination">
                    <button 
                        className={`page-btn ${currentPage === 1 ? 'disabled' : ''}`}
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                    >
                        ← Sebelumnya
                    </button>
                    
                    <div className="page-numbers">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                className={`page-number ${currentPage === page ? 'active' : ''}`}
                                onClick={() => setCurrentPage(page)}
                            >
                                {page}
                            </button>
                        ))}
                    </div>
                    
                    <button 
                        className={`page-btn ${currentPage === totalPages ? 'disabled' : ''}`}
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                    >
                        Selanjutnya →
                    </button>
                </div>
            )}
        </div>
    );
};

export default Books;
