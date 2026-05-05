import React, { useState, useRef, useEffect } from 'react';
import { Trash2, Calendar, Upload, X, Plus, Image as GalleryIcon } from 'lucide-react';
import { auth, db } from "../../../services/firebase";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { deleteGalleryPhoto, uploadGalleryPhotoBase64 } from "./galleryService.js";

export default function Gallery() {
    const [photos, setPhotos] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState("Semua");
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        const q = query(
            collection(db, "gallery"),
            where("userId", "==", currentUser.uid),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const docs = snapshot.docs.map(doc => {
                const data = doc.data();
                let rawImage = data.image || data.url;

                if (rawImage && !rawImage.startsWith('data:image')) {
                    rawImage = `data:image/jpeg;base64,${rawImage}`;
                }

                return {
                    id: doc.id,
                    url: rawImage,
                    title: data.filename || data.title || "Untitled",
                    date: data.date || "Tanpa Tanggal",
                    ...data
                };
            });
            setPhotos(docs);
        });

        return () => unsubscribe();
    }, []);

    const handleFile = async (files) => {
        const file = files[0];
        const currentUser = auth.currentUser;

        if (file && file.type.startsWith('image/') && currentUser) {
            try {
                setIsSaving(true);
                if (file.size > 10 * 1024 * 1024) {
                    alert("File terlalu besar, maksimal 10MB untuk dikompres otomatis.");
                    return;
                }

                const photoMetadata = {
                    date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                };

                await uploadGalleryPhotoBase64(currentUser.uid, file, photoMetadata);
                setShowUploadModal(false);
            } catch (error) {
                console.error("Gagal memproses gambar:", error);
                alert("Gagal memproses gambar.");
            } finally {
                setIsSaving(false);
            }
        }
    };

    const handleDelete = async (photoId) => {
        if (!window.confirm("Apakah Mas Juris yakin ingin menghapus foto ini secara permanen?")) return;
        try {
            await deleteGalleryPhoto(photoId);
            alert("Foto berhasil dihapus!");
        } catch (error) {
            console.error("Gagal menghapus:", error);
            alert("Gagal menghapus foto.");
        }
    };

    // Logika Pengelompokan Bulan & Tahun untuk Filter
    const existingMonths = ["Semua", ...new Set(photos.map(p => {
        const parts = p.date.split(' ');
        // Mengambil format "Mei 2026" dari string "1 Mei 2026"
        return parts.length >= 3 ? `${parts[1]} ${parts[2]}` : "Lainnya";
    }))];

    return (
        <div className="max-w-7xl mx-auto space-y-8 p-4 md:p-6 mt-2 font-sans pb-24">

            {/* Header Minimalis */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
                        Galeri <span className="text-[#D81B60]">Foto</span>
                    </h1>
                    <p className="mt-1.5 text-gray-500 text-sm font-medium">
                        Dokumentasi perjalanan menyusui Anda.
                    </p>
                </div>
                <button
                    onClick={() => setShowUploadModal(true)}
                    className="flex items-center gap-2 bg-gradient-to-r from-[#D81B60] to-[#FF6B9E] text-white px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-pink-100 hover:scale-[1.02] active:scale-95 transition-all"
                >
                    <Plus size={20} strokeWidth={3}/>
                    <span className="hidden sm:block">Tambah Foto</span>
                </button>
            </div>

            {/* Filter Waktu (Bulan & Tahun) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                {existingMonths.map((month) => (
                    <button
                        key={month}
                        onClick={() => setSelectedMonth(month)}
                        className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border
                        ${selectedMonth === month
                            ? 'bg-pink-100 text-[#D81B60] border-pink-200 shadow-sm'
                            : 'bg-white text-gray-400 hover:text-pink-400 border-gray-100'}`}
                    >
                        {month}
                    </button>
                ))}
            </div>

            {/* Grid Foto Utama */}
            {photos.length === 0 ? (
                <div className="bg-white rounded-[2rem] border border-pink-50 p-20 text-center shadow-sm">
                    <GalleryIcon size={48} className="mx-auto text-pink-200 mb-4"/>
                    <h3 className="text-lg font-black text-gray-800">Galeri Kosong</h3>
                    <p className="text-sm text-gray-400 font-medium">Belum ada foto tersimpan di database.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {photos
                        .filter(p => selectedMonth === "Semua" || p.date.includes(selectedMonth))
                        .map((photo) => (
                            <div key={photo.id}
                                 className="group bg-white rounded-[2rem] overflow-hidden shadow-sm border border-pink-50 hover:shadow-xl transition-all duration-500 relative">

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(photo.id);
                                    }}
                                    className="absolute top-4 right-4 z-10 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center text-gray-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all shadow-sm border border-pink-50"
                                >
                                    <Trash2 size={16}/>
                                </button>

                                <div className="relative aspect-square overflow-hidden bg-gray-50">
                                    <img src={photo.url} alt={photo.title}
                                         className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"/>
                                </div>

                                <div className="p-5">
                                    <h3 className="font-black text-sm text-gray-800 truncate tracking-tight">{photo.title}</h3>
                                    <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold mt-2 uppercase tracking-tighter">
                                        <Calendar size={12} className="text-pink-300"/>
                                        {photo.date}
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>
            )}

            {/* MODAL UPLOAD */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-xl w-full overflow-hidden flex flex-col animate-in zoom-in duration-300">
                        <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                            <h2 className="text-xl font-black text-gray-900 tracking-tight">Upload Foto</h2>
                            <button onClick={() => setShowUploadModal(false)}
                                    className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-400 hover:text-red-500 transition-all">
                                <X size={20}/>
                            </button>
                        </div>

                        <div className="p-8">
                            <div
                                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                onDragLeave={() => setIsDragging(false)}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    setIsDragging(false);
                                    handleFile(e.dataTransfer.files);
                                }}
                                onClick={() => !isSaving && fileInputRef.current.click()}
                                className={`
                                    border-2 border-dashed rounded-[2rem] p-10 transition-all cursor-pointer
                                    flex flex-col items-center justify-center gap-4 text-center
                                    ${isDragging ? 'border-pink-500 bg-pink-50' : 'border-gray-100 bg-gray-50 hover:border-pink-400 hover:bg-white'}
                                    ${isSaving ? 'opacity-50 cursor-wait' : ''}
                                `}
                            >
                                <input type="file" ref={fileInputRef} onChange={(e) => handleFile(e.target.files)}
                                       accept="image/*" className="hidden" capture="environment" />

                                {isSaving ? (
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                                        <p className="text-pink-600 font-black text-sm animate-pulse uppercase tracking-widest">Memproses...</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="w-16 h-16 rounded-2xl bg-white text-pink-500 flex items-center justify-center shadow-sm border border-gray-50">
                                            <Upload size={32}/>
                                        </div>
                                        <div>
                                            <p className="text-lg font-black text-gray-900">Pilih Foto</p>
                                            <p className="text-[10px] text-gray-400 mt-1 px-4 font-medium italic">Sistem akan otomatis mengecilkan ukuran foto Anda.</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex justify-end gap-3">
                            <button onClick={() => setShowUploadModal(false)}
                                    className="px-6 py-2.5 rounded-xl text-sm font-black text-gray-400 hover:bg-gray-100 transition-all uppercase tracking-widest">
                                Batal
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
