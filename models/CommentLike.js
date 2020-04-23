var mongoose = require('mongoose')

var likeSchema = new mongoose.Schema({
    comment:{
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


module.exports = mongoose.model('CommentLike',likeSchema)