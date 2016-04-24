'use strict';
var model = require('./db').model;
var Schema = require('./db').Schema;
var Class = require('./class');

var schema = new Schema({
  ref_class: {
    type: Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  createAt: {
    type: Date,
    default: Date.now,
    required: true
  },
  expireAt: {
    type: Date,
    default: Date.now() + 1000 * 60 * 10,
    required: true
  },
  expireNum: Number,
  judgeNum: Number,
  singleNum: Number,
  multiNum: Number,
  askNum: Number,
  ref_students: [{
    name: String,
    no: String,
    spercialty: String,
    className: String,
    accessed: {
      type: Boolean,
      default: false
    },
    canGetAnswers: {
      type: Boolean,
      default: false
    },
    isChecked: {
      type: Boolean,
      default: false
    },
    ref_quizs: [{
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
      answered: [{
        type: String,
        trim: true
      }],
      ref_point: String,
      isRight: {
        type: Boolean,
        default: false
      },
      score: Number
    }]
  }],
  uuid: {
    type: String,
    required: true
  },
  ref_qsets: [Schema.Types.ObjectId],
  ref_points: [String]
});

var Test = model('test', schema);

module.exports = Test;
