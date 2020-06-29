(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.Windy = factory());
}(this, (function () { 'use strict';

var tool = {
    merge: function merge(settings, defaults) {
        Object.keys(settings).forEach(function (key) {
            defaults[key] = settings[key];
        });
    },
    //计算两点间距离
    getDistance: function getDistance(p1, p2) {
        return Math.sqrt((p1[0] - p2[0]) * (p1[0] - p2[0]) + (p1[1] - p2[1]) * (p1[1] - p2[1]));
    },
    //判断点是否在线段上
    containStroke: function containStroke(x0, y0, x1, y1, lineWidth, x, y) {
        if (lineWidth === 0) {
            return false;
        }
        var _l = lineWidth;
        var _a = 0;
        var _b = x0;
        // Quick reject
        if (y > y0 + _l && y > y1 + _l || y < y0 - _l && y < y1 - _l || x > x0 + _l && x > x1 + _l || x < x0 - _l && x < x1 - _l) {
            return false;
        }

        if (x0 !== x1) {
            _a = (y0 - y1) / (x0 - x1);
            _b = (x0 * y1 - x1 * y0) / (x0 - x1);
        } else {
            return Math.abs(x - x0) <= _l / 2;
        }
        var tmp = _a * x - y + _b;
        var _s = tmp * tmp / (_a * _a + 1);
        return _s <= _l / 2 * _l / 2;
    }
};

var resolutionScale = function (context) {
    var devicePixelRatio = window.devicePixelRatio || 1;
    context.canvas.width = context.canvas.width * devicePixelRatio;
    context.canvas.height = context.canvas.height * devicePixelRatio;
    context.canvas.style.width = context.canvas.width / devicePixelRatio + 'px';
    context.canvas.style.height = context.canvas.height / devicePixelRatio + 'px';
    context.scale(devicePixelRatio, devicePixelRatio);
};

var global = typeof window === 'undefined' ? {} : window;

var requestAnimationFrame = global.requestAnimationFrame || global.mozRequestAnimationFrame || global.webkitRequestAnimationFrame || global.msRequestAnimationFrame || function (callback) {
    return global.setTimeout(callback, 1000 / 60);
};

var cancelAnimationFrame = global.cancelAnimationFrame || global.mozCancelAnimationFrame || global.webkitCancelAnimationFrame || global.msCancelAnimationFrame || function (id) {
    clearTimeout(id);
};

var Windy = function Windy(map, userOptions) {
    var self = this;
    self.map = map;

    //默认参数
    var options = {
        MAX_PARTICLE_AGE: 100,
        FRAME_RATE: 20,
        PARTICLE_MULTIPLIER: 8,
        size: 0.8,
        color: 'rgba(71,160,233,0.8)',
        isShowLine: true
    };

    self.init(userOptions, options);

    //全局变量
    var baseCtx = self.baseCtx = self.options.canvas.getContext("2d");
    self.baseCtx.lineWidth = 0.8;
    self.baseCtx.fillStyle = 'rgba(0,0,0,.9)';
};

Windy.prototype.init = function (setting, defaults) {
    //合并参数
    tool.merge(setting, defaults);
    this.options = defaults;
};

Windy.prototype.start = function () {
    var self = this;
    self.stop();
    self.adjustSize();
    self.addLine();
    self.interpolateGrid();
    // if (self.options.isShowLine) {
    //     self.drawline();
    // }
    // self.createParticle();
    // self.animate();
    // self.drawParticle();
};

Windy.prototype.stop = function () {
    var self = this;
    self.baseCtx.clearRect(0, 0, self.width, self.height);
    if (self.vector) self.vector.release();
    if (self.animationId) {
        cancelAnimationFrame(self.animationId);
    }
    if (self.timer) {
        clearTimeout(self.timer);
    }
};

Windy.prototype.adjustSize = function () {
    var width = this.map.width;
    var height = this.map.height;
    this.baseCtx.canvas.width = width;
    this.baseCtx.canvas.height = height;
    resolutionScale(this.baseCtx);
    this.width = this.baseCtx.canvas.width;
    this.height = this.baseCtx.canvas.height;
};

Windy.prototype.addLine = function () {
    var options = this.options;
    var roadLines = this.roadLines = [],
        dataset = this.options.data;
    dataset.forEach(function (line, i) {
        roadLines.push(new Line({
            points: line,
            color: 'rgba(38,173,133)'
        }));
    });
};

Windy.prototype.drawline = function () {
    var self = this;
    var baseCtx = self.baseCtx;
    if (!baseCtx) {
        return;
    }
    var roadLines = self.roadLines;
    roadLines.forEach(function (line) {
        line.drawPath(baseCtx, self.map, self.options);
    });
};

Windy.prototype.createParticle = function () {
    var self = this;
    var poly = self.roadLines[0].path;
    var options = this.options;
    var particles = this.particles = [];
    var particleCount = Math.round(this.width * options.PARTICLE_MULTIPLIER);
    for (var i = 0; i < particleCount; i++) {
        var x = Math.floor(Math.random() * self.width),
            y = Math.floor(Math.random() * self.height);
        if (self.rayCasting({
            x: x,
            y: y
        }, poly) === 'out') {
            continue;
        }
        if (this.columns[x] == undefined) {
            continue;
        }
        var vector = self.vector(x, y);
        vector.x = x;
        vector.y = y;
        vector.age = Math.floor(Math.random() * options.MAX_PARTICLE_AGE);
        vector.color = '#fff';
        particles.push(vector);
    }
};

Windy.prototype.animate = function () {
    var self = this,
        options = this.options,
        particles = self.particles;

    function evolve() {
        particles.forEach(function (particle, i) {
            if (particle.age > options.MAX_PARTICLE_AGE) {
                particle = self.vector.generate({
                    age: 0
                });
                particles.splice(i, 1, particle);
            }
            var x = particle.x;
            var y = particle.y;
            var v = self.vector(x, y);
            if (v) {
                var xe = x - v.speed * Math.sin(Math.PI / 180 * (180 - v.angle));
                var ye = y - v.speed * Math.cos(Math.PI / 180 * (180 - v.angle));
                var nextPoint = self.vector(xe, ye);
                if (nextPoint) {
                    particle.xe = xe;
                    particle.ye = ye;
                } else {
                    var newParticle = self.vector.generate({
                        age: Math.floor(Math.random() * options.MAX_PARTICLE_AGE)
                    });
                    particles.splice(i, 1, newParticle);
                }
            } else {
                particle.age = options.MAX_PARTICLE_AGE;
            }
            particle.age += 1;
        });
    }

    function render() {
        var context = self.baseCtx;
        context.fillStyle = "rgba(0,0,0,0.97)";
        var prev = context.globalCompositeOperation;
        context.globalCompositeOperation = "destination-in";
        context.fillRect(0, 0, self.width, self.height);
        context.globalCompositeOperation = prev;

        context.beginPath();
        context.strokeStyle = '#fff';
        particles.forEach(function (particle, i) {
            context.moveTo(particle.x, particle.y);
            context.lineTo(particle.xe, particle.ye);
            particle.x = particle.xe;
            particle.y = particle.ye;
        });
        context.stroke();
    }

    (function frame() {
        try {
            self.timer = setTimeout(function () {
                requestAnimationFrame(frame);
                evolve();
                render();
            }, 1000 / options.FRAME_RATE);
        } catch (e) {
            console.error(e);
        }
    })();
};

Windy.prototype.drawParticle = function () {
    var self = this;
    var baseCtx = self.baseCtx;
    if (!baseCtx) {
        return;
    }
    var particles = self.particles;
    particles.forEach(function (particle, i) {
        particle.draw(baseCtx);
    });
};

Windy.prototype.interpolateGrid = function () {
    var self = this;
    var columns = this.columns = [];
    var x = 0;

    function interpolateColumn(x) {
        var column = [];
        for (var y = 0; y < self.height; y += 2) {
            var wind = interpolate(x, y);
            column[y + 1] = column[y] = wind;
        }
        columns[x + 1] = columns[x] = column;
    }

    var points = self.roadLines[0].points.splice(0, 90);

    function interpolate(x, y) {
        var angle0 = 0,
            angle1 = 0,
            speed0 = 5,
            speed1 = 5,
            wind = {};
        points.forEach(function (p) {
            angle0 += p.angle * 1.0 / ((y - p.y) * (y - p.y) + (x - p.x) * (x - p.x));
            angle1 += 1.0 / ((y - p.y) * (y - p.y) + (x - p.x) * (x - p.x));

            speed0 += p.speed * 1.0 / ((y - p.y) * (y - p.y) + (x - p.x) * (x - p.x));
            speed1 += 1.0 / ((y - p.y) * (y - p.y) + (x - p.x) * (x - p.x));

            if (angle1 != 0) {
                wind.angle = angle0 / angle1;
            }
            if (speed1 != 0) {
                wind.speed = speed0 / speed1;
            }
        });
        return wind;
    }

    (function batchInterpolate() {
        var start = Date.now();
        while (x < self.width) {
            interpolateColumn(x);
            x += 2;
            if (Date.now() - start > 1000) {
                setTimeout(batchInterpolate, 25);
                return;
            }
        }
        self.createField();
    })();
};

Windy.prototype.createField = function () {
    var self = this;
    var columns = this.columns;

    function vector(x, y) {
        var column = columns[Math.floor(x)];
        return column && column[Math.floor(y)];
    }

    vector.release = function () {
        self.columns = [];
    };

    vector.generate = function (o) {
        var x = Math.floor(Math.random() * self.width);
        var y = Math.floor(Math.random() * self.height);
        o.x = x;
        o.y = y;
        return o;
    };

    this.vector = vector;

    if (this.options.isShowLine) {
        this.drawline();
    }
    this.createParticle();
    this.animate();
};

Windy.prototype.rayCasting = function (p, poly) {
    var px = p.x,
        py = p.y,
        flag = false;

    for (var i = 0, l = poly.length, j = l - 1; i < l; j = i, i++) {
        var sx = poly[i].x,
            sy = poly[i].y,
            tx = poly[j].x,
            ty = poly[j].y;

        // 点与多边形顶点重合
        if (sx === px && sy === py || tx === px && ty === py) {
            return 'in';
        }

        // 判断线段两端点是否在射线两侧
        if (sy < py && ty >= py || sy >= py && ty < py) {
            // 线段上与射线 Y 坐标相同的点的 X 坐标
            var x = sx + (py - sy) * (tx - sx) / (ty - sy);

            // 点在多边形的边上
            if (x === px) {
                return 'in';
            }

            // 射线穿过多边形的边界
            if (x > px) {
                flag = !flag;
            }
        }
    }

    // 射线穿过多边形边界的次数为奇数时点在多边形内
    return flag ? 'in' : 'out';
};

function Line(options) {
    this.points = options.points || [];
    this.color = options.color || '#ffff00';
}

Line.prototype.getPointList = function (map) {
    var path = this.path = [],
        points = this.points;
    if (points && points.length > 0) {
        points.forEach(function (p) {
            var _screePoint = map.toScreen(p);
            // if (_screePoint.x < 0 || _screePoint.y < 0) {
            //     return;
            // }
            var pixel = map.toScreen(p);
            path.push({
                x: pixel.x,
                y: pixel.y
            });
        });
        this.maxAge = path.length;
    }
    return path;
};

Line.prototype.drawPath = function (context, map) {
    var pointList = this.path || this.getPointList(map);
    context.beginPath();
    context.lineWidth = 1;
    context.strokeStyle = this.color;
    context.moveTo(pointList[0].x, pointList[0].y);
    for (var i = 0, len = pointList.length; i < len; i++) {
        context.lineTo(pointList[i].x, pointList[i].y);
    }
    context.stroke();
};

return Windy;

})));
