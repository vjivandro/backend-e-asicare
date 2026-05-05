import {auth, db} from "../../../services/firebase";
import {collection, getDocs, limit, orderBy, query, where} from "firebase/firestore";

export const getAssistantResponse = async (userPrompt) => {
    try {
        const userId = auth.currentUser?.uid;
        if (!userId) throw new Error("User belum login");

        // 1. Ambil Data Logbook / Riwayat User (Dibatasi 7 hari terakhir agar token hemat)
        const logbookRef = collection(db, "logbook");
        const qLogbook = query(
            logbookRef,
            where("userId", "==", userId),
            orderBy("tanggal", "desc"),
            limit(7) // Ambil seminggu terakhir
        );

        // [PERBAIKAN 1]: Eksekusi query logbook di sini
        const logbookSnapshot = await getDocs(qLogbook);
        const userDataContext = logbookSnapshot.docs
            .map(doc => `- Tgl: ${doc.data().tanggal}, Catatan: ${doc.data().catatan}, Kendala: ${doc.data().kendala || 'Tidak ada'}`)
            .join("\n");

        // 2. Ambil Data Edukasi
        const eduSnapshot = await getDocs(collection(db, "edukasi"));
        const eduData = eduSnapshot.docs
            .map(doc => `- ${doc.data().judul}: ${doc.data().isi || doc.data().content}`)
            .join("\n");

        const apiKey = import.meta.env.VITE_GEMINI_KEY;

        // Gunakan nama model 'gemini-flash-latest' sesuai contoh curl
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
            // [PERBAIKAN 2]: Method dan headers wajib disertakan
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `Anda adalah Nutrina, asisten ahli laktasi dari aplikasi e-ASI Care.
            
            Berikut riwayat logbook Bunda beberapa hari terakhir:
            ${userDataContext || "Belum ada catatan riwayat."}

            Data edukasi medis: 
            ${eduData}
            
            Pertanyaan Bunda: ${userPrompt}
            
            Instruksi PENTING:
            1. Jawab dengan sangat SINGKAT, padat, dan langsung ke poinnya (maksimal 2-3 kalimat pendek).
            2. JANGAN menggunakan format Markdown sama sekali. DILARANG menggunakan tanda bintang (**) untuk teks tebal atau miring. Gunakan teks biasa saja.
            3. Berikan dukungan yang natural, praktis, dan membumi. DILARANG bersikap terlalu puitis, berlebihan, atau mengutip tokoh terkenal.
            4. Fokus berikan solusi praktis berdasarkan data edukasi atau riwayat Bunda.`
                    }]
                }]
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error?.message || "Gagal konek ke Gemini");
        }

        return data.candidates[0].content.parts[0].text;

    } catch (error) {
        console.error("Gemini Error:", error);
        return "Maaf Bunda, asisten sedang sinkronisasi data. Boleh tanya lagi sebentar lagi? 🙏";
    }
};
