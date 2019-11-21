/*
 * @Descripttion: 
 * @version: 1.0
 * @Author: zhangti
 * @Date: 2019-10-22 15:32:42
 * @LastEditors: sueRimn
 * @LastEditTime: 2019-10-22 16:22:14
 */
/****
 * --------
 *   标绘
 * --------
 */

/**
 * 钳击箭头
 */
const PincerArrow = class {
    constructor(viewer){
        this.type = "PincerArrow";
        this.objId = Number((new Date()).getTime()+ "" +Number(Math.random()*1000).toFixed(0))
        this.viewer = viewer;
        this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
        this.pointImageUrl = "../libs/plot/point.png";
        this.fillMaterial = Cesium.Color.fromCssColorString('#0000FF').withAlpha(0.5);
        this.outlineMaterial = new Cesium.PolylineDashMaterialProperty({
            dashLength: 16,
            color: Cesium.Color.fromCssColorString('#f00').withAlpha(0.7)
        });
        this.positions = [];
        this.state = -1; 
        this.floatPoint = null;
        this.pointArr = [];
        this.selectPoint = null;
        this.clickStep = 0; 
    }
    disable() {
		this.positions = [];
		if (this.arrowEntity) {
			this.viewer.entities.remove(this.arrowEntity);
			this.arrowEntity = null;
		}
		this.state = -1;
		if (this.handler) {
			this.handler.destroy();
			this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
		}
		if (this.floatPoint) {
			this.viewer.entities.remove(this.floatPoint);
			this.floatPoint = null;
		}
		if (this.selectPoint) {
			this.viewer.entities.remove(this.selectPoint);
			this.selectPoint = null;
		}
		for (var i = 0; i < this.pointArr.length; i++) {
			if (this.pointArr[i]) this.viewer.entities.remove(this.pointArr[i]);
		}
		if (this.modifyHandler) {
			this.modifyHandler.destroy();
			this.modifyHandler = null;
		}
		this.clickStep = 0;

	}
	startDraw() {
		var $this = this;
		this.state = 1;
		this.handler.setInputAction(function(evt) {
			var ray = $this.viewer.camera.getPickRay(evt.position);
			if (!ray) return;
			var cartesian = $this.viewer.scene.globe.pick(ray, $this.viewer.scene);
			if ($this.positions.length == 0) {
				$this.floatPoint = $this.creatPoint(cartesian);
			}
			if ($this.positions.length > 4) { 
				var point = $this.creatPoint(cartesian);
				point.wz = $this.positions.length;
				$this.pointArr.push(point);
				for (var i = 0; i < $this.pointArr.length; i++) {
					$this.pointArr[i].show = false;
				}
				if ($this.floatPoint) { 
					$this.floatPoint.show = false;
					$this.viewer.entities.remove($this.floatPoint);
					$this.floatPoint = null;
				}
				$this.handler.destroy();
				return;
			} else {
				$this.positions.push(cartesian);
				var point = $this.creatPoint(cartesian);
				if ($this.positions.length > 2) {
					point.wz = $this.positions.length - 1; 
				} else {
					point.wz = $this.positions.length; 
				}
				$this.pointArr.push(point);
			}
		}, Cesium.ScreenSpaceEventType.LEFT_CLICK);

		this.handler.setInputAction(function(evt) { 
			if ($this.positions.length < 2) return;
			var ray = $this.viewer.camera.getPickRay(evt.endPosition);
			if (!ray) return;
			var cartesian = $this.viewer.scene.globe.pick(ray, $this.viewer.scene);
			$this.floatPoint.position.setValue(cartesian);
			if ($this.positions.length >= 2) {
				if (!Cesium.defined($this.arrowEntity)) {
					$this.positions.push(cartesian);
					$this.arrowEntity = $this.showArrowOnMap($this.positions);
					$this.arrowEntity.objId = $this.objId;
				} else {
					$this.positions.pop();
					$this.positions.push(cartesian);
				}
			}

		}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

	}
	createByData(data) {
		this.positions = []; 
		this.state = -1; 
		this.floatPoint = null;
		this.pointArr = []; 
		this.selectPoint = null;
		this.clickStep = 0; 
		this.modifyHandler = null;
		var arr = [];
		for (var i = 0; i < data.length; i++) {
			var cart3 = Cesium.Cartesian3.fromDegrees(data[i][0], data[i][1]);
			arr.push(cart3);
		}
		this.positions = arr;
		
		for (var i = 0; i < this.positions.length; i++) {
			var point = this.creatPoint(this.positions[i]);
			point.show = false;
			point.wz = i+1;
			this.pointArr.push(point);
		}
		this.arrowEntity = this.showArrowOnMap(this.positions);
		this.arrowEntity.objId = this.objId;
	}
	startModify() { 
		this.state = 2;
		var $this = this;
		for (var i = 0; i < $this.pointArr.length; i++) {
			$this.pointArr[i].show = true;
		}
		if (!this.modifyHandler) this.modifyHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
		this.modifyHandler.setInputAction(function(evt) { 
			var pick = $this.viewer.scene.pick(evt.position);
			if (Cesium.defined(pick) && pick.id) {
				$this.clickStep++;
				if(!pick.id.objId)
					$this.selectPoint = pick.id;
			} else {
				for (var i = 0; i < $this.pointArr.length; i++) {
					$this.pointArr[i].show = false;
				}
				$this.state = -1;
				$this.modifyHandler.destroy(); 
				$this.modifyHandler = null;
			}
			if ($this.clickStep == 2) {
				$this.clickStep = 0;
				var ray = $this.viewer.camera.getPickRay(evt.position);
				if (!ray) return;
				var cartesian = $this.viewer.scene.globe.pick(ray, $this.viewer.scene);
				if($this.selectPoint){
					 $this.selectPoint.position.setValue(cartesian);
					 $this.selectPoint = null;
				}
				
			};
		}, Cesium.ScreenSpaceEventType.LEFT_CLICK);
		this.modifyHandler.setInputAction(function(evt) { 
			var ray = $this.viewer.camera.getPickRay(evt.endPosition);
			if (!ray) return;
			var cartesian = $this.viewer.scene.globe.pick(ray, $this.viewer.scene);
			if ($this.selectPoint) {
				$this.selectPoint.position.setValue(cartesian);
				$this.positions[$this.selectPoint.wz - 1] = cartesian; 
			} else {
				return;
			}
		}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
	}
	clear() { 
		this.state = 0;
		for (var i = 0; i < this.pointArr.length; i++) {
			if (this.pointArr[i]) this.viewer.entities.remove(this.pointArr[i]);
		}
		if (this.floatPoint) this.viewer.entities.remove(this.floatPoint);
		if (this.arrowEntity) this.viewer.entities.remove(this.arrowEntity);
		this.state = -1;
	}
	getLnglats() { 
		var arr = [];
		for (var i = 0; i < this.positions.length; i++) {
			var item = this.cartesianToLatlng(this.positions[i]);
			arr.push(item);
		}
		return arr;
	}
	getPositions() { 
		return this.positions;
	}
	creatPoint(cartesian) {
		return this.viewer.entities.add({
			position: cartesian,
			billboard: {
				image: this.pointImageUrl,
				verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
				heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
			}
		});
	}
	showArrowOnMap(positions) {
		var $this = this;
		var update = function() {
			
			if (positions.length < 3) {
				return null;
			}
			var lnglatArr = [];
			for (var i = 0; i < positions.length; i++) {
				var lnglat = $this.cartesianToLatlng(positions[i]);
				lnglatArr.push(lnglat)
			}
			var res = xp.algorithm.doubleArrow(lnglatArr);
			var returnData = [];
			var index = JSON.stringify(res.polygonalPoint).indexOf("null");
			if (index == -1) returnData = res.polygonalPoint;
			return returnData;
		}
		let option = {
			polygon: new Cesium.PolygonGraphics({
				hierarchy: new Cesium.CallbackProperty(update, false),
				clampToGround: true,
				show: true,
				fill: true,
				material: $this.fillMaterial
			})
		}
		return this.viewer.entities.add(option);
	}
	cartesianToLatlng(cartesian) {
		var latlng = this.viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian);
		var lat = Cesium.Math.toDegrees(latlng.latitude);
		var lng = Cesium.Math.toDegrees(latlng.longitude);
		return [lng, lat];
	}
}
/**
 * 攻击箭头
 */
const AttackArrow = class {
    constructor(viewer){
        this.type = "AttackArrow";
        this.objId = Number((new Date()).getTime()+ "" +Number(Math.random()*1000).toFixed(0))
        this.viewer = viewer;
        this.pointImageUrl = "../libs/plot/point.png";
        this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
        this.fillMaterial = Cesium.Color.fromCssColorString('#0000FF').withAlpha(0.5);
        this.outlineMaterial = new Cesium.PolylineDashMaterialProperty({
            dashLength: 16,
            color: Cesium.Color.fromCssColorString('#f00').withAlpha(0.7)
        });
        this.positions = []; 
        this.state = -1; 
        this.floatPoint = null;
        this.arrowEntity = null;
        this.pointArr = []; 
        this.selectPoint = null;
        this.clickStep = 0; 
        this.modifyHandler = null;
    }
    disable() {
		this.positions = [];
		if (this.arrowEntity) {
			this.viewer.entities.remove(this.arrowEntity);
			this.arrowEntity = null;
		}
		this.state = -1;
		if (this.handler) {
			this.handler.destroy();
			this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
		}
		if (this.floatPoint) {
			this.viewer.entities.remove(this.floatPoint);
			this.floatPoint = null;
		}
		if (this.selectPoint) {
			this.viewer.entities.remove(this.selectPoint);
			this.selectPoint = null;
		}
		for (var i = 0; i < this.pointArr.length; i++) {
			if (this.pointArr[i]) this.viewer.entities.remove(this.pointArr[i]);
		}
		if (this.modifyHandler) {
			this.modifyHandler.destroy();
			this.modifyHandler = null;
		}
		this.clickStep = 0;

	}
	startDraw() {
		var $this = this;
		this.state = 1;
		this.handler.setInputAction(function(evt) { 
			var ray = $this.viewer.camera.getPickRay(evt.position);
			if (!ray) return;
			var cartesian = $this.viewer.scene.globe.pick(ray, $this.viewer.scene);
			if ($this.positions.length == 0) {
				$this.floatPoint = $this.creatPoint(cartesian);
				$this.floatPoint.wz = -1;
			}
			$this.positions.push(cartesian);
			var point = $this.creatPoint(cartesian);
			if ($this.positions.length > 2) {
				point.wz = $this.positions.length - 1; 
			} else {
				point.wz = $this.positions.length; 
			}
			$this.pointArr.push(point);
		}, Cesium.ScreenSpaceEventType.LEFT_CLICK);
		this.handler.setInputAction(function(evt) {
			if ($this.positions.length < 2) return;
			var ray = $this.viewer.camera.getPickRay(evt.endPosition);
			if (!ray) return;
			var cartesian = $this.viewer.scene.globe.pick(ray, $this.viewer.scene);
			$this.floatPoint.position.setValue(cartesian);
			if ($this.positions.length >= 2) {
				if (!Cesium.defined($this.arrowEntity)) {
					$this.positions.push(cartesian);
					$this.arrowEntity = $this.showArrowOnMap($this.positions);
					$this.arrowEntity.objId = $this.objId;
				} else {
					$this.positions.pop();
					$this.positions.push(cartesian);
				}
			}
		}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
		this.handler.setInputAction(function(evt) { 
			var ray = $this.viewer.camera.getPickRay(evt.position);
			if (!ray) return;
			var cartesian = $this.viewer.scene.globe.pick(ray, $this.viewer.scene);
			for (var i = 0; i < $this.pointArr.length; i++) {
				$this.pointArr[i].show = false;
			}
			$this.floatPoint.show = false;
			$this.viewer.entities.remove($this.floatPoint);
			$this.floatPoint = null;
			var point = $this.creatPoint(cartesian);
			point.show = false;
			point.wz = $this.positions.length;
			$this.pointArr.push(point);
			$this.handler.destroy();
		}, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
	}
	createByData(data) { 
		console.log(data);
		this.positions = []; 
		this.state = -1; 
		this.floatPoint = null;
		this.pointArr = []; 
		this.selectPoint = null;
		this.clickStep = 0; 
		this.modifyHandler = null;
		var arr = [];
		for (var i = 0; i < data.length; i++) {
			var cart3 = Cesium.Cartesian3.fromDegrees(data[i][0], data[i][1]);
			arr.push(cart3);
		}
		this.positions = arr;
		
		for (var i = 0; i < this.positions.length; i++) {
			var point = this.creatPoint(this.positions[i]);
			point.show = false;
			point.wz = i + 1;
			this.pointArr.push(point);
		}
		this.arrowEntity = this.showArrowOnMap(this.positions);
		this.arrowEntity.objId = this.objId;
	}
	startModify() { 
		this.state = 2;
		var $this = this;
		for (var i = 0; i < $this.pointArr.length; i++) {
			$this.pointArr[i].show = true;
		}
		if (!this.modifyHandler) this.modifyHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
		this.modifyHandler.setInputAction(function(evt) { 
			var pick = $this.viewer.scene.pick(evt.position);
			if (Cesium.defined(pick) && pick.id) {
				$this.clickStep++;
				if(!pick.id.objId)
					$this.selectPoint = pick.id;
			} else { 
				for (var i = 0; i < $this.pointArr.length; i++) {
					$this.pointArr[i].show = false;
				}
				if ($this.floatPoint) $this.floatPoint.show = false;
				$this.state = -1;
				$this.modifyHandler.destroy();
				$this.modifyHandler = null;
			}
			if ($this.clickStep == 2) {
				$this.clickStep = 0;
				var ray = $this.viewer.camera.getPickRay(evt.position);
				if (!ray) return;
				var cartesian = $this.viewer.scene.globe.pick(ray, $this.viewer.scene);
				if($this.selectPoint){
					$this.selectPoint.position.setValue(cartesian);
					$this.selectPoint = null;
				}
				
			};
		}, Cesium.ScreenSpaceEventType.LEFT_CLICK);
		this.modifyHandler.setInputAction(function(evt) {
			var ray = $this.viewer.camera.getPickRay(evt.endPosition);
			if (!ray) return;
			var cartesian = $this.viewer.scene.globe.pick(ray, $this.viewer.scene);
			if ($this.selectPoint) {
				$this.selectPoint.position.setValue(cartesian);
				$this.positions[$this.selectPoint.wz - 1] = cartesian; 
			} else {
				return;
			}
		}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
	}
	clear() { 
		this.state = 0;
		for (var i = 0; i < this.pointArr.length; i++) {
			if (this.pointArr[i]) this.viewer.entities.remove(this.pointArr[i]);
		}
		if (this.floatPoint) this.viewer.entities.remove(this.floatPoint);
		if (this.arrowEntity) this.viewer.entities.remove(this.arrowEntity);
		this.state = -1;
	}
	getLnglats() {
		var arr = [];
		for (var i = 0; i < this.positions.length; i++) {
			var item = this.cartesianToLatlng(this.positions[i]);
			arr.push(item);
		}
		return arr;
	}
	getPositions() { 
		return this.positions;
	}
	creatPoint(cartesian) {
		return this.viewer.entities.add({
			position: cartesian,
			billboard: {
				image: this.pointImageUrl,
				verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
				heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
			}
		});
	}
	showArrowOnMap(positions) {
		var $this = this;
		var update = function() {
		
			if (positions.length < 3) {
				return null;
			}
			var lnglatArr = [];
			for (var i = 0; i < positions.length; i++) {
				var lnglat = $this.cartesianToLatlng(positions[i]);
				lnglatArr.push(lnglat)
			}
			var res = xp.algorithm.tailedAttackArrow(lnglatArr);
			var index = JSON.stringify(res.polygonalPoint).indexOf("null");
			var returnData = [];
			if (index == -1) returnData = res.polygonalPoint;
			return returnData;
		}
		let option = {
			polygon: new Cesium.PolygonGraphics({
				hierarchy: new Cesium.CallbackProperty(update, false),
				clampToGround: true,
				show: true,
				fill: true,
				material: $this.fillMaterial
			})
		}
		return this.viewer.entities.add(option);
	}
	cartesianToLatlng(cartesian) {
		var latlng = this.viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian);
		var lat = Cesium.Math.toDegrees(latlng.latitude);
		var lng = Cesium.Math.toDegrees(latlng.longitude);
		return [lng, lat];
	}
}

/**
 * 
 * 直角箭头
 */
const StraightArrow = class {
    constructor(viewer){
        this.type = "StraightArrow";
        this.objId = Number((new Date()).getTime()+ "" +Number(Math.random()*1000).toFixed(0)); //用于区分多个相同箭头时
        this.viewer = viewer;
        this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
        this.pointImageUrl = "../libs/plot/point.png";
        this.fillMaterial = Cesium.Color.fromCssColorString('#0000FF').withAlpha(0.5);
        this.outlineMaterial = new Cesium.PolylineDashMaterialProperty({
            dashLength: 16,
            color: Cesium.Color.fromCssColorString('#f00').withAlpha(0.7)
        });
        this.positions = [];
        this.firstPoint = null;
        this.floatPoint = null;
        this.arrowEntity = null;
        this.state = -1; 
        this.selectPoint = null;
        this.clickStep = 0;
        this.modifyHandler = null;
    }
    disable() {
		this.positions = [];
		if (this.firstPoint) {
			this.viewer.entities.remove(this.firstPoint);
			this.firstPoint = null;
		}
		if (this.floatPoint) {
			this.viewer.entities.remove(this.floatPoint);
			this.floatPoint = null;
		}
		if (this.arrowEntity) {
			this.viewer.entities.remove(this.arrowEntity);
			this.arrowEntity = null;
		}
		this.state = -1;
		if (this.handler) {
			this.handler.destroy();
			this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
		}
		if (this.selectPoint) {
			this.viewer.entities.remove(this.selectPoint);
			this.selectPoint = null;
		}
		if (this.modifyHandler) {
			this.modifyHandler.destroy();
			this.modifyHandler = null;
		}
		this.clickStep = 0;
	}
	startDraw() {
		var $this = this;
		this.state = 1;
		this.handler.setInputAction(function(evt) { 
			var ray = $this.viewer.camera.getPickRay(evt.position);
			if (!ray) return;
			var cartesian = $this.viewer.scene.globe.pick(ray, $this.viewer.scene);
			if ($this.positions.length == 0) {
				$this.firstPoint = $this.creatPoint(cartesian);
				$this.firstPoint.type = "firstPoint";
				$this.floatPoint = $this.creatPoint(cartesian);
				$this.floatPoint.type = "floatPoint";
				$this.positions.push(cartesian);
			}
			if ($this.positions.length == 3) {
				$this.firstPoint.show = false;
				$this.floatPoint.show = false;
				$this.handler.destroy();
				$this.arrowEntity.objId = $this.objId;
				$this.state = -1;
			}
			$this.positions.push(cartesian.clone());
		}, Cesium.ScreenSpaceEventType.LEFT_CLICK);
		this.handler.setInputAction(function(evt) { 
			if ($this.positions.length < 1) return;
			var ray = $this.viewer.camera.getPickRay(evt.endPosition);
			if (!ray) return;
			var cartesian = $this.viewer.scene.globe.pick(ray, $this.viewer.scene);
			$this.floatPoint.position.setValue(cartesian);
			if ($this.positions.length >= 2) {
				if (!Cesium.defined($this.arrowEntity)) {
					$this.positions.push(cartesian);
					$this.arrowEntity = $this.showArrowOnMap($this.positions);

				} else {
					$this.positions.pop();
					$this.positions.push(cartesian);
				}
			}
		}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
	}
	startModify() { 
		this.state = 2;
		this.firstPoint.show = true;
		this.floatPoint.show = true;
		var $this = this;
		this.clickStep = 0;
		if (!this.modifyHandler) this.modifyHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
		this.modifyHandler.setInputAction(function(evt) { 
			var pick = $this.viewer.scene.pick(evt.position);
			if (Cesium.defined(pick) && pick.id) {
				$this.clickStep++;
				if(!pick.id.objId) 
					$this.selectPoint = pick.id;
			} else { 
				$this.modifyHandler.destroy(); 
				$this.modifyHandler = null;
				$this.firstPoint.show = false;
				$this.floatPoint.show = false;
				$this.state = -1;
			}
			if ($this.clickStep == 2) { 
				$this.clickStep = 0;
				$this.clickStep == 0;
				var ray = $this.viewer.camera.getPickRay(evt.position);
				if (!ray) return;
				var cartesian = $this.viewer.scene.globe.pick(ray, $this.viewer.scene);
				if($this.selectPoint){
					$this.selectPoint.position.setValue(cartesian);
					$this.selectPoint = null;
				}
				
			};
		}, Cesium.ScreenSpaceEventType.LEFT_CLICK);
		this.modifyHandler.setInputAction(function(evt) { 
			var ray = $this.viewer.camera.getPickRay(evt.endPosition);
			if (!ray) return;
			var cartesian = $this.viewer.scene.globe.pick(ray, $this.viewer.scene);
			if ($this.selectPoint) {
				$this.selectPoint.position.setValue(cartesian);
				if ($this.selectPoint.type == "firstPoint") {
					$this.positions[1] = cartesian;
				} else {
					$this.positions[2] = cartesian;
				}
			} else {
				return;
			}
		}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
	}
	createByData(data) { 
		this.state = -1;
		this.positions = [];
		var arr = [];
		for (var i = 0; i < data.length; i++) {
			var cart3 = Cesium.Cartesian3.fromDegrees(data[i][0], data[i][1]);
			arr.push(cart3);
		}
		this.positions = arr;
		this.firstPoint = this.creatPoint(this.positions[1]);
		this.firstPoint.type = "firstPoint";
		this.floatPoint = this.creatPoint(this.positions[2]);
		this.floatPoint.type = "floatPoint";
		var $this = this;
		this.arrowEntity = this.showArrowOnMap(this.positions);
		this.firstPoint.show = false;
		this.floatPoint.show = false;
		this.arrowEntity.objId = this.objId;
	}
	clear() { 
		this.state = 0;
		if (this.firstPoint) this.viewer.entities.remove(this.firstPoint);
		if (this.floatPoint) this.viewer.entities.remove(this.floatPoint);
		if (this.arrowEntity) this.viewer.entities.remove(this.arrowEntity);
		this.state = -1;
	}
	getLnglats() {
		var arr = [];
		for (var i = 0; i < this.positions.length; i++) {
			var item = this.cartesianToLatlng(this.positions[i]);
			arr.push(item);
		}
		return arr;
	}
	getPositions() { 
		return this.positions;
	}
	creatPoint(cartesian) {
		return this.viewer.entities.add({
			position: cartesian,
			billboard: {
				image: this.pointImageUrl,
				verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
				heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
			}
		});
	}
	showArrowOnMap(positions) {
		var $this = this;
		var update = function() {
			if (positions.length < 2) {
				return null;
			}
			var p1 = positions[1];
			var p2 = positions[2];
			var firstPoint = $this.cartesianToLatlng(p1);
			var endPoints = $this.cartesianToLatlng(p2);
			var arrow = [];
			var res = xp.algorithm.fineArrow([firstPoint[0], firstPoint[1]], [endPoints[0], endPoints[1]]);
			var index = JSON.stringify(res).indexOf("null");
			if (index == -1) arrow = res;
			return arrow;
		}
		let option = {
			polygon: new Cesium.PolygonGraphics({
				hierarchy: new Cesium.CallbackProperty(update, false),
				clampToGround: true,
				show: true,
				fill: true,
				material: $this.fillMaterial
			})
		}
		return this.viewer.entities.add(option);
	}
	cartesianToLatlng(cartesian) {
		var latlng = this.viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian);
		var lat = Cesium.Math.toDegrees(latlng.latitude);
		var lng = Cesium.Math.toDegrees(latlng.longitude);
		return [lng, lat];
	}
}
/**
 * 
 * 标绘接口
 */
export default class Plot{

    constructor(core){
        
        /**
         * 直角箭头
         */
        this.StraightArrow = StraightArrow;
        /**
         * 攻击箭头
         */
        this.AttackArrow = AttackArrow;
        /**
         * 钳击箭头
         */
        this.PincerArrow = PincerArrow;

        /**
         * 初始化
         */
        this.drawArr = [];
        this.handler = null;
        this.isActivate = true;
        this.viewer = core;
        this.bindEdit();
    }
    //清除上一次
    disable() {
		if (this.isActivate) {
			this.isActivate = false;
			for (var i = 0; i < this.drawArr.length; i++) {
				this.drawArr[i].disable();
			}
			this.drawArr = [];
			if (this.handler) {
				this.handler.destroy();
				this.handler = null;
			}
			this.viewer = null;
		}
	}
	draw(type) {
        let _self = this;
		switch (type) {
			case "straightArrow":
				var straightArrow = new StraightArrow(_self.viewer);
				straightArrow.startDraw();
				this.drawArr.push(straightArrow);
				break;
			case "attackArrow":
				var attackArrow = new AttackArrow(_self.viewer);
				attackArrow.startDraw();
				this.drawArr.push(attackArrow);
				break;
			case "pincerArrow":
				var pincerArrow = new PincerArrow(_self.viewer);
				pincerArrow.startDraw();
				this.drawArr.push(pincerArrow);
			default:
				break;
		}
	}
	saveData() { //保存用户数据
		var jsonData = {
			straightArrowData: [],
			attackArrowData: [],
			pincerArrowData: []
		}
		for (var step = 0; step < this.drawArr.length; step++) {
			var item = this.drawArr[step];
			var positions = item.getLnglats();
			if (item.type == "StraightArrow") {
				jsonData.straightArrowData.push(positions);
			} else if (item.type == "AttackArrow") {
				jsonData.attackArrowData.push(positions);
			} else {
				jsonData.pincerArrowData.push(positions);
			}
		}
		console.log("保存的数据：" + JSON.stringify(jsonData));
	}
	showData(jsonData) { //展示用户保存的数据
        if(!jsonData) return ;
        let _self = this;
		var straightArrowArr = jsonData.straightArrowData;
		var attackArrowArr = jsonData.attackArrowData;
		var pincerArrowArr = jsonData.pincerArrowData;
		//展示直线箭头
		for(var i=0;i<straightArrowArr.length;i++){
			var item = straightArrowArr[i];
			var straightArrow = new StraightArrow(_self.viewer);
			straightArrow.createByData(item);
			this.drawArr.push(straightArrow);
		}
		//展示攻击箭头
		for(var j=0;j<attackArrowArr.length;j++){
			var item = attackArrowArr[j];
			var attackArrow = new AttackArrow(_self.viewer);
			attackArrow.createByData(item);
			this.drawArr.push(attackArrow);
		}
		//展示钳击箭头
		for(var z=0;z<pincerArrowArr.length;z++){
			var item = pincerArrowArr[z];
			var pincerArrow = new PincerArrow(_self.viewer);
			pincerArrow.createByData(item);
			this.drawArr.push(pincerArrow);
		}
		
	}

	bindEdit() {
		var $this = this;
		this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
		this.handler.setInputAction(function(evt) { //单机开始绘制
			var pick = $this.viewer.scene.pick(evt.position);
			//debugger;
			if (Cesium.defined(pick) && pick.id) {
				if ($this.nowArrowObj) {
					if ($this.nowArrowObj.state != -1) {
						console.log("上一步操作未结束，请继续完成上一步！");
						return;
					}
				}
				for (var i = 0; i < $this.drawArr.length; i++) {
					if (pick.id.objId == $this.drawArr[i].objId) {
						$this.nowArrowObj = $this.drawArr[i];
						$this.drawArr[i].startModify();
						break;
					}
				}
			}
		}, Cesium.ScreenSpaceEventType.LEFT_CLICK);
	}
	clearOne() {
		var $this = this;
		this.handler.setInputAction(function(evt) { //单机开始绘制
			var pick = $this.viewer.scene.pick(evt.position);
			if (Cesium.defined(pick) && pick.id) {
				for (var i = 0; i < $this.drawArr.length; i++) {
					if (pick.id.objId == $this.drawArr[i].objId) {
						$this.drawArr[i].clear();
						$this.drawArr.splice(i, 1);
						break;
					}
				}
				$this.handler.destroy();
				$this.bindEdit();
			}
		}, Cesium.ScreenSpaceEventType.LEFT_CLICK);
	}
	clearAll(){
		for (var i = 0; i < this.drawArr.length; i++) {
			this.drawArr[i].clear();
		}
	}
   

}