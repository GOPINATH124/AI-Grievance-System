const { clerkClient } = require("@clerk/clerk-sdk-node");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

const protect = async (req, res, next) => {
  try {
    let token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({
        message: "No token"
      });
    }

    token = token.split(" ")[1];

    // 1. Try verifying via local JWT first
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded && decoded.id) {
        const user = await User.findById(decoded.id);
        if (user) {
          req.user = user;
          return next();
        }
      }
    } catch (localJwtErr) {
      // Local JWT verification failed, proceed to Clerk checking
    }

    // 2. Try verifying via Clerk
    try {
      let clerkId;
      try {
        const decoded = await clerkClient.verifyToken(token);
        clerkId = decoded.sub;
      } catch (tokenErr) {
        console.warn("[Auth Middleware] Clerk verifyToken failed. Attempting local decode fallback for development...", tokenErr.message);
        const decoded = jwt.decode(token);
        if (decoded && decoded.sub) {
          clerkId = decoded.sub;
        } else {
          throw tokenErr;
        }
      }

      // Find local user or sync from Clerk
      let user = await User.findOne({ clerkId });
      let phone = "";
      let email = "";
      let name = "Citizen";

      try {
        const decoded = jwt.decode(token);
        email = decoded?.email || "";
        name = decoded?.name || decoded?.given_name || "Citizen";
      } catch (e) {}

      if (!user) {
        console.log(`[Auth Middleware] User ${clerkId} not found in DB. Syncing from Clerk...`);
        try {
          const clerkUser = await clerkClient.users.getUser(clerkId);
          email = clerkUser.emailAddresses?.[0]?.emailAddress || email;
          name = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || name;
          phone = clerkUser.phoneNumbers?.[0]?.phoneNumber || "";
        } catch (apiErr) {
          console.warn("[Auth Middleware] Failed to get user details from Clerk API. Using decoded token claims.", apiErr.message);
        }

        if (!email) {
          email = `user_${clerkId.slice(-6)}@example.com`;
        }

        user = await User.create({
          clerkId,
          name,
          email,
          phone,
          language: "English",
          role: "citizen"
        });
        console.log(`[Auth Middleware] User successfully synced:`, user._id);
      } else {
        // Update phone number if local DB phone is empty and exists in Clerk
        let updated = false;
        try {
          const clerkUser = await clerkClient.users.getUser(clerkId);
          const clerkPhone = clerkUser.phoneNumbers?.[0]?.phoneNumber;
          if (clerkPhone && !user.phone) {
            user.phone = clerkPhone;
            updated = true;
          }
        } catch (err) {}

        const decoded = jwt.decode(token);
        if ((user.name.startsWith("clerk_") || user.name === "Citizen") && (decoded?.name || decoded?.given_name)) {
          user.name = decoded.name || decoded.given_name;
          updated = true;
        }

        if (updated) {
          await user.save();
        }
      }

      req.user = user;
      next();
    } catch (clerkError) {
      console.error("[Auth Middleware Clerk Error]:", clerkError.message);
      return res.status(401).json({
        message: "Invalid Token"
      });
    }
  } catch (error) {
    console.error("[Auth Middleware Error]:", error.message);
    res.status(401).json({
      message: "Invalid Token"
    });
  }
};

const protectAdmin = async (req, res, next) => {
  await protect(req, res, () => {
    if (req.user && (req.user.role === "admin" || req.user.role === "superadmin")) {
      next();
    } else {
      res.status(403).json({
        message: "Forbidden: Admin access required"
      });
    }
  });
};

module.exports = protect;
module.exports.protect = protect;
module.exports.protectAdmin = protectAdmin;