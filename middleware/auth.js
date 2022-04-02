const jwt = require('jsonwebtoken')

const SECRET = 'HeyStranger';
function createToken(req,res,id,next){
    const token = jwt.sign({id : id},SECRET,{algorithm:'HS256'},{expiresIn:'1 day'});
    res.send({
        "status" : 0,
        "message" : "LoginSuccess",
        "data" :{
            "id" : id,
            "token" : token
        }
    });
}

function VerifyToken(req,res,next){
    const token = req.header('Authorization').replace('Bearer ','');
    const key = jwt.verify(token,SECRET);
    req.body.id = key.id;
    next();
}

const exportObj = {createToken,VerifyToken};
module.exports = exportObj;