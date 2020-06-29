/*
 * @Descripttion: 
 * @version: 1.0
 * @Author: zhangti
 * @Date: 2019-09-29 11:55:55
 * @LastEditors  : sueRimn
 * @LastEditTime : 2020-01-02 17:25:04
 */
/**
 * 卫星过境封装类
 */
import config from './config.js';
import CVTools from './cvTool.js';
import mouseManager from './mouseManager.js';
import Entitys from './entitys.js';
import entityFactory from './entityFactory.js';
import Handler from './handler.js';
import Primitives from './primitives.js';
export default class satelliteTransit{

    constructor(v){
        /**
         * 核心类
         */
        this.CoreV = v;
        /**
         * 时钟
         */
        this.STClock = v.clock;
        /**
         * 时间速率
         */
        this.STSpeed = 10;
        /**
         * 卫星实体
         */
        this.satelliteAll = [];
        /**
         * 通信
         */
        this.Transits = [];
        /**
         * 工具
         */
        this.Tools = new CVTools();
           /**
         * mouseManager
         * 坐标转换
         */
        this.mouseManager = new mouseManager(v);
        //实体对象
        this.entitys = new Entitys(v);
        //图形
        this.Primitives = new Primitives(v);
        //格式数据存储
        //查看方式区分开 以免冲突
        this.passTime = [];
        this.passTime_old = [];
        //刷新的时间
        this.renderTime = null;
        //拾取的对象
        this.pickedFeature = null;
        //标识符
        this.iden = true;
        //实体
        this.EntityObj = [];
        //线实体
        this.lineEntity = [];
    }
    /**
     * 初始化卫星过境
     */
    initST(){
        let _self = this;
        _self.handlerAction = new Handler(_self.CoreV);
        //单击
        _self.handlerAction.Action(function(e){
            try {
                if(!e.position){
                    return false;
                }
                _self.pickedFeature = _self.mouseManager.piObj(e.position);
                if (!Cesium.defined(_self.pickedFeature) && _self.pickedFeature == undefined){
                    return false;
                };
                if(_self.pickedFeature.id.description == undefined){ //自己创建的
                    return false;
                };
                let f_name = _self.pickedFeature.id.name,f_position,position;
                if(_self.pickedFeature.id.idea == "radar"){
                    position = _self.pickedFeature.id.position.getValue(_self.STClock.currentTime);
                    _self.pickedFeature.type = "radar";
                }else{
                    position = _self.pickedFeature.id.position.getValue(_self.STClock.currentTime);
                    _self.pickedFeature.type = "satellite";
                }
                f_position = _self.mouseManager.piEllipsoid(position);
                _self.pickedFeature.id.description  = _self.infoTable_2(f_name,f_position);
                console.log(f_name,f_position);
                //viewer.selectedEntity = selectedEntity;
                _self.pickedFeature.id.name  = f_name;
                _self.pickedFeature.temp = _self.pickedFeature.id.description + "<h2> Passes <h2>";
                _self.iden = false; //点击事件改变标识符
            } catch (error) {
                console.log(error);
            }
        },_self.handlerAction.LEFT_CLICK)

        _self.loadCZML();
    }
    loadCZML(){ //load数据
        let _self = this;
		_self.CoreV.dataSources.add(Cesium.CzmlDataSource.load(config.DATADIR + '/test.czml')).then(function(dataSource) {
            _self.dataSource = dataSource;
			_self.radar = dataSource.entities.getById("Facility/AGI");
			let satellite1 = dataSource.entities.getById("Satellite/ISS");
			let satellite2 = dataSource.entities.getById("Satellite/Geoeye1");
			let transit1 = dataSource.entities.getById("Facility/AGI-to-Satellite/ISS");
			let transit2 = dataSource.entities.getById("Facility/AGI-to-Satellite/Geoeye1");
			_self.satelliteAll = [satellite1,satellite2];
            _self.Transits = [transit1,transit2];
            _self.radar.idea = "rader";
           try{
                _self.scan();
                _self.satelliteInfo();
                //_self.createEntity([_self.radar]);
                _self.communication();
           }catch(e){
             console.log(e);
           }
          
		})
    }
    /**
     * 卫星过境通信效果
     */
    communication(){
        let _self = this;
        _self.p_line = []; //创建线的点
        //雷达
        if(_self.radar == null){
            return false;
        }
        let r_position = _self.radar.position.getValue(_self.STClock.currentTime);
        let r_point = _self.mouseManager.piEllipsoid(r_position);
        _self.rr_point = [parseInt(r_point.longitude / Math.PI * 180), parseInt(r_point.latitude / Math.PI * 180)];
        if(_self.satelliteAll.length == 0){
            return false;
        }
        //遍历卫星
        for(let i in _self.satelliteAll){
            _self.p_line[i] = [];
            let sate = _self.satelliteAll[i];
            let s_position = sate.position.getValue(_self.STClock.currentTime);
            _self.s_point = _self.mouseManager.piEllipsoid(s_position);
            _self.p_line[i].push(r_position.clone());
            _self.p_line[i].push(s_position.clone());
           let lineObj = new entityFactory({type:"createLine",data:{positions: _self.p_line[i],width:1}});
           _self.lineEntity.push(_self.entitys.add(lineObj));
        }
      
    }
     /** 
     *  判断一个点是否在圆的内部 
     *  @param point  测试点坐标 
     *  @param circle 圆心坐标 
     *  @param r 圆半径 
     *  返回true为真，false为假 
     *  */  
    pointInsideCircle (point, circle, r) {  
        if (r===0) return false  
        var dx = circle[0] - point[0]  
        var dy = circle[1] - point[1]  
        return dx * dx + dy * dy <= r * r  
    }
    /**
     * 卫星信息
     */
    satelliteInfo(){
        let _self = this;
        if(_self.Transits.length == 0){
            return false;
        };
        _self.formatTransit();
        _self.selectedEntity = _self.entitys.createEntity();
        _self.selectedEntity.name = "PASS";
        _self.selectedEntity.description = _self.infoTable_1(dayjs(Cesium.JulianDate.addHours(_self.STClock.currentTime,-8,new Cesium.JulianDate())).format("YYYY-MM-DD HH:mm:ss"));
        _self.CoreV.selectedEntity = _self.selectedEntity;
        let pass_flag = function(clock){
            try {
                if(_self.satelliteAll.length == 0){
                    return false;
                }
                for(let i in _self.satelliteAll){ //遍历卫星
                    let sate = _self.satelliteAll[i];
                    let position = sate.position.getValue(clock.currentTime);
                    let s_point = _self.mouseManager.piEllipsoid(position);
                    _self.p_line[i].pop();
                    _self.p_line[i].push(position.clone());
                    _self.ss_point = [parseInt(s_point.longitude / Math.PI * 180), parseInt(s_point.latitude / Math.PI * 180)]
                    let flag = _self.pointInsideCircle(_self.ss_point,_self.rr_point,30);
                    if(flag){
                        _self.lineEntity[i].show = true;
                    }else{
                        _self.lineEntity[i].show = false;
                    } 
                } 
            } catch (error) {
                console.log(error);
            }
           
        }
        _self.STClock.onTick.addEventListener(function(clock) {
            try {
                if(!clock.shouldAnimate)return;   
                if(_self.iden)_self.selectedEntity.description = _self.infoTable_1(_self.pass(clock));//标识符  进来展示所有卫星信息
                if(!_self.iden){
                    if(_self.pickedFeature == null)return;
                    if("radar" == _self.pickedFeature.type){
                        _self.pickedFeature.id.description = _self.pickedFeature.temp + _self.infoTable_1(_self.pass(clock));
                    }else{
                        let position = _self.pickedFeature.id.position.getValue(clock.currentTime);
                        let f_position = _self.mouseManager.piEllipsoid(position);
                        _self.pickedFeature.id.description = _self.infoTable_2( _self.pickedFeature.id.name,f_position) + ' <h2> Passes </h2>' + _self.infoTable_3(_self.pass(clock),_self.pickedFeature.id.name);
                    }
                }
                pass_flag(clock);   //判断是否在地面雷达通信范围
            } catch (error) {
                console.log(error);
            }  
        });	
        _self.STClock.onStop.addEventListener(function(clock){
            //格式化卫星数据
            if(_self.Transits.length == 0){
                return false;
            };
            _self.formatTransit();
        });
    }
    /**
     * 格式化通信数据
     */
    formatTransit(){
        let _self = this;
        if(_self.Transits.length == 0){
            return false;
        };
        _self.passTime = [],_self.passTime_old = []; //查看方式区分开 以免冲突
        _self.Tools.arrForEach(_self.Transits,function(transit,index){
            let intervals = [],intervals_old = [];
            let n_interval = transit.availability._intervals;
            _self.Tools.arrForEach(n_interval,function(interval,index){
                let start = dayjs(Cesium.JulianDate.addHours(interval.start,-8,new Cesium.JulianDate())).format("YYYY-MM-DD HH:mm:ss");
                let stop = dayjs(Cesium.JulianDate.addHours(interval.stop,-8,new Cesium.JulianDate())).format("YYYY-MM-DD HH:mm:ss");
                intervals.push({name:transit.name,"startTime":start,"stopTime":stop,"interval":dayjs(stop).diff(dayjs(start), 'millisecond')});
                intervals_old.push({name:transit.name,"startTime":start,"stopTime":stop,"interval":dayjs(stop).diff(dayjs(start), 'millisecond')});
            });
            _self.passTime.push(intervals);
            _self.passTime_old.push(intervals_old);
        });
    }
    /**
     * 创建雷达实体
     */
    createEntity(radars){
        try{
            let _self = this;
            if(radars.length == 0){
                return false;
            }
            _self.Tools.arrForEach(radars,function(radar){
                let l ,r ;
                let positions = radar.position.getValue(_self.STClock.currentTime);
                _self.r_point = positions;
                if(positions.length == 0){
                    return false;
                };
                let cartographic = _self.mouseManager.piEllipsoid(positions);
                let lat = Cesium.Math.toDegrees(cartographic.latitude),lon = Cesium.Math.toDegrees(cartographic.longitude), height = cartographic.height;
                //radarscan
                r = new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(90),
                Cesium.Math.toRadians(0),Cesium.Math.toRadians(0));
                l = Cesium.Cartesian3.fromDegrees(lon, lat, height);
                _self.EntityObj.push(_self.entitys.add(_self.entitys.getCustomRadar(l,r)));
            });
        }catch(e){
            console.log(e);
        }
    }
    /**
     * 添加扫描物
     */
    scan(){
        let _self = this;
        if(_self.satelliteAll.length == 0){
            return false;
        };
        _self.Tools.arrForEach(_self.satelliteAll,function(entity,index){
            var cartesian = entity.position.getValue(_self.STClock.currentTime);
            let positions = _self.mouseManager.worldToLonlat(cartesian);
            _self.bindScan(positions,entity);
        });
    }
    pass(clock){ //当前时间
        let currentTime = dayjs(Cesium.JulianDate.addHours(clock.currentTime,-8,new Cesium.JulianDate())).format("YYYY-MM-DD HH:mm:ss");
        return currentTime;
    }
    index_rm(n){
        if(this.passTime_old.length == 0){
            return false;
        };
        this.passTime_old[n].splice(0,1); //删除第一个
    }
     /**
     * 绑定扫描物
     */
    bindScan(positions,entityObj){
        //let modelMatrix = this.Primitives.countModelMatrix(positions);
        //this.scanEntity = new entityFactory({type:"createScan",data:{modelMatrix:modelMatrix,positions:positions,v:this.CoreV}});
        this.scanEntity = new entityFactory({type:"dynamicCylinder",data:{positions:positions,entity:entityObj,v:this.CoreV,cylinder:{legnth:600000,slices:4,bottomRadius:600000/2},}});
        this.EntityObj.push(this.entitys.add( this.scanEntity));
     }
     /*
    * table 1
    */ 
    infoTable_1(currentTime){
        try{
            let _self = this,renderTime = _self.renderTime; 
            if(_self.passTime_old.length == 0){
                return false;
            };
            var tr = "",table = `<table class="cesium-infoBox-defaultTable"><thead><tr><th>卫星</th><th>倒计时(ms)</th><th>通信开始(date)</th><th>通信结束(date)</th><th>通信时长(ms)</th></tr></thead><tbody>`;
            for(var n in _self.passTime_old){
                if(_self.passTime_old[n].length == 0)continue;
                var interval_pass = _self.passTime_old[n][0]; //始终取第一个 
                renderTime =  dayjs(interval_pass.startTime).diff(dayjs(currentTime));
                if(renderTime <= 0){
                    if(renderTime <= -(interval_pass.interval)){
                        _self.index_rm(n);
                    }else{
                        renderTime = "PASS";
                    }
                }
                tr += `<tr><td>${interval_pass.name}</td><td>${renderTime}</td><td>${interval_pass.startTime}</td><td> ${interval_pass.stopTime}</td><td> ${interval_pass.interval}</td></tr>`;
            }
            return table + tr + `</tbody></table>`;
        }catch(e){
            console.log(e);
        }
    }
    /*
    * table 2
    */ 
    infoTable_2(f_name,cartesian){
        if(f_name == undefined && cartesian == undefined){
            return false;
        };
        let tr = "",table = `<h2> Position </h2><table class="cesium-infoBox-defaultTable"><thead><tr><th>Name</th><th>Latitude</th><th>Longitude</th><th>Elevation</th></tr></thead><tbody>`;
        let f_point = [ parseInt(cartesian.longitude / Math.PI * 180), parseInt(cartesian.latitude / Math.PI * 180)];
        tr = `<tr><td>${f_name}</td><td>${f_point[0]}°</td><td>${f_point[1]}°</td><td> ${parseInt(cartesian.height)}</td></tr>`;
        return table + tr + `</tbody></table>`;
    }
    /*
    * table 3
    */ 
    infoTable_3(currentTime,featureName){
        let _self = this,renderTime = _self.renderTime; 
        if(_self.passTime.length == 0 && featureName == undefined){
            return false;
        };
        let t_interval = function(){
            for(var i in _self.passTime){if(_self.passTime[i][0].name.indexOf(featureName)!=-1)return _self.passTime[i];}
        }
        let intervals = t_interval();
        var tr = "",table = `<table class="cesium-infoBox-defaultTable"><thead><tr><th>卫星</th><th>倒计时(ms)</th><th>通信开始(date)</th><th>通信结束(date)</th><th>通信时长(ms)</th></tr></thead><tbody>`;
        _self.Tools.arrForEach(intervals,function(interval,index){
            renderTime =  dayjs(interval.startTime).diff(dayjs(currentTime));
            if(renderTime <= 0)renderTime = 0;
            tr += `<tr><td>${interval.name}</td><td>${renderTime}</td><td>${interval.startTime}</td><td> ${interval.stopTime}</td><td> ${interval.interval}</td></tr>`;
        });
        return table + tr + `</tbody></table>`;
    }
     /**
     * 向后飞行
     */
    STBack(){
        this.STSpeed = -50;
        this.STClock.multiplier = this.STSpeed;
    }
    /**
     * 向前飞行
     */
    STForward(){
        this.STSpeed = 50;
        this.STClock.multiplier = this.STSpeed;
    }
    /**
     * 飞行速度
     */
    STspeed(speedNum){
        console.log(speedNum);
        this.STClock.multiplier = speedNum;
    }
    /**
     * 开始飞行
     */
    startST(){
        this.STClock.shouldAnimate = true; 
    }
    /**
     * 暂停飞行
     */
    pauseST(){
        this.STClock.shouldAnimate = false;
    }
    /**
     * 清除飞行
     */
    removeST(){
        let _self = this;
        if(_self.EntityObj.length == 0){
            return false;
        }
        _self.Tools.arrForEach(_self.EntityObj,function(entity,index){
           _self.entitys.remove(entity);
       });
       _self.CoreV.dataSources.remove(_self.dataSource);
       _self.CoreV.clock.shouldAnimate = false;
       _self.handlerAction.destroy();
       _self.handlerAction = null;
       _self.EntityObj = [];
    }
}