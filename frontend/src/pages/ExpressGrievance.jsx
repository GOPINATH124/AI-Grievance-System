import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import Navbar from "../components/Navbar";

export default function ExpressGrievance() {
  const navigate = useNavigate();
  const userStr = localStorage.getItem("user");
  const user = (userStr && userStr !== "undefined") ? JSON.parse(userStr) : null;

  const [loading, setLoading] = useState(false);
  const currentLang = localStorage.getItem("preferredLang") || user?.language || "English";
  const [language, setLanguage] = useState(currentLang);
  const [location, setLocation] = useState("");

  const categories = [
    {
      id: "water_pipe",
      title: "🚰 Water Pipe Burst / Leakage",
      titleHi: "🚰 मुख्य पाइपलाइन रिसाव",
      titleTa: "🚰 தண்ணீர் குழாய் உடைப்பு",
      department: "Water Supply Department",
      priority: "High",
      defaultText: "Water supply pipeline leakage reported. Clean drinking water is wasting and local supply is interrupted.",
      bg: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
      icon: "🚰"
    },
    {
      id: "water_tanker",
      title: "🚚 Water Tanker Request",
      titleHi: "🚚 पानी का टैंकर अनुरोध",
      titleTa: "🚚 தண்ணீர் லாரி தேவை",
      department: "Water Supply Department",
      priority: "High",
      defaultText: "Severe water shortage in area. Requesting urgent dispatch of emergency drinking water tanker.",
      bg: "linear-gradient(135deg, #0891b2 0%, #0e7490 100%)",
      icon: "🚚"
    },
    {
      id: "water_dirty",
      title: "🧪 Dirty / Contaminated Water",
      titleHi: "🧪 गंदा / दूषित पेयजल",
      titleTa: "🧪 அசுத்தமான குடிநீர்",
      department: "Water Supply Department",
      priority: "Emergency",
      defaultText: "Contaminated or muddy drinking water supply reported. High health hazard risk requiring immediate testing and filter flush.",
      bg: "linear-gradient(135deg, #0369a1 0%, #1e3a8a 100%)",
      icon: "🧪"
    },
    {
      id: "elec_powercut",
      title: "⚡ Power Cut & Load Shedding",
      titleHi: "⚡ बिजली कटौती / पावर कट",
      titleTa: "⚡ மின்சாரத் தடை / பவர் கட்",
      department: "Electricity Department",
      priority: "High",
      defaultText: "Unannounced prolonged power cut reported in residential locality. Requesting immediate power restoration.",
      bg: "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
      icon: "⚡"
    },
    {
      id: "elec_wire",
      title: "💥 Loose Wire / Sparking Pole",
      titleHi: "💥 खंभे पर चिंगारी / ढीले तार",
      titleTa: "💥 தளர்வான கம்பிகள் / மின்கம்ப ஆபத்து",
      department: "Electricity Department",
      priority: "Emergency",
      defaultText: "Sparking electric pole or hanging live wire hazard. Immediate emergency lineman inspection required.",
      bg: "linear-gradient(135deg, #ea580c 0%, #c2410c 100%)",
      icon: "💥"
    },
    {
      id: "elec_streetlight",
      title: "💡 Street Light Not Working",
      titleHi: "💡 स्ट्रीट लाइट बंद होना",
      titleTa: "💡 தெருவிளக்கு எரியவில்லை",
      department: "Electricity Department",
      priority: "Medium",
      defaultText: "Darkness in street due to non-functional street lights. Bulb replacement required for safety.",
      bg: "linear-gradient(135deg, #ca8a04 0%, #a16207 100%)",
      icon: "💡"
    },
    {
      id: "sanit_garbage",
      title: "🧹 Overflowing Garbage Dump",
      titleHi: "🧹 कचरा ढेर / बदबू",
      titleTa: "🧹 குப்பைக் குவியல்",
      department: "Sanitation Department",
      priority: "Medium",
      defaultText: "Accumulated uncollected waste dump causing foul odor and health risks. Immediate garbage truck collection requested.",
      bg: "linear-gradient(135deg, #059669 0%, #047857 100%)",
      icon: "🧹"
    },
    {
      id: "sanit_sewer",
      title: "🌊 Sewage Overflow & Drain Block",
      titleHi: "🌊 नाली जाम / सीवर ओवरफ्लो",
      titleTa: "🌊 சாக்கடை அடைப்பு",
      department: "Sanitation Department",
      priority: "High",
      defaultText: "Clogged drainage line causing sewage water overflow on public road. Suction machine cleaning required.",
      bg: "linear-gradient(135deg, #0d9488 0%, #115e59 100%)",
      icon: "🌊"
    },
    {
      id: "road_pothole",
      title: "🛣️ Dangerous Road Potholes",
      titleHi: "🛣️ सड़क पर खतरनाक गड्ढे",
      titleTa: "🛣️ ஆபத்தான சாலை குழிகள்",
      department: "Road and Transport Department",
      priority: "Medium",
      defaultText: "Severe road damage and deep potholes risking vehicle accidents. Asphalt patching and repair required.",
      bg: "linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)",
      icon: "🛣️"
    },
    {
      id: "health_dengue",
      title: "🦟 Mosquito Spraying & Dengue",
      titleHi: "🦟 मच्छर स्प्रे / डेंगू रोकथाम",
      titleTa: "🦟 கொசு மருந்து தெளித்தல்",
      department: "Health Department",
      priority: "High",
      defaultText: "High mosquito breeding in stagnant water. Chemical fogging and anti-larval spray requested for disease prevention.",
      bg: "linear-gradient(135deg, #e11d48 0%, #be123c 100%)",
      icon: "🦟"
    },
    {
      id: "rev_ration",
      title: "📑 Ration Card & Supply Help",
      titleHi: "📑 राशन कार्ड / वितरण सहायता",
      titleTa: "📑 ரேஷன் கார்டு உதவி",
      department: "Revenue Department",
      priority: "Low",
      defaultText: "Assistance requested regarding food ration distribution, FPS shop allotment, or PDS card updates.",
      bg: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
      icon: "📑"
    },
    {
      id: "rev_cert",
      title: "🏠 Civic Certificate & Property",
      titleHi: "🏠 नागरिक प्रमाण पत्र / कर",
      titleTa: "🏠 சான்றிதழ் & சொத்து வரி",
      department: "Revenue Department",
      priority: "Low",
      defaultText: "Query or complaint regarding local civic certificates, revenue records, or property tax processing.",
      bg: "linear-gradient(135deg, #9333ea 0%, #7e22ce 100%)",
      icon: "🏠"
    }
  ];

  const handleSubmit = async (cat) => {
    try {
      setLoading(true);
      const complaintId = "GRV" + Date.now();
      const title = `${cat.department} Express Application`;
      const description = `${cat.defaultText} Location: ${location || "Ward Area (Near Residence)"}. Language: ${language}.`;

      const res = await API.post("/complaint/create", {
        title,
        description,
        department: cat.department,
        language,
        priority: cat.priority,
        location: location || "Ward Area",
        aiLetter: description,
        isAiGenerated: true,
        translationStatus: language.toLowerCase() !== "english" ? "Translated" : "Not Required"
      });

      alert(`✅ Grievance Registered Successfully!\nReference ID: ${res.data.complaint?.complaintId || complaintId}`);
      navigate("/mycomplaints");
    } catch (err) {
      console.error(err);
      alert("Failed to submit grievance. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const t = {
    English: {
      badge: "🖼️ Zero-Literacy Express Portal",
      title: "Select Your Problem",
      desc: "Tap any picture button below to register an official complaint instantly without typing long applications.",
      landmark: "📍 Landmark:",
      placeholder: "e.g. Near Main Market, Ward 4",
      tap: "Tap to Send"
    },
    Tamil: {
      badge: "🖼️ எழுத்தறிவற்றோருக்கான விரைவு போர்டல்",
      title: "உங்கள் சிக்கலைத் தேர்ந்தெடுக்கவும்",
      desc: "நீண்ட கடிதங்களை தட்டச்சு செய்யாமல் உடனடியாக அதிகாரப்பூர்வ புகாரைப் பதிவு செய்ய கீழே உள்ள எந்தப் படப் பொத்தானையும் தட்டவும்.",
      landmark: "📍 முக்கிய அடையாளம்:",
      placeholder: "உதாரணம்: மெயின் மார்க்கெட் அருகில், வார்டு 4",
      tap: "அனுப்ப தட்டவும்"
    },
    Hindi: {
      badge: "🖼️ निरक्षर नागरिकों के लिए एक्सप्रेस पोर्टल",
      title: "अपनी समस्या चुनें",
      desc: "बिना लंबी शिकायत लिखे तुरंत शिकायत दर्ज करने के लिए नीचे दिए गए किसी भी चित्र बटन पर टैप करें।",
      landmark: "📍 स्थान चिन्ह:",
      placeholder: "जैसे: मुख्य बाजार के पास, वार्ड 4",
      tap: "भेजने के लिए टैप करें"
    }
  }[currentLang] || {
    badge: "🖼️ Zero-Literacy Express Portal",
    title: "Select Your Problem",
    desc: "Tap any picture button below to register an official complaint instantly without typing long applications.",
    landmark: "📍 Landmark:",
    placeholder: "e.g. Near Main Market, Ward 4",
    tap: "Tap to Send"
  };

  return (
    <div>
      <Navbar />
      <div className="container" style={{ maxWidth: "900px", marginTop: "20px" }}>
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <span style={{
            fontSize: "12px",
            fontWeight: "800",
            textTransform: "uppercase",
            letterSpacing: "1px",
            backgroundColor: "rgba(249, 115, 22, 0.15)",
            color: "#f97316",
            padding: "4px 12px",
            borderRadius: "20px",
            border: "1px solid rgba(249, 115, 22, 0.3)"
          }}>
            {t.badge}
          </span>
          <h2 style={{ marginTop: "12px", marginBottom: "8px", fontSize: "28px" }}>
            {t.title}
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
            {t.desc}
          </p>
        </div>

        {/* Language Selection Bar */}
        <div style={{
          display: "flex",
          justify: "center",
          alignItems: "center",
          gap: "12px",
          marginBottom: "25px",
          backgroundColor: "var(--bg-glass)",
          padding: "12px 20px",
          borderRadius: "8px",
          border: "1px solid var(--border-light)",
          flexWrap: "wrap"
        }}>
          <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-primary)" }}>🌐 {currentLang === "Tamil" ? "மொழி" : currentLang === "Hindi" ? "भाषा" : "Language"}:</span>
          <select
            value={language}
            onChange={(e) => {
              setLanguage(e.target.value);
              localStorage.setItem("preferredLang", e.target.value);
              window.location.reload();
            }}
            style={{
              padding: "6px 12px",
              borderRadius: "6px",
              backgroundColor: "rgba(0,0,0,0.3)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-light)",
              fontSize: "13px"
            }}
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

          <span style={{ marginLeft: "15px", fontSize: "13px", fontWeight: "700", color: "var(--text-primary)" }}>{t.landmark}</span>
          <input
            type="text"
            placeholder={t.placeholder}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            style={{
              padding: "6px 12px",
              borderRadius: "6px",
              backgroundColor: "rgba(0,0,0,0.3)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-light)",
              fontSize: "13px",
              flex: 1,
              maxWidth: "250px"
            }}
          />
        </div>

        {/* Express Category Cards Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px" }}>
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => !loading && handleSubmit(cat)}
              style={{
                background: cat.bg,
                padding: "24px 20px",
                borderRadius: "12px",
                color: "#ffffff",
                cursor: loading ? "wait" : "pointer",
                boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
                transition: "transform 0.2s, boxShadow 0.2s",
                display: "flex",
                flexDirection: "column",
                justify: "space-between",
                minHeight: "160px",
                border: "1px solid rgba(255,255,255,0.2)"
              }}
            >
              <div>
                <div style={{ fontSize: "40px", marginBottom: "10px" }}>{cat.icon}</div>
                <h3 style={{ fontSize: "18px", fontWeight: "800", marginBottom: "4px", color: "#ffffff" }}>
                  {currentLang === "Tamil" ? cat.titleTa : currentLang === "Hindi" ? cat.titleHi : cat.title}
                </h3>
                <p style={{ fontSize: "13px", opacity: 0.9, fontWeight: "600" }}>
                  {currentLang === "English" ? cat.titleHi : cat.title}
                </p>
              </div>
              <div style={{
                marginTop: "15px",
                paddingTop: "10px",
                borderTop: "1px solid rgba(255,255,255,0.3)",
                display: "flex",
                justify: "space-between",
                alignItems: "center",
                fontSize: "12px",
                fontWeight: "700"
              }}>
                <span>{currentLang === "Tamil" ? (cat.department === "Water Supply Department" ? "நீர் விநியோகத் துறை" : cat.department === "Electricity Department" ? "மின்சாரத் துறை" : cat.department === "Sanitation Department" ? "சுகாதாரத் துறை" : cat.department === "Road and Transport Department" ? "சாலை மற்றும் போக்குவரத்துத் துறை" : cat.department === "Health Department" ? "சுகாதாரத் துறை" : "வருவாய்த் துறை") : currentLang === "Hindi" ? (cat.department === "Water Supply Department" ? "जल आपूर्ति विभाग" : cat.department === "Electricity Department" ? "बिजली विभाग" : cat.department === "Sanitation Department" ? "स्वच्छता विभाग" : cat.department === "Road and Transport Department" ? "सड़क और परिवहन विभाग" : cat.department === "Health Department" ? "स्वास्थ्य विभाग" : "राजस्व विभाग") : cat.department}</span>
                <span style={{ backgroundColor: "rgba(255,255,255,0.25)", padding: "4px 10px", borderRadius: "12px" }}>
                  {loading ? (currentLang === "Tamil" ? "பதிவு செய்கிறது..." : currentLang === "Hindi" ? "दर्ज किया जा रहा है..." : "Registering...") : `${t.tap} ➔`}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
