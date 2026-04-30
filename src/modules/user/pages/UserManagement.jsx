import { useEffect, useState } from "react";
import { db } from "../../../services/firebase.js";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencilAlt, faKey, faTrash } from '@fortawesome/free-solid-svg-icons';

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const auth = getAuth();

    const fetchUsers = async () => {
        try {
            const snapshot = await getDocs(collection(db, "users"));

            const result = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setUsers(result);
        } catch (err) {
            alert(err.message);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleResetPassword = async (email) => {
        try {
            await sendPasswordResetEmail(auth, email);
            alert("Email reset password telah dikirim!");
        } catch (err) {
            alert(err.message);
        }
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Manajemen Pengguna</h1>

            <div className="bg-white p-4 rounded shadow">
                <table className="w-full text-sm border">
                    <thead>
                        <tr className="border-b bg-gray-100">
                            <th className="px-4 py-2 text-left">Email</th>
                            <th className="px-4 py-2 text-left">Nama</th>
                            <th className="px-4 py-2 text-left">Role</th>
                            <th className="px-4 py-2 text-left">Aksi</th>
                        </tr>
                    </thead>

                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id} className="border-b">
                                <td className="px-4 py-2">{user.email || "-"}</td>
                                <td className="px-4 py-2">{user.name || "-"}</td>
                                <td className="px-4 py-2">{user.role || "user"}</td>
                                <td className="px-4 py-2 flex gap-2">
                                    <button
                                        className="bg-yellow-400 text-white px-2 py-1 rounded"
                                        onClick={() => alert("Edit belum dibuat")}
                                    >
                                        <FontAwesomeIcon icon={faPencilAlt} />
                                    </button>
                                    <button
                                        className="bg-red-500 text-white px-2 py-1 rounded"
                                        onClick={async () => {
                                            const confirmDelete = confirm("Yakin ingin menghapus user?");
                                            if (!confirmDelete) return;

                                            await deleteDoc(doc(db, "users", user.id));
                                            fetchUsers();
                                        }}
                                    >
                                        <FontAwesomeIcon icon={faTrash} />
                                    </button>
                                    <button
                                        onClick={async () => await handleResetPassword(user.email)}
                                        className="bg-blue-500 text-white px-2 py-1 rounded"
                                    >
                                        <FontAwesomeIcon icon={faKey} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

const SidebarItem = ({ icon, label, open, active }) => (
    <div className={`flex items-center gap-4 p-3 cursor-pointer ${active ? "bg-white text-indigo-600" : "text-white hover:bg-white hover:text-indigo-600 rounded"}`}>
        {icon}
        {open && <span>{label}</span>}
    </div>
);
