(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.Typhoon = factory());
}(this, (function () { 'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

// 用于处理merge时无法遍历Date等对象的问题
var BUILTIN_OBJECT = {
    '[object Function]': 1,
    '[object RegExp]': 1,
    '[object Date]': 1,
    '[object Error]': 1,
    '[object CanvasGradient]': 1,
    '[object CanvasPattern]': 1,
    // For node-canvas
    '[object Image]': 1,
    '[object Canvas]': 1
};

var TYPED_ARRAY = {
    '[object Int8Array]': 1,
    '[object Uint8Array]': 1,
    '[object Uint8ClampedArray]': 1,
    '[object Int16Array]': 1,
    '[object Uint16Array]': 1,
    '[object Int32Array]': 1,
    '[object Uint32Array]': 1,
    '[object Float32Array]': 1,
    '[object Float64Array]': 1
};

var objToString = Object.prototype.toString;

var arrayProto = Array.prototype;
var nativeForEach = arrayProto.forEach;
var nativeFilter = arrayProto.filter;
var nativeSlice = arrayProto.slice;
var nativeMap = arrayProto.map;
var nativeReduce = arrayProto.reduce;

/**
 * Those data types can be cloned:
 *     Plain object, Array, TypedArray, number, string, null, undefined.
 * Those data types will be assgined using the orginal data:
 *     BUILTIN_OBJECT
 * Instance of user defined class will be cloned to a plain object, without
 * properties in prototype.
 * Other data types is not supported (not sure what will happen).
 *
 * Caution: do not support clone Date, for performance consideration.
 * (There might be a large number of date in `series.data`).
 * So date should not be modified in and out of echarts.
 *
 * @param {*} source
 * @return {*} new
 */
function clone(source) {
    if (source == null || (typeof source === 'undefined' ? 'undefined' : _typeof(source)) != 'object') {
        return source;
    }

    var result = source;
    var typeStr = objToString.call(source);

    if (typeStr === '[object Array]') {
        result = [];
        for (var i = 0, len = source.length; i < len; i++) {
            result[i] = clone(source[i]);
        }
    } else if (TYPED_ARRAY[typeStr]) {
        result = source.constructor.from(source);
    } else if (!BUILTIN_OBJECT[typeStr] && !isPrimitive(source) && !isDom(source)) {
        result = {};
        for (var key in source) {
            if (source.hasOwnProperty(key)) {
                result[key] = clone(source[key]);
            }
        }
    }

    return result;
}

/**
 * @memberOf module:zrender/core/util
 * @param {*} target
 * @param {*} source
 * @param {boolean} [overwrite=false]
 */
function merge(target, source, overwrite) {
    // We should escapse that source is string
    // and enter for ... in ...
    if (!isObject(source) || !isObject(target)) {
        return overwrite ? clone(source) : target;
    }

    for (var key in source) {
        if (source.hasOwnProperty(key)) {
            var targetProp = target[key];
            var sourceProp = source[key];

            if (isObject(sourceProp) && isObject(targetProp) && !isArray(sourceProp) && !isArray(targetProp) && !isDom(sourceProp) && !isDom(targetProp) && !isBuiltInObject(sourceProp) && !isBuiltInObject(targetProp) && !isPrimitive(sourceProp) && !isPrimitive(targetProp)) {
                // 如果需要递归覆盖，就递归调用merge
                merge(targetProp, sourceProp, overwrite);
            } else if (overwrite || !(key in target)) {
                // 否则只处理overwrite为true，或者在目标对象中没有此属性的情况
                // NOTE，在 target[key] 不存在的时候也是直接覆盖
                target[key] = clone(source[key], true);
            }
        }
    }

    return target;
}

/**
 * @param {Array} targetAndSources The first item is target, and the rests are source.
 * @param {boolean} [overwrite=false]
 * @return {*} target
 */
function mergeAll(targetAndSources, overwrite) {
    var result = targetAndSources[0];
    for (var i = 1, len = targetAndSources.length; i < len; i++) {
        result = merge(result, targetAndSources[i], overwrite);
    }
    return result;
}

/**
 * @param {*} target
 * @param {*} source
 * @memberOf module:zrender/core/util
 */
function extend(target, source) {
    for (var key in source) {
        if (source.hasOwnProperty(key)) {
            target[key] = source[key];
        }
    }
    return target;
}

/**
 * @param {*} target
 * @param {*} source
 * @param {boolean} [overlay=false]
 * @memberOf module:zrender/core/util
 */
function defaults(target, source, overlay) {
    for (var key in source) {
        if (source.hasOwnProperty(key) && (overlay ? source[key] != null : target[key] == null)) {
            target[key] = source[key];
        }
    }
    return target;
}

function createCanvas() {
    return document.createElement('canvas');
}
// FIXME
var _ctx;

function getContext() {
    if (!_ctx) {
        // Use util.createCanvas instead of createCanvas
        // because createCanvas may be overwritten in different environment
        _ctx = util.createCanvas().getContext('2d');
    }
    return _ctx;
}

/**
 * 查询数组中元素的index
 * @memberOf module:zrender/core/util
 */
function indexOf(array, value) {
    if (array) {
        if (array.indexOf) {
            return array.indexOf(value);
        }
        for (var i = 0, len = array.length; i < len; i++) {
            if (array[i] === value) {
                return i;
            }
        }
    }
    return -1;
}

/**
 * 构造类继承关系
 *
 * @memberOf module:zrender/core/util
 * @param {Function} clazz 源类
 * @param {Function} baseClazz 基类
 */
function inherits(clazz, baseClazz) {
    var clazzPrototype = clazz.prototype;

    function F() {}
    F.prototype = baseClazz.prototype;
    clazz.prototype = new F();

    for (var prop in clazzPrototype) {
        clazz.prototype[prop] = clazzPrototype[prop];
    }
    clazz.prototype.constructor = clazz;
    clazz.superClass = baseClazz;
}

/**
 * @memberOf module:zrender/core/util
 * @param {Object|Function} target
 * @param {Object|Function} sorce
 * @param {boolean} overlay
 */
function mixin(target, source, overlay) {
    target = 'prototype' in target ? target.prototype : target;
    source = 'prototype' in source ? source.prototype : source;

    defaults(target, source, overlay);
}

/**
 * Consider typed array.
 * @param {Array|TypedArray} data
 */
function isArrayLike(data) {
    if (!data) {
        return;
    }
    if (typeof data == 'string') {
        return false;
    }
    return typeof data.length == 'number';
}

/**
 * 数组或对象遍历
 * @memberOf module:zrender/core/util
 * @param {Object|Array} obj
 * @param {Function} cb
 * @param {*} [context]
 */
function each(obj, cb, context) {
    if (!(obj && cb)) {
        return;
    }
    if (obj.forEach && obj.forEach === nativeForEach) {
        obj.forEach(cb, context);
    } else if (obj.length === +obj.length) {
        for (var i = 0, len = obj.length; i < len; i++) {
            cb.call(context, obj[i], i, obj);
        }
    } else {
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                cb.call(context, obj[key], key, obj);
            }
        }
    }
}

/**
 * 数组映射
 * @memberOf module:zrender/core/util
 * @param {Array} obj
 * @param {Function} cb
 * @param {*} [context]
 * @return {Array}
 */
function map(obj, cb, context) {
    if (!(obj && cb)) {
        return;
    }
    if (obj.map && obj.map === nativeMap) {
        return obj.map(cb, context);
    } else {
        var result = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            result.push(cb.call(context, obj[i], i, obj));
        }
        return result;
    }
}

/**
 * @memberOf module:zrender/core/util
 * @param {Array} obj
 * @param {Function} cb
 * @param {Object} [memo]
 * @param {*} [context]
 * @return {Array}
 */
function reduce(obj, cb, memo, context) {
    if (!(obj && cb)) {
        return;
    }
    if (obj.reduce && obj.reduce === nativeReduce) {
        return obj.reduce(cb, memo, context);
    } else {
        for (var i = 0, len = obj.length; i < len; i++) {
            memo = cb.call(context, memo, obj[i], i, obj);
        }
        return memo;
    }
}

/**
 * 数组过滤
 * @memberOf module:zrender/core/util
 * @param {Array} obj
 * @param {Function} cb
 * @param {*} [context]
 * @return {Array}
 */
function filter(obj, cb, context) {
    if (!(obj && cb)) {
        return;
    }
    if (obj.filter && obj.filter === nativeFilter) {
        return obj.filter(cb, context);
    } else {
        var result = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            if (cb.call(context, obj[i], i, obj)) {
                result.push(obj[i]);
            }
        }
        return result;
    }
}

/**
 * 数组项查找
 * @memberOf module:zrender/core/util
 * @param {Array} obj
 * @param {Function} cb
 * @param {*} [context]
 * @return {Array}
 */
function find(obj, cb, context) {
    if (!(obj && cb)) {
        return;
    }
    for (var i = 0, len = obj.length; i < len; i++) {
        if (cb.call(context, obj[i], i, obj)) {
            return obj[i];
        }
    }
}

/**
 * @memberOf module:zrender/core/util
 * @param {Function} func
 * @param {*} context
 * @return {Function}
 */
function bind(func, context) {
    var args = nativeSlice.call(arguments, 2);
    return function () {
        return func.apply(context, args.concat(nativeSlice.call(arguments)));
    };
}

/**
 * @memberOf module:zrender/core/util
 * @param {Function} func
 * @return {Function}
 */
function curry(func) {
    var args = nativeSlice.call(arguments, 1);
    return function () {
        return func.apply(this, args.concat(nativeSlice.call(arguments)));
    };
}

/**
 * @memberOf module:zrender/core/util
 * @param {*} value
 * @return {boolean}
 */
function isArray(value) {
    return objToString.call(value) === '[object Array]';
}

/**
 * @memberOf module:zrender/core/util
 * @param {*} value
 * @return {boolean}
 */
function isFunction(value) {
    return typeof value === 'function';
}

/**
 * @memberOf module:zrender/core/util
 * @param {*} value
 * @return {boolean}
 */
function isString(value) {
    return objToString.call(value) === '[object String]';
}

/**
 * @memberOf module:zrender/core/util
 * @param {*} value
 * @return {boolean}
 */
function isObject(value) {
    // Avoid a V8 JIT bug in Chrome 19-20.
    // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
    var type = typeof value === 'undefined' ? 'undefined' : _typeof(value);
    return type === 'function' || !!value && type == 'object';
}

/**
 * @memberOf module:zrender/core/util
 * @param {*} value
 * @return {boolean}
 */
function isBuiltInObject(value) {
    return !!BUILTIN_OBJECT[objToString.call(value)];
}

/**
 * @memberOf module:zrender/core/util
 * @param {*} value
 * @return {boolean}
 */
function isDom(value) {
    return (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object' && typeof value.nodeType === 'number' && _typeof(value.ownerDocument) === 'object';
}

/**
 * Whether is exactly NaN. Notice isNaN('a') returns true.
 * @param {*} value
 * @return {boolean}
 */
function eqNaN(value) {
    return value !== value;
}

/**
 * If value1 is not null, then return value1, otherwise judget rest of values.
 * @memberOf module:zrender/core/util
 * @return {*} Final value
 */
function retrieve(values) {
    for (var i = 0, len = arguments.length; i < len; i++) {
        if (arguments[i] != null) {
            return arguments[i];
        }
    }
}

/**
 * @memberOf module:zrender/core/util
 * @param {Array} arr
 * @param {number} startIndex
 * @param {number} endIndex
 * @return {Array}
 */
function slice() {
    return Function.call.apply(nativeSlice, arguments);
}

/**
 * @memberOf module:zrender/core/util
 * @param {boolean} condition
 * @param {string} message
 */
function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

var primitiveKey = '__ec_primitive__';
/**
 * Set an object as primitive to be ignored traversing children in clone or merge
 */
function setAsPrimitive(obj) {
    obj[primitiveKey] = true;
}

function isPrimitive(obj) {
    return obj[primitiveKey];
}

/**
 * @constructor
 * @param {Object} obj Only apply `ownProperty`.
 */
function HashMap(obj) {
    obj && each(obj, function (value, key) {
        this.set(key, value);
    }, this);
}

// Add prefix to avoid conflict with Object.prototype.
var HASH_MAP_PREFIX = '_ec_';
var HASH_MAP_PREFIX_LENGTH = 4;

HashMap.prototype = {
    constructor: HashMap,
    // Do not provide `has` method to avoid defining what is `has`.
    // (We usually treat `null` and `undefined` as the same, different
    // from ES6 Map).
    get: function get(key) {
        return this[HASH_MAP_PREFIX + key];
    },
    set: function set(key, value) {
        this[HASH_MAP_PREFIX + key] = value;
        // Comparing with invocation chaining, `return value` is more commonly
        // used in this case: `var someVal = map.set('a', genVal());`
        return value;
    },
    // Although util.each can be performed on this hashMap directly, user
    // should not use the exposed keys, who are prefixed.
    each: function each(cb, context) {
        context !== void 0 && (cb = bind(cb, context));
        for (var prefixedKey in this) {
            this.hasOwnProperty(prefixedKey) && cb(this[prefixedKey], prefixedKey.slice(HASH_MAP_PREFIX_LENGTH));
        }
    },
    // Do not use this method if performance sensitive.
    removeKey: function removeKey(key) {
        delete this[key];
    }
};

function createHashMap(obj) {
    return new HashMap(obj);
}

var util = {
    inherits: inherits,
    mixin: mixin,
    clone: clone,
    merge: merge,
    mergeAll: mergeAll,
    extend: extend,
    defaults: defaults,
    getContext: getContext,
    createCanvas: createCanvas,
    indexOf: indexOf,
    slice: slice,
    find: find,
    isArrayLike: isArrayLike,
    each: each,
    map: map,
    reduce: reduce,
    filter: filter,
    bind: bind,
    curry: curry,
    isArray: isArray,
    isString: isString,
    isObject: isObject,
    isFunction: isFunction,
    isBuiltInObject: isBuiltInObject,
    isDom: isDom,
    eqNaN: eqNaN,
    retrieve: retrieve,
    assert: assert,
    setAsPrimitive: setAsPrimitive,
    createHashMap: createHashMap,
    noop: function noop() {}
};

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

var Typhoon = function Typhoon(map, userOptions) {
    var self = this;

    //默认参数
    var options = {
        //marker点半径
        markerRadius: 4,
        //marker点颜色,为空或null则默认取线条颜色
        markerColor: '#555',
        //线条宽度
        lineWidth: 1,
        //线条类型 solid、dashed、dotted
        lineType: 'solid',
        //线条颜色
        lineStyle: '#0076c9',
        //台风图片
        imgurl: 'images/typhoon.png'
    };

    //全局变量
    var baseLayer = null,
        animationLayer = null,
        width = map.getSize().width,
        height = map.getSize().height;

    //参数合并
    util.merge(options, userOptions, true);

    self.options = options;
    //初始化
    self.init = function () {
        self.setDataSet();

        baseLayer = new CanvasLayer({
            map: map,
            update: self.render
        });
    };
    //底层canvas渲染
    self.render = function () {
        var baseCtx = baseLayer.canvas.getContext('2d');
        if (!baseCtx) {
            return;
        }
        baseCtx.clearRect(0, 0, width, height);
        var dataSet = self.options.data;
    };
    self.draw = function () {};
    //数据源转换
    self.setDataSet = function () {
        var img = this.img = new Image();
        img.src = this.imgurl;
        var dataSet = this.dataSet = [];
        var opts = self.options;
        opts.data.forEach(function (value) {
            var typhoonEye = new TyphoonEye(value);
            typhoonEye.setLevelInfo(value.tlevel, opts.splitData);
            dataSet.push(typhoonEye);
        });
    };

    function TyphoonEye(opts) {
        this.id = opts.id; //台风编号
        this.lon = opts.lon;
        this.lat = opts.lat;
        this.pubTime = opts.pubTime; //发布时间
        this.airPress = opts.airPress; //气压
        this.speed = opts.speed; //最大风速
        this.radius6 = opts.radius6; //六级半径
        this.radius7 = opts.radius7; //七级半径
        this.radius8 = opts.radius8; //八级半径
        this.radius10 = opts.radius10; //十级半径
        this.radius12 = opts.radius12; //十二级半径
    }

    TyphoonEye.prototype.setLevelInfo = function (name, splitData) {
        for (var i = 0; i < splitData.length; i++) {
            var split = splitData[i];
            if (split.name === name) {
                this.level = split.level;
                this.power = split.power;
                this.color = split.color;
                return;
            }
        }
    };
    //各级风力半径
    TyphoonEye.prototype.getRadiusList = function (zoom) {
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
    //台风经过的点
    TyphoonEye.prototype.drawSymbol = function (ctx, x, y) {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.strokeStyle = options.markerColor;
        ctx.lineWidth = .3;
        ctx.arc(x, y, options.markerRadius, 0, Math.PI * 2);
        ctx.fil();
        ctx.stroke();
        ctx.closePath();
    };
    //台风轨迹线
    TyphoonEye.prototype.drawTrackLine = function (ctx, x1, y1, x2, y2) {
        context.lineWidth = options.lineWidth;
        context.strokeStyle = options.lineStyle;
        context.beginPath();
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
        context.stroke();
        context.closePath();
    };
    //台风影响区域圆
    TyphoonEye.prototype.drawCircle = function (ctx, x, y, r, i) {
        context.beginPath();
        context.fillStyle = 'rgba(255,172,5,' + 0.3 + 0.15 * i + ')';
        context.strokeStyle = 'rgba(255,172,5,.8)';
        context.lineWidth = 1;
        context.arc(x, y, r, 0, Math.PI * 2);
        context.fill();
        context.stroke();
        context.closePath();
    };
    //台风图标
    Typhoon.prototype.drawImage = function (ctx, img, x, y) {
        img.addEventListener("load", function () {
            ctx.drawImage(img, x - 15, y - 15, 30, 30);
        });
        if (img.complete) {
            ctx.drawImage(img, x - 15, y - 15, 30, 30);
        }
    };

    self.init();
};

Typhoon.prototype.update = function () {};

return Typhoon;

})));
