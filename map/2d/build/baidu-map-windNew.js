(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.Windy = factory());
}(this, (function () { 'use strict';

/**
 * @author https://github.com/chengquan223
 * @Date 2017-02-27
 * */
function CanvasLayer(options) {
    this.options = options || {};
    this.paneName = this.options.paneName || 'labelPane';
    this.zIndex = this.options.zIndex || 0;
    this._map = options.map;
    this._lastDrawTime = null;
    this.show();
}

CanvasLayer.prototype = new BMap.Overlay();

CanvasLayer.prototype.initialize = function (map) {
    this._map = map;
    var canvas = this.canvas = document.createElement('canvas');
    var ctx = this.ctx = this.canvas.getContext('2d');
    canvas.style.cssText = 'position:absolute;' + 'left:0;' + 'top:0;' + 'z-index:' + this.zIndex + ';';
    this.adjustSize();
    this.adjustRatio(ctx);
    map.getPanes()[this.paneName].appendChild(canvas);
    var that = this;
    map.addEventListener('resize', function () {
        that.adjustSize();
        that._draw();
    });
    return this.canvas;
};

CanvasLayer.prototype.adjustSize = function () {
    var size = this._map.getSize();
    var canvas = this.canvas;
    canvas.width = size.width;
    canvas.height = size.height;
    canvas.style.width = canvas.width + 'px';
    canvas.style.height = canvas.height + 'px';
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
    // console.log(ctx.canvas.height, canvasHeight);
    ctx.scale(pixelRatio, pixelRatio);
};

CanvasLayer.prototype.draw = function () {
    var self = this;
    var args = arguments;

    clearTimeout(self.timeoutID);
    self.timeoutID = setTimeout(function () {
        self._draw();
    }, 15);
};

CanvasLayer.prototype._draw = function () {
    var map = this._map;
    var size = map.getSize();
    var center = map.getCenter();
    if (center) {
        var pixel = map.pointToOverlayPixel(center);
        this.canvas.style.left = pixel.x - size.width / 2 + 'px';
        this.canvas.style.top = pixel.y - size.height / 2 + 'px';
        this.dispatchEvent('draw');
        this.options.update && this.options.update.call(this);
    }
};

CanvasLayer.prototype.getContainer = function () {
    return this.canvas;
};

CanvasLayer.prototype.show = function () {
    if (!this.canvas) {
        this._map.addOverlay(this);
    }
    this.canvas.style.display = 'block';
};

CanvasLayer.prototype.hide = function () {
    this.canvas.style.display = 'none';
    //this._map.removeOverlay(this);
};

CanvasLayer.prototype.setZIndex = function (zIndex) {
    this.canvas.style.zIndex = zIndex;
};

CanvasLayer.prototype.getZIndex = function () {
    return this.zIndex;
};

var tool = {
    merge: function merge(settings, defaults) {
        Object.keys(settings).forEach(function (key) {
            defaults[key] = settings[key];
        });
    },
    //计算两点间距离
    getDistance: function getDistance(p1, p2) {
        return Math.sqrt((p1[0] - p2[0]) * (p1[0] - p2[0]) + (p1[1] - p2[1]) * (p1[1] - p2[1]));
    }
};

var Windy = function Windy(map, userOptions) {
    var self = this;

    this.map = map;

    //默认参数
    var options = {
        MAX_PARTICLE_AGE: 100,
        FRAME_RATE: 20,
        PARTICLE_MULTIPLIER: 8,
        size: .8,
        color: 'rgba(71,160,233,0.8)'
    };

    //全局变量
    var animationLayer = null,
        width = map.getSize().width,
        height = map.getSize().height;

    self.map = map;
    //初始化
    self._init(userOptions, options);

    var canvasLayer = self.canvasLayer = new CanvasLayer({
        map: map,
        context: this.context,
        update: function update() {
            self._render();
        }
    });
    this.clickEvent = this.clickEvent.bind(this);
    this.mousemoveEvent = this.mousemoveEvent.bind(this);

    this.bindEvent();
};

Windy.prototype._init = function (settings, defaults) {
    var self = this;

    //合并参数
    tool.merge(settings, defaults);

    self.options = options;
};

Windy.prototype._render = function () {
    console.log('_render');
};

Windy.prototype.start = function () {};

Windy.prototype.stop = function () {};

Windy.prototype.update = function (resetOpts) {
    for (var key in resetOpts) {
        this.options[key] = resetOpts[key];
    }
};

Windy.prototype.clickEvent = function (e) {
    var pixel = e.pixel;
    this.options.methods.click(pixel, e);
};

Windy.prototype.mousemoveEvent = function (e) {
    var pixel = e.pixel;
    this.options.methods.mousemove(pixel, e);
};

Windy.prototype.bindEvent = function (e) {
    var self = this;
    var map = this.map;
    if (this.options.methods) {
        if (this.options.methods.click) {
            map.setDefaultCursor("default");
            map.addEventListener('click', this.clickEvent);
        }
        if (this.options.methods.mousemove) {
            map.addEventListener('mousemove', this.mousemoveEvent);
        }
    }
};

Windy.prototype.unbindEvent = function (e) {
    var map = this.map;
    if (this.options.methods) {
        if (this.options.methods.click) {
            map.removeEventListener('click', this.clickEvent);
        }
        if (this.options.methods.mousemove) {
            map.removeEventListener('mousemove', this.mousemoveEvent);
        }
    }
};

return Windy;

})));
