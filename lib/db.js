var mongoose = require('mongoose');
//var db = mongoose.connect('mongodb://localhost:27017/cquiz');
var db = mongoose.connect('mongodb://73847614-46f3-4261-8551-eb686625b3e2:OLAYYtoN0gFSmCPz9ZkLsw@10.9.58.169:27017/cf23d9d4-8a49-479f-a88b-e1a269143c0c');

module.exports = function (name, schema) {
  return mongoose.model(name, schema);
}
