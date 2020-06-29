/*
 * @Descripttion: 
 * @version: 1.0
 * @Author: zhangti
 * @Date: 2019-10-09 14:36:31
 * @LastEditors: sueRimn
 * @LastEditTime: 2019-11-26 17:55:02
 */
/**
 * 模型封装
 * 常用模型
 * 模型管理
 */
import config from './config.js';
export default class ModelManager{

    constructor(v){

        this.CoreV = v;

        this.hpRoll = new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(180), 0, 0);
		    
    }

    build(obj){
        switch(obj.type){
            case "":;
            default: this.createDefault(obj);
        }
        return this.option;
    }

    createDefault(obj){
        return this.option = {
                id:obj.id,
                position: obj.position, // 模型位置
                orientation: Cesium.Transforms.headingPitchRollQuaternion( obj.position, this.hpRoll),// 模型方向
                model:{
                    uri: obj.url,// 模型路径
                    minimumPixelSize: obj.minimumPixelSize == undefined?0.1:obj.minimumPixelSize,  // 模型最小刻度
                    maximumSize: obj.maximumSize == undefined?128:obj.maximumSize,  // 模型最大刻度
                    maximumScale : obj.maximumScale == undefined?10:obj.maximumScale,  //设置模型最大放大大小
                    show: obj.show == undefined ? true : obj.show,  // 模型是否可见
                    silhouetteColor:Cesium.Color.WHITE,  // 模型轮廓颜色
                    color: obj.color == undefined ? Cesium.Color.WHITE : obj.color ,   // 模型颜色  ，这里可以设置颜色的变化
                    debugWireframe : false,  // 仅用于调试，显示绘制时的线框
                    debugShowBoundingVolume : false,  // 仅用于调试。显示模型绘制时的边界球。
                    scale:0.1,
                    runAnimations:true  //是否运行模型中的动画效果
                }
        }
    }
    /**
     * 创建飞机
     */
    createAir(position){
       return this.createDefault({id:'air',url:config.APPDIR + '/Apps/SampleData/models/CesiumAir/Cesium_Air.gltf',position:position});
    }
    /**
     * 创建碉堡
     */
    createWoodTower(position){
        return this.createDefault({id:'woodTower',url:config.APPDIR + '/Apps/SampleData/models/WoodTower/Wood_Tower.gltf',position:position});
     }
    /**
     * 创建汽车
     */
    createCar(position){
        return this.createDefault({id:'car',url:config.APPDIR + '/Apps/SampleData/models/car/model.gltf',position:position});
     }
}