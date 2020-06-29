function createGoogleMapsByAPI(Cesium,options){
    function GMImageryProvider(options) {
        this._url = "http://maps.googleapis.com/maps/api/staticmap?maptype=satellite&center={y},{x}&zoom={level}&size=256x256&key={key}";

        this._key = options.key;
        this._tilingScheme = new Cesium.WebMercatorTilingScheme();

        this._tileWidth = 256;
        this._tileHeight = 256;
        this._maximumLevel = 18;

        this._credit = undefined;
        this._rectangle = this._tilingScheme.rectangle;
        this._ready = true;
    }

    function buildImageUrl(imageryProvider, x, y, level) {
        var rectangle = imageryProvider._tilingScheme.tileXYToNativeRectangle(x, y, level);

        var dWidth = rectangle.west + (rectangle.east - rectangle.west)/2;
        var dHeight = rectangle.south + (rectangle.north - rectangle.south)/2;

        var projection = imageryProvider._tilingScheme._projection;
        var centre = projection.unproject(new Cesium.Cartesian2(dWidth, dHeight));

        var url = imageryProvider._url
            .replace('{x}', centre.longitude * 180 / Math.PI)
            .replace('{y}', centre.latitude * 180 / Math.PI)
            .replace('{key}', imageryProvider._key)
            .replace('{level}', level);

        return url;
    }

    Cesium.defineProperties(GMImageryProvider.prototype, {
        url : {
            get : function() {
                return this._url;
            }
        },

        token : {
            get : function() {
                return this._token;
            }
        },

        proxy : {
            get : function() {
                return this._proxy;
            }
        },

        tileWidth : {
            get : function() {
                //>>includeStart('debug', pragmas.debug);
                if (!this._ready) {
                    throw new DeveloperError('tileWidth must not be called before the imagery provider is ready.');
                }
                //>>includeEnd('debug');

                return this._tileWidth;
            }
        },

        tileHeight: {
            get : function() {
                //>>includeStart('debug', pragmas.debug);
                if (!this._ready) {
                    throw new DeveloperError('tileHeight must not be called before the imagery provider is ready.');
                }
                //>>includeEnd('debug');

                return this._tileHeight;
            }
        },

        maximumLevel : {
            get : function() {
                //>>includeStart('debug', pragmas.debug);
                if (!this._ready) {
                    throw new DeveloperError('maximumLevel must not be called before the imagery provider is ready.');
                }
                //>>includeEnd('debug');

                return this._maximumLevel;
            }
        },

        minimumLevel : {
            get : function() {
                //>>includeStart('debug', pragmas.debug);
                if (!this._ready) {
                    throw new DeveloperError('minimumLevel must not be called before the imagery provider is ready.');
                }
                //>>includeEnd('debug');

                return 0;
            }
        },

        tilingScheme : {
            get : function() {
                //>>includeStart('debug', pragmas.debug);
                if (!this._ready) {
                    throw new DeveloperError('tilingScheme must not be called before the imagery provider is ready.');
                }
                //>>includeEnd('debug');

                return this._tilingScheme;
            }
        },

        rectangle : {
            get : function() {
                //>>includeStart('debug', pragmas.debug);
                if (!this._ready) {
                    throw new DeveloperError('rectangle must not be called before the imagery provider is ready.');
                }
                //>>includeEnd('debug');

                return this._rectangle;
            }
        },

        tileDiscardPolicy : {
            get : function() {
                //>>includeStart('debug', pragmas.debug);
                if (!this._ready) {
                    throw new DeveloperError('tileDiscardPolicy must not be called before the imagery provider is ready.');
                }
                //>>includeEnd('debug');

                return this._tileDiscardPolicy;
            }
        },

        errorEvent : {
            get : function() {
                return this._errorEvent;
            }
        },

        ready : {
            get : function() {
                return this._ready;
            }
        },

        readyPromise : {
            get : function() {
                return this._readyPromise.promise;
            }
        },

        credit : {
            get : function() {
                return this._credit;
            }
        },

        usingPrecachedTiles : {
            get : function() {
                return this._useTiles;
            }
        },

        hasAlphaChannel : {
            get : function() {
                return true;
            }
        },

        layers : {
            get : function() {
                return this._layers;
            }
        }
    });

    GMImageryProvider.prototype.getTileCredits = function(x, y, level) {
        return undefined;
    };

    GMImageryProvider.prototype.requestImage = function(x, y, level) {
        if (!this._ready) {
            throw new DeveloperError('requestImage must not be called before the imagery provider is ready.');
        }

        var url = buildImageUrl(this, x, y, level);
        return Cesium.ImageryProvider.loadImage(this, url);
    };

    return new GMImageryProvider(options);
}

function createGoogleMapsByUrl(Cesium,options) {
    options = Cesium.defaultValue(options, {});

    var templateUrl = Cesium.defaultValue(options.url, 'http://mt1.google.cn/vt/lyrs=s&hl=zh-CN&x={x}&y={y}&z={z}');

    var trailingSlashRegex = /\/$/;
    var defaultCredit = new Cesium.Credit('Google Maps');

    var tilingScheme = new Cesium.WebMercatorTilingScheme({ ellipsoid : options.ellipsoid });

    var tileWidth = 256;
    var tileHeight = 256;

    var minimumLevel = Cesium.defaultValue(options.minimumLevel, 0);
    var maximumLevel = Cesium.defaultValue(options.minimumLevel, 17);

    var rectangle = Cesium.defaultValue(options.rectangle, tilingScheme.rectangle);

    // Check the number of tiles at the minimum level.  If it's more than four,
    // throw an exception, because starting at the higher minimum
    // level will cause too many tiles to be downloaded and rendered.
    var swTile = tilingScheme.positionToTileXY(Cesium.Rectangle.southwest(rectangle), minimumLevel);
    var neTile = tilingScheme.positionToTileXY(Cesium.Rectangle.northeast(rectangle), minimumLevel);
    var tileCount = (Math.abs(neTile.x - swTile.x) + 1) * (Math.abs(neTile.y - swTile.y) + 1);
    //>>includeStart('debug', pragmas.debug);
    if (tileCount > 4) {
        throw new Cesium.DeveloperError('The rectangle and minimumLevel indicate that there are ' + tileCount + ' tiles at the minimum level. Imagery providers with more than four tiles at the minimum level are not supported.');
    }
    //>>includeEnd('debug');

    var credit = Cesium.defaultValue(options.credit, defaultCredit);
    if (typeof credit === 'string') {
        credit = new Cesium.Credit(credit);
    }

    return new Cesium.UrlTemplateImageryProvider({
        url: templateUrl,
        proxy: options.proxy,
        credit: credit,
        tilingScheme: tilingScheme,
        tileWidth: tileWidth,
        tileHeight: tileHeight,
        minimumLevel: minimumLevel,
        maximumLevel: maximumLevel,
        rectangle: rectangle
    });
}