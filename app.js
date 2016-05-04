'use strict';
var express = require('express');
var router = require('./routes/main');
var session = require('express-session');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var mongoExpress = require('mongo-express/middleware');
var mongoExpressConfig = require('./lib/mongo_express_config');
var compression = require('compression');
var app = express();

var port = (process.env.VCAP_APP_PORT || 5000);
var host = (process.env.VCAP_APP_HOST || '0.0.0.0');

app.use(express.static(__dirname + '/static'));
app.use('/mongo', mongoExpress(mongoExpressConfig));

app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(session({
  resave: false, // don't save session if unmodified
  saveUninitialized: false, // don't create session until something stored
  secret: 'secret with promise',
  cookie: {
    maxAge: 1000 * 60 * 120
  }
}));

app.set('view engine', 'jade');
// views is directory for all template files
app.set('views', __dirname + '/views');

app.use(router);
app.listen(port, host, () => {
  console.log(`Node app is running on http:\/\/${host}:${port}`);
});
