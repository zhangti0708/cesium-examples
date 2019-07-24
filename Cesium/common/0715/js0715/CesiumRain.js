/***
 * Cesium 下雨效果
 * 
 * @author zhangti
 * @version v1
 */


var _CesiumRain = null;
CesiumRain = function(viewer,center){
    _CesiumSnow = this;
    viewer = viewer;
    center = center;
    this.build(viewer,center);
}

CesiumRain.prototype.build = function(viewer,center){
    var lat = center.lat,lon = center.lon;
      //取消双击事件
      viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
      //设置homebutton的位置
      Cesium.Camera.DEFAULT_VIEW_RECTANGLE =
              Cesium.Rectangle.fromDegrees(lon - 1, lat - 1, lon + 1, lat + 1);//Rectangle(west, south, east, north)
      //设置初始位置
      viewer.camera.setView({
          destination: Cesium.Cartesian3.fromDegrees(lon, lat, 300000)
      });

      //定义下雨场景 着色器\\return fract(sin(x*133.3)*13.13);
      function FS_Rain() {
           return "uniform sampler2D colorTexture;\n\
                  varying vec2 v_textureCoordinates;\n\
                  \n\
                  float hash(float x){\n\
                        return fract(sin(x*23.3)*13.13);\n\
                  }\n\
                  \n\
                  void main(void){\n\
                  \n\
                      float time = czm_frameNumber / 60.0;\n\
                      vec2 resolution = czm_viewport.zw;\n\
                      \n\
                      vec2 uv=(gl_FragCoord.xy*2.-resolution.xy)/min(resolution.x,resolution.y);\n\
                      vec3 c=vec3(.6,.7,.8);\n\
                      \n\
                      float a=-.4;\n\
                      float si=sin(a),co=cos(a);\n\
                      uv*=mat2(co,-si,si,co);\n\
                      uv*=length(uv+vec2(0,4.9))*.3+1.;\n\
                      \n\
                      float v=1.-sin(hash(floor(uv.x*100.))*2.);\n\
                      float b=clamp(abs(sin(20.*time*v+uv.y*(5./(2.+v))))-.95,0.,1.)*20.;\n\
                      c*=v*b; \n\
                      \n\
                      gl_FragColor = mix(texture2D(colorTexture, v_textureCoordinates), vec4(c,1), 0.5);  \n\
                  }\n\
           ";
      }

      var collection = viewer.scene.postProcessStages;
      var fs_rain = FS_Rain();
      var snow = new Cesium.PostProcessStage({
          name: 'czm_rain',
          fragmentShader: fs_rain
      });
      collection.add(snow);

      viewer.scene.skyAtmosphere.hueShift = -0.8;
      viewer.scene.skyAtmosphere.saturationShift = -0.7;
      viewer.scene.skyAtmosphere.brightnessShift = -0.33;
      viewer.scene.fog.density = 0.001;
      viewer.scene.fog.minimumBrightness = 0.8;
}

CesiumRain.prototype.clear = function(){
    viewer.scene.postProcessStages.removeAll();
}