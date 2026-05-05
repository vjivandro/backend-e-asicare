import React, { useState, useEffect } from "react";
import { Menu, Bell } from "lucide-react";
import { auth, db } from "../services/firebase"; // Pastikan db di-import
import { useNavigate } from "react-router-dom";
import { collection, query, orderBy, onSnapshot, limit } from "firebase/firestore";

export default function Topbar({ user, onMenuClick }) { // Menggunakan props asli 
    const navigate = useNavigate();
    const [unreadCount, setUnreadCount] = useState(0);

    // Mengambil foto profil dari Google OAuth2 jika tersedia 
    const photoURL = user?.photoURL || auth.currentUser?.photoURL; 

    useEffect(() => {
        // Kita butuh UID user untuk mengecek apakah notif sudah dibaca
        const uid = user?.uid || auth.currentUser?.uid;
        if (!uid) return;

        // Pasang listener ke collection notifications
        const q = query(
            collection(db, "notifications"),
            orderBy("createdAt", "desc"),
            limit(50) // Batasi 50 notif terbaru agar ringan
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            let count = 0;
            snapshot.forEach((doc) => {
                const data = doc.data();
                // Cek apakah targetnya untuk semua atau spesifik user ini
                const isForMe = data.target === "all" || data.target === uid;
                // Cek apakah UID user sudah ada di array readBy
                const hasRead = data.readBy && data.readBy.includes(uid);

                if (isForMe && !hasRead) {
                    count++;
                }
            });
            setUnreadCount(count);
        });

        // Bersihkan listener saat komponen dibongkar
        return () => unsubscribe();
    }, [user]);

    return (
        <div className="flex items-center justify-between bg-white px-4 md:px-6 py-3 shadow"> {/* Style asli dipertahankan  */}

            {/* LEFT - Tombol Menu untuk Mobile */}
            <div className="flex items-center gap-3"> {/* Layout asli  */}
                <button onClick={onMenuClick} className="md:hidden p-2 text-gray-600"> {/* Logic asli dipertahankan  */}
                    <Menu /> {/* Import Lucide asli  */}
                </button>
            </div>

            {/* RIGHT - Identitas Pengguna */}
            <div className="flex items-center gap-5"> {/* Layout asli  */}

                {/* Notifikasi yang sudah di-upgrade dengan Badge Merah */}
                <button
                    onClick={() => navigate('/user/notifikasi')}
                    className="relative p-2 text-gray-500 hover:bg-gray-100 hover:text-pink-500 rounded-full transition-colors"
                >
                    <Bell /> {/* Import Lucide asli  */}

                    {/* Badge Merah Dinamis jika ada notif belum dibaca */}
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 flex items-center justify-center w-[18px] h-[18px] text-[9px] font-bold text-white bg-red-500 border-2 border-white rounded-full">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                </button>

                <div className="flex items-center gap-3 border-l pl-5 border-gray-100"> {/* Border asli  */}
                    {/* Nama dan Role (Dinamis untuk User/Admin) */}
                    <div className="text-right hidden sm:block"> {/* Layout asli  */}
                        <p className="font-bold text-gray-800 leading-none mb-1 capitalize"> {/* Logic username asli  */}
                            {user?.username ? user.username : user?.email?.split('@')[0] || "User"} 
                        </p>
                        <p className="text-[#EE6B9E] font-medium text-[10px] uppercase tracking-wider"> {/* Logic role asli  */}
                            {user?.role || "Guest"} 
                        </p>
                    </div>

                    {/* Foto Profil Dinamis */}
                    <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm border border-gray-100 bg-gray-50"> {/* Container foto asli  */}
                        {photoURL ? ( /* Fallback check asli  */
                            <img
                                src={photoURL} /* URL asli  */
                                alt="Profile"
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer" // Memastikan foto Google muncul 
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-tr from-[#4B3B88] to-purple-500 flex items-center justify-center text-white font-bold"> {/* Warna asli  */}
                                {/* Inisial Nama sebagai Fallback */}
                                {(user?.username || user?.email)?.charAt(0)?.toUpperCase() || "U"} 
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}