/***
 * @nanme 卫星扫描
 * @entity 扫描物实体
 * @satellite 卫星实体
 * 
 * @author zhangti
 * @version v1
 * 
 * 为解决问题:
 * 1. 圆锥偏移量
 * 2. 圆锥形动态扫描
 * 3. 部分csml 不太理解
 */

 var cesiumSatellite = null;
 CesiumSatellite = function(){
    cesiumSatellite = this;
 }

CesiumSatellite.prototype.config = function(param){
    if(null === param || undefined === param)return;
    var t = this;
    for(var key in param){
        t[key] = param[key];
    }
}

CesiumSatellite.prototype.build = function(){
    var t = this,_cylinderEntity = null;
    _cylinderEntity = t.entity;
    if(_cylinderEntity === ""){
        _cylinderEntity = t.createEntity();
    }
    switch(t.handleType){
        case "":{ break; }
        default :{  t.createSatellite(_cylinderEntity); }
    }
}
 /**
     * CZML是一种JSON格式的字符串，用于描述与时间有关的动画场景，
     * CZML包含点、线、地标、模型、和其他的一些图形元素，并指明了这些元素如何随时间而变化。
     * 某种程度上说, Cesium 和 CZML的关系就像 Google Earth 和 KML。
     * 
     * 其中如动图所示，扫描的样式是用cylinder做的，这个后续会再完善成波纹形状；
     * 主要还是运用了sampleproperty，将卫星运动的time和position也绑定到cylinder上，
     * 并且将cylinder的高度修改为卫星的一半；
     * @property 动态物
     * 
    */
CesiumSatellite.prototype.createSatellite = function(_cylinderEntity){
    var property,t = this;;
    t.viewer.dataSources.add(Cesium.CzmlDataSource.load(t.sources)).then(function(dataSource) { //czml文件
        //卫星
        var satellite = dataSource.entities.getById(t.satelliteId); //数据源id
        //移动点
        property = new Cesium.SampledPositionProperty();
        for (var ind = 0; ind < 292; ind++) { //292不清楚什么意思
            //将提供的秒数添加到提供的日期实例 格式化日期
            //结束时间
            var time = Cesium.JulianDate.addSeconds(t.viewer.clock.startTime, 300*ind, new Cesium.JulianDate());
            //获取结束时间的位置
            var position = satellite.position.getValue(time); //satellite的属性
            //获取移动运动点
            var cartographic = viewer.scene.globe.ellipsoid.cartesianToCartographic(position);
            var lat = Cesium.Math.toDegrees(cartographic.latitude),
                lng = Cesium.Math.toDegrees(cartographic.longitude),
                hei = cartographic.height/2;
            //绑定卫星点    
            property.addSample(time, Cesium.Cartesian3.fromDegrees(lng, lat, hei));
        }
        //设置插值位置时使用的算法和度数。
        _cylinderEntity.position = property;
        _cylinderEntity.position.setInterpolationOptions({ //设定位置的插值算法
            interpolationDegree: 5,
            interpolationAlgorithm: Cesium.LagrangePolynomialApproximation
        });
        
    });
  
}

CesiumSatellite.prototype.createEntity = function(param){
    var cylinderEntity = viewer.entities.add({
        cylinder: {
            HeightReference: Cesium.HeightReference.CLAMP_TO_GROUND, //表示相对于地形的位置。
            length: 600000,
            topRadius: 0,
            bottomRadius: 600000 / 4,
            material: Cesium.Color.RED.withAlpha(.4),
            outline: !0,
            numberOfVerticalLines: 0,
            outlineColor: Cesium.Color.RED.withAlpha(.8)
        }
    });

    return cylinderEntity;
}
