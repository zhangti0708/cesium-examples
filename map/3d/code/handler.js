/*
 * @Descripttion: 
 * @version: 1.0
 * @Author: zhangti
 * @Date: 2019-09-20 09:36:13
 * @LastEditors: sueRimn
 * @LastEditTime: 2019-11-22 12:25:58
 */

/**
 * handler 鼠标事件类
 * 
 * 所有鼠标事件
 * 管理鼠标事件
 */
export default class Handler{

    constructor(core){
        //初始化
        this.init(core);
    }
    init(core){
        /**
         * handler
         * 鼠标事件对象
         */
        this.handler = new Cesium.ScreenSpaceEventHandler(core.scene.canvas);
          /**
         * 左键点击事件
         */
        this.LEFT_CLICK = Cesium.ScreenSpaceEventType.LEFT_CLICK;
        /**
         * 鼠标移动事件
         */
        this.MOUSE_MOVE = Cesium.ScreenSpaceEventType.MOUSE_MOVE;
        /**
         * 左键双击事件
         */
        this.LEFT_DOUBLE_CLICK = Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK;
        /**
         * 左键按下事件
         */
        this.LEFT_DOWN = Cesium.ScreenSpaceEventType.LEFT_DOWN;
        /**
         * 左键弹起事件
         */
        this.LEFT_UP = Cesium.ScreenSpaceEventType.LEFT_UP;
        /**
         * 中键单击事件
         */
        this.MIDDLE_CLICK = Cesium.ScreenSpaceEventType.MIDDLE_CLICK;
        /**
         * 中健按下事件
         */
        this.MIDDLE_DOWN = Cesium.ScreenSpaceEventType.MIDDLE_DOWN;
        /**
         * 中键弹起事件
         */
        this.MIDDLE_UP = Cesium.ScreenSpaceEventType.MIDDLE_UP;
        /**
         * 右键单击事件
         */
        this.RIGHT_CLICK = Cesium.ScreenSpaceEventType.RIGHT_CLICK;
        /**
         * 右键按下事件
         */
        this.RIGHT_DOWN =  Cesium.ScreenSpaceEventType.RIGHT_DOWN;
        /**
         * 右键弹起事件
         */
        this.RIGHT_UP =Cesium.ScreenSpaceEventType.RIGHT_UP;
        /**
         * 滚轮事件
         */
        this.WHEEL = Cesium.ScreenSpaceEventType.WHEEL;
        /**
         * 监听事件
         * @param {*} callback 
         * @param {*} event 
         */
        /** 
         * 计数器
        */
       this.COUNTER = 0;
    }
    Action(callback,event){
        this.handler.setInputAction(function(e){callback(e);},event);
    }
    /**
     * 监听事件
     * @param {*} callback 
     * @param {*} event 
     * @param counter 计数器 
     * 计数器为1 callback
     * 计数器为2 callback2
     * 计数器 <=3 callback3
     */
    Actions(callback,callback2,event,counter){
        let _self = this;
        this.handler.setInputAction(function(e){
            if(_self.COUNTER == 0){
                callback(e);
            }else if(_self.COUNTER >= 2){
                callback2(e);
            }else{
                console.log('counter is :' +counter);
            }
        },event); 
    }
    /**
     * 删除事件
     * @param {*} event 
     */
    removeAction(event){
        this.handler.removeInputAction(event);
    }
    /**
     * 销毁
     */
    destroy(){
        this.handler.destroy();
    }

}