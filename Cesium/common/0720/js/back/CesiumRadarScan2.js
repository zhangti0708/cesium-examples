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
var CesiumRadar = (function(){
    var _self = this,ellipsoid = Cesium.Ellipsoid.WGS84
    ,radars = {"scan":[],"spread":[]},mouseHandlerDraw,viewer
    ,switchType = null,silhouette;
    function _(){};
    _.init = function(param){
        if(null === param || undefined === param)return;
        var t = this;
        for(var key in param){
            t[key] = param[key];
        }
        this.config();
    }

    _.build = function(param){
        if(param == null ) return;
        var data = null;
        try {
            switch(param.handleType){
                case "spread":{ data = this.drawspread(param.datas);break; }
                case "scan":{ data = this.drawscan(param.datas);break; }
                default :{ data = this.draw(param.datas); } 
            }
        } catch (error) {
            console.log(error);
        }
            return data;
    }
    _.config = function(){
        viewer = this.viewer;
        viewer.scene.globe.depthTestAgainstTerrain = true;//显示帧数
        viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);//取消双击事件
        silhouette = viewer.scene.postProcessStages;
        this.createToolbar();
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
                radars.spread.push(radar);
            }
            this.switch(""); 
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
                radars.scan.push(radar);
            }
            console.log(radars);
            this.switch("scan"); 
        } catch (error) {
            console.log(error);
        }
        this.initController();
    }
    _.draw = function(){
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
   _.switch = function(type){
        if(radars === null)return;
        switchType = type;
        silhouette.removeAll();
        if(type  == "scan"){
            _ary.arrForEach(radars.scan,function(scan,index){
                silhouette.add(scan);
            });
           
        }else{
            _ary.arrForEach(radars.spread,function(spread,index){
                silhouette.add(spread);
            });
        }
    }
    _.initController = function (){
        var _self = this;
        new _cesiumTool({viewer:viewer}).setView({handleType:"flyTo",lat: 31.809777,lon:117.217124,d:5000}); //模拟

        var subscribeParameter = function(name) {
            Cesium.knockout.getObservable(viewModel, name).subscribe(
                function(newValue) {
                    console.log(newValue);
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
        if(_ary.arrBool(radars.scan)) return;
        var _time = (new Date()).getTime();
        var u_radius = function (maxRadius,duration) {
            return maxRadius * (((new Date()).getTime() -  _time) % duration) / duration;
        }
        _ary.arrForEach(radars.scan,function(scan,index){ //扫描
            if("u_scanColor" == key){
                scan.uniforms.u_scanColor = new _cesiumTool({viewer:viewer}).getColor(value);
                _obj = {"scanColor":new _cesiumTool({viewer:viewer}).getColor(value)}
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
        _ary.arrForEach(radars.spread,function(spread,index){ //扩散
            if("u_scanColor" == key){
                spread.uniforms.u_scanColor = new _cesiumTool({viewer:viewer}).getColor(value);
                _obj = {"scanColor":new _cesiumTool({viewer:viewer}).getColor(value)}
            };
            if("u_radius" == key){
                spread.uniforms.u_radius = u_radius(value,_self.interval);
                 _obj = {"r":value}
            };
            if("interval" == key){
                spread.uniforms.interval = value;
                 _obj = {"interval":value}
                };
        });
        this.setParameter(_obj);
    }
    _.toolAddRader = function(){ //工具添加雷达
        var _self = this,viewer = _self.viewer;
        if (mouseHandlerDraw) {
            mouseHandlerDraw.destroy();
            mouseHandlerDraw = null;
        } else {
            mouseHandlerDraw = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
        }
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
                    var spread = _cesium.addCircleScan(viewer,param);
                    var scan = _cesium.addRadarScan(viewer,param);
                    radars.scan.push(scan);
                    radars.spread.push(spread);
                    _self.switch(switchType);
                  
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
        mouseHandlerDraw = null;
        CesiumTooltip.setVisible(false);
        silhouette.removeAll();
        radars.spread = [],radars.scan = [];
    }


    _.createToolbar = function(){
        var toolbar = 
        '<div id="toolbar">'+
        '<select class="cesium-button" onchange="CesiumRadar.switch(this.value);"><option value="scan">扫描型</option><option value="spread">扩散性</option><select>'+
        '<table>'+
            '<tbody><tr>'+
               '<td>Radius</td>'+
                '<td>'+
                    '<input type="range" min="100" max="10000" step="1" data-bind="value: u_radius, valueUpdate: "input" ">'+
                    '<input type="text" size="2" data-bind="value: u_radius">'+
                '</td>'+
            '</tr>'+
            '<tr>'+
                '<td>Interval</td>'+
                '<td>'+
                    '<input type="range" min="100" max="10000" step="1" data-bind="value: interval, valueUpdate: "input" ">'+
                    '<input type="text" size="2" data-bind="value: interval">'+
                '</td>'+
           '</tr>'+
           '<tr>'+
                '<td>Color</td>'+
                '<td>'+
                    '<input type="range" min="1" max="147" step="1" data-bind="value: u_scanColor, valueUpdate: "input" ">'+
                    '<input type="text" size="2" data-bind="value: u_scanColor">'+
                '</td>'+
           '</tr>'+
            '</tbody>'+
        '</table>'+
        '<button type="button" class="cesium-button" onclick="CesiumRadar.toolAddRader();">添加</button>'+
        '<button type="button" class="cesium-button" onclick="CesiumRadar.remove();">删除</button>'+
        '<div></div>';
        $("#toolbar").remove();
        $("body").append(toolbar);
        $("#toolbar").css("background","rgba(42, 42, 42, 0.8)").css("padding","4px;").css("border-radius", "4px");
        $("#toolbar input").css("vertical-align","middle").css("padding-top","2px").css("padding-bottom","2px");
    }
    return _;
})();
	
