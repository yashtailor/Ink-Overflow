var mongoose = require('mongoose')

var notifSchema = new mongoose.Schema({
    author:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    time:Date,
    text:String,
})

module.exports = mongoose.model('Notif',notifSchema);