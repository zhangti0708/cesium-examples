/*
 * @Descripttion: 
 * @version: 1.0
 * @Author: zhangti
 * @Date: 2019-10-17 11:54:57
 * @LastEditors  : sueRimn
 * @LastEditTime : 2020-01-02 11:59:24
 */
/**
 * primitives 绘图类
 * 绘图管理
 */
import Camera from './camera.js'
export default class Primitives{

    constructor(core){
        /**
         * primitives 实体
         */
        this.primitives = core.scene.primitives;
        /**
         * 相机对象
         */
        this.ccc = new Camera(core);

    }
    /**
     * 添加一个图形
     * @param {*} primitive 
     */
    add(primitive){
        this.primitives.add(primitive);
    }

    /**
     * 删除一个图形
     * @param {*} primitive 
     */
    remove(primitive){
        this.primitives.remove(primitive);
    }
    /**
     * 创建一个图形容器
     */
    createPrimitives(){
        return new Cesium.Primitive();
    }
    /**
     * 计算矩阵
     * @param {*} option 
     */
    countModelMatrix(positions){
        let lon = positions.lon,lat = positions.lat,length = positions.alt;
        let positionOnEllipsoid = Cesium.Cartesian3.fromDegrees(lon, lat);  // 1.2 地面位置(垂直地面)
        let centerOnEllipsoid = Cesium.Cartesian3.fromDegrees(lon, lat, length*0.5);    // 1.3 中心位置
        let topOnEllipsoid = Cesium.Cartesian3.fromDegrees(lon, lat, length);   // 1.4 顶部位置(卫星位置)
        let modelMatrix = Cesium.Matrix4.multiplyByTranslation(  // 1.5 矩阵计算
            Cesium.Transforms.eastNorthUpToFixedFrame(positionOnEllipsoid),
            new Cesium.Cartesian3(0.0, 0.0, length * 0.5), new Cesium.Matrix4()
        );
        return modelMatrix;
    }
    /**
     * 3DTileset类型
     */
    create3DTileset(option){
        let _self = this;
        let _3DTileset = new Cesium.Cesium3DTileset({
            url: option.url
        });
        let heightStyle = new Cesium.Cesium3DTileStyle({
            color: {
                conditions: [
                    ['${height} >= 300', 'rgba(45, 0, 75, 0.3)'],
                    ['${height} >= 200', 'rgba(102, 71, 151, 0.3)'],
                    ['${height} >= 100', 'rgba(170, 162, 204, 0.3)'],
                    ['${height} >= 50', 'rgba(224, 226, 238, 0.3)'],
                    ['${height} >= 25', 'rgba(252, 230, 200, 0.3)'],
                    ['${height} >= 10', 'rgba(248, 176, 87, 0.3)'],
                    ['${height} >= 5', 'rgba(198, 106, 11, 0.3)'],
                    ['true', 'rgba(127, 59, 8, 0.3)']
                ]
            }
        });
        _3DTileset.readyPromise.then(function (data) {
            _self.tilesetData = data;
            _self.tilesetData.style = heightStyle;
            _self.add(_self.tilesetData);
            _self.ccc.zoomTo(_self.tilesetData);
        }).otherwise(function (error) {
            console.log(error);
        });
    }
    remove3DTileset(){
        if(this.tilesetData == undefined){
            return false;
        }
        this.primitives.remove(this.tilesetData);
    }



 }