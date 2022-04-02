var express = require('express');
const middlewareAuth = require('../middleware/auth');
const multer = require('multer');
var router = express.Router();

const storage = multer.diskStorage({
    destination : function(req,file,cb){
       cb(null,'/Users/johnny/Documents/DatabaseSystem/FinalProject/images')
    },
    filename:(req,file,cb) => {
        cb(null,file.originalname)
    }
})

const upload = multer({storage :storage})

router.post('/',middlewareAuth.VerifyToken,upload.single('avatar'),(req,res) => {
    console.log(req.body);
    console.log(req.file);
    res.json({
        "status" : 0,
        "message" : "success",
        "data" :{
            "url" : req.file.path
        }
    })
})


module.exports = router;