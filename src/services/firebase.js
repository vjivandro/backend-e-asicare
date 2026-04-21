import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDGiVnKRc7w2xRCEmWeHFDuahIW0nVy-1k",
  authDomain: "e-asi-care.firebaseapp.com",
  projectId: "e-asi-care",
  storageBucket: "e-asi-care.firebasestorage.app",
  messagingSenderId: "403572042544",
  appId: "1:403572042544:web:8e7e3f294724f6e2cdb6f5"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);