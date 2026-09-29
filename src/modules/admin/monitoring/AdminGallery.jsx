import React, { useState, useEffect } from 'react';
import { Calendar, Image as GalleryIcon, User, ArrowLeft, FolderHeart } from 'lucide-react';
import { db } from "../../../services/firebase";
import { collection, query, onSnapshot, orderBy, getDocs } from "firebase/firestore";

export default function AdminGallery() {
    const [groupedUsers, setGroupedUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [loading, setLoading] = useState(true);

    // STATE BARU: Menyimpan mapping antara userId dan Nama User
    const [userNames, setUserNames] = useState({});

    useEffect(() => {
        // 1. MENGAMBIL DATA NAMA USER TERLEBIH DAHULU
        const fetchUserNames = async () => {
            try {
                const usersSnapshot = await getDocs(collection(db, "users"));
                const mapping = {};
                usersSnapshot.forEach((doc) => {
                    const data = doc.data();
                    // Sesuaikan 'name' dengan field nama yang ada di database Anda
                    // Bisa 'nama', 'username', 'fullName', dsb.
                    mapping[doc.id] = data.name || data.username || data.nama || "User Tanpa Nama";
                });
                setUserNames(mapping);
            } catch (error) {
                console.error("Gagal mengambil data users:", error);
            }
        };

        fetchUserNames();

        // 2. MENGAMBIL DATA GALERI (Tetap realtime)
        const q = query(
            collection(db, "gallery"),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const allDocs = snapshot.docs.map(doc => {
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
                    userId: data.userId || "Anonim",
                    category: data.category || "Umum",
                    ...data
                };
            });

            // LOGIKA PENGELOMPOKAN
            const grouped = allDocs.reduce((acc, photo) => {
                if (!acc[photo.userId]) {
                    acc[photo.userId] = {
                        userId: photo.userId,
                        photos: [],
                        coverPhoto: photo.url,
                    };
                }
                acc[photo.userId].photos.push(photo);
                return acc;
            }, {});

            setGroupedUsers(Object.values(grouped));
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const activeUserGroup = groupedUsers.find(g => g.userId === selectedUserId);

    return (
        <div className="max-w-7xl mx-auto space-y-8 p-4 md:p-6 mt-2 font-sans pb-24">

            {/* Header Dinamis */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center gap-4">
                {selectedUserId && (
                    <button
                        onClick={() => setSelectedUserId(null)}
                        className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-full text-gray-500 hover:text-pink-600 hover:border-pink-300 hover:shadow-sm transition-all shrink-0"
                    >
                        <ArrowLeft size={20} />
                    </button>
                )}

                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
                        Monitoring <span className="text-[#D81B60]">Galeri</span>
                    </h1>
                    <p className="mt-1.5 text-gray-500 text-sm font-medium">
                        {activeUserGroup
                            // Tampilkan nama di header saat masuk ke folder
                            ? `Menampilkan ${activeUserGroup.photos.length} foto milik: ${userNames[activeUserGroup.userId] || activeUserGroup.userId}`
                            : 'Pantau dokumentasi foto yang dikelompokkan berdasarkan pengguna.'
                        }
                    </p>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : groupedUsers.length === 0 ? (
                <div className="bg-white rounded-[2rem] border border-pink-50 p-20 text-center shadow-sm">
                    <GalleryIcon size={48} className="mx-auto text-pink-200 mb-4"/>
                    <h3 className="text-lg font-black text-gray-800">Galeri Kosong</h3>
                    <p className="text-sm text-gray-400 font-medium">Belum ada user yang mengunggah foto.</p>
                </div>
            ) : !selectedUserId ? (

                /* =================== VIEW 1: DAFTAR USER (ALBUM) =================== */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-500">
                    {groupedUsers.map((group) => (
                        <div key={group.userId} className="group bg-white rounded-[2rem] overflow-hidden shadow-sm border border-pink-50 hover:shadow-xl transition-all duration-300 flex flex-col">

                            <div className="relative aspect-video overflow-hidden bg-gray-100">
                                <img src={group.coverPhoto} alt="Cover" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"/>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

                                <div className="absolute bottom-4 left-4 text-white flex items-center gap-2">
                                    <FolderHeart size={20} className="text-pink-300" />
                                    <span className="font-bold text-sm tracking-wide">{group.photos.length} Foto</span>
                                </div>
                            </div>

                            <div className="p-5 flex-1 flex flex-col justify-between">
                                <div className="mb-4">
                                    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Nama Pengguna</p>
                                    {/* MENGGUNAKAN NAMA USER DARI STATE userNames */}
                                    <h3 className="font-black text-sm text-gray-800 truncate flex items-center gap-2" title={group.userId}>
                                        <User size={16} className="text-pink-500 shrink-0"/>
                                        {userNames[group.userId] || group.userId}
                                    </h3>
                                </div>
                                <button
                                    onClick={() => setSelectedUserId(group.userId)}
                                    className="w-full bg-pink-50 hover:bg-pink-100 text-[#D81B60] font-black py-3 rounded-xl text-xs uppercase tracking-widest transition-colors"
                                >
                                    Lihat Semua
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

            ) : activeUserGroup ? (

                /* =================== VIEW 2: DETAIL FOTO PER USER =================== */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {activeUserGroup.photos.map((photo) => (
                        <div key={photo.id} className="group bg-white rounded-[2rem] overflow-hidden shadow-sm border border-pink-50 hover:shadow-xl transition-all duration-500 flex flex-col">

                            <div className="relative aspect-square overflow-hidden bg-gray-50">
                                <img src={photo.url} alt={photo.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"/>
                                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-black text-pink-500 uppercase tracking-wider shadow-sm">
                                    {photo.category}
                                </div>
                            </div>

                            <div className="p-5 flex-1 flex flex-col justify-between">
                                <div>
                                    <h3 className="font-black text-sm text-gray-800 truncate tracking-tight">{photo.title}</h3>
                                    <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold mt-2 uppercase tracking-tighter">
                                        <Calendar size={12} className="text-pink-300"/>
                                        {photo.date}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : null}
        </div>
    );
}
