/*
 * @Descripttion: 
 * @version: 1.0
 * @Author: zhangti
 * @Date: 2019-10-25 10:19:44
 * @LastEditors: sueRimn
 * @LastEditTime: 2019-10-25 11:23:54
 */
/**
 * 裁剪分析
 */
export default class Shear{
	
	constructor(opt){
		if(opt == undefined){
			alert("没有传入参数");
			return false;
		}
		
		this.init(opt);

	}
	init(opt){
		let _self = this;
		for(let key in opt){
			_self[key] = opt[key];
		}
		_self.planeEntities = [];
		_self.targetY = 0.0;
		_self.selectedPlane = null;
		//视图模型
		_self.viewModel = {
			debugBoundingVolumesEnabled : false,
			edgeStylingEnabled : true
		};
		// Select plane when mouse down
		_self.Handler.setInputAction(function(movement) {
			var pickedObject = scene.pick(movement.position);
			if (Cesium.defined(pickedObject) &&
					Cesium.defined(pickedObject.id) &&
					Cesium.defined(pickedObject.id.plane)) {
				_self.selectedPlane = pickedObject.id.plane;
				_self.selectedPlane.material = Cesium.Color.WHITE.withAlpha(0.05);
				_self.selectedPlane.outlineColor = Cesium.Color.WHITE;
				_self.scene.screenSpaceCameraController.enableInputs = false;
			}
		}, Cesium.ScreenSpaceEventType.LEFT_DOWN);

		// Release plane on mouse up
		_self.Handler.setInputAction(function() {
			if (Cesium.defined(_self.selectedPlane)) {
				_self.selectedPlane.material = Cesium.Color.WHITE.withAlpha(0.1);
				_self.selectedPlane.outlineColor = Cesium.Color.WHITE;
				_self.selectedPlane = undefined;
			}

			scene.screenSpaceCameraController.enableInputs = true;
		}, Cesium.ScreenSpaceEventType.LEFT_UP);

		// Update plane on mouse move
		_self.Handler.setInputAction(function(movement) {
			if (Cesium.defined(selectedPlane)) {
				var deltaY = movement.startPosition.y - movement.endPosition.y;
				_self.targetY += deltaY;
			}
		}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
	}
	build(){
		switch(this.opt.type){
			case "tileset" : this.loadTileset(this.url);
			case "model" : this.loadModel(this.url);
		}
	}
	//3dtiles
	loadTileset(url){
		let _self = this;
		_self.clippingPlanes = new Cesium.ClippingPlaneCollection({
			planes : [
				new Cesium.ClippingPlane(new Cesium.Cartesian3(0.0, 0.0, -1.0), 0.0)
			],
			edgeWidth : _self.viewModel.edgeStylingEnabled ? 1.0 : 0.0
		});
	
		_self.tileset = _self.viewer.scene.primitives.add(new Cesium.Cesium3DTileset({
			url : url,
			clippingPlanes : _self.clippingPlanes
		}));
	
		_self.tileset.debugShowBoundingVolume = viewModel.debugBoundingVolumesEnabled;
		return _self.tileset.readyPromise.then(function() {
			var boundingSphere = _self.tileset.boundingSphere;
			var radius = boundingSphere.radius;
	
			_self.viewer.zoomTo(_self.tileset, new Cesium.HeadingPitchRange(0.5, -0.2, radius * 4.0));
	
			if (!Cesium.Matrix4.equals(_self.tileset.root.transform, Cesium.Matrix4.IDENTITY)) {
				// The clipping plane is initially positioned at the tileset's root transform.
				// Apply an additional matrix to center the clipping plane on the bounding sphere center.
				var transformCenter = Cesium.Matrix4.getTranslation(_self.tileset.root.transform, new Cesium.Cartesian3());
				var height = Cesium.Cartesian3.distance(transformCenter, _self.tileset.boundingSphere.center);
				_self.clippingPlanes.modelMatrix = Cesium.Matrix4.fromTranslation(new Cesium.Cartesian3(0.0, 0.0, height));
			}
	
			for (var i = 0; i < _self.clippingPlanes.length; ++i) {
				var plane = _self.clippingPlanes.get(i);
				var planeEntity = _self.viewer.entities.add({
					position : boundingSphere.center,
					plane : {
						dimensions : new Cesium.Cartesian2(radius * 2.5, radius * 2.5),
						material : Cesium.Color.WHITE.withAlpha(0.1),
						plane : new Cesium.CallbackProperty(createPlaneUpdateFunction(plane), false),
						outline : true,
						outlineColor : Cesium.Color.WHITE
					}
				});
	
				_self.planeEntities.push(planeEntity);
			}
			return tileset;
		}).otherwise(function(error) {
			console.log(error);
		});
	}
	//模型
	loadModel(url){
		let _self = this;
		_self.clippingPlanes = new Cesium.ClippingPlaneCollection({
			planes : [
				new Cesium.ClippingPlane(new Cesium.Cartesian3(0.0, 0.0, -1.0), 0.0)
			],
			edgeWidth : _self.viewModel.edgeStylingEnabled ? 1.0 : 0.0
		});
	
		var position = Cesium.Cartesian3.fromDegrees(-123.0744619, 44.0503706, 300.0);
		var heading = Cesium.Math.toRadians(135.0);
		var pitch = 0.0;
		var roll = 0.0;
		var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
		var orientation = Cesium.Transforms.headingPitchRollQuaternion(position, hpr);
		var entity = _self.viewer.entities.add({
			name : url,
			position : position,
			orientation : orientation,
			model : {
				uri : url,
				scale : 8,
				minimumPixelSize : 100.0,
				clippingPlanes : _self.clippingPlanes
			}
		});
	
		_self.viewer.trackedEntity = entity;
	
		for (var i = 0; i < _self.clippingPlanes.length; ++i) {
			var plane = _self.clippingPlanes.get(i);
			var planeEntity = _self.viewer.entities.add({
				position : position,
				plane : {
					dimensions : new Cesium.Cartesian2(300.0, 300.0),
					material : Cesium.Color.WHITE.withAlpha(0.1),
					plane : new Cesium.CallbackProperty(createPlaneUpdateFunction(plane), false),
					outline : true,
					outlineColor : Cesium.Color.WHITE
				}
			});
			_self.planeEntities.push(planeEntity);
		}
	}
	remove(){
		for(let i in this.planeEntities)this.viewer.entities.remove(this.planeEntities[i]);
		this.viewer.scene.primitives.remove(this.tileset);
		this.planeEntities = [];
		this.targetY = 0.0;
		this.tileset = null;
		this.Handle.destroy();
		this.Handle = null;
	}


}