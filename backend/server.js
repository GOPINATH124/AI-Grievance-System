const express = require("express");
const cors = require("cors");
require("dotenv").config();




const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const complaintRoutes = require("./routes/complaintRoutes");
const aiRoutes =
  require("./routes/aiRoutes");
const adminRoutes =
  require("./routes/adminRoutes");
const ivrRoutes = require("./routes/ivrRoutes");


const app = express();

(async () => {
  const fs = require("fs");
  const path = require("path");
  const source = "C:\\Users\\Gopinath\\.gemini\\antigravity-ide\\brain\\63bd3dff-8858-4274-b06c-f1bae51a38d4\\smart_city_bg_1782494024902.png";
  const destDir = "C:\\Users\\Gopinath\\Downloads\\AI-Grievance-System\\frontend\\public";
  const dest = path.join(destDir, "bg-smartcity.png");
  try {
    if (fs.existsSync(source)) {
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }
      if (!fs.existsSync(dest)) {
        fs.copyFileSync(source, dest);
        console.log("[Setup] Background image successfully copied to:", dest);
      } else {
        console.log("[Setup] Background image already exists in destination. Skipping copy.");
      }
    } else {
      console.warn("[Setup] Source background image does not exist yet at:", source);
    }
  } catch (err) {
    console.error("[Setup] Failed to copy background image:", err.message);
  }
})();

app.use(cors());


app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

const path = require("path");
const fs = require("fs");
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use("/uploads", express.static(uploadsDir));

connectDB().then(async () => {
  try {
    const mongoose = require("mongoose");
    const Department = require("./models/Department");
    if (mongoose.connection.db) {
      await mongoose.connection.db.collection("departments").dropIndex("name_1").catch(() => {});
    }
    const deptData = [
      { departmentId: "DEPT-WAT-01", departmentName: "Water Supply Department", headOfficer: "Assistant Engineer", contact: "Phone: +91 11 2345 6701 | Email: watersupply@smartcity.gov.in | Location: Ground Floor, Civic Center", employees: 26, salary: "₹25,000 - ₹80,000", workingHours: "9 AM - 5 PM", sla: "24 Hours", complaints: 12, performance: 4.5, status: "Active" },
      { departmentId: "DEPT-ELE-02", departmentName: "Electricity Department", headOfficer: "Electrical Engineer", contact: "Phone: +91 11 2345 6702 | Email: electricity@smartcity.gov.in | Location: 1st Floor, Energy Bhawan", employees: 39, salary: "₹26,000 - ₹85,000", workingHours: "Office: 9 AM - 5 PM | Emergency: 24 Hours", sla: "12 Hours", complaints: 18, performance: 4.2, status: "Active" },
      { departmentId: "DEPT-ROD-03", departmentName: "Road and Transport Department", headOfficer: "Civil Engineer", contact: "Phone: +91 11 2345 6703 | Email: roadtransport@smartcity.gov.in | Location: 3rd Floor, Transport Annex", employees: 38, salary: "₹20,000 - ₹90,000", workingHours: "8 AM - 5 PM", sla: "7 Days", complaints: 9, performance: 4.0, status: "Active" },
      { departmentId: "DEPT-SAN-04", departmentName: "Sanitation Department", headOfficer: "Sanitary Officer", contact: "Phone: +91 11 2345 6704 | Email: sanitation@smartcity.gov.in | Location: Basement, Municipal Complex", employees: 60, salary: "₹18,000 - ₹75,000", workingHours: "Morning Shift: 6 AM - 2 PM | Evening Shift: 2 PM - 10 PM", sla: "24 Hours", complaints: 25, performance: 4.6, status: "Active" },
      { departmentId: "DEPT-HEA-05", departmentName: "Health Department", headOfficer: "Medical Officer", contact: "Phone: +91 11 2345 6705 | Email: health@smartcity.gov.in | Location: Smart City General Hospital", employees: 45, salary: "₹25,000 - ₹1,10,000", workingHours: "24/7 Operations", sla: "12 Hours", complaints: 15, performance: 4.8, status: "Active" },
      { departmentId: "DEPT-REV-06", departmentName: "Revenue Department", headOfficer: "Revenue Officer", contact: "Phone: +91 11 2345 6706 | Email: revenue@smartcity.gov.in | Location: 2nd Floor, Treasury Office", employees: 20, salary: "₹22,000 - ₹95,000", workingHours: "10 AM - 5 PM", sla: "48 Hours", complaints: 6, performance: 4.4, status: "Active" }
    ];
    for (const d of deptData) {
      await Department.findOneAndUpdate(
        { departmentName: d.departmentName },
        { $set: d },
        { upsert: true, new: true }
      );
    }
    console.log("[Server] Successfully ensured all 6 smart city departments exist in database.");
  } catch (err) {
    console.error("[Server] Seeding failed on startup:", err.message);
  }
});

app.use("/api/auth", authRoutes);

app.use("/api/complaint", complaintRoutes);

app.use(
  "/api/ai",
  aiRoutes
);
app.use(
  "/api/admin",
  adminRoutes
);
app.use("/api/ivr", ivrRoutes);

app.get("/", (req, res) => {
  res.send("AI Grievance Backend Running");
});

app.get("/seed-departments", async (req, res) => {
  try {
    const Department = require("./models/Department");
    const Employee = require("./models/Employee");

    const deptData = [
      { departmentId: "DEPT-WAT-01", departmentName: "Water Supply Department", headOfficer: "Assistant Engineer", contact: "Phone: +91 11 2345 6701 | Email: watersupply@smartcity.gov.in | Location: Ground Floor, Civic Center", employees: 26, salary: "₹25,000 - ₹80,000", workingHours: "9 AM - 5 PM", sla: "24 Hours", complaints: 12, performance: 4.5, status: "Active" },
      { departmentId: "DEPT-ELE-02", departmentName: "Electricity Department", headOfficer: "Electrical Engineer", contact: "Phone: +91 11 2345 6702 | Email: electricity@smartcity.gov.in | Location: 1st Floor, Energy Bhawan", employees: 39, salary: "₹26,000 - ₹85,000", workingHours: "Office: 9 AM - 5 PM | Emergency: 24 Hours", sla: "12 Hours", complaints: 18, performance: 4.2, status: "Active" },
      { departmentId: "DEPT-ROD-03", departmentName: "Road and Transport Department", headOfficer: "Civil Engineer", contact: "Phone: +91 11 2345 6703 | Email: roadtransport@smartcity.gov.in | Location: 3rd Floor, Transport Annex", employees: 38, salary: "₹20,000 - ₹90,000", workingHours: "8 AM - 5 PM", sla: "7 Days", complaints: 9, performance: 4.0, status: "Active" },
      { departmentId: "DEPT-SAN-04", departmentName: "Sanitation Department", headOfficer: "Sanitary Officer", contact: "Phone: +91 11 2345 6704 | Email: sanitation@smartcity.gov.in | Location: Basement, Municipal Complex", employees: 60, salary: "₹18,000 - ₹75,000", workingHours: "Morning Shift: 6 AM - 2 PM | Evening Shift: 2 PM - 10 PM", sla: "24 Hours", complaints: 25, performance: 4.6, status: "Active" },
      { departmentId: "DEPT-HEA-05", departmentName: "Health Department", headOfficer: "Medical Officer", contact: "Phone: +91 11 2345 6705 | Email: health@smartcity.gov.in | Location: Smart City General Hospital", employees: 45, salary: "₹25,000 - ₹1,10,000", workingHours: "24/7 Operations", sla: "12 Hours", complaints: 15, performance: 4.8, status: "Active" },
      { departmentId: "DEPT-REV-06", departmentName: "Revenue Department", headOfficer: "Revenue Officer", contact: "Phone: +91 11 2345 6706 | Email: revenue@smartcity.gov.in | Location: 2nd Floor, Treasury Office", employees: 20, salary: "₹22,000 - ₹95,000", workingHours: "10 AM - 5 PM", sla: "48 Hours", complaints: 6, performance: 4.4, status: "Active" }
    ];

    for (const d of deptData) {
      await Department.findOneAndUpdate(
        { departmentName: d.departmentName },
        { $set: d },
        { upsert: true, new: true }
      );
    }

    const count = await Department.countDocuments();

    res.json({
      success: true,
      message: `✅ All ${count} departments seeded successfully! Refresh your Admin Dashboard.`,
      departments: deptData.map(d => ({ id: d.departmentId, name: d.departmentName, employees: d.employees, status: d.status }))
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
