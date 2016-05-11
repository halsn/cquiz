/* globals Vue */
//var Vue = require('../vendor/vue.min.js');
var tip = require('../util').tip;
var classView = require('./classview');
Vue.use(require('vue-resource'));
Vue.filter('validName', value => {
  return value.slice(0, 48);
});

var addClass = new Vue({
  el: '#class-tab-2',
  data: {
    courses: [],
    className: '',
    course: {}
  },
  methods: {
    addClass(evt) {
      if (!this.course || !this.className || this.className.length > 48) return evt.preventDefault();
      var preAdd = {};
      preAdd.ref_course = this.course._id;
      preAdd.class_name = this.course.name + '-' + this.course.term + '-' + this.className;
      this.$http.post('/api/t/class', preAdd)
        .then(res => {
          this.className = '';
          this.course = {};
          var tabs = document.querySelectorAll('.mdl-layout__tab');
          tabs[2].click();
          classView.get();
          tip('添加成功，录入学生后即可发布测试', 'success');
        }, err => tip(err.data, 'error'));
    }
  }
});

module.exports = addClass;
