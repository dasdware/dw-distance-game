const geolib = require('geolib');
const fs = require('fs');

module.exports = function(locations) {
    const connections = {
        "features": [],
        "type": "FeatureCollection"
    };

    const basePt = locations.find((location) => location.base === true);
    if (!basePt) {
        throw new Error('Keine Basiskoordinaten vorhanden!');
    }

    const base = [ Number(basePt.longitude), Number(basePt.latitude) ];
    for (let location of locations) {
        if ((location.base === true) || (location.active === false) 
                || !location.latitude || !location.longitude) {
            continue;
        }

        const coords = [ Number(location.longitude), Number(location.latitude) ];
        const coordsPt = location;

        const dist = geolib.getDistance(basePt, coordsPt) / 1000.0;
        const bearing = geolib.getBearing(basePt, coordsPt);
        const compass = geolib.getCompassDirection(basePt, coordsPt).exact.replace(/E/g, 'O');

        const feature = {
            "geometry": {
                "coordinates": [ base, coords ],
                "type": "LineString"
            },
            "type": "Feature",
            "properties": {
                "name": location.name,
                "address": location.address,
                "postal_code": location.postal_code,
                "city": location.city,
                "distance": dist,
                "bearing": bearing,
                "compass": compass
            }
        };

        connections.features.push(feature);
    }

    delete basePt.active;
    delete basePt.base;
    return {
        "connections": connections,
        "base": basePt
    };
}