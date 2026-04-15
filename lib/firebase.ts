import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAiquF-qch4s0DNWWbOFopfbD0rEjtHT1g",
  authDomain: "raktasetu-12441.firebaseapp.com",
  projectId: "raktasetu-12441",
  storageBucket: "raktasetu-12441.firebasestorage.app",
  messagingSenderId: "984798374578",
  appId: "1:984798374578:web:11b4a6e86a7e4d268177ab",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
