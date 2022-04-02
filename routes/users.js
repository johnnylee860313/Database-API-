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

router.post('/signIn',(req,res,next) => {
  var sqlselect = `SELECT id,m_name,email,password FROM Members WHERE email = '${req.body.email}';`;
  db.get(sqlselect,(err,row) => {
    if(!row){
      if(err){
        console.log(err)
      }
      res.send("customer not found");
    }else{
      if(req.body.password != row.password){
        res.send("password incorrect");
      }else{
        //token
        middlewareAuth.createToken(req,res,row.id);
      }
    }
  });
});





/* GET users listing. */
router.get('/me', middlewareAuth.VerifyToken,function(req, res, next) {
  db.get(`SELECT * FROM Members WHERE id = '${req.body.id}';`, (err, rows) => {
    if (err) {
      res.json({"error":err.message});
      return;
    }
    res.json({
      "status" : 0,
      "message" : "success",
      "data" : {
        "id" : rows.id,
        "name" : rows.m_name,
        "type" : rows.type,
        "email" : rows.email,
        "phone" : rows.phone
      }
    });
  });
});

router.post('/',(req,res,next) =>{
  //validate
  const result = validate(req.body);
  const {error} = validate(req.body); //Object deconstruscting , equals to result.error
  if(error){
      return res.status(400).send(result.error.details[0].message);
  }
  //create data
  var reqBody = req.body;
  var sqlInsert = 'INSERT INTO Members(m_name,email,password,type,phone) VALUES (?,?,?,?,?);';
  db.run(sqlInsert, [reqBody.name,reqBody.email,reqBody.password,reqBody.type,reqBody.phone]);
  db.get(`SELECT id,m_name,type,email,phone FROM Members WHERE email = '${reqBody.email}'`,(err,row) =>{
    if(!row){
      res.send("Update fail,Customer not found");
      return;
    }else{
      res.json({
        "status" : 0,
        "message" : "success",
        "data" : {
          "id" : row.id,
          "name" : row.m_name,
          "type" : row.type,
          "email" : row.email,
          "phone" : row.phone,
        }
      });
      console.log('update success');
    }
  });
});

router.patch('/:id',middlewareAuth.VerifyToken,(req,res) => {
  //update
  var sqlinsert = "UPDATE Members set m_name=?,phone=? WHERE id = ?;";
  db.run(sqlinsert,[req.body.name,req.body.phone,req.params.id]);
  db.get(`SELECT id,m_name,type,email,phone FROM Members WHERE id = '${req.params.id}'`,(err,row) =>{
    if(!row){
      res.send("Update fail,Customer not found");
      return;
    }else{
      res.json({
        "status" : 0,
        "message" : "success",
        "data" : {
          "id" : req.params.id,
          "name" : row.m_name,
          "type" : row.type,
          "email" : row.email,
          "phone" : row.phone,
        }
      });
      console.log('update success');
    }
  });
});




function validate(body){
  const schema = Joi.object({
      name : Joi.string().required(),
      password : Joi.string().required(),
      type : Joi.string().required(),
      email : Joi.string().required(),
      phone : Joi.string().min(10).required()
  });

 return schema.validate(body);
};



module.exports = router;
//db.close();
