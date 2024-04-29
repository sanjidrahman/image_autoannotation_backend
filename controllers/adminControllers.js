const Admin = require('../models/adminModel'); // Importing the admin model
const Image = require('../models/imageModel'); // Importing the image model
const User = require('../models/userModel'); // Importing the user model
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { parseData } = require('../config/export'); // Importing the function for parsing the data

// Function for hashing passwords securely
const securepassword = async (password) => {
    try {
        const securepassword = await bcrypt.hash(password, 10)
        return securepassword
    } catch (err) {
        console.log(err.message);
    }
}

// Admin signup functionality
const signup = async (req, res) => {
    try {
        const { email, password, confirmpass } = req.body
        const existingUser = await Admin.findOne({ email: email })

        if (existingUser) {
            return res.status(409).json({ message: 'User already exists' })
        }

        if (password != confirmpass) {
            return res.status(404).json({ message: `Password and confirm password doesn't match` })
        }

        const spassword = await securepassword(password); // Hashing the password securely

        const newUser = await Admin.create({
            email: email,
            password: spassword,
        })
        const createdUser = await newUser.save()

        const payload = { id: createdUser._id, role: 'admin' }; // Creating payload for JWT token
        const token = jwt.sign({ payload }, process.env.ADMIN_SECRET); // Generating JWT token

        return res.status(201).json({ message: 'Success', token })

    } catch (err) {
        console.log(err.message);
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}

// Admin login functionality 
const signin = async (req, res) => {
    try {
        const { email, password } = req.body
        const existingUser = await Admin.findOne({ email: email })

        if (!existingUser) {
            return res.status(404).json({ message: 'User not found, Please register!' })
        }

        const encpass = await bcrypt.compare(password, existingUser.password); // Comparing hashed passwords
        if (!encpass) {
            return res.status(401).json({ message: 'Email or Password incorrect' })
        }

        const payload = { id: existingUser._id, role: 'admin' }; // Creating payload for JWT token
        const token = jwt.sign({ payload }, process.env.ADMIN_SECRET); // Generating JWT token

        return res.status(200).json({ message: 'Success', token })

    } catch (err) {
        res.status(500).json({ message: 'Internal Server Error' })
    }
}

// Function for blocking user access
const blockUser = async (req, res) => {
    try {
        const u_id = req.params.id
        await User.updateOne({ _id: u_id }, { $set: { isBlocked: true } })
        res.status(200).json({ message: 'Blocked user' })
    } catch (err) {
        res.status(500).json({ message: 'Internal Server Error' })
    }
}

// Function for unblocking user access
const unblockUser = async (req, res) => {
    try {
        const u_id = req.params.id
        await User.updateOne({ _id: u_id }, { $set: { isBlocked: false } })
        res.status(200).json({ message: 'Unblocked user' })
    } catch (err) {
        res.status(500).json({ message: 'Internal Server Error' })
    }
}

// Function to get all images uploaded by a particular user
const userImages = async (req, res) => {
    try {
        const userId = req.params.id
        const userImages = await Image.find({ userId })
        return res.status(200).json(userImages)
    } catch (err) {
        console.log(err.message);
        res.status(500).json({ message: 'Internal Server Error' })
    }
}

// Function to retrieve all users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({})
        return res.status(200).json(users)
    } catch (err) {
        console.log(err.message);
        res.status(500).json({ message: 'Internal Server Error' })
    }
}

// Function to retrieve all uploaded images
const getAllImage = async (req, res) => {
    try {
        const images = await Image.find({})
        return res.status(200).json(images)
    } catch (err) {
        console.log(err.message);
        res.status(500).json({ message: 'Internal Server Error' })
    }
}

// Function to get details of a specific image for review (including auto annotations and user details)
const getImageDetails = async (req, res) => {
    try {
        const imgId = req.params.id
        const imageDetails = await Image.findOne({ _id: imgId }).populate('userId')
        return res.status(200).json(imageDetails)
    } catch (err) {
        console.log(err.message);
        res.status(500).json({ message: 'Internal Server Error' })
    }
}

// Function for approving the image
// Additional options such as notifying the user through email can be added here
// The approve and reject workflow can also be implemented dynamically as a frontend request
const approve = async (req, res) => {
    try {
        const imgId = req.params.id
        await Image.findOneAndUpdate({ _id: imgId }, { $set: { status: 'Approved' } })
        return res.status(200).json({ message: 'Status updated' })
    } catch (err) {
        console.log(err.message);
        res.status(500).json({ message: 'Internal Server Error' })
    }
}

// Function for rejecting the image
// Additional options such as notifying the user through email can be added here
const reject = async (req, res) => {
    try {
        const imgId = req.params.id
        await Image.findOneAndUpdate({ _id: imgId }, { $set: { status: 'Rejected' } })
        return res.status(200).json({ message: 'Status updated' })
    } catch (err) {
        console.log(err.message);
        res.status(500).json({ message: 'Internal Server Error' })
    }
}

// Function for exporting all approved images 
const exportAllData = async (req, res) => {
    try {
        const format = req.query.format.toLowerCase(); // Get the requested format for exporting
        const approvedImages = await Image.find({ status: 'Approved' }); // Find all approved images

        if (approvedImages.length === 0) {
            return res.status(404).json({ message: 'No approved images found' });
        }

        // Extracting necessary data for exporting
        const exportedData = approvedImages.map(item => ({
            path: item.path,
            annotations: item.annotations,
            filename: item.filename
        }));

        const compiledData = await parseData(exportedData, format); // Compile the exported data into the requested format

        if (!compiledData) {
            return res.status(400).send('Invalid format');
        }

        // Set the appropriate headers for download
        res.attachment(`compiled_data.${format}`);

        // Send the compiled data as a downloadable file
        res.send(compiledData);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Function for exporting single image details
const exportData = async (req, res) => {
    try {
        const format = req.query.format.toLowerCase();
        const imgId = req.params.id;

        const imageDetails = await Image.findOne({ _id: imgId });

        if (!imageDetails || imageDetails.status !== 'Approved') {
            return res.status(400).json({ message: 'This image is not approved or does not exist' });
        }

        // Extracting necessary data for exporting (path, annotations, filename)
        const exportedData = {
            path: imageDetails.path,
            annotations: imageDetails.annotations,
            filename: imageDetails.filename
        };

        const compiledData = await parseData(exportedData, format);

        if (!compiledData) {
            return res.status(400).send('Invalid format');
        }

        // Set the appropriate headers for download
        res.attachment(`compiled_data.${format}`);

        // Send the compiled data as a downloadable file
        res.send(compiledData);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = {
    signup,
    signin,
    blockUser,
    unblockUser,
    userImages,
    getAllUsers,
    getAllImage,
    getImageDetails,
    approve,
    reject,
    exportAllData,
    exportData,
}