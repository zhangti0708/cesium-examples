String.prototype.startWith = function (compareStr) {
    return this.indexOf(compareStr) == 0;
}

/**
 *  查看日志的WebSocket
 * @param {type} wsurl
 * @returns {LogWebSocket}
 */
function LogWebSocket(wsurl,call) {
    var ws = null;
    //判断当前浏览器是否支持WebSocket
    if ('WebSocket' in window) {
        ws = new WebSocket(wsurl);
    } else if ('MozWebSocket' in window) {
        ws = new MozWebSocket(wsurl);
    } else {
        alert('您的浏览器不支持 websocket 连接，请换一个浏览器，例如：Chrome，Firefox');
    }
    //this.map = map
    //连接发生错误的回调方法
    ws.onerror = function (event) {
        //setMessageInnerHTML(event.data);
        console.log("发生错误。。。");
    };

//连接成功建立的回调方法
    ws.onopen = function (event) {
        //setMessageInnerHTML(event.data);
        console.log("客户端已连接。。。");
    };

//接收到消息的回调方法
    ws.onmessage = function (event) {
        if (event.data === undefined) {
            return;
        }
        var msgdata = JSON.parse(event.data);
        if (msgdata.type == "location") {
            var date = msgdata.data.date;
            var time = msgdata.data.time;
            var qa = msgdata.data.fixQuality;
            var pos = msgdata.data.position;
            var sp = msgdata.data.speed;
            if (qa) {
                var datetime = new Date(date.year, date.month - 1, date.day, time.hour, time.minutes, time.seconds);
                var result = new Date(datetime.getTime() + 8 * 3600 * 1000);
                $("#timeinfo").text(result.Format('yyyy-MM-dd HH:mm:ss'));
                $("#loninfo").text(pos.longitude.toFixed(6));
                $("#latinfo").text(pos.latitude.toFixed(6));
                $("#altinfo").text(pos.altitude.toFixed(2) + " m");
                $("#speedinfo").text(sp.toFixed(2) + " km/h");
                var newLonlat = GPS.gcj_encrypt(pos.latitude, pos.longitude);
                var _center = ol.proj.fromLonLat([newLonlat.lon,newLonlat.lat]);
                //var f = BIGMap.getMarkersLayer().getSource().getFeatureById("gps01");
                if(typeof call === 'function'){
                    call({lon:pos.longitude.toFixed(6),lat:pos.latitude.toFixed(6),alt:pos.altitude.toFixed(2),sp:sp.toFixed(2),time:result.Format('yyyy-MM-dd HH:mm:ss')});
                }
                /*if(!f){
                     BIGMap.addMarker([newLonlat.lon,newLonlat.lat],pos.altitude,null,"",true).setId("gps01");
                      map.getView().setZoom(16);
                }else{
                    f.getGeometry().setCoordinates(_center);
                }          
                map.getView().setCenter(_center);*/
            }
        } else if (msgdata.type == "satellite") {
            if (msgdata.data.info) {
                $("#satinfo").text(msgdata.data.info.length);
            }
        }
        //setMessageInnerHTML(event.data);
    };

//连接关闭的回调方法
    ws.onclose = function (event) {
        ws.send("stop");
    };

//监听窗口关闭事件，当窗口关闭时，主动去关闭websocket连接，防止连接还没断开就关闭窗口，server端会抛异常。
    window.onbeforeunload = function () {
        ws.send("stop");
        ws.close();
    };
    //设置全局变量
    this.websocket = ws;
}

//关闭连接
LogWebSocket.prototype.closeWebSocket = function () {
    this.websocket.close();
};

//发送消息
LogWebSocket.prototype.sendMsg = function (msg) {
    this.websocket.send(msg);
};

//消息记录数
var lineCount = 0;
var gpsCount = 0;
//将消息显示在网页上
function setMessageInnerHTML(message) {
    if (message === undefined) {
        return;
    }
    var msg = JSON.parse(message);
    if (msg.type == "location") {
        if (gpsCount < 200) {
            $("#basicinfo div").append(message).append("<br>");
            $("#basicinfo").scrollTop($("#basicinfo div").height() - $("#basicinfo").height());
            gpsCount++;
        } else {
            $("#basicinfo div").html(" ").append("<br>");
            gpsCount = 0;
        }

    } else if (msg.type == "satellite") {
        if (lineCount < 200) {
            $("#detailinfo div").append(message).append("<br>");
            // 滚动条滚动到最低部
            $("#detailinfo").scrollTop($("#detailinfo div").height() - $("#detailinfo").height());
            lineCount++;
        } else {
            $("#detailinfo div").html(" ").append("<br>");
            lineCount = 0;
        }
    } else {
        console.log(message);
    }

}
Date.prototype.Format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1,
        "d+": this.getDate(),
        "H+": this.getHours(),
        "m+": this.getMinutes(),
        "s+": this.getSeconds(),
        "S+": this.getMilliseconds()
    };
    //因为date.getFullYear()出来的结果是number类型的,所以为了让结果变成字符串型，下面有两种方法：
    if (/(y+)/.test(fmt)) {
        //第一种：利用字符串连接符“+”给date.getFullYear()+""，加一个空字符串便可以将number类型转换成字符串。
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
            //第二种：使用String()类型进行强制数据类型转换String(date.getFullYear())，这种更容易理解。
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(String(o[k]).length)));
        }
    }
    return fmt;
};