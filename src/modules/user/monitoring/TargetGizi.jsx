import React, { useEffect, useState, useCallback } from 'react';
import { Info, Target, Calculator, RotateCcw, Utensils } from 'lucide-react';
import { db } from "../../../services/firebase.js";
import {
    collection, getDocs, query, where, doc,
    getDoc, setDoc, serverTimestamp
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom"; // 🌟 TAMBAHAN UNTUK NAVIGASI 🌟

export default function TargetGizi() {
    const navigate = useNavigate(); // Inisialisasi navigasi
    const [userId, setUserId] = useState(null);
    const [usia, setUsia] = useState('');
    const [statusMenyusui, setStatusMenyusui] = useState('6 Bulan Pertama');
    const [nutritionData, setNutritionData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isCalculating, setIsCalculating] = useState(false);

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserId(user.uid);
            } else {
                setUserId(null);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const fetchTarget = useCallback(async () => {
        if (!userId) return;
        try {
            const docRef = doc(db, "users", userId, "target_gizi", "profile");
            const snap = await getDoc(docRef);

            if (snap.exists()) {
                const data = snap.data();
                setNutritionData({
                    energi: data.energi,
                    protein: data.protein,
                    lemak: data.lemak,
                    karbohidrat: data.karbohidrat,
                });

                if (data.usia) setUsia(String(data.usia));
                if (data.status_menyusui) {
                    const mapBack = {
                        "0_6": "6 Bulan Pertama",
                        "6_12": "6 Bulan Kedua",
                        "normal": "Tidak Menyusui"
                    };
                    setStatusMenyusui(mapBack[data.status_menyusui] || "6 Bulan Pertama");
                }
            }
        } catch (e) {
            console.error("Fetch target error:", e);
        }
    }, [userId]);

    useEffect(() => {
        if (userId) fetchTarget();
    }, [userId, fetchTarget]);

    const handleCalculate = async () => {
        const usiaInt = parseInt(usia);
        if (!usiaInt) return alert("Masukkan usia Anda terlebih dahulu");
        if (!userId) return alert("Sesi berakhir, silakan login kembali");

        setIsCalculating(true);
        try {
            const akgRef = collection(db, "akg_ibu");
            const qAkg = query(akgRef, where("usia_min", "<=", usiaInt), where("usia_max", ">=", usiaInt));
            const akgSnap = await getDocs(qAkg);
            const akg = akgSnap.docs[0]?.data();

            if (!akg) throw new Error("Data AKG tidak ditemukan");

            const statusKey = statusMenyusui === "6 Bulan Pertama" ? "0_6" :
                statusMenyusui === "6 Bulan Kedua" ? "6_12" : "normal";

            const tambahanRef = collection(db, "tambahan_menyusui");
            const qTambahan = query(tambahanRef, where("status", "==", statusKey));
            const tambahanSnap = await getDocs(qTambahan);
            const tambahan = tambahanSnap.docs[0]?.data();

            const result = {
                energi: akg.energi + (tambahan?.energi || 0),
                protein: akg.protein + (tambahan?.protein || 0),
                lemak: akg.lemak + (tambahan?.lemak || 0),
                karbohidrat: akg.karbohidrat + (tambahan?.karbohidrat || 0),
            };

            setNutritionData(result);

            // 1. Simpan ke data Profil User (Kandang Lama)
            const docRef = doc(db, "users", userId, "target_gizi", "profile");
            await setDoc(docRef, {
                ...result,
                usia: usiaInt,
                status_menyusui: statusKey,
                updated_at: serverTimestamp(),
            }, { merge: true });

            // 2. 🌟 TAMBAHAN: Copy data ke koleksi utama agar dibaca Admin 🌟
            const auth = getAuth();
            const userName = auth.currentUser?.displayName || auth.currentUser?.email?.split('@')[0] || "User Nifas";

            const adminDocRef = doc(db, "target_gizi", userId);
            await setDoc(adminDocRef, {
                ...result,
                userId: userId,
                userName: userName,
                umur: usiaInt,
                statusMenyusui: statusMenyusui, // Pakai text asli (misal: "6 Bulan Pertama")
                createdAt: serverTimestamp(), // Menggunakan createdAt sesuai permintaan admin
            }, { merge: true });

            alert("Target Gizi berhasil dihitung dan disimpan!");

        } catch (error) {
            console.error("Error:", error);
            alert("Gagal menghitung target gizi.");
        } finally {
            setIsCalculating(false);
        }
    };

    const handleReset = async () => {
        if (!window.confirm("Hapus data target gizi?")) return;
        setNutritionData(null);
        setUsia("");
        const docRef = doc(db, "users", userId, "target_gizi", "profile");
        await setDoc(docRef, { cleared_at: serverTimestamp() }, { merge: true });
    };

    const getProgress = (key, value) => {
        const maxMap = { energi: 3000, protein: 150, lemak: 100, karbohidrat: 400 };
        return Math.min(100, Math.round((value / (maxMap[key] || 100)) * 100));
    };

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-pink-50/20">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-pink-600 font-bold animate-pulse">Menghubungkan ke Akun...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-pink-50/20 p-4 md:p-8 font-sans text-gray-800">
            <div className="max-w-6xl mx-auto space-y-10">

                <div className="flex justify-between items-center mb-6 pt-2">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
                            Target Gizi <span className="text-[#D81B60]">Ibu Nifas</span>
                        </h1>
                        <p className="mt-1.5 text-gray-500 text-sm font-medium">
                            Automated Calculation by e-ASI Care
                        </p>
                    </div>
                    <div className="hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-pink-50 text-pink-300">
                        <Target size={24} />
                    </div>
                </div>

                <div className="bg-white rounded-[2rem] p-6 md:p-10 shadow-sm border border-pink-100 relative transition-all">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-pink-400 ml-1 uppercase tracking-widest">USIA IBU (TAHUN)</label>
                            <input type="number" value={usia} onChange={(e) => setUsia(e.target.value)} className="w-full bg-gray-50 border-none rounded-2xl px-5 h-[56px] focus:ring-2 focus:ring-pink-300 transition-all font-bold text-lg" placeholder="Masukkan Usia" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-pink-400 ml-1 uppercase tracking-widest">STATUS MENYUSUI</label>
                            <select value={statusMenyusui} onChange={(e) => setStatusMenyusui(e.target.value)} className="w-full bg-gray-50 border-none rounded-2xl px-5 h-[56px] focus:ring-2 focus:ring-pink-300 cursor-pointer font-bold text-lg appearance-none">
                                <option value="6 Bulan Pertama">6 Bulan Pertama (Eksklusif)</option>
                                <option value="6 Bulan Kedua">6 Bulan Kedua (MPASI)</option>
                                <option value="Tidak Menyusui">Tidak Menyusui / Normal</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-4 mt-8">
                        <button onClick={handleCalculate} disabled={isCalculating} className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-black h-[56px] rounded-2xl shadow-lg shadow-pink-100 active:scale-95 disabled:opacity-50 transition-all uppercase tracking-widest text-xs">
                            {isCalculating ? "Menghitung..." : "Hitung & Simpan"}
                        </button>
                        <button onClick={handleReset} className="bg-gray-100 w-[56px] h-[56px] flex items-center justify-center rounded-2xl text-gray-400 hover:text-red-500 transition-colors">
                            <RotateCcw size={24} />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {[
                        { title: 'Energi', value: nutritionData?.energi || 0, unit: 'kkal', icon: '🔥', color: 'from-orange-400 to-red-500', key: 'energi' },
                        { title: 'Protein', value: nutritionData?.protein || 0, unit: 'gram', icon: '🍗', color: 'from-pink-400 to-rose-600', key: 'protein' },
                        { title: 'Lemak', value: nutritionData?.lemak || 0, unit: 'gram', icon: '🥑', color: 'from-yellow-400 to-orange-500', key: 'lemak' },
                        { title: 'Karbo', value: nutritionData?.karbohidrat || 0, unit: 'gram', icon: '🍚', color: 'from-purple-400 to-indigo-500', key: 'karbohidrat' }
                    ].map((item, idx) => (
                        <div key={idx} className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-50 relative overflow-hidden group hover:shadow-xl transition-all duration-500">
                            <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${item.color} opacity-10 rounded-bl-full`}></div>
                            <div className="text-2xl mb-4 transform group-hover:scale-125 transition-transform">{item.icon}</div>
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{item.title}</h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-black text-gray-900">{item.value}</span>
                                <span className="text-[10px] font-bold text-gray-400">{item.unit}</span>
                            </div>
                            <div className="mt-5 w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                <div className={`h-full bg-gradient-to-r ${item.color} transition-all duration-1000`} style={{ width: `${getProgress(item.key, item.value)}%` }}></div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-gradient-to-br from-white to-pink-50 rounded-[2.5rem] p-8 md:p-10 flex flex-col md:flex-row items-center gap-8 shadow-sm border border-white">
                    <span className="text-7xl drop-shadow-lg">👩‍🍼</span>
                    <div className="flex-1 text-center md:text-left">
                        <h3 className="text-2xl font-black text-gray-800 mb-2">Nutrisi Tepat, ASI Hebat!</h3>
                        <p className="text-gray-500 text-sm leading-relaxed max-w-xl">Data AKG Anda disimpan otomatis ke profil. Gunakan target ini untuk menjaga kualitas ASI harian demi tumbuh kembang si Kecil yang optimal.</p>
                    </div>
                    {/* 🌟 TOMBOL NAVIGASI DIAKTIFKAN 🌟 */}
                    <button
                        onClick={() => navigate("/user/monitoring/makanan")}
                        className="bg-pink-500 text-white font-black py-4 px-10 rounded-2xl shadow-lg shadow-pink-100 hover:bg-pink-600 transition-all flex items-center gap-2"
                    >
                        <Utensils size={20} /> CATAT MAKANAN
                    </button>
                </div>

            </div>
        </div>
    );
}