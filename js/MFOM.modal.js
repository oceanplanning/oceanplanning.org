/*
    Moore Foundation Ocean Map
    MFOM.modal.js
    Modal panels for Ocean Map
*/

(function(exports) {
    'use strict';
    var MFOM = exports.MFOM || (exports.MFOM = {});

    MFOM.modal = function(selector) {
        var __ = {};
        var panel = d3.select(selector),
            close = panel.selectAll('.modal-close');

        close.on('click', function(){
            console.log('CLOSE');
            d3.event.stopImmediatePropagation();
            __.hide();
        });

        __.show = function() {
            panel.classed('hide', false);
        };

        __.hide = function() {
            panel.classed('hide', true);
        };

        __.toggle = function() {

            (panel.classed('hide')) ? __.show() : __.hide();
        };

        return __;
    };

})(window);