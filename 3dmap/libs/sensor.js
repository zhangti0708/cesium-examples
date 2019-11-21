
!function (e, n) {
    "object" == typeof exports && "object" == typeof module ? module.exports = n(require("Cesium")) : "function" == typeof define && define.amd ? define(["Cesium"], n) : "object" == typeof exports ? exports.space = n(require("Cesium")) : e.space = n(e.Cesium)
}("undefined" != typeof self ? self : this, function (t) {
    return function (t) {
        var o = {};
        function i(e) {
            if (o[e])
                return o[e].exports;
            var n = o[e] = {
                i: e,
                l: !1,
                exports: {}
            };
            return t[e].call(n.exports, n, n.exports, i),
                n.l = !0,
                n.exports
        }
        return i.m = t,
            i.c = o,
            i.d = function (e, n, t) {
                i.o(e, n) || Object.defineProperty(e, n, {
                    configurable: !1,
                    enumerable: !0,
                    get: t
                })
            }
            ,
            i.n = function (e) {
                var n = e && e.__esModule ? function () {
                    return e.default
                }
                    : function () {
                        return e
                    }
                    ;
                return i.d(n, "a", n),
                    n
            }
            ,
            i.o = function (e, n) {
                return Object.prototype.hasOwnProperty.call(e, n)
            }
            ,
            i.p = "",
            i(i.s = 2)
    }([function (e, n) {
        e.exports = t
    }
        , function (e, n, t) {
            "use strict";
            Object.defineProperty(n, "__esModule", {
                value: !0
            }),
                n.RectangularSensorPrimitive = void 0;
            var T = o(t(0))
                , b = o(t(3))
                , L = o(t(4))
                , z = o(t(5))
                , D = o(t(6));
            function o(e) {
                return e && e.__esModule ? e : {
                    default: e
                }
            }
            var V = T.default.BoundingSphere
                , R = T.default.Cartesian3
                , i = T.default.Color
                , h = T.default.combine
                , I = T.default.ComponentDatatype
                , r = T.default.defaultValue
                , a = T.default.defined
                , O = (T.default.defineProperties,
                    T.default.destroyObject,
                    T.default.DeveloperError)
                , H = T.default.Matrix4
                , s = T.default.PrimitiveType
                , W = T.default.Buffer
                , F = T.default.BufferUsage
                , l = T.default.DrawCommand
                , B = T.default.Pass
                , N = T.default.RenderState
                , k = T.default.ShaderProgram
                , Y = T.default.ShaderSource
                , G = T.default.VertexArray
                , X = T.default.BlendingState
                , q = T.default.CullFace
                , u = T.default.Material
                , U = T.default.SceneMode
                , j = T.default.VertexFormat
                , Z = T.default.Math
                , Q = T.default.Matrix3
                , J = (H = T.default.Matrix4,
                    T.default.JulianDate)
                , m = (T.default.BoxGeometry,
                    T.default.EllipsoidGeometry,
                    Math.sin)
                , K = Math.cos
                , $ = Math.tan
                , ee = Math.atan
                , ne = (Math.asin,
                    {
                        position: 0,
                        normal: 1
                    });
            function c(e) {
                var n = this;
                e = r(e, r.EMPTY_OBJECT),
                    this.show = r(e.show, !0),
                    this.slice = r(e.slice, 32),
                    this.modelMatrix = H.clone(e.modelMatrix, new H),
                    this._modelMatrix = new H,
                    this._computedModelMatrix = new H,
                    this._computedScanPlaneModelMatrix = new H,
                    this.radius = r(e.radius, Number.POSITIVE_INFINITY),
                    this._radius = void 0,
                    this.xHalfAngle = r(e.xHalfAngle, 0),
                    this._xHalfAngle = void 0,
                    this.yHalfAngle = r(e.yHalfAngle, 0),
                    this._yHalfAngle = void 0,
                    this.lineColor = r(e.lineColor, i.WHITE),
                    this.showSectorLines = r(e.showSectorLines, !0),
                    this.showSectorSegmentLines = r(e.showSectorSegmentLines, !0),
                    this.showLateralSurfaces = r(e.showLateralSurfaces, !0),
                    this.material = a(e.material) ? e.material : u.fromType(u.ColorType),
                    this._material = void 0,
                    this._translucent = void 0,
                    this.lateralSurfaceMaterial = a(e.lateralSurfaceMaterial) ? e.lateralSurfaceMaterial : u.fromType(u.ColorType),
                    this._lateralSurfaceMaterial = void 0,
                    this._lateralSurfaceTranslucent = void 0,
                    this.showDomeSurfaces = r(e.showDomeSurfaces, !0),
                    this.domeSurfaceMaterial = a(e.domeSurfaceMaterial) ? e.domeSurfaceMaterial : u.fromType(u.ColorType),
                    this._domeSurfaceMaterial = void 0,
                    this.showDomeLines = r(e.showDomeLines, !0),
                    this.showIntersection = r(e.showIntersection, !0),
                    this.intersectionColor = r(e.intersectionColor, i.WHITE),
                    this.intersectionWidth = r(e.intersectionWidth, 5),
                    this.showThroughEllipsoid = r(e.showThroughEllipsoid, !1),
                    this._showThroughEllipsoid = void 0,
                    this.showScanPlane = r(e.showScanPlane, !0),
                    this.scanPlaneColor = r(e.scanPlaneColor, i.WHITE),
                    this.scanPlaneMode = r(e.scanPlaneMode, "horizontal"),
                    this.scanPlaneRate = r(e.scanPlaneRate, 10),
                    this._scanePlaneXHalfAngle = 0,
                    this._scanePlaneYHalfAngle = 0,
                    this._time = J.now(),
                    this._boundingSphere = new V,
                    this._boundingSphereWC = new V,
                    this._sectorFrontCommand = new l({
                        owner: this,
                        primitiveType: s.TRIANGLES,
                        boundingVolume: this._boundingSphereWC
                    }),
                    this._sectorBackCommand = new l({
                        owner: this,
                        primitiveType: s.TRIANGLES,
                        boundingVolume: this._boundingSphereWC
                    }),
                    this._sectorVA = void 0,
                    this._sectorLineCommand = new l({
                        owner: this,
                        primitiveType: s.LINES,
                        boundingVolume: this._boundingSphereWC
                    }),
                    this._sectorLineVA = void 0,
                    this._sectorSegmentLineCommand = new l({
                        owner: this,
                        primitiveType: s.LINES,
                        boundingVolume: this._boundingSphereWC
                    }),
                    this._sectorSegmentLineVA = void 0,
                    this._domeFrontCommand = new l({
                        owner: this,
                        primitiveType: s.TRIANGLES,
                        boundingVolume: this._boundingSphereWC
                    }),
                    this._domeBackCommand = new l({
                        owner: this,
                        primitiveType: s.TRIANGLES,
                        boundingVolume: this._boundingSphereWC
                    }),
                    this._domeVA = void 0,
                    this._domeLineCommand = new l({
                        owner: this,
                        primitiveType: s.LINES,
                        boundingVolume: this._boundingSphereWC
                    }),
                    this._domeLineVA = void 0,
                    this._scanPlaneFrontCommand = new l({
                        owner: this,
                        primitiveType: s.TRIANGLES,
                        boundingVolume: this._boundingSphereWC
                    }),
                    this._scanPlaneBackCommand = new l({
                        owner: this,
                        primitiveType: s.TRIANGLES,
                        boundingVolume: this._boundingSphereWC
                    }),
                    this._scanRadialCommand = void 0,
                    this._colorCommands = [],
                    this._frontFaceRS = void 0,
                    this._backFaceRS = void 0,
                    this._sp = void 0,
                    this._uniforms = {
                        u_type: function () {
                            return 0
                        },
                        u_xHalfAngle: function () {
                            return n.xHalfAngle
                        },
                        u_yHalfAngle: function () {
                            return n.yHalfAngle
                        },
                        u_radius: function () {
                            return n.radius
                        },
                        u_showThroughEllipsoid: function () {
                            return n.showThroughEllipsoid
                        },
                        u_showIntersection: function () {
                            return n.showIntersection
                        },
                        u_intersectionColor: function () {
                            return n.intersectionColor
                        },
                        u_intersectionWidth: function () {
                            return n.intersectionWidth
                        },
                        u_normalDirection: function () {
                            return 1
                        },
                        u_lineColor: function () {
                            return n.lineColor
                        }
                    },
                    this._scanUniforms = {
                        u_xHalfAngle: function () {
                            return n._scanePlaneXHalfAngle
                        },
                        u_yHalfAngle: function () {
                            return n._scanePlaneYHalfAngle
                        },
                        u_radius: function () {
                            return n.radius
                        },
                        u_color: function () {
                            return n.scanPlaneColor
                        },
                        u_showThroughEllipsoid: function () {
                            return n.showThroughEllipsoid
                        },
                        u_showIntersection: function () {
                            return n.showIntersection
                        },
                        u_intersectionColor: function () {
                            return n.intersectionColor
                        },
                        u_intersectionWidth: function () {
                            return n.intersectionWidth
                        },
                        u_normalDirection: function () {
                            return 1
                        },
                        u_lineColor: function () {
                            return n.lineColor
                        }
                    }
            }
            c.prototype.update = function (e) {
                var n = e.mode;
                if (this.show && n === U.SCENE3D) {
                    var t = !1
                        , o = !1
                        , i = !1
                        , r = this.xHalfAngle
                        , a = this.yHalfAngle;
                    if (r < 0 || a < 0)
                        throw new O("halfAngle must be greater than or equal to zero.");
                    if (0 != r && 0 != a) {
                        this._xHalfAngle === r && this._yHalfAngle === a || (this._xHalfAngle = r,
                            this._yHalfAngle = a,
                            t = !0);
                        var s = this.radius;
                        if (s < 0)
                            throw new O("this.radius must be greater than or equal to zero.");
                        var l = !1;
                        this._radius !== s && (l = !0,
                            this._radius = s,
                            this._boundingSphere = new V(R.ZERO, this.radius)),
                            (!H.equals(this.modelMatrix, this._modelMatrix) || l) && (H.clone(this.modelMatrix, this._modelMatrix),
                                H.multiplyByUniformScale(this.modelMatrix, this.radius, this._computedModelMatrix),
                                V.transform(this._boundingSphere, this.modelMatrix, this._boundingSphereWC));
                        var u = this.showThroughEllipsoid;
                        this._showThroughEllipsoid !== this.showThroughEllipsoid && (this._showThroughEllipsoid = u,
                            o = !0);
                        var c = this.material;
                        this._material !== c && (this._material = c,
                            i = o = !0);
                        var d = c.isTranslucent();
                        if (this._translucent !== d && (this._translucent = d,
                            o = !0),
                            this.showScanPlane) {
                            var h = e.time
                                , f = J.secondsDifference(h, this._time);
                            f < 0 && (this._time = J.clone(h, this._time));
                            var m, p = Math.max(f % this.scanPlaneRate / this.scanPlaneRate, 0);
                            if ("horizontal" == this.scanPlaneMode) {
                                var _ = K(m = 2 * a * p - a)
                                    , v = $(r)
                                    , g = ee(_ * v);
                                this._scanePlaneXHalfAngle = g,
                                    this._scanePlaneYHalfAngle = m,
                                    T.default.Matrix3.fromRotationX(this._scanePlaneYHalfAngle, te)
                            } else {
                                m = 2 * r * p - r;
                                var w = $(a)
                                    , S = K(m)
                                    , C = ee(S * w);
                                this._scanePlaneXHalfAngle = m,
                                    this._scanePlaneYHalfAngle = C,
                                    T.default.Matrix3.fromRotationY(this._scanePlaneXHalfAngle, te)
                            }
                            T.default.Matrix4.multiplyByMatrix3(this.modelMatrix, te, this._computedScanPlaneModelMatrix),
                                H.multiplyByUniformScale(this._computedScanPlaneModelMatrix, this.radius, this._computedScanPlaneModelMatrix)
                        }
                        t && function (e, n) {
                            var t = n.context
                                , o = ie(e, e.xHalfAngle, e.yHalfAngle)
                                , i = function (e, n) {
                                    var t = e.xHalfAngle
                                        , o = e.yHalfAngle
                                        , i = n.zoy
                                        , r = n.zox
                                        , a = []
                                        , s = Q.fromRotationY(t, te);
                                    a.push(i.map(function (e) {
                                        return Q.multiplyByVector(s, e, new T.default.Cartesian3)
                                    }));
                                    var s = Q.fromRotationX(-o, te);
                                    a.push(r.map(function (e) {
                                        return Q.multiplyByVector(s, e, new T.default.Cartesian3)
                                    }).reverse());
                                    var s = Q.fromRotationY(-t, te);
                                    a.push(i.map(function (e) {
                                        return Q.multiplyByVector(s, e, new T.default.Cartesian3)
                                    }).reverse());
                                    var s = Q.fromRotationX(o, te);
                                    return a.push(r.map(function (e) {
                                        return Q.multiplyByVector(s, e, new T.default.Cartesian3)
                                    })),
                                        a
                                }(e, o);
                            e.showLateralSurfaces && (e._sectorVA = function (e, n) {
                                for (var t = Array.prototype.concat.apply([], n).length - n.length, o = new Float32Array(18 * t), i = 0, r = 0, a = n.length; r < a; r++)
                                    for (var s = n[r], l = R.normalize(R.cross(s[0], s[s.length - 1], oe), oe), u = 0, t = s.length - 1; u < t; u++)
                                        o[i++] = 0,
                                            o[i++] = 0,
                                            o[i++] = 0,
                                            o[i++] = -l.x,
                                            o[i++] = -l.y,
                                            o[i++] = -l.z,
                                            o[i++] = s[u].x,
                                            o[i++] = s[u].y,
                                            o[i++] = s[u].z,
                                            o[i++] = -l.x,
                                            o[i++] = -l.y,
                                            o[i++] = -l.z,
                                            o[i++] = s[u + 1].x,
                                            o[i++] = s[u + 1].y,
                                            o[i++] = s[u + 1].z,
                                            o[i++] = -l.x,
                                            o[i++] = -l.y,
                                            o[i++] = -l.z;
                                var c = W.createVertexBuffer({
                                    context: e,
                                    typedArray: o,
                                    usage: F.STATIC_DRAW
                                })
                                    , d = 6 * Float32Array.BYTES_PER_ELEMENT
                                    , h = [{
                                        index: ne.position,
                                        vertexBuffer: c,
                                        componentsPerAttribute: 3,
                                        componentDatatype: I.FLOAT,
                                        offsetInBytes: 0,
                                        strideInBytes: d
                                    }, {
                                        index: ne.normal,
                                        vertexBuffer: c,
                                        componentsPerAttribute: 3,
                                        componentDatatype: I.FLOAT,
                                        offsetInBytes: 3 * Float32Array.BYTES_PER_ELEMENT,
                                        strideInBytes: d
                                    }];
                                return new G({
                                    context: e,
                                    attributes: h
                                })
                            }(t, i));
                            e.showSectorLines && (e._sectorLineVA = function (e, n) {
                                for (var t = n.length, o = new Float32Array(9 * t), i = 0, r = 0, a = n.length; r < a; r++) {
                                    var s = n[r];
                                    o[i++] = 0,
                                        o[i++] = 0,
                                        o[i++] = 0,
                                        o[i++] = s[0].x,
                                        o[i++] = s[0].y,
                                        o[i++] = s[0].z
                                }
                                var l = W.createVertexBuffer({
                                    context: e,
                                    typedArray: o,
                                    usage: F.STATIC_DRAW
                                })
                                    , u = 3 * Float32Array.BYTES_PER_ELEMENT
                                    , c = [{
                                        index: ne.position,
                                        vertexBuffer: l,
                                        componentsPerAttribute: 3,
                                        componentDatatype: I.FLOAT,
                                        offsetInBytes: 0,
                                        strideInBytes: u
                                    }];
                                return new G({
                                    context: e,
                                    attributes: c
                                })
                            }(t, i));
                            e.showSectorSegmentLines && (e._sectorSegmentLineVA = function (e, n) {
                                for (var t = Array.prototype.concat.apply([], n).length - n.length, o = new Float32Array(9 * t), i = 0, r = 0, a = n.length; r < a; r++)
                                    for (var s = n[r], l = 0, t = s.length - 1; l < t; l++)
                                        o[i++] = s[l].x,
                                            o[i++] = s[l].y,
                                            o[i++] = s[l].z,
                                            o[i++] = s[l + 1].x,
                                            o[i++] = s[l + 1].y,
                                            o[i++] = s[l + 1].z;
                                var u = W.createVertexBuffer({
                                    context: e,
                                    typedArray: o,
                                    usage: F.STATIC_DRAW
                                })
                                    , c = 3 * Float32Array.BYTES_PER_ELEMENT
                                    , d = [{
                                        index: ne.position,
                                        vertexBuffer: u,
                                        componentsPerAttribute: 3,
                                        componentDatatype: I.FLOAT,
                                        offsetInBytes: 0,
                                        strideInBytes: c
                                    }];
                                return new G({
                                    context: e,
                                    attributes: d
                                })
                            }(t, i));
                            e.showDomeSurfaces && (e._domeVA = function (e) {
                                var n = T.default.EllipsoidGeometry.createGeometry(new T.default.EllipsoidGeometry({
                                    vertexFormat: j.POSITION_ONLY,
                                    stackPartitions: 32,
                                    slicePartitions: 32
                                }));
                                return G.fromGeometry({
                                    context: e,
                                    geometry: n,
                                    attributeLocations: ne,
                                    bufferUsage: F.STATIC_DRAW,
                                    interleave: !1
                                })
                            }(t));
                            e.showDomeLines && (e._domeLineVA = function (e) {
                                var n = T.default.EllipsoidOutlineGeometry.createGeometry(new T.default.EllipsoidOutlineGeometry({
                                    vertexFormat: j.POSITION_ONLY,
                                    stackPartitions: 32,
                                    slicePartitions: 32
                                }));
                                return G.fromGeometry({
                                    context: e,
                                    geometry: n,
                                    attributeLocations: ne,
                                    bufferUsage: F.STATIC_DRAW,
                                    interleave: !1
                                })
                            }(t));
                            if (e.showScanPlane)
                                if ("horizontal" == e.scanPlaneMode) {
                                    var r = ie(e, Z.PI_OVER_TWO, 0);
                                    e._scanPlaneVA = re(t, r.zox)
                                } else {
                                    var r = ie(e, 0, Z.PI_OVER_TWO);
                                    e._scanPlaneVA = re(t, r.zoy)
                                }
                        }(this, e),
                            o && function (e, n, t) {
                                t ? (e._frontFaceRS = N.fromCache({
                                    depthTest: {
                                        enabled: !n
                                    },
                                    depthMask: !1,
                                    blending: X.ALPHA_BLEND,
                                    cull: {
                                        enabled: !0,
                                        face: q.BACK
                                    }
                                }),
                                    e._backFaceRS = N.fromCache({
                                        depthTest: {
                                            enabled: !n
                                        },
                                        depthMask: !1,
                                        blending: X.ALPHA_BLEND,
                                        cull: {
                                            enabled: !0,
                                            face: q.FRONT
                                        }
                                    }),
                                    e._pickRS = N.fromCache({
                                        depthTest: {
                                            enabled: !n
                                        },
                                        depthMask: !1,
                                        blending: X.ALPHA_BLEND
                                    })) : (e._frontFaceRS = N.fromCache({
                                        depthTest: {
                                            enabled: !n
                                        },
                                        depthMask: !0
                                    }),
                                        e._pickRS = N.fromCache({
                                            depthTest: {
                                                enabled: !0
                                            },
                                            depthMask: !0
                                        }))
                            }(this, u, d),
                            i && function (e, n, t) {
                                (function (e, n, t) {
                                    var o = n.context
                                        , i = b.default
                                        , r = new Y({
                                            sources: [z.default, t.shaderSource, L.default]
                                        });
                                    e._sp = k.replaceCache({
                                        context: o,
                                        shaderProgram: e._sp,
                                        vertexShaderSource: i,
                                        fragmentShaderSource: r,
                                        attributeLocations: ne
                                    });
                                    var a = new Y({
                                        sources: [z.default, t.shaderSource, L.default],
                                        pickColorQualifier: "uniform"
                                    });
                                    e._pickSP = k.replaceCache({
                                        context: o,
                                        shaderProgram: e._pickSP,
                                        vertexShaderSource: i,
                                        fragmentShaderSource: a,
                                        attributeLocations: ne
                                    })
                                }
                                )(e, n, t),
                                    e.showScanPlane && function (e, n, t) {
                                        var o = n.context
                                            , i = b.default
                                            , r = new Y({
                                                sources: [z.default, t.shaderSource, D.default]
                                            });
                                        e._scanePlaneSP = k.replaceCache({
                                            context: o,
                                            shaderProgram: e._scanePlaneSP,
                                            vertexShaderSource: i,
                                            fragmentShaderSource: r,
                                            attributeLocations: ne
                                        })
                                    }(e, n, t)
                            }(this, e, c),
                            (o || i) && function (e, n) {
                                e._colorCommands.length = 0;
                                var t = n ? B.TRANSLUCENT : B.OPAQUE;
                                e.showLateralSurfaces && ae(e, e._sectorFrontCommand, e._sectorBackCommand, e._frontFaceRS, e._backFaceRS, e._sp, e._sectorVA, e._uniforms, e._computedModelMatrix, n, t);
                                e.showSectorLines && ae(e, e._sectorLineCommand, void 0, e._frontFaceRS, e._backFaceRS, e._sp, e._sectorLineVA, e._uniforms, e._computedModelMatrix, n, t, !0);
                                e.showSectorSegmentLines && ae(e, e._sectorSegmentLineCommand, void 0, e._frontFaceRS, e._backFaceRS, e._sp, e._sectorSegmentLineVA, e._uniforms, e._computedModelMatrix, n, t, !0);
                                e.showDomeSurfaces && ae(e, e._domeFrontCommand, e._domeBackCommand, e._frontFaceRS, e._backFaceRS, e._sp, e._domeVA, e._uniforms, e._computedModelMatrix, n, t);
                                e.showDomeLines && ae(e, e._domeLineCommand, void 0, e._frontFaceRS, e._backFaceRS, e._sp, e._domeLineVA, e._uniforms, e._computedModelMatrix, n, t, !0);
                                e.showScanPlane && ae(e, e._scanPlaneFrontCommand, e._scanPlaneBackCommand, e._frontFaceRS, e._backFaceRS, e._scanePlaneSP, e._scanPlaneVA, e._scanUniforms, e._computedScanPlaneModelMatrix, n, t)
                            }(this, d);
                        var y = e.commandList
                            , x = e.passes
                            , E = this._colorCommands;
                        if (x.render)
                            for (var P = 0, A = E.length; P < A; P++) {
                                var M = E[P];
                                y.push(M)
                            }
                    }
                }
            }
                ;
            var te = new Q
                , oe = new R;
            function ie(e, n, t) {
                for (var o = e.slice, i = K(t), r = $(t), a = K(n), s = $(n), l = ee(a * r), u = ee(i * s), c = [], d = 0; d < o; d++) {
                    var h = 2 * l * d / (o - 1) - l;
                    c.push(new R(0, m(h), K(h)))
                }
                var f = [];
                for (d = 0; d < o; d++) {
                    h = 2 * u * d / (o - 1) - u;
                    f.push(new R(m(h), 0, K(h)))
                }
                return {
                    zoy: c,
                    zox: f
                }
            }
            function re(e, n) {
                for (var t = n.length - 1, o = new Float32Array(9 * t), i = 0, r = 0; r < t; r++)
                    o[i++] = 0,
                        o[i++] = 0,
                        o[i++] = 0,
                        o[i++] = n[r].x,
                        o[i++] = n[r].y,
                        o[i++] = n[r].z,
                        o[i++] = n[r + 1].x,
                        o[i++] = n[r + 1].y,
                        o[i++] = n[r + 1].z;
                var a = W.createVertexBuffer({
                    context: e,
                    typedArray: o,
                    usage: F.STATIC_DRAW
                })
                    , s = 3 * Float32Array.BYTES_PER_ELEMENT
                    , l = [{
                        index: ne.position,
                        vertexBuffer: a,
                        componentsPerAttribute: 3,
                        componentDatatype: I.FLOAT,
                        offsetInBytes: 0,
                        strideInBytes: s
                    }];
                return new G({
                    context: e,
                    attributes: l
                })
            }
            function ae(e, n, t, o, i, r, a, s, l, u, c, d) {
                u && t && (t.vertexArray = a,
                    t.renderState = i,
                    t.shaderProgram = r,
                    t.uniformMap = h(s, e._material._uniforms),
                    t.uniformMap.u_normalDirection = function () {
                        return -1
                    }
                    ,
                    t.pass = c,
                    t.modelMatrix = l,
                    e._colorCommands.push(t)),
                    n.vertexArray = a,
                    n.renderState = o,
                    n.shaderProgram = r,
                    n.uniformMap = h(s, e._material._uniforms),
                    d && (n.uniformMap.u_type = function () {
                        return 1
                    }
                    ),
                    n.pass = c,
                    n.modelMatrix = l,
                    e._colorCommands.push(n)
            }
            n.RectangularSensorPrimitive = c
        }
        , function (e, n, t) {
            "use strict";
            var o, i = t(0), r = (o = i) && o.__esModule ? o : {
                default: o
            }, a = t(1), s = t(7), l = t(8);
            r.default.RectangularSensorPrimitive = a.RectangularSensorPrimitive,
                r.default.RectangularSensorGraphics = s.RectangularSensorGraphics,
                r.default.RectangularSensorVisualizer = l.RectangularSensorVisualizer;
            var u = r.default.DataSourceDisplay
                , c = u.defaultVisualizersCallback;
            u.defaultVisualizersCallback = function (e, n, t) {
                var o = t.entities;
                return c(e, n, t).concat([new l.RectangularSensorVisualizer(e, o)])
            }
        }
        , function (e, n) {
            e.exports = "attribute vec4 position;\r\nattribute vec3 normal;\r\n\r\nvarying vec3 v_position;\r\nvarying vec3 v_positionWC;\r\nvarying vec3 v_positionEC;\r\nvarying vec3 v_normalEC;\r\n\r\nvoid main()\r\n{\r\n    gl_Position = czm_modelViewProjection * position;\r\n    v_position = vec3(position);\r\n    v_positionWC = (czm_model * position).xyz;\r\n    v_positionEC = (czm_modelView * position).xyz;\r\n    v_normalEC = czm_normal * normal;\r\n}"
        }
        , function (e, n) {
            e.exports = '#ifdef GL_OES_standard_derivatives\r\n    #extension GL_OES_standard_derivatives : enable\r\n#endif\r\n\r\nuniform bool u_showIntersection;\r\nuniform bool u_showThroughEllipsoid;\r\n\r\nuniform float u_radius;\r\nuniform float u_xHalfAngle;\r\nuniform float u_yHalfAngle;\r\nuniform float u_normalDirection;\r\nuniform float u_type;\r\n\r\nvarying vec3 v_position;\r\nvarying vec3 v_positionWC;\r\nvarying vec3 v_positionEC;\r\nvarying vec3 v_normalEC;\r\n\r\nvec4 getColor(float sensorRadius, vec3 pointEC)\r\n{\r\n    czm_materialInput materialInput;\r\n\r\n    vec3 pointMC = (czm_inverseModelView * vec4(pointEC, 1.0)).xyz;\r\n    materialInput.st = sensor2dTextureCoordinates(sensorRadius, pointMC);\r\n    materialInput.str = pointMC / sensorRadius;\r\n\r\n    vec3 positionToEyeEC = -v_positionEC;\r\n    materialInput.positionToEyeEC = positionToEyeEC;\r\n\r\n    vec3 normalEC = normalize(v_normalEC);\r\n    materialInput.normalEC = u_normalDirection * normalEC;\r\n\r\n    czm_material material = czm_getMaterial(materialInput);\r\n\r\n    return mix(czm_phong(normalize(positionToEyeEC), material), vec4(material.diffuse, material.alpha), 0.4);\r\n\r\n}\r\n\r\nbool isOnBoundary(float value, float epsilon)\r\n{\r\n    float width = getIntersectionWidth();\r\n    float tolerance = width * epsilon;\r\n\r\n#ifdef GL_OES_standard_derivatives\r\n    float delta = max(abs(dFdx(value)), abs(dFdy(value)));\r\n    float pixels = width * delta;\r\n    float temp = abs(value);\r\n    // There are a couple things going on here.\r\n    // First we test the value at the current fragment to see if it is within the tolerance.\r\n    // We also want to check if the value of an adjacent pixel is within the tolerance,\r\n    // but we don\'t want to admit points that are obviously not on the surface.\r\n    // For example, if we are looking for "value" to be close to 0, but value is 1 and the adjacent value is 2,\r\n    // then the delta would be 1 and "temp - delta" would be "1 - 1" which is zero even though neither of\r\n    // the points is close to zero.\r\n    return temp < tolerance && temp < pixels || (delta < 10.0 * tolerance && temp - delta < tolerance && temp < pixels);\r\n#else\r\n    return abs(value) < tolerance;\r\n#endif\r\n}\r\n\r\nvec4 shade(bool isOnBoundary)\r\n{\r\n    if (u_showIntersection && isOnBoundary)\r\n    {\r\n        return getIntersectionColor();\r\n    }\r\n    if(u_type == 1.0){\r\n        return getLineColor();\r\n    }\r\n    return getColor(u_radius, v_positionEC);\r\n}\r\n\r\nfloat ellipsoidSurfaceFunction(czm_ellipsoid ellipsoid, vec3 point)\r\n{\r\n    vec3 scaled = ellipsoid.inverseRadii * point;\r\n    return dot(scaled, scaled) - 1.0;\r\n}\r\n\r\nvoid main()\r\n{\r\n    vec3 sensorVertexWC = czm_model[3].xyz;      // (0.0, 0.0, 0.0) in model coordinates\r\n    vec3 sensorVertexEC = czm_modelView[3].xyz;  // (0.0, 0.0, 0.0) in model coordinates\r\n\r\n    //vec3 pixDir = normalize(v_position);\r\n    float positionX = v_position.x;\r\n    float positionY = v_position.y;\r\n    float positionZ = v_position.z;\r\n\r\n    vec3 zDir = vec3(0.0, 0.0, 1.0);\r\n    vec3 lineX = vec3(positionX, 0 ,positionZ);\r\n    vec3 lineY = vec3(0, positionY, positionZ);\r\n    float resX = dot(normalize(lineX), zDir);\r\n    if(resX < cos(u_xHalfAngle)-0.00001){\r\n        discard;\r\n    }\r\n    float resY = dot(normalize(lineY), zDir);\r\n    if(resY < cos(u_yHalfAngle)-0.00001){\r\n        discard;\r\n    }\r\n\r\n\r\n    czm_ellipsoid ellipsoid = czm_getWgs84EllipsoidEC();\r\n    float ellipsoidValue = ellipsoidSurfaceFunction(ellipsoid, v_positionWC);\r\n\r\n    // Occluded by the ellipsoid?\r\n\tif (!u_showThroughEllipsoid)\r\n\t{\r\n\t    // Discard if in the ellipsoid\r\n\t    // PERFORMANCE_IDEA: A coarse check for ellipsoid intersection could be done on the CPU first.\r\n\t    if (ellipsoidValue < 0.0)\r\n\t    {\r\n            discard;\r\n\t    }\r\n\r\n\t    // Discard if in the sensor\'s shadow\r\n\t    if (inSensorShadow(sensorVertexWC, ellipsoid, v_positionWC))\r\n\t    {\r\n\t        discard;\r\n\t    }\r\n    }\r\n\r\n    // Notes: Each surface functions should have an associated tolerance based on the floating point error.\r\n    bool isOnEllipsoid = isOnBoundary(ellipsoidValue, czm_epsilon3);\r\n    //isOnEllipsoid = false;\r\n    //if((resX >= 0.8 && resX <= 0.81)||(resY >= 0.8 && resY <= 0.81)){\r\n    /*if(false){\r\n        gl_FragColor = vec4(1.0,0.0,0.0,1.0);\r\n    }else{\r\n        gl_FragColor = shade(isOnEllipsoid);\r\n    }\r\n*/\r\n    gl_FragColor = shade(isOnEllipsoid);\r\n\r\n}'
        }
        , function (e, n) {
            e.exports = "uniform vec4 u_intersectionColor;\nuniform float u_intersectionWidth;\nuniform vec4 u_lineColor;\n\nbool inSensorShadow(vec3 coneVertexWC, czm_ellipsoid ellipsoidEC, vec3 pointWC)\n{\n    // Diagonal matrix from the unscaled ellipsoid space to the scaled space.    \n    vec3 D = ellipsoidEC.inverseRadii;\n\n    // Sensor vertex in the scaled ellipsoid space\n    vec3 q = D * coneVertexWC;\n    float qMagnitudeSquared = dot(q, q);\n    float test = qMagnitudeSquared - 1.0;\n    \n    // Sensor vertex to fragment vector in the ellipsoid's scaled space\n    vec3 temp = D * pointWC - q;\n    float d = dot(temp, q);\n    \n    // Behind silhouette plane and inside silhouette cone\n    return (d < -test) && (d / length(temp) < -sqrt(test));\n}\n\n///////////////////////////////////////////////////////////////////////////////\n\nvec4 getLineColor()\n{\n    return u_lineColor;\n}\n\nvec4 getIntersectionColor()\n{\n    return u_intersectionColor;\n}\n\nfloat getIntersectionWidth()\n{\n    return u_intersectionWidth;\n}\n\nvec2 sensor2dTextureCoordinates(float sensorRadius, vec3 pointMC)\n{\n    // (s, t) both in the range [0, 1]\n    float t = pointMC.z / sensorRadius;\n    float s = 1.0 + (atan(pointMC.y, pointMC.x) / czm_twoPi);\n    s = s - floor(s);\n    \n    return vec2(s, t);\n}\n"
        }
        , function (e, n) {
            e.exports = '#ifdef GL_OES_standard_derivatives\r\n    #extension GL_OES_standard_derivatives : enable\r\n#endif\r\n\r\nuniform bool u_showIntersection;\r\nuniform bool u_showThroughEllipsoid;\r\n\r\nuniform float u_radius;\r\nuniform float u_xHalfAngle;\r\nuniform float u_yHalfAngle;\r\nuniform float u_normalDirection;\r\nuniform vec4 u_color;\r\n\r\nvarying vec3 v_position;\r\nvarying vec3 v_positionWC;\r\nvarying vec3 v_positionEC;\r\nvarying vec3 v_normalEC;\r\n\r\nvec4 getColor(float sensorRadius, vec3 pointEC)\r\n{\r\n    czm_materialInput materialInput;\r\n\r\n    vec3 pointMC = (czm_inverseModelView * vec4(pointEC, 1.0)).xyz;\r\n    materialInput.st = sensor2dTextureCoordinates(sensorRadius, pointMC);\r\n    materialInput.str = pointMC / sensorRadius;\r\n\r\n    vec3 positionToEyeEC = -v_positionEC;\r\n    materialInput.positionToEyeEC = positionToEyeEC;\r\n\r\n    vec3 normalEC = normalize(v_normalEC);\r\n    materialInput.normalEC = u_normalDirection * normalEC;\r\n\r\n    czm_material material = czm_getMaterial(materialInput);\r\n\r\n    material.diffuse = u_color.rgb;\r\n    material.alpha = u_color.a;\r\n\r\n    return mix(czm_phong(normalize(positionToEyeEC), material), vec4(material.diffuse, material.alpha), 0.4);\r\n\r\n}\r\n\r\nbool isOnBoundary(float value, float epsilon)\r\n{\r\n    float width = getIntersectionWidth();\r\n    float tolerance = width * epsilon;\r\n\r\n#ifdef GL_OES_standard_derivatives\r\n    float delta = max(abs(dFdx(value)), abs(dFdy(value)));\r\n    float pixels = width * delta;\r\n    float temp = abs(value);\r\n    // There are a couple things going on here.\r\n    // First we test the value at the current fragment to see if it is within the tolerance.\r\n    // We also want to check if the value of an adjacent pixel is within the tolerance,\r\n    // but we don\'t want to admit points that are obviously not on the surface.\r\n    // For example, if we are looking for "value" to be close to 0, but value is 1 and the adjacent value is 2,\r\n    // then the delta would be 1 and "temp - delta" would be "1 - 1" which is zero even though neither of\r\n    // the points is close to zero.\r\n    return temp < tolerance && temp < pixels || (delta < 10.0 * tolerance && temp - delta < tolerance && temp < pixels);\r\n#else\r\n    return abs(value) < tolerance;\r\n#endif\r\n}\r\n\r\nvec4 shade(bool isOnBoundary)\r\n{\r\n    if (u_showIntersection && isOnBoundary)\r\n    {\r\n        return getIntersectionColor();\r\n    }\r\n    return getColor(u_radius, v_positionEC);\r\n}\r\n\r\nfloat ellipsoidSurfaceFunction(czm_ellipsoid ellipsoid, vec3 point)\r\n{\r\n    vec3 scaled = ellipsoid.inverseRadii * point;\r\n    return dot(scaled, scaled) - 1.0;\r\n}\r\n\r\nvoid main()\r\n{\r\n    vec3 sensorVertexWC = czm_model[3].xyz;      // (0.0, 0.0, 0.0) in model coordinates\r\n    vec3 sensorVertexEC = czm_modelView[3].xyz;  // (0.0, 0.0, 0.0) in model coordinates\r\n\r\n    //vec3 pixDir = normalize(v_position);\r\n    float positionX = v_position.x;\r\n    float positionY = v_position.y;\r\n    float positionZ = v_position.z;\r\n\r\n    vec3 zDir = vec3(0.0, 0.0, 1.0);\r\n    vec3 lineX = vec3(positionX, 0 ,positionZ);\r\n    vec3 lineY = vec3(0, positionY, positionZ);\r\n    float resX = dot(normalize(lineX), zDir);\r\n    if(resX < cos(u_xHalfAngle) - 0.0001){\r\n        discard;\r\n    }\r\n    float resY = dot(normalize(lineY), zDir);\r\n    if(resY < cos(u_yHalfAngle)- 0.0001){\r\n        discard;\r\n    }\r\n\r\n\r\n    czm_ellipsoid ellipsoid = czm_getWgs84EllipsoidEC();\r\n    float ellipsoidValue = ellipsoidSurfaceFunction(ellipsoid, v_positionWC);\r\n\r\n    // Occluded by the ellipsoid?\r\n\tif (!u_showThroughEllipsoid)\r\n\t{\r\n\t    // Discard if in the ellipsoid\r\n\t    // PERFORMANCE_IDEA: A coarse check for ellipsoid intersection could be done on the CPU first.\r\n\t    if (ellipsoidValue < 0.0)\r\n\t    {\r\n            discard;\r\n\t    }\r\n\r\n\t    // Discard if in the sensor\'s shadow\r\n\t    if (inSensorShadow(sensorVertexWC, ellipsoid, v_positionWC))\r\n\t    {\r\n\t        discard;\r\n\t    }\r\n    }\r\n\r\n    // Notes: Each surface functions should have an associated tolerance based on the floating point error.\r\n    bool isOnEllipsoid = isOnBoundary(ellipsoidValue, czm_epsilon3);\r\n    gl_FragColor = shade(isOnEllipsoid);\r\n\r\n}'
        }
        , function (e, n, t) {
            "use strict";
            Object.defineProperty(n, "__esModule", {
                value: !0
            }),
                n.RectangularSensorGraphics = void 0;
            var o, i = t(0), r = (o = i) && o.__esModule ? o : {
                default: o
            };
            var a = r.default.defaultValue
                , s = r.default.defined
                , l = r.default.defineProperties
                , u = r.default.DeveloperError
                , c = r.default.Event
                , d = r.default.createMaterialPropertyDescriptor
                , h = r.default.createPropertyDescriptor;
            function f(e) {
                this._show = void 0,
                    this._radius = void 0,
                    this._xHalfAngle = void 0,
                    this._yHalfAngle = void 0,
                    this._lineColor = void 0,
                    this._showSectorLines = void 0,
                    this._showSectorSegmentLines = void 0,
                    this._showLateralSurfaces = void 0,
                    this._material = void 0,
                    this._showDomeSurfaces = void 0,
                    this._showDomeLines = void 0,
                    this._showIntersection = void 0,
                    this._intersectionColor = void 0,
                    this._intersectionWidth = void 0,
                    this._showThroughEllipsoid = void 0,
                    this._gaze = void 0,
                    this._showScanPlane = void 0,
                    this._scanPlaneColor = void 0,
                    this._scanPlaneMode = void 0,
                    this._scanPlaneRate = void 0,
                    this._definitionChanged = new c,
                    this.merge(a(e, a.EMPTY_OBJECT))
            }
            l(f.prototype, {
                definitionChanged: {
                    get: function () {
                        return this._definitionChanged
                    }
                },
                show: h("show"),
                radius: h("radius"),
                xHalfAngle: h("xHalfAngle"),
                yHalfAngle: h("yHalfAngle"),
                lineColor: h("lineColor"),
                showSectorLines: h("showSectorLines"),
                showSectorSegmentLines: h("showSectorSegmentLines"),
                showLateralSurfaces: h("showLateralSurfaces"),
                material: d("material"),
                showDomeSurfaces: h("showDomeSurfaces"),
                showDomeLines: h("showDomeLines "),
                showIntersection: h("showIntersection"),
                intersectionColor: h("intersectionColor"),
                intersectionWidth: h("intersectionWidth"),
                showThroughEllipsoid: h("showThroughEllipsoid"),
                gaze: h("gaze"),
                showScanPlane: h("showScanPlane"),
                scanPlaneColor: h("scanPlaneColor"),
                scanPlaneMode: h("scanPlaneMode"),
                scanPlaneRate: h("scanPlaneRate")
            }),
                f.prototype.clone = function (e) {
                    return s(e) || (e = new f),
                        e.show = this.show,
                        e.radius = this.radius,
                        e.xHalfAngle = this.xHalfAngle,
                        e.yHalfAngle = this.yHalfAngle,
                        e.lineColor = this.lineColor,
                        e.showSectorLines = this.showSectorLines,
                        e.showSectorSegmentLines = this.showSectorSegmentLines,
                        e.showLateralSurfaces = this.showLateralSurfaces,
                        e.material = this.material,
                        e.showDomeSurfaces = this.showDomeSurfaces,
                        e.showDomeLines = this.showDomeLines,
                        e.showIntersection = this.showIntersection,
                        e.intersectionColor = this.intersectionColor,
                        e.intersectionWidth = this.intersectionWidth,
                        e.showThroughEllipsoid = this.showThroughEllipsoid,
                        e.gaze = this.gaze,
                        e.showScanPlane = this.showScanPlane,
                        e.scanPlaneColor = this.scanPlaneColor,
                        e.scanPlaneMode = this.scanPlaneMode,
                        e.scanPlaneRate = this.scanPlaneRate,
                        e
                }
                ,
                f.prototype.merge = function (e) {
                    if (!s(e))
                        throw new u("source is required.");
                    this.show = a(this.show, e.show),
                        this.radius = a(this.radius, e.radius),
                        this.xHalfAngle = a(this.xHalfAngle, e.xHalfAngle),
                        this.yHalfAngle = a(this.yHalfAngle, e.yHalfAngle),
                        this.lineColor = a(this.lineColor, e.lineColor),
                        this.showSectorLines = a(this.showSectorLines, e.showSectorLines),
                        this.showSectorSegmentLines = a(this.showSectorSegmentLines, e.showSectorSegmentLines),
                        this.showLateralSurfaces = a(this.showLateralSurfaces, e.showLateralSurfaces),
                        this.material = a(this.material, e.material),
                        this.showDomeSurfaces = a(this.showDomeSurfaces, e.showDomeSurfaces),
                        this.showDomeLines = a(this.showDomeLines, e.showDomeLines),
                        this.showIntersection = a(this.showIntersection, e.showIntersection),
                        this.intersectionColor = a(this.intersectionColor, e.intersectionColor),
                        this.intersectionWidth = a(this.intersectionWidth, e.intersectionWidth),
                        this.showThroughEllipsoid = a(this.showThroughEllipsoid, e.showThroughEllipsoid),
                        this.gaze = a(this.gaze, e.gaze),
                        this.showScanPlane = a(this.showScanPlane, e.showScanPlane),
                        this.scanPlaneColor = a(this.scanPlaneColor, e.scanPlaneColor),
                        this.scanPlaneMode = a(this.scanPlaneMode, e.scanPlaneMode),
                        this.scanPlaneRate = a(this.scanPlaneRate, e.scanPlaneRate)
                }
                ,
                n.RectangularSensorGraphics = f
        }
        , function (e, n, t) {
            "use strict";
            Object.defineProperty(n, "__esModule", {
                value: !0
            }),
                n.RectangularSensorVisualizer = void 0;
            var o, i = t(0), C = (o = i) && o.__esModule ? o : {
                default: o
            }, y = t(1), u = t(9);
            var r = C.default.AssociativeArray
                , x = C.default.Cartesian3
                , E = C.default.Color
                , P = C.default.defined
                , a = C.default.destroyObject
                , A = C.default.DeveloperError
                , M = C.default.Matrix3
                , T = C.default.Matrix4
                , b = C.default.Quaternion
                , L = C.default.MaterialProperty
                , z = C.default.Property
                , D = new M
                , V = (new T,
                    new x)
                , R = new x
                , I = new b
                , O = new x
                , H = new b
                , s = function e(n, t) {
                    if (!P(n))
                        throw new A("scene is required.");
                    if (!P(t))
                        throw new A("entityCollection is required.");
                    t.collectionChanged.addEventListener(e.prototype._onCollectionChanged, this),
                        this._scene = n,
                        this._primitives = n.primitives,
                        this._entityCollection = t,
                        this._hash = {},
                        this._entitiesToVisualize = new r,
                        this._onCollectionChanged(t, t.values, [], [])
                };
            s.prototype.update = function (e) {
                if (!P(e))
                    throw new A("time is required.");
                for (var n = this._entitiesToVisualize.values, t = this._hash, o = this._primitives, i = 0, r = n.length; i < r; i++) {
                    var a, s, l, u, c = n[i], d = c._rectangularSensor, h = t[c.id], f = c.isShowing && c.isAvailable(e) && z.getValueOrDefault(d._show, e, !0);
                    if (f && (a = z.getValueOrUndefined(c._position, e, V),
                        S = z.getValueOrUndefined(c._orientation, e, I),
                        s = z.getValueOrUndefined(d._radius, e),
                        l = z.getValueOrUndefined(d._xHalfAngle, e),
                        u = z.getValueOrUndefined(d._yHalfAngle, e),
                        f = P(a) && P(l) && P(u)),
                        f) {
                        var m = P(h) ? h.primitive : void 0;
                        P(m) || ((m = new y.RectangularSensorPrimitive).id = c,
                            o.add(m),
                            h = {
                                primitive: m,
                                position: void 0,
                                orientation: void 0
                            },
                            t[c.id] = h);
                        var p = z.getValueOrUndefined(d._gaze, e);
                        if (P(p)) {
                            var _ = z.getValueOrUndefined(p._position, e, R);
                            if (!P(a) || !P(_))
                                continue;
                            var v = x.subtract(a, _, O)
                                , g = x.angleBetween(C.default.Cartesian3.UNIT_Z, v)
                                , w = x.cross(C.default.Cartesian3.UNIT_Z, v, O)
                                , S = b.fromAxisAngle(w, g - Math.PI, H);
                            s = x.distance(a, _),
                                m.modelMatrix = T.fromRotationTranslation(M.fromQuaternion(S, D), a, m.modelMatrix)
                        } else
                            x.equals(a, h.position) && b.equals(S, h.orientation) || (P(S) ? (m.modelMatrix = T.fromRotationTranslation(M.fromQuaternion(S, D), a, m.modelMatrix),
                                h.position = x.clone(a, h.position),
                                h.orientation = b.clone(S, h.orientation)) : (m.modelMatrix = C.default.Transforms.eastNorthUpToFixedFrame(a),
                                    h.position = x.clone(a, h.position)));
                        m.show = !0,
                            m.gaze = p,
                            m.radius = s,
                            m.xHalfAngle = l,
                            m.yHalfAngle = u,
                            m.lineColor = z.getValueOrDefault(d._lineColor, e, E.WHITE),
                            m.showSectorLines = z.getValueOrDefault(d._showSectorLines, e, !0),
                            m.showSectorSegmentLines = z.getValueOrDefault(d._showSectorSegmentLines, e, !0),
                            m.showLateralSurfaces = z.getValueOrDefault(d._showLateralSurfaces, e, !0),
                            m.material = L.getValue(e, d._material, m.material),
                            m.showDomeSurfaces = z.getValueOrDefault(d._showDomeSurfaces, e, !0),
                            m.showDomeLines = z.getValueOrDefault(d._showDomeLines, e, !0),
                            m.showIntersection = z.getValueOrDefault(d._showIntersection, e, !0),
                            m.intersectionColor = z.getValueOrDefault(d._intersectionColor, e, E.WHITE),
                            m.intersectionWidth = z.getValueOrDefault(d._intersectionWidth, e, 1),
                            m.showThroughEllipsoid = z.getValueOrDefault(d._showThroughEllipsoid, e, !0),
                            m.scanPlaneMode = z.getValueOrDefault(d._scanPlaneMode, e),
                            m.scanPlaneColor = z.getValueOrDefault(d._scanPlaneColor, e, E.WHITE),
                            m.showScanPlane = z.getValueOrDefault(d._showScanPlane, e, !0),
                            m.scanPlaneRate = z.getValueOrDefault(d._scanPlaneRate, e, 1)
                    } else
                        P(h) && (h.primitive.show = !1)
                }
                return !0
            }
                ,
                s.prototype.isDestroyed = function () {
                    return !1
                }
                ,
                s.prototype.destroy = function () {
                    for (var e = this._entitiesToVisualize.values, n = this._hash, t = this._primitives, o = e.length - 1; -1 < o; o--)
                        (0,
                            u.removePrimitive)(e[o], n, t);
                    return a(this)
                }
                ,
                s.prototype._onCollectionChanged = function (e, n, t, o) {
                    var i, r, a = this._entitiesToVisualize, s = this._hash, l = this._primitives;
                    for (i = n.length - 1; -1 < i; i--)
                        r = n[i],
                            P(r._rectangularSensor) && P(r._position) && a.set(r.id, r);
                    for (i = o.length - 1; -1 < i; i--)
                        r = o[i],
                            P(r._rectangularSensor) && P(r._position) ? a.set(r.id, r) : ((0,
                                u.removePrimitive)(r, s, l),
                                a.remove(r.id));
                    for (i = t.length - 1; -1 < i; i--)
                        r = t[i],
                            (0,
                                u.removePrimitive)(r, s, l),
                            a.remove(r.id)
                }
                ,
                n.RectangularSensorVisualizer = s
        }
        , function (e, n, t) {
            "use strict";
            Object.defineProperty(n, "__esModule", {
                value: !0
            }),
                n.removePrimitive = function (e, n, t) {
                    var o = n[e.id];
                    if (r(o)) {
                        var i = o.primitive;
                        try {
                            t.remove(i)
                        } catch (e) { }
                        i.isDestroyed && !i.isDestroyed() && i.destroy(),
                            delete n[e.id]
                    }
                }
                ;
            var o, i = t(0);
            var r = ((o = i) && o.__esModule ? o : {
                default: o
            }).default.defined
        }
    ])
});
