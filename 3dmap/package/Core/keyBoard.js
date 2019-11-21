/**
 * 键盘对象封装
 */

export default class keyBoard{

    constructor(Buttom,Lift,rigth,top){
        this.dom = document;

        this.dom.οnkeydοwn = function(event){
            var e = event || window.event || arguments.callee.caller.arguments[0];
        
            if(e && e.keyCode==40){ //下
                Buttom();
            }
            if(e && e.keyCode==37){ //左
                Lift();
            }
            if(e && e.keyCode==39){ //右
                rigth();
            }
            if(e && e.keyCode==38){ // 上
                top();
            }
        };
    }
   
}