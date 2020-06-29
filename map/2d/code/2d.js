/*
 * @Descripttion: 
 * @version: 1.0
 * @Author: zhangti
 * @Date: 2019-10-29 15:07:28
 * @LastEditors: sueRimn
 * @LastEditTime: 2019-11-27 10:12:25
 */
/**
 * 二维地图API封装
 */
import Map from 'ol/Map';
import View from 'ol/View';
import Collection from 'ol/Collection';
import * as olOverlay from 'ol/Overlay';
import * as olControl from 'ol/control';
import * as olLayer from 'ol/layer';
import * as olSource from 'ol/source';
import * as olStyle from 'ol/style';
import * as olProj from 'ol/proj';
export default class OlMap{
    /**
     * 创建地图
     */
    constructor(dom,initParam){
        /**
         * 拷贝参数
         */
        for(let key in initParam){
            this[key] = initParam[key];
        }
        /**
         * 初始化地图
         */
        this._2dmap = this.initMap(dom,initParam);
    }
    /**
     * 地图对象
     */
    initMap(dom,options){
        /**
         * 配置
         */
        let _zoom = 3;
        let _maxZoom = 18;
        let _minZoom = 2;
        let _center = olProj.fromLonLat([101.4173, 37.9204]);
        let _rotation = 0;
        //鼠标控件
        let mousePositionControl = new olControl.MousePosition({
            coordinateFormat: ol.coordinate.createStringXY(6),
            projection: 'EPSG:4326',
            undefinedHTML: '&nbsp;'
        });
        //弹出窗口
        let _popup = new olOverlay.Popup({
            popupClass: "default", //"tooltips", "warning" "black" "default", "tips", "shadow",
            closeBox: true,
            //onclose: function(){ console.log("You close the box"); },
            // onshow: function() { console.log("You opened the box"); },
            positioning: 'bottom-center',
            autoPan: true,
            offset: [1.2, -20],
            autoPanAnimation: {
                duration: 100
            }
        });   
        _popup.addPopupClass('shadow'); //添加阴影

        //定义默认标记图层
        let _markersLayer = new olLayer.Vector({
            title: '标记图层',
            source: new olSource.Vector({
                wrapX: false
            })
        });
        let _vectorLayer = new olLayer.Vector({
            title: '矢量图层',
            source: new olSource.Vector({
                wrapX: false
            })
        });

        //定义默认量算图层
        let _mesureLayer = new olLayer.Vector({
            title: '量算图层',
            source: new olSource.Vector(),
            style: new olStyle.Style({
                fill: new olStyle.Fill({
                    color: 'rgba(255, 255, 255, 0.2)'
                }),
                stroke: new olStyle.Stroke({
                    color: '#ffcc33',
                    width: 2
                }),
                image: new olStyle.Circle({
                    radius: 7,
                    fill: new olStyle.Fill({
                        color: '#ffcc33'
                    })
                })
            })
        });

        //定义默认热力图层
        let _heatmapLayer = new olLayer.Heatmap({
            title: '热力图层',
            source: new olSource.Vector({
                wrapX: false
            }),
            blur: parseInt(20, 10),
            radius: parseInt(5, 10),
            visible: true
        });
        //定义基础图层
        let _baseLayerGroup = new olLayer.Group({
            'title': '基础底图',
            openInLayerSwitcher: true,
            layers: [
                new olLayer.Tile({
                    title: '天地图影像-网络',
                    type: 'base',
                    visible: false,
                    source: new olSource.XYZ({
                        url: Config.URL.TDT_RasterUrl
                    })
                })
            ]
        });
        //定义叠加图层
        let _overlayersGroup = new olLayer.Group({
            'title': '叠加图层',
            openInLayerSwitcher: true,
            layers: [
                new olLayer.Tile({
                    title: '天地图影像注记-网络',
                    type: 'overlay',
                    visible: false,
                    source: new olSource.XYZ({
                        url: Config.URL.TDT_RasterAnoUrl
                    })
                })
            ]
        });
        /**
         * 判断传入的opt 是否有参数
         * 无参给默认值
         */
        if (options) {
            _zoom = options.zoom || 3;
            _center = olProj.fromLonLat(options.center) || olProj.fromLonLat([101.4173, 37.9204]);
            _rotation = options.rotation || 0;
            _maxZoom = options.maxZoom || 18;
            _minZoom = options.minZoom || 2;
    
            //如果options中有定义图层组则使用options中提供的
            if (options.baseLayerGroup) {
                _baseLayerGroup = options.baseLayerGroup;
            }
    
            if (options.overlayersGroup) {
                _overlayersGroup = options.overlayersGroup;
            }
        }
        //拷贝对象
        this.popup = _popup;
        this.popups = new Collection([]);
        this.baseLayerGroup = _baseLayerGroup;
        this.overlayersGroup = _overlayersGroup;
        this.markersLayer = _markersLayer;
        this.heatmapLayer = _heatmapLayer;
        this.mesureLayer = _mesureLayer;
        this.vectorLayer = _vectorLayer;
        this.zoom = _zoom;
        this.center = _center;
        this.rotation = _rotation;
        this.maxZoom = _maxZoom;
        this.minZoom = _minZoom;

         //添加默认图层
        this.overlayersGroup.getLayers().push(_mesureLayer);
        this.overlayersGroup.getLayers().push(_heatmapLayer);
        this.overlayersGroup.getLayers().push(_vectorLayer);
        this.overlayersGroup.getLayers().push(_markersLayer);
        //初始化聚合图层
        this._initClusterLayer();
        /**
         * 创建地图对象
         */
        let _map = new Map({
            layers: [
                _baseLayerGroup,
                _overlayersGroup
            ],

            controls: ol.control.defaults({
                attributionOptions: /** @type {olx.control.AttributionOptions} */ ({
                    collapsible: false
                })
            }).extend([mousePositionControl, new olControl.FullScreen({
                source: 'fullscreen'
            })]),
            target: document.getElementById(dom),
            view: new View({
                zoom: _zoom,
                center: _center,
                rotation: _rotation,
                maxZoom: _maxZoom,
                minZoom: _minZoom
            }),
            loadTilesWhileInteracting: true,
            logo: false
        });

        // 添加图层管理器
        let layerSwitcher = new olControl.LayerSwitcher({
            tipLabel: '图层管理' // Optional label for button
        });
        _map.addControl(layerSwitcher);

        //设置popup显示的地图
        _popup.setMap(_map);

        return _map;
    }
    /**
     * 聚合图层
     */
    _initClusterLayer(overlayersGroup){
        // Style for the clusters
        let styleCache = {};
        // Cluster Source
        let _clusterSource = new olSource.Cluster({
            distance: 40,
            source: new olSource.Vector()
        });
        // Animated cluster layer
        let _clusterLayer = new olLayer.AnimatedCluster({
            name: '动态聚合图',
            source: _clusterSource,
            animationDuration: 700,
            // Cluster style
            style: function (feature, resolution) {
                let size = feature.get('features').length;
                let style = styleCache[size];
                if (!style) {
                    let color = size > 25 ? "192,0,0" : size > 8 ? "255,128,0" : "0,128,0";
                    let radius = Math.max(8, Math.min(size * 0.75, 20));
                    let dash = 2 * Math.PI * radius / 6;
                    dash = [0, dash, dash, dash, dash, dash, dash];
                    style = styleCache[size] = [new olStyle.Style({
                        image: new olStyle.Circle({
                            radius: radius,
                            stroke: new olStyle.Stroke({
                                color: "rgba(" + color + ",0.5)",
                                width: 15,
                                lineDash: dash
                            }),
                            fill: new olStyle.Fill({
                                color: "rgba(" + color + ",1)"
                            })
                        }),
                        text: new olStyle.Text({
                            text: size.toString(),
                            fill: new olStyle.Fill({
                                color: '#fff'
                            })
                        })
                    })];
                }
                return style;
            }
        });
        this.clusterLayer = _clusterLayer;
        overlayersGroup.getLayers().push(this.clusterLayer);
    }

}