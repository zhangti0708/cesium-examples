/*
 * @Descripttion: 量测封装类
 *  面积量测
 *  距离量测
 *  三角量测
 * @version: 1.0
 * @Author: zhangti
 * @Date: 2019-09-20 09:32:19
 * @LastEditors  : sueRimn
 * @LastEditTime : 2020-01-02 11:57:21
 */
import Handler from './handler.js';
import mouseManager from './mouseManager.js';
import Entitys from './entitys.js';
import entityFactory from './entityFactory.js';
import CVTools from './cvTool.js';
export default class Measure{

    constructor(core){
        /**
         * viewer
        */
        this.viewer = core;
        /**
         * 实体
         */
        this.entitys = new Entitys(core);
        /**
         * mouseManager
         * 坐标转换
         */
        this.mouseManager = new mouseManager(core);
        /**
         * 辅助工具
         */
        this.Tools = new CVTools();
         /**
         * 距离测量
         */
        this.lineSpace = {
            distance : 0,
            lineObj : undefined,
            positions : [],
            entity : [],
            getSpaceDistance(positions){  //空间两点距离计算函数
                let distance = 0;
                for (let i = 0; i < positions.length - 1; i++) {
                    let point1cartographic = Cesium.Cartographic.fromCartesian(positions[i]);
                    let point2cartographic = Cesium.Cartographic.fromCartesian(positions[i + 1]);
                    /**根据经纬度计算出距离**/
                    let geodesic = new Cesium.EllipsoidGeodesic();
                    geodesic.setEndPoints(point1cartographic, point2cartographic);
                    let s = geodesic.surfaceDistance;
                    //console.log(Math.sqrt(Math.pow(distance, 2) + Math.pow(endheight, 2)));
                    //返回两点之间的距离
                    s = Math.sqrt(Math.pow(s, 2) + Math.pow(point2cartographic.height - point1cartographic.height, 2));
                    distance = distance + s;
                }
                return distance.toFixed(2);
            }
        };
         /**
         * 面积测量
         */
        this.areaSpace = {
            distance : 0,
            polyObj : null,
            tempPoints:[],
            positions : [],
            entity : [],
            /**
             * 计算面积
             * @param {*} points 
             */
            getArea(points){
                var res = 0;
                //拆分三角曲面
                for (var i = 0; i < points.length - 2; i++) {
                    var j = (i + 1) % points.length;
                    var k = (i + 2) % points.length;
                    var totalAngle = this.Angle(points[i], points[j], points[k]);
                    var dis_temp1 = this.distance(this.positions[i], this.positions[j]);
                    var dis_temp2 = this.distance(this.positions[j], this.positions[k]);
                    res += dis_temp1 * dis_temp2 * Math.abs(Math.sin(totalAngle)) ;
                    console.log(res);
                }
                return (res/1000000.0).toFixed(4);
            },
            /**
             * 计算角度
             * @param {*} p1 
             * @param {*} p2 
             * @param {*} p3 
             */
            Angle(p1, p2, p3){
                var bearing21 = this.Bearing(p2, p1);
                var bearing23 = this.Bearing(p2, p3);
                var angle = bearing21 - bearing23;
                if (angle < 0) {
                    angle += 360;
                }
                return angle;
            },
            /**
             * 计算方向
             * @param {*} from 
             * @param {*} to 
             */
            Bearing(from, to){
                var radiansPerDegree = Math.PI / 180.0;//角度转化为弧度(rad)
                var degreesPerRadian = 180.0 / Math.PI;//弧度转化为角度
                var lat1 = from.lat * radiansPerDegree;
                var lon1 = from.lon * radiansPerDegree;
                var lat2 = to.lat * radiansPerDegree;
                var lon2 = to.lon * radiansPerDegree;
                var angle = -Math.atan2(Math.sin(lon1 - lon2) * Math.cos(lat2), Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon1 - lon2));
                if (angle < 0) {
                    angle += Math.PI * 2.0;
                }
                angle = angle * degreesPerRadian;//角度
                return angle;
            },
            distance(point1,point2){
                var point1cartographic = Cesium.Cartographic.fromCartesian(point1);
                var point2cartographic = Cesium.Cartographic.fromCartesian(point2);
                /**根据经纬度计算出距离**/
                var geodesic = new Cesium.EllipsoidGeodesic();
                geodesic.setEndPoints(point1cartographic, point2cartographic);
                var s = geodesic.surfaceDistance;
                //console.log(Math.sqrt(Math.pow(distance, 2) + Math.pow(endheight, 2)));
                //返回两点之间的距离
                s = Math.sqrt(Math.pow(s, 2) + Math.pow(point2cartographic.height - point1cartographic.height, 2));
                return s;
            }

        };
        /**
         * 三角测量
         */
        this.triangleSpace = {
            distance : 0,
            lineObj : [],
            entity :  [],
            position1 : [],
            position2 : [],
            position3 : [],
            getHeight(positions){
                let cartographic = Cesium.Cartographic.fromCartesian(positions[0]);
                let cartographic1 = Cesium.Cartographic.fromCartesian(positions[1]);
                let height_temp = cartographic1.height - cartographic.height;
                return height_temp.toFixed(2);
            },
            point_conf(positions){
                let cartographic = Cesium.Cartographic.fromCartesian(positions[0]);
                let cartographic1 = Cesium.Cartographic.fromCartesian(positions[1]);
                let point_temp = Cesium.Cartesian3.fromDegrees(Cesium.Math.toDegrees(cartographic.longitude), Cesium.Math.toDegrees(cartographic.latitude), cartographic1.height);
                return point_temp;
            },
            getDistance(positions){
                if(positions[1] == undefined){
                    return false;
                }
                let point1cartographic = Cesium.Cartographic.fromCartesian(positions[1]);
                let point2cartographic = Cesium.Cartographic.fromCartesian(positions[0]);
                /**根据经纬度计算出距离**/
                let geodesic = new Cesium.EllipsoidGeodesic();
                geodesic.setEndPoints(point1cartographic, point2cartographic);
                let s = geodesic.surfaceDistance;
                //console.log(Math.sqrt(Math.pow(distance, 2) + Math.pow(endheight, 2)));
                //返回两点之间的距离
                s = Math.sqrt(Math.pow(s, 2) + Math.pow(point2cartographic.height - point1cartographic.height, 2));
                return s; 
            },
            createPoint(cartesian,_self){
                let entity = _self.entitys.createEntity();
                entity.position = cartesian;
                entity.point = _self.entitys.getPoint();
                _self.triangleSpace.entity.push(_self.entitys.add(entity)); //创建点
            },
            createLine(_self){
                _self.triangleSpace.lineObj[0] = new entityFactory({type:"triangleMeasure",data:{name:'直线',positions:_self.triangleSpace.position1,label:{fn:_self.triangleSpace.getDistance,scaler:1000,unit:'公里',offset:new Cesium.Cartesian2(-20, 50)}}});
                _self.triangleSpace.lineObj[1] = new entityFactory({type:"triangleMeasure",data:{name:'高度',positions:_self.triangleSpace.position2,label:{fn:_self.triangleSpace.getHeight,scaler:1,unit:'米',offset:new Cesium.Cartesian2(20, -20)}}});
                _self.triangleSpace.lineObj[2] = new entityFactory({type:"triangleMeasure",data:{name:'水平线',positions:_self.triangleSpace.position3,label:{fn:_self.triangleSpace.getDistance,scaler:1000,unit:'公里',offset:new Cesium.Cartesian2(20, -50)}}}); 
                _self.triangleSpace.entity.push(_self.entitys.add(_self.triangleSpace.lineObj[0])); //创建线
                _self.triangleSpace.entity.push(_self.entitys.add(_self.triangleSpace.lineObj[1])); //创建线
                _self.triangleSpace.entity.push(_self.entitys.add(_self.triangleSpace.lineObj[2])); //创建线
            }
        };
    }
    /**
     * 删除测量
     */
    remove(){
        if(this.handlerAction)this.handlerAction.destroy();
        if(this._resultTip)this.entitys.remove(this._resultTip);
        if(this.areaSpace.entity.length > 0){
            for(let i in this.areaSpace.entity)
                this.entitys.remove(this.areaSpace.entity[i]);
        }
        if(this.triangleSpace.entity.length > 0){
            for(let i in this.triangleSpace.entity)
                this.entitys.remove(this.triangleSpace.entity[i]);
        }
        if(this.lineSpace.entity.length > 0){
            for(let i in this.lineSpace.entity)
                this.entitys.remove(this.lineSpace.entity[i]);
        }
       
    }
    /*
    * 测面积方法
    */ 
    drawArea(){
          /**
         * 点击
         */
        try {
            let _self = this;
            _self.viewer.scene.screenSpaceCameraController.enableRotate = false;//锁定相机
            _self._resultTip = _self.entitys.createMsgTip();
            this.handlerAction = new Handler(_self.viewer);  //handler实体对象
            _self.handlerAction.Action(function(e){ //第一次点击
                if(_self.Tools.nullBool(e.position)){
                    return false;
                }
                let cartesian = _self.mouseManager.screenToWorld(e.position);
                if(_self.areaSpace.positions == 0){
                    _self.areaSpace.positions.push(cartesian.clone())
                }
                _self.areaSpace.positions.push(cartesian); //模拟
    
                let cartographic = Cesium.Cartographic.fromCartesian(_self.areaSpace.positions[_self.areaSpace.positions.length - 1]);
                _self.areaSpace.tempPoints.push({ lon: Cesium.Math.toDegrees(cartographic.longitude), lat:  Cesium.Math.toDegrees(cartographic.latitude) ,hei:cartographic.height});
                /**
                 * 创建实体
                 */
                let entity = _self.entitys.createEntity();
                entity.position = cartesian;
                entity.point = _self.entitys.getPoint();
                _self.areaSpace.entity.push(_self.entitys.add(entity)); //创建点
            },_self.handlerAction.LEFT_CLICK);
            /**
             * 移动
             */
            _self.handlerAction.Action(function(e){
                if(_self.Tools.nullBool(e.endPosition)){
                     return false;
                }
                let cartesian = _self.mouseManager.screenToWorld(e.endPosition);
                if(!cartesian){
                    return false;
                }
                if(_self.areaSpace.positions.length >= 2){
                    if (!Cesium.defined(_self.areaSpace.polyObj)) {
                        _self.areaSpace.polyObj = new entityFactory({type:"createPolygon",data:{positions:_self.areaSpace.positions,material:Cesium.Color.CHARTREUSE.withAlpha(0.3)}});
                        _self.areaSpace.entity.push(_self.entitys.add(_self.areaSpace.polyObj)); //创建线
                    }else{
                        _self.areaSpace.positions.pop();
                        _self.areaSpace.positions.push(cartesian.clone());
                    }
                    _self.entitys.showTip(_self._resultTip,true,cartesian,'鼠标右键结束,平板长按结束');
                }else{
                    _self.entitys.showTip(_self._resultTip,true,cartesian,'点击地图');
                }
            },_self.handlerAction.MOUSE_MOVE);
            /**
             * 双击取消
             */
            this.handlerAction.Action(function(e){
                if(_self.Tools.nullBool(e.position)){
                    return false;
                }
                _self.handlerAction.destroy(); //关闭事件句柄
                _self.areaSpace.positions.pop(); //最后一个点无效
                var textArea = _self.areaSpace.getArea(_self.areaSpace.tempPoints) + "平方公里";
                let entity = _self.entitys.createEntity();
                entity.position = _self.areaSpace.positions[_self.areaSpace.positions.length - 1];
                entity.name = '多边形面积';
                entity.label = _self.entitys.getLabel(textArea);
    
                _self.areaSpace.entity.push(_self.entitys.add(entity));
                _self.viewer.scene.screenSpaceCameraController.enableRotate = true;//解锁相机
                _self.entitys.remove(_self._resultTip);
            },_self.handlerAction.RIGHT_CLICK);
        } catch (error) {
            console.log(error);
        }
    }
     /*
    * 测三角方法
    */ 
    drawTriangle(){
         /**
         * 点击
         */
        let _self = this;
        _self.viewer.scene.screenSpaceCameraController.enableRotate = false;//锁定相机
        this.handlerAction = new Handler(_self.viewer);  //handler实体对象
        _self._resultTip = _self.entitys.createMsgTip();
        _self.handlerAction.Action(function(e){ //第一次点击
            if(!e.position){
                return false;
            }
            if(_self.triangleSpace.position1.length == 0){ //开始
                let cartesian = _self.mouseManager.piTerrainToModule(e.position);  //判断拾取的坐标 地形 or 模型
                if(!cartesian)return false;
                _self.triangleSpace.position1.push(cartesian.clone());
                _self.triangleSpace.position1.push(cartesian.clone());
                _self.triangleSpace.position2.push( _self.triangleSpace.position1[0].clone());
                _self.triangleSpace.position2.push( _self.triangleSpace.position1[0].clone());
                //创建点
                _self.triangleSpace.createPoint(cartesian,_self);
                _self.handlerAction.COUNTER = _self.triangleSpace.position1.length;
            }else{ //第二次点击取消
                _self.handlerAction.destroy(); //关闭事件句柄 
                _self.entitys.remove(_self._resultTip);
                _self.viewer.scene.screenSpaceCameraController.enableRotate = true;//解锁相机
                let cartesian = _self.mouseManager.piTerrainToModule(e.position);  //判断拾取的坐标 地形 or 模型
                if(!cartesian)return false;
                //创建点
                //_self.triangleSpace.createPoint(cartesian,_self);
                _self.triangleSpace.position1.pop();
                _self.triangleSpace.position1.push(cartesian.clone());
                let tempPoints = _self.triangleSpace.point_conf(_self.triangleSpace.position1);
                //line 2 直刷新第二个点
                _self.triangleSpace.position2.pop();  
                _self.triangleSpace.position2.push(tempPoints.clone());
                //line 3 一直刷新
                _self.triangleSpace.position3.pop();
                _self.triangleSpace.position3.pop();    
                _self.triangleSpace.position3.push(tempPoints.clone());
                _self.triangleSpace.position3.push(_self.triangleSpace.position1[1].clone());
            }
        },_self.handlerAction.LEFT_CLICK);
        /**
         * 移动
         */
        _self.handlerAction.Actions(function(e){
            let cartesian = _self.mouseManager.piTerrainToModule(e.endPosition); 
            _self.entitys.showTip(_self._resultTip,true,cartesian,'点击地图');},function(e){ //两个
            if(e.endPosition == undefined){
                return false;
            }
            try {
                let cartesian = _self.mouseManager.piTerrainToModule(e.endPosition);  //判断拾取的坐标 地形 or 模型
                if(!cartesian)return false;
                if (!Cesium.defined(_self.triangleSpace.lineObj[0])) {//画
                    _self.triangleSpace.createLine(_self);
                } else {
                    _self.triangleSpace.position1.pop();
                    _self.triangleSpace.position1.push(cartesian.clone());
                    
                    let tempPoints = _self.triangleSpace.point_conf(_self.triangleSpace.position1);
                    //line 1
                    _self.triangleSpace.position2.pop();  
                    _self.triangleSpace.position2.push(tempPoints.clone());
                    //line 2
                    _self.triangleSpace.position3.pop(); 
                    _self.triangleSpace.position3.pop();    
                    _self.triangleSpace.position3.push(tempPoints.clone());
                    _self.triangleSpace.position3.push(_self.triangleSpace.position1[1].clone());  
                }
                _self.entitys.showTip(_self._resultTip,true,cartesian,'再次点击结束');
                
            } catch (error) {
                console.log(error);
            }
            
        },_self.handlerAction.MOUSE_MOVE,_self.handlerAction.COUNTER);
        /**
         * 右击结束
         */
       /* this.handlerAction.Action(function(e){
            if(!e.position){
                return false;
            }
            _self.handlerAction.destroy(); //关闭事件句柄 
            let cartesian = _self.mouseManager.piTerrainToModule(e.position);  //判断拾取的坐标 地形 or 模型
            if(!cartesian)return false;
            //创建点
            //_self.triangleSpace.createPoint(cartesian,_self);
            _self.triangleSpace.position1.pop();
            _self.triangleSpace.position1.push(cartesian.clone());
            let tempPoints = _self.triangleSpace.point_conf(_self.triangleSpace.position1);
            //line 2 直刷新第二个点
            _self.triangleSpace.position2.pop();  
            _self.triangleSpace.position2.push(tempPoints.clone());
            //line 3 一直刷新
            _self.triangleSpace.position3.pop();
            _self.triangleSpace.position3.pop();    
            _self.triangleSpace.position3.push(tempPoints.clone());
            _self.triangleSpace.position3.push(_self.triangleSpace.position1[1].clone());
        },_self.handlerAction.RIGHT_CLICK);*/
    }
     /*
    * 测距离方法
    */ 
    drawLine(){
        /**
         * 点击
         */
        let _self = this;
        this.handlerAction = new Handler(_self.viewer);  //handler实体对象
        _self.viewer.scene.screenSpaceCameraController.enableRotate = false;//锁定相机
        _self._resultTip = _self.entitys.createMsgTip();
        _self.handlerAction.COUNTER = 0; //初始化
        _self.handlerAction.Action(function(e){ //第一次点击
            if(_self.Tools.nullBool(e.position)){
                return false;
            }
            let cartesian = _self.mouseManager.screenToWorld(e.position);
            _self.lineSpace.positions.push(cartesian); //模拟
            _self.lineSpace.positions.push(cartesian.clone());
            /**
             * 创建实体
             */
            let entity = _self.entitys.createEntity();
            entity.position = cartesian;
            entity.point = _self.entitys.getPoint();
            entity.label = _self.entitys.getLabel(_self.lineSpace.distance + "米"); 
            _self.lineSpace.entity.push(_self.entitys.add(entity)); //创建点
        },_self.handlerAction.LEFT_CLICK);
        /**
         * 移动
         */
        _self.handlerAction.Action(function(e){
            if(_self.Tools.nullBool(e.endPosition)){
                 return false;
            }
            let cartesian = _self.mouseManager.screenToWorld(e.endPosition);
            if(_self.lineSpace.positions.length >= 2){
                if (!Cesium.defined(_self.lineSpace.lineObj)) {
                    _self.lineSpace.lineObj = new entityFactory({type:"createLine",data:{positions:_self.lineSpace.positions,clampToGround:true}});
                     if(_self.Tools.nullBool( _self.lineSpace.lineObj)){
                         return false;
                     }
                    console.log( _self.lineSpace.lineObj);
                    _self.lineSpace.entity.push(_self.entitys.add(_self.lineSpace.lineObj)); //创建线
                }else{
                    _self.lineSpace.positions.pop();
                    _self.lineSpace.positions.push(cartesian.clone());
                }
                _self.entitys.showTip(_self._resultTip,true,cartesian,'鼠标右键结束,平板长按结束');
            }else{
                _self.entitys.showTip(_self._resultTip,true,cartesian,'点击地图');
            }
            _self.lineSpace.distance = _self.lineSpace.getSpaceDistance(_self.lineSpace.positions);
        },_self.handlerAction.MOUSE_MOVE);
        /**
         * 右键取消
         */
        this.handlerAction.Action(function(e){
            if(_self.Tools.nullBool(e.position)){
                return false;
            }
            _self.handlerAction.destroy(); //关闭事件句柄
            _self.lineSpace.positions.pop(); //最后一个点无效
            _self.lineSpace.distance = 0;
            _self.viewer.scene.screenSpaceCameraController.enableRotate = true;//解锁相机
            _self.entitys.remove(_self._resultTip);
        },_self.handlerAction.RIGHT_CLICK);
    } 
}
