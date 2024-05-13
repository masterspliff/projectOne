const express = require('express');
const bodyParser = require('body-parser');
const { populateDataFromCSV } = require('./queries'); // Import your custom function

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// Route to handle CSV upload
app.post('/upload-csv', (req, res) => {
  const { filePath, tableName } = req.body;

  if (!filePath || !tableName) {
    return res.status(400).send({ message: 'Missing filePath or tableName in request.' });
  }

  populateDataFromCSV(filePath, tableName)
    .then(() => {
      res.status(201).send({ message: 'CSV data successfully uploaded and inserted.' });
    })
    .catch(err => {
      res.status(500).send({ message: 'Failed to process CSV file.', error: err.message });
    });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

