/* globals Vue XLSX */
var courseView = require('./courseview');
var classView = require('./classview');
var tip = require('../util').tip;
Vue.use(require('vue-resource'));

var addQuiz = new Vue({
  el: '#course-tab-3',
  data: {
    courses: [],
    course: {
      _id: '',
      chapter: ''
    },
    jsonData: []
  },
  computed: {
    idx() {
      for (var i = 0, l = this.courses.length; i < l; i++) {
        if (this.courses[i]._id === this.course._id) return i;
      }
      return -1;
    }
  },
  methods: {
    clear() {
      this.jsonData = [];
    },
    save(evt) {
      if (!this.course._id || !this.jsonData.length || !this.course.chapter || !this.courses[this.idx].chapters.length) return evt.preventDefault();
      var quizs = [];
      var qset = {};
      this.jsonData.forEach(el => {
        var q = {};
        q.genre = el.类型;
        q.describe = {};
        q.describe.content = el.题目;
        q.ref_point = el.知识点;
        q.answers = [el.参考答案];
        if (q.genre === '单选题' || q.genre === '多选题') {
          var secs = el.选项.split(';');
          q.selections = secs.map(el => el.trim().slice(2));
          q.answers = el.参考答案.split('').map(el => secs.filter(sec => sec.indexOf(el) === 0).join('').slice(2).trim());
        }
        quizs.push(q);
      });
      qset.quizs = quizs;
      qset.ref_course = this.course._id;
      qset.ref_chapter = this.course.chapter;
      this.$http.post('/api/t/qset', qset)
        .then(res => {
          tip('录入成功', 'success');
          this.course = {};
          this.jsonData = [];
          window.courseView.get();
          classView.get();
        }, err => tip(err.data, 'error'));
    },
    read(evt, idx) {
      if (!this.course._id || !this.course.chapter || !this.courses[this.idx].chapters.length) return evt.preventDefault();
      var course = this.courses.filter(course => course._id === this.course._id)[0];
      var chapter = course.chapters.filter(chap => chap.title === this.course.chapter)[0] || {};
      var file = evt.target.files[0];
      var reader = new FileReader();
      reader.onload = function (e) {
        var data = e.target.result;
        var workbook = XLSX.read(data, {
          type: 'binary'
        });
        var first_sheet_name = workbook.SheetNames[0];
        var first_sheet = workbook.Sheets[first_sheet_name];
        var sheetData = XLSX.utils.sheet_to_json(first_sheet);
        var contentList = [];
        addQuiz.jsonData = sheetData.filter(el => {
          if (contentList.indexOf(el.题目) !== -1) return false;
          else if (!el.知识点) return false;
          else if (el.类型 === '问答题') {
            el.选项 = '';
            contentList.push(el.题目.trim());
            return !!(el.题目 && el.参考答案);
          } else if (el.类型 === '判断题') {
            contentList.push(el.题目.trim());
            if (!el.参考答案) return false;
            else if (el.参考答案 === '正确' || el.参考答案 === '错误') return true;
            return false;
          } else if (el.类型 === '单选题' || el.类型 === '多选题') {
            contentList.push(el.题目.trim());
            if (!el.选项) return false;
            var selection = el.选项
              .split(/\;|\n/)
              .map(s => s.trim().replace(/\&\#10/g, ''))
              .filter(el => /^[A-Z]\.[^\.]/.test(el) && el.match(/[A-Z]\./g).length === 1);
            if (selection.length < 2) return false;
            el.选项 = selection.join(';');
            var pre = !!(el.题目 && el.参考答案);
            if (pre) return /^[A-Z]+$/.test(el.参考答案) && el.参考答案.split('').length <= selection.length;
            return pre;
          } else return false;
        });
      }
      if (!file) return null;
      else reader.readAsBinaryString(file);
    }
  }
});

module.exports = addQuiz;
