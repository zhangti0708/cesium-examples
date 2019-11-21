/*
 * @Descripttion: 
 * @version: 1.0
 * @Author: zhangti
 * @Date: 2019-09-19 09:10:57
 * @LastEditors: sueRimn
 * @LastEditTime: 2019-11-21 15:44:52
 */
/**
 * @file CV
 * @version 1.0
 * CV API 入口
 * CV 提供一个等同于Cesium 的基类,提供实例化和加载资源
 * -- CV.ready();加载异步资源
 * -- new CV.Earth();提供实例化
 * */

import ready from './ready.js';
import Earth from './earth.js';
import CVTools from './cvTool.js';
import {TAG} from './tag.js';
import Layers from './layers.js';
import HTML from './html.js';
import handler from './handler.js';
import Measure from './measure.js';
import mouseManager from './mouseManager.js';
import ModelManager from './modelManager.js';
import entityFactory from './entityFactory.js';
import Entitys from './entitys.js';
import Primitives from './primitives.js';
import dataManager from './dataManager.js';
//import satelliteTransit from './satelliteTransit.js';
import Analyser from './analyser.js';
//import flyPath from './flyPath.js';
import Draw from './draw.js';
import DrawDynamicTool from './DrawDynamicTool.js';
import Plot from './plot.js';
import Scene from './scene.js';
import sceneTree from './sceneTree.js';
import Camera from './camera.js';
import Visual from './visual.js';
import Winds from './winds.js';
//import Wind3D from './wind3D.js';
import HeatMap from './heatMap.js';
import Radar from './radar.js';
//import Visibility from './analyser/visibility.js';
//import Submerged from './analyser/submerged.js';
//import Slope from './analyser/slope.js';
//import VisualField from './analyser/visualField.js';
//import PointVisual from './analyser/pointVisual.js';
//import LookAround from './analyser/lookAround.js';
//import ViewShed3D from './analyser/ViewShed3D.js';


/**
 * 成员变量
 * @file CV
 */
var CV = {};
/**
 * version
 * @type Number
 */
CV.version = 1.0;
/**
 * name
 * @type string
 */
CV.name = 'CV';
/**
 * TAG 标签类
 */
CV.TAG = TAG;
/**
 * 加载资源方法
 * @type function
 */
CV.load = function(){
    return ready(); 
};
/**
 * 创建Earth
 * 所有地球操作
 * 视角 鼠标 绘制
 * @type obj
 */
CV.Earth = Earth;
/**
 * core 核心类
 */
CV.CORE = null;
/**
 * 场景
 */
CV.Scene = Scene;
/**
 * 场景树
 */
CV.SceneTree = sceneTree;
/**
 * 相机
 * 视野控制
 */
CV.Camera = Camera;
/**
 * 创建layer类
 * 所有图层在这里操作
 */
CV.Layers = Layers;
/**
 * HTML资源管理
 */
CV.HTML = HTML;
/**
 * 工具
 */
CV.Tools = CVTools;
/**
 * 鼠标事件封装
 */
CV.Handler = handler;
/**
 * 转换
 */
CV.MouseManager = mouseManager;
/**
 * 模型
 */
CV.ModelManager = ModelManager;
/**
 * 实体封装
 */
CV.EntityFactory = entityFactory;
/**
 * 量测
 */
CV.Measure = Measure;
/**
 * 数据源管理
 */
CV.dataManager = dataManager;
/**
 * 实体
 * 图形
 */
CV.Primitives = Primitives;
CV.Entitys = Entitys;
/**
 * 可视化类
 */
CV.Visual = Visual;
/**
 * 三维效果
 */
//CV.SatelliteTransit = satelliteTransit;
//CV.FlyPath = flyPath;
CV.Winds = Winds;
//CV.Wind3D = Wind3D;
CV.HeatMap = HeatMap;
CV.Radar = Radar;
/**
 * 分析功能
 */
/*CV.Analyser = Analyser;
CV.Visibility = Visibility;
CV.Submerged = Submerged;
CV.Slope = Slope;
CV.VisualField = VisualField;
CV.PointVisual = PointVisual;
CV.LookAround = LookAround;
CV.ViewShed3D = ViewShed3D;*/
/**
 * 绘制图形
 */
CV.Draw = Draw;
CV.DrawDynamicTool = DrawDynamicTool;
/**
 * 标绘
 */
CV.Plot = Plot;

export {CV};
