/*
 * @Descripttion: 
 * @version: 1.0
 * @Author: zhangti
 * @Date: 2019-10-10 16:45:02
 * @LastEditors  : sueRimn
 * @LastEditTime : 2020-01-14 17:03:18
 */
/**
 * 
 * 分析工具类
 */
import mouseManager from './mouseManager.js';
import Primitives from './primitives.js';
import Entitys from './entitys.js';
import Tools from './cvTool.js';
import entityFactory from './entityFactory.js';
import config from './config.js';
export default class Analyser{  
  
   
    constructor(core){
        //初始化分析工具
        this._viewer = core;
        /**
         * mouseManager
         * 坐标转换
         */
        this.mouseManager = new mouseManager(core);
        /**
         * 绘图实体
         */
        this.Primitives = new Primitives(core);
        /**
         * 几何数据实体
         */
        this.entitys = new Entitys(core);
        /**
         * 初始化工具
         */
        this.Tools = new Tools();
        /**
         * 常用配置
         */
        this._config = config;
        /**
         * 封装的实体
         */
        this.entityFactory = entityFactory;

        this.BEYONANALYSER_TYPE = { //分析功能
            VISIBILITY:0,
            SLOPE:1,
            VISUALFIELD:2,
            POINTANALYSIS:3,
            SUBMERGED:4
            
        }
        this.BEYONANALYSER_STATE = {
            PREPARE:0,
            OPERATING:1,
            END:2
        };
        //初始化
        this.init();
       
    }
    init(){
        /**
         * 提示框
         */
        this.tipLabelEntity = this.entitys.add({
            label : {
                name: 'analyse',
                show : false,
                showBackground : true,
                font : '14px monospace',
                horizontalOrigin : Cesium.HorizontalOrigin.LEFT,
                verticalOrigin : Cesium.VerticalOrigin.BOTTOM,
                pixelOffset : new Cesium.Cartesian2(15, -10)
            }
        });
        //进度条
        function ProcessTool() {
            var win = document.getElementById("process-window");
            if (!win) {
                var html = '<div id = "process-window" class="Absolute-Center"><div id = "animition"><div id = "percent"> 30%</div><div id ="round-picture"></div></div><div id = "text" style="padding: 10px;"></div></div>';
                document.body.insertAdjacentHTML("beforeend", html);
                win = document.getElementById("process-window");
            }
            this.win = win;
            this.percent = document.getElementById("percent");
            this.text = document.getElementById("text");
            this.update = function (percent, text) {
                this.percent.innerText = percent;
                if (text) {
                    this.text.innerText = text;
                }
                this.setVisible(true);
            };
            this.setVisible = function (bVisible) {
                this.win.style.display = bVisible ? "" : "none";
            };
            this.setVisible(false);
        }
        //processTool
        this.processTool = new ProcessTool();
        this.analysisEffects=[];
        //this.posArray=[];
        this.type = undefined;
        //handler
        this.handler = new Cesium.ScreenSpaceEventHandler(this._viewer.scene.canvas);   
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
    /**
     * 添加分析
     * @param {*} type 
     * @param {*} options 
     */
    addAnalysis(type,options){
       
    }
    /**
     * 销毁鼠标事件
     */
    destroyHandler(){
        this.handler=this.handler&&this.handler.destroy();
    }
    /**
     * 获取相交对象
     * @param {*} startPos 
     * @param {*} endPos 
     * @param {*} excludeArr 
     * @param {*} bDrillPick 
     */
    getIntersectObj(startPos,endPos,excludeArr=[],bDrillPick=false){
        var viewer=this._viewer;
        var direction = Cesium.Cartesian3.normalize(Cesium.Cartesian3.subtract(endPos, startPos, new Cesium.Cartesian3()), new Cesium.Cartesian3());
        var ray = new Cesium.Ray(startPos, direction); //无限延长的射线
    
        var results = [];
    
        if (bDrillPick) {
            results = viewer.scene.drillPickFromRay(ray, 10, excludeArr);
        } else //只pick首个物体
        {
            var result = viewer.scene.pickFromRay(ray, excludeArr);
            if (Cesium.defined(result)) {
                results = [result];
            }
        }
        return results;
    }
    /**
     * 停止鼠标左键事件
     */
    stopViewerLeftClickHander(){
        this.viewerHandler=this.viewerHandler||this._viewer._cesiumWidget.screenSpaceEventHandler;
        //保存一下视图的单击、双击事件
        if(!Cesium.defined(this.viewActtion)){
            this.viewActtion={};
            this.viewActtion.leftClick=this.viewerHandler.getInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
            this.viewActtion.leftDBClick=this.viewerHandler.getInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
        }
        this.viewerHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
        this.viewerHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    }
    /**
     * 恢复鼠标左键事件
     */
    restoreViewerLeftClicHander(){
        if(Cesium.defined(this.viewerHandler)&&Cesium.defined(this.viewActtion)){
            this.viewerHandler.setInputAction(this.viewActtion.leftClick,Cesium.ScreenSpaceEventType.LEFT_CLICK);
            this.viewerHandler.setInputAction(this.viewActtion.leftDBClick,Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
        }
    }
     /**
     * 获取存在的效果
     * @param {*} id 
     */
    getAnalysisEffect(id){
        for (let index = 0; index < this.analysisEffects.length; index++) {
            var effect = this.analysisEffects[index];
            if(id===effect.id){
                return effect;
            }            
        }
        return undefined;
    }
    //地球取点
    pickMap(callback){
        this.stopViewerLeftClickHander()
        this.destroyHandler(); 
        var viewer=this._viewer;
        this.handler=new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);   
        var scope=this;

        this._tip=viewer.entities.add({
            id:this.id,
            label : {
                fillColor:Cesium.Color.YELLOW,
                showBackground : true,
                font : '14px monospace',
                horizontalOrigin : Cesium.HorizontalOrigin.LEFT,
                verticalOrigin : Cesium.VerticalOrigin.BOTTOM,
                pixelOffset : new Cesium.Cartesian2(0, -10)
            }
        });

        this.state=this.BEYONANALYSER_STATE.OPERATING;
        
        this.handler.setInputAction(function (movement) {
                let cartesian = _self.mouseManager.piTerrainToModule(movement.position);
                this.state=this.BEYONANALYSER_STATE.END;
                var lla={};
                var cartographic=Cesium.Cartographic.fromCartesian(cartesian);
                //获取该点地表高程
                var landHeight=viewer.scene.globe.getHeight(cartographic);
                if(cartographic.height<landHeight)
                {
                    cartographic.height=landHeight;
                }            
                lla.lon=Cesium.Math.toDegrees(cartographic.longitude);
                lla.lat=Cesium.Math.toDegrees(cartographic.latitude);
                lla.height=cartographic.height;
                scope.removeAnalysis();
                viewer.entities.remove(scope._tip);
                callback(lla);
                scope.destroyHandler();
                scope.restoreViewerLeftClicHander();
            }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK  );


        this.handler.setInputAction(function (movement) {
            var cartesian =viewer.scene.pickPosition(movement.endPosition);  
            if(scope.state===this.BEYONANALYSER_STATE.OPERATING){
                info ='双击取点';
                showTip(scope._tip,true,cartesian,info);         
            }
        },Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }


}