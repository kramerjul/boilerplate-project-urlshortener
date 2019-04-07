'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var dotenv = require('dotenv');
var bodyParser = require('body-parser');
var url =  require('url');
var dns = require('dns');
var cors = require('cors');

//Init apps
dotenv.config();
var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;
const mongoUri = process.env.MONGO_URI;

/** this project needs a db !! **/ 
mongoose.connect(mongoUri, {useNewUrlParser: true}, function(err,data){
  if(err) throw err;
  console.log('connected');
});


app.use(cors());

//Data Schema for URL
const Schema = mongoose.Schema;

var urlSchema = new Schema({
  original_url: {type: String, required: true},
  short_url: {type: Number, required: true, unique: true}
}, {timestamps: true});

var Url = mongoose.model('Url', urlSchema);

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use(bodyParser.urlencoded({extended: false}));

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});
  
// your first API endpoint... 
// Get Method for redirecting
app.get("/api/shorturl/:urlId?", function (req, res) {
  var urlToFind = parseInt(req.params.urlId);
  if(isNaN(urlToFind)){
    res.json({error: `Could not find ${req.body.urlId}`});
  } else {
    Url.findOne({short_url: urlToFind}, function(err,data){
      if(err) throw err;
      if(data){
        res.redirect(data.original_url);
      } else {
        res.json({error: `Could not find ${req.body.urlId}`});
      }
    });
  }
});

//Create a short URL with POST
app.post("/api/shorturl/new/", function(req, res){
  
  var shortUrlStartIndex = 1;
  var urlToShorten = req.body.url;
  var urlObj= url.parse(urlToShorten);

  if(urlObj.hostname){
    dns.lookup(urlObj.hostname, function(err,address,family){
      if(err){
        res.json({error: "invalid URL"});
      } else {
        Url.findOne({},{},{ sort: { 'createdAt' : -1 } },function(err,data){
          if(err) throw err;
          if(data){
            var newUrl = new Url({original_url: urlToShorten, short_url: data.short_url + 1});
          } else {
            var newUrl = new Url({original_url: urlToShorten, short_url: shortUrlStartIndex});
          }
          newUrl.save(function(err,data){
            if(err) throw err;
            console.log(`Short URL /${data.short_url} with ${data.original_url} has been created.`);
            res.json({original_url: data.original_url, short_url: data.short_url});
          });
        });
      }
  });
  } else {
    res.json({error: "invalid URL"});
  }
});

//Remove all
app.post('/api/shorturl/deleteall/', (req, res) => {
  Url.remove({}, function(err,data){
    if(err) throw err;
    res.send('All URL\'s have been deleted')
  });
})

app.listen(port, function () {
 console.log('Node.js listening ...');
});