"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

type CardType = {
  id: string;
  donorName: string;
  bloodGroup: string;
  message: string;
  createdAt?: any;
};

export default function ThankYouPage() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [adminName, setAdminName] = useState("");
  const [savedCards, setSavedCards] = useState<CardType[]>([]);

  const [form, setForm] = useState({
    donorName: "",
    bloodGroup: "O+",
    message:
      "Thank you for your generous blood donation. Your kindness can save lives and bring hope to families in need.",
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/login");
        setLoading(false);
        return;
      }

      try {
        const userSnap = await getDoc(doc(db, "users", currentUser.uid));

        if (!userSnap.exists() || userSnap.data().role !== "admin") {
          await signOut(auth);
          router.push("/login");
          return;
        }

        setAdminName(userSnap.data().name || "Admin");
        await fetchCards();
      } catch (error) {
        console.error("Auth error:", error);
        await signOut(auth);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    drawCard();
  }, [form]);

  const fetchCards = async () => {
    try {
      const ref = collection(db, "thankYouCards");
      const q = query(ref, orderBy("createdAt", "desc"));
      const snap = await getDocs(q);

      const cards: CardType[] = snap.docs.map((item) => ({
        id: item.id,
        ...(item.data() as Omit<CardType, "id">),
      }));

      setSavedCards(cards);
    } catch (error) {
      console.error("Fetch cards error:", error);
    }
  };

  const drawCard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 1400;
    canvas.height = 900;

    const gradient = ctx.createLinearGradient(0, 0, 1400, 900);
    gradient.addColorStop(0, "#4a0d12");
    gradient.addColorStop(0.5, "#a31525");
    gradient.addColorStop(1, "#ef4444");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.beginPath();
    ctx.arc(1180, 140, 160, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(220, 760, 220, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(255,255,255,0.12)";
    ctx.fillRect(90, 90, 1220, 720);

    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.lineWidth = 3;
    ctx.strokeRect(90, 90, 1220, 720);

    ctx.fillStyle = "#fff";
    ctx.font = "700 34px Arial";
    ctx.fillText("RAKTASETU", 130, 155);

    ctx.fillStyle = "#ffe5e7";
    ctx.font = "600 24px Arial";
    ctx.fillText("Certificate of Gratitude", 130, 210);

    ctx.fillStyle = "#fff";
    ctx.font = "800 74px Arial";
    ctx.fillText("Thank You", 130, 330);

    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.font = "500 32px Arial";
    ctx.fillText("Presented to", 130, 400);

    ctx.fillStyle = "#fff";
    ctx.font = "800 60px Arial";
    ctx.fillText(form.donorName || "Donor Name", 130, 490);

    ctx.fillStyle = "#ffe5e7";
    ctx.font = "600 28px Arial";
    ctx.fillText(`Blood Group: ${form.bloodGroup}`, 130, 550);

    ctx.fillStyle = "rgba(255,255,255,0.90)";
    ctx.font = "500 28px Arial";

    const text = form.message || "";
    wrapText(ctx, text, 130, 625, 1040, 42);

    ctx.fillStyle = "#fff";
    ctx.font = "700 26px Arial";
    ctx.fillText(`Issued by Admin: ${adminName || "Admin"}`, 130, 760);

    ctx.fillStyle = "#ffe5e7";
    ctx.font = "500 24px Arial";
    ctx.fillText("Your donation can save lives.", 930, 760);

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(1160, 330, 88, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#b91c1c";
    ctx.font = "800 70px Arial";
    ctx.fillText("❤", 1126, 354);
  };

  const wrapText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number
  ) => {
    const words = text.split(" ");
    let line = "";
    let lineY = y;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " ";
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;

      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, lineY);
        line = words[n] + " ";
        lineY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, lineY);
  };

  const handleSave = async () => {
    if (!form.donorName || !form.bloodGroup || !form.message) {
      alert("Please fill donor name, blood group and message.");
      return;
    }

    try {
      setSaving(true);

      await addDoc(collection(db, "thankYouCards"), {
        donorName: form.donorName,
        bloodGroup: form.bloodGroup,
        message: form.message,
        createdAt: serverTimestamp(),
      });

      await fetchCards();
      alert("Thank you card saved successfully.");
    } catch (error) {
      console.error("Save card error:", error);
      alert("Failed to save card.");
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `${form.donorName || "thank-you-card"}.png`;
    a.click();
  };

  if (loading) {
    return (
      <div style={loadingWrap}>
        <div style={loadingCard}>
          <div style={loader}></div>
          <p style={loadingText}>Loading thank-you studio...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={pageWrap}>
      <div style={glowOne}></div>
      <div style={glowTwo}></div>

      <section style={hero}>
        <div>
          <p style={heroTag}>APPRECIATION STUDIO</p>
          <h1 style={heroTitle}>Thank You Card Generator</h1>
          <p style={heroText}>
            Welcome, {adminName}. Create beautiful appreciation cards for blood
            donors and download premium certificate-style images instantly.
          </p>
        </div>

        <div style={heroBtns}>
          <button style={ghostBtn} onClick={() => router.push("/admin")}>
            Back to Dashboard
          </button>
          <button
            style={solidBtn}
            onClick={async () => {
              await signOut(auth);
              router.push("/login");
            }}
          >
            Logout
          </button>
        </div>
      </section>

      <section style={topStats}>
        <div style={statCard}>
          <p style={statLabel}>Saved Cards</p>
          <h3 style={statValue}>{savedCards.length}</h3>
          <span style={statSub}>Appreciation records</span>
        </div>

        <div style={statCard}>
          <p style={statLabel}>Current Theme</p>
          <h3 style={statValue}>Luxury</h3>
          <span style={statSub}>Red premium certificate</span>
        </div>

        <div style={statCard}>
          <p style={statLabel}>Export Format</p>
          <h3 style={statValue}>PNG</h3>
          <span style={statSub}>Ready to share</span>
        </div>
      </section>

      <section style={mainGrid}>
        <div style={formCard}>
          <div style={cardHead}>
            <p style={cardTag}>CARD DETAILS</p>
            <h2 style={cardTitle}>Create Appreciation Message</h2>
          </div>

          <div style={formGrid}>
            <input
              style={input}
              type="text"
              placeholder="Donor full name"
              value={form.donorName}
              onChange={(e) =>
                setForm({ ...form, donorName: e.target.value })
              }
            />

            <select
              style={input}
              value={form.bloodGroup}
              onChange={(e) =>
                setForm({ ...form, bloodGroup: e.target.value })
              }
            >
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>

            <textarea
              style={textarea}
              placeholder="Write appreciation message"
              value={form.message}
              onChange={(e) =>
                setForm({ ...form, message: e.target.value })
              }
            />

            <div style={btnRow}>
              <button style={saveBtn} onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Card"}
              </button>
              <button style={downloadBtn} onClick={handleDownload}>
                Download PNG
              </button>
            </div>
          </div>
        </div>

        <div style={sideCard}>
          <p style={cardTag}>GUIDE</p>
          <h3 style={sideTitle}>Best message style</h3>
          <p style={sideText}>
            Keep the appreciation note warm, personal, and short. Mention the
            donor&apos;s kindness, the impact of donation, and a hopeful closing line.
          </p>

          <div style={tipsList}>
            <div style={tipItem}>Use the donor&apos;s real name</div>
            <div style={tipItem}>Mention blood donation impact</div>
            <div style={tipItem}>Keep message heartfelt and clear</div>
            <div style={tipItem}>Download and share instantly</div>
          </div>
        </div>
      </section>

      <section style={previewCard}>
        <div style={cardHead}>
          <p style={cardTag}>LIVE PREVIEW</p>
          <h2 style={cardTitle}>Generated Thank You Card</h2>
        </div>

        <div style={canvasWrap}>
          <canvas
            ref={canvasRef}
            style={canvasStyle}
          />
        </div>
      </section>

      <section style={historyCard}>
        <div style={cardHead}>
          <p style={cardTag}>SAVED HISTORY</p>
          <h2 style={cardTitle}>Previously Created Cards</h2>
        </div>

        {savedCards.length === 0 ? (
          <div style={emptyBox}>
            <h3 style={emptyTitle}>No thank-you cards saved yet</h3>
            <p style={emptyText}>
              Create and save your first donor appreciation card.
            </p>
          </div>
        ) : (
          <div style={historyGrid}>
            {savedCards.map((card) => (
              <div key={card.id} style={historyItem}>
                <div style={historyTop}>
                  <h3 style={historyName}>{card.donorName}</h3>
                  <span style={bloodBadge}>{card.bloodGroup}</span>
                </div>
                <p style={historyMessage}>{card.message}</p>
              </div>
            ))}
          </div>
        )}
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

const glowOne: React.CSSProperties = {
  position: "absolute",
  top: "-100px",
  right: "-100px",
  width: "320px",
  height: "320px",
  borderRadius: "50%",
  background: "rgba(220, 38, 38, 0.18)",
  filter: "blur(90px)",
  pointerEvents: "none",
};

const glowTwo: React.CSSProperties = {
  position: "absolute",
  left: "-100px",
  top: "360px",
  width: "280px",
  height: "280px",
  borderRadius: "50%",
  background: "rgba(236, 72, 153, 0.12)",
  filter: "blur(90px)",
  pointerEvents: "none",
};

const loadingWrap: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "linear-gradient(180deg, #fff7f8 0%, #fff1f3 100%)",
};

const loadingCard: React.CSSProperties = {
  background: "#fff",
  borderRadius: "24px",
  padding: "30px",
  width: "100%",
  maxWidth: "360px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  boxShadow: "0 20px 60px rgba(127, 29, 29, 0.12)",
};

const loader: React.CSSProperties = {
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
};

const hero: React.CSSProperties = {
  position: "relative",
  zIndex: 1,
  background: "linear-gradient(135deg, #4a0d12 0%, #8b1118 45%, #d62839 100%)",
  borderRadius: "32px",
  padding: "30px",
  display: "flex",
  justifyContent: "space-between",
  gap: "20px",
  flexWrap: "wrap",
  boxShadow: "0 22px 60px rgba(127, 29, 29, 0.22)",
};

const heroTag: React.CSSProperties = {
  margin: 0,
  color: "rgba(255,255,255,0.75)",
  fontSize: "12px",
  fontWeight: 800,
  letterSpacing: "1px",
};

const heroTitle: React.CSSProperties = {
  margin: "10px 0",
  color: "#fff",
  fontSize: "36px",
  lineHeight: 1.1,
  fontWeight: 800,
};

const heroText: React.CSSProperties = {
  margin: 0,
  color: "rgba(255,255,255,0.88)",
  maxWidth: "700px",
  fontSize: "15px",
  lineHeight: 1.8,
};

const heroBtns: React.CSSProperties = {
  display: "flex",
  gap: "12px",
  alignItems: "flex-start",
  flexWrap: "wrap",
};

const ghostBtn: React.CSSProperties = {
  border: "1px solid rgba(255,255,255,0.18)",
  borderRadius: "16px",
  padding: "14px 18px",
  background: "rgba(255,255,255,0.12)",
  color: "#fff",
  fontWeight: 700,
  cursor: "pointer",
};

const solidBtn: React.CSSProperties = {
  border: "none",
  borderRadius: "16px",
  padding: "14px 18px",
  background: "#fff",
  color: "#991b1b",
  fontWeight: 800,
  cursor: "pointer",
};

const topStats: React.CSSProperties = {
  position: "relative",
  zIndex: 1,
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "18px",
  marginTop: "22px",
};

const statCard: React.CSSProperties = {
  background: "rgba(255,255,255,0.9)",
  border: "1px solid rgba(220, 38, 38, 0.10)",
  borderRadius: "24px",
  padding: "22px",
  boxShadow: "0 18px 40px rgba(127, 29, 29, 0.08)",
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

const statSub: React.CSSProperties = {
  color: "#b91c1c",
  fontSize: "13px",
  fontWeight: 700,
};

const mainGrid: React.CSSProperties = {
  position: "relative",
  zIndex: 1,
  display: "grid",
  gridTemplateColumns: "1.5fr 0.9fr",
  gap: "22px",
  marginTop: "24px",
};

const formCard: React.CSSProperties = {
  background: "rgba(255,255,255,0.9)",
  borderRadius: "28px",
  padding: "24px",
  border: "1px solid rgba(220, 38, 38, 0.10)",
  boxShadow: "0 18px 40px rgba(127, 29, 29, 0.08)",
};

const sideCard: React.CSSProperties = {
  background: "rgba(255,255,255,0.9)",
  borderRadius: "28px",
  padding: "24px",
  border: "1px solid rgba(220, 38, 38, 0.10)",
  boxShadow: "0 18px 40px rgba(127, 29, 29, 0.08)",
};

const cardHead: React.CSSProperties = {
  marginBottom: "18px",
};

const cardTag: React.CSSProperties = {
  margin: 0,
  color: "#b91c1c",
  fontSize: "12px",
  fontWeight: 800,
  letterSpacing: "1px",
};

const cardTitle: React.CSSProperties = {
  margin: "8px 0 0",
  fontSize: "26px",
  color: "#111827",
  fontWeight: 800,
};

const sideTitle: React.CSSProperties = {
  margin: "8px 0 10px",
  fontSize: "22px",
  color: "#111827",
  fontWeight: 800,
};

const sideText: React.CSSProperties = {
  margin: 0,
  color: "#6b7280",
  fontSize: "15px",
  lineHeight: 1.8,
};

const tipsList: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  marginTop: "18px",
};

const tipItem: React.CSSProperties = {
  background: "#fff7f8",
  padding: "14px 16px",
  borderRadius: "16px",
  border: "1px solid rgba(220, 38, 38, 0.08)",
  color: "#374151",
  fontSize: "14px",
};

const formGrid: React.CSSProperties = {
  display: "grid",
  gap: "16px",
};

const input: React.CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: "16px",
  border: "1px solid rgba(220, 38, 38, 0.12)",
  background: "#fffafa",
  outline: "none",
  fontSize: "14px",
};

const textarea: React.CSSProperties = {
  width: "100%",
  minHeight: "140px",
  padding: "14px 16px",
  borderRadius: "16px",
  border: "1px solid rgba(220, 38, 38, 0.12)",
  background: "#fffafa",
  outline: "none",
  fontSize: "14px",
  resize: "vertical",
};

const btnRow: React.CSSProperties = {
  display: "flex",
  gap: "12px",
  flexWrap: "wrap",
};

const saveBtn: React.CSSProperties = {
  border: "none",
  borderRadius: "16px",
  padding: "14px 18px",
  background: "linear-gradient(135deg, #991b1b 0%, #dc2626 100%)",
  color: "#fff",
  fontWeight: 800,
  cursor: "pointer",
};

const downloadBtn: React.CSSProperties = {
  border: "1px solid rgba(220, 38, 38, 0.12)",
  borderRadius: "16px",
  padding: "14px 18px",
  background: "#fff",
  color: "#991b1b",
  fontWeight: 800,
  cursor: "pointer",
};

const previewCard: React.CSSProperties = {
  position: "relative",
  zIndex: 1,
  marginTop: "24px",
  background: "rgba(255,255,255,0.9)",
  borderRadius: "28px",
  padding: "24px",
  border: "1px solid rgba(220, 38, 38, 0.10)",
  boxShadow: "0 18px 40px rgba(127, 29, 29, 0.08)",
};

const canvasWrap: React.CSSProperties = {
  width: "100%",
  overflowX: "auto",
  borderRadius: "22px",
  background: "#fff7f8",
  padding: "14px",
};

const canvasStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: "100%",
  borderRadius: "18px",
  display: "block",
  background: "#fff",
};

const historyCard: React.CSSProperties = {
  position: "relative",
  zIndex: 1,
  marginTop: "24px",
  background: "rgba(255,255,255,0.9)",
  borderRadius: "28px",
  padding: "24px",
  border: "1px solid rgba(220, 38, 38, 0.10)",
  boxShadow: "0 18px 40px rgba(127, 29, 29, 0.08)",
};

const historyGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: "18px",
};

const historyItem: React.CSSProperties = {
  background: "linear-gradient(180deg, #ffffff 0%, #fff7f8 100%)",
  borderRadius: "22px",
  padding: "18px",
  border: "1px solid rgba(220, 38, 38, 0.08)",
};

const historyTop: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "12px",
  marginBottom: "12px",
};

const historyName: React.CSSProperties = {
  margin: 0,
  color: "#111827",
  fontSize: "18px",
  fontWeight: 800,
};

const bloodBadge: React.CSSProperties = {
  display: "inline-block",
  background: "#fee2e2",
  color: "#b91c1c",
  padding: "8px 12px",
  borderRadius: "999px",
  fontSize: "13px",
  fontWeight: 800,
};

const historyMessage: React.CSSProperties = {
  margin: 0,
  color: "#4b5563",
  fontSize: "14px",
  lineHeight: 1.7,
};

const emptyBox: React.CSSProperties = {
  padding: "40px 20px",
  textAlign: "center",
  background: "#fff8f8",
  borderRadius: "22px",
};

const emptyTitle: React.CSSProperties = {
  margin: 0,
  color: "#111827",
  fontSize: "22px",
  fontWeight: 800,
};

const emptyText: React.CSSProperties = {
  margin: "10px 0 0",
  color: "#6b7280",
  fontSize: "15px",
};
