import { useState } from 'react';
import { db, auth } from "../../../../services/firebase";
import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";

// Data Soal Sikap dari Instrumen
export const SOAL_SIKAP = [
    { no: 1, text: "Saya percaya bahwa gizi seimbang berpengaruh terhadap kelancaran ASI.", options: { 4: "Sangat Setuju", 3: "Setuju", 2: "Tidak Setuju", 1: "Sangat Tidak Setuju" } },
    { no: 2, text: "Saya merasa bahwa makan makanan yang beragam (makanan pokok, lauk, sayur, dan buah) dapat membantu menjaga kesehatan selama menyusui.", options: { 4: "Sangat Setuju", 3: "Setuju", 2: "Tidak Setuju", 1: "Sangat Tidak Setuju" } },
    { no: 3, text: "Saya berpendapat bahwa ibu menyusui perlu menambah asupan makanan untuk mendukung produksi ASI.", options: { 4: "Sangat Setuju", 3: "Setuju", 2: "Tidak Setuju", 1: "Sangat Tidak Setuju" } },
    { no: 4, text: "Saya merasa bahwa menyusui bayi sesering mungkin dapat membantu meningkatkan produksi ASI.", options: { 4: "Sangat Setuju", 3: "Setuju", 2: "Tidak Setuju", 1: "Sangat Tidak Setuju" } },
    { no: 5, text: "Saya percaya bahwa posisi dan teknik menyusui yang benar penting untuk keberhasilan menyusui.", options: { 4: "Sangat Setuju", 3: "Setuju", 2: "Tidak Setuju", 1: "Sangat Tidak Setuju" } },
    { no: 6, text: "Saya berpendapat bahwa menjaga kondisi emosi tetap tenang dapat membantu kelancaran produksi ASI.", options: { 4: "Sangat Setuju", 3: "Setuju", 2: "Tidak Setuju", 1: "Sangat Tidak Setuju" } },
    { no: 7, text: "Saya merasa penting untuk menjaga kebersihan payudara sebelum menyusui bayi.", options: { 4: "Sangat Setuju", 3: "Setuju", 2: "Tidak Setuju", 1: "Sangat Tidak Setuju" } },
    { no: 8, text: "Saya percaya bahwa pemberian ASI secara eksklusif sangat bermanfaat bagi kesehatan bayi.", options: { 4: "Sangat Setuju", 3: "Setuju", 2: "Tidak Setuju", 1: "Sangat Tidak Setuju" } },
    { no: 9, text: "Saya berpendapat bahwa ibu menyusui perlu memperhatikan pola makan yang sehat setiap hari.", options: { 4: "Sangat Setuju", 3: "Setuju", 2: "Tidak Setuju", 1: "Sangat Tidak Setuju" } },
    { no: 10, text: "Saya merasa bahwa peran suami sangat penting bagi ibu selama masa menyusui.", options: { 4: "Sangat Setuju", 3: "Setuju", 2: "Tidak Setuju", 1: "Sangat Tidak Setuju" } }
];

// Custom Hook untuk Handler Transaksi Sikap
export const useSikapHandler = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState(null);

    const handleSelectOption = (scoreValue) => {
        setAnswers(prev => ({ ...prev, [currentIndex]: parseInt(scoreValue) }));
    };

    const submitKuesioner = async () => {
        setIsSubmitting(true);
        let totalSkor = 0;
        const detailJawaban = [];

        // Kalkulasi Skor Likert
        SOAL_SIKAP.forEach((soal, index) => {
            const skorUser = answers[index] || 0;
            totalSkor += skorUser;

            detailJawaban.push({
                no: soal.no,
                jawabanTeks: soal.options[skorUser],
                skor: skorUser
            });
        });

        // Rumus: (Skor diperoleh / Skor maksimal) x 100
        const SKOR_MAKSIMAL = 40;
        const nilaiPersen = (totalSkor / SKOR_MAKSIMAL) * 100;

        // Penentuan Kategori (>= 56% Positif, < 56% Negatif)
        const kategori = nilaiPersen >= 56 ? "Positif" : "Negatif";

        const user = auth.currentUser;
        let namaUser = user?.displayName || "Bunda";

        // Proses penarikan nama dari Firestore
        if (user) {
            try {
                const userDocRef = doc(db, "users", user.uid);
                const userDocSnap = await getDoc(userDocRef);

                if (userDocSnap.exists()) {
                    const userData = userDocSnap.data();
                    console.log("Data User dari Firestore:", userData);
                    namaUser = userData.name || userData.username || userData.nama || namaUser;
                    console.log("Nama yang akan disimpan:", namaUser);
                } else {
                    console.log("Dokumen user TIDAK DITEMUKAN di koleksi 'users' dengan UID:", user.uid);
                }
            } catch (error) {
                console.error("Gagal mengambil nama dari dokumen user:", error);
            }
        }

        const finalResult = {
            userId: user?.uid || "anon",
            nama: namaUser, // Menggunakan nama valid dari database
            tanggal: serverTimestamp(),
            jawaban: detailJawaban,
            totalSkor,
            nilaiPersen: Math.round(nilaiPersen), // Dibulatkan agar rapi
            kategori
        };

        try {
            await addDoc(collection(db, "sikap_results"), finalResult);
            setResult(finalResult);
        } catch (error) {
            console.error("Gagal menyimpan hasil sikap:", error);
            alert("Terjadi kesalahan saat menyimpan data.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleNext = () => {
        if (currentIndex < SOAL_SIKAP.length - 1) {
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
