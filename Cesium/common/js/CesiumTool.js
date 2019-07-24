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
        if(!flag)measureAreaSpace(viewer); //工具默认测试面积
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
/************************************************* Cesiumplot end  ***************************************************** */
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
