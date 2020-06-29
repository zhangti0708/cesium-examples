/*
 * @Descripttion: 
 * @version: 1.0
 * @Author: zhangti
 * @Date: 2019-09-23 14:35:16
 * @LastEditors: sueRimn
 * @LastEditTime: 2019-10-09 14:18:38
 */

import {ZV} from './ZV.js';
import {Components} from './component.js';
var layUI = {
    commonModule : function(v){
        console.log(v);
        if (v == undefined && v == null) {
            fn_tool.alert("没有获取到弹出属性!");
            return false;
        }
        layer.open({
            type: 1 //此处以iframe举例
            , id: v.id
            , title: v.title
            , shade: 0
            , offset: v.offset
            , area: v.area
            , btn: v.btn == undefined ? false : v.btn
            , btn1: function () {
                if (typeof v.btn1 == 'function') {
                    v.btn1();
                }
            }
            , maxmin: true
            , content: v.content
            , success: function () {
                if (typeof v.fn == 'function') {
                    v.fn();
                }
            },
            cancel : function(index, layero){
               /* console.log(v);
                if(v.id == undefined){
                    layer.close(index);
                }
                $('#' + v.id).parent().hide();
                return false;*/
                layer.close(index);
            },
            end: function () {}
        });
    }
}

export {layUI};