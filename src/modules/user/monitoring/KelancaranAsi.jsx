import { useState, useEffect } from "react";
import { Info, Save, History, ClipboardEdit, Calendar, CheckCircle2, Droplets, Activity } from "lucide-react";
import { db, auth } from "../../../services/firebase";
import { collection, addDoc, serverTimestamp, getDocs, query, where } from "firebase/firestore";

export default function KelancaranAsi() {
    const [answers, setAnswers] = useState({});
    const [isSaving, setIsSaving] = useState(false);

    // State Tab & Riwayat
    const [activeTab, setActiveTab] = useState("form");
    const [riwayat, setRiwayat] = useState([]);
    const [isLoadingRiwayat, setIsLoadingRiwayat] = useState(false);

    // Opsi Jawaban (Skala Likert)
    const options = [
        { label: "Selalu", value: 4, color: "bg-green-100 text-green-700 border-green-300 hover:bg-green-200" },
        { label: "Sering", value: 3, color: "bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200" },
        { label: "Kadang", value: 2, color: "bg-amber-100 text-amber-700 border-amber-300 hover:bg-amber-200" },
        { label: "Tidak", value: 1, color: "bg-red-100 text-red-700 border-red-300 hover:bg-red-200" },
    ];

    // Data Instrumen Kelancaran ASI
    const kuesionerData = [
        {
            kategoriId: "nutrisi",
            kategoriTitle: "A. ASUPAN NUTRISI IBU",
            items: [
                { id: "n1", text: "Saya makan minimal tiga kali sehari selama masa menyusui.", icon: "🍽️" },
                { id: "n2", text: "Saya mengonsumsi makanan beragam (makanan pokok, protein hewani, nabati, sayur, buah) setiap hari.", icon: "🥗" },
                { id: "n3", text: "Saya minum air putih minimal 12-14 gelas per hari.", icon: "🥛" },
            ]
        },
        {
            kategoriId: "psikologis",
            kategoriTitle: "B. FAKTOR PSIKOLOGIS",
            items: [
                { id: "p1", text: "Saya merasa tenang dan bahagia saat menyusui, tidak merasa cemas atau stres.", icon: "🧘‍♀️" },
                { id: "p2", text: "Peran suami membuat saya lebih percaya diri dan tenang (suami membantu siapkan makanan & dukung ASI eksklusif).", icon: "👨‍👩‍👦" },
            ]
        },
        {
            kategoriId: "perawatan",
            kategoriTitle: "C. PERAWATAN PAYUDARA",
            items: [
                { id: "pr1", text: "Saya membersihkan payudara sebelum atau sesudah menyusui.", icon: "🧼" },
                { id: "pr2", text: "Saya rutin melakukan pijat oksitosin secara teratur untuk meningkatkan aliran ASI.", icon: "💆‍♀️" },
                { id: "pr3", text: "Payudara saya terasa kosong setelah menyusui.", icon: "🤱" },
            ]
        },
        {
            kategoriId: "indikator_bayi",
            kategoriTitle: "D. INDIKATOR BAYI",
            items: [
                { id: "i1", text: "Bayi kencing 6-10 kali dalam sehari.", icon: "🧷" },
                { id: "i2", text: "Setelah menyusu bayi akan tertidur tenang selama 2-3 jam.", icon: "😴" },
            ]
        }
    ];

    // Mengambil Riwayat Data
    const fetchRiwayat = async () => {
        const currentUser = auth.currentUser;
        if (!currentUser) return;
        try {
            setIsLoadingRiwayat(true);
            const q = query(collection(db, "kelancaran_asi"), where("userId", "==", currentUser.uid));
            const querySnapshot = await getDocs(q);
            const dataRiwayat = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            dataRiwayat.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
            setRiwayat(dataRiwayat);
        } catch (error) {
            console.error("Error fetching riwayat: ", error);
        } finally {
            setIsLoadingRiwayat(false);
        }
    };

    useEffect(() => {
        if (activeTab === "history") fetchRiwayat();
    }, [activeTab]);

    const handleAnswer = (questionId, value) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
    };

    const handleSimpan = async () => {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            alert("Silakan login kembali.");
            return;
        }

        if (Object.keys(answers).length < 10) {
            alert("Mohon lengkapi seluruh 10 indikator sebelum menyimpan.");
            return;
        }

        try {
            setIsSaving(true);
            const skorNutrisi = (answers.n1 || 0) + (answers.n2 || 0) + (answers.n3 || 0);
            const skorPsikologis = (answers.p1 || 0) + (answers.p2 || 0);
            const skorPerawatan = (answers.pr1 || 0) + (answers.pr2 || 0) + (answers.pr3 || 0);
            const skorIndikator = (answers.i1 || 0) + (answers.i2 || 0);
            const skorTotal = skorNutrisi + skorPsikologis + skorPerawatan + skorIndikator;

            let kategori = "baik";
            let status = "lancar";
            if (skorTotal <= 22) {
                kategori = "kurang";
                status = "hambatan tinggi";
            } else if (skorTotal >= 23 && skorTotal <= 30) {
                kategori = "cukup";
                status = "hambatan ringan";
            }

            let rekomendasi = [];
            if (skorNutrisi <= 9) rekomendasi.push("Tingkatkan asupan nutrisi harian (makan bergizi 3x sehari) dan penuhi cairan minimal 12-14 gelas.");
            if (skorPsikologis <= 6) rekomendasi.push("Kelola stres dengan baik, perbanyak istirahat, dan minta bantuan suami untuk menjaga mood tetap bahagia.");
            if (skorPerawatan <= 9) rekomendasi.push("Lakukan perawatan payudara yang rutin (kompres hangat/bersihkan) dan pijat oksitosin untuk merangsang LDR (Let Down Reflex).");
            if (skorIndikator <= 6) rekomendasi.push("Perhatikan tanda kecukupan ASI bayi. Jika bayi kurang pipis (<6x/hari) atau rewel, tingkatkan frekuensi menyusui segera.");

            await addDoc(collection(db, "kelancaran_asi"), {
                userId: currentUser.uid,
                tanggal: new Date().toISOString().split('T')[0],
                jawaban: answers,
                skorKategori: { nutrisi: skorNutrisi, psikologis: skorPsikologis, perawatan: skorPerawatan, indikator_bayi: skorIndikator },
                skorTotal: skorTotal,
                kategori: kategori,
                status: status,
                rekomendasi: rekomendasi,
                createdAt: serverTimestamp()
            });

            alert("Hebat! Evaluasi kelancaran ASI Anda hari ini berhasil disimpan. 💧");
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
        return new Date(tglString).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    };

    return (
        // Wrapper diseragamkan
        <div className="max-w-7xl mx-auto p-4 md:p-6 pb-24 font-sans space-y-6 mt-2">

            {/* --- HEADER MINIMALIS --- */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
                        Kelancaran <span className="text-[#D81B60]">ASI</span>
                    </h1>
                    <p className="mt-1.5 text-gray-500 text-sm font-medium">
                        Evaluasi 4 pilar utama untuk memastikan produksi dan pengeluaran ASI Anda berjalan optimal setiap hari.
                    </p>
                </div>
                {/* Ikon Dekoratif Kanan Atas */}
                <div className="hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-pink-50 text-pink-300">
                    <Droplets size={24} />
                </div>
            </div>

            {/* TAB NAVIGASI (Rata Kiri) */}
            <div className="flex justify-start mb-4">
                <div className="bg-white p-1.5 rounded-2xl border border-pink-100 shadow-sm inline-flex">
                    <button onClick={() => setActiveTab("form")} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === "form" ? "bg-pink-100 text-[#D81B60] shadow-sm" : "text-gray-400 hover:text-pink-400"}`}>
                        <ClipboardEdit size={18} /> Isi Evaluasi
                    </button>
                    <button onClick={() => setActiveTab("history")} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === "history" ? "bg-pink-100 text-[#D81B60] shadow-sm" : "text-gray-400 hover:text-pink-400"}`}>
                        <History size={18} /> Riwayat Kelancaran
                    </button>
                </div>
            </div>

            {/* FORM EVALUASI */}
            {activeTab === "form" && (
                <div className="space-y-8 animate-in fade-in duration-500">
                    {kuesionerData.map((section, index) => (
                        <div key={section.kategoriId} className="bg-white rounded-[2rem] shadow-sm border border-pink-100 overflow-hidden hover:shadow-md hover:border-pink-200 transition-all">
                            {/* Kategori Header */}
                            <div className="bg-gradient-to-r from-pink-400 to-[#FF6B9E] p-4 md:px-8 text-left">
                                <h2 className="text-white font-black text-sm md:text-base uppercase tracking-widest">
                                    {section.kategoriTitle}
                                </h2>
                            </div>
                            <div className="p-4 md:p-8 divide-y divide-gray-50">
                                {section.items.map((item, i) => (
                                    <div key={item.id} className={`py-5 flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-8 ${i === 0 ? 'pt-0' : ''} ${i === section.items.length - 1 ? 'pb-0' : ''} hover:bg-pink-50/20 rounded-2xl px-2 transition-colors`}>
                                        <div className="flex gap-4 lg:w-1/2 items-start">
                                            {/* Box Icon */}
                                            <span className="text-2xl flex-shrink-0 bg-pink-50 w-12 h-12 flex items-center justify-center rounded-2xl border border-pink-100 shadow-sm">
                                                {item.icon}
                                            </span>
                                            <p className="text-sm md:text-base font-bold text-gray-700 leading-relaxed pt-2">
                                                {item.text}
                                            </p>
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 lg:w-1/2 w-full">
                                            {options.map((opt) => (
                                                <button
                                                    key={opt.value}
                                                    onClick={() => handleAnswer(item.id, opt.value)}
                                                    className={`py-3 px-2 rounded-xl text-xs md:text-sm font-black uppercase tracking-wider transition-all border-2 ${answers[item.id] === opt.value ? `${opt.color} border-opacity-100 shadow-sm scale-[1.02]` : 'bg-white text-gray-400 border-gray-100 hover:border-pink-200 hover:text-pink-400'}`}
                                                >
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* Info Box */}
                    <div className="bg-pink-50 rounded-[2rem] p-6 md:p-8 border border-pink-100 mt-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                        <div className="flex items-start gap-4 text-pink-600 w-full md:w-2/3">
                            <Info size={28} className="flex-shrink-0 mt-0.5" />
                            <p className="text-sm font-bold leading-relaxed">
                                Pastikan ibu menjawab jujur sesuai kondisi hari ini. Sistem akan menganalisis hambatan produksi ASI dan memberikan rekomendasi yang tepat.
                            </p>
                        </div>
                        <div className="w-full md:w-1/3 flex justify-end">
                            <button onClick={handleSimpan} disabled={isSaving} className="w-full md:w-auto px-8 flex items-center justify-center gap-2 bg-gradient-to-r from-[#D81B60] to-[#FF6B9E] text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-pink-200 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed">
                                {isSaving ? "Menyimpan..." : <><Save size={18} strokeWidth={3} /> Simpan Data</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB RIWAYAT */}
            {activeTab === "history" && (
                <div className="space-y-6 animate-in fade-in duration-500">
                    {isLoadingRiwayat ? (
                        <div className="py-20 text-center"><div className="w-10 h-10 border-4 border-pink-100 border-t-pink-500 rounded-full animate-spin mx-auto mb-4"></div><p className="text-gray-400 font-medium">Memuat data...</p></div>
                    ) : riwayat.length === 0 ? (
                        <div className="bg-white rounded-[2rem] border border-pink-100 p-12 text-center shadow-sm">
                            <Droplets size={48} className="mx-auto text-pink-200 mb-4" />
                            <h3 className="text-xl font-black text-gray-800 mb-2">Belum Ada Evaluasi</h3>
                            <p className="text-gray-500 max-w-md mx-auto">Anda belum mencatat kondisi kelancaran ASI. Silakan isi form di tab sebelah.</p>
                            <button onClick={() => setActiveTab("form")} className="mt-6 px-6 py-3 bg-pink-50 text-pink-600 font-bold rounded-xl hover:bg-pink-100 transition-colors">
                                Mulai Isi Evaluasi
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {riwayat.map((item) => (
                                <div key={item.id} className="bg-white rounded-3xl p-6 shadow-sm border border-pink-100 flex flex-col h-full hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5 mb-1"><Calendar size={12} /> Tanggal Evaluasi</p>
                                            <p className="text-sm font-bold text-gray-800">{formatTanggal(item.tanggal)}</p>
                                        </div>
                                        <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${item.kategori === 'baik' ? 'bg-green-100 text-green-700' : item.kategori === 'kurang' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                            {item.kategori || "Cukup"}
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 rounded-2xl p-4 flex justify-between items-center mb-6 border border-gray-100">
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Total Skor</span>
                                        <span className="text-2xl font-black text-gray-900">{item.skorTotal} <span className="text-sm text-gray-400 font-medium">/ 40</span></span>
                                    </div>
                                    <div className="flex-grow">
                                        <h4 className="text-xs font-black text-pink-500 uppercase tracking-widest mb-3 flex items-center gap-2"><CheckCircle2 size={14} /> Analisis & Rekomendasi</h4>
                                        {item.rekomendasi && item.rekomendasi.length > 0 ? (
                                            <ul className="space-y-2">{item.rekomendasi.map((rek, idx) => (<li key={idx} className="text-xs text-gray-600 leading-relaxed pl-3 relative before:content-[''] before:w-1.5 before:h-1.5 before:bg-pink-300 before:rounded-full before:absolute before:left-0 before:top-1.5">{rek}</li>))}</ul>
                                        ) : (<p className="text-xs text-green-600 font-medium bg-green-50 p-3 rounded-xl border border-green-100">Produksi ASI Anda sangat lancar, tidak ada hambatan.</p>)}
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
