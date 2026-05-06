import { auth, db } from "../../../services/firebase";
import { collection, getDocs, getDoc, doc, query, where } from "firebase/firestore";

export const getAssistantResponse = async (userPrompt) => {
    try {
        const userId = auth.currentUser?.uid;
        if (!userId) throw new Error("User belum login");

        const fetchUserHistory = async (colName) => {
            try {
                const q = query(collection(db, colName), where("userId", "==", userId));
                const snap = await getDocs(q);
                return snap.docs
                    .map(d => d.data())
                    .sort((a, b) => {
                        // Dukung berbagai nama field waktu (tanggal/createdAt)
                        const timeA = a.tanggal?.seconds || a.createdAt?.seconds || 0;
                        const timeB = b.tanggal?.seconds || b.createdAt?.seconds || 0;
                        return timeB - timeA;
                    })
                    .slice(0, 3); // Ambil 3 data terbaru saja agar AI fokus ke kondisi terkini
            } catch (e) {
                console.warn(`Gagal memuat ${colName}:`, e);
                return [];
            }
        };

        const [
            userDoc,
            targetGiziDoc,
            logbookData,
            nifasData,
            menyusuiData,
            kelancaranData,
            pengetahuanData,
            sikapData,
            eduSnapshot
        ] = await Promise.all([
            getDoc(doc(db, "users", userId)),
            getDoc(doc(db, "target_gizi", userId)),
            fetchUserHistory("logbook"),
            fetchUserHistory("checklist_nifas"),
            fetchUserHistory("perilaku_menyusui"),
            fetchUserHistory("kelancaran_asi"),
            fetchUserHistory("pengetahuan_results"),
            fetchUserHistory("sikap_results"),
            getDocs(collection(db, "edukasi"))
        ]);


        // --- PROFIL BUNDA ---
        const profilUser = userDoc.exists() ? userDoc.data() : {};
        const targetGizi = targetGiziDoc.exists() ? targetGiziDoc.data() : {};
        const profilContext = `Nama: ${profilUser.username || profilUser.name || 'Bunda'}, Usia: ${targetGizi.umur || '-'} thn, Menyusui: ${targetGizi.statusMenyusui || '-'}, Target Kalori: ${targetGizi.energi || '-'} kkal.`;

        const formatHistory = (dataArray, name) => {
            if (!dataArray || dataArray.length === 0) return `- Belum ada data ${name}.`;
            return dataArray.map((item, index) => {
                // Sembunyikan ID rahasia agar AI tidak kebingungan
                const { userId, tanggal, createdAt, updated_at, ...cleanData } = item;
                return `[Terbaru ke-${index + 1}]: ${JSON.stringify(cleanData)}`;
            }).join('\n');
        };

        const eduData = eduSnapshot.docs
            .map(doc => `- ${doc.data().judul}: ${doc.data().isi || doc.data().content}`)
            .join("\n");

        const apiKey = import.meta.env.VITE_GEMINI_KEY;
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `Anda adalah Nutrina, asisten bidan cerdas, ramah, dan sangat ahli dari aplikasi e-ASI Care.
            
            Berikut adalah "Rekam Medis Digital" (Dataset) komprehensif milik Bunda yang sedang bertanya:
            
            [PROFIL & TARGET GIZI BUNDA]
            ${profilContext}

            [RIWAYAT KONSUMSI MAKANAN (LOGBOOK)]
            ${formatHistory(logbookData, "Logbook Makanan")}

            [RIWAYAT SKOR KESEHATAN NIFAS]
            ${formatHistory(nifasData, "Kesehatan Nifas")}

            [RIWAYAT PERILAKU MENYUSUI]
            ${formatHistory(menyusuiData, "Perilaku Menyusui")}

            [RIWAYAT KELANCARAN ASI]
            ${formatHistory(kelancaranData, "Kelancaran ASI")}

            [HASIL KUESIONER PENGETAHUAN & SIKAP]
            Pengetahuan: ${formatHistory(pengetahuanData, "Pengetahuan")}
            Sikap: ${formatHistory(sikapData, "Sikap")}

            [DATA EDUKASI MEDIS (Sebagai Referensi Jawaban)] 
            ${eduData}
            
            =================================
            PERTANYAAN BUNDA SAAT INI: 
            "${userPrompt}"
            =================================
            
            Instruksi Ketat untuk Nutrina:
            1. Jawab pertanyaan Bunda dengan spesifik menggunakan dataset di atas. Jika Bunda bertanya tentang kelancaran ASI-nya, baca dari bagian [RIWAYAT KELANCARAN ASI].
            2. Berbicaralah seolah-olah Anda adalah sahabat atau bidan pribadinya yang sudah tahu semua rekam jejaknya.
            3. Jawab dengan SINGKAT, praktis, dan membumi (maksimal 3-4 kalimat).
            4. DILARANG menggunakan format Markdown (tanda bintang **, bullet points, dll). Gunakan teks biasa yang rapi dan mudah dibaca di chat.
            5. Jika Bunda mengeluh sakit atau ASI tidak lancar berdasarkan riwayatnya, berikan solusi praktis dari [DATA EDUKASI MEDIS].`
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
        return "Maaf Bunda, asisten sedang memproses dan menyinkronkan rekam medis Bunda. Silakan coba sebentar lagi ya! 🙏";
    }
};