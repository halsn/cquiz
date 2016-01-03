var express = require('express');
var user = require('./lib/user');
var router = require('./routes/main');
var session = require('express-session');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var jade = require('jade');
var mongo_express = require('mongo-express/middleware');
var mongo_express_config = require('./mongo_express_config');
var app = module.exports = express();

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/static'));
app.use('/mongo', mongo_express(mongo_express_config));

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(session({
  resave: false, // don't save session if unmodified
  saveUninitialized: false, // don't create session until something stored
  secret: 'shhhh, very secret'
  , cookie: {
    maxAge: 1000 * 60 * 30
  }
}));

app.set('view engine', 'jade');
// views is directory for all template files
app.set('views', __dirname + '/views');

app.use(router);
app.use(router.notFound);

app.listen(app.get('port'), function () {
  console.log('Node app is running on port', app.get('port'));
});
