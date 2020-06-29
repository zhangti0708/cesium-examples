/*
 * @Descripttion: 
 * @version: 1.0
 * @Author: zhangti
 * @Date: 2019-11-20 12:17:21
 * @LastEditors  : sueRimn
 * @LastEditTime : 2020-01-10 18:06:41
 */
/**
 * wind3D
 * 封装风场洋流等效果
 * 对winds改版
 */
const fileOptions = {
    dataDirectory: demo ? 'https://raw.githubusercontent.com/RaymanNg/3D-Wind-Field/master/data/' : config.DATADIR + '/3DWind/data/',
    dataFile: "",
    glslDirectory: demo ? '../Cesium-3D-Wind/glsl/' : config.DATADIR + '/3DWind/glsl/'
}
const defaultParticleSystemOptions = {
    maxParticles: 128 * 128,
    particleHeight: 100.0,
    fadeOpacity: 0.996,
    dropRate: 0.003,
    dropRateBump: 0.01,
    speedFactor: 4.0,
    lineWidth: 4.0
}
const globeLayers = [
    { name: "GOOGLEIMAGERY", type: "GOOGLEIMAGERY" },
    { name: "NaturalEarthII", type: "NaturalEarthII" },
    { name: "WMS:Rainfall", type: "WMS", layer: "Precipitable_water_entire_atmosphere_single_layer", ColorScaleRange: '0.1,66.8' },
    { name: "WMS:Air Pressure", type: "WMS", layer: "Pressure_surface", ColorScaleRange: '51640,103500' },
    { name: "WMS:Temperature", type: "WMS", layer: "Temperature_surface", ColorScaleRange: '204.1,317.5' },
    { name: "WMS:Wind Speed", type: "WMS", layer: "Wind_speed_gust_surface", ColorScaleRange: '0.1095,35.31' },
    { name: "WorldTerrain", type: "WorldTerrain" }
]
const defaultLayerOptions = {
    "globeLayer": globeLayers[0],
    "WMS_URL": "https://www.ncei.noaa.gov/thredds/wms/model-gfs-g4-anl-files/201809/20180916/gfsanl_4_20180916_0000_000.grb2",
}
var demo = false;
const mode = {
    debug: demo ? false : true
};
import {TAG} from './tag.js';
import config from './config.js';
export default class Wind3D {
    /**
     * 初始化
     */
    constructor(opt) {
        if(!opt)return false;
        if(!opt.data)return false;
        if (mode.debug) {
            //options.useDefaultRenderLoop = false;
        }
        this.viewer = opt.viewer;
        fileOptions.dataFile = config.DATADIR + '/3DWind/data/demo.nc'
        this.scene = opt.viewer.scene;
        this.camera = opt.viewer.camera;
        this.primitivesObj = [];
        this.panel = new Panel();

        this.viewerParameters = {
            lonRange: new Cesium.Cartesian2(),
            latRange: new Cesium.Cartesian2(),
            pixelSize: 0.0
        };
        // use a smaller earth radius to make sure distance to camera > 0
        this.globeBoundingSphere = new Cesium.BoundingSphere(Cesium.Cartesian3.ZERO, 0.99 * 6378137.0);
        this.updateViewerParameters();

        DataProcess.loadData().then(
            (data) => {
                this.particleSystem = new ParticleSystem(this.scene.context, data,
                    this.panel.getUserInput(), this.viewerParameters);
                this.addPrimitives();

                this.setupEventListeners();

                if (mode.debug) {
                    this.debug();
                }
                //新增
                setTimeout(function(){
                    $($($('.captureMenuComponent')[0]).parent()).css('display','none')
                    $('.myPanel').css("position","absolute").css("top","6%").css("left","5%");
                    $('.myPanel select').css('color','black');
                },80);
        });
        this.imageryLayers = this.viewer.imageryLayers;
        this.setGlobeLayer(this.panel.getUserInput());
    }
    remove(){
        if(this.primitivesObj != undefined){
            for(let i in this.primitivesObj){
                this.scene.primitives.remove(this.primitivesObj[i]);
            }
            $('.myPanel').remove();
            //初始化
            this.scene.primitives.removeAll();
            this.viewer.imageryLayers.removeAll();
            this.viewer.imageryLayers.addImageryProvider(TAG.BASELAYER.GOOGLEIMAGERY());
        }
        
    }
    addPrimitives() {
        // the order of primitives.add() should respect the dependency of primitives
        this.primitivesObj.push(this.scene.primitives.add(this.particleSystem.particlesComputing.primitives.getWind));
        this.primitivesObj.push(this.scene.primitives.add(this.particleSystem.particlesComputing.primitives.updateSpeed));
        this.primitivesObj.push(this.scene.primitives.add(this.particleSystem.particlesComputing.primitives.updatePosition));
        this.primitivesObj.push(this.scene.primitives.add(this.particleSystem.particlesComputing.primitives.postProcessingPosition));
        this.primitivesObj.push(this.scene.primitives.add(this.particleSystem.particlesComputing.primitives.postProcessingSpeed));

        this.primitivesObj.push(this.scene.primitives.add(this.particleSystem.particlesRendering.primitives.segments));
        this.primitivesObj.push(this.scene.primitives.add(this.particleSystem.particlesRendering.primitives.trails));
        this.primitivesObj.push(this.scene.primitives.add(this.particleSystem.particlesRendering.primitives.screen));
    }

    updateViewerParameters() {
        var viewRectangle = this.camera.computeViewRectangle(this.scene.globe.ellipsoid);
        var lonLatRange = Util.viewRectangleToLonLatRange(viewRectangle);
        this.viewerParameters.lonRange.x = lonLatRange.lon.min;
        this.viewerParameters.lonRange.y = lonLatRange.lon.max;
        this.viewerParameters.latRange.x = lonLatRange.lat.min;
        this.viewerParameters.latRange.y = lonLatRange.lat.max;

        var pixelSize = this.camera.getPixelSize(
            this.globeBoundingSphere,
            this.scene.drawingBufferWidth,
            this.scene.drawingBufferHeight
        );

        if (pixelSize > 0) {
            this.viewerParameters.pixelSize = pixelSize;
        }
    }

    setGlobeLayer(userInput) {
        this.viewer.imageryLayers.removeAll();
        this.viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider();

        var globeLayer = userInput.globeLayer;
        switch (globeLayer.type) {
            case "GOOGLEIMAGERY":this.viewer.imageryLayers.addImageryProvider(TAG.BASELAYER.GOOGLEIMAGERY());
                break;
            case "NaturalEarthII": {
                this.viewer.imageryLayers.addImageryProvider(
                    Cesium.createTileMapServiceImageryProvider({
                        url: Cesium.buildModuleUrl('Assets/Textures/NaturalEarthII')
                    })
                );
                break;
            }
            case "WMS": {
                this.viewer.imageryLayers.addImageryProvider(new Cesium.WebMapServiceImageryProvider({
                    url: userInput.WMS_URL,
                    layers: globeLayer.layer,
                    parameters: {
                        ColorScaleRange: globeLayer.ColorScaleRange
                    }
                }));
                break;
            }
            case "WorldTerrain": {
                this.viewer.imageryLayers.addImageryProvider(
                    Cesium.createWorldImagery()
                );
                this.viewer.terrainProvider = Cesium.createWorldTerrain();
                break;
            }
        }
    }

    setupEventListeners() {
        const that = this;

        this.camera.moveStart.addEventListener(function () {
            that.scene.primitives.show = false;
        });

        this.camera.moveEnd.addEventListener(function () {
            that.updateViewerParameters();
            that.particleSystem.applyViewerParameters(that.viewerParameters);
            that.scene.primitives.show = true;
        });

        var resized = false;
        window.addEventListener("resize", function () {
            resized = true;
            that.scene.primitives.show = false;
            that.scene.primitives.removeAll();
        });

        this.scene.preRender.addEventListener(function () {
            if (resized) {
                that.particleSystem.canvasResize(that.scene.context);
                resized = false;
                that.addPrimitives();
                that.scene.primitives.show = true;
            }
        });

        window.addEventListener('particleSystemOptionsChanged', function () {
            that.particleSystem.applyUserInput(that.panel.getUserInput());
        });
        window.addEventListener('layerOptionsChanged', function () {
            that.setGlobeLayer(that.panel.getUserInput());
        });
    }

    debug() {
        const that = this;

        var animate = function () {
            that.viewer.resize();
            that.viewer.render();
            requestAnimationFrame(animate);
        }

        var spector = new SPECTOR.Spector();
        spector.displayUI();
        spector.spyCanvases();

        animate();
    }
}
/**
 * CustomPrimitive
 */
class CustomPrimitive {
    constructor(options) {
        this.commandType = options.commandType;

        this.geometry = options.geometry;
        this.attributeLocations = options.attributeLocations;
        this.primitiveType = options.primitiveType;

        this.uniformMap = options.uniformMap;

        this.vertexShaderSource = options.vertexShaderSource;
        this.fragmentShaderSource = options.fragmentShaderSource;

        this.rawRenderState = options.rawRenderState;
        this.framebuffer = options.framebuffer;

        this.outputTexture = options.outputTexture;

        this.autoClear = Cesium.defaultValue(options.autoClear, false);
        this.preExecute = options.preExecute;

        this.show = true;
        this.commandToExecute = undefined;
        this.clearCommand = undefined;
        if (this.autoClear) {
            this.clearCommand = new Cesium.ClearCommand({
                color: new Cesium.Color(0.0, 0.0, 0.0, 0.0),
                depth: 1.0,
                framebuffer: this.framebuffer,
                pass: Cesium.Pass.OPAQUE
            });
        }
    }

    createCommand(context) {
        switch (this.commandType) {
            case 'Draw': {
                var vertexArray = Cesium.VertexArray.fromGeometry({
                    context: context,
                    geometry: this.geometry,
                    attributeLocations: this.attributeLocations,
                    bufferUsage: Cesium.BufferUsage.STATIC_DRAW,
                });

                var shaderProgram = Cesium.ShaderProgram.fromCache({
                    context: context,
                    attributeLocations: this.attributeLocations,
                    vertexShaderSource: this.vertexShaderSource,
                    fragmentShaderSource: this.fragmentShaderSource
                });

                var renderState = Cesium.RenderState.fromCache(this.rawRenderState);
                return new Cesium.DrawCommand({
                    owner: this,
                    vertexArray: vertexArray,
                    primitiveType: this.primitiveType,
                    uniformMap: this.uniformMap,
                    modelMatrix: Cesium.Matrix4.IDENTITY,
                    shaderProgram: shaderProgram,
                    framebuffer: this.framebuffer,
                    renderState: renderState,
                    pass: Cesium.Pass.OPAQUE
                });
            }
            case 'Compute': {
                return new Cesium.ComputeCommand({
                    owner: this,
                    fragmentShaderSource: this.fragmentShaderSource,
                    uniformMap: this.uniformMap,
                    outputTexture: this.outputTexture,
                    persists: true
                });
            }
        }
    }

    setGeometry(context, geometry) {
        this.geometry = geometry;
        var vertexArray = Cesium.VertexArray.fromGeometry({
            context: context,
            geometry: this.geometry,
            attributeLocations: this.attributeLocations,
            bufferUsage: Cesium.BufferUsage.STATIC_DRAW,
        });
        this.commandToExecute.vertexArray = vertexArray;
    }

    update(frameState) {
        if (!this.show) {
            return;
        }

        if (!Cesium.defined(this.commandToExecute)) {
            this.commandToExecute = this.createCommand(frameState.context);
        }

        if (Cesium.defined(this.preExecute)) {
            this.preExecute();
        }

        if (Cesium.defined(this.clearCommand)) {
            frameState.commandList.push(this.clearCommand);
        }
        frameState.commandList.push(this.commandToExecute);
    }

    isDestroyed() {
        return false;
    }

    destroy() {
        if (Cesium.defined(this.commandToExecute)) {
            this.commandToExecute.shaderProgram = this.commandToExecute.shaderProgram && this.commandToExecute.shaderProgram.destroy();
        }
        return Cesium.destroyObject(this);
    }
}
/**
 * ParticlesComputing
 */
class ParticlesComputing {
    constructor(context, data, userInput, viewerParameters) {
        this.createWindTextures(context, data);
        this.createParticlesTextures(context, userInput, viewerParameters);
        this.createComputingPrimitives(data, userInput, viewerParameters);
    }

    createWindTextures(context, data) {
        var windTextureOptions = {
            context: context,
            width: data.dimensions.lon,
            height: data.dimensions.lat * data.dimensions.lev,
            pixelFormat: Cesium.PixelFormat.LUMINANCE,
            pixelDatatype: Cesium.PixelDatatype.FLOAT,
            flipY: false,
            sampler: new Cesium.Sampler({
                // the values of texture will not be interpolated
                minificationFilter: Cesium.TextureMinificationFilter.NEAREST,
                magnificationFilter: Cesium.TextureMagnificationFilter.NEAREST
            })
        };

        this.windTextures = {
            U: Util.createTexture(windTextureOptions, data.U.array),
            V: Util.createTexture(windTextureOptions, data.V.array)
        };
    }

    createParticlesTextures(context, userInput, viewerParameters) {
        var particlesTextureOptions = {
            context: context,
            width: userInput.particlesTextureSize,
            height: userInput.particlesTextureSize,
            pixelFormat: Cesium.PixelFormat.RGBA,
            pixelDatatype: Cesium.PixelDatatype.FLOAT,
            flipY: false,
            sampler: new Cesium.Sampler({
                // the values of texture will not be interpolated
                minificationFilter: Cesium.TextureMinificationFilter.NEAREST,
                magnificationFilter: Cesium.TextureMagnificationFilter.NEAREST
            })
        };

        var particlesArray = DataProcess.randomizeParticles(userInput.maxParticles, viewerParameters)

        this.particlesTextures = {
            particlesWind: Util.createTexture(particlesTextureOptions),

            currentParticlesPosition: Util.createTexture(particlesTextureOptions, particlesArray),
            nextParticlesPosition: Util.createTexture(particlesTextureOptions, particlesArray),

            currentParticlesSpeed: Util.createTexture(particlesTextureOptions),
            nextParticlesSpeed: Util.createTexture(particlesTextureOptions),

            postProcessingPosition: Util.createTexture(particlesTextureOptions, particlesArray),
            postProcessingSpeed: Util.createTexture(particlesTextureOptions)
        };
    }

    destroyParticlesTextures() {
        Object.keys(this.particlesTextures).forEach((key) => {
            this.particlesTextures[key].destroy();
        });
    }

    createComputingPrimitives(data, userInput, viewerParameters) {
        const dimension = new Cesium.Cartesian3(data.dimensions.lon, data.dimensions.lat, data.dimensions.lev);
        const minimum = new Cesium.Cartesian3(data.lon.min, data.lat.min, data.lev.min);
        const maximum = new Cesium.Cartesian3(data.lon.max, data.lat.max, data.lev.max);
        const interval = new Cesium.Cartesian3(
            (maximum.x - minimum.x) / (dimension.x - 1),
            (maximum.y - minimum.y) / (dimension.y - 1),
            dimension.z > 1 ? (maximum.z - minimum.z) / (dimension.z - 1) : 1.0
        );
        const uSpeedRange = new Cesium.Cartesian2(data.U.min, data.U.max);
        const vSpeedRange = new Cesium.Cartesian2(data.V.min, data.V.max);

        const that = this;

        this.primitives = {
            getWind: new CustomPrimitive({
                commandType: 'Compute',
                uniformMap: {
                    U: function () {
                        return that.windTextures.U;
                    },
                    V: function () {
                        return that.windTextures.V;
                    },
                    currentParticlesPosition: function () {
                        return that.particlesTextures.currentParticlesPosition;
                    },
                    dimension: function () {
                        return dimension;
                    },
                    minimum: function () {
                        return minimum;
                    },
                    maximum: function () {
                        return maximum;
                    },
                    interval: function () {
                        return interval;
                    }
                },
                fragmentShaderSource: new Cesium.ShaderSource({
                    sources: [Util.loadText(fileOptions.glslDirectory + 'getWind.frag')]
                }),
                outputTexture: this.particlesTextures.particlesWind,
                preExecute: function () {
                    // keep the outputTexture up to date
                    that.primitives.getWind.commandToExecute.outputTexture = that.particlesTextures.particlesWind;
                }
            }),

            updateSpeed: new CustomPrimitive({
                commandType: 'Compute',
                uniformMap: {
                    currentParticlesSpeed: function () {
                        return that.particlesTextures.currentParticlesSpeed;
                    },
                    particlesWind: function () {
                        return that.particlesTextures.particlesWind;
                    },
                    uSpeedRange: function () {
                        return uSpeedRange;
                    },
                    vSpeedRange: function () {
                        return vSpeedRange;
                    },
                    pixelSize: function () {
                        return viewerParameters.pixelSize;
                    },
                    speedFactor: function () {
                        return userInput.speedFactor;
                    }
                },
                fragmentShaderSource: new Cesium.ShaderSource({
                    sources: [Util.loadText(fileOptions.glslDirectory + 'updateSpeed.frag')]
                }),
                outputTexture: this.particlesTextures.nextParticlesSpeed,
                preExecute: function () {
                    // swap textures before binding
                    var temp;
                    temp = that.particlesTextures.currentParticlesSpeed;
                    that.particlesTextures.currentParticlesSpeed = that.particlesTextures.postProcessingSpeed;
                    that.particlesTextures.postProcessingSpeed = temp;

                    // keep the outputTexture up to date
                    that.primitives.updateSpeed.commandToExecute.outputTexture = that.particlesTextures.nextParticlesSpeed;
                }
            }),

            updatePosition: new CustomPrimitive({
                commandType: 'Compute',
                uniformMap: {
                    currentParticlesPosition: function () {
                        return that.particlesTextures.currentParticlesPosition;
                    },
                    currentParticlesSpeed: function () {
                        return that.particlesTextures.currentParticlesSpeed;
                    }
                },
                fragmentShaderSource: new Cesium.ShaderSource({
                    sources: [Util.loadText(fileOptions.glslDirectory + 'updatePosition.frag')]
                }),
                outputTexture: this.particlesTextures.nextParticlesPosition,
                preExecute: function () {
                    // swap textures before binding
                    var temp;
                    temp = that.particlesTextures.currentParticlesPosition;
                    that.particlesTextures.currentParticlesPosition = that.particlesTextures.postProcessingPosition;
                    that.particlesTextures.postProcessingPosition = temp;

                    // keep the outputTexture up to date
                    that.primitives.updatePosition.commandToExecute.outputTexture = that.particlesTextures.nextParticlesPosition;
                }
            }),

            postProcessingPosition: new CustomPrimitive({
                commandType: 'Compute',
                uniformMap: {
                    nextParticlesPosition: function () {
                        return that.particlesTextures.nextParticlesPosition;
                    },
                    nextParticlesSpeed: function () {
                        return that.particlesTextures.nextParticlesSpeed;
                    },
                    lonRange: function () {
                        return viewerParameters.lonRange;
                    },
                    latRange: function () {
                        return viewerParameters.latRange;
                    },
                    randomCoef: function () {
                        var randomCoef = Math.random();
                        return randomCoef;
                    },
                    dropRate: function () {
                        return userInput.dropRate;
                    },
                    dropRateBump: function () {
                        return userInput.dropRateBump;
                    }
                },
                fragmentShaderSource: new Cesium.ShaderSource({
                    sources: [Util.loadText(fileOptions.glslDirectory + 'postProcessingPosition.frag')]
                }),
                outputTexture: this.particlesTextures.postProcessingPosition,
                preExecute: function () {
                    // keep the outputTexture up to date
                    that.primitives.postProcessingPosition.commandToExecute.outputTexture = that.particlesTextures.postProcessingPosition;
                }
            }),

            postProcessingSpeed: new CustomPrimitive({
                commandType: 'Compute',
                uniformMap: {
                    postProcessingPosition: function () {
                        return that.particlesTextures.postProcessingPosition;
                    },
                    nextParticlesSpeed: function () {
                        return that.particlesTextures.nextParticlesSpeed;
                    }
                },
                fragmentShaderSource: new Cesium.ShaderSource({
                    sources: [Util.loadText(fileOptions.glslDirectory + 'postProcessingSpeed.frag')]
                }),
                outputTexture: this.particlesTextures.postProcessingSpeed,
                preExecute: function () {
                    // keep the outputTexture up to date
                    that.primitives.postProcessingSpeed.commandToExecute.outputTexture = that.particlesTextures.postProcessingSpeed;
                }
            })
        }
    }
}
/**
 * ParticlesRendering
 */
class ParticlesRendering {
    constructor(context, data, userInput, viewerParameters, particlesComputing) {
        this.createRenderingTextures(context, data);
        this.createRenderingFramebuffers(context);
        this.createRenderingPrimitives(context, userInput, viewerParameters, particlesComputing);
    }

    createRenderingTextures(context, data) {
        const colorTextureOptions = {
            context: context,
            width: context.drawingBufferWidth,
            height: context.drawingBufferHeight,
            pixelFormat: Cesium.PixelFormat.RGBA,
            pixelDatatype: Cesium.PixelDatatype.UNSIGNED_BYTE
        };
        const depthTextureOptions = {
            context: context,
            width: context.drawingBufferWidth,
            height: context.drawingBufferHeight,
            pixelFormat: Cesium.PixelFormat.DEPTH_COMPONENT,
            pixelDatatype: Cesium.PixelDatatype.UNSIGNED_INT
        };
        const colorTableTextureOptions = {
            context: context,
            width: data.colorTable.colorNum,
            height: 1,
            pixelFormat: Cesium.PixelFormat.RGB,
            pixelDatatype: Cesium.PixelDatatype.FLOAT,
            sampler: new Cesium.Sampler({
                minificationFilter: Cesium.TextureMinificationFilter.LINEAR,
                magnificationFilter: Cesium.TextureMagnificationFilter.LINEAR
            })
        };

        this.textures = {
            segmentsColor: Util.createTexture(colorTextureOptions),
            segmentsDepth: Util.createTexture(depthTextureOptions),

            currentTrailsColor: Util.createTexture(colorTextureOptions),
            currentTrailsDepth: Util.createTexture(depthTextureOptions),

            nextTrailsColor: Util.createTexture(colorTextureOptions),
            nextTrailsDepth: Util.createTexture(depthTextureOptions),

            colorTable: Util.createTexture(colorTableTextureOptions, data.colorTable.array)
        };
    }

    createRenderingFramebuffers(context) {
        this.framebuffers = {
            segments: Util.createFramebuffer(context, this.textures.segmentsColor, this.textures.segmentsDepth),
            currentTrails: Util.createFramebuffer(context, this.textures.currentTrailsColor, this.textures.currentTrailsDepth),
            nextTrails: Util.createFramebuffer(context, this.textures.nextTrailsColor, this.textures.nextTrailsDepth)
        }
    }

    createSegmentsGeometry(userInput) {
        const repeatVertex = 4;

        var st = [];
        for (var s = 0; s < userInput.particlesTextureSize; s++) {
            for (var t = 0; t < userInput.particlesTextureSize; t++) {
                for (var i = 0; i < repeatVertex; i++) {
                    st.push(s / userInput.particlesTextureSize);
                    st.push(t / userInput.particlesTextureSize);
                }
            }
        }
        st = new Float32Array(st);

        var normal = [];
        const pointToUse = [-1, 1];
        const offsetSign = [-1, 1];
        for (var i = 0; i < userInput.maxParticles; i++) {
            for (var j = 0; j < repeatVertex / 2; j++) {
                for (var k = 0; k < repeatVertex / 2; k++) {
                    normal.push(pointToUse[j]);
                    normal.push(offsetSign[k]);
                    normal.push(0);
                }
            }
        }
        normal = new Float32Array(normal);

        const indexSize = 6 * userInput.maxParticles;
        var vertexIndexes = new Uint32Array(indexSize);
        for (var i = 0, j = 0, vertex = 0; i < userInput.maxParticles; i++) {
            vertexIndexes[j++] = vertex + 0;
            vertexIndexes[j++] = vertex + 1;
            vertexIndexes[j++] = vertex + 2;
            vertexIndexes[j++] = vertex + 2;
            vertexIndexes[j++] = vertex + 1;
            vertexIndexes[j++] = vertex + 3;
            vertex += 4;
        }

        var geometry = new Cesium.Geometry({
            attributes: new Cesium.GeometryAttributes({
                st: new Cesium.GeometryAttribute({
                    componentDatatype: Cesium.ComponentDatatype.FLOAT,
                    componentsPerAttribute: 2,
                    values: st
                }),
                normal: new Cesium.GeometryAttribute({
                    componentDatatype: Cesium.ComponentDatatype.FLOAT,
                    componentsPerAttribute: 3,
                    values: normal
                }),
            }),
            indices: vertexIndexes
        });

        return geometry;
    }

    createRenderingPrimitives(context, userInput, viewerParameters, particlesComputing) {
        const that = this;
        this.primitives = {
            segments: new CustomPrimitive({
                commandType: 'Draw',
                attributeLocations: {
                    st: 0,
                    normal: 1
                },
                geometry: this.createSegmentsGeometry(userInput),
                primitiveType: Cesium.PrimitiveType.TRIANGLES,
                uniformMap: {
                    currentParticlesPosition: function () {
                        return particlesComputing.particlesTextures.currentParticlesPosition;
                    },
                    postProcessingPosition: function () {
                        return particlesComputing.particlesTextures.postProcessingPosition;
                    },
                    postProcessingSpeed: function () {
                        return particlesComputing.particlesTextures.postProcessingSpeed;
                    },
                    colorTable: function () {
                        return that.textures.colorTable;
                    },
                    aspect: function () {
                        return context.drawingBufferWidth / context.drawingBufferHeight;
                    },
                    pixelSize: function () {
                        return viewerParameters.pixelSize;
                    },
                    lineWidth: function () {
                        return userInput.lineWidth;
                    },
                    particleHeight: function () {
                        return userInput.particleHeight;
                    }
                },
                vertexShaderSource: new Cesium.ShaderSource({
                    sources: [Util.loadText(fileOptions.glslDirectory + 'segmentDraw.vert')]
                }),
                fragmentShaderSource: new Cesium.ShaderSource({
                    sources: [Util.loadText(fileOptions.glslDirectory + 'segmentDraw.frag')]
                }),
                rawRenderState: Util.createRawRenderState({
                    // undefined value means let Cesium deal with it
                    viewport: undefined,
                    depthTest: {
                        enabled: true
                    },
                    depthMask: true
                }),
                framebuffer: this.framebuffers.segments,
                autoClear: true
            }),

            trails: new CustomPrimitive({
                commandType: 'Draw',
                attributeLocations: {
                    position: 0,
                    st: 1
                },
                geometry: Util.getFullscreenQuad(),
                primitiveType: Cesium.PrimitiveType.TRIANGLES,
                uniformMap: {
                    segmentsColorTexture: function () {
                        return that.textures.segmentsColor;
                    },
                    segmentsDepthTexture: function () {
                        return that.textures.segmentsDepth;
                    },
                    currentTrailsColor: function () {
                        return that.framebuffers.currentTrails.getColorTexture(0);
                    },
                    trailsDepthTexture: function () {
                        return that.framebuffers.currentTrails.depthTexture;
                    },
                    fadeOpacity: function () {
                        return userInput.fadeOpacity;
                    }
                },
                // prevent Cesium from writing depth because the depth here should be written manually
                vertexShaderSource: new Cesium.ShaderSource({
                    defines: ['DISABLE_GL_POSITION_LOG_DEPTH'],
                    sources: [Util.loadText(fileOptions.glslDirectory + 'fullscreen.vert')]
                }),
                fragmentShaderSource: new Cesium.ShaderSource({
                    defines: ['DISABLE_LOG_DEPTH_FRAGMENT_WRITE'],
                    sources: [Util.loadText(fileOptions.glslDirectory + 'trailDraw.frag')]
                }),
                rawRenderState: Util.createRawRenderState({
                    viewport: undefined,
                    depthTest: {
                        enabled: true,
                        func: Cesium.DepthFunction.ALWAYS // always pass depth test for full control of depth information
                    },
                    depthMask: true
                }),
                framebuffer: this.framebuffers.nextTrails,
                autoClear: true,
                preExecute: function () {
                    // swap framebuffers before binding
                    var temp;
                    temp = that.framebuffers.currentTrails;
                    that.framebuffers.currentTrails = that.framebuffers.nextTrails;
                    that.framebuffers.nextTrails = temp;

                    // keep the framebuffers up to date
                    that.primitives.trails.commandToExecute.framebuffer = that.framebuffers.nextTrails;
                    that.primitives.trails.clearCommand.framebuffer = that.framebuffers.nextTrails;
                }
            }),

            screen: new CustomPrimitive({
                commandType: 'Draw',
                attributeLocations: {
                    position: 0,
                    st: 1
                },
                geometry: Util.getFullscreenQuad(),
                primitiveType: Cesium.PrimitiveType.TRIANGLES,
                uniformMap: {
                    trailsColorTexture: function () {
                        return that.framebuffers.nextTrails.getColorTexture(0);
                    },
                    trailsDepthTexture: function () {
                        return that.framebuffers.nextTrails.depthTexture;
                    }
                },
                // prevent Cesium from writing depth because the depth here should be written manually
                vertexShaderSource: new Cesium.ShaderSource({
                    defines: ['DISABLE_GL_POSITION_LOG_DEPTH'],
                    sources: [Util.loadText(fileOptions.glslDirectory + 'fullscreen.vert')]
                }),
                fragmentShaderSource: new Cesium.ShaderSource({
                    defines: ['DISABLE_LOG_DEPTH_FRAGMENT_WRITE'],
                    sources: [Util.loadText(fileOptions.glslDirectory + 'screenDraw.frag')]
                }),
                rawRenderState: Util.createRawRenderState({
                    viewport: undefined,
                    depthTest: {
                        enabled: false
                    },
                    depthMask: true,
                    blending: {
                        enabled: true
                    }
                }),
                framebuffer: undefined // undefined value means let Cesium deal with it
            })
        };
    }
}
/**
 * ParticleSystem
 */
class ParticleSystem {
    constructor(context, data, userInput, viewerParameters) {
        this.context = context;
        this.data = data;
        this.userInput = userInput;
        this.viewerParameters = viewerParameters;

        this.particlesComputing = new ParticlesComputing(
            this.context, this.data,
            this.userInput, this.viewerParameters
        );
        this.particlesRendering = new ParticlesRendering(
            this.context, this.data,
            this.userInput, this.viewerParameters,
            this.particlesComputing
        );
    }

    canvasResize(context) {
        this.particlesComputing.destroyParticlesTextures();
        Object.keys(this.particlesComputing.windTextures).forEach((key) => {
            this.particlesComputing.windTextures[key].destroy();
        });

        this.particlesRendering.textures.colorTable.destroy();
        Object.keys(this.particlesRendering.framebuffers).forEach((key) => {
            this.particlesRendering.framebuffers[key].destroy();
        });

        this.context = context;
        this.particlesComputing = new ParticlesComputing(
            this.context, this.data,
            this.userInput, this.viewerParameters
        );
        this.particlesRendering = new ParticlesRendering(
            this.context, this.data,
            this.userInput, this.viewerParameters,
            this.particlesComputing
        );
    }

    clearFramebuffers() {
        var clearCommand = new Cesium.ClearCommand({
            color: new Cesium.Color(0.0, 0.0, 0.0, 0.0),
            depth: 1.0,
            framebuffer: undefined,
            pass: Cesium.Pass.OPAQUE
        });

        Object.keys(this.particlesRendering.framebuffers).forEach((key) => {
            clearCommand.framebuffer = this.particlesRendering.framebuffers[key];
            clearCommand.execute(this.context);
        });
    }

    refreshParticles(maxParticlesChanged) {
        this.clearFramebuffers();

        this.particlesComputing.destroyParticlesTextures();
        this.particlesComputing.createParticlesTextures(this.context, this.userInput, this.viewerParameters);

        if (maxParticlesChanged) {
            var geometry = this.particlesRendering.createSegmentsGeometry(this.userInput);
            this.particlesRendering.primitives.segments.geometry = geometry;
            var vertexArray = Cesium.VertexArray.fromGeometry({
                context: this.context,
                geometry: geometry,
                attributeLocations: this.particlesRendering.primitives.segments.attributeLocations,
                bufferUsage: Cesium.BufferUsage.STATIC_DRAW,
            });
            this.particlesRendering.primitives.segments.commandToExecute.vertexArray = vertexArray;
        }
    }

    applyUserInput(userInput) {
        var maxParticlesChanged = false;
        if (this.userInput.maxParticles != userInput.maxParticles) {
            maxParticlesChanged = true;
        }

        Object.keys(userInput).forEach((key) => {
            this.userInput[key] = userInput[key];
        });
        this.refreshParticles(maxParticlesChanged);
    }

    applyViewerParameters(viewerParameters) {
        Object.keys(viewerParameters).forEach((key) => {
            this.viewerParameters[key] = viewerParameters[key];
        });
        this.refreshParticles(false);
    }
}

class Panel {
    constructor() {
        this.maxParticles = defaultParticleSystemOptions.maxParticles;
        this.particleHeight = defaultParticleSystemOptions.particleHeight;
        this.fadeOpacity = defaultParticleSystemOptions.fadeOpacity;
        this.dropRate = defaultParticleSystemOptions.dropRate;
        this.dropRateBump = defaultParticleSystemOptions.dropRateBump;
        this.speedFactor = defaultParticleSystemOptions.speedFactor;
        this.lineWidth = defaultParticleSystemOptions.lineWidth;

        this.globeLayer = defaultLayerOptions.globeLayer;
        this.WMS_URL = defaultLayerOptions.WMS_URL;

        var layerNames = [];
        globeLayers.forEach(function (layer) {
            layerNames.push(layer.name);
        });
        this.layerToShow = layerNames[0];

        var onParticleSystemOptionsChange = function () {
            var event = new CustomEvent('particleSystemOptionsChanged');
            window.dispatchEvent(event);
        }

        const that = this;
        var onLayerOptionsChange = function () {
            for (var i = 0; i < globeLayers.length; i++) {
                if (that.layerToShow == globeLayers[i].name) {
                    that.globeLayer = globeLayers[i];
                    break;
                }
            }
            var event = new CustomEvent('layerOptionsChanged');
            window.dispatchEvent(event);
        }
        //创建控制面版
        var gui = new dat.GUI({ autoPlace: false });
        gui.add(that, 'maxParticles', 1, 256 * 256, 1).onFinishChange(onParticleSystemOptionsChange);
        gui.add(that, 'particleHeight', 1, 10000, 1).onFinishChange(onParticleSystemOptionsChange);
        gui.add(that, 'fadeOpacity', 0.90, 0.999, 0.001).onFinishChange(onParticleSystemOptionsChange);
        gui.add(that, 'dropRate', 0.0, 0.1).onFinishChange(onParticleSystemOptionsChange);
        gui.add(that, 'dropRateBump', 0, 0.2).onFinishChange(onParticleSystemOptionsChange);
        gui.add(that, 'speedFactor', 0.5, 100).onFinishChange(onParticleSystemOptionsChange);
        gui.add(that, 'lineWidth', 0.01, 16.0).onFinishChange(onParticleSystemOptionsChange);
        gui.add(that, 'layerToShow', layerNames).onFinishChange(onLayerOptionsChange);
        var panelContainer = document.getElementsByClassName('cesium-widget').item(0);
        gui.domElement.classList.add('myPanel');
        panelContainer.appendChild(gui.domElement);
    }

    getUserInput() {
        // make sure maxParticles is exactly the square of particlesTextureSize
        var particlesTextureSize = Math.ceil(Math.sqrt(this.maxParticles));
        this.maxParticles = particlesTextureSize * particlesTextureSize;

        return {
            particlesTextureSize: particlesTextureSize,
            maxParticles: this.maxParticles,
            particleHeight: this.particleHeight,
            fadeOpacity: this.fadeOpacity,
            dropRate: this.dropRate,
            dropRateBump: this.dropRateBump,
            speedFactor: this.speedFactor,
            lineWidth: this.lineWidth,
            globeLayer: this.globeLayer,
            WMS_URL: this.WMS_URL
        }
    }
}
/**
 * 工具
 */
var Util = (function () {
	var loadText = function (filePath) {
		var request = new XMLHttpRequest();
		request.open('GET', filePath, false);
		request.send();
		return request.responseText;
	}
	var getFullscreenQuad = function () {
		var fullscreenQuad = new Cesium.Geometry({
			attributes: new Cesium.GeometryAttributes({
				position: new Cesium.GeometryAttribute({
					componentDatatype: Cesium.ComponentDatatype.FLOAT,
					componentsPerAttribute: 3,
					//  v3----v2
					//  |     |
					//  |     |
					//  v0----v1
					values: new Float32Array([
						-1, -1, 0, // v0
						1, -1, 0, // v1
						1, 1, 0, // v2
						-1, 1, 0, // v3
					])
				}),
				st: new Cesium.GeometryAttribute({
					componentDatatype: Cesium.ComponentDatatype.FLOAT,
					componentsPerAttribute: 2,
					values: new Float32Array([
						0, 0,
						1, 0,
						1, 1,
						0, 1,
					])
				})
			}),
			indices: new Uint32Array([3, 2, 0, 0, 2, 1])
		});
		return fullscreenQuad;
	}

	var createTexture = function (options, typedArray) {
		if (Cesium.defined(typedArray)) {
			// typed array needs to be passed as source option, this is required by Cesium.Texture
			var source = {};
			source.arrayBufferView = typedArray;
			options.source = source;
		}
		var texture = new Cesium.Texture(options);
		return texture;
	}

	var createFramebuffer = function (context, colorTexture, depthTexture) {
		var framebuffer = new Cesium.Framebuffer({
			context: context,
			colorTextures: [colorTexture],
			depthTexture: depthTexture
		});
		return framebuffer;
	}

	var createRawRenderState = function (options) {
		var translucent = true;
		var closed = false;
		var existing = {
			viewport: options.viewport,
			depthTest: options.depthTest,
			depthMask: options.depthMask,
			blending: options.blending
		};

		var rawRenderState = Cesium.Appearance.getDefaultRenderState(translucent, closed, existing);
		return rawRenderState;
	}

	var viewRectangleToLonLatRange = function (viewRectangle) {
		var range = {};

		var postiveWest = Cesium.Math.mod(viewRectangle.west, Cesium.Math.TWO_PI);
		var postiveEast = Cesium.Math.mod(viewRectangle.east, Cesium.Math.TWO_PI);
		var width = viewRectangle.width;

		var longitudeMin;
		var longitudeMax;
		if (width > Cesium.Math.THREE_PI_OVER_TWO) {
			longitudeMin = 0.0;
			longitudeMax = Cesium.Math.TWO_PI;
		} else {
			if (postiveEast - postiveWest < width) {
				longitudeMin = postiveWest;
				longitudeMax = postiveWest + width;
			} else {
				longitudeMin = postiveWest;
				longitudeMax = postiveEast;
			}
		}

		range.lon = {
			min: Cesium.Math.toDegrees(longitudeMin),
			max: Cesium.Math.toDegrees(longitudeMax)
		}

		var south = viewRectangle.south;
		var north = viewRectangle.north;
		var height = viewRectangle.height;

		var extendHeight = height > Cesium.Math.PI / 12 ? height / 2 : 0;
		var extendedSouth = Cesium.Math.clampToLatitudeRange(south - extendHeight);
		var extendedNorth = Cesium.Math.clampToLatitudeRange(north + extendHeight);

		// extend the bound in high latitude area to make sure it can cover all the visible area
		if (extendedSouth < -Cesium.Math.PI_OVER_THREE) {
			extendedSouth = -Cesium.Math.PI_OVER_TWO;
		}
		if (extendedNorth > Cesium.Math.PI_OVER_THREE) {
			extendedNorth = Cesium.Math.PI_OVER_TWO;
		}

		range.lat = {
			min: Cesium.Math.toDegrees(extendedSouth),
			max: Cesium.Math.toDegrees(extendedNorth)
		}

		return range;
	}

	return {
		loadText: loadText,
		getFullscreenQuad: getFullscreenQuad,
		createTexture: createTexture,
		createFramebuffer: createFramebuffer,
		createRawRenderState: createRawRenderState,
		viewRectangleToLonLatRange: viewRectangleToLonLatRange
	};
})();
var DataProcess = (function () {
    var data;

    var loadNetCDF = function (filePath) {
        return new Promise(function (resolve) {
            var request = new XMLHttpRequest();
            request.open('GET', filePath);
            request.responseType = 'arraybuffer';

            request.onload = function () {
                var arrayToMap = function (array) {
                    return array.reduce(function (map, object) {
                        map[object.name] = object;
                        return map;
                    }, {});
                }

                var NetCDF = new netcdfjs(request.response);
                data = {};

                var dimensions = arrayToMap(NetCDF.dimensions);
                console.log(dimensions);
                data.dimensions = {};
                data.dimensions.lon = dimensions['lon'].size;
                data.dimensions.lat = dimensions['lat'].size;
                data.dimensions.lev = dimensions['lev'].size;

                var variables = arrayToMap(NetCDF.variables);
                var uAttributes = arrayToMap(variables['U'].attributes);
                var vAttributes = arrayToMap(variables['V'].attributes);

                data.lon = {};
                data.lon.array = new Float32Array(NetCDF.getDataVariable('lon').flat());
                data.lon.min = Math.min(...data.lon.array);
                data.lon.max = Math.max(...data.lon.array);

                data.lat = {};
                data.lat.array = new Float32Array(NetCDF.getDataVariable('lat').flat());
                data.lat.min = Math.min(...data.lat.array);
                data.lat.max = Math.max(...data.lat.array);

                data.lev = {};
                data.lev.array = new Float32Array(NetCDF.getDataVariable('lev').flat());
                data.lev.min = Math.min(...data.lev.array);
                data.lev.max = Math.max(...data.lev.array);

                data.U = {};
                data.U.array = new Float32Array(NetCDF.getDataVariable('U').flat());
                data.U.min = uAttributes['min'].value;
                data.U.max = uAttributes['max'].value;

                data.V = {};
                data.V.array = new Float32Array(NetCDF.getDataVariable('V').flat());
                data.V.min = vAttributes['min'].value;
                data.V.max = vAttributes['max'].value;

                resolve(data);
            };

            request.send();
        });
    }

    var loadColorTable = function (filePath) {
        var string = Util.loadText(filePath);
        var json = JSON.parse(string);

        var colorNum = json['ncolors'];
        var colorTable = json['colorTable'];

        var colorsArray = new Float32Array(3 * colorNum);
        for (var i = 0; i < colorNum; i++) {
            colorsArray[3 * i] = colorTable[3 * i];
            colorsArray[3 * i + 1] = colorTable[3 * i + 1];
            colorsArray[3 * i + 2] = colorTable[3 * i + 2];
        }

        data.colorTable = {};
        data.colorTable.colorNum = colorNum;
        data.colorTable.array = colorsArray;
    }

    var loadData = async function () {
        var ncFilePath = fileOptions.dataFile;
        await loadNetCDF(ncFilePath);
        var colorTableFilePath = fileOptions.dataDirectory + 'colorTable.json';
        loadColorTable(colorTableFilePath);

        return data;
    }

    var randomizeParticles = function (maxParticles, viewerParameters) {
        var array = new Float32Array(4 * maxParticles);
        for (var i = 0; i < maxParticles; i++) {
            array[4 * i] = Cesium.Math.randomBetween(viewerParameters.lonRange.x, viewerParameters.lonRange.y);
            array[4 * i + 1] = Cesium.Math.randomBetween(viewerParameters.latRange.x, viewerParameters.latRange.y);
            array[4 * i + 2] = Cesium.Math.randomBetween(data.lev.min, data.lev.max);
            array[4 * i + 3] = 0.0;
        }
        return array;
    }

    return {
        loadData: loadData,
        randomizeParticles: randomizeParticles
    };

})();

