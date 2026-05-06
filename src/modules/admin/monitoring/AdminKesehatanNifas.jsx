import { useEffect, useState } from "react";
import { db } from "../../../services/firebase.js";
import { collection, getDocs } from "firebase/firestore";
import { Search, Eye, X, Calendar, Activity, AlertCircle, ThumbsUp, HeartPulse } from "lucide-react";

export default function AdminKesehatanNifas() {
    const [checklists, setChecklists] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedData, setSelectedData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const usersSnapshot = await getDocs(collection(db, "users"));
            const usersMap = {};
            usersSnapshot.forEach((doc) => {
                usersMap[doc.id] = doc.data();
            });

            const checklistRef = collection(db, "checklist_nifas");
            const checklistSnapshot = await getDocs(checklistRef);

            const result = checklistSnapshot.docs.map(doc => {
                const data = doc.data();

                // Jika data lama belum ada field kategori/skor_ya, kita hitung ulang sebagai fallback
                const totalYa = data.skor_ya !== undefined
                    ? data.skor_ya
                    : Object.values(data.jawaban || {}).filter(v => v === 'ya').length;
                const totalTidak = Object.values(data.jawaban || {}).filter(v => v === 'tidak').length;

                let kategori = data.kategori;
                if (!kategori) {
                    if (totalYa >= 10) kategori = "Baik";
                    else if (totalYa >= 6) kategori = "Cukup";
                    else kategori = "Kurang";
                }

                return {
                    id: doc.id,
                    ...data,
                    userData: usersMap[data.userId] || { name: "User Tidak Dikenal", email: "-" },
                    skorYa: totalYa,
                    skorTidak: totalTidak,
                    kategori: kategori
                };
            });

            result.sort((a, b) => (b.tanggal?.seconds || 0) - (a.tanggal?.seconds || 0));
            setChecklists(result);
        } catch (err) {
            console.error(err);
            alert("Gagal memuat data: " + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredData = checklists.filter((item) => {
        const queryText = searchQuery.toLowerCase();
        const name = (item.userData?.username || item.userData?.name || "").toLowerCase();
        return name.includes(queryText);
    });

    const formatDate = (timestamp) => {
        if (!timestamp) return "-";
        return new Date(timestamp.seconds * 1000).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'short', year: 'numeric'
        });
    };

    // Helper untuk merender Badge Kategori
    const renderKategoriBadge = (kategori) => {
        switch(kategori) {
            case "Baik":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-50 text-green-700 border border-green-200 text-[10px] font-black uppercase tracking-widest shadow-sm">
                        <ThumbsUp size={12} /> Baik
                    </span>
                );
            case "Cukup":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-yellow-50 text-yellow-700 border border-yellow-200 text-[10px] font-black uppercase tracking-widest shadow-sm">
                        <HeartPulse size={12} /> Cukup
                    </span>
                );
            case "Kurang":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 text-red-700 border border-red-200 text-[10px] font-black uppercase tracking-widest shadow-sm">
                        <AlertCircle size={12} /> Kurang
                    </span>
                );
            default:
                return <span className="text-gray-400 text-xs">-</span>;
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-8 pb-12">
            {/* HEADER & PENCARIAN */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#D81B60] to-[#FF6B9E]">
                        Monitoring Kesehatan Nifas
                    </h1>
                    <p className="text-gray-500 mt-1">Pantau kepatuhan dan kelengkapan gizi ibu nifas.</p>
                </div>
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Cari nama ibu..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-2xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-pink-400 transition-all shadow-sm text-sm"
                    />
                </div>
            </div>

            {/* TABEL DATA */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-pink-50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-pink-50/50 border-b border-pink-100">
                        <tr>
                            <th className="px-6 py-4 font-black text-[11px] uppercase tracking-widest text-pink-500">Tanggal</th>
                            <th className="px-6 py-4 font-black text-[11px] uppercase tracking-widest text-pink-500">Profil Ibu</th>
                            <th className="px-6 py-4 font-black text-[11px] uppercase tracking-widest text-pink-500 text-center">Skor (Ya/Tidak)</th>
                            <th className="px-6 py-4 font-black text-[11px] uppercase tracking-widest text-pink-500 text-center">Status Nifas</th>
                            <th className="px-6 py-4 font-black text-[11px] uppercase tracking-widest text-pink-500 text-center">Aksi</th>
                        </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-50">
                        {filteredData.map((item) => (
                            <tr key={item.id} className="hover:bg-pink-50/30 transition-colors group">
                                <td className="px-6 py-4 text-gray-500 font-medium whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={14} className="text-pink-400" />
                                        {formatDate(item.tanggal)}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <p className="font-bold text-gray-900 capitalize">
                                        {item.userData?.username || item.userData?.name || "Ibu Tanpa Nama"}
                                    </p>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="inline-flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-xl border border-gray-100">
                                        <span className="text-xs font-bold text-green-600">{item.skorYa} Ya</span>
                                        <div className="w-px h-3 bg-gray-300"></div>
                                        <span className="text-xs font-bold text-red-500">{item.skorTidak} Tidak</span>
                                    </div>
                                </td>
                                {/* 🌟 KOLOM BARU: STATUS NIFAS 🌟 */}
                                <td className="px-6 py-4 text-center">
                                    {renderKategoriBadge(item.kategori)}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex justify-center">
                                        <button
                                            onClick={() => setSelectedData(item)}
                                            className="w-9 h-9 rounded-xl bg-pink-50 text-[#D81B60] hover:bg-[#D81B60] hover:text-white flex items-center justify-center transition-all shadow-sm"
                                            title="Lihat Detail Checklist"
                                        >
                                            <Eye size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    {isLoading && (
                        <div className="py-16 text-center">
                            <div className="w-10 h-10 border-4 border-pink-100 border-t-pink-500 rounded-full animate-spin mx-auto mb-3"></div>
                            <p className="text-sm text-gray-400 font-medium">Memuat data monitoring...</p>
                        </div>
                    )}
                    {!isLoading && filteredData.length === 0 && (
                        <div className="py-16 text-center">
                            <Activity className="mx-auto text-pink-200 mb-3" size={48} />
                            <p className="text-sm text-gray-400 font-medium">Belum ada data checklist yang diinput oleh ibu.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL DETAIL JAWABAN */}
            {selectedData && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-2xl w-full flex flex-col max-h-[90vh] animate-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-50 flex justify-between items-start bg-gradient-to-r from-pink-50 to-white rounded-t-[2.5rem]">
                            <div>
                                <h2 className="text-xl font-black text-gray-900 mb-1">Detail Checklist Nifas</h2>
                                <p className="text-sm font-bold text-pink-500 capitalize mb-2">
                                    Ibu {selectedData.userData?.username || selectedData.userData?.name}
                                </p>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-gray-400 flex items-center gap-1"><Calendar size={12}/> {formatDate(selectedData.tanggal)}</span>
                                    {renderKategoriBadge(selectedData.kategori)}
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedData(null)}
                                className="w-10 h-10 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-400 hover:text-red-500 transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {Object.entries(selectedData.jawaban || {}).map(([key, val]) => (
                                    <div key={key} className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex justify-between items-center">
                                        <span className="text-xs font-bold text-gray-600 capitalize leading-tight w-2/3">
                                            {key.replace(/_/g, " ")}
                                        </span>
                                        <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                                            val === 'ya' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                            {val}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}