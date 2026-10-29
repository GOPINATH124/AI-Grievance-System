const express = require("express");
const router = express.Router();
const { handleIncomingCall, processCallInput, getCallLogs } = require("../controllers/ivrController");

router.post("/incoming", handleIncomingCall);
router.post("/process-input", processCallInput);
router.get("/logs", getCallLogs);

module.exports = router;
