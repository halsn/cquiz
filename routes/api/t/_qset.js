var Quiz = require('../../../lib/quiz');
var Qset = require('../../../lib/qset');
var Course = require('../../../lib/course');

function _get(req, res) {

}

function _post(req, res) {
  if (!req.session.user) return res.status(500).end('no auth');
  var qset = req.body;
  var promiseSave = qset.quizs.map(q => new Quiz(q).save());
  Promise.all(promiseSave)
    .then(data => {
      qset.quizs = data.map(el => el._id);
      qset = new Qset(qset);
      Course.findOne({
          _id: qset.ref_course
        })
        .exec((err, course) => {
          if (err) return res.status(500).end();
          if (!course.chapters.filter(chp => chp.title === qset.ref_chapter).length) return res.status(500).end();
          qset.save(err => {
            if (err) return res.status(500).end();
            res.status(200).end();
          });
        });
    })
    .catch(err => console.log(err));
}

function _del(req, res) {

}

function _put(req, res) {

}

module.exports.get = _get;
module.exports.post = _post;
module.exports.put = _put;
module.exports.del = _del;
