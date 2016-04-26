(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

/* globals Vue */
//var Vue = require('../vendor/vue.min.js');
var tip = require('../util').tip;
var classView = require('./classview');
Vue.use(require('vue-resource'));
Vue.filter('validName', function (value) {
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
    addClass: function addClass(evt) {
      var _this = this;

      if (!this.course || !this.className || this.className.length > 48) return evt.preventDefault();
      var preAdd = {};
      preAdd.ref_course = this.course._id;
      preAdd.class_name = this.course.name + '-' + this.course.term + '-' + this.className;
      this.$http.post('/api/t/class', preAdd).then(function (res) {
        _this.className = '';
        _this.course = {};
        var tabs = document.querySelectorAll('.mdl-layout__tab');
        tabs[2].click();
        classView.get();
        tip('添加成功，录入学生后即可发布测试', 'success');
      }, function (err) {
        return tip('添加失败', 'error');
      });
    }
  }
});

module.exports = addClass;

},{"../util":12,"./classview":5,"vue-resource":26}],2:[function(require,module,exports){
'use strict';

/* globals Vue */
//var Vue = require('../vendor/vue.min.js');
var tip = require('../util').tip;
var courseView = require('./courseview');
Vue.use(require('vue-resource'));

Vue.filter('validName', function (value) {
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
    add: function add(evt) {
      var _this = this;

      if (!this.course.name) evt.preventDefault();else {
        this.$http.post('/api/t/course', this.course).then(function (res) {
          tip('添加成功，请在设置章节后录入习题', 'success');
          _this.course.name = '';
          _this.course.duration = 32;
          document.querySelectorAll('.mdl-layout__tab')[0].click();
          courseView.get();
        }, function (err) {
          tip('添加失败', 'error');
        });
      }
    }
  }
});

module.exports = addCourse;

},{"../util":12,"./courseview":6,"vue-resource":26}],3:[function(require,module,exports){
'use strict';

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
    idx: function idx() {
      for (var i = 0, l = this.courses.length; i < l; i++) {
        if (this.courses[i]._id === this.course._id) return i;
      }
      return -1;
    }
  },
  methods: {
    save: function save(evt) {
      var _this = this;

      if (!this.course._id || !this.jsonData.length) return evt.preventDefault();
      var quizs = [];
      var qset = {};
      this.jsonData.forEach(function (el) {
        var q = {};
        q.genre = el.类型;
        q.describe = {};
        q.describe.content = el.题目;
        q.ref_point = el.知识点;
        q.answers = [el.参考答案];
        if (q.genre === '单选题' || q.genre === '多选题') {
          var secs = el.选项.split(';');
          q.selections = secs.map(function (el) {
            return el.trim().slice(2);
          });
          q.answers = el.参考答案.split('').map(function (el) {
            return secs.filter(function (sec) {
              return sec.indexOf(el) === 0;
            }).join('').slice(2).trim();
          });
        }
        quizs.push(q);
      });
      qset.quizs = quizs;
      qset.ref_course = this.course._id;
      qset.ref_chapter = this.course.chapter;
      this.$http.post('/api/t/qset', qset).then(function (res) {
        tip('录入成功', 'success');
        _this.course = {};
        _this.jsonData = [];
        window.courseView.get();
        classView.get();
      }, function (err) {
        tip(err.data, 'error');
      });
    },
    read: function read(evt, idx) {
      var _this2 = this;

      if (!this.course._id || !this.course.chapter) return evt.preventDefault();
      var course = this.courses.filter(function (course) {
        return course._id === _this2.course._id;
      })[0];
      var chapter = course.chapters.filter(function (chap) {
        return chap.title === _this2.course.chapter;
      })[0] || {};
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
        addQuiz.jsonData = sheetData.filter(function (el) {
          if (contentList.indexOf(el.题目) !== -1) return false;else if (!el.知识点) return false;else if (el.类型 === '问答题') {
            el.选项 = '';
            contentList.push(el.题目.trim());
            return !!(el.题目 && el.参考答案);
          } else if (el.类型 === '判断题') {
            contentList.push(el.题目.trim());
            if (!el.参考答案) return false;else if (el.参考答案 === '正确' || el.参考答案 === '错误') return true;
            return false;
          } else if (el.类型 === '单选题' || el.类型 === '多选题') {
            contentList.push(el.题目.trim());
            if (!el.选项) return false;
            var selection = el.选项.split(/\;|\n/).map(function (s) {
              return s.trim().replace(/\&\#10/g, '');
            }).filter(function (el) {
              return (/^[A-Z]\.[^\.]/.test(el) && el.match(/[A-Z]\./g).length === 1
              );
            });
            if (selection.length < 2) return false;
            el.选项 = selection.join(';');
            var pre = !!(el.题目 && el.参考答案);
            if (pre) return (/^[A-Z]+$/.test(el.参考答案) && el.参考答案.split('').length <= selection.length
            );
            return pre;
          } else return false;
        });
      };
      if (!file) return null;else reader.readAsBinaryString(file);
    }
  }
});

module.exports = addQuiz;

},{"../util":12,"./classview":5,"./courseview":6,"vue-resource":26}],4:[function(require,module,exports){
'use strict';

/* globals Vue XLSX */
var tip = require('../util').tip;
Vue.use(require('vue-resource'));

var addStudents = new Vue({
  el: '#class-tab-3',
  data: {
    classes: [],
    Class: {},
    jsonData: []
  },
  methods: {
    read: function read(evt) {
      if (!this.Class._id) return evt.preventDefault();
      var file = evt.target.files[0];
      var reader = new FileReader();
      reader.onload = function (evt) {
        var data = evt.target.result;
        var workbook = XLSX.read(data, {
          type: 'binary'
        });
        var first_sheet_name = workbook.SheetNames[0];
        var first_sheet = workbook.Sheets[first_sheet_name];
        addStudents.jsonData = XLSX.utils.sheet_to_json(first_sheet).filter(function (el) {
          if (!el.姓名 || !el.学号 || !el.专业 || !el.班级) return false;
          return true;
        });
      };
      if (!file) return null;else reader.readAsBinaryString(file);
    },
    save: function save(evt) {
      var _this = this;

      if (!this.Class._id || !this.jsonData.length) return evt.preventDefault();
      this.Class.ref_students = this.jsonData.map(function (el) {
        return {
          name: el.姓名,
          no: el.学号,
          spercialty: el.专业,
          className: el.班级
        };
      });
      this.$http.put('/api/t/class', this.Class).then(function (res) {
        tip('录入成功', 'success');
        _this.jsonData = [];
        _this.Class = {};
        var tabs = document.querySelectorAll('.mdl-layout__tab');
        tabs[3].click();
      }, function (err) {
        return tip('网络故障', 'error');
      });
    }
  }
});

module.exports = addStudents;

},{"../util":12,"vue-resource":26}],5:[function(require,module,exports){
'use strict';

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
    toggleCard: function toggleCard(evt) {
      var target = evt.target;
      // target is different in chrome and firefox
      if (target.nodeName === 'I') target = target.parentNode;
      var card = target.parentNode.parentNode;
      var bodys = card.querySelectorAll('.body');
      var fullText = card.querySelector('.full-text');
      if (fullText.innerText === 'fullscreen_exit') fullText.innerText = 'fullscreen';else fullText.innerText = 'fullscreen_exit';
      [].forEach.call(bodys, function (el) {
        if (!el.style.display || el.style.display === 'none') el.style.display = 'block';else el.style.display = 'none';
      });
    },
    get: function get() {
      var _this = this;

      this.$http.get('/api/t/class').then(function (res) {
        _this.classes = res.data;
        addStudents.classes = _this.classes;
        pubQuiz.classes = _this.classes;
        pubQuiz.get();
        testView.classes = _this.classes;
        testView.get();
      }, function (err) {
        return tip('网络故障' + err.toString(), 'error');
      });
    },
    del: function del(idx) {
      var _this2 = this;

      this.$http.delete('/api/t/class', this.classes[idx]).then(function (res) {
        _this2.classes.splice(idx, 1);
        addStudents.classes = _this2.classes;
        pubQuiz.classes = _this2.classes;
        pubQuiz.get();
        testView.classes = _this2.classes;
        testView.get();
        tip('删除成功', 'success');
      }, function (err) {
        return tip('网络故障', 'error');
      });
    }
  },
  ready: function ready() {
    this.get();
  }
});

module.exports = classView;

},{"../util":12,"./addstudents":4,"./pubquiz":8,"./testview":10,"vue-resource":26}],6:[function(require,module,exports){
'use strict';

/* globals MaterialButton Vue */
//var Vue = require('../vendor/vue.min.js');
var tip = require('../util').tip;
var renderButton = require('../util').renderButton;
var addQuiz = require('./addquiz');
var quizView = require('./quizview');
var addClass = require('./addclass');
var classView = require('./classview');
Vue.use(require('vue-resource'));

Vue.filter('validChapter', function (value) {
  if (!value) return '新章节';
  return value.slice(0, 28);
});
Vue.filter('validTag', function (value) {
  if (!value) return '';
  return value.slice(0, 16);
});
var courseView = new Vue({
  el: '#course-tab-1',
  data: {
    cards: []
  },
  methods: {
    toggleCard: function toggleCard(evt) {
      var target = evt.target;
      // target is different in chrome and firefox
      if (target.nodeName === 'I') target = target.parentNode;
      var card = target.parentNode.parentNode;
      var bodys = card.querySelectorAll('.body');
      var fullText = card.querySelector('.full-text');
      if (fullText.innerText === 'fullscreen_exit') fullText.innerText = 'fullscreen';else fullText.innerText = 'fullscreen_exit';
      [].forEach.call(bodys, function (el) {
        if (!el.style.display || el.style.display === 'none') el.style.display = 'block';else el.style.display = 'none';
      });
    },
    editChapter: function editChapter(evt) {
      var t = evt.target;
      var p = evt.target.parentNode;
      var ctx = p.querySelector('.editable');
      var input = p.querySelector('.editInput');
      if (t === ctx) {
        t.style.display = 'none';
        input.style.display = 'inline';
        window.setTimeout(function () {
          p.querySelector('.editInput').focus();
        }, 300);
      } else {
        t.style.display = 'none';
        ctx.style.display = 'inline';
      }
    },
    addChapter: function addChapter(cardIdx) {
      var chapter = {
        title: '新章节' + this.cards[cardIdx].chapters.length,
        tags: []
      };
      this.cards[cardIdx].chapters.push(chapter);
      renderButton('#course-tab-1');
    },
    removeChapter: function removeChapter(chapidx, cardIdx) {
      this.cards[cardIdx].chapters.splice(chapidx, 1);
    },
    save: function save(cardIdx, evt) {
      var _this = this;

      var data = this.cards[cardIdx];
      if (new Set(data.chapters.map(function (e) {
        return e.title;
      })).size !== data.chapters.length) {
        tip('章节名不能重复', 'error');
        return evt.preventDefault();
      }
      this.$http.put('/api/t/course', data).then(function (res) {
        tip('保存成功', 'success');
        addQuiz.courses = _this.cards;
        quizView.courses = _this.cards;
        quizView.quizs = [];
        addClass.courses = _this.cards;
        classView.get();
      }, function (error) {
        return tip('保存失败', 'error');
      });
    },
    del: function del(cardIdx) {
      var _this2 = this;

      var id = {};
      id._id = this.cards[cardIdx]._id;
      this.$http.delete('/api/t/course', id).then(function (res) {
        tip('删除成功', 'success');
        _this2.cards.splice(cardIdx, 1);
        addQuiz.courses = _this2.cards;
        quizView.courses = _this2.cards;
        addClass.courses = _this2.cards;
        addClass.courses = _this2.cards;
        classView.get();
      }, function (error) {
        return tip('删除失败', 'error');
      });
    },
    get: function get() {
      var _this3 = this;

      this.$http.get('/api/t/course').then(function (res) {
        _this3.cards = res.data;
        renderButton('#course-tab-1');
        addQuiz.courses = _this3.cards;
        quizView.courses = _this3.cards;
        addClass.courses = _this3.cards;
      }, function (error) {
        return tip('网络故障', 'error');
      });
    }
  },
  ready: function ready() {
    var _this4 = this;

    this.$http.get('/api/t/course').then(function (res) {
      _this4.cards = res.data;
      renderButton('#course-tab-1');
      addQuiz.courses = _this4.cards;
      quizView.courses = _this4.cards;
      addClass.courses = _this4.cards;
    }, function (error) {
      return tip('网络故障', 'error');
    });
  }
});

window.courseView = courseView;

module.exports = courseView;

},{"../util":12,"./addclass":1,"./addquiz":3,"./classview":5,"./quizview":9,"vue-resource":26}],7:[function(require,module,exports){
'use strict';

/* globals MaterialLayoutTab, MaterialLayout, MaterialTabs, MaterialTab, MaterialRipple */
/* globals Vue */
var renderTabs = require('../util').renderTabs;
var courseView = require('./courseview');
var addCourse = require('./addcourse');
var classView = require('./classview');
var collect = require('./testview');
var info = require('./updateinfo');

var layout = document.querySelector('.mdl-js-layout');
var panels = document.querySelectorAll('.mdl-layout__tab-panel');

var courseTabs = [{
  url: '#course-tab-1',
  title: '查看课程'
}, {
  url: '#course-tab-2',
  title: '添加课程'
}, {
  url: '#course-tab-3',
  title: '录入习题'
}, {
  url: '#course-tab-4',
  title: '查看习题'
}];
var classTabs = [{
  url: '#class-tab-1',
  title: '查看班次'
}, {
  url: '#class-tab-2',
  title: '添加班次'
}, {
  url: '#class-tab-3',
  title: '录入学生'
}, {
  url: '#class-tab-4',
  title: '发布测试'
}, {
  url: '#class-tab-5',
  title: '查看测试'
}];
var myInfo = [{
  url: '#info-tab-1',
  title: '更新信息'
}];

var app = new Vue({
  el: '#app',
  data: {
    tabs: courseTabs
  },
  methods: {
    setCourseTabs: function setCourseTabs(evt) {
      this.tabs = courseTabs;
      renderTabs(panels, layout);
    },
    setClassTabs: function setClassTabs(evt) {
      this.tabs = classTabs;
      renderTabs(panels, layout);
    },
    setInfoTabs: function setInfoTabs(evt) {
      this.tabs = myInfo;
      renderTabs(panels, layout);
    }
  },
  ready: function ready() {
    window.setTimeout(function () {
      document.querySelectorAll('.mdl-layout__tab')[0].click();
      /* 删除tab-bar-left-button */
      var tabBarLeftBtn = document.querySelector('.mdl-layout__tab-bar-left-button');
      var tabBarRightBtn = document.querySelector('.mdl-layout__tab-bar-right-button');
      if (tabBarLeftBtn && tabBarRightBtn) {
        var tabBarParent = tabBarLeftBtn.parentNode;
        tabBarParent.removeChild(tabBarLeftBtn);
        tabBarParent.removeChild(tabBarRightBtn);
      }
      var selects = document.querySelectorAll('select');
      [].forEach.call(selects, function (el) {
        return el.value = null;
      });
    }, 1000);
  }
});

},{"../util":12,"./addcourse":2,"./classview":5,"./courseview":6,"./testview":10,"./updateinfo":11}],8:[function(require,module,exports){
'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

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
    studentNum: function studentNum() {
      if (!Object.keys(this.Class).length) return 0;else return this.Class.ref_students.length;
    },
    expireNum: function expireNum() {
      return this.judgeNum + this.singleNum + this.multiNum + this.askNum;
    }
  },
  methods: {
    getNum: function getNum(evt) {
      var _this = this;

      if (['INPUT', 'SPAN'].indexOf(evt.target.nodeName) === -1) return evt.preventDefault();
      setTimeout(function () {
        var table = document.querySelector('.point-table');
        var selected = table.querySelectorAll('.is-selected');
        _this.quizNum = 0;
        _this.judgeNum = 0;
        _this.singleNum = 0;
        _this.multiNum = 0;
        _this.askNum = 0;
        _this.pointList = [];
        var uppers = document.querySelectorAll('#class-tab-4 .mdl-slider__background-upper');
        var lowers = document.querySelectorAll('#class-tab-4 .mdl-slider__background-lower');
        [].concat(_toConsumableArray(uppers)).forEach(function (up, idx) {
          if (idx > 0) up.style.flex = '1';
        });
        [].concat(_toConsumableArray(lowers)).forEach(function (lo, idx) {
          if (idx > 0) lo.style.flex = '0';
        });
        [].concat(_toConsumableArray(selected)).forEach(function (el) {
          _this.quizNum += Number(el.childNodes[3].textContent || el.childNodes[3].innerText);
          _this.pointList.push(el.childNodes[2].textContent || el.childNodes[2].innerText);
        });
        var sets = _this.qsets.filter(function (qset) {
          return _this.chapterList.indexOf(qset.ref_chapter) !== -1;
        });
        var quizs = [];
        sets.forEach(function (set) {
          var _quizs;

          (_quizs = quizs).splice.apply(_quizs, [quizs.length, 0].concat(_toConsumableArray(set.quizs)));
        });
        quizs = quizs.filter(function (q) {
          return _this.pointList.indexOf(q.ref_point) !== -1;
        });
        _this.maxjudgeNum = quizs.filter(function (q) {
          return q.genre === '判断题';
        }).length;
        _this.maxsingleNum = quizs.filter(function (q) {
          return q.genre === '单选题';
        }).length;
        _this.maxmultiNum = quizs.filter(function (q) {
          return q.genre === '多选题';
        }).length;
        _this.maxaskNum = quizs.filter(function (q) {
          return q.genre === '问答题';
        }).length;
      }, 100);
    },
    getPoint: function getPoint(evt) {
      var _this2 = this;

      if (['INPUT', 'SPAN'].indexOf(evt.target.nodeName) === -1) return evt.preventDefault();
      setTimeout(function () {
        var table = document.querySelector('.pub-table');
        var selected = table.querySelectorAll('.is-selected');
        _this2.quizNum = 0;
        _this2.singleNum = 0;
        _this2.multiNum = 0;
        _this2.askNum = 0;
        _this2.judgeNum = 0;
        _this2.maxsingleNum = 0;
        _this2.maxmultiNum = 0;
        _this2.maxjudgeNum = 0;
        _this2.maxaskNum = 0;
        _this2.chapterList = [];
        _this2.pointList = [];
        var uppers = document.querySelectorAll('#class-tab-4 .mdl-slider__background-upper');
        var lowers = document.querySelectorAll('#class-tab-4 .mdl-slider__background-lower');
        [].concat(_toConsumableArray(uppers)).forEach(function (up, idx) {
          if (idx > 0) up.style.flex = '1';
        });
        [].concat(_toConsumableArray(lowers)).forEach(function (lo, idx) {
          if (idx > 0) lo.style.flex = '0';
        });
        [].forEach.call(selected, function (el) {
          _this2.chapterList.push(el.childNodes[2].textContent || el.childNodes[2].innerText);
        });
        var sets = _this2.qsets.filter(function (qset) {
          return _this2.chapterList.indexOf(qset.ref_chapter) !== -1;
        });
        if (!sets.length) _this2.points = [];else {
          var prePoints = [];
          var quizs = [];
          sets.forEach(function (set) {
            var _prePoints;

            var titles = set.quizs.map(function (q) {
              return q.ref_point;
            });
            (_prePoints = prePoints).splice.apply(_prePoints, [prePoints.length, 0].concat(_toConsumableArray(titles)));
            quizs.splice.apply(quizs, [quizs.length, 0].concat(_toConsumableArray(titles)));
          });
          prePoints = [].concat(_toConsumableArray(new Set(prePoints))).map(function (q) {
            var num = quizs.filter(function (e) {
              return e === q;
            }).length;
            return {
              title: q,
              totalNum: num
            };
          });
          _this2.points = prePoints;
        }
        renderPointTable(document.querySelector('.point-table'));
      }, 100);
    },
    get: function get() {
      var _this3 = this;

      if (!this.Class._id) return;
      var qset = {};
      qset.ref_course = this.Class.ref_course;
      this.$http.get('/api/t/qset', qset).then(function (res) {
        _this3.qsets = res.data;
        _this3.quizNum = 0;
        renderTable(document.querySelector('.pub-table'));
      }, function (err) {
        return tip('网络故障', 'error');
      });
    },
    pub: function pub(evt) {
      var _this4 = this;

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
      this.$http.post('/api/t/test', data).then(function (res) {
        _this4.Class = {};
        _this4.qsets = [];
        _this4.duration = 10;
        _this4.quizNum = 0;
        _this4.expireNum = 0;
        _this4.judgeNum = 0;
        _this4.singleNum = 0;
        _this4.multiNum = 0;
        _this4.askNum = 0;
        _this4.maxjudgeNum = 0;
        _this4.maxsingleNum = 0;
        _this4.maxmultiNum = 0;
        _this4.maxaskNum = 0;
        _this4.chapterList = [];
        _this4.pointList = [];
        _this4.points = [];
        tip('发布成功', 'success');
        var uppers = document.querySelectorAll('#class-tab-4 .mdl-slider__background-upper');
        var lowers = document.querySelectorAll('#class-tab-4 .mdl-slider__background-lower');
        [].concat(_toConsumableArray(uppers)).forEach(function (up, idx) {
          if (idx > 0) up.style.flex = '1';
        });
        [].concat(_toConsumableArray(lowers)).forEach(function (lo, idx) {
          if (idx > 0) lo.style.flex = '0';
        });
        testView.get();
      }, function (err) {
        return tip('网络故障', 'error');
      });
    }
  }
});

module.exports = pubQuiz;

},{"../util":12,"./classview":5,"./testview":10,"vue-resource":26}],9:[function(require,module,exports){
'use strict';

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
    idx: function idx() {
      for (var i = 0, l = this.courses.length; i < l; i++) {
        if (this.courses[i]._id === this.course._id) return i;
      }
      return -1;
    }
  },
  methods: {
    clear: function clear() {
      this.quizs = [];
    },
    get: function get(evt) {
      var _this = this;

      if (!this.course._id || !this.course.chapter) return evt.preventDefault();
      var qset = {};
      qset.ref_course = this.course._id;
      qset.ref_chapter = this.course.chapter;
      this.$http.get('/api/t/qset', qset).then(function (res) {
        if (!res.data) {
          tip('未录入习题', 'message');
          _this.quizs = [];
        } else _this.quizs = res.data;
      }, function (err) {
        return tip('网络故障', 'error');
      });
    },
    del: function del(evt) {
      var _this2 = this;

      if (!this.course._id || !this.course.chapter || !this.quizs.length) return evt.preventDefault();
      var qset = {};
      qset.ref_course = this.course._id;
      qset.ref_chapter = this.course.chapter;
      this.$http.delete('/api/t/qset', qset).then(function (res) {
        tip('删除成功', 'success');
        _this2.quizs = [];
        window.courseView.get();
        pubQuiz.get();
      }, function (err) {
        return tip(err.data, 'error');
      });
    }
  }
});

module.exports = quizView;

},{"../util":12,"./courseview":6,"./pubquiz":8,"vue-resource":26}],10:[function(require,module,exports){
'use strict';

/* globals Vue */
//var Vue = require('../vendor/vue.min.js');
var courseView = require('./courseview');
var pubQuiz = require('./pubquiz');
var tip = require('../util').tip;
var render = require('../util').render;
Vue.use(require('vue-resource'));

Vue.filter('formatTime', function (value) {
  if (!value) return '';
  var date = new Date(value);
  return date.getFullYear() + '年' + (date.getMonth() + 1) + '月' + date.getDate() + '日  ' + date.getHours() + '时:' + date.getMinutes() + '分';
});

Vue.filter('formatUnfinish', function (value) {
  return value.map(function (v, idx) {
    return idx + 1 + ' ' + v.name + '(' + v.no + ')';
  }).join(',  ');
});

Vue.filter('validScore', function (value) {
  return value > 10 ? 10 : value;
});

Vue.filter('getRightNum', function (quizs) {
  return quizs.filter(function (q) {
    return q.isRight;
  }).length;
});

Vue.filter('getWrongNum', function (quizs) {
  return quizs.filter(function (q) {
    return !q.isRight;
  }).length;
});

Vue.filter('getSum', function (quizs) {
  var judgeNum = quizs.filter(function (q) {
    return q.genre === '判断题';
  }).length;
  var singleNum = quizs.filter(function (q) {
    return q.genre === '单选题';
  }).length;
  var multiNum = quizs.filter(function (q) {
    return q.genre === '多选题';
  }).length;
  var askNum = quizs.filter(function (q) {
    return q.genre === '问答题';
  }).length;
  return judgeNum * 5 + singleNum * 5 + multiNum * 10 + askNum * 10;
});

Vue.filter('getAskScore', function (quizs) {
  return quizs.filter(function (q) {
    return q.genre === '问答题';
  }).map(function (x) {
    return x.score;
  }).reduce(function (p, a) {
    return p + a;
  }, 0);
});

Vue.filter('getOtherScore', function (quizs) {
  return quizs.filter(function (q) {
    return q.genre !== '问答题' && q.isRight;
  }).map(function (x) {
    return x.score;
  }).reduce(function (p, a) {
    return p + a;
  }, 0);
});

Vue.filter('getSumScore', function (quizs) {
  var judgeNum = quizs.filter(function (q) {
    return q.genre === '判断题';
  }).length;
  var singleNum = quizs.filter(function (q) {
    return q.genre === '单选题';
  }).length;
  var multiNum = quizs.filter(function (q) {
    return q.genre === '多选题';
  }).length;
  var askNum = quizs.filter(function (q) {
    return q.genre === '问答题';
  }).length;
  var total = judgeNum * 5 + singleNum * 5 + multiNum * 10 + askNum * 10;
  var sum = quizs.map(function (x) {
    return x.score;
  }).reduce(function (p, a) {
    return p + a;
  });
  return Math.round(sum / total * 100);
});

var collect = new Vue({
  el: '#class-tab-5',
  data: {
    showStatus: false,
    finishedList: [],
    unfinishList: [],
    classes: [],
    testList: [],
    result: [],
    classId: ''
  },
  computed: {
    qrurl: function qrurl() {
      if (!this.test || !this.testList.length) return '#';else return '/api/qr/?url=' + window.location.origin + '/api/t/test/' + this.test.uuid;
    },
    canGetStatus: function canGetStatus() {
      return this.testList.length;
    },
    showAnalysis: function showAnalysis() {
      return this.test.ref_students.every(function (s) {
        return s.isChecked;
      });
    }
  },
  methods: {
    save: function save(evt, sidx) {
      this.finishedList[sidx].isChecked = true;
      this.unfinishList.forEach(function (e) {
        return e.isChecked = true;
      });
      var data = this.finishedList.concat(this.unfinishList);
      this.$http.put('/api/t/test/' + this.test.uuid, {
        data: data
      }).then(function (res) {
        tip('保存成功', 'success');
      }, function (err) {
        tip('网络故障', 'error');
      });
    },
    share: function share(evt) {
      if (!this.test || !this.testList.length) return evt.preventDefault();
    },
    analysis: function analysis(evt) {
      if (!this.showAnalysis) {
        tip('请完成先批改任务', 'message');
      } else {
        tip('待完成', 'message');
      }
    },
    clearStatus: function clearStatus() {
      this.showStatus = false;
    },
    getStatus: function getStatus(evt) {
      if (!this.canGetStatus || !this.test) return evt.preventDefault();
      if (new Date(this.test.expireAt) - Date.now() > 0) {
        tip('测试未结束', 'message');
      } else {
        this.showStatus = true;
        this.unfinishList = this.test.ref_students.filter(function (s) {
          return !s.canGetAnswers;
        });
        this.finishedList = this.test.ref_students.filter(function (s) {
          return s.canGetAnswers;
        });
        render();
      }
    },
    get: function get() {
      var _this = this;

      if (!this.classId) return;
      this.showStatus = false;
      this.$http.get('/api/t/test/status', {
        classId: this.classId
      }).then(function (res) {
        _this.testList = res.data;
      }, function (err) {
        tip('网络故障', 'error');
      });
    }
  }
});

module.exports = collect;

},{"../util":12,"./courseview":6,"./pubquiz":8,"vue-resource":26}],11:[function(require,module,exports){
/* globals Vue */
'use strict';

var tip = require('../util').tip;
Vue.use(require('vue-resource'));

var info = new Vue({
  el: '#info-tab-1',
  data: {
    originPass: '',
    newPass: '',
    cknPass: ''
  },
  computed: {},
  methods: {
    save: function save(evt) {
      var _this = this;

      if (!/^[0-9A-Za-z\_]{6,30}$/.test(this.newPass)) {
        tip('新密码由数字，字母，下划线组成，至少6个字符', 'message');
        return evt.preventDefault();
      }
      if (this.newPass !== this.cknPass) {
        tip('确认密码与新密码不一致', 'message');
        return evt.preventDefault();
      }
      var data = {};
      data.originPass = this.originPass;
      data.newPass = this.newPass;
      data.cknPass = this.cknPass;
      this.$http.put('/api/t', data).then(function (res) {
        tip('修改成功', 'success');
        _this.originPass = '';
        _this.newPass = '';
        _this.cknPass = '';
      }, function (err) {
        tip(err.data, 'error');
      });
    }
  }
});

module.exports = info;

},{"../util":12,"vue-resource":26}],12:[function(require,module,exports){
'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/* globals MaterialLayoutTab, MaterialLayout, MaterialTabs, MaterialTab, MaterialRipple, MaterialDataTable, MaterialButton, MaterialCheckbox, MaterialRadio, MaterialTextfield, componentHandler */

function renderTabs(panels, layout) {
  window.setTimeout(function () {
    var tabs = document.querySelectorAll('.mdl-layout__tab');
    [].forEach.call(tabs, function (el) {
      new MaterialLayoutTab(el, tabs, panels, layout.MaterialLayout);
      new MaterialRipple(el);
    });
    setTimeout(function () {
      tabs[0].click();
    }, 100);
  }, 100);
}

function renderPointTable(table) {
  var th_first = table.querySelector('th');
  th_first.parentNode.removeChild(th_first);
  setTimeout(function () {
    new MaterialDataTable(table);
    componentHandler.upgradeAllRegistered();
    var ths = table.querySelectorAll('th:nth-child(2)');
    var tds = table.querySelectorAll('td:nth-child(2)');
    [].concat(_toConsumableArray(ths)).forEach(function (th) {
      if (th.childElementCount !== 0) th.innerHTML = '序号';
    });
    [].concat(_toConsumableArray(tds)).forEach(function (td) {
      if (td.childElementCount !== 0) td.parentNode.removeChild(td);
    });
  });
}

function renderTable(table) {
  var th_first = table.querySelector('th');
  th_first.parentNode.removeChild(th_first);
  setTimeout(function () {
    new MaterialDataTable(table);
    componentHandler.upgradeAllRegistered();
  });
}

function renderRipple(el) {
  setTimeout(function () {
    componentHandler.upgradeAllRegistered();
  }, 100);
}

function renderButton(el) {
  setTimeout(function () {
    componentHandler.upgradeAllRegistered();
  }, 100);
}

function renderCheckbox(el) {
  window.setTimeout(function () {
    var btns = document.querySelector(el).querySelectorAll('.mdl-js-checkbox');
    [].forEach.call(btns, function (el) {
      new MaterialCheckbox(el);
    });
  }, 100);
}

function renderRadio(el) {
  window.setTimeout(function () {
    var radios = document.querySelector(el).querySelectorAll('.mdl-js-radio');
    [].concat(_toConsumableArray(radios)).forEach(function (el) {
      new MaterialRadio(el);
    });
  }, 100);
}

function renderTextfield(el) {
  window.setTimeout(function () {
    var fields = document.querySelector(el).querySelectorAll('.mdl-js-textfield');
    [].forEach.call(fields, function (el) {
      new MaterialTextfield(el);
    });
  }, 100);
}

function tip(str, type) {
  var el = document.querySelector('#tip');
  //el.innerText = str;
  // for firefox
  //el.textContent = str;
  if (type === 'error') el.style.backgroundColor = '#d9534f';
  if (type === 'success') el.style.backgroundColor = '#5cb85c';
  if (type === 'message') el.style.backgroundColor = '#3aaacf';
  el.MaterialSnackbar.showSnackbar({
    message: str
  });
}

function render() {
  setTimeout(function () {
    componentHandler.upgradeAllRegistered();
  }, 100);
}

function bindClose() {
  var btnClose = document.querySelectorAll('.closebtn');
  [].concat(_toConsumableArray(btnClose)).forEach(function (el) {
    el.addEventListener('click', function (evt) {
      var btn = evt.target;
      var topElement = btn.parentNode.parentNode;
      topElement.removeChild(btn.parentNode);
    });
  });
}

module.exports.renderTabs = renderTabs;
module.exports.tip = tip;
module.exports.renderTable = renderTable;
module.exports.renderPointTable = renderPointTable;
module.exports.renderButton = renderButton;
module.exports.renderRipple = renderRipple;
module.exports.renderRadio = renderRadio;
module.exports.renderCheckbox = renderCheckbox;
module.exports.renderTextfield = renderTextfield;
module.exports.render = render;
module.exports.bindClose = bindClose;

},{}],13:[function(require,module,exports){
/**
 * Before Interceptor.
 */

var _ = require('../util');

module.exports = {

    request: function (request) {

        if (_.isFunction(request.beforeSend)) {
            request.beforeSend.call(this, request);
        }

        return request;
    }

};

},{"../util":36}],14:[function(require,module,exports){
/**
 * Base client.
 */

var _ = require('../../util');
var Promise = require('../../promise');
var xhrClient = require('./xhr');

module.exports = function (request) {

    var response = (request.client || xhrClient)(request);

    return Promise.resolve(response).then(function (response) {

        if (response.headers) {

            var headers = parseHeaders(response.headers);

            response.headers = function (name) {

                if (name) {
                    return headers[_.toLower(name)];
                }

                return headers;
            };

        }

        response.ok = response.status >= 200 && response.status < 300;

        return response;
    });

};

function parseHeaders(str) {

    var headers = {}, value, name, i;

    if (_.isString(str)) {
        _.each(str.split('\n'), function (row) {

            i = row.indexOf(':');
            name = _.trim(_.toLower(row.slice(0, i)));
            value = _.trim(row.slice(i + 1));

            if (headers[name]) {

                if (_.isArray(headers[name])) {
                    headers[name].push(value);
                } else {
                    headers[name] = [headers[name], value];
                }

            } else {

                headers[name] = value;
            }

        });
    }

    return headers;
}

},{"../../promise":29,"../../util":36,"./xhr":17}],15:[function(require,module,exports){
/**
 * JSONP client.
 */

var _ = require('../../util');
var Promise = require('../../promise');

module.exports = function (request) {
    return new Promise(function (resolve) {

        var callback = '_jsonp' + Math.random().toString(36).substr(2), response = {request: request, data: null}, handler, script;

        request.params[request.jsonp] = callback;
        request.cancel = function () {
            handler({type: 'cancel'});
        };

        script = document.createElement('script');
        script.src = _.url(request);
        script.type = 'text/javascript';
        script.async = true;

        window[callback] = function (data) {
            response.data = data;
        };

        handler = function (event) {

            if (event.type === 'load' && response.data !== null) {
                response.status = 200;
            } else if (event.type === 'error') {
                response.status = 404;
            } else {
                response.status = 0;
            }

            resolve(response);

            delete window[callback];
            document.body.removeChild(script);
        };

        script.onload = handler;
        script.onerror = handler;

        document.body.appendChild(script);
    });
};

},{"../../promise":29,"../../util":36}],16:[function(require,module,exports){
/**
 * XDomain client (Internet Explorer).
 */

var _ = require('../../util');
var Promise = require('../../promise');

module.exports = function (request) {
    return new Promise(function (resolve) {

        var xdr = new XDomainRequest(), response = {request: request}, handler;

        request.cancel = function () {
            xdr.abort();
        };

        xdr.open(request.method, _.url(request), true);

        handler = function (event) {

            response.data = xdr.responseText;
            response.status = xdr.status;
            response.statusText = xdr.statusText;

            resolve(response);
        };

        xdr.timeout = 0;
        xdr.onload = handler;
        xdr.onabort = handler;
        xdr.onerror = handler;
        xdr.ontimeout = function () {};
        xdr.onprogress = function () {};

        xdr.send(request.data);
    });
};

},{"../../promise":29,"../../util":36}],17:[function(require,module,exports){
/**
 * XMLHttp client.
 */

var _ = require('../../util');
var Promise = require('../../promise');

module.exports = function (request) {
    return new Promise(function (resolve) {

        var xhr = new XMLHttpRequest(), response = {request: request}, handler;

        request.cancel = function () {
            xhr.abort();
        };

        xhr.open(request.method, _.url(request), true);

        handler = function (event) {

            response.data = xhr.responseText;
            response.status = xhr.status;
            response.statusText = xhr.statusText;
            response.headers = xhr.getAllResponseHeaders();

            resolve(response);
        };

        xhr.timeout = 0;
        xhr.onload = handler;
        xhr.onabort = handler;
        xhr.onerror = handler;
        xhr.ontimeout = function () {};
        xhr.onprogress = function () {};

        if (_.isPlainObject(request.xhr)) {
            _.extend(xhr, request.xhr);
        }

        if (_.isPlainObject(request.upload)) {
            _.extend(xhr.upload, request.upload);
        }

        _.each(request.headers || {}, function (value, header) {
            xhr.setRequestHeader(header, value);
        });

        xhr.send(request.data);
    });
};

},{"../../promise":29,"../../util":36}],18:[function(require,module,exports){
/**
 * CORS Interceptor.
 */

var _ = require('../util');
var xdrClient = require('./client/xdr');
var xhrCors = 'withCredentials' in new XMLHttpRequest();
var originUrl = _.url.parse(location.href);

module.exports = {

    request: function (request) {

        if (request.crossOrigin === null) {
            request.crossOrigin = crossOrigin(request);
        }

        if (request.crossOrigin) {

            if (!xhrCors) {
                request.client = xdrClient;
            }

            request.emulateHTTP = false;
        }

        return request;
    }

};

function crossOrigin(request) {

    var requestUrl = _.url.parse(_.url(request));

    return (requestUrl.protocol !== originUrl.protocol || requestUrl.host !== originUrl.host);
}

},{"../util":36,"./client/xdr":16}],19:[function(require,module,exports){
/**
 * Header Interceptor.
 */

var _ = require('../util');

module.exports = {

    request: function (request) {

        request.method = request.method.toUpperCase();
        request.headers = _.extend({}, _.http.headers.common,
            !request.crossOrigin ? _.http.headers.custom : {},
            _.http.headers[request.method.toLowerCase()],
            request.headers
        );

        if (_.isPlainObject(request.data) && /^(GET|JSONP)$/i.test(request.method)) {
            _.extend(request.params, request.data);
            delete request.data;
        }

        return request;
    }

};

},{"../util":36}],20:[function(require,module,exports){
/**
 * Service for sending network requests.
 */

var _ = require('../util');
var Client = require('./client');
var Promise = require('../promise');
var interceptor = require('./interceptor');
var jsonType = {'Content-Type': 'application/json'};

function Http(url, options) {

    var client = Client, request, promise;

    Http.interceptors.forEach(function (handler) {
        client = interceptor(handler, this.$vm)(client);
    }, this);

    options = _.isObject(url) ? url : _.extend({url: url}, options);
    request = _.merge({}, Http.options, this.$options, options);
    promise = client(request).bind(this.$vm).then(function (response) {

        return response.ok ? response : Promise.reject(response);

    }, function (response) {

        if (response instanceof Error) {
            _.error(response);
        }

        return Promise.reject(response);
    });

    if (request.success) {
        promise.success(request.success);
    }

    if (request.error) {
        promise.error(request.error);
    }

    return promise;
}

Http.options = {
    method: 'get',
    data: '',
    params: {},
    headers: {},
    xhr: null,
    upload: null,
    jsonp: 'callback',
    beforeSend: null,
    crossOrigin: null,
    emulateHTTP: false,
    emulateJSON: false,
    timeout: 0
};

Http.interceptors = [
    require('./before'),
    require('./timeout'),
    require('./jsonp'),
    require('./method'),
    require('./mime'),
    require('./header'),
    require('./cors')
];

Http.headers = {
    put: jsonType,
    post: jsonType,
    patch: jsonType,
    delete: jsonType,
    common: {'Accept': 'application/json, text/plain, */*'},
    custom: {'X-Requested-With': 'XMLHttpRequest'}
};

['get', 'put', 'post', 'patch', 'delete', 'jsonp'].forEach(function (method) {

    Http[method] = function (url, data, success, options) {

        if (_.isFunction(data)) {
            options = success;
            success = data;
            data = undefined;
        }

        if (_.isObject(success)) {
            options = success;
            success = undefined;
        }

        return this(url, _.extend({method: method, data: data, success: success}, options));
    };
});

module.exports = _.http = Http;

},{"../promise":29,"../util":36,"./before":13,"./client":14,"./cors":18,"./header":19,"./interceptor":21,"./jsonp":22,"./method":23,"./mime":24,"./timeout":25}],21:[function(require,module,exports){
/**
 * Interceptor factory.
 */

var _ = require('../util');
var Promise = require('../promise');

module.exports = function (handler, vm) {

    return function (client) {

        if (_.isFunction(handler)) {
            handler = handler.call(vm, Promise);
        }

        return function (request) {

            if (_.isFunction(handler.request)) {
                request = handler.request.call(vm, request);
            }

            return when(request, function (request) {
                return when(client(request), function (response) {

                    if (_.isFunction(handler.response)) {
                        response = handler.response.call(vm, response);
                    }

                    return response;
                });
            });
        };
    };
};

function when(value, fulfilled, rejected) {

    var promise = Promise.resolve(value);

    if (arguments.length < 2) {
        return promise;
    }

    return promise.then(fulfilled, rejected);
}

},{"../promise":29,"../util":36}],22:[function(require,module,exports){
/**
 * JSONP Interceptor.
 */

var jsonpClient = require('./client/jsonp');

module.exports = {

    request: function (request) {

        if (request.method == 'JSONP') {
            request.client = jsonpClient;
        }

        return request;
    }

};

},{"./client/jsonp":15}],23:[function(require,module,exports){
/**
 * HTTP method override Interceptor.
 */

module.exports = {

    request: function (request) {

        if (request.emulateHTTP && /^(PUT|PATCH|DELETE)$/i.test(request.method)) {
            request.headers['X-HTTP-Method-Override'] = request.method;
            request.method = 'POST';
        }

        return request;
    }

};

},{}],24:[function(require,module,exports){
/**
 * Mime Interceptor.
 */

var _ = require('../util');

module.exports = {

    request: function (request) {

        if (request.emulateJSON && _.isPlainObject(request.data)) {
            request.headers['Content-Type'] = 'application/x-www-form-urlencoded';
            request.data = _.url.params(request.data);
        }

        if (_.isObject(request.data) && /FormData/i.test(request.data.toString())) {
            delete request.headers['Content-Type'];
        }

        if (_.isPlainObject(request.data)) {
            request.data = JSON.stringify(request.data);
        }

        return request;
    },

    response: function (response) {

        try {
            response.data = JSON.parse(response.data);
        } catch (e) {}

        return response;
    }

};

},{"../util":36}],25:[function(require,module,exports){
/**
 * Timeout Interceptor.
 */

module.exports = function () {

    var timeout;

    return {

        request: function (request) {

            if (request.timeout) {
                timeout = setTimeout(function () {
                    request.cancel();
                }, request.timeout);
            }

            return request;
        },

        response: function (response) {

            clearTimeout(timeout);

            return response;
        }

    };
};

},{}],26:[function(require,module,exports){
/**
 * Install plugin.
 */

function install(Vue) {

    var _ = require('./util');

    _.config = Vue.config;
    _.warning = Vue.util.warn;
    _.nextTick = Vue.util.nextTick;

    Vue.url = require('./url');
    Vue.http = require('./http');
    Vue.resource = require('./resource');
    Vue.Promise = require('./promise');

    Object.defineProperties(Vue.prototype, {

        $url: {
            get: function () {
                return _.options(Vue.url, this, this.$options.url);
            }
        },

        $http: {
            get: function () {
                return _.options(Vue.http, this, this.$options.http);
            }
        },

        $resource: {
            get: function () {
                return Vue.resource.bind(this);
            }
        },

        $promise: {
            get: function () {
                return function (executor) {
                    return new Vue.Promise(executor, this);
                }.bind(this);
            }
        }

    });
}

if (window.Vue) {
    Vue.use(install);
}

module.exports = install;

},{"./http":20,"./promise":29,"./resource":30,"./url":31,"./util":36}],27:[function(require,module,exports){
/**
 * Promises/A+ polyfill v1.1.4 (https://github.com/bramstein/promis)
 */

var _ = require('../util');

var RESOLVED = 0;
var REJECTED = 1;
var PENDING  = 2;

function Promise(executor) {

    this.state = PENDING;
    this.value = undefined;
    this.deferred = [];

    var promise = this;

    try {
        executor(function (x) {
            promise.resolve(x);
        }, function (r) {
            promise.reject(r);
        });
    } catch (e) {
        promise.reject(e);
    }
}

Promise.reject = function (r) {
    return new Promise(function (resolve, reject) {
        reject(r);
    });
};

Promise.resolve = function (x) {
    return new Promise(function (resolve, reject) {
        resolve(x);
    });
};

Promise.all = function all(iterable) {
    return new Promise(function (resolve, reject) {
        var count = 0, result = [];

        if (iterable.length === 0) {
            resolve(result);
        }

        function resolver(i) {
            return function (x) {
                result[i] = x;
                count += 1;

                if (count === iterable.length) {
                    resolve(result);
                }
            };
        }

        for (var i = 0; i < iterable.length; i += 1) {
            Promise.resolve(iterable[i]).then(resolver(i), reject);
        }
    });
};

Promise.race = function race(iterable) {
    return new Promise(function (resolve, reject) {
        for (var i = 0; i < iterable.length; i += 1) {
            Promise.resolve(iterable[i]).then(resolve, reject);
        }
    });
};

var p = Promise.prototype;

p.resolve = function resolve(x) {
    var promise = this;

    if (promise.state === PENDING) {
        if (x === promise) {
            throw new TypeError('Promise settled with itself.');
        }

        var called = false;

        try {
            var then = x && x['then'];

            if (x !== null && typeof x === 'object' && typeof then === 'function') {
                then.call(x, function (x) {
                    if (!called) {
                        promise.resolve(x);
                    }
                    called = true;

                }, function (r) {
                    if (!called) {
                        promise.reject(r);
                    }
                    called = true;
                });
                return;
            }
        } catch (e) {
            if (!called) {
                promise.reject(e);
            }
            return;
        }

        promise.state = RESOLVED;
        promise.value = x;
        promise.notify();
    }
};

p.reject = function reject(reason) {
    var promise = this;

    if (promise.state === PENDING) {
        if (reason === promise) {
            throw new TypeError('Promise settled with itself.');
        }

        promise.state = REJECTED;
        promise.value = reason;
        promise.notify();
    }
};

p.notify = function notify() {
    var promise = this;

    _.nextTick(function () {
        if (promise.state !== PENDING) {
            while (promise.deferred.length) {
                var deferred = promise.deferred.shift(),
                    onResolved = deferred[0],
                    onRejected = deferred[1],
                    resolve = deferred[2],
                    reject = deferred[3];

                try {
                    if (promise.state === RESOLVED) {
                        if (typeof onResolved === 'function') {
                            resolve(onResolved.call(undefined, promise.value));
                        } else {
                            resolve(promise.value);
                        }
                    } else if (promise.state === REJECTED) {
                        if (typeof onRejected === 'function') {
                            resolve(onRejected.call(undefined, promise.value));
                        } else {
                            reject(promise.value);
                        }
                    }
                } catch (e) {
                    reject(e);
                }
            }
        }
    });
};

p.then = function then(onResolved, onRejected) {
    var promise = this;

    return new Promise(function (resolve, reject) {
        promise.deferred.push([onResolved, onRejected, resolve, reject]);
        promise.notify();
    });
};

p.catch = function (onRejected) {
    return this.then(undefined, onRejected);
};

module.exports = Promise;

},{"../util":36}],28:[function(require,module,exports){
/**
 * URL Template v2.0.6 (https://github.com/bramstein/url-template)
 */

exports.expand = function (url, params, variables) {

    var tmpl = this.parse(url), expanded = tmpl.expand(params);

    if (variables) {
        variables.push.apply(variables, tmpl.vars);
    }

    return expanded;
};

exports.parse = function (template) {

    var operators = ['+', '#', '.', '/', ';', '?', '&'], variables = [];

    return {
        vars: variables,
        expand: function (context) {
            return template.replace(/\{([^\{\}]+)\}|([^\{\}]+)/g, function (_, expression, literal) {
                if (expression) {

                    var operator = null, values = [];

                    if (operators.indexOf(expression.charAt(0)) !== -1) {
                        operator = expression.charAt(0);
                        expression = expression.substr(1);
                    }

                    expression.split(/,/g).forEach(function (variable) {
                        var tmp = /([^:\*]*)(?::(\d+)|(\*))?/.exec(variable);
                        values.push.apply(values, exports.getValues(context, operator, tmp[1], tmp[2] || tmp[3]));
                        variables.push(tmp[1]);
                    });

                    if (operator && operator !== '+') {

                        var separator = ',';

                        if (operator === '?') {
                            separator = '&';
                        } else if (operator !== '#') {
                            separator = operator;
                        }

                        return (values.length !== 0 ? operator : '') + values.join(separator);
                    } else {
                        return values.join(',');
                    }

                } else {
                    return exports.encodeReserved(literal);
                }
            });
        }
    };
};

exports.getValues = function (context, operator, key, modifier) {

    var value = context[key], result = [];

    if (this.isDefined(value) && value !== '') {
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
            value = value.toString();

            if (modifier && modifier !== '*') {
                value = value.substring(0, parseInt(modifier, 10));
            }

            result.push(this.encodeValue(operator, value, this.isKeyOperator(operator) ? key : null));
        } else {
            if (modifier === '*') {
                if (Array.isArray(value)) {
                    value.filter(this.isDefined).forEach(function (value) {
                        result.push(this.encodeValue(operator, value, this.isKeyOperator(operator) ? key : null));
                    }, this);
                } else {
                    Object.keys(value).forEach(function (k) {
                        if (this.isDefined(value[k])) {
                            result.push(this.encodeValue(operator, value[k], k));
                        }
                    }, this);
                }
            } else {
                var tmp = [];

                if (Array.isArray(value)) {
                    value.filter(this.isDefined).forEach(function (value) {
                        tmp.push(this.encodeValue(operator, value));
                    }, this);
                } else {
                    Object.keys(value).forEach(function (k) {
                        if (this.isDefined(value[k])) {
                            tmp.push(encodeURIComponent(k));
                            tmp.push(this.encodeValue(operator, value[k].toString()));
                        }
                    }, this);
                }

                if (this.isKeyOperator(operator)) {
                    result.push(encodeURIComponent(key) + '=' + tmp.join(','));
                } else if (tmp.length !== 0) {
                    result.push(tmp.join(','));
                }
            }
        }
    } else {
        if (operator === ';') {
            result.push(encodeURIComponent(key));
        } else if (value === '' && (operator === '&' || operator === '?')) {
            result.push(encodeURIComponent(key) + '=');
        } else if (value === '') {
            result.push('');
        }
    }

    return result;
};

exports.isDefined = function (value) {
    return value !== undefined && value !== null;
};

exports.isKeyOperator = function (operator) {
    return operator === ';' || operator === '&' || operator === '?';
};

exports.encodeValue = function (operator, value, key) {

    value = (operator === '+' || operator === '#') ? this.encodeReserved(value) : encodeURIComponent(value);

    if (key) {
        return encodeURIComponent(key) + '=' + value;
    } else {
        return value;
    }
};

exports.encodeReserved = function (str) {
    return str.split(/(%[0-9A-Fa-f]{2})/g).map(function (part) {
        if (!/%[0-9A-Fa-f]/.test(part)) {
            part = encodeURI(part);
        }
        return part;
    }).join('');
};

},{}],29:[function(require,module,exports){
/**
 * Promise adapter.
 */

var _ = require('./util');
var PromiseObj = window.Promise || require('./lib/promise');

function Promise(executor, context) {

    if (executor instanceof PromiseObj) {
        this.promise = executor;
    } else {
        this.promise = new PromiseObj(executor.bind(context));
    }

    this.context = context;
}

Promise.all = function (iterable, context) {
    return new Promise(PromiseObj.all(iterable), context);
};

Promise.resolve = function (value, context) {
    return new Promise(PromiseObj.resolve(value), context);
};

Promise.reject = function (reason, context) {
    return new Promise(PromiseObj.reject(reason), context);
};

Promise.race = function (iterable, context) {
    return new Promise(PromiseObj.race(iterable), context);
};

var p = Promise.prototype;

p.bind = function (context) {
    this.context = context;
    return this;
};

p.then = function (fulfilled, rejected) {

    if (fulfilled && fulfilled.bind && this.context) {
        fulfilled = fulfilled.bind(this.context);
    }

    if (rejected && rejected.bind && this.context) {
        rejected = rejected.bind(this.context);
    }

    this.promise = this.promise.then(fulfilled, rejected);

    return this;
};

p.catch = function (rejected) {

    if (rejected && rejected.bind && this.context) {
        rejected = rejected.bind(this.context);
    }

    this.promise = this.promise.catch(rejected);

    return this;
};

p.finally = function (callback) {

    return this.then(function (value) {
            callback.call(this);
            return value;
        }, function (reason) {
            callback.call(this);
            return PromiseObj.reject(reason);
        }
    );
};

p.success = function (callback) {

    _.warn('The `success` method has been deprecated. Use the `then` method instead.');

    return this.then(function (response) {
        return callback.call(this, response.data, response.status, response) || response;
    });
};

p.error = function (callback) {

    _.warn('The `error` method has been deprecated. Use the `catch` method instead.');

    return this.catch(function (response) {
        return callback.call(this, response.data, response.status, response) || response;
    });
};

p.always = function (callback) {

    _.warn('The `always` method has been deprecated. Use the `finally` method instead.');

    var cb = function (response) {
        return callback.call(this, response.data, response.status, response) || response;
    };

    return this.then(cb, cb);
};

module.exports = Promise;

},{"./lib/promise":27,"./util":36}],30:[function(require,module,exports){
/**
 * Service for interacting with RESTful services.
 */

var _ = require('./util');

function Resource(url, params, actions, options) {

    var self = this, resource = {};

    actions = _.extend({},
        Resource.actions,
        actions
    );

    _.each(actions, function (action, name) {

        action = _.merge({url: url, params: params || {}}, options, action);

        resource[name] = function () {
            return (self.$http || _.http)(opts(action, arguments));
        };
    });

    return resource;
}

function opts(action, args) {

    var options = _.extend({}, action), params = {}, data, success, error;

    switch (args.length) {

        case 4:

            error = args[3];
            success = args[2];

        case 3:
        case 2:

            if (_.isFunction(args[1])) {

                if (_.isFunction(args[0])) {

                    success = args[0];
                    error = args[1];

                    break;
                }

                success = args[1];
                error = args[2];

            } else {

                params = args[0];
                data = args[1];
                success = args[2];

                break;
            }

        case 1:

            if (_.isFunction(args[0])) {
                success = args[0];
            } else if (/^(POST|PUT|PATCH)$/i.test(options.method)) {
                data = args[0];
            } else {
                params = args[0];
            }

            break;

        case 0:

            break;

        default:

            throw 'Expected up to 4 arguments [params, data, success, error], got ' + args.length + ' arguments';
    }

    options.data = data;
    options.params = _.extend({}, options.params, params);

    if (success) {
        options.success = success;
    }

    if (error) {
        options.error = error;
    }

    return options;
}

Resource.actions = {

    get: {method: 'GET'},
    save: {method: 'POST'},
    query: {method: 'GET'},
    update: {method: 'PUT'},
    remove: {method: 'DELETE'},
    delete: {method: 'DELETE'}

};

module.exports = _.resource = Resource;

},{"./util":36}],31:[function(require,module,exports){
/**
 * Service for URL templating.
 */

var _ = require('../util');
var ie = document.documentMode;
var el = document.createElement('a');

function Url(url, params) {

    var options = url, transform;

    if (_.isString(url)) {
        options = {url: url, params: params};
    }

    options = _.merge({}, Url.options, this.$options, options);

    Url.transforms.forEach(function (handler) {
        transform = factory(handler, transform, this.$vm);
    }, this);

    return transform(options);
};

/**
 * Url options.
 */

Url.options = {
    url: '',
    root: null,
    params: {}
};

/**
 * Url transforms.
 */

Url.transforms = [
    require('./template'),
    require('./legacy'),
    require('./query'),
    require('./root')
];

/**
 * Encodes a Url parameter string.
 *
 * @param {Object} obj
 */

Url.params = function (obj) {

    var params = [], escape = encodeURIComponent;

    params.add = function (key, value) {

        if (_.isFunction(value)) {
            value = value();
        }

        if (value === null) {
            value = '';
        }

        this.push(escape(key) + '=' + escape(value));
    };

    serialize(params, obj);

    return params.join('&').replace(/%20/g, '+');
};

/**
 * Parse a URL and return its components.
 *
 * @param {String} url
 */

Url.parse = function (url) {

    if (ie) {
        el.href = url;
        url = el.href;
    }

    el.href = url;

    return {
        href: el.href,
        protocol: el.protocol ? el.protocol.replace(/:$/, '') : '',
        port: el.port,
        host: el.host,
        hostname: el.hostname,
        pathname: el.pathname.charAt(0) === '/' ? el.pathname : '/' + el.pathname,
        search: el.search ? el.search.replace(/^\?/, '') : '',
        hash: el.hash ? el.hash.replace(/^#/, '') : ''
    };
};

function factory(handler, next, vm) {
    return function (options) {
        return handler.call(vm, options, next);
    };
}

function serialize(params, obj, scope) {

    var array = _.isArray(obj), plain = _.isPlainObject(obj), hash;

    _.each(obj, function (value, key) {

        hash = _.isObject(value) || _.isArray(value);

        if (scope) {
            key = scope + '[' + (plain || hash ? key : '') + ']';
        }

        if (!scope && array) {
            params.add(value.name, value.value);
        } else if (hash) {
            serialize(params, value, key);
        } else {
            params.add(key, value);
        }
    });
}

module.exports = _.url = Url;

},{"../util":36,"./legacy":32,"./query":33,"./root":34,"./template":35}],32:[function(require,module,exports){
/**
 * Legacy Transform.
 */

var _ = require('../util');

module.exports = function (options, next) {

    var variables = [], url = next(options);

    url = url.replace(/(\/?):([a-z]\w*)/gi, function (match, slash, name) {

        _.warn('The `:' + name + '` parameter syntax has been deprecated. Use the `{' + name + '}` syntax instead.');

        if (options.params[name]) {
            variables.push(name);
            return slash + encodeUriSegment(options.params[name]);
        }

        return '';
    });

    variables.forEach(function (key) {
        delete options.params[key];
    });

    return url;
};

function encodeUriSegment(value) {

    return encodeUriQuery(value, true).
        replace(/%26/gi, '&').
        replace(/%3D/gi, '=').
        replace(/%2B/gi, '+');
}

function encodeUriQuery(value, spaces) {

    return encodeURIComponent(value).
        replace(/%40/gi, '@').
        replace(/%3A/gi, ':').
        replace(/%24/g, '$').
        replace(/%2C/gi, ',').
        replace(/%20/g, (spaces ? '%20' : '+'));
}

},{"../util":36}],33:[function(require,module,exports){
/**
 * Query Parameter Transform.
 */

var _ = require('../util');

module.exports = function (options, next) {

    var urlParams = Object.keys(_.url.options.params), query = {}, url = next(options);

   _.each(options.params, function (value, key) {
        if (urlParams.indexOf(key) === -1) {
            query[key] = value;
        }
    });

    query = _.url.params(query);

    if (query) {
        url += (url.indexOf('?') == -1 ? '?' : '&') + query;
    }

    return url;
};

},{"../util":36}],34:[function(require,module,exports){
/**
 * Root Prefix Transform.
 */

var _ = require('../util');

module.exports = function (options, next) {

    var url = next(options);

    if (_.isString(options.root) && !url.match(/^(https?:)?\//)) {
        url = options.root + '/' + url;
    }

    return url;
};

},{"../util":36}],35:[function(require,module,exports){
/**
 * URL Template (RFC 6570) Transform.
 */

var UrlTemplate = require('../lib/url-template');

module.exports = function (options) {

    var variables = [], url = UrlTemplate.expand(options.url, options.params, variables);

    variables.forEach(function (key) {
        delete options.params[key];
    });

    return url;
};

},{"../lib/url-template":28}],36:[function(require,module,exports){
/**
 * Utility functions.
 */

var _ = exports, array = [], console = window.console;

_.warn = function (msg) {
    if (console && _.warning && (!_.config.silent || _.config.debug)) {
        console.warn('[VueResource warn]: ' + msg);
    }
};

_.error = function (msg) {
    if (console) {
        console.error(msg);
    }
};

_.trim = function (str) {
    return str.replace(/^\s*|\s*$/g, '');
};

_.toLower = function (str) {
    return str ? str.toLowerCase() : '';
};

_.isArray = Array.isArray;

_.isString = function (val) {
    return typeof val === 'string';
};

_.isFunction = function (val) {
    return typeof val === 'function';
};

_.isObject = function (obj) {
    return obj !== null && typeof obj === 'object';
};

_.isPlainObject = function (obj) {
    return _.isObject(obj) && Object.getPrototypeOf(obj) == Object.prototype;
};

_.options = function (fn, obj, options) {

    options = options || {};

    if (_.isFunction(options)) {
        options = options.call(obj);
    }

    return _.merge(fn.bind({$vm: obj, $options: options}), fn, {$options: options});
};

_.each = function (obj, iterator) {

    var i, key;

    if (typeof obj.length == 'number') {
        for (i = 0; i < obj.length; i++) {
            iterator.call(obj[i], obj[i], i);
        }
    } else if (_.isObject(obj)) {
        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                iterator.call(obj[key], obj[key], key);
            }
        }
    }

    return obj;
};

_.defaults = function (target, source) {

    for (var key in source) {
        if (target[key] === undefined) {
            target[key] = source[key];
        }
    }

    return target;
};

_.extend = function (target) {

    var args = array.slice.call(arguments, 1);

    args.forEach(function (arg) {
        merge(target, arg);
    });

    return target;
};

_.merge = function (target) {

    var args = array.slice.call(arguments, 1);

    args.forEach(function (arg) {
        merge(target, arg, true);
    });

    return target;
};

function merge(target, source, deep) {
    for (var key in source) {
        if (deep && (_.isPlainObject(source[key]) || _.isArray(source[key]))) {
            if (_.isPlainObject(source[key]) && !_.isPlainObject(target[key])) {
                target[key] = {};
            }
            if (_.isArray(source[key]) && !_.isArray(target[key])) {
                target[key] = [];
            }
            merge(target[key], source[key], deep);
        } else if (source[key] !== undefined) {
            target[key] = source[key];
        }
    }
}

},{}]},{},[7]);
