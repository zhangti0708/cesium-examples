/**
 * @author https://github.com/chengquan223
 * @Date 2017-02-16
 */
(function () {
    //全局变量
    var canvas, ctx, w, h, centerX, centerY;
    var imgOut = document.createElement('img'),
        imgIn = document.createElement('img');
    imgOut.src = 'https://zos.alipayobjects.com/rmsportal/JorDDgUVJljaIxDBpiBM.png';
    imgIn.src = 'https://zos.alipayobjects.com/rmsportal/uIbqAshSeUuRPrRXNOrN.png';

    var initCanvas = function () {
        canvas = document.createElement('canvas');
        ctx = canvas.getContext('2d');
        w = canvas.width = document.body.clientWidth;
        h = canvas.height = 560;
        centerX = w / 2;
        centerY = h / 2;
        canvas.id = 'myCanvas';
        document.getElementById('canvasWrapper').appendChild(canvas);
    };

    function Circle(x, y, r) {
        this.x = x;
        this.y = y;
        this.r = r;
    }

    Circle.prototype = {
        draw: function () {
            ctx.save();
            ctx.lineWidth = '.6';
            ctx.strokeStyle = '#2123C0';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        },
        birthPoint: function (isLeft) {
            var angle = 180;
            if (isLeft) {
                angle = -angle;
            }
            angle = Math.floor(Math.random() * +angle);
            return {
                x: Math.floor(this.x + Math.sin(angle * Math.PI / 180) * (this.r + (Math.random() * 15) + 5)),
                y: Math.floor(this.y + Math.cos(angle * Math.PI / 180) * (this.r + (Math.random() * 15) + 5))
            };
        }
    };

    function Point(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 5 + 7;
        this.opacity = Math.random() * 0.25 + 0.1;
        this.t = 0;
        this.interval = Math.random() * 0.2 + 0.01;
        // this.d = Math.floor(Math.random() * 300 + 100);
        this.isRun = true;
    }

    Point.prototype = {
        draw: function () {
            ctx.save();
            ctx.globalAlpha = this.opacity;
            ctx.translate(this.x, this.y);
            ctx.rotate(0 * Math.PI / 180);
            ctx.drawImage(imgOut, -this.size / 2, -this.size / 2, this.size, this.size); //用图片代替粒子，效率更高
            ctx.restore();
        },
        relive: function () {
            var radius = pointLayer.circle.r,
                distance = 220,
                gap = 20,
                x = Math.floor(Math.random() * ((centerX - radius - gap) - (centerX - radius - gap - distance)) + centerX - radius - gap - distance),
                y = Math.floor(Math.random() * ((centerY + 5) - (centerY - 10)) + centerY - 10);
            if (Math.random() > 0.5) {
                x = Math.floor(Math.random() * ((centerX + radius + gap + distance) - (centerX + radius + gap)) + centerX + radius + gap);
            }
            return new Point(x, y);
        }
    };

    function Wave() {
        this.width = w;
        this.height = 150;
        this.K = 2;
        this.F = 3;
        this.MAX = (this.height / 2) - 4;
        this.noise = Math.min(50, 1) * this.MAX;
    }

    Wave.prototype = {
        _createLines: function () {
            var lines = this.lines = [],
                noise = Math.min(50, 1) * this.MAX;
            lines.push({
                phase: 25,
                speed: 0.045,
                attenuation: 3.8,
                color: 'rgba(103,174,245,.75)',
                width: .55,
                distance: 0
            }, {
                phase: 5,
                speed: 0.035,
                attenuation: 8,
                color: 'rgba(132,219,86,.65)',
                width: .45,
                distance: 30
            }, {
                phase: 140,
                speed: 0.045,
                attenuation: 3.5,
                color: 'rgba(140,87,255,.85)',
                width: .55,
                distance: 140
            }, {
                phase: 160,
                speed: 0.045,
                attenuation: 4.5,
                color: 'rgba(245,139,192,0.71)',
                width: .55,
                distance: 40
            });
        },
        _globalAttenuationFn: function (x) {
            return Math.pow(this.K * 4 / (this.K * 4 + Math.pow(x, 4)), this.K * 4);
        },
        _draw: function (line) {
            line.phase = (line.phase + line.speed) % (Math.PI * 64);
            ctx.moveTo(100, 0);
            ctx.beginPath();
            ctx.save();
            ctx.strokeStyle = line.color;
            ctx.lineWidth = line.width || .1;
            var x, y;
            for (var i = -this.K; i <= this.K; i += 0.03) {
                x = Math.floor(this.width * ((i + this.K) / (this.K * 4)) + w / 4);
                y = Math.floor(h / 2 + this.noise * this._globalAttenuationFn(i) * (1 / line.attenuation) * Math.sin(this.F * i - line.phase));
                ctx.lineTo(x, y);
            }
            ctx.stroke();
            ctx.restore();
        },
        render: function () {
            var self = this;
            self.lines.forEach(function (line) {
                self._draw(line);
            });
        },
        start: function () {
            this._createLines();
        }
    };

    var Tween = {
        Quad: {
            easeIn: function (t, b, c, d) {
                return c * (t /= d) * t + b;
            },
            easeOut: function (t, b, c, d) {
                return -c * (t /= d) * (t - 2) + b;
            },
            easeInOut: function (t, b, c, d) {
                if ((t /= d / 2) < 1) return c / 2 * t * t + b;
                return -c / 2 * ((--t) * (t - 2) - 1) + b;
            }
        },
        Cubic: {
            easeIn: function (t, b, c, d) {
                return c * (t /= d) * t * t + b;
            },
            easeOut: function (t, b, c, d) {
                return c * ((t = t / d - 1) * t * t + 1) + b;
            },
            easeInOut: function (t, b, c, d) {
                if ((t /= d / 2) < 1) return c / 2 * t * t * t + b;
                return c / 2 * ((t -= 2) * t * t + 2) + b;
            }
        },
        Quart: {
            easeIn: function (t, b, c, d) {
                return c * (t /= d) * t * t * t + b;
            },
            easeOut: function (t, b, c, d) {
                return -c * ((t = t / d - 1) * t * t * t - 1) + b;
            },
            easeInOut: function (t, b, c, d) {
                if ((t /= d / 2) < 1) return c / 2 * t * t * t * t + b;
                return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
            }
        },
    };

    //运动点层
    var pointLayer = {
        init: function () {
            var points = this.points = [];
            this.circle = new Circle(w / 2, h / 2, 100);
            for (var i = 0; i < 200; i++) {
                var random = Math.floor(Math.random() * ((w / 2 + w / 4) - (w / 2 - w / 4)) + (w / 2 - w / 4)),
                    point = new Point(random, centerY),
                    isLeft = random < this.circle.x,
                    endPoint = this.circle.birthPoint(isLeft);
                point.ex = endPoint.x;
                point.ey = endPoint.y;
                point.d = Math.random() * 100 + 50;
                // point.d = Math.floor(Math.sqrt(Math.pow((point.x - point.ex), 2) + Math.pow((point.y - point.ey), 2)));
                points.push(point);
            }
        },
        render: function () {
            var self = this;
            var points = self.points;

            points.forEach(function (point, i) {
                //1.刚进页面，满足isRun=true、透明度<0.8
                //2.当透明度>=0.8时,开始运动，当运动时间t>=d时，设置为isRun=false，
                //3.当isRun=false时，逐渐降低透明度至0，当透明度<0时。复活粒子
                if (point.isRun && point.opacity < 0.8) {
                    point.draw();
                    point.opacity += point.interval;
                    // point.opacity += 0.035;
                    return;
                }
                if (point.isRun && point.opacity >= 0.8) {
                    point.x = Tween.Cubic.easeInOut(point.t, point.x, point.ex - point.x, point.d);
                    point.y = Tween.Cubic.easeInOut(point.t, point.y, point.ey - point.y, point.d);
                    point.draw();
                    if (point.t < point.d) {
                        point.t++;
                        if (point.x === point.ex && point.y === point.ey) {
                            point.isRun = false;
                        }
                    } else {
                        point.isRun = false;
                    }
                }
                if (!point.isRun && point.opacity > 0) {
                    point.draw();
                    point.opacity -= 0.05;
                    return;
                }
                if (!point.isRun && point.opacity < 0) {
                    var point = point.relive();
                    var isLeft = point.x < self.circle.x;
                    var endPoint = self.circle.birthPoint(isLeft);
                    point.ex = endPoint.x;
                    point.ey = endPoint.y;
                    point.d = Math.sqrt(Math.pow((point.x - point.ex), 2) + Math.pow((point.y - point.ey), 2));
                    points.splice(i, 1, point);
                }
            });
        }
    };

    //背景层
    var bgLayer = {
        init: function () {
            var dataList = [{
                type: 'out', //外层圆
                count: 80, //粒子数目
                interval: 5, //粒子间隔
                radiusList: [100, 102, 104, 105, 106, 107, 108, 115, 122, 129, 136]
            }, {
                type: 'in', //内层圆
                count: 60,
                interval: 8,
                radiusList: [40, 45, 50, 55, 60, 65, 70, 75]
            }, {
                type: 'highlight', //高亮
                count: 0,
                interval: 8,
                radiusList: [40, 45, 50, 55, 60, 65, 70, 75]
            }];
            this.circles = circles = [];
            dataList.forEach(function (data) {
                data.radiusList.forEach(function (radius, index) {
                    var circle = new Circle(centerX, centerY, radius);
                    circle.type = data.type;
                    circle.lineWidth = Math.random() * 0.9 + 1.6;
                    circle.radian = Math.PI / Math.random();
                    circle.radianNum = Math.random() * 3 + 3;
                    circle.runSpeed = Math.random() * 0.02 + 0.005;
                    circle.interval = Math.random() * 0.1 + 0.05;
                    circle.particles = (function () {
                        var particles = [];
                        for (var i = 0; i < data.count - data.interval * index; i++) {
                            particles.push({
                                angle: Math.floor(Math.random() * 360),
                                size: Math.random() * 5 + 7,
                                opacity: Math.random()
                            });
                        }
                        return particles;
                    }());
                    circles.push(circle);
                });
            });
        },
        render: function () {
            this._drawCircle();
            this._drawParticle();
            this._drawBar();
        },
        _drawCircle: function () {
            this.circles.forEach(function (circle) {
                var shadowColor = 'rgba(0,0,255,1)';
                if (circle.type && circle.type === 'in') {
                    shadowColor = 'rgba(42,97,0,.4)';
                }
                ctx.save();
                ctx.beginPath();
                ctx.lineWidth = 1.2;
                ctx.strokeStyle = 'rgba(19,6,67,.6)';
                ctx.shadowColor = shadowColor;
                ctx.shadowBlur = 15;
                ctx.globalAlpha = 0.75;
                ctx.arc(centerX, centerY, circle.r, 0, Math.PI * 2);
                ctx.stroke();
                ctx.closePath();
                ctx.restore();
            });
        },
        _drawParticle: function () {
            this.circles.forEach(function (circle) {
                var img = imgOut;
                if (circle.type && circle.type === 'in') {
                    img = imgIn;
                }
                circle.particles.forEach(function (particle) {
                    var _x = circle.r * Math.cos(particle.angle * (Math.PI / 180)) + centerX;
                    var _y = circle.r * Math.sin(particle.angle * (Math.PI / 180)) + centerY;
                    ctx.save();
                    ctx.globalAlpha = particle.opacity;
                    ctx.translate(_x, _y);
                    ctx.rotate(particle.angle * Math.PI / 180);
                    ctx.drawImage(img, -particle.size / 2, -particle.size / 2, particle.size, particle.size); //用图片代替粒子，效率更高
                    ctx.restore();
                    particle.angle += circle.interval;
                });
            });
        },
        _drawBar: function () {
            this.circles.forEach(function (circle) {
                if (circle.type && circle.type === 'in' || circle.type && circle.type === 'highlight') {
                    ctx.save();
                    ctx.beginPath();
                    ctx.globalCompositeOperation = 'lighter';
                    ctx.lineWidth = circle.lineWidth;
                    ctx.strokeStyle = 'rgba(58,255,255,.7)';
                    ctx.arc(centerX, centerY, circle.r, circle.radian, circle.radian + Math.PI / circle.radianNum);
                    ctx.stroke();
                    ctx.restore();
                    circle.radian += circle.runSpeed;
                }
            });
        },
        fillCenterCircle: function () {
            ctx.save();
            ctx.beginPath();
            ctx.fillStyle = '#050510';
            ctx.arc(centerX, centerY, 42, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    };

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

    var init = function () {
        initCanvas();
        pointLayer.init();
        wave = new Wave();
        wave.start();
        bgLayer.init();
    }

    var renderLoop = function () {
        ctx.clearRect(0, 0, w, h);
        bgLayer.render();
        wave.render();
        pointLayer.render();
        bgLayer.fillCenterCircle();
    }

    init();

    (function frame() {
        requestAnimationFrame(frame);
        renderLoop();
    }());
})();