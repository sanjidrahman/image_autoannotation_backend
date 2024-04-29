const User = require('../models/userModel'); // Importing the user model
const Image = require('../models/imageModel'); // Importing the image model
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { uploadFile } = require('../config/s3'); // Importing file upload function from S3 configuration
const { detectLabels } = require('../config/autoannotation');  // Importing image annotation function

// Function for hashing passwords securely
const securepassword = async (password) => {
    try {
        const securepassword = await bcrypt.hash(password, 10)
        return securepassword
    } catch (err) {
        console.log(err.message);
    }
}

// User signup functionality (functionalities like sending otp for verification can be added)
const signup = async (req, res) => {
    try {
        const { email, password, confirmpass } = req.body
        const existingUser = await User.findOne({ email: email })

        if (existingUser) {
            return res.status(409).json({ message: 'User already exists' })
        }

        if (password != confirmpass) {
            return res.status(404).json({ message: `Password and confirm password doesn't match` })
        }

        const spassword = await securepassword(password) // Hashing the password securely

        const newUser = new User({
            email: email,
            password: spassword,
        })
        const createdUser = await newUser.save()

        const payload = { id: createdUser._id, role: 'user' }; // Creating a payload for JWT token
        const token = jwt.sign({ payload }, process.env.USER_SECRET); // Generating JWT token

        return res.status(201).json({ message: 'Success', token })

    } catch (err) {
        console.log(err.message);
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}

// User login functionality 
const signin = async (req, res) => {
    try {

        const { email, password } = req.body
        const existingUser = await User.findOne({ email: email })

        if (!existingUser) {
            return res.status(404).json({ message: 'User not found, Please register!' })
        }

        const encpass = await bcrypt.compare(password, existingUser.password); // Comparing hashed passwords
        if (!encpass) {
            return res.status(401).json({ message: 'Email or Password incorrect' })
        }

        if (existingUser.isBlocked) {
            return res.status(403).json({ message: 'Access Denied' });
        }

        const payload = { id: existingUser._id, role: 'user' }; // Creating payload for JWT token
        const token = jwt.sign({ payload }, process.env.USER_SECRET); // Generating JWT token

        return res.status(200).json({ message: 'Success', token })

    } catch (err) {
        res.status(500).json({ message: `Internal Server Error = ${err}` })
    }
}

// Image storage and auto annotation functionality
const upload = async (req, res) => {
    try {
        // const { userId } = req.body
        const { userId } = req.session;
        const image = req.file;

        if (!image) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const { Location, Key } = await uploadFile(image); // Uploading image to S3 and getting Location and Key
        const annotations = await detectLabels(Key); // Detecting labels in the uploaded image
        const newData = new Image({
            userId,
            annotations,
            path: Location,
            filename: Key
        });
        const saved = await newData.save();

        return res.status(201).json(saved);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};


module.exports = {
    signup,
    signin,
    upload
}