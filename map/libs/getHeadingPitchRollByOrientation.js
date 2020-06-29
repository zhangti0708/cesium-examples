(function (){
    function a(e,t){
        return n(e,Cesium.Matrix4.fromRotationTranslation(Cesium.Matrix3.fromQuaternion(t,h),e,f))
    }
    function n(e,t){
        var i=Cesium.Transforms.eastNorthUpToFixedFrame(e,Cesium.Ellipsoid.WGS84,new Cesium.Matrix4),
        a=Cesium.Matrix4.multiply(Cesium.Matrix4.inverse(i,new Cesium.Matrix4),t,new Cesium.Matrix4),
        n=Cesium.Matrix4.getRotation(a,new Cesium.Matrix3),
        r=Cesium.Quaternion.fromRotationMatrix(n);
        return Cesium.HeadingPitchRoll.fromQuaternion(r)
    }
    Cesium.Matrix4.getHeadingPitchRollByOrientation=a;
})()
