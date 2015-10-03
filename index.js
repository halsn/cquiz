
var express = require('express');
var app = express();

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));

app.set('view engin', 'jade');

// views is directory for all template files
app.set('views', __dirname + '/views');

app.get('/', function (req, res) {
    res.render('pages/index.jade');
});


app.get('/login', function (req, res) {
    res.render('pages/login.jade');
});

app.post('/login', function (req, res) {
    res.end('hello there');
})

app.get('/signup', function (req, res) {
    res.render('pages/signup.jade');
})

app.listen(app.get('port'), function () {
    console.log('Node app is running on port', app.get('port'));
});
