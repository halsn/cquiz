'use strict';
var bcrypt = require('bcryptjs');
var model = require('./db').model;
var Schema = require('./db').Schema;
var Class = require('./class');
var schema = new Schema({
  name: {
    type: String,
    default: '学生'
  },
  sno: {
    type: String,
    trim: true,
    match: /^\d+$/,
    unique: true,
    sparse: true
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    required: true,
    unique: true
  },
  pass: {
    type: String,
    required: true
  },
  classes: [{
    type: Schema.Types.ObjectId,
    ref: 'Class'
  }]
});

var Student = model('student', schema);

module.exports = Student;

Student.add = function (email, pass, fn) {
  Student.findOne({
      email: email
    })
    .exec((err, doc) => {
      if (err) return fn(-1);
      if (doc) return fn('用户已存在');
      var preAdd = new Student();
      var hash = bcrypt.hashSync(pass, 10);
      preAdd.email = email;
      preAdd.pass = hash;
      preAdd.save(err => {
        if (err) return fn(-1);
        return fn(null);
      });
    });
};

Student.auth = function (email, pass, fn) {
  Student.findOne({
      email: email
    })
    .exec((err, doc) => {
      if (err) return fn(-1);
      if (!doc) return fn('帐号或密码错误');
      if (bcrypt.compareSync(pass, doc.pass)) return fn(null, doc);
      else return fn('帐号或密码错误');
    });
};
