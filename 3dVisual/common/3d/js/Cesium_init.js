/**
 * 封装cesium地图操作
 * 
 * 点击事件
 * 弹出框
 * 加载地图服务
 * 三维模型
 * 基础工具	
 * entity 绘图
 * primitive 绘图
 * github 工具整合
 * @author zhangti
 * @version v1
 */

 /***
  * 动态加载外部资源
  * 立即执行
  */
(function() {
    /**  外部common js文件 */
    window.JQueryminUrl = `../common/3d/js/jquery.min.js`;     //jq插件
    window.AuxiliaryUrl = `../common/3d/js/auxiliary.js`;   //封装辅助工具
    window.YSCUrl = `../common/3d/plugin/ysc/ysc.js`;             //cesium插件 提供一些封装好的接口
    window.NavigationUrl = `../common/3d/js/viewerCesiumNavigationMixin.min.js`;     //导航插件
    window.CesiumEchartsUrl = `../common/3d/js/CesiumEchats.js`;     //图表插件
    window.CesiumModuleUrl = `../common/3d/js/CesiumModule.js`;     //模型插件
    window.CesiumDimensionalUrl = `../common/3d/js/CesiumDimensional.js`;     //三维插件
    window.CesiumCZMLUrl = `../common/3d/js/CesiumCZML.js`;     //轨迹回放插件
    window.CesiumLayesUrl = `../common/3d/js/CesiumLayes.js`;     //图层插件
    window.HeatmapUrl = `../common/3d/js/heatmap.js`;     //模型插件
    window.CesiumToolUrl = `../common/3d/js/CesiumTool.js`;     //地图工具插件
    //标绘插件
    window.Cesiumplot1Url = `../common/3d/plugin/drawForCesium-master/js/DrawWorker/plotUtil.js`;     
    window.Cesiumplot2Url = `../common/3d/plugin/drawForCesium-master/js/DrawWorker/algorithm.js`;     //标绘插件
    window.Cesiumplot3Url = `../common/3d/plugin/drawForCesium-master/js/DrawWorker/DrawWorker.js`;     //标绘插件

    window.MeasureUrl = `../common/3d/js/measure.js`;     //测量插件
    window.GoogleMapUrl = `../common/3d/js/ImageryProviderWebExtendTool.js`;         //google在线底图
    window.VectorTileUrl = `../common/3d/js/CesiumVectorTile.min.js`;    //绘制矢量文件
    window.TileLonlatUrl = `../common/3d/js/TileLonlatsImageryProvider.js`;    //经纬网
    window.BootstarpUrl = `../common/3d/js/bootstrap.min.js`;    //bootstrap
    if (!window.LAZY_CESIUM) {
      document.write(`<scr${'i'}pt type="text/javascript" src="${ window.JQueryminUrl}"></scr${'i'}pt>`);
     // document.write(`<scr${'i'}pt type="text/javascript" src="${ window.BootstarpUrl}"></scr${'i'}pt>`);
      document.write(`<scr${'i'}pt type="text/javascript" src="${ window.AuxiliaryUrl}"></scr${'i'}pt>`);
      document.write(`<scr${'i'}pt type="text/javascript" src="${ window.YSCUrl}"></scr${'i'}pt>`);
      document.write(`<scr${'i'}pt type="text/javascript" src="${ window.CesiumEchartsUrl}"></scr${'i'}pt>`);
      document.write(`<scr${'i'}pt type="text/javascript" src="${ window.CesiumModuleUrl}"></scr${'i'}pt>`);
      document.write(`<scr${'i'}pt type="text/javascript" src="${ window.CesiumDimensionalUrl}"></scr${'i'}pt>`);
      document.write(`<scr${'i'}pt type="text/javascript" src="${ window.CesiumCZMLUrl}"></scr${'i'}pt>`);
      document.write(`<scr${'i'}pt type="text/javascript" src="${ window.CesiumLayesUrl}"></scr${'i'}pt>`);
      document.write(`<scr${'i'}pt type="text/javascript" src="${ window.HeatmapUrl}"></scr${'i'}pt>`);
      document.write(`<scr${'i'}pt type="text/javascript" src="${ window.CesiumToolUrl}"></scr${'i'}pt>`);
      document.write(`<scr${'i'}pt type="text/javascript" src="${ window.Cesiumplot1Url}"></scr${'i'}pt>`);
      document.write(`<scr${'i'}pt type="text/javascript" src="${ window.Cesiumplot2Url}"></scr${'i'}pt>`);
      document.write(`<scr${'i'}pt type="text/javascript" src="${ window.Cesiumplot3Url}"></scr${'i'}pt>`);

      document.write(`<scr${'i'}pt type="text/javascript" src="${ window.NavigationUrl}"></scr${'i'}pt>`);
      document.write(`<scr${'i'}pt type="text/javascript" src="${ window.GoogleMapUrl}"></scr${'i'}pt>`);
      document.write(`<scr${'i'}pt type="text/javascript" src="${ window.VectorTileUrl}"></scr${'i'}pt>`);
      document.write(`<scr${'i'}pt type="text/javascript" src="${ window.TileLonlatUrl}"></scr${'i'}pt>`);
      document.write(`<scr${'i'}pt type="text/javascript" src="${ window.MeasureUrl}"></scr${'i'}pt>`);
    }
})();

var _cesiumtool = null;
_cesiumTool = function(param){
    if(null === param || undefined === param)return;
    var t = this;
    for(var key in param){
        t[key] = param[key];
    }
    this.init();
}
//初始化
_cesiumTool.prototype.init =  function(){
         this.entity(); //entity 
}

//封装entity对象参数
_cesiumTool.prototype.entity =  function(){
    HeightReference = null;
    length = null;
    topRadius = null;
    bottomRadius = null;
    material = null;
    outline = null;
    numberOfVerticalLines = null;
    slices = null;
    outlineColor = null;
}


/**
 * 创建导航插件
 *  调用方法
 *  var _tool = new _cesiumTool({viewer:viewer});
 *  _tool.createNavigation();
 */
_cesiumTool.prototype.createNavigation =  function(){
    var _cesiumTool = this;
    _cesiumTool.viewer.extend(Cesium.viewerCesiumNavigationMixin, {});
}

/***
 * 相机转场
 * 视野
 * 多种效果
 */
_cesiumTool.prototype.setView =  function(param){
    var viewer = this.viewer,lon = param.lon,lat = param.lat,d = param.d;        
    switch(param.handleType){
        case "flyTo":{ 
            viewer.camera.flyTo({
                destination : Cesium.Cartesian3.fromDegrees(lon, lat, d),
                orientation: {
                    heading : Cesium.Math.toRadians(90.0), // east, default value is 0.0 (north) //东西南北朝向
                    pitch : Cesium.Math.toRadians(-90),    // default value (looking down)  //俯视仰视视觉
                    roll : 0.0                             // default value
                },
                duration:3//3秒到达战场
            });   
            break;
        }
        default:{
            viewer.camera.setView({destination: Cesium.Cartesian3.fromDegrees(lon, lat, d)});
        }
    }
    
}


/** 
 * 添加一个点
 * 调用
 * var entity = new _cesiumTool({viewer:this.viewer}).createPoint(position)
*/
_cesiumTool.prototype.createPoint =  function(position){
    var point = viewer.entities.add({
        position: position,
        point: {
            color: Cesium.Color.WHITE,
            pixelSize: 5,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
        }
    });
    return point;
}


/*
弹出属性框
*/ 
var _PopController = (function(){

    function _(){}
    _.init = function(param){
        if(null === param || undefined === param)return;
        var t = this;
        for(var key in param){
            t[key] = param[key];
        }
    }

    _.read = function(){ //后面可以考虑自定义传参数
        var featrue = this.featrue,arr = this.paramArr,lon = this.x,lat=this.y,html = "",thead = "",table = "",rows ="";
             console.log(featrue);
            thead = '<div id="pop" ><table class="table table-bordered"><thead><tr><th>属性</th><th>VALUE</th></tr></thead><tbody>';
            if(featrue != null && featrue != ""){
                for(var i in arr){
                    try {
                        if(!_ary.isArray(arr[i])){
                            rows += '<tr><td>'+arr[i] +':</td><td  ondblclick="_PopController.addInput(this);" name='+arr[i]+'>'+featrue[arr[i]]+'</td></tr>';
                        }else{ //属性内嵌
                            rows += '<tr><td>'+arr[i][1] +':</td><td  ondblclick="_PopController.addInput(this);" name='+arr[i]+'>'+featrue[arr[i][0]][arr[i][1]]+'</td></tr>';
                        }
                    } catch (error) {
                        console.log(error);
                        continue;
                    }  
                }
            }
            table = '<tr><td>lon :</td><td >'+lon+'</td></tr><tr><td>lat :</td><td >'+lat+'</td></tr></tbody></table></div>';
        html = thead + rows + table;

       return html;
    }
    _.show = function(){ //显示
        
        var html = this.read();
        this.destroy();
        $("body").append(html);
        $("#pop").css("background","rgba(42, 42, 42, 0.8)").css("padding","4px;").css("border-radius", "4px").css("width","220px");
        $("#pop").css("position","absolute").css("top","150px").css("right","30px").css("z-index","999");
    }
    _.addInput = function(element){ //绑定双击事件
        var oldhtml = element.innerHTML;
        var newobj = document.createElement('input');
        newobj.type = 'text';
        newobj.style.width = '130px';
        newobj.value = oldhtml;
        newobj.name = $(element).attr("name");
        newobj.onblur = function() {
            element.innerHTML = this.value == oldhtml ? oldhtml : this.value;
            element.setAttribute("ondblclick", "_PopController.addInput(this);");
            if(oldhtml == null && oldhtml == "") return;
            _PopController.change(this.name,this.value);
        }
        element.innerHTML = '';
        element.appendChild(newobj);
        newobj.setSelectionRange(0, oldhtml.length);
        newobj.focus();
        newobj.parentNode.setAttribute("ondblclick", "");
    },
    _.change = function(name,value){ //修改数据
        var featrue = this.featrue;
       if(name.indexOf(",") == -1) {
            featrue[name] = value;
       }else{
         var arr = name.split(","); 
         featrue[arr[0]][arr[1]] = value;
       }
    }
    _.destroy = function(){
        $("#pop").remove();
    }
    return _;
})();

/**
 * entity 添加实体
 * 
 * @type 类型
 * @param entity参数
 * 调用方法
 * var entity = new _cesiumTool({viewer:this.viewer}).createEntity({handleType:"cylinder",p:{length: Math.max.apply(null,height),slices:4}});
 */
_cesiumTool.prototype.createEntity =  function(param){
    try {
     var t = this,viewer = t.viewer,p = param.p,entity = null,_color = p.material,property = new Cesium.SampledPositionProperty();
     if(param === null) return;
     switch(param.handleType){
         case "cylinder":{ 
             var cylinderEntity = viewer.entities.add({
                 name: "cylinder",
                 cylinder: {
                     HeightReference: Cesium.HeightReference.RELATIVE_TO_GROUND, //表示相对于地形的位置。
                     length: p.length == null?600000:p.length,     //长度
                     topRadius:p.topRadius == null?0:p.topRadius,    //顶点半径
                     bottomRadius: p.bottomRadius == null?600000 / 4 :p.bottomRadius,  //底部半径
                     material: _color == null?Cesium.Color.BLUE.withAlpha(0.3):_color.withAlpha(0.3),
                   /*  new Cesium.GridMaterialProperty({
                        color :p.material,
                        cellAlpha : 0.2,
                        lineCount : new Cesium.Cartesian2(8, 8),
                        lineThickness : new Cesium.Cartesian2(2.0, 2.0),
                       
                      }),*/
                     //outline: p.outline == null? !0:p.outline,            //轮廓
                     //numberOfVerticalLines: p.numberOfVerticalLines == null?0:p.numberOfVerticalLines, //垂直线数
                     slices:p.slices == null?128:p.slices,         //周边数
                     //outlineColor: p.outlineColor == null?Cesium.Color.RED.withAlpha(.8):p.outlineColor  //颜色轮廓
                 }
             });
             entity = cylinderEntity;
             break; 
         }
         case "box":{
             var boxEntity = viewer.entities.add({
                 name: 'Blue box',
                 position: Cesium.Cartesian3.fromDegrees(homePOsition[0], homePOsition[1], 0),
                 box: {
                     dimensions: new Cesium.Cartesian3(400000.0, 300000.0, 500000.0),
                     material: Cesium.Color.BLUE
                 }
             });
             entity = boxEntity;
             break; 
         }
         case "circle":{
             var circleEntity = viewer.entities.add({
                 position: Cesium.Cartesian3.fromDegrees(111.0, 40.0, 150000.0),
                 name: 'Green circle at height',
                 ellipse: {
                     semiMinorAxis: 300000.0,
                     semiMajorAxis: 300000.0,
                     height: 200000.0,
                     material: Cesium.Color.GREEN
                 }
             });
             entity = circleEntity;
             break; 
         }
         case "ellipse":{
             var ellipseEntity = viewer.entities.add({
                 position: Cesium.Cartesian3.fromDegrees(103.0, 40.0),
                 name: 'Red ellipse on surface with outline',
                 ellipse: {
                     semiMinorAxis: 250000.0,
                     semiMajorAxis: 400000.0,
                     material: Cesium.Color.RED.withAlpha(0.5),
                     outline: true,
                     outlineColor: Cesium.Color.RED
                 }
             });
             entity = ellipseEntity;
             break; 
         }
         case "corridor":{
             var corridorEntity = viewer.entities.add({
                 name: 'Red corridor on surface with rounded corners and outline',
                 corridor: {
                     positions: Cesium.Cartesian3.fromDegreesArray([
                     100.0, 40.0,
                     105.0, 40.0,
                     105.0, 35.0
                     ]),
                     width: 200000.0,
                     material: Cesium.Color.RED.withAlpha(0.5),
                     outline: true,
                     outlineColor: Cesium.Color.RED
                 }
             });
             entity = corridorEntity;
             break; 
         }
         case "polygon":{
             var polygonEntity = viewer.entities.add({
                 name: 'Red polygon on surface',
                 polygon: {
                     hierarchy: Cesium.Cartesian3.fromDegreesArray([115.0, 37.0,
                     115.0, 32.0,
                     107.0, 33.0,
                     102.0, 31.0,
                     102.0, 35.0]),
                     material: Cesium.Color.RED
                 }
             });
             entity = polygonEntity;
             break; 
         }
         case "polyline":{
             var polylineEntity = viewer.entities.add({
                 name: 'Red line on the surface',
                 polyline: {
                     positions: Cesium.Cartesian3.fromDegreesArray([75, 35,
                     125, 35]),
                     width: 5,
                     material: Cesium.Color.RED
                 }
             });
             entity = polylineEntity;
             break; 
         }
         default :{}   
     }
    } catch (error) {
        console.log("error mannager:" + error)
    }
    
    return entity;
 }

/*
 * 提示框工具
 * entity方式
 * 调用方式
 * CesiumTooltip.initTool(viewer);
 * CesiumTooltip.showAt(position, "双击结束编辑");
 */
var CesiumTooltip = (function () {
    var isInit = false;
    var viewer;
    var labelEntity;

    function _() { };

    _.initTool = function (_viewer) {
        if (isInit) { return; }
        viewer = _viewer;
        labelEntity = viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(0, 0),
            label: {
                text: '提示',
                font: '15px sans-serif',
                pixelOffset: new Cesium.Cartesian2(8, 8),//y大小根据行数和字体大小改变
                horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
                showBackground: true,
                backgroundColor: new Cesium.Color(0.165, 0.165, 0.165, 1.0)
            }
        });
        labelEntity.show = false;
        isInit = true;
    }

    _.setVisible = function (visible) {
        if (!isInit) { return; }
        labelEntity.show = visible ? true : false;
    };

    _.showAt = function (position, message) {
        if (!isInit) { return; }
        if (position && message) {
            labelEntity.show = true;
            var cartesian = viewer.camera.pickEllipsoid(position, viewer.scene.globe.ellipsoid);// 
            if (cartesian) {
                labelEntity.position = cartesian;
                labelEntity.show = true;
                labelEntity.label.text = message;
            } else {
                labelEntity.show = false;
            }
        }
    };

    return _;
})();

/*
 * 提示框工具
 * entity方式
 * 调用方式
 * CesiumToolTipDIV.initTool(viewer);
 * CesiumToolTipDIV.showAt(position, "双击结束编辑");
 */
var CesiumToolTipDIV = (function () {
    var isInit = false;

    function _() { };

    _.initTool = function (frameDiv) {
        if (isInit) { return; }

        var div = document.createElement('DIV');
        div.className = "tooltipdiv right";//

        var arrow = document.createElement('DIV');
        arrow.className = "tooltipdiv-arrow";
        div.appendChild(arrow);

        var title = document.createElement('DIV');
        title.className = "tooltipdiv-inner";
        div.appendChild(title);

        this._div = div;
        this._title = title;

        frameDiv.appendChild(div);

        isInit = true;
    }

    _.setVisible = function (visible) {
        if (!isInit) { return; }
        this._div.style.display = visible ? 'block' : 'none';
    };

    /*
    position屏幕坐标
    显示在屏幕上
    */
    _.showAt = function (position, message) {
        if (!isInit) { return; }
        if (position && message) {
            this.setVisible(true);
            this._title.innerHTML = message;
            this._div.style.left = position.x + 10 + "px";
            this._div.style.top = (position.y - this._div.clientHeight / 2) + "px";
        }
    };

    return _;
})();


/*
 *动态绘制工具
 *包括点线面
 *在绘制结束后，返回结果坐标值
 *
 * 调用绘图工具
 *  DrawDynamicClampGround.startDrawingPolyline(viewer, function (cartesians) {
            //处理结果
            //....
            console.log(cartesians);
        });
 *
 */
var TooltipDiv = (function () {
    var isInit = false;


    function _() { };

    _.initTool = function (frameDiv) {
        if (isInit) { return; }

        var div = document.createElement('DIV');
        div.className = "tooltipdiv right";//

        var arrow = document.createElement('DIV');
        arrow.className = "tooltipdiv-arrow";
        div.appendChild(arrow);

        var title = document.createElement('DIV');
        title.className = "tooltipdiv-inner";
        div.appendChild(title);

        this._div = div;
        this._title = title;

        frameDiv.appendChild(div);

        isInit = true;
    }

    _.setVisible = function (visible) {
        if (!isInit) { return; }
        this._div.style.display = visible ? 'block' : 'none';
    };

    /*
    position屏幕坐标
    显示在屏幕上
    */
    _.showAt = function (position, message) {
        if (!isInit) { return; }
        if (position && message) {
            this.setVisible(true);
            this._title.innerHTML = message;
            this._div.style.left = position.x + 10 + "px";
            this._div.style.top = (position.y - this._div.clientHeight / 2) + "px";
        }
    };

    return _;
})();
var DrawDynamicClampGround = (function () {
    var mouseHandlerDraw;
    function GetNorthCartesain(cartesain0, cartesain1) {
        var cartographic0 = Cesium.Cartographic.fromCartesian(cartesain0);
        var cartographic1 = Cesium.Cartographic.fromCartesian(cartesain1);
        var height = cartographic0.height > cartographic1.height ? cartographic0.height : cartographic1.height;
        var length = Math.sqrt((cartographic0.longitude - cartographic1.longitude) * (cartographic0.longitude - cartographic1.longitude)+
            (cartographic0.latitude - cartographic1.latitude) * (cartographic0.latitude - cartographic1.latitude));
        var cartographicN = new Cesium.Cartographic(cartographic0.longitude, cartographic0.latitude + length, height);
        var cartesainN = Cesium.Cartesian3.fromRadians(cartographicN.longitude, cartographicN.latitude, cartographicN.height);
        return cartesainN;
    }

    function _() { }
    //绘制点
    _.startDrawPoint = function (viewer, callback) {
        var scene = viewer.scene;
        if (mouseHandlerDraw) {
            mouseHandlerDraw.destroy();
            mouseHandlerDraw = null;
        } else {
            mouseHandlerDraw = new Cesium.ScreenSpaceEventHandler(scene.canvas);
        }

        TooltipDiv.initTool(viewer.cesiumWidget.container);

        mouseHandlerDraw.setInputAction(function (movement) {
            if (movement.position != null) {
                var cartesian = viewer.scene.pickPosition(movement.position);
                if (cartesian) {
                    var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
                    if (cartographic) {
                        if (typeof callback == 'function') {
                            callback(cartographic);
                        }

                        if (mouseHandlerDraw) {
                            mouseHandlerDraw.destroy();
                            mouseHandlerDraw = null;
                        }
                        TooltipDiv.setVisible(false);
                    }
                }
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        mouseHandlerDraw.setInputAction(function (movement) {
            var cartesian = viewer.scene.pickPosition(movement.endPosition);
            if (cartesian) {
                TooltipDiv.showAt(movement.endPosition, '点击添加点');
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }
    //绘制线段
    _.startDrawingLine = function (viewer, callback) {
        var scene = viewer.scene;
        if (mouseHandlerDraw) {
            mouseHandlerDraw.destroy();
            mouseHandlerDraw = null;
        } else {
            mouseHandlerDraw = new Cesium.ScreenSpaceEventHandler(scene.canvas);
        }

        TooltipDiv.initTool(viewer.cesiumWidget.container);

        var drawingPolyline = null;
        var positions = [];
        mouseHandlerDraw.setInputAction(function (movement) {
            if (movement.position != null) {
                var cartesian = viewer.scene.pickPosition(movement.position);
                if (cartesian) {
                    if (positions.length == 0) {
                        positions.push(cartesian.clone());
                    } else if (positions.length == 1) {
                        positions.push(cartesian.clone());
                        if (typeof callback == 'function') {
                            callback(positions);
                        }

                        if (mouseHandlerDraw) {
                            mouseHandlerDraw.destroy();
                            mouseHandlerDraw = null;
                        }
                        TooltipDiv.setVisible(false);
                        //移除 
                        if (drawingPolyline != undefined)
                            viewer.entities.remove(drawingPolyline);

                    }
                }
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        mouseHandlerDraw.setInputAction(function (movement) {
            var cartesian = viewer.scene.pickPosition(movement.endPosition);
            if (cartesian) {
                if (positions.length == 0) {
                    TooltipDiv.showAt(movement.endPosition, '点击添加起点');
                } else if (positions.length == 1) {
                    //更新entity
                    var positionArr = [];
                    positionArr.push(positions[0]);
                    positionArr.push(cartesian);
                    if (drawingPolyline != undefined)
                        viewer.entities.remove(drawingPolyline);
                    var lineOpts = {
                        polyline: {
                            positions: positionArr,
                            clampToGround: true,  // 
                            width: 3,
                            material: Cesium.Color.BLUE.withAlpha(0.5),
                        }
                    };
                    drawingPolyline = viewer.entities.add(lineOpts);
                    TooltipDiv.showAt(movement.endPosition, "点击添加终点");
                }
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    };
    //绘制多段线
    _.startDrawingPolyline = function (viewer, callback) {
        var scene = viewer.scene;
        if (mouseHandlerDraw) {
            mouseHandlerDraw.destroy();
            mouseHandlerDraw = null;
        } else {
            mouseHandlerDraw = new Cesium.ScreenSpaceEventHandler(scene.canvas);
        }

        TooltipDiv.initTool(viewer.cesiumWidget.container);

        var drawingPolyline = null;
        var positions = [];
        mouseHandlerDraw.setInputAction(function (movement) {
            if (movement.position != null) {
                var cartesian = viewer.scene.pickPosition(movement.position);
                if (cartesian) {
                    positions.push(cartesian.clone());
                //    var cartographic = Cesium.Cartographic.fromCartesian(cartesian);//当前点
                //    if (cartographic) { 
                //        if (cartesian) {
                //            var isIntersect = false;
                //            if (positions.length >= 3) {
                //                var cartographicArr = [];
                //                for (var i = 0; i < positions.length; i++) {
                //                    cartographicArr.push(Cesium.Cartographic.fromCartesian(positions[i]));
                //                }
                //                var line1 = turf.lineString([[cartographic.longitude, cartographic.latitude], [cartographicArr[cartographicArr.length - 1].longitude, cartographicArr[cartographicArr.length - 1].latitude]]);
                //                for (var i = 2; i < positions.length; i++) {
                //                    var line2 = turf.lineString([
                //                        [cartographicArr[i - 2].longitude, cartographicArr[i - 2].latitude],
                //                        [cartographicArr[i - 1].longitude, cartographicArr[i - 1].latitude]]);
                //                    var intersects = turf.lineIntersect(line1, line2);
                //                    if (intersects && intersects.features && intersects.features.length > 0) {
                //                        isIntersect = true;
                                        
                //                        alert('图形自相交！');
                //                        break;
                //                    }
                //                }
                //            }
                //            if (isIntersect) { } else {
                //                positions.push(cartesian.clone());
                //            }
                //        }
                //    }
                }
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        mouseHandlerDraw.setInputAction(function (movement) {
            var cartesian = viewer.scene.pickPosition(movement.endPosition);
            if (cartesian) {
                if (positions.length == 0) {
                    TooltipDiv.showAt(movement.endPosition, '点击添加起点');
                } else {
                    var positionArr = [];
                    for (var i = 0; i < positions.length; i++) {
                        positionArr.push(positions[i]);
                    }
                    positionArr.push(cartesian);

                    if (drawingPolyline != undefined)
                        viewer.entities.remove(drawingPolyline);
                    var lineOpts = {
                        polyline: {
                            positions: positionArr,
                            clampToGround: true,  // 
                            width: 3,
                            material: Cesium.Color.BLUE.withAlpha(0.5),
                        }
                    };
                    drawingPolyline = viewer.entities.add(lineOpts);
                    TooltipDiv.showAt(movement.endPosition, "双击结束");
                }
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        mouseHandlerDraw.setInputAction(function (movement) {
            if (movement.position != null) {
                var cartesian = viewer.scene.pickPosition(movement.position);
                if (cartesian) {
                    if (positions.length < 2) {
                        return;
                    } else {

                        if (typeof callback == 'function') {
                            callback(positions);
                        }

                        if (mouseHandlerDraw) {
                            mouseHandlerDraw.destroy();
                            mouseHandlerDraw = null;
                        }
                        TooltipDiv.setVisible(false);
                        //移除entity
                        if (drawingPolyline != undefined)
                            viewer.entities.remove(drawingPolyline);
                    }
                }
            }
        }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    };
    //绘制方位线
    _.startDrawingVLine = function (viewer, callback) {
        var scene = viewer.scene;
        if (mouseHandlerDraw) {
            mouseHandlerDraw.destroy();
            mouseHandlerDraw = null;
        } else {
            mouseHandlerDraw = new Cesium.ScreenSpaceEventHandler(scene.canvas);
        }

        TooltipDiv.initTool(viewer.cesiumWidget.container);

        var drawingPolylineN = null;
        var drawingPolylineT = null;
        var positions = [];
        mouseHandlerDraw.setInputAction(function (movement) {
            if (movement.position != null) {
                var cartesian = viewer.scene.pickPosition(movement.position);
                if (cartesian) {
                    if (positions.length == 0) {
                        positions.push(cartesian.clone());
                    } else if (positions.length == 1) {
                        positions.push(cartesian.clone());
                        if (typeof callback == 'function') {
                            callback(positions);
                        }

                        if (mouseHandlerDraw) {
                            mouseHandlerDraw.destroy();
                            mouseHandlerDraw = null;
                        }
                        TooltipDiv.setVisible(false);
                        //移除 
                        if (drawingPolylineN != undefined)
                            viewer.entities.remove(drawingPolylineN);
                        if (drawingPolylineT != undefined)
                            viewer.entities.remove(drawingPolylineT);
                    }
                }
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        mouseHandlerDraw.setInputAction(function (movement) {
            var cartesian = viewer.scene.pickPosition(movement.endPosition);
            if (cartesian) {
                if (positions.length == 0) {
                    TooltipDiv.showAt(movement.endPosition, '点击添加起点');
                } else if (positions.length == 1) {
                    //更新entity
                    var positionArr = [];
                    positionArr.push(positions[0]);
                    positionArr.push(cartesian);
                    //实时 
                    if (drawingPolylineT != undefined)
                        viewer.entities.remove(drawingPolylineT);
                    var lineOptsT = {
                        polyline: {
                            positions: positionArr,
                            clampToGround: true,  // 
                            width: 3,
                            material: Cesium.Color.BLUE.withAlpha(0.5),
                        }
                    };
                    drawingPolylineT = viewer.entities.add(lineOptsT);
                    //正北
                    var positionN = [];
                    positionN.push(positions[0]);
                    positionN.push(GetNorthCartesain(positions[0], cartesian));
                    if (drawingPolylineN != undefined)
                        viewer.entities.remove(drawingPolylineN);
                    var lineOptsN = {
                        polyline: {
                            positions: positionN,
                            clampToGround: true,  // 
                            width: 3,
                            material: Cesium.Color.RED.withAlpha(0.5),
                        }
                    };
                    drawingPolylineN = viewer.entities.add(lineOptsN);
                    TooltipDiv.showAt(movement.endPosition, "点击结束");
                }
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    }
    return _;
})();

let rectangleColltroller = {
    handler : null,
    create : function(viewer){
         drawRectangle(viewer);
    },

    remove : function(){
        if(rectangleColltroller.handler != null){
            rectangleColltroller.handler.destroy();
            rectangleColltroller.handler = null;
        }
    }
}
function drawRectangle(viewer){
    let activeShapePoints = [];
    let activeShape;
    let floatingPoint;
    let createPoint = function(worldPosition) { //绘制点
        var point = viewer.entities.add({
            position: worldPosition,
            point: {
                color: Cesium.Color.WHITE,
                pixelSize: 5,
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
            }
        });
        return point;
    }
    let drawShape = function(positionData){
        var arr = typeof positionData.getValue === 'function' ? positionData.getValue(0) : positionData;
        shape = viewer.entities.add({
            name: 'e',
            rectangle: {
                coordinates: new Cesium.CallbackProperty(function () {
                    var obj = Cesium.Rectangle.fromCartesianArray(arr);
                    //if(obj.west==obj.east){ obj.east+=0.000001};
                    //if(obj.south==obj.north){obj.north+=0.000001};
                    return obj;
                }, false),
                fill : false,
                outline : true,
                outlineColor : Cesium.Color.RED,
                outerWidth:10
            },
        
        });
    }
    let terminateShape = function() {
        activeShapePoints.pop(); //去除最后一个动态点
        if (activeShapePoints.length) {
            drawShape(activeShapePoints); //绘制最终图
        }
        viewer.entities.remove(floatingPoint); //去除动态点图形（当前鼠标点）
        viewer.entities.remove(activeShape); //去除动态图形
        floatingPoint = undefined;
        activeShape = undefined;
        activeShapePoints = [];
    }
    rectangleColltroller.handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    //鼠标左键
    rectangleColltroller.handler.setInputAction(function (event) {
        // We use `viewer.scene.pickPosition` here instead of `viewer.camera.pickEllipsoid` so that
        // we get the correct point when mousing over terrain.
        var earthPosition = viewer.scene.pickPosition(event.position);
        // `earthPosition` will be undefined if our mouse is not over the globe.
        if (Cesium.defined(earthPosition)) {
            if (activeShapePoints.length === 0) {
                floatingPoint = createPoint(earthPosition);
                activeShapePoints.push(earthPosition);
                var dynamicPositions = new Cesium.CallbackProperty(function () {
                    return activeShapePoints;
                }, false);
                activeShape = drawShape(dynamicPositions); //绘制动态图
            }
            activeShapePoints.push(earthPosition);
            createPoint(earthPosition);
        }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    //鼠标移动
    rectangleColltroller.handler.setInputAction(function (event) {
        if (Cesium.defined(floatingPoint)) {
            //var newPosition = viewer.camera.pickPosition(event.endPosition);
            let ray = viewer.camera.getPickRay(event.endPosition);
            newPosition = viewer.scene.globe.pick(ray, viewer.scene);
            if (Cesium.defined(newPosition)) {
                floatingPoint.position.setValue(newPosition);
                activeShapePoints.pop();
                activeShapePoints.push(newPosition);
            }
        }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    //鼠标右键
    rectangleColltroller.handler.setInputAction(function (event) {
        terminateShape();
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);     
}

/**
 * 卫星通信
 * viewer
 * url:"../common/data/czml/test.czml"
 * code:{}
 */
var WXTX = (function(){
    //全局的属性
    let viewer,radar,satelliteAll = []
    ,transit = [],selectedEntity
    ,handle = null,renderTime,passTime = []
    ,pass_old = [],iden = true
    ,pickedFeature = null,num_pass = 0
    ,radarEntity = [],_entity = []
    ,data = null,t = null;

    function _(){}
    _.prototype.init = function(v,u){
        this.url = u;
        viewer = v;
        handle = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
        selectedEntity = new Cesium.Entity();
        $('div.cesium-infoBox').removeClass('cesium-infoBox-bodyless');
        $('div.cesium-infoBox').addClass('cesium-infoBox-visible');
        this.load(this.url);
        this.handle();
        t = this;
    }
    _.prototype.destroy = function(){
        if(viewer == undefined && viewer == null){
             console.log("没有获取到视图");
             return false;
        }
        for(let i in _entity)viewer.entities.remove(_entity[i]);
        viewer.dataSources.remove(data);
        viewer.clock.shouldAnimate = false;
        handle.destroy();
        handle = null;
        $('div.cesium-infoBox').removeClass('cesium-infoBox-visible');
        $('div.cesium-infoBox').addClass('cesium-infoBox-bodyless');
    }
    _.prototype.load = function(url){
		//load数据
		viewer.dataSources.add(Cesium.CzmlDataSource.load(url)).then(function(dataSource) {
            data = dataSource;
			radar = dataSource.entities.getById("Facility/AGI");
			var satellite1 = dataSource.entities.getById("Satellite/ISS");
			var satellite2 = dataSource.entities.getById("Satellite/Geoeye1");
			var transit1 = dataSource.entities.getById("Facility/AGI-to-Satellite/ISS");
			var transit2 = dataSource.entities.getById("Facility/AGI-to-Satellite/Geoeye1");
			satelliteAll = [satellite1,satellite2]
            transit = [transit1,transit2]
           try{
                t.scan2();
                t.getSatelliteInfo()
                t.createEntity([radar]);
           }catch(e){
             console.log(e.message);
           }
          
		})
    }
    _.prototype.scan2 = function(){
        if(satelliteAll.length == 0 && satelliteAll == undefined)return;
        for(var i in satelliteAll){
            var positions = satelliteAll[i].position.getValue(viewer.clock.currentTime);
            scan_p = t.getPoint(positions);
            new createPoint(scan_p,satelliteAll[i]);
        }
    }
    _.prototype.getPoint = function(positions){
            var cartographic = viewer.scene.globe.ellipsoid.cartesianToCartographic(positions);
			var lat = Cesium.Math.toDegrees(cartographic.latitude),
						lng = Cesium.Math.toDegrees(cartographic.longitude),
						hei = parseFloat(cartographic.height/4);
			return Cesium.Cartesian3.fromDegrees(lng, lat,0);
    }
    _.prototype.createEntity = function(radar){
        if(radar.length == 0 && radar == undefined)return;
        for(var n in radar){//radar
            var l,r;
            var positions = radar[n].position.getValue();
            if(positions.length == 0) return;
            var cartographic = viewer.scene.globe.ellipsoid.cartesianToCartographic(positions);
            var lat = Cesium.Math.toDegrees(cartographic.latitude),lon = Cesium.Math.toDegrees(cartographic.longitude), height = cartographic.height;
            //radarscan
            r = new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(90),
            Cesium.Math.toRadians(0),Cesium.Math.toRadians(0));
            l = Cesium.Cartesian3.fromDegrees(lon, lat, height);
            var e = viewer.entities.add({
                position: l,
                orientation: Cesium.Transforms.headingPitchRollQuaternion(l,r),
                rectangularSensor: new Cesium.RectangularSensorGraphics({
                        radius: 380000,
                        xHalfAngle: Cesium.Math.toRadians(50),
                        yHalfAngle: Cesium.Math.toRadians(50),
                        material: new Cesium.Color(0, 1, 1, .4),
                        lineColor: new Cesium.Color(0, 1, 1, 1),
                        showScanPlane: true,
                        scanPlaneColor: new Cesium.Color(0, 1, 1, 1),
                        scanPlaneMode: "vertical",
                        scanPlaneRate: 3,
                        showThroughEllipsoid: !1
                    })
                });
                radarEntity.push(e);
                _entity.push(e);
        }
    }
    _.prototype.getSatelliteInfo = function(){
        if(transit.length == 0)return;
        t.getSatelliteTime(transit);//格式化通信数据
        selectedEntity.name = "PASS";
        selectedEntity.description = t.infoTable_1(dayjs(Cesium.JulianDate.addHours(viewer.clock.currentTime,-8,new Cesium.JulianDate())).format("YYYY-MM-DD HH:mm:ss"));
        viewer.selectedEntity = selectedEntity;
        viewer.clock.onTick.addEventListener(function(clock) {
                if(!clock.shouldAnimate)return;
                if(iden)selectedEntity.description = t.infoTable_1(t.pass(clock));//标识符  进来展示所有卫星信息
                if(!iden){
                    if(pickedFeature == null)return;
                    if("radar" == pickedFeature.type){
                        pickedFeature.id.description = pickedFeature.temp + t.infoTable_1(t.pass(clock));
                    }else{
                        var position = pickedFeature.id.position.getValue(clock.currentTime);
                        var f_position = viewer.scene.globe.ellipsoid.cartesianToCartographic(position);
                        pickedFeature.id.description = t.infoTable_2( pickedFeature.id.name,f_position) + ' <h2> Passes </h2>' + t.infoTable_3(t.pass(clock),pickedFeature.id.name);
                    }
                }
        });	
        viewer.clock.onStop.addEventListener(function(clock){
            //格式化卫星数据
           if(transit.length == 0)return;
           t.getSatelliteTime(transit);
        });
    }
    _.prototype.pass = function(clock){
        //当前时间
        var currentTime = dayjs(Cesium.JulianDate.addHours(clock.currentTime,-8,new Cesium.JulianDate())).format("YYYY-MM-DD HH:mm:ss");
        return currentTime;
    }
    _.prototype.index_rm = function(n){
        if(pass_old.length == 0)return;
        pass_old[n].splice(0,1); //删除第一个
    }
    _.prototype.getSatelliteTime = function(transit){
        if(transit.length != 0 || transit != undefined){
            passTime = [],pass_old = []; //查看方式区分开 以免冲突
            for(var n in transit){
                var interval = [],interval_old = [];
                var n_interval = transit[n].availability._intervals;
                for(var i in n_interval){
                    var start = dayjs(Cesium.JulianDate.addHours(n_interval[i].start,-8,new Cesium.JulianDate())).format("YYYY-MM-DD HH:mm:ss");
                    var stop = dayjs(Cesium.JulianDate.addHours(n_interval[i].stop,-8,new Cesium.JulianDate())).format("YYYY-MM-DD HH:mm:ss");
                    interval.push({name:transit[n].name,"startTime":start,"stopTime":stop,"interval":dayjs(stop).diff(dayjs(start), 'millisecond')});
                    interval_old.push({name:transit[n].name,"startTime":start,"stopTime":stop,"interval":dayjs(stop).diff(dayjs(start), 'millisecond')});
                }
                passTime.push(interval);
                pass_old.push(interval_old);
            }
        }
    }
    _.prototype.infoTable_1 = function(currentTime){
        if(pass_old.length == 0)return;
			var tr = "",table = `<table class="cesium-infoBox-defaultTable"><thead><tr><th>卫星</th><th>倒计时(ms)</th><th>通信开始(date)</th><th>通信结束(date)</th><th>通信时长(ms)</th></tr></thead><tbody>`;
			for(var n in pass_old){
				if(pass_old[n].length == 0)continue;
				var interval_pass = pass_old[n][0]; //始终取第一个 
				renderTime =  dayjs(interval_pass.startTime).diff(dayjs(currentTime));
				if(renderTime <= 0){
					if(renderTime <= -(interval_pass.interval)){
						t.index_rm(n);
					}else{
						renderTime = "PASS";
					}
				}
				tr += `<tr><td>${interval_pass.name}</td><td>${renderTime}</td><td>${interval_pass.startTime}</td><td> ${interval_pass.stopTime}</td><td> ${interval_pass.interval}</td></tr>`;
			}
			return table + tr + `</tbody></table>`;
    }
    _.prototype.infoTable_2 = function(f_name,cartesian){
        if(f_name == undefined && cartesian == undefined)return;
        var tr = "",table = `<h2> Position </h2><table class="cesium-infoBox-defaultTable"><thead><tr><th>Name</th><th>Latitude</th><th>Longitude</th><th>Elevation</th></tr></thead><tbody>`;
        var f_point = [ parseInt(cartesian.longitude / Math.PI * 180), parseInt(cartesian.latitude / Math.PI * 180)];
        tr = `<tr><td>${f_name}</td><td>${f_point[0]}°</td><td>${f_point[1]}°</td><td> ${parseInt(cartesian.height)}</td></tr>`;
        return table + tr + `</tbody></table>`;
    }
    _.prototype.infoTable_3 = function(currentTime,featureName){
        if(passTime.length == 0 && featureName == undefined)return;
			var t_interval = function(){
				for(var i in passTime){if(passTime[i][0].name.indexOf(featureName)!=-1)return passTime[i];}
			}
			var interval = t_interval();
			var tr = "",table = `<table class="cesium-infoBox-defaultTable"><thead><tr><th>卫星</th><th>倒计时(ms)</th><th>通信开始(date)</th><th>通信结束(date)</th><th>通信时长(ms)</th></tr></thead><tbody>`;
			for(var i in interval){
				renderTime =  dayjs(interval[i].startTime).diff(dayjs(currentTime));
				if(renderTime <= 0)renderTime = 0;
				tr += `<tr><td>${interval[i].name}</td><td>${renderTime}</td><td>${interval[i].startTime}</td><td> ${interval[i].stopTime}</td><td> ${interval[i].interval}</td></tr>`;
			}
			return table + tr + `</tbody></table>`;
    }
    _.prototype.handle = function(){
        //点击追踪
	   handle.setInputAction(function(click){
			if(viewer.scene.pick(click.position) == undefined)return;
			pickedFeature = viewer.scene.pick(click.position);
			if (!Cesium.defined(pickedFeature) && pickedFeature == undefined)return;
			if(pickedFeature.id.description == undefined)return; //自己创建的
			var f_name = pickedFeature.id.name,f_position,table;
			try{
				var position = pickedFeature.id.position.getValue();
				pickedFeature.type = "radar";
			}catch(e){
				var position = pickedFeature.id.position.getValue(viewer.clock.currentTime);
				pickedFeature.type = "satellite";
			}
			f_position = viewer.scene.globe.ellipsoid.cartesianToCartographic(position);
			pickedFeature.id.description  = t.infoTable_2(f_name,f_position);
			//viewer.selectedEntity = selectedEntity;
			pickedFeature.id.name  = f_name;
			pickedFeature.temp = pickedFeature.id.description + "<h2> Passes <h2>";
			iden = false; //点击事件改变标识符

		},Cesium.ScreenSpaceEventType.LEFT_DOWN);
    }

    var createPoint = (function(){
        function _(positions,satellite){
            this.options = {
                 cylinder: {
                    HeightReference: Cesium.HeightReference.RELATIVE_TO_GROUND, //表示相对于地形的位置。
                    length:600000,     //长度
                    topRadius:0,    //顶点半径
                    bottomRadius:600000 / 2,  //底部半径
                    material:new Cesium.Color(0, 1, 1, .4),
                    slices:4
                }
            }
            this.positions = positions;
            this.satellite = satellite;
            this._init();
        }
        _.prototype._init = function(){
            var _self = this;
            var _update = function(){
                var positions = _self.satellite.position.getValue(viewer.clock.currentTime);
                return scan_p = t.getPoint(positions);
            };
            var _length = function(){
                var positions = _self.satellite.position.getValue(viewer.clock.currentTime);
                var cartographic = viewer.scene.globe.ellipsoid.cartesianToCartographic(positions);
                return cartographic.height * 2;
            }
            this.options.position = new Cesium.CallbackProperty(_update,false);
            this.options.cylinder.length = new Cesium.CallbackProperty(_length,false);
            _entity.push(viewer.entities.add(this.options));
        };
        return _;
    })();

    return _;

})();

 /**************************************************************  cesiumInit tool  **************************************************************** */
/***
 * 创建参数选择框
 * param = [
 * {id:"_ids1",type:"select",key:"ids",value:["Satellite/ISS","Satellite/Geoeye1"],code:["Satellite/ISS","Satellite/Geoeye1"]},
    {id:"_ids2",type:"select",key:"type",value:["czml"],code:["czml"]},
    {id:"_ids3",type:"select",key:"sources",value:["../../Apps/SampleData/simple.czml"],code:["../../Apps/SampleData/simple.czml"]},
    {id:"_ids4",type:"text",key:"timeNum",value:288,code:"timeNum"},
    {id:"_ids5",type:"text",key:"entity",value:"圆锥",code:"entity"}
 * ]
 */
var createToolbar = function(obj){
    if(obj == null && obj == "") return;
    var trs = "",table = "",thead = "";
    thead = '<table><tbody>';
    for(var i in obj){
        var id =  obj[i].id,type = obj[i].type,key = obj[i].key,value = obj[i].value,min = obj[i].min,max = obj[i].max,step = obj[i].step;
        trs += '<tr><td>'+key+'</td>';
        if("range" == type){
            trs += '<td>'+ '<input type="range" min="'+min+'" max="'+max+'" step="'+step+'" data-bind="value: '+key+', valueUpdate: "input" ">'+
            '<input type="text" size="2" data-bind="value: '+key+'"></td></tr>';
        }
    }
    table = thead + trs + '</tbody></table>';
    return table;

}


/***
 * 创建参数选择框
 * param = [
 * {type:text,key:实体颜色,value:2,code:color},
 * {type:text,key:实体大小,value:10,code:size},
 * {type:select,key:数据源,value:["Satellite/ISS","Satellite/Geoeye1"],code:["Satellite/ISS","Satellite/Geoeye1"]}
 * ]
 */
var createTable = function(obj){

    if(obj == null && obj == "") return;
    try {
        var trs = "",table = "",thead = "";
        thead = "<table class='table table-striped' CELLPADDING=10 CELLSPACING=10><thead><tr><th>序号</th><th>特征</th><th>特征值</th><th>状态</th></tr></thead><tbody>";
        for(var i in obj){
            var id =  obj[i].id,tpye = obj[i].type,key = obj[i].key,value = obj[i].value,code = obj[i].code;
            if("text" == tpye){
                trs += '<tr><td>'+ i +'</td><td>'+ key +'</td><td><input type="text" id="'+id+'" value="'+value+'"></td><td>有效</td></tr>';
            }
            if("select" == tpye){
                trs += '<tr><td>'+ i +'</td><td>'+ key +'</td><td><select id="'+id+'">';
                if(value.length != 0){
                    for(var v in value){
                        trs += '<option value="'+code[v]+'">'+value[v]+'</option>';
                    }
                }else{
                    trs += '<option value="'+code+'">'+value+'</option>';
                }
                trs += '</select></td><td>有效</td></tr>';
            }
        }
        table = thead + trs + '</tbody></table>';
    } catch (error) {
        console.log(error);
    }
  
    return table;
}

  
window.onload =  function onClickTool (){
    var removeTool = function(){
        $("#measure").remove(),$("#pop").remove();
        CesiumMeasure.remove();
        Cesiumbrush.remove();
        CesiumPlot.remove();
        CesiumTriangle.remove();
        Cesiumflicker.remove();
        CesiumRadarScan.remove();
    }
    $("#right-nav-list1 li").on("click",function(){

            var type = $(this).text();
            if(type == "" || type == undefined)return;
           
            switch(type){
                case "测距离":{CesiumMeasure.init({viewer:viewer,type:"lineSpace"},false);break;}
                case "测面积":{CesiumMeasure.init({viewer:viewer,type:"areaSpace"},false);break;}
                case "三角测量":{CesiumTriangle.init({viewer:viewer});break;}
                case "画笔":{Cesiumbrush.init({viewer:viewer});break;}
                case "闪烁点":{Cesiumflicker.init({viewer:viewer,type:"",lon:"",lat:"",semiMinorAxis:2000.0,semiMajorAxis:2000.0,color:139},true);break;}
                case "标绘":{CesiumPlot.init({viewer:viewer});break;}
                case "查询":{ttt.showSelectDiv();break};
                case "雷达":{CesiumRadarScan.radarTool(viewer);break;}
                case "删除":{removeTool();break;};
            }

            
    });

    $("#measure").css("position","absolute").css("top","10px").css("right","30px").css("z-index","999")
    $("#plot").css("position","absolute").css("top","20px").css("left","10px").css("display","inline").css("margin","10px").css("padding","0px");
};