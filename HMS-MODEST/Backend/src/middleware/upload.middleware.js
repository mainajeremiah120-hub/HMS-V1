import multer from "multer";

// Use memory storage to upload straight to Cloudinary/local fallback via streams
const storage = multer.memoryStorage();

// File filter to restrict uploads to standard image file formats
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/bmp",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPG, PNG, WEBP, GIF, and BMP images are allowed!"), false);
  }
};

// Multer upload middleware configuration (max 10MB per file, max 10 files per request)
export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit per image
  },
});
