/**
 * Created by bingqixuan on 2018/5/3.
 */

const {Cartesian3, Cartographic} = require('cesium');

/**
 * 计算Polygon的质心
 * @param positions [Array]
 * @returns {Cartographic}
 */
const computeCentroidOfPolygon = function (positions) {
    let x = [];
    let y = [];

    for (let i = 0; i < positions.length; i++) {
        let cartographic = Cartographic.fromCartesian(positions[i]);

        x.push(cartographic.longitude);
        y.push(cartographic.latitude);
    }

    let x0 = 0.0, y0 = 0.0, x1 = 0.0, y1 = 0.0;
    let signedArea = 0.0;
    let a = 0.0;
    let centroidx = 0.0, centroidy = 0.0;

    for (i = 0; i < positions.length; i++) {
        x0 = x[i];
        y0 = y[i];

        if (i === positions.length - 1) {
            x1 = x[0];
            y1 = y[0];
        } else {
            x1 = x[i + 1];
            y1 = y[i + 1];
        }

        a = x0 * y1 - x1 * y0;
        signedArea += a;
        centroidx += (x0 + x1) * a;
        centroidy += (y0 + y1) * a;
    }

    signedArea *= 0.5;
    centroidx /= (6.0 * signedArea);
    centroidy /= (6.0 * signedArea);

    return new Cartographic(centroidx, centroidy);
};

/**
 * 计算三角形面积
 * @param pos1 {Cartesian3} 第一点
 * @param pos2 {Cartesian3} 第二点
 * @param pos3 {Cartesian3} 第三点
 * @returns {number}
 */
const computeAreaOfTriangle = function (pos1, pos2, pos3) {
    let a = Cartesian3.distance(pos1, pos2);
    let b = Cartesian3.distance(pos2, pos3);
    let c = Cartesian3.distance(pos3, pos1);

    let S = (a + b + c) / 2;

    return Math.sqrt(S * (S - a) * (S - b) * (S - c));
};

module.exports = {
    computeAreaOfTriangle: computeAreaOfTriangle,
    computeCentroidOfPolygon: computeCentroidOfPolygon
};