/*
    Moore Foundation Ocean Map
    MFOM.config.js
    Catch all for various configuration bits
*/

(function(exports) {
    'use strict';
    var MFOM = exports.MFOM || (exports.MFOM = {});

    MFOM.config = {};
    MFOM.config.version = '0.0.0';

    MFOM.config.files = {
        base: 'assets/',
        csvBase: 'assets/csv/',
        geojsonBase: 'assets/geojson/',
        eez: 'data.csv',
        planningAreas: 'planning_areas.topojson'
    };

    MFOM.config.statusLookup = {
        'implemented': 'Implemented',
        'pre-planning': 'Pre-planning',
        'underway': 'Underway',
        'stalled': 'Stalled'
    };

    MFOM.config.expand = {
        countries : {
            'usa' : "United States",
            "can" : "Canada"
        }
    }

    MFOM.config.styles = {
        eventStyle: {
            color: '#000',
            opacity: 0,
            fillColor: '#000',
            fillOpacity: 0,
            weight: 1
        },
        geojsonPolyStyle: {
            color: '#126063',
            opacity: 0.6,
            fillColor: '#126063',
            fillOpacity: 0.3,
            weight:1
        },
        geojsonPolyStylePreplanning: {
            color: '#126063',
            opacity: 0.5,
            fillColor: '#9bb',
            fillOpacity: 0.1,
            weight:1.0,
            dashArray:'3'
        },
        geojsonPolyHighlighted: {
            color: '#0ff',
            opacity: 0.6,
            fillColor: '#0ff',
            fillOpacity: 0.3,
            weight:1
        },
        geojsonPolyMouseover: {
            color: '#126063',
            opacity: 0.6,
            fillColor: '#fd0',
            fillOpacity: 0.3,
            weight:1
        },
        geojsonMarkerOptions: {
            fillColor: "#126063",
            color: "#126063",
            weight: 2,
            opacity: 0.6,
            fillOpacity: 0.3
        },
        geojsonMarkerOptionsPreplanning: {
            fillColor: "#9bb",
            color: "#126063",
            weight: 1.5,
            opacity: 0.5,
            fillOpacity: 0.1,
            dashArray:'2'
        },
        geojsonMarkerHighlighted: {
            fillColor: "#0ff",
            color: "#0ff",
            weight: 2,
            opacity: 0.6,
            fillOpacity: 0.3
        },
        geojsonMarkerMouseover: {
            fillColor: "#fd0",
            color: "#126063",
            weight: 2,
            opacity: 0.6,
            fillOpacity: 0.3
        }
    };

    MFOM.config.map = {
        crs: new L.Proj.CRS(
                'EPSG:2163',  // Guessing ?
                '+proj=laea +lat_0=40 +lon_0=-105 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs',
                {
                    origin: [60112700, 20037600], // I don't understand where these come from
                    resolutions: [ // map scale, not sure how these were computed (seanc)
                        156543.0339296875,
                        78271.51696484375,
                        39135.758482421875,
                        19567.8792412109375,
                        9783.93962060546875,
                        4891.969810302734375,
                        2445.9849051513671875,
                        1222.99245257568359375,
                        611.496226287841796875,
                        305.7481131439208984375,
                        152.87405657196044921875,
                        76.437028285980224609375,
                        38.2185141429901123046875,
                        19.10925707149505615234375,
                        9.554628535747528076171875,
                        4.7773142678737640380859375,
                        2.388657133934688201904296875,
                        1.194328566968441009521484375
                    ]
                }
            ),
        mapboxTilesLowZoom: L.tileLayer('https://{s}.tiles.mapbox.com/v3/stamen.moore_lowzoom/{z}/{x}/{y}.png', {minZoom: 0, maxZoom: 5, attribution: 'Map by Stamen Design'}),
        mapboxTilesHighZoom: L.tileLayer('https://{s}.tiles.mapbox.com/v3/stamen.moore_highzoom/{z}/{x}/{y}.png', {minZoom: 6, maxZoom: 10, attribution: 'Map by Stamen Design'}),
        mapboxLabels: new L.TileLayer.Labels("https://{s}.tiles.mapbox.com/v3/stamen.moore_highzoom_labels/{z}/{x}/{y}.png", {minZoom: 0, maxZoom: 10, attribution: 'Map by Stamen Design'}),
        startZoom: 4,
        layers: [
                {
                    "topojson_layer": "LOMA_Beaufort_Sea",
                    "file": "LOMA_Beaufort_Sea.geojson",
                    "label": "Beaufort Sea",
                    "csv_id": 1
                },
                {
                    "topojson_layer": "LOMA_Eastern_Scotian_Shelf",
                    "file": "LOMA_Eastern_Scotian_Shelf.geojson",
                    "label": "Eastern Scotian Shelf",
                    "csv_id": 2
                },
                {
                    "topojson_layer": "LOMA_Pacific_North_Coast",
                    "file": "LOMA_Pacific_North_Coast.geojson",
                    "label": "Pacific North Coast",
                    "file2": "bc_pncima.geojson",
                    "label2": "BC PNCIMA",
                    "csv_id": 4
                },
                {
                    "topojson_layer": "bc_wcvi",
                    "file": "bc_wcvi.geojson",
                    "label": "BC WCVI",
                    "csv_id": 5
                },
                {
                    "topojson_layer": "LOMA_Placentia_Bay___Grand_Banks",
                    "file": "LOMA_Placentia_Bay___Grand_Banks.geojson",
                    "label": "Placentia Bay / Grand Banks",
                    "csv_id": 6
                },
                {
                    "topojson_layer": "NLUP_Boundary",
                    "file": "NLUP_Boundary.geojson",
                    "label": "Nunavut",
                    "csv_id": 7
                },
                {
                    "topojson_layer": "great_lakes",
                    "file": "great_lakes.geojson",
                    "label": "Great Lakes",
                    "csv_id": 8
                },
                {
                    "topojson_layer": "pacific_islands",
                    "file": "pacific_islands.geojson",
                    "label": "Pacific Islands",
                    "csv_id": 12
                },
                {
                    "topojson_layer": "south_atlantic",
                    "file": "south_atlantic.geojson",
                    "label": "South Atlantic US",
                    "csv_id": 13
                },
                {
                    "topojson_layer": "us_caribbean",
                    "file": "us_caribbean.geojson",
                    "label": "US Caribbean",
                    "csv_id": 14
                },
                {
                    "topojson_layer": "us_west_coast",
                    "file": "us_west_coast.geojson",
                    "label": "US West Coast",
                    "csv_id": 15
                },
                {
                    "topojson_layer": "florida_keys",
                    "file": "florida_keys.geojson",
                    "label": "Florida Keys",
                    "csv_id": 18
                },
                {
                    "topojson_layer": "ma_coastalzone",
                    "file": "ma_coastalzone.geojson",
                    "label": "Massachusetts",
                    "csv_id": 22
                },
                {
                    "topojson_layer": "oregon",
                    "file": "oregon.geojson",
                    "label": "Oregon",
                    "csv_id": 24
                },
                {
                    "topojson_layer": "ri_coastalzone",
                    "file": "ri_coastalzone.geojson",
                    "label": "Rhode Island",
                    "csv_id": 25
                },
                {
                    "topojson_layer": "washington_state",
                    "file": "washington_state.geojson",
                    "label": "Washington State",
                    "csv_id": 31
                },
                {
                    "topojson_layer": "hi_humpback_sanctuary",
                    "file": "hi_humpback_sanctuary.geojson",
                    "label": "Hawaii Humpback Whale National Marine Sanctuary",
                    "csv_id": 32
                },
                {
                    "topojson_layer": "bc_mapp_haida_gwaii",
                    "file": "bc_mapp_haida_gwaii.geojson",
                    "label": "BC MaPP Haida Gwaii",
                    "csv_id": 33
                },
                {
                    "topojson_layer": "bc_mapp_north_coast",
                    "file": "bc_mapp_north_coast.geojson",
                    "label": "BC MaPP North Coast",
                    "csv_id": 34
                },
                {
                    "topojson_layer": "LOMA_Gulf_of_Saint_Lawrence",
                    "file": "LOMA_Gulf_of_Saint_Lawrence.geojson",
                    "label": "Gulf of Saint Lawrence",
                    "csv_id": 39
                },
                {
                    "topojson_layer": "bc_mapp_central_coast",
                    "file": "bc_mapp_central_coast.geojson",
                    "label": "BC MaPP Central Coast",
                    "csv_id": 40
                },
                {
                    "topojson_layer": "bc_mapp_north_vancouver_island",
                    "file": "bc_mapp_north_vancouver_island.geojson",
                    "label": "BC MaPP North Vancouver Island",
                    "csv_id": 41
                }
            ]
    }

})(window);