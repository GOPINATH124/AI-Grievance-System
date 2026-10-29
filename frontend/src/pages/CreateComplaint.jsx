import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import Navbar from "../components/Navbar";

const createTranslations = {
  English: {
    title: "📝 Register Manual Grievance",
    subtitle: "Fill in the details below to manually submit a grievance to the respective government office.",
    subject: "Grievance Subject / Title",
    subjectPl: "e.g. Broken water pipeline, power outage...",
    dept: "Target Department",
    lang: "Grievance Language",
    priority: "Grievance Priority",
    location: "Location / Landmark of the Problem",
    locationPl: "e.g. Near Main Market Street, Ward No. 4",
    photo: "Upload Photo of the Problem (Optional)",
    desc: "Detailed Description / Complaint Letter",
    descPl: "Provide a detailed explanation of the issue, including location, duration, and details of the request...",
    submit: "Submit Grievance",
    submitting: "Submitting...",
    cancel: "Cancel"
  },
  Tamil: {
    title: "📝 கைமுறையாக புகார் பதிவு செய்யவும்",
    subtitle: "சம்பந்தப்பட்ட அரசு அலுவலகத்தில் கைமுறையாக புகாரைச் சமர்ப்பிக்க கீழே உள்ள விவரங்களை நிரப்பவும்.",
    subject: "புகார் பொருள் / தலைப்பு",
    subjectPl: "உதாரணம்: உடைந்த தண்ணீர் குழாய், மின் தடை...",
    dept: "இலக்குத் துறை",
    lang: "புகார் மொழி",
    priority: "புகார் முன்னுரிமை",
    location: "பிரச்சனையின் இடம் / முக்கிய அடையாளம்",
    locationPl: "உதாரணம்: மெயின் மார்க்கெட் தெரு அருகில், வார்டு எண் 4",
    photo: "சிக்கலின் புகைப்படத்தைப் பதிவேற்றவும் (விருப்பத்தேர்வு)",
    desc: "விரிவான விளக்கம் / புகார் கடிதம்",
    descPl: "இடம், காலம் மற்றும் கோரிக்கையின் விவரங்கள் உட்பட சிக்கலின் விரிவான விளக்கத்தை வழங்கவும்...",
    submit: "புகாரைச் சமர்ப்பிக்கவும்",
    submitting: "சமர்ப்பிக்கிறது...",
    cancel: "ரத்து செய்"
  },
  Hindi: {
    title: "📝 मैन्युअल शिकायत दर्ज करें",
    subtitle: "संबंधित सरकारी कार्यालय में मैन्युअल रूप से शिकायत दर्ज करने के लिए नीचे विवरण भरें।",
    subject: "शिकायत का विषय / शीर्षक",
    subjectPl: "जैसे: पानी की टूटी पाइपलाइन, बिजली कटौती...",
    dept: "लक्षित विभाग",
    lang: "शिकायत की भाषा",
    priority: "शिकायत की प्राथमिकता",
    location: "समस्या का स्थान / स्थल चिन्ह",
    locationPl: "जैसे: मुख्य बाजार मार्ग के पास, वार्ड नंबर 4",
    photo: "समस्या का फोटो अपलोड करें (वैकल्पिक)",
    desc: "विस्तृत विवरण / शिकायत पत्र",
    descPl: "समस्या का विस्तृत विवरण प्रदान करें, जिसमें स्थान, अवधि और अनुरोध का विवरण शामिल हो...",
    submit: "शिकायत सबमिट करें",
    submitting: "सबमिट किया जा रहा है...",
    cancel: "रद्द करें"
  }
};

export default function CreateComplaint() {
  const navigate = useNavigate();
  const userStr = localStorage.getItem("user");
  const user = (userStr && userStr !== "undefined") ? JSON.parse(userStr) : null;
  const currentLang = localStorage.getItem("preferredLang") || user?.language || "English";
  const ct = createTranslations[currentLang] || createTranslations["English"];
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [imageBase64, setImageBase64] = useState("");
  const [excludedData, setExcludedData] = useState(null);
  const [showDigiLockerModal, setShowDigiLockerModal] = useState(false);
  const [digiLockerStep, setDigiLockerStep] = useState(1);
  const [aadhaarNum, setAadhaarNum] = useState("");
  const [securityPin, setSecurityPin] = useState("");
  const [otpVal, setOtpVal] = useState("");
  const [digiLockerDoc, setDigiLockerDoc] = useState(null);
  const [coords, setCoords] = useState({ lat: 12.9716, lng: 77.5946 });
  const [form, setForm] = useState({
    title: "",
    description: "",
    department: "",
    language: currentLang,
    priority: "Medium",
    location: "",
    phone: "",
    email: ""
  });

  useEffect(() => {
    const checkUserProfile = async () => {
      try {
        const res = await API.get("/auth/me");
        if (res.data) {
          setForm(prev => ({
            ...prev,
            phone: res.data.phone || "",
            email: res.data.email || ""
          }));
        }
      } catch (err) {
        console.error("Failed to check user profile", err);
      }
    };
    checkUserProfile();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const res = await API.get("/admin/departments");
        const loaded = res.data || [];
        const defaultDepts = [
          { _id: "wat", departmentName: "Water Supply Department" },
          { _id: "ele", departmentName: "Electricity Department" },
          { _id: "rod", departmentName: "Road and Transport Department" },
          { _id: "san", departmentName: "Sanitation Department" },
          { _id: "hea", departmentName: "Health Department" },
          { _id: "rev", departmentName: "Revenue Department" }
        ];
        const existingNames = new Set(loaded.map(d => d.departmentName));
        const merged = [...loaded, ...defaultDepts.filter(d => !existingNames.has(d.departmentName))];
        
        setDepartments(merged);
        if (merged.length > 0) {
          setForm(prev => ({ ...prev, department: merged[0].departmentName }));
        }
      } catch (err) {
        console.error("Failed to load departments", err);
        const fallbackDepts = [
          { _id: "wat", departmentName: "Water Supply Department" },
          { _id: "ele", departmentName: "Electricity Department" },
          { _id: "rod", departmentName: "Road and Transport Department" },
          { _id: "san", departmentName: "Sanitation Department" },
          { _id: "hea", departmentName: "Health Department" },
          { _id: "rev", departmentName: "Revenue Department" }
        ];
        setDepartments(fallbackDepts);
        setForm(prev => ({ ...prev, department: fallbackDepts[0].departmentName }));
      }
    };
    fetchDepts();
  }, []);

  useEffect(() => {
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    if (!window.L) {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.async = true;
      script.onload = () => {
        initMap();
      };
      document.body.appendChild(script);
    } else {
      initMap();
    }
  }, []);

  const initMap = () => {
    if (!window.L) return;
    const mapContainer = document.getElementById("leaflet-map");
    if (!mapContainer || mapContainer._leaflet_id) return;

    const myMap = window.L.map("leaflet-map").setView([12.9716, 77.5946], 13);
    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors"
    }).addTo(myMap);

    let marker = window.L.marker([12.9716, 77.5946], { draggable: true }).addTo(myMap);

    window.createComplaintMapInstance = myMap;
    window.createComplaintMarkerInstance = marker;

    const updatePosition = async (lat, lng) => {
      setCoords({ lat, lng });
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
        if (response.ok) {
          const data = await response.json();
          if (data && data.display_name) {
            setForm(prev => ({ ...prev, location: data.display_name }));
          }
        }
      } catch (err) {
        console.warn("Reverse geocode failed, using coordinates instead:", err.message);
        setForm(prev => ({ ...prev, location: `Latitude: ${lat.toFixed(4)}, Longitude: ${lng.toFixed(4)}` }));
      }
    };

    myMap.on("click", (e) => {
      const { lat, lng } = e.latlng;
      marker.setLatLng([lat, lng]);
      updatePosition(lat, lng);
    });

    marker.on("dragend", () => {
      const { lat, lng } = marker.getLatLng();
      updatePosition(lat, lng);
    });
  };

  const handleSearchAddress = async () => {
    if (!form.location.trim()) return;
    try {
      const res = await API.post("/complaint/geocode", { query: form.location });
      if (res.data && res.data.success) {
        const { lat, lon, display_name } = res.data;
        setCoords({ lat, lng: lon });
        setForm(prev => ({ ...prev, location: display_name }));

        if (window.createComplaintMapInstance && window.createComplaintMarkerInstance) {
          window.createComplaintMapInstance.setView([lat, lon], 15);
          window.createComplaintMarkerInstance.setLatLng([lat, lon]);
        }
      }
    } catch (err) {
      console.warn("Backend geocoding failed, trying raw browser fallback...", err);
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(form.location)}&limit=1`);
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            const { lat, lon } = data[0];
            const latitude = parseFloat(lat);
            const longitude = parseFloat(lon);
            
            setCoords({ lat: latitude, lng: longitude });

            if (window.createComplaintMapInstance && window.createComplaintMarkerInstance) {
              window.createComplaintMapInstance.setView([latitude, longitude], 15);
              window.createComplaintMarkerInstance.setLatLng([latitude, longitude]);
            }
            return;
          }
        }
      } catch (fallbackErr) {
        console.error("Browser fallback geocoding failed:", fallbackErr);
      }
      alert("Could not locate address on map. Please try a different search or click the map directly.");
    }
  };

  const submitComplaint = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description) {
      alert("Please fill in all fields");
      return;
    }
    try {
      setLoading(true);
      const res = await API.post("/complaint/create", {
        ...form,
        imageBase64,
        isDigiLockerAttached: !!digiLockerDoc,
        digiLockerDocType: digiLockerDoc ? digiLockerDoc.type : "",
        digiLockerDocName: digiLockerDoc ? digiLockerDoc.name : "",
        latitude: coords.lat,
        longitude: coords.lng
      });
      alert(`Grievance submitted successfully. Reference ID: ${res.data.complaint.complaintId}`);
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      if (error.response?.data?.isExcluded) {
        setExcludedData(error.response.data);
      } else {
        alert("Failed to submit grievance. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container" style={{ maxWidth: "800px" }}>
        <h2>{ct.title}</h2>
          <p style={{ marginBottom: "30px", color: "var(--text-secondary)" }}>
            {ct.subtitle}
          </p>

          <form onSubmit={submitComplaint}>
          <div style={styles.formGroup}>
            <label style={styles.label}>{ct.subject}</label>
            <input
              name="title"
              type="text"
              placeholder={ct.subjectPl}
              value={form.title}
              onChange={handleChange}
              style={{ margin: "5px 0 0 0" }}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>📱 Mobile Number (For SMS Status Alerts)</label>
            <input
              name="phone"
              type="tel"
              placeholder="e.g. +919876543210"
              value={form.phone}
              onChange={handleChange}
              required
              style={{ margin: "5px 0 0 0" }}
            />
            <span style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px", display: "block" }}>
              💡 Verify or enter your mobile number (including country code like +91) to receive live SMS notifications.
            </span>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>📧 Contact Email (For Status Alerts)</label>
            <input
              name="email"
              type="email"
              placeholder="e.g. citizen@example.com"
              value={form.email}
              onChange={handleChange}
              required
              style={{ margin: "5px 0 0 0" }}
            />
            <span style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px", display: "block" }}>
              💡 Verify or enter your correct email address to receive real-time updates and resolution reports.
            </span>
          </div>


          <div className="grid-3" style={{ gap: "20px", marginBottom: "10px" }}>
            <div style={styles.formGroup}>
              <label style={styles.label}>{ct.dept}</label>
              <select
                name="department"
                value={form.department}
                onChange={handleChange}
                style={{ margin: "5px 0 0 0" }}
              >
                {departments.map((d) => (
                  <option key={d._id} value={d.departmentName || d.name}>{d.departmentName || d.name}</option>
                ))}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>{ct.lang}</label>
              <select
                name="language"
                value={form.language}
                onChange={handleChange}
                style={{ margin: "5px 0 0 0" }}
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi (हिन्दी)</option>
                <option value="Tamil">Tamil (தமிழ்)</option>
                <option value="Telugu">Telugu (తెలుగు)</option>
                <option value="Kannada">Kannada (ಕನ್ನಡ)</option>
                <option value="Bengali">Bengali (বাংলা)</option>
                <option value="Marathi">Marathi (मराठी)</option>
                <option value="Gujarati">Gujarati (ગુજરાતી)</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>{ct.priority}</label>
              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
                style={{ margin: "5px 0 0 0" }}
              >
                <option value="High">{currentLang === "Tamil" ? "🔴 உயர் முன்னுரிமை" : currentLang === "Hindi" ? "🔴 उच्च प्राथमिकता" : "High"}</option>
                <option value="Medium">{currentLang === "Tamil" ? "🟡 நடுத்தரம்" : currentLang === "Hindi" ? "🟡 मध्यम" : "Medium"}</option>
                <option value="Low">{currentLang === "Tamil" ? "🔵 குறைந்த முன்னுரிமை" : currentLang === "Hindi" ? "🔵 कम प्राथमिकता" : "Low"}</option>
              </select>
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>{ct.location}</label>
            <div style={{ display: "flex", gap: "8px", marginTop: "5px" }}>
              <input
                name="location"
                type="text"
                placeholder={ct.locationPl}
                value={form.location}
                onChange={handleChange}
                style={{ margin: 0, flex: 1 }}
              />
              <button
                type="button"
                onClick={handleSearchAddress}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "var(--color-primary)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  margin: 0
                }}
              >
                🔍 Locate on Map
              </button>
            </div>
            <div id="leaflet-map" style={{
              width: "100%",
              height: "220px",
              marginTop: "12px",
              borderRadius: "8px",
              border: "1px solid var(--border-light)",
              zIndex: 1
            }}></div>
            <p style={{ margin: "5px 0 0 0", fontSize: "11px", color: "var(--text-secondary)" }}>
              📍 <strong>Map Assistant:</strong> Click or drag the pin on the map to automatically populate your location coordinates and address.
            </p>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>{ct.photo}</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ margin: "10px 0" }}
            />
            {imageBase64 && (
              <div style={{ marginTop: "10px" }}>
                <img 
                  src={imageBase64} 
                  alt="Attachment Preview" 
                  style={{ width: "120px", maxHeight: "120px", objectFit: "cover", borderRadius: "6px", border: "1px solid var(--border-light)" }} 
                />
                <button 
                  type="button" 
                  onClick={() => setImageBase64("")} 
                  style={{
                    display: "block",
                    marginTop: "8px",
                    padding: "6px 12px",
                    fontSize: "11px",
                    backgroundColor: "#ef4444",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontWeight: "bold"
                  }}
                >
                  {currentLang === "Tamil" ? "புகைப்படத்தை நீக்கு" : currentLang === "Hindi" ? "फोटो हटाएं" : "Remove Photo"}
                </button>
              </div>
            )}
          </div>

          <div style={styles.formGroup}>
            <div style={{ display: "flex", gap: "12px", alignItems: "center", marginTop: "10px", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => {
                  setDigiLockerStep(1);
                  setAadhaarNum("");
                  setSecurityPin("");
                  setOtpVal("");
                  setShowDigiLockerModal(true);
                }}
                style={{
                  padding: "8px 16px",
                  fontSize: "13px",
                  fontWeight: "700",
                  backgroundColor: "rgba(37, 99, 235, 0.15)",
                  border: "1px solid rgba(37, 99, 235, 0.3)",
                  color: "#60a5fa",
                  borderRadius: "6px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  margin: 0
                }}
              >
                🔗 Link Verified Doc via DigiLocker
              </button>
              
              {digiLockerDoc && (
                <div style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  backgroundColor: "rgba(16, 185, 129, 0.1)",
                  border: "1px solid rgba(16, 185, 129, 0.2)",
                  color: "#34d399",
                  fontSize: "13px",
                  fontWeight: "700",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}>
                  🟢 DigiLocker Linked: {digiLockerDoc.type} ({digiLockerDoc.name})
                  <button
                    type="button"
                    onClick={() => setDigiLockerDoc(null)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#f87171",
                      cursor: "pointer",
                      fontSize: "16px",
                      marginLeft: "6px",
                      fontWeight: "bold",
                      padding: 0
                    }}
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>{ct.desc}</label>
            <textarea
              name="description"
              placeholder={ct.descPl}
              value={form.description}
              onChange={handleChange}
              style={{ margin: "5px 0 0 0", minHeight: "180px" }}
            />
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
            <button type="submit" disabled={loading} style={{ flex: 1 }}>
              {loading ? ct.submitting : ct.submit}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate("/dashboard")}
              style={{ flex: 1, marginLeft: "8px" }}
            >
              {ct.cancel}
            </button>
          </div>
        </form>

        {excludedData && (
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.85)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000
          }}>
            <div className="card" style={{
              maxWidth: "500px",
              padding: "30px",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              background: "var(--card-bg)",
              boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
              margin: "20px"
            }}>
              <h3 style={{ color: "#ef4444", display: "flex", alignItems: "center", gap: "8px", margin: "0 0 15px 0" }}>
                🚫 {currentLang === "Tamil" ? "புகார் சமர்ப்பிப்பு தடுக்கப்பட்டது" : currentLang === "Hindi" ? "शिकायत जमा करना अवरुद्ध" : "Submission Blocked by Screening System"}
              </h3>
              <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "12px" }}>
                <strong>{currentLang === "Tamil" ? "வகை" : currentLang === "Hindi" ? "श्रेणी" : "Excluded Category"}:</strong> {excludedData.category}
              </p>
              <div style={{
                padding: "16px",
                borderRadius: "8px",
                backgroundColor: "rgba(239, 68, 68, 0.05)",
                border: "1px dashed rgba(239, 68, 68, 0.2)",
                fontSize: "14px",
                lineHeight: "1.6",
                color: "var(--text-primary)",
                marginBottom: "20px"
              }}>
                {excludedData.reason}
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                {excludedData.redirect && (
                  <a
                    href={excludedData.redirect}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn"
                    style={{
                      flex: 1,
                      textAlign: "center",
                      textDecoration: "none",
                      backgroundColor: "var(--color-primary)",
                      color: "#fff",
                      fontWeight: "700",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: 0
                    }}
                  >
                    🔗 {currentLang === "Tamil" ? "அதிகாரப்பூர்வ தளத்திற்குச் செல்லவும்" : currentLang === "Hindi" ? "पोर्टल पर जाएं" : "Go to Official Portal"}
                  </a>
                )}
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setExcludedData(null)}
                  style={{ flex: 1, margin: 0 }}
                >
                  {currentLang === "Tamil" ? "மூடு" : currentLang === "Hindi" ? "बंद करें" : "Close"}
                </button>
              </div>
            </div>
          </div>
        )}

        {showDigiLockerModal && (
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.85)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1100
          }}>
            <div className="card" style={{
              maxWidth: "460px",
              width: "100%",
              padding: "30px",
              border: "1px solid rgba(37, 99, 235, 0.3)",
              background: "#0f172a",
              boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.5)",
              margin: "20px",
              borderRadius: "12px",
              color: "#f1f5f9"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px", borderBottom: "1px solid rgba(255, 255, 255, 0.1)", paddingBottom: "12px" }}>
                <span style={{ fontSize: "24px" }}>⚡</span>
                <div style={{ textAlign: "left" }}>
                  <h3 style={{ margin: 0, color: "#3b82f6", display: "flex", alignItems: "center", gap: "6px" }}>
                    DigiLocker Verification
                  </h3>
                  <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "600", textTransform: "uppercase" }}>
                    Govt. of India Digital Wallet
                  </span>
                </div>
              </div>

              {digiLockerStep === 1 && (
                <div style={{ textAlign: "left" }}>
                  <p style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "20px", lineHeight: "1.5" }}>
                    Enter your Aadhaar / Mobile number to login to your official government DigiLocker account.
                  </p>
                  <div style={{ marginBottom: "15px" }}>
                    <label style={{ fontSize: "12px", fontWeight: "700", color: "#94a3b8" }}>Aadhaar or Registered Mobile No.</label>
                    <input
                      type="text"
                      placeholder="e.g. 1234 5678 9012"
                      value={aadhaarNum}
                      onChange={(e) => setAadhaarNum(e.target.value.replace(/\D/g, "").substring(0, 12))}
                      style={{ margin: "5px 0 0 0", background: "#1e293b", border: "1px solid #334155", color: "#fff", width: "100%" }}
                    />
                  </div>
                  <div style={{ marginBottom: "20px" }}>
                    <label style={{ fontSize: "12px", fontWeight: "700", color: "#94a3b8" }}>6-Digit Security PIN</label>
                    <input
                      type="password"
                      placeholder="••••••"
                      value={securityPin}
                      onChange={(e) => setSecurityPin(e.target.value.replace(/\D/g, "").substring(0, 6))}
                      style={{ margin: "5px 0 0 0", background: "#1e293b", border: "1px solid #334155", color: "#fff", width: "100%" }}
                    />
                  </div>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      type="button"
                      disabled={aadhaarNum.length < 10 || securityPin.length < 6}
                      onClick={() => setDigiLockerStep(2)}
                      style={{ flex: 1, backgroundColor: "#2563eb", color: "#fff", margin: 0 }}
                    >
                      Request OTP
                    </button>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setShowDigiLockerModal(false)}
                      style={{ flex: 1, color: "#94a3b8", border: "1px solid #334155", margin: 0 }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {digiLockerStep === 2 && (
                <div style={{ textAlign: "left" }}>
                  <p style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "20px", lineHeight: "1.5" }}>
                    A one-time password (OTP) has been sent to your Aadhaar registered mobile number ending in **4082.
                  </p>
                  <div style={{ marginBottom: "20px" }}>
                    <label style={{ fontSize: "12px", fontWeight: "700", color: "#94a3b8" }}>Enter 6-Digit OTP</label>
                    <input
                      type="text"
                      placeholder="Enter OTP (e.g. 123456)"
                      value={otpVal}
                      onChange={(e) => setOtpVal(e.target.value.replace(/\D/g, "").substring(0, 6))}
                      style={{ margin: "5px 0 0 0", background: "#1e293b", border: "1px solid #334155", color: "#fff", width: "100%" }}
                    />
                  </div>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      type="button"
                      disabled={otpVal.length < 6}
                      onClick={() => setDigiLockerStep(3)}
                      style={{ flex: 1, backgroundColor: "#2563eb", color: "#fff", margin: 0 }}
                    >
                      Verify & Sign In
                    </button>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setDigiLockerStep(1)}
                      style={{ flex: 1, color: "#94a3b8", border: "1px solid #334155", margin: 0 }}
                    >
                      Back
                    </button>
                  </div>
                </div>
              )}

              {digiLockerStep === 3 && (
                <div style={{ textAlign: "left" }}>
                  <p style={{ fontSize: "13px", color: "#34d399", marginBottom: "15px", fontWeight: "700" }}>
                    ✓ Authentication Successful. Select a verified document to link:
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
                    {[
                      { type: "Aadhaar Card", name: "UIDAI - Government of India" },
                      { type: "PAN Card", name: "Income Tax Department" },
                      { type: "Land Registry Deed", name: "Department of Revenue" },
                      { type: "Electricity Bill", name: "State Power Grid Board" }
                    ].map((doc) => (
                      <div
                        key={doc.type}
                        onClick={() => {
                          setDigiLockerDoc(doc);
                          setShowDigiLockerModal(false);
                        }}
                        style={{
                          padding: "12px",
                          borderRadius: "8px",
                          backgroundColor: "#1e293b",
                          border: "1px solid #334155",
                          cursor: "pointer",
                          transition: "all 0.2s"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = "#3b82f6";
                          e.currentTarget.style.backgroundColor = "#0f172a";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = "#334155";
                          e.currentTarget.style.backgroundColor = "#1e293b";
                        }}
                      >
                        <div style={{ fontWeight: "700", color: "#fff", fontSize: "14px" }}>{doc.type}</div>
                        <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>{doc.name}</div>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setShowDigiLockerModal(false)}
                    style={{ width: "100%", color: "#94a3b8", border: "1px solid #334155", margin: 0 }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  formGroup: {
    marginBottom: "20px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "700",
    color: "var(--text-primary)",
    display: "block",
  },
  sidebar: {
    width: "300px",
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
    gap: "20px"
  },
  sidebarCard: {
    background: "rgba(30, 41, 59, 0.7)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.3)",
    width: "100%",
    boxSizing: "border-box"
  },
  cardTitle: {
    fontSize: "15px",
    fontWeight: "800",
    color: "#fff",
    marginBottom: "15px",
    borderBottom: "1.5px solid rgba(255, 255, 255, 0.08)",
    paddingBottom: "8px",
    display: "flex",
    alignItems: "center",
    gap: "8px"
  },

  carouselContainer: {
    minHeight: "70px",
    position: "relative",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    background: "rgba(15, 23, 42, 0.6)",
    borderRadius: "12px",
    padding: "12px",
    borderLeft: "4px solid #3b82f6",
    boxSizing: "border-box"
  },
  carouselText: {
    fontSize: "12px", 
    color: "#cbd5e1",
    fontWeight: "600",
    lineHeight: "1.5"
  }
};