const multer = require('multer'); // Importing Multer for handling file uploads
const path = require('path');

// Multer configuration for file storing
const storage = multer.diskStorage({
    // Setting destination directory for storing uploaded files
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public/images'), function (err) {
            if (err) {
                throw err
            }
        });
    },

    // Setting filename for uploaded files
    filename: function (req, file, cb) {
        // Generating a random name for the file to prevent filename collisions
        const name = Math.round(Math.random() * 16).toString(16) + '-' + file.originalname
        cb(null, name, function (err) {
            if (err) {
                throw err
            }
        });
    }
});

const upload = multer({ storage: storage });

module.exports = upload;