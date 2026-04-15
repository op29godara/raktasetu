"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [adminName, setAdminName] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/login");
        setLoading(false);
        return;
      }

      try {
        const userSnap = await getDoc(doc(db, "users", currentUser.uid));

        if (!userSnap.exists()) {
          await signOut(auth);
          router.push("/login");
          return;
        }

        const userData = userSnap.data();

        if (userData.role !== "admin") {
          await signOut(auth);
          alert("Access denied");
          router.push("/login");
          return;
        }

        setAdminName(userData.name || "Admin");
      } catch (error) {
        await signOut(auth);
        router.push("/login");
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return <div style={{ padding: "40px" }}>Loading...</div>;
  }

  return (
    <div style={{ padding: "24px" }}>
      <h1>Welcome Admin {adminName}</h1>
      <p>This is your admin dashboard.</p>
    </div>
  );
}
