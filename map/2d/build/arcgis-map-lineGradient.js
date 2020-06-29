(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.LineGradient = factory());
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

var global = typeof window === 'undefined' ? {} : window;

var requestAnimationFrame = global.requestAnimationFrame || global.mozRequestAnimationFrame || global.webkitRequestAnimationFrame || global.msRequestAnimationFrame || function (callback) {
    return global.setTimeout(callback, 1000 / 60);
};

var cancelAnimationFrame = global.cancelAnimationFrame || global.mozCancelAnimationFrame || global.webkitCancelAnimationFrame || global.msCancelAnimationFrame || function (id) {
    clearTimeout(id);
};

var LineGradient = function LineGradient(map, userOptions) {
    var self = this;

    self.map = map;
    self.lines = [];
    self.pixelList = [];

    //默认参数
    var options = {
        //线条宽度
        lineWidth: 1
    };

    self.init(userOptions, options);

    //全局变量
    this.baseCtx = self.options.baseCanvas.getContext("2d");
    this.animateCtx = self.options.animateCanvas.getContext("2d");
    this.width = map.width;
    this.height = map.height;

    this.clickEvent = this.clickEvent.bind(this);

    this.bindEvent();
};

LineGradient.prototype.start = function () {
    var self = this;
    self.stop();
    self.adjustSize();

    self.renderBaselayer(); //底层canvas渲染

    (function drawFrame() {
        self.timer = setTimeout(function () {
            self.animationId = requestAnimationFrame(drawFrame);
            self.renderAnimatelayer(); //动画层canvas渲染
        }, 1000 / 10);
    })();
};

LineGradient.prototype.stop = function () {
    var self = this;
    if (self.animationId) {
        cancelAnimationFrame(self.animationId);
    }
    if (self.timer) {
        clearTimeout(self.timer);
    }
};

LineGradient.prototype.adjustSize = function () {
    var width = this.width;
    var height = this.height;
    this.baseCtx.canvas.width = width;
    this.baseCtx.canvas.height = height;
    this.animateCtx.canvas.width = width;
    this.animateCtx.canvas.height = height;
    resolutionScale(this.baseCtx);
    resolutionScale(this.animateCtx);
};

LineGradient.prototype.addLine = function () {
    var self = this,
        options = this.options;
    if (self.lines && self.lines.length > 0) return;
    var dataset = options.data;
    var legend = new Legend();

    dataset.forEach(function (item, i) {
        var line = new Line({
            name: item.name,
            label: item.label,
            labelColor: item.labelColor,
            path: []
        });

        item.data.forEach(function (point, j) {
            point.color = legend.getColor(point.value).color;
            line.path.push(point);
        });

        self.lines.push(line);
    });
};

LineGradient.prototype.init = function (settings, defaults) {
    //合并参数
    tool.merge(settings, defaults);
    this.options = defaults;

    //初始化线条数据
    this.addLine();
};

LineGradient.prototype.renderBaselayer = function () {
    var self = this;
    var context = self.baseCtx;
    if (!context) return;

    context.clearRect(0, 0, self.width, self.height);

    self.pixelList = [];
    self.lines.forEach(function (line) {
        self.pixelList.push({
            name: line.name,
            label: line.label,
            labelColor: line.labelColor,
            data: line.getPointList(self.map)
        });
        line.draw(context, self.map, self.options);
    });
};

LineGradient.prototype.renderAnimatelayer = function () {
    var context = this.animateCtx;
    if (!context) return;

    context.fillStyle = 'rgba(0,0,0,.2)';
    var prev = context.globalCompositeOperation;
    context.globalCompositeOperation = 'destination-in';
    context.fillRect(0, 0, this.width, this.height);
    context.globalCompositeOperation = prev;

    var lines = this.lines;
    for (var i = 0; i < lines.length; i++) {
        lines[i].drawArrow(context, this.map); //画箭头
    }
};

LineGradient.prototype.bindEvent = function (e) {
    var map = this.map;
    if (this.options.methods) {
        if (this.options.methods.mousemove) {
            map.on('mouse-move', this.clickEvent);
        }
    }
};

LineGradient.prototype.clickEvent = function (e) {
    var self = this,
        flag = false,
        lines = self.pixelList;

    if (lines.length > 0) {
        lines.forEach(function (line, i) {
            for (var j = 0; j < line.data.length; j++) {
                var beginPt = line.data[j].pixel;
                if (line.data[j + 1] == undefined) return;
                var curPt = e;
                var inCircle = tool.isPointInCircle(curPt, beginPt, self.options.lineWidth);
                if (inCircle) {
                    self.options.methods.mousemove(e, line.data[j]);
                    flag = true;
                    return;
                }
            }
        });
        if (!flag) {
            document.getElementById('tooltips').style.visibility = 'hidden';
        }
    }
};

function Line(opts) {
    this.name = opts.name;
    this.label = opts.label;
    this.labelColor = opts.labelColor;
    this.path = opts.path;
    this.step = 0;
}

Line.prototype.getPointList = function (map) {
    var points = this.path;
    if (points && points.length > 0) {
        points.forEach(function (point) {
            point.pixel = map.toScreen(point.lonlat);
        });
    }
    return points;
};

Line.prototype.draw = function (context, map, options) {
    var pointList = this.pixelList || this.getPointList(map);

    for (var i = 0, len = pointList.length; i < len - 1; i++) {
        context.save();
        context.beginPath();
        context.lineWidth = options.lineWidth;
        context.strokeStyle = pointList[i].color;
        context.moveTo(pointList[i].pixel.x, pointList[i].pixel.y);
        context.lineTo(pointList[i + 1].pixel.x, pointList[i + 1].pixel.y);
        context.stroke();
        context.closePath();
        context.restore();
    }

    var lastpoint = pointList[pointList.length - 1];
    context.font = 'bold 14px Arial';
    context.textAlign = 'left';
    context.textBaseline = 'middle';
    context.fillStyle = this.labelColor;
    context.fillText(this.label, lastpoint.pixel.x, lastpoint.pixel.y);
};

Line.prototype.drawArrow = function (context, map, options) {
    var pointList = this.pixelList || this.getPointList(map);
    if (this.step >= pointList.length - 1) {
        this.step = 0;
    }
    context.beginPath();
    // context.lineWidth = options.animateLineWidth;
    context.lineWidth = 5;
    context.strokeStyle = '#fff';
    context.moveTo(pointList[this.step].pixel.x, pointList[this.step].pixel.y);
    context.lineTo(pointList[this.step + 1].pixel.x, pointList[this.step + 1].pixel.y);
    context.stroke();

    context.save();
    context.translate(pointList[this.step + 1].pixel.x, pointList[this.step + 1].pixel.y);
    //我的箭头本垂直向下，算出直线偏离Y的角，然后旋转 ,rotate是顺时针旋转的，所以加个负号
    var ang = (pointList[this.step + 1].pixel.x - pointList[this.step].pixel.x) / (pointList[this.step + 1].pixel.y - pointList[this.step].pixel.y);
    ang = Math.atan(ang);
    pointList[this.step + 1].pixel.y - pointList[this.step].pixel.y >= 0 ? context.rotate(-ang) : context.rotate(Math.PI - ang); //加个180度，反过来
    context.lineTo(-6, -6);
    context.lineTo(0, 6);
    context.lineTo(6, -6);
    context.lineTo(0, 0);
    context.fillStyle = '#fff';
    context.fill(); //箭头是个封闭图形
    context.restore(); //用来恢复Canvas之前保存的状态,否则会影响后续绘制

    this.step += 1;
};

function Legend() {
    var options = this.options = {
        width: 400,
        height: 15,
        range: [700, 750, 800, 850, 900, 950, 1000, 1050, 1100],
        gradient: {
            0.1: '#fe0000',
            0.4: '#ffaa01',
            0.7: '#b0e000',
            1.0: '#38a702'
        }
    };

    this.init();
}

Legend.prototype.init = function () {
    var options = this.options;
    var canvas = this.canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    canvas.width = options.width;
    canvas.height = options.height;
    var grad = context.createLinearGradient(0, 0, canvas.width, canvas.height);
    for (var gradient in options.gradient) {
        grad.addColorStop(gradient, options.gradient[gradient]);
    }
    context.fillStyle = grad;
    context.fillRect(0, 0, canvas.width, canvas.height);
    this.imageData = context.getImageData(0, 0, canvas.width, canvas.height);
};

Legend.prototype.d2Hex = function (d) {
    var hex = Number(d).toString(16);
    while (hex.length < 2) {
        hex = "0" + hex;
    }
    return hex.toUpperCase();
};

Legend.prototype.getRgbColor = function (point) {
    var imageData = this.imageData;
    var data = imageData.data;
    var i = (point.y * this.canvas.width + point.x) * 4;
    var rgb = [],
        color = '#',
        objRgbColor = {
        "rgb": rgb,
        "color": color
    };
    for (var j = 0; j < 3; j++) {
        rgb.push(data[i + j]);
        color += this.d2Hex(data[i + j]);
    }
    objRgbColor.color = color;
    return objRgbColor;
};

Legend.prototype.getColor = function (value) {
    var options = this.options;
    var colorValue = value - options.range[0];
    var point = {
        x: Math.round(colorValue * this.canvas.width / (options.range[options.range.length - 1] - options.range[0])),
        y: 1
    };
    return this.getRgbColor(point);
};

return LineGradient;

})));
