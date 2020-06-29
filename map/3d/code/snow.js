/*
 * @Descripttion: 
 * @version: 1.0
 * @Author: zhangti
 * @Date: 2019-10-15 18:02:44
 * @LastEditors: sueRimn
 * @LastEditTime: 2019-11-12 10:38:13
 */
/**
 * 
 * 封装天气场景
 * 雪天
 */
export default class Snow{

    constructor(v){
        this.collection = v.scene.postProcessStages;
        this._snow = new Cesium.PostProcessStage({
            name: 'czm_snow',
            fragmentShader: this.getFS()
        });
        this.collection.add(this._snow);
        v.scene.skyAtmosphere.hueShift = -0.8;
        v.scene.skyAtmosphere.saturationShift = -0.7;
        v.scene.skyAtmosphere.brightnessShift = -0.33;
        v.scene.fog.density = 0.001;
        v.scene.fog.minimumBrightness = 0.8;
    }
    getFS(){
        return "uniform sampler2D colorTexture;\n\
        varying vec2 v_textureCoordinates;\n\
        \n\
            float snow(vec2 uv,float scale)\n\
            {\n\
                float time = czm_frameNumber / 60.0;\n\
                float w=smoothstep(1.,0.,-uv.y*(scale/10.));if(w<.1)return 0.;\n\
                uv+=time/scale;uv.y+=time*2./scale;uv.x+=sin(uv.y+time*.5)/scale;\n\
                uv*=scale;vec2 s=floor(uv),f=fract(uv),p;float k=3.,d;\n\
                p=.5+.35*sin(11.*fract(sin((s+p+scale)*mat2(7,3,6,5))*5.))-f;d=length(p);k=min(d,k);\n\
                k=smoothstep(0.,k,sin(f.x+f.y)*0.01);\n\
                return k*w;\n\
            }\n\
        \n\
            void main(void){\n\
                vec2 resolution = czm_viewport.zw;\n\
                vec2 uv=(gl_FragCoord.xy*2.-resolution.xy)/min(resolution.x,resolution.y);\n\
                vec3 finalColor=vec3(0);\n\
                float c = 0.0;\n\
                c+=snow(uv,30.)*.0;\n\
                c+=snow(uv,20.)*.0;\n\
                c+=snow(uv,15.)*.0;\n\
                c+=snow(uv,10.);\n\
                c+=snow(uv,8.);\n\
            c+=snow(uv,6.);\n\
                c+=snow(uv,5.);\n\
                finalColor=(vec3(c)); \n\
                gl_FragColor = mix(texture2D(colorTexture, v_textureCoordinates), vec4(finalColor,1), 0.5); \n\
        \n\
            }\n\
        ";
    }
    remove(){
        this._snow.destroy();
    }
}