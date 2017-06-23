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

/**
 * GET service /marketplace/v1/categories
 * get list of categories
 */
app.get('/marketplace/v1/categories', function(req, res) {
  var options = {
    method: 'GET',
    url: kongUrl + '/marketplace/v1/categories',
    headers:getAuthenticationHeaders()
  };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    res.status(response.statusCode).send(body);
  });
});

/**
 * GET service /marketplace/v1/products
 * get list of products
 */
app.get('/marketplace/v1/products', function(req, res) {

  var options = {
    method: 'GET',
    url: kongUrl + '/marketplace/v1/products',
    headers:getAuthenticationHeaders()
  };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    res.status(response.statusCode).send(body);
  });
});


/**
 * GET service /marketplace/v1/products/:pid/details/
 * get product details
 * @param pid
 */
app.get('/marketplace/v1/products/:pid/details/', function(req, res) {

  var pid = req.params.pid;
  var options = {
    method: 'GET',
    url: kongUrl + '/marketplace/v1/products/' + pid + '/details/',
    headers:getAuthenticationHeaders()
  };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    res.status(response.statusCode).send(body);
  });
});

/**
 * GET service /marketplace/v1/products/:pid/features/
 * get product features
 * @param pid
 */
app.get('/marketplace/v1/products/:pid/features/', function(req, res) {

  var pid = req.params.pid;
  var options = {
    method: 'GET',
    url: kongUrl + '/marketplace/v1/products/' + pid + '/features/',
    headers:getAuthenticationHeaders()
  };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    res.status(response.statusCode).send(body);
  });
});

/**
 * GET service /marketplace/v1/products/:pid/specs/
 * Get product specifications
 * @param pid
 */
app.get('/marketplace/v1/products/:pid/specs/', function(req, res) {
  var pid = req.params.pid;
  var options = {
    method: 'GET',
    url: kongUrl + '/marketplace/v1/products/' + pid + '/specs/',
    headers:getAuthenticationHeaders()
  };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    res.status(response.statusCode).send(body);
  });
});

/**
 * GET service /marketplace/v1/products/:pid/recommended/
 * Get recommended products for product
 * @param pid
 */
app.get('/marketplace/v1/products/:pid/recommended/', function(req, res) {
  var pid = req.params.pid;
  var options = {
    method: 'GET',
    url: kongUrl + '/marketplace/v1/products/' + pid + '/recommended/',
    headers:getAuthenticationHeaders()
  };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    res.status(response.statusCode).send(body);
  });
});

/**
 * GET service /marketplace/v1/products/:pid/includes/
 * Get included products
 * @param pid
 */
app.get('/marketplace/v1/products/:pid/includes/', function(req, res) {
  var pid = req.params.pid;
  var options = {
    method: 'GET',
    url: kongUrl + '/marketplace/v1/products/' + pid + '/includes/',
    headers:getAuthenticationHeaders()
  };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    res.status(response.statusCode).send(body);
  });
});

/**
 * GET service /marketplace/v1/products/:pid/options/
 * Get options products like visa/master card
 * @param pid
 */
app.get('/marketplace/v1/products/:pid/options/', function(req, res) {
  var pid = req.params.pid;
  var options = {
    method: 'GET',
    url: kongUrl + '/marketplace/v1/products/' + pid + '/options/',
    headers:getAuthenticationHeaders()
  };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    res.status(response.statusCode).send(body);
  });
});

/**
 * GET service /marketplace/v1/products/:pid/faq/
 * Get product FAQ
 * @param pid
 */
app.get('/marketplace/v1/products/:pid/faq/', function(req, res) {
  var pid = req.params.pid;
  var options = {
    method: 'GET',
    url: kongUrl + '/marketplace/v1/products/' + pid + '/faq/',
    headers:getAuthenticationHeaders()
  };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    res.status(response.statusCode).send(body);
  });
});

/**
 * GET service /marketplace/v1/categories/:categoryName/industries/
 * Get MCC codes
 * @param categoryName
 */
app.get('/marketplace/v1/categories/:categoryName/industries/', function(req, res) {
  var categoryName = req.params.categoryName;
  var options = {
    method: 'GET',
    url: kongUrl + '/marketplace/v1/categories/' + categoryName + '/industries/',
    headers:getAuthenticationHeaders()
  };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    res.status(response.statusCode).send(body);
  });
});

/**
 * GET service /marketplace/v1/categories/:categoryName/industries/:industryDescription/merchantcategorycodes/
 * Get MCC types
 * @param categoryName
 * @param industryDescription
 */
app.get('/marketplace/v1/categories/:categoryName/industries/:industryDescription/merchantcategorycodes/', function(req, res) {
  var categoryName = req.params.categoryName;
  var industryDescription = req.params.industryDescription;
  var options = {
    method: 'GET',
    url: kongUrl + '/marketplace/v1/categories/' + categoryName + '/industries/' + industryDescription + '/merchantcategorycodes/',
    headers:getAuthenticationHeaders()
  };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    res.status(response.statusCode).send(body);
  });
});

/**
 * GET service /marketplace/v1/contracts/:orderId/agreement/
 * Get contact greement information
 * @param orderId
 */
app.get('/marketplace/v1/contracts/:orderId/agreement/', function(req, res) {
  var orderId = req.params.orderId;
  var options = {
    method: 'GET',
    url: kongUrl + '/marketplace/v1/contracts/' + orderId + '/agreement/',
    headers:getAuthenticationHeaders()
  };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    res.status(response.statusCode).send(body);
  });
});

/**
 * POST service /marketplace/v1/cart/validate
 * validate cart
 */
app.post('/marketplace/v1/cart/validate', function(req, res) {
  var body = req.body;
  var options = {
    method: 'POST',
    url: kongUrl + '/marketplace/v1/cart/validate',
    json: body,
    "content-type": 'application/json',
    headers:getAuthenticationHeaders()
  };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    res.status(response.statusCode).send(body);
  });
});

/**
 * POST service /marketplace/v1/application/submit/
 * Sign merchant application
 */
app.post('/marketplace/v1/application/submit/', function(req, res) {
  var body = req.body;
  var options = {
    method: 'POST',
    url: kongUrl + '/marketplace/v1/application/submit',
    json: body,
    "content-type": 'application/json',
    headers:getAuthenticationHeaders()
  };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    res.status(response.statusCode).send(body);
  });
});

/**
 * POST service /marketplace/v1/pricing/equipment
 * Get Equipment pricing
 */
app.post('/marketplace/v1/pricing/equipment', function(req, res) {
  var body = req.body;
  var options = {
    method: 'POST',
    url: kongUrl + '/marketplace/v1/pricing/equipment',
    json: body,
    "content-type": 'application/json',
    headers:getAuthenticationHeaders()
  };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    res.status(response.statusCode).send(body);
  });
});

/**
 * POST service /marketplace/v1/pricing/global
 * Get Global pricing
 */
app.post('/marketplace/v1/pricing/global', function(req, res) {
  var body = req.body;
  var options = {
    method: 'POST',
    url: kongUrl + '/marketplace/v1/pricing/global',
    json: body,
    "content-type": 'application/json',
    headers:getAuthenticationHeaders()
  };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    res.status(response.statusCode).send(body);
  });
});

/**
 * POST service /marketplace/v1/pricing/acquiring
 * Get Acquiring pricing
 */
app.post('/marketplace/v1/pricing/acquiring', function(req, res) {
  var body = req.body;
  var options = {
    method: 'POST',
    url: kongUrl + '/marketplace/v1/pricing/acquiring',
    json: body,
    "content-type": 'application/json',
    headers:getAuthenticationHeaders()
  };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    res.status(response.statusCode).send(body);
  });
});

/**
 * POST service /marketplace/v1/application/checkout
 * Checkout order
 */
app.post('/marketplace/v1/application/checkout', function(req, res) {
  var body = req.body;
  var options = {
    method: 'POST',
    url: kongUrl + '/marketplace/v1/application/checkout',
    json: body,
    "content-type": 'application/json',
    headers:getAuthenticationHeaders()
  };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    res.status(response.statusCode).send(body);
  });
});

/**
 * POST service /marketplace/v1/application/update
 * Submit merchant application
 */
app.post('/marketplace/v1/application/update', function(req, res) {
  var body = req.body;
  var options = {
    method: 'POST',
    url: kongUrl + '/marketplace/v1/application/update',
    json: body,
    "content-type": 'application/json',
    headers:getAuthenticationHeaders()
  };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    res.status(response.statusCode).send(body);
  });
});
