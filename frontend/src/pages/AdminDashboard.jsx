import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import API from "../api/api";
import Navbar from "../components/Navbar";
import DepartmentManager from "../components/DepartmentManager";

export default function AdminDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);

  // Officer Authentication fallback states
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const userStr = localStorage.getItem("user");
  const user = (userStr && userStr !== "undefined") ? JSON.parse(userStr) : null;
  const isOfficer = user && (user.role === "admin" || user.role === "superadmin");

  // Login/Register Forms States
  const [officerTab, setOfficerTab] = useState("login"); // "login" or "signup"
  const [registerRole, setRegisterRole] = useState("admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [adminSecret, setAdminSecret] = useState("");
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");

  const [resetForm, setResetForm] = useState({
    email: "",
    phone: "",
    newPassword: "",
    confirmPassword: ""
  });

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (resetForm.newPassword !== resetForm.confirmPassword) {
      setAuthError("Passwords do not match!");
      return;
    }
    try {
      setAuthError("");
      setAuthSuccess("");
      await API.post("/auth/forgot-password", {
        email: resetForm.email,
        phone: resetForm.phone,
        newPassword: resetForm.newPassword
      });
      setAuthSuccess("Password reset successfully! You can now log in.");
      setOfficerTab("login");
      setResetForm({ email: "", phone: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      console.error(err);
      setAuthError(err.response?.data?.message || "Failed to reset password.");
    }
  };

  // Forms states for Actions
  const [assignForm, setAssignForm] = useState({
    id: "",
    department: "Municipal Corporation",
    officer: "",
    priority: "Medium",
    dueDate: ""
  });
  const [statusForm, setStatusForm] = useState({
    id: "",
    status: "Processing",
    reply: "",
    clarificationQuestion: "",
    interimReply: ""
  });

  const [activeModal, setActiveModal] = useState(""); // "assign" or "status" or ""
  const [clustersList, setClustersList] = useState([]);
  const [loadingClusters, setLoadingClusters] = useState(false);

  // Search and Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("All");
  const [filterPriority, setFilterPriority] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const getSortIndicator = (field) => {
    if (sortField !== field) return "";
    return sortOrder === "asc" ? " ▲" : " ▼";
  };

  // Selection & Batch Assignment
  const [selectedIds, setSelectedIds] = useState([]);
  const [batchAssignForm, setBatchAssignForm] = useState({
    department: "Municipal Corporation",
    officer: "",
    priority: "Medium",
    dueDate: ""
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "dashboard";
  const [departmentsList, setDepartmentsList] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [newDeptName, setNewDeptName] = useState("");
  const [deptLoading, setDeptLoading] = useState(false);
  const [deptError, setDeptError] = useState("");

  const [usersList, setUsersList] = useState([]);
  const [systemStatus, setSystemStatus] = useState(null);
  const [usersLoading, setUsersLoading] = useState(false);
  const [systemLoading, setSystemLoading] = useState(false);

  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("All");
  const [selectedOfficer, setSelectedOfficer] = useState(null);
  const [officerForm, setOfficerForm] = useState({
    designation: "Officer",
    departments: [],
    salary: 0,
    officeLocation: "Main Office",
    status: "Active"
  });
  const [createOfficerForm, setCreateOfficerForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    designation: "Officer",
    departments: [],
    salary: 50000,
    officeLocation: "Main Office"
  });

  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    language: user?.language || "English"
  });
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: ""
  });
  const [auditLogs, setAuditLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);

  const loadDepartments = async () => {
    try {
      const res = await API.get("/admin/departments");
      const defaultDepts = [
        { _id: "wat", departmentId: "DEPT-WAT-01", departmentName: "Water Supply Department", headOfficer: "Assistant Engineer", contact: "Phone: +91 11 2345 6701 | Email: watersupply@smartcity.gov.in", employees: 26, salary: "₹25,000 - ₹80,000", workingHours: "9 AM - 5 PM", sla: "24 Hours", complaints: 12, performance: 4.5, status: "Active" },
        { _id: "ele", departmentId: "DEPT-ELE-02", departmentName: "Electricity Department", headOfficer: "Electrical Engineer", contact: "Phone: +91 11 2345 6702 | Email: electricity@smartcity.gov.in", employees: 39, salary: "₹26,000 - ₹85,000", workingHours: "Office: 9 AM - 5 PM", sla: "12 Hours", complaints: 18, performance: 4.2, status: "Active" },
        { _id: "rod", departmentId: "DEPT-ROD-03", departmentName: "Road and Transport Department", headOfficer: "Civil Engineer", contact: "Phone: +91 11 2345 6703 | Email: roadtransport@smartcity.gov.in", employees: 38, salary: "₹20,000 - ₹90,000", workingHours: "8 AM - 5 PM", sla: "7 Days", complaints: 9, performance: 4.0, status: "Active" },
        { _id: "san", departmentId: "DEPT-SAN-04", departmentName: "Sanitation Department", headOfficer: "Sanitary Officer", contact: "Phone: +91 11 2345 6704 | Email: sanitation@smartcity.gov.in", employees: 60, salary: "₹18,000 - ₹75,000", workingHours: "Morning Shift: 6 AM - 2 PM", sla: "24 Hours", complaints: 25, performance: 4.6, status: "Active" },
        { _id: "hea", departmentId: "DEPT-HEA-05", departmentName: "Health Department", headOfficer: "Medical Officer", contact: "Phone: +91 11 2345 6705 | Email: health@smartcity.gov.in", employees: 45, salary: "₹25,000 - ₹1,10,000", workingHours: "24/7 Operations", sla: "12 Hours", complaints: 15, performance: 4.8, status: "Active" },
        { _id: "rev", departmentId: "DEPT-REV-06", departmentName: "Revenue Department", headOfficer: "Revenue Officer", contact: "Phone: +91 11 2345 6706 | Email: revenue@smartcity.gov.in", employees: 20, salary: "₹22,000 - ₹95,000", workingHours: "10 AM - 5 PM", sla: "48 Hours", complaints: 6, performance: 4.4, status: "Active" }
      ];
      const loaded = res.data || [];
      const existingNames = new Set(loaded.map(d => d.departmentName));
      const merged = [...loaded, ...defaultDepts.filter(d => !existingNames.has(d.departmentName))];
      setDepartmentsList(merged);
    } catch (err) {
      console.error("Failed to load departments", err);
    }
  };

  const handleAddDepartment = async (e) => {
    e.preventDefault();
    if (!newDeptName.trim()) return;
    try {
      setDeptLoading(true);
      setDeptError("");
      await API.post("/admin/departments", { departmentName: newDeptName.trim() });
      setNewDeptName("");
      alert("Department added successfully");
      loadDepartments();
    } catch (err) {
      console.error(err);
      setDeptError(err.response?.data?.message || "Failed to add department");
    } finally {
      setDeptLoading(false);
    }
  };

  const handleEditDepartment = async (id, currentName) => {
    const newName = prompt("Edit Department Name:", currentName);
    if (!newName || !newName.trim() || newName.trim() === currentName) return;
    try {
      await API.put(`/admin/departments/${id}`, { departmentName: newName.trim() });
      alert("Department updated successfully");
      loadDepartments();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to edit department");
    }
  };

  const handleDeleteDepartment = async (id, name) => {
    if (!confirm(`Are you sure you want to delete the "${name}" department?`)) return;
    try {
      await API.delete(`/admin/departments/${id}`);
      alert("Department deleted successfully");
      loadDepartments();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to delete department");
    }
  };

  const loadAuditLogs = async () => {
    try {
      setLogsLoading(true);
      const res = await API.get("/admin/audit-logs");
      setAuditLogs(res.data);
    } catch (err) {
      console.error("Failed to load audit logs", err);
    } finally {
      setLogsLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await API.put("/auth/profile", profileForm);
      alert("Profile updated successfully!");
      localStorage.setItem("user", JSON.stringify(res.data.user));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to update profile.");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      alert("Passwords do not match!");
      return;
    }
    try {
      await API.put("/auth/change-password", {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword
      });
      alert("Password changed successfully!");
      setPasswordForm({ oldPassword: "", newPassword: "", confirmNewPassword: "" });
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to change password.");
    }
  };

  const loadAllComplaints = async () => {
    if (!token || !isOfficer) return;
    try {
      setLoading(true);
      const res = await API.get("/admin/complaints");
      setComplaints(res.data);
    } catch (err) {
      console.error("Failed to load admin complaints", err);
    } finally {
      setLoading(false);
    }
  };

  const loadAllUsers = async () => {
    if (!token || !isOfficer) return;
    try {
      setUsersLoading(true);
      const res = await API.get("/admin/users");
      setUsersList(res.data);
    } catch (err) {
      console.error("Failed to load users", err);
    } finally {
      setUsersLoading(false);
    }
  };

  const loadSystemStatus = async () => {
    if (!token || !isOfficer) return;
    try {
      setSystemLoading(true);
      const res = await API.get("/admin/system-status");
      setSystemStatus(res.data);
    } catch (err) {
      console.error("Failed to load system status", err);
    } finally {
      setSystemLoading(false);
    }
  };

  const handleToggleUserRole = async (targetUser) => {
    const newRole = targetUser.role === "admin" ? "citizen" : "admin";
    const confirmMsg = `Are you sure you want to change ${targetUser.name}'s role to ${newRole}?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      await API.put(`/admin/users/${targetUser._id}/role`, { role: newRole });
      alert("User role updated successfully");
      loadAllUsers();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to update user role");
    }
  };

  useEffect(() => {
    if (token && isOfficer) {
      loadDepartments();
      loadAllUsers(); // Load users so we can populate officer list immediately
      if (activeTab === "dashboard") {
        loadAllComplaints();
      } else if (activeTab === "users") {
        loadAllUsers();
      } else if (activeTab === "system") {
        loadSystemStatus();
        loadAuditLogs();
      } else if (activeTab === "clusters") {
        loadAllClusters();
      }
    }
  }, [token, activeTab]);

  const loadAllClusters = async () => {
    if (!token || !isOfficer) return;
    try {
      setLoadingClusters(true);
      const res = await API.get("/admin/clusters");
      setClustersList(res.data);
    } catch (err) {
      console.error("Failed to load clusters", err);
    } finally {
      setLoadingClusters(false);
    }
  };

  const handleOfficerLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setAuthError("Please fill in all fields");
      return;
    }
    try {
      setAuthError("");
      const res = await API.post("/auth/login", { email, password });
      if (res.data.user.role !== "admin" && res.data.user.role !== "superadmin") {
        setAuthError("Access Denied: Citizen account cannot log in here.");
        return;
      }
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setToken(res.data.token);
      setAuthSuccess("Login successful!");
      window.location.reload();
    } catch (err) {
      console.error(err);
      setAuthError(err.response?.data?.message || "Invalid credentials.");
    }
  };

  const handleOfficerRegister = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim() || !adminSecret.trim()) {
      setAuthError("Please fill in all fields");
      return;
    }
    try {
      setAuthError("");
      await API.post("/auth/register", {
        name,
        email,
        password,
        role: registerRole,
        adminSecret
      });
      setAuthSuccess("Officer registered successfully! You can now log in.");
      setOfficerTab("login");
      setEmail(email);
      setName("");
      setPassword("");
      setAdminSecret("");
    } catch (err) {
      console.error(err);
      setAuthError(err.response?.data?.message || (typeof err.response?.data === "string" ? err.response.data : "") || "Registration failed. Verify admin secret code.");
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    const officerName = assignForm.officer.trim() || "Awaiting Assignment";
    try {
      await API.put(`/admin/assign/${assignForm.id}`, {
        department: assignForm.department,
        officer: officerName,
        priority: assignForm.priority,
        dueDate: assignForm.dueDate || null
      });
      alert("Grievance assigned successfully");
      setActiveModal("");
      loadAllComplaints();
    } catch (err) {
      console.error(err);
      alert("Failed to assign grievance.");
    }
  };

  const handleBatchAssign = async (e) => {
    e.preventDefault();
    const officerName = batchAssignForm.officer.trim() || "Awaiting Assignment";
    try {
      await API.put("/admin/assign-batch", {
        ids: selectedIds,
        department: batchAssignForm.department,
        officer: officerName,
        priority: batchAssignForm.priority,
        dueDate: batchAssignForm.dueDate || null
      });
      alert("Selected grievances assigned successfully");
      setActiveModal("");
      setSelectedIds([]);
      loadAllComplaints();
    } catch (err) {
      console.error(err);
      alert("Failed to assign batch grievances.");
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/admin/status/${statusForm.id}`, {
        status: statusForm.status,
        reply: statusForm.reply,
        clarificationQuestion: statusForm.clarificationQuestion,
        interimReply: statusForm.interimReply
      });
      alert("Status updated successfully");
      setActiveModal("");
      loadAllComplaints();
      if (activeTab === "clusters") {
        loadAllClusters();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update status.");
    }
  };

  const handleSuggestResolution = async () => {
    try {
      setStatusForm(prev => ({ ...prev, reply: "AI Copilot is drafting a formal resolution..." }));
      const res = await API.post("/ai/suggest-resolution", { complaintId: statusForm.id });
      setStatusForm(prev => ({ ...prev, reply: res.data.suggestion }));
    } catch (err) {
      console.error("Failed to suggest resolution", err);
      alert("Failed to fetch recommendation from AI Resolution Copilot.");
      setStatusForm(prev => ({ ...prev, reply: "" }));
    }
  };

  const openAssignModal = (item) => {
    setAssignForm({
      id: item.complaintId,
      department: item.department === "Not Assigned" ? "Municipal Corporation" : item.department,
      officer: item.officer === "Not Assigned" ? "" : item.officer,
      priority: item.priority || "Medium",
      dueDate: item.dueDate ? new Date(item.dueDate).toISOString().split('T')[0] : ""
    });
    setActiveModal("assign");
  };

  const openStatusModal = (item) => {
    setStatusForm({
      id: item.complaintId,
      status: item.status,
      reply: item.reply || "",
      clarificationQuestion: item.clarificationQuestion || "",
      interimReply: item.interimReply || ""
    });
    setActiveModal("status");
  };

  const openOfficerEditor = (officer) => {
    setSelectedOfficer(officer);
    setOfficerForm({
      designation: officer.designation || "Officer",
      departments: officer.departments || [],
      salary: officer.salary || 0,
      officeLocation: officer.officeLocation || "Main Office",
      status: officer.status || "Active"
    });
    setActiveModal("officer-editor");
  };

  const handleUpdateOfficerProfile = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/admin/users/${selectedOfficer._id}/profile`, officerForm);
      alert("Officer profile updated successfully");
      setActiveModal("");
      loadAllUsers();
    } catch (err) {
      console.error(err);
      alert("Failed to update officer profile.");
    }
  };

  const handleCreateOfficer = async (e) => {
    e.preventDefault();
    try {
      await API.post("/admin/users/create-officer", createOfficerForm);
      alert("Officer created successfully!");
      setActiveModal("");
      setCreateOfficerForm({
        name: "",
        email: "",
        password: "",
        phone: "",
        designation: "Officer",
        departments: [],
        salary: 50000,
        officeLocation: "Main Office"
      });
      loadAllUsers();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to create officer profile.");
    }
  };

  // Helper for human-readable resolution duration
  const formatDuration = (ms) => {
    if (ms < 0 || isNaN(ms)) return "N/A";
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      const remSeconds = seconds % 60;
      return `${minutes}m ${remSeconds}s`;
    }
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      const remMinutes = minutes % 60;
      return `${hours}h ${remMinutes}m`;
    }
    const days = Math.floor(hours / 24);
    const remHours = hours % 24;
    return `${days}d ${remHours}h`;
  };

  // Helper for priority color-coded style
  const getPriorityStyle = (priority) => {
    const p = (priority || "").toLowerCase();
    if (p === "high") return { background: "rgba(239, 68, 68, 0.15)", color: "#fca5a5", border: "1px solid rgba(239, 68, 68, 0.3)" };
    if (p === "low") return { background: "rgba(59, 130, 246, 0.15)", color: "#93c5fd", border: "1px solid rgba(59, 130, 246, 0.3)" };
    return { background: "rgba(245, 158, 11, 0.15)", color: "#fde047", border: "1px solid rgba(245, 158, 11, 0.3)" };
  };

  // Filter complaints based on query and selections
  const filteredComplaints = complaints.filter((c) => {
    const matchesSearch =
      (c.complaintId || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.userId?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.userId?.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.department || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.status || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = filterDepartment === "All" || c.department === filterDepartment;
    const matchesPriority = filterPriority === "All" || (c.priority || "Medium").toLowerCase() === filterPriority.toLowerCase();
    const matchesStatus = filterStatus === "All" || (c.status || "Pending").toLowerCase() === filterStatus.toLowerCase();

    // Hide linked duplicate complaints from the main grid view (they appear nested under the parent)
    const isNotLinked = !c.parentComplaintId || c.parentComplaintId === "";

    return matchesSearch && matchesDept && matchesPriority && matchesStatus && isNotLinked;
  });

  // Sort the filtered complaints
  const sortedComplaints = [...filteredComplaints].sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];

    if (sortField === "citizenName") {
      valA = a.userId?.name || "";
      valB = b.userId?.name || "";
    }

    if (typeof valA === "string" && typeof valB === "string") {
      return sortOrder === "asc"
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    }

    if (sortField === "createdAt" || sortField === "updatedAt" || sortField === "dueDate") {
      const timeA = valA ? new Date(valA).getTime() : 0;
      const timeB = valB ? new Date(valB).getTime() : 0;
      return sortOrder === "asc" ? timeA - timeB : timeB - timeA;
    }

    valA = valA || 0;
    valB = valB || 0;
    return sortOrder === "asc" ? (valA > valB ? 1 : -1) : (valB > valA ? 1 : -1);
  });

  const feedbackComplaints = complaints.filter(c => c.feedbackRating !== undefined && c.feedbackRating !== null);

  // Filter users based on query and role selection
  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      (u.name || "").toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(userSearchQuery.toLowerCase());
    const matchesRole = userRoleFilter === "All" || u.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  const stats = {
    total: complaints.length,
    pending: 0,
    active: 0,
    completed: 0,
    rejected: 0,
    high: 0,
    medium: 0,
    low: 0,
    emergency: 0,
    today: 0,
    totalResolutionTimeMs: 0,
    resolvedCount: 0
  };

  complaints.forEach((item) => {
    // Status counts
    const s = (item.status || "").toLowerCase();
    if (s === "pending") {
      stats.pending++;
    } else if (s === "completed" || s === "solved" || s === "resolved") {
      stats.completed++;
      if (item.createdAt && item.updatedAt) {
        const timeDiff = new Date(item.updatedAt) - new Date(item.createdAt);
        if (timeDiff >= 0) {
          stats.totalResolutionTimeMs += timeDiff;
          stats.resolvedCount++;
        }
      }
    } else if (s === "rejected") {
      stats.rejected++;
    } else {
      stats.active++;
    }

    // Priority counts
    const p = (item.priority || "Medium").toLowerCase();
    if (p === "high") {
      stats.high++;
    } else if (p === "emergency") {
      stats.emergency++;
    } else if (p === "low") {
      stats.low++;
    } else {
      stats.medium++;
    }

    // Today's complaints
    const todayStr = new Date().toDateString();
    if (item.createdAt && new Date(item.createdAt).toDateString() === todayStr) {
      stats.today++;
    }
  });

  const avgResolutionTime = stats.resolvedCount > 0
    ? formatDuration(stats.totalResolutionTimeMs / stats.resolvedCount)
    : "N/A";

  const resolutionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  // Compute Analytics Data
  const deptCounts = {};
  let aiGeneratedCount = 0;
  let translatedCount = 0;
  const languageCounts = {};

  complaints.forEach((c) => {
    const dept = c.department || "General Administration";
    deptCounts[dept] = (deptCounts[dept] || 0) + 1;

    if (c.isAiGenerated) aiGeneratedCount++;
    if (c.translationStatus === "Translated") translatedCount++;
    if (c.language) {
      languageCounts[c.language] = (languageCounts[c.language] || 0) + 1;
    }
  });

  const depts = departmentsList.length > 0
    ? departmentsList.map(d => d.departmentName)
    : ["General Administration", "Electricity Board", "Municipal Corporation", "Food and Civil Supplies", "Water and Sanitation Board", "Public Works Department"];

  const maxVal = Math.max(...depts.map(d => deptCounts[d] || 0), 1);
  const aiPercentage = complaints.length > 0 ? Math.round((aiGeneratedCount / complaints.length) * 100) : 0;
  const translationPercentage = complaints.length > 0 ? Math.round((translatedCount / complaints.length) * 100) : 0;

  // Calculate Monthly Trends
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const last6Months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    last6Months.push({
      monthIndex: d.getMonth(),
      year: d.getFullYear(),
      name: `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`,
      count: 0
    });
  }

  complaints.forEach(c => {
    if (c.createdAt) {
      const cd = new Date(c.createdAt);
      const m = cd.getMonth();
      const y = cd.getFullYear();
      const match = last6Months.find(lm => lm.monthIndex === m && lm.year === y);
      if (match) {
        match.count++;
      }
    }
  });
  const maxTrendVal = Math.max(...last6Months.map(m => m.count), 1);
  const trendPoints = last6Months.map((m, index) => {
    const x = 50 + index * 95;
    const y = 170 - (m.count / maxTrendVal) * 130;
    return { x, y, count: m.count, name: m.name };
  });

  const trendPath = trendPoints.length > 0
    ? `M ${trendPoints[0].x} ${trendPoints[0].y} ` + trendPoints.slice(1).map(p => `L ${p.x} ${p.y}`).join(" ")
    : "";

  const trendArea = trendPoints.length > 0
    ? `${trendPath} L ${trendPoints[trendPoints.length - 1].x} 170 L ${trendPoints[0].x} 170 Z`
    : "";

  // Admin Alerts Feed (Live events from complaints updates)
  const adminAlerts = complaints
    .map(c => {
      const isNew = c.status === "Pending";
      const date = new Date(c.updatedAt || c.createdAt);
      let message = "";
      if (isNew) {
        message = `New Grievance ${c.complaintId} registered: "${c.title}" assigned to ${c.department}.`;
      } else {
        message = `Grievance ${c.complaintId} redressed status changed to "${c.status}" by officer ${c.officer || "Unassigned"}.`;
      }
      return {
        id: c._id + c.status + c.updatedAt,
        complaintId: c.complaintId,
        message,
        timestamp: date,
        status: c.status
      };
    })
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 10);

  // Officers Workload & Speed Analytics
  const officersPerformance = usersList
    .filter(u => u.role === "admin")
    .map(off => {
      const assignedComplaints = complaints.filter(c => c.officer && (c.officer.includes(off.name) || off.name.includes(c.officer)));
      const activeWorkload = assignedComplaints.filter(c => c.status !== "Completed" && c.status !== "Solved" && c.status !== "Resolved" && c.status !== "Rejected" && c.status !== "Closed").length;
      const resolvedComplaints = assignedComplaints.filter(c => c.status === "Completed" || c.status === "Solved" || c.status === "Resolved" || c.status === "Closed");
      
      let totalResolutionTime = 0;
      resolvedComplaints.forEach(c => {
        if (c.createdAt && c.updatedAt) {
          const diff = new Date(c.updatedAt) - new Date(c.createdAt);
          if (diff > 0) totalResolutionTime += diff;
        }
      });
      
      const avgSpeedMs = resolvedComplaints.length > 0 ? totalResolutionTime / resolvedComplaints.length : 0;
      const avgSpeed = avgSpeedMs > 0 ? formatDuration(avgSpeedMs) : "N/A";
      
      // Dynamic performance score calculation (1-5 stars)
      let rating = 0;
      if (resolvedComplaints.length > 0) {
        if (avgSpeedMs < 24 * 60 * 60 * 1000) rating = 5;
        else if (avgSpeedMs < 3 * 24 * 60 * 60 * 1000) rating = 4;
        else if (avgSpeedMs < 7 * 24 * 60 * 60 * 1000) rating = 3;
        else rating = 2;
      } else {
        rating = 3; // Baseline score
      }
      
      return {
        ...off,
        activeWorkload,
        resolvedCount: resolvedComplaints.length,
        avgSpeed,
        rating
      };
    });

  const getStatusClass = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "pending") return "status-badge pending";
    if (s === "assigned") return "status-badge assigned";
    if (s === "processing" || s === "in progress") return "status-badge processing";
    if (s === "completed" || s === "solved" || s === "resolved" || s === "closed") return "status-badge completed";
    if (s === "rejected") return "status-badge rejected";
    return "status-badge pending";
  };

  if (!token || !isOfficer) {
    return (
      <div>
        <Navbar />
        <div className="auth-wrapper" style={{ minHeight: "80vh", padding: "20px 0" }}>
          <div className="auth-card" style={{ maxWidth: "450px" }}>
            <div className="auth-header">
              <div className="auth-logo">LokSeva AI</div>
              <div className="auth-subtitle">Officer Administration Portal</div>
            </div>

            <div style={{ display: "flex", borderBottom: "1px solid var(--border-light)", marginBottom: "20px" }}>
              <button
                onClick={() => { setOfficerTab("login"); setAuthError(""); setAuthSuccess(""); }}
                style={{
                  flex: 1,
                  padding: "10px",
                  background: "transparent",
                  border: "none",
                  borderBottom: officerTab === "login" ? "2px solid var(--color-primary)" : "none",
                  color: officerTab === "login" ? "var(--text-primary)" : "var(--text-secondary)",
                  fontWeight: "700",
                  cursor: "pointer"
                }}
              >
                Officer Login
              </button>
              <button
                onClick={() => { setOfficerTab("signup"); setAuthError(""); setAuthSuccess(""); }}
                style={{
                  flex: 1,
                  padding: "10px",
                  background: "transparent",
                  border: "none",
                  borderBottom: officerTab === "signup" ? "2px solid var(--color-primary)" : "none",
                  color: officerTab === "signup" ? "var(--text-primary)" : "var(--text-secondary)",
                  fontWeight: "700",
                  cursor: "pointer"
                }}
              >
                Register
              </button>
              <button
                onClick={() => { setOfficerTab("forgot"); setAuthError(""); setAuthSuccess(""); }}
                style={{
                  flex: 1,
                  padding: "10px",
                  background: "transparent",
                  border: "none",
                  borderBottom: officerTab === "forgot" ? "2px solid var(--color-primary)" : "none",
                  color: officerTab === "forgot" ? "var(--text-primary)" : "var(--text-secondary)",
                  fontWeight: "700",
                  cursor: "pointer"
                }}
              >
                Forgot Password
              </button>
            </div>

            {authError && (
              <div style={{ padding: "10px 14px", backgroundColor: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", color: "#fca5a5", borderRadius: "8px", fontSize: "14px", marginBottom: "15px" }}>
                {authError}
              </div>
            )}

            {authSuccess && (
              <div style={{ padding: "10px 14px", backgroundColor: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.2)", color: "#a7f3d0", borderRadius: "8px", fontSize: "14px", marginBottom: "15px" }}>
                {authSuccess}
              </div>
            )}

            {officerTab === "login" ? (
              <form onSubmit={handleOfficerLogin}>
                <div style={{ marginBottom: "15px" }}>
                  <label style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-secondary)" }}>Officer Email</label>
                  <input
                    type="email"
                    placeholder="officer@service.gov.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ margin: "5px 0 0 0" }}
                    required
                  />
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <label style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-secondary)" }}>Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ margin: "5px 0 0 0" }}
                    required
                  />
                </div>

                <button type="submit" style={{ width: "100%" }}>
                  Login to Admin Console
                </button>
              </form>
            ) : officerTab === "signup" ? (
              <form onSubmit={handleOfficerRegister}>
                <div style={{ marginBottom: "12px" }}>
                  <label style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-secondary)" }}>Access Role</label>
                  <select
                    value={registerRole}
                    onChange={(e) => setRegisterRole(e.target.value)}
                    style={{ margin: "5px 0 0 0", width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--border-light)", backgroundColor: "var(--bg-secondary)", color: "var(--text-primary)" }}
                  >
                    <option value="admin">Department Admin (Officer)</option>
                    <option value="superadmin">Super Admin (Global)</option>
                  </select>
                </div>

                <div style={{ marginBottom: "12px" }}>
                  <label style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-secondary)" }}>Officer Name</label>
                  <input
                    type="text"
                    placeholder="Officer Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ margin: "5px 0 0 0" }}
                    required
                  />
                </div>

                <div style={{ marginBottom: "12px" }}>
                  <label style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-secondary)" }}>Email Address</label>
                  <input
                    type="email"
                    placeholder="name@service.gov.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ margin: "5px 0 0 0" }}
                    required
                  />
                </div>

                <div style={{ marginBottom: "12px" }}>
                  <label style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-secondary)" }}>Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ margin: "5px 0 0 0" }}
                    required
                  />
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <label style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-secondary)" }}>Admin Secret Key</label>
                  <input
                    type="password"
                    placeholder="Secret registration code"
                    value={adminSecret}
                    onChange={(e) => setAdminSecret(e.target.value)}
                    style={{ margin: "5px 0 0 0" }}
                    required
                  />
                </div>

                <button type="submit" style={{ width: "100%" }}>
                  Register Officer Profile
                </button>
              </form>
            ) : (
              <form onSubmit={handleForgotSubmit}>
                <div style={{ marginBottom: "15px" }}>
                  <label style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-secondary)" }}>Officer Email</label>
                  <input
                    type="email"
                    placeholder="officer@service.gov.in"
                    value={resetForm.email}
                    onChange={(e) => setResetForm({ ...resetForm, email: e.target.value })}
                    style={{ margin: "5px 0 0 0" }}
                    required
                  />
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <label style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-secondary)" }}>Registered Phone Number</label>
                  <input
                    type="text"
                    placeholder="e.g. +91 9876543210"
                    value={resetForm.phone}
                    onChange={(e) => setResetForm({ ...resetForm, phone: e.target.value })}
                    style={{ margin: "5px 0 0 0" }}
                    required
                  />
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <label style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-secondary)" }}>New Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={resetForm.newPassword}
                    onChange={(e) => setResetForm({ ...resetForm, newPassword: e.target.value })}
                    style={{ margin: "5px 0 0 0" }}
                    required
                  />
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <label style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-secondary)" }}>Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={resetForm.confirmPassword}
                    onChange={(e) => setResetForm({ ...resetForm, confirmPassword: e.target.value })}
                    style={{ margin: "5px 0 0 0" }}
                    required
                  />
                </div>

                <button type="submit" style={{ width: "100%" }}>
                  Reset Password
                </button>
              </form>
            )}

            <div className="auth-footer" style={{ borderTop: "1px solid var(--border-light)", paddingTop: "15px", marginTop: "24px" }}>
              Are you a citizen? <Link to="/" style={{ color: "var(--color-primary)" }}>Citizen Portal</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Print CSS Stylesheet */}
      <style>{`
        @media print {
          /* Hide non-printable elements */
          .no-print, navbar, header, footer, button, .btn-secondary, .auth-wrapper, .modal-overlay, select, textarea, td.no-print, th.no-print {
            display: none !important;
          }
          
          /* Show print-only elements */
          .print-only {
            display: block !important;
          }

          /* Force light background and dark text for print readability */
          body {
            background: #ffffff !important;
            color: #000000 !important;
            font-family: 'Inter', sans-serif !important;
            margin: 15mm 10mm 15mm 10mm !important;
          }
          
          .container {
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            background: transparent !important;
          }

          /* Card containers in print */
          .card {
            background: #ffffff !important;
            border: 1px solid #cbd5e1 !important;
            color: #000000 !important;
            box-shadow: none !important;
            margin-bottom: 20px !important;
            page-break-inside: avoid;
            padding: 15px !important;
          }

          /* Grid adjustments for print */
          .grid-3, .grid-2 {
            display: flex !important;
            flex-direction: row !important;
            gap: 15px !important;
          }
          
          .grid-3 > div, .grid-2 > div {
            flex: 1 !important;
          }

          /* Table modifications for clean printing */
          table {
            width: 100% !important;
            border-collapse: collapse !important;
            color: #000000 !important;
            margin-top: 15px !important;
          }
          
          th {
            background-color: #f1f5f9 !important;
            color: #0f172a !important;
            border-bottom: 2px solid #cbd5e1 !important;
            padding: 8px !important;
            font-size: 11px !important;
            text-align: left !important;
          }
          
          td {
            border-bottom: 1px solid #e2e8f0 !important;
            padding: 8px !important;
            color: #334155 !important;
            font-size: 11px !important;
          }
          
          tr {
            page-break-inside: avoid !important;
          }

          /* Text color adjustments */
          span, p, h1, h2, h3, h4, div {
            color: #000000 !important;
          }

          /* Re-style SVG and status indicators for print */
          svg {
            background: #f8fafc !important;
            border: 1px solid #cbd5e1 !important;
          }
          
          text {
            fill: #000000 !important;
          }

          .status-badge {
            background: transparent !important;
            border: 1px solid #000000 !important;
            color: #000000 !important;
            padding: 2px 4px !important;
            border-radius: 2px !important;
          }
          
          .priority-badge-print {
            border: 1px solid #666666 !important;
            color: #000000 !important;
            background: transparent !important;
            padding: 2px 4px !important;
            border-radius: 2px !important;
          }
        }
      `}</style>

      <div className="no-print">
        <Navbar />
      </div>

      <div className="container">
        {/* Printable Audit Report Header */}
        <div className="print-only" style={{ display: "none" }}>
          <div style={{ textAlign: "center", borderBottom: "2px solid #000000", paddingBottom: "20px", marginBottom: "30px" }}>
            <h1 style={{ margin: 0, fontSize: "28px", color: "#000000" }}>LOKSEVA AI GRIEVANCE REDRESSAL SYSTEM</h1>
            <h2 style={{ margin: "5px 0 0 0", fontSize: "18px", color: "#333333" }}>Official Executive Audit Report</h2>
            <p style={{ margin: "10px 0 0 0", fontSize: "12px", color: "#666666" }}>
              Generated on: {new Date().toLocaleString()} | Administrator Profile: {user?.name || "Official Admin"} ({user?.email || ""})
            </p>
          </div>
        </div>

        <div style={styles.header} className="no-print">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <h2>
                🛡️ {user?.role === "superadmin" 
                  ? "Super Admin Command Center" 
                  : `${user?.departments?.[0] || "Department"} Admin Portal`}
              </h2>
              <p style={{ margin: 0, color: "var(--text-secondary)" }}>
                {user?.role === "superadmin" 
                  ? "Review citizens grievances, manage departments globally, assign roles, and audit system performance."
                  : `Review and resolve grievances, manage officers, and audit performance specifically for ${user?.departments?.[0] || "your department"}.`}
              </p>
            </div>
            <button
              onClick={() => window.print()}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 18px",
                fontSize: "14px",
                fontWeight: "700",
                backgroundColor: "var(--color-primary)",
                border: "none",
                borderRadius: "8px",
                color: "#ffffff",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(249, 115, 22, 0.2)"
              }}
            >
              🖨️ Export PDF Audit Report
            </button>
          </div>
        </div>



        {activeTab === "dashboard" && (
          <div>
            {/* Stats Grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: "20px",
              marginBottom: "40px"
            }}>
              <div className="card" style={styles.statCard}>
                <span style={{ fontSize: "14px", color: "var(--text-secondary)", fontWeight: "600" }}>Total Complaints</span>
                <span style={{ fontSize: "36px", fontWeight: "800", color: "var(--text-primary)", marginTop: "10px" }}>
                  {loading ? "..." : stats.total}
                </span>
              </div>
              <div className="card" style={{ ...styles.statCard, borderLeft: "4px solid #a855f7" }}>
                <span style={{ fontSize: "14px", color: "var(--text-secondary)", fontWeight: "600" }}>Today's Complaints</span>
                <span style={{ fontSize: "36px", fontWeight: "800", color: "#a855f7", marginTop: "10px" }}>
                  {loading ? "..." : stats.today}
                </span>
              </div>
              <div className="card" style={{ ...styles.statCard, borderLeft: "4px solid var(--color-pending)" }}>
                <span style={{ fontSize: "14px", color: "var(--text-secondary)", fontWeight: "600" }}>Pending Review</span>
                <span style={{ fontSize: "36px", fontWeight: "800", color: "var(--color-pending)", marginTop: "10px" }}>
                  {loading ? "..." : stats.pending}
                </span>
              </div>
              <div className="card" style={{ ...styles.statCard, borderLeft: "4px solid var(--color-processing)" }}>
                <span style={{ fontSize: "14px", color: "var(--text-secondary)", fontWeight: "600" }}>In Progress</span>
                <span style={{ fontSize: "36px", fontWeight: "800", color: "var(--color-processing)", marginTop: "10px" }}>
                  {loading ? "..." : stats.active}
                </span>
              </div>
              <div className="card" style={{ ...styles.statCard, borderLeft: "4px solid var(--color-completed)" }}>
                <span style={{ fontSize: "14px", color: "var(--text-secondary)", fontWeight: "600" }}>Resolved</span>
                <span style={{ fontSize: "36px", fontWeight: "800", color: "var(--color-completed)", marginTop: "10px" }}>
                  {loading ? "..." : stats.completed}
                </span>
              </div>
              <div className="card" style={{ ...styles.statCard, borderLeft: "4px solid #ef4444" }}>
                <span style={{ fontSize: "14px", color: "var(--text-secondary)", fontWeight: "600" }}>Rejected</span>
                <span style={{ fontSize: "36px", fontWeight: "800", color: "#ef4444", marginTop: "10px" }}>
                  {loading ? "..." : stats.rejected}
                </span>
              </div>
              <div className="card" style={{ ...styles.statCard, borderLeft: "4px solid #10b981" }}>
                <span style={{ fontSize: "14px", color: "var(--text-secondary)", fontWeight: "600" }}>Resolution Rate</span>
                <span style={{ fontSize: "36px", fontWeight: "800", color: "#10b981", marginTop: "10px" }}>
                  {loading ? "..." : `${resolutionRate}%`}
                </span>
              </div>
            </div>

            {/* Priority & Urgency Section */}
            <div style={{ marginBottom: "40px" }}>
              <h3 style={{ marginBottom: "20px" }}>🚨 Priority & Urgency Assessment</h3>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "24px"
              }}>
                <div className="card" style={{ ...styles.priorityCard, borderLeft: "4px solid #ef4444" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <span style={{ fontSize: "14px", color: "#fca5a5", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>🔴 High Priority</span>
                      <span style={{ display: "block", fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>Critical safety, infrastructure, or health issues</span>
                    </div>
                    <span style={{ fontSize: "36px", fontWeight: "800", color: "#ef4444" }}>{loading ? "..." : stats.high}</span>
                  </div>
                </div>

                <div className="card" style={{ ...styles.priorityCard, borderLeft: "4px solid #f59e0b" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <span style={{ fontSize: "14px", color: "#fde047", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>🟡 Medium Priority</span>
                      <span style={{ display: "block", fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>Standard municipal & administrative requests</span>
                    </div>
                    <span style={{ fontSize: "36px", fontWeight: "800", color: "#f59e0b" }}>{loading ? "..." : stats.medium}</span>
                  </div>
                </div>

                <div className="card" style={{ ...styles.priorityCard, borderLeft: "4px solid #3b82f6" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <span style={{ fontSize: "14px", color: "#93c5fd", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>🔵 Low Priority</span>
                      <span style={{ display: "block", fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>General inquiries, feedback, or minor repairs</span>
                    </div>
                    <span style={{ fontSize: "36px", fontWeight: "800", color: "#3b82f6" }}>{loading ? "..." : stats.low}</span>
                  </div>
                </div>

                <div className="card" style={{ ...styles.priorityCard, borderLeft: "4px solid #a855f7" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <span style={{ fontSize: "14px", color: "#c084fc", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>🟣 Emergency Priority</span>
                      <span style={{ display: "block", fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>Immediate threat to life, health, or critical security</span>
                    </div>
                    <span style={{ fontSize: "36px", fontWeight: "800", color: "#a855f7" }}>{loading ? "..." : stats.emergency}</span>
                  </div>
                </div>
              </div>
            </div>
            {/* AI Assistant & Translation Monitoring Board */}
            {!loading && complaints.length > 0 && (
              <div style={{ marginBottom: "40px" }}>
                <h3 style={{ marginBottom: "20px" }}>🤖 AI Redressal & Translation Analytics</h3>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: "24px",
                  marginBottom: "20px"
                }}>
                  {/* AI Filing Rate Card */}
                  <div className="card" style={{ ...styles.priorityCard, borderLeft: "4px solid var(--color-primary)", display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <span style={{ fontSize: "14px", color: "#fdba74", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>🤖 AI Generated Grievances</span>
                      <span style={{ display: "block", fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>Grievances drafted by LokSeva AI Assistant</span>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: "36px", fontWeight: "800", color: "var(--color-primary)", display: "block" }}>{aiGeneratedCount}</span>
                      <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{aiPercentage}% of total</span>
                    </div>
                  </div>

                  {/* Translation Activity Card */}
                  <div className="card" style={{ ...styles.priorityCard, borderLeft: "4px solid #10b981", display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <span style={{ fontSize: "14px", color: "#a7f3d0", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>🌐 Translated Grievances</span>
                      <span style={{ display: "block", fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>Regional language inputs translated by Bhashini</span>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: "36px", fontWeight: "800", color: "#10b981", display: "block" }}>{translatedCount}</span>
                      <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{translationPercentage}% of total</span>
                    </div>
                  </div>

                  {/* Language Diversity Card */}
                  <div className="card" style={{ ...styles.priorityCard, borderLeft: "4px solid #3b82f6", display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <span style={{ fontSize: "14px", color: "#93c5fd", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>🗣️ Language Diversity</span>
                      <span style={{ display: "block", fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>Distinct languages used by citizens</span>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: "36px", fontWeight: "800", color: "#3b82f6", display: "block" }}>{Object.keys(languageCounts).length}</span>
                      <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Active dialects</span>
                    </div>
                  </div>
                </div>

                {/* Language breakdown list */}
                {Object.keys(languageCounts).length > 0 && (
                  <div className="card" style={{ padding: "20px 24px" }}>
                    <h4 style={{ margin: "0 0 15px 0", fontSize: "14px", textTransform: "uppercase", color: "var(--text-secondary)" }}>Language Breakdown</h4>
                    <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                      {Object.entries(languageCounts).map(([lang, count]) => (
                        <div key={lang} style={{ padding: "8px 16px", backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid var(--border-light)", borderRadius: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontWeight: "700" }}>{lang}</span>
                          <span style={{ fontSize: "12px", color: "var(--color-accent)", fontWeight: "800" }}>{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Admin Live Action Notifications Feed */}
            {!loading && adminAlerts.length > 0 && (
              <div className="card" style={{ marginBottom: "40px", padding: "24px 30px", borderLeft: "4px solid var(--color-primary)" }}>
                <h3 style={{ marginBottom: "15px", display: "flex", alignItems: "center", gap: "10px" }}>
                  🔔 Administrative Action Logs & Alerts
                </h3>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "20px" }}>
                  Live audits showing recent grievance registrations, department assignments, and status modifications.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "250px", overflowY: "auto", paddingRight: "10px" }}>
                  {adminAlerts.map((alertItem) => (
                    <div key={alertItem.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", backgroundColor: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--border-light)", borderRadius: "8px" }}>
                      <div>
                        <span style={{ fontWeight: "700", marginRight: "10px", color: "var(--color-primary)" }}>{alertItem.complaintId}</span>
                        <span style={{ fontSize: "14px", color: "var(--text-primary)" }}>{alertItem.message}</span>
                      </div>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{alertItem.timestamp.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Citizen Feedback Board Panel */}
            {!loading && feedbackComplaints.length > 0 && (
              <div className="card" style={{ marginBottom: "40px", padding: "24px 30px", borderLeft: "4px solid #f59e0b" }}>
                <h3 style={{ marginBottom: "15px", display: "flex", alignItems: "center", gap: "10px" }}>
                  ⭐ Citizen Feedback Board ({feedbackComplaints.length})
                </h3>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "20px" }}>
                  Reviews and ratings submitted by citizens on completed grievance resolutions.
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", maxHeight: "300px", overflowY: "auto", paddingRight: "10px" }}>
                  {feedbackComplaints.map((item) => (
                    <div key={item._id} style={{ padding: "16px", backgroundColor: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--border-light)", borderRadius: "8px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                        <span style={{ fontWeight: "700", color: "var(--color-primary)" }}>{item.complaintId}</span>
                        <div style={{ display: "flex", gap: "2px" }}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span key={star} style={{ fontSize: "14px", color: star <= item.feedbackRating ? "#f59e0b" : "var(--text-muted)" }}>
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                      <span style={{ display: "block", fontSize: "12px", color: "var(--text-secondary)", marginBottom: "6px" }}>
                        <strong>Dept:</strong> {item.department} | <strong>Officer:</strong> {item.officer}
                      </span>
                      {item.feedbackComment && (
                        <p style={{ margin: 0, fontSize: "13px", color: "var(--text-primary)", fontStyle: "italic" }}>
                          "{item.feedbackComment}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Analytics Section */}
            {!loading && complaints.length > 0 && (
              <div style={{ marginBottom: "40px" }}>
                <h3 style={{ marginBottom: "20px" }}>📊 Performance & Trends Analytics</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))", gap: "24px" }}>
                  
                  {/* Departmental Load Card */}
                  <div className="card" style={{ padding: "24px 30px", marginBottom: 0 }}>
                    <h4 style={{ marginBottom: "15px", fontSize: "14px", textTransform: "uppercase", color: "var(--text-secondary)" }}>
                      🏢 Departmental Grievance Distribution
                    </h4>
                    <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "15px" }}>
                      Real-time load analysis of citizen requests across government services.
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                      <svg viewBox="0 0 600 220" width="100%" height="220" style={{ background: "rgba(0,0,0,0.2)", borderRadius: "8px", padding: "20px" }}>
                        <line x1="50" y1="20" x2="550" y2="20" stroke="rgba(255,255,255,0.05)" />
                        <line x1="50" y1="70" x2="550" y2="70" stroke="rgba(255,255,255,0.05)" />
                        <line x1="50" y1="120" x2="550" y2="120" stroke="rgba(255,255,255,0.05)" />
                        <line x1="50" y1="170" x2="550" y2="170" stroke="var(--border-light)" />

                        {depts.map((dept, index) => {
                          const count = deptCounts[dept] || 0;
                          const barHeight = maxVal ? (count / maxVal) * 130 : 0;
                          const colWidth = Math.max(40, 500 / Math.max(1, depts.length));
                          const x = 50 + index * colWidth + (colWidth - 30) / 2;
                          const y = 170 - barHeight;
                          const shortName = dept.length > 11 ? dept.substring(0, 9) + ".." : dept;
                          return (
                            <g key={dept}>
                              <rect
                                x={x}
                                y={y}
                                width="30"
                                height={barHeight}
                                rx="4"
                                fill="url(#barGradient)"
                                style={{ transition: "all 0.3s ease", cursor: "pointer" }}
                              >
                                <title>{dept}: {count} grievances</title>
                              </rect>
                              <text x={x + 15} y={y - 8} textAnchor="middle" fill="var(--text-primary)" fontSize="11" fontWeight="700">
                                {count}
                              </text>
                              <text x={x + 15} y="190" textAnchor="middle" fill="var(--text-muted)" fontSize="9" fontWeight="500">
                                {shortName}
                              </text>
                            </g>
                          );
                        })}

                        <defs>
                          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#fd9746" />
                            <stop offset="100%" stopColor="#f97316" />
                          </linearGradient>
                        </defs>
                      </svg>

                      {/* Status Progress bars */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {depts.map(dept => {
                          const count = deptCounts[dept] || 0;
                          const percent = complaints.length > 0 ? Math.round((count / complaints.length) * 100) : 0;
                          return (
                            <div key={dept}>
                              <div style={{ display: "flex", justifycontent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                                <span style={{ fontWeight: "600" }}>{dept}</span>
                                <span style={{ color: "var(--color-accent)", fontWeight: "700" }}>{percent}% ({count})</span>
                              </div>
                              <div style={{ width: "100%", height: "4px", background: "rgba(255,255,255,0.05)", borderRadius: "2px", overflow: "hidden" }}>
                                <div style={{ width: `${percent}%`, height: "100%", background: "linear-gradient(90deg, var(--color-accent), var(--color-primary))", borderRadius: "2px" }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Monthly Trend Card */}
                  <div className="card" style={{ padding: "24px 30px", marginBottom: 0 }}>
                    <h4 style={{ marginBottom: "15px", fontSize: "14px", textTransform: "uppercase", color: "var(--text-secondary)" }}>
                      📈 Monthly Grievance Trends
                    </h4>
                    <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "15px" }}>
                      Six-month rolling timeline tracking registered grievance volume.
                    </p>
                    <svg viewBox="0 0 600 220" width="100%" height="220" style={{ background: "rgba(0,0,0,0.2)", borderRadius: "8px", padding: "20px" }}>
                      <line x1="50" y1="20" x2="550" y2="20" stroke="rgba(255,255,255,0.05)" />
                      <line x1="50" y1="70" x2="550" y2="70" stroke="rgba(255,255,255,0.05)" />
                      <line x1="50" y1="120" x2="550" y2="120" stroke="rgba(255,255,255,0.05)" />
                      <line x1="50" y1="170" x2="550" y2="170" stroke="var(--border-light)" />

                      {trendArea && (
                        <path
                          d={trendArea}
                          fill="url(#trendAreaGradient)"
                          opacity="0.1"
                        />
                      )}

                      {trendPath && (
                        <path
                          d={trendPath}
                          fill="none"
                          stroke="url(#trendLineGradient)"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      )}

                      {trendPoints.map((p, index) => (
                        <g key={index}>
                          <circle
                            cx={p.x}
                            cy={p.y}
                            r="5"
                            fill="var(--color-primary)"
                            stroke="#ffffff"
                            strokeWidth="1.5"
                            style={{ transition: "all 0.3s ease", cursor: "pointer" }}
                          >
                            <title>{p.name}: {p.count} grievances</title>
                          </circle>
                          <text x={p.x} y={p.y - 10} textAnchor="middle" fill="var(--text-primary)" fontSize="11" fontWeight="700">
                            {p.count}
                          </text>
                          <text x={p.x} y="190" textAnchor="middle" fill="var(--text-muted)" fontSize="9" fontWeight="500">
                            {p.name}
                          </text>
                        </g>
                      ))}

                      <defs>
                        <linearGradient id="trendLineGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#f59e0b" />
                          <stop offset="100%" stopColor="#f97316" />
                        </linearGradient>
                        <linearGradient id="trendAreaGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#f97316" />
                          <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>

                </div>
              </div>
            )}

            {/* Complaints Table */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "16px" }} className="no-print">
              <h3 style={{ margin: 0 }}>📋 Citizen Grievances ({filteredComplaints.length})</h3>

              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
                <input
                  type="text"
                  placeholder="Search ID, subject, citizen info..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setSelectedIds([]); }}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "8px",
                    border: "1px solid var(--border-light)",
                    backgroundColor: "var(--bg-secondary)",
                    color: "var(--text-primary)",
                    fontSize: "13px",
                    width: "240px",
                    margin: 0
                  }}
                />

                <select
                  value={filterDepartment}
                  onChange={(e) => { setFilterDepartment(e.target.value); setSelectedIds([]); }}
                  style={{ padding: "8px 14px", borderRadius: "8px", border: "1px solid var(--border-light)", backgroundColor: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: "13px", margin: 0, width: "155px" }}
                >
                  <option value="All">All Departments</option>
                  {departmentsList.map(dept => (
                    <option key={dept._id} value={dept.departmentName || dept.name}>{dept.departmentName || dept.name}</option>
                  ))}
                </select>

                <select
                  value={filterPriority}
                  onChange={(e) => { setFilterPriority(e.target.value); setSelectedIds([]); }}
                  style={{ padding: "8px 14px", borderRadius: "8px", border: "1px solid var(--border-light)", backgroundColor: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: "13px", margin: 0, width: "130px" }}
                >
                  <option value="All">All Priorities</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => { setFilterStatus(e.target.value); setSelectedIds([]); }}
                  style={{ padding: "8px 14px", borderRadius: "8px", border: "1px solid var(--border-light)", backgroundColor: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: "13px", margin: 0, width: "130px" }}
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending Review</option>
                  <option value="Assigned">Assigned</option>
                  <option value="Processing">In Progress</option>
                  <option value="Completed">Resolved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>

            <div className="print-only" style={{ display: "none" }}>
              <h3>📋 Citizen Grievances ({filteredComplaints.length})</h3>
            </div>

            {selectedIds.length > 0 && (
              <div className="no-print" style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "rgba(249, 115, 22, 0.1)",
                border: "1px solid rgba(249, 115, 22, 0.3)",
                borderRadius: "12px",
                padding: "16px 24px",
                marginBottom: "20px",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)"
              }}>
                <div>
                  <span style={{ fontWeight: "700", color: "var(--text-primary)" }}>
                    Selected {selectedIds.length} grievance(s)
                  </span>
                  <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "var(--text-secondary)" }}>
                    You can assign them all to the same department and officer in bulk.
                  </p>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    onClick={() => {
                      setBatchAssignForm({
                        department: "Municipal Corporation",
                        officer: "",
                        priority: "Medium",
                        dueDate: ""
                      });
                      setActiveModal("batch-assign");
                    }}
                    style={{
                      backgroundColor: "var(--color-primary)",
                      border: "none",
                      borderRadius: "8px",
                      color: "#ffffff",
                      padding: "10px 18px",
                      fontSize: "14px",
                      fontWeight: "700",
                      cursor: "pointer"
                    }}
                  >
                    👥 Batch Assign Officers
                  </button>
                  <button
                    onClick={() => setSelectedIds([])}
                    className="btn-secondary"
                    style={{ margin: 0, padding: "10px 18px", fontSize: "14px" }}
                  >
                    Cancel Selection
                  </button>
                </div>
              </div>
            )}

            {loading ? (
              <div style={{ textAlign: "center", padding: "40px", color: "var(--text-secondary)" }}>Loading grievances console...</div>
            ) : filteredComplaints.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", border: "1px dashed var(--border-light)", borderRadius: "12px", color: "var(--text-secondary)" }}>
                No complaints matching the selected filters.
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                 <table>
                  <thead>
                    <tr>
                      <th className="no-print" style={{ width: "40px" }}>
                        <input
                          type="checkbox"
                          checked={filteredComplaints.length > 0 && selectedIds.length === filteredComplaints.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedIds(filteredComplaints.map(c => c.complaintId));
                            } else {
                              setSelectedIds([]);
                            }
                          }}
                          style={{ cursor: "pointer", width: "16px", height: "16px" }}
                        />
                      </th>
                      <th onClick={() => handleSort("complaintId")} style={{ cursor: "pointer", userSelect: "none" }}>
                        ID{getSortIndicator("complaintId")}
                      </th>
                      <th onClick={() => handleSort("citizenName")} style={{ cursor: "pointer", userSelect: "none" }}>
                        Citizen Info{getSortIndicator("citizenName")}
                      </th>
                      <th onClick={() => handleSort("title")} style={{ cursor: "pointer", userSelect: "none" }}>
                        Grievance Subject{getSortIndicator("title")}
                      </th>
                      <th onClick={() => handleSort("department")} style={{ cursor: "pointer", userSelect: "none" }}>
                        Department{getSortIndicator("department")}
                      </th>
                      <th onClick={() => handleSort("officer")} style={{ cursor: "pointer", userSelect: "none" }}>
                        Officer{getSortIndicator("officer")}
                      </th>
                      <th onClick={() => handleSort("priority")} style={{ cursor: "pointer", userSelect: "none" }}>
                        Priority{getSortIndicator("priority")}
                      </th>
                      <th onClick={() => handleSort("dueDate")} style={{ cursor: "pointer", userSelect: "none" }}>
                        Due Date{getSortIndicator("dueDate")}
                      </th>
                      <th onClick={() => handleSort("language")} style={{ cursor: "pointer", userSelect: "none" }}>
                        Lang{getSortIndicator("language")}
                      </th>
                      <th onClick={() => handleSort("status")} style={{ cursor: "pointer", userSelect: "none" }}>
                        Status{getSortIndicator("status")}
                      </th>
                      <th className="no-print">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedComplaints.map((item) => (
                      <tr key={item._id}>
                        <td className="no-print">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(item.complaintId)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedIds([...selectedIds, item.complaintId]);
                              } else {
                                setSelectedIds(selectedIds.filter(id => id !== item.complaintId));
                              }
                            }}
                            style={{ cursor: "pointer", width: "16px", height: "16px" }}
                          />
                        </td>
                        <td 
                          style={{ fontWeight: "700", color: "var(--color-primary)", cursor: "pointer", textDecoration: "underline" }}
                          onClick={() => { setSelectedComplaint(item); setActiveModal("details"); }}
                        >
                          {item.complaintId}
                        </td>
                        <td>
                          <div style={{ fontWeight: "600", color: "var(--text-primary)" }}>{item.userId?.name || "Anonymous"}</div>
                          <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{item.userId?.email || ""}</div>
                        </td>
                        <td style={{ maxWidth: "250px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "4px" }}>
                            <span style={{ fontWeight: "600", color: "var(--text-primary)" }}>{item.title}</span>
                            {item.duplicateCount > 0 && (
                              <span style={{
                                fontSize: "10px",
                                background: "rgba(239, 68, 68, 0.15)",
                                color: "#f87171",
                                border: "1px solid rgba(239, 68, 68, 0.3)",
                                padding: "1px 6px",
                                borderRadius: "4px",
                                fontWeight: "700",
                                display: "inline-block"
                              }}>
                                🚨 Clustered: {item.duplicateCount + 1} Reports
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: "13px", color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {item.description}
                          </div>
                        </td>
                        <td>{item.department}</td>
                        <td>{item.officer || "Unassigned"}</td>
                        <td>
                          <span
                            className="priority-badge-print"
                            style={{
                              fontSize: "11px",
                              fontWeight: "700",
                              padding: "4px 8px",
                              borderRadius: "6px",
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                              display: "inline-block",
                              ...getPriorityStyle(item.priority)
                            }}
                          >
                            {item.priority || "Medium"}
                          </span>
                        </td>
                        <td style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                          {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : "No Deadline"}
                        </td>
                        <td>
                          <span style={{ fontSize: "12px", background: "rgba(255,255,255,0.05)", padding: "2px 6px", borderRadius: "4px" }}>
                            {item.language || "English"}
                          </span>
                        </td>
                        <td>
                          <span className={getStatusClass(item.status)}>{item.status}</span>
                        </td>
                        <td className="no-print">
                          <div style={{ display: "flex", gap: "6px" }}>
                            <button
                              onClick={() => { setSelectedComplaint(item); setActiveModal("details"); }}
                              className="btn-secondary"
                              style={{ padding: "6px 12px", fontSize: "12px", margin: 0 }}
                            >
                              View
                            </button>
                            <button
                              onClick={() => openAssignModal(item)}
                              className="btn-secondary"
                              style={{ padding: "6px 12px", fontSize: "12px", margin: 0 }}
                            >
                              Assign
                            </button>
                            <button
                              onClick={() => openStatusModal(item)}
                              style={{ padding: "6px 12px", fontSize: "12px", margin: 0 }}
                            >
                              Status
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* User Directory Tab */}
        {activeTab === "users" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "16px" }} className="no-print">
              <h3 style={{ margin: 0 }}>👥 User Directory ({filteredUsers.length})</h3>

              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
                <input
                  type="text"
                  placeholder="Search name or email..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "8px",
                    border: "1px solid var(--border-light)",
                    backgroundColor: "var(--bg-secondary)",
                    color: "var(--text-primary)",
                    fontSize: "13px",
                    width: "240px",
                    margin: 0
                  }}
                />
                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  style={{ padding: "8px 14px", borderRadius: "8px", border: "1px solid var(--border-light)", backgroundColor: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: "13px", margin: 0, width: "150px" }}
                >
                  <option value="All">All Roles</option>
                  <option value="citizen">Citizens Only</option>
                  <option value="admin">Admins Only</option>
                </select>
                <button
                  onClick={() => {
                    setCreateOfficerForm({
                      name: "",
                      email: "",
                      password: "",
                      phone: "",
                      designation: "Officer",
                      departments: [],
                      salary: 50000,
                      officeLocation: "Main Office"
                    });
                    setActiveModal("create-officer");
                  }}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "8px",
                    backgroundColor: "var(--color-primary)",
                    color: "#ffffff",
                    border: "none",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "pointer",
                    margin: 0
                  }}
                >
                  ➕ Add New Officer
                </button>
              </div>
            </div>

            {usersLoading ? (
              <div style={{ textAlign: "center", padding: "40px", color: "var(--text-secondary)" }}>Loading user list...</div>
            ) : filteredUsers.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", border: "1px dashed var(--border-light)", borderRadius: "12px", color: "var(--text-secondary)" }}>
                No users matched the criteria.
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Role</th>
                      <th>Registered Language</th>
                      <th>Complaints Count</th>
                      <th>Registered At</th>
                      <th className="no-print">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((item) => (
                      <tr key={item._id}>
                        <td style={{ fontWeight: "700", color: "var(--text-primary)" }}>
                          {item.name}
                          {item.role === "admin" && (
                            <div style={{ fontWeight: "normal", fontSize: "12px", color: "var(--color-primary)", marginTop: "4px" }}>
                              💼 {item.designation || "Officer"}
                            </div>
                          )}
                        </td>
                        <td>{item.email}</td>
                        <td>{item.phone || "Not Provided"}</td>
                        <td>
                          <span
                            style={{
                              fontSize: "11px",
                              fontWeight: "700",
                              padding: "4px 8px",
                              borderRadius: "6px",
                              textTransform: "uppercase",
                              backgroundColor: item.role === "admin" ? "rgba(249, 115, 22, 0.15)" : "rgba(255, 255, 255, 0.05)",
                              color: item.role === "admin" ? "var(--color-primary)" : "var(--text-secondary)",
                              border: item.role === "admin" ? "1px solid rgba(249, 115, 22, 0.3)" : "1px solid var(--border-light)"
                            }}
                          >
                            {item.role === "admin" ? "Officer / Admin" : "Citizen"}
                          </span>
                          {item.role === "admin" && (
                            <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "6px", textAlign: "left", lineHeight: "1.4" }}>
                              <div>📍 {item.officeLocation || "Main Office"}</div>
                              <div>💰 ₹{item.salary ? item.salary.toLocaleString() : "0"}</div>
                              <div>🟢 Status: {item.status || "Active"}</div>
                              <div style={{ color: "var(--text-muted)", fontSize: "10px", marginTop: "2px", maxWidth: "180px", whiteSpace: "normal" }}>
                                🏢 Depts: {item.departments && item.departments.length > 0 ? item.departments.join(", ") : "None Assigned"}
                              </div>
                            </div>
                          )}
                        </td>
                        <td>{item.language || "English"}</td>
                        <td style={{ textAlign: "center" }}>
                          {item.complaintsCount > 0 ? (
                            <span
                              onClick={() => {
                                setSearchQuery(item.email);
                                setSearchParams({ tab: "dashboard" });
                              }}
                              style={{
                                cursor: "pointer",
                                textDecoration: "underline",
                                color: "var(--color-primary)",
                                fontWeight: "800"
                              }}
                              title="Click to view citizen's complaints history"
                            >
                              {item.complaintsCount} view history
                            </span>
                          ) : (
                            <span style={{ color: "var(--text-muted)", fontWeight: "500" }}>0</span>
                          )}
                        </td>
                        <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                        <td className="no-print">
                          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                            {user?._id === item._id || user?.email === item.email ? (
                              <span style={{ fontSize: "12px", color: "var(--text-muted)", fontStyle: "italic" }}>You</span>
                            ) : (
                              <button
                                onClick={() => handleToggleUserRole(item)}
                                className="btn-secondary"
                                style={{ padding: "6px 12px", fontSize: "12px", margin: 0 }}
                              >
                                {item.role === "admin" ? "Demote" : "Promote"}
                              </button>
                            )}
                            {item.role === "admin" && (
                              <button
                                onClick={() => openOfficerEditor(item)}
                                style={{ padding: "6px 12px", fontSize: "12px", margin: 0, backgroundColor: "var(--color-primary)", color: "#ffffff", border: "none" }}
                              >
                                Edit Profile
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Officer Performance Tracker Table */}
            {officersPerformance.length > 0 && (
              <div className="card" style={{ marginTop: "40px", padding: "24px 30px" }}>
                <h3 style={{ marginBottom: "15px" }}>📈 Officer Performance & Workload Tracker</h3>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "20px" }}>
                  Real-time analytics on officer workloads, resolution speeds, and dynamic performance indexes.
                </p>
                <div style={{ overflowX: "auto" }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Officer Name</th>
                        <th>Designation</th>
                        <th>Office Branch</th>
                        <th>Active Workload</th>
                        <th>Grievances Resolved</th>
                        <th>Avg Redressal Speed</th>
                        <th>Performance Index</th>
                      </tr>
                    </thead>
                    <tbody>
                      {officersPerformance.map(off => (
                        <tr key={off._id}>
                          <td style={{ fontWeight: "700", color: "var(--text-primary)" }}>{off.name}</td>
                          <td>{off.designation || "Officer"}</td>
                          <td>📍 {off.officeLocation || "Main Office"}</td>
                          <td style={{ textAlign: "center", fontWeight: "700", color: off.activeWorkload > 5 ? "var(--color-primary)" : "var(--text-secondary)" }}>
                            {off.activeWorkload} complaints
                          </td>
                          <td style={{ textAlign: "center", fontWeight: "700" }}>{off.resolvedCount}</td>
                          <td>{off.avgSpeed || "N/A"}</td>
                          <td>
                            <span style={{ fontSize: "14px", color: "#f59e0b", letterSpacing: "2px" }}>
                              {"★".repeat(off.rating)}{"☆".repeat(5 - off.rating)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* System Configuration Tab */}
        {activeTab === "system" && (
          <div>
            <h3>⚙️ System Integrations Configuration</h3>
            <p style={{ color: "var(--text-secondary)", marginBottom: "30px" }}>
              Diagnostic console checking system integrations and environment statuses.
            </p>

            {systemLoading ? (
              <div style={{ textAlign: "center", padding: "40px", color: "var(--text-secondary)" }}>Running diagnostics check...</div>
            ) : !systemStatus ? (
              <div style={{ textAlign: "center", padding: "40px", color: "var(--text-secondary)" }}>Failed to retrieve diagnostic data.</div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
                {/* Gemini Config */}
                <div className="card" style={{ padding: "24px 30px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                    <h4 style={{ margin: 0 }}>🤖 Google Gemini AI API</h4>
                    <span
                      style={{
                        padding: "4px 8px",
                        fontSize: "11px",
                        fontWeight: "700",
                        borderRadius: "6px",
                        backgroundColor: systemStatus.gemini.includes("Active") ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                        color: systemStatus.gemini.includes("Active") ? "#10b981" : "#ef4444"
                      }}
                    >
                      {systemStatus.gemini.includes("Active") ? "OK" : "WARNING"}
                    </span>
                  </div>
                  <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.6" }}>
                    Used by the system to automatically analyze grievances, summarize text, extract topics, map appropriate departments, and pre-evaluate priority.
                  </p>
                  <div style={{ marginTop: "15px", fontSize: "12px", borderTop: "1px solid var(--border-light)", paddingTop: "12px" }}>
                    <strong>Status:</strong> <span style={{ color: systemStatus.gemini.includes("Active") ? "#10b981" : "#ef4444" }}>{systemStatus.gemini}</span>
                  </div>
                </div>

                {/* Bhashini Config */}
                <div className="card" style={{ padding: "24px 30px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                    <h4 style={{ margin: 0 }}>🗣️ MeitY Bhashini API</h4>
                    <span
                      style={{
                        padding: "4px 8px",
                        fontSize: "11px",
                        fontWeight: "700",
                        borderRadius: "6px",
                        backgroundColor: systemStatus.bhashini.includes("Active") ? "rgba(16, 185, 129, 0.15)" : "rgba(245, 158, 11, 0.15)",
                        color: systemStatus.bhashini.includes("Active") ? "#10b981" : "#f59e0b"
                      }}
                    >
                      {systemStatus.bhashini.includes("Active") ? "OK" : "SIMULATED"}
                    </span>
                  </div>
                  <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.6" }}>
                    Used to translate local regional Indian languages to English and vice-versa, making the application accessible to all Indian citizens.
                  </p>
                  <div style={{ marginTop: "15px", fontSize: "12px", borderTop: "1px solid var(--border-light)", paddingTop: "12px" }}>
                    <strong>Status:</strong> <span style={{ color: systemStatus.bhashini.includes("Active") ? "#10b981" : "#f59e0b" }}>{systemStatus.bhashini}</span>
                  </div>
                </div>

                {/* Clerk Config */}
                <div className="card" style={{ padding: "24px 30px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                    <h4 style={{ margin: 0 }}>🔐 Clerk Authentication</h4>
                    <span
                      style={{
                        padding: "4px 8px",
                        fontSize: "11px",
                        fontWeight: "700",
                        borderRadius: "6px",
                        backgroundColor: systemStatus.clerk.includes("Active") ? "rgba(16, 185, 129, 0.15)" : "rgba(245, 158, 11, 0.15)",
                        color: systemStatus.clerk.includes("Active") ? "#10b981" : "#f59e0b"
                      }}
                    >
                      {systemStatus.clerk.includes("Active") ? "CLERK" : "LOCAL"}
                    </span>
                  </div>
                  <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.6" }}>
                    Secures user authentication. Under Local mode, credentials are saved inside MongoDB. Under Clerk mode, users can login via Google and GitHub.
                  </p>
                  <div style={{ marginTop: "15px", fontSize: "12px", borderTop: "1px solid var(--border-light)", paddingTop: "12px" }}>
                    <strong>Status:</strong> <span style={{ color: "#f8fafc" }}>{systemStatus.clerk}</span>
                  </div>
                </div>

                {/* Server Env Info */}
                <div className="card" style={{ padding: "24px 30px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                    <h4 style={{ margin: 0 }}>💻 Hosting Environment</h4>
                    <span style={{ padding: "4px 8px", fontSize: "11px", fontWeight: "700", borderRadius: "6px", backgroundColor: "rgba(255, 255, 255, 0.05)" }}>INFO</span>
                  </div>
                  <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.6" }}>
                    Shows the node process profile and the active communication port of the backend API.
                  </p>
                  <div style={{ marginTop: "15px", fontSize: "12px", borderTop: "1px solid var(--border-light)", paddingTop: "12px" }}>
                    <div><strong>Profile:</strong> {systemStatus.environment}</div>
                    <div style={{ marginTop: "4px" }}><strong>Port:</strong> {systemStatus.port}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Profile & Security Settings Grid */}
            <h3 style={{ marginTop: "40px", marginBottom: "20px" }}>🛡️ Admin Profile & Security</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px", marginBottom: "40px" }}>
              {/* Profile details */}
              <div className="card" style={{ padding: "30px" }}>
                <h4>Change Profile Details</h4>
                <form onSubmit={handleUpdateProfile} style={{ marginTop: "15px" }}>
                  <div style={{ marginBottom: "15px" }}>
                    <label style={styles.modalLabel}>Admin Full Name</label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div style={{ marginBottom: "15px" }}>
                    <label style={styles.modalLabel}>Phone Number</label>
                    <input
                      type="text"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      placeholder="e.g. +91 9876543210"
                    />
                  </div>
                  <div style={{ marginBottom: "20px" }}>
                    <label style={styles.modalLabel}>Preferred Language</label>
                    <select
                      value={profileForm.language}
                      onChange={(e) => setProfileForm({ ...profileForm, language: e.target.value })}
                    >
                      <option value="English">English</option>
                      <option value="Hindi">Hindi / हिन्दी</option>
                      <option value="Tamil">Tamil / தமிழ்</option>
                      <option value="Telugu">Telugu / తెలుగు</option>
                    </select>
                  </div>
                  <button type="submit" style={{ width: "100%", margin: 0 }}>Save Profile Details</button>
                </form>
              </div>

              {/* Change Password form */}
              <div className="card" style={{ padding: "30px" }}>
                <h4>Security Settings</h4>
                <form onSubmit={handleChangePassword} style={{ marginTop: "15px" }}>
                  <div style={{ marginBottom: "15px" }}>
                    <label style={styles.modalLabel}>Current Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={passwordForm.oldPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                      required
                    />
                  </div>
                  <div style={{ marginBottom: "15px" }}>
                    <label style={styles.modalLabel}>New Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      required
                    />
                  </div>
                  <div style={{ marginBottom: "20px" }}>
                    <label style={styles.modalLabel}>Confirm New Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={passwordForm.confirmNewPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmNewPassword: e.target.value })}
                      required
                    />
                  </div>
                  <button type="submit" style={{ width: "100%", margin: 0 }}>Update Account Password</button>
                </form>
              </div>
            </div>

            {/* Audit History Logs Card */}
            <h3 style={{ marginBottom: "20px" }}>📜 Administrative Audit Logs</h3>
            <div className="card" style={{ padding: "30px", marginBottom: "40px" }}>
              <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "20px" }}>
                Official change records tracking admin operations, department updates, and officer role changes.
              </p>
              {logsLoading ? (
                <div style={{ color: "var(--text-secondary)", textAlign: "center", padding: "20px" }}>Loading audit history...</div>
              ) : auditLogs.length === 0 ? (
                <div style={{ color: "var(--text-secondary)", textAlign: "center", padding: "20px", border: "1px dashed var(--border-light)", borderRadius: "8px" }}>No audit logs recorded yet.</div>
              ) : (
                <div style={{ overflowX: "auto", maxHeight: "400px" }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Date & Time</th>
                        <th>Administrator</th>
                        <th>Action Performed</th>
                        <th>Target Reference</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs.map((log) => (
                        <tr key={log._id}>
                          <td style={{ fontSize: "12px", whiteSpace: "nowrap" }}>
                            {new Date(log.createdAt).toLocaleString()}
                          </td>
                          <td>
                            <span style={{ fontWeight: "700", color: "var(--text-primary)" }}>{log.adminName}</span>
                            <span style={{ display: "block", fontSize: "11px", color: "var(--text-secondary)" }}>{log.adminEmail}</span>
                          </td>
                          <td style={{ color: "var(--text-primary)" }}>{log.action}</td>
                          <td style={{ fontWeight: "600", fontSize: "12px" }}>{log.target}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "departments" && (
          <DepartmentManager />
        )}

        {activeTab === "clusters" && (
          <div className="card" style={{ padding: "30px", marginBottom: "40px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid var(--border-light)", paddingBottom: "15px" }}>
              <div>
                <h2 style={{ margin: 0 }}>👥 AI Duplicate Grievance Clusters</h2>
                <p style={{ margin: "5px 0 0 0", color: "var(--text-secondary)", fontSize: "14px" }}>
                  The system automatically groups similar citizen grievances in the same area. You can bulk-resolve all reports in a cluster at once.
                </p>
              </div>
              <button 
                className="btn-secondary" 
                onClick={loadAllClusters}
                disabled={loadingClusters}
                style={{ margin: 0 }}
              >
                🔄 Refresh Clusters
              </button>
            </div>

            {loadingClusters ? (
              <div style={{ textAlign: "center", padding: "40px", color: "var(--text-secondary)" }}>
                Loading clusters...
              </div>
            ) : clustersList.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", border: "1px dashed var(--border-light)", borderRadius: "8px", color: "var(--text-secondary)" }}>
                No duplicate grievance clusters identified by AI.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                {clustersList.map((cluster) => (
                  <div 
                    key={cluster.parent._id} 
                    className="card" 
                    style={{ 
                      padding: "20px", 
                      border: "1px solid var(--border-light)", 
                      background: "rgba(255, 255, 255, 0.02)",
                      margin: 0
                    }}
                  >
                    {/* Parent Header */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "15px", borderBottom: "1px dashed var(--border-light)", paddingBottom: "12px" }}>
                      <div>
                        <span style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "var(--color-primary)" }}>
                          Primary Grievance (Parent: {cluster.parent.complaintId})
                        </span>
                        <h4 style={{ margin: "4px 0 0 0", color: "var(--text-primary)" }}>{cluster.parent.title}</h4>
                        <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "var(--text-secondary)" }}>
                          📍 Location: {cluster.parent.location} | Department: {cluster.parent.department}
                        </p>
                      </div>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <span style={{ 
                          padding: "2px 8px", 
                          borderRadius: "4px", 
                          fontSize: "11px", 
                          fontWeight: "700", 
                          backgroundColor: "rgba(249, 115, 22, 0.15)", 
                          color: "#fdba74" 
                        }}>
                          {cluster.duplicates.length} Duplicate Reports
                        </span>
                        <button
                          onClick={() => openStatusModal(cluster.parent)}
                          style={{
                            padding: "6px 12px",
                            fontSize: "12px",
                            fontWeight: "700",
                            backgroundColor: "var(--color-primary)",
                            color: "#fff",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            margin: 0
                          }}
                        >
                          📢 Bulk Update / Resolve Cluster
                        </button>
                      </div>
                    </div>

                    {/* Parent Content */}
                    <p style={{ fontSize: "14px", color: "var(--text-secondary)", margin: "0 0 15px 0", fontStyle: "italic" }}>
                      "{cluster.parent.description}"
                    </p>

                    {/* Duplicate list */}
                    <div>
                      <h5 style={{ margin: "0 0 10px 0", fontSize: "13px", color: "var(--text-primary)" }}>
                        🔗 Linked Duplicate Submissions:
                      </h5>
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "200px", overflowY: "auto" }}>
                        {cluster.duplicates.map((dup) => (
                          <div 
                            key={dup._id} 
                            style={{ 
                              padding: "10px 14px", 
                              borderRadius: "6px", 
                              backgroundColor: "rgba(0,0,0,0.15)", 
                              border: "1px solid var(--border-light)",
                              fontSize: "13px"
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                              <span style={{ fontWeight: "700", color: "var(--text-primary)" }}>{dup.complaintId}</span>
                              <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                                {new Date(dup.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p style={{ margin: 0, color: "var(--text-secondary)" }}>
                              {dup.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Assignment Modal Overlay */}
        {activeModal === "assign" && (
          <div style={styles.overlay}>
            <div className="card" style={styles.modalCard}>
              <h3>👤 Assign Department & Officer</h3>
              <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "20px" }}>Reference ID: <strong>{assignForm.id}</strong></p>

              <form onSubmit={handleAssign}>
                <div style={{ marginBottom: "15px" }}>
                  <label style={styles.modalLabel}>Target Department</label>
                  <select
                    value={assignForm.department}
                    onChange={(e) => setAssignForm({ ...assignForm, department: e.target.value })}
                    style={{ margin: "5px 0 0 0" }}
                  >
                    {departmentsList.filter(dept => user?.role === "superadmin" || (user?.departments && user.departments.includes(dept.departmentName))).map(dept => (
                      <option key={dept._id} value={dept.departmentName}>{dept.departmentName}</option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <label style={styles.modalLabel}>Handling Officer (Select Admin Officer)</label>
                  <select
                    value={assignForm.officer}
                    onChange={(e) => setAssignForm({ ...assignForm, officer: e.target.value })}
                    style={{ margin: "5px 0 0 0" }}
                  >
                    <option value="">-- Assign to Department Only (Officer: Awaiting Assignment) --</option>
                    {usersList.filter(u => u.role === "admin" && u.departments && u.departments.includes(assignForm.department)).map(off => (
                      <option key={off._id} value={off.name}>{off.name} ({off.email})</option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <label style={styles.modalLabel}>Grievance Priority</label>
                  <select
                    value={assignForm.priority}
                    onChange={(e) => setAssignForm({ ...assignForm, priority: e.target.value })}
                    style={{ margin: "5px 0 0 0" }}
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <label style={styles.modalLabel}>Resolution Deadline (Due Date)</label>
                  <input
                    type="date"
                    value={assignForm.dueDate}
                    onChange={(e) => setAssignForm({ ...assignForm, dueDate: e.target.value })}
                    style={{ margin: "5px 0 0 0" }}
                  />
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button type="submit" style={{ flex: 1 }}>Submit Assignment</button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setActiveModal("")}
                    style={{ flex: 1, marginLeft: "8px" }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Batch Assignment Modal Overlay */}
        {activeModal === "batch-assign" && (
          <div style={styles.overlay}>
            <div className="card" style={styles.modalCard}>
              <h3>👥 Bulk Assign Officers</h3>
              <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "20px" }}>
                Assigning <strong>{selectedIds.length}</strong> selected grievances.
              </p>

              <form onSubmit={handleBatchAssign}>
                <div style={{ marginBottom: "15px" }}>
                  <label style={styles.modalLabel}>Target Department</label>
                  <select
                    value={batchAssignForm.department}
                    onChange={(e) => setBatchAssignForm({ ...batchAssignForm, department: e.target.value })}
                    style={{ margin: "5px 0 0 0" }}
                  >
                    {departmentsList.filter(dept => user?.role === "superadmin" || (user?.departments && user.departments.includes(dept.departmentName))).map(dept => (
                      <option key={dept._id} value={dept.departmentName}>{dept.departmentName}</option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <label style={styles.modalLabel}>Handling Officer (Select Admin Officer)</label>
                  <select
                    value={batchAssignForm.officer}
                    onChange={(e) => setBatchAssignForm({ ...batchAssignForm, officer: e.target.value })}
                    style={{ margin: "5px 0 0 0" }}
                  >
                    <option value="">-- Assign to Department Only (Officer: Awaiting Assignment) --</option>
                    {usersList.filter(u => u.role === "admin" && u.departments && u.departments.includes(batchAssignForm.department)).map(off => (
                      <option key={off._id} value={off.name}>{off.name} ({off.email})</option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <label style={styles.modalLabel}>Grievance Priority</label>
                  <select
                    value={batchAssignForm.priority}
                    onChange={(e) => setBatchAssignForm({ ...batchAssignForm, priority: e.target.value })}
                    style={{ margin: "5px 0 0 0" }}
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <label style={styles.modalLabel}>Resolution Deadline (Due Date)</label>
                  <input
                    type="date"
                    value={batchAssignForm.dueDate}
                    onChange={(e) => setBatchAssignForm({ ...batchAssignForm, dueDate: e.target.value })}
                    style={{ margin: "5px 0 0 0" }}
                  />
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button type="submit" style={{ flex: 1 }}>Submit Assignments</button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setActiveModal("")}
                    style={{ flex: 1, marginLeft: "8px" }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Status Update Modal Overlay */}
        {activeModal === "status" && (
          <div style={styles.overlay}>
            <div className="card" style={styles.modalCard}>
              <h3>📢 Update Redressal Status</h3>
              <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "20px" }}>Reference ID: <strong>{statusForm.id}</strong></p>

              <form onSubmit={handleUpdateStatus}>
                <div style={{ marginBottom: "15px" }}>
                  <label style={styles.modalLabel}>Processing Status</label>
                  <select
                    value={statusForm.status}
                    onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
                    style={{ margin: "5px 0 0 0" }}
                  >
                    <option value="Pending">Pending Review</option>
                    <option value="Assigned">Assigned to Officer</option>
                    <option value="Processing">In Progress / Processing</option>
                    <option value="Clarification Needed">Clarification Needed</option>
                    <option value="Completed">Resolved / Completed</option>
                    <option value="Closed">Closed</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                {["Pending", "Assigned", "Processing", "Clarification Needed"].includes(statusForm.status) && (
                  <div style={{ marginBottom: "15px" }}>
                    <label style={styles.modalLabel}>⏳ Interim Update / Delay Reason (Optional)</label>
                    <textarea
                      placeholder="e.g. Resolution delayed pending site inspection by field engineers next Tuesday..."
                      value={statusForm.interimReply}
                      onChange={(e) => setStatusForm({ ...statusForm, interimReply: e.target.value })}
                      style={{ margin: "5px 0 0 0", minHeight: "60px", fontSize: "13px", padding: "10px" }}
                    />
                  </div>
                )}

                {statusForm.status === "Clarification Needed" && (
                  <div style={{ marginBottom: "15px" }}>
                    <label style={styles.modalLabel}>Clarification Question / Details Needed</label>
                    <input
                      type="text"
                      placeholder="Specify what details or documents you need from the citizen..."
                      value={statusForm.clarificationQuestion}
                      onChange={(e) => setStatusForm({ ...statusForm, clarificationQuestion: e.target.value })}
                      required
                      style={{ margin: "5px 0 0 0" }}
                    />
                  </div>
                )}

                <div style={{ marginBottom: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <label style={styles.modalLabel}>Official Response / Resolution Notes</label>
                    <button 
                      type="button" 
                      onClick={handleSuggestResolution} 
                      style={{
                        padding: "4px 10px",
                        fontSize: "11px",
                        background: "rgba(249, 115, 22, 0.15)",
                        border: "1px solid rgba(249, 115, 22, 0.3)",
                        color: "#fdba74",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: "700"
                      }}
                    >
                      🤖 AI Suggestion
                    </button>
                  </div>
                  <textarea
                    placeholder="Provide details about actions taken or instructions to resolve the grievance..."
                    value={statusForm.reply}
                    onChange={(e) => setStatusForm({ ...statusForm, reply: e.target.value })}
                    style={{ margin: "5px 0 0 0", minHeight: "120px" }}
                  />
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button type="submit" style={{ flex: 1 }}>Update Status</button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setActiveModal("")}
                    style={{ flex: 1, marginLeft: "8px" }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Complaint Details Modal Overlay */}
        {activeModal === "details" && selectedComplaint && (
          <div style={styles.overlay}>
            <div className="card" style={{ ...styles.modalCard, maxWidth: "700px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-light)", paddingBottom: "15px", marginBottom: "20px" }}>
                <h3 style={{ margin: 0 }}>🔍 Grievance Complaint Details</h3>
                <button 
                  onClick={() => setActiveModal("")} 
                  style={{ background: "transparent", border: "none", color: "var(--text-secondary)", fontSize: "20px", cursor: "pointer" }}
                >
                  ✕
                </button>
              </div>

              <div style={{ maxHeight: "70vh", overflowY: "auto", paddingRight: "10px" }}>
                {/* Row 1: ID, Priority, Status */}
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "10px", marginBottom: "20px" }}>
                  <div>
                    <span style={styles.modalLabel}>REFERENCE ID</span>
                    <span style={{ fontSize: "18px", fontWeight: "800", color: "var(--color-primary)", display: "block" }}>{selectedComplaint.complaintId}</span>
                  </div>
                  <div>
                    <span style={styles.modalLabel}>PRIORITY</span>
                    <span style={{
                      padding: "4px 8px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: "700",
                      display: "inline-block",
                      ...getPriorityStyle(selectedComplaint.priority)
                    }}>{selectedComplaint.priority || "Medium"}</span>
                  </div>
                  <div>
                    <span style={styles.modalLabel}>STATUS</span>
                    <span className={getStatusClass(selectedComplaint.status)}>{selectedComplaint.status}</span>
                  </div>
                </div>

                {/* Row 2: Citizen Info */}
                <div className="grid-3" style={{ gap: "20px", marginBottom: "20px", borderBottom: "1px solid var(--border-light)", paddingBottom: "15px" }}>
                  <div>
                    <span style={styles.modalLabel}>Citizen Name</span>
                    <span style={{ fontWeight: "700", display: "block" }}>{selectedComplaint.userId?.name || "Anonymous"}</span>
                  </div>
                  <div>
                    <span style={styles.modalLabel}>Email Address</span>
                    <span style={{ display: "block" }}>{selectedComplaint.userId?.email || "Not Provided"}</span>
                  </div>
                  <div>
                    <span style={styles.modalLabel}>Phone Number</span>
                    <span style={{ display: "block" }}>{selectedComplaint.userId?.phone || "Not Provided"}</span>
                  </div>
                </div>

                {/* Row 3: Department, Officer, Due Date */}
                <div className="grid-3" style={{ gap: "20px", marginBottom: "20px", borderBottom: "1px solid var(--border-light)", paddingBottom: "15px" }}>
                  <div>
                    <span style={styles.modalLabel}>Department</span>
                    <span style={{ display: "block" }}>{selectedComplaint.department}</span>
                  </div>
                  <div>
                    <span style={styles.modalLabel}>Assigned Officer</span>
                    <span style={{ display: "block" }}>{selectedComplaint.officer || "Unassigned"}</span>
                  </div>
                  <div>
                    <span style={styles.modalLabel}>Due Date</span>
                    <span style={{ display: "block" }}>{selectedComplaint.dueDate ? new Date(selectedComplaint.dueDate).toLocaleDateString() : "No Deadline"}</span>
                  </div>
                </div>

                {/* Row 4: Subject Title */}
                <div style={{ marginBottom: "20px" }}>
                  <span style={styles.modalLabel}>Grievance Subject</span>
                  <span style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)", display: "block" }}>{selectedComplaint.title}</span>
                </div>

                {/* Row 5: Detailed Description */}
                <div style={{ marginBottom: "20px" }}>
                  <span style={styles.modalLabel}>Grievance Original Description</span>
                  <div style={{ padding: "12px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-light)", borderRadius: "6px", fontSize: "14px", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>
                    {selectedComplaint.description}
                  </div>
                </div>

                {/* Row 6: AI Generated Letter (Show if isAiGenerated is true) */}
                {selectedComplaint.isAiGenerated && selectedComplaint.aiLetter && (
                  <div style={{ marginBottom: "20px", border: "1px solid rgba(249, 115, 22, 0.2)", borderRadius: "8px", background: "rgba(249, 115, 22, 0.03)", padding: "16px" }}>
                    <span style={{ ...styles.modalLabel, color: "var(--color-primary)", display: "flex", alignItems: "center", gap: "6px", fontWeight: "800" }}>
                      🤖 AI Generated Application Letter ({selectedComplaint.language || "English"})
                    </span>
                    <div style={{ fontSize: "14px", lineHeight: "1.6", color: "var(--text-primary)", whiteSpace: "pre-wrap", marginTop: "10px" }}>
                      {selectedComplaint.aiLetter}
                    </div>
                  </div>
                )}

                {/* DigiLocker Verification Badge */}
                {selectedComplaint.isDigiLockerAttached && (
                  <div style={{ marginBottom: "20px", padding: "12px 16px", borderRadius: "8px", border: "1px solid rgba(16, 185, 129, 0.25)", backgroundColor: "rgba(16, 185, 129, 0.05)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "18px" }}>🔒</span>
                      <div style={{ textAlign: "left" }}>
                        <strong style={{ color: "#34d399", fontSize: "14px" }}>🟢 DigiLocker Verified Document Attached</strong>
                        <span style={{ display: "block", fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
                          Type: <strong>{selectedComplaint.digiLockerDocType}</strong> (Digitally authenticated via Aadhaar e-KYC)
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Photo Evidence Section */}
                {selectedComplaint.imageUrl && (
                  <div style={{ marginBottom: "20px" }}>
                    <span style={styles.modalLabel}>📷 Uploaded Photo Evidence</span>
                    <a href={`http://localhost:5000${selectedComplaint.imageUrl}`} target="_blank" rel="noreferrer" style={{ display: "inline-block", marginTop: "8px" }}>
                      <img 
                        src={`http://localhost:5000${selectedComplaint.imageUrl}`} 
                        alt="Evidence Upload" 
                        style={{ maxWidth: "100%", maxHeight: "250px", objectFit: "contain", borderRadius: "6px", border: "1px solid var(--border-light)" }} 
                      />
                    </a>
                    {selectedComplaint.imageAnalysis && (
                      <div style={{ marginTop: "10px", padding: "8px 12px", background: "rgba(249, 115, 22, 0.08)", borderLeft: "3px solid var(--color-primary)", borderRadius: "4px", fontSize: "12px" }}>
                        <strong>AI Image Verification details:</strong> {selectedComplaint.imageAnalysis}
                      </div>
                    )}
                  </div>
                )}

                {/* Clustered Duplicates Section */}
                {(() => {
                  const duplicates = complaints.filter(c => c.parentComplaintId === selectedComplaint.complaintId);
                  if (duplicates.length === 0) return null;
                  return (
                    <div style={{ marginBottom: "20px", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "8px", background: "rgba(239, 68, 68, 0.02)", padding: "16px" }}>
                      <span style={{ ...styles.modalLabel, color: "#f87171", fontWeight: "800", display: "block", marginBottom: "8px" }}>
                        🚨 Clustered Duplicate Reports ({duplicates.length})
                      </span>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "150px", overflowY: "auto" }}>
                        {duplicates.map(dup => (
                          <div key={dup._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(0,0,0,0.2)", padding: "8px 12px", borderRadius: "6px", fontSize: "13px" }}>
                            <div>
                              <strong>{dup.userId?.name || "Anonymous"}</strong> ({dup.userId?.email || "No Email"})
                              <span style={{ display: "block", fontSize: "11px", color: "var(--text-secondary)" }}>ID: {dup.complaintId} | Registered: {new Date(dup.createdAt).toLocaleString()}</span>
                            </div>
                            <span style={{ fontSize: "11px", background: "rgba(255,255,255,0.1)", padding: "2px 6px", borderRadius: "4px" }}>{dup.status}</span>
                          </div>
                        ))}
                      </div>
                      <p style={{ margin: "10px 0 0 0", fontSize: "11px", color: "var(--text-secondary)", fontStyle: "italic" }}>
                        *Resolving this parent grievance will automatically mark all duplicate reports above as Resolved.
                      </p>
                    </div>
                  );
                })()}

                {/* Row 7: Location & Date */}
                <div className="grid-2" style={{ gap: "20px", marginBottom: "20px" }}>
                  <div>
                    <span style={styles.modalLabel}>Location / Area of Problem</span>
                    <span style={{ fontWeight: "600", color: "var(--text-primary)", display: "block" }}>📍 {selectedComplaint.location || "Not Specified"}</span>
                  </div>
                  <div>
                    <span style={styles.modalLabel}>Registration Date</span>
                    <span style={{ display: "block" }}>{new Date(selectedComplaint.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                {/* Row 8: Translation Status */}
                <div style={{ marginBottom: "20px" }}>
                  <span style={styles.modalLabel}>Translation Status</span>
                  <span style={{ fontSize: "12px", background: "rgba(255,255,255,0.05)", padding: "4px 8px", borderRadius: "4px", display: "inline-block" }}>
                    {selectedComplaint.translationStatus || "Not Required"}
                  </span>
                </div>

                {/* Row 9: Resolution Notes / Reply */}
                {selectedComplaint.reply && (
                  <div style={{ marginTop: "20px", padding: "16px", background: "rgba(16, 185, 129, 0.05)", border: "1px solid rgba(16, 185, 129, 0.2)", borderRadius: "8px" }}>
                    <h4 style={{ color: "var(--color-completed)", margin: "0 0 8px 0" }}>📢 Redressal Reply / Actions Taken</h4>
                    <p style={{ margin: 0, fontSize: "14px", color: "var(--text-primary)" }}>{selectedComplaint.reply}</p>
                  </div>
                )}
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px", borderTop: "1px solid var(--border-light)", paddingTop: "15px" }}>
                <button onClick={() => setActiveModal("")} style={{ padding: "10px 20px" }}>Close Details</button>
              </div>
            </div>
          </div>
        )}

        {/* Officer Profile Editor Modal Overlay */}
        {activeModal === "officer-editor" && selectedOfficer && (
          <div style={styles.overlay}>
            <div className="card" style={{ ...styles.modalCard, maxWidth: "550px" }}>
              <h3>💼 Edit Officer Profile</h3>
              <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "20px" }}>
                Officer: <strong>{selectedOfficer.name}</strong> ({selectedOfficer.email})
              </p>

              <form onSubmit={handleUpdateOfficerProfile}>
                <div style={{ marginBottom: "15px" }}>
                  <label style={styles.modalLabel}>Designation / Professional Title</label>
                  <input
                    type="text"
                    value={officerForm.designation}
                    onChange={(e) => setOfficerForm({ ...officerForm, designation: e.target.value })}
                    placeholder="e.g. Senior Executive Officer"
                    style={{ margin: "5px 0 0 0" }}
                    required
                  />
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <label style={styles.modalLabel}>Office Branch / Room Location</label>
                  <input
                    type="text"
                    value={officerForm.officeLocation}
                    onChange={(e) => setOfficerForm({ ...officerForm, officeLocation: e.target.value })}
                    placeholder="e.g. Room 402, Block A"
                    style={{ margin: "5px 0 0 0" }}
                    required
                  />
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <label style={styles.modalLabel}>Salary (Monthly / Annual in ₹)</label>
                  <input
                    type="number"
                    value={officerForm.salary}
                    onChange={(e) => setOfficerForm({ ...officerForm, salary: parseInt(e.target.value) || 0 })}
                    placeholder="e.g. 75000"
                    style={{ margin: "5px 0 0 0" }}
                    required
                  />
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <label style={styles.modalLabel}>Employment Status</label>
                  <select
                    value={officerForm.status}
                    onChange={(e) => setOfficerForm({ ...officerForm, status: e.target.value })}
                    style={{ margin: "5px 0 0 0" }}
                  >
                    <option value="Active">🟢 Active / On Duty</option>
                    <option value="On Leave">🟡 On Leave</option>
                    <option value="Suspended">🔴 Suspended</option>
                    <option value="Retired">⚪ Retired</option>
                  </select>
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <label style={styles.modalLabel}>Controlled Departments</label>
                  <div style={{
                    maxHeight: "150px",
                    overflowY: "auto",
                    border: "1px solid var(--border-light)",
                    borderRadius: "6px",
                    padding: "10px",
                    marginTop: "5px",
                    backgroundColor: "rgba(0,0,0,0.2)"
                  }}>
                    {departmentsList.filter(dept => user?.role === "superadmin" || (user?.departments && user.departments.includes(dept.departmentName))).map(dept => {
                      const isChecked = officerForm.departments.includes(dept.departmentName);
                      return (
                        <label key={dept._id} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", cursor: "pointer", fontSize: "14px", color: "var(--text-primary)" }}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setOfficerForm({
                                  ...officerForm,
                                  departments: [...officerForm.departments, dept.departmentName]
                                });
                              } else {
                                setOfficerForm({
                                  ...officerForm,
                                  departments: officerForm.departments.filter(d => d !== dept.departmentName)
                                });
                              }
                            }}
                            style={{ width: "16px", height: "16px", cursor: "pointer" }}
                          />
                          {dept.departmentName}
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button type="submit" style={{ flex: 1 }}>Save Profile</button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setActiveModal("")}
                    style={{ flex: 1, marginLeft: "8px" }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Create Officer Modal Overlay */}
        {activeModal === "create-officer" && (
          <div style={styles.overlay}>
            <div className="card" style={{ ...styles.modalCard, maxWidth: "550px", maxHeight: "90vh", overflowY: "auto" }}>
              <h3>➕ Add New Officer</h3>
              <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "20px" }}>
                Register a new administrative officer profile with access credentials and department controls.
              </p>

              <form onSubmit={handleCreateOfficer}>
                <div style={{ marginBottom: "15px" }}>
                  <label style={styles.modalLabel}>Full Name</label>
                  <input
                    type="text"
                    value={createOfficerForm.name}
                    onChange={(e) => setCreateOfficerForm({ ...createOfficerForm, name: e.target.value })}
                    placeholder="e.g. Rajesh Kumar"
                    style={{ margin: "5px 0 0 0" }}
                    required
                  />
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <label style={styles.modalLabel}>Email Address</label>
                  <input
                    type="email"
                    value={createOfficerForm.email}
                    onChange={(e) => setCreateOfficerForm({ ...createOfficerForm, email: e.target.value })}
                    placeholder="e.g. rajesh@grievance.gov.in"
                    style={{ margin: "5px 0 0 0" }}
                    required
                  />
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <label style={styles.modalLabel}>Login Password</label>
                  <input
                    type="password"
                    value={createOfficerForm.password}
                    onChange={(e) => setCreateOfficerForm({ ...createOfficerForm, password: e.target.value })}
                    placeholder="Choose a strong password"
                    style={{ margin: "5px 0 0 0" }}
                    required
                  />
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <label style={styles.modalLabel}>Phone Number</label>
                  <input
                    type="text"
                    value={createOfficerForm.phone}
                    onChange={(e) => setCreateOfficerForm({ ...createOfficerForm, phone: e.target.value })}
                    placeholder="e.g. +91 9876543210"
                    style={{ margin: "5px 0 0 0" }}
                  />
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <label style={styles.modalLabel}>Designation / Professional Title</label>
                  <input
                    type="text"
                    value={createOfficerForm.designation}
                    onChange={(e) => setCreateOfficerForm({ ...createOfficerForm, designation: e.target.value })}
                    placeholder="e.g. Assistant Engineer"
                    style={{ margin: "5px 0 0 0" }}
                    required
                  />
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <label style={styles.modalLabel}>Office Branch / Room Location</label>
                  <input
                    type="text"
                    value={createOfficerForm.officeLocation}
                    onChange={(e) => setCreateOfficerForm({ ...createOfficerForm, officeLocation: e.target.value })}
                    placeholder="e.g. Block B, Room 102"
                    style={{ margin: "5px 0 0 0" }}
                    required
                  />
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <label style={styles.modalLabel}>Monthly Salary (₹)</label>
                  <input
                    type="number"
                    value={createOfficerForm.salary}
                    onChange={(e) => setCreateOfficerForm({ ...createOfficerForm, salary: parseInt(e.target.value) || 0 })}
                    placeholder="e.g. 50000"
                    style={{ margin: "5px 0 0 0" }}
                    required
                  />
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <label style={styles.modalLabel}>Controlled Departments</label>
                  <div style={{
                    maxHeight: "150px",
                    overflowY: "auto",
                    border: "1px solid var(--border-light)",
                    borderRadius: "6px",
                    padding: "10px",
                    marginTop: "5px",
                    backgroundColor: "rgba(0,0,0,0.2)"
                  }}>
                    {departmentsList.filter(dept => user?.role === "superadmin" || (user?.departments && user.departments.includes(dept.departmentName))).map(dept => {
                      const isChecked = createOfficerForm.departments.includes(dept.departmentName);
                      return (
                        <label key={dept._id} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", cursor: "pointer", fontSize: "14px", color: "var(--text-primary)" }}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setCreateOfficerForm({
                                  ...createOfficerForm,
                                  departments: [...createOfficerForm.departments, dept.departmentName]
                                });
                              } else {
                                setCreateOfficerForm({
                                  ...createOfficerForm,
                                  departments: createOfficerForm.departments.filter(d => d !== dept.departmentName)
                                });
                              }
                            }}
                            style={{ width: "16px", height: "16px", cursor: "pointer" }}
                          />
                          {dept.departmentName}
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button type="submit" style={{ flex: 1 }}>Create Officer</button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setActiveModal("")}
                    style={{ flex: 1, marginLeft: "8px" }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

const styles = {
  header: {
    borderBottom: "1px solid var(--border-light)",
    paddingBottom: "20px",
    marginBottom: "30px",
  },
  statCard: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: "24px 30px",
    marginBottom: 0,
  },
  priorityCard: {
    display: "flex",
    flexDirection: "column",
    padding: "20px 24px",
    marginBottom: 0,
  },
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
    padding: "20px",
  },
  modalCard: {
    maxWidth: "500px",
    width: "100%",
    backgroundColor: "var(--bg-secondary)",
    border: "1px solid var(--border-focus)",
    padding: "30px",
    boxShadow: "0 20px 50px rgba(0, 0, 0, 0.6)",
    marginBottom: 0,
  },
  modalLabel: {
    fontSize: "13px",
    fontWeight: "700",
    color: "var(--text-secondary)",
    display: "block",
  }
};
