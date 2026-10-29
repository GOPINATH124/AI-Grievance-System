require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const { sendSMS } = require("./smsService");

(async () => {
  console.log("Starting Twilio SMS diagnostics...");
  console.log("Current credentials in .env:");
  console.log("TWILIO_ACCOUNT_SID:", process.env.TWILIO_ACCOUNT_SID);
  console.log("TWILIO_AUTH_TOKEN:", process.env.TWILIO_AUTH_TOKEN ? "******" : "MISSING");
  console.log("TWILIO_PHONE_NUMBER:", process.env.TWILIO_PHONE_NUMBER);
  
  const recipient = "+919751317746";
  console.log(`\nAttempting to send real test SMS to: ${recipient}...`);
  
  try {
    const result = await sendSMS(recipient, "LokSeva Live Twilio Diagnostic SMS: Connection test successful!");
    console.log("\nDiagnostic Result:", result);
  } catch (err) {
    console.error("\nDiagnostic Error thrown:", err);
  }
})();
