import * as satellitejs from "../libs/satellite.es.js";

export default class Orbit {
  constructor(name, tle) {
    this.name = name;
    this.tle = tle.split("\n");
    this.satrec = satellitejs.twoline2satrec(this.tle[1], this.tle[2]);
  }

  get satnum() {
    return this.satrec.satnum;
  }

  get orbitalPeriod() {
    const meanMotionRad = this.satrec.no;
    const period = 2 * Math.PI / meanMotionRad;
    return period;
  }

  positionECI(time) {
    return satellitejs.propagate(this.satrec, time).position;
  }

  positionECF(time) {
    const positionEci = this.positionECI(time);
    const gmst = satellitejs.gstime(time);
    const positionEcf = satellitejs.eciToEcf(positionEci, gmst);
    return positionEcf;
  }

  positionGeodetic(time) {
    const positionEci = this.positionECI(time);
    const gmst = satellitejs.gstime(time);
    const positionGd = satellitejs.eciToGeodetic(positionEci, gmst);

    return {
      longitude: positionGd.longitude,
      latitude: positionGd.latitude,
      height: positionGd.height * 1000,
    };
  }

  computeGeodeticPositionVelocity(timestamp) {
    const positionAndVelocity = satellitejs.propagate(this.satrec, timestamp);
    const positionEci = positionAndVelocity.position;
    const velocityEci = positionAndVelocity.velocity;

    const gmst = satellitejs.gstime(timestamp);
    const positionGd = satellitejs.eciToGeodetic(positionEci, gmst);
    const velocityGd = satellitejs.eciToGeodetic(velocityEci, gmst);
    const velocity = Math.sqrt(velocityGd.longitude * velocityGd.longitude +
      velocityGd.latitude * velocityGd.latitude +
      velocityGd.height * velocityGd.height);

    return {
      longitude: positionGd.longitude,
      latitude: positionGd.latitude,
      height: positionGd.height * 1000,
      velocity
    };
  }

  //距离
 dataDistance(point1, point2) {
    let ss = false;
    try {
      var point1cartographic = Cesium.Cartographic.fromCartesian(point1);
      var point2cartographic = Cesium.Cartographic.fromCartesian(point2);
      /**根据经纬度计算出距离**/
      var geodesic = new Cesium.EllipsoidGeodesic();
      geodesic.setEndPoints(point1cartographic, point2cartographic);
      var s = geodesic.surfaceDistance;
      //console.log(Math.sqrt(Math.pow(distance, 2) + Math.pow(endheight, 2)));
      //返回两点之间的距离
      ss = Math.sqrt(Math.pow(s, 2) + Math.pow(point2cartographic.height - point1cartographic.height, 2));
     
    } catch (error) {
      console.log(error);
    }
    return ss;
  }

  computePasses(groundStation,
    startDate = dayjs().toDate(),
    endDate = dayjs(startDate).add(7, "day").toDate(),
    minElevation = 1,
    maxPasses = 50) {

    const deg2rad = (Math.PI/180);
    //let cartographic = Cesium.Cartographic.fromCartesian({x:groundStation.longitude,y:groundStation.latitude,z:groundStation.height});
    groundStation.latitude *= deg2rad;
    groundStation.longitude *= deg2rad;
    groundStation.height /= 1000;

    let date = startDate;
    let passes = [];
    let pass = false;
    let passa = false;
    let ongoingPass = false;
    let lastElevation = 0;
    while (date < endDate) {
      try {
        const positionEcf = this.positionECF(date);
        const positionGeo = this.positionGeodetic(date);
       // const positionEci = this.positionECI(date);
        const lookAngles = satellitejs.ecfToLookAngles(groundStation, positionEcf);
       
        let distance = this.dataDistance({x:positionGeo.longitude,y:positionGeo.latitude,z:positionGeo.height}, {x:groundStation.longitude,y:groundStation.latitude,z:groundStation.height}); //距离
        if(distance){
            //经过
            if((distance/1000) < parseInt(groundStation.zyjl)){
              if(!ongoingPass){ //开始第一次
                pass = {
                  name: this.name,
                  start: date.getTime(),
                  azimuthStart: lookAngles.azimuth,
                  // maxElevation: elevation,
                  azimuthApex: lookAngles.azimuth,
                    //pass.maxElevation = elevation;
                  startPosition : {x:positionGeo.longitude,y:positionGeo.latitude,z:positionGeo.height},
                };
                ongoingPass = true;
              }else{
                //经过
                pass.azimuthApex = lookAngles.azimuth;
              }
              passa = true;
            }else{//结束
              if(passa){
                if(ongoingPass){
                    pass.end = date.getTime();
                    pass.duration = pass.end - pass.start;
                    pass.azimuthEnd = lookAngles.azimuth;
                    pass.azimuthStart /= deg2rad;
                    pass.azimuthApex /= deg2rad;
                    pass.azimuthEnd /= deg2rad;
                    pass.endPosition = {x:positionGeo.longitude,y:positionGeo.latitude,z:positionGeo.height};
                    passes.push(pass);
                    passa = false;
                    ongoingPass = false;
                }
              }
            } 
        }
        date.setSeconds(date.getSeconds() + 5); //每5秒
        if (passes.length > maxPasses) {
            break;
        }
      } catch (error) {
        console.log(error);
      }
    }
     console.log(passes);
     return passes;
   }
  
    computeOrbitPasses(groundStation,
      startDate,
      endDate,
      minElevation = 1,
      maxPasses = 50) {
      if(!startDate){
        startDate = dayjs().toDate();
      }else{
        startDate = dayjs(startDate).toDate()
      }
      if(!endDate){
        endDate = dayjs(startDate).add(1, "day").toDate();
      }else{
        endDate = dayjs(endDate).toDate()
      }
      const deg2rad = (Math.PI/180);
      groundStation.latitude *= deg2rad;
      groundStation.longitude *= deg2rad;
      groundStation.height /= 1000;

      let date = startDate;
      let passes = [];
      let pass = false;
      let ongoingPass = false;
      let lastElevation = 0;
      while (date < endDate) {
        const positionEcf = this.positionECF(date);
        const positionGeo = this.positionGeodetic(date);
        const lookAngles = satellitejs.ecfToLookAngles(groundStation, positionEcf);
        const elevation = lookAngles.elevation / deg2rad;

        if (elevation > 0) {
          if (!ongoingPass) {
            // Start of new pass
            pass = {
              name: this.name,
              start: date.getTime(),
              oid : Cesium.createGuid(),
              azimuthStart: lookAngles.azimuth,
              maxElevation: elevation,
              azimuthApex: lookAngles.azimuth,
              // startPosition : {x:positionGeo.longitude,y:positionGeo.latitude,z:positionGeo.height}
            };
            ongoingPass = true;
          } else {
            // Ongoing pass
            if (elevation > pass.maxElevation) {
              pass.maxElevation = elevation;
              pass.azimuthApex = lookAngles.azimuth;
            }
          }
          date.setSeconds(date.getSeconds() + 5);
        } else {
          if (ongoingPass) {
            // End of pass
            if (pass.maxElevation > minElevation) {
              pass.end = date.getTime();
              pass.duration = pass.end - pass.start;
              pass.azimuthEnd = lookAngles.azimuth;
              pass.azimuthStart /= deg2rad;
              pass.azimuthApex /= deg2rad;
              pass.azimuthEnd /= deg2rad;
             // pass.endPosition = {x:positionGeo.longitude,y:positionGeo.latitude,z:positionGeo.height};
              passes.push(pass);
              if (passes.length > maxPasses) {
                break;
              }
            }
            ongoingPass = false;
            lastElevation = -180;
            date.setMinutes(date.getMinutes() + this.orbitalPeriod * 0.75);
          } else {
            let deltaElevation = elevation - lastElevation;
            lastElevation = elevation;
            if (deltaElevation < 0) {
              date.setMinutes(date.getMinutes() + this.orbitalPeriod * 0.75);
              lastElevation = -180;
            } else if (elevation < -20) {
              date.setMinutes(date.getMinutes() + 5);
            } else if (elevation < -5) {
              date.setMinutes(date.getMinutes() + 1);
            } else if (elevation < -1) {
              date.setSeconds(date.getSeconds() + 5);
            } else {
              date.setSeconds(date.getSeconds() + 2);
            }
          }
        }
    }
    return passes;
  }
}
