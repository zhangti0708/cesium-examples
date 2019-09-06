(function () {
    /*
          流动纹理线
           color 颜色
           duration 持续时间 毫秒
        */
    function FlowLineMaterialProperty(color, duration) {
        this._definitionChanged = new Cesium.Event();
        this._color = undefined;
        this._colorSubscription = undefined;
        this.color = color;
        this.duration = duration;
        this._time = (new Date()).getTime();
    }
    Cesium.defineProperties(FlowLineMaterialProperty.prototype, {
        isConstant: {
            get: function () {
                return false;
            }
        },
        definitionChanged: {
            get: function () {
                return this._definitionChanged;
            }
        },
        color: Cesium.createPropertyDescriptor('color')
    });
    FlowLineMaterialProperty.prototype.getType = function (time) {
        return 'FlowLine';
    }
    FlowLineMaterialProperty.prototype.getValue = function (time, result) {
        if (!Cesium.defined(result)) {
            result = {};
        }
        result.color = Cesium.Property.getValueOrClonedDefault(this._color, time, Cesium.Color.WHITE, result.color);
        result.image = Cesium.Material.FlowLineImage;
        result.time = (((new Date()).getTime() - this._time) % this.duration) / this.duration;
        return result;
    }
    FlowLineMaterialProperty.prototype.equals = function (other) {
        return this === other ||
            (other instanceof FlowLineMaterialProperty &&
                Property.equals(this._color, other._color))
    }
    Cesium.FlowLineMaterialProperty = FlowLineMaterialProperty;
    Cesium.Material.FlowLineType = 'FlowLine';
    Cesium.Material.FlowLineImage = drawCanvas();
    Cesium.Material.FlowLineSource = "czm_material czm_getMaterial(czm_materialInput materialInput)\n\
                                                  {\n\
                                                       czm_material material = czm_getDefaultMaterial(materialInput);\n\
                                                       vec2 st = materialInput.st;\n\
                                                       vec4 colorImage = texture2D(image, vec2(fract(st.s), st.t));\n\
                                                       material.alpha = colorImage.a * color.a;\n\
                                                       material.diffuse = colorImage.rgb;\n\
                                                       return material;\n\
                                                   }";
    Cesium.Material._materialCache.addMaterial(Cesium.Material.FlowLineType, {
        fabric: {
            type: Cesium.Material.FlowLineType,
            uniforms: {
                color: new Cesium.Color(1.0, 1.0, 1.0, 1),
                image: Cesium.Material.FlowLineImage,
                time: 0
            },
            source: Cesium.Material.FlowLineSource
        },
        translucent: function (material) {
            return true;
        }
    });

    function drawCanvas() {
        let canvas = document.createElement('canvas');
        canvas.width = 1200;
        canvas.height = 50;
        let ctx = canvas.getContext('2d');
        let grd = ctx.createLinearGradient(0, 0, 1200, 0);
        grd.addColorStop(0, "rgba(255,255,0,0.2)");
        grd.addColorStop(1, "rgba(0,255,0,1)");
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, 1200, 50);
        return canvas.toDataURL("image/png");
    }
})()