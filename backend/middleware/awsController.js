// controllers/awsController.js
const AWS = require('aws-sdk');
const multer = require('multer');
require('dotenv').config();

// Configure AWS SDK
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION_NAME
});

const s3 = new AWS.S3();

// Set up multer for handling file uploads in memory (you can change it to diskStorage if needed)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Function to handle file upload to S3 and return the URL
exports.uploadFileToS3 = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const file = req.file;
  const fileName = `${Date.now()}-${file.originalname}`;

  // Define S3 upload parameters
  const s3Params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `uploads/${fileName}`, // Save the file in the "uploads" directory in S3
    Body: file.buffer, // File content
    ContentType: file.mimetype, // File type
    ACL: 'public-read' // Set access to public
  };

  try {
    // Upload the file to S3
    const data = await s3.upload(s3Params).promise();

    // Return the file URL
    res.status(200).json({ url: data.Location });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
};

// Export the multer upload middleware so it can be used in the route
exports.multerUpload = upload.single('file'); // 'file' is the field name in the form
