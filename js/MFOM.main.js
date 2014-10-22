/*
    Moore Foundation Ocean Map
    MFOM.main.js
    Controller for Ocean Map
*/

(function(exports) {
    'use strict';
    var MFOM = exports.MFOM || (exports.MFOM = {});

    var view;

    MFOM.view = function() {
        var __ = {};
        var map = new MFOM.map('map');

        __.onData = function(layers, eezs) {
            map.onData(layers, eezs);
        };
        return __;
    };


    // kick everything off
    window.onload = function() {
        window.onload = null;
        view = new MFOM.view();

        MFOM.data.load(function(layers, eezs){
            console.log('Data loaded...');

            view.onData(layers, eezs);
        });
    };

})(window);