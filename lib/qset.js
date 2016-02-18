'use strict';
var model = require('./db').model;
var Schema = require('./db').Schema;
var Quiz = require('./quiz');
var Course = require('./course');

var schema = new Schema({
  quizs: [{
    type: Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  }],
  ref_course: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  ref_chapter: {
    type: String,
    required: true
  },
  due_date: {
    type: Date,
    default: Date.now() + (1000 * 60 * 60 * 24)
  }
});

var Qset = model('qset', schema);

module.exports = Qset;
