var Test = require('../../lib/test');

function _get(req, res) {
  var uuid = req.query.uuid;
  var sno = req.query.sno;
  Test.find()
    .where('uuid').equals(uuid)
    .exec((err, test) => {
      test = test[0];
      if (err) return res.status(500).end(err.toString());
      else if (!test.ref_students.every(s => s.isChecked)) return res.status(500).end('教师批改未完成');
      else return res.json(test);
    });
}

function _post(req, res) {

}

function _put(req, res) {

}

function _del(req, res) {

}

module.exports.get = _get;
module.exports.post = _post;
module.exports.put = _put;
module.exports.del = _del;
