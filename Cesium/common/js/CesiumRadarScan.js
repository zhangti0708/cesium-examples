/***
 * cesium 雷达扫描
 * @author zhangti
 * @version v1
 */
var cesiumRadarScan = null;
CesiumRadarScan = function(){
    cesiumRadarScan = this;
}

/**
 * 初始化雷达对象
 * @author zhangti
 */
CesiumRadarScan.prototype.init = function(param){
    if(null === param || undefined === param)return;
    var t = this;
    for(var key in param){
        t[key] = param[key];
    }
}

/**
 * 配置环境
 * 需要引入Cesium.js
 * @author zhangti
 */
CesiumRadarScan.prototype.config = function(param){
    var viewer = this.viewer;
    //显示帧数
    viewer.scene.globe.depthTestAgainstTerrain = true;
    //取消双击事件
    viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    //primitives 绘制3d地形
    /* var tileset = viewer.scene.primitives.add(new Cesium.Cesium3DTileset({
        url: './sampledata/3dtiles-QX/tileset.json' //   ./data/3dtiles-lab/tileset.json
    }));
    tileset.readyPromise.then(function () {
        var boundingSphere = tileset.boundingSphere;
        viewer.camera.viewBoundingSphere(boundingSphere, new Cesium.HeadingPitchRange(0.0, -0.5, boundingSphere.radius));
        viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
    }).otherwise(function (error) {
        throw (error);
    });*/
    //拓展支持生成多个雷达扫描
    var ScanPostStages = [],datas = param.datas;
    for(var i in param.datas){
        var CartographicCenter = new Cesium.Cartographic(Cesium.Math.toRadians(datas[i].lon), Cesium.Math.toRadians(datas[i].lat), 0);
        var ScanPostStage = this.AddRadarScanPostStage(CartographicCenter, datas[i].radius, datas[i].scanColor, datas[i].duration); //添加雷达扫描线
        ScanPostStages.push(ScanPostStage);
    }
     //扫描位置 这个地方后面需要改成获取数据源视野中心
    viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(datas[0].lon, param.datas[0].lat, this.zoom)
    });

    return ScanPostStages;
}

/*
    添加雷达扫描线 地形遮挡开启   lon:-74.01296152309055 lat:40.70524201566827 height:129.14366696393927
    viewer
    cartographicCenter 扫描中心
    radius  半径 米
    scanColor 扫描颜色
    duration 持续时间 毫秒
*/
CesiumRadarScan.prototype.AddRadarScanPostStage = function(cartographicCenter, radius, scanColor, duration){
    var viewer = this.viewer;
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
        /** 
         * @Cartographic 由经度，纬度和高度定义的位置
         * @Cartesian4 4D笛卡尔点
         * @Cartesian 用于表示三维空间中的旋转的一组4维坐标
         * @Matrix3 一个3x3矩阵，可作为列主要顺序数组索引
         * @Cartesian3 3D笛卡尔点
         * @PostProcessStage 场景渲染的纹理
         */
        //绘制椭圆体 中心点1
        var _Cartesian3Center = Cesium.Cartographic.toCartesian(cartographicCenter);
        // x y z w
        var _Cartesian4Center = new Cesium.Cartesian4(_Cartesian3Center.x, _Cartesian3Center.y, _Cartesian3Center.z, 1);
        //绘制位置2
        var _CartographicCenter1 = new Cesium.Cartographic(cartographicCenter.longitude, cartographicCenter.latitude, cartographicCenter.height + 500);
        //绘制形状2 大圈
        var _Cartesian3Center1 = Cesium.Cartographic.toCartesian(_CartographicCenter1);
        // x y z w
        var _Cartesian4Center1 = new Cesium.Cartesian4(_Cartesian3Center1.x, _Cartesian3Center1.y, _Cartesian3Center1.z, 1);
        //绘制位置3
        var _CartographicCenter2 = new Cesium.Cartographic(cartographicCenter.longitude + Cesium.Math.toRadians(0.001), cartographicCenter.latitude, cartographicCenter.height);
        //绘制形状3
        var _Cartesian3Center2 = Cesium.Cartographic.toCartesian(_CartographicCenter2);
        // x y z w
        var _Cartesian4Center2 = new Cesium.Cartesian4(_Cartesian3Center2.x, _Cartesian3Center2.y, _Cartesian3Center2.z, 1);
        //旋转坐标
        var _RotateQ = new Cesium.Quaternion();
        //创建矩阵
        var _RotateM = new Cesium.Matrix3();
        //获取时间
        var _time = (new Date()).getTime();
        //创建空坐标系
        var _scratchCartesian4Center = new Cesium.Cartesian4();
        var _scratchCartesian4Center1 = new Cesium.Cartesian4();
        var _scratchCartesian4Center2 = new Cesium.Cartesian4();
        var _scratchCartesian3Normal = new Cesium.Cartesian3();
        var _scratchCartesian3Normal1 = new Cesium.Cartesian3();
        //场景渲染的纹理
        var ScanPostStage = new Cesium.PostProcessStage({
            //	要使用的片段着色器
            fragmentShader: ScanSegmentShader,
            //一个对象，其属性将用于设置着色器制服
            uniforms: {
                //将上面的属性填充进来
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
                //用于清除输出纹理的颜色
                u_scanColor: scanColor
            }
        });
        //返回实体 业务分离
        return ScanPostStage;
}

/**
 * 建立数据模型
 * @author zhangti
 * 拓展支持创建多个scanpoststage
 */
CesiumRadarScan.prototype.build = function(param){
    var t = this , data = null;
    switch(param.handleType){
        case "reserved":{ data = t.reserved(param);break; }
        default :{ data = t.config(param); }
    }
    return data;
}


/**
 * 清除所有对象
 * @author zhangti
 */
CesiumRadarScan.prototype.removeAll = function(){
    this.viewer.scene.postProcessStages.removeAll();
}

/**
 * 清除某个对象
 * @author zhangti
 * @e PostProcessStage 对象
 */
CesiumRadarScan.prototype.remove = function(Stage){
    this.viewer.scene.postProcessStages.remove(Stage);
}

/**
 * 绘制图像
 * @author zhangti
 */
CesiumRadarScan.prototype.draw = function(ScanPostStages){
    //添加渲染纹理
    if(ScanPostStages.length > 0){
        for(var i in ScanPostStages){
            this.viewer.scene.postProcessStages.add(ScanPostStages[i]);
        }
    }
    
}

	
	
