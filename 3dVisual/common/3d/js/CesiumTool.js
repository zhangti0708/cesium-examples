/**====================================================================== [地图工具] ======================================================================================= */
/************************************************* cesium画笔 start  ***************************************************** */
/** 
 cesium画笔
 */
var Cesiumbrush = (function(){
    var color;
    var viewer;
    var camera = null;
    var polyline = [],polyline1;
    var drawing = false;
    var positions = [];
    var handler = null;
    function _(){};
    _.init = function(param){
        if(null === param || undefined === param)return;
		var t = this;
		for(var key in param){
			t[key] = param[key];
        }

        viewer = this.viewer,camera = viewer.camera;
        this.show();

    }
    _.click = function(){
        if(handler != null){
            handler.destroy();
            handler=null;
        }
        handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
        handler.setInputAction(function (click) {
            if (drawing) {
                color.alpha = 0.6;
                var poly = viewer.entities.add({
                    polygon: {
                        hierarchy : {
                            positions : positions
                        },
                        material : color,
                        outline : true
                    }
                });
                console.log(positions);
                polyline.push(poly);
                positions = [];
               
            } else {
                color = Cesium.Color.fromRandom({alpha : 1.0});
                var poly = viewer.entities.add({
                    polyline : {
                        positions : new Cesium.CallbackProperty(function(){
                            return positions;
                        }, false),
                        material : color
                    }
                });
                polyline.push(poly);
            }
            drawing = !drawing;
        },
        Cesium.ScreenSpaceEventType.LEFT_CLICK
        );
        handler.setInputAction(
            function (movement) {
                var surfacePosition = camera.pickEllipsoid(movement.endPosition);
                if (drawing && Cesium.defined(surfacePosition)) {
                    positions.push(surfacePosition);
                }
            },
            Cesium.ScreenSpaceEventType.MOUSE_MOVE
        );
    }
    _.remove = function(){
        if(viewer == null || viewer =="")return;
        for(var i in polyline) viewer.entities.remove(polyline[i]);
        if(handler != null){
            handler.destroy();
            handler=null;
        }
    }
    _.show = function(){ 

        this.click();
    }

    return _;
})();
/************************************************* cesium画笔 end  ***************************************************** */
/************************************************* CesiumMeasure start  ***************************************************** */
/**
 * 测量工具
 * 线 面
 */
var CesiumMeasure = (function(){
    var viewer,drawType = "areaSpace";
    function _(){}
    _.init = function(param,flag){
        if(null === param || undefined === param)return;
		var t = this;
		for(var key in param){
			t[key] = param[key];
        }

        viewer = this.viewer
        //if(flag)this.build(param);
        //if(!flag)measureAreaSpace(viewer); //工具默认测试面积
        if(param.type == "" || param.type == undefined)return;
        this.remove();
        if("areaSpace" == param.type){
            measureAreaSpace(viewer);
        }else if("lineSpace" == param.type){
            measureLineSpace(viewer);
        }
    }
    _.build = function(param){
        if(null === param || undefined === param)return;
        switch(param.type){
            case "areaSpace":{this.createAreaSpace();break;}
            case "lineSpace":{this.createLineSpace();break;}
        }

        this.createToolbar();

    }
    _.initSelect = function(){ //创建默认初始化数据
        tableparam	 = [
            {id:"_ids1",type:"select",key:"type",value:["areaSpace","lineSpace"],code:["areaSpace","lineSpace"]},
            {id:"_ids2",type:"text",key:"lon",value:117.286419,code:"lon"},
            {id:"_ids3",type:"text",key:"lat",value:30.864436,code:"lat"},
            {id:"_ids4",type:"text",key:"heigth",value:20000.,code:"heigth"}
        ]
        var table = createTable(tableparam);
        $("#content").empty().append(table);
        $("#content table").css("text-align","center").css("margin","5px");
        $("#content select,input").css("vertical-align","middle").css("padding-top","2px").css("padding-bottom","2px").css("width","150px");
    }

    _.select = function(viewer){ //点击查询初始化的数据
       if(tableparam.length == 0)return;
       var selectData = [];
       for(var i in tableparam){
           var val = $('#_ids'+(parseInt(i)+1)).val();
           selectData.push({id:'_ids'+(parseInt(i)+1),code:tableparam[i].key,value:val});
       }
       var initData = {
            viewer:viewer,
            type:selectData[0].value,
            lon:selectData[1].value,
            lat:selectData[2].value,
            heigth:selectData[3].value,
       }
       return initData;

    }
    _.createAreaSpace = function(){
        var t = this;
        viewer.camera.flyTo({
            destination :Cesium.Cartesian3.fromDegrees(t.lon,t.lat,t.heigth)
        });
        
        measureAreaSpace(viewer);       //测面  
    }
    _.createLineSpace = function(){
        var t = this;
        viewer.camera.flyTo({
            destination :Cesium.Cartesian3.fromDegrees(t.lon,t.lat,t.heigth)
        });

        measureLineSpace(viewer); //测线
    }
    _.switch = function(node){ //新增基础版本功能
        drawType = node;
        if(drawType == "")return;
        this.remove();
        if("areaSpace" == drawType){
            measureAreaSpace(viewer);
        }else{
            measureLineSpace(viewer);
        }

    }
    _.createMeasureToolbar = function(){//新增基础版本功能
        var measure = 
        '<div id="measure">'+
        '<select class="cesium-button" onchange="CesiumMeasure.switch(this.value);"><option value="areaSpace">测面</option><option value="lineSpace">测线</option></select>'+
        '</div>';
        $("#measure").remove();
        $("body").append(measure);
        $("#measure").css("background","rgba(42, 42, 42, 0.8)").css("padding","4px;").css("border-radius", "4px");
    }
    _.remove = function (){
        if(removeMeasureArr != 0){for(var i in removeMeasureArr)viewer.entities.remove(removeMeasureArr[i]); removeMeasureArr = []}
    
    }
    _.createToolbar = function(){
        var measure = 
        '<div id="measure">'+
        '<div><select class="cesium-button" onchange="CesiumMeasure.switch(this.value);"><option value="areaSpace">测面</option><option value="lineSpace">测线</option></select>'+
        '</div><div><button type="button" class="cesium-button" onclick="CesiumMeasure.add();">添加</button>'+
        '<button type="button" class="cesium-button" onclick="CesiumMeasure.remove();">删除</button>'+
        '</div><div></div>';
        $("#measure").remove();
        $("body").append(measure);
        $("#measure").css("background","rgba(42, 42, 42, 0.8)").css("padding","4px;").css("border-radius", "4px");
    }
    return _;
})();
/************************************************* CesiumMeasure end  ***************************************************** */
/************************************************* Cesiumplot start  ***************************************************** */
/**
 * Created by xph
   此代码基于MIT开源协议，引用请注明版权
   Licensed under the MIT license
 */
var CesiumPlot = (function(){
    var viewer = null,scene,drawHelper = null,toolbar,plots = [];
    function _(){};

    _.init = function(param){
        if(null === param || undefined === param)return;
		var t = this;
		for(var key in param){
			t[key] = param[key];
        }
        this.remove();
        viewer = this.viewer
        ,scene = viewer.scene
        ,drawHelper = new DrawHelper(viewer);
        this.config();
    }
    _.config = function(){
      
        toolbar = drawHelper.addToolbar(document.getElementById("plot"), {
            buttons: ['polygon','extent',"tailedAttackArrow"]
        });
        toolbar.addListener('polygonCreated', function (event) {
            console.log('钳击箭头');
            var polygon = new DrawHelper.PolygonPrimitive({
                positions: event.positions,
                custom:event.custom,
                material: Cesium.Material.fromType(Cesium.Material.ColorType)
            });
            scene.primitives.add(polygon);
            plots.push(polygon);
            polygon.setEditable();
            polygon.addListener('onEdited', function (event) {
                console.log('钳击箭头');
            });

        });
        toolbar.addListener('tailedAttackCreated', function (event) {
            console.log('攻击箭头');
            var polygon = new DrawHelper.TailedAttackPrimitive({
                positions: event.positions,
                custom:event.custom,
                material: Cesium.Material.fromType(Cesium.Material.ColorType)
            });
            scene.primitives.add(polygon);
            plots.push(polygon);
            polygon.setEditable();
            polygon.addListener('onEdited', function (event) {
                console.log('攻击箭头');
            });

        });             
        toolbar.addListener('straightArrowCreated', function (event) {
            var arrow = event.arrow;
            var straightArrowPrimitive = new DrawHelper.StraightArrowPrimitive({
                arrow: arrow,
                material: Cesium.Material.fromType(Cesium.Material.ColorType)
            });
            scene.primitives.add(straightArrowPrimitive);
            plots.push(straightArrowPrimitive);
            straightArrowPrimitive.setEditable();
            straightArrowPrimitive.addListener('onEdited', function (event) {
                console.log('箭头创建');
            });
        });

    }
    _.remove = function(){
        if(viewer == null || viewer == "")return;
        if(plots != 0){
            for(var i in plots)scene.primitives.remove(plots[i]);
        }
        $("#plot").empty();    
        
    }
    return _;

})();
/************************************************* Cesiumplot end  ***************************************************** */
/************************************************* measureTriangle start ***************************************************** */
var CesiumTriangle = (function(){
    var viewer;
    var removeObj = [];
    function _(){};
    _.init = function(param){
        if(param ==null || param ==undefined )return;
        viewer = param.viewer;
        this.build();

    }

    _.build = function(){
        measureTriangle(viewer,"",removeObj);
        //measureLineSpace(viewer,"")
    }
    _.remove = function(){
        if(removeObj != 0 ){

            for(var i in removeObj)viewer.entities.remove(removeObj[i]);
        }
    }
    return _;
})();


var measureTriangle = function (viewer, handler,removeObj){	
	handler_g = handler = new Cesium.ScreenSpaceEventHandler(viewer.scene._imageryLayerCollection);
    var positionsTriangle = [];
    var removeChange = [];
	var tempPoints ;//保存直角点
	var poly = null;
	var cartesian = null;
	var floatingPoint;//浮动点
    var measure_entities = viewer.entities.add(new Cesium.Entity());
	handler.setInputAction(function(movement){
        try{

            //cartesian = viewer.scene.pickPosition(movement.endPosition); 
            var ray = viewer.camera.getPickRay(movement.endPosition);
			cartesian = viewer.scene.globe.pick(ray, viewer.scene);
            if(cartesian == null && cartesian == undefined)return;
            //cartesian = viewer.scene.camera.pickEllipsoid(movement.endPosition, viewer.scene.globe.ellipsoid);
            if(positionsTriangle.length >= 2){
                if (!Cesium.defined(poly)) {		
                    poly = new PolylinePrimitive(positionsTriangle);
                }else{
                    positionsTriangle.pop();				                      
                    positionsTriangle.push(cartesian.clone());
                    tempPoints= point_conf(positionsTriangle);

                    create();
                }
            }
        }catch(e){

            console.log(e);
        }
		
	},Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    

	handler.setInputAction(function(movement){
		if(positionsTriangle.length == 0) {
			
            //cartesian = viewer.scene.pickPosition(movement.position); 
            var ray = viewer.camera.getPickRay(movement.position);
			cartesian = viewer.scene.globe.pick(ray, viewer.scene);
     
            positionsTriangle.push(cartesian.clone());
            
			positionsTriangle.push(cartesian.clone());
			
		    //tempPoints= point_conf(positionsTriangle);	
 
			floatingPoint_g = floatingPoint = viewer.entities.add({
				parent:measure_entities,
				name : '多边形面积',
				position : positionsTriangle[0],			
				point : {
					pixelSize : 5,
					color : Cesium.Color.RED,
					outlineColor : Cesium.Color.WHITE,
					outlineWidth : 2,
					heightReference:Cesium.HeightReference.none 
				}
            });
            
            removeObj.push(floatingPoint_g);
		}		
	},Cesium.ScreenSpaceEventType.LEFT_CLICK);
    var remove = function(){
        if(removeChange.leng ==0 )return;
        for(var i in removeChange)viewer.entities.remove(removeChange[i]);
    }
    var create = function(){
        //在三维场景中添加线
        remove();
        var tempPositions1 =[];
        var tempPositions2 =[];
        tempPositions1.push(positionsTriangle[0].clone());
        tempPositions1.push(tempPoints.clone());
        var textDistance = (getHeight(tempPositions1)) + "米";
        
        var lonlat = viewer.entities.add({
                parent:measure_entities,
                name : '等经纬度',
                position : tempPositions1[0].clone(),
                polyline : {					
                    show : true,
                    positions : tempPositions1,
                    material :  new Cesium.PolylineDashMaterialProperty({
                            color: Cesium.Color.RED
                        }),
                    width : 2						
                },
                label : {
                    text : textDistance,
                    font : '18px sans-serif',
                    fillColor : Cesium.Color.GOLD,
                    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                    outlineWidth : 2,
                    verticalOrigin : Cesium.VerticalOrigin.BOTTOM,
                    pixelOffset : new Cesium.Cartesian2(20, -20)
                }
        })
        tempPositions2.push(tempPoints.clone());
        tempPositions2.push(positionsTriangle[1].clone());
        textDistance = (getDistance(tempPositions2) / 1000) + "公里";
        var line  = viewer.entities.add({
                parent:measure_entities,
                name : '等高度直线',
                position : tempPositions2[0].clone(),
                polyline : {					
                    show : true,
                    positions : tempPositions2,
                    material :  new Cesium.PolylineDashMaterialProperty({
                            color: Cesium.Color.RED
                        }),
                    width : 2						
                },
                label : {
                    text : textDistance,
                    font : '18px sans-serif',
                    fillColor : Cesium.Color.GOLD,
                    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                    outlineWidth : 2,
                    verticalOrigin : Cesium.VerticalOrigin.BOTTOM,
                    pixelOffset : new Cesium.Cartesian2(60, -20)
                }
            })
        //初始化
        removeChange = [];
        removeChange = [line,lonlat];
        removeObj.push(lonlat),removeObj.push(line);
        
    }

	handler.setInputAction(function(movement){
		handler.destroy();	
		// handler_g.destroy();//关闭事件句柄		

		// tempPoints =point_conf(positionsTriangle);
		create();
 
    }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK );	
    

    function getHeight(positions){
        var cartographic = Cesium.Cartographic.fromCartesian(positions[0]);
        var cartographic1 = Cesium.Cartographic.fromCartesian(positions[1]);
        var height_temp = cartographic1.height - cartographic.height;				
        return height_temp.toFixed(2);    			
    }
    
    function point_conf(_positions){
        var cartographic = Cesium.Cartographic.fromCartesian(_positions[0]);
        var cartographic1 = Cesium.Cartographic.fromCartesian(_positions[1]);			
        var point_temp= Cesium.Cartesian3.fromDegrees(Cesium.Math.toDegrees(cartographic.longitude), Cesium.Math.toDegrees(cartographic.latitude),cartographic1.height);
        return 	point_temp;			
    }

     //空间两点距离计算函数
    function getSpaceDistance(positions) {
        var distance = 0;
        for (var i = 0; i < positions.length - 1; i++) { 
            
        var point1cartographic = Cesium.Cartographic.fromCartesian(positions[i]);
        var point2cartographic = Cesium.Cartographic.fromCartesian(positions[i+1]);
        /**根据经纬度计算出距离**/
        var geodesic = new Cesium.EllipsoidGeodesic();
        geodesic.setEndPoints(point1cartographic, point2cartographic);
        var s = geodesic.surfaceDistance;
        //console.log(Math.sqrt(Math.pow(distance, 2) + Math.pow(endheight, 2)));
        //返回两点之间的距离
        s = Math.sqrt(Math.pow(s, 2) + Math.pow(point2cartographic.height - point1cartographic.height, 2));	
        distance = distance + s;
        }	
        return distance.toFixed(2);    
    }


    function getDistance(positions){
		var point1cartographic = Cesium.Cartographic.fromCartesian(positions[1]);
		var point2cartographic = Cesium.Cartographic.fromCartesian(positions[0]);
		/**根据经纬度计算出距离**/
		var geodesic = new Cesium.EllipsoidGeodesic();
		geodesic.setEndPoints(point1cartographic, point2cartographic);
		var s = geodesic.surfaceDistance;
		//console.log(Math.sqrt(Math.pow(distance, 2) + Math.pow(endheight, 2)));
		//返回两点之间的距离
		s = Math.sqrt(Math.pow(s, 2) + Math.pow(point2cartographic.height - point1cartographic.height, 2));	
		return s;
	}

	var PolylinePrimitive = (function(){
		function _(positions){
			this.options = {
				parent:measure_entities,
				name:'直线',
				polyline : {					
					show : true,
					positions : [],
					material : Cesium.Color.GOLD ,
					width : 2						
				},
				label : {					
					font : '18px sans-serif',
					fillColor : Cesium.Color.GOLD,
					style: Cesium.LabelStyle.FILL_AND_OUTLINE,
					outlineWidth : 2,
					verticalOrigin : Cesium.VerticalOrigin.BOTTOM,
					pixelOffset : new Cesium.Cartesian2(20, -40)
				}
			};
			this.positions = positions;
			this._init();
		}
	
		_.prototype._init = function(){
			var _self = this;
			var _update = function(){				
				return _self.positions;
			};
			var _update_label = function(){
				return _self.positions[1].clone();
			};
			var _text = function(){
				var text_temp = getSpaceDistance(_self.positions);
				text_temp = (text_temp / 1000) +"公里";
				return text_temp;
			};
			//实时更新polygon.hierarchy
			this.options.polyline.positions = new Cesium.CallbackProperty(_update,false);
			this.options.position = new Cesium.CallbackProperty(_update_label,false);
			this.options.label.text =new Cesium.CallbackProperty(_text,false);
			removeObj.push(viewer.entities.add(this.options));
		};	
		return _;
	})();
};
/************************************************* measureTriangle end ***************************************************** */
/************************************************* Cesiumflicker start    ***************************************************** */
/***
 * 闪烁 高亮
 * 圆形
 */
var Cesiumflicker = (function(){
    var viewer,points = [],mouseHandlerDraw,ellipsoid = Cesium.Ellipsoid.WGS84;
    function _(){};
    
    _.init = function(param,flag){
         if(param == null && param == "")return ;
         var t = this;
         for(var key in param){   
             t[key] = param[key];
         }
         if(flag)this.build();
    }
    _.build = function(){
        viewer = this.viewer;
        switch(this.type){
            case "point" :{this.createPoint(this.lon,this.lat);break;}
            default:{this.toolAddRader(); return;}
        }
        this.initController();
        viewer.zoomTo(viewer.entities);
    }
    _.createPoint = function(lon,lat){
            var x=1,flog=true,_color = Cesium.Color.fromRandom({alpha : 0.8});
            var point = viewer.entities.add({
                name:"圆形区域闪烁",
                position:Cesium.Cartesian3.fromDegrees(lon,lat,0),
                ellipse : {
                    semiMinorAxis : this.semiMinorAxis,
                    semiMajorAxis : this.semiMajorAxis,
                    height : 0,
                    material:new Cesium.ColorMaterialProperty(new Cesium.CallbackProperty(function () {
                        if(flog){
                            x=x-0.05;
                            if(x<=0){
                                flog=false;
                            }
                        }else{
                            x=x+0.05;
                            if(x>=1){
                                flog=true;
                            }
                        }
                        return _color.withAlpha(x);
                    },false))
                }
            });
            points.push(point);
            return point;
    }
    _.initSelect = function(){ //创建默认初始化数据
        tableparam	 = [	 
            {id:"_ids1",type:"select",key:"type",value:["point"],code:["point"]},
            {id:"_ids2",type:"text",key:"lon",value:117.286419,code:"lon"},
            {id:"_ids3",type:"text",key:"lat",value:31.864436,code:"lat"},
            {id:"_ids4",type:"text",key:"semiMinorAxis",value:2000.0,code:"semiMinorAxis"},
            {id:"_ids5",type:"text",key:"semiMajorAxis",value:2000.0,code:"semiMajorAxis"},
            {id:"_ids6",type:"text",key:"color",value:139,code:"color"}
        ]
        var table = createTable(tableparam);
        $("#content").empty().append(table);
        $("#content select,input").css("width","200px");
    }

    _.select = function(viewer){ //点击查询初始化的数据
       if(tableparam.length == 0)return;
       var selectData = [];
       for(var i in tableparam){
           var val = $('#_ids'+(parseInt(i)+1)).val();
           selectData.push({id:'_ids'+(parseInt(i)+1),code:tableparam[i].key,value:val});
       }
       var initData = {
            viewer:viewer,
            type:selectData[0].value,
            lon:parseFloat(selectData[1].value),
            lat:parseFloat(selectData[2].value),
            semiMinorAxis:parseFloat(selectData[3].value),
            semiMajorAxis:parseFloat(selectData[4].value),
            color:parseFloat(selectData[5].value)
       }
       return initData;

    }
    _.initController = function (){
        var _self = this;
        _self.createtoolbar();
        var subscribeParameter = function(name) {
            Cesium.knockout.getObservable(viewModel, name).subscribe(
                function(newValue) {
                    _self.controller({key:name,value:newValue});
                }
            );
        }
        var viewModel = {
            color : 139,
            size : 2000
        };
        Cesium.knockout.track(viewModel);
        var toolbar = document.getElementById('toolbar');
        Cesium.knockout.applyBindings(viewModel, toolbar);
        subscribeParameter('color');
        subscribeParameter('size');
    }
    //外部控制节点
    _.controller = function (obj){
        if(obj === null && points == 0 && obj === "")return;
        var key = obj.key,value = parseInt(obj.value);
        for(var i in points){
           if("color" == key){
                points[i]._ellipse._color = getColor(value);
           }else{
                points[i]._ellipse.semiMinorAxis = value;
                points[i]._ellipse.semiMajorAxis = value;
           }
        }
    }
   _.createtoolbar = function (){
        var toolbarparam = [
            {type:"range",key:"size",value:2000,min:100,max:10000,step:100}  
        ]
       var table = createToolbar(toolbarparam);
       var toolbar = 
        '<div id="toolbar">'+
        table +
        '<button type="button" class="cesium-button" onclick="Cesiumflicker.toolAddRader();">添加</button>'+
        '<button type="button" class="cesium-button" onclick="Cesiumflicker.remove();">删除</button>'+
        '</div>';
        $("#toolbar").remove();
        $("body").append(toolbar);
        $("#toolbar").css("background","rgba(42, 42, 42, 0.8)").css("padding","4px;").css("border-radius", "4px");
        $("#toolbar input").css("vertical-align","middle").css("padding-top","2px").css("padding-bottom","2px");
    }
    _.toolAddRader = function(){ //工具添加
        var _self = this;
        if(mouseHandlerDraw != null){
            mouseHandlerDraw.destroy();
            mouseHandlerDraw = null;
        }
        mouseHandlerDraw = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
        CesiumTooltip.initTool(viewer);
        mouseHandlerDraw.setInputAction(function (movement) { //鼠标移动 
            var position = movement.endPosition;
            if (position != null) {
                if (points.length == 0) {
                    CesiumTooltip.showAt(position, "点击添加第一个闪烁点");
                } else {
                        if (points.length === 1) {
                            CesiumTooltip.showAt(position, "点击添加第二个闪烁点");
                        } else {
                            CesiumTooltip.showAt(position, "右键结束编辑");
                    }
                }
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    
        mouseHandlerDraw.setInputAction(function (movement) {//鼠标点击
            try {
                var cartesian = viewer.scene.camera.pickEllipsoid(movement.position,ellipsoid);
                if (cartesian) {
                    var cartographic = Cesium.Cartographic.fromCartesian(cartesian); //根据笛卡尔坐标获取到弧度 
                    var lon = Cesium.Math.toDegrees(cartographic.longitude); //根据弧度获取到经度 
                    var lat = Cesium.Math.toDegrees(cartographic.latitude); //根据弧度获取到纬度
                    var point = _self.createPoint(lon,lat);
                    points.push(point);
                } 
            } catch (error) {
                console.log(error);
            }
            
        },Cesium.ScreenSpaceEventType.LEFT_CLICK);
    
        //鼠标右键
        mouseHandlerDraw.setInputAction(function(movement){
            mouseHandlerDraw.destroy();
            mouseHandlerDraw = null;
            CesiumTooltip.setVisible(false);
        },Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    }
    _.remove = function(){
        if(points == 0)return;
        for(var i in points){
            viewer.entities.remove(points[i]);
        }
    }
    return _;
 })();
/****************************************************** Cesiumflicker end    ******************************************************** */