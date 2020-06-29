/*
 * @Descripttion: 
 * @version: 1.0
 * @Author: zhangti
 * @Date: 2019-10-25 16:56:12
 * @LastEditors  : sueRimn
 * @LastEditTime : 2020-01-02 16:28:54
 */
/**
 * cesium 初始化
 * 全局变量
 * 补充代码
 */
/***
 * -------------------
 *       Init
 * 插件导航: ctrl + f [xxx.js]
 * cesiumBuild
 * 雷达 sensor.js
 * 经纬网 TileLonlatsImageryProvider.js
 * 在线地形图 ArcGisElevation3DTerrainProvider.js
 * 标绘 algorithm.js plotUtil.js
 * -------------------
 */

/**
 * cesiumBuild
 * 封装接口
 * PolygonArea.js
 * EllipseGeometryLibraryEx.js
 * SysMathTool.js
 * ThreeDTilesToolCopy.js
 * PrimitivePoints.js
 * ShadowPrimitive.js
 * DebugCameraPrimitive.js
 * DrawCommand.js
 */
var CesiumBuild = (function(){

function _(){};
/**
 * 几何面积计算
 * @param {*} coords 
 */
_.PolygonArea = function(coords){
        var areas = 0;
        var ringArea = function(coords){
            var p1, p2, p3, lowerIndex, middleIndex, upperIndex,
            area = 0,
            coordsLength = coords.length;
            if (coordsLength > 2) {
                for (var i = 0; i < coordsLength; i++) {
                    if (i === coordsLength - 2) {// i = N-2
                        lowerIndex = coordsLength - 2;
                        middleIndex = coordsLength -1;
                        upperIndex = 0;
                    } else if (i === coordsLength - 1) {// i = N-1
                        lowerIndex = coordsLength - 1;
                        middleIndex = 0;
                        upperIndex = 1;
                    } else { // i = 0 to N-3
                        lowerIndex = i;
                        middleIndex = i+1;
                        upperIndex = i+2;
                    }
                    p1 = coords[lowerIndex];
                    p2 = coords[middleIndex];
                    p3 = coords[upperIndex];
                    area += ( p3.longitude - p1.longitude ) * Math.sin( p2.latitude );
                }
                area = area * 6378137.0 * 6378137.0 / 2;
            }
            return area>=0?area:-area;
        }
        if (coords && coords.length > 0) {
            areas = ringArea(coords);
        }
        return areas; 
    }
/**
 * EllipseGeometryLibraryEx
 */
_.EllipseGeometryLibraryEx = (function () {
        var EllipseGeometryLibrary = {};

        function pointOnEllipsoid(theta, rotation, northVec, eastVec, aSqr, ab, bSqr, mag, unitPos, result) {
            var rotAxis = new Cesium.Cartesian3();
            var tempVec = new Cesium.Cartesian3();
            var unitQuat = new Cesium.Quaternion();
            var rotMtx = new Cesium.Matrix3();

            var azimuth = theta + rotation;

            Cesium.Cartesian3.multiplyByScalar(eastVec, Math.cos(azimuth), rotAxis);
            Cesium.Cartesian3.multiplyByScalar(northVec, Math.sin(azimuth), tempVec);
            Cesium.Cartesian3.add(rotAxis, tempVec, rotAxis);

            var cosThetaSquared = Math.cos(theta);
            cosThetaSquared = cosThetaSquared * cosThetaSquared;

            var sinThetaSquared = Math.sin(theta);
            sinThetaSquared = sinThetaSquared * sinThetaSquared;

            var radius = ab / Math.sqrt(bSqr * cosThetaSquared + aSqr * sinThetaSquared);
            var angle = radius / mag;

            // Create the quaternion to rotate the position vector to the boundary of the ellipse.
            Cesium.Quaternion.fromAxisAngle(rotAxis, angle, unitQuat);
            Cesium.Matrix3.fromQuaternion(unitQuat, rotMtx);

            Cesium.Matrix3.multiplyByVector(rotMtx, unitPos, result);
            Cesium.Cartesian3.normalize(result, result);
            Cesium.Cartesian3.multiplyByScalar(result, mag, result);
            return result;
        }

        /**
         * Returns the positions raised to the given heights
         * @private
         */
        EllipseGeometryLibrary.raisePositionsToHeight = function (positions, options, extrude) {
            var scratchCartesian1 = new Cesium.Cartesian3();
            var scratchCartesian2 = new Cesium.Cartesian3();
            var scratchCartesian3 = new Cesium.Cartesian3();
            var scratchNormal = new Cesium.Cartesian3();

            var ellipsoid = options.ellipsoid;
            var height = options.height;
            var extrudedHeight = options.extrudedHeight;
            var size = (extrude) ? positions.length / 3 * 2 : positions.length / 3;

            var finalPositions = new Float64Array(size * 3);

            var length = positions.length;
            var bottomOffset = (extrude) ? length : 0;
            for (var i = 0; i < length; i += 3) {
                var i1 = i + 1;
                var i2 = i + 2;

                var position = Cesium.Cartesian3.fromArray(positions, i, scratchCartesian1);
                ellipsoid.scaleToGeodeticSurface(position, position);

                var extrudedPosition = Cesium.Cartesian3.clone(position, scratchCartesian2);
                var normal = ellipsoid.geodeticSurfaceNormal(position, scratchNormal);
                var scaledNormal = Cesium.Cartesian3.multiplyByScalar(normal, height, scratchCartesian3);
                Cesium.Cartesian3.add(position, scaledNormal, position);

                if (extrude) {
                    Cesium.Cartesian3.multiplyByScalar(normal, extrudedHeight, scaledNormal);
                    Cesium.Cartesian3.add(extrudedPosition, scaledNormal, extrudedPosition);

                    finalPositions[i + bottomOffset] = extrudedPosition.x;
                    finalPositions[i1 + bottomOffset] = extrudedPosition.y;
                    finalPositions[i2 + bottomOffset] = extrudedPosition.z;
                }

                finalPositions[i] = position.x;
                finalPositions[i1] = position.y;
                finalPositions[i2] = position.z;
            }

            return finalPositions;
        };

        /**
        * options.semiMinorAxis：短半轴
        * options.semiMajorAxis：长半轴
        * options.rotation：旋转角度 弧度
        * options.center：中心点 笛卡尔坐标
        * options.granularity：粒度 弧度
        * Returns an array of positions that make up the ellipse.
        * @private
        */
        EllipseGeometryLibrary.computeEllipseEdgePositions = function (options) {
            var unitPosScratch = new Cesium.Cartesian3();
            var eastVecScratch = new Cesium.Cartesian3();
            var northVecScratch = new Cesium.Cartesian3();
            var scratchCartesian1 = new Cesium.Cartesian3();

            var semiMinorAxis = options.semiMinorAxis;
            var semiMajorAxis = options.semiMajorAxis;
            var rotation = options.rotation;//法线
            var center = options.center;
            var granularity = options.granularity && (typeof options.granularity === "number") ? options.granularity : (Math.PI / 180.0);// 角度间隔
            if (granularity > Math.PI / 12.0) { granularity = Math.PI / 12.0; }//最小分24
            if (granularity < Math.PI / 180.0) { granularity = Math.PI / 180.0; }//最大分360
            var aSqr = semiMinorAxis * semiMinorAxis;
            var bSqr = semiMajorAxis * semiMajorAxis;
            var ab = semiMajorAxis * semiMinorAxis;
            var mag = Cesium.Cartesian3.magnitude(center);//
            var unitPos = Cesium.Cartesian3.normalize(center, unitPosScratch);
            var eastVec = Cesium.Cartesian3.cross(Cesium.Cartesian3.UNIT_Z, center, eastVecScratch);
            eastVec = Cesium.Cartesian3.normalize(eastVec, eastVec);
            var northVec = Cesium.Cartesian3.cross(unitPos, eastVec, northVecScratch);
            var numPts = Math.ceil(Cesium.Math.PI*2 / granularity);
            var deltaTheta = granularity;
            var theta = 0;
            
            var position = scratchCartesian1;
            var i;
            var outerIndex = 0;
            var outerPositions = [];
            for (i = 0; i < numPts; i++) {
                theta = i * deltaTheta;
                position = pointOnEllipsoid(theta, rotation, northVec, eastVec, aSqr, ab, bSqr, mag, unitPos, position);
                
                outerPositions[outerIndex++] = position.x;
                outerPositions[outerIndex++] = position.y;
                outerPositions[outerIndex++] = position.z;
            }

            var r = {};
            r.numPts = numPts;
            r.outerPositions = outerPositions;
            return r;
        };

        /**
        * options.semiMinorAxis：短半轴
        * options.semiMajorAxis：长半轴
        * options.rotation：旋转角度 弧度
        * options.center：中心点 笛卡尔坐标
        * options.granularity：粒度 弧度
        * options.angle：角度 弧度
        * Returns an array of positions that make up the ellipse.
        * @private
        */
        EllipseGeometryLibrary.computeSectorEdgePositions = function (options) {
            var unitPosScratch = new Cesium.Cartesian3();
            var eastVecScratch = new Cesium.Cartesian3();
            var northVecScratch = new Cesium.Cartesian3();
            var scratchCartesian1 = new Cesium.Cartesian3();

            var semiMinorAxis = options.semiMinorAxis;
            var semiMajorAxis = options.semiMajorAxis;
            var rotation = options.rotation;
            var angle = options.angle ? options.angle : Math.PI * 2.0;
            var center = options.center;
            var granularity = options.granularity && (typeof options.granularity === "number") ? options.granularity : (Math.PI / 180.0);// 角度间隔
            if (granularity > Math.PI / 12.0) { granularity = Math.PI / 12.0; }//最小分24
            if (granularity < Math.PI / 180.0) { granularity = Math.PI / 180.0; }//最大分360
            var aSqr = semiMinorAxis * semiMinorAxis;
            var bSqr = semiMajorAxis * semiMajorAxis;
            var ab = semiMajorAxis * semiMinorAxis;
            var mag = Cesium.Cartesian3.magnitude(center);//
            var unitPos = Cesium.Cartesian3.normalize(center, unitPosScratch);
            var eastVec = Cesium.Cartesian3.cross(Cesium.Cartesian3.UNIT_Z, center, eastVecScratch);
            eastVec = Cesium.Cartesian3.normalize(eastVec, eastVec);
            var northVec = Cesium.Cartesian3.cross(unitPos, eastVec, northVecScratch);
            var numPts = Math.ceil(angle / granularity);//Math.ceil(Cesium.Math.PI * 2 / granularity);
            var deltaTheta = granularity;
            var theta = 0;

            var position = scratchCartesian1;
            var i;
            var outerIndex = 0;
            var outerPositions = [];
            for (i = 0; i < numPts; i++) {
                theta = i * deltaTheta;
                position = pointOnEllipsoid(theta, rotation, northVec, eastVec, aSqr, ab, bSqr, mag, unitPos, position);

                outerPositions[outerIndex++] = position.x;
                outerPositions[outerIndex++] = position.y;
                outerPositions[outerIndex++] = position.z;
            }

            var r = {};
            r.numPts = numPts;
            r.outerPositions = outerPositions;
            return r;
        };
        return EllipseGeometryLibrary;
    })();
/**
 * SysMathTool
 */
_.SysMathTool = (
        function () {
            var DeltaDegree = 0.00001;//插值间隔 单位度
            var DeltaRadian = 0.00001 * Math.PI / 180.0; //Cesium.Math.RADIANS_PER_DEGREE
    
            function CheckLonDegree(value) {
                if (value > 180 || value < -180) {
                    return false;
                }
                return true;
            }
            function CheckLonRadian(value) {
                if (value > Math.PI || value < -Math.PI) {
                    return false;
                }
                return true;
            }
            function CheckLatDegree(value) {
                if (value > 90 || value < -90) {
                    return false;
                }
                return true;
            }
            function CheckLatRadian(value) {
                if (value > Math.PI / 2.0 || value < -Math.PI / 2.0) {
                    return false;
                }
                return true;
            }
    
            function _() {
            }
            _.GetDeltaDegree = function () {
                return DeltaDegree;
            }
            _.GetDeltaRadian = function () {
                return DeltaRadian;
            }
            /*
            线段插值
            经纬度坐标插值
            start.lon start.lat  单位:度
            return [[lon,lat],...]
            */
            _.InterpolateLineLonlat = function (start, end) {
                if (start && end) { } else { return null; }
                if (start.lon && start.lat && end.lon && end.lat) { } else { return null; }
                if (CheckLonDegree(start.lon) && CheckLonDegree(end.lon) && CheckLatDegree(start.lat) && CheckLatDegree(end.lat)) { } else { return null; }
                var result = [];
                result.push([start.lon, start.lat]);
                var interval = Math.sqrt(Math.pow((end.lon - start.lon), 2) + Math.pow((end.lat - start.lat), 2));
                if (interval <= DeltaDegree) {
                    //小于最小间隔
                    result.push([end.lon, end.lat]);
                    return result;
                } else {
                    var num = interval / DeltaDegree;
                    var stepLon = (end.lon - start.lon) / num;
                    var stepLat = (end.lat - start.lat) / num;
                    for (var i = 0; i < num; i++) {
                        var lon = start.lon + (i + 1) * stepLon;
                        var lat = start.lat + (i + 1) * stepLat;
                        result.push([lon, lat]);
                    }
                }
                return result;
            }
            /*
            线段插值
            经纬度坐标插值
            Cartographic start.longitude start.latitude 单位:弧度
            return [Cartographic,...]
            */
            _.InterpolateLineCartographic = function (start, end, _Delta) {
                if (start && end) { } else { return null; }
                if (start.longitude && start.latitude && end.longitude && end.latitude) { } else { return null; }
                var result = [];
                //开始点
                result.push(new Cesium.Cartographic(start.longitude, start.latitude));
                var interval = Math.sqrt(Math.pow((end.longitude - start.longitude), 2) + Math.pow((end.latitude - start.latitude), 2));
                var delta = _Delta && (typeof _Delta === 'number') ? _Delta : DeltaRadian;
                if (interval <= delta) {
                    //小于最小间隔
                    result.push(new Cesium.Cartographic(end.longitude, end.latitude));
                    return result;
                } else {
                    var num = interval / delta;
                    var stepLon = (end.longitude - start.longitude) / num;
                    var stepLat = (end.latitude - start.latitude) / num;
                    for (var i = 0; i < num; i++) {
                        var lon = start.longitude + (i + 1) * stepLon;
                        var lat = start.latitude + (i + 1) * stepLat;
                        result.push(new Cesium.Cartographic(lon, lat));//与最后一个点有偏差
                    }
                    result.push(new Cesium.Cartographic(end.longitude, end.latitude, end.height));
                }
                return result;
            }
    
            /*
            线段插值
            经纬度高程插值
            Cartographic start.longitude start.latitude 单位:弧度 start.height 高程单位m
            return [Cartographic,...]
            */
            _.InterpolateLineHeightCartographic = function (start, end) {
                if (start && end) { } else { return null; }
                if (start.longitude && start.latitude && end.longitude && end.latitude) { } else { return null; }
                var result = [];
                result.push(new Cesium.Cartographic(start.longitude, start.latitude, start.height));
                var interval = Math.sqrt(Math.pow((end.longitude - start.longitude), 2) + Math.pow((end.latitude - start.latitude), 2));
                if (interval <= DeltaRadian) {
                    //小于最小间隔
                    result.push(new Cesium.Cartographic(end.longitude, end.latitude, end.height));
                    return result;
                } else {
                    var num = interval / DeltaRadian;
                    var stepLon = (end.longitude - start.longitude) / num;
                    var stepLat = (end.latitude - start.latitude) / num;
                    var stepHeight = (end.height - start.height) / num;
                    for (var i = 0; i < num; i++) {
                        var lon = start.longitude + (i + 1) * stepLon;
                        var lat = start.latitude + (i + 1) * stepLat;
                        var hieght = start.height + (i + 1) * stepHeight;
                        result.push(new Cesium.Cartographic(lon, lat, hieght));
                    }
                    result.push(new Cesium.Cartographic(end.longitude, end.latitude, end.height));
                }
                return result;
            }
    
            /*
            线段插值
            经纬度高程插值
            Cartographic start.longitude start.latitude 单位:弧度 start.height 高程单位m
            num:分总段数  传入数组长度-1
            index:获取到第index点的所有插值 0点是开始点
            return [Cartographic,...]
            */
            _.Interpolate2IndexLineHeightCartographic = function (start, end, num, curIndex) {
                if (start && end) { } else { return null; }
                if (start.longitude && start.latitude && end.longitude && end.latitude) { } else { return null; }
                var result = [];
                result.push(new Cesium.Cartographic(start.longitude, start.latitude, start.height));
                var stepLon = (end.longitude - start.longitude) / num;
                var stepLat = (end.latitude - start.latitude) / num;
                var stepHeight = (end.height - start.height) / num;
                for (var i = 0; i < curIndex; i++) {
                    var lon = start.longitude + (i + 1) * stepLon;
                    var lat = start.latitude + (i + 1) * stepLat;
                    var hieght = start.height + (i + 1) * stepHeight;
                    result.push(new Cesium.Cartographic(lon, lat, hieght));
                }
                //result.push(new Cesium.Cartographic(end.longitude, end.latitude, end.height));
                return result;
            }
    
            /*
            线段插值 指定第index值
            经纬度高程插值
            Cartographic start.longitude start.latitude 单位:弧度 start.height 高程单位m
            num:分总段数  传入数组长度-1
            index:获取第index个插值点  0点是开始点
            return Cartographic
            */
            _.InterpolateIndexLineHeightCartographic = function (start, end, num, index) {
                if (start && end) { } else { return null; }
                if (start.longitude && start.latitude && end.longitude && end.latitude) { } else { return null; }
                //var delta = _Delta && (typeof _Delta === 'number') ? _Delta : DeltaRadian;    
                var stepLon = (end.longitude - start.longitude) / num;
                var stepLat = (end.latitude - start.latitude) / num;
                var stepHeight = (end.height - start.height) / num;
                var lon = start.longitude + index * stepLon;
                var lat = start.latitude + index * stepLat;
                var hieght = start.height + index * stepHeight;
                var result = new Cesium.Cartographic(lon, lat, hieght);
                return result;
            }
    
            return _;
        })();
/**
 * threeDTilesToolCopy
 */
//获取3DTiles高度
_.ThreeDTilesToolCopy = (
            function () {
                function _() {}
                //传入lonlat数组 角度制的lon lat
                _.LonlatPointsTerrainData = function (viewer, lonlats, callback) {
                    var pointArrInput = [];
                    for (var i = 0; i < lonlats.length; i++) {
                        pointArrInput.push(Cesium.Cartographic.fromDegrees(lonlats[i].lon, lonlats[i].lat));
                    }
                    var promise = viewer.scene.clampToHeightMostDetailed(pointArrInput);//pointArrInput
                    promise.then(function (updatedPositions) {
                        callback(updatedPositions);
                    });
                };

                //传入Cartographic类型数组 弧度制经纬度
                _.CartographicPointsTerrainData = function (viewer, Cartographics, callback) {
                    if (Cartographics.length && Cartographics.length > 0) { } else { return; }
                    var pointArrInput = [];
                    for (var i = 0; i < Cartographics.length; i++) {
                        pointArrInput.push(Cesium.Cartesian3.fromRadians(Cartographics[i].longitude, Cartographics[i].latitude, Cartographics[i].height));
                    }
                    var promise = viewer.scene.clampToHeightMostDetailed(pointArrInput);//pointArrInput
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
/**
 * PrimitivePoints
 *  */ 
 _.PrimitivePoints = (
        function () {
            var vertexShader;
            var fragmentShader;
            var geometry;
            var appearance;
            var viewer;
            function _(options) {
                viewer = options.viewer;
                vertexShader = VSPolylie();
                fragmentShader = FSPolyline();
                if (options.Cartesians && options.Cartesians.length >= 2) {
                    var postionsTemp = [];
                    var colorsTemp = [];
                    var indicesTesm = [];
                    if (options.Colors && options.Colors.length === options.Cartesians.length * 4) {
                        for (var i = 0; i < options.Cartesians.length; i++) {
                            postionsTemp.push(options.Cartesians[i].x);
                            postionsTemp.push(options.Cartesians[i].y);
                            postionsTemp.push(options.Cartesians[i].z);
                        }
                        colorsTemp = options.Colors;
                    } else {
                        for (var i = 0; i < options.Cartesians.length; i++) {
                            postionsTemp.push(options.Cartesians[i].x);
                            postionsTemp.push(options.Cartesians[i].y);
                            postionsTemp.push(options.Cartesians[i].z);
                            //
                            colorsTemp.push(0.0);
                            colorsTemp.push(0.0);
                            colorsTemp.push(1.0);
                            colorsTemp.push(1.0);
                        }
                    }
                    for (var i = 0; i < options.Cartesians.length; i++) {
                        indicesTesm.push(i);
                    }
                    this.positionArr = new Float64Array(postionsTemp);
                    this.colorArr = new Float32Array(colorsTemp);
                    this.indiceArr = new Uint16Array(indicesTesm);

                } else { // if (options.Cartesians && options.Cartesians.length >= 2) {
                    var p1 = Cesium.Cartesian3.fromDegrees(0, 0, -10);
                    var p2 = Cesium.Cartesian3.fromDegrees(0, 0.001, -10);
                    this.positionArr = new Float64Array([
                        p1.x, p1.y, p1.z,
                        p2.x, p2.y, p2.z
                    ]);
                    //默认蓝色
                    this.colorArr = new Float32Array([
                            0.0, 0.0, 1.0, 1.0,
                            0.0, 0.0, 1.0, 1.0
                    ]);
                    this.indiceArr = new Uint16Array([0, 1]);
                }

                geometry = CreateGeometry(this.positionArr, this.colorArr, this.indiceArr);
                appearance = CreateAppearence(fragmentShader, vertexShader);

                this.primitive = viewer.scene.primitives.add(new Cesium.Primitive({
                    geometryInstances: new Cesium.GeometryInstance({
                        geometry: geometry
                    }),
                    appearance: appearance,
                    asynchronous: false
                }));
            }

            function CreateGeometry(positions, colors, indices) {
                return new Cesium.Geometry({
                    attributes: {
                        position: new Cesium.GeometryAttribute({
                            componentDatatype: Cesium.ComponentDatatype.DOUBLE,
                            componentsPerAttribute: 3,
                            values: positions
                        }),
                        color: new Cesium.GeometryAttribute({
                            componentDatatype: Cesium.ComponentDatatype.FLOAT,
                            componentsPerAttribute: 4,
                            values: colors
                        })
                    },
                    indices: indices,
                    primitiveType: Cesium.PrimitiveType.POINTS,
                    boundingSphere: Cesium.BoundingSphere.fromVertices(positions)
                });
            }

            function CreateAppearence(fs, vs) {
                return new Cesium.Appearance({         
                    renderState: {
                        blending: Cesium.BlendingState.PRE_MULTIPLIED_ALPHA_BLEND, 
                        depthTest: { enabled: true }, 
                        depthMask: true
                    },
                    fragmentShaderSource: fs,
                    vertexShaderSource: vs
                });
            }

            function VSPolylie() {
                return "attribute vec3 position3DHigh;\
                attribute vec3 position3DLow;\
                attribute vec4 color;\
                varying vec4 v_color;\
                attribute float batchId;\
                void main()\
                {\
                    vec4 p = czm_computePosition();\
                    v_color =color;\
                    p = czm_modelViewProjectionRelativeToEye * p;\
                    gl_Position = p;\
                    gl_PointSize=4.0;\
                }\
                ";
            }
            function FSPolyline() {
                return "varying vec4 v_color;\
                void main()\
                {\
                    float d = distance(gl_PointCoord, vec2(0.5,0.5));\
                    if(d < 0.5){\
                        gl_FragColor = v_color;\
                    }else{\
                        discard;\
                    }\
                }\
                ";
            }

            _.prototype.remove = function () {
                if (this.primitive != null) {
                    viewer.scene.primitives.remove(this.primitive);
                    this.primitive = null;
                }
            }
            _.prototype.updateCartesianPosition = function (cartesians) {
                if (this.primitive != null) {
                    viewer.scene.primitives.remove(this.primitive);
                    if (cartesians && cartesians.length < 2) { return; }
                    if (cartesians.length === this.positionArr.length / 3) {
                        var p1 = cartesians[0];
                        var p2 = cartesians[1];
                        this.positionArr = new Float64Array([
                            p1.x, p1.y, p1.z,
                            p2.x, p2.y, p2.z
                        ]);
                        geometry = CreateGeometry(this.positionArr, this.colorArr, this.indiceArr);
                    } else {
                        //默认蓝色
                        var postionsTemp = [];
                        var colorsTemp = [];
                        var indicesTesm = [];
                        for (var i = 0; i < cartesians.length; i++) {
                            postionsTemp.push(cartesians[i].x);
                            postionsTemp.push(cartesians[i].y);
                            postionsTemp.push(cartesians[i].z);

                            colorsTemp.push(0.0);
                            colorsTemp.push(0.0);
                            colorsTemp.push(1.0);
                            colorsTemp.push(1.0);
                        }
                        for (var i = 0; i < cartesians.length; i++) {
                            indicesTesm.push(i);
                        }
                        this.positionArr = new Float64Array(postionsTemp);
                        this.colorArr = new Float32Array(colorsTemp);
                        this.indiceArr = new Uint16Array(indicesTesm);

                        geometry = CreateGeometry(this.positionArr, this.colorArr, this.indiceArr);
                        appearance = CreateAppearence(fragmentShader, vertexShader);
                    }

                    this.primitive = viewer.scene.primitives.add(new Cesium.Primitive({
                        geometryInstances: new Cesium.GeometryInstance({
                            geometry: geometry
                        }),
                        appearance: appearance,
                        asynchronous: false
                    }));
                } else { return; }
            }
            _.prototype.updateCartesianPositionColor = function (cartesians, colors) {
                if (colors.length === cartesians.length * 4) { } else { return; }
                if (this.primitive != null) {
                    viewer.scene.primitives.remove(this.primitive);
                    if (cartesians && cartesians.length < 2) { return; }
                    if (cartesians.length === this.positionArr.length / 3) {
                        var p1 = cartesians[0];
                        var p2 = cartesians[1];
                        this.positionArr = new Float64Array([
                            p1.x, p1.y, p1.z,
                            p2.x, p2.y, p2.z
                        ]);

                        this.colorArr = new Float32Array(colors);

                        geometry = CreateGeometry(this.positionArr, this.colorArr, this.indiceArr);
                    } else {
                        var postionsTemp = [];
                        var indicesTesm = [];

                        for (var i = 0; i < cartesians.length; i++) {
                            postionsTemp.push(cartesians[i].x);
                            postionsTemp.push(cartesians[i].y);
                            postionsTemp.push(cartesians[i].z);
                        }
                        for (var i = 0; i < cartesians.length; i++) {
                            indicesTesm.push(i);
                        }
                        this.positionArr = new Float64Array(postionsTemp);
                        this.colorArr = new Float32Array(colors);
                        this.indiceArr = new Uint16Array(indicesTesm);

                        geometry = CreateGeometry(this.positionArr, this.colorArr, this.indiceArr);
                        appearance = CreateAppearence(fragmentShader, vertexShader);
                    }

                    this.primitive = viewer.scene.primitives.add(new Cesium.Primitive({
                        geometryInstances: new Cesium.GeometryInstance({
                            geometry: geometry
                        }),
                        appearance: appearance,
                        asynchronous: false
                    }));
                } else { return; }
            }
            return _;
        })();
    /**
     * 动态移动实体
     */
    _.MoveEntity = (
        function () {
            var leftDownFlag = false;
            var pointDraged = null;
            var position = null;
            var viewer;
            var vueEntity;
            var handler;
            function ConstructMoveEntity(options) {
                viewer = options.viewer;
                vueEntity = options.vueEntity;
                handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
                Init();
            }
            function Init() {
                // Select plane when mouse down
                handler.setInputAction(function (movement) {
                    pointDraged = viewer.scene.pick(movement.position);//选取当前的entity 
                    leftDownFlag = true;
                    if (pointDraged) {
                        viewer.scene.screenSpaceCameraController.enableRotate = false;//锁定相机
                    }
                }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
                // Release plane on mouse up
                handler.setInputAction(function () {
                    leftDownFlag = false;
                    pointDraged = null;
                    viewer.scene.screenSpaceCameraController.enableInputs = true;
                }, Cesium.ScreenSpaceEventType.LEFT_UP);
                // Update plane on mouse move
                handler.setInputAction(function (movement) {
                    if (leftDownFlag === true && pointDraged != null) {
                        let ray = viewer.camera.getPickRay(movement.endPosition);
                        position = viewer.scene.globe.pick(ray, viewer.scene);
                        if(vueEntity != undefined)vueEntity.update(position); //更新
                        pointDraged.id.position = new Cesium.CallbackProperty(function () {
                            return position;
                        }, false);//防止闪烁，在移动的过程
                    }
                }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
            }
            ConstructMoveEntity.prototype.remove = function(){
                handler.destroy();
            }
            return ConstructMoveEntity;
        })();
    return _;
})();
/***
 * 经纬网
 * TileLonlatsImageryProvider.js
 * ImageryProvider
 */
/**
    * An {@link ImageryProvider} that draws a box around every rendered tile in the tiling scheme, and draws
    * a label inside it indicating the X, Y, Level coordinates of the tile.  This is mostly useful for
    * debugging terrain and imagery rendering problems.
    *
    * @alias TileLonlatsImageryProvider
    * @constructor
    *
    * @param {Object} [options] Object with the following properties:
    * @param {TilingScheme} [options.tilingScheme=new GeographicTilingScheme()] The tiling scheme for which to draw tiles.
    * @param {Ellipsoid} [options.ellipsoid] The ellipsoid.  If the tilingScheme is specified,
    *                    this parameter is ignored and the tiling scheme's ellipsoid is used instead. If neither
    *                    parameter is specified, the WGS84 ellipsoid is used.
    * @param {Color} [options.color=Color.YELLOW] The color to draw the tile box and label.
    * @param {Number} [options.tileWidth=256] The width of the tile for level-of-detail selection purposes.
    * @param {Number} [options.tileHeight=256] The height of the tile for level-of-detail selection purposes.
    */
var TileLonlatsImageryProvider = function TileLonlatsImageryProvider(options) {
    options = Cesium.defaultValue(options, Cesium.defaultValue.EMPTY_OBJECT);

    this._tilingScheme = Cesium.defined(options.tilingScheme) ? options.tilingScheme : new Cesium.GeographicTilingScheme({ ellipsoid: options.ellipsoid });
    this._color = Cesium.defaultValue(options.color, Cesium.Color.YELLOW);
    this._errorEvent = new Cesium.Event();
    this._tileWidth = Cesium.defaultValue(options.tileWidth, 256);
    this._tileHeight = Cesium.defaultValue(options.tileHeight, 256);
    this._readyPromise = Cesium.when.resolve(true);
}

Cesium.defineProperties(TileLonlatsImageryProvider.prototype, {
    /**
     * Gets the proxy used by this provider.
     * @memberof TileCoordinatesImageryProvider.prototype
     * @type {Proxy}
     * @readonly
     */
    proxy : {
        get : function() {
            return undefined;
        }
    },

    /**
     * Gets the width of each tile, in pixels. This function should
     * not be called before {@link TileCoordinatesImageryProvider#ready} returns true.
     * @memberof TileCoordinatesImageryProvider.prototype
     * @type {Number}
     * @readonly
     */
    tileWidth : {
        get : function() {
            return this._tileWidth;
        }
    },

    /**
     * Gets the height of each tile, in pixels.  This function should
     * not be called before {@link TileCoordinatesImageryProvider#ready} returns true.
     * @memberof TileCoordinatesImageryProvider.prototype
     * @type {Number}
     * @readonly
     */
    tileHeight: {
        get : function() {
            return this._tileHeight;
        }
    },

    /**
     * Gets the maximum level-of-detail that can be requested.  This function should
     * not be called before {@link TileCoordinatesImageryProvider#ready} returns true.
     * @memberof TileCoordinatesImageryProvider.prototype
     * @type {Number}
     * @readonly
     */
    maximumLevel : {
        get : function() {
            return undefined;
        }
    },

    /**
     * Gets the minimum level-of-detail that can be requested.  This function should
     * not be called before {@link TileCoordinatesImageryProvider#ready} returns true.
     * @memberof TileCoordinatesImageryProvider.prototype
     * @type {Number}
     * @readonly
     */
    minimumLevel : {
        get : function() {
            return undefined;
        }
    },

    /**
     * Gets the tiling scheme used by this provider.  This function should
     * not be called before {@link TileCoordinatesImageryProvider#ready} returns true.
     * @memberof TileCoordinatesImageryProvider.prototype
     * @type {TilingScheme}
     * @readonly
     */
    tilingScheme : {
        get : function() {
            return this._tilingScheme;
        }
    },

    /**
     * Gets the rectangle, in radians, of the imagery provided by this instance.  This function should
     * not be called before {@link TileCoordinatesImageryProvider#ready} returns true.
     * @memberof TileCoordinatesImageryProvider.prototype
     * @type {Rectangle}
     * @readonly
     */
    rectangle : {
        get : function() {
            return this._tilingScheme.rectangle;
        }
    },

    /**
     * Gets the tile discard policy.  If not undefined, the discard policy is responsible
     * for filtering out "missing" tiles via its shouldDiscardImage function.  If this function
     * returns undefined, no tiles are filtered.  This function should
     * not be called before {@link TileCoordinatesImageryProvider#ready} returns true.
     * @memberof TileCoordinatesImageryProvider.prototype
     * @type {TileDiscardPolicy}
     * @readonly
     */
    tileDiscardPolicy : {
        get : function() {
            return undefined;
        }
    },

    /**
     * Gets an event that is raised when the imagery provider encounters an asynchronous error.  By subscribing
     * to the event, you will be notified of the error and can potentially recover from it.  Event listeners
     * are passed an instance of {@link TileProviderError}.
     * @memberof TileCoordinatesImageryProvider.prototype
     * @type {Event}
     * @readonly
     */
    errorEvent : {
        get : function() {
            return this._errorEvent;
        }
    },

    /**
     * Gets a value indicating whether or not the provider is ready for use.
     * @memberof TileCoordinatesImageryProvider.prototype
     * @type {Boolean}
     * @readonly
     */
    ready : {
        get : function() {
            return true;
        }
    },

    /**
     * Gets a promise that resolves to true when the provider is ready for use.
     * @memberof TileCoordinatesImageryProvider.prototype
     * @type {Promise.<Boolean>}
     * @readonly
     */
    readyPromise : {
        get : function() {
            return this._readyPromise;
        }
    },

    /**
     * Gets the credit to display when this imagery provider is active.  Typically this is used to credit
     * the source of the imagery.  This function should not be called before {@link TileCoordinatesImageryProvider#ready} returns true.
     * @memberof TileCoordinatesImageryProvider.prototype
     * @type {Credit}
     * @readonly
     */
    credit : {
        get : function() {
            return undefined;
        }
    },

    /**
     * Gets a value indicating whether or not the images provided by this imagery provider
     * include an alpha channel.  If this property is false, an alpha channel, if present, will
     * be ignored.  If this property is true, any images without an alpha channel will be treated
     * as if their alpha is 1.0 everywhere.  Setting this property to false reduces memory usage
     * and texture upload time.
     * @memberof TileCoordinatesImageryProvider.prototype
     * @type {Boolean}
     * @readonly
     */
    hasAlphaChannel : {
        get : function() {
            return true;
        }
    }
});

/**
 * Gets the credits to be displayed when a given tile is displayed.
 *
 * @param {Number} x The tile X coordinate.
 * @param {Number} y The tile Y coordinate.
 * @param {Number} level The tile level;
 * @returns {Credit[]} The credits to be displayed when the tile is displayed.
 *
 * @exception {DeveloperError} <code>getTileCredits</code> must not be called before the imagery provider is ready.
 */
TileLonlatsImageryProvider.prototype.getTileCredits = function (x, y, level) {
    return undefined;
};

/**
 * Requests the image for a given tile.  This function should
 * not be called before {@link TileLonlatsImageryProvider#ready} returns true.
 *
 * @param {Number} x The tile X coordinate.
 * @param {Number} y The tile Y coordinate.
 * @param {Number} level The tile level.
 * @param {Request} [request] The request object. Intended for internal use only.
 * @returns {Promise.<Image|Canvas>|undefined} A promise for the image that will resolve when the image is available, or
 *          undefined if there are too many active requests to the server, and the request
 *          should be retried later.  The resolved image may be either an
 *          Image or a Canvas DOM object.
 */
TileLonlatsImageryProvider.prototype.requestImage = function (x, y, level, request) {
    var canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    var context = canvas.getContext('2d');
    var cssColor = this._color.toCssColorString();
    context.strokeStyle = cssColor;
    context.lineWidth = 2;
    context.strokeRect(1, 1, 255, 255);
    /*
    可以使用GeographicTilingScheme的tileXYToNativeRectangle接口获取对应关系，不需要自己算！
    */
    var interval = 180.0 / Math.pow(2, level);
    var lon = (x + 0.5) * interval-180;
    var lat = 90 - (y + 0.5) * interval;
    //var label = 'L-' + level + 'X-' + x + 'Y-' + y;
    var labelLevel = '';
    var labelLon = '';
    var labelLat = '';
    if (lon > 0) {
        if (lat > 0) {
            //label = 'L' + level + 'E' + lon + 'N' + lat;
            labelLevel = 'L' + level;
            labelLon = 'E' + lon;
            labelLat = 'N' + lat;
        } else {
            //label = 'L' + level + 'E' + lon + 'S' + (-lat);
            labelLevel = 'L' + level;
            labelLon = 'E' + lon;
            labelLat = 'N' + (-lat);
        }
    } else {
        if (lat > 0) {
            //label = 'L' + level + 'W' + (-lon) + 'N' + lat;
            labelLevel = 'L' + level;
            labelLon = 'E' + (-lon);
            labelLat = 'N' + lat;
        } else {
            //label = 'L' + level + 'W' + (-lon) + 'S' + (-lat);
            labelLevel = 'L' + level;
            labelLon = 'E' + (-lon);
            labelLat = 'N' + (-lat);
        }
    }
    context.textAlign = 'center';
    context.fillStyle = cssColor;
    if (level > 10) {
        context.font = 'bold 16px Arial';
        context.fillText(labelLevel, 124, 100);
        context.fillText(labelLon, 124, 124);
        context.fillText(labelLat, 124, 148);
    } else {
        context.font = 'bold 25px Arial';
        context.fillText(labelLevel, 124, 94);
        context.fillText(labelLon, 124, 124);
        context.fillText(labelLat, 124, 154);
    }  
    //context.textAlign = 'center';
    //context.fillStyle = 'black';//绘制阴影效果
    //context.fillText(label, 127, 127);
    //context.fillStyle = cssColor;
    //context.fillText(label, 124, 24);

    return canvas;
};

/**
 * Picking features is not currently supported by this imagery provider, so this function simply returns
 * undefined.
 *
 * @param {Number} x The tile X coordinate.
 * @param {Number} y The tile Y coordinate.
 * @param {Number} level The tile level.
 * @param {Number} longitude The longitude at which to pick features.
 * @param {Number} latitude  The latitude at which to pick features.
 * @return {Promise.<ImageryLayerFeatureInfo[]>|undefined} A promise for the picked features that will resolve when the asynchronous
 *                   picking completes.  The resolved value is an array of {@link ImageryLayerFeatureInfo}
 *                   instances.  The array may be empty if no features are found at the given location.
 *                   It may also be undefined if picking is not supported.
 */
TileLonlatsImageryProvider.prototype.pickFeatures = function (x, y, level, longitude, latitude) {
    return undefined;
};

/***
 * arcgis地形图 在线
 * ArcGisElevation3DTerrainProvider.js
 * LERC()
 * createArcGisElevation3DTerrainProvider();
 */

// This LERC function is from Esri/lerc and under the Apache License, Version 2.
function LERC() {
  
    // WARNING: This decoder version can only read old version 1 Lerc blobs. Use with caution. 
    // A new, updated js Lerc decoder is in the works. 
  
    // Note: currently, this module only has an implementation for decoding LERC data, not encoding. The name of
    // the class was chosen to be future proof.
  
    var LercCodec = {};
  
    LercCodec.defaultNoDataValue = -3.4027999387901484e+38; // smallest Float32 value
  
    /**
     * Decode a LERC byte stream and return an object containing the pixel data and some required and optional
     * information about it, such as the image's width and height.
     *
     * @param {ArrayBuffer} input The LERC input byte stream
     * @param {object} [options] Decoding options, containing any of the following properties:
     * @config {number} [inputOffset = 0]
     *        Skip the first inputOffset bytes of the input byte stream. A valid LERC file is expected at that position.
     * @config {Uint8Array} [encodedMask = null]
     *        If specified, the decoder will not read mask information from the input and use the specified encoded
     *        mask data instead. Mask header/data must not be present in the LERC byte stream in this case.
     * @config {number} [noDataValue = LercCode.defaultNoDataValue]
     *        Pixel value to use for masked pixels.
     * @config {ArrayBufferView|Array} [pixelType = Float32Array]
     *        The desired type of the pixelData array in the return value. Note that it is the caller's responsibility to
     *        provide an appropriate noDataValue if the default pixelType is overridden.
     * @config {boolean} [returnMask = false]
     *        If true, the return value will contain a maskData property of type Uint8Array which has one element per
     *        pixel, the value of which is 1 or 0 depending on whether that pixel's data is present or masked. If the
     *        input LERC data does not contain a mask, maskData will not be returned.
     * @config {boolean} [returnEncodedMask = false]
     *        If true, the return value will contain a encodedMaskData property, which can be passed into encode() as
     *        encodedMask.
     * @config {boolean} [returnFileInfo = false]
     *        If true, the return value will have a fileInfo property that contains metadata obtained from the
     *        LERC headers and the decoding process.
     * @config {boolean} [computeUsedBitDepths = false]
     *        If true, the fileInfo property in the return value will contain the set of all block bit depths
     *        encountered during decoding. Will only have an effect if returnFileInfo option is true.
     * @returns {{width, height, pixelData, minValue, maxValue, noDataValue, [maskData], [encodedMaskData], [fileInfo]}}
     */
    LercCodec.decode = function (input, options) {
      options = options || {};
  
      var skipMask = options.encodedMaskData || (options.encodedMaskData === null);
      var parsedData = parse(input, options.inputOffset || 0, skipMask);
      
      var noDataValue = (options.noDataValue != null) ? options.noDataValue : LercCodec.defaultNoDataValue;
  
      var uncompressedData = uncompressPixelValues(parsedData, options.pixelType || Float32Array,
        options.encodedMaskData, noDataValue, options.returnMask);
  
      var result = {
        width: parsedData.width,
        height: parsedData.height,
        pixelData: uncompressedData.resultPixels,
        minValue: parsedData.pixels.minValue,
        maxValue: parsedData.pixels.maxValue,
        noDataValue: noDataValue
      };
  
      if (uncompressedData.resultMask) {
        result.maskData = uncompressedData.resultMask;
      }
  
      if (options.returnEncodedMask && parsedData.mask) {
        result.encodedMaskData = parsedData.mask.bitset ? parsedData.mask.bitset : null;
      }
  
      if (options.returnFileInfo) {
        result.fileInfo = formatFileInfo(parsedData);
        if (options.computeUsedBitDepths) {
          result.fileInfo.bitDepths = computeUsedBitDepths(parsedData);
        }
      }
  
      return result;
    };
  
    var uncompressPixelValues = function (data, TypedArrayClass, maskBitset, noDataValue, storeDecodedMask) {
      var blockIdx = 0;
      var numX = data.pixels.numBlocksX;
      var numY = data.pixels.numBlocksY;
      var blockWidth = Math.floor(data.width / numX);
      var blockHeight = Math.floor(data.height / numY);
      var scale = 2 * data.maxZError;
      maskBitset = maskBitset || ((data.mask) ? data.mask.bitset : null);
  
      var resultPixels, resultMask;
      resultPixels = new TypedArrayClass(data.width * data.height);
      if (storeDecodedMask && maskBitset) {
        resultMask = new Uint8Array(data.width * data.height);
      }
      var blockDataBuffer = new Float32Array(blockWidth * blockHeight);
  
      var xx, yy;
      for (var y = 0; y <= numY; y++) {
        var thisBlockHeight = (y !== numY) ? blockHeight : (data.height % numY);
        if (thisBlockHeight === 0) {
          continue;
        }
        for (var x = 0; x <= numX; x++) {
          var thisBlockWidth = (x !== numX) ? blockWidth : (data.width % numX);
          if (thisBlockWidth === 0) {
            continue;
          }
  
          var outPtr = y * data.width * blockHeight + x * blockWidth;
          var outStride = data.width - thisBlockWidth;
  
          var block = data.pixels.blocks[blockIdx];
  
          var blockData, blockPtr, constValue;
          if (block.encoding < 2) {
            // block is either uncompressed or bit-stuffed (encodings 0 and 1)
            if (block.encoding === 0) {
              // block is uncompressed
              blockData = block.rawData;
            } else {
              // block is bit-stuffed
              unstuff(block.stuffedData, block.bitsPerPixel, block.numValidPixels, block.offset, scale, blockDataBuffer, data.pixels.maxValue);
              blockData = blockDataBuffer;
            }
            blockPtr = 0;
          }
          else if (block.encoding === 2) {
            // block is all 0
            constValue = 0;
          }
          else {
            // block has constant value (encoding === 3)
            constValue = block.offset;
          }
  
          var maskByte;
          if (maskBitset) {
            for (yy = 0; yy < thisBlockHeight; yy++) {
              if (outPtr & 7) {
                //
                maskByte = maskBitset[outPtr >> 3];
                maskByte <<= outPtr & 7;
              }
              for (xx = 0; xx < thisBlockWidth; xx++) {
                if (!(outPtr & 7)) {
                  // read next byte from mask
                  maskByte = maskBitset[outPtr >> 3];
                }
                if (maskByte & 128) {
                  // pixel data present
                  if (resultMask) {
                    resultMask[outPtr] = 1;
                  }
                  resultPixels[outPtr++] = (block.encoding < 2) ? blockData[blockPtr++] : constValue;
                } else {
                  // pixel data not present
                  if (resultMask) {
                    resultMask[outPtr] = 0;
                  }
                  resultPixels[outPtr++] = noDataValue;
                }
                maskByte <<= 1;
              }
              outPtr += outStride;
            }
          } else {
            // mask not present, simply copy block over
            if (block.encoding < 2) {
              // duplicating this code block for performance reasons
              // blockData case:
              for (yy = 0; yy < thisBlockHeight; yy++) {
                for (xx = 0; xx < thisBlockWidth; xx++) {
                  resultPixels[outPtr++] = blockData[blockPtr++];
                }
                outPtr += outStride;
              }
            }
            else {
              // constValue case:
              for (yy = 0; yy < thisBlockHeight; yy++) {
                for (xx = 0; xx < thisBlockWidth; xx++) {
                  resultPixels[outPtr++] = constValue;
                }
                outPtr += outStride;
              }
            }
          }
          if ((block.encoding === 1) && (blockPtr !== block.numValidPixels)) {
            throw "Block and Mask do not match";
          }
          blockIdx++;
        }
      }
  
      return {
        resultPixels: resultPixels,
        resultMask: resultMask
      };
    };
  
    var formatFileInfo = function (data) {
      return {
        "fileIdentifierString": data.fileIdentifierString,
        "fileVersion": data.fileVersion,
        "imageType": data.imageType,
        "height": data.height,
        "width": data.width,
        "maxZError": data.maxZError,
        "eofOffset": data.eofOffset,
        "mask": data.mask ? {
          "numBlocksX": data.mask.numBlocksX,
          "numBlocksY": data.mask.numBlocksY,
          "numBytes": data.mask.numBytes,
          "maxValue": data.mask.maxValue
        } : null,
        "pixels": {
          "numBlocksX": data.pixels.numBlocksX,
          "numBlocksY": data.pixels.numBlocksY,
          "numBytes": data.pixels.numBytes,
          "maxValue": data.pixels.maxValue,
          "minValue": data.pixels.minValue,
          "noDataValue": this.noDataValue
        }
      };
    };
  
    var computeUsedBitDepths = function (data) {
      var numBlocks = data.pixels.numBlocksX * data.pixels.numBlocksY;
      var bitDepths = {};
      for (var i = 0; i < numBlocks; i++) {
        var block = data.pixels.blocks[i];
        if (block.encoding === 0) {
          bitDepths.float32 = true;
        } else if (block.encoding === 1) {
          bitDepths[block.bitsPerPixel] = true;
        } else {
          bitDepths[0] = true;
        }
      }
  
      return Object.keys(bitDepths);
    };
  
    var parse = function (input, fp, skipMask) {
      var data = {};
  
      // File header
      var fileIdView = new Uint8Array(input, fp, 10);
      data.fileIdentifierString = String.fromCharCode.apply(null, fileIdView);
      if (data.fileIdentifierString.trim() != "CntZImage") {
        throw "Unexpected file identifier string: " + data.fileIdentifierString;
      }
      fp += 10;
      var view = new DataView(input, fp, 24);
      data.fileVersion = view.getInt32(0, true);
      data.imageType = view.getInt32(4, true);
      data.height = view.getUint32(8, true);
      data.width = view.getUint32(12, true);
      data.maxZError = view.getFloat64(16, true);
      fp += 24;
  
      // Mask Header
      if (!skipMask) {
        view = new DataView(input, fp, 16);
        data.mask = {};
        data.mask.numBlocksY = view.getUint32(0, true);
        data.mask.numBlocksX = view.getUint32(4, true);
        data.mask.numBytes = view.getUint32(8, true);
        data.mask.maxValue = view.getFloat32(12, true);
        fp += 16;
  
        // Mask Data
        if (data.mask.numBytes > 0) {
          var bitset = new Uint8Array(Math.ceil(data.width * data.height / 8));
          view = new DataView(input, fp, data.mask.numBytes);
          var cnt = view.getInt16(0, true);
          var ip = 2, op = 0;
          do {
            if (cnt > 0) {
              while (cnt--) { bitset[op++] = view.getUint8(ip++); }
            } else {
              var val = view.getUint8(ip++);
              cnt = -cnt;
              while (cnt--) { bitset[op++] = val; }
            }
            cnt = view.getInt16(ip, true);
            ip += 2;
          } while (ip < data.mask.numBytes);
          if ((cnt !== -32768) || (op < bitset.length)) {
            throw "Unexpected end of mask RLE encoding";
          }
          data.mask.bitset = bitset;
          fp += data.mask.numBytes;
        } 
        else if ((data.mask.numBytes | data.mask.numBlocksY | data.mask.maxValue) == 0)
        {  // Special case, all nodata
            var bitset = new Uint8Array(Math.ceil(data.width * data.height / 8));
            data.mask.bitset = bitset;
        }
      }
  
      // Pixel Header
      view = new DataView(input, fp, 16);
      data.pixels = {};
      data.pixels.numBlocksY = view.getUint32(0, true);
      data.pixels.numBlocksX = view.getUint32(4, true);
      data.pixels.numBytes = view.getUint32(8, true);
      data.pixels.maxValue = view.getFloat32(12, true);
      fp += 16;
  
      var numBlocksX = data.pixels.numBlocksX;
      var numBlocksY = data.pixels.numBlocksY;
      // the number of blocks specified in the header does not take into account the blocks at the end of
      // each row/column with a special width/height that make the image complete in case the width is not
      // evenly divisible by the number of blocks.
      var actualNumBlocksX = numBlocksX + ((data.width % numBlocksX) > 0 ? 1 : 0);
      var actualNumBlocksY = numBlocksY + ((data.height % numBlocksY) > 0 ? 1 : 0);
      data.pixels.blocks = new Array(actualNumBlocksX * actualNumBlocksY);
      var minValue = 1000000000;
      var blockI = 0;
      for (var blockY = 0; blockY < actualNumBlocksY; blockY++) {
        for (var blockX = 0; blockX < actualNumBlocksX; blockX++) {
  
          // Block
          var size = 0;
          var bytesLeft = input.byteLength - fp;
          view = new DataView(input, fp, Math.min(10, bytesLeft));
          var block = {};
          data.pixels.blocks[blockI++] = block;
          var headerByte = view.getUint8(0); size++;
          block.encoding = headerByte & 63;
          if (block.encoding > 3) {
            throw "Invalid block encoding (" + block.encoding + ")";
          }
          if (block.encoding === 2) {
            fp++;
            minValue = Math.min(minValue, 0);
            continue;
          }
          if ((headerByte !== 0) && (headerByte !== 2)) {
            headerByte >>= 6;
            block.offsetType = headerByte;
            if (headerByte === 2) {
              block.offset = view.getInt8(1); size++;
            } else if (headerByte === 1) {
              block.offset = view.getInt16(1, true); size += 2;
            } else if (headerByte === 0) {
              block.offset = view.getFloat32(1, true); size += 4;
            } else {
              throw "Invalid block offset type";
            }
            minValue = Math.min(block.offset, minValue);
  
            if (block.encoding === 1) {
              headerByte = view.getUint8(size); size++;
              block.bitsPerPixel = headerByte & 63;
              headerByte >>= 6;
              block.numValidPixelsType = headerByte;
              if (headerByte === 2) {
                block.numValidPixels = view.getUint8(size); size++;
              } else if (headerByte === 1) {
                block.numValidPixels = view.getUint16(size, true); size += 2;
              } else if (headerByte === 0) {
                block.numValidPixels = view.getUint32(size, true); size += 4;
              } else {
                throw "Invalid valid pixel count type";
              }
            }
          }
          fp += size;
  
          if (block.encoding == 3) {
            continue;
          }
  
          var arrayBuf, store8;
          if (block.encoding === 0) {
            var numPixels = (data.pixels.numBytes - 1) / 4;
            if (numPixels !== Math.floor(numPixels)) {
              throw "uncompressed block has invalid length";
            }
            arrayBuf = new ArrayBuffer(numPixels * 4);
            store8 = new Uint8Array(arrayBuf);
            store8.set(new Uint8Array(input, fp, numPixels * 4));
            var rawData = new Float32Array(arrayBuf);
            for (var j = 0; j < rawData.length; j++) {
              minValue = Math.min(minValue, rawData[j]);
            }
            block.rawData = rawData;
            fp += numPixels * 4;
          } else if (block.encoding === 1) {
            var dataBytes = Math.ceil(block.numValidPixels * block.bitsPerPixel / 8);
            var dataWords = Math.ceil(dataBytes / 4);
            arrayBuf = new ArrayBuffer(dataWords * 4);
            store8 = new Uint8Array(arrayBuf);
            store8.set(new Uint8Array(input, fp, dataBytes));
            block.stuffedData = new Uint32Array(arrayBuf);
            fp += dataBytes;
          }
        }
      }
      data.pixels.minValue = minValue;
      data.eofOffset = fp;
      return data;
    };
  
    var unstuff = function (src, bitsPerPixel, numPixels, offset, scale, dest, maxValue) {
      var bitMask = (1 << bitsPerPixel) - 1;
      var i = 0, o;
      var bitsLeft = 0;
      var n, buffer;
      var nmax = Math.ceil((maxValue - offset) / scale);
      // get rid of trailing bytes that are already part of next block
      var numInvalidTailBytes = src.length * 4 - Math.ceil(bitsPerPixel * numPixels / 8);
      src[src.length - 1] <<= 8 * numInvalidTailBytes;
  
      for (o = 0; o < numPixels; o++) {
        if (bitsLeft === 0) {
          buffer = src[i++];
          bitsLeft = 32;
        }
        if (bitsLeft >= bitsPerPixel) {
          n = (buffer >>> (bitsLeft - bitsPerPixel)) & bitMask;
          bitsLeft -= bitsPerPixel;
        } else {
          var missingBits = (bitsPerPixel - bitsLeft);
          n = ((buffer & bitMask) << missingBits) & bitMask;
          buffer = src[i++];
          bitsLeft = 32 - missingBits;
          n += (buffer >>> bitsLeft);
        }
        //pixel values may exceed max due to quantization
        dest[o] = n < nmax? offset + n * scale: maxValue;
      }
      return dest;
    };
  
    return LercCodec
};


function createArcGisElevation3DTerrainProvider(Cesium){
  // The following code is written by Peter Lu
  // I disclaims copyright to this source code
  // and I really hope one day, it coube be merged with Cesium Trunk~
  /**
   * A {@link TerrainProvider} that produces terrain geometry by tessellating height maps
   * retrieved from an ArcGIS Elevation3D Server.
   *
   * @alias ArcGisElevation3DTerrainProvider
   * @constructor
   *
   * @example
   * var terrainProvider = new ArcGisElevation3DTerrainProvider();
   * viewer.terrainProvider = terrainProvider;
   *
   *  @see TerrainProvider
   */
  function ArcGisElevation3DTerrainProvider(options) {
    options = Cesium.defaultValue(options, {});
    
    this._tilingScheme = new Cesium.WebMercatorTilingScheme({ ellipsoid : options.ellipsoid });

    this._terrainDataStructure = {
        heightScale : 1,
        heightOffset : 0,
        elementsPerHeight : 1,
        stride : 1,
        elementMultiplier : 65.0
    };

    this.lerc = LERC();

    // Note: the 64 below does NOT need to match the actual vertex dimensions, because
    // the ellipsoid is significantly smoother than actual terrain.
    this._levelZeroMaximumGeometricError = Cesium.TerrainProvider.getEstimatedLevelZeroGeometricErrorForAHeightmap(this._tilingScheme.ellipsoid, 65, 
                                                                                                              this._tilingScheme.getNumberOfXTilesAtLevel(0));

    this._baseUrl = "https://elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer/tile/{z}/{y}/{x}";
    this._errorEvent = new Cesium.Event();
    this._readyPromise = Cesium.when.resolve(true);
  }

  Cesium.defineProperties(ArcGisElevation3DTerrainProvider.prototype, {
    /**
     * Gets an event that is raised when the terrain provider encounters an asynchronous error.  By subscribing
     * to the event, you will be notified of the error and can potentially recover from it.  Event listeners
     * are passed an instance of {@link TileProviderError}.
     * @memberof ArcGisElevation3DTerrainProvider.prototype
     * @type {Event}
     */
    errorEvent : {
        get : function() {
            return this._errorEvent;
        }
    },

    /**
     * Gets the credit to display when this terrain provider is active.  Typically this is used to credit
     * the source of the terrain.  This function should not be called before {@link ArcGisElevation3DTerrainProvider#ready} returns true.
     * @memberof ArcGisElevation3DTerrainProvider.prototype
     * @type {Credit}
     */
    credit : {
        get : function() {
            return this._credit;
        }
    },

    /**
     * Gets the tiling scheme used by this provider.  This function should
     * not be called before {@link ArcGisElevation3DTerrainProvider#ready} returns true.
     * @memberof ArcGisElevation3DTerrainProvider.prototype
     * @type {GeographicTilingScheme}
     */
    tilingScheme : {
        get : function() {
            return this._tilingScheme;
        }
    },

    /**
     * Gets a value indicating whether or not the provider is ready for use.
     * @memberof ArcGisElevation3DTerrainProvider.prototype
     * @type {Boolean}
     */
    ready : {
        get : function() {
            return true;
        }
    },

    /**
     * Gets a promise that resolves to true when the provider is ready for use.
     * @memberof ArcGisElevation3DTerrainProvider.prototype
     * @type {Promise.<Boolean>}
     * @readonly
     */
    readyPromise : {
        get : function() {
            return this._readyPromise;
        }
    },

    /**
     * Gets a value indicating whether or not the provider includes a water mask.  The water mask
     * indicates which areas of the globe are water rather than land, so they can be rendered
     * as a reflective surface with animated waves.  This function should not be
     * called before {@link ArcGisElevation3DTerrainProvider#ready} returns true.
     * @memberof ArcGisElevation3DTerrainProvider.prototype
     * @type {Boolean}
     */
    hasWaterMask : {
        get : function() {
            return false;
        }
    },

    /**
     * Gets a value indicating whether or not the requested tiles include vertex normals.
     * This function should not be called before {@link ArcGisElevation3DTerrainProvider#ready} returns true.
     * @memberof ArcGisElevation3DTerrainProvider.prototype
     * @type {Boolean}
     */
    hasVertexNormals : {
        get : function() {
            return false;
        }
    }
  });

  /**
   * Requests the geometry for a given tile.  This function should not be called before
   * {@link ArcGisElevation3DTerrainProvider#ready} returns true.  The result includes terrain
   * data and indicates that all child tiles are available.
   *
   * @param {Number} x The X coordinate of the tile for which to request geometry.
   * @param {Number} y The Y coordinate of the tile for which to request geometry.
   * @param {Number} level The level of the tile for which to request geometry.
   * @returns {Promise.<TerrainData>|undefined} A promise for the requested geometry.  If this method
   *          returns undefined instead of a promise, it is an indication that too many requests are already
   *          pending and the request will be retried later.
   */
  ArcGisElevation3DTerrainProvider.prototype.requestTileGeometry = function(x, y, level) {
    var url = this._baseUrl.replace('{z}', level).replace('{x}', x).replace('{y}', y);

    var that = this;

    var resource = Cesium.Resource.createIfNeeded(url);
    return resource.fetchArrayBuffer().then(function(buffer) {
      var bufferNow = buffer;
      var pixels, mask, min, max, height, width;
      var decodedPixelBlock = that.lerc.decode(buffer, { returnMask: true });
      width = decodedPixelBlock.width;
      height = decodedPixelBlock.height;
      min = decodedPixelBlock.minValue;
      max = decodedPixelBlock.maxValue;
      pixels = decodedPixelBlock.pixelData;
      mask = decodedPixelBlock.maskData;

      var bEmptyData = 0;
      var setWidth = 65;
      var nRatio = 4;
      var fWidth = setWidth;
      var fHeight = setWidth;
      var buffer = new Float32Array(fWidth*fHeight);

      for(var i=0;i<fHeight;i++){
          for(var j=0;j<fWidth;j++){
            if(mask&&mask[i*width*nRatio+j*nRatio]==0){
              buffer[i*fWidth+j] = 0;                        
            }else{
                buffer[i*fWidth+j] = pixels[i*width*nRatio+j*nRatio];
                bEmptyData++;
            }                
          }

      }

      return new Cesium.HeightmapTerrainData({
        buffer : buffer,
        width : fWidth,
        height : fHeight,
        structure : that._terrainDataStructure
    }); 
      // if(bEmptyData !=0){
      //     return new Cesium.HeightmapTerrainData({
      //       buffer : buffer,
      //       width : fWidth,
      //       height : fHeight,
      //       structure : that._terrainDataStructure
      //   });            
      // }else{
      //   return {bEmptyData:true};
      // }
    }).otherwise(function(error) {                
    });
    
    return 
  };

  /**
   * Gets the maximum geometric error allowed in a tile at a given level.
   *
   * @param {Number} level The tile level for which to get the maximum geometric error.
   * @returns {Number} The maximum geometric error.
   */
  ArcGisElevation3DTerrainProvider.prototype.getLevelMaximumGeometricError = function(level) {
    return this._levelZeroMaximumGeometricError / (1 << level);
  };

  /**
   * Determines whether data for a tile is available to be loaded.
   *
   * @param {Number} x The X coordinate of the tile for which to request geometry.
   * @param {Number} y The Y coordinate of the tile for which to request geometry.
   * @param {Number} level The level of the tile for which to request geometry.
   * @returns {Boolean} Undefined if not supported, otherwise true or false.
   */
  ArcGisElevation3DTerrainProvider.prototype.getTileDataAvailable = function(x, y, level) {
    return undefined;
  };

  return new ArcGisElevation3DTerrainProvider();
}

/**
 * 标绘
 * plot algorithm.js plotUtil.js
 * @override
 * 全局变量
 */
var xp = {
    version: "1.0.0",
    createTime: "2018.6.19",
    author: "xupinhui"
}
var doubleArrowDefualParam = {
    type: "doublearrow",
    headHeightFactor: .25,
    headWidthFactor: .3,
    neckHeightFactor: .85,
    fixPointCount: 4,
    neckWidthFactor: .15
}
var tailedAttackArrowDefualParam = {
    headHeightFactor: .18,
    headWidthFactor: .3,
    neckHeightFactor: .85,
    neckWidthFactor: .15,
    tailWidthFactor: .1,
    headTailFactor: .8,
    swallowTailFactor: 1
};
var fineArrowDefualParam = {
    tailWidthFactor: 0.15,
    neckWidthFactor: 0.20,
    headWidthFactor: 0.25,
    headAngle: Math.PI / 8.5,
    neckAngle: Math.PI / 13
};
xp.algorithm = {},
xp.algorithm.doubleArrow = function (inputPoint) {
    this.connPoint = null;
    this.tempPoint4 = null;
    this.points = inputPoint;
    var result = {
        controlPoint: null,
        polygonalPoint: null
    };
    //获取已经点击的坐标数
    var t = inputPoint.length;
    if (!(2 > t)) {
        if (2 == t) return inputPoint;
        var o = this.points[0],    //第一个点
        e = this.points[1],        //第二个点
        r = this.points[2],        //第三个点
        t = inputPoint.length; //获取已经点击的坐标数
        //下面的是移动点位后的坐标
        3 == t ? this.tempPoint4 = xp.algorithm.getTempPoint4(o, e, r) : this.tempPoint4 = this.points[3],
        3 == t || 4 == t ? this.connPoint = P.PlotUtils.mid(o, e) : this.connPoint = this.points[4];
        var n, g;
        P.PlotUtils.isClockWise(o, e, r) ? (n = xp.algorithm.getArrowPoints(o, this.connPoint, this.tempPoint4, !1), g = xp.algorithm.getArrowPoints(this.connPoint, e, r, !0)) : (n = xp.algorithm.getArrowPoints(e, this.connPoint, r, !1), g = xp.algorithm.getArrowPoints(this.connPoint, o, this.tempPoint4, !0));
        var i = n.length,
        s = (i - 5) / 2,
        a = n.slice(0, s),
        l = n.slice(s, s + 5),
        u = n.slice(s + 5, i),
        c = g.slice(0, s),
        p = g.slice(s, s + 5),
        h = g.slice(s + 5, i);
        c = P.PlotUtils.getBezierPoints(c);
        var d = P.PlotUtils.getBezierPoints(h.concat(a.slice(1)));
        u = P.PlotUtils.getBezierPoints(u);
        var f = c.concat(p, d, l, u);
        var newArray = xp.algorithm.array2Dto1D(f);
        result.controlPoint = [o, e, r, this.tempPoint4, this.connPoint];
        result.polygonalPoint = Cesium.Cartesian3.fromDegreesArray(newArray);
    }
    return result;
},
xp.algorithm.threeArrow = function (inputPoint) {
    this.connPoint = null;
    this.tempPoint4 = null;
    this.tempPoint5 = null;
    this.points = inputPoint;
    var result = {
        controlPoint: null,
        polygonalPoint: null
    };
    //获取已经点击的坐标数
    var t = inputPoint.length;
    if (t >= 2) {
        if (t == 2) {
            return inputPoint;
        }
        var o = this.points[0],    //第一个点
        e = this.points[1],        //第二个点
        r = this.points[2],        //第三个点
        t = inputPoint.length; //获取已经点击的坐标数
        //下面的是移动点位后的坐标
        if (t == 3) {
            this.tempPoint4 = xp.algorithm.getTempPoint4(o, e, r);
            this.tempPoint5 = P.PlotUtils.mid(r, this.tempPoint4);
        } else {
            this.tempPoint4 = this.points[3];
            this.tempPoint5 = this.points[4];
        }
        if (t < 6) {
            this.connPoint = P.PlotUtils.mid(o, e);
        } else {
            this.connPoint = this.points[5];
        }
        var n, g;
        if (P.PlotUtils.isClockWise(o, e, r)) {
            n = xp.algorithm.getArrowPoints(o, this.connPoint, this.tempPoint4, !1);
            g = xp.algorithm.getArrowPoints(this.connPoint, e, r, !0);
        } else {
            n = xp.algorithm.getArrowPoints(e, this.connPoint, r, !1);
            g = xp.algorithm.getArrowPoints(this.connPoint, o, this.tempPoint4, !0);
        }
        var i = n.length,
        s = (i - 5) / 2,
        a = n.slice(0, s),
        l = n.slice(s, s + 5),
        u = n.slice(s + 5, i),
        c = g.slice(0, s),
        p = g.slice(s, s + 5),
        h = g.slice(s + 5, i);
        c = P.PlotUtils.getBezierPoints(c);
        var d = P.PlotUtils.getBezierPoints(h.concat(a.slice(1)));
        u = P.PlotUtils.getBezierPoints(u);
        var f = c.concat(p, d, l, u);
        var newArray = xp.algorithm.array2Dto1D(f);
        result.controlPoint = [o, e, r, this.tempPoint4, this.tempPoint5, this.connPoint];
        result.polygonalPoint = Cesium.Cartesian3.fromDegreesArray(newArray);
    }
    return result;
},
xp.algorithm.array2Dto1D = function (array) {
    var newArray = [];
    array.forEach(function (elt) {
        newArray.push(elt[0]);
        newArray.push(elt[1]);
    });
    return newArray;
},
xp.algorithm.getArrowPoints = function (t, o, e, r) {
    this.type = doubleArrowDefualParam.type,
    this.headHeightFactor = doubleArrowDefualParam.headHeightFactor,
    this.headWidthFactor = doubleArrowDefualParam.headWidthFactor,
    this.neckHeightFactor = doubleArrowDefualParam.neckHeightFactor,
    this.neckWidthFactor = doubleArrowDefualParam.neckWidthFactor;
    var n = P.PlotUtils.mid(t, o),
    g = P.PlotUtils.distance(n, e),
    i = P.PlotUtils.getThirdPoint(e, n, 0, .3 * g, !0),
    s = P.PlotUtils.getThirdPoint(e, n, 0, .5 * g, !0);
    i = P.PlotUtils.getThirdPoint(n, i, P.Constants.HALF_PI, g / 5, r),
    s = P.PlotUtils.getThirdPoint(n, s, P.Constants.HALF_PI, g / 4, r);
    var a = [n, i, s, e],
    l = xp.algorithm.getArrowHeadPoints(a, this.headHeightFactor, this.headWidthFactor, this.neckHeightFactor, this.neckWidthFactor),
    u = l[0],
    c = l[4],
    p = P.PlotUtils.distance(t, o) / P.PlotUtils.getBaseLength(a) / 2,
    h = xp.algorithm.getArrowBodyPoints(a, u, c, p),
    d = h.length,
    f = h.slice(0, d / 2),
    E = h.slice(d / 2, d);
    return f.push(u),
    E.push(c),
    f = f.reverse(),
    f.push(o),
    E = E.reverse(),
    E.push(t),
    f.reverse().concat(l, E)
},
xp.algorithm.getArrowHeadPoints = function (t, o, e) {
    this.type = doubleArrowDefualParam.type,
    this.headHeightFactor = doubleArrowDefualParam.headHeightFactor,
    this.headWidthFactor = doubleArrowDefualParam.headWidthFactor,
    this.neckHeightFactor = doubleArrowDefualParam.neckHeightFactor,
    this.neckWidthFactor = doubleArrowDefualParam.neckWidthFactor;
    var r = P.PlotUtils.getBaseLength(t),
    n = r * this.headHeightFactor,
    g = t[t.length - 1],
    i = (P.PlotUtils.distance(o, e), n * this.headWidthFactor),
    s = n * this.neckWidthFactor,
    a = n * this.neckHeightFactor,
    l = P.PlotUtils.getThirdPoint(t[t.length - 2], g, 0, n, !0),
    u = P.PlotUtils.getThirdPoint(t[t.length - 2], g, 0, a, !0),
    c = P.PlotUtils.getThirdPoint(g, l, P.Constants.HALF_PI, i, !1),
    p = P.PlotUtils.getThirdPoint(g, l, P.Constants.HALF_PI, i, !0),
    h = P.PlotUtils.getThirdPoint(g, u, P.Constants.HALF_PI, s, !1),
    d = P.PlotUtils.getThirdPoint(g, u, P.Constants.HALF_PI, s, !0);
    return [h, c, g, p, d];
},
xp.algorithm.getArrowBodyPoints = function (t, o, e, r) {
    for (var n = P.PlotUtils.wholeDistance(t), g = P.PlotUtils.getBaseLength(t), i = g * r, s = P.PlotUtils.distance(o, e), a = (i - s) / 2, l = 0, u = [], c = [], p = 1; p < t.length - 1; p++) {
        var h = P.PlotUtils.getAngleOfThreePoints(t[p - 1], t[p], t[p + 1]) / 2;
        l += P.PlotUtils.distance(t[p - 1], t[p]);
        var d = (i / 2 - l / n * a) / Math.sin(h),
        f = P.PlotUtils.getThirdPoint(t[p - 1], t[p], Math.PI - h, d, !0),
        E = P.PlotUtils.getThirdPoint(t[p - 1], t[p], h, d, !1);
        u.push(f),
        c.push(E)
    }
    return u.concat(c)
},
xp.algorithm.getTempPoint4 = function (t, o, e) {
    var r, n, g, i, s = P.PlotUtils.mid(t, o),
    a = P.PlotUtils.distance(s, e),
    l = P.PlotUtils.getAngleOfThreePoints(t, s, e);
    return l < P.Constants.HALF_PI ? (n = a * Math.sin(l), g = a * Math.cos(l), i = P.PlotUtils.getThirdPoint(t, s, P.Constants.HALF_PI, n, !1), r = P.PlotUtils.getThirdPoint(s, i, P.Constants.HALF_PI, g, !0)) : l >= P.Constants.HALF_PI && l < Math.PI ? (n = a * Math.sin(Math.PI - l), g = a * Math.cos(Math.PI - l), i = P.PlotUtils.getThirdPoint(t, s, P.Constants.HALF_PI, n, !1), r = P.PlotUtils.getThirdPoint(s, i, P.Constants.HALF_PI, g, !1)) : l >= Math.PI && l < 1.5 * Math.PI ? (n = a * Math.sin(l - Math.PI), g = a * Math.cos(l - Math.PI), i = P.PlotUtils.getThirdPoint(t, s, P.Constants.HALF_PI, n, !0), r = P.PlotUtils.getThirdPoint(s, i, P.Constants.HALF_PI, g, !0)) : (n = a * Math.sin(2 * Math.PI - l), g = a * Math.cos(2 * Math.PI - l), i = P.PlotUtils.getThirdPoint(t, s, P.Constants.HALF_PI, n, !0), r = P.PlotUtils.getThirdPoint(s, i, P.Constants.HALF_PI, g, !1)),
    r
},
xp.algorithm.tailedAttackArrow = function (inputPoint) {
    inputPoint = xp.algorithm.dereplication(inputPoint);
    this.tailWidthFactor = tailedAttackArrowDefualParam.tailWidthFactor;
    this.swallowTailFactor = tailedAttackArrowDefualParam.swallowTailFactor;
    this.swallowTailPnt = tailedAttackArrowDefualParam.swallowTailPnt;
    //控制点
    var result = {
        controlPoint: null,
        polygonalPoint: null
    };
    result.controlPoint = inputPoint;
    var t = inputPoint.length;
    if (!(2 > t)) {
        if (2 == inputPoint.length) {
            result.polygonalPoint = inputPoint;
            return result;
        }
        var o = inputPoint,
        e = o[0],
        r = o[1];
        P.PlotUtils.isClockWise(o[0], o[1], o[2]) && (e = o[1], r = o[0]);
        var n = P.PlotUtils.mid(e, r),
        g = [n].concat(o.slice(2)),
        i = xp.algorithm.getAttackArrowHeadPoints(g, e, r, tailedAttackArrowDefualParam),
        s = i[0],
        a = i[4],
        l = P.PlotUtils.distance(e, r),
        u = P.PlotUtils.getBaseLength(g),
        c = u * this.tailWidthFactor * this.swallowTailFactor;
        this.swallowTailPnt = P.PlotUtils.getThirdPoint(g[1], g[0], 0, c, !0);
        var p = l / u,
        h = xp.algorithm.getAttackArrowBodyPoints(g, s, a, p),
        t = h.length,
        d = [e].concat(h.slice(0, t / 2));
        d.push(s);
        var f = [r].concat(h.slice(t / 2, t));
        var newArray = [];
        f.push(a),
        d = P.PlotUtils.getQBSplinePoints(d),
        f = P.PlotUtils.getQBSplinePoints(f),
        newArray = xp.algorithm.array2Dto1D(d.concat(i, f.reverse(), [this.swallowTailPnt, d[0]]));
        result.polygonalPoint = Cesium.Cartesian3.fromDegreesArray(newArray);
    }
    return result;
},
xp.algorithm.getAttackArrowHeadPoints = function (t, o, e, defaultParam) {
    this.headHeightFactor = defaultParam.headHeightFactor;
    this.headTailFactor = defaultParam.headTailFactor;
    this.headWidthFactor = defaultParam.headWidthFactor;
    this.neckWidthFactor = defaultParam.neckWidthFactor;
    this.neckHeightFactor = defaultParam.neckHeightFactor;
    var r = P.PlotUtils.getBaseLength(t),
    n = r * this.headHeightFactor,
    g = t[t.length - 1];
    r = P.PlotUtils.distance(g, t[t.length - 2]);
    var i = P.PlotUtils.distance(o, e);
    n > i * this.headTailFactor && (n = i * this.headTailFactor);
    var s = n * this.headWidthFactor,
    a = n * this.neckWidthFactor;
    n = n > r ? r : n;
    var l = n * this.neckHeightFactor,
    u = P.PlotUtils.getThirdPoint(t[t.length - 2], g, 0, n, !0),
    c = P.PlotUtils.getThirdPoint(t[t.length - 2], g, 0, l, !0),
    p = P.PlotUtils.getThirdPoint(g, u, P.Constants.HALF_PI, s, !1),
    h = P.PlotUtils.getThirdPoint(g, u, P.Constants.HALF_PI, s, !0),
    d = P.PlotUtils.getThirdPoint(g, c, P.Constants.HALF_PI, a, !1),
    f = P.PlotUtils.getThirdPoint(g, c, P.Constants.HALF_PI, a, !0);
    return [d, p, g, h, f]
},
xp.algorithm.getAttackArrowBodyPoints = function (t, o, e, r) {
    for (var n = P.PlotUtils.wholeDistance(t), g = P.PlotUtils.getBaseLength(t), i = g * r, s = P.PlotUtils.distance(o, e), a = (i - s) / 2, l = 0, u = [], c = [], p = 1; p < t.length - 1; p++) {
        var h = P.PlotUtils.getAngleOfThreePoints(t[p - 1], t[p], t[p + 1]) / 2;
        l += P.PlotUtils.distance(t[p - 1], t[p]);
        var d = (i / 2 - l / n * a) / Math.sin(h),
        f = P.PlotUtils.getThirdPoint(t[p - 1], t[p], Math.PI - h, d, !0),
        E = P.PlotUtils.getThirdPoint(t[p - 1], t[p], h, d, !1);
        u.push(f),
        c.push(E)
    }
    return u.concat(c)
},
xp.algorithm.dereplication = function (array) {
    var last = array[array.length - 1];
    var change = false;
    var newArray = [];
    newArray = array.filter(function (i) {
        if (i[0] != last[0] && i[1] != last[1]) {
            return i;
        }
        change = true;
    });
    if (change) newArray.push(last);
    return newArray;
},
xp.algorithm.fineArrow = function (tailPoint, headerPoint) {
    if ((tailPoint.length < 2) || (headerPoint.length < 2)) return;
    //画箭头的函数
    let tailWidthFactor = fineArrowDefualParam.tailWidthFactor;
    let neckWidthFactor = fineArrowDefualParam.neckWidthFactor;
    let headWidthFactor = fineArrowDefualParam.headWidthFactor;
    let headAngle = fineArrowDefualParam.headAngle;
    let neckAngle = fineArrowDefualParam.neckAngle;
    var o = [];
    o[0] = tailPoint;
    o[1] = headerPoint;
    e = o[0],
    r = o[1],
    n = P.PlotUtils.getBaseLength(o),
    g = n * tailWidthFactor,
    //尾部宽度因子
    i = n * neckWidthFactor,
    //脖子宽度银子
    s = n * headWidthFactor,
    //头部宽度因子
    a = P.PlotUtils.getThirdPoint(r, e, P.Constants.HALF_PI, g, !0),
    l = P.PlotUtils.getThirdPoint(r, e, P.Constants.HALF_PI, g, !1),
    u = P.PlotUtils.getThirdPoint(e, r, headAngle, s, !1),
    c = P.PlotUtils.getThirdPoint(e, r, headAngle, s, !0),
    p = P.PlotUtils.getThirdPoint(e, r, neckAngle, i, !1),
    h = P.PlotUtils.getThirdPoint(e, r, neckAngle, i, !0),
    d = [];
    d.push(a[0], a[1], p[0], p[1], u[0], u[1], r[0], r[1], c[0], c[1], h[0], h[1], l[0], l[1], e[0], e[1]);
    return Cesium.Cartesian3.fromDegreesArray(d);
}
var P = {version: "1.0.0"}
P.PlotUtils = {}, P.PlotUtils.distance = function(t, o) {
	return Math.sqrt(Math.pow(t[0] - o[0], 2) + Math.pow(t[1] - o[1], 2))
}, P.PlotUtils.wholeDistance = function(t) {
	for (var o = 0, e = 0; e < t.length - 1; e++) o += P.PlotUtils.distance(t[e], t[e + 1]);
	return o
}, P.PlotUtils.getBaseLength = function(t) {
	return Math.pow(P.PlotUtils.wholeDistance(t), .99)
}, P.PlotUtils.mid = function(t, o) {
	return [(t[0] + o[0]) / 2, (t[1] + o[1]) / 2]
}, P.PlotUtils.getCircleCenterOfThreePoints = function(t, o, e) {
	var r = [(t[0] + o[0]) / 2, (t[1] + o[1]) / 2],
		n = [r[0] - t[1] + o[1], r[1] + t[0] - o[0]],
		g = [(t[0] + e[0]) / 2, (t[1] + e[1]) / 2],
		i = [g[0] - t[1] + e[1], g[1] + t[0] - e[0]];
	return P.PlotUtils.getIntersectPoint(r, n, g, i)
}, P.PlotUtils.getIntersectPoint = function(t, o, e, r) {
	if (t[1] == o[1]) {
		var n = (r[0] - e[0]) / (r[1] - e[1]),
			g = n * (t[1] - e[1]) + e[0],
			i = t[1];
		return [g, i]
	}
	if (e[1] == r[1]) {
		var s = (o[0] - t[0]) / (o[1] - t[1]);
		return g = s * (e[1] - t[1]) + t[0], i = e[1], [g, i]
	}
	return s = (o[0] - t[0]) / (o[1] - t[1]), n = (r[0] - e[0]) / (r[1] - e[1]), i = (s * t[1] - t[0] - n * e[1] + e[0]) / (s - n), g = s * i - s * t[1] + t[0], [g, i]
}, P.PlotUtils.getAzimuth = function(t, o) {
	var e, r = Math.asin(Math.abs(o[1] - t[1]) / P.PlotUtils.distance(t, o));
	return o[1] >= t[1] && o[0] >= t[0] ? e = r + Math.PI : o[1] >= t[1] && o[0] < t[0] ? e = P.Constants.TWO_PI - r : o[1] < t[1] && o[0] < t[0] ? e = r : o[1] < t[1] && o[0] >= t[0] && (e = Math.PI - r), e
}, P.PlotUtils.getAngleOfThreePoints = function(t, o, e) {
	var r = P.PlotUtils.getAzimuth(o, t) - P.PlotUtils.getAzimuth(o, e);
	return 0 > r ? r + P.Constants.TWO_PI : r
}, P.PlotUtils.isClockWise = function(t, o, e) {
	return (e[1] - t[1]) * (o[0] - t[0]) > (o[1] - t[1]) * (e[0] - t[0])
}, P.PlotUtils.getPointOnLine = function(t, o, e) {
	var r = o[0] + t * (e[0] - o[0]),
		n = o[1] + t * (e[1] - o[1]);
	return [r, n]
}, P.PlotUtils.getCubicValue = function(t, o, e, r, n) {
	t = Math.max(Math.min(t, 1), 0);
	var g = 1 - t,
		i = t * t,
		s = i * t,
		a = g * g,
		l = a * g,
		u = l * o[0] + 3 * a * t * e[0] + 3 * g * i * r[0] + s * n[0],
		c = l * o[1] + 3 * a * t * e[1] + 3 * g * i * r[1] + s * n[1];
	return [u, c]
}, P.PlotUtils.getThirdPoint = function(t, o, e, r, n) {
	var g = P.PlotUtils.getAzimuth(t, o),
		i = n ? g + e : g - e,
		s = r * Math.cos(i),
		a = r * Math.sin(i);
	return [o[0] + s, o[1] + a]
}, P.PlotUtils.getArcPoints = function(t, o, e, r) {
	var n, g, i = [],
		s = r - e;
	s = 0 > s ? s + P.Constants.TWO_PI : s;
	for (var a = 0; a <= P.Constants.FITTING_COUNT; a++) {
		var l = e + s * a / P.Constants.FITTING_COUNT;
		n = t[0] + o * Math.cos(l), g = t[1] + o * Math.sin(l), i.push([n, g])
	}
	return i
}, P.PlotUtils.getBisectorNormals = function(t, o, e, r) {
	var n = P.PlotUtils.getNormal(o, e, r),
		g = Math.sqrt(n[0] * n[0] + n[1] * n[1]),
		i = n[0] / g,
		s = n[1] / g,
		a = P.PlotUtils.distance(o, e),
		l = P.PlotUtils.distance(e, r);
	if (g > P.Constants.ZERO_TOLERANCE) if (P.PlotUtils.isClockWise(o, e, r)) {
		var u = t * a,
			c = e[0] - u * s,
			p = e[1] + u * i,
			h = [c, p];
		u = t * l, c = e[0] + u * s, p = e[1] - u * i;
		var d = [c, p]
	} else u = t * a, c = e[0] + u * s, p = e[1] - u * i, h = [c, p], u = t * l, c = e[0] - u * s, p = e[1] + u * i, d = [c, p];
	else c = e[0] + t * (o[0] - e[0]), p = e[1] + t * (o[1] - e[1]), h = [c, p], c = e[0] + t * (r[0] - e[0]), p = e[1] + t * (r[1] - e[1]), d = [c, p];
	return [h, d]
}, P.PlotUtils.getNormal = function(t, o, e) {
	var r = t[0] - o[0],
		n = t[1] - o[1],
		g = Math.sqrt(r * r + n * n);
	r /= g, n /= g;
	var i = e[0] - o[0],
		s = e[1] - o[1],
		a = Math.sqrt(i * i + s * s);
	i /= a, s /= a;
	var l = r + i,
		u = n + s;
	return [l, u]
}, P.PlotUtils.getCurvePoints = function(t, o) {
	for (var e = P.PlotUtils.getLeftMostControlPoint(o), r = [e], n = 0; n < o.length - 2; n++) {
		var g = o[n],
			i = o[n + 1],
			s = o[n + 2],
			a = P.PlotUtils.getBisectorNormals(t, g, i, s);
		r = r.concat(a)
	}
	var l = P.PlotUtils.getRightMostControlPoint(o);
	r.push(l);
	var u = [];
	for (n = 0; n < o.length - 1; n++) {
		g = o[n], i = o[n + 1], u.push(g);
		for (var t = 0; t < P.Constants.FITTING_COUNT; t++) {
			var c = P.PlotUtils.getCubicValue(t / P.Constants.FITTING_COUNT, g, r[2 * n], r[2 * n + 1], i);
			u.push(c)
		}
		u.push(i)
	}
	return u
}, P.PlotUtils.getLeftMostControlPoint = function(o) {
	var e = o[0],
		r = o[1],
		n = o[2],
		g = P.PlotUtils.getBisectorNormals(0, e, r, n),
		i = g[0],
		s = P.PlotUtils.getNormal(e, r, n),
		a = Math.sqrt(s[0] * s[0] + s[1] * s[1]);
	if (a > P.Constants.ZERO_TOLERANCE) var l = P.PlotUtils.mid(e, r),
		u = e[0] - l[0],
		c = e[1] - l[1],
		p = P.PlotUtils.distance(e, r),
		h = 2 / p,
		d = -h * c,
		f = h * u,
		E = d * d - f * f,
		v = 2 * d * f,
		A = f * f - d * d,
		_ = i[0] - l[0],
		y = i[1] - l[1],
		m = l[0] + E * _ + v * y,
		O = l[1] + v * _ + A * y;
	else m = e[0] + t * (r[0] - e[0]), O = e[1] + t * (r[1] - e[1]);
	return [m, O]
}, P.PlotUtils.getRightMostControlPoint = function(o) {
	var e = o.length,
		r = o[e - 3],
		n = o[e - 2],
		g = o[e - 1],
		i = P.PlotUtils.getBisectorNormals(0, r, n, g),
		s = i[1],
		a = P.PlotUtils.getNormal(r, n, g),
		l = Math.sqrt(a[0] * a[0] + a[1] * a[1]);
	if (l > P.Constants.ZERO_TOLERANCE) var u = P.PlotUtils.mid(n, g),
		c = g[0] - u[0],
		p = g[1] - u[1],
		h = P.PlotUtils.distance(n, g),
		d = 2 / h,
		f = -d * p,
		E = d * c,
		v = f * f - E * E,
		A = 2 * f * E,
		_ = E * E - f * f,
		y = s[0] - u[0],
		m = s[1] - u[1],
		O = u[0] + v * y + A * m,
		T = u[1] + A * y + _ * m;
	else O = g[0] + t * (n[0] - g[0]), T = g[1] + t * (n[1] - g[1]);
	return [O, T]
}, P.PlotUtils.getBezierPoints = function(t) {
	if (t.length <= 2) return t;
	for (var o = [], e = t.length - 1, r = 0; 1 >= r; r += .01) {
		for (var n = y = 0, g = 0; e >= g; g++) {
			var i = P.PlotUtils.getBinomialFactor(e, g),
				s = Math.pow(r, g),
				a = Math.pow(1 - r, e - g);
			n += i * s * a * t[g][0], y += i * s * a * t[g][1]
		}
		o.push([n, y])
	}
	return o.push(t[e]), o
}, P.PlotUtils.getBinomialFactor = function(t, o) {
	return P.PlotUtils.getFactorial(t) / (P.PlotUtils.getFactorial(o) * P.PlotUtils.getFactorial(t - o))
}, P.PlotUtils.getFactorial = function(t) {
	if (1 >= t) return 1;
	if (2 == t) return 2;
	if (3 == t) return 6;
	if (4 == t) return 24;
	if (5 == t) return 120;
	for (var o = 1, e = 1; t >= e; e++) o *= e;
	return o
}, P.PlotUtils.getQBSplinePoints = function(t) {
	if (t.length <= 2) return t;
	var o = 2,
		e = [],
		r = t.length - o - 1;
	e.push(t[0]);
	for (var n = 0; r >= n; n++) for (var g = 0; 1 >= g; g += .05) {
		for (var i = y = 0, s = 0; o >= s; s++) {
			var a = P.PlotUtils.getQuadricBSplineFactor(s, g);
			i += a * t[n + s][0], y += a * t[n + s][1]
		}
		e.push([i, y])
	}
	return e.push(t[t.length - 1]), e
}, P.PlotUtils.getQuadricBSplineFactor = function(t, o) {
	return 0 == t ? Math.pow(o - 1, 2) / 2 : 1 == t ? (-2 * Math.pow(o, 2) + 2 * o + 1) / 2 : 2 == t ? Math.pow(o, 2) / 2 : 0
},P.Constants = {
	TWO_PI: 2 * Math.PI,
	HALF_PI: Math.PI / 2,
	FITTING_COUNT: 100,
	ZERO_TOLERANCE: 1e-4
}