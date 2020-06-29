(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.FlashMarker = factory());
}(this, (function () { 'use strict';

// (function () {

//     map.plugin(['AMap.CustomLayer'], function () {
//         var canvasLayer123 = new AMap.CustomLayer({});
//     });
//     AMap.CanvasLayer = AMap.Class.extend({
//         initialize: function () {},
//         setMap: function () {}
//     });
// })();

function CanvasLayer(options) {
    this.options = options || {};
    this.zIndex = this.options.zIndex || 0;
    this._map = options.map;
    this.show();
}

CanvasLayer.prototype.initialize = function () {
    var map = this._map;
    var canvas = this.canvas = document.createElement('canvas');
    canvas.id = 'myCanvas';
    var ctx = this.ctx = this.canvas.getContext('2d');
    canvas.style.cssText = "position:absolute;" + "left:0;" + "top:0;" + "z-index:" + this.zIndex + ";";
    this.adjustSize();
    this.adjustRatio(ctx);
    this.layer = new AMap.CustomLayer(canvas, {
        canvas: canvas,
        bounds: map.getBounds(),
        zooms: [0, 22]
    });
    this.layer.setMap(map);
    var that = this;
    map.on('mapmove', function () {
        that.adjustSize();
    });
    map.on('zoomchange', function () {
        that.adjustSize();
    });
    // var bounds = map.getBounds();
    // this.layer.setBounds(bounds);
    return this.canvas;
};

CanvasLayer.prototype.adjustSize = function () {
    var size = this._map.getSize();
    var canvas = this.canvas;
    canvas.width = size.width;
    canvas.height = size.height;
    canvas.style.width = canvas.width + "px";
    canvas.style.height = canvas.height + "px";
};

CanvasLayer.prototype.adjustRatio = function (ctx) {
    var backingStore = ctx.backingStorePixelRatio || ctx.webkitBackingStorePixelRatio || ctx.mozBackingStorePixelRatio || ctx.msBackingStorePixelRatio || ctx.oBackingStorePixelRatio || ctx.backingStorePixelRatio || 1;
    var pixelRatio = (window.devicePixelRatio || 1) / backingStore;
    var canvasWidth = ctx.canvas.width;
    var canvasHeight = ctx.canvas.height;
    ctx.canvas.width = canvasWidth * pixelRatio;
    ctx.canvas.height = canvasHeight * pixelRatio;
    ctx.canvas.style.width = canvasWidth + 'px';
    ctx.canvas.style.height = canvasHeight + 'px';
    ctx.scale(pixelRatio, pixelRatio);
};

CanvasLayer.prototype.show = function () {
    this.initialize();
    if (!this.canvas) {
        this.initialize();
    }
    this.canvas.style.display = 'block';
};

var global = typeof window === 'undefined' ? {} : window;

var requestAnimationFrame = global.requestAnimationFrame || global.mozRequestAnimationFrame || global.webkitRequestAnimationFrame || global.msRequestAnimationFrame || function (callback) {
    return global.setTimeout(callback, 1000 / 60);
};

function Marker(opts) {
    this.city = opts.name;
    this.location = new AMap.LngLat(opts.lnglat[0], opts.lnglat[1]);
    this.color = opts.color;
    this.type = opts.type || 'circle';
    this.speed = opts.speed || 0.15;
    this.size = 0;
    this.max = opts.max || 20;
}

Marker.prototype.draw = function (context) {
    context.save();
    context.beginPath();
    switch (this.type) {
        case 'circle':
            this._drawCircle(context);
            break;
        case 'ellipse':
            this._drawEllipse(context);
            break;
        default:
            break;
    }
    context.closePath();
    context.restore();

    this.size += this.speed;
    if (this.size > this.max) {
        this.size = 0;
    }
};

Marker.prototype._drawCircle = function (context) {
    var pixel = this.pixel || map.lngLatToContainer(this.location);
    context.strokeStyle = this.color;
    context.moveTo(pixel.x + pixel.size, pixel.y);
    context.arc(pixel.x, pixel.y, this.size, 0, Math.PI * 2);
    context.stroke();
};

Marker.prototype._drawEllipse = function (context) {
    var pixel = this.pixel || map.lngLatToContainer(this.location);
    var x = pixel.x,
        y = pixel.y,
        w = this.size,
        h = this.size / 2,
        kappa = 0.5522848,

    // control point offset horizontal
    ox = w / 2 * kappa,

    // control point offset vertical
    oy = h / 2 * kappa,

    // x-start
    xs = x - w / 2,

    // y-start
    ys = y - h / 2,

    // x-end
    xe = x + w / 2,

    // y-end
    ye = y + h / 2;

    context.strokeStyle = this.color;
    context.moveTo(xs, y);
    context.bezierCurveTo(xs, y - oy, x - ox, ys, x, ys);
    context.bezierCurveTo(x + ox, ys, xe, y - oy, xe, y);
    context.bezierCurveTo(xe, y + oy, x + ox, ye, x, ye);
    context.bezierCurveTo(x - ox, ye, xs, y + oy, xs, y);
    context.stroke();
};

function FlashMarker(map, dataset) {
    var self = this;

    var animationLayer = null,
        width = map.getSize().width,
        height = map.getSize().height,
        animationFlag = true;
    var markers = this.markers = [];

    //上层canvas渲染，动画效果
    var render = function render() {
        var markers = self.markers;
        var animationCtx = animationLayer.canvas.getContext('2d');
        if (!animationCtx) {
            return;
        }

        if (!animationFlag) {
            animationCtx.clearRect(0, 0, width, height);
            return;
        }

        animationCtx.fillStyle = 'rgba(0,0,0,0.95)';
        var prev = animationCtx.globalCompositeOperation;
        animationCtx.globalCompositeOperation = 'destination-in';
        animationCtx.fillRect(0, 0, width, height);
        animationCtx.globalCompositeOperation = prev;

        for (var i = 0; i < markers.length; i++) {
            var marker = markers[i];
            marker.draw(animationCtx);
        }
    };

    //鼠标事件
    var mouseInteract = function mouseInteract() {
        map.on('movestart', function () {
            animationFlag = false;
        });

        map.on('moveend', function () {
            animationFlag = true;
            markers = []; //解决拖动后多余的小圆点bug，没想明白，暂时这样
        });

        map.on('zoomstart', function () {
            animationFlag = false;
        });

        map.on('zoomend', function () {
            animationFlag = true;
            markers = [];
        });
    };

    var addMarker = function addMarker() {
        var markers = self.markers;
        var dataset = self.dataset;
        dataset.forEach(function (item, i) {
            var newMarker = new Marker(item);
            markers.push(newMarker);
        });
    };

    //初始化
    var init = function init(map, dataset) {
        self.dataset = dataset;

        animationLayer = new CanvasLayer({
            map: map,
            update: render
        });

        mouseInteract();

        addMarker();

        (function drawFrame() {
            requestAnimationFrame(drawFrame);
            render();
        })();
    };

    init(map, dataset);
}

FlashMarker.prototype.update = function (dataset) {
    var self = this;
    self.markers = [];
    dataset.forEach(function (item, i) {
        var newMarker = new Marker(item);
        self.markers.push(newMarker);
    });
};

return FlashMarker;

})));
