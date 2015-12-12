var mongoose = require('mongoose');
//var db = mongoose.connect('mongodb://localhost:27017/cquiz');
var db = mongoose.connect('mongodb://7af01003-f50f-483c-bbf8-310d1d52bed5:oRQ2XQk5q4jcQhxoS9xwlA@10.9.27.25:27017/cf23d9d4-8a49-479f-a88b-e1a269143c0c');

module.exports = function (name, schema) {
    return mongoose.model(name, schema);
}
