// Import the necessary modules.
/* eslint-disable no-console */
const EztvApi = require('..')

// Create a new instance of the module.
const eztv = new EztvApi()

// Get all available shows on eztv.
eztv.getAllShows().then(res => {
  const [ data ] = res
  console.log(data)

  // Get data including latest episodes from eztv.
  return eztv.getShowData(data)

  // Or get all episodes from eztv.
  // return eztv.getShowEpisodes(data)
}).then(res => console.log(res))
  .catch(err => console.error(err))
