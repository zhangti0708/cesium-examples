

function createImageProviderViewModels(){
    var ProviderViewModel=Cesium.ProviderViewModel;
    var createWorldImagery=Cesium.createWorldImagery;
    var IonWorldImageryStyle=Cesium.IonWorldImageryStyle;
    var MapboxImageryProvider=Cesium.MapboxImageryProvider;
    var ArcGisMapServerImageryProvider=Cesium.ArcGisMapServerImageryProvider;
    var createOpenStreetMapImageryProvider=Cesium.createOpenStreetMapImageryProvider;
    var IonImageryProvider=Cesium.IonImageryProvider;
    var buildModuleUrl=Cesium.buildModuleUrl;
    var UrlTemplateImageryProvider=Cesium.UrlTemplateImageryProvider;

    var providerViewModels = [];


        //google
        providerViewModels.push(new ProviderViewModel({
            name : '本地谷歌图',
            iconUrl : buildModuleUrl('Widgets/Images/ImageryProviders/sentinel-2.png'),
            tooltip : '本地谷歌图.',
            category : '卫星影像',
            creationFunction : function() {                
                return new Cesium.UrlTemplateImageryProvider({url: '/bigmap/tile/gettile/GoogleChinaSatelliteHybird/{z}/{x}/{y}'})
            }
        }));
        //
        providerViewModels.push(new ProviderViewModel({
            name : 'NaturalEarthII',
            iconUrl : buildModuleUrl('Widgets/Images/ImageryProviders/naturalEarthII.png'),
            tooltip : 'NaturalEarthII.',
            category : '卫星影像',
            creationFunction : function() {                
                return Cesium.createTileMapServiceImageryProvider({url : Cesium.buildModuleUrl('Assets/Textures/NaturalEarthII')})
            }
        }));
        providerViewModels.push(new ProviderViewModel({
            name : '谷歌地貌图',
            iconUrl : buildModuleUrl('Widgets/Images/ImageryProviders/mapboxTerrain.png'),
            tooltip : '谷歌地貌图',
            category : '卫星影像',
            creationFunction : function() {                
                return new Cesium.UrlTemplateImageryProvider({url: '/bigmap/tile/gettile/GoogleChinaTerrain/{z}/{x}/{y}'})
            }
        }));
        providerViewModels.push(new ProviderViewModel({
            name : '地球夜景',
            iconUrl : buildModuleUrl('Widgets/Images/ImageryProviders/earthAtNight.png'),
            tooltip : '地球夜景',
            category : '卫星影像',
            creationFunction : function() {                
                return new Cesium.UrlTemplateImageryProvider({url: '/bigmap/tile/gettile/ChinaOnlineStreetPurplishBlue/{z}/{x}/{y}'})
            }
        }));
        //加载天地图
       /* providerViewModels.push(new ProviderViewModel({
            name : '天地图影像',
            iconUrl : buildModuleUrl('Widgets/Images/ImageryProviders/tdt.png'),
            tooltip : '天地图影像.',
            category : '卫星影像',
            creationFunction : function() {                
                return new Cesium.WebMapTileServiceImageryProvider({
                        url: 'http://t0.tianditu.gov.cn/img_w/wmts?tk=290396f07dfcb687fb6c525f2acf35f3',
                                layer:'img',
                                style:'default',
                                tileMatrixSetID:'w',
                                format:'tiles',
                                maximumLevel: 18
                    
                    });
            }
        }));*/
        //bing
        /*providerViewModels.push(new ProviderViewModel({
            name : 'Bing卫星地图',
            iconUrl : buildModuleUrl('Widgets/Images/ImageryProviders/bingAerial.png'),
            tooltip : '必应卫星地图',
            category: '卫星影像',
            creationFunction : function() {
                return createWorldImagery({
                    style : IonWorldImageryStyle.AERIAL
                });
            }
        }));*/
        //必应带标记地图，标记有偏移
        // providerViewModels.push(new ProviderViewModel({
        //     name : 'Bing Maps Aerial with Labels',
        //     iconUrl : buildModuleUrl('Widgets/Images/ImageryProviders/bingAerialLabels.png'),
        //     tooltip : 'Bing Maps aerial imagery with labels, provided by Cesium ion',
        //     category : 'Cesium ion',
        //     creationFunction : function() {
        //         return createWorldImagery({
        //             style : IonWorldImageryStyle.AERIAL_WITH_LABELS
        //         });
        //     }
        // }));
        //必应道路地图  有偏移
        // providerViewModels.push(new ProviderViewModel({
        //     name : 'Bing Maps Roads',
        //     iconUrl : buildModuleUrl('Widgets/Images/ImageryProviders/bingRoads.png'),
        //     tooltip : 'Bing Maps standard road maps, provided by Cesium ion',
        //     category : 'Cesium ion',
        //     creationFunction : function() {
        //         return createWorldImagery({
        //             style : IonWorldImageryStyle.ROAD
        //         });
        //     }
        // }));
       /* providerViewModels.push(new ProviderViewModel({
            name : '省级蓝图',
            iconUrl : URLS.BlueMAP,
            tooltip : '必应卫星地图',
            category: '卫星影像',
            creationFunction : function() {
                return new UrlTemplateImageryProvider({
                    url : URLS.BlueMAP,
                    enablePickFeatures : false
                });
            }
        }));*/

        /*providerViewModels.push(new ProviderViewModel({
            name: 'Mapbox卫星地图',
            tooltip: 'Mapbox卫星影像https://www.mapbox.com/maps/',
            iconUrl: buildModuleUrl('Widgets/Images/ImageryProviders/mapboxSatellite.png'),
            category : '卫星影像',
            creationFunction: function() {
                return new MapboxImageryProvider({
                    mapId: 'mapbox.satellite'
                });
            }
        }));*/

        // providerViewModels.push(new ProviderViewModel({
        //     name: 'Mapbox街道地图',
        //     tooltip: 'Mapbox街道影像 https://www.mapbox.com/maps/',
        //     iconUrl: buildModuleUrl('Widgets/Images/ImageryProviders/mapboxTerrain.png'),
        //     category : '在线地图',
        //     creationFunction: function() {
        //         return new MapboxImageryProvider({
        //             mapId: 'mapbox.streets'
        //         });
        //     }
        // }));

        /*providerViewModels.push(new ProviderViewModel({
            name: '街道地图',
            tooltip: 'Mapbox街道影像 https://www.mapbox.com/maps/',
            iconUrl: buildModuleUrl('Widgets/Images/ImageryProviders/mapboxStreets.png'),
            category : '矢量图层',
            creationFunction: function() {
                return new MapboxImageryProvider({
                    mapId: 'mapbox.streets-basic'
                });
            }
        }));

        providerViewModels.push(new ProviderViewModel({
            name : 'ESRI全球影像',
            iconUrl : buildModuleUrl('Widgets/Images/ImageryProviders/esriWorldImagery.png'),
            tooltip : 'ArcGis全球影像',
            category : '卫星影像',
            creationFunction : function() {
                return new ArcGisMapServerImageryProvider({
                    url : 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer',
                    enablePickFeatures : false
                });
            }
        }));

        providerViewModels.push(new ProviderViewModel({
            name : 'ESRI全球街道地图',
            iconUrl : buildModuleUrl('Widgets/Images/ImageryProviders/esriWorldStreetMap.png'),
            tooltip : 'ArcGis全球街道地图',
            category : '矢量图层',
            creationFunction : function() {
                return new ArcGisMapServerImageryProvider({
                    url : 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer',
                    enablePickFeatures : false
                });
            }
        }));*/

//         providerViewModels.push(new ProviderViewModel({
//             name : 'ESRI National Geographic',
//             iconUrl : buildModuleUrl('Widgets/Images/ImageryProviders/esriNationalGeographic.png'),
//             tooltip : '\
// This web map contains the National Geographic World Map service. This map service is designed to be used as a general reference map \
// for informational and educational purposes as well as a basemap by GIS professionals and other users for creating web maps and web \
// mapping applications.\nhttp://www.esri.com',
//             category : 'Other',
//             creationFunction : function() {
//                 return new ArcGisMapServerImageryProvider({
//                     url : 'https://services.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/',
//                     enablePickFeatures : false
//                 });
//             }
//         }));

       /* providerViewModels.push(new ProviderViewModel({
            name : 'Open\u00adStreet\u00adMap',
            iconUrl : buildModuleUrl('Widgets/Images/ImageryProviders/openStreetMap.png'),
            tooltip : 'OSM地图',
            category : '矢量图层',
            creationFunction : function() {
                return createOpenStreetMapImageryProvider({
                    url : 'https://a.tile.openstreetmap.org/'
                });
            }
        }));

        providerViewModels.push(new ProviderViewModel({
            name : '水彩地图',
            iconUrl : buildModuleUrl('Widgets/Images/ImageryProviders/stamenWatercolor.png'),
            tooltip : '水彩地图.\nhttp://maps.stamen.com',
            category : '矢量图层',
            creationFunction : function() {
                return createOpenStreetMapImageryProvider({
                    url : 'https://stamen-tiles.a.ssl.fastly.net/watercolor/',
                    credit : 'Map tiles by Stamen Design, under CC BY 3.0. Data by OpenStreetMap, under CC BY SA.'
                });
            }
        }));

        providerViewModels.push(new ProviderViewModel({
            name : '水墨地图',
            iconUrl : buildModuleUrl('Widgets/Images/ImageryProviders/stamenToner.png'),
            tooltip : '水墨地图.\nhttp://maps.stamen.com',
            category : '矢量图层',
            creationFunction : function() {
                return createOpenStreetMapImageryProvider({
                    url : 'https://stamen-tiles.a.ssl.fastly.net/toner/',
                    credit : 'Map tiles by Stamen Design, under CC BY 3.0. Data by OpenStreetMap, under CC BY SA.'
                });
            }
        }));*/

        // providerViewModels.push(new ProviderViewModel({
        //     name : 'Sentinel-2',
        //     iconUrl : buildModuleUrl('Widgets/Images/ImageryProviders/sentinel-2.png'),
        //     tooltip : 'Sentinel-2 cloudless by EOX IT Services GmbH (Contains modified Copernicus Sentinel data 2016 and 2017).',
        //     category : 'Cesium ion',
        //     creationFunction : function() {
        //         return new IonImageryProvider({ assetId: 3954 });
        //     }
        // }));

        // providerViewModels.push(new ProviderViewModel({
        //     name : 'Blue Marble',
        //     iconUrl : buildModuleUrl('Widgets/Images/ImageryProviders/blueMarble.png'),
        //     tooltip : 'Blue Marble Next Generation July, 2004 imagery from NASA.',
        //     category : 'Cesium ion',
        //     creationFunction : function() {
        //         return new IonImageryProvider({ assetId: 3845 });
        //     }
        // }));

        /*providerViewModels.push(new ProviderViewModel({
            name : '地球夜景',
            iconUrl : buildModuleUrl('Widgets/Images/ImageryProviders/earthAtNight.png'),
            tooltip : '地球夜景.',
            category : '矢量图层',
            creationFunction : function() {
                return new IonImageryProvider({ assetId: 3812 });
            }
        }));

        providerViewModels.push(new ProviderViewModel({
             name : 'Natural Earth\u00a0II',
             iconUrl : buildModuleUrl('Widgets/Images/ImageryProviders/naturalEarthII.png'),
             tooltip : 'Natural Earth II, darkened for contrast.\nhttp://www.naturalearthdata.com/',
             category : 'Cesium ion',
             creationFunction : function() {
                 return createTileMapServiceImageryProvider({
                     url : buildModuleUrl('Assets/Textures/NaturalEarthII')
                 });
             }
         }));*/




        //加载天地图
        /*providerViewModels.push(new ProviderViewModel({
            name : '天地图影像标记',
            iconUrl : buildModuleUrl('Widgets/Images/ImageryProviders/tdt.png'),
            tooltip : '天地图影像.',
            category : '卫星影像',
            creationFunction : function() {
                return new Cesium.WebMapTileServiceImageryProvider({
                        url: 'http://t0.tianditu.gov.cn/cia_w/wmts?tk=e4d316d8b2ee73d575d495b12e1289fd',
                              layer:'img',
                              style:'default',
                              tileMatrixSetID:'w',
                              format:'tiles',
                              maximumLevel: 18
                   
                   });
            }
        }));*/
        return providerViewModels;
}