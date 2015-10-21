'use strict';
var bcrypt = require('bcryptjs');
var db = require('./db');
var quiz = require('./quiz');
var Schema = {
    name: String,
    pass: String,
    qset: Object,
    salt: String,
    email: String
}

var User = db('users', Schema);

module.exports = User;

User.add = function (name, pass, fn) {
    User.findOne({
        name: name
    }, function (err, doc) {
        if (err) { return fn(-1); }
        else if (doc) { return fn('用户已存在'); }
        else {
            if (!name || !pass) { return fn('用户名或密码不能为空'); }
            var newUser = {};
            newUser.name = name;
            bcrypt.genSalt(12, function (err, salt) {
                if (err) { return fn(-1); }
                newUser.salt = salt;
                bcrypt.hash(pass, salt, function (err, hash) {
                    if (err) { return fn(-1); }
                    newUser.pass = hash;
                    User.create(newUser, function (err) {
                        if (err) { return fn(-1); }
                    });
                    fn(null);
                });
            });
        }
    });
}

User.auth = function (name, pass, fn) {
    User.findOne({
        name: name
    }, function (err, user) {
        if (err) { return fn(-1); }
        else if (!user) { return fn('用户名或密码错误'); }
        else {
            bcrypt.hash(pass, user.salt, function (err, hash) {
                if (err) { return fn(-1); }
                else if (hash === user.pass) { fn(null, user.name); }
                else { return fn('用户名或密码错误'); }
            });
        }
    });
}

User.update = function (name, edited, fn) {
    User.findOne({
        name: name
    }, function (err, user) {
        if (err) { return fn(-1); }
        user.name = edited.name;
        user.email = edited.email;
        bcrypt.hash(edited.pass, user.salt, function (err, hash) {
            if (err) { return fn(-1); }
            user.pass = hash;
        });
        user.save(function (err) {
            if (err) { return fn(-1); }
        });
        fn(null);
    });
}

User

User.addQuiz = function (name, quiz, fn) {
    User.findOne({
        name: name
    }, function (err, user) {
        if (err) { return fn(-1); }
        user.qset.content.push(quiz);
        fn(null);
    });
}

User.removeQuiz = function (name, quiz, fn) {
    
}