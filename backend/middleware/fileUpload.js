const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads'); // Specify the upload directory
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Rename the file with a timestamp
    }
});

// Initialize multer
const upload = multer({ storage: storage });

// Export the middleware
module.exports = {
    multipleUpload: upload.fields([
        { name: 'passport', maxCount: 1 },
        { name: 'salaryStatements', maxCount: 3 }
    ]),
    singleUpload: upload.single('icon')
};
