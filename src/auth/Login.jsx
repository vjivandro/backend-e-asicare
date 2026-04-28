import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../services/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function Login({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      const uid = res.user.uid;
     console.log("UID dari login:", uid);

      // cek apakah admin
      const adminRef = doc(db, "admins", uid);
      const adminSnap = await getDoc(adminRef);

      console.log("Admin path:", adminRef.path);
      console.log("Admin exists:", adminSnap.exists());

      if (!adminSnap.exists()) {
        alert("Akses ditolak! Bukan admin.");
        return;
      }

      setUser(res.user);

    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* LEFT SIDE */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex-col justify-center px-12">
        <h1 className="text-4xl font-bold mb-4">e-ASI Care</h1>
        <h2 className="text-3xl font-semibold mb-2">Hey, Hello!</h2>
        <p className="text-sm opacity-90 mb-6">
          Dashboard Admin untuk mengelola data AKG ibu menyusui dengan mudah.
        </p>
        <p className="text-xs opacity-75">
          Kelola data gizi, pengguna, dan sistem dengan efisien.
        </p>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex w-full md:w-1/2 items-center justify-center bg-gray-100">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-80">
          <h2 className="text-2xl font-bold text-center mb-2">Welcome Back</h2>
          <p className="text-sm text-gray-500 text-center mb-6">
            Login sebagai admin untuk melanjutkan
          </p>

          <input
            placeholder="Email"
            className="border rounded-lg p-2 w-full mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="border rounded-lg p-2 w-full mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={handleLogin}
            className="bg-indigo-600 hover:bg-indigo-700 transition text-white w-full py-2 rounded-lg font-semibold"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}