/*
 * @Descripttion: 
 * @version: 1.0
 * @Author: zhangti
 * @Date: 2019-09-20 09:32:20
 * @LastEditors: sueRimn
 * @LastEditTime: 2019-11-19 15:04:31
 */

/**
 * 动态画实体
 */
export default class entityFactory{

    constructor(obj){
        //初始化
       this.options = null;
       switch(obj.type){
           case 'triangleMeasure':this.createTriangleMeasure(obj.data);break;
           case 'createLine' :this.createLine(obj.data);break;
           case 'dynamicCylinder' :this.dynamicCylinder(obj.data);break;
           case 'createPolygon' :this.createPolygon(obj.data);break;
           case 'createScan' :this.createScan(obj.data);break;
       }
       return this.options;
    }
    /**
     * 动态创建三角形
     * 应用于 三角测量
     * @param {*} poly 
     */
    createTriangleMeasure(poly){
        this.options = {
            name: poly.name,
            polyline: {
                show: true,
                positions: [],
                material: Cesium.Color.GOLD,
                width: 2
            },
            label: {
                font: '18px sans-serif',
                fillColor: Cesium.Color.GOLD,
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                outlineWidth: 2,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                pixelOffset: poly.label.offset
            }
        };
        this.positions = poly.positions;
        this.label = poly.label;
        //实时更新polygon.hierarchy
        var _self = this;
        var _update = function () {
            return _self.positions;
        };
        var _update_label = function () {
            if(_self.positions.length == 1)
                            return false;
            return _self.positions[1];
        };
        var _text = function () {
            if(typeof _self.label.fn == 'function'){  //fn 转换函数 scaler 换算  unit 单位
                var text_temp = _self.label.fn(_self.positions);
                text_temp = (text_temp / _self.label.scaler) + _self.label.unit;
                return text_temp;
            }
        };
        this.options.polyline.positions = new Cesium.CallbackProperty(_update, false);
        this.options.position = new Cesium.CallbackProperty(_update_label, false);
        this.options.label.text = new Cesium.CallbackProperty(_text, false);
    }
    /**
     * 动态创建直线
     * @param {*} positions 
     */
    createLine(opt){
        this.options = {
            name: '直线',
            polyline: {
                show: true,
                positions: [],
                material: opt.material == undefined ? Cesium.Color.CHARTREUSE : opt.material,
                width: opt.width == undefined ? 5 : opt.width,
                clampToGround:opt.clampToGround == undefined ? false : true  //贴地
            }
        };
        this.positions = opt.positions;
        //实时更新polyline.positions
        var _self = this;
        var _update = function () {
            return _self.positions;
        };
        this.options.polyline.positions = new Cesium.CallbackProperty(_update, false);
    }
    /**
     * 动态绑定柱体
     * 应用于 卫星过境 无人机
     * 扫描
     * @param {*} obj 
     */
    dynamicCylinder(obj){
        let c = obj.cylinder;
        this.options = {
            cylinder: {
               HeightReference: Cesium.HeightReference.RELATIVE_TO_GROUND, //表示相对于地形的位置。
               length: c.length,     //长度
               topRadius:0,    //顶点半径
               bottomRadius:c.bottomRadius,  //底部半径
               material:new Cesium.Color(0, 1, 1, .4),
               slices:c.slices
           }
       }
       this.positions = obj.positions;
       this.entity = obj.entity;
       this.v = obj.v;
       var _self = this;
       var _update = function(){
           var positions = _self.entity.position.getValue(_self.v.clock.currentTime);
           var cartographic = _self.v.scene.globe.ellipsoid.cartesianToCartographic(positions);
           var lat = Cesium.Math.toDegrees(cartographic.latitude)
           , lng = Cesium.Math.toDegrees(cartographic.longitude)
           ,hei = parseFloat(cartographic.height/4);
           return Cesium.Cartesian3.fromDegrees(lng, lat,0);
       };
       var _length = function(){
           var positions = _self.entity.position.getValue(_self.v.clock.currentTime);
           var cartographic = _self.v.scene.globe.ellipsoid.cartesianToCartographic(positions);
           return cartographic.height * 2;
       }
       this.options.position = new Cesium.CallbackProperty(_update,false);
       this.options.cylinder.length = new Cesium.CallbackProperty(_length,false);
    }
    /**
     * 动态创建多边形
     * 应用 面积量测 淹没分析
     * @param {*} positions 
     */
    createPolygon(obj){
        try {
            this.options = {
                name:'多边形',
                polygon : {
                    hierarchy : [],
                    // perPositionHeight : true,
                    material : obj.material == undefined ? Cesium.Color.CHARTREUSE.withAlpha(0.3):obj.material, //Cesium.Color.CHARTREUSE.withAlpha(0.5)
                    // heightReference:20000
                }
            };
            this.hierarchy = obj.positions;
            let _self = this;
            let _update = function(){
                return _self.hierarchy;
            };
            //实时更新polygon.hierarchy
            this.options.polygon.hierarchy = new Cesium.CallbackProperty(_update,false);
        } catch (error) {
           console.log(error); 
        } 
    }
    /***
     * 创建扫描实体
     * opt.v
     * opt.positions
     * positions{lat,lon,alt}
     */
    createScan(opt){
        let _self = this,viewer= opt.v,length = opt.positions.alt;
        _self.modelMatrix = opt.modelMatrix;
        // 4 创建雷达放射波
        var cylinderGeometry = new Cesium.CylinderGeometry({ // 4.1 先创建Geometry
            length:length,
            topRadius: 0.0,
            bottomRadius: length * 0.5,
            //vertexFormat : Cesium.PerInstanceColorAppearance.VERTEX_FORMAT
            vertexFormat: Cesium.MaterialAppearance.MaterialSupport.TEXTURED.vertexFormat
        });
        var redCone = new Cesium.GeometryInstance({  // 4.2 创建GeometryInstance
            geometry: cylinderGeometry,
            modelMatrix:_self.modelMatrix,
            // attributes : {
            //     color : Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.RED)
            // }
        });
        var radar = viewer.scene.primitives.add(new Cesium.Primitive({// 4.3 创建Primitive
            geometryInstances: [redCone],
            // appearance : new Cesium.PerInstanceColorAppearance({
            //     closed : true,
            //     translucent: false
            // })
            appearance: new Cesium.MaterialAppearance({
                // 贴图像纹理
                // material: Cesium.Material.fromType('Image', {
                //     image: '../../SampleData/models/CesiumBalloon/CesiumBalloonPrint_singleDot.png'
                // }),

                // 贴棋盘纹理
                // material: Cesium.Material.fromType('Checkerboard'),

                // 自定义纹理
                material: new Cesium.Material({
                    fabric: {
                        type: 'VtxfShader1',
                        uniforms: {
                            color: new Cesium.Color(0.2, 1.0, 0.0, 1.0),
                            repeat: 30.0,
                            offset: 0.0,
                            thickness: 0.3,
                        },
                        source: `
                            uniform vec4 color;
                            uniform float repeat;
                            uniform float offset;
                            uniform float thickness;

                            czm_material czm_getMaterial(czm_materialInput materialInput)
                            {
                                czm_material material = czm_getDefaultMaterial(materialInput);
                                float sp = 1.0/repeat;
                                vec2 st = materialInput.st;
                                float dis = distance(st, vec2(0.5));
                                float m = mod(dis + offset, sp);
                                float a = step(sp*(1.0-thickness), m);

                                material.diffuse = color.rgb;
                                material.alpha = a * color.a;

                                return material;
                            }
                        `
                    },
                    translucent: false
                }),
                faceForward : false, // 当绘制的三角面片法向不能朝向视点时，自动翻转法向，从而避免法向计算后发黑等问题
                closed: true // 是否为封闭体，实际上执行的是是否进行背面裁剪
            }),
        }));

        // 5 动态修改雷达材质中的offset变量，从而实现动态效果。
        viewer.scene.preUpdate.addEventListener(function() {
            var offset = radar.appearance.material.uniforms.offset;
            offset -= 0.001;
            if (offset > 1.0) {
                offset = 0.0;
            }
            radar.appearance.material.uniforms.offset = offset;
        })
        let _update = function(){
            return _self.modelMatrix;
        }
        radar.modelMatrix = new Cesium.CallbackProperty(_update,true);
        return radar;
    }
}