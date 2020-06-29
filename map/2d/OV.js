/*
 * @Descripttion: 
 * @version: 1.0
 * @Author: zhangti
 * @Date: 2019-11-27 10:20:37
 * @LastEditors  : sueRimn
 * @LastEditTime : 2020-01-17 17:38:21
 */

//常用配置
const CODEDIR = '/map/2d/code'; //code
const STATICDIR = '/map/2d/static'; //static 静态资源
const DATADIR = '/map/2d/data'; //data
const LIBSDIR = '/map/libs'; //lib包
/**
 * 二维地图封装接口类
 * 不含实际业务操作
 * 辅助类
 */
import Tools from './code/Tools.js';
import HTML from './code/Html.js';
export default class OV {

    static OSM_LAYER = {
      layerName: 'OSM',
      layerType: 'OSM',
      isDefault: true,
      opaque: true, //图层是否不透明
      layerUrl: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    }

    static GOOGLE_LAYER = {
      layerName: 'Google',
      layerType: 'Google',
      isDefault: true,
      opaque: true, //图层是否不透明
      layerUrl: 'http://www.google.cn/maps/vt?lyrs=m@189&gl=cn&x={x}&y={y}&z={z}'
    }

    static GAODE_LAYER = {
      layerName: 'GaoDe',
      layerType: 'GaoDe',
      isDefault: true,
      opaque: true, //图层是否不透明
      layerUrl: 'http://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}'
    }

    constructor(dom,initOption){
        if(!dom){
          return false;
        }
        this.layers = [
            OV.OSM_LAYER,
            OV.GOOGLE_LAYER,
            OV.GAODE_LAYER
        ]
        return this.init(dom,initOption)
    }
    
    /**
     * 加载资源
     */
    init(dom,initOption){
      return new Promise((resolve,reject)=>{
          new Read().load((res) =>{
                console.log(res);
                this.initolMap(dom,initOption);
                
                resolve(this);//返回当前对象  
          });
      })   
    }
    /**
     * 初始化地图
     * @param {*} dom 
     * @param {*} opt 
     */
    initolMap(dom,opt){
        let baseLayers = opt.layer ?opt.layer: this.layers;
        this.omap = new HMap(dom, {
            controls: {
              loading: opt.loading == undefined? true : opt.loading,
              zoomSlider: opt.zoomSlider == undefined? true : opt.zoomSlider,
              fullScreen: opt.fullScreen == undefined? true : opt.fullScreen,
              rotate: opt.rotate == undefined? true : opt.rotate,
              zoomCtl: opt.zoomCtl == undefined? false : opt.zoomCtl,
              overviewMap:opt.overviewMap == undefined? false : opt.overviewMap,
            },
            interactions: {
              shiftDragZoom: false
            },
            view: {
                center: opt.center == undefined?[101.4173, 37.9204]:opt.center,
                projection: 'EPSG:4326',
                zoom: opt.zoom == undefined? 5 : opt.zoom
            },
            baseLayers: baseLayers
        });
    }
    /**
     * 初始化标绘
     */
    initPlot(){
        /* eslint-disable-next-line */
        this.plot = new olPlot(this.omap.getMap(), {
            zoomToExtent: true
           });
          //事件监听
          this.omap.on('click',(event)=>{
            const feature = this.omap.forEachFeatureAtPixel(event.pixel, function (feature) {
              return feature
            })
            if (feature && feature.get('isPlot') && !this.plot.plotDraw.isDrawing()) {
               this.plot.plotEdit.activate(feature)
            } else {
               this.plot.plotEdit.deactivate()
            }
          });
          // 绘制结束后，添加到FeatureOverlay显示。
          this.plot.plotDraw.on('drawEnd', (event)=>{
            const feature = event.feature
            this.plot.plotEdit.activate(feature)
          })
          this.plot.plotDraw.on('active_textArea', (event)=> {
            const style = this.plot.plotUtils.getPlotTextStyleCode(event.overlay)
            console.log(style)
          })
          // 指定标绘类型，开始绘制。
          this.plot.activate = function (type){ //plot对象
            this.plotEdit.deactivate()
            this.plotDraw.active(type)
          }
          this.plot.getFeatures = function(){ //plot对象
            const features = this.plotUtils.getFeatures()
            console.log(JSON.stringify(features))
            this.plotUtils.removeAllFeatures()
            this.plotEdit.deactivate()
            this.plotUtils.addFeatures(features)
          };
    
          return this.plot;
    }
    /**
     * 底图切换
     */
    layerSwitch(){
      this.omap.on('loadMapSuccess', (event) => {
        if (event) {
          var config_ = [
            {
              layerName: 'GaoDe',
              name: '高德地图',
              icon: STATICDIR + '/img/maptype_vector.png'
            },
            {
              layerName: 'OSM',
              name: 'OSM',
              icon: STATICDIR + '/img/maptype_pano.png'
            },
            {
              layerName: 'Google',
              name: '谷歌地图',
              icon: STATICDIR + '/img/maptype_yunran.png'
            }
          ]
          var LayerSwitcher = new ol.control.LayerSwitcher({
            itemWidth: 86,
            itemHeight: 60,
            layers: config_
          })
          this.omap.addControl(LayerSwitcher)
          var tt = this.omap.getLayersArrayByKeyValue('isBaseLayer', true) // polyfill
          LayerSwitcher.baseLayers_ = tt
          console.log(tt)
        }
    })
  }
  /**
   * 比例尺
   */
  ScaleLineH(){
    var controlScaleLine = new ol.control.ScaleLineH({
      units: 'metric_cn'
    })
    this.omap.addControl(controlScaleLine)
  }
  /**
   * 鼠标移动信息 
   */
  mouseInfo(){
    var controlMousePosition = new ol.control.MousePositionH({})
    this.omap.addControl(controlMousePosition)
  }
  /**
   * 地图对比
   */
  compareLayer(){
    var layer1 = this.omap.getLayerByLayerName('GaoDe')
    var layer2 = this.omap.getLayerByLayerName('Google')
    var olControlCompareLayer = new ol.control.CompareLayer(layer1, layer2)
    this.omap.addControl(olControlCompareLayer)
  }
  /**
   * 量测
   */
  initMeasure(){
    var measureTool = new ol.interaction.MeasureTool()
    this.omap.addInteraction(measureTool)
    return measureTool;
  }
  /**
   * 加载geojson数据
   * 自定义
   */
   loadGeoJson(url,opt){
      let _self = this,data = [];
      let draw = function (event) {
        var context = event.context;
        context.save();
        context.globalAlpha = 1;
        context.fillStyle = '#08304b';
        for (var i = 0; i < data.length; i++) {
          var coords = data[i].geometry.coordinates[0];
          for (let j = 0; j < coords.length; j++) {
            const point = _self.omap.getPixelFromCoordinate(ol.proj.transform([coords[j][1], coords[j][0]], 'EPSG:4326', 'EPSG:3857'));
            if (j === 0) {
              context.beginPath();
              context.moveTo(point[0], point[1]);
            } else {
              context.lineTo(point[0], point[1]);
            }
          }
          context.fill();
        }
        context.restore();
      }
      let canvas = new ol.layer.CanvasLayer({
        map: _self.omap.getMap(),
        projection: 'EPSG:3857',
        render: draw
      });
      fetch(DATADIR + url, {method: 'GET'}).then(function(response) {
        return response.json();
      }).then(function(json) {
        data = json.features;
        _self.omap.addLayer(canvas);
      }).catch(function (error) {
        console.error(error)
      });
   }

    /**
     * 场景树
     * @param {c} trees 
     */
    sceneTree(trees){
        if(this.Tools.nullBool(trees)){
            console.log("使用默认场景!");
            return false;
        }
        //生成底图切换
        if(trees.layerSwitch != undefined){
            if(trees.layerSwitch){
                this.mapmap.layerSwitch();
            }
        }
        //鹰眼
        if(trees.scaleLineH != undefined){
            if(trees.scaleLineH){
                this.mapmap.ScaleLineH();
            }
        }
    }
}
/**
 * @file ready
 * @version 1.0
 * ready 类
 * 加载异步资源
 * */
var $self; //当前页面
class Read {
    static URLS = {
      useJS : [
        CODEDIR + '/ol-plot.js',
        LIBSDIR + '/jquery/3.1.1/jquery.min.js',
        LIBSDIR + '/dat.gui.min.js',
        LIBSDIR + '/JSLite.js'
        
      ],
      useCSS : [
        STATICDIR + '/css/ol-plot.css',
        STATICDIR + '/css/iconfont.css',
      ]
    }
    constructor(){
      /**
       * 初始化
       */
       this.Tools = new Tools();
       this.Html = new HTML();
       $self = this;
    }

    
    /**
     * 加载资源方案
     * @param {*} resolve 
     * @param {*} reject 
     */
    loadUse(resolve, reject){
      $self.Tools.arrForEach(Read.URLS.useCSS, function (url, index) {
        $self.Html.loadCSS(url);
       });
       $self.Tools.arrForEach(Read.URLS.useJS, function (url, index) {
        $self.Html.loadJS(url);
          if(index == Read.URLS.useJS.length - 1){
              setTimeout(() => {
                  resolve('-- 2d load --'); //结束出发回调事件
              }, 100);
          }
      });
    }
    /**
     * 加载
     */
    load(call){
        let pro1 = new Promise((resolve, reject) => {
            this.Html.loadCSS(STATICDIR + '/css/hmap.css');
            let map = this.Html.loadJS(CODEDIR + '/hmap.js');
            map.onload = function(){resolve('loadOl');}
        });
        pro1.then(res => {
            setTimeout(() => {
              let pro2 = new Promise(this.loadUse);
              pro2.then((res)=>{call(res)}); 
            },50)  
        }); 
    }
   
};