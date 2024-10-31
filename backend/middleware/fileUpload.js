const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads'); // Ensure this path exists
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  }
});

const upload = multer({ storage: storage });

module.exports = {
  multipleUpload: upload.any(), // Accept any file field
  singleUpload: upload.single('icon')
};
