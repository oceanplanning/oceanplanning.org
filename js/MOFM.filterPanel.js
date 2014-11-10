/*
    Moore Foundation Ocean Map
    MFOM.main.js
    Controller for Ocean Map
*/

(function(exports) {
    'use strict';
    var MFOM = exports.MFOM || (exports.MFOM = {});

    MFOM.filterpanel = function() {
        var __ = {};

        var root = d3.select('.filters'),
            statusFilters = root.select('.status-filters').selectAll('button'),
            //countryFilters = root.select('.country-filters').selectAll('button'),
            filterBtns = root.selectAll('.filter-btn'),
            tabs = root.select('.tabs'),
            tabBtns = tabs.select('.filter-row').selectAll('button'),
            detailsTab = root.select('[data-tab="details"]'),
            detailItems = detailsTab.selectAll('li'),
            descriptionTab = root.select('[data-tab="description"]'),
            descriptionTxt = descriptionTab.select('p'),
            resetBtn = root.select('#resetButton'),
            currentTab;


        resetBtn.on('click', function(){
            var h = STA.hasher.get();
            for(var k in h) {
                if (k !== 'c' && k !== 'Country') {
                    h[k] = null;
                }
            }

            STA.hasher.set(h);
        })
        tabBtns.each(function(btn){
            if (d3.select(this).classed('selected')) currentTab = this;
        });
        tabBtns.on('click', function(){
            setTabs(this);
        });

        /*
        countryFilters.on('click', function(){
            setFilter(this, countryFilters, 'country');
        });
        */

        statusFilters.on('click', function(){
            setFilter(this,statusFilters, 'status');
        });

        function setFilter(elm, filters, key) {
            var h = STA.hasher.get();
            var elmObj = d3.select(elm),
                key = elmObj.attr('data-key') || null,
                value = elmObj.attr('data-value') || null;

            if (elmObj.classed('selected')) {
                filters
                .classed('selected', false);
                h[key] = null;
            } else {
                filters
                    .classed('selected', false)
                    .filter(function(){
                        return this === elm;
                    })
                    .classed('selected', true);
                h[key] = value;
            }

            STA.hasher.set(h);
        }

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

        // on a filter change
        __.onFilterChange = function(filters) {
            var showReset = tabs.classed('open');
            filterBtns.each(function(){
                var el = d3.select(this),
                    key = el.attr('data-key'),
                    value = el.attr('data-value');

                var match = false;
                //console.log(filters);
                filters.forEach(function(f){
                    if (f.key === key && f.value === value) match = true;
                });
                el.classed('selected', match);
                if (match) showReset = true;
            });

            root.classed('selected', showReset);
        };

        // on a selected region
        __.update = function(data) {
            if (!data || !data.ID) {
                root.classed('selected', false);
                tabs.classed('open', false);
                return;
            }

            root.classed('selected', true);
            tabs.classed('open', true);
            descriptionTxt.text(data.Narrative);
            detailItems.each(function(){
                var el = d3.select(this),
                    key = el.attr('data-key'),
                    valEl = el.select('.value'),
                    value = data[key] || 'n/a'

                if (key === 'Website' && value !== 'n/a') {
                    valEl.select('a')
                        .attr('href', value)
                        .text(value);
                } else {
                    valEl.text(value);
                }

            });
        };

        return __;
    };

})(window);