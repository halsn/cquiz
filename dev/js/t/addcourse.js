/* globals Vue */
//var Vue = require('../vendor/vue.min.js');
var tip = require('../util').tip;
var courseView = require('./courseview');
Vue.use(require('vue-resource'));

Vue.filter('validName', value => {
  return value.slice(0, 48);
});
var addCourse = new Vue({
  el: '#course-tab-2',
  data: {
    course: {
      name: '',
      duration: 32,
      term: '',
      chapters: [],
      ref_qset: []
    }
  },
  methods: {
    add(evt) {
      if (!this.course.name) evt.preventDefault();
      else {
        this.$http.post('/api/t/course', this.course)
          .then(res => {
            tip('添加成功，请在设置章节后录入习题', 'success');
            this.course.name = '';
            this.course.duration = 32;
            document.querySelectorAll('.mdl-layout__tab')[0].click();
            courseView.get();
          }, err => tip(err.data, 'error'));
      }
    }
  }
});

module.exports = addCourse;
