const express = require('express');
const { json } = require('body-parser');
const db = require('./queries');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(json());

// Middleware to set headers for CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Serving static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Log the request for static files
app.use((req, res, next) => {
    console.log(`Request for static file: ${req.url}`);
    next();
});

// Root route serving the index.html file
app.get("/", (req, res) => {
    const filePath = path.join(__dirname, 'public/pages/index.html');
    console.log(`Trying to send file from: ${filePath}`);
    res.sendFile(filePath, (err) => {
        if (err) {
            console.error(`Error sending file: ${err}`);
            res.status(500).send('Internal Server Error');
        }
    });
});

// Route to serve about.html file
app.get("/about", (req, res) => {
    const filePath = path.join(__dirname, 'public/pages/about.html');
    console.log(`Trying to send file from: ${filePath}`);
    res.sendFile(filePath, (err) => {
        if (err) {
            console.error(`Error sending file: ${err}`);
            res.status(500).send('Internal Server Error');
        }
    });
});

// CSV upload route
app.post('/upload-csv', async (req, res) => {
    const { filePath, tableName } = req.body;

    if (!filePath || !tableName) {
        return res.status(400).json({ message: 'Missing filePath or tableName in request.' });
    }

    try {
        await db.populateDataFromCSV(filePath, tableName);
        res.status(201).json({ message: 'CSV data successfully uploaded and inserted.' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to process CSV file.', error: err.message });
    }
});

// API routes
app.get('/electricity-access-data/:countryName', db.ElectricityAccessData);
app.get('/clean-energy-share/:countryName', db.CleanEnergyShare);
app.get('/african-countries-data', db.getAfricanCountriesData);
app.get('/country-data/:countryName', db.getCountryData);
app.get('/get-sphere-data', db.SphereData);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
