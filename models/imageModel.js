const mongoose = require('mongoose'); // Importing mongoose library for MongoDB schema modeling

// Defining the schema for the image collection
const imageSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    path: {
        type: String,
        required: true
    },
    annotations: {
        type: Array,
        required: true
    },
    filename: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: 'pending'
    }
})

module.exports = mongoose.model('image', imageSchema)