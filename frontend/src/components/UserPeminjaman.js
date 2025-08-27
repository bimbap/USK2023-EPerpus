import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/UserPeminjaman.css"

export default function UserPeminjaman() {
    const [activeTab, setActiveTab] = useState("form"); // 'form' atau 'history'
    const [books, setBooks] = useState([]);
    const [peminjamanHistory, setPeminjamanHistory] = useState([]);
    const [bookId, setBookId] = useState("");
    const [batasPengembalian, setBatasPengembalian] = useState("");
    const [kondisi, setKondisi] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const token = localStorage.getItem("token");

    useEffect(() => {
        // Get books
        axios.get("http://localhost:8000/api/books", { 
            headers: { Authorization: `Bearer ${token}` } 
        })
            .then(res => setBooks(res.data.data || res.data))
            .catch(err => console.log(err));

        // Get lending history
        axios.get("http://localhost:8000/api/lendings/history", { 
            headers: { Authorization: `Bearer ${token}` } 
        })
            .then(res => setPeminjamanHistory(res.data))
            .catch(err => console.log(err));

        // Set default return date (7 days from today)
        const today = new Date();
        const batas = new Date(today);
        batas.setDate(batas.getDate() + 7);
        setBatasPengembalian(batas.toISOString().split("T")[0]);
    }, [token]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!bookId || !kondisi) {
            setMessage("Form belum lengkap!");
            return;
        }

        setLoading(true);
        axios.post("http://localhost:8000/api/lendings", {
            book_id: bookId,
            lend_date: new Date().toISOString().split('T')[0], // Current date
            book_condition_lent: kondisi
        }, { headers: { Authorization: `Bearer ${token}` } })
            .then(res => {
                setMessage("Berhasil meminjam buku!");
                setBookId("");
                setKondisi("");
                // Refresh history
                return axios.get("http://localhost:8000/api/lendings/history", { 
                    headers: { Authorization: `Bearer ${token}` } 
                });
            })
            .then(res => setPeminjamanHistory(res.data))
            .catch(err => {
                console.log(err);
                setMessage("Gagal meminjam buku!");
            })
            .finally(() => setLoading(false));
    }

    return (
        <div className="container">
            <h2>Peminjaman Buku</h2>

            {/* Tabs */}
            <div className="tabs">
                <button className={activeTab === "form" ? "active" : ""} onClick={() => setActiveTab("form")}>
                    Form Peminjaman Buku
                </button>
                <button className={activeTab === "history" ? "active" : ""} onClick={() => setActiveTab("history")}>
                    Riwayat Peminjaman Buku
                </button>
            </div>

            {/* Konten Tab */}
            {activeTab === "form" && (
                <form onSubmit={handleSubmit} className="borrow-form">
                    <div className="form-group">
                        <label>Buku:</label>
                        <select value={bookId} onChange={(e) => setBookId(e.target.value)} required>
                            <option value="">-- Pilih Buku --</option>
                            {books.map(book => (
                                <option key={book.id} value={book.id}>
                                    {book.title || book.judul_buku}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Tanggal Peminjaman:</label>
                        <input type="date" value={new Date().toISOString().split('T')[0]} readOnly />
                    </div>
                    <div className="form-group">
                        <label>Batas Pengembalian:</label>
                        <input type="date" value={batasPengembalian} readOnly />
                    </div>
                    <div className="form-group">
                        <label>Kondisi Buku Saat Dipinjam:</label>
                        <select value={kondisi} onChange={(e) => setKondisi(e.target.value)} required>
                            <option value="">-- Pilih Kondisi --</option>
                            <option value="Baik">Baik</option>
                            <option value="Rusak">Rusak</option>
                        </select>
                    </div>
                    <div className="form-actions">
                        <button type="submit" disabled={loading}>
                            {loading ? "Memproses..." : "Pinjam Buku"}
                        </button>
                        <button type="button" onClick={() => navigate("/user/dashboard")} className="btnBack">
                            Back
                        </button>
                    </div>
                    {message && <p className="message">{message}</p>}
                </form>
            )}

            {activeTab === "history" && (
                <table className="history-table">
                    <thead>
                        <tr>
                            <th>Judul Buku</th>
                            <th>Tanggal Pinjam</th>
                            <th>Batas Kembali</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {peminjamanHistory.length > 0 ? peminjamanHistory.map(p => (
                            <tr key={p.id}>
                                <td>{p.book?.title || p.book?.judul_buku}</td>
                                <td>{p.lend_date}</td>
                                <td>{p.return_date || "Belum dikembalikan"}</td>
                                <td>{p.return_date ? "Dikembalikan" : "Dipinjam"}</td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="4" style={{ textAlign: "center" }}>
                                    Belum ada riwayat peminjaman
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
}
