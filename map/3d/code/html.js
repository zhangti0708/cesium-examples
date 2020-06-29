/*
 * @Descripttion: 
 * @version: 1.0
 * @Author: zhangti
 * @Date: 2019-09-19 09:56:22
 * @LastEditors: sueRimn
 * @LastEditTime: 2019-11-16 16:01:55
 */

export default class HTML{

    constructor(){

        this.dom = document;

    }
    /**
     * loadJS
     * @type obj
     *  @param filePath
     */
    loadJS (filePath){
        let script = this.dom.createElement("script");
        script.type = "text/javascript";
        script.src = filePath;
        document.getElementsByTagName('head')[0].appendChild(script);
        return script;
    }
    /**
     * loadCSS
     * @type obj
     * @param filePath
     */
    loadCSS(filePath){
        let link = this.dom.createElement("link");
        link.rel = "stylesheet";
        link.href = filePath;
        this.dom.getElementsByTagName('head')[0].appendChild(link); 
        return link;
    }
    /**
     * addCSS
     * @type obj
     * @param style
     */
    addCSS(newStyle){
        console.log("addCSS");
    }
    /**
     * toJSON
     * @type obj
     */
    toJSON (){
        console.log("toJSON");
    }
}


