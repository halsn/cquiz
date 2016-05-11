/* globals componentHandler Vue */
var tip = require('./util').tip;
var render = require('./util').render;
Vue.use(require('vue-resource'));

function range(s, e) {
  return Array(e - s + 1).fill().map((e, i) => s + i);
}

new Vue({
  el: '#testApp',
  data: {
    no: '',
    charMap: range(0, 25).map(e => String.fromCharCode(e + 65)),
    pass: false,
    miss: false,
    lock: false,
    quizs: [],
    show: [],
    answered: [],
    showAns: false,
    disanswered: [],
    icons: [],
    min: 0,
    sec: 0
  },
  computed: {
    finished() {
      return this.answered.every(e => {
        if (typeof e === 'string') return e.trim() !== '';
        else if (typeof e === 'object') return e.length;
        else return e !== undefined;
      });
    },
    disans() {
      if (!this.finished) return [];
      else {
        return this.answered.map((a, idx) => {
          if (this.quizs[idx].genre === '判断题') {
            return ['错误', '正确'][a];
          } else if (this.quizs[idx].genre === '单选题') {
            return this.charMap[a];
          } else if (this.quizs[idx].genre === '多选题') {
            return a.map(e => this.charMap[e]);
          } else return a;
        }).map((e, x) => `${x+1}.${e.toString()}  `);
      }
    },
    sendans() {
      if (!this.finished) return [];
      else {
        return this.answered.map((a, idx) => {
          if (this.quizs[idx].genre === '判断题') {
            return [
              ['错误', '正确'][a]
            ];
          } else if (this.quizs[idx].genre === '单选题') {
            return [this.quizs[idx].selections[a]];
          } else if (this.quizs[idx].genre === '多选题') {
            return a.map(e => this.quizs[idx].selections[e]);
          } else return [a.trim()];
        });
      }
    }
  },
  methods: {
    paste(evt) {
      return evt.preventDefault();
    },
    pre(evt, qidx) {
      if (qidx === 0) return evt.preventDefault();
      this.show = this.show.map(e => false);
      this.show[qidx - 1] = true;
    },
    next(evt, qidx) {
      if (qidx === this.quizs.length - 1) return evt.preventDefault();
      this.show = this.show.map(e => false);
      this.show[qidx + 1] = true;
    },
    tick() {
      var ticker = setInterval(() => {
        if (this.min === 0 && this.sec === 0) clearInterval(ticker);
        else if (this.sec === 0) {
          this.min -= 1;
          this.sec = 59;
        } else this.sec -= 1;
      }, 1000);
    },
    start(evt) {
      if (!/^\d{1,20}$/.test(this.no)) {
        tip('学号为1至20位数字', 'message');
        return evt.preventDefault();
      }
      var uuid = window.location.pathname.split('/')[4];
      this.$http.get('/api/t/test/' + uuid, {
          no: this.no
        })
        .then(res => {
          var data = res.data;
          if (data.miss) {
            this.miss = true;
            setTimeout(() => {
              this.miss = false;
            }, 3000);
          } else if (!data.showAns) {
            this.pass = true;
            this.quizs = res.data.quizs;
            this.show = this.quizs.map(e => false);
            this.show[0] = true;
            this.answered = Array(this.quizs.length).fill(undefined);
            this.answered = this.answered.map((e, idx) => {
              if (this.quizs[idx].genre === '多选题') return [];
              else return undefined;
            });
            var expireDate = new Date(res.data.expire);
            var nowDate = new Date(res.data.now);
            var left = expireDate.getTime() - nowDate.getTime();
            left = left < 0 ? 0 : left;
            if (left === 0) this.lock = true;
            var leftDate = new Date(left);
            this.min = leftDate.getMinutes();
            this.sec = leftDate.getSeconds();
            this.tick();
            render();
          } else {
            this.pass = true;
            this.quizs = res.data.quizs;
            this.show = this.quizs.map(e => false);
            this.show[0] = true;
            this.lock = true;
            this.showAns = true;
            this.disanswered = this.quizs.map(q => {
              if (q.genre === '单选题' || q.genre === '多选题') {
                return q.answered.map(e => this.charMap[q.selections.indexOf(e)]).sort();
              } else return q.answered;
            });
            this.icons = this.quizs.map(q => q.isRight);
            render();
          }
        }, err => {
          if (err.data === '页面已过期') this.lock = true;
          else tip('网络故障', 'error');
        });
    },
    send(evt) {
      if (!this.finished) return evt.preventDefault();
      var uuid = window.location.pathname.split('/')[4];
      this.$http.put('/api/t/test/' + uuid, {
          no: this.no,
          answered: this.sendans
        })
        .then(res => {
          if (res.data.timeout) this.lock = true;
          else {
            this.start();
          }
        }, err => tip('网络故障', 'error'));
    }
  }
});
