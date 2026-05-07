import React, { useState, useEffect } from 'react';
import { db } from "../../../services/firebase.js"; // Sesuaikan path jika perlu
import { collection, getDocs, doc, setDoc, serverTimestamp, query, orderBy, deleteDoc } from "firebase/firestore";
import { Plus, Search, ChevronLeft, ChevronRight, X, Edit, Trash2, Activity, Flame, Droplet, Wheat, UserCircle2, Calendar } from 'lucide-react';
import { getAKG } from "./monitoringService.js"; // Sesuaikan path jika perlu

export default function AdminGizi() {
  // ==========================================
  // 1. STATE GLOBAL & TABS
  // ==========================================
  const [activeTab, setActiveTab] = useState("master"); // "master" | "monitoring"

  // ==========================================
  // 2. STATE & LOGIKA: MASTER AKG IBU
  // ==========================================
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

  // ==========================================
  // 3. STATE & LOGIKA: PANTAU TARGET GIZI USER
  // ==========================================
  const [dataTarget, setDataTarget] = useState([]);
  const [loadingTarget, setLoadingTarget] = useState(true);
  const [searchTarget, setSearchTarget] = useState("");

  const fetchTargetData = async () => {
    setLoadingTarget(true);
    try {
      // GANTI "target_gizi" SESUAI COLLECTION MAS JURIS
      const q = query(collection(db, "target_gizi"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const fetchedData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDataTarget(fetchedData);
    } catch (error) {
      console.error("Gagal mengambil data target gizi:", error);
    } finally {
      setLoadingTarget(false);
    }
  };

  const filteredTarget = dataTarget.filter(item =>
      (item.userName || "").toLowerCase().includes(searchTarget.toLowerCase())
  );

  // ==========================================
  // 4. EFEK INISIALISASI
  // ==========================================
  useEffect(() => {
    fetchMasterData();
    fetchTargetData();
  }, []);


  // ==========================================
  // RENDER HALAMAN
  // ==========================================
  return (
      <div className="p-4 sm:p-8 bg-gray-50 min-h-screen font-sans">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* 🌟 HEADER & TOMBOL TAMBAH 🌟 */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#D81B60] to-[#FF6B9E]">
                Manajemen Gizi
              </h1>
              <p className="text-gray-500 mt-1">Kelola parameter AKG dan pantau target gizi harian user.</p>
            </div>

            {/* Tombol Tambah HANYA muncul di Tab Master AKG */}
            {activeTab === "master" && (
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#D81B60] to-[#FF6B9E] hover:shadow-lg hover:shadow-pink-200 text-white px-6 py-2.5 rounded-xl font-bold transition-all"
                >
                  <Plus size={18} /> Tambah Data AKG
                </button>
            )}
          </div>

          {/* 🌟 TAB SWITCHER (DESAIN PILL) 🌟 */}
          <div className="bg-white p-1.5 rounded-2xl inline-flex shadow-sm border border-pink-50 mb-2 overflow-x-auto max-w-full">
            <button
                onClick={() => setActiveTab("master")}
                className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
                    activeTab === "master"
                        ? "bg-pink-100 text-[#D81B60] shadow-sm"
                        : "text-gray-500 hover:text-pink-500 hover:bg-pink-50/50"
                }`}
            >
              Master AKG Ibu
            </button>
            <button
                onClick={() => setActiveTab("monitoring")}
                className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
                    activeTab === "monitoring"
                        ? "bg-pink-100 text-[#D81B60] shadow-sm"
                        : "text-gray-500 hover:text-pink-500 hover:bg-pink-50/50"
                }`}
            >
              Pantau Target Gizi User
            </button>
          </div>


          {/* ==========================================
                    TAB 1: KONTEN MASTER AKG
                ========================================== */}
          {activeTab === "master" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* Toolbar Master */}
                <div className="bg-white p-4 rounded-2xl border border-pink-50 shadow-sm flex flex-col lg:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-300" size={18} />
                    <input
                        type="text"
                        placeholder="Cari berdasarkan rentang usia..."
                        className="w-full pl-12 pr-4 py-3 bg-pink-50/20 border-none rounded-xl text-sm focus:ring-2 focus:ring-pink-200 outline-none transition-all"
                        value={searchMaster}
                        onChange={(e) => setSearchMaster(e.target.value)}
                    />
                  </div>
                  <select
                      className="bg-gray-50 border-none rounded-xl text-sm px-4 py-2 outline-none focus:ring-2 focus:ring-pink-200 cursor-pointer"
                      value={itemsPerPage}
                      onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                  >
                    <option value={10}>Tampilkan 10</option>
                    <option value={20}>Tampilkan 20</option>
                    <option value={50}>Tampilkan 50</option>
                  </select>
                </div>

                {/* Tabel Master */}
                <div className="bg-white rounded-[2rem] border border-pink-50 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-pink-50/30 text-pink-400 uppercase text-[10px] font-black tracking-widest border-b border-pink-50">
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
                          <tr><td colSpan="6" className="px-6 py-10 text-center text-gray-400"><Activity className="w-6 h-6 animate-spin mx-auto mb-2 text-pink-400" />Memuat data...</td></tr>
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
                                    <button onClick={() => handleEdit(item)} className="p-2 text-blue-400 hover:bg-blue-50 rounded-lg transition-all"><Edit size={16} /></button>
                                    <button onClick={() => handleDelete(item.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16} /></button>
                                  </div>
                                </td>
                              </tr>
                          ))
                      ) : (
                          <tr><td colSpan="6" className="px-6 py-10 text-center text-gray-400">Tidak ada data AKG ditemukan.</td></tr>
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
                      <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="p-2.5 border border-pink-100 rounded-xl hover:bg-pink-50 disabled:opacity-20 transition-all"><ChevronLeft size={18} /></button>
                      <button disabled={currentPage === totalPagesMaster} onClick={() => setCurrentPage(prev => prev + 1)} className="p-2.5 border border-pink-100 rounded-xl hover:bg-pink-50 disabled:opacity-20 transition-all"><ChevronRight size={18} /></button>
                    </div>
                  </div>
                </div>
              </div>
          )}


          {/* ==========================================
                    TAB 2: KONTEN PANTAU TARGET GIZI USER
                ========================================== */}
          {activeTab === "monitoring" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* Toolbar Monitoring */}
                <div className="bg-white p-4 rounded-2xl border border-pink-50 shadow-sm flex flex-col lg:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-300" size={18} />
                    <input
                        type="text"
                        placeholder="Cari nama ibu nifas..."
                        className="w-full pl-12 pr-4 py-3 bg-pink-50/20 border-none rounded-xl text-sm focus:ring-2 focus:ring-pink-200 outline-none transition-all"
                        value={searchTarget}
                        onChange={(e) => setSearchTarget(e.target.value)}
                    />
                  </div>
                </div>

                {/* Tabel Monitoring */}
                <div className="bg-white rounded-[2rem] shadow-sm border border-pink-50 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-pink-50/30 text-pink-500 uppercase tracking-wider text-[10px] font-bold border-b border-pink-50">
                      <tr>
                        <th className="p-5 w-10 text-center">No</th>
                        <th className="p-5">Profil Ibu</th>
                        <th className="p-5">Status Menyusui</th>
                        <th className="p-5">Target Harian (AKG)</th>
                        <th className="p-5">Tgl Hitung</th>
                      </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 text-gray-700">
                      {loadingTarget ? (
                          <tr><td colSpan="5" className="p-10 text-center text-gray-400"><Activity className="w-6 h-6 animate-spin mx-auto mb-2 text-pink-400" />Memuat data...</td></tr>
                      ) : filteredTarget.length > 0 ? (
                          filteredTarget.map((item, index) => (
                              <tr key={item.id} className="hover:bg-pink-50/10 transition-colors group">
                                <td className="p-5 text-center font-medium text-gray-400">{index + 1}</td>
                                <td className="p-5">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-100 to-rose-100 flex items-center justify-center text-pink-500">
                                      <UserCircle2 size={24} />
                                    </div>
                                    <div>
                                      <div className="font-bold text-gray-900 text-base capitalize">{item.userName || "Nama Tidak Terdata"}</div>
                                      <div className="text-gray-500 text-xs mt-0.5">Usia: <span className="font-semibold text-gray-700">{item.umur || "-"} Tahun</span></div>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-5">
                                                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold border border-blue-100">
                                                            {item.statusMenyusui || "Belum ada data"}
                                                        </span>
                                </td>
                                {/* Target Harian (Nutrisi) dengan Desain Baru */}
                                <td className="p-5">
                                  <div className="grid grid-cols-2 gap-3 w-max">

                                    {/* Energi */}
                                    <div className="flex flex-col bg-orange-50/50 px-3 py-1.5 rounded-xl border border-orange-100 shadow-sm">
                                      <div className="flex items-center gap-1.5 text-[9px] font-black text-orange-500 uppercase tracking-widest mb-0.5">
                                        <Flame size={12} /> Energi
                                      </div>
                                      <div className="text-sm font-black text-gray-800">
                                        {item.energi || 0} <span className="text-[10px] font-bold text-gray-400">kkal</span>
                                      </div>
                                    </div>

                                    {/* Protein */}
                                    <div className="flex flex-col bg-rose-50/50 px-3 py-1.5 rounded-xl border border-rose-100 shadow-sm">
                                      <div className="flex items-center gap-1.5 text-[9px] font-black text-rose-500 uppercase tracking-widest mb-0.5">
                                        <Activity size={12} /> Protein
                                      </div>
                                      <div className="text-sm font-black text-gray-800">
                                        {item.protein || 0} <span className="text-[10px] font-bold text-gray-400">gram</span>
                                      </div>
                                    </div>

                                    {/* Lemak */}
                                    <div className="flex flex-col bg-amber-50/50 px-3 py-1.5 rounded-xl border border-amber-100 shadow-sm">
                                      <div className="flex items-center gap-1.5 text-[9px] font-black text-amber-500 uppercase tracking-widest mb-0.5">
                                        <Droplet size={12} /> Lemak
                                      </div>
                                      <div className="text-sm font-black text-gray-800">
                                        {item.lemak || 0} <span className="text-[10px] font-bold text-gray-400">gram</span>
                                      </div>
                                    </div>

                                    {/* Karbohidrat */}
                                    <div className="flex flex-col bg-indigo-50/50 px-3 py-1.5 rounded-xl border border-indigo-100 shadow-sm">
                                      <div className="flex items-center gap-1.5 text-[9px] font-black text-indigo-500 uppercase tracking-widest mb-0.5">
                                        <Wheat size={12} /> Karbo
                                      </div>
                                      <div className="text-sm font-black text-gray-800">
                                        {item.karbo || 0} <span className="text-[10px] font-bold text-gray-400">gram</span>
                                      </div>
                                    </div>

                                  </div>
                                </td>
                                <td className="p-5 text-gray-500 text-xs">
                                  <div className="flex items-center gap-1.5">
                                    <Calendar size={14} className="text-gray-400" />
                                    {item.createdAt ? new Date(item.createdAt.seconds * 1000).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : "-"}
                                  </div>
                                </td>
                              </tr>
                          ))
                      ) : (
                          <tr><td colSpan="5" className="p-10 text-center text-gray-400">Belum ada data target gizi dari user.</td></tr>
                      )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
          )}

        </div>

        {/* ==========================================
                MODAL EDIT/ADD MASTER AKG (Hanya untuk Tab 1)
            ========================================== */}
        {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pink-900/20 backdrop-blur-md">
              <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in duration-300 border border-pink-50">
                <div className="flex justify-between items-center p-6 bg-gradient-to-r from-pink-50 to-white border-b border-pink-100">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{isEditing ? "Ubah Parameter AKG" : "Tambah Data AKG Baru"}</h3>
                    <p className="text-xs text-pink-400 font-medium mt-0.5">Atur ambang batas nutrisi berdasarkan usia </p>
                  </div>
                  <button onClick={closeModal} className="w-10 h-10 flex items-center justify-center rounded-full text-gray-300 hover:bg-pink-50 hover:text-pink-600 transition-all"><X size={20}/></button>
                </div>
                <form onSubmit={handleMasterSubmit} className="p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-pink-300 uppercase tracking-widest ml-1">Usia Minimal</label>
                      <input type="number" value={formData.usia_min} onChange={(e) => setFormData({...formData, usia_min: e.target.value})} className="w-full bg-pink-50/30 border-2 border-pink-50 rounded-2xl p-3.5 text-sm font-bold" placeholder="Contoh: 19" required />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-pink-300 uppercase tracking-widest ml-1">Usia Maksimal</label>
                      <input type="number" value={formData.usia_max} onChange={(e) => setFormData({...formData, usia_max: e.target.value})} className="w-full bg-pink-50/30 border-2 border-pink-50 rounded-2xl p-3.5 text-sm font-bold" placeholder="Contoh: 29" required />
                    </div>

                    <div className="md:col-span-2 pt-2 flex items-center gap-3">
                      <span className="text-[9px] font-black text-pink-400 uppercase tracking-widest whitespace-nowrap">Target Nutrisi Harian </span>
                      <div className="w-full h-px bg-pink-100"></div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 col-span-2 gap-4">
                      <div className="space-y-1 text-center">
                        <label className="text-[9px] font-black text-pink-300 uppercase block">Kalori</label>
                        <input type="number" step="0.1" value={formData.energi} onChange={(e) => setFormData({...formData, energi: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl p-3 text-center text-sm font-bold" />
                      </div>
                      <div className="space-y-1 text-center">
                        <label className="text-[9px] font-black text-pink-300 uppercase block">Protein</label>
                        <input type="number" step="0.1" value={formData.protein} onChange={(e) => setFormData({...formData, protein: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl p-3 text-center text-sm font-bold" />
                      </div>
                      <div className="space-y-1 text-center">
                        <label className="text-[9px] font-black text-pink-300 uppercase block">Lemak</label>
                        <input type="number" step="0.1" value={formData.lemak} onChange={(e) => setFormData({...formData, lemak: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl p-3 text-center text-sm font-bold" />
                      </div>
                      <div className="space-y-1 text-center">
                        <label className="text-[9px] font-black text-pink-300 uppercase block">Karbo</label>
                        <input type="number" step="0.1" value={formData.karbohidrat} onChange={(e) => setFormData({...formData, karbohidrat: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl p-3 text-center text-sm font-bold" />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-4 pt-6 border-t border-pink-50">
                    <button type="button" onClick={closeModal} className="px-6 py-2 text-sm font-bold text-gray-400 hover:text-pink-600 transition-colors">Batal</button>
                    <button type="submit" className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-10 py-3 rounded-2xl font-black text-xs shadow-lg shadow-pink-100 active:scale-95 transition-all uppercase tracking-tighter">
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
