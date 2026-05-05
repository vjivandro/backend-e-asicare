import { useEffect, useState } from "react";
import { db } from "../../../services/firebase.js";
import { collection, getDocs } from "firebase/firestore";
import { Search } from "lucide-react";

export default function AdminManagement() {
    // Menggunakan state admins untuk membedakan dengan users
    const [admins, setAdmins] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    const fetchAdmins = async () => {
        try {
            const snapshot = await getDocs(collection(db, "admins"));

            const result = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setAdmins(result);
        } catch (err) {
            alert(err.message);
        }
    };

    useEffect(() => {
        fetchAdmins();
    }, []);

    // Fungsi untuk mengambil inisial nama jika foto tidak ada
    const getInitials = (admin) => {
        const name = admin.username || admin.email || "A";
        return name.charAt(0).toUpperCase();
    };

    // Logika Filter Data berdasarkan Pencarian
    const filteredAdmins = admins.filter((admin) => {
        const query = searchQuery.toLowerCase();
        const name = (admin.username || "").toLowerCase();
        const email = (admin.email || "").toLowerCase();

        return name.includes(query) || email.includes(query);
    });

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-8 pb-12">

            {/* HEADER & PENCARIAN */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#D81B60] to-[#FF6B9E]">
                        Manajemen Admin
                    </h1>
                    <p className="text-gray-500 mt-1">Kelola data dan hak akses superadmin e-ASI Care.</p>
                </div>

                {/* Search Bar Minimalis */}
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Cari username atau email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-2xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-pink-400 transition-all shadow-sm text-sm"
                    />
                </div>
            </div>

            {/* TABEL MODERN */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-pink-50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-pink-50/50 border-b border-pink-100">
                        <tr>
                            <th className="px-6 py-4 font-black text-[11px] uppercase tracking-widest text-pink-500">Pengguna</th>
                            <th className="px-6 py-4 font-black text-[11px] uppercase tracking-widest text-pink-500">Email</th>
                            <th className="px-6 py-4 font-black text-[11px] uppercase tracking-widest text-pink-500 text-center">Role</th>
                        </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-50">
                        {filteredAdmins.map((admin) => (
                            <tr key={admin.id} className="hover:bg-pink-50/30 transition-colors">

                                {/* KOLOM FOTO & NAMA */}
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        {/* Avatar Box */}
                                        <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm border border-pink-100 bg-pink-50 flex-shrink-0">
                                            {admin.photoURL ? (
                                                <img
                                                    src={admin.photoURL}
                                                    alt="Profile"
                                                    className="w-full h-full object-cover"
                                                    referrerPolicy="no-referrer"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-tr from-[#4B3B88] to-purple-500 flex items-center justify-center text-white font-black text-sm">
                                                    {getInitials(admin)}
                                                </div>
                                            )}
                                        </div>
                                        {/* Nama Text */}
                                        <div>
                                            <p className="font-bold text-gray-900 capitalize leading-tight">
                                                {admin.username || "Admin"}
                                            </p>
                                            <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                                                ID: {admin.id.substring(0, 8)}...
                                            </p>
                                        </div>
                                    </div>
                                </td>

                                {/* KOLOM EMAIL */}
                                <td className="px-6 py-4 text-gray-600 font-medium">
                                    {admin.email || "-"}
                                </td>

                                {/* KOLOM ROLE */}
                                <td className="px-6 py-4 text-center">
                                        <span className="inline-block bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                                            {admin.role || "superadmin"}
                                        </span>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    {/* State Loading / Kosong */}
                    {admins.length === 0 && (
                        <div className="py-16 text-center">
                            <div className="w-10 h-10 border-4 border-pink-100 border-t-pink-500 rounded-full animate-spin mx-auto mb-3"></div>
                            <p className="text-sm text-gray-400 font-medium">Memuat data admin...</p>
                        </div>
                    )}

                    {/* State Tidak Ditemukan saat Mencari */}
                    {admins.length > 0 && filteredAdmins.length === 0 && (
                        <div className="py-12 text-center">
                            <p className="text-sm text-gray-400 font-medium">Pencarian untuk "{searchQuery}" tidak ditemukan.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
