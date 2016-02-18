'use strict';
var model = require('./db').model;
var Schema = require('./db').Schema;
var Teacher = require('./teacher');
var Qset = require('./qset');
var Course = require('./course');
var Student = require('./student');
var Quiz = require('./quiz');

var schema = new Schema({
  name: {
    type: String,
    required: true
  },
  ref_teacher: {
    type: Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  ref_course: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  start_date: {
    type: Date,
    default: Date.now
  },
  ref_students: [{
    id: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Student'
    },
    sub_qset: [{
      id: {
        type: Schema.Types.ObjectId,
        ref: 'Qset',
        required: true
      },
      quizs: [{
        id: {
          type: Schema.Types.ObjectId,
          required: true,
          ref: 'Quiz'
        },
        score: {
          type: Number,
          default: 0
        },
        finished: {
          type: Boolean,
          default: false
        }
      }],
      due_date: {
        type: Date,
        default: Date.now() + (1000 * 60 * 60 * 24)
      }
    }]
  }]
});

var Class = model('class', schema);

module.exports = Class;
