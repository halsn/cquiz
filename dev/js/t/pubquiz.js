/* globals Vue */
//var Vue = require('../vendor/vue.min.js');
var classView = require('./classview');
var tip = require('../util').tip;
var renderTable = require('../util').renderTable;
var renderPointTable = require('../util').renderPointTable;
var render = require('../util').render;
var testView = require('./testview');
Vue.use(require('vue-resource'));

var pubQuiz = new Vue({
  el: '#class-tab-4',
  data: {
    classes: [],
    Class: {},
    qsets: [],
    points: [],
    pointList: [],
    chapterList: [],
    duration: 10,
    maxjudgeNum: 0,
    maxsingleNum: 0,
    maxmultiNum: 0,
    maxaskNum: 0,
    quizNum: 0,
    judgeNum: 0,
    singleNum: 0,
    multiNum: 0,
    askNum: 0
  },
  computed: {
    studentNum() {
      if (!Object.keys(this.Class).length) return 0;
      else return this.Class.ref_students.length;
    },
    expireNum() {
      return this.judgeNum + this.singleNum + this.multiNum + this.askNum;
    }
  },
  methods: {
    getNum(evt) {
      if (['INPUT', 'SPAN'].indexOf(evt.target.nodeName) === -1) return evt.preventDefault();
      setTimeout(() => {
        var table = document.querySelector('.point-table');
        var selected = table.querySelectorAll('.is-selected');
        this.quizNum = 0;
        this.judgeNum = 0;
        this.singleNum = 0;
        this.multiNum = 0;
        this.askNum = 0;
        this.pointList = [];
        var uppers = document.querySelectorAll('#class-tab-4 .mdl-slider__background-upper');
        var lowers = document.querySelectorAll('#class-tab-4 .mdl-slider__background-lower');
        [...uppers].forEach((up, idx) => {
          if (idx > 0) up.style.flex = '1';
        });
        [...lowers].forEach((lo, idx) => {
          if (idx > 0) lo.style.flex = '0';
        });
        [...selected].forEach(el => {
          this.quizNum += Number(el.childNodes[3].textContent || el.childNodes[3].innerText);
          this.pointList.push(el.childNodes[2].textContent || el.childNodes[2].innerText);
        });
        var sets = this.qsets.filter(qset => this.chapterList.indexOf(qset.ref_chapter) !== -1);
        var quizs = [];
        sets.forEach(set => {
          quizs.splice(quizs.length, 0, ...set.quizs);
        });
        quizs = quizs.filter(q => this.pointList.indexOf(q.ref_point) !== -1);
        this.maxjudgeNum = quizs.filter(q => q.genre === '判断题').length;
        this.maxsingleNum = quizs.filter(q => q.genre === '单选题').length;
        this.maxmultiNum = quizs.filter(q => q.genre === '多选题').length;
        this.maxaskNum = quizs.filter(q => q.genre === '问答题').length;
      }, 100);
    },
    getPoint(evt) {
      if (['INPUT', 'SPAN'].indexOf(evt.target.nodeName) === -1) return evt.preventDefault();
      setTimeout(() => {
        var table = document.querySelector('.pub-table');
        var selected = table.querySelectorAll('.is-selected');
        this.quizNum = 0;
        this.singleNum = 0;
        this.multiNum = 0;
        this.askNum = 0;
        this.judgeNum = 0;
        this.maxsingleNum = 0;
        this.maxmultiNum = 0;
        this.maxjudgeNum = 0;
        this.maxaskNum = 0;
        this.chapterList = [];
        this.pointList = [];
        var uppers = document.querySelectorAll('#class-tab-4 .mdl-slider__background-upper');
        var lowers = document.querySelectorAll('#class-tab-4 .mdl-slider__background-lower');
        [...uppers].forEach((up, idx) => {
          if (idx > 0) up.style.flex = '1';
        });
        [...lowers].forEach((lo, idx) => {
          if (idx > 0) lo.style.flex = '0';
        });
        [].forEach.call(selected, (el) => {
          this.chapterList.push(el.childNodes[2].textContent || el.childNodes[2].innerText);
        });
        var sets = this.qsets.filter(qset => this.chapterList.indexOf(qset.ref_chapter) !== -1);
        if (!sets.length) this.points = [];
        else {
          var prePoints = [];
          var quizs = [];
          sets.forEach(set => {
            var titles = set.quizs.map(q => q.ref_point);
            prePoints.splice(prePoints.length, 0, ...titles);
            quizs.splice(quizs.length, 0, ...titles);
          });
          prePoints = [...new Set(prePoints)].map(q => {
            var num = quizs.filter(e => e === q).length;
            return {
              title: q,
              totalNum: num
            };
          });
          this.points = prePoints;
        }
        renderPointTable(document.querySelector('.point-table'));
      }, 100);
    },
    get() {
      if (!this.Class._id) return;
      var qset = {};
      qset.ref_course = this.Class.ref_course;
      this.$http.get('/api/t/qset', qset)
        .then(res => {
          this.qsets = res.data;
          this.quizNum = 0;
          renderTable(document.querySelector('.pub-table'));
        }, err => tip(err.data, 'error'));
    },
    pub(evt) {
      if (!this.studentNum) tip('未录入学生', 'message');
      if (!Object.keys(this.Class).length || !this.quizNum || !this.expireNum || !this.studentNum || this.quizNum < this.expireNum) return evt.preventDefault();
      if (this.judgeNum > this.maxjudgeNum || this.singleNum > this.maxsingleNum || this.multiNum > this.maxmultiNum || this.askNum > this.maxaskNum) return evt.preventDefault();
      var data = {};
      data.class_id = this.Class._id;
      data.duration = this.duration;
      data.chapterList = this.chapterList;
      data.pointList = this.pointList;
      data.ref_students = this.Class.ref_students;
      data.quizNum = this.quizNum;
      data.expireNum = this.expireNum;
      data.judgeNum = this.judgeNum;
      data.singleNum = this.singleNum;
      data.multiNum = this.multiNum;
      data.askNum = this.askNum;
      this.$http.post('/api/t/test', data)
        .then(res => {
          this.Class = {};
          this.qsets = [];
          this.duration = 10;
          this.quizNum = 0;
          this.expireNum = 0;
          this.judgeNum = 0;
          this.singleNum = 0;
          this.multiNum = 0;
          this.askNum = 0;
          this.maxjudgeNum = 0;
          this.maxsingleNum = 0;
          this.maxmultiNum = 0;
          this.maxaskNum = 0;
          this.chapterList = [];
          this.pointList = [];
          this.points = [];
          tip('发布成功', 'success');
          var uppers = document.querySelectorAll('#class-tab-4 .mdl-slider__background-upper');
          var lowers = document.querySelectorAll('#class-tab-4 .mdl-slider__background-lower');
          [...uppers].forEach((up, idx) => {
            if (idx > 0) up.style.flex = '1';
          });
          [...lowers].forEach((lo, idx) => {
            if (idx > 0) lo.style.flex = '0';
          });
          testView.get();
        }, err => tip(err.data, 'error'));
    }
  }
});

module.exports = pubQuiz;
