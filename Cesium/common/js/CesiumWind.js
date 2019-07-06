/***
 * 风场绘制
 * @zhangti
 * @Particle 高能粒子
 * @WindField 风场网格
 * @Wind 风场粒子
 * @version v1
 */

var cw = null;
CesiumWind = function(){
    cw = this;
    windy = null;
    timer = null;
}

CesiumWind.prototype.build = function (data,viewer){
    var cw = this;
    cw.windy = new Windy(data,viewer);
    //this.windy.c 后边需要考虑颜色自定义
    cw.windy.animate();

}
//配置属性 刷新
CesiumWind.prototype.config = function (config){
    var cw = this;
    this.build(config.data,config.viewer);

    //定时任务
    if(config.flag){
        cw.timer = setInterval(function () {
            cw.windy.animate();
        }, config.ms);
    }  
}
CesiumWind.prototype.clear = function (){
    var cw = this;
    cw.windy.removeLines();
    window.clearInterval(cw.timer);   
}
 
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


var _primitives = null;
var SPEED_RATE = 0.15;
var PARTICLES_NUMBER =2000;//默认2000
var MAX_AGE = 10;
var BRIGHTEN = 1.5;

var Windy = function (json, cesiumViewer) {
    this.windData = json;
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
        for (var i = 0; i < PARTICLES_NUMBER; i++) {
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
        var colors = [],
            length = positions.length,
            count = length / 2;
        for (var i = 0; i < length; i++) {
            colors.push(Cesium.Color.WHITE.withAlpha(i / count * ageRate * BRIGHTEN));
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
        particle.age = Math.round(Math.random() * MAX_AGE);//每一次生成都不一样
        particle.birthAge = particle.age;
        particle.path = [x, y];
        return particle;
    }
};
    
    