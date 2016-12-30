var request = require('request');

const RUTER_API_REALTIME_DEPARTURE_URL = "http://reisapi.ruter.no/stopvisit/getdepartures/";

exports.fetchRealtimeData = (stationId, lineNumber, directionName, callback) => {
  request(RUTER_API_REALTIME_DEPARTURE_URL + stationId +"?json=true", function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var data = JSON.parse(body);
      if(data.length == 0) {
        console.log("zZzZzZz");
        callback("-1");
        return true;
      }
      data.some(function(item) {
        if(item['MonitoredVehicleJourney']) {
          var trip = item['MonitoredVehicleJourney'];
          if(trip['PublishedLineName'] == lineNumber && trip['DirectionName'] == directionName) {
            var departure = trip['MonitoredCall']['ExpectedDepartureTime'];
            console.log("next: " + departure);
            var nextDepartureInMinutes = calcMinutes(departure);
            callback(nextDepartureInMinutes);
            return true;
          }
        } else {
          console.log("feil");
          callback("-2");
        }
      });
    }
  });
};

var calcMinutes = (nextDeparture) => {
  var currentTime = new Date();
  var nextDepartureTime = new Date(nextDeparture);
  var diffMs = (nextDepartureTime - currentTime); // milliseconds between now & next departure
  var diffDays = Math.round(diffMs / 86400000);
  var diffHrs = Math.round((diffMs % 86400000) / 3600000);
  var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000);

  console.log("Minutes to next departure: " + diffMins);

  return diffMins.toString();
}
