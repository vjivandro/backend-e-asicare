import { Menu, Bell, Search } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebase";
import { useNavigate } from "react-router-dom";

export default function Topbar({ user, onMenuClick }) {
    const navigate = useNavigate();

    const handleLogout = async () => {
        await signOut(auth);
        navigate("/login");
    };

    return (
        <div className="flex items-center justify-between bg-white px-4 md:px-6 py-3 shadow">

            {/* LEFT */}
            <div className="flex items-center gap-3 w-full md:w-1/2">

                {/* 🔥 Toggle Sidebar (mobile) */}
                <button onClick={onMenuClick} className="md:hidden p-2">
                    <Menu />
                </button>

                {/* 🔍 Search */}
                <div className="flex items-center bg-gray-100 px-3 py-2 rounded-lg w-full">
                    <Search size={16} className="text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="bg-transparent outline-none ml-2 w-full text-sm"
                    />
                </div>
            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-4">

                {/* 🔔 Notification */}
                <Bell className="cursor-pointer" />

                {/* 👤 User Info */}
                <div className="hidden md:flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white">
                        {(user?.username || user?.email)?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <div className="text-sm">
                        <p className="font-semibold">{user?.username || user?.email}</p>
                        <p className="text-gray-500 text-xs">{user?.role}</p>
                    </div>
                </div>

                {/* 🚪 Logout */}
                <button
                    onClick={handleLogout}
                    className="text-sm bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600"
                >
                    Logout
                </button>
            </div>
        </div>
    );
}
