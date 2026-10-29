import { useState } from "react";
import Navbar from "../components/Navbar";

const translations = {
  English: {
    title: "🛣️ Redress Process Roadmap",
    subtitle: "Learn how your grievance moves from initial submission to final resolution and appeal.",
    introText: "Click on any milestone in the diagram below to read full process details.",
    steps: [
      {
        id: 1,
        title: "1. Grievance Submission",
        icon: "📝",
        short: "Citizen reports the issue via AI Chat or Manual Form.",
        details: "Citizens can submit grievances in their preferred language (Tamil, Hindi, English). They can speak to the mic using voice-to-text AI or attach photos of the physical issue (which the AI automatically analyzes for details like location and severity)."
      },
      {
        id: 2,
        title: "2. AI Intelligent Categorization",
        icon: "🤖",
        short: "AI checks for duplicates and routes to the correct department.",
        details: "Our AI systems automatically scan the complaint to detect if this exact issue (e.g. same water leak or potholes) has already been reported by another neighbor. It clusters duplicates to focus municipal resources and routes new filings to the correct municipal desk."
      },
      {
        id: 3,
        title: "3. Officer Allocation & Action",
        icon: "⚙️",
        short: "Nodal officers assign field workers to investigate.",
        details: "The Nodal Officer reviews the file, assigns field technicians, and sets a strict deadline based on priority (e.g., 12 hours for Electricity/Emergency, 24 hours for Sanitation). If the officer needs more context, they can directly issue a Clarification Request."
      },
      {
        id: 4,
        title: "4. Grievance Resolution",
        icon: "✅",
        short: "Technicians complete the physical repairs and upload reports.",
        details: "Once the field work is finished, the handling officer uploads an Official Resolution Note. The system immediately notifies the citizen via portal updates, SMS alerts, and email notifications."
      },
      {
        id: 5,
        title: "5. AI SLA Audit & Escalation",
        icon: "⚖️",
        short: "AI Auditor ensures accountability and triggers alarms if delayed.",
        details: "If a complaint breaches its resolution deadline (SLA), our AI Public Accountability engine escalates the file's severity level, alerts the department head, and unlocks a 'Speed-Up Ping' button for the citizen to ping the officer."
      },
      {
        id: 6,
        title: "6. Citizen Appeal & Review",
        icon: "⭐",
        short: "Citizens rate resolution or file appeals to senior boards.",
        details: "After closing, citizens submit feedback and star ratings. If a citizen is unsatisfied (gives 1 or 2 stars), they can officially click 'File Appeal / Reopen' to promote the file directly to the Public Ministerial Audit Board."
      }
    ]
  },
  Tamil: {
    title: "🛣️ குறை தீர்க்கும் செயல்முறை வரைபடம்",
    subtitle: "உங்கள் புகார் ஆரம்ப சமர்ப்பிப்பிலிருந்து இறுதி தீர்வு மற்றும் மேல்முறையீடு வரை எவ்வாறு நகர்கிறது என்பதை அறியுங்கள்.",
    introText: "முழு செயல்முறை விவரங்களைப் படிக்க கீழே உள்ள வரைபடத்தில் உள்ள ஏதேனும் மைல்கல்லைக் கிளிக் செய்யவும்.",
    steps: [
      {
        id: 1,
        title: "1. புகார் சமர்ப்பித்தல்",
        icon: "📝",
        short: "குடிமகன் AI அரட்டை அல்லது கையேடு படிவம் மூலம் புகாரை அளிக்கிறார்.",
        details: "குடிமக்கள் தங்களுக்கு விருப்பமான மொழியில் (தமிழ், இந்தி, ஆங்கிலம்) புகார்களை சமர்ப்பிக்கலாம். குரல்-வழி-உரை AI ஐப் பயன்படுத்தி மைக் மூலம் பேசலாம் அல்லது சிக்கலின் புகைப்படங்களை இணைக்கலாம்."
      },
      {
        id: 2,
        title: "2. AI அறிவார்ந்த வகைப்பாடு",
        icon: "🤖",
        short: "AI நகல்களைச் சரிபார்த்து சரியான துறைக்கு அனுப்புகிறது.",
        details: "ஒரே பிரச்சனை ஏற்கனவே வேறு ஒருவரால் புகார் செய்யப்பட்டுள்ளதா என்று AI தானாகவே ஸ்கேன் செய்கிறது. நகல்களைக் கண்டறிந்து ஒரே கோப்பில் இணைக்கிறது, மற்றும் புதிய புகார்களைச் சரியான துறைக்கு அனுப்புகிறது."
      },
      {
        id: 3,
        title: "3. அதிகாரி ஒதுக்கீடு & நடவடிக்கை",
        icon: "⚙️",
        short: "நோடல் அதிகாரிகள் களப்பணியாளர்களை விசாரணைக்கு நியமிக்கிறார்கள்.",
        details: "நோடல் அதிகாரி கோப்பை மதிப்பாய்வு செய்து, முன்னுரிமையின் அடிப்படையில் காலக்கெடுவை நிர்ணயிக்கிறார் (எ.கா. அவசர மின்சார புகாருக்கு 12 மணிநேரம், சுகாதாரத்திற்கு 24 மணிநேரம்). கூடுதல் விவரங்கள் தேவைப்பட்டால், குடிமகனிடம் விளக்கம் கேட்கலாம்."
      },
      {
        id: 4,
        title: "4. குறை தீர்வு",
        icon: "✅",
        short: "தொழில்நுட்ப வல்லுநர்கள் பழுதுபார்ப்புகளை முடித்து அறிக்கைகளைப் பதிவேற்றுகிறார்கள்.",
        details: "களப்பணி முடிந்ததும், கையாளும் அதிகாரி அதிகாரப்பூர்வ தீர்வு குறிப்பைப் பதிவேற்றுவார். தங்களுக்கு உடனடியாக SMS மற்றும் மின்னஞ்சல் அறிவிப்புகள் அனுப்பப்படும்."
      },
      {
        id: 5,
        title: "5. AI SLA தணிக்கை & கண்காணிப்பு",
        icon: "⚖️",
        short: "AI தணிக்கையாளர் பொறுப்புக்கூறலை உறுதி செய்கிறது.",
        details: "ஒரு புகார் அதன் தீர்வு காலக்கெடுவைத் தாண்டினால் (SLA), எங்கள் AI பொது தணிக்கை இயந்திரம் வழக்கின் தீவிரத்தை உயர்த்தி, துறைத் தலைவருக்கு எச்சரிக்கை அனுப்புகிறது. குடிமகன் அதிகாரியை அவசரப்படுத்த 'வேகப்படுத்துதல் எச்சரிக்கை' பொத்தானை இயக்கலாம்."
      },
      {
        id: 6,
        title: "6. குடிமகன் மேல்முறையீடு & மதிப்பாய்வு",
        icon: "⭐",
        short: "குடிமக்கள் தீர்வை மதிப்பிடுகிறார்கள் அல்லது மேல்முறையீடு செய்கிறார்கள்.",
        details: "குடிமக்கள் கருத்துகள் மற்றும் நட்சத்திர மதிப்பீடுகளைச் சமர்ப்பிக்கிறார்கள். குடிமகன் திருப்தியடையவில்லை எனில் (1 அல்லது 2 நட்சத்திரங்கள் வழங்கினால்), கோப்பை நேரடியாகப் பொது தணிக்கை வாரியத்திற்கு மாற்ற 'மேல்முறையீடு / மீண்டும் திறக்கவும்' பொத்தானைக் கிளிக் செய்யலாம்."
      }
    ]
  },
  Hindi: {
    title: "🛣️ शिकायत निवारण प्रक्रिया रोडमैप",
    subtitle: "जानें कि आपकी शिकायत प्रारंभिक प्रस्तुतीकरण से लेकर अंतिम समाधान और अपील तक कैसे आगे बढ़ती है।",
    introText: "पूर्ण प्रक्रिया विवरण पढ़ने के लिए नीचे दिए गए आरेख में किसी भी मील के पत्थर पर क्लिक करें।",
    steps: [
      {
        id: 1,
        title: "1. शिकायत दर्ज करना",
        icon: "📝",
        short: "नागरिक AI चैट या मैनुअल फॉर्म के माध्यम से शिकायत दर्ज करते हैं।",
        details: "नागरिक अपनी पसंदीदा भाषा (तमिल, हिंदी, अंग्रेजी) में शिकायतें जमा कर सकते हैं। वे वॉयस-टू-टेक्स्ट AI का उपयोग करके माइक से बोल सकते हैं या समस्याओं की तस्वीरें संलग्न कर सकते हैं जिसे AI स्वतः विश्लेषण करता है।"
      },
      {
        id: 2,
        title: "2. AI बुद्धिमान वर्गीकरण",
        icon: "🤖",
        short: "AI डुप्लिकेट की जांच करता है और सही विभाग को भेजता है।",
        details: "हमारी AI प्रणाली शिकायत को स्कैन करके यह पता लगाती है कि क्या यह समस्या पहले से ही किसी अन्य पड़ोसी द्वारा दर्ज की गई है। यह काम का दोहराव रोकती है और फाइलों को सही विभाग में भेजती है।"
      },
      {
        id: 3,
        title: "3. अधिकारी आवंटन और कार्रवाई",
        icon: "⚙️",
        short: "नोडल अधिकारी जांच के लिए फील्ड कर्मियों को नियुक्त करते हैं।",
        details: "नोडल अधिकारी फाइल की समीक्षा करते हैं और प्राथमिकता के आधार पर समय सीमा तय करते हैं (जैसे आपातकालीन बिजली के लिए 12 घंटे, स्वच्छता के लिए 24 घंटे)। अधिक विवरण के लिए अधिकारी स्पष्टीकरण मांग सकते हैं।"
      },
      {
        id: 4,
        title: "4. शिकायत समाधान",
        icon: "✅",
        short: "तकनीशियन मरम्मत का काम पूरा करते हैं और रिपोर्ट अपलोड करते हैं।",
        details: "काम पूरा होने के बाद, प्रभारी अधिकारी समाधान नोट अपलोड करते हैं। नागरिक को तुरंत एसएमएस/ईमेल और पोर्टल के माध्यम से सूचित किया जाता है।"
      },
      {
        id: 5,
        title: "5. AI SLA ऑडिट और वृद्धि",
        icon: "⚖️",
        short: "AI लेखा परीक्षक समय सीमा सुनिश्चित करता है और अलार्म बजाता है।",
        details: "यदि कोई शिकायत अपनी समाधान समय सीमा (SLA) का उल्लंघन करती है, तो हमारा AI इंजन मामले को वरिष्ठ अधिकारियों तक बढ़ा देता है और नागरिक को पिंग भेजने की अनुमति देता है।"
      },
      {
        id: 6,
        title: "6. नागरिक अपील और समीक्षा",
        icon: "⭐",
        short: "नागरिक रेटिंग देते हैं या वरिष्ठ बोर्डों में अपील करते हैं।",
        details: "समाधान के बाद, नागरिक रेटिंग देते हैं। असंतोषजनक समाधान (1 या 2 स्टार) होने पर, नागरिक शिकायत को फिर से खोलने और समीक्षा के लिए 'अपील दर्ज करें' पर क्लिक कर सकते हैं।"
      }
    ]
  }
};

export default function ProcessFlow() {
  const currentLang = localStorage.getItem("preferredLang") || "English";
  const t = translations[currentLang] || translations["English"];
  const [activeStep, setActiveStep] = useState(1);

  return (
    <div>
      <Navbar />
      <div className="container" style={{ maxWidth: "1000px" }}>
        <div style={styles.header}>
          <h2>{t.title}</h2>
          <p style={{ margin: 0, color: "var(--text-secondary)" }}>
            {t.subtitle}
          </p>
        </div>

        <p style={styles.intro}>{t.introText}</p>

        {/* Timeline Roadmap Layout */}
        <div style={styles.roadmapLayout}>
          
          {/* Left: Interactive Timeline */}
          <div style={styles.timelineContainer}>
            {t.steps.map((step) => (
              <div 
                key={step.id} 
                onClick={() => setActiveStep(step.id)}
                style={{
                  ...styles.timelineStep,
                  borderColor: activeStep === step.id ? "var(--color-primary)" : "var(--border-light)",
                  backgroundColor: activeStep === step.id ? "rgba(249, 115, 22, 0.08)" : "var(--bg-glass)",
                }}
              >
                <div style={{
                  ...styles.stepNumber,
                  backgroundColor: activeStep === step.id ? "var(--color-primary)" : "rgba(255,255,255,0.05)",
                  color: activeStep === step.id ? "#ffffff" : "var(--text-secondary)"
                }}>
                  {step.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{
                    ...styles.stepTitle,
                    color: activeStep === step.id ? "var(--color-primary)" : "#ffffff"
                  }}>
                    {step.title}
                  </h4>
                  <p style={styles.stepShort}>{step.short}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Right: Step Detailed Review */}
          <div style={styles.detailsPanel}>
            <div style={styles.detailsHeader}>
              <span style={styles.detailsIcon}>{t.steps[activeStep - 1].icon}</span>
              <h3 style={styles.detailsTitle}>{t.steps[activeStep - 1].title}</h3>
            </div>
            <p style={styles.detailsText}>
              {t.steps[activeStep - 1].details}
            </p>
          </div>

        </div>

        {/* Video Tutorial Walkthrough Section */}
        <div style={{
          marginTop: "50px",
          padding: "30px",
          borderRadius: "16px",
          backgroundColor: "var(--bg-secondary)",
          border: "1px solid var(--border-light)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
        }}>
          <h3 style={{ margin: "0 0 10px 0", fontSize: "20px", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "10px" }}>
            📺 {localStorage.getItem("preferredLang") === "Tamil" ? "குடிமகன் வீடியோ வழிகாட்டி" : localStorage.getItem("preferredLang") === "Hindi" ? "नागरिक वीडियो ट्यूटोरियल" : "Citizen Video Walkthrough Guide"}
          </h3>
          <p style={{ margin: "0 0 20px 0", fontSize: "14px", color: "var(--text-secondary)" }}>
            {localStorage.getItem("preferredLang") === "Tamil" 
              ? "புதிதாக புகாரை பதிவு செய்வது மற்றும் அதன் நிலையை கண்காணிப்பது எப்படி என்பதை அறிய இந்த வீடியோவை பார்க்கவும்."
              : localStorage.getItem("preferredLang") === "Hindi"
              ? "नई शिकायत दर्ज करने और उसकी स्थिति को ट्रैक करने के बारे में जानने के लिए इस ट्यूटोरियल वीडियो को देखें।"
              : "Watch this tutorial video to learn how to register new grievances and monitor redressal statuses online."
            }
          </p>
          <div style={{ 
            width: "100%", 
            maxWidth: "800px", 
            margin: "0 auto",
            borderRadius: "12px", 
            overflow: "hidden", 
            border: "1px solid var(--border-focus)",
            aspectRatio: "16/9",
            backgroundColor: "#000000"
          }}>
            <iframe 
              width="100%" 
              height="100%" 
              src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
              title="LokSeva Citizen Portal Tutorial" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  header: {
    borderBottom: "1px solid var(--border-light)",
    paddingBottom: "20px",
    marginBottom: "20px",
  },
  intro: {
    fontSize: "14px",
    color: "var(--text-muted)",
    marginBottom: "30px",
    textAlign: "center",
  },
  roadmapLayout: {
    display: "flex",
    gap: "40px",
    flexWrap: "wrap",
  },
  timelineContainer: {
    flex: 1,
    minWidth: "300px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  timelineStep: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "16px 20px",
    borderRadius: "12px",
    border: "1px solid",
    cursor: "pointer",
    transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
  },
  stepNumber: {
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    fontWeight: "800",
  },
  stepTitle: {
    margin: 0,
    fontSize: "16px",
    fontWeight: "700",
  },
  stepShort: {
    margin: "4px 0 0 0",
    fontSize: "13px",
    color: "var(--text-secondary)",
    lineHeight: "1.4",
  },
  detailsPanel: {
    flex: 1,
    minWidth: "300px",
    padding: "30px",
    borderRadius: "16px",
    background: "rgba(255, 255, 255, 0.01)",
    border: "1px dashed var(--border-accent)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-start",
    maxHeight: "450px",
    position: "sticky",
    top: "100px",
  },
  detailsHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "20px",
  },
  detailsIcon: {
    fontSize: "40px",
  },
  detailsTitle: {
    margin: 0,
    fontSize: "22px",
    color: "var(--color-primary)",
  },
  detailsText: {
    fontSize: "15px",
    color: "var(--text-secondary)",
    lineHeight: "1.8",
    margin: 0,
  }
};
