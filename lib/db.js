var mongoose = require('mongoose');
var conn_str = '';
var mongo = process.env.VCAP_SERVICES;
if (process.env.DAO) {
  conn_str = 'mongodb://uUBLVc86oHtmkjy7:pX9LDQM0JGInmj6ea@10.10.72.139:27017/I5FwBvGcQ2eAyg1d';
} else if (mongo) {
  var env = JSON.parse(mongo);
  if (env['mongodb']) {
    conn_str = env['mongodb'][0]['credentials'].uri;
  } else {
    conn_str = 'mongodb://localhost:27017/cquiz';
  }
} else {
  conn_str = 'mongodb://localhost:27017/cquiz';
}

mongoose.connect(conn_str);

module.exports.model = function (name, schema) {
  return mongoose.model(name, schema);
};
module.exports.Schema = mongoose.Schema;
