var Qset = require('../../../lib/qset');
var Course = require('../../../lib/course');

function _get(req, res) {
  if (!req.session.user) return res.status(500).end('登陆超时，请重新登陆');
  var qset = req.query;
  if (!qset.ref_chapter) {
    Qset.find({
      ref_course: qset.ref_course
    }).exec((err, sets) => {
      if (err) return res.status(500).end('内部错误');
      res.json(sets).end();
    });
  } else {
    Qset.findOne({
        ref_course: qset.ref_course,
        ref_chapter: qset.ref_chapter
      })
      .exec((err, set) => {
        if (err) return res.status(500).end('内部错误');
        if (!set) return res.status(200).end();
        res.json(set.quizs).end();
      });
  }
}

function _post(req, res) {
  if (!req.session.user) return res.status(500).end('登陆超时，请重新登陆');
  var qset = req.body;
  var updateTags = (id, chapter, tags) => {
    return new Promise((resolve, reject) => {
      Course.findOne()
        .where('_id').equals(id)
        .exec((err, course) => {
          if (err) return reject(err);
          else {
            var idx = course.chapters.findIndex(el => el.title === chapter);
            course.chapters[idx].tags = tags;
            course.save(err => {
              if (err) return reject(err);
              return resolve(200);
            });
          }
        });
    });
  };
  Qset.findOne({
    ref_course: qset.ref_course,
    ref_chapter: qset.ref_chapter
  }).exec((err, set) => {
    if (err) return res.status(500).end('内部错误');
    if (!set) {
      Course.findOne()
        .where('_id').equals(qset.ref_course)
        .exec((err, course) => {
          if (err) return res.status(500).end('内部错误');
          else if (course.chapters.findIndex(el => el.title === qset.ref_chapter) === -1) return res.status(500).end('章节未保存');
          else {
            new Qset(qset).save(err => {
              if (err) return res.status(500).end('内部错误');
              else {
                var tags = Array.from(new Set(qset.quizs.map(q => q.ref_point)));
                updateTags(qset.ref_course, qset.ref_chapter, tags)
                  .then(() => {
                    return res.status(200).end();
                  })
                  .catch(err => {
                    return res.status(500).end('内部错误');
                  })
              }
            });
          }
        })
    } else {
      var preAdd = qset.quizs.filter(quiz => (set.quizs.map(e => e.describe.content).indexOf(quiz.describe.content)) === -1);
      set.quizs = set.quizs.concat(preAdd);
      set.save(err => {
        if (err) return res.status(500).end('内部错误');
        var tags = Array.from(new Set(set.quizs.map(q => q.ref_point)));
        updateTags(set.ref_course, set.ref_chapter, tags)
          .then(() => {
            return res.status(200).end();
          })
          .catch(err => {
            return res.status(500).end('内部错误');
          })
      });
    }
  });
}

function _del(req, res) {
  if (!req.session.user) return res.status(500).end('登陆超时，请重新登陆');
  var ref_course = req.body.ref_course;
  var ref_chapter = req.body.ref_chapter;
  var removeQset = (ref_course, ref_chapter) => {
    return new Promise((resolve, reject) => {
      Qset.remove()
        .where('ref_course').equals(ref_course)
        .where('ref_chapter').equals(ref_chapter)
        .exec(err => {
          if (err) return reject(err);
          else return resolve();
        });
    });
  };
  var updateTags = (id, chapter, tags) => {
    return new Promise((resolve, reject) => {
      Course.findOne()
        .where('_id').equals(id)
        .exec((err, course) => {
          if (err) return reject(err);
          else {
            var idx = course.chapters.findIndex(el => el.title === chapter);
            course.chapters[idx].tags = tags;
            course.save(err => {
              if (err) return reject(err);
              return resolve();
            });
          }
        });
    });
  };
  Qset.findOne()
    .where('ref_course').equals(ref_course)
    .where('ref_chapter').equals(ref_chapter)
    .exec((err, qset) => {
      if (err) return res.status(500).end('内部错误');
      else if (!qset) return res.status(500).end('章节未保存');
      else {
        updateTags(ref_course, ref_chapter, [])
          .then(() => {
            return removeQset(ref_course, ref_chapter);
          })
          .then(() => {
            return res.status(200).end();
          })
          .catch(err => {
            return res.status(500).end('内部错误');
          });
      }
    });
}

function _put(req, res) {

}

module.exports.get = _get;
module.exports.post = _post;
module.exports.put = _put;
module.exports.del = _del;
