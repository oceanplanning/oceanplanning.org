/*
    Moore Foundation Ocean Map
    MFOM.main.js
    Controller for displaying details about map layers
*/

(function(exports) {
    'use strict';
    var MFOM = exports.MFOM || (exports.MFOM = {});

    MFOM.detailspanel = function() {
        var __ = {};

        var root = d3.select('.details'),
            tabs = root.select('.tabs'),
            tabBtns = tabs.select('.filter-row').selectAll('button'),
            detailsTab = root.select('[data-tab="details"]'),
            detailItems = detailsTab.selectAll('li'),
            descriptionTab = root.select('[data-tab="description"]'),
            descriptionTxt = descriptionTab.select('p'),
            resetBtn = root.select('#resetButton'),
            currentTab;


        // reset region button
        resetBtn.on('click', function(){
            var h = STA.hasher.get();
            h.id = null;
            STA.hasher.set(h);
        });

        tabBtns.each(function(btn){
            if (d3.select(this).classed('selected')) currentTab = this;
        });

        tabBtns.on('click', function(){
            setTabs(this);
        });

        function setTabs(btn) {
            tabBtns.classed('selected', false);

            tabBtns.each(function(){
                if (btn === this) {
                    currentTab = this;
                    var el = d3.select(this),
                        target = el.attr('data-target');

                    el.classed('selected', true);

                    if (target === 'details') {
                        detailsTab.classed('hide', false);
                        descriptionTab.classed('hide', true);
                    } else {
                        detailsTab.classed('hide', true);
                        descriptionTab.classed('hide', false);
                    }
                } else {

                }

            });
        }

        // on a selected region
        __.update = function(data) {

            if (!data || !data.id) {
                root.classed('selected', false);
                tabs.classed('open', false);
                return;
            }

            root.classed('selected', true);
            tabs.classed('open', true);
            descriptionTxt.text(data.narrative || "No description available.");
            detailItems.each(function(){
                var el = d3.select(this),
                    key = el.attr('data-key'),
                    valEl = el.select('.value'),
                    value = data[key] || 'n/a'

                if (key === 'website' && value !== 'n/a') {
                    valEl.select('a')
                        .attr('href', value)
                        .attr('target', '_blank')
                        .text(value);
                } else {
                    valEl.text(value);
                }

            });
        };

        return __;
    };

})(window);