/*
 * @Descripttion: 
 * @version: 1.0
 * @Author: zhangti
 * @Date: 2019-10-22 11:18:30
 * @LastEditors  : sueRimn
 * @LastEditTime : 2020-01-14 10:53:57
 */
/**
 * 动态绘制图形
 * 返回坐标点
 */
import Entitys from './entitys.js';
import mouseManager from './mouseManager.js';
import config from './config.js';
export default class DrawDynamicTool{

    constructor(core){
        this.viewer = core;
        this.removeObj = [];
        /**
         * 实体
         * 创建绘制提示
         */
        this.entitys = new Entitys(core);
        this.mouseManager = new mouseManager(core);
        this._resultTip = this.entitys.createMsgTip();
        this.handleArr = [];
    }
    /**
     * 删除
     */
    remove(){
        if(this.handleArr.length > 0){
            for(let i in this.handleArr)this.handleArr[i].destroy();
            this.entitys.remove(this._resultTip);
            this._resultTip = null;
            this.handleArr = [];
        }
        if(this.removeObj.length != 0){
            for(let i in this.removeObj){
                this.viewer.entities.remove(this.removeObj[i]);
            }
            this.removeObj = [];
        }
    }
    /**
     * 清除事件
     */
    removeHandle(){
        if(this.handleArr.length > 0){
            for(let i in this.handleArr)this.handleArr[i].destroy();
            this.entitys.remove(this._resultTip);
            this._resultTip = null;
            this.handleArr = [];
        }
    }
    //画点
    drawPoint(callback){
        try {
            var _this = this;
            //坐标存储
            var positions = [];

            var handler = new Cesium.ScreenSpaceEventHandler(_this.viewer.scene.canvas);
             if(!this._resultTip)this._resultTip = this.entitys.createMsgTip();
            this.handleArr.push(handler);
            //单击鼠标左键画点
            handler.setInputAction(function (movement) {
                var cartesian = _this.viewer.scene.camera.pickEllipsoid(movement.position, _this.viewer.scene.globe.ellipsoid);
                positions.push(cartesian);
                let entity = _this.viewer.entities.add({
                    position: cartesian
                });
                let position = _this.mouseManager.worldToLonlat(cartesian);
                console.log(position);
                entity.label = _this.entitys.getLabel('经度:' + position.lon.toFixed(6) + '°\n  纬度' + position.lat.toFixed(6) + '°\n 高度:' + position.alt.toFixed(2) + ' m',new Cesium.Cartesian2(0, -35));
                entity.billboard = _this.entitys.getBillboard(config.STATICDIR +'/image/定位.png');
                _this.removeObj.push(entity);
            }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
            //单击鼠标右键结束画点
            handler.setInputAction(function (movement) {
                _this.removeHandle();
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
         if(!this._resultTip)this._resultTip = this.entitys.createMsgTip();
        this.handleArr.push(handler);
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
                    _this.entitys.showTip(_this._resultTip,true,cartesian,'鼠标右键结束,平板长按结束');
                }
            }else{
                _this.entitys.showTip(_this._resultTip,true,cartesian,'点击绘制');
            }
         
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        //单击鼠标右键结束画线
        handler.setInputAction(function (movement) {
            _this.removeHandle();
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
                        //fill:false,
                        outline : false,
                        outlineWidth: 10.0,
                        material : Cesium.Color.fromCssColorString('#F44336').withAlpha(0.5),
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
                    return new Cesium.PolygonHierarchy(_self.hierarchy);
                };
                //实时更新polygon.hierarchy
                this.options.polygon.hierarchy = new Cesium.CallbackProperty(_update, false);
                _this.removeObj.push(_this.viewer.entities.add(this.options));
            };
            return _;
        })();

        var handler = new Cesium.ScreenSpaceEventHandler(_this.viewer.scene.canvas);
         if(!this._resultTip)this._resultTip = this.entitys.createMsgTip();
        this.handleArr.push(handler);
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
                    _this.entitys.showTip(_this._resultTip,true,cartesian,'鼠标右键结束,平板长按结束');
                }
            }else{
                _this.entitys.showTip(_this._resultTip,true,cartesian,'点击绘制');
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        //鼠标右键单击结束绘制
        handler.setInputAction(function (movement) {
            _this.removeHandle();
            callback(positions);
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    }
    //画圆
    circleDraw(_callBack){
        let _self = this;
        //_self.viewer.scene.globe.depthTestAgainstTerrain = true;
        //if(!_self.circle.entity)_self.entitys.remove(_self.circle.entity);
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
        var handle = new Cesium.ScreenSpaceEventHandler(_self.viewer.scene.canvas);
        if(!this._resultTip)this._resultTip = this.entitys.createMsgTip();
        this.handleArr.push(handle);
        //common.handlerList.push(ShapeEventHandler);
        handle.setInputAction(function(click){
            tempPosition = _self.getPointFromWindowPoint(click.position);
            //选择的点在球面上
            if(tempPosition){
                function callBackPos() {
                    if(_self.circle.points.length == 0 )return;
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
                    if(!tempPosition)return false;
                    _self.circle.points.push(_self.viewer.scene.globe.ellipsoid.cartesianToCartographic(tempPosition));
                    _self.circle.points.push(_self.viewer.scene.globe.ellipsoid.cartesianToCartographic(tempPosition));
                    tempLon = Cesium.Math.toDegrees(cartographic1.longitude);
                    tempLat = Cesium.Math.toDegrees(cartographic1.latitude);
                    _self.circle.entity = _self.viewer.entities.add({
                        position: Cesium.Cartesian3.fromDegrees(tempLon,tempLat),
                        ellipse : {
                            semiMinorAxis : new Cesium.CallbackProperty(callBackPos, false),
                            semiMajorAxis : new Cesium.CallbackProperty(callBackPos, false),
                            //fill:false,
                            outline : false,
                            outlineWidth: 10.0,
                            outlineColor : Cesium.Color.CHARTREUSE,
                            material : Cesium.Color.fromCssColorString('#F44336').withAlpha(0.5),
                            height:1
                        }
                    });
                    _self.removeObj.push(_self.circle.entity);
                }else{
                    var tempCircle = new Cesium.CircleOutlineGeometry({
                        center : Cesium.Cartesian3.fromDegrees(tempLon,tempLat),
                        radius : callBackPos(),
                        granularity : Math.PI / 2
                    });
                    var geometry = Cesium.CircleOutlineGeometry.createGeometry(tempCircle);
                    var float64ArrayPositionsIn = geometry.attributes.position.values;
                    var positionsIn = [].slice.call(float64ArrayPositionsIn);
                    _self.removeHandle();
                    //画出半径
                    _self.removeObj.push(_self.entitys.createPoint(Cesium.Cartesian3.fromDegrees(tempLon,tempLat),'半径 :' +  parseFloat(callBackPos()).toFixed(2)));
                    _callBack(positionsIn,[tempLon,tempLat],callBackPos());
                }
            }
            },Cesium.ScreenSpaceEventType.LEFT_CLICK);
            handle.setInputAction(function(movement){
                var moveEndPosition = _self.getPointFromWindowPoint(movement.endPosition);
                if(_self.circle.points.length==0){
                    _self.entitys.showTip(_self._resultTip,true,moveEndPosition,'点击地图');
                    return false;
                }
                _self.entitys.showTip(_self._resultTip,true,moveEndPosition,'再次点击结束');
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
        if(!this._resultTip)if(!this._resultTip)this._resultTip = this.entitys.createMsgTip();
        this.handleArr.push(handle);
        //鼠标左键单击画点
        handle.setInputAction(function(click){
            tempPosition = _self.getPointFromWindowPoint(click.position);
            //选择的点在球面上
            if(tempPosition){
                if(_self.shape.points.length==0) {
                    pointsArr.push(tempPosition);
                    let cartesian = _self.viewer.scene.globe.ellipsoid.cartesianToCartographic(tempPosition);
                    _self.shape.points.push(cartesian);
                    _self.shape.rect=Cesium.Rectangle.fromCartographicArray(_self.shape.points);
                    _self.shape.rect.east+=0.000001;
                    _self.shape.rect.north+=0.000001;
                    _self.shape.entity= _self.viewer.entities.add({
                        rectangle : {
                            coordinates :_self.shape.rect,
                            //fill:false,
                            outline : false,
                            outlineWidth: 10.0,
                            outlineColor : Cesium.Color.CHARTREUSE,
                            material : Cesium.Color.fromCssColorString('#F44336').withAlpha(0.5),
                            height:10
                            
                        }
                    });
                    _self.bufferEntity = _self.shape.entity;
                    _self.removeObj.push(_self.shape.entity );
                }
                else{
                    _self.removeHandle();
                    callback(pointsArr);
                }
            }
        },Cesium.ScreenSpaceEventType.LEFT_CLICK);
        //鼠标移动
        handle.setInputAction(function(movement){
            if(!movement.endPosition)return false;
            let moveEndPosition = _self.getPointFromWindowPoint(movement.endPosition);
            if(_self.shape.points.length==0){
                _self.entitys.showTip(_self._resultTip,true,moveEndPosition,'点击绘制');
                return;
            }
            //选择的点在球面上
            if(moveEndPosition){
                pointsArr[1] = moveEndPosition;
                let cartesian = _self.viewer.scene.globe.ellipsoid.cartesianToCartographic(moveEndPosition);
                _self.shape.points[1]=cartesian;
                _self.shape.rect= Cesium.Rectangle.fromCartographicArray(_self.shape.points);
                if(_self.shape.rect.west==_self.shape.rect.east)
                    _self.shape.rect.east+=0.000001;
                if(_self.shape.rect.south==_self.shape.rect.north)
                    _self.shape.rect.north+=0.000001;
                _self.shape.entity.rectangle.coordinates = _self.shape.rect;
                _self.entitys.showTip(_self._resultTip,true,moveEndPosition,'再次点击结束');
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