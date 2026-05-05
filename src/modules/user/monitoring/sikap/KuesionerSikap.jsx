import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, CheckCircle2, AlertCircle, RefreshCcw, Check } from 'lucide-react';
import { SOAL_SIKAP, useSikapHandler } from './useSikapHandler.js';

export default function KuesionerSikap() {
    const navigate = useNavigate();

    const {
        currentIndex,
        answers,
        isSubmitting,
        result,
        handleSelectOption,
        handleNext,
        handlePrev
    } = useSikapHandler();

    // --- VIEW: HASIL PENILAIAN ---
    if (result) {
        const isPositif = result.kategori === "Positif";
        return (
            <div className="max-w-5xl mx-auto p-4 md:p-8 min-h-screen">
                <div className="mb-6 md:mb-10 text-center md:text-left mt-4 md:mt-0">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                        Hasil <span className="text-[#D81B60]">Sikap Ibu</span>
                    </h1>
                    <p className="mt-2 text-gray-500 text-sm md:text-base">
                        Evaluasi pandangan dan sikap Ibu terhadap gizi seimbang serta kelancaran ASI.
                    </p>
                </div>

                <div className="bg-white p-8 md:p-12 rounded-[2rem] shadow-xl w-full max-w-3xl mx-auto text-center border border-pink-50">
                    {isPositif ? (
                        <CheckCircle2 className="w-24 h-24 text-emerald-500 mx-auto mb-6" />
                    ) : (
                        <AlertCircle className="w-24 h-24 text-rose-500 mx-auto mb-6" />
                    )}

                    <div className="bg-pink-50/50 rounded-3xl p-8 mb-8 border border-pink-100">
                        <p className="text-7xl font-black text-[#D81B60] mb-4">{result.nilaiPersen}%</p>
                        <span className={`inline-block px-6 py-2.5 rounded-full text-sm font-bold tracking-widest uppercase ${
                            isPositif ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                        }`}>
              Kategori: Sikap {result.kategori}
            </span>
                    </div>

                    <div className="text-left text-base text-gray-600 bg-gray-50 p-6 md:p-8 rounded-2xl border border-gray-100 mb-10">
                        <span className="font-bold text-gray-900 block mb-3 text-lg">💡 Interpretasi & Saran:</span>
                        <p className="leading-relaxed">
                            {isPositif
                                ? "Bunda memiliki sikap yang positif dan sangat mendukung terhadap pemenuhan gizi seimbang dan pemberian ASI. Terus pertahankan keyakinan ini demi kesehatan Bunda dan buah hati!"
                                : "Sikap Bunda terhadap gizi dan ASI saat ini masih perlu ditingkatkan. Jangan ragu untuk berkonsultasi dengan pendamping atau membaca edukasi di aplikasi agar Bunda lebih yakin menjalani masa menyusui."}
                        </p>
                    </div>

                    <button
                        onClick={() => navigate('/user/home')}
                        className="w-full md:w-auto md:px-16 py-4 bg-[#D81B60] text-white font-bold rounded-xl shadow-lg hover:bg-pink-700 transition-all text-lg"
                    >
                        Selesai & Kembali
                    </button>
                </div>
            </div>
        );
    }

    // --- VIEW: KUESIONER AKTIF ---
    const currentSoal = SOAL_SIKAP[currentIndex];
    const isAnswered = answers[currentIndex] !== undefined;

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8 min-h-screen flex flex-col">
            <div className="mb-6 md:mb-8 text-center md:text-left mt-4 md:mt-0">
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                    Kuesioner <span className="text-[#D81B60]">Sikap</span>
                </h1>
                <p className="mt-2 text-gray-500 text-sm md:text-base max-w-2xl">
                    Berikan penilaian sejujurnya berdasarkan apa yang Ibu yakini dan rasakan saat ini.
                </p>
            </div>

            <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 flex flex-col md:flex-row overflow-hidden flex-1 md:min-h-[600px]">

                {/* KOLOM KIRI: Stepper / Navigator */}
                <div className="w-full md:w-1/3 bg-gray-50/50 p-6 md:p-8 md:border-r border-gray-100 hidden md:block overflow-y-auto">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-lg font-bold text-gray-800">Proses Kuesioner</h2>
                        <div className="w-12 h-12 rounded-full border-4 border-pink-100 flex items-center justify-center">
                            <span className="text-xs font-bold text-[#D81B60]">{currentIndex + 1}/{SOAL_SIKAP.length}</span>
                        </div>
                    </div>

                    <div className="space-y-0 relative">
                        {SOAL_SIKAP.map((soal, index) => {
                            const isActive = index === currentIndex;
                            const hasAnswered = answers[index] !== undefined;
                            const isLast = index === SOAL_SIKAP.length - 1;

                            return (
                                <div key={index} className="relative flex items-start group">
                                    {!isLast && (
                                        <div className={`absolute left-[15px] top-8 bottom-[-16px] w-[2px] transition-colors duration-300 ${
                                            hasAnswered ? 'bg-emerald-400' : 'bg-gray-200 border-dashed border-l-2'
                                        }`}></div>
                                    )}

                                    <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                                        isActive ? 'bg-[#2B3674] text-white shadow-md' :
                                            hasAnswered ? 'bg-emerald-50 text-emerald-500 border border-emerald-200' :
                                                'bg-white border-2 border-gray-200 text-gray-400'
                                    }`}>
                                        {hasAnswered && !isActive ? <Check className="w-4 h-4" /> : <span className="text-xs font-bold">{index + 1}</span>}
                                    </div>

                                    <div className={`ml-4 pt-1.5 pb-6 transition-colors duration-300 ${
                                        isActive ? 'text-gray-900 font-bold' :
                                            hasAnswered ? 'text-gray-600 font-medium' : 'text-gray-400'
                                    }`}>
                                        Pernyataan {index + 1}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* KOLOM KANAN: Konten Kuesioner */}
                <div className="w-full md:w-2/3 p-6 md:p-12 flex flex-col bg-white">
                    <div className="md:hidden flex justify-between items-center mb-6 pb-6 border-b border-gray-100">
                        <span className="font-bold text-gray-800">Proses Kuesioner</span>
                        <span className="text-sm font-bold text-[#D81B60] bg-pink-50 px-4 py-1.5 rounded-full">
              {currentIndex + 1} / {SOAL_SIKAP.length}
            </span>
                    </div>

                    <div className="flex-1">
                        <h2 className="text-xl md:text-2xl font-bold text-[#2B3674] mb-8 leading-relaxed">
                            "{currentSoal.text}"
                        </h2>

                        {/* Pilihan Jawaban Likert */}
                        <div className="space-y-4">
                            {/* Object.entries di-reverse agar Urutan Tampil: Sangat Setuju di atas, Sangat Tidak Setuju di bawah */}
                            {Object.entries(currentSoal.options).reverse().map(([score, value]) => (
                                <button
                                    key={score}
                                    onClick={() => handleSelectOption(score)}
                                    className={`w-full text-left p-5 rounded-2xl border transition-all duration-200 flex items-center gap-4 group ${
                                        answers[currentIndex] === parseInt(score)
                                            ? "border-[#D81B60] bg-pink-50/30 shadow-sm"
                                            : "border-gray-200 hover:border-pink-300 hover:bg-gray-50"
                                    }`}
                                >
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                                        answers[currentIndex] === parseInt(score) ? "border-[#D81B60]" : "border-gray-300 group-hover:border-pink-300"
                                    }`}>
                                        {answers[currentIndex] === parseInt(score) && <div className="w-3 h-3 rounded-full bg-[#D81B60]"></div>}
                                    </div>

                                    <span className={`text-base md:text-lg ${answers[currentIndex] === parseInt(score) ? "text-gray-900 font-medium" : "text-gray-600"}`}>
                    {value}
                  </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Footer Navigasi */}
                    <div className="mt-10 pt-8 border-t border-gray-100 flex items-center justify-between gap-4">
                        <button
                            onClick={handlePrev}
                            disabled={currentIndex === 0}
                            className={`flex items-center justify-center w-12 h-12 md:w-auto md:px-6 md:py-3.5 rounded-xl font-bold transition-colors ${
                                currentIndex === 0 ? "text-gray-300 bg-gray-50 cursor-not-allowed" : "text-gray-600 bg-gray-100 hover:bg-gray-200"
                            }`}
                        >
                            <ChevronLeft className="w-5 h-5 md:mr-2" />
                            <span className="hidden md:block">Kembali</span>
                        </button>

                        <button
                            onClick={handleNext}
                            disabled={!isAnswered || isSubmitting}
                            className={`flex-1 md:flex-none md:px-10 py-3.5 rounded-xl font-bold flex justify-center items-center transition-all shadow-sm ${
                                isAnswered
                                    ? "bg-blue-500 text-white shadow-blue-200 hover:bg-blue-600"
                                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                            }`}
                        >
                            {isSubmitting ? (
                                <RefreshCcw className="w-5 h-5 animate-spin" />
                            ) : currentIndex === SOAL_SIKAP.length - 1 ? (
                                "Kirim Jawaban"
                            ) : (
                                <>Selanjutnya <ChevronRight className="w-5 h-5 ml-2" /></>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
