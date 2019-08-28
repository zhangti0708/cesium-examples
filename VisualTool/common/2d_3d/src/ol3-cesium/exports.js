goog.require('olcs.AbstractSynchronizer');
goog.require('olcs.Camera');
goog.require('olcs.DragBox');
goog.require('olcs.DragBoxEventType');
goog.require('olcs.OLCesium');
goog.require('olcs.VectorSynchronizer');
goog.require('olcs.core');
goog.require('olcs.core.OlLayerPrimitive');


goog.exportSymbol(
    'olcs.AbstractSynchronizer',
    olcs.AbstractSynchronizer);

goog.exportProperty(
    olcs.AbstractSynchronizer.prototype,
    'synchronize',
    olcs.AbstractSynchronizer.prototype.synchronize);

goog.exportSymbol(
    'olcs.Camera',
    olcs.Camera);

goog.exportProperty(
    olcs.Camera.prototype,
    'setHeading',
    olcs.Camera.prototype.setHeading);

goog.exportProperty(
    olcs.Camera.prototype,
    'getHeading',
    olcs.Camera.prototype.getHeading);

goog.exportProperty(
    olcs.Camera.prototype,
    'setTilt',
    olcs.Camera.prototype.setTilt);

goog.exportProperty(
    olcs.Camera.prototype,
    'getTilt',
    olcs.Camera.prototype.getTilt);

goog.exportProperty(
    olcs.Camera.prototype,
    'setDistance',
    olcs.Camera.prototype.setDistance);

goog.exportProperty(
    olcs.Camera.prototype,
    'getDistance',
    olcs.Camera.prototype.getDistance);

goog.exportProperty(
    olcs.Camera.prototype,
    'setCenter',
    olcs.Camera.prototype.setCenter);

goog.exportProperty(
    olcs.Camera.prototype,
    'getCenter',
    olcs.Camera.prototype.getCenter);

goog.exportProperty(
    olcs.Camera.prototype,
    'setPosition',
    olcs.Camera.prototype.setPosition);

goog.exportProperty(
    olcs.Camera.prototype,
    'getPosition',
    olcs.Camera.prototype.getPosition);

goog.exportProperty(
    olcs.Camera.prototype,
    'setAltitude',
    olcs.Camera.prototype.setAltitude);

goog.exportProperty(
    olcs.Camera.prototype,
    'getAltitude',
    olcs.Camera.prototype.getAltitude);

goog.exportProperty(
    olcs.Camera.prototype,
    'lookAt',
    olcs.Camera.prototype.lookAt);

goog.exportProperty(
    olcs.Camera.prototype,
    'updateView',
    olcs.Camera.prototype.updateView);

goog.exportSymbol(
    'olcs.core.lookAt',
    olcs.core.lookAt);

goog.exportSymbol(
    'olcs.core.extentToRectangle',
    olcs.core.extentToRectangle);

goog.exportSymbol(
    'olcs.core.tileLayerToImageryLayer',
    olcs.core.tileLayerToImageryLayer);

goog.exportSymbol(
    'olcs.core.updateCesiumLayerProperties',
    olcs.core.updateCesiumLayerProperties);

goog.exportSymbol(
    'olcs.core.ol4326CoordinateToCesiumCartesian',
    olcs.core.ol4326CoordinateToCesiumCartesian);

goog.exportSymbol(
    'olcs.core.ol4326CoordinateArrayToCsCartesians',
    olcs.core.ol4326CoordinateArrayToCsCartesians);

goog.exportSymbol(
    'olcs.core.olCircleGeometryToCesium',
    olcs.core.olCircleGeometryToCesium);

goog.exportSymbol(
    'olcs.core.olLineStringGeometryToCesium',
    olcs.core.olLineStringGeometryToCesium);

goog.exportSymbol(
    'olcs.core.olPolygonGeometryToCesium',
    olcs.core.olPolygonGeometryToCesium);

goog.exportSymbol(
    'olcs.core.olPointGeometryToCesium',
    olcs.core.olPointGeometryToCesium);

goog.exportSymbol(
    'olcs.core.olMultiGeometryToCesium',
    olcs.core.olMultiGeometryToCesium);

goog.exportSymbol(
    'olcs.core.olGeometry4326TextPartToCesium',
    olcs.core.olGeometry4326TextPartToCesium);

goog.exportSymbol(
    'olcs.core.olStyleToCesium',
    olcs.core.olStyleToCesium);

goog.exportSymbol(
    'olcs.core.computePlainStyle',
    olcs.core.computePlainStyle);

goog.exportSymbol(
    'olcs.core.olFeatureToCesium',
    olcs.core.olFeatureToCesium);

goog.exportSymbol(
    'olcs.core.olVectorLayerToCesium',
    olcs.core.olVectorLayerToCesium);

goog.exportSymbol(
    'olcs.DragBox',
    olcs.DragBox);

goog.exportProperty(
    olcs.DragBox.prototype,
    'setScene',
    olcs.DragBox.prototype.setScene);

goog.exportProperty(
    olcs.DragBox.prototype,
    'listen',
    olcs.DragBox.prototype.listen);

goog.exportSymbol(
    'olcs.OLCesium',
    olcs.OLCesium);

goog.exportProperty(
    olcs.OLCesium.prototype,
    'getCamera',
    olcs.OLCesium.prototype.getCamera);

goog.exportProperty(
    olcs.OLCesium.prototype,
    'getCesiumScene',
    olcs.OLCesium.prototype.getCesiumScene);

goog.exportProperty(
    olcs.OLCesium.prototype,
    'getEnabled',
    olcs.OLCesium.prototype.getEnabled);

goog.exportProperty(
    olcs.OLCesium.prototype,
    'setEnabled',
    olcs.OLCesium.prototype.setEnabled);

goog.exportSymbol(
    'olcs.VectorSynchronizer',
    olcs.VectorSynchronizer);

goog.exportProperty(
    olcs.core.OlLayerPrimitive.prototype,
    'convert',
    olcs.core.OlLayerPrimitive.prototype.convert);
