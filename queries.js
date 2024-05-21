const { Pool } = require("pg");
require("dotenv").config();
const csvtojson = require("csvtojson");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const populateDataFromCSV = async (filePath, tableName) => {
  const client = await pool.connect();
  try {
    const options = { delimiter: ';' };
    const jsonArray = await csvtojson(options).fromFile(filePath);

    if (jsonArray.length === 0) {
      throw new Error('No data found in the CSV file.');
    }

    await client.query('BEGIN');

    const checkTableExist = `SELECT to_regclass('public."${tableName}"')`;
    const tableExist = await client.query(checkTableExist);

    if (!tableExist.rows[0].to_regclass) {
      const columns = Object.keys(jsonArray[0]);
      const createTableQuery = `CREATE TABLE "${tableName}" (${columns.map(column => `"${column}" TEXT`).join(', ')})`;
      await client.query(createTableQuery);
    }

    const columns = Object.keys(jsonArray[0]);
    const columnNames = columns.map(column => `"${column}"`).join(', ');
    const valueIndices = columns.map((_, index) => `$${index + 1}`).join(', ');
    const insertStatement = `INSERT INTO "${tableName}" (${columnNames}) VALUES (${valueIndices})`;

    for (const item of jsonArray) {
      const values = columns.map(column => item[column]);
      await client.query(insertStatement, values);
    }

    await client.query('COMMIT');
    console.log('All data added successfully');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error processing CSV file:', err.message);
  } finally {
    client.release();
  }
};

// How to insert data with Postman using this method "populateDataFromCSV"
// - Make a new request.
// - Select "POST"
// - Select "Body" then "raw"
// - Use the schema below to select csv file and rename the tablename of choice.
// {
//   "filePath": "./csv/name_of_the_file.csv",
//   "tableName": "Name of the table"
// }

// ** IMPORTANT NOTES **
// *All the data imported is being treated as 'text'
// *Error handling from Postman is incorrect, always check the terminal after sending a request..
// *Remember to 'npm install' before starting


const ElectricityAccessData = async (req, res) => {
  try {
      const query = 'SELECT * FROM "AdgangTilStrom"';  // SQL query with case-sensitive table name
      const results = await pool.query(query);  // Execute the query
      res.status(200).json(results.rows);  // Send the rows back to the client
  } catch (error) {
      console.error('Database query error:', error.message);
      res.status(500).json({ message: 'Failed to retrieve data.', error: error.message });
  }
};

const CleanEnergyShare = async (req, res) => {
  try {
      const query = 'SELECT * FROM "CleanEnergyShare"';  // SQL query with case-sensitive table name
      const results = await pool.query(query);  // Execute the query
      res.status(200).json(results.rows);  // Send the rows back to the client
  } catch (error) {
      console.error('Database query error:', error.message);
      res.status(500).json({ message: 'Failed to retrieve data.', error: error.message });
  }
};




module.exports = {
  populateDataFromCSV,
  ElectricityAccessData,
  CleanEnergyShare,
};


