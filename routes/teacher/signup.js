'use strict';
var Teacher = require('../../lib/teacher');

module.exports.get = function (req, res) {
  res.locals.err = '';
  res.render('t/login');
};

module.exports.post = function (req, res) {
  var email = req.body.useremail,
    pass = req.body.userpass,
    ckps = req.body.userckps;
  if (pass !== ckps) {
    return res.status(500).end('两次输入密码不一致');
  }
  Teacher.add(email, pass, err => {
    if (err === -1) {
      return res.status(500).end('系统内部错误');
    } else if (err) {
      return res.status(500).end(err.toString());
    } else {
      return res.status(200).end('注册成功');
    }
  });
};
