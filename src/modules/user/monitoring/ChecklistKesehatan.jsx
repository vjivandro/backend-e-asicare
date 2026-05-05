import { useState } from "react";
import { Check, X, Info, Activity } from "lucide-react";
import { db, auth } from "../../../services/firebase.js";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function ChecklistKesehatan() {
    // State untuk menyimpan jawaban dari checklist
    const [answers, setAnswers] = useState({});
    const [isSaving, setIsSaving] = useState(false);

    // Fungsi untuk mengubah jawaban
    const handleAnswer = (itemId, value) => {
        setAnswers(prev => ({
            ...prev,
            [itemId]: value
        }));
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

        try {
            setIsSaving(true);
            await addDoc(collection(db, "checklist_nifas"), {
                userId: currentUser.uid,
                tanggal: serverTimestamp(),
                jawaban: answers
            });
            alert("Hebat! Data checklist hari ini berhasil disimpan. 🎉");
        } catch (error) {
            console.error("Error saving document: ", error);
            alert("Gagal menyimpan data: " + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    // Data struktur untuk checklist
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

    return (
        // Wrapper diseragamkan dengan FoodDiary.jsx
        <div className="max-w-7xl mx-auto space-y-8 p-4 md:p-6 mt-2 font-sans pb-24">

            {/* --- HEADER MINIMALIS (Diseragamkan dengan Target Gizi & Buku Harian Makan) --- */}
            <div className="flex justify-between items-center mb-2">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
                        Checklist <span className="text-[#D81B60]">Kesehatan</span>
                    </h1>
                    <p className="mt-1.5 text-gray-500 text-sm font-medium">
                        Pantau kelengkapan gizi dan keamanan pangan harian Anda di sini.
                    </p>
                </div>
                {/* Ikon Dekoratif Kanan Atas */}
                <div className="hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-pink-50 text-pink-300">
                    <Activity size={24} />
                </div>
            </div>

            {/* KONTEN CHECKLIST - GRIDVIEW */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
                {checklistData.map((section) => (
                    <div key={section.id} className="bg-white rounded-[2rem] shadow-sm border border-pink-50 overflow-hidden flex flex-col h-full hover:shadow-md hover:border-pink-100 transition-all">

                        {/* Judul Section (Pink Gradasi standar e-ASI) */}
                        <div className="bg-gradient-to-r from-pink-400 to-[#FF6B9E] p-4 text-center flex-shrink-0">
                            <h2 className="text-white font-black text-sm uppercase tracking-widest">{section.title}</h2>
                            {section.subtitle && (
                                <p className="text-pink-50 text-[10px] mt-1.5 leading-tight max-w-[95%] mx-auto font-medium">
                                    {section.subtitle}
                                </p>
                            )}
                        </div>

                        {/* Tabel / List Items */}
                        <div className="p-3 flex-grow flex flex-col">
                            {/* Header Kolom */}
                            <div className="hidden sm:grid grid-cols-12 gap-2 px-3 py-2 border-b border-gray-50 mb-2">
                                <div className="col-span-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Komponen</div>
                                <div className="col-span-2 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Ya</div>
                                <div className="col-span-2 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Tidak</div>
                            </div>

                            {/* Baris Pertanyaan */}
                            <div className="space-y-1">
                                {section.items.map((item) => (
                                    <div key={item.id} className="flex flex-col sm:grid sm:grid-cols-12 gap-3 sm:gap-2 items-center p-3 sm:px-3 sm:py-3 hover:bg-pink-50/50 rounded-2xl transition-colors">

                                        {/* Label & Icon */}
                                        <div className="col-span-8 flex items-center gap-3 w-full">
                                            <span className="text-xl bg-gray-50 w-10 h-10 flex items-center justify-center rounded-xl shadow-sm border border-gray-100 flex-shrink-0">{item.icon}</span>
                                            <span className="text-xs font-bold text-gray-700 leading-snug">{item.label}</span>
                                        </div>

                                        {/* Tombol Opsi (Ya / Tidak) */}
                                        <div className="col-span-4 flex items-center justify-center gap-2 w-full mt-2 sm:mt-0">
                                            {/* Tombol YA */}
                                            <button
                                                onClick={() => handleAnswer(item.id, 'ya')}
                                                className={`flex-1 sm:w-10 sm:flex-none flex items-center justify-center py-2.5 sm:py-2 rounded-xl border-2 transition-all font-black text-xs uppercase tracking-wider
                                                    ${answers[item.id] === 'ya'
                                                    ? 'bg-green-100 border-green-500 text-green-600 shadow-sm scale-105'
                                                    : 'bg-white border-gray-100 text-gray-300 hover:border-green-200 hover:text-green-400'}`}
                                            >
                                                <Check size={16} className={answers[item.id] === 'ya' ? 'block sm:hidden mr-1' : 'hidden'} />
                                                <span className="sm:hidden">Ya</span>
                                                <Check size={16} className="hidden sm:block" strokeWidth={3} />
                                            </button>

                                            {/* Tombol TIDAK */}
                                            <button
                                                onClick={() => handleAnswer(item.id, 'tidak')}
                                                className={`flex-1 sm:w-10 sm:flex-none flex items-center justify-center py-2.5 sm:py-2 rounded-xl border-2 transition-all font-black text-xs uppercase tracking-wider
                                                    ${answers[item.id] === 'tidak'
                                                    ? 'bg-red-100 border-red-500 text-red-600 shadow-sm scale-105'
                                                    : 'bg-white border-gray-100 text-gray-300 hover:border-red-200 hover:text-red-400'}`}
                                            >
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

            {/* FOOTER & INFO BOX (Diseragamkan Info Box style e-ASI Care) */}
            <div className="mt-8 bg-pink-50 rounded-[2rem] p-6 md:p-8 border border-pink-100 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-sm">

                <div className="flex flex-col sm:flex-row items-start gap-4 text-pink-600 z-10 w-full md:w-2/3">
                    <Info size={28} className="flex-shrink-0 mt-0.5 hidden sm:block" />
                    <div>
                        <p className="text-sm font-bold leading-relaxed mb-3">
                            Kesehatan ibu dan keamanan pangan Anda telah disesuaikan dengan standar e-ASI Care. Ayo
                            penuhi checklist ini untuk pemulihan optimal!
                        </p>
                        <div className="inline-flex items-center gap-2 text-[#D81B60] bg-white px-4 py-2 rounded-xl border border-pink-200 shadow-sm">
                            <Info size={16} className="flex-shrink-0 sm:hidden"/>
                            <p className="text-[10px] font-black uppercase tracking-wider">
                                Ket: Pastikan asupan sesuai prinsip gizi seimbang
                            </p>
                        </div>
                    </div>
                </div>

                {/* TOMBOL SIMPAN */}
                <div className="z-10 w-full md:w-1/3 flex justify-end">
                    <button
                        onClick={handleSimpan}
                        disabled={isSaving}
                        className="w-full md:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-[#D81B60] to-[#FF6B9E] text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-pink-200 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isSaving ? "Menyimpan..." : (
                            <>
                                <Check size={18} strokeWidth={3} />
                                Simpan Data
                            </>
                        )}
                    </button>
                </div>

                {/* Aksen lingkaran blur */}
                <div className="absolute right-0 bottom-0 w-64 h-64 bg-pink-200/40 rounded-full blur-3xl"></div>
                <div className="absolute left-0 top-0 w-32 h-32 bg-white/40 rounded-full blur-2xl"></div>
            </div>

        </div>
    );
}
