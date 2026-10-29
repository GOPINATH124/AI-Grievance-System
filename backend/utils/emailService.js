const sendEmail = async (toEmail, subject, body) => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  const hasCredentials = user && pass && !user.startsWith("your_") && user !== "";

  if (hasCredentials) {
    try {
      const nodemailer = require("nodemailer");
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user, pass }
      });

      const mailOptions = {
        from: `"LokSeva Grievance System" <${user}>`,
        to: toEmail,
        subject: subject,
        text: body
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`[Email Gateway] Real email sent to ${toEmail} ID: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (err) {
      console.error("[Email Gateway] Nodemailer failed, falling back to simulation:", err.message);
    }
  }

  // Fallback Simulation Mode
  console.log("\n==================================================");
  console.log(`📧 [EMAIL GATEWAY SIMULATION]`);
  console.log(`✉️ TO: ${toEmail}`);
  console.log(`📝 SUBJECT: ${subject}`);
  console.log(`💬 MESSAGE:`);
  console.log(body);
  console.log("==================================================\n");
  return { success: true, simulated: true };
};

module.exports = { sendEmail };
