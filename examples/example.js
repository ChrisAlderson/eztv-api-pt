'use strict';

// Import the neccesary modules.
const EZTV = require('../eztv-api-pt');

const eztv = new EZTV();

// Get all available shows on eztv.
eztv.getAllShows().then(res => {
  const data = res[0];
  console.log(data);

  // Get data including latest episodes from eztv.
  eztv.getShowData(data).then(res => console.log(res));

  // Or get all episodes from eztv.
  // eztv.getShowEpisodes(data).then(res => console.log(res);
}).catch(err => console.error(err));
