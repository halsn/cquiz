/* globals MaterialButton Vue */
//var Vue = require('../vendor/vue.min.js');
var addStudents = require('./addstudents');
var pubQuiz = require('./pubquiz');
var testView = require('./testview');
var tip = require('../util').tip;
Vue.use(require('vue-resource'));

var classView = new Vue({
  el: '#class-tab-1',
  data: {
    classes: []
  },
  methods: {
    toggleCard(evt) {
      var target = evt.target;
      // target is different in chrome and firefox
      if (target.nodeName === 'I') target = target.parentNode;
      var card = target.parentNode.parentNode;
      var bodys = card.querySelectorAll('.body');
      var fullText = card.querySelector('.full-text');
      if (fullText.innerText === 'fullscreen_exit') fullText.innerText = 'fullscreen';
      else fullText.innerText = 'fullscreen_exit';
      [].forEach.call(bodys, el => {
        if (!el.style.display || el.style.display === 'none') el.style.display = 'block';
        else el.style.display = 'none';
      });
    },
    get() {
      this.$http.get('/api/t/class')
        .then(res => {
          this.classes = res.data;
          addStudents.classes = this.classes;
          pubQuiz.classes = this.classes;
          pubQuiz.get();
          testView.classes = this.classes;
          testView.get();
        }, err => tip(err.data, 'error'));
    },
    del(idx) {
      this.$http.delete('/api/t/class', this.classes[idx])
        .then(res => {
          this.classes.splice(idx, 1);
          addStudents.classes = this.classes;
          pubQuiz.classes = this.classes;
          pubQuiz.get();
          testView.classes = this.classes;
          testView.get();
          tip('删除成功', 'success');
        }, err => tip(err.data, 'error'));
    }
  },
  ready() {
    this.get();
  }
});

module.exports = classView;
