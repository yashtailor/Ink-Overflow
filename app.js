var express = require('express'),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    passport = require('passport'),
    passportLocal = require('passport-local'),
    passportLocalMongoose = require('passport-local-mongoose'),
    request = require('request'),
    flash = require("connect-flash");
var User = require('./models/User'),
    Comment = require('./models/Comment'),
    InnerComment = require('./models/InnerComment'),
    Like = require('./models/Like'),
    Post = require('./models/Post'),
    CommentLike = require('./models/CommentLike'),
    Notif = require('./models/Notif');
var indexRoutes = require("./routes/index"),
    postRoutes = require("./routes/post"),
    feedandprofileRoutes = require("./routes/feedandprofile"),
    notifyRoutes = require("./routes/notify");

var app = express()
mongoose.connect('mongodb://localhost/ink_overflow')
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
app.use(flash());
app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});
app.use(feedandprofileRoutes);
app.use(indexRoutes);
app.use(postRoutes);
app.use(notifyRoutes);


app.listen(process.env.PORT || 3000, function () {
    console.log('server is running ....')
})

