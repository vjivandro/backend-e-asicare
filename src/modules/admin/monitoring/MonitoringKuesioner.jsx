import React, { useEffect, useState } from 'react';
import { db } from "../../../services/firebase"; // Sesuaikan path-nya
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { BookOpen, Heart, Search, FileText } from "lucide-react";

export default function MonitoringKuesioner() {
    const [activeTab, setActiveTab] = useState('pengetahuan');
    const [dataPengetahuan, setDataPengetahuan] = useState([]);
    const [dataSikap, setDataSikap] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchKuesionerData();
    }, []);

    const fetchKuesionerData = async () => {
        setLoading(true);
        try {
            // Fetch Pengetahuan
            const qPengetahuan = query(collection(db, "pengetahuan_results"), orderBy("tanggal", "desc"));
            const snapPengetahuan = await getDocs(qPengetahuan);
            const resPengetahuan = snapPengetahuan.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Fetch Sikap
            const qSikap = query(collection(db, "sikap_results"), orderBy("tanggal", "desc"));
            const snapSikap = await getDocs(qSikap);
            const resSikap = snapSikap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            setDataPengetahuan(resPengetahuan);
            setDataSikap(resSikap);
        } catch (error) {
            console.error("Gagal mengambil data monitoring:", error);
        } finally {
            setLoading(false);
        }
    };

    // Format Timestamp Firebase ke format tanggal lokal
    const formatDate = (timestamp) => {
        if (!timestamp) return "-";
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    // Filter pencarian
    const currentData = activeTab === 'pengetahuan' ? dataPengetahuan : dataSikap;
    const filteredData = currentData.filter(item =>
        (item.nama || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8 min-h-screen">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                        Monitoring <span className="text-[#D81B60]">Kuesioner</span>
                    </h1>
                    <p className="mt-1 text-gray-500 text-sm md:text-base">
                        Pantau hasil evaluasi Pengetahuan dan Sikap ibu nifas.
                    </p>
                </div>

                {/* Search Bar */}
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Cari nama ibu..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-2xl pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-pink-400 transition-all shadow-sm text-sm"
                    />
                </div>
            </div>

            {/* TAB NAVIGATION */}
            <div className="flex gap-4 mb-6 border-b border-gray-200 pb-px overflow-x-auto">
                <button
                    onClick={() => setActiveTab('pengetahuan')}
                    className={`flex items-center gap-2 px-6 py-3 font-bold text-sm md:text-base transition-colors border-b-2 whitespace-nowrap ${
                        activeTab === 'pengetahuan' ? "border-[#D81B60] text-[#D81B60]" : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                >
                    <BookOpen size={18} /> Hasil Pengetahuan
                    <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{dataPengetahuan.length}</span>
                </button>
                <button
                    onClick={() => setActiveTab('sikap')}
                    className={`flex items-center gap-2 px-6 py-3 font-bold text-sm md:text-base transition-colors border-b-2 whitespace-nowrap ${
                        activeTab === 'sikap' ? "border-[#D81B60] text-[#D81B60]" : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                >
                    <Heart size={18} /> Hasil Sikap
                    <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{dataSikap.length}</span>
                </button>
            </div>

            {/* TABEL DATA */}
            <div className="bg-white rounded-[2rem] shadow-xl border border-pink-50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-pink-50/50 border-b border-pink-100">
                        <tr>
                            <th className="px-6 py-5 font-black text-[11px] uppercase tracking-widest text-pink-500">Nama Bunda</th>
                            <th className="px-6 py-5 font-black text-[11px] uppercase tracking-widest text-pink-500">Tanggal Pengisian</th>
                            <th className="px-6 py-5 font-black text-[11px] uppercase tracking-widest text-pink-500 text-center">Skor</th>
                            <th className="px-6 py-5 font-black text-[11px] uppercase tracking-widest text-pink-500 text-center">Persentase</th>
                            <th className="px-6 py-5 font-black text-[11px] uppercase tracking-widest text-pink-500 text-center">Kategori</th>
                            <th className="px-6 py-5 font-black text-[11px] uppercase tracking-widest text-pink-500 text-center">Aksi</th>
                        </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="py-16 text-center">
                                    <div className="w-10 h-10 border-4 border-pink-100 border-t-pink-500 rounded-full animate-spin mx-auto mb-3"></div>
                                    <p className="text-gray-400 font-medium">Memuat data kuesioner...</p>
                                </td>
                            </tr>
                        ) : filteredData.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="py-16 text-center">
                                    <FileText className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                                    <p className="text-gray-400 font-medium">Belum ada data atau pencarian tidak ditemukan.</p>
                                </td>
                            </tr>
                        ) : (
                            filteredData.map((item) => (
                                <tr key={item.id} className="hover:bg-pink-50/30 transition-colors group">
                                    <td className="px-6 py-5 font-bold text-gray-900">{item.nama || "User"}</td>
                                    <td className="px-6 py-5 text-gray-500">{formatDate(item.tanggal)}</td>
                                    <td className="px-6 py-5 text-center font-bold text-gray-700">
                                        {activeTab === 'pengetahuan' ? `${item.skorBenar} / 10` : `${item.totalSkor} / 40`}
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <span className="font-black text-[#D81B60]">{item.nilaiPersen}%</span>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                      <span className={`inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          item.kategori === "Baik" || item.kategori === "Positif" ? "bg-emerald-100 text-emerald-700" :
                              item.kategori === "Cukup" ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"
                      }`}>
                        {item.kategori}
                      </span>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <button
                                            onClick={() => alert(`Fitur lihat detail jawaban ${item.nama} belum dibuat`)}
                                            className="px-4 py-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-[#D81B60] hover:text-white font-bold transition-colors text-xs"
                                        >
                                            Detail
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}