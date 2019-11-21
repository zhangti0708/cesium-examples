/**
 * Add all your dependencies here.
 */

var map = new ol.Map({
  target: 'map',
  layers: [
    new ol.layer.Tile({
      source: new ol.source.BingMaps({
        // Get your own key at http://bingmapsportal.com/
        // Replace the key below with your own.
        key: 'AhaJDO_bWhekq58C0nGLRkwJSMphRFDTYeccozENkqZTAAa1W0OgoaWmcgbPxatZ',
        imagerySet: 'AerialWithLabels'
      })
    })
  ],
  view: new ol.View({
    center: [0, 0],
    zoom: 2
  })
});

var dragdrop = new ol.interaction.DragAndDrop({
  formatConstructors: [ol.format.GPX, ol.format.KML, ol.format.GeoJSON]
});
map.addInteraction(dragdrop);
dragdrop.on('addfeatures', function(event) {
  var vectorSource = new ol.source.Vector({
    features: event.features,
    projection: event.projection
  });
  map.getLayers().push(new ol.layer.Vector({
    source: vectorSource
  }));
  map.getView().fitExtent(vectorSource.getExtent(), map.getSize());
});

var ol3d = new olcs.OLCesium(map); // map is the ol.Map instance
var scene = ol3d.getCesiumScene();
/*var terrainProvider = new Cesium.CesiumTerrainProvider({
  url: '//assets.agi.com/stk-terrain/world'
});
scene.terrainProvider = terrainProvider;*/


// UI Behavior

$('#zoom-world').click(function() {
  map.getView().setCenter([0, 0]);
  map.getView().setZoom(2); 
});

$('#toggle-globe').click(function() {
  ol3d.setEnabled(!ol3d.getEnabled());
});

$('#clear-tracks').click(function() {
  var layers = map.getLayers();
  var i = layers.getLength();
  while (i > 0) {
    if (layers.item(--i) instanceof ol.layer.Vector) {
      layers.pop();
    }
  }
});