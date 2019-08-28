(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.BranchRiver = factory());
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

var img1 = document.createElement('img');
var img2 = document.createElement('img');
var img3 = document.createElement('img');
img1.src = 'images/1.png';
img2.src = 'images/2.png';
img3.src = 'images/3.png';

var BranchRiver = function BranchRiver(map, userOptions) {
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
        renderLineWidth: [4, 3, 2, 1], //尾巴动画线条宽度
        animateLineStyle: '#ffff00', //动画线条颜色
        colors: ["#b5c334", "#59c4e6", "#edafda", "#93b7e3", "#a5e7f0", "#cbb0e3"]
    };

    self.init(userOptions, options);

    //全局变量
    var baseCtx = self.baseCtx = self.options.canvas.getContext("2d");
    var animateCtx = self.animateCtx = self.options.animateCanvas.getContext("2d");
    var topCtx = self.topCtx = self.options.topCanvas.getContext("2d");
    baseCtx.lineWidth = options.lineWidth;
};

BranchRiver.prototype.init = function (setting, defaults) {
    //合并参数
    tool.merge(setting, defaults);
    this.options = defaults;
};

BranchRiver.prototype.render = function () {
    var self = this;
    var baseCtx = self.baseCtx;
    if (!baseCtx) {
        return;
    }
    var roadLines = self.roadLines;
    roadLines.forEach(function (line) {
        //line.drawPath(baseCtx, self.map, self.options);
    });
};

BranchRiver.prototype.animate = function () {
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
    //首先加载grade=0||grade=1,0&1——2——3，
    if (self.runlines && self.runlines.length === 0) {
        self.runlines = self.roadLines.filter(function (item, index, array) {
            return item.type == 0;
        });
    } else if (self.runlines.length < self.roadLines.length) {
        self.runlines.forEach(function (runline) {
            var type = runline.type;
            var lastPointLng = runline.currentpoint.x;
            var childLines = self.roadLines.filter(function (value) {
                return value.type == type + 1;
            });
            childLines.forEach(function (childline) {
                if (childline.points[0].x == lastPointLng) {
                    self.runlines.push(childline);
                }
            });
        });
    }
    var roadLines = self.runlines;
    switch (self.options.type) {
        case 'point':
            roadLines.forEach(function (line, index, arr) {
                line.draw(animateCtx, self.map, self.options, self.topCtx);
            });
            break;
        case 'arrow':
            roadLines.forEach(function (line, index, arr) {
                line.drawArrow(animateCtx, self.map, self.options);
            });
            break;
        case 'circle':
            roadLines.forEach(function (line, index, arr) {
                line.drawCircle(animateCtx, self.map, self.options);
            });
            break;
    }
};

BranchRiver.prototype.adjustSize = function () {
    var width = this.map.width;
    var height = this.map.height;
    this.baseCtx.canvas.width = width;
    this.baseCtx.canvas.height = height;
    this.animateCtx.canvas.width = width;
    this.animateCtx.canvas.height = height;
    this.topCtx.canvas.width = width;
    this.topCtx.canvas.height = height;
    resolutionScale(this.baseCtx);
    resolutionScale(this.animateCtx);
    resolutionScale(this.topCtx);
};

BranchRiver.prototype.start = function () {
    var self = this;
    self.stop();
    self.adjustSize();
    self.addLine();
    if (self.options.isShowBaseLine) {
        self.render();
    }

    // (function drawFrame() {
    //     self.timer = setTimeout(function () {
    //         if (self.animationId) {
    //             cancelAnimationFrame(self.animationId);
    //         }
    //         self.animationId = requestAnimationFrame(drawFrame);
    //         self.animate();
    //     }, 60);
    // })();
    (function drawFrame() {
        if (self.animationId) {
            cancelAnimationFrame(drawFrame);
        }
        self.animationId = requestAnimationFrame(drawFrame);
        self.animate();
    })();

    // self.drawStation(this.topCtx, this.map);
};

BranchRiver.prototype.stop = function () {
    var self = this;
    if (self.animationId) {
        cancelAnimationFrame(self.animationId);
    }
    if (self.timer) {
        clearTimeout(self.timer);
    }
};

BranchRiver.prototype.addLine = function () {
    var options = this.options;
    this.runlines = [];
    var roadLines = this.roadLines = [],
        dataset = this.options.data;

    dataset.forEach(function (line, i) {
        var color = options.colors[line.type];
        // var lineWidth = (i == 0 ? options.renderLineWidth[0] : options.renderLineWidth[1]);
        var lineWidth = options.renderLineWidth[line.type];
        // var baseLineWidth = (i == 0 ? options.renderLineWidth[0] : 0);
        var baseLineWidth = i == 0 ? 1 : 0;
        roadLines.push(new Line({
            type: line.type,
            points: line.list,
            color: color || '#a5e7f0',
            lineWidth: lineWidth || 1,
            baseLineWidth: baseLineWidth
        }));
    });
};

// BranchRiver.prototype.drawStation = function (context, map) {
//     context.clearRect(0, 0, map.width, map.height);
//     var options = this.options;
//     var stations = options.stations;
//     stations.forEach(function (station, i) {
//         var _screePoint = map.toScreen(station.point);
//         context.beginPath();
//         context.arc(_screePoint.x, _screePoint.y, 5, 0, Math.PI * 2);
//         context.fillStyle = 'red';
//         context.fill();
//     });
// };

function Line(options) {
    this.type = options.type;
    this.points = options.points || [];
    this.age = options.age || 0;
    this.maxAge = options.maxAge || 0;
    this.color = options.color || '#ffff00';
    this.grap = options.grap || 10;
    this.lineWidth = options.lineWidth || 1;
    this.baseLineWidth = options.baseLineWidth || 0;
    this.running = false; //是否正在运动
    this.finished = false; //是否已经完成第一次运动
    this.currentpoint = this.points[0];
    this.tempPoints = [0];
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

Line.prototype.getStationPointList = function (map, stationList) {
    var stations = this.stations = [];
    if (stationList && stationList.length > 0) {
        stationList.forEach(function (s) {
            stations.push({
                name: s.name,
                grade: s.grade,
                isdraw: false,
                pixel: map.toScreen(s.point)
            });
        });
    }
    return stations;
};

Line.prototype.drawPath = function (context, map, options) {
    if (this.baseLineWidth == 0) return;
    var pointList = this.path || this.getPointList(map);
    context.save();
    context.beginPath();
    context.lineWidth = this.baseLineWidth;
    context.strokeStyle = '#fff'; //this.color;
    // context.strokeStyle = options.lineStyle;
    context.moveTo(pointList[0].pixel.x, pointList[0].pixel.y);
    for (var i = 0, len = pointList.length; i < len; i++) {
        context.lineTo(pointList[i].pixel.x, pointList[i].pixel.y);
    }
    context.stroke();
    context.restore();
};

Line.prototype.drawSingleStation = function (context, map, point) {
    // context.clearRect(0, 0, map.width, map.height);
    // context.beginPath();
    // context.arc(point.pixel.x, point.pixel.y, 5, 0, Math.PI * 2);
    // context.fillStyle = 'red';
    // context.fill();
    // context.closePath();

    // //绘制文字
    // context.font = '12px Arial';
    // context.textAlign = 'left';
    // context.textBaseline = 'Alphabetic';
    // context.strokeStyle = '#FF0000';
    // // context.strokeText(point.name, point.pixel.x + 5, point.pixel.y);
    // context.fillText(point.name, point.pixel.x + 5, point.pixel.y);
    var _img;
    switch (parseInt(point.grade)) {
        case 1:
            _img = img1;
            break;
        case 2:
            _img = img2;
            break;
        case 3:
            _img = img3;
            break;
    }
    context.save();
    context.translate(point.pixel.x, point.pixel.y);
    // context.drawImage(_img, -12, -12, 24, 24);
    context.drawImage(_img, 0, 0, 20, 20);
    context.restore();
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
            // context.lineWidth = options.animateLineWidth;
            context.lineWidth = options.lineWidth;
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

//第一个点从0开始，
//0
//0，10
//0，10，20
//0，10，20，30
//0，10，20，30，40
Line.prototype.draw = function (context, map, options, topCtx) {
    var self = this;
    var pointList = this.path || this.getPointList(map);
    if (this.movePoints == undefined || this.movePoints.length == 0) {
        this.random(map);
    }
    var movePoints = this.movePoints;
    var moveLen = movePoints.length;
    var tempPoints = this.tempPoints;
    var stations = this.stations || this.getStationPointList(map, options.stations);
    if (tempPoints.length <= moveLen) {
        for (var j = 0; j < tempPoints.length; j++) {
            if (tempPoints[j] >= this.maxAge - 1) {
                tempPoints[j] = 0;
            }
            var nowPoint = pointList[tempPoints[j]].pixel;
            var nextPoint = pointList[tempPoints[j] + 1].pixel;

            context.beginPath();
            context.lineWidth = this.lineWidth;
            context.strokeStyle = this.color;
            context.lineCap = "round";
            context.moveTo(nowPoint.x, nowPoint.y);
            context.lineTo(nextPoint.x, nextPoint.y);
            context.stroke();
            this.tempPoints[j]++;
            //判断当前点是否是站点，如果是则画出站点
            for (var s = 0; s < stations.length; s++) {
                var _point = stations[s];
                if (_point.isdraw == false && _point.pixel.x == nowPoint.x && _point.pixel.y == nowPoint.y) {
                    self.drawSingleStation(topCtx, map, _point);
                    _point.isdraw = true;
                }
            }
        }
        var index = this.tempPoints[tempPoints.length - 1];
        this.currentpoint = this.points[index];
        if (movePoints.contains(index)) {
            tempPoints.unshift(0);
        }
    } else {
        for (var k = 0; k < moveLen; k++) {
            if (movePoints[k] >= this.maxAge - 1) {
                movePoints[k] = 0;
                this.finished = true;
            }
            var currentPoint = pointList[movePoints[k]];
            context.beginPath();
            // context.lineWidth = options.animateLineWidth;
            context.lineWidth = this.lineWidth;
            context.strokeStyle = this.color;
            context.lineCap = "round";
            context.moveTo(currentPoint.pixel.x, currentPoint.pixel.y);
            context.lineTo(pointList[movePoints[k] + 1].pixel.x, pointList[movePoints[k] + 1].pixel.y);
            context.stroke();
            this.movePoints[k]++;
        }
    }
    this.running = true;
};

Line.prototype.drawCircle = function (context, map, options) {
    var pointList = this.path || this.getPointList(map);
    if (this.movePoints == undefined || this.movePoints.length == 0) {
        this.random(map);
    }
    var movePoints = this.movePoints;
    var moveLen = movePoints.length;
    var tempPoints = this.tempPoints;
    if (tempPoints.length < moveLen) {
        for (var j = 0; j < tempPoints.length; j++) {
            if (tempPoints[j] >= this.maxAge - 1) {
                tempPoints[j] = 0;
            }
            var nowPoint = pointList[tempPoints[j]].pixel;
            var nextPoint = pointList[tempPoints[j] + 1].pixel;

            context.beginPath();
            context.arc(nowPoint.x, nowPoint.y, this.lineWidth, 0, Math.PI * 2);
            context.fillStyle = this.color;
            context.fill();
            this.tempPoints[j]++;
        }
        var index = this.tempPoints[tempPoints.length - 1];
        if (movePoints.contains(index)) {
            tempPoints.unshift(0);
        }
    } else {
        for (var k = 0; k < moveLen; k++) {
            if (movePoints[k] >= this.maxAge - 1) {
                movePoints[k] = 0;
                this.finished = true;
            }
            var currentPoint = pointList[movePoints[k]].pixel;
            context.beginPath();
            context.arc(currentPoint.x, currentPoint.y, this.lineWidth, 0, Math.PI * 2);
            context.fillStyle = this.color;
            context.fill();
            this.movePoints[k]++;
        }
    }
    this.running = true;
};

Line.prototype.random = function (map) {
    var pointList = this.path || this.getPointList(map);
    var arr = [],
        gap = this.grap; //间隔
    if (gap > pointList.length) {
        this.grap = Math.floor(pointList.length / 2);
    }
    var maxNum = Math.floor(pointList.length / gap);

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

    // this.movePoints = [0];
    this.movePoints = arr;
};

//声明----如果有此 contains 直接用最好
Array.prototype.contains = function (needle) {
    for (var i in this) {
        if (this[i] == needle) return true;
    }
    return false;
};

return BranchRiver;

})));
