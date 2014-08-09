/**
 * Usage: set the entries in `default` to be the App ID and App name.
 * For example, to get the rank of the App "Tube Tracker", your
 * `defaults` object would look like this:
 *
 * var defaults = {
 *   "441139371" : "Tube Tracker"
 * };
 *
 * Then simply execute `node index.js` from the command line.
 *
 * Alternatively, you can use the command line interface (CLI) to
 * lookup the rank of Apps, for example,
 *
 * `node index.js 441139371`
 */
var defaults = {
    "441139371" : "Tube Tracker"
};

var https = require("https");
var categoryMap = {"" : "Overall"};

/**
 * Gets the rank of those Apps defined in `apps`
 * @param {object} apps - A dictionary keyed by App ID. Values are the App name.
 *      For example, to get the rank of Tube Tracker, `apps` would be
 *      { "441139371" : "Tube Tracker" }
 */
function updateRankings(apps) {
	for (var i = 0; i < Object.keys(apps).length; i++) {
        var appID = Object.keys(apps)[i];
		appInfo(appID, function(info){	
			var applicationID = info["trackId"];
		
			for (var i = 0; i < info["genreIds"].length; i++) {
				categoryMap[info["genreIds"][i]] = info["genres"][i];
			}

			var categoryIDs = info["genreIds"];
			categoryIDs.push(""); // Overall Category

			checkRank(applicationID, categoryIDs, (info["price"] == 0), function (callbackAppID, category, rank){
				if (rank != undefined) {
                    console.log(apps[callbackAppID] + " [" + categoryMap[category] + "]: " + rank)
				}
			});
		});
	}
}

/**
 * Get the metadata for a given App.
 * @param {string} appID - The App ID for which you wish to retrieve the metadata
 * @param {function} callback - A callback to handle the info response.
 */
function appInfo(appID, callback) {
	var options = {
	    host: "itunes.apple.com",
	    path: "/lookup?id=" + appID
    };

    https.get(options, function(response) {
        var data = "";
	
		response.setEncoding("utf8");
		response.on("data", function(chunk) {
			data += chunk
		});
	
		response.on("end", function() {
		    var info = JSON.parse(data)["results"][0];
			callback(info)
		});
	}).on("error", function(error) {
		console.log("Got error: " + error.message);
		callback(undefined)
	});	
}

/**
 *
 * @param {string} appID - The App ID for which you wish to retrieve the metadata.
 * @param {object} categoryIDs - The category IDs that you wish to check.
 * @param {boolean} isFree - Set to `true` if you wish to check the free chart.
 * @param {function} callback - A callback to handle the info response.
 */
function checkRank(appID, categoryIDs, isFree, callback) {
    var limit = 200;
    var countryCode = "gb";
    var freeURL = "topfreeapplications";
    var paidURL = "toppaidapplications";
    
    var priceURL = (isFree)? freeURL : paidURL;

    categoryIDs.forEach(function (categoryID){
        var appRank = undefined;
    	var endpoint = "/" + countryCode + "/rss/" + priceURL + "/limit=" + limit;
		if (categoryID != "") {
			 endpoint += "/genre=" + categoryID;
		}
		endpoint += "/json";

		var options = {
			host: "itunes.apple.com",
			path: endpoint
		};

	    https.get(options, function(response) {
			var data = "";
	
			response.setEncoding("utf8");    
			response.on("data", function(chunk) {
				data += chunk
			});
	
			response.on("end", function() {
				var json = JSON.parse(data);
				if (json == undefined) {
					return;
				}
				var entries = json["feed"]["entry"];
				var rank = 0;
				entries.every(function(entry) {
					rank ++;
					var entryID = entry["id"]["attributes"]["im:id"];
					var category = entry["category"]["attributes"]["label"];

					if (entryID == appID) {
						appRank = rank;
						callback(appID, categoryID, appRank);
						return false;
					}
					return true;
				});
			
				if (appRank == undefined) {
					callback(appID, categoryID, undefined);
				}
			});
		}).on("error", function(error) {
			console.log("Got error: " + error.message);
			callback(appID, categoryID, undefined);
		});	
    });
}

/**
 * You can either set the `defaults` at the top of this file, or enter space
 * delimited App IDs in the command line interface.
 */
process.argv.forEach(function (val, index, array) {
    if (array.length > 2) {
        if (index > 1) {
            var meh = {};
            meh[val] = "";
            updateRankings(meh);
        }
    }
    else {
        if (index == 0) {
            updateRankings(defaults);
        }
    }

});