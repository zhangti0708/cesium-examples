if (!window.app) {
  window.app = {};
}
var app = window.app;

/**
 * Options for app.FeatureTable.
 * @typedef {Object} FeatureTableOptions
 * @property {string} id - The id of the HTML table to use.
 * @property {string[]} fields - A list of fields to display.
 * @property {boolean} showFeatureId - Show the feature id as a column.
 * @property {ol.source.Vector} source - The vector source to use for the
 * features.
 * @property {ol.Map} map - The map to interact with.
 * @property {string} container - The id of the div around the table.
 * @property {ol.interaction.Select} select - The select interaction to use.
 * @property {number} offset - The offset to use when scrolling the table.
 */

/**
 * @class
 * The FeatureTable is a table than can display vector features. It supports
 * bi-directional selection, if a feature is selected in the map, it will get
 * selected in the table as well. Also, if a feature is selected in the table,
 * the corresponding feature will be selected in the map.
 *
 * @constructor
 * @param {FeatureTableOptions} options Options.
 */
app.FeatureTable = function(options) {
  this.id_ = options.id;
  this.container_ = options.container;
  this.source_ = options.source;
  this.source_.on('addfeature', this.addRow, this);
  this.map_ = options.map;
  this.showFid_ = options.showFeatureId;
  this.fields_ = options.fields;
  this.select_ = options.select;
  this.offset_ = options.offset;
  this.select_.getFeatures().on('add', this.selectRow, this);
  this.select_.getFeatures().on('remove', this.unselectRow, this);
  $('#' + this.id_).on('click', 'tbody tr', this, this.handleRowClick);
  this.addHeader();
  this.addSpacerRow();
};

/**
 * Add the header for the feature table.
 */
app.FeatureTable.prototype.addHeader = function() {
  var html = '';
  if (this.showFid_ === true) {
    html += '<thead><th>FID</th>';
  }
  for (var i=0, ii=this.fields_.length; i<ii; ++i) {
    var field = this.fields_[i];
    html += '<th>' + field.toUpperCase() + '</th>';
  }
  html += '</thead>';
  $('#' + this.id_).append(html);
};

/**
 * Add a table row for a feature, insert as first row.
 * @param {ol.source.VectorEvent} evt The event object.
 */
app.FeatureTable.prototype.addRow = function(evt) {
  var feature = evt.feature, key;
  var row = '<tr>';
  if (this.showFid_ === true) {
    row += '<td class="fid">' + feature.getId() + '</td>';
  }
  for (var i=0, ii=this.fields_.length; i<ii; ++i) {
    var field = this.fields_[i];
    row += '<td>' + feature.get(field) + '</td>';
  }
  row += '</tr>';
  $('#' + this.id_).prepend(row);
};

/**
 * Add a spacer table row to feature tables of set height.
 * Enables other rows to have normal height.
 * @param {ol.source.VectorEvent} evt The event object.
 */
app.FeatureTable.prototype.addSpacerRow = function(evt) {
  
  var row = '<tr style="height: auto;"><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>';
  $('#' + this.id_).append(row);
};

/**
 * Handle clicking on a row in the feature table.
 * @param {Event} evt The event object.
 */
app.FeatureTable.prototype.handleRowClick = function(evt) {
  var me = evt.data;
  var fid = $(this).closest("tr").find(".fid").text();
  var feature = me.source_.forEachFeature(function(feature) {
    if (feature.getId() === fid) {
      return feature;
    }
  });
  me.select_.getFeatures().clear();
  me.select_._silent = true;
  me.select_.getFeatures().push(feature);
  delete me.select_._silent;
  var geomExtent = feature.getGeometry().getExtent();
  var extent = ol.extent.buffer(geomExtent, (ol.extent.getWidth(geomExtent)+ol.extent.getHeight(geomExtent))/2);
  me.map_.getView().fitExtent(extent, me.map_.getSize());
  $(this).addClass('highlight').siblings().removeClass('highlight');
};

/**
 * Select a row in the feature table.
 * @param {ol.CollectionEvent} evt The event object.
 */
app.FeatureTable.prototype.selectRow = function(evt) {
  if (this.select_._silent === true) {
    return;
  }
  var feature = evt.element;
  var fid = feature.getId();
  var me = this;
  $('#' + this.id_ + ' tr').each(function (i, row) {
    if ($(row).find(".fid").text() === fid) {
      $(row).addClass('highlight');
      var parentPos = $(row).parent().position();
      var rowpos =  $(row).position();
      $('#' + me.container_).scrollTop(rowpos.top-parentPos.top+me.offset_);
      return false;
    }
  });
};

/**
 * Unselect all rows in the feature table.
 */
app.FeatureTable.prototype.unselectRow = function() {
  $('#' + this.id_ + ' tr').each(function (i, row) {
    if ($(row).hasClass('highlight')) {
      $(row).removeClass('highlight');
      return false;
    }
  });
};
