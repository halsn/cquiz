'use strict';
var model = require('./db').model;
var Schema = require('./db').Schema;
var Course = require('./course');

var schema = new Schema({
  quizs: [{
    genre: {
      type: String,
      enum: ['单选题', '多选题', '判断题', '问答题'],
      required: true
    },
    describe: {
      content: {
        type: String,
        required: true,
        trim: true
      },
      img: {
        data: Buffer,
        format: String
      }
    },
    selections: [{
      type: String,
      trim: true
    }],
    answers: [{
      type: String,
      trim: true
    }],
    ref_point: String
  }],
  ref_course: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  ref_chapter: {
    type: String,
    required: true
  }
});

schema.index({
  ref_course: 1,
  ref_chapter: 1
}, {
  unique: true
});

var Qset = model('qset', schema);

module.exports = Qset;
