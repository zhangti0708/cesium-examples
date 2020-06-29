/*
 * @Descripttion: 
 * @version: 1.0
 * @Author: zhangti
 * @Date: 2019-09-19 09:10:57
 * @LastEditors  : sueRimn
 * @LastEditTime : 2020-01-16 12:30:20
 */
/**
 * @file ready
 * @version 1.0
 * ready 类
 * 加载异步资源
 * */
import HTML from './html.js';
import Tools from './cvTool.js';
import config from './config.js';
var self;
export default class Read {
    static URLS = {
      useJS : [
        config.LIBSDIR + '/cesium.zh.js',
        config.LIBSDIR + '/CesiumBuild.js',
        config.LIBSDIR + '/viewerCesiumNavigationMixin.min.js',
        config.LIBSDIR + '/heatmap.js',
        config.LIBSDIR + '/ViewShed3D.js',
        config.LIBSDIR + '/netcdfjs.js',
        config.LIBSDIR + '/spector.bundle.js',
        config.LIBSDIR + '/dat.gui.min.js',
        config.LIBSDIR + '/dayjs.min.js',
        config.LIBSDIR + '/vue.min.js',
        config.LIBSDIR + '/cesium.zh.js',
      //  config.LIBSDIR + '/echarts/echarts.js',
        config.LIBSDIR + '/echarts/echarts.min.js',
        config.LIBSDIR + '/satellite.js',
        config.LIBSDIR + '/ztree/js/jquery.ztree.all.js',
        config.LIBSDIR + '/createTerrainProviderViewModels.js',
        config.LIBSDIR + '/createImageProviderViewModels.js'
      ],
      useCSS : [
        config.LIBSDIR + '/ztree/css/zTreeStyle/zTreeStyle.css'
      ]
    }
    constructor(){
      /**
       * 初始化
       */
       this.Tools = new Tools();
       this.Html = new HTML();
       self = this;
    }

    
    /**
     * 加载资源方案
     * @param {*} resolve 
     * @param {*} reject 
     */
    loadUse(resolve, reject){
      self.Tools.arrForEach(Read.URLS.useCSS, function (url, index) {
        self.Html.loadCSS(url);
       });
       self.Tools.arrForEach(Read.URLS.useJS, function (url, index) {
          self.Html.loadJS(url);
          if(index == Read.URLS.useJS.length-1){
            setTimeout(() => {
                resolve('-- 3d load --'); //结束出发回调事件
            },200)
          }
      });
    }
    /**
     * 加载
     */
    load(use,call){
       if(use == "A"){return this.onUseA(call)}else{ return this.onUseB(call)}
    }
    /**
     * 常用加载资源方案
     * cesium相关的
     * 不包含jq + bootstap
     */
    onUseA(call){
        let pro1 = new Promise((resolve, reject) => {
        this.Html.loadCSS(config.APPDIR + '/Build/Cesium/Widgets/widgets.css');
        this.Html.loadJS(config.LIBSDIR + '/jquery/jquery-1.9.1.min.js');

        let cesium = this.Html.loadJS(config.APPDIR + '/Build/Cesium/Cesium.js');
          cesium.onload = function(){resolve('-- loadCesium --');}
        });
        pro1.then((res) => {
          setTimeout(() => {
            let pro2 = new Promise(this.loadUse);
            pro2.then((res)=>{
              console.log(res);
              call(res)
            }); 
          },200)  
       });
    }

    /**
     * 常用加载资源方案
     * cesium相关的
     * 包含jq + bootstap
     */
    onUseB(call){
      let pro1 = new Promise((resolve, reject) => {
        this.Html.loadCSS(config.APPDIR + '/Build/Cesium/Widgets/widgets.css');
        this.Html.loadJS(config.LIBSDIR + '/jquery/jquery-1.9.1.min.js');
        
        let cesium = this.Html.loadJS(config.APPDIR + '/Build/Cesium/Cesium.js');
          cesium.onload = function(){resolve('-- loadCesium --');}
        });
        pro1.then((res) => {
            setTimeout(() => {
              let pro2 = new Promise(this.loadUse);
              pro2.then((res)=>{
                call(res)
              }); 
            },100)  
        });
    }
};