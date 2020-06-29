
!function() {
    var e, t, r;
    function n() {
        this.tiffDataView = void 0,
        this.littleEndian = void 0,
        this.fileDirectories = []
    }
    function i() {}
    !function(m) {
        var a, o, p, h, v = {}, g = {}, _ = {}, x = {}, n = Object.prototype.hasOwnProperty, i = [].slice, C = /\.js$/;
        function M(e, t) {
            return n.call(e, t)
        }
        function s(e, t) {
            var n, i, r, a, o, s, l, c, d, u, f, m = t && t.split("/"), p = _.map, h = p && p["*"] || {};
            if (e) {
                for (o = (e = e.split("/")).length - 1,
                _.nodeIdCompat && C.test(e[o]) && (e[o] = e[o].replace(C, "")),
                "." === e[0].charAt(0) && m && (e = m.slice(0, m.length - 1).concat(e)),
                d = 0; d < e.length; d++)
                    if ("." === (f = e[d]))
                        e.splice(d, 1),
                        d -= 1;
                    else if (".." === f) {
                        if (0 === d || 1 === d && ".." === e[2] || ".." === e[d - 1])
                            continue;
                        0 < d && (e.splice(d - 1, 2),
                        d -= 2)
                    }
                e = e.join("/")
            }
            if ((m || h) && p) {
                for (d = (n = e.split("/")).length; 0 < d; d -= 1) {
                    if (i = n.slice(0, d).join("/"),
                    m)
                        for (u = m.length; 0 < u; u -= 1)
                            if ((r = p[m.slice(0, u).join("/")]) && (r = r[i])) {
                                a = r,
                                s = d;
                                break
                            }
                    if (a)
                        break;
                    !l && h && h[i] && (l = h[i],
                    c = d)
                }
                !a && l && (a = l,
                s = c),
                a && (n.splice(0, s, a),
                e = n.join("/"))
            }
            return e
        }
        function y(t, n) {
            return function() {
                var e = i.call(arguments, 0);
                return "string" != typeof e[0] && 1 === e.length && e.push(null),
                o.apply(m, e.concat([t, n]))
            }
        }
        function S(t) {
            return function(e) {
                v[t] = e
            }
        }
        function E(e) {
            if (M(g, e)) {
                var t = g[e];
                delete g[e],
                x[e] = !0,
                a.apply(m, t)
            }
            if (!M(v, e) && !M(x, e))
                throw new Error("No " + e);
            return v[e]
        }
        function l(e) {
            var t, n = e ? e.indexOf("!") : -1;
            return -1 < n && (t = e.substring(0, n),
            e = e.substring(n + 1, e.length)),
            [t, e]
        }
        function L(e) {
            return e ? l(e) : []
        }
        p = function(e, t) {
            var n, i = l(e), r = i[0], a = t[1];
            return e = i[1],
            r && (n = E(r = s(r, a))),
            r ? e = n && n.normalize ? n.normalize(e, function(t) {
                return function(e) {
                    return s(e, t)
                }
            }(a)) : s(e, a) : (r = (i = l(e = s(e, a)))[0],
            e = i[1],
            r && (n = E(r))),
            {
                f: r ? r + "!" + e : e,
                n: e,
                pr: r,
                p: n
            }
        }
        ,
        h = {
            require: function(e) {
                return y(e)
            },
            exports: function(e) {
                var t = v[e];
                return void 0 !== t ? t : v[e] = {}
            },
            module: function(e) {
                return {
                    id: e,
                    uri: "",
                    exports: v[e],
                    config: function(e) {
                        return function() {
                            return _ && _.config && _.config[e] || {}
                        }
                    }(e)
                }
            }
        },
        a = function(e, t, n, i) {
            var r, a, o, s, l, c, d, u = [], f = typeof n;
            if (c = L(i = i || e),
            "undefined" == f || "function" == f) {
                for (t = !t.length && n.length ? ["require", "exports", "module"] : t,
                l = 0; l < t.length; l += 1)
                    if ("require" === (a = (s = p(t[l], c)).f))
                        u[l] = h.require(e);
                    else if ("exports" === a)
                        u[l] = h.exports(e),
                        d = !0;
                    else if ("module" === a)
                        r = u[l] = h.module(e);
                    else if (M(v, a) || M(g, a) || M(x, a))
                        u[l] = E(a);
                    else {
                        if (!s.p)
                            throw new Error(e + " missing " + a);
                        s.p.load(s.n, y(i, !0), S(a), {}),
                        u[l] = v[a]
                    }
                o = n ? n.apply(v[e], u) : void 0,
                e && (r && r.exports !== m && r.exports !== v[e] ? v[e] = r.exports : o === m && d || (v[e] = o))
            } else
                e && (v[e] = n)
        }
        ,
        e = t = o = function(e, t, n, i, r) {
            if ("string" == typeof e)
                return h[e] ? h[e](t) : E(p(e, L(t)).f);
            if (!e.splice) {
                if ((_ = e).deps && o(_.deps, _.callback),
                !t)
                    return;
                t.splice ? (e = t,
                t = n,
                n = null) : e = m
            }
            return t = t || function() {}
            ,
            "function" == typeof n && (n = i,
            i = r),
            i ? a(m, e, t, n) : setTimeout(function() {
                a(m, e, t, n)
            }, 4),
            o
        }
        ,
        o.config = function(e) {
            return o(e)
        }
        ,
        e._defined = v,
        (r = function(e, t, n) {
            if ("string" != typeof e)
                throw new Error("See almond README: incorrect module build, no module name");
            t.splice || (n = t,
            t = []),
            M(v, e) || M(g, e) || (g[e] = [e, t, n])
        }
        ).amd = {
            jQuery: !0
        }
    }(),
    r("Core/RendererUtils", [], function() {
        var l = Cesium.Cartesian3
          , c = Cesium.Math
          , n = Cesium.Matrix4.fromRotationTranslation(Cesium.Matrix3.fromRotationX(c.PI_OVER_TWO))
          , d = new Cesium.Cartesian3
          , u = new Cesium.Quaternion
          , f = new Cesium.Cartesian3
          , m = new Cesium.Matrix4
          , p = (new Cesium.Matrix4,
        new Cesium.Cartesian3,
        new Cesium.ClearCommand({
            color: new Cesium.Color(0,0,0,0)
        }));
        function e() {}
        return e.renderToTexture = function(e, t, n, i) {
            var r = Cesium.isArray(e) ? e : [e]
              , a = t.context
              , o = null
              , s = !1;
            n instanceof Cesium.Framebuffer && (o = n),
            o || (o = new Cesium.Framebuffer({
                context: a,
                colorTextures: [n],
                destroyAttachments: !1,
                depthTexture: i
            }),
            s = !0);
            var l = p;
            l.framebuffer = o,
            l.renderState = t.renderState,
            l.execute(a),
            r.forEach(function(e) {
                e.framebuffer = o,
                e.execute(a)
            }),
            s && o.destroy()
        }
        ,
        e.yUp2Zup = function(e, t) {
            return Cesium.Matrix4.multiplyTransformation(e, n, t)
        }
        ,
        e.computeModelMatrix = function(e, t, n, i, r) {
            if (0 == arguments.length)
                return e;
            var a = Cesium.Matrix4;
            if (r || (r = new a),
            a.clone(e, r),
            t || (d.x = 0,
            d.y = 0,
            d.z = 0),
            d.x = t.x,
            d.y = t.y,
            d.z = t.z,
            i || (f.x = 0,
            f.y = 0,
            f.z = 0),
            f.x = i.x,
            f.y = i.y,
            f.z = i.z,
            n instanceof Cesium.Quaternion)
                Cesium.Quaternion.clone(n, u);
            else {
                var o = n.axis
                  , s = n.angle;
                Cesium.Quaternion.fromAxisAngle(new l(o.x,o.y,o.z), c.toRadians(s), u)
            }
            return a.fromTranslationQuaternionRotationScale(d, u, f, m),
            a.multiplyTransformation(r, m, r),
            r
        }
        ,
        e
    }),
    r("Core/Rotation", [], function() {
        function e(e, t) {
            this._axis = e,
            this._angle = t,
            this.paramChanged = new Cesium.Event
        }
        return Cesium.defineProperties(e.prototype, {
            axis: {
                set: function(e) {
                    e.x == this._axis.x && e.y == this._axis.y && e.z == this._axis.z || (this._axis = e,
                    this.paramChanged.raiseEvent()),
                    this._axis = e
                },
                get: function() {
                    return this._axis
                }
            },
            angle: {
                set: function(e) {
                    e != this._angle && (this._angle = e,
                    this.paramChanged.raiseEvent()),
                    this._angle = e
                },
                get: function() {
                    return this._angle
                }
            }
        }),
        e
    }),
    r("Util/CSG", [], function() {
        function _() {
            this.polygons = []
        }
        return _.fromPolygons = function(e) {
            var t = new _;
            return t.polygons = e,
            t
        }
        ,
        _.prototype = {
            clone: function() {
                var e = new _;
                return e.polygons = this.polygons.map(function(e) {
                    return e.clone()
                }),
                e
            },
            toPolygons: function() {
                return this.polygons
            },
            union: function(e) {
                var t = new _.Node(this.clone().polygons)
                  , n = new _.Node(e.clone().polygons);
                return t.clipTo(n),
                n.clipTo(t),
                n.invert(),
                n.clipTo(t),
                n.invert(),
                t.build(n.allPolygons()),
                _.fromPolygons(t.allPolygons())
            },
            subtract: function(e) {
                var t = new _.Node(this.clone().polygons)
                  , n = new _.Node(e.clone().polygons);
                return t.invert(),
                t.clipTo(n),
                n.clipTo(t),
                n.invert(),
                n.clipTo(t),
                n.invert(),
                t.build(n.allPolygons()),
                t.invert(),
                _.fromPolygons(t.allPolygons())
            },
            intersect: function(e) {
                var t = new _.Node(this.clone().polygons)
                  , n = new _.Node(e.clone().polygons);
                return t.invert(),
                n.clipTo(t),
                n.invert(),
                t.clipTo(n),
                n.clipTo(t),
                t.build(n.allPolygons()),
                t.invert(),
                _.fromPolygons(t.allPolygons())
            },
            inverse: function() {
                var e = this.clone();
                return e.polygons.map(function(e) {
                    e.flip()
                }),
                e
            }
        },
        _.cube = function(e) {
            var i = new _.Vector((e = e || {}).center || [0, 0, 0])
              , r = e.radius ? e.radius.length ? e.radius : [e.radius, e.radius, e.radius] : [1, 1, 1];
            return _.fromPolygons([[[0, 4, 6, 2], [-1, 0, 0]], [[1, 3, 7, 5], [1, 0, 0]], [[0, 1, 5, 4], [0, -1, 0]], [[2, 6, 7, 3], [0, 1, 0]], [[0, 2, 3, 1], [0, 0, -1]], [[4, 5, 7, 6], [0, 0, 1]]].map(function(n) {
                return new _.Polygon(n[0].map(function(e) {
                    var t = new _.Vector(i.x + r[0] * (2 * !!(1 & e) - 1),i.y + r[1] * (2 * !!(2 & e) - 1),i.z + r[2] * (2 * !!(4 & e) - 1));
                    return new _.Vertex(t,new _.Vector(n[1]))
                }))
            }))
        }
        ,
        _.sphere = function(e) {
            var i, r = new _.Vector((e = e || {}).center || [0, 0, 0]), a = e.radius || 1, t = e.slices || 16, n = e.stacks || 8, o = [];
            function s(e, t) {
                e *= 2 * Math.PI,
                t *= Math.PI;
                var n = new _.Vector(Math.cos(e) * Math.sin(t),Math.cos(t),Math.sin(e) * Math.sin(t));
                i.push(new _.Vertex(r.plus(n.times(a)),n))
            }
            for (var l = 0; l < t; l++)
                for (var c = 0; c < n; c++)
                    i = [],
                    s(l / t, c / n),
                    0 < c && s((l + 1) / t, c / n),
                    c < n - 1 && s((l + 1) / t, (c + 1) / n),
                    s(l / t, (c + 1) / n),
                    o.push(new _.Polygon(i));
            return _.fromPolygons(o)
        }
        ,
        _.cylinder = function(e) {
            var s = new _.Vector((e = e || {}).start || [0, -1, 0])
              , t = new _.Vector(e.end || [0, 1, 0])
              , l = t.minus(s)
              , c = e.radius || 1
              , n = e.slices || 16
              , d = l.unit()
              , i = .5 < Math.abs(d.y)
              , u = new _.Vector(i,!i,0).cross(d).unit()
              , f = u.cross(d).unit()
              , r = new _.Vertex(s,d.negated())
              , a = new _.Vertex(t,d.unit())
              , o = [];
            function m(e, t, n) {
                var i = t * Math.PI * 2
                  , r = u.times(Math.cos(i)).plus(f.times(Math.sin(i)))
                  , a = s.plus(l.times(e)).plus(r.times(c))
                  , o = r.times(1 - Math.abs(n)).plus(d.times(n));
                return new _.Vertex(a,o)
            }
            for (var p = 0; p < n; p++) {
                var h = p / n
                  , v = (p + 1) / n;
                o.push(new _.Polygon([r, m(0, h, -1), m(0, v, -1)])),
                o.push(new _.Polygon([m(0, v, 0), m(0, h, 0), m(1, h, 0), m(1, v, 0)])),
                o.push(new _.Polygon([a, m(1, v, 1), m(1, h, 1)]))
            }
            return _.fromPolygons(o)
        }
        ,
        (_.Vector = function(e, t, n) {
            3 == arguments.length ? (this.x = e,
            this.y = t,
            this.z = n) : "x"in e ? (this.x = e.x,
            this.y = e.y,
            this.z = e.z) : (this.x = e[0],
            this.y = e[1],
            this.z = e[2])
        }
        ).prototype = {
            clone: function() {
                return new _.Vector(this.x,this.y,this.z)
            },
            negated: function() {
                return new _.Vector(-this.x,-this.y,-this.z)
            },
            plus: function(e) {
                return new _.Vector(this.x + e.x,this.y + e.y,this.z + e.z)
            },
            minus: function(e) {
                return new _.Vector(this.x - e.x,this.y - e.y,this.z - e.z)
            },
            times: function(e) {
                return new _.Vector(this.x * e,this.y * e,this.z * e)
            },
            dividedBy: function(e) {
                return new _.Vector(this.x / e,this.y / e,this.z / e)
            },
            dot: function(e) {
                return this.x * e.x + this.y * e.y + this.z * e.z
            },
            lerp: function(e, t) {
                return this.plus(e.minus(this).times(t))
            },
            length: function() {
                return Math.sqrt(this.dot(this))
            },
            unit: function() {
                return this.dividedBy(this.length())
            },
            cross: function(e) {
                return new _.Vector(this.y * e.z - this.z * e.y,this.z * e.x - this.x * e.z,this.x * e.y - this.y * e.x)
            }
        },
        (_.Vertex = function(e, t) {
            this.pos = new _.Vector(e),
            this.normal = new _.Vector(t)
        }
        ).prototype = {
            clone: function() {
                return new _.Vertex(this.pos.clone(),this.normal.clone())
            },
            flip: function() {
                this.normal = this.normal.negated()
            },
            interpolate: function(e, t) {
                return new _.Vertex(this.pos.lerp(e.pos, t),this.normal.lerp(e.normal, t))
            }
        },
        (_.Plane = function(e, t) {
            this.normal = e,
            this.w = t
        }
        ).EPSILON = 1e-5,
        _.Plane.fromPoints = function(e, t, n) {
            var i = t.minus(e).cross(n.minus(e)).unit();
            return new _.Plane(i,i.dot(e))
        }
        ,
        _.Plane.prototype = {
            clone: function() {
                return new _.Plane(this.normal.clone(),this.w)
            },
            flip: function() {
                this.normal = this.normal.negated(),
                this.w = -this.w
            },
            splitPolygon: function(e, t, n, i, r) {
                for (var a = 0, o = [], s = 0; s < e.vertices.length; s++) {
                    var l = (v = this.normal.dot(e.vertices[s].pos) - this.w) < -_.Plane.EPSILON ? 2 : v > _.Plane.EPSILON ? 1 : 0;
                    a |= l,
                    o.push(l)
                }
                switch (a) {
                case 0:
                    (0 < this.normal.dot(e.plane.normal) ? t : n).push(e);
                    break;
                case 1:
                    i.push(e);
                    break;
                case 2:
                    r.push(e);
                    break;
                case 3:
                    var c = []
                      , d = [];
                    for (s = 0; s < e.vertices.length; s++) {
                        var u = (s + 1) % e.vertices.length
                          , f = o[s]
                          , m = o[u]
                          , p = e.vertices[s]
                          , h = e.vertices[u];
                        if (2 != f && c.push(p),
                        1 != f && d.push(2 != f ? p.clone() : p),
                        3 == (f | m)) {
                            var v = (this.w - this.normal.dot(p.pos)) / this.normal.dot(h.pos.minus(p.pos))
                              , g = p.interpolate(h, v);
                            c.push(g),
                            d.push(g.clone())
                        }
                    }
                    3 <= c.length && i.push(new _.Polygon(c,e.shared)),
                    3 <= d.length && r.push(new _.Polygon(d,e.shared))
                }
            }
        },
        (_.Polygon = function(e, t) {
            this.vertices = e,
            this.shared = t,
            this.plane = _.Plane.fromPoints(e[0].pos, e[1].pos, e[2].pos)
        }
        ).prototype = {
            clone: function() {
                var e = this.vertices.map(function(e) {
                    return e.clone()
                });
                return new _.Polygon(e,this.shared)
            },
            flip: function() {
                this.vertices.reverse().map(function(e) {
                    e.flip()
                }),
                this.plane.flip()
            }
        },
        (_.Node = function(e) {
            this.plane = null,
            this.front = null,
            this.back = null,
            this.polygons = [],
            e && this.build(e)
        }
        ).prototype = {
            clone: function() {
                var e = new _.Node;
                return e.plane = this.plane && this.plane.clone(),
                e.front = this.front && this.front.clone(),
                e.back = this.back && this.back.clone(),
                e.polygons = this.polygons.map(function(e) {
                    return e.clone()
                }),
                e
            },
            invert: function() {
                for (var e = 0; e < this.polygons.length; e++)
                    this.polygons[e].flip();
                this.plane.flip(),
                this.front && this.front.invert(),
                this.back && this.back.invert();
                var t = this.front;
                this.front = this.back,
                this.back = t
            },
            clipPolygons: function(e) {
                if (!this.plane)
                    return e.slice();
                for (var t = [], n = [], i = 0; i < e.length; i++)
                    this.plane.splitPolygon(e[i], t, n, t, n);
                return this.front && (t = this.front.clipPolygons(t)),
                n = this.back ? this.back.clipPolygons(n) : [],
                t.concat(n)
            },
            clipTo: function(e) {
                this.polygons = e.clipPolygons(this.polygons),
                this.front && this.front.clipTo(e),
                this.back && this.back.clipTo(e)
            },
            allPolygons: function() {
                var e = this.polygons.slice();
                return this.front && (e = e.concat(this.front.allPolygons())),
                this.back && (e = e.concat(this.back.allPolygons())),
                e
            },
            build: function(e) {
                if (e.length) {
                    this.plane || (this.plane = e[0].plane.clone());
                    for (var t = [], n = [], i = 0; i < e.length; i++)
                        this.plane.splitPolygon(e[i], this.polygons, this.polygons, t, n);
                    t.length && (this.front || (this.front = new _.Node),
                    this.front.build(t)),
                    n.length && (this.back || (this.back = new _.Node),
                    this.back.build(n))
                }
            }
        },
        _.toCSG = function(e, t) {
            if (t || (t = {
                x: 0,
                y: 0,
                z: 0
            }),
            e.attributes.normal || (e = Cesium.GeometryPipeline.computeNormal(e)),
            e.primitiveType !== Cesium.PrimitiveType.TRIANGLES)
                throw new Error("暂不支持此类几何体");
            e.indices.length;
            for (var n = [], i = [], r = e.attributes.position.values, a = e.attributes.normal.values, o = 0, s = 0, l = 0; l < e.indices.length; l += 3) {
                i = [];
                var c = e.indices[l]
                  , d = e.indices[l + 1]
                  , u = e.indices[l + 2];
                o = s = 3 * c,
                i.push(new _.Vertex([r[s++] + t.x, r[s++] + t.y, r[s++] + t.z],[a[o++], a[o++], a[o++]])),
                o = s = 3 * d,
                i.push(new _.Vertex([r[s++] + t.x, r[s++] + t.y, r[s++] + t.z],[a[o++], a[o++], a[o++]])),
                o = s = 3 * u,
                i.push(new _.Vertex([r[s++] + t.x, r[s++] + t.y, r[s++] + t.z],[a[o++], a[o++], a[o++]])),
                n.push(new _.Polygon(i))
            }
            return _.fromPolygons(n)
        }
        ,
        _.fromCSG = function(e) {
            var t, n, i = e.toPolygons();
            var r = []
              , a = []
              , o = [];
            for (t = 0; t < i.length; t++) {
                for (n = [],
                s = 0; s < i[t].vertices.length; s++)
                    n.push(this.getGeometryVertice(r, a, i[t].vertices[s].pos, i[t].plane.normal));
                n[0] === n[n.length - 1] && n.pop();
                for (var s = 2; s < n.length; s++)
                    o.push(n[0], n[s - 1], n[s])
            }
            r = new Float32Array(r),
            a = new Float32Array(a),
            o = new Int32Array(o);
            var l = {};
            return l.position = new Cesium.GeometryAttribute({
                componentDatatype: Cesium.ComponentDatatype.FLOAT,
                componentsPerAttribute: 3,
                values: r
            }),
            l.normal = new Cesium.GeometryAttribute({
                componentDatatype: Cesium.ComponentDatatype.FLOAT,
                componentsPerAttribute: 3,
                values: a
            }),
            new Cesium.Geometry({
                attributes: l,
                indices: o,
                primitiveType: Cesium.PrimitiveType.TRIANGLES
            })
        }
        ,
        _.getGeometryVertice = function(e, t, n, i) {
            var r, a = 0;
            for (r = 0; r < e.length; r += 3) {
                if (e[r] === n.x && e[r + 1] === n.y && e[r + 2] === n.z)
                    return a;
                a++
            }
            return e.push(n.x, n.y, n.z),
            t.push(i.x, i.y, i.z),
            a
        }
        ,
        _
    }),
    r("Util/defineProperty", [], function() {
        return function(n, i, e, r) {
            n["_" + i] = e;
            var t = {
                get: function() {
                    return this["_" + i]
                },
                set: function(e) {
                    var t = e != this["_" + i];
                    this["_" + i] && this["_" + i].equals && e && (t = this["_" + i].equals(e)),
                    this["_" + i] = e,
                    "function" == typeof r && t && r(t, n)
                }
            }
              , a = {};
            a[i] = t,
            Cesium.defineProperties(n, a)
        }
    }),
    r("Core/MeshMaterial", ["Util/defineProperty"], function(o) {
        var r = Cesium.defaultValue;
        function a(e) {
            (e = r(e, {})).uniforms = r(e.uniforms, {});
            var t = this;
            function n(e) {
                var t = {};
                for (var n in e)
                    if (e.hasOwnProperty(n) && Cesium.defined(e[n])) {
                        var i = e[n]
                          , r = {
                            needsUpdate: !0
                        };
                        if (Cesium.isArray(i) && 3 <= i.length && i.length <= 4 && "number" == typeof i[0])
                            e[n] = new Cesium.Color(e[n][0],e[n][1],e[n][2],e[n][3]);
                        else if (Cesium.defined(i.value))
                            for (var a in i)
                                i.hasOwnProperty(a) && (r[a] = i[a]);
                        e[n].hasOwnProperty("uuid") ? o(r, "uuid", e[n].uuid, function(e, t) {
                            t.needsUpdate = e
                        }) : o(r, "uuid", Cesium.createGuid(), function(e, t) {
                            t.needsUpdate = e
                        }),
                        e[n].hasOwnProperty("value") ? o(r, "value", e[n].value, function(e, t) {
                            t.needsUpdate = e
                        }) : o(r, "value", e[n], function(e, t) {
                            t.needsUpdate = e
                        }),
                        t[n] = r
                    }
                return t
            }
            function i(e) {
                t.needsUpdate = e
            }
            this._uuid = Cesium.createGuid(),
            this._defaultColor = r(e.defaultColor, Cesium.Color.WHITE),
            "string" == typeof this._defaultColor && (this._defaultColor = Cesium.Color.fromCssColorString(this._defaultColor)),
            this._pickedColor = r(e.pickedColor, Cesium.Color.YELLOW),
            "string" == typeof this._pickedColor && (this._pickedColor = Cesium.Color.fromCssColorString(this._pickedColor)),
            this._picked = r(e.picked, 0),
            e.uniforms.pickedColor = this._pickedColor,
            e.uniforms.defaultColor = this._defaultColor,
            e.uniforms.picked = this._picked,
            this._uniforms = n(e.uniforms),
            o(this, "translucent", r(e.translucent, !1), i),
            o(this, "wireframe", r(e.wireframe, !1), i),
            o(this, "side", r(e.side, a.Sides.DOUBLE), i),
            o(this, "uniformStateUsed", r(e.uniformStateUsed, [{
                uniformStateName: "model",
                glslVarName: "modelMatrix"
            }]), i),
            o(this, "uniforms", this._uniforms, function() {
                t._uniforms = n(t._uniforms)
            }),
            this._vertexShader = "//#inner\n void main() {\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n\n}",
            this._fragmentShader = "//#inner" + this._uuid + "\n uniform float picked;\n uniform vec4  pickedColor;\n uniform vec4  defaultColor;\n void main() {\ngl_FragColor = defaultColor;\n if(picked!=0.0){\ngl_FragColor = pickedColor;}}",
            o(this, "vertexShader", r(e.vertexShader, this._vertexShader), i),
            o(this, "fragmentShader", r(e.fragmentShader, this._fragmentShader), i),
            this.depthTest = r(e.depthTest, !0),
            this.depthMask = r(e.depthMask, !0),
            this.blending = r(e.blending, !0),
            this.needsUpdate = !0
        }
        return Cesium.defineProperties(a.prototype, {
            uuid: {
                get: function() {
                    return this._uuid
                }
            },
            defaultColor: {
                set: function(e) {
                    "string" == typeof e && (e = Cesium.Color.fromCssColorString(e)),
                    Cesium.Color.clone(e, this._defaultColor)
                },
                get: function() {
                    return this._defaultColor
                }
            }
        }),
        a.Sides = {
            FRONT: 3,
            BACK: 1,
            DOUBLE: 2
        },
        a
    }),
    r("Core/GeometryUtils", ["Util/CSG"], function(f) {
        function m() {}
        function _(e) {
            var t = [];
            for (var n in e.attributes)
                e.attributes.hasOwnProperty(n) && e.attributes[n] && t.push(n);
            return t
        }
        var r = new Cesium.Cartesian3
          , a = (new Cesium.Quaternion,
        new Cesium.Matrix4)
          , o = new Cesium.Matrix3;
        m.rotateX = function(e, t) {
            var n = e.attributes.position.values;
            Cesium.Matrix3.fromRotationX(t, o),
            Cesium.Matrix4.fromRotationTranslation(o, Cesium.Cartesian3.ZERO, a);
            for (var i = 0; i < n.length; i += 3)
                r.x = n[i],
                r.y = n[i + 1],
                r.z = n[i + 2],
                Cesium.Matrix4.multiplyByPoint(a, r, r),
                n[i] = r.x,
                n[i + 1] = r.y,
                n[i + 2] = r.z
        }
        ,
        m.rotateY = function(e, t) {
            var n = e.attributes.position.values;
            Cesium.Matrix3.fromRotationY(t, o),
            Cesium.Matrix4.fromRotationTranslation(o, Cesium.Cartesian3.ZERO, a);
            for (var i = 0; i < n.length; i += 3)
                r.x = n[i],
                r.y = n[i + 1],
                r.z = n[i + 2],
                Cesium.Matrix4.multiplyByPoint(a, r, r),
                n[i] = r.x,
                n[i + 1] = r.y,
                n[i + 2] = r.z
        }
        ,
        m.rotateZ = function(e, t) {
            var n = e.attributes.position.values;
            Cesium.Matrix3.fromRotationZ(t, o),
            Cesium.Matrix4.fromRotationTranslation(o, Cesium.Cartesian3.ZERO, a);
            for (var i = 0; i < n.length; i += 3)
                r.x = n[i],
                r.y = n[i + 1],
                r.z = n[i + 2],
                Cesium.Matrix4.multiplyByPoint(a, r, r),
                n[i] = r.x,
                n[i + 1] = r.y,
                n[i + 2] = r.z
        }
        ,
        m.computeVertexNormals = function(e) {
            var t = e.indices
              , n = e.attributes
              , i = t.length;
            if (n.position) {
                var r = n.position.values;
                if (void 0 === n.normal)
                    n.normal = new Cesium.GeometryAttribute({
                        componentDatatype: Cesium.ComponentDatatype.FLOAT,
                        componentsPerAttribute: 3,
                        values: new Float32Array(r.length)
                    });
                else
                    for (var a = n.normal.values, o = 0; o < i; o++)
                        a[o] = 0;
                var s, l, c, d = n.normal.values, u = new Cesium.Cartesian3, f = new Cesium.Cartesian3, m = new Cesium.Cartesian3, p = new Cesium.Cartesian3, h = new Cesium.Cartesian3;
                for (o = 0; o < i; o += 3)
                    s = 3 * t[o + 0],
                    l = 3 * t[o + 1],
                    c = 3 * t[o + 2],
                    Cesium.Cartesian3.fromArray(r, s, u),
                    Cesium.Cartesian3.fromArray(r, l, f),
                    Cesium.Cartesian3.fromArray(r, c, m),
                    Cesium.Cartesian3.subtract(m, f, p),
                    Cesium.Cartesian3.subtract(u, f, h),
                    Cesium.Cartesian3.cross(p, h, p),
                    d[s] += p.x,
                    d[1 + s] += p.y,
                    d[2 + s] += p.z,
                    d[l] += p.x,
                    d[1 + l] += p.y,
                    d[2 + l] += p.z,
                    d[c] += p.x,
                    d[1 + c] += p.y,
                    d[2 + c] += p.z;
                !function(e) {
                    for (var t, n, i, r, a = e.attributes.normal.values, o = 0; o < a.length; o += 3)
                        t = a[o],
                        n = a[o + 1],
                        i = a[o + 2],
                        r = 1 / Math.sqrt(t * t + n * n + i * i),
                        a[o] = t * r,
                        a[o + 1] = n * r,
                        a[o + 2] = i * r
                }(e),
                n.normal.needsUpdate = !0
            }
            return e
        }
        ,
        m.mergeGeometries = function(e) {
            if (!e || !e.length)
                throw new Error("缺少geometries参数");
            if (1 == e.length)
                return e[0];
            for (var t = [], n = !1, i = !1, r = e[0].primitiveType, a = 0; a < e.length; a++) {
                if (t[a] = _(e[a]),
                0 < a) {
                    if (r != e[a].primitiveType) {
                        i = !0;
                        break
                    }
                    var o = t[a - 1];
                    if (!(n = o.length != t[a].length))
                        for (var s = 0; s < o.length; s++)
                            if (o[s] != t[a][s]) {
                                n = !0;
                                break
                            }
                }
                if (r = e[a].primitiveType,
                n || i)
                    break
            }
            if (i)
                throw new Error("待合并的几何体中primitiveType属性不完全一致");
            if (n)
                throw new Error("待合并的几何体中属性数量和和名称不完全一致");
            var l = {}
              , c = t[0];
            for (a = 0; a < c.length; a++) {
                var d = c[a]
                  , u = e[0];
                for (var f in l[d] = {},
                u.attributes[d])
                    u.attributes[d].hasOwnProperty(f) && (l[d][f] = u.attributes[d][f]);
                var m = Array.from(l[d].values);
                for (s = 1; s < e.length; s++) {
                    u = e[s];
                    for (var p = 0; p < u.attributes[d].values.length; p++)
                        m.push(u.attributes[d].values[p])
                }
                l[d].values = new l[d].values.constructor(m)
            }
            var h = []
              , v = 0;
            for (s = 0; s < e.length; s++) {
                for (u = e[0],
                a = 0; a < u.indices.length; a++)
                    h.push(u.indices[a] + v);
                v += u.attributes.position.values.length / 3
            }
            var g = Cesium.BoundingSphere.fromVertices(l.position.values);
            return new Cesium.Geometry({
                attributes: l,
                indices: new Int32Array(h),
                primitiveType: e[0].primitiveType,
                boundingSphere: g
            })
        }
        ;
        var i = new Cesium.Cartesian3;
        return m.translate = function(e, t) {
            Cesium.isArray(t) ? (i.x = t[0],
            i.y = t[1],
            i.z = t[2]) : Cesium.Cartesian3.clone(t, i);
            for (var n = 0; n < e.attributes.position.values.length; n += 3)
                e.attributes.position.values[n] += i.x,
                e.attributes.position.values[n + 1] += i.y,
                e.attributes.position.values[n + 2] += i.z
        }
        ,
        m.getAttributeComponentType = function(e) {
            var t = Cesium.ComponentDatatype.SHORT;
            return e instanceof Int8Array ? t = Cesium.ComponentDatatype.BYTE : e instanceof Uint8Array || e instanceof Uint8ClampedArray ? t = Cesium.ComponentDatatype.UNSIGNED_BYTE : e instanceof Int16Array ? t = Cesium.ComponentDatatype.SHORT : e instanceof Uint16Array ? t = Cesium.ComponentDatatype.UNSIGNED_SHORT : e instanceof Int32Array ? t = Cesium.ComponentDatatype.INT : e instanceof Uint32Array ? t = Cesium.ComponentDatatype.UNSIGNED_INT : e instanceof Float32Array ? t = Cesium.ComponentDatatype.FLOAT : e instanceof Float64Array && (t = Cesium.ComponentDatatype.DOUBLE),
            t
        }
        ,
        m.isGeometry3js = function(e) {
            return "undefined" != typeof THREE && (e instanceof THREE.Geometry || e instanceof THREE.BufferGeometry) || e.attributes && e.attributes.position && e.index || e.vertices && e.faces
        }
        ,
        m.parseBufferGeometry3js = function(e) {
            var t = {};
            for (var n in e.attributes.normal || e.computeFaceNormals(),
            e.attributes)
                if (e.attributes.hasOwnProperty(n)) {
                    var i = e.getAttribute(n);
                    i && 0 < i.array.length && (t[n] = new Cesium.GeometryAttribute({
                        componentDatatype: m.getAttributeComponentType(i.array),
                        componentsPerAttribute: i.itemSize,
                        values: i.array,
                        normalize: i.normalized
                    }))
                }
            var r = [];
            return r = !e.index && e.groups ? (e.groups.forEach(function(e) {
                for (var t = 0; t < e.count; t++)
                    r.push(t + e.start)
            }),
            new Int32Array(r)) : e.index.array,
            new Cesium.Geometry({
                attributes: t,
                indices: r,
                primitiveType: Cesium.PrimitiveType.TRIANGLES
            })
        }
        ,
        m.fromGeometry3js = function(e) {
            e.attributes && (e.index || e.groups.length) || (e = (new THREE.BufferGeometry).fromGeometry(e));
            var t = m.parseBufferGeometry3js(e);
            return Cesium.GeometryPipeline.computeNormal(t),
            t
        }
        ,
        m.toGeometry3js = function(e) {
            if ("undefined" == typeof THREE)
                throw new Error("THREE 未加载");
            for (var t = e.attributes.position.values, n = 0, i = new THREE.Geometry, r = 0; r < t.length; r += 3)
                n = 3 * r,
                i.vertices.push(new THREE.Vector3(t[n],t[n + 2],t[n + 1]));
            for (r = 0; r < e.indices.length; r += 3) {
                var a = e.indices[r]
                  , o = e.indices[r + 1]
                  , s = e.indices[r + 2];
                i.faces.push(new THREE.Face3(a,o,s))
            }
            return i
        }
        ,
        m.toCSG = function(e, t) {
            if ("undefined" != typeof THREE && e instanceof THREE.Geometry)
                return m._toCSG3js(e, t);
            if (t || (t = {
                x: 0,
                y: 0,
                z: 0
            }),
            e.attributes.normal || (e = Cesium.GeometryPipeline.computeNormal(e)),
            e.primitiveType !== Cesium.PrimitiveType.TRIANGLES)
                throw new Error("暂不支持此类几何体");
            if (!f)
                throw new Error("CSG 库未加载。请从 https://github.com/evanw/csg.js 获取");
            e.indices.length;
            for (var n = [], i = [], r = e.attributes.position.values, a = e.attributes.normal.values, o = 0, s = 0, l = 0; l < e.indices.length; l += 3) {
                i = [];
                var c = e.indices[l]
                  , d = e.indices[l + 1]
                  , u = e.indices[l + 2];
                o = s = 3 * c,
                i.push(new f.Vertex([r[s++] + t.x, r[s++] + t.y, r[s++] + t.z],[a[o++], a[o++], a[o++]])),
                o = s = 3 * d,
                i.push(new f.Vertex([r[s++] + t.x, r[s++] + t.y, r[s++] + t.z],[a[o++], a[o++], a[o++]])),
                o = s = 3 * u,
                i.push(new f.Vertex([r[s++] + t.x, r[s++] + t.y, r[s++] + t.z],[a[o++], a[o++], a[o++]])),
                n.push(new f.Polygon(i))
            }
            return f.fromPolygons(n)
        }
        ,
        m.fromCSG = function(e, t) {
            if ("undefined" != typeof THREE && geometry instanceof THREE.Geometry)
                return m._fromCSG3js(geometry, offset);
            var n, i, r = e.toPolygons();
            if (!f)
                throw new Error("CSG 库未加载。请从 https://github.com/evanw/csg.js 获取");
            var a = []
              , o = []
              , s = [];
            for (n = 0; n < r.length; n++) {
                for (i = [],
                l = 0; l < r[n].vertices.length; l++)
                    i.push(this.getGeometryVertice(a, o, r[n].vertices[l].pos, r[n].plane.normal));
                i[0] === i[i.length - 1] && i.pop();
                for (var l = 2; l < i.length; l++)
                    s.push(i[0], i[l - 1], i[l])
            }
            a = new Float32Array(a),
            o = new Float32Array(o),
            s = new Int32Array(s);
            var c = {};
            return c.position = new Cesium.GeometryAttribute({
                componentDatatype: Cesium.ComponentDatatype.FLOAT,
                componentsPerAttribute: 3,
                values: a
            }),
            c.normal = new Cesium.GeometryAttribute({
                componentDatatype: Cesium.ComponentDatatype.FLOAT,
                componentsPerAttribute: 3,
                values: o
            }),
            new Cesium.Geometry({
                attributes: c,
                indices: s,
                primitiveType: Cesium.PrimitiveType.TRIANGLES
            })
        }
        ,
        m._toCSG3js = function(e, t, n) {
            if ("undefined" == typeof THREE)
                throw new Error("THREE 未加载");
            var i, r, a, o;
            if (!f)
                throw "CSG library not loaded. Please get a copy from https://github.com/evanw/csg.js";
            if (e instanceof THREE.Mesh)
                r = e.geometry,
                t = t || e.position,
                n = n || e.rotation;
            else {
                if (!(e instanceof THREE.Geometry))
                    throw "Model type not supported.";
                r = e,
                t = t || new THREE.Vector3(0,0,0),
                n = n || new THREE.Euler(0,0,0)
            }
            o = (new THREE.Matrix4).makeRotationFromEuler(n);
            var s = [];
            for (i = 0; i < r.faces.length; i++)
                if (r.faces[i]instanceof THREE.Face3)
                    (a = []).push(new f.Vertex(r.vertices[r.faces[i].a].clone().add(t).applyMatrix4(o),[r.faces[i].normal.x, r.faces[i].normal.y, r.faces[i].normal.z])),
                    a.push(new f.Vertex(r.vertices[r.faces[i].b].clone().add(t).applyMatrix4(o),[r.faces[i].normal.x, r.faces[i].normal.y, r.faces[i].normal.z])),
                    a.push(new f.Vertex(r.vertices[r.faces[i].c].clone().add(t).applyMatrix4(o),[r.faces[i].normal.x, r.faces[i].normal.y, r.faces[i].normal.z])),
                    s.push(new f.Polygon(a));
                else {
                    if (!(r.faces[i]instanceof THREE.Face4))
                        throw "Model contains unsupported face.";
                    (a = []).push(new f.Vertex(r.vertices[r.faces[i].a].clone().add(t).applyMatrix4(o),[r.faces[i].normal.x, r.faces[i].normal.y, r.faces[i].normal.z])),
                    a.push(new f.Vertex(r.vertices[r.faces[i].b].clone().add(t).applyMatrix4(o),[r.faces[i].normal.x, r.faces[i].normal.y, r.faces[i].normal.z])),
                    a.push(new f.Vertex(r.vertices[r.faces[i].d].clone().add(t).applyMatrix4(o),[r.faces[i].normal.x, r.faces[i].normal.y, r.faces[i].normal.z])),
                    s.push(new f.Polygon(a)),
                    (a = []).push(new f.Vertex(r.vertices[r.faces[i].b].clone().add(t).applyMatrix4(o),[r.faces[i].normal.x, r.faces[i].normal.y, r.faces[i].normal.z])),
                    a.push(new f.Vertex(r.vertices[r.faces[i].c].clone().add(t).applyMatrix4(o),[r.faces[i].normal.x, r.faces[i].normal.y, r.faces[i].normal.z])),
                    a.push(new f.Vertex(r.vertices[r.faces[i].d].clone().add(t).applyMatrix4(o),[r.faces[i].normal.x, r.faces[i].normal.y, r.faces[i].normal.z])),
                    s.push(new f.Polygon(a))
                }
            return f.fromPolygons(s)
        }
        ,
        m._fromCSG3js = function(e) {
            if ("undefined" == typeof THREE)
                throw new Error("THREE 未加载");
            var t, n, i, r = new THREE.Geometry, a = e.toPolygons();
            if (!f)
                throw "CSG library not loaded. Please get a copy from https://github.com/evanw/csg.js";
            for (t = 0; t < a.length; t++) {
                for (n = [],
                o = 0; o < a[t].vertices.length; o++)
                    n.push(m._getGeometryVertice3js(r, a[t].vertices[o].pos));
                n[0] === n[n.length - 1] && n.pop();
                for (var o = 2; o < n.length; o++)
                    i = new THREE.Face3(n[0],n[o - 1],n[o],(new THREE.Vector3).copy(a[t].plane.normal)),
                    r.faces.push(i),
                    r.faceVertexUvs[0].push(new THREE.Vector2)
            }
            return r.computeBoundingBox(),
            r
        }
        ,
        m._getGeometryVertice3js = function(e, t) {
            var n;
            for (n = 0; n < e.vertices.length; n++)
                if (e.vertices[n].x === t.x && e.vertices[n].y === t.y && e.vertices[n].z === t.z)
                    return n;
            return e.vertices.push(new THREE.Vector3(t.x,t.y,t.z)),
            e.vertices.length - 1
        }
        ,
        m
    }),
    r("Core/Shaders/phong_frag", [], function() {
        return "\nvarying vec3 v_position;\nvarying vec3 v_normal;\nuniform float picked;\nuniform vec4  pickedColor;\nuniform vec4  defaultColor;\nuniform float specular;\nuniform float shininess;\nuniform vec3  emission;\nvoid main() {\n    vec3 positionToEyeEC = -v_position; \n    vec3 normalEC =normalize(v_normal);\n    vec4 color=defaultColor;\n    if(picked!=0.0){\n        color = pickedColor;\n    }\n    czm_material material;\n    material.specular = specular;\n    material.shininess = shininess;\n    material.normal =  normalEC;\n    material.emission =emission;//vec3(0.2,0.2,0.2);\n    material.diffuse = color.rgb ;\n    material.alpha =  color.a;\n    gl_FragColor =  czm_phong(normalize(positionToEyeEC), material);\n}"
    }),
    r("Core/Shaders/phong_vert", [], function() {
        return "\n#ifdef GL_ES\n    precision highp float;\n#endif\n\n\n\nvarying vec3 v_position;\nvarying vec3 v_normal;\n\nvarying vec3 v_light0Direction;\n\nvoid main(void) \n{\n    vec4 pos =  modelViewMatrix * vec4( position,1.0);\n    v_normal =  normalMatrix *  normal;\n    v_position = pos.xyz;\n    v_light0Direction = mat3( modelViewMatrix) * vec3(1.0,1.0,1.0);\n    gl_Position =  projectionMatrix * pos;\n}"
    }),
    r("Core/MeshPhongMaterial", ["Core/MeshMaterial", "Core/Shaders/phong_frag", "Core/Shaders/phong_vert"], function(t, n, i) {
        function e(e) {
            (e = e || {}).uniforms = e.uniforms ? e.uniforms : {
                shininess: -1,
                emission: [0, 0, 0],
                specular: 0
            },
            e.uniforms.shininess = Cesium.defaultValue(e.uniforms.shininess, 0),
            e.uniforms.emission = Cesium.defaultValue(e.uniforms.emission, [.2, .2, .2]),
            e.uniforms.specular = Cesium.defaultValue(e.uniforms.specular, 0),
            t.apply(this, arguments),
            this.vertexShader = i,
            this.fragmentShader = n
        }
        return e.prototype = new t,
        e
    }),
    r("Core/Mesh", ["Core/Rotation", "Util/CSG", "Core/MeshMaterial", "Core/GeometryUtils", "Core/MeshPhongMaterial"], function(t, n, i, r, a) {
        var o = Cesium.defaultValue;
        function s(e) {
            s.isGeometrySupported(e) && (e = {
                geometry: e,
                material: arguments[1]
            });
            if (!e || !e.geometry)
                throw new Error("geometry是必须参数");
            if (!s.isGeometrySupported(e.geometry))
                throw new Error("暂不支持此类型的geometry");
            r.isGeometry3js(e.geometry) ? e.geometry = r.fromGeometry3js(e.geometry) : e.geometry instanceof n ? (0 == e.geometry.polygons.length && (e.show = !1),
            e.geometry = n.fromCSG(e.geometry)) : "function" == typeof e.geometry.constructor.createGeometry && (e.geometry = e.geometry.constructor.createGeometry(e.geometry)),
            this.uuid = Cesium.createGuid(),
            this.show = o(e.show, !0),
            this._geometry = e.geometry,
            this._material = o(e.material, new i),
            this._position = o(e.position, new Cesium.Cartesian3(0,0,0)),
            this._scale = o(e.scale, new Cesium.Cartesian3(1,1,1)),
            this._rotation = o(e.rotation, {
                axis: new Cesium.Cartesian3(0,0,1),
                angle: 0
            }),
            this._rotation = new t(this._rotation.axis,this._rotation.angle),
            this._needsUpdate = !1,
            this._modelMatrix = new Cesium.Matrix4,
            Cesium.Matrix4.clone(Cesium.Matrix4.IDENTITY, this._modelMatrix),
            this.quaternion = null,
            this._modelMatrixNeedsUpdate = !0,
            this._onNeedUpdateChanged = function() {
                this.modelMatrixNeedsUpdate = !0
            }
            ,
            this._rotation.paramChanged.removeEventListener(this._onNeedUpdateChanged),
            this._drawCommand = null,
            this._children = [],
            this._parent = null,
            this.userData = {},
            !this._geometry.attributes.normal && this.material instanceof a && this._geometry.primitiveType == Cesium.PrimitiveType.TRIANGLES && Cesium.GeometryPipeline.computeNormal(this._geometry)
        }
        return s.isGeometrySupported = function(e) {
            return e instanceof Cesium.Geometry || e instanceof n || "function" == typeof e.constructor.createGeometry || r.isGeometry3js(e)
        }
        ,
        s.traverse = function(e, t) {
            t(e),
            e.children && e.children.forEach(function(e) {
                t(e)
            })
        }
        ,
        Cesium.defineProperties(s.prototype, {
            modelMatrix: {
                get: function() {
                    return this._modelMatrix
                }
            },
            parent: {
                get: function() {
                    return this._parent
                },
                set: function(e) {
                    this._parent = e,
                    this.modelMatrixNeedsUpdate = !0
                }
            },
            modelMatrixNeedsUpdate: {
                get: function() {
                    return this._modelMatrixNeedsUpdate
                },
                set: function(t) {
                    this._modelMatrixNeedsUpdate = t,
                    this._modelMatrixNeedsUpdate && s.traverse(this, function(e) {
                        e._modelMatrixNeedsUpdate = t
                    })
                }
            },
            children: {
                get: function() {
                    return this._children
                },
                set: function(e) {
                    this._children = e,
                    this._needsUpdate = !0
                }
            },
            geometry: {
                get: function() {
                    return this._geometry
                },
                set: function(e) {
                    this._geometry = e,
                    this._needsUpdate = !0,
                    this.modelMatrixNeedsUpdate = !0
                }
            },
            material: {
                get: function() {
                    return this._material
                },
                set: function(e) {
                    this._material = e,
                    this._needsUpdate = !0
                }
            },
            needsUpdate: {
                get: function() {
                    return this._needsUpdate
                },
                set: function(e) {
                    this._needsUpdate = e
                }
            },
            rotation: {
                get: function() {
                    return this._rotation
                },
                set: function(e) {
                    e != this._rotation && (this._rotation = e,
                    this.modelMatrixNeedsUpdate = !0),
                    this._rotation.paramChanged.removeEventListener(this._onNeedUpdateChanged),
                    this._rotation = e,
                    this._rotation.paramChanged.addEventListener(this._onNeedUpdateChanged)
                }
            },
            position: {
                get: function() {
                    return this._position
                },
                set: function(e) {
                    e.x == this._position.x && e.y == this._position.y && e.z == this._position.z || (this._position = e,
                    this.modelMatrixNeedsUpdate = !0),
                    this._position = e
                }
            },
            scale: {
                get: function() {
                    return this._scale
                },
                set: function(e) {
                    e.x == this._scale.x && e.y == this._scale.y && e.z == this._scale.z || (this._scale = e,
                    this.modelMatrixNeedsUpdate = !0),
                    this._scale = e
                }
            }
        }),
        s.prototype.add = function(e) {
            e.parent !== this && (e.parent = this),
            this._children.push(e)
        }
        ,
        s
    }),
    r("Core/Shaders/none_frag", [], function() {
        return "\n#ifdef GL_ES\n    precision highp float;\n#endif\n\nvarying vec3 v_position;\n\nuniform vec4 ambientColor;\nuniform vec4 diffuseColor;\nuniform vec4 specularColor;\nuniform float specularShininess;\nuniform float picked;\nuniform vec4  pickedColor;\n\nvoid main(void) \n{\n    vec4 color = vec4(0.0, 0.0, 0.0, 0.0);\n    vec4 ambient = ambientColor;\n    vec4 diffuse = diffuseColor;\n    vec4 specular = specularColor;\n    color.xyz += ambient.xyz;\n    color.xyz += diffuse.xyz;\n    color.xyz += specular.xyz;\n    color = vec4(color.rgb * diffuse.a, diffuse.a);\n    gl_FragColor = color;\n    if(picked!=0.0){\n        gl_FragColor =mix(color, pickedColor*0.5,1.0);\n    }\n}"
    }),
    r("Core/Shaders/none_vert", [], function() {
        return "\n#ifdef GL_ES\n    precision highp float;\n#endif\n\n\n\nvarying vec3 v_position;\n\nvoid main(void) \n{\n    vec4 pos =  modelViewMatrix * vec4( position,1.0);\n    v_position = pos.xyz;\n    gl_Position =  projectionMatrix * pos;\n}"
    }),
    r("Core/Shaders/normals_frag", [], function() {
        return "\n#ifdef GL_ES\n    precision highp float;\n#endif\n\nvarying vec3 v_position;\nvarying vec3 v_normal;\n\nuniform vec4 ambientColor;\nuniform vec4 diffuseColor;\nuniform vec4 specularColor;\nuniform float specularShininess;\nuniform float alpha;\nuniform float picked;\nuniform vec4  pickedColor;\n\nvarying vec3 v_light0Direction;\n\nvoid main(void) \n{\n    vec3 normal = normalize(v_normal);\n    vec4 color = vec4(0.0, 0.0, 0.0, 0.0);\n    vec3 diffuseLight = vec3(0.0, 0.0, 0.0);\n    vec3 lightColor = vec3(1.0,1.0,1.0);\nvec4 ambient = ambientColor;\n    vec4 diffuse = diffuseColor;\n    vec4 specular = specularColor;\n\n    vec3 specularLight = vec3(0.0, 0.0, 0.0);\n    {\n        float specularIntensity = 0.0;\n        float attenuation = 1.0;\n        vec3 l = normalize(v_light0Direction);\n        vec3 viewDir = -normalize(v_position);\n        vec3 h = normalize(l+viewDir);\n        specularIntensity = max(0.0, pow(max(dot(normal,h), 0.0) , specularShininess)) * attenuation;\n        specularLight += lightColor * specularIntensity;\n        diffuseLight += lightColor * max(dot(normal,l), 0.0) * attenuation;\n    }\n    //specular.xyz *= specularLight;\n    //diffuse.xyz *= diffuseLight;\n    color.xyz += ambient.xyz;\n    color.xyz += diffuse.xyz;\n    color.xyz += specular.xyz;\n    color = vec4(color.rgb * diffuse.a, diffuse.a*alpha);\n    gl_FragColor = color;\n    if(picked!=0.0){\n        gl_FragColor =mix(color, pickedColor*0.5,1.0);\n    }\n}"
    }),
    r("Core/Shaders/normals_vert", [], function() {
        return "\n#ifdef GL_ES\n    precision highp float;\n#endif\n\n\n\nvarying vec3 v_position;\nvarying vec3 v_normal;\n\nvarying vec3 v_light0Direction;\n\nvoid main(void) \n{\n    vec4 pos =  modelViewMatrix * vec4( position,1.0);\n    v_normal =  normalMatrix *  normal;\n    v_position = pos.xyz;\n    v_light0Direction = mat3( modelViewMatrix) * vec3(1.0,1.0,1.0);\n    gl_Position =  projectionMatrix * pos;\n}"
    }),
    r("Core/Shaders/texture_frag", [], function() {
        return "\n#ifdef GL_ES\n    precision highp float;\n#endif\n\nvarying vec3 v_position;\nvarying vec2 v_texcoord0;\n\nuniform vec4 ambientColor;\nuniform sampler2D diffuseColorMap;\nuniform vec4 specularColor;\nuniform float specularShininess;\nuniform float picked;\nuniform vec4  pickedColor;\n\nuniform float alpha;\n\nvoid main(void) \n{\n    vec4 color = vec4(0.0, 0.0, 0.0, 0.0);\n    vec3 diffuseLight = vec3(0.0, 0.0, 0.0);\n    vec3 lightColor = vec3(1.0,1.0,1.0);\n    vec4 ambient = ambientColor;\n    vec4 diffuse = texture2D(diffuseColorMap, v_texcoord0);\n    vec4 specular = specularColor;\n    color.xyz += ambient.xyz;\n    color.xyz += diffuse.xyz;\n    color.xyz += specular.xyz;\n    color = vec4(diffuse.rgb * diffuse.a, diffuse.a*alpha);\n    gl_FragColor = color;\n    if(picked!=0.0){\n        gl_FragColor =mix(color, pickedColor*0.5,1.0);\n    }\n}"
    }),
    r("Core/Shaders/texture_vert", [], function() {
        return "\n#ifdef GL_ES\n    precision highp float;\n#endif\n\n\n\nvarying vec3 v_position;\nvarying vec2 v_texcoord0;\n\nvoid main(void) \n{\n    vec4 pos =  modelViewMatrix * vec4( position,1.0);\n    v_texcoord0 =  uv;\n    v_position = pos.xyz;\n    gl_Position =  projectionMatrix * pos;\n}"
    }),
    r("Core/Shaders/texture_normals_frag", [], function() {
        return "\n#ifdef GL_ES\n    precision highp float;\n#endif\n\nvarying vec3 v_position;\nvarying vec2 v_texcoord0;\nvarying vec3 v_normal;\n\nuniform vec4 ambientColor;\nuniform sampler2D diffuseColorMap;\nuniform vec4 specularColor;\nuniform float specularShininess;\nuniform float picked;\nuniform vec4  pickedColor;\n\nvarying vec3 v_light0Direction;\n\nvoid main(void) \n{\n    vec3 normal = normalize(v_normal);\n    vec4 color = vec4(0.0, 0.0, 0.0, 0.0);\n    vec3 diffuseLight = vec3(0.0, 0.0, 0.0);\n    vec3 lightColor = vec3(1.0,1.0,1.0);\n    vec4 ambient = ambientColor;\n    vec4 diffuse = texture2D(diffuseColorMap, v_texcoord0);\n    vec4 specular = specularColor;\n\n    vec3 specularLight = vec3(0.0, 0.0, 0.0);\n    {\n        float specularIntensity = 0.0;\n        float attenuation = 1.0;\n        vec3 l = normalize(v_light0Direction);\n        vec3 viewDir = -normalize(v_position);\n        vec3 h = normalize(l+viewDir);\n        specularIntensity = max(0.0, pow(max(dot(normal,h), 0.0) , specularShininess)) * attenuation;\n        specularLight += lightColor * specularIntensity;\n        diffuseLight += lightColor * max(dot(normal,l), 0.0) * attenuation;\n    }\n    //specular.xyz *= specularLight;\n    //diffuse.xyz *= diffuseLight;\n    color.xyz += ambient.xyz;\n    color.xyz += diffuse.xyz;\n    color.xyz += specular.xyz;\n    color = vec4(diffuse.rgb * diffuse.a, diffuse.a);\n    gl_FragColor = color;\n    if(picked!=0.0){\n        gl_FragColor = pickedColor*color;\n    }\n}"
    }),
    r("Core/Shaders/texture_normals_vert", [], function() {
        return "\n#ifdef GL_ES\n    precision highp float;\n#endif\n\n\n\nvarying vec3 v_position;\nvarying vec2 v_texcoord0;\nvarying vec3 v_normal;\n\nvarying vec3 v_light0Direction;\n\nvoid main(void) \n{\n    vec4 pos =  modelViewMatrix * vec4( position,1.0);\n    v_normal =  normalMatrix *  normal;\n    v_texcoord0 =uv;\n    v_position = pos.xyz;\n    v_light0Direction = mat3( modelViewMatrix) * vec3(1.0,1.0,1.0);\n    gl_Position =  projectionMatrix * pos;\n}"
    }),
    r("Core/Shaders/ShaderChunk", ["Core/Shaders/none_frag", "Core/Shaders/none_vert", "Core/Shaders/normals_frag", "Core/Shaders/normals_vert", "Core/Shaders/texture_frag", "Core/Shaders/texture_vert", "Core/Shaders/texture_normals_frag", "Core/Shaders/texture_normals_vert"], function(e, t, n, i, r, a, o, s) {
        var l = {
            alphamap_fragment: "#ifdef USE_ALPHAMAP\n\tdiffuseColor.a *= texture2D( alphaMap, vUv ).g;\n#endif\n",
            alphamap_pars_fragment: "#ifdef USE_ALPHAMAP\n\tuniform sampler2D alphaMap;\n#endif\n",
            alphatest_fragment: "#ifdef ALPHATEST\n\tif ( diffuseColor.a < ALPHATEST ) discard;\n#endif\n",
            aomap_fragment: "#ifdef USE_AOMAP\n\tfloat ambientOcclusion = ( texture2D( aoMap, vUv2 ).r - 1.0 ) * aoMapIntensity + 1.0;\n\treflectedLight.indirectDiffuse *= ambientOcclusion;\n\t#if defined( USE_ENVMAP ) && defined( PHYSICAL )\n\t\tfloat dotNV = saturate( dot( geometry.normal, geometry.viewDir ) );\n\t\treflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.specularRoughness );\n\t#endif\n#endif\n",
            aomap_pars_fragment: "#ifdef USE_AOMAP\n\tuniform sampler2D aoMap;\n\tuniform float aoMapIntensity;\n#endif",
            begin_vertex: "\nvec3 transformed = vec3( position );\n",
            beginnormal_vertex: "\nvec3 objectNormal = vec3( normal );\n",
            bsdfs: "float punctualLightIntensityToIrradianceFactor( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {\n\tif( decayExponent > 0.0 ) {\n#if defined ( PHYSICALLY_CORRECT_LIGHTS )\n\t\tfloat distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );\n\t\tfloat maxDistanceCutoffFactor = pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );\n\t\treturn distanceFalloff * maxDistanceCutoffFactor;\n#else\n\t\treturn pow( saturate( -lightDistance / cutoffDistance + 1.0 ), decayExponent );\n#endif\n\t}\n\treturn 1.0;\n}\nvec3 BRDF_Diffuse_Lambert( const in vec3 diffuseColor ) {\n\treturn RECIPROCAL_PI * diffuseColor;\n}\nvec3 F_Schlick( const in vec3 specularColor, const in float dotLH ) {\n\tfloat fresnel = exp2( ( -5.55473 * dotLH - 6.98316 ) * dotLH );\n\treturn ( 1.0 - specularColor ) * fresnel + specularColor;\n}\nfloat G_GGX_Smith( const in float alpha, const in float dotNL, const in float dotNV ) {\n\tfloat a2 = pow2( alpha );\n\tfloat gl = dotNL + sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );\n\tfloat gv = dotNV + sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );\n\treturn 1.0 / ( gl * gv );\n}\nfloat G_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {\n\tfloat a2 = pow2( alpha );\n\tfloat gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );\n\tfloat gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );\n\treturn 0.5 / max( gv + gl, EPSILON );\n}\nfloat D_GGX( const in float alpha, const in float dotNH ) {\n\tfloat a2 = pow2( alpha );\n\tfloat denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;\n\treturn RECIPROCAL_PI * a2 / pow2( denom );\n}\nvec3 BRDF_Specular_GGX( const in IncidentLight incidentLight, const in GeometricContext geometry, const in vec3 specularColor, const in float roughness ) {\n\tfloat alpha = pow2( roughness );\n\tvec3 halfDir = normalize( incidentLight.direction + geometry.viewDir );\n\tfloat dotNL = saturate( dot( geometry.normal, incidentLight.direction ) );\n\tfloat dotNV = saturate( dot( geometry.normal, geometry.viewDir ) );\n\tfloat dotNH = saturate( dot( geometry.normal, halfDir ) );\n\tfloat dotLH = saturate( dot( incidentLight.direction, halfDir ) );\n\tvec3 F = F_Schlick( specularColor, dotLH );\n\tfloat G = G_GGX_SmithCorrelated( alpha, dotNL, dotNV );\n\tfloat D = D_GGX( alpha, dotNH );\n\treturn F * ( G * D );\n}\nvec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {\n\tconst float LUT_SIZE  = 64.0;\n\tconst float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;\n\tconst float LUT_BIAS  = 0.5 / LUT_SIZE;\n\tfloat theta = acos( dot( N, V ) );\n\tvec2 uv = vec2(\n\t\tsqrt( saturate( roughness ) ),\n\t\tsaturate( theta / ( 0.5 * PI ) ) );\n\tuv = uv * LUT_SCALE + LUT_BIAS;\n\treturn uv;\n}\nfloat LTC_ClippedSphereFormFactor( const in vec3 f ) {\n\tfloat l = length( f );\n\treturn max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );\n}\nvec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {\n\tfloat x = dot( v1, v2 );\n\tfloat y = abs( x );\n\tfloat a = 0.86267 + (0.49788 + 0.01436 * y ) * y;\n\tfloat b = 3.45068 + (4.18814 + y) * y;\n\tfloat v = a / b;\n\tfloat theta_sintheta = (x > 0.0) ? v : 0.5 * inversesqrt( 1.0 - x * x ) - v;\n\treturn cross( v1, v2 ) * theta_sintheta;\n}\nvec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {\n\tvec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];\n\tvec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];\n\tvec3 lightNormal = cross( v1, v2 );\n\tif( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );\n\tvec3 T1, T2;\n\tT1 = normalize( V - N * dot( V, N ) );\n\tT2 = - cross( N, T1 );\n\tmat3 mat = mInv * transpose( mat3( T1, T2, N ) );\n\tvec3 coords[ 4 ];\n\tcoords[ 0 ] = mat * ( rectCoords[ 0 ] - P );\n\tcoords[ 1 ] = mat * ( rectCoords[ 1 ] - P );\n\tcoords[ 2 ] = mat * ( rectCoords[ 2 ] - P );\n\tcoords[ 3 ] = mat * ( rectCoords[ 3 ] - P );\n\tcoords[ 0 ] = normalize( coords[ 0 ] );\n\tcoords[ 1 ] = normalize( coords[ 1 ] );\n\tcoords[ 2 ] = normalize( coords[ 2 ] );\n\tcoords[ 3 ] = normalize( coords[ 3 ] );\n\tvec3 vectorFormFactor = vec3( 0.0 );\n\tvectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );\n\tvectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );\n\tvectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );\n\tvectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );\n\tvec3 result = vec3( LTC_ClippedSphereFormFactor( vectorFormFactor ) );\n\treturn result;\n}\nvec3 BRDF_Specular_GGX_Environment( const in GeometricContext geometry, const in vec3 specularColor, const in float roughness ) {\n\tfloat dotNV = saturate( dot( geometry.normal, geometry.viewDir ) );\n\tconst vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );\n\tconst vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );\n\tvec4 r = roughness * c0 + c1;\n\tfloat a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;\n\tvec2 AB = vec2( -1.04, 1.04 ) * a004 + r.zw;\n\treturn specularColor * AB.x + AB.y;\n}\nfloat G_BlinnPhong_Implicit( ) {\n\treturn 0.25;\n}\nfloat D_BlinnPhong( const in float shininess, const in float dotNH ) {\n\treturn RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );\n}\nvec3 BRDF_Specular_BlinnPhong( const in IncidentLight incidentLight, const in GeometricContext geometry, const in vec3 specularColor, const in float shininess ) {\n\tvec3 halfDir = normalize( incidentLight.direction + geometry.viewDir );\n\tfloat dotNH = saturate( dot( geometry.normal, halfDir ) );\n\tfloat dotLH = saturate( dot( incidentLight.direction, halfDir ) );\n\tvec3 F = F_Schlick( specularColor, dotLH );\n\tfloat G = G_BlinnPhong_Implicit( );\n\tfloat D = D_BlinnPhong( shininess, dotNH );\n\treturn F * ( G * D );\n}\nfloat GGXRoughnessToBlinnExponent( const in float ggxRoughness ) {\n\treturn ( 2.0 / pow2( ggxRoughness + 0.0001 ) - 2.0 );\n}\nfloat BlinnExponentToGGXRoughness( const in float blinnExponent ) {\n\treturn sqrt( 2.0 / ( blinnExponent + 2.0 ) );\n}\n",
            bumpmap_pars_fragment: "#ifdef USE_BUMPMAP\n\tuniform sampler2D bumpMap;\n\tuniform float bumpScale;\n\tvec2 dHdxy_fwd() {\n\t\tvec2 dSTdx = dFdx( vUv );\n\t\tvec2 dSTdy = dFdy( vUv );\n\t\tfloat Hll = bumpScale * texture2D( bumpMap, vUv ).x;\n\t\tfloat dBx = bumpScale * texture2D( bumpMap, vUv + dSTdx ).x - Hll;\n\t\tfloat dBy = bumpScale * texture2D( bumpMap, vUv + dSTdy ).x - Hll;\n\t\treturn vec2( dBx, dBy );\n\t}\n\tvec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy ) {\n\t\tvec3 vSigmaX = vec3( dFdx( surf_pos.x ), dFdx( surf_pos.y ), dFdx( surf_pos.z ) );\n\t\tvec3 vSigmaY = vec3( dFdy( surf_pos.x ), dFdy( surf_pos.y ), dFdy( surf_pos.z ) );\n\t\tvec3 vN = surf_norm;\n\t\tvec3 R1 = cross( vSigmaY, vN );\n\t\tvec3 R2 = cross( vN, vSigmaX );\n\t\tfloat fDet = dot( vSigmaX, R1 );\n\t\tvec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );\n\t\treturn normalize( abs( fDet ) * surf_norm - vGrad );\n\t}\n#endif\n",
            clipping_planes_fragment: "#if NUM_CLIPPING_PLANES > 0\n\tfor ( int i = 0; i < UNION_CLIPPING_PLANES; ++ i ) {\n\t\tvec4 plane = clippingPlanes[ i ];\n\t\tif ( dot( vViewPosition, plane.xyz ) > plane.w ) discard;\n\t}\n\t\t\n\t#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES\n\t\tbool clipped = true;\n\t\tfor ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; ++ i ) {\n\t\t\tvec4 plane = clippingPlanes[ i ];\n\t\t\tclipped = ( dot( vViewPosition, plane.xyz ) > plane.w ) && clipped;\n\t\t}\n\t\tif ( clipped ) discard;\n\t\n\t#endif\n#endif\n",
            clipping_planes_pars_fragment: "#if NUM_CLIPPING_PLANES > 0\n\t#if ! defined( PHYSICAL ) && ! defined( PHONG )\n\t\tvarying vec3 vViewPosition;\n\t#endif\n\tuniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];\n#endif\n",
            clipping_planes_pars_vertex: "#if NUM_CLIPPING_PLANES > 0 && ! defined( PHYSICAL ) && ! defined( PHONG )\n\tvarying vec3 vViewPosition;\n#endif\n",
            clipping_planes_vertex: "#if NUM_CLIPPING_PLANES > 0 && ! defined( PHYSICAL ) && ! defined( PHONG )\n\tvViewPosition = - mvPosition.xyz;\n#endif\n",
            color_fragment: "#ifdef USE_COLOR\n\tdiffuseColor.rgb *= vColor;\n#endif",
            color_pars_fragment: "#ifdef USE_COLOR\n\tvarying vec3 vColor;\n#endif\n",
            color_pars_vertex: "#ifdef USE_COLOR\n\tvarying vec3 vColor;\n#endif",
            color_vertex: "#ifdef USE_COLOR\n\tvColor.xyz = color.xyz;\n#endif",
            common: "#define PI 3.14159265359\n#define PI2 6.28318530718\n#define PI_HALF 1.5707963267949\n#define RECIPROCAL_PI 0.31830988618\n#define RECIPROCAL_PI2 0.15915494\n#define LOG2 1.442695\n#define EPSILON 1e-6\n#define saturate(a) clamp( a, 0.0, 1.0 )\n#define whiteCompliment(a) ( 1.0 - saturate( a ) )\nfloat pow2( const in float x ) { return x*x; }\nfloat pow3( const in float x ) { return x*x*x; }\nfloat pow4( const in float x ) { float x2 = x*x; return x2*x2; }\nfloat average( const in vec3 color ) { return dot( color, vec3( 0.3333 ) ); }\nhighp float rand( const in vec2 uv ) {\n\tconst highp float a = 12.9898, b = 78.233, c = 43758.5453;\n\thighp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );\n\treturn fract(sin(sn) * c);\n}\nstruct IncidentLight {\n\tvec3 color;\n\tvec3 direction;\n\tbool visible;\n};\nstruct ReflectedLight {\n\tvec3 directDiffuse;\n\tvec3 directSpecular;\n\tvec3 indirectDiffuse;\n\tvec3 indirectSpecular;\n};\nstruct GeometricContext {\n\tvec3 position;\n\tvec3 normal;\n\tvec3 viewDir;\n};\nvec3 transformDirection( in vec3 dir, in mat4 matrix ) {\n\treturn normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );\n}\nvec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {\n\treturn normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );\n}\nvec3 projectOnPlane(in vec3 point, in vec3 pointOnPlane, in vec3 planeNormal ) {\n\tfloat distance = dot( planeNormal, point - pointOnPlane );\n\treturn - distance * planeNormal + point;\n}\nfloat sideOfPlane( in vec3 point, in vec3 pointOnPlane, in vec3 planeNormal ) {\n\treturn sign( dot( point - pointOnPlane, planeNormal ) );\n}\nvec3 linePlaneIntersect( in vec3 pointOnLine, in vec3 lineDirection, in vec3 pointOnPlane, in vec3 planeNormal ) {\n\treturn lineDirection * ( dot( planeNormal, pointOnPlane - pointOnLine ) / dot( planeNormal, lineDirection ) ) + pointOnLine;\n}\nmat3 transpose( const in mat3 v ) {\n\tmat3 tmp;\n\ttmp[0] = vec3(v[0].x, v[1].x, v[2].x);\n\ttmp[1] = vec3(v[0].y, v[1].y, v[2].y);\n\ttmp[2] = vec3(v[0].z, v[1].z, v[2].z);\n\treturn tmp;\n}\n",
            cube_uv_reflection_fragment: "#ifdef ENVMAP_TYPE_CUBE_UV\n#define cubeUV_textureSize (1024.0)\nint getFaceFromDirection(vec3 direction) {\n\tvec3 absDirection = abs(direction);\n\tint face = -1;\n\tif( absDirection.x > absDirection.z ) {\n\t\tif(absDirection.x > absDirection.y )\n\t\t\tface = direction.x > 0.0 ? 0 : 3;\n\t\telse\n\t\t\tface = direction.y > 0.0 ? 1 : 4;\n\t}\n\telse {\n\t\tif(absDirection.z > absDirection.y )\n\t\t\tface = direction.z > 0.0 ? 2 : 5;\n\t\telse\n\t\t\tface = direction.y > 0.0 ? 1 : 4;\n\t}\n\treturn face;\n}\n#define cubeUV_maxLods1  (log2(cubeUV_textureSize*0.25) - 1.0)\n#define cubeUV_rangeClamp (exp2((6.0 - 1.0) * 2.0))\nvec2 MipLevelInfo( vec3 vec, float roughnessLevel, float roughness ) {\n\tfloat scale = exp2(cubeUV_maxLods1 - roughnessLevel);\n\tfloat dxRoughness = dFdx(roughness);\n\tfloat dyRoughness = dFdy(roughness);\n\tvec3 dx = dFdx( vec * scale * dxRoughness );\n\tvec3 dy = dFdy( vec * scale * dyRoughness );\n\tfloat d = max( dot( dx, dx ), dot( dy, dy ) );\n\td = clamp(d, 1.0, cubeUV_rangeClamp);\n\tfloat mipLevel = 0.5 * log2(d);\n\treturn vec2(floor(mipLevel), fract(mipLevel));\n}\n#define cubeUV_maxLods2 (log2(cubeUV_textureSize*0.25) - 2.0)\n#define cubeUV_rcpTextureSize (1.0 / cubeUV_textureSize)\nvec2 getCubeUV(vec3 direction, float roughnessLevel, float mipLevel) {\n\tmipLevel = roughnessLevel > cubeUV_maxLods2 - 3.0 ? 0.0 : mipLevel;\n\tfloat a = 16.0 * cubeUV_rcpTextureSize;\n\tvec2 exp2_packed = exp2( vec2( roughnessLevel, mipLevel ) );\n\tvec2 rcp_exp2_packed = vec2( 1.0 ) / exp2_packed;\n\tfloat powScale = exp2_packed.x * exp2_packed.y;\n\tfloat scale = rcp_exp2_packed.x * rcp_exp2_packed.y * 0.25;\n\tfloat mipOffset = 0.75*(1.0 - rcp_exp2_packed.y) * rcp_exp2_packed.x;\n\tbool bRes = mipLevel == 0.0;\n\tscale =  bRes && (scale < a) ? a : scale;\n\tvec3 r;\n\tvec2 offset;\n\tint face = getFaceFromDirection(direction);\n\tfloat rcpPowScale = 1.0 / powScale;\n\tif( face == 0) {\n\t\tr = vec3(direction.x, -direction.z, direction.y);\n\t\toffset = vec2(0.0+mipOffset,0.75 * rcpPowScale);\n\t\toffset.y = bRes && (offset.y < 2.0*a) ? a : offset.y;\n\t}\n\telse if( face == 1) {\n\t\tr = vec3(direction.y, direction.x, direction.z);\n\t\toffset = vec2(scale+mipOffset, 0.75 * rcpPowScale);\n\t\toffset.y = bRes && (offset.y < 2.0*a) ? a : offset.y;\n\t}\n\telse if( face == 2) {\n\t\tr = vec3(direction.z, direction.x, direction.y);\n\t\toffset = vec2(2.0*scale+mipOffset, 0.75 * rcpPowScale);\n\t\toffset.y = bRes && (offset.y < 2.0*a) ? a : offset.y;\n\t}\n\telse if( face == 3) {\n\t\tr = vec3(direction.x, direction.z, direction.y);\n\t\toffset = vec2(0.0+mipOffset,0.5 * rcpPowScale);\n\t\toffset.y = bRes && (offset.y < 2.0*a) ? 0.0 : offset.y;\n\t}\n\telse if( face == 4) {\n\t\tr = vec3(direction.y, direction.x, -direction.z);\n\t\toffset = vec2(scale+mipOffset, 0.5 * rcpPowScale);\n\t\toffset.y = bRes && (offset.y < 2.0*a) ? 0.0 : offset.y;\n\t}\n\telse {\n\t\tr = vec3(direction.z, -direction.x, direction.y);\n\t\toffset = vec2(2.0*scale+mipOffset, 0.5 * rcpPowScale);\n\t\toffset.y = bRes && (offset.y < 2.0*a) ? 0.0 : offset.y;\n\t}\n\tr = normalize(r);\n\tfloat texelOffset = 0.5 * cubeUV_rcpTextureSize;\n\tvec2 s = ( r.yz / abs( r.x ) + vec2( 1.0 ) ) * 0.5;\n\tvec2 base = offset + vec2( texelOffset );\n\treturn base + s * ( scale - 2.0 * texelOffset );\n}\n#define cubeUV_maxLods3 (log2(cubeUV_textureSize*0.25) - 3.0)\nvec4 textureCubeUV(vec3 reflectedDirection, float roughness ) {\n\tfloat roughnessVal = roughness* cubeUV_maxLods3;\n\tfloat r1 = floor(roughnessVal);\n\tfloat r2 = r1 + 1.0;\n\tfloat t = fract(roughnessVal);\n\tvec2 mipInfo = MipLevelInfo(reflectedDirection, r1, roughness);\n\tfloat s = mipInfo.y;\n\tfloat level0 = mipInfo.x;\n\tfloat level1 = level0 + 1.0;\n\tlevel1 = level1 > 5.0 ? 5.0 : level1;\n\tlevel0 += min( floor( s + 0.5 ), 5.0 );\n\tvec2 uv_10 = getCubeUV(reflectedDirection, r1, level0);\n\tvec4 color10 = envMapTexelToLinear(texture2D(envMap, uv_10));\n\tvec2 uv_20 = getCubeUV(reflectedDirection, r2, level0);\n\tvec4 color20 = envMapTexelToLinear(texture2D(envMap, uv_20));\n\tvec4 result = mix(color10, color20, t);\n\treturn vec4(result.rgb, 1.0);\n}\n#endif\n",
            defaultnormal_vertex: "vec3 transformedNormal = normalMatrix * objectNormal;\n#ifdef FLIP_SIDED\n\ttransformedNormal = - transformedNormal;\n#endif\n",
            displacementmap_pars_vertex: "#ifdef USE_DISPLACEMENTMAP\n\tuniform sampler2D displacementMap;\n\tuniform float displacementScale;\n\tuniform float displacementBias;\n#endif\n",
            displacementmap_vertex: "#ifdef USE_DISPLACEMENTMAP\n\ttransformed += normalize( objectNormal ) * ( texture2D( displacementMap, uv ).x * displacementScale + displacementBias );\n#endif\n",
            emissivemap_fragment: "#ifdef USE_EMISSIVEMAP\n\tvec4 emissiveColor = texture2D( emissiveMap, vUv );\n\temissiveColor.rgb = emissiveMapTexelToLinear( emissiveColor ).rgb;\n\ttotalEmissiveRadiance *= emissiveColor.rgb;\n#endif\n",
            emissivemap_pars_fragment: "#ifdef USE_EMISSIVEMAP\n\tuniform sampler2D emissiveMap;\n#endif\n",
            encodings_fragment: "  gl_FragColor = linearToOutputTexel( gl_FragColor );\n",
            encodings_pars_fragment: "\nvec4 LinearToLinear( in vec4 value ) {\n\treturn value;\n}\nvec4 GammaToLinear( in vec4 value, in float gammaFactor ) {\n\treturn vec4( pow( value.xyz, vec3( gammaFactor ) ), value.w );\n}\nvec4 LinearToGamma( in vec4 value, in float gammaFactor ) {\n\treturn vec4( pow( value.xyz, vec3( 1.0 / gammaFactor ) ), value.w );\n}\nvec4 sRGBToLinear( in vec4 value ) {\n\treturn vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.w );\n}\nvec4 LinearTosRGB( in vec4 value ) {\n\treturn vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.w );\n}\nvec4 RGBEToLinear( in vec4 value ) {\n\treturn vec4( value.rgb * exp2( value.a * 255.0 - 128.0 ), 1.0 );\n}\nvec4 LinearToRGBE( in vec4 value ) {\n\tfloat maxComponent = max( max( value.r, value.g ), value.b );\n\tfloat fExp = clamp( ceil( log2( maxComponent ) ), -128.0, 127.0 );\n\treturn vec4( value.rgb / exp2( fExp ), ( fExp + 128.0 ) / 255.0 );\n}\nvec4 RGBMToLinear( in vec4 value, in float maxRange ) {\n\treturn vec4( value.xyz * value.w * maxRange, 1.0 );\n}\nvec4 LinearToRGBM( in vec4 value, in float maxRange ) {\n\tfloat maxRGB = max( value.x, max( value.g, value.b ) );\n\tfloat M      = clamp( maxRGB / maxRange, 0.0, 1.0 );\n\tM            = ceil( M * 255.0 ) / 255.0;\n\treturn vec4( value.rgb / ( M * maxRange ), M );\n}\nvec4 RGBDToLinear( in vec4 value, in float maxRange ) {\n\treturn vec4( value.rgb * ( ( maxRange / 255.0 ) / value.a ), 1.0 );\n}\nvec4 LinearToRGBD( in vec4 value, in float maxRange ) {\n\tfloat maxRGB = max( value.x, max( value.g, value.b ) );\n\tfloat D      = max( maxRange / maxRGB, 1.0 );\n\tD            = min( floor( D ) / 255.0, 1.0 );\n\treturn vec4( value.rgb * ( D * ( 255.0 / maxRange ) ), D );\n}\nconst mat3 cLogLuvM = mat3( 0.2209, 0.3390, 0.4184, 0.1138, 0.6780, 0.7319, 0.0102, 0.1130, 0.2969 );\nvec4 LinearToLogLuv( in vec4 value )  {\n\tvec3 Xp_Y_XYZp = value.rgb * cLogLuvM;\n\tXp_Y_XYZp = max(Xp_Y_XYZp, vec3(1e-6, 1e-6, 1e-6));\n\tvec4 vResult;\n\tvResult.xy = Xp_Y_XYZp.xy / Xp_Y_XYZp.z;\n\tfloat Le = 2.0 * log2(Xp_Y_XYZp.y) + 127.0;\n\tvResult.w = fract(Le);\n\tvResult.z = (Le - (floor(vResult.w*255.0))/255.0)/255.0;\n\treturn vResult;\n}\nconst mat3 cLogLuvInverseM = mat3( 6.0014, -2.7008, -1.7996, -1.3320, 3.1029, -5.7721, 0.3008, -1.0882, 5.6268 );\nvec4 LogLuvToLinear( in vec4 value ) {\n\tfloat Le = value.z * 255.0 + value.w;\n\tvec3 Xp_Y_XYZp;\n\tXp_Y_XYZp.y = exp2((Le - 127.0) / 2.0);\n\tXp_Y_XYZp.z = Xp_Y_XYZp.y / value.y;\n\tXp_Y_XYZp.x = value.x * Xp_Y_XYZp.z;\n\tvec3 vRGB = Xp_Y_XYZp.rgb * cLogLuvInverseM;\n\treturn vec4( max(vRGB, 0.0), 1.0 );\n}\n",
            envmap_fragment: "#ifdef USE_ENVMAP\n\t#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG )\n\t\tvec3 cameraToVertex = normalize( vWorldPosition - cameraPosition );\n\t\tvec3 worldNormal = inverseTransformDirection( normal, viewMatrix );\n\t\t#ifdef ENVMAP_MODE_REFLECTION\n\t\t\tvec3 reflectVec = reflect( cameraToVertex, worldNormal );\n\t\t#else\n\t\t\tvec3 reflectVec = refract( cameraToVertex, worldNormal, refractionRatio );\n\t\t#endif\n\t#else\n\t\tvec3 reflectVec = vReflect;\n\t#endif\n\t#ifdef ENVMAP_TYPE_CUBE\n\t\tvec4 envColor = textureCube( envMap, flipNormal * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );\n\t#elif defined( ENVMAP_TYPE_EQUIREC )\n\t\tvec2 sampleUV;\n\t\tsampleUV.y = asin( flipNormal * reflectVec.y ) * RECIPROCAL_PI + 0.5;\n\t\tsampleUV.x = atan( flipNormal * reflectVec.z, flipNormal * reflectVec.x ) * RECIPROCAL_PI2 + 0.5;\n\t\tvec4 envColor = texture2D( envMap, sampleUV );\n\t#elif defined( ENVMAP_TYPE_SPHERE )\n\t\tvec3 reflectView = flipNormal * normalize( ( viewMatrix * vec4( reflectVec, 0.0 ) ).xyz + vec3( 0.0, 0.0, 1.0 ) );\n\t\tvec4 envColor = texture2D( envMap, reflectView.xy * 0.5 + 0.5 );\n\t#else\n\t\tvec4 envColor = vec4( 0.0 );\n\t#endif\n\tenvColor = envMapTexelToLinear( envColor );\n\t#ifdef ENVMAP_BLENDING_MULTIPLY\n\t\toutgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );\n\t#elif defined( ENVMAP_BLENDING_MIX )\n\t\toutgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );\n\t#elif defined( ENVMAP_BLENDING_ADD )\n\t\toutgoingLight += envColor.xyz * specularStrength * reflectivity;\n\t#endif\n#endif\n",
            envmap_pars_fragment: "#if defined( USE_ENVMAP ) || defined( PHYSICAL )\n\tuniform float reflectivity;\n\tuniform float envMapIntensity;\n#endif\n#ifdef USE_ENVMAP\n\t#if ! defined( PHYSICAL ) && ( defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) )\n\t\tvarying vec3 vWorldPosition;\n\t#endif\n\t#ifdef ENVMAP_TYPE_CUBE\n\t\tuniform samplerCube envMap;\n\t#else\n\t\tuniform sampler2D envMap;\n\t#endif\n\tuniform float flipEnvMap;\n\t#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( PHYSICAL )\n\t\tuniform float refractionRatio;\n\t#else\n\t\tvarying vec3 vReflect;\n\t#endif\n#endif\n",
            envmap_pars_vertex: "#ifdef USE_ENVMAP\n\t#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG )\n\t\tvarying vec3 vWorldPosition;\n\t#else\n\t\tvarying vec3 vReflect;\n\t\tuniform float refractionRatio;\n\t#endif\n#endif\n",
            envmap_vertex: "#ifdef USE_ENVMAP\n\t#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG )\n\t\tvWorldPosition = worldPosition.xyz;\n\t#else\n\t\tvec3 cameraToVertex = normalize( worldPosition.xyz - cameraPosition );\n\t\tvec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );\n\t\t#ifdef ENVMAP_MODE_REFLECTION\n\t\t\tvReflect = reflect( cameraToVertex, worldNormal );\n\t\t#else\n\t\t\tvReflect = refract( cameraToVertex, worldNormal, refractionRatio );\n\t\t#endif\n\t#endif\n#endif\n",
            fog_vertex: "\n#ifdef USE_FOG\nfogDepth = -mvPosition.z;\n#endif",
            fog_pars_vertex: "#ifdef USE_FOG\n  varying float fogDepth;\n#endif\n",
            fog_fragment: "#ifdef USE_FOG\n\t#ifdef FOG_EXP2\n\t\tfloat fogFactor = whiteCompliment( exp2( - fogDensity * fogDensity * fogDepth * fogDepth * LOG2 ) );\n\t#else\n\t\tfloat fogFactor = smoothstep( fogNear, fogFar, fogDepth );\n\t#endif\n\tgl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );\n#endif\n",
            fog_pars_fragment: "#ifdef USE_FOG\n\tuniform vec3 fogColor;\n\tvarying float fogDepth;\n\t#ifdef FOG_EXP2\n\t\tuniform float fogDensity;\n\t#else\n\t\tuniform float fogNear;\n\t\tuniform float fogFar;\n\t#endif\n#endif\n",
            gradientmap_pars_fragment: "#ifdef TOON\n\tuniform sampler2D gradientMap;\n\tvec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {\n\t\tfloat dotNL = dot( normal, lightDirection );\n\t\tvec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );\n\t\t#ifdef USE_GRADIENTMAP\n\t\t\treturn texture2D( gradientMap, coord ).rgb;\n\t\t#else\n\t\t\treturn ( coord.x < 0.7 ) ? vec3( 0.7 ) : vec3( 1.0 );\n\t\t#endif\n\t}\n#endif\n",
            lightmap_fragment: "#ifdef USE_LIGHTMAP\n\treflectedLight.indirectDiffuse += PI * texture2D( lightMap, vUv2 ).xyz * lightMapIntensity;\n#endif\n",
            lightmap_pars_fragment: "#ifdef USE_LIGHTMAP\n\tuniform sampler2D lightMap;\n\tuniform float lightMapIntensity;\n#endif",
            lights_lambert_vertex: "vec3 diffuse = vec3( 1.0 );\nGeometricContext geometry;\ngeometry.position = mvPosition.xyz;\ngeometry.normal = normalize( transformedNormal );\ngeometry.viewDir = normalize( -mvPosition.xyz );\nGeometricContext backGeometry;\nbackGeometry.position = geometry.position;\nbackGeometry.normal = -geometry.normal;\nbackGeometry.viewDir = geometry.viewDir;\nvLightFront = vec3( 0.0 );\n#ifdef DOUBLE_SIDED\n\tvLightBack = vec3( 0.0 );\n#endif\nIncidentLight directLight;\nfloat dotNL;\nvec3 directLightColor_Diffuse;\n#if NUM_POINT_LIGHTS > 0\n\tfor ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {\n\t\tgetPointDirectLightIrradiance( pointLights[ i ], geometry, directLight );\n\t\tdotNL = dot( geometry.normal, directLight.direction );\n\t\tdirectLightColor_Diffuse = PI * directLight.color;\n\t\tvLightFront += saturate( dotNL ) * directLightColor_Diffuse;\n\t\t#ifdef DOUBLE_SIDED\n\t\t\tvLightBack += saturate( -dotNL ) * directLightColor_Diffuse;\n\t\t#endif\n\t}\n#endif\n#if NUM_SPOT_LIGHTS > 0\n\tfor ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {\n\t\tgetSpotDirectLightIrradiance( spotLights[ i ], geometry, directLight );\n\t\tdotNL = dot( geometry.normal, directLight.direction );\n\t\tdirectLightColor_Diffuse = PI * directLight.color;\n\t\tvLightFront += saturate( dotNL ) * directLightColor_Diffuse;\n\t\t#ifdef DOUBLE_SIDED\n\t\t\tvLightBack += saturate( -dotNL ) * directLightColor_Diffuse;\n\t\t#endif\n\t}\n#endif\n#if NUM_DIR_LIGHTS > 0\n\tfor ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {\n\t\tgetDirectionalDirectLightIrradiance( directionalLights[ i ], geometry, directLight );\n\t\tdotNL = dot( geometry.normal, directLight.direction );\n\t\tdirectLightColor_Diffuse = PI * directLight.color;\n\t\tvLightFront += saturate( dotNL ) * directLightColor_Diffuse;\n\t\t#ifdef DOUBLE_SIDED\n\t\t\tvLightBack += saturate( -dotNL ) * directLightColor_Diffuse;\n\t\t#endif\n\t}\n#endif\n#if NUM_HEMI_LIGHTS > 0\n\tfor ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {\n\t\tvLightFront += getHemisphereLightIrradiance( hemisphereLights[ i ], geometry );\n\t\t#ifdef DOUBLE_SIDED\n\t\t\tvLightBack += getHemisphereLightIrradiance( hemisphereLights[ i ], backGeometry );\n\t\t#endif\n\t}\n#endif\n",
            lights_pars: "uniform vec3 ambientLightColor;\nvec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {\n\tvec3 irradiance = ambientLightColor;\n\t#ifndef PHYSICALLY_CORRECT_LIGHTS\n\t\tirradiance *= PI;\n\t#endif\n\treturn irradiance;\n}\n#if NUM_DIR_LIGHTS > 0\n\tstruct DirectionalLight {\n\t\tvec3 direction;\n\t\tvec3 color;\n\t\tint shadow;\n\t\tfloat shadowBias;\n\t\tfloat shadowRadius;\n\t\tvec2 shadowMapSize;\n\t};\n\tuniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];\n\tvoid getDirectionalDirectLightIrradiance( const in DirectionalLight directionalLight, const in GeometricContext geometry, out IncidentLight directLight ) {\n\t\tdirectLight.color = directionalLight.color;\n\t\tdirectLight.direction = directionalLight.direction;\n\t\tdirectLight.visible = true;\n\t}\n#endif\n#if NUM_POINT_LIGHTS > 0\n\tstruct PointLight {\n\t\tvec3 position;\n\t\tvec3 color;\n\t\tfloat distance;\n\t\tfloat decay;\n\t\tint shadow;\n\t\tfloat shadowBias;\n\t\tfloat shadowRadius;\n\t\tvec2 shadowMapSize;\n\t};\n\tuniform PointLight pointLights[ NUM_POINT_LIGHTS ];\n\tvoid getPointDirectLightIrradiance( const in PointLight pointLight, const in GeometricContext geometry, out IncidentLight directLight ) {\n\t\tvec3 lVector = pointLight.position - geometry.position;\n\t\tdirectLight.direction = normalize( lVector );\n\t\tfloat lightDistance = length( lVector );\n\t\tdirectLight.color = pointLight.color;\n\t\tdirectLight.color *= punctualLightIntensityToIrradianceFactor( lightDistance, pointLight.distance, pointLight.decay );\n\t\tdirectLight.visible = ( directLight.color != vec3( 0.0 ) );\n\t}\n#endif\n#if NUM_SPOT_LIGHTS > 0\n\tstruct SpotLight {\n\t\tvec3 position;\n\t\tvec3 direction;\n\t\tvec3 color;\n\t\tfloat distance;\n\t\tfloat decay;\n\t\tfloat coneCos;\n\t\tfloat penumbraCos;\n\t\tint shadow;\n\t\tfloat shadowBias;\n\t\tfloat shadowRadius;\n\t\tvec2 shadowMapSize;\n\t};\n\tuniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];\n\tvoid getSpotDirectLightIrradiance( const in SpotLight spotLight, const in GeometricContext geometry, out IncidentLight directLight  ) {\n\t\tvec3 lVector = spotLight.position - geometry.position;\n\t\tdirectLight.direction = normalize( lVector );\n\t\tfloat lightDistance = length( lVector );\n\t\tfloat angleCos = dot( directLight.direction, spotLight.direction );\n\t\tif ( angleCos > spotLight.coneCos ) {\n\t\t\tfloat spotEffect = smoothstep( spotLight.coneCos, spotLight.penumbraCos, angleCos );\n\t\t\tdirectLight.color = spotLight.color;\n\t\t\tdirectLight.color *= spotEffect * punctualLightIntensityToIrradianceFactor( lightDistance, spotLight.distance, spotLight.decay );\n\t\t\tdirectLight.visible = true;\n\t\t} else {\n\t\t\tdirectLight.color = vec3( 0.0 );\n\t\t\tdirectLight.visible = false;\n\t\t}\n\t}\n#endif\n#if NUM_RECT_AREA_LIGHTS > 0\n\tstruct RectAreaLight {\n\t\tvec3 color;\n\t\tvec3 position;\n\t\tvec3 halfWidth;\n\t\tvec3 halfHeight;\n\t};\n\tuniform sampler2D ltcMat;\tuniform sampler2D ltcMag;\n\tuniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];\n#endif\n#if NUM_HEMI_LIGHTS > 0\n\tstruct HemisphereLight {\n\t\tvec3 direction;\n\t\tvec3 skyColor;\n\t\tvec3 groundColor;\n\t};\n\tuniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];\n\tvec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in GeometricContext geometry ) {\n\t\tfloat dotNL = dot( geometry.normal, hemiLight.direction );\n\t\tfloat hemiDiffuseWeight = 0.5 * dotNL + 0.5;\n\t\tvec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );\n\t\t#ifndef PHYSICALLY_CORRECT_LIGHTS\n\t\t\tirradiance *= PI;\n\t\t#endif\n\t\treturn irradiance;\n\t}\n#endif\n#if defined( USE_ENVMAP ) && defined( PHYSICAL )\n\tvec3 getLightProbeIndirectIrradiance( const in GeometricContext geometry, const in int maxMIPLevel ) {\n\t\tvec3 worldNormal = inverseTransformDirection( geometry.normal, viewMatrix );\n\t\t#ifdef ENVMAP_TYPE_CUBE\n\t\t\tvec3 queryVec = vec3( flipEnvMap * worldNormal.x, worldNormal.yz );\n\t\t\t#ifdef TEXTURE_LOD_EXT\n\t\t\t\tvec4 envMapColor = textureCubeLodEXT( envMap, queryVec, float( maxMIPLevel ) );\n\t\t\t#else\n\t\t\t\tvec4 envMapColor = textureCube( envMap, queryVec, float( maxMIPLevel ) );\n\t\t\t#endif\n\t\t\tenvMapColor.rgb = envMapTexelToLinear( envMapColor ).rgb;\n\t\t#elif defined( ENVMAP_TYPE_CUBE_UV )\n\t\t\tvec3 queryVec = vec3( flipEnvMap * worldNormal.x, worldNormal.yz );\n\t\t\tvec4 envMapColor = textureCubeUV( queryVec, 1.0 );\n\t\t#else\n\t\t\tvec4 envMapColor = vec4( 0.0 );\n\t\t#endif\n\t\treturn PI * envMapColor.rgb * envMapIntensity;\n\t}\n\tfloat getSpecularMIPLevel( const in float blinnShininessExponent, const in int maxMIPLevel ) {\n\t\tfloat maxMIPLevelScalar = float( maxMIPLevel );\n\t\tfloat desiredMIPLevel = maxMIPLevelScalar - 0.79248 - 0.5 * log2( pow2( blinnShininessExponent ) + 1.0 );\n\t\treturn clamp( desiredMIPLevel, 0.0, maxMIPLevelScalar );\n\t}\n\tvec3 getLightProbeIndirectRadiance( const in GeometricContext geometry, const in float blinnShininessExponent, const in int maxMIPLevel ) {\n\t\t#ifdef ENVMAP_MODE_REFLECTION\n\t\t\tvec3 reflectVec = reflect( -geometry.viewDir, geometry.normal );\n\t\t#else\n\t\t\tvec3 reflectVec = refract( -geometry.viewDir, geometry.normal, refractionRatio );\n\t\t#endif\n\t\treflectVec = inverseTransformDirection( reflectVec, viewMatrix );\n\t\tfloat specularMIPLevel = getSpecularMIPLevel( blinnShininessExponent, maxMIPLevel );\n\t\t#ifdef ENVMAP_TYPE_CUBE\n\t\t\tvec3 queryReflectVec = vec3( flipEnvMap * reflectVec.x, reflectVec.yz );\n\t\t\t#ifdef TEXTURE_LOD_EXT\n\t\t\t\tvec4 envMapColor = textureCubeLodEXT( envMap, queryReflectVec, specularMIPLevel );\n\t\t\t#else\n\t\t\t\tvec4 envMapColor = textureCube( envMap, queryReflectVec, specularMIPLevel );\n\t\t\t#endif\n\t\t\tenvMapColor.rgb = envMapTexelToLinear( envMapColor ).rgb;\n\t\t#elif defined( ENVMAP_TYPE_CUBE_UV )\n\t\t\tvec3 queryReflectVec = vec3( flipEnvMap * reflectVec.x, reflectVec.yz );\n\t\t\tvec4 envMapColor = textureCubeUV(queryReflectVec, BlinnExponentToGGXRoughness(blinnShininessExponent));\n\t\t#elif defined( ENVMAP_TYPE_EQUIREC )\n\t\t\tvec2 sampleUV;\n\t\t\tsampleUV.y = saturate( reflectVec.y * 0.5 + 0.5 );\n\t\t\tsampleUV.x = atan( reflectVec.z, reflectVec.x ) * RECIPROCAL_PI2 + 0.5;\n\t\t\t#ifdef TEXTURE_LOD_EXT\n\t\t\t\tvec4 envMapColor = texture2DLodEXT( envMap, sampleUV, specularMIPLevel );\n\t\t\t#else\n\t\t\t\tvec4 envMapColor = texture2D( envMap, sampleUV, specularMIPLevel );\n\t\t\t#endif\n\t\t\tenvMapColor.rgb = envMapTexelToLinear( envMapColor ).rgb;\n\t\t#elif defined( ENVMAP_TYPE_SPHERE )\n\t\t\tvec3 reflectView = normalize( ( viewMatrix * vec4( reflectVec, 0.0 ) ).xyz + vec3( 0.0,0.0,1.0 ) );\n\t\t\t#ifdef TEXTURE_LOD_EXT\n\t\t\t\tvec4 envMapColor = texture2DLodEXT( envMap, reflectView.xy * 0.5 + 0.5, specularMIPLevel );\n\t\t\t#else\n\t\t\t\tvec4 envMapColor = texture2D( envMap, reflectView.xy * 0.5 + 0.5, specularMIPLevel );\n\t\t\t#endif\n\t\t\tenvMapColor.rgb = envMapTexelToLinear( envMapColor ).rgb;\n\t\t#endif\n\t\treturn envMapColor.rgb * envMapIntensity;\n\t}\n#endif\n",
            lights_phong_fragment: "BlinnPhongMaterial material;\nmaterial.diffuseColor = diffuseColor.rgb;\nmaterial.specularColor = specular;\nmaterial.specularShininess = shininess;\nmaterial.specularStrength = specularStrength;\n",
            lights_phong_pars_fragment: "varying vec3 vViewPosition;\n#ifndef FLAT_SHADED\n\tvarying vec3 vNormal;\n#endif\nstruct BlinnPhongMaterial {\n\tvec3\tdiffuseColor;\n\tvec3\tspecularColor;\n\tfloat\tspecularShininess;\n\tfloat\tspecularStrength;\n};\nvoid RE_Direct_BlinnPhong( const in IncidentLight directLight, const in GeometricContext geometry, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {\n\t#ifdef TOON\n\t\tvec3 irradiance = getGradientIrradiance( geometry.normal, directLight.direction ) * directLight.color;\n\t#else\n\t\tfloat dotNL = saturate( dot( geometry.normal, directLight.direction ) );\n\t\tvec3 irradiance = dotNL * directLight.color;\n\t#endif\n\t#ifndef PHYSICALLY_CORRECT_LIGHTS\n\t\tirradiance *= PI;\n\t#endif\n\treflectedLight.directDiffuse += irradiance * BRDF_Diffuse_Lambert( material.diffuseColor );\n\treflectedLight.directSpecular += irradiance * BRDF_Specular_BlinnPhong( directLight, geometry, material.specularColor, material.specularShininess ) * material.specularStrength;\n}\nvoid RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in GeometricContext geometry, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {\n\treflectedLight.indirectDiffuse += irradiance * BRDF_Diffuse_Lambert( material.diffuseColor );\n}\n#define RE_Direct\t\t\t\tRE_Direct_BlinnPhong\n#define RE_IndirectDiffuse\t\tRE_IndirectDiffuse_BlinnPhong\n#define Material_LightProbeLOD( material )\t(0)\n",
            lights_physical_fragment: "PhysicalMaterial material;\nmaterial.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );\nmaterial.specularRoughness = clamp( roughnessFactor, 0.04, 1.0 );\n#ifdef STANDARD\n\tmaterial.specularColor = mix( vec3( DEFAULT_SPECULAR_COEFFICIENT ), diffuseColor.rgb, metalnessFactor );\n#else\n\tmaterial.specularColor = mix( vec3( MAXIMUM_SPECULAR_COEFFICIENT * pow2( reflectivity ) ), diffuseColor.rgb, metalnessFactor );\n\tmaterial.clearCoat = saturate( clearCoat );\tmaterial.clearCoatRoughness = clamp( clearCoatRoughness, 0.04, 1.0 );\n#endif\n",
            lights_physical_pars_fragment: "struct PhysicalMaterial {\n\tvec3\tdiffuseColor;\n\tfloat\tspecularRoughness;\n\tvec3\tspecularColor;\n\t#ifndef STANDARD\n\t\tfloat clearCoat;\n\t\tfloat clearCoatRoughness;\n\t#endif\n};\n#define MAXIMUM_SPECULAR_COEFFICIENT 0.16\n#define DEFAULT_SPECULAR_COEFFICIENT 0.04\nfloat clearCoatDHRApprox( const in float roughness, const in float dotNL ) {\n\treturn DEFAULT_SPECULAR_COEFFICIENT + ( 1.0 - DEFAULT_SPECULAR_COEFFICIENT ) * ( pow( 1.0 - dotNL, 5.0 ) * pow( 1.0 - roughness, 2.0 ) );\n}\n#if NUM_RECT_AREA_LIGHTS > 0\n\tvoid RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in GeometricContext geometry, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {\n\t\tvec3 normal = geometry.normal;\n\t\tvec3 viewDir = geometry.viewDir;\n\t\tvec3 position = geometry.position;\n\t\tvec3 lightPos = rectAreaLight.position;\n\t\tvec3 halfWidth = rectAreaLight.halfWidth;\n\t\tvec3 halfHeight = rectAreaLight.halfHeight;\n\t\tvec3 lightColor = rectAreaLight.color;\n\t\tfloat roughness = material.specularRoughness;\n\t\tvec3 rectCoords[ 4 ];\n\t\trectCoords[ 0 ] = lightPos - halfWidth - halfHeight;\t\trectCoords[ 1 ] = lightPos + halfWidth - halfHeight;\n\t\trectCoords[ 2 ] = lightPos + halfWidth + halfHeight;\n\t\trectCoords[ 3 ] = lightPos - halfWidth + halfHeight;\n\t\tvec2 uv = LTC_Uv( normal, viewDir, roughness );\n\t\tfloat norm = texture2D( ltcMag, uv ).a;\n\t\tvec4 t = texture2D( ltcMat, uv );\n\t\tmat3 mInv = mat3(\n\t\t\tvec3(   1,   0, t.y ),\n\t\t\tvec3(   0, t.z,   0 ),\n\t\t\tvec3( t.w,   0, t.x )\n\t\t);\n\t\treflectedLight.directSpecular += lightColor * material.specularColor * norm * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );\n\t\treflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1 ), rectCoords );\n\t}\n#endif\nvoid RE_Direct_Physical( const in IncidentLight directLight, const in GeometricContext geometry, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {\n\tfloat dotNL = saturate( dot( geometry.normal, directLight.direction ) );\n\tvec3 irradiance = dotNL * directLight.color;\n\t#ifndef PHYSICALLY_CORRECT_LIGHTS\n\t\tirradiance *= PI;\n\t#endif\n\t#ifndef STANDARD\n\t\tfloat clearCoatDHR = material.clearCoat * clearCoatDHRApprox( material.clearCoatRoughness, dotNL );\n\t#else\n\t\tfloat clearCoatDHR = 0.0;\n\t#endif\n\treflectedLight.directSpecular += ( 1.0 - clearCoatDHR ) * irradiance * BRDF_Specular_GGX( directLight, geometry, material.specularColor, material.specularRoughness );\n\treflectedLight.directDiffuse += ( 1.0 - clearCoatDHR ) * irradiance * BRDF_Diffuse_Lambert( material.diffuseColor );\n\t#ifndef STANDARD\n\t\treflectedLight.directSpecular += irradiance * material.clearCoat * BRDF_Specular_GGX( directLight, geometry, vec3( DEFAULT_SPECULAR_COEFFICIENT ), material.clearCoatRoughness );\n\t#endif\n}\nvoid RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in GeometricContext geometry, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {\n\treflectedLight.indirectDiffuse += irradiance * BRDF_Diffuse_Lambert( material.diffuseColor );\n}\nvoid RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 clearCoatRadiance, const in GeometricContext geometry, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {\n\t#ifndef STANDARD\n\t\tfloat dotNV = saturate( dot( geometry.normal, geometry.viewDir ) );\n\t\tfloat dotNL = dotNV;\n\t\tfloat clearCoatDHR = material.clearCoat * clearCoatDHRApprox( material.clearCoatRoughness, dotNL );\n\t#else\n\t\tfloat clearCoatDHR = 0.0;\n\t#endif\n\treflectedLight.indirectSpecular += ( 1.0 - clearCoatDHR ) * radiance * BRDF_Specular_GGX_Environment( geometry, material.specularColor, material.specularRoughness );\n\t#ifndef STANDARD\n\t\treflectedLight.indirectSpecular += clearCoatRadiance * material.clearCoat * BRDF_Specular_GGX_Environment( geometry, vec3( DEFAULT_SPECULAR_COEFFICIENT ), material.clearCoatRoughness );\n\t#endif\n}\n#define RE_Direct\t\t\t\tRE_Direct_Physical\n#define RE_Direct_RectArea\t\tRE_Direct_RectArea_Physical\n#define RE_IndirectDiffuse\t\tRE_IndirectDiffuse_Physical\n#define RE_IndirectSpecular\t\tRE_IndirectSpecular_Physical\n#define Material_BlinnShininessExponent( material )   GGXRoughnessToBlinnExponent( material.specularRoughness )\n#define Material_ClearCoat_BlinnShininessExponent( material )   GGXRoughnessToBlinnExponent( material.clearCoatRoughness )\nfloat computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {\n\treturn saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );\n}\n",
            lights_template: "\nGeometricContext geometry;\ngeometry.position = - vViewPosition;\ngeometry.normal = normal;\ngeometry.viewDir = normalize( vViewPosition );\nIncidentLight directLight;\n#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )\n\tPointLight pointLight;\n\tfor ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {\n\t\tpointLight = pointLights[ i ];\n\t\tgetPointDirectLightIrradiance( pointLight, geometry, directLight );\n\t\t#ifdef USE_SHADOWMAP\n\t\tdirectLight.color *= all( bvec2( pointLight.shadow, directLight.visible ) ) ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ] ) : 1.0;\n\t\t#endif\n\t\tRE_Direct( directLight, geometry, material, reflectedLight );\n\t}\n#endif\n#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )\n\tSpotLight spotLight;\n\tfor ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {\n\t\tspotLight = spotLights[ i ];\n\t\tgetSpotDirectLightIrradiance( spotLight, geometry, directLight );\n\t\t#ifdef USE_SHADOWMAP\n\t\tdirectLight.color *= all( bvec2( spotLight.shadow, directLight.visible ) ) ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowBias, spotLight.shadowRadius, vSpotShadowCoord[ i ] ) : 1.0;\n\t\t#endif\n\t\tRE_Direct( directLight, geometry, material, reflectedLight );\n\t}\n#endif\n#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )\n\tDirectionalLight directionalLight;\n\tfor ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {\n\t\tdirectionalLight = directionalLights[ i ];\n\t\tgetDirectionalDirectLightIrradiance( directionalLight, geometry, directLight );\n\t\t#ifdef USE_SHADOWMAP\n\t\tdirectLight.color *= all( bvec2( directionalLight.shadow, directLight.visible ) ) ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;\n\t\t#endif\n\t\tRE_Direct( directLight, geometry, material, reflectedLight );\n\t}\n#endif\n#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )\n\tRectAreaLight rectAreaLight;\n\tfor ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {\n\t\trectAreaLight = rectAreaLights[ i ];\n\t\tRE_Direct_RectArea( rectAreaLight, geometry, material, reflectedLight );\n\t}\n#endif\n#if defined( RE_IndirectDiffuse )\n\tvec3 irradiance = getAmbientLightIrradiance( ambientLightColor );\n\t#ifdef USE_LIGHTMAP\n\t\tvec3 lightMapIrradiance = texture2D( lightMap, vUv2 ).xyz * lightMapIntensity;\n\t\t#ifndef PHYSICALLY_CORRECT_LIGHTS\n\t\t\tlightMapIrradiance *= PI;\n\t\t#endif\n\t\tirradiance += lightMapIrradiance;\n\t#endif\n\t#if ( NUM_HEMI_LIGHTS > 0 )\n\t\tfor ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {\n\t\t\tirradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometry );\n\t\t}\n\t#endif\n\t#if defined( USE_ENVMAP ) && defined( PHYSICAL ) && defined( ENVMAP_TYPE_CUBE_UV )\n\t\tirradiance += getLightProbeIndirectIrradiance( geometry, 8 );\n\t#endif\n\tRE_IndirectDiffuse( irradiance, geometry, material, reflectedLight );\n#endif\n#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )\n\tvec3 radiance = getLightProbeIndirectRadiance( geometry, Material_BlinnShininessExponent( material ), 8 );\n\t#ifndef STANDARD\n\t\tvec3 clearCoatRadiance = getLightProbeIndirectRadiance( geometry, Material_ClearCoat_BlinnShininessExponent( material ), 8 );\n\t#else\n\t\tvec3 clearCoatRadiance = vec3( 0.0 );\n\t#endif\n\tRE_IndirectSpecular( radiance, clearCoatRadiance, geometry, material, reflectedLight );\n#endif\n",
            logdepthbuf_fragment: "#if defined(USE_LOGDEPTHBUF) && defined(USE_LOGDEPTHBUF_EXT)\n\tgl_FragDepthEXT = log2(vFragDepth) * logDepthBufFC * 0.5;\n#endif",
            logdepthbuf_pars_fragment: "#ifdef USE_LOGDEPTHBUF\n\tuniform float logDepthBufFC;\n\t#ifdef USE_LOGDEPTHBUF_EXT\n\t\tvarying float vFragDepth;\n\t#endif\n#endif\n",
            logdepthbuf_pars_vertex: "#ifdef USE_LOGDEPTHBUF\n\t#ifdef USE_LOGDEPTHBUF_EXT\n\t\tvarying float vFragDepth;\n\t#endif\n\tuniform float logDepthBufFC;\n#endif",
            logdepthbuf_vertex: "#ifdef USE_LOGDEPTHBUF\n\tgl_Position.z = log2(max( EPSILON, gl_Position.w + 1.0 )) * logDepthBufFC;\n\t#ifdef USE_LOGDEPTHBUF_EXT\n\t\tvFragDepth = 1.0 + gl_Position.w;\n\t#else\n\t\tgl_Position.z = (gl_Position.z - 1.0) * gl_Position.w;\n\t#endif\n#endif\n",
            map_fragment: "#ifdef USE_MAP\n\tvec4 texelColor = texture2D( map, vUv );\n\ttexelColor = mapTexelToLinear( texelColor );\n\tdiffuseColor *= texelColor;\n#endif\n",
            map_pars_fragment: "#ifdef USE_MAP\n\tuniform sampler2D map;\n#endif\n",
            map_particle_fragment: "#ifdef USE_MAP\n\tvec4 mapTexel = texture2D( map, vec2( gl_PointCoord.x, 1.0 - gl_PointCoord.y ) * offsetRepeat.zw + offsetRepeat.xy );\n\tdiffuseColor *= mapTexelToLinear( mapTexel );\n#endif\n",
            map_particle_pars_fragment: "#ifdef USE_MAP\n\tuniform vec4 offsetRepeat;\n\tuniform sampler2D map;\n#endif\n",
            metalnessmap_fragment: "float metalnessFactor = metalness;\n#ifdef USE_METALNESSMAP\n\tvec4 texelMetalness = texture2D( metalnessMap, vUv );\n\tmetalnessFactor *= texelMetalness.b;\n#endif\n",
            metalnessmap_pars_fragment: "#ifdef USE_METALNESSMAP\n\tuniform sampler2D metalnessMap;\n#endif",
            morphnormal_vertex: "#ifdef USE_MORPHNORMALS\n\tobjectNormal += ( morphNormal0 - normal ) * morphTargetInfluences[ 0 ];\n\tobjectNormal += ( morphNormal1 - normal ) * morphTargetInfluences[ 1 ];\n\tobjectNormal += ( morphNormal2 - normal ) * morphTargetInfluences[ 2 ];\n\tobjectNormal += ( morphNormal3 - normal ) * morphTargetInfluences[ 3 ];\n#endif\n",
            morphtarget_pars_vertex: "#ifdef USE_MORPHTARGETS\n\t#ifndef USE_MORPHNORMALS\n\tuniform float morphTargetInfluences[ 8 ];\n\t#else\n\tuniform float morphTargetInfluences[ 4 ];\n\t#endif\n#endif",
            morphtarget_vertex: "#ifdef USE_MORPHTARGETS\n\ttransformed += ( morphTarget0 - position ) * morphTargetInfluences[ 0 ];\n\ttransformed += ( morphTarget1 - position ) * morphTargetInfluences[ 1 ];\n\ttransformed += ( morphTarget2 - position ) * morphTargetInfluences[ 2 ];\n\ttransformed += ( morphTarget3 - position ) * morphTargetInfluences[ 3 ];\n\t#ifndef USE_MORPHNORMALS\n\ttransformed += ( morphTarget4 - position ) * morphTargetInfluences[ 4 ];\n\ttransformed += ( morphTarget5 - position ) * morphTargetInfluences[ 5 ];\n\ttransformed += ( morphTarget6 - position ) * morphTargetInfluences[ 6 ];\n\ttransformed += ( morphTarget7 - position ) * morphTargetInfluences[ 7 ];\n\t#endif\n#endif\n",
            normal_flip: "#ifdef DOUBLE_SIDED\n\tfloat flipNormal = ( float( gl_FrontFacing ) * 2.0 - 1.0 );\n#else\n\tfloat flipNormal = 1.0;\n#endif\n",
            normal_fragment: "#ifdef FLAT_SHADED\n\tvec3 fdx = vec3( dFdx( vViewPosition.x ), dFdx( vViewPosition.y ), dFdx( vViewPosition.z ) );\n\tvec3 fdy = vec3( dFdy( vViewPosition.x ), dFdy( vViewPosition.y ), dFdy( vViewPosition.z ) );\n\tvec3 normal = normalize( cross( fdx, fdy ) );\n#else\n\tvec3 normal = normalize( vNormal ) * flipNormal;\n#endif\n#ifdef USE_NORMALMAP\n\tnormal = perturbNormal2Arb( -vViewPosition, normal );\n#elif defined( USE_BUMPMAP )\n\tnormal = perturbNormalArb( -vViewPosition, normal, dHdxy_fwd() );\n#endif\n",
            normalmap_pars_fragment: "#ifdef USE_NORMALMAP\n\tuniform sampler2D normalMap;\n\tuniform vec2 normalScale;\n\tvec3 perturbNormal2Arb( vec3 eye_pos, vec3 surf_norm ) {\n\t\tvec3 q0 = vec3( dFdx( eye_pos.x ), dFdx( eye_pos.y ), dFdx( eye_pos.z ) );\n\t\tvec3 q1 = vec3( dFdy( eye_pos.x ), dFdy( eye_pos.y ), dFdy( eye_pos.z ) );\n\t\tvec2 st0 = dFdx( vUv.st );\n\t\tvec2 st1 = dFdy( vUv.st );\n\t\tvec3 S = normalize( q0 * st1.t - q1 * st0.t );\n\t\tvec3 T = normalize( -q0 * st1.s + q1 * st0.s );\n\t\tvec3 N = normalize( surf_norm );\n\t\tvec3 mapN = texture2D( normalMap, vUv ).xyz * 2.0 - 1.0;\n\t\tmapN.xy = normalScale * mapN.xy;\n\t\tmat3 tsn = mat3( S, T, N );\n\t\treturn normalize( tsn * mapN );\n\t}\n#endif\n",
            packing: "vec3 packNormalToRGB( const in vec3 normal ) {\n\treturn normalize( normal ) * 0.5 + 0.5;\n}\nvec3 unpackRGBToNormal( const in vec3 rgb ) {\n\treturn 1.0 - 2.0 * rgb.xyz;\n}\nconst float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;\nconst vec3 PackFactors = vec3( 256. * 256. * 256., 256. * 256.,  256. );\nconst vec4 UnpackFactors = UnpackDownscale / vec4( PackFactors, 1. );\nconst float ShiftRight8 = 1. / 256.;\nvec4 packDepthToRGBA( const in float v ) {\n\tvec4 r = vec4( fract( v * PackFactors ), v );\n\tr.yzw -= r.xyz * ShiftRight8;\treturn r * PackUpscale;\n}\nfloat unpackRGBAToDepth( const in vec4 v ) {\n\treturn dot( v, UnpackFactors );\n}\nfloat viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {\n\treturn ( viewZ + near ) / ( near - far );\n}\nfloat orthographicDepthToViewZ( const in float linearClipZ, const in float near, const in float far ) {\n\treturn linearClipZ * ( near - far ) - near;\n}\nfloat viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {\n\treturn (( near + viewZ ) * far ) / (( far - near ) * viewZ );\n}\nfloat perspectiveDepthToViewZ( const in float invClipZ, const in float near, const in float far ) {\n\treturn ( near * far ) / ( ( far - near ) * invClipZ - far );\n}\n",
            premultiplied_alpha_fragment: "#ifdef PREMULTIPLIED_ALPHA\n\tgl_FragColor.rgb *= gl_FragColor.a;\n#endif\n",
            project_vertex: "vec4 mvPosition = modelViewMatrix * vec4( transformed, 1.0 );\ngl_Position = projectionMatrix * mvPosition;\n",
            dithering_fragment: "#if defined( DITHERING )\n  gl_FragColor.rgb = dithering( gl_FragColor.rgb );\n#endif\n",
            dithering_pars_fragment: "#if defined( DITHERING )\n\tvec3 dithering( vec3 color ) {\n\t\tfloat grid_position = rand( gl_FragCoord.xy );\n\t\tvec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );\n\t\tdither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );\n\t\treturn color + dither_shift_RGB;\n\t}\n#endif\n",
            roughnessmap_fragment: "float roughnessFactor = roughness;\n#ifdef USE_ROUGHNESSMAP\n\tvec4 texelRoughness = texture2D( roughnessMap, vUv );\n\troughnessFactor *= texelRoughness.g;\n#endif\n",
            roughnessmap_pars_fragment: "#ifdef USE_ROUGHNESSMAP\n\tuniform sampler2D roughnessMap;\n#endif",
            shadowmap_pars_fragment: "#ifdef USE_SHADOWMAP\n\t#if NUM_DIR_LIGHTS > 0\n\t\tuniform sampler2D directionalShadowMap[ NUM_DIR_LIGHTS ];\n\t\tvarying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHTS ];\n\t#endif\n\t#if NUM_SPOT_LIGHTS > 0\n\t\tuniform sampler2D spotShadowMap[ NUM_SPOT_LIGHTS ];\n\t\tvarying vec4 vSpotShadowCoord[ NUM_SPOT_LIGHTS ];\n\t#endif\n\t#if NUM_POINT_LIGHTS > 0\n\t\tuniform sampler2D pointShadowMap[ NUM_POINT_LIGHTS ];\n\t\tvarying vec4 vPointShadowCoord[ NUM_POINT_LIGHTS ];\n\t#endif\n\tfloat texture2DCompare( sampler2D depths, vec2 uv, float compare ) {\n\t\treturn step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );\n\t}\n\tfloat texture2DShadowLerp( sampler2D depths, vec2 size, vec2 uv, float compare ) {\n\t\tconst vec2 offset = vec2( 0.0, 1.0 );\n\t\tvec2 texelSize = vec2( 1.0 ) / size;\n\t\tvec2 centroidUV = floor( uv * size + 0.5 ) / size;\n\t\tfloat lb = texture2DCompare( depths, centroidUV + texelSize * offset.xx, compare );\n\t\tfloat lt = texture2DCompare( depths, centroidUV + texelSize * offset.xy, compare );\n\t\tfloat rb = texture2DCompare( depths, centroidUV + texelSize * offset.yx, compare );\n\t\tfloat rt = texture2DCompare( depths, centroidUV + texelSize * offset.yy, compare );\n\t\tvec2 f = fract( uv * size + 0.5 );\n\t\tfloat a = mix( lb, lt, f.y );\n\t\tfloat b = mix( rb, rt, f.y );\n\t\tfloat c = mix( a, b, f.x );\n\t\treturn c;\n\t}\n\tfloat getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowBias, float shadowRadius, vec4 shadowCoord ) {\n\t\tfloat shadow = 1.0;\n\t\tshadowCoord.xyz /= shadowCoord.w;\n\t\tshadowCoord.z += shadowBias;\n\t\tbvec4 inFrustumVec = bvec4 ( shadowCoord.x >= 0.0, shadowCoord.x <= 1.0, shadowCoord.y >= 0.0, shadowCoord.y <= 1.0 );\n\t\tbool inFrustum = all( inFrustumVec );\n\t\tbvec2 frustumTestVec = bvec2( inFrustum, shadowCoord.z <= 1.0 );\n\t\tbool frustumTest = all( frustumTestVec );\n\t\tif ( frustumTest ) {\n\t\t#if defined( SHADOWMAP_TYPE_PCF )\n\t\t\tvec2 texelSize = vec2( 1.0 ) / shadowMapSize;\n\t\t\tfloat dx0 = - texelSize.x * shadowRadius;\n\t\t\tfloat dy0 = - texelSize.y * shadowRadius;\n\t\t\tfloat dx1 = + texelSize.x * shadowRadius;\n\t\t\tfloat dy1 = + texelSize.y * shadowRadius;\n\t\t\tshadow = (\n\t\t\t\ttexture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +\n\t\t\t\ttexture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +\n\t\t\t\ttexture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +\n\t\t\t\ttexture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +\n\t\t\t\ttexture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +\n\t\t\t\ttexture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +\n\t\t\t\ttexture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +\n\t\t\t\ttexture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +\n\t\t\t\ttexture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )\n\t\t\t) * ( 1.0 / 9.0 );\n\t\t#elif defined( SHADOWMAP_TYPE_PCF_SOFT )\n\t\t\tvec2 texelSize = vec2( 1.0 ) / shadowMapSize;\n\t\t\tfloat dx0 = - texelSize.x * shadowRadius;\n\t\t\tfloat dy0 = - texelSize.y * shadowRadius;\n\t\t\tfloat dx1 = + texelSize.x * shadowRadius;\n\t\t\tfloat dy1 = + texelSize.y * shadowRadius;\n\t\t\tshadow = (\n\t\t\t\ttexture2DShadowLerp( shadowMap, shadowMapSize, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +\n\t\t\t\ttexture2DShadowLerp( shadowMap, shadowMapSize, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +\n\t\t\t\ttexture2DShadowLerp( shadowMap, shadowMapSize, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +\n\t\t\t\ttexture2DShadowLerp( shadowMap, shadowMapSize, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +\n\t\t\t\ttexture2DShadowLerp( shadowMap, shadowMapSize, shadowCoord.xy, shadowCoord.z ) +\n\t\t\t\ttexture2DShadowLerp( shadowMap, shadowMapSize, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +\n\t\t\t\ttexture2DShadowLerp( shadowMap, shadowMapSize, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +\n\t\t\t\ttexture2DShadowLerp( shadowMap, shadowMapSize, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +\n\t\t\t\ttexture2DShadowLerp( shadowMap, shadowMapSize, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )\n\t\t\t) * ( 1.0 / 9.0 );\n\t\t#else\n\t\t\tshadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );\n\t\t#endif\n\t\t}\n\t\treturn shadow;\n\t}\n\tvec2 cubeToUV( vec3 v, float texelSizeY ) {\n\t\tvec3 absV = abs( v );\n\t\tfloat scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );\n\t\tabsV *= scaleToCube;\n\t\tv *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );\n\t\tvec2 planar = v.xy;\n\t\tfloat almostATexel = 1.5 * texelSizeY;\n\t\tfloat almostOne = 1.0 - almostATexel;\n\t\tif ( absV.z >= almostOne ) {\n\t\t\tif ( v.z > 0.0 )\n\t\t\t\tplanar.x = 4.0 - v.x;\n\t\t} else if ( absV.x >= almostOne ) {\n\t\t\tfloat signX = sign( v.x );\n\t\t\tplanar.x = v.z * signX + 2.0 * signX;\n\t\t} else if ( absV.y >= almostOne ) {\n\t\t\tfloat signY = sign( v.y );\n\t\t\tplanar.x = v.x + 2.0 * signY + 2.0;\n\t\t\tplanar.y = v.z * signY - 2.0;\n\t\t}\n\t\treturn vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );\n\t}\n\tfloat getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowBias, float shadowRadius, vec4 shadowCoord ) {\n\t\tvec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );\n\t\tvec3 lightToPosition = shadowCoord.xyz;\n\t\tvec3 bd3D = normalize( lightToPosition );\n\t\tfloat dp = ( length( lightToPosition ) - shadowBias ) / 1000.0;\n\t\t#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT )\n\t\t\tvec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;\n\t\t\treturn (\n\t\t\t\ttexture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +\n\t\t\t\ttexture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +\n\t\t\t\ttexture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +\n\t\t\t\ttexture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +\n\t\t\t\ttexture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +\n\t\t\t\ttexture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +\n\t\t\t\ttexture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +\n\t\t\t\ttexture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +\n\t\t\t\ttexture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )\n\t\t\t) * ( 1.0 / 9.0 );\n\t\t#else\n\t\t\treturn texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );\n\t\t#endif\n\t}\n#endif\n",
            shadowmap_pars_vertex: "#ifdef USE_SHADOWMAP\n\t#if NUM_DIR_LIGHTS > 0\n\t\tuniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHTS ];\n\t\tvarying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHTS ];\n\t#endif\n\t#if NUM_SPOT_LIGHTS > 0\n\t\tuniform mat4 spotShadowMatrix[ NUM_SPOT_LIGHTS ];\n\t\tvarying vec4 vSpotShadowCoord[ NUM_SPOT_LIGHTS ];\n\t#endif\n\t#if NUM_POINT_LIGHTS > 0\n\t\tuniform mat4 pointShadowMatrix[ NUM_POINT_LIGHTS ];\n\t\tvarying vec4 vPointShadowCoord[ NUM_POINT_LIGHTS ];\n\t#endif\n#endif\n",
            shadowmap_vertex: "#ifdef USE_SHADOWMAP\n\t#if NUM_DIR_LIGHTS > 0\n\tfor ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {\n\t\tvDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * worldPosition;\n\t}\n\t#endif\n\t#if NUM_SPOT_LIGHTS > 0\n\tfor ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {\n\t\tvSpotShadowCoord[ i ] = spotShadowMatrix[ i ] * worldPosition;\n\t}\n\t#endif\n\t#if NUM_POINT_LIGHTS > 0\n\tfor ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {\n\t\tvPointShadowCoord[ i ] = pointShadowMatrix[ i ] * worldPosition;\n\t}\n\t#endif\n#endif\n",
            shadowmask_pars_fragment: "float getShadowMask() {\n\tfloat shadow = 1.0;\n\t#ifdef USE_SHADOWMAP\n\t#if NUM_DIR_LIGHTS > 0\n\tDirectionalLight directionalLight;\n\tfor ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {\n\t\tdirectionalLight = directionalLights[ i ];\n\t\tshadow *= bool( directionalLight.shadow ) ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;\n\t}\n\t#endif\n\t#if NUM_SPOT_LIGHTS > 0\n\tSpotLight spotLight;\n\tfor ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {\n\t\tspotLight = spotLights[ i ];\n\t\tshadow *= bool( spotLight.shadow ) ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowBias, spotLight.shadowRadius, vSpotShadowCoord[ i ] ) : 1.0;\n\t}\n\t#endif\n\t#if NUM_POINT_LIGHTS > 0\n\tPointLight pointLight;\n\tfor ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {\n\t\tpointLight = pointLights[ i ];\n\t\tshadow *= bool( pointLight.shadow ) ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ] ) : 1.0;\n\t}\n\t#endif\n\t#endif\n\treturn shadow;\n}\n",
            skinbase_vertex: "#ifdef USE_SKINNING\n\tmat4 boneMatX = getBoneMatrix( skinIndex.x );\n\tmat4 boneMatY = getBoneMatrix( skinIndex.y );\n\tmat4 boneMatZ = getBoneMatrix( skinIndex.z );\n\tmat4 boneMatW = getBoneMatrix( skinIndex.w );\n#endif",
            skinning_pars_vertex: "#ifdef USE_SKINNING\n\tuniform mat4 bindMatrix;\n\tuniform mat4 bindMatrixInverse;\n\t#ifdef BONE_TEXTURE\n\t\tuniform sampler2D boneTexture;\n\t\tuniform int boneTextureSize;\n\t\tmat4 getBoneMatrix( const in float i ) {\n\t\t\tfloat j = i * 4.0;\n\t\t\tfloat x = mod( j, float( boneTextureSize ) );\n\t\t\tfloat y = floor( j / float( boneTextureSize ) );\n\t\t\tfloat dx = 1.0 / float( boneTextureSize );\n\t\t\tfloat dy = 1.0 / float( boneTextureSize );\n\t\t\ty = dy * ( y + 0.5 );\n\t\t\tvec4 v1 = texture2D( boneTexture, vec2( dx * ( x + 0.5 ), y ) );\n\t\t\tvec4 v2 = texture2D( boneTexture, vec2( dx * ( x + 1.5 ), y ) );\n\t\t\tvec4 v3 = texture2D( boneTexture, vec2( dx * ( x + 2.5 ), y ) );\n\t\t\tvec4 v4 = texture2D( boneTexture, vec2( dx * ( x + 3.5 ), y ) );\n\t\t\tmat4 bone = mat4( v1, v2, v3, v4 );\n\t\t\treturn bone;\n\t\t}\n\t#else\n\t\tuniform mat4 boneMatrices[ MAX_BONES ];\n\t\tmat4 getBoneMatrix( const in float i ) {\n\t\t\tmat4 bone = boneMatrices[ int(i) ];\n\t\t\treturn bone;\n\t\t}\n\t#endif\n#endif\n",
            skinning_vertex: "#ifdef USE_SKINNING\n\tvec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );\n\tvec4 skinned = vec4( 0.0 );\n\tskinned += boneMatX * skinVertex * skinWeight.x;\n\tskinned += boneMatY * skinVertex * skinWeight.y;\n\tskinned += boneMatZ * skinVertex * skinWeight.z;\n\tskinned += boneMatW * skinVertex * skinWeight.w;\n\ttransformed = ( bindMatrixInverse * skinned ).xyz;\n#endif\n",
            skinnormal_vertex: "#ifdef USE_SKINNING\n\tmat4 skinMatrix = mat4( 0.0 );\n\tskinMatrix += skinWeight.x * boneMatX;\n\tskinMatrix += skinWeight.y * boneMatY;\n\tskinMatrix += skinWeight.z * boneMatZ;\n\tskinMatrix += skinWeight.w * boneMatW;\n\tskinMatrix  = bindMatrixInverse * skinMatrix * bindMatrix;\n\tobjectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;\n#endif\n",
            specularmap_fragment: "float specularStrength;\n#ifdef USE_SPECULARMAP\n\tvec4 texelSpecular = texture2D( specularMap, vUv );\n\tspecularStrength = texelSpecular.r;\n#else\n\tspecularStrength = 1.0;\n#endif",
            specularmap_pars_fragment: "#ifdef USE_SPECULARMAP\n\tuniform sampler2D specularMap;\n#endif",
            tonemapping_fragment: "#if defined( TONE_MAPPING )\n  gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );\n#endif\n",
            tonemapping_pars_fragment: "#define saturate(a) clamp( a, 0.0, 1.0 )\nuniform float toneMappingExposure;\nuniform float toneMappingWhitePoint;\nvec3 LinearToneMapping( vec3 color ) {\n\treturn toneMappingExposure * color;\n}\nvec3 ReinhardToneMapping( vec3 color ) {\n\tcolor *= toneMappingExposure;\n\treturn saturate( color / ( vec3( 1.0 ) + color ) );\n}\n#define Uncharted2Helper( x ) max( ( ( x * ( 0.15 * x + 0.10 * 0.50 ) + 0.20 * 0.02 ) / ( x * ( 0.15 * x + 0.50 ) + 0.20 * 0.30 ) ) - 0.02 / 0.30, vec3( 0.0 ) )\nvec3 Uncharted2ToneMapping( vec3 color ) {\n\tcolor *= toneMappingExposure;\n\treturn saturate( Uncharted2Helper( color ) / Uncharted2Helper( vec3( toneMappingWhitePoint ) ) );\n}\nvec3 OptimizedCineonToneMapping( vec3 color ) {\n\tcolor *= toneMappingExposure;\n\tcolor = max( vec3( 0.0 ), color - 0.004 );\n\treturn pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );\n}\n",
            uv_pars_fragment: "#if defined( USE_MAP ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( USE_SPECULARMAP ) || defined( USE_ALPHAMAP ) || defined( USE_EMISSIVEMAP ) || defined( USE_ROUGHNESSMAP ) || defined( USE_METALNESSMAP )\n\tvarying vec2 vUv;\n#endif",
            uv_pars_vertex: "#if defined( USE_MAP ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( USE_SPECULARMAP ) || defined( USE_ALPHAMAP ) || defined( USE_EMISSIVEMAP ) || defined( USE_ROUGHNESSMAP ) || defined( USE_METALNESSMAP )\n\tvarying vec2 vUv;\n\tuniform vec4 offsetRepeat;\n#endif\n",
            uv_vertex: "#if defined( USE_MAP ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( USE_SPECULARMAP ) || defined( USE_ALPHAMAP ) || defined( USE_EMISSIVEMAP ) || defined( USE_ROUGHNESSMAP ) || defined( USE_METALNESSMAP )\n\tvUv = uv * offsetRepeat.zw + offsetRepeat.xy;\n#endif",
            uv2_pars_fragment: "#if defined( USE_LIGHTMAP ) || defined( USE_AOMAP )\n\tvarying vec2 vUv2;\n#endif",
            uv2_pars_vertex: "#if defined( USE_LIGHTMAP ) || defined( USE_AOMAP )\n\tattribute vec2 uv2;\n\tvarying vec2 vUv2;\n#endif",
            uv2_vertex: "#if defined( USE_LIGHTMAP ) || defined( USE_AOMAP )\n\tvUv2 = uv2;\n#endif",
            worldpos_vertex: "#if defined( USE_ENVMAP ) || defined( PHONG ) || defined( PHYSICAL ) || defined( LAMBERT ) || defined ( USE_SHADOWMAP )\n\tvec4 worldPosition = modelMatrix * vec4( transformed, 1.0 );\n#endif\n",
            cube_frag: "uniform samplerCube tCube;\nuniform float tFlip;\nuniform float opacity;\nvarying vec3 vWorldPosition;\n#include <common>\nvoid main() {\n\tgl_FragColor = textureCube( tCube, vec3( tFlip * vWorldPosition.x, vWorldPosition.yz ) );\n\tgl_FragColor.a *= opacity;\n}\n",
            cube_vert: "varying vec3 vWorldPosition;\n#include <common>\nvoid main() {\n\tvWorldPosition = transformDirection( position, modelMatrix );\n\t#include <begin_vertex>\n\t#include <project_vertex>\n}\n",
            depth_frag: "#if DEPTH_PACKING == 3200\n\tuniform float opacity;\n#endif\n#include <common>\n#include <packing>\n#include <uv_pars_fragment>\n#include <map_pars_fragment>\n#include <alphamap_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main() {\n\t#include <clipping_planes_fragment>\n\tvec4 diffuseColor = vec4( 1.0 );\n\t#if DEPTH_PACKING == 3200\n\t\tdiffuseColor.a = opacity;\n\t#endif\n\t#include <map_fragment>\n\t#include <alphamap_fragment>\n\t#include <alphatest_fragment>\n\t#include <logdepthbuf_fragment>\n\t#if DEPTH_PACKING == 3200\n\t\tgl_FragColor = vec4( vec3( gl_FragCoord.z ), opacity );\n\t#elif DEPTH_PACKING == 3201\n\t\tgl_FragColor = packDepthToRGBA( gl_FragCoord.z );\n\t#endif\n}\n",
            depth_vert: "#include <common>\n#include <uv_pars_vertex>\n#include <displacementmap_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <skinning_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvoid main() {\n\t#include <uv_vertex>\n\t#include <skinbase_vertex>\n\t#ifdef USE_DISPLACEMENTMAP\n\t\t#include <beginnormal_vertex>\n\t\t#include <morphnormal_vertex>\n\t\t#include <skinnormal_vertex>\n\t#endif\n\t#include <begin_vertex>\n\t#include <morphtarget_vertex>\n\t#include <skinning_vertex>\n\t#include <displacementmap_vertex>\n\t#include <project_vertex>\n\t#include <logdepthbuf_vertex>\n\t#include <clipping_planes_vertex>\n}\n",
            distanceRGBA_frag: "uniform vec3 lightPos;\nvarying vec4 vWorldPosition;\n#include <common>\n#include <packing>\n#include <clipping_planes_pars_fragment>\nvoid main () {\n\t#include <clipping_planes_fragment>\n\tgl_FragColor = packDepthToRGBA( length( vWorldPosition.xyz - lightPos.xyz ) / 1000.0 );\n}\n",
            distanceRGBA_vert: "varying vec4 vWorldPosition;\n#include <common>\n#include <morphtarget_pars_vertex>\n#include <skinning_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvoid main() {\n\t#include <skinbase_vertex>\n\t#include <begin_vertex>\n\t#include <morphtarget_vertex>\n\t#include <skinning_vertex>\n\t#include <project_vertex>\n\t#include <worldpos_vertex>\n\t#include <clipping_planes_vertex>\n\tvWorldPosition = worldPosition;\n}\n",
            equirect_frag: "uniform sampler2D tEquirect;\nuniform float tFlip;\nvarying vec3 vWorldPosition;\n#include <common>\nvoid main() {\n\tvec3 direction = normalize( vWorldPosition );\n\tvec2 sampleUV;\n\tsampleUV.y = saturate( tFlip * direction.y * -0.5 + 0.5 );\n\tsampleUV.x = atan( direction.z, direction.x ) * RECIPROCAL_PI2 + 0.5;\n\tgl_FragColor = texture2D( tEquirect, sampleUV );\n}\n",
            equirect_vert: "varying vec3 vWorldPosition;\n#include <common>\nvoid main() {\n\tvWorldPosition = transformDirection( position, modelMatrix );\n\t#include <begin_vertex>\n\t#include <project_vertex>\n}\n",
            linedashed_frag: "uniform vec3 diffuse;\nuniform float opacity;\nuniform float dashSize;\nuniform float totalSize;\nvarying float vLineDistance;\n#include <common>\n#include <color_pars_fragment>\n#include <fog_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main() {\n\t#include <clipping_planes_fragment>\n\tif ( mod( vLineDistance, totalSize ) > dashSize ) {\n\t\tdiscard;\n\t}\n\tvec3 outgoingLight = vec3( 0.0 );\n\tvec4 diffuseColor = vec4( diffuse, opacity );\n\t#include <logdepthbuf_fragment>\n\t#include <color_fragment>\n\toutgoingLight = diffuseColor.rgb;\n\tgl_FragColor = vec4( outgoingLight, diffuseColor.a );\n\t#include <premultiplied_alpha_fragment>\n\t#include <tonemapping_fragment>\n\t#include <encodings_fragment>\n\t#include <fog_fragment>\n}\n",
            linedashed_vert: "uniform float scale;\nattribute float lineDistance;\nvarying float vLineDistance;\n#include <common>\n#include <color_pars_vertex>\n#include <fog_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvoid main() {\n\t#include <color_vertex>\n\tvLineDistance = scale * lineDistance;\n\tvec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );\n\tgl_Position = projectionMatrix * mvPosition;\n\t#include <logdepthbuf_vertex>\n\t#include <clipping_planes_vertex>\n\t#include <fog_vertex>\n}\n",
            meshbasic_frag: "uniform vec3 diffuse;\nuniform float opacity;\n#ifndef FLAT_SHADED\n\tvarying vec3 vNormal;\n#endif\n#include <common>\n#include <color_pars_fragment>\n#include <uv_pars_fragment>\n#include <uv2_pars_fragment>\n#include <map_pars_fragment>\n#include <alphamap_pars_fragment>\n#include <aomap_pars_fragment>\n#include <lightmap_pars_fragment>\n#include <envmap_pars_fragment>\n#include <fog_pars_fragment>\n#include <specularmap_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main() {\n\t#include <clipping_planes_fragment>\n\tvec4 diffuseColor = vec4( diffuse, opacity );\n\t#include <logdepthbuf_fragment>\n\t#include <map_fragment>\n\t#include <color_fragment>\n\t#include <alphamap_fragment>\n\t#include <alphatest_fragment>\n\t#include <specularmap_fragment>\n\tReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );\n\t#ifdef USE_LIGHTMAP\n\t\treflectedLight.indirectDiffuse += texture2D( lightMap, vUv2 ).xyz * lightMapIntensity;\n\t#else\n\t\treflectedLight.indirectDiffuse += vec3( 1.0 );\n\t#endif\n\t#include <aomap_fragment>\n\treflectedLight.indirectDiffuse *= diffuseColor.rgb;\n\tvec3 outgoingLight = reflectedLight.indirectDiffuse;\n\t#include <normal_flip>\n\t#include <envmap_fragment>\n\tgl_FragColor = vec4( outgoingLight, diffuseColor.a );\n\t#include <premultiplied_alpha_fragment>\n\t#include <tonemapping_fragment>\n\t#include <encodings_fragment>\n\t#include <fog_fragment>\n}\n",
            meshbasic_vert: "#include <common>\n#include <uv_pars_vertex>\n#include <uv2_pars_vertex>\n#include <envmap_pars_vertex>\n#include <color_pars_vertex>\n#include <fog_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <skinning_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvoid main() {\n\t#include <uv_vertex>\n\t#include <uv2_vertex>\n\t#include <color_vertex>\n\t#include <skinbase_vertex>\n\t#ifdef USE_ENVMAP\n\t#include <beginnormal_vertex>\n\t#include <morphnormal_vertex>\n\t#include <skinnormal_vertex>\n\t#include <defaultnormal_vertex>\n\t#endif\n\t#include <begin_vertex>\n\t#include <morphtarget_vertex>\n\t#include <skinning_vertex>\n\t#include <project_vertex>\n\t#include <logdepthbuf_vertex>\n\t#include <worldpos_vertex>\n\t#include <clipping_planes_vertex>\n\t#include <envmap_vertex>\n\t#include <fog_vertex>\n}\n",
            meshlambert_frag: "uniform vec3 diffuse;\nuniform vec3 emissive;\nuniform float opacity;\nvarying vec3 vLightFront;\n#ifdef DOUBLE_SIDED\n\tvarying vec3 vLightBack;\n#endif\n#include <common>\n#include <packing>\n#include <dithering_pars_fragment>\n#include <color_pars_fragment>\n#include <uv_pars_fragment>\n#include <uv2_pars_fragment>\n#include <map_pars_fragment>\n#include <alphamap_pars_fragment>\n#include <aomap_pars_fragment>\n#include <lightmap_pars_fragment>\n#include <emissivemap_pars_fragment>\n#include <envmap_pars_fragment>\n#include <bsdfs>\n#include <lights_pars>\n#include <fog_pars_fragment>\n#include <shadowmap_pars_fragment>\n#include <shadowmask_pars_fragment>\n#include <specularmap_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main() {\n\t#include <clipping_planes_fragment>\n\tvec4 diffuseColor = vec4( diffuse, opacity );\n\tReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );\n\tvec3 totalEmissiveRadiance = emissive;\n\t#include <logdepthbuf_fragment>\n\t#include <map_fragment>\n\t#include <color_fragment>\n\t#include <alphamap_fragment>\n\t#include <alphatest_fragment>\n\t#include <specularmap_fragment>\n\t#include <emissivemap_fragment>\n\treflectedLight.indirectDiffuse = getAmbientLightIrradiance( ambientLightColor );\n\t#include <lightmap_fragment>\n\treflectedLight.indirectDiffuse *= BRDF_Diffuse_Lambert( diffuseColor.rgb );\n\t#ifdef DOUBLE_SIDED\n\t\treflectedLight.directDiffuse = ( gl_FrontFacing ) ? vLightFront : vLightBack;\n\t#else\n\t\treflectedLight.directDiffuse = vLightFront;\n\t#endif\n\treflectedLight.directDiffuse *= BRDF_Diffuse_Lambert( diffuseColor.rgb ) * getShadowMask();\n\t#include <aomap_fragment>\n\tvec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;\n\t#include <normal_flip>\n\t#include <envmap_fragment>\n\tgl_FragColor = vec4( outgoingLight, diffuseColor.a );\n\t#include <tonemapping_fragment>\n\t#include <encodings_fragment>\n\t#include <fog_fragment>\n\t#include <premultiplied_alpha_fragment>\n\t#include <dithering_fragment>\n}\n",
            meshlambert_vert: "#define LAMBERT\nvarying vec3 vLightFront;\n#ifdef DOUBLE_SIDED\n\tvarying vec3 vLightBack;\n#endif\n#include <common>\n#include <uv_pars_vertex>\n#include <uv2_pars_vertex>\n#include <envmap_pars_vertex>\n#include <bsdfs>\n#include <lights_pars>\n#include <color_pars_vertex>\n#include <fog_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <skinning_pars_vertex>\n#include <shadowmap_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvoid main() {\n\t#include <uv_vertex>\n\t#include <uv2_vertex>\n\t#include <color_vertex>\n\t#include <beginnormal_vertex>\n\t#include <morphnormal_vertex>\n\t#include <skinbase_vertex>\n\t#include <skinnormal_vertex>\n\t#include <defaultnormal_vertex>\n\t#include <begin_vertex>\n\t#include <morphtarget_vertex>\n\t#include <skinning_vertex>\n\t#include <project_vertex>\n\t#include <logdepthbuf_vertex>\n\t#include <clipping_planes_vertex>\n\t#include <worldpos_vertex>\n\t#include <envmap_vertex>\n\t#include <lights_lambert_vertex>\n\t#include <shadowmap_vertex>\n\t#include <fog_vertex>\n}\n",
            meshphong_frag: "#define PHONG\nuniform vec3 diffuse;\nuniform vec3 emissive;\nuniform vec3 specular;\nuniform float shininess;\nuniform float opacity;\n#include <common>\n#include <packing>\n#include <dithering_pars_fragment>\n#include <color_pars_fragment>\n#include <uv_pars_fragment>\n#include <uv2_pars_fragment>\n#include <map_pars_fragment>\n#include <alphamap_pars_fragment>\n#include <aomap_pars_fragment>\n#include <lightmap_pars_fragment>\n#include <emissivemap_pars_fragment>\n#include <envmap_pars_fragment>\n#include <gradientmap_pars_fragment>\n#include <fog_pars_fragment>\n#include <bsdfs>\n#include <lights_pars>\n#include <lights_phong_pars_fragment>\n#include <shadowmap_pars_fragment>\n#include <bumpmap_pars_fragment>\n#include <normalmap_pars_fragment>\n#include <specularmap_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main() {\n\t#include <clipping_planes_fragment>\n\tvec4 diffuseColor = vec4( diffuse, opacity );\n\tReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );\n\tvec3 totalEmissiveRadiance = emissive;\n\t#include <logdepthbuf_fragment>\n\t#include <map_fragment>\n\t#include <color_fragment>\n\t#include <alphamap_fragment>\n\t#include <alphatest_fragment>\n\t#include <specularmap_fragment>\n\t#include <normal_flip>\n\t#include <normal_fragment>\n\t#include <emissivemap_fragment>\n\t#include <lights_phong_fragment>\n\t#include <lights_template>\n\t#include <aomap_fragment>\n\tvec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;\n\t#include <envmap_fragment>\n\tgl_FragColor = vec4( outgoingLight, diffuseColor.a );\n\t#include <tonemapping_fragment>\n\t#include <encodings_fragment>\n\t#include <fog_fragment>\n\t#include <premultiplied_alpha_fragment>\n\t#include <dithering_fragment>\n}\n",
            meshphong_vert: "#define PHONG\nvarying vec3 vViewPosition;\n#ifndef FLAT_SHADED\n\tvarying vec3 vNormal;\n#endif\n#include <common>\n#include <uv_pars_vertex>\n#include <uv2_pars_vertex>\n#include <displacementmap_pars_vertex>\n#include <envmap_pars_vertex>\n#include <color_pars_vertex>\n#include <fog_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <skinning_pars_vertex>\n#include <shadowmap_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvoid main() {\n\t#include <uv_vertex>\n\t#include <uv2_vertex>\n\t#include <color_vertex>\n\t#include <beginnormal_vertex>\n\t#include <morphnormal_vertex>\n\t#include <skinbase_vertex>\n\t#include <skinnormal_vertex>\n\t#include <defaultnormal_vertex>\n#ifndef FLAT_SHADED\n\tvNormal = normalize( transformedNormal );\n#endif\n\t#include <begin_vertex>\n\t#include <morphtarget_vertex>\n\t#include <skinning_vertex>\n\t#include <displacementmap_vertex>\n\t#include <project_vertex>\n\t#include <logdepthbuf_vertex>\n\t#include <clipping_planes_vertex>\n\tvViewPosition = - mvPosition.xyz;\n\t#include <worldpos_vertex>\n\t#include <envmap_vertex>\n\t#include <shadowmap_vertex>\n\t#include <fog_vertex>\n}\n",
            meshphysical_frag: "#define PHYSICAL\nuniform vec3 diffuse;\nuniform vec3 emissive;\nuniform float roughness;\nuniform float metalness;\nuniform float opacity;\n#ifndef STANDARD\n\tuniform float clearCoat;\n\tuniform float clearCoatRoughness;\n#endif\nvarying vec3 vViewPosition;\n#ifndef FLAT_SHADED\n\tvarying vec3 vNormal;\n#endif\n#include <common>\n#include <packing>\n#include <dithering_pars_fragment>\n#include <color_pars_fragment>\n#include <uv_pars_fragment>\n#include <uv2_pars_fragment>\n#include <map_pars_fragment>\n#include <alphamap_pars_fragment>\n#include <aomap_pars_fragment>\n#include <lightmap_pars_fragment>\n#include <emissivemap_pars_fragment>\n#include <envmap_pars_fragment>\n#include <fog_pars_fragment>\n#include <bsdfs>\n#include <cube_uv_reflection_fragment>\n#include <lights_pars>\n#include <lights_physical_pars_fragment>\n#include <shadowmap_pars_fragment>\n#include <bumpmap_pars_fragment>\n#include <normalmap_pars_fragment>\n#include <roughnessmap_pars_fragment>\n#include <metalnessmap_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main() {\n\t#include <clipping_planes_fragment>\n\tvec4 diffuseColor = vec4( diffuse, opacity );\n\tReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );\n\tvec3 totalEmissiveRadiance = emissive;\n\t#include <logdepthbuf_fragment>\n\t#include <map_fragment>\n\t#include <color_fragment>\n\t#include <alphamap_fragment>\n\t#include <alphatest_fragment>\n\t#include <roughnessmap_fragment>\n\t#include <metalnessmap_fragment>\n\t#include <normal_flip>\n\t#include <normal_fragment>\n\t#include <emissivemap_fragment>\n\t#include <lights_physical_fragment>\n\t#include <lights_template>\n\t#include <aomap_fragment>\n\tvec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;\n\tgl_FragColor = vec4( outgoingLight, diffuseColor.a );\n\t#include <tonemapping_fragment>\n\t#include <encodings_fragment>\n\t#include <fog_fragment>\n\t#include <premultiplied_alpha_fragment>\n\t#include <dithering_fragment>\n}\n",
            meshphysical_vert: "#define PHYSICAL\nvarying vec3 vViewPosition;\n#ifndef FLAT_SHADED\n\tvarying vec3 vNormal;\n#endif\n#include <common>\n#include <uv_pars_vertex>\n#include <uv2_pars_vertex>\n#include <displacementmap_pars_vertex>\n#include <color_pars_vertex>\n#include <fog_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <skinning_pars_vertex>\n#include <shadowmap_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvoid main() {\n\t#include <uv_vertex>\n\t#include <uv2_vertex>\n\t#include <color_vertex>\n\t#include <beginnormal_vertex>\n\t#include <morphnormal_vertex>\n\t#include <skinbase_vertex>\n\t#include <skinnormal_vertex>\n\t#include <defaultnormal_vertex>\n#ifndef FLAT_SHADED\n\tvNormal = normalize( transformedNormal );\n#endif\n\t#include <begin_vertex>\n\t#include <morphtarget_vertex>\n\t#include <skinning_vertex>\n\t#include <displacementmap_vertex>\n\t#include <project_vertex>\n\t#include <logdepthbuf_vertex>\n\t#include <clipping_planes_vertex>\n\tvViewPosition = - mvPosition.xyz;\n\t#include <worldpos_vertex>\n\t#include <shadowmap_vertex>\n\t#include <fog_vertex>\n}\n",
            normal_frag: "#define NORMAL\nuniform float opacity;\n#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP )\n\tvarying vec3 vViewPosition;\n#endif\n#ifndef FLAT_SHADED\n\tvarying vec3 vNormal;\n#endif\n#include <packing>\n#include <uv_pars_fragment>\n#include <bumpmap_pars_fragment>\n#include <normalmap_pars_fragment>\n#include <logdepthbuf_pars_fragment>\nvoid main() {\n\t#include <logdepthbuf_fragment>\n\t#include <normal_flip>\n\t#include <normal_fragment>\n\tgl_FragColor = vec4( packNormalToRGB( normal ), opacity );\n}\n",
            normal_vert: "#define NORMAL\n#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP )\n\tvarying vec3 vViewPosition;\n#endif\n#ifndef FLAT_SHADED\n\tvarying vec3 vNormal;\n#endif\n#include <uv_pars_vertex>\n#include <displacementmap_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <skinning_pars_vertex>\n#include <logdepthbuf_pars_vertex>\nvoid main() {\n\t#include <uv_vertex>\n\t#include <beginnormal_vertex>\n\t#include <morphnormal_vertex>\n\t#include <skinbase_vertex>\n\t#include <skinnormal_vertex>\n\t#include <defaultnormal_vertex>\n#ifndef FLAT_SHADED\n\tvNormal = normalize( transformedNormal );\n#endif\n\t#include <begin_vertex>\n\t#include <morphtarget_vertex>\n\t#include <skinning_vertex>\n\t#include <displacementmap_vertex>\n\t#include <project_vertex>\n\t#include <logdepthbuf_vertex>\n#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP )\n\tvViewPosition = - mvPosition.xyz;\n#endif\n}\n",
            points_frag: "uniform vec3 diffuse;\nuniform float opacity;\n#include <common>\n#include <packing>\n#include <color_pars_fragment>\n#include <map_particle_pars_fragment>\n#include <fog_pars_fragment>\n#include <shadowmap_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main() {\n\t#include <clipping_planes_fragment>\n\tvec3 outgoingLight = vec3( 0.0 );\n\tvec4 diffuseColor = vec4( diffuse, opacity );\n\t#include <logdepthbuf_fragment>\n\t#include <map_particle_fragment>\n\t#include <color_fragment>\n\t#include <alphatest_fragment>\n\toutgoingLight = diffuseColor.rgb;\n\tgl_FragColor = vec4( outgoingLight, diffuseColor.a );\n\t#include <premultiplied_alpha_fragment>\n\t#include <tonemapping_fragment>\n\t#include <encodings_fragment>\n\t#include <fog_fragment>\n}\n",
            points_vert: "uniform float size;\nuniform float scale;\n#include <common>\n#include <color_pars_vertex>\n#include <fog_pars_vertex>\n#include <shadowmap_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvoid main() {\n\t#include <color_vertex>\n\t#include <begin_vertex>\n\t#include <project_vertex>\n\t#ifdef USE_SIZEATTENUATION\n\t\tgl_PointSize = size * ( scale / - mvPosition.z );\n\t#else\n\t\tgl_PointSize = size;\n\t#endif\n\t#include <logdepthbuf_vertex>\n\t#include <clipping_planes_vertex>\n\t#include <worldpos_vertex>\n\t#include <shadowmap_vertex>\n\t#include <fog_vertex>\n}\n",
            shadow_frag: "uniform float opacity;\n#include <common>\n#include <packing>\n#include <bsdfs>\n#include <lights_pars>\n#include <shadowmap_pars_fragment>\n#include <shadowmask_pars_fragment>\nvoid main() {\n\tgl_FragColor = vec4( 0.0, 0.0, 0.0, opacity * ( 1.0 - getShadowMask() ) );\n}\n",
            shadow_vert: "#include <shadowmap_pars_vertex>\nvoid main() {\n\t#include <begin_vertex>\n\t#include <project_vertex>\n\t#include <worldpos_vertex>\n\t#include <shadowmap_vertex>\n}\n",
            none_frag: e,
            none_vert: t,
            normals_frag: n,
            normals_vert: i,
            texture_frag: r,
            texture_vert: a,
            texture_normals_frag: o,
            texture_normals_vert: s,
            parseIncludes: function(e) {
                return e.replace(/#include +<([\w\d.]+)>/g, function(e, t) {
                    var n = l[t];
                    if (void 0 === n)
                        throw new Error("Can not resolve #include <" + t + ">");
                    return l.parseIncludes(n)
                })
            }
        };
        return l
    }),
    r("Core/FramebufferTexture", [], function() {
        return function(e, t) {
            this.mesh = e,
            this.texture = t
        }
    }),
    r("Core/LOD", ["Core/Rotation", "Core/RendererUtils"], function(t, l) {
        var c, n = Cesium.defaultValue;
        function e(e) {
            e = n(e, {}),
            this.uuid = Cesium.createGuid(),
            this.show = n(e.show, !0),
            this.maxAvailableDistance = n(e.maxAvailableDistance, Number.MAX_VALUE),
            this._position = n(e.position, new Cesium.Cartesian3(0,0,0)),
            this._scale = n(e.scale, new Cesium.Cartesian3(1,1,1)),
            this._rotation = n(e.rotation, {
                axis: new Cesium.Cartesian3(0,0,1),
                angle: 0
            }),
            this._rotation = new t(this._rotation.axis,this._rotation.angle),
            this._boundingSphere = new Cesium.BoundingSphere,
            this._needsUpdate = !1,
            this._modelMatrixNeedsUpdate = !0,
            this._modelMatrix = new Cesium.Matrix4,
            Cesium.Matrix4.clone(Cesium.Matrix4.IDENTITY, this._modelMatrix),
            this._onNeedUpdateChanged = function() {
                this._modelMatrixNeedsUpdate = !0
            }
            ,
            this._rotation.paramChanged.removeEventListener(this._onNeedUpdateChanged),
            this._children = [],
            this._parent = null,
            this.type = "LOD",
            Object.defineProperties(this, {
                levels: {
                    enumerable: !0,
                    value: []
                }
            })
        }
        return e.prototype = {
            constructor: e,
            setPosition: function(e, t, n) {
                var i = !1;
                1 == arguments.length && ("number" == typeof e ? (e != this._position.x && (i = !0),
                this._position.x = e) : e instanceof Cesium.Cartesian3 && (e == this._position.x && t == this._position.y && n == this._position.z || (i = !0),
                this._position.x = e.x,
                this._position.y = e.y,
                this._position.z = e.z)),
                2 == arguments.length && "number" == typeof t && (t != this._position.y && (i = !0),
                this._position.y = t),
                3 == arguments.length && "number" == typeof n && (n != this._position.z && (i = !0),
                this._position.z = n),
                i && (this._modelMatrixNeedsUpdate = !0)
            },
            setScale: function(e, t, n) {
                var i = !1;
                1 == arguments.length && ("number" == typeof e ? (e != this._scale.x && (i = !0),
                this._scale.x = e) : e instanceof Cesium.Cartesian3 && (e == this._scale.x && t == this._scale.y && n == this._scale.z || (i = !0),
                this._scale.x = e.x,
                this._scale.y = e.y,
                this._scale.z = e.z)),
                2 == arguments.length && "number" == typeof t && (t != this._scale.y && (i = !0),
                this._scale.y = t),
                3 == arguments.length && "number" == typeof n && (n != this._scale.z && (i = !0),
                this._scale.z = n),
                i && (this._modelMatrixNeedsUpdate = !0)
            },
            addLevel: function(e, t) {
                void 0 === t && (t = 0),
                t = Math.abs(t);
                for (var n = this.levels, i = 0; i < n.length && !(t < n[i].distance); i++)
                    ;
                n.splice(i, 0, {
                    distance: t,
                    object: e
                }),
                (e.parent = this)._children.push(e),
                this.levels[0].object.geometry ? this._boundingSphere.radius = this.levels[0].object.geometry.boundingSphere.radius : this.levels[0].object.boundingSphere && (this._boundingSphere.radius = this.levels[0].object.boundingSphere.radius)
            },
            update: (c = new Cesium.Cartesian3,
            function(e, t) {
                var n = this.levels;
                if (1 < n.length) {
                    this._modelMatrixNeedsUpdate && (l.computeModelMatrix(e, this.position, this.rotation, this.scale, this.modelMatrix),
                    this._modelMatrixNeedsUpdate = !1),
                    Cesium.Matrix4.getTranslation(this.modelMatrix, c),
                    Cesium.Cartesian3.clone(c, this._boundingSphere.center);
                    var i = this._boundingSphere
                      , r = Math.max(0, Cesium.Cartesian3.distance(i.center, t.camera.positionWC) - i.radius)
                      , a = this.maxAvailableDistance > r;
                    a = a && t.cullingVolume.computeVisibility(this._boundingSphere) !== Cesium.Intersect.OUTSIDE,
                    n[0].object.show = a;
                    for (var o = 1, s = n.length; o < s && r >= n[o].distance; o++)
                        n[o - 1].object.show = !1,
                        n[o].object.show = a;
                    for (; o < s; o++)
                        n[o].object.show = !1
                }
            }
            ),
            getObjectForDistance: function(e) {
                for (var t = this.levels, n = 1, i = t.length; n < i && !(e < t[n].distance); n++)
                    ;
                return t[n - 1].object
            }
        },
        Cesium.defineProperties(e.prototype, {
            modelMatrix: {
                get: function() {
                    return this._modelMatrix
                }
            },
            parent: {
                get: function() {
                    return this._parent
                },
                set: function(e) {
                    if (e && (e._children && Cesium.isArray(e._children) || e.children && Cesium.isArray(e.children))) {
                        if (this._parent && this._parent != e) {
                            var t = this._parent._children ? this._parent._children : this._parent.children;
                            Cesium.isArray(t) && function(e, t) {
                                for (var n = 0; n < e.length; n++)
                                    if (e[n] == t) {
                                        e.splice(n, 1);
                                        break
                                    }
                            }(t, this)
                        }
                        if (this._parent = e,
                        "function" == typeof this._parent.add)
                            this._parent.add(this);
                        else
                            (t = e._children ? e._children : e.children).push(this)
                    }
                    this._needsUpdate = !0
                }
            },
            children: {
                get: function() {
                    return this._children
                },
                set: function(e) {
                    this._children = e,
                    this._needsUpdate = !0
                }
            },
            needsUpdate: {
                get: function() {
                    return this._needsUpdate
                },
                set: function(e) {
                    this._needsUpdate = e
                }
            },
            rotation: {
                get: function() {
                    return this._rotation
                },
                set: function(e) {
                    e != this._rotation && (this._rotation = e,
                    this._needUpdate = !0),
                    this._rotation.paramChanged.removeEventListener(this._onNeedUpdateChanged),
                    this._rotation = e,
                    this._rotation.paramChanged.addEventListener(this._onNeedUpdateChanged)
                }
            },
            position: {
                get: function() {
                    return this._position
                },
                set: function(e) {
                    e.x == this._position.x && e.y == this._position.y && e.z == this._position.z || (this._position = e,
                    this._needsUpdate = !0),
                    this._position = e
                }
            },
            scale: {
                get: function() {
                    return this._scale
                },
                set: function(e) {
                    e.x == this._scale.x && e.y == this._scale.y && e.z == this._scale.z || (this._scale = e,
                    this._needsUpdate = !0),
                    this._scale = e
                }
            }
        }),
        e
    }),
    r("Core/ArrowGeometry", ["Core/GeometryUtils"], function(l) {
        function e(e) {
            e = Cesium.defaultValue(e, {}),
            this.length = Cesium.defaultValue(e.length, 5e4),
            this.width = Cesium.defaultValue(e.width, 125),
            this.headLength = Cesium.defaultValue(e.headLength, 5e3),
            this.headWidth = Cesium.defaultValue(e.headWidth, 1e3),
            this.reverse = Cesium.defaultValue(e.reverse, !1)
        }
        return e.createGeometry = function(e) {
            var t, n = e.length, i = e.width, r = e.headLength, a = e.headWidth, o = e.reverse, s = Cesium.CylinderGeometry.createGeometry(new Cesium.CylinderGeometry({
                length: n,
                topRadius: i,
                bottomRadius: i
            }));
            return o ? (t = Cesium.CylinderGeometry.createGeometry(new Cesium.CylinderGeometry({
                length: r,
                topRadius: a,
                bottomRadius: 0
            })),
            l.translate(t, [0, 0, -(n + r) / 2])) : (t = Cesium.CylinderGeometry.createGeometry(new Cesium.CylinderGeometry({
                length: r,
                topRadius: 0,
                bottomRadius: a
            })),
            l.translate(t, [0, 0, (n + r) / 2])),
            l.mergeGeometries([s, t])
        }
        ,
        e
    }),
    r("Core/PlaneGeometry", [], function() {
        function e(e) {
            if (this.type = "PlaneGeometry",
            !e || !e.positions)
                throw new Error("缺少positions参数");
            if (4 != e.positions.length && e.positions.length / 3 != 4)
                throw new Error("positions参数必须包含四个顶点的位置坐标");
            this.positions = e.positions
        }
        return e.createGeometry = function(e) {
            var t, n = e.positions;
            if (!Cesium.isArray(n))
                throw new Error("positions参数必须是数组类型");
            if (n[0]instanceof Cesium.Cartesian3) {
                t = new Float32Array(12);
                for (var i = 0; i < n.length; i++) {
                    var r = n[i];
                    t[3 * i] = r.x,
                    t[3 * i + 1] = r.y,
                    t[3 * i + 2] = r.z
                }
            } else {
                if ("number" != typeof n[0])
                    throw new Error("positions参数有误");
                t = new Float32Array(t)
            }
            var a = new Int32Array([0, 1, 3, 1, 2, 3])
              , o = {
                position: new Cesium.GeometryAttribute({
                    componentDatatype: Cesium.ComponentDatatype.DOUBLE,
                    componentsPerAttribute: 3,
                    values: n
                })
            }
              , s = Cesium.BoundingSphere.fromVertices(n);
            return new Cesium.Geometry({
                attributes: o,
                indices: new Int32Array(a),
                primitiveType: Cesium.PrimitiveType.TRIANGLES,
                boundingSphere: s
            })
        }
        ,
        e
    }),
    r("Core/ReferenceMesh", ["Core/ArrowGeometry", "Core/PlaneGeometry", "Core/Mesh", "Core/MeshMaterial", "Core/Rotation", "Core/RendererUtils"], function(c, e, d, u, f, n) {
        var m = Cesium.defaultValue;
        function t(e) {
            e = Cesium.defaultValue(e, {}),
            this._axisParameter = new c(e.axisParameter),
            this._axisParameterY = new c(e.axisParameter),
            this._axisParameterY.reverse = !0;
            var t = new u({
                defaultColor: "rgba(255,0,0,1)",
                wireframe: !1,
                side: u.Sides.DOUBLE,
                translucent: !1
            })
              , n = new u({
                defaultColor: "rgba(0,255,0,1)",
                wireframe: !1,
                side: u.Sides.DOUBLE,
                translucent: !0
            })
              , i = new u({
                defaultColor: "rgba(0,0,255,1)",
                wireframe: !1,
                side: u.Sides.DOUBLE,
                translucent: !1
            })
              , r = c.createGeometry(new c(this._axisParameter))
              , a = c.createGeometry(new c(this._axisParameterY))
              , o = new d(r,t)
              , s = new d(a,n)
              , l = new d(r,i);
            o.position.z = this._axisParameter.length / 2,
            s.position.y = -this._axisParameter.length / 2,
            s.rotation.axis.y = 1,
            s.rotation.angle = -180,
            l.position.x = this._axisParameter.length / 2,
            l.rotation.axis.x = 1,
            l.rotation.angle = -180,
            l.parent = this,
            s.parent = this,
            (o.parent = this)._children = [l, s, o],
            this.x = l,
            this.y = s,
            this.z = o,
            this.uuid = Cesium.createGuid(),
            this.show = m(e.show, !0),
            this._position = m(e.position, new Cesium.Cartesian3(0,0,0)),
            this._scale = m(e.scale, new Cesium.Cartesian3(1,1,1)),
            this._rotation = m(e.rotation, {
                axis: new Cesium.Cartesian3(0,0,1),
                angle: 0
            }),
            this._rotation = new f(this._rotation.axis,this._rotation.angle),
            this._needsUpdate = !0,
            this._modelMatrixNeedsUpdate = !0,
            this._modelMatrix = new Cesium.Matrix4,
            Cesium.Matrix4.clone(Cesium.Matrix4.IDENTITY, this._modelMatrix),
            this._onNeedUpdateChanged = function() {
                this._modelMatrixNeedsUpdate = !0
            }
            ,
            this._rotation.paramChanged.removeEventListener(this._onNeedUpdateChanged),
            this._parent = null
        }
        return Cesium.defineProperties(t.prototype, {
            modelMatrix: {
                get: function() {
                    return this._modelMatrix
                }
            },
            parent: {
                get: function() {
                    return this._parent
                },
                set: function(e) {
                    if (e && (e._children && Cesium.isArray(e._children) || e.children && Cesium.isArray(e.children))) {
                        if (this._parent && this._parent != e) {
                            var t = this._parent._children ? this._parent._children : this._parent.children;
                            Cesium.isArray(t) && function(e, t) {
                                for (var n = 0; n < e.length; n++)
                                    if (e[n] == t) {
                                        e.splice(n, 1);
                                        break
                                    }
                            }(t, this)
                        }
                        if (this._parent = e,
                        "function" == typeof this._parent.add)
                            this._parent.add(this);
                        else
                            (t = e._children ? e._children : e.children).push(this)
                    }
                    this.modelMatrixNeedsUpdate = !0
                }
            },
            modelMatrixNeedsUpdate: {
                get: function() {
                    return this._modelMatrixNeedsUpdate
                },
                set: function(t) {
                    this._modelMatrixNeedsUpdate = t,
                    this._modelMatrixNeedsUpdate && d.traverse(this, function(e) {
                        e._modelMatrixNeedsUpdate = t
                    })
                }
            },
            children: {
                get: function() {
                    return this._children
                }
            },
            needsUpdate: {
                get: function() {
                    return this._needsUpdate
                },
                set: function(e) {
                    this._needsUpdate = e
                }
            },
            rotation: {
                get: function() {
                    return this._rotation
                },
                set: function(e) {
                    e != this._rotation && (this._rotation = e,
                    this.modelMatrixNeedsUpdate = !0),
                    this._rotation.paramChanged.removeEventListener(this._onNeedUpdateChanged),
                    this._rotation = e,
                    this._rotation.paramChanged.addEventListener(this._onNeedUpdateChanged)
                }
            },
            position: {
                get: function() {
                    return this._position
                },
                set: function(e) {
                    e.x == this._position.x && e.y == this._position.y && e.z == this._position.z || (this._position = e,
                    this.modelMatrixNeedsUpdate = !0),
                    this._position = e
                }
            },
            scale: {
                get: function() {
                    return this._scale
                },
                set: function(e) {
                    e.x == this._scale.x && e.y == this._scale.y && e.z == this._scale.z || (this._scale = e,
                    this.modelMatrixNeedsUpdate = !0),
                    this._scale = e
                }
            }
        }),
        t.prototype.update = function(e, t) {
            (this._modelMatrixNeedsUpdate || this._needsUpdate) && (n.computeModelMatrix(e, this.position, this.rotation, this.scale, this.modelMatrix),
            this._modelMatrixNeedsUpdate = !1)
        }
        ,
        t
    }),
    n.prototype = {
        isLittleEndian: function() {
            var e = this.getBytes(2, 0);
            if (18761 === e)
                this.littleEndian = !0;
            else {
                if (19789 !== e)
                    throw console.log(e),
                    TypeError("Invalid byte order value.");
                this.littleEndian = !1
            }
            return this.littleEndian
        },
        hasTowel: function() {
            if (42 !== this.getBytes(2, 2))
                throw RangeError("You forgot your towel!");
            return !0
        },
        getFieldTagName: function(e) {
            var t = {
                315: "Artist",
                258: "BitsPerSample",
                265: "CellLength",
                264: "CellWidth",
                320: "ColorMap",
                259: "Compression",
                33432: "Copyright",
                306: "DateTime",
                338: "ExtraSamples",
                266: "FillOrder",
                289: "FreeByteCounts",
                288: "FreeOffsets",
                291: "GrayResponseCurve",
                290: "GrayResponseUnit",
                316: "HostComputer",
                270: "ImageDescription",
                257: "ImageLength",
                256: "ImageWidth",
                271: "Make",
                281: "MaxSampleValue",
                280: "MinSampleValue",
                272: "Model",
                254: "NewSubfileType",
                274: "Orientation",
                262: "PhotometricInterpretation",
                284: "PlanarConfiguration",
                296: "ResolutionUnit",
                278: "RowsPerStrip",
                277: "SamplesPerPixel",
                305: "Software",
                279: "StripByteCounts",
                273: "StripOffsets",
                255: "SubfileType",
                263: "Threshholding",
                282: "XResolution",
                283: "YResolution",
                326: "BadFaxLines",
                327: "CleanFaxData",
                343: "ClipPath",
                328: "ConsecutiveBadFaxLines",
                433: "Decode",
                434: "DefaultImageColor",
                269: "DocumentName",
                336: "DotRange",
                321: "HalftoneHints",
                346: "Indexed",
                347: "JPEGTables",
                285: "PageName",
                297: "PageNumber",
                317: "Predictor",
                319: "PrimaryChromaticities",
                532: "ReferenceBlackWhite",
                339: "SampleFormat",
                559: "StripRowCounts",
                330: "SubIFDs",
                292: "T4Options",
                293: "T6Options",
                325: "TileByteCounts",
                323: "TileLength",
                324: "TileOffsets",
                322: "TileWidth",
                301: "TransferFunction",
                318: "WhitePoint",
                344: "XClipPathUnits",
                286: "XPosition",
                529: "YCbCrCoefficients",
                531: "YCbCrPositioning",
                530: "YCbCrSubSampling",
                345: "YClipPathUnits",
                287: "YPosition",
                37378: "ApertureValue",
                40961: "ColorSpace",
                36868: "DateTimeDigitized",
                36867: "DateTimeOriginal",
                34665: "Exif IFD",
                36864: "ExifVersion",
                33434: "ExposureTime",
                41728: "FileSource",
                37385: "Flash",
                40960: "FlashpixVersion",
                33437: "FNumber",
                42016: "ImageUniqueID",
                37384: "LightSource",
                37500: "MakerNote",
                37377: "ShutterSpeedValue",
                37510: "UserComment",
                33723: "IPTC",
                34675: "ICC Profile",
                700: "XMP",
                42112: "GDAL_METADATA",
                42113: "GDAL_NODATA",
                34377: "Photoshop"
            };
            return e in t ? t[e] : "Tag" + e
        },
        getFieldTypeName: function(e) {
            var t, n = {
                1: "BYTE",
                2: "ASCII",
                3: "SHORT",
                4: "LONG",
                5: "RATIONAL",
                6: "SBYTE",
                7: "UNDEFINED",
                8: "SSHORT",
                9: "SLONG",
                10: "SRATIONAL",
                11: "FLOAT",
                12: "DOUBLE"
            };
            return e in n && (t = n[e]),
            t
        },
        getFieldTypeLength: function(e) {
            var t;
            return -1 !== ["BYTE", "ASCII", "SBYTE", "UNDEFINED"].indexOf(e) ? t = 1 : -1 !== ["SHORT", "SSHORT"].indexOf(e) ? t = 2 : -1 !== ["LONG", "SLONG", "FLOAT"].indexOf(e) ? t = 4 : -1 !== ["RATIONAL", "SRATIONAL", "DOUBLE"].indexOf(e) && (t = 8),
            t
        },
        getBits: function(e, t, n) {
            n = n || 0;
            var i = t + Math.floor(n / 8)
              , r = n + e
              , a = 32 - e;
            if (r <= 0)
                throw console.log(e, t, n),
                RangeError("No bits requested");
            if (r <= 8)
                var o = 24 + n
                  , s = this.tiffDataView.getUint8(i, this.littleEndian);
            else if (r <= 16)
                o = 16 + n,
                s = this.tiffDataView.getUint16(i, this.littleEndian);
            else {
                if (!(r <= 32))
                    throw console.log(e, t, n),
                    RangeError("Too many bits requested");
                o = n,
                s = this.tiffDataView.getUint32(i, this.littleEndian)
            }
            return {
                bits: s << o >>> a,
                byteOffset: i + Math.floor(r / 8),
                bitOffset: r % 8
            }
        },
        getBytes: function(e, t) {
            if (e <= 0)
                throw console.log(e, t),
                RangeError("No bytes requested");
            if (e <= 1)
                return this.tiffDataView.getUint8(t, this.littleEndian);
            if (e <= 2)
                return this.tiffDataView.getUint16(t, this.littleEndian);
            if (e <= 3)
                return this.tiffDataView.getUint32(t, this.littleEndian) >>> 8;
            if (e <= 4)
                return this.tiffDataView.getUint32(t, this.littleEndian);
            throw console.log(e, t),
            RangeError("Too many bytes requested")
        },
        getFieldValues: function(e, t, n, i) {
            var r = []
              , a = this.getFieldTypeLength(t)
              , o = a * n;
            if (o <= 4) {
                if (!1 === this.littleEndian)
                    var s = i >>> 8 * (4 - a);
                else
                    s = i;
                r.push(s)
            } else
                for (var l = 0; l < n; l++) {
                    var c = a * l;
                    if (8 <= a) {
                        if (-1 === ["RATIONAL", "SRATIONAL"].indexOf(t))
                            throw console.log(t, n, o),
                            TypeError("Can't handle this field type or size");
                        r.push(this.getBytes(4, i + c)),
                        r.push(this.getBytes(4, i + c + 4))
                    } else
                        r.push(this.getBytes(a, i + c))
                }
            return "ASCII" === t && r.forEach(function(e, t, n) {
                n[t] = String.fromCharCode(e)
            }),
            r
        },
        clampColorSample: function(e, t) {
            var n = Math.pow(2, 8 - t);
            return Math.floor(e * n + (n - 1))
        },
        makeRGBAFillValue: function(e, t, n, i) {
            return void 0 === i && (i = 1),
            "rgba(" + e + ", " + t + ", " + n + ", " + i + ")"
        },
        parseFileDirectory: function(e) {
            for (var t = this.getBytes(2, e), n = [], i = e + 2, r = 0; r < t; i += 12,
            r++) {
                var a = this.getBytes(2, i)
                  , o = this.getBytes(2, i + 2)
                  , s = this.getBytes(4, i + 4)
                  , l = this.getBytes(4, i + 8)
                  , c = this.getFieldTagName(a)
                  , d = this.getFieldTypeName(o)
                  , u = this.getFieldValues(c, d, s, l);
                n[c] = {
                    type: d,
                    values: u
                }
            }
            this.fileDirectories.push(n);
            var f = this.getBytes(4, i);
            return 0 === f ? this.fileDirectories : this.parseFileDirectory(f)
        },
        parseTIFF: function(e, t) {
            if (t = t || document.createElement("canvas"),
            this.tiffDataView = new DataView(e),
            this.canvas = t,
            this.littleEndian = this.isLittleEndian(this.tiffDataView),
            this.hasTowel(this.tiffDataView, this.littleEndian)) {
                var n = this.getBytes(4, 4);
                this.fileDirectories = this.parseFileDirectory(n);
                var i = this.fileDirectories[0]
                  , r = i.ImageWidth.values[0]
                  , a = i.ImageLength.values[0];
                this.canvas.width = r,
                this.canvas.height = a;
                var o = []
                  , s = i.Compression ? i.Compression.values[0] : 1
                  , l = i.SamplesPerPixel.values[0]
                  , c = []
                  , d = 0
                  , u = !1;
                if (i.BitsPerSample.values.forEach(function(e, t, n) {
                    c[t] = {
                        bitsPerSample: e,
                        hasBytesPerSample: !1,
                        bytesPerSample: void 0
                    },
                    e % 8 == 0 && (c[t].hasBytesPerSample = !0,
                    c[t].bytesPerSample = e / 8),
                    d += e
                }, this),
                d % 8 == 0) {
                    u = !0;
                    var f = d / 8
                }
                var m = i.StripOffsets.values
                  , p = m.length;
                if (i.StripByteCounts)
                    var h = i.StripByteCounts.values;
                else {
                    if (console.log("Missing StripByteCounts!"),
                    1 !== p)
                        throw Error("Cannot recover from missing StripByteCounts");
                    h = [Math.ceil(r * a * d / 8)]
                }
                for (var v = 0; v < p; v++) {
                    var g = m[v];
                    o[v] = [];
                    for (var _ = h[v], x = 0, C = 0, M = 1, y = !0, S = [], E = 0, L = 0, w = 0; x < _; x += M)
                        switch (s) {
                        case 1:
                            var P = 0;
                            for (S = []; P < l; P++) {
                                if (!c[P].hasBytesPerSample) {
                                    var T = this.getBits(c[P].bitsPerSample, g + x, C);
                                    throw S.push(T.bits),
                                    x = T.byteOffset - g,
                                    C = T.bitOffset,
                                    RangeError("Cannot handle sub-byte bits per sample")
                                }
                                var b = c[P].bytesPerSample * P;
                                S.push(this.getBytes(c[P].bytesPerSample, g + x + b))
                            }
                            if (o[v].push(S),
                            !u)
                                throw M = 0,
                                RangeError("Cannot handle sub-byte bits per pixel");
                            M = f;
                            break;
                        case 2:
                        case 3:
                        case 4:
                        case 5:
                        case 6:
                        case 7:
                            break;
                        case 32773:
                            if (y) {
                                y = !1;
                                var D = 1
                                  , A = 1
                                  , R = this.tiffDataView.getInt8(g + x, this.littleEndian);
                                0 <= R && R <= 127 ? D = R + 1 : -127 <= R && R <= -1 ? A = 1 - R : y = !0
                            } else {
                                var U = this.getBytes(1, g + x);
                                for (P = 0; P < A; P++) {
                                    if (!c[L].hasBytesPerSample)
                                        throw RangeError("Cannot handle sub-byte bits per sample");
                                    w = w << 8 * E | U,
                                    ++E === c[L].bytesPerSample && (S.push(w),
                                    w = E = 0,
                                    L++),
                                    L === l && (o[v].push(S),
                                    S = [],
                                    L = 0)
                                }
                                0 === --D && (y = !0)
                            }
                            M = 1
                        }
                }
                if (t.getContext) {
                    var N = this.canvas.getContext("2d");
                    if (N.fillStyle = this.makeRGBAFillValue(255, 255, 255, 0),
                    i.RowsPerStrip)
                        var I = i.RowsPerStrip.values[0];
                    else
                        I = a;
                    var G = o.length
                      , z = a % I
                      , V = 0 == z ? I : z
                      , F = I
                      , O = 0
                      , H = i.PhotometricInterpretation.values[0]
                      , B = []
                      , k = 0;
                    if (i.ExtraSamples && (k = (B = i.ExtraSamples.values).length),
                    i.ColorMap)
                        var Y = i.ColorMap.values
                          , j = Math.pow(2, c[0].bitsPerSample);
                    for (v = 0; v < G; v++) {
                        v + 1 === G && (F = V);
                        for (var W = o[v].length, X = O * v, q = 0, Z = 0; Z < W; q++)
                            for (var Q = 0; Q < r; Q++,
                            Z++) {
                                var K = o[v][Z]
                                  , J = 0
                                  , $ = 0
                                  , ee = 0
                                  , te = 1;
                                if (0 < k)
                                    for (var ne = 0; ne < k; ne++)
                                        if (1 === B[ne] || 2 === B[ne]) {
                                            te = K[3 + ne] / 256;
                                            break
                                        }
                                switch (H) {
                                case 0:
                                    if (c[0].hasBytesPerSample)
                                        var ie = Math.pow(16, 2 * c[0].bytesPerSample);
                                    K.forEach(function(e, t, n) {
                                        n[t] = ie - e
                                    });
                                case 1:
                                    J = $ = ee = this.clampColorSample(K[0], c[0].bitsPerSample);
                                    break;
                                case 2:
                                    J = this.clampColorSample(K[0], c[0].bitsPerSample),
                                    $ = this.clampColorSample(K[1], c[1].bitsPerSample),
                                    ee = this.clampColorSample(K[2], c[2].bitsPerSample);
                                    break;
                                case 3:
                                    if (void 0 === Y)
                                        throw Error("Palette image missing color map");
                                    var re = K[0];
                                    J = this.clampColorSample(Y[re], 16),
                                    $ = this.clampColorSample(Y[j + re], 16),
                                    ee = this.clampColorSample(Y[2 * j + re], 16);
                                    break;
                                case 4:
                                    throw RangeError("Not Yet Implemented: Transparency mask");
                                case 5:
                                    throw RangeError("Not Yet Implemented: CMYK");
                                case 6:
                                    throw RangeError("Not Yet Implemented: YCbCr");
                                case 8:
                                    throw RangeError("Not Yet Implemented: CIELab");
                                default:
                                    throw RangeError("Unknown Photometric Interpretation:", H)
                                }
                                N.fillStyle = this.makeRGBAFillValue(J, $, ee, te),
                                N.fillRect(Q, X + q, 1, 1)
                            }
                        O = F
                    }
                }
                return this.canvas
            }
        }
    },
    "undefined" == typeof module ? this.TIFFParser = n : module.exports = n,
    "function" == typeof r && r("ThirdParty/tiff-js/tiff", [], function() {
        return n
    }),
    i.GetExtension = function(e) {
        var t = e.lastIndexOf(".");
        return 0 <= t ? e.substring(t, e.length) : ""
    }
    ,
    i.GetFileName = function(e) {
        var t = e.lastIndexOf("/");
        return t < 0 ? e : e.substring(t + 1, e.length)
    }
    ,
    i.GetDirectoryName = function(e) {
        var t = e.lastIndexOf("/");
        return t < 0 ? "" : e.substring(0, t)
    }
    ,
    i.Combine = function(e, t) {
        return e + t
    }
    ,
    i.ChangeExtension = function(e, t) {
        return e.replace(i.GetExtension(e), t)
    }
    ,
    "undefined" == typeof module ? this.Path = i : module.exports = i,
    "function" == typeof r && r("Util/Path", [], function() {
        return i
    }),
    r("Core/Shaders/ShaderLib", ["Core/Shaders/ShaderChunk"], function(e) {
        var t = {
            common: {
                diffuse: {
                    value: new Cesium.Color(15658734)
                },
                opacity: {
                    value: 1
                },
                map: {
                    value: null
                },
                offsetRepeat: {
                    value: new Cesium.Cartesian4(0,0,1,1)
                },
                specularMap: {
                    value: null
                },
                alphaMap: {
                    value: null
                },
                envMap: {
                    value: null
                },
                flipEnvMap: {
                    value: -1
                },
                reflectivity: {
                    value: 1
                },
                refractionRatio: {
                    value: .98
                }
            },
            aomap: {
                aoMap: {
                    value: null
                },
                aoMapIntensity: {
                    value: 1
                }
            },
            lightmap: {
                lightMap: {
                    value: null
                },
                lightMapIntensity: {
                    value: 1
                }
            },
            emissivemap: {
                emissiveMap: {
                    value: null
                }
            },
            bumpmap: {
                bumpMap: {
                    value: null
                },
                bumpScale: {
                    value: 1
                }
            },
            normalmap: {
                normalMap: {
                    value: null
                },
                normalScale: {
                    value: new Cesium.Cartesian2(1,1)
                }
            },
            displacementmap: {
                displacementMap: {
                    value: null
                },
                displacementScale: {
                    value: 1
                },
                displacementBias: {
                    value: 0
                }
            },
            roughnessmap: {
                roughnessMap: {
                    value: null
                }
            },
            metalnessmap: {
                metalnessMap: {
                    value: null
                }
            },
            gradientmap: {
                gradientMap: {
                    value: null
                }
            },
            fog: {
                fogDensity: {
                    value: 25e-5
                },
                fogNear: {
                    value: 1
                },
                fogFar: {
                    value: 2e3
                },
                fogColor: {
                    value: new Cesium.Color(16777215)
                }
            },
            lights: {
                ambientLightColor: {
                    value: []
                },
                directionalLights: {
                    value: [],
                    properties: {
                        direction: {},
                        color: {},
                        shadow: {},
                        shadowBias: {},
                        shadowRadius: {},
                        shadowMapSize: {}
                    }
                },
                directionalShadowMap: {
                    value: []
                },
                directionalShadowMatrix: {
                    value: []
                },
                spotLights: {
                    value: [],
                    properties: {
                        color: {},
                        position: {},
                        direction: {},
                        distance: {},
                        coneCos: {},
                        penumbraCos: {},
                        decay: {},
                        shadow: {},
                        shadowBias: {},
                        shadowRadius: {},
                        shadowMapSize: {}
                    }
                },
                spotShadowMap: {
                    value: []
                },
                spotShadowMatrix: {
                    value: []
                },
                pointLights: {
                    value: [],
                    properties: {
                        color: {},
                        position: {},
                        decay: {},
                        distance: {},
                        shadow: {},
                        shadowBias: {},
                        shadowRadius: {},
                        shadowMapSize: {}
                    }
                },
                pointShadowMap: {
                    value: []
                },
                pointShadowMatrix: {
                    value: []
                },
                hemisphereLights: {
                    value: [],
                    properties: {
                        direction: {},
                        skyColor: {},
                        groundColor: {}
                    }
                },
                rectAreaLights: {
                    value: [],
                    properties: {
                        color: {},
                        position: {},
                        width: {},
                        height: {}
                    }
                }
            },
            points: {
                diffuse: {
                    value: new Cesium.Color(15658734)
                },
                opacity: {
                    value: 1
                },
                size: {
                    value: 1
                },
                scale: {
                    value: 1
                },
                map: {
                    value: null
                },
                offsetRepeat: {
                    value: new Cesium.Cartesian4(0,0,1,1)
                }
            }
        }
          , n = {
            merge: function(e) {
                for (var t = {}, n = 0; n < e.length; n++) {
                    var i = this.clone(e[n]);
                    for (var r in i)
                        t[r] = i[r]
                }
                return t
            },
            clone: function(e) {
                var t = {};
                for (var n in e)
                    for (var i in t[n] = {},
                    e[n]) {
                        var r = e[n][i];
                        r && (r instanceof Cesium.Color || r instanceof Cesium.Matrix3 || r instanceof Cesium.Matrix4 || r instanceof Cesium.Cartesian2 || r instanceof Cesium.Cartesian3 || r instanceof Cesium.Cartesian4) ? t[n][i] = r.constructor.clone(r) : Array.isArray(r) ? t[n][i] = r.slice() : t[n][i] = r
                    }
                return t
            }
        }
          , i = {
            basic: {
                uniforms: n.merge([t.common, t.aomap, t.lightmap, t.fog]),
                vertexShader: e.meshbasic_vert,
                fragmentShader: e.meshbasic_frag
            },
            lambert: {
                uniforms: n.merge([t.common, t.aomap, t.lightmap, t.emissivemap, t.fog, t.lights, {
                    emissive: {
                        value: new Cesium.Color(0)
                    }
                }]),
                vertexShader: e.meshlambert_vert,
                fragmentShader: e.meshlambert_frag
            },
            phong: {
                uniforms: n.merge([t.common, t.aomap, t.lightmap, t.emissivemap, t.bumpmap, t.normalmap, t.displacementmap, t.gradientmap, t.fog, t.lights, {
                    emissive: {
                        value: new Cesium.Color(0)
                    },
                    specular: {
                        value: new Cesium.Color(1118481)
                    },
                    shininess: {
                        value: 30
                    }
                }]),
                vertexShader: e.meshphong_vert,
                fragmentShader: e.meshphong_frag
            },
            standard: {
                uniforms: n.merge([t.common, t.aomap, t.lightmap, t.emissivemap, t.bumpmap, t.normalmap, t.displacementmap, t.roughnessmap, t.metalnessmap, t.fog, t.lights, {
                    emissive: {
                        value: new Cesium.Color(0)
                    },
                    roughness: {
                        value: .5
                    },
                    metalness: {
                        value: .5
                    },
                    envMapIntensity: {
                        value: 1
                    }
                }]),
                vertexShader: e.meshphysical_vert,
                fragmentShader: e.meshphysical_frag
            },
            points: {
                uniforms: n.merge([t.points, t.fog]),
                vertexShader: e.points_vert,
                fragmentShader: e.points_frag
            },
            dashed: {
                uniforms: n.merge([t.common, t.fog, {
                    scale: {
                        value: 1
                    },
                    dashSize: {
                        value: 1
                    },
                    totalSize: {
                        value: 2
                    }
                }]),
                vertexShader: e.linedashed_vert,
                fragmentShader: e.linedashed_frag
            },
            depth: {
                uniforms: n.merge([t.common, t.displacementmap]),
                vertexShader: e.depth_vert,
                fragmentShader: e.depth_frag
            },
            normal: {
                uniforms: n.merge([t.common, t.bumpmap, t.normalmap, t.displacementmap, {
                    opacity: {
                        value: 1
                    }
                }]),
                vertexShader: e.normal_vert,
                fragmentShader: e.normal_frag
            },
            cube: {
                uniforms: {
                    tCube: {
                        value: null
                    },
                    tFlip: {
                        value: -1
                    },
                    opacity: {
                        value: 1
                    }
                },
                vertexShader: e.cube_vert,
                fragmentShader: e.cube_frag
            },
            equirect: {
                uniforms: {
                    tEquirect: {
                        value: null
                    },
                    tFlip: {
                        value: -1
                    }
                },
                vertexShader: e.equirect_vert,
                fragmentShader: e.equirect_frag
            },
            distanceRGBA: {
                uniforms: {
                    lightPos: {
                        value: new Cesium.Cartesian3
                    }
                },
                vertexShader: e.distanceRGBA_vert,
                fragmentShader: e.distanceRGBA_frag
            }
        };
        return i.physical = {
            uniforms: n.merge([i.standard.uniforms, {
                clearCoat: {
                    value: 0
                },
                clearCoatRoughness: {
                    value: 0
                }
            }]),
            vertexShader: e.meshphysical_vert,
            fragmentShader: e.meshphysical_frag
        },
        i
    }),
    r("Core/MaterialUtils", ["Core/Shaders/ShaderChunk", "Core/Shaders/ShaderLib", "Core/MeshMaterial"], function(e, t, r) {
        var a = {
            MeshDepthMaterial: "depth",
            MeshNormalMaterial: "normal",
            MeshBasicMaterial: "basic",
            MeshLambertMaterial: "lambert",
            MeshPhongMaterial: "phong",
            MeshToonMaterial: "phong",
            MeshStandardMaterial: "physical",
            MeshPhysicalMaterial: "physical",
            LineBasicMaterial: "basic",
            LineDashedMaterial: "dashed",
            PointsMaterial: "points"
        };
        function o() {}
        function s(e, t) {
            d(e.diffuse, t.color),
            d(e.opacity, t.opacity)
        }
        function l(e, t) {
            d(e.specular, t.specular),
            d(e.shininess, Math.max(t.shininess, 1e-4)),
            t.emissiveMap && d(e.emissiveMap, t.emissiveMap),
            t.bumpMap && (d(e.bumpMap, t.bumpMap),
            d(e.bumpScale, t.bumpScale)),
            t.normalMap && (d(e.normalMap, t.normalMap),
            d(e.normalScale.value.copy(t.normalScale))),
            t.displacementMap && (d(e.displacementMap, t.displacementMap),
            d(e.displacementScale, t.displacementScale),
            d(e.displacementBias, t.displacementBias))
        }
        function c(e, t) {
            d(e.roughness, t.roughness),
            d(e.metalness, t.metalness),
            t.roughnessMap && d(e.roughnessMap, t.roughnessMap),
            t.metalnessMap && d(e.metalnessMap, t.metalnessMap),
            t.emissiveMap && d(e.emissiveMap, t.emissiveMap),
            t.bumpMap && (d(e.bumpMap, t.bumpMap),
            d(e.bumpScale, t.bumpScale)),
            t.normalMap && (d(e.normalMap, t.normalMap),
            d(e.normalScale.value.copy(t.normalScale))),
            t.displacementMap && (d(e.displacementMap, t.displacementMap),
            d(e.displacementScale, t.displacementScale),
            d(e.displacementBias, t.displacementBias)),
            t.envMap && d(e.envMapIntensity, t.envMapIntensity)
        }
        function d(e, t) {
            var n = typeof t;
            if ("undefined" != n)
                if (null !== t)
                    if (void 0 !== e.value && null != e.value && e.value.constructor && e.value.constructor.clone && t.constructor == e.value.constructor)
                        e.value = e.value.constructor.clone(t);
                    else
                        switch (n) {
                        case "number":
                        case "string":
                            e.value = t;
                            break;
                        case "object":
                            if (t instanceof THREE.Vector2 && (e.value.constructor.clone || (e.value = new Cesium.Cartesian2)),
                            t instanceof THREE.Vector3 && (e.value.constructor.clone || (e.value = new Cesium.Cartesian3)),
                            t instanceof THREE.Vector4 && (e.value.constructor.clone || (e.value = new Cesium.Cartesian4)),
                            t instanceof THREE.Matrix3 && (e.value.constructor.clone || (e.value = new Cesium.Matrix3)),
                            t instanceof THREE.Matrix4 && (e.value.constructor.clone || (e.value = new Cesium.Matrix4)),
                            t instanceof THREE.Color)
                                e.value.constructor.clone || (e.value = new Cesium.Color(t.r,t.g,t.b,t.a));
                            else if (null != e.value && e.value.constructor.clone)
                                e.value.constructor.clone(t, e.value);
                            else if (t instanceof THREE.Texture) {
                                if (e.value != t.image) {
                                    e.value = t.image;
                                    var i = {};
                                    i.magnificationFilter = Cesium.WebGLConstants.LINEAR,
                                    i.minificationFilter = Cesium.WebGLConstants.NEAREST_MIPMAP_LINEAR,
                                    i.wrapS = Cesium.WebGLConstants.REPEAT,
                                    i.wrapT = Cesium.WebGLConstants.REPEAT,
                                    e.sampler = i,
                                    e.flipY = t.flipY,
                                    e.needsUpdate = !0
                                }
                            } else
                                e.value = t;
                            break;
                        default:
                            console.log("未知uniform.value类型")
                        }
                else
                    e.value = null;
            else
                e.value = void 0
        }
        return o.fromMaterial3js = function(e) {
            var t = a[e.type];
            e["is" + e.type] = !0;
            var n = THREE.ShaderLib[t];
            n || (n = e);
            var i = new r({
                vertexShader: n.vertexShader,
                fragmentShader: n.fragmentShader,
                uniforms: function(e) {
                    var t = {};
                    for (var n in e)
                        if (e.hasOwnProperty(n)) {
                            for (var i in t[n] = {
                                value: {}
                            },
                            e[n])
                                "value" !== i && (t[n][i] = e[n][i]);
                            e[n].t && e[n].t,
                            d(t[n], e[n].value)
                        }
                    return t
                }(n.uniforms)
            });
            return i.material3js = e,
            o.updateMaterialFrom3js(i),
            i
        }
        ,
        o.updateMaterialFrom3js = function(e) {
            if (e && e.material3js) {
                var t = e.material3js;
                e.translucent = t.transparent,
                e.wireframe = t.wireframe;
                var n = e.uniforms
                  , i = e.material3js;
                if ((i.isMeshBasicMaterial || i.isMeshLambertMaterial || i.isMeshPhongMaterial || i.isMeshStandardMaterial || i.isMeshNormalMaterial || i.isMeshDepthMaterial) && function(e, t) {
                    if (d(e.opacity, t.opacity),
                    d(e.diffuse, t.color),
                    t.emissive) {
                        var n = (new t.emissive.constructor).copy(t.emissive).multiplyScalar(t.emissiveIntensity);
                        d(e.emissive, n)
                    }
                    d(e.map, t.map),
                    d(e.specularMap, t.specularMap),
                    d(e.alphaMap, t.alphaMap),
                    t.lightMap && (d(e.lightMap, t.lightMap),
                    d(e.lightMapIntensity, t.lightMapIntensity));
                    t.aoMap && (d(e.aoMap, t.aoMap),
                    d(e.aoMapIntensity, t.aoMapIntensity));
                    var i;
                    t.map ? i = t.map : t.specularMap ? i = t.specularMap : t.displacementMap ? i = t.displacementMap : t.normalMap ? i = t.normalMap : t.bumpMap ? i = t.bumpMap : t.roughnessMap ? i = t.roughnessMap : t.metalnessMap ? i = t.metalnessMap : t.alphaMap ? i = t.alphaMap : t.emissiveMap && (i = t.emissiveMap);
                    if (void 0 !== i) {
                        i.isWebGLRenderTarget && (i = i.texture);
                        var r = i.offset;
                        i.repeat;
                        d(e.offsetRepeat, r)
                    }
                    d(e.envMap, t.envMap),
                    d(e.flipEnvMap, t.envMap && t.envMap.isCubeTexture ? -1 : 1),
                    d(e.reflectivity, t.reflectivity),
                    d(e.refractionRatio, t.refractionRatio)
                }(n, i),
                i.isLineBasicMaterial)
                    s(n, i);
                else if (i.isLineDashedMaterial)
                    s(n, i),
                    function(e, t) {
                        d(e.dashSize, t.dashSize),
                        d(e.totalSize, t.dashSize + t.gapSize),
                        d(e.scale, t.scale)
                    }(n, i);
                else if (i.isPointsMaterial)
                    !function(e, t) {
                        if (d(e.diffuse, t.color),
                        d(e.opacity, t.opacity),
                        d(e.size, t.size * _pixelRatio),
                        d(e.scale, .5 * _height),
                        d(e.map, t.map),
                        null !== t.map) {
                            var n = t.map.offset
                              , i = t.map.repeat;
                            d(e.offsetRepeat.value.set(n.x, n.y, i.x, i.y))
                        }
                    }(n, i);
                else if (i.isMeshLambertMaterial)
                    !function(e, t) {
                        t.emissiveMap && d(e.emissiveMap, t.emissiveMap)
                    }(n, i);
                else if (i.isMeshToonMaterial)
                    !function(e, t) {
                        l(e, t),
                        t.gradientMap && d(e.gradientMap, t.gradientMap)
                    }(n, i);
                else if (i.isMeshPhongMaterial)
                    l(n, i);
                else if (i.isMeshPhysicalMaterial)
                    !function(e, t) {
                        d(e.clearCoat, t.clearCoat),
                        d(e.clearCoatRoughness, t.clearCoatRoughness),
                        c(e, t)
                    }(n, i);
                else if (i.isMeshStandardMaterial)
                    c(n, i);
                else if (i.isMeshDepthMaterial)
                    i.displacementMap && (d(n.displacementMap, i.displacementMap),
                    d(n.displacementScale, i.displacementScale),
                    d(n.displacementBias, i.displacementBias));
                else if (i.isMeshNormalMaterial)
                    !function(e, t) {
                        t.bumpMap && (d(e.bumpMap, t.bumpMap),
                        d(e.bumpScale, t.bumpScale));
                        t.normalMap && (d(e.normalMap, t.normalMap),
                        d(e.normalScale.value.copy(t.normalScale)));
                        t.displacementMap && (d(e.displacementMap, t.displacementMap),
                        d(e.displacementScale, t.displacementScale),
                        d(e.displacementBias, t.displacementBias))
                    }(n, i);
                else
                    for (var r in i.uniforms)
                        i.uniforms.hasOwnProperty(r) && d(n[r], i.uniforms[r].value);
                n.ambientLightColor = {
                    value: new Cesium.Color(.06666666666666667,.06666666666666667,.06666666666666667)
                }
            }
        }
        ,
        o.isMaterial3js = function(e) {
            return "undefined" != typeof THREE && e instanceof THREE.Material
        }
        ,
        o
    }),
    r("Core/MeshUtils", ["Core/MaterialUtils", "Core/GeometryUtils", "Core/Mesh"], function(r, a, o) {
        function s() {}
        return s.fromMesh3js = function(e) {
            if (s.isMesh3js(e)) {
                var t = e.geometry;
                a.isGeometry3js(t) && (t = a.fromGeometry3js(t));
                var n = e.material;
                r.isMaterial3js(n) && (n = r.fromMaterial3js(n));
                var i = new o({
                    geometry: t,
                    material: n,
                    position: e.position,
                    scale: e.scale
                });
                return i.quaternion = e.quaternion,
                i
            }
        }
        ,
        s.isMesh3js = function(e) {
            return "undefined" != typeof THREE && e instanceof THREE.Mesh
        }
        ,
        s
    }),
    r("Core/ShaderUtils", [], function() {
        function e() {}
        if (e.processShader3js = function(e, t) {
            return new l(e,t)
        }
        ,
        "undefined" == typeof THREE)
            return e;
        var h = {
            MeshDepthMaterial: "depth",
            MeshNormalMaterial: "normal",
            MeshBasicMaterial: "basic",
            MeshLambertMaterial: "lambert",
            MeshPhongMaterial: "phong",
            MeshToonMaterial: "phong",
            MeshStandardMaterial: "physical",
            MeshPhysicalMaterial: "physical",
            LineBasicMaterial: "basic",
            LineDashedMaterial: "dashed",
            PointsMaterial: "points"
        }
          , v = THREE.ShaderChunk
          , g = (THREE.ShaderLib,
        THREE.BackSide)
          , _ = THREE.DoubleSide
          , x = THREE.FlatShading
          , C = THREE.CubeUVRefractionMapping
          , M = THREE.CubeUVReflectionMapping
          , i = THREE.GammaEncoding
          , r = THREE.LinearEncoding
          , y = (THREE.NoToneMapping,
        THREE.AddOperation)
          , S = THREE.MixOperation
          , E = THREE.MultiplyOperation
          , L = THREE.EquirectangularRefractionMapping
          , w = THREE.CubeRefractionMapping
          , P = THREE.SphericalReflectionMapping
          , T = THREE.EquirectangularReflectionMapping
          , b = THREE.CubeReflectionMapping
          , t = (THREE.PCFSoftShadowMap,
        THREE.PCFShadowMap,
        THREE.CineonToneMapping,
        THREE.Uncharted2ToneMapping,
        THREE.ReinhardToneMapping,
        THREE.LinearToneMapping,
        i = THREE.GammaEncoding,
        THREE.RGBDEncoding)
          , n = THREE.RGBM16Encoding
          , a = THREE.RGBM7Encoding
          , o = THREE.RGBEEncoding
          , s = THREE.sRGBEncoding;
        function D(e, t) {
            var n;
            return e ? e.isTexture ? n = e.encoding : e.isWebGLRenderTarget && (console.warn("THREE.WebGLPrograms.getTextureEncodingFromMap: don't use render targets as textures. Use their .texture property instead."),
            n = e.texture.encoding) : n = r,
            n === r && t && (n = i),
            n
        }
        var A = 0;
        function R(e) {
            switch (e) {
            case r:
                return ["Linear", "( value )"];
            case s:
                return ["sRGB", "( value )"];
            case o:
                return ["RGBE", "( value )"];
            case a:
                return ["RGBM", "( value, 7.0 )"];
            case n:
                return ["RGBM", "( value, 16.0 )"];
            case t:
                return ["RGBD", "( value, 256.0 )"];
            case i:
                return ["Gamma", "( value, float( GAMMA_FACTOR ) )"];
            default:
                throw new Error("unsupported encoding: " + e)
            }
        }
        function U(e, t) {
            var n = R(t);
            return "vec4 " + e + "( vec4 value ) {  return " + n[0] + "ToLinear" + n[1] + " ; }"
        }
        function N(e) {
            return "" !== e
        }
        function I(e, t) {
            return e.replace(/NUM_DIR_LIGHTS/g, t.numDirLights).replace(/NUM_SPOT_LIGHTS/g, t.numSpotLights).replace(/NUM_RECT_AREA_LIGHTS/g, t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g, t.numPointLights).replace(/NUM_HEMI_LIGHTS/g, t.numHemiLights)
        }
        function G(e) {
            return e.replace(/^[ \t]*#include +<([\w\d.]+)>/gm, function(e, t) {
                var n = v[t];
                if (void 0 === n)
                    throw new Error("Can not resolve #include <" + t + ">");
                return G(n)
            })
        }
        function z(e) {
            return e.replace(/for \( int i \= (\d+)\; i < (\d+)\; i \+\+ \) \{([\s\S]+?)(?=\})\}/g, function(e, t, n, i) {
                for (var r = "", a = parseInt(t); a < parseInt(n); a++)
                    r += i.replace(/\[ i \]/g, "[ " + a + " ]");
                return r
            })
        }
        function l(e, t) {
            var n = function(e) {
                var t = {};
                return {
                    shaderID: h[e.type],
                    precision: "high",
                    supportsVertexTextures: !0,
                    outputEncoding: D(null, t.gammaOutput),
                    map: !!e.map,
                    mapEncoding: D(e.map, t.gammaInput),
                    envMap: !!e.envMap,
                    envMapMode: e.envMap && e.envMap.mapping,
                    envMapEncoding: D(e.envMap, t.gammaInput),
                    envMapCubeUV: !!e.envMap && (e.envMap.mapping === M || e.envMap.mapping === C),
                    lightMap: !!e.lightMap,
                    aoMap: !!e.aoMap,
                    emissiveMap: !!e.emissiveMap,
                    emissiveMapEncoding: D(e.emissiveMap, t.gammaInput),
                    bumpMap: !!e.bumpMap,
                    normalMap: !!e.normalMap,
                    displacementMap: !!e.displacementMap,
                    roughnessMap: !!e.roughnessMap,
                    metalnessMap: !!e.metalnessMap,
                    specularMap: !!e.specularMap,
                    alphaMap: !!e.alphaMap,
                    gradientMap: !!e.gradientMap,
                    combine: e.combine,
                    vertexColors: e.vertexColors,
                    fog: !1,
                    useFog: e.fog,
                    fogExp: !1,
                    flatShading: e.shading === x,
                    sizeAttenuation: e.sizeAttenuation,
                    logarithmicDepthBuffer: !1,
                    skinning: e.skinning,
                    morphTargets: e.morphTargets,
                    morphNormals: e.morphNormals,
                    numDirLights: 0,
                    numPointLights: 0,
                    numSpotLights: 0,
                    numRectAreaLights: 0,
                    numHemiLights: 0,
                    numClippingPlanes: 0,
                    numClipIntersection: 0,
                    premultipliedAlpha: e.premultipliedAlpha,
                    alphaTest: e.alphaTest,
                    doubleSided: e.side === _,
                    flipSided: e.side === g,
                    depthPacking: void 0 !== e.depthPacking && e.depthPacking
                }
            }(e)
              , i = e.defines
              , r = t.vertexShader
              , a = t.fragmentShader
              , o = "SHADOWMAP_TYPE_BASIC";
            n.shadowMapType === THREE.PCFShadowMap ? o = "SHADOWMAP_TYPE_PCF" : n.shadowMapType === THREE.PCFSoftShadowMap && (o = "SHADOWMAP_TYPE_PCF_SOFT");
            var s = "ENVMAP_TYPE_CUBE"
              , l = "ENVMAP_MODE_REFLECTION"
              , c = "ENVMAP_BLENDING_MULTIPLY";
            if (n.envMap) {
                switch (e.envMap.mapping) {
                case b:
                case w:
                    s = "ENVMAP_TYPE_CUBE";
                    break;
                case M:
                case C:
                    s = "ENVMAP_TYPE_CUBE_UV";
                    break;
                case T:
                case L:
                    s = "ENVMAP_TYPE_EQUIREC";
                    break;
                case P:
                    s = "ENVMAP_TYPE_SPHERE"
                }
                switch (e.envMap.mapping) {
                case w:
                case L:
                    l = "ENVMAP_MODE_REFRACTION"
                }
                switch (e.combine) {
                case E:
                    c = "ENVMAP_BLENDING_MULTIPLY";
                    break;
                case S:
                    c = "ENVMAP_BLENDING_MIX";
                    break;
                case y:
                    c = "ENVMAP_BLENDING_ADD"
                }
            }
            var d, u, f = function(e) {
                var t = [];
                for (var n in e) {
                    var i = e[n];
                    !1 !== i && t.push("#define " + n + " " + i)
                }
                return t.join("\n")
            }(i);
            u = e.isRawShaderMaterial ? (d = [f, "\n"].filter(N).join("\n"),
            [f, "\n"].filter(N).join("\n")) : (d = ["#define SHADER_NAME " + t.name, n.supportsVertexTextures ? "#define VERTEX_TEXTURES" : "", "#define GAMMA_FACTOR 1", "#define MAX_BONES " + n.maxBones, n.map ? "#define USE_MAP" : "", n.envMap ? "#define USE_ENVMAP" : "", n.envMap ? "#define " + l : "", n.lightMap ? "#define USE_LIGHTMAP" : "", n.aoMap ? "#define USE_AOMAP" : "", n.emissiveMap ? "#define USE_EMISSIVEMAP" : "", n.bumpMap ? "#define USE_BUMPMAP" : "", n.normalMap ? "#define USE_NORMALMAP" : "", n.displacementMap && n.supportsVertexTextures ? "#define USE_DISPLACEMENTMAP" : "", n.specularMap ? "#define USE_SPECULARMAP" : "", n.roughnessMap ? "#define USE_ROUGHNESSMAP" : "", n.metalnessMap ? "#define USE_METALNESSMAP" : "", n.alphaMap ? "#define USE_ALPHAMAP" : "", n.vertexColors ? "#define USE_COLOR" : "", n.flatShading ? "#define FLAT_SHADED" : "", n.skinning ? "#define USE_SKINNING" : "", n.useVertexTexture ? "#define BONE_TEXTURE" : "", n.morphTargets ? "#define USE_MORPHTARGETS" : "", n.morphNormals && !1 === n.flatShading ? "#define USE_MORPHNORMALS" : "", n.doubleSided ? "#define DOUBLE_SIDED" : "", n.flipSided ? "#define FLIP_SIDED" : "", "#define NUM_CLIPPING_PLANES " + n.numClippingPlanes, n.shadowMapEnabled ? "#define USE_SHADOWMAP" : "", n.shadowMapEnabled ? "#define " + o : "", n.sizeAttenuation ? "#define USE_SIZEATTENUATION" : "", n.logarithmicDepthBuffer ? "#define USE_LOGDEPTHBUF" : "", "#ifdef USE_COLOR", "\tattribute vec3 color;", "#endif", "#ifdef USE_MORPHTARGETS", "\tattribute vec3 morphTarget0;", "\tattribute vec3 morphTarget1;", "\tattribute vec3 morphTarget2;", "\tattribute vec3 morphTarget3;", "\t#ifdef USE_MORPHNORMALS", "\t\tattribute vec3 morphNormal0;", "\t\tattribute vec3 morphNormal1;", "\t\tattribute vec3 morphNormal2;", "\t\tattribute vec3 morphNormal3;", "\t#else", "\t\tattribute vec3 morphTarget4;", "\t\tattribute vec3 morphTarget5;", "\t\tattribute vec3 morphTarget6;", "\t\tattribute vec3 morphTarget7;", "\t#endif", "#endif", "#ifdef USE_SKINNING", "\tattribute vec4 skinIndex;", "\tattribute vec4 skinWeight;", "#endif", "\n"].filter(N).join("\n"),
            ["#define SHADER_NAME " + t.name, f, n.alphaTest ? "#define ALPHATEST " + n.alphaTest : "", "#define GAMMA_FACTOR 1", n.useFog && n.fog ? "#define USE_FOG" : "", n.useFog && n.fogExp ? "#define FOG_EXP2" : "", n.map ? "#define USE_MAP" : "", n.envMap ? "#define USE_ENVMAP" : "", n.envMap ? "#define " + s : "", n.envMap ? "#define " + l : "", n.envMap ? "#define " + c : "", n.lightMap ? "#define USE_LIGHTMAP" : "", n.aoMap ? "#define USE_AOMAP" : "", n.emissiveMap ? "#define USE_EMISSIVEMAP" : "", n.bumpMap ? "#define USE_BUMPMAP" : "", n.normalMap ? "#define USE_NORMALMAP" : "", n.specularMap ? "#define USE_SPECULARMAP" : "", n.roughnessMap ? "#define USE_ROUGHNESSMAP" : "", n.metalnessMap ? "#define USE_METALNESSMAP" : "", n.alphaMap ? "#define USE_ALPHAMAP" : "", n.vertexColors ? "#define USE_COLOR" : "", n.gradientMap ? "#define USE_GRADIENTMAP" : "", n.flatShading ? "#define FLAT_SHADED" : "", n.doubleSided ? "#define DOUBLE_SIDED" : "", n.flipSided ? "#define FLIP_SIDED" : "", "#define NUM_CLIPPING_PLANES " + n.numClippingPlanes, "#define UNION_CLIPPING_PLANES " + (n.numClippingPlanes - n.numClipIntersection), n.shadowMapEnabled ? "#define USE_SHADOWMAP" : "", n.shadowMapEnabled ? "#define " + o : "", n.premultipliedAlpha ? "#define PREMULTIPLIED_ALPHA" : "", n.physicallyCorrectLights ? "#define PHYSICALLY_CORRECT_LIGHTS" : "", n.logarithmicDepthBuffer ? "#define USE_LOGDEPTHBUF" : "", "uniform mat4 viewMatrix;", "uniform vec3 cameraPosition;", n.dithering ? "#define DITHERING" : "", n.outputEncoding || n.mapEncoding || n.envMapEncoding || n.emissiveMapEncoding ? v.encodings_pars_fragment : "", n.mapEncoding ? U("mapTexelToLinear", n.mapEncoding) : "", n.envMapEncoding ? U("envMapTexelToLinear", n.envMapEncoding) : "", n.emissiveMapEncoding ? U("emissiveMapTexelToLinear", n.emissiveMapEncoding) : "", n.outputEncoding ? function(e, t) {
                var n = R(t);
                return "vec4 " + e + "( vec4 value ) { return LinearTo" + n[0] + n[1] + " ; }"
            }("linearToOutputTexel", n.outputEncoding) : "", n.depthPacking ? "#define DEPTH_PACKING " + e.depthPacking : "", "\n"].filter(N).join("\n")),
            r = I(r = G(r), n),
            a = I(a = G(a), n),
            e.isShaderMaterial || (r = z(r),
            a = z(a));
            var m = d + r
              , p = u + a;
            return this.id = A++,
            this.usedTimes = 1,
            this.vertexShader = m,
            this.fragmentShader = p,
            this
        }
        return e
    }),
    r("Core/MeshVisualizer", ["Core/Mesh", "Core/RendererUtils", "Core/MeshMaterial", "Core/Shaders/ShaderChunk", "Core/Rotation", "Core/FramebufferTexture", "Core/LOD", "Core/ReferenceMesh", "ThirdParty/tiff-js/tiff", "Util/Path", "Core/GeometryUtils", "Core/MaterialUtils", "Core/MeshUtils", "Core/ShaderUtils"], function(e, a, n, i, t, c, o, s, d, f, r, p, h, u) {
        var m = Cesium.Matrix4
          , v = (Cesium.DrawCommand,
        Cesium.defined)
          , g = Cesium.GeometryPipeline
          , _ = Cesium.BufferUsage
          , l = Cesium.BlendingState
          , x = Cesium.VertexArray
          , C = Cesium.ShaderProgram
          , M = Cesium.DepthFunction
          , y = Cesium.CullFace
          , S = Cesium.RenderState
          , E = Cesium.defaultValue
          , L = Cesium.Texture
          , w = Cesium.PixelFormat
          , P = (Cesium.BoxGeometry,
        Cesium.Cartesian3)
          , T = (Cesium.VertexFormat,
        Cesium.CubeMap,
        Cesium.loadCubeMap,
        Cesium.Matrix3,
        Cesium.Math);
        Cesium.Color,
        new P,
        new Cesium.Quaternion,
        new P,
        new m,
        new m,
        new P;
        function b(e) {
            this._modelMatrix = E(e.modelMatrix, m.IDENTITY),
            this._actualModelMatrix = m.clone(this._modelMatrix),
            this._ready = !0,
            this._modelMatrixNeedsUpdate = !0,
            this._isWireframe = !1,
            this._up = E(e.up, new P(0,0,1)),
            this._position = E(e.position, new P(0,0,0)),
            this._scale = E(e.scale, new P(1,1,1)),
            this._rotation = E(e.rotation, {
                axis: new P(0,0,1),
                angle: 0
            }),
            this._rotation = new t(this._rotation.axis,this._rotation.angle),
            this._rotation.paramChanged.addEventListener(this.onModelMatrixNeedUpdate, this),
            this._chidren = [],
            this._debug = !1,
            this._show = E(e.show, !0),
            this._center = new P,
            Cesium.Matrix4.getTranslation(this._modelMatrix, this._center),
            this._framebufferTextures = {},
            this._uniformValueCache = {},
            this._textureCache = {},
            this._uniformMaps = {},
            this.referenceMesh = new s({
                axisParameter: E(e.referenceAxisParameter, {
                    length: 1e5
                }),
                show: E(e.showReference, !1)
            }),
            this.add(this.referenceMesh),
            this._pickIds = [],
            this.beforeUpdate = new Cesium.Event,
            this._scene = e.scene
        }
        Cesium.Cartesian3.prototype.set = function(e, t, n) {
            this.x = e,
            this.y = t,
            this.z = n
        }
        ,
        Cesium.Cartesian3.prototype.copy = function(e) {
            this.x = e.x,
            this.y = e.y,
            this.z = e.z
        }
        ,
        Cesium.Cartesian2.prototype.set = function(e, t) {
            this.x = e,
            this.y = t
        }
        ,
        Cesium.Cartesian2.prototype.copy = function(e) {
            this.x = e.x,
            this.y = e.y
        }
        ,
        Cesium.Quaternion.prototype.set = function(e, t, n, i) {
            this.x = e,
            this.y = t,
            this.z = n,
            this.w = i
        }
        ,
        Cesium.Quaternion.prototype.copy = function(e) {
            this.x = e.x,
            this.y = e.y,
            this.z = e.z,
            this.w = e.w
        }
        ;
        var D = new Cesium.Matrix4
          , A = new Cesium.Cartesian3
          , R = new Cesium.Cartesian3
          , U = new Cesium.Cartesian3
          , N = new Cesium.Cartesian3
          , I = new Cesium.Ray;
        return (b.prototype = {
            remove: function(e) {
                for (var t = 0; t < this._chidren.length; t++)
                    this._chidren[t] == e && this._chidren.splice(t, 1);
                b.traverse(e, function() {
                    e._drawCommand && e._drawCommand.destroy && e._drawCommand.destroy(),
                    e._actualMesh && e._actualMesh._drawCommand && (Cesium.destroyObject(e._actualMesh._drawCommand),
                    Cesium.destroyObject(e._actualMesh.geometry),
                    Cesium.destroyObject(e._actualMesh),
                    Cesium.destroyObject(e))
                }, !1)
            },
            pickPosition: function(e, t) {
                if (this._scene && (this._scene.pickPosition(e, A),
                A))
                    return this.worldCoordinatesToLocal(A, A),
                    Cesium.Cartesian3.clone(A, t),
                    t
            },
            getPickRay: function(e, t) {
                if (this._scene && (t || (t = Cesium.Ray()),
                this._scene.camera.getPickRay(e, I),
                this._scene.pickPosition(e, A),
                A))
                    return Cesium.Cartesian3.clone(I.direction, R),
                    this.worldCoordinatesToLocal(I.origin, N),
                    this.worldCoordinatesToLocal(A, A),
                    Cesium.Cartesian3.add(N, R, U),
                    Cesium.Cartesian3.subtract(A, U, R),
                    Cesium.Cartesian3.clone(A, t.origin),
                    Cesium.Cartesian3.clone(R, t.direction),
                    t
            },
            worldCoordinatesToLocal: function(e, t) {
                return t || (t = new P),
                Cesium.Matrix4.inverseTransformation(this._actualModelMatrix, D),
                Cesium.Matrix4.multiplyByPoint(D, e, t),
                t
            },
            localToWorldCoordinates: function(e, t) {
                return t || (t = new P),
                Cesium.Matrix4.multiplyByPoint(this._actualModelMatrix, e, t),
                t
            },
            onModelMatrixNeedUpdate: function() {
                this._modelMatrixNeedsUpdate = !0
            },
            setPosition: function(e, t, n) {
                var i = !1;
                1 == arguments.length && ("number" == typeof e ? (e != this._position.x && (i = !0),
                this._position.x = e) : e instanceof Cesium.Cartesian3 && (e == this._position.x && t == this._position.y && n == this._position.z || (i = !0),
                this._position.x = e.x,
                this._position.y = e.y,
                this._position.z = e.z)),
                2 == arguments.length && "number" == typeof t && (t != this._position.y && (i = !0),
                this._position.y = t),
                3 == arguments.length && "number" == typeof n && (n != this._position.z && (i = !0),
                this._position.z = n),
                i && (this._modelMatrixNeedsUpdate = !0)
            },
            setScale: function(e, t, n) {
                var i = !1;
                1 == arguments.length && ("number" == typeof e ? (e != this._scale.x && (i = !0),
                this._scale.x = e) : e instanceof Cesium.Cartesian3 && (e == this._scale.x && t == this._scale.y && n == this._scale.z || (i = !0),
                this._scale.x = e.x,
                this._scale.y = e.y,
                this._scale.z = e.z)),
                2 == arguments.length && "number" == typeof t && (t != this._scale.y && (i = !0),
                this._scale.y = t),
                3 == arguments.length && "number" == typeof n && (n != this._scale.z && (i = !0),
                this._scale.z = n),
                i && (this._modelMatrixNeedsUpdate = !0)
            },
            toWireframe: function(e) {
                return e.primitiveType !== Cesium.PrimitiveType.TRIANGLES && e.primitiveType !== Cesium.PrimitiveType.TRIANGLE_FAN && e.primitiveType !== Cesium.PrimitiveType.TRIANGLE_STRIP ? e : (e.triangleIndices || (e.triangleIndices = e.indices),
                e = g.toWireframe(e))
            },
            restoreFromWireframe: function(e) {
                return e.triangleIndices && (e.indices = e.triangleIndices),
                e.primitiveType = Cesium.PrimitiveType.TRIANGLES,
                e
            },
            createDrawCommand: function(e, t) {
                var n = t.context
                  , i = e.geometry
                  , r = e.material
                  , a = new Cesium.DrawCommand({
                    modelMatrix: m.clone(this.modelMatrix),
                    owner: e,
                    primitiveType: i.primitiveType,
                    cull: r.cullFrustum,
                    pass: r.translucent ? Cesium.Pass.TRANSLUCENT : Cesium.Pass.OPAQUE
                })
                  , o = g.createAttributeLocations(i);
                a.vertexArray = x.fromGeometry({
                    context: n,
                    geometry: i,
                    attributeLocations: o,
                    bufferUsage: _.STATIC_DRAW
                }),
                a.vertexArray._attributeLocations = o;
                var s = {
                    primitive: this,
                    id: e
                }
                  , l = n.createPickId(s);
                this._pickIds.push(l);
                var c = l.color
                  , d = {
                    fragmentShader: this.getFragmentShaderSource(r),
                    vertexShader: this.getVertexShaderSource(i, r)
                };
                return r.material3js && (d = u.processShader3js(r.material3js, d)),
                a._sp = C.fromCache({
                    context: n,
                    fragmentShaderSource: d.fragmentShader,
                    vertexShaderSource: d.vertexShader,
                    attributeLocations: o
                }),
                Cesium.defined(e.material.allowPick) || (e.material.allowPick = !0),
                e.material.allowPick && (a._pickSp = C.fromCache({
                    context: n,
                    fragmentShaderSource: "void main() {\n\tgl_FragColor = vec4(" + c.red + "," + c.green + "," + c.blue + "," + c.alpha + ");\n}",
                    vertexShaderSource: d.vertexShader,
                    attributeLocations: o
                })),
                a.shaderProgram = a._sp,
                a.renderState = this.getRenderState(r),
                a.uniformMap = this.getUniformMap(r, t),
                a
            },
            getRenderState: function(e) {
                var t = {
                    blending: e.blending ? l.ALPHA_BLEND : l.DISABLED,
                    depthTest: {
                        enabled: e.depthTest,
                        func: M.LESS
                    },
                    cull: {
                        enabled: !0,
                        face: y.FRONT
                    },
                    depthRange: {
                        near: 0,
                        far: 1
                    },
                    colorMask: {
                        red: !0,
                        green: !0,
                        blue: !0,
                        alpha: !0
                    },
                    depthMask: e.depthMask
                };
                switch (t.cull.enabled = !0,
                t.blending.color = {
                    red: 0,
                    green: 0,
                    blue: 0,
                    alpha: 0
                },
                e.side) {
                case n.Sides.FRONT:
                    t.cull.face = y.BACK;
                    break;
                case n.Sides.BACK:
                    t.cull.face = y.FRONT;
                    break;
                default:
                    t.cull.enabled = !1
                }
                return t = S.fromCache(t)
            },
            getUniformMap: function(e, o) {
                if (this._uniformMaps[e.uuid] && !e.needsUpdate)
                    return this._uniformMaps[e.uuid];
                var a = {};
                this._uniformMaps[e.uuid] = a,
                e.needsUpdate = !1,
                a.cameraPosition = function() {
                    return o.camera.position
                }
                ,
                a.u_cameraPosition = function() {
                    return o.camera.position
                }
                ,
                a.u_normalMatrix = function() {
                    return o.context.uniformState.normal
                }
                ,
                a.u_projectionMatrix = function() {
                    return o.context.uniformState.projection
                }
                ,
                a.u_modelViewMatrix = function() {
                    return o.context.uniformState.modelView
                }
                ,
                a.normalMatrix = function() {
                    return o.context.uniformState.normal
                }
                ,
                a.projectionMatrix = function() {
                    return o.context.uniformState.projection
                }
                ,
                a.modelViewMatrix = function() {
                    return o.context.uniformState.modelView
                }
                ,
                a.modelMatrix = function() {
                    return o.context.uniformState.model
                }
                ,
                a.u_modelMatrix = function() {
                    return o.context.uniformState.model
                }
                ,
                a.u_viewMatrix = function() {
                    return o.context.uniformState.view
                }
                ,
                a.viewMatrix = function() {
                    return o.context.uniformState.view
                }
                ,
                a.logDepthBufFC = function() {
                    return 2 / (Math.log(o.camera.frustum.far + 1) / Math.LN2)
                }
                ,
                e.uniformStateUsed && e.uniformStateUsed.length && e.uniformStateUsed.forEach(function(e) {
                    if (!a[e.glslVarName]) {
                        if (!o.context.uniformState[e.uniformStateName])
                            throw new Error(e.uniformStateName + "不是Cesium引擎的内置对象");
                        a[e.glslVarName] = function() {
                            return o.context.uniformState[e.uniformStateName]
                        }
                    }
                });
                var s = this;
                var u = Cesium.WebGLConstants;
                function l(e, t) {
                    var n;
                    if (v(e.internalFormat))
                        n = new L({
                            context: o.context,
                            pixelFormat: e.internalFormat,
                            width: e.width,
                            height: e.height,
                            source: {
                                arrayBufferView: e.bufferView
                            },
                            flipY: t.flipY
                        });
                    else {
                        var i = Cesium.WebGLConstants.RGB;
                        (e instanceof HTMLCanvasElement || e instanceof HTMLVideoElement || e.src && 0 <= e.src.toLocaleLowerCase().indexOf(".png")) && (i = Cesium.WebGLConstants.RGBA),
                        n = t.sampler ? function(e, t) {
                            var n, i = Cesium.TextureMinificationFilter, r = Cesium.TextureWrap, a = e.sampler, o = a.minificationFilter === i.NEAREST_MIPMAP_NEAREST || a.minificationFilter === i.NEAREST_MIPMAP_LINEAR || a.minificationFilter === i.LINEAR_MIPMAP_NEAREST || a.minificationFilter === i.LINEAR_MIPMAP_LINEAR, s = o || a.wrapS === r.REPEAT || a.wrapS === r.MIRRORED_REPEAT || a.wrapT === r.REPEAT || a.wrapT === r.MIRRORED_REPEAT, l = e.source, c = !T.isPowerOfTwo(l.width) || !T.isPowerOfTwo(l.height);
                            if (s && c) {
                                var d = document.createElement("canvas");
                                d.width = T.nextPowerOfTwo(l.width),
                                d.height = T.nextPowerOfTwo(l.height),
                                d.getContext("2d").drawImage(l, 0, 0, l.width, l.height, 0, 0, d.width, d.height),
                                l = d
                            }
                            return e.target === u.TEXTURE_2D && (n = new L({
                                context: t,
                                source: l,
                                width: e.width,
                                height: e.height,
                                pixelFormat: e.internalFormat,
                                pixelDatatype: e.type,
                                sampler: a,
                                flipY: e.flipY
                            })),
                            o && n.generateMipmap(),
                            n
                        }({
                            context: o.context,
                            source: e,
                            target: u.TEXTURE_2D,
                            width: t.width,
                            height: t.height,
                            pixelFormat: i,
                            flipY: t.flipY,
                            sampler: new Cesium.Sampler(t.sampler)
                        }, o.context) : new L({
                            context: o.context,
                            source: e,
                            target: u.TEXTURE_2D,
                            width: t.width,
                            height: t.height,
                            pixelFormat: i,
                            flipY: !Cesium.defined(t.flipY) || t.flipY
                        })
                    }
                    return n
                }
                if (e.uniforms) {
                    function t(e, t) {
                        if (null != t) {
                            var n = "string" == typeof t.value
                              , i = "string" == typeof t.value;
                            if ("string" == typeof t.value) {
                                var r = t.value.toLocaleLowerCase();
                                if (r.endsWith(".png") || r.endsWith(".jpg") || r.endsWith(".bmp") || r.endsWith(".gif") || r.endsWith(".tif") || r.endsWith(".tiff") || r.startsWith("data:"))
                                    i = !(n = !0);
                                else
                                    try {
                                        Cesium.Color.fromCssColorString(t.value),
                                        i = !(n = !0)
                                    } catch (e) {
                                        i = n = !1
                                    }
                            }
                            t.value instanceof Cesium.Cartesian2 || t.value instanceof Cesium.Cartesian3 || t.value instanceof Cesium.Cartesian4 || t.value instanceof Cesium.Color || t.value instanceof Cesium.Matrix4 || t.value instanceof Cesium.Matrix3 || t.value instanceof Cesium.Matrix2 || t.value instanceof Cesium.Texture || "number" == typeof t.value || i || t.value instanceof Cesium.Texture || t.value instanceof Array && ("number" == typeof t.value[0] || t.value[0]instanceof Cesium.Cartesian2 || t.value[0]instanceof Cesium.Cartesian3 || t.value[0]instanceof Cesium.Cartesian4) ? (s._uniformValueCache || (s._uniformValueCache = {}),
                            s._uniformValueCache[t.uuid] = t,
                            i && (t.value = Cesium.Color.fromCssColorString(t.value)),
                            a[e] = function() {
                                return s._uniformValueCache[t.uuid].value
                            }
                            ) : t.value instanceof Array && 6 == t.value.length ? a[e] = function(i, r, e) {
                                var a = function() {
                                    if ((!s._textureCache[r.uuid] || r.needsUpdate) && !a.allLoaded && !a.isLoading) {
                                        for (var e = [], t = 0; t < r.value.length; t++)
                                            if (r.value[t]instanceof HTMLCanvasElement || r.value[t]instanceof HTMLVideoElement || r.value[t]instanceof HTMLImageElement) {
                                                var n = Cesium.when.defer();
                                                requestAnimationFrame(function() {
                                                    n.resolve(r.value[t])
                                                }),
                                                e.push(n)
                                            } else {
                                                if ("string" != typeof r.value[t])
                                                    throw Error(i + "" + t + "给定值“ " + r[t] + "” 不是有效的纹理图片");
                                                e.push(Cesium.loadImage(r.value[t]))
                                            }
                                        a.isLoading = !0,
                                        r.needsUpdate = !1,
                                        Cesium.when.all(e, function(e) {
                                            s._textureCache[r.uuid] = new Cesium.CubeMap({
                                                context: o.context,
                                                source: {
                                                    positiveX: e[0],
                                                    negativeX: e[1],
                                                    positiveY: e[2],
                                                    negativeY: e[3],
                                                    positiveZ: e[4],
                                                    negativeZ: e[5]
                                                }
                                            }),
                                            a.allLoaded = !0,
                                            a.isLoading = !1
                                        })
                                    }
                                    return a.allLoaded ? s._textureCache[r.uuid] : (s.defaultCubeMap || (s.defaultTextureImage || (s.defaultTextureImage = document.createElement("canvas"),
                                    s.defaultTextureImage.width = 1,
                                    s.defaultTextureImage.height = 1),
                                    s.defaultCubeMap = new Cesium.CubeMap({
                                        context: o.context,
                                        source: {
                                            positiveX: s.defaultTextureImage,
                                            negativeX: s.defaultTextureImage,
                                            positiveY: s.defaultTextureImage,
                                            negativeY: s.defaultTextureImage,
                                            positiveZ: s.defaultTextureImage,
                                            negativeZ: s.defaultTextureImage
                                        }
                                    })),
                                    s.defaultCubeMap)
                                };
                                return a.allLoaded && (a.allLoaded = !1,
                                a.isLoading = !1),
                                a
                            }(e, t) : n || t.value instanceof HTMLImageElement || t.value instanceof HTMLCanvasElement || t.value instanceof HTMLVideoElement ? a[e] = function(n) {
                                var i = function() {
                                    if (s._textureCache[n.value] && !n.needsUpdate)
                                        return s._textureCache[n.value];
                                    if (n.value instanceof HTMLImageElement || n.value instanceof HTMLCanvasElement || n.value instanceof HTMLVideoElement) {
                                        var e = n.value;
                                        return s._textureCache[n.value] = l(e, n),
                                        n.needsUpdate = !1,
                                        s._textureCache[n.value]
                                    }
                                    if ("string" == typeof n.value && !i.isLoading) {
                                        i.isLoading = !0,
                                        n.needsUpdate = !1;
                                        var t = n.value.toLocaleLowerCase();
                                        "tif" == f.GetExtension(t).slice(1) ? Cesium.Resource.fetchArrayBuffer({
                                            url: t
                                        }).then(function(e) {
                                            var t = (new d).parseTIFF(e);
                                            s._textureCache[n.value] && s._textureCache[n.value].destroy && s._textureCache[n.value].destroy(),
                                            s._textureCache[n.value] = l(t, n),
                                            i.isLoading = !1
                                        }).otherwise(function(e) {
                                            console.log(e)
                                        }) : Cesium.Resource.fetchImage({
                                            url: n.value
                                        }).then(function(e) {
                                            s._textureCache[n.value] && s._textureCache[n.value].destroy && s._textureCache[n.value].destroy(),
                                            s._textureCache[n.value] = l(e, n),
                                            i.isLoading = !1
                                        }).otherwise(function(e) {
                                            console.log(e)
                                        })
                                    }
                                    return s.defaultTextureImage || (s.defaultTextureImage = document.createElement("canvas"),
                                    s.defaultTextureImage.width = 1,
                                    s.defaultTextureImage.height = 1),
                                    s.defaultTexture || (s.defaultTexture = new L({
                                        context: o.context,
                                        source: s.defaultTextureImage
                                    })),
                                    s.defaultTexture
                                };
                                return i
                            }(t) : t.value instanceof c && (s._renderToTextureCommands || (s._renderToTextureCommands = []),
                            s._framebufferTextures[t.uuid] || (s._framebufferTextures[t.uuid] = t),
                            a[e] = function() {
                                return s._framebufferTextures[t.uuid] && s._framebufferTextures[t.uuid].value.texture ? s._framebufferTextures[t.uuid].value.texture : o.context.defaultTexture
                            }
                            )
                        }
                    }
                    var n = e.uniforms;
                    for (var i in n)
                        if (n.hasOwnProperty(i) && Cesium.defined(n[i].value) && null != n[i].value) {
                            if (Cesium.isArray(n[i].value) && 0 == n[i].value.length)
                                continue;
                            var r = n[i];
                            if (null == r || null == r)
                                continue;
                            t(i, r)
                        }
                }
                return this._uniformMaps[e.uuid]
            },
            getVertexShaderSource: function(o, t) {
                var n = "\n        uniform mat4 modelViewMatrix;\n        uniform mat4 viewMatrix;\n        uniform mat4 modelMatrix;\n        uniform mat4 projectionMatrix;\n        uniform mat3 normalMatrix;\n        uniform mat4 u_modelViewMatrix;\n        uniform mat4 u_viewMatrix;\n        uniform mat4 u_modelMatrix;\n        uniform mat4 u_projectionMatrix;\n        uniform mat3 u_normalMatrix;\n        uniform vec3 cameraPosition;\n        uniform vec3 u_cameraPosition;\n";
                if (t.vertexShader) {
                    n = "",
                    ["uniform mat4 modelViewMatrix", "uniform mat4 modelMatrix", "uniform mat4 projectionMatrix", "uniform mat3 normalMatrix", "uniform mat4 u_modelViewMatrix", "uniform mat4 u_modelMatrix", "uniform mat4 u_projectionMatrix", "uniform mat3 u_normalMatrix", "uniform mat4 u_viewMatrix", "uniform mat4 viewMatrix", "uniform vec3 cameraPosition", "uniform vec3 u_cameraPosition"].forEach(function(e) {
                        t.vertexShader.indexOf(e) < 0 && (n += e + ";\n")
                    });
                    var e = function(e) {
                        var t = ""
                          , n = o.attributes;
                        for (var i in n)
                            if (n.hasOwnProperty(i)) {
                                var r = n[i];
                                if (r) {
                                    var a = null;
                                    switch (r.componentsPerAttribute) {
                                    case 1:
                                        a = "float";
                                        break;
                                    case 2:
                                        a = "vec2";
                                        break;
                                    case 3:
                                        a = "vec3";
                                        break;
                                    case 4:
                                        a = "vec4"
                                    }
                                    if (a) {
                                        if (0 <= e.indexOf("attribute " + a + " " + i))
                                            continue;
                                        t += "attribute " + a + " " + i + ";\n"
                                    }
                                }
                            }
                        return t
                    }(t.vertexShader) + n + t.vertexShader;
                    return e = i.parseIncludes(e)
                }
                throw new Error("material.vertexShader 是必须参数")
            },
            getFragmentShaderSource: function(e) {
                if (e.fragmentShader)
                    return i.parseIncludes(e.fragmentShader);
                throw new Error("material.fragmentShader 是必须参数")
            }
        })._computeModelMatrix = function(e, t) {
            e._actualMesh && (e = e._actualMesh);
            var n = this;
            if (e instanceof o || e instanceof s || "function" == typeof e.update)
                e.parent ? e.parent == n ? e.update(n._actualModelMatrix, t) : e.parent.modelMatrix ? e.update(e.parent.modelMatrix, t) : e.update(n._actualModelMatrix, t) : e.update(n._actualModelMatrix, t);
            else {
                e.position;
                if (e.parent instanceof o)
                    m.clone(e.parent.modelMatrix, e.modelMatrix);
                else if (e._modelMatrixNeedsUpdate) {
                    var i = e.quaternion ? e.quaternion : e.rotation;
                    if (e.parent && e.parent.modelMatrix) {
                        var r = e.parent.modelMatrix ? e.parent.modelMatrix : e._drawCommand.modelMatrix;
                        a.computeModelMatrix(r, e.position, i, e.scale, e.modelMatrix)
                    } else
                        a.computeModelMatrix(n._actualModelMatrix, e.position, i, e.scale, e.modelMatrix);
                    e._modelMatrixNeedsUpdate = !1
                }
            }
        }
        ,
        b.prototype.update = function(o) {
            if (this._scene || (this._scene = o.camera._scene),
            !(!this._ready || !this.show && 0 < this._chidren.length)) {
                this.beforeUpdate.raiseEvent(o);
                var s = this
                  , l = !1
                  , c = o.camera._scene._globe._surface.tileProvider._debug.wireframe;
                for (var e in this.debug && (c = !0),
                c != this._isWireframe && (l = !0),
                this._modelMatrixNeedsUpdate && (this._actualModelMatrix = a.computeModelMatrix(this._modelMatrix, this._position, this._rotation, this._scale, this._actualModelMatrix),
                this._up && this._up.y && (this._actualModelMatrix = a.yUp2Zup(this._actualModelMatrix, this._actualModelMatrix)),
                Cesium.Cartesian3.clone(this._scale, this._oldScale),
                Cesium.Cartesian3.clone(this._position, this._oldPosition),
                this._modelMatrixNeedsUpdate = !1),
                b.traverse(this, function(e) {
                    if (h.isMesh3js(e)) {
                        var t = !e._actualMesh || e.needsUpdate || e.geometry.needsUpdate;
                        if (t && (e._actualMesh = h.fromMesh3js(e),
                        e.modelMatrixNeedsUpdate = !0),
                        !t) {
                            for (var n in e.geometry.attributes)
                                e.geometry.attributes.hasOwnProperty(n) && (e._actualMesh.geometry.attributes[n].needsUpdate = e.geometry.attributes[n].needsUpdate);
                            var i = e.geometry.index;
                            i && i.needsUpdate && (e._actualMesh.geometry.needsUpdate = !0)
                        }
                        e._actualMesh.quaternion = Cesium.Quaternion.clone(e.quaternion),
                        e._actualMesh.position = e.position,
                        e._actualMesh.scale = e.scale,
                        e._actualMesh.modelMatrixNeedsUpdate = e.modelMatrixNeedsUpdate,
                        e = e._actualMesh,
                        p.updateMaterialFrom3js(e.material)
                    }
                    if (s._computeModelMatrix(e, o),
                    "function" != typeof e.update) {
                        if (o.passes.pick && !e.material.allowPick)
                            return;
                        if (!e._drawCommand || e.needsUpdate || e.geometry.needsUpdate || l)
                            c || e.material.wireframe ? s.toWireframe(e.geometry) : s.restoreFromWireframe(e.geometry),
                            e._drawCommand = s.createDrawCommand(e, o),
                            e.needsUpdate = !1,
                            e.geometry.needsUpdate = !1;
                        else {
                            for (var r in e.geometry.attributes)
                                if (e.geometry.attributes.hasOwnProperty(r) && e.geometry.attributes[r] && e.geometry.attributes[r].needsUpdate) {
                                    var a = e._drawCommand.vertexArray._attributeLocations[r];
                                    e._drawCommand.vertexArray._attributes[a].vertexBuffer.copyFromArrayView(e.geometry.attributes[r].values, 0)
                                }
                            if (e.geometry.indexNeedsUpdate)
                                e._drawCommand.vertexArray.indexBuffer.copyFromArrayView(e.geometry.indices, 0)
                        }
                        e._drawCommand.modelMatrix = e.modelMatrix,
                        e._drawCommand.boundingVolume || (e.geometry.boundingSphere || (e.geometry.boundingSphere = Cesium.BoundingSphere.fromVertices(e.geometry.attributes.position.values)),
                        e._drawCommand.boundingVolume = Cesium.BoundingSphere.clone(e.geometry.boundingSphere)),
                        Cesium.Matrix4.getTranslation(e.modelMatrix, e._drawCommand.boundingVolume.center),
                        e._drawCommand.uniformMap = s.getUniformMap(e.material, o),
                        o.passes.pick ? e._drawCommand.shaderProgram = e._drawCommand._pickSp : (e._drawCommand.renderState.depthTest.enabled = e.material.depthTest,
                        e._drawCommand.shaderProgram = e._drawCommand._sp),
                        o.commandList.push(e._drawCommand)
                    } else
                        e.needsUpdate = !1
                }, !0),
                s._framebufferTextures)
                    if (s._framebufferTextures.hasOwnProperty(e)) {
                        var t = s._framebufferTextures[e].value;
                        s.updateFrameBufferTexture(o, t)
                    }
                this._isWireframe = c,
                l = !1,
                this._modelMatrixNeedsUpdate = !1,
                this._geometryChanged = !1
            }
        }
        ,
        b.prototype.updateFrameBufferTexture = function(d, e, u) {
            var f = this
              , m = e;
            m instanceof c && (m.drawCommands = [],
            b.traverse(m.mesh, function(e) {
                if (h.isMesh3js(e)) {
                    var t = !e._actualMesh || e.needsUpdate || e.geometry.needsUpdate;
                    if (t && (e._actualMesh = h.fromMesh3js(e)),
                    !t) {
                        for (var n in e.geometry.attributes)
                            e.geometry.attributes.hasOwnProperty(n) && (e._actualMesh.geometry[n].needsUpdate = e.geometry.attributes[n].needsUpdate);
                        var i = e.geometry.getIndex();
                        i && i.needsUpdate && (e._actualMesh.geometry.needsUpdate = !0)
                    }
                    e._actualMesh.quaternion = Cesium.Quaternion.clone(e.quaternion),
                    e._actualMesh.position = e.position,
                    e._actualMesh.scale = e.scale,
                    e._actualMesh.modelMatrixNeedsUpdate = e.modelMatrixNeedsUpdate,
                    e = e._actualMesh,
                    p.updateMaterialFrom3js(e.material)
                }
                if (f._computeModelMatrix(e, d),
                !e._textureCommand || e.needsUpdate || e.geometry.needsUpdate)
                    e.material.wireframe ? f.toWireframe(e.geometry) : f.restoreFromWireframe(e.geometry),
                    e._textureCommand = f.createDrawCommand(e, d),
                    e.needsUpdate = !1,
                    e.material.needsUpdate = !1;
                else {
                    for (var r in e.geometry.attributes)
                        if (e.geometry.attributes.hasOwnProperty(r) && e.geometry.attributes[r] && e.geometry.attributes[r] && e.geometry.attributes[r].needsUpdate) {
                            var a = e._textureCommand.vertexArray._attributeLocations[r];
                            e._textureCommand.vertexArray._attributes[a].vertexBuffer.copyFromArrayView(e.geometry.attributes[r].values, 0)
                        }
                    if (e.geometry.indexNeedsUpdate)
                        e._textureCommand.vertexArray.indexBuffer.copyFromArrayView(e.geometry.indices, 0)
                }
                e._textureCommand.modelMatrix = e.modelMatrix;
                var o = d.context
                  , s = o.drawingBufferWidth
                  , l = o.drawingBufferHeight;
                if (!m.texture || m.texture.width != s || m.texture.height != l) {
                    var c = m._notFullScreen || Cesium.defined(m.texture);
                    c || (m.texture = new L({
                        context: o,
                        width: s,
                        height: l,
                        pixelFormat: w.RGBA
                    })),
                    m._notFullScreen = c
                }
                e._textureCommand.renderState.depthTest.enabled = e.depthTest,
                u && (e._textureCommand.renderState.viewport = u),
                m.drawCommands.push(e._textureCommand)
            }, !0),
            a.renderToTexture(m.drawCommands, d, m.texture))
        }
        ,
        b.prototype.add = function(e) {
            this._chidren.push(e)
        }
        ,
        b.prototype.destroy = function() {
            for (var e in this._ready = !1,
            b.traverse(this, function(e) {
                e._drawCommand && delete e._drawCommand
            }, !1),
            this._uniformValueCache)
                this._uniformValueCache.hasOwnProperty(e) && delete this._uniformValueCache[e];
            for (var e in this._textureCache)
                this._textureCache.hasOwnProperty(e) && delete this._textureCache[e];
            for (var e in this._uniformMaps)
                this._uniformMaps.hasOwnProperty(e) && delete this._uniformMaps[e];
            for (var e in this._framebufferTextures)
                this._framebufferTextures.hasOwnProperty(e) && delete this._framebufferTextures[e];
            if (this._uniformValueCache = {},
            this._textureCache = {},
            this._uniformMaps = {},
            this._framebufferTextures = {},
            this._pickIds)
                for (e = 0; e < this._pickIds.length; ++e)
                    this._pickIds[e].destroy && this._pickIds[e].destroy()
        }
        ,
        b.traverse = function(e, t, n, i) {
            if (e && (i || (i = {
                cancelCurrent: !1,
                cancelAll: !1
            }),
            i.cancelCurrent = !1,
            (!n || e.show || e.visible) && ((e.geometry && e.material || e instanceof o || e instanceof s) && t(e, i),
            e.children)))
                for (var r = 0; r < e.children.length; r++)
                    if (!i.cancelCurrent) {
                        if (i.cancelAll)
                            break;
                        b.traverse(e.children[r], t, n, i)
                    }
        }
        ,
        Cesium.defineProperties(b.prototype, {
            scene: {
                set: function(e) {
                    this._scene = e
                },
                get: function() {
                    return this._scene
                }
            },
            frameState: {
                get: function() {
                    if (this._scene)
                        return this._scene.frameState
                }
            },
            modelMatrixNeedsUpdate: {
                get: function() {
                    return this._modelMatrixNeedsUpdate
                },
                set: function(t) {
                    (this._modelMatrixNeedsUpdate = t) && b.traverse(this, function(e) {
                        e._modelMatrixNeedsUpdate = t
                    }, !1)
                }
            },
            showReference: {
                get: function() {
                    return this.referenceMesh.show
                },
                set: function(e) {
                    this.referenceMesh.show = e
                }
            },
            children: {
                get: function() {
                    return this._chidren
                },
                set: function(e) {
                    this._chidren = e
                }
            },
            show: {
                get: function() {
                    return this._show
                },
                set: function(e) {
                    this._show = e
                }
            },
            debug: {
                get: function() {
                    return this._debug
                },
                set: function(e) {
                    this._debug = e
                }
            },
            ready: {
                get: function() {
                    return this._ready
                }
            },
            modelMatrix: {
                get: function() {
                    return this._modelMatrix
                },
                set: function(e) {
                    this._modelMatrix = e,
                    this._modelMatrixNeedsUpdate = !0
                }
            },
            rotation: {
                get: function() {
                    return this._rotation
                },
                set: function(e) {
                    e != this._rotation && (this._rotation = e,
                    this._needUpdate = !0),
                    this._rotation.paramChanged.removeEventListener(this._onNeedUpdateChanged),
                    this._rotation = e,
                    this._rotation.paramChanged.addEventListener(this._onNeedUpdateChanged)
                }
            },
            position: {
                get: function() {
                    return this._position
                },
                set: function(e) {
                    e.x == this._position.x && e.y == this._position.y && e.z == this._position.z || (this._position = e,
                    this._modelMatrixNeedsUpdate = !0),
                    this._position = e
                }
            },
            scale: {
                get: function() {
                    return this._scale
                },
                set: function(e) {
                    e.x == this._scale.x && e.y == this._scale.y && e.z == this._scale.z || (this._scale = e,
                    this._modelMatrixNeedsUpdate = !0),
                    this._scale = e
                }
            }
        }),
        b
    }),
    r("Core/BasicMeshMaterial", ["Core/MeshMaterial", "Core/Shaders/ShaderChunk", "Core/Shaders/ShaderLib", "Util/Path"], function(l, c, e, d) {
        var u = Cesium.WebGLConstants;
        function t(e) {
            (e = e || {}).uniforms = e.uniforms ? e.uniforms : {
                ambientColor: [0, 0, 0, 1],
                emissionColor: [0, 0, 0, 1],
                diffuseColor: [0, 0, 0, 1],
                specularColor: [0, 0, 0, 1],
                specularShininess: 0,
                alpha: void 0,
                ambientColorMap: void 0,
                emissionColorMap: void 0,
                diffuseColorMap: void 0,
                specularColorMap: void 0,
                specularShininessMap: void 0,
                normalMap: void 0,
                alphaMap: void 0
            },
            e.uniforms.ambientColor = Cesium.defaultValue(e.uniforms.ambientColor, [0, 0, 0, 1]),
            e.uniforms.emissionColor = Cesium.defaultValue(e.uniforms.emissionColor, [0, 0, 0, 1]),
            e.uniforms.diffuseColor = Cesium.defaultValue(e.uniforms.diffuseColor, [0, 0, 0, 1]),
            e.uniforms.specularColor = Cesium.defaultValue(e.uniforms.specularColor, [0, 0, 0, 1]),
            e.uniforms.alpha = Cesium.defaultValue(e.uniforms.alpha, 1),
            e.uniforms.specularShininess = Cesium.defaultValue(e.uniforms.specularShininess, 0),
            e.side = Cesium.defaultValue(e.side, l.Sides.FRONT),
            l.apply(this, [e]),
            this.blendEnable = !1;
            var t = e.withTexture
              , n = e.withNormals;
            if (this.depthTest = !0,
            this.depthMask = !0,
            this.blending = !0,
            e.uniforms.diffuseColorMap) {
                if ("string" == typeof e.uniforms.diffuseColorMap) {
                    var i = e.uniforms.diffuseColorMap.toLowerCase()
                      , r = d.GetExtension(i);
                    ".tif" == r || ".png" == r ? this.translucent = !0 : "data:image/png" === i.slice(0, "data:image/png".length) ? this.translucent = !0 : "data:image/tif" === i.slice(0, "data:image/tif".length) && (this.translucent = !0)
                } else
                    (i instanceof HTMLCanvasElement || i instanceof HTMLVideoElement) && (this.translucent = !0);
                if (t = !0,
                Cesium.defined(this.uniforms.diffuseColorMap.flipY) || (this.uniforms.diffuseColorMap.flipY = !1),
                !this.uniforms.diffuseColorMap.sampler) {
                    var a = {};
                    a.magnificationFilter = u.LINEAR,
                    a.minificationFilter = u.NEAREST_MIPMAP_LINEAR,
                    a.wrapS = u.REPEAT,
                    a.wrapT = u.REPEAT,
                    this.uniforms.diffuseColorMap.sampler = a
                }
            } else
                t = !1;
            var o = null
              , s = null;
            s = t && n ? (o = c.texture_normals_vert,
            c.texture_normals_frag) : t && !n ? (o = c.texture_vert,
            c.texture_frag) : !t && n ? (o = c.normals_vert,
            c.normals_frag) : (o = c.none_vert,
            c.none_frag),
            this.vertexShader = o,
            this.fragmentShader = s
        }
        return t.prototype = new l,
        t
    }),
    r("Core/BasicGeometry", [], function() {
        function e(e) {
            this.positions = e.positions,
            this.normals = e.normals,
            this.uvs = e.uvs,
            this.indices = e.indices
        }
        return e.createGeometry = function(e) {
            if (!e.positions)
                throw new Error("缺少positions参数");
            if (!e.indices)
                throw new Error("缺少indices参数");
            var t = e.positions
              , n = e.normals
              , i = e.uvs
              , r = e.indices instanceof Int32Array ? e.indices : new Int32Array(e.indices)
              , a = {
                position: new Cesium.GeometryAttribute({
                    componentDatatype: Cesium.ComponentDatatype.DOUBLE,
                    componentsPerAttribute: 3,
                    values: t instanceof Float32Array ? t : new Float32Array(e.positions)
                })
            };
            n && (a.normal = new Cesium.GeometryAttribute({
                componentDatatype: Cesium.ComponentDatatype.FLOAT,
                componentsPerAttribute: 3,
                values: n instanceof Float32Array ? n : new Float32Array(n)
            })),
            i && (a.uv = new Cesium.GeometryAttribute({
                componentDatatype: Cesium.ComponentDatatype.FLOAT,
                componentsPerAttribute: 2,
                values: i instanceof Float32Array ? i : new Float32Array(i)
            }));
            var o = Cesium.BoundingSphere.fromVertices(t);
            return new Cesium.Geometry({
                attributes: a,
                indices: new Int32Array(r),
                primitiveType: Cesium.PrimitiveType.TRIANGLES,
                boundingSphere: o
            })
        }
        ,
        e
    }),
    r("Core/PlaneBufferGeometry", ["Core/BasicGeometry"], function(L) {
        function e(e, t, n, i) {
            this.width = e,
            this.height = t,
            this.widthSegments = n,
            this.heightSegments = i
        }
        return e.createGeometry = function(e) {
            var t, n, i = e.width, r = e.height, a = e.widthSegments, o = e.heightSegments, s = (i = i || 1) / 2, l = (r = r || 1) / 2, c = Math.floor(a) || 1, d = Math.floor(o) || 1, u = c + 1, f = d + 1, m = i / c, p = r / d, h = [], v = [], g = [], _ = [];
            for (n = 0; n < f; n++) {
                var x = n * p - l;
                for (t = 0; t < u; t++) {
                    var C = t * m - s;
                    v.push(C, -x, 0),
                    g.push(0, 0, 1),
                    _.push(t / c),
                    _.push(1 - n / d)
                }
            }
            for (n = 0; n < d; n++)
                for (t = 0; t < c; t++) {
                    var M = t + u * n
                      , y = t + u * (n + 1)
                      , S = t + 1 + u * (n + 1)
                      , E = t + 1 + u * n;
                    h.push(M, y, E),
                    h.push(y, S, E)
                }
            return L.createGeometry({
                positions: new Float32Array(v),
                normals: new Float32Array(g),
                uvs: new Float32Array(_),
                indices: new Int32Array(h)
            })
        }
        ,
        e
    }),
    r("Main", ["Core/RendererUtils", "Core/Mesh", "Core/MeshMaterial", "Core/Shaders/ShaderChunk", "Core/MeshVisualizer", "Core/FramebufferTexture", "Core/GeometryUtils", "Core/LOD", "Core/PlaneGeometry", "Core/Rotation", "Core/ReferenceMesh", "Core/BasicMeshMaterial", "Core/BasicGeometry", "Core/Shaders/ShaderLib", "Core/PlaneBufferGeometry", "Util/CSG", "Core/MeshPhongMaterial", "Core/MaterialUtils", "Core/ShaderUtils"], function(e, t, n, i, r, a, o, s, l, c, d, u, f, m, p, h, v, g, _) {
        return "undefined" == typeof Cesium && (Cesium = {}),
        Cesium.RendererUtils = e,
        Cesium.Mesh = t,
        Cesium.MeshMaterial = n,
        Cesium.ShaderChunk = i,
        Cesium.ShaderLib = m,
        Cesium.MeshVisualizer = r,
        Cesium.FramebufferTexture = a,
        Cesium.GeometryUtils = o,
        Cesium.LOD = s,
        Cesium.PlaneGeometry = l,
        Cesium.Rotation = c,
        Cesium.ReferenceMesh = d,
        Cesium.BasicMeshMaterial = u,
        Cesium.BasicGeometry = f,
        Cesium.PlaneBufferGeometry = p,
        Cesium.CSG = h,
        Cesium.MeshPhongMaterial = v,
        Cesium.MaterialUtils = g,
        Cesium.ShaderUtils = _,
        Cesium
    }),
    t(["Main"], function(e) {
        "use strict";
        var t = "undefined" != typeof window ? window : "undefined" != typeof self ? self : {};
        t.Cesium = e,
        t.onLoad && t.onLoad(e)
    }, void 0, !0)
}(),
"function" == typeof define ? define(function() {
    var e = Cesium;
    return Cesium = void 0,
    e
}) : "undefined" == typeof module ? window.Cesium = Cesium : module.exports = Cesium;
