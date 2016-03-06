'use strict';
var Teacher = require('../../lib/teacher');

module.exports.get = function (req, res) {
  res.locals.err = '';
  res.render('t/login');
};

module.exports.post = function (req, res) {
  var email = req.body.useremail,
    pass = req.body.userpass;
  Teacher.auth(email, pass, (err, user) => {
    if (err === -1) {
      res.render('5xx');
    } else if (err) {
      res.locals.err = err;
      res.render('t/login');
    } else {
      req.session.user = user;
      res.redirect('home');
    }
  });
};
