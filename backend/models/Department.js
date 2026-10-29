const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema({
  departmentId: {
    type: String,
    required: true,
    unique: true
  },
  departmentName: {
    type: String,
    required: true,
    unique: true
  },
  headOfficer: {
    type: String,
    default: "Officer"
  },
  contact: {
    type: String,
    default: ""
  },
  employees: {
    type: Number,
    default: 0
  },
  salary: {
    type: String,
    default: ""
  },
  workingHours: {
    type: String,
    default: "9 AM - 5 PM"
  },
  sla: {
    type: String,
    default: "48 Hours"
  },
  complaints: {
    type: Number,
    default: 0
  },
  performance: {
    type: Number,
    default: 5
  },
  status: {
    type: String,
    default: "Active"
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Department", departmentSchema);
