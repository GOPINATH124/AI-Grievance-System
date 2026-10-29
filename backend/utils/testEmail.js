require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const { sendEmail } = require("./emailService");

(async () => {
  console.log("Starting Gmail SMTP diagnostics...");
  console.log("Current credentials in .env:");
  console.log("EMAIL_USER:", process.env.EMAIL_USER);
  console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "******" : "MISSING");
  
  const recipient = "gopinathgopinathp908@gmail.com";
  console.log(`\nAttempting to send real test email to: ${recipient}...`);
  
  try {
    const result = await sendEmail(recipient, "LokSeva Live Email Diagnostic Test", "Connection test successful! Your Nodemailer config is working.");
    console.log("\nDiagnostic Result:", result);
  } catch (err) {
    console.error("\nDiagnostic Error thrown:", err);
  }
})();
