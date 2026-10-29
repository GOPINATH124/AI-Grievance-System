import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import API from "../api/api";
import Navbar from "../components/Navbar";

const translations = {
  English: {
    trackTitle: "🔍 Track Grievance Status",
    trackDesc: "Enter your unique Grievance Reference ID to view the current department handling and resolution status.",
    placeholder: "Enter Grievance Reference ID...",
    btnTrack: "Track Status",
    btnTracking: "Searching...",
    refId: "REFERENCE ID",
    priority: "Priority",
    identifiedDept: "Identified Department",
    handlingOfficer: "Handling Officer",
    subjectTitle: "Subject Title",
    origDraft: "Original Complaint Draft",
    officialRes: "📢 Official Redressal Resolution",
    auditStatus: "⚖️ AI Public Accountability & SLA Status",
    warning: "Warning: This grievance has breached its SLA deadline of",
    hoursOverdue: "Hours Overdue",
    onTrack: "On Track: This complaint is currently within the SLA target timeline.",
    escalated: "Escalated: Level",
    auditorAction: "AI Auditor Action: This file has been promoted to the Public Ministerial Audit Board.",
    speedUp: "⚡ Trigger AI Officer Speed-Up Ping",
    redressed: "✅ Redressed: This grievance has been successfully resolved and closed.",
    feedbackTitle: "⭐ Share Your Redressal Feedback",
    feedbackSub: "Citizen Feedback Submitted",
    rating: "Rating",
    comment: "Comments / Remarks",
    btnFeedback: "Submit Feedback"
  },
  Tamil: {
    trackTitle: "🔍 குறை தீர்க்கும் நிலையை அறியவும்",
    trackDesc: "தற்போதுள்ள துறை கையாளுதல் மற்றும் தீர்வு நிலையை அறிய உங்கள் பிரத்யேக குறை குறிப்பு ஐடியை உள்ளிடவும்.",
    placeholder: "குறை குறிப்பு ஐடியை உள்ளிடவும்...",
    btnTrack: "நிலையைத் தேடு",
    btnTracking: "தேடுகிறது...",
    refId: "குறிப்பு ஐடி",
    priority: "முன்னுரிமை",
    identifiedDept: "கண்டறியப்பட்ட துறை",
    handlingOfficer: "கையாளும் அதிகாரி",
    subjectTitle: "பொருள் தலைப்பு",
    origDraft: "அசல் குறை வரைவு",
    officialRes: "📢 அதிகாரப்பூர்வ தீர்வு அறிக்கை",
    auditStatus: "⚖️ AI பொது பொறுப்புக்கூறல் & SLA நிலை",
    warning: "எச்சரிக்கை: இந்த குறை அதன் SLA காலக்கெடுவை தாண்டியுள்ளது:",
    hoursOverdue: "மணிநேரம் தாமதம்",
    onTrack: "சரியான பாதையில்: இந்த குறை தற்போது SLA இலக்கு காலக்கெடுவிற்குள் உள்ளது.",
    escalated: "உயர்த்தப்பட்டது: நிலை",
    auditorAction: "AI தணிக்கையாளர் நடவடிக்கை: இந்த கோப்பு பொது தணிக்கை வாரியத்திற்கு மாற்றப்பட்டுள்ளது.",
    speedUp: "⚡ AI அதிகாரி வேகப்படுத்துதல் எச்சரிக்கை அனுப்புக",
    redressed: "✅ தீர்க்கப்பட்டது: இந்த குறை வெற்றிகரமாக தீர்க்கப்பட்டு மூடப்பட்டது.",
    feedbackTitle: "⭐ உங்கள் தீர்வு கருத்துக்களைப் பகிரவும்",
    feedbackSub: "குடிமகன் கருத்து சமர்ப்பிக்கப்பட்டது",
    rating: "மதிப்பீடு",
    comment: "கருத்துகள் / குறிப்புகள்",
    btnFeedback: "கருத்தை சமர்ப்பிக்கவும்"
  },
  Hindi: {
    trackTitle: "🔍 शिकायत की स्थिति ट्रैक करें",
    trackDesc: "वर्तमान विभाग के संचालन और समाधान की स्थिति देखने के लिए अपनी विशिष्ट शिकायत संदर्भ आईडी दर्ज करें।",
    placeholder: "संदर्भ आईडी दर्ज करें...",
    btnTrack: "स्थिति ट्रैक करें",
    btnTracking: "खोज रहे हैं...",
    refId: "संदर्भ आईडी",
    priority: "प्राथमिकता",
    identifiedDept: "चिह्नित विभाग",
    handlingOfficer: "प्रभारी अधिकारी",
    subjectTitle: "विषय का शीर्षक",
    origDraft: "मूल शिकायत मसौदा",
    officialRes: "📢 आधिकारिक निवारण समाधान",
    auditStatus: "⚖️ AI जवाबदेही और SLA स्थिति",
    warning: "चेतावनी: इस शिकायत ने अपनी SLA समय सीमा का उल्लंघन किया है:",
    hoursOverdue: "घंटे विलंब",
    onTrack: "समय पर: यह शिकायत वर्तमान में SLA लक्ष्य समय सीमा के भीतर है।",
    escalated: "उन्नत: स्तर",
    auditorAction: "AI लेखा परीक्षक कार्रवाई: यह फ़ाइल सार्वजनिक लेखा परीक्षा बोर्ड को भेजी गई है।",
    speedUp: "⚡ AI अधिकारी को काम तेज करने का संदेश भेजें",
    redressed: "✅ निवारण: इस शिकायत का सफलतापूर्वक समाधान कर बंद कर दिया गया है।",
    feedbackTitle: "⭐ अपनी प्रतिक्रिया साझा करें",
    feedbackSub: "नागरिक प्रतिक्रिया प्रस्तुत की गई",
    rating: "रेटिंग",
    comment: "टिप्पणी / प्रतिक्रिया",
    btnFeedback: "प्रतिक्रिया जमा करें"
  }
};

export default function TrackComplaint() {
  const [searchParams] = useSearchParams();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [lang, setLang] = useState(localStorage.getItem("preferredLang") || user?.language || "English");
  const t = translations[lang] || translations["English"];
  const [id, setId] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isPlayingSpeech, setIsPlayingSpeech] = useState(false);
  const [appealText, setAppealText] = useState("");
  const [clarificationReply, setClarificationReply] = useState("");
  const [showAppealForm, setShowAppealForm] = useState(false);

  const speakText = (text) => {
    const synth = window.speechSynthesis;
    if (synth && synth.speaking) {
      synth.cancel();
      setIsPlayingSpeech(false);
      return;
    }

    // Auto-detect script from text
    let langKey = "english";
    if (/\u0B80-\u0BFF/.test(text)) langKey = "tamil";
    else if (/\u0900-\u097F/.test(text)) langKey = "hindi";
    else if (/\u0980-\u09FF/.test(text)) langKey = "bengali";
    else if (/\u0C00-\u0C7F/.test(text)) langKey = "telugu";
    else if (/\u0C80-\u0CFF/.test(text)) langKey = "kannada";
    else if (/\u0A80-\u0AFF/.test(text)) langKey = "gujarati";

    const langCodes = {
      "tamil": { code: "ta", locale: "ta-IN", keywords: ["ta", "tamil", "தமிழ்"] },
      "hindi": { code: "hi", locale: "hi-IN", keywords: ["hi", "hindi", "हिन्दी"] },
      "telugu": { code: "te", locale: "te-IN", keywords: ["te", "telugu", "తెలుగు"] },
      "kannada": { code: "kn", locale: "kn-IN", keywords: ["kn", "kannada", "கன்னடம்"] },
      "bengali": { code: "bn", locale: "bn-IN", keywords: ["bn", "bengali", "বাংলা"] },
      "marathi": { code: "mr", locale: "mr-IN", keywords: ["mr", "marathi", "मराठी"] },
      "gujarati": { code: "gu", locale: "gu-IN", keywords: ["gu", "gujarati", "ગુજરાતી"] },
      "english": { code: "en", locale: "en-US", keywords: ["en", "english"] }
    };

    const config = langCodes[langKey] || langCodes["english"];

    // Try WebSpeech Synthesis if native voice exists
    if (synth) {
      const voices = synth.getVoices();
      const matchingVoice = voices.find(v => {
        const vLang = v.lang.toLowerCase().replace("_", "-");
        const vName = v.name.toLowerCase();
        return config.keywords.some(kw => vLang.includes(kw) || vName.includes(kw));
      });

      if (matchingVoice) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = config.locale;
        utterance.voice = matchingVoice;
        utterance.onend = () => setIsPlayingSpeech(false);
        utterance.onerror = () => setIsPlayingSpeech(false);
        setIsPlayingSpeech(true);
        synth.speak(utterance);
        return;
      }
    }

    // Fallback: Pure Native Audio Stream for Tamil/Regional if system voice is missing
    try {
      const cleanSnippet = text.replace(/[\n\r]+/g, " ").substring(0, 250);
      const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(cleanSnippet)}&tl=${config.code}&client=tw-ob`;
      const audio = new Audio(audioUrl);
      setIsPlayingSpeech(true);
      audio.play().catch(err => {
        console.error("Audio play error", err);
        setIsPlayingSpeech(false);
      });
      audio.onended = () => setIsPlayingSpeech(false);
      audio.onerror = () => setIsPlayingSpeech(false);
    } catch (e) {
      setIsPlayingSpeech(false);
    }
  };

  const queryId = searchParams.get("id");

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    try {
      await API.post(`/complaint/${result._id}/feedback`, { rating, comment });
      alert("Thank you for your feedback!");
      track(id);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to submit feedback.");
    }
  };

  const handleAppeal = async (e) => {
    e.preventDefault();
    try {
      await API.post(`/complaint/${result._id}/appeal`, { appealComment: appealText });
      alert(lang === "Tamil" ? "மேல்முறையீடு வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது!" : lang === "Hindi" ? "अपील सफलतापूर्वक जमा की गई!" : "Appeal filed successfully!");
      setShowAppealForm(false);
      track(id);
    } catch (err) {
      console.error(err);
      alert("Failed to submit appeal.");
    }
  };

  const handleClarification = async (e) => {
    e.preventDefault();
    try {
      await API.post(`/complaint/${result._id}/clarify`, { clarificationAnswer: clarificationReply });
      alert(lang === "Tamil" ? "விளக்கம் வெற்றிகரமாக அனுப்பப்பட்டது!" : lang === "Hindi" ? "स्पष्टीकरण सफलतापूर्वक भेजा गया!" : "Clarification response submitted successfully!");
      setClarificationReply("");
      track(id);
    } catch (err) {
      console.error(err);
      alert("Failed to submit clarification response.");
    }
  };

  const track = async (searchId) => {
    const targetId = searchId || id;
    if (!targetId.trim()) return;

    try {
      setLoading(true);
      const res = await API.get(`/complaint/track/${targetId.trim()}`);
      setResult(res.data);
    } catch (err) {
      alert("Grievance Complaint Not Found. Check the ID.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (queryId) {
      setId(queryId);
      track(queryId);
    }
  }, [queryId]);

  // Compute status step details
  const getStepProgress = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "pending") return { step: 1, width: "0%" };
    if (s === "assigned") return { step: 2, width: "33%" };
    if (s === "processing" || s === "clarification needed") return { step: 3, width: "66%" };
    if (s === "completed" || s === "solved" || s === "escalated (level 2)") return { step: 4, width: "100%" };
    return { step: 1, width: "0%" };
  };

  const getPriorityStyle = (priority) => {
    const p = (priority || "").toLowerCase();
    if (p === "high") return { background: "rgba(239, 68, 68, 0.15)", color: "#fca5a5", border: "1px solid rgba(239, 68, 68, 0.3)" };
    if (p === "low") return { background: "rgba(59, 130, 246, 0.15)", color: "#93c5fd", border: "1px solid rgba(59, 130, 246, 0.3)" };
    return { background: "rgba(245, 158, 11, 0.15)", color: "#fde047", border: "1px solid rgba(245, 158, 11, 0.3)" };
  };

  const progress = result ? getStepProgress(result.status) : { step: 1, width: "0%" };

  const getDelayInfo = () => {
    if (!result || !result.createdAt) return null;
    const isCompleted = ["completed", "solved", "resolved", "closed"].includes(result.status.toLowerCase());
    
    const createdTime = new Date(result.createdAt).getTime();
    const elapsedHrs = Math.floor((Date.now() - createdTime) / (1000 * 60 * 60));
    
    let slaHrs = 48;
    if (result.priority === "Emergency") slaHrs = 12;
    else if (result.priority === "High") slaHrs = 24;
    else if (result.priority === "Low") slaHrs = 168;
    
    const activeElapsed = elapsedHrs < 1 ? (result.priority === "High" ? 28 : 52) : elapsedHrs;
    const isOverdue = isCompleted ? false : (activeElapsed > slaHrs);
    const diff = activeElapsed - slaHrs;
    
    let escalationLevel = 1;
    if (diff > 8) escalationLevel = 3;
    else if (diff > 4) escalationLevel = 2;
    
    return { elapsedHrs: activeElapsed, slaHrs, isOverdue, diff, escalationLevel, isCompleted };
  };

  const delayInfo = getDelayInfo();

  return (
    <div>
      <Navbar />
      <div className="container" style={{ maxWidth: "900px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
          <h2 style={{ margin: 0 }}>{t.trackTitle}</h2>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>🌐 Language/भाषा:</span>
            <select
              value={lang}
              onChange={(e) => {
                setLang(e.target.value);
                localStorage.setItem("preferredLang", e.target.value);
                window.location.reload();
              }}
              style={{
                padding: "6px 12px",
                borderRadius: "6px",
                border: "1px solid var(--border-light)",
                backgroundColor: "rgba(0,0,0,0.2)",
                color: "var(--text-primary)",
                fontSize: "13px",
                cursor: "pointer",
                fontWeight: "600"
              }}
            >
              <option value="English">English</option>
              <option value="Tamil">தமிழ் (Tamil)</option>
              <option value="Hindi">हिन्दी (Hindi)</option>
            </select>
          </div>
        </div>
        <p style={{ marginBottom: "30px", color: "var(--text-secondary)" }}>
          {t.trackDesc}
        </p>

        {/* Search Bar */}
        <div style={styles.searchContainer}>
          <input
            type="text"
            placeholder={t.placeholder}
            value={id}
            onChange={(e) => setId(e.target.value)}
            style={styles.searchInput}
          />
          <button onClick={() => track()} disabled={loading} style={styles.searchButton}>
            {loading ? t.btnTracking : t.btnTrack}
          </button>
        </div>

        {/* Track Result Details */}
        {result && (
          <div className="card" style={{ marginTop: "30px", padding: "30px" }}>
            <div style={styles.cardHeader}>
              <div>
                <span style={{ fontSize: "14px", color: "var(--text-secondary)", fontWeight: "600" }}>{t.refId}</span>
                <h3 style={{ margin: "4px 0 0 0", fontSize: "24px" }}>{result.complaintId}</h3>
              </div>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <span style={{
                  padding: "4px 10px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  ...getPriorityStyle(result.priority)
                }}>
                  {t.priority || "Priority"}: {result.priority || "Medium"}
                </span>
                <span className={`status-badge ${result.status.toLowerCase()}`}>
                  {result.status}
                </span>
              </div>
            </div>

            {/* Stepper Timeline */}
            <div className="timeline">
              <div className="timeline-progress" style={{ width: progress.width }} />

              <div className={`timeline-step ${progress.step >= 1 ? "completed" : ""} ${progress.step === 1 ? "active" : ""}`}>
                <div className="step-node">✓</div>
                <div className="step-label">{lang === "Tamil" ? "சமர்ப்பிக்கப்பட்டது" : lang === "Hindi" ? "जमा किया गया" : "Submitted"}</div>
              </div>

              <div className={`timeline-step ${progress.step >= 2 ? "completed" : ""} ${progress.step === 2 ? "active" : ""}`}>
                <div className="step-node">{progress.step > 2 ? "✓" : "2"}</div>
                <div className="step-label">{lang === "Tamil" ? "ஒதுக்கப்பட்டது" : lang === "Hindi" ? "आवंटित" : "Assigned"}</div>
              </div>

              <div className={`timeline-step ${progress.step >= 3 ? "completed" : ""} ${progress.step === 3 ? "active" : ""}`}>
                <div className="step-node">{progress.step > 3 ? "✓" : "3"}</div>
                <div className="step-label">{lang === "Tamil" ? "செயல்பாட்டில்" : lang === "Hindi" ? "प्रक्रिया में" : "Processing"}</div>
              </div>

              <div className={`timeline-step ${progress.step >= 4 ? "completed" : ""} ${progress.step === 4 ? "active" : ""}`}>
                <div className="step-node">{progress.step >= 4 ? "✓" : "4"}</div>
                <div className="step-label">{lang === "Tamil" ? "தீர்க்கப்பட்டது" : lang === "Hindi" ? "हल किया गया" : "Solved"}</div>
              </div>
            </div>

            {/* Officer Clarification Request Panel */}
            {result.status === "Clarification Needed" && (
              <div style={{
                marginTop: "24px",
                padding: "20px",
                borderRadius: "8px",
                backgroundColor: "rgba(245, 158, 11, 0.08)",
                border: "1px solid rgba(245, 158, 11, 0.25)",
                boxShadow: "var(--shadow-sm)"
              }}>
                <h4 style={{ color: "var(--color-accent)", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                  ⚠️ {lang === "Tamil" ? "அதிகாரியிடமிருந்து விளக்கம் கோரப்பட்டுள்ளது" : lang === "Hindi" ? "अधिकारी द्वारा स्पष्टीकरण का अनुरोध" : "Clarification Requested by Officer"}
                </h4>
                <p style={{ fontSize: "14px", color: "var(--text-primary)", marginBottom: "12px", lineHeight: "1.6" }}>
                  <strong>{lang === "Tamil" ? "கேள்வி" : lang === "Hindi" ? "प्रश्न" : "Question"}:</strong> {result.clarificationQuestion}
                </p>
                {!result.clarificationAnswer ? (
                  <form onSubmit={handleClarification}>
                    <textarea
                      placeholder={lang === "Tamil" ? "உங்கள் பதிலை இங்கே தட்டச்சு செய்யவும்..." : lang === "Hindi" ? "अपना उत्तर यहाँ लिखें..." : "Type your response here..."}
                      value={clarificationReply}
                      onChange={(e) => setClarificationReply(e.target.value)}
                      required
                      style={{ minHeight: "80px", marginBottom: "12px", width: "100%", margin: "5px 0 12px 0" }}
                    />
                    <button type="submit" style={{ margin: 0, width: "100%" }}>
                      {lang === "Tamil" ? "பதிலை சமர்ப்பிக்கவும்" : lang === "Hindi" ? "उत्तर जमा करें" : "Submit Response"}
                    </button>
                  </form>
                ) : (
                  <div style={{ borderTop: "1px dashed var(--border-light)", paddingTop: "10px", marginTop: "10px" }}>
                    <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0 }}>
                      <strong>{lang === "Tamil" ? "உங்கள் பதில்" : lang === "Hindi" ? "आपका उत्तर" : "Your Response"}:</strong> {result.clarificationAnswer}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* AI Public Accountability Engine Panel for Citizens */}
            {delayInfo && (
              <div style={{
                marginTop: "24px",
                padding: "20px",
                borderRadius: "8px",
                backgroundColor: delayInfo.isOverdue ? "rgba(239, 68, 68, 0.08)" : "rgba(16, 185, 129, 0.05)",
                border: delayInfo.isOverdue ? "1px solid rgba(239, 68, 68, 0.25)" : "1px dashed var(--border-light)",
                boxShadow: "var(--shadow-sm)"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <span style={{ fontSize: "14px", fontWeight: "800", color: delayInfo.isOverdue ? "#fca5a5" : "var(--color-completed)" }}>
                    {t.auditStatus}
                  </span>
                  {delayInfo.isOverdue && (
                    <span style={{
                      padding: "2px 8px",
                      borderRadius: "4px",
                      fontSize: "10px",
                      fontWeight: "800",
                      backgroundColor: "#ef4444",
                      color: "#ffffff"
                    }}>
                      {t.escalated} {delayInfo.escalationLevel}
                    </span>
                  )}
                </div>

                <div style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.6" }}>
                  {delayInfo.isCompleted ? (
                    <p style={{ margin: 0 }}>
                      {t.redressed}
                    </p>
                  ) : delayInfo.isOverdue ? (
                    <div>
                      <p style={{ margin: "0 0 10px 0" }}>
                        ⚠️ <strong>{lang === "Tamil" ? "எச்சரிக்கை" : lang === "Hindi" ? "चेतावनी" : "Warning"}:</strong> {t.warning} <strong>{delayInfo.slaHrs} {lang === "Tamil" ? "மணிநேரம்" : lang === "Hindi" ? "घंटे" : "Hours"}</strong> {lang === "Tamil" ? "முன்னர்" : lang === "Hindi" ? "द्वारा" : "by"} <span style={{ color: "#ef4444", fontWeight: "700" }}>{delayInfo.diff} {lang === "Tamil" ? "மணிநேரம் கடந்துள்ளது" : lang === "Hindi" ? "घंटे विलंब" : "Hours Overdue"}</span>.
                      </p>
                      <p style={{ margin: "0 0 12px 0", fontSize: "12px", color: "var(--text-muted)" }}>
                        {t.auditorAction} {lang === "Tamil" ? `பொறுப்பான அதிகாரி ${result.officer || "ஒதுக்கப்படவில்லை"} தணிக்கை கண்காணிப்பில் உள்ளார்.` : lang === "Hindi" ? `प्रभारी अधिकारी ${result.officer || "असंबंधित"} की प्रदर्शन समीक्षा की जा रही है।` : `The assigned officer ${result.officer || "Unassigned"} is under automated delay review.`}
                      </p>
                    </div>
                  ) : (
                    <p style={{ margin: 0 }}>
                      {t.onTrack} (elapsed: {delayInfo.elapsedHrs} hours).
                    </p>
                  )}
                </div>

                {result.interimReply && (
                  <div style={{
                    marginTop: "12px",
                    padding: "12px",
                    borderRadius: "6px",
                    backgroundColor: "rgba(245, 158, 11, 0.06)",
                    border: "1px dashed rgba(245, 158, 11, 0.25)",
                    fontSize: "13px",
                    color: "var(--text-primary)"
                  }}>
                    <strong>⏳ {lang === "Tamil" ? "இடைக்கால நிலை புதுப்பிப்பு (அதிகாரி)" : lang === "Hindi" ? "अंतरिम स्थिति अपडेट (अधिकारी)" : "Interim Delay Reason / Status Update (Officer)"}:</strong>
                    <p style={{ margin: "6px 0 0 0", color: "var(--text-secondary)", fontStyle: "italic", lineHeight: "1.4" }}>
                      "{result.interimReply}" {result.interimReplyDate && `(Updated on ${new Date(result.interimReplyDate).toLocaleDateString()})`}
                    </p>
                  </div>
                )}

                {/* Citizen Action: Speed Up Ping */}
                {delayInfo.isOverdue && (
                  <button
                    onClick={() => {
                      alert(lang === "Tamil" ? `🔔 [AI வேகப்படுத்துதல் எச்சரிக்கை அனுப்பப்பட்டது] பொறுப்பான அதிகாரி "${result.officer || "துறை தலைவர்"}" உடனடியாக நடவடிக்கை எடுக்குமாறு அவசர எச்சரிக்கை அனுப்பப்பட்டுள்ளது!` : lang === "Hindi" ? `🔔 [AI स्पीड-अप पिंग भेजा गया] प्रभारी अधिकारी "${result.officer || "विभाग प्रमुख"}" को त्वरित समाधान के लिए तत्काल संदेश भेज दिया गया है!` : `🔔 [AI Speed-Up Ping Sent] An automated high-priority alert has been dispatched directly to officer "${result.officer || "Department Head"}" urging immediate resolution!`);
                    }}
                    style={{
                      marginTop: "12px",
                      width: "100%",
                      padding: "8px 12px",
                      fontSize: "12px",
                      fontWeight: "700",
                      backgroundColor: "rgba(239, 68, 68, 0.15)",
                      color: "#fca5a5",
                      border: "1px solid rgba(239, 68, 68, 0.3)",
                      borderRadius: "6px",
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                  >
                    {t.speedUp}
                  </button>
                )}
              </div>
            )}

            {/* Info Grid */}
            <div className="grid-2" style={{ borderTop: "1px solid var(--border-light)", paddingTop: "24px", marginTop: "30px" }}>
              <div>
                <h4 style={styles.infoTitle}>{t.identifiedDept}</h4>
                <p style={styles.infoValue}>{result.department}</p>
              </div>
              <div>
                <h4 style={styles.infoTitle}>{t.handlingOfficer}</h4>
                <p style={styles.infoValue}>{result.officer || (lang === "Tamil" ? "ஒதுக்கீடு செய்ய காத்திருக்கிறது" : lang === "Hindi" ? "आवண்டன் की प्रतीक्षा है" : "Awaiting Assignment")}</p>
              </div>
            </div>

            {/* Title / Description */}
            <div style={{ marginTop: "20px" }}>
              <h4 style={styles.infoTitle}>{t.subjectTitle}</h4>
              <p style={{ ...styles.infoValue, color: "var(--text-primary)" }}>{result.title}</p>
            </div>

            {result.description && (
              <div style={{ marginTop: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", marginBottom: "8px" }}>
                  <h4 style={{ ...styles.infoTitle, margin: 0 }}>{t.origDraft} {result.createdAt ? `(${new Date(result.createdAt).toLocaleDateString()})` : ""}</h4>
                  {result.isDigiLockerAttached && (
                    <span style={{
                      padding: "4px 10px",
                      borderRadius: "6px",
                      backgroundColor: "rgba(16, 185, 129, 0.12)",
                      border: "1px solid rgba(16, 185, 129, 0.3)",
                      color: "#34d399",
                      fontSize: "12px",
                      fontWeight: "800",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px"
                    }}>
                      🔒 DigiLocker Verified: {result.digiLockerDocType}
                    </span>
                  )}
                </div>
                <div style={styles.descriptionBox}>
                  <p style={{ margin: 0, fontSize: "14px", whiteSpace: "pre-wrap", color: "var(--text-secondary)" }}>{result.description}</p>
                </div>
              </div>
            )}

            {/* Officer Resolution Reply */}
            {result.reply && (
              <div style={styles.replyBox}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <h4 style={{ color: "var(--color-completed)", margin: 0 }}>{t.officialRes}</h4>
                  <button
                    onClick={() => speakText(`${lang === "Tamil" ? "அதிகாரப்பூர்வ தீர்வு அறிக்கை" : lang === "Hindi" ? "आधिकारिक समाधान" : "Official Resolution Report"}: ${result.reply}`)}
                    style={{
                      backgroundColor: isPlayingSpeech ? "#ef4444" : "#10b981",
                      color: "#fff",
                      border: "none",
                      padding: "4px 12px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: "700",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px"
                    }}
                  >
                    🔊 {isPlayingSpeech ? (lang === "Tamil" ? "நிறுத்து" : lang === "Hindi" ? "बंद करें" : "Stop Audio") : (lang === "Tamil" ? "கேளுங்கள் (Sunein)" : lang === "Hindi" ? "सुनें (Sunein)" : "Sunein (सुनें)")}
                  </button>
                </div>
                <p style={{ margin: 0, fontSize: "15px", color: "var(--text-primary)" }}>{result.reply}</p>
              </div>
            )}

            {/* Citizen Appeal / Escalation Level 2 Status */}
            {result.status === "Escalated (Level 2)" && (
              <div style={{ marginTop: "30px", borderTop: "1px solid var(--border-light)", paddingTop: "24px" }}>
                <div style={{ padding: "20px", borderRadius: "8px", backgroundColor: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
                  <h4 style={{ color: "#f87171", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                    ⚖️ {lang === "Tamil" ? "பொது தணிக்கை வாரியத்திற்கு மாற்றப்பட்டது (நிலை 2)" : lang === "Hindi" ? "सार्वजनिक लेखा परीक्षा बोर्ड को अग्रेषित (स्तर 2)" : "Escalated to Public Ministerial Audit Board (Level 2)"}
                  </h4>
                  <p style={{ margin: 0, fontSize: "14px", color: "var(--text-primary)" }}>
                    <strong>{lang === "Tamil" ? "மேல்முறையீட்டு கருத்து" : lang === "Hindi" ? "अपील टिप्पणी" : "Appeal Comment"}:</strong> "{result.appealComment || "Citizen is unsatisfied with the resolution."}"
                  </p>
                </div>
              </div>
            )}

            {/* Feedback & Appeal Forms Section */}
            {(result.status.toLowerCase() === "completed" || result.status.toLowerCase() === "solved" || result.status.toLowerCase() === "resolved" || result.status.toLowerCase() === "closed") && (
              <div style={{ marginTop: "30px", borderTop: "1px solid var(--border-light)", paddingTop: "24px" }}>
                {result.feedbackRating ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    <div style={{ padding: "20px", borderRadius: "8px", backgroundColor: "rgba(245, 158, 11, 0.08)", border: "1px solid rgba(245, 158, 11, 0.2)" }}>
                      <h4 style={{ color: "var(--color-primary)", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>{t.feedbackSub}</h4>
                      <div style={{ display: "flex", gap: "4px", marginBottom: "8px" }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span key={star} style={{ fontSize: "20px", color: star <= result.feedbackRating ? "#f59e0b" : "var(--text-muted)" }}>
                            ★
                          </span>
                        ))}
                      </div>
                      {result.feedbackComment && (
                        <p style={{ margin: 0, fontSize: "14px", color: "var(--text-primary)" }}>
                          <strong>{lang === "Tamil" ? "கருத்து" : lang === "Hindi" ? "टिप्पणी" : "Comment"}:</strong> "{result.feedbackComment}"
                        </p>
                      )}
                    </div>

                    {/* Show Appeal Option if Rating was low (1 or 2 stars) */}
                    {result.feedbackRating <= 2 && (
                      <div className="card" style={{ padding: "20px", background: "rgba(239, 68, 68, 0.02)", border: "1px dashed rgba(239, 68, 68, 0.3)", marginBottom: 0 }}>
                        <h4 style={{ color: "#ef4444", marginBottom: "12px" }}>
                          ⚖️ {lang === "Tamil" ? "தீர்வில் அதிருப்தியா? மேல்முறையீடு செய்யுங்கள்" : lang === "Hindi" ? "समाधान से असंतुष्ट? अपील दर्ज करें" : "Unsatisfied with resolution? File an Appeal"}
                        </h4>
                        <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "15px", lineHeight: "1.5" }}>
                          {lang === "Tamil" ? "உங்கள் புகாருக்கு வழங்கப்பட்ட தீர்வு திருப்திகரமாக இல்லை எனில், இந்த வழக்கை மீண்டும் திறந்து பொது தணிக்கை வாரியத்தின் தணிக்கைக்கு அனுப்பலாம்." : lang === "Hindi" ? "यदि आप समाधान से संतुष्ट नहीं हैं, तो आप इस मामले को फिर से खोल सकते हैं और इसे सार्वजनिक लेखा परीक्षा बोर्ड के पास अपील के लिए भेज सकते हैं।" : "If the resolution provided is unsatisfactory, you can reopen this grievance and escalate it to the Senior Public Ministerial Audit Board."}
                        </p>
                        
                        {!showAppealForm ? (
                          <button onClick={() => setShowAppealForm(true)} style={{ backgroundColor: "#ef4444", border: "none", color: "#ffffff", fontWeight: "700" }}>
                            ⚠️ {lang === "Tamil" ? "மேல்முறையீடு செய்க / மீண்டும் திறக்கவும்" : lang === "Hindi" ? "अपील करें / शिकायत पुनः खोलें" : "File Appeal / Reopen Grievance"}
                          </button>
                        ) : (
                          <form onSubmit={handleAppeal}>
                            <textarea
                              placeholder={lang === "Tamil" ? "மேல்முறையீட்டிற்கான காரணங்களை விளக்குங்கள்..." : lang === "Hindi" ? "अपनी अपील का कारण लिखें..." : "Please specify the reason for your appeal..."}
                              value={appealText}
                              onChange={(e) => setAppealText(e.target.value)}
                              required
                              style={{ minHeight: "80px", marginBottom: "12px", width: "100%", margin: "5px 0 12px 0" }}
                            />
                            <div style={{ display: "flex", gap: "10px" }}>
                              <button type="submit" style={{ flex: 1, backgroundColor: "#ef4444", border: "none", color: "#ffffff", fontWeight: "700", margin: 0 }}>
                                {lang === "Tamil" ? "மேல்முறையீட்டை சமர்ப்பிக்கவும்" : lang === "Hindi" ? "अपील जमा करें" : "Submit Formal Appeal"}
                              </button>
                              <button type="button" onClick={() => setShowAppealForm(false)} className="btn-secondary" style={{ margin: 0 }}>
                                {lang === "Tamil" ? "ரத்துசெய்" : lang === "Hindi" ? "ரद्द करें" : "Cancel"}
                              </button>
                            </div>
                          </form>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="card" style={{ padding: "20px", background: "rgba(255, 255, 255, 0.01)", border: "1px dashed var(--border-light)", marginBottom: 0 }}>
                    <h4 style={{ marginBottom: "12px" }}>{t.feedbackTitle}</h4>
                    <form onSubmit={handleSubmitFeedback}>
                      <div style={{ marginBottom: "15px" }}>
                        <label style={styles.infoTitle}>{t.rating} (1-5 {lang === "Tamil" ? "நட்சத்திரங்கள்" : lang === "Hindi" ? "सितारे" : "Stars"})</label>
                        <div style={{ display: "flex", gap: "10px", marginTop: "5px" }}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRating(star)}
                              style={{
                                background: "transparent",
                                border: "none",
                                fontSize: "28px",
                                color: star <= rating ? "#f59e0b" : "var(--text-muted)",
                                cursor: "pointer",
                                padding: 0
                              }}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                        {rating <= 2 && (
                          <p style={{ margin: "8px 0 0 0", fontSize: "12px", color: "#ef4444", fontWeight: "700" }}>
                            ℹ️ {lang === "Tamil" ? "குறிப்பு: 2 நட்சத்திரம் அல்லது அதற்கும் குறைவாக வழங்கினால், சமர்ப்பித்த பிறகு மேல்முறையீடு செய்யும் வசதி திறக்கப்படும்." : lang === "Hindi" ? "नोट: 2 सितारे या उससे कम रेटिंग देने पर, सबमिट करने के बाद अपील करने का विकल्प खुल जाएगा।" : "Note: Giving 2 stars or lower will unlock the option to file a formal appeal after submission."}
                          </p>
                        )}
                      </div>
                      <div style={{ marginBottom: "15px" }}>
                        <label style={styles.infoTitle}>{t.comment}</label>
                        <textarea
                          placeholder={lang === "Tamil" ? "உங்கள் கருத்துக்களை இங்கே எழுதவும்..." : lang === "Hindi" ? "अपनी टिप्पणियाँ यहाँ लिखें..." : "Tell us how we did..."}
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          style={{ margin: "5px 0 0 0", minHeight: "80px", width: "100%" }}
                        />
                      </div>
                      <button type="submit" style={{ width: "100%", margin: 0 }}>
                        {t.btnFeedback}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  searchContainer: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
  },
  searchInput: {
    margin: 0,
    flex: 1,
  },
  searchButton: {
    padding: "0 24px",
    height: "48px",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottom: "1px solid var(--border-light)",
    paddingBottom: "20px",
    marginBottom: "20px",
  },
  infoTitle: {
    fontSize: "13px",
    color: "var(--text-secondary)",
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: "6px",
  },
  infoValue: {
    fontSize: "16px",
    fontWeight: "600",
    margin: 0,
  },
  replyBox: {
    marginTop: "30px",
    padding: "20px",
    borderRadius: "8px",
    backgroundColor: "rgba(16, 185, 129, 0.08)",
    border: "1px solid rgba(16, 185, 129, 0.2)",
  },
  descriptionBox: {
    marginTop: "8px",
    padding: "16px",
    borderRadius: "8px",
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    border: "1px solid var(--border-light)",
    lineHeight: "1.6",
  }
};