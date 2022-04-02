
var express = require('express');
var middlewareAuth = require('../middleware/auth');
var router = express.Router();

const sqlite = require('sqlite3').verbose();
const file = './FinalProject.db';

let db = new sqlite.Database(file,(err) => {
    if(err){
        return console.error(err.message);
    }
    console.log("Successfully Connected to FinalProject.db sqlite database by orders.js .");
});

router.get('/',middlewareAuth.VerifyToken,(req,res) => {
    //var sqlselect = `SELECT * FROM Members,Products
    //WHERE Products.id in (SELECT productid FROM Orders WHERE membersid = '${req.body.id}')
    //AND Members.id = '${req.body.id}'`;
    var sqlselect = `SELECT * from orders,Products 
    left JOIN Members on  Orders.membersid = Members.id
    WHERE Orders.membersid ='${req.body.id}'
    ANd Products.id=Orders.productid`
    db.all(sqlselect,(err,rows) => {
        if(err){
            res.json({"error":err.message});
            return;
        }
        //console.log(rows);
        const newRows = rows.map(row => ({
            buyerName : row.m_name,
            buyerEmail : row.email,
            buyerPhone : row.phone,
            name : row.p_name,
            description :row.description,
            picture : row.image,
            price : row.price,
            amount : row.amount
        }));
        console.log(newRows);
        res.json({
            "status" : 0,
            "message" : "success",
            "data" :  newRows
        });
    });
});

router.get('/:id',middlewareAuth.VerifyToken,(req,res) => {
    /*var sqlselect = "SELECT * FROM Orders,Members WHERE Orders.id = "+req.params.id+" AND Members.id = "+req.params.id+";";
    db.all(sqlselect,(err,rows) => {
        if(err){
            res.json({"err" : err.message});
            return;
        }
        res.json({
            "status" : 0,
            "message" : "success",
            "data" : rows
        });
    })*/
    var sqlselect = `SELECT * from orders,Products 
    left JOIN Members on Orders.membersid = Members.id
    WHERE Orders.membersid ='${req.body.id}'
    AND Products.id=Orders.productid LIMIT ('${req.params.id}'-1),1 `
    db.all(sqlselect,(err,rows) => {
        if(err){
            res.json({"error":err.message});
            console.log(err)
            return;
        }
        console.log(rows);
        const newRows = rows.map(row => ({
            buyerName : row.m_name,
            buyerEmail : row.email,
            buyerPhone : row.phone,
            name : row.p_name,
            description :row.description,
            picture : row.image,
            price : row.price,
            amount : row.amount
        }));
        console.log(newRows);
        res.json({
            "status" : 0,
            "message" : "success",
            "data" :  newRows
        });
    });
});

router.post('/',middlewareAuth.VerifyToken,(req,res,next) => {
    var sqlinsert = `INSERT INTO Orders(productid,amount,timestamp,membersid) VALUES(?,?,CURRENT_TIMESTAMP,'${req.body.id}');`;
    db.run(sqlinsert,[req.body.productid,req.body.amount]);
    db.get(`SELECT Members.m_name,Members.email,Members.phone,Products.p_name,Products.description,Products.image,Products.price,Orders.timestamp FROM Members,Products,Orders WHERE Members.id = '${req.body.id}' AND Products.id = '${req.body.productid}' ;`,(err,rows) => {
        if(!rows || err){
            res.send("displayed failed "+err);
            console.log(rows);
            console.log(err);
        }else{
            res.json({
                "status" : 0, 
                "message" : "success",
                "data" :{
                    "id" : req.body.id,
                    "buyerName" : rows.m_name,
                    "buyerEmail" : rows.email,
                    "buyerPhone" : rows.phone,
                    "timestamp" : rows.timestamp,
                    "products" : [
                        {
                            "name" : rows.p_name,
                            "description" : rows.description,
                            "picture" : rows.image,
                            "price" : rows.price,
                            "amount" : req.body.amount
                        }
                    ]
                }
            });
            console.log(" insert success !");
            console.log(rows);
        }
    });
});





module.exports = router;
