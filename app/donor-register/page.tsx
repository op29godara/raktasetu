"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export default function DonorRegisterPage() {
  const router = useRouter();

  const handleDonorRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const user = auth.currentUser;

    if (!user) {
      alert("Please login first");
      router.push("/login");
      return;
    }

    const form = e.currentTarget;
    const fullName = (form.elements.namedItem("fullName") as HTMLInputElement).value;
    const phone = (form.elements.namedItem("phone") as HTMLInputElement).value;
    const bloodGroup = (form.elements.namedItem("bloodGroup") as HTMLSelectElement).value;
    const city = (form.elements.namedItem("city") as HTMLInputElement).value;
    const age = (form.elements.namedItem("age") as HTMLInputElement).value;

    try {
      await setDoc(doc(db, "donors", user.uid), {
        uid: user.uid,
        fullName,
        phone,
        bloodGroup,
        city,
        age,
        email: user.email,
        createdAt: serverTimestamp(),
      });

      alert("Donor profile saved successfully");
      form.reset();
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #7f1d1d 0%, #b91c1c 45%, #ef4444 100%)",
        padding: "20px",
      }}
    >
      <form
        onSubmit={handleDonorRegister}
        style={{
          width: "100%",
          maxWidth: "480px",
          padding: "32px",
          borderRadius: "18px",
          background: "rgba(255,255,255,0.96)",
          boxShadow: "0 20px 50px rgba(127, 29, 29, 0.35)",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
          border: "1px solid rgba(255,255,255,0.35)",
        }}
      >
        <h1 style={{ marginBottom: "10px", textAlign: "center", color: "#991b1b", fontSize: "30px", fontWeight: 700 }}>
          Donor Register
        </h1>

        <p style={{ textAlign: "center", color: "#7f1d1d", marginTop: "-6px", marginBottom: "10px", fontSize: "14px" }}>
          Complete your donor profile
        </p>

        <label style={{ fontSize: "14px", color: "#7f1d1d", fontWeight: 600 }}>
          Full Name
          <input type="text" name="fullName" required placeholder="Enter full name" style={{ width: "100%", marginTop: "6px", padding: "12px 14px", borderRadius: "10px", border: "1px solid #fca5a5", fontSize: "14px", outline: "none", background: "#fff", color: "#111827" }} />
        </label>

        <label style={{ fontSize: "14px", color: "#7f1d1d", fontWeight: 600 }}>
          Phone Number
          <input type="tel" name="phone" required placeholder="Enter phone number" style={{ width: "100%", marginTop: "6px", padding: "12px 14px", borderRadius: "10px", border: "1px solid #fca5a5", fontSize: "14px", outline: "none", background: "#fff", color: "#111827" }} />
        </label>

        <label style={{ fontSize: "14px", color: "#7f1d1d", fontWeight: 600 }}>
          Blood Group
          <select name="bloodGroup" required style={{ width: "100%", marginTop: "6px", padding: "12px 14px", borderRadius: "10px", border: "1px solid #fca5a5", fontSize: "14px", outline: "none", background: "#fff", color: "#111827" }}>
            <option value="">Select blood group</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
          </select>
        </label>

        <label style={{ fontSize: "14px", color: "#7f1d1d", fontWeight: 600 }}>
          City
          <input type="text" name="city" required placeholder="Enter city" style={{ width: "100%", marginTop: "6px", padding: "12px 14px", borderRadius: "10px", border: "1px solid #fca5a5", fontSize: "14px", outline: "none", background: "#fff", color: "#111827" }} />
        </label>

        <label style={{ fontSize: "14px", color: "#7f1d1d", fontWeight: 600 }}>
          Age
          <input type="number" name="age" required placeholder="Enter age" style={{ width: "100%", marginTop: "6px", padding: "12px 14px", borderRadius: "10px", border: "1px solid #fca5a5", fontSize: "14px", outline: "none", background: "#fff", color: "#111827" }} />
        </label>

        <button
          type="submit"
          style={{
            marginTop: "12px",
            padding: "13px 16px",
            borderRadius: "10px",
            border: "none",
            fontSize: "16px",
            fontWeight: 700,
            background: "linear-gradient(90deg, #991b1b, #dc2626)",
            color: "#fff",
            cursor: "pointer",
            boxShadow: "0 10px 25px rgba(220, 38, 38, 0.35)",
          }}
        >
          Save Donor Profile
        </button>
      </form>
    </div>
  );
}
