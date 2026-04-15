"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push("/login");
      } else {
        setUser(currentUser);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    alert("Logged out successfully");
    router.push("/login");
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "18px",
          background: "#fff7f7",
          color: "#991b1b",
          fontWeight: 700,
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8f5f5",
        paddingBottom: "90px",
      }}
    >
      <div
        style={{
          background: "linear-gradient(135deg, #6d0f16 0%, #9b111e 55%, #c81d25 100%)",
          padding: "24px 20px 32px",
          color: "#fff",
          borderBottomLeftRadius: "28px",
          borderBottomRightRadius: "28px",
          boxShadow: "0 10px 30px rgba(155,17,30,0.25)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ margin: 0, fontSize: "14px", opacity: 0.9 }}>Welcome</p>
            <h1 style={{ margin: "6px 0 0", fontSize: "26px", fontWeight: 800 }}>
              {user?.email || "Blood Donor"}
            </h1>
          </div>

          <button
            onClick={handleLogout}
            style={{
              border: "none",
              background: "rgba(255,255,255,0.18)",
              color: "#fff",
              padding: "10px 14px",
              borderRadius: "12px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>

        <div
          style={{
            marginTop: "22px",
            background: "rgba(255,255,255,0.12)",
            borderRadius: "18px",
            padding: "18px",
            backdropFilter: "blur(6px)",
          }}
        >
          <p style={{ margin: 0, fontSize: "13px", opacity: 0.9 }}>Your blood can save lives</p>
          <h2 style={{ margin: "8px 0 10px", fontSize: "24px", fontWeight: 800 }}>
            Donate Blood, Save Humanity
          </h2>
          <p style={{ margin: 0, fontSize: "14px", lineHeight: 1.6, opacity: 0.95 }}>
            Help patients quickly with trusted blood requests and donor connections.
          </p>
        </div>
      </div>

      <div style={{ padding: "20px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "14px",
            marginTop: "-18px",
          }}
        >
          <button
            onClick={() => router.push("/request-blood")}
            style={{
              background: "#ffffff",
              border: "1px solid #f1d6d9",
              borderRadius: "18px",
              padding: "20px 14px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
              cursor: "pointer",
            }}
          >
            <div style={{ fontSize: "26px" }}>🩸</div>
            <div style={{ marginTop: "10px", fontWeight: 800, color: "#8b1118" }}>Request Blood</div>
            <div style={{ marginTop: "6px", fontSize: "13px", color: "#6b7280" }}>
              Raise urgent request
            </div>
          </button>

          <button
            onClick={() => router.push("/donor-register")}
            style={{
              background: "#ffffff",
              border: "1px solid #f1d6d9",
              borderRadius: "18px",
              padding: "20px 14px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
              cursor: "pointer",
            }}
          >
            <div style={{ fontSize: "26px" }}>❤️</div>
            <div style={{ marginTop: "10px", fontWeight: 800, color: "#8b1118" }}>Become Donor</div>
            <div style={{ marginTop: "6px", fontSize: "13px", color: "#6b7280" }}>
              Complete donor profile
            </div>
          </button>
        </div>

        <div
          style={{
            marginTop: "22px",
            background: "#fff",
            borderRadius: "20px",
            padding: "18px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
            border: "1px solid #f2e4e7",
          }}
        >
          <p style={{ margin: 0, color: "#9b111e", fontSize: "13px", fontWeight: 700 }}>
            Emergency Request
          </p>
          <h3 style={{ margin: "8px 0 6px", fontSize: "18px", color: "#111827" }}>
            B+ Blood Needed Urgently
          </h3>
          <p style={{ margin: 0, fontSize: "14px", color: "#6b7280", lineHeight: 1.6 }}>
            Civil Hospital, Jaipur • 2 Units • Contact hospital team immediately if available.
          </p>

          <button
            style={{
              marginTop: "14px",
              width: "100%",
              padding: "14px",
              borderRadius: "12px",
              border: "none",
              background: "linear-gradient(90deg, #8b1118, #d62839)",
              color: "#fff",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Respond Now
          </button>
        </div>

        <div style={{ marginTop: "24px" }}>
          <h3 style={{ marginBottom: "12px", color: "#111827" }}>Recent Activity</h3>

          <div style={activityCardStyle}>
            <div>
              <div style={{ fontWeight: 700, color: "#111827" }}>Request Raised</div>
              <div style={{ fontSize: "13px", color: "#6b7280", marginTop: "4px" }}>
                Patient request created successfully
              </div>
            </div>
            <span style={statusStyle}>Live</span>
          </div>

          <div style={activityCardStyle}>
            <div>
              <div style={{ fontWeight: 700, color: "#111827" }}>Donor Profile</div>
              <div style={{ fontSize: "13px", color: "#6b7280", marginTop: "4px" }}>
                Complete your profile to receive matches
              </div>
            </div>
            <span style={{ ...statusStyle, background: "#fff3cd", color: "#946200" }}>Pending</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const activityCardStyle: React.CSSProperties = {
  background: "#fff",
  borderRadius: "16px",
  padding: "16px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
  border: "1px solid #f2e4e7",
  marginBottom: "12px",
};

const statusStyle: React.CSSProperties = {
  background: "#dcfce7",
  color: "#166534",
  padding: "7px 10px",
  borderRadius: "999px",
  fontSize: "12px",
  fontWeight: 700,
};
