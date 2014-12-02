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
        var s = Math.round(Math.log(zoom-1) * 4) ;
        return Math.max(s, 2);
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
                minZoom: 2,
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
            if (checked && !map.hasLayer(overlayMaps[key])) {
                map.addLayer(overlayMaps[key]);
                map.addLayer(eventOverlays[key]);
            }
            if (!checked && map.hasLayer(overlayMaps[key])) {
                map.removeLayer(overlayMaps[key]);
                map.removeLayer(eventOverlays[key]);
            }

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

        var availableGroups;
        function getAvailableGroups() {
            availableGroups = {};
            d3.select("#overlaySelectr")
                .selectAll('input[type="checkbox"]')
                .each(function(){
                    var key = this.getAttribute('data-key');
                    var checked = this.checked;
                    var forced = overlayMaps[key].forcedOff;

                    if (checked && !forced) availableGroups[key] = 1;
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

        var layerSelectors;
        function makeOverlayControl() {
            layerSelectors = {};
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
                var parentBtn = parent.append('button')
                    .attr('class', 'link')
                    .text(group);

                parentBtn.append('a')
                    .attr('href', '#')
                    .attr('class', 'parent-toggle checkbox-toggler selected')
                    .html('');


                var child = parent.append('ul');

                for (var l in sub) {
                    var subchild = child.append('li')
                        .attr('class', 'level-1')
                    subchild.append('button')
                        .attr('class', 'link')
                        .html(l)
                        .append('a')
                        .attr('href', '#')
                        .attr('class', 'checkbox-toggler selected')
                        .html('');

                    var ss = subchild.append('ul');
                    for (var c in sub[l]) {
                        var key = sub[l][c].key;
                        var checked = map.hasLayer(overlayMaps[key]);
                        var li = ss.append('li').attr('class', 'checkbox-item');
                        var label = li.append('label');

                        label.append('input')
                            .attr('type', 'checkbox')
                            .property('checked', checked)
                            .attr('data-key', key);
                        label.append('span')
                            .text(sub[l][c].label);
                        layerSelectors[key] = li.node();
                    }

                }
            }

            root.selectAll('.link')
                .on('click', function(){
                    var status = d3.select(this.parentNode).classed('open');
                    d3.select(this.parentNode).classed('open', !status);
                });
            var layerCtrl = d3.select("#overlaySelectr");

            /*
            layerCtrl
                .on('mouseover', function(){
                    d3.event.preventDefault();
                    layerCtrl.classed('expanded', true);
                })
                .on('mouseout', function(){
                    d3.event.preventDefault();
                    layerCtrl.classed('expanded', false);
                });
            */

            function openLayerController() {
                layerCtrl.classed('expanded', true);
                d3.select('#map')
                    .on('click.layerCtrlr', closeLayerController);
            }

            function closeLayerController() {
                layerCtrl.classed('expanded', false);
                d3.select('#map')
                    .on('click.layerCtrlr', null);
            }

            layerCtrl.select('a.map-layers')
                .on('click', function(){
                    d3.event.preventDefault();
                    openLayerController();
                });

            layerCtrl.select('#overlaySelectr-close')
                .on('click',closeLayerController);


            root.selectAll('input[type="checkbox"]')
                .on('change', function(){
                    d3.event.preventDefault();

                    var key = this.getAttribute('data-key');
                    var checked = this.checked;
                    onLayerSelectorChange(key, checked)
                });


            function setParentToggle(elm, state) {
                while(elm) {

                    if (d3.select(elm).classed('top-level')) {
                        var t = 0;
                        var toggle = d3.select(elm).select('.parent-toggle');
                        d3.select(elm).selectAll('input[type="checkbox"]')
                        .each(function(){
                            if (!this.checked) t++;
                        });

                        console.log("t: ", t);


                        toggle.classed('selected', (t > 0) ? false : true);
                        elm = null;
                    } else {
                        elm = elm.parentNode;
                    }

                }
            }
            root.selectAll('.checkbox-toggler')
                .on('click', function(){
                    d3.event.preventDefault();
                    d3.event.stopImmediatePropagation();

                    var state = !(d3.select(this).classed('selected'));
                    d3.select(this).classed('selected', state);


                    // parent of button not toggle link
                    var parentNode = d3.select(this.parentNode.parentNode);



                    parentNode.select('ul').selectAll('.checkbox-toggler')
                                .classed('selected', state);
                    parentNode
                        .selectAll('input[type="checkbox"]')
                        .each(function(){
                            this.checked = state;
                            this.forcedOff = !state;

                            var key = this.getAttribute('data-key');
                            overlayMaps[key].forcedOff = !state;

                            if (state && !map.hasLayer(overlayMaps[key])) {
                                map.addLayer(overlayMaps[key]);
                                map.addLayer(eventOverlays[key]);
                            }
                            if (!state && map.hasLayer(overlayMaps[key])) {
                                map.removeLayer(overlayMaps[key]);
                                map.removeLayer(eventOverlays[key]);
                            }

                        });

                    if (!d3.select(this).classed('parent-toggle')) setParentToggle(this, state);
                    getAvailableGroups();
                    if (currentFilters) __.filterOn(currentFilters);
                })

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
                                circleMarker.setRadius(getRadiusByZoom(initialZoom));
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
            makeOverlayControl()
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

            if (!availableGroups || !layerSelectors) return;

            var bds;
            for(var overlay in overlayMaps) {
                var props = overlayMaps[overlay].properties;
                var forcedOff = overlayMaps[overlay].forcedOff;
                if (!availableGroups.hasOwnProperty(overlay)) continue;

                var valid = true,
                    value;
                filters.forEach(function(k) {
                    if (k.value) {
                        value = k.value;
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

                if (forcedOff) valid = false;

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
                    if (layerSelectors && overlay in layerSelectors) d3.select(layerSelectors[overlay]).classed('disabled', false);

                } else {
                    if (overlay in overlayMaps) map.removeLayer(overlayMaps[overlay]);
                    if (overlay in eventOverlays) map.removeLayer(eventOverlays[overlay]);
                    if (layerSelectors && overlay in layerSelectors) d3.select(layerSelectors[overlay]).classed('disabled', true);
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