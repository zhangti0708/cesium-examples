
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