var Class = require('../../../lib/class');

function _get(req, res) {
  if (!req.session.user) return res.end('登陆超时，请重新登陆');
  var t_id = req.session.user._id;
  Class.find({
    ref_teacher: t_id
  }).exec((err, data) => {
    if (err) return res.status(500).end('内部错误');
    res.json(data).end();
  });
}

function _post(req, res) {
  if (!req.session.user) return res.end('登陆超时，请重新登陆');
  var preAdd = req.body;
  preAdd.ref_teacher = req.session.user._id;
  new Class(preAdd).save(err => {
    if (err) res.status(500).end('内部错误');
    res.status(200).end();
  });
}

function _put(req, res) {
  if (!req.session.user) return res.end('登陆超时，请重新登陆');
  Class.update({
    _id: req.body._id
  }, {
    $set: {
      ref_students: req.body.ref_students
    }
  }).exec(err => {
    if (err) return res.status(500).end('内部错误');
    res.status(200).end();
  });
}

function _del(req, res) {
  if (!req.session.user) return res.end('登陆超时，请重新登陆');
  Class.remove({
    _id: req.body._id
  }).exec(err => {
    if (err) return res.status(500).end('内部错误');
    res.status(200).end();
  });
}

module.exports.get = _get;
module.exports.post = _post;
module.exports.put = _put;
module.exports.del = _del;
