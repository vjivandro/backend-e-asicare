import { db } from "../../../services/firebase";
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from "firebase/firestore";

// Mengambil data asupan hari ini
export const getDailyIntake = async (userId, date) => {
    try {
        const docRef = doc(db, `users/${userId}/daily_intake/${date}`);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data();
        }
        return { meals: [], total_harian: { energi: 0, protein: 0, lemak: 0, karbohidrat: 0 } };
    } catch (error) {
        throw new Error("Gagal mengambil data harian: " + error.message);
    }
};

// Menyimpan atau memperbarui asupan makanan
export const saveFoodEntry = async (userId, date, newMeal, currentMeals) => {
    try {
        const docRef = doc(db, `users/${userId}/daily_intake/${date}`);
        const updatedMeals = [...currentMeals, newMeal];

        // Hitung akumulasi total gizi harian
        const total_harian = updatedMeals.reduce((acc, item) => ({
            energi: acc.energi + item.energi,
            protein: acc.protein + item.protein,
            lemak: acc.lemak + item.lemak,
            karbohidrat: acc.karbohidrat + item.karbohidrat
        }), { energi: 0, protein: 0, lemak: 0, karbohidrat: 0 });

        await setDoc(docRef, {
            meals: updatedMeals,
            total_harian,
            last_update: serverTimestamp()
        }, { merge: true });

        return true;
    } catch (error) {
        throw new Error("Gagal menyimpan makanan: " + error.message);
    }
};

// Tambahkan fungsi ini di userMonitoringService.js
export const deleteFoodEntry = async (userId, date, mealToDelete) => {
    try {
        const docRef = doc(db, "users", userId, "daily_intake", date);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();

            // Cari index makanan yang persis sama
            const indexToDelete = data.meals.findIndex(m =>
                m.nama === mealToDelete.nama &&
                m.waktu === mealToDelete.waktu &&
                m.kategori_waktu === mealToDelete.kategori_waktu
            );

            if (indexToDelete !== -1) {
                // Hapus 1 item dari array
                data.meals.splice(indexToDelete, 1);

                // Hitung ulang total gizi dari sisa makanan
                const newTotal = data.meals.reduce((acc, curr) => ({
                    energi: acc.energi + curr.energi,
                    protein: acc.protein + curr.protein,
                    lemak: acc.lemak + curr.lemak,
                    karbohidrat: acc.karbohidrat + curr.karbohidrat
                }), { energi: 0, protein: 0, lemak: 0, karbohidrat: 0 });

                // Update ke Firestore
                await updateDoc(docRef, {
                    meals: data.meals,
                    total_harian: newTotal
                });
            }
        }
    } catch (error) {
        throw new Error("Gagal menghapus data makanan: " + error.message);
    }
};
