/*
 * @Descripttion: 
 * @version: 1.0
 * @Author: zhangti
 * @Date: 2019-12-21 11:52:12
 * @LastEditors: sueRimn
 * @LastEditTime: 2019-12-21 14:47:54
 */
function createTerrainProviderViewModels() {
    var ProviderViewModel=Cesium.ProviderViewModel;
    var buildModuleUrl=Cesium.buildModuleUrl;
    var createWorldTerrain=Cesium.createWorldTerrain;
    var EllipsoidTerrainProvider=Cesium.EllipsoidTerrainProvider;

    var providerViewModels = [];
    providerViewModels.push(new ProviderViewModel({
        name : 'WGS84 基准平面',
        iconUrl : buildModuleUrl('Widgets/Images/TerrainProviders/Ellipsoid.png'),
        tooltip : 'WGS84 标准球体,即EPSG:4326',
        category: '地形图层',
        creationFunction : function() {
            return new EllipsoidTerrainProvider();
        }
    }));
    providerViewModels.push(new ProviderViewModel({
        name : 'chinaDEM',
        iconUrl : buildModuleUrl('Widgets/Images/TerrainProviders/CesiumWorldTerrain.png'),
        tooltip : '高精度地形',
        category: '地形图层',
        creationFunction : function() {
            return new Cesium.CesiumTerrainProvider({
                url: "/chinadem/"
            })
        }
    }));

    
   /* providerViewModels.push( new Cesium.CesiumTerrainProvider({
        url: "/chinadem/", // 默认立体地表
       //url:"/terrain/ctb-merger/" 
       //requestVertexNormals: true,// 请求照明
        //requestWaterMask: true    // 请求水波纹效果
    }));*/
   /* providerViewModels.push(new ProviderViewModel({
        name : '全球地形',
        iconUrl : buildModuleUrl('Widgets/Images/TerrainProviders/CesiumWorldTerrain.png'),
        tooltip : '高精度全球地形',
        category: '地形图层',
        creationFunction : function(){
            return createWorldTerrain({
                requestWaterMask: true,
                requestVertexNormals: true
            });
        }
    }));*/
    


    return providerViewModels;
}
