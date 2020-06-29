/*
 * @Descripttion: 
 * @version: 1.0
 * @Author: zhangti
 * @Date: 2019-10-25 10:19:44
 * @LastEditors  : sueRimn
 * @LastEditTime : 2020-01-13 17:10:05
 */
/**
 * 淹没分析
 */
import Analyser from '../analyser.js';
export default class Submerged extends Analyser{
	
	constructor(supers,opt){
		super(supers);
		//opt = Cesium.defaultValue(opt, Cesium.defaultValue.EMPTY_OBJECT);	//判断是否有值
		this._resultTip = this._viewer.entities.add({
			id:Cesium.createGuid(),
			label : {
				//name: 'visiblyEffect',
				//show : false,
				fillColor:Cesium.Color.YELLOW,
				showBackground : true,
				font : '14px monospace',
				horizontalOrigin : Cesium.HorizontalOrigin.LEFT,
				verticalOrigin : Cesium.VerticalOrigin.BOTTOM,
				pixelOffset : new Cesium.Cartesian2(0, -10)
			}
		});
		this.positions = [];
        this.polyObj = null;
        this.tempPoints = [];
		this.entity = [];
		this.state = this.BEYONANALYSER_STATE.PREPARE; //0
		this.waterEntity = null;
		this.analyser(opt);
	}
	analyser(options){
		/**
         * 点击
         */
		let _self = this,viewer = this._viewer,info = ""
		,maxH = options.maxH == undefined ? 50 :options.maxH
		,interval = options.interval == undefined ?10 : options.interval
		,speed = options.speed == undefined ? 1 : options.speed;
       
        _self.handler.setInputAction(function (e) {//第一次点击
            if(_self.Tools.nullBool(e.position)){
                return false;
            }
            let cartesian = _self.mouseManager.screenToWorld(e.position);
            if(_self.positions == 0){
                _self.positions.push(cartesian.clone())
            }
            _self.positions.push(cartesian); //模拟

            let cartographic = Cesium.Cartographic.fromCartesian(_self.positions[_self.positions.length - 1]);
            _self.tempPoints.push({ lon: Cesium.Math.toDegrees(cartographic.longitude), lat:  Cesium.Math.toDegrees(cartographic.latitude) ,hei:cartographic.height});
            /**
             * 创建实体
             */
            let entity = _self.entitys.createEntity();
            entity.position = cartesian;
            entity.point = _self.entitys.getPoint();
            _self.entity.push(_self.entitys.add(entity)); //创建点
        },Cesium.ScreenSpaceEventType.LEFT_CLICK);
        /**
         * 移动
         */
        _self.handler.setInputAction(function (e) {
            if(_self.Tools.nullBool(e.endPosition)){
                 return false;
			}
			let cartesian = _self.mouseManager.screenToWorld(e.endPosition);
			if(_self.state === _self.BEYONANALYSER_STATE.PREPARE){               
				info ='点击设定范围';
				_self.showTip(_self._resultTip,true,cartesian,info);
			}else if(_self.state === _self.BEYONANALYSER_STATE.OPERATING){               
				info ='右键分析淹没情况';
				_self.showTip(_self._resultTip,true,cartesian,info);
			}
            if(_self.positions.length >= 2){
                if (!Cesium.defined(_self.polyObj)) {
                    _self.polyObj = new _self.entityFactory({type:"createPolygon",data:{positions:_self.positions,material:Cesium.Color.WHITE.withAlpha(0.1)}});
                    _self.waterEntity = _self.entitys.add(_self.polyObj);
                    _self.entity.push(_self.waterEntity); //创建线
                }else{
                    _self.positions.pop();
                    _self.positions.push(cartesian.clone());
				}
				if(_self.positions.length > 4)_self.state = _self.BEYONANALYSER_STATE.OPERATING;
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        /**
         * 右键取消
         */
        _self.handler.setInputAction(function (e) {
            if(_self.Tools.nullBool(e.position)){
                return false;
			}
            _self.handler.destroy(); //关闭事件句柄
			_self.positions.pop(); //最后一个点无效
			_self.state = _self.BEYONANALYSER_STATE.END; //分析结束
            //二秒后开始进入淹没分析
            setTimeout(function () {
                if (_self.waterEntity) {
                    viewer.scene.globe.depthTestAgainstTerrain = true;
                    _self.waterEntity.polygon.heightReference = "CLAMP_TO_GROUND";
                    _self.waterEntity.polygon.material = _self._config.STATICDIR + "/image/water.png";
                    var h = 0.0;
                    _self.waterEntity.polygon.extrudedHeight = h;
                    var st = setInterval(function () {
                        h = h + speed;
                        if (h >= maxH) {
                            h = maxH;//给个最大值
                            clearTimeout(st); //结束
                        }
                        _self.waterEntity.polygon.extrudedHeight = h;
                    }, interval);
                }
            }, 2000);
            $("body").append('<div  id="video_div" style="position:absolute;right:10px;bottom:10px;"><video width="350" height="250" src="'+ _self._config.STATICDIR+'/video/yanmo.mp4" controls autoplay></video></div>');
            setTimeout(function () {
                $("#video_div").remove();
            },10000)
        },Cesium.ScreenSpaceEventType.RIGHT_CLICK);
	}

    remove(){
        if(this.entity != undefined){
            for(let i in this.entity){
                this.entitys.remove(this.entity[i]);
            }
            this.entitys.remove(this._resultTip);
            $("#video_div").remove();
        }
    }

}