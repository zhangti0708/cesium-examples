(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

var global = typeof window === 'undefined' ? {} : window;

var requestAnimationFrame = global.requestAnimationFrame || global.mozRequestAnimationFrame || global.webkitRequestAnimationFrame || global.msRequestAnimationFrame || function (callback) {
    return global.setTimeout(callback, 1000 / 60);
};

var cancelAnimationFrame = global.cancelAnimationFrame || global.mozCancelAnimationFrame || global.webkitCancelAnimationFrame || global.msCancelAnimationFrame || function (id) {
    clearTimeout(id);
};

function Typhoon(obj) {
    this.id = obj.id; //台风编号
    this.lon = obj.lon;
    this.lat = obj.lat;
    this.pubTime = obj.pubTime; //发布时间
    this.airPress = obj.airPress; //气压
    this.speed = obj.speed; //最大风速
    this.radius6 = obj.radius6; //六级半径
    this.radius7 = obj.radius7; //七级半径
    this.radius8 = obj.radius8; //八级半径
    this.radius10 = obj.radius10; //十级半径
    this.radius12 = obj.radius12; //十二级半径
    this.level = obj.level; //等级（热带风暴）
    this.power = obj.power; //风力（10级）
    this.color = obj.color;
}

//各级风力半径
Typhoon.prototype.getRadiusList = function (zoom) {
    var radiusList = [];
    var pixel = Math.pow(2, 18 - zoom); //该级别1px代表的距离
    if (this.radius6 != '') {
        radiusList.push(Number(this.radius6) * 1000 / pixel);
    }
    if (this.radius7 != '') {
        radiusList.push(Number(this.radius7) * 1000 / pixel);
    }
    if (this.radius8 != '') {
        radiusList.push(Number(this.radius8) * 1000 / pixel);
    }
    if (this.radius10 != '') {
        radiusList.push(Number(this.radius10) * 1000 / pixel);
    }
    if (this.radius12 != '') {
        radiusList.push(Number(this.radius12) * 1000 / pixel);
    }
    return radiusList;
};

Typhoon.prototype.drawSymbol = function (context, x, y) {
    context.beginPath();
    context.fillStyle = this.color;
    context.strokeStyle = '#555';
    context.lineWidth = .3;
    context.arc(x, y, 4, 0, Math.PI * 2);
    context.fill();
    context.stroke();
    context.closePath();
};

Typhoon.prototype.drawLine = function (context, x1, y1, x2, y2) {
    context.lineWidth = 2;
    context.strokeStyle = '#0076c9';
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
    context.closePath();
};

Typhoon.prototype.drawCircle = function (context, x, y, r, i) {
    context.beginPath();
    context.fillStyle = 'rgba(255,172,5,' + 0.3 + 0.15 * i + ')';
    context.strokeStyle = 'rgba(255,172,5,.8)';
    context.lineWidth = 1;
    context.arc(x, y, r, 0, Math.PI * 2);
    context.fill();
    context.stroke();
    context.closePath();
};

Typhoon.prototype.drawImage = function (context, img, x, y) {
    img.addEventListener("load", function () {
        context.drawImage(img, x - 15, y - 15, 30, 30);
    });
    if (img.complete) {
        context.drawImage(img, x - 15, y - 15, 30, 30);
    }
};

var baseInfo = {
    splitList: [{
        name: 'TD',
        level: '热带低压',
        power: '6~7级',
        color: '#02ff02'
    }, {
        name: 'TS',
        level: '热带风暴',
        power: '8~9级',
        color: '#0264ff'
    }, {
        name: 'STS',
        level: '强热带风暴',
        power: '10~11级',
        color: '#fffb05'
    }, {
        name: 'TY',
        level: '台风',
        power: '12~13级',
        color: '#ffac05'
    }, {
        name: 'STY',
        level: '强台风',
        power: '14~15级',
        color: '#f171f9'
    }, {
        name: 'SUPER TY',
        level: '超强台风',
        power: '>=16级',
        color: '#fe0202'
    }],
    get: function get(name) {
        var splitList = this.splitList;
        for (var i = 0; i < splitList.length; i++) {
            var split = splitList[i];
            if (split.name === name) {
                return split;
            }
        }
    }
};

/************定义canvas图层************/
function TyphoonOverLayer() {}

TyphoonOverLayer.prototype = new BMap.Overlay();

TyphoonOverLayer.prototype.initialize = function () {
    var canvas = document.createElement('canvas');
    canvas.id = "typhoonCanvas";
    canvas.width = paint.width = map.getSize().width;
    canvas.height = paint.height = map.getSize().height;
    canvas.style.position = 'absolute';
    canvas.style.top = 0;
    canvas.style.left = 0;
    ctx = canvas.getContext('2d');
    map.getPanes().labelPane.appendChild(canvas);
};

TyphoonOverLayer.prototype.draw = function () {
    var bounds = map.getBounds(); //返回当前视口的西南纬度/经度和东北纬度/经度
    var sw = bounds.getSouthWest();
    var ne = bounds.getNorthEast();
    var py = map.pointToOverlayPixel(new BMap.Point(sw.lng, ne.lat)); //经纬度转成屏幕坐标
    ctx.canvas.style.left = py.x + 'px';
    ctx.canvas.style.top = py.y + 'px';
    ctx.clearRect(0, 0, paint.width, paint.height);
    paint.zoom = map.getZoom();
    paint.dataSet.forEach(function (data) {
        var px = map.pointToOverlayPixel(new BMap.Point(data.lon, data.lat));
        data.x = px.x - py.x;
        data.y = px.y - py.y;
    });
    paint.render();
};

var ctx;
var paint = {
    isAnimation: true, //是否开启动画
    deg: 0,
    render: function render() {
        this.isAnimation ? this.draw() : this.drawPath();
    },
    drawPath: function drawPath(oldDataSet) {
        var self = this;
        var dataSet = oldDataSet || self.dataSet;
        //绘制点、线、图片
        dataSet.forEach(function (data, i) {
            ctx.save();
            if (i < dataSet.length - 1) {
                var nextData = dataSet[i + 1];
                data.drawLine(ctx, data.x, data.y, nextData.x, nextData.y);
                data.drawSymbol(ctx, data.x, data.y);
            } else {
                data.drawSymbol(ctx, data.x, data.y);
            }
            ctx.restore();
        });

        //绘制各风级范围
        var typhoon = dataSet[self.currentIndex];
        var radiusList = typhoon.getRadiusList(self.zoom);
        ctx.save();

        if (!self.windmillAnimationId) {
            //当风车还未转动时，也就是有轨迹动画时候，画出风车，转动时，已有画风车部分
            typhoon.drawImage(ctx, self.img, typhoon.x, typhoon.y);
        }
        ctx.globalCompositeOperation = "destination-over";
        radiusList.forEach(function (radius, i) {
            typhoon.drawCircle(ctx, typhoon.x, typhoon.y, radius, i);
        });
        ctx.restore();
    },
    draw: function draw() {
        var self = this;
        self.oldDataSet = [];
        self.currentIndex = self.oldDataSet.length > 0 ? self.oldDataSet.length - 1 : 0;
        self.lastIndex = self.dataSet.length - 1; //当点击不同的点时，改变lastIndex，可设置该点风车动画
        self.animationId = null;
        self.pathAnimate();
    },
    pathAnimate: function pathAnimate() {
        var self = this;
        var dataSet = self.dataSet;
        var typhoon = dataSet[self.currentIndex];
        self.oldDataSet.push(typhoon);
        ctx.clearRect(0, 0, self.width, self.height);
        self.drawPath(self.oldDataSet);
        self.animationId = requestAnimationFrame(function () {
            self.pathAnimate(dataSet);
        });
        if (self.currentIndex == self.lastIndex) {
            cancelAnimationFrame(self.animationId);
            self.isAnimation = false;
            self.windMillAnimate();
        } else {
            self.currentIndex++;
        }
    },
    windMillAnimate: function windMillAnimate() {
        var self = this;
        var typhoon = self.dataSet[self.currentIndex];
        ctx.save();
        ctx.clearRect(0, 0, self.width, self.height);
        self.drawPath();
        ctx.translate(typhoon.x, typhoon.y);
        ctx.rotate(self.deg * Math.PI / 180);
        ctx.drawImage(self.img, -15, -15, 30, 30);
        ctx.restore();
        self.deg += 2;
        self.windmillAnimationId = requestAnimationFrame(function () {
            self.windMillAnimate();
        });
    },
    initDataSet: function initDataSet() {
        var img = this.img = new Image();
        img.src = 'images/typhoon.png';
        var dataSet = this.dataSet = [];
        typhoonPath.forEach(function (v, i) {
            var info = baseInfo.get(v.tlev);
            dataSet.push(new Typhoon({
                id: i,
                lon: v.lon,
                lat: v.lat,
                pubTime: v.dt,
                airPress: v.pres,
                speed: v.ws,
                radius6: v.rr06,
                radius7: v.rr07,
                radius8: v.rr08,
                radius10: v.rr10,
                radius12: v.rr12,
                level: info.level,
                power: info.power,
                color: info.color
            }));
        });
    },
    bindEvent: function bindEvent() {
        var self = this;
        map.addEventListener('mousemove', function (e) {
            var cursor = 'default';
            self.dataSet.forEach(function (data, i) {
                var result = Math.sqrt(Math.pow(e.clientX - data.x, 2) + Math.pow(e.clientY - data.y, 2)) <= 5;
                if (result) {
                    cursor = 'pointer';
                    return false;
                }
            });
            map.setDefaultCursor(cursor);
        });
        map.addEventListener('mousedown', function (e) {
            paint.dataSet.forEach(function (data, i) {
                var result = Math.sqrt(Math.pow(e.clientX - data.x, 2) + Math.pow(e.clientY - data.y, 2)) <= 5;
                if (result) {
                    paint.currentIndex = i; //动画设置为当前点
                    return false;
                }
            });
        });
    },
    init: function init() {
        this.bindEvent();
        this.initDataSet();
    }
};
paint.init();
map.addOverlay(new TyphoonOverLayer());

})));
