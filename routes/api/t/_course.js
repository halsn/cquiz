var Course = require('../../../lib/course');
var Teacher = require('../../../lib/teacher');
var Qset = require('../../../lib/qset');
var Class = require('../../../lib/class');

function _get(req, res) {
  if (!req.session.user) return res.end('no auth');
  var t_id = req.session.user._id;
  Course.find({
      ref_teacher: t_id
    })
    .exec((err, docs) => {
      if (err) return res.render('5xx');
      res.json(docs).end();
    });
}

function _post(req, res) {
  if (!req.session.user) return res.end('no auth');
  var t_id = req.session.user._id;
  var preAdd = new Course(req.body);
  preAdd.ref_teacher = t_id;
  preAdd.save(err => {
    if (err) return res.status(500).end();
    res.status(200).end();
  });
}

function _put(req, res) {
  if (!req.session.user) return res.status(500).end('no auth');
  var id = req.body._id;
  var chapters = req.body.chapters;
  var titles = chapters.map(c => c.title);
  if (new Set(chapters.map(c => c.title)).size !== chapters.length) return res.status(500).end();
  Course.update({
    _id: id
  }, {
    $set: {
      chapters: chapters
    }
  }, (err, doc) => {
    if (err) return res.status(500).end();
    Qset.find({
        ref_course: id
      })
      .where('ref_chapter').nin(titles)
      .remove()
      .exec((err, sets) => {
        if (err) return res.status(500).end();
        res.status(200).end();
      });
  });
}

function _del(req, res) {
  if (!req.session.user) return res.status(500).end('no auth');
  var id = req.body._id;
  Course.remove({
    _id: id
  }, err => {
    if (err) return res.status(500).end();
    Class.remove({
      ref_course: id
    }).exec(err => {
      if (err) return res.status(500).end();
      else {
        Qset.remove({
          ref_course: id
        }).exec(err => {
          if (err) return res.status(500).end();
          res.status(200).end();
        });
      }
    });
  });
}

module.exports.get = _get;
module.exports.post = _post;
module.exports.put = _put;
module.exports.del = _del;
