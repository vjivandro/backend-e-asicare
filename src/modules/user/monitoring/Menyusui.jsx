import { useState, useEffect } from "react";
import { Info, Save, History, ClipboardEdit, Calendar, CheckCircle2, Activity, Baby } from "lucide-react";
import { db, auth } from "../../../services/firebase";
import { collection, addDoc, serverTimestamp, getDocs, query, where } from "firebase/firestore";

export default function Menyusui() {
    const [answers, setAnswers] = useState({});
    const [isSaving, setIsSaving] = useState(false);

    // State untuk fitur Riwayat
    const [activeTab, setActiveTab] = useState("form"); // 'form' atau 'history'
    const [riwayat, setRiwayat] = useState([]);
    const [isLoadingRiwayat, setIsLoadingRiwayat] = useState(false);

    // Opsi Jawaban beserta bobot skornya
    const options = [
        { label: "Selalu", value: 4, color: "bg-green-100 text-green-700 border-green-300 hover:bg-green-200" },
        { label: "Sering", value: 3, color: "bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200" },
        { label: "Kadang", value: 2, color: "bg-amber-100 text-amber-700 border-amber-300 hover:bg-amber-200" },
        { label: "Tidak", value: 1, color: "bg-red-100 text-red-700 border-red-300 hover:bg-red-200" },
    ];

    const kuesionerData = [
        {
            kategoriId: "frekuensi",
            kategoriTitle: "FREKUENSI MENYUSUI",
            items: [
                { id: "p1", text: "Saya menyusui bayi setiap kali bayi menunjukkan tanda lapar.", icon: "👶" },
                { id: "p2", text: "Saya menyusui bayi minimal 8-12 kali dalam 24 jam.", icon: "🕒" },
                { id: "p3", text: "Saya tidak membatasi jadwal menyusui bayi.", icon: "🗓️" },
            ]
        },
        {
            kategoriId: "posisi",
            kategoriTitle: "POSISI & TEKNIK PELEKATAN",
            items: [
                { id: "p4", text: "Saya memastikan pelekatan benar sebelum menyusui.", icon: "🤱" },
                { id: "p5", text: "Posisi tubuh bayi menghadap tubuh ibu saat menyusui.", icon: "🫂" },
                { id: "p6", text: "Mulut bayi terbuka lebar, dagu menempel pada payudara, dan sebagian besar areola masuk ke mulut bayi.", icon: "👄" },
                { id: "p7", text: "Saya tidak merasakan nyeri puting saat menyusui.", icon: "😌" },
            ]
        },
        {
            kategoriId: "durasi",
            kategoriTitle: "DURASI MENYUSUI",
            items: [
                { id: "p8", text: "Saya menyusui setiap payudara selama 10-20 menit atau sesuai kebutuhan bayi.", icon: "⏳" },
                { id: "p9", text: "Saya membiarkan bayi menyusu pada satu payudara hingga bayi melepaskan puting sendiri.", icon: "🍼" },
                { id: "p10", text: "Saya memastikan bayi mendapatkan ASI sampai bayi terlihat puas dan kenyang.", icon: "😊" },
            ]
        }
    ];

    // Fungsi Mengambil Data Riwayat
    const fetchRiwayat = async () => {
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        try {
            setIsLoadingRiwayat(true);
            const q = query(
                collection(db, "perilaku_menyusui"),
                where("userId", "==", currentUser.uid)
            );

            const querySnapshot = await getDocs(q);
            const dataRiwayat = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            dataRiwayat.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
            setRiwayat(dataRiwayat);
        } catch (error) {
            console.error("Error fetching riwayat: ", error);
        } finally {
            setIsLoadingRiwayat(false);
        }
    };

    useEffect(() => {
        if (activeTab === "history") {
            fetchRiwayat();
        }
    }, [activeTab]);

    const handleAnswer = (questionId, value) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: value
        }));
    };

    const handleSimpan = async () => {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            alert("Silakan login kembali.");
            return;
        }

        if (Object.keys(answers).length < 10) {
            alert("Mohon lengkapi semua pertanyaan sebelum menyimpan, ya Bu.");
            return;
        }

        try {
            setIsSaving(true);
            const skorFrekuensi = (answers.p1 || 0) + (answers.p2 || 0) + (answers.p3 || 0);
            const skorPosisi = (answers.p4 || 0) + (answers.p5 || 0) + (answers.p6 || 0) + (answers.p7 || 0);
            const skorDurasi = (answers.p8 || 0) + (answers.p9 || 0) + (answers.p10 || 0);
            const skorTotal = skorFrekuensi + skorPosisi + skorDurasi;

            let kategori = "baik";
            if (skorTotal <= 22) {
                kategori = "kurang";
            } else if (skorTotal >= 23 && skorTotal <= 30) {
                kategori = "cukup";
            } else {
                kategori = "baik";
            }

            let rekomendasi = [];
            if (skorFrekuensi < 10) rekomendasi.push("Tingkatkan frekuensi menyusui, susui bayi tiap kali ia meminta (on demand) minimal 8-12 kali sehari.");
            if (skorPosisi < 13) rekomendasi.push("Perbaiki teknik pelekatan. Pastikan mulut bayi terbuka lebar dan areola masuk sebagian besar agar tidak nyeri.");
            if (skorDurasi < 10) rekomendasi.push("Biarkan bayi menyusu sampai puas di satu payudara sebelum pindah ke sisi lainnya untuk memastikan ia mendapat hindmilk.");

            await addDoc(collection(db, "perilaku_menyusui"), {
                userId: currentUser.uid,
                tanggal: new Date().toISOString().split('T')[0],
                jawaban: answers,
                skorKategori: { frekuensi: skorFrekuensi, posisi: skorPosisi, durasi: skorDurasi },
                skorTotal: skorTotal,
                kategori: kategori,
                rekomendasi: rekomendasi,
                createdAt: serverTimestamp()
            });

            alert("Terima kasih! Data perilaku menyusui Anda berhasil dicatat. 🌸");
            setAnswers({});
            setActiveTab("history");
        } catch (error) {
            console.error("Error saving: ", error);
            alert("Gagal menyimpan data.");
        } finally {
            setIsSaving(false);
        }
    };

    const formatTanggal = (tglString) => {
        if (!tglString) return "-";
        return new Date(tglString).toLocaleDateString('id-ID', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
        });
    };

    return (
        // Wrapper diseragamkan dengan FoodDiary.jsx dan ChecklistKesehatan.jsx
        <div className="max-w-7xl mx-auto p-4 md:p-6 pb-24 font-sans space-y-6 mt-2">

            {/* --- HEADER MINIMALIS --- */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
                        Perilaku <span className="text-[#D81B60]">Menyusui</span>
                    </h1>
                    <p className="mt-1.5 text-gray-500 text-sm font-medium">
                        Pantau kualitas, teknik, dan kecukupan ASI bayi melalui evaluasi harian.
                    </p>
                </div>
                {/* Ikon Dekoratif Kanan Atas */}
                <div className="hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-pink-50 text-pink-300">
                    <Baby size={24} />
                </div>
            </div>

            {/* TAB NAVIGASI (Dipindahkan ke kiri agar sejajar dengan desain minimalis) */}
            <div className="flex justify-start mb-4">
                <div className="bg-white p-1.5 rounded-2xl border border-pink-100 shadow-sm inline-flex">
                    <button
                        onClick={() => setActiveTab("form")}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
                            activeTab === "form"
                                ? "bg-pink-100 text-[#D81B60] shadow-sm"
                                : "text-gray-400 hover:text-pink-400"
                        }`}
                    >
                        <ClipboardEdit size={18} />
                        Isi Evaluasi
                    </button>
                    <button
                        onClick={() => setActiveTab("history")}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
                            activeTab === "history"
                                ? "bg-pink-100 text-[#D81B60] shadow-sm"
                                : "text-gray-400 hover:text-pink-400"
                        }`}
                    >
                        <History size={18} />
                        Riwayat Saya
                    </button>
                </div>
            </div>

            {/* TAB CONTENT: FORM EVALUASI */}
            {activeTab === "form" && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {kuesionerData.map((section, index) => (
                        <div key={section.kategoriId} className="bg-white rounded-[2rem] shadow-sm border border-pink-100 overflow-hidden hover:shadow-md hover:border-pink-200 transition-all">
                            {/* Header Kategori Pink e-ASI */}
                            <div className="bg-gradient-to-r from-pink-400 to-[#FF6B9E] p-4 md:px-8 text-left">
                                <h2 className="text-white font-black text-sm md:text-base uppercase tracking-widest">
                                    {index + 1}. {section.kategoriTitle}
                                </h2>
                            </div>

                            <div className="p-4 md:p-8 divide-y divide-gray-50">
                                {section.items.map((item, i) => (
                                    <div key={item.id} className={`py-5 flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-8 ${i === 0 ? 'pt-0' : ''} ${i === section.items.length - 1 ? 'pb-0' : ''} hover:bg-pink-50/20 rounded-2xl px-2 transition-colors`}>

                                        {/* Ikon & Teks Pertanyaan */}
                                        <div className="flex gap-4 lg:w-1/2 items-start">
                                            <span className="text-2xl flex-shrink-0 bg-pink-50 w-12 h-12 flex items-center justify-center rounded-2xl border border-pink-100 shadow-sm">
                                                {item.icon}
                                            </span>
                                            <p className="text-sm md:text-base font-bold text-gray-700 leading-relaxed pt-2">
                                                {item.text}
                                            </p>
                                        </div>

                                        {/* Tombol Jawaban */}
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 lg:w-1/2 w-full">
                                            {options.map((opt) => {
                                                const isSelected = answers[item.id] === opt.value;
                                                return (
                                                    <button
                                                        key={opt.value}
                                                        onClick={() => handleAnswer(item.id, opt.value)}
                                                        className={`py-3 px-2 rounded-xl text-xs md:text-sm font-black uppercase tracking-wider transition-all border-2
                                                            ${isSelected
                                                            ? `${opt.color} border-opacity-100 shadow-sm scale-[1.02]`
                                                            : 'bg-white text-gray-400 border-gray-100 hover:border-pink-200 hover:text-pink-400'
                                                        }`}
                                                    >
                                                        {opt.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* Info Box & Tombol Simpan */}
                    <div className="bg-pink-50 rounded-[2rem] p-6 md:p-8 border border-pink-100 mt-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                        <div className="flex items-start gap-4 text-pink-600 w-full md:w-2/3">
                            <Info size={28} className="flex-shrink-0 mt-0.5" />
                            <p className="text-sm font-bold leading-relaxed">
                                Data ini akan dievaluasi oleh sistem e-ASI Care untuk memberikan rekomendasi terbaik bagi proses menyusui Anda.
                            </p>
                        </div>

                        <div className="w-full md:w-1/3 flex justify-end">
                            <button
                                onClick={handleSimpan}
                                disabled={isSaving}
                                className="w-full md:w-auto px-8 flex items-center justify-center gap-2 bg-gradient-to-r from-[#D81B60] to-[#FF6B9E] text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-pink-200 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isSaving ? "Menyimpan Data..." : <><Save size={18} strokeWidth={3} /> Simpan Evaluasi</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB CONTENT: RIWAYAT SAYA */}
            {activeTab === "history" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {isLoadingRiwayat ? (
                        <div className="py-20 text-center">
                            <div className="w-10 h-10 border-4 border-pink-100 border-t-pink-500 rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-400 font-medium">Memuat riwayat evaluasi Anda...</p>
                        </div>
                    ) : riwayat.length === 0 ? (
                        <div className="bg-white rounded-[2rem] border border-pink-100 p-12 text-center shadow-sm">
                            <Activity size={48} className="mx-auto text-pink-200 mb-4" />
                            <h3 className="text-xl font-black text-gray-800 mb-2">Belum Ada Riwayat</h3>
                            <p className="text-gray-500 max-w-md mx-auto">Anda belum pernah mengisi evaluasi perilaku menyusui. Silakan isi form evaluasi terlebih dahulu.</p>
                            <button
                                onClick={() => setActiveTab("form")}
                                className="mt-6 px-6 py-3 bg-pink-50 text-pink-600 font-bold rounded-xl hover:bg-pink-100 transition-colors"
                            >
                                Mulai Isi Evaluasi
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {riwayat.map((item) => (
                                <div key={item.id} className="bg-white rounded-3xl p-6 shadow-sm border border-pink-100 hover:shadow-md transition-shadow flex flex-col h-full">

                                    {/* Card Header */}
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                                                <Calendar size={12} /> Tanggal Evaluasi
                                            </p>
                                            <p className="text-sm font-bold text-gray-800">{formatTanggal(item.tanggal)}</p>
                                        </div>
                                        <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                                            item.kategori === 'baik' ? 'bg-green-100 text-green-700' :
                                                item.kategori === 'kurang' ? 'bg-red-100 text-red-700' :
                                                    'bg-amber-100 text-amber-700'
                                        }`}>
                                            {item.kategori || "Cukup"}
                                        </div>
                                    </div>

                                    {/* Skor Box */}
                                    <div className="bg-gray-50 rounded-2xl p-4 flex justify-between items-center mb-6 border border-gray-100">
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Total Skor</span>
                                        <span className="text-2xl font-black text-gray-900">{item.skorTotal} <span className="text-sm text-gray-400 font-medium">/ 40</span></span>
                                    </div>

                                    {/* Rekomendasi */}
                                    <div className="flex-grow">
                                        <h4 className="text-xs font-black text-pink-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <CheckCircle2 size={14} /> Catatan & Rekomendasi
                                        </h4>
                                        {item.rekomendasi && item.rekomendasi.length > 0 ? (
                                            <ul className="space-y-2">
                                                {item.rekomendasi.map((rek, idx) => (
                                                    <li key={idx} className="text-xs text-gray-600 leading-relaxed pl-3 relative before:content-[''] before:w-1.5 before:h-1.5 before:bg-pink-300 before:rounded-full before:absolute before:left-0 before:top-1.5">
                                                        {rek}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-xs text-green-600 font-medium bg-green-50 p-3 rounded-xl border border-green-100">
                                                Luar biasa! Pertahankan teknik menyusui Anda yang sudah sangat baik.
                                            </p>
                                        )}
                                    </div>

                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

        </div>
    );
}
