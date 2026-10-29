import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import Navbar from "../components/Navbar";

const complaintsTranslations = {
  English: {
    title: "📂 My Grievances",
    subtitle: "Review and track all grievances registered under your citizen account.",
    searchPl: "Search by Title, ID, or Department...",
    statusLabel: "Status:",
    allGrievances: "All Grievances",
    pending: "Pending",
    active: "Active (Assigned / Processing)",
    resolved: "Resolved",
    loading: "Loading grievances...",
    noGrievances: "No grievances found",
    noGrievancesDesc: "You haven't submitted any complaints matching the criteria.",
    draftBtn: "✨ Draft with AI Assistant",
    trackBtn: "Track Status"
  },
  Tamil: {
    title: "📂 எனது புகார்கள்",
    subtitle: "உங்கள் குடிமகன் கணக்கின் கீழ் பதிவு செய்யப்பட்ட அனைத்து குறைகளையும் மதிப்பாய்வு செய்து கண்காணிக்கவும்.",
    searchPl: "தலைப்பு, ஐடி அல்லது துறை மூலம் தேடுங்கள்...",
    statusLabel: "நிலை:",
    allGrievances: "அனைத்து புகார்கள்",
    pending: "நிலுவையில் உள்ளது",
    active: "செயல்பாட்டில் உள்ளது (ஒதுக்கப்பட்டது / செயலாக்கம்)",
    resolved: "தீர்க்கப்பட்டது",
    loading: "குறைகளை ஏற்றுகிறது...",
    noGrievances: "குறைகள் எதுவும் காணப்படவில்லை",
    noGrievancesDesc: "வழங்கப்பட்ட நிபந்தனைகளுடன் பொருந்தக்கூடிய புகார்கள் எதுவும் உங்களிடம் இல்லை.",
    draftBtn: "✨ AI உதவியாளருடன் வரைவு செய்யவும்",
    trackBtn: "நிலையைத் தேடு"
  },
  Hindi: {
    title: "📂 मेरी शिकायतें",
    subtitle: "अपने नागरिक खाते के तहत दर्ज सभी शिकायतों की समीक्षा और ट्रैक करें।",
    searchPl: "शीर्षक, आईडी या विभाग द्वारा खोजें...",
    statusLabel: "स्थिति:",
    allGrievances: "सभी शिकायतें",
    pending: "लंबित",
    active: "सक्रिय (आवंटित / प्रक्रियाधीन)",
    resolved: "समाधान",
    loading: "शिकायतें लोड हो रही हैं...",
    noGrievances: "कोई शिकायत नहीं मिली",
    noGrievancesDesc: "आपके पास मानदंडों से मेल खाने वाली कोई शिकायत नहीं है।",
    draftBtn: "✨ AI सहायक के साथ मसौदा तैयार करें",
    trackBtn: "ट्रैक स्थिति"
  }
};

export default function MyComplaints() {
  const navigate = useNavigate();
  const currentLang = localStorage.getItem("preferredLang") || "English";
  const mt = complaintsTranslations[currentLang] || complaintsTranslations["English"];
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const loadComplaints = async () => {
    try {
      setLoading(true);
      const res = await API.get("/complaint/my");
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  const getStatusClass = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "pending") return "status-badge pending";
    if (s === "assigned") return "status-badge assigned";
    if (s === "processing") return "status-badge processing";
    if (s === "completed" || s === "solved") return "status-badge completed";
    return "status-badge pending";
  };

  const getPriorityStyle = (priority) => {
    const p = (priority || "").toLowerCase();
    if (p === "high") return { background: "rgba(239, 68, 68, 0.15)", color: "#fca5a5", border: "1px solid rgba(239, 68, 68, 0.3)" };
    if (p === "low") return { background: "rgba(59, 130, 246, 0.15)", color: "#93c5fd", border: "1px solid rgba(59, 130, 246, 0.3)" };
    return { background: "rgba(245, 158, 11, 0.15)", color: "#fde047", border: "1px solid rgba(245, 158, 11, 0.3)" };
  };

  const filteredData = data.filter((item) => {
    const matchesSearch =
      (item.title || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.complaintId || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.department || "").toLowerCase().includes(search.toLowerCase());
    
    const status = (item.status || "").toLowerCase();
    if (statusFilter === "all") return matchesSearch;
    if (statusFilter === "pending") return matchesSearch && status === "pending";
    if (statusFilter === "active") return matchesSearch && (status === "assigned" || status === "processing");
    if (statusFilter === "resolved") return matchesSearch && (status === "completed" || status === "solved");
    return matchesSearch;
  });

  return (
    <div>
      <Navbar />
      <div className="container">
        <div style={styles.header}>
          <h2>{mt.title}</h2>
          <p style={{ margin: 0, color: "var(--text-secondary)" }}>
            {mt.subtitle}
          </p>
        </div>

        {/* Filter Toolbar */}
        <div style={styles.toolbar}>
          <div style={{ flex: 1, minWidth: "250px" }}>
            <input
              type="text"
              placeholder={mt.searchPl}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.searchBar}
            />
          </div>
          <div style={styles.filterGroup}>
            <label style={{ fontSize: "14px", color: "var(--text-secondary)", fontWeight: "600" }}>{mt.statusLabel}</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="all">{mt.allGrievances}</option>
              <option value="pending">{currentLang === "Tamil" ? "நிலுவையில் உள்ளவை" : currentLang === "Hindi" ? "लंबित" : "Pending"}</option>
              <option value="active">{currentLang === "Tamil" ? "செயல்பாட்டில் உள்ளவை" : currentLang === "Hindi" ? "सक्रिय" : "Active"}</option>
              <option value="resolved">{currentLang === "Tamil" ? "தீர்க்கப்பட்டவை" : currentLang === "Hindi" ? "समाधान" : "Resolved"}</option>
            </select>
          </div>
        </div>

        {/* Complaints Table */}
        {loading ? (
          <div style={styles.loadingState}>{mt.loading}</div>
        ) : filteredData.length === 0 ? (
          <div style={styles.emptyState}>
            <h4>{mt.noGrievances}</h4>
            <p>{mt.noGrievancesDesc}</p>
            <button onClick={() => navigate("/ai")} style={{ marginTop: "15px" }}>
              {mt.draftBtn}
            </button>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th>{currentLang === "Tamil" ? "ஐடி" : currentLang === "Hindi" ? "आईडी" : "ID"}</th>
                  <th>{currentLang === "Tamil" ? "தலைப்பு" : currentLang === "Hindi" ? "शीर्षक" : "Title"}</th>
                  <th>{currentLang === "Tamil" ? "துறை" : currentLang === "Hindi" ? "विभाग" : "Department"}</th>
                  <th>{currentLang === "Tamil" ? "தாக்கல் செய்யப்பட்ட தேதி" : currentLang === "Hindi" ? "दर्ज करने की तिथि" : "Date Filed"}</th>
                  <th>{currentLang === "Tamil" ? "முன்னுரிமை" : currentLang === "Hindi" ? "प्राथमिकता" : "Priority"}</th>
                  <th>{currentLang === "Tamil" ? "ஒதுக்கப்பட்ட அதிகாரி" : currentLang === "Hindi" ? "आवंटित अधिकारी" : "Officer Assigned"}</th>
                  <th>{currentLang === "Tamil" ? "நிலை" : currentLang === "Hindi" ? "நிலை" : "Status"}</th>
                  <th>{currentLang === "Tamil" ? "நடவடிக்கை" : currentLang === "Hindi" ? "कार्रवाई" : "Action"}</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item) => (
                  <tr key={item._id}>
                    <td style={{ fontWeight: "700", color: "var(--text-primary)" }}>{item.complaintId}</td>
                    <td>{item.title}</td>
                    <td>{item.department}</td>
                    <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span style={{
                        padding: "4px 10px",
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontWeight: "700",
                        textTransform: "uppercase",
                        ...getPriorityStyle(item.priority)
                      }}>
                        {item.priority === "High" ? (currentLang === "Tamil" ? "உயர்" : currentLang === "Hindi" ? "उच्च" : "High") : item.priority === "Low" ? (currentLang === "Tamil" ? "குறைந்த" : currentLang === "Hindi" ? "कम" : "Low") : (currentLang === "Tamil" ? "நடுத்தரம்" : currentLang === "Hindi" ? "मध्यम" : "Medium")}
                      </span>
                    </td>
                    <td>{item.officer || (currentLang === "Tamil" ? "ஒதுக்கப்படவில்லை" : currentLang === "Hindi" ? "आवंटित नहीं" : "Not Assigned")}</td>
                    <td>
                      <span className={getStatusClass(item.status)}>
                        {item.status === "Pending" ? (currentLang === "Tamil" ? "நிலுவையில்" : currentLang === "Hindi" ? "लंबित" : "Pending") : item.status === "Assigned" ? (currentLang === "Tamil" ? "ஒதுக்கப்பட்டது" : currentLang === "Hindi" ? "आवंटित" : "Assigned") : item.status === "Processing" ? (currentLang === "Tamil" ? "செயல்பாட்டில்" : currentLang === "Hindi" ? "प्रक्रिया में" : "Processing") : (currentLang === "Tamil" ? "தீர்க்கப்பட்டது" : currentLang === "Hindi" ? "हल" : item.status)}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => navigate(`/track?id=${item.complaintId}`)}
                        className="btn-secondary"
                        style={{ padding: "6px 12px", fontSize: "13px", margin: 0 }}
                      >
                        {mt.trackBtn}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  header: {
    borderBottom: "1px solid var(--border-light)",
    paddingBottom: "20px",
    marginBottom: "30px",
  },
  toolbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "20px",
    marginBottom: "20px",
  },
  searchBar: {
    margin: 0,
  },
  filterGroup: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  filterSelect: {
    width: "200px",
    margin: 0,
  },
  loadingState: {
    textAlign: "center",
    padding: "40px",
    color: "var(--text-secondary)",
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
    border: "1px dashed var(--border-light)",
    borderRadius: "12px",
    background: "rgba(255, 255, 255, 0.01)",
  }
};