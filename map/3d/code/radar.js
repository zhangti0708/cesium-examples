/*
 * @Descripttion: 
 * @version: 1.0
 * @Author: zhangti
 * @Date: 2019-10-23 16:20:07
 * @LastEditors: sueRimn
 * @LastEditTime: 2019-11-22 17:38:53
 */
/**
 * 雷达效果封装
 */
import Entitys from './entitys.js';
import mouseManager from './mouseManager.js';
import Handler from './handler.js';
export default class Radar{
    constructor(opt){
        this.CMD = {
            SCAN1 : 1,
            SCAN2 : 2,
            RADAR1 : 3,
            RADAR2 : 4
          }
        //实体
        this.radarObj = [];
        //初始化
        this.init(opt);
    }
    init(opt){
        if(opt == null){
            return false;
        }
		var t = this;
		for(var key in opt){
			t[key] = opt[key];
        }
        /**
         * 鼠标事件
         */
        this.handler = new Handler(this.viewer);
        /**
         * 转换
         */
        this.mouseManager = new mouseManager(this.viewer);
        /**
         * 实体
         */
        this.entitys = new Entitys(this.viewer);
        //雷达
        this.radar = null;
        //提示框
        this._resultTip = this.viewer.entities.add({
			label : {
				fillColor:Cesium.Color.YELLOW,
				showBackground : true,
				font : '14px monospace',
				horizontalOrigin : Cesium.HorizontalOrigin.LEFT,
				verticalOrigin : Cesium.VerticalOrigin.BOTTOM,
				pixelOffset : new Cesium.Cartesian2(0, -10)
			}
		});
    }
    /**
     * 构建
     */
    build(cmd){
        switch(cmd){
            case this.CMD.SCAN1 : this.createScan1();break;
            case this.CMD.SCAN2 : this.createScan2();break;
            case this.CMD.RADAR1 : this.createRadar1();break;
            case this.CMD.RADAR2 : this.createRadar2();break;
        }
    }
    /**
     * 提示框
     * @param {*} label 
     * @param {*} bShow 
     * @param {*} position 
     * @param {*} message 
     * @param {*} effectOptions 
     */
    showTip(label,bShow,position,message,effectOptions){
        label.show = bShow;
        if(bShow){
            if(position)
                label.position = position;
            if(message)
                label.label.text =message;
            if(effectOptions){
                for(let key  in effectOptions){
                    if(label.key){
                        label.key=effectOptions[key];
                    }
                }
            }
        }    
    }
    /**
     * 删除
     */
    remove(){
        if(this.radarObj.length == 0 ){
            return false;
        }
        for(let i in this.radarObj){
            this.viewer.scene.postProcessStages.remove(this.radarObj[i]);
            this.entitys.remove(this.radarObj[i]);
        }
        this.entitys.remove(this._resultTip);
    }
    /**
     * 圆形扫描
     */
    createScan1(){
        let _self = this;
        //点击
        _self.handler.Action(function(movement){
            let cartesian = _self.mouseManager.pickEllipsoid(movement);  //提取lat lon画雷达
            if(!cartesian)return false;
            _self.radarObj.push(_self.addRadarScan(_self.viewer,{lon:cartesian.x,lat:cartesian.y,scanColor:Cesium.Color.RED,r:1500,interval:4000}));
           
        },_self.handler.LEFT_CLICK);
        //移动
        _self.handler.Action(function(movement){
            let position = _self.mouseManager.screenToWorld(movement.endPosition);
            if (_self.radarObj != null) {
                if (_self.radarObj.length == 0) {
                    _self.showTip(_self._resultTip,true,position,"点击添加第一个扫描物");
                } else {
                    if (_self.radarObj.length === 1) {
                        _self.showTip(_self._resultTip,true,position, "点击添加第二个扫描物");
                    } else {
                        _self.showTip(_self._resultTip,true,position, "右键结束编辑");
                    }
                }
            }
        },_self.handler.MOUSE_MOVE); 
        //右键
        _self.handler.Action(function(movement){
            _self.handler.destroy();
            _self._resultTip.label.show = false;
        },_self.handler.RIGHT_CLICK); 
    }
    /**
     * 扩散扫描
     */
    createScan2(){
        this.addCircleScan(this.viewer,this.data);
    }
    /**
     * 雷达实体
     */
    createRadar1(){
        let _self = this;
        //点击
        _self.handler.Action(function(movement){
            let cartesian = _self.mouseManager.pickEllipsoid(movement);  //提取lat lon画雷达
            if(!cartesian)return false;
            let l ,r,lat = cartesian.y,lon = cartesian.x, height = cartesian.z;
            //radarscan
            r = new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(90),Cesium.Math.toRadians(0),Cesium.Math.toRadians(0));
            l = Cesium.Cartesian3.fromDegrees(lon, lat, height);
            _self.radarObj.push(_self.entitys.add(_self.entitys.getCustomRadar(l,r)));
        },_self.handler.LEFT_CLICK);
        //移动
        _self.handler.Action(function(movement){
            let position = _self.mouseManager.screenToWorld(movement.endPosition);
            if (_self.radarObj != null) {
                if (_self.radarObj.length == 0) {
                    _self.showTip(_self._resultTip,true,position,"点击添加第一个点雷达");
                } else {
                    if (_self.radarObj.length === 1) {
                        _self.showTip(_self._resultTip,true,position, "点击添加第二个雷达");
                    } else {
                        _self.showTip(_self._resultTip,true,position, "右键结束编辑");
                    }
                }
            }
        },_self.handler.MOUSE_MOVE); 
        //右键
        _self.handler.Action(function(movement){
            _self.handler.destroy();
            _self._resultTip.label.show = false;
        },_self.handler.RIGHT_CLICK);
    }
    /**
     * 地面雷达
     */
    createRadar2(){
        this.dmRadar = new dmRadar({viewer:this.viewer});
    }
    /**
     * 扩散性雷达
     * @param {*} viewer 
     * @param {*} data 
     */
    addCircleScan(){
        //viewer.scene.globe.depthTestAgainstTerrain = true; //防止移动、放大缩小会视觉偏移depthTestAgainstTerrain // 设置该属性为true之后，标绘将位于地形的顶部；如果设为false（默认值），那么标绘将位于平面上。缺陷：开启该属性有可能在切换图层时会引发标绘消失的bug。
        var CartographicCenter = new Cesium.Cartographic(Cesium.Math.toRadians(data.lon), Cesium.Math.toRadians(data.lat), 0); //中心位子
        return  this.AddCircleScanPostStage(viewer, CartographicCenter,data.r,data.scanColor,data.interval);
    }
    AddCircleScanPostStage(){
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
        viewer.scene.postProcessStages.add(ScanPostStage);
        return (ScanPostStage);
    }
    /**
     * 扫描型雷达
     * @param {*} viewer 
     * @param {*} data 
     */
    addRadarScan(viewer,data){
        //viewer.scene.globe.depthTestAgainstTerrain = true; //防止移动、放大缩小会视觉偏移depthTestAgainstTerrain // 设置该属性为true之后，标绘将位于地形的顶部；如果设为false（默认值），那么标绘将位于平面上。缺陷：开启该属性有可能在切换图层时会引发标绘消失的bug。
        var CartographicCenter = new Cesium.Cartographic(Cesium.Math.toRadians(data.lon), Cesium.Math.toRadians(data.lat),0); //中心位子
        return  this.AddRadarScanPostStage(viewer, CartographicCenter,data.r,data.scanColor,data.interval);
    }
    AddRadarScanPostStage(viewer, cartographicCenter, radius, scanColor, duration) {
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
        viewer.scene.postProcessStages.add(ScanPostStage);
        return (ScanPostStage);

    }
}
/**
 * 地面雷达
 * @param {*} opt 
 */
class dmRadar{
    constructor(opt){
        this.init(opt);
    }
    init(opt){
        if(opt == null){
            return false;
        }
		var t = this;
		for(var key in opt){
			t[key] = opt[key];
        }
        this.url = this.url == undefined ? '../src/Cesium/Apps/SampleData/kml/facilities/facilities.kml' : this.url;
        this.pixelRange = this.pixelRange == undefined ? 15 : this.pixelRange;
        this.minimumClusterSize = this.minimumClusterSize == undefined ? 3 : this.minimumClusterSize;
        this.load();
    }
    load(){
        var _self = this,options = {camera : _self.viewer.scene.camera,canvas : _self.viewer.scene.canvas};
        var dataSourcePromise = _self.viewer.dataSources.add(Cesium.KmlDataSource.load(_self.url, options));
        dataSourcePromise.then(function(dataSource) {
            dataSource.clustering.enabled = true;
            dataSource.clustering.pixelRange = _self.pixelRange;
            dataSource.clustering.minimumClusterSize = _self.minimumClusterSize;
            _self.raderData = dataSource;
            _self.customStyle();
        });
    }
    remove(){
        this.viewer.dataSources.remove(this.raderData);
    }
    setPixelRange(value){
        this.raderData.clustering.pixelRange = value;
        this.customStyle();
    }
    setMinimumClusterSize(){

    }
    customStyle(){
        var _self = this,dataSource = this.raderData,removeListener,singleDigitPins = new Array(8);
        var pinBuilder = new Cesium.PinBuilder();
        var pin50 = pinBuilder.fromText('50+', Cesium.Color.RED, 48).toDataURL();
        var pin40 = pinBuilder.fromText('40+', Cesium.Color.ORANGE, 48).toDataURL();
        var pin30 = pinBuilder.fromText('30+', Cesium.Color.YELLOW, 48).toDataURL();
        var pin20 = pinBuilder.fromText('20+', Cesium.Color.GREEN, 48).toDataURL();
        var pin10 = pinBuilder.fromText('10+', Cesium.Color.BLUE, 48).toDataURL();
        for (var i = 0; i < singleDigitPins.length; ++i) {
            singleDigitPins[i] = pinBuilder.fromText('' + (i + 2), Cesium.Color.VIOLET, 48).toDataURL();
        }
      
        if (Cesium.defined(removeListener)) {
            removeListener();
            removeListener = undefined;
        } else {
            removeListener = dataSource.clustering.clusterEvent.addEventListener(function(clusteredEntities, cluster) {
                cluster.label.show = false;
                cluster.billboard.show = true;
                cluster.billboard.id = cluster.label.id;
                cluster.billboard.verticalOrigin = Cesium.VerticalOrigin.BOTTOM;

                if (clusteredEntities.length >= 50) {
                    cluster.billboard.image = pin50;
                } else if (clusteredEntities.length >= 40) {
                    cluster.billboard.image = pin40;
                } else if (clusteredEntities.length >= 30) {
                    cluster.billboard.image = pin30;
                } else if (clusteredEntities.length >= 20) {
                    cluster.billboard.image = pin20;
                } else if (clusteredEntities.length >= 10) {
                    cluster.billboard.image = pin10;
                } else {
                    cluster.billboard.image = singleDigitPins[clusteredEntities.length - 2];
                }
            });
        }
        // force a re-cluster with the new styling
        var pixelRange = dataSource.clustering.pixelRange;
        dataSource.clustering.pixelRange = 0;
        dataSource.clustering.pixelRange = pixelRange;
    }
}