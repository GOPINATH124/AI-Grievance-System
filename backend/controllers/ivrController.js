const Complaint = require("../models/Complaint");
const DepartmentComplaint = require("../models/DepartmentComplaint");
const User = require("../models/User");

// In-memory call log history store for audit
const ivrCallLogs = [];

const handleIncomingCall = async (req, res) => {
  try {
    const callerNumber = req.body.From || req.body.caller || "+91 98765 43210";
    console.log(`[IVR Webhook] Incoming Call from: ${callerNumber}`);

    const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Gather numDigits="1" action="/api/ivr/process-input" method="POST">
        <Say voice="Polly.Aditi" language="hi-IN">
            नमस्कार! लोकसेवा स्मार्ट सिटी टेलीफोनी हेल्पलाइन 1800-लोकसेवा में आपका स्वागत है।
        </Say>
    </Gather>
</Response>`;

    res.type("text/xml");
    res.send(twimlResponse);
  } catch (err) {
    console.error("[IVR Webhook Error]", err);
    res.status(500).json({ error: err.message });
  }
};

const processCallInput = async (req, res) => {
  try {
    const { Digits, speechResult, callerNumber, language } = req.body;
    const phone = callerNumber || req.body.From || "+91 98765 43210";
    const selectedLang = language || "English";

    let department = "Water Supply Department";
    let issueTitle = "Telephony IVR Grievance Application";
    let priority = "Medium";

    if (Digits === "1" || (speechResult && speechResult.toLowerCase().includes("water"))) {
      department = "Water Supply Department";
      issueTitle = "IVR Call: Water Supply / Pipeline Leakage Complaint";
      priority = "High";
    } else if (Digits === "2" || (speechResult && speechResult.toLowerCase().includes("electric"))) {
      department = "Electricity Department";
      issueTitle = "IVR Call: Electricity Cut & Wire Breakdown Hazard";
      priority = "High";
    } else if (Digits === "3" || (speechResult && speechResult.toLowerCase().includes("clean"))) {
      department = "Sanitation Department";
      issueTitle = "IVR Call: Garbage Dumping & Sanitation Cleanliness";
    } else if (Digits === "4" || (speechResult && speechResult.toLowerCase().includes("road"))) {
      department = "Road and Transport Department";
      issueTitle = "IVR Call: Dangerous Pothole & Damaged Road Repair";
    } else if (Digits === "5" || (speechResult && speechResult.toLowerCase().includes("health"))) {
      department = "Health Department";
      issueTitle = "IVR Call: Hospital Assistance & Health Emergency";
      priority = "High";
    } else if (Digits === "6" || (speechResult && speechResult.toLowerCase().includes("revenue"))) {
      department = "Revenue Department";
      issueTitle = "IVR Call: Ration Card & Local Civic Certificate Query";
      priority = "Low";
    }

    const complaintId = "GRV-IVR-" + Math.floor(1000 + Math.random() * 9000);
    const description = `[Registered via IVR Telephony Bot 1800-LOKSEVA]\nCaller Phone: ${phone}\nInput Digits: ${Digits || "N/A"}\nVoice Audio Speech Transcript: "${speechResult || "Keypad Selection Option " + Digits}"\nAutomated Call Dispatch: ${department}.`;

    // Find or fallback to valid user in database
    let userObj = await User.findOne();
    if (!userObj) {
      userObj = await User.create({
        name: "Telephony IVR Caller",
        email: "ivr.caller@smartcity.gov.in",
        language: selectedLang
      });
    }

    const newComplaint = await Complaint.create({
      userId: userObj._id,
      complaintId,
      title: issueTitle,
      description,
      department,
      language: selectedLang,
      priority,
      location: "Caller Telephony Location (Ward Area)",
      aiLetter: description,
      isAiGenerated: true,
      status: "Pending",
      createdAt: new Date()
    });

    // Mirror to DepartmentComplaint collection with valid Date for slaDeadline
    try {
      const deadlineDate = new Date();
      deadlineDate.setHours(deadlineDate.getHours() + 24);

      await DepartmentComplaint.create({
        complaintId,
        citizenName: `Citizen (${phone})`,
        department,
        complaintType: issueTitle,
        priority,
        status: "Pending",
        assignedOfficer: "Awaiting Assignment",
        slaDeadline: deadlineDate
      });
    } catch (deptErr) {
      console.warn("[IVR Controller] DepartmentComplaint mirror skipped:", deptErr.message);
    }

    // Store in call audit logs
    ivrCallLogs.unshift({
      callSid: "CALL-" + Date.now(),
      phone,
      digits: Digits || "Voice",
      speech: speechResult || "Keypad Selection",
      department,
      complaintId,
      timestamp: new Date()
    });

    const deptNamesTamil = {
      "Water Supply Department": "குடிநீர் துறைப் புகார்",
      "Electricity Department": "மின்சாரத் துறைப் புகார்",
      "Sanitation Department": "சுகாதார மற்றும் குப்பையை அகற்றும் புகார்",
      "Road and Transport Department": "சாலைப் பராமரிப்புப் புகார்",
      "Health Department": "மருத்துவச் சுகாதாரப் புகார்",
      "Revenue Department": "வருவாய்த் துறைப் புகார்"
    };

    const deptNamesHindi = {
      "Water Supply Department": "जल आपूर्ति शिकायत",
      "Electricity Department": "बिजली विभाग शिकायत",
      "Sanitation Department": "सफाई एवं कचरा शिकायत",
      "Road and Transport Department": "सड़क मरम्मत शिकायत",
      "Health Department": "स्वास्थ्य विभाग शिकायत",
      "Revenue Department": "राजस्व विभाग शिकायत"
    };

    let audioText = `Your ${department} complaint has been registered! Reference ID: ${complaintId}. Thank you!`;
    if (selectedLang === "Tamil") {
      const tnDept = deptNamesTamil[department] || "புகார்";
      audioText = `உங்கள் ${tnDept} வெற்றிகரமாகப் பதிவு செய்யப்பட்டது! உங்கள் குறிப்பு எண் ${complaintId}. நன்றி!`;
    } else if (selectedLang === "Hindi") {
      const hiDept = deptNamesHindi[department] || "शिकायत";
      audioText = `आपकी ${hiDept} सफलतापूर्वक दर्ज कर ली गई है! आपका संदर्भ संख्या है ${complaintId}। धन्यवाद!`;
    }

    res.json({
      success: true,
      complaintId,
      department,
      issueTitle,
      message: `Your ${department} complaint has been officially registered via IVR Call with ID ${complaintId}.`,
      audioResponse: audioText
    });
  } catch (err) {
    console.error("[IVR Process Error]", err);
    res.status(500).json({ error: err.message });
  }
};

const getCallLogs = async (req, res) => {
  res.json({
    success: true,
    count: ivrCallLogs.length,
    logs: ivrCallLogs
  });
};

module.exports = {
  handleIncomingCall,
  processCallInput,
  getCallLogs
};
