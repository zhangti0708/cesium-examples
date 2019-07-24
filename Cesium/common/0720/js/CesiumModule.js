/***
 * 加载三维模型
 * @type 模型类型
 * @param 模型参数
 */
var _3DModulController = (function () {
    /**
      * _构造函数
      * @param 
      * @private
      */
    var viewer,entity,dataimg,featrueParam;
    function _() {}
    _.init = function(param,flag){
         if(null === param || undefined === param)return;
         var t = this;
         for(var key in param){
             t[key] = param[key];
         }
 
         dataimg = this.dataImg();
 
         viewer = this.viewer;
         featrueParam = {lon:this.lon,lat:this.lat,height:this.height};
         if(flag)this.show({module:this.type,featrue:featrueParam});
  
    }
    
    _.initSelect = function(){
         tableparam = [
             {id:"_ids1",type:"select",key:"type",value:['Aircraft','Ground Vehicle','Hot Air Balloon','Milk Truck','Skinned Character','Draco Compressed Model'],code:['Aircraft','Ground Vehicle','Hot Air Balloon','Milk Truck','Skinned Character','Draco Compressed Model']},
             {id:"_ids2",type:"text",key:"height",value:100,code:"height"},
             {id:"_ids3",type:"text",key:"lon",value:114.302312702,code:"lon"},
             {id:"_ids4",type:"text",key:"lat",value:30.598026044,code:"lat"},
             {id:"_ids5",type:"text",key:"size",value:128,code:"size"},
             {id:"_ids6",type:"text",key:"scale",value:20000,code:"scale"}
         ]
         var table = createTable(tableparam);
         $("#content").empty().append(table);
         $("#content table").css("text-align","center").css("margin","5px");
         $("#content select,input").css("vertical-align","middle").css("padding-top","2px").css("padding-bottom","2px").css("width","150px");
 
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
             size:parseFloat(selectData[4].value),
             scale:parseFloat(selectData[5].value)
         }
         console.log(initData);
         return initData;
     }
 
    _.dataImg = function(){
       var imgs = {
          "Aircraft":'../../Apps/SampleData/models/CesiumAir/Cesium_Air.glb',
          "Ground Vehicle":'../../Apps/SampleData/models/GroundVehicle/GroundVehicle.glb',
          "Hot Air Balloon":'../../Apps/SampleData/models/CesiumBalloon/CesiumBalloon.glb',
          "Milk Truck":'../../Apps/SampleData/models/CesiumMilkTruck/CesiumMilkTruck-kmc.glb',
          "Skinned Character":'../../Apps/SampleData/models/CesiumMan/Cesium_Man.glb',
          "Draco Compressed Model":'../../Apps/SampleData/models/DracoCompressed/CesiumMilkTruck.gltf'
       }
       return imgs;
    }
 
    _.show = function(param){
         var _self = this;
 
         this.initController();
         _self.createModule(dataimg[param.module],param.featrue);
    }
 
    _.switch = function(value){
       var _self = this;
       switch(value){
          case "Aircraft":{
             _self.createModule(dataimg["Aircraft"],featrueParam);
             break;
          }
          case "Ground Vehicle":{
             _self.createModule(dataimg["Ground Vehicle"],featrueParam);
             break;
          }
          case "Hot Air Balloon":{
             _self.createModule(dataimg["Hot Air Balloon"],featrueParam);
             break;
          }
          case "Milk Truck":{
             _self.createModule(dataimg["Milk Truck"]),featrueParam;
             break;
          }
          case "Skinned Character":{
             _self.createModule(dataimg["Skinned Character"],featrueParam);
             break;
          }
          case "Draco Compressed Model":{
             _self.createModule(dataimg["Draco Compressed Model"],featrueParam);
             break;
          }
          default:{}
       }
 
    }
  
    _.createModule = function(path,param){
       var _self = this;
       viewer.entities.removeAll();
   
       var position = Cesium.Cartesian3.fromDegrees(param.lat,param.lon, param.height);
       var heading = Cesium.Math.toRadians(135);
       var pitch = 0;
       var roll = 0;
       var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
       var orientation = Cesium.Transforms.headingPitchRollQuaternion(position, hpr);
       entity = viewer.entities.add({
           name : 'module',
           position : position,
           orientation : orientation,
           model : {
               uri : path,
               minimumPixelSize : _self.size,
               maximumScale : _self.scale,
               silhouetteSize:parseFloat(_self.silhouetteSize)
           }
       });
       viewer.trackedEntity = entity;
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
             color : 10,
             silhouetteSize : 1.0
         };
         Cesium.knockout.track(viewModel);
         var toolbar = document.getElementById('toolbar');
         Cesium.knockout.applyBindings(viewModel, toolbar);
         subscribeParameter('color');
         subscribeParameter('silhouetteSize');
     }
     //外部控制节点
     _.controller = function (obj){
         if(obj === null & obj === "")return;
         var key = obj.key,value = parseInt(obj.value);
         console.log(entity);
         if(key == "color"){
             entity.model[key] =  getColor(value);
         }else{
             entity.model[key] =  value;
         }
 
     }
    _.createtoolbar = function (){
         var toolbarparam = [	
             {type:"range",key:"color",value:10,min:"0",max:"147",step:"1"},
             {type:"range",key:"silhouetteSize",value:1.0,min:"0.0",max:"10.0",step:"1.0"}  
         ]
         var table = createToolbar(toolbarparam);
        var toolbar = 
         '<div id="toolbar">'+
         '<select class="cesium-button" onchange="_3DModulController.switch(this.value);">'+
         '<option value="Aircraft">Aircraft</option><option value="Ground Vehicle">Ground Vehicle</option>'+
         '<option value="Hot Air Balloon">Hot Air Balloon</option><option value="Milk Truck">Milk Truck</option><option value="Skinned Character">Skinned Character</option></select>'+
         table + 
         '</div>';
         $("#toolbar").remove();
         $("body").append(toolbar);
         $("#toolbar").css("background","rgba(42, 42, 42, 0.8)").css("padding","4px;").css("border-radius", "4px");
         $("#toolbar input").css("vertical-align","middle").css("padding-top","2px").css("padding-bottom","2px");
     }
     _.remove = function(){
         if(entity != null)viewer.entities.removeAll();
     }
     return _;
 
 })();


               
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
            
        }
        this.initController();
        viewer.zoomTo(viewer.entities);
    }
    _.createPoint = function(lon,lat){
            var x=1,flog=true,_color = getColor(this.color);
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
            {id:"_ids6",type:"text",key:"color",value:10,code:"color"}
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
            color : 10,
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
            {type:"range",key:"color",value:10,min:"0",max:"147",step:"1"},
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
    _.toolAddRader = function(){ //工具添加雷达
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
                console.log(cartesian);
                if (cartesian) {
                    var cartographic = Cesium.Cartographic.fromCartesian(cartesian); //根据笛卡尔坐标获取到弧度 
                    var lon = Cesium.Math.toDegrees(cartographic.longitude); //根据弧度获取到经度 
                    var lat = Cesium.Math.toDegrees(cartographic.latitude); //根据弧度获取到纬度
                    console.log(lon,lat);
                    if("point" == _self.type){
                        var point = _self.createPoint(lon,lat);
                        points.push(point);
                    } 
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