import multer from "multer";

const storage = multer.memoryStorage();

 export const upload = multer({
  storage,
  limits: {
    fileSize: 1 * 1024 * 1024, // 🔥 1MB ONLY (important)
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("Only image files are allowed"), false);
    } else {
      cb(null, true);
    }
  },
});

export const Multipleupload = multer({
  storage,
  limits: { 
    fileSize: 2 * 1024 * 1024, // 🔥 2MB per file
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("Only image files are allowed"), false);
    } else {
      cb(null, true);
    }
  },
});

export default upload;
