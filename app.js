const express = require("express");
const mustacheExpress = require("mustache-express");
const bodyParser = require("body-parser");
const expressValidator = require("express-validator");
const path = require("path");
const session = require("express-session");
const jsonFile = require("jsonfile");

//Express App Initialization
const app = express();
//Public Directory Setup
app.use(express.static(path.join(__dirname, "public")));
//Mustache View Engine
app.engine("mustache", mustacheExpress());
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "mustache");
//Body Parser
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());
app.use(expressValidator());
//Initialize Express Session
app.use(session({
  secret: "lakjrh aworighna'g",
  resave: false,
  saveUninitialized: false
}));

let messages = [];
let btnClick;
let users;
jsonFile.readFile("database.json", function(err, obj) {
  users = obj.users;
  btnClick = obj.clicks;
});

app.get("/", function(req, res) {
  if (!req.session.username) {
    res.redirect("/login");
  } else {
    res.render("user", {
      username: req.session.username
    });
  }
});

app.get("/login", function(req, res) {
  res.render("login", {
    clicks: btnClick
  });
});

app.get("/signUp", function(req, res) {
  res.render("signUp");
});

app.post("/signUp", function(req, res) {
  req.session.username = req.body.username;
  req.session.password = req.body.password;

  let newUser = {
    username: req.session.username,
    password: req.session.password
  };
  users.push(newUser);
  jsonFile.writeFile("database.json", {
    clicks: btnClick,
    users: users
  });

  res.redirect("/");
});

app.post("/login", function(req, res) {
  if (req.body.clickBtn) {
    btnClick++;
    jsonFile.writeFile("database.json", {
      clicks: btnClick,
      users: users
    });
    res.redirect("/login");
  } else {
    let loggedUser;
    messages = [];

    users.forEach(function(user) {
      if (user.username === req.body.username) {
        loggedUser = user;
      }
    });

    if (loggedUser) {
      req.checkBody("username", "Please enter a valid username.").notEmpty().isLength({
        max: 30
      });
      req.checkBody("password", "Please enter a password.").notEmpty();
      req.checkBody("password", "Invalid password and username combination").equals(loggedUser.password);

      let errors = req.validationErrors();
      if (errors) {
        errors.forEach(function(error) {
          messages.push(error.msg);
        });
        res.render("login", {
          errors: messages
        });
      } else {
        req.session.username = req.body.username;
        req.session.passwrod = req.body.password;
        res.redirect("/");
      }
    } else {
      messages.push("Invalid password and username combo");
      res.render("login", {
        errors: messages
      });
    }
  }
});

app.post("/logOut", function(req, res) {
  req.session.destroy();
  res.redirect("/");
});

app.listen(3000, function() {
  console.log("server running on localhost:3000");
});
