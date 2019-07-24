/**====================================================================== [轨迹回放] ======================================================================================= */
/************************************************* CesiumSatellite start  ***************************************************** */

/***
 * @nanme 卫星扫描
 * @entity 扫描物实体
 * @satellite 卫星实体
 * 
 * @author zhangti
 * @version v1
 */
var CesiumSatellite = (function(){
    var viewer,_cesiumRadar,entitys = [],handler,tableparam;
	function _(){}
	
	_.init = function(param,flag){
		if(null === param || undefined === param)return;
		var t = this;
		for(var key in param){
			t[key] = param[key];
        }
        
        this.config();


        if(flag)this.build({popParam:['name',['cylinder','slices'],['cylinder','length'],['cylinder','topRadius']]});
	}
	_.config = function(){
        var _self = this;
        _self.createtoolbar();
        var viewModel = {
            entitySlices: _self.entitySlices,
            entityColor: _self.entityColor,
            RadarRPC: _self.RadarRPC
        };
        Cesium.knockout.track(viewModel);
        var toolbar = document.getElementById('toolbar');
        Cesium.knockout.applyBindings(viewModel, toolbar);
    
        var  subscribeParameter = function(name) {
            Cesium.knockout.getObservable(viewModel, name).subscribe(
                function(newValue) {
                    _self.controller({key:name,value:newValue});
                }
            );
        }
        subscribeParameter('entitySlices');
        subscribeParameter('entityColor');
        subscribeParameter('RadarRPC');

        this.clickButton();
	}
	
	_.build = function(param){
        var t =this;
        viewer = this.viewer,this.popParam = param.popParam;
		try {
            switch(t.handleType){
                case "":{ break; }
                default :{  t.createSatellite(); }
            }
        } catch (error) {
            console.log("error mannager:" + error);
        }
    }
    _.createSatellite = function(){
        var t = this;
        viewer.dataSources.add(Cesium.CzmlDataSource.load(t.sources)).then(function(dataSource) { //czml文件
               try{
                    t.satellite = dataSource;

                    t.createRadar();
                    
                    t.add();

                    t.click();
               }catch(e){
                    console.log(e);
               }
               
        });
    }
    _.createRadar = function(){ //创建地面雷达
        _cesiumRadar = new CesiumRadar();
        _cesiumRadar.init({
            viewer : this.viewer,
            pixelRange:15,
            minimumClusterSize:3,
            enabled:false,
            showtoolbar:false
        });
        _cesiumRadar.build({
            handleType : "def",
            kml:'../../Apps/SampleData/kml/facilities/facilities.kml'
        });   
    }
    _.createEntity = function(height){ //创建扫描物
        var _self = this;
        var param = {
            length: Math.max.apply(null,height),
            slices:_self.entitySlices,
            material:_self.entityColor
        }
        entity = new _cesiumTool({viewer:this.viewer}).createEntity({handleType:"cylinder",p:param});
        return entity;
    }
     /**
     * CZML是一种JSON格式的字符串，用于描述与时间有关的动画场景，
     * CZML包含点、线、地标、模型、和其他的一些图形元素，并指明了这些元素如何随时间而变化。
     * 某种程度上说, Cesium 和 CZML的关系就像 Google Earth 和 KML。
     * 
     * 其中如动图所示，扫描的样式是用cylinder做的，这个后续会再完善成波纹形状；
     * 主要还是运用了sampleproperty，将卫星运动的time和position也绑定到cylinder上，
     * 并且将cylinder的高度修改为卫星的一半；
     * @property 动态物
    */
    _.add = function(){  //绑定卫星
        var satellites= this.satellite;
        if(satellites === null)return;
        var ids = this.ids;timeNum = this.timeNum;
        for(var i in ids){
            var satellite = satellites.entities.getById(ids[i]);
            var property = new Cesium.SampledPositionProperty();
            var height = [];
            //将提供的秒数添加到提供的日期实例 格式化日期
            for (var ind = 0; ind < timeNum; ind++) { //300 * n 秒数
                //结束时间
                var time = Cesium.JulianDate.addSeconds(viewer.clock.startTime, 300*ind, new Cesium.JulianDate());
                //获取结束时间的位置
                var position = satellite.position.getValue(time); //satellite的属性
                //获取移动运动点
                var cartographic = viewer.scene.globe.ellipsoid.cartesianToCartographic(position);
                var lat = Cesium.Math.toDegrees(cartographic.latitude),
                    lng = Cesium.Math.toDegrees(cartographic.longitude),
                    hei = cartographic.height/2;
                    height.push(cartographic.height);
                //绑定卫星点    
                property.addSample(time, Cesium.Cartesian3.fromDegrees(lng, lat, hei));
            }
            var entity = this.createEntity(height);
             //设置插值位置时使用的算法和度数。
             entity.position = property;
             entity.position.setInterpolationOptions({ //设定位置的插值算法
                 interpolationDegree: 5,
                 interpolationAlgorithm: Cesium.LagrangePolynomialApproximation
             });
             entitys.push(entity);
        }
    }
	_.controller = function(obj){
        if(obj == null) return;
        var key = obj.key,value = parseInt(obj.value);
        var change = function(geom,property,value){
            for(var i in entitys){
                entitys[i][geom][property] = value; 
            }
        }
        if("entitySlices" == key)change("cylinder","slices",value);
        if("entityColor" == key)change("cylinder","material",getColor(value));
        if("RadarRPC" == key)_cesiumRadar.setPixelRange(value);
    }
    _.click = function(){
        handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas),_self = this;
        handler.setInputAction(function(movement) {
            try {
                console.log(movement.position);
                var pickedLabel = viewer.scene.pick(movement.position);
                if (Cesium.defined(pickedLabel)) {
                    var featrue = pickedLabel.id;
                    if(featrue == null) return;
                    _PopController.init({
                        featrue:featrue,
                        paramArr:_self.popParam, //build传的参数
                        x:movement.position.x,
                        y:movement.position.y
                    });
                    _PopController.show()
                }
            } catch (error) {
                console.log(error);
            }
           
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }
    _.clickButton = function(){
        var t = this;
        $("._button").prop("checked",true);
        $('[type="checkbox"]').click(function(){
             var name = $(this).attr('name');
             if("satellite" == name){
                t[name].show = !t[name].show;
             }else if("radar" == name){
                _cesiumRadar._raderData.show = !_cesiumRadar._raderData.show;
             }else if("entity"){
                for(var i in entitys){
                    entitys[i].show = !entitys[i].show;
                }
             }
            
    	})
    }

    _.remove = function(){
        var t = this;
        if(handler != null){
            handler.destroy();
            handler = null;

            t.satellite.show = false;
            _cesiumRadar._raderData.show = false;
        }
        if(entitys == 0){
            for(var i in entitys){
                viewer.entities.removeById(entitys[i].id)
            }
        }

    }

    _.initSelect = function(){ //创建默认初始化数据
        tableparam	 = [	
            {id:"_ids1",type:"select",key:"ids",value:["Satellite/ISS","Satellite/Geoeye1"],code:["Satellite/ISS","Satellite/Geoeye1"]},
            {id:"_ids2",type:"select",key:"type",value:["czml"],code:["czml"]},
            {id:"_ids3",type:"select",key:"sources",value:["../../Apps/SampleData/simple.czml"],code:["../../Apps/SampleData/simple.czml"]},
            {id:"_ids4",type:"text",key:"timeNum",value:288,code:"timeNum"},
            {id:"_ids5",type:"text",key:"entity",value:"圆锥",code:"entity"},
            {id:"_ids6",type:"text",key:"entitySlices",value:4,code:"entitySlices"},
            {id:"_ids7",type:"text",key:"entityColor",value:10,code:"entityColor"},
            {id:"_ids8",type:"text",key:"RadarRPC",value:10,code:"RadarRPC"}   
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
            ids:[selectData[0].value],
            handType:selectData[1].value,
            sources:selectData[2].value, 
            timeNum:parseInt(selectData[3].value),
            entity : selectData[4].value,
            entitySlices:parseInt(selectData[5].value),
            entityColor:getColor(selectData[6].value),
            RadarRPC:parseInt(selectData[7].value)
       }
       
       return initData;

    }
    _.createtoolbar = function (){
        var toolbarparam	 = [	
            {type:"range",key:"entitySlices",value:4,min:"1",max:"20",step:"1"},
            {type:"range",key:"entityColor",value:10,min:"0",max:"147",step:"1"},
            {type:"range",key:"RadarRPC",value:10,min:"2",max:"20",step:"1"}   
        ]
        var table = createToolbar(toolbarparam);
        var toolbar = 
        '<div id="toolbar">'+
         table +
        '<button type="button" class="cesium-button"><label><input type="checkbox" class="_button" name="satellite">卫星</label></button>'+
        '<button type="button" class="cesium-button"><label><input type="checkbox" class="_button" name="radar">雷达</label></button>'+
        '<button type="button" class="cesium-button"><label><input type="checkbox" class="_button" name="entity">扫描物</label></button>'+
        '</div>';
        $("#toolbar").remove();
        $("body").append(toolbar);
        $("#toolbar").css("background","rgba(42, 42, 42, 0.8)").css("padding","4px;").css("border-radius", "4px");
        $("#toolbar input").css("vertical-align","middle").css("padding-top","2px").css("padding-bottom","2px");
    }
    return _;
})();


/************************************************* CesiumSatellite end  ***************************************************** */
