/***
 * 剖面分析
 * this.profileAnalyse.js
 */
import Analyser from '../analyser.js';
var _self;
export default class profileAnalyse extends Analyser{
    constructor(core,opt){
      super(core);
      this.profile = {
          arrHB: [],
          arrPoint: [],
          arrLX: [],
          ponits: [],
          distance: 0
      };
      this.myChart = null;
      this.draw(opt.type); //line or polygon
    }
    draw(type){
        var entityPolygon = null,points = null;
        _self = this;
        //淹没分析entity
        function createPoint(worldPosition) {
            var point = _self._viewer.entities.add({
                position: worldPosition,
                point: {
                    pixelSize: 10,
                    color: Cesium.Color.YELLOW,
                    //disableDepthTestDistance: Number.POSITIVE_INFINITY,
                    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
                },
            });
            points = point;
            return point;
        }
        var drawingMode = drawingMode;
        function drawShape(positionData) {
            var shape;
            if (drawingMode === 'line') {
                shape = _self._viewer.entities.add({

                    polyline: {
                        positions: positionData,
                        clampToGround: true,
                        arcType: Cesium.ArcType.RHUMB,
                        material: Cesium.Color.GREEN,
                        width: 5,

                        //zIndex:1
                    }
                    //,show:false
                });
            }
            else if (drawingMode === 'polygon') {
                shape = _self._viewer.entities.add({
                    polygon: {
                        hierarchy: positionData,
                        material: new Cesium.ColorMaterialProperty(Cesium.Color.LIGHTSKYBLUE.withAlpha(0.7))
                    }
                });
            }
            return shape;
        }
        var activeShapePoints = [];
        var activeShape;
        var floatingPoint;
        this.handler.setInputAction(function (event) {
            if (!Cesium.Entity.supportsPolylinesOnTerrain(_self._viewer.scene)) {
                console.log('This browser does not support polylines on terrain.');
                return;
            }
            // 使用_self._viewer.scene.pickPosition` 来代替`_self._viewer.camera.pickEllipsoid` 这样当鼠标掠过terrain能得到正确的坐标
            var earthPosition = _self._viewer.scene.pickPosition(event.position);
            //let earthPosition  = _self.mouseManager.piTerrainToModule(event.position);
            if (Cesium.defined(earthPosition)) {
                if (activeShapePoints.length === 0) {
                    _self.start = earthPosition;
                    floatingPoint = createPoint(earthPosition);
                    activeShapePoints.push(earthPosition);
                    var dynamicPositions = new Cesium.CallbackProperty(function () {
                        return activeShapePoints;
                    }, false);
                    activeShape = drawShape(dynamicPositions);
                }
                //计算距离并且进行叠加
                _self.profile.distance = _self.profile.distance + profileAnalyse.distance(activeShapePoints[activeShapePoints.length - 1], earthPosition);
                activeShapePoints.push(earthPosition);
                createPoint(earthPosition);
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        this.handler.setInputAction(function (event) {
            if (Cesium.defined(floatingPoint)) {
                var newPosition = _self._viewer.scene.pickPosition(event.endPosition);
                //let newPosition  = _self.mouseManager.piTerrainToModule(event.endPosition);
                if (Cesium.defined(newPosition)) {
                    floatingPoint.position.setValue(newPosition);
                    activeShapePoints.pop();
                    activeShapePoints.push(newPosition);
                }
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        function terminateShape() {
            activeShapePoints.pop();
            entityPolygon = drawShape(activeShapePoints);
            _self._viewer.entities.remove(floatingPoint);
            _self._viewer.entities.remove(activeShape);
            entityPolygon = null;
            floatingPoint = undefined;
            activeShape = undefined;
            activeShapePoints = [];
        }
        this.handler.setInputAction(function (event) {
            var length = activeShapePoints.length - 1;
            _self.end = activeShapePoints[length];
            var data = profileAnalyse.profileAnalyse(_self.start, _self.end);
            console.log(data);
            profileAnalyse.setEchartsData(data);
            terminateShape();
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
      }
      //draw end
      //剖面分析
      static profileAnalyse(start, end) {
        var startPoint = Cesium.Cartographic.fromCartesian(start);
        var endPoint = Cesium.Cartographic.fromCartesian(end);
        _self.profile.arrLX.push(0);
        _self.profile.ponits.push(startPoint);
        _self.profile.arrPoint.push(profileAnalyse.getDegrees(startPoint));
        _self.profile.arrHB.push(startPoint.height);
        // 插值100个点，点越多模拟越精确，但是效率会低
        var count = 100;
        for (var i = 1; i < count; i++) {
            var cart = Cesium.Cartesian3.lerp(start, end, i / count, new Cesium.Cartesian3());
            var cartographicCart = Cesium.Cartographic.fromCartesian(cart);
            var disc = profileAnalyse.distance(_self.profile.ponits[i - 1], cartographicCart);               
            _self.profile.distance = _self.profile.distance + disc;
            _self.profile.ponits.push(cartographicCart);
            _self.profile.arrLX.push(_self.profile.arrLX[i - 1] + disc);

            _self.profile.arrPoint.push(profileAnalyse.getDegrees(cart));
            _self.profile.arrHB.push(cartographicCart.height);
        }
        _self.profile.ponits.push(endPoint);
        _self.profile.arrLX.push(_self.profile.arrLX[_self.profile.arrLX.length - 1] + profileAnalyse.distance(_self.profile.ponits[_self.profile.ponits.length-1], endPoint));
        _self.profile.arrPoint.push(profileAnalyse.getDegrees(endPoint));
        _self.profile.arrHB.push(endPoint.height);
        return _self.profile;
    }
    //计算两点间的距离
    static distance(point1, point2) {
        //var point1cartographic = Cesium.Cartographic.fromCartesian(point1);
        //var point2cartographic = Cesium.Cartographic.fromCartesian(point2);
        /**根据经纬度计算出距离**/
        var geodesic = new Cesium.EllipsoidGeodesic();
        geodesic.setEndPoints(point1, point2);
        var s = geodesic.surfaceDistance;
        //返回两点之间的距离
        s = Math.sqrt(Math.pow(s, 2) + Math.pow(point2.height - point1.height, 2));
        return s;
    }
    //世界坐标转换为经纬度
    static getDegrees(cart) {
        var cartographic = _self._viewer.scene.globe.ellipsoid.cartesianToCartographic(cart);
        var lat = Cesium.Math.toDegrees(cartographic.latitude);
        var lng = Cesium.Math.toDegrees(cartographic.longitude);
        var alt = cartographic.height;
        return {x:lng,y:lat,z:alt};
    }
    //经纬度保留两位小数
    static strFormat(str) {
        var strString = str.toString();
        var strs = strString.slice(0, strString.indexOf(".")+3);
        return strs;
    }
    //设置Echart数据
    static setEchartsData(e) {
        if (null != e && null != e.arrPoint) {
            $("#sectionChars").show(),
            null == this.myChart && (this.myChart = echarts.init(document.getElementById("echartsView1"), "dark"));
            console.log(e.arrHB.value);
            var t = e.arrPoint,
                chartData = {
                    grid: {
                        left: 10,
                        right: 10,
                        bottom: 10,
                        containLabel: !0
                    },
                    dataZoom: [{
                        type: "inside",
                        throttle: 50
                    }],
                    tooltip: {
                        trigger: "axis",
                        formatter: function (e) {
                            var a = "";
                            if (0 == e.length) return a;
                            e[0].value;
                            console.log(e);
                            var r = t[e[0].dataIndex];
                            console.log(r);
                            return a += "所在位置&nbsp;" + strFormat(r.x ) + "," + strFormat(r.y ) + "<br />距起点&nbsp;<label>" + haoutil.str.formatLength(e[0].axisValue) + "</label><br />" + e[0].seriesName + "&nbsp;<label style='color:" + e[0].color + ";'>" + haoutil.str.formatLength(e[0].value) + "</label><br />"
                        }
                    },
                    xAxis: [{
                        name: "行程",
                        type: "category",
                        boundaryGap: !1,
                        axisLine: {
                            show: !1
                        },
                        axisLabel: {
                            show: !1
                        },
                        data: e.arrLX
                    }],
                    yAxis: [{
                        type: "value",
                        axisLabel: {
                            rotate: 60,
                            formatter: "{value} 米"
                        }
                    }],
                    series: [{
                        name: "高程值",
                        type: "line",
                        smooth: !0,
                        symbol: "none",
                        sampling: "average",
                        itemStyle: {
                            normal: {
                                color: "rgb(255, 70, 131)"
                            }
                        },
                        areaStyle: {
                            normal: {
                                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                                    offset: 0,
                                    color: "rgb(255, 158, 68)"
                                },
                                {
                                    offset: 1,
                                    color: "rgb(255, 70, 131)"
                                }])
                            }
                        },
                        data: e.arrHB
                    }]
                };
            this.myChart.setOption(chartData)
        }
    }
}


