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
        var popup = L.popup({
            closeButton: false,
            offset: [0, -6]
        }),
        popupOpen = false;

        map.on('mousemove', function(e){
            if (popupOpen) {
                popup.setLatLng(e.latlng);
            }
        })

        map.on('zoomend', function() {
            if (!markerList) return;

            var currentZoom = map.getZoom();
            markerList.forEach(function(marker) {
                marker.setRadius(getRadiusByZoom(currentZoom));
                //console.log(currentZoom, getRadiusByZoom(currentZoom));
            });
        });
        map.on('moveend', onMoveEndHandler, self);

        function onMoveEndHandler(e) {
            var center = map.getCenter(),
                zoom = map.getZoom();
            var h = STA.hasher.get();

            if (h.intro) return;
            STA.hasher.setMapState(center, zoom);
        };

        function geojsonStyle(feature) {
            return feature.properties.Status == "Pre-planning phase" ? MFOM.config.styles.geojsonPolyStylePreplanning : MFOM.config.styles.geojsonPolyStyle;
        }

        function onEachFeature(feature, layer) {

            return;
            if (feature && feature.hasOwnProperty("properties") && feature.properties && feature.properties.hasOwnProperty("Location")) {
                var html = feature.properties.Location + "<br>" + feature.properties.Status + "<br>" + feature.properties['Narrative (250, no formatting or links)'];
            } else {
                var html = "Location not found";
            }
            layer.bindPopup(html);
        }

        function showTip(e) {
            var props = e.target.properties || null;
            var html = "Location not found";
            if (props && props.hasOwnProperty("Location")) {
                html = props.Location;
            }
            popup
                .setContent(html)
                .setLatLng(e.latlng)
                .openOn(map);
            popupOpen = true;
        }

        function hideTip(e) {
            popupOpen = false;
            map.closePopup(popup);
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
                        if (lyr.layer.selected) return;
                        showTip(e);
                        lyr.layer.setStyle(MFOM.config.styles.geojsonPolyHighlighted);
                    });
                    lyr.layer.on("mouseout", function (e) {
                        hideTip(e);
                        if (lyr.layer.selected) return;
                        lyr.layer.setStyle(lyr.geojson.features[0].properties.Status == "Pre-planning phase" ? MFOM.config.styles.geojsonPolyStylePreplanning : MFOM.config.styles.geojsonPolyStyle);
                    });

                    lyr.layer.on('click', function(e){
                        hideTip();
                        var props = lyr.layer.properties;
                        var h = STA.hasher.get();
                        h.id = props['ID'];
                        STA.hasher.set(h);
                    });

                    var label = lyr.geojson.features[0].properties.Location;
                    if (!label) label = "no shape";
                    lyr.layer.properties = lyr.geojson.features[0].properties;
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
                                var circleMarker = L.circleMarker(latlng, row.Status == "Pre-planning phase" ? MFOM.config.styles.geojsonMarkerOptionsPreplanning : MFOM.config.styles.geojsonMarkerOptions);
                                markerList.push(circleMarker);
                                circleMarker.setRadius(getRadiusByZoom(MFOM.config.map.startZoom));
                                return circleMarker;
                            },
                            onEachFeature: onEachFeature
                        });

                    map.addLayer(layer);

                    layer.on("mouseover", function (e) {
                        if (layer.selected) return;
                        showTip(e);
                        layer.setStyle(MFOM.config.styles.geojsonMarkerHighlighted);
                    });

                    layer.on("mouseout", function (e) {
                        hideTip(e);
                        if (layer.selected) return;
                        layer.setStyle(e.layer.feature.properties.Status == "Pre-planning phase" ? MFOM.config.styles.geojsonMarkerOptionsPreplanning : MFOM.config.styles.geojsonMarkerOptions);
                    });

                    layer.on('click', function(e){
                        hideTip();
                        var props = layer.properties;
                        var h = STA.hasher.get();
                        h.id = props['ID'];
                        STA.hasher.set(h);
                    });

                    layer.properties = row;
                    overlayMaps[row.ID + ": " + row.Location] = layer;

                });
        }

        function addOverlayControl() {
            //L.control.layers(null, overlayMaps, {collapsed: true}).addTo(map);
            return;
        }

        onMoveEndHandler();

        __.highlightOverlay = function(data) {
            var id = data['ID'] || null;
            for(var overlay in overlayMaps) {
                var props = overlayMaps[overlay].properties;

                if (props['ID'] === id) {
                    overlayMaps[overlay].selected = true;
                    overlayMaps[overlay].setStyle(MFOM.config.styles.geojsonPolyHighlighted);
                } else {
                    overlayMaps[overlay].selected = false;
                    overlayMaps[overlay].setStyle(MFOM.config.styles.geojsonPolyStyle);
                }

            }
        };

        __.filterOn = function(key, value) {
            for(var overlay in overlayMaps) {
                var props = overlayMaps[overlay].properties;
                if (typeof key === 'string') {
                    if (props[key] === value) {
                        if (!map.hasLayer()) map.addLayer(overlayMaps[overlay]);
                    } else {
                        map.removeLayer(overlayMaps[overlay]);
                    }
                } else {
                    var valid = true;
                    key.forEach(function(k) {

                        if (k.value) {
                            value = k.value
                            if (k.key === 'Status') {
                                value = MFOM.config.statusLookup[k.value] || null;
                            }

                            if (value instanceof RegExp) {
                                if (!value.test(props[k.key])) valid = false;
                            } else {
                                if (props[k.key] !== value) valid = false;
                            }
                        }

                    });

                    if (valid) {
                        if (!map.hasLayer()) map.addLayer(overlayMaps[overlay]);
                    } else {
                        map.removeLayer(overlayMaps[overlay]);
                    }
                }

            }
        };

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