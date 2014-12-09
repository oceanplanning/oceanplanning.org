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
            var txtt = "Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of 'de Finibus Bonorum et Malorum' (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, 'Lorem ipsum dolor sit amet..', comes from a line in section 1.10.32.";
            descriptionTxt.text(txtt + txtt);
            //descriptionTxt.text(data.narrative || "No description available.");


            detailItems.each(function(){
                var el = d3.select(this),
                    key = el.attr('data-key'),
                    valEl = el.select('.value'),
                    value = data[key] || 'n/a'

                if (key === 'ocean_uses_covered') {
                    value += "sncnjc cjc cjncjn cjncjnd cjncdnd cjcnjdn cjncjnc cjcnjc cjncjncdc jnjcn cjncjcnn cjccj  cjn jncnc jncjnc jncnjd cjncdjejnc ncn cncjn njcd ncn jcncnjdcnc jncn."
                }
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