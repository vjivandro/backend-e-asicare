// 📁 src/components/Modal.jsx

import { useState } from "react";
import { db } from "../services/firebase";
import { collection, addDoc } from "firebase/firestore";

export default function Modal({ onClose }) {

  // 🔥 STATE FORM (TAMBAHKAN DI SINI)
  const [form, setForm] = useState({
    usia_min: "",
    usia_max: "",
    energi: "",
    protein: "",
    lemak: "",
    karbohidrat: ""
  });

  // 🔥 HANDLE INPUT
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  // 🔥 SIMPAN KE FIRESTORE
  const handleSave = async () => {
    try {
      await addDoc(collection(db, "akg_ibu"), {
        ...form,
        usia_min: Number(form.usia_min),
        usia_max: Number(form.usia_max),
        energi: Number(form.energi),
        protein: Number(form.protein),
        lemak: Number(form.lemak),
        karbohidrat: Number(form.karbohidrat)
      });

      alert("Data berhasil disimpan");
      onClose();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl w-96">
        <h3 className="text-lg font-bold mb-4">Tambah Data AKG</h3>

        {/* INPUT */}
        <input name="usia_min" placeholder="Usia Min" onChange={handleChange} className="border p-2 w-full mb-2" />
        <input name="usia_max" placeholder="Usia Max" onChange={handleChange} className="border p-2 w-full mb-2" />

        <input name="energi" placeholder="Energi" onChange={handleChange} className="border p-2 w-full mb-2" />
        <input name="protein" placeholder="Protein" onChange={handleChange} className="border p-2 w-full mb-2" />
        <input name="lemak" placeholder="Lemak" onChange={handleChange} className="border p-2 w-full mb-2" />
        <input name="karbohidrat" placeholder="Karbohidrat" onChange={handleChange} className="border p-2 w-full mb-4" />

        {/* BUTTON */}
        <div className="flex justify-end gap-2">
          <button onClick={onClose}>Batal</button>
          <button
            onClick={handleSave}
            className="bg-pink-500 text-white px-3 py-1 rounded"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}