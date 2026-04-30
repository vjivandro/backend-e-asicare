import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../services/firebase";

export default function AdminDashboard({ user }) {
    const [akgCount, setAkgCount] = useState(0);
    const [userCount, setUserCount] = useState(0);
    const [adminCount, setAdminCount] = useState(0);

    const fetchStats = async () => {
        try {
            const akgSnapshot = await getDocs(collection(db, "akg_ibu"));
            const userSnapshot = await getDocs(collection(db, "users"));
            const adminSnapshot = await getDocs(collection(db, "admins"));

            setAkgCount(akgSnapshot.size);
            setUserCount(userSnapshot.size);
            setAdminCount(adminSnapshot.size);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
            <p className="mb-6 text-gray-600">Selamat datang, {user?.username}</p>

            {/* Statistik */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-4 rounded shadow">
                    <p className="text-gray-500 text-sm">Total Data AKG</p>
                    <h2 className="text-2xl font-bold">{akgCount}</h2>
                </div>

                <div className="bg-white p-4 rounded shadow">
                    <p className="text-gray-500 text-sm">Total User</p>
                    <h2 className="text-2xl font-bold">{userCount}</h2>
                </div>

                <div className="bg-white p-4 rounded shadow">
                    <p className="text-gray-500 text-sm">SuperAdmin</p>
                    <h2 className="text-xl font-semibold capitalize">{adminCount}</h2>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-4 rounded shadow">
                <h3 className="font-semibold mb-3">Aksi Cepat</h3>
                <div className="flex gap-3">
                    <button className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
                        Tambah Data AKG
                    </button>
                    {/* <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            Tambah User
          </button> */}
                </div>
            </div>
        </div>
    );
}
