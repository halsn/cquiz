'use strict';
var Student = require('../../lib/student');

exports.get = function (req, res) {
  res.locals.err = '';
  res.render('s/signup');
}

exports.post = function (req, res) {
  var email = req.body.useremail
    , pass = req.body.userpass
    , ckps = req.body.userckps
  if (pass !== ckps) {
    res.locals.err = '两次输入密码不一致';
    return res.render('s/signup');
  }
  Student.add(email, pass, err => {
    if (err === -1) {
      res.render('5xx');
      res.render('s/signup');
    } else if (err) {
      res.locals.err = err;
      return res.render('s/signup');
    } else {
      res.status(200);
      res.redirect('login');
    }
  });
}
