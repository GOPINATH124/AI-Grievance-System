const sendSMS = async (toPhone, message) => {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER || process.env.TWILIO_NUMBER;

  const hasTwilio = sid && token && from && !sid.startsWith("your_") && sid !== "";

  if (hasTwilio) {
    try {
      const twilio = require("twilio");
      const client = twilio(sid, token);
      const cleanPhone = toPhone.startsWith("+") ? toPhone : `+91${toPhone}`;
      const isWhatsApp = from.startsWith("whatsapp:");
      
      const res = await client.messages.create({
        body: message,
        from: from,
        to: isWhatsApp ? `whatsapp:${cleanPhone}` : cleanPhone
      });
      console.log(`[SMS Gateway] Real ${isWhatsApp ? "WhatsApp" : "SMS"} sent to ${cleanPhone} SID: ${res.sid}`);
      return { success: true, sid: res.sid };
    } catch (err) {
      console.error("[SMS Gateway] Twilio SMS failed, falling back to simulation:", err.message);
    }
  }

  // Fallback Simulation Mode
  console.log("\n==================================================");
  console.log(`📱 [SMS GATEWAY SIMULATION]`);
  console.log(`✉️ TO: ${toPhone}`);
  console.log(`💬 MESSAGE: ${message}`);
  console.log("==================================================\n");
  return { success: true, simulated: true };
};

module.exports = { sendSMS };
