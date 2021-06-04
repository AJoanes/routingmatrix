const fs = require("fs");
const fetch = require("node-fetch");
const ProgressBar = require("progress");
const locations = require("./locations.json");
const normalizeArray = require("./normalizeMatrix");

const PROFILE_NAME = "van";
const API_KEY = "5b3ce3597851110001cf6248ee93cb8e24ca452a8e82ff2323c393fd";
const API_URL =
	"https://api.openrouteservice.org/v2/matrix/driving-car?profile=driving-car";

main();
async function main() {
	const parsedLocations = parseLocations(locations);
	const batchedLocations = batchArray(parsedLocations, 20);

	const bar = new ProgressBar("  downloading [:bar] :rate/bps :percent :etas", {
		complete: "=",
		incomplete: " ",
		width: 20,
		total: parsedLocations.length,
	});

	const distancesArray = [];
	const timesArray = [];

	for (let i = 0; i < parsedLocations.length; i++) {
		const requestBody = {
			metrics: ["distance", "duration"],
			locations: parsedLocations,
			destinations: [i],
		};
		const response = await getApiResponse(requestBody);

		distancesArray.push(...normalizeArray(response.distance));
		timesArray.push(...normalizeArray(response.time));

		bar.tick();
	}

	fs.writeFileSync(
		"route_matrix.json",
		JSON.stringify({
			distances: distancesArray,
			travelTimes: timesArray,
			profile: PROFILE_NAME,
		})
	);
}

function batchArray(array = [], batchSize = 20) {
	const arr = [];
	for (let i = 0; i < array.length; i += batchSize) {
		arr.push(array.slice(i, i + batchSize));
	}
	return arr;
}

async function getApiResponse(requestBody) {
	try {
		const response = await fetch(`${API_URL}`, {
			method: "POST",
			body: JSON.stringify(requestBody),
			headers: {
				"Content-Type": "application/json",
				Authorization: API_KEY,
			},
		});

		const parsedResponse = await response.json();
		// console.log(parsedResponse);
		return {
			distance: parsedResponse?.distances.flat(),
			time: parsedResponse?.durations.flat(),
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
		return [location.lng, location.lat];
	});
}
