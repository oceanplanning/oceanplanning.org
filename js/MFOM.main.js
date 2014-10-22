/*
    Moore Foundation Ocean Map
    MFOM.main.js
    Controller for Ocean Map
*/

(function(exports) {
    'use strict';
    var MFOM = exports.MFOM || (exports.MFOM = {});

    var view;

    // generic view...
    MFOM.view = function() {
        var __ = {};
        var headerElm = d3.select('.nav'),
            mainElm = d3.select('.main'),
            lastHeight;

        var map = new MFOM.map('map');

        __.onData = function(layers, eezs) {
            map.onData(layers, eezs);
        };

        __.onResize = function() {
            if (lastHeight === window.innerHeight) return;
            lastHeight = window.innerHeight;
            mainElm.style('height',
                (lastHeight - headerElm.node().offsetHeight) + 'px');
        };

        return __;
    };

    // load data as well as
    // set up view and listeners
    function initialize() {
        window.onload = null;
        view = new MFOM.view();

        MFOM.data.load(function(layers, eezs){
            console.log('Data loaded...');

            view.onData(layers, eezs);
        });

        var resizeFn = L.Util.limitExecByInterval(view.onResize, 100);
        d3.select(window).on('resize', resizeFn);
        view.onResize();
    }

    // kick everything off
    window.onload = function() {
        initialize();
    };

})(window);