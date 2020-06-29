/*
 * @Descripttion: 
 * @version: 1.0
 * @Author: zhangti
 * @Date: 2020-01-13 14:16:27
 * @LastEditors  : sueRimn
 * @LastEditTime : 2020-01-17 11:25:39
 */
/**
 * 卷帘对比
 * SplitView
 */
export default class SplitView {
    constructor(opt){
      if(!opt){
        return false;
      }
      for(let key in opt){
        this[key] = opt[key];
      }
      this.remove();
     
      $('#'+this.dom).append(`<div id="slider"></div>`);

      this.init();
    }
   
    init(){
      let $this = this;
      var layers = this.viewer.imageryLayers;
      this.layer = layers.addImageryProvider(this.map);
      this.layer.splitDirection = Cesium.ImagerySplitDirection.LEFT;
  
      var slider = document.getElementById('slider');
      this.viewer.scene.imagerySplitPosition = (slider.offsetLeft) / slider.parentElement.offsetWidth;
      var dragStartX = 0;
      document.getElementById('slider').addEventListener('mousedown', mouseDown, false);
      window.addEventListener('mouseup', mouseUp, false);
      function mouseUp() {
          window.removeEventListener('mousemove', sliderMove, true);
      }
      function mouseDown(e) {
          var slider = document.getElementById('slider');
          dragStartX = e.clientX - slider.offsetLeft;
          window.addEventListener('mousemove', sliderMove, true);
      }
      function sliderMove(e) {
          var slider = document.getElementById('slider');
          var splitPosition = (e.clientX - dragStartX) / slider.parentElement.offsetWidth;
          slider.style.left = 100.0 * splitPosition + '%';
          $this.viewer.scene.imagerySplitPosition = splitPosition;
      }
    }
    remove(){
      $('#slider').remove();
    }
}
