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

const upload = multer({ storage: storage });

// Export the multer middleware for file uploads
module.exports = upload.fields([
    { name: 'passport', maxCount: 1 },  // Single passport file
    { name: 'salaryStatements', maxCount: 3 }  // Multiple salary statements (up to 3)
]);
