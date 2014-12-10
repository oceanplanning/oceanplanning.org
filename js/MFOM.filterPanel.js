/*
    Moore Foundation Ocean Map
    MFOM.main.js
    Filter panel
*/

(function(exports) {
    'use strict';
    var MFOM = exports.MFOM || (exports.MFOM = {});

    MFOM.filterpanel = function() {
        var __ = {};

        var root = d3.select('.filters'),
            statusFilters = root.select('.status-filters').selectAll('button'),
            filterBtns = root.selectAll('.filter-btn'),
            statusKeys = [];

        statusFilters.each(function(elm){
            statusKeys.push( this.getAttribute('data-value') );
        });

        statusFilters.on('click', function(){
            setFilter(this, statusFilters, 'status');
        });

        function setFilter(elm, filters, key) {
            var h = STA.hasher.get();
            var elmObj = d3.select(elm),
                key = elmObj.attr('data-key') || null,
                value = elmObj.attr('data-value') || null,
                parent = d3.select(elm.parentNode);

            if (parent.classed('selected') && value !== 'reset') {
                filters
                .each(function(){
                    d3.select(this.parentNode).classed('selected', false);
                });

                h[key] = null;
            } else {
                filters
                    .each(function(){
                        console.log(this.parentNode)
                        d3.select(this.parentNode).classed('selected', false);
                    })
                    //.classed('selected', false)
                    .filter(function(){
                        var v = this.getAttribute('data-value');
                        return v === value;
                    })
                    .each(function(){
                        d3.select(this.parentNode).classed('selected', true);
                    });
                    //.classed('selected', true);
                h[key] = (value === 'reset' || value === 'all') ? null : value;
            }

            STA.hasher.set(h);
        }

        function setFilterReset() {
            statusFilters.each(function(){
                d3.select(this.parentNode).classed('selected', false);
            })

            d3.select(statusFilters[0][0].parentNode).classed('selected', true);
        }

        // on a filter change
        __.onFilterChange = function(filters) {
            //var showReset = d3.select('.tabs').classed('open');

            if (!filters || !filters.length) {
                root.classed('selected', false);
                setFilterReset();
                return;
            };

            filterBtns.each(function(){
                var el = d3.select(this),
                    parent = d3.select(this.parentNode),
                    key = el.attr('data-key'),
                    value = el.attr('data-value');

                var match = false;

                filters.forEach(function(f){
                    var thisValue = f.value ? f.value : 'reset';
                    if (f.key === key && thisValue === value) match = true;
                });
                parent.classed('selected', match);
            });
        };


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
            });

        };

        // on a selected region
        __.update = function(data) {

            if (!data || !data.id) {
                root.classed('selected', false);
                setFilterReset();
                return;
            }

            root.classed('selected', true);
        };

        return __;
    };

})(window);