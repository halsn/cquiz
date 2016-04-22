'use strict';
var Teacher = require('../../lib/teacher');

module.exports.get = function (req, res) {
  res.locals.err = '';
  res.render('t/signup');
};

module.exports.post = function (req, res) {
  var email = req.body.useremail,
    pass = req.body.userpass,
    ckps = req.body.userckps;
  if (pass !== ckps) {
    res.locals.err = '两次输入密码不一致';
    return res.render('t/signup');
  }
  Teacher.add(email, pass, err => {
    if (err === -1) {
      res.render('5xx');
    } else if (err) {
      res.locals.err = err.toString();
      res.render('t/signup');
    } else {
      res.status(200);
      res.redirect('login');
    }
  });
};
