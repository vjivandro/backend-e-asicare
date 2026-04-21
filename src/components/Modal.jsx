import { useState } from "react";
import { db } from "../services/firebase";
import { collection, addDoc } from "firebase/firestore";

export default function Modal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl w-96">
        <h3 className="text-lg font-bold mb-4">
          Tambah Data AKG
        </h3>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <input placeholder="Usia Min" className="border p-2 rounded" />
          <input placeholder="Usia Max" className="border p-2 rounded" />
        </div>

        <select className="border p-2 rounded w-full mb-3">
          <option>Normal</option>
          <option>Menyusui 0-6</option>
          <option>Menyusui 6-12</option>
        </select>

        <input placeholder="Energi" className="border p-2 rounded w-full mb-2" />
        <input placeholder="Protein" className="border p-2 rounded w-full mb-2" />
        <input placeholder="Lemak" className="border p-2 rounded w-full mb-2" />
        <input placeholder="Karbohidrat" className="border p-2 rounded w-full mb-4" />

        <div className="flex justify-end gap-2">
          <button onClick={onClose}>Batal</button>
          <button className="bg-pink-500 text-white px-3 py-1 rounded">
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}