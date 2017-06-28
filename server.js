var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var request = require('request');
var crypto = require('crypto');
var config = require('config');

/**
 * load configuration from config/default.json or from environment variables if any
 */
var kongUrl = (process.env.SANDBOX_URL ? process.env.SANDBOX_URL : config.get('kong.url')).replace(/\/$/, "");
var username = process.env.API_KEY ? process.env.API_KEY : config.get('kong.username')
var secret = process.env.API_SECRET ? process.env.API_SECRET : config.get('kong.secret');
var port = process.env.APP_PORT ? process.env.APP_PORT : config.get('port');


// load web app
app.use('/web', express.static(__dirname + '/web'));

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

app.use(express.static('web'));


app.listen(process.env.PORT || port, function () {
  console.log('listening on port ' + port);
});

/**
 * prepare auth headers for Kong server
 * @returns {{date: string, Authorization: string}}
 */
var getAuthenticationHeaders = function () {
  var date = new Date().toUTCString();
  var stringToSign = 'date: ' + date.trim();
  var encodedSignature = crypto.createHmac("sha1", secret).update(stringToSign).digest("base64");
  var hmacAuth = 'hmac username="' + username + '",algorithm="hmac-sha1",headers="date",signature="' + encodedSignature + '"';
  return {
    'date': date,
    'Authorization': hmacAuth
  }
}

/**
 * POST and GET service end-point proxy
 */
app.all('*', function(req, res) {
  var options = {
    method: req.method,
    url: kongUrl + req.originalUrl,
    headers: getAuthenticationHeaders()
  };

  if (req.method == 'POST') {
    options['json'] = req.body;
    options['content-type'] = 'application/json';
  }

  request(options, function(error, response, body) {
    if (error) throw new Error(error);
    res.status(response.statusCode).send(body);
  });
});


