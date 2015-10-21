var express = require('express');
var login = require('./login');
var signup = require('./signup');
var logout = require('./logout');
var home = require('./home');
var forget = require('./forget');
var router = express.Router();

module.exports = router;

router.notFound = function (req, res) {
    res.render('404');
}

router.get('/', function (req, res) {
    res.render('index');
});

router.get('/login', login).post('/login', login);
router.get('/signup', signup).post('/signup', signup);
router.get('/logout', logout);
router.get('/home', home).post('/home', home);
router.get('/forget', forget).post('/forget', forget);