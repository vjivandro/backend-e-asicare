import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAdd, faPencilAlt, faTrash } from '@fortawesome/free-solid-svg-icons';
import {
    getEdukasi,
    createEdukasi,
    updateEdukasi,
    deleteEdukasi
} from "../edukasiService";

const kategoriMap = {
    11: "Gizi Seimbang",
    12: "Perilaku Menyusui",
    13: "Kelancaran ASI",
};

export default function AdminEdukasi() {
    const [form, setForm] = useState({
        title: "",
        content: "",
        media: "",
        date: "",
        kategori: "",
    });

    const [data, setData] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    const fetchData = async () => {
        const result = await getEdukasi();
        setData(result);
    };

    useEffect(() => {
        const load = async () => {
            await fetchData();
        };

        load();
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editingId) {
                await updateEdukasi(editingId, form);
                setEditingId(null);
            } else {
                await createEdukasi(form);
            }

            setForm({ title: "", content: "", media: "", date: "", kategori: "" });
            fetchData();
            setShowModal(false);
        } catch (err) {
            console.error(err);
        }
    };

    const handleEdit = (item) => {
        setShowModal(true);
        setForm({
            title: item.title,
            content: item.content,
            media: item.media,
            kategori: item.kategori || "",
            date: item.date
                ? new Date(item.date.seconds * 1000)
                    .toISOString()
                    .slice(0, 16)
                : "",
        });
        setEditingId(item.id);
    };

    const handleDelete = async (id) => {
        if (confirm("Yakin hapus data?")) {
            await deleteEdukasi(id);
            fetchData();
        }
    };

    return (
        <div className="w-full p-4 md:p-6">
            {/* HEADER + BUTTON */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 mb-4">
                <h2 className="text-xl md:text-2xl font-bold">Daftar Edukasi</h2>
                <button
                    onClick={() => setShowModal(true)}
                    className="w-full md:w-auto bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600"
                >
                    <FontAwesomeIcon icon={faAdd}/>
                </button>
            </div>

            {/* MODAL */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4">
                            {editingId ? "Edit Edukasi" : "Tambah Edukasi"}
                        </h3>

                        <form onSubmit={handleSubmit}>
                            <input className="border p-2 rounded w-full mb-2" name="title" placeholder="Judul"
                                   value={form.title} onChange={handleChange} required/>
                            <textarea className="border p-2 rounded w-full mb-2" name="content" placeholder="Konten"
                                      value={form.content} onChange={handleChange} required/>
                            <input className="border p-2 rounded w-full mb-2" name="media" placeholder="URL media"
                                   value={form.media} onChange={handleChange}/>
                            <select
                                className="border p-2 rounded w-full mb-2"
                                name="kategori"
                                value={form.kategori}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Pilih Kategori</option>
                                <option value="11">Gizi Seimbang</option>
                                <option value="12">Perilaku Menyusui</option>
                                <option value="13">Kelancaran ASI</option>
                            </select>
                            <input
                                className="border p-2 rounded w-full mb-3"
                                type="datetime-local"
                                name="date"
                                value={form.date}
                                onChange={handleChange}
                            />

                            <div className="flex justify-end gap-2 mt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setEditingId(null);
                                        setForm({title: "", content: "", media: "", date: "", kategori: ""});
                                    }}
                                    className="px-4 py-2 rounded border"
                                >
                                    Batal
                                </button>

                                <button
                                    type="submit"
                                    className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600"
                                >
                                    {editingId ? "Update" : "Simpan"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* LIST */}
            <div className="bg-white rounded shadow overflow-x-auto">
                <table className="min-w-[700px] w-full text-sm">
                    <thead className="bg-gray-100">
                    <tr>
                        <th className="p-3 text-left">Judul</th>
                        <th className="p-3 text-left">Konten</th>
                        <th className="p-3 text-left">Kategori</th>
                        <th className="p-3 text-left">Media</th>
                        <th className="p-3 text-left">Tanggal</th>
                        <th className="p-3 text-left">Aksi</th>
                    </tr>
                    </thead>
                    <tbody>
                    {data.map(item => (
                        <tr
                            key={item.id}
                            className="border-t hover:bg-gray-50 align-top cursor-pointer"
                            onClick={() => setSelectedItem(item)}
                        >
                            <td className="p-3 font-medium">{item.title}</td>

                            <td className="p-3 text-sm text-gray-700 break-words">
                                {item.content?.length > 120
                                    ? item.content.slice(0, 120) + "..."
                                    : item.content}
                            </td>

                            <td className="p-3 text-sm">
                  <span className="px-2 py-1 rounded-full bg-pink-100 text-pink-600 text-xs">
                    {kategoriMap[item.kategori] || "-"}
                  </span>
                            </td>

                            <td className="p-3">
                                {item.media && (
                                    item.media.includes("youtube") || item.media.includes("youtu.be") ? (
                                        <img
                                            src={`https://img.youtube.com/vi/${item.media.split("v=")[1]?.split("&")[0] || item.media.split("youtu.be/")[1]}/0.jpg`}
                                            alt="thumbnail"
                                            className="w-20 h-14 object-cover rounded shrink-0"
                                        />
                                    ) : item.media.includes("mp4") ? (
                                        <video className="w-20 h-14 object-cover rounded shrink-0" controls
                                               src={item.media}/>
                                    ) : (
                                        <img src={item.media} className="w-20 h-14 object-cover rounded shrink-0"/>
                                    )
                                )}
                            </td>

                            <td className="p-3 text-sm text-gray-600">
                                {item.date
                                    ? new Date(item.date.seconds * 1000).toLocaleString("id-ID", {
                                        day: "2-digit",
                                        month: "long",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })
                                    : "-"}
                            </td>

                            <td className="p-3">
                                <button
                                    className="bg-yellow-400 px-3 py-1 rounded mr-2"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleEdit(item);
                                    }}
                                >
                                    <FontAwesomeIcon icon={faPencilAlt}/>
                                </button>

                                <button
                                    className="bg-red-500 text-white px-3 py-1 rounded"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(item.id);
                                    }}
                                >
                                    <FontAwesomeIcon icon={faTrash}/>
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
            {/* DETAIL MODAL */}
            {selectedItem && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div
                        className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-4 md:p-6 overflow-y-auto max-h-[90vh]">
                        <h2 className="text-2xl font-bold mb-4">{selectedItem.title}</h2>
                        <div className="mb-3">
            <span className="px-3 py-1 rounded-full bg-pink-100 text-pink-600 text-sm">
              {kategoriMap[selectedItem.kategori] || ""}
            </span>
                        </div>

                        {/* Media */}
                        {selectedItem.media && (
                            selectedItem.media.includes("youtube") || selectedItem.media.includes("youtu.be") ? (
                                <iframe
                                    className="w-full h-64 mb-4 rounded"
                                    src={`https://www.youtube.com/embed/${selectedItem.media.split("v=")[1]?.split("&")[0] || selectedItem.media.split("youtu.be/")[1]}`}
                                    title="YouTube video"
                                    allowFullScreen
                                />
                            ) : selectedItem.media.includes("mp4") ? (
                                <video className="w-full mb-4 rounded" controls src={selectedItem.media}/>
                            ) : (
                                <img src={selectedItem.media} className="w-full mb-4 rounded"/>
                            )
                        )}

                        {/* Content */}
                        <p className="text-gray-700 whitespace-pre-line mb-4">
                            {selectedItem.content}
                        </p>

                        {/* Date */}
                        <p className="text-sm text-gray-500 mb-4">
                            {selectedItem.date
                                ? new Date(selectedItem.date.seconds * 1000).toLocaleString("id-ID", {
                                    day: "2-digit",
                                    month: "long",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })
                                : ""}
                        </p>

                        <div className="flex justify-end">
                            <button
                                onClick={() => setSelectedItem(null)}
                                className="px-4 py-2 bg-gray-200 rounded"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
