/***
 * @nanme 卫星扫描
 * @entity 扫描物实体
 * @satellite 卫星实体
 * 
 * @author zhangti
 * @version v1
 * 
 * 未解决问题:
 * 1. 圆锥偏移量
 * 2. 圆锥形动态扫描
 * 3. 部分csml 不太理解
 */

 var cesiumSatellite = null;
 CesiumSatellite = function(){
    cesiumSatellite = this;
 }

 /**
 * 初始化
 * 数据对象
 */
CesiumSatellite.prototype.init = function(param){
    if(null === param || undefined === param)return;
    var t = this;
    for(var key in param){
        t[key] = param[key];
    }
}


/**
 * 创建
 * @type 创建不同的类型
 */
CesiumSatellite.prototype.build = function(){

    try {
        var t = this,_Entity = null;
        if(_Entity === null){
            t.createRaderEntity(15,3,false);
        }
        switch(t.handleType){
            case "":{ break; }
            default :{  t.createSatellite(); }
        }
    } catch (error) {
        console.log("error mannager:" + error);
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
CesiumSatellite.prototype.createSatellite = function(){
    var t = this;
    t.viewer.dataSources.add(Cesium.CzmlDataSource.load(t.sources)).then(function(dataSource) { //czml文件
            t.addEntityAndSatellite(dataSource);
    });
}

/**
 * 绑定位置
 * @entity 实体
 * @satellite 卫星
 */
CesiumSatellite.prototype.addEntityAndSatellite = function(dataSource){
    var viewer = this.viewer,ids = this.ids;timeNum = this.timeNum;
    for(var i in ids){
        var satellite = dataSource.entities.getById(ids[i]);
        var property = new Cesium.SampledPositionProperty();
        var height = [];
        //将提供的秒数添加到提供的日期实例 格式化日期
        for (var ind = 0; ind < timeNum; ind++) { //300 * n 秒数
            //结束时间
            var time = Cesium.JulianDate.addSeconds(viewer.clock.startTime, 300*ind, new Cesium.JulianDate());
            //获取结束时间的位置
            var position = satellite.position.getValue(time); //satellite的属性
            //获取移动运动点
            var cartographic = viewer.scene.globe.ellipsoid.cartesianToCartographic(position);
            var lat = Cesium.Math.toDegrees(cartographic.latitude),
                lng = Cesium.Math.toDegrees(cartographic.longitude),
                hei = cartographic.height/2;
                height.push(cartographic.height);
            //绑定卫星点    
            property.addSample(time, Cesium.Cartesian3.fromDegrees(lng, lat, hei));
        }
        //创建实体
        var entity = new _cesiumTool({viewer:this.viewer}).createEntity({handleType:"cylinder",p:{length: Math.max.apply(null,height),slices:4}});
         //设置插值位置时使用的算法和度数。
         entity.position = property;
         entity.position.setInterpolationOptions({ //设定位置的插值算法
             interpolationDegree: 5,
             interpolationAlgorithm: Cesium.LagrangePolynomialApproximation
         });

}
    
    
       

}
/**
 * 雷达考虑单独做成一个模块
 */
CesiumSatellite.prototype.createRaderEntity = function(_pixelRange,_minimumClusterSize,_enabled){
    
    var cr = new CesiumRadar();
    cr.init({
        viewer : this.viewer,
        pixelRange:_pixelRange,
        minimumClusterSize:_minimumClusterSize,
        enabled:_enabled
    });
    cr.build({
        handleType : "def",
        kml:'../../Apps/SampleData/kml/facilities/facilities.kml'
    })

}




