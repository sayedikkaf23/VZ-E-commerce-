const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Ensure you are using MONGODB_URI from .env
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB connected: ${conn.connection.host}`);
    } catch (err) {
        console.error(`MongoDB connection error: ${err.message}`);
        process.exit(1); // Exit with failure
    }
};

module.exports = connectDB;
