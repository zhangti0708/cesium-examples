var firstPoint;
var activeShapePoints = [];
var activeShape;
var floatingPoint;
var idPotions = {};


var viewer = new Cesium.Viewer('cesiumContainer', {
    selectionIndicator: false,
    infoBox: false,
    terrainProvider: Cesium.createWorldTerrain()
});

var handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);

viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

function createPoint(worldPosition) {
    var point = viewer.entities.add({
        position: worldPosition,
        point: {
            color: Cesium.Color.WHITE,
            pixelSize: 5,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
        }
    });
    return point;
}

var drawingMode = 'line';

function drawShape(positionData) {
    var shape;
    if (drawingMode === 'line') {
        shape = viewer.entities.add({
            polyline: {
                positions: positionData,
                clampToGround: true,
                width: 3
            }
        });
    }
    else if (drawingMode === 'polygon') {
        shape = viewer.entities.add({
            polygon: {
                hierarchy: positionData,
                material: new Cesium.ColorMaterialProperty(Cesium.Color.WHITE.withAlpha(0.7))
            }
        });
    } else if (drawingMode === 'circle') {
        var start = activeShapePoints[0];
        var end = activeShapePoints[activeShapePoints.length - 1];
        console.log(start.x);
        console.log(end.x);
        var r = Math.sqrt(Math.pow(start.x - end.x, 2) + Math.pow(start.y - end.y, 2));
        r = r ? r : r + 1;
        console.log('xxxx')
        shape = viewer.entities.add({
            position: activeShapePoints[0],
            // position: Cesium.Cartesian3.fromDegrees(activeShapePoints[0].x,
            //     activeShapePoints[0].y),
            // position: Cesium.Cartesian3.fromDegrees(-122.2058, 46.1955, 1000.0),
            name: 'Blue translucent, rotated, and extruded ellipse with outline',
            type:'Selection tool',
            ellipse: {
                //TODO 改为外部传入的
                semiMinorAxis: new Cesium.CallbackProperty(function () {
                    // let value = positionData.getValue(0);
                    let value = typeof positionData.getValue === 'function' ? positionData.getValue(0) : positionData;
                    var r = Math.sqrt(Math.pow(value[0].x - value[value.length - 1].x, 2) + Math.pow(value[0].y - value[value.length - 1].y, 2));
                    return r ? r : r + 1;
                }, false),
                semiMajorAxis: new Cesium.CallbackProperty(function () {
                    let value = typeof positionData.getValue === 'function' ? positionData.getValue(0) : positionData;
                    var r = Math.sqrt(Math.pow(value[0].x - value[value.length - 1].x, 2) + Math.pow(value[0].y - value[value.length - 1].y, 2));
                    return r ? r : r + 1;
                }, false),
                // semiMinorAxis:250000.0,
                // semiMajorAxis:400000.0,
                // extrudedHeight : 200000.0,
                // rotation: Cesium.Math.toRadians(45),
                material: Cesium.Color.BLUE.withAlpha(0.5),
                outline: true
            }
        });
        idPotions[shape.id] = positionData;

        console.log('yyyy')
    }
    return shape;
}

handler.setInputAction(function (event) {
    // We use `viewer.scene.pickPosition` here instead of `viewer.camera.pickEllipsoid` so that
    // we get the correct point when mousing over terrain.
    var earthPosition = viewer.scene.pickPosition(event.position);
    // `earthPosition` will be undefined if our mouse is not over the globe.
    if (Cesium.defined(earthPosition)) {
        if (activeShapePoints.length === 0) {
            floatingPoint = createPoint(earthPosition);
            firstPoint = floatingPoint;
            activeShapePoints.push(earthPosition);
            var dynamicPositions = new Cesium.CallbackProperty(function () {
                return activeShapePoints;
            }, false);
            activeShape = drawShape(dynamicPositions);
        }
        activeShapePoints.push(earthPosition);
        createPoint(earthPosition);
    }
}, Cesium.ScreenSpaceEventType.LEFT_CLICK);

handler.setInputAction(function (event) {
    if (Cesium.defined(floatingPoint)) {
        var newPosition = viewer.scene.pickPosition(event.endPosition);
        if (Cesium.defined(newPosition)) {
            floatingPoint.position.setValue(newPosition);
            activeShapePoints.pop();
            activeShapePoints.push(newPosition);
        }
    }
}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

// Redraw the shape so it's not dynamic and remove the dynamic shape.
function terminateShape() {
    activeShapePoints.pop();
    drawShape(activeShapePoints);
    viewer.entities.remove(floatingPoint);
    viewer.entities.remove(activeShape);
    floatingPoint = undefined;
    activeShape = undefined;
    activeShapePoints = [];
}

handler.setInputAction(function (event) {
    terminateShape();
}, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

var options = [{
    text: 'Draw Lines',
    onselect: function () {
        terminateShape();
        drawingMode = 'line';
    }
}, {
    text: 'Draw Polygons',
    onselect: function () {
        terminateShape();
        drawingMode = 'polygon';
    }
}, {
    text: 'circle',
    onselect: function () {
        terminateShape();
        drawingMode = 'circle';
    }
}];

// Sandcastle.addToolbarMenu(options);
// Zoom in to an area with mountains
viewer.camera.lookAt(Cesium.Cartesian3.fromDegrees(-122.2058, 46.1955, 1000.0), new Cesium.Cartesian3(5000.0, 5000.0, 5000.0));
viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);