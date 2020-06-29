(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.MoveLine = factory());
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

var MoveLine = function MoveLine(map, userOptions) {
    var self = this;
    self.map = map;

    //默认参数
    var options = {
        lineWidth: 0.5, //线条宽度
        lineStyle: 'rgb(200, 40, 0)', //线条颜色
        animateLineWidth: 1, //动画线条宽度
        animateLineStyle: '#ffff00' //动画线条颜色
    };

    self.init(userOptions, options);

    //全局变量
    var baseCtx = self.baseCtx = self.options.canvas.getContext("2d");
    var animateCtx = self.animateCtx = self.options.animateCanvas.getContext("2d");
    baseCtx.lineWidth = options.lineWidth;
};

MoveLine.prototype.init = function (setting, defaults) {
    //合并参数
    tool.merge(setting, defaults);
    this.options = defaults;
};

MoveLine.prototype.render = function () {
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

MoveLine.prototype.animate = function () {
    var self = this;
    var animateCtx = self.animateCtx;
    if (!animateCtx) {
        return;
    }

    animateCtx.fillStyle = "rgba(0,0,0,0.8)";
    var prev = animateCtx.globalCompositeOperation;
    animateCtx.globalCompositeOperation = "destination-in";
    animateCtx.fillRect(0, 0, self.map.width, self.map.height);
    animateCtx.globalCompositeOperation = prev;

    var roadLines = self.roadLines;
    roadLines.forEach(function (line) {
        line.draw(animateCtx, self.map, self.options);
    });
};

MoveLine.prototype.adjustSize = function () {
    var width = this.map.width;
    var height = this.map.height;
    this.baseCtx.canvas.width = width;
    this.baseCtx.canvas.height = height;
    this.animateCtx.canvas.width = width;
    this.animateCtx.canvas.height = height;
    resolutionScale(this.baseCtx);
    resolutionScale(this.animateCtx);
};

MoveLine.prototype.start = function () {
    var self = this;
    self.stop();
    self.adjustSize();
    self.addLine();
    self.render();
    (function drawFrame() {
        self.timer = setTimeout(function () {
            self.animationId = requestAnimationFrame(drawFrame);
            self.animate();
        }, 1000 / 20);
    })();
    // (function drawFrame() {
    //     requestAnimationFrame(drawFrame);
    //     self.animate();
    // })();
};

MoveLine.prototype.stop = function () {
    var self = this;
    cancelAnimationFrame(self.animationId);
    if (self.timer) {
        clearTimeout(self.timer);
    }
};

MoveLine.prototype.addLine = function () {
    var roadLines = this.roadLines = [],
        dataset = this.options.data;
    dataset.forEach(function (line, i) {
        roadLines.push(new Line({
            points: line
        }));
    });
};

function Line(options) {
    this.points = options.points || [];
    this.age = options.age || 0;
    this.maxAge = options.maxAge || 0;
}

Line.prototype.getPointList = function (map) {
    var path = this.path = [],
        points = this.points;
    if (points && points.length > 0) {
        points.forEach(function (p) {
            path.push({
                pixel: map.toScreen(p)
            });
        });
        this.maxAge = path.length;
    }
    return path;
};

Line.prototype.drawPath = function (context, map, options) {
    var pointList = this.path || this.getPointList(map);
    context.beginPath();
    context.lineWidth = options.lineWidth;
    context.strokeStyle = options.lineStyle;
    context.moveTo(pointList[0].pixel.x, pointList[0].pixel.y);
    for (var i = 0, len = pointList.length; i < len; i++) {
        context.lineTo(pointList[i].pixel.x, pointList[i].pixel.y);
    }
    context.stroke();
};

Line.prototype.draw = function (context, map, options) {
    var pointList = this.path || this.getPointList(map);
    context.beginPath();
    context.lineWidth = options.animateLineWidth;
    context.strokeStyle = options.animateLineStyle;
    if (this.age >= this.maxAge - 1) {
        this.age = 0;
    }
    context.moveTo(pointList[this.age].pixel.x, pointList[this.age].pixel.y);
    context.lineTo(pointList[this.age + 1].pixel.x, pointList[this.age + 1].pixel.y);
    context.stroke();

    this.age++;
};

return MoveLine;

})));
