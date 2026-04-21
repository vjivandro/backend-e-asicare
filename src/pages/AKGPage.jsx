import { useState } from "react";
import Modal from "../components/Modal";

export default function AKGPage() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-bold">Data AKG Ibu</h2>

        <button
          onClick={() => setShowModal(true)}
          className="bg-pink-500 text-white px-4 py-2 rounded"
        >
          + Tambah Data
        </button>
      </div>

      {/* Table dummy */}
      <div className="bg-white p-4 rounded shadow">
        <p className="text-gray-500">
          Data akan tampil di sini
        </p>
      </div>

      {showModal && (
        <Modal onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}