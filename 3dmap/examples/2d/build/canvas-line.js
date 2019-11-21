(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.TrackLine = factory());
}(this, (function () { 'use strict';

var tool = {
    //计算两点间距离
    getDistance: function getDistance(p1, p2) {
        return Math.sqrt((p1[0] - p2[0]) * (p1[0] - p2[0]) + (p1[1] - p2[1]) * (p1[1] - p2[1]));
    }
};

var global = typeof window === 'undefined' ? {} : window;

var requestAnimationFrame = global.requestAnimationFrame || global.mozRequestAnimationFrame || global.webkitRequestAnimationFrame || global.msRequestAnimationFrame || function (callback) {
    return global.setTimeout(callback, 1000 / 60);
};

var TrackLine = function TrackLine(userOptions) {
    //全局参数
    var self = this,
        canvas = document.getElementById('myCanvas'),
        context = canvas.getContext('2d'),
        width = canvas.width || window.innerWidth,
        height = canvas.height || window.innerHeight,
        lines = []; //所有线条
    canvas.style.cssText = "position:absolute;" + "left:0;" + "top:0;" + "z-index:0;user-select:none;";

    //默认参数
    var options = {
        lineWidth: 1,
        strokeStyle: '#fff',
        isShowLine: true,
        isAnimate: true,
        radius: 2,
        speed: 1
    };

    //参数合并
    var merge = function merge(userOptions, options) {
        Object.keys(userOptions).forEach(function (key) {
            options[key] = userOptions[key];
        });
    };

    //线条
    function Line(options) {
        this.options = options;
        this.fillStyle = options.fillStyle;
        this.turnPoints = options.turnPoints || []; //[[50,50],[150,250],[400,650]]
        this.step = 0;
        this.pointList = options.pointList || this.getPointList();
    }

    Line.prototype.getPointList = function () {
        var turnPoints = this.turnPoints;
        var pointList = this.pointList = [];
        if (turnPoints.length < 2) {
            return [];
        }
        for (var i = 0; i < turnPoints.length; i++) {
            var start = turnPoints[i];
            var end = turnPoints[i + 1];
            if (start && end) {
                var distance = Math.floor(tool.getDistance(start, end));
                var vx = (end[0] - start[0]) / distance;
                var vy = (end[1] - start[1]) / distance;
                for (var j = 0; j < distance; j++) {
                    pointList.push([start[0] + vx * j, start[1] + vy * j]);
                }
            }
        }
    };

    Line.prototype.draw = function (context) {
        var pointList = this.turnPoints;
        if (pointList.length >= 2) {
            context.save();
            context.beginPath();
            context.lineWidth = options.lineWidth;
            context.strokeStyle = options.strokeStyle;
            for (var i = 0; i < pointList.length; i++) {
                var x = pointList[i][0];
                var y = pointList[i][1];
                if (i == 0) {
                    context.moveTo(x, y);
                } else {
                    context.lineTo(x, y);
                }
            }
            context.stroke();
            context.restore();
        }
    };

    Line.prototype.drawMoveCircle = function (context) {
        var pointList = this.pointList || this.getPointList();

        context.save();
        context.fillStyle = this.fillStyle;
        // context.shadowColor = options.shadowColor;
        // context.shadowBlur = options.shadowBlur;
        context.beginPath();
        context.arc(pointList[this.step][0], pointList[this.step][1], options.radius, 0, Math.PI * 2, true);
        context.fill();
        context.closePath();
        context.restore();
        this.step += options.speed;
        if (this.step >= pointList.length) {
            this.step = 0;
        }
    };

    //初始化线条
    var createLine = function createLine() {
        var lines = self.lines = [];
        for (var i = 0; i < options.data.length; i++) {
            lines.push(new Line(options.data[i]));
        }
    };

    //渲染
    var render = function render() {
        context.fillStyle = 'rgba(0,0,0,.9)';
        var prev = context.globalCompositeOperation;
        context.globalCompositeOperation = 'destination-in';
        context.fillRect(0, 0, width, height);
        context.globalCompositeOperation = prev;

        var lines = self.lines;
        // //静态背景线条渲染
        // for (var i = 0; i < lines.length; i++) {
        //     lines[i].draw(context);
        // }
        //动画渲染
        for (var j = 0; j < lines.length; j++) {
            lines[j].drawMoveCircle(context); //移动圆点
        }
    };

    //初始化
    var init = function init(options) {
        merge(userOptions, options);

        createLine();

        (function drawFrame() {
            requestAnimationFrame(drawFrame);
            render();
        })();
    };

    init(options);
    self.options = options;
};

return TrackLine;

})));
