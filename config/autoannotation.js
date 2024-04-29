const AWS = require('aws-sdk'); // Importing the AWS SDK

// Function to configure AWS SDK with access credentials
function configureAWS() {
    AWS.config.update({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_S3_REGION
    });
}

// Function to detect labels in an image using AWS Rekognition
async function detectLabels(photo) {
    configureAWS(); // Configure AWS SDK

    const client = new AWS.Rekognition(); // Create a new instance of AWS Rekognition client
    const params = {
        Image: {
            S3Object: {
                Bucket: process.env.AWS_S3_BUCKET_NAME, // Name of the S3 bucket
                Name: photo, // Name of the photo to be analyzed
            },
        },
        MaxLabels: 20, // Maximum number of labels to return
        MinConfidence: 70, // Minimum confidence level for detected labels
    };

    try {
        const data = await client.detectLabels(params).promise(); // Call AWS Rekognition API to detect labels in the image
        return data.Labels.map(extractLabelInfo);
    } catch (error) {
        throw new Error('Error detecting labels');
    }
}

// Function to extract necessary data from the response
function extractLabelInfo(label) {
    return {
        name: label.Name,
        confidence: label.Confidence,
        instances: label.Instances,
        parents: label.Parents
    };
}

module.exports = {
    detectLabels
};