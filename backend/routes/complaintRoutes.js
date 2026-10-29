const express = require("express");

const router = express.Router();


const protect =
require("../middleware/authMiddleware");


const {
  createComplaint,
  getComplaints,
  trackComplaint,
  getNotifications,
  readNotifications,
  submitFeedback,
  appealComplaint,
  submitClarification,
  getPublicGrievances,
  subscribeToGrievance,
  geocodeAddress
} = require("../controllers/complaintController");

router.post(
  "/create",
  protect,
  createComplaint
);

router.post(
  "/:id/feedback",
  protect,
  submitFeedback
);

router.post(
  "/:id/appeal",
  protect,
  appealComplaint
);

router.post(
  "/:id/clarify",
  protect,
  submitClarification
);



router.get(
"/my",
protect,
getComplaints
);



router.get(
"/track/:id",
protect,
trackComplaint
);

router.get(
"/notifications",
protect,
getNotifications
);

router.put(
"/notifications/read",
protect,
readNotifications
);



router.get(
  "/public-list",
  protect,
  getPublicGrievances
);

router.post(
  "/:id/subscribe",
  protect,
  subscribeToGrievance
);

router.post(
  "/geocode",
  protect,
  geocodeAddress
);

module.exports=router;