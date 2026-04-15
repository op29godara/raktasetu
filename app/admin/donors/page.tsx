"use client";

import React, { useEffect, useState } from "react";
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

type DonorType = {
  id: string;
  name: string;
  phone: string;
  bloodGroup: string;
  city: string;
  age: string;
  lastDonation: string;
  available: string;
  createdAt?: any;
};

export default function AdminDonorsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [adminName, setAdminName] = useState("");
  const [donors, setDonors] = useState<DonorType[]>([]);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    bloodGroup: "",
    city: "",
    age: "",
    lastDonation: "",
    available: "Yes",
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/login");
        setLoading(false);
        return;
      }

      try {
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists() || userSnap.data().role !== "admin") {
          await signOut(auth);
          router.push("/login");
          return;
        }

        setAdminName(userSnap.data().name || "Admin");
        await fetchDonors();
      } catch (error) {
        console.error("Admin auth error:", error);
        await signOut(auth);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const fetchDonors = async () => {
    try {
      const donorsRef = collection(db, "donors");
      const q = query(donorsRef, orderBy("createdAt", "desc"));
      const snap = await getDocs(q);

      const donorList: DonorType[] = snap.docs.map((item) => ({
        id: item.id,
        ...(item.data() as Omit<DonorType, "id">),
      }));

      setDonors(donorList);
    } catch (error) {
      console.error("Fetch donors error:", error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddDonor = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !form.name ||
      !form.phone ||
      !form.bloodGroup ||
      !form.city ||
      !form.age
    ) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      setSaving(true);

      await addDoc(collection(db, "donors"), {
        ...form,
        createdAt: serverTimestamp(),
      });

      setForm({
        name: "",
        phone: "",
        bloodGroup: "",
        city: "",
        age: "",
        lastDonation: "",
        available: "Yes",
      });

      await fetchDonors();
      alert("Donor added successfully.");
    } catch (error) {
      console.error("Add donor error:", error);
      alert("Failed to add donor.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={loadingWrap}>
        <div style={loadingCard}>
          <div style={loader}></div>
          <p style={loadingText}>Loading premium donors panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={pageWrap}>
      <div style={glowOne}></div>
      <div style={glowTwo}></div>

      <section style={topBar}>
        <div>
          <p style={topTag}>DONOR MANAGEMENT</p>
          <h1 style={topTitle}>Welcome, {adminName}</h1>
          <p style={topText}>
            Add new donors, monitor the donor base, and keep the blood network
            organized from this premium control panel.
          </p>
        </div>

        <div style={topActions}>
          <button style={secondaryBtn} onClick={() => router.push("/admin")}>
            Back to Dashboard
          </button>
          <button
            style={primaryBtn}
            onClick={async () => {
              await signOut(auth);
              router.push("/login");
            }}
          >
            Logout
          </button>
        </div>
      </section>

      <section style={statsRow}>
        <div style={statCard}>
          <p style={statLabel}>Total Donors</p>
          <h3 style={statValue}>{donors.length}</h3>
          <span style={statSub}>Live donor records</span>
        </div>

        <div style={statCard}>
          <p style={statLabel}>Available Donors</p>
          <h3 style={statValue}>
            {donors.filter((d) => d.available === "Yes").length}
          </h3>
          <span style={statSub}>Ready for contact</span>
        </div>

        <div style={statCard}>
          <p style={statLabel}>Cities Covered</p>
          <h3 style={statValue}>
            {new Set(donors.map((d) => d.city).filter(Boolean)).size}
          </h3>
          <span style={statSub}>Area network spread</span>
        </div>

        <div style={statCard}>
          <p style={statLabel}>Rare Groups</p>
          <h3 style={statValue}>
            {
              donors.filter((d) =>
                ["AB-", "O-", "B-"].includes((d.bloodGroup || "").toUpperCase())
              ).length
            }
          </h3>
          <span style={statSub}>Priority donor pool</span>
        </div>
      </section>

      <section style={mainGrid}>
        <div style={formCard}>
          <div style={cardHead}>
            <p style={cardTag}>ADD DONOR</p>
            <h2 style={cardTitle}>Create New Donor Record</h2>
          </div>

          <form onSubmit={handleAddDonor} style={formGrid}>
            <input
              style={input}
              type="text"
              name="name"
              placeholder="Full name *"
              value={form.name}
              onChange={handleChange}
            />

            <input
              style={input}
              type="text"
              name="phone"
              placeholder="Phone number *"
              value={form.phone}
              onChange={handleChange}
            />

            <select
              style={input}
              name="bloodGroup"
              value={form.bloodGroup}
              onChange={handleChange}
            >
              <option value="">Select blood group *</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>

            <input
              style={input}
              type="text"
              name="city"
              placeholder="City *"
              value={form.city}
              onChange={handleChange}
            />

            <input
              style={input}
              type="number"
              name="age"
              placeholder="Age *"
              value={form.age}
              onChange={handleChange}
            />

            <input
              style={input}
              type="text"
              name="lastDonation"
              placeholder="Last donation date"
              value={form.lastDonation}
              onChange={handleChange}
            />

            <select
              style={input}
              name="available"
              value={form.available}
              onChange={handleChange}
            >
              <option value="Yes">Available</option>
              <option value="No">Not Available</option>
            </select>

            <button type="submit" style={submitBtn} disabled={saving}>
              {saving ? "Saving donor..." : "Add Donor"}
            </button>
          </form>
        </div>

        <div style={sidePanel}>
          <div style={infoCard}>
            <p style={cardTag}>PRO TIP</p>
            <h3 style={sideTitle}>Build a trusted donor network</h3>
            <p style={sideText}>
              Keep donor data accurate, blood group verified, and city details
              updated so urgent requests can be handled faster.
            </p>
          </div>

          <div style={infoCardDark}>
            <p style={darkTag}>NEXT FEATURES</p>
            <div style={featureList}>
              <div style={featureItem}>Upload donor profile photo</div>
              <div style={featureItem}>Edit and delete donors</div>
              <div style={featureItem}>Search by blood group</div>
              <div style={featureItem}>Filter by city and availability</div>
            </div>
          </div>
        </div>
      </section>

      <section style={listCard}>
        <div style={cardHead}>
          <p style={cardTag}>DONOR DIRECTORY</p>
          <h2 style={cardTitle}>Registered Donors</h2>
        </div>

        {donors.length === 0 ? (
          <div style={emptyState}>
            <h3 style={emptyTitle}>No donors added yet</h3>
            <p style={emptyText}>
              Start by adding your first donor using the form above.
            </p>
          </div>
        ) : (
          <div style={donorGrid}>
            {donors.map((donor) => (
              <div key={donor.id} style={donorCard}>
                <div style={donorTop}>
                  <div>
                    <h3 style={donorName}>{donor.name}</h3>
                    <p style={donorCity}>{donor.city}</p>
                  </div>
                  <span style={bloodBadge}>{donor.bloodGroup}</span>
                </div>

                <div style={donorMeta}>
                  <p style={metaText}>Phone: {donor.phone}</p>
                  <p style={metaText}>Age: {donor.age}</p>
                  <p style={metaText}>
                    Last Donation: {donor.lastDonation || "Not added"}
                  </p>
                  <p style={metaText}>Available: {donor.available}</p>
                </div>
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
  right: "-120px",
  width: "320px",
  height: "320px",
  borderRadius: "50%",
  background: "rgba(239, 68, 68, 0.18)",
  filter: "blur(90px)",
  pointerEvents: "none",
};

const glowTwo: React.CSSProperties = {
  position: "absolute",
  left: "-100px",
  top: "300px",
  width: "280px",
  height: "280px",
  borderRadius: "50%",
  background: "rgba(190, 24, 93, 0.12)",
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
  background: "#ffffff",
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

const topBar: React.CSSProperties = {
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

const topTag: React.CSSProperties = {
  margin: 0,
  color: "rgba(255,255,255,0.75)",
  fontSize: "12px",
  fontWeight: 800,
  letterSpacing: "1px",
};

const topTitle: React.CSSProperties = {
  margin: "10px 0",
  color: "#fff",
  fontSize: "36px",
  lineHeight: 1.1,
  fontWeight: 800,
};

const topText: React.CSSProperties = {
  margin: 0,
  color: "rgba(255,255,255,0.88)",
  maxWidth: "700px",
  fontSize: "15px",
  lineHeight: 1.8,
};

const topActions: React.CSSProperties = {
  display: "flex",
  gap: "12px",
  alignItems: "flex-start",
  flexWrap: "wrap",
};

const primaryBtn: React.CSSProperties = {
  border: "none",
  borderRadius: "16px",
  padding: "14px 18px",
  background: "#fff",
  color: "#991b1b",
  fontWeight: 800,
  cursor: "pointer",
};

const secondaryBtn: React.CSSProperties = {
  border: "1px solid rgba(255,255,255,0.18)",
  borderRadius: "16px",
  padding: "14px 18px",
  background: "rgba(255,255,255,0.12)",
  color: "#fff",
  fontWeight: 700,
  cursor: "pointer",
};

const statsRow: React.CSSProperties = {
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
  gridTemplateColumns: "1.6fr 0.9fr",
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

const sidePanel: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "22px",
};

const infoCard: React.CSSProperties = {
  background: "rgba(255,255,255,0.9)",
  borderRadius: "26px",
  padding: "22px",
  border: "1px solid rgba(220, 38, 38, 0.10)",
  boxShadow: "0 18px 40px rgba(127, 29, 29, 0.08)",
};

const infoCardDark: React.CSSProperties = {
  background: "linear-gradient(135deg, #7f1d1d 0%, #b91c1c 55%, #ef4444 100%)",
  borderRadius: "26px",
  padding: "22px",
  color: "#fff",
  boxShadow: "0 20px 50px rgba(127, 29, 29, 0.16)",
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

const darkTag: React.CSSProperties = {
  margin: 0,
  color: "rgba(255,255,255,0.76)",
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

const featureList: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  marginTop: "14px",
};

const featureItem: React.CSSProperties = {
  background: "rgba(255,255,255,0.12)",
  padding: "14px 16px",
  borderRadius: "16px",
  fontSize: "14px",
  border: "1px solid rgba(255,255,255,0.10)",
};

const formGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
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

const submitBtn: React.CSSProperties = {
  border: "none",
  borderRadius: "16px",
  padding: "15px 18px",
  background: "linear-gradient(135deg, #991b1b 0%, #dc2626 100%)",
  color: "#fff",
  fontWeight: 800,
  cursor: "pointer",
  minHeight: "52px",
};

const listCard: React.CSSProperties = {
  position: "relative",
  zIndex: 1,
  marginTop: "24px",
  background: "rgba(255,255,255,0.9)",
  borderRadius: "28px",
  padding: "24px",
  border: "1px solid rgba(220, 38, 38, 0.10)",
  boxShadow: "0 18px 40px rgba(127, 29, 29, 0.08)",
};

const donorGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: "18px",
};

const donorCard: React.CSSProperties = {
  background: "linear-gradient(180deg, #ffffff 0%, #fff7f8 100%)",
  border: "1px solid rgba(220, 38, 38, 0.08)",
  borderRadius: "22px",
  padding: "18px",
};

const donorTop: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: "12px",
  marginBottom: "14px",
};

const donorName: React.CSSProperties = {
  margin: 0,
  color: "#111827",
  fontSize: "18px",
  fontWeight: 800,
};

const donorCity: React.CSSProperties = {
  margin: "6px 0 0",
  color: "#6b7280",
  fontSize: "14px",
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

const donorMeta: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
};

const metaText: React.CSSProperties = {
  margin: 0,
  color: "#374151",
  fontSize: "14px",
  lineHeight: 1.6,
};

const emptyState: React.CSSProperties = {
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
