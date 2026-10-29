const Complaint = require("../models/Complaint");
const User = require("../models/User");
const Department = require("../models/Department");
const Notification = require("../models/Notification");
const AuditLog = require("../models/AuditLog");
const Employee = require("../models/Employee");
const DepartmentComplaint = require("../models/DepartmentComplaint");
const bcrypt = require("bcrypt");
const { sendSMS } = require("../utils/smsService");
const { sendEmail } = require("../utils/emailService");

const logAdminAction = async (admin, action, target) => {
  try {
    await AuditLog.create({
      adminName: admin ? admin.name : "System",
      adminEmail: admin ? admin.email : "system@service.gov.in",
      action,
      target
    });
  } catch (err) {
    console.error("[AuditLog Log] Failed to write log:", err.message);
  }
};

const seedDepartments = async () => {
  try {
    const defaults = [
      {
        departmentId: "DEPT-WAT-01",
        departmentName: "Water Supply Department",
        headOfficer: "Assistant Engineer",
        contact: "Phone: +91 11 2345 6701 | Email: watersupply@smartcity.gov.in | Location: Ground Floor, Civic Center",
        employees: 26,
        salary: "₹25,000 - ₹80,000",
        workingHours: "9 AM - 5 PM",
        sla: "24 Hours",
        complaints: 12,
        performance: 4.5,
        status: "Active"
      },
      {
        departmentId: "DEPT-ELE-02",
        departmentName: "Electricity Department",
        headOfficer: "Electrical Engineer",
        contact: "Phone: +91 11 2345 6702 | Email: electricity@smartcity.gov.in | Location: 1st Floor, Energy Bhawan",
        employees: 39,
        salary: "₹26,000 - ₹85,000",
        workingHours: "Office: 9 AM - 5 PM | Emergency: 24 Hours",
        sla: "12 Hours",
        complaints: 18,
        performance: 4.2,
        status: "Active"
      },
      {
        departmentId: "DEPT-ROD-03",
        departmentName: "Road and Transport Department",
        headOfficer: "Civil Engineer",
        contact: "Phone: +91 11 2345 6703 | Email: roadtransport@smartcity.gov.in | Location: 3rd Floor, Transport Annex",
        employees: 38,
        salary: "₹20,000 - ₹90,000",
        workingHours: "8 AM - 5 PM",
        sla: "7 Days",
        complaints: 9,
        performance: 4.0,
        status: "Active"
      },
      {
        departmentId: "DEPT-SAN-04",
        departmentName: "Sanitation Department",
        headOfficer: "Sanitary Officer",
        contact: "Phone: +91 11 2345 6704 | Email: sanitation@smartcity.gov.in | Location: Basement, Municipal Complex",
        employees: 60,
        salary: "₹18,000 - ₹75,000",
        workingHours: "Morning Shift: 6 AM - 2 PM | Evening Shift: 2 PM - 10 PM",
        sla: "24 Hours",
        complaints: 25,
        performance: 4.6,
        status: "Active"
      },
      {
        departmentId: "DEPT-HEA-05",
        departmentName: "Health Department",
        headOfficer: "Medical Officer",
        contact: "Phone: +91 11 2345 6705 | Email: health@smartcity.gov.in | Location: Smart City General Hospital",
        employees: 45,
        salary: "₹25,000 - ₹1,10,000",
        workingHours: "24/7 Operations",
        sla: "12 Hours",
        complaints: 15,
        performance: 4.8,
        status: "Active"
      },
      {
        departmentId: "DEPT-REV-06",
        departmentName: "Revenue Department",
        headOfficer: "Revenue Officer",
        contact: "Phone: +91 11 2345 6706 | Email: revenue@smartcity.gov.in | Location: 2nd Floor, Treasury Office",
        employees: 20,
        salary: "₹22,000 - ₹95,000",
        workingHours: "10 AM - 5 PM",
        sla: "48 Hours",
        complaints: 6,
        performance: 4.4,
        status: "Active"
      }
    ];

    // Upsert each department individually to avoid unique index conflicts
    let upsertCount = 0;
    for (const dept of defaults) {
      try {
        await Department.findOneAndUpdate(
          { departmentName: dept.departmentName },
          { $set: dept },
          { upsert: true, new: true }
        );
        upsertCount++;
      } catch (innerErr) {
        console.error(`[Admin Controller] Error seeding department ${dept.departmentName}:`, innerErr.message);
      }
    }
    console.log(`[Admin Controller] Ensured ${upsertCount} departments exist in database.`);
  } catch (err) {
    console.error("[Admin Controller] Failed to seed departments:", err.message);
  }
};


const seedEmployees = async () => {
  try {
    const count = await Employee.countDocuments();
    const hasOldFields = await Employee.findOne({ availabilityStatus: { $exists: true } });
    if (count < 100 || hasOldFields) {
      console.log("[Admin Controller] Re-seeding employees to match requested roster sizes...");
      await Employee.deleteMany({});

      const firstNames = ["Raj", "Amit", "Sanjay", "Anil", "Sunil", "Vijay", "Vikram", "Ramesh", "Suresh", "Karan", "Rahul", "Priya", "Neha", "Kiran", "Deepak", "Sandip", "Arvind", "Manoj", "Ajay", "Jyoti", "Sunita", "Rakesh", "Ganesh", "Dinesh", "Mahesh", "Sita", "Gita", "Radha", "Mohan", "Krishna"];
      const lastNames = ["Kumar", "Sharma", "Patel", "Joshi", "Deshmukh", "Singh", "Prabhu", "Sinha", "Patil", "Dutt", "Johar", "Gadkari", "Goyal", "Gill", "Pandya", "Bumrah", "Thackeray", "Soman", "Hegde", "Kher", "Trehan", "Nair", "Iyer", "Rao", "Reddy", "Mehta", "Chawla", "Sen", "Das", "Banerjee"];

      let nameIndex = 0;
      const getNextName = () => {
        const f = firstNames[nameIndex % firstNames.length];
        const l = lastNames[Math.floor(nameIndex / firstNames.length) % lastNames.length];
        nameIndex++;
        return `${f} ${l}`;
      };

      const departmentsConfig = [
        {
          name: "Water Supply Department",
          prefix: "WAT",
          roles: [
            { role: "Department Head", salary: 80000, shift: "9 AM - 5 PM", count: 1 },
            { role: "Engineer", salary: 60000, shift: "9 AM - 5 PM", count: 2 },
            { role: "Officer", salary: 45000, shift: "9 AM - 5 PM", count: 3 },
            { role: "Technician", salary: 30000, shift: "9 AM - 5 PM", count: 8 },
            { role: "Field Worker", salary: 25000, shift: "9 AM - 5 PM", count: 10 },
            { role: "Data Entry Operator", salary: 25000, shift: "9 AM - 5 PM", count: 2 }
          ]
        },
        {
          name: "Electricity Department",
          prefix: "ELE",
          roles: [
            { role: "Department Head", salary: 85000, shift: "9 AM - 5 PM", count: 2 },
            { role: "Officer", salary: 50000, shift: "9 AM - 5 PM", count: 4 },
            { role: "Field Worker", salary: 28000, shift: "24 Hours Shift", count: 12 },
            { role: "Technician", salary: 35000, shift: "24 Hours Shift", count: 8 },
            { role: "Field Worker", salary: 26000, shift: "24 Hours Shift", count: 10 },
            { role: "Data Entry Operator", salary: 25000, shift: "9 AM - 5 PM", count: 3 }
          ]
        },
        {
          name: "Road and Transport Department",
          prefix: "ROD",
          roles: [
            { role: "Department Head", salary: 90000, shift: "8 AM - 5 PM", count: 3 },
            { role: "Officer", salary: 48000, shift: "8 AM - 5 PM", count: 4 },
            { role: "Supervisor", salary: 40000, shift: "8 AM - 5 PM", count: 5 },
            { role: "Technician", salary: 35000, shift: "8 AM - 5 PM", count: 6 },
            { role: "Field Worker", salary: 20000, shift: "8 AM - 5 PM", count: 20 }
          ]
        },
        {
          name: "Sanitation Department",
          prefix: "SAN",
          roles: [
            { role: "Department Head", salary: 75000, shift: "Morning Shift", count: 2 },
            { role: "Supervisor", salary: 38000, shift: "Evening Shift", count: 5 },
            { role: "Field Worker", salary: 18000, shift: "Morning Shift", count: 53 }
          ]
        },
        {
          name: "Health Department",
          prefix: "HEA",
          roles: [
            { role: "Department Head", salary: 110000, shift: "Rotational 24/7", count: 2 },
            { role: "Technician", salary: 45000, shift: "Rotational 24/7", count: 8 },
            { role: "Technician", salary: 35000, shift: "Rotational 24/7", count: 5 },
            { role: "Officer", salary: 40000, shift: "9 AM - 5 PM", count: 10 },
            { role: "Field Worker", salary: 25000, shift: "9 AM - 5 PM", count: 20 }
          ]
        },
        {
          name: "Revenue Department",
          prefix: "REV",
          roles: [
            { role: "Department Head", salary: 95000, shift: "10 AM - 5 PM", count: 2 },
            { role: "Officer", salary: 50000, shift: "10 AM - 5 PM", count: 3 },
            { role: "Data Entry Operator", salary: 30000, shift: "10 AM - 5 PM", count: 5 },
            { role: "Field Worker", salary: 25000, shift: "10 AM - 5 PM", count: 10 }
          ]
        }
      ];

      const employeesToInsert = [];
      for (const dept of departmentsConfig) {
        let empCount = 1;
        for (const rConfig of dept.roles) {
          for (let i = 0; i < rConfig.count; i++) {
            const idNum = String(empCount).padStart(3, "0");
            employeesToInsert.push({
              employeeId: `EMP-${dept.prefix}-${idNum}`,
              name: getNextName(),
              department: dept.name,
              role: rConfig.role,
              salary: rConfig.salary,
              shift: rConfig.shift,
              availability: "Available",
              performance: Math.floor(Math.random() * 2) + 4
            });
            empCount++;
          }
        }
      }

      await Employee.insertMany(employeesToInsert);
      console.log(`[Admin Controller] Seeded ${employeesToInsert.length} employees successfully.`);
    }
  } catch (err) {
    console.error("[Admin Controller] Failed to seed employees:", err.message);
  }
};

const seedDatabase = async () => {
  try {
    await seedDepartments();
    await seedEmployees();
  } catch (err) {
    console.error("[Admin Controller] Database seeding failed:", err.message);
  }
};



// View all complaints

const getAllComplaints = async(req,res)=>{
  try{
    const query = {};
    if (req.user && req.user.role === "admin") {
      query.department = { $in: req.user.departments || [] };
    }

    const complaints = await Complaint.find(query).populate("userId","name email");
    res.json(complaints);
  }
  catch(error){
    res.status(500).json({
      message:error.message
    });
  }
};




// Assign Department / Officer

const assignComplaint = async(req,res)=>{
  try{
    const {
      department,
      officer,
      dueDate,
      priority
    }=req.body;

    if (req.user && req.user.role === "admin") {
      const allowedDepts = req.user.departments || [];
      if (!allowedDepts.includes(department)) {
        return res.status(403).json({ message: "Forbidden: You cannot assign to this department" });
      }
      
      const targetComplaint = await Complaint.findOne({ complaintId: req.params.id });
      if (targetComplaint && targetComplaint.department && !allowedDepts.includes(targetComplaint.department)) {
        return res.status(403).json({ message: "Forbidden: You cannot manage complaints from other departments" });
      }
    }

    const updateFields = {
      department,
      officer,
      status:"Assigned"
    };

    if (dueDate !== undefined) updateFields.dueDate = dueDate;
    if (priority !== undefined) updateFields.priority = priority;

    const complaint = await Complaint.findOneAndUpdate(
      { complaintId:req.params.id },
      updateFields,
      { new:true }
    );

    if (complaint) {
      await Notification.create({
        userId: complaint.userId,
        complaintId: complaint.complaintId,
        message: `Your grievance ${complaint.complaintId} has been assigned to the ${complaint.department} handling officer (${complaint.officer}).`
      });
      await logAdminAction(req.user, `Assigned complaint to officer "${complaint.officer}" in department "${complaint.department}"`, `Grievance ${complaint.complaintId}`);
    }

    res.json({
      message:"Complaint Assigned",
      complaint
    });
  }
  catch(error){
    res.status(500).json({
      message:error.message
    });
  }
};


const assignBatchComplaints = async (req, res) => {
  try {
    const { ids, department, officer, dueDate, priority } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "No grievance IDs provided" });
    }

    if (req.user && req.user.role === "admin") {
      const allowedDepts = req.user.departments || [];
      if (!allowedDepts.includes(department)) {
        return res.status(403).json({ message: "Forbidden: You cannot assign complaints to other departments" });
      }
      
      const targetComplaints = await Complaint.find({ complaintId: { $in: ids } });
      const hasOtherDept = targetComplaints.some(c => c.department && !allowedDepts.includes(c.department));
      if (hasOtherDept) {
        return res.status(403).json({ message: "Forbidden: One or more target complaints belong to other departments" });
      }
    }

    const updateFields = {
      department,
      officer,
      status: "Assigned"
    };

    if (dueDate !== undefined) updateFields.dueDate = dueDate;
    if (priority !== undefined) updateFields.priority = priority;

    const result = await Complaint.updateMany(
      { complaintId: { $in: ids } },
      { $set: updateFields }
    );

    // Notify citizens of the batch assignment
    try {
      const updatedComplaints = await Complaint.find({ complaintId: { $in: ids } });
      for (const comp of updatedComplaints) {
        await Notification.create({
          userId: comp.userId,
          complaintId: comp.complaintId,
          message: `Your grievance ${comp.complaintId} has been assigned to the ${comp.department} handling officer (${comp.officer}) in a batch assignment.`
        });
      }
    } catch (notifyErr) {
      console.error("[Admin Controller] Batch assign notification failed:", notifyErr.message);
    }

    await logAdminAction(req.user, `Batch assigned ${ids.length} complaints to officer "${officer}" in department "${department}"`, `Complaints: ${ids.join(", ")}`);

    res.json({
      message: `${result.modifiedCount} grievances assigned successfully`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// Update Status


const updateStatus = async(req,res)=>{
  try{
    const {
      status,
      reply,
      clarificationQuestion,
      interimReply
    }=req.body;

    const targetComplaint = await Complaint.findOne({ complaintId: req.params.id });
    if (!targetComplaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    if (req.user && req.user.role === "admin") {
      const allowedDepts = req.user.departments || [];
      if (targetComplaint.department && !allowedDepts.includes(targetComplaint.department)) {
        return res.status(403).json({ message: "Forbidden: You cannot manage complaints from other departments" });
      }
    }

    const updateFields = { status };
    if (reply !== undefined) {
      updateFields.reply = reply;
    }
    if (clarificationQuestion !== undefined) {
      updateFields.clarificationQuestion = clarificationQuestion;
    }
    if (interimReply !== undefined) {
      updateFields.interimReply = interimReply;
      updateFields.interimReplyDate = new Date();
    }

    let complaint = await Complaint.findOneAndUpdate(
      { complaintId: req.params.id },
      updateFields,
      { new: true }
    );

    await DepartmentComplaint.findOneAndUpdate(
      { complaintId: req.params.id },
      { status },
      { new: true }
    );

    if (complaint) {
      await Notification.create({
        userId: complaint.userId,
        complaintId: complaint.complaintId,
        message: `Your grievance ${complaint.complaintId} status has been updated to "${status}".`
      });
      await logAdminAction(req.user, `Updated complaint status to "${status}"`, `Grievance ${complaint.complaintId}`);

      const citizen = await User.findById(complaint.userId);
      if (citizen && citizen.phone) {
        await sendSMS(
          citizen.phone,
          `🔔 LokSeva Alert: Your Grievance ${complaint.complaintId} status is now "${status}". Remarks: ${reply || interimReply || "None"}. Track at http://localhost:5173/track?id=${complaint.complaintId}`
        );
      }

      if (citizen && citizen.email) {
        await sendEmail(
          citizen.email,
          `🔔 LokSeva Grievance Update: ${complaint.complaintId}`,
          `Hello ${citizen.name},\n\nYour grievance status has been updated to "${status}".\n\nReference ID: ${complaint.complaintId}\nNew Status: ${status}\nOfficer Remarks: ${reply || interimReply || "None"}\n\nYou can review complete details and provide feedback at: http://localhost:5173/track?id=${complaint.complaintId}\n\nThank you,\nLokSeva Support Team`
        );
      }

      // Cascade resolution to duplicate complaints
      const isResolvedState = ["resolved", "completed", "solved", "closed"].includes(status.toLowerCase());
      if (isResolvedState) {
        console.log(`[Admin Controller] Cascading resolution for parent ${complaint.complaintId} to duplicate reports...`);
        try {
          const duplicates = await Complaint.find({ parentComplaintId: complaint.complaintId });
          for (const dup of duplicates) {
            dup.status = status;
            if (reply !== undefined) {
              dup.reply = reply;
            }
            await dup.save();

            await DepartmentComplaint.findOneAndUpdate(
              { complaintId: dup.complaintId },
              { status }
            );

            await Notification.create({
              userId: dup.userId,
              complaintId: dup.complaintId,
              message: `The primary grievance report (${complaint.complaintId}) linked to your complaint ${dup.complaintId} has been resolved! Status updated to "${status}".`
            });
          }
          console.log(`[Admin Controller] Successfully cascaded resolution to ${duplicates.length} duplicate complaints.`);
        } catch (cascadeErr) {
          console.error("[Admin Controller] Failed to cascade resolutions:", cascadeErr.message);
        }
      }
    }

    res.json({
      message: "Status Updated",
      complaint
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const query = {};
    if (req.user && req.user.role === "admin") {
      query.role = "admin";
      query.departments = { $in: req.user.departments || [] };
    }
    const users = await User.find(query, "name email role language phone designation departments salary officeLocation status createdAt");
    const usersWithCounts = await Promise.all(users.map(async (u) => {
      const count = await Complaint.countDocuments({ userId: u._id });
      return {
        ...u.toObject(),
        complaintsCount: count
      };
    }));
    res.json(usersWithCounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUserRole = async (req, res) => {
  try {
    if (req.user && req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Forbidden: Only Super Admins can update roles" });
    }
    const { role } = req.body;
    if (role !== "admin" && role !== "citizen") {
      return res.status(400).json({ message: "Invalid role specified" });
    }
    // Prevent self-demotion
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ message: "You cannot change your own role" });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    await logAdminAction(req.user, `Updated role of user "${user.name}" to "${role}"`, `User ${user.email}`);
    res.json({ message: `Role updated to ${role} for ${user.name}`, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSystemStatus = async (req, res) => {
  try {
    const hasGemini = !!(process.env.GEMINI_API_KEY && 
                         !process.env.GEMINI_API_KEY.startsWith("your_") && 
                         process.env.GEMINI_API_KEY !== "");
    const hasBhashini = !!(process.env.BHASHINI_USER_ID && 
                           !process.env.BHASHINI_USER_ID.startsWith("your_") && 
                           process.env.BHASHINI_API_KEY && 
                           !process.env.BHASHINI_API_KEY.startsWith("your_"));
    const hasClerk = !!(process.env.VITE_CLERK_PUBLISHABLE_KEY && 
                         !process.env.VITE_CLERK_PUBLISHABLE_KEY.startsWith("pk_test_your_"));
    
    res.json({
      gemini: hasGemini ? "Active / Configured" : "Inactive / Missing Key",
      bhashini: hasBhashini ? "Active / Configured" : "Inactive / Fallback Simulation Mode",
      clerk: hasClerk ? "Active / Configured" : "Inactive / Local Authentication Mode",
      environment: process.env.NODE_ENV || "development",
      port: process.env.PORT || 5000
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllDepartments = async (req, res) => {
  try {
    let depts = await Department.find().sort({ departmentName: 1 });
    if (depts.length < 6) {
      const defaults = [
        { departmentId:"DEPT-WAT-01", departmentName:"Water Supply Department",       headOfficer:"Assistant Engineer",  contact:"Phone: +91 11 2345 6701 | Email: watersupply@smartcity.gov.in | Location: Ground Floor, Civic Center",     employees:26, salary:"₹25,000 - ₹80,000",   workingHours:"9 AM - 5 PM",                                    sla:"24 Hours", complaints:12, performance:4.5, status:"Active" },
        { departmentId:"DEPT-ELE-02", departmentName:"Electricity Department",        headOfficer:"Electrical Engineer", contact:"Phone: +91 11 2345 6702 | Email: electricity@smartcity.gov.in | Location: 1st Floor, Energy Bhawan",       employees:39, salary:"₹26,000 - ₹85,000",   workingHours:"Office: 9 AM - 5 PM | Emergency: 24 Hours",       sla:"12 Hours", complaints:18, performance:4.2, status:"Active" },
        { departmentId:"DEPT-ROD-03", departmentName:"Road and Transport Department", headOfficer:"Civil Engineer",      contact:"Phone: +91 11 2345 6703 | Email: roadtransport@smartcity.gov.in | Location: 3rd Floor, Transport Annex",   employees:38, salary:"₹20,000 - ₹90,000",   workingHours:"8 AM - 5 PM",                                    sla:"7 Days",   complaints:9,  performance:4.0, status:"Active" },
        { departmentId:"DEPT-SAN-04", departmentName:"Sanitation Department",         headOfficer:"Sanitary Officer",    contact:"Phone: +91 11 2345 6704 | Email: sanitation@smartcity.gov.in | Location: Basement, Municipal Complex",     employees:60, salary:"₹18,000 - ₹75,000",   workingHours:"Morning Shift: 6 AM - 2 PM | Evening Shift: 2 PM - 10 PM", sla:"24 Hours", complaints:25, performance:4.6, status:"Active" },
        { departmentId:"DEPT-HEA-05", departmentName:"Health Department",             headOfficer:"Medical Officer",     contact:"Phone: +91 11 2345 6705 | Email: health@smartcity.gov.in | Location: Smart City General Hospital",          employees:45, salary:"₹25,000 - ₹1,10,000", workingHours:"24/7 Operations",                                sla:"12 Hours", complaints:15, performance:4.8, status:"Active" },
        { departmentId:"DEPT-REV-06", departmentName:"Revenue Department",            headOfficer:"Revenue Officer",     contact:"Phone: +91 11 2345 6706 | Email: revenue@smartcity.gov.in | Location: 2nd Floor, Treasury Office",          employees:20, salary:"₹22,000 - ₹95,000",   workingHours:"10 AM - 5 PM",                                   sla:"48 Hours", complaints:6,  performance:4.4, status:"Active" }
      ];
      for (const d of defaults) {
        try {
          await Department.findOneAndUpdate(
            { departmentName: d.departmentName },
            { $set: d },
            { upsert: true, new: true }
          );
        } catch (e) {
          console.error("Error upserting dept:", e.message);
        }
      }
      depts = await Department.find().sort({ departmentName: 1 });
    }
    if (req.user && req.user.role === "admin") {
      const allowedDepts = req.user.departments || [];
      depts = depts.filter(d => allowedDepts.includes(d.departmentName));
    }
    const User = require("../models/User");
    const officers = await User.find({ role: "admin" });

    const deptsWithOfficers = depts.map(d => {
      const deptObj = d.toObject ? d.toObject() : d;
      const assigned = officers.filter(u => u.departments && u.departments.includes(d.departmentName));
      if (assigned.length > 0) {
        deptObj.headOfficer = assigned.map(u => u.name).join(", ");
        const contactsString = assigned.map(u => `${u.name} (Email: ${u.email}${u.phone ? `, Phone: ${u.phone}` : ""})`).join(" | ");
        const originalLoc = d.contact && d.contact.includes("Location:") ? d.contact.substring(d.contact.indexOf("Location:")) : "Main Office";
        deptObj.contact = `${contactsString} | ${originalLoc}`;
      }
      return deptObj;
    });

    res.json(deptsWithOfficers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addDepartment = async (req, res) => {
  try {
    if (req.user && req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Forbidden: Only Super Admins can manage departments" });
    }
    const { departmentId, departmentName, headOfficer, contact, employees, salary, workingHours, sla, complaints, performance, status } = req.body;
    if (!departmentName || !departmentName.trim()) {
      return res.status(400).json({ message: "Department name is required" });
    }
    const exists = await Department.findOne({ departmentName: departmentName.trim() });
    if (exists) {
      return res.status(400).json({ message: "Department already exists" });
    }
    const deptId = departmentId || `DEPT-${departmentName.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    const dept = await Department.create({
      departmentId: deptId,
      departmentName: departmentName.trim(),
      headOfficer: headOfficer || "Officer",
      contact: contact || "",
      employees: employees || 0,
      salary: salary || "",
      workingHours: workingHours || "9 AM - 5 PM",
      sla: sla || "48 Hours",
      complaints: complaints || 0,
      performance: performance || 5,
      status: status || "Active"
    });
    await logAdminAction(req.user, `Created new department "${dept.departmentName}"`, `Department ID: ${dept._id}`);
    res.status(201).json(dept);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const editDepartment = async (req, res) => {
  try {
    if (req.user && req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Forbidden: Only Super Admins can manage departments" });
    }
    const { id } = req.params;
    const { departmentName, headOfficer, contact, employees, salary, workingHours, sla, complaints, performance, status } = req.body;
    const dept = await Department.findById(id);
    if (!dept) {
      return res.status(404).json({ message: "Department not found" });
    }
    if (departmentName) dept.departmentName = departmentName.trim();
    if (headOfficer !== undefined) dept.headOfficer = headOfficer;
    if (contact !== undefined) dept.contact = contact;
    if (employees !== undefined) dept.employees = employees;
    if (salary !== undefined) dept.salary = salary;
    if (workingHours !== undefined) dept.workingHours = workingHours;
    if (sla !== undefined) dept.sla = sla;
    if (complaints !== undefined) dept.complaints = complaints;
    if (performance !== undefined) dept.performance = performance;
    if (status !== undefined) dept.status = status;

    await dept.save();
    await logAdminAction(req.user, `Updated department details for "${dept.departmentName}"`, `Department ID: ${dept._id}`);
    res.json({ message: "Department updated successfully", department: dept });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteDepartment = async (req, res) => {
  try {
    if (req.user && req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Forbidden: Only Super Admins can manage departments" });
    }
    const { id } = req.params;
    const dept = await Department.findById(id);
    if (!dept) {
      return res.status(404).json({ message: "Department not found" });
    }
    await Department.findByIdAndDelete(id);
    await logAdminAction(req.user, `Deleted department "${dept.departmentName}"`, `Department ID: ${dept._id}`);
    res.json({ message: "Department deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateOfficerProfile = async (req, res) => {
  try {
    const { designation, departments, salary, officeLocation, status, joiningDate, shift, performanceScore } = req.body;
    
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (req.user && req.user.role === "admin") {
      const allowedDepts = req.user.departments || [];
      const hasMatch = targetUser.departments.some(d => allowedDepts.includes(d));
      if (!hasMatch && targetUser.role === "admin") {
        return res.status(403).json({ message: "Forbidden: You cannot manage officers from other departments" });
      }
      if (departments) {
        const invalidDept = departments.some(d => !allowedDepts.includes(d));
        if (invalidDept) {
          return res.status(403).json({ message: "Forbidden: You cannot assign departments outside your own" });
        }
      }
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { designation, departments, salary, officeLocation, status, joiningDate, shift, performanceScore },
      { new: true }
    );
    await logAdminAction(req.user, `Updated officer profile of "${user.name}" (${user.email})`, `Officer ID: ${user._id}`);
    res.json({ message: "Officer profile updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createOfficer = async (req, res) => {
  try {
    const { name, email, password, phone, designation, departments, salary, officeLocation, joiningDate, shift, performanceScore } = req.body;
    
    if (req.user && req.user.role === "admin") {
      const allowedDepts = req.user.departments || [];
      const invalidDept = departments.some(d => !allowedDepts.includes(d));
      if (invalidDept || !departments || departments.length === 0) {
        return res.status(403).json({ message: "Forbidden: You can only assign officers to your own departments" });
      }
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "User with this email already exists" });
    }
    const hashPassword = await bcrypt.hash(password || "officer123", 10);
    const officer = await User.create({
      name,
      email,
      password: hashPassword,
      phone: phone || "",
      role: "admin",
      designation: designation || "Officer",
      departments: departments || [],
      salary: salary || 0,
      officeLocation: officeLocation || "Main Office",
      status: "Active",
      joiningDate: joiningDate || new Date(),
      shift: shift || "Morning",
      performanceScore: performanceScore || 5
    });
    await logAdminAction(req.user, `Created new officer profile for "${name}" (${email})`, `Officer ID: ${officer._id}`);
    res.status(201).json({ message: "Officer created successfully", officer });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAuditLogs = async (req, res) => {
  try {
    const query = {};
    if (req.user && req.user.role === "admin") {
      query.adminEmail = req.user.email;
    }
    const logs = await AuditLog.find(query).sort({ createdAt: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllEmployees = async (req, res) => {
  try {
    const query = {};
    if (req.user && req.user.role === "admin") {
      query.department = { $in: req.user.departments || [] };
    }
    const employees = await Employee.find(query).sort({ name: 1 });
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addEmployee = async (req, res) => {
  try {
    const { name, department, role, salary, shift, availability, performance, contactImage, contactDetails, address } = req.body;
    if (!name || !department) {
      return res.status(400).json({ message: "Employee name and department are required" });
    }
    if (req.user && req.user.role === "admin") {
      const allowedDepts = req.user.departments || [];
      if (!allowedDepts.includes(department)) {
        return res.status(403).json({ message: "Forbidden: You can only add employees to your own departments" });
      }
    }
    const empId = `EMP-${department.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    const employee = await Employee.create({
      employeeId: empId,
      name,
      department,
      role: role || "Technician",
      salary: salary || 25000,
      shift: shift || "9 AM - 5 PM",
      availability: availability || "Available",
      performance: performance || 5,
      contactImage: contactImage || "",
      contactDetails: contactDetails || "",
      address: address || ""
    });
    
    // Increment count in Department
    await Department.findOneAndUpdate(
      { departmentName: department },
      { $inc: { employees: 1 } }
    );

    await logAdminAction(req.user, `Added new employee "${employee.name}" to "${employee.department}"`, `Employee ID: ${employee._id}`);
    res.status(201).json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const editEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, department, role, salary, shift, availability, performance, contactImage, contactDetails, address } = req.body;
    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    
    if (req.user && req.user.role === "admin") {
      const allowedDepts = req.user.departments || [];
      if (!allowedDepts.includes(employee.department) || (department && !allowedDepts.includes(department))) {
        return res.status(403).json({ message: "Forbidden: You can only manage employees of your own departments" });
      }
    }
    
    const oldDept = employee.department;

    if (name !== undefined) employee.name = name;
    if (department !== undefined) employee.department = department;
    if (role !== undefined) employee.role = role;
    if (salary !== undefined) employee.salary = salary;
    if (shift !== undefined) employee.shift = shift;
    if (availability !== undefined) employee.availability = availability;
    if (performance !== undefined) employee.performance = performance;
    if (contactImage !== undefined) employee.contactImage = contactImage;
    if (contactDetails !== undefined) employee.contactDetails = contactDetails;
    if (address !== undefined) employee.address = address;

    await employee.save();

    // Update count in Department if changed
    if (department && department !== oldDept) {
      await Department.findOneAndUpdate({ departmentName: oldDept }, { $inc: { employees: -1 } });
      await Department.findOneAndUpdate({ departmentName: department }, { $inc: { employees: 1 } });
    }

    await logAdminAction(req.user, `Updated employee profile of "${employee.name}"`, `Employee ID: ${employee._id}`);
    res.json({ message: "Employee profile updated successfully", employee });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    if (req.user && req.user.role === "admin") {
      const allowedDepts = req.user.departments || [];
      if (!allowedDepts.includes(employee.department)) {
        return res.status(403).json({ message: "Forbidden: You can only delete employees of your own departments" });
      }
    }
    await Employee.findByIdAndDelete(id);

    // Decrement count in Department
    await Department.findOneAndUpdate(
      { departmentName: employee.department },
      { $inc: { employees: -1 } }
    );

    await logAdminAction(req.user, `Removed employee "${employee.name}" from registry`, `Employee ID: ${employee._id}`);
    res.json({ message: "Employee deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDepartmentComplaints = async (req, res) => {
  try {
    const query = {};
    if (req.user && req.user.role === "admin") {
      query.department = { $in: req.user.departments || [] };
    }
    const complaints = await DepartmentComplaint.find(query).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const dispatchDepartmentComplaint = async (req, res) => {
  try {
    const { complaintId, citizenName, complaintType, priority, department, assignedOfficer, status, slaDeadline } = req.body;
    if (!complaintId || !department) {
      return res.status(400).json({ message: "Complaint ID and Department are required" });
    }
    if (req.user && req.user.role === "admin") {
      const allowedDepts = req.user.departments || [];
      if (!allowedDepts.includes(department)) {
        return res.status(403).json({ message: "Forbidden: You cannot dispatch complaints for other departments" });
      }
    }
    const exists = await DepartmentComplaint.findOne({ complaintId });
    let complaint;
    if (exists) {
      complaint = await DepartmentComplaint.findOneAndUpdate(
        { complaintId },
        { citizenName, complaintType, priority, department, assignedOfficer, status, slaDeadline },
        { new: true }
      );
    } else {
      complaint = await DepartmentComplaint.create({
        complaintId,
        citizenName,
        complaintType: complaintType || "General",
        priority: priority || "Medium",
        department,
        assignedOfficer: assignedOfficer || "Unassigned",
        status: status || "New",
        slaDeadline: slaDeadline || new Date(Date.now() + 48 * 60 * 60 * 1000)
      });
    }
    await logAdminAction(req.user, `Dispatched complaint ${complaintId} to department "${department}"`, `Grievance ${complaintId}`);
    res.status(200).json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getClusters = async (req, res) => {
  try {
    const query = {
      isDuplicate: false,
      duplicateCount: { $gt: 0 }
    };
    if (req.user && req.user.role === "admin") {
      query.department = { $in: req.user.departments || [] };
    }
    const parents = await Complaint.find(query).sort({ createdAt: -1 });

    const clusters = [];
    for (const parent of parents) {
      const duplicates = await Complaint.find({
        parentComplaintId: parent.complaintId
      }).sort({ createdAt: -1 });

      clusters.push({
        parent,
        duplicates
      });
    }

    res.json(clusters);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const bulkResolveCluster = async (req, res) => {
  try {
    const parentId = req.params.id;
    const { status, reply } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required for resolution." });
    }

    const parentCheck = await Complaint.findOne({ complaintId: parentId });
    if (!parentCheck) {
      return res.status(404).json({ message: "Parent complaint not found." });
    }

    if (req.user && req.user.role === "admin") {
      const allowedDepts = req.user.departments || [];
      if (parentCheck.department && !allowedDepts.includes(parentCheck.department)) {
        return res.status(403).json({ message: "Forbidden: You cannot resolve clusters of other departments" });
      }
    }

    const parent = await Complaint.findOneAndUpdate(
      { complaintId: parentId },
      { status, reply },
      { new: true }
    );

    if (!parent) {
      return res.status(404).json({ message: "Parent complaint not found." });
    }

    await DepartmentComplaint.findOneAndUpdate(
      { complaintId: parentId },
      { status },
      { new: true }
    );

    const duplicates = await Complaint.find({ parentComplaintId: parentId });
    for (const dup of duplicates) {
      dup.status = status;
      dup.reply = reply || `Resolved in cluster along with parent issue ${parentId}.`;
      await dup.save();

      await DepartmentComplaint.findOneAndUpdate(
        { complaintId: dup.complaintId },
        { status },
        { new: true }
      );
    }

    await logAdminAction(
      req.user,
      `Bulk resolved cluster ${parentId} containing ${duplicates.length + 1} complaints to status "${status}"`,
      `Grievance Cluster ${parentId}`
    );

    const parentCitizen = await User.findById(parent.userId);
    if (parentCitizen && parentCitizen.phone) {
      await sendSMS(
        parentCitizen.phone,
        `🔔 LokSeva Alert: Your Grievance ${parent.complaintId} (Cluster Parent) has been bulk-updated to "${status}". Remarks: ${reply || "None"}. Track at http://localhost:5173/track?id=${parent.complaintId}`
      );
    }

    if (parentCitizen && parentCitizen.email) {
      await sendEmail(
        parentCitizen.email,
        `🔔 LokSeva Grievance Cluster Resolution: ${parent.complaintId}`,
        `Hello ${parentCitizen.name},\n\nYour grievance ${parent.complaintId} has been bulk-updated to "${status}" as part of a cluster resolution.\n\nNew Status: ${status}\nRemarks: ${reply || "Resolved in cluster."}\n\nTrack progress online at: http://localhost:5173/track?id=${parent.complaintId}\n\nThank you,\nLokSeva Support Team`
      );
    }

    for (const dup of duplicates) {
      const dupCitizen = await User.findById(dup.userId);
      if (dupCitizen && dupCitizen.phone) {
        await sendSMS(
          dupCitizen.phone,
          `🔔 LokSeva Alert: Your Grievance ${dup.complaintId} (linked to duplicate cluster) has been resolved. Remarks: ${reply || "Resolved in cluster."}. Track at http://localhost:5173/track?id=${dup.complaintId}`
        );
      }

      if (dupCitizen && dupCitizen.email) {
        await sendEmail(
          dupCitizen.email,
          `🔔 LokSeva Grievance Cluster Resolution: ${dup.complaintId}`,
          `Hello ${dupCitizen.name},\n\nYour grievance ${dup.complaintId} has been resolved along with similar complaints in your area.\n\nReference ID: ${dup.complaintId}\nNew Status: ${status}\nRemarks: ${reply || "Resolved in cluster."}\n\nTrack progress online at: http://localhost:5173/track?id=${dup.complaintId}\n\nThank you,\nLokSeva Support Team`
        );
      }
    }

    res.json({
      success: true,
      message: `Successfully updated ${duplicates.length + 1} complaints in cluster ${parentId}.`,
      parent
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllComplaints,
  assignComplaint,
  assignBatchComplaints,
  updateStatus,
  getAllUsers,
  updateUserRole,
  getSystemStatus,
  getAllDepartments,
  addDepartment,
  editDepartment,
  deleteDepartment,
  updateOfficerProfile,
  createOfficer,
  getAuditLogs,
  getAllEmployees,
  addEmployee,
  editEmployee,
  deleteEmployee,
  getDepartmentComplaints,
  dispatchDepartmentComplaint,
  seedDatabase,
  getClusters,
  bulkResolveCluster
};