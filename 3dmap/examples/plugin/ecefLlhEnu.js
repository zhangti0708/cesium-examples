
function mathTool() {
    this.PI = 3.141592653589793238;
    this.a = 6378137.0;
    this.b = 6356752.3142
    this.f = (this.a - this.b) / this.a;
    this.e_sq = this.f * (2.0 - this.f);
    this.ee = 0.00669437999013;
    this.WGSF = 1 / 298.257223563;
    this.WGSe2 = this.WGSF * (2 - this.WGSF);
    this.WGSa = 6378137.00000;
    this.EPSILON = 1.0e-12;
}

/*
*解算坐标
*@point 原点
*@azimuth 方位角
*@elevation 仰角
*@distance 距离
*/
mathTool.prototype.CalculateCoordinates = function (point, azimuth, elevation, distance) {
    let vertical_height = distance * Math.sin(2 * this.PI / 360 * elevation);//垂直高度
    let horizontal_distance = distance * Math.cos(2 * this.PI / 360 * elevation);//水平距离
    if (azimuth > 360) azimuth = azimuth % 360;
    if (azimuth < 0) azimuth = 360 + (azimuth % 360);

    let point = this.lonLat2WebMercator(point);
    let lnglat = null;

    if (azimuth <= 90) {//第四象限
        let x_length = horizontal_distance * Math.cos(2 * this.PI / 360 * azimuth);
        let y_length = horizontal_distance * Math.sin(2 * this.PI / 360 * azimuth);
        lnglat = {
            x: point.x + x_length,
            y: point.y - y_length
        }
    } else if (azimuth > 90 && azimuth <= 180) {//第三象限
        let x_length = horizontal_distance * Math.sin(2 * this.PI / 360 * (azimuth - 90));
        let y_length = horizontal_distance * Math.cos(2 * this.PI / 360 * (azimuth - 90));
        lnglat = {
            x: point.x - x_length,
            y: point.y - y_length
        }
    } else if (azimuth > 180 && azimuth <= 270) {//第二象限
        let x_length = horizontal_distance * Math.cos(2 * this.PI / 360 * (azimuth - 180));
        let y_length = horizontal_distance * Math.sin(2 * this.PI / 360 * (azimuth - 180));
        lnglat = {
            x: point.x - x_length,
            y: point.y + y_length
        }
    } else {//第一象限
        let x_length = horizontal_distance * Math.sin(2 * this.PI / 360 * (azimuth - 270));
        let y_length = horizontal_distance * Math.cos(2 * this.PI / 360 * (azimuth - 270));
        lnglat = {
            x: point.x + x_length,
            y: point.y + y_length
        }
    }
    lnglat = this.webMercator2LonLat(lnglat);
    return {
        lng: lnglat.x,
        lat: lnglat.y,
        height: vertical_height
    }
}
/*
    *经纬度转Web墨卡托
    *@lonLat 经纬度
    */
mathTool.prototype.lonLat2WebMercator = function (lonLat) {
    let x = lonLat.x * this.a / 180;
    let y = Math.log(Math.tan((90 + lonLat.y) * this.PI / 360)) / (this.PI / 180);
    y = y * this.a / 180;
    return {
        x: x,
        y: y
    }
}
/*
    *Web墨卡托转经纬度
    *@mercator 平面坐标
    */
mathTool.prototype.webMercator2LonLat = function (mercator) {
    let x = mercator.x / this.a * 180;
    let y = mercator.y / this.a * 180;
    y = 180 / this.PI * (2 * (Math.exp(y * this.PI / 180)) - this.PI / 2);
    return {
        x: x,
        y: y
    }
}

mathTool.prototype.get_atan = function (z, y) {
    let x;
    if (z == 0) {
        x = this.PI / 2;
    } else {
        if (y == 0) {
            x = this.PI;
        } else {
            x = Math.atan(Math.abs(y / z));
            if ((y > 0) && (z < 0)) {
                x = this.PI - x;
            } else if ((y < 0) && (z < 0)) {
                x = this.PI + x;
            } else if ((y < 0) && (z > 0)) {
                x = 2 * this.M_PI - x;
            }
        }
    }
    return x;
}
//WGS84转ECEF坐标系
mathTool.prototype.ConvertLLAToXYZ = function (LLACoor) {
    let lon = this.PI / 180 * LLACoor.longitude;
    let lat = this.PI / 180 * LLACoor.latitude;
    let H = LLACoor.altitude;
    let N0 = this.a / Math.sqrt(1.0 - this.ee * Math.sin(lat) * Math.sin(lat));
    let x = (N0 + H) * Math.cos(lat) * Math.cos(lon);
    let y = (N0 + H) * Math.cos(lat) * Math.sin(lon);
    let z = (N0 * (1.0 - this.ee) + H) * Math.sin(lat);
    return {
        x: x,
        y: y,
        z: z
    }
}

//ECEF坐标系转WGS84
mathTool.prototype.ConvertXYZToLLA = function (XYZCoor) {
    let longitude = this.get_atan(XYZCoor.x, XYZCoor.y);
    if (longitude < 0) {
        longitude = longitude + this.PI;
    }
    let latitude = this.get_atan(Math.sqrt(XYZCoor.x * XYZCoor.x + XYZCoor.y * XYZCoor.y), XYZCoor.z);

    let W = Math.sqrt(1 - this.WGSe2 * Math.sin(latitude) * Math.sin(latitude));
    let N = this.WGSa / W;
    let B1;
    do {
        B1 = latitude;
        W = Math.sqrt(1 - this.WGSe2 * Math.sin(B1) * Math.sin(B1));
        N = this.WGSa / W;
        latitude = this.get_atan(Math.sqrt(XYZCoor.x * XYZCoor.x + XYZCoor.y * XYZCoor.y), (XYZCoor.z + N * this.WGSe2 * Math.sin(B1)));
    }
    while (Math.abs(latitude - B1) > this.EPSILON);

    altitude = Math.sqrt(XYZCoor.x * XYZCoor.x + XYZCoor.y * XYZCoor.y) / Math.cos(latitude) - this.WGSa / Math.sqrt(1 - this.WGSe2 * Math.sin(latitude) * Math.sin(latitude));

    return {
        longitude: longitude * 180 / this.PI,
        latitude: latitude * 180 / this.PI,
        altitude: altitude
    }
}
/*北东天坐标系转WGS84
@ a A点坐标
@ p 相对参数，距离、方位角、仰角
*/
mathTool.prototype.enu_to_ecef = function (a, p) {
    //距离
    let distance = p.distance;
    //方位角
    let azimuth = p.azimuth;
    //仰角
    let elevation = p.elevation;

    let zUp = elevation >= 0 ? distance * Math.sin(this.PI / 180 * elevation) : (-1) * distance * Math.sin(this.PI / 180 * Math, abs(elevation));

    let d = distance * Math.cos(this.PI / 180 * Math.abs(elevation));
    let xEast;
    let yNorth;
    if (azimuth <= 90) {
        xEast = d * Math.sin(this.PI / 180 * azimuth);
        yNorth = d * Math.cos(this.PI / 180 * azimuth);
    } else if (azimuth > 90 && azimuth < 180) {
        xEast = d * Math.cos(this.PI / 180 * (azimuth - 90));
        yNorth = (-1)*d * Math.sin(this.PI / 180 * (azimuth - 90));
    } else if (azimuth > 180 && azimuth < 270) {
        xEast = (-1) * d * Math.sin(this.PI / 180 * (azimuth - 180));
        yNorth =(-1) *  d * Math.cos(this.PI / 180 * (azimuth - 180));
    } else {
        xEast = (-1) * d * Math.sin(this.PI / 180 * (360 - azimuth));
        yNorth =  d * Math.cos(this.PI / 180 * (360 - azimuth));
    }

    let lamb = this.radians(a.latitude);
    let phi = this.radians(a.longitude);
    let h0 = a.altitude;

    let s = Math.sin(lamb);
    let N = this.a / Math.sqrt(1.0 - this.e_sq * s * s);

    let sin_lambda = Math.sin(lamb);
    let cos_lambda = Math.cos(lamb);

    let sin_phi = Math.sin(phi);
    let cos_phi = Math.cos(phi);

    let x0 = (h0 + N) * cos_lambda * cos_phi;
    let y0 = (h0 + N) * cos_lambda * sin_phi;
    let z0 = (h0 + (1 - this.e_sq) * N) * sin_lambda;

    let t = cos_lambda * zUp - sin_lambda * yNorth;

    let zd = sin_lambda * zUp + cos_lambda * yNorth;
    let xd = cos_phi * t - sin_phi * xEast;
    let yd = sin_phi * t + cos_phi * xEast;

    return this.ConvertXYZToLLA({
        x: xd + x0,
        y: yd + y0,
        z: zd + z0
    })
}
mathTool.prototype.radians = function (degree) {
    return this.PI / 180 * degree;
}