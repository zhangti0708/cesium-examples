/*
 * @Descripttion: 
 * @version: 1.0
 * @Author: zhangti
 * @Date: 2019-09-19 09:10:57
 * @LastEditors  : sueRimn
 * @LastEditTime : 2020-01-17 11:17:09
 */
/**
 * @file CV
 * @version 1.0
 * CV API 入口
 * CV 提供一个等同于Cesium 的基类,提供实例化和加载资源
 * -- CV.ready();加载异步资源
 * -- new CV.Earth();提供实例化
 * */

import Earth from './code/earth.js';
import CONFIG from './code/config.js';
import CVTools from './code/cvTool.js';
import {TAG} from './code/tag.js';
import Layers from './code/layers.js';
import HTML from './code/html.js';
import handler from './code/handler.js';
import Measure from './code/measure.js';
import mouseManager from './code/mouseManager.js';
import ModelManager from './code/modelManager.js';
import Coordinate from './code/Coordinate.js';
import entityFactory from './code/entityFactory.js';
import Entitys from './code/entitys.js';
import Primitives from './code/primitives.js';
import dataManager from './code/dataManager.js';
import satelliteTransit from './code/satelliteTransit.js';
import Analyser from './code/analyser.js';
import flyPath from './code/flyPath.js';
import Roaming from './code/roaming.js';
import OverViewMap from './code/overView.js';
import SplitView from './code/splitView.js';
import Draw from './code/draw.js';
import Errors from './code/errors.js';
import DrawDynamicTool from './code/DrawDynamicTool.js';
import Plot from './code/plot.js';
import Scene from './code/scene.js';
import sceneTree from './code/sceneTree.js';
import Camera from './code/camera.js';
import Visual from './code/visual.js';
import Winds from './code/winds.js';
import Wind3D from './code/wind3D.js';
import HeatMap from './code/heatMap.js';
import Radar from './code/radar.js';
import Visibility from './code/analyser/visibility.js';
import Submerged from './code/analyser/submerged.js';
import Slope from './code/analyser/slope.js';
import VisualField from './code/analyser/visualField.js';
import PointVisual from './code/analyser/pointVisual.js';
import LookAround from './code/analyser/lookAround.js';
import ViewShed3D from './code/analyser/ViewShed3D.js';
import ViewShed from './code/analyser/ViewShed.js';
import SplitScreen from './code/analyser/splitScreenAnalysis.js';
import ProFile from './code/analyser/profileAnalyse.js';
import Read from './code/ready.js';
import RightMenu from './code/rightMenu.js';
import PassAnalyze from './code/passAnalyze.js';
import OrbitAnalyze from './code/orbitAnalyze.js';

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
 * 操作常用配置
 */
CV.CONFIG = CONFIG;
/**
 * 加载资源方法
 * @type function
 */
CV.load = function (use,call) {
  return new Read().load(use,call);
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
 * 异常封装
 */
CV.Errors = Errors;
/**
 * 鼠标事件封装
 */
CV.Handler = handler;
/**
 * 鼠标管理
 */
CV.MouseManager = mouseManager;
/**
 * 模型管理
 */
CV.ModelManager = ModelManager;
/**
 * 坐标辅助
 */
CV.Coordinate = Coordinate;
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
CV.SatelliteTransit = satelliteTransit;
CV.FlyPath = flyPath;
CV.Winds = Winds;
CV.Wind3D = Wind3D;
CV.HeatMap = HeatMap;
CV.Radar = Radar;
CV.Roaming = Roaming;
CV.OverViewMap = OverViewMap;
CV.SplitView = SplitView;
/**
 * 分析功能
 */
CV.Analyser = Analyser;
CV.Visibility = Visibility;
CV.Submerged = Submerged;
CV.Slope = Slope;
CV.VisualField = VisualField;
CV.PointVisual = PointVisual;
CV.LookAround = LookAround;
CV.ViewShed3D = ViewShed3D;
CV.ViewShed = ViewShed;
CV.SplitScreen = SplitScreen;
CV.ProFile = ProFile;
CV.PassAnalyze = PassAnalyze;
CV.OrbitAnalyze = OrbitAnalyze;
/**
 * 绘制图形
 */
CV.Draw = Draw;
CV.DrawDynamicTool = DrawDynamicTool;
/**
 * 标绘
 */
CV.Plot = Plot;
/**
 * 右键菜单
 */
CV.RightMenu = RightMenu;
export {CV};
