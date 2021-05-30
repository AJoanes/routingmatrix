const fs = require("fs");
const fetch = require("node-fetch");
const ProgressBar = require("progress");
const locations = require("./locations.json");

const API_KEY = "JGtxidSHhCk8fMBBGqtyQE32l0mU0wXv";
const API_URL = "http://www.mapquestapi.com/directions/v2/routematrix";

main();
async function main() {
  const parsedLocations = parseLocations(locations);
  const batchedLocations = batchArray(parsedLocations, 50);

  const bar = new ProgressBar("  downloading [:bar] :rate/bps :percent :etas", {
    complete: "=",
    incomplete: " ",
    width: 20,
    total: parsedLocations.length * batchedLocations.length,
  });

  const distancesArray = [];
  const timesArray = [];

  for (let i = 0; i < parsedLocations.length; i++) {
    const batchDistance = [0];
    const batchTime = [0];
    for (let j = 0; j < batchedLocations.length; j++) {
      // Remove equal value from array
      const index = batchedLocations[j].findIndex(
        (l) => l === parsedLocations[i]
      );
      const parsedCopy = [...batchedLocations[j]];
      index > -1 ? parsedCopy.splice(index, 1) : null;

      const requestBody = {
        locations: [parsedLocations[i], ...parsedCopy],
      };
      const { distance, time } = await getApiResponse(requestBody);

      batchDistance.push(...distance);
      batchTime.push(...time);

      bar.tick();
    }

    distancesArray.push(...batchDistance);
    timesArray.push(...batchTime);
  }

  fs.writeFileSync(
    "route_matrix.json",
    JSON.stringify({ distances: distancesArray, travelTimes: timesArray })
  );
}

function batchArray(array = [], batchSize = 100) {
  const arr = [];
  for (let i = 0; i < array.length; i += batchSize) {
    arr.push(array.slice(i, i + batchSize));
  }
  return arr;
}

async function getApiResponse(requestBody) {
  try {
    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: "POST",
      body: JSON.stringify(requestBody),
    });

    const parsedResponse = await response.json();
    console.log(response.status);
    return {
      distance: parsedResponse?.distance?.slice(1) ?? [],
      time: parsedResponse?.time?.slice(1) ?? [],
      // locations: parsedResponse?.locations?
    };
  } catch (error) {
    console.error(error);
    return {
      distance: [],
      time: [],
    };
  }
}

function parseLocations(locations) {
  return locations.map((location) => {
    return `${location.lat},${location.lng}`;
  });
}
