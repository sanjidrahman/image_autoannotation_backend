const json2csv = require('json2csv').parse; // Importing json2csv library for converting JSON to CSV
const { XMLBuilder } = require("fast-xml-parser"); // Importing XMLBuilder from fast-xml-parser for XML conversion

// Function to compile data into the requested format
async function parseData(images, format) {
    let compiledData;
    switch (format) {
        case 'csv':
            compiledData = json2csv(images);
            break;
        case 'json':
            compiledData = JSON.stringify(images);
            break;
        case 'xml':
            compiledData = await convertToXml(images);
            break;
        default:
            compiledData = null;
    }
    return compiledData;
}

// Function to convert data into XML format
async function convertToXml(images) {
    const builder = new XMLBuilder();
    const xmlString = builder.build({ images });
    return xmlString
}

module.exports = {
    parseData
}