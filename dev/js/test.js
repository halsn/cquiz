/* globals componentHandler Vue Chart Two Raphael*/
var tip = require('./util').tip;
var render = require('./util').render;
var randomColor = require('./t/randomColor');
var swal = require('./sweetalert');
Vue.use(require('vue-resource'));

function range(s, e) {
  return Array(e - s + 1).fill().map((e, i) => s + i);
}

var Test = new Vue({
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
    showAnalysis: false,
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
    getAnalysis(evt) {
      if (this.showAnalysis) return evt.preventDefault();
      var uuid = window.location.pathname.split('/')[4];
      this.$http.get('/api/analysis', {
          uuid: uuid
        })
        .then(res => {
          swal({
            title: '本次评测获得20积分',
            text: '当前积分为2010'
          }, () => {
            setTimeout(() => {
              swal('恭喜晋级钻石段位', '', 'success');
            }, 500);
          });
          drawCanvas(res.data);
        }, err => tip(err.data, 'error'));
    },
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
          if (err.data === '页面已过期') {
            tip('未提交答案，无法查看', 'error');
          } else tip('网络故障', 'error');
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

function drawCanvas(data) {
  var uuid = window.location.pathname.split('/')[4];
  var thisTest = data.find(e => e.uuid === uuid);
  if (!thisTest.ref_students.every(s => s.isChecked)) {
    tip('教师批改未完成', 'message');
    return;
  }
  Test.showAnalysis = true;
  var thisStu = thisTest.ref_students.find(s => s.no === Test.no);
  var mypieCanvas = document.querySelector('#mypie');
  var totalpieCanvas = document.querySelector('#totalpie');
  var routeCanvas = document.querySelector('#route');
  var mypieLabels = [...new Set(thisStu.ref_quizs.map(q => q.ref_point))];
  var mypieData = mypieLabels.map(lab => thisStu.ref_quizs.filter(q => q.ref_point === lab && !q.isRight).length);
  var mySum = mypieData.reduce((p, a) => p + a);
  mypieData = mypieData.map(d => Math.round(d / mySum * 100));
  var mypieColorList = randomColor({
    luminosity: 'light',
    count: mypieData.length
  });
  var mypieDatasets = [{
    data: mypieData,
    backgroundColor: mypieColorList
  }];
  var refTests = thisTest.ref_students.map(s => s.ref_quizs).reduce((p, a) => p.concat(a));
  var totalpieLabels = mypieLabels;
  var totalpieData = totalpieLabels.map(lab => refTests.filter(q => q.ref_point === lab && !q.isRight).length);
  var totalSum = totalpieData.reduce((p, a) => p + a);
  totalpieData = totalpieData.map(d => Math.round(d / totalSum * 100));
  var totalpieDatasets = [{
    data: totalpieData,
    backgroundColor: mypieColorList
  }];
  var routeData = {
    labels: ["6月8日20时20分", "6月8日20时30分", "6月8日20时40分", "6月8日20时50分", "6月8日21时20分", "6月8日21时20分", "6月8日21时30分"],
    datasets: [{
      label: "我的排名",
      fill: true,
      lineTension: 0.1,
      backgroundColor: "rgba(75,192,192,0.4)",
      borderColor: "rgba(75,192,192,1)",
      borderCapStyle: 'butt',
      borderDash: [],
      borderDashOffset: 0.0,
      borderJoinStyle: 'miter',
      pointBorderColor: "rgba(75,192,192,1)",
      pointBackgroundColor: "#fff",
      pointBorderWidth: 1,
      pointHoverRadius: 5,
      pointHoverBackgroundColor: "rgba(75,192,192,1)",
      pointHoverBorderColor: "rgba(220,220,220,1)",
      pointHoverBorderWidth: 2,
      pointRadius: 3,
      pointHitRadius: 10,
      data: [6, 5, 9, 7, 8, 4, 6]
    }]
  };
  setTimeout(() => {
    drawPyramid();
    var mypie = new Chart(mypieCanvas, {
      type: 'pie',
      data: {
        labels: mypieLabels,
        datasets: mypieDatasets
      }
    });
    var totalpie = new Chart(totalpieCanvas, {
      type: 'pie',
      data: {
        labels: totalpieLabels,
        datasets: totalpieDatasets
      }
    });
    var route = new Chart(routeCanvas, {
      type: 'line',
      data: routeData
    });
  }, 100);
}

function drawPyramid() {
  var elem = document.querySelector('.pyramid');
  var info = document.querySelector('.user-info');
  var w = elem.clientWidth;
  var h = 200;
  var paper = Raphael(elem, w, 280);
  var cw = 340 - 20;
  var ch = h - 30;
  var pcw = cw / 9.5;
  var pch = ch / 6.75;
  var x = elem.clientWidth / 2;
  var y = 20;
  var tri1 = paper.path(`M${x},20L${x+pcw},${y+2*pch}L${x-pcw},${y+2*pch}`);
  var tri2 = paper.path(`M${x+1.25*pcw},${y+2.5*pch}L${x+2.25*pcw},${y+4.5*pch}L${x-2.25*pcw},${y+4.5*pch}L${x-1.25*pcw},${y+2.5*pch}`);
  var tri3 = paper.path(`M${x+2.5*pcw},${y+5*pch}L${x+3.5*pcw},${y+7*pch}L${x-3.5*pcw},${y+7*pch}L${x-2.5*pcw},${y+5*pch}`);
  var tri4 = paper.path(`M${x+3.75*pcw},${y+7.5*pch}L${x+4.75*pcw},${y+9.5*pch}L${x-4.75*pcw},${y+9.5*pch}L${x-3.75*pcw},${y+7.5*pch}`);

  var txt1 = paper.text(x, y + 1.6 * pch, '钻石').attr('stroke', '#eee').scale(1.3, 1.3);
  var txt2 = paper.text(x, y + 3.6 * pch, '黄金').attr('stroke', '#eee').scale(1.3, 1.3);
  var txt3 = paper.text(x, y + 6.0 * pch, '白银').attr('stroke', '#eee').scale(1.3, 1.3);
  var txt4 = paper.text(x, y + 8.5 * pch, '青铜').attr('stroke', '#eee').scale(1.3, 1.3);

  var tris = [tri1, tri2, tri3, tri4];
  var txts = [txt1, txt2, txt3, txt4];

  var tip1 = paper.rect(0, 0, 100, 20, 5).attr('fill', '#10332e').attr('stroke', 'rgba(0, 0, 0, 0)')
  var tip2 = paper.path('M0,5L-5,10L0,15').attr('fill', '#10332e').attr('stroke', 'rgba(0, 0, 0, 0)');
  var tipText = paper.text(50, 10, '').attr('stroke', '#fff');
  var tip = paper.set();
  tip.push(tip1, tip2, tipText);
  tip.hide();
  tip.transform(`t${txts[0].attr('x') + pcw},${txts[0].attr('y') - 0.4 * pch}`);
  tri1.attr('fill', '#33ccff');
  tri1.attr('stroke', 'rgba(0, 0, 0, 0)');
  tri2.attr('fill', '#ff9900');
  tri2.attr('stroke', 'rgba(0, 0, 0, 0)');
  tri3.attr('fill', '#c0c0c0');
  tri3.attr('stroke', 'rgba(0, 0, 0, 0)');
  tri4.attr('fill', '#2d4454');
  tri4.attr('stroke', 'rgba(0, 0, 0, 0)');

  var infos = ['0 ~ 299', '300 ~ 999', '1000 ~ 1999', '2000 ~'].reverse();
  var stus = ['学生1，学生7', '学生3，学生6，学生8，学生9', '学生2，学生4，学生5', '学生10'];
  tris.forEach(e => {
    e.node.style.cursor = 'pointer';
  });
  tris.forEach((e, idx) => {
    e.click(() => {
      tris.forEach(e => e.animate({
        transform: 's1'
      }, 100));
      e.animate({
        transform: 's1.1'
      }, 100);
      info.innerText = stus[idx];
    });
  });
  tris.forEach((el, idx) => {
    el.hover(() => {
      tipText.attr('text', infos[idx]);
      tip.animate({
        transform: `t${txts[idx].attr('x') + pcw},${txts[idx].attr('y') - 0.4 * pch}`
      }, 100, 'ease-in-out');
      tip.show();
    }, () => tip.hide());
  });
}
