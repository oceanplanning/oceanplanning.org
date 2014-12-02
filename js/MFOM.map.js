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

        var overlayMaps, eventOverlays, markerList;

        var hash = STA.hasher.getMapState(STA.hasher.get());

        var initialLocation = (hash && hash[0]) ? hash[0] : [35, -105],
            initialZoom = (hash && hash[1]) ? hash[1] : MFOM.config.map.startZoom;

        var map = L.map(selector, {
                crs: MFOM.config.map.crs,
                continuousWorld: false,
                worldCopyJump: false,
                scrollWheelZoom: false,
                layers: [MFOM.config.map.mapboxTilesLowZoom, MFOM.config.map.mapboxTilesHighZoom, MFOM.config.map.mapboxLabels]
            })
            .setView(initialLocation, initialZoom);



        var layerControl;
        var selectedCountry = null;
        var layerControlReset = false;
        var groups = [];

        map.on('zoomend', function() {
            if (!markerList) return;

            var currentZoom = map.getZoom();
            markerList.forEach(function(marker) {
                marker.setRadius(getRadiusByZoom(currentZoom));
                //console.log(currentZoom, getRadiusByZoom(currentZoom));
            });
        });
        map.on('moveend', onMoveEndHandler, self);

        map.on('click', function(e) {
          // This click event only fires if the user clicks somewhere not on a feature.
          map.closePopup();
        });

        map.on('overlayremove overlayadd', function(type, obj) {
            if (layerControlReset) return;
            console.log("OVERLAY ADD OR REMOVE: ", type, obj);
            getAvailableGroups();
            if (currentFilters) __.filterOn(currentFilters);
        });

        function onLayerSelectorChange(key, checked) {
            if (checked && !map.hasLayer(overlayMaps[key])) map.addLayer(overlayMaps[key]);
            if (!checked && map.hasLayer(overlayMaps[key])) map.removeLayer(overlayMaps[key]);

            getAvailableGroups();
            if (currentFilters) __.filterOn(currentFilters);
        }

        function onMoveEndHandler(e) {
            var center = map.getCenter(),
                zoom = map.getZoom();
            var h = STA.hasher.get();

            if (h.intro) return;
            STA.hasher.setMapState(center, zoom);
        };

        function geojsonStyle(feature) {
            return feature.properties.status == "Pre-planning" ? MFOM.config.styles.geojsonPolyStylePreplanning : MFOM.config.styles.geojsonPolyStyle;
        }

        function onEachFeature(feature, layer) {
            return;
            if (feature && feature.hasOwnProperty("properties") && feature.properties && feature.properties.hasOwnProperty("location")) {
                var html = feature.properties.location + "<br>" + feature.properties.status + "<br>" + feature.properties['narrative'];
            } else {
                var html = "Location not found";
            }
            layer.bindPopup(html);
        }

        function showTip(e) {
            var props = e.target.properties || null;
            var html = "Location not found";
            if (props && props.hasOwnProperty("location")) {
                html = props.location;
            }

            var hover_bubble = new L.Rrose({ offset: new L.Point(0,-10), closeButton: false, autoPan: false })
              .setContent(html)
              .setLatLng(e.latlng)
              .openOn(map);
            //popupOpen = true;
        }

        function hideTip() {
            //popupOpen = false;
            map.closePopup();
        }




        function setupOverlays(layers) {
            layers.sort(function(a, b) { return d3.ascending(+a.csv_id, +b.csv_id);})
                .forEach(function(lyr) {
                    lyr.layer = new L.GeoJSON(lyr.geojson, {
                        style: geojsonStyle,
                        onEachFeature: onEachFeature,
                        pathRootName: 'main'
                    });

                    lyr.eventLayer = new L.GeoJSON(lyr.geojson, {
                        style: MFOM.config.styles.eventStyle,
                        onEachFeature: onEachFeature,
                        pathRootName: 'evts'
                    });

                    //map.addLayer(lyr.layer);

                    lyr.eventLayer.on('mouseover mousemove', function(e){
                        if (lyr.layer.selected) return;
                        showTip(e);
                        lyr.layer.setStyle(MFOM.config.styles.geojsonPolyMouseover);

                    });

                    lyr.eventLayer.on('mouseout', function(e){
                        hideTip();
                        if (lyr.layer.selected) return;
                        lyr.layer.setStyle(lyr.geojson.features[0].properties.status == "Pre-planning" ? MFOM.config.styles.geojsonPolyStylePreplanning : MFOM.config.styles.geojsonPolyStyle);
                    });

                    lyr.eventLayer.on('click', function(e){
                        hideTip();
                        var props = lyr.layer.properties;
                        var h = STA.hasher.get();
                        // If current ID is already selected, reset selections to nothing
                        if (h.id == props['id'])
                          h.id = null;
                        else
                          h.id = props['id'];
                        STA.hasher.set(h);
                    });


                    var label = lyr.geojson.features[0].properties.location;
                    if (!label) label = "no shape";
                    lyr.eventLayer.properties = lyr.geojson.features[0].properties;
                    lyr.layer.properties = lyr.geojson.features[0].properties;
                    var overlayKey = lyr.csv_id + ": " + label;

                    lyr.layer.lookupKey = overlayKey;
                    lyr.eventLayer.lookupKey = overlayKey;

                    overlayMaps[overlayKey] = lyr.layer;
                    eventOverlays[overlayKey]= lyr.eventLayer;

                });

        }

        /*
        d3.selectAll('.leaflet-control-layers-selector')
        .each(function(item){
          var value = this.checked,
            group = this.getAttribute('data-group');
          console.log(group, value);
        });
        */

        var availableGroups;
        function getAvailableGroups() {
            availableGroups = {};
            d3.select("#overlaySelectr")
                .selectAll('input[type="checkbox"]')
                .each(function(){
                    var key = this.getAttribute('data-key');
                    var checked = this.checked;

                    if (checked) availableGroups[key] = 1;
                });

        }


        function removeAllLayers() {
            var overlay;
            for (overlay in overlayMaps) {
                if (map.hasLayer(overlayMaps[overlay])) map.removeLayer(overlayMaps[overlay]);
            }

            for (overlay in eventOverlays) {
                if (map.hasLayer(eventOverlays[overlay])) map.removeLayer(eventOverlays[overlay]);
            }
        }

        function groupOverlays() {
            layerControlReset = true;
            var root = d3.select("#overlaySelectr .inner");
            root.selectAll('ul').remove();

            removeAllLayers();

            var o = {};
            var q = {};
            for (var overlay in overlayMaps) {
                var lyr = overlayMaps[overlay];
                var props = lyr.properties;
                var country = props.country,
                    scale = props.scale,
                    label = props.location,
                    layerName = lyr.lookupKey;

                if (selectedCountry && country.toLowerCase() !== selectedCountry.toLowerCase()) continue;
                if (!o.hasOwnProperty(country)) {
                    o[country] = {};
                    q[country] = {};
                }
                if (!o[country].hasOwnProperty(scale)) o[country][scale] = {};

                if (!q[country].hasOwnProperty(layerName))q[country][layerName] = overlayMaps[layerName];
                o[country][scale][layerName] = {
                    label: label,
                    key: layerName
                };
            }

            // add layers
            for (var country in o) {
                for (var scale in o[country]) {
                    for (var l in o[country][scale]) {
                        var key = o[country][scale][l].key;
                        map.addLayer(overlayMaps[key]);
                        map.addLayer(eventOverlays[key]);
                    }
                }
            }

            // make menu
            var ul = root.append('ul');

            for(var group in o) {
                var sub = o[group];
                var parent = ul.append('li')
                    .attr('class', 'top-level');
                parent.append('button')
                    .attr('class', 'link')
                    .text(group);

                var child = parent.append('ul');

                for (var l in sub) {
                    var subchild = child.append('li')
                        .attr('class', 'level-1')
                    subchild.append('button')
                        .attr('class', 'link')
                        .html(l);
                    var ss = subchild.append('ul');
                    for (var c in sub[l]) {
                        var key = sub[l][c].key;
                        var checked = map.hasLayer(overlayMaps[key]);
                        var li = ss.append('li');
                        var label = li.append('label')
                        label.append('input')
                            .attr('type', 'checkbox')
                            .property('checked', checked)
                            .attr('data-key', key);
                        label.append('span')
                            .text(sub[l][c].label);
                    }

                }
            }

            root.selectAll('.link')
                .on('click', function(){
                    var status = d3.select(this.parentNode).classed('open');
                    d3.select(this.parentNode).classed('open', !status);
                });
            var layerCtrl = d3.select("#overlaySelectr");

            layerCtrl
                .on('mouseover', function(){
                    d3.event.preventDefault();
                    layerCtrl.classed('expanded', true);
                })
                .on('mouseout', function(){
                    d3.event.preventDefault();
                    layerCtrl.classed('expanded', false);
                });

            layerCtrl.select('a.map-layers')
                .on('click', function(){
                    d3.event.preventDefault();
                });


            root.selectAll('input[type="checkbox"]')
                .on('change', function(){
                    d3.event.preventDefault();

                    var key = this.getAttribute('data-key');
                    var checked = this.checked;
                    onLayerSelectorChange(key, checked)
                });

            getAvailableGroups();


            // add group control
            /*
            console.log(q)
            layerControl = L.control.nestedLayers(null, q);
            map.addControl(layerControl);

            layerControlReset = false;
            exports.layerControl = layerControl;
            getAvailableGroups()
            */
        }

        // Create point map layers for any rows that have lat & lon
        function setupPoints(eezs) {
            eezs.sort(function(a,b) { return d3.ascending(+a.id, +b.id);})
                .forEach(function(row) {
                    if (!row.latitude || !row.longitude) return;

                    var overlayKey = row.id + ": " + row.location;
                    if (overlayKey in overlayMaps) return; // Skip if this area already has a shape loaded

                    var layer = new L.GeoJSON({
                            "type": "Feature",
                            "properties": row,
                            "geometry": {
                                "type": "Point",
                                "coordinates": [row.longitude, row.latitude]
                            }
                        }, {
                            pointToLayer: function(feature, latlng) {
                                var opts = L.Util.extend({}, row.status == "Pre-planning" ? MFOM.config.styles.geojsonMarkerOptionsPreplanning : MFOM.config.styles.geojsonMarkerOptions);
                                opts.pathRootName = 'main';
                                var circleMarker = L.circleMarker(latlng, opts);
                                markerList.push(circleMarker);
                                circleMarker.setRadius(getRadiusByZoom(MFOM.config.map.startZoom));
                                return circleMarker;
                            },
                            onEachFeature: onEachFeature,
                            pathRootName: 'main'
                        });

                    var eventLayer = new L.GeoJSON({
                            "type": "Feature",
                            "properties": row,
                            "geometry": {
                                "type": "Point",
                                "coordinates": [row.longitude, row.latitude]
                            }
                        }, {
                            pointToLayer: function(feature, latlng) {
                                var opts = L.Util.extend({},MFOM.config.styles.eventStyle);
                                opts.pathRootName = 'evts';
                                var circleMarker = L.circleMarker(latlng, opts);
                                markerList.push(circleMarker);
                                circleMarker.setRadius(getRadiusByZoom(MFOM.config.map.startZoom));
                                return circleMarker;
                            },
                            onEachFeature: onEachFeature,
                            pathRootName: 'evts'
                        });

                    eventLayer.on("mouseover", function (e) {
                        if (layer.selected) return;
                        showTip(e);
                        layer.setStyle(MFOM.config.styles.geojsonMarkerMouseover);
                    });

                    eventLayer.on("mouseout", function (e) {
                        hideTip(e);
                        if (layer.selected) return;
                        layer.setStyle(e.layer.feature.properties.status == "Pre-planning" ? MFOM.config.styles.geojsonMarkerOptionsPreplanning : MFOM.config.styles.geojsonMarkerOptions);
                    });

                    eventLayer.on('click', function(e){
                        hideTip();
                        var props = layer.properties;
                        var h = STA.hasher.get();
                        // If current ID is already selected, reset selections to nothing
                        if (h.id == props['id'])
                          h.id = null;
                        else
                          h.id = props['id'];
                        STA.hasher.set(h);
                    });

                    layer.lookupKey = overlayKey;
                    eventLayer.lookupKey = overlayKey;

                    layer.properties = row;
                    eventLayer.properties = row;

                    overlayMaps[overlayKey] = layer;
                    eventOverlays[overlayKey] = eventLayer;

                });
        }

        function addOverlayControl() {
            // group layers
            groupOverlays()
        }

        // call onMoveEndHandler to set map coordinates to hash
        onMoveEndHandler();

        __.highlightOverlay = function(data) {
            var id = data['id'] || null;
            for(var overlay in overlayMaps) {
                var props = overlayMaps[overlay].properties;

                if (props['id'] === id) {
                    overlayMaps[overlay].selected = true;
                    if ('pointToLayer' in overlayMaps[overlay].options) // Test if it's a point overlay
                      overlayMaps[overlay].setStyle(MFOM.config.styles.geojsonMarkerHighlighted);
                    else
                      overlayMaps[overlay].setStyle(MFOM.config.styles.geojsonPolyHighlighted);
                } else {
                    overlayMaps[overlay].selected = false;
                    if ('pointToLayer' in overlayMaps[overlay].options) // Test if it's a point overlay
                      overlayMaps[overlay].setStyle(props['status'] == "Pre-planning" ? MFOM.config.styles.geojsonMarkerOptionsPreplanning : MFOM.config.styles.geojsonMarkerOptions);
                    else
                      overlayMaps[overlay].setStyle(props['status'] == "Pre-planning" ? MFOM.config.styles.geojsonPolyStylePreplanning : MFOM.config.styles.geojsonPolyStyle);
                }

            }
        };

        var currentFilters = null;
        __.filterOn = function(filters) {
            currentFilters = filters;
            if (!availableGroups) return;

            var bds;
            for(var overlay in overlayMaps) {
                var props = overlayMaps[overlay].properties;

                if (!availableGroups.hasOwnProperty(overlay)) continue;

                var valid = true,
                    value;
                filters.forEach(function(k) {
                    if (k.value) {
                        value = k.value
                        if (k.key === 'status') {
                            value = MFOM.config.statusLookup[k.value] || null;
                        }

                        if (value instanceof RegExp) {
                            if (!value.test(props[k.key])) valid = false;
                        } else {
                            if (props[k.key] !== value) valid = false;
                        }
                    }
                });

                if (valid &&
                    overlay in overlayMaps &&
                    overlay in eventOverlays) {

                    if (!bds) {
                        bds = L.latLngBounds(overlayMaps[overlay].getBounds());
                    } else {
                        bds.extend(overlayMaps[overlay].getBounds());
                    }

                    if (!map.hasLayer(overlayMaps[overlay])) {
                         map.addLayer(overlayMaps[overlay]);
                         map.addLayer(eventOverlays[overlay]);
                    }

                } else {
                    if (overlay in overlayMaps) map.removeLayer(overlayMaps[overlay]);
                    if (overlay in eventOverlays) map.removeLayer(eventOverlays[overlay]);
                }
            }

            // Something weird going on with probably custom projection
            if (bds && bds.isValid()) {
               // map.fitBounds(bds, {animate: false, paddingTopLeft:[-150, 0] });
            }
        };

        __.countryChange = function(country) {
            selectedCountry = country;
            addOverlayControl();
        };

        __.onData = function(layers, eezs) {
            overlayMaps = {};
            eventOverlays = {};
            markerList = [];

            // assign handlers and add to overlayMaps object
            setupOverlays(layers);
            setupPoints(eezs);

            // adds Points & Overlays to map as groups
            addOverlayControl();
        };

        return __;
    };

})(window);