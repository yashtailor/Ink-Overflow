//login
//register
//logout
// about us


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

router.get('/aboutUs', function (req, res) {
    res.render('about_us');
})

router.get('/register', function (req, res) {
    res.render('register')
})

router.post('/register', function (req, res) {
    if (req.body.username == "yash" || req.body.username == "palak" || req.body.username == "tanaya" || req.body.username == "shivamdhar") {
        User.register(new User({ username: req.body.username, reputation: 11 }), req.body.password, function (err, user) {
            if (err) {
                console.log(err)
                res.redirect('/')
            } else {
                passport.authenticate('local')(req, res, function () {
                    res.redirect('/')
                })
            }
        })
    } else {
        User.register(new User({ username: req.body.username, desc: req.body.desc, email: req.body.email }), req.body.password, function (err, user) {
            if (err) {
                console.log(err)
                res.redirect('/')
            } else {
                passport.authenticate('local')(req, res, function () {
                    res.redirect('/')
                })
            }
        })
    }

})

router.get('/login', function (req, res) {
    res.render('login')
})

router.post('/login', passport.authenticate('local', {
    successRedirect: '/loginDirect',
    failureRedirect: '/login'
}), function (req, res) {

})

router.get('/loginDirect', function (req, res) {
    var id = req.user._id;
    res.redirect('/' + id + '/profile');
})

router.get('/logout', function (req, res) {
    req.logout()
    console.log("coming here");
    req.flash("success", "Logged you out");
    res.redirect('/feed')
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