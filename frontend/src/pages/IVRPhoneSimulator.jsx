import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import Navbar from "../components/Navbar";

export default function IVRPhoneSimulator() {
  const navigate = useNavigate();
  const [callState, setCallState] = useState("IDLE"); // IDLE, RINGING, CONNECTED, ENDED
  const [callTimer, setCallTimer] = useState(0);
  const [activeLang, setActiveLang] = useState("Hindi");
  const [callerNumber, setCallerNumber] = useState("+91 98765 43210");
  const [transcripts, setTranscripts] = useState([]);
  const [lastRegisteredId, setLastRegisteredId] = useState(null);
  const [speaking, setSpeaking] = useState(false);
  const timerRef = useRef(null);

  const keypads = [
    { num: "1", sub: "🚰 Water" },
    { num: "2", sub: "⚡ Electric" },
    { num: "3", sub: "🧹 Clean" },
    { num: "4", sub: "🛣️ Road" },
    { num: "5", sub: "🏥 Health" },
    { num: "6", sub: "📑 Revenue" },
    { num: "7", sub: "PQRS" },
    { num: "8", sub: "TUV" },
    { num: "9", sub: "WXYZ" },
    { num: "*", sub: "Speak" },
    { num: "0", sub: "Operator" },
    { num: "#", sub: "End" }
  ];

  useEffect(() => {
    if (callState === "CONNECTED") {
      timerRef.current = setInterval(() => {
        setCallTimer(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [callState]);

  const speakIVR = (text, lang) => {
    const synth = window.speechSynthesis;
    if (synth && synth.speaking) synth.cancel();

    let langKey = (lang || "English").toLowerCase();
    if (/\u0B80-\u0BFF/.test(text)) langKey = "tamil";
    else if (/\u0900-\u097F/.test(text)) langKey = "hindi";

    const langCodes = {
      "tamil": { code: "ta", locale: "ta-IN", keywords: ["ta", "tamil", "தமிழ்"] },
      "hindi": { code: "hi", locale: "hi-IN", keywords: ["hi", "hindi", "हिन्दी"] },
      "english": { code: "en", locale: "en-US", keywords: ["en", "english"] }
    };

    const config = langCodes[langKey] || langCodes["english"];

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
        utterance.onstart = () => setSpeaking(true);
        utterance.onend = () => setSpeaking(false);
        utterance.onerror = () => setSpeaking(false);
        setSpeaking(true);
        synth.speak(utterance);
        return;
      }
    }

    try {
      const cleanSnippet = text.replace(/[\n\r]+/g, " ").substring(0, 250);
      const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(cleanSnippet)}&tl=${config.code}&client=tw-ob`;
      const audio = new Audio(audioUrl);
      setSpeaking(true);
      audio.play().catch(err => setSpeaking(false));
      audio.onended = () => setSpeaking(false);
      audio.onerror = () => setSpeaking(false);
    } catch (e) {
      setSpeaking(false);
    }
  };

  const startCall = () => {
    setCallState("RINGING");
    setCallTimer(0);
    setTranscripts([]);
    setLastRegisteredId(null);

    setTimeout(() => {
      setCallState("CONNECTED");
      const greeting = activeLang === "Tamil"
        ? "வணக்கம்! லோக்சேவா போர்ட்டலுக்கு வரவேற்கிறோம். குடிநீருக்கு 1, மின்சாரத்திற்கு 2, சுத்தத்திற்கு 3, சாலைக்கு 4 அழுத்தவும்."
        : activeLang === "Hindi"
        ? "नमस्कार! लोकसेवा स्मार्ट सिटी हेल्पलाइन में आपका स्वागत है। पानी के लिए 1, बिजली के लिए 2, सफाई के लिए 3 दबाएं।"
        : "Welcome to LokSeva Telephony Bot. Press 1 for Water, 2 for Electricity, 3 for Sanitation, 4 for Roads.";

      setTranscripts(prev => [...prev, { sender: "bot", text: greeting }]);
      speakIVR(greeting, activeLang);
    }, 2000);
  };

  const endCall = () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setSpeaking(false);
    setCallState("ENDED");
    setTimeout(() => setCallState("IDLE"), 3000);
  };

  const handleKeyPress = async (digit) => {
    if (callState !== "CONNECTED") return;

    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      osc.connect(audioCtx.destination);
      osc.frequency.value = digit === "1" ? 697 : digit === "2" ? 770 : 852;
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch (e) {}

    const userLog = `[Keypad Pressed: ${digit}]`;
    setTranscripts(prev => [...prev, { sender: "user", text: userLog }]);

    try {
      const res = await API.post("/ivr/process-input", {
        Digits: digit,
        callerNumber,
        language: activeLang
      });

      if (res.data && res.data.success) {
        const realId = res.data.complaintId;
        const botReply = res.data.audioResponse || res.data.message || `Grievance Registered! Your reference ID is ${realId}.`;
        setLastRegisteredId(realId);
        setTranscripts(prev => [...prev, { sender: "bot", text: `✅ ${botReply}` }]);
        speakIVR(botReply, activeLang);
      } else {
        const errMsg = "Telephony network error. Please try calling again.";
        setTranscripts(prev => [...prev, { sender: "bot", text: `❌ ${errMsg}` }]);
      }
    } catch (err) {
      console.error("IVR Post Error:", err);
      const errMsg = activeLang === "Tamil" ? "தொடர்பு கொள்ள முடியவில்லை. மீண்டும் முயலவும்." : "Connection failed. Please retry.";
      setTranscripts(prev => [...prev, { sender: "bot", text: `❌ ${errMsg}` }]);
    }
  };

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-primary)" }}>
      <Navbar />
      <div className="container" style={{ maxWidth: "1000px", marginTop: "20px" }}>
        
        {/* Page Header */}
        <div style={{ textAlign: "center", marginBottom: "25px" }}>
          <span style={{
            fontSize: "12px",
            fontWeight: "800",
            textTransform: "uppercase",
            letterSpacing: "1px",
            backgroundColor: "rgba(124, 58, 237, 0.15)",
            color: "#a78bfa",
            padding: "4px 14px",
            borderRadius: "20px",
            border: "1px solid rgba(124, 58, 237, 0.3)"
          }}>
            📞 IVR Telephony Gateway & Voice Bot / दूरभाष कॉल रोबोट
          </span>
          <h2 style={{ marginTop: "12px", marginBottom: "8px", fontSize: "28px" }}>
            Smart Phone Call Simulator (1800-LOKSEVA)
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
            Test how elderly and rural citizens register complaints via telephony voice calls without smartphones.
          </p>
        </div>

        {/* Simulator Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "30px", alignItems: "start" }}>
          
          {/* Smartphone Mockup */}
          <div style={{
            backgroundColor: "#111827",
            border: "4px solid #374151",
            borderRadius: "36px",
            padding: "25px 20px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
            maxWidth: "360px",
            margin: "0 auto",
            width: "100%"
          }}>
            {/* Phone Screen Top */}
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <div style={{ fontSize: "11px", color: "#9ca3af", letterSpacing: "1px", fontWeight: "700" }}>TOLL-FREE HELPLINE</div>
              <h3 style={{ margin: "4px 0", color: "#ffffff", fontSize: "22px" }}>1800-LOKSEVA</h3>
              
              {/* Call Status Pill */}
              <div style={{ marginTop: "8px" }}>
                {callState === "IDLE" && <span style={{ backgroundColor: "#374151", color: "#9ca3af", padding: "3px 12px", borderRadius: "12px", fontSize: "12px" }}>Ready to Call</span>}
                {callState === "RINGING" && <span style={{ backgroundColor: "#d97706", color: "#ffffff", padding: "3px 12px", borderRadius: "12px", fontSize: "12px", animation: "pulse 1s infinite" }}>🔔 Ringing...</span>}
                {callState === "CONNECTED" && (
                  <span style={{ backgroundColor: "#059669", color: "#ffffff", padding: "3px 12px", borderRadius: "12px", fontSize: "12px" }}>
                    🟢 Connected ({formatTime(callTimer)}) {speaking && "🔊 Speaking"}
                  </span>
                )}
                {callState === "ENDED" && <span style={{ backgroundColor: "#dc2626", color: "#ffffff", padding: "3px 12px", borderRadius: "12px", fontSize: "12px" }}>Call Ended</span>}
              </div>
            </div>

            {/* Language Selector inside Phone */}
            <div style={{ display: "flex", justifyContent: "center", gap: "6px", marginBottom: "20px" }}>
              {["Hindi", "Tamil", "English"].map(l => (
                <button
                  key={l}
                  onClick={() => setActiveLang(l)}
                  style={{
                    backgroundColor: activeLang === l ? "#7c3aed" : "#1f2937",
                    color: "#ffffff",
                    border: "none",
                    padding: "4px 10px",
                    borderRadius: "6px",
                    fontSize: "11px",
                    fontWeight: "700",
                    cursor: "pointer"
                  }}
                >
                  {l}
                </button>
              ))}
            </div>

            {/* Keypad Buttons */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "25px" }}>
              {keypads.map(k => (
                <button
                  key={k.num}
                  onClick={() => handleKeyPress(k.num)}
                  disabled={callState !== "CONNECTED"}
                  style={{
                    backgroundColor: callState === "CONNECTED" ? "#1f2937" : "#111827",
                    border: "1px solid #374151",
                    borderRadius: "50%",
                    height: "64px",
                    width: "64px",
                    margin: "0 auto",
                    color: "#ffffff",
                    display: "flex",
                    flexDirection: "column",
                    justify: "center",
                    alignItems: "center",
                    cursor: callState === "CONNECTED" ? "pointer" : "not-allowed",
                    opacity: callState === "CONNECTED" ? 1 : 0.4
                  }}
                >
                  <span style={{ fontSize: "20px", fontWeight: "700" }}>{k.num}</span>
                  <span style={{ fontSize: "9px", color: "#9ca3af" }}>{k.sub}</span>
                </button>
              ))}
            </div>

            {/* Call / End Action Buttons */}
            <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center" }}>
              {callState === "IDLE" || callState === "ENDED" ? (
                <button
                  onClick={startCall}
                  style={{
                    backgroundColor: "#10b981",
                    color: "#ffffff",
                    border: "none",
                    width: "64px",
                    height: "64px",
                    borderRadius: "50%",
                    fontSize: "24px",
                    cursor: "pointer",
                    boxShadow: "0 4px 15px rgba(16, 185, 129, 0.4)"
                  }}
                >
                  📞
                </button>
              ) : (
                <button
                  onClick={endCall}
                  style={{
                    backgroundColor: "#ef4444",
                    color: "#ffffff",
                    border: "none",
                    width: "64px",
                    height: "64px",
                    borderRadius: "50%",
                    fontSize: "24px",
                    cursor: "pointer",
                    boxShadow: "0 4px 15px rgba(239, 68, 68, 0.4)"
                  }}
                >
                  📵
                </button>
              )}
            </div>
          </div>

          {/* Call Transcript Log & Registered Complaint Card */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div className="card" style={{ padding: "24px", backgroundColor: "var(--bg-glass)", minHeight: "340px", display: "flex", flexDirection: "column" }}>
              <h3 style={{ margin: "0 0 15px 0", fontSize: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                📜 Live Telephony Call Transcript ({activeLang})
              </h3>
              
              <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px", maxHeight: "280px" }}>
                {transcripts.length === 0 ? (
                  <p style={{ color: "var(--text-muted)", fontSize: "13px", fontStyle: "italic", margin: "auto" }}>
                    Click the green phone button 📞 on the left dialer to start a live IVR call session.
                  </p>
                ) : (
                  transcripts.map((t, i) => (
                    <div
                      key={i}
                      style={{
                        alignSelf: t.sender === "user" ? "flex-end" : "flex-start",
                        backgroundColor: t.sender === "user" ? "var(--color-primary)" : "rgba(255,255,255,0.08)",
                        padding: "10px 14px",
                        borderRadius: "10px",
                        maxWidth: "85%",
                        fontSize: "13px"
                      }}
                    >
                      <span style={{ fontSize: "11px", fontWeight: "700", opacity: 0.8, display: "block", marginBottom: "2px" }}>
                        {t.sender === "user" ? "Caller (Citizen)" : "🤖 AI IVR Bot"}
                      </span>
                      {t.text}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Registered ID Banner */}
            {lastRegisteredId && (
              <div className="card" style={{ padding: "20px", background: "linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.1) 100%)", border: "1px solid rgba(16, 185, 129, 0.3)" }}>
                <h4 style={{ margin: "0 0 6px 0", color: "#34d399" }}>🎉 Grievance Registered via Phone Call!</h4>
                <p style={{ margin: "0 0 10px 0", fontSize: "13px", color: "var(--text-secondary)" }}>
                  Reference ID: <strong>{lastRegisteredId}</strong>. Automated SMS confirmation dispatched to {callerNumber}.
                </p>
                <button
                  onClick={() => navigate(`/track?id=${lastRegisteredId}`)}
                  style={{ backgroundColor: "#10b981", color: "#fff", border: "none", padding: "6px 14px", borderRadius: "6px", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}
                >
                  Track Status Now ➔
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
