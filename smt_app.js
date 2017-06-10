/**
 * Created by Administrator on 2017/5/31.
 */
const express=require('express');
const http=require('http');
const smt=require('./smt_center')
var app=express()
http.createServer(app).listen(8080)

app.use(express.static('public'));

app.get('/smtMain',smt.getAll)
app.get('/smtMain/:start',smt.getByPage)
app.get('/Search',smt.getByKw)
app.get('/myDetail/:id',smt.getById)
app.get('/addCart',smt.addCart)
app.get('/getCart',smt.getCart)
app.post('/updateCart',smt.updateCart)
app.post('/addOrder',smt.addOrder)