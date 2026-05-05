import { db } from "../../../services/firebase";
import {collection, addDoc, serverTimestamp, doc, deleteDoc} from "firebase/firestore";

const compressImage = (file, maxWidth = 1024, quality = 0.7) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onerror = (err) => reject(err); // Tangkap error jika gambar korup
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                // Menggunakan imageSmoothingEnabled untuk stabilitas mobile
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(img, 0, 0, width, height);

                const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
                resolve(compressedBase64);
            };
        };
        reader.onerror = (err) => reject(err);
    });
};

export const uploadGalleryPhotoBase64 = async (userId, file, photoData) => {
    try {
        // 1. Jalankan Kompresi Otomatis jika file > 1MB atau langsung kompres untuk hemat ruang
        let base64String;
        if (file.size > 1000000) {
            // Jika > 1MB, kecilkan maksimal lebar ke 1024px dan kualitas 70%
            base64String = await compressImage(file, 1024, 0.7);
        } else {
            // Jika sudah kecil, tetap lewatkan kompresi ringan (kualitas 90%) agar format konsisten
            base64String = await compressImage(file, 1280, 0.9);
        }

        // 2. Logika Penamaan Unik
        const sekarang = new Date();
        const tgl = sekarang.toISOString().split('T')[0];
        const waktu = `${sekarang.getHours()}${sekarang.getMinutes()}${sekarang.getSeconds()}`;
        const namaAsli = file.name.split('.').slice(0, -1).join('.');
        const namaUnik = `${namaAsli}_image-${tgl}-${waktu}`;

        // 3. Simpan ke Firestore
        const docRef = await addDoc(collection(db, "gallery"), {
            userId: userId,
            image: base64String,
            filename: namaUnik,
            category: photoData.category,
            date: photoData.date,
            createdAt: serverTimestamp()
        });

        return { id: docRef.id, url: base64String };
    } catch (error) {
        console.error("Upload error:", error);
        throw error;
    }
};

export const deleteGalleryPhoto = async (photoId) => {
    try {
        const docRef = doc(db, "gallery", photoId);
        await deleteDoc(docRef);
        return true;
    } catch (error) {
        console.error("Error deleting photo:", error);
        throw error;
    }
};
