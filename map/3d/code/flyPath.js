/*
 * @Descripttion: 
 * @version: 1.0
 * @Author: zhangti
 * @Date: 2019-09-29 11:55:55
 * @LastEditors  : sueRimn
 * @LastEditTime : 2020-01-13 15:08:58
 */
/**
 * 飞行路径封装类
 */
import config from './config.js'
import Camera from './camera.js'
import CVTools from './cvTool.js'
import Entitys from './entitys.js'
import entityFactory from './entityFactory.js'
import Handler from './handler.js'
import mouseManager from './mouseManager.js'
import {Components} from './BaseUI/component.js'
import ModelManager from './modelManager.js'
export default class FlyPath{

    constructor(v){
        this.init(v);
    }
    init(v){
        //核心类
        this.CoreV = v;
        //时钟对象
        this.flyClock = v.clock;
          /**
         * mouseManager
         * 坐标转换
         */
        this.mouseManager = new mouseManager(v);
        //默认飞行路线
        this.mFlyPath = [
            {longitude:116.538799, dimension:39.9948, height:500, time:0},
            {longitude:116.130034, dimension:38.291387, height:5000, time:120},
            {longitude:116.415192, dimension:34.841955, height:5000, time:240},
            {longitude:117.261468, dimension:31.831171, height:5000, time:360}, 
            {longitude:115.881671, dimension:28.70164, height:5000, time:480},
            {longitude:116.120835, dimension:24.308311, height:5000, time:600},
            {longitude:113.269254, dimension:23.13956, height:0, time:720}
        ]
       // this.fly2 =[{"longitude":-107.08841025193962,"dimension":45.31033338213459,"height":5000,"time":0},{"longitude":-105.25166034009193,"dimension":40.404816400358825,"height":5000,"time":120},{"longitude":-97.7981573821682,"dimension":38.897081458356766,"height":5000,"time":240},{"longitude":-92.60617541104816,"dimension":37.977773943834514,"height":5000,"time":360},{"longitude":-91.28551724903893,"dimension":41.236208915894856,"height":5000,"time":480},{"longitude":-93.50970453162954,"dimension":44.99794501378924,"height":5000,"time":600},{"longitude":-99.41429174199428,"dimension":47.25367543618461,"height":5000,"time":720}]
        //相机对象
        this.ccc = new Camera(v);
        //工具对象
        this.Tools = new CVTools();
        //实体对象
        this.entitys = new Entitys(v);
        //时间速率
        this.flySpeed = 10;
        //飞行时间间隔
        this.flyInterval = 120;
        //飞行高度
        this.flyHeight = 5000;
        //自定义画线
        this.positions = [];
        //自定义位置点信息
        this.lnglatPositions = [];
        //自定义线实体
        this.polyLine = null;
        //飞机实体
        this.pickedFeature = null;
        //模型管理
        this.ModelManager = new ModelManager(v);
    }
    /**
     * 准备飞行
     */
    initFly(){
        this.removeFly();//清除上一次 
        this.startTime = new Cesium.JulianDate(); //当前时间
        this.stopTime = Cesium.JulianDate.addSeconds(this.startTime, (this.mFlyPath.length-1)*120,new Cesium.JulianDate()); //结束时间
        this.flyClock.startTime = this.startTime.clone();  // 设置始时钟始时间
        this.flyClock.currentTime = this.startTime.clone();  // 设置时钟当前时间
        this.flyClock.stopTime  = this.stopTime.clone();  // 设置始终停止时间
        this.flyClock.multiplier = this.flySpeed;  // 时间速率，数字越大时间过的越快
        this.flyClock.clockRange = Cesium.ClockRange.LOOP_STOP;// 循环执行
        this.run(); //run方法
        this.toView(); //切换视野
        this.flyInfo(); //飞行信息
        this.addModel(); //添加模型
    }
    //相机视野
    toView(){
        this.ccc.toView(Cesium.Cartesian3.fromDegrees(this.mFlyPath[0].longitude , this.mFlyPath[0].dimension , 100000));
    }
    /**
     * 飞行
     */
    run(){
        let _self = this,orientation;
        let property = new Cesium.SampledPositionProperty(); //属性
        _self.Tools.arrForEach(_self.mFlyPath,function(vue,index){ //value index
            let time = Cesium.JulianDate.addSeconds(_self.startTime, vue.time, new Cesium.JulianDate());
            let position = Cesium.Cartesian3.fromDegrees(vue.longitude, vue.dimension, vue.height);
            property.addSample(time, position); // 添加位置，和时间对应
        });
        let entity = _self.entitys.createEntity(); //创建一个实体
        //给实体赋值
        entity.name = "无人机";
        entity.availability = new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({ start : _self.startTime,stop : _self.stopTime})]); // 和时间轴关联
        entity.position = property;
        entity.orientation =  new Cesium.VelocityOrientationProperty(property); //基于位置移动自动计算方向
        entity.model = _self.entitys.getModel({url:config.APPDIR + '/Apps/SampleData/models/CesiumAir/Cesium_Air.gltf'}); // 模型数据,跨域，模型文件必须放本地
        entity.path = _self.entitys.getPath(); //路径
        _self.entityObj = _self.entitys.add(entity); //添加飞行
        _self.bindScan(); //绑定扫描物体


        //测试同时加载多个
       /* let property2 = new Cesium.SampledPositionProperty(); //属性
        _self.Tools.arrForEach(_self.fly2,function(vue,index){ //value index
            let time = Cesium.JulianDate.addSeconds(_self.startTime, vue.time, new Cesium.JulianDate());
            let position = Cesium.Cartesian3.fromDegrees(vue.longitude, vue.dimension, vue.height);
            property2.addSample(time, position); // 添加位置，和时间对应
        });
        let entity2 = _self.entitys.createEntity(); //创建一个实体
        //给实体赋值
        entity2.name = "无人机2";
        entity2.availability = new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({ start : _self.startTime,stop : _self.stopTime})]); // 和时间轴关联
        entity2.position = property2;
        entity2.orientation =  new Cesium.VelocityOrientationProperty(property); //基于位置移动自动计算方向
        entity2.model = _self.entitys.getModel({url:'../src/Cesium/Apps/SampleData/models/CesiumAir/Cesium_Air.gltf'}); // 模型数据,跨域，模型文件必须放本地
        entity2.path = _self.entitys.getPath(); //路径
        _self.entityObj = _self.entitys.add(entity2); //添加飞行
        _self.bindScan(); //绑定扫描物体 */
    }
    /**
     * 绑定扫描物
     */
    bindScan(){
      this.scanEntity = new entityFactory({type:"dynamicCylinder",data:{positions:this.entityObj.position.getValue(this.flyClock.currentTime),entity:this.entityObj,v:this.CoreV,cylinder:{legnth:5000,slices:10,bottomRadius:5000/2}}});
      this.scanEntityObj = this.entitys.add( this.scanEntity);
      /*let opt = {
        v:this.CoreV,
        data:{
            circle:[0.003,116.538799,39.9948,30]// 第一个参数 0.003表示半径，第二个第三个分别表示底座圆心的坐标,第四个表示切割成多少个点。组成多少个面。越多会越卡 尽量实际项目不影响效果，越少越好。
           ,observer:[116.538799,39.9948,500]//观察点，也就是光源点
           ,positionList:[ //我们这里就不加高度了。不然太麻烦了 //以圆心为参考做偏移值获取，圆心坐标 [117,35]，简单点画个正方形吧 如果画圆的画，也可以多取点
               [116.53,39.9948],//初始位置 (圆心坐标 [117,35]要和这个初始位置统一，不然会偏移出去)
               [116.53,39.9948], //下一个点
               [116.53,40],
               [116.538799,40],
               [116.538799,39.9948],//回来
           ]
           ,material:Cesium.Color.RED.withAlpha(0.5)//光的材质
           ,number:100//数字越小速度越快
        }
      } 
       entityFactory.createLightScan(opt);*/
    }
    /**
     * flyInfo
     */
    flyInfo(){
        let _self = this;
        _self.handlerAction = new Handler(_self.CoreV);
         _self.handlerAction.Action(function(e){   //单击
            if(!e.position){
                return false;
            }
            _self.pickedFeature = _self.mouseManager.piObj(e.position);
            if (!Cesium.defined(_self.pickedFeature) && _self.pickedFeature == undefined){
                return false;
            };
            if(_self.pickedFeature.id == undefined){ //自己创建的
                return false;
            };
            let f_position = _self.mouseManager.piEllipsoid(_self.pickedFeature.id.position.getValue(_self.flyClock.currentTime));
            
            _self.pickedFeature.id.description = _self.infoTable( _self.pickedFeature.id.name,f_position) + 
            '<h2> 扫描结果 </h2>' + _self.scanInfo(f_position) +
            '<h2> 视频回放 </h2><div class="flyAMT"><video id="video_div" width="350" height="250" src="'+ config.STATICDIR +'/video/fly.mp4" controls autoplay></video></div>';
           // setTimeout(function(){_self.Anction();},20);
        },_self.handlerAction.LEFT_CLICK)
        //时钟监听
        _self.flyClock.onTick.addEventListener(function(clock) {
            if(!clock.shouldAnimate)return; 
            if(_self.pickedFeature == null){
                return false;
            }
            let position = _self.pickedFeature.id.position.getValue(clock.currentTime);
            let f_position = _self.mouseManager.piEllipsoid(position);
            _self.pickedFeature.id.description = _self.infoTable( _self.pickedFeature.id.name,f_position) + 
            '<h2> 扫描结果 </h2>' + _self.scanInfo(f_position);
        });
        
        //分析工具 和 动画
        let infoBoxHtml = `<div id="btn_cekong"><button type="button" title="地面分析" class="analysisGround" id="btn_ckexport" style="position:absolute;left:35px;top:3px;background:rgb(84, 84, 84);border:0px;"><i class="fa fa-upload "></i></button>
        <button type="button" title="地面检索" id="btn_ckfw" class="analysisWord" flag="0" style="position:absolute;left:60px;top:3px;background:rgb(84, 84, 84);border:0px;"><i class="fa fa-globe "></i></button>
        <div id="btn_cekong"><button type="button" title="分析报告" class="analysisRetrieve" id="btn_ckexport" style="position:absolute;left:35px;top:3px;background:rgb(84, 84, 84);border:0px;"><i class="fa fa-upload "></i></button>`;
        
        $('.cesium-infoBox').append(infoBoxHtml + `</div>`);
    }
    /**
     * 坐标info
     */
    infoTable(f_name,cartesian){
        if(f_name == undefined && cartesian == undefined){
            return false;
        };
        let tr = "",table = `<h2> 位置点 </h2><table class="cesium-infoBox-defaultTable"><thead><tr><th>Name</th><th>Latitude</th><th>Longitude</th><th>Elevation</th></tr></thead><tbody>`;
        let f_point = [ parseInt(cartesian.longitude / Math.PI * 180), parseInt(cartesian.latitude / Math.PI * 180)];
        tr = `<tr><td>${f_name}</td><td>${f_point[0]}°</td><td>${f_point[1]}°</td><td> ${parseInt(cartesian.height)}</td></tr>`;
        return table + tr + `</tbody></table>`;
    }
    /**
     * 扫描info
     */
    scanInfo(position){
        if(!position){
            return false;
        }
        let tr = "",table = `<table class="cesium-infoBox-defaultTable"><thead><tr><th>类别</th><th>经度</th><th>纬度</th><th>总数</th></tr></thead><tbody>`;
        let f_point = [ parseInt(position.longitude / Math.PI * 180), parseInt(position.latitude / Math.PI * 180)];
        tr += `<tr><td>`+ '建筑物' +`</td><td>${f_point[0]}°</td><td>${f_point[1]}°</td><td>${parseInt(Math.floor(Math.random()*100))}</td></tr>`;
        tr += `<tr><td>`+ '车辆' +`</td><td>${f_point[0]}°</td><td>${f_point[1]}°</td><td>${parseInt(Math.floor(Math.random()*100))}</td></tr>`;
        return table + tr + `</tbody></table>`;
    }
    /**
     * 分析工具
     */
    Anction(){
        let iframe = document.getElementsByClassName('cesium-infoBox-iframe')[0];
        this.analysisGround(iframe.contentWindow.document);
        this.analysisRetrieve(iframe.contentWindow.document);
        this.analysisWord(iframe.contentWindow.document);
    }
    /**
     * 添加模型
     */
    addModel(){
        this.entitys.add(this.ModelManager.createCar(Cesium.Cartesian3.fromDegrees(this.mFlyPath[1].longitude , this.mFlyPath[1].dimension , 0)));
    }
    /**
     * 播放动画
     */
    playAMT(){
        let video_div = document.getElementById('video_div');
    }
    /**
     * 机身分析报告
     */
    analysisWord(doc){
        /*doc.getElementsByClassName("analysisWord")[0].onclick = function(){
            Components.TAG.analysisBox.open();
        }*/
    }
    /**
     * 地面检索
     */
    analysisRetrieve(doc){
        /*doc.getElementsByClassName("analysisRetrieve")[0].onclick = function(){
            Components.TAG.searchGround.create();
        }*/
    }
    /**
     * 地面分析
     */
    analysisGround(doc){
        let analysisGround = doc.getElementsByClassName("analysisGround")[0];
        analysisGround.onclick = function(){
            Components.TAG.analysisBox.open();
        }
    }
     /**
     * 向后飞行
     */
    flyBack(){
        this.flySpeed = -10;
        this.flyClock.multiplier = this.flySpeed;
    }
    /**
     * 向前飞行
     */
    flyForward(){
        this.flySpeed = 10;
        this.flyClock.multiplier = this.flySpeed;
    }
    /**
     * 开始飞行
     */
    startFly(){
        this.flyClock.shouldAnimate = true; 
    }
    /**
     * 暂停飞行
     */
    pauseFly(){
        this.flyClock.shouldAnimate = false;
    }
    /**
     * 清除飞行
     */
    removeFly(){
        if(this.scanEntityObj == undefined){
            return false;
        }
        this.CoreV.trackedEntity = null;
        let start = Cesium.JulianDate.fromDate(new Date());
        this.flyClock.startTime = start.clone();
        var stop = Cesium.JulianDate.addSeconds(start, 300000000, new Cesium.JulianDate());
        this.flyClock.stopTime = stop.clone();
        this.entitys.remove(this.entityObj);
        this.entitys.remove(this.polyLine);
        this.entitys.remove(this.scanEntityObj);
        this.pauseFly();
        this.init(this.CoreV);
    }
    /**
     * 跟随视图
     */
    aircraftView(){
        this.ccc.aircraftView(this.entityObj);
    }
     /**
     * 顶部视图
     */
    topView(){
        this.ccc.sideView(this.entityObj);
    }
     /**
     * 侧边视图
     */
    sideView(){
        this.ccc.topView(this.entityObj);
    }
    /**
     * 保存自定义飞行
     */
    saveCustomFly(){
        let _self = this;
        if( _self.lnglatPositions.length > 0){
            _self.Tools.saveJsonText({
                jsonData : _self.mFlyPath,
                jsonName : 'flyJson.json'
            })
        }
    }
    /**
     * 开始自定义飞行
     */
    startCustomFly(){
        let _self = this;
        _self.removeFly();
        $.get('data/flyJson.json',{},function(json){
                if(json == null)return false;
                _self.mFlyPath = json;
                _self.initFly();
        });
    }
    /**
     * 自定义飞行
     */
    customFly(){
        let _self = this;
        _self.positions = [], _self.lnglatPositions = [];
        _self.handlerAction = new Handler(_self.CoreV);
        //单击
        _self.handlerAction.Action(function(e){
            if(!e.position){
                return false;
            }
            let cartesian = _self.mouseManager.piScreen(e.position); //拾取屏幕坐标

            if(_self.positions.length == 0)_self.positions.push(cartesian); //第一次创建保证有两个点
            _self.positions.push(cartesian);
            
            //飞行路径实体
            let lonlat = _self.mouseManager.screenToLonlat(e.position); //屏幕坐标转经纬度 高程
            _self.lnglatPositions.push({longitude:lonlat.lon, dimension:lonlat.lat, height: _self.flyHeight, time:_self.lnglatPositions.length * _self.flyInterval}); //时间间隔
            
            _self.handlerAction.COUNTER = _self.positions.length; //画线规则
        },_self.handlerAction.LEFT_CLICK);
        //移动
        _self.handlerAction.Actions(function(){},function(e){
            if(!e.endPosition){
                return false;
            }
            let cartesian = _self.mouseManager.piScreen(e.endPosition); //拾取屏幕坐标
            if (!Cesium.defined(_self.polyLine)) {
                _self.lineOption = new entityFactory({type:"createLine",data:_self.positions});

                _self.entitys.add(_self.lineOption);
            }else{
                _self.positions.pop();
                cartesian.y += (1 + Math.random());
                _self.positions.push(cartesian);
            }
        },_self.handlerAction.MOUSE_MOVE,_self.handlerAction.COUNTER);
       //双击
       _self.handlerAction.Action(function(e){
            _self.handlerAction.destroy();
            if(_self.positions.length == 0 ){
                return false;
            }
            _self.mFlyPath = _self.lnglatPositions;
            _self.saveCustomFly();
       },_self.handlerAction.LEFT_DOUBLE_CLICK);
    }
    /**
     * 键盘控制飞行
     */
    flyByKeyword(){
        console.log('暂不实现');
    }
  
}