/*
 * @Descripttion: 
 * @version: 
 * @Author: sueRimn
 * @Date: 2019-09-19 09:10:57
 * @LastEditors  : sueRimn
 * @LastEditTime : 2020-01-13 14:42:36
 */
/**
 * 相机封装
 * 视图封装
 */

export default class Camera{

    constructor(core){
        /**
         * 视图
         */
        this.v = core; 
        /**
         * 相机  
         */
        this.c = core.camera;       
    }
    /**
     * 相机位置
     * @param {*} destination 
     * 切换 1
     */
    flyTo(destination){
        this.c.flyTo({
            destination : destination,
            orientation: {
                heading : Cesium.Math.toRadians(20.0), // 方向
                pitch : Cesium.Math.toRadians(-90.0),// 倾斜角度
                roll : 0
            },
            pitchAdjustHeight: -90, // 如果摄像机飞越高于该值，则调整俯仰俯仰的俯仰角度，并将地球保持在视口中。
            maximumHeight:5000, // 相机最大飞行高度
            flyOverLongitude: 100, // 如果到达目的地有2种方式，设置具体值后会强制选择方向飞过这个经度
        })
    }
    flyTo2(destination){
        this.c.flyTo({
            destination: destination,
            orientation: {
                heading : Cesium.Math.toRadians(360.00), // 方向
                pitch : Cesium.Math.toRadians(-90.00),// 倾斜角度
                roll : Cesium.Math.toRadians(0.00)
            }
        });
    }
    toView(destination,orientation){
        this.c.setView({
            destination:destination,
            orientation:orientation == undefined ?  {
                heading : Cesium.Math.toRadians(360.00), // 方向
                pitch : Cesium.Math.toRadians(-90.00),// 倾斜角度
                roll : Cesium.Math.toRadians(0.00)
            } : orientation
        });
    }
    /**
     * 视图切换
     * @param {*} entity 
     * 顶部视图
     */
    topView(entity){
        viewer.trackedEntity = undefined;
        viewer.zoomTo(entity, new Cesium.HeadingPitchRange(0, Cesium.Math.toRadians(-90)));
    }
     /**
     * 视图切换
     * @param {*} entity 
     * 侧面视图
     */
    sideView(entity){
        this.v.trackedEntity = undefined;
        this.v.zoomTo(entity, new Cesium.HeadingPitchRange(Cesium.Math.toRadians(-90), Cesium.Math.toRadians(-15), 10000));
    }
     /**
     * 视图切换
     * @param {*} entity 
     * 跟随视图
     */
    aircraftView(entity){
        this.v.trackedEntity = entity;
    }
    /**
     * 定位到要素
     * @param {*} data 
     */
    zoomTo(data){
        this.v.zoomTo(data, new Cesium.HeadingPitchRange(0.5, -0.2,data.boundingSphere.radius * 1.0));
    }
    /**
     * toHome
     * 默认home
     */
    toHome(){
        this.c.setView({
            destination:Cesium.Cartesian3.fromDegrees(117.191166, 34.289749, 1000)
        });
    }
   

 }

