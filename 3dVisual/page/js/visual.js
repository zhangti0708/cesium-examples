/**
 * 3dvisual
 * @version 1
 * @author zhangti
 */
//全局变量
var viewer = null; //全局视图
var ccc = {}; //cesium内置对象
var lon = 117.191166,lat = 34.289749,zoom = 30000000;//原始位置
var ttt = {};; //工具对象
var carousel = layui.carousel; //轮播对象
/**
 * cesium
 */
function initCesium(){
    //地图资源
    var GoogleMap = ImageryProviderWebExtendTool.createGoogleMapsByUrl(Cesium, { url: "http://mt1.google.cn/vt/lyrs=s&hl=zh-CN&x={x}&y={y}&z={z}" });
    viewer = new Cesium.Viewer('cesiumContainer', {
            imageryProvider: GoogleMap,
            shouldAnimate : false,
            selectionIndicator: false,
            baseLayerPicker:true,
            homeButton:false,
            animation: true,
            timeline:true,
            geocoder: true,
            sceneModePicker: true,
            navigationHelpButton: false,
            infoBox: true,
            fullscreenButton: false
    });
    //默认隐藏
    $('.cesium-viewer-animationContainer').hide();
    $('.cesium-viewer-timelineContainer').hide();
    //信息框
    $('.cesium-infoBox').show();
    //底图
    $('.cesium-button').hide();
    //投影
    $('.cesium-sceneModePicker-wrapper').hide();
    //地图搜索
    $('.cesium-viewer-geocoderContainer').hide();
     //设置初始位置
    viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(lon,lat,zoom)
    });
    //添加导航
    viewer.extend(Cesium.viewerCesiumNavigationMixin, {});
    //取消双击事件
    viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    let handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction(function (movement) {
        position = viewer.scene.pickPosition(movement.endPosition);
        //position = viewer.camera.pickEllipsoid(movement.endPosition);
        if (position != undefined) {
           //修改鼠标移动信息
           PAGE_MAIN.MoveMsg.update(position);
        }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
     //鼠标点击事件
    handler.setInputAction(function (click) {
        pickedFeature = viewer.scene.pick(click.position);
	    if (!Cesium.defined(pickedFeature) && pickedFeature == undefined){
            return false;
        };
        if(Cesium.defined(pickedFeature.id)){
            //点击实体弹出信息框
            console.log(pickedFeature.id);

        };
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    //回到原点
    ccc.home = function(){
        viewer.camera.setView({
            destination: Cesium.Cartesian3.fromDegrees(lon,lat,zoom)
        });
    }
    //基地选择
    ccc.setView = function(p){
        viewer.camera.flyTo({
            destination : Cesium.Cartesian3.fromDegrees(p.lon, p.lat, p.zoom),
            orientation: {
                heading : Cesium.Math.toRadians(90.0), // east, default value is 0.0 (north) //东西南北朝向
                pitch : Cesium.Math.toRadians(-90),    // default value (looking down)  //俯视仰视视觉
                roll : 0.0                             // default value
            },
            duration:3//3秒到达战场
        });  
    }
    //显示数据
    ccc.showPointData = function(url){
        var getBillboard = function(){ //生成广告牌
            return new Cesium.BillboardGraphics({
                image:'../img/zb.png',
                width:15,
                height:15
            })
        }
        var getPoint = function(){
            return new Cesium.PointGraphics({
                color: Cesium.Color.RED,
                pixelSize: 5
                /*outlineColor : Cesium.Color.WHITE,
		        outlineWidth : 1*/
            });
        }
        var getLabel = function(){
            return  { //文字标签
		        text : '设备',
		        font : '14pt monospace',
		        style : Cesium.LabelStyle.FILL,
		        outlineWidth : 2,
		        verticalOrigin : Cesium.VerticalOrigin.BOTTOM, //垂直方向以底部来计算标签的位置
		        pixelOffset : new Cesium.Cartesian2( 0, -9 )   //偏移量
		    }
        }
        Cesium.GeoJsonDataSource.load(url).then(function(dataSource) {
            viewer.dataSources.add(dataSource);
            var entities = dataSource.entities.values;
            for (var i = 0; i < entities.length; i++) {
                var entity = entities[i];
                entity.billboard = undefined;
                entity.point = getPoint();
                entity.label = getLabel();
            }
             //右侧信息
            ttt.createRightMsg(entities);
        });
    }
    ccc.showPointMsg = function(entity){
        console.log("显示信息");
    }
    //地面雷达站数据
    ccc.radarSite = {
        load : function(){
            CesiumRadar1.init({
                viewer : viewer,
                pixelRange:15,
                minimumClusterSize:3,
                enabled:false,
                showtoolbar:false
            });
            CesiumRadar1.build({
                handleType : "def",
                kml:'../../src/Apps/SampleData/kml/facilities/facilities.kml'
            });
        },
        close:function(){
            CesiumRadar1.clear();
        }
    }
    //省份边界数据
    ccc.provincesBorder = {
         data : null,
         load:function(){
            var promise = viewer.dataSources.add(Cesium.GeoJsonDataSource.load('../../common/3d/data/china.json'));
            promise.then(function(dataSource) {
                ccc.provincesBorder.data = dataSource;
            }).otherwise(function(error){
                fn_tool.alert(error);
            });
         },
         close:function(){
            viewer.dataSources.remove(ccc.provincesBorder.data);
         }
    } 

}
/**
 * 二维地图
 */
function initMap(){
    //初始化
    var mapmap = new ol.Map({
        target: 'map-page',
        layers: [
          new ol.layer.Tile({
            source: new ol.source.BingMaps({
              key: 'AhaJDO_bWhekq58C0nGLRkwJSMphRFDTYeccozENkqZTAAa1W0OgoaWmcgbPxatZ',
              imagerySet: 'AerialWithLabels'
            })
          })
        ],
        view: new ol.View({
          center: new ol.proj.fromLonLat([117.191166, 34.289749],'EPSG:3857'),
          zoom: 2
        })
      });
    //点击事件
   /* mapmap.addEventListener('click', function(evt) {  
        var coordinate = evt.coordinate;  
        var hdms = ol.coordinate.toStringHDMS(ol.proj.transform(  
            coordinate, 'EPSG:3857', 'EPSG:4326'));  
        console.log(hdms);
    });*/  
}

/**
 * 时间
 */
function initTime(){
    let clock = new Vue({
        el: '#timeDiv',
        data: {
            time: '',
            date: '',
            week: ''
        }
    });
    
    var week = ['星期天', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    var timerID = setInterval(updateTime, 1000);
    updateTime();
    function updateTime() {
        var cd = new Date();
        clock.time = zeroPadding(cd.getHours(), 2) + ':' + zeroPadding(cd.getMinutes(), 2) + ':' + zeroPadding(cd.getSeconds(), 2);
        clock.date = zeroPadding(cd.getFullYear(), 4) + '-' + zeroPadding(cd.getMonth()+1, 2) + '-' + zeroPadding(cd.getDate(), 2);
        clock.week = week[cd.getDay()];
    };
    
    function zeroPadding(num, digit) {
        var zero = '';
        for(var i = 0; i < digit; i++) {
            zero += '0';
        }
        return (zero + num).slice(-digit);
    }
}
/**
 * 鼠标坐标信息
 */
function initLonLatMsg(){
    $('body').append(`<div id="latlonMsg" style=' position: absolute;bottom: 1%;left: 10px;color:daf6ff;'>
    <p class="data">经度:{{ lon }}</p><p class="data">纬度:{{ lat }}</p><p class="data">高度:{{ height }}</p>
      <p class="data">海拔:{{ lean }}</p></div>`);
    $('#latlonMsg p').css('color','white').css('margin','2px');
    var latlonMsg = new Vue({
        el: '#latlonMsg',
        data: {
            lon: '',
            lat: '',
            height: '',
            lean: ''
        }
    });
    return latlonMsg;
}
/**
 * 页面
 */
function initElement(){
     //右侧面板控制
     $("button[class='list-group-item']").on('click',function(){
        let key = $(this).attr("key");
        console.log(key);
        if("select" == key){
          if('none' == $("#ckzy-select").css("display")){
            $("#ckzy-select").show();
          }else{
            $("#ckzy-select").hide();
          } 
        }else if("statis" == key){
          if('none' == $("#ckzy-statis").css("display")){
            $("#ckzy-statis").show();
          }else{
            $("#ckzy-statis").hide();
          }
        }
    });
    //退出键悬浮
    $("#loginOutDiv").hover(function() {
        $(".fa.fa-power-off.fa-2x").css('color','#dc5959');
    }, function() {
        $(".fa.fa-power-off.fa-2x").css('color','white');
    });
    //工具悬浮
    $("#toolbar1").hover(function() {
        $("#toolbarDIV1").show();
    }, function() {
        $("#toolbarDIV1").hide();
    });
    $("#toolbarDIV1").hover(function() {
        $("#toolbarDIV1").show();
    }, function() {
        $("#toolbarDIV1").fadeOut(300);
    });
    $("#toolbar2").hover(function() {
        $("#toolbarDIV2").show();
    }, function() {
        $("#toolbarDIV2").hide();
    });
    $("#toolbarDIV2").hover(function() {
        $("#toolbarDIV2").show();
    }, function() {
        $("#toolbarDIV2").fadeOut(300);
    });
    //工具条
    var removeTool = function(){
        $("#pop").remove();
        CesiumMeasure.remove();
        Cesiumbrush.remove();
        CesiumPlot.remove();
        CesiumTriangle.remove();
        Cesiumflicker.remove();
        CesiumRadarScan.remove();
        CesiumRadar2.remove();
    }
    $("#right-nav-list1 li").on("click",function(){
        var type = $(this).text();
        if(type == "" || type == undefined)return;
        switch(type){
            case "测距离":{CesiumMeasure.init({viewer:viewer,type:"lineSpace"},false);break;}
            case "测面积":{CesiumMeasure.init({viewer:viewer,type:"areaSpace"},false);break;}
            case "三角测量":{CesiumTriangle.init({viewer:viewer});break;}
            case "画笔":{Cesiumbrush.init({viewer:viewer});break;}
            case "雷达扫描":{CesiumRadarScan.radarTool(viewer);;break;}
            case "雷达":{CesiumRadar2.radarTool(viewer);;break;}
            case "闪烁点":{Cesiumflicker.init({viewer:viewer,type:"",lon:"",lat:"",semiMinorAxis:2000.0,semiMajorAxis:2000.0,color:139},true);break;}
            case "标绘":{CesiumPlot.init({viewer:viewer});break;}
            case "三维效果":{ttt._3dController.open();break;}
            case "查询":{ttt.showSelectDiv();break};
            case "删除":{removeTool();break;};
        } 
    });
    $("#plot").css("position","absolute").css("top","50%").css("left","2%").css("display","inline").css("margin","10px").css("padding","0px");
    //收缩右侧展示框
    let util = layui.util
    util.fixbar({
        bar1: '<i class="layui-icon layui-icon-read" style="font-size: 35px;"></i>'
        ,bgcolor: '#393D49'
        ,click: function(type){
            if(type === 'bar1'){
              $("#left_page1").show();
              if("1" == $(this).attr("status")){
                $("#left_page1").animate({right:- $('#left_page1').width() + 'px'});
                $(this).attr("status",0);
              }else{
                $("#left_page1").animate({right:'0px'});
                $(this).attr("status",1);
              }
          }
        }
    });
}
/**
 * 初始化工具
 */
function initTool(){
    //截屏
    ttt.cut = function(){
        html2canvas(document.body, {
            allowTaint: true,
            taintTest: false,
            onrendered: function(canvas) {
                canvas.id = "DIVcanvas";
                var dataUrl = canvas.toDataURL(); //生成base64图片数据
                fn_open.openCutImg(dataUrl);
                var a = $("<a></a>").attr("href", dataUrl).attr("download", "img.png");
	            $("body").append(a);
            }
        });
    }
    //基地选择
    ttt.baseSelect = function(e){
        switch(e){
            case "base1" :
                ccc.setView({lon:121.55618, lat:30.84825,zoom:zoom/10});
                ccc.showPointData('../../common/3d/data/busstop2016.geojson');//地图标注
                break;
            case "base2" :
                console.log("基地2");
                ccc.setView({lon:lon - 50,lat:lat - 10,zoom:zoom/10});
                break;
            case "base3" :
                console.log("基地3");
                ccc.setView({lon:lon - 80,lat:lat - 15,zoom:zoom/10});
                break;
            case "base4" :
                console.log("基地4");
                ccc.setView({lon:lon - 27,lat:lat - 18,zoom:zoom/10});
                break;
            case "base5" :
                console.log("基地5");
                ccc.setView({lon:lon - 30,lat:lat - 6,zoom:zoom/10});
                break;
            case "base6" :
                console.log("基地6");
                ccc.setView({lon:lon - 40,lat:lat - 20,zoom:zoom/10});
                break;
            case "base7" :
                console.log("基地7");
                ccc.setView({lon:lon - 29,lat:lat - 15,zoom:zoom/10});
                break;
        }
    }
    //右侧div资源
    ttt.createRightMsg = function(){
            $('#ckMsg01').empty().append(
                `
                <div carousel-item="">
                <div>
                    <div  class="row01">
                      <div class="row_top" style="background-color: #9e9e9e7a;">
                      <p>北京站 </p>
                      <p><img src='../../page/img/雷达96.png' /></p>
                      </div>
                      <div class="row_bottom" style="background-color: #0a2440;">北京站(18)</div>
                    </div>
                    <div  class="row01">
                        <div class="row_top" style="background-color: #9e9e9e7a;">
                        天津站
                        <p><img src='../../page/img/雷达96.png' /></p>
                        </div>
                        <div class="row_bottom" style="background-color: #0a2440;">天津站(17)</div>
                    </div>
                    <div  class="row01">
                        <div class="row_top" style="background-color: #9e9e9e7a;">
                        <p>河北站</p>
                        <p><img src='../../page/img/雷达96.png' /></p>
                        </div>
                        <div class="row_bottom" style="background-color: #0a2440;">河北站(14)</div>
                    </div>
                </div>
                <div>
                    <div  class="row01">
                      <div class="row_top" style="background-color: #9e9e9e7a;">
                      <p>上海站</p>
                      <p><img src='../../page/img/雷达96.png' /></p>
                      </div>
                      <div class="row_bottom" style="background-color: #0a2440;">上海站(20)</div>
                    </div>
                    <div  class="row01">
                        <div class="row_top" style="background-color: #9e9e9e7a;">
                        <p>南京站</p>
                        <p><img src='../../page/img/雷达96.png' /></p>
                        </div>
                        <div class="row_bottom" style="background-color: #0a2440;">南京站(12)</div>
                    </div>
                    <div  class="row01">
                        <div class="row_top" style="background-color: #9e9e9e7a;">
                        <p>杭州站</p>
                        <p><img src='../../page/img/雷达96.png' /></p>
                        </div>
                        <div class="row_bottom" style="background-color: #0a2440;">杭州站(8)</div>
                    </div>
                </div>
              </div>
                `
            );
            $('#dhMsg01').empty().append(
                `
                <div carousel-item="">
                <div>
                    <div  class="row01">
                      <div class="row_top" style="background-color: #af8b218f;">
                      <p>点号1</p>
                      <p><img src='../../page/img/设备.png' /></p>
                      </div>
                      <div class="row_bottom" style="background-color: #0a2440;">点号1(12)</div>
                    </div>
                    <div  class="row01">
                        <div class="row_top" style="background-color: #af8b218f;">
                        <p>点号2</p>
                        <p><img src='../../page/img/设备.png' /></p>
                        </div>
                        <div class="row_bottom" style="background-color: #0a2440;">点号2(18)</div>
                    </div>
                    <div  class="row01">
                        <div class="row_top" style="background-color: #af8b218f;">
                        <p>点号3</p>
                        <p><img src='../../page/img/设备.png' /></p>
                        </div>
                        <div class="row_bottom" style="background-color: #0a2440;">点号3(20)</div>
                    </div>
                </div>
                <div>
                    <div  class="row01">
                      <div class="row_top" style="background-color: #af8b218f;">
                      <p>点号4</p>
                      <p><img src='../../page/img/设备.png' /></p>
                      </div>
                      <div class="row_bottom" style="background-color: #0a2440;">点号4(8)</div>
                    </div>
                    <div  class="row01">
                        <div class="row_top" style="background-color: #af8b218f;">
                        <p>点号5</p>
                        <p><img src='../../page/img/设备.png' /></p>
                        </div>
                        <div class="row_bottom" style="background-color: #0a2440;">点号5(15)</div>
                    </div>
                    <div  class="row01">
                        <div class="row_top" style="background-color: #af8b218f;">
                        <p>点号6</p>
                        <p><img src='../../page/img/设备.png' /></p>
                        </div>
                        <div class="row_bottom" style="background-color: #0a2440;">点号(18)</div>
                    </div>
                </div>
            </div>
                `
            );
            $('#sbMsg01').empty().append(
                `
                <div carousel-item="">
                    <div>
                        <div  class="row01">
                            <div class="row_top" style="background-color: #386109a8;">
                            <p>设备1</p>
                            <p><img src='../../page/img/飞机.png' /></p>
                            </div>
                            <div class="row_bottom" style="background-color: #0a2440;">设备1(12)</div>
                        </div>
                        <div  class="row01">
                            <div class="row_top" style="background-color: #386109a8;">
                            <p>设备1</p>
                            <p><img src='../../page/img/飞机.png' /></p>
                            </div>
                            <div class="row_bottom" style="background-color: #0a2440;">设备1(12)</div>
                        </div>
                        <div  class="row01">
                            <div class="row_top" style="background-color: #386109a8;">
                            <p>设备1</p>
                            <p><img src='../../page/img/飞机.png' /></p>
                            </div>
                            <div class="row_bottom" style="background-color: #0a2440;">设备1(12)</div>
                        </div>
                    </div>
                    <div>
                        <div  class="row01">
                            <div class="row_top" style="background-color: #386109a8;">
                            <p>设备1</p>
                            <p><img src='../../page/img/飞机.png' /></p>
                            </div>
                            <div class="row_bottom" style="background-color: #0a2440;">设备1(12)</div>
                        </div>
                        <div  class="row01">
                            <div class="row_top" style="background-color: #386109a8;">
                            <p>设备1</p>
                            <p><img src='../../page/img/飞机.png' /></p>
                            </div>
                            <div class="row_bottom" style="background-color: #0a2440;">设备1(12)</div>
                        </div>
                        <div  class="row01">
                            <div class="row_top" style="background-color: #386109a8;">
                            <p>设备1</p>
                            <p><img src='../../page/img/飞机.png' /></p>
                            </div>
                            <div class="row_bottom" style="background-color: #0a2440;">设备1(12)</div>
                        </div>
                    </div>
                </div>
                `
            );
            var initCarousel = function(){
                     //轮播组件
                    carousel.render({
                        elem: '#ckMsg01'
                        ,autoplay:false
                        ,arrow:'always'
                        ,anim:'default'
                        ,width: '100%'
                        ,height: '250px'
                        ,indicator:'none'
                    });
                    carousel.render({
                        elem: '#dhMsg01'
                        ,autoplay:false
                        ,arrow:'always'
                        ,anim:'default'
                        ,width: '100%'
                        ,height: '250px'
                        ,indicator:'none'
                    });
                    
                    carousel.render({
                        elem: '#sbMsg01'
                        ,autoplay:false
                        ,arrow:'always'
                        ,anim:'default'
                        ,width: '100%'
                        ,height: '250px'
                        ,indicator:'none'
                    });
                    carousel.on('change(ckMsg01)', function(obj){ //test1来源于对应HTML容器的 lay-filter="test1" 属性值
                        console.log(obj.index); //当前条目的索引
                        console.log(obj.prevIndex); //上一个条目的索引
                        console.log(obj.item); //当前条目的元素对象
                    });  
            }
            var getMsgDiv = function(m){
                return `
                    <div class="panel-page2">
                        <button class="list-group-item"><i class="fa fa-eye" style="color: white"></i>&nbsp;&nbsp;`+ m.title +`</button>
                            <div id="ckzy-select" class="panel panel-primary">
                                <div class="panel-heading">
                                <div style="float: left;">基地:20</div><div style="float: left;padding-left:25%">测站:9</div><div style="float: right;">点号:18</div>
                            </div>
                            <div class="panel-body" style="color:white;">
                            北京地处中国华北地区，中心位于东经116°20′、北纬39°56′，东与天津毗连，其余均与河北相邻，北京市总面积16410.54平方千米 [2-3]  。截至2017年底，北京市下辖16个市辖区
                            </div>
                        </div>
                    </div>
                `
            }
            $('.row01 > div').off('click');
            $('.row01 > div').on('click',function(){
                 //生成站点信息弹出框
                 fn_open.openCommonDiv({'title':$(this).text(),'area':['13%','30%'],'offset': ['10%', '66%'],'content':getMsgDiv({'title':$(this).text()})});
           });
           initCarousel();
    }

    //点击查看资源信息
    ttt.selectResMsg = function(){
        //弹出资源信息框
        //cesium显示
        
    }
    $('.navbar-collapse.collapse li').on('click',function(){
        ttt.baseSelect($(this).attr('name'));
    });
    //显示搜索框
    ttt.showSelectDiv = function(){
        $("#select_page").fadeToggle();
        carousel.render({ //轮播组件
            elem: '#select01'
            ,autoplay:false
            ,arrow:'always'
            ,anim:'default'
            ,width: '100%'
            ,height: '250px'
            ,indicator:'none'
        });
    }
    //右侧信息框
    ttt.createRightMsg();

    //鼠标限定范围
    $('#select_scope').on('click',function(){
        rectangleColltroller.create(viewer);
    });
    //显示时间轴和罗盘
    ttt.showSJZandLP = function(){
        $('.cesium-viewer-animationContainer').show();
        $('.cesium-viewer-timelineContainer').show();
    }
    //隐藏时间轴和罗盘
    ttt.hideSJZandLP = function(){
        $('.cesium-viewer-animationContainer').hide();
        $('.cesium-viewer-timelineContainer').hide();
    }
    //重置数据
    ttt.dataReset = function(){
        layer.msg('是否重置系统数据', {
            time: 20000, //20s后自动关闭
            btn: ['确定', '取消']
          });
    }
    //图层控制
    ttt.layerController = {
        open : function(){
            fn_open.openCommonDiv({'title':'图层控制','area':['15%','40%'],'offset': ['20%', '15%'],'content':`<div id="layerDiv"></div>`,fn:ttt.layerController.create});
        },
        create : function(){
            let data = [{
                title: '数据图层'
                ,id: 1
                ,spread: true
                ,edit: ['add', 'update', 'del'] //操作节点的图标
                ,children: [
                    {title: '全球雷达站',id: 1_2,checked:false},
                    {title: '全国省份边界',id: 1_3,checked:false},
                    {title: '全国城市边界',id: 1_4,checked:false},
                    {title: '全国区县边界',id: 1_5,checked:false},
                ]
            }]
            var tree = layui.tree;
            tree.render({
                elem: '#layerDiv'
                ,data: data
                ,showCheckbox: true  //是否显示复选框
                ,id: 'layerDivId'
                ,isJump: true //是否允许点击节点时弹出新窗口跳转
                ,oncheck:function(obj){
                    let node = obj.data;
                    ttt.layerController.controller(node); //控制器
                    if(node.checked){ //切换
                        node.checked = false;
                    }else{
                        node.checked = true;
                    }
                }
                ,click: function(obj){
                    layer.msg(JSON.stringify(obj.data));
                }
            });
        },
        controller:function(node){
            console.log(node);
            switch('' + node.id){
                case "12" :if(node.checked){ccc.radarSite.close();}else{ccc.radarSite.load();}break;
                case "13" :if(node.checked){ccc.provincesBorder.close();}else{ccc.provincesBorder.load();}break;
            }
        }

    }
    //三维效果
    ttt._3dController = {
        wxtx : null,
        open : function(){
            fn_open.openCommonDiv({'title':'三维效果','area':['15%','40%'],'offset': ['25%', '10%'],'content':'<div id="_3dDiv"></div>',fn:ttt._3dController.create});
        },
        create : function(){
            let data = [{
                title: '三维'
                ,id: 1
                ,spread: true
                ,children: [
                {title: '热力图',id: 1_2,checked:false},
                {title: '卫星通信',id: 1_3,checked:false},
                {title: '风场',id: 1_4,checked:false},
                {title: '经纬网',id: 1_5,spread: true,children:[{title:'网格图像',id:1_5_1,checked:false},{title:'网格瓦片',id:1_5_2,checked:false},{title:'军事网格',id:1_5_3,checked:false}]},
                {title: '地形图像',id: 1_6,checked:false},
                {title: '地图图形',id: 1_7,checked:false},
                {title: '天地图',id: 1_8,checked:false},
                {title: '卫星图',id: 1_9,checked:false}
                ]
            }]
            var tree = layui.tree;
            tree.render({
                elem: '#_3dDiv'
                ,data: data
                ,showCheckbox: true  //是否显示复选框
                ,id: '_3dDivID'
                ,isJump: true //是否允许点击节点时弹出新窗口跳转
                ,oncheck:function(obj){
                    let node = obj.data;
                    ttt._3dController.controller(node); //控制器
                    if(node.checked){ //切换
                        node.checked = false;
                    }else{
                        node.checked = true;
                    }
                }
            });
        },
        controller : function(node){
            console.log(node);
            switch('' + node.id){
                case "12" :if(node.checked){
                             CesiumHeatMap.remove();}else{
                             CesiumHeatMap.init({viewer:viewer,flag:false,'handleType':"CesiumHeatmapGL",datas:{'type':'url','obj':'../../common/3d/data/busstop2016.geojson'}},true);}
                            break;
                case "13" : //卫星通信
                        if(node.checked){
                            ttt.layerController.wxtx.destroy();ttt.hideSJZandLP();}else{
                            ttt.layerController.wxtx = new WXTX();ttt.layerController.wxtx.init(viewer,"../../common/3d/data/czml/test.czml");ttt.showSJZandLP();
                        } break;
                case "14" : //风场
                        if(node.checked){
                            CesiumWind.remove();}else{
                            CesiumWind.init({viewer:viewer,flag:true,type:'json',sources:'../../common/3d/data/wind/2017121300.json'
                            ,SPEED_RATE:0.15,PARTICLES_NUMBER:2000,MAX_AGE:10,BRIGHTEN:1.5,color:Cesium.Color.GREEN,ms:300},true); //自动build
                        } break; 
                case "151" :if(node.checked){
                                TileLonlatController.removeType('grid','0');}else{
                                TileLonlatController.init({viewer:viewer,handleType:'grid',flag:false,alpha:1,hue:1,brightness:1,contrast:1},true); //自动build
                            }break;
                case "152" :if(node.checked){
                                TileLonlatController.removeType('default','0');}else{
                                TileLonlatController.init({viewer:viewer,handleType:'',flag:false,alpha:1,hue:1,brightness:1,contrast:1},true); //自动build
                            }break;
                case "153" :if(node.checked){
                                TileLonlatController.removeType('mgrs','1');}else{
                                TileLonlatController.init({viewer:viewer,handleType:'mgrs',flag:false,alpha:1,hue:1,brightness:1,contrast:1},true); //自动build
                            }break;
                case "16" :break;
                case "17" :break;
            }
        }
    }

    //显示设置
    ttt.scenController = {
        lensFlare : null,
        open : function(){
             //光晕
            ttt.scenController.lensFlare = viewer.scene.postProcessStages.add(Cesium.PostProcessStageLibrary.createLensFlareStage());
            fn_open.openCommonDiv({'title':'场景控制','area':['15%','40%'],'offset': ['30%', '8%'],'content':'<div id="scenDiv"></div>',fn:ttt.scenController.create});
        },
        create : function(){
            let data = [{
                title: '显示'
                ,id: 1
                ,spread: true
                ,children: [
                {title: '雾天',id: 1_2,checked:true},
                {title: '昼夜',id: 1_3,checked:false},
                {title: '光晕',id: 1_4,checked:true},
                {title: '大气层',id: 1_5,checked:true},
                {title: '地球',id: 1_6,checked:true},
                {title: '星空',id: 1_7,checked:true},
                {title: '雨天',id: 1_8,checked:false},
                {title: '雪天',id: 1_9,checked:false},
                {title: '十字',id: 1_10,checked:false},
                {title: '时间轴',id: 1_11,checked:false},
                {title: '信息框',id: 1_12,checked:true},
                {title: '底图',id: 1_13,checked:false},
                {title: '投影方式',id: 1_14,checked:false},
                {title: '地图搜索',id: 1_15,checked:false}
            ]}]
            var tree = layui.tree;
            tree.render({
                elem: '#scenDiv'
                ,data: data
                ,showCheckbox: true  //是否显示复选框
                ,id: 'scenID'
                ,isJump: true //是否允许点击节点时弹出新窗口跳转
                ,oncheck:function(obj){
                    let node = obj.data;
                     ttt.scenController.controller(node); //控制器
                    if(node.checked){ //切换
                        node.checked = false;
                    }else{
                        node.checked = true;
                    }
                }
            });
        },
        controller:function(node){
            console.log(node);
            let scene = viewer.scene;
            switch('' + node.id){
                case "12" : scene.fog.enabled = node.checked;break;
                case "13" : scene.globe.enableLighting = !node.checked;break;
                case "14" : ttt.scenController.lensFlare.enabled =  node.checked;break;
                case "15" : scene.globe.showGroundAtmosphere = node.checked;break;
                case "16" : scene.globe.show =  node.checked;break;
                case "17" : scene.skyBox.show =  node.checked;break;
                case "18" : break;
                case "19" : break;
                case "110" :if(node.checked){document.documentElement.style.cursor = 'default';}else{ document.documentElement.style.cursor = 'crosshair';}break;
                case "111" :if(node.checked){ttt.hideSJZandLP();}else{ttt.showSJZandLP();} break;
                case "112" :if(node.checked){$('.cesium-infoBox').show();}else{$('.cesium-infoBox').hide();}
                case "113" :if(node.checked){ $('button.cesium-button').hide(); $('.cesium-baseLayerPicker-dropDown').removeClass('cesium-baseLayerPicker-dropDown-visible');}else{ $('button.cesium-button').show();
                            $('.cesium-baseLayerPicker-dropDown').addClass('cesium-baseLayerPicker-dropDown-visible')}
                case "114" :if(node.checked){ $('span.cesium-sceneModePicker-wrapper').hide();}else{  $('span.cesium-sceneModePicker-wrapper').show();}
                case "115" :if(node.checked){ $('div.cesium-viewer-geocoderContainer').hide();}else{  $('div.cesium-viewer-geocoderContainer').show();}
            }
           
            //地图搜索
           
        }
    }
    //用户管理
    ttt.userMannage = {
        open : function(){
            fn_open.openUserMannageDiv({'title':'用户管理','area':['40%','30%'],'offset': 'auto','content':'<table class="layui-hide" id="userDiv"></table>'});
        },
        create : function(){
            let data = [{id:1,username:'管理员',sex:'男','city':'北京','classify':'it'}
                        ,{id:11,username:'用户1',sex:'男','city':'北京','classify':'it'}
                        ,{id:12,username:'用户2',sex:'女','city':'北京','classify':'it'}
                        ,{id:13,username:'用户3',sex:'男','city':'北京','classify':'it'}]
            let userTable = layui.table;
            userTable.render({
                elem: '#userDiv'
                //,url: '/demo/table/user/' //数据接口
                ,cols: [[ //表头
                  {field: 'id', title: 'ID', width:50, sort: true, fixed: 'left'}
                  ,{field: 'username', title: '用户名'}
                  ,{field: 'sex', title: '性别', sort: true}
                  ,{field: 'city', title: '城市'}
                  ,{field: 'classify', title: '职业',width:50}
                  ,{fixed: 'right', align:'center', toolbar: '#barUser'}
                ]]
                ,data:data
              });
        },
    }
    //添加影像
    ttt.addImageLayer = {
        open : function(){
            fn_open.openCommonDiv({'title':'添加栅格图层','btn':['添加','取消'],'btn1':ttt.addImageLayer.yes,'area':['30%','50%'],'offset': 'auto','content':'<div id="addImageDiv" style="width:100%;height:100%;padding:10px;"></div>',fn:ttt.addImageLayer.create});
        },
        create : function(){
            $('#addImageDiv').html(
                 `
                 <div><span><text>选择文件 : &nbsp;&nbsp;</text><input type='text' value='' name='filePath'> <button type="button" class="layui-btn layui-btn-xs layui-btn-normal" id="upload01">选择文件</button></span></div>
                 <div><span><text>文件名称 : &nbsp;&nbsp;</text><input type='text' value='' name='fileName'></span></div>
                 <br>
                 <div><span style="padding-left:25%;"><text>北门</text><input type="number" name='num_bm' value="0.00" style='width:50px;'></span></div>
                 <div><text>空间参考: &nbsp;&nbsp;</text><span  style="padding-left:5%;"><text>西门</text><input type="number" name='num_xm' value="0.00"  style='width:50px;'></span>
                 <span style="padding-left:5%;"><input type="number" name='num_dm' value="0.00"  style='width:50px;'><text>东门</text></span>
                 <span style="padding-left:5%;"><text>高程(m)&nbsp;</text><input type="number" name='num_gc' value="0"  style='width:50px;'></span></div>
                 <div><span style="padding-left:25%;"><text>南门</text><input type="number" name='num_nm' value="0.00"  style='width:50px;'></span></div>
                 <br>
                 <div><span><text>投影信息 : &nbsp;&nbsp;</text><input type='text' value='' name='touytingMsg'></span></div>
                 <br>
                 <div><span><text> 背 景 值 :&nbsp;&nbsp;&nbsp;</text><input type="number" name='num_mingjing' value="0" style='width:80px;'></span>
                 <span style="padding-left:15%;"><text>透明值: &nbsp;&nbsp;</text><input type="number" name='num_touming' value="255" style='width:80px;'></span></div>
                 `
            );
            let upload = layui.upload;
            upload.render({
                elem: '#upload01'
                ,url: '/upload/'
                ,auto: false
                ,accept:'file'
                //,multiple: true
                ,bindAction: '.layui-layer-btn0'
                ,choose: function(obj){ 
                    var files = obj.pushFile();
                    obj.preview(function(index, file, result){
                        $("input[name='filePath']").val(file.name);
                        $("input[name='fileName']").val(file.name);
                    });
                }
                ,done: function(res){
                  console.log(res)
                }
                ,error : function(index, upload){
                    fn_tool.alert('添加失败!' + index);
                }
              });
        },
        yes:function(){
            console.log('添加影像图层');
        }
    }
    //添加矢量
    ttt.addVectorLayer = {
        open : function(){
            fn_open.openCommonDiv({'title':'添加矢量图层','btn':['添加','取消'],'btn1':ttt.addVectorLayer.yes,'area':['30%','50%']
            ,'offset': 'auto','content':'<div id="addVectorDiv" style="width:100%;height:100%;padding:10px;"></div>',fn:ttt.addVectorLayer.create});
        },
        create : function(){
            $('#addVectorDiv').html(
                `
                <div><span><text>选择文件 : &nbsp;&nbsp;</text><input type='text' value='' name='filePath'> <button type="button" class="layui-btn layui-btn-xs layui-btn-normal" id="upload02">选择文件</button></span></div>
                <div><span><text>文件名称 : &nbsp;&nbsp;</text><input type='text' value='' name='fileName'></span></div>
                <br>
                <div><span style="padding-left:25%;"><text>北门</text><input type="number" name='num_bm' value="0.00" style='width:50px;'></span></div>
                <div><text>空间参考: &nbsp;&nbsp;</text><span  style="padding-left:5%;"><text>西门</text><input type="number" name='num_xm' value="0.00"  style='width:50px;'></span>
                <span style="padding-left:5%;"><input type="number" name='num_dm' value="0.00"  style='width:50px;'><text>东门</text></span>
                <span style="padding-left:5%;"><text>高程(m)&nbsp;</text><input type="number" name='num_gc' value="0"  style='width:50px;'></span></div>
                <div><span style="padding-left:25%;"><text>南门</text><input type="number" name='num_nm' value="0.00"  style='width:50px;'></span></div>
                <br>
                <div><span><text>投影信息 : &nbsp;&nbsp;</text><input type='text' value='' name='touytingMsg'></span></div>
                <br>
                <div><span><text>矢量类型 : &nbsp;&nbsp;</text><input type='text' value='' name='vectorType'></span></div>
                `
           );
           let upload = layui.upload;
            upload.render({
                elem: '#upload02'
                ,url: '/upload/'
                ,auto: false
                ,accept:'file'
                //,multiple: true
                ,bindAction: '.layui-layer-btn0'
                ,choose: function(obj){ 
                    var files = obj.pushFile();
                    obj.preview(function(index, file, result){
                        $("input[name='filePath']").val(file.name);
                        $("input[name='fileName']").val(file.name);
                    });
                }
                ,done: function(res){
                  console.log(res)
                }
                ,error : function(index, upload){
                    fn_tool.alert('添加失败!' + index);
                }
              });
        },
        yes:function(){
            console.log('添加矢量图层');
        }
    }
    //添加设备
    ttt.addEquipment = {
        open : function(){
            fn_open.openCommonDiv({'title':'添加设备','btn':['添加','取消'],'btn1':ttt.addEquipment.yes,'area':['25%','50%']
            ,'offset': 'auto','content':'<div id="addEquipmentDiv" style="width:100%;height:100%;padding:10px;"></div>',fn:ttt.addEquipment.create});
        },
        create : function(){
            $('#addEquipmentDiv').html(
                `
                <div><span><text>类型 : &nbsp;&nbsp;</text><select><option value ="gxyq">光学仪器</option><option value ="ycyq">遥测仪器</option></select>
                <a href="#" id="select_point"><img style="padding-left: 7%;" src="../../page/img/xz.png"/></a><text>选坐标</text></span>
                </div>
                <hr>
                <table  cellspacing=2 style="width:100%;height:100%">
                    <tr><td><span><text>名称代号 : &nbsp;&nbsp;</text></span></td><td><span><input type='text' value='' name='fileName'></span></td></tr>
                    <tr><td><span><text>所属测控站 : &nbsp;&nbsp;</text></span></td><td><span><input type='text' value='' name='fileName'></span></td></tr>
                    <tr><td><span><text>所属基地 : &nbsp;&nbsp;</text></span></td><td><span><input type='text' value='' name='fileName'></span></td></tr>
                    <tr><td><span><text>实地照片 : &nbsp;&nbsp;</text></span></td><td><span><input type='text' value='' name='fileName'></span></td></tr>
                    <tr><td><span><text>类  型  : &nbsp;&nbsp;</text></span></td><td><span><input type='text' value='' name='fileName'></span></td></tr>
                    <tr><td><span><text>研制单位 : &nbsp;&nbsp;</text></span></td><td><span><input type='text' value='' name='fileName'></span></td></tr>
                    <tr><td><span><text>列装时间 : &nbsp;&nbsp;</text></span></td><td><span><input type='text' value='' name='fileName'></span></td></tr>
                    <tr><td><span><text>地理位置 : &nbsp;&nbsp;</text></span></td><td><span><input type='text' value='' name='fileName'></span></td></tr>
                    <tr><td><span><text>地理坐标(经度) : &nbsp;&nbsp;</text></span></td><td><span><input type='text' value='0' name='fileName'></span></td></tr>
                    <tr><td><span><text>地理坐标(纬度) : &nbsp;&nbsp;</text></span></td><td><span><input type='text' value='0' name='fileName'></span></td></tr>
                    <tr><td><span><text>系统组成 : &nbsp;&nbsp;</text></span></td><td><span><input type='text' value='' name='fileName'></span></td></tr>
                    <tr><td><span><text>备注 : &nbsp;&nbsp;</text></span></td><td><span><input type='text' value='' name='fileName'></span></td></tr>
                </table>
                `
            );
            $('#select_point').on('click',function(){
                    console.log("点击地球");
            });
        },
        yes : function(){
            console.log('添加设备');
        }
    }
   
    //添加监测站
    ttt.addTesting = {
        open : function(){
            fn_open.openCommonDiv({'title':'添加监测站','btn':['添加','取消'],'btn1':ttt.addTesting.yes,'area':['25%','50%']
            ,'offset': 'auto','content':'<div id="addTestingDiv" style="width:100%;height:100%;padding:10px;"></div>',fn:ttt.addTesting.create});
        },
        create : function(){
            $('#addTestingDiv').html(
                `
                <div>
                <span><a href="#" id="select_point"><img style="padding-left: 2%;" src="../../page/img/xz.png"/></a><text>选坐标</text></span>
                </div>
                <hr>
                <table  cellspacing=2  style="width:100%;height:100%">
                    <tr><td><span><text>站名 : &nbsp;&nbsp;</text></span></td><td><span><input type='text' value='' name='fileName'></span></td></tr>
                    <tr><td><span><text>所属基地 : &nbsp;&nbsp;</text></span></td><td><span><input type='text' value='' name='fileName'></span></td></tr>
                    <tr><td><span><text>实地照片 : &nbsp;&nbsp;</text></span></td><td><span><input type='text' value='' name='fileName'></span></td></tr>
                    <tr><td><span><text>主要地位作用 : &nbsp;&nbsp;</text></span></td><td><span><input type='text' value='' name='fileName'></span></td></tr>
                    <tr><td><span><text>历史沿革 : &nbsp;&nbsp;</text></span></td><td><span><input type='text' value='' name='fileName'></span></td></tr>
                    <tr><td><span><text>单位编制现状 : &nbsp;&nbsp;</text></span></td><td><span><input type='text' value='' name='fileName'></span></td></tr>
                    <tr><td><span><text>单位占地面积 : &nbsp;&nbsp;</text></span></td><td><span><input type='text' value='' name='fileName'></span></td></tr>
                    <tr><td><span><text>地理位置 : &nbsp;&nbsp;</text></span></td><td><span><input type='text' value='' name='fileName'></span></td></tr>
                    <tr><td><span><text>地理坐标(经度) : &nbsp;&nbsp;</text></span></td><td><span><input type='text' value='0' name='fileName'></span></td></tr>
                    <tr><td><span><text>地理坐标(纬度) : &nbsp;&nbsp;</text></span></td><td><span><input type='text' value='0' name='fileName'></span></td></tr>
                    <tr><td><span><text>备注 : &nbsp;&nbsp;</text></span></td><td><span><input type='text' value='' name='fileName'></span></td></tr>
                </table>
                `
            );
            $('#select_point').on('click',function(){
                console.log("点击地球");
            });
        },
        yes:function(){
            console.log('添加监测站');
        }
    }
    //添加点号
    ttt.addSignal = {
        open : function(){
            fn_open.openCommonDiv({'title':'添加点号','btn':['添加','取消'],'btn1':ttt.addSignal.yes,'area':['25%','50%']
            ,'offset': 'auto','content':'<div id="addSignalDiv" style="width:100%;height:100%;padding:10px;"></div>',fn:ttt.addSignal.create});
        },
        create:function(){
            $('#addSignalDiv').html(
                `
                <div>
                <span><a href="#" id="select_point"><img style="padding-left: 2%;" src="../../page/img/xz.png"/></a><text>选坐标</text></span>
                </div>
                <hr>
                <table  cellspacing=2 style="width:100%;height:100%">
                    <tr><td><span><text>编号 : &nbsp;&nbsp;</text></span></td><td><span><input type='text' value='' name='fileName'></span></td></tr>
                    <tr><td><span><text>名称 : &nbsp;&nbsp;</text></span></td><td><span><input type='text' value='' name='fileName'></span></td></tr>
                    <tr><td><span><text>所属测站 : &nbsp;&nbsp;</text></span></td><td><span><input type='text' value='' name='fileName'></span></td></tr>
                    <tr><td><span><text>所属基地 : &nbsp;&nbsp;</text></span></td><td><span><input type='text' value='' name='fileName'></span></td></tr>
                    <tr><td><span><text>实地照片 : &nbsp;&nbsp;</text></span></td><td><span><input type='text' value='' name='fileName'></span></td></tr>
                    <tr><td><span><text>主要地位作用 : &nbsp;&nbsp;</text></span></td><td><span><input type='text' value='' name='fileName'></span></td></tr>
                    <tr><td><span><text>单位编制现状 : &nbsp;&nbsp;</text></span></td><td><span><input type='text' value='' name='fileName'></span></td></tr>
                    <tr><td><span><text>单位占地面积 : &nbsp;&nbsp;</text></span></td><td><span><input type='text' value='' name='fileName'></span></td></tr>
                    <tr><td><span><text>地理位置 : &nbsp;&nbsp;</text></span></td><td><span><input type='text' value='' name='fileName'></span></td></tr>
                    <tr><td><span><text>地理坐标(经度) : &nbsp;&nbsp;</text></span></td><td><span><input type='text' value='0' name='fileName'></span></td></tr>
                    <tr><td><span><text>地理坐标(纬度) : &nbsp;&nbsp;</text></span></td><td><span><input type='text' value='0' name='fileName'></span></td></tr>
                    <tr><td><span><text>备注 : &nbsp;&nbsp;</text></span></td><td><span><input type='text' value='' name='fileName'></span></td></tr>
                </table>
                `
            );
            $('#select_point').on('click',function(){
                console.log("点击地球");
            });
        },
        yes:function(){

        }
    }
    //导入数据
    ttt.importData = {
        open : function(){
            fn_open.openCommonDiv({'title':'数据导入','btn':['更新数据','取消'],'btn1':ttt.importData.yes,'area':['30%','25%']
            ,'offset': 'auto','content':'<div id="importDataDiv" style="width:100%;height:100%;padding:10px;"></div>',fn:ttt.importData.create});
        },
        create : function(){
            $('#importDataDiv').html(
                `
                <div><text>数据信息表(Excel表) 所在路径</text></div>
                <div><input type='text' value='' name='filePath'> <button type="button" class="layui-btn layui-btn-xs layui-btn-normal" id="upload03">选择文件</button></div>
                <div><text>关联图标 所在路径</text></div>
                <div><input type='text' value='' name='filePath'> <button type="button" class="layui-btn layui-btn-xs layui-btn-normal" id="upload04">选择文件</button></div>
                `
            );
            let upload = layui.upload;
            upload.render({
                elem: '#upload03'
                ,url: '/upload/'
                ,auto: false
                ,accept:'file'
                //,multiple: true
                ,bindAction: '.layui-layer-btn0'
                ,choose: function(obj){ 
                    var files = obj.pushFile();
                    obj.preview(function(index, file, result){
                        $("input[name='filePath']").val(file.name);
                        $("input[name='fileName']").val(file.name);
                    });
                }
                ,done: function(res){
                  console.log(res)
                }
                ,error : function(index, upload){
                    fn_tool.alert('添加失败!' + index);
                }
              });
        },
        yes:function(){
            console.log("更新数据");
        }

    }
    $('#btn_a1').click(ttt.cut); //截屏
    $('#btn_a2').click(ttt.addImageLayer.open); //添加影像
    $('#btn_a3').click(ttt.addVectorLayer.open); //添加矢量
    $('#btn_a4').click(ttt.addTesting.open); //添加测站
    $('#btn_a5').click(ttt.addEquipment.open); //添加设备
    $('#btn_a6').click(ttt.addSignal.open); //添加点号

    $('#btn_b1').click(ccc.home); //回到原始位置
    $('#btn_b2').click(ttt.importData.open); //导入数据
    $('#btn_b3').click(); //数据
    $('#btn_b4').click(); //回到原始位置
    $("#loginOutDiv").on('click',function(){//退出系统
        fn_tool.alert("退出系统!");
    });
    
}



var PAGE_MAIN = {
    init:function(){
        PAGE_MAIN.Cesium.init();
        PAGE_MAIN.Clock.init();
        PAGE_MAIN.MoveMsg.init();
        //PAGE_MAIN.Openlayes.init();
        PAGE_MAIN.Tool.init(); 
        PAGE_MAIN.Ele.init(); 
    },
    Cesium : {
        init : function(){
            initCesium();
        },
        create:function(){
          
        }
    },
    Clock:{
        init:function(){
            initTime();
        },
        update:function(){

        }
    },
    MoveMsg:{
        entity : null,
        init:function(){
            PAGE_MAIN.MoveMsg.entity = initLonLatMsg();
        },
        getEntity:function(){
            return PAGE_MAIN.MoveMsg.entity;
        },
        update:function(position){
            let entity = PAGE_MAIN.MoveMsg.getEntity();
            let cartesian = viewer.scene.globe.ellipsoid.cartesianToCartographic(position);
            entity.lon =  parseInt(cartesian.longitude / Math.PI * 180);
            entity.lat =  parseInt(cartesian.latitude / Math.PI * 180);
            entity.height =  parseInt(cartesian.height); 
        }
    },
    Openlayes:{
        init:function(){
            initMap();
        }
    },
    Ele:{
        init:function(){
            initElement();
        }
    },
    Tool : {
        init:function(){
            initTool();
        }
    }

}


let fn_open = {

    /**
     * 弹出截图框
     */
    openCutImg : function(dataUrl){
        layer.open({
            type: 1 //此处以iframe举例
            ,title: '截图'
            ,shade: 0
            ,area: ['40%','50%']
            ,maxmin: true
            ,content: '<div id="DivCutImg" style="width:100%;height:100%;"></div>'
            ,success: function(){
                let newImg = document.createElement("img");
                newImg.src =  dataUrl;
                newImg.width = $("#DivCutImg").width();
                newImg.height = $("#DivCutImg").height();
                $('#DivCutImg').empty().append(newImg);
            }
          });
    },
    /**
     * 通用弹出框
     */
    openCommonDiv :function(v){
        if(v  == undefined && v == null){
            fn_tool.alert("没有获取到弹出属性!");
            return false;
        }
        layer.open({
            type: 1 //此处以iframe举例
            ,id:v.id
            ,title: v.title
            ,shade: 0
            ,offset : v.offset
            ,area: v.area
            ,btn:v.btn == undefined ? false: v.btn
            ,btn1:function(){
                if(typeof v.btn1 == 'function'){
                    v.btn1();
                }
            }
            ,maxmin: true
            ,content: v.content
            ,success: function(){
               if(typeof v.fn == 'function'){
                   v.fn();
               }
            },
            end:function(){}

          });
    },
    /**
     * 用户管理
     */
    openUserMannageDiv :function(v){
        if(v  == undefined && v == null){
            fn_tool.alert("没有获取到弹出属性!");
            return false;
        }
        layer.open({
            type: 1
            ,title: v.title
            ,shade: 0
            ,offset : v.offset
            ,area: v.area
            ,maxmin: true
            ,content: v.content
            ,success: function(){
               fn_http.getUserList();
               ttt.userMannage.create();
            },
            end:function(){}

          });
    }

}

/***
 * web前端
 * 封装一些常用的工具
 */
let fn_tool = {
    //提示框
    alert : function(m){
        layer.msg(m,{ icon:2, time:1500, shade:0.4});
    },
    //ajax
    ajax : function(a){
        $.ajax({
            url:a.url,
            type:'post',
            dataType:'application/json',
            data:JSON.stringify(a.data),
            success:function(data){
                if(typeof a.fn == 'function'){
                    a.fn(data);
                }
            },
            error:function(error){
               fn_tool.alert(error);
         }
        });
    },
    webSocket : { //websocket客户端
        ws : null,
        init:function(){
            fn_tool.webSocket.ws = new WebSocket("ws://localhost:8888/ws");
            fn_tool.webSocket.on();
        },
        on : function(){
            fn_tool.webSocket.ws.onopen = function(){
                fn_tool.alert('连接成功');
            }
            fn_tool.webSocket.ws.onmessage  = function(event){
                fn_tool.alert('收到消息');
            }
            fn_tool.webSocket.ws.onclose = function(){
                fn_tool.alert('关闭连接');
            }
            fn_tool.webSocket.ws.onerror = function(){
                cfn_tool.alert('发生异常');
            }
        },
        send : function(obj){
            fn_tool.webSocket.ws.send(JSON.stringify(obj.data));
        }
    }
}
let fn_http = {

    getUserList : function(){
        console.log("获取用户列表");
    },
    delUser : function(id){
        console.log("删除指定用户");
    },
    updateUser : function(id){
        console.log("修改用户");
    },
    addUser : function(user){
        console.log("增加用户");
    },
    login : function(id){
        console.log("登陆");
    },
}
window.onload = function(){
    PAGE_MAIN.init();
} 