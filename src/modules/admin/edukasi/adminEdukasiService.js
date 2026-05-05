import {collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp} from "firebase/firestore";
import { db } from "../../../services/firebase.js";

const col = collection(db, "edukasi");

export const getEdukasi = async () => {
    const snapshot = await getDocs(col);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
};

// Fungsi ini yang dipanggil oleh AdminEdukasi.jsx saat tambah data baru
export const createEdukasi = async (data) => {
    try {
        // 1. Simpan materi edukasi
        const docRef = await addDoc(col, {
            ...data,
            kategori: Number(data.kategori),
            date: data.date ? new Date(data.date) : null,
            created_at: new Date(),
        });

        // 2. Kirim Notifikasi Global ke semua User
        await addDoc(collection(db, "notifications"), {
            title: "Materi Edukasi Baru! 📚",
            body: `Admin baru saja menambahkan materi edukasi. Yuk pelajari sekarang untuk mendukung ASI eksklusif Bunda!`,
            type: "edukasi",
            target: "all",
            readBy: [], // Array kosong, nanti diisi UID user yang baca
            createdAt: serverTimestamp(),
            link: "/user/edukasi"
        });

        return docRef;
    } catch (error) {
        console.error("Error saat create edukasi:", error);
        throw error;
    }
};

// Fungsi ini yang dipanggil saat edit data
export const updateEdukasi = async (id, data) => {
    try {
        // 1. Update materi edukasi
        await updateDoc(doc(db, "edukasi", id), {
            ...data,
            kategori: Number(data.kategori),
            date: data.date ? new Date(data.date) : null,
        });

        // 2. Kirim Notifikasi Global bahwa ada update
        await addDoc(collection(db, "notifications"), {
            title: "Pembaruan Materi Edukasi! ✨",
            body: `Ada pembaruan informasi pada materi edukasi Bunda. Cek sekarang yuk!`,
            type: "edukasi",
            target: "all",
            readBy: [],
            createdAt: serverTimestamp(),
            link: "/user/edukasi"
        });
    } catch (error) {
        console.error("Error saat update edukasi:", error);
        throw error;
    }
};

export const deleteEdukasi = async (id) => {
    return await deleteDoc(doc(db, "edukasi", id));
};