/*
 * @Descripttion: 
 * @version: 1.0
 * @Author: zhangti
 * @Date: 2019-09-19 09:10:57
 * @LastEditors: sueRimn
 * @LastEditTime: 2019-11-16 15:57:13
 */
/**
 * Earth 类
 * 创建地球
 * 管理原生api
 * 加载场景
 * */

import csm from './csm.js';
import {TAG} from './tag.js';
import Layers from './layers.js';
import CVTools from './cvTool.js';
import Errors from './errors.js';
export default class Earth {
    
    /**
     * 初始化
     * @param {*} Dom 
     * @param {*} Option 
     */
    constructor(Dom,Option){
         /**
         * versiun
         * @type Number
         */
        this.version = 1.0;
        /**
         * name
         * @type string
         */
        this.name = 'CVEarth';
        /**
         * zIndex
         * @type Number
         */ 
        this.zIndex = 1;

        /** 
         * tools
        */
       this.Tools = new CVTools();
        /**
         * 生成earth对象
         */
        this.core = this.initCesium(Dom,Option);
         /***
         * csm
         * cesium 原型
         * @type csm
         */
        this.csm = new csm(this.core);
        /**
         * sceneTree
         * @type obj
         */
        //sceneTree = new CV.sceneTree(this.earth);
        /**
         * cameraViewManager 相机视角管理类
         *  @type obj
         */
        this.cameraViewManager = undefined;
        /**
         * 创建图层管理类
         */
        this.layerManager = new Layers(this.core);
    }
    
     /**
     * 初始化toJSON
     *  @type function
     */
    toJSON (){
       
    }
     /**
     * 初始化cesium
     * @type function
     * @param option
     */
    initCesium(dom,option){
        let _self = this;
        if(_self.Tools.nullBool(option)){
            //用户没有传入 option 默认传入 必要的
            option = {
                imageryProvider:TAG.BASELAYER.GOOGLEIMAGERY(),
                skyBox : TAG.SKYBOX.customStyle(),
                infoBox: true,
                sceneModePicker: true,
               // terrainProvider:createArcGisElevation3DTerrainProvider(Cesium)
            }
        }
        if(_self.Tools.strBool(dom)){
            return new Errors('DOM 没有定义');
        }
        //初始化cesium 生成 viewer
       return new Cesium.Viewer(dom, _self.buildOption(option));
    }
    /**
     * 
     * @param {*} option 
     */
    /**
     * 没有的都默认为 false
     * @param {*} option 
     */
    buildOption(option){
        this.Tools.arrForEach(TAG.EARTHTAG,function(tag,index){
            if(!option[tag])
                option[tag] = false;
        });
        return option;
    }
    
    
}
