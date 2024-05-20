const queryDatabase = require('./db');

// Function to fetch data from the database based on a provided query and parameters
const fetchData = async (query, params) => {
  try {
    const results = await queryDatabase(query, params);
    return results;
  } catch (err) {
    console.error('Error fetching data from the database:', err.message);
    return [];
  }
};

// Specific function to fetch electricity access data
const fetchElectricityAccessData = async () => {
  const query = 'SELECT "GeoAreaName", "2022" FROM your_table_name WHERE "Location" = $1';
  const params = ['ALLAREA'];
  const results = await fetchData(query, params);
  const accessData = {};
  results.forEach(row => {
    accessData[row.GeoAreaName] = row["2022"];
  });
  return accessData;
};

module.exports = {
  fetchData,
  fetchElectricityAccessData,
};
