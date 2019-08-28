(function () {
    "use strict";
    function a(e) {
        return e && e.__esModule ? e : {
            default: e
        }
    }
    function n(e, t) {
        if (!(e instanceof t))
            throw new TypeError("Cannot call a class as a function")
    }
    Object.defineProperty(Cesium, "__esModule", {
        value: !0
    }),
        Cesium.ViewShed3D = void 0;
    var r = function () {
        function e(e, t) {
            for (var i = 0; i < t.length; i++) {
                var a = t[i]; a.enumerable = a.enumerable || !1, a.configurable = !0, "value" in a && (a.writable = !0),
                    Object.defineProperty(e, a.key, a)
            }
        }
        return function (t, i, a) {
            return i && e(t.prototype, i), a && e(t, a), t
        }
    }(),c = {
            cameraPosition: null,
            viewPosition: null,
            horizontalAngle: 120,
            verticalAngle: 90,
            visibleAreaColor: new Cesium.Color(0, 1, 0),
            hiddenAreaColor: new Cesium.Color(1, 0, 0),
            alpha: .5,
            distance: 100,
            frustum: !0
        };
    Cesium.ViewShed3D = function () {
        function e(t, i) {
            n(this, e), t && (i || (i = {}),
                this.viewer = t,
                this.cameraPosition = Cesium.defaultValue(i.cameraPosition, c.cameraPosition),
                this.viewPosition = Cesium.defaultValue(i.viewPosition, c.viewPosition),
                this._horizontalAngle = Cesium.defaultValue(i.horizontalAngle, c.horizontalAngle),
                this._verticalAngle = Cesium.defaultValue(i.verticalAngle, c.verticalAngle),
                this._visibleAreaColor = Cesium.defaultValue(i.visibleAreaColor, c.visibleAreaColor),
                this._hiddenAreaColor = Cesium.defaultValue(i.hiddenAreaColor, c.hiddenAreaColor),
                this._alpha = Cesium.defaultValue(i.alpha, c.alpha),
                this._distance = Cesium.defaultValue(i.distance, c.distance),
                this._frustum = Cesium.defaultValue(i.frustum, c.frustum),
                this.calback = i.calback, 
                this.cameraPosition && this.viewPosition ? (this._addToScene(), this.calback && this.calback()) : this._bindMourseEvent())
        }
        return r(e, [{
            key: "_bindMourseEvent",
            value: function () {
                var e = this,
                    t = this.viewer,
                    i = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
                i.setInputAction(function (i) {
                    var a = Cesium.getCurrentMousePosition(t.scene, i.position);
                    a && (e.cameraPosition ? e.cameraPosition && !e.viewPosition && (e.viewPosition = a,
                        e._addToScene(), e._unbindMourseEvent(), e.calback && e.calback()) : e.cameraPosition = a)
                }, Cesium.ScreenSpaceEventType.LEFT_CLICK), 
                i.setInputAction(function (i) {
                    var a = Cesium.getCurrentMousePosition(t.scene, i.endPosition);
                    if (a) {
                        var n = e.cameraPosition; n && (e.frustumQuaternion = e.getFrustumQuaternion(n, a),
                            e.distance = Number(Cesium.Cartesian3.distance(n, a).toFixed(1)))
                    }
                }, Cesium.ScreenSpaceEventType.MOUSE_MOVE),
                this._handler = i
            }
        }, {
            key: "_unbindMourseEvent",
            value: function () {
                null != this._handler && (this._handler.destroy(), delete this._handler)
            }
        }, {
            key: "_addToScene",
            value: function () {
                this.frustumQuaternion = this.getFrustumQuaternion(this.cameraPosition, this.viewPosition),
                    this._createShadowMap(this.cameraPosition, this.viewPosition),
                    this._addPostProcess(), !this.radar && this.addRadar(this.cameraPosition,this.frustumQuaternion),
                    this.viewer.scene.primitives.add(this)
            }
        }, {
            key: "_createShadowMap",
            value: function (e, t, i) {
                var a = e,
                    n = t,
                    r = this.viewer.scene,
                    o = new Cesium.Camera(r);
                o.position = a,
                    o.direction = Cesium.Cartesian3.subtract(n, a, new Cesium.Cartesian3(0, 0, 0)),
                    o.up = Cesium.Cartesian3.normalize(a, new Cesium.Cartesian3(0, 0, 0));
                var l = Number(Cesium.Cartesian3.distance(n, a).toFixed(1));
                this.distance = l,
                    o.frustum = new Cesium.PerspectiveFrustum({
                        fov: Cesium.Math.toRadians(120),
                        aspectRatio: r.canvas.clientWidth / r.canvas.clientHeight,
                        near: .1,
                        far: 5e3
                    });
                this.viewShadowMap = new Cesium.ShadowMap({
                    lightCamera: o,
                    enable: !1,
                    isPointLight: !1,
                    isSpotLight: !0,
                    cascadesEnabled: !1,
                    context: r.context,
                    pointLightRadius: l
                })
            }
        }, {
            key: "getFrustumQuaternion",
            value: function (e, t) {
                var i = Cesium.Cartesian3.normalize(Cesium.Cartesian3.subtract(t, e, new Cesium.Cartesian3), new Cesium.Cartesian3),
                    a = Cesium.Cartesian3.normalize(e, new Cesium.Cartesian3),
                    n = new Cesium.Camera(this.viewer.scene);
                n.position = e,
                    n.direction = i,
                    n.up = a,
                    i = n.directionWC,
                    a = n.upWC;
                var r = n.rightWC,
                    o = new Cesium.Cartesian3,
                    l = new Cesium.Matrix3,
                    u = new Cesium.Quaternion;
                r = Cesium.Cartesian3.negate(r, o);
                var d = l;
                return Cesium.Matrix3.setColumn(d, 0, r, d),
                    Cesium.Matrix3.setColumn(d, 1, a, d),
                    Cesium.Matrix3.setColumn(d, 2, i, d),
                    Cesium.Quaternion.fromRotationMatrix(d, u)
            }
        }, {
            key: "_addPostProcess",
            value: function () {
                var e = this,
                    i = this,
                    a = i.viewShadowMap._isPointLight ? i.viewShadowMap._pointBias : i.viewShadowMap._primitiveBias;
                this.postProcess = this.viewer.scene.postProcessStages.add(new Cesium.PostProcessStage({
                    fragmentShader: document.getElementById('fragment-shader').text,
                    uniforms: {
                        czzj: function () {
                            return e.verticalAngle
                        },
                        dis: function () {
                            return e.distance
                        },
                        spzj: function () {
                            return e.horizontalAngle
                        },
                        visibleColor: function () {
                            return e.visibleAreaColor
                        },
                        disVisibleColor: function () {
                            return e.hiddenAreaColor
                        },
                        mixNum: function () {
                            return e.alpha
                        },
                        stcshadow: function () {
                            return i.viewShadowMap._shadowMapTexture
                        },
                        _shadowMap_matrix: function () {
                            return i.viewShadowMap._shadowMapMatrix
                        },
                        shadowMap_lightPositionEC: function () {
                            return i.viewShadowMap._lightPositionEC
                        },
                        shadowMap_lightDirectionEC: function () {
                            return i.viewShadowMap._lightDirectionEC
                        },
                        shadowMap_lightUp: function () {
                            return i.viewShadowMap._lightCamera.up
                        },
                        shadowMap_lightDir: function () {
                            return i.viewShadowMap._lightCamera.direction
                        },
                        shadowMap_lightRight: function () {
                            return i.viewShadowMap._lightCamera.right
                        },
                        shadowMap_texelSizeDepthBiasAndNormalShadingSmooth: function () {
                            var e = new Cesium.Cartesian2;
                            return e.x = 1 / i.viewShadowMap._textureSize.x,
                                e.y = 1 / i.viewShadowMap._textureSize.y,
                                Cesium.Cartesian4.fromElements(e.x, e.y, a.depthBias, a.normalShadingSmooth, this.combinedUniforms1)
                        },
                        shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness: function () {
                            return Cesium.Cartesian4.fromElements(a.normalOffsetScale, i.viewShadowMap._distance, i.viewShadowMap.maximumDistance,
                                i.viewShadowMap._darkness, this.combinedUniforms2)
                        }
                    }
                }))
            }
        }, {
            key: "removeRadar",
            value: function () {
                this.viewer.entities.remove(this.radar)
            }
        }, {
            key: "resetRadar",
            value: function () {
                this.removeRadar(),this.addRadar(this.cameraPosition, this.frustumQuaternion)
            }
        }, {
            key: "addRadar",
            value: function (e, t) {
                var i = e, a = this;
                this.radar = this.viewer.entities.add({
                    position: i,
                    orientation: t,
                    rectangularSensor: new Cesium.RectangularSensorGraphics({
                        radius: a.distance,
                        xHalfAngle: Cesium.Math.toRadians(a.horizontalAngle / 2),
                        yHalfAngle: Cesium.Math.toRadians(a.verticalAngle / 2),
                        material: new Cesium.Color(0, 1, 1, .4),
                        lineColor: new Cesium.Color(1, 1, 1, 1),
                        slice: 8,
                        showScanPlane: !1,
                        scanPlaneColor: new Cesium.Color(0, 1, 1, 1),
                        scanPlaneMode: "vertical",
                        scanPlaneRate: 3,
                        showThroughEllipsoid: !1,
                        showLateralSurfaces: !1,
                        showDomeSurfaces: !1
                    })
                })
            }
        }, {
            key: "update",
            value: function (e) {
                this.viewShadowMap && e.shadowMaps.push(this.viewShadowMap)
            }
        }, {
            key: "destroy",
            value: function () {
                this._unbindMourseEvent(),
                    this.viewer.scene.postProcessStages.remove(this.postProcess),
                    this.viewer.entities.remove(this.radar),
                    delete this.radar,
                    delete this.postProcess,
                    delete this.viewShadowMap,
                    delete this.verticalAngle,
                    delete this.viewer,
                    delete this.horizontalAngle,
                    delete this.visibleAreaColor,
                    delete this.hiddenAreaColor,
                    delete this.distance,
                    delete this.frustumQuaternion,
                    delete this.cameraPosition,
                    delete this.viewPosition,
                    delete this.alpha
            }
        }, {
            key: "horizontalAngle",
            get: function () {
                return this._horizontalAngle
            },
            set: function (e) {
                this._horizontalAngle = e,
                    this.resetRadar()
            }
        }, {
            key: "verticalAngle",
            get: function () {
                return this._verticalAngle
            },
            set: function (e) {
                this._verticalAngle = e,
                    this.resetRadar()
            }
        }, {
            key: "distance",
            get: function () {
                return this._distance
            },
            set: function (e) {
                this._distance = e, this.resetRadar()
            }
        }, {
            key: "visibleAreaColor",
            get: function () {
                return this._visibleAreaColor
            },
            set: function (e) {
                this._visibleAreaColor = e
            }
        }, {
            key: "hiddenAreaColor",
            get: function () {
                return this._hiddenAreaColor
            }, set: function (e) { this._hiddenAreaColor = e }
        }, {
            key: "alpha",
            get: function () {
                return this._alpha
            },
            set: function (e) {
                this._alpha = e
            }
        }]), e
    }()
})()