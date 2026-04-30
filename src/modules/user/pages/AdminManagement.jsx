import { useEffect, useState } from "react";
import { db } from "../../../services/firebase.js";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";

export default function AdminManagement() {
    const [users, setUsers] = useState([]);

    const fetchUsers = async () => {
        try {
            const snapshot = await getDocs(collection(db, "admins"));

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

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Manajemen Admin</h1>

            <div className="bg-white p-4 rounded shadow">
                <table className="w-full text-sm border">
                    <thead>
                    <tr className="border-b bg-gray-100">
                        <th className="px-4 py-2 text-left">Email</th>
                        <th className="px-4 py-2 text-left">Username</th>
                        <th className="px-4 py-2 text-left">Role</th>
                    </tr>
                    </thead>

                    <tbody>
                    {users.map((user) => (
                        <tr key={user.id} className="border-b">
                            <td className="px-4 py-2">{user.email || "-"}</td>
                            <td className="px-4 py-2">{user.username || "-"}</td>
                            <td className="px-4 py-2">{user.role || "user"}</td>
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
