'use strict';
var User = require('../lib/user');
var signup = function (req, res) {
    if (req.method === 'GET') {
        res.locals.err = '';
        res.render('signup');
    } else if (req.method === 'POST') {
        var name = req.body.username,
            pass = req.body.password,
            ckps = req.body.ckpassword;
        if (pass !== ckps) {
            res.locals.err = '两次输入密码不一致';
            return res.render('signup');
        }
        User.add(name, pass, function (err) {
            if (err === -1) {
                res.render('5xx');
            } else if (err) {
                res.locals.err = err.toString();
                res.render('signup');
            } else {
                res.status(200);
                res.redirect('/login');
            }
        });
    }
};

module.exports = signup;
