import { useState } from "react"; // ✅ Hapus useEffect
import { db } from "../services/firebase";
import { doc, updateDoc, addDoc, collection } from "firebase/firestore";

export default function Modal({ onClose, data }) {

  // ✅ Inisialisasi langsung dari data prop — tidak perlu useEffect
  const [form, setForm] = useState({
    usia_min: data?.usia_min ?? "",
    usia_max: data?.usia_max ?? "",
    energi: data?.energi ?? "",
    protein: data?.protein ?? "",
    lemak: data?.lemak ?? "",
    karbohidrat: data?.karbohidrat ?? ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    const isEmpty = Object.values(form).some((v) => v === "" || v === null);
    if (isEmpty) {
      alert("Semua field harus diisi!");
      return;
    }

    const payload = {
      usia_min: Number(form.usia_min),
      usia_max: Number(form.usia_max),
      energi: Number(form.energi),
      protein: Number(form.protein),
      lemak: Number(form.lemak),
      karbohidrat: Number(form.karbohidrat)
    };

    try {
      if (data?.id) {
        await updateDoc(doc(db, "akg_ibu", data.id), payload);
        alert("Data berhasil diupdate!");
      } else {
        await addDoc(collection(db, "akg_ibu"), payload);
        alert("Data berhasil ditambahkan!");
      }
      onClose();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
      <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-xl w-96">
          <h3 className="text-lg font-bold mb-4">
            {data ? "Edit Data AKG" : "Tambah Data AKG"}
          </h3>

          <label className="block text-sm mb-1">Usia Min</label>
          <input name="usia_min" type="number" onChange={handleChange} className="border p-2 w-full mb-2 rounded" value={form.usia_min} />
          <label className="block text-sm mb-1">Usia Max</label>
          <input name="usia_max" type="number" onChange={handleChange} className="border p-2 w-full mb-2 rounded" value={form.usia_max} />
          <label className="block text-sm mb-1">Energi</label>
          <input name="energi" type="number" onChange={handleChange} className="border p-2 w-full mb-2 rounded" value={form.energi} />
          <label className="block text-sm mb-1">Protein</label>
          <input name="protein" type="number" onChange={handleChange} className="border p-2 w-full mb-2 rounded" value={form.protein} />
          <label className="block text-sm mb-1">Lemak</label>
          <input name="lemak" type="number" onChange={handleChange} className="border p-2 w-full mb-2 rounded" value={form.lemak} />
          <label className="block text-sm mb-1">Karbohidrat</label>
          <input name="karbohidrat" type="number" onChange={handleChange} className="border p-2 w-full mb-4 rounded" value={form.karbohidrat} />

          <div className="flex justify-end gap-2">
            <button onClick={onClose} className="px-3 py-1 border rounded hover:bg-gray-100">
              Batal
            </button>
            <button onClick={handleSave} className="bg-pink-500 hover:bg-pink-600 text-white px-3 py-1 rounded">
              Simpan
            </button>
          </div>
        </div>
      </div>
  );
}
