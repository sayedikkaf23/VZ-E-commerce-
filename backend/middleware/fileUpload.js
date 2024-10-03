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

// Initialize multer with the storage configuration and fields expected
const upload = multer({ storage: storage }).fields([
    { name: 'passport', maxCount: 1 },  // This expects a single file for passport
    { name: 'salaryStatements', maxCount: 3 }  // This expects up to 3 files for salary statements
]);

// Export the multer middleware for file uploads
module.exports = upload;




