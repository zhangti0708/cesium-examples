/**
 * @author https://github.com/chengquan223
 * @Date 2016-6-2
 */
(function () {
    var canvas, ctx, width, height, circiles, animateHeader = true;
    initHeader();

    function initHeader() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas = document.getElementById('canvas');
        canvas.width = width;
        canvas.height = height;
        ctx = canvas.getContext('2d');

        //create cirles
        circiles = [];
        for (var i = 0; i < width * 0.5; i++) {
            var c = new Circle();
            circiles.push(c);
        }
        animate();
    }

    function animate() {
        if (animateHeader) {
            ctx.clearRect(0, 0, width, height);
            for (var i in circiles) {
                circiles[i].draw();
            }
        }
        requestAnimationFrame(animate);
    }

    function Circle() {
        var _this = this;
        (function () {
            _this.pos = {};
            init();
        })();

        function init() {
            _this.pos.x = Math.random() * width;
            _this.pos.y = height + Math.random() * 100;
            _this.alpha = 0.1 + Math.random() * 0.3;
            _this.scale = 0.1 + Math.random() * 0.4;
            _this.length = Math.random() * 50;
            _this.speed = Math.random();
        }

        //气泡
        this.draw = function () {
            if (_this.alpha <= 0) {
                init();
            }
            _this.pos.y -= _this.speed;
            _this.alpha -= 0.0005;
            ctx.beginPath();
            ctx.arc(_this.pos.x, _this.pos.y, _this.scale * 10, 0, 2 * Math.PI, false);
            ctx.fillStyle = 'rgba(255, 255, 255,' + _this.alpha + ')';
            ctx.fill();
        };

        //线条
        this.drawLine = function () {
            if (_this.alpha <= 0) {
                init();
            }
            _this.pos.y -= _this.speed;
            _this.alpha -= 0.0005;
            ctx.beginPath();
            ctx.moveTo(_this.pos.x, _this.pos.y);
            ctx.lineTo(_this.pos.x, _this.pos.y - _this.length);
            ctx.strokeStyle = 'rgba(255, 255, 255,' + _this.alpha + ')';
            ctx.stroke();
            ctx.closePath();
        }
    }
})();