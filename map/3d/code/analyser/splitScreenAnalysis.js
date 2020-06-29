/**
 * 分屏对比分析
 * SplitScreenAnalysis.js
import DTGlobe from "../main"
import { initViewer, initScene } from "../global"
import CesiumNavigation from "cesium-navigation-es6";
 */
/*
示例
const url = "http://localhost:9000/model/0fac1df0003b11eaab01bd5a75f57b94/tileset.json";
let options={
"viewerROptions":{
    "container":"cesiumRightDiv",
    "depthTest":this.$store.getters.system.depthTest,
    "CesiumNavigation":CesiumNavigation
},
"viewer":viewer,
"cesium":cesium
}
const url = "http://localhost:9000/model/0fac1df0003b11eaab01bd5a75f57b94/tileset.json";
let test=new SplitScreenAnalysis(options);
test.viewerRLoad3Dtile(url)
 */
/**
 * @description: 
 * @param {type} 
 * @return: 
 */
function SplitScreenAnalysis(options) {
    this._viewerROptions = options.viewerROptions;
    this._viewerL = options.viewer;
    this._Cesium = options.cesium;
    this._viewerR = this.CreateViewer(this._viewerROptions);
    this._isLeftTrigger = false;
    this._isRightTrigger = false;
    this._viewerLTilesetOrModel = undefined;
    this._viewerRTilesetOrModel = undefined;
    this.InitSplitScreenAnalysis();
}
/**
 * @description: 定义属性
 * @param {type} 
 * @return: 
 */
Object.defineProperties(SplitScreenAnalysis.prototype, {
    viewerL: {
        get: function () {
            return this._viewerA
        },
    },
    viewerR: {
        get: function () {
            return this._viewerB
        },
    },
    viewerLTilesetOrModel: {
        get: function () {
            return this._viewerLTilesetOrModel
        },
    },
    viewerRTilesetOrModel: {
        get: function () {
            return this._viewerRTilesetOrModel
        },
    },
    isLeftTrigger: {
        get: function () {
            return this._isLeftTrigger
        },
        set: function (value) {
            this._isLeftTrigger = value
        }
    },
    isRightTrigger: {
        get: function () {
            return this._isRightTrigger
        },
        set: function (value) {
            this._isRightTrigger = value
        }
    },
})
/**
 * @description: 创建viewer
 * @param {type} HTMLContainer
 * @return: 
 */
SplitScreenAnalysis.prototype.CreateViewer = function (viewerROptions) {
    const viewer = initViewer(
        viewerROptions.container,
        viewerROptions.depthTest,
        this._Cesium,
        viewerROptions.CesiumNavigation
    );
    return viewer;
}
/**
 * @description: 初始化视图
 * @param {type} 
 * @return: 
 */
SplitScreenAnalysis.prototype.InitSplitScreenAnalysis= function () {
    if(this._viewerL===undefined||this._viewerR===undefined){
        return;
    }
    this.syncViewer()
}
/**
 * @description: 加载3Dtile
 * @param {type} 三维视图viewer，url为模型地址
 * @return: 
 */
SplitScreenAnalysis.prototype.load3Dtiles = function (viewer, url) {
    let Cesium = this._Cesium
    let tileset = viewer.scene.primitives.add(
        new Cesium.Cesium3DTileset({
            url: url
        })
    );
    tileset.readyPromise.then(function (tileset) {
        viewer.zoomTo(
            tileset,
            new Cesium.HeadingPitchRange(
                0.7,
                -0.2,
                tileset.boundingSphere.radius * 1.0
            )
        );
    }).otherwise(function (error) {
        console.log(error);
    });
    return tileset;
}
/**
 * @description: viewerL添加模型数据
 * @param {type}options.url模型的url
 * @param {type}options.modelMatrix模型的矩阵
 * @param {type}options.lng 所在经度
 * @param {type}options.lng 所在维度
 * @param {type}options.height 所在高度
 * @return: 
 */
SplitScreenAnalysis.prototype.viewerLloadModel = function (options) {
    this._isLeftTrigger = true;
    this._isRightTrigger = false;
    this.removeViewerTileset("viewerL");
    let Cesium = this._Cesium
    let model = this._viewerL.scene.primitives.add(Cesium.Model.fromGltf({
        // 资源路径
        url: options.url,
        // 模型矩阵
        modelMatrix: options.modelMatrix,
        // 模型最小刻度
        minimumPixelSize: 128,
        // 模型标尺
        scale: 2.0,
        // 模型最大刻度
        maximumScale: 20000,
        // 仅用于调试。显示模型绘制时的边界球。
        debugShowBoundingVolume: false,
        // 仅用于调试，显示魔仙绘制时的线框
        debugWireframe: false
    }));
    this._viewerL.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(options.lng, options.lat, options.height)
    });
    this._viewerLTilesetOrModel=model;
}
/**
 * @description: viewerR添加模型数据
 * @param {type} 
 * @return: 
 */
SplitScreenAnalysis.prototype.viewerRloadModel = function (options) {
    this.isLeftTrigger = false;
    this.isRightTrigger = true;
    this.removeViewerTileset("viewerR");
    let Cesium = this._Cesium
    let model = this._viewerR.scene.primitives.add(Cesium.Model.fromGltf({
        // 资源路径
        url: options.url,
        // 模型矩阵
        modelMatrix: options.modelMatrix,
        // 模型最小刻度
        minimumPixelSize: 128,
        // 模型标尺
        scale: 2.0,
        // 模型最大刻度
        maximumScale: 20000,
        // 仅用于调试。显示模型绘制时的边界球。
        debugShowBoundingVolume: false,
        // 仅用于调试，显示魔仙绘制时的线框
        debugWireframe: false
    }));
    this._viewerR.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(options.lng, options.lat, options.height)
    });
    this._viewerRTilesetOrModel=model;
}
/**
 * @description: 同步相机状态
 * @param {type} 
 * @return: 
 */
SplitScreenAnalysis.prototype.syncViewer = function () {
    let that=this
    let Cesium = this._Cesium;
    let viewerL = this._viewerL
    let viewerR = this._viewerR
    var sceneL = viewerL.scene;
    var sceneR = viewerR.scene;
    var handlerL = new Cesium.ScreenSpaceEventHandler(sceneL.canvas);
    var ellipsoidL = sceneL.globe.ellipsoid;
    var handlerR = new Cesium.ScreenSpaceEventHandler(sceneR.canvas);
    var ellipsoidR = sceneR.globe.ellipsoid;
    handlerL.setInputAction((movement)=> {
        this.isLeftTrigger = true;
        this.isRightTrigger = false;
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    handlerR.setInputAction((movement)=> {
        this.isLeftTrigger = false;
        this.isRightTrigger = true;
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    var syncViewerL = function () {
        if (that.isLeftTrigger) {
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
    viewerR.camera.changed.addEventListener(syncViewerL);
    viewerR.scene.preRender.addEventListener(syncViewerL);
    var syncViewerR = function () {
        if (that.isRightTrigger) {
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
    viewerR.camera.changed.addEventListener(syncViewerR);
    viewerR.scene.preRender.addEventListener(syncViewerR);
}
/**
 * @description: viewerL添加3DTiles数据
 * @param {type} 
 * @return: 
 */
SplitScreenAnalysis.prototype.viewerLLoad3Dtile = function (url) {
    this._isLeftTrigger = true;
    this._isRightTrigger = false;
    this.removeViewerTileset("viewerL");
    this._viewerLTilesetOrModel=this.load3Dtiles(this._viewerL, url)

}
/**
 * @description: viewerR添加3DTiles数据
 * @param {type} 
 * @return: 
 */
SplitScreenAnalysis.prototype.viewerRLoad3Dtile = function (url) {
    this.isLeftTrigger = false;
    this.isRightTrigger = true;
    this.removeViewerTileset("viewerR");
    this._viewerRTilesetOrModel=this.load3Dtiles(this._viewerR, url)
}
/**
 * @description: 移除3DtileOrModel
 * @param {type} 
 * @return: 
 */
SplitScreenAnalysis.prototype.removeViewerTileset = function (type) {
    let that = this
    switch (type) {
        case "viewerL":
            if (that._viewerLTilesetOrModel != undefined) {
                that._viewerL.scene.primitives.remove(that._viewerLTilesetOrModel);
                console.log(this._viewerLTilesetOrModel)
            }
            break;
        case "viewerR":
            if (that._viewerRTilesetOrModel != undefined) {
                that._viewerR.scene.primitives.remove(that._viewerRTilesetOrModel);
                console.log(this._viewerRTilesetOrModel)
            }
            break;
        default:
            if (that._viewerLTilesetOrModel != undefined) {
                that._viewerL.scene.primitives.remove(that._viewerLTilesetOrModel);
            }
            if (that._viewerRTilesetOrModel != undefined) {
                that._viewerR.scene.primitives.remove(that._viewerRTilesetOrModel);
            }
    }
}
SplitScreenAnalysis.prototype.setViewerClass = function () {

}
export default SplitScreenAnalysis
