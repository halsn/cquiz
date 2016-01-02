'use strict';
var bcrypt = require('bcryptjs');
var db = require('./db');
var quiz = require('./quiz');
var Schema = {
  email: String
  , pass: String
  , qset: Object
  , salt: String
  , name: String
}

var User = db('users', Schema);

module.exports = User;

User.add = function (email, pass, fn) {
  User.findOne({
    email: email
  }, function (err, doc) {
    if (err) {
      return fn(-1);
    } else if (doc) {
      return fn('用户已存在');
    } else {
      if (!email || !pass) {
        return fn('帐号或密码不能为空');
      }
      var newUser = {};
      newUser.email = email;
      bcrypt.genSalt(12, function (err, salt) {
        if (err) {
          return fn(-1);
        }
        newUser.salt = salt;
        bcrypt.hash(pass, salt, function (err, hash) {
          if (err) {
            return fn(-1);
          }
          newUser.pass = hash;
          User.create(newUser, function (err) {
            if (err) {
              return fn(-1);
            }
          });
          fn(null);
        });
      });
    }
  });
}

User.auth = function (email, pass, fn) {
  User.findOne({
    email: email
  }, function (err, user) {
    if (err) {
      return fn(-1);
    } else if (!user) {
      return fn('帐号或密码错误');
    } else {
      bcrypt.hash(pass, user.salt, function (err, hash) {
        if (err) {
          return fn(-1);
        } else if (hash === user.pass) {
          fn(null, user);
        } else {
          return fn('帐号或密码错误');
        }
      });
    }
  });
}
