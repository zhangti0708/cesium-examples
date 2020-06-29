/*
 * @Descripttion: 
 * @version: 1.0
 * @Author: zhangti
 * @Date: 2019-10-25 11:25:09
 * @LastEditors  : sueRimn
 * @LastEditTime : 2020-01-02 12:32:51
 */
/**
 * 通视分析
 */
import Analyser from '../analyser.js';
export default class Visibility extends Analyser{
	/**
	 * 初始化
	 * @param {*} supers 
	 * @param {*} opt 
	 */
	constructor(supers,opt){
		super(supers);
		//opt = Cesium.defaultValue(opt, Cesium.defaultValue.EMPTY_OBJECT);	//判断是否有值
		this.opt = opt;
		this.analyser();
	}
	/**
	 * 创建分析
	 */
	analyser(){
        if (!Cesium.defined(this._viewer)) {
            throw new Cesium.DeveloperError('viewer is required.');
		}
		this.visiblyEffect = new VisiblyEffect(this);
	}
}
/**
 * 内部分析类
 * @param {*} _that 
 */
class VisiblyEffect {
	constructor(_that){
		this._that = _that;
		this.options = _that.opt;
		this.viewer = _that._viewer;
		this.id = Cesium.createGuid();
		this._markers=[];
		this._lines=[];
		this._pickedObjs=[];
		this.posArray=[];
		this._resultTip = this.viewer.entities.add({
			id: this.id,
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
		this.state = _that.BEYONANALYSER_STATE.PREPARE;
		this.init();
	}
	init(){
		//点击
		var _self = this,_that = _self._that;
		_that.handler.setInputAction(function (movement) {
			//var cartesian = Cesium.pickGlobe(viewer.scene,movement.position);
			let cartesian = _that.mouseManager.piTerrainToModule(movement.position);
			_self.posArray.push(cartesian);
			if(_self._markers.length==0){
				//scope.reset();
				var startSphere = _self.viewer.entities.add({
					position : cartesian,
					ellipsoid : {
						radii : new Cesium.Cartesian3(2.0, 2.0, 2.0),
						material : Cesium.Color.BLUE
					},
					label:{
						text:"视线起点",
						fillColor:Cesium.Color.YELLOW,
						pixelOffset:{
							x:0,y:-20
						},
						scale:0.5
					}
				});  
				_self._markers.push(startSphere);
				_self.state= _that.BEYONANALYSER_STATE.OPERATING;
			}else if(_self._markers.length==1){
				var redSphere = _self.viewer.entities.add({
					position : cartesian,
					ellipsoid : {
						radii : new Cesium.Cartesian3(2.0, 2.0, 2.0),
						material : Cesium.Color.RED
					}
				});
				_self._markers.push(redSphere);

				var results = _that.getIntersectObj(_self.posArray[0],cartesian,_self._markers,true);
				if(results.length == 0){
					alert("没有取到相交点")
					_that.handler.destroy();
					_self.viewer.entities.remove(_self._resultTip); 
					_self.remove(); 
					return false;
				}
				//分析一下是否都有position
				for (let index = results.length-1; index >=0; index--) {
					const element = results[index];
					if(!Cesium.defined(element.position)){
						results.splice(index,1);
					}                    
				}
				if(!results[0])return;
				
				if(!Cesium.defined(results[0].position)){
					throw new Cesium.DeveloperError("position is undefined");
				}
				var pickPos1 = results[0].position;
				var dis=Cesium.Cartesian3.distance(pickPos1,cartesian);                
				var bVisibility=dis<5?true:false;
				var arrowPositions=[_self.posArray[0],results[0].position];
				var greenLine=_self.viewer.entities.add({
						polyline : {
							positions : arrowPositions,
							width : 10,
							arcType : Cesium.ArcType.NONE,
							material : new Cesium.PolylineArrowMaterialProperty(Cesium.Color.GREEN)
						}
					});
					_self._lines.push(greenLine);
				if(!bVisibility){
					var unArrowPositions=[results[0].position,cartesian];
					var redLine=_self.viewer.entities.add({
						polyline : {
							positions : unArrowPositions,
							width : 10,
							arcType : Cesium.ArcType.NONE,
							material : new Cesium.PolylineArrowMaterialProperty(Cesium.Color.RED)
						}
					});
					_self._lines.push(redLine);
				}
				
				_self.showIntersections(results);
				var pos1=_self.posArray[0];
				var pos2=cartesian;
				var rad1 = Cesium.Cartographic.fromCartesian(pos1);
				var rad2 = Cesium.Cartographic.fromCartesian(pos2);
				var degree1 = {longitude:rad1.longitude / Math.PI * 180,latitude:rad1.latitude / Math.PI * 180,height:rad1.height};
				var degree2 = {longitude:rad2.longitude / Math.PI * 180,latitude:rad2.latitude / Math.PI * 180,height:rad2.height};

				var length_ping = Math.sqrt(Math.pow(pos1.x-pos2.x,2)+Math.pow(pos1.y-pos2.y,2)+Math.pow(pos1.z-pos2.z,2));
				var length_h = Math.abs(degree2.height-degree1.height);
				var length = Math.sqrt(Math.pow(length_ping,2)+Math.pow(length_h,2));
				//console.log(degree1);
				var visTxt=bVisibility?'是':'否';
				var text =
					'起点坐标: ' + ('   (' + degree1.longitude.toFixed(6))+ '\u00B0' +',' +(degree1.latitude.toFixed(6))+ '\u00B0'+',' +degree1.height.toFixed(2)+')' +
					'\n终点坐标: ' + ('   (' + degree2.longitude.toFixed(6))+ '\u00B0' +',' +(degree2.latitude.toFixed(6))+ '\u00B0'+',' +degree2.height.toFixed(2)+')' +
					'\n垂直距离: ' + '   ' + length_h.toFixed(2) +'m'+
					'\n水平距离: ' + '   ' + length_ping.toFixed(2) +'m'+
					'\n空间距离: ' + '   ' + length.toFixed(2) +'m'+
					'\n是否可视: ' + '   ' + visTxt;
				
					_that.showTip(_self._resultTip,true,cartesian,text,{
					fillColor:Cesium.Color.YELLOW
				});
				_self.state= _that.BEYONANALYSER_STATE.END;
				_that.handler.destroy();
				_that.handler = null;
			}
		}, Cesium.ScreenSpaceEventType.LEFT_CLICK );
		//移动
		var info;
		_that.handler.setInputAction(function (movement) {
			var cartesian = _self.viewer.scene.pickPosition(movement.endPosition);
			if(_self.state === _that.BEYONANALYSER_STATE.PREPARE){               
				info ='点击设定起点';
				_that.showTip(_self._resultTip,true,cartesian,info);
			}else if(_self.state === _that.BEYONANALYSER_STATE.OPERATING){               
				info ='点击分析通视情况';
				_that.showTip(_self._resultTip,true,cartesian,info);
			}
		},Cesium.ScreenSpaceEventType.MOUSE_MOVE);
	}
	showIntersections(results){
		let _self = this;
		for (let i = 0; i < results.length; ++i) {
			var object = results[i].object;
			if(object){
				if (object instanceof Cesium.Cesium3DTileFeature) {
					_self._pickedObjs.push(object);
					object.oldColor=object.color.clone();
					object.color = Cesium.Color.fromAlpha(Cesium.Color.YELLOW, object.color.alpha);
				}else if (object.id instanceof Cesium.Entity) {
					var entity=object.id;
					_self._pickedObjs.push(entity);
					var color=entity.polygon.material.color.getValue();
					entity.polygon.oldColor=color.clone();
					entity.polygon.material = Cesium.Color.fromAlpha(Cesium.Color.YELLOW, color.alpha);
				}
			}
			
			_self._markers.push(_self.viewer.entities.add({
				position : results[i].position,
				ellipsoid : {
					radii : new Cesium.Cartesian3(0.8, 0.8, 0.8),
					material : Cesium.Color.RED
				}
			}));
		}
	}
	remove(){
		if(this._markers.length == 0){
			return false;
		}
		 //恢复颜色
		 for (let i = 0; i < this._pickedObjs.length; ++i) {
			var object=this._pickedObjs[i];
			if (object instanceof Cesium.Cesium3DTileFeature) {
				object.color = object.oldColor.clone();
			}else if (object instanceof Cesium.Entity) {
	
				object.polygon.material = object.polygon.oldColor.clone();                
			}
		}
		this._pickedObjs.length=0;

		for (let index = 0; index < this._markers.length; index++) {
			var element = this._markers[index];
			this.viewer.entities.remove(element);            
		}
		this._markers.length=0;

		for (let index = 0; index < this._lines.length; index++) {
			var element = this._lines[index];
			this.viewer.entities.remove(element);            
		}
		this._lines.length=0;

		this.viewer.entities.remove(this._resultTip);   
		this._resultTip = undefined;        
	}
}