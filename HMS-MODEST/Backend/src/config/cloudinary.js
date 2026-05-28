import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const isCloudinaryConfigured = 
  process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_API_KEY && 
  process.env.CLOUDINARY_API_SECRET;

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log("☁️ Cloudinary successfully configured.");
} else {
  console.warn("⚠️ WARNING: Cloudinary credentials missing. Falling back to backend local storage.");
}

/**
 * Uploads a file buffer. If Cloudinary is configured, uploads to Cloudinary.
 * Otherwise, saves to a local uploads directory.
 * 
 * @param {Buffer} fileBuffer 
 * @param {string} originalname 
 * @returns {Promise<string>} The secure_url or local URL path
 */
export const uploadImageStream = (fileBuffer, originalname) => {
  return new Promise((resolve, reject) => {
    if (isCloudinaryConfigured) {
      // Stream upload to Cloudinary
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "radiology_scans" },
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload failed, attempting local fallback:", error);
            // If Cloudinary stream fails, fall back to local storage
            saveLocal(fileBuffer, originalname).then(resolve).catch(reject);
          } else {
            resolve(result.secure_url);
          }
        }
      );
      uploadStream.end(fileBuffer);
    } else {
      // Direct local storage fallback
      saveLocal(fileBuffer, originalname).then(resolve).catch(reject);
    }
  });
};

/**
 * Saves a file buffer locally to the uploads directory
 */
const saveLocal = async (fileBuffer, originalname) => {
  try {
    const uploadDir = path.resolve("uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileExt = path.extname(originalname) || ".jpg";
    const uniqueName = `${crypto.randomBytes(16).toString("hex")}${fileExt}`;
    const filePath = path.join(uploadDir, uniqueName);

    fs.writeFileSync(filePath, fileBuffer);
    
    // Return local URL. The port matches server PORT (default 5000)
    const port = process.env.PORT || 5000;
    return `http://localhost:${port}/uploads/${uniqueName}`;
  } catch (error) {
    console.error("Local file save failed:", error);
    throw error;
  }
};
