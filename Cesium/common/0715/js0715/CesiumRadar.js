/***
 * cesium 地面雷达
 * @author zhangti
 * @version v1
 */
var _cesiumRadar = null;
CesiumRadar = function(){ //雷达对象
    _cesiumRadar = this;
    _raderData = null;
}
/**
 * 初始化雷达对象
 * @author zhangti
 */
CesiumRadar.prototype.init = function(param){
    if(null === param || undefined === param)return;
    var t = this;
    for(var key in param){
        t[key] = param[key];
    }
    
    this.createToolbar(); //创建toolbar
}

/**
 * 绑定事件
 */
CesiumRadar.prototype.config = function(){
    
    var t = this,dataSource = _cesiumRadar._raderData;
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
   
    Sandcastle.addToggleButton('Enabled', true, function(checked) {
        dataSource.clustering.enabled = checked;
    });

    Sandcastle.addToggleButton('Custom Styling', true, function(checked) {
         t.customStyle();
    });

    subscribeParameter('pixelRange');
    subscribeParameter('minimumClusterSize');
    t.click();
}


/**
 * 点击按钮
 * 切换
 */
CesiumRadar.prototype.click = function(){
   /* var t = this;
    console.log(123);
    var handler = new Cesium.ScreenSpaceEventHandler(t.viewer.scene.canvas);
    handler.setInputAction(function(movement) {
        var pickedLabel = viewer.scene.pick(movement.position);
        if (Cesium.defined(pickedLabel)) {
            var ids = pickedLabel.id;
            if (Cesium.isArray(ids)) {
                for (var i = 0; i < ids.length; ++i) {
                    ids[i].billboard.color = Cesium.Color.RED;
                }
            }
        }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);*/
}

/**
 * 聚合
 */
CesiumRadar.prototype.customStyle = function(){//地图放大缩小聚合
        var t = this,dataSource = _cesiumRadar._raderData,removeListener,singleDigitPins = new Array(8);
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

CesiumRadar.prototype.createToolbar = function(){
     var toolbar = '<div id="toolbar">'+
        '<table>'+
            '<tbody><tr>'+
               '<td>Pixel Range</td>'+
                '<td>'+
                    '<input type="range" min="1" max="200" step="1" data-bind="value: pixelRange, valueUpdate: "input" ">'+
                    '<input type="text" size="2" data-bind="value: pixelRange">'+
                '</td>'+
            '</tr>'+
            '<tr>'+
                '<td>Minimum Cluster Size</td>'+
                '<td>'+
                    '<input type="range" min="2" max="20" step="1" data-bind="value: minimumClusterSize, valueUpdate: "input" ">'+
                    '<input type="text" size="2" data-bind="value: minimumClusterSize">'+
                '</td>'+
           '</tr>'+
            '</tbody>'+
        '</table>'+
        '<button type="button" class="cesium-button"><label style="pointer-events: none;"><input type="checkbox" style="pointer-events: none;">Enabled</label></button>'+
        '<button type="button" class="cesium-button"><label style="pointer-events: none;"><input type="checkbox" style="pointer-events: none;">Custom Styling</label></button>'+
    '<div></div>';
    $("#toolbar").remove();
    $("body").append(toolbar);
    $("#toolbar").css("background: rgba(42, 42, 42, 0.8);padding: 4px;border-radius: 4px;")
    $("#toolbar input").css("vertical-align: middle;padding-top: 2px;padding-bottom: 2px;");
}


CesiumRadar.prototype.build = function(param){
    var t = this;
    if(param === null) return;
    switch(param.handleType){
        case "":{ break; }
        default :{  t.loadKml(param); }
    }
}


/**
 * 获取雷达数据
 */
CesiumRadar.prototype.loadKml = function(param){
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
                t.config();
            } catch (error) {
                console.log("error mannager:"+ error);
            }
        }

    });
   
  
}

	
	
