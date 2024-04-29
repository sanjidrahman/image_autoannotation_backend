const AWS = require('aws-sdk'); // Importing the AWS SDK
const fs = require('fs')
const s3 = new AWS.S3({ // Creating a new instance of AWS S3 with access credentials
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

// Function to upload a file to AWS S3
function uploadFile(file) {
    const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME, // Bucket name 
        Key: file.filename, // Key (filename) for the file in S3
        Body: fs.createReadStream(file.path), // Body of the file, read from the local file system
    };

    return s3.upload(params).promise();  // Initiating the upload and returning a promise
}

module.exports = {
    uploadFile
}