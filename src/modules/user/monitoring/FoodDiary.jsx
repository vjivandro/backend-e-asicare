import React, { useState, useEffect } from 'react';
import { auth, db } from "../../../services/firebase";
import { getDailyIntake, deleteFoodEntry } from "./userMonitoringService";
import FoodSearch from "./FoodSearch";
import AddFoodModal from "../components/AddFoodModal";
import { Utensils, Clock, Info, Trash2, Activity } from 'lucide-react';
import { getDoc, getDocs, query, where, collection, doc } from "firebase/firestore";

// --- Helper: tanggal lokal (bukan UTC) ---
// new Date().toISOString() selalu memakai UTC, jadi antara jam 00:00–06:59 WIB
// (UTC+7) tanggalnya masih "kemarin" menurut UTC. Fungsi ini mengoreksi itu
// dengan menggeser waktu sesuai offset timezone browser sebelum di-slice.
function getLocalDateString() {
    const now = new Date();
    const offsetMs = now.getTimezoneOffset() * 60000;
    const local = new Date(now.getTime() - offsetMs);
    return local.toISOString().split('T')[0];
}

export default function FoodDiary() {
    const [dailyData, setDailyData] = useState({ meals: [], total_harian: { energi: 0, protein: 0, lemak: 0, karbohidrat: 0 } });
    const [loading, setLoading] = useState(true);
    const [selectedFood, setSelectedFood] = useState(null);

    // Menggunakan state agar nilai target bisa diperbarui dari database
    const [target, setTarget] = useState({ energi: 0, protein: 0, lemak: 0, karbohidrat: 0 });
    const today = getLocalDateString();

    const loadData = async (uid) => {
        setLoading(true);
        try {
            // 1. Ambil data makanan harian
            const data = await getDailyIntake(uid, today);
            setDailyData(data);

            // 2. Ambil target gizi dari koleksi "target_gizi"
            // Document ID di koleksi ini sama dengan uid user, jadi bisa langsung
            // getDoc (1 read, tanpa index) — lebih cepat & lebih murah daripada query.
            let targetData = null;
            const directRef = doc(db, "target_gizi", uid);
            const directSnap = await getDoc(directRef);

            if (directSnap.exists()) {
                targetData = directSnap.data();
            } else {
                // Fallback untuk dokumen lama yang mungkin masih pakai auto-ID
                // dengan field "userId" alih-alih doc ID = uid.
                const q = query(collection(db, "target_gizi"), where("userId", "==", uid));
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    targetData = querySnapshot.docs[0].data();
                }
            }

            if (targetData) {
                setTarget({
                    energi: targetData.energi || 0,
                    protein: targetData.protein || 0,
                    lemak: targetData.lemak || 0,
                    karbohidrat: targetData.karbohidrat || 0
                });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Menunggu status auth benar-benar resolve, bukan mengecek
        // auth.currentUser langsung di mount (bisa masih null sesaat
        // walau user sebenarnya sudah login).
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                loadData(user.uid);
            } else {
                setLoading(false);
                setDailyData({ meals: [], total_harian: { energi: 0, protein: 0, lemak: 0, karbohidrat: 0 } });
            }
        });
        return () => unsubscribe();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // --- FUNGSI HANDLE DELETE ---
    const handleDelete = async (meal) => {
        if (!auth.currentUser) return;
        if (window.confirm(`Yakin ingin menghapus ${meal.nama} dari daftar?`)) {
            try {
                setLoading(true);
                await deleteFoodEntry(auth.currentUser.uid, today, meal);
                await loadData(auth.currentUser.uid);
            } catch (error) {
                console.error(error);
                alert("Gagal menghapus makanan.");
            } finally {
                setLoading(false);
            }
        }
    };

    const handleRefresh = () => {
        if (auth.currentUser) loadData(auth.currentUser.uid);
    };

    const getStatusInfo = (current, targetValue) => {
        // Guard: hindari NaN/Infinity saat target belum ter-load (masih 0)
        if (!targetValue || targetValue <= 0) {
            return { percent: 0, label: "MENUNGGU TARGET", color: "text-gray-400", dot: "bg-gray-300" };
        }
        const percent = Math.min(Math.round((current / targetValue) * 100), 100);
        if (percent < 80) return { percent, label: "KURANG", color: "text-rose-500", dot: "bg-rose-500" };
        if (percent <= 110) return { percent, label: "CUKUP", color: "text-emerald-500", dot: "bg-emerald-500" };
        return { percent, label: "LEBIH", color: "text-amber-500", dot: "bg-amber-500" };
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 p-4 md:p-6 mt-2 font-sans pb-24">

            {/* --- HEADER MINIMALIS --- */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
                        Buku Harian <span className="text-[#D81B60]">Makan</span>
                    </h1>
                    <p className="mt-1.5 text-gray-500 text-sm font-medium">
                        Catat suapan nutrisi harian dan pantau pencapaian target gizi Anda secara langsung.
                    </p>
                </div>
                {/* Ikon Dekoratif Kanan Atas */}
                <div className="hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-pink-50 text-pink-300">
                    <Utensils size={24} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* --- SISI KIRI (Pencarian & Daftar) --- */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-sm border border-pink-50">
                        <h3 className="text-lg font-black text-gray-800 mb-4 tracking-tight">Pencarian Makanan</h3>
                        <FoodSearch onFoodSelect={(food) => setSelectedFood(food)} />
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-2 pt-2">
                            <h3 className="text-lg font-black text-gray-800 tracking-tight">Daftar Konsumsi</h3>
                            <span className="bg-pink-100 text-pink-600 text-xs font-black px-3 py-1 rounded-full">{dailyData.meals.length} Item</span>
                        </div>

                        {loading ? (
                            <div className="text-center py-10 text-gray-400 animate-pulse text-sm font-medium">Memuat data nutrisi...</div>
                        ) : dailyData.meals.length > 0 ? (
                            <div className="space-y-6">
                                {["Pagi", "Siang", "Malam", "Selingan", "Lainnya"].map((kategori) => {
                                    const mealsInCategory = dailyData.meals.filter(m => m.kategori_waktu === kategori || (!m.kategori_waktu && kategori === "Lainnya"));
                                    if (mealsInCategory.length === 0) return null;

                                    return (
                                        <div key={kategori} className="space-y-3">
                                            <div className="inline-block bg-pink-50 text-[#D81B60] text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border border-pink-100">
                                                {kategori}
                                            </div>
                                            <div className="space-y-3">
                                                {mealsInCategory.map((meal, index) => (
                                                    <div
                                                        key={meal.id ?? `${kategori}-${meal.nama}-${meal.waktu}-${index}`}
                                                        className="bg-white p-4 sm:p-5 rounded-[1.5rem] border border-pink-50 flex items-center justify-between group hover:border-pink-200 hover:shadow-md transition-all shadow-sm pr-4"
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-400 group-hover:bg-gradient-to-tr from-[#D81B60] to-[#FF6B9E] group-hover:text-white transition-all shrink-0 shadow-sm">
                                                                <Utensils size={20} />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-black text-gray-800 text-sm capitalize line-clamp-1">{meal.nama}</h4>
                                                                <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-bold mt-1 uppercase tracking-wider">
                                                                    <Clock size={12} /> {meal.waktu} • <span className="text-pink-400">{meal.berat}g</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Bagian Kanan: Kalori & Tombol Hapus */}
                                                        <div className="flex items-center gap-4">
                                                            <div className="text-right">
                                                                <p className="text-xl font-black text-gray-900 leading-none">{(meal.energi ?? 0).toFixed(0)}</p>
                                                                <p className="text-[9px] text-gray-400 font-black uppercase mt-1 tracking-widest">kkal</p>
                                                            </div>
                                                            {/* Tombol Delete */}
                                                            <button
                                                                onClick={() => handleDelete(meal)}
                                                                className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-white hover:bg-rose-500 rounded-xl transition-all shadow-sm"
                                                                title="Hapus"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="bg-white rounded-[2rem] border border-pink-50 p-10 text-center space-y-3 shadow-sm">
                                <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center mx-auto text-pink-300 mb-4">
                                    <Info size={28} />
                                </div>
                                <h3 className="text-lg font-black text-gray-800">Belum Ada Catatan</h3>
                                <p className="text-sm text-gray-400 font-medium leading-relaxed max-w-xs mx-auto">Anda belum memasukkan data makanan hari ini. Yuk, cari makanan di atas!</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- SISI KANAN (Statistik Disinkronkan dengan Dashboard) --- */}
                <div className="lg:col-span-7">
                    <div className="flex items-center gap-3 px-2 pt-2 mb-6 hidden lg:flex">
                        <Activity className="text-pink-500" size={24} />
                        <h2 className="text-2xl font-black text-gray-800 tracking-tight">Pantauan Gizi Harian</h2>
                    </div>

                    <div className="grid grid-cols-2 gap-4 sm:gap-6">
                        <DiaryStatCard label="Energi" val={dailyData.total_harian.energi} target={target.energi} unit="kkal" status={getStatusInfo(dailyData.total_harian.energi, target.energi)} />
                        <DiaryStatCard label="Protein" val={dailyData.total_harian.protein} target={target.protein} unit="g" status={getStatusInfo(dailyData.total_harian.protein, target.protein)} />
                        <DiaryStatCard label="Lemak" val={dailyData.total_harian.lemak} target={target.lemak} unit="g" status={getStatusInfo(dailyData.total_harian.lemak, target.lemak)} />
                        <DiaryStatCard label="Karbohidrat" val={dailyData.total_harian.karbohidrat} target={target.karbohidrat} unit="g" status={getStatusInfo(dailyData.total_harian.karbohidrat, target.karbohidrat)} />
                    </div>
                </div>

            </div>

            {selectedFood && (
                <AddFoodModal food={selectedFood} currentMeals={dailyData.meals} onClose={() => setSelectedFood(null)} onRefresh={handleRefresh} />
            )}
        </div>
    );
}

// --- Komponen DiaryStatCard ---
function DiaryStatCard({ label, val, target, unit, status }) {
    const displayVal = unit === 'kkal' ? val.toFixed(0) : val.toFixed(1);
    const gradId = `diary-grad-${label.toLowerCase()}`;
    const radius = 64;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (circumference * status.percent) / 100;

    return (
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-pink-50 flex flex-col items-center justify-between hover:shadow-md hover:border-pink-100 transition-all">
            <div className="relative w-40 h-40 flex items-center justify-center mt-2">
                <svg className="absolute w-full h-full -rotate-90">
                    <circle cx="80" cy="80" r={radius} fill="none" stroke="#FDF2F8" strokeWidth="12" />
                    <circle cx="80" cy="80" r={radius} fill="none" stroke={`url(#${gradId})`} strokeWidth="12" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" className="transition-all duration-1000" />
                    <defs>
                        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#D81B60" />
                            <stop offset="100%" stopColor="#FF6B9E" />
                        </linearGradient>
                    </defs>
                </svg>
                <div className="text-center z-10 flex flex-col items-center justify-center pt-2">
                    <span className="text-3xl font-black text-gray-800 leading-none">{status.percent}%</span>
                    <span className="text-[10px] font-black text-pink-400 uppercase tracking-widest mt-1.5">{label}</span>
                </div>
            </div>
            <div className="text-center w-full space-y-2.5 border-t border-gray-50 pt-5 mt-6">
                <div className="flex justify-between items-center text-xs px-2">
                    <span className="text-gray-400 font-bold uppercase tracking-wider">Intake</span>
                    <span className="font-black text-gray-800">{displayVal} <span className="text-[10px] text-gray-400">{unit}</span></span>
                </div>
                <div className="flex justify-between items-center text-xs px-2">
                    <span className="text-gray-400 font-bold uppercase tracking-wider">Target</span>
                    <span className="font-black text-gray-800">{target} <span className="text-[10px] text-gray-400">{unit}</span></span>
                </div>
                <div className={`mt-3 py-1.5 px-3 rounded-xl flex items-center justify-center gap-2 border ${status.percent < 80 ? 'bg-rose-50 border-rose-100' : status.percent <= 110 ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'}`}>
                    <div className={`w-2 h-2 rounded-full ${status.dot} animate-pulse`}></div>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${status.color}`}>{status.label}</span>
                </div>
            </div>
        </div>
    );
}
