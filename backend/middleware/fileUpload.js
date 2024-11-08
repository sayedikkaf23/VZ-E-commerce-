// middleware/fileUpload.js
const multer = require('multer');
const path = require('path');

// Configure storage for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads'); // Ensure this directory exists
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Generate a unique filename
  }
});

// Initialize multer with storage configuration
const upload = multer({ storage: storage });

module.exports = {
  multipleUpload: upload.any(), // Allow multiple files from any field
  singleUpload: upload.single('icon') // For single file uploads (optional)
};
