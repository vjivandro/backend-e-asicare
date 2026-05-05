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

export const createEdukasi = async (data) => {
    return await addDoc(col, {
        ...data,
        kategori: Number(data.kategori),
        date: data.date ? new Date(data.date) : null,
        created_at: new Date(),
    });
};

export const updateEdukasi = async (id, data) => {
    return await updateDoc(doc(db, "edukasi", id), {
        ...data,
        kategori: Number(data.kategori),
        date: data.date ? new Date(data.date) : null,
    });
};

export const deleteEdukasi = async (id) => {
    return await deleteDoc(doc(db, "edukasi", id));
};

export const addEdukasi = async (dataEdukasi) => {
    try {
        const docRef = await addDoc(collection(db, "edukasi"), dataEdukasi);

        await addDoc(collection(db, "notifications"), {
            title: "Materi Edukasi Baru! 📚",
            body: `Admin baru saja memperbarui materi edukasi. Yuk pelajari sekarang untuk mendukung ASI eksklusif Bunda!`,
            type: "edukasi",
            target: "all",
            readBy: [],
            createdAt: serverTimestamp(),
            link: "/user/edukasi"
        });

        return docRef;
    } catch (error) {
        console.error("Error adding document: ", error);
        throw error;
    }
};

