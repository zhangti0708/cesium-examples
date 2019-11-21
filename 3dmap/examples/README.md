# ExamplesforCesium
Here is my  [***BLOG***](http://www.cnblogs.com/fuckgiser/)    
I am writing a serie of articles about Cesium and here are the examples mentioned in these articles.   
If you are interested on it, you can download ExamplesforCesium and place it in the same level of Source Folder        
Then, you can browser these examples 


My blog rank show code untile 20170522
var data = {"details":[{"date":20160831,"rank":43343},{"date":20160901,"rank":41969},{"date":20160902,"rank":41624},{"date":20160905,"rank":40318},{"date":20160907,"rank":39246},{"date":20160908,"rank":38887},{"date":20160909,"rank":37980},{"date":20160913,"rank":37515},{"date":20160914,"rank":37193},{"date":20160915,"rank":36564},{"date":20160916,"rank":35819},{"date":20160917,"rank":35733},{"date":20160918,"rank":35590},{"date":20160919,"rank":34419},{"date":20160920,"rank":33659},{"date":20160922,"rank":32878},{"date":20160923,"rank":31280},{"date":20160924,"rank":30940},{"date":20160925,"rank":30594},{"date":20160926,"rank":30416},{"date":20160928,"rank":29800},{"date":20160929,"rank":28094},{"date":20160930,"rank":27274},{"date":20161001,"rank":26991},{"date":20161012,"rank":25470},{"date":20161006,"rank":26726},{"date":20161011,"rank":25672},{"date":20161012,"rank":25470},{"date":20161014,"rank":25061},{"date":20161016,"rank":24564},{"date":20161017,"rank":24542},{"date":20161018,"rank":24417},{"date":20161020,"rank":22412},{"date":20161022,"rank":20731},{"date":20161026,"rank":20157},{"date":20161027,"rank":19903},{"date":20161028,"rank":19588},{"date":20161030,"rank":19445},{"date":20161101,"rank":19407},{"date":20161102,"rank":19170},{"date":20161103,"rank":18907},{"date":20161104,"rank":18658},{"date":20161105,"rank":18268},{"date":20161108,"rank":17957},{"date":20161110,"rank":17900},{"date":20161118,"rank":17510},{"date":20161121,"rank":17366},{"date":20161128,"rank":16689},{"date":20161129,"rank":16665},{"date":20161130,"rank":16430},{"date":20161205,"rank":15931},{"date":20161207,"rank":15498},{"date":20161210,"rank":15119},{"date":20161213,"rank":14203},{"date":20161214,"rank":13967},{"date":20161216,"rank":13863},{"date":20161217,"rank":13558},{"date":20161223,"rank":13161},{"date":20161227,"rank":12690},{"date":20161230,"rank":11905},{"date":20170102,"rank":11349},{"date":20170103,"rank":11035},{"date":20170105,"rank":10702},{"date":20170203,"rank":9747},{"date":20170216,"rank":8695},{"date":20170220,"rank":8535},{"date":20170221,"rank":8469},{"date":20170223,"rank":8402},{"date":20170224,"rank":8184},{"date":20170225,"rank":8068},{"date":20170228,"rank":7278},{"date":20170302,"rank":7182},{"date":20170307,"rank":6903},{"date":20170308,"rank":6782},{"date":20170310,"rank":6720},{"date":20170313,"rank":6669},{"date":20170315,"rank":6620},{"date":20170317,"rank":6527},{"date":20170328,"rank":5994},{"date":20170403,"rank":5798},{"date":20170407,"rank":5660},{"date":20170408,"rank":5586},{"date":20170411,"rank":5560},{"date":20170419,"rank":5273},{"date":20170420,"rank":5233},{"date":20170421,"rank":5189},{"date":20170424,"rank":5084},{"date":20170426,"rank":4977},{"date":20170428,"rank":4850},{"date":20170505,"rank":4665},{"date":20170505,"rank":4665},{"date":20170505,"rank":4665},{"date":20170509,"rank":4570},{"date":20170511,"rank":4486},{"date":20170512,"rank":4410},{"date":20170516,"rank":4278},{"date":20170519,"rank":4203},{"date":20170520,"rank":4137},{"date":20170522,"rank":4112},{"date":20170524,"rank":4082},{"date":20170524,"rank":4045},{"date":20170528,"rank":3987},{"date":20170531,"rank":3974},{"date":20170601,"rank":3964},{"date":20170603,"rank":3876},{"date":20170606,"rank":3859},{"date":20170608,"rank":3782},{"date":20170612,"rank":3737},{"date":20170615,"rank":3697},{"date":20170621,"rank":3574},{"date":20170621,"rank":3485},{"date":20170706,"rank":3300},{"date":20170706,"rank":3258},{"date":20170721,"rank":3086},{"date":20170728,"rank":3001},{"date":20170731,"rank":2988},{"date":20170802,"rank":2957},{"date":20170822,"rank":2786},{"date":20170823,"rank":2764},{"date":20170830,"rank":2719},{"date":20170901,"rank":2696},{"date":20170906,"rank":2664},{"date":20170918,"rank":2576},{"date":20170922,"rank":2550},{"date":20171109,"rank":2358}]};

var startDay = new Date(2016,8,31).getTime();
var now = new Date().getTime();

var d = [];
for(var i =0;i<data.details.length;i++){
	var info = data.details[i];
	var time = info.date.toString();
	var rank = info.rank;
	
	var nY = time.substring(0,4);
	var nM = parseInt(time.substring(4,6))-1;
	var nD = time.substring(6,8);
	
	var date = new Date(nY,nM,nD);
	var range = (date.getTime() - startDay) / (now - startDay);
	d.push([date,rank,range]);
}

option = {
    title : {
        text : '时间坐标折线图',
        subtext : 'dataZoom支持'
    },
    tooltip : {
        trigger: 'item',
        formatter : function (params) {
            var date = new Date(params.value[0]);
            data = date.getFullYear() + '-'
                   + (date.getMonth() + 1) + '-'
                   + date.getDate() + ' '
                   + date.getHours() + ':'
                   + date.getMinutes();
            return data + '<br/>'
                   + params.value[1] + ', ' 
                   + params.value[2];
        }
    },
    toolbox: {
        show : true,
        feature : {
            mark : {show: true},
            dataView : {show: true, readOnly: false},
            restore : {show: true},
            saveAsImage : {show: true}
        }
    },
    dataZoom: {
        show: true,
        start : 70
    },
    legend : {
        data : ['rank']
    },
    grid: {
        y2: 80
    },
    xAxis : [
        {
            type : 'time',
            splitNumber:10
        }
    ],
    yAxis : [
        {
            type : 'value'
        }
    ],
    series : [
        {
            name: 'series1',
            type: 'line',
            showAllSymbol: true,
            symbolSize: function (value){
                return 1.0;
            },
            data: (function () {                
                return d;
            })()
        }
    ]
};
                    

