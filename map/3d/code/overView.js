/*
 * @Descripttion: 
 * @version: 1.0
 * @Author: zhangti
 * @Date: 2020-01-13 14:16:27
 * @LastEditors  : sueRimn
 * @LastEditTime : 2020-01-17 11:15:48
 */
/**
 * 鹰眼封装
 * OverviewMapControl
 */
export default class OverViewMap {
    constructor(opt){

      if(!opt){
         return false;
      }
      this.remove();

      $('body').append(` <div id="eye">
          <div id="creditContainer2" style="display: none;"></div>
      </div>`);

      $('#eye').css('position','absolute').css('width','20%').css('height','20%;')
      .css('bottom','0').css('right','0').css('z-index','999').css('border','1px solid rgb(0, 192, 239)');
      
      this.initOverview(opt);
    }
    initOverview(opt) {
        var viewerEye = new Cesium.Viewer('eye', {
          imageryProvider: opt.map,
          creditContainer: 'creditContainer2',
          shouldAnimate: false,
          selectionIndicator: false,
          baseLayerPicker: false,
          homeButton: false,
          animation: false,
          timeline: false,
          geocoder: false,
          sceneModePicker: false,
          navigationHelpButton: false,
          infoBox: false,
          fullscreenButton: false,
      });
  
      var control = viewerEye.scene.screenSpaceCameraController;
  
      control.enableRotate = false;
  
      control.enableTranslate = false;
  
      control.enableZoom = false;
  
      control.enableTilt = false;
  
      control.enableLook = false;
  
      var syncViewer = function () {
  
          viewerEye.camera.flyTo({
  
              destination: opt.viewer.camera.position,
  
              orientation: {
  
                  heading: opt.viewer.camera.heading,
  
                  pitch: opt.viewer.camera.pitch,
  
                  roll: opt.viewer.camera.roll
  
              },
  
              duration: 0.0
  
          });
  
      }
  
      opt.viewer.camera.changed.addEventListener(syncViewer);
  
      opt.viewer.scene.preRender.addEventListener(syncViewer);
    }
    //联动
    mutilView(viewerL,viewerR){
      var sceneL = viewerL.scene;
      var sceneR = viewerR.scene;
  
      var handlerL = new Cesium.ScreenSpaceEventHandler(sceneL.canvas);
      var ellipsoidL = sceneL.globe.ellipsoid;
      var handlerR = new Cesium.ScreenSpaceEventHandler(sceneR.canvas);
      var ellipsoidR = sceneR.globe.ellipsoid;
  
      handlerL.setInputAction(function (movement) {
          isLeftTrigger = true;
          isRightTrigger = false;
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  
      handlerR.setInputAction(function (movement) {
          isLeftTrigger = false;
          isRightTrigger = true;
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  
      var isLeftTrigger = false;
      var isRightTrigger = false;
  
      var syncViewerL = function () {
          if (isLeftTrigger) {
              viewerR.camera.flyTo({
                  destination: viewerL.camera.position,
                  orientation: {
                      heading: viewerL.camera.heading,
                      pitch: viewerL.camera.pitch,
                      roll: viewerL.camera.roll
                  },
                  duration: 0.0
              });
          }
  
      }
  
      viewerL.camera.changed.addEventListener(syncViewerL);
      viewerL.scene.preRender.addEventListener(syncViewerL);
  
      var syncViewerR = function () {
          if (isRightTrigger) {
              viewerL.camera.flyTo({
                  destination: viewerR.camera.position,
                  orientation: {
                      heading: viewerR.camera.heading,
                      pitch: viewerR.camera.pitch,
                      roll: viewerR.camera.roll
                  },
                  duration: 0.0
              });
          }
      }
  
      viewerL.camera.changed.addEventListener(syncViewerR);
      viewerL.scene.preRender.addEventListener(syncViewerR);
    }

    remove(){
      $('#eye').remove();
    }
}
