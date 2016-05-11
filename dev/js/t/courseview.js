/* globals MaterialButton Vue */
//var Vue = require('../vendor/vue.min.js');
var tip = require('../util').tip;
var renderButton = require('../util').renderButton;
var addQuiz = require('./addquiz');
var quizView = require('./quizview');
var addClass = require('./addclass');
var classView = require('./classview');
Vue.use(require('vue-resource'));

Vue.filter('validChapter', value => {
  if (!value) return '新章节';
  return value.slice(0, 28);
});
Vue.filter('validTag', value => {
  if (!value) return '';
  return value.slice(0, 16);
});
var courseView = new Vue({
  el: '#course-tab-1',
  data: {
    cards: []
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
    editChapter(evt) {
      var t = evt.target;
      var p = evt.target.parentNode;
      var ctx = p.querySelector('.editable');
      var input = p.querySelector('.editInput');
      if (t === ctx) {
        t.style.display = 'none';
        input.style.display = 'inline';
        window.setTimeout(() => {
          p.querySelector('.editInput').focus();
        }, 300);
      } else {
        t.style.display = 'none';
        ctx.style.display = 'inline';
      }
    },
    addChapter(cardIdx) {
      var chapter = {
        title: '新章节' + this.cards[cardIdx].chapters.length,
        tags: []
      };
      this.cards[cardIdx].chapters.push(chapter);
      renderButton('#course-tab-1');
    },
    removeChapter(chapidx, cardIdx) {
      this.cards[cardIdx].chapters.splice(chapidx, 1);
    },
    save(cardIdx, evt) {
      var data = this.cards[cardIdx];
      if (new Set(data.chapters.map(e => e.title)).size !== data.chapters.length) {
        tip('章节名不能重复', 'error');
        return evt.preventDefault();
      }
      this.$http.put('/api/t/course', data)
        .then(res => {
          tip('保存成功', 'success');
          addQuiz.courses = this.cards;
          quizView.courses = this.cards;
          quizView.quizs = [];
          addClass.courses = this.cards;
          classView.get();
        }, error => tip(error.data, 'error'));
    },
    del(cardIdx) {
      var id = {};
      id._id = this.cards[cardIdx]._id;
      this.$http.delete('/api/t/course', id)
        .then(res => {
          tip('删除成功', 'success');
          this.cards.splice(cardIdx, 1);
          addQuiz.courses = this.cards;
          quizView.courses = this.cards;
          addClass.courses = this.cards;
          addClass.courses = this.cards;
          classView.get();
        }, error => tip(error.data, 'error'));
    },
    get() {
      this.$http.get('/api/t/course')
        .then(res => {
          this.cards = res.data;
          renderButton('#course-tab-1');
          addQuiz.courses = this.cards;
          quizView.courses = this.cards;
          addClass.courses = this.cards;
        }, error => tip(error.data, 'error'));
    }
  },
  ready() {
    this.$http.get('/api/t/course')
      .then(res => {
        this.cards = res.data;
        renderButton('#course-tab-1');
        addQuiz.courses = this.cards;
        quizView.courses = this.cards;
        addClass.courses = this.cards;
      }, error => tip(error.data, 'error'));
  }
});

window.courseView = courseView;

module.exports = courseView;
