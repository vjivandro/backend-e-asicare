import { useEffect, useState, useMemo } from "react";
import { getEdukasi } from "../../admin/edukasi/adminEdukasiService.js";
import { Search, Calendar, Tag, ChevronLeft, ChevronRight, X } from "lucide-react";

export default function UserEdukasi() {
    const [data, setData] = useState([]);
    const [selectedArticle, setSelectedArticle] = useState(null);

    const [searchQuery, setSearchQuery] = useState("");
    const [filterCategory, setFilterCategory] = useState(""); // Menggunakan string kosong untuk "Semua"
    const [sortOrder, setSortOrder] = useState("terbaru");
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    // Kategori mapping untuk tombol pill
    const categories = [
        { id: "", label: "Semua" },
        { id: "11", label: "Gizi Seimbang" },
        { id: "12", label: "Perilaku Menyusui" },
        { id: "13", label: "Kelancaran ASI" }
    ];

    useEffect(() => {
        const loadData = async () => {
            try {
                const result = await getEdukasi();
                setData(result);
            } catch (error) {
                console.error("Error fetching edukasi:", error);
            }
        };
        loadData();
    }, []);

    // Helper untuk mengambil ID YouTube yang akurat
    const getYouTubeId = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const renderThumbnail = (media) => {
        if (!media) return "https://placehold.co/600x400/EEE/31343C";
        const videoId = getYouTubeId(media);
        if (videoId) return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        if (media.includes("mp4")) return "https://placehold.co/600x400/EEE/31343C";
        return media;
    };

    const processedData = useMemo(() => {
        let result = [...data];
        if (searchQuery.trim() !== "") {
            const query = searchQuery.toLowerCase();
            result = result.filter(item =>
                (item.title && item.title.toLowerCase().includes(query)) ||
                (item.content && item.content.toLowerCase().includes(query))
            );
        }
        if (filterCategory) {
            result = result.filter(item => String(item.kategori) === filterCategory);
        }
        result.sort((a, b) => {
            const dateA = a.date?.seconds || 0;
            const dateB = b.date?.seconds || 0;
            return sortOrder === "terbaru" ? dateB - dateA : dateA - dateB;
        });
        return result;
    }, [data, searchQuery, filterCategory, sortOrder]);

    const totalPages = Math.ceil(processedData.length / ITEMS_PER_PAGE);
    const paginatedData = processedData.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-8">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#D81B60] to-[#FF6B9E]">Pusat Edukasi</h1>
                    <p className="text-gray-500 mt-1">Temukan artikel dan panduan seputar kesehatan ibu dan bayi.</p>
                </div>

                {/* Search Bar Minimalis */}
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Cari artikel..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="w-full bg-white border border-gray-200 rounded-2xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-pink-400 transition-all shadow-sm text-sm"
                    />
                </div>
            </div>

            {/* 🔥 Filter Pill Section 🔥 */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/50 p-2 rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto no-scrollbar">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => {
                                setFilterCategory(cat.id);
                                setCurrentPage(1);
                            }}
                            className={`px-5 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap
                                ${filterCategory === cat.id
                                ? 'bg-gradient-to-r from-[#D81B60] to-[#FF6B9E] text-white shadow-lg shadow-pink-200'
                                : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-100'}`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-2">Urutan:</span>
                    <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        className="bg-transparent text-sm font-bold text-pink-500 outline-none cursor-pointer"
                    >
                        <option value="terbaru">Terbaru</option>
                        <option value="terlama">Terlama</option>
                    </select>
                </div>
            </div>

            {/* Grid Edukasi (Tampilan Card 5 Kolom) */}
            {paginatedData.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {paginatedData.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => setSelectedArticle(item)}
                            className="group bg-white rounded-[2rem] p-3 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 cursor-pointer flex flex-col h-full"
                        >
                            <div className="relative aspect-[4/3] w-full mb-4 overflow-hidden rounded-[1.5rem]">
                                <img
                                    src={renderThumbnail(item.media)}
                                    alt={item.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute top-3 left-3">
                                    <span className="px-2.5 py-1 bg-white/90 backdrop-blur-md rounded-lg text-[9px] font-black text-pink-500 uppercase tracking-tighter shadow-sm">
                                        {categories.find(c => c.id === String(item.kategori))?.label || "Umum"}
                                    </span>
                                </div>
                            </div>

                            <div className="px-1 flex flex-col flex-grow">
                                <h3 className="font-bold text-sm leading-snug text-gray-900 group-hover:text-pink-500 transition-colors line-clamp-2 mb-2">
                                    {item.title}
                                </h3>
                                <p className="text-[11px] text-gray-500 line-clamp-2 mb-4 leading-relaxed flex-grow">
                                    {item.content}
                                </p>
                                <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50 text-[10px] font-bold text-gray-400">
                                    <div className="flex items-center gap-1">
                                        <Calendar size={12} />
                                        {item.date ? new Date(item.date.seconds * 1000).toLocaleDateString('id-ID') : "-"}
                                    </div>
                                    <span className="text-pink-500">BACA &rarr;</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
                    <p className="text-gray-400 font-medium">Tidak ada artikel yang ditemukan.</p>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-10">
                    <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => p - 1)}
                        className="p-2 rounded-full border border-gray-200 disabled:opacity-30 hover:bg-gray-50 transition-all text-pink-500"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div className="flex gap-1">
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentPage(i + 1)}
                                className={`w-8 h-8 rounded-full text-xs font-bold transition-all
                                    ${currentPage === i + 1
                                    ? 'bg-gradient-to-r from-[#D81B60] to-[#FF6B9E] text-white shadow-md shadow-pink-200'
                                    : 'hover:bg-gray-100 text-gray-400'}`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                    <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(p => p + 1)}
                        className="p-2 rounded-full border border-gray-200 disabled:opacity-30 hover:bg-gray-50 transition-all text-pink-500"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            )}

            {/* MODAL ARTIKEL */}
            {selectedArticle && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                            <span className="bg-pink-100 text-[#D81B60] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                                {categories.find(c => c.id === String(selectedArticle.kategori))?.label || "Umum"}
                            </span>
                            <button onClick={() => setSelectedArticle(null)} className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-400 hover:text-red-500 transition-all border border-gray-100">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 md:p-10 overflow-y-auto">
                            <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">{selectedArticle.title}</h2>
                            <div className="flex items-center gap-2 text-xs font-bold text-pink-400 mb-8 uppercase tracking-widest">
                                <Calendar size={14} />
                                {selectedArticle.date ? new Date(selectedArticle.date.seconds * 1000).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : "-"}
                            </div>
                            {selectedArticle.media && (
                                <div className="mb-8 rounded-[2rem] overflow-hidden shadow-sm border border-gray-100">
                                    {getYouTubeId(selectedArticle.media) ? (
                                        <iframe className="w-full aspect-video" src={`https://www.youtube.com/embed/${getYouTubeId(selectedArticle.media)}`} title="YouTube" allowFullScreen />
                                    ) : (
                                        <img src={selectedArticle.media} alt="Cover" className="w-full h-auto" />
                                    )}
                                </div>
                            )}
                            <div className="prose prose-pink max-w-none text-gray-700 whitespace-pre-line text-lg leading-relaxed">
                                {selectedArticle.content}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
