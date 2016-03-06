'use strict';
var model = require('./db').model;
var Schema = require('./db').Schema;
var Teacher = require('./teacher');

var schema = new Schema({
  name: {
    type: String,
    required: true
  },
  term: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  chapters: [{
    title: String,
    tags: [String]
  }],
  ref_teacher: {
    type: Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  }
});

schema.index({
  name: 1,
  term: 1,
  ref_teacher: 1
}, {
  unique: true
});

var Course = model('course', schema);

module.exports = Course;
