import {useEffect, useState} from "react";
import {db} from "../../../services/firebase.js";
import {collection, getDocs, deleteDoc, doc} from "firebase/firestore";
import {getAuth, sendPasswordResetEmail} from "firebase/auth";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPencilAlt, faKey, faTrash} from '@fortawesome/free-solid-svg-icons';
import {Search} from "lucide-react"; // Import icon Search dari lucide-react

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState(""); // State untuk input pencarian
    const auth = getAuth();

    const fetchUsers = async () => {
        try {
            const snapshot = await getDocs(collection(db, "users"));

            const result = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setUsers(result);
        } catch (err) {
            alert(err.message);
        }
    };

    // Fungsi untuk mengubah Timestamp menjadi "Waktu Lalu"
    const timeAgo = (timestamp) => {
        if (!timestamp) return "-";

        // Cek apakah datanya berupa Firebase Timestamp, String ISO, atau Number
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return "Baru saja";

        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `${diffInMinutes} menit lalu`;

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours} jam lalu`;

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays} hari lalu`;

        // Jika lebih dari 7 hari, tampilkan tanggal aslinya (misal: 12 Mei 2026)
        return date.toLocaleDateString("id-ID", {day: 'numeric', month: 'short', year: 'numeric'});
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleResetPassword = async (email) => {
        try {
            await sendPasswordResetEmail(auth, email);
            alert("Email reset password telah dikirim!");
        } catch (err) {
            alert(err.message);
        }
    };

    // Fungsi untuk mengambil inisial nama jika foto tidak ada
    const getInitials = (user) => {
        const name = user.username || user.name || user.email || "U";
        return name.charAt(0).toUpperCase();
    };

    // Logika Filter Data berdasarkan Pencarian
    const filteredUsers = users.filter((user) => {
        const query = searchQuery.toLowerCase();
        const name = (user.username || user.name || "").toLowerCase();
        const email = (user.email || "").toLowerCase();

        return name.includes(query) || email.includes(query);
    });

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-8 pb-12">

            {/* HEADER & PENCARIAN */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#D81B60] to-[#FF6B9E]">
                        Manajemen Pengguna
                    </h1>
                    <p className="text-gray-500 mt-1">Kelola data dan hak akses pengguna e-ASI Care.</p>
                </div>

                {/* Search Bar Minimalis */}
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                    <input
                        type="text"
                        placeholder="Cari nama atau email..."
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
                            <th className="px-6 py-4 font-black text-[11px] uppercase tracking-widest text-pink-500 text-center">Terakhir
                                Aktif
                            </th>
                            <th className="px-6 py-4 font-black text-[11px] uppercase tracking-widest text-pink-500 text-center">Aksi</th>
                        </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-50">
                        {/* Looping menggunakan filteredUsers, bukan users */}
                        {filteredUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-pink-50/30 transition-colors group">

                                {/* KOLOM FOTO & NAMA */}
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        {/* Avatar Box */}
                                        <div
                                            className="w-10 h-10 rounded-xl overflow-hidden shadow-sm border border-pink-100 bg-pink-50 flex-shrink-0">
                                            {user.photoURL ? (
                                                <img
                                                    src={user.photoURL}
                                                    alt="Profile"
                                                    className="w-full h-full object-cover"
                                                    referrerPolicy="no-referrer"
                                                />
                                            ) : (
                                                <div
                                                    className="w-full h-full bg-gradient-to-tr from-[#D81B60] to-[#FF6B9E] flex items-center justify-center text-white font-black text-sm">
                                                    {getInitials(user)}
                                                </div>
                                            )}
                                        </div>
                                        {/* Nama Text */}
                                        <div>
                                            <p className="font-bold text-gray-900 capitalize leading-tight">
                                                {user.username || user.name || "User"}
                                            </p>
                                            <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                                                ID: {user.id.substring(0, 8)}...
                                            </p>
                                        </div>
                                    </div>
                                </td>

                                {/* KOLOM EMAIL */}
                                <td className="px-6 py-4 text-gray-600 font-medium">
                                    {user.email || "-"}
                                </td>

                                {/* KOLOM ROLE */}
                                <td className="px-6 py-4 text-center">
                                        <span
                                            className={`inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                                user.role === "superadmin"
                                                    ? "bg-purple-100 text-purple-600"
                                                    : "bg-pink-100 text-[#D81B60]"
                                            }`}>
                                            {user.role || "user"}
                                        </span>
                                </td>

                                {/* TAMBAHAN SEL TERAKHIR AKTIF */}
                                <td className="px-6 py-4 text-center text-xs font-medium text-gray-500">
    <span className="bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
        {/* Panggil fungsi timeAgo dan masukkan field timestamp dari Firestore */}
        {timeAgo(user.lastLogin || user.lastActivity)}
    </span>
                                </td>

                                {/* KOLOM AKSI (SELALU MUNCUL) */}
                                <td className="px-6 py-4">
                                    <div className="flex justify-center gap-2">
                                        <button
                                            className="w-8 h-8 rounded-lg bg-amber-50 text-amber-500 hover:bg-amber-500 hover:text-white flex items-center justify-center transition-all shadow-sm"
                                            title="Edit Pengguna"
                                            onClick={() => alert("Edit belum dibuat")}
                                        >
                                            <FontAwesomeIcon icon={faPencilAlt} className="w-3.5 h-3.5"/>
                                        </button>
                                        <button
                                            onClick={async () => await handleResetPassword(user.email)}
                                            className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-500 hover:bg-indigo-500 hover:text-white flex items-center justify-center transition-all shadow-sm"
                                            title="Kirim Email Reset Password"
                                        >
                                            <FontAwesomeIcon icon={faKey} className="w-3.5 h-3.5"/>
                                        </button>
                                        <button
                                            className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-all shadow-sm"
                                            title="Hapus Pengguna"
                                            onClick={async () => {
                                                const targetName = user.username || user.name || user.email;
                                                const confirmDelete = confirm(`Yakin ingin menghapus ${targetName} secara permanen?`);
                                                if (!confirmDelete) return;

                                                await deleteDoc(doc(db, "users", user.id));
                                                fetchUsers();
                                            }}
                                        >
                                            <FontAwesomeIcon icon={faTrash} className="w-3.5 h-3.5"/>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    {/* State Loading / Kosong */}
                    {users.length === 0 && (
                        <div className="py-16 text-center">
                            <div
                                className="w-10 h-10 border-4 border-pink-100 border-t-pink-500 rounded-full animate-spin mx-auto mb-3"></div>
                            <p className="text-sm text-gray-400 font-medium">Memuat data pengguna...</p>
                        </div>
                    )}

                    {/* State Tidak Ditemukan saat Mencari */}
                    {users.length > 0 && filteredUsers.length === 0 && (
                        <div className="py-12 text-center">
                            <p className="text-sm text-gray-400 font-medium">Pencarian untuk "{searchQuery}" tidak
                                ditemukan.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
