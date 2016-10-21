var express = require('express');
var app = express();
var request = require("request");
var unirest = require("unirest");
var bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/public', express.static(__dirname + '/public'));
app.use('/node_modules', express.static(__dirname + '/node_modules'));

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(express.static('public'));

app.get('/products', function(req, res) {
    var options = { method: 'GET',
    url: 'https://dev.services.firstdata.com/v1/companies/386/products/',
    headers:
     { 'postman-token': '06292835-27d7-7453-fd49-d14b9cae9741',
       'cache-control': 'no-cache' } };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    res.send(body);
  });
});

app.get('/categories', function(req, res) {
    var options = { method: 'GET',
    url: 'https://dev.services.firstdata.com//v1/categories',
    headers:
     { 'postman-token': '06292835-27d7-7453-fd49-d14b9cae9741',
       'cache-control': 'no-cache' } };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    res.send(body);
  });
});

app.get('/products/:id/:method', function(req, res) {
    var id = req.params.id;
    var method = req.params.method;

    console.log('https://qa.sales.firstdata.com/v1/products/' + id + '/' + method + '/');

    var options = { method: 'GET',
    url: 'https://qa.sales.firstdata.com/v1/products/' + id + '/' + method + '/',
    headers:
     { 'postman-token': '06292835-27d7-7453-fd49-d14b9cae9741',
       'cache-control': 'no-cache' } };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    res.send(body);
  });
});

app.get('/checkout/:json', function(req, res) {
    var json = decodeURIComponent(req.params.json);

    var req = unirest("POST", "https://dev.services.firstdata.com//v1/application/checkout");

    req.headers({
      "postman-token": "36db3d30-0617-fa54-2933-707eb2bb5636",
      "cache-control": "no-cache",
      "content-type": "application/json"
    });

    req.type("json");
    req.send(json);

    req.end(function (res) {
      if (res.error) {console.log('ERROR ' + res.error); }
      console.log(res.body);
    });
});

app.listen(3000, function () {
  console.log('Example app listening on port 8181!');
});
