const mongoose = require("mongoose");

const departmentComplaintSchema = new mongoose.Schema({
  complaintId: {
    type: String,
    required: true,
    unique: true
  },
  citizenName: {
    type: String,
    required: true
  },
  complaintType: {
    type: String,
    default: "General"
  },
  priority: {
    type: String,
    default: "Medium"
  },
  department: {
    type: String,
    required: true
  },
  assignedOfficer: {
    type: String,
    default: "Unassigned"
  },
  status: {
    type: String,
    default: "New" // New, Assigned, Processing, Resolved, Closed
  },
  slaDeadline: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("DepartmentComplaint", departmentComplaintSchema);
