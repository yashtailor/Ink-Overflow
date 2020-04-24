//delete post
//edit post
//create post
//like
// like comment
//like inner comment
//addcomment
// add inner comment

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

router.post("/del/:aid/:id", function (req, res) {
    aid = req.params.aid;
    console.log("===================" + aid);
    console.log("coming here");
    Post.findByIdAndRemove(req.params.id, function (err) {
        if (err) {
            res.redirect("/");
        } else {
            console.log('deleted');
            res.redirect('/' + req.params.aid + '/profile/');
        }
    });
});

router.get("/:id/edit", function (req, res) {
    Post.findById(req.params.id, function (err, found) {
        res.render('edit', { post: found });
    });
});

router.post("/edit/:id", function (req, res) {
    console.log(req.body.post.text);
    Post.findByIdAndUpdate(req.params.id, req.body.post, function (err, updated) {
        if (err) {
            res.redirect("/register");
        } else {
            //    alert('changes updated sucessfully!');
            res.redirect("/");
        }
    });
});

router.get('/createBlog', isLoggedIn, function (req, res) {
    res.render('createBlog', { user: req.user })
})

router.post('/createPost', isLoggedIn, function (req, res) {
    text = req.body.text
    tageg = req.body.myInputs
    console.log(tageg);
    for (var i = 0; i < tageg.length; i++) {
        tageg[i] = tageg[i].toLowerCase();
    }

    User.findById({ _id: req.user._id }, function (err, user) {
        Post.create({
            text: text,
            author: user,
            tag: tageg,
        }, function (err, post) {
            if (err) {
                console.log(err)
                res.render('mainpage')
            } else {
                Like.create({
                    post: post
                }, function (err, like) {
                    post.likes = like;
                    post.save()
                    User.findById(req.user._id, function (err, user) {
                        if (err) console.log(err)
                        user.posts.push(post);
                        user.save()
                        res.redirect('/' + req.user._id + '/profile')
                    })
                })
            }
        })
    })

})

router.get('/:id/showfull', function (req, res) {
    Post.findById(req.params.id).exec(function (err, foundblog) {
        if (err) {
            console.log(err);
        } else {
            res.render("showfull", { post: foundblog });
        }
    });
})

router.post('/:id/increaseLike', isLoggedIn, function (req, res) {
    var curUser = req.user;
    if (curUser.reputation >= 11) {
        Post.findById(req.params.id)
            .populate('likes').populate('author').populate('comments').
            exec(function (err, post) {
                var likesId = post.likes._id;
                Like.findById(likesId).populate('authors post').exec(function (err, like) {
                    //console.log('LIKEEEEEEE',like)
                    //console.log('CUR  ', curUser._id)
                    var flag = true;
                    var curId = req.user._id;
                    User.findById(post.author._id, function (err, puser) {
                        var postUser = puser;
                        postUser.reputation += 1;
                        for (var i = 0; i < like.authors.length; i++) {
                            var author = like.authors[i];
                            console.log('AUTHOR  ', author._id)
                            //console.log(String(author._id) == String(curId))
                            if (String(author._id) == String(curId)) {
                                flag = false;
                                like.number -= 1;
                                like.authors.splice(i, 1);
                                like.save(function (err, like) {
                                    res.redirect('/feed')
                                })
                                break;
                            }
                        }
                        if (flag) {
                            like.number += 1;
                            like.authors.push(curUser)
                            like.save()
                            Notif.create({
                                text: 'you liked the post of ' + postUser.username,
                                author: curUser,
                                time: new Date(),
                            }, function (err, notif1) {
                                if (err) console.log('eer', err);
                                curUser.notifs.push(notif1._id);
                                curUser.save();
                                //console.log('notif1',notif1);
                            })
                            if (String(puser._id) != String(curUser._id)) {
                                Notif.create({
                                    text: curUser.username + ' has liked your comment -' + post.text,
                                    author: postUser,
                                    time: new Date(),
                                }, function (err, notif2) {
                                    if (err) console.log('err', err);
                                    postUser.notifs.push(notif2._id);
                                    postUser.save();
                                    //console.log(notif2);
                                    res.redirect('/feed')
                                })
                            } else res.redirect('/feed')
                        }
                    })
                })
            })
    } else {
        res.redirect('/decideUser');
    }
})

router.post('/:id/commentLike', isLoggedIn, function (req, res) {
    var currentUser = req.user;
    var curUser = req.user;
    if (curUser.reputation >= 11) {
        Comment.findById(req.params.id)
            .populate('likes').populate('author').
            exec(function (err, post) {
                var likesId = post.likes._id;
                CommentLike.findById(likesId).populate('authors').exec(function (err, like) {
                    var flag = true;
                    // var curId = req.user._id;
                    User.findById(post.author._id, function (err, puser) {
                        var postUser = puser;
                        postUser.reputation += 1;
                        for (var i = 0; i < like.authors.length; i++) {
                            var author = like.authors[i];
                            console.log('AUTHOR  ', author._id)
                            if (String(author._id) == String(currentUser.id)) {
                                flag = false;
                                like.number -= 1;
                                like.authors.splice(i, 1);
                                like.save(function (err, like) {
                                    res.redirect('/feed')
                                })
                                break;
                            }
                        }
                        if (flag) {
                            like.number += 1;
                            like.authors.push(currentUser)
                            like.save()
                            Notif.create({
                                text: 'you liked the comment of ' + postUser.username + ' -' + post.text,
                                author: curUser,
                                time: new Date(),
                            }, function (err, notif1) {
                                if (err) console.log('eer', err);
                                curUser.notifs.push(notif1._id);
                                curUser.save();
                                //console.log('notif1',notif1);
                            })
                            if (String(puser._id) != String(curUser._id)) {
                                Notif.create({
                                    text: curUser.username + ' has liked your comment -' + post.text,
                                    author: postUser,
                                    time: new Date(),
                                }, function (err, notif2) {
                                    if (err) console.log('err', err);
                                    postUser.notifs.push(notif2._id);
                                    postUser.save();
                                    //console.log(notif2);
                                    res.redirect('/feed')
                                })
                            } else res.redirect('/feed')
                        }
                    })
                })
            })
    } else {
        res.redirect('/decideUser');
    }
})

router.post('/:id/innerCommentLike', isLoggedIn, function (req, res) {
    var curUser = req.user;
    var currentUser = req.user;
    if (curUser.reputation >= 11) {
        InnerComment.findById(req.params.id)
            .populate('likes').populate('author').
            exec(function (err, post) {
                var likesId = post.likes._id;
                CommentLike.findById(likesId).populate('authors').exec(function (err, like) {
                    console.log('LIKEEEEEEE', like)
                    //console.log('CUR  ',curUser._id)
                    var flag = true;
                    var curId = req.user._id;
                    User.findById(post.Fauthor._id, function (err, puser) {
                        var postUser = puser;
                        postUser.reputation += 1;
                        for (var i = 0; i < like.authors.length; i++) {
                            var author = like.authors[i];
                            console.log('AUTHOR  ', author._id)
                            //console.log(String(author._id) == String(curId))
                            if (String(author._id) == String(curId)) {
                                flag = false;
                                like.number -= 1;
                                like.authors.splice(i, 1);
                                like.save(function (err, like) {
                                    res.redirect('/feed')
                                })
                                break;
                            }
                        }
                        if (flag) {
                            like.number += 1;
                            like.authors.push(curUser)
                            like.save()
                            Notif.create({
                                text: 'you liked the comment of ' + postUser.username + ' -' + post.text,
                                author: curUser,
                                time: new Date(),
                            }, function (err, notif1) {
                                if (err) console.log('eer', err);
                                curUser.notifs.push(notif1._id);
                                curUser.save();
                                //console.log('notif1',notif1);
                            })
                            if (String(puser._id) != String(curUser._id)) {
                                Notif.create({
                                    text: curUser.username + ' has liked your comment -' + post.text,
                                    author: postUser,
                                    time: new Date(),
                                }, function (err, notif2) {
                                    if (err) console.log('err', err);
                                    postUser.notifs.push(notif2._id);
                                    postUser.save();
                                    //console.log(notif2);
                                    res.redirect('/feed')
                                })
                            } else res.redirect('/feed')
                        }
                    })
                })
            })
    } else {
        res.redirect('/decideUser');
    }
})

router.post('/:id/addComment', isLoggedIn, function (req, res) {
    var curUser = req.user;
    var postId = req.params.id;
    Post.findById(postId).populate({ path: 'author', populate: { path: 'notifs' } }).exec(function (err, post) {
        CommentLike.create({
            post: post
        }, function (err, like) {
            Comment.create({
                text: req.body.comment_text,
                author: curUser,
                post: post,
                likes: like,
            }, function (err, comment) {
                post.comments.push(comment);
                postuser = post.author;
                console.log('POSTUSER', postuser);
                Notif.create({
                    text: 'you commented on the post of ' + postuser.username + ' -' + comment.text,
                    author: curUser,
                    time: new Date(),
                }, function (err, notif1) {
                    if (err) console.log('eer', err);
                    curUser.notifs.push(notif1._id);
                    curUser.save();
                    //console.log('notif1',notif1);
                })
                if (String(postuser._id) != String(curUser._id)) {
                    Notif.create({
                        text: curUser.username + ' has commented on your post -' + comment.text,
                        author: postuser,
                        time: new Date(),
                    }, function (err, notif2) {
                        if (err) console.log('err', err);
                        postuser.notifs.push(notif2._id);
                        postuser.save();
                        //console.log(notif2);
                        res.redirect('/feed')
                        post.save();
                    })
                } else {
                    res.redirect('/feed');
                    post.save();
                }
            })
        })
    })
})



router.post('/:cid/:aid/addInnerComment', isLoggedIn, function (req, res) {
    var curUserReq;
    var tauthor;
    User.findById(req.user._id, function (err, curUser) {
        curUserReq = curUser;
    })
    User.findById(req.params.aid, function (err, aUser) {
        tauthor = aUser;
    })
    var commentId = req.params.cid;
    Comment.findById(commentId).populate('author').exec(function (err, comment) {
        CommentLike.create({
            comment: comment
        }, function (err, like) {
            InnerComment.create({
                text: req.body.comment_text,
                Fauthor: curUserReq,
                Tauthor: tauthor,
                comment: comment,
                likes: like,
            }, function (err, Innercomment) {
                //console.log('inner', Innercomment)
                comment.innerComments.push(Innercomment);
                Notif.create({
                    text: 'you replied to the comment of ' + tauthor.username + ' -' + Innercomment.text,
                    author: curUserReq,
                    time: new Date(),
                }, function (err, notif1) {
                    if (err) console.log('eer', err);
                    curUserReq.notifs.push(notif1._id);
                    curUserReq.save();
                    //console.log('notif1',notif1);
                })
                if (String(tauthor._id) != String(curUserReq._id)) {
                    Notif.create({
                        text: curUserReq.username + ' has replied to your comment -' + Innercomment.text,
                        author: tauthor,
                        time: new Date(),
                    }, function (err, notif2) {
                        if (err) console.log('err', err);
                        tauthor.notifs.push(notif2._id);
                        tauthor.save();
                        //console.log(notif2);
                        res.redirect('/feed')
                        comment.save();
                    })
                } else {
                    comment.save();
                    res.redirect('/feed');
                }
            })
        })
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