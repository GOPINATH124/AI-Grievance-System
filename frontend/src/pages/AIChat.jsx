import { useState } from "react";
import API from "../api/api";
import Navbar from "../components/Navbar";

const generateRuleBasedGrievanceText = (msg, lang) => {
  const text = (msg || "").toLowerCase();
  const normalizedLang = (lang || "English").toLowerCase();
  
  // 1. Identify Department
  let department = "Water Supply Department";
  if (text.includes("power") || text.includes("electricity") || text.includes("voltage") || text.includes("current") || text.includes("wire") || text.includes("pole") || text.includes("transformer") || text.includes("load shedding") || text.includes("powercut") || text.includes("बिजली") || text.includes("करंट") || text.includes("वायर") || text.includes("மின்சாரம்") || text.includes("ஒளி") || text.includes("மின்") || text.includes("కరెంట్") || text.includes("విద్యుత్") || text.includes("ವಿದ್ಯುತ್")) {
    department = "Electricity Department";
  } else if (text.includes("water") || text.includes("sewage") || text.includes("drain") || text.includes("leakage") || text.includes("pipeline") || text.includes("clog") || text.includes("water supply") || text.includes("water resources") || text.includes("reservoir") || text.includes("lake") || text.includes("canal") || text.includes("pond") || text.includes("पानी") || text.includes("जल") || text.includes("पाइप") || text.includes("सीवर") || text.includes("தண்ணீர்") || text.includes("நீறு") || text.includes("நீரு")) {
    department = "Water Supply Department";
  } else if (text.includes("road") || text.includes("pothole") || text.includes("highway") || text.includes("bridge") || text.includes("construction") || text.includes("path") || text.includes("street") || text.includes("सड़क") || text.includes("रास्ता") || text.includes("गड्ढा") || text.includes("मार्ग") || text.includes("சாலை") || text.includes("பாதை") || text.includes("தெரு") || text.includes("రహదారి") || text.includes("రోడ్డు") || text.includes("ರಸ್ತೆ")) {
    department = "Road and Transport Department";
  } else if (text.includes("garbage") || text.includes("trash") || text.includes("clean") || text.includes("street light") || text.includes("parks") || text.includes("waste") || text.includes("drainage") || text.includes("toilet") || text.includes("sanitation") || text.includes("कचरा") || text.includes("सफाई") || text.includes("குப்பை") || text.includes("சுத்தம்") || text.includes("முరికి") || text.includes("ಕಸ")) {
    department = "Sanitation Department";
  } else if (text.includes("health") || text.includes("hospital") || text.includes("doctor") || text.includes("medicine") || text.includes("disease") || text.includes("fever") || text.includes("अस्पताल") || text.includes("दवा") || text.includes("चिकित्सा") || text.includes("மருத்துவமனை") || text.includes("மருந்து") || text.includes("ఆసుపత్రి") || text.includes("ಔಷಧಿ")) {
    department = "Health Department";
  } else {
    department = "Revenue Department";
  }
  
  // 2. Determine Priority
  let priority = "Medium";
  if (text.includes("urgent") || text.includes("danger") || text.includes("hazard") || text.includes("burst") || text.includes("hospital") || text.includes("flood") || text.includes("shock") || text.includes("fire") || text.includes("leak") || text.includes("critical") || text.includes("immediate") || text.includes("accident") || text.includes("emergency") || text.includes("outage") || text.includes("तुरंत") || text.includes("खतरा") || text.includes("आपातकालीन") || text.includes("அவசரம்") || text.includes("ஆபத்து") || text.includes("அவசியம்")) {
    priority = "High";
  } else if (text.includes("minor") || text.includes("inquiry") || text.includes("suggestion") || text.includes("general query") || text.includes("question") || text.includes("सुझाव") || text.includes("पूछताछ")) {
    priority = "Low";
  }

  // Suffix summary
  const cleanMsg = (msg || "").trim();
  const summary = cleanMsg.length > 40 ? cleanMsg.substring(0, 40) + "..." : cleanMsg;

  // 3. Create Title and Draft based on Language
  let title = "";
  let complaint = "";
  
  if (normalizedLang === "hindi") {
    title = `विभाग: ${department} - शिकायत (${summary})`;
    complaint = `सेवा में,\nअधिकारी महोदय,\n[${department}] विभाग,\n\nविषय: शिकायत आवेदन पत्र\n\nआदरणीय महोदय/महोदया,\n\nमैं इस पत्र के माध्यम से हमारे क्षेत्र की निम्नलिखित समस्या की ओर आपका ध्यान आकर्षित करना चाहता हूँ:\n\n"${cleanMsg}"\n\nयह समस्या हमारे क्षेत्र के निवासियों के लिए अत्यंत असुविधाजनक बनी हुई है। आपसे विनम्र अनुरोध है कि इस मामले का संज्ञान लेते हुए इसका जल्द से जल्द समाधान करने की कृपा करें।\n\nधन्यवाद।\n\nभवदीय,\nस्थानीय निवासी`;
  } else if (normalizedLang === "tamil") {
    title = `துறை: ${department} - புகார் (${summary})`;
    complaint = `பெறுநர்,\nஅதிகாரிகள்,\n[${department}] துறை,\n\nபொருள்: பொதுப் புகார் விண்ணப்பம்\n\nமதிப்பிற்குரிய ஐயா/அம்மா,\n\nஎங்கள் பகுதியில் உள்ள பின்வரும் பிரச்சனையை உங்கள் கவனத்திற்கு கொண்டு வர விரும்புகிறேன்:\n\n"${cleanMsg}"\n\nஇந்த பிரச்சனை எங்கள் பகுதி மக்களுக்கு மிகுந்த சிரமத்தை ஏற்படுத்துகிறது. தயவுசெய்து இந்த பிரச்சனையை விரைவில் சரிசெய்ய நடவடிக்கை எடுக்குமாறு கேட்டுக்கொள்கிறேன்.\n\nநன்றி,\n\nஇப்படிக்கு,\nபொதுமக்கள்`;
  } else if (normalizedLang === "telugu") {
    title = `శాఖ: ${department} - フィర్యాదు (${summary})`;
    complaint = `గౌరవనీయులైన అధికారి గారికి,\n[${department}] శాఖ,\n\nவிषయం: ప్రజా ఫిర్యాదు దరఖాస్తు\n\nఅయ్యా/అమ్మా,\n\nమా పరిధిలోని ఈ క్రింది समस्याను మీ దృష్టికి తీసుకురావాలనుకుంటున్నాను:\n\n"${cleanMsg}"\n\nఈ సమస్య వల్ల మా ప్రాంత ప్రజలు తీవ్ర ఇబ్బन्दులు పడుతున్నారు. దయచేసి ఈ సమస్యను త్వరగా పరిష్కరించాలని కోరుతున్నాము.\n\nధన్యవాదాలు,\n\nఇట్లు,\nస్థానిక పౌరుడు`;
  } else if (normalizedLang === "kannada") {
    title = `ಇಲಾಖೆ: ${department} - ದೂರು (${summary})`;
    complaint = `ಗೌರವಾನ್ವಿತ ಅಧಿಕಾರಿಗಳಿಗೆ,\n[${department}] ಇಲಾಖೆ,\n\nವಿಷಯ: ಸಾರ್ವಜನಿಕ ದೂರು ಅರ್ಜಿ\n\nಮಾನ್ಯರೇ,\n\nನಮ್ಮ ಪ್ರದೇಶದಲ್ಲಿನ ಈ ಕೆಳಗಿನ ಸಮಸ್ಯೆಯನ್ನು ನಿಮ್ಮ ಗಮನಕ್ಕೆ ತರಬಯಸುತ್ತೇನೆ:\n\n"${cleanMsg}"\n\nಈ ಸಮಸ್ಯೆಯಿಂದ ನಮ್ಮ ಪ್ರದೇಶದ ನಿವಾಸಿಗಳು ತೊಂದರೆ ಅನುಭವಿಸುತ್ತಿದ್ದಾರೆ. ದಯವಿಟ್ಟು ಈ ಸಮಸ್ಯೆಯನ್ನು ಆದಷ್ಟು ಬೇಗ ಪರಿಹರಿಸಿಕೊಡಬೇಕಾಗಿ ವಿನಂತಿ.\n\nಧನ್ಯವಾದಗಳು,\n\nಇಂತಿ,\nಸ್ಥಳೀಯ ನಾಗರಿಕ`;
  } else if (normalizedLang === "bengali") {
    title = `বিভাগ: ${department} - অভিযোগ (${summary})`;
    complaint = `মাননীয় আধিকারিক মহাশয়,\n[${department}] বিভাগ,\n\nবিষয়: সাধারণ অভিযোগ আবেদন\n\nমহাশয়/মহাশয়া,\n\nআমি আমাদের এলাকার নিম্নলিখিত সমস্যাটি আপনার নজরে আনতে চাই:\n\n"${cleanMsg}"\n\nএই সমস্যার কারণে আমাদের এলাকার বাসিন্দারা চরম অসুবিধার সম্মুখীন হচ্ছেন। অনুগ্রহ করে অবিলম্বে এই সমস্যার সমাধান করুন।\n\nধন্যবাদান্তে,\n\nবিনীত,\nস্থানীয় নাগরিক`;
  } else if (normalizedLang === "marathi") {
    title = `विभाग: ${department} - तक्रार (${summary})`;
    complaint = `प्रति,\nमा. अधिकारी साहेब,\n[${department}] विभाग,\n\nविषय: तक्रार अर्ज\n\nमहोदय,\n\nमी या पत्राद्वारे आमच्या परिसरातील खालील समस्येकडे आपले लक्ष वेधू इच्छितो:\n\n"${cleanMsg}"\n\nया समस्येमुळे स्थानिक रहिवाशांना नाहक त्रास सहन करावा लागत आहे. तरी आपण या समस्येचे लवकरात लवकर निवारण करावे, ही नम्र विनंती.\n\nधन्यवाद।\n\nआपला नम्र,\nस्थानिक नागरिक`;
  } else if (normalizedLang === "gujarati") {
    title = `વિભાગ: ${department} - ફરિયાદ (${summary})`;
    complaint = `માનનીય અધિકારીશ્રી,\n[${department}] વિભાગ,\n\nવિષય: જાહેર ફરિયાદ અરજી\n\nઆદરણીય સાહેબ/મેડમ,\n\nહું આ પત્ર દ્વારા અમારા વિસ્તારની નીચેની સમસ્યા તરફ આપનું ધ્યાન દોરવા માંગું છું:\n\n"${cleanMsg}"\n\nઆ સમસ્યાને કારણે અમારા વિસ્તારના લોકોને ભારે હાલાકી ભોગવવી પડી રહી છે. મહેરબાની કરી આ સમસ્યાનું વહેલી તકે નિરાકરણ લાવવા વિનંती છે.\n\nઆભાર,\n\nલિ. પબ્લિક`;
  } else {
    // Default English
    title = `${department} Complaint - ${summary}`;
    complaint = `To,\nThe Officer in Charge,\nDepartment of ${department},\n\nSubject: Formal Grievance Application\n\nRespected Sir/Madam,\n\nI am writing to draw your attention to a pressing public issue in our locality. Specifically, the citizen has reported the following concern:\n\n"${cleanMsg}"\n\nThis issue is causing significant inconvenience and challenges to local residents and needs to be addressed on a priority basis. We kindly request you to inspect the situation and take necessary actions to resolve this grievance at the earliest.\n\nThank you for your time, cooperation, and prompt attention to this matter.\n\nSincerely,\nConcerned Citizen`;
  }

  return `Title: ${title}\nDepartment: ${department}\nPriority: ${priority}\nComplaint: ${complaint}`;
};

function AIChat() {
  const userStr = localStorage.getItem("user");
  const user = (userStr && userStr !== "undefined") ? JSON.parse(userStr) : null;
  const currentPreferred = localStorage.getItem("preferredLang") || user?.language || "English";
  const [language, setLanguage] = useState(currentPreferred);
  const [message, setMessage] = useState("");
  const [imageBase64, setImageBase64] = useState("");
  const [imageAnalysis, setImageAnalysis] = useState("");
  
  const getGreetingText = (lang) => {
    if (lang === "Tamil") return "வணக்கம்! நான் உங்கள் லோக்ஸேவா AI உதவியாளர். இன்று நான் உங்களுக்கு எவ்வாறு உதவ முடியும்? மைக் பொத்தானைத் தட்டி உங்கள் சிக்கலை தமிழில் விளக்குங்கள் அல்லது தட்டச்சு செய்யுங்கள்.";
    if (lang === "Hindi") return "नमस्ते! मैं आपका लोकसेवा AI सहायक हूँ। आज मैं आपकी क्या सहायता कर सकता हूँ? माइक बटन दबाकर अपनी समस्या हिंदी में बताएं या टाइप करें।";
    return "Hello! I am your LokSeva AI Assistant. How can I help you today? Please explain your grievance in normal language (voice/text) in English or any other regional language.";
  };

  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: getGreetingText(currentPreferred)
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState(null);
  const [submittedId, setSubmittedId] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isPlayingSpeech, setIsPlayingSpeech] = useState(false);
  const [isPlayingMessageIndex, setIsPlayingMessageIndex] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result);
        setImageAnalysis("");
      };
      reader.readAsDataURL(file);
    }
  };

  const parseAIOutput = (text) => {
    let title = "";
    let department = "";
    let priority = "Medium";
    let location = "Not Specified";
    let complaint = "";

    // Parse Title:
    const titleRegex = /(?:Title|विषय|தலைப்பு|विषय)\s*:\s*(.*)/i;
    const titleMatch = text.match(titleRegex);
    if (titleMatch) title = titleMatch[1].trim();

    // Parse Department:
    const deptRegex = /(?:Department|विभाग|துறை|विभाग)\s*:\s*(.*)/i;
    const deptMatch = text.match(deptRegex);
    if (deptMatch) department = deptMatch[1].trim();

    // Parse Priority:
    const priorityRegex = /(?:Priority|प्राथमिकता|முன்னுரிமை)\s*:\s*(.*)/i;
    const priorityMatch = text.match(priorityRegex);
    if (priorityMatch) priority = priorityMatch[1].trim();

    // Parse Location:
    const locationRegex = /(?:Location|स्थान|இடம்|முகவரி)\s*:\s*(.*)/i;
    const locationMatch = text.match(locationRegex);
    if (locationMatch) location = locationMatch[1].trim();

    // Parse Complaint:
    const compRegex = /(?:Complaint|आवेदन|புகார்|शिकायत)\s*:\s*([\s\S]*)/i;
    const compMatch = text.match(compRegex);
    if (compMatch) complaint = compMatch[1].trim();

    // Cleaning formatting like markdown asterisks
    const cleanStr = (str) => str.replace(/\*\*/g, "").trim();

    title = title ? cleanStr(title) : "";
    department = department ? cleanStr(department) : "";
    priority = priority ? cleanStr(priority) : "Medium";
    location = location ? cleanStr(location) : "Not Specified";
    complaint = complaint ? cleanStr(complaint) : "";

    // Department Normalization Function
    const normalizeDept = (raw, fullText) => {
      const combined = (raw + " " + fullText).toLowerCase();
      if (combined.includes("water") || combined.includes(" जल") || combined.includes("पानी") || combined.includes("தண்ணீர்") || combined.includes("நீர்") || combined.includes("நீரு")) return "Water Supply Department";
      if (combined.includes("electr") || combined.includes("power") || combined.includes("बिजली") || combined.includes("करंट") || combined.includes("மின்சார")) return "Electricity Department";
      if (combined.includes("road") || combined.includes("transport") || combined.includes("pothole") || combined.includes("सड़क") || combined.includes("சாலை") || combined.includes("రహదారి")) return "Road and Transport Department";
      if (combined.includes("sanit") || combined.includes("garbage") || combined.includes("कचरा") || combined.includes("सफाई") || combined.includes("குப்பை") || combined.includes("நாய்") || combined.includes("நாய்த்தாற்று") || combined.includes("கழிவு")) return "Sanitation Department";
      if (combined.includes("health") || combined.includes("hospital") || combined.includes("doctor") || combined.includes("अस्पताल") || combined.includes("மருத்துவ")) return "Health Department";
      return "Revenue Department";
    };

    department = normalizeDept(department, text);

    // Fallbacks if formatting is different
    if (!title || !complaint) {
      const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
      title = title || (lines[0] ? cleanStr(lines[0]) : "Grievance Complaint");
      complaint = complaint || cleanStr(text);
    }

    return { title, department, priority, location, complaint };
  };

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!message.trim() && !imageBase64) return;

    const userMessage = message;
    const attachedImage = imageBase64;
    
    setMessage("");
    setDraft(null);
    setSubmittedId("");

    // Stop speaking if active
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingSpeech(false);

    // Add user message to chat
    setMessages((prev) => [...prev, { 
      sender: "user", 
      text: userMessage || "Sent a photo for analysis.", 
      image: attachedImage 
    }]);
    setLoading(true);

    try {
      const res = await API.post("/ai/generate", {
        message: userMessage || "Analyze this image and report the grievance details.",
        language: language,
        imageBase64: attachedImage
      });

      const rawResult = res.data.result;
      const analysisResult = res.data.imageAnalysis;
      if (analysisResult) {
        setImageAnalysis(analysisResult);
      }

      const parsed = parseAIOutput(rawResult);

      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: `I have processed your complaint ${analysisResult ? `(${analysisResult})` : ""}. Here is the formal grievance draft for your review:`
        }
      ]);

      setDraft({
        title: parsed.title,
        department: parsed.department,
        priority: parsed.priority,
        description: parsed.complaint,
        location: parsed.location || "Not Specified",
        language: language,
        imageAnalysis: analysisResult || ""
      });
    } catch (error) {
      console.warn("Backend AI generation failed, using client-side rule-based fallback:", error);
      
      const fallbackResult = generateRuleBasedGrievanceText(userMessage, language);
      const parsed = parseAIOutput(fallbackResult);

      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: `[Offline Fallback Mode] I have processed your complaint details in ${language} and identified the correct department. Here is the drafted grievance:`
        }
      ]);

      setDraft({
        title: parsed.title,
        department: parsed.department,
        priority: parsed.priority,
        description: parsed.complaint,
        location: parsed.location || "Not Specified",
        language: language,
        imageAnalysis: ""
      });
    } finally {
      setLoading(false);
    }
  };

  const submitDraft = async () => {
    if (!draft) return;
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingSpeech(false);

    try {
      setLoading(true);
      const res = await API.post("/complaint/create", {
        title: draft.title,
        description: draft.description,
        department: draft.department,
        language: draft.language,
        priority: draft.priority,
        location: draft.location || "Not Specified",
        aiLetter: draft.description,
        isAiGenerated: true,
        translationStatus: draft.language.toLowerCase() !== "english" ? "Translated" : "Not Required",
        imageBase64: imageBase64,
        imageAnalysis: draft.imageAnalysis || ""
      });

      setSubmittedId(res.data.complaint.complaintId);
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: `Thank you! Your grievance has been officially registered with ID: ${res.data.complaint.complaintId}. You can track its progress in the tracking tab.`
        }
      ]);
      setDraft(null);
      setImageBase64("");
      setImageAnalysis("");
    } catch (error) {
      console.error(error);
      alert("Failed to submit complaint. Please check your network.");
    } finally {
      setLoading(false);
    }
  };

  const handleDiscard = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingSpeech(false);
    setDraft(null);
  };

  // Web Speech API - Voice recognition (Speech-to-Text)
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser. Please use Google Chrome, MS Edge or Safari.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    
    // Set appropriate language locale code for Indian languages
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
    
    recognition.lang = langMap[language] || "en-US";
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
      setMessage(transcript);
    };

    recognition.start();
  };

  // Web Speech API - Voice Synthesis (Text-to-Speech Dual-Engine)
  const speakDraft = () => {
    if (!draft || !draft.description) return;

    const synth = window.speechSynthesis;
    if (synth && synth.speaking) {
      synth.cancel();
      setIsPlayingSpeech(false);
      return;
    }

    const text = draft.description;
    
    // Auto-detect script from text or fallback to selected language
    let langKey = (language || "English").toLowerCase();
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

  const speakMessage = (text, index) => {
    const synth = window.speechSynthesis;
    if (synth && synth.speaking) {
      synth.cancel();
      if (isPlayingMessageIndex === index) {
        setIsPlayingMessageIndex(null);
        return;
      }
    }

    // Auto-detect script from text or fallback to selected language
    let langKey = (language || "English").toLowerCase();
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
      "kannada": { code: "kn", locale: "kn-IN", keywords: ["kn", "kannada", "கನ್ನಡ"] },
      "bengali": { code: "bn", locale: "bn-IN", keywords: ["bn", "bengali", "বাংলা"] },
      "marathi": { code: "mr", locale: "mr-IN", keywords: ["mr", "marathi", "मराठी"] },
      "gujarati": { code: "gu", locale: "gu-IN", keywords: ["gu", "gujarati", "ગુજરાતી"] },
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
        utterance.onend = () => setIsPlayingMessageIndex(null);
        utterance.onerror = () => setIsPlayingMessageIndex(null);
        setIsPlayingMessageIndex(index);
        synth.speak(utterance);
        return;
      }
    }

    // Fallback: Pure Native Audio Stream
    try {
      const cleanSnippet = text.replace(/[\n\r]+/g, " ").substring(0, 250);
      const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(cleanSnippet)}&tl=${config.code}&client=tw-ob`;
      const audio = new Audio(audioUrl);
      setIsPlayingMessageIndex(index);
      audio.play().catch(err => {
        console.error("Audio play error", err);
        setIsPlayingMessageIndex(null);
      });
      audio.onended = () => setIsPlayingMessageIndex(null);
      audio.onerror = () => setIsPlayingMessageIndex(null);
    } catch (e) {
      setIsPlayingMessageIndex(null);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navbar />
      <div className="container" style={{ flex: 1, display: "flex", flexDirection: "column", margin: "20px auto", maxWidth: "1000px" }}>
        
        {/* Bol Kar Shikayat Karein (Voice-to-Voice Portal) Banner */}
        <div style={{
          backgroundColor: "rgba(249, 115, 22, 0.12)",
          border: "1px solid rgba(249, 115, 22, 0.3)",
          borderRadius: "12px",
          padding: "16px 20px",
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "15px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "32px" }}>🎙️</span>
            <div>
              <h3 style={{ margin: 0, fontSize: "18px", color: "#f97316" }}>📢 Bol Kar Shikayat Karein / बोलकर शिकायत करें</h3>
              <p style={{ margin: "2px 0 0 0", fontSize: "13px", color: "var(--text-secondary)" }}>
                Tap mic to speak in your mother tongue ({language}). AI will write & read the letter back out loud to you!
              </p>
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={startListening}
              style={{
                backgroundColor: isListening ? "#ef4444" : "#f97316",
                color: "#ffffff",
                border: "none",
                padding: "8px 16px",
                borderRadius: "20px",
                fontWeight: "700",
                fontSize: "13px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                boxShadow: isListening ? "0 0 12px #ef4444" : "none"
              }}
            >
              🎙️ {isListening ? "Listening... (बोलिए)" : "Tap to Speak (बोलें)"}
            </button>
            {draft && (
              <button
                onClick={speakDraft}
                style={{
                  backgroundColor: isPlayingSpeech ? "#ef4444" : "#10b981",
                  color: "#ffffff",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "20px",
                  fontWeight: "700",
                  fontSize: "13px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                🔊 {isPlayingSpeech ? "Stop Audio" : "Listen Draft (सुनें)"}
              </button>
            )}
          </div>
        </div>

        {/* Chat Header */}
        <div style={styles.chatHeader}>
          <div>
            <h2 style={{ margin: 0 }}>✨ AI Grievance Assistant</h2>
            <p style={{ margin: 0, fontSize: "14px", color: "var(--text-secondary)" }}>
              Describe your issue. AI will translate, identify the department, and draft the formal letter.
            </p>
          </div>
          <div style={styles.langSelectContainer}>
            <label style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: "600", marginRight: "8px" }}>DRAFT LANGUAGE:</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              style={styles.langSelect}
            >
              <option value="English">English</option>
              <option value="Hindi">Hindi (हिन्दी)</option>
              <option value="Tamil">Tamil (தமிழ்)</option>
              <option value="Telugu">Telugu (తెలుగు)</option>
              <option value="Kannada">Kannada (ಕನ್ನಡ)</option>
              <option value="Bengali">Bengali (বাংলা)</option>
              <option value="Marathi">Marathi (மராठी)</option>
              <option value="Gujarati">Gujarati (ગુજરાતી)</option>
            </select>
          </div>
        </div>

        {/* Chat Messages Panel */}
        <div style={styles.messagesPanel}>
          {messages.map((msg, index) => (
            <div
              key={index}
              style={{
                ...styles.messageRow,
                justifyContent: msg.sender === "user" ? "flex-end" : "flex-start"
              }}
            >
              <div
                style={{
                  ...styles.bubble,
                  backgroundColor: msg.sender === "user" ? "var(--color-primary)" : "var(--bg-secondary)",
                  color: "#ffffff",
                  borderRadius: msg.sender === "user" ? "12px 12px 0 12px" : "12px 12px 12px 0",
                  position: "relative",
                  paddingRight: msg.sender === "ai" ? "40px" : "12px"
                }}
              >
                {msg.image && (
                  <img 
                    src={msg.image} 
                    alt="Grievance Attachment" 
                    style={{ 
                      width: "100%", 
                      maxWidth: "240px", 
                      borderRadius: "6px", 
                      marginBottom: "8px", 
                      display: "block",
                      border: "1px solid rgba(255,255,255,0.1)"
                    }} 
                  />
                )}
                <span>{msg.text}</span>
                {msg.sender === "ai" && (
                  <button
                    type="button"
                    onClick={() => speakMessage(msg.text, index)}
                    style={{
                      position: "absolute",
                      right: "8px",
                      bottom: "8px",
                      background: "none",
                      border: "none",
                      color: isPlayingMessageIndex === index ? "#10b981" : "rgba(255,255,255,0.6)",
                      cursor: "pointer",
                      fontSize: "14px",
                      padding: "2px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                    title="Listen to this message"
                  >
                    {isPlayingMessageIndex === index ? "⏹️" : "🔊"}
                  </button>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div style={styles.messageRow}>
              <div style={{ ...styles.bubble, backgroundColor: "var(--bg-secondary)", color: "var(--text-secondary)" }}>
                Thinking and drafting...
              </div>
            </div>
          )}
        </div>

        {/* Draft Editor Card */}
        {draft && (
          <div className="card" style={styles.draftCard}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-light)", paddingBottom: "10px", marginBottom: "15px" }}>
              <h3 style={{ margin: 0, color: "var(--color-accent)" }}>
                📝 Official Grievance Preview
              </h3>
              <span style={styles.bhashiniBadge}>🌐 Powered by Bhashini AI</span>
            </div>
            
            <div style={styles.draftField}>
              <label style={styles.draftLabel}>Grievance Department (Auto-Detected)</label>
              <input
                type="text"
                value={draft.department}
                onChange={(e) => setDraft({ ...draft, department: e.target.value })}
                style={styles.draftInput}
              />
            </div>

            <div style={styles.draftField}>
              <label style={styles.draftLabel}>Grievance Severity / Priority (Auto-Classified)</label>
              <select
                value={draft.priority}
                onChange={(e) => setDraft({ ...draft, priority: e.target.value })}
                style={styles.draftInput}
              >
                <option value="High">🔴 High (Emergency/Safety/Critical Service disruption)</option>
                <option value="Medium">🟡 Medium (Standard Grievance/Broken facilities)</option>
                <option value="Low">🔵 Low (Inquiries/General feedback)</option>
              </select>
            </div>

            <div style={styles.draftField}>
              <label style={styles.draftLabel}>Complaint Subject / Title</label>
              <input
                type="text"
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                style={styles.draftInput}
              />
            </div>

            <div style={styles.draftField}>
              <label style={styles.draftLabel}>Formal Application Draft</label>
              <textarea
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                style={styles.draftTextarea}
              />
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "10px", flexWrap: "wrap" }}>
              <button onClick={submitDraft} style={{ flex: 2 }}>
                🚀 Submit Complaint to Department
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={speakDraft}
                style={{ flex: 1, display: "flex", gap: "8px", alignItems: "center" }}
              >
                {isPlayingSpeech ? "⏹️ Stop" : "🔊 Listen"}
              </button>
              <button
                className="btn-secondary"
                onClick={handleDiscard}
                style={{ flexShrink: 0 }}
              >
                Discard
              </button>
            </div>
          </div>
        )}

        {/* Submission success card */}
        {submittedId && (
          <div className="card" style={{ border: "2px solid var(--color-completed)", background: "rgba(16, 185, 129, 0.05)" }}>
            <h4 style={{ color: "var(--color-completed)", marginBottom: "8px" }}>✅ Complaint Registered Successfully!</h4>
            <p>Your Complaint ID is <strong>{submittedId}</strong>.</p>
            <p>You can track its resolution status using the tracking button in the navbar.</p>
          </div>
        )}

        {/* Selected Image Preview */}
        {imageBase64 && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            background: "rgba(249, 115, 22, 0.08)",
            border: "1px solid rgba(249, 115, 22, 0.2)",
            padding: "10px 16px",
            borderRadius: "8px",
            marginBottom: "12px"
          }}>
            <img 
              src={imageBase64} 
              alt="Grievance Preview" 
              style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "6px", border: "1px solid var(--border-light)" }} 
            />
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: "13px", fontWeight: "700", display: "block", color: "var(--text-primary)" }}>📷 Photo Attached</span>
              <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                {imageAnalysis ? `AI Analysis: ${imageAnalysis}` : "Awaiting processing..."}
              </span>
            </div>
            <button 
              type="button" 
              onClick={() => { setImageBase64(""); setImageAnalysis(""); }} 
              style={{
                backgroundColor: "#ef4444",
                color: "#ffffff",
                border: "none",
                padding: "4px 10px",
                borderRadius: "4px",
                fontSize: "11px",
                cursor: "pointer",
                fontWeight: "700"
              }}
            >
              Remove
            </button>
          </div>
        )}

        {/* Input Bar */}
        <form onSubmit={handleSend} style={styles.inputForm}>
          <button
            type="button"
            onClick={startListening}
            style={{
              ...styles.micButton,
              backgroundColor: isListening ? "#ef4444" : "rgba(255,255,255,0.05)",
              border: isListening ? "1px solid #ef4444" : "1px solid var(--border-light)",
              color: isListening ? "#ffffff" : "var(--text-primary)"
            }}
            title="Speak (Voice input in preferred language)"
          >
            {isListening ? "🎙️ Recording..." : "🎤 Speak"}
          </button>
          <label style={{
            ...styles.micButton,
            backgroundColor: "rgba(255,255,255,0.05)",
            border: "1px solid var(--border-light)",
            color: "var(--text-primary)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 16px",
            margin: 0
          }} title="Attach photo of the grievance">
            📷 Photo
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageChange} 
              style={{ display: "none" }} 
            />
          </label>
          <input
            type="text"
            placeholder={isListening ? "Listening now... speak clearly." : "Explain your problem or attach a photo..."}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={loading}
            style={styles.chatInput}
          />
          <button type="submit" disabled={loading || (!message.trim() && !imageBase64)} style={styles.sendButton}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  chatHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid var(--border-light)",
    paddingBottom: "20px",
    marginBottom: "20px",
    flexWrap: "wrap",
    gap: "10px"
  },
  langSelectContainer: {
    display: "flex",
    alignItems: "center",
  },
  langSelect: {
    width: "160px",
    padding: "8px 12px",
    margin: 0,
    fontSize: "13px",
  },
  messagesPanel: {
    flex: 1,
    minHeight: "300px",
    maxHeight: "450px",
    overflowY: "auto",
    paddingRight: "8px",
    marginBottom: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  messageRow: {
    display: "flex",
    width: "100%",
  },
  bubble: {
    maxWidth: "70%",
    padding: "12px 18px",
    fontSize: "15px",
    lineHeight: "1.4",
  },
  inputForm: {
    display: "flex",
    gap: "12px",
    marginTop: "auto"
  },
  chatInput: {
    flex: 1,
    margin: 0,
    padding: "14px 18px",
  },
  sendButton: {
    padding: "0 24px",
  },
  micButton: {
    padding: "0 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  bhashiniBadge: {
    fontSize: "12px",
    background: "rgba(249, 115, 22, 0.15)",
    color: "#fdba74",
    border: "1px solid rgba(249, 115, 22, 0.3)",
    padding: "4px 10px",
    borderRadius: "6px",
    fontWeight: "600"
  },
  draftCard: {
    marginTop: "20px",
    border: "1px solid var(--border-accent)",
    boxShadow: "0 10px 30px rgba(249, 115, 22, 0.15)",
  },
  draftField: {
    marginBottom: "16px",
  },
  draftLabel: {
    fontSize: "13px",
    fontWeight: "700",
    color: "var(--text-secondary)",
    display: "block",
    marginBottom: "6px",
  },
  draftInput: {
    margin: 0,
    padding: "10px 14px",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
  draftTextarea: {
    margin: 0,
    padding: "12px 16px",
    minHeight: "180px",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  }
};

export default AIChat;