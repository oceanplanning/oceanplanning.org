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

        var aboutCanadaModal = new MFOM.modal('#about-modal-ca');
        var aboutUSModal = new MFOM.modal('#about-modal-us');
        var aboutAllModal = new MFOM.modal('#about-modal-all');
        //var embedModal = new MFOM.modal('#embed');

        d3.select('#about-all')
            .on('click', function(){
                aboutAllModal.toggle();
            });

        d3.select('#about-us')
            .on('click', function(){
                aboutUSModal.toggle();
            });
        d3.select('#about-canada')
            .on('click', function(){
                aboutCanadaModal.toggle();
            });
        d3.select('#embed-btn')
            .on('click', function(){
                console.log('e')
                STA.Embed.Show();
            });
        d3.select('#embed')
            .selectAll('.modal-close')
            .on('click', function(){
                d3.event.stopImmediatePropagation();
                STA.Embed.Hide();
            })

        var selectedCountry = 'all';
        var countryFilters = d3.selectAll('.country-btn');
        countryFilters.on('click', function(){
                var country = d3.select(this).attr('data-country');
                if (country === selectedCountry) return;
                selectedCountry = country;

                handleCountryChange(country)
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
            setCountryList(country)

            var hash = STA.hasher.get();

            for(var key in hash) {
                if (key !== 'Country' && key !== 'c' ) {
                    hash[key] = null;
                }
            }

            if (country === 'all') {
                hash['Country'] = null;
            } else {
                hash['Country'] = country;
            }

            STA.hasher.set(hash);
        }

        //handleCountryChange(null, selectedCountry);

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
            filterPanel.onFilterChange(filters);
            map.filterOn(filters);
        };

        __.onCountryChange = function(country) {
            map.countryChange(MFOM.config.expand.countries[country]);
            selectedCountry = country || 'all';
            setCountryList(selectedCountry);
        };

        return __;
    };

    function processHash(initial) {
        var h = STA.hasher.get();

        // TODO: comparing undefines and nulls should be equal
        h.Country = h.Country || null;
        h.Status = h.Status || null;

        if (currentId !== h.id) {
            currentId = h.id;
            view.onIDChange( MFOM.data.getLayerForID(currentId)[0] || {} );
        }

        // don't look for filter change on country change
        var countryChange;
        if (currentCountry !== h.Country) {
            countryChange = true;
            currentCountry = h.Country || null;
            currentStatus = null;
            view.onCountryChange(currentCountry);
        }

        if (currentStatus || currentStatus !== h.Status || countryChange) {
            if (!initial && countryChange) {
                currentStatus = null;
                view.onFilterChange([]);
                return;
            }

            currentStatus = h.Status || null;
            view.onFilterChange( [{key:'Status', value: currentStatus }] );
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
            view.onData(layers, eezs);
            processHash(true);
        });

        var resizeFn = L.Util.limitExecByInterval(view.onResize, 100);
        d3.select(window).on('resize', resizeFn);
        view.onResize();
    }

    // kick everything off
    window.onload = function() {
        window.onload = null;

        STA.Embed.Index({
          page: "embed.html"
        });

        STA.hasher.on('initialHash', function(d){
            STA.hasher.on('initialHash', null);

            onInitialHash();
        });

        STA.hasher.on('change', onHashChange);

        STA.hasher.start();

    };

})(window);