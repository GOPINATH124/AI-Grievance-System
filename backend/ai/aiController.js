const { GoogleGenerativeAI } = require("@google/generative-ai");
const bhashini = require("./bhashiniService");
const Complaint = require("../models/Complaint");

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY
);

const generateComplaint = async (req, res) => {
  try {
    const { message, language, imageBase64 } = req.body;
    
    console.log(`[AI Controller] Received draft request. Preferred Lang: ${language}, Image Attached: ${!!imageBase64}`);
    
    let imageAnalysisResult = "";
    let isImageValid = true;
    let visualDetails = "";
    let visualLandmarks = "";

    if (imageBase64) {
      console.log(`[AI Controller] Image upload detected. Running Gemini Vision verification...`);
      const hasGeminiKey = process.env.GEMINI_API_KEY && 
                            !process.env.GEMINI_API_KEY.startsWith("your_") && 
                            process.env.GEMINI_API_KEY !== "";
      
      if (!hasGeminiKey) {
        console.warn("[AI Controller] Gemini API key missing. Mocking image verification.");
        imageAnalysisResult = "Verified via offline fallback. Image displays public grievance.";
        visualDetails = "Municipal service disruption or hazard";
      } else {
        try {
          const matches = imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
          let mimeType = "image/png";
          let base64String = imageBase64;
          if (matches && matches.length === 3) {
            mimeType = matches[1];
            base64String = matches[2];
          }

          const visionModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
          const visionResult = await visionModel.generateContent([
            {
              text: "Verify if this image depicts a public grievance, infrastructure issue, service disruption, or hazard (e.g., broken road, sewage overflow, electricity line breakdown, garbage piling, water leakage, water clogging, flooding, street light broken, dog threat, active construction, administrative delay, or similar municipal issues). Respond strictly in this format:\nValid: [Yes/No]\nDescription: [Concise description of what is shown in the image]\nLandmarks: [Any visible text, signs, names, or location clues in the image, or 'None']"
            },
            {
              inlineData: {
                data: base64String,
                mimeType: mimeType
              }
            }
          ]);
          const visionText = visionResult.response.text();
          console.log("[AI Controller] Gemini Vision Raw Output:\n", visionText);

          // Parse vision result
          const validMatch = visionText.match(/Valid\s*:\s*(.*)/i);
          const descMatch = visionText.match(/Description\s*:\s*(.*)/i);
          const landmarksMatch = visionText.match(/Landmarks\s*:\s*(.*)/i);

          const isValidStr = validMatch ? validMatch[1].trim().toLowerCase() : "yes";
          if (isValidStr.includes("no")) {
            isImageValid = false;
          }

          visualDetails = descMatch ? descMatch[1].trim() : "Municipal issue photo";
          visualLandmarks = landmarksMatch ? landmarksMatch[1].trim() : "";
          imageAnalysisResult = `Image Verified: ${visualDetails}. Visual Landmarks: ${visualLandmarks || "None"}`;
        } catch (visionErr) {
          console.error("[AI Controller] Gemini Vision analysis failed:", visionErr);
          imageAnalysisResult = "Failed to verify image; proceeding with caution.";
        }
      }

      if (!isImageValid) {
        return res.status(400).json({
          message: "The uploaded image does not appear to show a valid public grievance (such as garbage, road damage, leakage, power lines, etc.). Please upload a relevant photo."
        });
      }
    }

    // Step 1: Translate incoming regional language message to English (via Bhashini)
    let englishMessage = message;
    if (language && language.toLowerCase() !== "english") {
      console.log(`[AI Controller] Translating user message to English using Bhashini...`);
      englishMessage = await bhashini.translateText(message, language, "English");
      console.log(`[AI Controller] Translated English Message: "${englishMessage}"`);
    }

    // Step 2: Use Gemini to process the grievance, identify target department, determine priority, and draft formal application in selected language
    let imageInfoPrompt = "";
    if (visualDetails) {
      imageInfoPrompt = `\nVisual context extracted from user's uploaded photo:\n- What is shown: ${visualDetails}\n- Landmark/Text clues: ${visualLandmarks || "None"}\n`;
    }

    const prompt = `
You are a public grievance analysis assistant.
Analyze this citizen problem (written in English or regional language) and perform the following tasks:
1. Identify the correct government department that handles this issue. Choose ONLY from:
   - Water Supply Department
   - Electricity Department
   - Road and Transport Department
   - Sanitation Department
   - Health Department
   - Revenue Department
2. Determine the priority/severity of the issue. Choose ONLY from:
   - High (for critical issues like medical hazards, water pipeline bursts, power cuts at hospitals, safety concerns, toxic leakage, active flooding)
   - Medium (for standard service issues, bad roads, broken street lights, delayed administrative services)
   - Low (for minor inquiries, suggestion reports, general queries)
3. Create a concise, formal Title for this grievance in the selected language: ${language}.
4. Identify the specific location, area, address, or landmark of the problem if mentioned. If no location details are provided in the problem description, write "Not Specified". (You may use the visual landmark/text clues if provided).
5. Draft a detailed, formal Public Grievance Application letter in the selected language: ${language}, incorporating a polite structure, stating the issue clearly, and requesting prompt redressal.
${imageInfoPrompt}
Citizen Problem:
${englishMessage}

Your response must strictly match this exact format. Do NOT add extra conversation, titles, or introductions:
Title: [A concise formal title in ${language}]
Department: [Exactly one of the listed departments above in English]
Priority: [Exactly one of: High, Medium, Low]
Location: [The identified location/address or 'Not Specified']
Complaint: [The drafted formal complaint letter text in ${language}]
`;

    let responseText = "";
    const hasGeminiKey = process.env.GEMINI_API_KEY && 
                          !process.env.GEMINI_API_KEY.startsWith("your_") && 
                          process.env.GEMINI_API_KEY !== "";

    if (!hasGeminiKey) {
      console.warn("[AI Controller] GEMINI_API_KEY is missing or invalid. Using local rule-based AI generator.");
      responseText = generateRuleBasedComplaintText(message, language);
    } else {
      try {
        console.log(`Attempting complaint generation in ${language} with gemini-2.0-flash...`);
        const model = genAI.getGenerativeModel({
          model: "gemini-2.0-flash"
        });
        const result = await model.generateContent(prompt);
        responseText = result.response.text();
      } catch (error20) {
        console.warn("gemini-2.0-flash failed or unsupported. Retrying with gemini-1.5-flash. Error:", error20.message);
        try {
          const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash"
          });
          const result = await model.generateContent(prompt);
          responseText = result.response.text();
        } catch (error15) {
          console.warn("gemini-1.5-flash also failed. Falling back to local rule-based AI generator. Error:", error15.message);
          responseText = generateRuleBasedComplaintText(message, language);
        }
      }
    }

    console.log("[AI Controller] Raw Gemini output:\n", responseText);

    // Parse the generated English or translated draft
    let title = "";
    let department = "";
    let priority = "Medium";
    let location = "Not Specified";
    let complaint = "";

    const titleRegex = /(?:Title|विषय|தலைப்பு)\s*:\s*(.*)/i;
    const titleMatch = responseText.match(titleRegex);
    if (titleMatch) title = titleMatch[1].trim();

    const deptRegex = /(?:Department|विभाग|துறை)\s*:\s*(.*)/i;
    const deptMatch = responseText.match(deptRegex);
    if (deptMatch) department = deptMatch[1].trim();

    const priorityRegex = /(?:Priority|प्राथमिकता|முன்னுரிமை)\s*:\s*(.*)/i;
    const priorityMatch = responseText.match(priorityRegex);
    if (priorityMatch) priority = priorityMatch[1].trim();

    const locationRegex = /(?:Location|स्थान|இடம்|முகவரி)\s*:\s*(.*)/i;
    const locationMatch = responseText.match(locationRegex);
    if (locationMatch) location = locationMatch[1].trim();

    const compRegex = /(?:Complaint|शिकायत|புகார்)\s*:\s*([\s\S]*)/i;
    const compMatch = responseText.match(compRegex);
    if (compMatch) complaint = compMatch[1].trim();

    // Cleaning formatting like markdown asterisks
    const cleanStr = (str) => str.replace(/\*\*/g, "").trim();

    title = title ? cleanStr(title) : "Grievance Application";
    department = department ? cleanStr(department) : "";
    priority = priority ? cleanStr(priority) : "Medium";
    location = location ? cleanStr(location) : "Not Specified";
    complaint = complaint ? cleanStr(complaint) : responseText;

    // Strict Department Normalization Function
    const normalizeDept = (raw, text) => {
      const combined = (raw + " " + text).toLowerCase();
      if (combined.includes("water") || combined.includes(" जल") || combined.includes("पानी") || combined.includes("தண்ணீர்") || combined.includes("நீர்") || combined.includes("நீரு")) return "Water Supply Department";
      if (combined.includes("electr") || combined.includes("power") || combined.includes("बिजली") || combined.includes("करंट") || combined.includes("மின்சார")) return "Electricity Department";
      if (combined.includes("road") || combined.includes("transport") || combined.includes("pothole") || combined.includes("सड़क") || combined.includes("சாலை") || combined.includes("రహదారి")) return "Road and Transport Department";
      if (combined.includes("sanit") || combined.includes("garbage") || combined.includes("कचरा") || combined.includes("सफाई") || combined.includes("குப்பை") || combined.includes("நாய்") || combined.includes("நாய்த்தாற்று") || combined.includes("கழிவு")) return "Sanitation Department";
      if (combined.includes("health") || combined.includes("hospital") || combined.includes("doctor") || combined.includes("अस्पताल") || combined.includes("மருத்துவ")) return "Health Department";
      return "Revenue Department";
    };

    const finalDepartment = normalizeDept(department, englishMessage);

    // Normalize priority value
    const normalizedPriority = ["high", "medium", "low"].includes(priority.toLowerCase()) ? priority : "Medium";

    // Reconstruct into target format for frontend parser
    const resultText = `Title: ${title}\nDepartment: ${finalDepartment}\nPriority: ${normalizedPriority}\nLocation: ${location}\nComplaint: ${complaint}`;

    res.json({
      result: resultText,
      imageAnalysis: imageAnalysisResult
    });

  } catch (error) {
    console.log("AI generation failed completely:", error);
    try {
      const fs = require("fs");
      const path = require("path");
      fs.writeFileSync(path.join(__dirname, "../error_details.txt"), error.stack || String(error));
    } catch (e) {
      console.error("Failed to write to error_details.txt", e);
    }
    res.status(500).json({
      message: error.message
    });
  }
};

function generateRuleBasedComplaintText(msg, lang) {
  const text = (msg || "").toLowerCase();
  const normalizedLang = (lang || "English").toLowerCase();
  
  // 1. Identify Department
  let department = "Revenue Department";
  if (text.includes("power") || text.includes("electricity") || text.includes("voltage") || text.includes("current") || text.includes("wire") || text.includes("pole") || text.includes("transformer") || text.includes("load shedding") || text.includes("powercut") || text.includes("बिजली") || text.includes("करंट") || text.includes("वायर") || text.includes("மின்சாரம்") || text.includes("ஒளி") || text.includes("மின்") || text.includes("కరెంట్") || text.includes("విద్యుత్") || text.includes("ವಿದ್ಯುತ್")) {
    department = "Electricity Department";
  } else if (text.includes("water") || text.includes("sewage") || text.includes("drain") || text.includes("leakage") || text.includes("pipeline") || text.includes("clog") || text.includes("water supply") || text.includes("water resources") || text.includes("reservoir") || text.includes("lake") || text.includes("canal") || text.includes("pond") || text.includes("पानी") || text.includes("जल") || text.includes("पाइप") || text.includes("सीवर") || text.includes("தண்ணீர்") || text.includes("நீர்") || text.includes("நீரு")) {
    department = "Water Supply Department";
  } else if (text.includes("road") || text.includes("pothole") || text.includes("highway") || text.includes("bridge") || text.includes("construction") || text.includes("path") || text.includes("street") || text.includes("सड़क") || text.includes("रास्ता") || text.includes("गड्ढा") || text.includes("मार्ग") || text.includes("சாலை") || text.includes("பாதை") || text.includes("தெரு") || text.includes("రహదారి") || text.includes("రోడ్డు") || text.includes("ರಸ್ತೆ")) {
    department = "Road and Transport Department";
  } else if (text.includes("garbage") || text.includes("trash") || text.includes("clean") || text.includes("street light") || text.includes("parks") || text.includes("sanitation") || text.includes("toilet") || text.includes("waste") || text.includes("drainage") || text.includes("कचरा") || text.includes("सफाई") || text.includes("குப்பை") || text.includes("சுத்தம்") || text.includes("முరికి") || text.includes("ಕಸ")) {
    department = "Sanitation Department";
  } else if (text.includes("health") || text.includes("hospital") || text.includes("doctor") || text.includes("medicine") || text.includes("disease") || text.includes("fever") || text.includes("अस्पताल") || text.includes("दवा") || text.includes("चिकित्सा") || text.includes("மருத்துவமனை") || text.includes("மருந்து") || text.includes("ఆసుపత్రి") || text.includes("ಔಷಧಿ")) {
    department = "Health Department";
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
  
  let title = "";
  let complaint = "";
  
  if (normalizedLang === "hindi") {
    title = `विभाग: ${department} - शिकायत (${summary})`;
    complaint = `सेवा में,\nअधिकारी महोदय,\n[${department}] विभाग,\n\nविषय: शिकायत आवेदन पत्र\n\nआदरणीय महोदय/महोदया,\n\nमैं इस पत्र के माध्यम से हमारे क्षेत्र की निम्नलिखित समस्या की ओर आपका ध्यान आकर्षित करना चाहता हूँ:\n\n"${cleanMsg}"\n\nयह समस्या हमारे क्षेत्र के निवासियों के लिए अत्यंत असुविधाजनक बनी हुई है। आपसे विनम्र अनुरोध है कि इस मामले का संज्ञान लेते हुए इसका जल्द से जल्द समाधान करने की कृपा करें।\n\nधन्यवाद।\n\nभवदीय,\nस्थानीय निवासी`;
  } else if (normalizedLang === "tamil") {
    title = `துறை: ${department} - புகார் (${summary})`;
    complaint = `பெறுநர்,\nஅதிகாரிகள்,\n[${department}] துறை,\n\nபொருள்: பொதுப் புகார் விண்ணப்பம்\n\nமதிப்பிற்குரிய ஐயா/அம்மா,\n\nஎங்கள் பகுதியில் உள்ள பின்வரும் பிரச்சனையை உங்கள் கவனத்திற்கு கொண்டு வர விரும்புகிறேன்:\n\n"${cleanMsg}"\n\nஇந்த பிரச்சனை எங்கள் பகுதி மக்களுக்கு மிகுந்த சிரமத்தை ஏற்படுத்துகிறது. தயவுசெய்து இந்த பிரச்சனையை விரைவில் சரிசெய்ய நடவடிக்கை எடுக்குமாறு கேட்டுக்கொள்கிறேன்.\n\nநன்றி,\n\nஇப்படிக்கு,\nபொதுமக்கள்`;
  } else if (normalizedLang === "telugu") {
    title = `శాఖ: ${department} - ఫిర్యాదు (${summary})`;
    complaint = `గౌరవనీయులైన అధికారి గారికి,\n[${department}] శాఖ,\n\nవిషయం: ప్రజా ఫిర్యాదు దరఖాస్తు\n\nఅయ్యా/అమ్మా,\n\nమా పరిధిలోని ఈ క్రింది సమస్యను మీ దృష్టికి తీసుకురావాలనుకుంటున్నాను:\n\n"${cleanMsg}"\n\nఈ సమస్య వల్ల మా ప్రాంత ప్రజలు తీవ్ర ఇబ్బందులు పడుతున్నారు. దయచేసి ఈ సమస్యను త్వరగా పరిష్కరించాలని కోరుతున్నాము.\n\nధన్యవాదాలు,\n\nఇట్లు,\nస్థానిక పౌరుడు`;
  } else if (normalizedLang === "kannada") {
    title = `ಇಲಾಖೆ: ${department} - ದೂರು (${summary})`;
    complaint = `ಗೌರವಾನ್ವಿತ ಅಧಿಕಾರಿಗಳಿಗೆ,\n[${department}] ಇಲಾಖೆ,\n\nವಿಷಯ: ಸಾರ್ವಜನಿಕ ದೂರು ಅರ್ಜಿ\n\nಮಾನ್ಯರೇ,\n\nನಮ್ಮ ಪ್ರದೇಶದಲ್ಲಿನ ಈ ಕೆಳಗಿನ ಸಮಸ್ಯೆಯನ್ನು ನಿಮ್ಮ ಗಮನಕ್ಕೆ ತರಬಯಸುತ್ತೇನೆ:\n\n"${cleanMsg}"\n\nಈ ಸಮಸ್ಯೆಯಿಂದ ನಮ್ಮ ಪ್ರದೇಶದ ನಿವಾಸಿಗಳು ತೊಂದರೆ ಅನುಭವಿಸುತ್ತಿದ್ದಾರೆ. ದಯವಿಟ್ಟು ಈ ಸಮಸ್ಯೆಯನ್ನು ಆದಷ್ಟು ಬೇಗ ಪರಿಹರಿಸಿಕೊಡಬೇಕಾಗಿ ವಿನಂತಿ.\n\nಧನ್ಯವಾದಗಳು,\n\nಇಂತಿ,\nಸ್ಥಳೀಯ ನಾಗರಿಕ`;
  } else if (normalizedLang === "bengali") {
    title = `বিভাগ: ${department} - অভিযোগ (${summary})`;
    complaint = `মাননীয় আধিকারিক মহাশয়,\n[${department}] विभाग,\n\nবিষয়: সাধারণ অভিযোগ আবেদন\n\nমহাশয়/মহাশয়া,\n\nআমি আমাদের এলাকার নিম্নলিখিত সমস্যাটি আপনার নজরে আনতে চাই:\n\n"${cleanMsg}"\n\nএই সমস্যার কারণে আমাদের এলাকার বাসিন্দারা চরম অসুবিধার সম্মুখীন হচ্ছেন। অনুগ্রহ করে অবিলম্বে এই সমস্যার সমাধান করুন।\n\nধন্যবাদান্তে,\n\nবিনীত,\nস্থানীয় নাগরিক`;
  } else if (normalizedLang === "marathi") {
    title = `विभाग: ${department} - तक्रार (${summary})`;
    complaint = `प्रति,\nमा. अधिकारी साहेब,\n[${department}] विभाग,\n\nविषय: तक्रार अर्ज\n\nमहोदय,\n\nमी या पत्राद्वारे आमच्या परिसरातील खालील समस्येकडे आपले लक्ष वेधू इच्छितो:\n\n"${cleanMsg}"\n\nया समस्येमुळे स्थानिक रहिवाशांना नाहक त्रास सहन करावा लागत आहे. तरी आपण या समस्येचे लवकरात लवकर निवारण करावे, ही नम्र विनंती.\n\nधन्यवाद।\n\nआपला नम्र,\nस्थानिक नागरिक`;
  } else if (normalizedLang === "gujarati") {
    title = `વિભાગ: ${department} - ફરિયાદ (${summary})`;
    complaint = `માનનીય અધિકારીશ્રી,\n[${department}] વિભાગ,\n\nવિષય: જાહેર ફરિયાદ અરજી\n\nઆદરણીય સાહેબ/મેડમ,\n\nહું આ પત્ર દ્વારા અમારા વિસ્તારની નીચેની સમસ્યા તરફ આપનું ધ્યાન દોરવા માંગું છું:\n\n"${cleanMsg}"\n\nઆ સમસ્યાને કારણે અમારા વિસ્તારના લોકોને ભારે હાલાકી ભોગવવી પડી રહી છે. મહેરબાની કરી આ સમસ્યાનું વહેલી તકે નિરાકરણ લાવવા વિનંती છે.\n\nઆભાર,\n\nલિ. પબ્લિક`;
  } else {
    // Default English
    title = `${department} Complaint - ${summary}`;
    complaint = `To,\nThe Officer in Charge,\nDepartment of ${department},\n\nSubject: Formal Grievance Application regarding ${title}\n\nRespected Sir/Madam,\n\nI am writing to draw your attention to a pressing public issue in our locality. Specifically, the citizen has reported the following concern:\n\n"${cleanMsg}"\n\nThis issue is causing significant inconvenience and challenges to local residents and needs to be addressed on a priority basis. We kindly request you to inspect the situation and take necessary actions to resolve this grievance at the earliest.\n\nThank you for your time, cooperation, and prompt attention to this matter.\n\nSincerely,\nConcerned Citizen`;
  }
  
  return `Title: ${title}\nDepartment: ${department}\nPriority: ${priority}\nComplaint: ${complaint}`;
}

const suggestResolution = async (req, res) => {
  try {
    const { complaintId } = req.body;
    if (!complaintId) {
      return res.status(400).json({ message: "complaintId is required" });
    }

    const complaint = await Complaint.findOne({ complaintId });
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // Find similar resolved complaints in the same department for few-shot learning
    const similarResolved = await Complaint.find({
      department: complaint.department,
      status: "Resolved",
      reply: { $ne: "" }
    }).limit(3);

    let examplesText = "";
    if (similarResolved.length > 0) {
      examplesText = similarResolved.map(c => 
        `Grievance: ${c.title} - ${c.description}\nResolution Action: ${c.reply}`
      ).join("\n\n");
    }

    const prompt = `
You are an experienced administrative resolution officer for the municipal ${complaint.department}.
A citizen has registered a grievance with the following details:
Grievance ID: ${complaint.complaintId}
Title: ${complaint.title}
Description: ${complaint.description}
Location: ${complaint.location}
Priority: ${complaint.priority}
Language: ${complaint.language || "English"}

${examplesText ? `Here are examples of how similar complaints were resolved in your department:\n${examplesText}\n` : ""}

Draft a formal, polite, and actionable official resolution reply in the language: ${complaint.language || "English"}.
In the response:
1. Address the citizen politely.
2. State the actions taken (e.g., dispatched maintenance crews, repaired broken lines, cleaned the dump sites, or coordinated with civil teams).
3. Confirm that the issue has been successfully resolved.
4. Keep the tone reassuring and professional.

Write ONLY the final reply text. Do NOT add extra greetings, titles, metadata prefixes, or notes.
`;

    let replyText = "";
    const hasGeminiKey = process.env.GEMINI_API_KEY && 
                          !process.env.GEMINI_API_KEY.startsWith("your_") && 
                          process.env.GEMINI_API_KEY !== "";

    if (!hasGeminiKey) {
      replyText = `Dear Citizen,\n\nThank you for raising this issue regarding ${complaint.title} at ${complaint.location}. We have registered this under ${complaint.department}. A service crew was dispatched to investigate and has successfully resolved this matter.\n\nSincerely,\n${complaint.department} Support Team`;
    } else {
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent(prompt);
        replyText = result.response.text().trim();
      } catch (error) {
        console.error("Resolution suggestion failed, using default template:", error);
        replyText = `Dear Citizen,\n\nThank you for raising this issue regarding ${complaint.title} at ${complaint.location}. We have registered this under ${complaint.department}. A service crew was dispatched to investigate and has successfully resolved this matter.\n\nSincerely,\n${complaint.department} Support Team`;
      }
    }

    res.json({ suggestion: replyText });
  } catch (error) {
    console.error("Failed to suggest resolution:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  generateComplaint,
  suggestResolution
};