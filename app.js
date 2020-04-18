var express = require('express'),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    User = require('./User'),
    Comment = require('./Comment'),
    InnerComment = require('./InnerComment'),
    Like = require('./Like'),
    Post = require('./Post'),
    CommentLike = require('./CommentLike')
Notif = require('./Notif'),
    passport = require('passport'),
    passportLocal = require('passport-local'),
    passportLocalMongoose = require('passport-local-mongoose'),
    request = require('request')

var app = express()
mongoose.connect('mongodb://localhost/ink_overflow')
// var MONGO_STRING = 'mongodb+srv://yash:yash@cluster0-jyzyx.mongodb.net/test?retryWrites=true&w=majority'
// mongoose.connect(MONGO_STRING, {
//     dbName: 'ink',
//     // useNewUrlParser: true,
//     // useFindAndModify: false,
//     // useCreateIndex: true,
//     // useUnifiedTopology: true,
// });


app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: true }))
app.use(require('express-session')({
    secret: 'ink overflow',
    resave: false,
    saveUninitialized: false,
}))
app.use(passport.initialize())
app.use(passport.session())
passport.use('local', new passportLocal(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())


app.get('/register', function (req, res) {
    res.render('register')
})

app.post('/register', function (req, res) {
    User.register(new User({ username: req.body.username }), req.body.password, function (err, user) {
        if (err) {
            console.log(err)
            res.render('/')
        } else {
            passport.authenticate('local')(req, res, function () {
                res.redirect('/login')
            })
        }
    })
})

app.get('/login', function (req, res) {
    res.render('login')
})

app.post('/login', passport.authenticate('local', {
    successRedirect: '/loginDirect',
    failureRedirect: '/login'
}), function (req, res) {

})

app.get('/loginDirect', function (req, res) {
    var id = req.user._id;
    res.redirect('/' + id + '/profile');
})

app.get('/logout', function (req, res) {
    req.logout()
    res.redirect('/')
})


// AUTH DONE


// app.get('/:id/profile',isLoggedIn,function(req,res){
//     //console.log(req.user)
//     var flag = true;
//     if(req.params.id == req.user._id){
//         flag = false;
//     }
//     User.findById(req.user._id).populate({path:'posts',populate:{path:'author'}}).exec(function(err,user){
//         if(user!= undefined)res.render('mainpage',{user:user,flag:flag})
//         else res.redirect('/login')
//     })

// })

app.get('/', function (req, res) {
    res.redirect('/feed')
})

app.post('/createPost', isLoggedIn, function (req, res) {
    text = req.body.text
    User.findById({ _id: req.user._id }, function (err, user) {
        Post.create({
            text: text,
            author: user,
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


app.get('/feed', isLoggedIn, function (req, res) {
    Post.find().populate('author').
        populate('likes').
        populate({ path: 'comments', populate: [{ path: 'author' }, { path: 'likes' }, { path: 'innerComments', populate: [{ path: 'Fauthor' }, { path: 'Tauthor' }, { path: 'likes', populate: [{ path: 'comment' }, { path: 'authors', populate: 'users' }] }, { path: 'comment' }] }, { path: 'post' }] }).
        sort({ _id: -1 }).exec(function (err, posts) {
            posts.forEach(function (post) {
                post.comments.forEach(function (comment) {
                    console.log(comment.innerComments.likes)
                })
            })
            res.render('feed', { posts: posts, user: req.user })
        })
})

app.get('/:id/follows/:num', function (req, res) {
    var userId = req.params.id;
    var num = req.params.num;
    User.findById(userId).populate('followers.users following.users').exec(function (err, Tuser) {
        console.log('Tuser', Tuser)
        res.render('followerAndFollowing', { curUser: req.user, user: Tuser, flag: num })
    })
})

app.get('/:id/profile', isLoggedIn, function (req, res) {
    var flag = true;
    var flag2 = false;
    console.log("=====================")
    console.log(req.params.id);
    console.log(req.user._id);
    if (req.params.id == req.user._id) {
        flag = false;
        flag2 = true;
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

app.post('/:id/addFollower', function (req, res) {
    var toBeFollowedUserId = req.params.id;
    var curUserId = req.user._id;
    if (toBeFollowedUserId == curUserId) res.redirect('/' + toBeFollowedUserId + '/profile')
    else {
        User.findById(curUserId, function (err, curUser) {
            User.findById(toBeFollowedUserId, function (err, toBeFolUser) {
                toBeFolUser.followers.users.push(curUser);
                toBeFolUser.followers.number += 1;
                toBeFolUser.save();
                curUser.following.users.push(toBeFolUser);
                curUser.following.number += 1;
                curUser.save();
            })
        })
        res.redirect('/' + toBeFollowedUserId + '/profile')
    }
})

app.post('/:id/increaseLike', function (req, res) {
    console.log('hey')
    var curUser = req.user;
    Post.findById(req.params.id)
        .populate('likes').populate('authors').populate('comments').
        exec(function (err, post) {
            var likesId = post.likes._id;
            Like.findById(likesId).populate('authors post').exec(function (err, like) {
                //console.log('LIKEEEEEEE',like)
                console.log('CUR  ', curUser._id)
                var flag = true;
                var curId = req.user._id;
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
                    res.redirect('/feed')
                }
            })
        })
})

app.post('/:id/commentLike', function (req, res) {
    console.log('hey')
    var curUser = req.user;
    Comment.findById(req.params.id)
        .populate('likes').populate('author').
        exec(function (err, post) {
            var likesId = post.likes._id;
            CommentLike.findById(likesId).populate('authors').exec(function (err, like) {
                console.log('LIKEEEEEEE', like)
                //console.log('CUR  ',curUser._id)
                var flag = true;
                var curId = req.user._id;
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
                    res.redirect('/feed')
                }
            })
        })
})

app.post('/:id/innerCommentLike', function (req, res) {
    console.log('hey')
    var curUser = req.user;
    InnerComment.findById(req.params.id)
        .populate('likes').populate('author').
        exec(function (err, post) {
            var likesId = post.likes._id;
            CommentLike.findById(likesId).populate('authors').exec(function (err, like) {
                console.log('LIKEEEEEEE', like)
                //console.log('CUR  ',curUser._id)
                var flag = true;
                var curId = req.user._id;
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
                    res.redirect('/feed')
                }
            })
        })
})

app.post('/:id/addComment', function (req, res) {
    var curUser = req.user;
    var postId = req.params.id;
    Post.findById(postId, function (err, post) {
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
                post.save()
                res.redirect('/feed')
            })
        })
    })
})



app.post('/:cid/:aid/addInnerComment', function (req, res) {
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
                console.log('inner', Innercomment)
                comment.innerComments.push(Innercomment);
                comment.save();
                res.redirect('/feed')
            })
        })
    })
})
app.post("/:id", function (req, res) {
    console.log("coming here");
    Post.findByIdAndRemove(req.params.id, function (err) {
        if (err) {
            res.redirect("/");
        } else {
            console.log('deleted');
            res.redirect("/");
        }
    });
});


app.get('/createBlog', function (req, res) {
    res.render('createBlog', { user: req.user })
})
app.get("/:id/edit", function (req, res) {
    Post.findById(req.params.id, function (err, found) {
        res.render('edit', { post: found });
    });
});

app.post("/edit/:id", function (req, res) {
    console.log(req.body.post.text);
    Post.findByIdAndUpdate(req.params.id, req.body.post, function (err, updated) {
        if (err) {
            res.redirect("/register");
        } else {
            console.log("done");
            res.redirect("/");
        }
    });
});
//============delete route===========
app.get('/notifs', function (req, res) {

})

app.listen(process.env.PORT || 3000, function () {
    console.log('server is running ....')
})

function isLoggedIn(req, res, next) {
    console.log(req.user)
    console.log(req.isAuthenticated())
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.redirect('/login')
    }
}