
// express configuration
var express = require('express');
var app = express();
var path = require('path');

// Route d'authentification
var api = require('./routes/api');
var bodyParser=require("body-parser");

// Configuration de la vue avec ejs
app.set('view engine', 'ejs');

// Repertoire public
app.use(express.static(path.join(__dirname, '/public')));
// Liee la session avec passport
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use('/', api);

var port = 9000

app.listen(port);
console.log('Node_Steward Server is listening on port ' + port);
