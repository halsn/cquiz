'use strict';
var User = require('../lib/user');
var Quiz = require('../lib/quiz');
var home = function (req, res) {
    if (req.session.user) {
        var user = req.session.user;
        res.locals.username = user;
        
        res.render('home');
    } else {
        res.redirect('login');
    }
}

module.exports = home;