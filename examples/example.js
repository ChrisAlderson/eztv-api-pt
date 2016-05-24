// Import the neccesary modules.
import eztvApi from "../index";

// Get all available shows on eztv.
eztvApi.getAllShows()
  .then(res => {
    const data = res[0];
    console.log(data);

    // Get data including episodes from eztv.
    eztvApi.getShowData(data)
      .then(res => console.log(res));
  })
  .catch(err => console.error(err));
