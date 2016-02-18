'use strict';
var Student = require('../../lib/student');

exports.get = function (req, res) {
  res.locals.err = '';
  res.render('s/login');
}

exports.post = function (req, res) {
  var email = req.body.useremail
    , pass = req.body.userpass;
  Student.auth(email, pass, (err, user) => {
    if (err === -1) {
      res.render('5xx');
    } else if (err) {
      res.locals.err = err;
      res.render('s/login');
    } else {
      req.session.user = user;
      res.redirect('home');
    }
  });
}
