(function () {
    function c(e, t) {
        if (Cesium.defined(e.id)) {
            var i = e.id;
            if (i._noMousePosition)
                return !1;
            if (t && i == t)
                return !1
        }
        if (Cesium.defined(e.primitive)) {
            var a = e.primitive;
            if (a._noMousePosition)
                return !1;
            if (t && a == t)
                return !1
        }
        return !0
    }
    function h(e, t, i) {
        var a, n = e.pick(t);
        if (e.pickPositionSupported && Cesium.defined(n) && c(n, i)) {
            var a = e.pickPosition(t);
            if (Cesium.defined(a)) {
                var r = Cesium.Cartographic.fromCartesian(a),
                    o = r.height;
                if (o >= 0)
                    return a;
                if (!Cesium.defined(n.id) && o >= -500)
                    return a
            }
        }
        if (e.mode === Cesium.SceneMode.SCENE3D) {
            var s = e.camera.getPickRay(t);
            a = e.globe.pick(s, e)
        }
        else a = e.camera.pickEllipsoid(t, e.globe.ellipsoid);
        return a
    }
    Cesium.getCurrentMousePosition = h;
})()