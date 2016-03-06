var Qset = require('../../../lib/qset');
var Course = require('../../../lib/course');

function _get(req, res) {
  if (!req.session.user) return res.status(500).end('no auth');
  var qset = req.query;
  if (!qset.ref_chapter) {
    Qset.find({
      ref_course: qset.ref_course
    }).exec((err, sets) => {
      if (err) return res.status(500).end();
      res.json(sets).end();
    });
  } else {
    Qset.findOne({
        ref_course: qset.ref_course,
        ref_chapter: qset.ref_chapter
      })
      .exec((err, set) => {
        if (err) return res.status(500).end();
        if (!set) return res.status(200).end();
        res.json(set.quizs).end();
      });
  }
}

function _post(req, res) {
  if (!req.session.user) return res.status(500).end('no auth');
  var qset = req.body;
  Qset.findOne({
    ref_course: qset.ref_course,
    ref_chapter: qset.ref_chapter
  }).exec((err, set) => {
    if (err) return res.status(500).end();
    if (!set) {
      new Qset(qset).save(err => {
        if (err) return res.status(500).end();
        res.status(200).end();
      });
    } else {
      var preAdd = qset.quizs.filter(quiz => (set.quizs.map(e => e.describe.content).indexOf(quiz.describe.content)) === -1);
      set.quizs = set.quizs.concat(preAdd);
      set.save(err => {
        if (err) return res.status(500).end();
        res.status(200).end();
      });
    }
  });
}

function _del(req, res) {
  if (!req.session.user) return res.status(500).end('no auth');
  var ref_course = req.body.ref_course;
  var ref_chapter = req.body.ref_chapter;
  Qset.remove()
    .where('ref_course').equals(ref_course)
    .where('ref_chapter').equals(ref_chapter)
    .exec(err => {
      if (err) return res.status(500).end();
      res.status(200).end();
    });
}

function _put(req, res) {

}

module.exports.get = _get;
module.exports.post = _post;
module.exports.put = _put;
module.exports.del = _del;
