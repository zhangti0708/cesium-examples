/*
 * @Descripttion: 
 * @version: 
 * @Author: sueRimn
 * @Date: 2019-09-19 09:10:57
 * @LastEditors  : sueRimn
 * @LastEditTime : 2020-01-16 13:31:24
 */
let lensFlare = null,latlonMsg = null,
lon = 117.191166, lat = 34.289749, zoom = 15000000; //
/**
 * 常用配置项
 */
import SceneTree from './sceneTree.js';
import Handler from './handler.js';
import MouseManager from './mouseManager.js';
export default class CONFIG {
    constructor(){}
    //数据目录
    static DATADIR = '/map/3d/data';
    //code目录
    static CODEDIR = '/map/3d/code';
    //cesiumApp存放目录
    static APPDIR = '/map/3d/static/Cesium1.62';
    //静态资源 图像视频文件目录
    static STATICDIR = '/map/3d/static';
    //外部资源 libs
    static LIBSDIR = '/map/libs';
    /**
     * cesium初始化配置
     * 配合场景树
     */
    static INIT(viewer){
        //默认隐藏
        $('.cesium-viewer-animationContainer').hide();
        $('.cesium-viewer-timelineContainer').hide();
        //信息框
        $('.cesium-infoBox').hide();
        //cesium工具
        $('.cesium-viewer-toolbar').hide();
        //汉化
        CesiumZh.load();
        //帧率
        viewer.scene.debugShowFramesPerSecond = true;
        setTimeout(function () {
            $('.cesium-performanceDisplay-defaultContainer').hide();
        }, 1);
        //添加导航
        let options = {}; 
        options.defaultResetView = Cesium.Cartographic.fromCartesian(Cesium.Cartesian3.fromDegrees(lon, lat, 20000000));
        options.enableCompass= true; 
        options.enableZoomControls= false; 
        options.enableDistanceLegend= false; 
        options.enableCompassOuterRing= true; 
        viewer.extend(Cesium.viewerCesiumNavigationMixin,options);
        //生成光晕
        lensFlare = viewer.scene.postProcessStages.add(Cesium.PostProcessStageLibrary.createLensFlareStage());
        lensFlare.enabled = false;
        //取消双击事件
        viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
        //深度检测
        viewer.scene.globe.depthTestAgainstTerrain = false;
        //默认位置
        viewer.camera.setView({
            destination: Cesium.Cartesian3.fromDegrees(lon, lat, zoom)
        });

         // Date formatting to a global form
         function localeDateTimeFormatter(datetime, viewModel, ignoredate) {
            var julianDT = new Cesium.JulianDate();
            Cesium.JulianDate.addHours(datetime, 8, julianDT)
            var gregorianDT = Cesium.JulianDate.toGregorianDate(julianDT)
            var objDT;
            if (ignoredate)
                objDT = '';
            else {
                objDT = new Date(gregorianDT.year, gregorianDT.month - 1, gregorianDT.day);
                objDT = gregorianDT.year + '年' + objDT.toLocaleString("zh-cn", { month: "short" }) + gregorianDT.day + '日';
                if (viewModel || gregorianDT.hour + gregorianDT.minute === 0)
                    return objDT;
                objDT += ' ';
            }
            return objDT + Cesium.sprintf("%02d:%02d:%02d", gregorianDT.hour, gregorianDT.minute, gregorianDT.second);
        }

        function localeTimeFormatter(time, viewModel) {
            return localeDateTimeFormatter(time, viewModel, true);
        }

        var animationviewModel = viewer.animation.viewModel;
        var timeline = viewer.timeline;
        animationviewModel.dateFormatter = localeDateTimeFormatter;
        animationviewModel.timeFormatter = localeTimeFormatter;
        timeline.makeLabel = function (time) { return localeDateTimeFormatter(time) };
        //辅助工具
        //viewer.extend(Cesium.viewerCesiumInspectorMixin);
    }
    /**
     * 避免相机进入地下
     */
    static TopGround(viewer){
        viewer.clock.onTick.addEventListener(function () {        
            if(viewer.camera.pitch > 0){
                viewer.scene.screenSpaceCameraController.enableTilt = false;
            }
        });       
        let mousePosition,startMousePosition;
        let handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
        handler.setInputAction(function(movement) { 
            mousePosition=startMousePosition= Cesium.Cartesian3.clone(movement.position);
            handler.setInputAction(function(movement) {
                mousePosition = movement.endPosition;
                var y = mousePosition.y - startMousePosition.y;
                if(y>0){
                    viewer.scene.screenSpaceCameraController.enableTilt = true;
                }
            }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        }, Cesium.ScreenSpaceEventType.MIDDLE_DOWN);
    }

     /**
     * 生成环境控制
     */
    static crateSceneController(viewer) {
        let Options = function () {
            this.contrast = 128;
            this.brightness = -0.3;
            this.delta = 1;
            this.gamma = 3.5;
            this.enabled = false;
            this.highDynamicRange = true;
            this.shadows = false;
        }
        let option = new Options();
        let gui = new dat.GUI();
        gui.__closeButton.innerHTML = "收缩面板";

        let bloom = viewer.scene.postProcessStages.bloom;

        gui.add(option, 'highDynamicRange').name("高动态范围").onChange(function (value) {
            viewer.scene.highDynamicRange = value;
        })
        gui.add(option, 'gamma', 0, 5).name("伽马亮度").onChange(function (value) {
            viewer.scene.gamma = value;
        })

        gui.add(option, 'enabled').name("启用模糊").onChange(function (value) {
            bloom.enabled = value;
        })
        gui.add(option, 'contrast', -128, 128).name("对比度").onChange(function (value) {
            bloom.uniforms.contrast = value;
        })
        gui.add(option, 'brightness', -2, 2).name("光泽亮度").onChange(function (value) {
            bloom.uniforms.brightness = value;
        })
        gui.add(option, 'delta', -5, 5).name("因子(delta)").onChange(function (value) {
            bloom.uniforms.delta = value;
        })

        gui.add(option, 'shadows').name("启用阴影").onChange(function (value) {
            viewer.shadows = value;
        })
        $('.dg.ac').css('top', '10%');
    }
    /**
     * 生成场景树
     */
    static createSceneTree(viewer) {
        let sceneTree = new SceneTree(viewer);
        let Options = function () {
            this.fog = true;
            this.lighting = false;
            this.lensFlare = false;
            this.groundAtmosphere = true;
            this.rain = false;
            this.snow = false;
            this.sun = true;
            this.skyBox = true;
            this.globe = true;
            this.sbstyle = false;
            this.depthTestAgainstTerrain = false;
            this.rotation = false;
            this.grid = false;
            this.tileGrid = false;
            this.mgrsGrid = false;
            this.navi = true;
            this.timeLine = false;
            this.info = false;
            this.sbjk = true;
            this.cesiumTool = false;
            this.radar = false;
            this.province = false;
            this.terrain = false;
            this.tiles = false;
            this.btnCut = function(){
                CONFIG.cutScene(viewer);
            };
        }
        let option = new Options();
        let gui = new dat.GUI();
        gui.__closeButton.innerHTML = "收缩面板";
        gui.add(option, 'fog').name("雾天").onChange(function (value) {
            sceneTree.build({"fog" : value});
        })
        gui.add(option, 'lighting').name("昼夜").onChange(function (value) {
            sceneTree.build({"lighting" : value});
        })
        gui.add(option, 'lensFlare').name("光晕").onChange(function (value) {
            lensFlare.enabled = value;
        })
        gui.add(option, 'groundAtmosphere').name("大气层").onChange(function (value) {
            sceneTree.build({"groundAtmosphere" : value});
        })
        gui.add(option, 'rain').name("雨天").onChange(function (value) {
            sceneTree.build({"rain" : value});
        })
        gui.add(option, 'snow').name("雪天").onChange(function (value) {
            sceneTree.build({"snow" : value});
        })
        gui.add(option, 'sun').name("太阳").onChange(function (value) {
            viewer.scene.sun.show = value;
        })
        gui.add(option, 'skyBox').name("星空").onChange(function (value) {
            viewer.scene.skyBox.show = value;
        })
        gui.add(option, 'globe').name("地球").onChange(function (value) {
            viewer.scene.globe.show = value;
        })
        gui.add(option, 'sbstyle').name("鼠标十字").onChange(function (value) {
            sceneTree.build({"sbstyle" : value});
        })
        gui.add(option, 'depthTestAgainstTerrain').name("深度检测").onChange(function (value) {
            viewer.scene.globe.depthTestAgainstTerrain = value;
        })
        gui.add(option, 'rotation').name("地球自转").onChange(function (value) {
            sceneTree.build({"rotation" : value});
        })
        gui.add(option, 'grid').name("经纬网").onChange(function (value) {
            sceneTree.build({"grid" : {"cmd":1,"flag":value}});
        })
        gui.add(option, 'tileGrid').name("标注网格").onChange(function (value) {
            sceneTree.build({"grid" : {"cmd":2,"flag":value}});
        })
        gui.add(option, 'mgrsGrid').name("军事网格").onChange(function (value) {
            sceneTree.build({"grid" : {"cmd":3,"flag":value}});
        })
        gui.add(option, 'navi').name("导航插件").onChange(function (value) {
            sceneTree.build({"navi" : value});
        })
        gui.add(option, 'timeLine').name("时间轴").onChange(function (value) {
            sceneTree.build({"sjz" : value});
        })
        gui.add(option, 'sbjk').name("鼠标位置").onChange(function (value) {
            sceneTree.build({"xjzt" : value});
        })
        gui.add(option, 'cesiumTool').name("内置工具").onChange(function (value) {
            sceneTree.build({"cesiumTool" : value});
        })
        gui.add(option, 'radar').name("全球雷达站").onChange(function (value) {
            sceneTree.build({"radar" : value});
        })
        gui.add(option, 'province').name("全国省份").onChange(function (value) {
            sceneTree.build({"province" : value});
        })
        gui.add(option, 'terrain').name("地形图").onChange(function (value) {
            sceneTree.build({"terrain" : value});
        })
        gui.add(option, 'tiles').name("3d瓦片").onChange(function (value) {
            sceneTree.build({"_3dtiles" : value});
        })
        gui.add(option, 'btnCut').name("截取场景");
        $('.dg.ac').css('top', '10%');
    }
    /**
     * 截取场景
     */
    static cutScene(viewer){
        let canvas = viewer.scene.canvas;
        let dataUrl = canvas.toDataURL("image/png"); //生成base64图片数据
        let newImg = document.createElement("img");
        newImg.src = dataUrl, newImg.width = 600, newImg.height = 500;
        let downloadIamge = function () {
            let a = document.createElement('a');
            a.download = '视图' + new Date().getTime(); //这边是文件名，可以自定义
            a.href = dataUrl;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
        downloadIamge();
    }
    /**
     * 鼠标信息
     */
    static initMouseInfo(viewer){
        let handler = new Handler(viewer),mouseManager = new MouseManager(viewer);
       
        //创建鼠标移动信息
        latlonMsg = new initLonLatMsg().init()
        function updateLatlonMsg(position){
            latlonMsg.lon = parseInt(position.lon);
            latlonMsg.lat = parseInt(position.lat);
            latlonMsg.height = parseInt(position.height);
            latlonMsg.pitch = Cesium.Math.toDegrees(viewer.camera.pitch).toFixed(2);
            latlonMsg.heading = Cesium.Math.toDegrees(viewer.camera.heading).toFixed(2);
            latlonMsg.roll = Cesium.Math.toDegrees(viewer.camera.roll).toFixed(2);
            latlonMsg.rate = $('.cesium-performanceDisplay-ms').text() + ' | ' + $('.cesium-performanceDisplay-fps').text();
        }

        //移动
        handler.Action(function (event) {
            let pickPosition = viewer.scene.pickPosition(event.endPosition);
            if(pickPosition == undefined){
                return false;
            }
            let latlonObj = mouseManager.piTerrainToModule(event.endPosition,"1")
            //修改鼠标位置
            updateLatlonMsg(latlonObj);
        },  handler.MOUSE_MOVE);
    }
}


/**
 * 鼠标坐标信息
 */
class initLonLatMsg {
    constructor(){}
    init(){
        $('.map-move-msg').append(`<div id="latlonMsg" style='float:right;padding-right:10px;'>
        <p class="data"> 帧率 : {{ rate }} </p><p class="data">经度 : {{ lon }}°</p><p class="data">纬度 : {{ lat }}°</p><p class="data">高度 : {{ height }}</p>
        <p class="data"> 航向 : {{ heading  }}°</p><p class="data">俯仰 : {{ pitch  }}°</p><p class="data">翻转 : {{ roll  }}°</p></div>`);
        $('#latlonMsg p').css('color', 'white').css('margin', '3px').css('float', 'left');
        var latlonMsg = new Vue({
            el: '#latlonMsg',
            data: {
                lon: '',
                lat: '',
                height: '',
                heading: '',
                pitch: '',
                roll: '',
                rate: ''
            }
        });
        latlonMsg.lon = 0.0;
        latlonMsg.lat = 0.0;
        latlonMsg.height =  0.0;
        latlonMsg.pitch = 0.0;
        latlonMsg.heading =  0.0;
        latlonMsg.roll = 0.0;
        latlonMsg.rate =  0.0 + ' | ' +  0.0;
    
        return latlonMsg;
    }
}