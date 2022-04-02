var express = require('express');
const Joi = require('joi');
const middlewareAuth = require('../middleware/auth');
var router = express.Router();

const sqlite3 = require('sqlite3').verbose();
const file = './FinalProject.db';
//open database 
let db =  new sqlite3.Database(file,(err) => {
    if(err){
        return console.error(err.message);
    }
    console.log('Successfully Connected to FinalProject.db sqlite database2.')
});

router.get('/', function(req, res, next) {
    db.all("SELECT * FROM Products;", (err, rows) => {
      if (err) {
        res.json({"error":err.message});
        return;
      }
      res.json({
        "status" : 0,
        "message" : "success",
        "data" : rows
      });
    });
  });

router.get('/:id', function(req, res, next) {
  db.all("SELECT * FROM Products WHERE id = "+req.params.id+";", (err, rows) => {
    if (err) {
      res.json({"error":err.message});
        return;
    }
    res.json({
        "status" : 0,
        "message" : "success",
        "data" : rows
    });
 });
});

router.post('/',middlewareAuth.VerifyToken,(req,res,next) => {
  var reqBody = req.body;
  var sqlInsert = 'INSERT INTO Products(p_name,description,image,stock,price,startSaleTime,endSaleTime) VALUES (?,?,?,?,?,?,?);';
  db.run(sqlInsert, [reqBody.name,reqBody.description,reqBody.image,reqBody.stock,reqBody.price,reqBody.startSaleTime,reqBody.endSaleTime]);
  db.get(`SELECT * FROM Products WHERE p_name = '${req.body.name}'`,(err,row) => {
    if(!row || err){
      res.send("displayed failed "+err);
      console.log(row);
      console.log(err);
    }else{
      res.json({
        "status" : 0,
        "message" : "success",
        "data" : {
          "id" : req.body.id,
          "name" : row.p_name,
          "description" : row.description,
          "picture" : row.image,
          "inventory" : row.stock,
          "price" : row.price,
          "startSaleTime" : row.startSaleTime,
          "endSaleTime" : row.endSaleTime
        }
      })
      console.log('insert success');
    }
  })
});

router.patch('/:id',middlewareAuth.VerifyToken,(req,res,next) => {
  var sqlinsert = "UPDATE Products set p_name = ?,description = ?,image = ?,stock = ?,startSaleTime = ?,endSaleTime = ? WHERE id = ?;";
  db.run(sqlinsert,[req.body.name,req.body.description,req.body.image,req.body.stock,req.body.startSaleTime,req.body.endSaleTime,req.params.id]);
  db.get(`SELECT * FROM Products WHERE id = '${req.params.id}'`,(err,row) => {
    if(!row||err){
      res.send(err);
      return;
    }
    else{
      res.json({
        "status" : 0,
        "message" : "success",
        "data" : row
      });
      console.log('update success');
    }
  });
});

router.delete('/:id',middlewareAuth.VerifyToken,(req,res,next) => {
  var sqldelete = "DELETE FROM Products WHERE id = ? ;";
  db.run(sqldelete,req.params.id);
  res.json({
    "status" : 0,
    "message" : "success",
    "data" : req.params.id
  });
});

module.exports = router;