/*
 * @Descripttion: 
 * @version: 1.0
 * @Author: zhangti
 * @Date: 2019-09-29 11:55:55
 * @LastEditors: sueRimn
 * @LastEditTime: 2019-09-29 11:55:55
 */
/**
 * 时钟对象封装
 */

export default class Clock{

    constructor(v){

        this.CoreV = v;

        this.clockAction = v.clock;

        //状态
        this.LOOP_STOP =  Cesium.ClockRange.LOOP_STOP; //停止
        this.CLAMPED =  Cesium.ClockRange.CLAMPED;  //循环
        this.UNBOUNDED =  Cesium.ClockRange.UNBOUNDED;  //继续读秒

    }

    //时间轴监听
    Action(callback,callback2){
        this.clockAction.onTick.addEventListener(function(clock) {callback(clock)});
        this.clockAction.onStop.addEventListener(function(clock) {callback2(clock)})
    }

    //到达终点停止
    range(clockRange){
        this.clockAction.clockRange = clockRange;
    }

    //开始时间
    startTime(value){
        this.clockAction.currentTime = value.clone();  // 设置时钟当前时间
    }
    //结束时间
    stopTime(value){
        this.clockAction.stopTime  = value.clone();  // 设置始终停止时间
    }
    //速率
    multiplier(value){
        this.clockAction.multiplier = value;  // 时间速率，数字越大时间过的越快
    }
    /**
     * 根据数据计算结束时间
     */
    piTimes(times){
        return Cesium.JulianDate.addSeconds(start, (times.length-1)*120,new Cesium.JulianDate()); //结束时间
    }
}