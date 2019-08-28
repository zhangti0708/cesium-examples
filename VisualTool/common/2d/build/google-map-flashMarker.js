(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.FlashMarker = factory());
}(this, (function () { 'use strict';

function CanvasLayer(opt_options) {
    this.isAdded_ = false;
    this.isAnimated_ = false;
    this.paneName_ = CanvasLayer.DEFAULT_PANE_NAME_;
    this.updateHandler_ = null;
    this.resizeHandler_ = null;
    this.topLeft_ = null;
    this.centerListener_ = null;
    this.resizeListener_ = null;
    this.needsResize_ = true;
    this.requestAnimationFrameId_ = null;

    var canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = 0;
    canvas.style.left = 0;
    canvas.style.pointerEvents = 'none';
    this.canvas = canvas;
    this.canvasCssWidth_ = 300;
    this.canvasCssHeight_ = 150;
    this.resolutionScale_ = 1;

    function simpleBindShim(thisArg, func) {
        return function () {
            func.apply(thisArg);
        };
    }
    this.repositionFunction_ = simpleBindShim(this, this.repositionCanvas_);
    this.resizeFunction_ = simpleBindShim(this, this.resize_);
    this.requestUpdateFunction_ = simpleBindShim(this, this.update_);

    if (opt_options) {
        this.setOptions(opt_options);
    }
}

var global = typeof window === 'undefined' ? {} : window;

if (global.google && global.google.maps) {
    CanvasLayer.prototype = new google.maps.OverlayView();
    CanvasLayer.DEFAULT_PANE_NAME_ = 'overlayLayer';
    CanvasLayer.CSS_TRANSFORM_ = function () {
        var div = document.createElement('div');
        var transformProps = ['transform', 'WebkitTransform', 'MozTransform', 'OTransform', 'msTransform'];
        for (var i = 0; i < transformProps.length; i++) {
            var prop = transformProps[i];
            if (div.style[prop] !== undefined) {
                return prop;
            }
        }
        return transformProps[0];
    }();
    CanvasLayer.prototype.requestAnimFrame_ = global.requestAnimationFrame || global.webkitRequestAnimationFrame || global.mozRequestAnimationFrame || global.oRequestAnimationFrame || global.msRequestAnimationFrame || function (callback) {
        return global.setTimeout(callback, 1000 / 60);
    };
    CanvasLayer.prototype.cancelAnimFrame_ = global.cancelAnimationFrame || global.webkitCancelAnimationFrame || global.mozCancelAnimationFrame || global.oCancelAnimationFrame || global.msCancelAnimationFrame || function (requestId) {};

    CanvasLayer.prototype.setOptions = function (options) {
        if (options.animate !== undefined) {
            this.setAnimate(options.animate);
        }

        if (options.paneName !== undefined) {
            this.setPaneName(options.paneName);
        }

        if (options.updateHandler !== undefined) {
            this.setUpdateHandler(options.updateHandler);
        }

        if (options.resizeHandler !== undefined) {
            this.setResizeHandler(options.resizeHandler);
        }

        if (options.resolutionScale !== undefined) {
            this.setResolutionScale(options.resolutionScale);
        }

        if (options.map !== undefined) {
            this.setMap(options.map);
        }
    };
    CanvasLayer.prototype.setAnimate = function (animate) {
        this.isAnimated_ = !!animate;

        if (this.isAnimated_) {
            this.scheduleUpdate();
        }
    };
    CanvasLayer.prototype.isAnimated = function () {
        return this.isAnimated_;
    };
    CanvasLayer.prototype.setPaneName = function (paneName) {
        this.paneName_ = paneName;

        this.setPane_();
    };
    CanvasLayer.prototype.getPaneName = function () {
        return this.paneName_;
    };
    CanvasLayer.prototype.setPane_ = function () {
        if (!this.isAdded_) {
            return;
        }

        // onAdd has been called, so panes can be used
        var panes = this.getPanes();
        if (!panes[this.paneName_]) {
            throw new Error('"' + this.paneName_ + '" is not a valid MapPane name.');
        }

        panes[this.paneName_].appendChild(this.canvas);
    };
    CanvasLayer.prototype.setResizeHandler = function (opt_resizeHandler) {
        this.resizeHandler_ = opt_resizeHandler;
    };
    CanvasLayer.prototype.setResolutionScale = function (scale) {
        if (typeof scale === 'number') {
            this.resolutionScale_ = scale;
            this.resize_();
        }
    };
    CanvasLayer.prototype.setUpdateHandler = function (opt_updateHandler) {
        this.updateHandler_ = opt_updateHandler;
    };
    CanvasLayer.prototype.onAdd = function () {
        if (this.isAdded_) {
            return;
        }

        this.isAdded_ = true;
        this.setPane_();

        this.resizeListener_ = google.maps.event.addListener(this.getMap(), 'resize', this.resizeFunction_);
        this.centerListener_ = google.maps.event.addListener(this.getMap(), 'center_changed', this.repositionFunction_);

        this.resize_();
        this.repositionCanvas_();
    };
    CanvasLayer.prototype.onRemove = function () {
        if (!this.isAdded_) {
            return;
        }

        this.isAdded_ = false;
        this.topLeft_ = null;

        // remove canvas and listeners for pan and resize from map
        this.canvas.parentElement.removeChild(this.canvas);
        if (this.centerListener_) {
            google.maps.event.removeListener(this.centerListener_);
            this.centerListener_ = null;
        }
        if (this.resizeListener_) {
            google.maps.event.removeListener(this.resizeListener_);
            this.resizeListener_ = null;
        }

        // cease canvas update callbacks
        if (this.requestAnimationFrameId_) {
            this.cancelAnimFrame_.call(global, this.requestAnimationFrameId_);
            this.requestAnimationFrameId_ = null;
        }
    };
    CanvasLayer.prototype.resize_ = function () {
        if (!this.isAdded_) {
            return;
        }

        var map = this.getMap();
        var mapWidth = map.getDiv().offsetWidth;
        var mapHeight = map.getDiv().offsetHeight;

        var newWidth = mapWidth * this.resolutionScale_;
        var newHeight = mapHeight * this.resolutionScale_;
        var oldWidth = this.canvas.width;
        var oldHeight = this.canvas.height;

        // resizing may allocate a new back buffer, so do so conservatively
        if (oldWidth !== newWidth || oldHeight !== newHeight) {
            this.canvas.width = newWidth;
            this.canvas.height = newHeight;

            this.needsResize_ = true;
            this.scheduleUpdate();
        }

        // reset styling if new sizes don't match; resize of data not needed
        if (this.canvasCssWidth_ !== mapWidth || this.canvasCssHeight_ !== mapHeight) {
            this.canvasCssWidth_ = mapWidth;
            this.canvasCssHeight_ = mapHeight;
            this.canvas.style.width = mapWidth + 'px';
            this.canvas.style.height = mapHeight + 'px';
        }
    };
    CanvasLayer.prototype.draw = function () {
        this.repositionCanvas_();
    };
    CanvasLayer.prototype.repositionCanvas_ = function () {
        var map = this.getMap();

        // topLeft can't be calculated from map.getBounds(), because bounds are
        // clamped to -180 and 180 when completely zoomed out. Instead, calculate
        // left as an offset from the center, which is an unwrapped LatLng.
        var top = map.getBounds().getNorthEast().lat();
        var center = map.getCenter();
        var scale = Math.pow(2, map.getZoom());
        var left = center.lng() - this.canvasCssWidth_ * 180 / (256 * scale);
        this.topLeft_ = new google.maps.LatLng(top, left);

        // Canvas position relative to draggable map's container depends on
        // overlayView's projection, not the map's. Have to use the center of the
        // map for this, not the top left, for the same reason as above.
        var projection = this.getProjection();
        var divCenter = projection.fromLatLngToDivPixel(center);
        var offsetX = -Math.round(this.canvasCssWidth_ / 2 - divCenter.x);
        var offsetY = -Math.round(this.canvasCssHeight_ / 2 - divCenter.y);
        this.canvas.style[CanvasLayer.CSS_TRANSFORM_] = 'translate(' + offsetX + 'px,' + offsetY + 'px)';

        this.scheduleUpdate();
    };
    CanvasLayer.prototype.update_ = function () {
        this.requestAnimationFrameId_ = null;

        if (!this.isAdded_) {
            return;
        }

        if (this.isAnimated_) {
            this.scheduleUpdate();
        }

        if (this.needsResize_ && this.resizeHandler_) {
            this.needsResize_ = false;
            this.resizeHandler_();
        }

        if (this.updateHandler_) {
            this.updateHandler_();
        }
    };
    CanvasLayer.prototype.getTopLeft = function () {
        return this.topLeft_;
    };
    CanvasLayer.prototype.scheduleUpdate = function () {
        if (this.isAdded_ && !this.requestAnimationFrameId_) {
            this.requestAnimationFrameId_ = this.requestAnimFrame_.call(global, this.requestUpdateFunction_);
        }
    };
}

function Marker(opts) {
    this.city = opts.name;
    this.location = new google.maps.LatLng(opts.lnglat[1], opts.lnglat[0]);
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
    var mapProjection = map.getProjection();
    var pixel = this.pixel || mapProjection.fromLatLngToPoint(this.location);
    context.strokeStyle = this.color;
    context.moveTo(pixel.x + pixel.size, pixel.y);
    context.arc(pixel.x, pixel.y, this.size, 0, Math.PI * 2);
    context.stroke();
};

Marker.prototype._drawEllipse = function (context) {
    var mapProjection = map.getProjection();
    var pixel = this.pixel || mapProjection.fromLatLngToPoint(this.location);
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

function FlashMarker(map, dataSet) {
    var animationLayer = null,
        animationFlag = true,
        markers = [];

    var addMarker = function addMarker() {
        if (markers.length > 0) return;
        markers = [];
        for (var i = 0; i < dataSet.length; i++) {
            markers.push(new Marker(dataSet[i]));
        }
    };

    //上层canvas渲染，动画效果
    var render = function render() {
        var animationCtx = animationLayer.canvas.getContext('2d');
        if (!animationCtx) {
            return;
        }

        if (!animationFlag) {
            animationCtx.clearRect(0, 0, animationCtx.canvas.width, animationCtx.canvas.height);
            return;
        }

        addMarker();

        animationCtx.fillStyle = 'rgba(0,0,0,.95)';
        var prev = animationCtx.globalCompositeOperation;
        animationCtx.globalCompositeOperation = 'destination-in';
        animationCtx.fillRect(0, 0, animationCtx.canvas.width, animationCtx.canvas.height);
        animationCtx.globalCompositeOperation = prev;

        for (var i = 0; i < markers.length; i++) {
            var marker = markers[i];
            marker.draw(animationCtx);
        }
    };

    //初始化
    var init = function init() {
        animationLayer = new CanvasLayer({
            map: map,
            updateHandler: render
        });

        // mouseInteract();

        (function drawFrame() {
            requestAnimationFrame(drawFrame);
            render();
        })();
    };

    init();
}

return FlashMarker;

})));
