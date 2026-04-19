"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [adminName, setAdminName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/login");
        setLoading(false);
        return;
      }

      setUser(currentUser);

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
        console.error(error);
        await signOut(auth);
        router.push("/login");
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  if (loading) {
    return (
      <div style={loadingWrap}>
        <div style={loadingCard}>
          <div style={loaderCircle}></div>
          <p style={loadingText}>Preparing admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={pageWrap}>
      <div style={topGlowOne}></div>
      <div style={topGlowTwo}></div>

      <section style={heroSection}>
        <div style={heroContent}>
          <div style={heroLeft}>
            <div style={badge}>ADMIN CONTROL PANEL</div>
            <h1 style={heroTitle}>Welcome back, {adminName}</h1>
            <p style={heroText}>
              Manage donors, track blood requests, monitor engagement, and keep
              the platform running smoothly from one dashboard.
            </p>

            <div style={heroInfoRow}>
              <div style={miniInfoCard}>
                <span style={miniInfoLabel}>Logged in as</span>
                <span style={miniInfoValue}>{user?.email || "Admin User"}</span>
              </div>

              <div style={miniInfoCard}>
                <span style={miniInfoLabel}>Role</span>
                <span style={miniInfoValue}>Super Admin</span>
              </div>
            </div>
          </div>

          <div style={heroRight}>
            <button style={logoutButton} onClick={handleLogout}>
              Logout
            </button>

            <div style={heroStatBox}>
              <p style={heroStatTop}>Today's system overview</p>
              <h2 style={heroStatNumber}>24</h2>
              <p style={heroStatBottom}>Active interactions tracked</p>
            </div>
          </div>
        </div>
      </section>

      <section style={statsGrid}>
        <div style={statCard}>
          <div style={statIcon}>🩸</div>
          <p style={statLabel}>Total Donors</p>
          <h3 style={statValue}>128</h3>
          <span style={statGrowth}>+12 this month</span>
        </div>

        <div style={statCard}>
          <div style={statIcon}>🚑</div>
          <p style={statLabel}>Blood Requests</p>
          <h3 style={statValue}>36</h3>
          <span style={statGrowth}>8 urgent requests</span>
        </div>

        <div style={statCard}>
          <div style={statIcon}>✅</div>
          <p style={statLabel}>Successful Matches</p>
          <h3 style={statValue}>59</h3>
          <span style={statGrowth}>Improving response rate</span>
        </div>

        <div style={statCard}>
          <div style={statIcon}>❤️</div>
          <p style={statLabel}>Thank You Cards</p>
          <h3 style={statValue}>19</h3>
          <span style={statGrowth}>Ready to share</span>
        </div>
      </section>

      <section style={mainGrid}>
        <div style={leftColumn}>
          <div style={sectionCard}>
            <div style={sectionHeader}>
              <div>
                <p style={sectionTag}>QUICK ACTIONS</p>
                <h2 style={sectionTitle}>Management Shortcuts</h2>
              </div>
            </div>

            <div style={actionGrid}>
              <button style={actionCard} onClick={() => router.push("/admin/donors")}>
                <div style={actionEmoji}>🧑‍⚕️</div>
                <h3 style={actionTitle}>Manage Donors</h3>
                <p style={actionText}>Add, edit, remove and review donor records.</p>
              </button>

              <button style={actionCard} onClick={() => router.push("/admin/requests")}>
                <div style={actionEmoji}>📋</div>
                <h3 style={actionTitle}>Blood Requests</h3>
                <p style={actionText}>Monitor incoming requests and urgent demand.</p>
              </button>

              <button style={actionCard} onClick={() => router.push("/thank-you")}>
                <div style={actionEmoji}>🎁</div>
                <h3 style={actionTitle}>Thank You Cards</h3>
                <p style={actionText}>Open the thank you page and manage appreciation content.</p>
              </button>

              <button style={actionCard} onClick={() => router.push("/")}>
                <div style={actionEmoji}>🌍</div>
                <h3 style={actionTitle}>Open User App</h3>
                <p style={actionText}>Preview what public users see in the app.</p>
              </button>
            </div>
          </div>

          <div style={sectionCard}>
            <div style={sectionHeader}>
              <div>
                <p style={sectionTag}>RECENT ACTIVITY</p>
                <h2 style={sectionTitle}>Latest Platform Updates</h2>
              </div>
            </div>

            <div style={activityList}>
              <div style={activityItem}>
                <div style={activityDot}></div>
                <div>
                  <h4 style={activityTitle}>New donor registration completed</h4>
                  <p style={activityDesc}>A new O+ donor profile was successfully added to the system.</p>
                </div>
              </div>

              <div style={activityItem}>
                <div style={activityDot}></div>
                <div>
                  <h4 style={activityTitle}>Urgent blood request received</h4>
                  <p style={activityDesc}>One emergency request needs attention and quick response.</p>
                </div>
              </div>

              <div style={activityItem}>
                <div style={activityDot}></div>
                <div>
                  <h4 style={activityTitle}>Thank you page ready</h4>
                  <p style={activityDesc}>Appreciation content can now be reviewed from the dashboard.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={rightColumn}>
          <div style={sideCard}>
            <p style={sideTag}>ADMIN STATUS</p>
            <h3 style={sideTitle}>System Health</h3>

            <div style={healthList}>
              <div style={healthRow}>
                <span style={healthLabel}>Authentication</span>
                <span style={healthGood}>Active</span>
              </div>
              <div style={healthRow}>
                <span style={healthLabel}>Admin Access</span>
                <span style={healthGood}>Verified</span>
              </div>
              <div style={healthRow}>
                <span style={healthLabel}>Firestore Sync</span>
                <span style={healthGood}>Connected</span>
              </div>
              <div style={healthRow}>
                <span style={healthLabel}>Dashboard Theme</span>
                <span style={healthGood}>Ready</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

const pageWrap: React.CSSProperties = {
  minHeight: "100vh",
  background: "linear-gradient(180deg, #fff7f8 0%, #fff1f3 100%)",
  padding: "24px",
  position: "relative",
  overflow: "hidden",
};

const topGlowOne: React.CSSProperties = {
  position: "absolute",
  top: "-120px",
  right: "-100px",
  width: "320px",
  height: "320px",
  borderRadius: "50%",
  background: "rgba(220, 38, 38, 0.18)",
  filter: "blur(90px)",
  pointerEvents: "none",
};

const topGlowTwo: React.CSSProperties = {
  position: "absolute",
  top: "240px",
  left: "-120px",
  width: "280px",
  height: "280px",
  borderRadius: "50%",
  background: "rgba(239, 68, 68, 0.15)",
  filter: "blur(90px)",
  pointerEvents: "none",
};

const loadingWrap: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "linear-gradient(180deg, #fff7f8 0%, #fff1f3 100%)",
  padding: "24px",
};

const loadingCard: React.CSSProperties = {
  background: "rgba(255,255,255,0.9)",
  border: "1px solid rgba(220, 38, 38, 0.12)",
  borderRadius: "24px",
  padding: "30px",
  width: "100%",
  maxWidth: "360px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  boxShadow: "0 20px 60px rgba(127, 29, 29, 0.12)",
};

const loaderCircle: React.CSSProperties = {
  width: "52px",
  height: "52px",
  borderRadius: "50%",
  border: "5px solid #f3d1d5",
  borderTop: "5px solid #b91c1c",
  animation: "spin 1s linear infinite",
};

const loadingText: React.CSSProperties = {
  marginTop: "18px",
  color: "#7f1d1d",
  fontWeight: 700,
  fontSize: "16px",
};

const heroSection: React.CSSProperties = {
  position: "relative",
  zIndex: 1,
};

const heroContent: React.CSSProperties = {
  background: "linear-gradient(135deg, #4a0d12 0%, #8b1118 45%, #d62839 100%)",
  borderRadius: "32px",
  padding: "30px",
  display: "flex",
  justifyContent: "space-between",
  gap: "24px",
  flexWrap: "wrap",
  boxShadow: "0 22px 60px rgba(127, 29, 29, 0.22)",
  border: "1px solid rgba(255,255,255,0.12)",
};

const heroLeft: React.CSSProperties = {
  flex: 1,
  minWidth: "280px",
};

const heroRight: React.CSSProperties = {
  width: "260px",
  display: "flex",
  flexDirection: "column",
  gap: "16px",
  justifyContent: "space-between",
};

const badge: React.CSSProperties = {
  display: "inline-block",
  padding: "8px 14px",
  borderRadius: "999px",
  background: "rgba(255,255,255,0.16)",
  color: "#fff5f5",
  fontSize: "12px",
  fontWeight: 800,
  letterSpacing: "1px",
};

const heroTitle: React.CSSProperties = {
  margin: "18px 0 12px",
  color: "#fff",
  fontSize: "38px",
  lineHeight: 1.15,
  fontWeight: 800,
};

const heroText: React.CSSProperties = {
  margin: 0,
  color: "rgba(255,255,255,0.88)",
  fontSize: "16px",
  lineHeight: 1.8,
  maxWidth: "680px",
};

const heroInfoRow: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "14px",
  marginTop: "22px",
};

const miniInfoCard: React.CSSProperties = {
  background: "rgba(255,255,255,0.12)",
  borderRadius: "18px",
  padding: "16px",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(255,255,255,0.12)",
};

const miniInfoLabel: React.CSSProperties = {
  display: "block",
  color: "rgba(255,255,255,0.74)",
  fontSize: "12px",
  marginBottom: "8px",
};

const miniInfoValue: React.CSSProperties = {
  display: "block",
  color: "#fff",
  fontWeight: 700,
  fontSize: "14px",
  wordBreak: "break-word",
};

const logoutButton: React.CSSProperties = {
  border: "none",
  borderRadius: "16px",
  padding: "14px 18px",
  background: "rgba(255,255,255,0.15)",
  color: "#fff",
  fontWeight: 800,
  fontSize: "15px",
  cursor: "pointer",
  alignSelf: "flex-end",
};

const heroStatBox: React.CSSProperties = {
  background: "rgba(255,255,255,0.14)",
  borderRadius: "24px",
  padding: "22px",
  color: "#fff",
  border: "1px solid rgba(255,255,255,0.12)",
};

const heroStatTop: React.CSSProperties = {
  margin: 0,
  fontSize: "13px",
  color: "rgba(255,255,255,0.74)",
};

const heroStatNumber: React.CSSProperties = {
  margin: "12px 0 6px",
  fontSize: "52px",
  lineHeight: 1,
  fontWeight: 900,
};

const heroStatBottom: React.CSSProperties = {
  margin: 0,
  fontSize: "14px",
  color: "rgba(255,255,255,0.84)",
};

const statsGrid: React.CSSProperties = {
  position: "relative",
  zIndex: 1,
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "18px",
  marginTop: "22px",
};

const statCard: React.CSSProperties = {
  background: "rgba(255,255,255,0.88)",
  borderRadius: "24px",
  padding: "22px",
  border: "1px solid rgba(220, 38, 38, 0.10)",
  boxShadow: "0 18px 40px rgba(127, 29, 29, 0.08)",
};

const statIcon: React.CSSProperties = {
  fontSize: "28px",
  marginBottom: "14px",
};

const statLabel: React.CSSProperties = {
  margin: 0,
  color: "#6b7280",
  fontSize: "14px",
};

const statValue: React.CSSProperties = {
  margin: "10px 0 8px",
  color: "#111827",
  fontSize: "30px",
  fontWeight: 800,
};

const statGrowth: React.CSSProperties = {
  color: "#b91c1c",
  fontSize: "13px",
  fontWeight: 700,
};

const mainGrid: React.CSSProperties = {
  position: "relative",
  zIndex: 1,
  display: "grid",
  gridTemplateColumns: "2fr 1fr",
  gap: "22px",
  marginTop: "24px",
};

const leftColumn: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "22px",
};

const rightColumn: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "22px",
};

const sectionCard: React.CSSProperties = {
  background: "rgba(255,255,255,0.88)",
  borderRadius: "28px",
  padding: "24px",
  border: "1px solid rgba(220, 38, 38, 0.10)",
  boxShadow: "0 18px 40px rgba(127, 29, 29, 0.08)",
};

const sectionHeader: React.CSSProperties = {
  marginBottom: "18px",
};

const sectionTag: React.CSSProperties = {
  margin: 0,
  color: "#b91c1c",
  fontSize: "12px",
  fontWeight: 800,
  letterSpacing: "1px",
};

const sectionTitle: React.CSSProperties = {
  margin: "8px 0 0",
  fontSize: "26px",
  color: "#111827",
  fontWeight: 800,
};

const actionGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "16px",
};

const actionCard: React.CSSProperties = {
  textAlign: "left",
  background: "linear-gradient(180deg, #ffffff 0%, #fff6f7 100%)",
  border: "1px solid rgba(220, 38, 38, 0.10)",
  borderRadius: "22px",
  padding: "20px",
  cursor: "pointer",
  boxShadow: "0 10px 26px rgba(127, 29, 29, 0.05)",
};

const actionEmoji: React.CSSProperties = {
  fontSize: "28px",
  marginBottom: "14px",
};

const actionTitle: React.CSSProperties = {
  margin: "0 0 8px",
  fontSize: "18px",
  color: "#111827",
  fontWeight: 800,
};

const actionText: React.CSSProperties = {
  margin: 0,
  color: "#6b7280",
  fontSize: "14px",
  lineHeight: 1.7,
};

const activityList: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "16px",
};

const activityItem: React.CSSProperties = {
  display: "flex",
  gap: "14px",
  alignItems: "flex-start",
  padding: "16px",
  borderRadius: "18px",
  background: "#fff8f8",
  border: "1px solid rgba(220, 38, 38, 0.08)",
};

const activityDot: React.CSSProperties = {
  width: "12px",
  height: "12px",
  borderRadius: "50%",
  background: "linear-gradient(135deg, #b91c1c, #ef4444)",
  marginTop: "6px",
  flexShrink: 0,
};

const activityTitle: React.CSSProperties = {
  margin: "0 0 6px",
  fontSize: "16px",
  color: "#111827",
  fontWeight: 700,
};

const activityDesc: React.CSSProperties = {
  margin: 0,
  color: "#6b7280",
  fontSize: "14px",
  lineHeight: 1.6,
};

const sideCard: React.CSSProperties = {
  background: "rgba(255,255,255,0.88)",
  borderRadius: "26px",
  padding: "22px",
  border: "1px solid rgba(220, 38, 38, 0.10)",
  boxShadow: "0 18px 40px rgba(127, 29, 29, 0.08)",
};

const sideTag: React.CSSProperties = {
  margin: 0,
  color: "#b91c1c",
  fontSize: "12px",
  fontWeight: 800,
  letterSpacing: "1px",
};

const sideTitle: React.CSSProperties = {
  margin: "8px 0 20px",
  fontSize: "22px",
  color: "#111827",
  fontWeight: 800,
};

const healthList: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "14px",
};

const healthRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  paddingBottom: "12px",
  borderBottom: "1px solid rgba(220, 38, 38, 0.08)",
};

const healthLabel: React.CSSProperties = {
  color: "#4b5563",
  fontSize: "14px",
};

const healthGood: React.CSSProperties = {
  color: "#b91c1c",
  fontWeight: 800,
  fontSize: "14px",
};
