import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../services/firebase";

export default function Register() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // optional: simpan username ke profile Firebase Auth
      await import("firebase/auth").then(({ updateProfile }) =>
        updateProfile(userCredential.user, { displayName: username })
      );
      navigate("/login");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate("/admin/dashboard");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* LEFT */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex-col justify-center px-12">
        <h1 className="text-4xl font-bold mb-4">e-ASI Care</h1>
        <h2 className="text-3xl font-semibold mb-2">Buat Akun Baru 🚀</h2>
        <p className="text-sm opacity-90 mb-6">
          Daftar untuk mulai mengelola data gizi dan monitoring ibu menyusui.
        </p>
      </div>

      {/* RIGHT */}
      <div className="flex w-full md:w-1/2 items-center justify-center bg-gray-100 p-4">
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 w-full max-w-sm">
          <h2 className="text-2xl font-bold text-center mb-2">Create Account</h2>

          <div className="mb-4">
            <label className="text-sm text-gray-600">Username</label>
            <input
                type="text"
                placeholder="Enter your username"
                className="border rounded-lg p-2 w-full mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="text-sm text-gray-600">Email</label>
            <input
                type="email"
                placeholder="Enter your email address"
                className="border rounded-lg p-2 w-full mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="mb-2">
            <label className="text-sm text-gray-600">Password</label>
            <input
                type="password"
                placeholder="********"
                className="border rounded-lg p-2 w-full mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
              onClick={handleRegister}
              disabled={loading || !username || !email || !password}
              className="bg-indigo-600 hover:bg-indigo-700 transition text-white w-full py-2 rounded-lg font-semibold mt-4"
          >
            {loading ? "Loading..." : "Register"}
          </button>

          <div className="flex items-center my-4">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="px-2 text-sm text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          <div className="flex justify-center">
            <button
                onClick={handleGoogleRegister}
                className="bg-white border p-2 rounded-lg shadow hover:bg-gray-100"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5"/>
            </button>
          </div>

          <p className="text-sm text-center mt-4">
            Already have an account?
            <button
                onClick={() => navigate("/login")}
                className="text-indigo-600 font-semibold hover:underline ml-1"
            >
              Login
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}
