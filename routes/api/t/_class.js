var Class = require('../../../lib/class');

function _get(req, res) {
  if (!req.session.user) return res.end('no auth');
  var t_id = req.session.user._id;
  Class.find({
    ref_teacher: t_id
  }).exec((err, data) => {
    if (err) return res.status(500).end();
    res.json(data).end();
  });
}

function _post(req, res) {
  if (!req.session.user) return res.end('no auth');
  var preAdd = req.body;
  preAdd.ref_teacher = req.session.user._id;
  new Class(preAdd).save(err => {
    if (err) res.status(500).end();
    res.status(200).end();
  });
}

function _put(req, res) {
  if (!req.session.user) return res.end('no auth');
  Class.update({
    _id: req.body._id
  }, {
    $set: {
      ref_students: req.body.ref_students
    }
  }).exec(err => {
    if (err) return res.status(500).end();
    res.status(200).end();
  });
}

function _del(req, res) {
  if (!req.session.user) return res.end('no auth');
  Class.remove({
    _id: req.body._id
  }).exec(err => {
    if (err) return res.status(500).end();
    res.status(200).end();
  });
}

module.exports.get = _get;
module.exports.post = _post;
module.exports.put = _put;
module.exports.del = _del;
