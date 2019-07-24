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
    window.JQueryminUrl = `../js/tool/jquery.min.js`;     //jq插件
    window.AuxiliaryUrl = `../js/tool/auxiliary.js`;   //封装辅助工具
    window.YSCUrl = `../plugin/ysc/ysc.js`;             //cesium插件 提供一些封装好的接口
    //window.NavigationUrl = `../js/tool/viewerCesiumNavigationMixin.min.js`;     //导航插件
    window.CesiumEchartsUrl = `../js/CesiumEchats.js`;     //图表插件
    window.CesiumModuleUrl = `../js/CesiumModule.js`;     //模型插件
    window.CesiumDimensionalUrl = `../js/CesiumDimensional.js`;     //三维插件
    window.CesiumCZMLUrl = `../js/CesiumCZML.js`;     //轨迹回放插件
    window.CesiumLayesUrl = `../js/CesiumLayes.js`;     //图层插件
    window.HeatmapUrl = `../js/heatmap/heatmap.js`;     //模型插件


    window.MeasureUrl = `../js/tool/measure.js`;     //测量插件
    window.GoogleMapUrl = `../js/tool/ImageryProviderWebExtendTool.js`;         //google在线底图
    window.VectorTileUrl = `../js/CesiumVectorTile/CesiumVectorTile.min.js`;    //绘制矢量文件
    window.TileLonlatUrl = `../js/tool/TileLonlatsImageryProvider.js`;    //经纬网
    window.BootstarpUrl = `../js/tool/bootstrap.min.js`;    //bootstrap
    if (!window.LAZY_CESIUM) {
      document.write(`<scr${'i'}pt type="text/javascript" src="${ window.JQueryminUrl}"></scr${'i'}pt>`);
      document.write(`<scr${'i'}pt type="text/javascript" src="${ window.BootstarpUrl}"></scr${'i'}pt>`);
      document.write(`<scr${'i'}pt type="text/javascript" src="${ window.AuxiliaryUrl}"></scr${'i'}pt>`);
      document.write(`<scr${'i'}pt type="text/javascript" src="${ window.YSCUrl}"></scr${'i'}pt>`);
      document.write(`<scr${'i'}pt type="text/javascript" src="${ window.CesiumEchartsUrl}"></scr${'i'}pt>`);
      document.write(`<scr${'i'}pt type="text/javascript" src="${ window.CesiumModuleUrl}"></scr${'i'}pt>`);
      document.write(`<scr${'i'}pt type="text/javascript" src="${ window.CesiumDimensionalUrl}"></scr${'i'}pt>`);
      document.write(`<scr${'i'}pt type="text/javascript" src="${ window.CesiumCZMLUrl}"></scr${'i'}pt>`);
      document.write(`<scr${'i'}pt type="text/javascript" src="${ window.CesiumLayesUrl}"></scr${'i'}pt>`);
      document.write(`<scr${'i'}pt type="text/javascript" src="${ window.HeatmapUrl}"></scr${'i'}pt>`);

      //document.write(`<scr${'i'}pt type="text/javascript" src="${ window.NavigationUrl}"></scr${'i'}pt>`);
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
                        continue;
                        console.log(error);
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
     var t = this,viewer = t.viewer,p = param.p,entity = null;
     if(param === null) return;
     
     switch(param.handleType){
         case "cylinder":{ 
             var cylinderEntity = viewer.entities.add({
                 name: "cylinder",
                 cylinder: {
                     HeightReference: Cesium.HeightReference.CLAMP_TO_GROUND, //表示相对于地形的位置。
                     length: p.length == null?600000:p.length,     //长度
                     topRadius: p.topRadius == null?0:p.topRadius,    //顶点半径
                     bottomRadius: p.bottomRadius == null?600000 / 4 :p.bottomRadius,  //底部半径
                     material: p.material == null?Cesium.Color.RED.withAlpha(.4) :p.material,  //填充材料
                     outline: p.outline == null? !0:p.outline,            //轮廓
                     numberOfVerticalLines: p.numberOfVerticalLines == null?0:p.numberOfVerticalLines, //垂直线数
                     slices:p.slices == null?128:p.slices,         //周边数
                     outlineColor: p.outlineColor == null?Cesium.Color.RED.withAlpha(.8):p.outlineColor  //颜色轮廓
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

/** 
 cesium画笔
 */
var Cesiumbrush = (function(){
    
    function _(){
        var color;
        var camera = viewer.camera;
        var polyline;
        var drawing = false;
        var positions = [];
        var handler = null;

        this.show();
    };
    _.cilck = function(){
        if(handler != null){
            handler.destroy();
            handler=null;
        }
        handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
        handler.setInputAction(function (click) {
            if (drawing) {
                color.alpha = 0.6;
                viewer.entities.add({
                    polygon: {
                        hierarchy : {
                            positions : positions
                        },
                        material : color,
                        outline : true
                    }
                });
                viewer.entities.remove(polyline);
                positions = [];
            } else {
                color = Cesium.Color.fromRandom({alpha : 1.0});
                polyline = viewer.entities.add({
                    polyline : {
                        positions : new Cesium.CallbackProperty(function(){
                            return positions;
                        }, false),
                        material : color
                    }
                });
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
    _.show = function(){ 
        camera.flyTo({destination: Cesium.Cartesian3.fromDegrees(-100, 40, 10000)});

        this.click();
    }

    return _;
})();

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
        if(flag)this.build(param);
    }
    _.build = function(param){
        if(null === param || undefined === param)return;
        viewer = param.viewer;
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
    _.switch = function(node){
        drawType = node;

    }
    _.remove = function (){
        if(viewer != null)viewer.entities.removeAll();
    }
    _.add = function(){
        if(drawType == "")return;
        if("areaSpace" == drawType){
            measureAreaSpace(viewer);
        }else{
            measureLineSpace(viewer);
        }
    }
    _.createToolbar = function(){
        var measure = 
        '<div id="toolbar">'+
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
 * function drawPoint() {
        DynamicDrawTool.startDrawingMarker(viewer, "点击添加项目中心点", function (cartesian) {
            //下面对处理代码
            //....
            var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
            var lonlat = [Cesium.Math.toDegrees(cartographic.longitude), Cesium.Math.toDegrees(cartographic.latitude)];
            alert(lonlat);
        });
    }
 *
 */
var DynamicDrawTool = (function () {
    var mouseHandlerDraw;
    var ellipsoid = Cesium.Ellipsoid.WGS84;

    function _() { }

    ChangeablePrimitive = (function () {
        function _() {
        }

        _.prototype.initialiseOptions = function (options) {
            fillOptionsDraw(this, options);

            this._ellipsoid = undefined;
            this._granularity = undefined;
            this._height = undefined;
            this._textureRotationAngle = undefined;
            this._id = undefined;

            // set the flags to initiate a first drawing
            this._createPrimitive = true;
            this._primitive = undefined;
            this._outlinePolygon = undefined;

        };

        _.prototype.setAttribute = function (name, value) {
            this[name] = value;
            this._createPrimitive = true;
        };

        _.prototype.getAttribute = function (name) {
            return this[name];
        };

        /**
         * @private
         */
        _.prototype.update = function (context, frameState, commandList) {

            if (!Cesium.defined(this.ellipsoid)) {
                throw new Cesium.DeveloperError('this.ellipsoid must be defined.');
            }

            if (!Cesium.defined(this.appearance)) {
                throw new Cesium.DeveloperError('this.material must be defined.');
            }

            if (this.granularity < 0.0) {
                throw new Cesium.DeveloperError('this.granularity and scene2D/scene3D overrides must be greater than zero.');
            }

            if (!this.show) {
                return;
            }

            if (!this._createPrimitive && (!Cesium.defined(this._primitive))) {
                // No positions/hierarchy to draw
                return;
            }

            if (this._createPrimitive ||
                (this._ellipsoid !== this.ellipsoid) ||
                (this._granularity !== this.granularity) ||
                (this._height !== this.height) ||
                (this._textureRotationAngle !== this.textureRotationAngle) ||
                (this._id !== this.id)) {

                var geometry = this.getGeometry();
                if (!geometry) {
                    return;
                }
                this._createPrimitive = false;
                this._ellipsoid = this.ellipsoid;
                this._granularity = this.granularity;
                this._height = this.height;
                this._textureRotationAngle = this.textureRotationAngle;
                this._id = this.id;

                this._primitive = this._primitive && this._primitive.destroy();

                this._primitive = new Cesium.Primitive({
                    geometryInstances: new Cesium.GeometryInstance({
                        geometry: geometry,
                        id: this.id,
                        pickPrimitive: this
                    }),
                    appearance: this.appearance,
                    asynchronous: this.asynchronous
                });

                this._outlinePolygon = this._outlinePolygon && this._outlinePolygon.destroy();
                if (this.strokeColor && this.getOutlineGeometry) {
                    // create the highlighting frame
                    this._outlinePolygon = new Cesium.Primitive({
                        geometryInstances: new Cesium.GeometryInstance({
                            geometry: this.getOutlineGeometry(),
                            attributes: {
                                color: Cesium.ColorGeometryInstanceAttribute.fromColor(this.strokeColor)
                            }
                        }),
                        appearance: new Cesium.PerInstanceColorAppearance({
                            flat: true,
                            renderState: {
                                depthTest: {
                                    enabled: true
                                },

                                lineWidth: Math.min(this.strokeWidth, 4.0)// Math.min(this.strokeWidth || 4.0, context._aliasedLineWidthRange[1])
                            }
                        })
                    });
                }
            }

            var primitive = this._primitive;
            primitive.appearance.material = this.material;
            primitive.debugShowBoundingVolume = this.debugShowBoundingVolume;
            primitive.update(context, frameState, commandList);
            this._outlinePolygon && this._outlinePolygon.update(context, frameState, commandList);

        };

        _.prototype.isDestroyed = function () {
            return false;
        };

        _.prototype.destroy = function () {
            this._primitive = this._primitive && this._primitive.destroy();
            return Cesium.destroyObject(this);
        };

        _.prototype.setStrokeStyle = function (strokeColor, strokeWidth) {
            if (!this.strokeColor || !this.strokeColor.equals(strokeColor) || this.strokeWidth != strokeWidth) {
                this._createPrimitive = true;
                this.strokeColor = strokeColor;
                this.strokeWidth = strokeWidth;
            }
        };
        return _;
    })();
    PolycirclePrimitive = (function () { //画圆
        

    })();

    PolylinePrimitive = (function () {
        var materialLine = Cesium.Material.fromType(Cesium.Material.ColorType);
        materialLine.uniforms.color = new Cesium.Color(1.0, 1.0, 0.0, 0.5);
        var defaultShapeOptions = {
            ellipsoid: Cesium.Ellipsoid.WGS84,
            textureRotationAngle: 0.0,
            height: 0.0,
            asynchronous: true,
            show: true,
            debugShowBoundingVolume: false
        };
        var defaultPolylineOptions = copyOptionsDraw(defaultShapeOptions, {
            width: 5,
            geodesic: true,
            granularity: 10000,
            appearance: new Cesium.PolylineMaterialAppearance({
                aboveGround: false
            }),
            material: materialLine
        });

        function _(options) {
            options = copyOptionsDraw(options, defaultPolylineOptions);

            this.initialiseOptions(options);
        }
        _.prototype = new ChangeablePrimitive();
        _.prototype.setPositions = function (positions) {
            this.setAttribute('positions', positions);
        };
        _.prototype.setWidth = function (width) {
            this.setAttribute('width', width);
        };
        _.prototype.setGeodesic = function (geodesic) {
            this.setAttribute('geodesic', geodesic);
        };
        _.prototype.getPositions = function () {
            return this.getAttribute('positions');
        };
        _.prototype.getWidth = function () {
            return this.getAttribute('width');
        };
        _.prototype.getGeodesic = function (geodesic) {
            return this.getAttribute('geodesic');
        };
        _.prototype.getGeometry = function () {
            if (!Cesium.defined(this.positions) || this.positions.length < 2) {
                return;
            }
            return new Cesium.PolylineGeometry({
                positions: this.positions,
                height: this.height,
                width: this.width < 1 ? 1 : this.width,
                vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
                ellipsoid: this.ellipsoid
            });
        };
        return _;
    })();

    PolygonPrimitive = (function () {
        var materialSurface = Cesium.Material.fromType(Cesium.Material.ColorType);
        materialSurface.uniforms.color = new Cesium.Color(0.0, 1.0, 1.0, 0.5);
        var defaultShapeOptions = {
            ellipsoid: Cesium.Ellipsoid.WGS84,
            textureRotationAngle: 0.0,
            height: 0.0,
            asynchronous: true,
            show: true,
            debugShowBoundingVolume: false
        };
        var defaultSurfaceOptions = copyOptionsDraw(defaultShapeOptions, {
            appearance: new Cesium.EllipsoidSurfaceAppearance({
                aboveGround: false
            }),
            material: materialSurface,
            granularity: Math.PI / 180.0
        });
        var defaultPolygonOptions = copyOptionsDraw(defaultSurfaceOptions, {});
        function _(options) {
            options = copyOptionsDraw(options, defaultPolygonOptions);
            this.initialiseOptions(options);
            this.isPolygon = true;
        }

        _.prototype = new ChangeablePrimitive();//继承
        _.prototype.setPositions = function (positions) {
            this.setAttribute('positions', positions);
        };
        _.prototype.getPositions = function () {
            return this.getAttribute('positions');
        };
        _.prototype.getGeometry = function () {
            if (!Cesium.defined(this.positions) || this.positions.length < 3) {
                return;
            }
            return Cesium.PolygonGeometry.fromPositions({
                positions: this.positions,
                height: this.height,
                vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
                stRotation: this.textureRotationAngle,
                ellipsoid: this.ellipsoid,
                granularity: this.granularity
            });
        };

        _.prototype.getOutlineGeometry = function () {
            return Cesium.PolygonOutlineGeometry.fromPositions({
                positions: this.getPositions()
            });
        };
        return _;
    })();

    function getDisplayLatLngString(cartographic, precision) {
        return Cesium.Math.toDegrees(cartographic.longitude).toFixed(precision || 3) + ", " + Cesium.Math.toDegrees(cartographic.latitude).toFixed(precision || 3);
    }
    function cloneObjDraw(from, to) {
        if (from == null || typeof from != "object") return from;
        if (from.constructor != Object && from.constructor != Array) return from;
        if (from.constructor == Date || from.constructor == RegExp || from.constructor == Function ||
            from.constructor == String || from.constructor == Number || from.constructor == Boolean)
            return new from.constructor(from);

        to = to || new from.constructor();

        for (var name in from) {
            to[name] = typeof to[name] == "undefined" ? cloneObjDraw(from[name], null) : to[name];
        }

        return to;
    }
    function copyOptionsDraw(options, defaultOptions) {
        var newOptions = cloneObjDraw(options), option;
        for (option in defaultOptions) {
            if (newOptions[option] === undefined) {
                newOptions[option] = cloneObjDraw(defaultOptions[option]);
            }
        }
        return newOptions;
    }
    function fillOptionsDraw(options, defaultOptions) {
        options = options || {};
        var option;
        for (option in defaultOptions) {
            if (options[option] === undefined) {
                options[option] = cloneObjDraw(defaultOptions[option]);
            }
        }
    }
    //画圆
    _.startDrawingCircle = function () {

      //  poly = new PolycirclePrimitive(circleOption); //面
        //return poly;
    }
    //画点
    _.startDrawingMarker = function (viewer, msg, callback) {

        //var _self = this;
        var scene = viewer.scene;
        if (mouseHandlerDraw != null) {
            mouseHandlerDraw.destroy();
            mouseHandlerDraw = null;
        } else {
            mouseHandlerDraw = new Cesium.ScreenSpaceEventHandler(scene.canvas);
        }
        CesiumTooltip.initTool(viewer);

        // Now wait for start
        mouseHandlerDraw.setInputAction(function (movement) {
            if (movement.position != null) {
                var cartesian = scene.camera.pickEllipsoid(movement.position, ellipsoid);
                if (cartesian) {
                    //if (callback) {
                    if (typeof callback == 'function') {
                        callback(cartesian);
                    }
                }
                if (mouseHandlerDraw) {
                    mouseHandlerDraw.destroy();
                    mouseHandlerDraw = null;
                }
                if (CesiumTooltip) {
                    CesiumTooltip.setVisible(false);
                }
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        mouseHandlerDraw.setInputAction(function (movement) {
            var position = movement.endPosition;
            if (position != null) {
                var cartesian = scene.camera.pickEllipsoid(position, ellipsoid);
                if (cartesian) {
                    CesiumTooltip.showAt(position, msg + "\n位置:" + getDisplayLatLngString(ellipsoid.cartesianToCartographic(cartesian)));
                } else {
                    CesiumTooltip.showAt(position, msg);
                }
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    };
    //画面 画线
    _.startDrawingPolyshape = function (viewer, isPolygon, PolyOption, callback) {
        var scene = viewer.scene;
        if (mouseHandlerDraw) {
            mouseHandlerDraw.destroy();
            mouseHandlerDraw = null;
        } else {
            mouseHandlerDraw = new Cesium.ScreenSpaceEventHandler(scene.canvas);
        }

        CesiumTooltip.initTool(viewer);

        var minPoints = isPolygon ? 3 : 2;
        var primitives = scene.primitives;
        var poly;
        if (isPolygon) {
            poly = new PolygonPrimitive(PolyOption); //面
        } else {
            poly = new PolylinePrimitive(PolyOption); //点
        }
        poly.asynchronous = false;
        primitives.add(poly);
        var positions = [];
        mouseHandlerDraw.setInputAction(function (movement) {
            if (movement.position != null) {
                var cartesian = scene.camera.pickEllipsoid(movement.position, ellipsoid);
                if (cartesian) {
                    // first click
                    if (positions.length == 0) {
                        positions.push(cartesian.clone());
                    }
                    if (positions.length >= minPoints) {
                        poly.positions = positions;
                        poly._createPrimitive = true;
                    }

                    positions.push(cartesian);
                }
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        mouseHandlerDraw.setInputAction(function (movement) {
            var position = movement.endPosition;
            if (position != null) {
                if (positions.length == 0) {
                    CesiumTooltip.showAt(position, "点击添加第一个点");
                } else {
                    var cartesian = scene.camera.pickEllipsoid(position, ellipsoid);
                    if (cartesian) {
                        positions.pop();
                        // make sure it is slightly different
                        cartesian.y += (1 + Math.random());
                        positions.push(cartesian);
                        if (positions.length >= minPoints) {
                            poly.positions = positions;
                            poly._createPrimitive = true;
                        }
                        if (positions.length === 2) {
                            CesiumTooltip.showAt(position, "点击添加第二个点");
                        } else {
                            CesiumTooltip.showAt(position, "双击结束编辑");
                        }
                    }
                }
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        mouseHandlerDraw.setInputAction(function (movement) {
            var position = movement.position;
            if (position != null) {
                if (positions.length < minPoints + 2) {
                    return;
                } else {
                    var cartesian = scene.camera.pickEllipsoid(position, ellipsoid);
                    if (cartesian) {
                        //_self.stopDrawing();
                        if (typeof callback == 'function') {
                            //positions.push(cartesian);
                            callback(positions);
                        }
                        if (mouseHandlerDraw) {
                            mouseHandlerDraw.destroy();
                            mouseHandlerDraw = null;
                        }
                        if (CesiumTooltip) {
                            CesiumTooltip.setVisible(false);
                        }
                        if (poly) {
                            primitives.remove(poly);
                        }
                    }
                }
            }
        }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    };
    return _;
})();



/***
 * 
 * PrimitivePoint自定义渲染-线
 * 调用方法
 * primitivePolyline = new PrimitivePolyline({ 'viewer': viewer, 'Cartesians': cartesiansPoints, 'Colors': colors });
 */
var PrimitivePolyline=(
    function () {
        var vertexShader;
        var fragmentShader;
        //var geometry;
        //var appearance;
        var viewer;
        function _(options) {
            viewer = options.viewer;
            vertexShader = getVS();
            fragmentShader = getFS();
            if (options.Cartesians && options.Cartesians.length >= 2) {
                var postionsTemp = [];
                var colorsTemp = [];
                var indicesTesm = [];
                if (options.Colors && options.Colors.length === options.Cartesians.length * 4) {
                    for (var i = 0; i < options.Cartesians.length; i++) {
                        postionsTemp.push(options.Cartesians[i].x);
                        postionsTemp.push(options.Cartesians[i].y);
                        postionsTemp.push(options.Cartesians[i].z);
                    }
                    colorsTemp = options.Colors;
                } else {
                    for (var i = 0; i < options.Cartesians.length; i++) {
                        postionsTemp.push(options.Cartesians[i].x);
                        postionsTemp.push(options.Cartesians[i].y);
                        postionsTemp.push(options.Cartesians[i].z);
                        //
                        colorsTemp.push(0.0);
                        colorsTemp.push(0.0);
                        colorsTemp.push(1.0);
                        colorsTemp.push(1.0);
                    }
                }
                for (var i = 1; i < options.Cartesians.length; i++) {
                    indicesTesm.push(i - 1);
                    indicesTesm.push(i);
                }
                this.positionArr = new Float64Array(postionsTemp);
                this.colorArr = new Float32Array(colorsTemp);
                this.indiceArr = new Uint16Array(indicesTesm);

            } else { 
                var p1 = Cesium.Cartesian3.fromDegrees(0, 0, -10);
                var p2 = Cesium.Cartesian3.fromDegrees(0, 0.001, -10);
                this.positionArr = new Float64Array([
                    p1.x, p1.y, p1.z,
                    p2.x, p2.y, p2.z
                ]);
                //默认蓝色
                this.colorArr = new Float32Array([
                         0.0, 0.0, 1.0, 1.0,
                         0.0, 0.0, 1.0, 1.0
                ]);
                this.indiceArr = new Uint16Array([0, 1]);
            }
           
            this.geometry = CreateGeometry(this.positionArr, this.colorArr, this.indiceArr);
            this.appearance = CreateAppearence(fragmentShader, vertexShader);

            this.primitive = viewer.scene.primitives.add(new Cesium.Primitive({
                geometryInstances: new Cesium.GeometryInstance({
                    geometry: this.geometry
                }),
                appearance: this.appearance,
                asynchronous: false
            }));
        }

        function CreateGeometry(positions, colors, indices) {
            return new Cesium.Geometry({
                attributes: {
                    position: new Cesium.GeometryAttribute({
                        componentDatatype: Cesium.ComponentDatatype.DOUBLE,
                        componentsPerAttribute: 3,
                        values: positions
                    }),
                    color: new Cesium.GeometryAttribute({
                        componentDatatype: Cesium.ComponentDatatype.FLOAT,
                        componentsPerAttribute: 4,
                        values: colors
                    })
                },
                indices: indices,
                primitiveType: Cesium.PrimitiveType.LINES,
                boundingSphere: Cesium.BoundingSphere.fromVertices(positions)
            });
        }

        function CreateAppearence(fs, vs) {
            return new Cesium.Appearance({         
                renderState: {
                    blending: Cesium.BlendingState.PRE_MULTIPLIED_ALPHA_BLEND,  
                    depthTest: { enabled: true }, 
                    depthMask: true,
                    lineWidth: 4.0
                },
                fragmentShaderSource: fs,
                vertexShaderSource: vs
            });
        }

        function getVS() {
            return "attribute vec3 position3DHigh;\
            attribute vec3 position3DLow;\
            attribute vec4 color;\
            varying vec4 v_color;\
            attribute float batchId;\
            void main()\
            {\
                vec4 p = czm_computePosition();\
                v_color =color;\
                p = czm_modelViewProjectionRelativeToEye * p;\
                gl_Position = p;\
            }\
            ";
        }
        function getFS() {
            return "varying vec4 v_color;\
            void main()\
            {\
                gl_FragColor =v_color;\
            }\
            ";
        }
       
        _.prototype.remove = function () {
            if (this.primitive != null) {
                viewer.scene.primitives.remove(this.primitive);
                this.positionArr = null;
                this.colorArr = null;
                this.indiceArr = null;
                this.geometry = null;
                this.appearance = null;
                this.primitive = null;
            }
        }
        _.prototype.updateCartesianPosition = function (cartesians) {
            if (this.primitive != null) {
                viewer.scene.primitives.remove(this.primitive);
                if (cartesians && cartesians.length < 2) { return; }
               
                //默认蓝色
                var postionsTemp = [];
                var colorsTemp = [];
                var indicesTesm = [];
                for (var i = 0; i < cartesians.length; i++) {
                    postionsTemp.push(cartesians[i].x);
                    postionsTemp.push(cartesians[i].y);
                    postionsTemp.push(cartesians[i].z);
                     
                    colorsTemp.push(0.0);
                    colorsTemp.push(0.0);
                    colorsTemp.push(1.0);
                    colorsTemp.push(1.0);
                }
                for (var i = 1; i < cartesians.length; i++) {
                    indicesTesm.push(i - 1);
                    indicesTesm.push(i);
                }
                this.positionArr = new Float64Array(postionsTemp);
                this.colorArr = new Float32Array(colorsTemp);
                this.indiceArr = new Uint16Array(indicesTesm);

                this.geometry = CreateGeometry(this.positionArr, this.colorArr, this.indiceArr);
                this.appearance = CreateAppearence(fragmentShader, vertexShader);

                this.primitive = viewer.scene.primitives.add(new Cesium.Primitive({
                    geometryInstances: new Cesium.GeometryInstance({
                        geometry: this.geometry
                    }),
                    appearance: this.appearance,
                    asynchronous: false
                }));
            } else { return;}
        }
        _.prototype.updateCartesianPositionColor = function (cartesians, colors) {
            if (colors.length === cartesians.length * 4) { } else { return; }
            if (this.primitive != null) {
                viewer.scene.primitives.remove(this.primitive);
                if (cartesians && cartesians.length < 2) { return; }
          
                var postionsTemp = [];
                var indicesTesm = [];
                
                for (var i = 0; i < cartesians.length; i++) {
                    postionsTemp.push(cartesians[i].x);
                    postionsTemp.push(cartesians[i].y);
                    postionsTemp.push(cartesians[i].z);
                }
                for (var i = 1; i < cartesians.length; i++) {
                    indicesTesm.push(i - 1);
                    indicesTesm.push(i);
                }
                this.positionArr = new Float64Array(postionsTemp);
                this.colorArr = new Float32Array(colors);
                this.indiceArr = new Uint16Array(indicesTesm);

                this.geometry = CreateGeometry(this.positionArr, this.colorArr, this.indiceArr);
                this.appearance = CreateAppearence(fragmentShader, vertexShader);
           

                this.primitive = viewer.scene.primitives.add(new Cesium.Primitive({
                    geometryInstances: new Cesium.GeometryInstance({
                        geometry: this.geometry
                    }),
                    appearance: this.appearance,
                    asynchronous: false
                }));
            } else { return; }
        }
        return _;
    })();

/***
 * PrimitivePoint自定义渲染-点
 * 调用方法
 * primitivePoints = new PrimitivePoints({ 'viewer': viewer, 'Cartesians': cartesiansPoints, 'Colors': colors });
 */
var PrimitivePoints=(
    function () {
        var vertexShader;
        var fragmentShader;
        var geometry;
        var appearance;
        var viewer;
        function _(options) {
            viewer = options.viewer;
            vertexShader = getVS();
            fragmentShader = getFS();
            if (options.Cartesians && options.Cartesians.length >= 2) {
                var postionsTemp = [];
                var colorsTemp = [];
                var indicesTesm = [];
                if (options.Colors && options.Colors.length === options.Cartesians.length * 4) {
                    for (var i = 0; i < options.Cartesians.length; i++) {
                        postionsTemp.push(options.Cartesians[i].x);
                        postionsTemp.push(options.Cartesians[i].y);
                        postionsTemp.push(options.Cartesians[i].z);
                    }
                    colorsTemp = options.Colors;
                } else {
                    for (var i = 0; i < options.Cartesians.length; i++) {
                        postionsTemp.push(options.Cartesians[i].x);
                        postionsTemp.push(options.Cartesians[i].y);
                        postionsTemp.push(options.Cartesians[i].z);
                        //
                        colorsTemp.push(0.0);
                        colorsTemp.push(0.0);
                        colorsTemp.push(1.0);
                        colorsTemp.push(1.0);
                    }
                }
                for (var i = 0; i < options.Cartesians.length; i++) {
                    indicesTesm.push(i);
                }
                this.positionArr = new Float64Array(postionsTemp);
                this.colorArr = new Float32Array(colorsTemp);
                this.indiceArr = new Uint16Array(indicesTesm);

            } else {
                var p1 = Cesium.Cartesian3.fromDegrees(0, 0, -10);
                var p2 = Cesium.Cartesian3.fromDegrees(0, 0.001, -10);
                this.positionArr = new Float64Array([
                    p1.x, p1.y, p1.z,
                    p2.x, p2.y, p2.z
                ]);
                this.colorArr = new Float32Array([
                            0.0, 0.0, 1.0, 1.0,
                            0.0, 0.0, 1.0, 1.0
                ]);
                this.indiceArr = new Uint16Array([0, 1]);
            }
            
            geometry = CreateGeometry(this.positionArr, this.colorArr, this.indiceArr);
            appearance = CreateAppearence(fragmentShader, vertexShader);

            this.primitive = viewer.scene.primitives.add(new Cesium.Primitive({
                geometryInstances: new Cesium.GeometryInstance({
                    geometry: geometry
                }),
                appearance: appearance,
                asynchronous: false
            }));
        }

        function CreateGeometry(positions, colors, indices) {
            return new Cesium.Geometry({
                attributes: {
                    position: new Cesium.GeometryAttribute({
                        componentDatatype: Cesium.ComponentDatatype.DOUBLE,
                        componentsPerAttribute: 3,
                        values: positions
                    }),
                    color: new Cesium.GeometryAttribute({
                        componentDatatype: Cesium.ComponentDatatype.FLOAT,
                        componentsPerAttribute: 4,
                        values: colors
                    })
                },
                indices: indices,
                primitiveType: Cesium.PrimitiveType.POINTS,
                boundingSphere: Cesium.BoundingSphere.fromVertices(positions)
            });
        }

        function CreateAppearence(fs, vs) {
            return new Cesium.Appearance({        
                renderState: {
                    blending: Cesium.BlendingState.PRE_MULTIPLIED_ALPHA_BLEND, 
                    depthTest: { enabled: true }, 
                    depthMask: true
                },
                fragmentShaderSource: fs,
                vertexShaderSource: vs
            });
        }

        function getVS() {
            return "attribute vec3 position3DHigh;\
            attribute vec3 position3DLow;\
            attribute vec4 color;\
            varying vec4 v_color;\
            attribute float batchId;\
            void main()\
            {\
                vec4 p = czm_computePosition();\
                v_color =color;\
                p = czm_modelViewProjectionRelativeToEye * p;\
                gl_Position = p;\
                gl_PointSize=8.0;\
            }\
            ";
        }
        function getFS() {
            return "varying vec4 v_color;\
            void main()\
            {\
                    float d = distance(gl_PointCoord, vec2(0.5,0.5));\
                    if(d < 0.5){\
                    gl_FragColor = v_color;\
                    }else{\
                    discard;\
                    }\
            }\
            ";
        }
        
        _.prototype.remove = function () {
            if (this.primitive != null) {
                viewer.scene.primitives.remove(this.primitive);
                this.primitive = null;
            }
        }
        _.prototype.updateCartesianPosition = function (cartesians) {
            if (this.primitive != null) {
                viewer.scene.primitives.remove(this.primitive);
                if (cartesians && cartesians.length < 2) { return; }
            
                var postionsTemp = [];
                var colorsTemp = [];
                var indicesTesm = [];
                for (var i = 0; i < cartesians.length; i++) {
                    postionsTemp.push(cartesians[i].x);
                    postionsTemp.push(cartesians[i].y);
                    postionsTemp.push(cartesians[i].z);
                        
                    colorsTemp.push(0.0);
                    colorsTemp.push(0.0);
                    colorsTemp.push(1.0);
                    colorsTemp.push(1.0);
                }
                for (var i = 0; i < cartesians.length; i++) {
                    indicesTesm.push(i);
                }
                this.positionArr = new Float64Array(postionsTemp);
                this.colorArr = new Float32Array(colorsTemp);
                this.indiceArr = new Uint16Array(indicesTesm);

                geometry = CreateGeometry(this.positionArr, this.colorArr, this.indiceArr);
                appearance = CreateAppearence(fragmentShader, vertexShader);

                this.primitive = viewer.scene.primitives.add(new Cesium.Primitive({
                    geometryInstances: new Cesium.GeometryInstance({
                        geometry: geometry
                    }),
                    appearance: appearance,
                    asynchronous: false
                }));
            } else { return;}
        }
        _.prototype.updateCartesianPositionColor = function (cartesians, colors) {
            if (colors.length === cartesians.length * 4) { } else { return; }
            if (this.primitive != null) {
                viewer.scene.primitives.remove(this.primitive);
                if (cartesians && cartesians.length < 2) { return; }
                
                var postionsTemp = [];
                var indicesTesm = [];
                
                for (var i = 0; i < cartesians.length; i++) {
                    postionsTemp.push(cartesians[i].x);
                    postionsTemp.push(cartesians[i].y);
                    postionsTemp.push(cartesians[i].z);
                }
                for (var i = 0; i < cartesians.length; i++) {
                    indicesTesm.push(i);
                }
                this.positionArr = new Float64Array(postionsTemp);
                this.colorArr = new Float32Array(colors);
                this.indiceArr = new Uint16Array(indicesTesm);

                geometry = CreateGeometry(this.positionArr, this.colorArr, this.indiceArr);
                appearance = CreateAppearence(fragmentShader, vertexShader);
                
                this.primitive = viewer.scene.primitives.add(new Cesium.Primitive({
                    geometryInstances: new Cesium.GeometryInstance({
                        geometry: geometry
                    }),
                    appearance: appearance,
                    asynchronous: false
                }));
            } else { return; }
        }
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
        thead = "<table class='table table-striped' CELLPADDING=10 CELLSPACING=10<thead><tr><th>序号</th><th>特征</th><th>特征值</th><th>状态</th></tr></thead><tbody>";
        for(var i in obj){
            var id =  obj[i].id,tpye = obj[i].type,key = obj[i].key,value = obj[i].value,code = obj[i].code;
            if("text" == tpye){
                trs += '<tr><td>'+ i +'</td><td>'+ key +'</td><td><input type="text" id="'+id+'" value="'+value+'"></td><td>有效</td></tr>';
            }
            if("select" == tpye){
                console.log(value.length);
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

/**
 * 随机获取
 * cesium内置颜色
 * color = getColor(10);
 */
var getColor =  function(index){
        var color = [
            Cesium.Color.ALICEBLUE	,
            Cesium.Color.ANTIQUEWHITE 	,
            Cesium.Color.AQUA	,
            Cesium.Color.AQUAMARINE 	,
            Cesium.Color.AZURE 	,
            Cesium.Color.BEIGE 	,
            Cesium.Color.BISQUE 	,
            Cesium.Color.BLACK 	,
            Cesium.Color.BLANCHEDALMOND 	,
            Cesium.Color.BLUE 	,
            Cesium.Color.BLUEVIOLET 	,
            Cesium.Color.BROWN 	,
            Cesium.Color.BURLYWOOD 	,
            Cesium.Color.CADETBLUE 	,
            Cesium.Color.CHARTREUSE 	,
            Cesium.Color.CHOCOLATE 	,
            Cesium.Color.CORAL 	,
            Cesium.Color.CORNFLOWERBLUE 	,
            Cesium.Color.CORNSILK 	,
            Cesium.Color.CRIMSON 	,
            Cesium.Color.CYAN 	,
            Cesium.Color.DARKBLUE 	,
            Cesium.Color.DARKCYAN 	,
            Cesium.Color.DARKGOLDENROD 	,
            Cesium.Color.DARKGRAY 	,
            Cesium.Color.DARKGREEN 	,
            Cesium.Color.DARKGREY 	,
            Cesium.Color.DARKKHAKI 	,
            Cesium.Color.DARKMAGENTA 	,
            Cesium.Color.DARKOLIVEGREEN 	,
            Cesium.Color.DARKORANGE 	,
            Cesium.Color.DARKORCHID 	,
            Cesium.Color.DARKRED 	,
            Cesium.Color.DARKSALMON 	,
            Cesium.Color.DARKSEAGREEN 	,
            Cesium.Color.DARKSLATEBLUE 	,
            Cesium.Color.DARKSLATEGRAY 	,
            Cesium.Color.DARKSLATEGREY 	,
            Cesium.Color.DARKTURQUOISE 	,
            Cesium.Color.DARKVIOLET 	,
            Cesium.Color.DEEPPINK 	,
            Cesium.Color.DEEPSKYBLUE 	,
            Cesium.Color.DIMGRAY 	,
            Cesium.Color.DIMGREY 	,
            Cesium.Color.DODGERBLUE 	,
            Cesium.Color.FIREBRICK 	,
            Cesium.Color.FLORALWHITE 	,
            Cesium.Color.FORESTGREEN 	,
            Cesium.Color.FUCHSIA 	,
            Cesium.Color.GAINSBORO 	,
            Cesium.Color.GHOSTWHITE 	,
            Cesium.Color.GOLD 	,
            Cesium.Color.GOLDENROD 	,
            Cesium.Color.GRAY 	,
            Cesium.Color.GREEN 	,
            Cesium.Color.GREENYELLOW 	,
            Cesium.Color.GREY 	,
            Cesium.Color.HONEYDEW 	,
            Cesium.Color.HOTPINK 	,
            Cesium.Color.INDIANRED 	,
            Cesium.Color.INDIGO 	,
            Cesium.Color.IVORY 	,
            Cesium.Color.KHAKI 	,
            Cesium.Color.LAVENDAR_BLUSH 	,
            Cesium.Color.LAVENDER 	,
            Cesium.Color.LAWNGREEN 	,
            Cesium.Color.LEMONCHIFFON 	,
            Cesium.Color.LIGHTBLUE 	,
            Cesium.Color.LIGHTCORAL 	,
            Cesium.Color.LIGHTCYAN 	,
            Cesium.Color.LIGHTGOLDENRODYELLOW 	,
            Cesium.Color.LIGHTGRAY 	,
            Cesium.Color.LIGHTGREEN 	,
            Cesium.Color.LIGHTGREY 	,
            Cesium.Color.LIGHTPINK 	,
            Cesium.Color.LIGHTSEAGREEN 	,
            Cesium.Color.LIGHTSKYBLUE 	,
            Cesium.Color.LIGHTSLATEGRAY 	,
            Cesium.Color.LIGHTSLATEGREY 	,
            Cesium.Color.LIGHTSTEELBLUE 	,
            Cesium.Color.LIGHTYELLOW 	,
            Cesium.Color.LIME 	,
            Cesium.Color.LIMEGREEN 	,
            Cesium.Color.LINEN 	,
            Cesium.Color.MAGENTA 	,
            Cesium.Color.MAROON 	,
            Cesium.Color.MEDIUMAQUAMARINE 	,
            Cesium.Color.MEDIUMBLUE 	,
            Cesium.Color.MEDIUMORCHID 	,
            Cesium.Color.MEDIUMPURPLE 	,
            Cesium.Color.MEDIUMSEAGREEN 	,
            Cesium.Color.MEDIUMSLATEBLUE 	,
            Cesium.Color.MEDIUMSPRINGGREEN 	,
            Cesium.Color.MEDIUMTURQUOISE 	,
            Cesium.Color.MEDIUMVIOLETRED 	,
            Cesium.Color.MIDNIGHTBLUE 	,
            Cesium.Color.MINTCREAM 	,
            Cesium.Color.MISTYROSE 	,
            Cesium.Color.MOCCASIN 	,
            Cesium.Color.NAVAJOWHITE 	,
            Cesium.Color.NAVY 	,
            Cesium.Color.OLDLACE 	,
            Cesium.Color.OLIVE 	,
            Cesium.Color.OLIVEDRAB 	,
            Cesium.Color.ORANGE 	,
            Cesium.Color.ORANGERED 	,
            Cesium.Color.ORCHID 	,
            Cesium.Color.packedLength 	,
            Cesium.Color.PALEGOLDENROD 	,
            Cesium.Color.PALEGREEN 	,
            Cesium.Color.PALETURQUOISE 	,
            Cesium.Color.PALEVIOLETRED 	,
            Cesium.Color.PAPAYAWHIP 	,
            Cesium.Color.PEACHPUFF 	,
            Cesium.Color.PERU 	,
            Cesium.Color.PINK 	,
            Cesium.Color.PLUM 	,
            Cesium.Color.POWDERBLUE 	,
            Cesium.Color.PURPLE 	,
            Cesium.Color.RED 	,
            Cesium.Color.ROSYBROWN 	,
            Cesium.Color.ROYALBLUE 	,
            Cesium.Color.SADDLEBROWN 	,
            Cesium.Color.SALMON 	,
            Cesium.Color.SANDYBROWN 	,
            Cesium.Color.SEAGREEN 	,
            Cesium.Color.SEASHELL 	,
            Cesium.Color.SIENNA 	,
            Cesium.Color.SILVER 	,
            Cesium.Color.SKYBLUE 	,
            Cesium.Color.SLATEBLUE 	,
            Cesium.Color.SLATEGRAY 	,
            Cesium.Color.SLATEGREY 	,
            Cesium.Color.SNOW 	,
            Cesium.Color.SPRINGGREEN 	,
            Cesium.Color.STEELBLUE 	,
            Cesium.Color.TAN 	,
            Cesium.Color.TEAL 	,
            Cesium.Color.THISTLE 	,
            Cesium.Color.TOMATO 	,
            Cesium.Color.TRANSPARENT 	,
            Cesium.Color.TURQUOISE 	,
            Cesium.Color.VIOLET 	,
            Cesium.Color.WHEAT 	,
            Cesium.Color.WHITE 	,
            Cesium.Color.WHITESMOKE 	,
            Cesium.Color.YELLOW 	,
            Cesium.Color.YELLOWGREEN 
        ]
    
        return color[index];
    }