/*
 * @Descripttion: 
 * @version: 1.0
 * @Author: zhangti
 * @Date: 2019-10-15 18:02:42
 * @LastEditors: sueRimn
 * @LastEditTime: 2019-11-12 10:37:50
 */
/**
 * 
 * 封装天气场景
 * 雨天
 */
export default class Rain{

    constructor(v){
        this.collection = v.scene.postProcessStages;
        let _self = this;
        this._rain = new Cesium.PostProcessStage({
            name: 'czm_rain',
            fragmentShader: _self.getFs()
        });
        this.collection.add(this._rain);
        v.scene.skyAtmosphere.hueShift = -0.8;
        v.scene.skyAtmosphere.saturationShift = -0.7;
        v.scene.skyAtmosphere.brightnessShift = -0.33;
        v.scene.fog.density = 0.001;
        v.scene.fog.minimumBrightness = 0.8;
    }
    getFs(){
        return "uniform sampler2D colorTexture;\n\
                varying vec2 v_textureCoordinates;\n\
            \n\
                float hash(float x){\n\
                    return fract(sin(x*133.3)*13.13);\n\
            }\n\
            \n\
            void main(void){\n\
            \n\
                float time = czm_frameNumber / 60.0;\n\
            vec2 resolution = czm_viewport.zw;\n\
            \n\
            vec2 uv=(gl_FragCoord.xy*2.-resolution.xy)/min(resolution.x,resolution.y);\n\
            vec3 c=vec3(.6,.7,.8);\n\
            \n\
            float a=-.4;\n\
            float si=sin(a),co=cos(a);\n\
            uv*=mat2(co,-si,si,co);\n\
            uv*=length(uv+vec2(0,4.9))*.3+1.;\n\
            \n\
            float v=1.-sin(hash(floor(uv.x*100.))*2.);\n\
            float b=clamp(abs(sin(20.*time*v+uv.y*(5./(2.+v))))-.95,0.,1.)*20.;\n\
            c*=v*b; \n\
            \n\
            gl_FragColor = mix(texture2D(colorTexture, v_textureCoordinates), vec4(c,1), 0.5);  \n\
            }\n\
             ";
    }
    remove(){
        this._rain.destroy();
    }

}