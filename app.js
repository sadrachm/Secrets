//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
// const bcrypt = require('bcrypt');
// const saltRounds = 10;
//const md5 = require('md5');
//const encrypt = require("mongoose-encryption");

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(session({
  secret:"Our little Secret.",
  resave: false,
  saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());


mongoose.connect("mongodb://localhost:27017/userDB",
 {useNewUrlParser:true, useUnifiedTopology: true }
);
mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function (req, res) {
  res.render("home");
});
app.route("/login")
.get(function (req, res) {
  res.render("login");
})
.post(function(req, res) {
const user = new User({
  username: req.body.username,
  password: req.body.password
});
req.login(user, function(err) {
  if (err) {
    console.log(err);
  } else {
    passport.authenticate("local")(req, res, function() {
      res.redirect("/secrets");
    });
  }
})
  // const user = req.body.username;
  // const password = req.body.password;
  // User.findOne({email: user}, function(err, found) {
  //   if (!err) {
  //     if (found) {
  //       bcrypt.compare(password, found, function(err, result) {
  //         res.render("secrets");
  //       });
  //       }
  //     }
  //   }
  // );

});

app.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/");
})

app.get("/secrets", function(req, res) {
  if (req.isAuthenticated()) {
    res.render("secrets")
  } else {
    res.redirect("/login");
  }
});

app.route("/register")
.get(function (req, res) {
  res.render("register");
})
.post(function(req, res) {
  User.register({username: req.body.username}, req.body.password, function(err, user) {
    if (err) {
      console.log(err);
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, function() {
        res.redirect("/secrets");
      });
    }
  });
  // bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
  //   const newUser = new User({
  //     email: req.body.username,
  //     password: hash
  //   })
  //   newUser.save(function(err) {
  //     if (!err) {
  //       res.render("secrets");
  //     } else {
  //       console.log(err);
  //     }
  //   });
  // });
});


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
