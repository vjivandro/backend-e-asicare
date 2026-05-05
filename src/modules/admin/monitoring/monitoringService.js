import { db } from "../../../services/firebase.js";
import { collection, getDocs } from "firebase/firestore";

// DATA AKG IBU atau GIZI
export const getAKG = async () => {
    const snapshot = await getDocs(collection(db, "akg_ibu"));
    return snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => a.usia_min - b.usia_min);
};

// KELANCARAN ASI
export const getKelancaranASI = async () => {
    const snapshot = await getDocs(collection(db, "kelancaran_asi"));
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
};

// PRILAKU MENYUSUI
export const getPerilakuMenyusui = async () => {
    const snapshot = await getDocs(collection(db, "perilaku_menyusui"));
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
};
