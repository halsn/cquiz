var Test = require('../../lib/test');

function _get(req, res) {
  var uuid = req.query.uuid;
  Test.find()
    .where('uuid').equals(uuid)
    .exec()
    .then(docs => {
      var test = docs[0];
      if (!test) return res.status(404).end('not found');
      return Test.find().where('ref_class').equals(test.ref_class).exec();
    })
    .then(docs => {
      return res.json(docs);
    })
    .catch(err => res.status(500).end('error'));
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
