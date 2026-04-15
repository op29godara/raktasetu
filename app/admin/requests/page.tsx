"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

type RequestType = {
  id: string;
  patientName: string;
  bloodGroup: string;
  city: string;
  hospital: string;
  contact: string;
  units: string;
  urgency: string;
  status: string;
  note: string;
  createdAt?: any;
};

export default function AdminRequestsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [adminName, setAdminName] = useState("");
  const [requests, setRequests] = useState<RequestType[]>([]);

  const [form, setForm] = useState({
    patientName: "",
    bloodGroup: "",
    city: "",
    hospital: "",
    contact: "",
    units: "",
    urgency: "Urgent",
    status: "Pending",
    note: "",
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
        await fetchRequests();
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

  const fetchRequests = async () => {
    try {
      const requestsRef = collection(db, "requests");
      const q = query(requestsRef, orderBy("createdAt", "desc"));
      const snap = await getDocs(q);

      const requestList: RequestType[] = snap.docs.map((item) => ({
        id: item.id,
        ...(item.data() as Omit<RequestType, "id">),
      }));

      setRequests(requestList);
    } catch (error) {
      console.error("Fetch requests error:", error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !form.patientName ||
      !form.bloodGroup ||
      !form.city ||
      !form.hospital ||
      !form.contact
    ) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      setSaving(true);

      await addDoc(collection(db, "requests"), {
        ...form,
        createdAt: serverTimestamp(),
      });

      setForm({
        patientName: "",
        bloodGroup: "",
        city: "",
        hospital: "",
        contact: "",
        units: "",
        urgency: "Urgent",
        status: "Pending",
        note: "",
      });

      await fetchRequests();
      alert("Request added successfully.");
    } catch (error) {
      console.error("Add request error:", error);
      alert("Failed to add request.");
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, "requests", id), { status });
      await fetchRequests();
    } catch (error) {
      console.error("Update status error:", error);
      alert("Failed to update status.");
    }
  };

  const handleDelete = async (id: string) => {
    const ok = confirm("Are you sure you want to delete this request?");
    if (!ok) return;

    try {
      await deleteDoc(doc(db, "requests", id));
      await fetchRequests();
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete request.");
    }
  };

  if (loading) {
    return (
      <div style={loadingWrap}>
        <div style={loadingCard}>
          <div style={loader}></div>
          <p style={loadingText}>Loading premium requests panel...</p>
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
          <p style={heroTag}>REQUESTS MANAGEMENT</p>
          <h1 style={heroTitle}>Emergency Requests Control</h1>
          <p style={heroText}>
            Welcome, {adminName}. Manage patient blood requests, mark urgency,
            update progress, and keep lifesaving operations organized.
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

      <section style={statsGrid}>
        <div style={statCard}>
          <p style={statLabel}>Total Requests</p>
          <h3 style={statValue}>{requests.length}</h3>
          <span style={statSub}>All incoming cases</span>
        </div>

        <div style={statCard}>
          <p style={statLabel}>Pending</p>
          <h3 style={statValue}>
            {requests.filter((r) => r.status === "Pending").length}
          </h3>
          <span style={statSub}>Need action</span>
        </div>

        <div style={statCard}>
          <p style={statLabel}>Approved</p>
          <h3 style={statValue}>
            {requests.filter((r) => r.status === "Approved").length}
          </h3>
          <span style={statSub}>Ready to fulfill</span>
        </div>

        <div style={statCard}>
          <p style={statLabel}>Urgent Cases</p>
          <h3 style={statValue}>
            {requests.filter((r) => r.urgency === "Urgent").length}
          </h3>
          <span style={statSub}>Immediate attention</span>
        </div>
      </section>

      <section style={contentGrid}>
        <div style={formCard}>
          <div style={cardHead}>
            <p style={cardTag}>ADD REQUEST</p>
            <h2 style={cardTitle}>Create New Blood Request</h2>
          </div>

          <form onSubmit={handleAddRequest} style={formGrid}>
            <input
              style={input}
              type="text"
              name="patientName"
              placeholder="Patient name *"
              value={form.patientName}
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
              type="text"
              name="hospital"
              placeholder="Hospital name *"
              value={form.hospital}
              onChange={handleChange}
            />

            <input
              style={input}
              type="text"
              name="contact"
              placeholder="Contact number *"
              value={form.contact}
              onChange={handleChange}
            />

            <input
              style={input}
              type="text"
              name="units"
              placeholder="Units required"
              value={form.units}
              onChange={handleChange}
            />

            <select
              style={input}
              name="urgency"
              value={form.urgency}
              onChange={handleChange}
            >
              <option value="Urgent">Urgent</option>
              <option value="Normal">Normal</option>
            </select>

            <select
              style={input}
              name="status"
              value={form.status}
              onChange={handleChange}
            >
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Completed">Completed</option>
            </select>

            <textarea
              style={textarea}
              name="note"
              placeholder="Additional note"
              value={form.note}
              onChange={handleChange}
            />

            <button type="submit" style={submitBtn} disabled={saving}>
              {saving ? "Saving request..." : "Add Request"}
            </button>
          </form>
        </div>

        <div style={sideCol}>
          <div style={infoCard}>
            <p style={cardTag}>WORKFLOW</p>
            <h3 style={sideTitle}>Suggested process</h3>
            <p style={sideText}>
              Receive request, verify blood group, contact suitable donors, then
              mark the case approved or completed after successful fulfillment.
            </p>
          </div>

          <div style={darkCard}>
            <p style={darkTag}>PREMIUM UPGRADE</p>
            <div style={premiumList}>
              <div style={premiumItem}>Link donor match suggestions</div>
              <div style={premiumItem}>Add request print button</div>
              <div style={premiumItem}>WhatsApp quick contact action</div>
              <div style={premiumItem}>Status timeline tracking</div>
            </div>
          </div>
        </div>
      </section>

      <section style={listCard}>
        <div style={cardHead}>
          <p style={cardTag}>REQUEST DIRECTORY</p>
          <h2 style={cardTitle}>All Blood Requests</h2>
        </div>

        {requests.length === 0 ? (
          <div style={emptyBox}>
            <h3 style={emptyTitle}>No requests yet</h3>
            <p style={emptyText}>
              Start by adding the first blood request from the form above.
            </p>
          </div>
        ) : (
          <div style={requestGrid}>
            {requests.map((request) => (
              <div
                key={request.id}
                style={{
                  ...requestCard,
                  border:
                    request.urgency === "Urgent"
                      ? "1px solid rgba(220, 38, 38, 0.22)"
                      : "1px solid rgba(220, 38, 38, 0.08)",
                }}
              >
                <div style={requestTop}>
                  <div>
                    <h3 style={requestName}>{request.patientName}</h3>
                    <p style={requestHospital}>{request.hospital}</p>
                  </div>

                  <div style={badgeWrap}>
                    <span style={bloodBadge}>{request.bloodGroup}</span>
                    <span
                      style={
                        request.urgency === "Urgent" ? urgentBadge : normalBadge
                      }
                    >
                      {request.urgency}
                    </span>
                  </div>
                </div>

                <div style={metaWrap}>
                  <p style={metaText}>City: {request.city}</p>
                  <p style={metaText}>Contact: {request.contact}</p>
                  <p style={metaText}>Units: {request.units || "Not added"}</p>
                  <p style={metaText}>Status: {request.status}</p>
                  <p style={metaText}>Note: {request.note || "No note"}</p>
                </div>

                <div style={actionRow}>
                  <button
                    style={smallBtn}
                    onClick={() => updateStatus(request.id, "Pending")}
                  >
                    Pending
                  </button>
                  <button
                    style={smallBtn}
                    onClick={() => updateStatus(request.id, "Approved")}
                  >
                    Approve
                  </button>
                  <button
                    style={smallBtn}
                    onClick={() => updateStatus(request.id, "Completed")}
                  >
                    Complete
                  </button>
                  <button
                    style={deleteBtn}
                    onClick={() => handleDelete(request.id)}
                  >
                    Delete
                  </button>
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
  left: "-110px",
  top: "300px",
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

const statsGrid: React.CSSProperties = {
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

const contentGrid: React.CSSProperties = {
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

const sideCol: React.CSSProperties = {
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

const darkCard: React.CSSProperties = {
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

const premiumList: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  marginTop: "14px",
};

const premiumItem: React.CSSProperties = {
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

const textarea: React.CSSProperties = {
  width: "100%",
  minHeight: "120px",
  padding: "14px 16px",
  borderRadius: "16px",
  border: "1px solid rgba(220, 38, 38, 0.12)",
  background: "#fffafa",
  outline: "none",
  fontSize: "14px",
  resize: "vertical",
  gridColumn: "1 / -1",
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

const requestGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))",
  gap: "18px",
};

const requestCard: React.CSSProperties = {
  background: "linear-gradient(180deg, #ffffff 0%, #fff7f8 100%)",
  borderRadius: "22px",
  padding: "18px",
};

const requestTop: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "12px",
  marginBottom: "14px",
};

const requestName: React.CSSProperties = {
  margin: 0,
  color: "#111827",
  fontSize: "18px",
  fontWeight: 800,
};

const requestHospital: React.CSSProperties = {
  margin: "6px 0 0",
  color: "#6b7280",
  fontSize: "14px",
};

const badgeWrap: React.CSSProperties = {
  display: "flex",
  gap: "8px",
  flexWrap: "wrap",
  justifyContent: "flex-end",
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

const urgentBadge: React.CSSProperties = {
  display: "inline-block",
  background: "#b91c1c",
  color: "#fff",
  padding: "8px 12px",
  borderRadius: "999px",
  fontSize: "13px",
  fontWeight: 800,
};

const normalBadge: React.CSSProperties = {
  display: "inline-block",
  background: "#fef3c7",
  color: "#92400e",
  padding: "8px 12px",
  borderRadius: "999px",
  fontSize: "13px",
  fontWeight: 800,
};

const metaWrap: React.CSSProperties = {
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

const actionRow: React.CSSProperties = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
  marginTop: "16px",
};

const smallBtn: React.CSSProperties = {
  border: "none",
  borderRadius: "12px",
  padding: "10px 12px",
  background: "#fee2e2",
  color: "#991b1b",
  fontWeight: 700,
  cursor: "pointer",
  fontSize: "13px",
};

const deleteBtn: React.CSSProperties = {
  border: "none",
  borderRadius: "12px",
  padding: "10px 12px",
  background: "#111827",
  color: "#fff",
  fontWeight: 700,
  cursor: "pointer",
  fontSize: "13px",
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
