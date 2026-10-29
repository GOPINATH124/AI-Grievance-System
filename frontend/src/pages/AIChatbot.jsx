import { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import API from "../api/api";

export default function AIChatbot() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "bot",
      text: "Namaste! Welcome to LokSeva Automated Helpdesk. 🇮🇳 I can help you register a municipal grievance instantly through chat. Please describe the problem you want to report.",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [botStep, setBotStep] = useState(1); // 1: description, 2: department/photo, 3: location/submit, 4: done
  const [complaintData, setComplaintData] = useState({
    title: "",
    description: "",
    department: "",
    location: "Civic Center",
    imageBase64: "",
    latitude: 12.9716,
    longitude: 77.5946
  });

  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addMessage = (sender, text) => {
    setMessages(prev => [
      ...prev,
      {
        id: Date.now(),
        sender,
        text,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
    ]);
  };

  const handleSend = (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    addMessage("user", text);
    setInputText("");

    setTimeout(() => {
      processBotResponse(text);
    }, 1000);
  };

  const processBotResponse = async (userText) => {
    if (botStep === 1) {
      // Step 1: Extract title/description and infer department
      const lower = userText.toLowerCase();
      let dept = "Sanitation Department";
      let title = "Trash Pileup";

      if (lower.includes("water") || lower.includes("pipe") || lower.includes("leak")) {
        dept = "Water Supply Department";
        title = "Water Pipeline Issue";
      } else if (lower.includes("light") || lower.includes("power") || lower.includes("electricity")) {
        dept = "Electricity Department";
        title = "Power Grid Failure";
      } else if (lower.includes("road") || lower.includes("pothole") || lower.includes("traffic")) {
        dept = "Road and Transport Department";
        title = "Pothole Repair";
      }

      setComplaintData(prev => ({
        ...prev,
        title,
        description: userText,
        department: dept
      }));

      addMessage("bot", `Understood. I will categorize this issue under the **${dept}**. Let's gather evidence. Please attach a photo of the site.`);
      setBotStep(2);
    } else if (botStep === 2) {
      addMessage("bot", `Thanks for the input. Now, please drop a location pin or specify the address.`);
      setBotStep(3);
    } else if (botStep === 3) {
      if (userText.toLowerCase() === "yes" || userText.toLowerCase() === "submit" || userText.toLowerCase() === "y") {
        submitChatGrievance();
      } else {
        setComplaintData(prev => ({ ...prev, location: userText }));
        addMessage("bot", `Got it! Ready to submit this grievance to the municipal office? Type **Yes** or click **Submit Now**.`);
      }
    }
  };

  const attachMockPhoto = () => {
    // Standard mock base64 blue dot image
    const mockBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==";
    setComplaintData(prev => ({ ...prev, imageBase64: mockBase64 }));
    addMessage("user", "📷 Attached Photo Evidence (Mock File)");
    setTimeout(() => {
      addMessage("bot", "✓ Photo evidence linked successfully. Next, please share the GPS coordinates or click 'Drop Map Pin'.");
      setBotStep(3);
    }, 800);
  };

  const dropMockGPSPin = () => {
    const lat = 12.9716 + (Math.random() - 0.5) * 0.01;
    const lng = 77.5946 + (Math.random() - 0.5) * 0.01;
    setComplaintData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      location: `Coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}`
    }));

    addMessage("user", `📍 Shared Location Pin (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
    setTimeout(() => {
      addMessage("bot", "✓ Location pinned. Are you ready to submit this report? Type **Yes** or click the **Submit Now** button.");
    }, 800);
  };

  const submitChatGrievance = async () => {
    try {
      addMessage("bot", "⚡ Submitting complaint to backend...");
      const res = await API.post("/complaint/create", {
        title: complaintData.title || "Chat Grievance Submission",
        description: complaintData.description,
        department: complaintData.department,
        location: complaintData.location,
        imageBase64: complaintData.imageBase64,
        latitude: complaintData.latitude,
        longitude: complaintData.longitude
      });

      addMessage("bot", `🎉 **Success!** Your grievance has been registered. Reference ID: **${res.data.complaint.complaintId}**.\n\nYou can track this under 'Track Complaint' on our portal. Thank you for making our city cleaner!`);
      setBotStep(4);
    } catch (err) {
      console.error(err);
      addMessage("bot", "❌ Submission failed. Please verify you are logged in as a citizen.");
    }
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#0b141a" }}>
      <Navbar />
      
      <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", padding: "20px" }}>
        <div style={styles.chatContainer}>
          {/* WhatsApp Header */}
          <div style={styles.chatHeader}>
            <div style={styles.avatar}>🤖</div>
            <div>
              <div style={{ fontWeight: "700", color: "#fff", fontSize: "15px" }}>LokSeva Citizen Helpdesk</div>
              <div style={{ fontSize: "12px", color: "#25d366" }}>🟢 Online (AI Assistant)</div>
            </div>
          </div>

          {/* Messages Area */}
          <div style={styles.chatBody}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  ...styles.msgRow,
                  justifyContent: msg.sender === "user" ? "flex-end" : "flex-start"
                }}
              >
                <div
                  style={{
                    ...styles.msgBubble,
                    backgroundColor: msg.sender === "user" ? "#005c4b" : "#202c33",
                    color: "#e9edef"
                  }}
                >
                  <div style={{ whiteSpace: "pre-wrap" }}>{msg.text}</div>
                  <span style={styles.msgTime}>{msg.time}</span>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Interactive Action Triggers */}
          <div style={styles.actionRow}>
            {botStep === 2 && !complaintData.imageBase64 && (
              <button onClick={attachMockPhoto} style={styles.actionBtn}>
                📷 Attach Mock Photo
              </button>
            )}
            {botStep === 3 && (
              <>
                <button onClick={dropMockGPSPin} style={styles.actionBtn}>
                  📍 Drop GPS Pin
                </button>
                <button onClick={submitChatGrievance} style={{ ...styles.actionBtn, backgroundColor: "#25d366", color: "#000" }}>
                  🚀 Submit Now
                </button>
              </>
            )}
          </div>

          {/* Chat Input Field */}
          <div style={styles.chatInputRow}>
            <input
              type="text"
              placeholder="Type a message..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              disabled={botStep === 4}
              style={styles.chatInput}
            />
            <button
              onClick={() => handleSend()}
              disabled={botStep === 4}
              style={{
                ...styles.sendBtn,
                opacity: botStep === 4 ? 0.5 : 1
              }}
            >
              ➔
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  chatContainer: {
    maxWidth: "550px",
    width: "100%",
    height: "560px",
    borderRadius: "12px",
    backgroundColor: "#111b21",
    border: "1px solid #222e35",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    boxShadow: "0 12px 24px rgba(0, 0, 0, 0.4)"
  },
  chatHeader: {
    padding: "12px 18px",
    backgroundColor: "#202c33",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    borderBottom: "1px solid #2f3b43"
  },
  avatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    backgroundColor: "#2a3942",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "20px"
  },
  chatBody: {
    flex: 1,
    padding: "16px",
    overflowY: "auto",
    backgroundImage: "radial-gradient(#202c33 1px, transparent 1px)",
    backgroundSize: "20px 20px"
  },
  msgRow: {
    display: "flex",
    marginBottom: "12px"
  },
  msgBubble: {
    padding: "10px 14px",
    borderRadius: "10px",
    maxWidth: "75%",
    position: "relative",
    boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
    fontSize: "14px",
    lineHeight: "1.5"
  },
  msgTime: {
    fontSize: "10px",
    color: "#8696a0",
    display: "block",
    textAlign: "right",
    marginTop: "4px"
  },
  actionRow: {
    padding: "8px 16px",
    display: "flex",
    gap: "10px",
    justifyContent: "center",
    backgroundColor: "#111b21"
  },
  actionBtn: {
    padding: "6px 12px",
    fontSize: "12px",
    fontWeight: "700",
    borderRadius: "6px",
    border: "1px solid #3b82f6",
    backgroundColor: "rgba(59, 130, 246, 0.15)",
    color: "#60a5fa",
    cursor: "pointer"
  },
  chatInputRow: {
    padding: "10px 16px",
    backgroundColor: "#202c33",
    display: "flex",
    alignItems: "center",
    gap: "12px"
  },
  chatInput: {
    flex: 1,
    padding: "10px 16px",
    borderRadius: "8px",
    backgroundColor: "#2a3942",
    border: "none",
    color: "#fff",
    fontSize: "14px",
    outline: "none",
    margin: 0
  },
  sendBtn: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    backgroundColor: "#00a884",
    color: "#fff",
    border: "none",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
    fontSize: "18px"
  }
};
