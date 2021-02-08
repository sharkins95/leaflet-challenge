// store API query variables
let baseURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";

// assemble API query URL
let url = baseURL;

// grab the data with d3
d3.json(url, function(data) {
    quakeFeatures(data.features);
});

function quakeFeatures(earthquakeData) {
    let earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,
        pointToLayer: function(earthquakeData, points) {
            return L.circle(points, {
                radius: earthquakeData.properties.mag*20000,
                color: magColor(earthquakeData.properties.mag),
                fillOpacity: 0.6,
                weight: 1.5
            });
        },
    });

    // create function to change color of markers based on magnitude
    function magColor(magnitude) {
        let color = 'black'
        if (magnitude > 5) {
            color = "red"
        }
        else if (magnitude > 4) {
            color = 'orange'
        }
        else if (magnitude > 3) {
            color = 'yellow'
        }
        else if (magnitude > 2) {
            color = 'green'
        }
        else if (magnitude > 1) {
            color = "blue"
        }
        else {
            color = "purple"
        }
        return color
    };

    // bind pop-up for each feature describing place, magnitude & time of earthquake
    function onEachFeature(feature, layer) {
        layer.bindPopup("<h3>" + feature.properties.place + "<p> Magnitude: " + feature.properties.mag + 
        "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
    };

    // send earthquake layer to createMap function
    createEarthquakeMap(earthquakes)
};

// create function for map
function createEarthquakeMap(earthquakes) {
    // define streetmap later
    let streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/streets-v11",
    accessToken: API_KEY
    });

    // create base map layer
    let base = {
        "Street Map": streetmap
    };

    // create object to hold overlay layer
    let overlay = {
        Earthquakes: earthquakes
    };

    // create map object
    let myMap = L.map("map", {
        center: [40.7, -73.95],
        zoom: 11,
        layers: [streetmap]
    });

    L.control.layers(base, overlay, {
        collapsed: true
    }).addTo(myMap);

    // add colors for legend
    function magColor(d) {
        return d > 5 ? "red":
            d > 4 ? "orange":
            d > 3 ? "yellow":
            d > 2 ? "green":
            d > 1 ? "blue":
                "purple";
    };

    // create map legend
    let legend = L.control({
        position: "bottomright"
    });

    legend.onAdd = function () {
        let div = L.DomUtil.create('div', 'info legend')
        let levels = [0, 1, 2, 3, 4, 5]
        labels = [];

        for (var i = 0; i < levels.length; i++) {
            div.innerHTML +=
                '<i style=background:' + magColor(levels[i] + 1) + '"></i> ' + 
                levels[i] + (levels[i + 1] ? '&ndash;' + levels[i + 1] + '<br>' : '+');
        };

        return div;
    };

legend.addTo(myMap);

};