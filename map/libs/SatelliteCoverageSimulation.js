(function () {
    "use strict";
    function n(t, e) {
        e = e || {},
            a = t.scene.globe.ellipsoid,
            this._geometry = null,
            this._areaType = e.areaType ? e.areaType : n.AreaType.FourPrism,
            this._angle1 = e.angle1 ? e.angle1 : 10,
            this._angle2 = e.angle2 ? e.angle2 : 10,
            this._length = e.length ? e.length : 1e6,
            this._position = e.position, this.autoAngle = e.autoAngle,
            this._rotation = e.rotation ? e.rotation : {
                heading: 0,
                pitch: 0,
                roll: 0
            },
            this._show = Cesium.defaultValue(e.show, !0),
            this._outline = Cesium.defaultValue(e.outline, !1),
            this._groundArea = Cesium.defaultValue(e.groundArea, !1),
            this._groundOutLine = Cesium.defaultValue(e.groundOutLine, !1),
            this.defaultColor = e.color ? e.color : Cesium.Color.YELLOW,
            this.defaultLineColor = e.lineColor, this._groundAreaColor = e.groundAreaColor,
            this._groundOutLineColor = e.groundOutLineColor,
            this._modelMatrix = Cesium.Matrix4.clone(Cesium.Matrix4.IDENTITY),
            this._quaternion = new Cesium.Quaternion,
            this._translation = new Cesium.Cartesian3,
            this._scale = new Cesium.Cartesian3(1, 1, 1),
            this._matrix = new Cesium.Matrix4,
            this._inverseMatrix = new Cesium.Matrix4,
            this._positionCartographic = new Cesium.Cartographic,
            this._positionCartesian = null,
            this._drawCommands = [],
            this._outlinePositions = [],
            this._imagingAreaPositions = [],
            this._trackedEntity = e.trackedEntity,
            this._trackPositions = [],
            this._trackGeometries = [],
            this._track = {
                geometry: null,
                needsUpdate: !1,
                lastestFrame: null
            },
            this.viewer = t,
            this.viewer.scene.primitives.add(this),
            this.addGroundAreaEntity(this._groundArea || this._groundOutLine)
    }
    function r(t) {
        var e = [];
        for (var i in t.attributes)
            t.attributes.hasOwnProperty(i) && t.attributes[i] && e.push(i);
        return e
    }
    function o(t, e, i, n, r, o, a) {
        r = r || Cesium.Ellipsoid.WGS84, o || (o = []),
            Cesium.Matrix4.inverse(e, m),
            Cesium.Matrix4.multiplyByPoint(e, Cesium.Cartesian3.ZERO, p),
            p.clone(c.origin);
        var s = 0;
        n = Math.min(t.length, i + n);
        for (var l = i; l < n; l += 3) {
            Cesium.Cartesian3.unpack(t, l, f),
                Cesium.Matrix4.multiplyByPoint(e, f, p),
                Cesium.Cartesian3.subtract(p, c.origin, c.direction),
                Cesium.Cartesian3.normalize(c.direction, c.direction);
            var h = Cesium.IntersectionTests.rayEllipsoid(c, r),
                d = null;
            h && (d = Cesium.Ray.getPoint(c, h.start)), d ? (d.clone(p), o[s] = p.clone(o[s]), a && a instanceof Float32Array && (Cesium.Matrix4.multiplyByPoint(m, p, p), a[i + 3 * s] = p.x, a[i + 3 * s + 1] = p.y, a[i + 3 * s + 2] = p.z), s++) : s++
        }
        return o
    }
    Object.defineProperty(Cesium, "__esModule", {
        value: !0
    }),
    Cesium.SatelliteCoverageSimulation = void 0;
    var a,
        m = new Cesium.Matrix4,
        f = new Cesium.Cartesian3,
        p = new Cesium.Cartesian3,
        c = new Cesium.Ray,
        _ = new Cesium.Cartographic;
    n.AreaType = {
        Cone: 1,
        FourPrism: 2
    },
        Object.defineProperties(n.prototype, {
            color: {
                get: function () {
                    return this.defaultColor
                },
                set: function (t) {
                    this.defaultColor = t
                }
            },
            lineColor: {
                get: function () {
                    return this.defaultLineColor
                },
                set: function (t) {
                    this.defaultLineColor = t
                }
            },
            trackedEntity: {
                get: function () {
                    return this._trackedEntity
                },
                set: function (t) {
                    t != this._trackedEntity && (this.position = t.position),
                        this._trackedEntity = t
                }
            },
            show: {
                get: function () {
                    return this._show
                },
                set: function (t) {
                    this._show = t
                }
            },
            outline: {
                get: function () {
                    return this._outline
                },
                set: function (t) {
                    this._outline = t
                }
            },
            angle1: {
                get: function () {
                    return this._angle1
                },
                set: function (t) {
                    this._angle1 = t,
                        this.clearCommands(),
                        this._geometry = null
                }
            },
            angle2: {
                get: function () {
                    return this._angle2
                },
                set: function (t) {
                    this._angle2 = t,
                        this.clearCommands(),
                        this._geometry = null
                }
            },
            areaType: {
                get: function () {
                    return this._areaType
                },
                set: function (t) {
                    this._areaType = t,
                        this.clearCommands(),
                        this._geometry = null
                }
            },
            rotation: {
                get: function () {
                    return this._rotation
                },
                set: function (t) {
                    this._rotation = t,
                        this.clearCommands(),
                        this._geometry = null
                }
            },
            heading: {
                get: function () {
                    return this._rotation.heading
                },
                set: function (t) {
                    this._rotation.heading = t,
                        this.clearCommands(),
                        this._geometry = null
                }
            },
            pitch: {
                get: function () {
                    return this._rotation.pitch
                },
                set: function (t) {
                    this._rotation.pitch = t,
                        this.clearCommands(),
                        this._geometry = null
                }
            },
            roll: {
                get: function () {
                    return this._rotation.roll
                },
                set: function (t) {
                    this._rotation.roll = t,
                        this.clearCommands(),
                        this._geometry = null
                }
            },
            position: {
                get: function () {
                    return this._position
                },
                set: function (t) {
                    this._position = t,
                        this._geometry = null,
                        this._drawCommands = []
                }
            }
        }),
        n.prototype.addGroundAreaEntity = function (t) {
            if (t && !this.groundAreaEntity) {
                var e = this, i = new Cesium.PolygonHierarchy;
                this.groundAreaEntity = this.viewer.entities.add({
                    polygon: {
                        show: this._groundArea,
                        material: this._groundAreaColor || this.defaultColor,
                        hierarchy: new Cesium.CallbackProperty(function (t) {
                            return i.positions = e._imagingAreaPositions, i
                        }, !1)
                    },
                    polyline: {
                        show: this._groundOutLine,
                        material: this._groundOutLineColor || this._groundAreaColor || this.defaultColor,
                        width: 1.5,
                        positions: new Cesium.CallbackProperty(function (t) {
                            return e._imagingAreaPositions
                        }, !1)
                    }
                })
            }
        },
        n.prototype.clearCommands = function () {
            this._drawCommands.forEach(function (t) {
                t.vertexArray.destroy()
            }),
                this._drawCommands = []
        },
        n.prototype.mergeGeometries = function (t, e) {
            if (!t || !t.length)
                throw new Error("缺少geometries参数");
            for (var i = [], n = !1, o = !1, a = t[0].primitiveType, s = 0; s < t.length; s++) {
                if (i[s] = r(t[s]), s > 0) {
                    if (a != t[s].primitiveType) {
                        o = !0;
                        break
                    } var l = i[s - 1];
                    if (!(n = l.length != i[s].length))
                        for (var h = 0; h < l.length; h++)
                            if (l[h] != i[s][h]) {
                                n = !0; break
                            }
                }
                if (a = t[s].primitiveType, n || o)
                    break
            }
            if (o) throw new Error("待合并的几何体中primitiveType属性不完全一致");
            if (n) throw new Error("待合并的几何体中属性数量和和名称不完全一致");
            for (var d = {}, m = i[0], s = 0; s < m.length; s++) {
                var f = m[s], p = t[0];
                d[f] = {};
                for (var c in p.attributes[f])
                    p.attributes[f].hasOwnProperty(c) && (d[f][c] = p.attributes[f][c]);
                for (var _ = Array.from(d[f].values), h = 1; h < t.length; h++) {
                    p = t[h];
                    for (var g = 0; g < p.attributes[f].values.length; g++)
                        _.push(p.attributes[f].values[g])
                }
                d[f].values = new d[f].values.constructor(_)
            }
            for (var v = [], y = 0, h = 0; h < t.length; h++) {
                for (var p = t[0], s = 0; s < p.indices.length; s++)
                    v.push(p.indices[s] + y);
                y += p.attributes.position.values.length / 3
            }
            var C = Cesium.BoundingSphere.fromVertices(d.position.values);
            return new Cesium.Geometry({
                attributes: d,
                indices: new Int32Array(v),
                primitiveType: t[0].primitiveType,
                boundingSphere: C
            })
        },
        n.prototype.updateImagingAreaGeometry = function (t) {
            if (this._track.lastestFrame) {
                var e = this._track.lastestFrame.length != this._outlinePositions.length;
                if (!e)
                    for (var i = 0; i < this._track.lastestFrame.length; i++)
                        if (!this._track.lastestFrame[i].equals(this._outlinePositions[i])) {
                            e = !0; break
                        } if (!e) return
            }
            if (this._track.lastestFrame && this._track.lastestFrame.length == this._outlinePositions.length)
                for (var i = 0; i < this._outlinePositions.length; i++)this._outlinePositions[i].clone(this._track.lastestFrame[i]);
            else {
                this._track.lastestFrame = [];
                for (var i = 0; i < this._outlinePositions.length; i++)
                    this._track.lastestFrame.push(this._outlinePositions[i].clone())
            }
            var n = this.updateImagingAreaGeometry2(t);
            if (this._trackGeometries.push(n), this._track.geometry) {
                var r = this._track.geometry.attributes;
                for (var i in r)
                    r.hasOwnProperty(i) && delete r[i];
                for (var i in this._track.geometry)
                    this._track.geometry.hasOwnProperty(i) && delete this._track.geometry[i]
            }
            this._track.geometry = this.mergeGeometries(this._trackGeometries),
                this._track.needsUpdate = !0
        };
    var g = new Cesium.Quaternion;
    n.prototype.computeMatrix = function (t, e) {
        if (this._positionCartesian || (this._positionCartesian = new Cesium.Cartesian3), this.position instanceof Cesium.Cartesian3 ? this._positionCartesian = this.position : "function" == typeof this.position.getValue ? this._positionCartesian = this.position.getValue(t) : this.position._value && this.position._value instanceof Cesium.Cartesian3 && (this._positionCartesian = this.position._value), !this._positionCartesian)
            return this._matrix;
        if (this._modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(this._positionCartesian, a, this._modelMatrix), this._positionCartographic = Cesium.Cartographic.fromCartesian(this._positionCartesian, a, this._positionCartographic), Cesium.Transforms.eastNorthUpToFixedFrame(this._positionCartesian, a, this._modelMatrix), this.autoAngle && this._trackedEntity && this._trackedEntity.orientation) {
            var i = Cesium.Property.getValueOrUndefined(this._trackedEntity.orientation, t, g),
                n = Cesium.Matrix4.getHeadingPitchRollByOrientation(this._positionCartesian, i);
            this._rotation.heading = n.heading
        }
        return Cesium.Quaternion.fromHeadingPitchRoll(this._rotation, this._quaternion),
            this._matrix = Cesium.Matrix4.fromTranslationQuaternionRotationScale(this._translation, this._quaternion, this._scale, this._matrix),
            Cesium.Matrix4.multiplyTransformation(this._modelMatrix, this._matrix, this._matrix),
            Cesium.Matrix4.inverseTransformation(this._matrix, this._inverseMatrix), this._matrix
    },
        n.prototype.exportImagingArea = function (t, e) {
            var i = this._outlinePositions; if (e) {
                if (this.computeMatrix(e), !this._positionCartesian)
                    return;
                i = o(this._positions, this._matrix, 3, this._positions.length - 3, a, null, this._geometry.attributes.position.values)
            } for (var n = [], r = 0; r < i.length; r++) {
                var s = i[r]; Cesium.Cartographic.fromCartesian(s, void 0, _);
                var l = [Cesium.Math.toDegrees(_.longitude), Cesium.Math.toDegrees(_.latitude)];
                t && (l[0] = parseFloat(l[0].toFixed(t)), l[1] = parseFloat(l[1].toFixed(t))), n.push(turf.point(l))
            }
            var h = [];
            if (n.length > 0) {
                n = turf.featureCollection(n);
                var d = turf.convex(n);
                if (d) {
                    var m = turf.getCoords(d);
                    m && m.length > 0 && (h = m[0])
                }
            }
            return h
        },
        n.prototype.updateImagingAreaGeometry2 = function (t) {
            for (var e = [], i = [], n = 0, r = 0; r < this._outlinePositions.length; r += 2) {
                var o = this._outlinePositions[0];
                e.push(o.x, o.y, o.z), i.push(n++)
            }
            return e = new Float32Array(e),
                i = new Int32Array(i), new Cesium.Geometry({
                    attributes: {
                        position: new Cesium.GeometryAttribute({
                            componentDatatype: Cesium.ComponentDatatype.DOUBLE,
                            componentsPerAttribute: 3,
                            values: e
                        })
                    },
                    primitiveType: Cesium.PrimitiveType.LINES,
                    indices: i,
                    boundingSphere: Cesium.BoundingSphere.fromVertices(e)
                })
        },
        n.prototype.remove = function () {
            this.viewer.scene.primitives.remove(this),
                this.groundAreaEntity && this.viewer.entities.remove(this.groundAreaEntity)
        },
        n.prototype.destroy = function (t) {
            if (t) {
                this.viewer.scene.primitives.remove(this),
                    this.groundAreaEntity && this.viewer.entities.remove(this.groundAreaEntity),
                    this._drawCommands.forEach(function (t) {
                        t.vertexArray = t.vertexArray && t.vertexArray.destroy()
                    }),
                    this._drawCommands = [];
                for (var e in this._outlineGeometry.attributes)
                    this._outlineGeometry.attributes.hasOwnProperty(e) && delete this._outlineGeometry.attributes[e];
                for (var e in this._geometry.attributes)
                    this._geometry.attributes.hasOwnProperty(e) && delete this._geometry.attributes[e];
                delete this._outlineGeometry,
                    delete this._geometry,
                    delete this._positionCartesian,
                    delete this._position,
                    this._outlinePositions = []
            }
        },
        n.prototype.addToScene = function () {
            this.viewer.scene.primitives.add(this),
                this.groundAreaEntity && this.viewer.entities.add(this.groundAreaEntity)
        },
        n.prototype.updateGeometry = function () {
            this._areaType == n.AreaType.Cone ? (this._geometry = Cesium.CylinderGeometry.createGeometry(Cesium.CylinderGeometry.fromAngleAndLength(this._angle1, this._length, !0), this._matrix), 
            this._outlineGeometry = Cesium.CylinderGeometry.createOutlineGeometry(Cesium.CylinderGeometry.fromAngleAndLength(this._angle1, this._length, !0))) : (this._geometry = Cesium.FourPrismGeometry.createGeometry(Cesium.FourPrismGeometry.fromAnglesLength(this._angle1, this._angle2, this._length, !0), this._matrix),
             this._outlineGeometry = Cesium.FourPrismGeometry.createOutlineGeometry(Cesium.FourPrismGeometry.fromAnglesLength(this._angle1, this._angle2, this._length, !0))),
                this._positions = new Float32Array(this._geometry.attributes.position.values.length);
            for (var t = 0; t < this._positions.length; t++)
                this._positions[t] = this._geometry.attributes.position.values[t];
            this._outlinePositions = []
        },
        n.prototype.updateVolumeGeometry = function () {
            var t = 1 + this._imagingAreaPositions.length,
                e = new Float32Array(3 + 3 * this._imagingAreaPositions.length),
                i = 0; e[i++] = this._positionCartesian.x,
                    e[i++] = this._positionCartesian.y,
                    e[i++] = this._positionCartesian.z;
            for (var n = 0; n < this._imagingAreaPositions.length; n++)
                e[i++] = this._imagingAreaPositions[n].x,
                    e[i++] = this._imagingAreaPositions[n].y,
                    e[i++] = this._imagingAreaPositions[n].z;
            for (var r = [], o = [], n = 1; n < t - 1; n++)
                r.push(0, n, n + 1),
                    o.push(0, n); r = t >= 65535 ? new Uint32Array(r) : new Uint16Array(r);
            var a = {
                position: new Cesium.GeometryAttribute({
                    componentDatatype: Cesium.ComponentDatatype.DOUBLE,
                    componentsPerAttribute: 3,
                    values: e
                })
            },
                s = Cesium.BoundingSphere.fromVertices(e), l = new Cesium.Geometry({
                    attributes: a,
                    indices: r,
                    primitiveType: Cesium.PrimitiveType.TRIANGLES,
                    boundingSphere: s
                }),
                h = new Cesium.Geometry({
                    attributes: a,
                    indices: new Uint32Array(o),
                    primitiveType: Cesium.PrimitiveType.LINES,
                    boundingSphere: s
                });
            (0, Cesium.computeVertexNormals)(l),
                this._volumeGeometry = l,
                this._volumeOutlineGeometry = h
        },
        n.prototype.update = function (t) {
            if (this._show && (this.computeMatrix(t.time), this._positionCartesian)) {
                this._geometry || this.updateGeometry(),
                    this._outlinePositions = o(this._positions, this._matrix, 3, this._positions.length - 3, a, this._outlinePositions, this._geometry.attributes.position.values), this._imagingAreaPositions.splice(0, this._imagingAreaPositions.length);
                var e = this.exportImagingArea();
                if (e && e.length) {
                    for (var i = 0; i < e.length; i++) {
                        var n = e[i];
                        this._imagingAreaPositions.push(Cesium.Cartesian3.fromDegrees(n[0], n[1]))
                    }
                    t.mode === Cesium.SceneMode.SCENE3D ? (this.updateVolumeGeometry(), this._volumeGeometry && (this._volumeCommand && (this._volumeCommand.vertexArray = this._volumeCommand.vertexArray && this._volumeCommand.vertexArray.destroy(), this._volumeCommand = null),
                        this._volumeCommand = this.createDrawCommand(this._volumeGeometry, t, Cesium.Matrix4.IDENTITY.clone()),
                        t.commandList.push(this._volumeCommand),
                        this._outline && (this._volumeOutlineCommand && (this._volumeOutlineCommand.vertexArray = this._volumeOutlineCommand.vertexArray && this._volumeOutlineCommand.vertexArray.destroy(), this._volumeOutlineCommand = null),
                            this._volumeOutlineCommand = this.createDrawCommand(this._volumeOutlineGeometry, t, Cesium.Matrix4.IDENTITY.clone()),
                            t.commandList.push(this._volumeOutlineCommand))),
                        this.groundAreaEntity && (this.groundAreaEntity.polygon.show = this._groundArea && this._show, this.groundAreaEntity.polyline.show = this._groundOutLine && this._show)) : (this.groundAreaEntity || this.addGroundAreaEntity(!0), this.groundAreaEntity.polygon.show = !0)
                }
                else
                    this._outline && (this._outlineGeometry._drawCommand || (this._outlineGeometry._drawCommand = this.createDrawCommand(this._outlineGeometry, t)), t.commandList.push(this._outlineGeometry._drawCommand)), this.groundAreaEntity && (this.groundAreaEntity.polygon.show = !1, this.groundAreaEntity.polyline.show = !1)
            }
        },
        n.prototype.getFragmentShaderSource = function (t) { return "#define FACE_FORWARD\nvarying vec3 v_position;\nvarying vec3 v_normal;\nuniform float picked;\nuniform vec4  pickedColor;\nuniform vec4  defaultColor;\nuniform float specular;\nuniform float shininess;\nuniform vec3  emission;\nvarying vec2 v_st;\nuniform bool isLine;\nuniform float glowPower;\nvoid main() {\n    vec3 positionToEyeEC = -v_position; \n    vec3 normalEC =normalize(v_normal);\n    normalEC = faceforward(normalEC, vec3(0.0, 0.0, 1.0), -normalEC);\n    vec4 color=defaultColor;\n    if(picked!=0.0){\n        color = pickedColor;\n    }\n    if(v_st.x<0.5){\n        color.a = color.a*( 0.75-v_st.x); \n    }\n    else  {\n        color.a =color.a*(v_st.x-0.25); \n    }\n    czm_material material;\n    material.specular = specular;\n    material.shininess = shininess;\n    material.normal =  normalEC;\n    material.emission =emission;//vec3(0.2,0.2,0.2);\n    material.diffuse = color.rgb ;\n    if(isLine){\n        material.alpha = 1.0; \n    }\n    else{\n        material.alpha = color.a; \n    }\n        //float glow = glowPower / abs(v_st.t  ) - (glowPower / 0.5); \n        // \n        //material.emission = max(vec3(glow - 1.0 + color.rgb), color.rgb); \n        //if(isLine)\n        //    material.alpha = clamp(0.0, 1.0, glow) * color.a; \n         \n    if(v_st.x==0.0){ \n          gl_FragColor =color ;\n    }else { \n        gl_FragColor =   czm_phong(normalize(positionToEyeEC), material) ; \n    } \n}" },
        n.prototype.getVertexShaderSource = function (t) { return "\n#ifdef GL_ES\n    precision highp float;\n#endif\n\nattribute vec3 position;\nattribute vec2 st;\nattribute vec3 normal;\nuniform mat4 modelViewMatrix;\nuniform mat3 normalMatrix;\nuniform mat4 projectionMatrix;\nvarying vec3 v_position;\nvarying vec3 v_normal;\nvarying vec2 v_st;\n\nvarying vec3 v_light0Direction;\n\nvoid main(void) \n{\n    vec4 pos =  modelViewMatrix * vec4( position,1.0);\n    v_normal =  normalMatrix *  normal;\n    v_st = st;\n    v_position = pos.xyz;\n    v_light0Direction = mat3( modelViewMatrix) * vec3(1.0,1.0,1.0);\n    gl_Position =  projectionMatrix * pos;\n}" },
        n.prototype.createDrawCommand = function (t, e, i) {
            var n = e.context,
                r = new Cesium.Cartesian3;
            Cesium.Matrix4.multiplyByPoint(this._matrix, t.boundingSphere.center, r);
            var o = (new Cesium.BoundingSphere(r, t.boundingSphere.radius), new Cesium.DrawCommand({
                modelMatrix: i || this._matrix,
                owner: this,
                primitiveType: t.primitiveType,
                pass: Cesium.Pass.OPAQUE
            })),
                a = this,
                s = Cesium.GeometryPipeline.createAttributeLocations(t);
            return o.vertexArray = Cesium.VertexArray.fromGeometry({
                context: n,
                geometry: t,
                attributeLocations: s,
                bufferUsage: Cesium.BufferUsage.STATIC_DRAW
            }),
                o.vertexArray._attributeLocations = s,
                o.shaderProgram = Cesium.ShaderProgram.replaceCache({
                    context: n,
                    vertexShaderSource: this.getVertexShaderSource(t),
                    fragmentShaderSource: this.getFragmentShaderSource(t),
                    attributeLocations: s
                }),
                o.renderState = Cesium.RenderState.fromCache({
                    blending: Cesium.BlendingState.ALPHA_BLEND,
                    depthTest: {
                        enabled: !0,
                        func: Cesium.DepthFunction.LESS
                    },
                    cull: {
                        enabled: !1,
                        face: Cesium.CullFace.BACK
                    },
                    depthMask: !1
                }),
                o.uniformMap = {},
                o.uniformMap.projectionMatrix = function () {
                    return e.context.uniformState.projection
                },
                o.uniformMap.modelViewMatrix = function () {
                    return e.context.uniformState.modelView
                },
                o.uniformMap.shininess = function () {
                    return a.shininess || (a.shininess = 0), a.shininess
                },
                o.uniformMap.emission = function () {
                    return a.emission || (a.emission = new Cesium.Cartesian3(.2, .2, .2)), a.emission
                },
                o.uniformMap.specular = function () {
                    return a.specular || (a.specular = 0), a.specular
                },
                o.uniformMap.isLine = function () {
                    return t.primitiveType == Cesium.PrimitiveType.LINES
                },
                o.uniformMap.defaultColor = function () {
                    return t.color ? t.color : t.primitiveType == Cesium.PrimitiveType.LINES ? a.defaultLineColor || a.defaultColor || new Cesium.Color(1, 1, 0, .5) : a.defaultColor || new Cesium.Color(1, 0, 0, 1)
                },
                o.uniformMap.picked = function () {
                    return a.picked || (a.picked = 0), a.picked
                },
                o.uniformMap.pickedColor = function () {
                    return a.pickedColor || (a.pickedColor = new Cesium.Color(1, 1, 0, 1)), a.pickedColor
                },
                o.uniformMap.normalMatrix = function () {
                    return e.context.uniformState.normal
                },
                o.uniformMap.glowPower = function () {
                    return .25
                },
                o
        },
        Cesium.extend2CartesianArray = o, Cesium.SatelliteCoverageSimulation = n
})()