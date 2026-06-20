import { useEffect, useState } from "react";
import Login from './auth/Login';
import AppRoutes from "./app/routes";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./services/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const uid = currentUser.uid;

        // ambil data user dari collection users
        let userRef = doc(db, "users", uid);
        let userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          userRef = doc(db, "admins", uid);
          userSnap = await getDoc(userRef);
        }

        if (!userSnap.exists()) {
          setUser(null);
        } else {
          const userData = userSnap.data();

          setUser({
            ...currentUser,
            ...userData,
          });
        }
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    // Tampilan Loading disamakan persis dengan komponen Monitoring
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 font-sans">
          <div className="flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-4 border-pink-100 border-t-[#D81B60] rounded-full animate-spin mb-3"></div>
            <p className="text-sm font-bold text-gray-400 animate-pulse">Memuat e-ASI Care...</p>
          </div>
        </div>
    );
  }

  return user ? (
      <AppRoutes user={user} setUser={setUser} />
  ) : (
      <AppRoutes user={null} setUser={setUser} />
  );
}
