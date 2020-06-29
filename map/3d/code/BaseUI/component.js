/*
 * @Descripttion: 
 * @version: 1.0
 * @Author: zhangti
 * @Date: 2019-09-20 09:54:47
 * @LastEditors: sueRimn
 * @LastEditTime: 2019-11-26 14:39:09
 */
import {CV} from '../../CV.js';
import {ZV} from './ZV.js';
import {layUI} from '../BaseUI/layUI.js';
var Components = {};
let Obj = {
    measure: null,
}
Components.TAG = {
    //左侧工具栏
    toolbar : {
        html : function(){
            let toolbar = `
                <div id="right-nav">
                <div class="w">
                <ul id="right-nav-list1">
                    <li><a><img src="../page/img/draw2.png"></a><div>绘制</div></li>
                    <li><a><img src="../page/img/clc.png"></a><div>测距离</div></li>
                    <li><a><img src="../page/img/area.png"></a><div>测面积</div></li>
                    <li><a><img src="../page/img/triangle.png"></a><div>三角测量</div></li>
                    <li><a><img src="../page/img/points.png"></a><div>闪烁点</div></li>
                    <li><a><img src="../page/img/draw.png"></a><div>画笔</div></li>
                    <li><a><img src="../page/img/bh.png"></a><div>标绘</div></li>
                    <li><a><img src="../page/img/scan.png"></a><div>雷达扫描</div></li>
                    <li><a><img src="../page/img/雷达(1).png"></a><div>雷达</div></li>
                    <li><a><img src="../page/img/场景管理.png"></a><div>三维效果</div></li>
                    <li><a><img src="../page/img/cz.png"></a><div>查询</div></li>
                    <li><a><img src="../page/img/rm.png"></a><div>删除</div></li>
                </ul>
                </div>
            </div>
            `;
            $('body').append(toolbar);
            Components.TAG.toolbar.css();
        },
        css : function(){
            let html = new CV.HTML();
            htmk.loadCSS('../UI/css/toolbar.css');
        },
        js:function(earth){
            $("#right-nav-list1 li").off("click");
            $("#right-nav-list1 li").on("click", function () {
                var type = $(this).text();
                if (type == "" || type == undefined) return;
                switch (type) {
                    case "绘制": {  alert('暂未迁移');break; }
                    case "测距离": {  Obj.measure = new CV.Measure(earth.core);Obj.measure.drawLine();break; }
                    case "测面积": { alert('暂未迁移'); break; }
                    case "三角测量": { Obj.measure = new CV.Measure(earth.core);Obj.measure.drawTriangle(); break; }
                    case "画笔": { alert('暂未迁移'); break; }
                    case "雷达扫描": { alert('暂未迁移'); break; }
                    case "雷达": { alert('暂未迁移'); break; }
                    case "闪烁点": { alert('暂未迁移');; break; }
                    case "标绘": { alert('暂未迁移'); break; }
                    case "三维效果": { Components.TAG.layerController.open(earth.core); break; }
                    case "查询": { Components.TAG.searchRegionBox.show() ; break };
                    case "删除": { Components.TAG.toolbar.close(); break; };
                }
            });
        },
        remove(){
           $('#right-nav').remove();
           $("#right-nav-list1 li").off("click");
           Components.TAG.toolbar.close();
        },
        close(){
            if(Obj.measure)Obj.measure.removeAll();
        }
    },
    //区域搜索框
    searchRegionBox : {
        html : function(){
            $('body').append(`<div class="city-select" style=' position: absolute; top:3%; left: 3%;display:none;' id="single-select-1"></div>`);
            //Components.TAG.searchRegionBox.css();
        },
        show:function(){
            $("#single-select-1").fadeToggle();
        },
        css:function(){
            let html = new CV.HTML();
            htmk.loadCSS('../page/demo/css/city-select.css');
        },
        js:function(callback){
            //区域搜索
            let singleSelect1 = $('#single-select-1').citySelect({
                dataJson: cityData,
                multiSelect: false,
                whole: true,
                shorthand: true,
                search: true,
                onInit: function () {
                    console.log(this)
                },
                onTabsAfter: function (target) {
                    console.log(target)
                },
                onCallerAfter: function (target, values) {
                    let temp_url = 'http://localhost:8080/geoserver/zt/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=zt%3Acounty2019&outputFormat=application%2Fjson&CQL_FILTER=admincode=' + values.id;
                    $.get(temp_url,{},function(json){
                        callback(json);
                    });
                }
            });
            //设置城市
            singleSelect1.setCityVal('北京市');
        }
    },
    //分析弹出框
    analysisBox :{
        init:function(){
            drawEchart.init();
        },
        open : function(){
            layUI.commonModule({ id:'_dataDivOpen','title': '数据可视化', 'area': ['80%', '80%'], 'offset': 'auto', 'content': '<div id="_dataDiv"></div>', fn: Components.TAG.analysisBox.create });
        },
        create:function(){
            $('#_dataDivOpen').parent().css('background-color','#10274487');
            let html = `
                <div class='showData' style='width:99%;height:99%;padding:5px;'>
                    <div class='datarows'>
                        <div class='datarow' id='echart01'></div>
                        <div class='datarow2' id='echart02'></div>
                    </div>
                    <div class='datarows'>
                        <div class='datarow' id='echart03'></div>
                        <div class='datarow2' id='echart04'></div>
                    </div>
                    <div class='datarows'>
                        <div class='datarow' id='echart05'></div>
                        <div class='datarow2' id='echart06'></div>
                    </div>
                </div>
            `;
            $('#_dataDivOpen').html(html);
            Components.TAG.analysisBox.init();
        },
    },
    //地面搜索
    searchGround:{ 
        create:function(){
            $(".search").remove();
            $('body').append(`
                <div class="from-search" style="position: absolute;top:5%;left:3%;">
                    <form class="layui-form" action="">
                        <div class="layui-inline">
                            <div class="layui-input-inline">
                                <select name="modules" lay-verify="required" lay-search="">
                                    <option value="">search...</option>
                                    <option value="model_car">大型吊车</option>
                                    <option value="city_dalian">大连</option>
                                    <option value="type_dxjzw">大型建筑物</option>
                                    <option value="city_dalian">北京</option>
                                </select>
                            </div>
                        </div>
                    </form>
                </div>
                 `
            );
        }
    }
   
}

export {Components};


