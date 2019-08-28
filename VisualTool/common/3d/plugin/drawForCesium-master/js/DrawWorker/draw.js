/**
 * Created by xph
   此代码基于MIT开源协议，引用请注明版权
   Licensed under the MIT license
 */
var center = [110.98, 30.83];
var timer = null;
var viewer = null;
var scene = null;
var canvas = null;
var clock = null;
var camera = null;

$(function () {
    $(document).ready(function () {
        initialGlobeView();
        initDrawHelper();
    });
    
    function initialGlobeView() {
	 viewer = new Cesium.Viewer('cesiumContainer', {
			imageryProvider : Cesium.createTileMapServiceImageryProvider({
					url : Cesium.buildModuleUrl('Assets/Textures/NaturalEarthII')
			}),
			baseLayerPicker : false,
			geocoder : false
		});     
    }
    
    function initDrawHelper() {
    	$("#toolbar").html("");
        $("#loggingText").html("");
        var drawHelper = new DrawHelper(viewer);
        var scene = viewer.scene;
        var toolbar = drawHelper.addToolbar(document.getElementById("toolbar"), {
            buttons: ['polygon','extent',"tailedAttackArrow"]
        });

        toolbar.addListener('polygonCreated', function (event) {
            loggingMessage('钳击箭头');
            var polygon = new DrawHelper.PolygonPrimitive({
                positions: event.positions,
                custom:event.custom,
                material: Cesium.Material.fromType(Cesium.Material.ColorType)
            });
            scene.primitives.add(polygon);
            polygon.setEditable();
            polygon.addListener('onEdited', function (event) {
            	loggingMessage('钳击箭头');
            });

        });
        toolbar.addListener('tailedAttackCreated', function (event) {
            loggingMessage('攻击箭头');
            var polygon = new DrawHelper.TailedAttackPrimitive({
                positions: event.positions,
                custom:event.custom,
                material: Cesium.Material.fromType(Cesium.Material.ColorType)
            });
            scene.primitives.add(polygon);
            polygon.setEditable();
            polygon.addListener('onEdited', function (event) {
            	loggingMessage('攻击箭头');
            });

        });             
        toolbar.addListener('straightArrowCreated', function (event) {
            var arrow = event.arrow;
            console.log(arrow);
            loggingMessage('箭头创建');
            var straightArrowPrimitive = new DrawHelper.StraightArrowPrimitive({
                arrow: arrow,
                material: Cesium.Material.fromType(Cesium.Material.ColorType)
            });
            scene.primitives.add(straightArrowPrimitive);
            straightArrowPrimitive.setEditable();
            straightArrowPrimitive.addListener('onEdited', function (event) {
            	 loggingMessage('箭头创建');
            });
        });

        var logging = document.getElementById('loggingText');
        function loggingMessage(message) {
            logging.innerHTML = message;
        }
    }
});
