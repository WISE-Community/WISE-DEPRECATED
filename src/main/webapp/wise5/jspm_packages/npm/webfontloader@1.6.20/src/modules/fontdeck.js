/* */ 
(function(process) {
  goog.provide('webfont.modules.Fontdeck');
  goog.require('webfont.Font');
  webfont.modules.Fontdeck = function(domHelper, configuration) {
    this.domHelper_ = domHelper;
    this.configuration_ = configuration;
    this.fonts_ = [];
  };
  webfont.modules.Fontdeck.NAME = 'fontdeck';
  webfont.modules.Fontdeck.HOOK = '__webfontfontdeckmodule__';
  webfont.modules.Fontdeck.API = '//f.fontdeck.com/s/css/js/';
  goog.scope(function() {
    var Fontdeck = webfont.modules.Fontdeck,
        Font = webfont.Font,
        FontVariationDescription = webfont.FontVariationDescription;
    Fontdeck.prototype.getScriptSrc = function(projectId) {
      var protocol = this.domHelper_.getProtocol();
      var hostname = this.domHelper_.getHostName();
      var api = this.configuration_['api'] || webfont.modules.Fontdeck.API;
      return protocol + api + hostname + '/' + projectId + '.js';
    };
    Fontdeck.prototype.load = function(onReady) {
      var projectId = this.configuration_['id'];
      var loadWindow = this.domHelper_.getLoadWindow();
      var self = this;
      if (projectId) {
        if (!loadWindow[webfont.modules.Fontdeck.HOOK]) {
          loadWindow[webfont.modules.Fontdeck.HOOK] = {};
        }
        loadWindow[webfont.modules.Fontdeck.HOOK][projectId] = function(fontdeckSupports, data) {
          for (var i = 0,
              j = data['fonts'].length; i < j; ++i) {
            var font = data['fonts'][i];
            self.fonts_.push(new Font(font['name'], Font.parseCssVariation('font-weight:' + font['weight'] + ';font-style:' + font['style'])));
          }
          onReady(self.fonts_);
        };
        this.domHelper_.loadScript(this.getScriptSrc(projectId), function(err) {
          if (err) {
            onReady([]);
          }
        });
      } else {
        onReady([]);
      }
    };
  });
})(require('process'));
