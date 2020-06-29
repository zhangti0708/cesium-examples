/**
 * webSockt封装
 */
var WBT = function (obj,call) {
    /*
    websocket接口地址
    1、http请求还是https请求 前缀不一样
	2、ip地址host
    3、端口号
    */
    const config = obj ? obj : {}
    const protocol = (window.location.protocol == 'http:') ? 'ws://' : 'wss://';
    const host =  window.location.host;
    if(!config)return false;
    //接口地址url
    this.url = obj.url ? obj.url: config.ip || protocol + host + config.port;
    //socket对象
    this.socket;
    //心跳状态  为false时不能执行操作 等待重连
    this.isHeartflag = false;
    //重连状态  避免不间断的重连操作
    this.isReconnect = false;
    //回调方法
    this.call = call;
    //自定义Ws连接函数：服务器连接成功
    this.onopen = ((e) => {
        this.isHeartflag = true;
        this.socket.send('start');
    	console.log(e)
    })
    //自定义Ws消息接收函数：服务器向前端推送消息时触发
    this.onmessage = ((e) => {
        //处理各种推送消息
        if('location' == obj.type)//定位
            {this.location(e);}
        else
            {this.handleEvent(e)}//事务
    })
    //自定义Ws异常事件：Ws报错后触发
    this.onerror = ((e) => {
        console.log('error')
        this.isHeartflag = false;
        this.reConnect();
    })
    //自定义Ws关闭事件：Ws连接关闭后触发
    this.onclose = ((e) => {
        //this.reConnect()
        console.log('close')
    })
    //初始化websocket连接
    this.initWs()
}
//初始化websocket连接 
WBT.prototype.initWs = function () {
    window.WebSocket = window.WebSocket || window.MozWebSocket;
    if (!window.WebSocket) { // 检测浏览器支持  			
        console.error('错误: 浏览器不支持websocket');
        return;
    }
    var that = this;
    this.socket = new WebSocket(this.url); // 创建连接并注册响应函数  
    this.socket.onopen = function (e) {
        that.onopen(e);
    };
    this.socket.onmessage = function (e) {
        that.onmessage(e);
    };
    this.socket.onclose = function (e) {
        that.onclose(e);
        that.socket = null; // 清理  		
    };
    this.socket.onerror = function (e) {
        that.onerror(e);
    }
    return this;											
}
//断线重连 reConnect
WBT.prototype.reConnect = function () {
    if (this.isReconnect) return;
    this.isReconnect = true;
    //没连接上会一直重连，设置延迟避免请求过多
    setTimeout( ()=> {
        this.initWs()
        this.isReconnect = false;
  	 }, 2000);
}	
//处理消息
WBT.prototype.handleEvent = function (message) {
    const action = message.action;
    const retCode = message.params.retCode.id;
    //根据action和retCode处理事件
    // console.log(action,retCode)
    if (this.handleAction[action][retCode]) this.handleAction[action][retCode]();
}
//事务处理 根据action
WBT.prototype.handleAction = {
    //登录反馈
    'loginRsp': {
        '0': function () {
            console.log(0)
        },
        '3': function () {
            console.log(3)
        }
    }
}
let defaultParam = {
    action: "loginReq",
    tsxId: "1",
    params:{}
}
//登陆
WBT.prototype.login = function (params) {
    //ws还没建立连接（发生错误）
    if (!this.isHeartflag) {
    	console.log('连接中……')
      	return;
    }
    let loginParam = defaultParam;
    loginParam.params = params;
    //组装json数据
    this.socket.send(JSON.stringify(loginParam))
}
//定位
WBT.prototype.location = function (event) {
    if (!this.isHeartflag) {
    	console.log('连接中……')
      	return;
    }
    let satellite = 0;
    if (event.data === undefined)return false;
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
            var newLonlat = GPS.gcj_encrypt(pos.latitude, pos.longitude);
            if(typeof this.call === 'function'){
                this.call({lon:newLonlat.lon,lat:newLonlat.lat,alt:pos.altitude,speed:sp.toFixed(2),time:result.Format('yyyy-MM-dd HH:mm:ss')
                ,satellite:satellite});
            }
        }
    }else if(msgdata.type == "satellite"){
        if(msgdata.data.info)satellite = msgdata.data.info.length
    }
}
//date format
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