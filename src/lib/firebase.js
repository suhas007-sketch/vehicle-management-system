import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBkrGFaLIYVUtPkX-Xc5Cu8LnPQqH4XgCQ",
  authDomain: "vehicle-rental-managemen-f0000.firebaseapp.com",
  projectId: "vehicle-rental-managemen-f0000",
  storageBucket: "vehicle-rental-managemen-f0000.firebasestorage.app",
  messagingSenderId: "579570007768",
  appId: "1:579570007768:web:23e37fe26fc337f9bfa1ad",
  measurementId: "G-T8E5S1WMLJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export { app, auth, db, analytics };
