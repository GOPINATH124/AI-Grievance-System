const express=require("express");

const router=express.Router();
const { protectAdmin } = require("../middleware/authMiddleware");

const {
  generateComplaint,
  suggestResolution
}=require("../ai/aiController");

router.post(
  "/generate",
  generateComplaint
);

router.post(
  "/suggest-resolution",
  protectAdmin,
  suggestResolution
);

module.exports=router;