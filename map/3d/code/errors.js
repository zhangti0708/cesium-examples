/*
 * @Descripttion: 
 * @version: 1.0
 * @Author: zhangti
 * @Date: 2019-09-29 15:53:08
 * @LastEditors: sueRimn
 * @LastEditTime: 2019-11-25 09:22:20
 */

export default class Errors{

    constructor(error){
       this.errorBox(error);
    }

    errorBox(error){
        alert(error);
    }

}