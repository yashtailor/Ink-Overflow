//show feed
//show profile
// search tag
// add follower
// add following
// remove follower

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

router.get('/', function (req, res) {
    res.redirect('/feed')
})

router.get('/feed', function (req, res) {
    var flag = false;
    var tagsList = {};
    Post.find().populate('author').
        populate('likes').
        populate({ path: 'comments', populate: [{ path: 'author' }, { path: 'likes' }, { path: 'innerComments', populate: [{ path: 'Fauthor' }, { path: 'Tauthor' }, { path: 'likes', populate: [{ path: 'comment' }, { path: 'authors', populate: 'users' }] }, { path: 'comment' }] }, { path: 'post' }] }).
        sort({ _id: -1 }).exec(function (err, posts) {
            posts.forEach(function (post) {
                post.tag.forEach(function (tag) {
                    tagsList[tag] = 0;
                })
            })
            posts.forEach(function (post) {
                post.tag.forEach(function (tag) {
                    tagsList[tag] += 1;
                })
            })
            var arrayOfTags = [];
            for (var tage in tagsList) {
                arrayOfTags.push([tage, tagsList[tage]]);
            }
            var sorted = arrayOfTags.sort(function (a, b) {
                return b[1] - a[1];
            });
            console.log(sorted)
            res.render('feed', { posts: posts, flag: flag, tagsList: sorted, currentSearch: undefined })
        })
})
router.get('/decideUser', function (req, res) {
    var flag = true;
    Post.find().populate('author').
        populate('likes').
        populate({ path: 'comments', populate: [{ path: 'author' }, { path: 'likes' }, { path: 'innerComments', populate: [{ path: 'Fauthor' }, { path: 'Tauthor' }, { path: 'likes', populate: [{ path: 'comment' }, { path: 'authors', populate: 'users' }] }, { path: 'comment' }] }, { path: 'post' }] }).
        sort({ _id: -1 }).exec(function (err, posts) {
            posts.forEach(function (post) {
                post.comments.forEach(function (comment) {
                    // console.log(comment.innerComments.likes)
                })
            })
            res.render('feed', { posts: posts, flag: flag })
        })
})


router.get('/:id/profile', isLoggedIn, function (req, res) {
    var flag = true;
    var flag2 = false;
    // console.log("=====================")
    console.log(req.params.id);
    console.log(req.user._id);
    console.log(typeof (req.params.id))
    console.log(typeof (req.user._id))

    if (String(req.params.id) === String(req.user._id)) {
        flag = false;
        flag2 = true;
        console.log("==========================");
    } else {
        User.findById(req.params.id).populate('followers.users').exec(function (err, Tuser) {
            for (var i = 0; i < Tuser.followers.users.length; i++) {
                if (String(Tuser.followers.users[i]._id) == String(req.user._id)) {
                    flag = false;
                    break;
                }
            }
        })
    }
    User.findById(req.params.id).populate({ path: 'posts', populate: [{ path: 'likes' }, { path: 'author' }] })
        .populate('followers.users').populate('following.users')
        .exec(function (err, user2) {
            console.log(flag)
            console.log('TOBELOOKEDUSER', user2.followers)
            res.render('mainpage', { user: user2, flag: flag, flag2: flag2, current: req.user._id })
        })
})

router.post('/search', function (req, res) {
    var flag = false;
    var tag = req.body.searchtext;
    console.log("================")
    console.log(tag);
    Post.find({ tag: tag }).populate('author').
        populate('likes').
        populate({ path: 'comments', populate: [{ path: 'author' }, { path: 'likes' }, { path: 'innerComments', populate: [{ path: 'Fauthor' }, { path: 'Tauthor' }, { path: 'likes', populate: [{ path: 'comment' }, { path: 'authors', populate: 'users' }] }, { path: 'comment' }] }, { path: 'post' }] }).
        sort({ _id: -1 }).exec(function (err, posts) {
            Post.find().exec(function (err, posti) {
                var tagsList = {};
                posti.forEach(function (post) {
                    post.tag.forEach(function (tag) {
                        tagsList[tag] = 0;
                    })
                })
                posti.forEach(function (post) {
                    post.tag.forEach(function (tag) {
                        tagsList[tag] += 1;
                    })
                })
                var arrayOfTags = [];
                for (var tage in tagsList) {
                    arrayOfTags.push([tage, tagsList[tage]]);
                }
                var sorted = arrayOfTags.sort(function (a, b) {
                    return b[1] - a[1];
                });
                console.log(sorted);
                var count = 0;
                res.render('feed', { posts: posts, flag: flag, tagsList: sorted, currentSearch: tag })
            })
        })

})

router.get('/search/:id', function (req, res) {
    var flag = false;
    var tag = req.params.id;
    console.log("================")
    console.log(tag);
    Post.find({ tag: tag }).populate('author').
        populate('likes').
        populate({ path: 'comments', populate: [{ path: 'author' }, { path: 'likes' }, { path: 'innerComments', populate: [{ path: 'Fauthor' }, { path: 'Tauthor' }, { path: 'likes', populate: [{ path: 'comment' }, { path: 'authors', populate: 'users' }] }, { path: 'comment' }] }, { path: 'post' }] }).
        sort({ _id: -1 }).exec(function (err, posts) {
            Post.find().exec(function (err, posti) {
                var tagsList = {};
                posti.forEach(function (post) {
                    post.tag.forEach(function (tag) {
                        tagsList[tag] = 0;
                    })
                })
                posti.forEach(function (post) {
                    post.tag.forEach(function (tag) {
                        tagsList[tag] += 1;
                    })
                })
                var arrayOfTags = [];
                for (var tage in tagsList) {
                    arrayOfTags.push([tage, tagsList[tage]]);
                }
                var sorted = arrayOfTags.sort(function (a, b) {
                    return b[1] - a[1];
                });
                console.log(sorted);
                var count = 0;
                res.render('feed', { posts: posts, flag: flag, tagsList: sorted, currentSearch: tag })
            })
        })

})


router.get('/:id/follows/:num', function (req, res) {
    var userId = req.params.id;
    var num = req.params.num;
    if (String(req.user._id) == String(userId)) {
        var isCurrentUser = true;
    }
    User.findById(userId).populate('followers.users following.users').exec(function (err, Tuser) {
        console.log('Tuser', Tuser)
        res.render('followerAndFollowing', { user: Tuser, flag: num, isCurrentUser: isCurrentUser })
    })
})


router.post('/:id/addFollower', function (req, res) {
    var toBeFollowedUserId = req.params.id;
    var curUserId = req.user._id;
    var datetime = new Date();
    if (toBeFollowedUserId == curUserId) res.redirect('/' + toBeFollowedUserId + '/profile')
    else {
        User.findById(curUserId, function (err, curUser) {
            User.findById(toBeFollowedUserId, function (err, toBeFolUser) {
                toBeFolUser.followers.users.push(curUser);
                toBeFolUser.followers.number += 1;
                //toBeFolUser.save();
                curUser.following.users.push(toBeFolUser);
                curUser.following.number += 1;
                //curUser.save();
                Notif.create({
                    text: 'you started following ' + toBeFolUser.username,
                    author: curUser,
                    time: datetime
                }, function (err, notif1) {
                    if (err) console.log('eer', err);
                    curUser.notifs.push(notif1._id);
                    curUser.save();
                    //console.log('notif1',notif1);
                })
                Notif.create({
                    text: curUser.username + ' started following you',
                    author: toBeFolUser,
                    time: datetime
                }, function (err, notif2) {
                    if (err) console.log('err', err);
                    toBeFolUser.notifs.push(notif2._id);
                    toBeFolUser.save();
                    //console.log(notif2);
                    res.redirect('/' + toBeFollowedUserId + '/profile')
                })

            })
        })
    }
})

router.post('/unfollow/:id', function (req, res) {
    User.findById(req.user._id).populate('following.users').exec(function (err, user) {
        var len = user.following.users.length;
        console.log('user', user)
        console.log('len', len);
        for (var i = 0; i < len; i++) {
            if (String(user.following.users[i]._id) == String(req.params.id)) {
                user.following.users.splice(i, 1);
                user.save();
                res.redirect('/' + req.user._id + '/follows/0')
                break;
            }
        }
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