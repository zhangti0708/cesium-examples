/*
 * @Descripttion: 
 * @version: 1.0
 * @Author: zhangti
 * @Date: 2019-11-27 17:06:37
 * @LastEditors: sueRimn
 * @LastEditTime: 2019-12-06 09:41:05
 */
/**
 * 二维地图初始化
 * 需要引入hMap.js
 */
function OMap(dom,opt){
    //初始化
    this.map = null;
    this.plot = null;

    this.initolMap(dom,opt);
}

OMap.prototype = {
     initolMap(dom,opt){
        this.map = new HMap(dom, {
            controls: {
              loading: true,
              zoomSlider: true,
              fullScreen: true
            },
            interactions: {
              shiftDragZoom: false
            },
            view: {
                center: opt.center == undefined?[12095486.34146684, 4085090.6140265367]: opt.center,
                projection: 'EPSG:3857',
                zoom: opt.zoom == undefined? 5 : opt.zoom
            },
            baseLayers: [
              {
                layerName: 'openstreetmap',
                isDefault: true,
                layerType: 'OSM',
                opaque: true, //图层是否不透明
                layerUrl: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
              }
            ]
        });
    },
    initPlot(){
        /* eslint-disable-next-line */
        this.plot = new olPlot(this.map.getMap(), {
            zoomToExtent: true
           });
          //事件监听
          this.map.on('click',(event)=>{
            const feature = this.map.forEachFeatureAtPixel(event.pixel, function (feature) {
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
}
