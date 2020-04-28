
var express = require('express'),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    passport = require('passport'),
    passportLocal = require('passport-local'),
    passportLocalMongoose = require('passport-local-mongoose'),
    request = require('request'),
    flash = require("connect-flash");
var User = require('../models/User'),
    Comment = require('../models/Comment'),
    InnerComment = require('../models/InnerComment'),
    Like = require('../models/Like'),
    Post = require('../models/Post'),
    CommentLike = require('../models/CommentLike'),
    Notif = require('../models/Notif');
var router = express.Router();

router.post('/user/clrNotifs', function (req, res) {
    var curUser = req.user;
    console.log('======REMOVED NOTIFS=======');
    Notif.find({ author: curUser }).remove().exec(function (err, removedNotif) {
        console.log(removedNotif);
        User.findById(req.user._id).exec(function(err,user){
            user.notifs.splice(0,user.notifs.length);
            user.save();
        })
        
    })
    res.redirect('/' + curUser._id + '/profile');
})






router.get('/:id/notifs', isLoggedIn, function (req, res) {
    var userid = req.params.id;
    User.findById(userid).populate('notifs').exec(function (err, user) {
        // console.log('err',err)
        // console.log('user',user)
        var notifArray = [];
        user.notifs.forEach(function (notif) {
            notifArray.push(notif);
        })
        notifArray.sort(function (a, b) {
            if (a._id < b._id)
                return 1
            if (a._id > b._id)
                return -1
            return 0
        })
        //console.log('ARAYYYYYYY',notifArray);
        res.render('notif', { notifs: notifArray });
    })
})

function isLoggedIn(req, res, next) {
    console.log(req.user)
    console.log(req.isAuthenticated())
    if (req.isAuthenticated()) {
        return next();
    } else {
        req.flash("error", "Please log in first");

        res.redirect('/login')
    }
}
module.exports = router;