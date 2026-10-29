import { useState, useEffect } from "react";
import API from "../api/api";

export default function DepartmentManager() {
  const [subTab, setSubTab] = useState("dashboard"); // "dashboard", "departments", "employees", "sla", "analytics", "json"

  // Roster lists from backend
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [deptComplaints, setDeptComplaints] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Assignment states for complaints in department detailed view
  const [assignmentStates, setAssignmentStates] = useState({});

  const getDeptHeadName = (deptName, fallback) => {
    if (!employees || employees.length === 0) return fallback;
    const head = employees.find(
      e => e.department && e.department.toLowerCase() === deptName.toLowerCase() && e.role === "Department Head"
    );
    return head ? `${head.name} (${fallback})` : fallback;
  };

  // SLA Warnings & Notifications Feed
  const [slaNotifications, setSlaNotifications] = useState([
    { id: 1, type: "escalation", message: "Grievance GRV902 (Water Leakage) is OVERDUE (SLA: 24 Hours). Escalated to Head of Department.", time: "10 mins ago" },
    { id: 2, type: "warning", message: "SLA Warning: GRV411 (Power Interruption) has only 2 hours remaining before SLA breach.", time: "45 mins ago" },
    { id: 3, type: "unavailable", message: "Officer Raj Kumar (Electricity Department) marked unavailable: Duty status set to 'On Leave'.", time: "2 hours ago" },
    { id: 4, type: "new", message: "System Auto-Assignment: GRV389 (Drainage overflow) assigned to Sanitation Department.", time: "3 hours ago" }
  ]);

  // AI Classification Sandbox States
  const [aiInputText, setAiInputText] = useState("");
  const [aiClassificationResult, setAiClassificationResult] = useState(null);
  const [aiClassifying, setAiClassifying] = useState(false);

  // Selected Department for Detail Page View
  const [selectedDeptDetail, setSelectedDeptDetail] = useState(null);

  // Roster form states
  const [deptForm, setDeptForm] = useState({
    id: "",
    departmentId: "",
    departmentName: "",
    headOfficer: "Assistant Engineer",
    contact: "",
    employees: 0,
    salary: "",
    workingHours: "9 AM - 5 PM",
    sla: "48 Hours",
    status: "Active"
  });
  const [isEditingDept, setIsEditingDept] = useState(false);

  // Employee form states
  const [employeeForm, setEmployeeForm] = useState({
    id: "",
    name: "",
    department: "",
    role: "Technician",
    salary: 25000,
    shift: "9 AM - 5 PM",
    availability: "Available",
    performance: 5,
    contactImage: "",
    contactDetails: "",
    address: ""
  });
  const [isEditingEmployee, setIsEditingEmployee] = useState(false);

  // Dispatch complaint form states
  const [dispatchForm, setDispatchForm] = useState({
    complaintId: "",
    citizenName: "",
    complaintType: "Water Leakage",
    priority: "High",
    department: "",
    assignedOfficer: "",
    slaDeadline: ""
  });

  // Load data on boot
  const loadData = async () => {
    try {
      setLoading(true);
      const [deptRes, empRes, deptCompRes, compRes, userRes] = await Promise.all([
        API.get("/admin/departments"),
        API.get("/admin/employees"),
        API.get("/admin/dept-complaints"),
        API.get("/admin/complaints"),
        API.get("/admin/users")
      ]);
      const defaultDepts = [
        { _id: "wat", departmentId: "DEPT-WAT-01", departmentName: "Water Supply Department", headOfficer: "Assistant Engineer", contact: "Phone: +91 11 2345 6701 | Email: watersupply@smartcity.gov.in", employees: 26, salary: "₹25,000 - ₹80,000", workingHours: "9 AM - 5 PM", sla: "24 Hours", complaints: 12, performance: 4.5, status: "Active" },
        { _id: "ele", departmentId: "DEPT-ELE-02", departmentName: "Electricity Department", headOfficer: "Electrical Engineer", contact: "Phone: +91 11 2345 6702 | Email: electricity@smartcity.gov.in", employees: 39, salary: "₹26,000 - ₹85,000", workingHours: "Office: 9 AM - 5 PM", sla: "12 Hours", complaints: 18, performance: 4.2, status: "Active" },
        { _id: "rod", departmentId: "DEPT-ROD-03", departmentName: "Road and Transport Department", headOfficer: "Civil Engineer", contact: "Phone: +91 11 2345 6703 | Email: roadtransport@smartcity.gov.in", employees: 38, salary: "₹20,000 - ₹90,000", workingHours: "8 AM - 5 PM", sla: "7 Days", complaints: 9, performance: 4.0, status: "Active" },
        { _id: "san", departmentId: "DEPT-SAN-04", departmentName: "Sanitation Department", headOfficer: "Sanitary Officer", contact: "Phone: +91 11 2345 6704 | Email: sanitation@smartcity.gov.in", employees: 60, salary: "₹18,000 - ₹75,000", workingHours: "Morning Shift: 6 AM - 2 PM", sla: "24 Hours", complaints: 25, performance: 4.6, status: "Active" },
        { _id: "hea", departmentId: "DEPT-HEA-05", departmentName: "Health Department", headOfficer: "Medical Officer", contact: "Phone: +91 11 2345 6705 | Email: health@smartcity.gov.in", employees: 45, salary: "₹25,000 - ₹1,10,000", workingHours: "24/7 Operations", sla: "12 Hours", complaints: 15, performance: 4.8, status: "Active" },
        { _id: "rev", departmentId: "DEPT-REV-06", departmentName: "Revenue Department", headOfficer: "Revenue Officer", contact: "Phone: +91 11 2345 6706 | Email: revenue@smartcity.gov.in", employees: 20, salary: "₹22,000 - ₹95,000", workingHours: "10 AM - 5 PM", sla: "48 Hours", complaints: 6, performance: 4.4, status: "Active" }
      ];

      const loadedDepts = deptRes.data || [];
      const existingNames = new Set(loadedDepts.map(d => d.departmentName));
      const mergedDepts = [...loadedDepts, ...defaultDepts.filter(d => !existingNames.has(d.departmentName))];

      setDepartments(mergedDepts);
      setEmployees(empRes.data || []);
      setDeptComplaints(deptCompRes.data || []);
      setComplaints(compRes.data || []);
      setUsers(userRes.data || []);

      if (mergedDepts.length > 0) {
        setEmployeeForm(prev => ({ ...prev, department: mergedDepts[0].departmentName }));
        setDispatchForm(prev => ({ ...prev, department: mergedDepts[0].departmentName }));
      }
    } catch (err) {
      console.error("Failed to load departments / employees data:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateAssignmentState = (complaintId, key, value) => {
    setAssignmentStates(prev => ({
      ...prev,
      [complaintId]: {
        ...prev[complaintId],
        [key]: value
      }
    }));
  };

  const handleAssignOfficer = async (complaintId, officerName, priority, dueDate) => {
    try {
      await API.put(`/admin/assign/${complaintId}`, {
        department: selectedDeptDetail.departmentName,
        officer: officerName,
        priority: priority || "Medium",
        dueDate: dueDate || null
      });
      alert(`Grievance ${complaintId} assigned to officer "${officerName}" successfully!`);
      loadData();
    } catch (err) {
      console.error(err);
      alert("Failed to assign grievance: " + (err.response?.data?.message || err.message));
    }
  };

  const handleCompleteWork = async (complaintId, status, reply) => {
    try {
      await API.put(`/admin/status/${complaintId}`, {
        status: status || "Completed",
        reply: reply || "Work completed and issue resolved by department officer."
      });
      alert(`Grievance ${complaintId} marked as ${status || "Completed"} successfully!`);
      loadData();
    } catch (err) {
      console.error(err);
      alert("Failed to complete work: " + (err.response?.data?.message || err.message));
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Department CRUD Handlers
  const handleSaveDept = async (e) => {
    e.preventDefault();
    if (!deptForm.departmentName || !deptForm.headOfficer) {
      alert("Department Name and Head Officer fields are required.");
      return;
    }
    try {
      if (isEditingDept) {
        await API.put(`/admin/departments/${deptForm.id}`, deptForm);
        alert("Department details updated successfully!");
      } else {
        await API.post("/admin/departments", deptForm);
        alert("New Smart Department registered successfully!");
      }
      setDeptForm({
        id: "",
        departmentId: "",
        departmentName: "",
        headOfficer: "Assistant Engineer",
        contact: "",
        employees: 0,
        salary: "",
        workingHours: "9 AM - 5 PM",
        sla: "48 Hours",
        status: "Active"
      });
      setIsEditingDept(false);
      loadData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to save department details.");
    }
  };

  const handleEditDept = (dept) => {
    setDeptForm({
      id: dept._id,
      departmentId: dept.departmentId,
      departmentName: dept.departmentName,
      headOfficer: dept.headOfficer,
      contact: dept.contact || "",
      employees: dept.employees || 0,
      salary: dept.salary || "",
      workingHours: dept.workingHours || "9 AM - 5 PM",
      sla: dept.sla || "48 Hours",
      status: dept.status || "Active"
    });
    setIsEditingDept(true);
    setSubTab("departments");
  };

  const handleDeleteDept = async (id, name) => {
    if (!confirm(`Are you sure you want to delete the department "${name}" and all its records?`)) return;
    try {
      await API.delete(`/admin/departments/${id}`);
      alert("Department record deleted successfully.");
      loadData();
    } catch (err) {
      console.error(err);
      alert("Failed to delete department.");
    }
  };

  // Employee CRUD Handlers
  const handleSaveEmployee = async (e) => {
    e.preventDefault();
    if (!employeeForm.name || !employeeForm.department) {
      alert("Employee Name and Department selection are required.");
      return;
    }
    try {
      if (isEditingEmployee) {
        await API.put(`/admin/employees/${employeeForm.id}`, employeeForm);
        alert("Employee profile details updated!");
      } else {
        await API.post("/admin/employees", employeeForm);
        alert("New employee added to the registry!");
      }
      setEmployeeForm({
        id: "",
        name: "",
        department: departments[0]?.departmentName || "",
        role: "Technician",
        salary: 25000,
        shift: "9 AM - 5 PM",
        availability: "Available",
        performance: 5,
        contactImage: "",
        contactDetails: "",
        address: ""
      });
      setIsEditingEmployee(false);
      loadData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to save employee profile.");
    }
  };

  const handleEditEmployee = (emp) => {
    setEmployeeForm({
      id: emp._id,
      name: emp.name,
      department: emp.department,
      role: emp.role,
      salary: emp.salary,
      shift: emp.shift || "9 AM - 5 PM",
      availability: emp.availability || "Available",
      performance: emp.performance || 5,
      contactImage: emp.contactImage || "",
      contactDetails: emp.contactDetails || "",
      address: emp.address || ""
    });
    setIsEditingEmployee(true);
    setSelectedDeptDetail(null);
    setSubTab("employees");
  };

  const handleDeleteEmployee = async (id, name) => {
    if (!confirm(`Are you sure you want to remove "${name}" from the employee registry?`)) return;
    try {
      await API.delete(`/admin/employees/${id}`);
      alert("Employee record deleted.");
      loadData();
    } catch (err) {
      console.error(err);
      alert("Failed to remove employee.");
    }
  };

  // Dispatch Complaint Handler
  const handleDispatchComplaint = async (e) => {
    e.preventDefault();
    if (!dispatchForm.complaintId || !dispatchForm.department) {
      alert("Complaint ID and department selection are required.");
      return;
    }
    try {
      await API.post("/admin/dept-complaints", dispatchForm);
      alert(`Complaint ${dispatchForm.complaintId} dispatched successfully to ${dispatchForm.department}!`);
      setDispatchForm({
        complaintId: "",
        citizenName: "",
        complaintType: "Water Leakage",
        priority: "High",
        department: departments[0]?.departmentName || "",
        assignedOfficer: "",
        slaDeadline: ""
      });
      loadData();
    } catch (err) {
      console.error(err);
      alert("Failed to dispatch complaint.");
    }
  };

  // AI Classification engine simulation
  const handleAIClassify = async (e) => {
    e.preventDefault();
    if (!aiInputText.trim()) return;

    setAiClassifying(true);
    setAiClassificationResult(null);

    setTimeout(() => {
      const text = aiInputText.toLowerCase();
      let predictedDept = "Revenue Department";
      let predictedPriority = "Medium";
      let confidence = 92;

      if (text.includes("water") || text.includes("leak") || text.includes("sewer") || text.includes("pipe") || text.includes("drainage")) {
        predictedDept = "Water Supply Department";
        predictedPriority = text.includes("burst") || text.includes("flooding") ? "High" : "Medium";
      } else if (text.includes("light") || text.includes("electricity") || text.includes("power") || text.includes("wire") || text.includes("voltage") || text.includes("shock")) {
        predictedDept = "Electricity Department";
        predictedPriority = text.includes("sparking") || text.includes("wire down") || text.includes("shock") ? "Emergency" : "Medium";
      } else if (text.includes("road") || text.includes("pot hole") || text.includes("pothole") || text.includes("highway") || text.includes("transport") || text.includes("bus")) {
        predictedDept = "Road and Transport Department";
        predictedPriority = text.includes("accident") || text.includes("cave-in") ? "High" : "Low";
      } else if (text.includes("garbage") || text.includes("clean") || text.includes("sweep") || text.includes("dump") || text.includes("waste")) {
        predictedDept = "Sanitation Department";
        predictedPriority = "Low";
      } else if (text.includes("fever") || text.includes("outbreak") || text.includes("dengue") || text.includes("hospital") || text.includes("medicine")) {
        predictedDept = "Health Department";
        predictedPriority = "High";
      }

      setAiClassificationResult({
        department: predictedDept,
        priority: predictedPriority,
        confidence: `${confidence}%`,
        sla: predictedPriority === "Emergency" ? "12 Hours" : predictedPriority === "High" ? "24 Hours" : predictedPriority === "Medium" ? "48 Hours" : "7 Days",
        routingEngine: "Smart-AutoRouter V3.8"
      });
      setAiClassifying(false);
    }, 1000);
  };

  // Staff Counters helper
  const getStaffCounts = (deptName) => {
    const deptEmployees = employees.filter(emp => emp.department === deptName);
    const available = deptEmployees.filter(emp => emp.availability === "Available").length;
    const busy = deptEmployees.filter(emp => emp.availability === "Busy").length;
    const onLeave = deptEmployees.filter(emp => emp.availability === "On Leave").length;
    return {
      total: deptEmployees.length || deptName ? departments.find(d => d.departmentName === deptName)?.employees || 0 : 0,
      available,
      busy,
      onLeave
    };
  };

  // SLA helper details
  const slaPolicies = [
    { type: "Emergency", responseTime: "1 Hour", resolutionTime: "12 Hours", overdueCount: 1, examples: "Hazardous Gas Leak, High Voltage Cable Break" },
    { type: "High Priority", responseTime: "4 Hours", resolutionTime: "24 Hours", overdueCount: 3, examples: "Water Main Leakage, Traffic Light Breakdown" },
    { type: "Medium Priority", responseTime: "12 Hours", resolutionTime: "48 Hours", overdueCount: 8, examples: "No Water Supply, Domestic Power Outage" },
    { type: "Low Priority", responseTime: "24 Hours", resolutionTime: "7 Days", overdueCount: 14, examples: "Street Light repairs, Road potholes patch-up" }
  ];

  return (
    <div style={{
      color: "var(--text-primary)",
      fontFamily: "var(--font-sans)",
      marginTop: "20px"
    }}>
      {/* Sub Navigation Tabs */}
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", borderBottom: "1px solid var(--border-light)", paddingBottom: "15px", marginBottom: "30px" }}>
        {[
          { key: "dashboard", label: "🏢 Department Dashboard" },
          { key: "departments", label: "🗂️ Roster Registry" },
          { key: "employees", label: "👥 Employee Roster" },
          { key: "sla", label: "⏱️ SLA & Dispatch" },
          { key: "accountability", label: "⚖️ Anti-Delay Engine" },
          { key: "analytics", label: "🤖 AI Analytics" }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => { setSubTab(tab.key); setSelectedDeptDetail(null); }}
            style={subTab === tab.key ? {
              backgroundColor: "rgba(249, 115, 22, 0.15)",
              color: "var(--text-primary)",
              border: "none",
              borderBottom: "2px solid var(--color-primary)",
              padding: "10px 18px",
              borderRadius: "6px 6px 0 0",
              fontWeight: "600",
              cursor: "pointer",
              boxShadow: "var(--shadow-glow)",
              fontSize: "13px"
            } : {
              backgroundColor: "transparent",
              color: "var(--text-secondary)",
              border: "1px solid var(--border-light)",
              padding: "10px 18px",
              borderRadius: "6px",
              fontWeight: "500",
              cursor: "pointer",
              fontSize: "13px",
              transition: "all 0.2s"
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* SLA Notification Alerts Banner */}
      <div style={{
        borderLeft: "4px solid var(--color-pending)",
        padding: "16px 20px",
        marginBottom: "25px",
        backgroundColor: "var(--color-pending-bg)",
        borderRadius: "8px",
        border: "1px solid var(--border-accent)",
        borderLeftWidth: "4px"
      }}>
        <h4 style={{ margin: "0 0 10px 0", fontSize: "14px", color: "var(--color-pending)", display: "flex", alignItems: "center", gap: "8px", fontWeight: "700" }}>
          ⚠️ Real-Time SLA Monitoring & System Alerts
        </h4>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {slaNotifications.map(alertItem => (
            <div key={alertItem.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px" }}>
              <span style={{ color: "var(--text-primary)" }}>
                {alertItem.type === "escalation" ? "🚨" : alertItem.type === "warning" ? "⏳" : "👤"} {alertItem.message}
              </span>
              <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>{alertItem.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* --------------------- VIEW 1: DASHBOARD OVERVIEW --------------------- */}
      {subTab === "dashboard" && !selectedDeptDetail && (
        <div>
          {/* Summary Cards Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "20px", marginBottom: "35px" }}>
            {[
              { label: "Total Departments", val: departments.length, border: "var(--color-primary)" },
              { label: "Total Employees", val: employees.length, border: "#3b82f6" },
              { label: "Active Officers", val: employees.filter(emp => emp.role === "Department Head" || emp.role === "Officer").length, border: "var(--color-completed)" },
              { label: "Pending Complaints", val: complaints.filter(c => ["Pending", "Assigned", "Processing"].includes(c.status)).length, border: "var(--color-pending)" },
              { label: "Resolved Complaints", val: complaints.filter(c => ["Completed", "Solved", "Resolved", "Closed"].includes(c.status)).length, border: "var(--color-completed)" },
              { label: "Avg Resolution Time", val: "24.2 hrs", border: "#a855f7" }
            ].map(card => (
              <div key={card.label} style={{
                backgroundColor: "var(--bg-glass)",
                padding: "20px",
                borderLeft: `4px solid ${card.border}`,
                borderRadius: "8px",
                display: "flex",
                flexDirection: "column",
                border: "1px solid var(--border-light)",
                borderLeftWidth: "4px"
              }}>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>{card.label}</span>
                <span style={{ fontSize: "28px", fontWeight: "800", marginTop: "5px", color: "var(--text-primary)" }}>{card.val}</span>
              </div>
            ))}
          </div>

          {/* Department Cards Catalog Grid */}
          <h3 style={{ marginBottom: "20px", fontWeight: "700", fontSize: "18px", color: "var(--text-primary)" }}>🏢 Active Smart City Departments Catalog</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px", marginBottom: "40px" }}>
            {departments.map((dept) => {
              const staffCounts = getStaffCounts(dept.departmentName);
              const deptComplaintsList = complaints.filter(c => c.department === dept.departmentName);
              const isActive = dept.status === "Active";
              return (
                <div key={dept._id} style={{
                  backgroundColor: "var(--bg-glass)",
                  padding: "24px 30px",
                  borderRadius: "10px",
                  border: "1px solid var(--border-light)",
                  borderTop: "3px solid var(--color-primary)",
                  boxShadow: "var(--shadow-sm)"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "15px" }}>
                    <h4 style={{ margin: 0, fontSize: "16px", color: "var(--text-primary)", fontWeight: "700" }}>{dept.departmentName}</h4>
                    <span style={{
                      padding: "4px 8px",
                      fontSize: "11px",
                      fontWeight: "700",
                      borderRadius: "4px",
                      backgroundColor: isActive ? "var(--color-completed-bg)" : "var(--color-pending-bg)",
                      color: isActive ? "var(--color-completed)" : "var(--color-pending)",
                      border: isActive ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid rgba(245, 158, 11, 0.3)"
                    }}>
                      {dept.status || "ACTIVE"}
                    </span>
                  </div>
                  <div style={{ fontSize: "13px", display: "flex", flexDirection: "column", gap: "8px", color: "var(--text-secondary)", marginBottom: "20px" }}>
                    <div>👤 <strong>Department Head:</strong> {getDeptHeadName(dept.departmentName, dept.headOfficer)}</div>
                    <div>👥 <strong>Employees:</strong> {dept.employees || staffCounts.total} Staff</div>
                    <div>🕒 <strong>Working Hours:</strong> {dept.workingHours}</div>
                    <div>⏱️ <strong>SLA Response:</strong> {dept.sla}</div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-light)", paddingTop: "15px" }}>
                    <button
                      onClick={() => setSelectedDeptDetail(dept)}
                      style={{
                        backgroundColor: "rgba(249, 115, 22, 0.1)",
                        color: "var(--color-primary)",
                        border: "1px solid var(--border-accent)",
                        padding: "8px 14px",
                        fontSize: "12px",
                        borderRadius: "6px",
                        fontWeight: "600",
                        cursor: "pointer"
                      }}
                    >
                      🔍 Detail View & Salaries
                    </button>
                    <span style={{ fontSize: "12px", color: "var(--color-primary)", fontWeight: "700" }}>
                      ⚡ {deptComplaintsList.length || dept.complaints || 0} grievances
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --------------------- VIEW 1: DETAILED DEPT PAGE --------------------- */}
      {selectedDeptDetail && (
        <div style={{ marginBottom: "40px" }}>

          {/* ── Header ── */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "var(--bg-glass)",
            padding: "18px 24px",
            borderRadius: "10px 10px 0 0",
            borderBottom: "2px solid var(--color-primary)",
            border: "1px solid var(--border-light)",
            borderBottomColor: "var(--color-primary)"
          }}>
            <div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>
                Department Profile
              </div>
              <h3 style={{ margin: 0, color: "var(--text-primary)", fontWeight: "700", fontSize: "20px" }}>
                {selectedDeptDetail.departmentName}
              </h3>
            </div>
            <button
              onClick={() => setSelectedDeptDetail(null)}
              style={{
                backgroundColor: "transparent",
                color: "var(--text-secondary)",
                border: "1px solid var(--border-light)",
                padding: "8px 18px",
                fontSize: "13px",
                borderRadius: "6px",
                fontWeight: "600",
                cursor: "pointer"
              }}
            >
              ← Back to Departments
            </button>
          </div>

          {/* ── Main Content ── */}
          <div style={{
            backgroundColor: "var(--bg-glass)",
            border: "1px solid var(--border-light)",
            borderTop: "none",
            borderRadius: "0 0 10px 10px",
            padding: "28px 28px 32px"
          }}>

            {/* Row 1: Dept Info + Staff Table side by side */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px", marginBottom: "28px" }}>

              {/* Department Information */}
              <div>
                <div style={{ fontSize: "12px", fontWeight: "700", color: "var(--color-primary)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "14px", borderBottom: "1px solid var(--border-light)", paddingBottom: "8px" }}>
                  Department Information
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <tbody>
                    {[
                      { label: "Department ID", val: selectedDeptDetail.departmentId },
                      { label: "Head Officer", val: getDeptHeadName(selectedDeptDetail.departmentName, selectedDeptDetail.headOfficer) },
                      { label: "Working Hours", val: selectedDeptDetail.workingHours },
                      { label: "SLA Response", val: selectedDeptDetail.sla },
                      { label: "Total Staff", val: `${selectedDeptDetail.employees} Employees` },
                      { label: "Status", val: selectedDeptDetail.status || "Active" },
                      { label: "Performance", val: `${selectedDeptDetail.performance} / 5.0` },
                    ].map(row => (
                      <tr key={row.label} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <td style={{ padding: "9px 0", color: "var(--text-muted)", fontWeight: "600", width: "38%", verticalAlign: "top" }}>{row.label}</td>
                        <td style={{ padding: "9px 0 9px 10px", color: "var(--text-primary)", fontWeight: "500" }}>{row.val}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Staff Breakdown */}
              <div>
                <div style={{ fontSize: "12px", fontWeight: "700", color: "var(--color-primary)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "14px", borderBottom: "1px solid var(--border-light)", paddingBottom: "8px" }}>
                  Staff Breakdown by Role
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border-light)" }}>
                      <th style={{ textAlign: "left", padding: "7px 0", color: "var(--text-muted)", fontWeight: "600", fontSize: "11px" }}>Role</th>
                      <th style={{ textAlign: "right", padding: "7px 0", color: "var(--text-muted)", fontWeight: "600", fontSize: "11px" }}>Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {["Department Head", "Engineer", "Officer", "Technician", "Supervisor", "Field Worker", "Data Entry Operator"].map(role => {
                      const count = employees.filter(e => e.department === selectedDeptDetail.departmentName && e.role === role).length;
                      if (count === 0) return null;
                      return (
                        <tr key={role} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                          <td style={{ padding: "8px 0", color: "var(--text-secondary)" }}>{role}</td>
                          <td style={{ padding: "8px 0", color: "var(--text-primary)", fontWeight: "700", textAlign: "right" }}>{count}</td>
                        </tr>
                      );
                    })}
                    <tr style={{ borderTop: "1px solid var(--border-light)" }}>
                      <td style={{ padding: "9px 0", color: "var(--color-primary)", fontWeight: "700" }}>Total</td>
                      <td style={{ padding: "9px 0", color: "var(--color-primary)", fontWeight: "800", textAlign: "right" }}>
                        {employees.filter(e => e.department === selectedDeptDetail.departmentName).length || selectedDeptDetail.employees}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── Salary Bands ── */}
            <div style={{ borderTop: "1px solid var(--border-light)", paddingTop: "22px", marginBottom: "28px" }}>
              <div style={{ fontSize: "12px", fontWeight: "700", color: "var(--color-primary)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "14px" }}>
                Salary Configuration
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
                {[
                  { role: "Department Head", fallback: 80000 },
                  { role: "Engineer", fallback: 60000 },
                  { role: "Officer", fallback: 45000 },
                  { role: "Technician", fallback: 35000 },
                  { role: "Field Worker", fallback: 25000 }
                ].map(item => {
                  const emp = employees.find(e => e.department === selectedDeptDetail.departmentName && e.role === item.role);
                  const salary = emp?.salary || item.fallback;
                  return (
                    <div key={item.role} style={{
                      padding: "14px 16px",
                      borderRadius: "8px",
                      border: "1px solid var(--border-light)",
                      backgroundColor: "rgba(255,255,255,0.02)"
                    }}>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "600", marginBottom: "5px" }}>{item.role}</div>
                      <div style={{ fontSize: "16px", fontWeight: "800", color: "var(--text-primary)" }}>₹{salary.toLocaleString()}<span style={{ fontSize: "11px", fontWeight: "400", color: "var(--text-muted)" }}>/mo</span></div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Contact Info ── */}
            <div style={{ borderTop: "1px solid var(--border-light)", paddingTop: "20px", marginBottom: "28px" }}>
              <div style={{ fontSize: "12px", fontWeight: "700", color: "var(--color-primary)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "10px" }}>
                Contact &amp; Location
              </div>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0, lineHeight: "1.7" }}>
                {selectedDeptDetail.contact || "Contact information not available."}
              </p>
            </div>

            {/* ── Department Staff Roster ── */}
            <div style={{ borderTop: "1px solid var(--border-light)", paddingTop: "22px", marginBottom: "28px" }}>
              <div style={{ fontSize: "12px", fontWeight: "700", color: "var(--color-primary)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "16px" }}>
                👥 Active Department Staff &amp; Officers
              </div>
              {(() => {
                const deptStaff = employees.filter(
                  e => e.department && e.department.toLowerCase() === selectedDeptDetail.departmentName.toLowerCase()
                );

                if (deptStaff.length === 0) {
                  return (
                    <div style={{ padding: "15px", textAlign: "center", color: "var(--text-muted)", border: "1px dashed var(--border-light)", borderRadius: "8px", fontSize: "13px" }}>
                      No staff registered in this department roster.
                    </div>
                  );
                }

                return (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
                    {deptStaff.map(staff => {
                      const isAvailable = staff.availability === "Available";
                      const isBusy = staff.availability === "Busy";
                      return (
                        <div 
                          key={staff._id || staff.employeeId} 
                          onClick={() => handleEditEmployee(staff)}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = "var(--color-primary)";
                            e.currentTarget.style.backgroundColor = "rgba(249, 115, 22, 0.05)";
                            e.currentTarget.style.boxShadow = "var(--shadow-glow)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = "var(--border-light)";
                            e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.18)";
                            e.currentTarget.style.boxShadow = "none";
                          }}
                          style={{
                            backgroundColor: "rgba(0,0,0,0.18)",
                            border: "1px solid var(--border-light)",
                            borderRadius: "8px",
                            padding: "16px",
                            display: "flex",
                            gap: "14px",
                            alignItems: "flex-start",
                            cursor: "pointer",
                            transition: "all 0.2s ease-in-out"
                          }}
                        >
                          <img 
                            src={staff.contactImage || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(staff.name)}`} 
                            alt={staff.name} 
                            style={{
                              width: "48px",
                              height: "48px",
                              borderRadius: "50%",
                              objectFit: "cover",
                              border: "1px solid var(--border-light)",
                              backgroundColor: "rgba(255,255,255,0.05)"
                            }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "6px" }}>
                              <span style={{ fontWeight: "700", color: "var(--text-primary)", fontSize: "14px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{staff.name}</span>
                              <span style={{
                                padding: "2px 6px",
                                fontSize: "9px",
                                fontWeight: "700",
                                borderRadius: "4px",
                                backgroundColor: isAvailable ? "var(--color-completed-bg)" : isBusy ? "var(--color-pending-bg)" : "rgba(239, 68, 68, 0.15)",
                                color: isAvailable ? "var(--color-completed)" : isBusy ? "var(--color-pending)" : "#fca5a5",
                                whiteSpace: "nowrap"
                              }}>
                                {staff.availability}
                              </span>
                            </div>
                            <div style={{ fontSize: "12px", color: "var(--color-primary)", fontWeight: "600", marginTop: "2px" }}>{staff.role}</div>
                            
                            <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "4px", fontSize: "11px", color: "var(--text-secondary)" }}>
                              {staff.contactDetails && (
                                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                  <span>📞</span> <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{staff.contactDetails}</span>
                                </div>
                              )}
                              {staff.address && (
                                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                  <span>📍</span> <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{staff.address}</span>
                                </div>
                              )}
                              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <span>⏱️</span> <span>Shift: {staff.shift || "9 AM - 5 PM"}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* ── Citizen Grievances ── */}
            <div style={{ borderTop: "1px solid var(--border-light)", paddingTop: "22px" }}>
              <div style={{ fontSize: "12px", fontWeight: "700", color: "var(--color-primary)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "16px" }}>
                Citizen Grievances — {selectedDeptDetail.departmentName}
              </div>

              {(() => {
                const deptKey = selectedDeptDetail.departmentName.toLowerCase();
                const allSourceComplaints = [
                  ...complaints,
                  ...deptComplaints.map(dc => ({
                    _id: dc._id || dc.complaintId,
                    complaintId: dc.complaintId,
                    citizenName: dc.citizenName,
                    department: dc.department,
                    priority: dc.priority,
                    officer: dc.assignedOfficer,
                    status: dc.status,
                    description: `${dc.complaintType} - Dispatched to ${dc.department}`,
                    createdAt: dc.createdAt || new Date()
                  }))
                ];

                // Remove duplicates by complaintId
                const uniqueComplaints = Array.from(new Map(allSourceComplaints.map(c => [c.complaintId, c])).values());

                const filtered = uniqueComplaints.filter(c =>
                  c.department && (
                    c.department.toLowerCase() === deptKey ||
                    c.department.toLowerCase().includes(deptKey) ||
                    deptKey.includes(c.department.toLowerCase()) ||
                    (deptKey.includes("water") && c.department.toLowerCase().includes("water")) ||
                    (deptKey.includes("electr") && c.department.toLowerCase().includes("electr")) ||
                    (deptKey.includes("road") && c.department.toLowerCase().includes("road")) ||
                    (deptKey.includes("sanit") && c.department.toLowerCase().includes("sanit")) ||
                    (deptKey.includes("health") && c.department.toLowerCase().includes("health")) ||
                    (deptKey.includes("reven") && c.department.toLowerCase().includes("reven"))
                  )
                );

                if (filtered.length === 0) {
                  return (
                    <p style={{ fontSize: "13px", color: "var(--text-muted)", fontStyle: "italic", margin: 0 }}>
                      No active grievances filed under this department.
                    </p>
                  );
                }

                return (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {filtered.map(item => {
                      const statusLower = (item.status || "Pending").toLowerCase();
                      const isResolved = statusLower === "resolved" || statusLower === "completed" || statusLower === "closed" || statusLower === "solved";
                      const deptEmployees = employees.filter(
                        e => e.department && e.department.toLowerCase() === selectedDeptDetail.departmentName.toLowerCase()
                      );
                      const fallbackAdmins = users.filter(u => u.role === "admin");
                      return (
                        <div key={item._id} style={{
                          border: "1px solid var(--border-light)",
                          borderLeft: `3px solid ${isResolved ? "var(--color-completed)" : "var(--color-primary)"}`,
                          borderRadius: "6px",
                          padding: "16px 18px",
                          backgroundColor: "rgba(0,0,0,0.12)"
                        }}>
                          {/* Top row */}
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                            <span style={{ fontWeight: "700", color: "var(--text-primary)", fontSize: "13px" }}>#{item.complaintId}</span>
                            <span style={{
                              padding: "2px 8px",
                              fontSize: "11px",
                              fontWeight: "700",
                              borderRadius: "4px",
                              backgroundColor: isResolved ? "var(--color-completed-bg)" : "var(--color-pending-bg)",
                              color: isResolved ? "var(--color-completed)" : "var(--color-pending)"
                            }}>
                              {item.status || "Pending"}
                            </span>
                          </div>

                          {/* Info grid */}
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 20px", fontSize: "12px", color: "var(--text-secondary)", marginBottom: "10px" }}>
                            <div><span style={{ color: "var(--text-muted)" }}>Citizen:</span> {item.citizenName || "—"}</div>
                            <div><span style={{ color: "var(--text-muted)" }}>Priority:</span> {item.priority || "Medium"}</div>
                            <div><span style={{ color: "var(--text-muted)" }}>Location:</span> {item.location || "Not Specified"}</div>
                            <div><span style={{ color: "var(--text-muted)" }}>Filed:</span> {new Date(item.createdAt).toLocaleDateString()}</div>
                            <div style={{ gridColumn: "1/-1" }}><span style={{ color: "var(--text-muted)" }}>Officer:</span> {item.officer || "Awaiting Assignment"}</div>
                          </div>

                          {/* Description */}
                          <p style={{ fontSize: "12px", color: "var(--text-primary)", margin: "0 0 12px 0", lineHeight: "1.5" }}>
                            {item.description}
                          </p>

                          {/* Assignment row (only for unresolved) */}
                          {!isResolved && (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "flex-end", paddingTop: "10px", borderTop: "1px solid var(--border-light)" }}>
                              <div style={{ flex: "1", minWidth: "160px" }}>
                                <label style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>Assign Officer</label>
                                <select
                                  value={assignmentStates[item.complaintId]?.officer || ""}
                                  onChange={e => updateAssignmentState(item.complaintId, "officer", e.target.value)}
                                  style={{ width: "100%", padding: "7px 8px", borderRadius: "4px", backgroundColor: "rgba(0,0,0,0.3)", border: "1px solid var(--border-light)", color: "var(--text-primary)", fontSize: "12px" }}
                                >
                                  <option value="">-- Select Officer --</option>
                                  {deptEmployees.length > 0 ? (
                                    deptEmployees.map(off => (
                                      <option key={off.employeeId || off._id} value={off.name}>{off.name} ({off.role})</option>
                                    ))
                                  ) : (
                                    fallbackAdmins.map(off => (
                                      <option key={off._id} value={off.name}>{off.name} ({off.email})</option>
                                    ))
                                  )}
                                </select>
                              </div>

                              <div style={{ width: "110px" }}>
                                <label style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>Priority</label>
                                <select
                                  value={assignmentStates[item.complaintId]?.priority || item.priority || "Medium"}
                                  onChange={e => updateAssignmentState(item.complaintId, "priority", e.target.value)}
                                  style={{ width: "100%", padding: "7px 8px", borderRadius: "4px", backgroundColor: "rgba(0,0,0,0.3)", border: "1px solid var(--border-light)", color: "var(--text-primary)", fontSize: "12px" }}
                                >
                                  <option value="Emergency">Emergency</option>
                                  <option value="High">High</option>
                                  <option value="Medium">Medium</option>
                                  <option value="Low">Low</option>
                                </select>
                              </div>

                              <div style={{ width: "130px" }}>
                                <label style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>Due Date</label>
                                <input
                                  type="date"
                                  value={assignmentStates[item.complaintId]?.dueDate || ""}
                                  onChange={e => updateAssignmentState(item.complaintId, "dueDate", e.target.value)}
                                  style={{ width: "100%", padding: "6px 8px", borderRadius: "4px", backgroundColor: "rgba(0,0,0,0.3)", border: "1px solid var(--border-light)", color: "var(--text-primary)", fontSize: "12px" }}
                                />
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  const state = assignmentStates[item.complaintId];
                                  if (!state?.officer) { alert("Please select an officer."); return; }
                                  handleAssignOfficer(item.complaintId, state.officer, state.priority || item.priority, state.dueDate);
                                }}
                                style={{
                                  backgroundColor: "var(--color-primary)",
                                  color: "#fff",
                                  border: "none",
                                  padding: "8px 16px",
                                  borderRadius: "4px",
                                  fontWeight: "600",
                                  cursor: "pointer",
                                  fontSize: "12px",
                                  height: "32px",
                                  alignSelf: "flex-end"
                                }}
                              >
                                Assign
                              </button>
                            </div>
                          )}

                          {/* Resolution Reply Display if resolved */}
                          {isResolved && item.reply && (
                            <div style={{ marginTop: "10px", padding: "10px 12px", backgroundColor: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "6px", fontSize: "12px" }}>
                              <span style={{ fontWeight: "700", color: "var(--color-completed)" }}>✅ Official Resolution Reply:</span>
                              <p style={{ margin: "4px 0 0 0", color: "var(--text-primary)" }}>{item.reply}</p>
                            </div>
                          )}

                          {/* Resolution Action Row (for completing assigned work) */}
                          {!isResolved && (
                            <div style={{ marginTop: "12px", paddingTop: "10px", borderTop: "1px dashed var(--border-light)", display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "flex-end" }}>
                              <div style={{ flex: "1", minWidth: "200px" }}>
                                <label style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>Resolution Note / Completion Report</label>
                                <input
                                  type="text"
                                  placeholder="e.g. Pipeline repaired, water restored successfully."
                                  value={assignmentStates[item.complaintId]?.reply || ""}
                                  onChange={e => updateAssignmentState(item.complaintId, "reply", e.target.value)}
                                  style={{ width: "100%", padding: "6px 10px", borderRadius: "4px", backgroundColor: "rgba(0,0,0,0.3)", border: "1px solid var(--border-light)", color: "var(--text-primary)", fontSize: "12px" }}
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const replyText = assignmentStates[item.complaintId]?.reply || "Work completed and issue resolved by department officer.";
                                  handleCompleteWork(item.complaintId, "Completed", replyText);
                                }}
                                style={{
                                  backgroundColor: "var(--color-completed)",
                                  color: "#fff",
                                  border: "none",
                                  padding: "8px 16px",
                                  borderRadius: "4px",
                                  fontWeight: "700",
                                  cursor: "pointer",
                                  fontSize: "12px",
                                  height: "32px"
                                }}
                              >
                                ✅ Mark Work Completed
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

          </div>
        </div>
      )}

      {/* --------------------- VIEW 2: ROSTER DIRECTORY TABLE --------------------- */}
      {subTab === "departments" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "30px", alignItems: "flex-start", marginBottom: "40px" }}>
          {/* Dept CRUD Table */}
          <div style={{
            backgroundColor: "var(--bg-glass)",
            padding: "30px",
            borderRadius: "10px",
            border: "1px solid var(--border-light)",
            boxShadow: "var(--shadow-sm)"
          }}>
            <h3 style={{ marginBottom: "10px", fontWeight: "700", fontSize: "18px", color: "var(--text-primary)" }}>🗂️ Roster Directory</h3>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "20px" }}>
              Official registry of smart city departments, operational managers, and locations.
            </p>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--border-light)", backgroundColor: "rgba(255,255,255,0.02)" }}>
                    <th style={{ textAlign: "left", padding: "12px 10px", fontSize: "12px", color: "var(--text-secondary)", fontWeight: "700" }}>Dept ID</th>
                    <th style={{ textAlign: "left", padding: "12px 10px", fontSize: "12px", color: "var(--text-secondary)", fontWeight: "700" }}>Name</th>
                    <th style={{ textAlign: "left", padding: "12px 10px", fontSize: "12px", color: "var(--text-secondary)", fontWeight: "700" }}>Head Officer</th>
                    <th style={{ textAlign: "left", padding: "12px 10px", fontSize: "12px", color: "var(--text-secondary)", fontWeight: "700" }}>Working Hours</th>
                    <th style={{ textAlign: "left", padding: "12px 10px", fontSize: "12px", color: "var(--text-secondary)", fontWeight: "700" }}>SLA</th>
                    <th style={{ textAlign: "left", padding: "12px 10px", fontSize: "12px", color: "var(--text-secondary)", fontWeight: "700" }}>Status</th>
                    <th style={{ textAlign: "left", padding: "12px 10px", fontSize: "12px", color: "var(--text-secondary)", fontWeight: "700" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {departments.map((dept) => {
                    const isDeptActive = dept.status === "Active";
                    return (
                      <tr key={dept._id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                        <td style={{ fontWeight: "700", color: "var(--color-primary)", padding: "12px 10px", fontSize: "13px" }}>{dept.departmentId}</td>
                        <td style={{ fontWeight: "700", color: "var(--text-primary)", padding: "12px 10px", fontSize: "13px" }}>{dept.departmentName}</td>
                        <td style={{ padding: "12px 10px", fontSize: "13px", color: "var(--text-secondary)" }}>{dept.headOfficer}</td>
                        <td style={{ padding: "12px 10px", fontSize: "12px", color: "var(--text-secondary)" }}>{dept.workingHours}</td>
                        <td style={{ padding: "12px 10px", fontSize: "12px", color: "var(--text-secondary)", fontWeight: "600" }}>{dept.sla}</td>
                        <td style={{ padding: "12px 10px" }}>
                          <span style={{
                            padding: "2px 6px",
                            fontSize: "11px",
                            fontWeight: "700",
                            borderRadius: "4px",
                            backgroundColor: isDeptActive ? "var(--color-completed-bg)" : "var(--color-pending-bg)",
                            color: isDeptActive ? "var(--color-completed)" : "var(--color-pending)"
                          }}>
                            {dept.status || "Active"}
                          </span>
                        </td>
                        <td style={{ padding: "12px 10px" }}>
                          {user?.role === "superadmin" ? (
                            <div style={{ display: "flex", gap: "6px" }}>
                              <button
                                type="button"
                                onClick={() => handleEditDept(dept)}
                                style={{
                                  padding: "4px 8px",
                                  fontSize: "11px",
                                  backgroundColor: "transparent",
                                  color: "var(--color-primary)",
                                  border: "1px solid var(--border-accent)",
                                  borderRadius: "4px",
                                  cursor: "pointer"
                                }}
                              >
                                ✏️ Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteDept(dept._id, dept.departmentName)}
                                style={{
                                  padding: "4px 8px",
                                  fontSize: "11px",
                                  backgroundColor: "rgba(239, 68, 68, 0.15)",
                                  color: "#fca5a5",
                                  border: "1px solid rgba(239, 68, 68, 0.3)",
                                  borderRadius: "4px",
                                  cursor: "pointer"
                                }}
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          ) : (
                            <span style={{ fontSize: "12px", color: "var(--text-muted)", fontStyle: "italic" }}>Read-Only</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add / Edit Dept Form */}
          {user?.role === "superadmin" && (
            <div style={{
              backgroundColor: "var(--bg-secondary)",
              padding: "24px 30px",
              borderRadius: "10px",
              border: "1px solid var(--border-light)"
            }}>
              <h4 style={{ margin: 0, fontWeight: "700", fontSize: "16px", color: "var(--text-primary)" }}>{isEditingDept ? "✏️ Edit Department" : "➕ Add Department"}</h4>
              <form onSubmit={handleSaveDept} style={{ marginTop: "15px" }}>
                <div style={{ marginBottom: "12px" }}>
                  <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-secondary)" }}>Department ID (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. DEPT-WAT-01 (or leave blank to auto-generate)"
                    value={deptForm.departmentId}
                    onChange={(e) => setDeptForm({ ...deptForm, departmentId: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      border: "1px solid var(--border-light)",
                      marginTop: "4px",
                      backgroundColor: "rgba(0,0,0,0.2)",
                      color: "var(--text-primary)",
                      fontSize: "13px"
                    }}
                  />
                </div>

                <div style={{ marginBottom: "12px" }}>
                  <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-secondary)" }}>Department Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Water Supply Department"
                    value={deptForm.departmentName}
                    onChange={(e) => setDeptForm({ ...deptForm, departmentName: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      border: "1px solid var(--border-light)",
                      marginTop: "4px",
                      backgroundColor: "rgba(0,0,0,0.2)",
                      color: "var(--text-primary)",
                      fontSize: "13px"
                    }}
                    required
                  />
                </div>

                <div style={{ marginBottom: "12px" }}>
                  <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-secondary)" }}>Head Officer</label>
                  <input
                    type="text"
                    placeholder="e.g. Assistant Engineer"
                    value={deptForm.headOfficer}
                    onChange={(e) => setDeptForm({ ...deptForm, headOfficer: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      border: "1px solid var(--border-light)",
                      marginTop: "4px",
                      backgroundColor: "rgba(0,0,0,0.2)",
                      color: "var(--text-primary)",
                      fontSize: "13px"
                    }}
                    required
                  />
                </div>

                <div style={{ marginBottom: "12px" }}>
                  <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-secondary)" }}>Contact Details (Phone/Email/Office)</label>
                  <textarea
                    placeholder="e.g. Phone: +91..., Location: ..."
                    value={deptForm.contact}
                    onChange={(e) => setDeptForm({ ...deptForm, contact: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      border: "1px solid var(--border-light)",
                      marginTop: "4px",
                      backgroundColor: "rgba(0,0,0,0.2)",
                      color: "var(--text-primary)",
                      fontSize: "13px",
                      minHeight: "60px"
                    }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
                  <div>
                    <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-secondary)" }}>Working Hours</label>
                    <input
                      type="text"
                      value={deptForm.workingHours}
                      onChange={(e) => setDeptForm({ ...deptForm, workingHours: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        borderRadius: "6px",
                        border: "1px solid var(--border-light)",
                        marginTop: "4px",
                        backgroundColor: "rgba(0,0,0,0.2)",
                        color: "var(--text-primary)",
                        fontSize: "13px"
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-secondary)" }}>SLA Timeline</label>
                    <input
                      type="text"
                      value={deptForm.sla}
                      onChange={(e) => setDeptForm({ ...deptForm, sla: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        borderRadius: "6px",
                        border: "1px solid var(--border-light)",
                        marginTop: "4px",
                        backgroundColor: "rgba(0,0,0,0.2)",
                        color: "var(--text-primary)",
                        fontSize: "13px"
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-secondary)" }}>Status</label>
                  <select
                    value={deptForm.status}
                    onChange={(e) => setDeptForm({ ...deptForm, status: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      border: "1px solid var(--border-light)",
                      marginTop: "4px",
                      backgroundColor: "rgba(0,0,0,0.2)",
                      color: "var(--text-primary)",
                      fontSize: "13px"
                    }}
                  >
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Maintenance">Under Maintenance</option>
                  </select>
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button type="submit" style={{
                    flex: 1,
                    backgroundColor: "var(--color-primary)",
                    color: "#ffffff",
                    border: "none",
                    padding: "10px",
                    borderRadius: "6px",
                    fontWeight: "600",
                    cursor: "pointer"
                  }}>
                    {isEditingDept ? "Save Updates" : "Create Department"}
                  </button>
                  {isEditingDept && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingDept(false);
                        setDeptForm({
                          id: "",
                          departmentId: "",
                          departmentName: "",
                          headOfficer: "Assistant Engineer",
                          contact: "",
                          employees: 0,
                          salary: "",
                          workingHours: "9 AM - 5 PM",
                          sla: "48 Hours",
                          status: "Active"
                        });
                      }}
                      style={{
                        flex: 1,
                        backgroundColor: "transparent",
                        color: "var(--text-secondary)",
                        border: "1px solid var(--border-light)",
                        padding: "10px",
                        borderRadius: "6px",
                        fontWeight: "600",
                        cursor: "pointer"
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* --------------------- VIEW 3: EMPLOYEE ROSTER --------------------- */}
      {subTab === "employees" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "30px", alignItems: "flex-start", marginBottom: "40px" }}>
          {/* Employee Directory */}
          <div style={{
            backgroundColor: "var(--bg-glass)",
            padding: "30px",
            borderRadius: "10px",
            border: "1px solid var(--border-light)",
            boxShadow: "var(--shadow-sm)"
          }}>
            <h3 style={{ marginBottom: "10px", fontWeight: "700", fontSize: "18px", color: "var(--text-primary)" }}>👥 Department Staff Dashboard</h3>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "20px" }}>
              Review employees, shifts, performance indexes, and availability states.
            </p>

            {/* Staff Dashboard Counters */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "15px", marginBottom: "25px" }}>
              {[
                { label: "Total Employees", val: employees.length, bg: "rgba(255, 255, 255, 0.02)", border: "var(--border-light)", txt: "var(--text-primary)" },
                { label: "Available Staff", val: employees.filter(e => e.availability === "Available").length, bg: "var(--color-completed-bg)", border: "rgba(16, 185, 129, 0.3)", txt: "var(--color-completed)" },
                { label: "Busy Staff", val: employees.filter(e => e.availability === "Busy").length, bg: "var(--color-pending-bg)", border: "rgba(245, 158, 11, 0.3)", txt: "var(--color-pending)" },
                { label: "On Leave Staff", val: employees.filter(e => e.availability === "On Leave").length, bg: "rgba(239, 68, 68, 0.15)", border: "rgba(239, 68, 68, 0.3)", txt: "#fca5a5" }
              ].map(stat => (
                <div key={stat.label} style={{
                  padding: "12px",
                  borderRadius: "8px",
                  backgroundColor: stat.bg,
                  border: `1px solid ${stat.border}`,
                  textAlign: "center"
                }}>
                  <span style={{ fontSize: "10px", color: stat.txt, display: "block", fontWeight: "600", textTransform: "uppercase" }}>{stat.label}</span>
                  <span style={{ fontSize: "20px", fontWeight: "800", color: stat.txt, marginTop: "4px", display: "block" }}>{stat.val}</span>
                </div>
              ))}
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--border-light)", backgroundColor: "rgba(255,255,255,0.02)" }}>
                    <th style={{ textAlign: "left", padding: "12px 10px", fontSize: "12px", color: "var(--text-secondary)", fontWeight: "700" }}>Emp ID</th>
                    <th style={{ textAlign: "left", padding: "12px 10px", fontSize: "12px", color: "var(--text-secondary)", fontWeight: "700" }}>Name</th>
                    <th style={{ textAlign: "left", padding: "12px 10px", fontSize: "12px", color: "var(--text-secondary)", fontWeight: "700" }}>Department</th>
                    <th style={{ textAlign: "left", padding: "12px 10px", fontSize: "12px", color: "var(--text-secondary)", fontWeight: "700" }}>Role</th>
                    <th style={{ textAlign: "left", padding: "12px 10px", fontSize: "12px", color: "var(--text-secondary)", fontWeight: "700" }}>Shift</th>
                    <th style={{ textAlign: "left", padding: "12px 10px", fontSize: "12px", color: "var(--text-secondary)", fontWeight: "700" }}>Availability</th>
                    <th style={{ textAlign: "left", padding: "12px 10px", fontSize: "12px", color: "var(--text-secondary)", fontWeight: "700" }}>Performance</th>
                    <th style={{ textAlign: "left", padding: "12px 10px", fontSize: "12px", color: "var(--text-secondary)", fontWeight: "700" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map(emp => {
                    const isAvailable = emp.availability === "Available";
                    const isBusy = emp.availability === "Busy";
                    return (
                      <tr key={emp._id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                        <td style={{ fontWeight: "700", color: "var(--color-primary)", padding: "12px 10px", fontSize: "13px" }}>{emp.employeeId}</td>
                        <td style={{ padding: "12px 10px", fontSize: "13px", fontWeight: "700", color: "var(--text-primary)" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <img 
                              src={emp.contactImage || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(emp.name)}`} 
                              alt={emp.name} 
                              style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover", backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid var(--border-light)" }}
                            />
                            <div>
                              <div style={{ fontWeight: "700" }}>{emp.name}</div>
                              {emp.contactDetails && (
                                <div style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: "400", marginTop: "2px" }}>
                                  📞 {emp.contactDetails}
                                </div>
                              )}
                              {emp.address && (
                                <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "400" }}>
                                  📍 {emp.address}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "12px 10px", fontSize: "13px", color: "var(--text-secondary)" }}>{emp.department}</td>
                        <td style={{ padding: "12px 10px", fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)" }}>{emp.role}</td>
                        <td style={{ padding: "12px 10px", fontSize: "12px", color: "var(--text-secondary)" }}>{emp.shift}</td>
                        <td style={{ padding: "12px 10px" }}>
                          <span style={{
                            padding: "2px 6px",
                            fontSize: "11px",
                            fontWeight: "700",
                            borderRadius: "4px",
                            backgroundColor: isAvailable ? "var(--color-completed-bg)" : isBusy ? "var(--color-pending-bg)" : "rgba(239, 68, 68, 0.15)",
                            color: isAvailable ? "var(--color-completed)" : isBusy ? "var(--color-pending)" : "#fca5a5"
                          }}>
                            {emp.availability}
                          </span>
                        </td>
                        <td style={{ padding: "12px 10px" }}>
                          <span style={{ color: "#eab308", letterSpacing: "1px", fontSize: "12px" }}>
                            {"★".repeat(emp.performance)}
                          </span>
                        </td>
                        <td style={{ padding: "12px 10px" }}>
                          <div style={{ display: "flex", gap: "6px" }}>
                            <button
                              type="button"
                              onClick={() => handleEditEmployee(emp)}
                              style={{
                                padding: "4px 8px",
                                fontSize: "11px",
                                backgroundColor: "transparent",
                                color: "var(--color-primary)",
                                border: "1px solid var(--border-accent)",
                                borderRadius: "4px",
                                cursor: "pointer"
                              }}
                            >
                              ✏️ Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteEmployee(emp._id, emp.name)}
                              style={{
                                padding: "4px 8px",
                                fontSize: "11px",
                                backgroundColor: "rgba(239, 68, 68, 0.15)",
                                color: "#fca5a5",
                                border: "1px solid rgba(239, 68, 68, 0.3)",
                                borderRadius: "4px",
                                cursor: "pointer"
                              }}
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add / Edit Employee Form */}
          <div style={{
            backgroundColor: "var(--bg-secondary)",
            padding: "24px 30px",
            borderRadius: "10px",
            border: "1px solid var(--border-light)"
          }}>
            <h4 style={{ margin: 0, fontWeight: "700", fontSize: "16px", color: "var(--text-primary)" }}>{isEditingEmployee ? "✏️ Edit Employee" : "➕ Add Employee"}</h4>
            <form onSubmit={handleSaveEmployee} style={{ marginTop: "15px" }}>
              <div style={{ marginBottom: "12px" }}>
                <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-secondary)" }}>Employee Name</label>
                <input
                  type="text"
                  placeholder="e.g. Raj Kumar"
                  value={employeeForm.name}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, name: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid var(--border-light)",
                    marginTop: "4px",
                    backgroundColor: "rgba(0,0,0,0.2)",
                    color: "var(--text-primary)",
                    fontSize: "13px"
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-secondary)" }}>Profile Photo URL</label>
                <input
                  type="text"
                  placeholder="e.g. https://example.com/photo.jpg (Leave empty for auto initials)"
                  value={employeeForm.contactImage}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, contactImage: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid var(--border-light)",
                    marginTop: "4px",
                    backgroundColor: "rgba(0,0,0,0.2)",
                    color: "var(--text-primary)",
                    fontSize: "13px"
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-secondary)" }}>Contact Info (Phone/Email)</label>
                  <input
                    type="text"
                    placeholder="e.g. +91 9876543210"
                    value={employeeForm.contactDetails}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, contactDetails: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      border: "1px solid var(--border-light)",
                      marginTop: "4px",
                      backgroundColor: "rgba(0,0,0,0.2)",
                      color: "var(--text-primary)",
                      fontSize: "13px"
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-secondary)" }}>Office Address / Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Floor 2, Block C"
                    value={employeeForm.address}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, address: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      border: "1px solid var(--border-light)",
                      marginTop: "4px",
                      backgroundColor: "rgba(0,0,0,0.2)",
                      color: "var(--text-primary)",
                      fontSize: "13px"
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-secondary)" }}>Assigned Department</label>
                <select
                  value={employeeForm.department}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, department: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid var(--border-light)",
                    marginTop: "4px",
                    backgroundColor: "rgba(0,0,0,0.2)",
                    color: "var(--text-primary)",
                    fontSize: "13px"
                  }}
                >
                  {departments.map(d => (
                    <option key={d._id} value={d.departmentName}>{d.departmentName}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-secondary)" }}>Role / Designation</label>
                <select
                  value={employeeForm.role}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, role: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid var(--border-light)",
                    marginTop: "4px",
                    backgroundColor: "rgba(0,0,0,0.2)",
                    color: "var(--text-primary)",
                    fontSize: "13px"
                  }}
                >
                  <option value="Department Head">Department Head</option>
                  <option value="Engineer">Engineer</option>
                  <option value="Officer">Officer</option>
                  <option value="Technician">Technician</option>
                  <option value="Field Worker">Field Worker</option>
                  <option value="Supervisor">Supervisor</option>
                  <option value="Data Entry Operator">Data Entry Operator</option>
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-secondary)" }}>Salary (₹)</label>
                  <input
                    type="number"
                    value={employeeForm.salary}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, salary: parseInt(e.target.value) || 0 })}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      border: "1px solid var(--border-light)",
                      marginTop: "4px",
                      backgroundColor: "rgba(0,0,0,0.2)",
                      color: "var(--text-primary)",
                      fontSize: "13px"
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-secondary)" }}>Shift Timing</label>
                  <input
                    type="text"
                    value={employeeForm.shift}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, shift: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      border: "1px solid var(--border-light)",
                      marginTop: "4px",
                      backgroundColor: "rgba(0,0,0,0.2)",
                      color: "var(--text-primary)",
                      fontSize: "13px"
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "20px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-secondary)" }}>Availability</label>
                  <select
                    value={employeeForm.availability}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, availability: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      border: "1px solid var(--border-light)",
                      marginTop: "4px",
                      backgroundColor: "rgba(0,0,0,0.2)",
                      color: "var(--text-primary)",
                      fontSize: "13px"
                    }}
                  >
                    <option value="Available">Available</option>
                    <option value="Busy">Busy</option>
                    <option value="On Leave">On Leave</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-secondary)" }}>Performance</label>
                  <select
                    value={employeeForm.performance}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, performance: parseInt(e.target.value) })}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      border: "1px solid var(--border-light)",
                      marginTop: "4px",
                      backgroundColor: "rgba(0,0,0,0.2)",
                      color: "var(--text-primary)",
                      fontSize: "13px"
                    }}
                  >
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="2">2 Stars</option>
                    <option value="1">1 Star</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button type="submit" style={{
                  flex: 1,
                  backgroundColor: "var(--color-primary)",
                  color: "#ffffff",
                  border: "none",
                  padding: "10px",
                  borderRadius: "6px",
                  fontWeight: "600",
                  cursor: "pointer"
                }}>
                  {isEditingEmployee ? "Save Updates" : "Add Employee"}
                </button>
                {isEditingEmployee && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingEmployee(false);
                      setEmployeeForm({
                        id: "",
                        name: "",
                        department: departments[0]?.departmentName || "",
                        role: "Technician",
                        salary: 25000,
                        shift: "9 AM - 5 PM",
                        availability: "Available",
                        performance: 5
                      });
                    }}
                    style={{
                      flex: 1,
                      backgroundColor: "transparent",
                      color: "var(--text-secondary)",
                      border: "1px solid var(--border-light)",
                      padding: "10px",
                      borderRadius: "6px",
                      fontWeight: "600",
                      cursor: "pointer"
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --------------------- VIEW 4: SLA & DISPATCH --------------------- */}
      {subTab === "sla" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px", marginBottom: "40px" }}>
          {/* SLA Threshold Monitor */}
          <div style={{
            backgroundColor: "var(--bg-glass)",
            padding: "30px",
            borderRadius: "10px",
            border: "1px solid var(--border-light)",
            boxShadow: "var(--shadow-sm)"
          }}>
            <h3 style={{ marginBottom: "15px", fontWeight: "700", fontSize: "18px", color: "var(--text-primary)" }}>⏱️ SLA Monitoring Grid</h3>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "20px" }}>
              Authoritative targets for Smart City grievance Redressal response periods.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {slaPolicies.map(policy => (
                <div key={policy.type} style={{
                  padding: "16px",
                  borderRadius: "8px",
                  backgroundColor: "var(--bg-secondary)",
                  border: "1px solid var(--border-light)"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <span style={{ fontWeight: "800", color: policy.type === "Emergency" ? "#fca5a5" : policy.type === "High Priority" ? "#60a5fa" : "var(--text-primary)" }}>
                      {policy.type} SLA
                    </span>
                    <span style={{ fontSize: "11px", padding: "2px 8px", backgroundColor: "rgba(239, 68, 68, 0.15)", color: "#fca5a5", borderRadius: "4px", fontWeight: "700" }}>
                      ⚠️ {policy.overdueCount} Overdue
                    </span>
                  </div>
                  <div style={{ fontSize: "13px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", color: "var(--text-secondary)", marginBottom: "8px" }}>
                    <div>⏱️ <strong>Response Target:</strong> {policy.responseTime}</div>
                    <div>🛠️ <strong>Resolution Target:</strong> {policy.resolutionTime}</div>
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                    💡 <strong>Examples:</strong> {policy.examples}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Roster Assignment Panel */}
          <div style={{
            backgroundColor: "var(--bg-glass)",
            padding: "30px",
            borderRadius: "10px",
            border: "1px solid var(--border-light)",
            boxShadow: "var(--shadow-sm)"
          }}>
            <h3 style={{ marginBottom: "15px", fontWeight: "700", fontSize: "18px", color: "var(--text-primary)" }}>📋 Department Dispatch Assignment</h3>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "20px" }}>
              Assign grievances to specific departments and officers under SLA rules.
            </p>

            <form onSubmit={handleDispatchComplaint}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "12px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-secondary)" }}>Complaint ID</label>
                  <input
                    type="text"
                    placeholder="e.g. GRV89201"
                    value={dispatchForm.complaintId}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, complaintId: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      border: "1px solid var(--border-light)",
                      marginTop: "4px",
                      backgroundColor: "rgba(0,0,0,0.2)",
                      color: "var(--text-primary)",
                      fontSize: "13px"
                    }}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-secondary)" }}>Citizen Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Gopinath"
                    value={dispatchForm.citizenName}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, citizenName: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      border: "1px solid var(--border-light)",
                      marginTop: "4px",
                      backgroundColor: "rgba(0,0,0,0.2)",
                      color: "var(--text-primary)",
                      fontSize: "13px"
                    }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "12px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-secondary)" }}>Complaint Type</label>
                  <input
                    type="text"
                    placeholder="e.g. Water Leakage"
                    value={dispatchForm.complaintType}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, complaintType: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      border: "1px solid var(--border-light)",
                      marginTop: "4px",
                      backgroundColor: "rgba(0,0,0,0.2)",
                      color: "var(--text-primary)",
                      fontSize: "13px"
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-secondary)" }}>Priority</label>
                  <select
                    value={dispatchForm.priority}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, priority: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      border: "1px solid var(--border-light)",
                      marginTop: "4px",
                      backgroundColor: "rgba(0,0,0,0.2)",
                      color: "var(--text-primary)",
                      fontSize: "13px"
                    }}
                  >
                    <option value="Emergency">Emergency</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "20px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-secondary)" }}>Target Department</label>
                  <select
                    value={dispatchForm.department}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, department: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      border: "1px solid var(--border-light)",
                      marginTop: "4px",
                      backgroundColor: "rgba(0,0,0,0.2)",
                      color: "var(--text-primary)",
                      fontSize: "13px"
                    }}
                  >
                    {departments.map(d => (
                      <option key={d._id} value={d.departmentName}>{d.departmentName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-secondary)" }}>Assigned Officer</label>
                  <select
                    value={dispatchForm.assignedOfficer}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, assignedOfficer: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      border: "1px solid var(--border-light)",
                      marginTop: "4px",
                      backgroundColor: "rgba(0,0,0,0.2)",
                      color: "var(--text-primary)",
                      fontSize: "13px"
                    }}
                  >
                    <option value="">-- Assign to Department Only (Unassigned) --</option>
                    {employees.filter(emp => 
                      emp.department && 
                      dispatchForm.department && 
                      emp.department.trim().toLowerCase() === dispatchForm.department.trim().toLowerCase()
                    ).map(emp => (
                      <option key={emp._id} value={emp.name}>{emp.name} ({emp.role})</option>
                    ))}
                  </select>
                </div>
              </div>

              <button type="submit" style={{
                width: "100%",
                backgroundColor: "var(--color-primary)",
                color: "#ffffff",
                border: "none",
                padding: "12px",
                borderRadius: "6px",
                fontWeight: "600",
                cursor: "pointer"
              }}>Dispatch Complaint to Department</button>
            </form>

            <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid var(--border-light)" }}>
              <h4 style={{ fontSize: "14px", color: "var(--color-primary)", marginBottom: "10px", fontWeight: "700" }}>Dispatched Department Queue</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "150px", overflowY: "auto" }}>
                {deptComplaints.map(dc => (
                  <div key={dc._id} style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "12px",
                    padding: "8px 12px",
                    backgroundColor: "var(--bg-secondary)",
                    border: "1px solid var(--border-light)",
                    borderRadius: "6px"
                  }}>
                    <span style={{ color: "var(--text-secondary)" }}><strong>{dc.complaintId}</strong> - {dc.citizenName} ({dc.department})</span>
                    <span style={{
                      padding: "2px 6px",
                      fontSize: "10px",
                      fontWeight: "700",
                      borderRadius: "4px",
                      backgroundColor: "var(--color-completed-bg)",
                      color: "var(--color-completed)"
                    }}>{dc.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --------------------- VIEW 5: AI ANALYTICS --------------------- */}
      {subTab === "analytics" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px", marginBottom: "40px" }}>
          {/* AI Auto-Router Sandbox */}
          <div style={{
            backgroundColor: "var(--bg-glass)",
            padding: "30px",
            borderRadius: "10px",
            border: "1px solid var(--border-light)",
            boxShadow: "var(--shadow-sm)"
          }}>
            <h3 style={{ display: "flex", alignItems: "center", gap: "10px", margin: "0 0 15px 0", fontWeight: "700", fontSize: "18px", color: "var(--text-primary)" }}>
              🤖 AI Complaint Router & Sandbox
            </h3>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "20px" }}>
              Enter complaint descriptions to test predicted routing classification.
            </p>
            <form onSubmit={handleAIClassify}>
              <textarea
                placeholder="e.g. Street light is not working and sparking on wires..."
                value={aiInputText}
                onChange={(e) => setAiInputText(e.target.value)}
                style={{
                  width: "100%",
                  minHeight: "100px",
                  padding: "10px 14px",
                  borderRadius: "6px",
                  border: "1px solid var(--border-light)",
                  backgroundColor: "rgba(0,0,0,0.2)",
                  color: "var(--text-primary)",
                  fontSize: "14px",
                  marginBottom: "15px"
                }}
                required
              />
              <button type="submit" disabled={aiClassifying} style={{
                width: "100%",
                backgroundColor: "var(--color-primary)",
                color: "#ffffff",
                border: "none",
                padding: "10px",
                borderRadius: "6px",
                fontWeight: "600",
                cursor: "pointer"
              }}>
                {aiClassifying ? "AI Prediction Engine Running..." : "Classify Complaint"}
              </button>
            </form>

            {aiClassificationResult && (
              <div style={{
                marginTop: "20px",
                padding: "16px",
                borderRadius: "8px",
                backgroundColor: "var(--color-assigned-bg)",
                border: "1px solid var(--border-accent)"
              }}>
                <h4 style={{ margin: "0 0 10px 0", color: "var(--color-assigned)", fontSize: "14px", fontWeight: "700" }}>🎯 Prediction Result</h4>
                <div style={{ fontSize: "13px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", color: "var(--text-secondary)" }}>
                  <div>🏢 <strong>Department:</strong> {aiClassificationResult.department}</div>
                  <div>⚠️ <strong>Priority:</strong> {aiClassificationResult.priority}</div>
                  <div>📈 <strong>Confidence:</strong> {aiClassificationResult.confidence}</div>
                  <div>⏱️ <strong>SLA Limit:</strong> {aiClassificationResult.sla}</div>
                </div>
              </div>
            )}
          </div>

          {/* AI Workload Predictions & Suggestions */}
          <div style={{
            backgroundColor: "var(--bg-glass)",
            padding: "30px",
            borderRadius: "10px",
            border: "1px solid var(--border-light)",
            boxShadow: "var(--shadow-sm)"
          }}>
            <h3 style={{ margin: "0 0 15px 0", fontWeight: "700", fontSize: "18px", color: "var(--text-primary)" }}>📈 AI Workload Prediction & Officer Allocation</h3>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "20px" }}>
              Historical analytics suggest roster alterations based on incoming complaint velocities.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              <div style={{ padding: "12px 16px", backgroundColor: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "700", fontSize: "13px", marginBottom: "6px" }}>
                  <span style={{ color: "#fca5a5" }}>🚨 Water Supply Department (Critical Load)</span>
                  <span style={{ color: "#fca5a5" }}>
                    {complaints.filter(c => c.department === "Water Supply Department" && !["Completed", "Resolved"].includes(c.status)).length} Pending
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: "12px", color: "var(--text-secondary)" }}>
                  💡 <strong>AI Suggestion:</strong> Workload exceeds available employee capacity. Assign additional officer or mobilize field technician standby rosters.
                </p>
              </div>

              <div style={{ padding: "12px 16px", backgroundColor: "var(--color-assigned-bg)", border: "1px solid var(--border-accent)", borderRadius: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "700", fontSize: "13px", marginBottom: "6px" }}>
                  <span style={{ color: "var(--color-assigned)" }}>⚡ Electricity Department (High Load)</span>
                  <span style={{ color: "var(--color-assigned)" }}>
                    {complaints.filter(c => c.department === "Electricity Department" && !["Completed", "Resolved"].includes(c.status)).length} Pending
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: "12px", color: "var(--text-secondary)" }}>
                  💡 <strong>AI Suggestion:</strong> Approaching holiday cycle. Pre-allocate emergency standby linemen for rotational 24/7 support.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* --------------------- VIEW 6: ANTI-DELAY ENGINE --------------------- */}
      {subTab === "accountability" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
          {/* Header Panel */}
          <div style={{
            backgroundColor: "var(--bg-glass)",
            padding: "30px",
            borderRadius: "10px",
            border: "1px solid var(--border-light)",
            boxShadow: "var(--shadow-sm)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
              <span style={{ fontSize: "28px" }}>⚖️</span>
              <h3 style={{ margin: 0, fontWeight: "800", fontSize: "22px", color: "var(--text-primary)" }}>
                AI Public Accountability &amp; Anti-Delay Engine
              </h3>
            </div>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", margin: 0, lineHeight: "1.6" }}>
              Designed to solve citizen frustrations with government office delays. This engine monitors response SLA deadlines in real-time, promotes neglected grievances to public audit boards, bypasses red tape by auto-reassigning lazy officers, and generates honest status drafts for citizens.
            </p>
          </div>

          {/* Grid Layout for Metrics & Board */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "30px" }}>
            
            {/* Left Panel: Statistics & System Status */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{
                backgroundColor: "var(--bg-glass)",
                padding: "24px",
                borderRadius: "10px",
                border: "1px solid var(--border-light)"
              }}>
                <h4 style={{ margin: "0 0 16px 0", fontSize: "14px", fontWeight: "700", color: "var(--color-primary)", textTransform: "uppercase" }}>
                  Escalation Breakdown
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", backgroundColor: "rgba(239, 68, 68, 0.08)", borderRadius: "6px" }}>
                    <span style={{ fontSize: "12px", color: "#fca5a5", fontWeight: "600" }}>🚨 Level 3 (Ministerial Audit)</span>
                    <span style={{ fontSize: "14px", fontWeight: "800", color: "#ef4444" }}>3 Breaches</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", backgroundColor: "rgba(249, 115, 22, 0.08)", borderRadius: "6px" }}>
                    <span style={{ fontSize: "12px", color: "#fdba74", fontWeight: "600" }}>⚠️ Level 2 (Dept Head Warning)</span>
                    <span style={{ fontSize: "14px", fontWeight: "800", color: "var(--color-primary)" }}>1 Warning</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", backgroundColor: "rgba(59, 130, 246, 0.08)", borderRadius: "6px" }}>
                    <span style={{ fontSize: "12px", color: "#93c5fd", fontWeight: "600" }}>⏱️ Level 1 (Officer Ping)</span>
                    <span style={{ fontSize: "14px", fontWeight: "800", color: "#3b82f6" }}>0 Active</span>
                  </div>
                </div>
              </div>

              {/* Citizen Empowerment Tip */}
              <div style={{
                backgroundColor: "rgba(249, 115, 22, 0.05)",
                padding: "20px",
                borderRadius: "10px",
                border: "1px dashed var(--color-primary)",
                fontSize: "13px",
                lineHeight: "1.6",
                color: "var(--text-secondary)"
              }}>
                <strong>💡 How it empowers citizens:</strong><br />
                Middle-class citizens often face delays because files are lost under bureaucratic desks. By surfacing delayed tasks to the <strong>Ministerial Audit Level</strong>, officers are pressured to complete tasks or face automated system reassignment.
              </div>
            </div>

            {/* Right Panel: Delayed Grievances Board */}
            <div style={{
              backgroundColor: "var(--bg-glass)",
              padding: "30px",
              borderRadius: "10px",
              border: "1px solid var(--border-light)"
            }}>
              <h3 style={{ margin: "0 0 15px 0", fontWeight: "700", fontSize: "18px", color: "var(--text-primary)" }}>
                ⚖️ Government Delay Board (Audit View)
              </h3>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "20px" }}>
                Active grievances that have breached SLA response thresholds and are subject to immediate audit:
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {[
                  {
                    id: "GRV-IVR-4777",
                    citizen: "Gopinath",
                    type: "Severely Leaking Sewage",
                    dept: "Revenue Department",
                    officer: "Revenue Officer",
                    sla: "48 Hours",
                    elapsed: "54 Hours",
                    level: 3,
                    reason: "Awaiting material release approvals from municipal accounts bureau."
                  },
                  {
                    id: "GRV-IVR-5904",
                    citizen: "Anjali Devi",
                    type: "Garbage Pile Overflow",
                    dept: "Sanitation Department",
                    officer: "Sanitary Officer",
                    sla: "24 Hours",
                    elapsed: "29 Hours",
                    level: 2,
                    reason: "Cleaning truck broken down at Zone 4 depot."
                  },
                  {
                    id: "GRV-IVR-3321",
                    citizen: "Rajesh Kumar",
                    type: "Transformer Sparking",
                    dept: "Electricity Department",
                    officer: "Electrical Engineer",
                    sla: "12 Hours",
                    elapsed: "15 Hours",
                    level: 3,
                    reason: "Safety kit supply shortage in regional warehouse."
                  }
                ].map(complaint => (
                  <div key={complaint.id} style={{
                    padding: "20px",
                    borderRadius: "8px",
                    backgroundColor: "var(--bg-secondary)",
                    border: "1px solid var(--border-light)",
                    position: "relative"
                  }}>
                    {/* Escalation Level Badge */}
                    <div style={{
                      position: "absolute",
                      top: "20px",
                      right: "20px",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: "800",
                      backgroundColor: complaint.level === 3 ? "rgba(239, 68, 68, 0.15)" : "rgba(249, 115, 22, 0.15)",
                      color: complaint.level === 3 ? "#fca5a5" : "var(--color-primary)",
                      border: complaint.level === 3 ? "1px solid rgba(239, 68, 68, 0.3)" : "1px solid rgba(249, 115, 22, 0.3)"
                    }}>
                      Escalation Level {complaint.level}: {complaint.level === 3 ? "Minister Audit" : "Dept Warning"}
                    </div>

                    <div style={{ fontWeight: "700", fontSize: "15px", color: "var(--text-primary)", marginBottom: "4px" }}>
                      {complaint.id} — {complaint.type}
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "12px" }}>
                      Citizen: <strong>{complaint.citizen}</strong> | Department: <strong>{complaint.dept}</strong>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "12px", color: "var(--text-secondary)", marginBottom: "14px", borderTop: "1px solid var(--border-light)", paddingTop: "12px" }}>
                      <div>⏱️ <strong>SLA Deadline:</strong> {complaint.sla}</div>
                      <div>🚨 <strong>Time Elapsed:</strong> <span style={{ color: "#ef4444", fontWeight: "700" }}>{complaint.elapsed} ({parseInt(complaint.elapsed) - parseInt(complaint.sla)} hrs Overdue)</span></div>
                      <div>👤 <strong>Responsible Officer:</strong> {complaint.officer}</div>
                      <div>⚠️ <strong>Officer Delay Note:</strong> "{complaint.reason}"</div>
                    </div>

                    {/* Anti-Delay Actions */}
                    <div style={{ display: "flex", gap: "12px", marginTop: "14px" }}>
                      <button
                        onClick={async () => {
                          const deptEmps = employees.filter(
                            emp => emp.department && emp.department.toLowerCase() === complaint.dept.toLowerCase() && emp.name !== complaint.officer
                          );
                          if (deptEmps.length === 0) {
                            alert(`No other available officers in ${complaint.dept} to reassign to.`);
                            return;
                          }
                          const newOfficer = deptEmps[Math.floor(Math.random() * deptEmps.length)];
                          try {
                            await API.post("/admin/dept-complaints", {
                              complaintId: complaint.id,
                              department: complaint.dept,
                              assignedOfficer: newOfficer.name,
                              status: "In Progress"
                            });
                            alert(`⚖️ [Anti-Delay Engine] Bypassed bureaucracy! Reassigned complaint ${complaint.id} to "${newOfficer.name}" (${newOfficer.role}) due to officer delay.`);
                            loadData();
                          } catch (err) {
                            console.error(err);
                            alert("Failed to perform auto-reassignment.");
                          }
                        }}
                        style={{
                          flex: 1,
                          padding: "8px 12px",
                          fontSize: "12px",
                          fontWeight: "700",
                          backgroundColor: "var(--color-primary)",
                          color: "#ffffff",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer"
                        }}
                      >
                        🤖 Auto-Reassign Officer (Bypass Red Tape)
                      </button>
                      <button
                        onClick={() => {
                          const msg = `Dear ${complaint.citizen}, your grievance ${complaint.id} regarding "${complaint.type}" is being actively audited under Level ${complaint.level} Public SLA Breach. Current bottleneck: "${complaint.reason}". Action: The system has initiated officer performance audit review. We apologize for the delay.`;
                          alert(`💬 Draft transparency message to citizen:\n\n"${msg}"`);
                        }}
                        style={{
                          padding: "8px 16px",
                          fontSize: "12px",
                          fontWeight: "700",
                          backgroundColor: "rgba(255,255,255,0.06)",
                          color: "var(--text-primary)",
                          border: "1px solid var(--border-light)",
                          borderRadius: "6px",
                          cursor: "pointer"
                        }}
                      >
                        📢 Draft Citizen Update
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
