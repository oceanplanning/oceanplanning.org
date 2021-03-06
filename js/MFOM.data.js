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
    }

    function findID(data, id) {
        return data.filter(function(item){
            return item.id == id;
        });

    }

    var layers, eezs;
    MFOM.data = {

        load: function(callback) {
            if (layers) return;
            layers = extend([],MFOM.config.map.layers);
            d3.csv(MFOM.config.files.csvBase + MFOM.config.files.eez,
                function(d){
                    // process incoming rows
                    return d;
                },
                function(csvdata) {
                    eezs = csvdata;

                    // switch to low-res for ie9
                    var base = MFOM.config.lteIE9 ? MFOM.config.files.geojsonLowResBase : MFOM.config.files.geojsonBase;
                    d3.json(base + MFOM.config.files.planningAreas, function(planningAreasTopojson) {
                        // Apply the geojson objects to the tasks array
                        layers.forEach(function(lyr) {
                            lyr.geojson = topojson.feature(planningAreasTopojson, planningAreasTopojson.objects[lyr.topojson_layer]);
                        });

                        // assign csv data to each feature
                        // also remove layers w/o csv data
                        var temp = [];
                        layers.forEach(function(lyr) {
                            lyr.geojson.features.forEach(function(feature){
                                //if (+lyr.csv_id === 12) return;
                                var f = findID(csvdata, lyr.csv_id);
                                if (f.length) {
                                    feature.properties = f[0];
                                    temp.push(lyr);
                                }
                            });
                        });
                        layers = temp;

                        callback(layers, eezs);
                    });
                }
            );
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
                return item['id'] === id;
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