
// express configuration
var express = require('express');
var app = express();
var path = require('path');

const cors = require('cors');



// Route d'authentification
var authRoute = require('./routes/auth');
var api = require('./routes/api');
var bodyParser=require("body-parser");


// Session de connection
var logger = require('morgan');
var passport = require('passport');
var session = require('express-session');

// Mongodb connection url
var mongoose = require('mongoose');
var MONGODB_URI = "mongodb://127.0.0.1:27017/proverDb";
  
// Connect to MongoDB
mongoose.connect(MONGODB_URI);
mongoose.connection.on('connected', () => {
    console.log('Connected to MongoDB @ x&  Z');
});

var port = 3010

var allowCrossDomain = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', "*");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', "Origin, X-Requested-With, Content-Type, Accept");
  next();
}

app.use(allowCrossDomain);

// Configuration de la vue avec ejs
app.set('view engine', 'ejs');

// Repertoire public
app.use(express.static(path.join(__dirname, '/public')));

// DB for connexion save
app.use(session({
  secret: '123456789',
  resave: false,
  saveUninitialized: false,
 // store: new SQLiteStore({ db: 'sessions.db', dir: './var/db' })
}));
// Liee la session avec passport
app.use(passport.authenticate('session'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use('/', authRoute);
app.use('/', api);



app.listen(port);
console.log('Prover Server is listening on port ' + port);
