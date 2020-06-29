/**
 * 右键菜单
 */

var eText = [
{
    text: "显示此处经纬度",
    type: 'longlat'
},
{
    text: "开启深度监测",
    type: 'opendepth',
},
{
    text: "关闭深度监测",
    type: 'closedepth',
},
{
    text: "初始视角",
    type: "firstperspective",
}];

let lon = 117.191166,
    lat = 34.119749,
    zoom = 30000000; //原始位置
import config from './config.js';
import HTML from './html.js';
import Camera from './camera.js';
export default class RightMenu{
    constructor(opt){
        if(!opt){
            return false;
        }
        for(let key in opt){
            this[key] = opt[key]
        }
        let $this = this;
        let menu = new HTML().loadCSS(config.CODEDIR +'/BaseUI/css/menu.css');
        this.camera = new Camera(this.viewer);
        menu.onload = function(){
            setTimeout(()=>{
                $this.init($this.viewer);
            },50)
        }
    }
    init(viewer){
        this.cesiumContainer = document.querySelector("#"+ this.dom);
        this.div = '',
        this.latObj = null,
        this.tileset = null,
        this.entitiesId = null,
        this.ellipsoid = viewer.scene.globe.ellipsoid;
        this.doProhibit(viewer);
        this.loadRightClick(viewer);
    }
    //事件处理
    doProhibit(viewer){
        if(window.Event) 
        document.captureEvents(Event.MOUSEUP);
    
        function nocontextmenu() {
            event.cancelBubble = true
            event.returnvalue = false;
            return false;
        }
        
        function norightclick(e) {
            if (window.Event){
                if (e.which == 2 || e.which == 3)
                return false;
            }else if (event.button == 2 || event.button == 3) {
                event.cancelBubble = true
                event.returnvalue = false;
                return false;
            }
        }
        document.oncontextmenu = nocontextmenu;  // for IE5+ 
        document.onmousedown = norightclick;  //
    }
    //右键生成参数
    loadRightClick(viewer){
        let $this = this;
        var Handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
        //点击关闭
        Handler.setInputAction(function(e) {
            var cartesian = $this.viewer.scene.camera.pickEllipsoid(e.position, $this.viewer.scene.globe.ellipsoid);
            if(!cartesian){
                return false;
            }
            var divs = document.querySelectorAll(".contextmenu")
            cesiumContainer.removeChild(divs[0]);
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        //右键菜单
        Handler.setInputAction(function(e) {
            var cartesian = viewer.camera.pickEllipsoid(e.position,$this.ellipsoid);
            if(cartesian){
                // 苗卡尔椭球体的三维坐标 转 地图坐标（弧度）
                var cartographic = viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian);
                // 地图坐标（弧度） 转 十进制度数 toFixed保留小数点后几位
                var log_String = Cesium.Math.toDegrees(cartographic.longitude).toFixed(8);//经度
                var lat_String = Cesium.Math.toDegrees(cartographic.latitude).toFixed(8);//纬度
                var alt_String = (viewer.camera.positionCartographic.height/1000).toFixed(2);//视角高
                var elec_String = viewer.scene.globe.getHeight(cartographic).toFixed(4);//海拔
                $this.latObj = {log:log_String,lat:lat_String,alt:alt_String,elec:elec_String}
            }
            // 判断点击位置是否有实体
            var pickedObject = viewer.scene.pick(e.position);
        
            if(pickedObject == undefined){
                $this.loadUl(e.position) 
            }else{
                if(pickedObject.tileset != undefined && pickedObject.tileset.type == "3dtiles"){
                    $this.loadUl(e.position,pickedObject.tileset.contextmenuItems,"3dtiles") 
                }else{
                    $this.entitiesId = pickedObject.id._id;
                    // 判断实体
                    var entity = viewer.entities.getById($this.entitiesId);
                    if(entity != undefined){
                        var type = ""
                        if(entity.billboard != undefined){
                            type = "billboard"
                        }
                        if(entity.polygon != undefined){
                            type = "polygon"
                        }
                        if(entity.polyline != undefined){
                            type = "polyline"
                        }
                        $this.loadUl(e.position,entity._contextmenuItems,type) 
                    }
                }
            }
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    }
     /**
     * 右键点击html
     * @params {object} pos 屏幕坐标对象｛x:122,y:444｝
     * @params {object} textArr 渲染文本数组对象
     * @params {string} type 实体类型 undefined：空白区域
     */
    loadUl(pos,textArr,type){
        var con, lis = '',$this = this;;
        if(textArr != undefined && type != undefined){
            for(var i=0; i<textArr.length; i++){
                lis += `<li class="li-item" data-index="20">
                        <a type="${ textArr[i].type }" href="#" >${textArr[i].text}</a>
                    </li>`  
            }
        }else{
            var terrainStatus =  this.viewer.scene.globe.depthTestAgainstTerrain;
            for(var i=0; i<eText.length; i++){
                if(terrainStatus){
                    if(eText[i].type == 'opendepth'){continue}
                }else{
                    if(eText[i].type == 'closedepth'){continue}
                }
                lis += `<li class="li-item" data-index="20">
                        <a type="${ eText[i].type }" href="#">${eText[i].text}</a>
                    </li>`  
            }
        }
        con = `<ul class="contextmenu-ul">${lis}</ul>`
        var divs = document.querySelectorAll(".contextmenu");
        if(divs.length != 0){
            this.cesiumContainer.removeChild(divs[0])
        }
        this.div = document.createElement('div')
        this.div.className = "contextmenu"
        this.div.style.top = pos.y + 'px'
        this.div.style.left = pos.x + 'px'
        this.div.style.position = 'fixed'
        this.div.innerHTML = con;
        this.cesiumContainer.append(this.div);

        //监听事件
        $('.li-item a').on('click',function(){
             let type = $(this).attr('type');
             if(type)$this.rightliClick(type)
        });

    }

    /**
     * 处理事件
     * @param {*} type 
     */
    rightliClick(type){
        let $this = this;
        var divs = document.querySelectorAll(".contextmenu")
        cesiumContainer.removeChild(divs[0]);
        switch(type){
            case 'longlat':
                alert(JSON.stringify($this.latObj))
                break;
            case 'opendepth':
                $this.viewer.scene.globe.depthTestAgainstTerrain = true;
                break;
            case 'closedepth':
                $this.viewer.scene.globe.depthTestAgainstTerrain = false;
                break;
            case 'firstperspective': 
                //默认位置
                $this.camera.flyTo2(Cesium.Cartesian3.fromDegrees(lon, lat, 20000000));
                break;
        }
    }
 
}