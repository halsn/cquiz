'use strict';
var model = require('./db').model;
var Schema = require('./db').Schema;

var schema = new Schema({
  genre: {
    type: String,
    enum: ['选择题', '判断题', '主观题'],
    required: true
  },
  describe: {
    content: {
      type: String,
      required: true
    },
    img: {
      data: Buffer,
      type: String
    }
  },
  selections: [String],
  answers: [String]
});

var Quiz = model('quiz', schema);

module.exports = Quiz;
