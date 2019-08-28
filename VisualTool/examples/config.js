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
            "工具": {
            name: "地图工具",
            content: [{
                name: "地图工具",
                thumbnail: "mapTool.gif",
                fileName: "03_arcgisTerrain"
            },{
                name: "Globe Terrain",
                thumbnail: "03_globeTerrain.jpg",
                fileName: "03_globeTerrain"
            }]},
            "三维效果": {
                name: "三维效果",
                content: [{
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
                }
            ]},
            "三维组件": {
                name: "三维组件",
                content: [{
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
                }]
            },
            "数据加载": {
                name: "数据加载",
                content: [{
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
                }
            ]},
            "可视化": {
                name: "可视化",
                content: [{
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
                }, {
                    name: "信息点",
                    thumbnail: "21_weibo.gif",
                    fileName: "21_weibo"
                }
            ]}
    }},
    "2D": {
        name: "2D",
        content: {
            "可视化": {
            name: "地图可视化",
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
            ]}
        }
    },
    "OL-Cesium": {
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
    "OL-Cesium": "fa-pie-chart",
};

/**
 *key值：为exampleConfig配置的key值
 *value值：fontawesome字体icon名
 *与sideBarIconConfig的区别：sideBarIconConfig包括侧边栏所有层级目录的图标，exampleIconConfig仅包括一级标题的图标
 */
var exampleIconConfig = {
    "3D": "fa-globe",
    "2D": "fa fa-map",
    "OL-Cesium": "fa-pie-chart",
};