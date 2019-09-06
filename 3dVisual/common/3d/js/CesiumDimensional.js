/**====================================================================== [三维] ======================================================================================= */
/************************************************* CesiumFlyPath start  ***************************************************** */
/**
 * 纹理喷泉
 * 
 * @author zhangti
 * @version v1
 * 
 * CesiumFlyPath start
 */
var CesiumFlyPath = (function(){
    var viewer = null,_PolylineTrailLinkMaterialProperty,cities
    ,tableparam,entity,entity2 =[],links = [];
    function _(){};

    _.init = function(param,flag){
        if(null === param || undefined === param)return;
        var t = this;
        for(var key in param){
            t[key] = param[key];
        }

        this.config();

        if(flag){ //获取后台点信息
            if(this.cities != null && this.cities != ""){
                $.get(this.cities,{},function(json){
                    if(json != null && json !=""){
                        cities = json;
                        CesiumFlyPath.build({handleType:t.handleType,center:{lon:t.lon,lat:t.lat}
                            ,cities:cities,zoom:t.zoom,v:{c1:getColor(t.c1),c2:getColor(t.c2),s1:t.s1,s2:t.s2}});
                    }else{
                        alert("数据异常")
                    }
                });
            } 
        }
    }
  
    _.build = function(param){
        var t = this;
        switch(param.handleType){
            case "":{ break; }
            default:{data = t.drawDefault(param);}
        }
    }
    _.initSelect = function(){
        tableparam = [
            {id:"_ids1",type:"select",key:"handleType",value:['default'],code:['default']},
            {id:"_ids2",type:"select",key:"cities",value:["../common/3d/data/flyPath.json"],code:["../common/3d/data/flyPath.json"]},
            {id:"_ids3",type:"text",key:"color",value:30,code:"color"},
            {id:"_ids4",type:"text",key:"duration",value:3000,code:"duration"},
            {id:"_ids5",type:"text",key:"height",value:500000,code:"height"},
            {id:"_ids6",type:"text",key:"zoom",value:300000,code:"zoom"},
            {id:"_ids7",type:"text",key:"c1",value:30,code:"c1"},
            {id:"_ids8",type:"text",key:"c2",value:20,code:"c2"}  ,
            {id:"_ids9",type:"text",key:"s1",value:6,code:"s1"},
            {id:"_ids10",type:"text",key:"s2",value:6,code:"s2"},
            {id:"_ids11",type:"text",key:"lon",value:114.302312702,code:"lon"},
            {id:"_ids12",type:"text",key:"lat",value:30.598026044,code:"lat"}
        ]
        var table = createTable(tableparam);
        $("#content").empty().append(table);
        $("#content select,input").css("width","200px");

    }
    _.select = function(viewer){
        if(tableparam.length == 0)return;
        var selectData = [];
        for(var i in tableparam){
            var val = $('#_ids'+(parseInt(i)+1)).val();
            selectData.push({id:'_ids'+(parseInt(i)+1),code:tableparam[i].key,value:val});
        }
        var initData = {
             viewer:viewer,
             handleType:selectData[0].value,
             cities:selectData[1].value,
             color:parseInt(selectData[2].value),
             duration:parseInt(selectData[3].value),
             height:parseInt(selectData[4].value),
             zoom:parseFloat(selectData[5].value),
             c1:parseFloat(selectData[6].value),
             c2:parseFloat(selectData[7].value),
             s1:parseFloat(selectData[8].value),
             s2:parseFloat(selectData[9].value),
             lon:parseFloat(selectData[10].value),
             lat:parseFloat(selectData[11].value)
        }
        return initData;
    }
    _.initController = function (){
        var _self = this;
        _self.createToolbar();
        var subscribeParameter = function(name) {
            Cesium.knockout.getObservable(viewModel, name).subscribe(
                function(newValue) {
                    _self.controller({key:name,value:newValue});
                }
            );
        }
        var viewModel = {
            color: 10,
            c1:10,
            c2:10
        };
        Cesium.knockout.track(viewModel);
        var toolbar = document.getElementById('toolbar');
        Cesium.knockout.applyBindings(viewModel, toolbar);
        subscribeParameter('color');
        subscribeParameter('c1');
        subscribeParameter('c2');
    }
    //外部控制节点
    _.controller = function (obj){
        if(obj === null & obj === "")return;
        var key = obj.key,value = parseInt(obj.value);
        if("color" == key)for(var i in links)links[i].polyline.material[key] = getColor(value);
        if("c1" == key)entity.point.color = getColor(value);
        if("c2" == key)for(var i in entity2)entity2[i].point.color = getColor(value);
        
    }
    _.config = function(){
        viewer = this.viewer;
       //绘制位置在地形上
        viewer.scene.globe.depthTestAgainstTerrain = true;
        //定义流动纹理对象
        Cesium.PolylineTrailLinkMaterialProperty = PolylineTrailLinkMaterialProperty;
        Cesium.Material.PolylineTrailLinkType = 'PolylineTrailLink';
        Cesium.Material.PolylineTrailLinkImage = "../common/3d/data/images/colors1.png";
         //着色器
        Cesium.Material.PolylineTrailLinkSource = "czm_material czm_getMaterial(czm_materialInput materialInput)\n\
                                                      {\n\
                                                           czm_material material = czm_getDefaultMaterial(materialInput);\n\
                                                           vec2 st = materialInput.st;\n\
                                                           vec4 colorImage = texture2D(image, vec2(fract(st.s - time), st.t));\n\
                                                           material.alpha = colorImage.a * color.a;\n\
                                                           material.diffuse = (colorImage.rgb+color.rgb)/2.0;\n\
                                                           return material;\n\
                                                       }";
   
        //实例化流动纹理
        _PolylineTrailLinkMaterialProperty  = new Cesium.PolylineTrailLinkMaterialProperty(getColor(this.color), this.duration);
        Cesium.Material._materialCache.addMaterial(Cesium.Material.PolylineTrailLinkType, {
           fabric: {
               type: Cesium.Material.PolylineTrailLinkType,
               uniforms: {
                   color: new Cesium.Color(1.0, 0.0, 0.0, 0.5),
                   image: Cesium.Material.PolylineTrailLinkImage,
                   time: 0
               },
               source: Cesium.Material.PolylineTrailLinkSource
           },
           translucent: function (material) {
               return true;
           }
       });

       this.initController();
   }
    _.drawDefault = function(data){
        var _self = this,center = data.center,lon = center.lon
        ,lat = center.lat,zoom = data.zoom,cities = data.cities,v = data.v;
        //设置homebutton的位置
        Cesium.Camera.DEFAULT_VIEW_RECTANGLE =
        Cesium.Rectangle.fromDegrees(lon - 1, lat - 1, lon + 1, lat + 1); 
        //设置初始位置
        viewer.camera.setView({
         destination: Cesium.Cartesian3.fromDegrees(lon, lat,zoom)
        });
        //生成流动纹理
        for (var j = 0; j < cities.length; j++) {
            var points = _cesium.parabolaEquation({ pt1: center, pt2: cities[j], height: _self.height, num: 100 });
            var pointArr = [];
            for (var i = 0; i < points.length; i++) {
                pointArr.push(points[i][0],points[i][1],points[i][2]);
            }
            var link = viewer.entities.add({
                name: 'PolylineTrailLink' + j,
                polyline: {
                    positions: Cesium.Cartesian3.fromDegreesArrayHeights(pointArr),
                    width: 2,
                    material: _PolylineTrailLinkMaterialProperty //流动纹理
                }
            });
            links.push(link);
        }
        //原点
        entity = viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(lon, lat, 1),
            point: {
                pixelSize: v.s1,
                color: v.c1
            }
        });
        //目标点
        for (var i = 0; i < cities.length; i++) {
            var e = viewer.entities.add({
                position: Cesium.Cartesian3.fromDegrees(cities[i].lon, cities[i].lat, 1),
                point: {
                    pixelSize: v.s2,
                    color: v.c2
                }
            });
            entity2.push(e);
        }

    }
    _.remove = function(){

        if(viewer != null)viewer.entities.removeAll();

    }
    _.createToolbar = function(){
        var toolbarparam	 = [	
            {type:"range",key:"color",value:4,min:"0",max:"147",step:"10"},
            {type:"range",key:"c1",value:4,min:"0",max:"147",step:"10"},
            {type:"range",key:"c2",value:4,min:"0",max:"147",step:"10"}
        ]
        var table = createToolbar(toolbarparam);
        var toolbar = 
        '<div id="toolbar">'+
        table +
        '<div></div>';
        $("#toolbar").remove();
        $("body").append(toolbar);
        $("#toolbar").css("background","rgba(42, 42, 42, 0.8)").css("padding","4px;").css("border-radius", "4px");
        $("#toolbar input").css("vertical-align","middle").css("padding-top","2px").css("padding-bottom","2px");
    }

    return _;
})();
 

/*
 流纹纹理线
 color 颜色
 duration 持续时间 毫秒
*/

var PolylineTrailLinkMaterialProperty = null;
PolylineTrailLinkMaterialProperty = function (color, duration) {
    this._definitionChanged = new Cesium.Event();
    this._color = undefined;
    this._colorSubscription = undefined;
    this.color = color;
    this.duration = duration;
    this._time = (new Date()).getTime();
}
//在cesium中 定义 PolylineTrailLinkMaterialProperty
Cesium.defineProperties(PolylineTrailLinkMaterialProperty.prototype, {
    isConstant: {
        get: function () {
            return false;
        }
    },
    definitionChanged: {
        get: function () {
            return this._definitionChanged;
        }
    },
    color: Cesium.createPropertyDescriptor('color')
});
PolylineTrailLinkMaterialProperty.prototype.getType = function (time) {
    return 'PolylineTrailLink';
}
PolylineTrailLinkMaterialProperty.prototype.getValue = function (time, result) {
    if (!Cesium.defined(result)) {
        result = {};
    }
    result.color = Cesium.Property.getValueOrClonedDefault(this._color, time, Cesium.Color.WHITE, result.color);
    result.image = Cesium.Material.PolylineTrailLinkImage;
    result.time = (((new Date()).getTime() - this._time) % this.duration) / this.duration;
    return result;
}
PolylineTrailLinkMaterialProperty.prototype.equals = function (other) {
    return this === other ||
        (other instanceof PolylineTrailLinkMaterialProperty &&
            Property.equals(this._color, other._color))
}

/************************************************* CesiumFlyPath end  ***************************************************** */
/************************************************* CesiumRadarScan start  ************************************************** */
/***
 * cesium 雷达扫描
 * @author zhangti
 * @version v1
 * 调用
 * CesiumRadar.init({viewer:viewer,scanColor:new Cesium.Color(0,1.0,0,1),r:1500,interval:4000});
 * var data = CesiumRadar.build({handleType:"",datas:[{lon:117.217124,lat:31.809777}]});
 * CesiumRadar.controller({});
 * CesiumRadar.toolAddRader({});
 */
var CesiumRadarScan = (function(){
    var ellipsoid = Cesium.Ellipsoid.WGS84,radars = [],mouseHandlerDraw,viewer,tableparam = null,silhouette = null,switchType = null;
    function _(){};
    _.init = function(param,flag){
        if(null === param || undefined === param)return;
        var t = this;
        for(var key in param){
            t[key] = param[key];
        }
        if(flag)this.build({handleType:"scan",datas:[{lon:this.lon,lat:this.lat}]});
        this.config();
        this.createToolbar();
    }

    _.build = function(param){
        if(param == null ) return;
        var data = null;
        try {
            switch(param.handleType){
                case "spread":{ data = this.drawspread(param.datas);break; }
                case "scan":{ data = this.drawscan(param.datas);break; }
            }
        } catch (error) {
            console.log(error);
        }
            return data;
    }
    //新增
    _.radarTool = function(viewer){
        this.viewer = viewer;
        switchType = 'scan';
        this.setParameter({scanColor:82,r:1500,interval:4000});
        this.config();
        this.toolAddRader();
    }
    _.config = function(){
        viewer = this.viewer;
        viewer.scene.globe.depthTestAgainstTerrain = true;//显示帧数
        viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);//取消双击事件
        silhouette = viewer.scene.postProcessStages;
    }

    _.setParameter = function(obj){
        var _self = this;
        _self.scanColor = obj.scanColor == null? _self.scanColor :obj.scanColor;
        _self.r = obj.r == null?_self.r:obj.r;
        _self.interval = obj.interval == null? _self.interval:obj.interval;
     }
     _.getParameter = function(lat,lon){
        var _self = this;
        var param = {
             lon:lon,//经度
             lat:lat, //纬度
             scanColor: _self.scanColor,
             r:_self.r,//扫描半径
             interval:_self.interval//时间间隔   
         }
         return param;
    };
    _.drawspread = function(datas){ //扩散形雷达
        if(datas == null ) return;
        try {
            for(var i in datas){//拓展支持生成多个雷达扫描
                var paramData = this.getParameter(datas[i].lat,datas[i].lon);
                var radar = _cesium.addCircleScan(viewer,paramData);
                silhouette.add(radar);
                radars.push(radar);
            }
        } catch (error) {
            console.log(error);
        }
        this.initController();
    }

    _.drawscan = function(datas){    //扫描型雷达
        if(datas == null ) return;
        try {
            for(var i in datas){//拓展支持生成多个雷达扫描
                var paramData = this.getParameter(datas[i].lat,datas[i].lon);
                var radar = _cesium.addRadarScan(viewer,paramData); //生成工具
                silhouette.add(radar);
                radars.push(radar);
            }
        } catch (error) {
            console.log(error);
        }
        this.initController();
    }
    _.draw = function(){ //没想好切换机制 暂时不用
        try {
           for(var i in datas){//拓展支持生成多个雷达扫描
               var paramData = this.getParameter(datas[i].lat,datas[i].lon);
               var scan = _cesium.addRadarScan(viewer,paramData); //生成工具
               var spread = _cesium.addCircleScan(viewer,paramData);
               radars.scan.push(scan);radars.spread.push(spread);
           }
           this.switch("scan"); //默认
       } catch (error) {
           console.log(error);
       }
       this.initController();
   }
   _.switch = function(type){//没想好切换机制 暂时不用
        if(radars === null)return;
        switchType = type;
        /*if(type  == "scan"){
            _ary.arrForEach(radars.scan,function(scan,index){
                silhouette.add(scan);
            });
           
        }else{
            _ary.arrForEach(radars.spread,function(spread,index){
                silhouette.add(spread);
            });
        }*/
    }
    _.initSelect = function(){
        tableparam = [
            {id:"_ids1",type:"text",key:"scanColor",value:82,code:"scanColor"},
            {id:"_ids2",type:"text",key:"r",value:1500,code:"r"},
            {id:"_ids3",type:"text",key:"interval",value:4000,code:"interval"},
            {id:"_ids4",type:"text",key:"lon",value:117.217124,code:"lon"},
            {id:"_ids5",type:"text",key:"lat",value:31.809777,code:"lat"}  
        ]
        var table = createTable(tableparam);
        $("#content").empty().append(table);
        $("#content select,input").css("width","200px");

    }
    _.select = function(viewer){
        if(tableparam.length == 0)return;
        var selectData = [];
        for(var i in tableparam){
            var val = $('#_ids'+(parseInt(i)+1)).val();
            selectData.push({id:'_ids'+(parseInt(i)+1),code:tableparam[i].key,value:val});
        }
        var initData = {
             viewer:viewer,
             scanColor:parseInt(selectData[0].value),
             r:parseInt(selectData[1].value),
             interval:parseInt(selectData[2].value),
             lon:parseFloat(selectData[3].value),
             lat:parseFloat(selectData[4].value)
        }
        return initData;
    }
    _.initController = function (){
        var _self = this;
        new _cesiumTool({viewer:viewer}).setView({handleType:"flyTo",lat: 31.809777,lon:117.217124,d:5000}); //模拟

        var subscribeParameter = function(name) {
            Cesium.knockout.getObservable(viewModel, name).subscribe(
                function(newValue) {
                    _self.controller({key:name,value:newValue});
                }
            );
        }
        var viewModel = {
            u_radius: _self.r,
            interval: _self.interval,
            u_scanColor:_self.scanColor
        };
        Cesium.knockout.track(viewModel);
        var toolbar = document.getElementById('toolbar');
        Cesium.knockout.applyBindings(viewModel, toolbar);
        subscribeParameter('interval');
        subscribeParameter('u_radius');
        subscribeParameter('u_scanColor');
    }
    //外部控制节点
    _.controller = function (obj){
        var _self = this,key = obj.key,value = parseInt(obj.value),_obj = null;
        if(_ary.arrBool(radars)) return;
        var _time = (new Date()).getTime();
        var u_radius = function (maxRadius,duration) {
            return maxRadius * (((new Date()).getTime() -  _time) % duration) / duration;
        }
        _ary.arrForEach(radars,function(scan,index){ //扫描
            if("u_scanColor" == key){
                scan.uniforms.u_scanColor = getColor(value);
                _obj = {"scanColor":getColor(value)}
            };
            if("u_radius" == key){
                scan.uniforms.u_radius = value; 
                _obj = {"r":value}
            };
            if("interval" == key){
                scan.uniforms.interval = value;
                 _obj = {"interval":value}
            };
        });
        this.setParameter(_obj);
    }
    _.toolAddRader = function(){ //工具添加雷达
        var _self = this,viewer = _self.viewer;
        if(mouseHandlerDraw != null){
            mouseHandlerDraw.destroy();
            mouseHandlerDraw = null;
        }
        mouseHandlerDraw = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
        CesiumTooltip.initTool(viewer);
        mouseHandlerDraw.setInputAction(function (movement) { //鼠标移动 
            var position = movement.endPosition;
            if (radars != null) {
                if (radars.length == 0) {
                    CesiumTooltip.showAt(position, "点击添加第一个点雷达");
                } else {
                        if (radars.length === 1) {
                            CesiumTooltip.showAt(position, "点击添加第二个雷达");
                        } else {
                            CesiumTooltip.showAt(position, "右键结束编辑");
                    }
                }
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    
        mouseHandlerDraw.setInputAction(function (movement) {//鼠标点击
            try {
                var cartesian = viewer.scene.camera.pickEllipsoid(movement.position,ellipsoid);  //提取lat lon画雷达
                if (cartesian) {
                    if(radars === null) return;
                    var cartographic = Cesium.Cartographic.fromCartesian(cartesian); //根据笛卡尔坐标获取到弧度 
                    var lon = Cesium.Math.toDegrees(cartographic.longitude); //根据弧度获取到经度 
                    var lat = Cesium.Math.toDegrees(cartographic.latitude); //根据弧度获取到纬度
                    var param = _self.getParameter(lat,lon);
                    if("spread" == switchType){
                        var radar = _cesium.addCircleScan(viewer,param);
                    }else{
                        var radar = _cesium.addRadarScan(viewer,param);
                    }
                    silhouette.add(radar);
                    radars.push(radar);
 
                  
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
        if(mouseHandlerDraw != null){
            mouseHandlerDraw.destroy();
            mouseHandlerDraw = null;
        }
        CesiumTooltip.setVisible(false);
        if(silhouette != null)silhouette.removeAll();
        radars = [];
    }


    _.createToolbar = function(){
        var toolbarparam	 = [	
            {type:"range",key:"u_radius",value:4,min:"100",max:"10000",step:"1"},
            {type:"range",key:"interval",value:10,min:"100",max:"10000",step:"1"},
            {type:"range",key:"u_scanColor",value:10,min:"0",max:"147",step:"1"}   
        ]
        var table = createToolbar(toolbarparam);
        var toolbar = 
        '<div id="toolbar">'+
        '<select class="cesium-button" onchange="CesiumRadarScan.switch(this.value);"><option value="scan">扫描型</option><option value="spread">扩散性</option></select>'+
        table +
        '<button type="button" class="cesium-button" onclick="CesiumRadarScan.toolAddRader();">添加</button>'+
        '<button type="button" class="cesium-button" onclick="CesiumRadarScan.remove();">删除</button>'+
        '<div></div>';
        $("#toolbar").remove();
        $("body").append(toolbar);
        $("#toolbar").css("background","rgba(42, 42, 42, 0.8)").css("padding","4px;").css("border-radius", "4px");
        $("#toolbar input").css("vertical-align","middle").css("padding-top","2px").css("padding-bottom","2px");
    }
    return _;
})();
	
/************************************************* CesiumRadarScan end  ************************************************** */
/************************************************* TileLonlatController start  ************************************************** */
/**
 * 地图加载经纬网
 * 调用
    TileLonlatController.init({viewer:viewer,color:new _cesiumTool({viewer:viewer}).getColor(50),show:true,alpha:0.5});
        TileLonlatController.build({handleType:"grid"});
 */
var TileLonlatController = (function(){
    var viewer,layer = null,tableparam,layers = {grid:{data:null},default:{data:null},xmlData:{data:null}};
    function _(){};
    _.init = function (param,flag){
        if(null === param || undefined === param)return;
        var t = this;
        for(var key in param){
            t[key] = param[key];
        }
        if(flag)this.build();
    }
    _.setParameter = function(obj){
        var _self = this;
        _self.color = obj.color == null ?_self.color:obj.color;
        _self.alpha =  obj.alpha == null ?_self.alpha:obj.alpha;
        _self.show =  obj.show == null ?_self.show:obj.show;
    }
    _.getParameter = function(param){
            return this[param];
    }
    _.config = function(){
        var _self = this;
        try{
            _self.createtoolbar();
            var subscribeParameter = function(name) {
                Cesium.knockout.getObservable(viewModel, name).subscribe(
                    function(newValue) {
                        _self.controller({key:name,value:newValue});
                    }
                );
            }
            var viewModel = {
                hue : _self.getParameter("hue"),
                brightness : 1,
                contrast : 1,
                alpha : 1
            };
            Cesium.knockout.track(viewModel);
            var toolbar = document.getElementById('toolbar');
            Cesium.knockout.applyBindings(viewModel, toolbar);
            subscribeParameter('hue');
            subscribeParameter('brightness');
            subscribeParameter('contrast');
            subscribeParameter('alpha');
         } catch (error) {
            console.log(error);
        }
    }
    _.build = function(){
        viewer = this.viewer;
        try {       
            switch(this.handleType){
                case "grid":{this.createGrid();break;}
                case "mgrs":{this.createMgrs();break;}
                default:{this.createDefault();}
            }
            if(this.flag)this.config();
        } catch (error) {
            console.log(error);
        }
    }
    _.initController = function(name){
        var _self = this;
        layer.alpha = _self.getParameter("alpha");
        layer.show = _self.getParameter("show");
        layer.colorToAlpha = _self.getParameter("color");
        layer.name = name;
    }
    _.controller = function(obj){
        var _self = this,key = obj.key,value = parseFloat(obj.value);
        if(layer === null && obj === null) return;
        layer[key] = value;
    }
    _.createGrid = function(){
        var mapGrid = new Cesium.GridImageryProvider();
        var imageryLayers = viewer.imageryLayers;
        layer = imageryLayers.addImageryProvider(mapGrid);//添加注记图层
        layers.grid.data = layer;
        imageryLayers.raiseToTop(layer);       //将注记图层置顶
        if(this.flag)this.initController("grid");

    }
    _.createMgrs = function(){
      /* var mapMgrs = new Cesium.WebMapServiceImageryProvider({

            url: 'http://localhost:8080/geoserver/shp/wms',

            layers: 'shp:mgrs_index_ftp_link',

            parameters: {
                service: 'WMS',

                format: 'image/png',

                transparent: true,
            }

        });

        layer = viewer.imageryLayers.addImageryProvider(mapMgrs);
        viewer.imageryLayers.raiseToTop(layer);       //将注记图层置顶*/
        
       var options = {camera : viewer.scene.camera,canvas : viewer.scene.canvas};
       layers.xmlData.data = Cesium.KmlDataSource.load("../common/3d/data/EarthPointGrid_093357.kml", options);
       layers.xmlData.data.then(function(dataSource){
            layers.xmlData.data = dataSource;
            viewer.dataSources.add(layers.xmlData.data);
       });
       if(this.flag)this.initController("mgrs");

    }
    _.createDefault = function(){
        var mapLonlat = new TileLonlatsImageryProvider();
        var imageryLayers = viewer.imageryLayers;
        layer = imageryLayers.addImageryProvider(mapLonlat);//添加注记图层
        layers.default.data = layer;
        imageryLayers.raiseToTop(layer);       //将注记图层置顶
        if(this.flag)this.initController("titleImg");
    }
    _.initSelect = function(){ //创建默认初始化数据
        tableparam	 = [	
            {id:"_ids1",type:"text",key:"alpha",value:1,code:"alpha"},
            {id:"_ids2",type:"text",key:"hue",value:1,code:"hue"},
            {id:"_ids3",type:"text",key:"brightness",value:1,code:"brightness"},
            {id:"_ids4",type:"text",key:"contrast",value:1,code:"contrast"}
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
            alpha:selectData[0].value,
            hue:selectData[1].value,
            brightness:selectData[2].value,
            contrast:selectData[3].value,
            show:true
       }
       return initData;

    }
    _.switch = function(type){
        viewer.imageryLayers.remove(layer);
        if("grid" == type){
            this.createGrid();
        }else if("mgrs" == type){
            this.createMgrs();
        }else{
            this.createDefault();
        }
    }
    _.remove = function(){
        if(layer != null)viewer.imageryLayers.remove(layer);
        if(layers.xmlData.data != null){viewer.dataSource.remove(layers.xmlData.data);};
    }
    _.removeType = function(type,flag){
        if('0' == flag){
            if(layers[type].data != null)viewer.imageryLayers.remove(layers[type].data);
        }else{
            console.log(123);
            viewer.dataSources.remove(layers.xmlData.data);
        }
       
    }
    _.createtoolbar = function (){
        var toolbarparam = [	
            {type:"range",key:"hue",value:1,min:"0",max:"2",step:"0.1"},
            {type:"range",key:"brightness",value:10,min:"0",max:"2",step:"0.1"},
            {type:"range",key:"contrast",value:10,min:"0",max:"2",step:"0.1"},
            {type:"range",key:"alpha",value:10,min:"0",max:"2",step:"0.1"}      
        ]
        var table = createToolbar(toolbarparam);
        var toolbar = 
        '<div id="toolbar">'+
        '<select class="cesium-button" onchange="TileLonlatController.switch(this.value);"><option value="grid">grid</option><option value="title">title</option><option value="mgrs">mgrs</option></select>'+
        table + 
        '</div>';
        $("#toolbar").remove();
        $("body").append(toolbar);
        $("#toolbar").css("background","rgba(42, 42, 42, 0.8)").css("padding","4px;").css("border-radius", "4px");
        $("#toolbar input").css("vertical-align","middle").css("padding-top","2px").css("padding-bottom","2px");
    }
    return _;

})();
/************************************************* TileLonlatController end  ************************************************** */
/************************************************* weatherController end  ************************************************** */
/**
 * 加载雪花雨滴
 * param snow rain
 */
var weatherController = (function () {
    var viewer,scene,System = null;
    function _(){}
    _.init = function(param,flag){
         if(null === param || undefined === param)return;
         var t = this;
         for(var key in param){
             t[key] = param[key];
         }
 
         this.config();
 
         if(flag)this.build({type:t.type});
       
    }
    _.config = function(){
       var _self = this;
       var scene = _self.viewer.scene;
       scene.globe.depthTestAgainstTerrain = true;
       var resetCameraFunction = function() {
             scene.camera.setView({
                destination : new Cesium.Cartesian3(277096.634865404, 5647834.481964232, 2985563.7039122293),
                orientation : {
                   heading : 4.731089976107251,
                   pitch : -0.32003481981370063
                }
             });
       };
       resetCameraFunction();
       this.initController();
    }
    _.build = function(param){
       var obj = null;
       viewer = this.viewer,scene = viewer.scene;
       switch(param.type){
          case "snow":{
             obj = this.createSnow();
             break;
          }
          case "rain":{
             obj = this.createRain();
             break;
          }
       }
       return obj;
    }
    _.switch = function(node){
          this.remove();
         if("snow" == node){
             this.createSnow();
         }else{
             this.createRain();
         }
    }
    _.createSnow = function(){
        try {
            var t = this;
             // snow
             var snowParticleSize = scene.drawingBufferWidth / t.size
             var snowRadius = t.speed;  //速度 
             var minimumSnowImageSize = new Cesium.Cartesian2(snowParticleSize, snowParticleSize);
             var maximumSnowImageSize = new Cesium.Cartesian2(snowParticleSize * 2.0, snowParticleSize * 2.0);
             var snowGravityScratch = new Cesium.Cartesian3();
             var snowUpdate = function(particle, dt) {
                 snowGravityScratch = Cesium.Cartesian3.normalize(particle.position, snowGravityScratch);
                 Cesium.Cartesian3.multiplyByScalar(snowGravityScratch, Cesium.Math.randomBetween(-30.0, -300.0), snowGravityScratch);
                 particle.velocity = Cesium.Cartesian3.add(particle.velocity, snowGravityScratch, particle.velocity);
 
                 var distance = Cesium.Cartesian3.distance(scene.camera.position, particle.position);
                 if (distance > snowRadius) {
                     particle.endColor.alpha = 0.0;
                 } else {
                     particle.endColor.alpha = System.endColor.alpha / (distance / snowRadius + 0.1);
                 }
             };
 
             System = new Cesium.ParticleSystem({
                 modelMatrix : new Cesium.Matrix4.fromTranslation(scene.camera.position),
                 minimumSpeed : -1.0,
                 maximumSpeed : 0.0,
                 lifetime : 15.0,
                 emitter : new Cesium.SphereEmitter(snowRadius),
                 startScale : 0.5,
                 endScale : 1.0,
                 image : '../Apps/SampleData/snowflake_particle.png',
                 color : getColor(t.color),   //颜色
                 emissionRate : 7000.0,
                 startColor : Cesium.Color.WHITE.withAlpha(0.0),
                 endColor : Cesium.Color.WHITE.withAlpha(1.0),
                 minimumImageSize : minimumSnowImageSize,
                 maximumImageSize : maximumSnowImageSize,
                 updateCallback : snowUpdate
             });
             scene.primitives.add(System);
             scene.skyAtmosphere.hueShift = -0.8;
             scene.skyAtmosphere.saturationShift = -0.7;
             scene.skyAtmosphere.brightnessShift = -0.33;
             scene.fog.density = 0.001;
             scene.fog.minimumBrightness = 0.8;

        } catch (error) {
         console.log(error);
        }
    }
    _.createRain = function(){
        try {
             var t = this;
            // rain
             var rainParticleSize = scene.drawingBufferWidth / t.size;
             var rainRadius = t.speed;
             var rainImageSize = new Cesium.Cartesian2(rainParticleSize, rainParticleSize * 2.0);
 
             var rainGravityScratch = new Cesium.Cartesian3();
             var rainUpdate = function(particle, dt) {
                 rainGravityScratch = Cesium.Cartesian3.normalize(particle.position, rainGravityScratch);
                 rainGravityScratch = Cesium.Cartesian3.multiplyByScalar(rainGravityScratch, -1050.0, rainGravityScratch);
 
                 particle.position = Cesium.Cartesian3.add(particle.position, rainGravityScratch, particle.position);
 
                 var distance = Cesium.Cartesian3.distance(scene.camera.position, particle.position);
                 if (distance > rainRadius) {
                     particle.endColor.alpha = 0.0;
                 } else {
                     particle.endColor.alpha = System.endColor.alpha / (distance / rainRadius + 0.1);
                 }
             };
 
             System = new Cesium.ParticleSystem({
                 modelMatrix : new Cesium.Matrix4.fromTranslation(scene.camera.position),
                 speed : -1.0,
                 lifetime : 15.0,
                 emitter : new Cesium.SphereEmitter(rainRadius),
                 startScale : 1.0,
                 endScale : 0.0,
                 image : '../Apps/SampleData/circular_particle.png',
                 color : getColor(t.color),
                 emissionRate : 9000.0,
                 startColor :new Cesium.Color(0.27, 0.5, 0.70, 0.0),
                 endColor : new Cesium.Color(0.27, 0.5, 0.70, 0.98),
                 imageSize : rainImageSize,
                 updateCallback : rainUpdate
             });
             scene.primitives.add(System);
             scene.skyAtmosphere.hueShift = -0.97;
             scene.skyAtmosphere.saturationShift = 0.25;
             scene.skyAtmosphere.brightnessShift = -0.4;
             scene.fog.density = 0.00025;
             scene.fog.minimumBrightness = 0.01; 
        } catch (error) {
            console.log(error);
        }
    }
 
    _.initSelect = function(){
     tableparam = [
         {id:"_ids1",type:"select",key:"type",value:['snow','rain'],code:['snow','rain']},
         {id:"_ids2",type:"text",key:"height",value:500000,code:"height"},
         {id:"_ids3",type:"text",key:"lon",value:114.302312702,code:"lon"},
         {id:"_ids4",type:"text",key:"lat",value:30.598026044,code:"lat"},
         {id:"_ids5",type:"text",key:"size",value:100.0,code:"size"},
         {id:"_ids6",type:"text",key:"color",value:20,code:"color"},
         {id:"_ids7",type:"text",key:"speed",value:10000.0,code:"speed"}
     ]
     var table = createTable(tableparam);
     $("#content").empty().append(table);
     $("#content select,input").css("width","200px");
 
 }
 _.select = function(viewer){
     if(tableparam.length == 0)return;
     var selectData = [];
     for(var i in tableparam){
         var val = $('#_ids'+(parseInt(i)+1)).val();
         selectData.push({id:'_ids'+(parseInt(i)+1),code:tableparam[i].key,value:val});
     }
     var initData = {
          viewer:viewer,
          type:selectData[0].value,
          height:parseInt(selectData[1].value),
          lon:parseFloat(selectData[2].value),
          lat:parseFloat(selectData[3].value),
          size:parseInt(selectData[4].value),
          color:parseFloat(selectData[5].value),
          speed:parseFloat(selectData[6].value)
     }
     return initData;
     }
     _.show = function(){
         System.show = !System.show;
         
     }
     _.remove = function(){
         if(System != null)System.destroy();
         System = null;
     } 
     _.initController = function (){
         var _self = this;
         _self.createToolbar();
         var subscribeParameter = function(name) {
             Cesium.knockout.getObservable(viewModel, name).subscribe(
                 function(newValue) {
                     _self.controller({key:name,value:newValue});
                 }
             );
         }
         var viewModel = {
             color: 20,
             emitter: 10000
         };
         Cesium.knockout.track(viewModel);
         var toolbar = document.getElementById('toolbar');
         Cesium.knockout.applyBindings(viewModel, toolbar);
         subscribeParameter('color');
         subscribeParameter('emitter');
     }
     //外部控制节点
     _.controller = function (obj){
         if(obj === null & obj === "")return;
         var key = obj.key,value = parseInt(obj.value);
         if("emitter" == key)System._emitter._radius = value;
         if("color" == key){System._startColor = getColor(value);System._endColor = getColor(value)};
 
     }
    _.createToolbar = function (){
         var toolbarparam = [
             {type:"range",key:"color",value:1,min:"0",max:"147",step:"1"},
             {type:"range",key:"emitter",value:1,min:"10000",max:"500000",step:"10000"} 
         ]
         var table = createToolbar(toolbarparam);
         var toolbar = 
         '<div id="toolbar">'+
         '<select class="cesium-button" onchange="weatherController.switch(this.value);"><option value="snow">雪花</option><option value="rain">雨滴</option></select>'+
         table +
         '<button type="button" class="cesium-button" onclick="weatherController.show();">显示</button>'+
         '<button type="button" class="cesium-button" onclick="weatherController.show();">隐藏</button>'+
         '</div>';
         $("#toolbar").remove();
         $("body").append(toolbar);
         $("#toolbar").css("background","rgba(42, 42, 42, 0.8)").css("padding","4px;").css("border-radius", "4px");
         $("#toolbar input").css("vertical-align","middle").css("padding-top","2px").css("padding-bottom","2px");
     }
    return _;
 })();

 /************************************************* weatherController end  ************************************************** */
 
 /************************************************* CesiumHeatMap start    ***************************************************** */
  /***
   * 热力图
   * @author zhangti
   * @CesiumHeatmap  CesiumHeatmap热力图
   * @CesiumHeatmapGL CesiumHeatmapGL热力图
   * @dataType wfs geojson
   * @version v1
   */
   
  var CesiumHeatMap = (function (){
	var viewer,heatmap = null,cacheData =null,tableparam;
	function _(){}
	_.init = function(param,flag){
		if(param === null && param === "")return;
		var t = this;
		for(var key in param){
			t[key] = param[key];
		}
        if(flag)CesiumHeatMap.build(param);
        if(param.flag)this.config();
	}
	
	_.config = function(){
		var _self = this;
		try{
			_self.createtoolbar();
			var subscribeParameter = function(name) {
				Cesium.knockout.getObservable(viewModel, name).subscribe(
					function(newValue) {
						_self.controller({key:name,value:newValue});
					}
				);
			}
			var viewModel = {
				alpha : 1
			};
			Cesium.knockout.track(viewModel);
			var toolbar = document.getElementById('toolbar');
			Cesium.knockout.applyBindings(viewModel, toolbar);
			subscribeParameter('alpha');
		 } catch (error) {
			console.log(error);
        }
        this.click();
	}
	_.build = function(param){
		var t = this;heatmap = null,cacheData = null;
		switch(param.handleType){
			 case "CesiumHeatmap":{ 
            if (heatmap == null) {
               heatmap = new CesiumHeatmap(t.viewer, param.datas)
            };
            break; 
        }
        default:{
			  if (heatmap == null) {
				heatmap = new CesiumHeatmapGL(t.viewer, param.datas)
			  };
			}
		}
    cacheData = param.datas;
		return heatmap;
  }
  _.click = function(){
    var _self = this,handler = new Cesium.ScreenSpaceEventHandler(_self.viewer.scene.canvas);
    handler.setInputAction(function(movement) {
        try {
            _PopController.init({
              x:movement.position.x,
              y:movement.position.y
          });
          _PopController.show()
        } catch (error) {
            console.log(error);
        }
       
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  }
	_.switch = function(type){
		if(cacheData == null )return;
		var t = this;
		try{
			t.show(2);
			if("heatmap" == type){
				 heatmap = new CesiumHeatmap(t.viewer, cacheData)
			}else{
				 heatmap = new CesiumHeatmapGL(t.viewer,cacheData)
			}
		}catch(e){
			console.log(e);
		}
		return heatmap;
  }
  _.initSelect = function(){
    tableparam = [
        {id:"_ids1",type:"select",key:"handleType",value:["CesiumHeatmapGL","CesiumHeatmap"],code:["CesiumHeatmapGL","CesiumHeatmap"]},
        {id:"_ids2",type:"select",key:"type",value:["url","wfs"],code:["url","wfs"]},
        {id:"_ids3",type:"select",key:"obj",value:['../common/3d/data/busstop2016.geojson'],code:['../common/3d/data/busstop2016.geojson']} 
    ]
    var table = createTable(tableparam);
    $("#content").empty().append(table);
    $("#content select,input").css("width","200px");

  }
  _.select = function(viewer){
      if(tableparam.length == 0)return;
      var selectData = [];
      for(var i in tableparam){
          var val = $('#_ids'+(parseInt(i)+1)).val();
          selectData.push({id:'_ids'+(parseInt(i)+1),code:tableparam[i].key,value:val});
      }
      var initData = {
          viewer:viewer,
          handleType:selectData[0].value,
          datas: {
            type: selectData[1].value,
            obj : selectData[2].value
          }
      }
      return initData;
  } 
	_.controller = function(obj){
		heatmap.multiply(parseFloat(obj.value));
	}
	_.remove = function(){
    if(heatmap == null)return;
        //heatmap.clear();
        heatmap.none();
	}
	_.show = function(n){
		if(n === 1){
			heatmap.show();
		}else{
			heatmap.none();
		}
	}
	_.createtoolbar = function (){
    var toolbarparam	 = [	
        {type:"range",key:"alpha",value:4,min:"0.01",max:"2",step:"0.01"}, 
    ]
    var table = createToolbar(toolbarparam);
            var toolbar = 
            '<div id="toolbar">'+
			'<select class="cesium-button" onchange="CesiumHeatMap.switch(this.value);"><option value="heatmapGl">heatmapGl</option><option value="heatmap">heatmap</option></select>'+
      table +  
			'<button type="button" class="cesium-button" onclick="CesiumHeatMap.show(1);">显示</button>'+
			 '<button type="button" class="cesium-button" onclick="CesiumHeatMap.show(2);">隐藏</button>'+
            '</div>';
            $("#toolbar").remove();
            $("body").append(toolbar);
            $("#toolbar").css("background","rgba(42, 42, 42, 0.8)").css("padding","4px;").css("border-radius", "4px");
            $("#toolbar input").css("vertical-align","middle").css("padding-top","2px").css("padding-bottom","2px");
        }
    return _;	 
 })();

  /************************************************* CesiumHeatMap end    ***************************************************** */
    /************************************************* CesiumMoveScan start    ***************************************************** */
 /***
 * 物体移动扫描
 * 
 * data={
                circle:[0.003,117,35,30]// 第一个参数 0.003表示半径，第二个第三个分别表示底座圆心的坐标,第四个表示切割成多少个点。组成多少个面。越多会越卡 尽量实际项目不影响效果，越少越好。
               ,observer:[117.01,35.01,500]//观察点，也就是光源点
               ,positionList:[ //我们这里就不加高度了。不然太麻烦了 //以圆心为参考做偏移值获取，圆心坐标 [117,35]，简单点画个正方形吧 如果画圆的画，也可以多取点
                   [117,35],//初始位置 (圆心坐标 [117,35]要和这个初始位置统一，不然会偏移出去)
                   [117.01,35], //下一个点
                   [117.01,35.01],
                   [117,35.01],
                   [117,35],//回来
               ]
               ,material:Cesium.Color.RED.withAlpha(0.5)//光的材质
               ,number:100//数字越小速度越快
           };
 * 
 * 
 * 
 */
var CesiumMoveScan = (function(){
    var viewer,entityCList,operation,data,boxentity,glowingLine;
    function _(){};
    
    _.init = function(param,flag){
        if(param == null && param == "")return ;
        var t = this;
        for(var key in param){
            
            t[key] = param[key];
        }
		
        if(flag)this.config();
        
    }
    
    _.config = function(){
		var t = this,_color = getColor(t.color);
		$.get(this.source,{},function(json){
			console.log(json);
			data = json;
			data.material = _color.withAlpha(0.5);
			data.number = t.number;
			t.build({type:"json"});
			
			t.initController();
		});
    }
    
    _.build = function(param){
        if(param == null && param == "")return;
        viewer = this.viewer;
        switch(param.type){
            case "czml":{this.createCzml();break;}
			case "json":{this.create();break;}
        }
        
        
    }
    _.create = function(){
		if(data == null && data =="")return;
		try{
			entityCList= _cesium.createLightScan(viewer,data); //返回的是所有面的数组 如果需要清除的画，就通过此清除
			this.createEntity();
			this.createLine();
			viewer.zoomTo(viewer.entities);
		}catch(e){
			console.log(e);
		}
         
        
    }
    _.createCzml = function(){
        var _slef = this,entityCList=[];;
         viewer.dataSources.add(Cesium.CzmlDataSource.load('./sacn.czml')).then(function(ds) {
              //锁定视角为当前模型
               var model =ds.entities.getById('path');
               //追光data
               var data={
                   circle:[0.003,117,35,30]// 第一个参数 0.003表示半径，第二个第三个分别表示底座圆心的坐标,第四个表示切割成多少个点。组成多少个面。越多会越卡 尽量实际项目不影响效果，越少越好。
                   ,observer:[117.01,35.01,500]//观察点，也就是光源点
                   ,material:Cesium.Color.RED.withAlpha(0.5)//光的材质
               };
               
               operation={
                   addIt:function () {
                       entityCList=_cesium.createLightScanFollowEntity(viewer,data,model); //返回的是所有面的数组 如果需要清除的画，就通过此清除
                   },
                   deleteIt:function () {
                       //清除追光
                       for(var i=0;i< entityCList.length;i++){
                           viewer.entities.remove(entityCList[i]);
                       }
                   }
                   ,show:function () {
                       model.billboard.show=true
                   }
                   ,hide:function () {
                       model.billboard.show=false
                   }
                   ,remove:function () {
                       viewer.dataSources.remove(ds);
                   }
               };
             
               _slef.createEntity();
               _slef.createLine();
               viewer.zoomTo(viewer.entities);
       });
        
        
    }
    _.createEntity = function(){
         //立方体柱子 表示站台
         boxentity = viewer.entities.add({
               position : Cesium.Cartesian3.fromDegrees(this.lon,this.lat,this.height/2),
               name:"",
               box : {
                   dimensions : new Cesium.Cartesian3(100.0, 100.0,data.observer[2]),
                   outline : true,
                   outlineColor : Cesium.Color.WHITE,
                   outlineWidth : 2,
                   material : Cesium.Color.fromRandom({alpha : 0.5})
               }
           });
        
    }
    
    _.createLine = function(){
        //发蓝光的线
          glowingLine = viewer.entities.add({
               name : 'Glowing blue line on the surface',
               polyline : {
                   positions : Cesium.Cartesian3.fromDegreesArray(
                       [
                           data.positionList[0][0],data.positionList[0][1],
                           data.positionList[1][0],data.positionList[1][1],
                           data.positionList[2][0],data.positionList[2][1],
                           data.positionList[3][0],data.positionList[3][1],
                           data.positionList[4][0],data.positionList[4][1]
                       ]),
                   width : 10,
                   material : new Cesium.PolylineGlowMaterialProperty({ //发光线
                       glowPower : 0.2,
                       color : Cesium.Color.BLUE
                   })
               }
           });
        
    }
    _.initSelect = function(){ //创建默认初始化数据
        tableparam	 = [	
            {id:"_ids1",type:"select",key:"type",value:["json","czml"],code:["json","czml"]},
            {id:"_ids2",type:"select",key:"source",value:["../common/3d/data/moveScan.json"],code:["../common/3d/data/moveScan.json"]},
			{id:"_ids3",type:"text",key:"lon",value:117.01,code:"lon"},
			{id:"_ids4",type:"text",key:"lat",value:35.01,code:"lat"},
			{id:"_ids5",type:"text",key:"height",value:500,code:"height"},
            {id:"_ids6",type:"text",key:"color",value:82,code:"color"},
			{id:"_ids7",type:"text",key:"number",value:100,code:"number"}
            
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
            source:selectData[1].value,
            lon:parseFloat(selectData[2].value),
            lat:parseFloat(selectData[3].value),
            height:parseFloat(selectData[4].value),
			color:parseFloat(selectData[5].value),
			number:parseFloat(selectData[6].value)
       }
       return initData;

    }
    _.show = function(node){
        var t = this,name = $(node).attr("value");
        if("smw" == name){
        if(entityCList.length == 0 )return ;
        for(var i=0;i< entityCList.length;i++){
            entityCList[i].show = !entityCList[i].show;
        }
        }else if("glowingLine" == name){
            glowingLine.show = !glowingLine.show;
        }else if("boxentity"){
            boxentity.show = !boxentity.show;
        }
    }
	 _.initController = function (){
         var _self = this;
         _self.createToolbar();
         var subscribeParameter = function(name) {
             Cesium.knockout.getObservable(viewModel, name).subscribe(
                 function(newValue) {
                     _self.controller({key:name,value:newValue});
                 }
             );
         }
         var viewModel = {
             color: 20,
             number: 100
         };
         Cesium.knockout.track(viewModel);
         var toolbar = document.getElementById('toolbar');
         Cesium.knockout.applyBindings(viewModel, toolbar);
         subscribeParameter('color');
         subscribeParameter('number');
     }
     //外部控制节点
     _.controller = function (obj){
         if(obj === null & obj === "")return;
         var key = obj.key,value = parseInt(obj.value);
		 if(entityCList.length == 0)return;
		 for(var i in entityCList){
			  if("color" == key){ var _color = getColor(value);entityCList[i]._polygon._outlineColor = _color.withAlpha(0.5);}
		 }  
 
     }
    _.createToolbar = function (){
         var toolbarparam = [
             {type:"range",key:"color",value:1,min:"0",max:"147",step:"1"},
             {type:"range",key:"number",value:1,min:"10",max:"200",step:"100"} 
         ]
         var table = createToolbar(toolbarparam);
         var toolbar = 
         '<div id="toolbar">'+
         '<button type="button" class="cesium-button" onclick="CesiumMoveScan.show(this);" value="smw">扫描物</button>'+
         '<button type="button" class="cesium-button" onclick="CesiumMoveScan.show(this);" value="glowingLine">扫描光</button>'+
         '<button type="button" class="cesium-button" onclick="CesiumMoveScan.show(this);" value="boxentity">柱体</button>'+
         '</div>';
         $("#toolbar").remove();
         $("body").append(toolbar);
         $("#toolbar").css("background","rgba(42, 42, 42, 0.8)").css("padding","4px;").css("border-radius", "4px");
         $("#toolbar input").css("vertical-align","middle").css("padding-top","2px").css("padding-bottom","2px");
     }
    _.remove = function(){
        if(viewer == null || viewer == undefined )return ;
        for(var i=0;i< entityCList.length;i++){
               viewer.entities.remove(entityCList[i]);
        }
        viewer.entities.remove(glowingLine)
        ,viewer.entities.remove(boxentity);
    }
    return _;
})(); 
 /************************************************* CesiumMoveScan end    ***************************************************** */
 
 /************************************************* layesSpiltController start    ***************************************************** */
 /**
 * 分割半球
 * 白天黑夜
 */
var layesSpiltController = (function () {

    function _(){};
    _.init = function(){
 
      
       var _self = this;
       moveActive = false;
       slider = null;
       this.config();
       
    }
    _.config = function(){
       var _self = this;
       var layers = viewer.imageryLayers;
       var earthAtNight = layers.addImageryProvider(new Cesium.IonImageryProvider({ assetId: 3812 }));
       earthAtNight.splitDirection = Cesium.ImagerySplitDirection.LEFT; // Only show to the left of the slider.
 
    }
    _.move = function(movement){
       var _self = this,slider = _self.slider;
       if(!moveActive) {
             return;
       }
       var relativeOffset = movement.endPosition.x ;
       var splitPosition = (slider.offsetLeft + relativeOffset) / slider.parentElement.offsetWidth;
       slider.style.left = 100.0 * splitPosition + '%';
       viewer.scene.imagerySplitPosition = splitPosition;
    }
 
    _.initHandler = function(param){
       var _self = this,_moveActive = _self.moveActive;
       // Sync the position of the slider with the split position
       _self.slider = document.getElementById('slider');
       _self.viewer.scene.imagerySplitPosition = (slider.offsetLeft) / slider.parentElement.offsetWidth;
       var handler = new Cesium.ScreenSpaceEventHandler(slider);
       handler.setInputAction(function() {
          moveActive = true;
      }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
      handler.setInputAction(function() {
          moveActive = true;
      }, Cesium.ScreenSpaceEventType.PINCH_START);
      
      handler.setInputAction(move, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
      handler.setInputAction(move, Cesium.ScreenSpaceEventType.PINCH_MOVE);
      
      handler.setInputAction(function() {
          moveActive = false;
      }, Cesium.ScreenSpaceEventType.LEFT_UP);
      handler.setInputAction(function() {
          moveActive = false;
      }, Cesium.ScreenSpaceEventType.PINCH_END);
    }
 })();
  /************************************************* layesSpiltController end    ***************************************************** */
    /************************************************* CesiumRadar start    ***************************************************** */
  /***
 * cesium 地面雷达
 * @author zhangti
 * @version v1
 */
var CesiumRadar1 = (function(){
    var viewer,_raderData = null;
    function _(){};
    
    _.init = function(param){
        if(null === param || undefined === param)return;
        var t = this;
        for(var key in param){
            t[key] = param[key];
        }
        if(t.showtoolbar){
            t.config();
        }

    }
    _.build = function(param){
        var t = this;
        if(param === null) return;
        viewer = this.viewer;
        switch(param.handleType){
            case "":{ break; }
            default :{t.loadKml(param); }
        }

    }
    _.config = function(){
        this.createToolbar(); //创建toolbar
        var t = this,dataSource = this._raderData;
        var viewModel = {
            pixelRange: t.pixelRange,
            minimumClusterSize: t.minimumClusterSize
        };
        Cesium.knockout.track(viewModel);
        var toolbar = document.getElementById('toolbar');
        Cesium.knockout.applyBindings(viewModel, toolbar);
    
        var  subscribeParameter = function(name) {
            Cesium.knockout.getObservable(viewModel, name).subscribe(
                function(newValue) {
                    dataSource.clustering[name] = newValue;
                }
            );
        }
        subscribeParameter('pixelRange');
        subscribeParameter('minimumClusterSize'); 
    }

    _.setPixelRange = function(value){
        if(value  == "" && value == null)return;
        this._raderData.clustering.pixelRange = value;
        this.customStyle();
    }

    _.customStyle = function(){
        var t = this,dataSource = this._raderData,removeListener,singleDigitPins = new Array(8);
        var pinBuilder = new Cesium.PinBuilder();
        var pin50 = pinBuilder.fromText('50+', Cesium.Color.RED, 48).toDataURL();
        var pin40 = pinBuilder.fromText('40+', Cesium.Color.ORANGE, 48).toDataURL();
        var pin30 = pinBuilder.fromText('30+', Cesium.Color.YELLOW, 48).toDataURL();
        var pin20 = pinBuilder.fromText('20+', Cesium.Color.GREEN, 48).toDataURL();
        var pin10 = pinBuilder.fromText('10+', Cesium.Color.BLUE, 48).toDataURL();
        for (var i = 0; i < singleDigitPins.length; ++i) {
            singleDigitPins[i] = pinBuilder.fromText('' + (i + 2), Cesium.Color.VIOLET, 48).toDataURL();
        }
      
        if (Cesium.defined(removeListener)) {
            removeListener();
            removeListener = undefined;
        } else {
            removeListener = dataSource.clustering.clusterEvent.addEventListener(function(clusteredEntities, cluster) {
                cluster.label.show = false;
                cluster.billboard.show = true;
                cluster.billboard.id = cluster.label.id;
                cluster.billboard.verticalOrigin = Cesium.VerticalOrigin.BOTTOM;

                if (clusteredEntities.length >= 50) {
                    cluster.billboard.image = pin50;
                } else if (clusteredEntities.length >= 40) {
                    cluster.billboard.image = pin40;
                } else if (clusteredEntities.length >= 30) {
                    cluster.billboard.image = pin30;
                } else if (clusteredEntities.length >= 20) {
                    cluster.billboard.image = pin20;
                } else if (clusteredEntities.length >= 10) {
                    cluster.billboard.image = pin10;
                } else {
                    cluster.billboard.image = singleDigitPins[clusteredEntities.length - 2];
                }
            });
        }
        // force a re-cluster with the new styling
        var pixelRange = dataSource.clustering.pixelRange;
        dataSource.clustering.pixelRange = 0;
        dataSource.clustering.pixelRange = pixelRange;
    }

    _.createToolbar = function(){
        var toolbarparam = [
            {type:"range",key:"pixelRange",value:10,min:1,max:200,step:2},
            {type:"range",key:"minimumClusterSize",value:10,min:2,max:200,step:2}  
        ]
       var table = createToolbar(toolbarparam);
        var toolbar = '<div id="toolbar">'+
        table +
        '<button type="button" class="cesium-button"><label style="pointer-events: none;"><input type="checkbox" style="pointer-events: none;">Enabled</label></button>'+
        '<button type="button" class="cesium-button"><label style="pointer-events: none;"><input type="checkbox" style="pointer-events: none;">Custom Styling</label></button>'+
    '<div></div>';
    $("#toolbar").remove();
    $("body").append(toolbar);
    $("#toolbar").css("background: rgba(42, 42, 42, 0.8);padding: 4px;border-radius: 4px;")
    $("#toolbar input").css("vertical-align: middle;padding-top: 2px;padding-bottom: 2px;");

    }
    _.clear = function(){
        var t = this;
        if(t._raderData == null)return;
        viewer.dataSources.remove(t._raderData);
        //t._raderData.show = false;
    }

    _.loadKml = function(param){
        var t = this,kml = param.kml,options = {camera : t.viewer.scene.camera,canvas : t.viewer.scene.canvas};
        var dataSourcePromise = viewer.dataSources.add(Cesium.KmlDataSource.load(kml, options));
        dataSourcePromise.then(function(dataSource) {
            if(dataSource != null){
                try {
                    dataSource.clustering.enabled = true;
                    dataSource.clustering.pixelRange = t.pixelRange;
                    dataSource.clustering.minimumClusterSize = t.minimumClusterSize;
                    t._raderData = dataSource;
                    t.customStyle();
                } catch (error) {
                    console.log("error mannager:"+ error);
                }
            }
        });
    }
    return _;
})();
 /************************************************* CesiumRadar end    ***************************************************** */

/************************************************* CesiumElevation start    ***************************************************** */
var CesiumElevation = (function(){
        var isLoadTerrain = true;
        var ellipsoidTerrainProvider = new Cesium.EllipsoidTerrainProvider();
        var elevationRamp = [0.0, 0.045, 0.1, 0.15, 0.37, 0.54, 1.0];
        var slopeRamp = [0.0, 0.29, 0.5, Math.sqrt(2) / 2, 0.87, 0.91, 1.0];
        var imageryLayers,_contourColor;
        var contourUniforms = {};
        var shadingUniforms = {};
        var hasContour = true;//是否绘制等高线
        var selectedShading = 'elevation'; //'elevation'高程 'slope'坡度  
    
        function _(){};
    
        _.init = function(param,flag){
            if(null === param || undefined === param)return;
            var t = this;
            for(var key in param){
                t[key] = param[key];
            }
            if(flag)this.config();
        }
    
        _.config = function(){
            imageryLayers = viewer.imageryLayers;
            //viewer.terrainProvider = terrainProvider;
            viewer.scene.fog.enabled = true;
            viewer.scene.globe.enableLighting = true;
            _contourColor = getColor(this.contourColor).withAlpha(0.6).clone();
    
            updateMaterial();
    
            this.createtoolbar();
        }
       
        _.switch = function(value){
            if(value == "" || value == null)return;
            switch (value) {
                    case 1:
                        viewer.camera.setView({
                            destination: Cesium.Cartesian3.fromDegrees(128, 42, 30000)
                        });
                        break;
    
                    case 2:
                        if (isLoadTerrain) {
                            viewer.terrainProvider = ellipsoidTerrainProvider;
                            isLoadTerrain = false;
                        } else {
                            viewer.terrainProvider = terrainProvider;
                            isLoadTerrain = true;
                        }
                        break;
                    case 3:
                        for (var i = 0; i < imageryLayers.length; i++) {
                            imageryLayers.get(i).show = !imageryLayers.get(i).show;
                        }
                        break;
                    case 'refrash':
                        viewer.scene.debugShowFramesPerSecond = !viewer.scene.debugShowFramesPerSecond;//
                        break;
                    case 4:
                        hasContour = !hasContour;
                        updateMaterial();
                        break;
                    case 6:
                        if (selectedShading == 'elevation') {
                            selectedShading = 'slope'
                        } else {
                            selectedShading = 'elevation'
                        }
                        updateMaterial();
                        break;
                    case 5:
                        contourUniforms.color = Cesium.Color.fromRandom({ alpha: 0.7 }, _contourColor);//alpha???
                        updateMaterial();
                        break;
                }
        }
        _.remove = function(){
    
        }
        _.initSelect = function(){ //创建默认初始化数据
            tableparam	 = [
                {id:"_ids1",type:"text",key:"lon",value:128.055,code:"lat"},
                {id:"_ids2",type:"text",key:"lat",value:42.006,code:"lon"},
                {id:"_ids3",type:"text",key:"width",value:0.02,code:"width"},
                {id:"_ids4",type:"text",key:"contourColor",value:20,code:"contourColor"},
                {id:"_ids5",type:"text",key:"minHeight",value:-414.0,code:"minHeight"},
                {id:"_ids6",type:"text",key:"maxHeight",value:8777.0,code:"maxHeight"},
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
                    lon:parseInt(selectData[0].value),
                    lat:parseInt(selectData[1].value),
                    width:parseInt(selectData[2].value),
                    contourColor:parseInt(selectData[3].value),
                    minHeight:parseInt(selectData[4].value),
                    maxHeight:parseInt(selectData[5].value)
               }
               return initData;
        }
        _.createtoolbar = function (){
                var toolbar = 
                '<div id="toolbar">'+
                '<button type="button" class="cesium-button" onclick="CesiumElevation.switch(1);">定位</button>'+
                '<button type="button" class="cesium-button" onclick="CesiumElevation.switch(2);">地形</button>'+
                '<button type="button" class="cesium-button" onclick="CesiumElevation.switch(3);">影像</button>'+
                '<button type="button" class="cesium-button" onclick="CesiumElevation.switch(4);">等高线</button>'+
                '<button type="button" class="cesium-button" onclick="CesiumElevation.switch(5);">等高线颜色</button>'+
                '<button type="button" class="cesium-button" onclick="CesiumElevation.switch(6);">高程/坡度</button>'+
                '</div>';
                $("#toolbar").remove();
                $("body").append(toolbar);
                $("#toolbar").css("background","rgba(42, 42, 42, 0.8)").css("padding","4px;").css("border-radius", "4px");
                $("#toolbar input").css("vertical-align","middle").css("padding-top","2px").css("padding-bottom","2px");
        }

        function getElevationContourMaterial(){
             // Creates a composite material with both elevation shading and contour lines
             return new Cesium.Material({
                    fabric: {
                        type: 'ElevationColorContour',
                        materials: {
                            contourMaterial: {
                                type: 'ElevationContour'
                            },
                            elevationRampMaterial: {
                                type: 'ElevationRamp'
                            }
                        },
                        components: {
                            diffuse: 'contourMaterial.alpha == 0.0 ? elevationRampMaterial.diffuse : contourMaterial.diffuse',
                            alpha: 'max(contourMaterial.alpha, elevationRampMaterial.alpha)'
                        }
                    },
                    translucent: false
                });
        }
        function getSlopeContourMaterial(){
            // Creates a composite material with both slope shading and contour lines
            return new Cesium.Material({
                    fabric: {
                        type: 'SlopeColorContour',
                        materials: {
                            contourMaterial: {
                                type: 'ElevationContour'
                            },
                            slopeRampMaterial: {
                                type: 'SlopeRamp'
                            }
                        },
                        components: {
                            diffuse: 'contourMaterial.alpha == 0.0 ? slopeRampMaterial.diffuse : contourMaterial.diffuse',
                            alpha: 'max(contourMaterial.alpha, slopeRampMaterial.alpha)'
                        }
                    },
                    translucent: false
                });
    
        }
    
        function getColorRamp(selectedShading) {
                var ramp = document.createElement('canvas');
                ramp.width = 100;
                ramp.height = 1;
                var ctx = ramp.getContext('2d');
    
                var values = selectedShading === 'elevation' ? elevationRamp : slopeRamp;
    
                var grd = ctx.createLinearGradient(0, 0, 100, 0);
                grd.addColorStop(values[0], '#00000000'); //black
                grd.addColorStop(values[1], '#2747E0C8'); //blue
                grd.addColorStop(values[2], '#D33B7DC8'); //pink
                grd.addColorStop(values[3], '#D33038C8'); //red
                grd.addColorStop(values[4], '#FF9742C8'); //orange
                grd.addColorStop(values[5], '#ffd700C8'); //yellow
                grd.addColorStop(values[6], '#ffffffC8'); //white
    
                ctx.fillStyle = grd;
                ctx.fillRect(0, 0, 100, 1);
    
                return ramp;
        }
        
    
        function updateMaterial() {
                var globe = viewer.scene.globe;
                var material;
                if (hasContour) {
                    if (selectedShading === 'elevation') {
                        material = getElevationContourMaterial();
                        shadingUniforms = material.materials.elevationRampMaterial.uniforms;
                        shadingUniforms.minHeight = this.minHeight;
                        shadingUniforms.maxHeight = this.maxHeight;
                        contourUniforms = material.materials.contourMaterial.uniforms;
                    } else if (selectedShading === 'slope') {
                        material = getSlopeContourMaterial();
                        shadingUniforms = material.materials.slopeRampMaterial.uniforms;
                        contourUniforms = material.materials.contourMaterial.uniforms;
                    } else {
                        material = Cesium.Material.fromType('ElevationContour');
                        contourUniforms = material.uniforms;
                    }
                    contourUniforms.width = 2;//线宽
                    contourUniforms.spacing = 50;//等高距
                    contourUniforms.color = _contourColor;
                } else if (selectedShading === 'elevation') {
                    material = Cesium.Material.fromType('ElevationRamp');
                    shadingUniforms = material.uniforms;
                    shadingUniforms.minHeight = this.minHeight;
                    shadingUniforms.maxHeight = this.maxHeight;
                } else if (selectedShading === 'slope') {
                    material = Cesium.Material.fromType('SlopeRamp');
                    shadingUniforms = material.uniforms;
                }
                if (selectedShading !== 'none') {
                    shadingUniforms.image = getColorRamp(selectedShading);
                }
    
                globe.material = material;
            }
    
            return _;
    })();
/************************************************* CesiumElevation end    ***************************************************** */

/********************************************************  CesiumRadar2 start    ***************************************************** */
var CesiumRadar2 = (function(){
    var viewer = null,entitys = [],mouseHandlerDraw = null,ellipsoid = Cesium.Ellipsoid.WGS84;
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
        if(this.viewer == undefined && this.viewer == "")return;
        viewer = this.viewer;
        switch(this.type){
            case "radar01":{this.radarStyle01(); break;}
            case "radar02":{this.radarStyle02(); break;}
        }
        return entity;
    }
    _.initSelect = function(){ //创建默认初始化数据
        tableparam	 = [	 
            {id:"_ids1",type:"select",key:"type",value:["radar01","radar02"],code:["radar01","radar02"]},
            {id:"_ids2",type:"text",key:"lon",value:117.224,code:"lon"},
            {id:"_ids3",type:"text",key:"lat",value:31.819,code:"lat"},
            {id:"_ids4",type:"text",key:"height",value:128,code:"height"},
            {id:"_ids5",type:"text",key:"radius",value:300000,code:"radius"},
            {id:"_ids6",type:"text",key:"color",value:65,code:"color"},
            {id:"_ids7",type:"text",key:"lineColor",value:55,code:"lineColor"}
        ]
        var table = createTable(tableparam);
        $("#content").empty().append(table);
        $("#content select,input").css("width","200px");
    }
    _.radarTool = function(v){
        var t = this;
        viewer = v,t.type = 'radar01',t.height =128,t.radius = 100000,t.color = 65,t.lineColor = 55;
        if(mouseHandlerDraw != null){
            mouseHandlerDraw.destroy();
            mouseHandlerDraw = null;
        }  
        mouseHandlerDraw = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
        CesiumTooltip.initTool(viewer);
        mouseHandlerDraw.setInputAction(function (movement) { //鼠标移动 
            var position = movement.endPosition;
            if (entitys.length == 0) {
                CesiumTooltip.showAt(position, "点击添加第一个点雷达");
            } else {
                    if (entitys.length === 1) {
                        CesiumTooltip.showAt(position, "点击添加第二个雷达");
                    } else {
                        CesiumTooltip.showAt(position, "右键结束编辑");
                }
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    
        mouseHandlerDraw.setInputAction(function (movement) {//鼠标点击
            try {
                var cartesian = viewer.scene.camera.pickEllipsoid(movement.position,ellipsoid);  //提取lat lon画雷达
                if (cartesian) {
                    var cartographic = Cesium.Cartographic.fromCartesian(cartesian); //根据笛卡尔坐标获取到弧度 
                    t.lon = Cesium.Math.toDegrees(cartographic.longitude); //根据弧度获取到经度 
                    t.lat = Cesium.Math.toDegrees(cartographic.latitude); //根据弧度获取到纬度
                    t.radarStyle01();
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
            height:parseFloat(selectData[3].value),
            radius:parseFloat(selectData[4].value),
            color:parseFloat(selectData[5].value),
            lineColor:parseFloat(selectData[6].value)
       }
       return initData;
    }
    _.radarStyle02 = function(){
       
        if(viewer == undefined && viewer == null)return;
        entitys.push(new Cesium.RadarPrimitive(viewer, {
            position:Cesium.Cartesian3.fromDegrees(this.lon, this.lat, this.height),
            angle: 50,
            radius:  this.radius,
            color: getColor(this.color).withAlpha(0.4),
            lineColor: getColor(this.lineColor).withAlpha(0.4)
        }));
    }
    _.radarStyle01 = function(){
        try{
            if(viewer == undefined && viewer == null)return;
            var t = this,c1 = getColor(t.color),c2 = getColor(t.lineColor);
            var r = new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(90),
            Cesium.Math.toRadians(0),Cesium.Math.toRadians(0));
            var l = Cesium.Cartesian3.fromDegrees(t.lon, t.lat, t.height);
            entitys.push(viewer.entities.add({
                position: l,
                orientation: Cesium.Transforms.headingPitchRollQuaternion(l, r),
                rectangularSensor: new Cesium.RectangularSensorGraphics({
                    radius: t.radius,
                    xHalfAngle: Cesium.Math.toRadians(50),
                    yHalfAngle: Cesium.Math.toRadians(50),
                    material:c1.withAlpha(0.4),
                    lineColor: c2.withAlpha(0.4),
                    showScanPlane: true,
                    scanPlaneColor: c2.withAlpha(0.4),
                    scanPlaneMode: "vertical",
                    scanPlaneRate: 3,
                    showThroughEllipsoid: !1
                })
            }));
        }catch(e){
            console.log(e);
        }
    }

    _.remove = function (){
        if(entitys.length != 0)for(let i in entitys)viewer.entities.remove(entitys[i]);
    }
    return _;
})();
/********************************************************  CesiumRadar2 end    ***************************************************** */