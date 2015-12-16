'use strict';
var User = require('../lib/user');
var login = function (req, res) {
    if (req.method === 'GET') {
        res.locals.err = '';
        res.render('login');
    } else {
        var name = req.body.username,
            pass = req.body.password;
        User.auth(name, pass, function (err, user) {
            if (err === -1) {
                res.render('5xx');
            } else if (err) {
                res.locals.err = err.toString();
                res.render('login');
            } else {
                req.session.user = user;
                res.redirect('home');
            }
        });
    }
}

module.exports = login;
