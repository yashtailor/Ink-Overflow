var mongoose = require('mongoose')

var likeSchema = new mongoose.Schema({
    post:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Post'
    },
    authors:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'User'
        }
    ],
    number:{type:Number,default:0},
})


module.exports = mongoose.model('Like',likeSchema)