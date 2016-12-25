// Import the neccesary modules.
const EZTV = require('../eztv-api-pt');

const eztv = new EZTV();

// Get all available shows on eztv.
eztv.getAllShows().then(res => {
  const data = res[0];
  console.log(data);

  // Get data including episodes from eztv.
  eztv.getShowData(data)
    .then(res => console.log(res));
}).catch(err => console.error(err));
