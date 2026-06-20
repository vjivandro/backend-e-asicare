import React, { useState, useEffect, useRef } from 'react';
import { db } from "../../../services/firebase.js";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { Search, Calendar, UserCircle2, Activity, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // Tambahkan ini

export default function MonitoringCatatanMakan() {
    const navigate = useNavigate();

    // ==========================================
    // 1. STATE MANAGEMENT
    // ==========================================
    const [users, setUsers] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [loadingUsers, setLoadingUsers] = useState(true);

    // Pencarian Autocomplete & Paginasi
    const [searchQuery, setSearchQuery] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10); // Bisa dinaikkan jadi 10 karena tidak ada konten detail di bawahnya

    // ==========================================
    // 2. FETCH DATA USERS (Di Awal)
    // ==========================================
    useEffect(() => {
        const fetchUsers = async () => {
            setLoadingUsers(true);
            try {
                const q = query(collection(db, "target_gizi"), orderBy("createdAt", "desc"));
                const snapshot = await getDocs(q);
                const fetchedUsers = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setUsers(fetchedUsers);
            } catch (error) {
                console.error("Gagal mengambil data user:", error);
            } finally {
                setLoadingUsers(false);
            }
        };
        fetchUsers();
    }, []);

    // Tutup dropdown jika klik di luar
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // ==========================================
    // 3. LOGIKA PENCARIAN, PAGINASI & NAVIGASI
    // ==========================================
    const filteredUsers = users.filter(u =>
        (u.userName || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setShowDropdown(true);
        setCurrentPage(1);
    };

    // Fungsi Navigasi ke Halaman Detail
    const handleLihatDetail = (userId) => {
        // Navigasi dengan menyertakan parameter tanggal di URL (?date=YYYY-MM-DD)
        navigate(`/admin/monitoring/catatan-makan/${userId}?date=${selectedDate}`);
    };

    // ==========================================
    // 4. RENDER HALAMAN
    // ==========================================
    return (
        <div className="p-4 sm:p-8 bg-gray-50 min-h-screen font-sans pb-24">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* --- HEADER --- */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#D81B60] to-[#FF6B9E]">
                        Monitoring Catatan Makan
                    </h1>
                    <p className="text-gray-500 mt-1">Pilih ibu nifas untuk memantau asupan nutrisi dan buku harian makannya.</p>
                </div>

                {/* --- TABEL MASTER USER & FILTER --- */}
                <div className="bg-white rounded-[2rem] border border-pink-50 shadow-sm overflow-hidden animate-in fade-in duration-300">
                    <div className="p-5 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-white border-b border-pink-50 overflow-visible">

                        <div className="relative w-full md:max-w-md" ref={dropdownRef}>
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-300" size={18} />
                            <input
                                type="text"
                                placeholder="Cari nama ibu nifas..."
                                className="w-full pl-12 pr-4 py-3 bg-pink-50/30 border-none rounded-xl text-sm font-bold text-gray-700 focus:ring-2 focus:ring-pink-200 outline-none transition-all"
                                value={searchQuery}
                                onChange={handleSearchChange}
                                onFocus={() => setShowDropdown(true)}
                            />

                            {showDropdown && searchQuery && (
                                <div className="absolute z-50 w-full mt-2 bg-white border border-pink-100 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                                    {filteredUsers.length > 0 ? (
                                        <ul className="py-2">
                                            {filteredUsers.map(user => (
                                                <li
                                                    key={user.id}
                                                    onClick={() => handleLihatDetail(user.id)}
                                                    className="px-4 py-3 hover:bg-pink-50 cursor-pointer flex justify-between items-center transition-colors"
                                                >
                                                    <span className="font-bold text-gray-700 text-sm">{user.userName}</span>
                                                    <span className="text-xs font-medium text-gray-400">Usia: {user.umur || '-'}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="px-4 py-6 text-center text-sm text-gray-400 font-medium">
                                            Tidak ada user ditemukan.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="relative w-full md:w-auto">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-300" size={18} />
                            <input
                                type="date"
                                className="w-full md:w-48 pl-12 pr-4 py-3 bg-pink-50/30 border-none rounded-xl text-sm font-bold text-gray-700 focus:ring-2 focus:ring-pink-200 outline-none cursor-pointer transition-all"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-pink-50/30 text-pink-400 uppercase text-[10px] font-black tracking-widest border-b border-pink-50">
                            <tr>
                                <th className="px-6 py-4">Profil Ibu</th>
                                <th className="px-6 py-4">Usia</th>
                                <th className="px-6 py-4 text-center">Status Menyusui</th>
                                <th className="px-6 py-4 text-center">Aksi</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-pink-50 text-gray-600">
                            {loadingUsers ? (
                                <tr><td colSpan="4" className="px-6 py-10 text-center text-gray-400"><Activity className="w-6 h-6 animate-spin mx-auto mb-2 text-pink-400" />Memuat daftar user...</td></tr>
                            ) : paginatedUsers.length > 0 ? (
                                paginatedUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-pink-50/20 transition-all">
                                        <td className="px-6 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-pink-100 text-pink-500">
                                                    <UserCircle2 size={18} />
                                                </div>
                                                <span className="font-bold text-gray-800 capitalize">{user.userName || 'Tanpa Nama'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3 font-medium text-gray-500">{user.umur ? `${user.umur} Tahun` : '-'}</td>
                                        <td className="px-6 py-3 text-center">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold border border-blue-100">
                                                    {user.statusMenyusui || "Belum ada data"}
                                                </span>
                                        </td>
                                        <td className="px-6 py-3 text-center">
                                            <button
                                                onClick={() => handleLihatDetail(user.id)}
                                                className="px-6 py-2 rounded-xl text-xs font-bold transition-all bg-white border border-pink-200 text-pink-500 hover:bg-pink-500 hover:text-white shadow-sm"
                                            >
                                                <Eye size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="4" className="px-6 py-10 text-center text-gray-400">Tidak ada data user ditemukan.</td></tr>
                            )}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="px-6 py-4 bg-white border-t border-pink-50 flex items-center justify-between">
                            <span className="text-[11px] text-pink-300 font-black uppercase tracking-widest">
                                Halaman {currentPage} dari {totalPages}
                            </span>
                            <div className="flex gap-2">
                                <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="p-2 border border-pink-100 rounded-lg hover:bg-pink-50 disabled:opacity-30 transition-all"><ChevronLeft size={16} /></button>
                                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="p-2 border border-pink-100 rounded-lg hover:bg-pink-50 disabled:opacity-30 transition-all"><ChevronRight size={16} /></button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
