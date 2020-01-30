var express = require("express"),
    mongoose = require("mongoose"),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    passport = require("passport"),
    cookieParser = require("cookie-parser"),
    localStrategy = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose"),
    session = require("express-session"),
    User = require("./models/user"),
    async = require("async"),
    nodemailer = require("nodemailer"),
    crypto = require("crypto"),
    methodOverride = require("method-override");
 

 
  

 
    
 
  
 
 

// configure dotenv


var app = express();
mongoose.connect("mongodb://localhost:27017/EditingFactory", { useNewUrlParser: true });
mongoose.set('useCreateIndex', true);
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public"));
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

app.use(require("express-session")({
    secret: "You are amazing!",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get("/", function (req, res) {
    res.send("hi");
});

app.get("/register", function (req, res) {
    res.render("register");
});

app.post("/register", function (req, res) {
    var newUser = new User(
        { name: req.body.name, 
            username: req.body.username
        });
   
    User.register(newUser, req.body.password, function (err, user) {
        if (err) {
            console.log(err);
            return res.render("/register");
        }
        passport.authenticate("local")(req, res, function () {
            res.redirect("/");
        });
    });
});

app.get("/login", function (req, res) {
    res.render("login");
});


app.post("/login", passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login"
}), function (req, res) {
});

//logout

app.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/");
});
// forgot password
app.get('/forgot', function (req, res) {
    res.render('forgot');
});

app.post('/forgot', function (req, res, next) {
    async.waterfall([
        function (done) {
            crypto.randomBytes(20, function (err, buf) {
                var token = buf.toString('hex');                //token created
                done(err, token);
                console.log('token created');
            });
        },
        function (token, done) {
            User.findOne({ username: req.body.username }, function (err, user) {
                if (!user) {
               
                    return res.redirect('/forgot');
                }

                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

                user.save(function (err) {
                    done(err, token, user);
                });
            });
        },
        function (token, user, done) {
            var smtpTransport = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: 'noteswebsiteigdtu@gmail.com',
                    pass: 'igdtuw0000'
                }
            });
            var mailOptions = {           //Mail body
                to: user.username,
                from: 'noteswebsiteigdtu@gmail.com',
                subject: 'Password Reset',
                text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                    'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                    'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                    'If you did not request this, please ignore this email and your password will remain unchanged.\n'
            };
            console.log('mail formed');
            smtpTransport.sendMail(mailOptions, function (err) {               //To send mail
                console.log('mail sent');
                done(err, 'done');
                console.log('mail going 1');
            });
        }
    ], function (err) {
        if (err) return next(err);
        res.redirect('/forgot');
    });
});

// Reset password form
app.get('/reset/:token', function (req, res) {
    console.log("hello");
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function (err, user) {
        if (!user) {
           
            return res.redirect('/forgot');
        }
        res.render('reset', { token: req.params.token });
    });
});

app.post('/reset/:token', function (req, res) {
    async.waterfall([
        function (done) {
            User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function (err, user) {
                if (!user) {
                   
                    return res.redirect('back');
                }
                if (req.body.password === req.body.confirm) {
                    user.setPassword(req.body.password, function (err) {
                        user.resetPasswordToken = undefined;
                        user.resetPasswordExpires = undefined;

                        user.save(function (err) {
                            req.logIn(user, function (err) {
                                done(err, user);
                            });
                        });
                    })
                } else {
                    
                    return res.redirect('back');
                }
            });
        },
        function (user, done) {
            var smtpTransport = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: 'noteswebsiteigdtu@gmail.com',
                    pass: 'igdtuw0000'
                }
            });
            var mailOptions = {
                to: user.username,
                from: 'noteswebsiteigdtu@gmail.com',
                subject: 'Your password has been changed',
                text: 'Hello,\n\n' +
                    'This is a confirmation that the password for your notes website account has just been changed.\n'
            };
            smtpTransport.sendMail(mailOptions, function (err) {
                
                done(err);
            });
        }
    ], function (err) {
        res.redirect('/');
    });
});

app.listen(3000, process.env.IP, function () {
    console.log("The Server has started!");
});