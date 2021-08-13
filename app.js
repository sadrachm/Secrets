//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');

const app = express();

mongoose.connect("mongodb://localhost:27017/userDB",
 {useNewUrlParser:true, useUnifiedTopology: true }
);

const userSchema = {
  email: String,
  password: String
};

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
  User.findOne({email: user}, function(err, result) {
    if (!err) {
      if (result) {
        if (result.password === password) {
          res.render("secrets");
        } else {
          res.send("Nice try!");
        }
      }
    }
  });

});


app.route("/register")
.get(function (req, res) {
  res.render("register");
})
.post(function(req, res) {
  const newUser = new User({
    email: req.body.username,
    password: req.body.password
  })
  newUser.save(function(err) {
    if (!err) {
      res.render("secrets");
    } else {
      console.log(err);
    }
  });
});


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
