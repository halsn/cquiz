var Test = require('../../../lib/test');
var Qset = require('../../../lib/qset');
var Class = require('../../../lib/class');
var uuid = require('node-uuid');

function _get(req, res) {
  var no = req.query.no;
  var classId = req.query.classId;
  var uuid = req.params.uuid;
  if (uuid === 'status' && classId) {
    if (!req.session.user) return res.status(500).end('登陆超时，请重新登陆');
    else {
      Test.find()
        .where('ref_class').equals(classId)
        .exec((err, tests) => {
          if (err) return res.status(500).end('内部错误');
          res.json(tests);
        });
    }
  } else {
    Test.findOne()
      .where('uuid').equals(uuid)
      .exec((err, test) => {
        if (!test) return res.render('404');
        else {
          if (!no) {
            res.render('test');
          } else if (test.ref_students.map(s => s.no).indexOf(no) === -1) {
            res.json({
              miss: true
            });
          } else {
            var student = test.ref_students.filter(s => s.no === no)[0];
            var now = Date.now();
            var expire = test.expireAt;
            var data = {};
            data.expire = expire;
            data.now = now;
            if (student.accessed) {
              if (student.canGetAnswers) {
                data.quizs = student.ref_quizs;
                data.showAns = true;
                res.json(data);
              } else {
                student.ref_quizs = student.ref_quizs.map(q => {
                  q.answers = [];
                  return q;
                });
                data.quizs = student.ref_quizs;
                data.showAns = false;
                res.json(data);
              }
            } else if (now > expire) {
              res.status(404).type('html').end('页面已过期', 'utf8');
            } else {
              Qset.find()
                .where('_id').in(test.ref_qsets)
                .exec((err, qsets) => {
                  if (err) return res.status(500).end();
                  var si = test.ref_students.map(s => s.no).indexOf(no);
                  var quizs = qsets.map(s => s.quizs).reduce((pre, acc) => pre.concat(acc));
                  quizs = quizs.filter(q => test.ref_points.indexOf(q.ref_point) !== -1);
                  quizs = quizs.sort(() => 0.5 - Math.random());
                  var judgeQuizs = quizs.filter(q => q.genre === '判断题').slice(0, test.judgeNum);
                  var singleQuizs = quizs.filter(q => q.genre === '单选题').slice(0, test.singleNum);
                  var multiQuizs = quizs.filter(q => q.genre === '多选题').slice(0, test.multiNum);
                  var askQuizs = quizs.filter(q => q.genre === '问答题').slice(0, test.askNum);
                  quizs = judgeQuizs.concat(singleQuizs).concat(multiQuizs).concat(askQuizs);
                  quizs = quizs.sort(() => 0.5 - Math.random());
                  quizs = quizs.map(q => {
                    q.selections = q.selections.sort(() => 0.5 - Math.random());
                    return q;
                  });
                  if (test.askNum === 0) test.ref_students[si].isChecked = true;
                  test.ref_students[si].accessed = true;
                  test.ref_students[si].ref_quizs = quizs;
                  test.save(err => {
                    if (err) res.status(500).end('内部错误');
                    else {
                      quizs = quizs.map(q => {
                        q.answers = [];
                        return q;
                      });
                      data.quizs = quizs;
                      res.json(data);
                    }
                  });
                });
            }
          }
        }
      });
  }
}

function _post(req, res) {
  if (!req.session.user) return res.status(500).end('no auth');
  var data = req.body;
  var preAdd = {};
  preAdd.uuid = uuid.v4();
  preAdd.ref_class = data.class_id;
  preAdd.expireAt = Date.now() + data.duration * 60 * 1000;
  preAdd.expireNum = data.expireNum;
  preAdd.judgeNum = data.judgeNum;
  preAdd.singleNum = data.singleNum;
  preAdd.multiNum = data.multiNum;
  preAdd.askNum = data.askNum;
  Class.findOne()
    .where('_id').equals(data.class_id)
    .exec((err, Class) => {
      Qset.find()
        .where('ref_course').equals(Class.ref_course)
        .where('ref_chapter').in(data.chapterList)
        .exec((err, qsets) => {
          preAdd.ref_points = data.pointList;
          preAdd.ref_qsets = qsets.map(q => q._id);
          if (!preAdd.ref_qsets.length) return res.status(500).end();
          preAdd.ref_students = data.ref_students;
          new Test(preAdd).save(err => {
            if (err) return res.status(500).end();
            res.status(200).end();
          });
        });
    });
}

function _put(req, res) {
  var uuid = req.params.uuid;
  var no = req.body.no;
  var answered = req.body.answered;
  if (!no && !answered && req.session.user) {
    var ref_students = req.body.data;
    Test.findOne()
      .where('uuid').equals(uuid)
      .exec((err, test) => {
        if (err) return res.status(500).end();
        test.ref_students = ref_students;
        test.save(err => {
          if (err) return res.status(500).end();
          res.status(200).end();
        });
      });
  } else {
    Test.findOne()
      .where('uuid').equals(uuid)
      .exec((err, test) => {
        if (err) return res.status(500).end();
        if (!test) return res.status(404).end();
        var now = Date.now();
        var expire = test.expireAt;
        if (now > expire) {
          res.json({
            timeout: true
          });
        } else {
          var si = test.ref_students.map(s => s.no).indexOf(no);
          test.ref_students[si].ref_quizs = test.ref_students[si].ref_quizs.map((q, x) => {
            q.answered = answered[x];
            if (q.genre === '问答题') {
              q.isRight = true;
              q.score = 0;
              q.isChecked = false;
            } else if (q.genre === '多选题') {
              q.isRight = q.answered.sort().join('') === q.answers.sort().join('');
              q.isChecked = true;
              if (q.isRight) q.score = 10;
              else q.score = 0;
            } else {
              q.isRight = q.answered.sort().join('') === q.answers.sort().join('');
              q.isChecked = true;
              if (q.isRight) q.score = 5;
              else q.score = 0;
            }
            return q;
          });
          test.ref_students[si].canGetAnswers = true;
          test.save(err => {
            if (err) res.status(500).end();
            else res.status(200).end();
          });
        }
      });
  }
}

function _del() {

}

module.exports.get = _get;
module.exports.post = _post;
module.exports.put = _put;
module.exports.del = _del;
