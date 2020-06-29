/*
 * @Descripttion: 
 * @version: 1.0
 * @Author: zhangti
 * @Date: 2019-10-25 11:25:10
 * @LastEditors: sueRimn
 * @LastEditTime: 2019-11-22 15:10:37
 */
/**
 * 可视域分析
 * 简版
 */
import Analyser from '../analyser.js';
import Coordinate from '../Coordinate.js';
export default class Viewshed extends Analyser{

    constructor(core,opt) {
        super(core);
        //坐标辅助
        this.Coordinate = new Coordinate(this._viewer);
        this.pointEntities = [];
        this.positions = [];
		this._resultTip = this._viewer.entities.add({
			id: Cesium.createGuid(),
			label : {
				fillColor:Cesium.Color.YELLOW,
				showBackground : true,
				font : '14px monospace',
				horizontalOrigin : Cesium.HorizontalOrigin.LEFT,
				verticalOrigin : Cesium.VerticalOrigin.BOTTOM,
				pixelOffset : new Cesium.Cartesian2(0, -10)
			}
        });
        this.action();
    }
    action(){
        let _self = this;
		_self.handler.setInputAction(function (e) {//第一次点击
            if(_self.Tools.nullBool(e.position)){
                return false;
			}
            let cartesian = _self.mouseManager.piTerrainToModule(e.position);
            if(!cartesian){
                return false;
            }
            if(_self.positions.length == 0){ // 开始
                _self.positions.push(cartesian.clone());
                _self.init(_self.positions); //添加点
            }
            if(_self.positions.length == 2){
                _self.handler.destroy(); //结束
                _self.entitys.remove(_self._resultTip);
            }
            _self.positions.push(cartesian.clone());
        },Cesium.ScreenSpaceEventType.LEFT_CLICK);
        /**
         * 移动
         */
        _self.handler.setInputAction(function (e) {
            if(_self.Tools.nullBool(e.endPosition)){
                 return false;
			}
            let cartesian = _self.mouseManager.screenToWorld(e.endPosition);
            if(!cartesian){
                return false;
            }
            if(_self.positions.length == 0){ // 开始
                _self.showTip(_self._resultTip,true,cartesian,"点击开始视域分析");
            }
            if(_self.positions.length == 2){
                _self.positions.pop();
                _self.positions.push(cartesian.clone());
                _self.clearDraw(); //清除上一次的
                _self.create(_self.positions); //绘制当前
                _self.showTip(_self._resultTip,true,cartesian,"点击结束视域分析");
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }
    create(pointArr) {
        if(pointArr.length === 1){
            this.pointEntities.push(this.entitys.drawPoint(pointArr[0], 10, Cesium.Color.AQUAMARINE))
        }
        else if(pointArr.length === 2){
            this.pointEntities.push(this.entitys.drawPoint(pointArr[0], 10, Cesium.Color.AQUAMARINE));
            this.pointEntities.push(this.entitys.drawPoint(pointArr[1], 10, Cesium.Color.AQUAMARINE));
            this.createViewshedMap(pointArr[0], pointArr[1]);
        }

    }

    exit() {
        //clear point arr
        this.pointEntities.forEach(item => {
            this._viewer.entities.remove(item);
        });
        this.pointEntities = [];
        //stop shadowMap
        // PopCity.viewer.scene.shadowMap.enabled = false;
        //clear primitive
        if (this.vishedfrustum) {
            this._viewer.scene.primitives.remove(this.vishedfrustum);
            this.vishedfrustum = false;
        }
        this._viewer.scene.primitives._primitives.forEach((item, index) => {
            if (item.name === 'VIEWSHEDPRIMITIVE') {
                this._viewer.scene.primitives._primitives.splice(index, 1);
            }
        });
    }

    createViewshedMap(start, end) {
        var scene = this._viewer.scene;
        var spotLightCamera = new Cesium.Camera(scene);
        spotLightCamera.position = start;
        spotLightCamera.direction = this.calculateDirection(start, end);
        spotLightCamera.up = Cesium.Cartesian3.clone(this._viewer.camera.up);
        spotLightCamera.frustum.fov = Cesium.Math.PI_OVER_THREE;
        spotLightCamera.frustum.near = 0.1;
        spotLightCamera.frustum.far = Cesium.Cartesian3.distance(start, end);

        //绘制视锥体
        this.drawFrustum(start, end, spotLightCamera.frustum);

        var viewshedOptions = {
            context: scene.context,
            lightCamera: spotLightCamera,
            cascadesEnabled: false,
            softShadows: true,
            viewshed: true
        };

        var viewshed = new Cesium.ShadowMap(viewshedOptions);
        viewshed.enabled = true;
        viewshed.size = 1024;
        const ViewshedPrimitive = function(shadowMap) {
            this.shadowMap = shadowMap;
            this.name = 'VIEWSHEDPRIMITIVE';
        };

        ViewshedPrimitive.prototype.update = function(frameState) {
            frameState.shadowMaps.push(this.shadowMap);
        };

        scene.primitives.add(new ViewshedPrimitive(viewshed));
    }

    //计算方向
    calculateDirection(p1, p2) {
        return Cesium.Cartesian3.normalize(
            Cesium.Cartesian3.subtract(p2, p1, new Cesium.Cartesian3()),
            new Cesium.Cartesian3()
        );
    }

    drawFrustum(position1, position2, frustum) {
        var orientation = this.calculateorigntation(position1, position2);
        var primitive = new Cesium.Primitive({
            geometryInstances: new Cesium.GeometryInstance({
                geometry: new Cesium.FrustumOutlineGeometry({
                    frustum: frustum,
                    origin: position1,
                    orientation: orientation
                }),
                attributes: {
                    color: Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(1.0, 1.0, 0.0, 1.0))
                }
            }),
            appearance: new Cesium.PerInstanceColorAppearance({
                flat: true
            })
        });

        this._viewer.scene.primitives.add(primitive);

        this.vishedfrustum = primitive;
    }

    calculateorigntation(p1, p2) {
        var co1 = this.Coordinate.cartesian2lonlat(p1);
        var co2 = this.Coordinate.cartesian2lonlat(p2);

        var width = this.Coordinate.catchDistancefromCartographic2D(
            co1.longitude,
            co1.latitude,
            co2.longitude,
            co1.latitude
        );
        var length = this.Coordinate.catchDistancefromCartographic2D(
            co1.longitude,
            co1.latitude,
            co1.longitude,
            co2.latitude
        );
        var height = co1.height - co2.height;
        var distance = this.Coordinate.catchDistancefromCartographic2D(
            co1.longitude,
            co1.latitude,
            co2.longitude,
            co2.latitude
        );

        var angle = Math.atan(width / length);
        var tilt = Math.atan(height / distance);

        if (co1.latitude > co2.latitude) {
            angle = Math.PI - angle;
        }
        if (co1.longitude > co2.longitude) {
            angle = -angle;
        }

        var heading = angle;
        var pitch = 0;
        var roll = -Math.PI / 2 - tilt;
        var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
        var orientation = Cesium.Transforms.headingPitchRollQuaternion(p1, hpr);

        return orientation;
    }

    clearDraw() {
        //清除点
        if (this.pointEntities && this.pointEntities.length > 0) {
            for (var i = 0; i < this.pointEntities.length ; i++) {
                this._viewer.entities.remove(this.pointEntities[i]);
                // pointArr.splice(i,1);
            }
        }
        //清除视锥
        if (this.vishedfrustum) {
            this._viewer.scene.primitives.remove(this.vishedfrustum);
        }
        //清除阴影
        this._viewer.scene.primitives._primitives.forEach((item, index) => {
            if (item.name === 'VIEWSHEDPRIMITIVE') {
                this._viewer.scene.primitives._primitives.splice(index, 1);
            }
        });
    }
}