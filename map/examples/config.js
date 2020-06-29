/**
 * ExamplesforCesium 示例配置文件：包含示例的分类、名称、缩略图、文件路径
 */
var identification = {
    name: "二三维展示工具"
};

var exampleConfig = {
    "3D": {
        name: "3D",
        content: {
            "地球": {
                name: "地球",
                content: [{
                    name: "星空背景",
                    thumbnail: "xingkong.gif",
                    fileName: "es6_t1"
                },{
                    name: "google地球",
                    thumbnail: "google.gif",
                    fileName: "es6_t2"
                },{
                    name: "Natural地球",
                    thumbnail: "natural.gif",
                    fileName: "es6_t3"
                },{
                    name: "baidu地球",
                    thumbnail: "02_bd.jpg",
                    fileName: "es6_t4"
                },{
                    name: "ArcGis地球",
                    thumbnail: "acrgis.gif",
                    fileName: "es6_t5"
                },{
                    name: "WMS:Rainfall",
                    thumbnail: "wmsr.gif",
                    fileName: "es6_t6"
                },{
                    name: "WMS:Air Pressure",
                    thumbnail: "wmsa.gif",
                    fileName: "es6_t7"
                },{
                    name: "WMS:Temperature",
                    thumbnail: "wmst.gif",
                    fileName: "es6_t8"
                },{
                    name: "WMS:Wind Speed",
                    thumbnail: "wmsw.gif",
                    fileName: "es6_t9"
                },{
                    name: "WorldTerrain",
                    thumbnail: "terrain.gif",
                    fileName: "es6_t10"
                }]},
            "地图工具": {
                name: "工具",
                content: [{
                    name: "标绘",
                    thumbnail: "plot.png",
                    fileName: "es6_t11"
                },{
                    name: "测量",
                    thumbnail: "cltool.png",
                    fileName: "es6_t12"
                },{
                    name: "动态绘制",
                    thumbnail: "draw.png",
                    fileName: "es6_t13"
                }
            ]},
            "三维可视化": {
                name: "可视化",
                content: [{
                    name: "无人机",
                    thumbnail: "fly2.gif",
                    fileName: "es6_t15"
                },{
                    name: "卫星过境",
                    thumbnail: "weixing.gif",
                    fileName: "es6_t16"
                },{
                    name: "风场洋流",
                    thumbnail: "winds.gif",
                    fileName: "es6_t17"
                },{
                    name: "动态雷达",
                    thumbnail: "radar.gif",
                    fileName: "es6_t18"
                },{
                    name: "雷达扫描",
                    thumbnail: "radarscan.gif",
                    fileName: "es6_t19"
                },{
                    name: "热力图示例",
                    thumbnail: "heat.gif",
                    fileName: "es6_t20"
                },{
                    name: "3dtiles城市",
                    thumbnail: "3dtiles.gif",
                    fileName: "es6_t21"
                },{
                    name: "geojson故宫",
                    thumbnail: "gugong.gif",
                    fileName: "es6_t22"
                },{
                    name: "三维模型",
                    thumbnail: "model.gif",
                    fileName: "es6_t23"
                }
            ]},
            "控件": {
                name: "控件",
                content: [{
                    name: "场景控制",
                    thumbnail: "scene.png",
                    fileName: "es6_t29"
                },{
                    name: "鹰眼",
                    thumbnail: "yinyan.png",
                    fileName: "es6_t32"
                },{
                    name: "卷帘",
                    thumbnail: "juanlian.png",
                    fileName: "es6_t31"
                },{
                    name: "右键",
                    thumbnail: "meun.png",
                    fileName: "es6_t33"
                }
            ]},
            "三维分析": {
                name: "分析",
                content: [{
                    name: "通视分析",
                    thumbnail: "fx01.gif",
                    fileName: "es6_t24"
                },{
                    name: "坡度分析",
                    thumbnail: "fx02.gif",
                    fileName: "es6_t25"
                },{
                    name: "环视分析",
                    thumbnail: "fx03.png",
                    fileName: "es6_t26"
                },{
                    name: "淹没分析",
                    thumbnail: "fx04.png",
                    fileName: "es6_t27"
                },{
                    name: "可视域分析",
                    thumbnail: "fx05.png",
                    fileName: "es6_t28"
                },{
                    name: "测控分析",
                    thumbnail: "ckfx.png",
                    fileName: "es6_t14"
                },{
                    name: "过境分析",
                    thumbnail: "gjfx.png",
                    fileName: "es6_t30"
                }
            ]},
            "历史版本": {
                name: "历史版本",
                content: [
                {
                    name: "测试demo",
                    thumbnail: "communication.gif",
                    fileName: "demo01"
                },{
                    name: "雷达通信",
                    thumbnail: "communication.gif",
                    fileName: "test"
                },{
                    name: "风场分析",
                    thumbnail: "wind.gif",
                    fileName: "CesiumWind"
                },{
                    name: "雷达扫描",
                    thumbnail: "radarscan.gif",
                    fileName: "CesiumRadarScan"
                },{
                    name: "航行路线",
                    thumbnail: "newFlyPath.gif",
                    fileName: "CesiumnewFlyPath"
                },{
                    name: "卫星雷达",
                    thumbnail: "satellite.gif",
                    fileName: "CesiumSatellite"
                },{
                    name: "飞行",
                    thumbnail: "fly.gif",
                    fileName: "fly"
                },{
                    name: "移动扫描",
                    thumbnail: "movescan.gif",
                    fileName: "CesiumMoveScan"
                },{
                    name: "热力图",
                    thumbnail: "heatmap.gif",
                    fileName: "CesiumHeatMap"
                },{
                    name: "经纬网",
                    thumbnail: "lonlattile.gif",
                    fileName: "Cesiumlonlattile"
                },{
                    name: "纹理喷泉",
                    thumbnail: "flypath.gif",
                    fileName: "CesiumFlyPath"
                },{
                    name: "天气",
                    thumbnail: "weather.gif",
                    fileName: "Cesiumweather"
                },
                {
                    name: "单体雷达",
                    thumbnail: "radar01.gif",
                    fileName: "CesiumRadar2"
                },{
                    name: "等高线",
                    thumbnail: "contour.gif",
                    fileName: "CesiumElevation"
                },{
                    name: "官方模型",
                    thumbnail: "modul01.gif",
                    fileName: "CesiumModule"
                },{
                    name: "矢量图层",
                    thumbnail: "layes01.png",
                    fileName: "CesiumLayes"
                },{
                    name: "GeoJson",
                    thumbnail: "geojson.gif",
                    fileName: "geojson"
                },{
                    name: "TopoJSON",
                    thumbnail: "topojson.png",
                    fileName: "topojson"
                },{
                    name: "散点图",
                    thumbnail: "scatter.gif",
                    fileName: "Cesiumscatter"
                },{
                    name: "航班图",
                    thumbnail: "flight.gif",
                    fileName: "Cesiumflight"
                },{
                    name: "空气质量",
                    thumbnail: "20_aqi.jpg",
                    fileName: "20_aqi"
                }, {
                    name: "地面温度",
                    thumbnail: "20_landtemperature.jpg",
                    fileName: "20_landtemperature"
                }, {
                    name: "车流可视化",
                    thumbnail: "21_taxisimulation.gif",
                    fileName: "21_taxisimulation"
                }, {
                    name: "排水系统",
                    thumbnail: "21_lighter.gif",
                    fileName: "21_lighter"
                }
            ]}
    }},
    "2D": {
        name: "2D",
        content: {
            "地图": {
                name: "地图",
                content: [{
                    name: "OSM",
                    thumbnail: "osm2d.png",
                    fileName: "es6_o1"
                },{
                    name: "Google",
                    thumbnail: "google2d.png",
                    fileName: "es6_o2"
                },{
                    name: "GaoDe",
                    thumbnail: "gaode2d.png",
                    fileName: "es6_o3"
                }
            ]},
            "控件": {
                name: "控件",
                content: [{
                    name: "比例尺",
                    thumbnail: "blc2d.png",
                    fileName: "es6_o4"
                },{
                    name: "地图切换",
                    thumbnail: "switch2d.png",
                    fileName: "es6_o5"
                },{
                    name: "鹰眼",
                    thumbnail: "yinyan2d.png",
                    fileName: "es6_o6"
                }
            ]},
            "工具": {
                name: "工具",
                content: [{
                    name: "标绘",
                    thumbnail: "plot2d.png",
                    fileName: "es6_o7"
                },{
                    name: "测量",
                    thumbnail: "cltool2d.png",
                    fileName: "es6_o8"
                }
            ]},
            "可视化": {
                name: "可视化",
                content: [{
                    name: "加载面要素",
                    thumbnail: "region2d.png",
                    fileName: "es6_o9"
                }
            ]},
            "历史版本": {
                name: "历史版本",
                content: [{
                    name: "动态风场",
                    thumbnail: "2d_wind.gif",
                    fileName: "baidu-map-wind"
                },{
                    name: "台风轨迹",
                    thumbnail: "typhoon.gif",
                    fileName: "baidu-map-typhoon-old"
                },{
                    name: "目标城市",
                    thumbnail: "2d_move.gif",
                    fileName: "baidu-map-move"
                }
            ]},
        }
    },
    "二三维一体化": {
        name: "OL-Cesium",
        content: {
            "2D to 3D": {
            name: "数据展示",
            content: [{
                name: "数据展示",
                thumbnail: "gps.gif",
                fileName: "ol_cesium_demo"
            }]
            }
        }
    }
};
/**
 *key值：为exampleConfig配置的key值或者fileName值
 *      （为中间节点时是key值，叶结点是fileName值）
 *value值：fontawesome字体icon名
 *不分层
 */
var sideBarIconConfig = {
    "3D": "fa-globe",
    "2D": "fa fa-map",
    "二三维一体化": "fa-pie-chart",
};

/**
 *key值：为exampleConfig配置的key值
 *value值：fontawesome字体icon名
 *与sideBarIconConfig的区别：sideBarIconConfig包括侧边栏所有层级目录的图标，exampleIconConfig仅包括一级标题的图标
 */
var exampleIconConfig = {
    "3D": "fa-globe",
    "2D": "fa fa-map",
    "二三维一体化": "fa-pie-chart",
};