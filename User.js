var mongoose = require('mongoose')
var passportLocalMongoose = require('passport-local-mongoose')

var UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    email: String,
    desc: String,
    posts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post'
        }
    ],
    notifs: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Notif'
        }
    ],
    followers: {
        number: { type: Number, default: 0 },
        users: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        ]
    },
    following: {
        number: { type: Number, default: 0 },
        users: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        ]
    },
    postsLiked: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post'
        }
    ],
    // stories:[
    //     {
    //         story:{
    //             type:Schema.Types.ObjectId,
    //             ref:'Story'
    //         }
    //     }
    // ],
    // ownStory:[
    //     {
    //         story:{
    //             type:Schema.Types.ObjectId,
    //             ref:'Story'
    //         }
    //     }
    // ]
})

UserSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model('User', UserSchema)


