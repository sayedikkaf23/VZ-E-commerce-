const UserDetails = require('../models/userDetails');
const fileUpload = require('../middleware/fileUpload'); // Import the multer middleware
const Service = require('../models/service');

// Handle form submission and file uploads
exports.submit = async (req, res) => {
    try {
        console.log('Files:', req.files);  // Log req.files for debugging

        const { firstName, lastName, email, nationality,nationalityfile, birthday, working, salary, emiratesId } = req.body;
console.log(req.body)
        // Handle file uploads
        const passportCopy = req.files['passport'] ? req.files['passport'][0].path : '';
        const salaryStatements = req.files['salaryStatements'] ? req.files['salaryStatements'].map(file => file.path) : [];

        // Create and save user details
        const userDetails = new UserDetails({
            firstName,
            lastName,
            email,
            nationality,
            nationalityfile,
            birthday,
            working,
            salary,
            emiratesId,
            passportCopy,
            salaryStatements
        });

        await userDetails.save();
        res.status(201).json({ message: 'Details submitted successfully', userDetails });
    } catch (error) {
        res.status(500).json({ error: 'Error saving details', details: error.message });
    }
};

exports.submitService = async (req, res) => {
    try {
        const { serviceName, description, isActive } = req.body;

        // Check if a service with the same name already exists
        const existingService = await Service.findOne({ serviceName });
        if (existingService) {
            return res.status(400).json({ 
                error: 'Duplicate entry', 
                message: `A service with the name '${serviceName}' already exists.` 
            });
        }

        // Log the uploaded file to confirm file upload
        console.log('Uploaded file:', req.file);

        // Handle file upload for service icon
        const serviceIcon = req.file ? req.file.path : '';  // Use req.file for single file uploads

        // Create and save new service
        const newService = new Service({
            serviceName,
            description,
            isActive: isActive || true,  // Defaults to true if not provided
            icon: serviceIcon  // Save the file path
        });

        const savedService = await newService.save();
        res.status(201).json({ message: 'Service created successfully', service: savedService });
    } catch (error) {
        res.status(500).json({ error: 'Error creating service', details: error.message });
    }
};


exports.getAllServices = async (req, res) => {
    try {
        const services = await Service.find(); // Fetch all services from the database
        res.status(200).json(services); // Send back all services as JSON
    } catch (error) {
        res.status(500).json({ error: 'Error fetching services', details: error.message });
    }
};
