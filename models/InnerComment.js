var mongoose = require('mongoose')

var innerCommentSchema = new mongoose.Schema({
    text:String,
    Fauthor:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    Tauthor:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    likes:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'CommentLike'
    },
    comment:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Comment'
    }
})

module.exports = mongoose.model('InnerComment',innerCommentSchema)