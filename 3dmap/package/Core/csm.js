/*
 * @Descripttion: 
 * @version: 
 * @Author: sueRimn
 * @Date: 2019-09-19 09:10:57
 * @LastEditors: sueRimn
 * @LastEditTime: 2019-09-19 10:04:25
 */
export default class csm{

    constructor(earth){
        /**
         * csm.viewer
         * @type obj
         */
        this.viewer = earth;
         /**
         * csm.scenc
         * @type obj
         */
        this.scenc = earth.scene;
        /**
         * csm.camera
         * @type obj
         */
        this.camera = earth.camera;
    }

    toJSON(){
        return jQuery.toJSON(this);
    }
    
}