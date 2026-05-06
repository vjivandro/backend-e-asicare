import { useState, useEffect } from "react";
import { Check, X, Info, Activity, AlertCircle, HeartPulse, ThumbsUp, ClipboardEdit, History, Calendar } from "lucide-react";
import { db, auth } from "../../../services/firebase.js";
import { collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";

export default function ChecklistKesehatan() {
    // State Tab Navigasi
    const [activeTab, setActiveTab] = useState("isi"); // "isi" atau "riwayat"

    // State Form & Evaluasi
    const [answers, setAnswers] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [hasilPenilaian, setHasilPenilaian] = useState(null);

    // State Riwayat
    const [historyData, setHistoryData] = useState([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    // ==========================================
    // LOGIKA TAB RIWAYAT
    // ==========================================
    const fetchHistory = async () => {
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        setIsLoadingHistory(true);
        try {
            // Ambil data khusus milik user yang sedang login
            const q = query(
                collection(db, "checklist_nifas"),
                where("userId", "==", currentUser.uid)
            );

            const querySnapshot = await getDocs(q);
            let data = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Urutkan dari yang terbaru (mencegah error missing index di Firebase)
            data.sort((a, b) => (b.tanggal?.seconds || 0) - (a.tanggal?.seconds || 0));
            setHistoryData(data);
        } catch (error) {
            console.error("Gagal memuat riwayat:", error);
        } finally {
            setIsLoadingHistory(false);
        }
    };

    // Panggil data riwayat setiap kali tab "riwayat" diklik
    useEffect(() => {
        if (activeTab === "riwayat") {
            fetchHistory();
        }
    }, [activeTab]);

    const formatDate = (timestamp) => {
        if (!timestamp) return "-";
        return new Date(timestamp.seconds * 1000).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    // ==========================================
    // LOGIKA FORM EVALUASI
    // ==========================================
    const handleAnswer = (itemId, value) => {
        setAnswers(prev => ({ ...prev, [itemId]: value }));
    };

    const handleSimpan = async () => {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            alert("Sesi Anda telah habis. Silakan login kembali.");
            return;
        }

        if (Object.keys(answers).length < 12) {
            const konfirmasi = confirm("Ada komponen yang belum diisi. Yakin ingin menyimpan sekarang?");
            if (!konfirmasi) return;
        }

        const totalYa = Object.values(answers).filter(val => val === 'ya').length;
        let kategori = "";
        let pesan = "";
        let temaModal = {};

        if (totalYa >= 10) {
            kategori = "Baik";
            pesan = "Luar biasa Bunda! Asupan gizi dan keamanan pangan Bunda sudah sangat baik. Pertahankan terus demi kesehatan Bunda dan kualitas ASI untuk si Kecil!";
            temaModal = { bg: "bg-green-50", text: "text-green-700", grad: "from-green-400 to-emerald-500", icon: <ThumbsUp size={32} className="text-white"/> };
        } else if (totalYa >= 6) {
            kategori = "Cukup";
            pesan = "Kondisi Bunda cukup baik, tapi yuk coba tingkatkan lagi variasi makanan dan kebersihannya agar pemulihan pascasalin jauh lebih maksimal ya!";
            temaModal = { bg: "bg-yellow-50", text: "text-yellow-700", grad: "from-yellow-400 to-orange-400", icon: <HeartPulse size={32} className="text-white"/> };
        } else {
            kategori = "Kurang";
            pesan = "Mohon perhatian Bunda, kelengkapan gizi Bunda masih kurang. Sangat disarankan untuk memperbaiki asupan makanan harian. Jangan ragu konsultasi ke Bidan jika merasa kurang sehat ya.";
            temaModal = { bg: "bg-red-50", text: "text-red-700", grad: "from-red-400 to-rose-500", icon: <AlertCircle size={32} className="text-white"/> };
        }

        try {
            setIsSaving(true);
            await addDoc(collection(db, "checklist_nifas"), {
                userId: currentUser.uid,
                tanggal: serverTimestamp(),
                jawaban: answers,
                skor_ya: totalYa,
                kategori: kategori
            });

            setHasilPenilaian({ skor: totalYa, kategori, pesan, temaModal });
            setShowModal(true);
        } catch (error) {
            alert("Gagal menyimpan data: " + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const resetForm = () => {
        setAnswers({});
        setShowModal(false);
        setHasilPenilaian(null);
        setActiveTab("riwayat"); // Langsung pindah ke tab riwayat setelah selesai simpan!
    };

    const checklistData = [
        {
            id: "jenisMakanan",
            title: "CHECKLIST JENIS MAKANAN",
            items: [
                { id: "pokok", label: "Makanan Pokok", icon: "🍚" },
                { id: "hewani", label: "Protein Hewani", icon: "🐟" },
                { id: "nabati", label: "Protein Nabati", icon: "🥜" },
                { id: "sayur", label: "Sayur", icon: "🥬" },
                { id: "buah", label: "Buah", icon: "🍎" },
            ]
        },
        {
            id: "variasiMakanan",
            title: "VARIASI JENIS MAKANAN",
            subtitle: "Bergantian atau tidak antara ayam/sapi/ikan, tempe/tahu, sayur hijau/kuning",
            items: [
                { id: "var_hewani", label: "Protein hewani", icon: "🥩" },
                { id: "var_nabati", label: "Protein nabati", icon: "🧈" },
                { id: "var_sayur", label: "Sayur", icon: "🥗" },
            ]
        },
        {
            id: "keamananPangan",
            title: "KEAMANAN PANGAN",
            items: [
                { id: "kebersihan", label: "Kebersihan bahan, alat, dan lingkungan", icon: "🧼" },
                { id: "pengolahan", label: "Pengolahan makanan yang benar", icon: "🍳" },
                { id: "penyimpanan", label: "Penyimpanan makanan sesuai standar", icon: "📦" },
                { id: "tambahan", label: "Penggunaan bahan tambahan yang aman", icon: "🛡️" },
            ]
        }
    ];

    // Helper Badge Kategori untuk Riwayat
    const renderKategoriBadge = (kategori) => {
        switch(kategori) {
            case "Baik": return <span className="flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-lg text-[10px] font-black uppercase tracking-wider"><ThumbsUp size={12} /> Baik</span>;
            case "Cukup": return <span className="flex items-center gap-1.5 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-[10px] font-black uppercase tracking-wider"><HeartPulse size={12} /> Cukup</span>;
            case "Kurang": return <span className="flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-700 rounded-lg text-[10px] font-black uppercase tracking-wider"><AlertCircle size={12} /> Kurang</span>;
            default: return null;
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 p-4 md:p-6 mt-2 font-sans pb-24 relative">

            {/* HEADER */}
            <div className="flex justify-between items-center mb-2">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
                        Checklist <span className="text-[#D81B60]">Kesehatan</span>
                    </h1>
                    <p className="mt-1.5 text-gray-500 text-sm font-medium">
                        Pantau kelengkapan gizi dan keamanan pangan harian Anda di sini.
                    </p>
                </div>
                <div className="hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-pink-50 text-pink-300">
                    <Activity size={24} />
                </div>
            </div>

            {/* 🌟 TAB SWITCHER (SESUAI GAMBAR) 🌟 */}
            <div className="bg-white p-1.5 rounded-2xl inline-flex shadow-sm border border-pink-50 max-w-full overflow-x-auto">
                <button
                    onClick={() => setActiveTab("isi")}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
                        activeTab === "isi"
                            ? "bg-pink-50 text-[#D81B60] shadow-sm"
                            : "text-gray-400 hover:text-pink-500 hover:bg-pink-50/50"
                    }`}
                >
                    <ClipboardEdit size={18} /> Isi Evaluasi
                </button>
                <button
                    onClick={() => setActiveTab("riwayat")}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
                        activeTab === "riwayat"
                            ? "bg-pink-50 text-[#D81B60] shadow-sm"
                            : "text-gray-400 hover:text-pink-500 hover:bg-pink-50/50"
                    }`}
                >
                    <History size={18} /> Riwayat Saya
                </button>
            </div>

            {/* ==========================================
                KONTEN TAB 1: ISI EVALUASI
            ========================================== */}
            {activeTab === "isi" && (
                <div className="animate-in fade-in duration-300 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
                        {checklistData.map((section) => (
                            <div key={section.id} className="bg-white rounded-[2rem] shadow-sm border border-pink-50 overflow-hidden flex flex-col h-full hover:shadow-md hover:border-pink-100 transition-all">
                                <div className="bg-gradient-to-r from-pink-400 to-[#FF6B9E] p-4 text-center flex-shrink-0">
                                    <h2 className="text-white font-black text-sm uppercase tracking-widest">{section.title}</h2>
                                    {section.subtitle && <p className="text-pink-50 text-[10px] mt-1.5 leading-tight max-w-[95%] mx-auto font-medium">{section.subtitle}</p>}
                                </div>
                                <div className="p-3 flex-grow flex flex-col">
                                    <div className="hidden sm:grid grid-cols-12 gap-2 px-3 py-2 border-b border-gray-50 mb-2">
                                        <div className="col-span-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Komponen</div>
                                        <div className="col-span-2 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Ya</div>
                                        <div className="col-span-2 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Tidak</div>
                                    </div>
                                    <div className="space-y-1">
                                        {section.items.map((item) => (
                                            <div key={item.id} className="flex flex-col sm:grid sm:grid-cols-12 gap-3 sm:gap-2 items-center p-3 hover:bg-pink-50/50 rounded-2xl transition-colors">
                                                <div className="col-span-8 flex items-center gap-3 w-full">
                                                    <span className="text-xl bg-gray-50 w-10 h-10 flex items-center justify-center rounded-xl shadow-sm border border-gray-100 flex-shrink-0">{item.icon}</span>
                                                    <span className="text-xs font-bold text-gray-700 leading-snug">{item.label}</span>
                                                </div>
                                                <div className="col-span-4 flex items-center justify-center gap-2 w-full mt-2 sm:mt-0">
                                                    <button onClick={() => handleAnswer(item.id, 'ya')} className={`flex-1 sm:w-10 flex items-center justify-center py-2.5 sm:py-2 rounded-xl border-2 transition-all font-black text-xs uppercase ${answers[item.id] === 'ya' ? 'bg-green-100 border-green-500 text-green-600 shadow-sm scale-105' : 'bg-white border-gray-100 text-gray-300 hover:border-green-200 hover:text-green-400'}`}>
                                                        <Check size={16} className={answers[item.id] === 'ya' ? 'block sm:hidden mr-1' : 'hidden'} />
                                                        <span className="sm:hidden">Ya</span>
                                                        <Check size={16} className="hidden sm:block" strokeWidth={3} />
                                                    </button>
                                                    <button onClick={() => handleAnswer(item.id, 'tidak')} className={`flex-1 sm:w-10 flex items-center justify-center py-2.5 sm:py-2 rounded-xl border-2 transition-all font-black text-xs uppercase ${answers[item.id] === 'tidak' ? 'bg-red-100 border-red-500 text-red-600 shadow-sm scale-105' : 'bg-white border-gray-100 text-gray-300 hover:border-red-200 hover:text-red-400'}`}>
                                                        <X size={16} className={answers[item.id] === 'tidak' ? 'block sm:hidden mr-1' : 'hidden'} />
                                                        <span className="sm:hidden">Tidak</span>
                                                        <X size={16} className="hidden sm:block" strokeWidth={3} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Info & Tombol Simpan */}
                    <div className="bg-pink-50 rounded-[2rem] p-6 md:p-8 border border-pink-100 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-sm">
                        <div className="flex flex-col sm:flex-row items-start gap-4 text-pink-600 z-10 w-full md:w-2/3">
                            <Info size={28} className="flex-shrink-0 mt-0.5 hidden sm:block" />
                            <div>
                                <p className="text-sm font-bold leading-relaxed mb-3">Kesehatan ibu dan keamanan pangan Anda telah disesuaikan dengan standar e-ASI Care. Ayo penuhi checklist ini untuk pemulihan optimal!</p>
                                <div className="inline-flex items-center gap-2 text-[#D81B60] bg-white px-4 py-2 rounded-xl border border-pink-200 shadow-sm">
                                    <p className="text-[10px] font-black uppercase tracking-wider">Ket: Pastikan asupan sesuai prinsip gizi seimbang</p>
                                </div>
                            </div>
                        </div>
                        <div className="z-10 w-full md:w-1/3 flex justify-end">
                            <button onClick={handleSimpan} disabled={isSaving} className="w-full md:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-[#D81B60] to-[#FF6B9E] text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-pink-200 hover:scale-[1.02] active:scale-95 transition-all">
                                {isSaving ? "Menyimpan..." : (<><Check size={18} strokeWidth={3} /> Simpan Data</>)}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ==========================================
                KONTEN TAB 2: RIWAYAT SAYA
            ========================================== */}
            {activeTab === "riwayat" && (
                <div className="animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2rem] border border-pink-50 p-6 shadow-sm min-h-[300px]">
                        <h3 className="text-lg font-black text-gray-800 mb-6 flex items-center gap-2">
                            <History size={20} className="text-pink-500"/> Riwayat Evaluasi Anda
                        </h3>

                        {isLoadingHistory ? (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                <Activity className="animate-spin text-pink-400 mb-2" size={32} />
                                <span className="text-sm font-medium">Memuat data riwayat...</span>
                            </div>
                        ) : historyData.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {historyData.map((item) => (
                                    <div key={item.id} className="bg-gray-50 p-5 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-2 text-gray-500 text-xs font-bold">
                                                <Calendar size={14} className="text-pink-400"/> {formatDate(item.tanggal)}
                                            </div>
                                            {renderKategoriBadge(item.kategori)}
                                        </div>
                                        <div className="bg-white px-4 py-3 rounded-xl border border-gray-100 flex justify-center gap-4">
                                            <div className="text-center">
                                                <span className="block text-xl font-black text-green-500">{item.skor_ya || 0}</span>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase">Skor Ya</span>
                                            </div>
                                            <div className="w-px bg-gray-100"></div>
                                            <div className="text-center">
                                                <span className="block text-xl font-black text-red-400">{12 - (item.skor_ya || 0)}</span>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase">Skor Tidak</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                <ClipboardEdit size={48} className="text-pink-200 mb-3" />
                                <span className="text-sm font-medium">Anda belum pernah mengisi evaluasi kesehatan.</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ==========================================
                POP-UP MODAL HASIL PENILAIAN
            ========================================== */}
            {showModal && hasilPenilaian && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 relative border border-gray-100">
                        <div className={`p-8 flex flex-col items-center text-center relative overflow-hidden bg-gradient-to-b ${hasilPenilaian.temaModal.grad}`}>
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-2xl"></div>
                            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-black/10 rounded-full blur-xl"></div>
                            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md mb-4 shadow-inner border border-white/30 z-10">
                                {hasilPenilaian.temaModal.icon}
                            </div>
                            <h3 className="text-3xl font-black text-white tracking-tight z-10 drop-shadow-md">{hasilPenilaian.kategori}</h3>
                            <p className="text-white/90 font-bold text-sm uppercase tracking-widest mt-1 z-10">Skor Bunda: {hasilPenilaian.skor} / 12</p>
                        </div>
                        <div className={`p-8 text-center bg-gradient-to-b from-white to-${hasilPenilaian.temaModal.bg.split('-')[1]}-50/30`}>
                            <p className="text-gray-600 font-medium leading-relaxed mb-8">{hasilPenilaian.pesan}</p>
                            <button onClick={resetForm} className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all text-white bg-gradient-to-r ${hasilPenilaian.temaModal.grad}`}>
                                Selesai & Lihat Riwayat
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}