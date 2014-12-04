/*
 * modifies Leaflet to allow for extra pathRoots, "main" & "evts".
 * seems to work in 0.7.3, partially updated the code below
 * Have not tested it for canvas support, VML seems ok
 * TODO: Create more dynamic way to add 'pathRoots'
*/

/*
    USAGE:
    1. Include this file after leaflet.js

    2. set some styles to control index order of the layers
        // bottom layer
        .leaflet-sandwich-main {
            z-index: 1;
        }

        // this is top layer, will handle events
        .leaflet-sandwich-evts {
            z-index: 3;
        }

        // this is the middle layer. Class name will vary,
        // I am using a custom tileLayer to set a unique class name
        .map-tiles-labels {
            z-index: 2;
        }

    3. Load same geojson into both pathRoots.

        baseLayer = new L.GeoJSON(geojson, {
            onEachFeature: onEachFeature,
            style: regionStyles,
            pathRootName: 'main'
        }).addTo(map);

        eventLayer = new L.GeoJSON(geojson, {
            onEachFeature: onEachEventFeature,
            style: regionEventStyles,
            pathRootName: 'evts'
        }).addTo(map);
*/

/* updated */
L.Map.include({
    _pathRoots:{
        'main':null,
        'evts':null
    },
    _initPathRoot: function () {
        if (!this._pathRoots.main) {

            for(var p in this._pathRoots){
                this._pathRoots[p] = L.Path.prototype._createElement('svg');
                this._panes.overlayPane.appendChild(this._pathRoots[p]);
                var extraClass = "leaflet-sandwich-" + p;
                if (this.options.zoomAnimation && L.Browser.any3d) {
                    this._pathRoots[p].setAttribute('class', ' leaflet-zoom-animated ' + extraClass);
                }else{
                    this._pathRoots[p].setAttribute('class', ' leaflet-zoom-hide ' + extraClass);
                }
            }

            if (this.options.zoomAnimation && L.Browser.any3d) {
                this.on({
                    'zoomanim': this._animatePathZoom,
                    'zoomend': this._endPathZoom
                });
            }

            this.on('moveend', this._updateSvgViewport);
            this._updateSvgViewport();
        }
    },

    _animatePathZoom: function (e) {
        var scale = this.getZoomScale(e.zoom),
            offset = this._getCenterOffset(e.center)._multiplyBy(-scale)._add(this._pathViewport.min);


        for(var p in this._pathRoots){
            var path = this._pathRoots[p];
            path.style[L.DomUtil.TRANSFORM] =
                        L.DomUtil.getTranslateString(offset) + ' scale(' + scale + ') ';
        }

        this._pathZooming = true;
    },

    _endPathZoom: function () {
        this._pathZooming = false;
    },

    _updateSvgViewport: function () {
        if (this._pathZooming) {
            // Do not update SVGs while a zoom animation is going on otherwise the animation will break.
            // When the zoom animation ends we will be updated again anyway
            // This fixes the case where you do a momentum move and zoom while the move is still ongoing.
            return;
        }

        this._updatePathViewport();

        for(var p in this._pathRoots){
            var path = this._pathRoots[p];

            var vp = this._pathViewport,
            min = vp.min,
            max = vp.max,
            width = max.x - min.x,
            height = max.y - min.y,
            root = path,
            pane = this._panes.overlayPane;

            // Hack to make flicker on drag end on mobile webkit less irritating
            if (L.Browser.mobileWebkit) {
                pane.removeChild(path);
            }

            L.DomUtil.setPosition(root, min);
            root.setAttribute('width', width);
            root.setAttribute('height', height);
            root.setAttribute('viewBox', [min.x, min.y, width, height].join(' '));

            if (L.Browser.mobileWebkit) {
                pane.appendChild(root);
            }
        }
    }
});


L.Map.include(L.Browser.svg || !L.Browser.vml ? {} : {
    _initPathRoot: function () {
        if (this._pathRoots.main) { return; }
        for(var p in this._pathRoots){
            var extraClass = "leaflet-sandwich-" + p;
            this._pathRoots[p] = document.createElement('div');
            this._pathRoots[p].className = 'leaflet-vml-container '+ extraClass;
            this._panes.overlayPane.appendChild(this._pathRoots[p]);
        }

        this.on('moveend', this._updatePathViewport);
        this._updatePathViewport();
    }
});

L.Map.include((L.Path.SVG && !window.L_PREFER_CANVAS) || !L.Browser.canvas ? {} : {
    _canvasCtxs:{},

    _initPathRoot: function () {
        var root = this._pathRoots.main,
            ctx;

        if (!root) {
            for(var p in this._pathRoots){
                root = this._pathRoots[p] = document.createElement("canvas");
                root.style.position = 'absolute';
                ctx = this._canvasCtxs[p] = root.getContext('2d');
                ctx.lineCap = "round";
                ctx.lineJoin = "round";
                var extraClass = "leaflet-sandwich-" + p;
                this._panes.overlayPane.appendChild(root);
                if (this.options.zoomAnimation) {
                    this._pathRoots[p].className = 'leaflet-zoom-animated ' + extraClass;
                }

            }

            if (this.options.zoomAnimation) {
                this.on('zoomanim', this._animatePathZoom);
                this.on('zoomend', this._endPathZoom);
            }

            this.on('moveend', this._updateCanvasViewport);
            this._updateCanvasViewport();
        }
    },

    _updateCanvasViewport: function () {
        if (this._pathZooming) {
            //Don't redraw while zooming. See _updateSvgViewport for more details
            return;
        }
        this._updatePathViewport();

        for(var p in this._pathRoots){
            var vp = this._pathViewport,
            min = vp.min,
            size = vp.max.subtract(min),
            root = this._pathRoots[p];

            //TODO check if this works properly on mobile webkit
            L.DomUtil.setPosition(root, min);
            root.width = size.x;
            root.height = size.y;
            root.getContext('2d').translate(-min.x, -min.y);
        }
    }
});


/* svg */
L.Path.include({
    initialize: function (options) {
        L.Util.setOptions(this, {pathRootName: 'main'});
        L.Util.setOptions(this, options);
    },
    onAdd: function (map) {
        this._map = map;

        if (!this._container) {
            this._initElements();
            this._initEvents();
        }

        this.projectLatlngs();
        this._updatePath();

        if (this._container) {
            this._map._pathRoots[this.options.pathRootName].appendChild(this._container);
        }

        this._pathRoot = this._map._pathRoots[this.options.pathRootName];

        map.on({
            'viewreset': this.projectLatlngs,
            'moveend': this._updatePath
        }, this);
    },
    onRemove: function (map) {
        map._pathRoots[this.options.pathRootName].removeChild(this._container);

        this._map = null;

        if (L.Browser.vml) {
            this._container = null;
            this._stroke = null;
            this._fill = null;
        }

        map.off({
            'viewreset': this.projectLatlngs,
            'moveend': this._updatePath
        }, this);
    },

    bringToFront: function () {
        if(!this._map)return;
        if (this._container) {
            this._map._pathRoots[this.options.pathRootName].appendChild(this._container);
        }
        return this;
    },

    bringToBack: function () {
        if (this._container) {
            var root = this._map._pathRoots[this.options.pathRootName];
            root.insertBefore(this._container, root.firstChild);
        }
        return this;
    }
});

/* canvas */
L.Path.include((L.Path.SVG && !window.L_PREFER_CANVAS) || !L.Browser.canvas ? {} : {
    statics: {
        //CLIP_PADDING: 0.02, // not sure if there's a need to set it to a small value
        CANVAS: true,
        SVG: false
    },

    redraw: function () {
        if (this._map) {
            this.projectLatlngs();
            this._requestUpdate();
        }
        return this;
    },

    setStyle: function (style) {
        L.Util.setOptions(this, style);

        if (this._map) {
            this._updateStyle();
            this._requestUpdate();
        }
        return this;
    },

    onRemove: function (map) {
        map
            .off('viewreset', this.projectLatlngs, this)
            .off('moveend', this._updatePath, this);

        this._requestUpdate();

        this._map = null;
    },

    _requestUpdate: function () {
        if (this._map) {
            L.Util.cancelAnimFrame(this._fireMapMoveEnd);
            this._updateRequest = L.Util.requestAnimFrame(this._fireMapMoveEnd, this._map);
        }
    },

    _fireMapMoveEnd: function () {
        this.fire('moveend');
    },

    _initElements: function () {
        this._map._initPathRoot();
        this._ctx = this._map._canvasCtxs[this.options.pathRootName];
    },

    _updateStyle: function () {
        var options = this.options;

        if (options.stroke) {
            this._ctx.lineWidth = options.weight;
            this._ctx.strokeStyle = options.color;
        }
        if (options.fill) {
            this._ctx.fillStyle = options.fillColor || options.color;
        }
    },

    _drawPath: function () {
        var i, j, len, len2, point, drawMethod;

        this._ctx.beginPath();

        for (i = 0, len = this._parts.length; i < len; i++) {
            for (j = 0, len2 = this._parts[i].length; j < len2; j++) {
                point = this._parts[i][j];
                drawMethod = (j === 0 ? 'move' : 'line') + 'To';

                this._ctx[drawMethod](point.x, point.y);
            }
            // TODO refactor ugly hack
            if (this instanceof L.Polygon) {
                this._ctx.closePath();
            }
        }
    },

    _checkIfEmpty: function () {
        return !this._parts.length;
    },

    _updatePath: function () {
        if (this._checkIfEmpty()) { return; }

        var ctx = this._ctx,
            options = this.options;

        this._drawPath();
        ctx.save();
        this._updateStyle();

        if (options.fill) {
            if (options.fillOpacity < 1) {
                ctx.globalAlpha = options.fillOpacity;
            }
            ctx.fill();
        }

        if (options.stroke) {
            if (options.opacity < 1) {
                ctx.globalAlpha = options.opacity;
            }
            ctx.stroke();
        }

        ctx.restore();

        // TODO optimization: 1 fill/stroke for all features with equal style instead of 1 for each feature
    },

    _initEvents: function () {
        if (this.options.clickable) {
            // TODO hand cursor
            // TODO mouseover, mouseout, dblclick
            this._map.on('click', this._onClick, this);
        }
    },

    _onClick: function (e) {
        if (this._containsPoint(e.layerPoint)) {
            this.fire('click', e);
        }
    }
});

/* vml */
L.Path.include(L.Browser.svg || !L.Browser.vml ? {} : {
    statics: {
        VML: true,
        CLIP_PADDING: 0.02
    },

    _createElement: (function () {
        try {
            document.namespaces.add('lvml', 'urn:schemas-microsoft-com:vml');
            return function (name) {
                return document.createElement('<lvml:' + name + ' class="lvml">');
            };
        } catch (e) {
            return function (name) {
                return document.createElement('<' + name + ' xmlns="urn:schemas-microsoft.com:vml" class="lvml">');
            };
        }
    }()),

    _initPath: function () {
        var container = this._container = this._createElement('shape');
        L.DomUtil.addClass(container, 'leaflet-vml-shape');
        if (this.options.clickable) {
            L.DomUtil.addClass(container, 'leaflet-clickable');
        }
        container.coordsize = '1 1';

        this._path = this._createElement('path');
        container.appendChild(this._path);

        this._map._pathRoots[this.options.pathRootName].appendChild(container);
    },

    _initStyle: function () {
        this._updateStyle();
    },

    _updateStyle: function () {
        var stroke = this._stroke,
            fill = this._fill,
            options = this.options,
            container = this._container;

        container.stroked = options.stroke;
        container.filled = options.fill;

        if (options.stroke) {
            if (!stroke) {
                stroke = this._stroke = this._createElement('stroke');
                stroke.endcap = 'round';
                container.appendChild(stroke);
            }
            stroke.weight = options.weight + 'px';
            stroke.color = options.color;
            stroke.opacity = options.opacity;
            if (options.dashArray) {
                stroke.dashStyle = options.dashArray.replace(/ *, */g, ' ');
            } else {
                stroke.dashStyle = '';
            }
        } else if (stroke) {
            container.removeChild(stroke);
            this._stroke = null;
        }

        if (options.fill) {
            if (!fill) {
                fill = this._fill = this._createElement('fill');
                container.appendChild(fill);
            }
            fill.color = options.fillColor || options.color;
            fill.opacity = options.fillOpacity;
        } else if (fill) {
            container.removeChild(fill);
            this._fill = null;
        }
    },

    _updatePath: function () {
        var style = this._container.style;

        style.display = 'none';
        this._path.v = this.getPathString() + ' '; // the space fixes IE empty path string bug
        style.display = '';
    }
});



/* updated */
L.GeoJSON.include({
    initialize: function (geojson, options) {

        L.Util.setOptions(this, {pathRootName: 'main'});
        L.Util.setOptions(this, options);

        this._layers = {};

        if (geojson) {
            this.addData(geojson);
        }
    },
    addData: function (geojson) {
        var features = L.Util.isArray(geojson) ? geojson : geojson.features,
            i, len, feature;

        if (features) {
            for (i = 0, len = features.length; i < len; i++) {
                // Only add this if geometry or geometries are set and not null
                feature = features[i];

                if (feature.geometries || feature.geometry || feature.features || feature.coordinates) {
                    this.addData(features[i]);
                }
            }
            return this;
        }

        var options = this.options;

        if (options.filter && !options.filter(geojson)) { return; }
        var pr = options.pathRootName || 'main';

        var layer = L.GeoJSON.geometryToLayer(geojson, options.pointToLayer, options.coordsToLatLng, {pathRootName:pr});

        layer.feature = L.GeoJSON.asFeature(geojson);

        layer.defaultOptions = layer.options;

        this.resetStyle(layer);

        if (options.onEachFeature) {
            options.onEachFeature(geojson, layer);
        }

        return this.addLayer(layer);
    }
})

/* updated */
L.Util.extend(L.GeoJSON, {

    geometryToLayer: function (geojson, pointToLayer, coordsToLatLng, vectorOptions) {
        var geometry = geojson.type === 'Feature' ? geojson.geometry : geojson,
            coords = geometry.coordinates,
            layers = [],
            latlng, latlngs, i, len;

        coordsToLatLng = coordsToLatLng || this.coordsToLatLng;

        switch (geometry.type) {
        case 'Point':
            latlng = coordsToLatLng(coords);
            return pointToLayer ? pointToLayer(geojson, latlng) : new L.Marker(latlng);

        case 'MultiPoint':
            for (i = 0, len = coords.length; i < len; i++) {
                latlng = coordsToLatLng(coords[i]);
                layers.push(pointToLayer ? pointToLayer(geojson, latlng) : new L.Marker(latlng));
            }
            return new L.FeatureGroup(layers);

        case 'LineString':
            latlngs = this.coordsToLatLngs(coords, 0, coordsToLatLng);
            return new L.Polyline(latlngs, vectorOptions);

        case 'Polygon':
            if (coords.length === 2 && !coords[1].length) {
                throw new Error('Invalid GeoJSON object.');
            }
            latlngs = this.coordsToLatLngs(coords, 1, coordsToLatLng);
            return new L.Polygon(latlngs, vectorOptions);

        case 'MultiLineString':
            latlngs = this.coordsToLatLngs(coords, 1, coordsToLatLng);
            return new L.MultiPolyline(latlngs, vectorOptions);

        case 'MultiPolygon':
            latlngs = this.coordsToLatLngs(coords, 2, coordsToLatLng);
            return new L.MultiPolygon(latlngs, vectorOptions);

        case 'GeometryCollection':
            for (i = 0, len = geometry.geometries.length; i < len; i++) {

                layers.push(this.geometryToLayer({
                    geometry: geometry.geometries[i],
                    type: 'Feature',
                    properties: geojson.properties
                }, pointToLayer, coordsToLatLng, vectorOptions));
            }
            return new L.FeatureGroup(layers);

        default:
            throw new Error('Invalid GeoJSON object.');
        }
    }
});
