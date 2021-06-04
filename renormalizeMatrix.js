const fs = require("fs");
const json = require("./route_matrix.json");
const locations = require("./locations.json");
const normalizeArray = require("./normalizeMatrix");

const PROFILE_NAME = "van";

const distancesArray = normalizeArray(json.distances);
const travelTimes = normalizeArray(json.travelTimes);

fs.writeFileSync(
	"route_matrix_normalized.json",
	JSON.stringify({
		distances: distancesArray,
		travelTimes: travelTimes,
		profile: PROFILE_NAME,
	})
);
