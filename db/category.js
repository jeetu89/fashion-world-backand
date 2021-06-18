let mongoose = require('mongoose');
//create schema (structure)
let catSchema = new mongoose.Schema({
  cname: {type: String,unique: true },
  image: {type: String,required: true},
  created_at: {type: Date,default: Date.now()}
});

//model
module.exports = mongoose.model('category', catSchema);
//end