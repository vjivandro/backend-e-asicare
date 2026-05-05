import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../../../services/firebase';
import { collection, query, orderBy, getDocs, updateDoc, doc, arrayUnion } from 'firebase/firestore';
import { BellRing, BookOpen, CheckCircle } from 'lucide-react';

export default function HalamanNotifikasi() {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAndMarkAsRead();
    }, []);

    const fetchAndMarkAsRead = async () => {
        const user = auth.currentUser;
        if (!user) return;

        try {
            const q = query(collection(db, "notifications"), orderBy("createdAt", "desc"));
            const snapshot = await getDocs(q);

            const fetchedNotifs = [];

            snapshot.forEach(async (document) => {
                const data = document.data();
                const isForMe = data.target === "all" || data.target === user.uid;

                if (isForMe) {
                    fetchedNotifs.push({ id: document.id, ...data });

                    // Jika belum dibaca, mark as read dengan arrayUnion (tambah UID ke array)
                    if (!data.readBy || !data.readBy.includes(user.uid)) {
                        const docRef = doc(db, "notifications", document.id);
                        await updateDoc(docRef, {
                            readBy: arrayUnion(user.uid)
                        });
                    }
                }
            });

            setNotifications(fetchedNotifs);
        } catch (error) {
            console.error("Gagal memuat notifikasi:", error);
        } finally {
            setLoading(false);
        }
    };

    // Format waktu
    const timeAgo = (timestamp) => {
        if (!timestamp) return "Baru saja";
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000 / 60); // dalam menit

        if (diff < 60) return `${diff} menit lalu`;
        if (diff < 1440) return `${Math.floor(diff/60)} jam lalu`;
        return date.toLocaleDateString("id-ID", { day: 'numeric', month: 'short' });
    };

    return (
        <div className="max-w-3xl mx-auto p-4 md:p-8 min-h-screen">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                    <BellRing className="text-[#D81B60] w-8 h-8" /> Notifikasi
                </h1>
                <p className="text-gray-500 mt-2">Pembaruan dan informasi terbaru untuk Bunda.</p>
            </div>

            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-10 text-center text-gray-400">Memuat notifikasi...</div>
                ) : notifications.length === 0 ? (
                    <div className="p-16 text-center text-gray-400">
                        <CheckCircle className="w-12 h-12 mx-auto mb-3 text-emerald-400" />
                        <p>Belum ada notifikasi baru.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {notifications.map((notif) => (
                            <div
                                key={notif.id}
                                onClick={() => notif.link && navigate(notif.link)}
                                className="p-6 hover:bg-pink-50/30 transition-colors cursor-pointer flex gap-4 items-start group"
                            >
                                {/* Ikon Dinamis berdasarkan Tipe */}
                                <div className="w-12 h-12 rounded-full bg-pink-100 text-[#D81B60] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                    {notif.type === 'edukasi' ? <BookOpen size={20} /> : <BellRing size={20} />}
                                </div>

                                <div className="flex-1">
                                    <h3 className="font-bold text-gray-900">{notif.title}</h3>
                                    <p className="text-gray-600 text-sm mt-1 leading-relaxed">{notif.body}</p>
                                    <span className="text-xs font-bold text-gray-400 mt-3 block">
                                        {timeAgo(notif.createdAt)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}