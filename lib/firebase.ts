import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAiquF-qch4s0DNWbOFopfDbOrEjtHT1g",
  authDomain: "raktasetu-12441.firebaseapp.com",
  projectId: "raktasetu-12441",
  storageBucket: "raktasetu-12441.firebasestorage.app",
  messagingSenderId: "984798374578",
  appId: "1:984798374578:web:11b4a6e86a7e4d268177ab",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
