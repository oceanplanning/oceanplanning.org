L.TileLayer.Labels = L.TileLayer.extend({
    options: {
        provider: null
    },

    fadeOn: function() {
        //d3.select(this._container).classed("fade30", true);
    },

    fadeOff: function() {
        //d3.select(this._container).classed("fade30", false);
    },

    initialize: function(provider, options) {
        if (!provider || typeof provider !== 'string') return;

        this.options.provider = provider;

        L.Util.setOptions(this, options);
        this.setUrl(this.options.provider);

        // detecting retina displays, adjusting tileSize and zoom levels
        if (this.options.detectRetina && L.Browser.retina && this.options.maxZoom > 0) {

            options.tileSize = Math.floor(options.tileSize / 2);
            options.zoomOffset++;

            if (options.minZoom > 0) {
                options.minZoom--;
            }
            this.options.maxZoom--;
        }

        if (this.options.bounds) {
            this.options.bounds = L.latLngBounds(this.options.bounds);
        }

        this._url = this.options.provider;

        var subdomains = this.options.subdomains;

        if (typeof subdomains === 'string') {
            this.options.subdomains = subdomains.split('');
        }
    },

    popToFront: function() {
        if (!chcf.iAmIE8) {
            var tilePane = this._map._panes.overlayPane;
            tilePane.appendChild(this._container);
        }
    },

    update: function(region) {
        this.popToFront();
        return;

    },

    onAdd: function(map) {
        L.TileLayer.prototype.onAdd.call(this, map);
    },


    _initContainer: function() {
        var tilePane = this._map._panes.overlayPane;

        if (!this._container) {
            this._container = L.DomUtil.create('div', 'leaflet-layer moore-map-labels');

            this._updateZIndex();

            if (this._animated) {
                var className = 'leaflet-tile-container';

                this._bgBuffer = L.DomUtil.create('div', className, this._container);
                this._tileContainer = L.DomUtil.create('div', className, this._container);
            } else {
                this._tileContainer = this._container;
            }

            tilePane.appendChild(this._container);

            if (this.options.opacity < 1) {
                this._updateOpacity();
            }
        }
    },

    redraw: function() {
        if (this._map) {
            this._reset({hard: true});
            this._update();
        }

        return this;
    },


    bringToFront: function() {
        var pane = this._map._panes.overlayPane;

        if (this._container) {
            pane.appendChild(this._container);
            this._setAutoZIndex(pane, Math.max);
        }

        return this;
    },

    bringToBack: function() {
        var pane = this._map._panes.overlayPane;

        if (this._container) {
            pane.insertBefore(this._container, pane.firstChild);
            this._setAutoZIndex(pane, Math.min);
        }

        return this;
    },

    _reset: function(clearOldContainer) {
        clearOldContainer = true;
        L.TileLayer.prototype._reset.call(this, clearOldContainer);
    }

});