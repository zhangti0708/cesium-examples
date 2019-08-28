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
        type: 'point',
        isShowBaseLine: 'true',
        grap: 10,
        isShowTail: true, //是否显示粒子尾巴效果
        lineWidth: 0.5, //线条宽度
        lineStyle: '#C82800', //线条颜色
        tailOpacity: 0.88, //尾巴动画透明度
        animateLineWidth: 1, //动画线条宽度
        animateLineStyle: '#ffff00', //动画线条颜色
        // colors: ["#516b91", "#59c4e6", "#edafda", "#93b7e3", "#a5e7f0", "#cbb0e3"]
        colors: ["#c1232b", "#27727b", "#fcce10", "#e87c25", "#b5c334", "#fe8463", "#9bca63", "#fad860", "#f3a43b", "#60c0dd", "#d7504b", "#c6e579", "#f4e001", "#f0805a", "#26c0c0"]
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
    if (self.options.isShowTail) {
        animateCtx.fillStyle = "rgba(0,0,0," + self.options.tailOpacity + ")";
        var prev = animateCtx.globalCompositeOperation;
        animateCtx.globalCompositeOperation = "destination-in";
        animateCtx.fillRect(0, 0, self.map.width, self.map.height);
        animateCtx.globalCompositeOperation = prev;
    } else {
        animateCtx.clearRect(0, 0, self.map.width, self.map.height);
    }

    var roadLines = self.roadLines;
    switch (self.options.type) {
        case 'point':
            roadLines.forEach(function (line) {
                line.draw(animateCtx, self.map, self.options);
            });
            break;
        case 'arrow':
            roadLines.forEach(function (line) {
                line.drawArrow(animateCtx, self.map, self.options);
            });
            break;
        case 'circle':
            roadLines.forEach(function (line) {
                line.drawCircle(animateCtx, self.map, self.options);
            });
            break;
    }
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
    if (self.options.isShowBaseLine) {
        self.render();
    }

    (function drawFrame() {
        self.timer = setTimeout(function () {
            if (self.animationId) {
                cancelAnimationFrame(self.animationId);
            }
            self.animationId = requestAnimationFrame(drawFrame);
            self.animate();
        }, 150);
    })();
    // (function drawFrame() {
    //     if (self.animationId) {
    //         cancelAnimationFrame(drawFrame);
    //     }
    //     self.animationId = requestAnimationFrame(drawFrame);
    //     self.animateArrow();
    // })();
};

MoveLine.prototype.stop = function () {
    var self = this;
    if (self.animationId) {
        cancelAnimationFrame(self.animationId);
    }
    if (self.timer) {
        clearTimeout(self.timer);
    }
};

MoveLine.prototype.addLine = function () {
    var options = this.options;
    var roadLines = this.roadLines = [],
        dataset = this.options.data;
    dataset.forEach(function (line, i) {
        roadLines.push(new Line({
            points: line,
            color: options.colors[Math.floor(Math.random() * options.colors.length)]
        }));
    });
};

function Line(options) {
    this.points = options.points || [];
    this.age = options.age || 0;
    this.maxAge = options.maxAge || 0;
    this.color = options.color || '#ffff00';
    this.grap = options.grap || 10;
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
    context.strokeStyle = this.color;
    // context.strokeStyle = options.lineStyle;
    context.moveTo(pointList[0].pixel.x, pointList[0].pixel.y);
    for (var i = 0, len = pointList.length; i < len; i++) {
        context.lineTo(pointList[i].pixel.x, pointList[i].pixel.y);
    }
    context.stroke();
};

Line.prototype.drawArrow = function (context, map, options) {
    var pointList = this.path || this.getPointList(map);
    var movePoints = this.movePoints;
    if (movePoints && movePoints.length > 0) {
        var moveLen = movePoints.length;
        for (var i = 0; i < moveLen; i++) {
            if (movePoints[i] >= this.maxAge - 1) {
                movePoints[i] = 0;
            }
            var currentPoint = pointList[movePoints[i]];
            context.beginPath();
            context.lineWidth = options.animateLineWidth;
            context.strokeStyle = this.color;
            context.moveTo(currentPoint.pixel.x, currentPoint.pixel.y);
            context.lineTo(pointList[movePoints[i] + 1].pixel.x, pointList[movePoints[i] + 1].pixel.y);
            context.stroke();

            context.save();

            context.translate(pointList[movePoints[i] + 1].pixel.x, pointList[movePoints[i] + 1].pixel.y);
            //我的箭头本垂直向下，算出直线偏离Y的角，然后旋转 ,rotate是顺时针旋转的，所以加个负号
            var ang = (pointList[movePoints[i] + 1].pixel.x - currentPoint.pixel.x) / (pointList[movePoints[i] + 1].pixel.y - currentPoint.pixel.y);
            ang = Math.atan(ang);
            pointList[movePoints[i] + 1].pixel.y - currentPoint.pixel.y >= 0 ? context.rotate(-ang) : context.rotate(Math.PI - ang); //加个180度，反过来
            context.lineTo(-3, -3);
            context.lineTo(0, 3);
            context.lineTo(3, -3);
            context.lineTo(0, 0);
            context.fillStyle = this.color;
            context.fill(); //箭头是个封闭图形
            context.restore(); //用来恢复Canvas之前保存的状态,否则会影响后续绘制

            this.movePoints[i]++;
        }
    } else {
        this.random(map);
    }
};

Line.prototype.draw = function (context, map, options) {
    var pointList = this.path || this.getPointList(map);
    var movePoints = this.movePoints;
    if (movePoints && movePoints.length > 0) {
        var moveLen = movePoints.length;
        for (var i = 0; i < moveLen; i++) {
            if (movePoints[i] >= this.maxAge - 1) {
                movePoints[i] = 0;
            }
            var currentPoint = pointList[movePoints[i]];
            context.beginPath();
            context.lineWidth = options.animateLineWidth;
            context.strokeStyle = this.color;
            context.lineCap = "round";
            context.moveTo(currentPoint.pixel.x, currentPoint.pixel.y);
            context.lineTo(pointList[movePoints[i] + 1].pixel.x, pointList[movePoints[i] + 1].pixel.y);
            context.stroke();
            this.movePoints[i]++;
        }
    } else {
        this.random(map);
    }
};

Line.prototype.drawCircle = function (context, map, options) {
    var pointList = this.path || this.getPointList(map);
    if (this.movePoints && this.movePoints.length > 0) {
        var moveLen = this.movePoints.length;
        for (var i = 0; i < moveLen; i++) {
            if (this.movePoints[i] >= this.maxAge - 1) {
                this.movePoints[i] = 0;
            }
            var currentPoint = pointList[this.movePoints[i]];
            context.beginPath();
            context.arc(currentPoint.pixel.x, currentPoint.pixel.y, 1, 0, Math.PI * 2);
            context.fillStyle = this.color;
            context.fill();
            this.movePoints[i]++;
        }
    } else {
        this.random(map);
    }
};

Line.prototype.random = function (map) {
    var pointList = this.path || this.getPointList(map);
    var arr = [],
        gap = this.grap,
        //间隔
    maxNum = Math.floor(pointList.length / gap);

    while (arr.length < maxNum) {
        for (var i = 0; i < pointList.length; i += gap) {
            if (arr.length === 0) {
                //如果数组长度为0则直接添加到arr数组
                arr.push(i);
            } else {
                if (arr.indexOf(i) == -1) {
                    arr.push(i);
                }
            }
        }
    }

    this.movePoints = arr;
};

return MoveLine;

})));
