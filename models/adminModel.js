const mongoose = require('mongoose'); // Importing mongoose library for MongoDB schema modeling

// Defining the schema for the admin collection
const adminSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: 'admin'
    }
})

module.exports = mongoose.model('admin', adminSchema)