import React, { useState, useEffect } from 'react';
import { db } from "../../../services/firebase.js"; // Sesuaikan path jika perlu
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { Search, Activity, Flame, Droplet, Wheat, UserCircle2, Calendar } from 'lucide-react';

export default function MonitoringGiziUser() {
    const [dataTarget, setDataTarget] = useState([]);
    const [loadingTarget, setLoadingTarget] = useState(true);
    const [searchTarget, setSearchTarget] = useState("");

    const fetchTargetData = async () => {
        setLoadingTarget(true);
        try {
            const q = query(collection(db, "target_gizi"), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);
            const fetchedData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setDataTarget(fetchedData);
        } catch (error) {
            console.error("Gagal mengambil data target gizi:", error);
        } finally {
            setLoadingTarget(false);
        }
    };

    useEffect(() => {
        fetchTargetData();
    }, []);

    const filteredTarget = dataTarget.filter(item =>
        (item.userName || "").toLowerCase().includes(searchTarget.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#D81B60] to-[#FF6B9E]">
                    Target Gizi Ibu
                </h1>
                <p className="text-gray-500 mt-1">Monitoring target gizi harian ibu.</p>
            </div>

            {/* Toolbar Monitoring */}
            <div className="bg-white p-4 rounded-2xl border border-pink-50 shadow-sm flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-300" size={18}/>
                    <input
                        type="text"
                        placeholder="Cari nama ibu nifas..."
                        className="w-full pl-12 pr-4 py-3 bg-pink-50/20 border-none rounded-xl text-sm focus:ring-2 focus:ring-pink-200 outline-none transition-all"
                        value={searchTarget}
                        onChange={(e) => setSearchTarget(e.target.value)}
                    />
                </div>
            </div>

            {/* Tabel Monitoring */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-pink-50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead
                            className="bg-pink-50/30 text-pink-500 uppercase tracking-wider text-[10px] font-bold border-b border-pink-50">
                        <tr>
                            <th className="p-5 w-10 text-center">No</th>
                            <th className="p-5">Profil Ibu</th>
                            <th className="p-5">Status Menyusui</th>
                            <th className="p-5">Target Harian (AKG)</th>
                            <th className="p-5">Tgl Hitung</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-gray-700">
                        {loadingTarget ? (
                            <tr>
                                <td colSpan="5" className="p-10 text-center text-gray-400"><Activity
                                    className="w-6 h-6 animate-spin mx-auto mb-2 text-pink-400"/>Memuat data...
                                </td>
                            </tr>
                        ) : filteredTarget.length > 0 ? (
                            filteredTarget.map((item, index) => (
                                <tr key={item.id} className="hover:bg-pink-50/10 transition-colors group">
                                    <td className="p-5 text-center font-medium text-gray-400">{index + 1}</td>
                                    <td className="p-5">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-100 to-rose-100 flex items-center justify-center text-pink-500">
                                                <UserCircle2 size={24}/>
                                            </div>
                                            <div>
                                                <div
                                                    className="font-bold text-gray-900 text-base capitalize">{item.userName || "Nama Tidak Terdata"}</div>
                                                <div className="text-gray-500 text-xs mt-0.5">Usia: <span
                                                    className="font-semibold text-gray-700">{item.umur || "-"} Tahun</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                            <span
                                                className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold border border-blue-100">
                                                {item.statusMenyusui || "Belum ada data"}
                                            </span>
                                    </td>
                                    <td className="p-5">
                                        <div className="grid grid-cols-2 gap-3 w-max">
                                            {/* Energi */}
                                            <div
                                                className="flex flex-col bg-orange-50/50 px-3 py-1.5 rounded-xl border border-orange-100 shadow-sm">
                                                <div
                                                    className="flex items-center gap-1.5 text-[9px] font-black text-orange-500 uppercase tracking-widest mb-0.5">
                                                    <Flame size={12}/> Energi
                                                </div>
                                                <div className="text-sm font-black text-gray-800">
                                                    {item.energi || 0} <span
                                                    className="text-[10px] font-bold text-gray-400">kkal</span>
                                                </div>
                                            </div>

                                            {/* Protein */}
                                            <div
                                                className="flex flex-col bg-rose-50/50 px-3 py-1.5 rounded-xl border border-rose-100 shadow-sm">
                                                <div
                                                    className="flex items-center gap-1.5 text-[9px] font-black text-rose-500 uppercase tracking-widest mb-0.5">
                                                    <Activity size={12}/> Protein
                                                </div>
                                                <div className="text-sm font-black text-gray-800">
                                                    {item.protein || 0} <span
                                                    className="text-[10px] font-bold text-gray-400">gram</span>
                                                </div>
                                            </div>

                                            {/* Lemak */}
                                            <div
                                                className="flex flex-col bg-amber-50/50 px-3 py-1.5 rounded-xl border border-amber-100 shadow-sm">
                                                <div
                                                    className="flex items-center gap-1.5 text-[9px] font-black text-amber-500 uppercase tracking-widest mb-0.5">
                                                    <Droplet size={12}/> Lemak
                                                </div>
                                                <div className="text-sm font-black text-gray-800">
                                                    {item.lemak || 0} <span
                                                    className="text-[10px] font-bold text-gray-400">gram</span>
                                                </div>
                                            </div>

                                            {/* Karbohidrat */}
                                            <div
                                                className="flex flex-col bg-indigo-50/50 px-3 py-1.5 rounded-xl border border-indigo-100 shadow-sm">
                                                <div
                                                    className="flex items-center gap-1.5 text-[9px] font-black text-indigo-500 uppercase tracking-widest mb-0.5">
                                                    <Wheat size={12}/> Karbo
                                                </div>
                                                <div className="text-sm font-black text-gray-800">
                                                    {item.karbohidrat || 0} <span
                                                    className="text-[10px] font-bold text-gray-400">gram</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-5 text-gray-500 text-xs">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar size={14} className="text-gray-400"/>
                                            {item.createdAt ? new Date(item.createdAt.seconds * 1000).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric'
                                            }) : "-"}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="p-10 text-center text-gray-400">Belum ada data target gizi
                                    dari user.
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
