/*
 * @Descripttion: 
 * @version: 1.0
 * @Author: zhangti
 * @Date: 2019-10-25 11:25:10
 * @LastEditors: sueRimn
 * @LastEditTime: 2019-11-25 18:00:17
 */
/**
 * 坡度分析
 */
import Analyser from '../analyser.js';
export default class Slope extends Analyser{
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
		this.slopeEffect = new SlopeEffect(this);
	}
}
/**
 * @param _that
 */
class SlopeEffect {
	constructor(_that){
		this._that = _that;
		this.options = _that.opt;
		this.viewer = _that._viewer;
		this.id= Cesium.createGuid();
		this._markers=[];
		this._lines=[];       
		this.posArray=[];
		this._resultChart=undefined;
		this._tip= this.viewer.entities.add({
			id:this.id,
			label : {
				//name: 'visiblyEffect',
				//show : false,
				fillColor:Cesium.Color.YELLOW,
				showBackground : true,
				font : '14px monospace',
				horizontalOrigin : Cesium.HorizontalOrigin.LEFT,
				verticalOrigin : Cesium.VerticalOrigin.BOTTOM,
				pixelOffset : new Cesium.Cartesian2(0, -10),
				heightReference : Cesium.HeightReference.CLAMP_TO_GROUND,
			}
		});
		this.state = _that.BEYONANALYSER_STATE.PREPARE;
		this.init();
	}
	init(){
		//移动
		var _self = this,_that = _self._that,info ="";
		_that.handler.setInputAction(function (movement) {
			let cartesian = _that.mouseManager.piTerrainToModule(movement.endPosition);
			//var cartesian = _self.viewer.scene.pickPosition(movement.endPosition);  
			if(_self.state=== _that.BEYONANALYSER_STATE.PREPARE){               
				info ='点击设定起点(地形)';
				_that.showTip(_self._tip,true,cartesian,info);
			}else if(_self.state===_that.BEYONANALYSER_STATE.OPERATING){
				info ='点击分析坡度';
				_that.showTip(_self._tip,true,cartesian,info);         
			}
		},Cesium.ScreenSpaceEventType.MOUSE_MOVE);
		//点击
		_that.handler.setInputAction(function (movement) {
				//var cartesian =Cesium.pickGlobe(viewer.scene,movement.position);
				let cartesian = _that.mouseManager.piTerrainToModule(movement.position);
				_self.posArray.push(cartesian);
				var blueSphere = _self.viewer.entities.add({
					position : cartesian,
					ellipsoid : {
						radii : new Cesium.Cartesian3(5.0, 5.0, 5.0),
						material : Cesium.Color.BLUE
					}
				});  
				_self._markers.push(blueSphere);
				_self.state=_that.BEYONANALYSER_STATE.OPERATING;
				if(_self.posArray.length==2){
					//var Positions=[_self.posArray[0],cartesian];
					var greenLine = _that.entitys.add({
							polyline : {
								positions : _self.posArray,
								width : 10,
								arcType : Cesium.ArcType.NONE,
								material : new Cesium.PolylineArrowMaterialProperty(Cesium.Color.GREEN)
							}
						});
					_self._lines.push(greenLine);
					_self.state=_that.BEYONANALYSER_STATE.END;                    
					_self._resultChart=_self.showResult(_self.posArray[0],_self.posArray[1]);
					_self.posArray=[];
					_that.destroyHandler();
				}
			}, Cesium.ScreenSpaceEventType.LEFT_CLICK );
	}
	showResult(startPoint,endPoint){
		 //起止点相关信息
		 let _self = this;
		 var scartographic = Cesium.Cartographic.fromCartesian(startPoint);
		 //var ecartographic = BeyonMap.Cartographic.fromCartesian(endPoint);
		 var samplePoint=[scartographic];
		 var pointSum = 10;  //取样点个数
		 var tempCartesians = new Cesium.Cartesian3();
		 var slopePercent=[0];
		 var disL=[0];
		 var angle=0;
		 for(var i =1; i <= pointSum; i++){
			 Cesium.Cartesian3.lerp(startPoint, endPoint, i/pointSum, tempCartesians);
			 var tempCartographic = Cesium.Cartographic.fromCartesian(tempCartesians);
			 var surfaceHeight=_self.viewer.scene.globe.getHeight(tempCartographic);
			 tempCartographic.height=surfaceHeight;
			 samplePoint.push(tempCartographic);
			 var lastCarto=samplePoint[i-1];
			 var dis = Cesium.Cartesian3.distance(Cesium.Cartographic.toCartesian(lastCarto), Cesium.Cartographic.toCartesian(tempCartographic));            
			 disL.push(disL[i-1]+dis);
			 angle=Math.asin((tempCartographic.height-lastCarto.height)/dis);
			 slopePercent.push(Math.tan(angle)*100);
		 }
		 
		 var echartContainer = document.createElement('div');
		 echartContainer.className = 'echart-viewer';
		 _self.viewer.container.appendChild(echartContainer,'dark',{
			 renderer: 'canvas',
			 width: 640,
			 height:480
		 });
		 echartContainer.style.position = "absolute";  
		 echartContainer.style.left =  '160px';  
		 echartContainer.style.top =  '80px';  
		 echartContainer.style.height =  '300px'; 
		 echartContainer.style.width =  '640px'; 
		 echartContainer.style.overflow = "hidden";  
		 echartContainer.style.zIndex = "9999";  
		 echartContainer.style.opacity = 0.9; 
		 var myChart = echarts.init(echartContainer);
		 var option = {
			 title : {
				 text: '剖面示意图',
				 left: 'center',
				 subtext: '',
				 textStyle: {
					 color: 'white',
					 fontSize:15
				 }
			 },
			 tooltip : {
				 trigger: 'axis'
			 },
			 legend: {
				 data:['']
			 },
			 //右上角工具条
			 toolbox: {
				 show : false,
				 feature : {
					 mark : {show: true},
					 dataView : {show: true, readOnly: false},
					 magicType : {show: true, type: ['line', 'bar']},
					 restore : {show: true},
					 saveAsImage : {show: true}
				 }
			 },
			 calculable : true,
			 xAxis : [
				 {
					 type : 'category',
					 name:"长度(米)",
					 boundaryGap : false,
					 data : disL,
					 axisLabel : {
						 textStyle: {
							 color: 'white'
						 }
					 },
					 axisLine:{
						 lineStyle:{
							 color:"white"
						 }
					 }
				 }
			 ],
			 yAxis : [
				 {
					 type : 'value',
					 name:"坡度（%）",
					 axisLabel : {
						 formatter:function(data){ return data.toFixed(2)+"%";} ,
						 // formatter: '{value} 米',
						 textStyle: {
							 color: 'white'
						 }
					 },
					 axisLine:{
						 lineStyle:{
							 color:"white"
						 }
					 }
				 }
			 ],
			 series : [
				 {
					 name:'坡度',
					 type:'line',
					 areaStyle: {},
					 smooth: true,
					 data:slopePercent,
					 markPoint : {
						 data : [
							 {type : 'max', name: '最大值'},
							 {type : 'min', name: '最小值'}
						 ]
					 },
					 markLine : {
						 data : [
							 {type : 'average', name: '平均值'}
						 ]
					 }
				 }
			 ]
		 };

		 // 为echarts对象加载数据
		 myChart.setOption(option);
		 return myChart;
	}
	remove(){
		if(this._markers.length == 0){
			return false;
		}
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
		this.viewer.entities.remove(this._tip);   
		this._resultChart.dispose();
		this._tip=undefined;   
	}
}
