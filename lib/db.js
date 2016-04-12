var mongoose = require('mongoose');
var conn_str = '';
var mongo = process.env.VCAP_SERVICES;
if (process.env.MONGODB_CONNECTION) {
  conn_str = 'mongodb://' + process.env.MONGODB_CONNECTION;
} else if (mongo) {
  var env = JSON.parse(mongo);
  if (env['mongodb']) {
    conn_str = env['mongodb'][0]['credentials'].uri;
  } else {
    conn_str = 'mongodb://0.0.0.0:27017/cquiz';
  }
} else {
  conn_str = 'mongodb://0.0.0.0:27017/cquiz';
}

mongoose.connect(conn_str);

module.exports.model = function (name, schema) {
  return mongoose.model(name, schema);
};
module.exports.Schema = mongoose.Schema;
