/**
 * @author https://github.com/chengquan223
 * @Date 2016-11-26
 */
(function () {
    var ctx, width, height;
    (function () {
        'use strict';

        var vendors = ['webkit', 'moz'];
        for (var i = 0; i < vendors.length && !window.requestAnimationFrame; ++i) {
            var vp = vendors[i];
            window.requestAnimationFrame = window[vp + 'RequestAnimationFrame'];
            window.cancelAnimationFrame = window[vp + 'CancelAnimationFrame'] || window[vp + 'CancelRequestAnimationFrame'];
        }
        if (/iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent) // iOS6 is buggy
            ||
            !window.requestAnimationFrame || !window.cancelAnimationFrame) {
            var lastTime = 0;
            window.requestAnimationFrame = function (callback) {
                var now = Date.now();
                var nextTime = Math.max(lastTime + 16, now);
                return setTimeout(function () {
                    callback(lastTime = nextTime);
                }, nextTime - now);
            };
            window.cancelAnimationFrame = clearTimeout;
        }
    })();

    function Star(options) {
        this.x = options.x;
        this.y = options.y;
        this.radius = options.radius;
        this.color = options.color;
    }

    Star.prototype.draw = function () {
        ctx.save();
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
        ctx.restore();
    }

    function Planet(x, y, w, h, radius) {
        this.x = x;
        this.y = y;
        this.w = w; //长轴
        this.h = h; //短轴
        this.r = radius;
        this.color = '#' + ('00000' + (Math.random() * 0x1000000 << 0).toString(16)).slice(-6); //随机颜色
    }
    Planet.prototype.draw = function () {
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255,255,255,.6)';
        ctx.fillStyle = this.color;
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
        ctx.restore();
    }

    Planet.prototype.drawEllipse = function (x, y, w, h) {
        var kappa = 0.5522848,
            ox = (w / 2) * kappa, // control point offset horizontal
            oy = (h / 2) * kappa, // control point offset vertical
            xs = x - w / 2, // x-start
            ys = y - h / 2, // y-start
            xe = x + w / 2, // x-end
            ye = y + h / 2; // y-end
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(92,130,169,' + painter.opacity + ')';
        ctx.shadowBlur = 5;
        ctx.shadowColor = "#6BFFFF";
        ctx.moveTo(xs, y);
        ctx.bezierCurveTo(xs, y - oy, x - ox, ys, x, ys);
        ctx.bezierCurveTo(x + ox, ys, xe, y - oy, xe, y);
        ctx.bezierCurveTo(xe, y + oy, x + ox, ye, x, ye);
        ctx.bezierCurveTo(x - ox, ye, xs, y + oy, xs, y);
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
    }

    var painter = {
        amount: 8,
        distance: 40,
        initCanvas: function () {
            var canvas = document.createElement('canvas');
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            ctx = canvas.getContext('2d');
            document.body.appendChild(canvas);
        },
        setCenterPlanet: function () {
            var _x = width / 2,
                _y = height / 2;
            this.centerX = parseInt(width / 2);
            this.centerY = parseInt(height / 2);
            this.w = 100;
            this.h = 25;
        },
        initPlanet: function () {
            this.planets = [];
            var amount = this.amount,
                distance = this.distance;
            for (var i = 0; i < amount; i++) {
                var planet = new Planet(this.centerX, this.centerY, this.w + distance * 2 * i, this.h + distance * i, i + 1);
                planet.time = Math.random()*3;
                planet.interval = Math.random() * (0.01 - 0.001) + 0.001;
                this.planets.push(planet);
            }
        },
        drawStars: function () {
            if (this.starList) {
                for (var i = 0, j = this.starList.length; i < j; i++) {
                    var star = this.starList[i];
                    star.draw();
                }
            } else {
                this.starList = [];
                for (var i = 0; i < 150; i++) {
                    this.starList.push(new Star({
                        x: Math.random() * width,
                        y: Math.random() * height,
                        radius: Math.random() * 2,
                        color: 'rgba(92,130,169,' + Math.random() + ')'
                    }));
                }
            }
        },
        drawMiddlePlanet: function () {
            var middleStar = new Star({
                x: this.centerX,
                y: this.centerY,
                radius: 2,
                color: 'red'
            });
            middleStar.draw();
        },
        drawTrajectory: function () {
            this.opacity = 0.2;
            for (var i = 0; i < this.planets.length; i++) {
                var planet = this.planets[i];
                planet.drawEllipse(this.centerX, this.centerY, planet.w, planet.h);
                this.opacity += .08;
            }
        },
        arcRoute: function () {
            ctx.clearRect(0, 0, width, height);
            this.drawStars(); //星星
            this.drawTrajectory(); //行星轨迹
            this.drawMiddlePlanet(); //中心星球
            for (var i = 0; i < this.planets.length; i++) {
                var planet = this.planets[i];
                planet.x = this.centerX + planet.w / 2 * Math.cos(planet.time);
                planet.y = this.centerY + planet.h / 2 * Math.sin(planet.time);
                planet.r = 4 + i;
                // planet.color = '#6BFFFF';
                planet.draw();
                planet.time += planet.interval;
            }
            requestAnimationFrame(function () {
                painter.arcRoute();
            });
        },
        init: function () {
            this.initCanvas();
            this.setCenterPlanet();
            this.initPlanet();
            painter.arcRoute();
        }
    };
    painter.init();
})();