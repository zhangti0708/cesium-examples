/*
 * @Descripttion: 
 * @version: 1.0
 * @Author: zhangti
 * @Date: 2019-10-23 15:34:15
 * @LastEditors: sueRimn
 * @LastEditTime: 2019-11-16 16:00:24
 */
/**
 * 热力图封装
 * 
 */
import config from './config.js'
 export default class HeatMap{
   
    constructor(opt){
       this.init(opt);
       this.HeatAlpha = {
            _001:0.1,_003:0.3,_005:0.5,_007:0.7,_009:0.9,
            _011:1.1,_013:1.3,_015:1.5,_017:1.7,_020:2.0
        }
    }
    init(opt){
        if(opt == null){
            return false;
        }
		var t = this;
		for(var key in opt){
			t[key] = opt[key];
        }
        this.url = this.url || config.DATADIR + "/busstop2016.geojson";
        this.heatType = this.heatType == undefined ? "CesiumHeatmapGL" : this.heatType;
        this.load();
    }
    load(){
        if(this.wfs == undefined){
            this.data = {obj : this.url,type:"url"}
        }else{
            //请求wfs数据 并解析
        }
    }
    build(){
        console.log(this.heatType);
        if("CesiumHeatmapGL" == this.heatType){
            this.heatmap = new CesiumHeatmapGL(this.viewer, this.data)
        }
        if("CesiumHeatmap" == this.heatType){
            this.heatmap = new CesiumHeatmap(this.viewer, this.data)
        }
    }
    setAlpha(value){
        this.heatmap.multiply(parseFloat(value));
    }
    remove(){
        if(this.heatmap != undefined){
            this.heatmap.none();
        }
    }

 }