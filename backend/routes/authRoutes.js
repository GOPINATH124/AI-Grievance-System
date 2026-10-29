const express = require("express");
const router = express.Router();
const { register, login, forgotPassword, changePassword, updateProfile } = require("../controllers/authController");
const protect = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.put("/change-password", protect, changePassword);
router.put("/profile", protect, updateProfile);

// Clerk auth profile routes
router.get("/me", protect, (req, res) => {
  res.json(req.user);
});

router.put("/update-language", protect, async (req, res) => {
  try {
    req.user.language = req.body.language || "English";
    await req.user.save();
    res.json({ message: "Language updated successfully", user: req.user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;