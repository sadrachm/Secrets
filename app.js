//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;

//const md5 = require('md5');
//const encrypt = require("mongoose-encryption");

const app = express();



mongoose.connect("mongodb://localhost:27017/userDB",
 {useNewUrlParser:true, useUnifiedTopology: true }
);

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

const User = new mongoose.model("User", userSchema);

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

app.get("/", function (req, res) {
  res.render("home");
});
app.route("/login")
.get(function (req, res) {
  res.render("login");
})
.post(function(req, res) {
  const user = req.body.username;
  const password = req.body.password;
  User.findOne({email: user}, function(err, found) {
    if (!err) {
      if (found) {
        bcrypt.compare(password, found, function(err, result) {
          res.render("secrets");
        });
        }
      }
    }
  );

});


app.route("/register")
.get(function (req, res) {
  res.render("register");
})
.post(function(req, res) {
  bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
    const newUser = new User({
      email: req.body.username,
      password: hash
    })
    newUser.save(function(err) {
      if (!err) {
        res.render("secrets");
      } else {
        console.log(err);
      }
    });
  });
});


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
