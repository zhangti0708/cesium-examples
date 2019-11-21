if (!window.app) {
  window.app = {};
}
var app = window.app;

/**
 * Options for app.WFSBBOXLoader.
 * @typedef {Object} WFSBBOXLoaderOptions
 * @property {string} url - The OnlineResource of the WFS.
 * @property {string} featurePrefix - The prefix for the featureNS.
 * @property {string} featureType - The name of the feature type to use.
 * @property {string} srsName - The srsName to use, normally the view's
 * projection.
 * @property {string} outputFormat - The output format to use. Defaults to
 * 'application/json'.
 * @property {function} callback - The callback to call when done.
 */

/**
 * @class
 * The WFSBBOXLoader is a helper function for having a BBOX strategy with a
 * WFS protocol.
 *
 * @constructor
 * @param {WFSBBOXLoaderOptions} options Options.
 */
app.WFSBBOXLoader = function(options) {
  this.url_ = options.url;
  this.featurePrefix_ = options.featurePrefix;
  this.featureType_ = options.featureType;
  this.srsName_ = options.srsName;
  this.outputFormat_ = 'application/json';
  this.callback_ = options.callback;
};

/**
 * Load features from the WFS in a certain extent.
 * @param {ol.Extent} extent The extent to query for.
 */
app.WFSBBOXLoader.prototype.load = function(extent) {
  var wfs = this.url_;
  var featureType = this.featurePrefix_ + ':' + this.featureType_;
  var outputFormat = this.outputFormat_;
  var url = wfs + 'service=WFS&' +
    'version=1.1.0&request=GetFeature&typename=' + featureType + '&' +
    'outputFormat=' + outputFormat + '&srsname=' + this.srsName_ + '&bbox=' +
    extent.join(',') + ',' + this.srsName_;
  var me = this;
  $.ajax({
    url: url,
    context: extent
  }).then(function(response) {
    me.callback_.call(this, response);
  });
};
