import React, { useState } from 'react';
import { auth } from "../../../services/firebase";
import { saveFoodEntry } from "../monitoring/userMonitoringService";
import { Scale, X } from 'lucide-react';

export default function AddFoodModal({ food, currentMeals, onClose, onRefresh }) {
    const [berat, setBerat] = useState(100);
    const [waktuMakan, setWaktuMakan] = useState("Pagi"); // Default Pagi
    const [loading, setLoading] = useState(false);

    const hitung = (nilai) => parseFloat(((berat / 100) * nilai).toFixed(1));

    const handleSimpan = async () => {
        setLoading(true);
        const today = new Date().toISOString().split('T')[0];
        const newMeal = {
            nama: food.nama,
            berat: parseInt(berat),
            energi: hitung(food.energi),
            protein: hitung(food.protein),
            lemak: hitung(food.lemak),
            karbohidrat: hitung(food.karbohidrat),
            waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            kategori_waktu: waktuMakan // <-- Field baru untuk grouping!
        };

        try {
            await saveFoodEntry(auth.currentUser.uid, today, newMeal, currentMeals);
            onRefresh();
            onClose();
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-pink-900/40 backdrop-blur-md">
            <div className="bg-white rounded-[2.5rem] w-full max-w-sm shadow-2xl overflow-hidden border border-pink-50">
                <div className="p-6 text-center bg-pink-50/50 relative">
                    <button onClick={onClose} className="absolute right-4 top-4 text-gray-400"><X size={20}/></button>
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mx-auto mb-3"><Scale className="text-pink-500" /></div>
                    <h3 className="font-bold text-gray-800 capitalize">{food.nama}</h3>
                </div>

                <div className="p-6 space-y-6 text-center">
                    {/* Pilihan Waktu Makan */}
                    <div className="flex justify-center gap-2">
                        {["Pagi", "Siang", "Malam", "Selingan"].map((w) => (
                            <button
                                key={w} onClick={() => setWaktuMakan(w)}
                                className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all 
                                    ${waktuMakan === w ? "bg-[#D81B60] text-white shadow-md" : "bg-pink-50 text-pink-400 hover:bg-pink-100"}`}
                            >
                                {w}
                            </button>
                        ))}
                    </div>

                    <input type="number" value={berat} onChange={(e) => setBerat(e.target.value)} className="text-5xl font-black text-pink-500 bg-transparent outline-none w-full text-center" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">Gram</p>

                    <div className="grid grid-cols-2 gap-2">
                        <div className="p-3 bg-pink-50/30 rounded-2xl"><p className="text-[9px] font-bold text-pink-300 uppercase">Energi</p><p className="font-bold text-sm text-gray-700">{hitung(food.energi)} kkal</p></div>
                        <div className="p-3 bg-pink-50/30 rounded-2xl"><p className="text-[9px] font-bold text-pink-300 uppercase">Protein</p><p className="font-bold text-sm text-gray-700">{hitung(food.protein)} g</p></div>
                    </div>

                    <button onClick={handleSimpan} disabled={loading} className="w-full bg-gradient-to-r from-[#D81B60] to-[#FF6B9E] text-white py-4 rounded-2xl font-black shadow-lg shadow-pink-100 mt-2">
                        {loading ? "MENYIMPAN..." : "TAMBAHKAN KE DIARY"}
                    </button>
                </div>
            </div>
        </div>
    );
}
