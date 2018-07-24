var express = require("express"),
  app = express();

var mongoose = require("mongoose");
var cors = require("cors");

app.use(cors());
var bodyParser = require("body-parser");

mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost/jobportalusers");

require("./models/schema.js");
const User = mongoose.model("users");
const postjob = mongoose.model("jobs");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var db = mongoose.connection;
db.on("error", function () {
  console.log("db connection error");
});
db.on("open", function () {
  console.log("connection established");
});

app.get("/save/:id/:user", (req, res) => {
  console.log(req.params.id);
  User.findOne({ username: req.params.user }).then(
    user => {
      if (user.savedjobs.includes(req.params.id)) {

        var index = user.savedjobs.indexOf(req.params.id);
        if (index > -1) {
          user.savedjobs.splice(index, 1);
        }
      }
      else {
        user.savedjobs.push(req.params.id);
      }
      user.save().then((user => {
        res.send(user);
      }))
    }
  )
});   

app.get("/apply/:id/:user", (req, res) => {

  User.findOne({ username: req.params.user }).then(
    user => {
      if (user.appliedjobs.includes(req.params.id)) {

        var index = user.appliedjobs.indexOf(req.params.id);
        if (index > -1) {
          user.appliedjobs.splice(index, 1);
        }
      }
      else {
        user.appliedjobs.push(req.params.id);
      }
      user.save().then((user => {
        res.send(user);
      }))
    }
  )

});


app.get("/savedjobs/:user", (req, res) => {
  User.findOne({
    username: req.params.user
  }).then((user) => {
    postjob.find({
      _id: { $in: user.savedjobs }
    }).then(users => {
      res.send(users);
    })
  });
});

app.get("/appliedjobs/:user", (req, res) => {
  User.findOne({
    username: req.params.user
  }).then((user) => {
    postjob.find({
      _id: { $in: user.appliedjobs }
    }).then(users => {
      res.send(users);
    })
  });
});

app.post("/login", function (req, res) {
  User.findOne({
    username: req.body.loginform.username
  }).then(user => {
    if (
      user.username == req.body.loginform.username &&
      user.password == req.body.loginform.password
    ) {
      res.send(user);
    } else {
      res.send(false);
    }
  });
});

app.post("/register", function (req, res) {
  var newUser = {
    username: req.body.registerform.username,
    password: req.body.registerform.password,
    email: req.body.registerform.email,
    location: req.body.registerform.location,
    phone: req.body.registerform.phone,
    usertype: req.body.registerform.usertype
  };
  new User(newUser).save().then(function (user) {
    res.send(true);
  });
});

app.get("/jobs", function (req, res) {
  postjob.find({}).then(jobs => {
    //console.log(jobs);
    res.send(jobs);
  }).catch(() => {
    res.send("not jobs");
  })

});

app.get("/users/:username", function (req, res) {
  User.findOne({
    username: req.params.username
  }).then(user => {
    res.send(user);
  }).catch(() => {
    res.send("user not found");
  })

});

app.post("/addjob", function (req, res) {
  var newjob = {
    title: req.body.postjob.title,
    description: req.body.postjob.description,
    keyword: req.body.postjob.keyword,
    location: req.body.postjob.location
  }
  new postjob(newjob).save().then(function (job) {
    res.send(true);
  }, function (error) {
    console.log("data not saved");
  });
});

app.get('/search/:title/:keyword/:location',function(req,res){
  req.params.title=="undefined"?req.params.title="":req.params.title=req.params.title;
  req.params.keyword=="undefined"?req.params.keyword="":req.params.keyword=req.params.keyword;
  req.params.location=="undefined"?req.params.location="":req.params.location=req.params.location;
  console.log("modified",req.params);      
  postjob.find(
    {title: new RegExp('.*'+req.params.title+'.*', "i"),
     keyword: new RegExp('.*'+req.params.keyword+'.*', "i"),
     location: new RegExp('.*'+req.params.location+'.*', "i")
    }).then((jobs)=>{
    console.log(jobs);
    res.send(jobs)
  }).catch(err=>console.log(err))
})

app.listen(3000, function () {
  console.log("server running @ localhost:3000");
});
