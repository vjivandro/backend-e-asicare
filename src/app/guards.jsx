import { Navigate } from "react-router-dom";
import { useEffect, useState, cloneElement } from "react";
import { auth } from "../services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { Loader2 } from "lucide-react"; // Import icon spinner dari Lucide

// --- KOMPONEN LOADING KEREN ---
const LoadingScreen = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="relative flex items-center justify-center">
        {/* Efek lingkaran menyebar (ping) di belakang spinner */}
        <div className="absolute w-16 h-16 bg-pink-200 rounded-full animate-ping opacity-60"></div>

        {/* Spinner utama dengan warna tema e-ASI Care */}
        <Loader2 className="w-10 h-10 text-[#D81B60] animate-spin relative z-10" />
      </div>

      {/* Teks loading dengan efek berkedip lembut */}
      <p className="mt-6 text-sm font-medium text-gray-500 animate-pulse tracking-wide">
        Memuat e-ASI Care...
      </p>
    </div>
);

export function AdminGuard({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Memanggil LoadingScreen yang lebih keren
  if (loading) return <LoadingScreen />;

  // sementara: hanya cek login
  if (!user) {
    return <Navigate to="/login" />;
  }

  // TODO: tambahkan cek role dari Firestore jika sudah ada
  // Oper data 'user' ke komponen children
  return cloneElement(children, { user: user });
}

export function UserGuard({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Memanggil LoadingScreen yang lebih keren
  if (loading) return <LoadingScreen />;

  if (!user) {
    return <Navigate to="/login" />;
  }

  // Oper data 'user' ke komponen children
  return cloneElement(children, { user: user });
}
