import { useEffect, useState } from "react";
import Login from './auth/Login';
import Dashboard from './pages/Dashboard';
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

        // ambil role dari Firestore
        const adminRef = doc(db, "admins", uid);
        const adminSnap = await getDoc(adminRef);

        if (adminSnap.exists()) {
          setUser({
            ...currentUser,
            ...adminSnap.data()
          });
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return user ? (
    <Dashboard />

  ) : (
    <Login setUser={setUser} />
  )
}
