import { useState, useEffect, useRef } from "react";
import { db } from "../../../services/firebase.js";
import { collection, getDocs } from "firebase/firestore";
import { Search, Eye, X, Calendar, Activity, CheckCircle2, Droplets } from "lucide-react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
// import { getKelancaranASI } from "./monitoringService.js"; // Kita gunakan query langsung di bawah agar seragam dan bisa join dengan users

export default function AdminAsi() {
    const [dataAsi, setDataAsi] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedData, setSelectedData] = useState(null);

    // State Filter
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDate, setSelectedDate] = useState();
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const calendarRef = useRef(null);

    // Tutup kalender saat klik di luar
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (calendarRef.current && !calendarRef.current.contains(event.target)) {
                setIsCalendarOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchData = async () => {
        try {
            setIsLoading(true);

            // 1. Ambil data users dulu untuk mendapatkan Nama Ibu
            const usersSnapshot = await getDocs(collection(db, "users"));
            const usersMap = {};
            usersSnapshot.forEach((doc) => {
                usersMap[doc.id] = doc.data();
            });

            // 2. Ambil data kelancaran_asi
            const asiSnapshot = await getDocs(collection(db, "kelancaran_asi"));

            const result = asiSnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    // Gabungkan data relasi user
                    userData: usersMap[data.userId] || { name: "Ibu Tidak Dikenal", email: "-" },
                };
            });

            // Urutkan dari yang terbaru
            result.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
            setDataAsi(result);

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

    // Filter Ganda (Berdasarkan Search Nama ATAU Kalender)
    const filteredData = dataAsi.filter((item) => {
        // Filter Nama
        const queryText = searchQuery.toLowerCase();
        const name = (item.userData?.username || item.userData?.name || "").toLowerCase();
        const matchName = name.includes(queryText);

        // Filter Kalender (DayPicker)
        let matchDate = true;
        if (selectedDate) {
            // Pastikan format YYYY-MM-DD untuk pencocokan yang akurat
            const formattedSelectedDate = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`;
            matchDate = item.tanggal === formattedSelectedDate;
        }

        return matchName && matchDate;
    });

    // Format Tanggal Minimalis untuk Tabel
    const formatTanggalTabel = (tglString) => {
        if (!tglString) return "-";
        const options = { day: 'numeric', month: 'short', year: 'numeric' };
        return new Date(tglString).toLocaleDateString('id-ID', options);
    };

    // Format Tanggal Lengkap (DayPicker & Modal)
    const formatTanggalLengkap = (dateInput) => {
        if (!dateInput) return "";
        const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
        const hari = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
        const bulan = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
        return `${hari[date.getDay()]}, ${String(date.getDate()).padStart(2, "0")} ${bulan[date.getMonth()]} ${date.getFullYear()}`;
    };

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-8 pb-12 font-sans">

            {/* HEADER & PENCARIAN */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#D81B60] to-[#FF6B9E]">
                        Kelancaran ASI
                    </h1>
                    <p className="text-gray-500 mt-1 text-sm">Pantau kelancaran produksi dan pengeluaran ASI ibu.</p>
                </div>

                {/* Filter Controls */}
                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">

                    {/* Search Bar */}
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Cari nama ibu..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-2xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-pink-400 transition-all shadow-sm text-sm"
                        />
                    </div>

                    {/* DayPicker (Custom) */}
                    <div ref={calendarRef} className="relative w-full sm:w-64">
                        <div
                            onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                            className={`w-full bg-white border ${selectedDate ? 'border-pink-400 ring-2 ring-pink-100' : 'border-gray-200'} rounded-2xl px-4 py-2.5 flex items-center justify-between cursor-pointer transition-all shadow-sm`}
                        >
                            <span className={`text-sm truncate ${selectedDate ? 'text-gray-800 font-bold' : 'text-gray-400'}`}>
                                {selectedDate ? formatTanggalLengkap(selectedDate) : "Pilih Tanggal..."}
                            </span>
                            <Calendar size={18} className={selectedDate ? 'text-pink-500' : 'text-gray-400'} />
                        </div>

                        {selectedDate && (
                            <button
                                onClick={(e) => { e.stopPropagation(); setSelectedDate(undefined); setIsCalendarOpen(false); }}
                                className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors p-1"
                                title="Reset Tanggal"
                            >
                                <X size={14} />
                            </button>
                        )}

                        {isCalendarOpen && (
                            <div className="absolute z-50 mt-2 right-0 bg-white shadow-xl rounded-2xl p-2 border border-gray-100 animate-in fade-in slide-in-from-top-2">
                                <DayPicker
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={(date) => {
                                        setSelectedDate(date);
                                        setIsCalendarOpen(false);
                                    }}
                                    modifiersClassNames={{
                                        selected: 'bg-[#D81B60] text-white hover:bg-pink-700 rounded-full font-bold',
                                        today: 'text-pink-600 font-black'
                                    }}
                                />
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* TABEL MODERN */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-pink-50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-pink-50/50 border-b border-pink-100">
                        <tr>
                            <th className="px-6 py-4 font-black text-[11px] uppercase tracking-widest text-pink-500">Tanggal</th>
                            <th className="px-6 py-4 font-black text-[11px] uppercase tracking-widest text-pink-500">Nama Ibu</th>
                            <th className="px-6 py-4 font-black text-[11px] uppercase tracking-widest text-pink-500 text-center">Skor & Kategori</th>
                            <th className="px-6 py-4 font-black text-[11px] uppercase tracking-widest text-pink-500">Rekomendasi Utama</th>
                            <th className="px-6 py-4 font-black text-[11px] uppercase tracking-widest text-pink-500 text-center">Aksi</th>
                        </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-50">
                        {filteredData.map((item) => (
                            <tr key={item.id} className="hover:bg-pink-50/30 transition-colors group">

                                <td className="px-6 py-4 text-gray-500 font-medium whitespace-nowrap">
                                    {formatTanggalTabel(item.tanggal)}
                                </td>

                                <td className="px-6 py-4">
                                    <p className="font-bold text-gray-900 capitalize">
                                        {item.userData?.username || item.userData?.name || "Ibu Tanpa Nama"}
                                    </p>
                                    <p className="text-[10px] text-gray-400 mt-0.5 font-medium">ID: {item.userId.substring(0,8)}...</p>
                                </td>

                                <td className="px-6 py-4 text-center">
                                    <div className="flex flex-col items-center gap-1">
                                        <span className="text-lg font-black text-gray-800">{item.skorTotal || 0}</span>
                                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                            item.kategori?.toLowerCase() === 'baik' ? 'bg-green-100 text-green-700' :
                                                item.kategori?.toLowerCase() === 'kurang' ? 'bg-red-100 text-red-700' :
                                                    'bg-yellow-100 text-yellow-700'
                                        }`}>
                                                {item.kategori || "Cukup"}
                                            </span>
                                    </div>
                                </td>

                                <td className="px-6 py-4">
                                    {Array.isArray(item.rekomendasi) && item.rekomendasi.length > 0 ? (
                                        <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
                                            {item.rekomendasi.slice(0, 2).map((rek, idx) => (
                                                <li key={idx} className="truncate max-w-[200px] xl:max-w-xs">{rek}</li>
                                            ))}
                                            {item.rekomendasi.length > 2 && (
                                                <li className="text-[10px] text-pink-500 font-bold list-none mt-1">
                                                    +{item.rekomendasi.length - 2} catatan lainnya...
                                                </li>
                                            )}
                                        </ul>
                                    ) : (
                                        <span className="text-xs text-gray-400 italic">Tidak ada catatan hambatan</span>
                                    )}
                                </td>

                                <td className="px-6 py-4">
                                    <div className="flex justify-center">
                                        <button
                                            onClick={() => setSelectedData(item)}
                                            className="w-9 h-9 rounded-xl bg-pink-50 text-[#D81B60] hover:bg-[#D81B60] hover:text-white flex items-center justify-center transition-all shadow-sm"
                                            title="Lihat Detail Kelancaran"
                                        >
                                            <Eye size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    {/* Loading State */}
                    {isLoading && (
                        <div className="py-16 text-center">
                            <div className="w-10 h-10 border-4 border-pink-100 border-t-pink-500 rounded-full animate-spin mx-auto mb-3"></div>
                            <p className="text-sm text-gray-400 font-medium">Memuat data kelancaran ASI...</p>
                        </div>
                    )}

                    {/* Empty State */}
                    {!isLoading && filteredData.length === 0 && (
                        <div className="py-16 text-center">
                            <Droplets className="mx-auto text-pink-200 mb-3" size={48} />
                            <p className="text-sm text-gray-400 font-medium">Belum ada data evaluasi yang ditemukan.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL DETAIL DATA */}
            {selectedData && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-2xl w-full flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in duration-200">

                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-50 flex justify-between items-start bg-gradient-to-r from-pink-50 to-white">
                            <div>
                                <h2 className="text-xl font-black text-gray-900 mb-1 flex items-center gap-2">
                                    <Droplets size={22} className="text-pink-500" /> Detail Kelancaran ASI
                                </h2>
                                <p className="text-sm font-bold text-pink-500 capitalize">
                                    Ibu {selectedData.userData?.username || selectedData.userData?.name}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">{formatTanggalLengkap(selectedData.tanggal)}</p>
                            </div>
                            <button
                                onClick={() => setSelectedData(null)}
                                className="w-10 h-10 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-400 hover:text-red-500 transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">

                            {/* Rincian Skor per Kategori */}
                            <div>
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Rincian Skor Penilaian</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl text-center">
                                        <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-1">Nutrisi</p>
                                        <p className="text-2xl font-black text-blue-900">{selectedData.skorKategori?.nutrisi || 0}</p>
                                    </div>
                                    <div className="bg-purple-50 border border-purple-100 p-4 rounded-2xl text-center">
                                        <p className="text-[10px] font-bold text-purple-500 uppercase tracking-wider mb-1">Psikologis</p>
                                        <p className="text-2xl font-black text-purple-900">{selectedData.skorKategori?.psikologis || 0}</p>
                                    </div>
                                    <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl text-center">
                                        <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider mb-1">Perawatan</p>
                                        <p className="text-2xl font-black text-rose-900">{selectedData.skorKategori?.perawatan || 0}</p>
                                    </div>
                                    <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl text-center">
                                        <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wider mb-1">Indikator Bayi</p>
                                        <p className="text-2xl font-black text-amber-900">{selectedData.skorKategori?.indikator_bayi || 0}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Daftar Rekomendasi / Hambatan */}
                            <div>
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Analisis & Rekomendasi</h3>
                                {Array.isArray(selectedData.rekomendasi) && selectedData.rekomendasi.length > 0 ? (
                                    <div className="space-y-2">
                                        {selectedData.rekomendasi.map((rek, idx) => (
                                            <div key={idx} className="flex items-start gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                                <CheckCircle2 size={16} className="text-pink-500 flex-shrink-0 mt-0.5" />
                                                <p className="text-sm text-gray-700 font-medium leading-relaxed">{rek}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-green-600 font-medium italic bg-green-50 p-4 rounded-xl text-center border border-green-100">
                                        Produksi dan pengeluaran ASI berjalan sangat optimal. Tidak ditemukan hambatan signifikan.
                                    </p>
                                )}
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
