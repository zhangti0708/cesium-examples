/**
 * 辅助对象
 */
var auxiliary = function(){}
auxiliary.prototype = {
		nullBool : function(param){  // 对象为空判断 为空返回true，反之false
			if(null === param || undefined === param )return true;
			return false;
		} , strBool : function(param){  // string判断 为空返回true，反之false
			if( this.nullBool(param) || "" === param || param.length === 0 )return true;
			return false;
		} , arrBool : function(param){  // arraty判断 length不为零 为空返回true，反之false
			if(null === param || undefined === param || param.length === 0)return true;
			return false;
		} , mapBool : function(param){  // 判断map是否为空 为空返回true，反之false
		    for (var t in param)  
		        return !1;  
		    return !0  
		} , jsonBool : function(param) {  // 判断json是否可用，true为不可用，false反之
			if( this.nullBool(param) 
					|| this.getMapSize(param) === 0  )return true;
			return false;
		} , initError : function(param){  // 初始化异常： 为空返回true，反之false
			if(null === param || undefined === param){
				alert("初始化页面异常，请刷新页面重新尝试！");
				return true;
			}
			return false;
		} , isArray : function(obj){  // 判断是否是array
			return (typeof obj=='object')&&obj.constructor==Array; 
		} , isString : function(str){  // 判断是否是字符串
			return (typeof str=='string')&&str.constructor==String; 
		} , isNumber : function(obj){   // 判断是否是数值
			return (typeof obj=='number')&&obj.constructor==Number; 
		} , isDate : function(obj){   // 是否是时间对象
			return (typeof obj=='object')&&obj.constructor==Date; 
		} , isFunction : function(obj){   // 判断是否是函数
			return (typeof obj=='function')&&obj.constructor==Function; 
		} , isObject : function(obj){   // 判断是否是对象
			return (typeof obj=='object')&&obj.constructor==Object; 
		} , getMapSize : function(map){ // 获取map的个数
			var index  = 0 ;
			if(this.nullBool(map))return index;
			for(var s in map){
				++index;
			}
			return index;
		} , isIEBrowser : function(){  // ie浏览器判断,是返回true
			return !!window.ActiveXObject || "ActiveXObject" in window ? true : false;
		} , mapMerge : function( coverMap , subjectMap ) {  // 将两个map合并成一个map
			// coverMap 覆盖map，即两个map中有相同子元素，以覆盖此map中元素为准
			var map = JSON.parse(JSON.stringify(coverMap));
			var map2 = JSON.parse(JSON.stringify(subjectMap));
			for( var s in map2 ){
				map[s] = map2[s];
			}
			return map;
		} , deepCopy : function(obj){  // 深拷贝
			return JSON.parse(JSON.stringify(obj));
		} , numForEach : function(num , func){
			for( var i = 0 ; i < num ; i++ ){		// 数循环
				func(i)
			}
		} , arrForEach : function(arr , func) {
			// 经测试，双重循环100次（10000次循环）比for循环 差 0.5秒
			try{
				for( var i = 0 ; i < arr.length ; i++ ){		// arr对象循环
					var bool = func(arr[i] , i);
					if(true === bool){
						return;
					}
				}
			}
			catch(e){
				console.log(e);
			}
		} , isChildren : function (contrastObj , boolObj) { // 判断是否是指定对象子类或自身 ， 是返回true 
			var result = false;
			if(!this.nullBool(contrastObj)  && !this.nullBool(boolObj)){
				if("body" === boolObj[0].nodeName.toLowerCase()){
					result = false;
				}else{
					var boolResult = $(contrastObj).is(boolObj);
					if(boolResult){
						result = true;
					}else{
						result = this.isChildren(contrastObj , $(boolObj).parent());
					}
				}
			}
			return result;
		} , getCoords : function(el){ // 获取元素在页面中的坐标
			  var box = el.getBoundingClientRect(),
			  doc = el.ownerDocument,
			  body = doc.body,
			  html = doc.documentElement,
			  clientTop = html.clientTop || body.clientTop || 0,
			  clientLeft = html.clientLeft || body.clientLeft || 0,
			  top  = box.top  + (self.pageYOffset || html.scrollTop  ||  body.scrollTop ) - clientTop,
			  left = box.left + (self.pageXOffset || html.scrollLeft ||  body.scrollLeft) - clientLeft
			  return { 'top': top, 'left': left };
	  } , checkEmail : function(str){ 	// 邮箱验证
		    var re = /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/; 
		    if (re.test(str)) {
		    	return true;
		    } else {
		    	return false;
		    }
	  } , checkMobile : function(str){	// 手机验证 , 11位数字，以1开头。
		  var  re = /^1\d{10}$/;
		  if (re.test(str)) {
			  return true;
		  } else {
			  return false;
		  }
	  } , checkUser : function(str){ // 验证帐号是否合法,字母、数字、下划线组成，字母开头，4-16位。
		  var re = /^[a-zA-z]\w{4,15}$/;
		  if (re.test(str)) {
			  return true;
		  } else {
			  return false;
		  }
	  } , checkFullAngle : function(str){	// 判断是否有全角 , 有返回true
		  var str2=str.match(/[\uff00-\uffff]/g);
		  if(null === str2){
			  return false;
		  }else{
			  return true;
		  }
	  } , chackStr : function(str){ // 判断是否有特殊符号 和 数字 ，有返回true
		  var regEn = /[-`~!@#$%^&*()_=+<>?:"{},\\\\.\/;'[\]]/im,
		    regCn = /[·！#￥（——）：；“”‘、，|《。》？、【】[\]]/im;
		  if(regEn.test(str) || regCn.test(str)) { // 包含返回true
			    return true;
		  }
		  return false;
	  } , getSelectAttr : function(select , attrName){
		  return $($(select).children("option:selected")).attr(attrName);
	  } , getEventSource : function(event){ // 获取事件源对象
		  return (bool.isIEBrowser() ? event.srcElement : event.target);
	  } , addPropertychange : function(Obj , func){	// 给input添加文本改变事件
		  if(this.arrBool($(Obj))){
			  console.log("文本改变监控创建失败！");
			  return;
		  }
		  $(Obj).unbind().on('input propertychange',func);
	  } , addBlur : function(Obj , func){	// 给input对象添加鼠标光标离开事件
		  $(Obj).blur(func);
	  } , timingTask : function(func , hours , minutes , seconds){ // 每天指定时间执行
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
	  } , strRegHandle : function(str){ // 字符串正则处理
		  if(arguments.length == 0) return this;
		  var obj = arguments[0];
		  var s = this;
		  for(var key in obj) {
			  s = s.replace(new RegExp("\\{\\{" + key + "\\}\\}", "g"), obj[key]);
		  }
		  return s;
	  }
}

// ------------------------------------ 字符串正则处理 -----------------------------------------------------

String.prototype.format = function() {
	if(arguments.length == 0) return this;
	var obj = arguments[0];
	var s = this;
	for(var key in obj) {
		s = s.replace(new RegExp("\\{\\{" + key + "\\}\\}", "g"), obj[key]);
	}
	return s;
}

/*// 测试代码
var data = {
	name:"张三",
	age:23,
	sex:"男"
}
var text = "我叫{{name}},我今年{{age}}岁,我的性别是{{sex}}!".format(data);
// console.log(text); // 我叫张三,我今年23岁,我的性别是男!
*/

// ---------------------------------------------- 颜色转变类型
// -------------------------------------------------------

var reg = "/^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/";	// 十六进制颜色值的正则表达式
// 颜色转换，RGB颜色转换为16进制 (处理边界填充)
String.prototype.colorHex = function(){
	var that = this;
	if(/^(rgb|RGB)/.test(that)){
		var aColor = that.replace(/(?:\(|\)|rgb|RGB)*/g,"").split(",");
		var strHex = "#";
		for(var i=0; i<aColor.length; i++){
			var hex = Number(aColor[i]).toString(16);
			if(hex === "0"){
				hex += hex;	
			}
			strHex += hex;
		}
		if(strHex.length !== 7){
			strHex = that;	
		}
		return strHex;
	}else if(reg.test(that)){
		var aNum = that.replace(/#/,"").split("");
		if(aNum.length === 6){
			return that;	
		}else if(aNum.length === 3){
			var numHex = "#";
			for(var i=0; i<aNum.length; i+=1){
				numHex += (aNum[i]+aNum[i]);
			}
			return numHex;
		}
	}else{
		return that;	
	}
};

// 颜色转换，16进制颜色转为RGB格式 (处理边界填充)
String.prototype.colorRgb = function(data){
	var sColor = this.toLowerCase();
	if(sColor){
		if(sColor.length === 4){
			var sColorNew = "#";
			for(var i=1; i<4; i+=1){
				sColorNew += sColor.slice(i,i+1).concat(sColor.slice(i,i+1));	
			}
			sColor = sColorNew;
		}
		if( sColor.indexOf("rgba") != -1 ){
			var indexs = sColor.lastIndexOf(",");
			var strParam = sColor.substring(0,indexs+1);
			strParam += data+")";
			return strParam;
		}
		var sColorChange = [];
		for(var i=1; i<7; i+=2){
			sColorChange.push(parseInt("0x"+sColor.slice(i,i+2)));	
		}
		return "RGBA(" + sColorChange.join(",") + ","+data+")";
	}else{
		return sColor;	
	}
};


// ------------------------------------------------------- 根据正则内容格式化时间
// ---------------------------------------------------------------
// 对Date的扩展，将 Date 转化为指定格式的String
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
Date.prototype.Format = function (fmt) { // author: meizz
    var o = {  
        "M+": this.getMonth() + 1, // 月份
        "d+": this.getDate(), // 日
        "H+": this.getHours(), // 小时
        "m+": this.getMinutes(), // 分
        "s+": this.getSeconds(), // 秒
        "q+": Math.floor((this.getMonth() + 3) / 3), // 季度
        "S": this.getMilliseconds() // 毫秒
    };  
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));  
    for (var k in o)  
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));  
    return fmt;  
}  
  
// 调用：
// var time1 = new Date().Format("yyyy-MM-dd");  
// var time2 = new Date().Format("yyyy-MM-dd HH:mm:ss");  
  
// var nowTime=new Date();  
// nowTime.setMonth(nowTime.getMonth()-1);    
// alert(nowTime.Format("yyyy-MM-dd HH:mm:ss"));//上月当前时间

// ----------------------------------------------------- 创建实体
// -----------------------------------------------------------------

/**
 * 维度数据返回封装
 * 
 * @param dimensionChoice
 *            维度子项选中的uuid串（uuid1，uuid2...）
 * @param dimensionName
 *            维度子项选中的名称串（维度1|邮政，中国；维度2|邮政，中国...）
 * @param status
 *            获取当前维度项的状态，判断出错
 * @param code
 *            预留属性，用于指定多个维度其中一个必须有选中项判断
 * @param errorTitle
 *            错误提示语
 */
var dimensionResult = function() {
	this.dimensionChoice = null;
	this.dimensionName = null;
	this.status = null;
	this.code = null;
	this.errorTitle = null;
}

/**
 * 错误时候的封装封装
 */
dimensionResult.prototype.error = function(str){
	this.status = false;
	this.errorTitle = str;
	return this;
}

/**
 * 正确时候的封装封装
 */
dimensionResult.prototype.success = function(str , str2){
	this.status = true;
	this.dimensionChoice = str;
	this.dimensionName = str2;
	return this;
}

/**
 * 修改 封装属性 dimensionChoice
 * 
 * @param str
 *            维度子项选中的uuid串
 */
dimensionResult.prototype.setDimensionChoice = function(str) {
	this.dimensionChoice = str;
}

/**
 * 修改 封装属性 status
 * 
 * @param booleans
 *            当前维度项的状态，判断出错
 */
dimensionResult.prototype.setStatus = function( booleans ) {
	this.status = booleans;
}

/**
 * 修改 封装属性 code
 * 
 * @param str
 *            用于指定多个维度其中一个必须有选中项判断
 */
dimensionResult.prototype.setCode = function( str ) {
	this.code = str;
}

/**
 * 修改 封装属性 errorTitle
 * 
 * @param str
 *            错误提示，表明当前为什么错了
 */
dimensionResult.prototype.setErrorTitle = function( str ) {
	this.errorTitle = str;
}



// ----------------------------------------------------- 动态事件封装
// -----------------------------------------------------------------

var onPostAjax_1 = function( ajaxUrl , ajaxData , callback ){
	if( bool.mapBool(ajaxData) )ajaxData = {};
	$.ajax({ url: ajaxUrl, data: ajaxData, type: 'post', dataType: 'json',
		async: false,
		success:function(data){
			if( data.status === 0 ){
				if( typeof callback === "function" ){
					callback( data );
				}
			}else{
				alert( data.info );
			}
		},
		error:function(e){
			alert("查询异常，请刷新页面重新尝试！");
		}
	});
}

/**
 * ajax 封装
 * @param AjaxUrl 接口url
 * @param AjaxData 传参
 * @param AjaxFunc 回调事件
 * @param AjaxExecutionMode  ajax执行方式（同步 异步）
 */
var acc_ajaxEncapsulation = function( AjaxUrl , AjaxData , AjaxExecutionMode , AjaxFunc ) {
	var bool = new auxiliary();
	if(!bool.strBool(AjaxUrl)){
			if(bool.nullBool(AjaxData)) AjaxData = {};
			if(bool.nullBool(AjaxFunc)) AjaxFunc = null;
			$.ajax({
				url : AjaxUrl, type:"POST", data: AjaxData, dataType:"json",async: AjaxExecutionMode ,success: AjaxFunc
			})
	}
}

/**
 * ajax 封装: 插入数据(同步)
 * @param AjaxUrl 接口url
 * @param AjaxData 传参
 */
var insertData = function(AjaxUrl , AjaxData){
	var result = null;
	acc_ajaxEncapsulation(AjaxUrl , AjaxData , false , function(data){
		result =  ("0" === data.status || "08" === data.status 
				|| 0 === data.status) ? true : false;
	})
	return result;
}

/**
 * ajax 封装: 获取接口数据(同步)
 * @param AjaxUrl 接口url
 * @param AjaxData 传参
 * @param func 回调函数
 */
var getInterfaceData = function( AjaxUrl , AjaxData , func ) {
	var bool = new auxiliary() , resultData  = null;
	if(!bool.strBool(AjaxUrl)){
		if(bool.nullBool(AjaxData)) AjaxData = {};
		$.ajax({
			url : AjaxUrl, type:"POST", data: AjaxData, dataType:"json",async: false ,
			success: function(data) {
				if("0" === data.status || "08" === data.status 
						|| 0 === data.status){
					resultData = data.result;
					if(bool.isFunction(func)){
						func(resultData);
					}
				}
				loadingClear();
			},
			error : function(){
				loadingClear();
			}
		})
	}
	return resultData;
}

/**
 	让线程睡眠指定时间：（单位）毫秒
 */
function acc_sleep(number){
	var nowDate = new Date().getTime();
	var nextDate = nowDate + number;
	var runnable = true;
	while(runnable){
		if(nowDate > nextDate 
				|| nowDate === nextDate)runnable = false;
		nowDate = new Date().getTime();
	}
}

// 页面loading
/**
 * 增加页面loading 包含8种loading，只用更换spinner，例如：spinner1
 * @param time 2018_3_17 14:04
 * @param author Sixgod
 */
var loadingShow = function() {
	$("body").append("<div class='fakeloader'></div>");
	$(".fakeloader").fakeLoader({
		timeToHide : 500000000,
		bgColor : "rgba(16, 10, 9, 0.22)",
		spinner : "spinner3"
	});
}


/**
 * 删除页面loading
 * @param time 2018_3_17 14:04
 * @param author Sixgod
 */
var loadingClear = function(){
	$('.fakeloader').remove();
}

/**
 *  全局变量
 */
var fn_tool = new auxiliary();