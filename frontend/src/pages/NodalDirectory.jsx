import { useEffect, useState } from "react";
import API from "../api/api";
import Navbar from "../components/Navbar";

const translations = {
  English: {
    title: "📞 Nodal Officers Directory",
    subtitle: "Contact details, locations, and SLA performance of municipal grievance officers.",
    searchPl: "Search department or head officer...",
    loading: "Loading departments directory...",
    fallbackText: "Load official directory details",
    slaLabel: "SLA Deadline",
    performance: "Performance Score",
    workingHours: "Working Hours",
    officerHead: "Nodal Head Officer",
    contactInfo: "Office Contact Details",
    noDepts: "No departments found matching the criteria."
  },
  Tamil: {
    title: "📞 நோடல் அதிகாரிகள் அடைவு",
    subtitle: "நகராட்சி குறை தீர்க்கும் அதிகாரிகளின் தொடர்பு விவரங்கள், இடங்கள் மற்றும் SLA செயல்திறன்.",
    searchPl: "துறை அல்லது தலைமை அதிகாரியைத் தேடுங்கள்...",
    loading: "துறைகளின் அடைவு ஏற்றப்படுகிறது...",
    fallbackText: "அதிகாரப்பூர்வ அடைவு விவரங்களை ஏற்றவும்",
    slaLabel: "SLA காலக்கெடு",
    performance: "செயல்திறன் மதிப்பெண்",
    workingHours: "வேலை நேரம்",
    officerHead: "நோடல் தலைமை அதிகாரி",
    contactInfo: "அலுவலக தொடர்பு விவரங்கள்",
    noDepts: "வழங்கப்பட்ட நிபந்தனைகளுடன் பொருந்தக்கூடிய துறைகள் எதுவும் இல்லை."
  },
  Hindi: {
    title: "📞 नोडल अधिकारियों की निर्देशिका",
    subtitle: "नगर पालिका शिकायत अधिकारियों के संपर्क विवरण, स्थान और SLA प्रदर्शन।",
    searchPl: "विभाग या मुख्य अधिकारी खोजें...",
    loading: "विभाग निर्देशिका लोड हो रही है...",
    fallbackText: "आधिकारिक निर्देशिका विवरण लोड करें",
    slaLabel: "SLA समय सीमा",
    performance: "प्रदर्शन स्कोर",
    workingHours: "कार्य समय",
    officerHead: "नोडल मुख्य अधिकारी",
    contactInfo: "कार्यालय संपर्क विवरण",
    noDepts: "मानदंडों से मेल खाने वाला कोई विभाग नहीं मिला।"
  }
};

const defaultDepartments = [
  { departmentId: "DEPT-WAT-01", departmentName: "Water Supply Department", headOfficer: "Assistant Engineer", contact: "Phone: +91 11 2345 6701 | Email: watersupply@smartcity.gov.in | Location: Ground Floor, Civic Center", employees: 26, workingHours: "9 AM - 5 PM", sla: "24 Hours", performance: 4.5 },
  { departmentId: "DEPT-ELE-02", departmentName: "Electricity Department", headOfficer: "Electrical Engineer", contact: "Phone: +91 11 2345 6702 | Email: electricity@smartcity.gov.in | Location: 1st Floor, Energy Bhawan", employees: 39, workingHours: "Office: 9 AM - 5 PM | Emergency: 24 Hours", sla: "12 Hours", performance: 4.2 },
  { departmentId: "DEPT-ROD-03", departmentName: "Road and Transport Department", headOfficer: "Civil Engineer", contact: "Phone: +91 11 2345 6703 | Email: roadtransport@smartcity.gov.in | Location: 3rd Floor, Transport Annex", employees: 38, workingHours: "8 AM - 5 PM", sla: "7 Days", performance: 4.0 },
  { departmentId: "DEPT-SAN-04", departmentName: "Sanitation Department", headOfficer: "Sanitary Officer", contact: "Phone: +91 11 2345 6704 | Email: sanitation@smartcity.gov.in | Location: Basement, Municipal Complex", employees: 60, workingHours: "Morning Shift: 6 AM - 2 PM | Evening Shift: 2 PM - 10 PM", sla: "24 Hours", performance: 4.6 },
  { departmentId: "DEPT-HEA-05", departmentName: "Health Department", headOfficer: "Medical Officer", contact: "Phone: +91 11 2345 6705 | Email: health@smartcity.gov.in | Location: Smart City General Hospital", employees: 45, workingHours: "24/7 Operations", sla: "12 Hours", performance: 4.8 },
  { departmentId: "DEPT-REV-06", departmentName: "Revenue Department", headOfficer: "Revenue Officer", contact: "Phone: +91 11 2345 6706 | Email: revenue@smartcity.gov.in | Location: 2nd Floor, Treasury Office", employees: 20, workingHours: "10 AM - 5 PM", sla: "48 Hours", performance: 4.4 }
];

export default function NodalDirectory() {
  const currentLang = localStorage.getItem("preferredLang") || "English";
  const t = translations[currentLang] || translations["English"];
  
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoading(true);
        const res = await API.get("/admin/departments");
        if (res.data && res.data.length > 0) {
          setDepartments(res.data);
        } else {
          setDepartments(defaultDepartments);
        }
      } catch (err) {
        console.warn("Backend department fetch failed, falling back to static seeds:", err);
        setDepartments(defaultDepartments);
      } finally {
        setLoading(false);
      }
    };
    fetchDepartments();
  }, []);

  const filteredDepts = departments.filter(d => 
    (d.departmentName || "").toLowerCase().includes(search.toLowerCase()) ||
    (d.headOfficer || "").toLowerCase().includes(search.toLowerCase()) ||
    (d.departmentId || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <Navbar />
      <div className="container">
        <div style={styles.header}>
          <h2>{t.title}</h2>
          <p style={{ margin: 0, color: "var(--text-secondary)" }}>
            {t.subtitle}
          </p>
        </div>

        {/* Search Toolbar */}
        <div style={styles.toolbar}>
          <input
            type="text"
            placeholder={t.searchPl}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchBar}
          />
        </div>

        {/* Main Grid */}
        {loading ? (
          <div style={styles.loadingState}>{t.loading}</div>
        ) : filteredDepts.length === 0 ? (
          <div style={styles.emptyState}>
            <h4>{t.noDepts}</h4>
          </div>
        ) : (
          <div style={styles.grid}>
            {filteredDepts.map((dept) => (
              <div key={dept._id || dept.departmentId} className="card" style={styles.deptCard}>
                <div style={styles.cardTop}>
                  <div>
                    <span style={styles.deptId}>{dept.departmentId}</span>
                    <h3 style={styles.deptName}>{dept.departmentName}</h3>
                  </div>
                  <div style={styles.badgeGroup}>
                    <span style={styles.slaBadge}>⏱️ {dept.sla} SLA</span>
                  </div>
                </div>

                <div style={styles.infoRow}>
                  <strong>👤 {t.officerHead}:</strong> {dept.headOfficer}
                </div>

                <div style={styles.infoRow}>
                  <strong>⏰ {t.workingHours}:</strong> {dept.workingHours}
                </div>

                <div style={styles.infoRow}>
                  <strong>⭐ {t.performance}:</strong> 
                  <span style={{ color: "var(--color-primary)", fontWeight: "800", marginLeft: "6px" }}>
                    {dept.performance || 4.2} / 5.0
                  </span>
                </div>

                <div style={styles.contactBox}>
                  <h4 style={styles.contactTitle}>📞 {t.contactInfo}</h4>
                  <p style={styles.contactText}>{dept.contact}</p>
                </div>
              </div>
            ))}
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
    marginBottom: "30px",
  },
  searchBar: {
    margin: 0,
    maxWidth: "500px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
    gap: "24px",
  },
  deptCard: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    margin: 0,
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottom: "1px solid var(--border-light)",
    paddingBottom: "12px",
    marginBottom: "4px",
  },
  deptId: {
    fontSize: "12px",
    color: "var(--text-muted)",
    fontWeight: "700",
    textTransform: "uppercase",
  },
  deptName: {
    margin: "4px 0 0 0",
    fontSize: "18px",
    color: "#ffffff",
  },
  badgeGroup: {
    display: "flex",
    gap: "6px",
  },
  slaBadge: {
    fontSize: "11px",
    fontWeight: "800",
    background: "rgba(249, 115, 22, 0.12)",
    color: "var(--color-primary)",
    border: "1px solid rgba(249, 115, 22, 0.25)",
    padding: "3px 8px",
    borderRadius: "6px",
    textTransform: "uppercase",
  },
  infoRow: {
    fontSize: "14px",
    color: "var(--text-secondary)",
  },
  contactBox: {
    marginTop: "10px",
    padding: "12px",
    background: "rgba(255, 255, 255, 0.02)",
    border: "1px solid var(--border-light)",
    borderRadius: "8px",
  },
  contactTitle: {
    fontSize: "12px",
    color: "var(--text-primary)",
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: "6px",
  },
  contactText: {
    fontSize: "12px",
    color: "var(--text-secondary)",
    margin: 0,
    lineHeight: "1.6",
    whiteSpace: "pre-wrap",
  },
  loadingState: {
    textAlign: "center",
    padding: "40px",
    color: "var(--text-secondary)",
  },
  emptyState: {
    textAlign: "center",
    padding: "40px",
    color: "var(--text-muted)",
  }
};
