const jwt = require('jsonwebtoken');
const Admin = require('../models/adminModel'); // Importing the admin model

// Authorization middleware for admin routes
const adminAuth = async (req, res, next) => {
    try {
        const authHeaders = req.headers.authorization; // Extracting authorization headers from request
        if (!authHeaders || !authHeaders.split(' ')[1]) { // Checking if authorization headers are present and contain a token
            return res.status(401).json({ message: 'Not Authorized' });
        }

        const token = authHeaders.split(' ')[1];
        const decoded = jwt.verify(token, process.env.ADMIN_SECRET); // Verifying the token using user secret
        const adminData = await Admin.findOne({ _id: decoded.payload.id }); // Finding admin data based on decoded token

        if (!adminData) {
            return res.status(401).json({ message: 'Admin not found' });
        }

        // req.body.userId = adminData._id;
        req.session.userId = adminData._id; // Adding user ID to session for further processing
        next();
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

module.exports = adminAuth