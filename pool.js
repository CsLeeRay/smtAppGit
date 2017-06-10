/**
 * Created by Administrator on 2017/5/31.
 */
const mysql=require('mysql');
var pool=mysql.createPool({
    hostname:'127.0.0.1',
    user:'root',
    password:'',
    database:'smtApp',
    connectionLimit:10
})
module.exports=pool
