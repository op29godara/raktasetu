"use client";

import React from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export default function SignupPage() {
  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    try {
      // Firebase Auth: create user with email & password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user; // yaha se uid milega [web:193][web:405]

      // Firestore: users collection me document create karo
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name,
        email,
        createdAt: serverTimestamp(),
      }); // Auth ke saath profile data store karna recommended hai. [web:391][web:402]

      alert("Signup successful");
      form.reset();
      // yahan baad me tum /donor-register ya /login par navigate kar sakte ho
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
        background: "#f5f5f5",
      }}
    >
      <form
        onSubmit={handleSignup}
        style={{
          width: "100%",
          maxWidth: "400px",
          padding: "24px",
          borderRadius: "12px",
          background: "#ffffff",
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <h1 style={{ marginBottom: "8px", textAlign: "center" }}>Sign Up</h1>

        <label style={{ fontSize: "14px" }}>
          Full Name
          <input
            type="text"
            name="name"
            required
            placeholder="Enter your name"
            style={{
              width: "100%",
              marginTop: "4px",
              padding: "10px 12px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              fontSize: "14px",
            }}
          />
        </label>

        <label style={{ fontSize: "14px" }}>
          Email
          <input
            type="email"
            name="email"
            required
            placeholder="you@example.com"
            style={{
              width: "100%",
              marginTop: "4px",
              padding: "10px 12px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              fontSize: "14px",
            }}
          />
        </label>

        <label style={{ fontSize: "14px" }}>
          Password
          <input
            type="password"
            name="password"
            required
            minLength={6}
            placeholder="Minimum 6 characters"
            style={{
              width: "100%",
              marginTop: "4px",
              padding: "10px 12px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              fontSize: "14px",
            }}
          />
        </label>

        <button
          type="submit"
          style={{
            marginTop: "12px",
            padding: "10px 12px",
            borderRadius: "8px",
            border: "none",
            fontSize: "15px",
            fontWeight: 600,
            background: "#2563eb",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Create Account
        </button>
      </form>
    </div>
  );
}
