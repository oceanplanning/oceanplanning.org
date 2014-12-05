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
        var s = Math.round(Math.log(zoom+1) * 4);
        return Math.max(s, 5);
    }

    MFOM.map = function(selector) {
        var __ = {};

        var overlayMaps, eventOverlays, markerList;

        var hash = STA.hasher.getMapState(STA.hasher.get());

        var initialLocation = (hash && hash[0]) ? hash[0] : [35, -105],
            initialZoom = (hash && hash[1]) ? hash[1] : MFOM.config.map.startZoom;

        var mapOptions = L.Util.extend({}, MFOM.config.map.defaultOptions);
        mapOptions.crs = MFOM.config.map.crs;
        mapOptions.layers = [MFOM.config.map.mapboxTilesLowZoom,
                            MFOM.config.map.mapboxTilesHighZoom,
                            MFOM.config.map.mapboxLabels
                        ];

        var map = L.map(selector, mapOptions)
            .setView(initialLocation, initialZoom);
        L.control.attribution({prefix: false}).addAttribution(MFOM.config.map.attribution).addTo(map);
        window.mapp = map;

        var layerControl;
        var selectedCountry = null;
        var selectedRegion = [];
        var layerControlReset = false;
        var groups = [];

        map.on('zoomend', function() {
            if (!markerList) return;
            var currentZoom = map.getZoom();
            markerList.forEach(function(marker) {
                marker.setRadius(getRadiusByZoom(currentZoom));
            });
        });
        map.on('moveend', onMoveEndHandler, self);

        map.on('click', function(e) {
          // This click event only fires if the user clicks somewhere not on a feature.
          map.closePopup();
        });

        map.on('overlayremove overlayadd', function(type, obj) {
            if (layerControlReset) return;
            getAvailableGroups();
            if (currentFilters) __.filterOn(currentFilters);
        });

        function onLayerSelectorChange(key, checked) {
            if (checked) {
                insertLayer(key);
            } else {
                removeLayer(key);
            }

            setSelectedRegionIndex();
            getAvailableGroups();
            if (currentFilters) __.filterOn(currentFilters);
        }

        function onMoveEndHandler(e) {
            var center = map.getCenter(),
                zoom = map.getZoom();
            var h = STA.hasher.get();

            if (h.intro) return;
            STA.hasher.setMapState(center, zoom);
        }

        function isPointLayer(feature) {
            return (feature.hasOwnProperty('options') && 'pointToLayer' in feature.options) ||
                    (feature.hasOwnProperty('geometry') && feature.geometry.type === 'Point');
        }

        // all requests for a style should come through here
        function geojsonStyle(feature, isPoint, extra) {
            var status = (feature.hasOwnProperty('properties')) ?
                    feature.properties.status : feature.status;

            isPoint = (typeof isPoint === 'boolean') ? isPoint : isPointLayer(feature);

            var variantKey = (status in MFOM.config.styles.geojsonPolygonStyles) ?
                MFOM.config.styles.geojsonPolygonStyles[status] : 'base';

            var styleKey = isPoint ? 'geojsonMarkerStyles' : 'geojsonPolygonStyles';

            if (feature.selected)  return MFOM.config.styles[styleKey][variantKey]['selected'];

            if (extra === 'over') return MFOM.config.styles[styleKey][variantKey]['over'];

            return MFOM.config.styles[styleKey][variantKey]['normal'];
        }

        function onEachFeature(feature, layer) {
            return;
        }

        function showTip(e) {
            var props = e.target.properties || null;
            var html = "Location not found";
            if (props && props.hasOwnProperty("location")) {
                html = props.location;
            }

            new L.Rrose({ offset: new L.Point(0,-10), closeButton: false, autoPan: false })
                .setContent(html)
                .setLatLng(e.latlng)
                .openOn(map);
        }

        function hideTip() {
            map.closePopup();
        }

        var sortingIndex;
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

                    lyr.eventLayer.on('mouseover mousemove', function(e){
                        if (lyr.layer.selected) return;
                        showTip(e);
                        lyr.layer.setStyle(geojsonStyle(lyr.layer, false, 'over'));

                    });

                    lyr.eventLayer.on('mouseout', function(e){
                        hideTip();
                        if (lyr.layer.selected) return;
                        lyr.layer.setStyle(geojsonStyle(lyr.layer));
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

                    var tl = map.project(lyr.layer.getBounds().getNorthWest()),
                        br = map.project(lyr.layer.getBounds().getSouthEast());
                    var size = Math.abs(tl.x - br.x) * Math.abs(tl.y - br.y);

                    var label = lyr.geojson.features[0].properties.location;
                    if (!label) label = "no shape";
                    lyr.eventLayer.properties = lyr.geojson.features[0].properties;
                    lyr.layer.properties = lyr.geojson.features[0].properties;
                    var overlayKey = lyr.csv_id + ": " + label;

                    lyr.layer.lookupKey = overlayKey;
                    lyr.eventLayer.lookupKey = overlayKey;

                    overlayMaps[overlayKey] = lyr.layer;
                    eventOverlays[overlayKey]= lyr.eventLayer;
                    sortingIndex.push({
                        key: overlayKey,
                        size: size
                    });
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
                    var forced = overlayMaps[key].forcedOff || false;
                    if (checked && !forced) {
                        availableGroups[key] = 1;
                    }
                });

        }

        function returnLayerToIndex(lyr) {
            if (L.Browser.ie || L.Browser.opera) return lyr;

            var root,path;
            var idx = lyr.zindex_ + 1;
            lyr.eachLayer(function(l){
                    root = l._pathRoot;
                    path = l._container;

                    if (root && path) {
                        var children = root.children || root.childNodes;
                        if (children && children[idx]) {
                            root.insertBefore(path, children[idx]);
                        } else {
                            root.appendChild(path);
                        }
                    }
                    path = null;
                });

            return lyr;
        }

        function setSelectedRegionIndex() {
            if (L.Browser.ie || L.Browser.opera) return;
            if (selectedRegion && selectedRegion.length) {
                selectedRegion.forEach(function(key){
                    overlayMaps[key].bringToFront();
                    eventOverlays[key].bringToFront();
                });
            }
        }

        function setLayers() {
            var s = sortingIndex.sort(function(a,b){
                return d3.descending(a.size, b.size);
            });


            var len = s.length-1;

            s.forEach(function(d,i){
                var k = d.key;
                var r = len - i;

                if (overlayMaps[k].allowed) {
                    map.addLayer(overlayMaps[k]);
                    map.addLayer(eventOverlays[k]);
                    overlayMaps[k].zindex_ = r;
                    eventOverlays[k].zindex_ = r;
                }

            });

            setSelectedRegionIndex();
        }

        function insertLayer(key) {
            if (!overlayMaps.hasOwnProperty(key)) return;
            if (!map.hasLayer(overlayMaps[key])) map.addLayer(overlayMaps[key]);
            if (!map.hasLayer(eventOverlays[key])) map.addLayer(eventOverlays[key]);

            if (overlayMaps[key].selected) return;

            returnLayerToIndex(overlayMaps[key]);
            returnLayerToIndex(eventOverlays[key]);
        }

        function removeLayer(key) {
            if (!overlayMaps.hasOwnProperty(key)) return;
            if (map.hasLayer(overlayMaps[key])) map.removeLayer(overlayMaps[key]);
            if (map.hasLayer(eventOverlays[key])) map.removeLayer(eventOverlays[key]);
        }

        function removeAllLayers() {
            for (var overlay in overlayMaps) {
                removeLayer(overlay);
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

                overlayMaps[overlay].allowed = false;

                if (selectedCountry &&
                        country.toLowerCase() !== selectedCountry.toLowerCase()) continue;

                if (!o.hasOwnProperty(country)) {
                    o[country] = {};
                    q[country] = {};
                }
                if (!o[country].hasOwnProperty(scale)) o[country][scale] = {};

                if (!q[country].hasOwnProperty(layerName))
                    q[country][layerName] = overlayMaps[layerName];

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
                        overlayMaps[key].allowed = true;
                    }
                }
            }

            setLayers();

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

            function setParentToggle(elm, state) {
                while(elm) {

                    if (d3.select(elm).classed('top-level')) {
                        var t = 0;
                        var toggle = d3.select(elm).select('.parent-toggle');
                        d3.select(elm).selectAll('input[type="checkbox"]')
                        .each(function(){
                            if (!this.checked) t++;
                        });

                        toggle.classed('selected', (t > 0) ? false : true);
                        elm = null;
                    } else {
                        elm = elm.parentNode;
                    }

                }
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

                            if (state) {
                                insertLayer(key);
                            } else {
                                removeLayer(key);
                            }
                        });

                    if (!d3.select(this).classed('parent-toggle')) setParentToggle(this, state);

                    setSelectedRegionIndex();
                    getAvailableGroups();

                    if (currentFilters) __.filterOn(currentFilters);
                });

            getAvailableGroups();
        }

        // Create point map layers for any rows that have lat & lon
        function setupPoints(eezs) {
            var initialRadius = getRadiusByZoom(initialZoom);

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
                                var opts = L.Util.extend({}, geojsonStyle(row, true));
                                opts.pathRootName = 'main';
                                var circleMarker = L.circleMarker(latlng, opts);
                                markerList.push(circleMarker);
                                circleMarker.setRadius(initialRadius);
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
                                circleMarker.setRadius(initialRadius);
                                return circleMarker;
                            },
                            onEachFeature: onEachFeature,
                            pathRootName: 'evts'
                        });

                    eventLayer.on("mouseover mousemove", function (e) {
                        if (layer.selected) return;
                        showTip(e);
                        layer.setStyle(geojsonStyle(e.layer.feature, true, 'over'));
                    });

                    eventLayer.on("mouseout", function (e) {
                        hideTip(e);
                        if (layer.selected) return;
                        layer.setStyle(geojsonStyle(e.layer.feature));
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
                    sortingIndex.push({
                        key: overlayKey,
                        size: 1
                    });
                });
        }

        function addOverlayControl() {
            // group layers
            makeOverlayControl()
        }

        //function getStyle

        // call onMoveEndHandler to set map coordinates to hash
        onMoveEndHandler();

        __.highlightOverlay = function(data) {
            var id = data['id'] || null;

            if (selectedRegion.length) {
                selectedRegion.forEach(function(key){
                    returnLayerToIndex(overlayMaps[key]);
                    returnLayerToIndex(eventOverlays[key]);
                });
            }

            selectedRegion.length = 0;

            for(var overlay in overlayMaps) {
                var props = overlayMaps[overlay].properties;

                if (props['id'] === id) {
                    selectedRegion.push(overlay);
                    overlayMaps[overlay].selected = true;
                    overlayMaps[overlay].setStyle(geojsonStyle(overlayMaps[overlay]));
                } else {
                    overlayMaps[overlay].selected = false;
                    overlayMaps[overlay].setStyle(geojsonStyle(overlayMaps[overlay]));
                }
            }

            setSelectedRegionIndex();
        };

        var boundsRect;
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
                         //map.addLayer(overlayMaps[overlay]);
                         //map.addLayer(eventOverlays[overlay]);
                         insertLayer(overlay)
                    }

                    if (layerSelectors && overlay in layerSelectors) d3.select(layerSelectors[overlay]).classed('disabled', false);

                } else {
                    removeLayer(overlay);
                    if (layerSelectors && overlay in layerSelectors) d3.select(layerSelectors[overlay]).classed('disabled', true);
                }
            }

            setSelectedRegionIndex();

            // Something weird going on with probably custom projection
            if (bds && bds.isValid()) {

                /*
                var z = map.getBoundsZoom(bds);
                var pb = L.bounds(map.project(bds.getSouthWest().wrap()), map.project(bds.getNorthEast().wrap()));
                var pc = map.unproject(pb.getCenter());
                map.setView(pc, z);
                //map.fitBounds(bds.pad(0.2));


                //console.log(map.unproject([sw.x, sw.y]));
                if (map.hasLayer(boundsRect))map.removeLayer(boundsRect);
                boundsRect = null;
                boundsRect = L.rectangle(bds, {color: "#ff7800", weight: 1}).addTo(map);
                */

            } else {
                console.log("NO bounds: ", bds)
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
            sortingIndex = [];

            // assign handlers and add to overlayMaps object
            setupOverlays(layers);
            setupPoints(eezs);

            // adds Points & Overlays to map as groups
            //addOverlayControl();

        };

        return __;
    };

})(window);