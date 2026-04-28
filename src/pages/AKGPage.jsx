import { useEffect, useState } from "react";
import Modal from "../components/Modal";
import { db } from "../services/firebase";
import { collection, getDocs, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAdd, faPencilAlt, faTrash } from '@fortawesome/free-solid-svg-icons'

export default function AKGPage() {
  const [showModal, setShowModal] = useState(false);
  const [data, setData] = useState([]);
  const [editData, setEditData] = useState(null);

  const fetchData = async () => {
    try {
      const q = query(collection(db, "akg_ibu"), orderBy("usia_min", "asc"));
      const snapshot = await getDocs(q);

      const result = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setData(result);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = confirm("Yakin ingin menghapus data?");
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "akg_ibu", id));
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-bold">Data AKG Ibu</h2>

        <button
          onClick={() => setShowModal(true)}
          className="bg-pink-500 text-white px-4 py-2 rounded"
        >
          <FontAwesomeIcon icon={faAdd} />
        </button>
      </div>

      {/* Table akg */}
      <div className="bg-white p-4 rounded shadow overflow-x-auto">
        <table className="w-full text-sm caption-top md:caption-bottom">
          <thead>
            <tr className="border-b bg-gray-100">
              <th className="px-4 py-2 text-left">Usia</th>
              <th className="px-4 py-2 text-left">Energi</th>
              <th className="px-4 py-2 text-left">Protein</th>
              <th className="px-4 py-2 text-left">Lemak</th>
              <th className="px-4 py-2 text-left">Karbo</th>
              <th className="px-4 py-2 text-left">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {data.map((item, index) => (
              <tr
                key={item.id}
                className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
              >
                <td className="px-4 py-2">{item.usia_min} - {item.usia_max}</td>
                <td className="px-4 py-2">{item.energi}</td>
                <td className="px-4 py-2">{item.protein}</td>
                <td className="px-4 py-2">{item.lemak}</td>
                <td className="px-4 py-2">{item.karbohidrat}</td>
                <td className="px-4 py-2 flex gap-2">
                  <button
                    onClick={() => setEditData(item)}
                    className="bg-yellow-400 hover:bg-yellow-500 text-white px-2 py-1 rounded"
                  >
                    <FontAwesomeIcon icon={faPencilAlt} >Edit</FontAwesomeIcon>
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                  >

                    <FontAwesomeIcon icon={faTrash} >Hapus</FontAwesomeIcon>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(showModal || editData) && (
        <Modal
          data={editData}
          onClose={() => {
            setShowModal(false);
            setEditData(null);
            fetchData();
          }}
        />
      )}
    </div>
  );
}

const SidebarItem = ({ icon, label, open, active }) => (
  <div className={`flex items-center gap-4 p-3 cursor-pointer ${active ? "bg-white text-indigo-600" : "text-white hover:bg-white hover:text-indigo-600 rounded"}`}>
    {icon}
    {open && <span>{label}</span>}
  </div>
);