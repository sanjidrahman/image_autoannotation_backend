const mongoose = require('mongoose'); // Importing mongoose library for MongoDB schema modeling

// Defining the schema for the user collection
const userSchema = new mongoose.Schema({
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
        default: 'user'
    },
    isBlocked : {
        type: Boolean,
        default: false
    }
})

module.exports = mongoose.model('user', userSchema)