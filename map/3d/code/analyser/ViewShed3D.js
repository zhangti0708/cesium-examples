/*
 * @Descripttion: 
 * @version: 1.0
 * @Author: zhangti
 * @Date: 2019-10-25 11:25:10
 * @LastEditors: sueRimn
 * @LastEditTime: 2019-11-26 17:33:12
 */
/**
 * 可视域分析
 * 超图
 */
import Analyser from '../analyser.js';
export default class ViewShed3D extends Analyser{
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
		let _self = this,viewer = _self._viewer,viewPosition;
		this._viewer.scene.viewFlag = true;
		_self.viewshed3D = new Cesium.ViewShed3D(viewer);
		/*_self.viewshed3D.distance = 0.1;
		let colorStr1 = _self.viewshed3D.visibleAreaColor.toCssColorString();
		let colorStr2 = _self.viewshed3D.hiddenAreaColor.toCssColorString();
		//鼠标移动时间回调
		let handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
		//移动
		handler.setInputAction(function (e) {
			//若此标记为false，则激活对可视域分析对象的操作
			if (!viewer.scene.viewFlag) {
				//获取鼠标屏幕坐标,并将其转化成笛卡尔坐标
				var position = e.endPosition;
				var last = viewer.scene.pickPosition(position);
				//计算该点与视口位置点坐标的距离
				var distance = Cesium.Cartesian3.distance(viewPosition, last);
				if (distance > 0) {
					//将鼠标当前点坐标转化成经纬度
					var cartographic = Cesium.Cartographic.fromCartesian(last);
					var longitude = Cesium.Math.toDegrees(cartographic.longitude);
					var latitude = Cesium.Math.toDegrees(cartographic.latitude);
					var height = cartographic.height;
					//通过该点设置可视域分析对象的距离及方向
					_self.viewshed3D.setDistDirByPoint([longitude, latitude, height]);
				}
			}
		}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
		//左键
		handler.setInputAction(function (e) {
			if(!e.position){
				return false;
			}
			//将获取的点的位置转化成经纬度
			let position = _self.mouseManager.piTerrainToModule(e.position,"1");
			viewPosition = _self.mouseManager.piTerrainToModule(e.position);
            if (viewer.scene.viewFlag) {
                //设置视口位置
                _self.viewshed3D.viewPosition = [position.lon, position.lat, position.height];
                _self.viewshed3D.build();
                //将标记置为false以激活鼠标移动回调里面的设置可视域操作
                viewer.scene.viewFlag = false;
            }
		}, Cesium.ScreenSpaceEventType.LEFT_CLICK)
		//右键
		handler.setInputAction(function (e) {
			//鼠标右键事件回调，不再执行鼠标移动事件中对可视域的操作
			viewer.scene.viewFlag = true;
	
		}, Cesium.ScreenSpaceEventType.RIGHT_CLICK);*/
	}
	remove(){
		if(this.viewshed3D != undefined){
			this.viewshed3D.destroy();
		}
	}
}