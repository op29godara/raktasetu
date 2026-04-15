"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export default function SignupPage() {
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name,
        email,
        createdAt: serverTimestamp(),
      });

      alert("Signup successful");
      form.reset();
      router.push("/donor-register");
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
        onSubmit={handleSignup}
        style={{
          width: "100%",
          maxWidth: "420px",
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
        <h1 style={{ marginBottom: "10px", textAlign: "center", color: "#991b1b", fontSize: "32px", fontWeight: 700 }}>
          Sign Up
        </h1>

        <p style={{ textAlign: "center", color: "#7f1d1d", marginTop: "-6px", marginBottom: "10px", fontSize: "14px" }}>
          Create your account to continue
        </p>

        <label style={{ fontSize: "14px", color: "#7f1d1d", fontWeight: 600 }}>
          Full Name
          <input
            type="text"
            name="name"
            required
            placeholder="Enter your name"
            style={{
              width: "100%",
              marginTop: "6px",
              padding: "12px 14px",
              borderRadius: "10px",
              border: "1px solid #fca5a5",
              fontSize: "14px",
              outline: "none",
              background: "#fff",
              color: "#111827",
            }}
          />
        </label>

        <label style={{ fontSize: "14px", color: "#7f1d1d", fontWeight: 600 }}>
          Email
          <input
            type="email"
            name="email"
            required
            placeholder="you@example.com"
            style={{
              width: "100%",
              marginTop: "6px",
              padding: "12px 14px",
              borderRadius: "10px",
              border: "1px solid #fca5a5",
              fontSize: "14px",
              outline: "none",
              background: "#fff",
              color: "#111827",
            }}
          />
        </label>

        <label style={{ fontSize: "14px", color: "#7f1d1d", fontWeight: 600 }}>
          Password
          <input
            type="password"
            name="password"
            required
            minLength={6}
            placeholder="Minimum 6 characters"
            style={{
              width: "100%",
              marginTop: "6px",
              padding: "12px 14px",
              borderRadius: "10px",
              border: "1px solid #fca5a5",
              fontSize: "14px",
              outline: "none",
              background: "#fff",
              color: "#111827",
            }}
          />
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
          Create Account
        </button>
      </form>
    </div>
  );
}
