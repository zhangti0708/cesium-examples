/*
 * @Descripttion: 
 * @version: 1.0
 * @Author: zhangti
 * @Date: 2019-09-23 09:33:34
 * @LastEditors: sueRimn
 * @LastEditTime: 2019-09-23 15:42:43
 */

/**
 * 卫星通信
 * viewer
 * url:"../common/data/czml/test.czml"
 * code:{}
 */
var viewer;
var WXTX = (function(){
    //全局的属性
    let viewer,radar,satelliteAll = []
    ,transit = [],selectedEntity
    ,handle = null,renderTime,passTime = []
    ,pass_old = [],iden = true
    ,pickedFeature = null,num_pass = 0
    ,radarEntity = [],_entity = []
    ,data = null,t = null;

    function _(){}
    _.prototype.init = function(v,u){
        this.url = u;
        viewer = v;
        handle = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
        selectedEntity = new Cesium.Entity();
        $('div.cesium-infoBox').removeClass('cesium-infoBox-bodyless');
        $('div.cesium-infoBox').addClass('cesium-infoBox-visible');
        this.load(this.url);
        this.handle();
        t = this;
    }
    _.prototype.destroy = function(){
        if(viewer == undefined && viewer == null){
             console.log("没有获取到视图");
             return false;
        }
        for(let i in _entity)viewer.entities.remove(_entity[i]);
        viewer.dataSources.remove(data);
        viewer.clock.shouldAnimate = false;
        handle.destroy();
        handle = null;
        $('div.cesium-infoBox').removeClass('cesium-infoBox-visible');
        $('div.cesium-infoBox').addClass('cesium-infoBox-bodyless');
    }
    _.prototype.load = function(url){
		//load数据
		viewer.dataSources.add(Cesium.CzmlDataSource.load(url)).then(function(dataSource) {
            data = dataSource;
			radar = dataSource.entities.getById("Facility/AGI");
			var satellite1 = dataSource.entities.getById("Satellite/ISS");
			var satellite2 = dataSource.entities.getById("Satellite/Geoeye1");
			var transit1 = dataSource.entities.getById("Facility/AGI-to-Satellite/ISS");
			var transit2 = dataSource.entities.getById("Facility/AGI-to-Satellite/Geoeye1");
			satelliteAll = [satellite1,satellite2]
            transit = [transit1,transit2]
           try{
                t.scan2();
                t.getSatelliteInfo()
                t.createEntity([radar]);
           }catch(e){
             console.log(e.message);
           }
          
		})
    }
    _.prototype.scan2 = function(){
        if(satelliteAll.length == 0 && satelliteAll == undefined)return;
        for(var i in satelliteAll){
            var positions = satelliteAll[i].position.getValue(viewer.clock.currentTime);
            scan_p = t.getPoint(positions);
            new createPoint(scan_p,satelliteAll[i]);
        }
    }
    _.prototype.getPoint = function(positions){
            var cartographic = viewer.scene.globe.ellipsoid.cartesianToCartographic(positions);
			var lat = Cesium.Math.toDegrees(cartographic.latitude),
						lng = Cesium.Math.toDegrees(cartographic.longitude),
						hei = parseFloat(cartographic.height/4);
			return Cesium.Cartesian3.fromDegrees(lng, lat,0);
    }
    _.prototype.createEntity = function(radar){
        if(radar.length == 0 && radar == undefined)return;
        for(var n in radar){//radar
            var l,r;
            var positions = radar[n].position.getValue();
            if(positions.length == 0) return;
            var cartographic = viewer.scene.globe.ellipsoid.cartesianToCartographic(positions);
            var lat = Cesium.Math.toDegrees(cartographic.latitude),lon = Cesium.Math.toDegrees(cartographic.longitude), height = cartographic.height;
            //radarscan
            r = new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(90),
            Cesium.Math.toRadians(0),Cesium.Math.toRadians(0));
            l = Cesium.Cartesian3.fromDegrees(lon, lat, height);
            var e = viewer.entities.add({
                position: l,
                orientation: Cesium.Transforms.headingPitchRollQuaternion(l,r),
                rectangularSensor: new Cesium.RectangularSensorGraphics({
                        radius: 380000,
                        xHalfAngle: Cesium.Math.toRadians(50),
                        yHalfAngle: Cesium.Math.toRadians(50),
                        material: new Cesium.Color(0, 1, 1, .4),
                        lineColor: new Cesium.Color(0, 1, 1, 1),
                        showScanPlane: true,
                        scanPlaneColor: new Cesium.Color(0, 1, 1, 1),
                        scanPlaneMode: "vertical",
                        scanPlaneRate: 3,
                        showThroughEllipsoid: !1
                    })
                });
                radarEntity.push(e);
                _entity.push(e);
        }
    }
    _.prototype.getSatelliteInfo = function(){
        if(transit.length == 0)return;
        t.getSatelliteTime(transit);//格式化通信数据
        selectedEntity.name = "PASS";
        selectedEntity.description = t.infoTable_1(dayjs(Cesium.JulianDate.addHours(viewer.clock.currentTime,-8,new Cesium.JulianDate())).format("YYYY-MM-DD HH:mm:ss"));
        viewer.selectedEntity = selectedEntity;
        viewer.clock.onTick.addEventListener(function(clock) {
                if(!clock.shouldAnimate)return;
                if(iden)selectedEntity.description = t.infoTable_1(t.pass(clock));//标识符  进来展示所有卫星信息
                if(!iden){
                    if(pickedFeature == null)return;
                    if("radar" == pickedFeature.type){
                        pickedFeature.id.description = pickedFeature.temp + t.infoTable_1(t.pass(clock));
                    }else{
                        var position = pickedFeature.id.position.getValue(clock.currentTime);
                        var f_position = viewer.scene.globe.ellipsoid.cartesianToCartographic(position);
                        pickedFeature.id.description = t.infoTable_2( pickedFeature.id.name,f_position) + ' <h2> Passes </h2>' + t.infoTable_3(t.pass(clock),pickedFeature.id.name);
                    }
                }
        });	
        viewer.clock.onStop.addEventListener(function(clock){
            //格式化卫星数据
           if(transit.length == 0)return;
           t.getSatelliteTime(transit);
        });
    }
    _.prototype.pass = function(clock){
        //当前时间
        var currentTime = dayjs(Cesium.JulianDate.addHours(clock.currentTime,-8,new Cesium.JulianDate())).format("YYYY-MM-DD HH:mm:ss");
        return currentTime;
    }
    _.prototype.index_rm = function(n){
        if(pass_old.length == 0)return;
        pass_old[n].splice(0,1); //删除第一个
    }
    _.prototype.getSatelliteTime = function(transit){
        if(transit.length != 0 || transit != undefined){
            passTime = [],pass_old = []; //查看方式区分开 以免冲突
            for(var n in transit){
                var interval = [],interval_old = [];
                var n_interval = transit[n].availability._intervals;
                for(var i in n_interval){
                    var start = dayjs(Cesium.JulianDate.addHours(n_interval[i].start,-8,new Cesium.JulianDate())).format("YYYY-MM-DD HH:mm:ss");
                    var stop = dayjs(Cesium.JulianDate.addHours(n_interval[i].stop,-8,new Cesium.JulianDate())).format("YYYY-MM-DD HH:mm:ss");
                    interval.push({name:transit[n].name,"startTime":start,"stopTime":stop,"interval":dayjs(stop).diff(dayjs(start), 'millisecond')});
                    interval_old.push({name:transit[n].name,"startTime":start,"stopTime":stop,"interval":dayjs(stop).diff(dayjs(start), 'millisecond')});
                }
                passTime.push(interval);
                pass_old.push(interval_old);
            }
        }
    }
    _.prototype.infoTable_1 = function(currentTime){
        if(pass_old.length == 0)return;
			var tr = "",table = `<table class="cesium-infoBox-defaultTable"><thead><tr><th>卫星</th><th>倒计时(ms)</th><th>通信开始(date)</th><th>通信结束(date)</th><th>通信时长(ms)</th></tr></thead><tbody>`;
			for(var n in pass_old){
				if(pass_old[n].length == 0)continue;
				var interval_pass = pass_old[n][0]; //始终取第一个 
				renderTime =  dayjs(interval_pass.startTime).diff(dayjs(currentTime));
				if(renderTime <= 0){
					if(renderTime <= -(interval_pass.interval)){
						t.index_rm(n);
					}else{
						renderTime = "PASS";
					}
				}
				tr += `<tr><td>${interval_pass.name}</td><td>${renderTime}</td><td>${interval_pass.startTime}</td><td> ${interval_pass.stopTime}</td><td> ${interval_pass.interval}</td></tr>`;
			}
			return table + tr + `</tbody></table>`;
    }
    _.prototype.infoTable_2 = function(f_name,cartesian){
        if(f_name == undefined && cartesian == undefined)return;
        var tr = "",table = `<h2> Position </h2><table class="cesium-infoBox-defaultTable"><thead><tr><th>Name</th><th>Latitude</th><th>Longitude</th><th>Elevation</th></tr></thead><tbody>`;
        var f_point = [ parseInt(cartesian.longitude / Math.PI * 180), parseInt(cartesian.latitude / Math.PI * 180)];
        tr = `<tr><td>${f_name}</td><td>${f_point[0]}°</td><td>${f_point[1]}°</td><td> ${parseInt(cartesian.height)}</td></tr>`;
        return table + tr + `</tbody></table>`;
    }
    _.prototype.infoTable_3 = function(currentTime,featureName){
        if(passTime.length == 0 && featureName == undefined)return;
			var t_interval = function(){
				for(var i in passTime){if(passTime[i][0].name.indexOf(featureName)!=-1)return passTime[i];}
			}
			var interval = t_interval();
			var tr = "",table = `<table class="cesium-infoBox-defaultTable"><thead><tr><th>卫星</th><th>倒计时(ms)</th><th>通信开始(date)</th><th>通信结束(date)</th><th>通信时长(ms)</th></tr></thead><tbody>`;
			for(var i in interval){
				renderTime =  dayjs(interval[i].startTime).diff(dayjs(currentTime));
				if(renderTime <= 0)renderTime = 0;
				tr += `<tr><td>${interval[i].name}</td><td>${renderTime}</td><td>${interval[i].startTime}</td><td> ${interval[i].stopTime}</td><td> ${interval[i].interval}</td></tr>`;
			}
			return table + tr + `</tbody></table>`;
    }
    _.prototype.handle = function(){
        //点击追踪
	   handle.setInputAction(function(click){
			if(viewer.scene.pick(click.position) == undefined)return;
			pickedFeature = viewer.scene.pick(click.position);
			if (!Cesium.defined(pickedFeature) && pickedFeature == undefined)return;
			if(pickedFeature.id.description == undefined)return; //自己创建的
			var f_name = pickedFeature.id.name,f_position,table;
			try{
				var position = pickedFeature.id.position.getValue();
				pickedFeature.type = "radar";
			}catch(e){
				var position = pickedFeature.id.position.getValue(viewer.clock.currentTime);
				pickedFeature.type = "satellite";
			}
			f_position = viewer.scene.globe.ellipsoid.cartesianToCartographic(position);
			pickedFeature.id.description  = t.infoTable_2(f_name,f_position);
			//viewer.selectedEntity = selectedEntity;
			pickedFeature.id.name  = f_name;
			pickedFeature.temp = pickedFeature.id.description + "<h2> Passes <h2>";
			iden = false; //点击事件改变标识符

		},Cesium.ScreenSpaceEventType.LEFT_DOWN);
    }

    var createPoint = (function(){
        function _(positions,satellite){
            this.options = {
                 cylinder: {
                    HeightReference: Cesium.HeightReference.RELATIVE_TO_GROUND, //表示相对于地形的位置。
                    length:600000,     //长度
                    topRadius:0,    //顶点半径
                    bottomRadius:600000 / 2,  //底部半径
                    material:new Cesium.Color(0, 1, 1, .4),
                    slices:4
                }
            }
            this.positions = positions;
            this.satellite = satellite;
            this._init();
        }
        _.prototype._init = function(){
            var _self = this;
            var _update = function(){
                var positions = _self.satellite.position.getValue(viewer.clock.currentTime);
                return scan_p = t.getPoint(positions);
            };
            var _length = function(){
                var positions = _self.satellite.position.getValue(viewer.clock.currentTime);
                var cartographic = viewer.scene.globe.ellipsoid.cartesianToCartographic(positions);
                return cartographic.height * 2;
            }
            this.options.position = new Cesium.CallbackProperty(_update,false);
            this.options.cylinder.length = new Cesium.CallbackProperty(_length,false);
            _entity.push(viewer.entities.add(this.options));
        };
        return _;
    })();

    return _;

})();



/**天气**/
var snow = (function(){
            
    function _(){};

    _.prototype.init = function(){
        this.create();
    },

    _.prototype.create = function(){
        var collection = viewer.scene.postProcessStages;
        var fs_snow = this.getFS();
        this.snow = new Cesium.PostProcessStage({
            name: 'czm_snow',
            fragmentShader: fs_snow
        });
        collection.add(this.snow);
        viewer.scene.skyAtmosphere.hueShift = -0.8;
        viewer.scene.skyAtmosphere.saturationShift = -0.7;
        viewer.scene.skyAtmosphere.brightnessShift = -0.33;
        viewer.scene.fog.density = 0.001;
        viewer.scene.fog.minimumBrightness = 0.8;
    }

    _.prototype.getFS = function(){
        return "uniform sampler2D colorTexture;\n\
            varying vec2 v_textureCoordinates;\n\
        \n\
            float snow(vec2 uv,float scale)\n\
            {\n\
                float time = czm_frameNumber / 60.0;\n\
                float w=smoothstep(1.,0.,-uv.y*(scale/10.));if(w<.1)return 0.;\n\
                uv+=time/scale;uv.y+=time*2./scale;uv.x+=sin(uv.y+time*.5)/scale;\n\
                uv*=scale;vec2 s=floor(uv),f=fract(uv),p;float k=3.,d;\n\
                p=.5+.35*sin(11.*fract(sin((s+p+scale)*mat2(7,3,6,5))*5.))-f;d=length(p);k=min(d,k);\n\
                k=smoothstep(0.,k,sin(f.x+f.y)*0.01);\n\
                return k*w;\n\
            }\n\
        \n\
            void main(void){\n\
                vec2 resolution = czm_viewport.zw;\n\
                vec2 uv=(gl_FragCoord.xy*2.-resolution.xy)/min(resolution.x,resolution.y);\n\
                vec3 finalColor=vec3(0);\n\
                float c = 0.0;\n\
                c+=snow(uv,30.)*.0;\n\
                c+=snow(uv,20.)*.0;\n\
                c+=snow(uv,15.)*.0;\n\
                c+=snow(uv,10.);\n\
                c+=snow(uv,8.);\n\
            c+=snow(uv,6.);\n\
                c+=snow(uv,5.);\n\
                finalColor=(vec3(c)); \n\
                gl_FragColor = mix(texture2D(colorTexture, v_textureCoordinates), vec4(finalColor,1), 0.5); \n\
        \n\
            }\n\
        ";
    }
    _.prototype.remove = function(){
        this.snow.destroy();
    }
    return _;
})();

/**下雨 */
var rain = (function(){
    function _(){};

    _.prototype.init = function(){
        this.create();
    }
    _.prototype.create = function(){
        var collection = viewer.scene.postProcessStages;
        var fs_rain = this.getFS();
        this.rain = new Cesium.PostProcessStage({
            name: 'czm_rain',
            fragmentShader: fs_rain
        });
        collection.add(this.rain);
        viewer.scene.skyAtmosphere.hueShift = -0.8;
        viewer.scene.skyAtmosphere.saturationShift = -0.7;
        viewer.scene.skyAtmosphere.brightnessShift = -0.33;
        viewer.scene.fog.density = 0.001;
        viewer.scene.fog.minimumBrightness = 0.8;
    }
    _.prototype.getFS = function(){
        return "uniform sampler2D colorTexture;\n\
                varying vec2 v_textureCoordinates;\n\
            \n\
                float hash(float x){\n\
                    return fract(sin(x*133.3)*13.13);\n\
            }\n\
            \n\
            void main(void){\n\
            \n\
                float time = czm_frameNumber / 60.0;\n\
            vec2 resolution = czm_viewport.zw;\n\
            \n\
            vec2 uv=(gl_FragCoord.xy*2.-resolution.xy)/min(resolution.x,resolution.y);\n\
            vec3 c=vec3(.6,.7,.8);\n\
            \n\
            float a=-.4;\n\
            float si=sin(a),co=cos(a);\n\
            uv*=mat2(co,-si,si,co);\n\
            uv*=length(uv+vec2(0,4.9))*.3+1.;\n\
            \n\
            float v=1.-sin(hash(floor(uv.x*100.))*2.);\n\
            float b=clamp(abs(sin(20.*time*v+uv.y*(5./(2.+v))))-.95,0.,1.)*20.;\n\
            c*=v*b; \n\
            \n\
            gl_FragColor = mix(texture2D(colorTexture, v_textureCoordinates), vec4(c,1), 0.5);  \n\
            }\n\
             ";
    }
    _.prototype.remove = function(){
        this.rain.destroy();
    }
    return _;
})();
/**飞机 */
var fly = (function(){
    let viewer;
    function _(){};

    _.prototype.init = function(v){
        viewer = v;
        this.create(this.load());
    }
    _.prototype.create = function(data){
           // 起始时间
           let start = new Cesium.JulianDate();
           // 结束时间
           let stop = Cesium.JulianDate.addSeconds(start, (data[0].length-1)*120,new Cesium.JulianDate());
           // 设置始时钟始时间
           viewer.clock.startTime = start.clone();
           // 设置时钟当前时间
           viewer.clock.currentTime = start.clone();
           // 设置始终停止时间
           viewer.clock.stopTime  = stop.clone();
           // 时间速率，数字越大时间过的越快
           viewer.clock.multiplier = 10;
           // 循环执行
           viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP;
           //设置初始位置
           viewer.camera.setView({
                destination: Cesium.Cartesian3.fromDegrees(data[0][0].longitude,data[0][0].dimension,300000)
            });
           for(let j=0; j<data.length; j++)
           {
               let property = new Cesium.SampledPositionProperty();
               for(let i=0; i<data[j].length; i++){
                   let time = Cesium.JulianDate.addSeconds(start, data[j][i].time, new Cesium.JulianDate());
                   let position = Cesium.Cartesian3.fromDegrees(data[j][i].longitude, data[j][i].dimension, data[j][i].height);
                   // 添加位置，和时间对应
                   property.addSample(time, position);
               }
               // 添加模型
              this.fly = viewer.entities.add({
                   id: "fly",
                   // 和时间轴关联
                   availability : new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({
                       start : start,
                       stop : stop
                   })]),
                   position: property,
                   //基于位置移动自动计算方向.
                   orientation: new Cesium.VelocityOrientationProperty(property),
                   // 模型数据,跨域，模型文件必须放本地
                   model: {
                       uri: '../../../src/Apps/SampleData/models/CesiumAir/Cesium_Air.gltf',
                       scale: 6,
                       minimumPixelSize: 64
                   },
                   //路径
                   path : {
                       resolution : 1,
                       //设置航线样式，线条颜色，内发光粗细，航线宽度等
                       material : new Cesium.PolylineGlowMaterialProperty({
                           glowPower : 0.1,
                           color : Cesium.Color.YELLOW
                       }),
                       width : 30
                   }
               });
           }
           viewer.clock.shouldAnimate = true;
    }
    _.prototype.load = function(){
        // 数据
        let data = [];
        data[0] = [
            {longitude:116.538799, dimension:39.9948, height:0, time:0},
            {longitude:116.130034, dimension:38.291387, height:5000, time:120},
            {longitude:116.415192, dimension:34.841955, height:5000, time:240},
            {longitude:117.261468, dimension:31.831171, height:5000, time:360}, 
            {longitude:115.881671, dimension:28.70164, height:5000, time:480},
            {longitude:116.120835, dimension:24.308311, height:5000, time:600},
            {longitude:113.269254, dimension:23.13956, height:0, time:720}
        ];
        return data;
    }
    _.prototype.remove = function(){
        if(viewer != undefined)
        {
            viewer.entities.remove(this.fly);
            viewer.clock.shouldAnimate = false;
        }
    }
    return _;
})();
/***挖地分析 */
var drawTerrain = (function () {
    let viewer, e = [], t;
    function _(v) {
        viewer = v, t = this;
        this.init();
    }
    _.prototype = {
        init: function () {

            $('button[name="wdxhz"]').off('click');
            $('button[name="wdxhz"]').on('click', function () {
                t.draw();
            });
        },
        draw: function () {
            DrawDynamicPrimitive.startDrawingCircle(viewer, function (cartesians) {
                var length = Cesium.Cartesian3.distance(cartesians[0], cartesians[1]);
                t.entity(cartesians, length);
                var clippingPlanes = new Cesium.ClippingPlaneCollection({
                    //modelMatrix : Cesium.Transforms.eastNorthUpToFixedFrame(cartesians[0]),
                    modelMatrix: t.box.computeModelMatrix(Cesium.JulianDate.now()),
                    planes: [
                        new Cesium.ClippingPlane(new Cesium.Cartesian3(1.0, 0.0, 0.0), -700),
                        new Cesium.ClippingPlane(new Cesium.Cartesian3(-1.0, 0.0, 0.0), -700),
                        new Cesium.ClippingPlane(new Cesium.Cartesian3(0.0, 1.0, 0.0), -700),
                        new Cesium.ClippingPlane(new Cesium.Cartesian3(0.0, -1.0, 0.0), -700)
                    ],
                    edgeWidth: 1.0,
                    edgeColor: Cesium.Color.WHITE,
                    enabled: true
                });
                viewer.scene.globe.clippingPlanes = clippingPlanes;
            });
        },
        entity: function (cartesians, length) {
            this.box = viewer.entities.add({
                position: cartesians[0],
                box: {
                    dimensions: new Cesium.Cartesian3(1400.0, 1400.0, 2800.0),
                    material: Cesium.Color.fromRandom({ alpha: 0.5 }),
                    outline: true,
                    outlineWidth: 2,
                    outlineColor: Cesium.Color.WHITE
                }
            });
            e.push(this.box);
        },
        remove: function () {
            if (viewer != undefined) {
                for (let i in e) viewer.entities.remove(e[i]);
                viewer.scene.globe.clippingPlanes = undefined;
                $('button[name="wdxhz"]').remove();
            }
        }
    }
    return _;
})();
/**
 * 淹没分析
 */
let drownAnalyze = (function () {
    let viewer, t;
    function _(v) {
        viewer = v;
        t = this;
        this.init();
    }
    _.prototype = {
        init: function () {
            $('button[name="ymfx"]').off('click');
            $('button[name="ymfx"]').on('click', function () {
                t.create();
            });
        },
        create: function () {
            arewAnalyze(viewer, 50, 10, 1, t);
        },
        remove: function () {
            if (viewer != undefined) {
                $('button[name="ymfx"]').remove();
                viewer.entities.remove(t.waterEntity);
                for (let i in t.floatingPoint) viewer.entities.remove(t.floatingPoint[i]);
                if (t.handler != null) t.handler.destroy();
            }
        }
    }
    return _;
})();
function arewAnalyze(viewer, maxH, interval, speed, t) {
    //鼠标事件
    t.waterEntity = null;
    var positions = [];
    t.tempPoints = [];
    var polygon = null;
    var cartesian = null;
    t.floatingPoint = [];//浮动点
    t.handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    t.handler.setInputAction(function (movement) {
        // cartesian = viewer.scene.pickPosition(movement.endPosition);
        let ray = viewer.camera.getPickRay(movement.endPosition);
        cartesian = viewer.scene.globe.pick(ray, viewer.scene);
        //cartesian = viewer.scene.camera.pickEllipsoid(movement.endPosition, viewer.scene.globe.ellipsoid);
        if (positions.length >= 2) {
            if (!Cesium.defined(polygon)) {
                polygon = new PolygonPrimitive(positions);
            } else {
                positions.pop();
                // cartesian.y += (1 + Math.random());
                positions.push(cartesian);
            }
        }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    t.handler.setInputAction(function (movement) {
        // cartesian = viewer.scene.pickPosition(movement.position);
        let ray = viewer.camera.getPickRay(movement.position);
        cartesian = viewer.scene.globe.pick(ray, viewer.scene);
        //cartesian = viewer.scene.camera.pickEllipsoid(movement.position, viewer.scene.globe.ellipsoid);
        if (positions.length == 0) {
            positions.push(cartesian.clone());
        }
        //positions.pop();
        positions.push(cartesian);
        //在三维场景中添加点
        var cartographic = Cesium.Cartographic.fromCartesian(positions[positions.length - 1]);
        var longitudeString = Cesium.Math.toDegrees(cartographic.longitude);
        var latitudeString = Cesium.Math.toDegrees(cartographic.latitude);
        var heightString = Cesium.Math.toDegrees(cartographic.height);
        t.tempPoints.push({ lon: longitudeString, lat: latitudeString, hei: heightString });
        t.floatingPoint.push(viewer.entities.add({
            name: '多边形面积',
            position: positions[positions.length - 1],
            point: {
                pixelSize: 10,
                color: Cesium.Color.RED,
                outlineColor: Cesium.Color.WHITE,
                outlineWidth: 3,
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
            }
        }));
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    t.handler.setInputAction(function (movement) {
        t.handler.destroy();
        positions.pop();
        var textArea = getArea(t.tempPoints) + "平方公里";
        //面积标签
        t.floatingPoint.push(viewer.entities.add({
            name: '多边形面积',
            position: positions[positions.length - 1],
            label: {
                text: textArea,
                font: '18px sans-serif',
                fillColor: Cesium.Color.GOLD,
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                outlineWidth: 2,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                pixelOffset: new Cesium.Cartesian2(20, -40),
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
            }
        }))
        //二秒后开始进入淹没分析
        setTimeout(function () {
            if (t.waterEntity) {
                viewer.scene.globe.depthTestAgainstTerrain = true;
                t.waterEntity.polygon.heightReference = "CLAMP_TO_GROUND";
                t.waterEntity.polygon.material = "../../common/3d/plugin/ysc/images/water.png";
                var h = 0.0;
                t.waterEntity.polygon.extrudedHeight = h;
                var st = setInterval(function () {
                    h = h + speed;
                    if (h >= maxH) {
                        h = maxH;//给个最大值
                        clearTimeout(st);
                    }
                    t.waterEntity.polygon.extrudedHeight = h;
                }, interval);
            }
        }, 2000);
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

    var radiansPerDegree = Math.PI / 180.0;//角度转化为弧度(rad)
    var degreesPerRadian = 180.0 / Math.PI;//弧度转化为角度

    //计算多边形面积
    function getArea(points) {
        var res = 0;
        //拆分三角曲面
        for (var i = 0; i < points.length - 2; i++) {
            var j = (i + 1) % points.length;
            var k = (i + 2) % points.length;
            var totalAngle = Angle(points[i], points[j], points[k]);
            var dis_temp1 = distance(positions[i], positions[j]);
            var dis_temp2 = distance(positions[j], positions[k]);
            res += dis_temp1 * dis_temp2 * Math.abs(Math.sin(totalAngle));
        }
        return (res / 1000000.0).toFixed(4);
    }

    /*角度*/
    function Angle(p1, p2, p3) {
        var bearing21 = Bearing(p2, p1);
        var bearing23 = Bearing(p2, p3);
        var angle = bearing21 - bearing23;
        if (angle < 0) {
            angle += 360;
        }
        return angle;
    }
    /*方向*/
    function Bearing(from, to) {
        var lat1 = from.lat * radiansPerDegree;
        var lon1 = from.lon * radiansPerDegree;
        var lat2 = to.lat * radiansPerDegree;
        var lon2 = to.lon * radiansPerDegree;
        var angle = -Math.atan2(Math.sin(lon1 - lon2) * Math.cos(lat2), Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon1 - lon2));
        if (angle < 0) {
            angle += Math.PI * 2.0;
        }
        angle = angle * degreesPerRadian;//角度
        return angle;
    }

    /* 多边形*/
    var PolygonPrimitive = (function () {
        function _(positions) {
            this.options = {
                name: '多边形',
                polygon: {
                    hierarchy: [],
                    material: Cesium.Color.WHITE.withAlpha(0)
                }
            };

            this.hierarchy = positions;
            this._init();
        }
        _.prototype._init = function () {
            var _self = this;
            var _update = function () {
                return _self.hierarchy;
            };
            //实时更新polygon.hierarchy
            this.options.polygon.hierarchy = new Cesium.CallbackProperty(_update, false);
            t.waterEntity = viewer.entities.add(this.options);
        };
        return _;
    })();
    //计算距离
    function distance(point1, point2) {
        var point1cartographic = Cesium.Cartographic.fromCartesian(point1);
        var point2cartographic = Cesium.Cartographic.fromCartesian(point2);
        /**根据经纬度计算出距离**/
        var geodesic = new Cesium.EllipsoidGeodesic();
        geodesic.setEndPoints(point1cartographic, point2cartographic);
        var s = geodesic.surfaceDistance;
        //console.log(Math.sqrt(Math.pow(distance, 2) + Math.pow(endheight, 2)));
        //返回两点之间的距离
        s = Math.sqrt(Math.pow(s, 2) + Math.pow(point2cartographic.height - point1cartographic.height, 2));
        return s;
    }
}
//可视域
var primitiveKSY = [];
function DrawLineKSY() {
    if (primitiveKSY.length > 0) { return; }
    var viewHeight = 1.5;
    var cartographicCenter = Cesium.Cartographic.fromDegrees(104.07, 30.64);
    var cartesianCenterH0 = Cesium.Cartesian3.fromRadians(cartographicCenter.longitude, cartographicCenter.latitude);
    var cartesianPointH0 = Cesium.Cartesian3.fromDegrees(104.071, 30.641);

    var ab = Cesium.Cartesian3.distance(cartesianCenterH0, cartesianPointH0);
    var eopt = {};
    eopt.semiMinorAxis = ab;
    eopt.semiMajorAxis = ab;
    eopt.rotation = 0;
    eopt.center = cartesianCenterH0;
    eopt.granularity = Math.PI / 45.0;//间隔
    var ellipse = EllipseGeometryLibraryEx.computeEllipseEdgePositions(eopt);
    for (var i = 0; i < ellipse.outerPositions.length; i += 3) {
        //逐条计算可视域
        var cartesian = new Cesium.Cartesian3(ellipse.outerPositions[i], ellipse.outerPositions[i + 1], ellipse.outerPositions[i + 2]);
        var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
        var deltaRadian = 0.00005 * Math.PI / 180.0; //Cesium.Math.RADIANS_PER_DEGREE
        var cartographicArr = SysMathTool.InterpolateLineCartographic(cartographicCenter, cartographic, deltaRadian);

        ThreeDTilesToolCopy.CartographicPointsTerrainData(viewer.scene, cartographicArr,
            function (terrainData) {
                if (terrainData.length > 0) {
                    var preVisible = true;
                    var cartesiansLine = [];
                    var colors = [];
                    for (var j = 1; j < terrainData.length; j++) {
                        //逐点计算可见性
                        var visible = true;//该点可见性
                        if (j > 1) {
                            var cartographicCenterHV = new Cesium.Cartographic(terrainData[0].longitude, terrainData[0].latitude, terrainData[0].height + viewHeight);
                            //
                            if (preVisible) {
                                //     
                                var curPoint = SysMathTool.InterpolateIndexLineHeightCartographic(cartographicCenterHV, terrainData[j], j, j - 1);
                                if (curPoint.height >= terrainData[j - 1].height) {
                                    preVisible = true;
                                    visible = true;
                                } else {
                                    preVisible = false;
                                    visible = false;
                                }
                            } else {
                                //插值到当前
                                var curPointArr = SysMathTool.Interpolate2IndexLineHeightCartographic(cartographicCenterHV, terrainData[j], j, j - 1);
                                for (var k = 0; k < curPointArr.length; k++) {
                                    if (curPointArr[k].height >= terrainData[k].height) {
                                        preVisible = true;
                                        visible = true;
                                    } else {
                                        preVisible = false;
                                        visible = false;
                                        break;
                                    }
                                }
                            }
                        }
                        var cartesianTemp = Cesium.Cartesian3.fromRadians(terrainData[j].longitude, terrainData[j].latitude, terrainData[j].height + 1);
                        cartesiansLine.push(cartesianTemp);
                        //绘制点
                        if (visible) {
                            colors.push(0);
                            colors.push(0);
                            colors.push(1);
                            colors.push(1);
                        } else {
                            colors.push(1);
                            colors.push(0);
                            colors.push(0);
                            colors.push(1);
                        }
                    }

                    //绘制结果
                    var pointsKSY = new PrimitivePoints({ 'viewer': viewer, 'Cartesians': cartesiansLine, 'Colors': colors });
                    primitiveKSY.push(pointsKSY);
                } else {
                    alert("高程异常！");
                }
            });
    }

}

function ClearAll() {
    if (primitiveKSY.length > 0) {
        for (var i = 0; i < primitiveKSY.length; i++) {
            primitiveKSY[i].remove();
            primitiveKSY[i] = null;
        }
        primitiveKSY = [];
    }
}
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
var CesiumWind = (function(){
    var viewer = null;
    function _(){};

    _.init = function(param,flag){
        if(param == "" && param == null)return;


        viewer = param.viewer;
        if(flag)this.build(param);
    }

    _.config = function(param){
        //定时任务
        var cw = this;
        if(param.flag){
            cw.timer = setInterval(function () {
                cw.windy.animate();
            }, param.ms);
        }  
    }

    _.build = function(param){
        if(param == "" && param == null)return;
        var cw = this;
        $.get(param.sources,{},function(json){

            if(json == "" && json == null)return;
            param.data = json;
            cw.windy = new Windy(param,param.viewer);
            cw.windy.animate();
            CesiumWind.config(param);

            CesiumWind.initController();

            viewer.camera.flyTo({destination: Cesium.Cartesian3.fromDegrees(117, 30,20000000)});
        }); 
    }
    _.initController = function (){
        var _self = this;
        //_self.createToolbar();
        var subscribeParameter = function(name) {
            Cesium.knockout.getObservable(viewModel, name).subscribe(
                function(newValue) {
                    _self.controller({key:name,value:newValue});
                }
            );
        }
        var viewModel = {
            color: 10,
            SPEED_RATE: 0.15        
        };
        Cesium.knockout.track(viewModel);
        var toolbar = document.getElementById('toolbar');
        Cesium.knockout.applyBindings(viewModel, toolbar);
        subscribeParameter('color');
        subscribeParameter('SPEED_RATE');
    }
    //外部控制节点
    _.controller = function (obj){
        if(obj === null & obj === "")return;
        var key = obj.key,value = parseInt(obj.value);
        if("color" == key)this.windy.color = getColor(value);
        if("SPEED_RATE" == key)this.windy.SPEED_RATE = value;
        
    }
    _.createToolbar = function(){
        var toolbarparam	 = [	
            {type:"range",key:"color",value:4,min:"0",max:"147",step:"10"},
            {type:"range",key:"SPEED_RATE",value:4,min:"0",max:"2",step:"0.1"}
        ]
        var table = createToolbar(toolbarparam);
        var toolbar = 
        '<div id="toolbar">'+
        table +
        '<button type="button" class="cesium-button" onclick="CesiumWind.remove();" value="satellite">清除</button>'+
        '<div></div>';
        $("#toolbar").remove();
        $("body").append(toolbar);
        $("#toolbar").css("background","rgba(42, 42, 42, 0.8)").css("padding","4px;").css("border-radius", "4px");
        $("#toolbar input").css("vertical-align","middle").css("padding-top","2px").css("padding-bottom","2px");
    }
    _.initSelect = function(){ //创建默认初始化数据
        tableparam	 = [
            {id:"_ids1",type:"select",key:"type",value:["json"],code:["json"]},
            {id:"_ids2",type:"select",key:"sources",value:["../common/3d/data/wind/2017121300.json","../common/3d/data/wind/current-wind-surface-level-gfs-1.0.json"],code:["../common/3d/data/wind/2017121300.json","../common/3d/data/wind/current-wind-surface-level-gfs-1.0.json"]},
            {id:"_ids3",type:"text",key:"SPEED_RATE",value:0.15,code:"SPEED_RATE"},
            {id:"_ids4",type:"text",key:"PARTICLES_NUMBER",value:2000,code:"PARTICLES_NUMBER"},
            {id:"_ids5",type:"text",key:"MAX_AGE",value:10,code:"MAX_AGE"},
            {id:"_ids6",type:"text",key:"BRIGHTEN",value:1.5,code:"BRIGHTEN"},
            {id:"_ids7",type:"text",key:"color",value:10,code:"color"},
            {id:"_ids8",type:"text",key:"ms",value:300,code:"ms"}
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
            flag : true,
            type:[selectData[0].value],
            sources:selectData[1].value,
            SPEED_RATE:selectData[2].value, 
            PARTICLES_NUMBER:parseInt(selectData[3].value),
            MAX_AGE : parseInt(selectData[4].value),
            BRIGHTEN:parseInt(selectData[5].value),
            color:getColor(selectData[6].value),
            ms:parseInt(selectData[7].value)
       }
       
       return initData;
    }
    _.remove = function(){
        if(viewer != null){
            var cw = this;
            cw.windy.removeLines();
            window.clearInterval(cw.timer);   
        }
    }
    return _;
})();

var Particle = function () {
    this.x = null;
    this.dx = null;
    this.dx = null;
    this.y = null;
    this.age = null;
    this.birthAge = null;
    this.path = null;
};


//define([],function () {

var WindField = function (obj) {
    this.west = null;
    this.east = null;
    this.south = null;
    this.north = null;
    this.rows = null;
    this.cols = null;
    this.dx = null;
    this.dy = null;
    this.unit = null;
    this.date = null;

    this.grid = null;
    this._init(obj);
};

WindField.prototype = {
    constructor: WindField,
    _init: function (obj) {
        var header = obj.header,
            uComponent = obj['uComponent'],
            vComponent = obj['vComponent'];

        this.west = +header['lo1'];
        this.east = +header['lo2'];
        this.south = +header['la2'];
        this.north = +header['la1'];
        this.rows = +header['ny'];
        this.cols = +header['nx'];
        this.dx = +header['dx'];
        this.dy = +header['dy'];
        this.unit = header['parameterUnit'];
        this.date = header['refTime'];

        this.grid = [];
        var k = 0,
            rows = null,
            uv = null;
        for (var j = 0; j < this.rows; j++) {
            rows = [];
            for (var i = 0; i < this.cols; i++, k++) {
                uv = this._calcUV(uComponent[k], vComponent[k]);
                rows.push(uv);
            }
            this.grid.push(rows);
        }
    },
    _calcUV: function (u, v) {
        return [+u, +v, Math.sqrt(u * u + v * v)];
    },
    _bilinearInterpolation: function (x, y, g00, g10, g01, g11) {
        var rx = (1 - x);
        var ry = (1 - y);
        var a = rx * ry, b = x * ry, c = rx * y, d = x * y;
        var u = g00[0] * a + g10[0] * b + g01[0] * c + g11[0] * d;
        var v = g00[1] * a + g10[1] * b + g01[1] * c + g11[1] * d;
        return this._calcUV(u, v);
    },
    getIn: function (x, y) {
        var x0 = Math.floor(x),
            y0 = Math.floor(y),
            x1, y1;
        if (x0 === x && y0 === y) return this.grid[y][x];

        x1 = x0 + 1;
        y1 = y0 + 1;

        var g00 = this.getIn(x0, y0),
            g10 = this.getIn(x1, y0),
            g01 = this.getIn(x0, y1),
            g11 = this.getIn(x1, y1);
        return this._bilinearInterpolation(x - x0, y - y0, g00, g10, g01, g11);
    },
    isInBound: function (x, y) {
        if ((x >= 0 && x < this.cols - 2) && (y >= 0 && y < this.rows - 2)) return true;
        return false;
    }
};


var Windy = function (param, cesiumViewer) {
    if(null === param || undefined === param)return;
    var t = this;
    for(var key in param){
        t[key] = param[key];
    }
    this.windData = param.data;
    this.windField = null;
    this.particles = [];
    this.lines = null;
    _primitives = cesiumViewer.scene.primitives;
    this._init();
};
Windy.prototype = {
    constructor: Windy,
    _init: function () {
        // 创建风场网格
        this.windField = this.createField();
        // 创建风场粒子
        for (var i = 0; i < this.PARTICLES_NUMBER; i++) {
            this.particles.push(this.randomParticle(new Particle()));
        }
    },
    createField: function () {
        var data = this._parseWindJson();
        return new WindField(data);
    },
    animate: function () {
        var self = this,
            field = self.windField,
            particles = self.particles;
            SPEED_RATE = self.SPEED_RATE,
            _color = self.color;
        var instances = [],
            nextX = null,
            nextY = null,
            xy = null,
            uv = null;
        particles.forEach(function (particle) {
            if (particle.age <= 0) {
                self.randomParticle(particle);
            }
            if (particle.age > 0) {
                var x = particle.x,
                    y = particle.y;

                if (!field.isInBound(x, y)) {
                    particle.age = 0;
                } else {
                    uv = field.getIn(x, y);
                    nextX = x +  SPEED_RATE * uv[0];
                    nextY = y +  SPEED_RATE * uv[1];
                    particle.path.push(nextX, nextY);
                    particle.x = nextX;
                    particle.y = nextY;
                    instances.push(self._createLineInstance(self._map(particle.path), particle.age / particle.birthAge));
                    particle.age--;
                }
            }
        });
        if (instances.length <= 0) this.removeLines();
        self._drawLines(instances);
    },
    _parseWindJson: function () {
        var uComponent = null,
            vComponent = null,
            header = null;
        this.windData.forEach(function (record) {
            var type = record.header.parameterCategory + "," + record.header.parameterNumber;
            switch (type) {
                case "2,2":
                    uComponent = record['data'];
                    header = record['header'];
                    break;
                case "2,3":
                    vComponent = record['data'];
                    break;
                default:
                    break;
            }
        });
        return {
            header: header,
            uComponent: uComponent,
            vComponent: vComponent
        };
    },
    removeLines: function () {
        if (this.lines) {
            _primitives.remove(this.lines);
            this.lines.destroy();
        }
    },
    //求路径上点
    _map: function (arr) {
        var length = arr.length,
            field = this.windField,
            dx = field.dx,
            dy = field.dy,
            west = field.west,
            south = field.north,
            newArr = [];
        for (var i = 0; i <= length - 2; i += 2) {
            newArr.push(
                west + arr[i] * dx,
                south - arr[i + 1] * dy
            )
        }
        return newArr;
    },
    //后边配色需要能配置
    _createLineInstance: function (positions, ageRate) {
        var colors = [],_color = this.color,
            length = positions.length,
            count = length / 2;
        for (var i = 0; i < length; i++) {
            colors.push(_color.withAlpha(i / count * ageRate * this.BRIGHTEN));
        }
        return new Cesium.GeometryInstance({
            geometry: new Cesium.PolylineGeometry({
                positions: Cesium.Cartesian3.fromDegreesArray(positions),
                colors: colors,
                width: 1.5,
                colorsPerVertex: true
            })
        });
    },
    _drawLines: function (lineInstances) {
        this.removeLines();
        var linePrimitive = new Cesium.Primitive({
            appearance: new Cesium.PolylineColorAppearance({
                translucent: true
            }),
            geometryInstances: lineInstances,
            asynchronous: false
        });
        this.lines = _primitives.add(linePrimitive);
    },
    randomParticle: function (particle) {
        var safe = 30,x, y;

        do {
            x = Math.floor(Math.random() * (this.windField.cols - 2));
            y = Math.floor(Math.random() * (this.windField.rows - 2));
        } while (this.windField.getIn(x, y)[2] <= 0 && safe++ < 30);

        particle.x = x;
        particle.y = y;
        particle.age = Math.round(Math.random() * this.MAX_AGE);//每一次生成都不一样
        particle.birthAge = particle.age;
        particle.path = [x, y];
        return particle;
    }
};
var ccc = {};
//地面雷达站数据
ccc.radarSite = {
    load: function () {
        CesiumRadar1.init({
            viewer: viewer,
            pixelRange: 15,
            minimumClusterSize: 3,
            enabled: false,
            showtoolbar: false
        });
        CesiumRadar1.build({
            handleType: "def",
            kml: '../../src/Apps/SampleData/kml/facilities/facilities.kml'
        });
    },
    close: function () {
        CesiumRadar1.clear();
    }
}
//省份边界数据
ccc.provincesBorder = {
    data: null,
    load: function () {
        var promise = viewer.dataSources.add(Cesium.GeoJsonDataSource.load('../../common/3d/data/china.json'));
        promise.then(function (dataSource) {
            ccc.provincesBorder.data = dataSource;
        }).otherwise(function (error) {
            fn_tool.alert(error);
        });
    },
    close: function () {
        viewer.dataSources.remove(ccc.provincesBorder.data);
    }
}
//添加3dtiles
ccc._3dtiles = {
    data: null,
    load: function () {
        let tileset = viewer.scene.primitives.add(new Cesium.Cesium3DTileset({
            url: '../../common/3d/data/3DTiles/building/tileset.json'
        }));
        let heightStyle = new Cesium.Cesium3DTileStyle({
            color: {
                conditions: [
                    ['${height} >= 300', 'rgba(45, 0, 75, 0.3)'],
                    ['${height} >= 200', 'rgba(102, 71, 151, 0.3)'],
                    ['${height} >= 100', 'rgba(170, 162, 204, 0.3)'],
                    ['${height} >= 50', 'rgba(224, 226, 238, 0.3)'],
                    ['${height} >= 25', 'rgba(252, 230, 200, 0.3)'],
                    ['${height} >= 10', 'rgba(248, 176, 87, 0.3)'],
                    ['${height} >= 5', 'rgba(198, 106, 11, 0.3)'],
                    ['true', 'rgba(127, 59, 8, 0.3)']
                ]
            }
        });
        tileset.readyPromise.then(function (tileset) {
            ccc._3dtiles.data = tileset;
            ccc._3dtiles.data.style = heightStyle;
            viewer.scene.primitives.add(ccc._3dtiles.data);
            viewer.zoomTo(ccc._3dtiles.data, new Cesium.HeadingPitchRange(0.5, -0.2, ccc._3dtiles.data.boundingSphere.radius * 1.0));
        }).otherwise(function (error) {
            console.log(error);
        });
        viewer.camera.setView({
            destination: Cesium.Cartesian3.fromDegrees(116.20, 40.55, 3000000)
        });
    },
    close: function () {
        viewer.scene.primitives.remove(ccc._3dtiles.data);
    }
}

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



