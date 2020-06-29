/*!
 * author: FDD <smileFDD@gmail.com> 
 * ol-plot v2.1.3
 * build-time: 2018-3-27 21:54
 * LICENSE: MIT
 * (c) 2016-2018 https://sakitam-fdd.github.io/ol-plot
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('openlayers')) :
	typeof define === 'function' && define.amd ? define(['openlayers'], factory) :
	(global.olPlot = factory(global.ol));
}(this, (function (ol) { 'use strict';

ol = ol && ol.hasOwnProperty('default') ? ol['default'] : ol;

const Observable = function () {
  this.Events = {};
  this.__cnt = 0;
};

Observable.hasOwnKey = Function.call.bind(Object.hasOwnProperty);

Observable.slice = Function.call.bind(Array.prototype.slice);

/**
 * 事件分发
 * @param eventName
 * @param callback
 * @param context
 * @returns {(*|*)[]}
 */
Observable.prototype.on = function (eventName, callback, context) {
  return (this.bindEvent(eventName, callback, 0, context))
};

/**
 * 取消监听
 * @param event
 * @returns {boolean}
 */
Observable.prototype.un = function (event) {
  var eventName = '';
  var key = '';
  var r = false;
  var type = typeof event;
  var that = this;
  if (type === 'string') {
    if (Observable.hasOwnKey(this.Events, event)) {
      delete this.Events[event];
      return true
    }
    return false
  } else if (type === 'object') {
    eventName = event[0];
    key = event[1];
    if (Observable.hasOwnKey(this.Events, eventName) && Observable.hasOwnKey(this.Events[eventName], key)) {
      delete this.Events[eventName][key];
      return true
    }
    return false
  } else if (type === 'function') {
    that.eachEvent(that.Events, function (keyA, itemA) {
      that.eachEvent(itemA, function (keyB, itemB) {
        if (itemB[0] === event) {
          delete that.Events[keyA][keyB];
          r = true;
        }
      });
    });
    return r
  }
  return true
};

/**
 * 事件监听（只触发一次）
 * @param eventName
 * @param callback
 * @param context
 * @returns {(*|*)[]}
 */
Observable.prototype.once = function (eventName, callback, context) {
  return (this.bindEvent(eventName, callback, 1, context))
};

/**
 * 响应事件
 * @param eventName
 * @param args
 */
Observable.prototype.action = function (eventName, args) {
  if (Observable.hasOwnKey(this.Events, eventName)) {
    this.eachEvent(this.Events[eventName], function (key, item) {
      item[0].apply(item[2], args);
      if (item[1]) {
        delete this.Events[eventName][key];
      }
    });
  }
};

/**
 * 实时触发响应
 * @param eventName
 */
Observable.prototype.dispatch = function (eventName) {
  var that = this;
  var args = Observable.slice(arguments, 1);
  setTimeout(function () {
    that.action(eventName, args);
  });
};

/**
 * 延后触发响应
 * @param eventName
 */
Observable.prototype.dispatchSync = function (eventName) {
  this.action(eventName, Observable.slice(arguments, 1));
};

/**
 * 清空发布中心
 */
Observable.prototype.clear = function () {
  this.Events = {};
};

/**
 * 绑定事件
 * @param eventName
 * @param callback
 * @param isOne
 * @param context
 * @returns {[*,*]}
 */
Observable.prototype.bindEvent = function (eventName, callback, isOne, context) {
  if (typeof eventName !== 'string' || typeof callback !== 'function') {
    throw new Error('传入的事件名称和回调函数有误！')
  }
  if (!Observable.hasOwnKey(this.Events, eventName)) {
    this.Events[eventName] = {};
  }
  this.Events[eventName][++this.__cnt] = [callback, isOne, context];
  return [eventName, this.__cnt]
};

/**
 * 循环触发事件
 * @param obj
 * @param callback
 */
Observable.prototype.eachEvent = function (obj, callback) {
  for (var key in obj) {
    if (Observable.hasOwnKey(obj, key)) {
      callback(key, obj[key]);
    }
  }
};

var FITTING_COUNT = 100;
var HALF_PI = Math.PI / 2;
var ZERO_TOLERANCE = 0.0001;
var TWO_PI = Math.PI * 2;
var BASE_LAYERNAME = 'ol-plot-vector-layer';
var BASE_HELP_CONTROL_POINT_ID = 'plot-helper-control-point-div';
var BASE_HELP_HIDDEN = 'plot-helper-hidden-div';
var DEF_TEXT_STYEL = {
  borderRadius: '2px',
  fontSize: '12px',
  outline: 0,
  overflow: 'hidden',
  boxSizing: 'border-box',
  border: '1px solid #eeeeee',
  fontFamily: 'Helvetica Neue,Helvetica,PingFang SC,Hiragino Sans GB,Microsoft YaHei,Noto Sans CJK SC,WenQuanYi Micro Hei,Arial,sans-serif',
  color: '#010500',
  fontWeight: 400,
  padding: '3px',
  fontStretch: 'normal',
  lineHeight: 'normal',
  textAlign: 'left',
  marginLeft: 'auto',
  marginRight: 'auto',
  width: 'auto',
  height: 'auto',
  background: 'rgb(255, 255, 255)',
  fontStyle: '',
  fontVariant: ''
};

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};











var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};











var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};











var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

var MathDistance = function MathDistance(pnt1, pnt2) {
  return Math.sqrt(Math.pow(pnt1[0] - pnt2[0], 2) + Math.pow(pnt1[1] - pnt2[1], 2));
};

var wholeDistance = function wholeDistance(points) {
  var distance = 0;
  if (points && Array.isArray(points) && points.length > 0) {
    points.forEach(function (item, index) {
      if (index < points.length - 1) {
        distance += MathDistance(item, points[index + 1]);
      }
    });
  }
  return distance;
};

var getBaseLength = function getBaseLength(points) {
  return Math.pow(wholeDistance(points), 0.99);
};

var Mid = function Mid(point1, point2) {
  return [(point1[0] + point2[0]) / 2, (point1[1] + point2[1]) / 2];
};

var getCircleCenterOfThreePoints = function getCircleCenterOfThreePoints(point1, point2, point3) {
  var pntA = [(point1[0] + point2[0]) / 2, (point1[1] + point2[1]) / 2];
  var pntB = [pntA[0] - point1[1] + point2[1], pntA[1] + point1[0] - point2[0]];
  var pntC = [(point1[0] + point3[0]) / 2, (point1[1] + point3[1]) / 2];
  var pntD = [pntC[0] - point1[1] + point3[1], pntC[1] + point1[0] - point3[0]];
  return getIntersectPoint(pntA, pntB, pntC, pntD);
};

var getIntersectPoint = function getIntersectPoint(pntA, pntB, pntC, pntD) {
  if (pntA[1] === pntB[1]) {
    var _f = (pntD[0] - pntC[0]) / (pntD[1] - pntC[1]);
    var _x = _f * (pntA[1] - pntC[1]) + pntC[0];
    var _y = pntA[1];
    return [_x, _y];
  }
  if (pntC[1] === pntD[1]) {
    var _e = (pntB[0] - pntA[0]) / (pntB[1] - pntA[1]);
    var _x2 = _e * (pntC[1] - pntA[1]) + pntA[0];
    var _y2 = pntC[1];
    return [_x2, _y2];
  }
  var e = (pntB[0] - pntA[0]) / (pntB[1] - pntA[1]);
  var f = (pntD[0] - pntC[0]) / (pntD[1] - pntC[1]);
  var y = (e * pntA[1] - pntA[0] - f * pntC[1] + pntC[0]) / (e - f);
  var x = e * y - e * pntA[1] + pntA[0];
  return [x, y];
};

var getAzimuth = function getAzimuth(startPoint, endPoint) {
  var azimuth = void 0;
  var angle = Math.asin(Math.abs(endPoint[1] - startPoint[1]) / MathDistance(startPoint, endPoint));
  if (endPoint[1] >= startPoint[1] && endPoint[0] >= startPoint[0]) {
    azimuth = angle + Math.PI;
  } else if (endPoint[1] >= startPoint[1] && endPoint[0] < startPoint[0]) {
    azimuth = Math.PI * 2 - angle;
  } else if (endPoint[1] < startPoint[1] && endPoint[0] < startPoint[0]) {
    azimuth = angle;
  } else if (endPoint[1] < startPoint[1] && endPoint[0] >= startPoint[0]) {
    azimuth = Math.PI - angle;
  }
  return azimuth;
};

var getAngleOfThreePoints = function getAngleOfThreePoints(pntA, pntB, pntC) {
  var angle = getAzimuth(pntB, pntA) - getAzimuth(pntB, pntC);
  return angle < 0 ? angle + Math.PI * 2 : angle;
};

var isClockWise = function isClockWise(pnt1, pnt2, pnt3) {
  return (pnt3[1] - pnt1[1]) * (pnt2[0] - pnt1[0]) > (pnt2[1] - pnt1[1]) * (pnt3[0] - pnt1[0]);
};



var getCubicValue = function getCubicValue(t, startPnt, cPnt1, cPnt2, endPnt) {
  t = Math.max(Math.min(t, 1), 0);
  var tp = 1 - t,
      t2 = t * t;

  var t3 = t2 * t;
  var tp2 = tp * tp;
  var tp3 = tp2 * tp;
  var x = tp3 * startPnt[0] + 3 * tp2 * t * cPnt1[0] + 3 * tp * t2 * cPnt2[0] + t3 * endPnt[0];
  var y = tp3 * startPnt[1] + 3 * tp2 * t * cPnt1[1] + 3 * tp * t2 * cPnt2[1] + t3 * endPnt[1];
  return [x, y];
};

var getThirdPoint = function getThirdPoint(startPnt, endPnt, angle, distance, clockWise) {
  var azimuth = getAzimuth(startPnt, endPnt);
  var alpha = clockWise ? azimuth + angle : azimuth - angle;
  var dx = distance * Math.cos(alpha);
  var dy = distance * Math.sin(alpha);
  return [endPnt[0] + dx, endPnt[1] + dy];
};



var getArcPoints = function getArcPoints(center, radius, startAngle, endAngle) {
  var x = null,
      y = null,
      pnts = [],
      angleDiff = endAngle - startAngle;

  angleDiff = angleDiff < 0 ? angleDiff + Math.PI * 2 : angleDiff;
  for (var i = 0; i <= 100; i++) {
    var angle = startAngle + angleDiff * i / 100;
    x = center[0] + radius * Math.cos(angle);
    y = center[1] + radius * Math.sin(angle);
    pnts.push([x, y]);
  }
  return pnts;
};

var getBisectorNormals = function getBisectorNormals(t, pnt1, pnt2, pnt3) {
  var normal = getNormal(pnt1, pnt2, pnt3);
  var bisectorNormalRight = null,
      bisectorNormalLeft = null,
      dt = null,
      x = null,
      y = null;

  var dist = Math.sqrt(normal[0] * normal[0] + normal[1] * normal[1]);
  var uX = normal[0] / dist;
  var uY = normal[1] / dist;
  var d1 = MathDistance(pnt1, pnt2);
  var d2 = MathDistance(pnt2, pnt3);
  if (dist > ZERO_TOLERANCE) {
    if (isClockWise(pnt1, pnt2, pnt3)) {
      dt = t * d1;
      x = pnt2[0] - dt * uY;
      y = pnt2[1] + dt * uX;
      bisectorNormalRight = [x, y];
      dt = t * d2;
      x = pnt2[0] + dt * uY;
      y = pnt2[1] - dt * uX;
      bisectorNormalLeft = [x, y];
    } else {
      dt = t * d1;
      x = pnt2[0] + dt * uY;
      y = pnt2[1] - dt * uX;
      bisectorNormalRight = [x, y];
      dt = t * d2;
      x = pnt2[0] - dt * uY;
      y = pnt2[1] + dt * uX;
      bisectorNormalLeft = [x, y];
    }
  } else {
    x = pnt2[0] + t * (pnt1[0] - pnt2[0]);
    y = pnt2[1] + t * (pnt1[1] - pnt2[1]);
    bisectorNormalRight = [x, y];
    x = pnt2[0] + t * (pnt3[0] - pnt2[0]);
    y = pnt2[1] + t * (pnt3[1] - pnt2[1]);
    bisectorNormalLeft = [x, y];
  }
  return [bisectorNormalRight, bisectorNormalLeft];
};

var getNormal = function getNormal(pnt1, pnt2, pnt3) {
  var dX1 = pnt1[0] - pnt2[0];
  var dY1 = pnt1[1] - pnt2[1];
  var d1 = Math.sqrt(dX1 * dX1 + dY1 * dY1);
  dX1 /= d1;
  dY1 /= d1;
  var dX2 = pnt3[0] - pnt2[0];
  var dY2 = pnt3[1] - pnt2[1];
  var d2 = Math.sqrt(dX2 * dX2 + dY2 * dY2);
  dX2 /= d2;
  dY2 /= d2;
  var uX = dX1 + dX2;
  var uY = dY1 + dY2;
  return [uX, uY];
};

var getLeftMostControlPoint = function getLeftMostControlPoint(controlPoints, t) {
  var _ref = [controlPoints[0], controlPoints[1], controlPoints[2], null, null],
      pnt1 = _ref[0],
      pnt2 = _ref[1],
      pnt3 = _ref[2],
      controlX = _ref[3],
      controlY = _ref[4];

  var pnts = getBisectorNormals(0, pnt1, pnt2, pnt3);
  var normalRight = pnts[0];
  var normal = getNormal(pnt1, pnt2, pnt3);
  var dist = Math.sqrt(normal[0] * normal[0] + normal[1] * normal[1]);
  if (dist > ZERO_TOLERANCE) {
    var mid = Mid(pnt1, pnt2);
    var pX = pnt1[0] - mid[0];
    var pY = pnt1[1] - mid[1];
    var d1 = MathDistance(pnt1, pnt2);
    var n = 2.0 / d1;
    var nX = -n * pY;
    var nY = n * pX;
    var a11 = nX * nX - nY * nY;
    var a12 = 2 * nX * nY;
    var a22 = nY * nY - nX * nX;
    var dX = normalRight[0] - mid[0];
    var dY = normalRight[1] - mid[1];
    controlX = mid[0] + a11 * dX + a12 * dY;
    controlY = mid[1] + a12 * dX + a22 * dY;
  } else {
    controlX = pnt1[0] + t * (pnt2[0] - pnt1[0]);
    controlY = pnt1[1] + t * (pnt2[1] - pnt1[1]);
  }
  return [controlX, controlY];
};

var getRightMostControlPoint = function getRightMostControlPoint(controlPoints, t) {
  var count = controlPoints.length;
  var pnt1 = controlPoints[count - 3];
  var pnt2 = controlPoints[count - 2];
  var pnt3 = controlPoints[count - 1];
  var pnts = getBisectorNormals(0, pnt1, pnt2, pnt3);
  var normalLeft = pnts[1];
  var normal = getNormal(pnt1, pnt2, pnt3);
  var dist = Math.sqrt(normal[0] * normal[0] + normal[1] * normal[1]);
  var controlX = null,
      controlY = null;

  if (dist > ZERO_TOLERANCE) {
    var mid = Mid(pnt2, pnt3);
    var pX = pnt3[0] - mid[0];
    var pY = pnt3[1] - mid[1];
    var d1 = MathDistance(pnt2, pnt3);
    var n = 2.0 / d1;
    var nX = -n * pY;
    var nY = n * pX;
    var a11 = nX * nX - nY * nY;
    var a12 = 2 * nX * nY;
    var a22 = nY * nY - nX * nX;
    var dX = normalLeft[0] - mid[0];
    var dY = normalLeft[1] - mid[1];
    controlX = mid[0] + a11 * dX + a12 * dY;
    controlY = mid[1] + a12 * dX + a22 * dY;
  } else {
    controlX = pnt3[0] + t * (pnt2[0] - pnt3[0]);
    controlY = pnt3[1] + t * (pnt2[1] - pnt3[1]);
  }
  return [controlX, controlY];
};

var getCurvePoints = function getCurvePoints(t, controlPoints) {
  var leftControl = getLeftMostControlPoint(controlPoints, t);
  var pnt1 = null,
      pnt2 = null,
      pnt3 = null,
      normals = [leftControl],
      points = [];

  for (var i = 0; i < controlPoints.length - 2; i++) {
    var _ref2 = [controlPoints[i], controlPoints[i + 1], controlPoints[i + 2]];
    pnt1 = _ref2[0];
    pnt2 = _ref2[1];
    pnt3 = _ref2[2];

    var normalPoints = getBisectorNormals(t, pnt1, pnt2, pnt3);
    normals = normals.concat(normalPoints);
  }
  var rightControl = getRightMostControlPoint(controlPoints, t);
  if (rightControl) {
    normals.push(rightControl);
  }
  for (var _i = 0; _i < controlPoints.length - 1; _i++) {
    pnt1 = controlPoints[_i];
    pnt2 = controlPoints[_i + 1];
    points.push(pnt1);
    for (var _t = 0; _t < FITTING_COUNT; _t++) {
      var pnt = getCubicValue(_t / FITTING_COUNT, pnt1, normals[_i * 2], normals[_i * 2 + 1], pnt2);
      points.push(pnt);
    }
    points.push(pnt2);
  }
  return points;
};

var getBezierPoints = function getBezierPoints(points) {
  if (points.length <= 2) {
    return points;
  } else {
    var bezierPoints = [];
    var n = points.length - 1;
    for (var t = 0; t <= 1; t += 0.01) {
      var x = 0,
          y = 0;

      for (var index = 0; index <= n; index++) {
        var factor = getBinomialFactor(n, index);
        var a = Math.pow(t, index);
        var b = Math.pow(1 - t, n - index);
        x += factor * a * b * points[index][0];
        y += factor * a * b * points[index][1];
      }
      bezierPoints.push([x, y]);
    }
    bezierPoints.push(points[n]);
    return bezierPoints;
  }
};

var getFactorial = function getFactorial(n) {
  var result = 1;
  switch (n) {
    case n <= 1:
      result = 1;
      break;
    case n === 2:
      result = 2;
      break;
    case n === 3:
      result = 6;
      break;
    case n === 24:
      result = 24;
      break;
    case n === 5:
      result = 120;
      break;
    default:
      for (var i = 1; i <= n; i++) {
        result *= i;
      }
      break;
  }
  return result;
};

var getBinomialFactor = function getBinomialFactor(n, index) {
  return getFactorial(n) / (getFactorial(index) * getFactorial(n - index));
};

var getQBSplinePoints = function getQBSplinePoints(points) {
  if (points.length <= 2) {
    return points;
  } else {
    var n = 2,
        bSplinePoints = [];

    var m = points.length - n - 1;
    bSplinePoints.push(points[0]);
    for (var i = 0; i <= m; i++) {
      for (var t = 0; t <= 1; t += 0.05) {
        var x = 0,
            y = 0;

        for (var k = 0; k <= n; k++) {
          var factor = getQuadricBSplineFactor(k, t);
          x += factor * points[i + k][0];
          y += factor * points[i + k][1];
        }
        bSplinePoints.push([x, y]);
      }
    }
    bSplinePoints.push(points[points.length - 1]);
    return bSplinePoints;
  }
};

var getQuadricBSplineFactor = function getQuadricBSplineFactor(k, t) {
  var res = 0;
  if (k === 0) {
    res = Math.pow(t - 1, 2) / 2;
  } else if (k === 1) {
    res = (-2 * Math.pow(t, 2) + 2 * t + 1) / 2;
  } else if (k === 2) {
    res = Math.pow(t, 2) / 2;
  }
  return res;
};

var getuuid = function getuuid() {
  var s = [],
      hexDigits = '0123456789abcdef';

  for (var i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  s[14] = '4';
  s[19] = hexDigits.substr(s[19] & 0x3 | 0x8, 1);
  s[8] = s[13] = s[18] = s[23] = '-';
  return s.join('');
};







var isObject = function isObject(value) {
  var type = typeof value === 'undefined' ? 'undefined' : _typeof(value);
  return value !== null && (type === 'object' || type === 'function');
};

var merge = function merge(a, b) {
  for (var key in b) {
    if (isObject(b[key]) && isObject(a[key])) {
      merge(a[key], b[key]);
    } else {
      a[key] = b[key];
    }
  }
  return a;
};

var $Group = ol.layer.Group;
var $VectorLayer = ol.layer.Vector;
var $VectorSource = ol.source.Vector;
var $Style = ol.style.Style;
var $Stroke = ol.style.Stroke;
var $Circle = ol.style.Circle;
var $Fill = ol.style.Fill;

var getLayerByLayerName = function getLayerByLayerName(map, layerName) {
  try {
    var targetLayer = null;
    if (map) {
      var layers = map.getLayers().getArray();
      targetLayer = getLayerInternal(layers, 'layerName', layerName);
    }
    return targetLayer;
  } catch (e) {
    console.log(e);
  }
};

var getLayerInternal = function getLayerInternal(layers, key, value) {
  var _target = null;
  if (layers.length > 0) {
    layers.every(function (layer) {
      if (layer instanceof $Group) {
        var _layers = layer.getLayers().getArray();
        _target = getLayerInternal(_layers, key, value);
        if (_target) {
          return false;
        } else {
          return true;
        }
      } else if (layer.get(key) === value) {
        _target = layer;
        return false;
      } else {
        return true;
      }
    });
  }
  return _target;
};

var createVectorLayer = function createVectorLayer(map, layerName, params) {
  try {
    if (map) {
      var vectorLayer = getLayerByLayerName(map, layerName);
      if (!(vectorLayer instanceof $VectorLayer)) {
        vectorLayer = null;
      }
      if (!vectorLayer) {
        if (params && params.create) {
          vectorLayer = new $VectorLayer({
            layerName: layerName,
            params: params,
            layerType: 'vector',
            source: new $VectorSource({
              wrapX: false
            }),
            style: new $Style({
              fill: new $Fill({
                color: 'rgba(67, 110, 238, 0.4)'
              }),
              stroke: new $Stroke({
                color: '#4781d9',
                width: 2
              }),
              image: new $Circle({
                radius: 7,
                fill: new $Fill({
                  color: '#ffcc33'
                })
              })
            })
          });
        }
      }
      if (map && vectorLayer) {
        if (params && params.hasOwnProperty('selectable')) {
          vectorLayer.set('selectable', params.selectable);
        }

        var _vectorLayer = getLayerByLayerName(map, layerName);
        if (!_vectorLayer || !(_vectorLayer instanceof $VectorLayer)) {
          map.addLayer(vectorLayer);
        }
      }
      return vectorLayer;
    }
  } catch (e) {
    console.log(e);
  }
};

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};





function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var autosize = createCommonjsModule(function (module, exports) {
/*!
	autosize 4.0.1
	license: MIT
	http://www.jacklmoore.com/autosize
*/
(function (global, factory) {
	if (typeof undefined === "function" && undefined.amd) {
		undefined(['module', 'exports'], factory);
	} else {
		factory(module, exports);
	}
})(commonjsGlobal, function (module, exports) {
	var map = typeof Map === "function" ? new Map() : function () {
		var keys = [];
		var values = [];

		return {
			has: function has(key) {
				return keys.indexOf(key) > -1;
			},
			get: function get(key) {
				return values[keys.indexOf(key)];
			},
			set: function set(key, value) {
				if (keys.indexOf(key) === -1) {
					keys.push(key);
					values.push(value);
				}
			},
			delete: function _delete(key) {
				var index = keys.indexOf(key);
				if (index > -1) {
					keys.splice(index, 1);
					values.splice(index, 1);
				}
			}
		};
	}();

	var createEvent = function createEvent(name) {
		return new Event(name, { bubbles: true });
	};
	try {
		new Event('test');
	} catch (e) {
		// IE does not support `new Event()`
		createEvent = function createEvent(name) {
			var evt = document.createEvent('Event');
			evt.initEvent(name, true, false);
			return evt;
		};
	}

	function assign(ta) {
		if (!ta || !ta.nodeName || ta.nodeName !== 'TEXTAREA' || map.has(ta)) return;

		var heightOffset = null;
		var clientWidth = null;
		var cachedHeight = null;

		function init() {
			var style = window.getComputedStyle(ta, null);

			if (style.resize === 'vertical') {
				ta.style.resize = 'none';
			} else if (style.resize === 'both') {
				ta.style.resize = 'horizontal';
			}

			if (style.boxSizing === 'content-box') {
				heightOffset = -(parseFloat(style.paddingTop) + parseFloat(style.paddingBottom));
			} else {
				heightOffset = parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
			}
			// Fix when a textarea is not on document body and heightOffset is Not a Number
			if (isNaN(heightOffset)) {
				heightOffset = 0;
			}

			update();
		}

		function changeOverflow(value) {
			{
				// Chrome/Safari-specific fix:
				// When the textarea y-overflow is hidden, Chrome/Safari do not reflow the text to account for the space
				// made available by removing the scrollbar. The following forces the necessary text reflow.
				var width = ta.style.width;
				ta.style.width = '0px';
				// Force reflow:
				/* jshint ignore:start */
				ta.offsetWidth;
				/* jshint ignore:end */
				ta.style.width = width;
			}

			ta.style.overflowY = value;
		}

		function getParentOverflows(el) {
			var arr = [];

			while (el && el.parentNode && el.parentNode instanceof Element) {
				if (el.parentNode.scrollTop) {
					arr.push({
						node: el.parentNode,
						scrollTop: el.parentNode.scrollTop
					});
				}
				el = el.parentNode;
			}

			return arr;
		}

		function resize() {
			if (ta.scrollHeight === 0) {
				// If the scrollHeight is 0, then the element probably has display:none or is detached from the DOM.
				return;
			}

			var overflows = getParentOverflows(ta);
			var docTop = document.documentElement && document.documentElement.scrollTop; // Needed for Mobile IE (ticket #240)

			ta.style.height = '';
			ta.style.height = ta.scrollHeight + heightOffset + 'px';

			// used to check if an update is actually necessary on window.resize
			clientWidth = ta.clientWidth;

			// prevents scroll-position jumping
			overflows.forEach(function (el) {
				el.node.scrollTop = el.scrollTop;
			});

			if (docTop) {
				document.documentElement.scrollTop = docTop;
			}
		}

		function update() {
			resize();

			var styleHeight = Math.round(parseFloat(ta.style.height));
			var computed = window.getComputedStyle(ta, null);

			// Using offsetHeight as a replacement for computed.height in IE, because IE does not account use of border-box
			var actualHeight = computed.boxSizing === 'content-box' ? Math.round(parseFloat(computed.height)) : ta.offsetHeight;

			// The actual height not matching the style height (set via the resize method) indicates that 
			// the max-height has been exceeded, in which case the overflow should be allowed.
			if (actualHeight !== styleHeight) {
				if (computed.overflowY === 'hidden') {
					changeOverflow('scroll');
					resize();
					actualHeight = computed.boxSizing === 'content-box' ? Math.round(parseFloat(window.getComputedStyle(ta, null).height)) : ta.offsetHeight;
				}
			} else {
				// Normally keep overflow set to hidden, to avoid flash of scrollbar as the textarea expands.
				if (computed.overflowY !== 'hidden') {
					changeOverflow('hidden');
					resize();
					actualHeight = computed.boxSizing === 'content-box' ? Math.round(parseFloat(window.getComputedStyle(ta, null).height)) : ta.offsetHeight;
				}
			}

			if (cachedHeight !== actualHeight) {
				cachedHeight = actualHeight;
				var evt = createEvent('autosize:resized');
				try {
					ta.dispatchEvent(evt);
				} catch (err) {
					// Firefox will throw an error on dispatchEvent for a detached element
					// https://bugzilla.mozilla.org/show_bug.cgi?id=889376
				}
			}
		}

		var pageResize = function pageResize() {
			if (ta.clientWidth !== clientWidth) {
				update();
			}
		};

		var destroy = function (style) {
			window.removeEventListener('resize', pageResize, false);
			ta.removeEventListener('input', update, false);
			ta.removeEventListener('keyup', update, false);
			ta.removeEventListener('autosize:destroy', destroy, false);
			ta.removeEventListener('autosize:update', update, false);

			Object.keys(style).forEach(function (key) {
				ta.style[key] = style[key];
			});

			map.delete(ta);
		}.bind(ta, {
			height: ta.style.height,
			resize: ta.style.resize,
			overflowY: ta.style.overflowY,
			overflowX: ta.style.overflowX,
			wordWrap: ta.style.wordWrap
		});

		ta.addEventListener('autosize:destroy', destroy, false);

		// IE9 does not fire onpropertychange or oninput for deletions,
		// so binding to onkeyup to catch most of those events.
		// There is no way that I know of to detect something like 'cut' in IE9.
		if ('onpropertychange' in ta && 'oninput' in ta) {
			ta.addEventListener('keyup', update, false);
		}

		window.addEventListener('resize', pageResize, false);
		ta.addEventListener('input', update, false);
		ta.addEventListener('autosize:update', update, false);
		ta.style.overflowX = 'hidden';
		ta.style.wordWrap = 'break-word';

		map.set(ta, {
			destroy: destroy,
			update: update
		});

		init();
	}

	function destroy(ta) {
		var methods = map.get(ta);
		if (methods) {
			methods.destroy();
		}
	}

	function update(ta) {
		var methods = map.get(ta);
		if (methods) {
			methods.update();
		}
	}

	var autosize = null;

	// Do nothing in Node.js environment and IE8 (or lower)
	if (typeof window === 'undefined' || typeof window.getComputedStyle !== 'function') {
		autosize = function autosize(el) {
			return el;
		};
		autosize.destroy = function (el) {
			return el;
		};
		autosize.update = function (el) {
			return el;
		};
	} else {
		autosize = function autosize(el, options) {
			if (el) {
				Array.prototype.forEach.call(el.length ? el : [el], function (x) {
					return assign(x, options);
				});
			}
			return el;
		};
		autosize.destroy = function (el) {
			if (el) {
				Array.prototype.forEach.call(el.length ? el : [el], destroy);
			}
			return el;
		};
		autosize.update = function (el) {
			if (el) {
				Array.prototype.forEach.call(el.length ? el : [el], update);
			}
			return el;
		};
	}

	exports.default = autosize;
	module.exports = exports['default'];
});
});

var SPECIAL_CHARS_REGEXP = /([\:\-\_]+(.))/g;
var MOZ_HACK_REGEXP = /^moz([A-Z])/;

var create = function create(tagName, className, container, id) {
  var el = document.createElement(tagName);
  el.className = className || '';
  if (id) {
    el.id = id;
  }
  if (container) {
    container.appendChild(el);
  }
  return el;
};

var getElement = function getElement(id) {
  return typeof id === 'string' ? document.getElementById(id) : id;
};

var remove = function remove(el) {
  var parent = el.parentNode;
  if (parent) {
    parent.removeChild(el);
  }
};



var createHidden = function createHidden(tagName, parent, id) {
  var element = document.createElement(tagName);
  element.style.display = 'none';
  if (id) {
    element.id = id;
  }
  if (parent) {
    parent.appendChild(element);
  }
  return element;
};

var camelCase = function camelCase(name) {
  return name.replace(SPECIAL_CHARS_REGEXP, function (_, separator, letter, offset) {
    return offset ? letter.toUpperCase() : letter;
  }).replace(MOZ_HACK_REGEXP, 'Moz$1');
};

var on = function () {
  if (document.addEventListener) {
    return function (element, event, handler) {
      if (element && event && handler) {
        element.addEventListener(event, handler, false);
      }
    };
  }
}();

var off = function () {
  if (document.removeEventListener) {
    return function (element, event, handler) {
      if (element && event) {
        element.removeEventListener(event, handler, false);
      }
    };
  }
}();



function hasClass(el, cls) {
  if (!el || !cls) return false;
  if (cls.indexOf(' ') !== -1) throw new Error('className should not contain space.');
  if (el.classList) {
    return el.classList.contains(cls);
  } else {
    return (' ' + el.className + ' ').indexOf(' ' + cls + ' ') > -1;
  }
}





function getStyle(element, styleName) {
  if (!element || !styleName) return null;
  styleName = camelCase(styleName);
  if (styleName === 'float') {
    styleName = 'cssFloat';
  }
  try {
    var computed = document.defaultView.getComputedStyle(element, '');
    return element.style[styleName] || computed ? computed[styleName] : null;
  } catch (e) {
    return element.style[styleName];
  }
}

function setStyle(element, styleName, value) {
  if (!element || !styleName) return;
  if ((typeof styleName === 'undefined' ? 'undefined' : _typeof(styleName)) === 'object') {
    for (var prop in styleName) {
      if (styleName.hasOwnProperty(prop)) {
        setStyle(element, prop, styleName[prop]);
      }
    }
  } else {
    styleName = camelCase(styleName);
    if (styleName === 'opacity') {
      element.style.filter = isNaN(value) ? '' : 'alpha(opacity=' + value * 100 + ')';
    } else {
      element.style[styleName] = value;
    }
  }
}

var $DragPan = ol.interaction.DragPan;

var PlotTextBox = function (_ol$Overlay) {
  inherits(PlotTextBox, _ol$Overlay);

  function PlotTextBox() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    classCallCheck(this, PlotTextBox);
    var _ref = [options['id'], options['element'], options['offset'], options['stopEvent'], options['positioning'], options['insertFirst'], options['autoPan'], options['autoPanAnimation'], options['autoPanMargin'], options['className'] ? options['className'] : 'ol-plot-text-editor'],
        id = _ref[0],
        element = _ref[1],
        offset = _ref[2],
        stopEvent = _ref[3],
        positioning = _ref[4],
        insertFirst = _ref[5],
        autoPan = _ref[6],
        autoPanAnimation = _ref[7],
        autoPanMargin = _ref[8],
        className = _ref[9];

    var _this = possibleConstructorReturn(this, _ol$Overlay.call(this, {
      id: id,
      element: element,
      stopEvent: stopEvent,
      insertFirst: insertFirst,
      autoPan: autoPan,
      autoPanAnimation: autoPanAnimation,
      autoPanMargin: autoPanMargin,
      className: className
    }));

    _this.setOffset(offset !== undefined ? offset : [0, 0]);
    _this.setPositioning(positioning !== undefined ? positioning : 'center-center');

    _this.mapDragPan = undefined;

    _this.isClick_ = false;

    _this.dragging_ = false;

    _this.isFocus_ = false;

    _this.options_ = options;

    _this._position = options['position'] && options['position'].length > 0 ? options['position'] : [];

    _this.handleTimer_ = null;

    _this.currentPixel_ = [];

    _this.createTextContent(options);
    return _this;
  }

  PlotTextBox.prototype.createTextContent = function createTextContent(options) {
    var _className = options.className || 'ol-plot-text-editor';
    var content = document.createElement('textarea');
    content.className = _className;
    content.style.width = options['width'] + 'px';
    content.style.height = options['height'] + 'px';
    content.style.minHeight = options['minHeight'] + 'px';
    content.setAttribute('id', options['id']);
    content.setAttribute('autofocus', true);
    autosize(content);
    on(content, 'focus', this.handleFocus_.bind(this));
    on(content, 'blur', this.handleBlur_.bind(this));
    on(content, 'click', this.handleClick_.bind(this));
    on(content, 'mousedown', this.handleDragStart_.bind(this));
    on(window, 'mouseup', this.handleDragEnd_.bind(this));
    this.set('isPlotText', true);
    this.setElement(content);
    this.createCloseButton(options);
    this.createResizeButton(options);
    this.setPosition(this._position);
    this.dispatchEvent('textBoxDrawEnd', {
      overlay: this,
      element: content,
      uuid: options['id']
    });
  };

  PlotTextBox.prototype.getTextAreaFromContent_ = function getTextAreaFromContent_() {
    var _node = '';
    var childrens_ = Array.prototype.slice.call(this.element && this.element.children, 0);
    if (childrens_.length > 0) {
      childrens_.every(function (ele) {
        if (ele.nodeType === 1 && ele.nodeName.toLowerCase() === 'textarea') {
          _node = ele;
          return false;
        } else {
          return true;
        }
      });
    }
    return _node;
  };

  PlotTextBox.prototype.createCloseButton = function createCloseButton(options) {
    var _closeSpan = document.createElement('span');
    _closeSpan.className = 'ol-plot-text-editor-close';
    _closeSpan.setAttribute('data-id', options['id']);
    off(_closeSpan, 'click', this.closeCurrentPlotText.bind(this));
    on(_closeSpan, 'click', this.closeCurrentPlotText.bind(this));
    this.element.appendChild(_closeSpan);
  };

  PlotTextBox.prototype.createResizeButton = function createResizeButton(options) {
    var _resizeSpan = document.createElement('span');
    _resizeSpan.className = 'ol-plot-text-editor-resize';
    _resizeSpan.setAttribute('data-id', options['id']);
    off(_resizeSpan, 'mousedown', this.handleResizeMouseDown_.bind(this));
    off(_resizeSpan, 'mousemove', this.handleResizeMouseMove_.bind(this));
    on(_resizeSpan, 'mousedown', this.handleResizeMouseDown_.bind(this));
    on(_resizeSpan, 'mousemove', this.handleResizeMouseMove_.bind(this));
    this.element.appendChild(_resizeSpan);
  };

  PlotTextBox.prototype.resizeButtonMoveHandler_ = function resizeButtonMoveHandler_(event) {
    var pixel_ = event.pixel;
    var element_ = this.getTextAreaFromContent_();
    if (pixel_.length < 1 || this.currentPixel_.length < 1 || !element_) return;
    var _offset = [pixel_[0] - this.currentPixel_[0], pixel_[1] - this.currentPixel_[1]];
    var _size = [element_.offsetWidth, element_.offsetHeight];
    var _width = _size[0] + _offset[0] * 2;
    var _height = _size[1] + _offset[1] * 2;
    setStyle(element_, 'width', _width + 'px');
    setStyle(element_, 'height', _height + 'px');
    this.currentPixel_ = pixel_;
    this.getMap().render();
  };

  PlotTextBox.prototype.handleResizeMouseMove_ = function handleResizeMouseMove_(event) {
    event.stopImmediatePropagation();
  };

  PlotTextBox.prototype.handleResizeMouseDown_ = function handleResizeMouseDown_(event) {
    if (!this.getMap()) return;
    this.currentPixel_ = [event.x, event.y];
    this.getMap().on('pointermove', this.resizeButtonMoveHandler_, this);
    on(this.getMap().getViewport(), 'mouseup', this.handleResizeMouseUp_.bind(this));
  };

  PlotTextBox.prototype.handleResizeMouseUp_ = function handleResizeMouseUp_(event) {
    if (!this.getMap()) return;
    this.getMap().un('pointermove', this.resizeButtonMoveHandler_, this);
    off(this.getMap().getViewport(), 'mouseup', this.handleResizeMouseUp_.bind(this));
    this.currentPixel_ = [];
  };

  PlotTextBox.prototype.closeCurrentPlotText = function closeCurrentPlotText(event) {
    if (!this.getMap()) return;
    if (event && hasClass(event.target, 'ol-plot-text-editor-close')) {
      var _id = event.target.getAttribute('data-id');
      if (_id) {
        var _overlay = this.getMap().getOverlayById(_id);
        if (_overlay) {
          this.getMap().removeOverlay(_overlay);
        }
      }
    }
  };

  PlotTextBox.prototype.handleFocus_ = function handleFocus_() {
    this.isFocus_ = true;
    if (this.getMap()) {
      this.getMap().set('activeTextArea', this);
      this.getMap().dispatchEvent('activeTextArea');
    }
  };

  PlotTextBox.prototype.handleBlur_ = function handleBlur_() {
    this.isFocus_ = false;
    if (this.getMap()) {
      this.getMap().set('activeTextArea', null);
      this.getMap().set('disActiveTextArea', this);
      this.getMap().dispatchEvent('disActiveTextArea');
    }
  };

  PlotTextBox.prototype.handleDragStart_ = function handleDragStart_(event) {
    var _this2 = this;

    if (!this.getMap()) return;
    if (!this.dragging_ && this.isMoveModel() && this.isFocus_) {
      this.handleTimer_ = window.setTimeout(function () {
        window.clearTimeout(_this2.handleTimer_);
        _this2.handleTimer_ = null;
        if (!_this2.isClick_) {
          _this2.dragging_ = true;
          _this2.disableMapDragPan();
          _this2.preCursor_ = _this2.element.style.cursor;
          on(_this2.getMap().getViewport(), 'mousemove', _this2.handleDragDrag_.bind(_this2));
          on(_this2.element, 'mouseup', _this2.handleDragEnd_.bind(_this2));
        }
      }, 300);
    }
  };

  PlotTextBox.prototype.handleDragDrag_ = function handleDragDrag_(event) {
    if (this.dragging_) {
      this.element.style.cursor = 'move';
      this._position = this.getMap().getCoordinateFromPixel([event.clientX, event.clientY]);
      this.setPosition(this._position);
    }
  };

  PlotTextBox.prototype.handleDragEnd_ = function handleDragEnd_(event) {
    this.isClick_ = false;
    window.clearTimeout(this.handleTimer_);
    this.handleTimer_ = null;
    if (this.dragging_ && this.isFocus_) {
      this.dragging_ = false;
      this.enableMapDragPan();
      this.element.style.cursor = this.preCursor_;
      off(this.getMap().getViewport(), 'mousemove', this.handleDragDrag_.bind(this));
      off(this.element, 'mouseup', this.handleDragEnd_.bind(this));
    }
  };

  PlotTextBox.prototype.handleClick_ = function handleClick_(event) {
    if (event.target === this.element) {
      this.isClick_ = true;
    } else {
      this.isClick_ = false;
    }
  };

  PlotTextBox.prototype.isMoveModel = function isMoveModel() {
    var range = window.getSelection().getRangeAt(0);
    return range.collapsed;
  };

  PlotTextBox.prototype.setStyle = function setStyle$$1() {
    var style = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var _element = this.getTextAreaFromContent_();
    if (_element) {
      for (var key in style) {
        if (style[key]) {
          setStyle(_element, key, style[key]);
        }
      }
    }
  };

  PlotTextBox.prototype.getStyle = function getStyle$$1() {
    var _style = {};
    var _element = this.getTextAreaFromContent_();
    if (_element) {
      for (var key in DEF_TEXT_STYEL) {
        _style[key] = getStyle(_element, key);
      }
    }
    return _style;
  };

  PlotTextBox.prototype.setValue = function setValue(value) {
    var _element = this.getTextAreaFromContent_();
    if (_element) {
      _element.value = value;
      if (value) {
        autosize.update(_element);
      }
      this.getMap().render();
    }
  };

  PlotTextBox.prototype.getValue = function getValue() {
    var _element = this.getTextAreaFromContent_();
    if (_element) {
      return _element.value;
    } else {
      return '';
    }
  };

  PlotTextBox.prototype.getWidth = function getWidth() {
    var element_ = this.getTextAreaFromContent_();
    if (element_ && element_.offsetWidth) {
      return element_.offsetWidth;
    } else {
      return 0;
    }
  };

  PlotTextBox.prototype.getHeight = function getHeight() {
    var element_ = this.getTextAreaFromContent_();
    if (element_ && element_.offsetHeight) {
      return element_.offsetHeight;
    } else {
      return 0;
    }
  };

  PlotTextBox.prototype.enableMapDragPan = function enableMapDragPan() {
    var _map = this.getMap();
    if (!_map) return;
    if (this.mapDragPan && this.mapDragPan instanceof $DragPan) {
      _map.addInteraction(this.mapDragPan);
      delete this.mapDragPan;
    }
  };

  PlotTextBox.prototype.disableMapDragPan = function disableMapDragPan() {
    var _this3 = this;

    var _map = this.getMap();
    if (!_map) return;
    var interactions = _map.getInteractions().getArray();
    interactions.every(function (item) {
      if (item instanceof $DragPan) {
        _this3.mapDragPan = item;
        _map.removeInteraction(item);
        return false;
      } else {
        return true;
      }
    });
  };

  PlotTextBox.prototype.setMap = function setMap(map) {
    ol.Overlay.prototype.setMap.call(this, map);
    if (map && map instanceof ol.Map) {
      this.setStyle(merge(DEF_TEXT_STYEL, this.options_['style']));
      this.setValue(this.options_['value']);
    }
  };

  return PlotTextBox;
}(ol.Overlay);

var TEXTAREA = 'TextArea';
var ARC = 'Arc';
var CURVE = 'Curve';
var GATHERING_PLACE = 'GatheringPlace';
var POLYLINE = 'Polyline';
var FREEHANDLINE = 'FreeHandLine';
var POINT = 'Point';
var PENNANT = 'Pennant';
var RECTANGLE = 'RectAngle';
var CIRCLE = 'Circle';
var ELLIPSE = 'Ellipse';
var LUNE = 'Lune';
var SECTOR = 'Sector';
var CLOSED_CURVE = 'ClosedCurve';
var POLYGON = 'Polygon';
var FREE_POLYGON = 'FreePolygon';
var ATTACK_ARROW = 'AttackArrow';
var DOUBLE_ARROW = 'DoubleArrow';
var STRAIGHT_ARROW = 'StraightArrow';
var FINE_ARROW = 'FineArrow';
var ASSAULT_DIRECTION = 'AssaultDirection';
var TAILED_ATTACK_ARROW = 'TailedAttackArrow';
var SQUAD_COMBAT = 'SquadCombat';
var TAILED_SQUAD_COMBAT = 'TailedSquadCombat';
var RECTFLAG = 'RectFlag';
var TRIANGLEFLAG = 'TriangleFlag';
var CURVEFLAG = 'CurveFlag';


var PlotTypes = Object.freeze({
	TEXTAREA: TEXTAREA,
	ARC: ARC,
	CURVE: CURVE,
	GATHERING_PLACE: GATHERING_PLACE,
	POLYLINE: POLYLINE,
	FREEHANDLINE: FREEHANDLINE,
	POINT: POINT,
	PENNANT: PENNANT,
	RECTANGLE: RECTANGLE,
	CIRCLE: CIRCLE,
	ELLIPSE: ELLIPSE,
	LUNE: LUNE,
	SECTOR: SECTOR,
	CLOSED_CURVE: CLOSED_CURVE,
	POLYGON: POLYGON,
	FREE_POLYGON: FREE_POLYGON,
	ATTACK_ARROW: ATTACK_ARROW,
	DOUBLE_ARROW: DOUBLE_ARROW,
	STRAIGHT_ARROW: STRAIGHT_ARROW,
	FINE_ARROW: FINE_ARROW,
	ASSAULT_DIRECTION: ASSAULT_DIRECTION,
	TAILED_SQUAD_COMBAT: TAILED_SQUAD_COMBAT,
	TAILED_ATTACK_ARROW: TAILED_ATTACK_ARROW,
	SQUAD_COMBAT: SQUAD_COMBAT,
	RECTFLAG: RECTFLAG,
	TRIANGLEFLAG: TRIANGLEFLAG,
	CURVEFLAG: CURVEFLAG
});

var Point = function (_ol$geom$Point) {
  inherits(Point, _ol$geom$Point);

  function Point(coordinates, point, params) {
    classCallCheck(this, Point);

    var _this = possibleConstructorReturn(this, _ol$geom$Point.call(this, []));

    _this.type = POINT;
    _this.options = params || {};
    _this.set('params', _this.options);
    _this.fixPointCount = 1;
    if (point && point.length > 0) {
      _this.setPoints(point);
    } else if (coordinates && coordinates.length > 0) {
      _this.setCoordinates(coordinates);
    }
    return _this;
  }

  Point.prototype.getPlotType = function getPlotType() {
    return this.type;
  };

  Point.prototype.generate = function generate() {
    var pnt = this.points[0];
    this.setCoordinates(pnt);
  };

  Point.prototype.setMap = function setMap(map) {
    if (map && map instanceof ol.Map) {
      this.map = map;
    } else {
      throw new Error('传入的不是地图对象！');
    }
  };

  Point.prototype.getMap = function getMap() {
    return this.map;
  };

  Point.prototype.isPlot = function isPlot() {
    return true;
  };

  Point.prototype.setPoints = function setPoints(value) {
    this.points = !value ? [] : value;
    if (this.points.length >= 1) {
      this.generate();
    }
  };

  Point.prototype.getPoints = function getPoints() {
    return this.points.slice(0);
  };

  Point.prototype.getPointCount = function getPointCount() {
    return this.points.length;
  };

  Point.prototype.updatePoint = function updatePoint(point, index) {
    if (index >= 0 && index < this.points.length) {
      this.points[index] = point;
      this.generate();
    }
  };

  Point.prototype.updateLastPoint = function updateLastPoint(point) {
    this.updatePoint(point, this.points.length - 1);
  };

  Point.prototype.finishDrawing = function finishDrawing() {};

  return Point;
}(ol.geom.Point);

var Pennant = function (_ol$geom$Point) {
  inherits(Pennant, _ol$geom$Point);

  function Pennant(coordinates, point, params) {
    classCallCheck(this, Pennant);

    var _this = possibleConstructorReturn(this, _ol$geom$Point.call(this, []));

    _this.type = PENNANT;
    _this.options = params || {};
    _this.set('params', _this.options);
    if (point && point.length > 0) {
      _this.setPoints(point);
    } else if (coordinates && coordinates.length > 0) {
      _this.setCoordinates(coordinates);
    }
    return _this;
  }

  Pennant.prototype.getPlotType = function getPlotType() {
    return this.type;
  };

  Pennant.prototype.generate = function generate() {
    this.setCoordinates(this.points);
  };

  Pennant.prototype.setMap = function setMap(map) {
    if (map && map instanceof ol.Map) {
      this.map = map;
    } else {
      throw new Error('传入的不是地图对象！');
    }
  };

  Pennant.prototype.getMap = function getMap() {
    return this.map;
  };

  Pennant.prototype.isPlot = function isPlot() {
    return true;
  };

  Pennant.prototype.setPoints = function setPoints(value) {
    this.points = !value ? [] : value;
    if (this.points.length >= 1) {
      this.generate();
    }
  };

  Pennant.prototype.getPoints = function getPoints() {
    return this.points.slice(0);
  };

  Pennant.prototype.getPointCount = function getPointCount() {
    return this.points.length;
  };

  Pennant.prototype.updatePoint = function updatePoint(point, index) {
    if (index >= 0 && index < this.points.length) {
      this.points[index] = point;
      this.generate();
    }
  };

  Pennant.prototype.updateLastPoint = function updateLastPoint(point) {
    this.updatePoint(point, this.points.length - 1);
  };

  Pennant.prototype.finishDrawing = function finishDrawing() {};

  return Pennant;
}(ol.geom.Point);

var Polyline = function (_ol$geom$LineString) {
  inherits(Polyline, _ol$geom$LineString);

  function Polyline(coordinates, points, params) {
    classCallCheck(this, Polyline);

    var _this = possibleConstructorReturn(this, _ol$geom$LineString.call(this, []));

    _this.type = POLYLINE;
    _this.freehand = false;
    _this.set('params', params);
    if (points && points.length > 0) {
      _this.setPoints(points);
    } else if (coordinates && coordinates.length > 0) {
      _this.setCoordinates(coordinates);
    }
    return _this;
  }

  Polyline.prototype.getPlotType = function getPlotType() {
    return this.type;
  };

  Polyline.prototype.generate = function generate() {
    this.setCoordinates(this.points);
  };

  Polyline.prototype.setMap = function setMap(map) {
    if (map && map instanceof ol.Map) {
      this.map = map;
    } else {
      throw new Error('传入的不是地图对象！');
    }
  };

  Polyline.prototype.getMap = function getMap() {
    return this.map;
  };

  Polyline.prototype.isPlot = function isPlot() {
    return true;
  };

  Polyline.prototype.setPoints = function setPoints(value) {
    this.points = !value ? [] : value;
    if (this.points.length >= 1) {
      this.generate();
    }
  };

  Polyline.prototype.getPoints = function getPoints() {
    return this.points.slice(0);
  };

  Polyline.prototype.getPointCount = function getPointCount() {
    return this.points.length;
  };

  Polyline.prototype.updatePoint = function updatePoint(point, index) {
    if (index >= 0 && index < this.points.length) {
      this.points[index] = point;
      this.generate();
    }
  };

  Polyline.prototype.updateLastPoint = function updateLastPoint(point) {
    this.updatePoint(point, this.points.length - 1);
  };

  Polyline.prototype.finishDrawing = function finishDrawing() {};

  return Polyline;
}(ol.geom.LineString);

var Arc = function (_ol$geom$LineString) {
  inherits(Arc, _ol$geom$LineString);

  function Arc(coordinates, points, params) {
    classCallCheck(this, Arc);

    var _this = possibleConstructorReturn(this, _ol$geom$LineString.call(this, []));

    _this.type = ARC;
    _this.fixPointCount = 3;
    _this.set('params', params);
    if (points && points.length > 0) {
      _this.setPoints(points);
    } else if (coordinates && coordinates.length > 0) {
      _this.setCoordinates(coordinates);
    }
    return _this;
  }

  Arc.prototype.getPlotType = function getPlotType() {
    return this.type;
  };

  Arc.prototype.generate = function generate() {
    var count = this.getPointCount();
    if (count < 2) return;
    if (count === 2) {
      this.setCoordinates(this.points);
    } else {
      var _ref = [this.points[0], this.points[1], this.points[2], null, null],
          pnt1 = _ref[0],
          pnt2 = _ref[1],
          pnt3 = _ref[2],
          startAngle = _ref[3],
          endAngle = _ref[4];

      var center = getCircleCenterOfThreePoints(pnt1, pnt2, pnt3);
      var radius = MathDistance(pnt1, center);
      var angle1 = getAzimuth(pnt1, center);
      var angle2 = getAzimuth(pnt2, center);
      if (isClockWise(pnt1, pnt2, pnt3)) {
        startAngle = angle2;
        endAngle = angle1;
      } else {
        startAngle = angle1;
        endAngle = angle2;
      }
      this.setCoordinates(getArcPoints(center, radius, startAngle, endAngle));
    }
  };

  Arc.prototype.setMap = function setMap(map) {
    if (map && map instanceof ol.Map) {
      this.map = map;
    } else {
      throw new Error('传入的不是地图对象！');
    }
  };

  Arc.prototype.getMap = function getMap() {
    return this.map;
  };

  Arc.prototype.isPlot = function isPlot() {
    return true;
  };

  Arc.prototype.setPoints = function setPoints(value) {
    this.points = !value ? [] : value;
    if (this.points.length >= 1) {
      this.generate();
    }
  };

  Arc.prototype.getPoints = function getPoints() {
    return this.points.slice(0);
  };

  Arc.prototype.getPointCount = function getPointCount() {
    return this.points.length;
  };

  Arc.prototype.updatePoint = function updatePoint(point, index) {
    if (index >= 0 && index < this.points.length) {
      this.points[index] = point;
      this.generate();
    }
  };

  Arc.prototype.updateLastPoint = function updateLastPoint(point) {
    this.updatePoint(point, this.points.length - 1);
  };

  Arc.prototype.finishDrawing = function finishDrawing() {};

  return Arc;
}(ol.geom.LineString);

var Circle = function (_ol$geom$Polygon) {
  inherits(Circle, _ol$geom$Polygon);

  function Circle(coordinates, points, params) {
    classCallCheck(this, Circle);

    var _this = possibleConstructorReturn(this, _ol$geom$Polygon.call(this, []));

    _this.type = CIRCLE;
    _this.fixPointCount = 2;
    _this.set('params', params);
    if (points && points.length > 0) {
      _this.setPoints(points);
    } else if (coordinates && coordinates.length > 0) {
      _this.setCoordinates(coordinates);
    }
    return _this;
  }

  Circle.prototype.getPlotType = function getPlotType() {
    return this.type;
  };

  Circle.prototype.generate = function generate() {
    var count = this.getPointCount();
    if (count < 2) {
      return false;
    } else {
      var center = this.points[0];
      var radius = MathDistance(center, this.points[1]);
      this.setCoordinates([this.generatePoints(center, radius)]);
    }
  };

  Circle.prototype.generatePoints = function generatePoints(center, radius) {
    var x = null,
        y = null,
        angle = null,
        points = [];

    for (var i = 0; i <= 100; i++) {
      angle = Math.PI * 2 * i / 100;
      x = center[0] + radius * Math.cos(angle);
      y = center[1] + radius * Math.sin(angle);
      points.push([x, y]);
    }
    return points;
  };

  Circle.prototype.setMap = function setMap(map) {
    if (map && map instanceof ol.Map) {
      this.map = map;
    } else {
      throw new Error('传入的不是地图对象！');
    }
  };

  Circle.prototype.getMap = function getMap() {
    return this.map;
  };

  Circle.prototype.isPlot = function isPlot() {
    return true;
  };

  Circle.prototype.setPoints = function setPoints(value) {
    this.points = !value ? [] : value;
    if (this.points.length >= 1) {
      this.generate();
    }
  };

  Circle.prototype.getPoints = function getPoints() {
    return this.points.slice(0);
  };

  Circle.prototype.getPointCount = function getPointCount() {
    return this.points.length;
  };

  Circle.prototype.updatePoint = function updatePoint(point, index) {
    if (index >= 0 && index < this.points.length) {
      this.points[index] = point;
      this.generate();
    }
  };

  Circle.prototype.updateLastPoint = function updateLastPoint(point) {
    this.updatePoint(point, this.points.length - 1);
  };

  Circle.prototype.finishDrawing = function finishDrawing() {};

  return Circle;
}(ol.geom.Polygon);

var Curve = function (_ol$geom$LineString) {
  inherits(Curve, _ol$geom$LineString);

  function Curve(coordinates, points, params) {
    classCallCheck(this, Curve);

    var _this = possibleConstructorReturn(this, _ol$geom$LineString.call(this, []));

    _this.type = CURVE;
    _this.t = 0.3;
    _this.set('params', params);
    if (points && points.length > 0) {
      _this.setPoints(points);
    } else if (coordinates && coordinates.length > 0) {
      _this.setCoordinates(coordinates);
    }
    return _this;
  }

  Curve.prototype.getPlotType = function getPlotType() {
    return this.type;
  };

  Curve.prototype.generate = function generate() {
    var count = this.getPointCount();
    if (count < 2) {
      return false;
    } else if (count === 2) {
      this.setCoordinates(this.points);
    } else {
      var points = getCurvePoints(this.t, this.points);
      this.setCoordinates(points);
    }
  };

  Curve.prototype.setMap = function setMap(map) {
    if (map && map instanceof ol.Map) {
      this.map = map;
    } else {
      throw new Error('传入的不是地图对象！');
    }
  };

  Curve.prototype.getMap = function getMap() {
    return this.map;
  };

  Curve.prototype.isPlot = function isPlot() {
    return true;
  };

  Curve.prototype.setPoints = function setPoints(value) {
    this.points = !value ? [] : value;
    if (this.points.length >= 1) {
      this.generate();
    }
  };

  Curve.prototype.getPoints = function getPoints() {
    return this.points.slice(0);
  };

  Curve.prototype.getPointCount = function getPointCount() {
    return this.points.length;
  };

  Curve.prototype.updatePoint = function updatePoint(point, index) {
    if (index >= 0 && index < this.points.length) {
      this.points[index] = point;
      this.generate();
    }
  };

  Curve.prototype.updateLastPoint = function updateLastPoint(point) {
    this.updatePoint(point, this.points.length - 1);
  };

  Curve.prototype.finishDrawing = function finishDrawing() {};

  return Curve;
}(ol.geom.LineString);

var FreeHandLine = function (_ol$geom$LineString) {
  inherits(FreeHandLine, _ol$geom$LineString);

  function FreeHandLine(coordinates, points, params) {
    classCallCheck(this, FreeHandLine);

    var _this = possibleConstructorReturn(this, _ol$geom$LineString.call(this, []));

    _this.type = FREEHANDLINE;
    _this.freehand = true;
    _this.set('params', params);
    if (points && points.length > 0) {
      _this.setPoints(points);
    } else if (coordinates && coordinates.length > 0) {
      _this.setCoordinates(coordinates);
    }
    return _this;
  }

  FreeHandLine.prototype.getPlotType = function getPlotType() {
    return this.type;
  };

  FreeHandLine.prototype.generate = function generate() {
    this.setCoordinates(this.points);
  };

  FreeHandLine.prototype.setMap = function setMap(map) {
    if (map && map instanceof ol.Map) {
      this.map = map;
    } else {
      throw new Error('传入的不是地图对象！');
    }
  };

  FreeHandLine.prototype.getMap = function getMap() {
    return this.map;
  };

  FreeHandLine.prototype.isPlot = function isPlot() {
    return true;
  };

  FreeHandLine.prototype.setPoints = function setPoints(value) {
    this.points = !value ? [] : value;
    if (this.points.length >= 1) {
      this.generate();
    }
  };

  FreeHandLine.prototype.getPoints = function getPoints() {
    return this.points.slice(0);
  };

  FreeHandLine.prototype.getPointCount = function getPointCount() {
    return this.points.length;
  };

  FreeHandLine.prototype.updatePoint = function updatePoint(point, index) {
    if (index >= 0 && index < this.points.length) {
      this.points[index] = point;
      this.generate();
    }
  };

  FreeHandLine.prototype.updateLastPoint = function updateLastPoint(point) {
    this.updatePoint(point, this.points.length - 1);
  };

  FreeHandLine.prototype.finishDrawing = function finishDrawing() {};

  return FreeHandLine;
}(ol.geom.LineString);

var RectAngle = function (_ol$geom$Polygon) {
  inherits(RectAngle, _ol$geom$Polygon);

  function RectAngle(coordinates, points, params) {
    classCallCheck(this, RectAngle);

    var _this = possibleConstructorReturn(this, _ol$geom$Polygon.call(this, []));

    _this.type = RECTANGLE;
    _this.fixPointCount = 2;
    _this.set('params', params);
    _this.isFill = params['isFill'] === false ? params['isFill'] : true;
    if (points && points.length > 0) {
      _this.setPoints(points);
    } else if (coordinates && coordinates.length > 0) {
      _this.setCoordinates(coordinates);
    }
    return _this;
  }

  RectAngle.prototype.getPlotType = function getPlotType() {
    return this.type;
  };

  RectAngle.prototype.generate = function generate() {
    if (this.points.length === 2) {
      var coordinates = [];
      if (this.isFill) {
        var extent = ol.extent.boundingExtent(this.points);
        var polygon = ol.geom.Polygon.fromExtent(extent);
        coordinates = polygon.getCoordinates();
      } else {
        var start = this.points[0];
        var end = this.points[1];
        coordinates = [start, [start[0], end[1]], end, [end[0], start[1]], start];
      }
      this.setCoordinates(coordinates);
    }
  };

  RectAngle.prototype.setMap = function setMap(map) {
    if (map && map instanceof ol.Map) {
      this.map = map;
    } else {
      throw new Error('传入的不是地图对象！');
    }
  };

  RectAngle.prototype.getMap = function getMap() {
    return this.map;
  };

  RectAngle.prototype.isPlot = function isPlot() {
    return true;
  };

  RectAngle.prototype.setPoints = function setPoints(value) {
    this.points = !value ? [] : value;
    if (this.points.length >= 1) {
      this.generate();
    }
  };

  RectAngle.prototype.getPoints = function getPoints() {
    return this.points.slice(0);
  };

  RectAngle.prototype.getPointCount = function getPointCount() {
    return this.points.length;
  };

  RectAngle.prototype.updatePoint = function updatePoint(point, index) {
    if (index >= 0 && index < this.points.length) {
      this.points[index] = point;
      this.generate();
    }
  };

  RectAngle.prototype.updateLastPoint = function updateLastPoint(point) {
    this.updatePoint(point, this.points.length - 1);
  };

  RectAngle.prototype.finishDrawing = function finishDrawing() {};

  return RectAngle;
}(ol.geom.Polygon);

var Ellipse = function (_ol$geom$Polygon) {
  inherits(Ellipse, _ol$geom$Polygon);

  function Ellipse(coordinates, points, params) {
    classCallCheck(this, Ellipse);

    var _this = possibleConstructorReturn(this, _ol$geom$Polygon.call(this, []));

    _this.type = ELLIPSE;
    _this.fixPointCount = 2;
    _this.set('params', params);
    if (points && points.length > 0) {
      _this.setPoints(points);
    } else if (coordinates && coordinates.length > 0) {
      _this.setCoordinates(coordinates);
    }
    return _this;
  }

  Ellipse.prototype.getPlotType = function getPlotType() {
    return this.type;
  };

  Ellipse.prototype.generate = function generate() {
    if (this.getPointCount() < 2) {
      return false;
    } else {
      var _ref = [this.points[0], this.points[1]],
          pnt1 = _ref[0],
          pnt2 = _ref[1];

      var center = Mid(pnt1, pnt2);
      var majorRadius = Math.abs((pnt1[0] - pnt2[0]) / 2);
      var minorRadius = Math.abs((pnt1[1] - pnt2[1]) / 2);
      var res = this.generatePoints(center, majorRadius, minorRadius);
      this.setCoordinates([res]);
    }
  };

  Ellipse.prototype.generatePoints = function generatePoints(center, majorRadius, minorRadius) {
    var x = null,
        y = null,
        angle = null,
        points = [];

    for (var i = 0; i <= FITTING_COUNT; i++) {
      angle = Math.PI * 2 * i / FITTING_COUNT;
      x = center[0] + majorRadius * Math.cos(angle);
      y = center[1] + minorRadius * Math.sin(angle);
      points.push([x, y]);
    }
    return points;
  };

  Ellipse.prototype.setMap = function setMap(map) {
    if (map && map instanceof ol.Map) {
      this.map = map;
    } else {
      throw new Error('传入的不是地图对象！');
    }
  };

  Ellipse.prototype.getMap = function getMap() {
    return this.map;
  };

  Ellipse.prototype.isPlot = function isPlot() {
    return true;
  };

  Ellipse.prototype.setPoints = function setPoints(value) {
    this.points = !value ? [] : value;
    if (this.points.length >= 1) {
      this.generate();
    }
  };

  Ellipse.prototype.getPoints = function getPoints() {
    return this.points.slice(0);
  };

  Ellipse.prototype.getPointCount = function getPointCount() {
    return this.points.length;
  };

  Ellipse.prototype.updatePoint = function updatePoint(point, index) {
    if (index >= 0 && index < this.points.length) {
      this.points[index] = point;
      this.generate();
    }
  };

  Ellipse.prototype.updateLastPoint = function updateLastPoint(point) {
    this.updatePoint(point, this.points.length - 1);
  };

  Ellipse.prototype.finishDrawing = function finishDrawing() {};

  return Ellipse;
}(ol.geom.Polygon);

var Lune = function (_ol$geom$Polygon) {
  inherits(Lune, _ol$geom$Polygon);

  function Lune(coordinates, points, params) {
    classCallCheck(this, Lune);

    var _this = possibleConstructorReturn(this, _ol$geom$Polygon.call(this, []));

    _this.type = LUNE;
    _this.fixPointCount = 3;
    _this.set('params', params);
    if (points && points.length > 0) {
      _this.setPoints(points);
    } else if (coordinates && coordinates.length > 0) {
      _this.setCoordinates(coordinates);
    }
    return _this;
  }

  Lune.prototype.getPlotType = function getPlotType() {
    return this.type;
  };

  Lune.prototype.generate = function generate() {
    if (this.getPointCount() < 2) {
      return false;
    } else {
      var pnts = this.getPoints();
      if (this.getPointCount() === 2) {
        var mid = Mid(pnts[0], pnts[1]);
        var d = MathDistance(pnts[0], mid);
        var pnt = getThirdPoint(pnts[0], mid, HALF_PI, d);
        pnts.push(pnt);
      }
      var _ref = [pnts[0], pnts[1], pnts[2], undefined, undefined],
          pnt1 = _ref[0],
          pnt2 = _ref[1],
          pnt3 = _ref[2],
          startAngle = _ref[3],
          endAngle = _ref[4];

      var center = getCircleCenterOfThreePoints(pnt1, pnt2, pnt3);
      var radius = MathDistance(pnt1, center);
      var angle1 = getAzimuth(pnt1, center);
      var angle2 = getAzimuth(pnt2, center);
      if (isClockWise(pnt1, pnt2, pnt3)) {
        startAngle = angle2;
        endAngle = angle1;
      } else {
        startAngle = angle1;
        endAngle = angle2;
      }
      pnts = getArcPoints(center, radius, startAngle, endAngle);
      pnts.push(pnts[0]);
      this.setCoordinates([pnts]);
    }
  };

  Lune.prototype.setMap = function setMap(map) {
    if (map && map instanceof ol.Map) {
      this.map = map;
    } else {
      throw new Error('传入的不是地图对象！');
    }
  };

  Lune.prototype.getMap = function getMap() {
    return this.map;
  };

  Lune.prototype.isPlot = function isPlot() {
    return true;
  };

  Lune.prototype.setPoints = function setPoints(value) {
    this.points = !value ? [] : value;
    if (this.points.length >= 1) {
      this.generate();
    }
  };

  Lune.prototype.getPoints = function getPoints() {
    return this.points.slice(0);
  };

  Lune.prototype.getPointCount = function getPointCount() {
    return this.points.length;
  };

  Lune.prototype.updatePoint = function updatePoint(point, index) {
    if (index >= 0 && index < this.points.length) {
      this.points[index] = point;
      this.generate();
    }
  };

  Lune.prototype.updateLastPoint = function updateLastPoint(point) {
    this.updatePoint(point, this.points.length - 1);
  };

  Lune.prototype.finishDrawing = function finishDrawing() {};

  return Lune;
}(ol.geom.Polygon);

var Sector = function (_ol$geom$Polygon) {
  inherits(Sector, _ol$geom$Polygon);

  function Sector(coordinates, points, params) {
    classCallCheck(this, Sector);

    var _this = possibleConstructorReturn(this, _ol$geom$Polygon.call(this, []));

    _this.type = SECTOR;
    _this.fixPointCount = 3;
    _this.set('params', params);
    if (points && points.length > 0) {
      _this.setPoints(points);
    } else if (coordinates && coordinates.length > 0) {
      _this.setCoordinates(coordinates);
    }
    return _this;
  }

  Sector.prototype.getPlotType = function getPlotType() {
    return this.type;
  };

  Sector.prototype.generate = function generate() {
    var points = this.getPointCount();
    if (points < 2) {
      return false;
    } else if (points === 2) {
      this.setCoordinates([this.points]);
    } else {
      var pnts = this.getPoints();
      var _ref = [pnts[0], pnts[1], pnts[2]],
          center = _ref[0],
          pnt2 = _ref[1],
          pnt3 = _ref[2];

      var radius = MathDistance(pnt2, center);
      var startAngle = getAzimuth(pnt2, center);
      var endAngle = getAzimuth(pnt3, center);
      var pList = getArcPoints(center, radius, startAngle, endAngle);
      pList.push(center, pList[0]);
      this.setCoordinates([pList]);
    }
  };

  Sector.prototype.setMap = function setMap(map) {
    if (map && map instanceof ol.Map) {
      this.map = map;
    } else {
      throw new Error('传入的不是地图对象！');
    }
  };

  Sector.prototype.getMap = function getMap() {
    return this.map;
  };

  Sector.prototype.isPlot = function isPlot() {
    return true;
  };

  Sector.prototype.setPoints = function setPoints(value) {
    this.points = !value ? [] : value;
    if (this.points.length >= 1) {
      this.generate();
    }
  };

  Sector.prototype.getPoints = function getPoints() {
    return this.points.slice(0);
  };

  Sector.prototype.getPointCount = function getPointCount() {
    return this.points.length;
  };

  Sector.prototype.updatePoint = function updatePoint(point, index) {
    if (index >= 0 && index < this.points.length) {
      this.points[index] = point;
      this.generate();
    }
  };

  Sector.prototype.updateLastPoint = function updateLastPoint(point) {
    this.updatePoint(point, this.points.length - 1);
  };

  Sector.prototype.finishDrawing = function finishDrawing() {};

  return Sector;
}(ol.geom.Polygon);

var ClosedCurve = function (_ol$geom$Polygon) {
  inherits(ClosedCurve, _ol$geom$Polygon);

  function ClosedCurve(coordinates, points, params) {
    classCallCheck(this, ClosedCurve);

    var _this = possibleConstructorReturn(this, _ol$geom$Polygon.call(this, []));

    _this.type = CLOSED_CURVE;
    _this.t = 0.3;
    _this.set('params', params);
    if (points && points.length > 0) {
      _this.setPoints(points);
    } else if (coordinates && coordinates.length > 0) {
      _this.setCoordinates(coordinates);
    }
    return _this;
  }

  ClosedCurve.prototype.getPlotType = function getPlotType() {
    return this.type;
  };

  ClosedCurve.prototype.generate = function generate() {
    var points = this.getPointCount();
    if (points < 2) {
      return false;
    } else if (points === 2) {
      this.setCoordinates([this.points]);
    } else {
      var pnts = this.getPoints();
      pnts.push(pnts[0], pnts[1]);
      var normals = [],
          pList = [];

      for (var i = 0; i < pnts.length - 2; i++) {
        var normalPoints = getBisectorNormals(this.t, pnts[i], pnts[i + 1], pnts[i + 2]);
        normals = normals.concat(normalPoints);
      }
      var count = normals.length;
      normals = [normals[count - 1]].concat(normals.slice(0, count - 1));
      for (var _i = 0; _i < pnts.length - 2; _i++) {
        var pnt1 = pnts[_i];
        var pnt2 = pnts[_i + 1];
        pList.push(pnt1);
        for (var t = 0; t <= FITTING_COUNT; t++) {
          var pnt = getCubicValue(t / FITTING_COUNT, pnt1, normals[_i * 2], normals[_i * 2 + 1], pnt2);
          pList.push(pnt);
        }
        pList.push(pnt2);
      }
      this.setCoordinates([pList]);
    }
  };

  ClosedCurve.prototype.setMap = function setMap(map) {
    if (map && map instanceof ol.Map) {
      this.map = map;
    } else {
      throw new Error('传入的不是地图对象！');
    }
  };

  ClosedCurve.prototype.getMap = function getMap() {
    return this.map;
  };

  ClosedCurve.prototype.isPlot = function isPlot() {
    return true;
  };

  ClosedCurve.prototype.setPoints = function setPoints(value) {
    this.points = !value ? [] : value;
    if (this.points.length >= 1) {
      this.generate();
    }
  };

  ClosedCurve.prototype.getPoints = function getPoints() {
    return this.points.slice(0);
  };

  ClosedCurve.prototype.getPointCount = function getPointCount() {
    return this.points.length;
  };

  ClosedCurve.prototype.updatePoint = function updatePoint(point, index) {
    if (index >= 0 && index < this.points.length) {
      this.points[index] = point;
      this.generate();
    }
  };

  ClosedCurve.prototype.updateLastPoint = function updateLastPoint(point) {
    this.updatePoint(point, this.points.length - 1);
  };

  ClosedCurve.prototype.finishDrawing = function finishDrawing() {};

  return ClosedCurve;
}(ol.geom.Polygon);

var Polygon = function (_ol$geom$Polygon) {
  inherits(Polygon, _ol$geom$Polygon);

  function Polygon(coordinates, points, params) {
    classCallCheck(this, Polygon);

    var _this = possibleConstructorReturn(this, _ol$geom$Polygon.call(this, []));

    _this.type = POLYGON;
    _this.set('params', params);
    if (points && points.length > 0) {
      _this.setPoints(points);
    } else if (coordinates && coordinates.length > 0) {
      _this.setCoordinates(coordinates);
    }
    return _this;
  }

  Polygon.prototype.getPlotType = function getPlotType() {
    return this.type;
  };

  Polygon.prototype.generate = function generate() {
    var count = this.getPointCount();
    if (count < 2) {
      return false;
    } else {
      this.setCoordinates([this.points]);
    }
  };

  Polygon.prototype.setMap = function setMap(map) {
    if (map && map instanceof ol.Map) {
      this.map = map;
    } else {
      throw new Error('传入的不是地图对象！');
    }
  };

  Polygon.prototype.getMap = function getMap() {
    return this.map;
  };

  Polygon.prototype.isPlot = function isPlot() {
    return true;
  };

  Polygon.prototype.setPoints = function setPoints(value) {
    this.points = !value ? [] : value;
    if (this.points.length >= 1) {
      this.generate();
    }
  };

  Polygon.prototype.getPoints = function getPoints() {
    return this.points.slice(0);
  };

  Polygon.prototype.getPointCount = function getPointCount() {
    return this.points.length;
  };

  Polygon.prototype.updatePoint = function updatePoint(point, index) {
    if (index >= 0 && index < this.points.length) {
      this.points[index] = point;
      this.generate();
    }
  };

  Polygon.prototype.updateLastPoint = function updateLastPoint(point) {
    this.updatePoint(point, this.points.length - 1);
  };

  Polygon.prototype.finishDrawing = function finishDrawing() {};

  return Polygon;
}(ol.geom.Polygon);

var FreePolygon = function (_ol$geom$Polygon) {
  inherits(FreePolygon, _ol$geom$Polygon);

  function FreePolygon(coordinates, points, params) {
    classCallCheck(this, FreePolygon);

    var _this = possibleConstructorReturn(this, _ol$geom$Polygon.call(this, []));

    _this.type = FREE_POLYGON;
    _this.freehand = true;
    _this.set('params', params);
    if (points && points.length > 0) {
      _this.setPoints(points);
    } else if (coordinates && coordinates.length > 0) {
      _this.setCoordinates(coordinates);
    }
    return _this;
  }

  FreePolygon.prototype.getPlotType = function getPlotType() {
    return this.type;
  };

  FreePolygon.prototype.generate = function generate() {
    this.setCoordinates([this.points]);
  };

  FreePolygon.prototype.setMap = function setMap(map) {
    if (map && map instanceof ol.Map) {
      this.map = map;
    } else {
      throw new Error('传入的不是地图对象！');
    }
  };

  FreePolygon.prototype.getMap = function getMap() {
    return this.map;
  };

  FreePolygon.prototype.isPlot = function isPlot() {
    return true;
  };

  FreePolygon.prototype.setPoints = function setPoints(value) {
    this.points = !value ? [] : value;
    if (this.points.length >= 1) {
      this.generate();
    }
  };

  FreePolygon.prototype.getPoints = function getPoints() {
    return this.points.slice(0);
  };

  FreePolygon.prototype.getPointCount = function getPointCount() {
    return this.points.length;
  };

  FreePolygon.prototype.updatePoint = function updatePoint(point, index) {
    if (index >= 0 && index < this.points.length) {
      this.points[index] = point;
      this.generate();
    }
  };

  FreePolygon.prototype.updateLastPoint = function updateLastPoint(point) {
    this.updatePoint(point, this.points.length - 1);
  };

  FreePolygon.prototype.finishDrawing = function finishDrawing() {};

  return FreePolygon;
}(ol.geom.Polygon);

var AttackArrow = function (_ol$geom$Polygon) {
  inherits(AttackArrow, _ol$geom$Polygon);

  function AttackArrow(coordinates, points, params) {
    classCallCheck(this, AttackArrow);

    var _this = possibleConstructorReturn(this, _ol$geom$Polygon.call(this, []));

    _this.type = ATTACK_ARROW;
    _this.headHeightFactor = 0.18;
    _this.headWidthFactor = 0.3;
    _this.neckHeightFactor = 0.85;
    _this.neckWidthFactor = 0.15;
    _this.headTailFactor = 0.8;
    _this.set('params', params);
    if (points && points.length > 0) {
      _this.setPoints(points);
    } else if (coordinates && coordinates.length > 0) {
      _this.setCoordinates(coordinates);
    }
    return _this;
  }

  AttackArrow.prototype.getPlotType = function getPlotType() {
    return this.type;
  };

  AttackArrow.prototype.generate = function generate() {
    try {
      var points = this.getPointCount();
      if (points < 2) {
        return false;
      } else if (points === 2) {
        this.setCoordinates([this.points]);
      } else {
        var pnts = this.getPoints();
        var _ref = [pnts[0], pnts[1]],
            tailLeft = _ref[0],
            tailRight = _ref[1];

        if (isClockWise(pnts[0], pnts[1], pnts[2])) {
          tailLeft = pnts[1];
          tailRight = pnts[0];
        }
        var midTail = Mid(tailLeft, tailRight);
        var bonePnts = [midTail].concat(pnts.slice(2));
        var headPnts = this.getArrowHeadPoints(bonePnts, tailLeft, tailRight);
        var _ref2 = [headPnts[0], headPnts[4]],
            neckLeft = _ref2[0],
            neckRight = _ref2[1];

        var tailWidthFactor = MathDistance(tailLeft, tailRight) / getBaseLength(bonePnts);
        var bodyPnts = this.getArrowBodyPoints(bonePnts, neckLeft, neckRight, tailWidthFactor);
        var count = bodyPnts.length;
        var leftPnts = [tailLeft].concat(bodyPnts.slice(0, count / 2));
        leftPnts.push(neckLeft);
        var rightPnts = [tailRight].concat(bodyPnts.slice(count / 2, count));
        rightPnts.push(neckRight);
        leftPnts = getQBSplinePoints(leftPnts);
        rightPnts = getQBSplinePoints(rightPnts);
        this.setCoordinates([leftPnts.concat(headPnts, rightPnts.reverse())]);
      }
    } catch (e) {
      console.log(e);
    }
  };

  AttackArrow.prototype.getArrowPoints = function getArrowPoints(pnt1, pnt2, pnt3, clockWise) {
    var midPnt = Mid(pnt1, pnt2);
    var len = MathDistance(midPnt, pnt3);
    var midPnt1 = getThirdPoint(pnt3, midPnt, 0, len * 0.3, true);
    var midPnt2 = getThirdPoint(pnt3, midPnt, 0, len * 0.5, true);
    midPnt1 = getThirdPoint(midPnt, midPnt1, HALF_PI, len / 5, clockWise);
    midPnt2 = getThirdPoint(midPnt, midPnt2, HALF_PI, len / 4, clockWise);
    var points = [midPnt, midPnt1, midPnt2, pnt3];
    var arrowPnts = this.getArrowHeadPoints(points);
    if (arrowPnts && Array.isArray(arrowPnts) && arrowPnts.length > 0) {
      var _ref3 = [arrowPnts[0], arrowPnts[4]],
          neckLeftPoint = _ref3[0],
          neckRightPoint = _ref3[1];

      var tailWidthFactor = MathDistance(pnt1, pnt2) / getBaseLength(points) / 2;
      var bodyPnts = this.getArrowBodyPoints(points, neckLeftPoint, neckRightPoint, tailWidthFactor);
      if (bodyPnts) {
        var n = bodyPnts.length;
        var lPoints = bodyPnts.slice(0, n / 2);
        var rPoints = bodyPnts.slice(n / 2, n);
        lPoints.push(neckLeftPoint);
        rPoints.push(neckRightPoint);
        lPoints = lPoints.reverse();
        lPoints.push(pnt2);
        rPoints = rPoints.reverse();
        rPoints.push(pnt1);
        return lPoints.reverse().concat(arrowPnts, rPoints);
      }
    } else {
      throw new Error('插值出错');
    }
  };

  AttackArrow.prototype.getArrowHeadPoints = function getArrowHeadPoints(points, tailLeft, tailRight) {
    try {
      var len = getBaseLength(points);
      var headHeight = len * this.headHeightFactor;
      var headPnt = points[points.length - 1];
      len = MathDistance(headPnt, points[points.length - 2]);
      var tailWidth = MathDistance(tailLeft, tailRight);
      if (headHeight > tailWidth * this.headTailFactor) {
        headHeight = tailWidth * this.headTailFactor;
      }
      var headWidth = headHeight * this.headWidthFactor;
      var neckWidth = headHeight * this.neckWidthFactor;
      headHeight = headHeight > len ? len : headHeight;
      var neckHeight = headHeight * this.neckHeightFactor;
      var headEndPnt = getThirdPoint(points[points.length - 2], headPnt, 0, headHeight, true);
      var neckEndPnt = getThirdPoint(points[points.length - 2], headPnt, 0, neckHeight, true);
      var headLeft = getThirdPoint(headPnt, headEndPnt, HALF_PI, headWidth, false);
      var headRight = getThirdPoint(headPnt, headEndPnt, HALF_PI, headWidth, true);
      var neckLeft = getThirdPoint(headPnt, neckEndPnt, HALF_PI, neckWidth, false);
      var neckRight = getThirdPoint(headPnt, neckEndPnt, HALF_PI, neckWidth, true);
      return [neckLeft, headLeft, headPnt, headRight, neckRight];
    } catch (e) {
      console.log(e);
    }
  };

  AttackArrow.prototype.getArrowBodyPoints = function getArrowBodyPoints(points, neckLeft, neckRight, tailWidthFactor) {
    var allLen = wholeDistance(points);
    var len = getBaseLength(points);
    var tailWidth = len * tailWidthFactor;
    var neckWidth = MathDistance(neckLeft, neckRight);
    var widthDif = (tailWidth - neckWidth) / 2;
    var tempLen = 0,
        leftBodyPnts = [],
        rightBodyPnts = [];

    for (var i = 1; i < points.length - 1; i++) {
      var angle = getAngleOfThreePoints(points[i - 1], points[i], points[i + 1]) / 2;
      tempLen += MathDistance(points[i - 1], points[i]);
      var w = (tailWidth / 2 - tempLen / allLen * widthDif) / Math.sin(angle);
      var left = getThirdPoint(points[i - 1], points[i], Math.PI - angle, w, true);
      var right = getThirdPoint(points[i - 1], points[i], angle, w, false);
      leftBodyPnts.push(left);
      rightBodyPnts.push(right);
    }
    return leftBodyPnts.concat(rightBodyPnts);
  };

  AttackArrow.prototype.getTempPoint4 = function getTempPoint4(linePnt1, linePnt2, point) {
    try {
      var midPnt = Mid(linePnt1, linePnt2);
      var len = MathDistance(midPnt, point);
      var angle = getAngleOfThreePoints(linePnt1, midPnt, point);
      var symPnt = undefined,
          distance1 = undefined,
          distance2 = undefined,
          mid = undefined;

      if (angle < HALF_PI) {
        distance1 = len * Math.sin(angle);
        distance2 = len * Math.cos(angle);
        mid = getThirdPoint(linePnt1, midPnt, HALF_PI, distance1, false);
        symPnt = getThirdPoint(midPnt, mid, HALF_PI, distance2, true);
      } else if (angle >= HALF_PI && angle < Math.PI) {
        distance1 = len * Math.sin(Math.PI - angle);
        distance2 = len * Math.cos(Math.PI - angle);
        mid = getThirdPoint(linePnt1, midPnt, HALF_PI, distance1, false);
        symPnt = getThirdPoint(midPnt, mid, HALF_PI, distance2, false);
      } else if (angle >= Math.PI && angle < Math.PI * 1.5) {
        distance1 = len * Math.sin(angle - Math.PI);
        distance2 = len * Math.cos(angle - Math.PI);
        mid = getThirdPoint(linePnt1, midPnt, HALF_PI, distance1, true);
        symPnt = getThirdPoint(midPnt, mid, HALF_PI, distance2, true);
      } else {
        distance1 = len * Math.sin(Math.PI * 2 - angle);
        distance2 = len * Math.cos(Math.PI * 2 - angle);
        mid = getThirdPoint(linePnt1, midPnt, HALF_PI, distance1, true);
        symPnt = getThirdPoint(midPnt, mid, HALF_PI, distance2, false);
      }
      return symPnt;
    } catch (e) {
      console.log(e);
    }
  };

  AttackArrow.prototype.setMap = function setMap(map) {
    if (map && map instanceof ol.Map) {
      this.map = map;
    } else {
      throw new Error('传入的不是地图对象！');
    }
  };

  AttackArrow.prototype.getMap = function getMap() {
    return this.map;
  };

  AttackArrow.prototype.isPlot = function isPlot() {
    return true;
  };

  AttackArrow.prototype.setPoints = function setPoints(value) {
    this.points = !value ? [] : value;
    if (this.points.length >= 1) {
      this.generate();
    }
  };

  AttackArrow.prototype.getPoints = function getPoints() {
    return this.points.slice(0);
  };

  AttackArrow.prototype.getPointCount = function getPointCount() {
    return this.points.length;
  };

  AttackArrow.prototype.updatePoint = function updatePoint(point, index) {
    if (index >= 0 && index < this.points.length) {
      this.points[index] = point;
      this.generate();
    }
  };

  AttackArrow.prototype.updateLastPoint = function updateLastPoint(point) {
    this.updatePoint(point, this.points.length - 1);
  };

  AttackArrow.prototype.finishDrawing = function finishDrawing() {};

  return AttackArrow;
}(ol.geom.Polygon);

var DoubleArrow = function (_ol$geom$Polygon) {
  inherits(DoubleArrow, _ol$geom$Polygon);

  function DoubleArrow(coordinates, points, params) {
    classCallCheck(this, DoubleArrow);

    var _this = possibleConstructorReturn(this, _ol$geom$Polygon.call(this, []));

    _this.type = DOUBLE_ARROW;
    _this.headHeightFactor = 0.25;
    _this.headWidthFactor = 0.3;
    _this.neckHeightFactor = 0.85;
    _this.neckWidthFactor = 0.15;
    _this.connPoint = null;
    _this.tempPoint4 = null;
    _this.fixPointCount = 4;
    _this.set('params', params);
    if (points && points.length > 0) {
      _this.setPoints(points);
    } else if (coordinates && coordinates.length > 0) {
      _this.setCoordinates(coordinates);
    }
    return _this;
  }

  DoubleArrow.prototype.getPlotType = function getPlotType() {
    return this.type;
  };

  DoubleArrow.prototype.generate = function generate() {
    try {
      var count = this.getPointCount();
      if (count < 2) {
        return false;
      } else if (count === 2) {
        this.setCoordinates([this.points]);
        return false;
      }
      if (count > 2) {
        var _ref = [this.points[0], this.points[1], this.points[2]],
            pnt1 = _ref[0],
            pnt2 = _ref[1],
            pnt3 = _ref[2];

        if (count === 3) {
          this.tempPoint4 = this.getTempPoint4(pnt1, pnt2, pnt3);
          this.connPoint = Mid(pnt1, pnt2);
        } else if (count === 4) {
          this.tempPoint4 = this.points[3];
          this.connPoint = Mid(pnt1, pnt2);
        } else {
          this.tempPoint4 = this.points[3];
          this.connPoint = this.points[4];
        }
        var leftArrowPnts = undefined,
            rightArrowPnts = undefined;

        if (isClockWise(pnt1, pnt2, pnt3)) {
          leftArrowPnts = this.getArrowPoints(pnt1, this.connPoint, this.tempPoint4, false);
          rightArrowPnts = this.getArrowPoints(this.connPoint, pnt2, pnt3, true);
        } else {
          leftArrowPnts = this.getArrowPoints(pnt2, this.connPoint, pnt3, false);
          rightArrowPnts = this.getArrowPoints(this.connPoint, pnt1, this.tempPoint4, true);
        }
        var m = leftArrowPnts.length;
        var t = (m - 5) / 2;
        var llBodyPnts = leftArrowPnts.slice(0, t);
        var lArrowPnts = leftArrowPnts.slice(t, t + 5);
        var lrBodyPnts = leftArrowPnts.slice(t + 5, m);
        var rlBodyPnts = rightArrowPnts.slice(0, t);
        var rArrowPnts = rightArrowPnts.slice(t, t + 5);
        var rrBodyPnts = rightArrowPnts.slice(t + 5, m);
        rlBodyPnts = getBezierPoints(rlBodyPnts);
        var bodyPnts = getBezierPoints(rrBodyPnts.concat(llBodyPnts.slice(1)));
        lrBodyPnts = getBezierPoints(lrBodyPnts);
        var pnts = rlBodyPnts.concat(rArrowPnts, bodyPnts, lArrowPnts, lrBodyPnts);
        this.setCoordinates([pnts]);
      }
    } catch (e) {
      console.log(e);
    }
  };

  DoubleArrow.prototype.getArrowPoints = function getArrowPoints(pnt1, pnt2, pnt3, clockWise) {
    var midPnt = Mid(pnt1, pnt2);
    var len = MathDistance(midPnt, pnt3);
    var midPnt1 = getThirdPoint(pnt3, midPnt, 0, len * 0.3, true);
    var midPnt2 = getThirdPoint(pnt3, midPnt, 0, len * 0.5, true);
    midPnt1 = getThirdPoint(midPnt, midPnt1, HALF_PI, len / 5, clockWise);
    midPnt2 = getThirdPoint(midPnt, midPnt2, HALF_PI, len / 4, clockWise);
    var points = [midPnt, midPnt1, midPnt2, pnt3];
    var arrowPnts = this.getArrowHeadPoints(points);
    if (arrowPnts && Array.isArray(arrowPnts) && arrowPnts.length > 0) {
      var _ref2 = [arrowPnts[0], arrowPnts[4]],
          neckLeftPoint = _ref2[0],
          neckRightPoint = _ref2[1];

      var tailWidthFactor = MathDistance(pnt1, pnt2) / getBaseLength(points) / 2;
      var bodyPnts = this.getArrowBodyPoints(points, neckLeftPoint, neckRightPoint, tailWidthFactor);
      if (bodyPnts) {
        var n = bodyPnts.length;
        var lPoints = bodyPnts.slice(0, n / 2);
        var rPoints = bodyPnts.slice(n / 2, n);
        lPoints.push(neckLeftPoint);
        rPoints.push(neckRightPoint);
        lPoints = lPoints.reverse();
        lPoints.push(pnt2);
        rPoints = rPoints.reverse();
        rPoints.push(pnt1);
        return lPoints.reverse().concat(arrowPnts, rPoints);
      }
    } else {
      throw new Error('插值出错');
    }
  };

  DoubleArrow.prototype.getArrowHeadPoints = function getArrowHeadPoints(points) {
    try {
      var len = getBaseLength(points);
      var headHeight = len * this.headHeightFactor;
      var headPnt = points[points.length - 1];
      var headWidth = headHeight * this.headWidthFactor;
      var neckWidth = headHeight * this.neckWidthFactor;
      var neckHeight = headHeight * this.neckHeightFactor;
      var headEndPnt = getThirdPoint(points[points.length - 2], headPnt, 0, headHeight, true);
      var neckEndPnt = getThirdPoint(points[points.length - 2], headPnt, 0, neckHeight, true);
      var headLeft = getThirdPoint(headPnt, headEndPnt, HALF_PI, headWidth, false);
      var headRight = getThirdPoint(headPnt, headEndPnt, HALF_PI, headWidth, true);
      var neckLeft = getThirdPoint(headPnt, neckEndPnt, HALF_PI, neckWidth, false);
      var neckRight = getThirdPoint(headPnt, neckEndPnt, HALF_PI, neckWidth, true);
      return [neckLeft, headLeft, headPnt, headRight, neckRight];
    } catch (e) {
      console.log(e);
    }
  };

  DoubleArrow.prototype.getArrowBodyPoints = function getArrowBodyPoints(points, neckLeft, neckRight, tailWidthFactor) {
    var allLen = wholeDistance(points);
    var len = getBaseLength(points);
    var tailWidth = len * tailWidthFactor;
    var neckWidth = MathDistance(neckLeft, neckRight);
    var widthDif = (tailWidth - neckWidth) / 2;
    var tempLen = 0,
        leftBodyPnts = [],
        rightBodyPnts = [];

    for (var i = 1; i < points.length - 1; i++) {
      var angle = getAngleOfThreePoints(points[i - 1], points[i], points[i + 1]) / 2;
      tempLen += MathDistance(points[i - 1], points[i]);
      var w = (tailWidth / 2 - tempLen / allLen * widthDif) / Math.sin(angle);
      var left = getThirdPoint(points[i - 1], points[i], Math.PI - angle, w, true);
      var right = getThirdPoint(points[i - 1], points[i], angle, w, false);
      leftBodyPnts.push(left);
      rightBodyPnts.push(right);
    }
    return leftBodyPnts.concat(rightBodyPnts);
  };

  DoubleArrow.prototype.getTempPoint4 = function getTempPoint4(linePnt1, linePnt2, point) {
    try {
      var midPnt = Mid(linePnt1, linePnt2);
      var len = MathDistance(midPnt, point);
      var angle = getAngleOfThreePoints(linePnt1, midPnt, point);
      var symPnt = undefined,
          distance1 = undefined,
          distance2 = undefined,
          mid = undefined;

      if (angle < HALF_PI) {
        distance1 = len * Math.sin(angle);
        distance2 = len * Math.cos(angle);
        mid = getThirdPoint(linePnt1, midPnt, HALF_PI, distance1, false);
        symPnt = getThirdPoint(midPnt, mid, HALF_PI, distance2, true);
      } else if (angle >= HALF_PI && angle < Math.PI) {
        distance1 = len * Math.sin(Math.PI - angle);
        distance2 = len * Math.cos(Math.PI - angle);
        mid = getThirdPoint(linePnt1, midPnt, HALF_PI, distance1, false);
        symPnt = getThirdPoint(midPnt, mid, HALF_PI, distance2, false);
      } else if (angle >= Math.PI && angle < Math.PI * 1.5) {
        distance1 = len * Math.sin(angle - Math.PI);
        distance2 = len * Math.cos(angle - Math.PI);
        mid = getThirdPoint(linePnt1, midPnt, HALF_PI, distance1, true);
        symPnt = getThirdPoint(midPnt, mid, HALF_PI, distance2, true);
      } else {
        distance1 = len * Math.sin(Math.PI * 2 - angle);
        distance2 = len * Math.cos(Math.PI * 2 - angle);
        mid = getThirdPoint(linePnt1, midPnt, HALF_PI, distance1, true);
        symPnt = getThirdPoint(midPnt, mid, HALF_PI, distance2, false);
      }
      return symPnt;
    } catch (e) {
      console.log(e);
    }
  };

  DoubleArrow.prototype.setMap = function setMap(map) {
    if (map && map instanceof ol.Map) {
      this.map = map;
    } else {
      throw new Error('传入的不是地图对象！');
    }
  };

  DoubleArrow.prototype.getMap = function getMap() {
    return this.map;
  };

  DoubleArrow.prototype.isPlot = function isPlot() {
    return true;
  };

  DoubleArrow.prototype.setPoints = function setPoints(value) {
    this.points = !value ? [] : value;
    if (this.points.length >= 1) {
      this.generate();
    }
  };

  DoubleArrow.prototype.getPoints = function getPoints() {
    return this.points.slice(0);
  };

  DoubleArrow.prototype.getPointCount = function getPointCount() {
    return this.points.length;
  };

  DoubleArrow.prototype.updatePoint = function updatePoint(point, index) {
    if (index >= 0 && index < this.points.length) {
      this.points[index] = point;
      this.generate();
    }
  };

  DoubleArrow.prototype.updateLastPoint = function updateLastPoint(point) {
    this.updatePoint(point, this.points.length - 1);
  };

  DoubleArrow.prototype.finishDrawing = function finishDrawing() {
    if (this.getPointCount() === 3 && this.tempPoint4 !== null) {
      this.points.push(this.tempPoint4);
    }
    if (this.connPoint !== null) {
      this.points.push(this.connPoint);
    }
  };

  return DoubleArrow;
}(ol.geom.Polygon);

var StraightArrow = function (_ol$geom$LineString) {
  inherits(StraightArrow, _ol$geom$LineString);

  function StraightArrow(coordinates, points, params) {
    classCallCheck(this, StraightArrow);

    var _this = possibleConstructorReturn(this, _ol$geom$LineString.call(this, []));

    _this.type = STRAIGHT_ARROW;
    _this.fixPointCount = 2;
    _this.maxArrowLength = 3000000;
    _this.arrowLengthScale = 5;
    _this.set('params', params);
    if (points && points.length > 0) {
      _this.setPoints(points);
    } else if (coordinates && coordinates.length > 0) {
      _this.setCoordinates(coordinates);
    }
    return _this;
  }

  StraightArrow.prototype.getPlotType = function getPlotType() {
    return this.type;
  };

  StraightArrow.prototype.generate = function generate() {
    try {
      var count = this.getPointCount();
      if (count < 2) {
        return false;
      } else {
        var pnts = this.getPoints();
        var _ref = [pnts[0], pnts[1]],
            pnt1 = _ref[0],
            pnt2 = _ref[1];

        var distance = MathDistance(pnt1, pnt2);
        var len = distance / this.arrowLengthScale;
        len = len > this.maxArrowLength ? this.maxArrowLength : len;
        var leftPnt = getThirdPoint(pnt1, pnt2, Math.PI / 6, len, false);
        var rightPnt = getThirdPoint(pnt1, pnt2, Math.PI / 6, len, true);
        this.setCoordinates([pnt1, pnt2, leftPnt, pnt2, rightPnt]);
      }
    } catch (e) {
      console.log(e);
    }
  };

  StraightArrow.prototype.setMap = function setMap(map) {
    if (map && map instanceof ol.Map) {
      this.map = map;
    } else {
      throw new Error('传入的不是地图对象！');
    }
  };

  StraightArrow.prototype.getMap = function getMap() {
    return this.map;
  };

  StraightArrow.prototype.isPlot = function isPlot() {
    return true;
  };

  StraightArrow.prototype.setPoints = function setPoints(value) {
    this.points = !value ? [] : value;
    if (this.points.length >= 1) {
      this.generate();
    }
  };

  StraightArrow.prototype.getPoints = function getPoints() {
    return this.points.slice(0);
  };

  StraightArrow.prototype.getPointCount = function getPointCount() {
    return this.points.length;
  };

  StraightArrow.prototype.updatePoint = function updatePoint(point, index) {
    if (index >= 0 && index < this.points.length) {
      this.points[index] = point;
      this.generate();
    }
  };

  StraightArrow.prototype.updateLastPoint = function updateLastPoint(point) {
    this.updatePoint(point, this.points.length - 1);
  };

  StraightArrow.prototype.finishDrawing = function finishDrawing() {};

  return StraightArrow;
}(ol.geom.LineString);

var FineArrow = function (_ol$geom$Polygon) {
  inherits(FineArrow, _ol$geom$Polygon);

  function FineArrow(coordinates, points, params) {
    classCallCheck(this, FineArrow);

    var _this = possibleConstructorReturn(this, _ol$geom$Polygon.call(this, []));

    _this.type = FINE_ARROW;
    _this.tailWidthFactor = 0.1;
    _this.neckWidthFactor = 0.2;
    _this.headWidthFactor = 0.25;
    _this.headAngle = Math.PI / 8.5;
    _this.neckAngle = Math.PI / 13;
    _this.fixPointCount = 2;
    _this.set('params', params);
    if (points && points.length > 0) {
      _this.setPoints(points);
    } else if (coordinates && coordinates.length > 0) {
      _this.setCoordinates(coordinates);
    }
    return _this;
  }

  FineArrow.prototype.getPlotType = function getPlotType() {
    return this.type;
  };

  FineArrow.prototype.generate = function generate() {
    try {
      var cont = this.getPointCount();
      if (cont < 2) {
        return false;
      } else {
        var pnts = this.getPoints();
        var _ref = [pnts[0], pnts[1]],
            pnt1 = _ref[0],
            pnt2 = _ref[1];

        var len = getBaseLength(pnts);
        var tailWidth = len * this.tailWidthFactor;
        var neckWidth = len * this.neckWidthFactor;
        var headWidth = len * this.headWidthFactor;
        var tailLeft = getThirdPoint(pnt2, pnt1, HALF_PI, tailWidth, true);
        var tailRight = getThirdPoint(pnt2, pnt1, HALF_PI, tailWidth, false);
        var headLeft = getThirdPoint(pnt1, pnt2, this.headAngle, headWidth, false);
        var headRight = getThirdPoint(pnt1, pnt2, this.headAngle, headWidth, true);
        var neckLeft = getThirdPoint(pnt1, pnt2, this.neckAngle, neckWidth, false);
        var neckRight = getThirdPoint(pnt1, pnt2, this.neckAngle, neckWidth, true);
        var pList = [tailLeft, neckLeft, headLeft, pnt2, headRight, neckRight, tailRight];
        this.setCoordinates([pList]);
      }
    } catch (e) {
      console.log(e);
    }
  };

  FineArrow.prototype.setMap = function setMap(map) {
    if (map && map instanceof ol.Map) {
      this.map = map;
    } else {
      throw new Error('传入的不是地图对象！');
    }
  };

  FineArrow.prototype.getMap = function getMap() {
    return this.map;
  };

  FineArrow.prototype.isPlot = function isPlot() {
    return true;
  };

  FineArrow.prototype.setPoints = function setPoints(value) {
    this.points = !value ? [] : value;
    if (this.points.length >= 1) {
      this.generate();
    }
  };

  FineArrow.prototype.getPoints = function getPoints() {
    return this.points.slice(0);
  };

  FineArrow.prototype.getPointCount = function getPointCount() {
    return this.points.length;
  };

  FineArrow.prototype.updatePoint = function updatePoint(point, index) {
    if (index >= 0 && index < this.points.length) {
      this.points[index] = point;
      this.generate();
    }
  };

  FineArrow.prototype.updateLastPoint = function updateLastPoint(point) {
    this.updatePoint(point, this.points.length - 1);
  };

  FineArrow.prototype.finishDrawing = function finishDrawing() {};

  return FineArrow;
}(ol.geom.Polygon);

var AssaultDirection = function (_FineArrow) {
  inherits(AssaultDirection, _FineArrow);

  function AssaultDirection(coordinates, points, params) {
    classCallCheck(this, AssaultDirection);

    var _this = possibleConstructorReturn(this, _FineArrow.call(this, coordinates, points, params));

    _this.tailWidthFactor = 0.05;
    _this.neckWidthFactor = 0.1;
    _this.headWidthFactor = 0.15;
    _this.type = ASSAULT_DIRECTION;
    _this.headAngle = Math.PI / 4;
    _this.neckAngle = Math.PI * 0.17741;
    if (points && points.length > 0) {
      _this.setPoints(points);
    } else if (coordinates && coordinates.length > 0) {
      _this.setCoordinates(coordinates);
    }
    _this.set('params', params);
    return _this;
  }

  return AssaultDirection;
}(FineArrow);

var TailedAttackArrow = function (_AttackArrow) {
  inherits(TailedAttackArrow, _AttackArrow);

  function TailedAttackArrow(coordinates, points, params) {
    classCallCheck(this, TailedAttackArrow);

    var _this = possibleConstructorReturn(this, _AttackArrow.call(this, coordinates, points, params));

    _this.type = TAILED_ATTACK_ARROW;
    _this.headHeightFactor = 0.18;
    _this.headWidthFactor = 0.3;
    _this.neckHeightFactor = 0.85;
    _this.neckWidthFactor = 0.15;
    _this.tailWidthFactor = 0.1;
    _this.headTailFactor = 0.8;
    _this.swallowTailFactor = 1;
    _this.swallowTailPnt = null;
    _this.set('params', params);
    if (points && points.length > 0) {
      _this.setPoints(points);
    } else if (coordinates && coordinates.length > 0) {
      _this.setCoordinates(coordinates);
    }
    return _this;
  }

  TailedAttackArrow.prototype.generate = function generate() {
    try {
      var points = this.getPointCount();
      if (points < 2) {
        return false;
      } else if (points === 2) {
        this.setCoordinates([this.points]);
        return false;
      } else {
        var pnts = this.getPoints();
        var _ref = [pnts[0], pnts[1]],
            tailLeft = _ref[0],
            tailRight = _ref[1];

        if (isClockWise(pnts[0], pnts[1], pnts[2])) {
          tailLeft = pnts[1];
          tailRight = pnts[0];
        }
        var midTail = Mid(tailLeft, tailRight);
        var bonePnts = [midTail].concat(pnts.slice(2));
        var headPnts = this.getArrowHeadPoints(bonePnts, tailLeft, tailRight);
        var _ref2 = [headPnts[0], headPnts[4]],
            neckLeft = _ref2[0],
            neckRight = _ref2[1];

        var tailWidth = MathDistance(tailLeft, tailRight);
        var allLen = getBaseLength(bonePnts);
        var len = allLen * this.tailWidthFactor * this.swallowTailFactor;
        this.swallowTailPnt = getThirdPoint(bonePnts[1], bonePnts[0], 0, len, true);
        var factor = tailWidth / allLen;
        var bodyPnts = this.getArrowBodyPoints(bonePnts, neckLeft, neckRight, factor);
        var count = bodyPnts.length;
        var leftPnts = [tailLeft].concat(bodyPnts.slice(0, count / 2));
        leftPnts.push(neckLeft);
        var rightPnts = [tailRight].concat(bodyPnts.slice(count / 2, count));
        rightPnts.push(neckRight);
        leftPnts = getQBSplinePoints(leftPnts);
        rightPnts = getQBSplinePoints(rightPnts);
        this.setCoordinates([leftPnts.concat(headPnts, rightPnts.reverse(), [this.swallowTailPnt, leftPnts[0]])]);
      }
    } catch (e) {
      console.log(e);
    }
  };

  return TailedAttackArrow;
}(AttackArrow);

var SquadCombat = function (_AttackArrow) {
  inherits(SquadCombat, _AttackArrow);

  function SquadCombat(coordinates, points, params) {
    classCallCheck(this, SquadCombat);

    var _this = possibleConstructorReturn(this, _AttackArrow.call(this, coordinates, points, params));

    _this.type = SQUAD_COMBAT;
    _this.headHeightFactor = 0.18;
    _this.headWidthFactor = 0.3;
    _this.neckHeightFactor = 0.85;
    _this.neckWidthFactor = 0.15;
    _this.tailWidthFactor = 0.1;
    _this.set('params', params);
    if (points && points.length > 0) {
      _this.setPoints(points);
    } else if (coordinates && coordinates.length > 0) {
      _this.setCoordinates(coordinates);
    }
    return _this;
  }

  SquadCombat.prototype.generate = function generate() {
    try {
      var count = this.getPointCount();
      if (count < 2) {
        return false;
      } else {
        var pnts = this.getPoints();
        var tailPnts = this.getTailPoints(pnts);
        var headPnts = this.getArrowHeadPoints(pnts, tailPnts[0], tailPnts[1]);
        var neckLeft = headPnts[0];
        var neckRight = headPnts[4];
        var bodyPnts = this.getArrowBodyPoints(pnts, neckLeft, neckRight, this.tailWidthFactor);
        var _count = bodyPnts.length;
        var leftPnts = [tailPnts[0]].concat(bodyPnts.slice(0, _count / 2));
        leftPnts.push(neckLeft);
        var rightPnts = [tailPnts[1]].concat(bodyPnts.slice(_count / 2, _count));
        rightPnts.push(neckRight);
        leftPnts = getQBSplinePoints(leftPnts);
        rightPnts = getQBSplinePoints(rightPnts);
        this.setCoordinates([leftPnts.concat(headPnts, rightPnts.reverse())]);
      }
    } catch (e) {
      console.log(e);
    }
  };

  SquadCombat.prototype.getTailPoints = function getTailPoints(points) {
    var allLen = getBaseLength(points);
    var tailWidth = allLen * this.tailWidthFactor;
    var tailLeft = getThirdPoint(points[1], points[0], HALF_PI, tailWidth, false);
    var tailRight = getThirdPoint(points[1], points[0], HALF_PI, tailWidth, true);
    return [tailLeft, tailRight];
  };

  return SquadCombat;
}(AttackArrow);

var TailedSquadCombat = function (_AttackArrow) {
  inherits(TailedSquadCombat, _AttackArrow);

  function TailedSquadCombat(coordinates, points, params) {
    classCallCheck(this, TailedSquadCombat);

    var _this = possibleConstructorReturn(this, _AttackArrow.call(this, coordinates, points, params));

    _this.type = TAILED_SQUAD_COMBAT;
    _this.headHeightFactor = 0.18;
    _this.headWidthFactor = 0.3;
    _this.neckHeightFactor = 0.85;
    _this.neckWidthFactor = 0.15;
    _this.tailWidthFactor = 0.1;
    _this.swallowTailFactor = 1;
    _this.swallowTailPnt = null;
    _this.fixPointCount = 2;
    _this.set('params', params);
    if (points && points.length > 0) {
      _this.setPoints(points);
    } else if (coordinates && coordinates.length > 0) {
      _this.setCoordinates(coordinates);
    }
    return _this;
  }

  TailedSquadCombat.prototype.generate = function generate() {
    try {
      var count = this.getPointCount();
      if (count < 2) {
        return false;
      } else {
        var pnts = this.getPoints();
        var tailPnts = this.getTailPoints(pnts);
        var headPnts = this.getArrowHeadPoints(pnts, tailPnts[0], tailPnts[2]);
        var neckLeft = headPnts[0];
        var neckRight = headPnts[4];
        var bodyPnts = this.getArrowBodyPoints(pnts, neckLeft, neckRight, this.tailWidthFactor);
        var _count = bodyPnts.length;
        var leftPnts = [tailPnts[0]].concat(bodyPnts.slice(0, _count / 2));
        leftPnts.push(neckLeft);
        var rightPnts = [tailPnts[2]].concat(bodyPnts.slice(_count / 2, _count));
        rightPnts.push(neckRight);
        leftPnts = getQBSplinePoints(leftPnts);
        rightPnts = getQBSplinePoints(rightPnts);
        this.setCoordinates([leftPnts.concat(headPnts, rightPnts.reverse(), [tailPnts[1], leftPnts[0]])]);
      }
    } catch (e) {
      console.log(e);
    }
  };

  TailedSquadCombat.prototype.getTailPoints = function getTailPoints(points) {
    var allLen = getBaseLength(points);
    var tailWidth = allLen * this.tailWidthFactor;
    var tailLeft = getThirdPoint(points[1], points[0], HALF_PI, tailWidth, false);
    var tailRight = getThirdPoint(points[1], points[0], HALF_PI, tailWidth, true);
    var len = tailWidth * this.swallowTailFactor;
    var swallowTailPnt = getThirdPoint(points[1], points[0], 0, len, true);
    return [tailLeft, swallowTailPnt, tailRight];
  };

  return TailedSquadCombat;
}(AttackArrow);

var GatheringPlace = function (_ol$geom$Polygon) {
  inherits(GatheringPlace, _ol$geom$Polygon);

  function GatheringPlace(coordinates, points, params) {
    classCallCheck(this, GatheringPlace);

    var _this = possibleConstructorReturn(this, _ol$geom$Polygon.call(this, []));

    _this.type = GATHERING_PLACE;
    _this.t = 0.4;
    _this.fixPointCount = 3;
    _this.set('params', params);
    if (points && points.length > 0) {
      _this.setPoints(points);
    } else if (coordinates && coordinates.length > 0) {
      _this.setCoordinates(coordinates);
    }
    return _this;
  }

  GatheringPlace.prototype.getPlotType = function getPlotType() {
    return this.type;
  };

  GatheringPlace.prototype.generate = function generate() {
    var pnts = this.getPoints();
    var points = this.getPointCount();
    if (pnts.length < 2) {
      return false;
    } else {
      if (points === 2) {
        var _mid = Mid(pnts[0], pnts[1]);
        var d = MathDistance(pnts[0], _mid) / 0.9;
        var pnt = getThirdPoint(pnts[0], _mid, HALF_PI, d, true);
        pnts = [pnts[0], pnt, pnts[1]];
      }
      var mid = Mid(pnts[0], pnts[2]);
      pnts.push(mid, pnts[0], pnts[1]);
      var normals = [],
          pnt1 = undefined,
          pnt2 = undefined,
          pnt3 = undefined,
          pList = [];

      for (var i = 0; i < pnts.length - 2; i++) {
        pnt1 = pnts[i];
        pnt2 = pnts[i + 1];
        pnt3 = pnts[i + 2];
        var normalPoints = getBisectorNormals(this.t, pnt1, pnt2, pnt3);
        normals = normals.concat(normalPoints);
      }
      var count = normals.length;
      normals = [normals[count - 1]].concat(normals.slice(0, count - 1));
      for (var _i = 0; _i < pnts.length - 2; _i++) {
        pnt1 = pnts[_i];
        pnt2 = pnts[_i + 1];
        pList.push(pnt1);
        for (var t = 0; t <= FITTING_COUNT; t++) {
          var _pnt = getCubicValue(t / FITTING_COUNT, pnt1, normals[_i * 2], normals[_i * 2 + 1], pnt2);
          pList.push(_pnt);
        }
        pList.push(pnt2);
      }
      this.setCoordinates([pList]);
    }
  };

  GatheringPlace.prototype.setMap = function setMap(map) {
    if (map && map instanceof ol.Map) {
      this.map = map;
    } else {
      throw new Error('传入的不是地图对象！');
    }
  };

  GatheringPlace.prototype.getMap = function getMap() {
    return this.map;
  };

  GatheringPlace.prototype.isPlot = function isPlot() {
    return true;
  };

  GatheringPlace.prototype.setPoints = function setPoints(value) {
    this.points = !value ? [] : value;
    if (this.points.length >= 1) {
      this.generate();
    }
  };

  GatheringPlace.prototype.getPoints = function getPoints() {
    return this.points.slice(0);
  };

  GatheringPlace.prototype.getPointCount = function getPointCount() {
    return this.points.length;
  };

  GatheringPlace.prototype.updatePoint = function updatePoint(point, index) {
    if (index >= 0 && index < this.points.length) {
      this.points[index] = point;
      this.generate();
    }
  };

  GatheringPlace.prototype.updateLastPoint = function updateLastPoint(point) {
    this.updatePoint(point, this.points.length - 1);
  };

  GatheringPlace.prototype.finishDrawing = function finishDrawing() {};

  return GatheringPlace;
}(ol.geom.Polygon);

var RectFlag = function (_ol$geom$Polygon) {
  inherits(RectFlag, _ol$geom$Polygon);

  function RectFlag(coordinates, points, params) {
    classCallCheck(this, RectFlag);

    var _this = possibleConstructorReturn(this, _ol$geom$Polygon.call(this, []));

    _this.type = RECTFLAG;
    _this.fixPointCount = 2;
    _this.set('params', params);
    if (points && points.length > 0) {
      _this.setPoints(points);
    } else if (coordinates && coordinates.length > 0) {
      _this.setCoordinates(coordinates);
    }
    return _this;
  }

  RectFlag.prototype.getPlotType = function getPlotType() {
    return this.type;
  };

  RectFlag.prototype.generate = function generate() {
    var count = this.getPointCount();
    if (count < 2) {
      return false;
    } else {
      this.setCoordinates([this.calculatePonits(this.points)]);
    }
  };

  RectFlag.prototype.calculatePonits = function calculatePonits(points) {
    var components = [];

    if (points.length > 1) {
      var startPoint = points[0];

      var endPoint = points[points.length - 1];
      var point1 = [endPoint[0], startPoint[1]];
      var point2 = [endPoint[0], (startPoint[1] + endPoint[1]) / 2];
      var point3 = [startPoint[0], (startPoint[1] + endPoint[1]) / 2];
      var point4 = [startPoint[0], endPoint[1]];
      components = [startPoint, point1, point2, point3, point4];
    }
    return components;
  };

  RectFlag.prototype.setMap = function setMap(map) {
    if (map && map instanceof ol.Map) {
      this.map = map;
    } else {
      throw new Error('传入的不是地图对象！');
    }
  };

  RectFlag.prototype.getMap = function getMap() {
    return this.map;
  };

  RectFlag.prototype.isPlot = function isPlot() {
    return true;
  };

  RectFlag.prototype.setPoints = function setPoints(value) {
    this.points = !value ? [] : value;
    if (this.points.length >= 1) {
      this.generate();
    }
  };

  RectFlag.prototype.getPoints = function getPoints() {
    return this.points.slice(0);
  };

  RectFlag.prototype.getPointCount = function getPointCount() {
    return this.points.length;
  };

  RectFlag.prototype.updatePoint = function updatePoint(point, index) {
    if (index >= 0 && index < this.points.length) {
      this.points[index] = point;
      this.generate();
    }
  };

  RectFlag.prototype.updateLastPoint = function updateLastPoint(point) {
    this.updatePoint(point, this.points.length - 1);
  };

  RectFlag.prototype.finishDrawing = function finishDrawing() {};

  return RectFlag;
}(ol.geom.Polygon);

var TriangleFlag = function (_ol$geom$Polygon) {
  inherits(TriangleFlag, _ol$geom$Polygon);

  function TriangleFlag(coordinates, points, params) {
    classCallCheck(this, TriangleFlag);

    var _this = possibleConstructorReturn(this, _ol$geom$Polygon.call(this, []));

    _this.type = TRIANGLEFLAG;
    _this.fixPointCount = 2;
    _this.set('params', params);
    if (points && points.length > 0) {
      _this.setPoints(points);
    } else if (coordinates && coordinates.length > 0) {
      _this.setCoordinates(coordinates);
    }
    return _this;
  }

  TriangleFlag.prototype.getPlotType = function getPlotType() {
    return this.type;
  };

  TriangleFlag.prototype.generate = function generate() {
    var count = this.getPointCount();
    if (count < 2) {
      return false;
    } else {
      this.setCoordinates([this.calculatePonits(this.points)]);
    }
  };

  TriangleFlag.prototype.calculatePonits = function calculatePonits(points) {
    var components = [];

    if (points.length > 1) {
      var startPoint = points[0];

      var endPoint = points[points.length - 1];
      var point1 = [endPoint[0], (startPoint[1] + endPoint[1]) / 2];
      var point2 = [startPoint[0], (startPoint[1] + endPoint[1]) / 2];
      var point3 = [startPoint[0], endPoint[1]];
      components = [startPoint, point1, point2, point3];
    }
    return components;
  };

  TriangleFlag.prototype.setMap = function setMap(map) {
    if (map && map instanceof ol.Map) {
      this.map = map;
    } else {
      throw new Error('传入的不是地图对象！');
    }
  };

  TriangleFlag.prototype.getMap = function getMap() {
    return this.map;
  };

  TriangleFlag.prototype.isPlot = function isPlot() {
    return true;
  };

  TriangleFlag.prototype.setPoints = function setPoints(value) {
    this.points = !value ? [] : value;
    if (this.points.length >= 1) {
      this.generate();
    }
  };

  TriangleFlag.prototype.getPoints = function getPoints() {
    return this.points.slice(0);
  };

  TriangleFlag.prototype.getPointCount = function getPointCount() {
    return this.points.length;
  };

  TriangleFlag.prototype.updatePoint = function updatePoint(point, index) {
    if (index >= 0 && index < this.points.length) {
      this.points[index] = point;
      this.generate();
    }
  };

  TriangleFlag.prototype.updateLastPoint = function updateLastPoint(point) {
    this.updatePoint(point, this.points.length - 1);
  };

  TriangleFlag.prototype.finishDrawing = function finishDrawing() {};

  return TriangleFlag;
}(ol.geom.Polygon);

var CurveFlag = function (_ol$geom$Polygon) {
  inherits(CurveFlag, _ol$geom$Polygon);

  function CurveFlag(coordinates, points, params) {
    classCallCheck(this, CurveFlag);

    var _this = possibleConstructorReturn(this, _ol$geom$Polygon.call(this, []));

    _this.type = CURVEFLAG;
    _this.fixPointCount = 2;
    _this.set('params', params);
    if (points && points.length > 0) {
      _this.setPoints(points);
    } else if (coordinates && coordinates.length > 0) {
      _this.setCoordinates(coordinates);
    }
    return _this;
  }

  CurveFlag.prototype.getPlotType = function getPlotType() {
    return this.type;
  };

  CurveFlag.prototype.generate = function generate() {
    var count = this.getPointCount();
    if (count < 2) {
      return false;
    } else {
      this.setCoordinates([this.calculatePonits(this.points)]);
    }
  };

  CurveFlag.prototype.calculatePonits = function calculatePonits(points) {
    var components = [];

    if (points.length > 1) {
      var startPoint = points[0];

      var endPoint = points[points.length - 1];

      var point1 = startPoint;

      var point2 = [(endPoint[0] - startPoint[0]) / 4 + startPoint[0], (endPoint[1] - startPoint[1]) / 8 + startPoint[1]];

      var point3 = [(startPoint[0] + endPoint[0]) / 2, startPoint[1]];

      var point4 = [(endPoint[0] - startPoint[0]) * 3 / 4 + startPoint[0], -(endPoint[1] - startPoint[1]) / 8 + startPoint[1]];

      var point5 = [endPoint[0], startPoint[1]];

      var point6 = [endPoint[0], (startPoint[1] + endPoint[1]) / 2];

      var point7 = [(endPoint[0] - startPoint[0]) * 3 / 4 + startPoint[0], (endPoint[1] - startPoint[1]) * 3 / 8 + startPoint[1]];

      var point8 = [(startPoint[0] + endPoint[0]) / 2, (startPoint[1] + endPoint[1]) / 2];

      var point9 = [(endPoint[0] - startPoint[0]) / 4 + startPoint[0], (endPoint[1] - startPoint[1]) * 5 / 8 + startPoint[1]];

      var point10 = [startPoint[0], (startPoint[1] + endPoint[1]) / 2];

      var point11 = [startPoint[0], endPoint[1]];

      var curve1 = getBezierPoints([point1, point2, point3, point4, point5]);

      var curve2 = getBezierPoints([point6, point7, point8, point9, point10]);

      components = curve1.concat(curve2);
      components.push(point11);
    }
    return components;
  };

  CurveFlag.prototype.setMap = function setMap(map) {
    if (map && map instanceof ol.Map) {
      this.map = map;
    } else {
      throw new Error('传入的不是地图对象！');
    }
  };

  CurveFlag.prototype.getMap = function getMap() {
    return this.map;
  };

  CurveFlag.prototype.isPlot = function isPlot() {
    return true;
  };

  CurveFlag.prototype.setPoints = function setPoints(value) {
    this.points = !value ? [] : value;
    if (this.points.length >= 1) {
      this.generate();
    }
  };

  CurveFlag.prototype.getPoints = function getPoints() {
    return this.points.slice(0);
  };

  CurveFlag.prototype.getPointCount = function getPointCount() {
    return this.points.length;
  };

  CurveFlag.prototype.updatePoint = function updatePoint(point, index) {
    if (index >= 0 && index < this.points.length) {
      this.points[index] = point;
      this.generate();
    }
  };

  CurveFlag.prototype.updateLastPoint = function updateLastPoint(point) {
    this.updatePoint(point, this.points.length - 1);
  };

  CurveFlag.prototype.finishDrawing = function finishDrawing() {};

  return CurveFlag;
}(ol.geom.Polygon);



var Geometry = Object.freeze({
	Point: Point,
	Pennant: Pennant,
	Polyline: Polyline,
	Arc: Arc,
	Circle: Circle,
	Curve: Curve,
	FreeHandLine: FreeHandLine,
	RectAngle: RectAngle,
	Ellipse: Ellipse,
	Lune: Lune,
	Sector: Sector,
	ClosedCurve: ClosedCurve,
	Polygon: Polygon,
	FreePolygon: FreePolygon,
	AttackArrow: AttackArrow,
	DoubleArrow: DoubleArrow,
	StraightArrow: StraightArrow,
	FineArrow: FineArrow,
	AssaultDirection: AssaultDirection,
	TailedAttackArrow: TailedAttackArrow,
	SquadCombat: SquadCombat,
	TailedSquadCombat: TailedSquadCombat,
	GatheringPlace: GatheringPlace,
	RectFlag: RectFlag,
	TriangleFlag: TriangleFlag,
	CurveFlag: CurveFlag,
	PlotTextBox: PlotTextBox
});

var $DrawInteraction = ol.interaction.Draw;
var $Style$1 = ol.style.Style;
var $Icon = ol.style.Icon;
var $Stroke$1 = ol.style.Stroke;
var $Fill$1 = ol.style.Fill;

var PlotDraw = function (_Observable) {
  inherits(PlotDraw, _Observable);

  function PlotDraw(map, params) {
    classCallCheck(this, PlotDraw);

    var _this = possibleConstructorReturn(this, _Observable.call(this));

    if (map && map instanceof ol.Map) {
      _this.map = map;
    } else {
      throw new Error('传入的不是地图对象！');
    }
    _this.options = params || {};

    _this.points = null;

    _this.plot = null;

    _this.feature = null;

    _this.plotType = null;

    _this.plotParams = null;

    _this.mapViewport = _this.map.getViewport();

    _this.dblClickZoomInteraction = null;

    _this.drawInteraction_ = null;

    _this.layerName = _this.options && _this.options['layerName'] ? _this.options['layerName'] : BASE_LAYERNAME;

    _this.drawLayer = createVectorLayer(_this.map, _this.layerName, {
      create: true
    });
    _this.drawLayer.setZIndex(_this.options['zIndex'] || 99);
    return _this;
  }

  PlotDraw.prototype.createPlot = function createPlot(type, points, _params) {
    var params = _params || {};
    switch (type) {
      case TEXTAREA:
        return 'TextArea';
      case POINT:
        return new Point([], points, params);
      case PENNANT:
        return new Pennant([], points, params);
      case POLYLINE:
        return new Polyline([], points, params);
      case ARC:
        return new Arc([], points, params);
      case CIRCLE:
        return new Circle([], points, params);
      case CURVE:
        return new Curve([], points, params);
      case FREEHANDLINE:
        return new FreeHandLine([], points, params);
      case RECTANGLE:
        return new RectAngle([], points, params);
      case ELLIPSE:
        return new Ellipse([], points, params);
      case LUNE:
        return new Lune([], points, params);
      case SECTOR:
        return new Sector([], points, params);
      case CLOSED_CURVE:
        return new ClosedCurve([], points, params);
      case POLYGON:
        return new Polygon([], points, params);
      case ATTACK_ARROW:
        return new AttackArrow([], points, params);
      case FREE_POLYGON:
        return new FreePolygon([], points, params);
      case DOUBLE_ARROW:
        return new DoubleArrow([], points, params);
      case STRAIGHT_ARROW:
        return new StraightArrow([], points, params);
      case FINE_ARROW:
        return new FineArrow([], points, params);
      case ASSAULT_DIRECTION:
        return new AssaultDirection([], points, params);
      case TAILED_ATTACK_ARROW:
        return new TailedAttackArrow([], points, params);
      case SQUAD_COMBAT:
        return new SquadCombat([], points, params);
      case TAILED_SQUAD_COMBAT:
        return new TailedSquadCombat([], points, params);
      case GATHERING_PLACE:
        return new GatheringPlace([], points, params);
      case RECTFLAG:
        return new RectFlag([], points, params);
      case TRIANGLEFLAG:
        return new TriangleFlag([], points, params);
      case CURVEFLAG:
        return new CurveFlag([], points, params);
    }
    return null;
  };

  PlotDraw.prototype.active = function active(type) {
    var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    this.disActive();
    this.deactiveMapTools();
    this.plotType = type;
    this.plotParams = params;
    if (type === TEXTAREA) {
      this.activeInteraction();
    } else if (Object.keys(PlotTypes).some(function (key) {
      return PlotTypes[key] === type;
    })) {
      this.map.on('click', this.mapFirstClickHandler, this);
    } else {
      console.warn('不存在的标绘类型！');
    }
  };

  PlotDraw.prototype.activeInteraction = function activeInteraction() {
    this.drawInteraction_ = new $DrawInteraction({
      style: new $Style$1({
        fill: new $Fill$1({
          color: 'rgba(255, 255, 255, 0.7)'
        }),
        stroke: new $Stroke$1({
          color: 'rgba(0, 0, 0, 0.15)',
          width: 2
        }),
        image: new $Icon({
          anchor: [1, 1],
          anchorXUnits: 'fraction',
          anchorYUnits: 'fraction',
          opacity: 0.75,
          src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABgklEQVQ4T41T0W3CQAy1lfwRqR0h/CE5UhkBJmiZADpB0wlKJwA2aDegE5QR+Igl/noj9OPuLydXPuXQEYUKS5FyPvvd87ONRDRFxEdr7c4Y8ws3WFmW90VRvIjIF1ZVtQaANxH59N6v8zwvRaQEgCMATDu88I+Ipm1bk2XZHhEfAOAdFW00Gh2YOQafOeidHoaYEdGHc65GDZhMJuXpdDJ99hqkPmZe9e9iTgCoqmrWNM0hDerq/FGftXbcZxFzAgARrZg5vBaNiGpE3OhZRF6Zedu7DzkRYMrMKlQKYBBRQVVgw8zj3n3IGWSg9ESkds6tiqJQbe4AYJ6WGVkPAqh4+romdP9LbXMqZh/gXIKqm+d5EK9vbduOY7d0AAdL6AYLmqbRAQtGRMc4ONF/wSC2RF/PsuwbABapqLEjKqb3fq4sLtoYh6Lbiydr7TbtuwYDgH5qB9XmPEjdKG+Y+Xmo7ms+Lcs5N0uX6ei9X9y4TGtEXIZlukb7PzbdmNcisv8DtQILak2vZsYAAAAASUVORK5CYII='
        })
      }),
      type: 'Circle',
      geometryFunction: $DrawInteraction.createBox()
    });
    this.map.addInteraction(this.drawInteraction_);
    this.drawInteraction_.on('drawend', this.textAreaDrawEnd, this);
  };

  PlotDraw.prototype.textAreaDrawEnd = function textAreaDrawEnd(event) {
    if (event && event.feature) {
      this.map.removeInteraction(this.drawInteraction_);
      var extent = event.feature.getGeometry().getExtent();
      var _center = [(extent[0] + extent[2]) / 2, (extent[1] + extent[3]) / 2];
      var topLeft = this.map.getPixelFromCoordinate([extent[0], extent[1]]);
      var bottomRight = this.map.getPixelFromCoordinate([extent[2], extent[3]]);
      var _ref = [Math.abs(topLeft[0] - bottomRight[0]), Math.abs(topLeft[1] - bottomRight[1])],
          _width = _ref[0],
          _height = _ref[1];

      var _plotText = new PlotTextBox({
        id: getuuid(),
        position: _center,
        value: '',
        width: _width,
        height: _height,
        style: {
          width: _width + 'px',
          height: _height + 'px'
        }
      });
      if (this.map && this.map instanceof ol.Map && _plotText) {
        this.map.addOverlay(_plotText);
      } else {
        console.warn('未传入地图对象或者plotText创建失败！');
      }
    } else {
      console.info('未获取到要素！');
    }
  };

  PlotDraw.prototype.disActive = function disActive() {
    this.removeEventHandlers();
    if (this.drawInteraction_) {
      this.map.removeInteraction(this.drawInteraction_);
      this.drawInteraction_ = null;
    }
    this.points = [];
    this.plot = null;
    this.feature = null;
    this.plotType = null;
    this.plotParams = null;
    this.activateMapTools();
  };

  PlotDraw.prototype.isDrawing = function isDrawing() {
    return !!this.plotType;
  };

  PlotDraw.prototype.mapFirstClickHandler = function mapFirstClickHandler(event) {
    this.map.un('click', this.mapFirstClickHandler, this);
    this.points.push(event.coordinate);
    this.plot = this.createPlot(this.plotType, this.points, this.plotParams);
    this.feature = new ol.Feature(this.plot);
    this.feature.set('isPlot', true);
    this.drawLayer.getSource().addFeature(this.feature);
    if (this.plotType === POINT || this.plotType === PENNANT) {
      this.plot.finishDrawing();
      this.drawEnd(event);
    } else {
      this.map.on('click', this.mapNextClickHandler, this);
      if (!this.plot.freehand) {
        this.map.on('dblclick', this.mapDoubleClickHandler, this);
      }
      this.map.un('pointermove', this.mapMouseMoveHandler, this);
      this.map.on('pointermove', this.mapMouseMoveHandler, this);
    }
    if (this.plotType && this.feature) {
      this.plotParams['plotType'] = this.plotType;
      this.feature.setProperties(this.plotParams);
    }
  };

  PlotDraw.prototype.mapNextClickHandler = function mapNextClickHandler(event) {
    if (!this.plot.freehand) {
      if (MathDistance(event.coordinate, this.points[this.points.length - 1]) < 0.0001) {
        return false;
      }
    }
    this.points.push(event.coordinate);
    this.plot.setPoints(this.points);
    if (this.plot.fixPointCount === this.plot.getPointCount()) {
      this.mapDoubleClickHandler(event);
    }
    if (this.plot && this.plot.freehand) {
      this.mapDoubleClickHandler(event);
    }
  };

  PlotDraw.prototype.mapDoubleClickHandler = function mapDoubleClickHandler(event) {
    event.preventDefault();
    this.plot.finishDrawing();
    this.drawEnd(event);
  };

  PlotDraw.prototype.mapMouseMoveHandler = function mapMouseMoveHandler(event) {
    var coordinate = event.coordinate;
    if (MathDistance(coordinate, this.points[this.points.length - 1]) < 0.0001) {
      return false;
    }
    if (!this.plot.freehand) {
      var pnts = this.points.concat([coordinate]);
      this.plot.setPoints(pnts);
    } else {
      this.points.push(coordinate);
      this.plot.setPoints(this.points);
    }
  };

  PlotDraw.prototype.removeEventHandlers = function removeEventHandlers() {
    this.map.un('click', this.mapFirstClickHandler, this);
    this.map.un('click', this.mapNextClickHandler, this);
    this.map.un('pointermove', this.mapMouseMoveHandler, this);
    this.map.un('dblclick', this.mapDoubleClickHandler, this);
  };

  PlotDraw.prototype.drawEnd = function drawEnd(event) {
    this.dispatchSync('drawEnd', {
      type: 'drawEnd',
      originalEvent: event,
      feature: this.feature
    });
    if (this.feature && this.options['isClear']) {
      this.drawLayer.getSource().removeFeature(this.feature);
    }
    this.disActive();
  };

  PlotDraw.prototype.addFeature = function addFeature() {
    this.feature = new ol.Feature(this.plot);
    if (this.feature && this.drawLayer) {
      this.drawLayer.getSource().addFeature(this.feature);
    }
  };

  PlotDraw.prototype.deactiveMapTools = function deactiveMapTools() {
    var _this2 = this;

    var interactions = this.map.getInteractions().getArray();
    interactions.every(function (item) {
      if (item instanceof ol.interaction.DoubleClickZoom) {
        _this2.dblClickZoomInteraction = item;
        _this2.map.removeInteraction(item);
        return false;
      } else {
        return true;
      }
    });
  };

  PlotDraw.prototype.activateMapTools = function activateMapTools() {
    if (this.dblClickZoomInteraction && this.dblClickZoomInteraction instanceof ol.interaction.DoubleClickZoom) {
      this.map.addInteraction(this.dblClickZoomInteraction);
      this.dblClickZoomInteraction = null;
    }
  };

  return PlotDraw;
}(Observable);

var PlotEdit = function (_Observable) {
  inherits(PlotEdit, _Observable);

  function PlotEdit(map) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    classCallCheck(this, PlotEdit);

    var _this = possibleConstructorReturn(this, _Observable.call(this));

    if (map && map instanceof ol.Map) {
      _this.map = map;
    } else {
      throw new Error('传入的不是地图对象！');
    }

    _this.options = options;

    _this.mapViewport = _this.map.getViewport();

    _this.activePlot = null;

    _this.startPoint = null;

    _this.ghostControlPoints = null;

    _this.controlPoints = null;

    _this.mouseOver = false;

    _this.elementTable = {};

    _this.activeControlPointId = null;

    _this.mapDragPan = null;

    _this.previousCursor_ = null;
    return _this;
  }

  PlotEdit.prototype.initHelperDom = function initHelperDom() {
    var _this2 = this;

    if (!this.map || !this.activePlot) {
      return false;
    }
    var parent = this.getMapParentElement();
    if (!parent) {
      return false;
    } else {
      var hiddenDiv = createHidden('div', parent, BASE_HELP_HIDDEN);
      var cPnts = this.getControlPoints();
      if (cPnts && Array.isArray(cPnts) && cPnts.length > 0) {
        cPnts.forEach(function (item, index) {
          var id = BASE_HELP_CONTROL_POINT_ID + '-' + index;
          create('div', BASE_HELP_CONTROL_POINT_ID, hiddenDiv, id);
          _this2.elementTable[id] = index;
        });
      }
    }
  };

  PlotEdit.prototype.getMapParentElement = function getMapParentElement() {
    var mapElement = this.map.getTargetElement();
    if (!mapElement) {
      return false;
    } else {
      return mapElement.parentNode;
    }
  };

  PlotEdit.prototype.destroyHelperDom = function destroyHelperDom() {
    var _this3 = this;

    if (this.controlPoints && Array.isArray(this.controlPoints) && this.controlPoints.length > 0) {
      this.controlPoints.forEach(function (item, index) {
        if (item && item instanceof ol.Overlay) {
          _this3.map.removeOverlay(item);
        }
        var element = getElement(BASE_HELP_CONTROL_POINT_ID + '-' + index);
        if (element) {
          off(element, 'mousedown', _this3.controlPointMouseDownHandler.bind(_this3));
          off(element, 'mousemove', _this3.controlPointMouseMoveHandler2.bind(_this3));
        }
      });
      this.controlPoints = [];
    }
    var parent = this.getMapParentElement();
    var hiddenDiv = getElement(BASE_HELP_HIDDEN);
    if (hiddenDiv && parent) {
      remove(hiddenDiv, parent);
    }
  };

  PlotEdit.prototype.initControlPoints = function initControlPoints() {
    this.controlPoints = [];
    var cPnts = this.getControlPoints();
    if (cPnts && Array.isArray(cPnts) && cPnts.length > 0) {
      if (cPnts.length > this.options['limitControlPoints'] && this.options.hasOwnProperty('limitControlPoints') && this.options['limitControlPoints'] > 2) {
        var _n = Math.floor(cPnts.length / (this.options['limitControlPoints'] - 2)) || 1;
        for (var i = 0; i < this.options['limitControlPoints'] - 2; i++) {
          var _index = (i + 1) * _n - 1;
          this._addControlPoint(cPnts, _index);
        }
        this._addControlPoint(cPnts, 0);
        this._addControlPoint(cPnts, cPnts.length - 1);
      } else {
        for (var _i = 0; _i < cPnts.length; _i++) {
          this._addControlPoint(cPnts, _i);
        }
      }
      this.map.render();
    }
  };

  PlotEdit.prototype._addControlPoint = function _addControlPoint(points, _index) {
    var id = BASE_HELP_CONTROL_POINT_ID + '-' + _index;
    this.elementTable[id] = _index;
    var element = getElement(id);
    var pnt = new ol.Overlay({
      id: id,
      position: points[_index],
      positioning: 'center-center',
      element: element
    });
    this.controlPoints.push(pnt);
    this.map.addOverlay(pnt);
    on(element, 'mousedown', this.controlPointMouseDownHandler.bind(this));
    on(element, 'mousemove', this.controlPointMouseMoveHandler2.bind(this));
  };

  PlotEdit.prototype.controlPointMouseMoveHandler2 = function controlPointMouseMoveHandler2(e) {
    e.stopImmediatePropagation();
  };

  PlotEdit.prototype.controlPointMouseDownHandler = function controlPointMouseDownHandler(e) {
    this.activeControlPointId = e.target.id;
    this.map.on('pointermove', this.controlPointMouseMoveHandler, this);
    on(this.mapViewport, 'mouseup', this.controlPointMouseUpHandler.bind(this));
  };

  PlotEdit.prototype.controlPointMouseMoveHandler = function controlPointMouseMoveHandler(event) {
    var coordinate = event.coordinate;
    if (this.activeControlPointId) {
      var plot = this.activePlot.getGeometry();
      var index = this.elementTable[this.activeControlPointId];
      plot.updatePoint(coordinate, index);
      var overlay = this.map.getOverlayById(this.activeControlPointId);
      if (overlay) {
        overlay.setPosition(coordinate);
      }
    }
  };

  PlotEdit.prototype.controlPointMouseUpHandler = function controlPointMouseUpHandler(event) {
    this.map.un('pointermove', this.controlPointMouseMoveHandler, this);
    off(this.mapViewport, 'mouseup', this.controlPointMouseUpHandler.bind(this));
  };

  PlotEdit.prototype.activate = function activate(plot) {
    var _this4 = this;

    if (plot && plot instanceof ol.Feature && plot.get('isPlot') && plot.getGeometry().isPlot && plot !== this.activePlot) {
      this.deactivate();
      this.activePlot = plot;
      this.previousCursor_ = this.map.getTargetElement().style.cursor;
      window.setTimeout(function () {
        _this4.dispatch('active_plot_change', _this4.activePlot);
      }, 500);
      this.map.on('pointermove', this.plotMouseOverOutHandler, this);
      this.initHelperDom();
      this.initControlPoints();
    }
  };

  PlotEdit.prototype.getControlPoints = function getControlPoints() {
    var points = [];
    if (this.activePlot) {
      var geom = this.activePlot.getGeometry();
      if (geom) {
        points = geom.getPoints();
      }
    }
    return points;
  };

  PlotEdit.prototype.plotMouseOverOutHandler = function plotMouseOverOutHandler(e) {
    var feature = this.map.forEachFeatureAtPixel(e.pixel, function (feature) {
      return feature;
    });
    if (feature && feature === this.activePlot) {
      if (!this.mouseOver) {
        this.mouseOver = true;
        this.map.getTargetElement().style.cursor = 'move';
        this.map.on('pointerdown', this.plotMouseDownHandler, this);
      }
    } else {
      if (this.mouseOver) {
        this.mouseOver = false;
        this.map.getTargetElement().style.cursor = 'default';
        this.map.un('pointerdown', this.plotMouseDownHandler, this);
      }
    }
    return feature;
  };

  PlotEdit.prototype.plotMouseDownHandler = function plotMouseDownHandler(event) {
    this.ghostControlPoints = this.getControlPoints();
    this.startPoint = event.coordinate;
    this.disableMapDragPan();
    this.map.on('pointerup', this.plotMouseUpHandler, this);
    this.map.on('pointerdrag', this.plotMouseMoveHandler, this);
  };

  PlotEdit.prototype.plotMouseMoveHandler = function plotMouseMoveHandler(event) {
    var deltaX = event.coordinate[0] - this.startPoint[0],
        deltaY = event.coordinate[1] - this.startPoint[1],
        newPoints = [];

    if (this.ghostControlPoints && Array.isArray(this.ghostControlPoints) && this.ghostControlPoints.length > 0) {
      for (var i = 0; i < this.ghostControlPoints.length; i++) {
        var coordinate = [this.ghostControlPoints[i][0] + deltaX, this.ghostControlPoints[i][1] + deltaY];
        newPoints.push(coordinate);
        var id = BASE_HELP_CONTROL_POINT_ID + '-' + i;
        var overlay = this.map.getOverlayById(id);
        if (overlay) {
          overlay.setPosition(coordinate);
          overlay.setPositioning('center-center');
        }
      }
    }
    var _geometry = this.activePlot.getGeometry();
    _geometry.setPoints(newPoints);
  };

  PlotEdit.prototype.plotMouseUpHandler = function plotMouseUpHandler(event) {
    this.enableMapDragPan();
    this.map.un('pointerup', this.plotMouseUpHandler, this);
    this.map.un('pointerdrag', this.plotMouseMoveHandler, this);
  };

  PlotEdit.prototype.disconnectEventHandlers = function disconnectEventHandlers() {
    this.map.un('pointermove', this.plotMouseOverOutHandler, this);
    this.map.un('pointermove', this.controlPointMouseMoveHandler, this);
    off(this.mapViewport, 'mouseup', this.controlPointMouseUpHandler.bind(this));
    this.map.un('pointerdown', this.plotMouseDownHandler, this);
    this.map.un('pointerup', this.plotMouseUpHandler, this);
    this.map.un('pointerdrag', this.plotMouseMoveHandler, this);
  };

  PlotEdit.prototype.deactivate = function deactivate() {
    this.activePlot = null;
    this.mouseOver = false;
    this.map.getTargetElement().style.cursor = this.previousCursor_;
    this.previousCursor_ = null;
    this.destroyHelperDom();
    this.disconnectEventHandlers();
    this.enableMapDragPan();
    this.elementTable = {};
    this.activeControlPointId = null;
    this.startPoint = null;
  };

  PlotEdit.prototype.disableMapDragPan = function disableMapDragPan() {
    var _this5 = this;

    var interactions = this.map.getInteractions().getArray();
    interactions.every(function (item) {
      if (item instanceof ol.interaction.DragPan) {
        _this5.mapDragPan = item;
        _this5.map.removeInteraction(item);
        return false;
      } else {
        return true;
      }
    });
  };

  PlotEdit.prototype.enableMapDragPan = function enableMapDragPan() {
    if (this.mapDragPan && this.mapDragPan instanceof ol.interaction.DragPan) {
      this.map.addInteraction(this.mapDragPan);
      this.mapDragPan = null;
    }
  };

  PlotEdit.getLimitControlPoints = function getLimitControlPoints(points, limit) {
    var _coordinates = [];
    if (points && points.length > 0) {
      var _n = Math.floor(points.length / limit) || 1;
      for (var i = 0; i < limit; i++) {
        _coordinates.push(points[(i + 1) * _n - 1]);
      }
    }
    return _coordinates;
  };

  return PlotEdit;
}(Observable);

var StyleFactory = function StyleFactory(options) {
  var option = options && (typeof options === 'undefined' ? 'undefined' : _typeof(options)) === 'object' ? options : {};
  var style = new ol.style.Style({});
  if (option['geometry'] && option['geometry'] instanceof ol.geom.Geometry) {
    style.setGeometry(option['geometry']);
  }
  if (option['zIndex'] && typeof option['zIndex'] === 'number') {
    style.setZIndex(option['zIndex']);
  }
  if (option['fill'] && _typeof(option['fill']) === 'object') {
    style.setFill(this._getFill(option['fill']));
  }
  if (option['image'] && _typeof(option['image']) === 'object') {
    style.setImage(this._getImage(option['image']));
  }
  if (option['stroke'] && _typeof(option['stroke']) === 'object') {
    style.setStroke(this._getStroke(option['stroke']));
  }
  if (option['text'] && _typeof(option['text']) === 'object') {
    style.setText(this._getText(option['text']));
  }
  return style;
};

StyleFactory.prototype._getRegularShape = function (options) {
  try {
    var regularShape = new ol.style.RegularShape({
      fill: this._getFill(options['fill']) || undefined,
      points: typeof options['points'] === 'number' ? options['points'] : 1,
      radius: typeof options['radius'] === 'number' ? options['radius'] : undefined,
      radius1: typeof options['radius1'] === 'number' ? options['radius1'] : undefined,
      radius2: typeof options['radius2'] === 'number' ? options['radius2'] : undefined,
      angle: typeof options['angle'] === 'number' ? options['angle'] : 0,
      snapToPixel: typeof options['snapToPixel'] === 'boolean' ? options['snapToPixel'] : true,
      stroke: this._getStroke(options['stroke']) || undefined,
      rotation: typeof options['rotation'] === 'number' ? options['rotation'] : 0,
      rotateWithView: typeof options['rotateWithView'] === 'boolean' ? options['rotateWithView'] : false,
      atlasManager: options['atlasManager'] ? options['atlasManager'] : undefined
    });
    return regularShape;
  } catch (e) {
    console.log(e);
  }
};

StyleFactory.prototype._getImage = function (options) {
  try {
    var image = void 0;
    options = options || {};
    if (options['type'] === 'icon') {
      image = this._getIcon(options['image']);
    } else {
      image = this._getRegularShape(options['image']);
    }
    return image;
  } catch (e) {
    console.log(e);
  }
};

StyleFactory.prototype._getIcon = function (options) {
  try {
    options = options || {};
    var icon = new ol.style.Icon({
      anchor: options['imageAnchor'] ? options['imageAnchor'] : [0.5, 0.5],
      anchorXUnits: options['imageAnchorXUnits'] ? options['imageAnchorXUnits'] : 'fraction',
      anchorYUnits: options['imageAnchorYUnits'] ? options['imageAnchorYUnits'] : 'fraction',
      anchorOrigin: options['imageAnchorOrigin'] ? options['imageAnchorYUnits'] : 'top-left',
      color: options['imageColor'] ? options['imageColor'] : undefined,
      crossOrigin: options['crossOrigin'] ? options['crossOrigin'] : undefined,
      img: options['img'] ? options['img'] : undefined,
      offset: options['offset'] && Array.isArray(options['offset']) && options['offset'].length === 2 ? options['offset'] : [0, 0],
      offsetOrigin: options['offsetOrigin'] ? options['offsetOrigin'] : 'top-left',
      scale: typeof options['scale'] === 'number' ? options['scale'] : 1,
      snapToPixel: typeof options['snapToPixel'] === 'boolean' ? options['snapToPixel'] : true,
      rotateWithView: typeof options['rotateWithView'] === 'boolean' ? options['rotateWithView'] : false,
      opacity: typeof options['imageOpacity'] === 'number' ? options['imageOpacity'] : 1,
      rotation: typeof options['imageRotation'] === 'number' ? options['imageRotation'] : 0,
      size: options['size'] && Array.isArray(options['size']) && options['size'].length === 2 ? options['size'] : undefined,
      imgSize: options['imgSize'] && Array.isArray(options['imgSize']) && options['imgSize'].length === 2 ? options['imgSize'] : undefined,
      src: options['imageSrc'] ? options['imageSrc'] : undefined
    });
    return icon;
  } catch (error) {
    console.log(error);
  }
};

StyleFactory.prototype._getStroke = function (options) {
  try {
    options = options || {};
    var stroke = new ol.style.Stroke({
      color: options['strokeColor'] ? options['strokeColor'] : undefined,
      lineCap: options['strokeLineCap'] && typeof options['strokeLineCap'] === 'string' ? options['strokeLineCap'] : 'round',
      lineJoin: options['strokeLineJoin'] && typeof options['strokeLineJoin'] === 'string' ? options['strokeLineJoin'] : 'round',
      lineDash: options['strokeLineDash'] ? options['strokeLineDash'] : undefined,
      lineDashOffset: typeof options['strokeLineDashOffset'] === 'number' ? options['strokeLineDashOffset'] : '0',
      miterLimit: typeof options['strokeMiterLimit'] === 'number' ? options['strokeMiterLimit'] : 10,
      width: typeof options['strokeWidth'] === 'number' ? options['strokeWidth'] : undefined
    });
    return stroke;
  } catch (error) {
    console.log(error);
  }
};

StyleFactory.prototype._getText = function (options) {
  try {
    var text = new ol.style.Text({
      font: options['textFont'] && typeof options['textFont'] === 'string' ? options['textFont'] : '10px sans-serif',
      offsetX: typeof options['textOffsetX'] === 'number' ? options['textOffsetX'] : 0,
      offsetY: typeof options['textOffsetY'] === 'number' ? options['textOffsetY'] : 0,
      scale: typeof options['textScale'] === 'number' ? options['textScale'] : undefined,
      rotation: typeof options['textRotation'] === 'number' ? options['textRotation'] : 0,
      text: options['text'] && typeof options['text'] === 'string' ? options['text'] : undefined,
      textAlign: options['textAlign'] && typeof options['textAlign'] === 'string' ? options['textAlign'] : 'start',
      textBaseline: options['textBaseline'] && typeof options['textBaseline'] === 'string' ? options['textBaseline'] : 'alphabetic',
      rotateWithView: typeof options['rotateWithView'] === 'boolean' ? options['rotateWithView'] : false,
      fill: this._getFill(options['textFill']),
      stroke: this._getStroke(options['textStroke'])
    });
    return text;
  } catch (error) {
    console.log(error);
  }
};

StyleFactory.prototype._getFill = function (options) {
  try {
    options = options || {};
    var fill = new ol.style.Fill({
      color: options['fillColor'] ? options['fillColor'] : undefined
    });
    return fill;
  } catch (error) {
    console.log(error);
  }
};

var PlotUtils = function () {
  function PlotUtils(map, options) {
    classCallCheck(this, PlotUtils);

    if (map && map instanceof ol.Map) {
      this.map = map;
    } else {
      throw new Error('传入的不是地图对象！');
    }

    this.options = options;
    this.layerName = this.options && this.options['layerName'] ? this.options['layerName'] : BASE_LAYERNAME;
  }

  PlotUtils.prototype.getBaseStyle = function getBaseStyle(feature) {
    var style = feature.getStyle();
    if (!style) {
      var layer = getLayerByLayerName(this.map, this.layerName);
      if (layer && layer instanceof ol.layer.Vector) {
        style = layer.getStyle();
      } else {
        return false;
      }
    }
    return style;
  };

  PlotUtils.prototype.setIcon = function setIcon(feature, image) {
    try {
      if (feature && feature instanceof ol.Feature) {
        var style = this.getBaseStyle(feature);
        var tempStyle = style.clone();
        var _image = this._getImage(image);
        if (_image) {
          tempStyle.setImage(_image);
          feature.setStyle(tempStyle);
        }
      }
    } catch (e) {
      console.warn(e);
    }
  };

  PlotUtils.prototype.setBackgroundColor = function setBackgroundColor(feature, backgroundColor) {
    try {
      if (feature && feature instanceof ol.Feature) {
        var style = this.getBaseStyle(feature);
        var tempStyle = style.clone();
        var fill = tempStyle.getFill();
        var color = fill.getColor();
        if (color) {
          var tempColor = ol.color.asArray(color);
          var _color = ol.color.asArray(backgroundColor);
          var currentColor = this.handleBackgroundColor(_color, tempColor[3]);
          fill.setColor(currentColor);
          feature.setStyle(tempStyle);
        }
      }
    } catch (e) {
      console.warn(e);
    }
  };

  PlotUtils.prototype.setOpacity = function setOpacity(feature, opacity) {
    try {
      if (feature && feature instanceof ol.Feature) {
        var style = this.getBaseStyle(feature);
        if (style) {
          var tempStyle = style.clone();
          var fill = tempStyle.getFill();
          var color = fill.getColor();
          if (color) {
            var tempColor = ol.color.asArray(color);
            tempColor[3] = opacity;
            var currentColor = 'rgba(' + tempColor.join(',') + ')';
            fill.setColor(currentColor);
            feature.setStyle(tempStyle);
          }
        }
      }
    } catch (e) {
      console.warn(e);
    }
  };

  PlotUtils.prototype.setBorderColor = function setBorderColor(feature, borderColor) {
    try {
      if (feature && feature instanceof ol.Feature) {
        var style = this.getBaseStyle(feature);
        var tempStyle = style.clone();
        var stroke = tempStyle.getStroke();
        stroke.setColor(borderColor);
        feature.setStyle(tempStyle);
      }
    } catch (e) {
      console.warn(e);
    }
  };

  PlotUtils.prototype.setBorderWidth = function setBorderWidth(feature, borderWidth) {
    try {
      if (feature && feature instanceof ol.Feature) {
        var style = this.getBaseStyle(feature);
        var tempStyle = style.clone();
        var stroke = tempStyle.getStroke();
        stroke.setWidth(borderWidth);
        feature.setStyle(tempStyle);
      }
    } catch (e) {
      console.warn(e);
    }
  };

  PlotUtils.prototype.handleBackgroundColor = function handleBackgroundColor(color, opacity) {
    try {
      if (!opacity) opacity = 1;
      var tempColor = ol.color.asArray(color);
      tempColor[3] = opacity;
      return 'rgba(' + tempColor.join(',') + ')';
    } catch (e) {
      console.warn(e);
    }
  };

  PlotUtils.prototype.getColor = function getColor(color) {
    try {
      var colorTarget = ol.color.asArray(color);
      return ol.color.asString(colorTarget);
    } catch (e) {
      console.warn(e);
    }
  };

  PlotUtils.prototype.fixObject = function fixObject(obj) {
    if (obj && (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'object') {
      for (var key in obj) {
        if (key && typeof obj[key] === 'undefined') {
          delete obj[key];
        }
      }
    }
    return obj;
  };

  PlotUtils.prototype.getStroke_ = function getStroke_(style) {
    var stroke = null;
    if (style) {
      var olStyle_ = style.getStroke();
      if (olStyle_) {
        stroke = {};
        stroke['strokeColor'] = this.getColor(olStyle_.getColor());
        stroke['strokeWidth'] = olStyle_.getWidth();
        stroke['strokeLineDash'] = olStyle_.getLineDash();
        stroke['lineDashOffset'] = olStyle_.getLineDashOffset();
        stroke['strokeLineCap'] = olStyle_.getLineCap();
        stroke['strokeLineJoin'] = olStyle_.getLineJoin();
        stroke['strokeMiterLimit'] = olStyle_.getMiterLimit();
      }
    }
    return this.fixObject(stroke);
  };

  PlotUtils.prototype.getFill_ = function getFill_(style) {
    var fill = null;
    if (style) {
      var olStyle_ = style.getFill();
      if (olStyle_) {
        fill = {};
        var color = olStyle_.getColor();
        fill['fillColor'] = this.getColor(color);
      }
    }
    return this.fixObject(fill);
  };

  PlotUtils.prototype.getText_ = function getText_(style) {
    var text = null;
    if (style) {
      var olStyle_ = style.getText();
      if (olStyle_) {
        text = {};
        text['textFont'] = olStyle_.getFont();
        text['textOffsetX'] = olStyle_.getOffsetX();
        text['textOffsetY'] = olStyle_.getOffsetY();
        text['textScale'] = olStyle_.getScale();
        text['textRotation'] = olStyle_.getRotation();
        text['text'] = olStyle_.getText();
        text['textAlign'] = olStyle_.getTextAlign();
        text['textBaseline'] = olStyle_.getTextBaseline();
        text['rotateWithView'] = olStyle_.getRotateWithView();
        text['textFill'] = this.getFill_(olStyle_);
        text['textStroke'] = this.getStroke_(olStyle_);
      }
    }
    return this.fixObject(text);
  };

  PlotUtils.prototype.getImage_ = function getImage_(style) {
    var image = null;
    if (style) {
      var olStyle_ = style.getImage();
      if (olStyle_) {
        image = {};
        if (olStyle_ instanceof ol.style.Icon) {
          image['type'] = 'icon';
          image['image'] = {};
          image['image']['imageAnchor'] = olStyle_.getAnchor();
          image['image']['imageColor'] = olStyle_.getColor();
          image['image']['imageSrc'] = olStyle_.getSrc();
          image['image']['imgSize'] = olStyle_.getSize();
          image['image']['scale'] = olStyle_.getScale();
          image['image']['imageRotation'] = olStyle_.getRotation();
          image['image']['rotateWithView'] = olStyle_.getRotateWithView();
          image['image']['imageOpacity'] = olStyle_.getOpacity();
          image['image']['snapToPixel'] = olStyle_.getSnapToPixel();
          image['image']['offset'] = olStyle_.getOrigin();
        } else if (olStyle_ instanceof ol.style.RegularShape) {
          image['type'] = '';
          image['image'] = {};
          image['image']['fill'] = this.getFill_(olStyle_);
          image['image']['points'] = olStyle_.getPoints();
          image['image']['radius'] = olStyle_.getRadius();
          image['image']['radius2'] = olStyle_.getRadius2();
          image['image']['angle'] = olStyle_.getAngle();
          image['image']['stroke'] = this.getStroke_(olStyle_);
          image['image']['rotateWithView'] = olStyle_.getRotateWithView();
          image['image']['snapToPixel'] = olStyle_.getSnapToPixel();
        }
      }
    }
    return this.fixObject(image);
  };

  PlotUtils.prototype.getStyleCode = function getStyleCode(feature) {
    try {
      if (feature && feature instanceof ol.Feature) {
        var style = this.getBaseStyle(feature);
        if (style && style instanceof ol.style.Style) {
          var fill = this.getFill_(style);
          var _ref = [1, null],
              opacity = _ref[0],
              rgbaArray = _ref[1],
              backgroundColor = _ref[2];

          if (fill && fill['fillColor']) {
            rgbaArray = ol.color.asArray(fill['fillColor']);
            opacity = parseFloat(rgbaArray[3]);
            if (rgbaArray && typeof opacity === 'number') {
              backgroundColor = this.handleBackgroundColor(ol.color.asString(rgbaArray), opacity);
            }
          }

          var stroke = this.getStroke_(style);

          var text = this.getText_(style);

          var icon = this.getImage_(style);
          return {
            fill: {
              fillColor: backgroundColor,
              opacity: opacity
            },
            stroke: stroke,
            image: icon,
            text: text
          };
        }
      }
    } catch (e) {
      console.warn(e);
    }
  };

  PlotUtils.prototype.removeAllFeatures = function removeAllFeatures() {
    var layer = getLayerByLayerName(this.map, this.layerName);
    var overlays_ = this.map.getOverlays().getArray();
    if (layer) {
      var source = layer.getSource();
      source.clear();
    }
    if (overlays_ && overlays_.length > 0) {
      var len = overlays_.length;
      for (var i = 0; i < len; i++) {
        if (overlays_[i] && overlays_[i].get('isPlotText')) {
          this.map.removeOverlay(overlays_[i]);
          i--;
        }
      }
    }
  };

  PlotUtils.prototype.getFeatures = function getFeatures() {
    var _this = this;

    var rFeatures = [];
    var layer = getLayerByLayerName(this.map, this.layerName);
    if (layer) {
      var source = layer.getSource();
      if (source && source instanceof ol.source.Vector) {
        var features = source.getFeatures();
        if (features && features.length > 0) {
          features.forEach(function (feature, index) {
            if (feature && feature.getGeometry) {
              var geom = feature.getGeometry();
              if (geom && geom.getCoordinates) {
                var type = geom.getType();
                var coordinates = geom.getCoordinates();
                rFeatures.push({
                  'type': 'Feature',
                  'geometry': {
                    'type': type,
                    'coordinates': coordinates
                  },
                  'properties': {
                    'type': feature.getGeometry().getPlotType(),
                    'style': _this.getStyleCode(feature),
                    'points': feature.getGeometry().getPoints()
                  }
                });
              }
            }
          });
        }
      }
    }
    var overlays_ = this.map.getOverlays().getArray();
    overlays_.forEach(function (overlay) {
      if (overlay.get('isPlotText')) {
        var style_ = overlay.getStyle();
        style_['width'] = overlay.getWidth() + 'px';
        style_['height'] = overlay.getHeight() + 'px';
        rFeatures.push({
          'type': 'Feature',
          'geometry': {
            'type': 'PlotText',
            'coordinates': overlay.getPosition()
          },
          'properties': {
            'id': overlay.getId(),
            'width': overlay.getWidth(),
            'height': overlay.getHeight(),
            'style': style_,
            'value': overlay.getValue()
          }
        });
      }
    });
    return rFeatures;
  };

  PlotUtils.prototype.addFeatures = function addFeatures(features) {
    var _this2 = this;

    if (features && Array.isArray(features) && features.length > 0) {
      var layer = getLayerByLayerName(this.map, this.layerName);
      if (!layer) {
        layer = createVectorLayer(this.map, this.layerName, {
          create: true
        });
        layer.setZIndex(this.options['zIndex'] || 99);
      }
      if (layer) {
        var source = layer.getSource();
        if (source && source instanceof ol.source.Vector) {
          var _extents = [];
          features.forEach(function (feature) {
            if (feature && feature['geometry'] && feature['geometry']['type'] !== 'PlotText') {
              if (feature['properties']['type'] && Geometry[feature['properties']['type']]) {
                var feat = new ol.Feature({
                  geometry: new Geometry[feature['properties']['type']]([], feature['properties']['points'], feature['properties'])
                });
                feat.set('isPlot', true);
                _extents.push(feat.getGeometry().getExtent());
                if (feature['properties']['style']) {
                  var style_ = new StyleFactory(feature['properties']['style']);
                  if (style_) {
                    feat.setStyle(style_);
                  }
                }
                source.addFeature(feat);
              } else {
                console.warn('不存在的标绘类型！');
              }
            } else if (feature && feature['geometry'] && feature['geometry']['type'] === 'PlotText') {
              _extents.push(new ol.geom.Point(feature.geometry['coordinates']).getExtent());
              var _plotText = new PlotTextBox({
                id: feature.properties.id,
                position: feature.geometry['coordinates'],
                width: feature.properties['width'],
                height: feature.properties['height'],
                value: feature.properties['value'],
                style: feature.properties.style
              });
              if (_this2.map && _this2.map instanceof ol.Map && _plotText) {
                _this2.map.addOverlay(_plotText);
              } else {
                console.warn('未传入地图对象或者plotText创建失败！');
              }
            }
          });
          if (this.options['zoomToExtent'] && _extents && _extents.length > 0) {
            var _extent = this._getExtent(_extents);
            var size = this.map.getSize();
            var _view = this.map.getView();
            _view.fit(_extent, {
              size: size,
              duration: 800,
              maxZoom: _view.getMaxZoom() || undefined
            });
          }
        }
      }
    }
  };

  PlotUtils.prototype._getExtent = function _getExtent(extents) {
    var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var bbox = [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY];
    var _extent = extents.reduce(function (prev, coord) {
      return [Math.min(coord[0], prev[0]), Math.min(coord[1], prev[1]), Math.max(coord[2], prev[2]), Math.max(coord[3], prev[3])];
    }, bbox);
    var size = ol.extent.getSize(_extent);
    var adjust = typeof params['adjust'] === 'number' ? params['adjust'] : 0.2;
    var minWidth = typeof params['minWidth'] === 'number' ? params['minWidth'] : 0.05;
    var minHeight = typeof params['minHeight'] === 'number' ? params['minHeight'] : 0.05;
    if (size[0] <= minWidth || size[1] <= minHeight) {
      var bleft = ol.extent.getBottomLeft(_extent);
      var tright = ol.extent.getTopRight(_extent);
      var xmin = bleft[0] - adjust;
      var ymin = bleft[1] - adjust;
      var xmax = tright[0] + adjust;
      var ymax = tright[1] + adjust;
      _extent = ol.extent.buffer([xmin, ymin, xmax, ymax], adjust);
    }
    return _extent;
  };

  return PlotUtils;
}();

var olPlot = function olPlot(map, options) {
  classCallCheck(this, olPlot);

  this.plotDraw = new PlotDraw(map, options);
  this.plotEdit = new PlotEdit(map, options);
  this.plotUtils = new PlotUtils(map, options);
};

olPlot.PlotTypes = PlotTypes;
olPlot.Geometry = Geometry;

return olPlot;

})));
