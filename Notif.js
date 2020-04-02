var mongoose = require('mongoose')

var notifSchema = new mongoose.Schema({
    notifs:[
        {
            author:{
                type:mongoose.Schema.Types.ObjectId,
                ref:'User'
            },
            time:Date,
        }
    ]
})