import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, db } from "../services/firebase";
import {doc, updateDoc, serverTimestamp, getDoc} from "firebase/firestore";
import frontLogo from "../assets/front-logo.png";

export default function Login({ setUser }) {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const googleProvider = new GoogleAuthProvider();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            // 1. Proses login bawaan Firebase (contoh pakai email/password)
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 2. [INI TRIGGER-NYA] Update waktu terakhir login ke Firestore
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, {
                // Gunakan serverTimestamp agar waktunya akurat sesuai server Google, bukan jam HP user
                lastLogin: serverTimestamp()
            });

            // 3. Lanjut redirect ke halaman Home / Dashboard
            // navigate('/user/home');

        } catch (error) {
            console.error("Gagal login:", error);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            const res = await signInWithPopup(auth, googleProvider);
            const uid = res.user.uid;
            let userSnap = await getDoc(doc(db, "users", uid));
            const userData = userSnap.data();
            setUser({ ...res.user, ...userData });
            navigate("/user/home");
        } catch (err) { alert(err.message); }
    };

    return (
        <div className="min-h-screen flex bg-white font-sans">
            {/* LEFT SIDE - Ilustrasi Gaya Zoho */}
            <div className="hidden lg:flex w-1/2 bg-[#F8F9FB] flex-col justify-center items-center px-20 relative">
                <div className="absolute top-12 left-12">
                    <h1 className="text-2xl font-black text-[#D81B60] tracking-tighter">e-ASI Care.</h1>
                </div>
                <div className="max-w-md text-center lg:text-left">
                    <h2 className="text-4xl font-black text-gray-900 mb-4 leading-tight">Selamat Datang 👋</h2>
                    <p className="text-gray-500 text-lg mb-12">Pantau gizi dan tumbuh kembang buah hati dengan penuh
                        cinta setiap hari.</p>
                    {/* Area Ilustrasi (Bisa diganti image_73a9e2.png) */}
                    <img
                        src={frontLogo}
                        alt="Ilustrasi e-ASI Care"
                        className="w-full max-w-sm mix-blend-multiply"
                    />
                </div>
            </div>

            {/* RIGHT SIDE - Form Login */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    <div className="mb-10">
                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-[2px] mb-2">Start for free</p>
                        <h3 className="text-3xl font-black text-gray-900 mb-2">Masuk ke e-ASI Care.</h3>
                        <p className="text-sm text-gray-500">Belum punya akun? <button onClick={() => navigate("/register")} className="text-[#D81B60] font-bold hover:underline">Daftar sekarang</button></p>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="text-[12px] font-bold text-gray-700 block mb-2">Email</label>
                            <input
                                type="email"
                                placeholder="nama@email.com"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#FF85B3] focus:ring-4 focus:ring-pink-50 outline-none transition-all"
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="text-[12px] font-bold text-gray-700">Password</label>
                                <button className="text-[11px] font-bold text-[#D81B60] hover:underline">Lupa Password?</button>
                            </div>
                            <input
                                type="password"
                                placeholder="Minimal 8 karakter"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#FF85B3] focus:ring-4 focus:ring-pink-50 outline-none transition-all"
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <button
                            onClick={handleLogin}
                            className="w-full bg-gradient-to-r from-[#D81B60] to-[#FF6B9E] text-white py-4 rounded-xl font-black text-sm shadow-lg shadow-pink-100 hover:scale-[1.02] active:scale-95 transition-all"
                        >
                            Masuk Sekarang
                        </button>

                        <div className="relative py-4">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
                            <div className="relative flex justify-center text-[10px] uppercase font-black text-gray-300 tracking-widest"><span className="bg-white px-4">Atau</span></div>
                        </div>

                        <button
                            onClick={handleGoogleLogin}
                            className="w-full flex items-center justify-center gap-3 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-bold text-gray-600 text-sm"
                        >
                            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" />
                            Masuk dengan Google
                        </button>
                    </div>

                    <p className="mt-12 text-[10px] text-gray-400 text-center leading-relaxed">
                        Situs ini dilindungi oleh reCAPTCHA dan kebijakan privasi <br/>
                        <span className="font-bold underline cursor-pointer">Syarat & Ketentuan</span> berlaku.
                    </p>
                </div>
            </div>
        </div>
    );
}
