/* globals Vue Chart */
//var Vue = require('../vendor/vue.min.js');
var courseView = require('./courseview');
var pubQuiz = require('./pubquiz');
var tip = require('../util').tip;
var render = require('../util').render;
var randomColor = require('../t/randomColor');
Vue.use(require('vue-resource'));

Vue.filter('formatTime', value => {
  if (!value) return '';
  var date = new Date(value);
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日  ${date.getHours()}时:${date.getMinutes()}分`;
});

Vue.filter('formatUnfinish', value => {
  return value.map((v, idx) => `${idx+1} ${v.name}(${v.no})`).join(',  ');
});

Vue.filter('validScore', value => {
  return value > 10 ? 10 : value;
});

Vue.filter('getRightNum', quizs => {
  return quizs.filter(q => q.isRight).length;
});

Vue.filter('getWrongNum', quizs => {
  return quizs.filter(q => !q.isRight).length;
});

Vue.filter('getSum', quizs => {
  var judgeNum = quizs.filter(q => q.genre === '判断题').length;
  var singleNum = quizs.filter(q => q.genre === '单选题').length;
  var multiNum = quizs.filter(q => q.genre === '多选题').length;
  var askNum = quizs.filter(q => q.genre === '问答题').length;
  return judgeNum * 5 + singleNum * 5 + multiNum * 10 + askNum * 10;
});

Vue.filter('getAskScore', quizs => {
  return quizs.filter(q => q.genre === '问答题').map(x => x.score).reduce((p, a) => {
    return p + a;
  }, 0);
});

Vue.filter('getOtherScore', quizs => {
  return quizs.filter(q => q.genre !== '问答题' && q.isRight).map(x => x.score).reduce((p, a) => {
    return p + a;
  }, 0);
});

Vue.filter('getSumScore', quizs => {
  var judgeNum = quizs.filter(q => q.genre === '判断题').length;
  var singleNum = quizs.filter(q => q.genre === '单选题').length;
  var multiNum = quizs.filter(q => q.genre === '多选题').length;
  var askNum = quizs.filter(q => q.genre === '问答题').length;
  var total = judgeNum * 5 + singleNum * 5 + multiNum * 10 + askNum * 10;
  var sum = quizs.map(x => x.score).reduce((p, a) => p + a);
  return Math.round(sum / total * 100);
});

var collect = new Vue({
  el: '#class-tab-5',
  data: {
    showStatus: false,
    showChart: false,
    finishedList: [],
    unfinishList: [],
    classes: [],
    testList: [],
    result: [],
    classId: ''
  },
  computed: {
    qrurl() {
      if (!this.test || !this.testList.length) return '#';
      else return '/api/qr/?url=' + window.location.origin + '/api/t/test/' + this.test.uuid;
    },
    canGetStatus() {
      return this.testList.length;
    },
    showAnalysis() {
      return this.test.ref_students.every(s => s.isChecked || !s.canGetAnswers);
    }
  },
  methods: {
    save(evt, sidx) {
      this.finishedList[sidx].isChecked = true;
      this.unfinishList.forEach(e => e.isChecked = true);
      var data = this.finishedList.concat(this.unfinishList);
      this.$http.put('/api/t/test/' + this.test.uuid, {
          data: data
        })
        .then(res => {
          tip('保存成功', 'success');
        }, err => tip(err.data, 'error'));
    },
    share(evt) {
      if (!this.test || !this.testList.length) return evt.preventDefault();
    },
    analysis(evt) {
      if (this.test.ref_students.every(s => !s.canGetAnswers)) {
        tip('数据不足', 'message');
        return;
      }
      if (!this.showAnalysis) {
        tip('请完成先批改任务', 'message');
        return;
      }
      var canvasParent = document.querySelector('canvas').parentNode;
      var canvas = document.querySelectorAll('canvas');
      canvasParent.removeChild(canvas[0]);
      canvasParent.removeChild(canvas[1]);
      var canvas1 = document.createElement('canvas');
      var canvas2 = document.createElement('canvas');
      var c2 = document.querySelector('.c2');
      canvasParent.insertBefore(canvas1, c2);
      canvasParent.appendChild(canvas2);
      this.showChart = true;
      this.showStatus = false;
      var scoreList = this.test.ref_students.map(s => {
        var judgeNum = s.ref_quizs.filter(q => q.genre === '判断题').length;
        var singleNum = s.ref_quizs.filter(q => q.genre === '单选题').length;
        var multiNum = s.ref_quizs.filter(q => q.genre === '多选题').length;
        var askNum = s.ref_quizs.filter(q => q.genre === '问答题').length;
        var total = judgeNum * 5 + singleNum * 5 + multiNum * 10 + askNum * 10;
        var sum = s.ref_quizs.map(x => x.score).reduce((p, a) => p + a, 0);
        return Math.round(sum / total * 100);
      });
      var ctx1 = document.querySelectorAll('canvas')[0];
      var ctx2 = document.querySelectorAll('canvas')[1];
      var chart1Labels = [];
      var chart2Labels = [];
      var chart1Datasets = [];
      var chart2Datasets = [];
      chart1Labels = ['0-10', '11-20', '21-30', '31-40', '41-50', '51-60', '61-70', '71-80', '81-90', '91-100'];
      chart2Labels = this.test.ref_points;
      var num = chart1Labels.map(lab => {
        var from = Number(lab.split('-')[0]);
        var to = Number(lab.split('-')[1]);
        return scoreList.filter(score => score >= from && score <= to).length;
      });
      var quizSet = this.test.ref_students.map(s => s.ref_quizs).reduce((p, a) => p.concat(a), []);
      var chart2Data = chart2Labels.map(lab => {
        return quizSet.filter(q => q.ref_point === lab && !q.isRight).length;
      });
      var chart2ColorList = randomColor({
        luminosity: 'light',
        count: chart2Data.length
      });
      chart1Datasets = [{
        label: '人数',
        backgroundColor: "rgba(255,99,132,0.2)",
        borderColor: "rgba(255,99,132,1)",
        borderWidth: 1,
        hoverBackgroundColor: "rgba(255,99,132,0.4)",
        hoverBorderColor: "rgba(255,99,132,1)",
        data: num
      }];
      chart2Datasets = [{
        data: chart2Data,
        backgroundColor: chart2ColorList
      }];
      var chart1 = new Chart(ctx1, {
        type: 'bar',
        data: {
          labels: chart1Labels,
          datasets: chart1Datasets
        }
      });
      var chart2 = new Chart(ctx2, {
        type: 'pie',
        data: {
          labels: chart2Labels,
          datasets: chart2Datasets
        }
      });
    },
    clearStatus() {
      this.showStatus = false;
      this.showChart = false;
    },
    getStatus(evt) {
      if (!this.canGetStatus || !this.test) return evt.preventDefault();
      if (new Date(this.test.expireAt) - Date.now() > 0) {
        tip('测试未结束', 'message');
      } else {
        var idx = this.testList.indexOf(this.test);
        this.get(() => {
          this.test = this.testList[idx];
          this.showStatus = true;
          this.showChart = false;
          this.unfinishList = this.test.ref_students.filter(s => !s.canGetAnswers);
          this.finishedList = this.test.ref_students.filter(s => s.canGetAnswers);
          setTimeout(() => render(), 100);
        });
      }
    },
    get(cb) {
      if (!this.classId) return;
      this.showStatus = false;
      this.$http.get('/api/t/test/status', {
          classId: this.classId
        })
        .then(res => {
          this.testList = res.data;
          if (typeof cb === 'function') cb();
        }, err => tip(err.data, 'error'));
    }
  }
});

module.exports = collect;
