/**
 * 飞机纹理流动图
 * 
 * @author zhangti
 * @version v1
 * 
 */

var cesiumFlyPath = null;

CesiumFlyPath = function (){

    cesiumFlyPath = this;
    _PolylineTrailLinkMaterialProperty = null;
}

CesiumFlyPath.prototype.init = function (param){
    if(null === param || undefined === param)return;
    var t = this;
    for(var key in param){
        t[key] = param[key];
    }

    this.config();
}


CesiumFlyPath.prototype.config = function (){
    var cesiumFlyPath = this;
    //绘制位置在地形上
    cesiumFlyPath.viewer.scene.globe.depthTestAgainstTerrain = true;
    //取消双击事件
    cesiumFlyPath.viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
     //定义流动纹理对象
     Cesium.PolylineTrailLinkMaterialProperty = PolylineTrailLinkMaterialProperty;
     Cesium.Material.PolylineTrailLinkType = 'PolylineTrailLink';
     Cesium.Material.PolylineTrailLinkImage = "../data/images/colors1.png";
      //着色器
     Cesium.Material.PolylineTrailLinkSource = "czm_material czm_getMaterial(czm_materialInput materialInput)\n\
                                                   {\n\
                                                        czm_material material = czm_getDefaultMaterial(materialInput);\n\
                                                        vec2 st = materialInput.st;\n\
                                                        vec4 colorImage = texture2D(image, vec2(fract(st.s - time), st.t));\n\
                                                        material.alpha = colorImage.a * color.a;\n\
                                                        material.diffuse = (colorImage.rgb+color.rgb)/2.0;\n\
                                                        return material;\n\
                                                    }";

     //实例化流动纹理
     cesiumFlyPath._PolylineTrailLinkMaterialProperty  = new Cesium.PolylineTrailLinkMaterialProperty(cesiumFlyPath.color, cesiumFlyPath.duration);
     Cesium.Material._materialCache.addMaterial(Cesium.Material.PolylineTrailLinkType, {
        fabric: {
            type: Cesium.Material.PolylineTrailLinkType,
            uniforms: {
                color: new Cesium.Color(1.0, 0.0, 0.0, 0.5),
                image: Cesium.Material.PolylineTrailLinkImage,
                time: 0
            },
            source: Cesium.Material.PolylineTrailLinkSource
        },
        translucent: function (material) {
            return true;
        }
    });

}

CesiumFlyPath.prototype.parabolaEquation = function (options, resultOut){

     //方程 y=-(4h/L^2)*x^2+h h:顶点高度 L：横纵间距较大者
     var h = options.height && options.height > 5000 ? options.height : 5000;
     var L = Math.abs(options.pt1.lon - options.pt2.lon) > Math.abs(options.pt1.lat - options.pt2.lat) ? Math.abs(options.pt1.lon - options.pt2.lon) : Math.abs(options.pt1.lat - options.pt2.lat);
     var num = options.num && options.num > 50 ? options.num : 50;
     var result = [];
     var dlt = L / num;
     if (Math.abs(options.pt1.lon - options.pt2.lon) > Math.abs(options.pt1.lat - options.pt2.lat)) {//以lon为基准
         var delLat = (options.pt2.lat - options.pt1.lat) / num;
         if (options.pt1.lon - options.pt2.lon > 0) {
             dlt = -dlt;
         }
         for (var i = 0; i < num; i++) {
             var tempH = h - Math.pow((-0.5 * L + Math.abs(dlt) * i), 2) * 4 * h / Math.pow(L, 2);
             var lon = options.pt1.lon + dlt * i;
             var lat = options.pt1.lat + delLat * i;
             result.push([lon, lat, tempH]);
         }
     } else {//以lat为基准
         var delLon = (options.pt2.lon - options.pt1.lon) / num;
         if (options.pt1.lat - options.pt2.lat > 0) {
             dlt = -dlt;
         }
         for (var i = 0; i < num; i++) {
             var tempH = h - Math.pow((-0.5 * L + Math.abs(dlt) * i), 2) * 4 * h / Math.pow(L, 2);
             var lon = options.pt1.lon + delLon * i;
             var lat = options.pt1.lat + dlt * i;
             result.push([lon, lat, tempH]);
         }
     }
     if (resultOut != undefined) {
         resultOut = result;
     }
     return result;


}
//默认
CesiumFlyPath.prototype.drawDefault = function (data){
    var _cesiumFlyPath = this,center = data.center,lon = center.lon
    ,lat = center.lat,zoom = data.zoom,cities = data.cities,v = data.v;
    //设置homebutton的位置
    Cesium.Camera.DEFAULT_VIEW_RECTANGLE =
    Cesium.Rectangle.fromDegrees(lon - 1, lat - 1, lon + 1, lat + 1); 
    //设置初始位置
    _cesiumFlyPath.viewer.camera.setView({
     destination: Cesium.Cartesian3.fromDegrees(lon, lat,zoom)
    });
    //生成流动纹理
    for (var j = 0; j < cities.length; j++) {
        var points = cesiumFlyPath.parabolaEquation({ pt1: center, pt2: cities[j], height: _cesiumFlyPath.height, num: 100 });
        var pointArr = [];
        for (var i = 0; i < points.length; i++) {
            pointArr.push(points[i][0],points[i][1],points[i][2]);
        }
        _cesiumFlyPath.viewer.entities.add({
            name: 'PolylineTrailLink' + j,
            polyline: {
                positions: Cesium.Cartesian3.fromDegreesArrayHeights(pointArr),
                width: 2,
                //流动纹理
                material: cesiumFlyPath._PolylineTrailLinkMaterialProperty
            }
        });
    }
    //原点
    _cesiumFlyPath.viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(lon, lat, 1),
        point: {
            pixelSize: 6,
            color: v.c
        }
    });
    //目标点
    for (var i = 0; i < cities.length; i++) {
        _cesiumFlyPath.viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(cities[i].lon, cities[i].lat, 1),
            point: {
                pixelSize: 6,
                color: v.c2
            }
        });
    }

}

CesiumFlyPath.prototype.build = function (param){
    var t = this;
    switch(param.handleType){
        case "default":{ data = t.drawDefault(param);break; }
    }
}

CesiumFlyPath.prototype.clear = function (){
    
    this.viewer.entities.removeAll();
}


/*
 流纹纹理线
 color 颜色
 duration 持续时间 毫秒
*/

var PolylineTrailLinkMaterialProperty = null;
PolylineTrailLinkMaterialProperty = function (color, duration) {
    this._definitionChanged = new Cesium.Event();
    this._color = undefined;
    this._colorSubscription = undefined;
    this.color = color;
    this.duration = duration;
    this._time = (new Date()).getTime();
}
//在cesium中 定义 PolylineTrailLinkMaterialProperty
Cesium.defineProperties(PolylineTrailLinkMaterialProperty.prototype, {
    isConstant: {
        get: function () {
            return false;
        }
    },
    definitionChanged: {
        get: function () {
            return this._definitionChanged;
        }
    },
    color: Cesium.createPropertyDescriptor('color')
});
PolylineTrailLinkMaterialProperty.prototype.getType = function (time) {
    return 'PolylineTrailLink';
}
PolylineTrailLinkMaterialProperty.prototype.getValue = function (time, result) {
    if (!Cesium.defined(result)) {
        result = {};
    }
    result.color = Cesium.Property.getValueOrClonedDefault(this._color, time, Cesium.Color.WHITE, result.color);
    result.image = Cesium.Material.PolylineTrailLinkImage;
    result.time = (((new Date()).getTime() - this._time) % this.duration) / this.duration;
    return result;
}
PolylineTrailLinkMaterialProperty.prototype.equals = function (other) {
    return this === other ||
        (other instanceof PolylineTrailLinkMaterialProperty &&
            Property.equals(this._color, other._color))
}