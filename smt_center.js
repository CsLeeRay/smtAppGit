/**
 * Created by Administrator on 2017/5/31.
 */
const pool=require('./pool')
const qs=require('querystring');

module.exports={
    getAll:function(req,res){
        var start=0;
        var count=5;
        pool.getConnection(function(err,conn){
            if(err) throw err;
            conn.query('SELECT*FROM smt_pro LIMIT ?,?',[start,count],function(err,result){
                //console.log(result)
                res.json(result);
                conn.release()
            })
        })
    },
    getByPage:function(req,res){
        var begin=parseFloat(req.params.start);
        console.log(begin);
        var count=5;
        //console.log(count);
        pool.getConnection(function(err,conn){
            if(err) throw err;
            conn.query("SELECT * FROM smt_pro LIMIT ?,?",[begin,count],function(err,result){
                //console.log(result)
                res.json(result);
                conn.release()
            })
        })
    },
    getByKw:function(req,res){
        //console.log(req.query)
        var key=req.query.kw
        console.log( typeof key)
        pool.getConnection(function(err,conn){
            if(err) throw err;
            conn.query("SELECT did,name,price,img_sm,material FROM smt_pro WHERE material LIKE ? OR name LIKE ? ",
                ['%'+key+'%','%'+key+'%'],
                function(err,result){
                    if(err) throw err;
                    //console.log(result)
                    res.json(result)
                    conn.release();
                })
        })
    },
    getById:function(req,res){
        var did=parseFloat(req.params.id)
        pool.getConnection(function(err,conn){
            if(err) throw err;
            conn.query("SELECT name,price,img_lg,material,detail,did FROM smt_pro WHERE did=? ",[did],
                function(err,result){
                    if(err) throw err;
                    //console.log(result)
                    res.json(result)
                    conn.release();
                })
        })
    },
    addCart:function(req,res){
        var did1=parseFloat(req.query.did);
        console.log(did1)
        var userId=parseFloat(req.query.uid);
        console.log(userId)
        pool.getConnection(function(err,conn){
            if(err) throw err;
            conn.query("SELECT ctid FROM smt_cart WHERE userid=? AND did=? ",[userId,did1],
            function(err,result){
                if(err) {throw err;
                }else{
                    console.log(result)
                    if(result.length===0){
                    //console.log(1)
                    conn.query("INSERT INTO smt_cart VALUES(NULL,?, ?,1)",[userId,did1],
                    function(err,result1){
                        if(err) throw err;
                        console.log(result1)
                        var str={code:1,msg:"succ"};
                        res.json(str)
                    })
                }else{
                        conn.query("update smt_cart set dishCount=dishCount+1 where userid=? AND did=?",[userId,did1],
                            function(err,result1){
                                if(err) throw err;
                                console.log(result1)
                                var str={code:1,msg:"succ"};
                                res.json(str)
                            })
                    }
                conn.release()
            }
            })
        })
    },
    getCart:function(req,res){
        var userId=parseFloat(req.query.uid)
        pool.getConnection(function(err,conn){
            if(err) throw err;
            conn.query("SELECT smt_cart.ctid,smt_cart.did,smt_cart.dishCount,smt_pro.name,smt_pro.img_sm,smt_pro.price FROM smt_pro,smt_cart WHERE smt_cart.did=smt_pro.did AND smt_cart.userid=?",
            [userId],function(err,result){
                res.json(result)
                conn.release()
                })
        })
    },
    updateCart:function(req,res){
        req.on('data',function(data){
            //console.log(data)
            var obj=qs.parse(data.toString())
            //console.log(obj)
            var uid1=parseFloat(obj.uid)
            //console.log(uid1)
            var did2=parseFloat(obj.did1)
            var count=parseFloat(obj.count1)
            pool.getConnection(function(err,conn){
                if(err) throw err;
                conn.query("update smt_cart set dishCount=? where userid=? AND did=?",
                    [count,uid1,did2],function(err,result){
                        res.json(result)
                        conn.release()
                    })
            })
        })
    },
    addOrder:function(req,res){
        req.on('data',function(data){
            var obj=qs.parse(data.toString())
            console.log(obj)
            var userId=obj.userid
            var addr1=obj.addr
            var uname=obj.user_name
            var tel=obj.phone
            var se=obj.sex
            var total=obj.totalprice
            var detail=obj.cartDetail
            var orderTime=new Date().getTime()
            pool.getConnection(function(err,conn){
                if(err) throw err;
                conn.query("insert into smt_order values(null,?,?,?,?,?)",[
                    tel,uname,se,orderTime,addr1
                ],function(err,result){
                    if(err) throw err;
                    console.log(result.insertId)
                    var str={msg:"succ",code:1,oid:result.insertId}
                    res.json(str)
                    conn.release()
                })
            })
            //if(userId===undefined||addr1===undefined||uname===undefined||
            //    tel===undefined||se===undefined||total===undefined){
            //    var str={code:-1,msg:'error'}
            //    res.json(str)
            //}
        })
    }
}