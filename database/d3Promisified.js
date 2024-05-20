const d3 = require('d3');

const loadJSON = (url) => {
  return new Promise((resolve, reject) => {
    d3.json(url).then(resolve).catch(reject);
  });
};

module.exports = { loadJSON };
