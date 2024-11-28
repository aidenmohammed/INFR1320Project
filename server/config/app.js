let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let passport = require('passport');
let session = require('express-session');
let passportLocal = require('passport-local');
let localStrategy = passportLocal.Strategy;

let app = express();
let cors = require('cors');
let userModel = require('../model/User');
let User = userModel.User;

let indexRouter = require('../routes/index');
let usersRouter = require('../routes/users');
let surveyRouter = require('../routes/survey');


app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');
let flash = require('connect-flash');
passport.use(User.createStrategy());
const mongoose = require('mongoose');
let DB = require('./db');

mongoose.connect(DB.URI);
let mongoDB = mongoose.connection;
mongoDB.on('error',console.error.bind(console,'Connection Error'));
mongoDB.once('open',()=>{
  console.log("Connected with the MongoDB")
});
mongoose.connect(DB.URI,{useNewURIParser:true,useUnifiedTopology:true})

app.use(session({
  secret:'SomeSecret',
  saveUninitialized: false,
  resave:false
}));

app.use(flash());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(passport.initialize());
app.use(passport.session());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../../public')));
app.use(express.static(path.join(__dirname, '../../node_modules')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/surveyslist',surveyRouter);

app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err, req, res, next) {

  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error',{title:'Error'});
});

module.exports = app;
