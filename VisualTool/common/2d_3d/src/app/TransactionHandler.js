if (!window.app) {
  window.app = {};
}
var app = window.app;

/**
 * Options for app.TransactionHandler.
 * @typedef {Object} TransactionHandlerOptions
 * @property {ol.source.Vector} source - The vector source to use for the
 * features.
 * @property {ol.geom.GeometryType} geometryType - The type of geometry.
 * @property {string} geometryName  - The name of the geometry attribute.
 * @property {string} srsName - The srsName to use (normally the
 * view's projection).
 * @property {string} featureNS - The feature namespace.
 * @property {string} featureType - The name of the featureType.
 * @property {string} url - The url of the Web Feature Service.
 * @property {ol.Map} map - The map to interact with.
 */

/**
 * @class
 * The TransactionHandler is a helper class to facilitate inserts, updates
 * and deletes using WFS-T.
 *
 * @constructor
 * @param {TransactionHandlerOptions} options Options.
 */
app.TransactionHandler = function(options) {
  this.srsName_ = options.srsName;
  this.source_ = options.source;
  this.geometryType_ = options.geometryType;
  this.geometryName_ = options.geometryName;
  this.url_ = options.url;
  this.map_ = options.map;
  this.featureNS_ = options.featureNS;
  this.featureType_ = options.featureType;
  this.draw_ = new ol.interaction.Draw({
    source: this.source_,
    'type': this.geometryType_,
    geometryName: this.geometryName_
  });
  this.hasDraw_ = false;
  this.select_ = new ol.interaction.Select();
  this.modify_ = new ol.interaction.Modify({
    features: this.select_.getFeatures()
  });
  this.select_.getFeatures().on('add', this.onSelectAdd_, this);
  this.select_.getFeatures().on('remove', this.onSelectRemove_, this);
  this.dirty_ = {};
  this.map_.addInteraction(this.select_);
  this.map_.addInteraction(this.modify_);
  this.format_ = new ol.format.WFS();
  this.serializer_ = new XMLSerializer();
  this.draw_.on('drawend', this.onDrawEnd, this);
};

/**
 * Get a reference to the select interaction.
 * @returns {ol.interaction.Select}
 */
app.TransactionHandler.prototype.getSelect = function() {
  return this.select_;
};

/**
 * Handler for when a featue gets selected. Register a change listener on the
 * feature to see if it got modified.
 * @param {ol.CollectionEvent} evt The event object.
 */
app.TransactionHandler.prototype.onSelectAdd_ = function(evt) {
  var feature = evt.element;
  var fid = feature.getId();
  feature.on('change', function(evt) {
    this.dirty_[evt.target.getId()] = true;
  }, this);
};

/**
 * Handler for when a featue gets unselected. If the feature is dirty, send
 * a WFS Update transaction.
 * @param {ol.CollectionEvent} evt The event object.
 */
app.TransactionHandler.prototype.onSelectRemove_ = function(evt) {
  var feature = evt.element;
  var fid = feature.getId();
  if (this.dirty_[fid]) {
    // do a WFS transaction to update the geometry
    var properties = feature.getProperties();
    // get rid of bbox which is not a real property
    delete properties.bbox;
    var clone = new ol.Feature(properties);
    clone.setId(fid);
    var node = this.format_.writeTransaction(null, [clone], null, {
      gmlOptions: {srsName: this.srsName_},
      featureNS: this.featureNS_,
      featureType: this.featureType_
    });
    $.ajax({
      type: "POST",
      url: this.url_,
      data: this.serializer_.serializeToString(node),
      contentType: 'text/xml',
      success: function(data) {
        var result = this.format_.readTransactionResponse(data);
        if (result.transactionSummary.totalUpdated === 1) {
          delete this.dirty_[fid];
        }
      },
      context: this
    });
  }
};

/**
 * Handler for when drawing ends. Send a WFS Insert Transaction.
 * @param {ol.DrawEvent} evt The event object.
 */
app.TransactionHandler.prototype.onDrawEnd = function(evt) {
  var feature = evt.feature;
  var node = this.format_.writeTransaction([feature], null, null, {
    gmlOptions: {srsName: this.srsName_},
    featureNS: this.featureNS_,
    featureType: this.featureType_
  });
  $.ajax({
    type: "POST",
    url: this.url_,
    data: this.serializer_.serializeToString(node),
    contentType: 'text/xml',
    success: function(data) {
      var result = this.format_.readTransactionResponse(data);
      feature.setId(result.insertIds[0]);
      this.map_.removeInteraction(this.draw_);
      this.hasDraw_ = false;
    },
    error: function(e) {
      this.map_.removeInteraction(this.draw_);
      this.hasDraw_ = false;
      var errorMsg = e? (e.status + ' ' + e.statusText) : "";
      bootbox.alert('Error saving this feature to GeoServer.<br><br>'
        + errorMsg);
    },
    context: this
  });
};

/**
 * Activate the draw interaction for inserting new features.
 */
app.TransactionHandler.prototype.activateInsert = function() {
  if (this.hasDraw_ !== true) {
    this.map_.addInteraction(this.draw_);
    this.hasDraw_ = true;
  }
};

/**
 * Send a WFS Delete Transaction for the currently selected feature.
 */
app.TransactionHandler.prototype.deleteSelected = function() {
  var features = this.select_.getFeatures();
  if (features.getLength() === 1) {
    var feature = features.item(0);
    bootbox.confirm("Are you sure you want to delete the currently selected feature?", $.proxy(function(result) {
      if (result === true) {
        var node = this.format_.writeTransaction(null, null, [feature], {
          featureNS: this.featureNS_,
          featureType: this.featureType_
        });
        $.ajax({
          type: "POST",
          url: this.url_,
          data: this.serializer_.serializeToString(node),
          contentType: 'text/xml',
          success: function(data) {
            var result = this.format_.readTransactionResponse(data);
            if (result.transactionSummary.totalDeleted === 1) {
              this.select_.getFeatures().clear();
              this.source_.removeFeature(feature);
            } else {
              bootbox.alert("There was an issue deleting the feature.");
            }
          },
          context: this
        });
      }
    }, this));
  }
};
