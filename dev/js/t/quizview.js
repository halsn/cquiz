/* globals Vue */
//var Vue = require('../vendor/vue.min.js');
var courseView = require('./courseview');
var pubQuiz = require('./pubquiz');
var tip = require('../util').tip;
Vue.use(require('vue-resource'));

var quizView = new Vue({
  el: '#course-tab-4',
  data: {
    courses: [],
    course: {
      _id: '',
      chapter: ''
    },
    quizs: []
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
      this.quizs = [];
    },
    get(evt) {
      if (!this.course._id || !this.course.chapter) return evt.preventDefault();
      var qset = {};
      qset.ref_course = this.course._id;
      qset.ref_chapter = this.course.chapter;
      this.$http.get('/api/t/qset', qset)
        .then(res => {
          if (!res.data) {
            tip('未录入习题', 'message');
            this.quizs = [];
          } else this.quizs = res.data;
        }, err => tip(err.data, 'error'));
    },
    del(evt) {
      if (!this.course._id || !this.course.chapter || !this.quizs.length) return evt.preventDefault();
      var qset = {};
      qset.ref_course = this.course._id;
      qset.ref_chapter = this.course.chapter;
      this.$http.delete('/api/t/qset', qset)
        .then(res => {
            tip('删除成功', 'success');
            this.quizs = [];
            window.courseView.get();
            pubQuiz.get();
          },
          err => tip(err.data, 'error'));
    }
  }
});

module.exports = quizView;
