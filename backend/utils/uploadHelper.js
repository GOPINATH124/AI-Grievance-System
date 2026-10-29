const fs = require("fs");
const path = require("path");

/**
 * Saves a base64 encoded image to the uploads directory.
 * @param {string} base64Data - The base64 data string (can be a raw base64 or a data URI)
 * @returns {string} - The relative URL path to the saved file (e.g., '/uploads/img_178239023.png')
 */
const saveBase64Image = (base64Data) => {
  if (!base64Data || typeof base64Data !== "string") {
    return "";
  }

  try {
    // Check if it's a Data URL (e.g., "data:image/png;base64,iVBORw...")
    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let mimeType = "image/png";
    let base64String = base64Data;

    if (matches && matches.length === 3) {
      mimeType = matches[1];
      base64String = matches[2];
    }

    // Determine file extension
    let extension = "png";
    if (mimeType.includes("jpeg") || mimeType.includes("jpg")) {
      extension = "jpg";
    } else if (mimeType.includes("gif")) {
      extension = "gif";
    } else if (mimeType.includes("webp")) {
      extension = "webp";
    }

    const buffer = Buffer.from(base64String, "base64");
    const filename = `grievance_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}.${extension}`;
    
    const uploadsDir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filePath = path.join(uploadsDir, filename);
    fs.writeFileSync(filePath, buffer);

    return `/uploads/${filename}`;
  } catch (error) {
    console.error("[Upload Helper Error] Failed to save base64 image:", error);
    return "";
  }
};

module.exports = {
  saveBase64Image
};
