import { useState } from 'react';
import { db, auth } from "../../../../services/firebase"; // Sesuaikan path
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

// Data Soal
export const SOAL_PENGETAHUAN = [
    { no: 1, text: "Gizi seimbang bagi ibu nifas yang sedang menyusui penting untuk....", options: { a: "Menjaga kesehatan ibu dan mendukung produksi ASI", b: "Menurunkan berat badan ibu", c: "Mengurangi rasa lapar", d: "Menghindari makan berlebihan" }, correct: "a" },
    { no: 2, text: "Ibu menyusui membutuhkan tambahan energi setiap hari untuk...", options: { a: "Menambah berat badan ibu", b: "Mendukung produksi ASI", c: "Mengurangi aktivitas ibu", d: "Mengganti cairan tubuh saja" }, correct: "b" },
    { no: 3, text: "Contoh makanan yang dianjurkan untuk ibu nifas yang sedang menyusui adalah...", options: { a: "Nasi dan mie saja", b: "Nasi, lauk-pauk, sayur, dan buah", c: "Nasi dan lauk saja", d: "Buah saja" }, correct: "b" },
    { no: 4, text: "Frekuensi menyusui yang dianjurkan untuk meningkatkan produksi ASI adalah...", options: { a: "3-4 kali sehari", b: "5-6 kali sehari", c: "8-12 kali sehari atau sesuai permintaan bayi", d: "Hanya saat bayi menangis" }, correct: "c" },
    { no: 5, text: "Jenis variasi makanan penting karena....", options: { a: "Agar tidak bosan", b: "Memenuhi kebutuhan zat gizi berbeda", c: "Menghemat biaya", d: "Tidak berpengaruh" }, correct: "b" },
    { no: 6, text: "Mencuci bahan makanan sebelum dimasak bertujuan...", options: { a: "Agar terdapat rasa", b: "Menjaga keamanan pangan", c: "Agar cepat matang", d: "Tidak penting" }, correct: "b" },
    { no: 7, text: "Cairan yang cukup pada ibu menyusui berfungsi untuk...", options: { a: "Mengurangi produksi ASI", b: "Membantu kelancaran produksi ASI", c: "Menambah berat badan bayi", d: "Tidak berpengaruh" }, correct: "b" },
    { no: 8, text: "Salah satu faktor yang dapat mempengaruhi kelancaran ASI adalah....", options: { a: "Nutrisi/Gizi seimbang", b: "Warna pakaian ibu", c: "Cuaca", d: "Tempat makan" }, correct: "a" },
    { no: 9, text: "Nutrisi seimbang untuk dikonsumsi ibu nifas yang sedang menyusui mencakup:", options: { a: "Makanan Pokok, protein hewani, protein nabati, buah, sayur, air mineral", b: "Sayur saja", c: "Buah aja", d: "Air putih saja" }, correct: "a" },
    { no: 10, text: "Salah satu tanda bayi mendapatkan ASI yang cukup adalah:", options: { a: "Bayi sering menangis", b: "Bayi muntah setelah menyusu", c: "Bayi tidur sepanjang hari", d: "Bayi buang air kecil > 6 kali per hari" }, correct: "d" }
];

// Custom Hook untuk Handler Transaksi
export const useKuesionerHandler = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState(null);

    const handleSelectOption = (optionKey) => {
        setAnswers(prev => ({ ...prev, [currentIndex]: optionKey }));
    };

    const submitKuesioner = async () => {
        setIsSubmitting(true);
        let skorBenar = 0;
        const detailJawaban = [];

        SOAL_PENGETAHUAN.forEach((soal, index) => {
            const jawabanUser = answers[index] || null;
            const benar = jawabanUser === soal.correct;
            if (benar) skorBenar += 1;

            detailJawaban.push({ no: soal.no, jawabanUser, benar });
        });

        const nilaiPersen = (skorBenar / SOAL_PENGETAHUAN.length) * 100;

        let kategori = "";
        if (skorBenar >= 8) kategori = "Baik";
        else if (skorBenar >= 6) kategori = "Cukup";
        else kategori = "Kurang";

        const user = auth.currentUser;
        const finalResult = {
            userId: user?.uid || "anon",
            nama: user?.displayName || "Bunda",
            tanggal: serverTimestamp(),
            jawaban: detailJawaban,
            skorBenar,
            nilaiPersen,
            kategori
        };

        try {
            await addDoc(collection(db, "pengetahuan_results"), finalResult);
            setResult(finalResult);
        } catch (error) {
            console.error("Gagal menyimpan hasil:", error);
            alert("Terjadi kesalahan saat menyimpan data.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleNext = () => {
        if (currentIndex < SOAL_PENGETAHUAN.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            submitKuesioner();
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
    };

    return {
        currentIndex,
        answers,
        isSubmitting,
        result,
        handleSelectOption,
        handleNext,
        handlePrev
    };
};
