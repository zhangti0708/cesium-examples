
/**====================================================================== [图层] ======================================================================================= */
/************************************************* VectorTileController start  ***************************************************** */


/**
 * 加载数据
 * geojson、shape矢量文件动态切片，
 * 实现贴地绘制
 * 调用方法
 *  VectorTileController.build({viewer:viewer,handleType:"",'geojson':geojson,'LayesSource':'../data/vector/world/国家简化边界.shp'});
 * 
 */
var VectorTileController = (function () {
    var viewer,layer = null,worldProvider = null,mouseHandlerDraw;
    function _(){}
	 _.init = function (param,flag){
		if(null === param || undefined === param)return;
		var t = this;
		for(var key in param){
			t[key] = param[key];
		}
		
		this.config();

        if(flag)this.build({type:t.type,'source':t.source});
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
					hue : 1,
					brightness :1,
					contrast :1,
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
	_.getParameter = function(param){
			return this[param];
	}
    _.build = function(param){
        try {
            if(param == null) return;
			viewer = this.viewer
            switch(this.type){
                case "json":{this.formJSON(param);break; }
                default:{this.load(param)}
            }
			this.click();
        } catch (error) {
            console.log(error);
        }
    }
    _.formJSON = function(param){
        $.get(param.source,{},function(json){
            if(json != null && json != ""){
                param.source = json;
                VectorTileController.load(param);
            }else{

                alter("获取数据异常");
            }
        });

    }
    _.load = function(param){
        var _self = this;
        worldProvider  = _self._createProvider({source:param.source});
        worldProvider.readyPromise.then(function () {
            layer = viewer.imageryLayers.addImageryProvider(worldProvider);
        });

        viewer.camera.flyTo({destination: Cesium.Cartesian3.fromDegrees(117, 30,5000000)});
    }
	 _.controller = function(obj){
        if(obj === null) return;
		var t = this,key = obj.key,value = obj.value;
        layer[key] = value;
    }
	_.show = function(n){
		layer.show = !layer.show;
	}
    _.remove = function(){
        if(layer != null)viewer.imageryLayers.remove(layer);
    }
    _._createProvider = function(param){
        if( param  === null ) return;
		var p = this;
        var worldProvider = new Cesium.VectorTileImageryProvider({
            source: param.source,
            defaultStyle : {
				outlineColor: p.outlineColor == null ?  "rgb(255,255,255)" : getColor(p.outlineColor),
                lineWidth: p.lineWidth == null? 2 : p.lineWidth,
                fill: p.fill == null? true : p.fill,
                tileCacheSize: p.tileCacheSize == null? 200 : p.tileCacheSize,
                showMaker: p.showMaker == null? false :p.showMaker,
                showCenterLabel: p.showCenterLabel == null ?true : p.showCenterLabel,
                fontColor: p.fontColor == null? "rgba(255,0,0,1)" :getColor(p.fontColor),
                labelOffsetX: p.labelOffsetX== null? -10 :p.labelOffsetX,
                labelOffsetY: p.labelOffsetY== null? -5 : p.labelOffsetY,
                fontSize: p.fontSize== null? 12 : p.fontSize,
                fontFamily: p.fontFamily== null? "黑体" : p.fontFamily,
                centerLabelPropertyName: p.centerLabelPropertyName== null? "NAME" :p.centerLabelPropertyName
			},
            maximumLevel: p.maximumLevel == null ? 20 :p.maximumLevel,
            minimumLevel: p.minimumLevel == null? 3: p.minimumLevel,
            simplify: p.simplify == null ?false :!false
        });
        return worldProvider;
    }

     _.initSelect = function(){ //创建默认初始化数据
        tableparam	 = [
            {id:"_ids1",type:"select",key:"type",value:["json","shp"],code:["json","shp"]},
            {id:"_ids2",type:"select",key:"source",value:["../../../3dmap/common/data/vector/bjsx.json",'../../../3dmap/common/js/mgrs_index_ftp_link.shp'],code:["../../../3dmap/common/data/vector/bjsx.json",'../../../3dmap/common/js/mgrs_index_ftp_link.shp']},
            {id:"_ids3",type:"text",key:"outlineColor",value:20,code:"outlineColor"},
            {id:"_ids4",type:"text",key:"lineWidth",value:2,code:"lineWidth"},
            {id:"_ids5",type:"text",key:"fontColor",value:20,code:"fontColor"},
            {id:"_ids6",type:"text",key:"fontSize",value:12,code:"fontSize"},
            {id:"_ids7",type:"text",key:"alpha",value:1,code:"alpha"}
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
                outlineColor:parseInt(selectData[2].value),
                lineWidth:parseInt(selectData[3].value),
                fontColor:parseInt(selectData[4].value),
                fontSize:parseInt(selectData[5].value),
                alpha:parseInt(selectData[6].value)
           }
           return initData;
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
            table +
			'<button type="button" class="cesium-button" onclick="VectorTileController.show();">显示</button>'+
			 '<button type="button" class="cesium-button" onclick="VectorTileController.show();">隐藏</button>'+
            '</div>';
            $("#toolbar").remove();
            $("body").append(toolbar);
            $("#toolbar").css("background","rgba(42, 42, 42, 0.8)").css("padding","4px;").css("border-radius", "4px");
            $("#toolbar input").css("vertical-align","middle").css("padding-top","2px").css("padding-bottom","2px");
        }

        _.click = function(){
            var scene = this.viewer.scene;
            if (mouseHandlerDraw != null) {
                mouseHandlerDraw.destroy();
                mouseHandlerDraw = null;
            } 
            mouseHandlerDraw = new Cesium.ScreenSpaceEventHandler(scene.canvas);
            CesiumTooltip.initTool(viewer);
            mouseHandlerDraw.setInputAction(function (movement) {
                if (movement.position != null) {
                    var cartesian = viewer.scene.pick(movement.position);
                // var cartesian = scene.camera.pickEllipsoid(movement.position);
                    console.log(cartesian);
                }
            }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        }
    return _;
})();
/************************************************* VectorTileController end  ***************************************************** */
