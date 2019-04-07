'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var dotenv = require('dotenv');
var bodyParser = require('body-parser');

var cors = require('cors');

dotenv.config();

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true});

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use(bodyParser.urlencoded({extended: false}));
app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

var exampleUrl = {
  original_url: "http://google.com",
  shortend_url: 1
}
  
// your first API endpoint... 
app.get("/api/shorturl/:urlId?", function (req, res) {
  //res.json(exampleUrl);
  res.redirect(exampleUrl.original_url);
});

app.post("/api/shorturl/new/", function(req, res){
  res.json({original_url: req.body.url, short_url: "id_tbd"});
});


app.listen(port, function () {
  console.log('Node.js listening ...');
});