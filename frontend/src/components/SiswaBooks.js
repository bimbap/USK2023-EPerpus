import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/SiswaPages.css';

export default function SiswaBooks() {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [categories, setCategories] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const booksPerPage = 12;
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = JSON.parse(localStorage.getItem('user'));
        
        if (!token || !userData) {
            navigate('/login');
            return;
        }
        
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        fetchBooks();
        fetchCategories();
    }, [navigate]);

    const fetchBooks = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://127.0.0.1:8000/api/books');
            
            if (response.data.success) {
                setBooks(response.data.data);
            } else if (Array.isArray(response.data)) {
                setBooks(response.data);
            } else {
                setBooks([]);
            }
        } catch (error) {
            console.error('Error fetching books:', error);
            setBooks([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/categories');
            
            if (response.data.success) {
                setCategories(response.data.data);
            } else if (Array.isArray(response.data)) {
                setCategories(response.data);
            } else {
                setCategories([]);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            setCategories([]);
        }
    };

    const handleBorrowBook = async (bookId) => {
        try {
            const userData = JSON.parse(localStorage.getItem('user'));
            const borrowData = {
                user_id: userData.id,
                book_id: bookId,
                tanggal_pinjam: new Date().toISOString().split('T')[0],
                tanggal_kembali: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 14 days later
                status: 'dipinjam'
            };

            const response = await axios.post('http://127.0.0.1:8000/api/lendings', borrowData);
            
            if (response.data.success) {
                alert('Buku berhasil dipinjam!');
                fetchBooks(); // Refresh to update available count
            } else {
                alert('Gagal meminjam buku: ' + response.data.message);
            }
        } catch (error) {
            console.error('Error borrowing book:', error);
            if (error.response?.data?.message) {
                alert('Error: ' + error.response.data.message);
            } else {
                alert('Gagal meminjam buku. Coba lagi nanti.');
            }
        }
    };

    // Filter books based on search term and category
    const filteredBooks = books.filter(book => {
        const matchesSearch = book.judul?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            book.pengarang?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesCategory = selectedCategory === '' || book.category_id?.toString() === selectedCategory;
        
        return matchesSearch && matchesCategory;
    });

    // Pagination
    const indexOfLastBook = currentPage * booksPerPage;
    const indexOfFirstBook = indexOfLastBook - booksPerPage;
    const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);
    const totalPages = Math.ceil(filteredBooks.length / booksPerPage);

    if (loading) {
        return (
            <div className="siswa-page-container">
                <div className="loading">
                    <div className="loading-spinner"></div>
                    <p>Memuat daftar buku...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="siswa-page-container">
            <div className="page-header">
                <div className="header-content">
                    <h1>📚 Katalog Buku</h1>
                    <p>Temukan dan pinjam buku favorit Anda</p>
                </div>
                <button 
                    className="btn-back"
                    onClick={() => navigate('/siswa/dashboard')}
                >
                    ← Kembali
                </button>
            </div>

            {/* Search and Filter Section */}
            <div className="search-section">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Cari judul buku atau pengarang..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="search-input"
                    />
                    <select
                        value={selectedCategory}
                        onChange={(e) => {
                            setSelectedCategory(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="category-select"
                    >
                        <option value="">Semua Kategori</option>
                        {categories.map(category => (
                            <option key={category.id} value={category.id}>
                                {category.category_name || category.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="results-info">
                    Ditemukan {filteredBooks.length} buku
                </div>
            </div>

            {/* Books Grid */}
            <div className="books-grid">
                {currentBooks.length > 0 ? (
                    currentBooks.map(book => (
                        <div key={book.id} className="book-card">
                            <div className="book-cover">
                                <div className="book-icon">📖</div>
                                <div className="book-status">
                                    {book.jumlah_buku > 0 ? (
                                        <span className="available">Tersedia</span>
                                    ) : (
                                        <span className="unavailable">Habis</span>
                                    )}
                                </div>
                            </div>
                            
                            <div className="book-info">
                                <h3 className="book-title">{book.judul}</h3>
                                <p className="book-author">oleh {book.pengarang}</p>
                                <p className="book-details">
                                    <span>📅 {book.tahun_terbit}</span>
                                    <span>📄 {book.jumlah_halaman} hal</span>
                                </p>
                                <p className="book-stock">
                                    Stok: {book.jumlah_buku} buku
                                </p>
                            </div>

                            <div className="book-actions">
                                {book.jumlah_buku > 0 ? (
                                    <button 
                                        className="btn-borrow"
                                        onClick={() => handleBorrowBook(book.id)}
                                    >
                                        📚 Pinjam Buku
                                    </button>
                                ) : (
                                    <button className="btn-unavailable" disabled>
                                        ❌ Tidak Tersedia
                                    </button>
                                )}
                                <button 
                                    className="btn-details"
                                    onClick={() => {
                                        alert(`Detail Buku:\n\nJudul: ${book.judul}\nPengarang: ${book.pengarang}\nTahun: ${book.tahun_terbit}\nHalaman: ${book.jumlah_halaman}\nStok: ${book.jumlah_buku}`);
                                    }}
                                >
                                    ℹ️ Detail
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-books">
                        <div className="no-books-icon">📚</div>
                        <h3>Tidak ada buku ditemukan</h3>
                        <p>Coba ubah kata kunci pencarian atau filter kategori</p>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="pagination">
                    <button 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="pagination-btn"
                    >
                        ← Sebelumnya
                    </button>
                    
                    <div className="pagination-numbers">
                        {[...Array(totalPages)].map((_, index) => (
                            <button
                                key={index + 1}
                                onClick={() => setCurrentPage(index + 1)}
                                className={`pagination-number ${currentPage === index + 1 ? 'active' : ''}`}
                            >
                                {index + 1}
                            </button>
                        ))}
                    </div>
                    
                    <button 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="pagination-btn"
                    >
                        Selanjutnya →
                    </button>
                </div>
            )}
        </div>
    );
}
