/*
 * @Descripttion: 
 * @version: 1.0
 * @Author: zhangti
 * @Date: 2019-09-29 11:55:55
 * @LastEditors: sueRimn
 * @LastEditTime: 2019-11-28 16:14:13
 */
/**
 * 
 * 常用工具集合
 * 算法
 * 
 */
//import * as FileSaver from '../../node_modules/file-saver/src/FileSaver.js';
export default class Tools {

    constructor() {}
    //生成默认参数
    defaultValue(o,oo){
        if(this.nullBool(o) | this.isEmpty(o)){
            if(typeof oo === 'function')return oo();
            return oo;
        }
        return o;
    }
    arrForEach(arr, func) {
        try {// arr对象循环
            for (let i = 0; i < arr.length; i++) {
                let bool = func(arr[i], i);
                if (true === bool) {
                    return;
                }
            }
        }
        catch (e) {
            console.log(e);
        }
    }
    /**
     * uuid
     * @param {*} str 
     */
    createGuid(){
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    isIncludecChn(str){
        if(/.*[\u4e00-\u9fa5]+.*$/.test(str))
        {
            return true ;
        } else {
        return false ;
        }
    }
    saveJsonText(j) {
        let content = JSON.stringify(j.jsonData);
        let blob = new Blob([content], { type: "text/plain;charset=utf-8" });
        saveAs(blob, j.jsonName);
        //FileSaver.saveAs(blob, j.jsonName);
    }

    nullBool(param) {  // 对象为空判断 为空返回true，反之false
        if (null === param || undefined === param) return true;
        return false;
    }
    isEmpty(param){
        if( '{}' === JSON.stringify(param))return true;
        return false;
    }
    strBool(param) {  // string判断 为空返回true，反之false
        if (this.nullBool(param) || "" === param || param.length === 0) return true;
        return false;
    }
    arrBool(param) {  // arraty判断 length不为零 为空返回true，反之false
        if (null === param || undefined === param || param.length === 0) return true;
        return false;
    }
    mapBool(param) {  // 判断map是否为空 为空返回true，反之false
        for (var t in param)
            return !1;
        return !0
    }
    jsonBool(param) {  // 判断json是否可用，true为不可用，false反之
        if (this.nullBool(param)
            || this.getMapSize(param) === 0) return true;
        return false;
    }
    initError(param) {  // 初始化异常： 为空返回true，反之false
        if (null === param || undefined === param) {
            alert("初始化页面异常，请刷新页面重新尝试！");
            return true;
        }
        return false;
    }
    isArray(obj) {  // 判断是否是array
        return (typeof obj == 'object') && obj.constructor == Array;
    }
    isString(str) {  // 判断是否是字符串
        return (typeof str == 'string') && str.constructor == String;
    }
    isNumber(obj) {   // 判断是否是数值
        return (typeof obj == 'number') && obj.constructor == Number;
    }
    isDate(obj) {   // 是否是时间对象
        return (typeof obj == 'object') && obj.constructor == Date;
    }
    is(obj) {   // 判断是否是函数
        return (typeof obj == '') && obj.constructor == Function;
    }
    isObject(obj) {   // 判断是否是对象
        return (typeof obj == 'object') && obj.constructor == Object;
    }
    getMapSize(map) { // 获取map的个数
        var index = 0;
        if (this.nullBool(map)) return index;
        for (var s in map) {
            ++index;
        }
        return index;
    }
    isIEBrowser() {  // ie浏览器判断,是返回true
        return !!window.ActiveXObject || "ActiveXObject" in window ? true : false;
    }
    mapMerge(coverMap, subjectMap) {  // 将两个map合并成一个map
        // coverMap 覆盖map，即两个map中有相同子元素，以覆盖此map中元素为准
        var map = JSON.parse(JSON.stringify(coverMap));
        var map2 = JSON.parse(JSON.stringify(subjectMap));
        for (var s in map2) {
            map[s] = map2[s];
        }
        return map;
    }
    deepCopy(obj) {  // 深拷贝
        return JSON.parse(JSON.stringify(obj));
    }
    numForEach(num, func) {
        for (var i = 0; i < num; i++) {		// 数循环
            func(i)
        }
    }
    isChildren(contrastObj, boolObj) { // 判断是否是指定对象子类或自身 ， 是返回true 
        var result = false;
        if (!this.nullBool(contrastObj) && !this.nullBool(boolObj)) {
            if ("body" === boolObj[0].nodeName.toLowerCase()) {
                result = false;
            } else {
                var boolResult = $(contrastObj).is(boolObj);
                if (boolResult) {
                    result = true;
                } else {
                    result = this.isChildren(contrastObj, $(boolObj).parent());
                }
            }
        }
        return result;
    }
    getCoords(el) { // 获取元素在页面中的坐标
        var box = el.getBoundingClientRect(),
            doc = el.ownerDocument,
            body = doc.body,
            html = doc.documentElement,
            clientTop = html.clientTop || body.clientTop || 0,
            clientLeft = html.clientLeft || body.clientLeft || 0,
            top = box.top + (self.pageYOffset || html.scrollTop || body.scrollTop) - clientTop,
            left = box.left + (self.pageXOffset || html.scrollLeft || body.scrollLeft) - clientLeft
        return { 'top': top, 'left': left };
    }
    checkEmail(str) { 	// 邮箱验证
        var re = /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/;
        if (re.test(str)) {
            return true;
        } else {
            return false;
        }
    }
    checkMobile(str) {	// 手机验证 , 11位数字，以1开头。
        var re = /^1\d{10}$/;
        if (re.test(str)) {
            return true;
        } else {
            return false;
        }
    }
    checkUser(str) { // 验证帐号是否合法,字母、数字、下划线组成，字母开头，4-16位。
        var re = /^[a-zA-z]\w{4,15}$/;
        if (re.test(str)) {
            return true;
        } else {
            return false;
        }
    }
    checkFullAngle(str) {	// 判断是否有全角 , 有返回true
        var str2 = str.match(/[\uff00-\uffff]/g);
        if (null === str2) {
            return false;
        } else {
            return true;
        }
    }
    chackStr(str) { // 判断是否有特殊符号 和 数字 ，有返回true
        var regEn = /[-`~!@#$%^&*()_=+<>?:"{},\\\\.\/;'[\]]/im,
            regCn = /[·！#￥（——）：；“”‘、，|《。》？、【】[\]]/im;
        if (regEn.test(str) || regCn.test(str)) { // 包含返回true
            return true;
        }
        return false;
    } 
    getSelectAttr(select, attrName) {
        return $($(select).children("option:selected")).attr(attrName);
    } 
    getEventSource(event) { // 获取事件源对象
        return (bool.isIEBrowser() ? event.srcElement : event.target);
    } 
    addPropertychange(Obj, func) {	// 给input添加文本改变事件
        if (this.arrBool($(Obj))) {
            console.log("文本改变监控创建失败！");
            return;
        }
        $(Obj).unbind().on('input propertychange', func);
    } 
    addBlur(Obj, func) {	// 给input对象添加鼠标光标离开事件
        $(Obj).blur(func);
    } 
    timingTask(func, hours, minutes, seconds) { // 每天指定时间执行
        var time = new Date();	// 当前时间
        var time2 = new Date();	// 下一天时间
        time2.setDate(time.getDate() + 1);
        time2.setHours(hours);
        time2.setMinutes(minutes);
        time2.setSeconds(seconds);
        var doIT = function(){
            func();
            setTimeout(doIT, 24 * 60 * 60 * 1000);
        }
        setTimeout(doIT, time2 - time);
    } 
    strRegHandle(str) { // 字符串正则处理
        if (arguments.length == 0) return this;
        var obj = arguments[0];
        var s = this;
        for (var key in obj) {
            s = s.replace(new RegExp("\\{\\{" + key + "\\}\\}", "g"), obj[key]);
        }
        return s;
    }


}