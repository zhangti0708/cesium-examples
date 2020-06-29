(function () {
    "use strict";
    function n(t) {
        this._bottomWidth = t.bottomWidth,
            this._bottomHeight = t.bottomHeight,
            this._topWidth = t.topWidth,
            this._topHeight = t.topHeight,
            this._length = t.length,
            this._zReverse = t.zReverse,
            this._slices = t.slices ? t.slices : 8
    }
    Object.defineProperty(Cesium, "__esModule", {
        value: !0
    }),
    Cesium.FourPrismGeometry = void 0;
    var s = new Cesium.Cartesian3,
        u = new Cesium.Ray;
    n._createGeometry = function (t) {
        for (var e = t._bottomWidth,
            i = t._bottomHeight,
            n = t._topWidth,
            r = t._topHeight,
            a = t._zReverse,
            s = (a ? -1 : 1) * t._length,
            u = new Float32Array(24),
            l = [],
            h = [],
            d = [0, s],
            m = [e, n],
            f = [i, r],
            p = 0,
            c = 0;
            c < 2; c++)
            u[3 * p] = -m[c] / 2,
                u[3 * p + 1] = -f[c] / 2,
                u[3 * p + 2] = d[c],
                h[2 * p] = c,
                h[2 * p + 1] = 0,
                p++ , u[3 * p] = -m[c] / 2,
                u[3 * p + 1] = f[c] / 2,
                u[3 * p + 2] = d[c],
                h[2 * p] = c,
                h[2 * p + 1] = 0,
                p++ ,
                u[3 * p] = m[c] / 2,
                u[3 * p + 1] = f[c] / 2,
                u[3 * p + 2] = d[c],
                h[2 * p] = c,
                h[2 * p + 1] = 0,
                p++ ,
                u[3 * p] = m[c] / 2,
                u[3 * p + 1] = -f[c] / 2,
                u[3 * p + 2] = d[c],
                h[2 * p] = c,
                h[2 * p + 1] = 0,
                p++;
        l.push(0, 1, 3),
            l.push(1, 2, 3),
            l.push(0, 4, 5),
            l.push(0, 5, 1),
            l.push(1, 2, 6),
            l.push(1, 6, 5),
            l.push(2, 3, 7),
            l.push(7, 6, 2),
            l.push(0, 3, 7),
            l.push(7, 4, 0),
            l.push(4, 5, 6),
            l.push(6, 7, 4),
            l = new Int16Array(l),
            h = new Float32Array(h);
        var _ = {
            position: new Cesium.GeometryAttribute({
                componentDatatype: Cesium.ComponentDatatype.DOUBLE,
                componentsPerAttribute: 3,
                values: u
            }),
            st: new Cesium.GeometryAttribute({
                componentDatatype: Cesium.ComponentDatatype.FLOAT,
                componentsPerAttribute: 2, values: h
            })
        },
            g = Cesium.BoundingSphere.fromVertices(u),
            v = new Cesium.Geometry({
                attributes: _,
                indices: l,
                primitiveType: Cesium.PrimitiveType.TRIANGLES,
                boundingSphere: g
            });
        return v = Cesium.GeometryPipeline.computeNormal(v),
            u = [],
            l = [],
            v
    },
        n.createGeometry = function (t, e) {
            if (!e)
                return n._createGeometry(cylinderGeometry);
            Cesium.Matrix4.multiplyByPoint(e, Cesium.Cartesian3.ZERO, s),
                s.clone(u.origin);
            var i = t._slices,
                r = (t._bottomWidth, t._bottomHeight, t._topWidth),
                l = t._topHeight,
                h = t._zReverse,
                d = (h ? -1 : 1) * t._length,
                m = [],
                f = [],
                p = [],
                c = r / 2,
                _ = l / 2,
                g = i,
                v = i,
                y = 0;
            m.push(0, 0, 0),
                p.push(1, 1),
                y++;
            for (var C = new Cesium.Cartesian3, w = [], x = -v; x < v; x++) {
                for (var A = [], b = -g; b < g; b++) {
                    var M = _ * x / v, P = c * b / g; C.x = P, C.y = M, C.z = d;
                    var S = (0, Cesium.extend2Earth)(C, e, u);
                    S ? (m.push(P, M, d), p.push(1, 1), A.push(y), y++) : (A.push(-1), S = s)
                } w.push(A)
            }
            for (var F, E, T = [0, w.length - 1], R = 0; R < T.length; R++)
                for (var x = T[R], b = 1; b < w[x].length; b++)
                    F = w[x][b - 1], E = w[x][b], F >= 0 && E >= 0 && f.push(0, F, E);
            for (var G = [0, w[0].length - 1], V = 0; V < G.length; V++)
                for (var b = G[V], x = 1; x < w.length; x++)
                    F = w[x - 1][b], E = w[x][b], F >= 0 && E >= 0 && f.push(0, F, E);
            m = new Float32Array(m), f = new Int32Array(f), p = new Float32Array(p);
            var D = {
                position: new Cesium.GeometryAttribute({
                    componentDatatype: Cesium.ComponentDatatype.DOUBLE,
                    componentsPerAttribute: 3,
                    values: m
                }),
                st: new Cesium.GeometryAttribute({
                    componentDatatype: Cesium.ComponentDatatype.FLOAT,
                    componentsPerAttribute: 2,
                    values: p
                })
            },
                L = Cesium.BoundingSphere.fromVertices(m),
                O = new Cesium.Geometry({
                    attributes: D,
                    indices: f,
                    primitiveType: Cesium.PrimitiveType.TRIANGLES,
                    boundingSphere: L
                });
            return (0, Cesium.computeVertexNormals)(O), m = [], f = [], O
        },
        n.createOutlineGeometry = function (t) {
            for (var e = t._bottomWidth,
                i = t._bottomHeight,
                n = t._topWidth,
                r = t._topHeight,
                a = t._zReverse,
                s = (a ? -1 : 1) * t._length,
                u = new Float32Array(24),
                l = [], h = [], d = [0, s], m = [e, n], f = [i, r], p = 0, c = 0; c < 2; c++)
                u[3 * p] = -m[c] / 2, u[3 * p + 1] = -f[c] / 2, u[3 * p + 2] = d[c], h[2 * p] = c, h[2 * p + 1] = 0, p++ ,
                    u[3 * p] = -m[c] / 2, u[3 * p + 1] = f[c] / 2, u[3 * p + 2] = d[c], h[2 * p] = c, h[2 * p + 1] = 0, p++ ,
                    u[3 * p] = m[c] / 2, u[3 * p + 1] = f[c] / 2, u[3 * p + 2] = d[c], h[2 * p] = c, h[2 * p + 1] = 0, p++ ,
                    u[3 * p] = m[c] / 2, u[3 * p + 1] = -f[c] / 2, u[3 * p + 2] = d[c], h[2 * p] = c, h[2 * p + 1] = 0, p++;
            l.push(0, 1, 1, 2), l.push(2, 3, 3, 0), l.push(0, 4), l.push(1, 5), l.push(2, 6), l.push(3, 7), l.push(4, 5, 5, 6),
                l.push(6, 7, 7, 4), l = new Int16Array(l), h = new Float32Array(h);
            var _ = {
                position: new Cesium.GeometryAttribute({
                    componentDatatype: Cesium.ComponentDatatype.DOUBLE,
                    componentsPerAttribute: 3,
                    values: u
                }),
                st: new Cesium.GeometryAttribute({
                    componentDatatype: Cesium.ComponentDatatype.FLOAT,
                    componentsPerAttribute: 2,
                    values: h
                })
            },
                g = Cesium.BoundingSphere.fromVertices(u),
                v = new Cesium.Geometry({
                    attributes: _, indices: l,
                    primitiveType: Cesium.PrimitiveType.LINES,
                    boundingSphere: g
                });
            return u = [], l = [], v
        },
        n.createOutlineGeometry2 = function (t) {
            var e = (t._bottomWidth, t._bottomHeight, t._topWidth),
                i = t._topHeight,
                n = t._zReverse,
                r = (n ? -1 : 1) * t._length,
                s = [], u = [], l = [], h = e / 2,
                d = i / 2, m = 0; s.push(0, 0, 0), l.push(1, 1), m++;
            for (var f = [], p = -16; p < 16; p++) {
                for (var c = [], _ = -16; _ < 16; _++) {
                    c.push(m); var g = d * p / 16, v = h * _ / 16; s.push(v, g, r), l.push(1, 1), m++
                } f.push(c)
            }
            for (var y, C, w = [0, f.length - 1], x = 0; x < w.length; x++)
                for (var p = w[x], _ = 1; _ < f[p].length; _++)
                    y = f[p][_ - 1], C = f[p][_], u.push(0, y, C);
            for (var A = [0, f[0].length - 1], b = 0; b < A.length; b++)
                for (var _ = A[b], p = 1; p < f.length; p++)
                    y = f[p - 1][_], C = f[p][_], u.push(0, y, C);
            s = new Float32Array(s), u = new Int16Array(u),
                l = new Float32Array(l);
            var M = {
                position: new Cesium.GeometryAttribute({
                    componentDatatype: Cesium.ComponentDatatype.DOUBLE,
                    componentsPerAttribute: 3,
                    values: s
                }),
                st: new Cesium.GeometryAttribute({
                    componentDatatype: Cesium.ComponentDatatype.FLOAT,
                    componentsPerAttribute: 2,
                    values: l
                })
            },
                P = Cesium.BoundingSphere.fromVertices(s),
                S = new Cesium.Geometry({
                    attributes: M,
                    indices: u,
                    primitiveType: Cesium.PrimitiveType.TRIANGLES,
                    boundingSphere: P
                });
            return (0, a.computeVertexNormals)(S),
                Cesium.GeometryPipeline.toWireframe(S), s = [], u = [], S
        },
        n.fromAnglesLength = function (t, e, i, r) {
            var a = {
                length: i,
                zReverse: r,
                bottomHeight: i,
                bottomWidth: i,
                topHeight: i,
                topWidth: i
            };
            return t = Cesium.Math.toRadians(t),
                e = Cesium.Math.toRadians(e),
                r ? (a.bottomHeight = 0, a.bottomWidth = 0,
                    a.topHeight = i * Math.tan(t),
                    a.topWidth = i * Math.tan(e)) : (a.topHeight = 0, a.topWidth = 0,
                        a.bottomHeight = i * Math.tan(t),
                        a.bottomWidth = i * Math.tan(e)), new n(a)
        },
        Cesium.FourPrismGeometry = n
})()