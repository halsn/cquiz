'use strict';
var model = require('./db').model;
var Schema = require('./db').Schema;
var Teacher = require('./teacher');
var Qset = require('./qset');
var Course = require('./course');
var Student = require('./student');

var schema = new Schema({
  class_name: {
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
  ref_students: [{
    name: String,
    no: String,
    spercialty: String,
    className: String
  }]
});

schema.index({
  class_name: 1,
  ref_course: 1,
  ref_teacher: 1
}, {
  unique: true
});

var Class = model('class', schema);

module.exports = Class;
