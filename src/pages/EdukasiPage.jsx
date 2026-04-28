import React, { useState, useEffect } from "react";
import { db } from "../services/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAdd, faPencilAlt, faTrash } from '@fortawesome/free-solid-svg-icons';

const kategoriMap = {
  11: "Gizi Seimbang",
  12: "Perilaku Menyusui",
  13: "Kelancaran ASI",
};

export default function EdukasiPage() {
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
    const snapshot = await getDocs(collection(db, "edukasi"));
    const result = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setData(result);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        await updateDoc(doc(db, "edukasi", editingId), {
          ...form,
          kategori: Number(form.kategori),
          date: form.date ? new Date(form.date) : null,
        });
        setEditingId(null);
      } else {
        await addDoc(collection(db, "edukasi"), {
          ...form,
          kategori: Number(form.kategori),
          date: form.date ? new Date(form.date) : null,
          created_at: new Date(),
        });
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
      await deleteDoc(doc(db, "edukasi", id));
      fetchData();
    }
  };

  return (
    <div className="p-6">
      {/* HEADER + BUTTON */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Daftar Edukasi</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600"
        >
          <FontAwesomeIcon icon={faAdd} />
        </button>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {editingId ? "Edit Edukasi" : "Tambah Edukasi"}
            </h3>

            <form onSubmit={handleSubmit}>
              <input className="border p-2 rounded w-full mb-2" name="title" placeholder="Judul" value={form.title} onChange={handleChange} required />
              <textarea className="border p-2 rounded w-full mb-2" name="content" placeholder="Konten" value={form.content} onChange={handleChange} required />
              <input className="border p-2 rounded w-full mb-2" name="media" placeholder="URL media" value={form.media} onChange={handleChange} />
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
                    setForm({ title: "", content: "", media: "", date: "", kategori: "" });
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
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left w-1/5">Judul</th>
              <th className="p-3 text-left w-2/5">Konten</th>
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

                <td className="p-3 text-sm text-gray-700">
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
                        className="w-20 h-14 object-cover rounded"
                      />
                    ) : item.media.includes("mp4") ? (
                      <video className="w-20 h-14 object-cover rounded" controls src={item.media} />
                    ) : (
                      <img src={item.media} className="w-20 h-14 object-cover rounded" />
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
                    <FontAwesomeIcon icon={faPencilAlt} />
                  </button>

                  <button
                    className="bg-red-500 text-white px-3 py-1 rounded"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(item.id);
                    }}
                  >
                    <FontAwesomeIcon icon={faTrash} />
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
        <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 overflow-y-auto max-h-[90vh]">
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
              <video className="w-full mb-4 rounded" controls src={selectedItem.media} />
            ) : (
              <img src={selectedItem.media} className="w-full mb-4 rounded" />
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