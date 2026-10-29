const express=require("express");

const router=express.Router();

const { protect, protectAdmin } = require("../middleware/authMiddleware");


const {
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
  getClusters,
  bulkResolveCluster
} = require("../controllers/adminController");




// view complaints

router.get(
"/complaints",
protectAdmin,
getAllComplaints
);




// assign officer

router.put(
"/assign/:id",
protectAdmin,
assignComplaint
);




// assign batch officers

router.put(
"/assign-batch",
protectAdmin,
assignBatchComplaints
);




// update status

router.put(
"/status/:id",
protectAdmin,
updateStatus
);




// user management routes

router.get(
"/users",
protectAdmin,
getAllUsers
);

router.put(
  "/users/:id/role",
  protectAdmin,
  updateUserRole
);

router.put(
  "/users/:id/profile",
  protectAdmin,
  updateOfficerProfile
);

router.post(
  "/users/create-officer",
  protectAdmin,
  createOfficer
);




// system health configurations

router.get(
"/system-status",
protectAdmin,
getSystemStatus
);

router.get(
"/departments",
protect,
getAllDepartments
);

router.post(
  "/departments",
  protectAdmin,
  addDepartment
);

router.put(
  "/departments/:id",
  protectAdmin,
  editDepartment
);

router.delete(
  "/departments/:id",
  protectAdmin,
  deleteDepartment
);

router.get(
  "/audit-logs",
  protectAdmin,
  getAuditLogs
);

// Employee CRUD
router.get(
  "/employees",
  protectAdmin,
  getAllEmployees
);

router.post(
  "/employees",
  protectAdmin,
  addEmployee
);

router.put(
  "/employees/:id",
  protectAdmin,
  editEmployee
);

router.delete(
  "/employees/:id",
  protectAdmin,
  deleteEmployee
);

// Department Complaints & Dispatch
router.get(
  "/dept-complaints",
  protectAdmin,
  getDepartmentComplaints
);

router.post(
  "/dept-complaints",
  protectAdmin,
  dispatchDepartmentComplaint);

// Diagnostics public route to force-seed all 6 departments
router.get("/force-seed", async (req, res) => {
  try {
    const Department = require("../models/Department");
    const Employee = require("../models/Employee");
    
    await Department.deleteMany({});
    
    const defaults = [
      { departmentId: "DEPT-WAT-01", departmentName: "Water Supply Department", headOfficer: "Assistant Engineer", contact: "Phone: +91 11 2345 6701 | Email: watersupply@smartcity.gov.in | Location: Ground Floor, Civic Center", employees: 26, salary: "₹25,000 - ₹80,000", workingHours: "9 AM - 5 PM", sla: "24 Hours", complaints: 12, performance: 4.5, status: "Active" },
      { departmentId: "DEPT-ELE-02", departmentName: "Electricity Department", headOfficer: "Electrical Engineer", contact: "Phone: +91 11 2345 6702 | Email: electricity@smartcity.gov.in | Location: 1st Floor, Energy Bhawan", employees: 39, salary: "₹26,000 - ₹85,000", workingHours: "Office: 9 AM - 5 PM | Emergency: 24 Hours", sla: "12 Hours", complaints: 18, performance: 4.2, status: "Active" },
      { departmentId: "DEPT-ROD-03", departmentName: "Road and Transport Department", headOfficer: "Civil Engineer", contact: "Phone: +91 11 2345 6703 | Email: roadtransport@smartcity.gov.in | Location: 3rd Floor, Transport Annex", employees: 38, salary: "₹20,000 - ₹90,000", workingHours: "8 AM - 5 PM", sla: "7 Days", complaints: 9, performance: 4.0, status: "Active" },
      { departmentId: "DEPT-SAN-04", departmentName: "Sanitation Department", headOfficer: "Sanitary Officer", contact: "Phone: +91 11 2345 6704 | Email: sanitation@smartcity.gov.in | Location: Basement, Municipal Complex", employees: 60, salary: "₹18,000 - ₹75,000", workingHours: "Morning Shift: 6 AM - 2 PM | Evening Shift: 2 PM - 10 PM", sla: "24 Hours", complaints: 25, performance: 4.6, status: "Active" },
      { departmentId: "DEPT-HEA-05", departmentName: "Health Department", headOfficer: "Medical Officer", contact: "Phone: +91 11 2345 6705 | Email: health@smartcity.gov.in | Location: Smart City General Hospital", employees: 45, salary: "₹25,000 - ₹1,10,000", workingHours: "24/7 Operations", sla: "12 Hours", complaints: 15, performance: 4.8, status: "Active" },
      { departmentId: "DEPT-REV-06", departmentName: "Revenue Department", headOfficer: "Revenue Officer", contact: "Phone: +91 11 2345 6706 | Email: revenue@smartcity.gov.in | Location: 2nd Floor, Treasury Office", employees: 20, salary: "₹22,000 - ₹95,000", workingHours: "10 AM - 5 PM", sla: "48 Hours", complaints: 6, performance: 4.4, status: "Active" }
    ];

    await Department.insertMany(defaults);
    
    const depts = await Department.find().sort({ departmentName: 1 });
    const empCount = await Employee.countDocuments();
    res.json({
      success: true,
      departmentCount: depts.length,
      employeeCount: empCount,
      departments: depts.map(d => ({ id: d.departmentId, name: d.departmentName, employees: d.employees }))
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get(
  "/clusters",
  protectAdmin,
  getClusters
);

router.put(
  "/clusters/:id/status",
  protectAdmin,
  bulkResolveCluster
);

module.exports=router;