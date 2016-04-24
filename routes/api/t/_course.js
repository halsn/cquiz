var Course = require('../../../lib/course');
var Teacher = require('../../../lib/teacher');
var Qset = require('../../../lib/qset');
var Class = require('../../../lib/class');

function _get(req, res) {
  if (!req.session.user) return res.end('请重新登陆');
  var t_id = req.session.user._id;
  Course.find({
      ref_teacher: t_id
    })
    .exec((err, docs) => {
      if (err) return res.status('500').end('内部错误');
      res.json(docs).end();
    });
}

function _post(req, res) {
  if (!req.session.user) return res.end('请重新登陆');
  var t_id = req.session.user._id;
  var preAdd = new Course(req.body);
  preAdd.ref_teacher = t_id;
  preAdd.save(err => {
    if (err) return res.status(500).end();
    res.status(200).end();
  });
}

function _put(req, res) {
  if (!req.session.user) return res.status(500).end('请重新登陆');
  var id = req.body._id;
  var data = req.body;
  Course.findOne()
    .where('_id').equals(id)
    .exec((err, course) => {
      var chapIds = course.chapters.map(e => String(e._id));
      var postedIds = data.chapters.filter(e => e._id).map(e => e._id);
      var toRemove = chapIds.filter(c => postedIds.indexOf(c) === -1);
      var toRemoveTitle = course.chapters.filter(c => toRemove.indexOf(String(c._id)) !== -1).map(e => e.title);
      var toEditTitle = [];
      var toEdit = data.chapters.filter(c => c._id);
      var toAdd = data.chapters.filter(e => !e._id);
      course.chapters = course.chapters.filter(c => toRemove.indexOf(String(c._id)) === -1);
      course.chapters.forEach(c => {
        var idx = toEdit.findIndex(e => e._id === String(c._id));
        if (c.title !== data.chapters[idx].title) {
          toEditTitle.push({
            from: c.title,
            to: data.chapters[idx].title
          });
        }
        c.title = data.chapters[idx].title;
      });
      course.chapters = course.chapters.concat(toAdd);
      course.save(err => {
        if (err) return res.status(500).end('内部错误');
        else {
          delQset(toRemoveTitle)
            .then(() => {
              return updateQset(toEditTitle);
            })
            .then(() => {
              return res.status(200).end();
            })
            .catch(err => {
              return res.status(500).end(err);
            });

          function updateQset(toEditTitle) {
            var promises = toEditTitle.map(e => {
              return new Promise((resolve, reject) => {
                Qset.findOneAndUpdate({
                  ref_course: data._id,
                  ref_chapter: e.from
                }, {
                  $set: {
                    ref_chapter: e.to
                  }
                }).exec((err, doc) => {
                  if (err) return reject(err);
                  else return resolve();
                });
              });
            });
            return Promise.all(promises);
          }

          function delQset(toRemoveTitle) {
            return new Promise((resolve, reject) => {
              Qset.remove()
                .where('ref_course').equals(data._id)
                .where('ref_chapter').in(toRemoveTitle)
                .exec(err => {
                  if (err) return reject(err);
                  else return resolve();
                });
            });
          }
        }
      });
      return res.status(200).end();
    });
}

function _del(req, res) {
  if (!req.session.user) return res.status(500).end('请重新登陆');
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
