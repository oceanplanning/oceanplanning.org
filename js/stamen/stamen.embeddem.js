'use strict';

(function(exports) {
    var STA = exports.STA || (exports.STA = {});

    STA.Embed = {};

    STA.Embed.config = {
        'page': 'index.html',
        'showKlass': 'show-embed',
        'showKlassElement' : 'body',
        'embedContainer': '#embed',
        'iframeContainer': '#embed-iframe'
    };
    var config = STA.Embed.config;


    STA.Embed.Authoring = function() {
      var contentTitle = "";
      var contentUrl = "";
      var contentName = "";
      // Something with properties of window.location
      var loc;
      var contentTitle, contentUrl, contentName;
      var my = {};

      my.iframeUrl = function() {
        var content_fragment = (loc.search) ? loc.search : "";

        if (contentTitle) {
          if (content_fragment.indexOf("?") >= 0) {
            content_fragment += "&";
          } else {
            content_fragment += "?";
          }
          content_fragment += "contentTitle=" + encodeURIComponent(contentTitle);

          if (contentUrl) {
            content_fragment += "&contentUrl=" + encodeURIComponent(contentUrl);
          }
        }

        // campaign tracking
        /*
        if(loc.hash.indexOf("?") >= 0 || content_fragment.indexOf("?") >= 0)
        {
          content_fragment += "&";
        } else {
          content_fragment += "?";
        }
        content_fragment += "utm_medium=Embed&utm_campaign=XXX&utm_source=" + encodeURIComponent(contentTitle);
        */

        var port_str = loc.port ? (":" + loc.port) : "";
        console.log(basepath())
        return loc.protocol + "//" + loc.hostname + port_str + basepath() + config.page + content_fragment + loc.hash;
      }

      my.snippet = function() {
        var compiled = STA.Embed.Utils.template("&lt;iframe style=\"border:0px;scrolling:no;width:100%;height:530px\" src=\"<%=src%>\"&gt;&lt;/iframe&gt;")

        /*
         if(contentTitle == "NONE" || contentTitle == "")
        {
          return "Please enter a title above to see this code.";
        }
        */

        return compiled({src:my.iframeUrl()});
      };

      my.loc = function(value) {
        if (!arguments.length) return loc;
        loc = value;
        return my;
      }

      function basepath() {
        var b =  loc.pathname.substring(0,loc.pathname.lastIndexOf("/")+1);
        var idx = b.lastIndexOf('/');
        while(b.charAt(idx-1) === '/'){b = b.slice(0,idx);idx--;}
        return b;
      }



      my.contentTitle = function(value) {
        if(!arguments.length) return contentTitle;
        contentTitle = value;
        return my;
      }

      my.contentUrl = function(value) {
        if(!arguments.length) return contentUrl;
        contentUrl = value;
        return my;
      }

      my.contentName = function(value) {
        if(!arguments.length) return contentName;
        contentName = value;
        return my;
      }

      my.shouldShowPreviewFooter = function() {
        if(contentTitle == "" || !contentTitle) return false;
        return true;
      }

      return my;
    };

    STA.Embed.WidgetManager = function(hash) {
        var result = STA.Embed.Utils.querystring.parseHash(hash);
        var contentTitle = result.contentTitle || null;
        var contentUrl = result.contentUrl || null;
        var my = {};

        my.contentTitle = function(value) {
            if(!arguments.length) return contentTitle;
            contentTitle = value;
            return my;
        }

        my.contentUrl = function(value) {
            if(!arguments.length) return contentUrl;
            contentUrl = value;
            return my;
        }

        my.disableZoomReset = function() {

          d3.select('body')
            .classed('no-zoom-reset', true);
          return my;
        }


        my.footerHeight = function() {
          if(contentTitle) {
            return 30;
          } else {
            return 0;
          }
        }

        my.footerDisplay = function() {
          if(contentTitle) {
            return "inline";
          } else {
            return "none";
          }
        }

        return my;

    }

    STA.Embed.Show = function() {
        STA.Embed.authoring.loc(window.location);

        var iframe = d3.select(STA.Embed.config.iframeContainer)
          .append("iframe")
          .on('load', function(){
            var e = d3.select(config.embedContainer + " iframe").node().contentWindow.STA.Embed;
            var w = e.widgetManager;
            w.disableZoomReset();
          });

        iframe.node().src = STA.Embed.authoring.iframeUrl();

        d3.select("#copypastethis").html(STA.Embed.authoring.snippet());
        d3.select(STA.Embed.config.showKlassElement).classed(STA.Embed.config.showKlass, true);
    };

    STA.Embed.Hide = function() {
        d3.select(STA.Embed.config.showKlassElement).classed(STA.Embed.config.showKlass, false);
        d3.select(STA.Embed.config.iframeContainer).selectAll("iframe").remove();
    };

    STA.Embed.Index = function(opts) {
        config = STA.utils.extend(STA.Embed.config, opts);

        STA.Embed.authoring = STA.Embed.Authoring();
        var e;
        d3.select("#embed-content-title").on("keyup", function(d) {
          e = d3.select(config.embedContainer + " iframe").node().contentWindow.STA.Embed;
          var w = e.widgetManager;
          w.contentTitle(this.value);
          e.DrawWidget(w);
          STA.Embed.authoring.contentTitle(this.value);
          d3.select("#copypastethis").html(STA.Embed.authoring.snippet());
        });

        d3.select("#embed-content-url").on("keyup", function(d) {
          e = d3.select(config.embedContainer + " iframe").node().contentWindow.STA.Embed;
          var w = e.widgetManager;
          w.contentUrl(this.value);
          e.DrawWidget(w);
          STA.Embed.authoring.contentUrl(this.value);
          d3.select("#copypastethis").html(STA.Embed.authoring.snippet());
        });
    };

    STA.Embed.Widget = function(hash) {
        hash = hash || window.location.search;

        var w = STA.Embed.WidgetManager(hash)
        STA.Embed.widgetManager = w;
        STA.Embed.DrawWidget(w);

    };

    STA.Embed.DrawWidget = function(w) {
        var footerHeight = w.footerHeight();
        d3.select("#ft .centered-span").text(w.contentTitle());
        d3.select("#content-link").attr("href",w.contentUrl());
        d3.select("#viewfullsite").attr("href","index.html" + window.location.hash);

        d3.select("#ft").style("display",w.footerDisplay());
        d3.select("#ft").style("height",footerHeight + 'px');
        d3.select("#ft").style("line-height",footerHeight + 'px');

        var map = d3.select(".map-section"),
            mapHeight = window.innerHeight - 50 - footerHeight;

        map.style("height", mapHeight + 'px');
    };

    STA.Embed.Utils = {};

    STA.Embed.Utils.querystring = {
        parseHash: function(str) {
              str = str || "";
              console.log(str)
              var start = str.indexOf("?");
              if (start >= 0) return STA.Embed.Utils.querystring.parse(str.substr(start));
              return {};
            },
        parse: function(str) {
              if (str.charAt(0) === "?") str = str.substr(1);
              if (str.length < 2) return {};
              var parts = str.split("&"),
                  len = parts.length,
                  query = {};
              for (var i = 0; i < len; i++) {
                var bits = parts[i].split("=", 2),
                    key = bits[0],
                    val = (bits.length > 1)
                      ? decodeURIComponent(bits[1]).replace(/\+/g, " ")
                      : true;
                switch (val) {
                  case "true": val = true; break;
                  case "false": val = false; break;
                  default:
                    var num = Number(val);
                    if (!isNaN(num)) val = num;
                    break;
                }
                query[key] = val;
              }

              return query;
            }
    }

    // from http://underscorejs.org/
    STA.Embed.Utils.template = function(text) {
            var noMatch = /(.)^/;
            var escapes = {
                "'":      "'",
                '\\':     '\\',
                '\r':     'r',
                '\n':     'n',
                '\u2028': 'u2028',
                '\u2029': 'u2029'
            };

            var escaper = /\\|'|\r|\n|\u2028|\u2029/g;

            var escapeChar = function(match) {
                return '\\' + escapes[match];
            };

            var settings = STA.Embed.Utils.template.templateSettings;

            var matcher = RegExp([
                  (settings.escape || noMatch).source,
                  (settings.interpolate || noMatch).source,
                  (settings.evaluate || noMatch).source
                ].join('|') + '|$', 'g');

            var index = 0;
            var source = "__p+='";
            text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
                source += text.slice(index, offset).replace(escaper, escapeChar);
                index = offset + match.length;

                if (escape) {
                    source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
                } else if (interpolate) {
                    source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
                } else if (evaluate) {
                    source += "';\n" + evaluate + "\n__p+='";
                }
                return match;
            });
            source += "';\n";

            if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

            source = "var __t,__p='',__j=Array.prototype.join," +
                  "print=function(){__p+=__j.call(arguments,'');};\n" +
                  source + 'return __p;\n';

            try {
                var render = new Function(settings.variable || 'obj', '_', source);
            } catch (e) {
                e.source = source;
                throw e;
            }

            var template = function(data) {
                return render.call(this, data);
            };

            var argument = settings.variable || 'obj';
            template.source = 'function(' + argument + '){\n' + source + '}';

            return template;
        };

        STA.Embed.Utils.template.templateSettings = {
            evaluate    : /<%([\s\S]+?)%>/g,
            interpolate : /<%=([\s\S]+?)%>/g,
            escape      : /<%-([\s\S]+?)%>/g
        };


})(window);