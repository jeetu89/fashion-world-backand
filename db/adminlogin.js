let mongoose=require('mongoose')
var adminSchema = new mongoose.Schema({
    email:{type:String,unique:true},
    password: {type:String,required:true},
    
    created_at:{type:Date,default:Date.now()}
});
    //model
  module.exports = mongoose.model('admin', adminSchema);