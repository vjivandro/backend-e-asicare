import React, { useState, useEffect } from "react";
import { Menu, Bell } from "lucide-react";
import { auth, db } from "../services/firebase";
import { useNavigate } from "react-router-dom";
import { collection, query, orderBy, onSnapshot, limit, doc } from "firebase/firestore";

export default function Topbar({ user, onMenuClick }) {
    const navigate = useNavigate();
    const [unreadCount, setUnreadCount] = useState(0);
    const [realtimeUser, setRealtimeUser] = useState(null);

    useEffect(() => {
        const uid = user?.uid || auth.currentUser?.uid;
        if (!uid) return;

        const q = query(
            collection(db, "notifications"),
            orderBy("createdAt", "desc"),
            limit(50)
        );

        const unsubscribeNotif = onSnapshot(q, (snapshot) => {
            let count = 0;
            snapshot.forEach((doc) => {
                const data = doc.data();
                const isForMe = data.target === "all" || data.target === uid;
                const hasRead = data.readBy && data.readBy.includes(uid);

                if (isForMe && !hasRead) {
                    count++;
                }
            });
            setUnreadCount(count);
        });

        const unsubscribeUser = onSnapshot(doc(db, "users", uid), (docSnap) => {
            if (docSnap.exists()) {
                setRealtimeUser(docSnap.data());
            }
        });

        return () => {
            unsubscribeNotif();
            unsubscribeUser();
        };
    }, [user]);

    return (
        <div className="flex items-center justify-between bg-white px-4 md:px-6 py-3 shadow">
            <div className="flex items-center gap-3">
                <button onClick={onMenuClick} className="md:hidden p-2 text-gray-600">
                    <Menu />
                </button>
            </div>

            <div className="flex items-center gap-5">
                <button
                    onClick={() => navigate('/user/notifikasi')}
                    className="relative p-2 text-gray-500 hover:bg-gray-100 hover:text-pink-500 rounded-full transition-colors"
                >
                    <Bell />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 flex items-center justify-center w-[18px] h-[18px] text-[9px] font-bold text-white bg-red-500 border-2 border-white rounded-full">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                </button>

                <div className="flex items-center gap-3 border-l pl-5 border-gray-100">
                    <div className="text-right hidden sm:block">
                        <p className="font-bold text-gray-800 leading-none mb-1 capitalize">
                            {realtimeUser?.username || user?.username || user?.email?.split('@')[0] || "User"}
                        </p>
                        <p className="text-[#EE6B9E] font-medium text-[10px] uppercase tracking-wider">
                            {realtimeUser?.role || user?.role || "Guest"}
                        </p>
                    </div>

                    <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm border border-gray-100 bg-gray-50">
                        {realtimeUser?.photoURL ? (
                            <img
                                src={realtimeUser.photoURL}
                                alt="Profile"
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-tr from-[#D81B60] to-[#FF6B9E] flex items-center justify-center text-white font-bold uppercase">
                                {(realtimeUser?.username || user?.username || user?.email || "U").charAt(0)}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}