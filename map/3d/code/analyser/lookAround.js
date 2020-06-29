/*
 * @Descripttion: 
 * @version: 1.0
 * @Author: zhangti
 * @Date: 2019-11-14 15:46:50
 * @LastEditors  : sueRimn
 * @LastEditTime : 2020-01-15 15:25:54
 */
/**
 * @override
 * 需要引入
  <script src="../libs/EllipseGeometryLibraryEx.js"></script>
  <script src="../libs/SysMathTool.js"></script>
  <script src="../libs/ThreeDTilesToolCopy.js.js"></script>
  <script src="../libs/PrimitivePoints.js"></script>
 * 环视分析
 */
import Analyser from '../analyser.js';
import DrawDynamicTool from '../DrawDynamicTool.js';
export default class LookAround extends Analyser {
	/**
	 * @override
	 * 初始化
	 */
	constructor(supers,opt){
		super(supers);
		//opt = Cesium.defaultValue(opt, Cesium.defaultValue.EMPTY_OBJECT);	//判断是否有值
		for(let key in opt){
			this[key] = opt[key];
		}
		//参数
		this.primitiveKSY = []
		this.draw = new DrawDynamicTool(this._viewer);
		this._resultTip = this._viewer.entities.add({
			id: Cesium.createGuid(),
			label : {
				fillColor:Cesium.Color.YELLOW,
				showBackground : true,
				font : '14px monospace',
				horizontalOrigin : Cesium.HorizontalOrigin.LEFT,
				verticalOrigin : Cesium.VerticalOrigin.BOTTOM,
				pixelOffset : new Cesium.Cartesian2(0, -10)
			}
		});
		this.action();
	}
	/**
	 * @override
	 * 鼠标控制
	 */
	action(){
		this.draw.circleDraw((poi,center,r)=>{
			if(!r){
				alert('没有获取到半径');
				return false;
			}
			this.draw.remove();
			setTimeout(()=>{
				this.analyser(center,r);
			},500)
		});
	}
	/**
	 * @override
	 * 清除分析
	 */
	remove(){
		if (this.primitiveKSY.length > 0) {
			for (var i = 0; i < this.primitiveKSY.length; i++) {
				this.primitiveKSY[i].remove();
				this.primitiveKSY[i] = null;
			}
			this.primitiveKSY = [];
		}
	}
	/**
	 * @override
	 * 分析
	 * @param {*} cartesian 
	 */
	analyser(cartesian,r){ //viewHeight
		try {
			if (this.primitiveKSY.length > 0)return false;
			let _self = this,viewHeight = 10;
			_self._viewer.scene.globe.depthTestAgainstTerrain = true; //开启地形遮挡
			var cartographicCenter = Cesium.Cartographic.fromDegrees(cartesian[0], cartesian[1]);
			var cartesianCenterH0 = Cesium.Cartesian3.fromRadians(cartographicCenter.longitude, cartographicCenter.latitude);
			//var cartesianPointH0 = Cesium.Cartesian3.fromDegrees(cartesian[0] + 0.001,  cartesian[1] + 0.001);
			//let ab = Cesium.Cartesian3.distance(cartesianCenterH0, cartesianPointH0); 半径
			let ab = r;
			let eopt = {};
			eopt.semiMinorAxis = ab;
			eopt.semiMajorAxis = ab;
			eopt.rotation = 0;
			eopt.center = cartesianCenterH0;
			eopt.granularity = Math.PI / 45.0;//间隔
			let ellipse = CesiumBuild.EllipseGeometryLibraryEx.computeEllipseEdgePositions(eopt); //范围当前椭圆位置的数组
			for (let i = 0; i < ellipse.outerPositions.length; i += 3) {
				//逐条计算可视域
				let cartesian = new Cesium.Cartesian3(ellipse.outerPositions[i], ellipse.outerPositions[i + 1], ellipse.outerPositions[i + 2]);
				let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
				let deltaRadian = 0.00005 * Math.PI / 180.0; //Cesium.Math.RADIANS_PER_DEGREE
				let cartographicArr = CesiumBuild.SysMathTool.InterpolateLineCartographic(cartographicCenter, cartographic, deltaRadian);
				CesiumBuild.ThreeDTilesToolCopy.CartographicPointsTerrainData(_self._viewer, cartographicArr,
					function (terrainData) {
						if (terrainData.length > 0) {
							let preVisible = true;
							let cartesiansLine = [];
							let colors = [];
							for (let j = 1; j < terrainData.length; j++) {
								//逐点计算可见性
								let visible = true;//该点可见性
								if (j > 1) {
									let cartographicCenterHV = new Cesium.Cartographic(terrainData[0].longitude, terrainData[0].latitude, terrainData[0].height + viewHeight);
									console.log(cartographicCenterHV);
									if (preVisible) {
										//     
										let curPoint = CesiumBuild.SysMathTool.InterpolateIndexLineHeightCartographic(cartographicCenterHV, terrainData[j], j, j - 1);
										if (curPoint.height >= terrainData[j - 1].height) {
											preVisible = true;
											visible = true;
										} else {
											preVisible = false;
											visible = false;
										}
									} else {
										//插值到当前
										let curPointArr = CesiumBuild.SysMathTool.Interpolate2IndexLineHeightCartographic(cartographicCenterHV, terrainData[j], j, j - 1);
										for (let k = 0; k < curPointArr.length; k++) {
											if (curPointArr[k].height >= terrainData[k].height) {
												preVisible = true;
												visible = true;
											} else {
												preVisible = false;
												visible = false;
												break;
											}
										}
									}
								}
								let cartesianTemp = Cesium.Cartesian3.fromRadians(terrainData[j].longitude, terrainData[j].latitude, terrainData[j].height + 1);
								cartesiansLine.push(cartesianTemp);
								//绘制点
								if (visible) {
									colors.push(0);
									colors.push(0);
									colors.push(1);
									colors.push(1);
								} else {
									colors.push(1);
									colors.push(0);
									colors.push(0);
									colors.push(1);
								}
							}
		
							//绘制结果
							let pointsKSY = new CesiumBuild.PrimitivePoints({ 'viewer': _self._viewer, 'Cartesians': cartesiansLine, 'Colors': colors });
							_self.primitiveKSY.push(pointsKSY);
						} else {
							alert("高程异常！");
						}
					});
			}
		} catch (error) {
			console.log(error);
		}
		
	}
}