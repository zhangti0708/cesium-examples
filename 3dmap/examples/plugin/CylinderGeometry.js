(function () {
    "use strict"; 
    function n(t) {
        this.length = t.length,
            this.topRadius = t.topRadius,
            this.bottomRadius = t.bottomRadius,
            this.slices = t.slices ? t.slices : 64,
            this.zReverse = t.zReverse
    }
    Object.defineProperty(Cesium, "__esModule", {
        value: !0
    }),
        Cesium.CylinderGeometry = void 0;
    var s = new Cesium.Cartesian2,
        u = new Cesium.Cartesian3,
        l = new Cesium.Ray;
    n._createGeometry = function (t) {
        var e = t.length,
            i = t.topRadius,
            n = t.bottomRadius,
            r = t.slices,
            a = 2 * Math.PI / (r - 1),
            u = t.zReverse, l = [], h = [], d = [], m = [], f = [n, i], p = [0, u ? -e : e], c = 0, _ = Math.atan2(n - i, e), g = s;
        g.z = Math.sin(_);
        for (var v = Math.cos(_), y = 0; y < p.length; y++) {
            m[y] = [];
            for (var C = f[y], w = 0; w < r; w++) {
                m[y].push(c++);
                var x = a * w,
                    A = C * Math.cos(x),
                    b = C * Math.sin(x);
                l.push(A, b, p[y]),
                    A = v * Math.cos(x),
                    b = v * Math.sin(x),
                    h.push(A, b, g.z),
                    d.push(y / (p.length - 1), 0)
            }
        }
        for (var M = [], y = 1; y < p.length; y++)
            for (var w = 1; w < r; w++) {
                var P = m[y - 1][w - 1], S = m[y][w - 1],
                    F = m[y][w], E = m[y - 1][w]; M.push(F),
                        M.push(E), M.push(P), M.push(F), M.push(P),
                        M.push(S), w == m[y].length - 1 && (P = m[y - 1][w],
                            S = m[y][w], F = m[y][0], E = m[y - 1][0], M.push(F),
                            M.push(E), M.push(P), M.push(F), M.push(P), M.push(S))
            }
        M = new Int16Array(M), l = new Float32Array(l),
            h = new Float32Array(h), d = new Float32Array(d);
        var T = {
            position: new Cesium.GeometryAttribute({
                componentDatatype: Cesium.ComponentDatatype.DOUBLE,
                componentsPerAttribute: 3,
                values: l
            }),
            normal: new Cesium.GeometryAttribute({
                componentDatatype: Cesium.ComponentDatatype.FLOAT,
                componentsPerAttribute: 3,
                values: h
            }),
            st: new Cesium.GeometryAttribute({
                componentDatatype: Cesium.ComponentDatatype.FLOAT,
                componentsPerAttribute: 2, values: d
            })
        },
            R = Cesium.BoundingSphere.fromVertices(l),
            G = new Cesium.Geometry({
                attributes: T, indices: M,
                primitiveType: Cesium.PrimitiveType.TRIANGLES,
                boundingSphere: R
            });
        return l = [], M = [], d = [], G
    },
        n.createGeometry = function (t, e) {
            if (!e) 
            return n._createGeometry(t);
            Cesium.Matrix4.multiplyByPoint(e, Cesium.Cartesian3.ZERO, u), u.clone(l.origin);
            var i = t.length,
                r = t.topRadius,
                s = (t.bottomRadius, t.slices),
                h = 2 * Math.PI / (s - 1),
                d = t.zReverse,
                m = [],
                f = [],
                p = [],
                c = [],
                _ = [0, d ? -i : i],
                g = 0,
                g = 0;
            m.push(0, 0, 0), f.push(1, 1), g++;
            for (var v = new Cesium.Cartesian3, y = r / 15, C = 0; C < 16; C++) {
                for (var w = y * C, x = [], A = 0; A < s; A++) {
                    var b = h * A,
                        M = w * Math.cos(b),
                        P = w * Math.sin(b);
                    v.x = M,
                        v.y = P, v.z = _[1];
                    var S = (0, Cesium.extend2Earth)(v, e, l); S ? (x.push(g), m.push(M, P, _[1]), f.push(C / 15, 1), g++) : (S = u, x.push(-1))
                } c.push(x)
            }
            for (var F, E, T = [0, c.length - 1], R = 0; R < T.length; R++)
                for (var C = T[R], A = 1; A < c[C].length; A++)F = c[C][A - 1], E = c[C][A], F >= 0 && E >= 0 && p.push(0, F, E);
            m = new Float32Array(m), p = new Int32Array(p), f = new Float32Array(f);
            var G = {
                position: new Cesium.GeometryAttribute({
                    componentDatatype: Cesium.ComponentDatatype.DOUBLE,
                    componentsPerAttribute: 3,
                    values: m
                }),
                st: new Cesium.GeometryAttribute({
                    componentDatatype: Cesium.ComponentDatatype.FLOAT,
                    componentsPerAttribute: 2,
                    values: f
                })
            },
                V = Cesium.BoundingSphere.fromVertices(m),
                D = new Cesium.Geometry({
                    attributes: G,
                    indices: p,
                    primitiveType: Cesium.PrimitiveType.TRIANGLES, boundingSphere: V
                });
            return (0, Cesium.computeVertexNormals)(D), m = [], p = [], D
        },
        n.createOutlineGeometry = function (t) {
            var e = t.length,
                i = t.topRadius,
                n = t.bottomRadius,
                r = t.slices,
                a = 2 * Math.PI / (r - 1),
                u = t.zReverse, l = [],
                h = [], d = [], m = [], f = [n, i], p = [0, u ? -e : e],
                c = 0, _ = Math.atan2(n - i, e), g = s; g.z = Math.sin(_);
            for (var v = Math.cos(_), y = 0; y < p.length; y++) {
                m[y] = [];
                for (var C = f[y], w = 0; w < r; w++) {
                    m[y].push(c++);
                    var x = a * w,
                        A = C * Math.cos(x),
                        b = C * Math.sin(x);
                    l.push(A, b, p[y]),
                        A = v * Math.cos(x),
                        b = v * Math.sin(x),
                        h.push(A, b, g.z),
                        d.push(y / (p.length - 1), 0)
                }
            }
            for (var M = [], y = 1; y < p.length; y++)
                for (var w = 1; w < r; w += 1) {
                    var P = m[y - 1][w - 1],
                        S = m[y][w - 1]; m[y][w],
                            m[y - 1][w];
                    w % 8 == 1 && M.push(P, S)
                }
            M = new Int16Array(M), l = new Float32Array(l),
                h = new Float32Array(h), d = new Float32Array(d);
            var F = {
                position: new Cesium.GeometryAttribute({
                    componentDatatype: Cesium.ComponentDatatype.DOUBLE,
                    componentsPerAttribute: 3,
                    values: l
                }),
                normal: new Cesium.GeometryAttribute({
                    componentDatatype: Cesium.ComponentDatatype.FLOAT,
                    componentsPerAttribute: 3,
                    values: h
                }),
                st: new Cesium.GeometryAttribute({
                    componentDatatype: Cesium.ComponentDatatype.FLOAT,
                    componentsPerAttribute: 2,
                    values: d
                })
            },
                E = Cesium.BoundingSphere.fromVertices(l),
                T = new Cesium.Geometry({
                    attributes: F,
                    indices: M,
                    primitiveType: Cesium.PrimitiveType.LINES,
                    boundingSphere: E
                });
            return l = [], M = [], d = [], T
        },
        n.fromAngleAndLength = function (t, e, i) {
            return t = Cesium.Math.toRadians(t),
                new n({
                    topRadius: Math.tan(t) * e / 2,
                    bottomRadius: 0,
                    length: e,
                    zReverse: i
                })
        },
        Cesium.CylinderGeometry = n
})()