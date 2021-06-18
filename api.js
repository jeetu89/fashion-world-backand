const express=require('express');
const cors=require('cors');
const bodyParser=require('body-parser');
const sha1=require('sha1');
const fs=require('fs');
const app=express();
//for uploading
const multer=require('multer');
let DIR="./attach";
let storage = multer.diskStorage({
destination: function (req, file, cb) {
cb(null,DIR)
},
filename: function (req, file, cb) {
cb(null, file.fieldname + '-' + Date.now()+ '.' +
file.originalname.split('.')[file.originalname.split('.').length -1])
}
})
let upload = multer({ storage: storage }).single('attach');
//end uploading
app.use(express.static('attach'));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
//connection with mongodb
const mongoose=require('mongoose');
mongoose.connect('mongodb://localhost/meanpro', {useNewUrlParser: true, useUnifiedTopology: true },()=>
{
    console.log("Connect to Mongodb")
});
//admin  model call
let adminModel=require('./db/adminlogin');
//Cat Model call
let catModel = require('./db/category');
//pro model call
let productModel=require('./db/product');
//api
app.post('/api/adminlogin',(req,res)=>
{
    let email=req.body.email;
    let password=sha1(req.body.pass);
    // console.log(req.body)
    
    // insert data
    // let ins=new adminModel({'email':email,'password':password});
    // ins.save(err=>
    //     {
    //         if(err){}
    //         else{
    //             res.json({'msg':'Data Stored'});
    //         }
    //     })
    adminModel.findOne({'email':email,'password':password},(err,data)=>
    {
        if(err){}
        else if(data==null)
        {
            res.json({'err':1,'msg':'Email and password is not correct'})
        }
        else{
            res.json({'err':0,'msg':'Login Sucessfully','uid':email})
        }
    })
})

//api changepass
app.post("/api/changepass",(req,res)=>
{
    let op=sha1(req.body.op);
    let np=sha1(req.body.np);
    let uid=req.body.uid;
    adminModel.findOne({'email':uid},(err,data)=>
    {
        if(err){}
        else 
        {
            if(op==data.password)
            {
                if(op==np)
                {
                    res.json({'err':1,'msg':'old password and new password is not same'})
                }
                else{
                    adminModel.updateOne({'email':uid},{$set:{'password':np}},(err)=>
                    {
                        if(err){}
                        else{
                            res.json({'err':0,'msg':'password change successfully'})
                        }
                    })
                }
            }
                    else{
                        res.json({'err':1,'msg':'old password is not correct'})

                    }
                }
            
        
    })
})

// api add category
app.post('/api/addcategory', (req, res) => {
  upload(req, res, err => {
    if (err) {
      res.json({
        err: 1,
        msg: 'Uploading Error'
      });
    } else {
      let cname = req.body.cname;
      let fname = req.file.filename;
      let ins = new catModel({
        cname: cname,
        image: fname
      });
      ins.save(err => {
        if (err) {
          console.log(`./attach/${fname}`);
          fs.unlink(`./attach/${fname}`, err => {
            if (err) {
              res.json({
                err: 1,
                msg: 'Went Wrong'
              });
            } else {
              res.json({
                err: 1,
                msg: 'Already Exists'
              });
            }
          });
        } else {
          res.json({
            err: 0,
            msg: 'Category saved'
          });
        }
      });
    }
  });
});
// api fetch or get category
app.get('/api/getcategory', (req, res) => {
  catModel.find({}, (err, data) => {
    if (err) {} else {
      res.json({
        err: 0,
        cdata: data
      });
    }
  });
});
//api fetchcategory by cid
app.get('/api/fetchcategory/:cid?',(req, res)=>
{
  let cid=req.param.cid;
  if(cid)
  {
    catModel.findOne({_id:cid},(err,data)=>
    {
      if(err){}
      else{
        res.json({'err':0,'cdata':data});
      }
    })
  }
})
//api delete cat
app.post('/api/delcategory', (req, res) => {
  let cid = req.body.cid;
  console.log(cid);
  catModel.deleteOne({
      _id: cid
    },
    err => {
      if (err) {} else {
        res.json({
          err: 0,
          msg: 'Category Daleted'
        });
      }
    }
  );
});
// api edit category
app.post("/api/editcategory", (req, res) => {
  let cname = req.body.cname;
  let cid = req.body.cid;
  catModel.updateOne({
    _id: cid
  }, {
    $set: {
      cname: cname
    }
  }, (err) => {
    if (err) {} else {
      res.json({
        'err': 0,
        'msg': 'Category updated'
      })
    }
  })
});
// api edit categorybyimage
app.post("/api/editcategorybyimage", (req, res) => {
  upload(req, res, err => {
    if (err) {
      res.json({
        'err': 1,
        'msg': 'Uploading Error'
      })
    } else {
      let cname = req.body.cname;
      let fname = req.file.filename;
      let cid = req.body.cid;
      catModel.updateOne({
        _id: cid
      }, {
        $set: {
          cname: cname,
          image: fname
        }
      }, (err) => {
        if (err) {
          console.log(`./attach/${fname}`)
          fs.unlink(`./attach/${fname}`, (err) => {
            if (err) {
              res.json({
                'err': 1,
                'msg': 'Went wrong'
              })
            } else {
              res.json({
                'err': 1,
                'msg': 'Already exists'
              })
            }
          })

        } else {
          res.json({
            'err': 0,
            'msg': 'Category Saved'
          })
        }
      })
    }
  })
})

// //api add product
app.post('/api/addproduct', (req, res) => {
  upload(req, res, err => {
    if (err) {
      res.json({
        err: 1,
        msg: 'Uploading Error'
      });
    } else {
      let cname = req.body.cname;
      let fname = req.file.filename;
      let pname = req.body.pname;
      let price = req.body.price;
      let features = req.body.features;
      // console.log(cname + fname + pname + price + features);

      let ins = new productModel({
        cname: cname,
        image: fname,
        pname: pname,
        price: price,
        features: features
      });
      ins.save(err => {
        if (err) {
          console.log(`./attach/${fname}`);
          fs.unlink(`./attach/${fname}`, err => {
            if (err) {
              res.json({
                err: 1,
                msg: 'Went Wrong'
              });
            } else {
              res.json({
                err: 1,
                msg: 'Already Exists'
              });
            }
          });
        } else {
          res.json({
            err: 0,
            msg: 'Product saved'
          });
        }
      });
    }
  });
});
// api get product(addproduct to product page)
app.get('/api/fetchproduct', (req, res) => {
  productModel.find({}, (err, data) => {
    if (err) {} else {
      res.json({
        err: 0,
        pdata: data
      });
    }
  });
});
//api fetch product by cname
app.get('/api/fetchproduct/:cname',(req, res)=>
{
  let cname=req.param.cname;
  if(cname)
  {
    productModel.findOne({cname:cname},(err,data)=>
    {
      if(err){}
      else{
        res.json({'err':0,'pdata':data});
      }
    })
  }
})
//api for search product
app.get("/api/searchproduct/:ser",(req,res)=>
{
   let ser=req.params.ser;
   productModel.find({$or:[{pname: {$regex: ser, $options: 'i'}},{cname: {$regex: ser, $options: 'i'}},{features: {$regex: ser, $options: 'i'}}
]},(err,data)=>
   {
       if(err){
        res.json({'err':1,'msg':err});
       }
       else 
       {
           console.log(data);
        res.json({'err':0,'sdata':data});
       }
   })

}) 
//api for fetchproduct by id
app.get("/api/fetchproductbyid/:pid",(req,res)=>
{
    let pid=req.params.pid;
    productModel.findOne({_id:pid},(err,data)=>
    {
        if(err){}
        else{
            res.json({'err':0,'pdata':data});
        }
    })
})
// api product delete
app.post('/api/delproduct', (req, res) => {
  let cid = req.body.cid;
  productModel.deleteOne({
      _id: cid
    },
    err => {
      if (err) {} else {
        res.json({
          err: 0,
          msg: 'Product Deleted'
        });
      }
    }
  );
});
app.listen(8899,()=>
{
    console.log("Project work on 8899")
})