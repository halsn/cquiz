'use strict';
var User = require('../lib/user');
var login = function (req, res) {
  if (req.method === 'GET') {
    res.locals.err = '';
    res.render('login');
  } else {
    var email = req.body.useremail
      , pass = req.body.userpass;
    User.auth(email, pass, function (err, user) {
      if (err === -1) {
        res.render('5xx');
      } else if (err) {
        console.log('error');
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
