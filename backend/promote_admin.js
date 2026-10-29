const mongoose = require("mongoose");
const User = require("./models/User");

const MONGO_URL = process.env.MONGO_URL || process.env.MONGO_URI || "mongodb://127.0.0.1:27017/AI-Grievance-DB";

mongoose.connect(MONGO_URL)
  .then(async () => {
    console.log("Connected to MongoDB successfully.");
    
    const emails = ["abinav@gmail.com", "superadmin@service.gov.in"];
    for (const emailToPromote of emails) {
      const user = await User.findOne({ email: emailToPromote });
      if (user) {
        user.role = "superadmin";
        await user.save();
        console.log(`Successfully promoted ${user.name} (${user.email}) to role "superadmin"!`);
      } else {
        console.log(`User with email ${emailToPromote} not found in database.`);
      }
    }
    process.exit(0);
  })
  .catch(err => {
    console.error("Error promoting user:", err.message);
    process.exit(1);
  });
