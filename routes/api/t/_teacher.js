'use strict';
var Teacher = require('../../../lib/teacher');
var bcrypt = require('bcryptjs');

function _get() {

}

function _post() {

}

function _put(req, res) {
  if (!req.session.user) return res.status(500).end('登陆超时，请重新登陆');
  var data = req.body;
  Teacher.auth(req.session.user.email, data.originPass, (err, teacher) => {
    if (err) return res.status(500).end('密码错误');
    else {
      teacher.pass = bcrypt.hashSync(data.newPass, 10);
      teacher.save(err => {
        if (err) return res.status(500).end('内部错误');
        else return res.status(200).end();
      });
    }
  });
}

function _del() {

}

module.exports.get = _get;
module.exports.post = _post;
module.exports.put = _put;
module.exports.del = _del;
