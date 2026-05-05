import { useEffect, useState } from "react";
import { db } from "../../../services/firebase.js";
import { collection, getDocs } from "firebase/firestore";
import { Search, Eye, X, Calendar, Activity, CheckCircle2 } from "lucide-react";

export default function AdminMenyusui() {
  const [dataMenyusui, setDataMenyusui] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedData, setSelectedData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      setIsLoading(true);

      // 1. Ambil data users dulu untuk mendapatkan Nama Ibu
      const usersSnapshot = await getDocs(collection(db, "users"));
      const usersMap = {};
      usersSnapshot.forEach((doc) => {
        usersMap[doc.id] = doc.data();
      });

      // 2. Ambil data perilaku_menyusui
      const menyusuiSnapshot = await getDocs(collection(db, "perilaku_menyusui"));

      const result = menyusuiSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Gabungkan data relasi user berdasarkan userId
          userData: usersMap[data.userId] || { name: "Ibu Tidak Dikenal", email: "-" },
        };
      });

      // Urutkan dari yang terbaru (asumsi format tanggal YYYY-MM-DD)
      result.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

      setDataMenyusui(result);
    } catch (err) {
      console.error(err);
      alert("Gagal memuat data: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter Pencarian (Berdasarkan Nama Ibu atau Tanggal)
  const filteredData = dataMenyusui.filter((item) => {
    const queryText = searchQuery.toLowerCase();
    const name = (item.userData?.username || item.userData?.name || "").toLowerCase();
    const tgl = (item.tanggal || "").toLowerCase();
    return name.includes(queryText) || tgl.includes(queryText);
  });

  // Format Tanggal (Misal: 2026-04-27 jadi 27 April 2026)
  const formatTanggal = (tglString) => {
    if (!tglString) return "-";
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(tglString).toLocaleDateString('id-ID', options);
  };

  return (
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-8 pb-12 font-sans">

        {/* HEADER & PENCARIAN */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#D81B60] to-[#FF6B9E]">
              Perilaku Menyusui Ibu
            </h1>
            <p className="text-gray-500 mt-1 text-sm">Pantau frekuensi, durasi, dan teknik menyusui harian ibu.</p>
          </div>

          {/* Search Bar Minimalis menggantikan Filter Tanggal kaku */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
                type="text"
                placeholder="Cari nama ibu atau YYYY-MM-DD..."
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
                <th className="px-6 py-4 font-black text-[11px] uppercase tracking-widest text-pink-500">Tanggal</th>
                <th className="px-6 py-4 font-black text-[11px] uppercase tracking-widest text-pink-500">Nama Ibu</th>
                <th className="px-6 py-4 font-black text-[11px] uppercase tracking-widest text-pink-500 text-center">Skor & Kategori</th>
                <th className="px-6 py-4 font-black text-[11px] uppercase tracking-widest text-pink-500">Rekomendasi Utama</th>
                <th className="px-6 py-4 font-black text-[11px] uppercase tracking-widest text-pink-500 text-center">Aksi</th>
              </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
              {filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-pink-50/30 transition-colors group">

                    {/* Kolom Tanggal */}
                    <td className="px-6 py-4 text-gray-500 font-medium whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-pink-400" />
                        {formatTanggal(item.tanggal)}
                      </div>
                    </td>

                    {/* Kolom User */}
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900 capitalize">
                        {item.userData?.username || item.userData?.name || "Ibu Tanpa Nama"}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5 font-medium">ID: {item.userId.substring(0,8)}...</p>
                    </td>

                    {/* Kolom Skor & Kategori */}
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-lg font-black text-gray-800">{item.skorTotal || 0}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                            item.kategori?.toLowerCase() === 'baik' ? 'bg-green-100 text-green-700' :
                                item.kategori?.toLowerCase() === 'kurang' ? 'bg-red-100 text-red-700' :
                                    'bg-yellow-100 text-yellow-700'
                        }`}>
                                                {item.kategori || "Cukup"}
                                            </span>
                      </div>
                    </td>

                    {/* Kolom Rekomendasi */}
                    <td className="px-6 py-4">
                      {item.rekomendasi && item.rekomendasi.length > 0 ? (
                          <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
                            {/* Hanya tampilkan 2 rekomendasi pertama di tabel agar tidak kepanjangan */}
                            {item.rekomendasi.slice(0, 2).map((rek, idx) => (
                                <li key={idx} className="truncate max-w-[200px] xl:max-w-xs">{rek}</li>
                            ))}
                            {item.rekomendasi.length > 2 && (
                                <li className="text-[10px] text-pink-500 font-bold list-none mt-1">
                                  +{item.rekomendasi.length - 2} rekomendasi lainnya...
                                </li>
                            )}
                          </ul>
                      ) : (
                          <span className="text-xs text-gray-400 italic">Tidak ada catatan</span>
                      )}
                    </td>

                    {/* Kolom Aksi */}
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <button
                            onClick={() => setSelectedData(item)}
                            className="w-9 h-9 rounded-xl bg-pink-50 text-[#D81B60] hover:bg-[#D81B60] hover:text-white flex items-center justify-center transition-all shadow-sm"
                            title="Lihat Detail Menyusui"
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
              ))}
              </tbody>
            </table>

            {/* State Loading / Kosong */}
            {isLoading && (
                <div className="py-16 text-center">
                  <div className="w-10 h-10 border-4 border-pink-100 border-t-pink-500 rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-sm text-gray-400 font-medium">Memuat data menyusui...</p>
                </div>
            )}

            {!isLoading && filteredData.length === 0 && (
                <div className="py-16 text-center">
                  <Activity className="mx-auto text-pink-200 mb-3" size={48} />
                  <p className="text-sm text-gray-400 font-medium">Belum ada data menyusui yang ditemukan.</p>
                </div>
            )}
          </div>
        </div>

        {/* MODAL DETAIL DATA */}
        {selectedData && (
            <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
              <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-2xl w-full flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in duration-200">

                {/* Modal Header */}
                <div className="p-6 border-b border-gray-50 flex justify-between items-start bg-gradient-to-r from-pink-50 to-white">
                  <div>
                    <h2 className="text-xl font-black text-gray-900 mb-1">Detail Evaluasi Menyusui</h2>
                    <p className="text-sm font-bold text-pink-500 capitalize">
                      Ibu {selectedData.userData?.username || selectedData.userData?.name}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{formatTanggal(selectedData.tanggal)}</p>
                  </div>
                  <button
                      onClick={() => setSelectedData(null)}
                      className="w-10 h-10 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-400 hover:text-red-500 transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">

                  {/* Rincian Skor per Kategori */}
                  <div>
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Rincian Skor Kategori</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl text-center">
                        <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-1">Frekuensi</p>
                        <p className="text-2xl font-black text-blue-900">{selectedData.skorKategori?.frekuensi || 0}</p>
                      </div>
                      <div className="bg-purple-50 border border-purple-100 p-4 rounded-2xl text-center">
                        <p className="text-[10px] font-bold text-purple-500 uppercase tracking-wider mb-1">Posisi</p>
                        <p className="text-2xl font-black text-purple-900">{selectedData.skorKategori?.posisi || 0}</p>
                      </div>
                      <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl text-center">
                        <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wider mb-1">Durasi</p>
                        <p className="text-2xl font-black text-amber-900">{selectedData.skorKategori?.durasi || 0}</p>
                      </div>
                    </div>
                  </div>

                  {/* Daftar Rekomendasi Lengkap */}
                  <div>
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Daftar Rekomendasi</h3>
                    {selectedData.rekomendasi && selectedData.rekomendasi.length > 0 ? (
                        <div className="space-y-2">
                          {selectedData.rekomendasi.map((rek, idx) => (
                              <div key={idx} className="flex items-start gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                <CheckCircle2 size={16} className="text-pink-500 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-gray-700 font-medium leading-relaxed">{rek}</p>
                              </div>
                          ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 italic bg-gray-50 p-4 rounded-xl text-center">Ibu sudah melakukan teknik menyusui dengan sangat baik. Tidak ada rekomendasi perbaikan.</p>
                    )}
                  </div>

                </div>
              </div>
            </div>
        )}
      </div>
  );
}
