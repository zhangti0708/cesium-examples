(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.Ring = factory());
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
    },

    //是否在矩形内
    isPointInRect: function isPointInRect(point, bound) {
        var wn = bound.wn; //西北
        var es = bound.es; //东南
        return point.x >= wn.x && point.x <= es.x && point.y >= wn.y && point.y <= es.y;
    },

    //是否在圆内
    isPointInCircle: function isPointInCircle(point, center, radius) {
        var dis = this.getDistanceNew(point, center);
        return dis <= radius;
    },

    //两点间距离
    getDistanceNew: function getDistanceNew(point1, point2) {
        return Math.sqrt(Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2));
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

var Ring = function Ring(map, userOptions) {
    this.map = map;
    this.level = map.getLevel();

    //默认参数
    var options = {
        radius: 100, //半径
        ringColor: 'rgba(66, 240, 238, 0.2)' //光晕颜色
    };

    this.init(userOptions, options);

    //全局变量
    this.baseCtx = this.options.canvas.getContext("2d");
};

Ring.prototype.init = function (setting, defaults) {
    //合并参数
    tool.merge(setting, defaults);
    this.options = defaults;
};

Ring.prototype.render = function () {
    var self = this,
        baseCtx = self.baseCtx;

    if (!baseCtx) {
        return;
    }

    var level = self.map.getLevel();
    var scale = 1;
    if (this.level > level) {
        scale = 1 / ((this.level - level) * 2); //[5,4],[5,3],[5,2]
    } else if (this.level < level) {
        scale = (level - this.level) * 2; //[5,6],[5,7],[5,8]
    } else {
        scale = 1; //[5,5]
    }

    var points = self.options.data;
    points.forEach(function (point) {
        point.scale = scale;
        self._draw(baseCtx, self.map, point);
    });
};

Ring.prototype._draw = function (context, map, point) {
    var pixel = map.toScreen(point);
    var rgb = point.color.join(',');
    context.beginPath();
    context.arc(pixel.x, pixel.y, point.radius * point.scale, 0, Math.PI * 2, true);
    var gradient = context.createRadialGradient(pixel.x, pixel.y, 0, pixel.x, pixel.y, point.radius * point.scale);
    gradient.addColorStop(0, 'rgba(255,255,255,0)');
    gradient.addColorStop(0.55, 'rgba(255,255,255,0)');
    gradient.addColorStop(0.58, 'rgba(' + rgb + ',0.2)');
    gradient.addColorStop(1, 'rgba(' + rgb + ',0)');
    // gradient.addColorStop(0.58, 'rgba(0,255,255,0.2)');
    // gradient.addColorStop(1, 'rgba(0,255,255,0)');
    context.fillStyle = gradient;
    context.closePath();
    context.fill();
};

Ring.prototype.adjustSize = function () {
    var width = this.map.width;
    var height = this.map.height;
    this.baseCtx.canvas.width = width;
    this.baseCtx.canvas.height = height;
    resolutionScale(this.baseCtx);
};

Ring.prototype.start = function () {
    this.adjustSize();
    this.render();
};

return Ring;

})));
