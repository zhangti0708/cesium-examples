(function () {
    "use strict";
    function n(t) {
        var e = t.indices, i = t.attributes, n = e.length;
        if (i.position) {
            var o = i.position.values;
            if (void 0 === i.normal)
                i.normal = new Cesium.GeometryAttribute({
                    componentDatatype: Cesium.ComponentDatatype.FLOAT,
                    componentsPerAttribute: 3,
                    values: new Float32Array(o.length)
                });
            else
                for (var a = i.normal.values, s = 0; s < n; s++)
                    a[s] = 0;
            for (var u, l, h, d = i.normal.values, m = new Cesium.Cartesian3, f = new Cesium.Cartesian3, p = new Cesium.Cartesian3, c = new Cesium.Cartesian3, _ = new Cesium.Cartesian3, s = 0; s < n; s += 3)
                u = 3 * e[s + 0],
                    l = 3 * e[s + 1],
                    h = 3 * e[s + 2],
                    Cesium.Cartesian3.fromArray(o, u, m),
                    Cesium.Cartesian3.fromArray(o, l, f),
                    Cesium.Cartesian3.fromArray(o, h, p),
                    Cesium.Cartesian3.subtract(p, f, c),
                    Cesium.Cartesian3.subtract(m, f, _),
                    Cesium.Cartesian3.cross(c, _, c),
                    d[u] += c.x,
                    d[u + 1] += c.y,
                    d[u + 2] += c.z,
                    d[l] += c.x,
                    d[l + 1] += c.y,
                    d[l + 2] += c.z,
                    d[h] += c.x, d[h + 1] += c.y,
                    d[h + 2] += c.z;
            r(t),
                i.normal.needsUpdate = !0
        } return t
    }
    function r(t) {
        for (var e, i, n, r, o = t.attributes.normal.values, a = 0; a < o.length; a += 3)
            e = o[a], i = o[a + 1], n = o[a + 2], r = 1 / Math.sqrt(e * e + i * i + n * n), o[a] = e * r, o[a + 1] = i * r, o[a + 2] = n * r
    }
    function o(t, e, i, n) {
        n = n || Cesium.Ellipsoid.WGS84, Cesium.Matrix4.multiplyByPoint(e, t, a),
            Cesium.Cartesian3.subtract(a, i.origin, i.direction),
            Cesium.Cartesian3.normalize(i.direction, i.direction);
        var r = Cesium.IntersectionTests.rayEllipsoid(i, n), o = null;
        if (r && (o = Cesium.Ray.getPoint(i, r.start)), o)
            try {
                Cesium.Cartographic.fromCartesian(o, null, s)
            }
            catch (t) {
                return null
            }
        return o
    }
    Object.defineProperty(Cesium, "__esModule", {
        value: !0
    });
    var a = new Cesium.Cartesian3, s = (new Cesium.Ray, new Cesium.Cartographic);
    Cesium.computeVertexNormals = n, Cesium.extend2Earth = o
})()