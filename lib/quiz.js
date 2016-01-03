'use strict';
var db = require('./db');

var Schema = {
  created: Date
  , author: String
  , content: Object
  , type: String
  , answer: Object
  , tips: String
, };

var Quiz = db('quizs', Schema);

module.exports = Quiz;

Quiz.add = function (addQuiz, fn) {
  var quiz = {};
  quiz.data = addQuiz.date;
  quiz.author = addQuiz.author;
  quiz.content = addQuiz.content;
  quiz.type = addQuiz.type;
  quiz.answer = addQuiz.answer;
  quiz.tips = addQuiz.tips;
  Quiz.create(quiz, function (err) {
    if (err) {
      return fn(-1);
    }
  });
  fn(null);
}

Quiz.delete = function (quiz, fn) {
  Quiz.remove(quiz, function (err) {
    if (err) {
      return fn(-1);
    }
    fn(null);
  });
}

Quiz.edit = function (author, content, edited, fn) {
  Quiz.findOne({
    author: author
    , content: content
  }, function (err, quiz) {
    quiz.data = edited.date;
    quiz.content = edited.content;
    quiz.type = edited.type;
    quiz.answer = edited.answer;
    quiz.tips = edited.tips;
    quiz.save(function (err) {
      if (err) {
        return fn(-1);
      }
    });
    fn(null);
  });
}
