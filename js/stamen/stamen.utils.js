(function(exports) {
    'use strict';
    var STA = exports.STA || (exports.STA = {});

    STA.utils = {};

    STA.utils.slice = [].slice;

    STA.utils.extend = function() {
        var consumer = arguments[0],
            providers = STA.utils.slice.call(arguments, 1),
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

})(window);