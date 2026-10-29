import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import Navbar from "../components/Navbar";

const proxyTranslations = {
  English: {
    badge: "🏬 CSC / VOLUNTEER PROXY HELPER PORTAL / जन सेवा केंद्र पोर्टल",
    title: "Register Grievance for Citizen",
    subtitle: "For citizens without smartphones or internet access. Volunteers & CSC agents can submit complaints here.",
    citizenName: "Citizen Full Name *",
    citizenNamePl: "e.g. Ramesh Kumar",
    citizenPhone: "Citizen Mobile Number (for SMS) *",
    citizenPhonePl: "e.g. +91 9876543210",
    dept: "Target Department",
    priority: "Priority Level",
    location: "Problem Location / Landmark",
    locationPl: "e.g. Ward No 4, Near Ration Shop, Main Street",
    desc: "Problem Details / Application Notes *",
    descPl: "Explain the citizen's complaint clearly...",
    submit: "✅ Submit Proxy Grievance",
    submitting: "Registering Proxy Grievance..."
  },
  Tamil: {
    badge: "🏬 சிஎஸ்சி / தன்னார்வலர் பதிலி உதவி போர்டல்",
    title: "குடிமகனுக்கான குறையை பதிவு செய்யவும்",
    subtitle: "ஸ்மார்ட்போன்கள் அல்லது இணைய வசதி இல்லாத குடிமக்களுக்கு. தன்னார்வலர்கள் மற்றும் சிஎஸ்சி முகவர்கள் இங்கே புகார்களை சமர்ப்பிக்கலாம்.",
    citizenName: "குடிமகன் முழு பெயர் *",
    citizenNamePl: "உதாரணம்: ரமேஷ் குமார்",
    citizenPhone: "குடிமகன் கைபேசி எண் (SMS பெற) *",
    citizenPhonePl: "உதாரணம்: +91 9876543210",
    dept: "இலக்குத் துறை",
    priority: "முன்னுரிமை நிலை",
    location: "பிரச்சனையின் இடம் / முக்கிய அடையாளம்",
    locationPl: "உதாரணம்: வார்டு எண் 4, ரேஷன் கடை அருகில், மெயின் தெரு",
    desc: "பிரச்சனை விவரங்கள் / விண்ணப்பக் குறிப்புகள் *",
    descPl: "குடிமகனின் புகாரை தெளிவாக விளக்குங்கள்...",
    submit: "✅ பதிலி புகாரைச் சமர்ப்பிக்கவும்",
    submitting: "பதிலி புகாரைப் பதிவு செய்கிறது..."
  },
  Hindi: {
    badge: "🏬 सीएससी / स्वयंसेवक सहायक प्रॉक्सी पोर्टल",
    title: "नागरिक के लिए शिकायत दर्ज करें",
    subtitle: "बिना स्मार्टफोन या इंटरनेट वाले नागरिकों के लिए। स्वयंसेवक और सीएससी एजेंट यहां शिकायतें जमा कर सकते हैं।",
    citizenName: "नागरिक का पूरा नाम *",
    citizenNamePl: "जैसे: रमेश कुमार",
    citizenPhone: "नागरिक का मोबाइल नंबर (SMS के लिए) *",
    citizenPhonePl: "जैसे: +91 9876543210",
    dept: "लक्षित विभाग",
    priority: "प्राथमिकता स्तर",
    location: "समस्या का स्थान / स्थल चिन्ह",
    locationPl: "जैसे: वार्ड नंबर 4, राशन की दुकान के पास, मुख्य मार्ग",
    desc: "समस्या का विवरण / आवेदन नोट *",
    descPl: "नागरिक की शिकायत को स्पष्ट रूप से समझाएं...",
    submit: "✅ प्रॉक्सी शिकायत सबमिट करें",
    submitting: "प्रॉक्सी शिकायत दर्ज की जा रही है..."
  }
};

export default function VolunteerProxy() {
  const navigate = useNavigate();
  const currentLang = localStorage.getItem("preferredLang") || "English";
  const pt = proxyTranslations[currentLang] || proxyTranslations["English"];
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [form, setForm] = useState({
    citizenName: "",
    citizenPhone: "",
    title: "",
    description: "",
    department: "Water Supply Department",
    priority: "Medium",
    location: "",
    helperId: "CSC-WARD-HEPAT-01"
  });

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser. Please use Google Chrome, MS Edge or Safari.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    
    const langMap = {
      "English": "en-US",
      "Hindi": "hi-IN",
      "Tamil": "ta-IN",
      "Telugu": "te-IN",
      "Kannada": "kn-IN",
      "Bengali": "bn-IN",
      "Marathi": "mr-IN",
      "Gujarati": "gu-IN"
    };
    
    recognition.lang = langMap[currentLang] || "en-US";
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onerror = (e) => {
      console.error("Speech Recognition Error:", e);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setForm(prev => ({ ...prev, description: prev.description ? prev.description + " " + transcript : transcript }));
    };

    recognition.start();
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.citizenName || !form.citizenPhone || !form.description) {
      alert("Please fill in Citizen Name, Phone Number, and Description");
      return;
    }

    try {
      setLoading(true);
      const fullDesc = `[Registered by Volunteer ${form.helperId} for Citizen: ${form.citizenName} (${form.citizenPhone})]\n\n${form.description}`;

      const res = await API.post("/complaint/create", {
        title: form.title || `${form.department} Grievance (${form.citizenName})`,
        description: fullDesc,
        department: form.department,
        language: "English",
        priority: form.priority,
        location: form.location || "Ward Residence",
        aiLetter: fullDesc,
        isAiGenerated: false,
        translationStatus: "Not Required"
      });

      alert(`✅ Proxy Grievance Registered Successfully!\nReference ID: ${res.data.complaint?.complaintId}\nAutomated SMS confirmation dispatched to ${form.citizenPhone}.`);
      setForm({
        citizenName: "",
        citizenPhone: "",
        title: "",
        description: "",
        department: "Water Supply Department",
        priority: "Medium",
        location: "",
        helperId: "CSC-WARD-HEPAT-01"
      });
    } catch (err) {
      console.error(err);
      alert("Failed to register proxy grievance. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container" style={{ maxWidth: "800px", margin: "20px auto", padding: "20px", boxSizing: "border-box" }}>
        <div style={{ textAlign: "center", marginBottom: "25px" }}>
          <span style={{
            fontSize: "12px",
            fontWeight: "800",
            textTransform: "uppercase",
            letterSpacing: "1px",
            backgroundColor: "rgba(16, 185, 129, 0.15)",
            color: "#10b981",
            padding: "4px 12px",
            borderRadius: "20px",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            display: "inline-block"
          }}>
            {pt.badge}
          </span>
          <h2 style={{ marginTop: "12px", marginBottom: "8px", fontSize: "26px" }}>
            {pt.title}
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
            {pt.subtitle}
          </p>
        </div>

        <div className="card" style={{ padding: "24px", backgroundColor: "var(--bg-glass)", boxSizing: "border-box" }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "15px", marginBottom: "15px" }}>
              <div>
                <label style={{ fontSize: "13px", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                  <span>👤</span> {pt.citizenName}
                </label>
                <input
                  type="text"
                  name="citizenName"
                  placeholder={pt.citizenNamePl}
                  value={form.citizenName}
                  onChange={handleChange}
                  style={{ width: "100%", padding: "10px", borderRadius: "6px", backgroundColor: "rgba(0,0,0,0.2)", color: "var(--text-primary)", border: "1px solid var(--border-light)", boxSizing: "border-box" }}
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: "13px", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                  <span>📱</span> {pt.citizenPhone}
                </label>
                <input
                  type="text"
                  name="citizenPhone"
                  placeholder={pt.citizenPhonePl}
                  value={form.citizenPhone}
                  onChange={handleChange}
                  style={{ width: "100%", padding: "10px", borderRadius: "6px", backgroundColor: "rgba(0,0,0,0.2)", color: "var(--text-primary)", border: "1px solid var(--border-light)", boxSizing: "border-box" }}
                  required
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "15px", marginBottom: "15px" }}>
              <div>
                <label style={{ fontSize: "13px", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                  <span>🏢</span> {pt.dept}
                </label>
                <select
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  style={{ width: "100%", padding: "10px", borderRadius: "6px", backgroundColor: "rgba(0,0,0,0.2)", color: "var(--text-primary)", border: "1px solid var(--border-light)", boxSizing: "border-box" }}
                >
                  <option value="Water Supply Department">{currentLang === "Tamil" ? "நீர் விநியோகத் துறை" : currentLang === "Hindi" ? "जल आपूर्ति विभाग" : "Water Supply Department"}</option>
                  <option value="Electricity Department">{currentLang === "Tamil" ? "மின்சாரத் துறை" : currentLang === "Hindi" ? "बिजली विभाग" : "Electricity Department"}</option>
                  <option value="Road and Transport Department">{currentLang === "Tamil" ? "சாலை மற்றும் போக்குவரத்துத் துறை" : currentLang === "Hindi" ? "सड़क और परिवहन विभाग" : "Road and Transport Department"}</option>
                  <option value="Sanitation Department">{currentLang === "Tamil" ? "சுகாதாரத் துறை" : currentLang === "Hindi" ? "स्वच्छता विभाग" : "Sanitation Department"}</option>
                  <option value="Health Department">{currentLang === "Tamil" ? "சுகாதாரத் துறை" : currentLang === "Hindi" ? "स्वास्थ्य विभाग" : "Health Department"}</option>
                  <option value="Revenue Department">{currentLang === "Tamil" ? "வருவாய்த் துறை" : currentLang === "Hindi" ? "राजस्व विभाग" : "Revenue Department"}</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: "13px", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                  <span>🚨</span> {pt.priority}
                </label>
                <select
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                  style={{ width: "100%", padding: "10px", borderRadius: "6px", backgroundColor: "rgba(0,0,0,0.2)", color: "var(--text-primary)", border: "1px solid var(--border-light)", boxSizing: "border-box" }}
                >
                  <option value="Emergency">{currentLang === "Tamil" ? "🚨 அவசரம்" : currentLang === "Hindi" ? "🚨 आपातकालीन" : "Emergency"}</option>
                  <option value="High">{currentLang === "Tamil" ? "🔴 உயர்" : currentLang === "Hindi" ? "🔴 उच्च" : "High"}</option>
                  <option value="Medium">{currentLang === "Tamil" ? "🟡 நடுத்தரம்" : currentLang === "Hindi" ? "🟡 मध्यम" : "Medium"}</option>
                  <option value="Low">{currentLang === "Tamil" ? "🔵 குறைந்த" : currentLang === "Hindi" ? "🔵 कम" : "Low"}</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label style={{ fontSize: "13px", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                <span>📍</span> {pt.location}
              </label>
              <input
                type="text"
                name="location"
                placeholder={pt.locationPl}
                value={form.location}
                onChange={handleChange}
                style={{ width: "100%", padding: "10px", borderRadius: "6px", backgroundColor: "rgba(0,0,0,0.2)", color: "var(--text-primary)", border: "1px solid var(--border-light)", boxSizing: "border-box" }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <label style={{ fontSize: "13px", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px", margin: 0 }}>
                  <span>📝</span> {pt.desc}
                </label>
                <button
                  type="button"
                  onClick={startListening}
                  style={{
                    backgroundColor: isListening ? "#ef4444" : "rgba(255,255,255,0.05)",
                    border: isListening ? "1px solid #ef4444" : "1px solid var(--border-light)",
                    color: isListening ? "#ffffff" : "var(--text-primary)",
                    padding: "4px 12px",
                    borderRadius: "15px",
                    fontSize: "11px",
                    fontWeight: "700",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px"
                  }}
                >
                  🎙️ {isListening ? "Listening..." : "Speak Details"}
                </button>
              </div>
              <textarea
                name="description"
                placeholder={isListening ? "Listening now... speak clearly." : pt.descPl}
                value={form.description}
                onChange={handleChange}
                rows={4}
                style={{ width: "100%", padding: "10px", borderRadius: "6px", backgroundColor: "rgba(0,0,0,0.2)", color: "var(--text-primary)", border: "1px solid var(--border-light)", minHeight: "120px" }}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                backgroundColor: "var(--color-completed)",
                color: "#ffffff",
                padding: "12px",
                borderRadius: "6px",
                border: "none",
                fontWeight: "700",
                fontSize: "15px",
                cursor: loading ? "wait" : "pointer"
              }}
            >
              {loading ? pt.submitting : pt.submit}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
