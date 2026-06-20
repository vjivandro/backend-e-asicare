import React, { useState, useEffect } from 'react';
import { db } from "../../../services/firebase.js";
import { doc, getDoc } from "firebase/firestore";
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Utensils, Clock, Activity, Flame, Droplet, Wheat, Info, ArrowLeft, Calendar } from 'lucide-react';

export default function DetailCatatanMakan() {
    const { userId } = useParams(); // Mengambil ID dari URL path
    const [searchParams] = useSearchParams(); // Mengambil parameter tanggal dari URL
    const dateParam = searchParams.get("date") || new Date().toISOString().split('T')[0];
    const navigate = useNavigate();

    const [userInfo, setUserInfo] = useState(null);
    const [dailyData, setDailyData] = useState({ meals: [], total_harian: { energi: 0, protein: 0, lemak: 0, karbohidrat: 0 } });
    const [target, setTarget] = useState({ energi: 2250, protein: 80, lemak: 70, karbohidrat: 350 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // 1. Ambil Data Profil User dari target_gizi
                const userRef = doc(db, "target_gizi", userId);
                const userSnap = await getDoc(userRef);

                let actualUid = userId;

                if (userSnap.exists()) {
                    const userData = userSnap.data();
                    setUserInfo(userData);
                    actualUid = userData.userId || userData.uid || userId;

                    setTarget({
                        energi: userData.energi || 2250,
                        protein: userData.protein || 80,
                        lemak: userData.lemak || 70,
                        karbohidrat: userData.karbohidrat || 350
                    });
                }

                // 2. Ambil Data Catatan Makan dari daily_intake
                const intakeRef = doc(db, "users", actualUid, "daily_intake", dateParam);
                const intakeSnap = await getDoc(intakeRef);

                if (intakeSnap.exists()) {
                    setDailyData(intakeSnap.data());
                } else {
                    setDailyData({ meals: [], total_harian: { energi: 0, protein: 0, lemak: 0, karbohidrat: 0 } });
                }

            } catch (error) {
                console.error("Gagal mengambil data detail:", error);
            } finally {
                setLoading(false);
            }
        };

        if (userId) fetchData();
    }, [userId, dateParam]);

    return (
        <div className="p-4 sm:p-8 bg-gray-50 min-h-screen font-sans pb-24">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* --- TOMBOL KEMBALI & HEADER --- */}
                <div className="flex flex-col gap-4 mb-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-400 hover:text-pink-500 font-bold w-max transition-colors"
                    >
                        <ArrowLeft size={20} /> Kembali ke Daftar
                    </button>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <Activity className="text-pink-500" size={32} />
                            <div>
                                <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                                    Pantauan Gizi: <span className="text-pink-500">{userInfo?.userName || 'Memuat...'}</span>
                                </h1>
                                <p className="text-gray-500 mt-1 flex items-center gap-2 font-medium">
                                    <Calendar size={14} /> Tanggal Catatan: {dateParam}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-20 text-pink-400 font-bold animate-pulse flex flex-col items-center">
                        <Activity className="w-10 h-10 animate-spin mb-3" />
                        Memuat detail catatan makan...
                    </div>
                ) : (
                    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">

                        {/* 1. KARTU RINGKASAN GIZI */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <AdminStatCard icon={<Flame/>} label="Energi" value={dailyData.total_harian.energi} target={target.energi} unit="kkal" color="orange" />
                            <AdminStatCard icon={<Activity/>} label="Protein" value={dailyData.total_harian.protein} target={target.protein} unit="g" color="rose" />
                            <AdminStatCard icon={<Droplet/>} label="Lemak" value={dailyData.total_harian.lemak} target={target.lemak} unit="g" color="amber" />
                            <AdminStatCard icon={<Wheat/>} label="Karbo" value={dailyData.total_harian.karbohidrat} target={target.karbohidrat} unit="g" color="indigo" />
                        </div>

                        {/* 2. DAFTAR MAKANAN */}
                        <div className="bg-white rounded-[2rem] shadow-sm border border-pink-50 overflow-hidden">
                            <div className="p-6 border-b border-pink-50 flex justify-between items-center bg-white">
                                <h3 className="text-lg font-black text-gray-800 flex items-center gap-2">
                                    <Utensils className="text-pink-500" size={20} /> Detail Konsumsi
                                </h3>
                                <span className="bg-pink-50 text-pink-500 border border-pink-100 text-xs font-black px-4 py-1.5 rounded-full">
                                    {dailyData.meals?.length || 0} Item Dimakan
                                </span>
                            </div>

                            <div className="p-6 md:p-8 bg-gray-50/30">
                                {(!dailyData.meals || dailyData.meals.length === 0) ? (
                                    <div className="text-center py-16 space-y-3">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">
                                            <Info size={28} />
                                        </div>
                                        <p className="text-gray-500 font-medium">User ini belum mencatat makanan pada tanggal tersebut.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-8">
                                        {["Pagi", "Siang", "Malam", "Selingan", "Lainnya"].map((kategori) => {
                                            const mealsInCategory = dailyData.meals.filter(m => m.kategori_waktu === kategori || (!m.kategori_waktu && kategori === "Lainnya"));
                                            if (mealsInCategory.length === 0) return null;

                                            return (
                                                <div key={kategori} className="space-y-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="text-[11px] font-black uppercase tracking-widest text-gray-400">
                                                            {kategori}
                                                        </div>
                                                        <div className="h-px bg-gray-200 flex-1"></div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                        {mealsInCategory.map((meal, index) => (
                                                            <div key={index} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between hover:border-pink-200 hover:shadow-md transition-all">
                                                                <div className="flex gap-3 items-start mb-4">
                                                                    <div className="w-10 h-10 bg-pink-50 rounded-xl flex items-center justify-center text-pink-400 shrink-0">
                                                                        <Utensils size={18} />
                                                                    </div>
                                                                    <div>
                                                                        <h4 className="font-bold text-gray-800 text-sm line-clamp-2">{meal.nama}</h4>
                                                                        <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold mt-1.5">
                                                                            <span className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-md"><Clock size={10} /> {meal.waktu}</span>
                                                                            <span className="bg-pink-50 text-pink-500 px-2 py-0.5 rounded-md">{meal.berat}g</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="pt-3 border-t border-gray-50 flex justify-between items-end">
                                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Energi</span>
                                                                    <div className="text-right">
                                                                        <span className="text-xl font-black text-gray-900">{meal.energi?.toFixed(0) || 0}</span>
                                                                        <span className="text-[10px] text-gray-400 font-bold ml-1">kkal</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Komponen Kartu Statistik
function AdminStatCard({ icon, label, value = 0, target = 0, unit, color }) {
    const isOverTarget = value > target;
    const percent = target > 0 ? Math.round((value / target) * 100) : 0;

    const colorMap = {
        orange: { text: 'text-orange-500', bar: 'bg-orange-400' },
        rose: { text: 'text-rose-500', bar: 'bg-rose-400' },
        amber: { text: 'text-amber-500', bar: 'bg-amber-400' },
        indigo: { text: 'text-indigo-500', bar: 'bg-indigo-400' }
    };
    const theme = colorMap[color];

    return (
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
            <div className="flex items-center gap-2 mb-4">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 bg-gray-50 ${theme.text}`}>
                    {React.cloneElement(icon, { size: 14 })}
                </div>
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{label}</span>
            </div>

            <div className="flex items-baseline gap-1 mb-4">
                <span className="text-3xl font-black text-gray-900">{unit === 'kkal' ? value.toFixed(0) : value.toFixed(1)}</span>
                <span className="text-xs font-bold text-gray-400">/ {target} {unit}</span>
            </div>

            <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2 overflow-hidden">
                <div
                    className={`h-1.5 rounded-full transition-all duration-700 ${isOverTarget ? 'bg-red-500' : theme.bar}`}
                    style={{ width: `${Math.min(percent, 100)}%` }}
                ></div>
            </div>
            <div className="flex justify-between items-center text-[9px] font-bold text-gray-400">
                <span>{percent}%</span>
                <span>Tercapai</span>
            </div>
        </div>
    );
}
