import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import heroMom from "../../../assets/hero-mom.png";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db, auth } from "../../../services/firebase";
import { getDailyIntake } from "../monitoring/userMonitoringService";
import { Utensils, Flame, Zap, Droplets, ChevronRight, Clock } from "lucide-react";

export default function Home({ user }) {
    const navigate = useNavigate();
    const [latestEdukasi, setLatestEdukasi] = useState([]);
    const [giziData, setGiziData] = useState({
        consumed: { energi: 0, protein: 0, lemak: 0, karbohidrat: 0 },
        target: { energi: 2250, protein: 80, lemak: 70, karbohidrat: 350 }
    });

    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch Edukasi
                const qEdu = query(collection(db, "edukasi"), orderBy("created_at", "desc"), limit(3));
                const snapEdu = await getDocs(qEdu);
                setLatestEdukasi(snapEdu.docs.map(doc => ({ id: doc.id, ...doc.data() })));

                // Fetch Gizi Hari Ini
                if (auth.currentUser) {
                    const intake = await getDailyIntake(auth.currentUser.uid, today);
                    setGiziData(prev => ({
                        ...prev,
                        consumed: intake.total_harian
                    }));
                }
            } catch (error) {
                console.error("Error dashboard:", error);
            }
        };

        fetchDashboardData();
    }, [today]);

    // Helper Progress & Status Gizi sesuai dokumen referensi client
    const getStatusInfo = (current, target) => {
        const percent = Math.min(Math.round((current / target) * 100), 100);
        if (percent < 80) return { percent, label: `KURANG (${percent}%)`, color: "text-rose-500", dot: "bg-rose-500", note: "kurang dari kebutuhan" };
        if (percent <= 110) return { percent, label: "CUKUP", color: "text-emerald-500", dot: "bg-emerald-500", note: "sudah cukup" };
        return { percent, label: "LEBIH", color: "text-amber-500", dot: "bg-amber-500", note: "melebihi kebutuhan" };
    };

    const energyStatus = getStatusInfo(giziData.consumed.energi, giziData.target.energi);
    const proteinStatus = getStatusInfo(giziData.consumed.protein, giziData.target.protein);
    const lemakStatus = getStatusInfo(giziData.consumed.lemak, giziData.target.lemak);
    const karboStatus = getStatusInfo(giziData.consumed.karbohidrat, giziData.target.karbohidrat);

    const renderThumbnail = (media) => {
        if (!media) return "https://placehold.co/600x400/EEE/31343C";
        if (media.includes("youtube.com") || media.includes("youtu.be")) {
            const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|&v=)([^#&?]*).*/;
            const match = media.match(regExp);
            const videoId = (match && match[2].length === 11) ? match[2] : null;
            if (videoId) return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        }
        return media;
    };

    const getKategoriName = (id) => {
        const mapping = { 13: "Kelancaran ASI", 12: "Prilaku Menyusui", 11: "Gizi Seimbang" };
        return mapping[id] || "Umum";
    };

    return (
        <div className="max-w-7xl mx-auto space-y-10 p-6 mt-2 font-sans pb-20">
            {/* --- HERO SECTION (MILIK MAS JURIS - JANGAN DIUBAH) --- */}
            <div className="relative overflow-hidden bg-white rounded-[2.5rem] shadow-sm border border-pink-50 flex items-center min-h-[220px] group">
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-pink-50 rounded-full blur-3xl opacity-60"></div>
                <div className="absolute -bottom-10 right-20 w-32 h-32 bg-indigo-50 rounded-full blur-3xl opacity-60"></div>
                <div className="relative z-20 px-8 md:px-12 py-8 w-full md:w-2/3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-100 text-[#D81B60] text-[10px] font-bold uppercase tracking-widest mb-4">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span>
                        </span>
                        Update Hari Ini
                    </div>
                    <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 leading-tight">
                        Selamat Datang, <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D81B60] to-[#FF6B9E]">
                            {user?.username || "Ibu Hebat"}!
                        </span>
                    </h1>
                    <p className="text-sm text-gray-500 mt-3 max-w-md leading-relaxed">
                        Mari pantau gizi dan tumbuh kembang buah hati dengan penuh cinta setiap hari.
                    </p>
                </div>
                <div className="absolute right-0 bottom-0 w-1/3 hidden md:flex items-center justify-center">
                    <img src={heroMom} alt="hero" className="w-56 md:w-[260px] relative z-10 transition-transform duration-500 group-hover:-translate-y-2" />
                </div>
            </div>

            {/* --- MONITORING GIZI DENGAN VALUE LENGKAP --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* 1. Panel Energi Utama (Mempertahankan UI image_7511c2.jpg) */}
                {/* 1. Panel Energi Utama */}
                <div className="lg:col-span-1 bg-white rounded-[2.5rem] p-8 shadow-sm border border-pink-50 flex flex-col items-center justify-center space-y-6">
                    <div className="relative w-40 h-40 flex items-center justify-center">
                        <svg className="absolute w-full h-full -rotate-90">
                            <circle cx="80" cy="80" r="72" fill="none" stroke="#FDF2F8" strokeWidth="12" />
                            <circle
                                cx="80" cy="80" r="72" fill="none" stroke="url(#pinkGrad)"
                                strokeWidth="12" strokeDasharray="452"
                                strokeDashoffset={452 - (452 * energyStatus.percent) / 100}
                                strokeLinecap="round" className="transition-all duration-1000"
                            />
                            <defs>
                                <linearGradient id="pinkGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#D81B60" /><stop offset="100%" stopColor="#FF6B9E" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <div className="text-center z-10">
                            {/* Diperbesar ke text-4xl */}
                            <span className="block text-4xl font-black text-gray-800">{energyStatus.percent}%</span>
                            <span className="text-xs font-black text-pink-300 uppercase tracking-widest">Energi</span>
                        </div>
                    </div>

                    {/* Menampilkan Value Detail (Teks Diperbesar ke text-sm) */}
                    <div className="text-center w-full space-y-2 border-t border-gray-50 pt-4">
                        <div className="text-sm text-gray-600 font-medium">
                            Total Intake: <span className="font-bold text-gray-800">{giziData.consumed.energi.toFixed(0)} kkal</span>
                        </div>
                        <div className="text-sm text-gray-600 font-medium">
                            Target AKG: <span className="font-bold text-gray-800">{giziData.target.energi} kkal</span>
                        </div>
                        <div className="flex items-center justify-center gap-2 pt-2">
                            <span className="text-sm font-bold text-gray-400">STATUS:</span>
                            <div className={`w-2.5 h-2.5 rounded-full ${energyStatus.dot}`}></div>
                            <span className={`text-sm font-black ${energyStatus.color}`}>{energyStatus.label}</span>
                        </div>
                    </div>

                    <button onClick={() => navigate("/user/monitoring/makanan")} className="flex items-center gap-2 text-sm font-bold text-[#D81B60] hover:underline mt-2">
                        Catat Nutrisi <ChevronRight size={16}/>
                    </button>
                </div>

                {/* 2. Grid Makro & Tombol Tambah */}
                <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <MiniStatCard label="PROTEIN" val={giziData.consumed.protein} target={giziData.target.protein} unit="g" icon={<Zap size={14}/>} status={proteinStatus} />
                    <MiniStatCard label="LEMAK" val={giziData.consumed.lemak} target={giziData.target.lemak} unit="g" icon={<Droplets size={14}/>} status={lemakStatus} />
                    <MiniStatCard label="KARBOHIDRAT" val={giziData.consumed.karbohidrat} target={giziData.target.karbohidrat} unit="g" icon={<Flame size={14}/>} status={karboStatus} />

                    <div onClick={() => navigate("/user/monitoring/makanan")} className="bg-gradient-to-br from-[#D81B60] to-[#FF6B9E] rounded-3xl p-5 text-white flex flex-col justify-center items-center gap-2 cursor-pointer hover:shadow-lg transition-all active:scale-95 shadow-pink-100">
                        <Utensils size={24} />
                        <span className="text-[10px] font-black uppercase text-center leading-tight">Tambah<br/>Makan</span>
                    </div>
                </div>
            </div>

            {/* --- NOTIFIKASI DINAMIS --- */}
            <div className="bg-white p-6 rounded-[2rem] border border-pink-50 text-center shadow-sm mx-auto">
                <p className="text-sm font-medium text-gray-700 leading-relaxed">
                    Asupan gizi ibu hari ini masih <span className={`font-bold ${energyStatus.color}`}>{energyStatus.note}</span>.
                    {energyStatus.percent < 80 && " Tambahkan makanan sumber energi dan protein seperti nasi, telur, ikan, tempe atau susu untuk mendukung produksi ASI."}
                </p>
            </div>

            {/* --- EDUKASI TERBARU --- */}
            <section className="space-y-6">
                <div className="flex justify-between items-center px-2">
                    <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-bold text-gray-800">Edukasi Terbaru</h2>
                        <span className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-full">{latestEdukasi.length}</span>
                    </div>
                    <button onClick={() => navigate("/user/edukasi")} className="flex items-center gap-2 bg-[#E7DFFF] text-[#4B3B88] hover:bg-[#D6CFF0] px-5 py-2.5 rounded-full text-sm font-bold transition-all">
                        Lihat Semua <ChevronRight size={16}/>
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {latestEdukasi.map((item) => (
                        <div key={item.id} onClick={() => navigate("/user/edukasi")} className="bg-white rounded-3xl p-3 shadow-sm hover:shadow-md border border-gray-100 transition-all cursor-pointer flex flex-col h-full group">
                            <div className="relative h-48 w-full mb-4">
                                <img src={renderThumbnail(item.media)} alt={item.title} className="w-full h-full object-cover rounded-xl bg-gray-50" />
                                <div className="absolute bottom-3 left-3 bg-white px-3 py-1 rounded-md text-[10px] font-black text-gray-700 shadow-sm uppercase tracking-wider">
                                    {getKategoriName(item.kategori)}
                                </div>
                            </div>
                            <div className="px-2 flex flex-col flex-grow space-y-3">
                                <div className="flex items-center text-gray-400 text-[11px] font-bold uppercase tracking-tighter">
                                    <Clock size={14} className="mr-1.5" /> 15 - 20 mins read
                                </div>
                                <h3 className="font-bold text-[17px] leading-tight text-gray-900 group-hover:text-[#D81B60] transition-colors line-clamp-2">{item.title}</h3>
                                <p className="text-sm text-gray-500 line-clamp-2 flex-grow">{item.content || "Informasi kesehatan masa nifas."}</p>
                                <div className="flex items-center pt-4 border-t border-gray-50 mt-auto">
                                    <div className="w-8 h-8 rounded-full mr-3 flex items-center justify-center bg-[#D81B60] text-white font-black text-[10px]">AD</div>
                                    <div className="flex flex-col">
                                        <span className="text-[11px] font-bold text-gray-900 leading-none mb-1">Dr. Sarah Legend</span>
                                        <span className="text-[10px] text-gray-400 font-medium italic">
                                            {item.created_at?.toDate ? item.created_at.toDate().toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'}) : "Baru saja"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}

// --- Komponen MiniStatCard dengan Target & Status ---
function MiniStatCard({ label, val, target, unit, icon, status }) {
    return (
        <div className="bg-white p-5 rounded-3xl border border-pink-50 shadow-sm flex flex-col justify-between h-full space-y-4 relative overflow-hidden group hover:border-pink-200 transition-all">
            {/* Bagian Atas: Icon & Persen */}
            <div className="relative z-10 space-y-3">
                <div className="flex items-center justify-between text-pink-400">
                    <div className="p-1.5 bg-pink-50 rounded-lg">{icon}</div>
                    <span className="text-[10px] font-black">{status.percent}%</span>
                </div>

                <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
                    <div className="flex items-end gap-1">
                        <p className="text-xl font-black text-gray-800 leading-none">{val.toFixed(1)}</p>
                        <p className="text-[10px] font-bold text-gray-400 mb-0.5">{unit}</p>
                    </div>
                </div>
            </div>

            {/* Bagian Bawah: Progress Bar, Target & Status */}
            <div className="relative z-10 space-y-3 mt-auto">
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all duration-1000 ${status.percent < 80 ? 'bg-rose-400' : status.percent <= 110 ? 'bg-emerald-400' : 'bg-amber-400'}`}
                        style={{ width: `${status.percent}%` }}
                    />
                </div>

                <div className="space-y-1.5 border-t border-gray-50 pt-3">
                    <div className="flex justify-between items-center">
                        <span className="text-[9px] font-bold text-gray-400">Target AKG:</span>
                        <span className="text-[10px] font-bold text-gray-700">{target}{unit}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[9px] font-bold text-gray-400">Status:</span>
                        <div className="flex items-center gap-1">
                            <div className={`w-1.5 h-1.5 rounded-full ${status.dot}`}></div>
                            <span className={`text-[9px] font-black ${status.color}`}>{status.label}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
