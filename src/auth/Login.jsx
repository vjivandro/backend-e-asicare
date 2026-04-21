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
    <div className="flex h-screen items-center justify-center">
      <div className="bg-white p-6 rounded-xl shadow w-80">
        <h2 className="text-xl font-bold mb-4">Login Admin</h2>

        <input
          placeholder="Email"
          className="border p-2 w-full mb-2"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="border p-2 w-full mb-4"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="bg-pink-500 text-white w-full py-2 rounded"
        >
          Login
        </button>
      </div>
    </div>
  );
}