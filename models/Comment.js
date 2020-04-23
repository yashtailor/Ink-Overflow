var mongoose = require('mongoose')

var commentSchema = new mongoose.Schema({
    text: String,
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    likes: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CommentLike'
    },
    innerComments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'InnerComment'
        }
    ],
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    }
})

module.exports = mongoose.model('Comment', commentSchema)