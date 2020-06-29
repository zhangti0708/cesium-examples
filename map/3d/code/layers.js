/*
 * @Descripttion: 
 * @version: 1.0
 * @Author: zhangti
 * @Date: 2019-09-19 09:10:57
 * @LastEditors: sueRimn
 * @LastEditTime: 2019-11-16 15:57:40
 */
/**
 * @file Layers 图层对象
 * @version 1.0
 * Earth 类
 * 创建图层
 * 管理图层
 * 图层交互
 * */
import Imagery from './imagery.js';
import Terrain from './terrain.js';
export default class Layers{
    
    constructor(core){
         /**
         * versiun
         * @type Number
         */
        this.version = 1.0;
        /**
         * name
         * @type string
         */
        this.name = 'Layers';
        /**
         * zIndex
         * @type Number
         */ 
        this.zIndex = 2;
        /**
         * Imagery
         */
        this.Imagery = new Imagery(core);
        /**
         * Terrain
         */
        this.Terrain = new Terrain(core);

    }
    /**
     * init
     */
    initLayers(){

        
    }

    
    
    
     /**
     * 初始化toJSON
     *  @type function
     */
    toJSON (){
        return jQuery.toJSON(this);
    }
    
}
