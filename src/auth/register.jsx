import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth, db } from "../services/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import frontLogo from "../assets/front-logo.png";

export default function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const googleProvider = new GoogleAuthProvider();

  const handleRegister = async () => {
    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      // Simpan data awal ke Firestore Users
      await setDoc(doc(db, "users", uid), {
        uid: uid,
        username: username,
        email: email,
        role: "user",
        createdAt: new Date(),
        provider: "email"
      });

      // Arahkan ke login setelah sukses mendaftar
      navigate("/login");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const uid = res.user.uid;

      // Cek apakah admin (jaga-jaga kalau admin pakai Google Login di sini)
      const adminSnap = await getDoc(doc(db, "admins", uid));
      if (adminSnap.exists()) {
        navigate("/admin/dashboard");
        return;
      }

      // Cek apakah user sudah ada, jika belum buatkan dokumen baru
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
      }

      // Langsung masuk ke beranda user
      navigate("/user/home");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
      <div className="min-h-screen flex bg-white font-sans">
        {/* LEFT SIDE - Ilustrasi Gaya Zoho */}
        <div className="hidden lg:flex w-1/2 bg-[#F8F9FB] flex-col justify-center items-center px-20 relative">
          <div className="absolute top-12 left-12">
            <h1 className="text-2xl font-black text-[#D81B60] tracking-tighter">e-ASI Care.</h1>
          </div>
          <div className="max-w-md text-center lg:text-left">
            <h2 className="text-4xl font-black text-gray-900 mb-4 leading-tight">Buat Akun Baru 🚀</h2>
            <p className="text-gray-500 text-lg mb-12">Daftar sekarang untuk mulai mengelola gizi harian Anda dengan
              cara yang menyenangkan.</p>
            {/* Area Ilustrasi (Pakai placeholder yang sama agar senada) */}
            <img
                src={frontLogo}
                alt="Ilustrasi e-ASI Care"
                className="w-full max-w-sm mix-blend-multiply"
            />
          </div>
        </div>

        {/* RIGHT SIDE - Form Register */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="mb-10">
              <p className="text-[11px] font-black text-gray-400 uppercase tracking-[2px] mb-2">Join us today</p>
              <h3 className="text-3xl font-black text-gray-900 mb-2">Buat Akun e-ASI Care.</h3>
              <p className="text-sm text-gray-500">Sudah jadi member? <button onClick={() => navigate("/login")} className="text-[#D81B60] font-bold hover:underline">Log in</button></p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-[12px] font-bold text-gray-700 block mb-2">Username</label>
                <input
                    type="text"
                    placeholder="Masukkan nama panggilan Anda"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#FF85B3] focus:ring-4 focus:ring-pink-50 outline-none transition-all"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <div>
                <label className="text-[12px] font-bold text-gray-700 block mb-2">Email</label>
                <input
                    type="email"
                    placeholder="nama@email.com"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#FF85B3] focus:ring-4 focus:ring-pink-50 outline-none transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="text-[12px] font-bold text-gray-700 block mb-2">Password</label>
                <input
                    type="password"
                    placeholder="Minimal 8 karakter"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#FF85B3] focus:ring-4 focus:ring-pink-50 outline-none transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button
                  onClick={handleRegister}
                  disabled={loading || !username || !email || !password}
                  className="w-full bg-gradient-to-r from-[#D81B60] to-[#FF6B9E] text-white py-4 rounded-xl font-black text-sm shadow-lg shadow-pink-100 hover:scale-[1.02] active:scale-95 transition-all mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? "Mendaftar..." : "Buat Akun Sekarang"}
              </button>

              <div className="relative py-3">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
                <div className="relative flex justify-center text-[10px] uppercase font-black text-gray-300 tracking-widest"><span className="bg-white px-4">Atau</span></div>
              </div>

              <button
                  onClick={handleGoogleRegister}
                  className="w-full flex items-center justify-center gap-3 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-bold text-gray-600 text-sm"
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" />
                Daftar dengan Google
              </button>
            </div>

            <p className="mt-10 text-[10px] text-gray-400 text-center leading-relaxed">
              Situs ini dilindungi oleh reCAPTCHA dan kebijakan privasi <br/>
              <span className="font-bold underline cursor-pointer">Syarat & Ketentuan</span> berlaku.
            </p>
          </div>
        </div>
      </div>
  );
}
