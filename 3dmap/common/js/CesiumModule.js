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
             size:parseFloat(selectData[4].value),
             scale:parseFloat(selectData[5].value)
         }
         console.log(initData);
         return initData;
     }
 
    _.dataImg = function(){
       var imgs = {
          "Aircraft":'../../../3dmap/Apps/SampleData/models/CesiumAir/Cesium_Air.glb',
          "Ground Vehicle":'../../../3dmap/Apps/SampleData/models/GroundVehicle/GroundVehicle.glb',
          "Hot Air Balloon":'../../../3dmap/Apps/SampleData/models/CesiumBalloon/CesiumBalloon.glb',
          "Milk Truck":'../../../3dmap/Apps/SampleData/models/CesiumMilkTruck/CesiumMilkTruck-kmc.glb',
          "Skinned Character":'../../../3dmap/Apps/SampleData/models/CesiumMan/Cesium_Man.glb',
          "Draco Compressed Model":'../../../3dmap/Apps/SampleData/models/DracoCompressed/CesiumMilkTruck.gltf'
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


               
