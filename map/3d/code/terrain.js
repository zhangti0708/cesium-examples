/*
 * @Descripttion: 
 * @version: 1.0
 * @Author: zhangti
 * @Date: 2019-09-19 17:44:53
 * @LastEditors: sueRimn
 * @LastEditTime: 2019-09-29 16:51:55
 */
/**
 * 生成地形实体类
 */
 export default class Terrain{

    constructor(core){
        /**
         * terrain 实体
         */
        this.TerrainLayer = core.terrainProvider;

        this.terrainObj = null;
    }
    /**
     * build 构建
     * @param {*} Terrain 
     */

    build(node){
        
        switch(node.type){//拓展接口
            case 'create': this.terrainObj = this.createTerrain(node.child);break;
            default: this.terrainObj = this.addTerrainLayer(node.terrain); break;
        }

        return  this.terrainObj;
    }
    /**
     * 创建 Terrain
     * 需要后面拓展
     * 创建接口
     */  
    createTerrain(child){
        for(let c in child){
            Terrain = {
                url:child[c].url
            } 
        }
    }
    /**
     * 添加Terrain
     */
    addTerrainLayer(terrain){
        console.log(terrain);
        this.TerrainLayer = terrain;
    }
    /**
     * remove Terrain
     */
    remove(){
        this.TerrainLayer = new Cesium.EllipsoidTerrainProvider({});
    }

    /** 
     * 
     * removeAll Terrain
    */
    removeAll(){
        this.TerrainLayer = new Cesium.EllipsoidTerrainProvider({});
    }


 }