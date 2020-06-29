/*
 * @Descripttion: 
 * @version: 1.0
 * @Author: zhangti
 * @Date: 2019-10-25 17:45:47
 * @LastEditors: sueRimn
 * @LastEditTime: 2019-10-25 18:00:28
 */
/**
 * 环视通视分析
 */
import Analyser from '../analyser.js';
export default class PointVisual extends Analyser{
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
		
		
		return new PointVisualAnalyseEffect(this);
	}
}
/**
 * 内部分析类
 */
const PointVisualAnalyseEffect = class {

	constructor(_that){
		this._that = _that;
		this.options = _that.opt;
		this.viewer = _that._viewer;
		this.ANGLE_STEP=10;
        this.ANGLE_ERROR=Cesium.defaultValue(this.options.pitchErr,0.1);
		this.headingStep=Cesium.defaultValue(this.options.headingInterval,1);
		this._tip= this.viewer.entities.add({
			id:Cesium.createGuid(),
			label : {
				name: 'pointVisualAnalyseEffect',
				show : false,
				showBackground : true,
				font : '14px monospace',
				horizontalOrigin : Cesium.HorizontalOrigin.LEFT,
				verticalOrigin : Cesium.VerticalOrigin.BOTTOM,
				pixelOffset : new Cesium.Cartesian2(15, -10)
			}
		});
		this._orginCartographic=undefined;
		this.analysisData=[];
		this._lines=[];
		this._intersects=[];
		//报告
		this.rePort=[];
		//标牌集合
		this._labels = this.viewer.scene.primitives.add(new Cesium.LabelCollection({
			scene:this.viewer.scene
		}));
		this._personModel=undefined;
		this._processing=0;
		this.bShowLine=Cesium.defaultValue(this.options.showLine,true);
		this.init();
	}
	init(){
		let _self = this,_that = _self._that;
		_that.processTool.update("正在分析计算，请稍后。。。");
		//如果使用双击事件开始计算
		if(options.dbLeftClick){
			analyser.handler.setInputAction(function (movement) {
				var pos =Cesium.pickGlobe(viewer.scene,movement.position);   
				var cartog=Cesium.Cartographic.fromCartesian(pos);
	
				var landHeight=viewer.scene.globe.getHeight(cartog);
	
				//地表高1.6米视高
				cartog.height=landHeight+1.6;
	
				this._orginCartographic=cartog;
	
				var positioon=Cesium.Cartesian3.fromRadians(cartog.longitude, cartog.latitude, cartog.height);
				info ='视点';
				showTip(scope._tip,true,positioon,info);
				scope._origin=positioon;
				var promiseArray=[];
				for (let heading = 0; heading < 360; heading=heading+headingStep) {
					promiseArray.push(calculateVisualAngle(heading,0,ANGLE_ERROR*2,undefined));    

				}
				Promise.all(promiseArray)
				.then(function(results){
					processResult(results,options.callback)})
				.catch(function(e){
					console.log(JSON.stringify(e))});
			
	
			},Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
	
		}else if(options.position){
			scope._origin=options.position;         
			scope._processTotal=360/headingStep;
			for (let heading = 0; heading < 360; heading=heading+headingStep) {
				calculateVisualAngle(heading,0,ANGLE_ERROR*2,undefined)
				.then(function(result){
						processResult(result,options.callback)}) 
				.catch(function(e){
					console.log(JSON.stringify(e))});   

			}
		}
	}
	//使用promise
	calculateVisualAngle(heading,pitch,lastPitch=(ANGLE_ERROR*2)){
		var p=new Promise(function(resolve,reject){
			//迭代计算函数
			function runCompute(heading,pitch,lastPitch=(ANGLE_ERROR*2),lastRS){
				//创建本地矩阵
				// var hpr=Cesium.HeadingPitchRoll.fromDegrees(heading, pitch, 0);
				// var mat4=Cesium.Transforms.headingPitchRollToFixedFrame(scope._origin, hpr);
				var mat4 = Cesium.Transforms.eastNorthUpToFixedFrame(scope._origin)
				//设定方向
				var vec=new Cesium.Cartesian3();
				var angleRad=Cesium.Math.toRadians(heading);
				var pitchRad=Cesium.Math.toRadians(Math.abs(pitch));
				vec.x=Math.cos(angleRad);
				vec.y=Math.sin(angleRad);
				vec.z=Math.sin(pitchRad);
				//转换为世界坐标
				var vecWorld=new Cesium.Cartesian3();
				vecWorld=Cesium.Matrix4.multiplyByPoint(mat4, vec, vecWorld);    
				//获取相交体  只pick到一个object      
				var rsPick=analyser.getIntersectObj(scope._origin,vecWorld)[0];   

				//保存上一次的角度
				var newLastPitch=pitch;

				//如果有相交体，继续改变pith
				if(rsPick&&rsPick.object){
					//rs[0].position.clone(intersectPoint);                
					if(lastPitch>0){
						pitch-=ANGLE_STEP;
					}
					else if(lastPitch<pitch){
						pitch+=(lastPitch-pitch)/2;
					}else{
						pitch-=lastPitch-pitch;
					}
					//intersectEntity=rs[0].object.id;
					runCompute(heading,pitch,newLastPitch,rsPick);
				}
				//初始平时没有相交到时 直接返回
				else if(pitch===0){
					var rsData={
						heading:heading,
						maxVisualAngle:pitch,
						distance:0,
						position:undefined,
						object:undefined                     
					}
					resolve(rsData);
				}else{
					//角度相差ANGLE_ERROR  两次角度差小于精度差，认为上次是相交结果
					if((lastPitch-pitch)<ANGLE_ERROR){
						// var hpr=Cesium.HeadingPitchRoll.fromDegrees(heading, 0, 0);
						// var mat4=Cesium.Transforms.headingPitchRollToFixedFrame(scope._origin, hpr);
						//var mat4=Cesium.Transforms.eastNorthUpToFixedFrame(scope._origin)
						var inverseMat=new Cesium.Matrix4();
						//求逆矩阵
						inverseMat=Cesium.Matrix4.inverse(mat4, inverseMat);
						//转换为本地坐标
						var posLocal=new Cesium.Cartesian3();
						var intersectposition=lastRS.position;
						posLocal=Cesium.Matrix4.multiplyByPoint(inverseMat, intersectposition, posLocal);  
						// var visualVec =new Cesium.Cartesian3();
						//Cesium.Cartesian3.subtract(posLocal, scope._origin, visualVec);
						//var dis=Cesium.Cartesian3.magnitude(visualVec)*Math.cos(Cesium.Math.toRadians(visualAngle));
						
						var rsData={
							heading:heading,
							maxVisualAngle:pitch,
							distance:Cesium.Cartesian3.magnitude(posLocal)*Math.cos(Cesium.Math.toRadians(pitch)),
							position:intersectposition,
							object:lastRS.object                                        
						}
						resolve(rsData);
					}else{
						runCompute(heading,lastPitch-(lastPitch-pitch)/2,newLastPitch,lastRS);
					}
				}
			}                
			runCompute(heading,pitch,lastPitch);
		});
		return p;
	}
	//不使用promise来计算
	calculateVisualAngleNoPromise(heading,pitch,lastPitch=(ANGLE_ERROR*2),lastRS){
		//迭代计算函数
                //创建本地矩阵
                // var hpr=Cesium.HeadingPitchRoll.fromDegrees(heading, pitch, 0);
                // var mat4=Cesium.Transforms.headingPitchRollToFixedFrame(scope._origin, hpr);
                var mat4=Cesium.Transforms.eastNorthUpToFixedFrame(scope._origin)
                //设定方向
                var vec=new Cesium.Cartesian3();
                var angleRad=Cesium.Math.toRadians(heading);
                var pitchRad=Cesium.Math.toRadians(Math.abs(pitch));
                vec.x=Math.cos(angleRad);
                vec.y=Math.sin(angleRad);
                vec.z=Math.sin(pitchRad);
                //转换为世界坐标
                var vecWorld=new Cesium.Cartesian3();
                vecWorld=Cesium.Matrix4.multiplyByPoint(mat4, vec, vecWorld);    
                //获取相交体  只pick到一个object      
                var rsPick=analyser.getIntersectObj(scope._origin,vecWorld)[0];   

                //保存上一次的角度
                var newLastPitch=pitch;

                //如果有相交体，继续改变pith
                if(rsPick&&rsPick.object){
                    //rs[0].position.clone(intersectPoint);                
                    if(lastPitch>0){
                        pitch-=ANGLE_STEP;
                    }
                    else if(lastPitch<pitch){
                        
                        pitch+=(lastPitch-pitch)/2;
                    }else{
                        pitch-=lastPitch-pitch;
                    }
                    //intersectEntity=rs[0].object.id;
                    return calculateVisualAngleNoPromise(heading,pitch,newLastPitch,rsPick);
                }
                //初始平时没有相交到时 直接返回
                else if(pitch===0){
                    var rsData={
                        heading:heading,
                        maxVisualAngle:pitch,
                        distance:0,
                        position:undefined,
                        object:undefined                     
                    }
                    return rsData;
                }else{
                    //角度相差ANGLE_ERROR  两次角度差小于精度差，认为上次是相交结果
                    if(Math.abs(lastPitch-pitch)<ANGLE_ERROR){
                        // var hpr=Cesium.HeadingPitchRoll.fromDegrees(heading, 0, 0);
                        // var mat4=Cesium.Transforms.headingPitchRollToFixedFrame(scope._origin, hpr);
                        //var mat4=Cesium.Transforms.eastNorthUpToFixedFrame(scope._origin)
                        var inverseMat=new Cesium.Matrix4();
                        //求逆矩阵
                        inverseMat=Cesium.Matrix4.inverse(mat4, inverseMat);
                        //转换为本地坐标
                        var posLocal=new Cesium.Cartesian3();
                        var intersectposition=lastRS.position;
                        posLocal=Cesium.Matrix4.multiplyByPoint(inverseMat, intersectposition, posLocal);  
                    // var visualVec =new Cesium.Cartesian3();
                        //Cesium.Cartesian3.subtract(posLocal, scope._origin, visualVec);
                        //var dis=Cesium.Cartesian3.magnitude(visualVec)*Math.cos(Cesium.Math.toRadians(visualAngle));
                        
                        var rsData={
                            heading:heading,
                            maxVisualAngle:pitch,
                            distance:Cesium.Cartesian3.magnitude(posLocal)*Math.cos(Cesium.Math.toRadians(pitch)),
                            position:intersectposition,
                            object:lastRS.object                                        
                        }
                        return rsData;
                    }else{
                        return calculateVisualAngleNoPromise(heading,lastPitch-(lastPitch-pitch)/2,newLastPitch,lastRS);
                    }
                }
	}
	//处理分析结果
	processAllResult(rsDatas,callback){
		for (let index = 0; index < rsDatas.length; index++) {
			const rs = rsDatas[index];
			var cartog_pos;
			if(rs.position){
				cartog_pos=Cesium.Cartographic.fromCartesian(rs.position);
				//添加视线
				if(bShowLine){
					var redLine=_self.entitys.add({
						polyline : {
							positions : [scope._origin,rs.position],
							width : 10,
							arcType : Cesium.ArcType.NONE,
							material : new Cesium.PolylineArrowMaterialProperty(Cesium.Color.RED)
						}
					});
					scope._lines.push(redLine);
				}            
			}
			//储存相交体
			if(rs.object){
				if(!scope._intersects.includes(rs.object.id)){
					scope._intersects.push(rs.object.id); 
				}                    
			}                           

			
			var data={
				// "经度":Cesium.Math.toDegrees(cartog.longitude),
				// "纬度":Cesium.Math.toDegrees(cartog.latitude),
				// "视高":1.6,
				"视角":rs.heading,
				"水平距离":rs.distance>0?rs.distance.toFixed(3):"水平无遮挡",
				"最大遮挡角":rs.maxVisualAngle,
				"遮挡点经度":cartog_pos?Cesium.Math.toDegrees(cartog_pos.longitude).toFixed(6):'',
				"遮挡点纬度":cartog_pos?Cesium.Math.toDegrees(cartog_pos.latitude).toFixed(6):'',
				"遮挡点高度":cartog_pos?Cesium.Math.toDegrees(cartog_pos.height).toFixed(3):'',
			}
			scope.rePort.push(data);                
		}
		//导出excel
		//saveDataToFile("test",reData);
		//处理场景中entity，保留相交体
		for (let index = 0; index < viewer.dataSources.length; index++) {
			const dataSource = viewer.dataSources.get(index);
			if(dataSource.name!=="gugong.geojson") continue;
			var entities =dataSource.entities.values;

			for (var i = 0; i < entities.length;i++) {
				var entity = entities[i];
				if(!scope._intersects.includes(entity)){
					entity.show=false;
				}else{
					var name=entity.name||'';
					var info=
					'名称：'+name+
					'\n面积：'+entity.area.toFixed(2)+' 平方米';

					scope._labels.add({
						id:entity.id,
						text: info,
						show : true,
						position:entity.center,
						showBackground : true,
						font : '64px monospace',
						scale:0.2,
						horizontalOrigin : Cesium.HorizontalOrigin.LEFT,
						verticalOrigin : Cesium.VerticalOrigin.BOTTOM,
						pixelOffset : new Cesium.Cartesian2(15, -10),
						heightReference:Cesium.HeightReference.CLAMP_TO_GROUND,
						
					});
				}                   
			}
			
		} 
		callback();
	}
	//处理单个结果
	processResult(rs,callback){
		var cartog_pos;
		if(rs.position){
			cartog_pos=Cesium.Cartographic.fromCartesian(rs.position);
			//添加视线
			if(bShowLine){
				var redLine=viewer.entities.add({
					polyline : {
						positions : [scope._origin,rs.position],
						width : 10,
						arcType : Cesium.ArcType.NONE,
						material : new Cesium.PolylineArrowMaterialProperty(Cesium.Color.RED)
					}
				});
				scope._lines.push(redLine);
			}
						
		}
		//储存相交体
		if(rs.object){
			if(!scope._intersects.includes(rs.object.id)){
				scope._intersects.push(rs.object.id); 
			}                    
		}                           

		
		var data={
			// "经度":Cesium.Math.toDegrees(cartog.longitude),
			// "纬度":Cesium.Math.toDegrees(cartog.latitude),
			// "视高":1.6,
			"视角":rs.heading,
			"水平距离":rs.distance>0?rs.distance.toFixed(3):"水平无遮挡",
			"最大遮挡角":rs.maxVisualAngle,
			"遮挡点经度":cartog_pos?Cesium.Math.toDegrees(cartog_pos.longitude).toFixed(6):'',
			"遮挡点纬度":cartog_pos?Cesium.Math.toDegrees(cartog_pos.latitude).toFixed(6):'',
			"遮挡点高度":cartog_pos?Cesium.Math.toDegrees(cartog_pos.height).toFixed(3):'',
		}
		scope.rePort.push(data);      
		
		scope._processing++;
		var percent=scope._processing/scope._processTotal*100;
		var m=(360-scope._processing*headingStep)/headingStep;
		if(m<1){                
			processTool.update("100%","分析计算完毕");
			callback&&callback();
			setTimeout(() => {
				processTool.setVisible(false);
			}, 2000);
		}else{
			processTool.update(percent+'%',"正在分析计算，请稍候。。。");
		}
	}
	//清除
	remove(){
		this.analysisData=[];
		_self.entitys.remove(this._tip);   
		this._tip=undefined;   

		for (let index = 0; index < this._lines.length; index++) {
			var element = this._lines[index];
			_self.entitys.remove(element);            
		}
		this._lines.length=0;

		this._labels.removeAll();
		//this._labels.destroy();
		_self.Primitives.remove(this._labels);

		this._personModel&& _self.entitys.remove(this._personModel);
		this._personModel=undefined;
		this.rePort.length=0;
		this._intersects.length=0;

		//隐藏的建筑显示
		for (let index = 0; index < viewer.dataSources.length; index++) {
			const dataSource = viewer.dataSources.get(index);
			if(dataSource.name!=="gugong.geojson") continue;
			var entities =dataSource.entities.values;

			for (var i = 0; i < entities.length;i++) {
				var entity = entities[i];
				entity.show=true;               
			}
			
		} 
	}
}