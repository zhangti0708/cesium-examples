/*
 * @Descripttion: 
 * @version: 1.0
 * @Author: zhangti
 * @Date: 2019-09-19 09:10:57
 * @LastEditors: sueRimn
 * @LastEditTime: 2019-11-16 16:07:43
 */
/**
 * @file sceneTree
 * @version 1.0
 * sceneTree 类
 * 在3d地球上挂载场景
 * 
 * */
import Scene from './scene.js';
import Entitys from './entitys.js';
import Primitives from './primitives.js';
import Radar from './radar.js';
export default class sceneTree{

    constructor(core){
        /**
         * root 节点
         */
        this.root = null;
        /**
         * imagery 影像图层
         */
        this.imagery = core.scene.imageryLayers;
        /**
         * primitives  
         */
        this.primitives = core.scene.primitives;
        /**
         * viewer
         */
        this.viewer = core;
         /**
         * 获取场景对象
         */
        this.scene = new Scene(this.viewer);
         /**
         * 实体
         */
        this.entitys = new Entitys(this.viewer);
        /**
         * primitives
         */
        this.primitive = new Primitives(this.viewer);
         /**
         * 解析场景
         */
        this.formatData = {
            format (scene){
                
            },
            imagery (){
                this.imagery.add(imagery);
            },
            tileset (tileset){
                this.primitives.add(tileset);
            }
        }
        
    }

     /**
     * root节点
     */
    root (opt){
        
        //拓展接口
        switch(scene.formatType){
            case '' : break;
            default : this.formatData.format(this.root); break;
        }
    }
   
    /**
     * 挂载场景
     */
    mount (){
        
    }
    /**
     * build 接口
     */
    build(trees){
        if(trees == undefined){
            alert("没有获取到功能节点");
        }
        let _self = this;
         //自转
        if(trees.rotation != undefined){
            if(trees.rotation){
                this.scene.rotation({cmd:"No"});
            }else{
                this.scene.rotation({cmd:"Off"});
            }  
        }
         //雾天
        if(trees.fog != undefined){
            if(trees.fog){
                this.scene.fog({cmd:"No"});
            }else{
                this.scene.fog({cmd:"Off"});
            }  
        }
        //昼夜
        if(trees.lighting != undefined){
            if(trees.lighting){
                this.scene.lighting({cmd:"No"});
            }else{
                this.scene.lighting({cmd:"Off"});
            }  
        }
        //大气层
        if(trees.groundAtmosphere != undefined){
            if(trees.groundAtmosphere){
                this.scene.groundAtmosphere({cmd:"No"});
            }else{
                this.scene.groundAtmosphere({cmd:"Off"});
            }  
        }
         //星空
        if(trees.skyBox != undefined){
            if(trees.skyBox){
                this.scene.skyBox({cmd:"No"});
            }else{
                this.scene.skyBox({cmd:"Off"});
            }  
        }
         //太阳
        if(trees.sun != undefined){
            if(trees.sun){
                this.scene.sun({cmd:"No"});
            }else{
                this.scene.sun({cmd:"Off"});
            }  
        }
        //雨天
        if(trees.rain != undefined){
            if(trees.rain){
                setTimeout(function(){
                    _self.scene.rain({cmd:"No"});
                },100)
            }else{
                this.scene.rain({cmd:"Off"});
            }  
        }
         //雪天
        if(trees.snow != undefined){
            if(trees.snow){
                setTimeout(function(){
                    _self.scene.snow({cmd:"No"});
                },100)
            }else{
                this.scene.snow({cmd:"Off"});
            }  
        }
        //经纬网
        if(trees.grid != undefined){
            if(1 == trees.grid.cmd){
               if( trees.grid.flag){
                  this.scene.grid({cmd:"No"});
               }else{
                  this.scene.grid({cmd:"Off"});
               }
            }
            if(2 == trees.grid.cmd){
                if( trees.grid.flag){
                    this.scene.tileGrid({cmd:"No"});
                }else{
                    this.scene.tileGrid({cmd:"Off"});
                }
            } 
            if(3 == trees.grid.cmd){
                if( trees.grid.flag){
                    this.scene.mgrsGrid({cmd:"No"});
                }else{
                    this.scene.mgrsGrid({cmd:"Off"});
                }
            }  
        }
        //十字
        if(trees.sbstyle != undefined){
            if(trees.sbstyle){
                document.documentElement.style.cursor = 'crosshair';
            }else{
                document.documentElement.style.cursor = 'default';
            }
            
        }
        //相机状态
        if(trees.xjzt != undefined){
            if(trees.xjzt){
                $('.map-move-msg').show();
            }else{
                $('.map-move-msg').hide();
            }
        }
        //cesiumTool
        if(trees.cesiumTool != undefined){
            if(trees.cesiumTool){
                $('.cesium-viewer-toolbar').show(); 
            }else{
                $('.cesium-viewer-toolbar').hide(); 
            }
        }
        //时间轴
        if(trees.sjz != undefined){
            if(trees.sjz){
               this.showTime();
            }else{
               this.hideTime();
            }
        }
        //信息框
        if(trees.info != undefined){
            if(trees.info){
                $('.cesium-infoBox').show();
            }else{
                $('.cesium-infoBox').hide();
            }
        }
        //导航
        if(trees.navi != undefined){
            if(trees.navi){
                $('.cesium-widget-cesiumNavigationContainer').show();
            }else{
                $('.cesium-widget-cesiumNavigationContainer').hide();
            }
        }
        //雷达
        if(trees.radar != undefined){
            if(trees.radar){
               this.radar = new Radar({viewer:this.viewer});
               this.radar.build(4)
            }else{
                this.radar.dmRadar.remove();
            }
        }
        //省份数据
        if(trees.province != undefined){
            if(trees.province){
              this.createProvincesBorder();
            }else{
               this.closeProvincesBorder();
            }
        }
        //3dtile
        if(trees._3dtiles != undefined){
            if(trees._3dtiles){
                this.primitive.create3DTileset({url:'./data/3DTiles/building/tileset.json'});
            }else{
                this.primitive.remove3DTileset();
            }
        }
        //地形
        if(trees.terrain != undefined){
            if(trees.terrain){
               try {
                    this.viewer.scene.terrainProvider = createArcGisElevation3DTerrainProvider(Cesium);
               } catch (error) {
                   alert("默认地形图加载异常");
               }
            }else{
                this.viewer.scene.terrainProvider = new Cesium.EllipsoidTerrainProvider({});
            }
        }
    }
    //显示
    showTime() {
        if($('.map-move-msg').css('display') == 'none'){
            $('.cesium-viewer-animationContainer').css('bottom', 0 + 'px');
            $('.cesium-viewer-timelineContainer').css('bottom',0 + 'px');
        }else{
            $('.cesium-viewer-animationContainer').css('bottom', $('.map-move-msg').height() + 'px');
            $('.cesium-viewer-timelineContainer').css('bottom', $('.map-move-msg').height() + 'px');
        }
        $('.cesium-viewer-animationContainer').show();
        $('.cesium-viewer-timelineContainer').show();
    }
    //隐藏
    hideTime(){
        $('.cesium-viewer-animationContainer').hide();
        $('.cesium-viewer-timelineContainer').hide();
    }
    //省份数据
    createProvincesBorder(){
        let _self = this;
        var promise = _self.viewer.dataSources.add(Cesium.GeoJsonDataSource.load('data/china.json'));
        promise.then(function (dataSource) {
            _self.provinceData = dataSource;
        }).otherwise(function (error) {
            return new PageError(error);
        });
    }
    closeProvincesBorder(){
        this.viewer.dataSources.remove(this.provinceData);
    }

}
