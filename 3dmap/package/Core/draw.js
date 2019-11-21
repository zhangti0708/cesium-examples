/*
 * @Descripttion: 
 * @version: 1.0
 * @Author: zhangti
 * @Date: 2019-10-22 11:39:34
 * @LastEditors: sueRimn
 * @LastEditTime: 2019-10-22 13:55:37
 */
/**
 * 封装绘制功能
 * 点线面矩形
 */
import DrawDynamicTool from './DrawDynamicTool.js';
 export default class Draw{

    constructor(core){
        this.drawDynamic = new DrawDynamicTool(core); 
    }
    remove(){
        if(this.drawDynamic == null)return false;
        this.drawDynamic.remove();
        this.drawDynamic = null;
    }
    //点
    drawPoint(fn){
        let _self = this;
        _self.drawDynamic.drawPoint(function(positions){
            var wgs84_positions = [];
            for(var i=0; i<positions.length; i++){
                var wgs84_point = _self.drawDynamic.Cartesian3_to_WGS84({
                    x: positions[i].x,
                    y: positions[i].y,
                    z: positions[i].z
                });
                wgs84_positions.push(wgs84_point);
            }
            //if(typeof fn == "function")
            console.log(wgs84_positions);
            fn(wgs84_positions);
        });
    }
    //线
    drawLine (fn) {
        let _self = this;
        console.log(fn);
        this.drawDynamic.drawLineString(function(positions){
            var wgs84_positions = [];
            for(var i=0; i<positions.length; i++){
                var wgs84_point = _self.drawDynamic.Cartesian3_to_WGS84({
                    x: positions[i].x,
                    y: positions[i].y,
                    z: positions[i].z
                });
                wgs84_positions.push(wgs84_point);
            }
            if(typeof fn == "function")fn(wgs84_positions);
        });
    }
    //圆
    drawCircle(fn){
        this.drawDynamic.circleDraw(function(positions){
            if(typeof fn == "function")fn(positions);
        });
    }
    //矩形
    drawRect(fn){
        let _self = this;
        _self.drawDynamic.drawRect(function(positions){
            var wgs84_positions = [];
            for(var i=0; i<positions.length; i++){
                var wgs84_point = _self.drawDynamic.Cartesian3_to_WGS84({
                    x: positions[i].x,
                    y: positions[i].y,
                    z: positions[i].z
                });
                wgs84_positions.push(wgs84_point);
            }
            if(typeof fn == "function")fn(wgs84_positions);
        });
    }
    //多边形
    drawPolygon(fn){
        let _self = this;
        _self.drawDynamic.drawPolygon(function(positions){
            var wgs84_positions = [];
            for(var i=0; i<positions.length; i++){
                var wgs84_point = _self.drawDynamic.Cartesian3_to_WGS84({
                    x: positions[i].x,
                    y: positions[i].y,
                    z: positions[i].z
                });
                wgs84_positions.push(wgs84_point);
            }
            if(typeof fn == "function")fn(wgs84_positions);
        });
    }
 }