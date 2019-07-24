/**
 * time 2019
 * _cesium 工具类
 */
(function (window,undefined) {
    var _cesium={
        createNormalCesium:createNormalCesium
        ,addCircleScan:addCircleScan
        ,addRadarScan:addRadarScan
        ,earthRotation:earthRotation
        ,creatBrokenLine:creatBrokenLine
        ,creatParabola:creatParabola
        ,creatFlyLinesAndPoints:creatFlyLinesAndPoints
        ,initPolylineTrailLinkMaterialProperty:initPolylineTrailLinkMaterialProperty
        ,creatWall:creatWall
        ,leftCilck:leftCilck
        ,creatHtmlElement:creatHtmlElement
        ,addCircleRipple:addCircleRipple
        ,showDynamicLayer:showDynamicLayer
        ,removeDynamicLayer:removeDynamicLayer
        ,creatFlyLinesByCzml:creatFlyLinesByCzml
        ,createLightScan:createLightScan
        ,createLightScanFollowEntity:createLightScanFollowEntity
        ,echartsCombineCesium:echartsCombineCesium
        ,parabolaEquation:parabolaEquation
    };
    /**
     * 加载一个viewer，含常用地图，默认初始化属性
     * */
    function createNormalCesium(container,data){
        //使用cesium默认资源 需要的token;
        var defaultAccessToken='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzNDhhYmQxOC1mYzMwLTRhYmEtOTI5Ny1iNGExNTQ3ZTZhODkiLCJpZCI6NTQ1NCwic2NvcGVzIjpbImFzciIsImdjIl0sImlhdCI6MTU0MzM3Mzc0NH0.RU6ynAZcwQvdfygt_N_j2rb2lpsuyyROzdaLQg0emAg';
        if(data.defaultAccessToken&&data.defaultAccessToken!=''){
            defaultAccessToken=data.defaultAccessToken;
        }
        Cesium.Ion.defaultAccessToken=defaultAccessToken;

        //初始化部分参数 如果没有就是false;
        var args=["geocoder","homeButton","sceneModePicker","baseLayerPicker","navigationHelpButton","animation","timeLine","fullscreenButton","vrButton","infoBox","selectionIndicator"];
        for(var i=0;i<args.length;i++){
            if(!data[args[i]]){
                data[args[i]]=false;
            }
        }

        //创建viewer
        var viewer = new Cesium.Viewer(container,data); //cesium初始化的时候 data中的参数不存在 也没事。

        var img,label;
        //取消双击选中事件。(这个作用不大)
        viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
        //是否添加全球光照，scene(场景)中的光照将会随着每天时间的变化而变化
        if(data.globeLight&&data.globeLight==true){
            viewer.scene.globe.enableLighting = true;
        }
        //是否关闭大气效果
        if(data.showGroundAtmosphere&&data.showGroundAtmosphere==true){
            viewer.scene.globe.showGroundAtmosphere =true;
        }else{
            viewer.scene.globe.showGroundAtmosphere =false;
        }
        //地图开发者密钥
        if(!data.defaultKey||data.defaultKey==''){
            data.defaultKey='19b72f6cde5c8b49cf21ea2bb4c5b21e';
        }
        //天地图影像
        if(data.globalImagery&&data.globalImagery=="天地图"){
            viewer.imageryLayers.remove(viewer.imageryLayers.get(0));//可以先清除默认的第一个影像 bing地图影像。 当然不作处理也行
            var url="http://t0.tianditu.com/img_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=img&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles"+"&tk="+data.defaultKey;
            img= viewer.imageryLayers.addImageryProvider(new Cesium.WebMapTileServiceImageryProvider({
                url: url,
                layer: "tdtBasicLayer",
                style: "default",
                format: "image/jpeg",
                maximumLevel:18, //天地图的最大缩放级别
                tileMatrixSetID: "GoogleMapsCompatible",
                show: false
            }));
        }
        //谷歌影像
        else if(data.globalImagery&&data.globalImagery=="谷歌"){
            viewer.imageryLayers.remove(viewer.imageryLayers.get(0));//可以先清除默认的第一个影像 bing地图影像。 当然不作处理也行
            img= viewer.imageryLayers.addImageryProvider(
                new Cesium.UrlTemplateImageryProvider({
                    url: "http://mt1.google.cn/vt/lyrs=s&hl=zh-CN&x={x}&y={y}&z={z}&s=Gali"
                    ,baseLayerPicker : false
                })
            );
        }
        //arcGis影像
        else if(data.globalImagery&&data.globalImagery=="arcGis"){
            viewer.imageryLayers.remove(viewer.imageryLayers.get(0));//可以先清除默认的第一个影像 bing地图影像。 当然不作处理也行
            img= viewer.imageryLayers.addImageryProvider(
                new Cesium.ArcGisMapServerImageryProvider({
                    url : 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer'
                    ,baseLayerPicker : false
                })
            );
        }
        //高德影像
        else if(data.globalImagery&&data.globalImagery=="高德"){
            viewer.imageryLayers.remove(viewer.imageryLayers.get(0));//可以先清除默认的第一个影像 bing地图影像。 当然不作处理也行
            img= viewer.imageryLayers.addImageryProvider(
                new Cesium.UrlTemplateImageryProvider({
                    maximumLevel:18,//最大缩放级别
                    url : 'https://webst02.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}',
                    style: "default",
                    format: "image/png",
                    tileMatrixSetID: "GoogleMapsCompatible"

                })
            );
        }
        //百度影像
        else if(data.globalImagery&&data.globalImagery=="百度"){
            viewer.imageryLayers.remove(viewer.imageryLayers.get(0));//可以先清除默认的第一个影像 bing地图影像。 当然不作处理也行
            img= viewer.imageryLayers.addImageryProvider(
                new Cesium.UrlTemplateImageryProvider({
                    maximumLevel:18,//最大缩放级别
                    url: "https://ss1.bdstatic.com/8bo_dTSlR1gBo1vgoIiO_jowehsv/tile/?qt=vtile&x={x}&y={y}&z={z}&styles=pl&udt=20180810&scaler=1&showtext=1",
                })
            );
        }

        //天地图标注
        if(data.globalLabel&&data.globalLabel=="天地图"){
            var url="http://t0.tianditu.com/cia_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cia&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default.jpg"+"&tk="+data.defaultKey;
           label= viewer.imageryLayers.addImageryProvider(new Cesium.WebMapTileServiceImageryProvider({
                url:url,
                layer: "tdtAnnoLayer",
                style: "default",
                maximumLevel:18,//天地图的最大缩放级别
                format: "image/jpeg",
                tileMatrixSetID: "GoogleMapsCompatible",
                show: false
            }));
        }
        //高德标注
        else if(data.globalLabel&&data.globalLabel=="高德"){
           label=viewer.imageryLayers.addImageryProvider(
                new Cesium.UrlTemplateImageryProvider({
                    maximumLevel:18,//最大缩放级别
                    url : 'https://wprd02.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=2&style=8&ltype=11',
                    style: "default",
                    format: "image/png",
                    tileMatrixSetID: "GoogleMapsCompatible"
                })
            );
        }
        //影像亮度
        if(data.globalImageryBrightness!=undefined){
            img.brightness=data.globalImageryBrightness;
        }
        if(data.globalLabelBrightness!=undefined){
            label.brightness=data.globalLabelBrightness
        }

        return viewer;
    }

    /**
     *圆形扩大扫描圈
     * */
    function AddCircleScanPostStage(viewer, cartographicCenter, maxRadius, scanColor, duration) {
        var ScanSegmentShader =
            "uniform sampler2D colorTexture;\n" +
            "uniform sampler2D depthTexture;\n" +
            "varying vec2 v_textureCoordinates;\n" +
            "uniform vec4 u_scanCenterEC;\n" +
            "uniform vec3 u_scanPlaneNormalEC;\n" +
            "uniform float u_radius;\n" +
            "uniform vec4 u_scanColor;\n" +
            "vec4 toEye(in vec2 uv, in float depth)\n" +
            " {\n" +
            " vec2 xy = vec2((uv.x * 2.0 - 1.0),(uv.y * 2.0 - 1.0));\n" +
            " vec4 posInCamera =czm_inverseProjection * vec4(xy, depth, 1.0);\n" +
            " posInCamera =posInCamera / posInCamera.w;\n" +
            " return posInCamera;\n" +
            " }\n" +
            "vec3 pointProjectOnPlane(in vec3 planeNormal, in vec3 planeOrigin, in vec3 point)\n" +
            "{\n" +
            "vec3 v01 = point -planeOrigin;\n" +
            "float d = dot(planeNormal, v01) ;\n" +
            "return (point - planeNormal * d);\n" +
            "}\n" +
            "float getDepth(in vec4 depth)\n" +
            "{\n" +
            "float z_window = czm_unpackDepth(depth);\n" +
            "z_window = czm_reverseLogDepth(z_window);\n" +
            "float n_range = czm_depthRange.near;\n" +
            "float f_range = czm_depthRange.far;\n" +
            "return (2.0 * z_window - n_range - f_range) / (f_range - n_range);\n" +
            "}\n" +
            "void main()\n" +
            "{\n" +
            "gl_FragColor = texture2D(colorTexture, v_textureCoordinates);\n" +
            "float depth = getDepth( texture2D(depthTexture, v_textureCoordinates));\n" +
            "vec4 viewPos = toEye(v_textureCoordinates, depth);\n" +
            "vec3 prjOnPlane = pointProjectOnPlane(u_scanPlaneNormalEC.xyz, u_scanCenterEC.xyz, viewPos.xyz);\n" +
            "float dis = length(prjOnPlane.xyz - u_scanCenterEC.xyz);\n" +
            "if(dis < u_radius)\n" +
            "{\n" +
            "float f = 1.0 -abs(u_radius - dis) / u_radius;\n" +
            "f = pow(f, 4.0);\n" +
            "gl_FragColor = mix(gl_FragColor, u_scanColor, f);\n" +
            "}\n" +
            "}\n";

        var _Cartesian3Center = Cesium.Cartographic.toCartesian(cartographicCenter);
        var _Cartesian4Center = new Cesium.Cartesian4(_Cartesian3Center.x, _Cartesian3Center.y, _Cartesian3Center.z, 1);
        var _CartographicCenter1 = new Cesium.Cartographic(cartographicCenter.longitude, cartographicCenter.latitude, cartographicCenter.height + 500);
        var _Cartesian3Center1 = Cesium.Cartographic.toCartesian(_CartographicCenter1);
        var _Cartesian4Center1 = new Cesium.Cartesian4(_Cartesian3Center1.x, _Cartesian3Center1.y, _Cartesian3Center1.z, 1);
        var _time = (new Date()).getTime();
        var _scratchCartesian4Center = new Cesium.Cartesian4();
        var _scratchCartesian4Center1 = new Cesium.Cartesian4();
        var _scratchCartesian3Normal = new Cesium.Cartesian3();
        var ScanPostStage = new Cesium.PostProcessStage({
            fragmentShader: ScanSegmentShader,
            uniforms: {
                u_scanCenterEC: function () {
                    return Cesium.Matrix4.multiplyByVector(viewer.camera._viewMatrix, _Cartesian4Center, _scratchCartesian4Center);
                },
                u_scanPlaneNormalEC: function () {
                    var temp = Cesium.Matrix4.multiplyByVector(viewer.camera._viewMatrix, _Cartesian4Center, _scratchCartesian4Center);
                    var temp1 = Cesium.Matrix4.multiplyByVector(viewer.camera._viewMatrix, _Cartesian4Center1, _scratchCartesian4Center1);
                    _scratchCartesian3Normal.x = temp1.x - temp.x;
                    _scratchCartesian3Normal.y = temp1.y - temp.y;
                    _scratchCartesian3Normal.z = temp1.z - temp.z;
                    Cesium.Cartesian3.normalize(_scratchCartesian3Normal, _scratchCartesian3Normal);
                    return _scratchCartesian3Normal;

                },
                u_radius: function () {
                    return maxRadius * (((new Date()).getTime() - _time) % duration) / duration;
                },
                u_scanColor: scanColor
            }
        });
        //viewer.scene.postProcessStages.add(ScanPostStage);
        return (ScanPostStage);

    }
    function addCircleScan(viewer,data){
        viewer.scene.globe.depthTestAgainstTerrain = true; //防止移动、放大缩小会视觉偏移depthTestAgainstTerrain // 设置该属性为true之后，标绘将位于地形的顶部；如果设为false（默认值），那么标绘将位于平面上。缺陷：开启该属性有可能在切换图层时会引发标绘消失的bug。
        var CartographicCenter = new Cesium.Cartographic(Cesium.Math.toRadians(data.lon), Cesium.Math.toRadians(data.lat), 0); //中心位子
        return  AddCircleScanPostStage(viewer, CartographicCenter,data.r,data.scanColor,data.interval);
    }

    /**
     *区域雷达扫描
     * */
    function AddRadarScanPostStage(viewer, cartographicCenter, radius, scanColor, duration) {
        var ScanSegmentShader =
            "uniform sampler2D colorTexture;\n" +
            "uniform sampler2D depthTexture;\n" +
            "varying vec2 v_textureCoordinates;\n" +
            "uniform vec4 u_scanCenterEC;\n" +
            "uniform vec3 u_scanPlaneNormalEC;\n" +
            "uniform vec3 u_scanLineNormalEC;\n" +
            "uniform float u_radius;\n" +
            "uniform vec4 u_scanColor;\n" +
            "vec4 toEye(in vec2 uv, in float depth)\n" +
            " {\n" +
            " vec2 xy = vec2((uv.x * 2.0 - 1.0),(uv.y * 2.0 - 1.0));\n" +
            " vec4 posInCamera =czm_inverseProjection * vec4(xy, depth, 1.0);\n" +
            " posInCamera =posInCamera / posInCamera.w;\n" +
            " return posInCamera;\n" +
            " }\n" +
            "bool isPointOnLineRight(in vec3 ptOnLine, in vec3 lineNormal, in vec3 testPt)\n" +
            "{\n" +
            "vec3 v01 = testPt - ptOnLine;\n" +
            "normalize(v01);\n" +
            "vec3 temp = cross(v01, lineNormal);\n" +
            "float d = dot(temp, u_scanPlaneNormalEC);\n" +
            "return d > 0.5;\n" +
            "}\n" +
            "vec3 pointProjectOnPlane(in vec3 planeNormal, in vec3 planeOrigin, in vec3 point)\n" +
            "{\n" +
            "vec3 v01 = point -planeOrigin;\n" +
            "float d = dot(planeNormal, v01) ;\n" +
            "return (point - planeNormal * d);\n" +
            "}\n" +
            "float distancePointToLine(in vec3 ptOnLine, in vec3 lineNormal, in vec3 testPt)\n" +
            "{\n" +
            "vec3 tempPt = pointProjectOnPlane(lineNormal, ptOnLine, testPt);\n" +
            "return length(tempPt - ptOnLine);\n" +
            "}\n" +
            "float getDepth(in vec4 depth)\n" +
            "{\n" +
            "float z_window = czm_unpackDepth(depth);\n" +
            "z_window = czm_reverseLogDepth(z_window);\n" +
            "float n_range = czm_depthRange.near;\n" +
            "float f_range = czm_depthRange.far;\n" +
            "return (2.0 * z_window - n_range - f_range) / (f_range - n_range);\n" +
            "}\n" +
            "void main()\n" +
            "{\n" +
            "gl_FragColor = texture2D(colorTexture, v_textureCoordinates);\n" +
            "float depth = getDepth( texture2D(depthTexture, v_textureCoordinates));\n" +
            "vec4 viewPos = toEye(v_textureCoordinates, depth);\n" +
            "vec3 prjOnPlane = pointProjectOnPlane(u_scanPlaneNormalEC.xyz, u_scanCenterEC.xyz, viewPos.xyz);\n" +
            "float dis = length(prjOnPlane.xyz - u_scanCenterEC.xyz);\n" +
            "float twou_radius = u_radius * 2.0;\n" +
            "if(dis < u_radius)\n" +
            "{\n" +
            "float f0 = 1.0 -abs(u_radius - dis) / u_radius;\n" +
            "f0 = pow(f0, 64.0);\n" +
            "vec3 lineEndPt = vec3(u_scanCenterEC.xyz) + u_scanLineNormalEC * u_radius;\n" +
            "float f = 0.0;\n" +
            "if(isPointOnLineRight(u_scanCenterEC.xyz, u_scanLineNormalEC.xyz, prjOnPlane.xyz))\n" +
            "{\n" +
            "float dis1= length(prjOnPlane.xyz - lineEndPt);\n" +
            "f = abs(twou_radius -dis1) / twou_radius;\n" +
            "f = pow(f, 3.0);\n" +
            "}\n" +
            "gl_FragColor = mix(gl_FragColor, u_scanColor, f + f0);\n" +
            "}\n" +
            "}\n";

        var _Cartesian3Center = Cesium.Cartographic.toCartesian(cartographicCenter);
        var _Cartesian4Center = new Cesium.Cartesian4(_Cartesian3Center.x, _Cartesian3Center.y, _Cartesian3Center.z, 1);
        var _CartographicCenter1 = new Cesium.Cartographic(cartographicCenter.longitude, cartographicCenter.latitude, cartographicCenter.height + 500);
        var _Cartesian3Center1 = Cesium.Cartographic.toCartesian(_CartographicCenter1);
        var _Cartesian4Center1 = new Cesium.Cartesian4(_Cartesian3Center1.x, _Cartesian3Center1.y, _Cartesian3Center1.z, 1);
        var _CartographicCenter2 = new Cesium.Cartographic(cartographicCenter.longitude + Cesium.Math.toRadians(0.001), cartographicCenter.latitude, cartographicCenter.height);
        var _Cartesian3Center2 = Cesium.Cartographic.toCartesian(_CartographicCenter2);
        var _Cartesian4Center2 = new Cesium.Cartesian4(_Cartesian3Center2.x, _Cartesian3Center2.y, _Cartesian3Center2.z, 1);
        var _RotateQ = new Cesium.Quaternion();
        var _RotateM = new Cesium.Matrix3();
        var _time = (new Date()).getTime();
        var _scratchCartesian4Center = new Cesium.Cartesian4();
        var _scratchCartesian4Center1 = new Cesium.Cartesian4();
        var _scratchCartesian4Center2 = new Cesium.Cartesian4();
        var _scratchCartesian3Normal = new Cesium.Cartesian3();
        var _scratchCartesian3Normal1 = new Cesium.Cartesian3();
        var ScanPostStage = new Cesium.PostProcessStage({
            fragmentShader: ScanSegmentShader,
            uniforms: {
                u_scanCenterEC: function () {
                    return Cesium.Matrix4.multiplyByVector(viewer.camera._viewMatrix, _Cartesian4Center, _scratchCartesian4Center);
                },
                u_scanPlaneNormalEC: function () {
                    var temp = Cesium.Matrix4.multiplyByVector(viewer.camera._viewMatrix, _Cartesian4Center, _scratchCartesian4Center);
                    var temp1 = Cesium.Matrix4.multiplyByVector(viewer.camera._viewMatrix, _Cartesian4Center1, _scratchCartesian4Center1);
                    _scratchCartesian3Normal.x = temp1.x - temp.x;
                    _scratchCartesian3Normal.y = temp1.y - temp.y;
                    _scratchCartesian3Normal.z = temp1.z - temp.z;
                    Cesium.Cartesian3.normalize(_scratchCartesian3Normal, _scratchCartesian3Normal);
                    return _scratchCartesian3Normal;

                },
                u_radius: radius,
                u_scanLineNormalEC: function () {
                    var temp = Cesium.Matrix4.multiplyByVector(viewer.camera._viewMatrix, _Cartesian4Center, _scratchCartesian4Center);
                    var temp1 = Cesium.Matrix4.multiplyByVector(viewer.camera._viewMatrix, _Cartesian4Center1, _scratchCartesian4Center1);
                    var temp2 = Cesium.Matrix4.multiplyByVector(viewer.camera._viewMatrix, _Cartesian4Center2, _scratchCartesian4Center2);
                    _scratchCartesian3Normal.x = temp1.x - temp.x;
                    _scratchCartesian3Normal.y = temp1.y - temp.y;
                    _scratchCartesian3Normal.z = temp1.z - temp.z;
                    Cesium.Cartesian3.normalize(_scratchCartesian3Normal, _scratchCartesian3Normal);
                    _scratchCartesian3Normal1.x = temp2.x - temp.x;
                    _scratchCartesian3Normal1.y = temp2.y - temp.y;
                    _scratchCartesian3Normal1.z = temp2.z - temp.z;
                    var tempTime = (((new Date()).getTime() - _time) % duration) / duration;
                    Cesium.Quaternion.fromAxisAngle(_scratchCartesian3Normal, tempTime * Cesium.Math.PI * 2, _RotateQ);
                    Cesium.Matrix3.fromQuaternion(_RotateQ, _RotateM);
                    Cesium.Matrix3.multiplyByVector(_RotateM, _scratchCartesian3Normal1, _scratchCartesian3Normal1);
                    Cesium.Cartesian3.normalize(_scratchCartesian3Normal1, _scratchCartesian3Normal1);
                    return _scratchCartesian3Normal1;
                },
                u_scanColor: scanColor
            }
        });
        //viewer.scene.postProcessStages.add(ScanPostStage);
        return (ScanPostStage);

    }
    function addRadarScan(viewer,data){
        viewer.scene.globe.depthTestAgainstTerrain = true; //防止移动、放大缩小会视觉偏移depthTestAgainstTerrain // 设置该属性为true之后，标绘将位于地形的顶部；如果设为false（默认值），那么标绘将位于平面上。缺陷：开启该属性有可能在切换图层时会引发标绘消失的bug。
        var CartographicCenter = new Cesium.Cartographic(Cesium.Math.toRadians(data.lon), Cesium.Math.toRadians(data.lat),0); //中心位子
        return  AddRadarScanPostStage(viewer, CartographicCenter,data.r,data.scanColor,data.interval);
    }
    /**
     *两个圆扩散纹理
     * */
    function addCircleRipple(viewer,data){
        var r1=data.minR,r2=data.minR;

        function changeR1() { //这是callback，参数不能内传
            r1=r1+data.deviationR;
            if(r1>=data.maxR){
                r1=data.minR;
            }

            return r1;
        }
        function changeR2() {
            r2=r2+data.deviationR;
            if(r2>=data.maxR){
                r2=data.minR;
            }
            return r2;
        }
        viewer.entities.add({
            id:data.id,
            name:"",
            position:Cesium.Cartesian3.fromDegrees(data.lon,data.lat,data.height),
            ellipse : {
                semiMinorAxis :new Cesium.CallbackProperty(changeR1,false),
                semiMajorAxis :new Cesium.CallbackProperty(changeR1,false),
                height:data.height,
                material:new Cesium.ImageMaterialProperty({
                    image:data.imageUrl,
                    repeat:new Cesium.Cartesian2(1.0, 1.0),
                    transparent:true,
                    color:new Cesium.CallbackProperty(function () {
                       var alp=1-r1/data.maxR;
                        return Cesium.Color.WHITE.withAlpha(alp)  //entity的颜色透明 并不影响材质，并且 entity也会透明哦
                    },false)
                })
            }
        });
        setTimeout(function () {
            viewer.entities.add({
                name:"",
                position:Cesium.Cartesian3.fromDegrees(data.lon,data.lat,data.height),
                ellipse : {
                    semiMinorAxis :new Cesium.CallbackProperty(changeR2,false),
                    semiMajorAxis :new Cesium.CallbackProperty(changeR2,false),
                    height:data.height,
                    material:new Cesium.ImageMaterialProperty({
                        image:data.imageUrl,
                        repeat:new Cesium.Cartesian2(1.0, 1.0),
                        transparent:true,
                        color:new Cesium.CallbackProperty(function () {
                            var alp=1;
                            alp=1-r2/data.maxR;
                            return Cesium.Color.WHITE.withAlpha(alp)
                        },false)
                    })
                }
            });
        },data.eachInterval)
    }
    /**
     *地球自转展示
     * */
    function  earthRotation(viewer,maxHeight){
        var i = Date.now();
        function rotate() {
            var a = .1;
            var t = Date.now();
            var n = (t - i) / 1e3;
            i = t;
            viewer.scene.camera.rotate(Cesium.Cartesian3.UNIT_Z, -a * n);
        }
        viewer.clock.onTick.addEventListener(rotate);
        // //  监听鼠标，当高度小于多少的时候 取消自转
        // var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
        // handler.setInputAction(function(wheelment) {
        //     var height =Math.ceil(viewer.camera.positionCartographic.height);//取整数
        //     if(height<maxHeight){
        //         viewer.clock.onTick.removeEventListener(rotate);
        //     }else{
        //         viewer.clock.onTick.addEventListener(rotate);
        //     }
        // }, Cesium.ScreenSpaceEventType.WHEEL);

        //监听视角变化，来判断
        viewer.camera.changed.addEventListener(function () {
            var height =Math.ceil(viewer.camera.positionCartographic.height);//取整数
            if(height<maxHeight){
                viewer.clock.onTick.removeEventListener(rotate);
            }else{
                viewer.clock.onTick.addEventListener(rotate);
            }
        });//监听视角移动/变化
    }

    //流动特效
    function initPolylineTrailLinkMaterialProperty(data){
        function PolylineTrailLinkMaterialProperty(color, duration) {
            this._definitionChanged = new Cesium.Event();
            this._color = undefined;
            this._colorSubscription = undefined;
            this.color = color;
            this.duration = duration;
            this._time = (new Date()).getTime();
        }
        Cesium.defineProperties(PolylineTrailLinkMaterialProperty.prototype, {
            isConstant: {
                get: function () {
                    return false;
                }
            },
            definitionChanged: {
                get: function () {
                    return this._definitionChanged;
                }
            },
            color: Cesium.createPropertyDescriptor('color')
        });
        PolylineTrailLinkMaterialProperty.prototype.getType = function (time) {
            return 'PolylineTrailLink';
        }
        PolylineTrailLinkMaterialProperty.prototype.getValue = function (time, result) {
            if (!Cesium.defined(result)) {
                result = {};
            }
            result.color = Cesium.Property.getValueOrClonedDefault(this._color, time, Cesium.Color.WHITE, result.color);
            result.image = Cesium.Material.PolylineTrailLinkImage;
            result.time = (((new Date()).getTime() - this._time) % this.duration) / this.duration;
            return result;
        }
        PolylineTrailLinkMaterialProperty.prototype.equals = function (other) {
            return this === other ||
                (other instanceof PolylineTrailLinkMaterialProperty &&
                    Property.equals(this._color, other._color))
        };
        Cesium.PolylineTrailLinkMaterialProperty = PolylineTrailLinkMaterialProperty;
        Cesium.Material.PolylineTrailLinkType = 'PolylineTrailLink';
        Cesium.Material.PolylineTrailLinkImage = data.flowImage;//图片
        Cesium.Material.PolylineTrailLinkSource = "czm_material czm_getMaterial(czm_materialInput materialInput)\n\
                                                       {\n\
                                                            czm_material material = czm_getDefaultMaterial(materialInput);\n\
                                                            vec2 st = materialInput.st;\n\
                                                            vec4 colorImage = texture2D(image, vec2(fract(st.s - time), st.t));\n\
                                                            material.alpha = colorImage.a * color.a;\n\
                                                            material.diffuse = (colorImage.rgb+color.rgb)/2.0;\n\
                                                            return material;\n\
                                                        }";
        // material.alpha:透明度;material.diffuse：颜色;
        Cesium.Material._materialCache.addMaterial(Cesium.Material.PolylineTrailLinkType, {
            fabric: {
                type: Cesium.Material.PolylineTrailLinkType,
                uniforms: {
                    color: new Cesium.Color(1.0, 0.0, 0.0, 0.5),
                    image: Cesium.Material.PolylineTrailLinkImage,
                    time: 0
                },
                source: Cesium.Material.PolylineTrailLinkSource
            },
            translucent: function (material) {
                return true;
            }
        });
    }
    //抛物线方程
    function parabolaEquation(options, resultOut) {
        //方程 y=-(4h/L^2)*x^2+h h:顶点高度 L：横纵间距较大者
        var h = options.height && options.height > 5000 ? options.height : 5000;
        var L = Math.abs(options.pt1.lon - options.pt2.lon) > Math.abs(options.pt1.lat - options.pt2.lat) ? Math.abs(options.pt1.lon - options.pt2.lon) : Math.abs(options.pt1.lat - options.pt2.lat);
        var num = options.num && options.num > 50 ? options.num : 50;
        var result = [];
        var dlt = L / num;
        if (Math.abs(options.pt1.lon - options.pt2.lon) > Math.abs(options.pt1.lat - options.pt2.lat)) {//以lon为基准
            var delLat = (options.pt2.lat - options.pt1.lat) / num;
            if (options.pt1.lon - options.pt2.lon > 0) {
                dlt = -dlt;
            }
            for (var i = 0; i < num; i++) {
                var tempH = h - Math.pow((-0.5 * L + Math.abs(dlt) * i), 2) * 4 * h / Math.pow(L, 2);
                var lon = options.pt1.lon + dlt * i;
                var lat = options.pt1.lat + delLat * i;
                result.push([lon, lat, tempH]);
            }
        } else {//以lat为基准
            var delLon = (options.pt2.lon - options.pt1.lon) / num;
            if (options.pt1.lat - options.pt2.lat > 0) {
                dlt = -dlt;
            }
            for (var i = 0; i < num; i++) {
                var tempH = h - Math.pow((-0.5 * L + Math.abs(dlt) * i), 2) * 4 * h / Math.pow(L, 2);
                var lon = options.pt1.lon + delLon * i;
                var lat = options.pt1.lat + dlt * i;
                result.push([lon, lat, tempH]);
            }
        }
        if (resultOut != undefined) {
            resultOut = result;
        }
        return result;
    }
    /**
     * (流动)折线
     * */
    function creatBrokenLine(viewer,data) {
        if(data.flowing==true){
            initPolylineTrailLinkMaterialProperty(data);
            var str1=data.options.polyline.material[0];
            var str2=data.options.polyline.material[1];
            data.options.polyline.material=new Cesium.PolylineTrailLinkMaterialProperty(str1,str2);
        }
        viewer.entities.add(data.options);

    }
    /**
     * (流动)抛物线
     * */
    function creatParabola(viewer,data) {
        var material = null;
        var center=data.center;//起始点
        var cities=data.points;//可以为多组哦！
        if(data.flowing==true){
            if (material != null) { } else {
                initPolylineTrailLinkMaterialProperty(data);
                var str1=data.options.polyline.material[0];
                var str2=data.options.polyline.material[1];
                data.options.polyline.material=new Cesium.PolylineTrailLinkMaterialProperty(str1,str2);
            }
        }
        for (var j = 0; j < cities.length; j++) {
            var points = parabolaEquation({ pt1: center, pt2: cities[j], height: data.height, num: 100 });
            var pointArr = [];
            for (var i = 0; i < points.length; i++) {
                pointArr.push(points[i][0],points[i][1],points[i][2]);
            }
            data.options.polyline.positions=Cesium.Cartesian3.fromDegreesArrayHeights(pointArr);
            viewer.entities.add(data.options);
        }
    }

    /**
     * (流动)墙
     * */
    function creatWall(viewer,data) {
        if(data.flowing==true){
            initPolylineTrailLinkMaterialProperty(data);
            var str1=data.options.wall.material[0];
            var str2=data.options.wall.material[1];
            data.options.wall.material=new Cesium.PolylineTrailLinkMaterialProperty(str1,str2);
        }
        viewer.entities.add(data.options);
    }

    /**
     *多飞行的线和点。
     * */
    function creatFlyLinesAndPoints(viewer,initData,callback) {
        viewer.scene.globe.depthTestAgainstTerrain =false; // 设置该属性为true之后，标绘将位于地形的顶部；如果设为false（默认值），那么标绘将位于平面上。缺陷：开启该属性有可能在切换图层时会引发标绘消失的bug。
        viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK); //取消双击事件 ，双击的话，会视角直接切到该实体，且无法拖拽

        //创建线
        creatParabola(viewer,initData);

        //创建点
        var center = initData.center;
        var cities =initData.points;
        /*   ***********  这个可以修改成其他实体  *********** **/
        //中心点
        viewer.entities.add({
            id:center.id,
            position: Cesium.Cartesian3.fromDegrees(center.lon, center.lat, 0),
            point: {
                pixelSize:center.size,
                color: center.color,
            }
        });
        //散点
        for (var i = 0; i < cities.length; i++) {
            viewer.entities.add({
                id: cities[i].id,
                position: Cesium.Cartesian3.fromDegrees(cities[i].lon, cities[i].lat, 1),
                point: {
                    pixelSize: cities[i].size,
                    color:cities[i].color
                }
            });
        }
        /*   ***********  这个可以修改成其他实体  *********** **/

        leftCilck(viewer,callback);
    }
    /**
     * czml方法创建飞行路径线+抛物线函数
     */
    function creatFlyLinesByCzml(viewer,data){
        viewer.shouldAnimate=true;
        var center=data.center,cities=data.points;
        var dsArr=[];
        for (var j = 0; j < cities.length; j++) {
            var czml =[
                {
                    "id" : "document",
                    "name" : "CZML Path",
                    "version" : "1.0",
                    "clock": { //定时
                        "interval": "2019-05-27T10:00:00Z/2019-05-27T10:16:50Z", // 990/60=16.5
                        "currentTime": "2019-05-27T10:00:00Z",//当前时间
                        "multiplier": data.multiplier //动画的速度倍数
                    }
                },
                {
                    "id" : "path",
                    "name" : "path with GPS flight data",
                    "description" : "<p>Hang gliding flight log data from Daniel H. Friedman.<br>Icon created by Larisa Skosyrska from the Noun Project</p>",
                    "availability" : "2019-05-27T10:00:00Z/2019-05-27T10:16:50Z",
                    "path" : {
                        "material" : { //线的材质
                            "polylineOutline" : {
                                "color" : {
                                    "rgba" : data.lineColor
                                },
                                "outlineColor" : {
                                    "rgba" : [0, 0, 0, 0]
                                },
                                "outlineWidth" : 0
                            }
                        },//路线的材质
                        "width" : 2, //线的宽度
                        "leadTime" :990,
                        "trailTime" : 990,
                        "resolution" : 5 //分辨率
                    },
                    "billboard" : { //加billboard 也可以加载其他entity cesium会自己解析
                        "image":data.image,
                        "scale": 0.5,
                        "eyeOffset": {
                            "cartesian": [ 0.0, 0.0, -10.0]
                        }
                    },
                    "position" : {
                        "epoch" : "2019-05-27T10:00:00Z",//动画起始时间
                        "cartographicDegrees" :[],
                    }
                }];
            var points = parabolaEquation({ pt1: center, pt2: cities[j],height:data.height,num: 100 });//100个点
            var pointArr =[];
            for (var i = 0;i < points.length; i++) {
                pointArr.push(0+i*10,points[i][0],points[i][1],points[i][2]);//0+i*10;表示距离
            }
            czml[1].position.cartographicDegrees=pointArr;
            if(cities[j].image){
                czml[1].billboard.image=cities[j].image;
            }
            viewer.dataSources.add(Cesium.CzmlDataSource.load(czml)).then(function(ds) {
                dsArr.push(ds);
            });
        }

        return dsArr;
    }
    /**
     * 左击事件, 主动屏蔽了 name=yscNoNeedEntity的实体,并返回实体的id
     */
    function leftCilck(viewer,callback){
        if(callback){
            new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas).setInputAction(function (e) {
                var obj = viewer.scene.pick(e.position);
                console.log(obj);
                if (Cesium.defined(obj)) {
                    var str=obj.id._name;
                    if(str=="yscNoNeedEntity")
                        return
                    callback(obj.id._id);
                }
            },Cesium.ScreenSpaceEventType.LEFT_CLICK);
        }
    }

    /**
     * 创建一个 htmlElement元素 并且，其在earth背后会自动隐藏
     */
    function creatHtmlElement(viewer,element,position,arr,flog){
        var scratch = new Cesium.Cartesian2(); //cesium二维笛卡尔 笛卡尔二维坐标系就是我们熟知的而二维坐标系；三维也如此
        var scene=viewer.scene,camera=viewer.camera;
            scene.preRender.addEventListener(function() {
            var canvasPosition =scene.cartesianToCanvasCoordinates(position, scratch);//cartesianToCanvasCoordinates 笛卡尔坐标（3维度）到画布坐标
            if (Cesium.defined(canvasPosition)) {
                element.css({
                    // top:canvasPosition.y,
                    // left:canvasPosition.x
                    left:canvasPosition.x+arr[0],
                    top:canvasPosition.y+arr[1]
                });
                /* 此处进行判断**/// var px_position = Cesium.SceneTransforms.wgs84ToWindowCoordinates(scene, cartesian);
                if(flog&&flog==true){
                    var e = position, i = camera.position, n = scene.globe.ellipsoid.cartesianToCartographic(i).height;
                    if (!(n += 1 * scene.globe.ellipsoid.maximumRadius, Cesium.Cartesian3.distance(i, e) > n)) {
                        element.show();
                    } else {
                        element.hide();
                    }
                }
                /* 此处进行判断**/
            }
        });
    }

    /**
     * 创建一个动态实体弹窗
     */
    function showDynamicLayer(viewer,data,callback){
        var element=data.element,lon=data.lon,lat=data.lat;
        var sStartFlog=false;
        setTimeout(function () {
            sStartFlog=true;
        },300);
        var s1=0.001,s2=s1,s3=s1,s4=s1;
        /* 弹窗的dom操作--默认必须*/
        element.css({opacity:0}); //使用hide()或者display是不行的 因为cesium是用pre定时重绘的div导致 left top display 会一直重绘
        $(".ysc-dynamic-layer .line").css({width:0});
        element.find(".main").hide(0);
        /* 弹窗的dom操作--针对性操作*/
        callback();

        if(data.addEntity){
            var rotation = Cesium.Math.toRadians(30);
            var rotation2 = Cesium.Math.toRadians(30);
            function getRotationValue() {
                rotation += 0.05;
                return rotation;
            }
            function getRotationValue2() {
                rotation2-= 0.03;
                return rotation2;
            }
            //如果有实体存在 先清除实体;
            //如果有实体存在 先清除实体;
            viewer.entities.removeById(data.layerId+"_1");
            viewer.entities.removeById(data.layerId+"_2");
            viewer.entities.removeById(data.layerId+"_3");
            //构建entity
            var height=data.boxHeight,heightMax=data.boxHeightMax,heightDif=data.boxHeightDif;
            var goflog=true;
            //添加正方体
            viewer.entities.add({
                id:data.layerId+"_1",
                name: "立方体盒子",
                position: new Cesium.CallbackProperty(function () {
                    height=height+heightDif;
                    if(height>=heightMax){
                        height=heightMax;
                    }
                    return Cesium.Cartesian3.fromDegrees(lon,lat,height/2)
                },false),
                box: {
                    dimensions:  new Cesium.CallbackProperty(function () {
                        height=height+heightDif;
                        if(height>=heightMax){
                            height=heightMax;
                            if(goflog){//需要增加判断 不然它会一直执行; 导致对div的dom操作 会一直重复
                                addLayer();//添加div弹窗
                                goflog=false;
                            }
                        }
                        return  new Cesium.Cartesian3(data.boxSide,data.boxSide, height)
                    },false),
                    material:data.boxMaterial
                }
            });
            //添加底座一 外环
            viewer.entities.add({
                id:data.layerId+"_2",
                name:"椭圆",
                position :  Cesium.Cartesian3.fromDegrees(lon,lat),
                ellipse : {
                    // semiMinorAxis :data.circleSize, //直接这个大小 会有一个闪白的材质 因为cesium材质默认是白色 所以我们先将大小设置为0
                    // semiMajorAxis : data.circleSize,
                    semiMinorAxis:new Cesium.CallbackProperty(function () {
                        if(sStartFlog){
                            s1=s1+data.circleSize/20;
                            if(s1>=data.circleSize){
                                s1=data.circleSize;
                            }
                        }
                        return s1;
                    },false),
                    semiMajorAxis:new Cesium.CallbackProperty(function () {
                        if(sStartFlog) {
                            s2 = s2 + data.circleSize / 20;
                            if (s2 >= data.circleSize) {
                                s2 = data.circleSize;
                            }
                        }
                        return s2;
                    },false),
                    material:"../ysc/images/circle2.png",
                    rotation: new Cesium.CallbackProperty(getRotationValue, false),
                    stRotation: new Cesium.CallbackProperty(getRotationValue, false),
                    zIndex:2,
                }
            });
            //添加底座二 内环
            viewer.entities.add({
                id:data.layerId+"_3",
                name:"椭圆",
                position :  Cesium.Cartesian3.fromDegrees(lon,lat),
                ellipse : {
                    semiMinorAxis:new Cesium.CallbackProperty(function () {
                        if(sStartFlog){
                            s3=s3+data.circleSize/20;
                            if(s3>=data.circleSize/2){
                                s3=data.circleSize/2;
                            }}
                        return s3;
                    },false),
                    semiMajorAxis:new Cesium.CallbackProperty(function () {
                        if(sStartFlog) {
                            s4 = s4 + data.circleSize / 20;
                            if (s4 >= data.circleSize / 2) {
                                s4 = data.circleSize / 2;
                            }
                        }
                        return s4;
                    },false),
                    material:"../ysc/images/circle1.png",
                    rotation: new Cesium.CallbackProperty(getRotationValue2, false),
                    stRotation: new Cesium.CallbackProperty(getRotationValue2, false),
                    zIndex:3
                }
            });
        }else{
            addLayer();//添加div弹窗
        }

        function addLayer() {
            //添加div
            var divPosition= Cesium.Cartesian3.fromDegrees(lon,lat,data.boxHeightMax);//data.boxHeightMax为undef也没事
            element.css({opacity:1});
            element.find(".line").animate({
                width:50//线的宽度
            },500,function () {
                element.find(".main").fadeIn(500)
            });
            ysc.creatHtmlElement(viewer,element,divPosition,[10,-(parseInt(element.css("height")))],true); //当为true的时候，表示当element在地球背面会自动隐藏。默认为false，置为false，不会这样。但至少减轻判断计算压力
        }
    }
    /**
     * 移除动态弹窗 为了方便 这里的移除 是真的移除，因此 到时是需要重建弹窗的doom的;
     */
    function removeDynamicLayer(viewer,data){
        viewer.entities.removeById(data.layerId+"_1");
        viewer.entities.removeById(data.layerId+"_2");
        viewer.entities.removeById(data.layerId+"_3");
        data.element.remove();
    }
    /**
     * 添加自定义灯光扫描;
     */
    /*
    * 求圆周上等分点的坐标
    * ox,oy为圆心坐标
    * r为半径
    * count为等分个数
    */
    function createLightScan_getCirclePoints(r, ox, oy, count){
        var point = []; //结果
        var radians = (Math.PI / 180) * Math.round(360 / count), //弧度
            i = 0;
        for(; i < count; i++){
            var x = ox + r * Math.sin(radians * i),
                y = oy + r * Math.cos(radians * i);
            point.unshift({x:x,y:y}); //为保持数据顺时针
        }
        return point;
    }
    //生成 entityCList面--形成圆锥
    function createLightScan_entityCList(viewer,point,data) {
        var lon=data.observer[0],lat=data.observer[1],h=data.observer[2];
        var entityCList=[];
        //创建 面
        for(var i=0;i<point.length;i++){
            // viewer.entities.add({ //切割的点
            //     position : Cesium.Cartesian3.fromDegrees(point[i].x,point[i].y),
            //     point : {
            //         color : Cesium.Color.RED,
            //         pixelSize : 8
            //     }
            // });
            var  hierarchy;
            if(i==(point.length-1)){
                hierarchy=new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArrayHeights(
                    [
                        lon,lat,h,
                        point[i].x,point[i].y,0,
                        point[0].x,point[0].y,0
                    ]))
            }else{
                hierarchy=new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArrayHeights(
                    [
                        lon,lat,h,
                        point[i].x,point[i].y,0,
                        point[i+1].x,point[i+1].y,0
                    ]))
            }

            var entityC= viewer.entities.add({
                name:"三角形",
                polygon : {
                    hierarchy:hierarchy,
                    outline : false,
                    perPositionHeight:true,//允许三角形使用点的高度
                    material :data.material
                }
            });
            entityCList.push(entityC);
        }

        return entityCList
    }
    //改变所有面的位置
    function createLightScan_changeAllPosition(data,entityCList,point){
        //改变每个面的位置
        for(var i=0;i<entityCList.length;i++){
            if(i!=entityCList.length-1){
                createLightScan_changeOnePosition(data,entityCList[i],[point[i].x, point[i].y, point[i+1].x, point[i+1].y]); //中间arr 代表的是点的坐标
            }else{
                createLightScan_changeOnePosition(data,entityCList[i],[point[i].x, point[i].y, point[0].x, point[0].y]);
            }
        }
    }
    //改变每个面的位置
    function createLightScan_changeOnePosition(data,entity,arr){
        var positionList=data.positionList;
        var x,y,x0,y0,X0,Y0,n=0,a=0;//x代表差值 x0代表差值等分后的值，X0表示每次回调改变的值。a表示回调的循环窜次数，n表示扫描的坐标个数
        function f(i){
            x= positionList[i+1][0]-positionList[i][0];//差值
            y= positionList[i+1][1]-positionList[i][1];//差值
            x0=x/data.number;//将差值等分500份
            y0=y/data.number;
            a=0;
        }
        f(n);
        entity.polygon.hierarchy=new Cesium.CallbackProperty(function () { //回调函数
            if((Math.abs(X0)>=Math.abs(x))&&(Math.abs(Y0)>=Math.abs(y))){ //当等分差值大于等于差值的时候 就重新计算差值和等分差值  Math.abs
                n=n+1;
                if(n==positionList.length-1){
                    n=0;
                }
                arr[0]= arr[0]+X0;
                arr[1]= arr[1]+Y0;
                arr[2]= arr[2]+X0;
                arr[3]= arr[3]+Y0;
                f(n);//重新赋值 x y x0 y0
            }
            X0=a*x0;//将差值的等份逐渐递增。直到大于差值 会有精度丢失,所以扩大再加 x0=x0+0.0001
            Y0=a*y0;//将差值的等份逐渐递增。直到大于差值 会有精度丢失,所以扩大再加
            a++;
            return  new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArrayHeights(
                [
                    data.observer[0],data.observer[1],data.observer[2],
                    arr[0]+X0,arr[1]+Y0,0,
                    arr[2]+X0,arr[3]+Y0,0
                ]))
        },false)
    }
    //主函数 灯光随着打点坐标变化
    function createLightScan(viewer,data){
        //生成分割点
        var point=createLightScan_getCirclePoints(data.circle[0],data.circle[1],data.circle[2],data.circle[3]);
        //生成 entityCList 圆锥
        var entityCList=createLightScan_entityCList(viewer,point,data);
        //运行
        createLightScan_changeAllPosition(data,entityCList,point);
        return entityCList;
    }
    //主函数  灯光随着模型变化
    function createLightScanFollowEntity(viewer,data,model){
        //生成分割点
        var point=createLightScan_getCirclePoints(data.circle[0],data.circle[1],data.circle[2],data.circle[3]);
        //生成 entityCList 圆锥
        var entityCList=createLightScan_entityCList(viewer,point,data);

        // 实时获取模型的经纬度。
        viewer.scene.postRender.addEventListener(function () {
            var center =model.position.getValue(viewer.clock.currentTime);//获取模型当前位置 //世界坐标（笛卡尔坐标）
            if(center){
                var ellipsoid=viewer.scene.globe.ellipsoid;
                var cartographic=ellipsoid.cartesianToCartographic(center);
                var lon=Cesium.Math.toDegrees(cartographic.longitude);
                var lat=Cesium.Math.toDegrees(cartographic.latitude);
                //var height=cartographic.height;
                //console.log(lon+";"+lat+";"+height);
                var X0=lon-data.circle[1],Y0=lat-data.circle[2]; //差值
                for(var i=0;i<entityCList.length;i++){
                    if(i==(entityCList.length-1)){
                        f(entityCList[i],[point[i].x, point[i].y, point[0].x, point[0].y],X0,Y0);
                    }else{
                        f(entityCList[i],[point[i].x, point[i].y, point[i+1].x, point[i+1].y],X0,Y0);
                    }
                }
            }
        });
        //修改每一个entity
        function f(entity,arr,X0,Y0) {
            entity.polygon.hierarchy=new Cesium.CallbackProperty(function () { //回调函数
                return  new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArrayHeights(
                    [
                        data.observer[0],data.observer[1],data.observer[2],//观察点
                        arr[0]+X0,arr[1]+Y0,0,
                        arr[2]+X0,arr[3]+Y0,0
                    ]))
            },false)
        }
        return entityCList;
    }
    /**
     * cesium结合echarts
     * */
    function echartsCombineCesium(viewer,option){
        //坐标转换及事件监听
        (function(e) {
            var t = {};
            function n(r) {
                if (t[r]) return t[r].exports;
                var i = t[r] = {
                    i: r,
                    l: !1,
                    exports: {}
                };
                return e[r].call(i.exports, i, i.exports, n),
                    i.l = !0,
                    i.exports
            }
            n.m = e,
                n.c = t,
                n.d = function(e, t, r) {
                    n.o(e, t) || Object.defineProperty(e, t, {
                        enumerable: !0,
                        get: r
                    })
                },
                n.r = function(e) {
                    "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(e, Symbol.toStringTag, {
                        value: "Module"
                    }),
                        Object.defineProperty(e, "__esModule", {
                            value: !0
                        })
                },
                n.t = function(e, t) {
                    if (1 & t && (e = n(e)), 8 & t) return e;
                    if (4 & t && "object" == typeof e && e && e.__esModule) return e;
                    var r = Object.create(null);
                    if (n.r(r), Object.defineProperty(r, "default", {
                        enumerable: !0,
                        value: e
                    }), 2 & t && "string" != typeof e) for (var i in e) n.d(r, i,
                        function(t) {
                            return e[t]
                        }.bind(null, i));
                    return r
                },
                n.n = function(e) {
                    var t = e && e.__esModule ?
                        function() {
                            return e.
                                default
                        }:
                        function() {
                            return e
                        };
                    return n.d(t, "a", t),
                        t
                },
                n.o = function(e, t) {
                    return Object.prototype.hasOwnProperty.call(e, t)
                },
                n.p = "",
                n(n.s = 0)
        })([function(e, t, n) {e.exports = n(1)},function(e, t, n) {
            echarts ? n(2).load() : console.error("missing echarts lib")
        },function(e, t, n) {
            "use strict";
            function r(e, t) {
                for (var n = 0; n < t.length; n++) {
                    var r = t[n];
                    r.enumerable = r.enumerable || !1,
                        r.configurable = !0,
                    "value" in r && (r.writable = !0),
                        Object.defineProperty(e, r.key, r)
                }
            }
            n.r(t);
            var i = function() {
                function e(t, n) { !
                    function(e, t) {
                        if (! (e instanceof t)) throw new TypeError("Cannot call a class as a function")
                    } (this, e),
                    this._viewer = t,
                    this.dimensions = ["lng", "lat"],
                    this._mapOffset = [0, 0],
                    this._api = n
                }
                var t, n, i;
                return t = e,
                    i = [{
                        key: "create",
                        value: function(t, n) {
                            var r;
                            t.eachComponent("GLMap",
                                function(t) { (r = new e(echarts.cesiumViewer, n)).setMapOffset(t.__mapOffset || [0, 0]),
                                    t.coordinateSystem = r
                                }),
                                t.eachSeries(function(e) {
                                    "GLMap" === e.get("coordinateSystem") && (e.coordinateSystem = r)
                                })
                        }
                    },
                        {
                            key: "dimensions",
                            get: function() {
                                return ["lng", "lat"]
                            }
                        }],
                (n = [{
                    key: "setMapOffset",
                    value: function(e) {
                        return this._mapOffset = e,
                            this
                    }
                },
                    {
                        key: "getViewer",
                        value: function() {
                            return this._viewer
                        }
                    },
                    {
                        key: "dataToPoint",
                        value: function(e) {
                            var t = this._viewer.scene,
                                n = [0, 0],
                                r = Cesium.Cartesian3.fromDegrees(e[0], e[1]);
                            if (!r) return n;
                            if (t.mode === Cesium.SceneMode.SCENE3D && Cesium.Cartesian3.angleBetween(t.camera.position, r) > Cesium.Math.toRadians(80)) return ! 1;
                            var i = t.cartesianToCanvasCoordinates(r);
                            return i ? [i.x - this._mapOffset[0], i.y - this._mapOffset[1]] : n
                        }
                    },
                    {
                        key: "pointToData",
                        value: function(e) {
                            var t = this._mapOffset,
                                n = viewer.scene.globe.ellipsoid,
                                r = new Cesium.cartesian3(e[1] + t, e[2] + t[2], 0),
                                i = n.cartesianToCartographic(r);
                            return [i.lng, i.lat]
                        }
                    },
                    {
                        key: "getViewRect",
                        value: function() {
                            var e = this._api;
                            return new echarts.graphic.BoundingRect(0, 0, e.getWidth(), e.getHeight())
                        }
                    },
                    {
                        key: "getRoamTransform",
                        value: function() {
                            return echarts.matrix.create()
                        }
                    }]) && r(t.prototype, n),
                i && r(t, i),
                    e
            } ();
            echarts.extendComponentModel({
                type: "GLMap",
                getViewer: function() {
                    return echarts.cesiumViewer
                },
                defaultOption: {
                    roam: !1
                }
            }),
                echarts.extendComponentView({
                    type: "GLMap",
                    init: function(e, t) {
                        this.api = t,
                            echarts.cesiumViewer.scene.postRender.addEventListener(this.moveHandler, this)
                    },
                    moveHandler: function(e, t) {
                        this.api.dispatchAction({
                            type: "GLMapRoam"
                        })
                    },
                    render: function(e, t, n) {},
                    dispose: function(e) {
                        echarts.cesiumViewer.scene.postRender.removeEventListener(this.moveHandler, this)
                    }
                });
            function a() {
                echarts.registerCoordinateSystem("GLMap", i),
                    echarts.registerAction({
                            type: "GLMapRoam",
                            event: "GLMapRoam",
                            update: "updateLayout"
                        },
                        function(e, t) {})
            }
            n.d(t, "load",
                function() {
                    return a
                })
        }]);

        //开始
        echarts.cesiumViewer = viewer;
        function CesiumEcharts(t, e) {
            this._mapContainer = t;
            this._overlay = this._createChartOverlay();
            this._overlay.setOption(e)
        }
        CesiumEcharts.prototype._createChartOverlay = function() {
            var t = this._mapContainer.scene;
            t.canvas.setAttribute('tabIndex', 0);
            var e = document.createElement('div');
            e.style.position = 'absolute';
            e.style.top = '0px';
            e.style.left = '0px';
            e.style.width = t.canvas.width + 'px';
            e.style.height = t.canvas.height + 'px';
            e.style.pointerEvents = 'none';
            e.setAttribute('id','ys-cesium-echarts');
            e.setAttribute('class', 'echartMap');
            this._mapContainer.container.appendChild(e);

            this._echartsContainer = e;

            return echarts.init(e)
        };
        CesiumEcharts.prototype.dispose = function() {
            this._echartsContainer && (this._mapContainer.container.removeChild(this._echartsContainer), (this._echartsContainer = null)), this._overlay && (this._overlay.dispose(), (this._overlay = null))
        };
        CesiumEcharts.prototype.updateOverlay = function(t) {
            this._overlay && this._overlay.setOption(t)
        };
        CesiumEcharts.prototype.getMap = function() {
            return this._mapContainer
        };
        CesiumEcharts.prototype.getOverlay = function() {
            return this._overlay
        };
        CesiumEcharts.prototype.show = function() {
            document.getElementById(this._id).style.visibility = 'visible'
        };
        CesiumEcharts.prototype.hide = function() {
            document.getElementById(this._id).style.visibility = 'hidden'
        };

        new CesiumEcharts(viewer,option);
        // return CesiumEcharts
    }

    window._cesium=_cesium;

})(window);