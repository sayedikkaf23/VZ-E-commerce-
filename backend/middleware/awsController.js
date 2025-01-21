// controllers/awsController.js
const AWS = require('aws-sdk');
const multer = require('multer');
require('dotenv').config();

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION_NAME
});

const s3 = new AWS.S3();

// Configure a 1MB size limit
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 1 * 1024 * 1024 }, // 1 MB
});

exports.uploadFileToS3 = (req, res) => {
  // 1. Run the Multer middleware (single file) inside this function:
  upload.single('file')(req, res, async (err) => {
    // 2. If Multer threw an error (ex: too large)
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File size cannot exceed 1MB' });
      }
      // Some other Multer error
      return res.status(400).json({ error: err.message });
    }

    // 3. If no file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // 4. Proceed with S3 upload if no errors so far
    try {
      const file = req.file;
      const fileName = `${Date.now()}-${file.originalname}`;

      const s3Params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `uploads/${fileName}`,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read'
      };

      const data = await s3.upload(s3Params).promise();
      return res.status(200).json({ url: data.Location });
    } catch (uploadError) {
      console.error('Error uploading file:', uploadError);
      return res.status(500).json({ error: 'Failed to upload file' });
    }
  });
};
