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
        geojsonLowResBase: 'assets/geojson-low/',
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
            'can' : 'Canada'
        }
    };

    MFOM.config.styles = {
        eventStyle: {
            color: '#000',
            opacity: 0,
            fillColor: '#000',
            fillOpacity: 0,
            weight: 1
        },
        geojsonPolygonStyles: {
            base: {
                normal: {
                    color: '#f59918',
                    opacity: 0.6,
                    fillColor: '#f59918',
                    fillOpacity: 0.5,
                    weight:1
                },
                over: {
                    color: '#fa71e8',
                    opacity: 0.6,
                    fillColor: '#fa71e8',
                    fillOpacity: 0.3,
                    weight:1
                },
                selected: {
                    color: '#fae38e',
                    opacity: 0.6,
                    fillColor: '#fae38e',
                    fillOpacity: 0.3,
                    weight:1
                }
            },
            // for variants, you can just include the difference from base
            stalled: {
                normal:{
                    color: '#d93b52',
                    opacity: 0.6,
                    fillColor: '#d93b52',
                    fillOpacity: 0.5,
                    weight:1
                },
                over: {},
                selected: {}
            },
            underway: {
                normal:{
                    color: '#78dbba',
                    opacity: 0.6,
                    fillColor: '#78dbba',
                    fillOpacity: 0.5,
                    weight:1
                },
                over: {},
                selected: {}
            },
            preplanning: {
                normal:{
                    color: '#f59918',
                    opacity: 0.6,
                    fillColor: '#f59918',
                    fillOpacity: 0.5,
                    weight:1
                },
                over: {},
                selected: {}
            },
            implemented: {
                normal:{
                    color: '#78dbba',
                    opacity: 0.6,
                    fillColor: '#78dbba',
                    fillOpacity: 0.5,
                    weight:1
                },
                over: {},
                selected: {}
            }
        },
        // marker styles
        geojsonMarkerStyles: {
            base: {
                normal: {
                    fillColor: '#f59918',
                    color: '#f59918',
                    weight: 2,
                    opacity: 0.6,
                    fillOpacity: 1.3
                },
                over: {
                    fillColor: '#f59918',
                    color: '#f59918',
                    weight: 2,
                    opacity: 0.6,
                    fillOpacity: 0.3
                },
                selected: {
                    fillColor: '#fae38e',
                    color: '#fae38e',
                    weight: 2,
                    opacity: 0.6,
                    fillOpacity: 0.3
                }
            },
            // for variants, you can just include the difference from base
            stalled: {
                normal:{
                    color: '#d93b52',
                    opacity: 0.6,
                    fillColor: '#d93b52',
                    fillOpacity: 0.5,
                    weight:1
                },
                over: {},
                selected: {}
            },
            underway: {
                normal:{
                    color: '#78dbba',
                    opacity: 0.6,
                    fillColor: '#78dbba',
                    fillOpacity: 0.5,
                    weight:1
                },
                over: {},
                selected: {}
            },
            preplanning: {
                normal:{
                    color: '#f59918',
                    opacity: 0.6,
                    fillColor: '#f59918',
                    fillOpacity: 0.5,
                    weight:1
                },
                over: {},
                selected: {}
            },
            implemented: {
                normal:{
                    color: '#78dbba',
                    opacity: 0.6,
                    fillColor: '#78dbba',
                    fillOpacity: 0.5,
                    weight:1
                },
                over: {},
                selected: {}
            }
        }
    };

    function mergeMe(base, variant) {
        var cp = {};

        for(var style in variant) {
            cp[style] = L.Util.extend({}, base[style]);
            cp[style] = L.Util.extend(cp[style], variant[style]);
            /*
            for(var prop in variant[style]) {
                cp[style][prop] = variant[style][prop];
            }
            */
        }

        return cp;
    }

    // merge polygon styles
    for (var t in MFOM.config.styles.geojsonPolygonStyles){
        if (t !== 'base') {
            MFOM.config.styles.geojsonPolygonStyles[t] = mergeMe(
                MFOM.config.styles.geojsonPolygonStyles['base'],
                MFOM.config.styles.geojsonPolygonStyles[t]);
        }
    }

    // merge marker styles
    for (var t in MFOM.config.styles.geojsonMarkerStyles){
        if (t !== 'base') {
            MFOM.config.styles.geojsonMarkerStyles[t] = mergeMe(
                MFOM.config.styles.geojsonMarkerStyles['base'],
                MFOM.config.styles.geojsonMarkerStyles[t]);
        }
    }

    MFOM.config.map = {
        crs: new L.Proj.CRS(
                'this string is ignored', // If it has an EPSG code, put it here. If not, the next line overrides
                '+proj=laea +lat_0=40 +lon_0=-105 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs',
                {
                    transformation: new L.Transformation(1,60112700,-1,20037600), // This is the origin for the map tiles in projected coordinates
                    resolutions: [ // map scale, not sure how these were computed (seanc)
                        156543.0339296875,
                        78271.51696484375,
                        39135.758482421875, // zoom 2
                        19567.8792412109375,
                        9783.93962060546875,
                        4891.969810302734375,
                        2445.9849051513671875,
                        1222.99245257568359375,
                        611.496226287841796875,
                        305.7481131439208984375,
                        152.87405657196044921875 // zoom 10
                    ]
                }
            ),
        defaultOptions: {
            worldCopyJump: false,
            scrollWheelZoom: false,
            minZoom: 2,
            maxZoom: 10,
            attributionControl: false,
            inertia: false // !important - don't remove...
        },
        attribution: 'Map by <a href="http://stamen.com" target="_blank" title="Stamen Design">Stamen Design</a> | <a id="about-map-btn" class="modal-activator" data-target="about-map-modal" href="#" title="Contextual information about the map.">About</a>',
        mapboxTilesLowZoom: L.tileLayer('https://{s}.tiles.mapbox.com/v3/stamen.moore_lowzoom/{z}/{x}/{y}.png', {minZoom: 0, maxZoom: 5, attribution: null, continuousWorld: false}),
        mapboxTilesHighZoom: L.tileLayer('https://{s}.tiles.mapbox.com/v3/stamen.moore_highzoom/{z}/{x}/{y}.png', {minZoom: 6, maxZoom: 10, attribution: null, continuousWorld: false}),
        mapboxLabels: new L.TileLayer.Labels("https://{s}.tiles.mapbox.com/v3/stamen.moore_highzoom_labels/{z}/{x}/{y}.png", {minZoom: 0, maxZoom: 10, attribution: null, continuousWorld: false}),
        startZoom: 4,
        layers: [
                {
                    "topojson_layer": "LOMA_Beaufort_Sea",
                    "csv_id": 1
                },
                {
                    "topojson_layer": "LOMA_Eastern_Scotian_Shelf",
                    "csv_id": 2
                },
                {
                    "topojson_layer": "LOMA_Pacific_North_Coast",
                    "csv_id": 4
                },
                {
                    "topojson_layer": "bc_wcvi",
                    "csv_id": 5
                },
                {
                    "topojson_layer": "LOMA_Placentia_Bay___Grand_Banks",
                    "csv_id": 6
                },
                {
                    "topojson_layer": "NLUP_Boundary",
                    "csv_id": 7
                },
                {
                    "topojson_layer": "great_lakes",
                    "csv_id": 8
                },
                {
                    "topojson_layer": "marco_data_development_area",
                    "csv_id": 10
                },
                {
                    "topojson_layer": "nroc_data_development_area",
                    "csv_id": 11
                },
                {
                    "topojson_layer": "pacific_islands",
                    "csv_id": 12
                },
                {
                    "topojson_layer": "south_atlantic",
                    "csv_id": 13
                },
                {
                    "topojson_layer": "us_caribbean",
                    "csv_id": 14
                },
                {
                    "topojson_layer": "us_west_coast",
                    "csv_id": 15
                },
                {
                    "topojson_layer": "florida_keys",
                    "csv_id": 18
                },
                {
                    "topojson_layer": "ma_coastalzone",
                    "csv_id": 22
                },
                {
                    "topojson_layer": "oregon",
                    "csv_id": 24
                },
                {
                    "topojson_layer": "ri_coastalzone",
                    "csv_id": 25
                },
                {
                    "topojson_layer": "washington_state",
                    "csv_id": 31
                },
                {
                    "topojson_layer": "hi_humpback_sanctuary",
                    "csv_id": 32
                },
                {
                    "topojson_layer": "bc_mapp_haida_gwaii",
                    "csv_id": 33
                },
                {
                    "topojson_layer": "bc_mapp_north_coast",
                    "csv_id": 34
                },
                {
                    "topojson_layer": "LOMA_Gulf_of_Saint_Lawrence",
                    "csv_id": 39
                },
                {
                    "topojson_layer": "bc_mapp_central_coast",
                    "csv_id": 40
                },
                {
                    "topojson_layer": "bc_mapp_north_vancouver_island",
                    "csv_id": 41
                }
            ]
    }

})(window);
