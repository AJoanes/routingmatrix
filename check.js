const json = require("./route_matrix.json")
const locations = require("./locations.json")

console.log(json.distances.length, json.travelTimes.length)
console.log("ORIGINAL LENGHT", locations.length)