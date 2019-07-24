/*
 * heatmap.js v2.0.2 | JavaScript Heatmap Library
 *
 * Copyright 2008-2016 Patrick Wied <heatmapjs@patrick-wied.at> - All rights reserved.
 * Dual licensed under MIT and Beerware license 
 *
 * :: 2016-02-04 21:25
 */
(function(a,b,c){if(typeof module!=="undefined"&&module.exports){module.exports=c()}else if(typeof define==="function"&&define.amd){define(c)}else{b[a]=c()}})("h337",this,function(){var a={defaultRadius:40,defaultRenderer:"canvas2d",defaultGradient:{.25:"rgb(0,0,255)",.55:"rgb(0,255,0)",.85:"yellow",1:"rgb(255,0,0)"},defaultMaxOpacity:1,defaultMinOpacity:0,defaultBlur:.85,defaultXField:"x",defaultYField:"y",defaultValueField:"value",plugins:{}};var b=function h(){var b=function d(a){this._coordinator={};this._data=[];this._radi=[];this._min=0;this._max=1;this._xField=a["xField"]||a.defaultXField;this._yField=a["yField"]||a.defaultYField;this._valueField=a["valueField"]||a.defaultValueField;if(a["radius"]){this._cfgRadius=a["radius"]}};var c=a.defaultRadius;b.prototype={_organiseData:function(a,b){var d=a[this._xField];var e=a[this._yField];var f=this._radi;var g=this._data;var h=this._max;var i=this._min;var j=a[this._valueField]||1;var k=a.radius||this._cfgRadius||c;if(!g[d]){g[d]=[];f[d]=[]}if(!g[d][e]){g[d][e]=j;f[d][e]=k}else{g[d][e]+=j}if(g[d][e]>h){if(!b){this._max=g[d][e]}else{this.setDataMax(g[d][e])}return false}else{return{x:d,y:e,value:j,radius:k,min:i,max:h}}},_unOrganizeData:function(){var a=[];var b=this._data;var c=this._radi;for(var d in b){for(var e in b[d]){a.push({x:d,y:e,radius:c[d][e],value:b[d][e]})}}return{min:this._min,max:this._max,data:a}},_onExtremaChange:function(){this._coordinator.emit("extremachange",{min:this._min,max:this._max})},addData:function(){if(arguments[0].length>0){var a=arguments[0];var b=a.length;while(b--){this.addData.call(this,a[b])}}else{var c=this._organiseData(arguments[0],true);if(c){this._coordinator.emit("renderpartial",{min:this._min,max:this._max,data:[c]})}}return this},setData:function(a){var b=a.data;var c=b.length;this._data=[];this._radi=[];for(var d=0;d<c;d++){this._organiseData(b[d],false)}this._max=a.max;this._min=a.min||0;this._onExtremaChange();this._coordinator.emit("renderall",this._getInternalData());return this},removeData:function(){},setDataMax:function(a){this._max=a;this._onExtremaChange();this._coordinator.emit("renderall",this._getInternalData());return this},setDataMin:function(a){this._min=a;this._onExtremaChange();this._coordinator.emit("renderall",this._getInternalData());return this},setCoordinator:function(a){this._coordinator=a},_getInternalData:function(){return{max:this._max,min:this._min,data:this._data,radi:this._radi}},getData:function(){return this._unOrganizeData()}};return b}();var c=function i(){var a=function(a){var b=a.gradient||a.defaultGradient;var c=document.createElement("canvas");var d=c.getContext("2d");c.width=256;c.height=1;var e=d.createLinearGradient(0,0,256,1);for(var f in b){e.addColorStop(f,b[f])}d.fillStyle=e;d.fillRect(0,0,256,1);return d.getImageData(0,0,256,1).data};var b=function(a,b){var c=document.createElement("canvas");var d=c.getContext("2d");var e=a;var f=a;c.width=c.height=a*2;if(b==1){d.beginPath();d.arc(e,f,a,0,2*Math.PI,false);d.fillStyle="rgba(0,0,0,1)";d.fill()}else{var g=d.createRadialGradient(e,f,a*b,e,f,a);g.addColorStop(0,"rgba(0,0,0,1)");g.addColorStop(1,"rgba(0,0,0,0)");d.fillStyle=g;d.fillRect(0,0,2*a,2*a)}return c};var c=function(a){var b=[];var c=a.min;var d=a.max;var e=a.radi;var a=a.data;var f=Object.keys(a);var g=f.length;while(g--){var h=f[g];var i=Object.keys(a[h]);var j=i.length;while(j--){var k=i[j];var l=a[h][k];var m=e[h][k];b.push({x:h,y:k,value:l,radius:m})}}return{min:c,max:d,data:b}};function d(b){var c=b.container;var d=this.shadowCanvas=document.createElement("canvas");var e=this.canvas=b.canvas||document.createElement("canvas");var f=this._renderBoundaries=[1e4,1e4,0,0];var g=getComputedStyle(b.container)||{};e.className="heatmap-canvas";this._width=e.width=d.width=b.width||+g.width.replace(/px/,"");this._height=e.height=d.height=b.height||+g.height.replace(/px/,"");this.shadowCtx=d.getContext("2d");this.ctx=e.getContext("2d");e.style.cssText=d.style.cssText="position:absolute;left:0;top:0;";c.style.position="relative";c.appendChild(e);this._palette=a(b);this._templates={};this._setStyles(b)}d.prototype={renderPartial:function(a){if(a.data.length>0){this._drawAlpha(a);this._colorize()}},renderAll:function(a){this._clear();if(a.data.length>0){this._drawAlpha(c(a));this._colorize()}},_updateGradient:function(b){this._palette=a(b)},updateConfig:function(a){if(a["gradient"]){this._updateGradient(a)}this._setStyles(a)},setDimensions:function(a,b){this._width=a;this._height=b;this.canvas.width=this.shadowCanvas.width=a;this.canvas.height=this.shadowCanvas.height=b},_clear:function(){this.shadowCtx.clearRect(0,0,this._width,this._height);this.ctx.clearRect(0,0,this._width,this._height)},_setStyles:function(a){this._blur=a.blur==0?0:a.blur||a.defaultBlur;if(a.backgroundColor){this.canvas.style.backgroundColor=a.backgroundColor}this._width=this.canvas.width=this.shadowCanvas.width=a.width||this._width;this._height=this.canvas.height=this.shadowCanvas.height=a.height||this._height;this._opacity=(a.opacity||0)*255;this._maxOpacity=(a.maxOpacity||a.defaultMaxOpacity)*255;this._minOpacity=(a.minOpacity||a.defaultMinOpacity)*255;this._useGradientOpacity=!!a.useGradientOpacity},_drawAlpha:function(a){var c=this._min=a.min;var d=this._max=a.max;var a=a.data||[];var e=a.length;var f=1-this._blur;while(e--){var g=a[e];var h=g.x;var i=g.y;var j=g.radius;var k=Math.min(g.value,d);var l=h-j;var m=i-j;var n=this.shadowCtx;var o;if(!this._templates[j]){this._templates[j]=o=b(j,f)}else{o=this._templates[j]}var p=(k-c)/(d-c);n.globalAlpha=p<.01?.01:p;n.drawImage(o,l,m);if(l<this._renderBoundaries[0]){this._renderBoundaries[0]=l}if(m<this._renderBoundaries[1]){this._renderBoundaries[1]=m}if(l+2*j>this._renderBoundaries[2]){this._renderBoundaries[2]=l+2*j}if(m+2*j>this._renderBoundaries[3]){this._renderBoundaries[3]=m+2*j}}},_colorize:function(){var a=this._renderBoundaries[0];var b=this._renderBoundaries[1];var c=this._renderBoundaries[2]-a;var d=this._renderBoundaries[3]-b;var e=this._width;var f=this._height;var g=this._opacity;var h=this._maxOpacity;var i=this._minOpacity;var j=this._useGradientOpacity;if(a<0){a=0}if(b<0){b=0}if(a+c>e){c=e-a}if(b+d>f){d=f-b}var k=this.shadowCtx.getImageData(a,b,c,d);var l=k.data;var m=l.length;var n=this._palette;for(var o=3;o<m;o+=4){var p=l[o];var q=p*4;if(!q){continue}var r;if(g>0){r=g}else{if(p<h){if(p<i){r=i}else{r=p}}else{r=h}}l[o-3]=n[q];l[o-2]=n[q+1];l[o-1]=n[q+2];l[o]=j?n[q+3]:r}k.data=l;this.ctx.putImageData(k,a,b);this._renderBoundaries=[1e3,1e3,0,0]},getValueAt:function(a){var b;var c=this.shadowCtx;var d=c.getImageData(a.x,a.y,1,1);var e=d.data[3];var f=this._max;var g=this._min;b=Math.abs(f-g)*(e/255)>>0;return b},getDataURL:function(){return this.canvas.toDataURL()}};return d}();var d=function j(){var b=false;if(a["defaultRenderer"]==="canvas2d"){b=c}return b}();var e={merge:function(){var a={};var b=arguments.length;for(var c=0;c<b;c++){var d=arguments[c];for(var e in d){a[e]=d[e]}}return a}};var f=function k(){var c=function h(){function a(){this.cStore={}}a.prototype={on:function(a,b,c){var d=this.cStore;if(!d[a]){d[a]=[]}d[a].push(function(a){return b.call(c,a)})},emit:function(a,b){var c=this.cStore;if(c[a]){var d=c[a].length;for(var e=0;e<d;e++){var f=c[a][e];f(b)}}}};return a}();var f=function(a){var b=a._renderer;var c=a._coordinator;var d=a._store;c.on("renderpartial",b.renderPartial,b);c.on("renderall",b.renderAll,b);c.on("extremachange",function(b){a._config.onExtremaChange&&a._config.onExtremaChange({min:b.min,max:b.max,gradient:a._config["gradient"]||a._config["defaultGradient"]})});d.setCoordinator(c)};function g(){var g=this._config=e.merge(a,arguments[0]||{});this._coordinator=new c;if(g["plugin"]){var h=g["plugin"];if(!a.plugins[h]){throw new Error("Plugin '"+h+"' not found. Maybe it was not registered.")}else{var i=a.plugins[h];this._renderer=new i.renderer(g);this._store=new i.store(g)}}else{this._renderer=new d(g);this._store=new b(g)}f(this)}g.prototype={addData:function(){this._store.addData.apply(this._store,arguments);return this},removeData:function(){this._store.removeData&&this._store.removeData.apply(this._store,arguments);return this},setData:function(){this._store.setData.apply(this._store,arguments);return this},setDataMax:function(){this._store.setDataMax.apply(this._store,arguments);return this},setDataMin:function(){this._store.setDataMin.apply(this._store,arguments);return this},configure:function(a){this._config=e.merge(this._config,a);this._renderer.updateConfig(this._config);this._coordinator.emit("renderall",this._store._getInternalData());return this},repaint:function(){this._coordinator.emit("renderall",this._store._getInternalData());return this},getData:function(){return this._store.getData()},getDataURL:function(){return this._renderer.getDataURL()},getValueAt:function(a){if(this._store.getValueAt){return this._store.getValueAt(a)}else if(this._renderer.getValueAt){return this._renderer.getValueAt(a)}else{return null}}};return g}();var g={create:function(a){return new f(a)},register:function(b,c){a.plugins[b]=c}};return g});

// Generated by CoffeeScript 1.8.0
(function() {
    var Framebuffer, Heights, Node, Shader, Texture, WebGLHeatmap, fragmentShaderBlit, nukeVendorPrefix, textureFloatShims, vertexShaderBlit,
      __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };
  
    nukeVendorPrefix = function() {
      var getExtension, getSupportedExtensions, vendorRe, vendors;
      if (window.WebGLRenderingContext != null) {
        vendors = ['WEBKIT', 'MOZ', 'MS', 'O'];
        vendorRe = /^WEBKIT_(.*)|MOZ_(.*)|MS_(.*)|O_(.*)/;
        getExtension = WebGLRenderingContext.prototype.getExtension;
        WebGLRenderingContext.prototype.getExtension = function(name) {
          var extobj, match, vendor, _i, _len;
          match = name.match(vendorRe);
          if (match !== null) {
            name = match[1];
          }
          extobj = getExtension.call(this, name);
          if (extobj === null) {
            for (_i = 0, _len = vendors.length; _i < _len; _i++) {
              vendor = vendors[_i];
              extobj = getExtension.call(this, vendor + '_' + name);
              if (extobj !== null) {
                return extobj;
              }
            }
            return null;
          } else {
            return extobj;
          }
        };
        getSupportedExtensions = WebGLRenderingContext.prototype.getSupportedExtensions;
        return WebGLRenderingContext.prototype.getSupportedExtensions = function() {
          var extension, match, result, supported, _i, _len;
          supported = getSupportedExtensions.call(this);
          result = [];
          for (_i = 0, _len = supported.length; _i < _len; _i++) {
            extension = supported[_i];
            match = extension.match(vendorRe);
            if (match !== null) {
              extension = match[1];
            }
            if (__indexOf.call(result, extension) < 0) {
              result.push(extension);
            }
          }
          return result;
        };
      }
    };
  
    textureFloatShims = function() {
      var checkColorBuffer, checkFloatLinear, checkSupport, checkTexture, createSourceCanvas, getExtension, getSupportedExtensions, name, shimExtensions, shimLookup, unshimExtensions, unshimLookup, _i, _len;
      createSourceCanvas = function() {
        var canvas, ctx, imageData;
        canvas = document.createElement('canvas');
        canvas.width = 2;
        canvas.height = 2;
        ctx = canvas.getContext('2d');
        imageData = ctx.getImageData(0, 0, 2, 2);
        imageData.data.set(new Uint8ClampedArray([0, 0, 0, 0, 255, 255, 255, 255, 0, 0, 0, 0, 255, 255, 255, 255]));
        ctx.putImageData(imageData, 0, 0);
        return canvas;
      };
      createSourceCanvas();
      checkFloatLinear = function(gl, sourceType) {
        var buffer, cleanup, fragmentShader, framebuffer, positionLoc, program, readBuffer, result, source, sourceCanvas, sourceLoc, target, vertexShader, vertices;
        program = gl.createProgram();
        vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.attachShader(program, vertexShader);
        gl.shaderSource(vertexShader, 'attribute vec2 position;\nvoid main(){\n    gl_Position = vec4(position, 0.0, 1.0);\n}');
        gl.compileShader(vertexShader);
        if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
          throw gl.getShaderInfoLog(vertexShader);
        }
        fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.attachShader(program, fragmentShader);
        gl.shaderSource(fragmentShader, 'uniform sampler2D source;\nvoid main(){\n    gl_FragColor = texture2D(source, vec2(1.0, 1.0));\n}');
        gl.compileShader(fragmentShader);
        if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
          throw gl.getShaderInfoLog(fragmentShader);
        }
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
          throw gl.getProgramInfoLog(program);
        }
        gl.useProgram(program);
        cleanup = function() {
          gl.deleteShader(fragmentShader);
          gl.deleteShader(vertexShader);
          gl.deleteProgram(program);
          gl.deleteBuffer(buffer);
          gl.deleteTexture(source);
          gl.deleteTexture(target);
          gl.deleteFramebuffer(framebuffer);
          gl.bindBuffer(gl.ARRAY_BUFFER, null);
          gl.useProgram(null);
          gl.bindTexture(gl.TEXTURE_2D, null);
          return gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        };
        target = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, target);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 2, 2, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        framebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, target, 0);
        sourceCanvas = createSourceCanvas();
        source = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, source);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, sourceType, sourceCanvas);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        vertices = new Float32Array([1, 1, -1, 1, -1, -1, 1, 1, -1, -1, 1, -1]);
        buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        positionLoc = gl.getAttribLocation(program, 'position');
        sourceLoc = gl.getUniformLocation(program, 'source');
        gl.enableVertexAttribArray(positionLoc);
        gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);
        gl.uniform1i(sourceLoc, 0);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        readBuffer = new Uint8Array(4 * 4);
        gl.readPixels(0, 0, 2, 2, gl.RGBA, gl.UNSIGNED_BYTE, readBuffer);
        result = Math.abs(readBuffer[0] - 127) < 10;
        cleanup();
        return result;
      };
      checkTexture = function(gl, targetType) {
        var target;
        target = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, target);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 2, 2, 0, gl.RGBA, targetType, null);
        if (gl.getError() === 0) {
          gl.deleteTexture(target);
          return true;
        } else {
          gl.deleteTexture(target);
          return false;
        }
      };
      checkColorBuffer = function(gl, targetType) {
        var check, framebuffer, target;
        target = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, target);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 2, 2, 0, gl.RGBA, targetType, null);
        framebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, target, 0);
        check = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        gl.deleteTexture(target);
        gl.deleteFramebuffer(framebuffer);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        if (check === gl.FRAMEBUFFER_COMPLETE) {
          return true;
        } else {
          return false;
        }
      };
      shimExtensions = [];
      shimLookup = {};
      unshimExtensions = [];
      checkSupport = function() {
        var canvas, extobj, gl, halfFloatExt, halfFloatTexturing, singleFloatExt, singleFloatTexturing;
        canvas = document.createElement('canvas');
        gl = null;
        try {
          gl = canvas.getContext('experimental-webgl');
          if (gl === null) {
            gl = canvas.getContext('webgl');
          }
        } catch (_error) {}
        if (gl != null) {
          singleFloatExt = gl.getExtension('OES_texture_float');
          if (singleFloatExt === null) {
            if (checkTexture(gl, gl.FLOAT)) {
              singleFloatTexturing = true;
              shimExtensions.push('OES_texture_float');
              shimLookup.OES_texture_float = {
                shim: true
              };
            } else {
              singleFloatTexturing = false;
              unshimExtensions.push('OES_texture_float');
            }
          } else {
            if (checkTexture(gl, gl.FLOAT)) {
              singleFloatTexturing = true;
              shimExtensions.push('OES_texture_float');
            } else {
              singleFloatTexturing = false;
              unshimExtensions.push('OES_texture_float');
            }
          }
          if (singleFloatTexturing) {
            extobj = gl.getExtension('WEBGL_color_buffer_float');
            if (extobj === null) {
              if (checkColorBuffer(gl, gl.FLOAT)) {
                shimExtensions.push('WEBGL_color_buffer_float');
                shimLookup.WEBGL_color_buffer_float = {
                  shim: true,
                  RGBA32F_EXT: 0x8814,
                  RGB32F_EXT: 0x8815,
                  FRAMEBUFFER_ATTACHMENT_COMPONENT_TYPE_EXT: 0x8211,
                  UNSIGNED_NORMALIZED_EXT: 0x8C17
                };
              } else {
                unshimExtensions.push('WEBGL_color_buffer_float');
              }
            } else {
              if (checkColorBuffer(gl, gl.FLOAT)) {
                shimExtensions.push('WEBGL_color_buffer_float');
              } else {
                unshimExtensions.push('WEBGL_color_buffer_float');
              }
            }
            extobj = gl.getExtension('OES_texture_float_linear');
            if (extobj === null) {
              if (checkFloatLinear(gl, gl.FLOAT)) {
                shimExtensions.push('OES_texture_float_linear');
                shimLookup.OES_texture_float_linear = {
                  shim: true
                };
              } else {
                unshimExtensions.push('OES_texture_float_linear');
              }
            } else {
              if (checkFloatLinear(gl, gl.FLOAT)) {
                shimExtensions.push('OES_texture_float_linear');
              } else {
                unshimExtensions.push('OES_texture_float_linear');
              }
            }
          }
          halfFloatExt = gl.getExtension('OES_texture_half_float');
          if (halfFloatExt === null) {
            if (checkTexture(gl, 0x8D61)) {
              halfFloatTexturing = true;
              shimExtensions.push('OES_texture_half_float');
              halfFloatExt = shimLookup.OES_texture_half_float = {
                HALF_FLOAT_OES: 0x8D61,
                shim: true
              };
            } else {
              halfFloatTexturing = false;
              unshimExtensions.push('OES_texture_half_float');
            }
          } else {
            if (checkTexture(gl, halfFloatExt.HALF_FLOAT_OES)) {
              halfFloatTexturing = true;
              shimExtensions.push('OES_texture_half_float');
            } else {
              halfFloatTexturing = false;
              unshimExtensions.push('OES_texture_half_float');
            }
          }
          if (halfFloatTexturing) {
            extobj = gl.getExtension('EXT_color_buffer_half_float');
            if (extobj === null) {
              if (checkColorBuffer(gl, halfFloatExt.HALF_FLOAT_OES)) {
                shimExtensions.push('EXT_color_buffer_half_float');
                shimLookup.EXT_color_buffer_half_float = {
                  shim: true,
                  RGBA16F_EXT: 0x881A,
                  RGB16F_EXT: 0x881B,
                  FRAMEBUFFER_ATTACHMENT_COMPONENT_TYPE_EXT: 0x8211,
                  UNSIGNED_NORMALIZED_EXT: 0x8C17
                };
              } else {
                unshimExtensions.push('EXT_color_buffer_half_float');
              }
            } else {
              if (checkColorBuffer(gl, halfFloatExt.HALF_FLOAT_OES)) {
                shimExtensions.push('EXT_color_buffer_half_float');
              } else {
                unshimExtensions.push('EXT_color_buffer_half_float');
              }
            }
            extobj = gl.getExtension('OES_texture_half_float_linear');
            if (extobj === null) {
              if (checkFloatLinear(gl, halfFloatExt.HALF_FLOAT_OES)) {
                shimExtensions.push('OES_texture_half_float_linear');
                return shimLookup.OES_texture_half_float_linear = {
                  shim: true
                };
              } else {
                return unshimExtensions.push('OES_texture_half_float_linear');
              }
            } else {
              if (checkFloatLinear(gl, halfFloatExt.HALF_FLOAT_OES)) {
                return shimExtensions.push('OES_texture_half_float_linear');
              } else {
                return unshimExtensions.push('OES_texture_half_float_linear');
              }
            }
          }
        }
      };
      if (window.WebGLRenderingContext != null) {
        checkSupport();
        unshimLookup = {};
        for (_i = 0, _len = unshimExtensions.length; _i < _len; _i++) {
          name = unshimExtensions[_i];
          unshimLookup[name] = true;
        }
        getExtension = WebGLRenderingContext.prototype.getExtension;
        WebGLRenderingContext.prototype.getExtension = function(name) {
          var extobj;
          extobj = shimLookup[name];
          if (extobj === void 0) {
            if (unshimLookup[name]) {
              return null;
            } else {
              return getExtension.call(this, name);
            }
          } else {
            return extobj;
          }
        };
        getSupportedExtensions = WebGLRenderingContext.prototype.getSupportedExtensions;
        WebGLRenderingContext.prototype.getSupportedExtensions = function() {
          var extension, result, supported, _j, _k, _len1, _len2;
          supported = getSupportedExtensions.call(this);
          result = [];
          for (_j = 0, _len1 = supported.length; _j < _len1; _j++) {
            extension = supported[_j];
            if (unshimLookup[extension] === void 0) {
              result.push(extension);
            }
          }
          for (_k = 0, _len2 = shimExtensions.length; _k < _len2; _k++) {
            extension = shimExtensions[_k];
            if (__indexOf.call(result, extension) < 0) {
              result.push(extension);
            }
          }
          return result;
        };
        return WebGLRenderingContext.prototype.getFloatExtension = function(spec) {
          var candidate, candidates, half, halfFramebuffer, halfLinear, halfTexture, i, importance, preference, result, single, singleFramebuffer, singleLinear, singleTexture, use, _j, _k, _l, _len1, _len2, _len3, _len4, _m, _ref, _ref1, _ref2;
          if (spec.prefer == null) {
            spec.prefer = ['half'];
          }
          if (spec.require == null) {
            spec.require = [];
          }
          if (spec.throws == null) {
            spec.throws = true;
          }
          singleTexture = this.getExtension('OES_texture_float');
          halfTexture = this.getExtension('OES_texture_half_float');
          singleFramebuffer = this.getExtension('WEBGL_color_buffer_float');
          halfFramebuffer = this.getExtension('EXT_color_buffer_half_float');
          singleLinear = this.getExtension('OES_texture_float_linear');
          halfLinear = this.getExtension('OES_texture_half_float_linear');
          single = {
            texture: singleTexture !== null,
            filterable: singleLinear !== null,
            renderable: singleFramebuffer !== null,
            score: 0,
            precision: 'single',
            half: false,
            single: true,
            type: this.FLOAT
          };
          half = {
            texture: halfTexture !== null,
            filterable: halfLinear !== null,
            renderable: halfFramebuffer !== null,
            score: 0,
            precision: 'half',
            half: true,
            single: false,
            type: (_ref = halfTexture != null ? halfTexture.HALF_FLOAT_OES : void 0) != null ? _ref : null
          };
          candidates = [];
          if (single.texture) {
            candidates.push(single);
          }
          if (half.texture) {
            candidates.push(half);
          }
          result = [];
          for (_j = 0, _len1 = candidates.length; _j < _len1; _j++) {
            candidate = candidates[_j];
            use = true;
            _ref1 = spec.require;
            for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
              name = _ref1[_k];
              if (candidate[name] === false) {
                use = false;
              }
            }
            if (use) {
              result.push(candidate);
            }
          }
          for (_l = 0, _len3 = result.length; _l < _len3; _l++) {
            candidate = result[_l];
            _ref2 = spec.prefer;
            for (i = _m = 0, _len4 = _ref2.length; _m < _len4; i = ++_m) {
              preference = _ref2[i];
              importance = Math.pow(2, spec.prefer.length - i - 1);
              if (candidate[preference]) {
                candidate.score += importance;
              }
            }
          }
          result.sort(function(a, b) {
            if (a.score === b.score) {
              return 0;
            } else if (a.score < b.score) {
              return 1;
            } else if (a.score > b.score) {
              return -1;
            }
          });
          if (result.length === 0) {
            if (spec.throws) {
              throw 'No floating point texture support that is ' + spec.require.join(', ');
            } else {
              return null;
            }
          } else {
            result = result[0];
            return {
              filterable: result.filterable,
              renderable: result.renderable,
              type: result.type,
              precision: result.precision
            };
          }
        };
      }
    };
  
    nukeVendorPrefix();
  
    textureFloatShims();
  
    Shader = (function() {
      function Shader(gl, _arg) {
        var fragment, vertex;
        this.gl = gl;
        vertex = _arg.vertex, fragment = _arg.fragment;
        this.program = this.gl.createProgram();
        this.vs = this.gl.createShader(this.gl.VERTEX_SHADER);
        this.fs = this.gl.createShader(this.gl.FRAGMENT_SHADER);
        this.gl.attachShader(this.program, this.vs);
        this.gl.attachShader(this.program, this.fs);
        this.compileShader(this.vs, vertex);
        this.compileShader(this.fs, fragment);
        this.link();
        this.value_cache = {};
        this.uniform_cache = {};
        this.attribCache = {};
      }
  
      Shader.prototype.attribLocation = function(name) {
        var location;
        location = this.attribCache[name];
        if (location === void 0) {
          location = this.attribCache[name] = this.gl.getAttribLocation(this.program, name);
        }
        return location;
      };
  
      Shader.prototype.compileShader = function(shader, source) {
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
          throw "Shader Compile Error: " + (this.gl.getShaderInfoLog(shader));
        }
      };
  
      Shader.prototype.link = function() {
        this.gl.linkProgram(this.program);
        if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
          throw "Shader Link Error: " + (this.gl.getProgramInfoLog(this.program));
        }
      };
  
      Shader.prototype.use = function() {
        this.gl.useProgram(this.program);
        return this;
      };
  
      Shader.prototype.uniformLoc = function(name) {
        var location;
        location = this.uniform_cache[name];
        if (location === void 0) {
          location = this.uniform_cache[name] = this.gl.getUniformLocation(this.program, name);
        }
        return location;
      };
  
      Shader.prototype.int = function(name, value) {
        var cached, loc;
        cached = this.value_cache[name];
        if (cached !== value) {
          this.value_cache[name] = value;
          loc = this.uniformLoc(name);
          if (loc) {
            this.gl.uniform1i(loc, value);
          }
        }
        return this;
      };
  
      Shader.prototype.vec2 = function(name, a, b) {
        var loc;
        loc = this.uniformLoc(name);
        if (loc) {
          this.gl.uniform2f(loc, a, b);
        }
        return this;
      };
  
      Shader.prototype.float = function(name, value) {
        var cached, loc;
        cached = this.value_cache[name];
        if (cached !== value) {
          this.value_cache[name] = value;
          loc = this.uniformLoc(name);
          if (loc) {
            this.gl.uniform1f(loc, value);
          }
        }
        return this;
      };
  
      return Shader;
  
    })();
  
    Framebuffer = (function() {
      function Framebuffer(gl) {
        this.gl = gl;
        this.buffer = this.gl.createFramebuffer();
      }
  
      Framebuffer.prototype.destroy = function() {
        return this.gl.deleteFRamebuffer(this.buffer);
      };
  
      Framebuffer.prototype.bind = function() {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.buffer);
        return this;
      };
  
      Framebuffer.prototype.unbind = function() {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        return this;
      };
  
      Framebuffer.prototype.check = function() {
        var result;
        result = this.gl.checkFramebufferStatus(this.gl.FRAMEBUFFER);
        switch (result) {
          case this.gl.FRAMEBUFFER_UNSUPPORTED:
            throw 'Framebuffer is unsupported';
            break;
          case this.gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT:
            throw 'Framebuffer incomplete attachment';
            break;
          case this.gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS:
            throw 'Framebuffer incomplete dimensions';
            break;
          case this.gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT:
            throw 'Framebuffer incomplete missing attachment';
        }
        return this;
      };
  
      Framebuffer.prototype.color = function(texture) {
        this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, texture.target, texture.handle, 0);
        this.check();
        return this;
      };
  
      Framebuffer.prototype.depth = function(buffer) {
        this.gl.framebufferRenderbuffer(this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT, this.gl.RENDERBUFFER, buffer.id);
        this.check();
        return this;
      };
  
      Framebuffer.prototype.destroy = function() {
        return this.gl.deleteFramebuffer(this.buffer);
      };
  
      return Framebuffer;
  
    })();
  
    Texture = (function() {
      function Texture(gl, params) {
        var _ref, _ref1;
        this.gl = gl;
        if (params == null) {
          params = {};
        }
        this.channels = this.gl[((_ref = params.channels) != null ? _ref : 'rgba').toUpperCase()];
        if (typeof params.type === 'number') {
          this.type = params.type;
        } else {
          this.type = this.gl[((_ref1 = params.type) != null ? _ref1 : 'unsigned_byte').toUpperCase()];
        }
        switch (this.channels) {
          case this.gl.RGBA:
            this.chancount = 4;
            break;
          case this.gl.RGB:
            this.chancount = 3;
            break;
          case this.gl.LUMINANCE_ALPHA:
            this.chancount = 2;
            break;
          default:
            this.chancount = 1;
        }
        this.target = this.gl.TEXTURE_2D;
        this.handle = this.gl.createTexture();
      }
  
      Texture.prototype.destroy = function() {
        return this.gl.deleteTexture(this.handle);
      };
  
      Texture.prototype.bind = function(unit) {
        if (unit == null) {
          unit = 0;
        }
        if (unit > 15) {
          throw 'Texture unit too large: ' + unit;
        }
        this.gl.activeTexture(this.gl.TEXTURE0 + unit);
        this.gl.bindTexture(this.target, this.handle);
        return this;
      };
  
      Texture.prototype.setSize = function(width, height) {
        this.width = width;
        this.height = height;
        this.gl.texImage2D(this.target, 0, this.channels, this.width, this.height, 0, this.channels, this.type, null);
        return this;
      };
  
      Texture.prototype.upload = function(data) {
        this.width = data.width;
        this.height = data.height;
        this.gl.texImage2D(this.target, 0, this.channels, this.channels, this.type, data);
        return this;
      };
  
      Texture.prototype.linear = function() {
        this.gl.texParameteri(this.target, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.target, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
        return this;
      };
  
      Texture.prototype.nearest = function() {
        this.gl.texParameteri(this.target, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.target, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
        return this;
      };
  
      Texture.prototype.clampToEdge = function() {
        this.gl.texParameteri(this.target, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.target, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
        return this;
      };
  
      Texture.prototype.repeat = function() {
        this.gl.texParameteri(this.target, this.gl.TEXTURE_WRAP_S, this.gl.REPEAT);
        this.gl.texParameteri(this.target, this.gl.TEXTURE_WRAP_T, this.gl.REPEAT);
        return this;
      };
  
      return Texture;
  
    })();
  
    Node = (function() {
      function Node(gl, width, height) {
        var floatExt;
        this.gl = gl;
        this.width = width;
        this.height = height;
        floatExt = this.gl.getFloatExtension({
          require: ['renderable']
        });
        this.texture = new Texture(this.gl, {
          type: floatExt.type
        }).bind(0).setSize(this.width, this.height).nearest().clampToEdge();
        this.fbo = new Framebuffer(this.gl).bind().color(this.texture).unbind();
      }
  
      Node.prototype.use = function() {
        return this.fbo.bind();
      };
  
      Node.prototype.bind = function(unit) {
        return this.texture.bind(unit);
      };
  
      Node.prototype.end = function() {
        return this.fbo.unbind();
      };
  
      Node.prototype.resize = function(width, height) {
        this.width = width;
        this.height = height;
        return this.texture.bind(0).setSize(this.width, this.height);
      };
  
      return Node;
  
    })();
  
    vertexShaderBlit = 'attribute vec4 position;\nvarying vec2 texcoord;\nvoid main(){\n    texcoord = position.xy*0.5+0.5;\n    gl_Position = position;\n}';
  
    fragmentShaderBlit = '#ifdef GL_FRAGMENT_PRECISION_HIGH\n    precision highp int;\n    precision highp float;\n#else\n    precision mediump int;\n    precision mediump float;\n#endif\nuniform sampler2D source;\nvarying vec2 texcoord;';
  
    Heights = (function() {
      function Heights(heatmap, gl, width, height) {
        var i, _i, _ref;
        this.heatmap = heatmap;
        this.gl = gl;
        this.width = width;
        this.height = height;
        this.shader = new Shader(this.gl, {
          vertex: 'attribute vec4 position, intensity;\nvarying vec2 off, dim;\nvarying float vIntensity;\nuniform vec2 viewport;\n\nvoid main(){\n    dim = abs(position.zw);\n    off = position.zw;\n    vec2 pos = position.xy + position.zw;\n    vIntensity = intensity.x;\n    gl_Position = vec4((pos/viewport)*2.0-1.0, 0.0, 1.0);\n}',
          fragment: '#ifdef GL_FRAGMENT_PRECISION_HIGH\n    precision highp int;\n    precision highp float;\n#else\n    precision mediump int;\n    precision mediump float;\n#endif\nvarying vec2 off, dim;\nvarying float vIntensity;\nvoid main(){\n    float falloff = (1.0 - smoothstep(0.0, 1.0, length(off/dim)));\n    float intensity = falloff*vIntensity;\n    gl_FragColor = vec4(intensity);\n}'
        });
        this.clampShader = new Shader(this.gl, {
          vertex: vertexShaderBlit,
          fragment: fragmentShaderBlit + 'uniform float low, high;\nvoid main(){\n    gl_FragColor = vec4(clamp(texture2D(source, texcoord).rgb, low, high), 1.0);\n}'
        });
        this.multiplyShader = new Shader(this.gl, {
          vertex: vertexShaderBlit,
          fragment: fragmentShaderBlit + 'uniform float value;\nvoid main(){\n    gl_FragColor = vec4(texture2D(source, texcoord).rgb*value, 1.0);\n}'
        });
        this.blurShader = new Shader(this.gl, {
          vertex: vertexShaderBlit,
          fragment: fragmentShaderBlit + 'uniform vec2 viewport;\nvoid main(){\n    vec4 result = vec4(0.0);\n    for(int x=-1; x<=1; x++){\n        for(int y=-1; y<=1; y++){\n            vec2 off = vec2(x,y)/viewport;\n            //float factor = 1.0 - smoothstep(0.0, 1.5, length(off));\n            float factor = 1.0;\n            result += vec4(texture2D(source, texcoord+off).rgb*factor, factor);\n        }\n    }\n    gl_FragColor = vec4(result.rgb/result.w, 1.0);\n}'
        });
        this.nodeBack = new Node(this.gl, this.width, this.height);
        this.nodeFront = new Node(this.gl, this.width, this.height);
        this.vertexBuffer = this.gl.createBuffer();
        this.vertexSize = 8;
        this.maxPointCount = 1024 * 10;
        this.vertexBufferData = new Float32Array(this.maxPointCount * this.vertexSize * 6);
        this.vertexBufferViews = [];
        for (i = _i = 0, _ref = this.maxPointCount; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
          this.vertexBufferViews.push(new Float32Array(this.vertexBufferData.buffer, 0, i * this.vertexSize * 6));
        }
        this.bufferIndex = 0;
        this.pointCount = 0;
      }
  
      Heights.prototype.resize = function(width, height) {
        this.width = width;
        this.height = height;
        this.nodeBack.resize(this.width, this.height);
        return this.nodeFront.resize(this.width, this.height);
      };
  
      Heights.prototype.update = function() {
        var intensityLoc, positionLoc;
        if (this.pointCount > 0) {
          this.gl.enable(this.gl.BLEND);
          this.nodeFront.use();
          this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
          this.gl.bufferData(this.gl.ARRAY_BUFFER, this.vertexBufferViews[this.pointCount], this.gl.STREAM_DRAW);
          positionLoc = this.shader.attribLocation('position');
          intensityLoc = this.shader.attribLocation('intensity');
          this.gl.enableVertexAttribArray(1);
          this.gl.vertexAttribPointer(positionLoc, 4, this.gl.FLOAT, false, 8 * 4, 0 * 4);
          this.gl.vertexAttribPointer(intensityLoc, 4, this.gl.FLOAT, false, 8 * 4, 4 * 4);
          this.shader.use().vec2('viewport', this.width, this.height);
          this.gl.drawArrays(this.gl.TRIANGLES, 0, this.pointCount * 6);
          this.gl.disableVertexAttribArray(1);
          this.pointCount = 0;
          this.bufferIndex = 0;
          this.nodeFront.end();
          return this.gl.disable(this.gl.BLEND);
        }
      };
  
      Heights.prototype.clear = function() {
        this.nodeFront.use();
        this.gl.clearColor(0, 0, 0, 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        return this.nodeFront.end();
      };
  
      Heights.prototype.clamp = function(min, max) {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.heatmap.quad);
        this.gl.vertexAttribPointer(0, 4, this.gl.FLOAT, false, 0, 0);
        this.nodeFront.bind(0);
        this.nodeBack.use();
        this.clampShader.use().int('source', 0).float('low', min).float('high', max);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
        this.nodeBack.end();
        return this.swap();
      };
  
      Heights.prototype.multiply = function(value) {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.heatmap.quad);
        this.gl.vertexAttribPointer(0, 4, this.gl.FLOAT, false, 0, 0);
        this.nodeFront.bind(0);
        this.nodeBack.use();
        this.multiplyShader.use().int('source', 0).float('value', value);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
        this.nodeBack.end();
        return this.swap();
      };
  
      Heights.prototype.blur = function() {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.heatmap.quad);
        this.gl.vertexAttribPointer(0, 4, this.gl.FLOAT, false, 0, 0);
        this.nodeFront.bind(0);
        this.nodeBack.use();
        this.blurShader.use().int('source', 0).vec2('viewport', this.width, this.height);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
        this.nodeBack.end();
        return this.swap();
      };
  
      Heights.prototype.swap = function() {
        var tmp;
        tmp = this.nodeFront;
        this.nodeFront = this.nodeBack;
        return this.nodeBack = tmp;
      };
  
      Heights.prototype.addVertex = function(x, y, xs, ys, intensity) {
        this.vertexBufferData[this.bufferIndex++] = x;
        this.vertexBufferData[this.bufferIndex++] = y;
        this.vertexBufferData[this.bufferIndex++] = xs;
        this.vertexBufferData[this.bufferIndex++] = ys;
        this.vertexBufferData[this.bufferIndex++] = intensity;
        this.vertexBufferData[this.bufferIndex++] = intensity;
        this.vertexBufferData[this.bufferIndex++] = intensity;
        return this.vertexBufferData[this.bufferIndex++] = intensity;
      };
  
      Heights.prototype.addPoint = function(x, y, size, intensity) {
        var s;
        if (size == null) {
          size = 50;
        }
        if (intensity == null) {
          intensity = 0.2;
        }
        if (this.pointCount >= this.maxPointCount - 1) {
          this.update();
        }
        y = this.height - y;
        s = size / 2;
        this.addVertex(x, y, -s, -s, intensity);
        this.addVertex(x, y, +s, -s, intensity);
        this.addVertex(x, y, -s, +s, intensity);
        this.addVertex(x, y, -s, +s, intensity);
        this.addVertex(x, y, +s, -s, intensity);
        this.addVertex(x, y, +s, +s, intensity);
        return this.pointCount += 1;
      };
  
      return Heights;
  
    })();
  
    WebGLHeatmap = (function() {
      function WebGLHeatmap(_arg) {
        var alphaEnd, alphaRange, alphaStart, error, getColorFun, gradientTexture, image, intensityToAlpha, output, quad, textureGradient, _ref, _ref1;
        _ref = _arg != null ? _arg : {}, this.canvas = _ref.canvas, this.width = _ref.width, this.height = _ref.height, intensityToAlpha = _ref.intensityToAlpha, gradientTexture = _ref.gradientTexture, alphaRange = _ref.alphaRange;
        if (!this.canvas) {
          this.canvas = document.createElement('canvas');
        }
        try {
          this.gl = this.canvas.getContext('experimental-webgl', {
            depth: false,
            antialias: false
          });
          if (this.gl === null) {
            this.gl = this.canvas.getContext('webgl', {
              depth: false,
              antialias: false
            });
            if (this.gl === null) {
              throw 'WebGL not supported';
            }
          }
        } catch (_error) {
          error = _error;
          throw 'WebGL not supported';
        }
        if (window.WebGLDebugUtils != null) {
          console.log('debugging mode');
          this.gl = WebGLDebugUtils.makeDebugContext(this.gl, function(err, funcName, args) {
            throw WebGLDebugUtils.glEnumToString(err) + " was caused by call to: " + funcName;
          });
        }
        this.gl.enableVertexAttribArray(0);
        this.gl.blendFunc(this.gl.ONE, this.gl.ONE);
        if (gradientTexture) {
          textureGradient = this.gradientTexture = new Texture(this.gl, {
            channels: 'rgba'
          }).bind(0).setSize(2, 2).nearest().clampToEdge();
          if (typeof gradientTexture === 'string') {
            image = new Image();
            image.onload = function() {
              return textureGradient.bind().upload(image);
            };
            image.src = gradientTexture;
          } else {
            if (gradientTexture.width > 0 && gradientTexture.height > 0) {
              textureGradient.upload(gradientTexture);
            } else {
              gradientTexture.onload = function() {
                return textureGradient.upload(gradientTexture);
              };
            }
          }
          getColorFun = 'uniform sampler2D gradientTexture;\nvec3 getColor(float intensity){\n    return texture2D(gradientTexture, vec2(intensity, 0.0)).rgb;\n}';
        } else {
          textureGradient = null;
          getColorFun = 'vec3 getColor(float intensity){\n    vec3 blue = vec3(0.0, 0.0, 1.0);\n    vec3 cyan = vec3(0.0, 1.0, 1.0);\n    vec3 green = vec3(0.0, 1.0, 0.0);\n    vec3 yellow = vec3(1.0, 1.0, 0.0);\n    vec3 red = vec3(1.0, 0.0, 0.0);\n\n    vec3 color = (\n        fade(-0.25, 0.25, intensity)*blue +\n        fade(0.0, 0.5, intensity)*cyan +\n        fade(0.25, 0.75, intensity)*green +\n        fade(0.5, 1.0, intensity)*yellow +\n        smoothstep(0.75, 1.0, intensity)*red\n    );\n    return color;\n}';
        }
        if (intensityToAlpha == null) {
          intensityToAlpha = true;
        }
        if (intensityToAlpha) {
          _ref1 = alphaRange != null ? alphaRange : [0, 1], alphaStart = _ref1[0], alphaEnd = _ref1[1];
          output = "vec4 alphaFun(vec3 color, float intensity){\n    float alpha = smoothstep(" + (alphaStart.toFixed(8)) + ", " + (alphaEnd.toFixed(8)) + ", intensity);\n    return vec4(color*alpha, alpha);\n}";
        } else {
          output = 'vec4 alphaFun(vec3 color, float intensity){\n    return vec4(color, 1.0);\n}';
        }
        this.shader = new Shader(this.gl, {
          vertex: vertexShaderBlit,
          fragment: fragmentShaderBlit + ("float linstep(float low, float high, float value){\n    return clamp((value-low)/(high-low), 0.0, 1.0);\n}\n\nfloat fade(float low, float high, float value){\n    float mid = (low+high)*0.5;\n    float range = (high-low)*0.5;\n    float x = 1.0 - clamp(abs(mid-value)/range, 0.0, 1.0);\n    return smoothstep(0.0, 1.0, x);\n}\n\n" + getColorFun + "\n" + output + "\n\nvoid main(){\n    float intensity = smoothstep(0.0, 1.0, texture2D(source, texcoord).r);\n    vec3 color = getColor(intensity);\n    gl_FragColor = alphaFun(color, intensity);\n}")
        });
        if (this.width == null) {
          this.width = this.canvas.offsetWidth || 2;
        }
        if (this.height == null) {
          this.height = this.canvas.offsetHeight || 2;
        }
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.gl.viewport(0, 0, this.width, this.height);
        this.quad = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.quad);
        quad = new Float32Array([-1, -1, 0, 1, 1, -1, 0, 1, -1, 1, 0, 1, -1, 1, 0, 1, 1, -1, 0, 1, 1, 1, 0, 1]);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, quad, this.gl.STATIC_DRAW);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
        this.heights = new Heights(this, this.gl, this.width, this.height);
      }
  
      WebGLHeatmap.prototype.adjustSize = function() {
        var canvasHeight, canvasWidth;
        canvasWidth = this.canvas.offsetWidth || 2;
        canvasHeight = this.canvas.offsetHeight || 2;
        if (this.width !== canvasWidth || this.height !== canvasHeight) {
          this.gl.viewport(0, 0, canvasWidth, canvasHeight);
          this.canvas.width = canvasWidth;
          this.canvas.height = canvasHeight;
          this.width = canvasWidth;
          this.height = canvasHeight;
          return this.heights.resize(this.width, this.height);
        }
      };
  
      WebGLHeatmap.prototype.display = function() {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.quad);
        this.gl.vertexAttribPointer(0, 4, this.gl.FLOAT, false, 0, 0);
        this.heights.nodeFront.bind(0);
        if (this.gradientTexture) {
          this.gradientTexture.bind(1);
        }
        this.shader.use().int('source', 0).int('gradientTexture', 1);
        return this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
      };
  
      WebGLHeatmap.prototype.update = function() {
        return this.heights.update();
      };
  
      WebGLHeatmap.prototype.clear = function() {
        return this.heights.clear();
      };
  
      WebGLHeatmap.prototype.clamp = function(min, max) {
        if (min == null) {
          min = 0;
        }
        if (max == null) {
          max = 1;
        }
        return this.heights.clamp(min, max);
      };
  
      WebGLHeatmap.prototype.multiply = function(value) {
        if (value == null) {
          value = 0.95;
        }
        return this.heights.multiply(value);
      };
  
      WebGLHeatmap.prototype.blur = function() {
        return this.heights.blur();
      };
  
      WebGLHeatmap.prototype.addPoint = function(x, y, size, intensity) {
        return this.heights.addPoint(x, y, size, intensity);
      };
  
      WebGLHeatmap.prototype.addPoints = function(items) {
        var item, _i, _len, _results;
        _results = [];
        for (_i = 0, _len = items.length; _i < _len; _i++) {
          item = items[_i];
          _results.push(this.addPoint(item.x, item.y, item.size, item.intensity));
        }
        return _results;
      };
  
      return WebGLHeatmap;
  
    })();
  
    window.createWebGLHeatmap = function(params) {
      return new WebGLHeatmap(params);
    };
  
  }).call(this);
  
  //第一种
  ;var CesiumHeatmapGL = (function(Cesium,createWebGLHeatmap){
    function CHGL(chglviewer,data){
        this._viewer=chglviewer;
        //分离业务
        switch(data.type){
          case "url":{ 
               this.loadGeojson(data.obj);
               break; 
           }
           case "wfs":{
               this.loadWFSData(data.obj);
               break; 
         }
       }
    }
    
    CHGL.prototype.loadGeojson = function(url){
        getJSON(url,function(data){
            var lonmin=1000;
            var lonmax=-1000;
            var latmin=1000;
            var latmax=-1000;
            data.features.forEach(function(feature){
                var lon = feature.geometry.coordinates[0];
                var lat = feature.geometry.coordinates[1];
                lonmin = lon<lonmin?lon:lonmin;
                latmin = lat<latmin?lat:latmin;
                lonmax = lon>lonmax?lon:lonmax;
                latmax = lat>latmax?lat:latmax;
            });
            var xrange = lonmax-lonmin;
            var yrange = latmax-latmin;
            var extent={xMin:lonmin-xrange/10,yMin:latmin-yrange/10, xMax:lonmax+xrange/10,yMax:latmax+yrange/10};
            var heatmapcanvas = document.createElement('canvas');
            document.body.appendChild(heatmapcanvas);
            heatmapcanvas.width = 1000;
            heatmapcanvas.height = parseInt(1000/(extent.xMax-extent.xMin)*(extent.yMax-extent.yMin));
            try{
                var heatmap = this._heatmap = createWebGLHeatmap({canvas: heatmapcanvas,intensityToAlpha:true});
            }
            catch(error){
                console.error(error);
            }
            data.features.forEach(function(feature){
                var x = (feature.geometry.coordinates[0]-extent.xMin)/(extent.xMax-extent.xMin)*heatmapcanvas.clientWidth;
                var y = (-(feature.geometry.coordinates[1]-extent.yMin)/(extent.yMax-extent.yMin)+1)*heatmapcanvas.clientHeight;
                heatmap.addPoint(x, y, 20, 0.05);
            });
            heatmap.adjustSize(); 
            heatmap.update();
            heatmap.display();
            this.drawHeatmapRect(heatmapcanvas,extent);
            this._viewer.camera.flyTo({
                destination : Cesium.Rectangle.fromDegrees(extent.xMin, extent.yMin, extent.xMax, extent.yMax)
            });
        }.bind(this));
    }
    /***
     * 后台传的坐标数据
     * @coordinates 坐标点
     * @author zhangti
     */
    CHGL.prototype.loadWFSData = function(data){
        var lonmin=1000;
        var lonmax=-1000;
        var latmin=1000;
        var latmax=-1000;
        data.forEach(function(coordinates){
            var lon = coordinates[0];
            var lat = coordinates[1];
            lonmin = lon<lonmin?lon:lonmin;
            latmin = lat<latmin?lat:latmin;
            lonmax = lon>lonmax?lon:lonmax;
            latmax = lat>latmax?lat:latmax;
        });
        var xrange = lonmax-lonmin;
        var yrange = latmax-latmin;
        var extent={xMin:lonmin-xrange/10,yMin:latmin-yrange/10, xMax:lonmax+xrange/10,yMax:latmax+yrange/10};
        var heatmapcanvas = document.createElement('canvas');
        document.body.appendChild(heatmapcanvas);
        heatmapcanvas.width = 1000;
        heatmapcanvas.height = parseInt(1000/(extent.xMax-extent.xMin)*(extent.yMax-extent.yMin));
        try{
            var heatmap = this._heatmap = createWebGLHeatmap({canvas: heatmapcanvas,intensityToAlpha:true});
        }
        catch(error){
            console.error(error);
        }
        data.forEach(function(coordinates){
            var x = (coordinates[0]-extent.xMin)/(extent.xMax-extent.xMin)*heatmapcanvas.clientWidth;
            var y = (-(coordinates[1]-extent.yMin)/(extent.yMax-extent.yMin)+1)*heatmapcanvas.clientHeight;
            heatmap.addPoint(x, y, 20, 0.05); //heatmap.addPoint(x, y, 20, 0.05);
        });
        heatmap.adjustSize(); 
        heatmap.update();
        heatmap.display();
        this.drawHeatmapRect(heatmapcanvas,extent);
        this._viewer.camera.flyTo({
            destination : Cesium.Rectangle.fromDegrees(extent.xMin, extent.yMin, extent.xMax, extent.yMax)
        });
    }

	CHGL.prototype.drawHeatmapRect = function(canvas,extent) {
		var image = convertCanvasToImage(canvas);
		this._worldRectangle = this._viewer.scene.primitives.add(new Cesium.Primitive({
			geometryInstances : new Cesium.GeometryInstance({
				geometry : new Cesium.RectangleGeometry({
					rectangle : Cesium.Rectangle.fromDegrees(extent.xMin, extent.yMin, extent.xMax, extent.yMax),
					vertexFormat : Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT
				})
			}),
			appearance : new Cesium.EllipsoidSurfaceAppearance({
				aboveGround : false
			}),
			show : true
		}));
		this._worldRectangle.appearance.material = new Cesium.Material({
			fabric : {
				type : 'Image',
				uniforms : {
					image : image.src
				}
			}
		});
    }
    CHGL.prototype.updateHeatmap=function(){
        this._heatmap.adjustSize(); 
        this._heatmap.update();
        this._heatmap.display();

        var image = convertCanvasToImage(this._heatmap.canvas);
        this._worldRectangle.appearance.material.uniforms.image=image.src;
        //  = new Cesium.Material({
		// 	fabric : {
		// 		type : 'Image',
		// 		uniforms : {
		// 			image : image.src
		// 		}
		// 	}
		// });
    }
    CHGL.prototype.none = function(){
      this._worldRectangle.show = false;
    }
	CHGL.prototype.clear = function(){
      this._heatmap.clear();
	   this.updateHeatmap();
    }
	CHGL.prototype.show = function(){
      this._worldRectangle.show = true;
    }
    CHGL.prototype.multiply = function(value){
        this._heatmap.multiply(value);
        this.updateHeatmap();
    }
    CHGL.prototype.clamp = function(min,max){
        this._heatmap.clamp(min, max);
        this.updateHeatmap();
    }

    CHGL.prototype.blur = function(){
        this._heatmap.blur();
        this.updateHeatmap();
    }

	function convertCanvasToImage(canvas) {
		var image = new Image();
		image.src = canvas.toDataURL("image/png");
		return image;
    }

    function getJSON(url, callback) {
		const xhr = new XMLHttpRequest();
		xhr.responseType = 'json';
		xhr.open('get', url, true);
		xhr.onload = function () {
			if (xhr.status >= 200 && xhr.status < 300) {
				callback(xhr.response);
			} else {
				throw new Error(xhr.statusText);
			}
		};
		xhr.send();
	}
    
    return CHGL;
})(window.Cesium||{},window.createWebGLHeatmap||{});

/****
 * 
 * 第二种
 * 
 */
;var CesiumHeatmap = (function(Cesium,h337){
  function CH(chviewer,data){
      this._viewer=chviewer;
      //分离业务
      switch(data.type){
        case "url":{ 
             this.loadGeojson(data.obj);
             break; 
         }
         case "wfs":{
            this.loadWFSData(data.obj);
            break; 
       }
     }
  }
  /***
   * 加载后台生成的数据
   * @coordinates
  */
  CH.prototype.loadWFSData = function(data){
          var lonmin=1000;
          var lonmax=-1000;
          var latmin=1000;
          var latmax=-1000;
          data.forEach(function(coordinates){
              var lon = coordinates[0];
              var lat = coordinates[1];
              lonmin = lon<lonmin?lon:lonmin;
              latmin = lat<latmin?lat:latmin;
              lonmax = lon>lonmax?lon:lonmax;
              latmax = lat>latmax?lat:latmax;
          });
          var xrange = lonmax-lonmin;
          var yrange = latmax-latmin;
          var extent={xMin:lonmin-xrange/10,yMin:latmin-yrange/10, xMax:lonmax+xrange/10,yMax:latmax+yrange/10};

          var heatmapContainer = document.createElement('div');
          var width = 1000;
          var height = parseInt(1000/(extent.xMax-extent.xMin)*(extent.yMax-extent.yMin));
          heatmapContainer.setAttribute('style','width:'+width+'px;height:'+height+'px');
          document.body.appendChild(heatmapContainer);

          this.heatmapInstance = h337.create({
              // only container is required, the rest will be defaults
              container: heatmapContainer,
              maxOpacity: .9,
              radius:30,
              // minimum opacity. any value > 0 will produce 
              // no transparent gradient transition
              minOpacity: .1,
              gradient: {
                  // enter n keys between 0 and 1 here
                  // for gradient color customization
                  '.3': 'blue',
                  '.5': 'green',
                  '.7': 'yellow',
                  '.95': 'red'
              },
          });
          var points = [];
          data.forEach(function(coordinates){
              var x = (coordinates[0]-extent.xMin)/(extent.xMax-extent.xMin)*width;
              var y = (-(coordinates[1]-extent.yMin)/(extent.yMax-extent.yMin)+1)*height;
              var point = {
                  x: x,
                  y: y,
                  value: 0.02
              };
              points.push(point);
          });
          var data = { 
              max: 1, 
              data: points 
          };
          this.heatmapInstance.setData(data);
          this.heatmapcanvas = this.heatmapInstance._renderer.canvas;
          this.drawHeatmapRect(this.heatmapcanvas,extent);
          this._viewer.camera.flyTo({
              destination : Cesium.Rectangle.fromDegrees(extent.xMin, extent.yMin, extent.xMax, extent.yMax)
          });

  }
  //加载url
  CH.prototype.loadGeojson = function(url){
      getJSON(url,function(data){
          var lonmin=1000;
          var lonmax=-1000;
          var latmin=1000;
          var latmax=-1000;
          data.features.forEach(function(feature){
              var lon = feature.geometry.coordinates[0];
              var lat = feature.geometry.coordinates[1];
              lonmin = lon<lonmin?lon:lonmin;
              latmin = lat<latmin?lat:latmin;
              lonmax = lon>lonmax?lon:lonmax;
              latmax = lat>latmax?lat:latmax;
          });
          var xrange = lonmax-lonmin;
          var yrange = latmax-latmin;
          var extent={xMin:lonmin-xrange/10,yMin:latmin-yrange/10, xMax:lonmax+xrange/10,yMax:latmax+yrange/10};

          var heatmapContainer = document.createElement('div');
          var width = 1000;
          var height = parseInt(1000/(extent.xMax-extent.xMin)*(extent.yMax-extent.yMin));
          heatmapContainer.setAttribute('style','width:'+width+'px;height:'+height+'px');
          document.body.appendChild(heatmapContainer);

          this.heatmapInstance = h337.create({
              // only container is required, the rest will be defaults
              container: heatmapContainer,
              maxOpacity: .9,
              radius:30,
              // minimum opacity. any value > 0 will produce 
              // no transparent gradient transition
              minOpacity: .1,
              gradient: {
                  // enter n keys between 0 and 1 here
                  // for gradient color customization
                  '.3': 'blue',
                  '.5': 'green',
                  '.7': 'yellow',
                  '.95': 'red'
              },
          });
          var points = [];
          data.features.forEach(function(feature){
              var x = (feature.geometry.coordinates[0]-extent.xMin)/(extent.xMax-extent.xMin)*width;
              var y = (-(feature.geometry.coordinates[1]-extent.yMin)/(extent.yMax-extent.yMin)+1)*height;
              var point = {
                  x: x,
                  y: y,
                  value: 0.02
              };
              points.push(point);
          });
          var data = { 
              max: 1, 
              data: points 
          };
          this.heatmapInstance.setData(data);
          this.heatmapcanvas = this.heatmapInstance._renderer.canvas;
          this.drawHeatmapRect(this.heatmapcanvas,extent);
          //调整视野
          this._viewer.camera.flyTo({
              destination : Cesium.Rectangle.fromDegrees(extent.xMin, extent.yMin, extent.xMax, extent.yMax)
          });
      }.bind(this));
  }

CH.prototype.drawHeatmapRect = function(canvas,extent) {
  var image = convertCanvasToImage(canvas);
  //配置热力图
  this._worldRectangle = this._viewer.scene.primitives.add(new Cesium.Primitive({
    geometryInstances : new Cesium.GeometryInstance({
      geometry : new Cesium.RectangleGeometry({
        rectangle : Cesium.Rectangle.fromDegrees(extent.xMin, extent.yMin, extent.xMax, extent.yMax),
        vertexFormat : Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT
      })
    }),
    appearance : new Cesium.EllipsoidSurfaceAppearance({
      aboveGround : false
    }),
    show : true
  }));
  this._worldRectangle.appearance.material = new Cesium.Material({
    fabric : {
      type : 'Image',
      uniforms : {
        image : image.src
      }
    }
  });
  }

  CH.prototype.updateHeatmap=function(){
      var image = convertCanvasToImage(this.heatmapcanvas);
      this._worldRectangle.appearance.material.uniforms.image=image.src;
  }

  /**
   * Possible configuration properties:
  container (DOMNode) *required* 
  A DOM node where the heatmap canvas should be appended (heatmap will adapt to the node's size)
  backgroundColor (string) *optional*
  A background color string in form of hexcode, color name, or rgb(a)
  gradient (object) *optional*
  An object that represents the gradient (syntax: number string [0,1] : color string), check out the example
  radius (number) *optional*
  The radius each datapoint will have (if not specified on the datapoint itself)
  opacity (number) [0,1] *optional* default = .6
  A global opacity for the whole heatmap. This overrides maxOpacity and minOpacity if set!
  maxOpacity (number) [0,1] *optional*
  The maximal opacity the highest value in the heatmap will have. (will be overridden if opacity set)
  minOpacity(number) [0,1] *optional*
  The minimum opacity the lowest value in the heatmap will have (will be overridden if opacity set)
  onExtremaChange function callback
  Pass a callback to receive extrema change updates. Useful for DOM legends.
  blur (number) [0,1] *optional* default = 0.85
  The blur factor that will be applied to all datapoints. The higher the blur factor is, the smoother the gradients will be
  xField (string) *optional* default = "x"
  The property name of your x coordinate in a datapoint
  yField (string) *optional* default = "y"
  The property name of your y coordinate in a datapoint
  valueField (string) *optional* default = "value"
  The property name of your y coordinate in a datapoint
   */
  CH.prototype.none = function(){
    this._worldRectangle.show = false;
  }
  CH.prototype.show = function(){
    this._worldRectangle.show = true;
  }
   CH.prototype.multiply = function(value){
        this._heatmap.multiply(value);
        this.updateHeatmap();
    }
  CH.prototype.config = function(options){
      this.heatmapInstance.configure(options);
      this.updateHeatmap();
  }

function convertCanvasToImage(canvas) {
  var image = new Image();
  image.src = canvas.toDataURL("image/png");
  return image;
  }

  function getJSON(url, callback) {
  const xhr = new XMLHttpRequest();
  xhr.responseType = 'json';
  xhr.open('get', url, true);
  xhr.onload = function () {
    if (xhr.status >= 200 && xhr.status < 300) {
      callback(xhr.response);
    } else {
      throw new Error(xhr.statusText);
    }
  };
  xhr.send();
}
  
  return CH;
})(window.Cesium||{},window.h337||{});