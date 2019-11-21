/*
 * @Descripttion: 
 * @version: 1.0
 * @Author: zhangti
 * @Date: 2019-10-22 16:24:00
 * @LastEditors: sueRimn
 * @LastEditTime: 2019-10-22 17:27:56
 */
/**
 * 可视化封装类
 */
import SatelliteTransit from './satelliteTransit.js';
import FlyPath from './flyPath.js';
import Winds from './winds.js';
export default class Visual{

    constructor(core){
        //core
        this.CoreV = core;
        //卫星过境
        this.SatelliteTransit = SatelliteTransit;
        //无人机侦察
        this.FlyPath = FlyPath;
        //风场
        this.Winds = Winds;
    
    }

 }