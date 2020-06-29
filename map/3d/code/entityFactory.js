/*
 * @Descripttion: 
 * @version: 1.0
 * @Author: zhangti
 * @Date: 2019-09-20 09:32:20
 * @LastEditors  : sueRimn
 * @LastEditTime : 2020-01-02 12:12:49
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
                text_temp = poly.name + ' : ' + (text_temp / _self.label.scaler).toFixed(3) + ' ('+_self.label.unit +')';
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
                return new Cesium.PolygonHierarchy(_self.hierarchy);
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
    /**
     * 创建移动扫描物
     * createLightScan
     var data={
         circle:[0.003,117,35,30]// 第一个参数 0.003表示半径，第二个第三个分别表示底座圆心的坐标,第四个表示切割成多少个点。组成多少个面。越多会越卡 尽量实际项目不影响效果，越少越好。
        ,observer:[117.01,35.01,500]//观察点，也就是光源点
        ,positionList:[ //我们这里就不加高度了。不然太麻烦了 //以圆心为参考做偏移值获取，圆心坐标 [117,35]，简单点画个正方形吧 如果画圆的画，也可以多取点
            [117,35],//初始位置 (圆心坐标 [117,35]要和这个初始位置统一，不然会偏移出去)
            [117.01,35], //下一个点
            [117.01,35.01],
            [117,35.01],
            [117,35],//回来
        ]
        ,material:Cesium.Color.RED.withAlpha(0.5)//光的材质
        ,number:100//数字越小速度越快
    };
    */
   static createLightScan(opt){
        let viewer = opt.v, data = opt.data;
        let point = LightScanHelps.createLightScan_getCirclePoints(data.circle[0],data.circle[1],data.circle[2],data.circle[3]);   //生成分割点
        let entityCList =LightScanHelps.createLightScan_entityCList(viewer,point,data);  //生成 entityCList 圆锥
        LightScanHelps.createLightScan_changeAllPosition(data,entityCList,point);    //运行
        return entityCList;
    }
    /**
     * 灯光随着模型变化
     * 模型需要播放动画
     * czml
     * @param {*} viewer 
     * @param {*} data 
     * @param {*} model 
     */
    static createLightScanFollowEntity(opt){
        let viewer = opt.v, data = opt.data, model = opt.model;
        let point = LightScanHelps.createLightScan_getCirclePoints(data.circle[0],data.circle[1],data.circle[2],data.circle[3]); //生成分割点
        let entityCList=LightScanHelps.createLightScan_entityCList(viewer,point,data);    //生成 entityCList 圆锥
        viewer.scene.postRender.addEventListener(function () {       // 实时获取模型的经纬度。
            let center =model.position.getValue(viewer.clock.currentTime);//获取模型当前位置 //世界坐标（笛卡尔坐标）
            if(center){
                let ellipsoid=viewer.scene.globe.ellipsoid;
                let cartographic=ellipsoid.cartesianToCartographic(center);
                let lon=Cesium.Math.toDegrees(cartographic.longitude);
                let lat=Cesium.Math.toDegrees(cartographic.latitude);
                //var height=cartographic.height;
                //console.log(lon+";"+lat+";"+height);
                let X0=lon-data.circle[1],Y0=lat-data.circle[2]; //差值
                for(let i=0;i<entityCList.length;i++){
                    if(i==(entityCList.length-1)){
                        f(entityCList[i],[point[i].x, point[i].y, point[0].x, point[0].y],X0,Y0);
                    }else{
                        f(entityCList[i],[point[i].x, point[i].y, point[i+1].x, point[i+1].y],X0,Y0);
                    }
                }
            }
        });
        //修改每一个entity
        function f(entity,arr,X0,Y0) {
            entity.polygon.hierarchy=new Cesium.CallbackProperty(function () { //回调函数
                return  new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArrayHeights(
                    [
                        data.observer[0],data.observer[1],data.observer[2],//观察点
                        arr[0]+X0,arr[1]+Y0,0,
                        arr[2]+X0,arr[3]+Y0,0
                    ]))
            },false)
        }
        return entityCList;
    }
}

/**
 * 灯光移动扫描
 * 辅助函数
 */
class LightScanHelps {
    constructor(){}
    /*
    * 求圆周上等分点的坐标
    * ox,oy为圆心坐标
    * r为半径
    * count为等分个数
    */
    static createLightScan_getCirclePoints(r, ox, oy, count){
        var point = []; //结果
        var radians = (Math.PI / 180) * Math.round(360 / count), //弧度
            i = 0;
        for(; i < count; i++){
            var x = ox + r * Math.sin(radians * i),
                y = oy + r * Math.cos(radians * i);
            point.unshift({x:x,y:y}); //为保持数据顺时针
        }
        return point;
    }
    /**
     * 生成 entityCList面--形成圆锥
     * @param {*} viewer 
     * @param {*} point 
     * @param {*} data 
     */
    static createLightScan_entityCList(viewer,point,data){
        let lon=data.observer[0],lat=data.observer[1],h=data.observer[2];
        let entityCList=[];
        //创建 面
        for(let i=0;i<point.length;i++){
            let hierarchy;
            if(i==(point.length-1)){
                hierarchy = new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArrayHeights(
                    [
                        lon,lat,h,
                        point[i].x,point[i].y,0,
                        point[0].x,point[0].y,0
                    ]))
            }else{
                hierarchy = new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArrayHeights(
                    [
                        lon,lat,h,
                        point[i].x,point[i].y,0,
                        point[i+1].x,point[i+1].y,0
                    ]))
            }
            let entityC= viewer.entities.add({
                name:"三角形",
                polygon : {
                    hierarchy:hierarchy,
                    outline : false,
                    perPositionHeight:true,//允许三角形使用点的高度
                    material :data.material
                }
            });
            entityCList.push(entityC);
        }
        return entityCList
    }
    /**
     * 改变所有面的位置
     * @param {*} data 
     * @param {*} entityCList 
     * @param {*} point 
     */
    static createLightScan_changeAllPosition  (data,entityCList,point){
        for(let i=0;i<entityCList.length;i++){
            if(i!=entityCList.length-1){
                this.createLightScan_changeOnePosition(data,entityCList[i],[point[i].x, point[i].y, point[i+1].x, point[i+1].y]); //中间arr 代表的是点的坐标
            }else{
                this.createLightScan_changeOnePosition(data,entityCList[i],[point[i].x, point[i].y, point[0].x, point[0].y]);
            }
        } 
    }
    /**
     * 改变每个面的位置
     * @param {*} data 
     * @param {*} entity 
     * @param {*} arr 
     */
    static createLightScan_changeOnePosition(data,entity,arr){
        let positionList=data.positionList;
        let x,y,x0,y0,X0,Y0,n=0,a=0;//x代表差值 x0代表差值等分后的值，X0表示每次回调改变的值。a表示回调的循环窜次数，n表示扫描的坐标个数
        function f(i){
            x= positionList[i+1][0]-positionList[i][0];//差值
            y= positionList[i+1][1]-positionList[i][1];//差值
            x0=x/data.number;//将差值等分500份
            y0=y/data.number;
            a=0;
        }
        f(n);
        entity.polygon.hierarchy=new Cesium.CallbackProperty(function () { //回调函数
            if((Math.abs(X0)>=Math.abs(x))&&(Math.abs(Y0)>=Math.abs(y))){ //当等分差值大于等于差值的时候 就重新计算差值和等分差值  Math.abs
                n=n+1;
                if(n==positionList.length-1){
                    n=0;
                }
                arr[0]= arr[0]+X0;
                arr[1]= arr[1]+Y0;
                arr[2]= arr[2]+X0;
                arr[3]= arr[3]+Y0;
                f(n);//重新赋值 x y x0 y0
            }
            X0=a*x0;//将差值的等份逐渐递增。直到大于差值 会有精度丢失,所以扩大再加 x0=x0+0.0001
            Y0=a*y0;//将差值的等份逐渐递增。直到大于差值 会有精度丢失,所以扩大再加
            a++;
            return  new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArrayHeights(
                [
                    data.observer[0],data.observer[1],data.observer[2],
                    arr[0]+X0,arr[1]+Y0,0,
                    arr[2]+X0,arr[3]+Y0,0
                ]))
        },false)
    }
}
