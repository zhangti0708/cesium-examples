/***
 * 城市top散点图
 * viewer
 * color
 */
var cityScatterTable = (function(){
    var geoCoordMap = null,option = null;
    function _(){};
    _.init = function(param,flag){
        if(param == null && param == "")return;
        var t = this;
        for(var key in param){
            t[key] = param[key];
        }
        if(flag)this.load();
    }
    _.load = function(){
        if(this.source == "" && this.source == null)return;
        try {
            viewer = this.viewer;
            $.get(this.source,{},function(json){
                if(json != null && this.source != ""){
                    geoCoordMap = json.geoCoordMap;
                    cityScatterTable.createMapecharts(json.data);
                    viewer.camera.setView({
                        destination : Cesium.Cartesian3.fromDegrees(117.16, 32.71, 15000000.0)
                    });
                    cityScatterTable.createToolbar();
                }
            });
        } catch (error) {
            console.log(error);
        } 
    }
    _.createMapecharts = function(data){
        var t = this;
        var convertData = function(data){
            if(data == null && geoCoordMap == null)return;
            var res = [];
            for (var i = 0; i < data.length; i++) {
                var geoCoord = geoCoordMap[data[i].name];
                if (geoCoord) {
                    res.push({
                        name: data[i].name,
                        value: geoCoord.concat(data[i].value)
                    });
                }
            }
            return res;
        }
        option = {animation: !1,GLMap: {},
            series: [{name: '城市', type: 'scatter',coordinateSystem: 'GLMap',data: convertData(data),
                    symbolSize: function (val) {return val[2] / 20;},label: {normal: {formatter: '{b}',position: 'right',show: false},
                    emphasis: { show: true}},itemStyle: {normal: {color: t.color1}}},{name: '前5',type: 'effectScatter',coordinateSystem: 'GLMap',
                    data: convertData(data.sort(function (a, b) {return b.value - a.value;}).slice(0, 6)),symbolSize: function (val) {return val[2] / 20;},
                    showEffectOn: 'render',rippleEffect: {brushType: 'stroke'},hoverAnimation: true,label: {normal: {formatter: '{b}',position: 'right',show: true}},
                    itemStyle: {normal: {color: t.color2,shadowBlur: 10,shadowColor: '#333'}},
                    zlevel: 1
                }
            ]
        };
        console.log(option);
        _cesium.echartsCombineCesium(viewer,option);
        //因为是禁止鼠标穿透的 所以并不能拥有echarts的tooltips;因此我们还是需要来做一个cesium的点；下面我举例子做前五的点；
        var pointList = convertData(data.sort(function (a, b) {
            return b.value - a.value;
        }).slice(0, 6));
        for(var i=0;i< pointList.length;i++){
            var point = viewer.entities.add({
                id:"point"+i,
                name:pointList[i].name+":"+pointList[i].value[2],
                description:"地点："+pointList[i].name+"值:"+pointList[i].value[2],
                position : Cesium.Cartesian3.fromDegrees(pointList[i].value[0],pointList[i].value[1],0),
                point : {
                    pixelSize : 20,
                    color:Cesium.Color.RED.withAlpha(0.1),//设置透明
                }
            });
        }
        this.click();
    }
    _.initSelect = function(){
        tableparam = [
            {id:"_ids1",type:"select",key:"handleType",value:['cityScatter'],code:['cityScatter']},
            {id:"_ids2",type:"select",key:"source",value:["../data/city.json"],code:["../data/city.json"]},
            {id:"_ids3",type:"text",key:"color1",value:"#32ff9d",code:"color1"},
            {id:"_ids4",type:"text",key:"color2",value:"#32ff9d",code:"color2"}
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
             handleType:selectData[0].value,
             source:selectData[1].value,
             color1:selectData[2].value,
             color2:selectData[3].value
        }
        return initData;
    }
    _.createToolbar = function(){
        var toolbar = 
        '<div id="toolbar">'+
        '<button type="button" class="cesium-button" onclick="cityScatterTable.show(1);">显示</button>'+
        '<button type="button" class="cesium-button" onclick="cityScatterTable.show(2);">隐藏</button>'+
        '<div></div>';
        $("#toolbar").remove();
        $("body").append(toolbar);
        $("#toolbar").css("background","rgba(42, 42, 42, 0.8)").css("padding","4px;").css("border-radius", "4px");
    }
    _.show = function(n){
       if(1 == n){
            document.getElementById('ys-cesium-echarts').style.visibility = 'visible'
       }else{
            document.getElementById('ys-cesium-echarts').style.visibility = 'hidden'
       }
    }
    _.remove = function(){
        if(option != null)$("#ys-cesium-echarts").remove();

    }
    _.click = function(){ //可以通过cesium事件在这些点上添加额外的点击、悬浮等事件
        var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
        CesiumTooltip.initTool(viewer);
        handler.setInputAction(function (e) {
            var pick = viewer.scene.pick(e.endPosition);
            if (Cesium.defined(pick)&&(pick.id._id.indexOf("point")!=-1)) {
                var cartesian = viewer.camera.pickEllipsoid(e.endPosition, viewer.scene.globe.ellipsoid);
                var canvasPosition =viewer.scene.cartesianToCanvasCoordinates(cartesian,new Cesium.Cartesian2());//cartesianToCanvasCoordinates 笛卡尔坐标（3维度）到画布坐标
                if (Cesium.defined(canvasPosition)) {
                    CesiumTooltip.showAt(canvasPosition,pick.id._description.getValue());
                }
            }else{
                CesiumTooltip.setVisible(false);
            }

        },Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }
    return _;
})();




/***
  * 航班图
  * viewer
  * lon lat
  * color
  */
 var flightTable = (function(){
	var chinaGeoCoordMap = null,option = null;
    function _(){};
    
    
    _.init = function(param,flag){
        
        if(param == null && param == "")return ;
        var t = this;
        for(var key in param){
            
            t[key] = param[key];
        }
        if(flag)this.load();
    }
    
    _.load = function(){
        var t = this;
        $.get(this.source,{},function(json){
            if(json == null && json == "")return;
            chinaGeoCoordMap = json.chinaGeoCoordMap;
            flightTable.create(json.chinaDatas);
           

           viewer.camera.setView({
               destination : Cesium.Cartesian3.fromDegrees(t.lon,t.lat , 15000000.0)
           });
           flightTable.createToolbar();

        })
    }
    _.initSelect = function(){
        tableparam = [
            {id:"_ids1",type:"select",key:"handleType",value:['flight'],code:['flight']},
            {id:"_ids2",type:"select",key:"source",value:["../data/flight.json"],code:["../data/flight.json"]},
            {id:"_ids3",type:"text",key:"lon",value:117.16,code:"lon"},
            {id:"_ids4",type:"text",key:"lat",value:32.71,code:"lat"},
            {id:"_ids5",type:"text",key:"linecolor",value:"#00EAFF",code:"linecolor"},
            {id:"_ids6",type:"text",key:"circlecolor",value:"#32ff9d",code:"circlecolor"},
            {id:"_ids7",type:"text",key:"scattercolor",value:"#ff0617",code:"scattercolor"}
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
             handleType:selectData[0].value,
             source:selectData[1].value,
             lon:parseFloat(selectData[2].value),
             lat:parseFloat(selectData[3].value),
             linecolor:selectData[4].value,
             circlecolor:selectData[5].value,
             scattercolor:selectData[6].value
        }
        return initData;
    }
    _.createToolbar = function(){
        var toolbar = 
        '<div id="toolbar">'+
        '<button type="button" class="cesium-button" onclick="cityScatterTable.show(1);">显示</button>'+
        '<button type="button" class="cesium-button" onclick="cityScatterTable.show(2);">隐藏</button>'+
        '<div></div>';
        $("#toolbar").remove();
        $("body").append(toolbar);
        $("#toolbar").css("background","rgba(42, 42, 42, 0.8)").css("padding","4px;").css("border-radius", "4px");
    }
    _.show = function(n){
       if(1 == n){
            document.getElementById('ys-cesium-echarts').style.visibility = 'visible'
       }else{
            document.getElementById('ys-cesium-echarts').style.visibility = 'hidden'
       }
    }
    _.remove = function(){
        if(option != null)$("#ys-cesium-echarts").remove();

    }
    _.create = function(chinaDatas){
            var t = this; 
            var series = [];
           [['北京市', chinaDatas]].forEach(function(item, i) {
           series.push(
               {
                   type: 'lines',
                   coordinateSystem: 'GLMap',
                   zlevel: 2,
                   effect: {
                       show: true,
                       period: 4, //箭头指向速度，值越小速度越快
                       trailLength: 0.02, //特效尾迹长度[0,1]值越大，尾迹越长重
                       symbol: 'arrow', //箭头图标
                       symbolSize: 5, //图标大小
                   },
                   lineStyle: {
                       normal: {
                           width: 1, //尾迹线条宽度
                           opacity: 1, //尾迹线条透明度
                           color: t.linkcolor,//线的颜色
                           curveness: .3 //尾迹线条曲直度
                       }
                   },
                   data: t.convertData(item[1])
               },
               {
                   type: 'effectScatter',
                   coordinateSystem: 'GLMap',
                   zlevel: 2,
                   rippleEffect: { //涟漪特效
                       period: 4, //动画时间，值越小速度越快
                       brushType: 'stroke', //波纹绘制方式 stroke, fill
                       scale: 4 //波纹圆环最大限制，值越大波纹越大
                   },
                   label: {
                       normal: {
                           show: true,
                           position: 'right', //显示位置
                           offset: [5, 0], //偏移设置
                           formatter: function(params){//圆环显示文字
                               return params.data.name;
                           },
                           fontSize: 13
                       },
                       emphasis: {
                           show: true
                       }
                   },
                   symbol: 'circle',
                   symbolSize: function(val) {
                       return 5+ val[2] * 5; //圆环大小
                   },
                   itemStyle: {
                       normal: {
                           show: false,
                           color: t.circlecolor//颜色
                       }
                   },
                   data: item[1].map(function(dataItem) {
                       return {
                           name: dataItem[0].name,
                           value: chinaGeoCoordMap[dataItem[0].name].concat([dataItem[0].value])
                       };
                   }),
               },
               //被攻击点
               {
                   type: 'scatter',
                   coordinateSystem: 'GLMap',
                   zlevel: 2,
                   rippleEffect: {
                       period: 4,
                       brushType: 'stroke',
                       scale: 4
                   },
                   itemStyle: {
                       normal: {
                           color: t.scatter//颜色
                       }
                   },
                   label: {
                       normal: {
                           show: true,
                           position: 'right',
                           //offset:[5, 0],
                           color: '#0f0',
                           formatter: '{b}',
                           textStyle: {
                               color: "#0f0"
                           }
                       },
                       emphasis: {
                           show: true,
                           color: "#f60"
                       }
                   },
                   symbol: 'pin',
                   symbolSize: 50,
                   data: [{
                       name: item[0],
                       value: chinaGeoCoordMap[item[0]].concat([10]),
                   }],
               }
           );
       });

       option = {
           animation: !1,
           GLMap: {},
           series: series
       };

       _cesium.echartsCombineCesium(viewer,option);
    }
    _.convertData = function(data){
         var res = [];
       for(var i = 0; i < data.length; i++) {
           var dataItem = data[i];
           var fromCoord = chinaGeoCoordMap[dataItem[0].name];
           var toCoord = [116.4551,40.2539];
           if(fromCoord && toCoord) {
               res.push([{
                   coord: fromCoord,
                   value: dataItem[0].value
               }, {
                   coord: toCoord,
               }]);
           }
       }
       return res;
    }
    
    return _;
})();