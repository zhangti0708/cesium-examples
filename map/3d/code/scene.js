/*
 * @Descripttion: 
 * @version: 1.0
 * @Author: zhangti
 * @Date: 2019-09-29 11:55:55
 * @LastEditors  : sueRimn
 * @LastEditTime : 2020-01-02 14:04:12
 */
/**
 * 场景控制封装
 * 
 * 封装一些常用场景
 * 场景控制
 * 
 * 可以通过场景树挂载
 */
import Rain from './rain.js';
import Snow from './snow.js';

var _self;
export default class Scene{
   
    constructor(core){
         /**
         * 状态码
         */
        this.STATUS = {
            CREATE : "No",
            CLOSE : "Off"
        }
        /**
         * core
         */
        this.CoreV = core;
        /**
         * 场景
         */
        this.S = core.scene;
        /**
         * 影像
         */
        this.imageryLayers = this.CoreV.imageryLayers;
        /**
         * 参数
         */
        this._snow = null;
        this._rain = null;
        this._rota = null;
        _self = this;
    }
    rotate(){
        let a = .1;
        let t = Date.now();
        let n = (t - _self._rota) / 1e3;
        _self._rota = t;
        _self.S.camera.rotate(Cesium.Cartesian3.UNIT_Z, -a * n);
    }
    /**
     * 地球自转
     */
    rotation(opt){
        if(opt.cmd == _self.STATUS.CREATE){
            _self._rota = Date.now();
            _self.CoreV.clock.onTick.addEventListener(_self.rotate);
        }
        if(opt.cmd == _self.STATUS.CLOSE){
            _self.CoreV.clock.onTick.removeEventListener(_self.rotate);
        } 
    }
    /**
     * 雾天
     */
    fog(opt){
        let _self = this;
        if(opt.cmd == _self.STATUS.CREATE){
            _self.S.fog.enabled = true;
        }
        if(opt.cmd == _self.STATUS.CLOSE){
            _self.S.fog.enabled = false;
        } 
    }
    /**
     * 昼夜
     */
    lighting(opt){
        let _self = this;
        if(opt.cmd == _self.STATUS.CREATE){
            _self.S.globe.enableLighting = true;
        }
        if(opt.cmd == _self.STATUS.CLOSE){
            _self.S.globe.enableLighting = false;
        } 
    }
   /**
     * 大气层
     */
    groundAtmosphere(opt){
        let _self = this;
        if(opt.cmd == _self.STATUS.CREATE){
            _self.S.globe.showGroundAtmosphere = true;
        }
        if(opt.cmd == _self.STATUS.CLOSE){
            _self.S.globe.showGroundAtmosphere = false;
        } 
    }
    /**
     * 地球
     */
    globe(opt){
        let _self = this;
        if(opt.cmd == _self.STATUS.CREATE){
            _self.S.globe.show = true;
        }
        if(opt.cmd == _self.STATUS.CLOSE){
            _self.S.globe.show = false;
        } 
    }
    /**
     * 星空
     */
    skyBox(opt){
        let _self = this;
        if(opt.cmd == _self.STATUS.CREATE){
            _self.S.skyBox.show = true;
        }
        if(opt.cmd == _self.STATUS.CLOSE){
            _self.S.skyBox.show = false;
        } 
    }
    /**
     * 太阳
     */
    sun(opt){
        let _self = this;
        if(opt.cmd == _self.STATUS.CREATE){
            _self.S.sun.show = true;
        }
        if(opt.cmd == _self.STATUS.CLOSE){
            _self.S.sun.show = false;
        }  
    }
    /**
     * 地形遮挡
     */
    depthTestAgainstTerrain(opt){
        let _self = this;
        if(opt.cmd == _self.STATUS.CREATE){
            _self.S.globe.depthTestAgainstTerrain = true;
        }
        if(opt.cmd == _self.STATUS.CLOSE){
            _self.S.globe.depthTestAgainstTerrain = false;
        }   
    }
    /**
     * 雨天
     */
    rain(opt){
        let _self = this;
        if(opt.cmd == _self.STATUS.CREATE){
            _self._rain = new Rain(_self.CoreV);
        }
        if(opt.cmd == _self.STATUS.CLOSE){
            if(_self._rain){
                _self._rain.remove();
            }
        }    
    }
     /**
      * 雪天
      */
     snow(opt){
        let _self = this;
        if(opt.cmd == _self.STATUS.CREATE){
            _self._snow = new Snow(_self.CoreV);
        }
        if(opt.cmd == _self.STATUS.CLOSE){
           if(_self._snow){
             _self._snow.remove();
           }
        }      
     }
     /**
      * 经纬网
      */
     grid(opt){
        let _self = this;
        if(opt.cmd == _self.STATUS.CREATE){
            let mapGrid = new Cesium.GridImageryProvider();
            _self.layerGrid = _self.imageryLayers.addImageryProvider(mapGrid);//添加注记图层
            //_self.imageryLayers.grid.data = layer;
            _self.imageryLayers.raiseToTop(_self.layerGrid);       //将注记图层置顶
        }
        if(opt.cmd == _self.STATUS.CLOSE){
            _self.imageryLayers.remove(_self.layerGrid);
        }
        //return _self.layer;
     }
      /**
      * 经纬网2
      */
     tileGrid(opt){
        let _self = this;
        if(opt.cmd == _self.STATUS.CREATE){
            let mapGrid = new TileLonlatsImageryProvider();
            _self.layerTileGrid = _self.imageryLayers.addImageryProvider(mapGrid);//添加注记图层
            //_self.imageryLayers.grid.data = layer;
            _self.imageryLayers.raiseToTop(_self.layerTileGrid);       //将注记图层置顶
        }
        if(opt.cmd == _self.STATUS.CLOSE){
            _self.imageryLayers.remove(_self.layerTileGrid);
        }
       // return _self.layer;
     }
      /**
      * 军事网格
      */
     mgrsGrid(opt){
        let _self = this;
        if(opt.cmd == _self.STATUS.CREATE){
            var options = {camera : this.S.camera,canvas : this.S.canvas};
            let pn = Cesium.KmlDataSource.load("data/EarthPointGrid_093357.kml", options);
            pn.then(function(dataSource){
                _self.xmlData = dataSource;
                _self.CoreV.dataSources.add(_self.xmlData);
            });
        }
        if(opt.cmd == _self.STATUS.CLOSE){
            _self.CoreV.dataSources.remove(_self.xmlData);
        }
        //return _self.xmlData;
     }
     /**
      * 日照分析
      */
     sunlight(opt){
        let _self = this;
        if(opt.cmd == _self.STATUS.CREATE){
            _self.CoreV.clock.shouldAnimate = true;
            if(cmd.time == undefined){
                var e = "2019-06-18",
                t = new Date(e),
                i = "10",
                a = "18",
                r = new Date(new Date(t).setHours(Number(i))),
                o = new Date(new Date(t).setHours(Number(a)));
                _self.CoreV.scene.globe.enableLighting = !0,
                _self.CoreV.shadows = !0,
                _self.CoreV.clock.startTime = Cesium.JulianDate.fromDate(r),
                _self.CoreV.clock.currentTime = Cesium.JulianDate.fromDate(r),
                _self.CoreV.clock.stopTime = Cesium.JulianDate.fromDate(o),
                _self.CoreV.clock.clockRange = Cesium.ClockRange.LOOP_STOP,
                _self.CoreV.clock.clockStep = Cesium.ClockStep.SYSTEM_CLOCK_MULTIPLIER,
                _self.CoreV.clock.multiplier = 1600
            } 
        }
        if(opt.cmd == _self.STATUS.CLOSE){
            _self.CoreV.scene.globe.enableLighting = false;
            _self.CoreV.clock.shouldAnimate = false;
        }
     }
}