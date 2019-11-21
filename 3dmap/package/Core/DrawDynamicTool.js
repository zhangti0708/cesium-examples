/*
 * @Descripttion: 
 * @version: 1.0
 * @Author: zhangti
 * @Date: 2019-10-22 11:18:30
 * @LastEditors: sueRimn
 * @LastEditTime: 2019-11-20 09:45:57
 */
/**
 * 动态绘制图形
 * 返回坐标点
 */

export default class DrawDynamicTool{

    constructor(core){
        this.viewer = core;
        this.removeObj = [];
    }
    /**
     * 删除
     */
    remove(){
        if(this.removeObj.length != 0){
            for(let i in this.removeObj){
                this.viewer.entities.remove(this.removeObj[i]);
            }
            this.removeObj = [];
        }
    }
    //画点
    drawPoint(callback){
        try {
            var _this = this;
            //坐标存储
            var positions = [];

            var handler = new Cesium.ScreenSpaceEventHandler(_this.viewer.scene.canvas);
            //单击鼠标左键画点
            handler.setInputAction(function (movement) {
                var cartesian = _this.viewer.scene.camera.pickEllipsoid(movement.position, _this.viewer.scene.globe.ellipsoid);
                positions.push(cartesian);
                _this.removeObj.push(_this.viewer.entities.add({
                    position: cartesian,
                    point: {
                        color: Cesium.Color.RED,
                        pixelSize: 5,
                        outlineColor : Cesium.Color.WHITE,
                        outlineWidth : 1,
                        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
                    }
                }));
            }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
            //单击鼠标右键结束画点
            handler.setInputAction(function (movement) {
                console.log(callback);
                handler.destroy();
                callback(positions);
            }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
        } catch (error) {
            console.log(error);
        }
        
    }
    //画线
    drawLineString(callback){
        var _this = this;
        var PolyLinePrimitive = (function () {
            function _(positions) {
                this.options = {
                    polyline: {
                        show: true,
                        positions: [],
                        material: Cesium.Color.CHARTREUSE,
                        width: 5,
                        clampToGround: true
                    }
                };
                this.positions = positions;
                this._init();
            }

            _.prototype._init = function () {
                var _self = this;
                var _update = function () {
                    return _self.positions;
                };
                //实时更新polyline.positions
                this.options.polyline.positions = new Cesium.CallbackProperty(_update, false);
                _this.removeObj.push(_this.viewer.entities.add(this.options));
            };
            return _;
        })();

        var handler = new Cesium.ScreenSpaceEventHandler(_this.viewer.scene.canvas);
        var positions = [];
        var poly = undefined;
        //鼠标左键单击画点
        handler.setInputAction(function (movement) {
            var cartesian = _this.viewer.scene.camera.pickEllipsoid(movement.position, _this.viewer.scene.globe.ellipsoid);
            if (positions.length == 0) {
                positions.push(cartesian.clone());
            }
            positions.push(cartesian);
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        //鼠标移动
        handler.setInputAction(function (movement) {
            var cartesian = _this.viewer.scene.camera.pickEllipsoid(movement.endPosition, _this.viewer.scene.globe.ellipsoid);
            if (positions.length >= 2) {
                if (!Cesium.defined(poly)) {
                    poly = new PolyLinePrimitive(positions);
                } else {
                        if(cartesian != undefined){
                                positions.pop();
                                cartesian.y += (1 + Math.random());
                                positions.push(cartesian);
                        }
                }
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        //单击鼠标右键结束画线
        handler.setInputAction(function (movement) {
            handler.destroy();
            callback(positions);
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    }
    //画面
    drawPolygon(callback){
        var _this = this;
        var PolygonPrimitive = (function () {
            function _(positions) {
                this.options = {
                    name: '多边形',
                    polygon: {
                        hierarchy: [],
                        perPositionHeight: true,
                        fill:false,
                        outline : true,
                        outlineWidth: 10.0,
                        outlineColor : Cesium.Color.CHARTREUSE,
                        clampToGround: true
                    }
                };
                this.hierarchy = positions;
                this._init();
            }

            _.prototype._init = function () {
                var _self = this;
                var _update = function () {
                    return _self.hierarchy;
                };
                //实时更新polygon.hierarchy
                this.options.polygon.hierarchy = new Cesium.CallbackProperty(_update, false);
                _this.removeObj.push(_this.viewer.entities.add(this.options));
            };
            return _;
        })();

        var handler = new Cesium.ScreenSpaceEventHandler(_this.viewer.scene.canvas);
        var positions = [];
        var poly = undefined;

        //鼠标单击画点
        handler.setInputAction(function (movement) {
            var cartesian = _this.viewer.scene.camera.pickEllipsoid(movement.position, _this.viewer.scene.globe.ellipsoid);
            if (positions.length == 0) {
                positions.push(cartesian.clone());
            }
            positions.push(cartesian);
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        //鼠标移动
        handler.setInputAction(function (movement) {
            var cartesian = _this.viewer.scene.camera.pickEllipsoid(movement.endPosition, _this.viewer.scene.globe.ellipsoid);
            if (positions.length >= 2) {
                if (!Cesium.defined(poly)) {
                    poly = new PolygonPrimitive(positions);
                } else {
                        if(cartesian != undefined){
                                positions.pop();
                                cartesian.y += (1 + Math.random());
                                positions.push(cartesian);
                        }
                }
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        //鼠标右键单击结束绘制
        handler.setInputAction(function (movement) {
            handler.destroy();
            callback(positions);
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    }
    //画圆
    circleDraw(_callBack){
        let _self = this;
        //_self.viewer.scene.globe.depthTestAgainstTerrain = true;
        _self.circle= {
        points:[]
        ,rect:null
        ,entity:null
        ,r:1
        };
        var tempPosition;
        let cartographic1;
        let p;
        let tempLon;
        let tempLat;
        var ShapeEventHandler = new Cesium.ScreenSpaceEventHandler(_self.viewer.scene.canvas);
        //common.handlerList.push(ShapeEventHandler);
        ShapeEventHandler.setInputAction(function(click){
        tempPosition = _self.getPointFromWindowPoint(click.position);
        //选择的点在球面上
        if(tempPosition){
            function callBackPos() {
            const minlon = Cesium.Math.toDegrees(_self.circle.points[0].longitude);
            const minlat = Cesium.Math.toDegrees(_self.circle.points[0].latitude);
            const maxlon = Cesium.Math.toDegrees(_self.circle.points[1].longitude);
            const maxlat = Cesium.Math.toDegrees(_self.circle.points[1].latitude);
            const r = _self.getFlatternDistance(minlat, minlon, maxlat, maxlon);
            if(r){
                return r;
            }
            return 1;
            };
            if(_self.circle.points.length==0) {
                p = click.position;
                cartographic1 = Cesium.Ellipsoid.WGS84.cartesianToCartographic(tempPosition);
                _self.circle.points.push(_self.viewer.scene.globe.ellipsoid.cartesianToCartographic(tempPosition));
                _self.circle.points.push(_self.viewer.scene.globe.ellipsoid.cartesianToCartographic(tempPosition));
                tempLon = Cesium.Math.toDegrees(cartographic1.longitude);
                tempLat = Cesium.Math.toDegrees(cartographic1.latitude);
                _self.circle.entity = _self.viewer.entities.add({
                    position: Cesium.Cartesian3.fromDegrees(tempLon,tempLat),
                    ellipse : {
                        semiMinorAxis : new Cesium.CallbackProperty(callBackPos, false),
                        semiMajorAxis : new Cesium.CallbackProperty(callBackPos, false),
                        fill:false,
                        outline : true,
                        outlineWidth: 10.0,
                        outlineColor : Cesium.Color.CHARTREUSE,
                        height:1
                    }
                });
                _self.removeObj.push( _self.circle.entity);
            }else{
            ShapeEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
            ShapeEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
            var tempCircle = new Cesium.CircleOutlineGeometry({
                center : Cesium.Cartesian3.fromDegrees(tempLon,tempLat),
                radius : callBackPos(),
                granularity : Math.PI / 2
            });
            var geometry = Cesium.CircleOutlineGeometry.createGeometry(tempCircle);
            var float64ArrayPositionsIn = geometry.attributes.position.values;
            var positionsIn = [].slice.call(float64ArrayPositionsIn);
            _callBack(positionsIn);
            }
        }
        },Cesium.ScreenSpaceEventType.LEFT_CLICK);
        ShapeEventHandler.setInputAction(function(movement){
        if(_self.circle.points.length==0){
            return;
        }
        var moveEndPosition = _self.getPointFromWindowPoint(movement.endPosition);
        //选择的点在球面上
        if(moveEndPosition){
            _self.circle.points.pop();
            _self.circle.points.push(_self.viewer.scene.globe.ellipsoid.cartesianToCartographic(moveEndPosition));
        }
        },Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }
    //画矩形
    drawRect(callback){
        let _self = this;
        let pointsArr = [];
        _self.shape= {
            points:[],
            rect:null,
            entity:null
        };
        var tempPosition;
        var handle = new Cesium.ScreenSpaceEventHandler(_self.viewer.scene.canvas);
        //鼠标左键单击画点
        handle.setInputAction(function(click){
            tempPosition = _self.getPointFromWindowPoint(click.position);
            //选择的点在球面上
            if(tempPosition){
                if(_self.shape.points.length==0) {
                    pointsArr.push(tempPosition);
                    _self.shape.points.push(_self.viewer.scene.globe.ellipsoid.cartesianToCartographic(tempPosition));
                    _self.shape.rect=Cesium.Rectangle.fromCartographicArray(_self.shape.points);
                    _self.shape.rect.east+=0.000001;
                    _self.shape.rect.north+=0.000001;
                    _self.shape.entity= _self.viewer.entities.add({
                        rectangle : {
                            coordinates :_self.shape.rect,
                            fill:false,
                            outline : true,
                            outlineWidth: 10.0,
                            outlineColor : Cesium.Color.CHARTREUSE,
                            height:10
                            
                        }
                    });
                    _self.bufferEntity = _self.shape.entity;
                    _self.removeObj.push(_self.shape.entity );
                }
                else{
                    handle.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
                    handle.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
                    callback(pointsArr);
                }
            }
        },Cesium.ScreenSpaceEventType.LEFT_CLICK);
        //鼠标移动
        handle.setInputAction(function(movement){
            if(_self.shape.points.length==0){
                return;
            }
            var moveEndPosition = _self.getPointFromWindowPoint(movement.endPosition);
            //选择的点在球面上
            if(moveEndPosition){
                pointsArr[1] = moveEndPosition;
                _self.shape.points[1]=_self.viewer.scene.globe.ellipsoid.cartesianToCartographic(moveEndPosition);
                _self.shape.rect= Cesium.Rectangle.fromCartographicArray(_self.shape.points);
                if(_self.shape.rect.west==_self.shape.rect.east)
                    _self.shape.rect.east+=0.000001;
                if(_self.shape.rect.south==_self.shape.rect.north)
                    _self.shape.rect.north+=0.000001;
                _self.shape.entity.rectangle.coordinates = _self.shape.rect;
            }
        },Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }
    //清除所有Entity和ImageryLayers
    clearHandle () {
        //移除所有实体Entity
        this.viewer.entities.removeAll();
        //移除cesium加载的ImageryLayer
        for(var i=0; i<this.removeImageryLayers.length; i++){
            this.viewer.imageryLayers.remove(this.removeImageryLayers[i]);
        }
    }
    getPointFromWindowPoint(point){
        if(this.viewer.scene.terrainProvider.constructor.name=="EllipsoidTerrainProvider") {
            return this.viewer.camera.pickEllipsoid(point,this.viewer.scene.globe.ellipsoid);
        } else {
            var ray=this.viewer.scene.camera.getPickRay(point);
            return this.viewer.scene.globe.pick(ray,this.viewer.scene);
        }
    }
    //笛卡尔坐标系转WGS84坐标系
    Cartesian3_to_WGS84(point) {
        var cartesian33 = new Cesium.Cartesian3(point.x, point.y, point.z);
        var cartographic = Cesium.Cartographic.fromCartesian(cartesian33);
        var lat = Cesium.Math.toDegrees(cartographic.latitude);
        var lng = Cesium.Math.toDegrees(cartographic.longitude);
        var alt = cartographic.height;
        return {lat: lat, lng: lng, alt: alt};
    }
    //WGS84坐标系转笛卡尔坐标系
    WGS84_to_Cartesian3 (point) {
        var car33 = Cesium.Cartesian3.fromDegrees(point.lng, point.lat, point.alt);
        var x = car33.x;
        var y = car33.y;
        var z = car33.z;
        return {x: x, y: y, z: z};
    }

    //计算两点间距离
    getFlatternDistance(lat1, lng1, lat2, lng2) {
            var EARTH_RADIUS = 6378137.0;    //单位M
            var PI = Math.PI;

            function getRad(d) {
                return d * PI / 180.0;
            }
            var f = getRad((lat1 + lat2) / 2);
            var g = getRad((lat1 - lat2) / 2);
            var l = getRad((lng1 - lng2) / 2);

            var sg = Math.sin(g);
            var sl = Math.sin(l);
            var sf = Math.sin(f);

            var s, c, w, r, d, h1, h2;
            var a = EARTH_RADIUS;
            var fl = 1 / 298.257;

            sg = sg * sg;
            sl = sl * sl;
            sf = sf * sf;

            s = sg * (1 - sl) + (1 - sf) * sl;
            c = (1 - sg) * (1 - sl) + sf * sl;

            w = Math.atan(Math.sqrt(s / c));
            r = Math.sqrt(s * c) / w;
            d = 2 * w * a;
            h1 = (3 * r - 1) / 2 / c;
            h2 = (3 * r + 1) / 2 / s;

            return d * (1 + fl * (h1 * sf * (1 - sg) - h2 * (1 - sf) * sg));
    }
    
}