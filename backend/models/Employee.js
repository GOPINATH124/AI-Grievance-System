const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: "Technician" // Department Head, Engineer, Officer, Technician, Field Worker, Supervisor, Data Entry Operator
  },
  salary: {
    type: Number,
    default: 25000
  },
  shift: {
    type: String,
    default: "9 AM - 5 PM"
  },
  availability: {
    type: String,
    default: "Available" // Available, Busy, On Leave
  },
  performance: {
    type: Number,
    default: 5
  },
  contactImage: {
    type: String,
    default: ""
  },
  contactDetails: {
    type: String,
    default: ""
  },
  address: {
    type: String,
    default: ""
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Employee", employeeSchema);
