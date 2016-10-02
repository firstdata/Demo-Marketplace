var express = require('express');
var app = express();

app.use('/public', express.static(__dirname + '/public'));
app.use('/node_modules', express.static(__dirname + '/node_modules'));

app.use(express.static('public'));

app.listen(8181, function () {
  console.log('Example app listening on port 8181!');
});
