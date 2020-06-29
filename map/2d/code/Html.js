/*
 * @Descripttion: 
 * @version: 1.0
 * @Author: zhangti
 * @Date: 2019-10-31 10:11:34
 * @LastEditors: sueRimn
 * @LastEditTime: 2019-10-31 11:37:11
 */
/**
 * 网页资源
 */
export default class Html{
    constructor(){
        
        this.dom = document;
    }
    /**
     * 加载js
     */
    loadJS(filePath){
        let script = this.dom.createElement("script");
        script.type = "text/javascript";
        script.src = filePath;
        this.dom.getElementsByTagName('head')[0].appendChild(script);
        return script;
    }
    /**
     * 加载css
     */
    loadCSS(filePath){
        let link = this.dom.createElement("link");
        link.rel = "stylesheet";
        link.href = filePath;
        this.dom.getElementsByTagName('head')[0].appendChild(link); 
        return link;
    }

}