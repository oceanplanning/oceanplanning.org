/*
    Moore Foundation Ocean Map
    MFOM.map.js
    Map View for Ocean Map
*/

(function(exports) {
    'use strict';
    var MFOM = exports.MFOM || (exports.MFOM = {});

    // Map utilities
    function getRadiusByZoom(zoom) {
        //return (Math.pow(2,zoom))/2; // base 2 keeps them same geographical size. Dividing by 2 makes that size smaller
        return (Math.pow(1.7,zoom))/2; // base < 2 means they get bigger as you zoom, but not as big as the geography does
    }

    MFOM.map = function(selector) {
        var __ = {};

        var overlayMaps,markerList;

        var map = L.map(selector, {
                crs: MFOM.config.map.crs,
                continuousWorld: false,
                worldCopyJump: false,
                scrollWheelZoom: false
            })
            .addLayer(MFOM.config.map.mapboxTiles)
            .setView([35, -105], MFOM.config.map.startZoom);

        map.on('zoomend', function() {
            if (!markerList) return;

            var currentZoom = map.getZoom();
            markerList.forEach(function(marker) {
                marker.setRadius(getRadiusByZoom(currentZoom));
                //console.log(currentZoom, getRadiusByZoom(currentZoom));
            });
        });

        function geojsonStyle(feature) {
            return MFOM.config.styles.geojsonPolyStyle;
        }

        function onEachFeature(feature, layer) {
            if (feature && feature.hasOwnProperty("properties") && feature.properties && feature.properties.hasOwnProperty("Location")) {
                var html = feature.properties.Location + "<br>" + feature.properties['Narrative (250, no formatting or links)'];
            } else {
                var html = "Location not found";
            }
            layer.bindPopup(html);
        }

        function drawOverlays(layers) {
            layers.sort(function(a, b) { return d3.ascending(+a.csv_id, +b.csv_id);})
                .forEach(function(lyr) {
                    lyr.layer = new L.GeoJSON(lyr.geojson, {
                        style: geojsonStyle,
                        onEachFeature: onEachFeature
                    });

                    map.addLayer(lyr.layer);

                    lyr.layer.on("mouseover", function (e) {
                        lyr.layer.setStyle(MFOM.config.styles.geojsonPolyHighlighted);
                    });
                    lyr.layer.on("mouseout", function (e) {
                        lyr.layer.setStyle(MFOM.config.styles.geojsonPolyStyle);
                    });

                    var label = lyr.geojson.features[0].properties.Location;
                    if (!label) label = "no shape";
                    overlayMaps[lyr.csv_id + ": " + label] = lyr.layer;
                });
        }

        // Create point map layers for any rows that have lat & lon
        function drawPoints(eezs) {
            eezs.sort(function(a,b) { return d3.ascending(+a.ID, +b.ID);})
                .forEach(function(row) {
                    if (!row.Latitude || !row.Longitude) return;

                    var layer = L.geoJson({
                            "type": "Feature",
                            "properties": row,
                            "geometry": {
                                "type": "Point",
                                "coordinates": [row.Longitude, row.Latitude]
                            }
                        }, {
                            pointToLayer: function(feature, latlng) {
                                var circleMarker = L.circleMarker(latlng, MFOM.config.styles.geojsonMarkerOptions);
                                markerList.push(circleMarker);
                                circleMarker.setRadius(getRadiusByZoom(MFOM.config.map.startZoom));
                                return circleMarker;
                            },
                            onEachFeature: onEachFeature
                        });

                    map.addLayer(layer);
                    layer.on("mouseover", function (e) {
                        layer.setStyle(MFOM.config.styles.geojsonMarkerHighlighted);
                    });
                    layer.on("mouseout", function (e) {
                        layer.setStyle(MFOM.config.styles.geojsonMarkerOptions);
                    });
                    overlayMaps[row.ID + ": " + row.Location] = layer;

                });
        }

        function addOverlayControl() {
            L.control.layers(null, overlayMaps, {collapsed: true}).addTo(map);
        }


        __.onData = function(layers, eezs) {
            overlayMaps = {};
            markerList = [];
            drawOverlays(layers);
            drawPoints(eezs);
            addOverlayControl();
        };

        return __;
    };

})(window);