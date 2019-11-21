/*
 * @Descripttion: 
 * @version: 1.0
 * @Author: zhangti
 * @Date: 2019-10-22 16:29:22
 * @LastEditors: sueRimn
 * @LastEditTime: 2019-11-16 16:08:40
 */
/**
 * 封装风场
 * 洋流效果
 */

 /**
  * 粒子实体
  */
const Particle = class {
    constructor(){
        this.x = null;
        this.dx = null;
        this.dx = null;
        this.y = null;
        this.age = null;
        this.birthAge = null;
        this.path = null;
    }
}
/**
 * 风场实体
 */
const WindField = class {
    constructor(obj){
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
    }
    _init(obj) {
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
    }
    _calcUV (u, v) {
        return [+u, +v, Math.sqrt(u * u + v * v)];
    }
    _bilinearInterpolation (x, y, g00, g10, g01, g11) {
        var rx = (1 - x);
        var ry = (1 - y);
        var a = rx * ry, b = x * ry, c = rx * y, d = x * y;
        var u = g00[0] * a + g10[0] * b + g01[0] * c + g11[0] * d;
        var v = g00[1] * a + g10[1] * b + g01[1] * c + g11[1] * d;
        return this._calcUV(u, v);
    }
    getIn (x, y) {
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
    }
    isInBound (x, y) {
        if ((x >= 0 && x < this.cols - 2) && (y >= 0 && y < this.rows - 2)) return true;
        return false;
    }
}

 /**
  * 风场接口
  */
 const Windy = class{

    constructor(param){
        if(null === param || undefined === param)return;
        var t = this;
        for(var key in param){
            t[key] = param[key];
        }
        this.windData = param.data;
        this.windField = null;
        this.particles = [];
        this.lines = null;
        this._primitives = this.viewer.scene.primitives;
        this._init();
    }
    _init () {
        // 创建风场网格
        this.windField = this.createField();
        // 创建风场粒子
        for (var i = 0; i < this.PARTICLES_NUMBER; i++) {
            this.particles.push(this.randomParticle(new Particle()));
        }
    }
    createField () {
        var data = this._parseWindJson();
        return new WindField(data);
    }
    animate(){
        try {
            var self = this,
                field = self.windField,
                particles = self.particles,
                SPEED_RATE = self.SPEED_RATE;
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
            if (instances.length <= 0)self.removeLines();
            self._drawLines(instances); 
        } catch (error) {
            console.log(error);
        }
    }
    _parseWindJson () {
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
    }
    removeLines () {
        if (this.lines) {
            this._primitives.remove(this.lines);
            this.lines.destroy();
        }
    }
    //求路径上点
    _map (arr) {
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
    }
    //后边配色需要能配置
    _createLineInstance (positions, ageRate) {
        var colors = [],$color = this.color,
            length = positions.length,
            count = length / 2;
        for (var i = 0; i < length; i++) {
            colors.push($color.withAlpha(i / count * ageRate * this.BRIGHTEN));
        }
        return new Cesium.GeometryInstance({
            geometry: new Cesium.PolylineGeometry({
                positions: Cesium.Cartesian3.fromDegreesArray(positions),
                colors: colors,
                width: 1.5,
                colorsPerVertex: true
            })
        });
    }
    _drawLines (lineInstances) {
        this.removeLines();
        var linePrimitive = new Cesium.Primitive({
            appearance: new Cesium.PolylineColorAppearance({
                translucent: true
            }),
            geometryInstances: lineInstances,
            asynchronous: false
        });
        this.lines = this._primitives.add(linePrimitive);
    }
    randomParticle (particle) {
        var safe = 30,x, y;
        do {
            x = Math.floor(Math.random() * (this.windField.cols - 2));
            y = Math.floor(Math.random() * (this.windField.rows - 2));
        } while (this.windField.getIn(x, y)[2] <= 0 && safe++ < 30);

        particle.x = x;
        particle.y = y;
        particle.age = Math.round(Math.random() * this.MAX_AGE);
        particle.birthAge = particle.age;
        particle.path = [x, y];
        return particle;
    }

}

/**
 * 外部接口
 */
export default class Winds{
  
    constructor(param){
        if(param == null){
            console.log("没有获取到参数!");
            return false;
        };
        var t = this;
        for(var key in param){
            t[key] = param[key];
        }
        //外部控制参数
        this.WINDY = {
            Color:{RED:Cesium.Color.RED,BLUE:Cesium.Color.BLUE
                ,ORANGE:Cesium.Color.ORANGE,WHITE:Cesium.Color.WHITE
                ,CHARTREUSE:Cesium.Color.CHARTREUSE},
            Speed:{_1:0.1,_2:0.2,_3:0.3,_4:0.4,_1:0.5,_6:0.6,_7:0.7,_8:0.8}
        }
        //给默认值
        this.ms = this.ms == undefined ? 300 : this.ms;
        this.color = this.color == undefined ? Cesium.Color.CHARTREUSE : this.color;
        this.BRIGHTEN = this.BRIGHTEN == undefined ? 1.5 : this.BRIGHTEN;
        this.MAX_AGE = this.MAX_AGE == undefined ? 10 : this.MAX_AGE;
        this.PARTICLES_NUMBER = this.PARTICLES_NUMBER == undefined ? 2000 : this.PARTICLES_NUMBER;
        this.SPEED_RATE = this.SPEED_RATE == undefined ? 0.15 : this.SPEED_RATE;
        this.url = this.url == undefined ? 'data/2017121300.json' : this.url; //current-temp-surface-level-gfs-1.0
    }
    load(){
       let $this = this;
        $.get($this.url,{},function(json){
            if(json == "" && json == null){
                console.log("没有获取到数据!");
                return false;
            };
            $this.data = json;
            $this.windy = new Windy($this,$this.viewer);
            $this.windy.animate();
            $this.task();
            //viewer.camera.flyTo({destination: Cesium.Cartesian3.fromDegrees(117, 30,20000000)});
        });  
    }
    //设置颜色
    setColor(value){
        this.windy.color = value;
    }
    //设置速度
    setSpeed(value){
        this.windy.SPEED_RATE = value;
    }
    //定时任务
    task(){
       var $this = this;
        $this.timer = setInterval(function () {
           // console.log(123456);
                $this.windy.animate();
        }, $this.ms);  
    }
    remove(){
        if(this.windy != undefined){
            this.windy.removeLines();
            window.clearInterval(this.timer);   
        }
    }
}