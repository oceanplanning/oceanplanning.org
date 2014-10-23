/*
    Moore Foundation Ocean Map
    MFOM.main.js
    Controller for Ocean Map
*/

(function(exports) {
    'use strict';
    var MFOM = exports.MFOM || (exports.MFOM = {});

    var view, currentId, currentCountry, currentStatus;

    // generic view...
    MFOM.view = function() {
        var __ = {};
        var headerElm = d3.select('.nav'),
            mainElm = d3.select('.main'),
            lastHeight;

        var map = new MFOM.map('map');
        var filterPanel = new MFOM.filterpanel();

        __.onData = function(layers, eezs) {
            map.onData(layers, eezs);
        };

        __.onResize = function() {
            if (lastHeight === window.innerHeight) return;
            lastHeight = window.innerHeight;
            mainElm.style('height',
                (lastHeight - headerElm.node().offsetHeight) + 'px');
        };

        __.onIDChange = function(data) {
            filterPanel.update(data);
            map.highlightOverlay(data);
        };

        __.onFilterChange = function(filters) {
            map.filterOn(filters);
            filterPanel.onFilterChange(filters);
        };

        return __;
    };

    function processHash() {
        var h = STA.hasher.get();
        if (currentId !== h.id) {
            currentId = h.id;
            view.onIDChange( MFOM.data.getLayerForID(currentId)[0] || [] );
        }

        var f = [],
            dirty = false;

        if (currentCountry || currentCountry !== h.Country) {
            currentCountry = h.Country || null;
            f.push({key:'Country', value: currentCountry});
            dirty = true;
        }
        if (currentStatus || currentStatus !== h.Status) {
            currentStatus = h.Status || null;
            f.push({key:'Status', value: currentStatus });
            dirty = true;
        }
        if (dirty) view.onFilterChange( f );


    }

    function onHashChange() {
        if (!view) return;
        processHash();
    }

    // load data as well as
    // set up view and listeners
    function onInitialHash() {
        window.onload = null;
        view = new MFOM.view();

        MFOM.data.load(function(layers, eezs){
            view.onData(layers, eezs);
            processHash();
        });

        var resizeFn = L.Util.limitExecByInterval(view.onResize, 100);
        d3.select(window).on('resize', resizeFn);
        view.onResize();
    }

    // kick everything off
    window.onload = function() {
        window.onload = null;

        STA.hasher.on('initialHash', function(d){
            STA.hasher.on('initialHash', null);

            onInitialHash();
        });

        STA.hasher.on('change', onHashChange);

        STA.hasher.start();

    };

})(window);