import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/identitas.css";

export default function IdentitasApp() {
    const [form, setForm] = useState({
        app_name: "",
        app_address: "",
        app_email: "",
        app_phone: "",
    });
    const [id, setId] = useState(null);
    const token = localStorage.getItem("token");
    const navigate = useNavigate();

    useEffect(() => {
        fetch("http://localhost:8000/api/admin/identitas_app", {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.status === 200 && data.message.length > 0) {
                    const d = data.message[0];
                    setForm({
                        app_name: d.app_name,
                        app_address: d.app_address,
                        app_email: d.app_email,
                        app_phone: d.app_phone,
                    });
                    setId(d.id);
                }
            })
            .catch(() => alert("Gagal ambil identitas aplikasi"));
    }, [token]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = id
            ? `http://localhost:8000/api/admin/identitas_app/${id}`
            : "http://localhost:8000/api/admin/identitas_app";

        try {
            const res = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (data.status === 200) {
                alert("Identitas aplikasi berhasil disimpan!");
            } else {
                alert(data.message || "Gagal menyimpan data");
            }
        } catch {
            alert("Gagal menghubungi server");
        }
    };

    return (
        <div className="identitas-container">
            <h2 className="title">Identitas Aplikasi</h2>
            <button
                className="btn-back"
                type="button"
                onClick={() => navigate(-1)}
                style={{
                    marginBottom: "1rem",
                    padding: "8px 16px",
                    background: "#ccc",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer"
                }}
            >
                ← Kembali
            </button>

            <div className="identitas-grid">
                {/* Form */}
                <form onSubmit={handleSubmit} className="identitas-form">
                    <h3 className="form-title">Edit Identitas Aplikasi</h3>
                    <input
                        type="text"
                        name="app_name"
                        placeholder="Nama Aplikasi"
                        value={form.app_name}
                        onChange={handleChange}
                        required
                    />
                    <textarea
                        name="app_address"
                        placeholder="Alamat Lengkap"
                        value={form.app_address}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="email"
                        name="app_email"
                        placeholder="Email"
                        value={form.app_email}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="text"
                        name="app_phone"
                        placeholder="Nomor Telepon"
                        value={form.app_phone}
                        onChange={handleChange}
                        required
                    />
                    <button type="submit" className="btn-update">
                        Update
                    </button>
                </form>

                {/* Preview */}
                <div className="identitas-preview">
                    <div className="icon">📚</div>
                    <h3 className="preview-title">{form.app_name || "-"}</h3>
                    <p><strong>Alamat:</strong> {form.app_address || "-"}</p>
                    <p><strong>Email:</strong> {form.app_email || "-"}</p>
                    <p><strong>Nomor Telepon:</strong> {form.app_phone || "-"}</p>
                </div>
            </div>
        </div>
    );
}
