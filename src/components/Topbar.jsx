import { Menu, Bell } from "lucide-react";
import { auth } from "../services/firebase";

export default function Topbar({ user, onMenuClick }) {
    // Mengambil foto profil dari Google OAuth2 jika tersedia
    const photoURL = user?.photoURL || auth.currentUser?.photoURL;

    return (
        <div className="flex items-center justify-between bg-white px-4 md:px-6 py-3 shadow">

            {/* LEFT - Tombol Menu untuk Mobile */}
            <div className="flex items-center gap-3">
                <button onClick={onMenuClick} className="md:hidden p-2 text-gray-600">
                    <Menu />
                </button>
            </div>

            {/* RIGHT - Identitas Pengguna */}
            <div className="flex items-center gap-5">

                {/* Notifikasi */}
                <Bell className="cursor-pointer text-gray-500 hover:text-pink-500 transition-colors" />

                <div className="flex items-center gap-3 border-l pl-5 border-gray-100">
                    {/* Nama dan Role (Dinamis untuk User/Admin) */}
                    <div className="text-right hidden sm:block">
                        <p className="font-bold text-gray-800 leading-none mb-1 capitalize">
                            {user?.username ? user.username : user?.email?.split('@')[0] || "User"}
                        </p>
                        <p className="text-[#EE6B9E] font-medium text-[10px] uppercase tracking-wider">
                            {user?.role || "Guest"}
                        </p>
                    </div>

                    {/* Foto Profil Dinamis[cite: 2] */}
                    <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm border border-gray-100 bg-gray-50">
                        {photoURL ? (
                            <img
                                src={photoURL}
                                alt="Profile"
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer" // Memastikan foto Google muncul[cite: 2]
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-tr from-[#4B3B88] to-purple-500 flex items-center justify-center text-white font-bold">
                                {/* Inisial Nama sebagai Fallback[cite: 2] */}
                                {(user?.username || user?.email)?.charAt(0)?.toUpperCase() || "U"}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
