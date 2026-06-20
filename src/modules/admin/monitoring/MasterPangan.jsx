import React, { useState, useEffect } from 'react';
import { db } from "../../../services/firebase.js";
import { collection, getDocs, doc, setDoc, serverTimestamp, query, orderBy, deleteDoc } from "firebase/firestore";
import { Plus, Search, ChevronLeft, ChevronRight, X, Save, Edit, Trash2, ChevronDown } from 'lucide-react';

export default function MasterPangan() {
    const [makanan, setMakanan] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // State untuk Search, Filter & Pagination
    const [searchTerm, setSearchTerm] = useState("");
    const [filterKategori, setFilterKategori] = useState("Semua");
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [isEditing, setIsEditing] = useState(false);

    const [formData, setFormData] = useState({
        kode: '', nama: '', kategori: 'Serealia dan Hasil Olahannya',
        energi: '', protein: '', lemak: '', karbohidrat: '', bdd: 100
    });

    // 1. Fetch Data dari Firestore
    const fetchData = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, "master_makanan"), orderBy("created_at", "desc"));
            const querySnapshot = await getDocs(q);
            const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMakanan(data);
        } catch (error) {
            console.error("Error fetch:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // 2. Logika Search & Filter
    const filteredData = makanan.filter(item => {
        const matchSearch = (item.nama?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
            (item.kode?.toLowerCase() || "").includes(searchTerm.toLowerCase());
        const matchKategori = filterKategori === "Semua" || item.kategori === filterKategori;
        return matchSearch && matchKategori;
    });

    // 3. Logika Pagination
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

    // 4. Handle Submit (Tambah & Edit Data)
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const docRef = doc(db, "master_makanan", formData.kode.toUpperCase());
            await setDoc(docRef, {
                ...formData,
                kode: formData.kode.toUpperCase(),
                energi: parseFloat(formData.energi) || 0,
                protein: parseFloat(formData.protein) || 0,
                lemak: parseFloat(formData.lemak) || 0,
                karbohidrat: parseFloat(formData.karbohidrat) || 0,
                search_name: formData.nama.toLowerCase(),
                created_at: serverTimestamp()
            });

            closeModal();
            fetchData(); // Refresh tabel
            alert(isEditing ? "Data berhasil diperbarui!" : "Data berhasil disimpan!");
        } catch (error) {
            console.error(error);
            alert("Terjadi kesalahan saat menyimpan data.");
        }
    };

    // Fungsi untuk menyiapkan modal EDIT
    const handleEdit = (item) => {
        setIsEditing(true);
        setFormData({
            kode: item.kode,
            nama: item.nama,
            kategori: item.kategori,
            energi: item.energi,
            protein: item.protein,
            lemak: item.lemak,
            karbohidrat: item.karbohidrat,
            bdd: item.bdd || 100
        });
        setShowModal(true);
    };

    // Fungsi untuk DELETE data
    const handleDelete = async (item) => {
        if (window.confirm(`Apakah Anda yakin ingin menghapus ${item.nama}?`)) {
            try {
                await deleteDoc(doc(db, "master_makanan", item.id));
                alert("Data berhasil dihapus!");
                fetchData();
            } catch (error) {
                console.error("Error deleting: ", error);
            }
        }
    };

    // Fungsi Reset & Tutup Modal
    const closeModal = () => {
        setShowModal(false);
        setIsEditing(false);
        setFormData({
            kode: '', nama: '', kategori: 'Serealia dan Hasil Olahannya',
            energi: '', protein: '', lemak: '', karbohidrat: '', bdd: 100
        });
    };

    return (
        <div className="p-4 sm:p-8 bg-gray-50 min-h-screen font-sans">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#D81B60] to-[#FF6B9E]">
                            Master Data Pangan
                        </h1>
                        <p className="text-gray-500 mt-1 text-sm">Database Nutrisi TKPI-2020</p>
                    </div>

                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center justify-center gap-2 bg-[#D81B60] hover:bg-[#AD1457] text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-pink-100"
                    >
                        <Plus size={18}/> Tambah Item
                    </button>
                </div>

                {/* Toolbar */}
                <div
                    className="bg-white p-4 rounded-2xl border border-pink-50 shadow-sm flex flex-col lg:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-300" size={18}/>
                        <input
                            type="text"
                            placeholder="Cari nama atau kode makanan..."
                            className="w-full pl-12 pr-4 py-3 bg-pink-50/20 border-none rounded-xl text-sm focus:ring-2 focus:ring-pink-200 outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-2">
                        <select
                            className="bg-gray-50 border-none rounded-xl text-sm px-4 py-2 outline-none focus:ring-2 focus:ring-pink-200 cursor-pointer"
                            value={filterKategori}
                            onChange={(e) => setFilterKategori(e.target.value)}
                        >
                            <option>Semua</option>
                            <option>Serealia dan Hasil Olahannya</option>
                            <option>Umbi Berpati dan Hasil Olahannya</option>
                            <option>Kacang-kacangan dan Hasil Olahannya</option>
                            <option>Sayuran dan Hasil Olahannya</option>
                            <option>Buah-buahan dan Hasil Olahannya</option>
                            <option>Ikan, Kerang, Udang dan Hasil Olahannya</option>
                        </select>

                        <select
                            className="bg-gray-50 border-none rounded-xl text-sm px-4 py-2 outline-none"
                            value={itemsPerPage}
                            onChange={(e) => {setItemsPerPage(Number(e.target.value)); setCurrentPage(1);}}
                        >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                    </div>
                </div>

                {/* Tabel */}
                <div className="bg-white rounded-[2rem] border border-pink-50 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-pink-50/30 text-pink-400 uppercase text-[10px] font-black tracking-widest">
                            <tr>
                                <th className="px-6 py-5">Kode</th>
                                <th className="px-6 py-5">Nama Bahan</th>
                                <th className="px-6 py-5">Kategori</th>
                                <th className="px-6 py-5 text-center">Energi</th>
                                <th className="px-6 py-5 text-center">Protein</th>
                                <th className="px-6 py-5 text-center">Lemak</th>
                                <th className="px-6 py-5 text-center">Karbo</th>
                                <th className="px-6 py-5 text-center">Aksi</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-pink-50">
                            {loading ? (
                                <tr><td colSpan="8" className="px-6 py-10 text-center text-gray-400">Memuat data...</td></tr>
                            ) : paginatedData.length > 0 ? (
                                paginatedData.map((item) => (
                                    <tr key={item.id} className="hover:bg-pink-50/10 transition-colors text-gray-600">
                                        <td className="px-6 py-4 font-mono font-bold text-pink-600">{item.kode}</td>
                                        <td className="px-6 py-4 font-bold text-gray-800">{item.nama}</td>
                                        <td className="px-6 py-4 text-xs opacity-60">{item.kategori}</td>
                                        <td className="px-6 py-4 text-center font-medium">{item.energi}</td>
                                        <td className="px-6 py-4 text-center font-medium">{item.protein}</td>
                                        <td className="px-6 py-4 text-center font-medium">{item.lemak}</td>
                                        <td className="px-6 py-4 text-center font-medium">{item.karbohidrat}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center gap-3">
                                                <button onClick={() => handleEdit(item)} className="p-2 text-blue-400 hover:bg-blue-50 rounded-lg transition-all"><Edit size={16}/></button>
                                                <button onClick={() => handleDelete(item)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16}/></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="8" className="px-6 py-10 text-center text-gray-400">Data tidak ditemukan.</td></tr>
                            )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="px-8 py-5 bg-white border-t border-pink-50 flex items-center justify-between">
                        <span className="text-[11px] text-pink-300 font-black uppercase tracking-widest">
                            Halaman {currentPage} dari {totalPages || 1}
                        </span>
                        <div className="flex gap-2">
                            <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="p-2.5 border border-pink-100 rounded-xl hover:bg-pink-50 disabled:opacity-20 transition-all"><ChevronLeft size={18}/></button>
                            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="p-2.5 border border-pink-100 rounded-xl hover:bg-pink-50 disabled:opacity-20 transition-all"><ChevronRight size={18}/></button>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL - FEMININE VERSION */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pink-900/20 backdrop-blur-md">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in duration-300 border border-pink-50">
                        <div className="flex justify-between items-center p-6 bg-gradient-to-r from-pink-50 to-white border-b border-pink-100">
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">{isEditing ? "Edit Data Master" : "Tambah Master Baru"}</h3>
                                <p className="text-xs text-pink-400 font-medium mt-0.5">Referensi TKPI-2020 </p>
                            </div>
                            <button onClick={closeModal} className="w-10 h-10 flex items-center justify-center rounded-full text-gray-300 hover:bg-pink-50 hover:text-pink-600"><X size={20}/></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
                                <div className="md:col-span-2 space-y-1.5">
                                    <label className="text-[10px] font-black text-pink-300 uppercase tracking-widest ml-1">Kategori Pangan</label>
                                    <div className="relative">
                                        <select value={formData.kategori} onChange={(e) => setFormData({...formData, kategori: e.target.value})} className="w-full bg-pink-50/30 border-2 border-pink-50 rounded-2xl p-3.5 text-sm appearance-none outline-none focus:border-pink-300 focus:bg-white transition-all font-medium">
                                            <option>Serealia dan Hasil Olahannya</option>
                                            <option>Umbi Berpati dan Hasil Olahannya</option>
                                            <option>Kacang-kacangan dan Hasil Olahannya</option>
                                            <option>Sayuran dan Hasil Olahannya</option>
                                            <option>Buah-buahan dan Hasil Olahannya</option>
                                            <option>Daging, Unggas dan Hasil Olahannya</option>
                                            <option>Ikan, Kerang, Udang dan Hasil Olahannya</option>
                                            <option>Telur dan Hasil Olahannya</option>
                                            <option>Susu dan Hasil Olahannya</option>
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-pink-200" size={18}/>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-pink-300 uppercase tracking-widest ml-1">Kode</label>
                                    <input value={formData.kode} onChange={(e) => setFormData({...formData, kode: e.target.value.toUpperCase()})} className="w-full bg-pink-50/30 border-2 border-pink-50 rounded-2xl p-3.5 text-sm font-mono" required />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-pink-300 uppercase tracking-widest ml-1">Nama Bahan</label>
                                    <input value={formData.nama} onChange={(e) => setFormData({...formData, nama: e.target.value})} className="w-full bg-pink-50/30 border-2 border-pink-50 rounded-2xl p-3.5 text-sm font-bold" required />
                                </div>
                                <div className="md:col-span-2 pt-2 flex items-center gap-3">
                                    <span className="text-[9px] font-black text-pink-400 uppercase tracking-widest whitespace-nowrap">Nilai per 100g</span>
                                    <div className="w-full h-px bg-pink-100"></div>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 col-span-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-pink-300 uppercase text-center block">Kalori</label>
                                        <input type="number" step="0.1" value={formData.energi} onChange={(e) => setFormData({...formData, energi: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl p-3 text-center text-sm font-bold" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-pink-300 uppercase text-center block">Protein</label>
                                        <input type="number" step="0.1" value={formData.protein} onChange={(e) => setFormData({...formData, protein: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl p-3 text-center text-sm font-bold" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-pink-300 uppercase text-center block">Lemak</label>
                                        <input type="number" step="0.1" value={formData.lemak} onChange={(e) => setFormData({...formData, lemak: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl p-3 text-center text-sm font-bold" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-pink-300 uppercase text-center block">Karbo</label>
                                        <input type="number" step="0.1" value={formData.karbohidrat} onChange={(e) => setFormData({...formData, karbohidrat: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl p-3 text-center text-sm font-bold" />
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end gap-4 pt-6 border-t border-pink-50">
                                <button type="button" onClick={closeModal} className="px-6 py-2 text-sm font-bold text-gray-400">Batal</button>
                                <button type="submit" className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-10 py-3 rounded-2xl font-black text-xs shadow-lg shadow-pink-100 active:scale-95 transition-all">
                                    {isEditing ? "SIMPAN PERUBAHAN" : "SIMPAN MASTER"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
