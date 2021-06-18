let mongoose=require('mongoose');
var proSchema = new mongoose.Schema({
    cname:{type:String,required:true},
    pname:{type:String,unique:true},
    price:{type:Number,required:true},
    features:{type:String,required:true},
    image: {type:String,required:true},
    created_at:{type:Date,default:Date.now()}
  });
  //model
module.exports= mongoose.model('product', proSchema);