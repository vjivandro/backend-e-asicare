import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, db } from "../services/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function Login({ setUser }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const googleProvider = new GoogleAuthProvider();

  const handleLogin = async () => {
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      const uid = res.user.uid;
     console.log("UID dari login:", uid);

      // ambil data user dari collection users
        // cek di users dulu
        let userRef = doc(db, "users", uid);
        let userSnap = await getDoc(userRef);

        // kalau tidak ada di users → cek admins
        if (!userSnap.exists()) {
            userRef = doc(db, "admins", uid);
            userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
                alert("User tidak ditemukan");
                return;
            }
        }


      const userData = userSnap.data();

      // validasi role
      if (!userData.role) {
        alert("Role user tidak ditemukan di database");
        return;
      }

      // set user + role
      setUser({
        ...res.user,
        ...userData,
      });

      // redirect berdasarkan role
      if (userData.role === "superadmin") {
        navigate("/admin/dashboard");
      } else if (userData.role === "user") {
        navigate("/user/home");
      } else {
        alert("Role tidak dikenali");
      }

    } catch (err) {
      alert(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const uid = res.user.uid;

        const adminSnap = await getDoc(doc(db, "admins", uid));
        if (adminSnap.exists()) {
            const adminData = adminSnap.data();
            setUser({ ...res.user, ...adminData });
            navigate("/admin/dashboard");
            return;
        }

        let userSnap = await getDoc(doc(db, "users", uid));

        if (!userSnap.exists()) {
            await setDoc(doc(db, "users", uid), {
                uid: uid,
                email: res.user.email,
                username: res.user.displayName || "User",
                role: "user",
                photoURL: res.user.photoURL || null,
                createdAt: new Date(),
                provider: "google",
            });

            // Ambil ulang setelah dibuat
            userSnap = await getDoc(doc(db, "users", uid));
        }

        const userData = userSnap.data();
        setUser({ ...res.user, ...userData });
        navigate("/user/home");

      if (userData.role === "superadmin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/user/home");
      }

    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* LEFT SIDE */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex-col justify-center px-12">
        <h1 className="text-4xl font-bold mb-4">e-ASI Care</h1>
        <h2 className="text-3xl font-semibold mb-2">Selamat Datang 👋</h2>
        <p className="text-sm opacity-90 mb-6">
          Dashboard Admin untuk mengelola data AKG ibu menyusui dengan mudah.
        </p>
        <p className="text-xs opacity-75">
          Kelola data gizi, pengguna, dan sistem dengan efisien.
        </p>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex w-full md:w-1/2 items-center justify-center bg-gray-100 p-4">
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 w-full max-w-sm">
          <h2 className="text-2xl font-bold text-center mb-2">Hello! Welcome back</h2>

          <div className="mb-4">
            <label className="text-sm text-gray-600">Email</label>
            <input
              placeholder="Enter your email address"
              className="border rounded-lg p-2 w-full mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="mb-2">
            <label className="text-sm text-gray-600">Password</label>
            <input
              type="password"
              placeholder="********"
              className="border rounded-lg p-2 w-full mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex justify-between items-center text-sm mb-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" />
              Remember me
            </label>
            <span className="text-indigo-500 cursor-pointer hover:underline">
              Reset Password?
            </span>
          </div>

          <button
            onClick={handleLogin}
            className="bg-indigo-600 hover:bg-indigo-700 transition text-white w-full py-2 rounded-lg font-semibold"
          >
            Login
          </button>

          <div className="flex items-center my-4">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="px-2 text-sm text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={handleGoogleLogin}
              className="bg-white border p-2 rounded-lg shadow hover:bg-gray-100"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" />
            </button>

            {/*<button className="bg-white border p-2 rounded-lg shadow opacity-50 cursor-not-allowed">*/}
            {/*  <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" className="w-5 h-5" />*/}
            {/*</button>*/}

            {/*<button className="bg-white border p-2 rounded-lg shadow opacity-50 cursor-not-allowed">*/}
            {/*  <img src="https://www.svgrepo.com/show/475654/apple-color.svg" className="w-5 h-5" />*/}
            {/*</button>*/}
          </div>

          <p className="text-sm text-center mt-4">
            Don't have an account?
            <button
              onClick={() => navigate("/register")}
              className="text-indigo-600 font-semibold hover:underline ml-1"
            >
              Create Account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
