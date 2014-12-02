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
            filterBtns = root.selectAll('.filter-btn'),
            tabs = root.select('.tabs'),
            tabBtns = tabs.select('.filter-row').selectAll('button'),
            detailsTab = root.select('[data-tab="details"]'),
            detailItems = detailsTab.selectAll('li'),
            descriptionTab = root.select('[data-tab="description"]'),
            descriptionTxt = descriptionTab.select('p'),
            resetBtn = root.select('#resetButton'),
            currentTab,
            statusKeys = [];

        statusFilters.each(function(elm){
            statusKeys.push( this.getAttribute('data-value') );
        });


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

        statusFilters.on('click', function(){
            setFilter(this,statusFilters, 'status');
        });

        function setFilter(elm, filters, key) {
            var h = STA.hasher.get();
            var elmObj = d3.select(elm),
                key = elmObj.attr('data-key') || null,
                value = elmObj.attr('data-value') || null;



            if (elmObj.classed('selected') && value !== 'reset') {
                filters
                .classed('selected', false);
                h[key] = null;
            } else {
                filters
                    .classed('selected', false)
                    .filter(function(){
                        var v = this.getAttribute('data-value');
                        return v === value;
                    })
                    .classed('selected', true);
                h[key] = (value === 'reset' || value === 'all') ? null : value;
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

        function setFilterReset() {
            statusFilters.classed('selected', false);
            d3.select(statusFilters[0][0]).classed('selected', true);
        }

        // on a filter change
        __.onFilterChange = function(filters) {
            var showReset = tabs.classed('open');

            if (!filters || !filters.length) {
                root.classed('selected', false);
                setFilterReset();
                return;
            };
            filterBtns.each(function(){
                var el = d3.select(this),
                    key = el.attr('data-key'),
                    value = el.attr('data-value');

                var match = false;

                filters.forEach(function(f){
                    var thisValue = f.value ? f.value : 'reset';
                    if (f.key === key && thisValue === value) match = true;
                });
                el.classed('selected', match);
                if (match) showReset = true;
            });

            root.classed('selected', showReset);
        };

        /*
        MFOM.config.statusLookup = {
        'completed': 'Implemented',
        'pre-planning': 'Pre-planning',
        'underway': 'Underway',
        'stalled': new RegExp('stall', 'gi')
    };*/


        __.updateCounts = function(country) {

            var features = MFOM.data.eezs();
            var counts = {};
            statusKeys.forEach(function(key){
                counts[key] = 0;
            });
            var o ={};
            var total = 0;
            features.forEach(function(item){
                var status = item.status.toLowerCase();
                if (country && item.country !== country) return;

                if (!o.hasOwnProperty(status)) o[status] = status;

                if (counts.hasOwnProperty(status)) {
                    counts[status]++;
                    total++;
                }
            });


            statusFilters.each(function(){
                var el = d3.select(this),
                    key = this.getAttribute('data-value');

                var txt = (key === 'reset') ? total : (counts[key] || 0);
                el.select('.counts')
                    .text( "(" + txt + ")");
            })

        };

        // on a selected region
        __.update = function(data) {

            if (!data || !data.id) {
                root.classed('selected', false);
                setFilterReset();
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