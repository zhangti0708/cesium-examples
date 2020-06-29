(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.Temperature = factory());
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

/**
 * @author https://github.com/chengquan223
 * @Date 2019-3-29
 * 创建一个canvas，width，height为地图的大小，填充颜色，并获取到imageData
 * for循环width、height，i+=2;
 * 判断point(x,y)是否在地图范围内，矩形或边界地图都适用
 * fasle，不在地图范围内，将color设置为透明色rgba(0,0,0,0)，且point(x,y) = point(x+1,y) = point(x,y+1) = point(x+1,y+1)
 * true，在地图范围内，将point(x,y)转换成经纬度坐标point(lon,lat)
 * 由point(lon,lat)与grid网格关系换算得出point(lon,lat)相对于grid的网格点g(x,y)
 *     g00          g10
 *          g(x,y)
 *     g10          g11
 * 双线性插值计算出点g(x,y)的value
 * 将value作为参数传入颜色带，根据比例换算得出rgb
 * 最终将rba回填至canvas图层的imageData
 */
var Temperature = function Temperature(map, userOptions) {
    this.map = map;
    this.lines = [];
    this.pixelList = [];

    //默认参数
    var options = {
        //线条宽度
        lineWidth: 1
    };

    this.init(userOptions, options);

    //全局变量
    this.baseCtx = this.options.baseCanvas.getContext("2d");
    this.width = map.width;
    this.height = map.height;

    this.clickEvent = this.clickEvent.bind(this);

    this.bindEvent();
};

Temperature.prototype.init = function (settings, defaults) {
    //合并参数
    tool.merge(settings, defaults);
    this.options = defaults;

    this.legend = new Legend();
};

Temperature.prototype.createMask = function () {
    var canvas = document.createElement('canvas'),
        context = canvas.getContext('2d'),
        width = this.width,
        height = this.height;

    canvas.width = width;
    canvas.height = height;
    context.fillStyle = "rgba(255, 0, 0, 1)";
    context.fillRect(0, 0, width, height);

    var imageData = context.getImageData(0, 0, width, height);
    var data = imageData.data;
    var mask = this.mask = {
        imageData: imageData,
        isVisible: function isVisible(x, y) {
            var i = (y * width + x) * 4;
            return data[i + 3] > 0;
        },
        set: function set(x, y, rgba) {
            var i = (y * width + x) * 4;
            data[i] = rgba[0];
            data[i + 1] = rgba[1];
            data[i + 2] = rgba[2];
            data[i + 3] = rgba[3];
            return this;
        }
    };
    return mask;
};

Temperature.prototype.createView = function () {
    var options = this.options,
        extent = options.extent,
        Point = options.Point,
        start = map.toScreen(new Point({
        x: extent[0],
        y: extent[1],
        spatialReference: {
            wkid: 4326
        }
    })),
        end = map.toScreen(new Point({
        x: extent[2],
        y: extent[3],
        spatialReference: {
            wkid: 4326
        }
    }));

    return {
        x: start.x,
        y: start.y,
        xMax: end.x,
        yMax: end.y
    };
};

Temperature.prototype.interpolateField = function () {
    var self = this,
        map = this.map,
        xMax = this.width,
        yMax = this.height,
        opts = this.options,
        view = this.createView(),
        extent = opts.extent,
        grid = opts.data,
        legend = this.legend,
        x = 0,
        ScreenPoint = opts.ScreenPoint,
        webMercatorUtils = opts.webMercatorUtils;
    var mask = this.mask || this.createMask();

    function interpolateColumn(x) {
        for (var y = 0; y < yMax; y += 2) {
            var color = [0, 0, 0, 0];
            if (mask.isVisible(x, y)) {
                //判断该点是否在矩形区域范围内，true则插值计算出value得到rgba并更新imageData，false则设置透明
                if (x >= view.x && x <= view.xMax && y >= view.y && y <= view.yMax) {
                    var coord = map.toMap(new ScreenPoint(x, y)),
                        lonlat = webMercatorUtils.xyToLngLat(coord.x, coord.y),
                        value = interpolate(lonlat[0], lonlat[1]),
                        rgb = legend.getColor(value).rgb;
                    color = [rgb[0], rgb[1], rgb[2], 150];
                }
                mask.set(x, y, color).set(x + 1, y, color).set(x, y + 1, color).set(x + 1, y + 1, color);
            } else {
                console.error(x, y);
            }
        }
    }

    function interpolate(lon, lat) {
        var i = floorMod(Math.abs(lon - extent[0]), 360) / opts.dx;
        var j = (extent[1] - lat) / opts.dy;

        var fi = Math.floor(i),
            ci = fi + 1,
            fj = Math.floor(j),
            cj = fj + 1;

        var row;
        if (row = grid[fj]) {
            var g00 = row[fi];
            var g10 = row[ci];
            if (isValue(g00) && isValue(g10) && (row = grid[cj])) {
                var g01 = row[fi];
                var g11 = row[ci];
                if (isValue(g01) && isValue(g11)) {
                    return bilinearInterpolateScalar(i - fi, j - fj, g00, g10, g01, g11);
                }
            }
        }
        return null;
    }

    function floorMod(a, n) {
        var f = a - n * Math.floor(a / n);
        return f === n ? 0 : f;
    }

    function isValue(x) {
        return x !== null && x !== undefined;
    }

    function bilinearInterpolateScalar(x, y, g00, g10, g01, g11) {
        var rx = 1 - x;
        var ry = 1 - y;
        return g00 * rx * ry + g10 * x * ry + g01 * rx * y + g11 * x * y;
    }

    (function batchInterpolate() {
        var start = Date.now();
        while (x < xMax) {
            interpolateColumn(x);
            x += 2;
            if (Date.now() - start > 100) {
                setTimeout(batchInterpolate, 25);
                return;
            }
        }
        self.renderBaselayer(mask);
    })();
};

Temperature.prototype.renderBaselayer = function (mask) {
    var context = this.baseCtx;
    context.putImageData(mask.imageData, 0, 0);
};

Temperature.prototype.start = function () {
    var self = this;
    self.adjustSize();

    //插值
    self.interpolateField();

    // self.renderBaselayer(); //底层canvas渲染

    // (function drawFrame() {
    //     self.timer = setTimeout(function () {
    //         self.animationId = requestAnimationFrame(drawFrame);
    //         self.renderAnimatelayer(); //动画层canvas渲染
    //     }, 1000 / 10);
    // }());
};

Temperature.prototype.adjustSize = function () {
    var width = this.width;
    var height = this.height;
    this.baseCtx.canvas.width = width;
    this.baseCtx.canvas.height = height;
    this.baseCtx.clearRect(0, 0, width, height);
    resolutionScale(this.baseCtx);
};

Temperature.prototype.bindEvent = function (e) {
    var map = this.map;
    if (this.options.methods) {
        if (this.options.methods.mousemove) {
            map.on('mouse-move', this.clickEvent);
        }
    }
};

Temperature.prototype.clickEvent = function (e) {
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

function Legend() {
    this.options = {
        width: 400,
        height: 15,
        range: [0, 220],
        gradient: {
            0.1: '#96f3ff',
            0.2: '#00c3ff',
            0.3: '#00e68c',
            0.4: '#00e600',
            0.5: '#fffa00',
            0.6: '#ffbe00',
            0.7: '#ff7300',
            0.8: '#fa1400',
            0.9: '#c80091',
            1.0: '#8200a0'
            // gradient: {
            //     0.1: '#38a702',
            //     0.4: '#b0e000',
            //     0.7: '#ffaa01',
            //     1.0: '#fe0000'
            // }
        } };
    this.init();
}

Legend.prototype.init = function () {
    var options = this.options,
        canvas = this.canvas = document.createElement('canvas'),
        width = canvas.width = options.width,
        height = canvas.height = options.height,
        context = canvas.getContext('2d'),
        grad = context.createLinearGradient(0, 0, width, height);
    for (var gradient in options.gradient) {
        grad.addColorStop(gradient, options.gradient[gradient]);
    }
    context.fillStyle = grad;
    context.fillRect(0, 0, width, height);
    this.imageData = context.getImageData(0, 0, width, height);
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
    var options = this.options,
        range = options.range,
        colorValue = value - range[0],
        point = {
        x: Math.round(colorValue * this.canvas.width / (range[range.length - 1] - range[0])),
        y: 1
    };
    return this.getRgbColor(point);
};

return Temperature;

})));
