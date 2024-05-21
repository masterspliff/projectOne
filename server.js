const express = require('express');
const { json } = require('body-parser');
const { populateDataFromCSV, ElectricityAccessData, CleanEnergyShare } = require('./queries');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(json());  // Simplified body-parser usage

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });
  
app.post('/upload-csv', async (req, res) => {
    const { filePath, tableName } = req.body;

    if (!filePath || !tableName) {
        return res.status(400).json({ message: 'Missing filePath or tableName in request.' });
    }

    try {
        await populateDataFromCSV(filePath, tableName);
        res.status(201).json({ message: 'CSV data successfully uploaded and inserted.' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to process CSV file.', error: err.message });
    }
});

app.get("/electricity-access-data", ElectricityAccessData);
app.get("/clean-energy-share", CleanEnergyShare);



app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

