const Complaint = require("../models/Complaint");
const DepartmentComplaint = require("../models/DepartmentComplaint");
const User = require("../models/User");
const { sendSMS } = require("../utils/smsService");
const { sendEmail } = require("../utils/emailService");


// Create Complaint

const createComplaint = async(req,res)=>{
  try{
    const {
      title,
      description,
      department,
      language,
      priority,
      location,
      aiLetter,
      isAiGenerated,
      translationStatus,
      imageBase64,
      imageAnalysis,
      isDigiLockerAttached,
      digiLockerDocType,
      digiLockerDocName,
      latitude,
      longitude
    }=req.body;

    const hasGeminiKey = process.env.GEMINI_API_KEY && 
                          !process.env.GEMINI_API_KEY.startsWith("your_") && 
                          process.env.GEMINI_API_KEY !== "";

    // 1. Excluded Matters Screening (AI with regex fallback)
    if (hasGeminiKey) {
      try {
        const { GoogleGenerativeAI } = require("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const screenPrompt = `
You are an official government screening AI for public grievances.
Government grievance portals are legally prohibited from accepting the following categories of issues:
1. Sub-judice (cases currently pending in any court of law).
2. Right to Information (RTI) requests (asking for files, copies of documents, or official information under the RTI Act, rather than complaining about service deficiencies).
3. Religious matters or disputes.
4. Personal service/employee matters of government employees (transfers, promotions, salary/pension disputes of active employees, which have separate departmental channels).

Analyze this new complaint:
Title: ${title}
Description: ${description}

If the complaint fits into one of these EXCLUDED categories, reply with a JSON object in this format (no extra markdown styling or backticks, just raw JSON):
{
  "isExcluded": true,
  "category": "RTI Matter" | "Sub-judice Matter" | "Religious Matter" | "Employee Service Matter",
  "reason": "Explain why it is excluded.",
  "redirect": "A helpful link (e.g., 'https://rtionline.gov.in' for RTI, 'https://districts.ecourts.gov.in' for sub-judice)"
}

If the complaint is a VALID public grievance (not excluded), reply with:
{
  "isExcluded": false
}
`;

        const screenResult = await model.generateContent(screenPrompt);
        let screenText = screenResult.response.text().trim();
        if (screenText.startsWith("```json")) {
          screenText = screenText.substring(7, screenText.length - 3).trim();
        } else if (screenText.startsWith("```")) {
          screenText = screenText.substring(3, screenText.length - 3).trim();
        }

        const screenJson = JSON.parse(screenText);
        if (screenJson.isExcluded) {
          console.log(`[Screening] Complaint blocked. Category: ${screenJson.category}`);
          return res.status(400).json({
            isExcluded: true,
            category: screenJson.category,
            reason: screenJson.reason,
            redirect: screenJson.redirect,
            message: `Submission Blocked: This issue falls under an excluded category (${screenJson.category}).`
          });
        }
      } catch (err) {
        console.error("[Screening] AI check failed or bypassed:", err.message);
        
        // Simple regex fallback
        const lowerDesc = (description || "").toLowerCase() + " " + (title || "").toLowerCase();
        if (lowerDesc.includes("rti act") || lowerDesc.includes("right to information") || lowerDesc.includes("under rti")) {
          return res.status(400).json({
            isExcluded: true,
            category: "RTI Matter",
            reason: "Requests for official information or documents must be filed under the RTI Act rather than the public grievance portal.",
            redirect: "https://rtionline.gov.in",
            message: "Submission Blocked: This issue falls under an excluded category (RTI Matter)."
          });
        }
        if (lowerDesc.includes("court case") || lowerDesc.includes("sub judice") || lowerDesc.includes("pending in court") || lowerDesc.includes("pending in high court")) {
          return res.status(400).json({
            isExcluded: true,
            category: "Sub-judice Matter",
            reason: "Matters that are pending in a court of law cannot be redressed through this administrative grievance portal.",
            redirect: "https://districts.ecourts.gov.in",
            message: "Submission Blocked: This issue falls under an excluded category (Sub-judice Matter)."
          });
        }
      }
    } else {
      // Regex fallback if no API key
      const lowerDesc = (description || "").toLowerCase() + " " + (title || "").toLowerCase();
      if (lowerDesc.includes("rti act") || lowerDesc.includes("right to information") || lowerDesc.includes("under rti")) {
        return res.status(400).json({
          isExcluded: true,
          category: "RTI Matter",
          reason: "Requests for official information or documents must be filed under the RTI Act rather than the public grievance portal.",
          redirect: "https://rtionline.gov.in",
          message: "Submission Blocked: This issue falls under an excluded category (RTI Matter)."
        });
      }
      if (lowerDesc.includes("court case") || lowerDesc.includes("sub judice") || lowerDesc.includes("pending in court") || lowerDesc.includes("pending in high court")) {
        return res.status(400).json({
          isExcluded: true,
          category: "Sub-judice Matter",
          reason: "Matters that are pending in a court of law cannot be redressed through this administrative grievance portal.",
          redirect: "https://districts.ecourts.gov.in",
          message: "Submission Blocked: This issue falls under an excluded category (Sub-judice Matter)."
        });
      }
    }

    const complaintId = "GRV" + Date.now();

    // 2. Process base64 image if attached
    let imageUrl = "";
    if (imageBase64) {
      try {
        const { saveBase64Image } = require("../utils/uploadHelper");
        imageUrl = saveBase64Image(imageBase64);
        console.log(`[Complaint Controller] Successfully saved photo to: ${imageUrl}`);
      } catch (err) {
        console.error("[Complaint Controller] Image save failed:", err.message);
      }
    }

    // 3. Duplicate Complaint Clustering
    let parentComplaintId = "";
    let isDuplicate = false;
    let finalStatus = "Pending";

    if (hasGeminiKey && department && department !== "Not Assigned" && department !== "Revenue Department") {
      try {
        // Find recent active complaints in the same department
        const activeComplaints = await Complaint.find({
          department,
          status: { $in: ["Pending", "Assigned", "Processing"] },
          isDuplicate: false
        }).limit(10);

        if (activeComplaints.length > 0) {
          const listText = activeComplaints.map(c => 
            `ID: ${c.complaintId}\nTitle: ${c.title}\nDescription: ${c.description}\nLocation: ${c.location}`
          ).join("\n---\n");

          const prompt = `
You are a municipal duplicate detection system.
Analyse if this new complaint describes the exact same local/physical issue at the exact same location as any of the existing active complaints in the list below.
A match means it is the exact same problem (e.g. same water leak, same broken wire, same road pothole, same garbage pile) reported by a different citizen in the same area.

New Complaint:
Title: ${title}
Description: ${description}
Location: ${location || "Not Specified"}

Active Complaints:
${listText}

If there is a match, reply with ONLY the ID of the matching complaint (e.g. GRV12345678). If there is no match, reply with 'None'. Do not add any explanation, notes, or formatting.
`;

          const { GoogleGenerativeAI } = require("@google/generative-ai");
          const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
          const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
          const result = await model.generateContent(prompt);
          const matchResult = result.response.text().trim();
          console.log(`[Complaint Controller] Duplicate Search Result: "${matchResult}"`);

          if (matchResult && matchResult !== "None" && matchResult.startsWith("GRV")) {
            const parent = await Complaint.findOne({ complaintId: matchResult });
            if (parent) {
              parentComplaintId = parent.complaintId;
              isDuplicate = true;
              finalStatus = "Linked";
              
              // Increment duplicateCount on parent
              parent.duplicateCount = (parent.duplicateCount || 0) + 1;
              await parent.save();
              console.log(`[Complaint Controller] Linked new complaint ${complaintId} to parent ${parent.complaintId}`);
            }
          }
        }
      } catch (err) {
        console.error("[Complaint Controller] Duplicate detection error:", err.message);
      }
    }

    const complaint = await Complaint.create({
      userId: req.user._id,
      complaintId,
      title,
      description,
      department,
      language,
      priority: priority || "Medium",
      location: location || "Not Specified",
      aiLetter: aiLetter || "",
      isAiGenerated: isAiGenerated || false,
      translationStatus: translationStatus || "Not Required",
      imageUrl,
      imageAnalysis: imageAnalysis || "",
      parentComplaintId,
      isDuplicate,
      status: finalStatus,
      isDigiLockerAttached: isDigiLockerAttached || false,
      digiLockerDocType: digiLockerDocType || "",
      digiLockerDocName: digiLockerDocName || "",
      latitude: latitude || 12.9716,
      longitude: longitude || 77.5946
    });

    // Send SMS notification to citizen
    let phoneToUse = req.user ? req.user.phone : "";
    if (req.body.phone && req.user && req.user.phone !== req.body.phone) {
      req.user.phone = req.body.phone;
      await req.user.save();
      phoneToUse = req.body.phone;
    }

    if (phoneToUse) {
      await sendSMS(
        phoneToUse,
        `✍️ LokSeva Alert: Your Grievance has been registered successfully! Reference ID: ${complaintId}. Status: ${finalStatus}. Track online at: http://localhost:5173/track?id=${complaintId}`
      );
    }

    let emailToUse = req.user ? req.user.email : "";
    if (req.body.email && req.user && req.user.email !== req.body.email) {
      req.user.email = req.body.email;
      await req.user.save();
      emailToUse = req.body.email;
    }

    if (emailToUse && !emailToUse.startsWith("user_")) {
      await sendEmail(
        emailToUse,
        `✍️ LokSeva Grievance Registered: ${complaintId}`,
        `Hello ${req.user.name},\n\nYour grievance has been successfully submitted to the LokSeva portal!\n\nReference ID: ${complaintId}\nTitle: ${title}\nDepartment: ${department}\nStatus: ${finalStatus}\n\nYou can track the live progress of your grievance at: http://localhost:5173/track?id=${complaintId}\n\nThank you,\nLokSeva Support Team`
      );
    }

    res.json({
      message: "Grievance submitted successfully",
      complaint
    });
  } catch(error){
    res.status(500).json({
      message:error.message
    });
  }
};



// Get Complaints

const getComplaints = async(req,res)=>{


const complaints =
await Complaint.find({
userId:req.user._id
});


res.json(complaints);

};



// Track Complaint
const trackComplaint = async(req,res)=>{
  try{
    const searchId = (req.params.id || "").trim();
    if (!searchId) {
      return res.status(400).json({ message: "Grievance ID is required" });
    }

    const regex = new RegExp(`^${searchId}$`, "i");

    let complaint = await Complaint.findOne({
      complaintId: { $regex: regex }
    });

    if (!complaint) {
      // Fallback search in DepartmentComplaint collection
      const deptComp = await DepartmentComplaint.findOne({ complaintId: { $regex: regex } });
      if (deptComp) {
        return res.json({
          _id: deptComp._id,
          complaintId: deptComp.complaintId,
          title: deptComp.complaintType || "Grievance Complaint",
          description: `[Department Record] Priority: ${deptComp.priority}. Handled by ${deptComp.department}.`,
          priority: deptComp.priority || "Medium",
          status: deptComp.status || "Pending",
          department: deptComp.department,
          officer: deptComp.assignedOfficer || "Awaiting Assignment",
          reply: deptComp.resolutionNote || deptComp.officialReply || null,
          createdAt: deptComp.createdAt || new Date(),
          feedbackRating: deptComp.feedbackRating,
          feedbackComment: deptComp.feedbackComment
        });
      }
      return res.status(404).json({ message: "Complaint not found" });
    }

    res.json({
      _id: complaint._id,
      complaintId: complaint.complaintId,
      title: complaint.title,
      description: complaint.description,
      priority: complaint.priority,
      status: complaint.status,
      department: complaint.department,
      officer: complaint.officer,
      reply: complaint.reply || complaint.officialReply,
      createdAt: complaint.createdAt,
      feedbackRating: complaint.feedbackRating,
      feedbackComment: complaint.feedbackComment,
      appealComment: complaint.appealComment || "",
      appealDate: complaint.appealDate || null,
      clarificationQuestion: complaint.clarificationQuestion || "",
      clarificationAnswer: complaint.clarificationAnswer || "",
      interimReply: complaint.interimReply || "",
      interimReplyDate: complaint.interimReplyDate || null,
      isDigiLockerAttached: complaint.isDigiLockerAttached || false,
      digiLockerDocType: complaint.digiLockerDocType || "",
      digiLockerDocName: complaint.digiLockerDocName || "",
      latitude: complaint.latitude || 12.9716,
      longitude: complaint.longitude || 77.5946,
      subscriberCount: complaint.subscriberCount || 0,
      isSubscribed: req.user ? (complaint.subscribers || []).includes(req.user._id) : false
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const Notification = require("../models/Notification");

const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const readNotifications = async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user._id, read: false }, { $set: { read: true } });
    res.json({ message: "Notifications marked as read" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const submitFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    if (!rating) {
      return res.status(400).json({ message: "Rating is required" });
    }
    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ message: "Grievance not found" });
    }
    if (complaint.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to submit feedback for this complaint" });
    }
    complaint.feedbackRating = rating;
    complaint.feedbackComment = comment || "";
    await complaint.save();
    res.json({ message: "Feedback submitted successfully", complaint });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const appealComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { appealComment } = req.body;
    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ message: "Grievance not found" });
    }
    if (complaint.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to appeal this complaint" });
    }
    complaint.status = "Escalated (Level 2)";
    complaint.appealComment = appealComment || "Citizen is unsatisfied with the resolution.";
    complaint.appealDate = new Date();
    await complaint.save();
    res.json({ message: "Grievance escalated successfully", complaint });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const submitClarification = async (req, res) => {
  try {
    const { id } = req.params;
    const { clarificationAnswer } = req.body;
    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ message: "Grievance not found" });
    }
    if (complaint.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to submit clarification for this complaint" });
    }
    complaint.clarificationAnswer = clarificationAnswer || "";
    complaint.clarificationAnswerDate = new Date();
    complaint.status = "Processing"; // Revert status to Processing after clarification response
    await complaint.save();
    res.json({ message: "Clarification response submitted successfully", complaint });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPublicGrievances = async (req, res) => {
  try {
    let complaints = await Complaint.find({
      isDuplicate: false
    }).select("complaintId title description priority status department latitude longitude subscriberCount");
    
    if (complaints.length === 0) {
      const fallbacks = [
        { complaintId: "GRV101", title: "Water Line Leakage", description: "Water leaking at main road corner.", priority: "High", status: "Pending", department: "Water Supply Department", latitude: 12.9720, longitude: 77.5950, subscriberCount: 4 },
        { complaintId: "GRV102", title: "Street Light Broken", description: "All streetlights are off since 3 days.", priority: "Medium", status: "Processing", department: "Electricity Department", latitude: 12.9750, longitude: 77.5910, subscriberCount: 12 },
        { complaintId: "GRV103", title: "Open Garbage Dump", description: "Garbage piled up near park entrance.", priority: "Emergency", status: "Assigned", department: "Sanitation Department", latitude: 12.9690, longitude: 77.5980, subscriberCount: 23 }
      ];
      
      const adminUser = await User.findOne({ role: "admin" }) || await User.findOne();
      const creatorId = adminUser ? adminUser._id : req.user?._id;

      if (creatorId) {
        for (const item of fallbacks) {
          await Complaint.create({
            userId: creatorId,
            ...item,
            isDuplicate: false
          });
        }
        
        complaints = await Complaint.find({
          isDuplicate: false
        }).select("complaintId title description priority status department latitude longitude subscriberCount");
      }
    }

    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const subscribeToGrievance = async (req, res) => {
  try {
    let complaint = await Complaint.findOne({ complaintId: req.params.id });
    if (!complaint) {
      const fallbacks = {
        "GRV101": { title: "Water Line Leakage", description: "Water leaking at main road corner.", priority: "High", status: "Pending", department: "Water Supply Department", latitude: 12.9720, longitude: 77.5950, subscriberCount: 4 },
        "GRV102": { title: "Street Light Broken", description: "All streetlights are off since 3 days.", priority: "Medium", status: "Processing", department: "Electricity Department", latitude: 12.9750, longitude: 77.5910, subscriberCount: 12 },
        "GRV103": { title: "Open Garbage Dump", description: "Garbage piled up near park entrance.", priority: "Emergency", status: "Assigned", department: "Sanitation Department", latitude: 12.9690, longitude: 77.5980, subscriberCount: 23 }
      };

      const seed = fallbacks[req.params.id];
      if (seed) {
        const adminUser = await User.findOne({ role: "admin" }) || await User.findOne();
        const creatorId = adminUser ? adminUser._id : req.user._id;

        complaint = await Complaint.create({
          userId: creatorId,
          complaintId: req.params.id,
          title: seed.title,
          description: seed.description,
          priority: seed.priority,
          status: seed.status,
          department: seed.department,
          latitude: seed.latitude,
          longitude: seed.longitude,
          subscriberCount: seed.subscriberCount,
          subscribers: [],
          isDuplicate: false
        });
      } else {
        return res.status(404).json({ message: "Grievance not found" });
      }
    }

    const userId = req.user._id;
    if (!complaint.subscribers) {
      complaint.subscribers = [];
    }

    const index = complaint.subscribers.indexOf(userId);
    let isSubscribed = false;

    if (index > -1) {
      complaint.subscribers.splice(index, 1);
      complaint.subscriberCount = Math.max(0, (complaint.subscriberCount || 1) - 1);
      isSubscribed = false;
    } else {
      complaint.subscribers.push(userId);
      complaint.subscriberCount = (complaint.subscriberCount || 0) + 1;
      isSubscribed = true;
    }

    await complaint.save();

    res.json({
      success: true,
      subscriberCount: complaint.subscriberCount,
      isSubscribed
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const geocodeAddress = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ message: "Query is required" });
    }

    let cleanedQuery = query;

    const hasGeminiKey = process.env.GEMINI_API_KEY && 
                          !process.env.GEMINI_API_KEY.startsWith("your_") && 
                          process.env.GEMINI_API_KEY !== "";

    if (hasGeminiKey) {
      try {
        const { GoogleGenerativeAI } = require("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `You are an expert address parser for OpenStreetMap/Nominatim.
Analyze the following user-entered Indian address: "${query}"

1. Correct any spelling errors or phonetic spellings (e.g. phonetic spelling like "Munseep" should be corrected to "Munsif" or "Munsiff").
2. Strip out specific door numbers, house numbers, flat numbers, plot numbers, or sub-building details (e.g. "189" or "Plot 12") as they are rarely indexed in OpenStreetMap database and cause search failures. Keep only the street/road name, neighborhood, town/city, and state.
3. Return ONLY the optimized, highly searchable plain text query. Do not write any preamble, quotes, markdown, or explanation.`;
        
        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        if (text) {
          cleanedQuery = text.replace(/['"]+/g, '');
          console.log(`[Geocode Controller] Cleaned query: "${query}" -> "${cleanedQuery}"`);
        }
      } catch (err) {
        console.error("[Geocode Controller] Gemini cleaning failed, falling back:", err.message);
      }
    }

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cleanedQuery)}&limit=1`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "LokSeva-Citizen-Portal/1.0"
      }
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.length > 0) {
        return res.json({
          success: true,
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon),
          display_name: data[0].display_name
        });
      }
    }

    if (cleanedQuery !== query) {
      const fallbackUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;
      const fallbackResponse = await fetch(fallbackUrl, {
        headers: {
          "User-Agent": "LokSeva-Citizen-Portal/1.0"
        }
      });
      if (fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json();
        if (fallbackData && fallbackData.length > 0) {
          return res.json({
            success: true,
            lat: parseFloat(fallbackData[0].lat),
            lon: parseFloat(fallbackData[0].lon),
            display_name: fallbackData[0].display_name
          });
        }
      }
    }

    res.status(404).json({ message: "Address could not be geocoded" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports={
  createComplaint,
  getComplaints,
  trackComplaint,
  getNotifications,
  readNotifications,
  submitFeedback,
  appealComplaint,
  submitClarification,
  getPublicGrievances,
  subscribeToGrievance,
  geocodeAddress
};