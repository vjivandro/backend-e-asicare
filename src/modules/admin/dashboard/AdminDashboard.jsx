import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../services/firebase.js";
import { Users, Database, ShieldCheck, Plus, Sparkles } from "lucide-react"; // Import icon tambahan

export default function AdminDashboard({ user }) {
    const [akgCount, setAkgCount] = useState(0);
    const [userCount, setUserCount] = useState(0);
    const [adminCount, setAdminCount] = useState(0);

    const fetchStats = async () => {
        try {
            const akgSnapshot = await getDocs(collection(db, "akg_ibu"));
            const userSnapshot = await getDocs(collection(db, "users"));
            const adminSnapshot = await getDocs(collection(db, "admins"));

            setAkgCount(akgSnapshot.size);
            setUserCount(userSnapshot.size);
            setAdminCount(adminSnapshot.size);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-6 pb-12 space-y-8 font-sans">

            {/* HEADER & GREETING */}
            <div className="bg-gradient-to-r from-pink-50 to-white p-8 rounded-[2rem] border border-pink-100 relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="text-pink-400" size={20} />
                        <h2 className="text-sm font-black text-pink-500 uppercase tracking-widest">Dashboard</h2>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight leading-tight">
                        Selamat datang kembali,<br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D81B60] to-[#FF6B9E] capitalize">
                            {user?.username || "Super Admin"}! 👋
                        </span>
                    </h1>
                    <p className="mt-3 text-gray-500 max-w-lg text-sm leading-relaxed">
                        Pantau ringkasan data gizi, aktivitas pengguna, dan kelola sistem e-ASI Care Anda dengan mudah hari ini.
                    </p>
                </div>
                {/* Dekorasi Background */}
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-pink-100/50 rounded-full blur-3xl"></div>
            </div>

            {/* STATISTIK GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Card 1: Data AKG */}
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-pink-50 flex items-center gap-6 group hover:shadow-md transition-shadow">
                    <div className="w-16 h-16 rounded-2xl bg-pink-50 text-pink-500 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                        <Database size={28} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Data AKG</p>
                        <h2 className="text-4xl font-black text-gray-900">{akgCount}</h2>
                    </div>
                </div>

                {/* Card 2: Users */}
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-indigo-50 flex items-center gap-6 group hover:shadow-md transition-shadow">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
                        <Users size={28} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total User Ibu</p>
                        <h2 className="text-4xl font-black text-gray-900">{userCount}</h2>
                    </div>
                </div>

                {/* Card 3: Admins */}
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-purple-50 flex items-center gap-6 group hover:shadow-md transition-shadow">
                    <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <ShieldCheck size={28} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">SuperAdmin</p>
                        <h2 className="text-4xl font-black text-gray-900">{adminCount}</h2>
                    </div>
                </div>
            </div>

            {/* QUICK ACTIONS */}
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-pink-50 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Aksi Cepat</h3>
                    <p className="text-sm text-gray-500">Akses pintasan untuk mengelola sistem e-ASI Care.</p>
                </div>

                <div className="flex w-full sm:w-auto">
                    <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-[#D81B60] to-[#FF6B9E] text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-pink-200 hover:scale-[1.02] active:scale-95 transition-all text-sm uppercase tracking-wider">
                        <Plus size={18} strokeWidth={3} />
                        Tambah Data AKG
                    </button>
                </div>
            </div>

        </div>
    );
}
