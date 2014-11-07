/*
    Moore Foundation Ocean Map
    MFOM.data.js
    Model for Ocean Map
*/

(function(exports) {
    'use strict';
    var MFOM = exports.MFOM || (exports.MFOM = {});

    var slice_ = [].slice;
    function extend() {
        var consumer = arguments[0],
            providers = slice_.call(arguments, 1),
            key,
            i,
            provider,
            except;

        for (i = 0; i < providers.length; ++i) {
            provider = providers[i];
            except = provider['except'] || [];
            except.push('except');
            for (key in provider) {
                if (except.indexOf(key) < 0 && provider.hasOwnProperty(key)) {
                    consumer[key] = provider[key];
                }
            }
        }
        return consumer;
    };

    var layers, eezs;
    MFOM.data = {

        load: function(callback) {
            if (layers) return;
            layers = extend([],MFOM.config.map.layers);
            d3.csv(MFOM.config.files.csvBase + MFOM.config.files.eez,
                function(d){

                    // remove crazy key...
                    if (d.hasOwnProperty('Narrative (250, no formatting or links)')) {
                        d.Narrative = d['Narrative (250, no formatting or links)'];
                        delete d['Narrative (250, no formatting or links)'];
                    }

                    return d;
                },
                function(csvdata) {
                eezs = csvdata;

                d3.json(MFOM.config.files.geojsonBase + MFOM.config.files.planningAreas, function(planning_areas_topojson) {

                    // Apply the geojson objects to the tasks array
                    layers.forEach(function(lyr) {
                        var topolyr = lyr.topojson_layer
                        lyr.geojson = topojson.feature(planning_areas_topojson, planning_areas_topojson.objects[lyr.topojson_layer]);
                    });

                    layers.forEach(function(lyr) {
                        lyr.geojson.features.forEach(function(feature){
                            feature.properties = csvdata[lyr.csv_id - 1]; // TODO: don't use index, use lookup
                        });
                    });

                    callback(layers, eezs);
                });



            });
        },
        layers: function() {
            return layers || [];
        },
        eezs: function() {
            return eezs || [];
        },
        getLayerForID: function(id) {
            if (!eezs) return [];
            return eezs.filter(function(item){
                return item['ID'] === id;
            });
        },
        filterOn: function(key, value) {
            if (!eezs) return [];
            return eezs.filter(function(item){
                return item[key] === value;
            });
        }
    };






})(window);