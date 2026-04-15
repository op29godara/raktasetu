"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("Login successful");
      form.reset();
      router.push("/");
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
        background: "linear-gradient(135deg, #5f0f14 0%, #9b111e 45%, #c81d25 100%)",
        padding: "20px",
      }}
    >
      <form
        onSubmit={handleLogin}
        style={{
          width: "100%",
          maxWidth: "420px",
          padding: "32px",
          borderRadius: "22px",
          background: "rgba(255,255,255,0.97)",
          boxShadow: "0 24px 60px rgba(80, 0, 0, 0.25)",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
        }}
      >
        <h1 style={{ textAlign: "center", color: "#8b1118", fontSize: "30px", fontWeight: 800 }}>
          Welcome Back
        </h1>

        <p style={{ textAlign: "center", color: "#6b7280", fontSize: "14px", marginBottom: "8px" }}>
          Login to continue
        </p>

        <input
          type="email"
          name="email"
          placeholder="Email Address"
          required
          style={inputStyle}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          required
          style={inputStyle}
        />

        <button type="submit" style={buttonStyle}>
          Login
        </button>

        <p style={{ textAlign: "center", fontSize: "14px", color: "#4b5563" }}>
          Don&apos;t have an account?{" "}
          <Link href="/signup" style={{ color: "#b91c1c", fontWeight: 700, textDecoration: "none" }}>
            Sign Up
          </Link>
        </p>
      </form>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: "12px",
  border: "1px solid #e5e7eb",
  fontSize: "15px",
  outline: "none",
  background: "#fff",
  color: "#111827",
};

const buttonStyle: React.CSSProperties = {
  marginTop: "8px",
  padding: "14px 16px",
  borderRadius: "12px",
  border: "none",
  background: "linear-gradient(90deg, #8b1118, #d62839)",
  color: "#fff",
  fontSize: "16px",
  fontWeight: 700,
  cursor: "pointer",
};
