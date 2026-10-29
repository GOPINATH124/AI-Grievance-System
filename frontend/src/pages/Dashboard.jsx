import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import API from "../api/api";
import Navbar from "../components/Navbar";

const dashboardTranslations = {
  English: {
    welcome: "Welcome Back",
    subtext: "LokSeva AI portal helps you register grievances in your preferred language and forwards them to corresponding government departments.",
    tourBtn: "📖 Take Quick Tour / Learn How to Use",
    langBadge: "Language",
    totalGrievances: "Total Grievances Filed",
    pendingRedressal: "Pending Redressal",
    solvedResolved: "Solved / Resolved",
    updatesTitle: "Redressal Updates",
    markAllRead: "Mark all as read",
    processTitle: "💡 Easy 3-Step Process (For New Users)",
    processSub: "If you do not know how to register your complaint, follow these steps:",
    step1Title: "1. Go to AI Chat",
    step1Desc: "Click the 'AI Chat Assistant' card below. It is like chatting on WhatsApp!",
    step2Title: "2. Speak in Your Language",
    step2Desc: "Tap the microphone 🎙️ or write your problem in Hindi, Tamil, Telugu, etc.",
    step3Title: "3. Listen & Submit",
    step3Desc: "Listen to the drafted letter 🔊, review the auto-selected department, and click 'Submit'.",
    servicesTitle: "Available Services & Accessibility Portals",
    expressTitle: "Express Picture Portal (zero-literacy)",
    expressDesc: "Tap picture icons (🚰 Water, ⚡ Wire, 🧹 Garbage, 🛣️ Road) to register grievances instantly without typing long letters.",
    proxyTitle: "Seva Kendra / Volunteer Helper Proxy",
    proxyDesc: "For citizens without smartphones. CSC agents & ward volunteers can file complaints on behalf of poor citizens.",
    aiTitle: "AI Chat Assistant",
    aiDesc: "Talk to our conversational AI assistant. Describe your problem in normal language (text/voice), and it will automatically generate a formal grievance draft.",
    ivrTitle: "Interactive Voice Bot Simulator",
    ivrDesc: "Call our simulated citizen telephone line to describe your problem on a standard phone call and register it automatically."
  },
  Tamil: {
    welcome: "மீண்டும் வருக",
    subtext: "லோக்ஸேவா AI போர்டல் உங்கள் விருப்பமான மொழியில் புகார்களைப் பதிவு செய்ய உதவுகிறது மற்றும் அவற்றை சம்பந்தப்பட்ட அரசுத் துறைகளுக்கு அனுப்புகிறது.",
    tourBtn: "📖 விரைவு வழிகாட்டி / பயன்படுத்துவது எப்படி",
    langBadge: "மொழி",
    totalGrievances: "தாக்கல் செய்யப்பட்ட மொத்த புகார்கள்",
    pendingRedressal: "நிலுவையில் உள்ள தீர்வு",
    solvedResolved: "தீர்க்கப்பட்டது / முடிவடைந்தது",
    updatesTitle: "தீர்வு அறிவிப்புகள்",
    markAllRead: "அனைத்தையும் படித்ததாகக் குறிக்கவும்",
    processTitle: "💡 எளிதான 3-படி செயல்முறை (புதிய பயனர்களுக்கு)",
    processSub: "உங்கள் புகாரை எவ்வாறு பதிவு செய்வது என்று உங்களுக்குத் தெரியாவிட்டால், இந்த படிகளைப் பின்பற்றவும்:",
    step1Title: "1. AI அரட்டைக்குச் செல்லவும்",
    step1Desc: "கீழே உள்ள 'AI அரட்டை உதவியாளர்' கார்டைக் கிளிக் செய்யவும். இது வாட்ஸ்அப்பில் அரட்டை அடிப்பது போன்றது!",
    step2Title: "2. உங்கள் மொழியில் பேசுங்கள்",
    step2Desc: "மைக்ரோஃபோனைத் தட்டவும் 🎙️ அல்லது உங்கள் சிக்கலை தமிழ், இந்தி, ஆங்கிலம் போன்றவற்றில் எழுதவும்.",
    step3Title: "3. கேளுங்கள் & சமர்ப்பிக்கவும்",
    step3Desc: "வரைவுக் கடிதத்தைக் கேளுங்கள் 🔊, தானாகத் தேர்ந்தெடுக்கப்பட்ட துறையை மதிப்பாய்வு செய்து, 'சமர்ப்பி' என்பதைக் கிளிக் செய்யவும்.",
    servicesTitle: "கிடைக்கும் சேவைகள் & அணுகல் இணையதளங்கள்",
    expressTitle: "விரைவு பட போர்டல் (எழுத்தறிவற்றவர்களுக்கானது)",
    expressDesc: "நீண்ட கடிதங்களை தட்டச்சு செய்யாமல் உடனடியாக குறைகளை பதிவு செய்ய பட ஐகான்களைத் தட்டவும் (🚰 தண்ணீர், ⚡ மின்சாரம், 🧹 குப்பை, 🛣️ சாலை).",
    proxyTitle: "சேவா கேந்திரா / தன்னார்வலர் உதவியாளர் பதிலி",
    proxyDesc: "ஸ்மார்ட்போன்கள் இல்லாத குடிமக்களுக்கு. சிஎஸ்சி முகவர்கள் மற்றும் வார்டு தன்னார்வலர்கள் ஏழை குடிமக்கள் சார்பாக புகார்களை தாக்கல் செய்யலாம்.",
    aiTitle: "AI அரட்டை உதவியாளர்",
    aiDesc: "எங்கள் உரையாடல் AI உதவியாளருடன் பேசுங்கள். உங்கள் சிக்கலை சாதாரண மொழியில் (உரை/குரல்) விளக்குங்கள், அது தானாகவே ஒரு முறையான குறை வரைவை உருவாக்கும்.",
    ivrTitle: "ஊடாடும் குரல் போட் சிமுலேட்டர்",
    ivrDesc: "செயலாக்க தொலைபேசி அழைப்பில் உங்கள் சிக்கலை விளக்கி தானாகவே பதிவு செய்ய எங்கள் சிமுலேட்டட் குடிமக்கள் தொலைபேசி லைனை அழைக்கவும்."
  },
  Hindi: {
    welcome: "स्वागत है",
    subtext: "लोकसेवा AI पोर्टल आपको अपनी पसंदीदा भाषा में शिकायतें दर्ज करने में मदद करता है और उन्हें संबंधित सरकारी विभागों को भेजता है।",
    tourBtn: "📖 त्वरित मार्गदर्शिका / उपयोग कैसे करें जानें",
    langBadge: "भाषा",
    totalGrievances: "दर्ज की गई कुल शिकायतें",
    pendingRedressal: "लंबित समाधान",
    solvedResolved: "समाधान / हल किया गया",
    updatesTitle: "निवारण अपडेट",
    markAllRead: "सभी को पढ़ा हुआ चिह्नित करें",
    processTitle: "💡 आसान 3-चरण प्रक्रिया (नए उपयोगकर्ताओं के लिए)",
    processSub: "यदि आप अपनी शिकायत दर्ज करना नहीं जानते हैं, तो इन चरणों का पालन करें:",
    step1Title: "1. AI चैट पर जाएं",
    step1Desc: "नीचे दिए गए 'AI चैट असिस्टेंट' कार्ड पर क्लिक करें। यह व्हाट्सएप पर चैट करने जैसा है!",
    step2Title: "2. अपनी भाषा में बोलें",
    step2Desc: "माइक्रोफ़ोन 🎙️ टैप करें या अपनी समस्या हिंदी, तमिल, अंग्रेजी आदि में लिखें।",
    step3Title: "3. सुनें और सबमिट करें",
    step3Desc: "तैयार पत्र को सुनें 🔊, स्वतः चयनित विभाग की समीक्षा करें, और 'सबमिट' पर क्लिक करें।",
    servicesTitle: "उपलब्ध सेवाएँ और पहुँच पोर्टल",
    expressTitle: "एक्सप्रेस पिक्चर पोर्टल (निरक्षर नागरिकों के लिए)",
    expressDesc: "बिना लंबे पत्र लिखे तुरंत शिकायतें दर्ज करने के लिए चित्र आइकन (🚰 पानी, ⚡ बिजली, 🧹 कचरा, 🛣️ सड़क) पर टैप करें।",
    proxyTitle: "सेवा केंद्र / स्वयंसेवक सहायक प्रॉक्सी",
    proxyDesc: "बिना स्मार्टफोन वाले नागरिकों के लिए। सीएससी एजेंट और वार्ड स्वयंसेवक गरीब नागरिकों की ओर से शिकायतें दर्ज कर सकते हैं।",
    aiTitle: "AI चैट असिस्टेंट",
    aiDesc: "हमारे संवादात्मक AI सहायक से बात करें। अपनी समस्या को सामान्य भाषा (पाठ/आवाज) में समझाएं, और यह स्वचालित रूप से एक औपचारिक शिकायत मसौदा तैयार कर देगा।",
    ivrTitle: "इंटरएक्टिव वॉयस बॉट सिम्युलेटर",
    ivrDesc: "मानक फोन कॉल पर अपनी समस्या का वर्णन करने और इसे स्वचालित रूप से दर्ज करने के लिए हमारी सिम्युलेटेड नागरिक टेलीफोन लाइन पर कॉल करें।"
  }
};

var styles;

export default function Dashboard() {
  const navigate = useNavigate();
  const { user: clerkUser } = useUser();
  const currentLang = localStorage.getItem("preferredLang") || "English";
  const dt = dashboardTranslations[currentLang] || dashboardTranslations["English"];
  const userStr = localStorage.getItem("user");
  const user = (userStr && userStr !== "undefined") ? JSON.parse(userStr) : null;
  const displayName = clerkUser?.fullName || clerkUser?.firstName || (user?.name && !user.name.startsWith("clerk_") ? user.name : null) || "Citizen";

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    solved: 0
  });
  const [loading, setLoading] = useState(true);
  const [showTour, setShowTour] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await API.get("/complaint/my");
        const list = res.data;
        const s = { total: list.length, pending: 0, solved: 0 };
        list.forEach(item => {
          const status = (item.status || "").toLowerCase();
          if (status === "pending") {
            s.pending++;
          } else if (status === "completed" || status === "solved") {
            s.solved++;
          } else {
            s.pending++;
          }
        });
        setStats(s);
      } catch (error) {
        console.error("Failed to load dashboard metrics", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchNotifications = async () => {
      try {
        const res = await API.get("/complaint/notifications");
        setNotifications(res.data);
        setUnreadCount(res.data.filter(n => !n.read).length);
      } catch (error) {
        console.error("Failed to load notifications", error);
      }
    };

    fetchComplaints();
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async () => {
    try {
      await API.put("/complaint/notifications/read");
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error("Failed to mark notifications as read", error);
    }
  };

  const tourSlides = [
    {
      title: "👋 Welcome to LokSeva AI Portal",
      description: "This portal is specially designed for common citizens to resolve local problems easily. No complex forms or English-writing skills are required! Let's show you how it works in 1 minute.",
      icon: "🏛️",
      tip: "💡 Tip: You can access this portal on mobile phones as well as computers."
    },
    {
      title: "🗣️ Step 1: Choose Your Mother Tongue",
      description: "You don't need to translate anything. Simply select your native language (Hindi, Tamil, Telugu, Kannada, Marathi, Gujarati, Bengali, or English) on the dashboard or chat screen.",
      icon: "🗣️",
      tip: "💡 Tip: The system will automatically understand your selected regional language."
    },
    {
      title: "🎙️ Step 2: Speak or Type Naturally",
      description: "Click on 'AI Chat Assistant' and speak your problem naturally by clicking the microphone button 🎙️, or type it out in normal everyday words (e.g. 'Street light is broken near the school').",
      icon: "💬",
      tip: "💡 Tip: Talk like you are explaining the problem to a neighbor."
    },
    {
      title: "📝 Step 3: AI Drafts & Forwards Letter",
      description: "The AI automatically translates your complaint, selects the correct government department, writes a formal application, and reads it aloud 🔊. Just click 'Submit' to register it!",
      icon: "🤖",
      tip: "💡 Tip: You can review and edit any details before submitting."
    },
    {
      title: "🔍 Step 4: Track Progress & Responses",
      description: "Go to 'My Grievances' or 'Track Status' to see the timeline of your application. Read official status updates, assigned officers, and resolution notes directly.",
      icon: "📈",
      tip: "💡 Tip: You will get a unique tracking ID (like GRV1782...) for every complaint."
    }
  ];

  return (
    <div>
      <Navbar />
      <div className="container">

        {/* Welcome Header */}
        <div style={styles.welcomeBanner}>
          <div style={{ flex: 1, minWidth: "300px" }}>
            <h1 style={{ marginBottom: "8px" }}>{dt.welcome}, {displayName}</h1>
            <p style={{ margin: 0, color: "var(--text-secondary)", lineHeight: "1.6" }}>
              {dt.subtext}
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            <button 
              onClick={() => { setTourStep(0); setShowTour(true); }}
              style={styles.tourBtn}
            >
              {dt.tourBtn}
            </button>
            <span style={styles.langBadge}>🗣️ {dt.langBadge}: {currentLang}</span>
          </div>
        </div>

        {/* Interactive Tour Modal */}
        {showTour && (
          <div style={styles.modalOverlay}>
            <div style={styles.modalCard}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-light)", paddingBottom: "15px", marginBottom: "20px" }}>
                <h3 style={{ margin: 0, color: "var(--color-primary)" }}>
                  {tourSlides[tourStep].icon} LokSeva Portal Guide ({tourStep + 1}/{tourSlides.length})
                </h3>
                <button 
                  onClick={() => setShowTour(false)} 
                  style={{ background: "transparent", border: "none", color: "var(--text-secondary)", fontSize: "20px", cursor: "pointer", padding: "0 5px" }}
                >
                  ✕
                </button>
              </div>

              <div style={{ textAlign: "center", padding: "10px 0 20px 0" }}>
                <div style={{ fontSize: "50px", marginBottom: "15px", animation: "bounce 2s infinite" }}>{tourSlides[tourStep].icon}</div>
                <h2 style={{ fontSize: "22px", marginBottom: "12px", color: "var(--text-primary)" }}>{tourSlides[tourStep].title}</h2>
                <p style={{ fontSize: "16px", color: "var(--text-secondary)", lineHeight: "1.7", maxWidth: "550px", margin: "0 auto 15px auto" }}>
                  {tourSlides[tourStep].description}
                </p>
                <div style={styles.tipBox}>
                  {tourSlides[tourStep].tip}
                </div>
              </div>

              {/* Progress Dots */}
              <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "25px" }}>
                {tourSlides.map((_, i) => (
                  <div 
                    key={i} 
                    style={{
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      backgroundColor: i === tourStep ? "var(--color-primary)" : "var(--bg-tertiary)",
                      transition: "all 0.3s ease"
                    }}
                  />
                ))}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", gap: "10px" }}>
                <button 
                  className="btn-secondary" 
                  onClick={() => setShowTour(false)}
                  style={{ flex: 1 }}
                >
                  Skip Guide
                </button>
                <div style={{ display: "flex", gap: "10px", flex: 2 }}>
                  <button 
                    className="btn-secondary" 
                    disabled={tourStep === 0}
                    onClick={() => setTourStep(prev => prev - 1)}
                    style={{ flex: 1 }}
                  >
                    ⬅️ Back
                  </button>
                  {tourStep < tourSlides.length - 1 ? (
                    <button 
                      onClick={() => setTourStep(prev => prev + 1)}
                      style={{ flex: 2 }}
                    >
                      Next Step ➡️
                    </button>
                  ) : (
                    <button 
                      onClick={() => setShowTour(false)}
                      style={{ flex: 2, background: "linear-gradient(135deg, #10b981 0%, #059669 100%)" }}
                    >
                      🎉 Finish & Start
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notification Board */}
        {notifications.length > 0 && (
          <div className="card" style={{ marginBottom: "30px", padding: "24px 30px", borderLeft: unreadCount > 0 ? "4px solid var(--color-primary)" : "1px solid var(--border-light)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
              <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
                🔔 {dt.updatesTitle} {unreadCount > 0 && <span style={{ fontSize: "11px", background: "var(--color-primary)", color: "#fff", padding: "2px 8px", borderRadius: "9999px" }}>{unreadCount} {currentLang === "Tamil" ? "புதியவை" : currentLang === "Hindi" ? "नए" : "New"}</span>}
              </h3>
              {unreadCount > 0 && (
                <button 
                  onClick={handleMarkAsRead} 
                  className="btn-secondary" 
                  style={{ margin: 0, padding: "4px 12px", fontSize: "12px" }}
                >
                  {dt.markAllRead}
                </button>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "200px", overflowY: "auto", paddingRight: "10px" }}>
              {notifications.map((notif) => (
                <div key={notif._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", backgroundColor: notif.read ? "rgba(255, 255, 255, 0.02)" : "rgba(249, 115, 22, 0.08)", border: "1px solid var(--border-light)", borderRadius: "8px" }}>
                  <div>
                    <span style={{ fontWeight: "700", marginRight: "10px", color: notif.read ? "var(--text-secondary)" : "var(--color-primary)" }}>{notif.complaintId}</span>
                    <span style={{ fontSize: "14px", color: "var(--text-primary)" }}>{notif.message}</span>
                  </div>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{new Date(notif.createdAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats Section */}
        <h3 style={{ marginBottom: "20px" }}>{dt.totalGrievances}</h3>
        <div className="grid-3" style={{ marginBottom: "30px" }}>
          <div className="card" style={styles.statCard}>
            <span style={{ fontSize: "14px", color: "var(--text-secondary)", fontWeight: "600" }}>{dt.totalGrievances}</span>
            <span style={{ fontSize: "36px", fontWeight: "800", color: "var(--text-primary)", marginTop: "10px" }}>
              {loading ? "..." : stats.total}
            </span>
          </div>
          <div className="card" style={{ ...styles.statCard, borderLeft: "4px solid var(--color-pending)" }}>
            <span style={{ fontSize: "14px", color: "var(--text-secondary)", fontWeight: "600" }}>{dt.pendingRedressal}</span>
            <span style={{ fontSize: "36px", fontWeight: "800", color: "var(--color-pending)", marginTop: "10px" }}>
              {loading ? "..." : stats.pending}
            </span>
          </div>
          <div className="card" style={{ ...styles.statCard, borderLeft: "4px solid var(--color-completed)" }}>
            <span style={{ fontSize: "14px", color: "var(--text-secondary)", fontWeight: "600" }}>{dt.solvedResolved}</span>
            <span style={{ fontSize: "36px", fontWeight: "800", color: "var(--color-completed)", marginTop: "10px" }}>
              {loading ? "..." : stats.solved}
            </span>
          </div>
        </div>

        {/* Permanent Quick Guide Section */}
        <div className="card" style={styles.quickGuideContainer}>
          <h3 style={{ margin: "0 0 10px 0", color: "var(--color-accent)", display: "flex", alignItems: "center", gap: "8px" }}>
            {dt.processTitle}
          </h3>
          <p style={{ margin: "0 0 20px 0", fontSize: "14px", color: "var(--text-secondary)" }}>
            {dt.processSub}
          </p>
          <div style={styles.stepsGrid}>
            <div style={styles.stepItem}>
              <div style={styles.stepNumber}>1</div>
              <h4 style={{ margin: "0 0 5px 0" }}>{dt.step1Title}</h4>
              <p style={{ margin: 0, fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                {dt.step1Desc}
              </p>
            </div>
            <div style={styles.stepItem}>
              <div style={styles.stepNumber}>2</div>
              <h4 style={{ margin: "0 0 5px 0" }}>{dt.step2Title}</h4>
              <p style={{ margin: 0, fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                {dt.step2Desc}
              </p>
            </div>
            <div style={styles.stepItem}>
              <div style={styles.stepNumber}>3</div>
              <h4 style={{ margin: "0 0 5px 0" }}>{dt.step3Title}</h4>
              <p style={{ margin: 0, fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                {dt.step3Desc}
              </p>
            </div>
          </div>
        </div>

        {/* Dedicated Full-Width Video Guide Section */}
        <div className="card" style={{ ...styles.quickGuideContainer, marginBottom: "40px" }}>
          <h3 style={{ margin: "0 0 10px 0", color: "var(--color-accent)", display: "flex", alignItems: "center", gap: "8px" }}>
            🎥 {currentLang === "Tamil" ? "குடிமகன் வீடியோ வழிகாட்டி (Watch Video Guide)" : currentLang === "Hindi" ? "वीडियो सहायता मार्गदर्शिका (Watch Video Guide)" : "Citizen Video Walkthrough Guide"}
          </h3>
          <p style={{ margin: "0 0 20px 0", fontSize: "14px", color: "var(--text-secondary)", lineHeight: "1.6" }}>
            {currentLang === "Tamil" 
              ? "புதிதாக புகாரை பதிவு செய்வது மற்றும் அதன் நிலையை கண்காணிப்பது எப்படி என்பதை அறிய இந்த வீடியோவை பார்க்கவும்."
              : currentLang === "Hindi"
              ? "नई शिकायत दर्ज करने और उसकी स्थिति को ट्रैक करने के बारे में जानने के लिए इस ट्यूटोरियल वीडियो को देखें।"
              : "Watch this tutorial video to learn how to register new grievances and monitor redressal statuses online."
            }
          </p>
          <div style={styles.fullWidthVideoWrapper}>
            <video 
              controls 
              src="https://vjs.zencdn.net/v/oceans.mp4" 
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                objectFit: "contain",
                backgroundColor: "#000000"
              }}
              poster="https://images.unsplash.com/photo-1531206715517-5c0ba140e2b8?auto=format&fit=crop&w=1200&q=80"
            />
          </div>
        </div>

        {/* Quick Action Navigation Grid */}
        <h3 style={{ marginBottom: "20px" }}>Available Services & Accessibility Portals</h3>
        <div className="grid-2" style={{ marginBottom: "30px" }}>
          <div className="card" style={{ ...styles.actionCard, borderLeft: "4px solid #10b981" }} onClick={() => navigate("/proxy")}>
            <div style={{ ...styles.iconContainer, backgroundColor: "rgba(16, 185, 129, 0.15)", color: "#34d399" }}>🏬</div>
            <div>
              <h4 style={{ color: "#34d399" }}>{dt.proxyTitle}</h4>
              <p style={{ margin: "5px 0 0 0", fontSize: "14px", color: "var(--text-secondary)" }}>
                {dt.proxyDesc}
              </p>
            </div>
          </div>

          <div className="card" style={styles.actionCard} onClick={() => navigate("/ai")}>
            <div style={styles.iconContainer}>✨</div>
            <div>
              <h4>{dt.aiTitle}</h4>
              <p style={{ margin: "5px 0 0 0", fontSize: "14px", color: "var(--text-secondary)" }}>
                {dt.aiDesc}
              </p>
            </div>
          </div>

          <div className="card" style={styles.actionCard} onClick={() => navigate("/mycomplaints")}>
            <div style={styles.iconContainer}>📂</div>
            <div>
              <h4>{currentLang === "Tamil" ? "எனது புகார்கள்" : currentLang === "Hindi" ? "मेरी शिकायतें" : "My Grievances"}</h4>
              <p style={{ margin: "5px 0 0 0", fontSize: "14px", color: "var(--text-secondary)" }}>
                {currentLang === "Tamil" ? "உங்கள் புகார்கள், துறைகள் மற்றும் தீர்வுகளை ஆராயுங்கள்." : currentLang === "Hindi" ? "अपनी शिकायतों, विभागों और समाधानों को ब्राउज़ करें।" : "Browse all your submitted grievances, review identified departments, assigned officers, and check official replies."}
              </p>
            </div>
          </div>

          <div className="card" style={styles.actionCard} onClick={() => navigate("/track")}>
            <div style={styles.iconContainer}>🔍</div>
            <div>
              <h4>{currentLang === "Tamil" ? "குறை தீர்க்கும் நிலையை அறிதல்" : currentLang === "Hindi" ? "शिकायत की स्थिति" : "Track Complaint Status"}</h4>
              <p style={{ margin: "5px 0 0 0", fontSize: "14px", color: "var(--text-secondary)" }}>
                {currentLang === "Tamil" ? "உங்கள் புகாரின் செயலாக்க காலவரிசையை உடனடியாக சரிபார்க்கவும்." : currentLang === "Hindi" ? "त्वरित रूप से अपनी शिकायत की प्रसंस्करण समयसीमा की जांच करें।" : "Instantly check the processing timeline of your grievance. Monitor assignment status and review officer actions."}
              </p>
            </div>
          </div>

          <div className="card" style={styles.actionCard} onClick={() => navigate("/create")}>
            <div style={styles.iconContainer}>📝</div>
            <div>
              <h4>{currentLang === "Tamil" ? "கைமுறையாக புகார் எழுதுங்கள்" : currentLang === "Hindi" ? "मैन्युअल शिकायत दर्ज करें" : "Create Manual Complaint"}</h4>
              <p style={{ margin: "5px 0 0 0", fontSize: "14px", color: "var(--text-secondary)" }}>
                {currentLang === "Tamil" ? "புகாரை கைமுறையாக வரைந்து நேரடியாக சமர்ப்பிக்கவும்." : currentLang === "Hindi" ? "अपनी शिकायत मैन्युअल रूप से लिखें और सीधे जमा करें।" : "Draft your grievance manually. Fill out the form with custom titles and detailed descriptions to submit a complaint letter directly."}
              </p>
            </div>
          </div>
        </div>

        {/* Offline SMS Helpline & Missed Call Support Banner */}
        <div className="card" style={{ padding: "24px 30px", background: "linear-gradient(135deg, rgba(124, 58, 237, 0.15) 0%, rgba(109, 40, 217, 0.1) 100%)", border: "1px solid rgba(124, 58, 237, 0.3)", borderRadius: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
            <span style={{ fontSize: "28px" }}>📶</span>
            <div>
              <h3 style={{ margin: 0, color: "#a78bfa" }}>Offline SMS Helpline & Missed Call Portal</h3>
              <p style={{ margin: "2px 0 0 0", fontSize: "13px", color: "var(--text-secondary)" }}>For citizens with basic feature phones or zero mobile data connectivity.</p>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "15px", marginTop: "15px" }}>
            <div style={{ backgroundColor: "rgba(0,0,0,0.3)", padding: "14px 18px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <span style={{ fontSize: "12px", color: "#a78bfa", fontWeight: "700", textTransform: "uppercase" }}>📞 Toll-Free IVR Voice Bot</span>
                <h4 style={{ margin: "4px 0 2px 0", fontSize: "20px", color: "#ffffff" }}>1800-123-LOKSEVA</h4>
                <p style={{ margin: "0 0 12px 0", fontSize: "12px", color: "var(--text-muted)" }}>Call our automated AI voice agent to register complaints over phone.</p>
              </div>
              <button
                onClick={() => navigate("/ivr-call")}
                style={{ backgroundColor: "#7c3aed", color: "#ffffff", border: "none", padding: "6px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: "700", cursor: "pointer", alignSelf: "flex-start" }}
              >
                📞 Launch Phone Call Bot Simulator ➔
              </button>
            </div>
            <div style={{ backgroundColor: "rgba(0,0,0,0.3)", padding: "14px 18px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)" }}>
              <span style={{ fontSize: "12px", color: "#a78bfa", fontWeight: "700", textTransform: "uppercase" }}>💬 SMS Registration Shortcode</span>
              <h4 style={{ margin: "4px 0 2px 0", fontSize: "20px", color: "#ffffff" }}>SMS 'GRV [Issue] [Ward]' to 56161</h4>
              <p style={{ margin: 0, fontSize: "12px", color: "var(--text-muted)" }}>Example: Send <code>WATER Ward 4 leakage</code> to register instantly.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

styles = {
  welcomeBanner: {
    background: "linear-gradient(135deg, rgba(249, 115, 22, 0.1) 0%, rgba(245, 158, 11, 0.08) 100%)",
    border: "1px solid rgba(249, 115, 22, 0.2)",
    borderRadius: "12px",
    padding: "30px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "20px",
    marginBottom: "40px"
  },
  badgeContainer: {
    display: "flex",
    alignItems: "center",
  },
  langBadge: {
    background: "rgba(249, 115, 22, 0.15)",
    color: "#fdba74",
    border: "1px solid rgba(249, 115, 22, 0.3)",
    padding: "8px 16px",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "14px",
  },
  tourBtn: {
    background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)",
    border: "none",
    color: "#ffffff",
    padding: "10px 18px",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer",
    boxShadow: "0 4px 10px rgba(249, 115, 22, 0.2)",
    transition: "transform 0.2s ease"
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    backdropFilter: "blur(5px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    padding: "20px"
  },
  modalCard: {
    background: "var(--bg-secondary)",
    border: "1px solid var(--border-light)",
    borderRadius: "16px",
    maxWidth: "650px",
    width: "100%",
    padding: "30px",
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.5), var(--shadow-glow)",
    animation: "fadeIn 0.3s ease"
  },
  tipBox: {
    backgroundColor: "rgba(249, 115, 22, 0.08)",
    border: "1px dashed rgba(249, 115, 22, 0.25)",
    borderRadius: "8px",
    padding: "12px 16px",
    fontSize: "14px",
    color: "var(--text-secondary)",
    display: "inline-block",
    textAlign: "left"
  },
  quickGuideContainer: {
    background: "rgba(255, 255, 255, 0.01)",
    border: "1px solid var(--border-light)",
    borderRadius: "12px",
    padding: "25px",
    marginBottom: "40px"
  },
  fullWidthVideoWrapper: {
    width: "100%",
    position: "relative",
    paddingBottom: "56.25%", /* 16:9 Aspect Ratio */
    height: 0,
    borderRadius: "12px",
    overflow: "hidden",
    border: "1px solid var(--border-light)",
    backgroundColor: "#000000"
  },
  stepsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "24px"
  },
  stepItem: {
    position: "relative",
    paddingLeft: "50px"
  },
  stepNumber: {
    position: "absolute",
    left: 0,
    top: 0,
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, rgba(249, 115, 22, 0.2) 0%, rgba(245, 158, 11, 0.15) 100%)",
    border: "2px solid var(--color-primary)",
    color: "var(--color-primary)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
    fontSize: "16px"
  },
  statCard: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: "24px 30px",
    marginBottom: 0,
  },
  actionCard: {
    display: "flex",
    gap: "20px",
    cursor: "pointer",
    alignItems: "flex-start",
    marginBottom: 0,
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
  },
  iconContainer: {
    fontSize: "30px",
    background: "rgba(255, 255, 255, 0.05)",
    width: "60px",
    height: "60px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0
  }
};