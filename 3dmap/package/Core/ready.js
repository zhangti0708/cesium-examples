/*
 * @Descripttion: 
 * @version: 1.0
 * @Author: zhangti
 * @Date: 2019-09-19 09:10:57
 * @LastEditors: sueRimn
 * @LastEditTime: 2019-10-08 16:35:56
 */
/**
 * @file ready
 * @version 1.0
 * ready 类
 * 加载异步资源
 * */
import HTML from './html.js';
import CVTools from './cvTool.js';
export default function () {
  let urls =
    [
    '../libs/jquery.min.js'
     // , '../src/Cesium/Build/Cesium/Cesium.js'
     // ,'../libs/sensor.js'
    ,'../libs/echarts/echarts.min.js'
    ,'../libs/echarts/echarts.js'
    ,'../libs/drawEchart.js'
    ,'../libs/ArcGisImageServerTerrainProvider.js'
     
     
    ]

  let html = new HTML(), Tools = new CVTools();
  let p = new Promise(function (resolve, reject) {        //做一些异步操作
    Tools.arrForEach(urls, function (url, index) {
       let script = html.loadJS(url);
       if(index == 1){script.onload = function () {resolve('加载异步资源');}
      }
    });
  });
  return p;
};