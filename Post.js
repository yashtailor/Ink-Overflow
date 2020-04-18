var mongoose = require('mongoose')

var postSchema = new mongoose.Schema({
    text: String,
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    likes: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Like'
    },
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Comment'
        }
    ],
})

module.exports = mongoose.model('Post', postSchema)