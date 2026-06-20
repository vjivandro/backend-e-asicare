import React, { useState, useEffect } from 'react';
import { db } from "../../../services/firebase.js"; // Sesuaikan path jika perlu
import { doc, setDoc, serverTimestamp, deleteDoc } from "firebase/firestore";
import { Plus, Search, ChevronLeft, ChevronRight, X, Edit, Trash2, Activity } from 'lucide-react';
import { getAKG } from "./monitoringService.js";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faAdd} from "@fortawesome/free-solid-svg-icons"; // Sesuaikan path jika perlu

export default function MasterAKG() {
    const [dataMaster, setDataMaster] = useState([]);
    const [loadingMaster, setLoadingMaster] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [searchMaster, setSearchMaster] = useState("");
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        id: '', usia_min: '', usia_max: '', energi: '', protein: '', lemak: '', karbohidrat: ''
    });

    const fetchMasterData = async () => {
        setLoadingMaster(true);
        try {
            const result = await getAKG();
            setDataMaster(result);
        } catch (err) {
            alert(err.message);
        } finally {
            setLoadingMaster(false);
        }
    };

    useEffect(() => {
        fetchMasterData();
    }, []);

    const handleMasterSubmit = async (e) => {
        e.preventDefault();
        try {
            const customId = isEditing ? formData.id : `usia_${formData.usia_min}_${formData.usia_max}`;
            const docRef = doc(db, "akg_ibu", customId);

            await setDoc(docRef, {
                usia_min: parseInt(formData.usia_min),
                usia_max: parseInt(formData.usia_max),
                energi: parseFloat(formData.energi) || 0,
                protein: parseFloat(formData.protein) || 0,
                lemak: parseFloat(formData.lemak) || 0,
                karbohidrat: parseFloat(formData.karbohidrat) || 0,
                updated_at: serverTimestamp()
            }, { merge: true });

            closeModal();
            fetchMasterData();
            alert(isEditing ? "Data AKG diperbarui!" : "Data AKG berhasil ditambahkan!");
        } catch (error) {
            console.error(error);
            alert("Gagal menyimpan data.");
        }
    };

    const handleEdit = (item) => {
        setIsEditing(true);
        setFormData({ ...item });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Yakin ingin menghapus data AKG ini?")) {
            try {
                await deleteDoc(doc(db, "akg_ibu", id));
                fetchMasterData();
                alert("Data berhasil dihapus");
            } catch (err) { alert(err.message); }
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setIsEditing(false);
        setFormData({ id: '', usia_min: '', usia_max: '', energi: '', protein: '', lemak: '', karbohidrat: '' });
    };

    const filteredMaster = dataMaster.filter(item =>
        `${item.usia_min} ${item.usia_max}`.includes(searchMaster)
    );
    const totalPagesMaster = Math.ceil(filteredMaster.length / itemsPerPage);
    const paginatedMaster = filteredMaster.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#D81B60] to-[#FF6B9E]">
                    Master Data AKG Ibu
                </h1>
                <p className="text-gray-500 mt-1">Kelola parameter AKG</p>
            </div>

            {/* Toolbar Master */}
            <div
                className="bg-white p-4 rounded-2xl border border-pink-50 shadow-sm flex flex-col lg:flex-row justify-between items-center gap-4">
                <div className="relative flex-1 w-full lg:max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-300" size={18}/>
                    <input
                        type="text"
                        placeholder="Cari berdasarkan rentang usia..."
                        className="w-full pl-12 pr-4 py-3 bg-pink-50/20 border-none rounded-xl text-sm focus:ring-2 focus:ring-pink-200 outline-none transition-all"
                        value={searchMaster}
                        onChange={(e) => setSearchMaster(e.target.value)}
                    />
                </div>

                <div className="flex gap-4 w-full lg:w-auto">
                    <select
                        className="bg-gray-50 border-none rounded-xl text-sm px-4 py-2 outline-none focus:ring-2 focus:ring-pink-200 cursor-pointer"
                        value={itemsPerPage}
                        onChange={(e) => {
                            setItemsPerPage(Number(e.target.value));
                            setCurrentPage(1);
                        }}
                    >
                        <option value={10}>Tampilkan 10</option>
                        <option value={20}>Tampilkan 20</option>
                        <option value={50}>Tampilkan 50</option>
                    </select>

                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#D81B60] to-[#FF6B9E] hover:shadow-lg hover:shadow-pink-200 text-white px-6 py-2.5 rounded-xl font-bold transition-all"
                    >
                        <Plus size={18}/> Tambah Data
                    </button>
                </div>
            </div>

            {/* Tabel Master */}
            <div className="bg-white rounded-[2rem] border border-pink-50 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead
                            className="bg-pink-50/30 text-pink-400 uppercase text-[10px] font-black tracking-widest border-b border-pink-50">
                        <tr>
                            <th className="px-6 py-5">Rentang Usia</th>
                            <th className="px-6 py-5 text-center">Energi (kkal)</th>
                            <th className="px-6 py-5 text-center">Protein (g)</th>
                            <th className="px-6 py-5 text-center">Lemak (g)</th>
                            <th className="px-6 py-5 text-center">Karbo (g)</th>
                            <th className="px-6 py-5 text-center">Aksi</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-pink-50 text-gray-600">
                        {loadingMaster ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-10 text-center text-gray-400"><Activity
                                    className="w-6 h-6 animate-spin mx-auto mb-2 text-pink-400"/>Memuat data...
                                </td>
                            </tr>
                        ) : paginatedMaster.length > 0 ? (
                            paginatedMaster.map((item) => (
                                <tr key={item.id} className="hover:bg-pink-50/10 transition-colors">
                                    <td className="px-6 py-4 font-bold text-gray-800">{item.usia_min} - {item.usia_max} Tahun</td>
                                    <td className="px-6 py-4 text-center font-medium">{item.energi}</td>
                                    <td className="px-6 py-4 text-center font-medium">{item.protein}</td>
                                    <td className="px-6 py-4 text-center font-medium">{item.lemak}</td>
                                    <td className="px-6 py-4 text-center font-medium">{item.karbohidrat}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center gap-3">
                                            <button onClick={() => handleEdit(item)}
                                                    className="p-2 text-blue-400 hover:bg-blue-50 rounded-lg transition-all">
                                                <Edit size={16}/></button>
                                            <button onClick={() => handleDelete(item.id)}
                                                    className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-all">
                                                <Trash2 size={16}/></button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="px-6 py-10 text-center text-gray-400">Tidak ada data AKG
                                    ditemukan.
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Master */}
                <div className="px-8 py-5 bg-white border-t border-pink-50 flex items-center justify-between">
                    <span className="text-[11px] text-pink-300 font-black uppercase tracking-widest">
                        Halaman {currentPage} dari {totalPagesMaster || 1}
                    </span>
                    <div className="flex gap-2">
                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}
                                className="p-2.5 border border-pink-100 rounded-xl hover:bg-pink-50 disabled:opacity-20 transition-all">
                            <ChevronLeft size={18}/></button>
                        <button disabled={currentPage === totalPagesMaster}
                                onClick={() => setCurrentPage(prev => prev + 1)}
                                className="p-2.5 border border-pink-100 rounded-xl hover:bg-pink-50 disabled:opacity-20 transition-all">
                            <ChevronRight size={18}/></button>
                    </div>
                </div>
            </div>

            {/* Modal Edit/Add Master AKG */}
            {showModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pink-900/20 backdrop-blur-md">
                    <div
                        className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in duration-300 border border-pink-50">
                        <div
                            className="flex justify-between items-center p-6 bg-gradient-to-r from-pink-50 to-white border-b border-pink-100">
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">{isEditing ? "Ubah Parameter AKG" : "Tambah Data AKG Baru"}</h3>
                                <p className="text-xs text-pink-400 font-medium mt-0.5">Atur ambang batas nutrisi
                                    berdasarkan usia </p>
                            </div>
                            <button onClick={closeModal}
                                    className="w-10 h-10 flex items-center justify-center rounded-full text-gray-300 hover:bg-pink-50 hover:text-pink-600 transition-all">
                                <X size={20}/></button>
                        </div>
                        <form onSubmit={handleMasterSubmit} className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
                                <div className="space-y-1.5">
                                    <label
                                        className="text-[10px] font-black text-pink-300 uppercase tracking-widest ml-1">Usia
                                        Minimal</label>
                                    <input type="number" value={formData.usia_min}
                                           onChange={(e) => setFormData({...formData, usia_min: e.target.value})}
                                           className="w-full bg-pink-50/30 border-2 border-pink-50 rounded-2xl p-3.5 text-sm font-bold"
                                           placeholder="Contoh: 19" required/>
                                </div>
                                <div className="space-y-1.5">
                                    <label
                                        className="text-[10px] font-black text-pink-300 uppercase tracking-widest ml-1">Usia
                                        Maksimal</label>
                                    <input type="number" value={formData.usia_max}
                                           onChange={(e) => setFormData({...formData, usia_max: e.target.value})}
                                           className="w-full bg-pink-50/30 border-2 border-pink-50 rounded-2xl p-3.5 text-sm font-bold"
                                           placeholder="Contoh: 29" required/>
                                </div>

                                <div className="md:col-span-2 pt-2 flex items-center gap-3">
                                    <span
                                        className="text-[9px] font-black text-pink-400 uppercase tracking-widest whitespace-nowrap">Target Nutrisi Harian </span>
                                    <div className="w-full h-px bg-pink-100"></div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 col-span-2 gap-4">
                                    <div className="space-y-1 text-center">
                                        <label
                                            className="text-[9px] font-black text-pink-300 uppercase block">Kalori</label>
                                        <input type="number" step="0.1" value={formData.energi}
                                               onChange={(e) => setFormData({...formData, energi: e.target.value})}
                                               className="w-full bg-gray-50 border-none rounded-xl p-3 text-center text-sm font-bold"/>
                                    </div>
                                    <div className="space-y-1 text-center">
                                        <label
                                            className="text-[9px] font-black text-pink-300 uppercase block">Protein</label>
                                        <input type="number" step="0.1" value={formData.protein}
                                               onChange={(e) => setFormData({...formData, protein: e.target.value})}
                                               className="w-full bg-gray-50 border-none rounded-xl p-3 text-center text-sm font-bold"/>
                                    </div>
                                    <div className="space-y-1 text-center">
                                        <label
                                            className="text-[9px] font-black text-pink-300 uppercase block">Lemak</label>
                                        <input type="number" step="0.1" value={formData.lemak}
                                               onChange={(e) => setFormData({...formData, lemak: e.target.value})}
                                               className="w-full bg-gray-50 border-none rounded-xl p-3 text-center text-sm font-bold"/>
                                    </div>
                                    <div className="space-y-1 text-center">
                                        <label
                                            className="text-[9px] font-black text-pink-300 uppercase block">Karbo</label>
                                        <input type="number" step="0.1" value={formData.karbohidrat}
                                               onChange={(e) => setFormData({...formData, karbohidrat: e.target.value})}
                                               className="w-full bg-gray-50 border-none rounded-xl p-3 text-center text-sm font-bold"/>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-4 pt-6 border-t border-pink-50">
                                <button type="button" onClick={closeModal}
                                        className="px-6 py-2 text-sm font-bold text-gray-400 hover:text-pink-600 transition-colors">Batal
                                </button>
                                <button type="submit"
                                        className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-10 py-3 rounded-2xl font-black text-xs shadow-lg shadow-pink-100 active:scale-95 transition-all uppercase tracking-tighter">
                                    {isEditing ? "Simpan Perubahan" : "Simpan Data Baru"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
