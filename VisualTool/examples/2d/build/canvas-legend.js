(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.Legend = factory());
}(this, (function () { 'use strict';

/**
 * 新建canvas
 * 
 * @param {number} width 宽
 * @param {number} height 高
 */
function Canvas(width, height) {
    var canvas;
    if (typeof document === 'undefined') {
        // var Canvas = require('canvas');
        // canvas = new Canvas(width, height);
    } else {
        var canvas = document.createElement('canvas');
        if (width) {
            canvas.width = canvas.style.width = width;
        }
        if (height) {
            canvas.height = canvas.style.height = height;
        }
    }
    return canvas;
}

/**
 * 颜色工具类
 * @date 2017-06-28
 */
function ColorUtil() {
    this.startColor = '#ffffff';
    this.endColor = '#4CE35B';
    this.step = 5;
}

/**
 * @description 将rgb表示方式转换为hex表示方式("rgb(21,12,150)")或者（[21,12,150])
 * @param {string} 返回rgb颜色值 
 * @returns 返回hex颜色值
 */
ColorUtil.prototype.rgb2hex = function (rgb) {
    var _this = rgb;
    var strHex = "#";
    var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
    if (Object.prototype.toString.call(_this) === '[object Array]') {
        for (var i = 0; i < _this.length; i++) {
            var hex = Number(_this[i]).toString(16);
            hex = hex < 10 ? 0 + '' + hex : hex; // 保证每个rgb的值为2位
            if (hex === "0") {
                hex += hex;
            }
            strHex += hex;
        }
        if (strHex.length !== 7) {
            strHex = _this;
        }
        return strHex;
    } else if (/^(rgb|RGB)/.test(_this)) {
        var aColor = _this.replace(/(?:(|)|rgb|RGB)*/g, "").split(",");
        strHex = "#";
        for (var i = 0; i < aColor.length; i++) {
            var hex = Number(aColor[i]).toString(16);
            hex = hex < 10 ? 0 + '' + hex : hex; // 保证每个rgb的值为2位
            if (hex === "0") {
                hex += hex;
            }
            strHex += hex;
        }
        if (strHex.length !== 7) {
            strHex = _this;
        }
        return strHex;
    } else if (reg.test(_this)) {
        var aNum = _this.replace(/#/, "").split("");
        if (aNum.length === 6) {
            return _this;
        } else if (aNum.length === 3) {
            strHex = "#";
            for (var i = 0; i < aNum.length; i += 1) {
                numHex += aNum[i] + aNum[i];
            }
            return numHex;
        }
    } else {
        return _this;
    }
};

/**
 * @description 将hex表示方式转换为rgb表示方式(这里返回rgb数组模式)
 * @param {string} hex 颜色值
 * @returns 返回rgb数组模式
 */
ColorUtil.prototype.hex2rgb = function (hex) {
    var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
    var hex = hex.toLowerCase();
    if (hex && reg.test(hex)) {
        if (hex.length === 4) {
            var sColorNew = "#";
            for (var i = 1; i < 4; i += 1) {
                sColorNew += hex.slice(i, i + 1).concat(hex.slice(i, i + 1));
            }
            hex = sColorNew;
        }
        //处理六位的颜色值
        var sColorChange = [];
        for (var i = 1; i < 7; i += 2) {
            sColorChange.push(parseInt("0x" + hex.slice(i, i + 2)));
        }
        return sColorChange;
    } else {
        return hex;
    }
};

/**
 * @description 获取一组渐变色('#1abc9c','#333fff',5)
 * @param {string} startColor 起始颜色
 * @param {string} endColor   结束颜色
 * @param {number} step       分段数
 * @returns 返回渐变颜色数组
 */
ColorUtil.prototype.getGradientColor = function (startColor, endColor, step) {
    startColor = startColor || this.startColor;
    endColor = endColor || this.endColor;
    step = step || this.step;

    var startRGB = this.hex2rgb(startColor); //转换为rgb数组模式
    var startR = startRGB[0];
    var startG = startRGB[1];
    var startB = startRGB[2];

    var endRGB = this.hex2rgb(endColor);
    var endR = endRGB[0];
    var endG = endRGB[1];
    var endB = endRGB[2];

    var sR = (endR - startR) / step; //总差值
    var sG = (endG - startG) / step;
    var sB = (endB - startB) / step;

    var colorArr = [];
    for (var i = 0; i < step; i++) {
        //计算每一步的hex值
        var hex = this.rgb2hex([parseInt(sR * i + startR), parseInt(sG * i + startG), parseInt(sB * i + startB)]);
        colorArr.push(hex);
    }
    return colorArr;
};

/**
 * Tween.js - Licensed under the MIT license
 * https://github.com/tweenjs/tween.js
 * ----------------------------------------------
 *
 * See https://github.com/tweenjs/tween.js/graphs/contributors for the full list of contributors.
 * Thank you all, you're awesome!
 */

var TWEEN = TWEEN || function () {
    var _tweens = [];
    return {
        getAll: function getAll() {
            return _tweens;
        },
        removeAll: function removeAll() {
            _tweens = [];
        },
        add: function add(tween) {
            _tweens.push(tween);
        },
        remove: function remove(tween) {
            var i = _tweens.indexOf(tween);
            if (i !== -1) {
                _tweens.splice(i, 1);
            }
        },
        update: function update(time, preserve) {
            if (_tweens.length === 0) {
                return false;
            }
            var i = 0;
            time = time !== undefined ? time : TWEEN.now();
            while (i < _tweens.length) {
                if (_tweens[i].update(time) || preserve) {
                    i++;
                } else {
                    _tweens.splice(i, 1);
                }
            }
            return true;
        }
    };
}();

// Include a performance.now polyfill.
// In node.js, use process.hrtime.
if (typeof window === 'undefined' && typeof process !== 'undefined') {
    TWEEN.now = function () {
        var time = process.hrtime();

        // Convert [seconds, nanoseconds] to milliseconds.
        return time[0] * 1000 + time[1] / 1000000;
    };
}
// In a browser, use window.performance.now if it is available.
else if (typeof window !== 'undefined' && window.performance !== undefined && window.performance.now !== undefined) {
        // This must be bound, because directly assigning this function
        // leads to an invocation exception in Chrome.
        TWEEN.now = window.performance.now.bind(window.performance);
    }
    // Use Date.now if it is available.
    else if (Date.now !== undefined) {
            TWEEN.now = Date.now;
        }
        // Otherwise, use 'new Date().getTime()'.
        else {
                TWEEN.now = function () {
                    return new Date().getTime();
                };
            }

TWEEN.Tween = function (object) {
    var _object = object;
    var _valuesStart = {};
    var _valuesEnd = {};
    var _valuesStartRepeat = {};
    var _duration = 1000;
    var _repeat = 0;
    var _repeatDelayTime;
    var _yoyo = false;
    var _isPlaying = false;
    var _reversed = false;
    var _delayTime = 0;
    var _startTime = null;
    var _easingFunction = TWEEN.Easing.Linear.None;
    var _interpolationFunction = TWEEN.Interpolation.Linear;
    var _chainedTweens = [];
    var _onStartCallback = null;
    var _onStartCallbackFired = false;
    var _onUpdateCallback = null;
    var _onCompleteCallback = null;
    var _onStopCallback = null;

    this.to = function (properties, duration) {
        _valuesEnd = properties;
        if (duration !== undefined) {
            _duration = duration;
        }
        return this;
    };

    this.start = function (time) {
        TWEEN.add(this);

        _isPlaying = true;

        _onStartCallbackFired = false;

        _startTime = time !== undefined ? time : TWEEN.now();
        _startTime += _delayTime;

        for (var property in _valuesEnd) {

            // Check if an Array was provided as property value
            if (_valuesEnd[property] instanceof Array) {

                if (_valuesEnd[property].length === 0) {
                    continue;
                }

                // Create a local copy of the Array with the start value at the front
                _valuesEnd[property] = [_object[property]].concat(_valuesEnd[property]);
            }

            // If `to()` specifies a property that doesn't exist in the source object,
            // we should not set that property in the object
            if (_object[property] === undefined) {
                continue;
            }

            // Save the starting value.
            _valuesStart[property] = _object[property];

            if (_valuesStart[property] instanceof Array === false) {
                _valuesStart[property] *= 1.0; // Ensures we're using numbers, not strings
            }

            _valuesStartRepeat[property] = _valuesStart[property] || 0;
        }

        return this;
    };

    this.stop = function () {
        if (!_isPlaying) {
            return this;
        }

        TWEEN.remove(this);
        _isPlaying = false;

        if (_onStopCallback !== null) {
            _onStopCallback.call(_object, _object);
        }

        this.stopChainedTweens();
        return this;
    };

    this.end = function () {
        this.update(_startTime + _duration);
        return this;
    };

    this.stopChainedTweens = function () {
        for (var i = 0, numChainedTweens = _chainedTweens.length; i < numChainedTweens; i++) {
            _chainedTweens[i].stop();
        }
    };

    this.delay = function (amount) {
        _delayTime = amount;
        return this;
    };

    this.repeat = function (times) {
        _repeat = times;
        return this;
    };

    this.repeatDelay = function (amount) {
        _repeatDelayTime = amount;
        return this;
    };

    this.yoyo = function (yoyo) {
        _yoyo = yoyo;
        return this;
    };

    this.easing = function (easing) {
        _easingFunction = easing;
        return this;
    };

    this.interpolation = function (interpolation) {
        _interpolationFunction = interpolation;
        return this;
    };

    this.chain = function () {
        _chainedTweens = arguments;
        return this;
    };

    this.onStart = function (callback) {
        _onStartCallback = callback;
        return this;
    };

    this.onUpdate = function (callback) {
        _onUpdateCallback = callback;
        return this;
    };

    this.onComplete = function (callback) {
        _onCompleteCallback = callback;
        return this;
    };

    this.onStop = function (callback) {
        _onStopCallback = callback;
        return this;
    };

    this.update = function (time) {
        var property;
        var elapsed;
        var value;

        if (time < _startTime) {
            return true;
        }

        if (_onStartCallbackFired === false) {

            if (_onStartCallback !== null) {
                _onStartCallback.call(_object, _object);
            }

            _onStartCallbackFired = true;
        }

        elapsed = (time - _startTime) / _duration;
        elapsed = elapsed > 1 ? 1 : elapsed;

        value = _easingFunction(elapsed);

        for (property in _valuesEnd) {

            // Don't update properties that do not exist in the source object
            if (_valuesStart[property] === undefined) {
                continue;
            }

            var start = _valuesStart[property] || 0;
            var end = _valuesEnd[property];

            if (end instanceof Array) {

                _object[property] = _interpolationFunction(end, value);
            } else {

                // Parses relative end values with start as base (e.g.: +10, -3)
                if (typeof end === 'string') {

                    if (end.charAt(0) === '+' || end.charAt(0) === '-') {
                        end = start + parseFloat(end);
                    } else {
                        end = parseFloat(end);
                    }
                }

                // Protect against non numeric properties.
                if (typeof end === 'number') {
                    _object[property] = start + (end - start) * value;
                }
            }
        }

        if (_onUpdateCallback !== null) {
            _onUpdateCallback.call(_object, value);
        }

        if (elapsed === 1) {

            if (_repeat > 0) {

                if (isFinite(_repeat)) {
                    _repeat--;
                }

                // Reassign starting values, restart by making startTime = now
                for (property in _valuesStartRepeat) {

                    if (typeof _valuesEnd[property] === 'string') {
                        _valuesStartRepeat[property] = _valuesStartRepeat[property] + parseFloat(_valuesEnd[property]);
                    }

                    if (_yoyo) {
                        var tmp = _valuesStartRepeat[property];

                        _valuesStartRepeat[property] = _valuesEnd[property];
                        _valuesEnd[property] = tmp;
                    }

                    _valuesStart[property] = _valuesStartRepeat[property];
                }

                if (_yoyo) {
                    _reversed = !_reversed;
                }

                if (_repeatDelayTime !== undefined) {
                    _startTime = time + _repeatDelayTime;
                } else {
                    _startTime = time + _delayTime;
                }

                return true;
            } else {

                if (_onCompleteCallback !== null) {

                    _onCompleteCallback.call(_object, _object);
                }

                for (var i = 0, numChainedTweens = _chainedTweens.length; i < numChainedTweens; i++) {
                    // Make the chained tweens start exactly at the time they should,
                    // even if the `update()` method was called way past the duration of the tween
                    _chainedTweens[i].start(_startTime + _duration);
                }

                return false;
            }
        }

        return true;
    };
};

TWEEN.Easing = {
    Linear: {
        None: function None(k) {
            return k;
        }
    },
    Quadratic: {
        In: function In(k) {
            return k * k;
        },
        Out: function Out(k) {
            return k * (2 - k);
        },
        InOut: function InOut(k) {
            if ((k *= 2) < 1) {
                return 0.5 * k * k;
            }
            return -0.5 * (--k * (k - 2) - 1);
        }
    },
    Cubic: {
        In: function In(k) {
            return k * k * k;
        },
        Out: function Out(k) {
            return --k * k * k + 1;
        },
        InOut: function InOut(k) {
            if ((k *= 2) < 1) {
                return 0.5 * k * k * k;
            }
            return 0.5 * ((k -= 2) * k * k + 2);
        }
    },
    Quartic: {
        In: function In(k) {
            return k * k * k * k;
        },
        Out: function Out(k) {
            return 1 - --k * k * k * k;
        },
        InOut: function InOut(k) {
            if ((k *= 2) < 1) {
                return 0.5 * k * k * k * k;
            }
            return -0.5 * ((k -= 2) * k * k * k - 2);
        }
    },
    Quintic: {

        In: function In(k) {

            return k * k * k * k * k;
        },

        Out: function Out(k) {

            return --k * k * k * k * k + 1;
        },

        InOut: function InOut(k) {

            if ((k *= 2) < 1) {
                return 0.5 * k * k * k * k * k;
            }

            return 0.5 * ((k -= 2) * k * k * k * k + 2);
        }

    },
    Sinusoidal: {
        In: function In(k) {
            return 1 - Math.cos(k * Math.PI / 2);
        },
        Out: function Out(k) {
            return Math.sin(k * Math.PI / 2);
        },
        InOut: function InOut(k) {
            return 0.5 * (1 - Math.cos(Math.PI * k));
        }
    },
    Exponential: {
        In: function In(k) {
            return k === 0 ? 0 : Math.pow(1024, k - 1);
        },
        Out: function Out(k) {
            return k === 1 ? 1 : 1 - Math.pow(2, -10 * k);
        },
        InOut: function InOut(k) {
            if (k === 0) {
                return 0;
            }
            if (k === 1) {
                return 1;
            }
            if ((k *= 2) < 1) {
                return 0.5 * Math.pow(1024, k - 1);
            }
            return 0.5 * (-Math.pow(2, -10 * (k - 1)) + 2);
        }
    },
    Circular: {
        In: function In(k) {
            return 1 - Math.sqrt(1 - k * k);
        },
        Out: function Out(k) {
            return Math.sqrt(1 - --k * k);
        },
        InOut: function InOut(k) {
            if ((k *= 2) < 1) {
                return -0.5 * (Math.sqrt(1 - k * k) - 1);
            }
            return 0.5 * (Math.sqrt(1 - (k -= 2) * k) + 1);
        }
    },
    Elastic: {
        In: function In(k) {
            if (k === 0) {
                return 0;
            }
            if (k === 1) {
                return 1;
            }
            return -Math.pow(2, 10 * (k - 1)) * Math.sin((k - 1.1) * 5 * Math.PI);
        },
        Out: function Out(k) {
            if (k === 0) {
                return 0;
            }
            if (k === 1) {
                return 1;
            }
            return Math.pow(2, -10 * k) * Math.sin((k - 0.1) * 5 * Math.PI) + 1;
        },
        InOut: function InOut(k) {

            if (k === 0) {
                return 0;
            }

            if (k === 1) {
                return 1;
            }

            k *= 2;

            if (k < 1) {
                return -0.5 * Math.pow(2, 10 * (k - 1)) * Math.sin((k - 1.1) * 5 * Math.PI);
            }

            return 0.5 * Math.pow(2, -10 * (k - 1)) * Math.sin((k - 1.1) * 5 * Math.PI) + 1;
        }

    },
    Back: {
        In: function In(k) {
            var s = 1.70158;
            return k * k * ((s + 1) * k - s);
        },
        Out: function Out(k) {
            var s = 1.70158;
            return --k * k * ((s + 1) * k + s) + 1;
        },
        InOut: function InOut(k) {
            var s = 1.70158 * 1.525;
            if ((k *= 2) < 1) {
                return 0.5 * (k * k * ((s + 1) * k - s));
            }
            return 0.5 * ((k -= 2) * k * ((s + 1) * k + s) + 2);
        }
    },
    Bounce: {
        In: function In(k) {
            return 1 - TWEEN.Easing.Bounce.Out(1 - k);
        },
        Out: function Out(k) {
            if (k < 1 / 2.75) {
                return 7.5625 * k * k;
            } else if (k < 2 / 2.75) {
                return 7.5625 * (k -= 1.5 / 2.75) * k + 0.75;
            } else if (k < 2.5 / 2.75) {
                return 7.5625 * (k -= 2.25 / 2.75) * k + 0.9375;
            } else {
                return 7.5625 * (k -= 2.625 / 2.75) * k + 0.984375;
            }
        },
        InOut: function InOut(k) {
            if (k < 0.5) {
                return TWEEN.Easing.Bounce.In(k * 2) * 0.5;
            }
            return TWEEN.Easing.Bounce.Out(k * 2 - 1) * 0.5 + 0.5;
        }
    }
};

TWEEN.Interpolation = {
    Linear: function Linear(v, k) {
        var m = v.length - 1;
        var f = m * k;
        var i = Math.floor(f);
        var fn = TWEEN.Interpolation.Utils.Linear;

        if (k < 0) {
            return fn(v[0], v[1], f);
        }

        if (k > 1) {
            return fn(v[m], v[m - 1], m - f);
        }

        return fn(v[i], v[i + 1 > m ? m : i + 1], f - i);
    },
    Bezier: function Bezier(v, k) {
        var b = 0;
        var n = v.length - 1;
        var pw = Math.pow;
        var bn = TWEEN.Interpolation.Utils.Bernstein;

        for (var i = 0; i <= n; i++) {
            b += pw(1 - k, n - i) * pw(k, i) * v[i] * bn(n, i);
        }

        return b;
    },
    CatmullRom: function CatmullRom(v, k) {
        var m = v.length - 1;
        var f = m * k;
        var i = Math.floor(f);
        var fn = TWEEN.Interpolation.Utils.CatmullRom;

        if (v[0] === v[m]) {
            if (k < 0) {
                i = Math.floor(f = m * (1 + k));
            }
            return fn(v[(i - 1 + m) % m], v[i], v[(i + 1) % m], v[(i + 2) % m], f - i);
        } else {
            if (k < 0) {
                return v[0] - (fn(v[0], v[0], v[1], v[1], -f) - v[0]);
            }
            if (k > 1) {
                return v[m] - (fn(v[m], v[m], v[m - 1], v[m - 1], f - m) - v[m]);
            }
            return fn(v[i ? i - 1 : 0], v[i], v[m < i + 1 ? m : i + 1], v[m < i + 2 ? m : i + 2], f - i);
        }
    },
    Utils: {
        Linear: function Linear(p0, p1, t) {
            return (p1 - p0) * t + p0;
        },
        Bernstein: function Bernstein(n, i) {
            var fc = TWEEN.Interpolation.Utils.Factorial;
            return fc(n) / fc(i) / fc(n - i);
        },
        Factorial: function () {
            var a = [1];
            return function (n) {
                var s = 1;
                if (a[n]) {
                    return a[n];
                }
                for (var i = n; i > 1; i--) {
                    s *= i;
                }
                a[n] = s;
                return s;
            };
        }(),
        CatmullRom: function CatmullRom(p0, p1, p2, p3, t) {
            var v0 = (p2 - p0) * 0.5;
            var v1 = (p3 - p1) * 0.5;
            var t2 = t * t;
            var t3 = t * t2;

            return (2 * p1 - 2 * p2 + v0 + v1) * t3 + (-3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 + v0 * t + p1;
        }
    }
};

var Legend = function Legend(id, options) {
    var width = window.innerWidth,
        height = window.innerHeight,
        canvas = new Canvas(width, height),
        context = canvas.getContext('2d');

    document.getElementById(id).appendChild(canvas);
    var p = document.getElementById('process');
    var coords = {
        x: 0,
        y: 0
    };
    var tween = new TWEEN.Tween(coords).to({
        x: width,
        y: height
    }, 2000).easing(TWEEN.Easing.Quadratic.InOut).onUpdate(function () {
        p.style.width = this.y + 'px';
        console.log(this.x, this.y);
    }).start();

    requestAnimationFrame(animate);

    function animate(time) {
        requestAnimationFrame(animate);
        TWEEN.update(time);
    }

    function Rect(x, y, color, width, height) {
        this.x = x;
        this.y = y;
        this.width = width || 20;
        this.height = height || 10;
        this.color = color;
        this.cancle = false;

        this.clickEvent = this.clickEvent.bind(this);
        this.mousemoveEvent = this.mousemoveEvent.bind(this);
        this.bindEvent();
    }

    Rect.prototype.clickEvent = function (e) {
        if (e.x >= this.x && e.x <= this.x + this.width && e.y >= this.y && e.y <= this.y + this.height) {
            this.cancle ? this.reset() : this.update();
        }
    };

    Rect.prototype.mousemoveEvent = function (e) {
        if (e.x >= this.x && e.x <= this.x + this.width && e.y >= this.y && e.y <= this.y + this.height) {
            canvas.style.cursor = 'pointer';
        } else {
            canvas.style.cursor = 'default';
        }
    };

    Rect.prototype.bindEvent = function (e) {
        canvas.addEventListener('click', this.clickEvent);
        canvas.addEventListener('mousemove', this.mousemoveEvent);
    };

    Rect.prototype.update = function (e) {
        context.fillStyle = '#eee';
        context.fillRect(this.x, this.y, this.width, this.height);
        this.cancle = true;
    };

    Rect.prototype.reset = function (e) {
        context.fillStyle = this.color;
        context.fillRect(this.x, this.y, this.width, this.height);
        this.cancle = false;
    };

    var colorUtil = new ColorUtil();

    var colorArr = colorUtil.getGradientColor(options.startColor, options.endColor, options.step);

    //分段值域
    for (var i = 0, len = colorArr.length; i < len; i++) {
        var color = colorArr[i];
        var gap = 15;
        var rect = new Rect(width / 4, height / 4 + 15 * i, color);
        drawRect(rect);
    }

    //渐变色条
    var lineRect = new Rect(width / 2, height / 4, '#A6E32D', 20, 150);
    drawRect(lineRect);

    function drawRect(rect) {
        context.save();
        context.beginPath();
        context.fillStyle = rect.color;
        context.fillRect(rect.x, rect.y, rect.width, rect.height);
        context.closePath();
        context.restore();
    }
};

return Legend;

})));
