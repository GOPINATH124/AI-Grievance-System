const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema({
  adminName: {
    type: String,
    required: true
  },
  adminEmail: {
    type: String,
    required: true
  },
  action: {
    type: String,
    required: true
  },
  target: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("AuditLog", auditLogSchema);
