//获取3DTiles高度
var ThreeDTilesToolCopy = (
    function () {
        function _() {

        }

        //传入lonlat数组 角度制的lon lat
        _.LonlatPointsTerrainData = function (scene, lonlats, callback) {
            var pointArrInput = [];
            for (var i = 0; i < lonlats.length; i++) {
                pointArrInput.push(Cesium.Cartographic.fromDegrees(lonlats[i].lon, lonlats[i].lat));
            }
            var promise = scene.clampToHeightMostDetailed(pointArrInput);//pointArrInput
            promise.then(function (updatedPositions) {
                callback(updatedPositions);
            });
        };

        //传入Cartographic类型数组 弧度制经纬度
        _.CartographicPointsTerrainData = function (scene, Cartographics, callback) {
            if (Cartographics.length && Cartographics.length > 0) { } else { return; }
            var pointArrInput = [];
            for (var i = 0; i < Cartographics.length; i++) {
                pointArrInput.push(Cesium.Cartesian3.fromRadians(Cartographics[i].longitude, Cartographics[i].latitude, Cartographics[i].height));
            }
            var promise = scene.clampToHeightMostDetailed(pointArrInput);//pointArrInput
            promise.then(function (updatedPositions) {
                var result=[];
                var ellipsoid=viewer.scene.globe.ellipsoid;
                for(var j=0;j<updatedPositions.length;j++){
                    result.push(ellipsoid.cartesianToCartographic(updatedPositions[j]));
                }
                callback(result);
            }).otherwise(function(error){
                console.log(error)
            });
        };
        return _;
    }
)();