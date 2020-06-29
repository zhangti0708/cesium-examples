/*
 * @Descripttion: 
 * @version: 1.0
 * @Author: zhangti
 * @Date: 2019-09-23 14:10:07
 * @LastEditors  : sueRimn
 * @LastEditTime : 2020-01-13 17:46:11
 */
/**
 * dataSources 封装类
 */
import CVTools from './cvTool.js';
export default class dataManager{

    constructor(Core){
        /**
         * 常用数据源
         */
        this.dataManager = Core.dataSources;

        this.geoJsonData = Cesium.GeoJsonDataSource;

        this.czmlData = Cesium.CzmlDataSource;

        this.kmlData = Cesium.KmlDataSource;

        this.customData = Cesium.CustomDataSource;
        /** 
         * tools
        */
        this.Tools = new CVTools();
        /**
         * core
         */
        this.CoreV = Core;

    }
    //删除数据源
    remove(data){
        if(data == undefined){
            return false;
        }
        this.dataManager.remove(data);
    }
    //添加数据源
    add(data){
        if(data == undefined){
            return false;
        }
        this.dataManager.add(data);
    }
    //删除一条
    removeOne(name,dataSource){
        for (var i = 0; i < dataSource.length; i++) {
            if (viewer.dataSource.get(i).name.indexOf(name)!= -1) {
                viewer.dataSource.remove(viewer.dataSources.get(i));
            }
        }
    }
    async create(url){
        return await this.geoJsonData.load(url).then((res) =>{return (res)});
    }
    /**
     * 添加封装的geojson数据
     * @param {*} option 
     */
    createGeoJsonData(option){
        var _self = this;
        let promise = this.geoJsonData.load(option.url);
        promise.then(function (dataSource) {
            try {
                _self.geoJson = dataSource;
                _self.dataManager.add(_self.geoJson);
                var entities = _self.geoJson.entities.values;
                var colorHash = {};
                for (var i = 0; i < entities.length;i++) {
                    var entity = entities[i];
                    entity.addProperty("area");	
                    entity.addProperty("center");				
                    var hierarchy = entity.polygon.hierarchy.getValue();
                    var positions = hierarchy.positions;
                    var center = new Cesium.Cartesian3();
                    for(let i=0;i<positions.length;i++){
                        center = Cesium.Cartesian3.add(positions[i], center, center);
                    }
                    entity.center = Cesium.Cartesian3.divideByScalar(center,positions.length,center);
                    var carts = Cesium.Ellipsoid.WGS84.cartesianArrayToCartographicArray(positions);
                    entity.area = CesiumBuild.PolygonArea(carts);
                    var name = entity.name;
                    var propertiesName = entity.properties.propertyNames;
                    var colorStr;
                    if(propertiesName.includes("color")){
                        colorStr = entity.properties.color.getValue();
                    }
                    var color = colorStr?Cesium.Color.fromCssColorString(colorStr):colorHash[name];
                    if (!color) {
                        // color =Cesium.Color.fromRandom({
                        //     alpha: 1.0
                        // });
                        color=Cesium.Color.WHITE;
                        colorHash[name] = color;
                    }
                    if(_self.Tools.isIncludecChn(name)){
                        entity.label=new Cesium.LabelGraphics({
                                text:name,
                                pixelOffset:{
                                    x:0,y:10
                                },
                                show:true,
                            });
            
                    }
                    entity.polygon.material = color;
                    entity.polygon.heightReference=Cesium.HeightReference.CLAMP_TO_GROUND;
                    entity.polygon.outline = false;
                    entity.polygon.shadows=Cesium.ShadowMode.ENABLED;
                    var height=0;
                    if(propertiesName.includes("height")){
                        height=entity.properties.height;
                    }
                    entity.polygon.extrudedHeight =height>0?height:Cesium.Math.randomBetween(3,15);
                }
            } catch (error) {
                console.log(error);
            }
            
        });
        _self.CoreV.flyTo(promise);
    }



}