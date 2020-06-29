/*
 * @Descripttion: 
 * @version: 1.0
 * @Author: zhangti
 * @Date: 2019-09-19 17:44:53
 * @LastEditors: sueRimn
 * @LastEditTime: 2019-11-16 16:02:37
 */

 export default class Imagery{
   

    constructor(core){
        /**
         * imageryLayers 实体
         */
        this.imageryLayers = core.scene.imageryLayers;

        this.imageryObj = null;

         /**
         * 数值属性
         */
        this.N1 = 0.1;

        this.N3 = 0.3;

        this.N5 = 0.5;

        this.N8 = 0.8;

        this.N10 = 1.0;
        
        this.N15 = 1.5;

        this.N20 = 2.0;
    }
    /**
     * build 构建
     * @param {*} imagery 
     */

    build(node){
        
        switch(node.type){//拓展接口
            case 'create': this.imageryObj = this.createImagery(node.child);break;
            default: this.imageryObj = this.addImageryLayer(node.imagery); break;
        }

        return  this.imageryObj;
    }
    /**
     * 创建imagery
     * 需要后面拓展
     * 创建接口
     */  
    createImagery(child){
        for(let c in child){
            imagery = {
                url:child[c].url
            } 
        }
    }
    /**
     * 添加imageryLayers
     */
    addImageryLayer(imagery){
        return this.imageryLayers.addImageryProvider(imagery);
    }
    /**
     * remove imageryLayers
     */
    remove(){
        this.imageryLayers.remove(imagery);
    }

    /** 
     * 
     * removeAll imageryLayers
    */
    removeAll(){
        this.imageryLayers.removeAll();
    }
    /**
     * 集成的样式
     * imagery style
     */
    imageryStyle(imagery){
        imagery.alpha = this.N3;
		imagery.brightness = this.N20;
        
    }
    /*
     * 集成其他样式
     */


 }