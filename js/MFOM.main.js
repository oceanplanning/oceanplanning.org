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
            layerSelecterElm = d3.select('#overlaySelectr'),
            layerSelecterWrapElm = layerSelecterElm.select('.scroll-wrap'),
            filterPanelElm = d3.select('.panel.filters'),
            lastHeight;

        var map = new MFOM.map('map');
        var filterPanel,
            detailsPanel;

        if (!MFOM.config.isEmbed) filterPanel = new MFOM.filterpanel();
        detailsPanel = new MFOM.detailspanel();

        // set up modals
        var modals = d3.selectAll('.modal-activator');
        modals.each(function(){
            var target = this.getAttribute('data-target');
            var modal = (target) ? new MFOM.modal('#' + target) : null;
            d3.select(this)
                .on('click', function(){
                    d3.event.preventDefault ? d3.event.preventDefault() : d3.event.returnValue = false;
                    if (modal) modal.toggle();
                });
        });

        // embed modals are different
        d3.select('#embed-btn')
            .on('click', function(){
                STA.Embed.Show();
            });

        d3.select('#embed')
            .selectAll('.modal-close')
            .on('click', function(){
                d3.event.stopImmediatePropagation();
                STA.Embed.Hide();
            });

        var selectedCountry = 'all';

        /*
        var countryFilters = d3.selectAll('.country-btn');
        countryFilters.on('click', function(){
                var country = d3.select(this).attr('data-country');
                if (country === selectedCountry) return;
                selectedCountry = country;
                handleCountryChange(country);
            });

        function setCountryList(country) {
            if (!country) country = 'all';
            countryFilters.classed('selected', false)
                .filter(function(){
                    var c = this.getAttribute('data-country');
                    return c === country;
                })
                .classed('selected', true);
        }

        setCountryList(selectedCountry);

        function handleCountryChange(country) {
            setCountryList(country);

            var hash = STA.hasher.get();

            for(var key in hash) {
                if (key !== 'country' && key !== 'c' ) {
                    hash[key] = null;
                }
            }

            if (country === 'all') {
                hash['country'] = null;
            } else {
                hash['country'] = country;
            }

            STA.hasher.set(hash);
        }
        */

        //handleCountryChange(null, selectedCountry);

        __.onData = function(layers, eezs, cb) {
            map.onData(layers, eezs, function(){
                cb();
                lastHeight = null;
                __.onResize();
            });
        };

        __.onResize = function() {
            if (lastHeight === window.innerHeight) return;
            lastHeight = window.innerHeight;
            mainElm.style('height',
                (lastHeight - headerElm.node().offsetHeight) + 'px');

            var maxHeight = mainElm.node().offsetHeight -
                    (layerSelecterElm.node().offsetTop + filterPanelElm.node().offsetHeight + 30); // 30 = bottom pos + padding
            //if (maxHeight < 50) return;
            layerSelecterWrapElm.style('max-height', maxHeight + 'px');
        };

        __.onIDChange = function(data) {
            if (filterPanel) filterPanel.update(data);
            detailsPanel.update(data);
            map.highlightOverlay(data);
        };

        __.onFilterChange = function(filters) {
            if (filterPanel) filterPanel.onFilterChange(filters);
            map.filterOn(filters);
        };

        __.onCountryChange = function(country) {
            map.countryChange(country, MFOM.config.expand.countries[country]);
            selectedCountry = country || 'all';
            //setCountryList(selectedCountry);
            if (filterPanel) filterPanel.updateCounts(MFOM.config.expand.countries[country]);
        };

        return __;
    };

    function processHash(initial) {
        var h = STA.hasher.get();

        // TODO: comparing undefines and nulls should be equal
        h.country = h.country || null;
        h.status = h.status || null;

        if (currentId !== h.id) {
            currentId = h.id;
            view.onIDChange( MFOM.data.getLayerForID(currentId)[0] || {} );
        }

        // don't look for filter change on country change
        var countryChange;
        if (currentCountry !== h.country) {
            countryChange = true;
            currentCountry = h.country || null;
            currentStatus = null;
            view.onCountryChange(currentCountry);
        }

        if (currentStatus || currentStatus !== h.status || countryChange) {
            if (!initial && countryChange) {
                currentStatus = null;
                view.onFilterChange([]);
                return;
            }

            currentStatus = h.status || null;
            view.onFilterChange( [{key:'status', value: currentStatus }] );
        }

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
            view.onData(layers, eezs, function() {
                processHash(true);

                // kill any loading effects
                d3.select('body').classed('loading', false);
            });

        });

        var resizeFn = L.Util.limitExecByInterval(view.onResize, 100);
        d3.select(window).on('resize', resizeFn);
        view.onResize();
    }

    // kick everything off
    window.onload = function() {
        window.onload = null;

        // is embed?
        MFOM.config.isEmbed = !!document.body.getAttribute('id');

        if (!MFOM.config.isEmbed) {
            STA.Embed.Index({
              page: "embed.html"
            });
        }

        STA.hasher.on('initialHash', function(d){
            STA.hasher.on('initialHash', null);

            onInitialHash();
        });

        STA.hasher.on('change', onHashChange);

        STA.hasher.start();

    };

})(window);