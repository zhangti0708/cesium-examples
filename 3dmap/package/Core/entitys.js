/*
 * @Descripttion: 
 * @version: 1.0
 * @Author: zhangti
 * @Date: 2019-09-20 09:32:21
 * @LastEditors: sueRimn
 * @LastEditTime: 2019-11-19 17:57:31
 */
/**
 * entitys 实体类
 * 管理实体模型
 * 创建
 * 销毁
 */
export default class Entitys{
    constructor(core){
        /**
         * 初始化
         */

        /**
         * entitys
         */
        this.entitysAction = core.entities;
        
    }
    add(entity){
        return this.entitysAction.add(entity);
    }
    remove(entity){
        this.entitysAction.remove(entity);
    }
    removeAll(){
        this.entitysAction.removeAll();
    }
    createEntity(){
        return new Cesium.Entity();
    }
    //点
    getPoint(){
        return new Cesium.PointGraphics({
            color: Cesium.Color.RED,
            pixelSize: 5,
            outlineColor : Cesium.Color.WHITE,
            outlineWidth : 1
        });
    }
    //标签
    getLabel(text){
        return  new Cesium.LabelGraphics({ //文字标签
            text: text,
            font: '14px sans-serif',
            fillColor: Cesium.Color.GOLD,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            outlineWidth: 2,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            pixelOffset: new Cesium.Cartesian2(10, -10)
        });
    }
    //广告牌
    getBillboard(img){
        return new Cesium.BillboardGraphics({
            image: img == undefined ? '../img/zb.png' : img,
            width:25,
            height:25
        })
    }
    //路径
    getPath(){
        return new Cesium.PathGraphics({
            resolution : 1,
            //设置航线样式，线条颜色，内发光粗细，航线宽度等
            material : new Cesium.PolylineGlowMaterialProperty({
                glowPower : 0.1,
                color : Cesium.Color.YELLOW
            }),
            width : 30
        })
    }
    //模型
    getModel(e){
        return new Cesium.ModelGraphics({
            uri: e.url,
            scale: 6,
            minimumPixelSize: 64
        })
    }
    //自定义雷达
    getCustomRadar(l,r){
       return {
            position: l,
            orientation: Cesium.Transforms.headingPitchRollQuaternion(l,r),
            rectangularSensor: new Cesium.RectangularSensorGraphics({
                    radius: 380000,
                    xHalfAngle: Cesium.Math.toRadians(50),
                    yHalfAngle: Cesium.Math.toRadians(50),
                    material: new Cesium.Color(0, 1, 1, .4),
                    lineColor: new Cesium.Color(0, 1, 1, 1),
                    showScanPlane: true,
                    scanPlaneColor: new Cesium.Color(0, 1, 1, 1),
                    scanPlaneMode: "vertical",
                    scanPlaneRate: 3,
                    showThroughEllipsoid: !1
                })
        }
    }
      /**
     * 提示信息实体
     * createMsgTip
     * showTip 控制器
     */
    createMsgTip(){
        this._resultTip = this.entitysAction.add({
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
        return this._resultTip;
    }
     /**
     * 提示框
     * @param {*} bShow 
     * @param {*} position 
     * @param {*} message 
     */
    showTip(label,bShow,position,message,effectOptions){
        label.show = bShow;
        if(bShow){
            if(position)
                label.position = position;
            if(message)
                label.label.text =message;
            if(effectOptions){
                for(let key  in effectOptions){
                    if(label.key){
                        label.key=effectOptions[key];
                    }
                }
            }
        }    
    }
}