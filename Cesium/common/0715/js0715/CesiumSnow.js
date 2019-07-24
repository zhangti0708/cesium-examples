/***
 * Cesium 雪花效果
 * 
 * @author zhangti
 * @version v1
 */


var _CesiumSnow = null;
CesiumSnow = function(viewer,center){
    _CesiumSnow = this;
    viewer = viewer;
    center = center;
    this.build(viewer,center);
}

CesiumSnow.prototype.build = function(viewer,center){
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

     //定义下雪场景 着色器
     function FS_Snow() {
        return "uniform sampler2D colorTexture;\n\
            varying vec2 v_textureCoordinates;\n\
            \n\
            float snow(vec2 uv,float scale)\n\
            {\n\
            float time = czm_frameNumber / 60.0;\n\
            float w=smoothstep(1.,0.,-uv.y*(scale/10.));if(w<.1)return 0.;\n\
            uv+=time/scale;uv.y+=time*2./scale;uv.x+=sin(uv.y+time*.5)/scale;\n\
            uv*=scale;vec2 s=floor(uv),f=fract(uv),p;float k=3.,d;\n\
            p=.5+.35*sin(11.*fract(sin((s+p+scale)*mat2(7,3,6,5))*5.))-f;d=length(p);k=min(d,k);\n\
            k=smoothstep(0.,k,sin(f.x+f.y)*0.01);\n\
            return k*w;\n\
            }\n\
            \n\
            void main(void){\n\
            vec2 resolution = czm_viewport.zw;\n\
            vec2 uv=(gl_FragCoord.xy*2.-resolution.xy)/min(resolution.x,resolution.y);\n\
            vec3 finalColor=vec3(0);\n\
            float c = 0.0;\n\
            c+=snow(uv,30.)*.0;\n\
            c+=snow(uv,20.)*.0;\n\
            c+=snow(uv,15.)*.0;\n\
            c+=snow(uv,10.);\n\
            c+=snow(uv,8.);\n\
            c+=snow(uv,6.);\n\
            c+=snow(uv,5.);\n\
            finalColor=(vec3(c)); \n\
            gl_FragColor = mix(texture2D(colorTexture, v_textureCoordinates), vec4(finalColor,1), 0.3); \n\
            \n\
            }\n\
            ";
            }


     var collection = viewer.scene.postProcessStages;
     var fs_snow = FS_Snow();
     var snow = new Cesium.PostProcessStage({
         name: 'czm_snow',
         fragmentShader: fs_snow
         
     });
     collection.add(snow);

     //viewer.scene.skyAtmosphere.hueShift = -0.8;
     //viewer.scene.skyAtmosphere.saturationShift = -0.7;
     viewer.scene.skyAtmosphere.brightnessShift = -0.33;//大气圈亮度 
     //viewer.scene.fog.density = 0.001;
     viewer.scene.fog.minimumBrightness = 0.8;//0.8
}
/**
 * 供外部接口
 * 改参
 */
CesiumSnow.prototype.setData = function(obj){

    if(snow === null)return;



}

CesiumSnow.prototype.clear = function(){
    viewer.scene.postProcessStages.removeAll();
}