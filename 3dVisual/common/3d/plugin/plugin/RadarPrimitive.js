(function () {

    function n(t, e) {
        e = e || {},
            r = t.scene.globe.ellipsoid,
            this._geometry = null,
            this._angle = e.angle,
            this._radius = e.radius ? e.radius : 5,
            this._position = e.position,
            this._rotation = e.rotation ? e.rotation : {
                heading: 0,
                pitch: 0,
                roll: 0
            },
            this._trackedEntity = e.trackedEntity,
            this.defaultColor = e.color ? e.color : Cesium.Color.YELLOW,
            this.defaultLineColor = e.lineColor ? e.lineColor : this.defaultColor,
            this._show = Cesium.defaultValue(e.show, !0),
            this._outline = Cesium.defaultValue(e.outline, !1),
            this._topShow = Cesium.defaultValue(e.top, !0),
            this._topOutline = Cesium.defaultValue(e.topOutline, !0),
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
            this.viewer = t,
            this.viewer.scene.primitives.add(this),
            this.updateGeometry(),
            this._groundArea = Cesium.defaultValue(e.groundArea, !1),
            this.addGroundAreaEntity(this._groundArea)
    }
    Object.defineProperty(Cesium, "__esModule", {
        value: !0
    }),
        Cesium.RadarPrimitive = void 0;
    var r;
    Object.defineProperties(n.prototype, {
        trackedEntity: {
            get: function () {
                return this._trackedEntity
            },
            set: function (t) {
                this._trackedEntity = t
            }
        },
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
                this._outline = t, this.updateGeometry()
            }
        },
        top: {
            get: function () {
                return this._topShow
            },
            set: function (t) {
                this._topShow = t, this.updateGeometry()
            }
        },
        topOutline: {
            get: function () {
                return this._topOutline
            },
            set: function (t) {
                this._topOutline = t, this.updateGeometry()
            }
        },
        groundArea: {
            get: function () {
                return this._groundArea
            },
            set: function (t) {
                this._groundArea = t, this.addGroundAreaEntity(this._groundArea)
            }
        },
        angle: {
            get: function () {
                return this._angle
            },
            set: function (t) {
                this._angle = t, this.updateGroundCircleRadius(), this.updateGeometry()
            }
        },
        radius: {
            get: function () {
                return this._radius
            },
            set: function (t) {
                this._radius = t, this.updateGroundCircleRadius(), this.updateGeometry()
            }
        },
        heading: {
            get: function () {
                return this._rotation.heading
            },
            set: function (t) {
                this._rotation.heading = t
            }
        },
        pitch: {
            get: function () {
                return this._rotation.pitch
            },
            set: function (t) {
                this._rotation.pitch = t
            }
        },
        roll: {
            get: function () {
                return this._rotation.roll
            },
            set: function (t) {
                this._rotation.roll = t
            }
        },
        position: {
            get: function () {
                return this._position
            }, set: function (t) {
                this._position = t
            }
        }
    }),
        n.prototype.updateGroundCircleRadius = function () {
            this._ground_radius = this._radius * Math.cos(Cesium.Math.toRadians(this._angle))
        },
        n.prototype.addGroundAreaEntity = function (t) {
            if (t && !this.groundAreaEntity) {
                var e = this;
                this.updateGroundCircleRadius(),
                    this.groundAreaEntity = viewer.entities.add({
                        position: this._position,
                        ellipse: {
                            show: 0 === this._rotation.pitch && 0 === this._rotation.roll,
                            semiMinorAxis: new Cesium.CallbackProperty(function (t) {
                                return e._ground_radius
                            }, !1),
                            semiMajorAxis: new Cesium.CallbackProperty(function (t) {
                                return e._ground_radius
                            }, !1),
                            material: this.defaultColor
                        },
                        polyline: {
                            show: this._trackedEntityPosition && (0 !== this._rotation.pitch || 0 !== this._rotation.roll),
                            positions: new Cesium.CallbackProperty(function (t) {
                                return e._trackedEntityPosition ? Cesium.Cartesian3.distance(e._position, e._trackedEntityPosition) > e._radius ? [] : [e._position, e._trackedEntityPosition] : []
                            }, !1),
                            followSurface: !1,
                            material: new Cesium.PolylineDashMaterialProperty({
                                color: Cesium.Color.CYAN
                            }),
                            width: 1
                        }
                    })
            }
        };
    var l = new Cesium.Cartesian3;
    n.prototype.computeMatrix = function (t, e) {
        if (this._positionCartesian || (this._positionCartesian = new Cesium.Cartesian3), this.position instanceof Cesium.Cartesian3 ? this._positionCartesian = this.position : "function" == typeof this.position.getValue ? this._positionCartesian = this.position.getValue(t) : this.position._value && this.position._value instanceof Cesium.Cartesian3 && (this._positionCartesian = this.position._value), this._trackedEntity && this._trackedEntity.position) {
            var i = this._positionCartesian,
                n = Cesium.Property.getValueOrUndefined(this._trackedEntity.position, t, l);
            if (n) {
                this._trackedEntityPosition = n;
                var o = mars3d.matrix.getHeadingPitchRollForLine(i, n, r);
                this._rotation.heading = o.heading, this._rotation.pitch = o.pitch, this._rotation.roll = o.roll
            }
        }
        return this._modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(this._positionCartesian, r, this._modelMatrix),
            this._positionCartographic = Cesium.Cartographic.fromCartesian(this._positionCartesian, r, this._positionCartographic),
            Cesium.Transforms.eastNorthUpToFixedFrame(this._positionCartesian, r, this._modelMatrix),
            Cesium.Quaternion.fromHeadingPitchRoll(this._rotation, this._quaternion),
            this._matrix = Cesium.Matrix4.fromTranslationQuaternionRotationScale(this._translation, this._quaternion, this._scale, this._matrix),
            Cesium.Matrix4.multiplyTransformation(this._modelMatrix, this._matrix, this._matrix),
            Cesium.Matrix4.inverseTransformation(this._matrix, this._inverseMatrix),
            this._matrix
    },
        n.prototype.getTopGeometry = function () {
            for (var t = this.radius, e = [], i = [], n = [], r = [], o = 90 - parseInt(this.angle), s = o < 1 ? o / 8 : 1, l = 2 * Math.PI / 127, h = 0, d = this.angle; d < 91; d += s) {
                var m = Cesium.Math.toRadians(d < 90 ? d : 90);
                m = Math.cos(m) * t;
                for (var f = [], p = 0; p < 128; p++) {
                    var c = l * p,
                        _ = m * Math.cos(c),
                        g = m * Math.sin(c),
                        v = Math.sqrt(t * t - _ * _ - g * g);
                    e.push(_, g, v),
                        i.push(1, 1),
                        f.push(h++)
                }
                r.push(f)
            }
            for (var d = 1; d < r.length; d++)
                for (var p = 1; p < r[d].length; p++) {
                    var y = r[d - 1][p - 1],
                        C = r[d][p - 1],
                        w = r[d][p], x = r[d - 1][p];
                    n.push(y, C, w),
                        n.push(y, w, x)
                }
            e = new Float32Array(e),
                n = new Int32Array(n),
                i = new Float32Array(i);
            var A = {
                position: new Cesium.GeometryAttribute({
                    componentDatatype: Cesium.ComponentDatatype.DOUBLE,
                    componentsPerAttribute: 3, values: e
                }),
                st: new Cesium.GeometryAttribute({ componentDatatype: Cesium.ComponentDatatype.FLOAT, componentsPerAttribute: 2, values: i })
            },
                b = Cesium.BoundingSphere.fromVertices(e),
                M = new Cesium.Geometry({
                    attributes: A,
                    indices: n,
                    primitiveType: Cesium.PrimitiveType.TRIANGLES,
                    boundingSphere: b
                });
            return (0, Cesium.computeVertexNormals)(M), M
        },
        n.prototype.getTopOutlineGeometry = function () {
            for (var t = this.radius, e = [], i = [], n = [], r = [], o = 90 - parseInt(this.angle), s = o < 1 ? o / 8 : 1, l = 2 * Math.PI / 127, h = 0, d = this.angle; d < 91; d += s) {
                var m = Cesium.Math.toRadians(d < 90 ? d : 90);
                m = Math.cos(m) * t;
                for (var f = [], p = 0; p < 128; p++) {
                    var c = l * p, _ = m * Math.cos(c), g = m * Math.sin(c), v = Math.sqrt(t * t - _ * _ - g * g);
                    e.push(_, g, v), i.push(1, 1), f.push(h++)
                }
                r.push(f)
            }
            for (var d = 1; d < r.length; d++)
                for (var p = 1; p < r[d].length; p++) {
                    var y = r[d - 1][p - 1], C = r[d][p - 1], w = r[d][p]; r[d - 1][p];
                    p % 8 == 1 && n.push(y, C), d % 8 == 1 && n.push(C, w)
                }
            e = new Float32Array(e), n = new Int32Array(n), i = new Float32Array(i);
            var x = {
                position: new Cesium.GeometryAttribute({
                    componentDatatype: Cesium.ComponentDatatype.DOUBLE,
                    componentsPerAttribute: 3,
                    values: e
                }),
                st: new Cesium.GeometryAttribute({
                    componentDatatype: Cesium.ComponentDatatype.FLOAT,
                    componentsPerAttribute: 2, values: i
                })
            },
                A = Cesium.BoundingSphere.fromVertices(e),
                b = new Cesium.Geometry({
                    attributes: x,
                    indices: n,
                    primitiveType: Cesium.PrimitiveType.LINES,
                    boundingSphere: A
                });
            return (0, Cesium.computeVertexNormals)(b), b
        },
        n.prototype.updateGeometry = function () {
            this._geometry = Cesium.CylinderGeometry.createGeometry(new Cesium.CylinderGeometry({
                topRadius: this._radius * Math.cos(Cesium.Math.toRadians(this.angle)),
                bottomRadius: 0,
                length: this._radius * Math.sin(Cesium.Math.toRadians(this.angle))
            })),
                this._topGeometry = this.getTopGeometry(),
                this._topOutlineGeometry = this.getTopOutlineGeometry(),
                this._outlineGeometry = Cesium.CylinderGeometry.createOutlineGeometry(new Cesium.CylinderGeometry({
                    topRadius: this._radius * Math.cos(Cesium.Math.toRadians(this.angle)), 
                    bottomRadius: 0, 
                    slices: 128, 
                    length: this._radius * Math.sin(Cesium.Math.toRadians(this.angle))
                })),
                this._positions = new Float32Array(this._geometry.attributes.position.values.length);
            for (var t = 0; t < this._positions.length; t++)this._positions[t] = this._geometry.attributes.position.values[t];
            this._drawCommands && this._drawCommands.length && (this._drawCommands.forEach(function (t) {
                t.vertexArray = t.vertexArray && t.vertexArray.destroy()
            }),
                this._drawCommands.splice(0, this._drawCommands.length))
        },
        n.prototype.update = function (t) {
            if (this._show) {
                this.computeMatrix(t.time);
                t.mode === Cesium.SceneMode.SCENE3D ? (this._geometry.boundingSphere = Cesium.BoundingSphere.fromVertices(this._geometry.attributes.position.values), this._drawCommands && this._drawCommands.length || (this._drawCommands.push(this.createDrawCommand(this._geometry, t)), this._outline && this._drawCommands.push(this.createDrawCommand(this._outlineGeometry, t)), this._topShow && (this._drawCommands.push(this.createDrawCommand(this._topGeometry, t)),
                    this._topOutline && this._drawCommands.push(this.createDrawCommand(this._topOutlineGeometry, t)))), this._drawCommands.forEach(function (e) { t.commandList.push(e) }), this.groundAreaEntity && (this.groundAreaEntity.ellipse.show = this._groundArea && 0 === this._rotation.pitch && 0 === this._rotation.roll, this.groundAreaEntity.polyline.show = !1)) : (this.groundAreaEntity || this.addGroundAreaEntity(!0), this.groundAreaEntity.ellipse.show = 0 === this._rotation.pitch && 0 === this._rotation.roll, this.groundAreaEntity.polyline.show = this._trackedEntityPosition && (0 !== this._rotation.pitch || 0 !== this._rotation.roll))
            }
        },
        n.prototype.getFragmentShaderSource = function (t) {
            return "\nvarying vec3 v_position;\nvarying vec3 v_normal;\nuniform float picked;\nuniform vec4  pickedColor;\nuniform vec4  defaultColor;\nuniform float specular;\nuniform float shininess;\nuniform vec3  emission;\nvarying vec2 v_st;\nuniform bool isLine;\nuniform float glowPower;\nvoid main() {\n    vec3 positionToEyeEC = -v_position; \n    vec3 normalEC =normalize(v_normal);\n    vec4 color=defaultColor;\n    if(picked!=0.0){\n        color = pickedColor;\n    }\n    //if(v_st.x<0.5){\n    //    color.a =0.75-v_st.x; \n    //}\n    //else  {\n    //    color.a =v_st.x-0.25; \n    //}\n    czm_material material;\n    material.specular = specular;\n    material.shininess = shininess;\n    material.normal =  normalEC;\n    material.emission =emission;//vec3(0.2,0.2,0.2);\n    material.diffuse = color.rgb ;\n    if(isLine){\n        material.alpha = 1.0; \n    }\n    else{\n        material.alpha =  color.a; \n    }\n        //float glow = glowPower / abs(v_st.t  ) - (glowPower / 0.5); \n        // \n        //material.emission = max(vec3(glow - 1.0 + color.rgb), color.rgb); \n        //if(isLine)\n        //    material.alpha = clamp(0.0, 1.0, glow) * color.a; \n         \n    if(v_st.x==0.0){ \n          gl_FragColor =color ;\n    }else { \n        gl_FragColor = czm_phong(normalize(positionToEyeEC), material) ; \n    } \n}"
        },
        n.prototype.getVertexShaderSource = function (t) {
            return "\n#ifdef GL_ES\n    precision highp float;\n#endif\n\nattribute vec3 position;\nattribute vec2 st;\nattribute vec3 normal;\nuniform mat4 modelViewMatrix;\nuniform mat3 normalMatrix;\nuniform mat4 projectionMatrix;\nvarying vec3 v_position;\nvarying vec3 v_normal;\nvarying vec2 v_st;\n\nvarying vec3 v_light0Direction;\n\nvoid main(void) \n{\n    vec4 pos =  modelViewMatrix * vec4( position,1.0);\n    v_normal =  normalMatrix *  normal;\n    v_st = st;\n    v_position = pos.xyz;\n    v_light0Direction = mat3( modelViewMatrix) * vec3(1.0,1.0,1.0);\n    gl_Position =  projectionMatrix * pos;\n}"
        },
        n.prototype.createDrawCommand = function (t, e, i) {
            var n = e.context, r = new Cesium.Cartesian3; Cesium.Matrix4.multiplyByPoint(this._matrix, t.boundingSphere.center, r);
            var o = new Cesium.BoundingSphere(r, t.boundingSphere.radius), s = new Cesium.DrawCommand({
                modelMatrix: i || this._matrix,
                owner: this,
                primitiveType: t.primitiveType,
                pass: Cesium.Pass.TRANSLUCENT,
                boundingVolume: o
            }),
                u = this, l = Cesium.GeometryPipeline.createAttributeLocations(t);
            return s.vertexArray = Cesium.VertexArray.fromGeometry({
                context: n,
                geometry: t,
                attributeLocations: l,
                bufferUsage: Cesium.BufferUsage.STATIC_DRAW
            }),
                s.vertexArray._attributeLocations = l,
                s.shaderProgram = Cesium.ShaderProgram.replaceCache({
                    context: n,
                    vertexShaderSource: this.getVertexShaderSource(t),
                    fragmentShaderSource: this.getFragmentShaderSource(t),
                    attributeLocations: l
                }),
                s.renderState = Cesium.RenderState.fromCache({
                    blending: Cesium.BlendingState.ALPHA_BLEND,
                    depthTest: {
                        enabled: !0,
                        func: Cesium.DepthFunction.LESS
                    },
                    cull: {
                        enabled: !1,
                        face: Cesium.CullFace.BACK
                    }
                }),
                s.uniformMap = {}, s.uniformMap.projectionMatrix = function () {
                    return e.context.uniformState.projection
                },
                s.uniformMap.modelViewMatrix = function () {
                    return e.context.uniformState.modelView
                },
                s.uniformMap.shininess = function () {
                    return u.shininess || (u.shininess = 0), u.shininess
                },
                s.uniformMap.emission = function () {
                    return u.emission || (u.emission = new Cesium.Cartesian3(.2, .2, .2)), u.emission
                },
                s.uniformMap.specular = function () {
                    return u.specular || (u.specular = 0), u.specular
                },
                s.uniformMap.isLine = function () {
                    return t.primitiveType == Cesium.PrimitiveType.LINES || t.primitiveType == Cesium.PrimitiveType.LINE_STRIP
                },
                s.uniformMap.defaultColor = function () {
                    return t.primitiveType == Cesium.PrimitiveType.LINES || t.primitiveType == Cesium.PrimitiveType.LINE_STRIP ? (u.defaultLineColor || (u.defaultLineColor = new Cesium.Color(1, 1, 0, 1)), u.defaultLineColor) : (u.defaultColor || (u.defaultColor = new Cesium.Color(1, 0, 0, 1)), u.defaultColor)
                },
                s.uniformMap.picked = function () {
                    return u.picked || (u.picked = 0), u.picked
                },
                s.uniformMap.pickedColor = function () {
                    return u.pickedColor || (u.pickedColor = new Cesium.Color(1, 1, 0, 1)), u.pickedColor
                },
                s.uniformMap.normalMatrix = function () {
                    return e.context.uniformState.normal
                },
                s.uniformMap.glowPower = function () {
                    return .25
                },
                s
        },
        n.prototype.remove = function () {
            this.viewer.scene.primitives.remove(this), this.groundAreaEntity && this.viewer.entities.remove(this.groundAreaEntity)
        },
        n.prototype.addToScene = function () {
            this.viewer.scene.primitives.add(this), this.groundAreaEntity && this.viewer.entities.add(this.groundAreaEntity)
        },
        n.prototype.destroy = function (t) {
            t && (this.viewer.scene.primitives.remove(this), this.groundAreaEntity && this.viewer.entities.remove(this.groundAreaEntity), this._drawCommands.forEach(function (t) {
                t.vertexArray = t.vertexArray && t.vertexArray.destroy()
            }), this._drawCommands = [])
        },
        Cesium.RadarPrimitive = n

})()