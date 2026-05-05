import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAdd, faPencilAlt, faTrash, faTimes } from '@fortawesome/free-solid-svg-icons';
import {
    getEdukasi,
    createEdukasi,
    updateEdukasi,
    deleteEdukasi
} from "./adminEdukasiService.js";

const kategoriMap = {
    11: "Gizi Seimbang",
    12: "Perilaku Menyusui",
    13: "Kelancaran ASI",
};

export default function AdminEdukasi() {
    const [form, setForm] = useState({
        title: "",
        content: "",
        media: "",
        date: "",
        kategori: "",
    });

    const [data, setData] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    const fetchData = async () => {
        const result = await getEdukasi();
        setData(result);
    };

    useEffect(() => {
        const load = async () => {
            await fetchData();
        };

        load();
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editingId) {
                await updateEdukasi(editingId, form);
                setEditingId(null);
            } else {
                await createEdukasi(form);
            }

            setForm({ title: "", content: "", media: "", date: "", kategori: "" });
            fetchData();
            setShowModal(false);
        } catch (err) {
            console.error(err);
        }
    };

    const handleEdit = (item) => {
        setShowModal(true);
        setForm({
            title: item.title,
            content: item.content,
            media: item.media,
            kategori: item.kategori || "",
            date: item.date
                ? new Date(item.date.seconds * 1000)
                    .toISOString()
                    .slice(0, 16)
                : "",
        });
        setEditingId(item.id);
    };

    const handleDelete = async (id) => {
        if (confirm("Yakin hapus data ini?")) {
            await deleteEdukasi(id);
            fetchData();
        }
    };

    // 🔥 Helper untuk mengambil ID YouTube menggunakan Regex yang akurat
    const getYouTubeId = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    return (
        <div className="min-h-screen bg-gray-50/50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* HEADER + BUTTON */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Daftar Edukasi</h2>
                        <p className="text-sm text-gray-500 mt-1">Kelola konten edukasi untuk ibu menyusui.</p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center justify-center gap-2 bg-pink-500 text-white px-5 py-2.5 rounded-xl hover:bg-pink-600 transition-colors font-medium shadow-sm shadow-pink-200"
                    >
                        <FontAwesomeIcon icon={faAdd} />
                        <span>Tambah Edukasi</span>
                    </button>
                </div>

                {/* MODAL FORM (ADD/EDIT) */}
                {showModal && (
                    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl w-full max-w-lg transform transition-all">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-gray-800">
                                    {editingId ? "Edit Edukasi" : "Tambah Edukasi Baru"}
                                </h3>
                                <button
                                    onClick={() => {
                                        setShowModal(false);
                                        setEditingId(null);
                                        setForm({ title: "", content: "", media: "", date: "", kategori: "" });
                                    }}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <FontAwesomeIcon icon={faTimes} className="text-xl" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Judul Artikel</label>
                                    <input className="w-full border border-gray-300 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all" name="title" placeholder="Masukkan judul..." value={form.title} onChange={handleChange} required />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Konten / Isi</label>
                                    <textarea className="w-full border border-gray-300 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all h-32 resize-none" name="content" placeholder="Tuliskan isi edukasi..." value={form.content} onChange={handleChange} required />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">URL Media (Gambar/Video)</label>
                                    <input className="w-full border border-gray-300 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all" name="media" placeholder="https://..." value={form.media} onChange={handleChange} />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                                        <select
                                            className="w-full border border-gray-300 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all bg-white"
                                            name="kategori"
                                            value={form.kategori}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="" disabled>Pilih Kategori</option>
                                            <option value="11">Gizi Seimbang</option>
                                            <option value="12">Perilaku Menyusui</option>
                                            <option value="13">Kelancaran ASI</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                                        <input
                                            className="w-full border border-gray-300 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all"
                                            type="datetime-local"
                                            name="date"
                                            value={form.date}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowModal(false);
                                            setEditingId(null);
                                            setForm({ title: "", content: "", media: "", date: "", kategori: "" });
                                        }}
                                        className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="bg-pink-500 text-white px-6 py-2.5 rounded-xl hover:bg-pink-600 font-medium shadow-sm transition-colors"
                                    >
                                        {editingId ? "Simpan Perubahan" : "Simpan Data"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* TABLE LIST */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50/80 text-gray-500 uppercase tracking-wider text-xs font-semibold border-b border-gray-100">
                            <tr>
                                <th className="p-4 md:p-5">Media</th>
                                <th className="p-4 md:p-5">Informasi Edukasi</th>
                                <th className="p-4 md:p-5">Kategori</th>
                                <th className="p-4 md:p-5">Tanggal</th>
                                <th className="p-4 md:p-5 text-center">Aksi</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-gray-700">
                            {data.map(item => (
                                <tr
                                    key={item.id}
                                    className="hover:bg-pink-50/30 transition-colors cursor-pointer group"
                                    onClick={() => setSelectedItem(item)}
                                >
                                    <td className="p-4 md:p-5">
                                        {item.media ? (
                                            item.media.includes("youtube.com") || item.media.includes("youtu.be") ? (
                                                <img
                                                    // 🔥 Memakai fungsi getYouTubeId
                                                    src={`https://img.youtube.com/vi/${getYouTubeId(item.media)}/hqdefault.jpg`}
                                                    alt="thumbnail"
                                                    className="w-24 h-16 object-cover rounded-xl shadow-sm group-hover:shadow-md transition-shadow"
                                                />
                                            ) : item.media.includes("mp4") ? (
                                                <video className="w-24 h-16 object-cover rounded-xl shadow-sm group-hover:shadow-md transition-shadow" src={item.media} />
                                            ) : (
                                                <img src={item.media} alt="media" className="w-24 h-16 object-cover rounded-xl shadow-sm group-hover:shadow-md transition-shadow" />
                                            )
                                        ) : (
                                            <div className="w-24 h-16 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-xs shadow-sm">No Media</div>
                                        )}
                                    </td>

                                    <td className="p-4 md:p-5 align-top">
                                        <div className="font-bold text-gray-900 text-base mb-1">{item.title}</div>
                                        <div className="text-gray-500 line-clamp-2 leading-relaxed">
                                            {item.content}
                                        </div>
                                    </td>

                                    <td className="p-4 md:p-5 align-top">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-pink-100 text-pink-700 text-xs font-semibold">
                                                {kategoriMap[item.kategori] || "Tidak ada kategori"}
                                            </span>
                                    </td>

                                    <td className="p-4 md:p-5 align-top text-gray-500 whitespace-nowrap">
                                        {item.date
                                            ? new Date(item.date.seconds * 1000).toLocaleString("id-ID", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })
                                            : "-"}
                                    </td>

                                    <td className="p-4 md:p-5 align-top">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 flex items-center justify-center transition-colors"
                                                title="Edit"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEdit(item);
                                                }}
                                            >
                                                <FontAwesomeIcon icon={faPencilAlt} className="text-sm" />
                                            </button>
                                            <button
                                                className="w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 flex items-center justify-center transition-colors"
                                                title="Hapus"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(item.id);
                                                }}
                                            >
                                                <FontAwesomeIcon icon={faTrash} className="text-sm" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {data.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-gray-500">Belum ada data edukasi.</td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* DETAIL MODAL */}
                {selectedItem && (
                    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col max-h-[90vh]">

                            {/* Modal Header */}
                            <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
                                <div>
                                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-pink-100 text-pink-700 text-xs font-semibold mb-3">
                                        {kategoriMap[selectedItem.kategori] || "Tidak ada kategori"}
                                    </span>
                                    <h2 className="text-2xl font-bold text-gray-900 leading-tight">{selectedItem.title}</h2>
                                    <p className="text-sm text-gray-500 mt-2 flex items-center gap-2">
                                        {selectedItem.date
                                            ? new Date(selectedItem.date.seconds * 1000).toLocaleString("id-ID", {
                                                day: "2-digit",
                                                month: "long",
                                                year: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })
                                            : "-"}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelectedItem(null)}
                                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors"
                                >
                                    <FontAwesomeIcon icon={faTimes} />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6 overflow-y-auto custom-scrollbar">
                                {/* Media */}
                                {selectedItem.media && (
                                    <div className="mb-6 rounded-xl overflow-hidden bg-black/5">
                                        {selectedItem.media.includes("youtube.com") || selectedItem.media.includes("youtu.be") ? (
                                            <iframe
                                                className="w-full aspect-video"
                                                // 🔥 Memakai fungsi getYouTubeId untuk memastikan embed link-nya valid
                                                src={`https://www.youtube.com/embed/${getYouTubeId(selectedItem.media)}`}
                                                title="YouTube video"
                                                allowFullScreen
                                            />
                                        ) : selectedItem.media.includes("mp4") ? (
                                            <video className="w-full max-h-[400px] object-contain bg-black" controls src={selectedItem.media} />
                                        ) : (
                                            <img src={selectedItem.media} alt="Detail media" className="w-full max-h-[400px] object-cover" />
                                        )}
                                    </div>
                                )}

                                {/* Content */}
                                <div className="prose prose-pink max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
                                    {selectedItem.content}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
