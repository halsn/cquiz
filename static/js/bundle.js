(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

/* globals Vue */
//var Vue = require('./vendor/vue.min.js');

module.exports = function () {
  new Vue({
    el: '#login-form',
    data: {
      email: '',
      pass: ''
    },
    methods: {
      submit: function submit(evt) {
        if (!this.email || !this.pass) {
          evt.preventDefault();
        }
      }
    }
  });
};

},{}],2:[function(require,module,exports){
'use strict';

module.exports = (function () {
  'use strict';

  require('./signup.js')();
  require('./login.js')();
  require('./t/home.js')();

  var btnClose = document.querySelectorAll('.close');
  [].forEach.call(btnClose, function (el) {
    el.addEventListener('click', function (evt) {
      var btn = evt.target;
      var topElement = btn.parentNode.parentNode;
      topElement.removeChild(btn.parentNode);
    });
  });
})();

},{"./login.js":1,"./signup.js":3,"./t/home.js":10}],3:[function(require,module,exports){
'use strict';

/* globals Vue */
//var Vue = require('./vendor/vue.min.js');

module.exports = function () {
  new Vue({
    el: '#signup-form',
    data: {
      email: '',
      pass: '',
      ckps: ''
    },
    methods: {
      submit: function submit(evt) {
        if (!this.email || !this.pass || !this.ckps) {
          evt.preventDefault();
        }
      }
    }
  });
};

},{}],4:[function(require,module,exports){
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
        classView.get();
        tip('添加成功', 'success');
      }, function (err) {
        return tip('添加失败', 'error');
      });
    }
  }
});

module.exports = addClass;

},{"../util":14,"./classview":8,"vue-resource":28}],5:[function(require,module,exports){
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
          tip('添加成功', 'success');
          _this.course.name = '';
          _this.course.duration = 32;
          courseView.get();
        }, function (err) {
          tip('添加失败', 'error');
        });
      }
    }
  }
});

module.exports = addCourse;

},{"../util":14,"./courseview":9,"vue-resource":28}],6:[function(require,module,exports){
'use strict';

/* globals Vue XLSX */
//var Vue = require('../vendor/vue.min.js');
var courseView = require('./courseview');
var classView = require('./classview');
var tip = require('../util').tip;
//var XLSX = require('xlsx-browserify-shim');
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
        classView.get();
      }, function (err) {
        console.log(err);
        tip('录入失败', 'error');
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
      var tags = chapter.tags || [];
      var file = evt.target.files[0];
      var reader = new FileReader();
      reader.onload = function (e) {
        var data = e.target.result;
        var workbook = XLSX.read(data, {
          type: 'binary'
        });
        var first_sheet_name = workbook.SheetNames[0];
        var first_sheet = workbook.Sheets[first_sheet_name];
        addQuiz.jsonData = XLSX.utils.sheet_to_json(first_sheet).filter(function (el) {
          if (tags.indexOf(el.知识点) === -1) return false;else if (el.类型 === '问答题') {
            el.选项 = '';
            return !!(el.题目 && el.参考答案);
          } else if (el.类型 === '判断题') {
            if (!el.参考答案) return false;else if (el.参考答案 === '正确' || el.参考答案 === '错误') return true;
            return false;
          } else if (el.类型 === '单选题' || el.类型 === '多选题') {
            if (!el.选项) return false;
            var selection = el.选项.split(';').map(function (s) {
              return s.trim();
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

},{"../util":14,"./classview":8,"./courseview":9,"vue-resource":28}],7:[function(require,module,exports){
'use strict';

/* globals Vue XLSX */
//var Vue = require('../vendor/vue.min.js');
var classView = require('./classview');
var tip = require('../util').tip;
//var XLSX = require('xlsx-browserify-shim');
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

      if (!this.Class._id) return evt.preventDefault();
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
        classView.get();
      }, function (err) {
        return tip('网络故障', 'error');
      });
    }
  }
});

module.exports = addStudents;

},{"../util":14,"./classview":8,"vue-resource":28}],8:[function(require,module,exports){
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

},{"../util":14,"./addstudents":7,"./pubquiz":11,"./testview":13,"vue-resource":28}],9:[function(require,module,exports){
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
  if (!value) return '新篇章';
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
    editTag: function editTag(evt, tagIdx, chapIdx, cardIdx) {
      var p = evt.target.parentNode;
      var t = evt.target;
      var ctx = p.querySelector('.editable');
      var input = p.querySelector('.editInput');
      if (t === ctx) {
        t.style.display = 'none';
        input.style.display = 'inline-block';
        window.setTimeout(function () {
          p.querySelector('.editInput').focus();
        }, 300);
      } else {
        t.style.display = 'none';
        ctx.style.display = 'inline-block';
        if (!this.cards[cardIdx].chapters[chapIdx].tags[tagIdx]) this.cards[cardIdx].chapters[chapIdx].tags.splice(tagIdx, 1);
      }
    },
    addTag: function addTag(chapIdx, cardIdx) {
      this.cards[cardIdx].chapters[chapIdx].tags.push('知识点');
    },
    addChapter: function addChapter(cardIdx) {
      var chapter = {
        title: '新篇章',
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

module.exports = courseView;

},{"../util":14,"./addclass":4,"./addquiz":6,"./classview":8,"./quizview":12,"vue-resource":28}],10:[function(require,module,exports){
'use strict';

/* globals MaterialLayoutTab, MaterialLayout, MaterialTabs, MaterialTab, MaterialRipple */
/* globals Vue */

//var Vue = require('../vendor/vue.min.js');
var renderTabs = require('../util').renderTabs;
var courseView = require('./courseview');
var addCourse = require('./addcourse');
var classView = require('./classview');
var collect = require('./testview');

module.exports = function () {
  if (document.location.pathname !== '/t/home') return null;
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
  }, {
    url: '#info-tab-2',
    title: '修改密码'
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
};

},{"../util":14,"./addcourse":5,"./classview":8,"./courseview":9,"./testview":13}],11:[function(require,module,exports){
'use strict';

/* globals Vue */
//var Vue = require('../vendor/vue.min.js');
var classView = require('./classview');
var tip = require('../util').tip;
var renderTable = require('../util').renderTable;
var render = require('../util').render;
var testView = require('./testview');
Vue.use(require('vue-resource'));

var pubQuiz = new Vue({
  el: '#class-tab-4',
  data: {
    classes: [],
    Class: {},
    qsets: [],
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
    getQuizNum: function getQuizNum(evt) {
      var _this = this;

      if (['INPUT', 'SPAN'].indexOf(evt.target.nodeName) === -1) return evt.preventDefault();
      setTimeout(function () {
        var table = document.querySelector('.pub-table');
        var selected = table.querySelectorAll('.is-selected');
        _this.quizNum = 0;
        _this.chapterList = [];
        [].forEach.call(selected, function (el) {
          _this.quizNum += Number(el.childNodes[3].textContent || el.childNodes[3].innerText);
          _this.chapterList.push(el.childNodes[2].textContent || el.childNodes[2].innerText);
        });
        var sets = _this.qsets.filter(function (qset) {
          return _this.chapterList.indexOf(qset.ref_chapter) !== -1;
        });
        if (!sets.length) {
          _this.maxjudgeNum = 0;
          _this.maxsingleNum = 0;
          _this.maxmultiNum = 0;
          _this.maxaskNum = 0;
        } else {
          _this.maxjudgeNum = sets.map(function (s) {
            return s.quizs;
          }).reduce(function (p, a) {
            return p.concat(a);
          }).filter(function (q) {
            return q.genre === '判断题';
          }).length;
          _this.maxsingleNum = sets.map(function (s) {
            return s.quizs;
          }).reduce(function (p, a) {
            return p.concat(a);
          }).filter(function (q) {
            return q.genre === '单选题';
          }).length;
          _this.maxmultiNum = sets.map(function (s) {
            return s.quizs;
          }).reduce(function (p, a) {
            return p.concat(a);
          }).filter(function (q) {
            return q.genre === '多选题';
          }).length;
          _this.maxaskNum = sets.map(function (s) {
            return s.quizs;
          }).reduce(function (p, a) {
            return p.concat(a);
          }).filter(function (q) {
            return q.genre === '问答题';
          }).length;
        }
      }, 100);
    },
    get: function get() {
      var _this2 = this;

      if (!this.Class._id) return;
      var qset = {};
      qset.ref_course = this.Class.ref_course;
      this.$http.get('/api/t/qset', qset).then(function (res) {
        _this2.qsets = res.data;
        _this2.quizNum = 0;
        renderTable(document.querySelector('.pub-table'));
      }, function (err) {
        return tip('网络故障', 'error');
      });
    },
    pub: function pub(evt) {
      var _this3 = this;

      if (!Object.keys(this.Class).length || !this.quizNum || !this.expireNum || !this.studentNum || this.quizNum < this.expireNum) return evt.preventDefault();
      if (this.judgeNum > this.maxjudgeNum || this.singleNum > this.maxsingleNum || this.multiNum > this.maxmultiNum || this.askNum > this.maxaskNum) return evt.preventDefault();
      var data = {};
      data.class_id = this.Class._id;
      data.duration = this.duration;
      data.chapterList = this.chapterList;
      data.ref_students = this.Class.ref_students;
      data.quizNum = this.quizNum;
      data.expireNum = this.expireNum;
      data.judgeNum = this.judgeNum;
      data.singleNum = this.singleNum;
      data.multiNum = this.multiNum;
      data.askNum = this.askNum;
      this.$http.post('/api/t/test', data).then(function (res) {
        _this3.Class = {};
        _this3.qsets = [];
        _this3.duration = 10;
        _this3.quizNum = 0;
        _this3.expireNum = 0;
        _this3.judgeNum = 0;
        _this3.singleNum = 0;
        _this3.multiNum = 0;
        _this3.askNum = 0;
        _this3.maxjudgeNum = 0;
        _this3.maxsingleNum = 0;
        _this3.maxmultiNum = 0;
        _this3.maxaskNum = 0;
        _this3.chapterList = [];
        tip('发布成功', 'success');
        testView.get();
      }, function (err) {
        return tip('网络故障', 'error');
      });
    }
  }
});

module.exports = pubQuiz;

},{"../util":14,"./classview":8,"./testview":13,"vue-resource":28}],12:[function(require,module,exports){
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
        pubQuiz.get();
      }, function (err) {
        return tip('网络故障', 'error');
      });
    }
  }
});

module.exports = quizView;

},{"../util":14,"./courseview":9,"./pubquiz":11,"vue-resource":28}],13:[function(require,module,exports){
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
  return quizs.map(function (x) {
    return x.score;
  }).reduce(function (p, a) {
    return p + a;
  });
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

},{"../util":14,"./courseview":9,"./pubquiz":11,"vue-resource":28}],14:[function(require,module,exports){
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
  el.innerText = str;
  // for firefox
  el.textContent = str;
  if (type === 'error') el.style.backgroundColor = '#d9534f';
  if (type === 'success') el.style.backgroundColor = '#5cb85c';
  if (type === 'message') el.style.backgroundColor = '#3aaacf';
  if (!el.style.display || el.style.display === 'none') {
    el.style.display = 'block';
    setTimeout(function () {
      el.style.display = 'none';
    }, 2000);
  }
}

function render() {
  setTimeout(function () {
    componentHandler.upgradeAllRegistered();
  }, 100);
}

module.exports.renderTabs = renderTabs;
module.exports.tip = tip;
module.exports.renderTable = renderTable;
module.exports.renderButton = renderButton;
module.exports.renderRipple = renderRipple;
module.exports.renderRadio = renderRadio;
module.exports.renderCheckbox = renderCheckbox;
module.exports.renderTextfield = renderTextfield;
module.exports.render = render;

},{}],15:[function(require,module,exports){
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

},{"../util":38}],16:[function(require,module,exports){
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

},{"../../promise":31,"../../util":38,"./xhr":19}],17:[function(require,module,exports){
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

},{"../../promise":31,"../../util":38}],18:[function(require,module,exports){
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

},{"../../promise":31,"../../util":38}],19:[function(require,module,exports){
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

},{"../../promise":31,"../../util":38}],20:[function(require,module,exports){
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

},{"../util":38,"./client/xdr":18}],21:[function(require,module,exports){
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

},{"../util":38}],22:[function(require,module,exports){
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

},{"../promise":31,"../util":38,"./before":15,"./client":16,"./cors":20,"./header":21,"./interceptor":23,"./jsonp":24,"./method":25,"./mime":26,"./timeout":27}],23:[function(require,module,exports){
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

},{"../promise":31,"../util":38}],24:[function(require,module,exports){
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

},{"./client/jsonp":17}],25:[function(require,module,exports){
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

},{}],26:[function(require,module,exports){
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

},{"../util":38}],27:[function(require,module,exports){
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

},{}],28:[function(require,module,exports){
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

},{"./http":22,"./promise":31,"./resource":32,"./url":33,"./util":38}],29:[function(require,module,exports){
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

},{"../util":38}],30:[function(require,module,exports){
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

},{}],31:[function(require,module,exports){
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

},{"./lib/promise":29,"./util":38}],32:[function(require,module,exports){
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

},{"./util":38}],33:[function(require,module,exports){
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

},{"../util":38,"./legacy":34,"./query":35,"./root":36,"./template":37}],34:[function(require,module,exports){
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

},{"../util":38}],35:[function(require,module,exports){
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

},{"../util":38}],36:[function(require,module,exports){
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

},{"../util":38}],37:[function(require,module,exports){
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

},{"../lib/url-template":30}],38:[function(require,module,exports){
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

},{}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImRldi9qcy9sb2dpbi5qcyIsImRldi9qcy9tYWluLmpzIiwiZGV2L2pzL3NpZ251cC5qcyIsImRldi9qcy90L2FkZGNsYXNzLmpzIiwiZGV2L2pzL3QvYWRkY291cnNlLmpzIiwiZGV2L2pzL3QvYWRkcXVpei5qcyIsImRldi9qcy90L2FkZHN0dWRlbnRzLmpzIiwiZGV2L2pzL3QvY2xhc3N2aWV3LmpzIiwiZGV2L2pzL3QvY291cnNldmlldy5qcyIsImRldi9qcy90L2hvbWUuanMiLCJkZXYvanMvdC9wdWJxdWl6LmpzIiwiZGV2L2pzL3QvcXVpenZpZXcuanMiLCJkZXYvanMvdC90ZXN0dmlldy5qcyIsImRldi9qcy91dGlsLmpzIiwiLi4vLi4vLi4vLi4vdXNyL2xvY2FsL2xpYi9ub2RlX21vZHVsZXMvdnVlLXJlc291cmNlL3NyYy9odHRwL2JlZm9yZS5qcyIsIi4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3Z1ZS1yZXNvdXJjZS9zcmMvaHR0cC9jbGllbnQvaW5kZXguanMiLCIuLi8uLi8uLi8uLi91c3IvbG9jYWwvbGliL25vZGVfbW9kdWxlcy92dWUtcmVzb3VyY2Uvc3JjL2h0dHAvY2xpZW50L2pzb25wLmpzIiwiLi4vLi4vLi4vLi4vdXNyL2xvY2FsL2xpYi9ub2RlX21vZHVsZXMvdnVlLXJlc291cmNlL3NyYy9odHRwL2NsaWVudC94ZHIuanMiLCIuLi8uLi8uLi8uLi91c3IvbG9jYWwvbGliL25vZGVfbW9kdWxlcy92dWUtcmVzb3VyY2Uvc3JjL2h0dHAvY2xpZW50L3hoci5qcyIsIi4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3Z1ZS1yZXNvdXJjZS9zcmMvaHR0cC9jb3JzLmpzIiwiLi4vLi4vLi4vLi4vdXNyL2xvY2FsL2xpYi9ub2RlX21vZHVsZXMvdnVlLXJlc291cmNlL3NyYy9odHRwL2hlYWRlci5qcyIsIi4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3Z1ZS1yZXNvdXJjZS9zcmMvaHR0cC9pbmRleC5qcyIsIi4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3Z1ZS1yZXNvdXJjZS9zcmMvaHR0cC9pbnRlcmNlcHRvci5qcyIsIi4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3Z1ZS1yZXNvdXJjZS9zcmMvaHR0cC9qc29ucC5qcyIsIi4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3Z1ZS1yZXNvdXJjZS9zcmMvaHR0cC9tZXRob2QuanMiLCIuLi8uLi8uLi8uLi91c3IvbG9jYWwvbGliL25vZGVfbW9kdWxlcy92dWUtcmVzb3VyY2Uvc3JjL2h0dHAvbWltZS5qcyIsIi4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3Z1ZS1yZXNvdXJjZS9zcmMvaHR0cC90aW1lb3V0LmpzIiwiLi4vLi4vLi4vLi4vdXNyL2xvY2FsL2xpYi9ub2RlX21vZHVsZXMvdnVlLXJlc291cmNlL3NyYy9pbmRleC5qcyIsIi4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3Z1ZS1yZXNvdXJjZS9zcmMvbGliL3Byb21pc2UuanMiLCIuLi8uLi8uLi8uLi91c3IvbG9jYWwvbGliL25vZGVfbW9kdWxlcy92dWUtcmVzb3VyY2Uvc3JjL2xpYi91cmwtdGVtcGxhdGUuanMiLCIuLi8uLi8uLi8uLi91c3IvbG9jYWwvbGliL25vZGVfbW9kdWxlcy92dWUtcmVzb3VyY2Uvc3JjL3Byb21pc2UuanMiLCIuLi8uLi8uLi8uLi91c3IvbG9jYWwvbGliL25vZGVfbW9kdWxlcy92dWUtcmVzb3VyY2Uvc3JjL3Jlc291cmNlLmpzIiwiLi4vLi4vLi4vLi4vdXNyL2xvY2FsL2xpYi9ub2RlX21vZHVsZXMvdnVlLXJlc291cmNlL3NyYy91cmwvaW5kZXguanMiLCIuLi8uLi8uLi8uLi91c3IvbG9jYWwvbGliL25vZGVfbW9kdWxlcy92dWUtcmVzb3VyY2Uvc3JjL3VybC9sZWdhY3kuanMiLCIuLi8uLi8uLi8uLi91c3IvbG9jYWwvbGliL25vZGVfbW9kdWxlcy92dWUtcmVzb3VyY2Uvc3JjL3VybC9xdWVyeS5qcyIsIi4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3Z1ZS1yZXNvdXJjZS9zcmMvdXJsL3Jvb3QuanMiLCIuLi8uLi8uLi8uLi91c3IvbG9jYWwvbGliL25vZGVfbW9kdWxlcy92dWUtcmVzb3VyY2Uvc3JjL3VybC90ZW1wbGF0ZS5qcyIsIi4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3Z1ZS1yZXNvdXJjZS9zcmMvdXRpbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0FDR0EsTUFBTSxDQUFDLE9BQU8sR0FBRyxZQUFZO0FBQzNCLE1BQUksR0FBRyxDQUFDO0FBQ04sTUFBRSxFQUFFLGFBQWE7QUFDakIsUUFBSSxFQUFFO0FBQ0osV0FBSyxFQUFFLEVBQUU7QUFDVCxVQUFJLEVBQUUsRUFBRTtLQUNUO0FBQ0QsV0FBTyxFQUFFO0FBQ1AsWUFBTSxFQUFFLGdCQUFVLEdBQUcsRUFBRTtBQUNyQixZQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUU7QUFDN0IsYUFBRyxDQUFDLGNBQWMsRUFBRSxDQUFDO1NBQ3RCO09BQ0Y7S0FDRjtHQUNGLENBQUMsQ0FBQztDQUNKLENBQUM7Ozs7O0FDbEJGLE1BQU0sQ0FBQyxPQUFPLEdBQUcsQ0FBQyxZQUFZO0FBQzVCLGNBQVksQ0FBQzs7QUFDYixTQUFPLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQztBQUN6QixTQUFPLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQztBQUN4QixTQUFPLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQzs7QUFFekIsTUFBSSxRQUFRLEdBQUcsUUFB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LEVBQUUsR0FBRyxLQUFLLENBQUM7Q0FDaEMsQ0FBQyxDQUFDOztBQUVILEdBQUcsQ0FBQyxNQUFNLENBQUMsYUFBYSxFQUFFLFVBQUEsS0FBSyxFQUFJO0FBQ2pDLFNBQU8sS0FBSyxDQUFDLE1BQU0sQ0FBQyxVQUFBLENBQUM7V0FBSSxDQUFDLENBQUMsT0FBTztHQUFBLENBQUMsQ0FBQyxNQUFNLENBQUM7Q0FDNUMsQ0FBQyxDQUFDOztBQUVILEdBQUcsQ0FBQyxNQUFNLENBQUMsYUFBYSxFQUFFLFVBQUEsS0FBSyxFQUFJO0FBQ2pDLFNBQU8sS0FBSyxDQUFDLE1BQU0sQ0FBQyxVQUFBLENBQUM7V0FBSSxDQUFDLENBQUMsQ0FBQyxPQUFPO0dBQUEsQ0FBQyxDQUFDLE1BQU0sQ0FBQztDQUM3QyxDQUFDLENBQUM7O0FBRUgsR0FBRyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsVUFBQSxLQUFLLEVBQUk7QUFDNUIsTUFBSSxRQUFRLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxVQUFBLENBQUM7V0FBSSxDQUFDLENBQUMsS0FBSyxLQUFLLEtBQUs7R0FBQSxDQUFDLENBQUMsTUFBTSxDQUFDO0FBQzNELE1BQUksU0FBUyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsVUFBQSxDQUFDO1dBQUksQ0FBQyxDQUFDLEtBQUssS0FBSyxLQUFLO0dBQUEsQ0FBQyxDQUFDLE1BQU0sQ0FBQztBQUM1RCxNQUFJLFFBQVEsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLFVBQUEsQ0FBQztXQUFJLENBQUMsQ0FBQyxLQUFLLEtBQUssS0FBSztHQUFBLENBQUMsQ0FBQyxNQUFNLENBQUM7QUFDM0QsTUFBSSxNQUFNLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxVQUFBLENBQUM7V0FBSSxDQUFDLENBQUMsS0FBSyxLQUFLLEtBQUs7R0FBQSxDQUFDLENBQUMsTUFBTSxDQUFDO0FBQ3pELFNBQU8sUUFBUSxHQUFHLENBQUMsR0FBRyxTQUFTLEdBQUcsQ0FBQyxHQUFHLFFBQVEsR0FBRyxFQUFFLEdBQUcsTUFBTSxH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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKiBnbG9iYWxzIFZ1ZSAqL1xuLy92YXIgVnVlID0gcmVxdWlyZSgnLi92ZW5kb3IvdnVlLm1pbi5qcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcbiAgbmV3IFZ1ZSh7XG4gICAgZWw6ICcjbG9naW4tZm9ybScsXG4gICAgZGF0YToge1xuICAgICAgZW1haWw6ICcnLFxuICAgICAgcGFzczogJydcbiAgICB9LFxuICAgIG1ldGhvZHM6IHtcbiAgICAgIHN1Ym1pdDogZnVuY3Rpb24gKGV2dCkge1xuICAgICAgICBpZiAoIXRoaXMuZW1haWwgfHwgIXRoaXMucGFzcykge1xuICAgICAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9KTtcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbiAoKSB7XG4gICd1c2Ugc3RyaWN0JztcbiAgcmVxdWlyZSgnLi9zaWdudXAuanMnKSgpO1xuICByZXF1aXJlKCcuL2xvZ2luLmpzJykoKTtcbiAgcmVxdWlyZSgnLi90L2hvbWUuanMnKSgpO1xuXG4gIHZhciBidG5DbG9zZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5jbG9zZScpO1xuICBbXS5mb3JFYWNoLmNhbGwoYnRuQ2xvc2UsIGZ1bmN0aW9uIChlbCkge1xuICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKGV2dCkge1xuICAgICAgdmFyIGJ0biA9IGV2dC50YXJnZXQ7XG4gICAgICB2YXIgdG9wRWxlbWVudCA9IGJ0bi5wYXJlbnROb2RlLnBhcmVudE5vZGU7XG4gICAgICB0b3BFbGVtZW50LnJlbW92ZUNoaWxkKGJ0bi5wYXJlbnROb2RlKTtcbiAgICB9KTtcbiAgfSk7XG59KSgpO1xuIiwiLyogZ2xvYmFscyBWdWUgKi9cbi8vdmFyIFZ1ZSA9IHJlcXVpcmUoJy4vdmVuZG9yL3Z1ZS5taW4uanMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG4gIG5ldyBWdWUoe1xuICAgIGVsOiAnI3NpZ251cC1mb3JtJyxcbiAgICBkYXRhOiB7XG4gICAgICBlbWFpbDogJycsXG4gICAgICBwYXNzOiAnJyxcbiAgICAgIGNrcHM6ICcnXG4gICAgfSxcbiAgICBtZXRob2RzOiB7XG4gICAgICBzdWJtaXQ6IGZ1bmN0aW9uIChldnQpIHtcbiAgICAgICAgaWYgKCF0aGlzLmVtYWlsIHx8ICF0aGlzLnBhc3MgfHwgIXRoaXMuY2twcykge1xuICAgICAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9KTtcbn07XG4iLCIvKiBnbG9iYWxzIFZ1ZSAqL1xuLy92YXIgVnVlID0gcmVxdWlyZSgnLi4vdmVuZG9yL3Z1ZS5taW4uanMnKTtcbnZhciB0aXAgPSByZXF1aXJlKCcuLi91dGlsJykudGlwO1xudmFyIGNsYXNzVmlldyA9IHJlcXVpcmUoJy4vY2xhc3N2aWV3Jyk7XG5WdWUudXNlKHJlcXVpcmUoJ3Z1ZS1yZXNvdXJjZScpKTtcblZ1ZS5maWx0ZXIoJ3ZhbGlkTmFtZScsIHZhbHVlID0+IHtcbiAgcmV0dXJuIHZhbHVlLnNsaWNlKDAsIDQ4KTtcbn0pO1xuXG52YXIgYWRkQ2xhc3MgPSBuZXcgVnVlKHtcbiAgZWw6ICcjY2xhc3MtdGFiLTInLFxuICBkYXRhOiB7XG4gICAgY291cnNlczogW10sXG4gICAgY2xhc3NOYW1lOiAnJyxcbiAgICBjb3Vyc2U6IHt9XG4gIH0sXG4gIG1ldGhvZHM6IHtcbiAgICBhZGRDbGFzcyhldnQpIHtcbiAgICAgIGlmICghdGhpcy5jb3Vyc2UgfHwgIXRoaXMuY2xhc3NOYW1lIHx8IHRoaXMuY2xhc3NOYW1lLmxlbmd0aCA+IDQ4KSByZXR1cm4gZXZ0LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICB2YXIgcHJlQWRkID0ge307XG4gICAgICBwcmVBZGQucmVmX2NvdXJzZSA9IHRoaXMuY291cnNlLl9pZDtcbiAgICAgIHByZUFkZC5jbGFzc19uYW1lID0gdGhpcy5jb3Vyc2UubmFtZSArICctJyArIHRoaXMuY291cnNlLnRlcm0gKyAnLScgKyB0aGlzLmNsYXNzTmFtZTtcbiAgICAgIHRoaXMuJGh0dHAucG9zdCgnL2FwaS90L2NsYXNzJywgcHJlQWRkKVxuICAgICAgICAudGhlbihyZXMgPT4ge1xuICAgICAgICAgIHRoaXMuY2xhc3NOYW1lID0gJyc7XG4gICAgICAgICAgdGhpcy5jb3Vyc2UgPSB7fTtcbiAgICAgICAgICBjbGFzc1ZpZXcuZ2V0KCk7XG4gICAgICAgICAgdGlwKCfmt7vliqDmiJDlip8nLCAnc3VjY2VzcycpO1xuICAgICAgICB9LCBlcnIgPT4gdGlwKCfmt7vliqDlpLHotKUnLCAnZXJyb3InKSk7XG4gICAgfVxuICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBhZGRDbGFzcztcbiIsIi8qIGdsb2JhbHMgVnVlICovXG4vL3ZhciBWdWUgPSByZXF1aXJlKCcuLi92ZW5kb3IvdnVlLm1pbi5qcycpO1xudmFyIHRpcCA9IHJlcXVpcmUoJy4uL3V0aWwnKS50aXA7XG52YXIgY291cnNlVmlldyA9IHJlcXVpcmUoJy4vY291cnNldmlldycpO1xuVnVlLnVzZShyZXF1aXJlKCd2dWUtcmVzb3VyY2UnKSk7XG5cblZ1ZS5maWx0ZXIoJ3ZhbGlkTmFtZScsIHZhbHVlID0+IHtcbiAgcmV0dXJuIHZhbHVlLnNsaWNlKDAsIDQ4KTtcbn0pO1xudmFyIGFkZENvdXJzZSA9IG5ldyBWdWUoe1xuICBlbDogJyNjb3Vyc2UtdGFiLTInLFxuICBkYXRhOiB7XG4gICAgY291cnNlOiB7XG4gICAgICBuYW1lOiAnJyxcbiAgICAgIGR1cmF0aW9uOiAzMixcbiAgICAgIHRlcm06ICcnLFxuICAgICAgY2hhcHRlcnM6IFtdLFxuICAgICAgcmVmX3FzZXQ6IFtdXG4gICAgfVxuICB9LFxuICBtZXRob2RzOiB7XG4gICAgYWRkKGV2dCkge1xuICAgICAgaWYgKCF0aGlzLmNvdXJzZS5uYW1lKSBldnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIGVsc2Uge1xuICAgICAgICB0aGlzLiRodHRwLnBvc3QoJy9hcGkvdC9jb3Vyc2UnLCB0aGlzLmNvdXJzZSlcbiAgICAgICAgICAudGhlbihyZXMgPT4ge1xuICAgICAgICAgICAgdGlwKCfmt7vliqDmiJDlip8nLCAnc3VjY2VzcycpO1xuICAgICAgICAgICAgdGhpcy5jb3Vyc2UubmFtZSA9ICcnO1xuICAgICAgICAgICAgdGhpcy5jb3Vyc2UuZHVyYXRpb24gPSAzMjtcbiAgICAgICAgICAgIGNvdXJzZVZpZXcuZ2V0KCk7XG4gICAgICAgICAgfSwgZXJyID0+IHtcbiAgICAgICAgICAgIHRpcCgn5re75Yqg5aSx6LSlJywgJ2Vycm9yJyk7XG4gICAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBhZGRDb3Vyc2U7XG4iLCIvKiBnbG9iYWxzIFZ1ZSBYTFNYICovXG4vL3ZhciBWdWUgPSByZXF1aXJlKCcuLi92ZW5kb3IvdnVlLm1pbi5qcycpO1xudmFyIGNvdXJzZVZpZXcgPSByZXF1aXJlKCcuL2NvdXJzZXZpZXcnKTtcbnZhciBjbGFzc1ZpZXcgPSByZXF1aXJlKCcuL2NsYXNzdmlldycpO1xudmFyIHRpcCA9IHJlcXVpcmUoJy4uL3V0aWwnKS50aXA7XG4vL3ZhciBYTFNYID0gcmVxdWlyZSgneGxzeC1icm93c2VyaWZ5LXNoaW0nKTtcblZ1ZS51c2UocmVxdWlyZSgndnVlLXJlc291cmNlJykpO1xuXG52YXIgYWRkUXVpeiA9IG5ldyBWdWUoe1xuICBlbDogJyNjb3Vyc2UtdGFiLTMnLFxuICBkYXRhOiB7XG4gICAgY291cnNlczogW10sXG4gICAgY291cnNlOiB7XG4gICAgICBfaWQ6ICcnLFxuICAgICAgY2hhcHRlcjogJydcbiAgICB9LFxuICAgIGpzb25EYXRhOiBbXVxuICB9LFxuICBjb21wdXRlZDoge1xuICAgIGlkeCgpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gdGhpcy5jb3Vyc2VzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICBpZiAodGhpcy5jb3Vyc2VzW2ldLl9pZCA9PT0gdGhpcy5jb3Vyc2UuX2lkKSByZXR1cm4gaTtcbiAgICAgIH1cbiAgICAgIHJldHVybiAtMTtcbiAgICB9XG4gIH0sXG4gIG1ldGhvZHM6IHtcbiAgICBzYXZlKGV2dCkge1xuICAgICAgaWYgKCF0aGlzLmNvdXJzZS5faWQgfHwgIXRoaXMuanNvbkRhdGEubGVuZ3RoKSByZXR1cm4gZXZ0LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICB2YXIgcXVpenMgPSBbXTtcbiAgICAgIHZhciBxc2V0ID0ge307XG4gICAgICB0aGlzLmpzb25EYXRhLmZvckVhY2goZWwgPT4ge1xuICAgICAgICB2YXIgcSA9IHt9O1xuICAgICAgICBxLmdlbnJlID0gZWwu57G75Z6LO1xuICAgICAgICBxLmRlc2NyaWJlID0ge307XG4gICAgICAgIHEuZGVzY3JpYmUuY29udGVudCA9IGVsLumimOebrjtcbiAgICAgICAgcS5yZWZfcG9pbnQgPSBlbC7nn6Xor4bngrk7XG4gICAgICAgIHEuYW5zd2VycyA9IFtlbC7lj4LogIPnrZTmoYhdO1xuICAgICAgICBpZiAocS5nZW5yZSA9PT0gJ+WNlemAiemimCcgfHwgcS5nZW5yZSA9PT0gJ+WkmumAiemimCcpIHtcbiAgICAgICAgICB2YXIgc2VjcyA9IGVsLumAiemhuS5zcGxpdCgnOycpO1xuICAgICAgICAgIHEuc2VsZWN0aW9ucyA9IHNlY3MubWFwKGVsID0+IGVsLnRyaW0oKS5zbGljZSgyKSk7XG4gICAgICAgICAgcS5hbnN3ZXJzID0gZWwu5Y+C6ICD562U5qGILnNwbGl0KCcnKS5tYXAoZWwgPT4gc2Vjcy5maWx0ZXIoc2VjID0+IHNlYy5pbmRleE9mKGVsKSA9PT0gMCkuam9pbignJykuc2xpY2UoMikudHJpbSgpKTtcbiAgICAgICAgfVxuICAgICAgICBxdWl6cy5wdXNoKHEpO1xuICAgICAgfSk7XG4gICAgICBxc2V0LnF1aXpzID0gcXVpenM7XG4gICAgICBxc2V0LnJlZl9jb3Vyc2UgPSB0aGlzLmNvdXJzZS5faWQ7XG4gICAgICBxc2V0LnJlZl9jaGFwdGVyID0gdGhpcy5jb3Vyc2UuY2hhcHRlcjtcbiAgICAgIHRoaXMuJGh0dHAucG9zdCgnL2FwaS90L3FzZXQnLCBxc2V0KVxuICAgICAgICAudGhlbihyZXMgPT4ge1xuICAgICAgICAgIHRpcCgn5b2V5YWl5oiQ5YqfJywgJ3N1Y2Nlc3MnKTtcbiAgICAgICAgICB0aGlzLmNvdXJzZSA9IHt9O1xuICAgICAgICAgIHRoaXMuanNvbkRhdGEgPSBbXTtcbiAgICAgICAgICBjbGFzc1ZpZXcuZ2V0KCk7XG4gICAgICAgIH0sIGVyciA9PiB7XG4gICAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgICAgICB0aXAoJ+W9leWFpeWksei0pScsICdlcnJvcicpO1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgIHJlYWQoZXZ0LCBpZHgpIHtcbiAgICAgIGlmICghdGhpcy5jb3Vyc2UuX2lkIHx8ICF0aGlzLmNvdXJzZS5jaGFwdGVyKSByZXR1cm4gZXZ0LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICB2YXIgY291cnNlID0gdGhpcy5jb3Vyc2VzLmZpbHRlcihjb3Vyc2UgPT4gY291cnNlLl9pZCA9PT0gdGhpcy5jb3Vyc2UuX2lkKVswXTtcbiAgICAgIHZhciBjaGFwdGVyID0gY291cnNlLmNoYXB0ZXJzLmZpbHRlcihjaGFwID0+IGNoYXAudGl0bGUgPT09IHRoaXMuY291cnNlLmNoYXB0ZXIpWzBdIHx8IHt9O1xuICAgICAgdmFyIHRhZ3MgPSBjaGFwdGVyLnRhZ3MgfHwgW107XG4gICAgICB2YXIgZmlsZSA9IGV2dC50YXJnZXQuZmlsZXNbMF07XG4gICAgICB2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcbiAgICAgIHJlYWRlci5vbmxvYWQgPSBmdW5jdGlvbiAoZSkge1xuICAgICAgICB2YXIgZGF0YSA9IGUudGFyZ2V0LnJlc3VsdDtcbiAgICAgICAgdmFyIHdvcmtib29rID0gWExTWC5yZWFkKGRhdGEsIHtcbiAgICAgICAgICB0eXBlOiAnYmluYXJ5J1xuICAgICAgICB9KTtcbiAgICAgICAgdmFyIGZpcnN0X3NoZWV0X25hbWUgPSB3b3JrYm9vay5TaGVldE5hbWVzWzBdO1xuICAgICAgICB2YXIgZmlyc3Rfc2hlZXQgPSB3b3JrYm9vay5TaGVldHNbZmlyc3Rfc2hlZXRfbmFtZV07XG4gICAgICAgIGFkZFF1aXouanNvbkRhdGEgPSBYTFNYLnV0aWxzLnNoZWV0X3RvX2pzb24oZmlyc3Rfc2hlZXQpLmZpbHRlcihlbCA9PiB7XG4gICAgICAgICAgaWYgKHRhZ3MuaW5kZXhPZihlbC7nn6Xor4bngrkpID09PSAtMSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIGVsc2UgaWYgKGVsLuexu+WeiyA9PT0gJ+mXruetlOmimCcpIHtcbiAgICAgICAgICAgIGVsLumAiemhuSA9ICcnO1xuICAgICAgICAgICAgcmV0dXJuICEhKGVsLumimOebriAmJiBlbC7lj4LogIPnrZTmoYgpO1xuICAgICAgICAgIH0gZWxzZSBpZiAoZWwu57G75Z6LID09PSAn5Yik5pat6aKYJykge1xuICAgICAgICAgICAgaWYgKCFlbC7lj4LogIPnrZTmoYgpIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIGVsc2UgaWYgKGVsLuWPguiAg+etlOahiCA9PT0gJ+ato+ehricgfHwgZWwu5Y+C6ICD562U5qGIID09PSAn6ZSZ6K+vJykgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfSBlbHNlIGlmIChlbC7nsbvlnosgPT09ICfljZXpgInpopgnIHx8IGVsLuexu+WeiyA9PT0gJ+WkmumAiemimCcpIHtcbiAgICAgICAgICAgIGlmICghZWwu6YCJ6aG5KSByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB2YXIgc2VsZWN0aW9uID0gZWwu6YCJ6aG5LnNwbGl0KCc7JykubWFwKHMgPT4gcy50cmltKCkpLmZpbHRlcihlbCA9PiAvXltBLVpdXFwuW15cXC5dLy50ZXN0KGVsKSAmJiBlbC5tYXRjaCgvW0EtWl1cXC4vZykubGVuZ3RoID09PSAxKTtcbiAgICAgICAgICAgIGlmIChzZWxlY3Rpb24ubGVuZ3RoIDwgMikgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgZWwu6YCJ6aG5ID0gc2VsZWN0aW9uLmpvaW4oJzsnKTtcbiAgICAgICAgICAgIHZhciBwcmUgPSAhIShlbC7popjnm64gJiYgZWwu5Y+C6ICD562U5qGIKTtcbiAgICAgICAgICAgIGlmIChwcmUpIHJldHVybiAvXltBLVpdKyQvLnRlc3QoZWwu5Y+C6ICD562U5qGIKSAmJiBlbC7lj4LogIPnrZTmoYguc3BsaXQoJycpLmxlbmd0aCA8PSBzZWxlY3Rpb24ubGVuZ3RoO1xuICAgICAgICAgICAgcmV0dXJuIHByZTtcbiAgICAgICAgICB9IGVsc2UgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIGlmICghZmlsZSkgcmV0dXJuIG51bGw7XG4gICAgICBlbHNlIHJlYWRlci5yZWFkQXNCaW5hcnlTdHJpbmcoZmlsZSk7XG4gICAgfVxuICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBhZGRRdWl6O1xuIiwiLyogZ2xvYmFscyBWdWUgWExTWCAqL1xuLy92YXIgVnVlID0gcmVxdWlyZSgnLi4vdmVuZG9yL3Z1ZS5taW4uanMnKTtcbnZhciBjbGFzc1ZpZXcgPSByZXF1aXJlKCcuL2NsYXNzdmlldycpO1xudmFyIHRpcCA9IHJlcXVpcmUoJy4uL3V0aWwnKS50aXA7XG4vL3ZhciBYTFNYID0gcmVxdWlyZSgneGxzeC1icm93c2VyaWZ5LXNoaW0nKTtcblZ1ZS51c2UocmVxdWlyZSgndnVlLXJlc291cmNlJykpO1xuXG52YXIgYWRkU3R1ZGVudHMgPSBuZXcgVnVlKHtcbiAgZWw6ICcjY2xhc3MtdGFiLTMnLFxuICBkYXRhOiB7XG4gICAgY2xhc3NlczogW10sXG4gICAgQ2xhc3M6IHt9LFxuICAgIGpzb25EYXRhOiBbXVxuICB9LFxuICBtZXRob2RzOiB7XG4gICAgcmVhZChldnQpIHtcbiAgICAgIGlmICghdGhpcy5DbGFzcy5faWQpIHJldHVybiBldnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIHZhciBmaWxlID0gZXZ0LnRhcmdldC5maWxlc1swXTtcbiAgICAgIHZhciByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xuICAgICAgcmVhZGVyLm9ubG9hZCA9IGZ1bmN0aW9uIChldnQpIHtcbiAgICAgICAgdmFyIGRhdGEgPSBldnQudGFyZ2V0LnJlc3VsdDtcbiAgICAgICAgdmFyIHdvcmtib29rID0gWExTWC5yZWFkKGRhdGEsIHtcbiAgICAgICAgICB0eXBlOiAnYmluYXJ5J1xuICAgICAgICB9KTtcbiAgICAgICAgdmFyIGZpcnN0X3NoZWV0X25hbWUgPSB3b3JrYm9vay5TaGVldE5hbWVzWzBdO1xuICAgICAgICB2YXIgZmlyc3Rfc2hlZXQgPSB3b3JrYm9vay5TaGVldHNbZmlyc3Rfc2hlZXRfbmFtZV07XG4gICAgICAgIGFkZFN0dWRlbnRzLmpzb25EYXRhID0gWExTWC51dGlscy5zaGVldF90b19qc29uKGZpcnN0X3NoZWV0KS5maWx0ZXIoZWwgPT4ge1xuICAgICAgICAgIGlmICghZWwu5aeT5ZCNIHx8ICFlbC7lrablj7cgfHwgIWVsLuS4k+S4miB8fCAhZWwu54+t57qnKSByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgaWYgKCFmaWxlKSByZXR1cm4gbnVsbDtcbiAgICAgIGVsc2UgcmVhZGVyLnJlYWRBc0JpbmFyeVN0cmluZyhmaWxlKTtcbiAgICB9LFxuICAgIHNhdmUoZXZ0KSB7XG4gICAgICBpZiAoIXRoaXMuQ2xhc3MuX2lkKSByZXR1cm4gZXZ0LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICB0aGlzLkNsYXNzLnJlZl9zdHVkZW50cyA9IHRoaXMuanNvbkRhdGEubWFwKGVsID0+IHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBuYW1lOiBlbC7lp5PlkI0sXG4gICAgICAgICAgbm86IGVsLuWtpuWPtyxcbiAgICAgICAgICBzcGVyY2lhbHR5OiBlbC7kuJPkuJosXG4gICAgICAgICAgY2xhc3NOYW1lOiBlbC7nj63nuqdcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICB0aGlzLiRodHRwLnB1dCgnL2FwaS90L2NsYXNzJywgdGhpcy5DbGFzcylcbiAgICAgICAgLnRoZW4ocmVzID0+IHtcbiAgICAgICAgICB0aXAoJ+W9leWFpeaIkOWKnycsICdzdWNjZXNzJyk7XG4gICAgICAgICAgdGhpcy5qc29uRGF0YSA9IFtdO1xuICAgICAgICAgIHRoaXMuQ2xhc3MgPSB7fTtcbiAgICAgICAgICBjbGFzc1ZpZXcuZ2V0KCk7XG4gICAgICAgIH0sIGVyciA9PiB0aXAoJ+e9kee7nOaVhemanCcsICdlcnJvcicpKTtcbiAgICB9XG4gIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGFkZFN0dWRlbnRzO1xuIiwiLyogZ2xvYmFscyBNYXRlcmlhbEJ1dHRvbiBWdWUgKi9cbi8vdmFyIFZ1ZSA9IHJlcXVpcmUoJy4uL3ZlbmRvci92dWUubWluLmpzJyk7XG52YXIgYWRkU3R1ZGVudHMgPSByZXF1aXJlKCcuL2FkZHN0dWRlbnRzJyk7XG52YXIgcHViUXVpeiA9IHJlcXVpcmUoJy4vcHVicXVpeicpO1xudmFyIHRlc3RWaWV3ID0gcmVxdWlyZSgnLi90ZXN0dmlldycpO1xudmFyIHRpcCA9IHJlcXVpcmUoJy4uL3V0aWwnKS50aXA7XG5WdWUudXNlKHJlcXVpcmUoJ3Z1ZS1yZXNvdXJjZScpKTtcblxudmFyIGNsYXNzVmlldyA9IG5ldyBWdWUoe1xuICBlbDogJyNjbGFzcy10YWItMScsXG4gIGRhdGE6IHtcbiAgICBjbGFzc2VzOiBbXVxuICB9LFxuICBtZXRob2RzOiB7XG4gICAgdG9nZ2xlQ2FyZChldnQpIHtcbiAgICAgIHZhciB0YXJnZXQgPSBldnQudGFyZ2V0O1xuICAgICAgLy8gdGFyZ2V0IGlzIGRpZmZlcmVudCBpbiBjaHJvbWUgYW5kIGZpcmVmb3hcbiAgICAgIGlmICh0YXJnZXQubm9kZU5hbWUgPT09ICdJJykgdGFyZ2V0ID0gdGFyZ2V0LnBhcmVudE5vZGU7XG4gICAgICB2YXIgY2FyZCA9IHRhcmdldC5wYXJlbnROb2RlLnBhcmVudE5vZGU7XG4gICAgICB2YXIgYm9keXMgPSBjYXJkLnF1ZXJ5U2VsZWN0b3JBbGwoJy5ib2R5Jyk7XG4gICAgICB2YXIgZnVsbFRleHQgPSBjYXJkLnF1ZXJ5U2VsZWN0b3IoJy5mdWxsLXRleHQnKTtcbiAgICAgIGlmIChmdWxsVGV4dC5pbm5lclRleHQgPT09ICdmdWxsc2NyZWVuX2V4aXQnKSBmdWxsVGV4dC5pbm5lclRleHQgPSAnZnVsbHNjcmVlbic7XG4gICAgICBlbHNlIGZ1bGxUZXh0LmlubmVyVGV4dCA9ICdmdWxsc2NyZWVuX2V4aXQnO1xuICAgICAgW10uZm9yRWFjaC5jYWxsKGJvZHlzLCBlbCA9PiB7XG4gICAgICAgIGlmICghZWwuc3R5bGUuZGlzcGxheSB8fCBlbC5zdHlsZS5kaXNwbGF5ID09PSAnbm9uZScpIGVsLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgICAgICBlbHNlIGVsLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICB9KTtcbiAgICB9LFxuICAgIGdldCgpIHtcbiAgICAgIHRoaXMuJGh0dHAuZ2V0KCcvYXBpL3QvY2xhc3MnKVxuICAgICAgICAudGhlbihyZXMgPT4ge1xuICAgICAgICAgIHRoaXMuY2xhc3NlcyA9IHJlcy5kYXRhO1xuICAgICAgICAgIGFkZFN0dWRlbnRzLmNsYXNzZXMgPSB0aGlzLmNsYXNzZXM7XG4gICAgICAgICAgcHViUXVpei5jbGFzc2VzID0gdGhpcy5jbGFzc2VzO1xuICAgICAgICAgIHB1YlF1aXouZ2V0KCk7XG4gICAgICAgICAgdGVzdFZpZXcuY2xhc3NlcyA9IHRoaXMuY2xhc3NlcztcbiAgICAgICAgICB0ZXN0Vmlldy5nZXQoKTtcbiAgICAgICAgfSwgZXJyID0+IHRpcCgn572R57uc5pWF6ZqcJyArIGVyci50b1N0cmluZygpLCAnZXJyb3InKSk7XG4gICAgfSxcbiAgICBkZWwoaWR4KSB7XG4gICAgICB0aGlzLiRodHRwLmRlbGV0ZSgnL2FwaS90L2NsYXNzJywgdGhpcy5jbGFzc2VzW2lkeF0pXG4gICAgICAgIC50aGVuKHJlcyA9PiB7XG4gICAgICAgICAgdGhpcy5jbGFzc2VzLnNwbGljZShpZHgsIDEpO1xuICAgICAgICAgIGFkZFN0dWRlbnRzLmNsYXNzZXMgPSB0aGlzLmNsYXNzZXM7XG4gICAgICAgICAgcHViUXVpei5jbGFzc2VzID0gdGhpcy5jbGFzc2VzO1xuICAgICAgICAgIHB1YlF1aXouZ2V0KCk7XG4gICAgICAgICAgdGVzdFZpZXcuY2xhc3NlcyA9IHRoaXMuY2xhc3NlcztcbiAgICAgICAgICB0ZXN0Vmlldy5nZXQoKTtcbiAgICAgICAgICB0aXAoJ+WIoOmZpOaIkOWKnycsICdzdWNjZXNzJyk7XG4gICAgICAgIH0sIGVyciA9PiB0aXAoJ+e9kee7nOaVhemanCcsICdlcnJvcicpKTtcbiAgICB9XG4gIH0sXG4gIHJlYWR5KCkge1xuICAgIHRoaXMuZ2V0KCk7XG4gIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzVmlldztcbiIsIi8qIGdsb2JhbHMgTWF0ZXJpYWxCdXR0b24gVnVlICovXG4vL3ZhciBWdWUgPSByZXF1aXJlKCcuLi92ZW5kb3IvdnVlLm1pbi5qcycpO1xudmFyIHRpcCA9IHJlcXVpcmUoJy4uL3V0aWwnKS50aXA7XG52YXIgcmVuZGVyQnV0dG9uID0gcmVxdWlyZSgnLi4vdXRpbCcpLnJlbmRlckJ1dHRvbjtcbnZhciBhZGRRdWl6ID0gcmVxdWlyZSgnLi9hZGRxdWl6Jyk7XG52YXIgcXVpelZpZXcgPSByZXF1aXJlKCcuL3F1aXp2aWV3Jyk7XG52YXIgYWRkQ2xhc3MgPSByZXF1aXJlKCcuL2FkZGNsYXNzJyk7XG52YXIgY2xhc3NWaWV3ID0gcmVxdWlyZSgnLi9jbGFzc3ZpZXcnKTtcblZ1ZS51c2UocmVxdWlyZSgndnVlLXJlc291cmNlJykpO1xuXG5WdWUuZmlsdGVyKCd2YWxpZENoYXB0ZXInLCB2YWx1ZSA9PiB7XG4gIGlmICghdmFsdWUpIHJldHVybiAn5paw56+H56ugJztcbiAgcmV0dXJuIHZhbHVlLnNsaWNlKDAsIDI4KTtcbn0pO1xuVnVlLmZpbHRlcigndmFsaWRUYWcnLCB2YWx1ZSA9PiB7XG4gIGlmICghdmFsdWUpIHJldHVybiAnJztcbiAgcmV0dXJuIHZhbHVlLnNsaWNlKDAsIDE2KTtcbn0pO1xudmFyIGNvdXJzZVZpZXcgPSBuZXcgVnVlKHtcbiAgZWw6ICcjY291cnNlLXRhYi0xJyxcbiAgZGF0YToge1xuICAgIGNhcmRzOiBbXVxuICB9LFxuICBtZXRob2RzOiB7XG4gICAgdG9nZ2xlQ2FyZChldnQpIHtcbiAgICAgIHZhciB0YXJnZXQgPSBldnQudGFyZ2V0O1xuICAgICAgLy8gdGFyZ2V0IGlzIGRpZmZlcmVudCBpbiBjaHJvbWUgYW5kIGZpcmVmb3hcbiAgICAgIGlmICh0YXJnZXQubm9kZU5hbWUgPT09ICdJJykgdGFyZ2V0ID0gdGFyZ2V0LnBhcmVudE5vZGU7XG4gICAgICB2YXIgY2FyZCA9IHRhcmdldC5wYXJlbnROb2RlLnBhcmVudE5vZGU7XG4gICAgICB2YXIgYm9keXMgPSBjYXJkLnF1ZXJ5U2VsZWN0b3JBbGwoJy5ib2R5Jyk7XG4gICAgICB2YXIgZnVsbFRleHQgPSBjYXJkLnF1ZXJ5U2VsZWN0b3IoJy5mdWxsLXRleHQnKTtcbiAgICAgIGlmIChmdWxsVGV4dC5pbm5lclRleHQgPT09ICdmdWxsc2NyZWVuX2V4aXQnKSBmdWxsVGV4dC5pbm5lclRleHQgPSAnZnVsbHNjcmVlbic7XG4gICAgICBlbHNlIGZ1bGxUZXh0LmlubmVyVGV4dCA9ICdmdWxsc2NyZWVuX2V4aXQnO1xuICAgICAgW10uZm9yRWFjaC5jYWxsKGJvZHlzLCBlbCA9PiB7XG4gICAgICAgIGlmICghZWwuc3R5bGUuZGlzcGxheSB8fCBlbC5zdHlsZS5kaXNwbGF5ID09PSAnbm9uZScpIGVsLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgICAgICBlbHNlIGVsLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICB9KTtcbiAgICB9LFxuICAgIGVkaXRDaGFwdGVyKGV2dCkge1xuICAgICAgdmFyIHQgPSBldnQudGFyZ2V0O1xuICAgICAgdmFyIHAgPSBldnQudGFyZ2V0LnBhcmVudE5vZGU7XG4gICAgICB2YXIgY3R4ID0gcC5xdWVyeVNlbGVjdG9yKCcuZWRpdGFibGUnKTtcbiAgICAgIHZhciBpbnB1dCA9IHAucXVlcnlTZWxlY3RvcignLmVkaXRJbnB1dCcpO1xuICAgICAgaWYgKHQgPT09IGN0eCkge1xuICAgICAgICB0LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgIGlucHV0LnN0eWxlLmRpc3BsYXkgPSAnaW5saW5lJztcbiAgICAgICAgd2luZG93LnNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgIHAucXVlcnlTZWxlY3RvcignLmVkaXRJbnB1dCcpLmZvY3VzKCk7XG4gICAgICAgIH0sIDMwMCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgIGN0eC5zdHlsZS5kaXNwbGF5ID0gJ2lubGluZSc7XG4gICAgICB9XG4gICAgfSxcbiAgICBlZGl0VGFnKGV2dCwgdGFnSWR4LCBjaGFwSWR4LCBjYXJkSWR4KSB7XG4gICAgICB2YXIgcCA9IGV2dC50YXJnZXQucGFyZW50Tm9kZTtcbiAgICAgIHZhciB0ID0gZXZ0LnRhcmdldDtcbiAgICAgIHZhciBjdHggPSBwLnF1ZXJ5U2VsZWN0b3IoJy5lZGl0YWJsZScpO1xuICAgICAgdmFyIGlucHV0ID0gcC5xdWVyeVNlbGVjdG9yKCcuZWRpdElucHV0Jyk7XG4gICAgICBpZiAodCA9PT0gY3R4KSB7XG4gICAgICAgIHQuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgaW5wdXQuc3R5bGUuZGlzcGxheSA9ICdpbmxpbmUtYmxvY2snO1xuICAgICAgICB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgcC5xdWVyeVNlbGVjdG9yKCcuZWRpdElucHV0JykuZm9jdXMoKTtcbiAgICAgICAgfSwgMzAwKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHQuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgY3R4LnN0eWxlLmRpc3BsYXkgPSAnaW5saW5lLWJsb2NrJztcbiAgICAgICAgaWYgKCF0aGlzLmNhcmRzW2NhcmRJZHhdLmNoYXB0ZXJzW2NoYXBJZHhdLnRhZ3NbdGFnSWR4XSkgdGhpcy5jYXJkc1tjYXJkSWR4XS5jaGFwdGVyc1tjaGFwSWR4XS50YWdzLnNwbGljZSh0YWdJZHgsIDEpO1xuICAgICAgfVxuICAgIH0sXG4gICAgYWRkVGFnKGNoYXBJZHgsIGNhcmRJZHgpIHtcbiAgICAgIHRoaXMuY2FyZHNbY2FyZElkeF0uY2hhcHRlcnNbY2hhcElkeF0udGFncy5wdXNoKCfnn6Xor4bngrknKTtcbiAgICB9LFxuICAgIGFkZENoYXB0ZXIoY2FyZElkeCkge1xuICAgICAgdmFyIGNoYXB0ZXIgPSB7XG4gICAgICAgIHRpdGxlOiAn5paw56+H56ugJyxcbiAgICAgICAgdGFnczogW11cbiAgICAgIH07XG4gICAgICB0aGlzLmNhcmRzW2NhcmRJZHhdLmNoYXB0ZXJzLnB1c2goY2hhcHRlcik7XG4gICAgICByZW5kZXJCdXR0b24oJyNjb3Vyc2UtdGFiLTEnKTtcbiAgICB9LFxuICAgIHJlbW92ZUNoYXB0ZXIoY2hhcGlkeCwgY2FyZElkeCkge1xuICAgICAgdGhpcy5jYXJkc1tjYXJkSWR4XS5jaGFwdGVycy5zcGxpY2UoY2hhcGlkeCwgMSk7XG4gICAgfSxcbiAgICBzYXZlKGNhcmRJZHgsIGV2dCkge1xuICAgICAgdmFyIGRhdGEgPSB0aGlzLmNhcmRzW2NhcmRJZHhdO1xuICAgICAgaWYgKG5ldyBTZXQoZGF0YS5jaGFwdGVycy5tYXAoZSA9PiBlLnRpdGxlKSkuc2l6ZSAhPT0gZGF0YS5jaGFwdGVycy5sZW5ndGgpIHtcbiAgICAgICAgdGlwKCfnq6DoioLlkI3kuI3og73ph43lpI0nLCAnZXJyb3InKTtcbiAgICAgICAgcmV0dXJuIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgfVxuICAgICAgdGhpcy4kaHR0cC5wdXQoJy9hcGkvdC9jb3Vyc2UnLCBkYXRhKVxuICAgICAgICAudGhlbihyZXMgPT4ge1xuICAgICAgICAgIHRpcCgn5L+d5a2Y5oiQ5YqfJywgJ3N1Y2Nlc3MnKTtcbiAgICAgICAgICBhZGRRdWl6LmNvdXJzZXMgPSB0aGlzLmNhcmRzO1xuICAgICAgICAgIHF1aXpWaWV3LmNvdXJzZXMgPSB0aGlzLmNhcmRzO1xuICAgICAgICAgIGFkZENsYXNzLmNvdXJzZXMgPSB0aGlzLmNhcmRzO1xuICAgICAgICAgIGNsYXNzVmlldy5nZXQoKTtcbiAgICAgICAgfSwgZXJyb3IgPT4gdGlwKCfkv53lrZjlpLHotKUnLCAnZXJyb3InKSk7XG4gICAgfSxcbiAgICBkZWwoY2FyZElkeCkge1xuICAgICAgdmFyIGlkID0ge307XG4gICAgICBpZC5faWQgPSB0aGlzLmNhcmRzW2NhcmRJZHhdLl9pZDtcbiAgICAgIHRoaXMuJGh0dHAuZGVsZXRlKCcvYXBpL3QvY291cnNlJywgaWQpXG4gICAgICAgIC50aGVuKHJlcyA9PiB7XG4gICAgICAgICAgdGlwKCfliKDpmaTmiJDlip8nLCAnc3VjY2VzcycpO1xuICAgICAgICAgIHRoaXMuY2FyZHMuc3BsaWNlKGNhcmRJZHgsIDEpO1xuICAgICAgICAgIGFkZFF1aXouY291cnNlcyA9IHRoaXMuY2FyZHM7XG4gICAgICAgICAgcXVpelZpZXcuY291cnNlcyA9IHRoaXMuY2FyZHM7XG4gICAgICAgICAgYWRkQ2xhc3MuY291cnNlcyA9IHRoaXMuY2FyZHM7XG4gICAgICAgICAgYWRkQ2xhc3MuY291cnNlcyA9IHRoaXMuY2FyZHM7XG4gICAgICAgICAgY2xhc3NWaWV3LmdldCgpO1xuICAgICAgICB9LCBlcnJvciA9PiB0aXAoJ+WIoOmZpOWksei0pScsICdlcnJvcicpKTtcbiAgICB9LFxuICAgIGdldCgpIHtcbiAgICAgIHRoaXMuJGh0dHAuZ2V0KCcvYXBpL3QvY291cnNlJylcbiAgICAgICAgLnRoZW4ocmVzID0+IHtcbiAgICAgICAgICB0aGlzLmNhcmRzID0gcmVzLmRhdGE7XG4gICAgICAgICAgcmVuZGVyQnV0dG9uKCcjY291cnNlLXRhYi0xJyk7XG4gICAgICAgICAgYWRkUXVpei5jb3Vyc2VzID0gdGhpcy5jYXJkcztcbiAgICAgICAgICBxdWl6Vmlldy5jb3Vyc2VzID0gdGhpcy5jYXJkcztcbiAgICAgICAgICBhZGRDbGFzcy5jb3Vyc2VzID0gdGhpcy5jYXJkcztcbiAgICAgICAgfSwgZXJyb3IgPT4gdGlwKCfnvZHnu5zmlYXpmpwnLCAnZXJyb3InKSk7XG4gICAgfVxuICB9LFxuICByZWFkeSgpIHtcbiAgICB0aGlzLiRodHRwLmdldCgnL2FwaS90L2NvdXJzZScpXG4gICAgICAudGhlbihyZXMgPT4ge1xuICAgICAgICB0aGlzLmNhcmRzID0gcmVzLmRhdGE7XG4gICAgICAgIHJlbmRlckJ1dHRvbignI2NvdXJzZS10YWItMScpO1xuICAgICAgICBhZGRRdWl6LmNvdXJzZXMgPSB0aGlzLmNhcmRzO1xuICAgICAgICBxdWl6Vmlldy5jb3Vyc2VzID0gdGhpcy5jYXJkcztcbiAgICAgICAgYWRkQ2xhc3MuY291cnNlcyA9IHRoaXMuY2FyZHM7XG4gICAgICB9LCBlcnJvciA9PiB0aXAoJ+e9kee7nOaVhemanCcsICdlcnJvcicpKTtcbiAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gY291cnNlVmlldztcbiIsIi8qIGdsb2JhbHMgTWF0ZXJpYWxMYXlvdXRUYWIsIE1hdGVyaWFsTGF5b3V0LCBNYXRlcmlhbFRhYnMsIE1hdGVyaWFsVGFiLCBNYXRlcmlhbFJpcHBsZSAqL1xuLyogZ2xvYmFscyBWdWUgKi9cblxuLy92YXIgVnVlID0gcmVxdWlyZSgnLi4vdmVuZG9yL3Z1ZS5taW4uanMnKTtcbnZhciByZW5kZXJUYWJzID0gcmVxdWlyZSgnLi4vdXRpbCcpLnJlbmRlclRhYnM7XG52YXIgY291cnNlVmlldyA9IHJlcXVpcmUoJy4vY291cnNldmlldycpO1xudmFyIGFkZENvdXJzZSA9IHJlcXVpcmUoJy4vYWRkY291cnNlJyk7XG52YXIgY2xhc3NWaWV3ID0gcmVxdWlyZSgnLi9jbGFzc3ZpZXcnKTtcbnZhciBjb2xsZWN0ID0gcmVxdWlyZSgnLi90ZXN0dmlldycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKGRvY3VtZW50LmxvY2F0aW9uLnBhdGhuYW1lICE9PSAnL3QvaG9tZScpIHJldHVybiBudWxsO1xuICB2YXIgbGF5b3V0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLm1kbC1qcy1sYXlvdXQnKTtcbiAgdmFyIHBhbmVscyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5tZGwtbGF5b3V0X190YWItcGFuZWwnKTtcbiAgdmFyIGNvdXJzZVRhYnMgPSBbe1xuICAgIHVybDogJyNjb3Vyc2UtdGFiLTEnLFxuICAgIHRpdGxlOiAn5p+l55yL6K++56iLJ1xuICB9LCB7XG4gICAgdXJsOiAnI2NvdXJzZS10YWItMicsXG4gICAgdGl0bGU6ICfmt7vliqDor77nqIsnXG4gIH0sIHtcbiAgICB1cmw6ICcjY291cnNlLXRhYi0zJyxcbiAgICB0aXRsZTogJ+W9leWFpeS5oOmimCdcbiAgfSwge1xuICAgIHVybDogJyNjb3Vyc2UtdGFiLTQnLFxuICAgIHRpdGxlOiAn5p+l55yL5Lmg6aKYJ1xuICB9XTtcbiAgdmFyIGNsYXNzVGFicyA9IFt7XG4gICAgdXJsOiAnI2NsYXNzLXRhYi0xJyxcbiAgICB0aXRsZTogJ+afpeeci+ePreasoSdcbiAgfSwge1xuICAgIHVybDogJyNjbGFzcy10YWItMicsXG4gICAgdGl0bGU6ICfmt7vliqDnj63mrKEnXG4gIH0sIHtcbiAgICB1cmw6ICcjY2xhc3MtdGFiLTMnLFxuICAgIHRpdGxlOiAn5b2V5YWl5a2m55SfJ1xuICB9LCB7XG4gICAgdXJsOiAnI2NsYXNzLXRhYi00JyxcbiAgICB0aXRsZTogJ+WPkeW4g+a1i+ivlSdcbiAgfSwge1xuICAgIHVybDogJyNjbGFzcy10YWItNScsXG4gICAgdGl0bGU6ICfmn6XnnIvmtYvor5UnXG4gIH1dO1xuICB2YXIgbXlJbmZvID0gW3tcbiAgICB1cmw6ICcjaW5mby10YWItMScsXG4gICAgdGl0bGU6ICfmm7TmlrDkv6Hmga8nXG4gIH0sIHtcbiAgICB1cmw6ICcjaW5mby10YWItMicsXG4gICAgdGl0bGU6ICfkv67mlLnlr4bnoIEnXG4gIH1dO1xuICB2YXIgYXBwID0gbmV3IFZ1ZSh7XG4gICAgZWw6ICcjYXBwJyxcbiAgICBkYXRhOiB7XG4gICAgICB0YWJzOiBjb3Vyc2VUYWJzXG4gICAgfSxcbiAgICBtZXRob2RzOiB7XG4gICAgICBzZXRDb3Vyc2VUYWJzOiBmdW5jdGlvbiAoZXZ0KSB7XG4gICAgICAgIHRoaXMudGFicyA9IGNvdXJzZVRhYnM7XG4gICAgICAgIHJlbmRlclRhYnMocGFuZWxzLCBsYXlvdXQpO1xuICAgICAgfSxcbiAgICAgIHNldENsYXNzVGFiczogZnVuY3Rpb24gKGV2dCkge1xuICAgICAgICB0aGlzLnRhYnMgPSBjbGFzc1RhYnM7XG4gICAgICAgIHJlbmRlclRhYnMocGFuZWxzLCBsYXlvdXQpO1xuICAgICAgfSxcbiAgICAgIHNldEluZm9UYWJzOiBmdW5jdGlvbiAoZXZ0KSB7XG4gICAgICAgIHRoaXMudGFicyA9IG15SW5mbztcbiAgICAgICAgcmVuZGVyVGFicyhwYW5lbHMsIGxheW91dCk7XG4gICAgICB9XG4gICAgfSxcbiAgICByZWFkeSgpIHtcbiAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLm1kbC1sYXlvdXRfX3RhYicpWzBdLmNsaWNrKCk7XG4gICAgICAgIC8qIOWIoOmZpHRhYi1iYXItbGVmdC1idXR0b24gKi9cbiAgICAgICAgdmFyIHRhYkJhckxlZnRCdG4gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubWRsLWxheW91dF9fdGFiLWJhci1sZWZ0LWJ1dHRvbicpO1xuICAgICAgICB2YXIgdGFiQmFyUmlnaHRCdG4gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubWRsLWxheW91dF9fdGFiLWJhci1yaWdodC1idXR0b24nKTtcbiAgICAgICAgaWYgKHRhYkJhckxlZnRCdG4gJiYgdGFiQmFyUmlnaHRCdG4pIHtcbiAgICAgICAgICB2YXIgdGFiQmFyUGFyZW50ID0gdGFiQmFyTGVmdEJ0bi5wYXJlbnROb2RlO1xuICAgICAgICAgIHRhYkJhclBhcmVudC5yZW1vdmVDaGlsZCh0YWJCYXJMZWZ0QnRuKTtcbiAgICAgICAgICB0YWJCYXJQYXJlbnQucmVtb3ZlQ2hpbGQodGFiQmFyUmlnaHRCdG4pO1xuICAgICAgICB9XG4gICAgICAgIHZhciBzZWxlY3RzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnc2VsZWN0Jyk7XG4gICAgICAgIFtdLmZvckVhY2guY2FsbChzZWxlY3RzLCBlbCA9PiBlbC52YWx1ZSA9IG51bGwpO1xuICAgICAgfSwgMTAwMCk7XG4gICAgfVxuICB9KTtcbn07XG4iLCIvKiBnbG9iYWxzIFZ1ZSAqL1xuLy92YXIgVnVlID0gcmVxdWlyZSgnLi4vdmVuZG9yL3Z1ZS5taW4uanMnKTtcbnZhciBjbGFzc1ZpZXcgPSByZXF1aXJlKCcuL2NsYXNzdmlldycpO1xudmFyIHRpcCA9IHJlcXVpcmUoJy4uL3V0aWwnKS50aXA7XG52YXIgcmVuZGVyVGFibGUgPSByZXF1aXJlKCcuLi91dGlsJykucmVuZGVyVGFibGU7XG52YXIgcmVuZGVyID0gcmVxdWlyZSgnLi4vdXRpbCcpLnJlbmRlcjtcbnZhciB0ZXN0VmlldyA9IHJlcXVpcmUoJy4vdGVzdHZpZXcnKTtcblZ1ZS51c2UocmVxdWlyZSgndnVlLXJlc291cmNlJykpO1xuXG52YXIgcHViUXVpeiA9IG5ldyBWdWUoe1xuICBlbDogJyNjbGFzcy10YWItNCcsXG4gIGRhdGE6IHtcbiAgICBjbGFzc2VzOiBbXSxcbiAgICBDbGFzczoge30sXG4gICAgcXNldHM6IFtdLFxuICAgIGNoYXB0ZXJMaXN0OiBbXSxcbiAgICBkdXJhdGlvbjogMTAsXG4gICAgbWF4anVkZ2VOdW06IDAsXG4gICAgbWF4c2luZ2xlTnVtOiAwLFxuICAgIG1heG11bHRpTnVtOiAwLFxuICAgIG1heGFza051bTogMCxcbiAgICBxdWl6TnVtOiAwLFxuICAgIGp1ZGdlTnVtOiAwLFxuICAgIHNpbmdsZU51bTogMCxcbiAgICBtdWx0aU51bTogMCxcbiAgICBhc2tOdW06IDBcbiAgfSxcbiAgY29tcHV0ZWQ6IHtcbiAgICBzdHVkZW50TnVtKCkge1xuICAgICAgaWYgKCFPYmplY3Qua2V5cyh0aGlzLkNsYXNzKS5sZW5ndGgpIHJldHVybiAwO1xuICAgICAgZWxzZSByZXR1cm4gdGhpcy5DbGFzcy5yZWZfc3R1ZGVudHMubGVuZ3RoO1xuICAgIH0sXG4gICAgZXhwaXJlTnVtKCkge1xuICAgICAgcmV0dXJuIHRoaXMuanVkZ2VOdW0gKyB0aGlzLnNpbmdsZU51bSArIHRoaXMubXVsdGlOdW0gKyB0aGlzLmFza051bTtcbiAgICB9XG4gIH0sXG4gIG1ldGhvZHM6IHtcbiAgICBnZXRRdWl6TnVtKGV2dCkge1xuICAgICAgaWYgKFsnSU5QVVQnLCAnU1BBTiddLmluZGV4T2YoZXZ0LnRhcmdldC5ub2RlTmFtZSkgPT09IC0xKSByZXR1cm4gZXZ0LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgdmFyIHRhYmxlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnB1Yi10YWJsZScpO1xuICAgICAgICB2YXIgc2VsZWN0ZWQgPSB0YWJsZS5xdWVyeVNlbGVjdG9yQWxsKCcuaXMtc2VsZWN0ZWQnKTtcbiAgICAgICAgdGhpcy5xdWl6TnVtID0gMDtcbiAgICAgICAgdGhpcy5jaGFwdGVyTGlzdCA9IFtdO1xuICAgICAgICBbXS5mb3JFYWNoLmNhbGwoc2VsZWN0ZWQsIChlbCkgPT4ge1xuICAgICAgICAgIHRoaXMucXVpek51bSArPSBOdW1iZXIoZWwuY2hpbGROb2Rlc1szXS50ZXh0Q29udGVudCB8fCBlbC5jaGlsZE5vZGVzWzNdLmlubmVyVGV4dCk7XG4gICAgICAgICAgdGhpcy5jaGFwdGVyTGlzdC5wdXNoKGVsLmNoaWxkTm9kZXNbMl0udGV4dENvbnRlbnQgfHwgZWwuY2hpbGROb2Rlc1syXS5pbm5lclRleHQpO1xuICAgICAgICB9KTtcbiAgICAgICAgdmFyIHNldHMgPSB0aGlzLnFzZXRzLmZpbHRlcihxc2V0ID0+IHRoaXMuY2hhcHRlckxpc3QuaW5kZXhPZihxc2V0LnJlZl9jaGFwdGVyKSAhPT0gLTEpO1xuICAgICAgICBpZiAoIXNldHMubGVuZ3RoKSB7XG4gICAgICAgICAgdGhpcy5tYXhqdWRnZU51bSA9IDA7XG4gICAgICAgICAgdGhpcy5tYXhzaW5nbGVOdW0gPSAwO1xuICAgICAgICAgIHRoaXMubWF4bXVsdGlOdW0gPSAwO1xuICAgICAgICAgIHRoaXMubWF4YXNrTnVtID0gMDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLm1heGp1ZGdlTnVtID0gc2V0cy5tYXAocyA9PiBzLnF1aXpzKS5yZWR1Y2UoKHAsIGEpID0+IHAuY29uY2F0KGEpKS5maWx0ZXIocSA9PiBxLmdlbnJlID09PSAn5Yik5pat6aKYJykubGVuZ3RoO1xuICAgICAgICAgIHRoaXMubWF4c2luZ2xlTnVtID0gc2V0cy5tYXAocyA9PiBzLnF1aXpzKS5yZWR1Y2UoKHAsIGEpID0+IHAuY29uY2F0KGEpKS5maWx0ZXIocSA9PiBxLmdlbnJlID09PSAn5Y2V6YCJ6aKYJykubGVuZ3RoO1xuICAgICAgICAgIHRoaXMubWF4bXVsdGlOdW0gPSBzZXRzLm1hcChzID0+IHMucXVpenMpLnJlZHVjZSgocCwgYSkgPT4gcC5jb25jYXQoYSkpLmZpbHRlcihxID0+IHEuZ2VucmUgPT09ICflpJrpgInpopgnKS5sZW5ndGg7XG4gICAgICAgICAgdGhpcy5tYXhhc2tOdW0gPSBzZXRzLm1hcChzID0+IHMucXVpenMpLnJlZHVjZSgocCwgYSkgPT4gcC5jb25jYXQoYSkpLmZpbHRlcihxID0+IHEuZ2VucmUgPT09ICfpl67nrZTpopgnKS5sZW5ndGg7XG4gICAgICAgIH1cbiAgICAgIH0sIDEwMCk7XG4gICAgfSxcbiAgICBnZXQoKSB7XG4gICAgICBpZiAoIXRoaXMuQ2xhc3MuX2lkKSByZXR1cm47XG4gICAgICB2YXIgcXNldCA9IHt9O1xuICAgICAgcXNldC5yZWZfY291cnNlID0gdGhpcy5DbGFzcy5yZWZfY291cnNlO1xuICAgICAgdGhpcy4kaHR0cC5nZXQoJy9hcGkvdC9xc2V0JywgcXNldClcbiAgICAgICAgLnRoZW4ocmVzID0+IHtcbiAgICAgICAgICB0aGlzLnFzZXRzID0gcmVzLmRhdGE7XG4gICAgICAgICAgdGhpcy5xdWl6TnVtID0gMDtcbiAgICAgICAgICByZW5kZXJUYWJsZShkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcucHViLXRhYmxlJykpO1xuICAgICAgICB9LCBlcnIgPT4gdGlwKCfnvZHnu5zmlYXpmpwnLCAnZXJyb3InKSk7XG4gICAgfSxcbiAgICBwdWIoZXZ0KSB7XG4gICAgICBpZiAoIU9iamVjdC5rZXlzKHRoaXMuQ2xhc3MpLmxlbmd0aCB8fCAhdGhpcy5xdWl6TnVtIHx8ICF0aGlzLmV4cGlyZU51bSB8fCAhdGhpcy5zdHVkZW50TnVtIHx8IHRoaXMucXVpek51bSA8IHRoaXMuZXhwaXJlTnVtKSByZXR1cm4gZXZ0LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBpZiAodGhpcy5qdWRnZU51bSA+IHRoaXMubWF4anVkZ2VOdW0gfHwgdGhpcy5zaW5nbGVOdW0gPiB0aGlzLm1heHNpbmdsZU51bSB8fCB0aGlzLm11bHRpTnVtID4gdGhpcy5tYXhtdWx0aU51bSB8fCB0aGlzLmFza051bSA+IHRoaXMubWF4YXNrTnVtKSByZXR1cm4gZXZ0LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICB2YXIgZGF0YSA9IHt9O1xuICAgICAgZGF0YS5jbGFzc19pZCA9IHRoaXMuQ2xhc3MuX2lkO1xuICAgICAgZGF0YS5kdXJhdGlvbiA9IHRoaXMuZHVyYXRpb247XG4gICAgICBkYXRhLmNoYXB0ZXJMaXN0ID0gdGhpcy5jaGFwdGVyTGlzdDtcbiAgICAgIGRhdGEucmVmX3N0dWRlbnRzID0gdGhpcy5DbGFzcy5yZWZfc3R1ZGVudHM7XG4gICAgICBkYXRhLnF1aXpOdW0gPSB0aGlzLnF1aXpOdW07XG4gICAgICBkYXRhLmV4cGlyZU51bSA9IHRoaXMuZXhwaXJlTnVtO1xuICAgICAgZGF0YS5qdWRnZU51bSA9IHRoaXMuanVkZ2VOdW07XG4gICAgICBkYXRhLnNpbmdsZU51bSA9IHRoaXMuc2luZ2xlTnVtO1xuICAgICAgZGF0YS5tdWx0aU51bSA9IHRoaXMubXVsdGlOdW07XG4gICAgICBkYXRhLmFza051bSA9IHRoaXMuYXNrTnVtO1xuICAgICAgdGhpcy4kaHR0cC5wb3N0KCcvYXBpL3QvdGVzdCcsIGRhdGEpXG4gICAgICAgIC50aGVuKHJlcyA9PiB7XG4gICAgICAgICAgdGhpcy5DbGFzcyA9IHt9O1xuICAgICAgICAgIHRoaXMucXNldHMgPSBbXTtcbiAgICAgICAgICB0aGlzLmR1cmF0aW9uID0gMTA7XG4gICAgICAgICAgdGhpcy5xdWl6TnVtID0gMDtcbiAgICAgICAgICB0aGlzLmV4cGlyZU51bSA9IDA7XG4gICAgICAgICAgdGhpcy5qdWRnZU51bSA9IDA7XG4gICAgICAgICAgdGhpcy5zaW5nbGVOdW0gPSAwO1xuICAgICAgICAgIHRoaXMubXVsdGlOdW0gPSAwO1xuICAgICAgICAgIHRoaXMuYXNrTnVtID0gMDtcbiAgICAgICAgICB0aGlzLm1heGp1ZGdlTnVtID0gMDtcbiAgICAgICAgICB0aGlzLm1heHNpbmdsZU51bSA9IDA7XG4gICAgICAgICAgdGhpcy5tYXhtdWx0aU51bSA9IDA7XG4gICAgICAgICAgdGhpcy5tYXhhc2tOdW0gPSAwO1xuICAgICAgICAgIHRoaXMuY2hhcHRlckxpc3QgPSBbXTtcbiAgICAgICAgICB0aXAoJ+WPkeW4g+aIkOWKnycsICdzdWNjZXNzJyk7XG4gICAgICAgICAgdGVzdFZpZXcuZ2V0KCk7XG4gICAgICAgIH0sIGVyciA9PiB0aXAoJ+e9kee7nOaVhemanCcsICdlcnJvcicpKTtcbiAgICB9XG4gIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHB1YlF1aXo7XG4iLCIvKiBnbG9iYWxzIFZ1ZSAqL1xuLy92YXIgVnVlID0gcmVxdWlyZSgnLi4vdmVuZG9yL3Z1ZS5taW4uanMnKTtcbnZhciBjb3Vyc2VWaWV3ID0gcmVxdWlyZSgnLi9jb3Vyc2V2aWV3Jyk7XG52YXIgcHViUXVpeiA9IHJlcXVpcmUoJy4vcHVicXVpeicpO1xudmFyIHRpcCA9IHJlcXVpcmUoJy4uL3V0aWwnKS50aXA7XG5WdWUudXNlKHJlcXVpcmUoJ3Z1ZS1yZXNvdXJjZScpKTtcblxudmFyIHF1aXpWaWV3ID0gbmV3IFZ1ZSh7XG4gIGVsOiAnI2NvdXJzZS10YWItNCcsXG4gIGRhdGE6IHtcbiAgICBjb3Vyc2VzOiBbXSxcbiAgICBjb3Vyc2U6IHtcbiAgICAgIF9pZDogJycsXG4gICAgICBjaGFwdGVyOiAnJ1xuICAgIH0sXG4gICAgcXVpenM6IFtdXG4gIH0sXG4gIGNvbXB1dGVkOiB7XG4gICAgaWR4KCkge1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSB0aGlzLmNvdXJzZXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIGlmICh0aGlzLmNvdXJzZXNbaV0uX2lkID09PSB0aGlzLmNvdXJzZS5faWQpIHJldHVybiBpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIC0xO1xuICAgIH1cbiAgfSxcbiAgbWV0aG9kczoge1xuICAgIGdldChldnQpIHtcbiAgICAgIGlmICghdGhpcy5jb3Vyc2UuX2lkIHx8ICF0aGlzLmNvdXJzZS5jaGFwdGVyKSByZXR1cm4gZXZ0LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICB2YXIgcXNldCA9IHt9O1xuICAgICAgcXNldC5yZWZfY291cnNlID0gdGhpcy5jb3Vyc2UuX2lkO1xuICAgICAgcXNldC5yZWZfY2hhcHRlciA9IHRoaXMuY291cnNlLmNoYXB0ZXI7XG4gICAgICB0aGlzLiRodHRwLmdldCgnL2FwaS90L3FzZXQnLCBxc2V0KVxuICAgICAgICAudGhlbihyZXMgPT4ge1xuICAgICAgICAgIGlmICghcmVzLmRhdGEpIHtcbiAgICAgICAgICAgIHRpcCgn5pyq5b2V5YWl5Lmg6aKYJywgJ21lc3NhZ2UnKTtcbiAgICAgICAgICAgIHRoaXMucXVpenMgPSBbXTtcbiAgICAgICAgICB9IGVsc2UgdGhpcy5xdWl6cyA9IHJlcy5kYXRhO1xuICAgICAgICB9LCBlcnIgPT4gdGlwKCfnvZHnu5zmlYXpmpwnLCAnZXJyb3InKSk7XG4gICAgfSxcbiAgICBkZWwoZXZ0KSB7XG4gICAgICBpZiAoIXRoaXMuY291cnNlLl9pZCB8fCAhdGhpcy5jb3Vyc2UuY2hhcHRlciB8fCAhdGhpcy5xdWl6cy5sZW5ndGgpIHJldHVybiBldnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIHZhciBxc2V0ID0ge307XG4gICAgICBxc2V0LnJlZl9jb3Vyc2UgPSB0aGlzLmNvdXJzZS5faWQ7XG4gICAgICBxc2V0LnJlZl9jaGFwdGVyID0gdGhpcy5jb3Vyc2UuY2hhcHRlcjtcbiAgICAgIHRoaXMuJGh0dHAuZGVsZXRlKCcvYXBpL3QvcXNldCcsIHFzZXQpXG4gICAgICAgIC50aGVuKHJlcyA9PiB7XG4gICAgICAgICAgICB0aXAoJ+WIoOmZpOaIkOWKnycsICdzdWNjZXNzJyk7XG4gICAgICAgICAgICB0aGlzLnF1aXpzID0gW107XG4gICAgICAgICAgICBwdWJRdWl6LmdldCgpO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgZXJyID0+IHRpcCgn572R57uc5pWF6ZqcJywgJ2Vycm9yJykpO1xuICAgIH1cbiAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gcXVpelZpZXc7XG4iLCIvKiBnbG9iYWxzIFZ1ZSAqL1xuLy92YXIgVnVlID0gcmVxdWlyZSgnLi4vdmVuZG9yL3Z1ZS5taW4uanMnKTtcbnZhciBjb3Vyc2VWaWV3ID0gcmVxdWlyZSgnLi9jb3Vyc2V2aWV3Jyk7XG52YXIgcHViUXVpeiA9IHJlcXVpcmUoJy4vcHVicXVpeicpO1xudmFyIHRpcCA9IHJlcXVpcmUoJy4uL3V0aWwnKS50aXA7XG52YXIgcmVuZGVyID0gcmVxdWlyZSgnLi4vdXRpbCcpLnJlbmRlcjtcblZ1ZS51c2UocmVxdWlyZSgndnVlLXJlc291cmNlJykpO1xuXG5WdWUuZmlsdGVyKCdmb3JtYXRUaW1lJywgdmFsdWUgPT4ge1xuICBpZiAoIXZhbHVlKSByZXR1cm4gJyc7XG4gIHZhciBkYXRlID0gbmV3IERhdGUodmFsdWUpO1xuICByZXR1cm4gYCR7ZGF0ZS5nZXRGdWxsWWVhcigpfeW5tCR7ZGF0ZS5nZXRNb250aCgpICsgMX3mnIgke2RhdGUuZ2V0RGF0ZSgpfeaXpSAgJHtkYXRlLmdldEhvdXJzKCl95pe2OiR7ZGF0ZS5nZXRNaW51dGVzKCl95YiGYDtcbn0pO1xuXG5WdWUuZmlsdGVyKCdmb3JtYXRVbmZpbmlzaCcsIHZhbHVlID0+IHtcbiAgcmV0dXJuIHZhbHVlLm1hcCgodiwgaWR4KSA9PiBgJHtpZHgrMX0gJHt2Lm5hbWV9KCR7di5ub30pYCkuam9pbignLCAgJyk7XG59KTtcblxuVnVlLmZpbHRlcigndmFsaWRTY29yZScsIHZhbHVlID0+IHtcbiAgcmV0dXJuIHZhbHVlID4gMTAgPyAxMCA6IHZhbHVlO1xufSk7XG5cblZ1ZS5maWx0ZXIoJ2dldFJpZ2h0TnVtJywgcXVpenMgPT4ge1xuICByZXR1cm4gcXVpenMuZmlsdGVyKHEgPT4gcS5pc1JpZ2h0KS5sZW5ndGg7XG59KTtcblxuVnVlLmZpbHRlcignZ2V0V3JvbmdOdW0nLCBxdWl6cyA9PiB7XG4gIHJldHVybiBxdWl6cy5maWx0ZXIocSA9PiAhcS5pc1JpZ2h0KS5sZW5ndGg7XG59KTtcblxuVnVlLmZpbHRlcignZ2V0U3VtJywgcXVpenMgPT4ge1xuICB2YXIganVkZ2VOdW0gPSBxdWl6cy5maWx0ZXIocSA9PiBxLmdlbnJlID09PSAn5Yik5pat6aKYJykubGVuZ3RoO1xuICB2YXIgc2luZ2xlTnVtID0gcXVpenMuZmlsdGVyKHEgPT4gcS5nZW5yZSA9PT0gJ+WNlemAiemimCcpLmxlbmd0aDtcbiAgdmFyIG11bHRpTnVtID0gcXVpenMuZmlsdGVyKHEgPT4gcS5nZW5yZSA9PT0gJ+WkmumAiemimCcpLmxlbmd0aDtcbiAgdmFyIGFza051bSA9IHF1aXpzLmZpbHRlcihxID0+IHEuZ2VucmUgPT09ICfpl67nrZTpopgnKS5sZW5ndGg7XG4gIHJldHVybiBqdWRnZU51bSAqIDUgKyBzaW5nbGVOdW0gKiA1ICsgbXVsdGlOdW0gKiAxMCArIGFza051bSAqIDEwO1xufSk7XG5cblZ1ZS5maWx0ZXIoJ2dldEFza1Njb3JlJywgcXVpenMgPT4ge1xuICByZXR1cm4gcXVpenMuZmlsdGVyKHEgPT4gcS5nZW5yZSA9PT0gJ+mXruetlOmimCcpLm1hcCh4ID0+IHguc2NvcmUpLnJlZHVjZSgocCwgYSkgPT4ge1xuICAgIHJldHVybiBwICsgYTtcbiAgfSwgMCk7XG59KTtcblxuVnVlLmZpbHRlcignZ2V0T3RoZXJTY29yZScsIHF1aXpzID0+IHtcbiAgcmV0dXJuIHF1aXpzLmZpbHRlcihxID0+IHEuZ2VucmUgIT09ICfpl67nrZTpopgnICYmIHEuaXNSaWdodCkubWFwKHggPT4geC5zY29yZSkucmVkdWNlKChwLCBhKSA9PiB7XG4gICAgcmV0dXJuIHAgKyBhO1xuICB9LCAwKTtcbn0pO1xuXG5WdWUuZmlsdGVyKCdnZXRTdW1TY29yZScsIHF1aXpzID0+IHtcbiAgcmV0dXJuIHF1aXpzLm1hcCh4ID0+IHguc2NvcmUpLnJlZHVjZSgocCwgYSkgPT4gcCArIGEpO1xufSk7XG5cbnZhciBjb2xsZWN0ID0gbmV3IFZ1ZSh7XG4gIGVsOiAnI2NsYXNzLXRhYi01JyxcbiAgZGF0YToge1xuICAgIHNob3dTdGF0dXM6IGZhbHNlLFxuICAgIGZpbmlzaGVkTGlzdDogW10sXG4gICAgdW5maW5pc2hMaXN0OiBbXSxcbiAgICBjbGFzc2VzOiBbXSxcbiAgICB0ZXN0TGlzdDogW10sXG4gICAgcmVzdWx0OiBbXSxcbiAgICBjbGFzc0lkOiAnJ1xuICB9LFxuICBjb21wdXRlZDoge1xuICAgIHFydXJsKCkge1xuICAgICAgaWYgKCF0aGlzLnRlc3QgfHwgIXRoaXMudGVzdExpc3QubGVuZ3RoKSByZXR1cm4gJyMnO1xuICAgICAgZWxzZSByZXR1cm4gJy9hcGkvcXIvP3VybD0nICsgd2luZG93LmxvY2F0aW9uLm9yaWdpbiArICcvYXBpL3QvdGVzdC8nICsgdGhpcy50ZXN0LnV1aWQ7XG4gICAgfSxcbiAgICBjYW5HZXRTdGF0dXMoKSB7XG4gICAgICByZXR1cm4gdGhpcy50ZXN0TGlzdC5sZW5ndGg7XG4gICAgfSxcbiAgICBzaG93QW5hbHlzaXMoKSB7XG4gICAgICByZXR1cm4gdGhpcy50ZXN0LnJlZl9zdHVkZW50cy5ldmVyeShzID0+IHMuaXNDaGVja2VkKTtcbiAgICB9XG4gIH0sXG4gIG1ldGhvZHM6IHtcbiAgICBzYXZlKGV2dCwgc2lkeCkge1xuICAgICAgdGhpcy5maW5pc2hlZExpc3Rbc2lkeF0uaXNDaGVja2VkID0gdHJ1ZTtcbiAgICAgIHRoaXMudW5maW5pc2hMaXN0LmZvckVhY2goZSA9PiBlLmlzQ2hlY2tlZCA9IHRydWUpO1xuICAgICAgdmFyIGRhdGEgPSB0aGlzLmZpbmlzaGVkTGlzdC5jb25jYXQodGhpcy51bmZpbmlzaExpc3QpO1xuICAgICAgdGhpcy4kaHR0cC5wdXQoJy9hcGkvdC90ZXN0LycgKyB0aGlzLnRlc3QudXVpZCwge1xuICAgICAgICAgIGRhdGE6IGRhdGFcbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4ocmVzID0+IHtcbiAgICAgICAgICB0aXAoJ+S/neWtmOaIkOWKnycsICdzdWNjZXNzJyk7XG4gICAgICAgIH0sIGVyciA9PiB7XG4gICAgICAgICAgdGlwKCfnvZHnu5zmlYXpmpwnLCAnZXJyb3InKTtcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICBzaGFyZShldnQpIHtcbiAgICAgIGlmICghdGhpcy50ZXN0IHx8ICF0aGlzLnRlc3RMaXN0Lmxlbmd0aCkgcmV0dXJuIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH0sXG4gICAgYW5hbHlzaXMoZXZ0KSB7XG4gICAgICBpZiAoIXRoaXMuc2hvd0FuYWx5c2lzKSB7XG4gICAgICAgIHRpcCgn6K+35a6M5oiQ5YWI5om55pS55Lu75YqhJywgJ21lc3NhZ2UnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRpcCgn5b6F5a6M5oiQJywgJ21lc3NhZ2UnKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGNsZWFyU3RhdHVzKCkge1xuICAgICAgdGhpcy5zaG93U3RhdHVzID0gZmFsc2U7XG4gICAgfSxcbiAgICBnZXRTdGF0dXMoZXZ0KSB7XG4gICAgICBpZiAoIXRoaXMuY2FuR2V0U3RhdHVzIHx8ICF0aGlzLnRlc3QpIHJldHVybiBldnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIGlmIChuZXcgRGF0ZSh0aGlzLnRlc3QuZXhwaXJlQXQpIC0gRGF0ZS5ub3coKSA+IDApIHtcbiAgICAgICAgdGlwKCfmtYvor5XmnKrnu5PmnZ8nLCAnbWVzc2FnZScpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5zaG93U3RhdHVzID0gdHJ1ZTtcbiAgICAgICAgdGhpcy51bmZpbmlzaExpc3QgPSB0aGlzLnRlc3QucmVmX3N0dWRlbnRzLmZpbHRlcihzID0+ICFzLmNhbkdldEFuc3dlcnMpO1xuICAgICAgICB0aGlzLmZpbmlzaGVkTGlzdCA9IHRoaXMudGVzdC5yZWZfc3R1ZGVudHMuZmlsdGVyKHMgPT4gcy5jYW5HZXRBbnN3ZXJzKTtcbiAgICAgICAgcmVuZGVyKCk7XG4gICAgICB9XG4gICAgfSxcbiAgICBnZXQoKSB7XG4gICAgICBpZiAoIXRoaXMuY2xhc3NJZCkgcmV0dXJuO1xuICAgICAgdGhpcy5zaG93U3RhdHVzID0gZmFsc2U7XG4gICAgICB0aGlzLiRodHRwLmdldCgnL2FwaS90L3Rlc3Qvc3RhdHVzJywge1xuICAgICAgICAgIGNsYXNzSWQ6IHRoaXMuY2xhc3NJZFxuICAgICAgICB9KVxuICAgICAgICAudGhlbihyZXMgPT4ge1xuICAgICAgICAgIHRoaXMudGVzdExpc3QgPSByZXMuZGF0YTtcbiAgICAgICAgfSwgZXJyID0+IHtcbiAgICAgICAgICB0aXAoJ+e9kee7nOaVhemanCcsICdlcnJvcicpO1xuICAgICAgICB9KTtcbiAgICB9XG4gIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNvbGxlY3Q7XG4iLCIvKiBnbG9iYWxzIE1hdGVyaWFsTGF5b3V0VGFiLCBNYXRlcmlhbExheW91dCwgTWF0ZXJpYWxUYWJzLCBNYXRlcmlhbFRhYiwgTWF0ZXJpYWxSaXBwbGUsIE1hdGVyaWFsRGF0YVRhYmxlLCBNYXRlcmlhbEJ1dHRvbiwgTWF0ZXJpYWxDaGVja2JveCwgTWF0ZXJpYWxSYWRpbywgTWF0ZXJpYWxUZXh0ZmllbGQsIGNvbXBvbmVudEhhbmRsZXIgKi9cblxuZnVuY3Rpb24gcmVuZGVyVGFicyhwYW5lbHMsIGxheW91dCkge1xuICB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB7XG4gICAgdmFyIHRhYnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcubWRsLWxheW91dF9fdGFiJyk7XG4gICAgW10uZm9yRWFjaC5jYWxsKHRhYnMsIGVsID0+IHtcbiAgICAgIG5ldyBNYXRlcmlhbExheW91dFRhYihlbCwgdGFicywgcGFuZWxzLCBsYXlvdXQuTWF0ZXJpYWxMYXlvdXQpO1xuICAgICAgbmV3IE1hdGVyaWFsUmlwcGxlKGVsKTtcbiAgICB9KTtcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHRhYnNbMF0uY2xpY2soKTtcbiAgICB9LCAxMDApXG4gIH0sIDEwMCk7XG59XG5cbmZ1bmN0aW9uIHJlbmRlclRhYmxlKHRhYmxlKSB7XG4gIHZhciB0aF9maXJzdCA9IHRhYmxlLnF1ZXJ5U2VsZWN0b3IoJ3RoJyk7XG4gIHRoX2ZpcnN0LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhfZmlyc3QpO1xuICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICBuZXcgTWF0ZXJpYWxEYXRhVGFibGUodGFibGUpO1xuICAgIGNvbXBvbmVudEhhbmRsZXIudXBncmFkZUFsbFJlZ2lzdGVyZWQoKTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHJlbmRlclJpcHBsZShlbCkge1xuICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICBjb21wb25lbnRIYW5kbGVyLnVwZ3JhZGVBbGxSZWdpc3RlcmVkKCk7XG4gIH0sIDEwMCk7XG59XG5cbmZ1bmN0aW9uIHJlbmRlckJ1dHRvbihlbCkge1xuICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICBjb21wb25lbnRIYW5kbGVyLnVwZ3JhZGVBbGxSZWdpc3RlcmVkKCk7XG4gIH0sIDEwMCk7XG59XG5cbmZ1bmN0aW9uIHJlbmRlckNoZWNrYm94KGVsKSB7XG4gIHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHtcbiAgICB2YXIgYnRucyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoZWwpLnF1ZXJ5U2VsZWN0b3JBbGwoJy5tZGwtanMtY2hlY2tib3gnKTtcbiAgICBbXS5mb3JFYWNoLmNhbGwoYnRucywgZWwgPT4ge1xuICAgICAgbmV3IE1hdGVyaWFsQ2hlY2tib3goZWwpO1xuICAgIH0pO1xuICB9LCAxMDApO1xufVxuXG5mdW5jdGlvbiByZW5kZXJSYWRpbyhlbCkge1xuICB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB7XG4gICAgdmFyIHJhZGlvcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoZWwpLnF1ZXJ5U2VsZWN0b3JBbGwoJy5tZGwtanMtcmFkaW8nKTtcbiAgICBbLi4ucmFkaW9zXS5mb3JFYWNoKGVsID0+IHtcbiAgICAgIG5ldyBNYXRlcmlhbFJhZGlvKGVsKTtcbiAgICB9KTtcbiAgfSwgMTAwKTtcbn1cblxuZnVuY3Rpb24gcmVuZGVyVGV4dGZpZWxkKGVsKSB7XG4gIHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHtcbiAgICB2YXIgZmllbGRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihlbCkucXVlcnlTZWxlY3RvckFsbCgnLm1kbC1qcy10ZXh0ZmllbGQnKTtcbiAgICBbXS5mb3JFYWNoLmNhbGwoZmllbGRzLCBlbCA9PiB7XG4gICAgICBuZXcgTWF0ZXJpYWxUZXh0ZmllbGQoZWwpO1xuICAgIH0pO1xuICB9LCAxMDApO1xufVxuXG5mdW5jdGlvbiB0aXAoc3RyLCB0eXBlKSB7XG4gIHZhciBlbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyN0aXAnKTtcbiAgZWwuaW5uZXJUZXh0ID0gc3RyO1xuICAvLyBmb3IgZmlyZWZveFxuICBlbC50ZXh0Q29udGVudCA9IHN0cjtcbiAgaWYgKHR5cGUgPT09ICdlcnJvcicpIGVsLnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICcjZDk1MzRmJztcbiAgaWYgKHR5cGUgPT09ICdzdWNjZXNzJykgZWwuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJyM1Y2I4NWMnO1xuICBpZiAodHlwZSA9PT0gJ21lc3NhZ2UnKSBlbC5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAnIzNhYWFjZic7XG4gIGlmICghZWwuc3R5bGUuZGlzcGxheSB8fCBlbC5zdHlsZS5kaXNwbGF5ID09PSAnbm9uZScpIHtcbiAgICBlbC5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIGVsLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgfSwgMjAwMCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gcmVuZGVyKCkge1xuICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICBjb21wb25lbnRIYW5kbGVyLnVwZ3JhZGVBbGxSZWdpc3RlcmVkKCk7XG4gIH0sIDEwMCk7XG59XG5cbm1vZHVsZS5leHBvcnRzLnJlbmRlclRhYnMgPSByZW5kZXJUYWJzO1xubW9kdWxlLmV4cG9ydHMudGlwID0gdGlwO1xubW9kdWxlLmV4cG9ydHMucmVuZGVyVGFibGUgPSByZW5kZXJUYWJsZTtcbm1vZHVsZS5leHBvcnRzLnJlbmRlckJ1dHRvbiA9IHJlbmRlckJ1dHRvbjtcbm1vZHVsZS5leHBvcnRzLnJlbmRlclJpcHBsZSA9IHJlbmRlclJpcHBsZTtcbm1vZHVsZS5leHBvcnRzLnJlbmRlclJhZGlvID0gcmVuZGVyUmFkaW87XG5tb2R1bGUuZXhwb3J0cy5yZW5kZXJDaGVja2JveCA9IHJlbmRlckNoZWNrYm94O1xubW9kdWxlLmV4cG9ydHMucmVuZGVyVGV4dGZpZWxkID0gcmVuZGVyVGV4dGZpZWxkO1xubW9kdWxlLmV4cG9ydHMucmVuZGVyID0gcmVuZGVyO1xuIiwiLyoqXG4gKiBCZWZvcmUgSW50ZXJjZXB0b3IuXG4gKi9cblxudmFyIF8gPSByZXF1aXJlKCcuLi91dGlsJyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gICAgcmVxdWVzdDogZnVuY3Rpb24gKHJlcXVlc3QpIHtcblxuICAgICAgICBpZiAoXy5pc0Z1bmN0aW9uKHJlcXVlc3QuYmVmb3JlU2VuZCkpIHtcbiAgICAgICAgICAgIHJlcXVlc3QuYmVmb3JlU2VuZC5jYWxsKHRoaXMsIHJlcXVlc3QpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlcXVlc3Q7XG4gICAgfVxuXG59O1xuIiwiLyoqXG4gKiBCYXNlIGNsaWVudC5cbiAqL1xuXG52YXIgXyA9IHJlcXVpcmUoJy4uLy4uL3V0aWwnKTtcbnZhciBQcm9taXNlID0gcmVxdWlyZSgnLi4vLi4vcHJvbWlzZScpO1xudmFyIHhockNsaWVudCA9IHJlcXVpcmUoJy4veGhyJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHJlcXVlc3QpIHtcblxuICAgIHZhciByZXNwb25zZSA9IChyZXF1ZXN0LmNsaWVudCB8fCB4aHJDbGllbnQpKHJlcXVlc3QpO1xuXG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShyZXNwb25zZSkudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcblxuICAgICAgICBpZiAocmVzcG9uc2UuaGVhZGVycykge1xuXG4gICAgICAgICAgICB2YXIgaGVhZGVycyA9IHBhcnNlSGVhZGVycyhyZXNwb25zZS5oZWFkZXJzKTtcblxuICAgICAgICAgICAgcmVzcG9uc2UuaGVhZGVycyA9IGZ1bmN0aW9uIChuYW1lKSB7XG5cbiAgICAgICAgICAgICAgICBpZiAobmFtZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gaGVhZGVyc1tfLnRvTG93ZXIobmFtZSldO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiBoZWFkZXJzO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICB9XG5cbiAgICAgICAgcmVzcG9uc2Uub2sgPSByZXNwb25zZS5zdGF0dXMgPj0gMjAwICYmIHJlc3BvbnNlLnN0YXR1cyA8IDMwMDtcblxuICAgICAgICByZXR1cm4gcmVzcG9uc2U7XG4gICAgfSk7XG5cbn07XG5cbmZ1bmN0aW9uIHBhcnNlSGVhZGVycyhzdHIpIHtcblxuICAgIHZhciBoZWFkZXJzID0ge30sIHZhbHVlLCBuYW1lLCBpO1xuXG4gICAgaWYgKF8uaXNTdHJpbmcoc3RyKSkge1xuICAgICAgICBfLmVhY2goc3RyLnNwbGl0KCdcXG4nKSwgZnVuY3Rpb24gKHJvdykge1xuXG4gICAgICAgICAgICBpID0gcm93LmluZGV4T2YoJzonKTtcbiAgICAgICAgICAgIG5hbWUgPSBfLnRyaW0oXy50b0xvd2VyKHJvdy5zbGljZSgwLCBpKSkpO1xuICAgICAgICAgICAgdmFsdWUgPSBfLnRyaW0ocm93LnNsaWNlKGkgKyAxKSk7XG5cbiAgICAgICAgICAgIGlmIChoZWFkZXJzW25hbWVdKSB7XG5cbiAgICAgICAgICAgICAgICBpZiAoXy5pc0FycmF5KGhlYWRlcnNbbmFtZV0pKSB7XG4gICAgICAgICAgICAgICAgICAgIGhlYWRlcnNbbmFtZV0ucHVzaCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaGVhZGVyc1tuYW1lXSA9IFtoZWFkZXJzW25hbWVdLCB2YWx1ZV07XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgaGVhZGVyc1tuYW1lXSA9IHZhbHVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBoZWFkZXJzO1xufVxuIiwiLyoqXG4gKiBKU09OUCBjbGllbnQuXG4gKi9cblxudmFyIF8gPSByZXF1aXJlKCcuLi8uLi91dGlsJyk7XG52YXIgUHJvbWlzZSA9IHJlcXVpcmUoJy4uLy4uL3Byb21pc2UnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocmVxdWVzdCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSkge1xuXG4gICAgICAgIHZhciBjYWxsYmFjayA9ICdfanNvbnAnICsgTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyKDIpLCByZXNwb25zZSA9IHtyZXF1ZXN0OiByZXF1ZXN0LCBkYXRhOiBudWxsfSwgaGFuZGxlciwgc2NyaXB0O1xuXG4gICAgICAgIHJlcXVlc3QucGFyYW1zW3JlcXVlc3QuanNvbnBdID0gY2FsbGJhY2s7XG4gICAgICAgIHJlcXVlc3QuY2FuY2VsID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaGFuZGxlcih7dHlwZTogJ2NhbmNlbCd9KTtcbiAgICAgICAgfTtcblxuICAgICAgICBzY3JpcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTtcbiAgICAgICAgc2NyaXB0LnNyYyA9IF8udXJsKHJlcXVlc3QpO1xuICAgICAgICBzY3JpcHQudHlwZSA9ICd0ZXh0L2phdmFzY3JpcHQnO1xuICAgICAgICBzY3JpcHQuYXN5bmMgPSB0cnVlO1xuXG4gICAgICAgIHdpbmRvd1tjYWxsYmFja10gPSBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgcmVzcG9uc2UuZGF0YSA9IGRhdGE7XG4gICAgICAgIH07XG5cbiAgICAgICAgaGFuZGxlciA9IGZ1bmN0aW9uIChldmVudCkge1xuXG4gICAgICAgICAgICBpZiAoZXZlbnQudHlwZSA9PT0gJ2xvYWQnICYmIHJlc3BvbnNlLmRhdGEgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICByZXNwb25zZS5zdGF0dXMgPSAyMDA7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGV2ZW50LnR5cGUgPT09ICdlcnJvcicpIHtcbiAgICAgICAgICAgICAgICByZXNwb25zZS5zdGF0dXMgPSA0MDQ7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlc3BvbnNlLnN0YXR1cyA9IDA7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJlc29sdmUocmVzcG9uc2UpO1xuXG4gICAgICAgICAgICBkZWxldGUgd2luZG93W2NhbGxiYWNrXTtcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQoc2NyaXB0KTtcbiAgICAgICAgfTtcblxuICAgICAgICBzY3JpcHQub25sb2FkID0gaGFuZGxlcjtcbiAgICAgICAgc2NyaXB0Lm9uZXJyb3IgPSBoYW5kbGVyO1xuXG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoc2NyaXB0KTtcbiAgICB9KTtcbn07XG4iLCIvKipcbiAqIFhEb21haW4gY2xpZW50IChJbnRlcm5ldCBFeHBsb3JlcikuXG4gKi9cblxudmFyIF8gPSByZXF1aXJlKCcuLi8uLi91dGlsJyk7XG52YXIgUHJvbWlzZSA9IHJlcXVpcmUoJy4uLy4uL3Byb21pc2UnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocmVxdWVzdCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSkge1xuXG4gICAgICAgIHZhciB4ZHIgPSBuZXcgWERvbWFpblJlcXVlc3QoKSwgcmVzcG9uc2UgPSB7cmVxdWVzdDogcmVxdWVzdH0sIGhhbmRsZXI7XG5cbiAgICAgICAgcmVxdWVzdC5jYW5jZWwgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB4ZHIuYWJvcnQoKTtcbiAgICAgICAgfTtcblxuICAgICAgICB4ZHIub3BlbihyZXF1ZXN0Lm1ldGhvZCwgXy51cmwocmVxdWVzdCksIHRydWUpO1xuXG4gICAgICAgIGhhbmRsZXIgPSBmdW5jdGlvbiAoZXZlbnQpIHtcblxuICAgICAgICAgICAgcmVzcG9uc2UuZGF0YSA9IHhkci5yZXNwb25zZVRleHQ7XG4gICAgICAgICAgICByZXNwb25zZS5zdGF0dXMgPSB4ZHIuc3RhdHVzO1xuICAgICAgICAgICAgcmVzcG9uc2Uuc3RhdHVzVGV4dCA9IHhkci5zdGF0dXNUZXh0O1xuXG4gICAgICAgICAgICByZXNvbHZlKHJlc3BvbnNlKTtcbiAgICAgICAgfTtcblxuICAgICAgICB4ZHIudGltZW91dCA9IDA7XG4gICAgICAgIHhkci5vbmxvYWQgPSBoYW5kbGVyO1xuICAgICAgICB4ZHIub25hYm9ydCA9IGhhbmRsZXI7XG4gICAgICAgIHhkci5vbmVycm9yID0gaGFuZGxlcjtcbiAgICAgICAgeGRyLm9udGltZW91dCA9IGZ1bmN0aW9uICgpIHt9O1xuICAgICAgICB4ZHIub25wcm9ncmVzcyA9IGZ1bmN0aW9uICgpIHt9O1xuXG4gICAgICAgIHhkci5zZW5kKHJlcXVlc3QuZGF0YSk7XG4gICAgfSk7XG59O1xuIiwiLyoqXG4gKiBYTUxIdHRwIGNsaWVudC5cbiAqL1xuXG52YXIgXyA9IHJlcXVpcmUoJy4uLy4uL3V0aWwnKTtcbnZhciBQcm9taXNlID0gcmVxdWlyZSgnLi4vLi4vcHJvbWlzZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChyZXF1ZXN0KSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlKSB7XG5cbiAgICAgICAgdmFyIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpLCByZXNwb25zZSA9IHtyZXF1ZXN0OiByZXF1ZXN0fSwgaGFuZGxlcjtcblxuICAgICAgICByZXF1ZXN0LmNhbmNlbCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHhoci5hYm9ydCgpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHhoci5vcGVuKHJlcXVlc3QubWV0aG9kLCBfLnVybChyZXF1ZXN0KSwgdHJ1ZSk7XG5cbiAgICAgICAgaGFuZGxlciA9IGZ1bmN0aW9uIChldmVudCkge1xuXG4gICAgICAgICAgICByZXNwb25zZS5kYXRhID0geGhyLnJlc3BvbnNlVGV4dDtcbiAgICAgICAgICAgIHJlc3BvbnNlLnN0YXR1cyA9IHhoci5zdGF0dXM7XG4gICAgICAgICAgICByZXNwb25zZS5zdGF0dXNUZXh0ID0geGhyLnN0YXR1c1RleHQ7XG4gICAgICAgICAgICByZXNwb25zZS5oZWFkZXJzID0geGhyLmdldEFsbFJlc3BvbnNlSGVhZGVycygpO1xuXG4gICAgICAgICAgICByZXNvbHZlKHJlc3BvbnNlKTtcbiAgICAgICAgfTtcblxuICAgICAgICB4aHIudGltZW91dCA9IDA7XG4gICAgICAgIHhoci5vbmxvYWQgPSBoYW5kbGVyO1xuICAgICAgICB4aHIub25hYm9ydCA9IGhhbmRsZXI7XG4gICAgICAgIHhoci5vbmVycm9yID0gaGFuZGxlcjtcbiAgICAgICAgeGhyLm9udGltZW91dCA9IGZ1bmN0aW9uICgpIHt9O1xuICAgICAgICB4aHIub25wcm9ncmVzcyA9IGZ1bmN0aW9uICgpIHt9O1xuXG4gICAgICAgIGlmIChfLmlzUGxhaW5PYmplY3QocmVxdWVzdC54aHIpKSB7XG4gICAgICAgICAgICBfLmV4dGVuZCh4aHIsIHJlcXVlc3QueGhyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChfLmlzUGxhaW5PYmplY3QocmVxdWVzdC51cGxvYWQpKSB7XG4gICAgICAgICAgICBfLmV4dGVuZCh4aHIudXBsb2FkLCByZXF1ZXN0LnVwbG9hZCk7XG4gICAgICAgIH1cblxuICAgICAgICBfLmVhY2gocmVxdWVzdC5oZWFkZXJzIHx8IHt9LCBmdW5jdGlvbiAodmFsdWUsIGhlYWRlcikge1xuICAgICAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoaGVhZGVyLCB2YWx1ZSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHhoci5zZW5kKHJlcXVlc3QuZGF0YSk7XG4gICAgfSk7XG59O1xuIiwiLyoqXG4gKiBDT1JTIEludGVyY2VwdG9yLlxuICovXG5cbnZhciBfID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xudmFyIHhkckNsaWVudCA9IHJlcXVpcmUoJy4vY2xpZW50L3hkcicpO1xudmFyIHhockNvcnMgPSAnd2l0aENyZWRlbnRpYWxzJyBpbiBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbnZhciBvcmlnaW5VcmwgPSBfLnVybC5wYXJzZShsb2NhdGlvbi5ocmVmKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgICByZXF1ZXN0OiBmdW5jdGlvbiAocmVxdWVzdCkge1xuXG4gICAgICAgIGlmIChyZXF1ZXN0LmNyb3NzT3JpZ2luID09PSBudWxsKSB7XG4gICAgICAgICAgICByZXF1ZXN0LmNyb3NzT3JpZ2luID0gY3Jvc3NPcmlnaW4ocmVxdWVzdCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocmVxdWVzdC5jcm9zc09yaWdpbikge1xuXG4gICAgICAgICAgICBpZiAoIXhockNvcnMpIHtcbiAgICAgICAgICAgICAgICByZXF1ZXN0LmNsaWVudCA9IHhkckNsaWVudDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmVxdWVzdC5lbXVsYXRlSFRUUCA9IGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlcXVlc3Q7XG4gICAgfVxuXG59O1xuXG5mdW5jdGlvbiBjcm9zc09yaWdpbihyZXF1ZXN0KSB7XG5cbiAgICB2YXIgcmVxdWVzdFVybCA9IF8udXJsLnBhcnNlKF8udXJsKHJlcXVlc3QpKTtcblxuICAgIHJldHVybiAocmVxdWVzdFVybC5wcm90b2NvbCAhPT0gb3JpZ2luVXJsLnByb3RvY29sIHx8IHJlcXVlc3RVcmwuaG9zdCAhPT0gb3JpZ2luVXJsLmhvc3QpO1xufVxuIiwiLyoqXG4gKiBIZWFkZXIgSW50ZXJjZXB0b3IuXG4gKi9cblxudmFyIF8gPSByZXF1aXJlKCcuLi91dGlsJyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gICAgcmVxdWVzdDogZnVuY3Rpb24gKHJlcXVlc3QpIHtcblxuICAgICAgICByZXF1ZXN0Lm1ldGhvZCA9IHJlcXVlc3QubWV0aG9kLnRvVXBwZXJDYXNlKCk7XG4gICAgICAgIHJlcXVlc3QuaGVhZGVycyA9IF8uZXh0ZW5kKHt9LCBfLmh0dHAuaGVhZGVycy5jb21tb24sXG4gICAgICAgICAgICAhcmVxdWVzdC5jcm9zc09yaWdpbiA/IF8uaHR0cC5oZWFkZXJzLmN1c3RvbSA6IHt9LFxuICAgICAgICAgICAgXy5odHRwLmhlYWRlcnNbcmVxdWVzdC5tZXRob2QudG9Mb3dlckNhc2UoKV0sXG4gICAgICAgICAgICByZXF1ZXN0LmhlYWRlcnNcbiAgICAgICAgKTtcblxuICAgICAgICBpZiAoXy5pc1BsYWluT2JqZWN0KHJlcXVlc3QuZGF0YSkgJiYgL14oR0VUfEpTT05QKSQvaS50ZXN0KHJlcXVlc3QubWV0aG9kKSkge1xuICAgICAgICAgICAgXy5leHRlbmQocmVxdWVzdC5wYXJhbXMsIHJlcXVlc3QuZGF0YSk7XG4gICAgICAgICAgICBkZWxldGUgcmVxdWVzdC5kYXRhO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlcXVlc3Q7XG4gICAgfVxuXG59O1xuIiwiLyoqXG4gKiBTZXJ2aWNlIGZvciBzZW5kaW5nIG5ldHdvcmsgcmVxdWVzdHMuXG4gKi9cblxudmFyIF8gPSByZXF1aXJlKCcuLi91dGlsJyk7XG52YXIgQ2xpZW50ID0gcmVxdWlyZSgnLi9jbGllbnQnKTtcbnZhciBQcm9taXNlID0gcmVxdWlyZSgnLi4vcHJvbWlzZScpO1xudmFyIGludGVyY2VwdG9yID0gcmVxdWlyZSgnLi9pbnRlcmNlcHRvcicpO1xudmFyIGpzb25UeXBlID0geydDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbid9O1xuXG5mdW5jdGlvbiBIdHRwKHVybCwgb3B0aW9ucykge1xuXG4gICAgdmFyIGNsaWVudCA9IENsaWVudCwgcmVxdWVzdCwgcHJvbWlzZTtcblxuICAgIEh0dHAuaW50ZXJjZXB0b3JzLmZvckVhY2goZnVuY3Rpb24gKGhhbmRsZXIpIHtcbiAgICAgICAgY2xpZW50ID0gaW50ZXJjZXB0b3IoaGFuZGxlciwgdGhpcy4kdm0pKGNsaWVudCk7XG4gICAgfSwgdGhpcyk7XG5cbiAgICBvcHRpb25zID0gXy5pc09iamVjdCh1cmwpID8gdXJsIDogXy5leHRlbmQoe3VybDogdXJsfSwgb3B0aW9ucyk7XG4gICAgcmVxdWVzdCA9IF8ubWVyZ2Uoe30sIEh0dHAub3B0aW9ucywgdGhpcy4kb3B0aW9ucywgb3B0aW9ucyk7XG4gICAgcHJvbWlzZSA9IGNsaWVudChyZXF1ZXN0KS5iaW5kKHRoaXMuJHZtKS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuXG4gICAgICAgIHJldHVybiByZXNwb25zZS5vayA/IHJlc3BvbnNlIDogUHJvbWlzZS5yZWplY3QocmVzcG9uc2UpO1xuXG4gICAgfSwgZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG5cbiAgICAgICAgaWYgKHJlc3BvbnNlIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgICAgIF8uZXJyb3IocmVzcG9uc2UpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KHJlc3BvbnNlKTtcbiAgICB9KTtcblxuICAgIGlmIChyZXF1ZXN0LnN1Y2Nlc3MpIHtcbiAgICAgICAgcHJvbWlzZS5zdWNjZXNzKHJlcXVlc3Quc3VjY2Vzcyk7XG4gICAgfVxuXG4gICAgaWYgKHJlcXVlc3QuZXJyb3IpIHtcbiAgICAgICAgcHJvbWlzZS5lcnJvcihyZXF1ZXN0LmVycm9yKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcHJvbWlzZTtcbn1cblxuSHR0cC5vcHRpb25zID0ge1xuICAgIG1ldGhvZDogJ2dldCcsXG4gICAgZGF0YTogJycsXG4gICAgcGFyYW1zOiB7fSxcbiAgICBoZWFkZXJzOiB7fSxcbiAgICB4aHI6IG51bGwsXG4gICAgdXBsb2FkOiBudWxsLFxuICAgIGpzb25wOiAnY2FsbGJhY2snLFxuICAgIGJlZm9yZVNlbmQ6IG51bGwsXG4gICAgY3Jvc3NPcmlnaW46IG51bGwsXG4gICAgZW11bGF0ZUhUVFA6IGZhbHNlLFxuICAgIGVtdWxhdGVKU09OOiBmYWxzZSxcbiAgICB0aW1lb3V0OiAwXG59O1xuXG5IdHRwLmludGVyY2VwdG9ycyA9IFtcbiAgICByZXF1aXJlKCcuL2JlZm9yZScpLFxuICAgIHJlcXVpcmUoJy4vdGltZW91dCcpLFxuICAgIHJlcXVpcmUoJy4vanNvbnAnKSxcbiAgICByZXF1aXJlKCcuL21ldGhvZCcpLFxuICAgIHJlcXVpcmUoJy4vbWltZScpLFxuICAgIHJlcXVpcmUoJy4vaGVhZGVyJyksXG4gICAgcmVxdWlyZSgnLi9jb3JzJylcbl07XG5cbkh0dHAuaGVhZGVycyA9IHtcbiAgICBwdXQ6IGpzb25UeXBlLFxuICAgIHBvc3Q6IGpzb25UeXBlLFxuICAgIHBhdGNoOiBqc29uVHlwZSxcbiAgICBkZWxldGU6IGpzb25UeXBlLFxuICAgIGNvbW1vbjogeydBY2NlcHQnOiAnYXBwbGljYXRpb24vanNvbiwgdGV4dC9wbGFpbiwgKi8qJ30sXG4gICAgY3VzdG9tOiB7J1gtUmVxdWVzdGVkLVdpdGgnOiAnWE1MSHR0cFJlcXVlc3QnfVxufTtcblxuWydnZXQnLCAncHV0JywgJ3Bvc3QnLCAncGF0Y2gnLCAnZGVsZXRlJywgJ2pzb25wJ10uZm9yRWFjaChmdW5jdGlvbiAobWV0aG9kKSB7XG5cbiAgICBIdHRwW21ldGhvZF0gPSBmdW5jdGlvbiAodXJsLCBkYXRhLCBzdWNjZXNzLCBvcHRpb25zKSB7XG5cbiAgICAgICAgaWYgKF8uaXNGdW5jdGlvbihkYXRhKSkge1xuICAgICAgICAgICAgb3B0aW9ucyA9IHN1Y2Nlc3M7XG4gICAgICAgICAgICBzdWNjZXNzID0gZGF0YTtcbiAgICAgICAgICAgIGRhdGEgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoXy5pc09iamVjdChzdWNjZXNzKSkge1xuICAgICAgICAgICAgb3B0aW9ucyA9IHN1Y2Nlc3M7XG4gICAgICAgICAgICBzdWNjZXNzID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXModXJsLCBfLmV4dGVuZCh7bWV0aG9kOiBtZXRob2QsIGRhdGE6IGRhdGEsIHN1Y2Nlc3M6IHN1Y2Nlc3N9LCBvcHRpb25zKSk7XG4gICAgfTtcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IF8uaHR0cCA9IEh0dHA7XG4iLCIvKipcbiAqIEludGVyY2VwdG9yIGZhY3RvcnkuXG4gKi9cblxudmFyIF8gPSByZXF1aXJlKCcuLi91dGlsJyk7XG52YXIgUHJvbWlzZSA9IHJlcXVpcmUoJy4uL3Byb21pc2UnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaGFuZGxlciwgdm0pIHtcblxuICAgIHJldHVybiBmdW5jdGlvbiAoY2xpZW50KSB7XG5cbiAgICAgICAgaWYgKF8uaXNGdW5jdGlvbihoYW5kbGVyKSkge1xuICAgICAgICAgICAgaGFuZGxlciA9IGhhbmRsZXIuY2FsbCh2bSwgUHJvbWlzZSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKHJlcXVlc3QpIHtcblxuICAgICAgICAgICAgaWYgKF8uaXNGdW5jdGlvbihoYW5kbGVyLnJlcXVlc3QpKSB7XG4gICAgICAgICAgICAgICAgcmVxdWVzdCA9IGhhbmRsZXIucmVxdWVzdC5jYWxsKHZtLCByZXF1ZXN0KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHdoZW4ocmVxdWVzdCwgZnVuY3Rpb24gKHJlcXVlc3QpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gd2hlbihjbGllbnQocmVxdWVzdCksIGZ1bmN0aW9uIChyZXNwb25zZSkge1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChfLmlzRnVuY3Rpb24oaGFuZGxlci5yZXNwb25zZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3BvbnNlID0gaGFuZGxlci5yZXNwb25zZS5jYWxsKHZtLCByZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2U7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICB9O1xufTtcblxuZnVuY3Rpb24gd2hlbih2YWx1ZSwgZnVsZmlsbGVkLCByZWplY3RlZCkge1xuXG4gICAgdmFyIHByb21pc2UgPSBQcm9taXNlLnJlc29sdmUodmFsdWUpO1xuXG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAyKSB7XG4gICAgICAgIHJldHVybiBwcm9taXNlO1xuICAgIH1cblxuICAgIHJldHVybiBwcm9taXNlLnRoZW4oZnVsZmlsbGVkLCByZWplY3RlZCk7XG59XG4iLCIvKipcbiAqIEpTT05QIEludGVyY2VwdG9yLlxuICovXG5cbnZhciBqc29ucENsaWVudCA9IHJlcXVpcmUoJy4vY2xpZW50L2pzb25wJyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gICAgcmVxdWVzdDogZnVuY3Rpb24gKHJlcXVlc3QpIHtcblxuICAgICAgICBpZiAocmVxdWVzdC5tZXRob2QgPT0gJ0pTT05QJykge1xuICAgICAgICAgICAgcmVxdWVzdC5jbGllbnQgPSBqc29ucENsaWVudDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXF1ZXN0O1xuICAgIH1cblxufTtcbiIsIi8qKlxuICogSFRUUCBtZXRob2Qgb3ZlcnJpZGUgSW50ZXJjZXB0b3IuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgICByZXF1ZXN0OiBmdW5jdGlvbiAocmVxdWVzdCkge1xuXG4gICAgICAgIGlmIChyZXF1ZXN0LmVtdWxhdGVIVFRQICYmIC9eKFBVVHxQQVRDSHxERUxFVEUpJC9pLnRlc3QocmVxdWVzdC5tZXRob2QpKSB7XG4gICAgICAgICAgICByZXF1ZXN0LmhlYWRlcnNbJ1gtSFRUUC1NZXRob2QtT3ZlcnJpZGUnXSA9IHJlcXVlc3QubWV0aG9kO1xuICAgICAgICAgICAgcmVxdWVzdC5tZXRob2QgPSAnUE9TVCc7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVxdWVzdDtcbiAgICB9XG5cbn07XG4iLCIvKipcbiAqIE1pbWUgSW50ZXJjZXB0b3IuXG4gKi9cblxudmFyIF8gPSByZXF1aXJlKCcuLi91dGlsJyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gICAgcmVxdWVzdDogZnVuY3Rpb24gKHJlcXVlc3QpIHtcblxuICAgICAgICBpZiAocmVxdWVzdC5lbXVsYXRlSlNPTiAmJiBfLmlzUGxhaW5PYmplY3QocmVxdWVzdC5kYXRhKSkge1xuICAgICAgICAgICAgcmVxdWVzdC5oZWFkZXJzWydDb250ZW50LVR5cGUnXSA9ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnO1xuICAgICAgICAgICAgcmVxdWVzdC5kYXRhID0gXy51cmwucGFyYW1zKHJlcXVlc3QuZGF0YSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoXy5pc09iamVjdChyZXF1ZXN0LmRhdGEpICYmIC9Gb3JtRGF0YS9pLnRlc3QocmVxdWVzdC5kYXRhLnRvU3RyaW5nKCkpKSB7XG4gICAgICAgICAgICBkZWxldGUgcmVxdWVzdC5oZWFkZXJzWydDb250ZW50LVR5cGUnXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChfLmlzUGxhaW5PYmplY3QocmVxdWVzdC5kYXRhKSkge1xuICAgICAgICAgICAgcmVxdWVzdC5kYXRhID0gSlNPTi5zdHJpbmdpZnkocmVxdWVzdC5kYXRhKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXF1ZXN0O1xuICAgIH0sXG5cbiAgICByZXNwb25zZTogZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHJlc3BvbnNlLmRhdGEgPSBKU09OLnBhcnNlKHJlc3BvbnNlLmRhdGEpO1xuICAgICAgICB9IGNhdGNoIChlKSB7fVxuXG4gICAgICAgIHJldHVybiByZXNwb25zZTtcbiAgICB9XG5cbn07XG4iLCIvKipcbiAqIFRpbWVvdXQgSW50ZXJjZXB0b3IuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgdGltZW91dDtcblxuICAgIHJldHVybiB7XG5cbiAgICAgICAgcmVxdWVzdDogZnVuY3Rpb24gKHJlcXVlc3QpIHtcblxuICAgICAgICAgICAgaWYgKHJlcXVlc3QudGltZW91dCkge1xuICAgICAgICAgICAgICAgIHRpbWVvdXQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVxdWVzdC5jYW5jZWwoKTtcbiAgICAgICAgICAgICAgICB9LCByZXF1ZXN0LnRpbWVvdXQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gcmVxdWVzdDtcbiAgICAgICAgfSxcblxuICAgICAgICByZXNwb25zZTogZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG5cbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcblxuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xuICAgICAgICB9XG5cbiAgICB9O1xufTtcbiIsIi8qKlxuICogSW5zdGFsbCBwbHVnaW4uXG4gKi9cblxuZnVuY3Rpb24gaW5zdGFsbChWdWUpIHtcblxuICAgIHZhciBfID0gcmVxdWlyZSgnLi91dGlsJyk7XG5cbiAgICBfLmNvbmZpZyA9IFZ1ZS5jb25maWc7XG4gICAgXy53YXJuaW5nID0gVnVlLnV0aWwud2FybjtcbiAgICBfLm5leHRUaWNrID0gVnVlLnV0aWwubmV4dFRpY2s7XG5cbiAgICBWdWUudXJsID0gcmVxdWlyZSgnLi91cmwnKTtcbiAgICBWdWUuaHR0cCA9IHJlcXVpcmUoJy4vaHR0cCcpO1xuICAgIFZ1ZS5yZXNvdXJjZSA9IHJlcXVpcmUoJy4vcmVzb3VyY2UnKTtcbiAgICBWdWUuUHJvbWlzZSA9IHJlcXVpcmUoJy4vcHJvbWlzZScpO1xuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoVnVlLnByb3RvdHlwZSwge1xuXG4gICAgICAgICR1cmw6IHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfLm9wdGlvbnMoVnVlLnVybCwgdGhpcywgdGhpcy4kb3B0aW9ucy51cmwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgICRodHRwOiB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gXy5vcHRpb25zKFZ1ZS5odHRwLCB0aGlzLCB0aGlzLiRvcHRpb25zLmh0dHApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgICRyZXNvdXJjZToge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFZ1ZS5yZXNvdXJjZS5iaW5kKHRoaXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgICRwcm9taXNlOiB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGV4ZWN1dG9yKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgVnVlLlByb21pc2UoZXhlY3V0b3IsIHRoaXMpO1xuICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgfSk7XG59XG5cbmlmICh3aW5kb3cuVnVlKSB7XG4gICAgVnVlLnVzZShpbnN0YWxsKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpbnN0YWxsO1xuIiwiLyoqXG4gKiBQcm9taXNlcy9BKyBwb2x5ZmlsbCB2MS4xLjQgKGh0dHBzOi8vZ2l0aHViLmNvbS9icmFtc3RlaW4vcHJvbWlzKVxuICovXG5cbnZhciBfID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xuXG52YXIgUkVTT0xWRUQgPSAwO1xudmFyIFJFSkVDVEVEID0gMTtcbnZhciBQRU5ESU5HICA9IDI7XG5cbmZ1bmN0aW9uIFByb21pc2UoZXhlY3V0b3IpIHtcblxuICAgIHRoaXMuc3RhdGUgPSBQRU5ESU5HO1xuICAgIHRoaXMudmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5kZWZlcnJlZCA9IFtdO1xuXG4gICAgdmFyIHByb21pc2UgPSB0aGlzO1xuXG4gICAgdHJ5IHtcbiAgICAgICAgZXhlY3V0b3IoZnVuY3Rpb24gKHgpIHtcbiAgICAgICAgICAgIHByb21pc2UucmVzb2x2ZSh4KTtcbiAgICAgICAgfSwgZnVuY3Rpb24gKHIpIHtcbiAgICAgICAgICAgIHByb21pc2UucmVqZWN0KHIpO1xuICAgICAgICB9KTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHByb21pc2UucmVqZWN0KGUpO1xuICAgIH1cbn1cblxuUHJvbWlzZS5yZWplY3QgPSBmdW5jdGlvbiAocikge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIHJlamVjdChyKTtcbiAgICB9KTtcbn07XG5cblByb21pc2UucmVzb2x2ZSA9IGZ1bmN0aW9uICh4KSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgcmVzb2x2ZSh4KTtcbiAgICB9KTtcbn07XG5cblByb21pc2UuYWxsID0gZnVuY3Rpb24gYWxsKGl0ZXJhYmxlKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgdmFyIGNvdW50ID0gMCwgcmVzdWx0ID0gW107XG5cbiAgICAgICAgaWYgKGl0ZXJhYmxlLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgcmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gcmVzb2x2ZXIoaSkge1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICh4KSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0W2ldID0geDtcbiAgICAgICAgICAgICAgICBjb3VudCArPSAxO1xuXG4gICAgICAgICAgICAgICAgaWYgKGNvdW50ID09PSBpdGVyYWJsZS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGl0ZXJhYmxlLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgICBQcm9taXNlLnJlc29sdmUoaXRlcmFibGVbaV0pLnRoZW4ocmVzb2x2ZXIoaSksIHJlamVjdCk7XG4gICAgICAgIH1cbiAgICB9KTtcbn07XG5cblByb21pc2UucmFjZSA9IGZ1bmN0aW9uIHJhY2UoaXRlcmFibGUpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGl0ZXJhYmxlLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgICBQcm9taXNlLnJlc29sdmUoaXRlcmFibGVbaV0pLnRoZW4ocmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgICAgfVxuICAgIH0pO1xufTtcblxudmFyIHAgPSBQcm9taXNlLnByb3RvdHlwZTtcblxucC5yZXNvbHZlID0gZnVuY3Rpb24gcmVzb2x2ZSh4KSB7XG4gICAgdmFyIHByb21pc2UgPSB0aGlzO1xuXG4gICAgaWYgKHByb21pc2Uuc3RhdGUgPT09IFBFTkRJTkcpIHtcbiAgICAgICAgaWYgKHggPT09IHByb21pc2UpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1Byb21pc2Ugc2V0dGxlZCB3aXRoIGl0c2VsZi4nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBjYWxsZWQgPSBmYWxzZTtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdmFyIHRoZW4gPSB4ICYmIHhbJ3RoZW4nXTtcblxuICAgICAgICAgICAgaWYgKHggIT09IG51bGwgJiYgdHlwZW9mIHggPT09ICdvYmplY3QnICYmIHR5cGVvZiB0aGVuID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgdGhlbi5jYWxsKHgsIGZ1bmN0aW9uICh4KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghY2FsbGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9taXNlLnJlc29sdmUoeCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY2FsbGVkID0gdHJ1ZTtcblxuICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChyKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghY2FsbGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9taXNlLnJlamVjdChyKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjYWxsZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgaWYgKCFjYWxsZWQpIHtcbiAgICAgICAgICAgICAgICBwcm9taXNlLnJlamVjdChlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb21pc2Uuc3RhdGUgPSBSRVNPTFZFRDtcbiAgICAgICAgcHJvbWlzZS52YWx1ZSA9IHg7XG4gICAgICAgIHByb21pc2Uubm90aWZ5KCk7XG4gICAgfVxufTtcblxucC5yZWplY3QgPSBmdW5jdGlvbiByZWplY3QocmVhc29uKSB7XG4gICAgdmFyIHByb21pc2UgPSB0aGlzO1xuXG4gICAgaWYgKHByb21pc2Uuc3RhdGUgPT09IFBFTkRJTkcpIHtcbiAgICAgICAgaWYgKHJlYXNvbiA9PT0gcHJvbWlzZSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignUHJvbWlzZSBzZXR0bGVkIHdpdGggaXRzZWxmLicpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvbWlzZS5zdGF0ZSA9IFJFSkVDVEVEO1xuICAgICAgICBwcm9taXNlLnZhbHVlID0gcmVhc29uO1xuICAgICAgICBwcm9taXNlLm5vdGlmeSgpO1xuICAgIH1cbn07XG5cbnAubm90aWZ5ID0gZnVuY3Rpb24gbm90aWZ5KCkge1xuICAgIHZhciBwcm9taXNlID0gdGhpcztcblxuICAgIF8ubmV4dFRpY2soZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAocHJvbWlzZS5zdGF0ZSAhPT0gUEVORElORykge1xuICAgICAgICAgICAgd2hpbGUgKHByb21pc2UuZGVmZXJyZWQubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gcHJvbWlzZS5kZWZlcnJlZC5zaGlmdCgpLFxuICAgICAgICAgICAgICAgICAgICBvblJlc29sdmVkID0gZGVmZXJyZWRbMF0sXG4gICAgICAgICAgICAgICAgICAgIG9uUmVqZWN0ZWQgPSBkZWZlcnJlZFsxXSxcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSA9IGRlZmVycmVkWzJdLFxuICAgICAgICAgICAgICAgICAgICByZWplY3QgPSBkZWZlcnJlZFszXTtcblxuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwcm9taXNlLnN0YXRlID09PSBSRVNPTFZFRCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBvblJlc29sdmVkID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShvblJlc29sdmVkLmNhbGwodW5kZWZpbmVkLCBwcm9taXNlLnZhbHVlKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUocHJvbWlzZS52YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocHJvbWlzZS5zdGF0ZSA9PT0gUkVKRUNURUQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2Ygb25SZWplY3RlZCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUob25SZWplY3RlZC5jYWxsKHVuZGVmaW5lZCwgcHJvbWlzZS52YWx1ZSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWplY3QocHJvbWlzZS52YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcbn07XG5cbnAudGhlbiA9IGZ1bmN0aW9uIHRoZW4ob25SZXNvbHZlZCwgb25SZWplY3RlZCkge1xuICAgIHZhciBwcm9taXNlID0gdGhpcztcblxuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIHByb21pc2UuZGVmZXJyZWQucHVzaChbb25SZXNvbHZlZCwgb25SZWplY3RlZCwgcmVzb2x2ZSwgcmVqZWN0XSk7XG4gICAgICAgIHByb21pc2Uubm90aWZ5KCk7XG4gICAgfSk7XG59O1xuXG5wLmNhdGNoID0gZnVuY3Rpb24gKG9uUmVqZWN0ZWQpIHtcbiAgICByZXR1cm4gdGhpcy50aGVuKHVuZGVmaW5lZCwgb25SZWplY3RlZCk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFByb21pc2U7XG4iLCIvKipcbiAqIFVSTCBUZW1wbGF0ZSB2Mi4wLjYgKGh0dHBzOi8vZ2l0aHViLmNvbS9icmFtc3RlaW4vdXJsLXRlbXBsYXRlKVxuICovXG5cbmV4cG9ydHMuZXhwYW5kID0gZnVuY3Rpb24gKHVybCwgcGFyYW1zLCB2YXJpYWJsZXMpIHtcblxuICAgIHZhciB0bXBsID0gdGhpcy5wYXJzZSh1cmwpLCBleHBhbmRlZCA9IHRtcGwuZXhwYW5kKHBhcmFtcyk7XG5cbiAgICBpZiAodmFyaWFibGVzKSB7XG4gICAgICAgIHZhcmlhYmxlcy5wdXNoLmFwcGx5KHZhcmlhYmxlcywgdG1wbC52YXJzKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZXhwYW5kZWQ7XG59O1xuXG5leHBvcnRzLnBhcnNlID0gZnVuY3Rpb24gKHRlbXBsYXRlKSB7XG5cbiAgICB2YXIgb3BlcmF0b3JzID0gWycrJywgJyMnLCAnLicsICcvJywgJzsnLCAnPycsICcmJ10sIHZhcmlhYmxlcyA9IFtdO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgdmFyczogdmFyaWFibGVzLFxuICAgICAgICBleHBhbmQ6IGZ1bmN0aW9uIChjb250ZXh0KSB7XG4gICAgICAgICAgICByZXR1cm4gdGVtcGxhdGUucmVwbGFjZSgvXFx7KFteXFx7XFx9XSspXFx9fChbXlxce1xcfV0rKS9nLCBmdW5jdGlvbiAoXywgZXhwcmVzc2lvbiwgbGl0ZXJhbCkge1xuICAgICAgICAgICAgICAgIGlmIChleHByZXNzaW9uKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIG9wZXJhdG9yID0gbnVsbCwgdmFsdWVzID0gW107XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wZXJhdG9ycy5pbmRleE9mKGV4cHJlc3Npb24uY2hhckF0KDApKSAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wZXJhdG9yID0gZXhwcmVzc2lvbi5jaGFyQXQoMCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBleHByZXNzaW9uID0gZXhwcmVzc2lvbi5zdWJzdHIoMSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBleHByZXNzaW9uLnNwbGl0KC8sL2cpLmZvckVhY2goZnVuY3Rpb24gKHZhcmlhYmxlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdG1wID0gLyhbXjpcXCpdKikoPzo6KFxcZCspfChcXCopKT8vLmV4ZWModmFyaWFibGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVzLnB1c2guYXBwbHkodmFsdWVzLCBleHBvcnRzLmdldFZhbHVlcyhjb250ZXh0LCBvcGVyYXRvciwgdG1wWzFdLCB0bXBbMl0gfHwgdG1wWzNdKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXJpYWJsZXMucHVzaCh0bXBbMV0pO1xuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAob3BlcmF0b3IgJiYgb3BlcmF0b3IgIT09ICcrJykge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgc2VwYXJhdG9yID0gJywnO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAob3BlcmF0b3IgPT09ICc/Jykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlcGFyYXRvciA9ICcmJztcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAob3BlcmF0b3IgIT09ICcjJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlcGFyYXRvciA9IG9wZXJhdG9yO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKHZhbHVlcy5sZW5ndGggIT09IDAgPyBvcGVyYXRvciA6ICcnKSArIHZhbHVlcy5qb2luKHNlcGFyYXRvcik7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWVzLmpvaW4oJywnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGV4cG9ydHMuZW5jb2RlUmVzZXJ2ZWQobGl0ZXJhbCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xufTtcblxuZXhwb3J0cy5nZXRWYWx1ZXMgPSBmdW5jdGlvbiAoY29udGV4dCwgb3BlcmF0b3IsIGtleSwgbW9kaWZpZXIpIHtcblxuICAgIHZhciB2YWx1ZSA9IGNvbnRleHRba2V5XSwgcmVzdWx0ID0gW107XG5cbiAgICBpZiAodGhpcy5pc0RlZmluZWQodmFsdWUpICYmIHZhbHVlICE9PSAnJykge1xuICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyB8fCB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInIHx8IHR5cGVvZiB2YWx1ZSA9PT0gJ2Jvb2xlYW4nKSB7XG4gICAgICAgICAgICB2YWx1ZSA9IHZhbHVlLnRvU3RyaW5nKCk7XG5cbiAgICAgICAgICAgIGlmIChtb2RpZmllciAmJiBtb2RpZmllciAhPT0gJyonKSB7XG4gICAgICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZS5zdWJzdHJpbmcoMCwgcGFyc2VJbnQobW9kaWZpZXIsIDEwKSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKHRoaXMuZW5jb2RlVmFsdWUob3BlcmF0b3IsIHZhbHVlLCB0aGlzLmlzS2V5T3BlcmF0b3Iob3BlcmF0b3IpID8ga2V5IDogbnVsbCkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKG1vZGlmaWVyID09PSAnKicpIHtcbiAgICAgICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUuZmlsdGVyKHRoaXMuaXNEZWZpbmVkKS5mb3JFYWNoKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnB1c2godGhpcy5lbmNvZGVWYWx1ZShvcGVyYXRvciwgdmFsdWUsIHRoaXMuaXNLZXlPcGVyYXRvcihvcGVyYXRvcikgPyBrZXkgOiBudWxsKSk7XG4gICAgICAgICAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIE9iamVjdC5rZXlzKHZhbHVlKS5mb3JFYWNoKGZ1bmN0aW9uIChrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5pc0RlZmluZWQodmFsdWVba10pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnB1c2godGhpcy5lbmNvZGVWYWx1ZShvcGVyYXRvciwgdmFsdWVba10sIGspKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB2YXIgdG1wID0gW107XG5cbiAgICAgICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUuZmlsdGVyKHRoaXMuaXNEZWZpbmVkKS5mb3JFYWNoKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdG1wLnB1c2godGhpcy5lbmNvZGVWYWx1ZShvcGVyYXRvciwgdmFsdWUpKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmtleXModmFsdWUpLmZvckVhY2goZnVuY3Rpb24gKGspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmlzRGVmaW5lZCh2YWx1ZVtrXSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0bXAucHVzaChlbmNvZGVVUklDb21wb25lbnQoaykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRtcC5wdXNoKHRoaXMuZW5jb2RlVmFsdWUob3BlcmF0b3IsIHZhbHVlW2tdLnRvU3RyaW5nKCkpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuaXNLZXlPcGVyYXRvcihvcGVyYXRvcikpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnB1c2goZW5jb2RlVVJJQ29tcG9uZW50KGtleSkgKyAnPScgKyB0bXAuam9pbignLCcpKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRtcC5sZW5ndGggIT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnB1c2godG1wLmpvaW4oJywnKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKG9wZXJhdG9yID09PSAnOycpIHtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKGVuY29kZVVSSUNvbXBvbmVudChrZXkpKTtcbiAgICAgICAgfSBlbHNlIGlmICh2YWx1ZSA9PT0gJycgJiYgKG9wZXJhdG9yID09PSAnJicgfHwgb3BlcmF0b3IgPT09ICc/JykpIHtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKGVuY29kZVVSSUNvbXBvbmVudChrZXkpICsgJz0nKTtcbiAgICAgICAgfSBlbHNlIGlmICh2YWx1ZSA9PT0gJycpIHtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKCcnKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG59O1xuXG5leHBvcnRzLmlzRGVmaW5lZCA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHJldHVybiB2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsO1xufTtcblxuZXhwb3J0cy5pc0tleU9wZXJhdG9yID0gZnVuY3Rpb24gKG9wZXJhdG9yKSB7XG4gICAgcmV0dXJuIG9wZXJhdG9yID09PSAnOycgfHwgb3BlcmF0b3IgPT09ICcmJyB8fCBvcGVyYXRvciA9PT0gJz8nO1xufTtcblxuZXhwb3J0cy5lbmNvZGVWYWx1ZSA9IGZ1bmN0aW9uIChvcGVyYXRvciwgdmFsdWUsIGtleSkge1xuXG4gICAgdmFsdWUgPSAob3BlcmF0b3IgPT09ICcrJyB8fCBvcGVyYXRvciA9PT0gJyMnKSA/IHRoaXMuZW5jb2RlUmVzZXJ2ZWQodmFsdWUpIDogZW5jb2RlVVJJQ29tcG9uZW50KHZhbHVlKTtcblxuICAgIGlmIChrZXkpIHtcbiAgICAgICAgcmV0dXJuIGVuY29kZVVSSUNvbXBvbmVudChrZXkpICsgJz0nICsgdmFsdWU7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cbn07XG5cbmV4cG9ydHMuZW5jb2RlUmVzZXJ2ZWQgPSBmdW5jdGlvbiAoc3RyKSB7XG4gICAgcmV0dXJuIHN0ci5zcGxpdCgvKCVbMC05QS1GYS1mXXsyfSkvZykubWFwKGZ1bmN0aW9uIChwYXJ0KSB7XG4gICAgICAgIGlmICghLyVbMC05QS1GYS1mXS8udGVzdChwYXJ0KSkge1xuICAgICAgICAgICAgcGFydCA9IGVuY29kZVVSSShwYXJ0KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcGFydDtcbiAgICB9KS5qb2luKCcnKTtcbn07XG4iLCIvKipcbiAqIFByb21pc2UgYWRhcHRlci5cbiAqL1xuXG52YXIgXyA9IHJlcXVpcmUoJy4vdXRpbCcpO1xudmFyIFByb21pc2VPYmogPSB3aW5kb3cuUHJvbWlzZSB8fCByZXF1aXJlKCcuL2xpYi9wcm9taXNlJyk7XG5cbmZ1bmN0aW9uIFByb21pc2UoZXhlY3V0b3IsIGNvbnRleHQpIHtcblxuICAgIGlmIChleGVjdXRvciBpbnN0YW5jZW9mIFByb21pc2VPYmopIHtcbiAgICAgICAgdGhpcy5wcm9taXNlID0gZXhlY3V0b3I7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5wcm9taXNlID0gbmV3IFByb21pc2VPYmooZXhlY3V0b3IuYmluZChjb250ZXh0KSk7XG4gICAgfVxuXG4gICAgdGhpcy5jb250ZXh0ID0gY29udGV4dDtcbn1cblxuUHJvbWlzZS5hbGwgPSBmdW5jdGlvbiAoaXRlcmFibGUsIGNvbnRleHQpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoUHJvbWlzZU9iai5hbGwoaXRlcmFibGUpLCBjb250ZXh0KTtcbn07XG5cblByb21pc2UucmVzb2x2ZSA9IGZ1bmN0aW9uICh2YWx1ZSwgY29udGV4dCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShQcm9taXNlT2JqLnJlc29sdmUodmFsdWUpLCBjb250ZXh0KTtcbn07XG5cblByb21pc2UucmVqZWN0ID0gZnVuY3Rpb24gKHJlYXNvbiwgY29udGV4dCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShQcm9taXNlT2JqLnJlamVjdChyZWFzb24pLCBjb250ZXh0KTtcbn07XG5cblByb21pc2UucmFjZSA9IGZ1bmN0aW9uIChpdGVyYWJsZSwgY29udGV4dCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShQcm9taXNlT2JqLnJhY2UoaXRlcmFibGUpLCBjb250ZXh0KTtcbn07XG5cbnZhciBwID0gUHJvbWlzZS5wcm90b3R5cGU7XG5cbnAuYmluZCA9IGZ1bmN0aW9uIChjb250ZXh0KSB7XG4gICAgdGhpcy5jb250ZXh0ID0gY29udGV4dDtcbiAgICByZXR1cm4gdGhpcztcbn07XG5cbnAudGhlbiA9IGZ1bmN0aW9uIChmdWxmaWxsZWQsIHJlamVjdGVkKSB7XG5cbiAgICBpZiAoZnVsZmlsbGVkICYmIGZ1bGZpbGxlZC5iaW5kICYmIHRoaXMuY29udGV4dCkge1xuICAgICAgICBmdWxmaWxsZWQgPSBmdWxmaWxsZWQuYmluZCh0aGlzLmNvbnRleHQpO1xuICAgIH1cblxuICAgIGlmIChyZWplY3RlZCAmJiByZWplY3RlZC5iaW5kICYmIHRoaXMuY29udGV4dCkge1xuICAgICAgICByZWplY3RlZCA9IHJlamVjdGVkLmJpbmQodGhpcy5jb250ZXh0KTtcbiAgICB9XG5cbiAgICB0aGlzLnByb21pc2UgPSB0aGlzLnByb21pc2UudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTtcblxuICAgIHJldHVybiB0aGlzO1xufTtcblxucC5jYXRjaCA9IGZ1bmN0aW9uIChyZWplY3RlZCkge1xuXG4gICAgaWYgKHJlamVjdGVkICYmIHJlamVjdGVkLmJpbmQgJiYgdGhpcy5jb250ZXh0KSB7XG4gICAgICAgIHJlamVjdGVkID0gcmVqZWN0ZWQuYmluZCh0aGlzLmNvbnRleHQpO1xuICAgIH1cblxuICAgIHRoaXMucHJvbWlzZSA9IHRoaXMucHJvbWlzZS5jYXRjaChyZWplY3RlZCk7XG5cbiAgICByZXR1cm4gdGhpcztcbn07XG5cbnAuZmluYWxseSA9IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuXG4gICAgcmV0dXJuIHRoaXMudGhlbihmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrLmNhbGwodGhpcyk7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH0sIGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAgICAgICAgIGNhbGxiYWNrLmNhbGwodGhpcyk7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZU9iai5yZWplY3QocmVhc29uKTtcbiAgICAgICAgfVxuICAgICk7XG59O1xuXG5wLnN1Y2Nlc3MgPSBmdW5jdGlvbiAoY2FsbGJhY2spIHtcblxuICAgIF8ud2FybignVGhlIGBzdWNjZXNzYCBtZXRob2QgaGFzIGJlZW4gZGVwcmVjYXRlZC4gVXNlIHRoZSBgdGhlbmAgbWV0aG9kIGluc3RlYWQuJyk7XG5cbiAgICByZXR1cm4gdGhpcy50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICByZXR1cm4gY2FsbGJhY2suY2FsbCh0aGlzLCByZXNwb25zZS5kYXRhLCByZXNwb25zZS5zdGF0dXMsIHJlc3BvbnNlKSB8fCByZXNwb25zZTtcbiAgICB9KTtcbn07XG5cbnAuZXJyb3IgPSBmdW5jdGlvbiAoY2FsbGJhY2spIHtcblxuICAgIF8ud2FybignVGhlIGBlcnJvcmAgbWV0aG9kIGhhcyBiZWVuIGRlcHJlY2F0ZWQuIFVzZSB0aGUgYGNhdGNoYCBtZXRob2QgaW5zdGVhZC4nKTtcblxuICAgIHJldHVybiB0aGlzLmNhdGNoKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICByZXR1cm4gY2FsbGJhY2suY2FsbCh0aGlzLCByZXNwb25zZS5kYXRhLCByZXNwb25zZS5zdGF0dXMsIHJlc3BvbnNlKSB8fCByZXNwb25zZTtcbiAgICB9KTtcbn07XG5cbnAuYWx3YXlzID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG5cbiAgICBfLndhcm4oJ1RoZSBgYWx3YXlzYCBtZXRob2QgaGFzIGJlZW4gZGVwcmVjYXRlZC4gVXNlIHRoZSBgZmluYWxseWAgbWV0aG9kIGluc3RlYWQuJyk7XG5cbiAgICB2YXIgY2IgPSBmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrLmNhbGwodGhpcywgcmVzcG9uc2UuZGF0YSwgcmVzcG9uc2Uuc3RhdHVzLCByZXNwb25zZSkgfHwgcmVzcG9uc2U7XG4gICAgfTtcblxuICAgIHJldHVybiB0aGlzLnRoZW4oY2IsIGNiKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gUHJvbWlzZTtcbiIsIi8qKlxuICogU2VydmljZSBmb3IgaW50ZXJhY3Rpbmcgd2l0aCBSRVNUZnVsIHNlcnZpY2VzLlxuICovXG5cbnZhciBfID0gcmVxdWlyZSgnLi91dGlsJyk7XG5cbmZ1bmN0aW9uIFJlc291cmNlKHVybCwgcGFyYW1zLCBhY3Rpb25zLCBvcHRpb25zKSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXMsIHJlc291cmNlID0ge307XG5cbiAgICBhY3Rpb25zID0gXy5leHRlbmQoe30sXG4gICAgICAgIFJlc291cmNlLmFjdGlvbnMsXG4gICAgICAgIGFjdGlvbnNcbiAgICApO1xuXG4gICAgXy5lYWNoKGFjdGlvbnMsIGZ1bmN0aW9uIChhY3Rpb24sIG5hbWUpIHtcblxuICAgICAgICBhY3Rpb24gPSBfLm1lcmdlKHt1cmw6IHVybCwgcGFyYW1zOiBwYXJhbXMgfHwge319LCBvcHRpb25zLCBhY3Rpb24pO1xuXG4gICAgICAgIHJlc291cmNlW25hbWVdID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIChzZWxmLiRodHRwIHx8IF8uaHR0cCkob3B0cyhhY3Rpb24sIGFyZ3VtZW50cykpO1xuICAgICAgICB9O1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHJlc291cmNlO1xufVxuXG5mdW5jdGlvbiBvcHRzKGFjdGlvbiwgYXJncykge1xuXG4gICAgdmFyIG9wdGlvbnMgPSBfLmV4dGVuZCh7fSwgYWN0aW9uKSwgcGFyYW1zID0ge30sIGRhdGEsIHN1Y2Nlc3MsIGVycm9yO1xuXG4gICAgc3dpdGNoIChhcmdzLmxlbmd0aCkge1xuXG4gICAgICAgIGNhc2UgNDpcblxuICAgICAgICAgICAgZXJyb3IgPSBhcmdzWzNdO1xuICAgICAgICAgICAgc3VjY2VzcyA9IGFyZ3NbMl07XG5cbiAgICAgICAgY2FzZSAzOlxuICAgICAgICBjYXNlIDI6XG5cbiAgICAgICAgICAgIGlmIChfLmlzRnVuY3Rpb24oYXJnc1sxXSkpIHtcblxuICAgICAgICAgICAgICAgIGlmIChfLmlzRnVuY3Rpb24oYXJnc1swXSkpIHtcblxuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzID0gYXJnc1swXTtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3IgPSBhcmdzWzFdO1xuXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHN1Y2Nlc3MgPSBhcmdzWzFdO1xuICAgICAgICAgICAgICAgIGVycm9yID0gYXJnc1syXTtcblxuICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgIHBhcmFtcyA9IGFyZ3NbMF07XG4gICAgICAgICAgICAgICAgZGF0YSA9IGFyZ3NbMV07XG4gICAgICAgICAgICAgICAgc3VjY2VzcyA9IGFyZ3NbMl07XG5cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cblxuICAgICAgICBjYXNlIDE6XG5cbiAgICAgICAgICAgIGlmIChfLmlzRnVuY3Rpb24oYXJnc1swXSkpIHtcbiAgICAgICAgICAgICAgICBzdWNjZXNzID0gYXJnc1swXTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoL14oUE9TVHxQVVR8UEFUQ0gpJC9pLnRlc3Qob3B0aW9ucy5tZXRob2QpKSB7XG4gICAgICAgICAgICAgICAgZGF0YSA9IGFyZ3NbMF07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHBhcmFtcyA9IGFyZ3NbMF07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgMDpcblxuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgZGVmYXVsdDpcblxuICAgICAgICAgICAgdGhyb3cgJ0V4cGVjdGVkIHVwIHRvIDQgYXJndW1lbnRzIFtwYXJhbXMsIGRhdGEsIHN1Y2Nlc3MsIGVycm9yXSwgZ290ICcgKyBhcmdzLmxlbmd0aCArICcgYXJndW1lbnRzJztcbiAgICB9XG5cbiAgICBvcHRpb25zLmRhdGEgPSBkYXRhO1xuICAgIG9wdGlvbnMucGFyYW1zID0gXy5leHRlbmQoe30sIG9wdGlvbnMucGFyYW1zLCBwYXJhbXMpO1xuXG4gICAgaWYgKHN1Y2Nlc3MpIHtcbiAgICAgICAgb3B0aW9ucy5zdWNjZXNzID0gc3VjY2VzcztcbiAgICB9XG5cbiAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgb3B0aW9ucy5lcnJvciA9IGVycm9yO1xuICAgIH1cblxuICAgIHJldHVybiBvcHRpb25zO1xufVxuXG5SZXNvdXJjZS5hY3Rpb25zID0ge1xuXG4gICAgZ2V0OiB7bWV0aG9kOiAnR0VUJ30sXG4gICAgc2F2ZToge21ldGhvZDogJ1BPU1QnfSxcbiAgICBxdWVyeToge21ldGhvZDogJ0dFVCd9LFxuICAgIHVwZGF0ZToge21ldGhvZDogJ1BVVCd9LFxuICAgIHJlbW92ZToge21ldGhvZDogJ0RFTEVURSd9LFxuICAgIGRlbGV0ZToge21ldGhvZDogJ0RFTEVURSd9XG5cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gXy5yZXNvdXJjZSA9IFJlc291cmNlO1xuIiwiLyoqXG4gKiBTZXJ2aWNlIGZvciBVUkwgdGVtcGxhdGluZy5cbiAqL1xuXG52YXIgXyA9IHJlcXVpcmUoJy4uL3V0aWwnKTtcbnZhciBpZSA9IGRvY3VtZW50LmRvY3VtZW50TW9kZTtcbnZhciBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcblxuZnVuY3Rpb24gVXJsKHVybCwgcGFyYW1zKSB7XG5cbiAgICB2YXIgb3B0aW9ucyA9IHVybCwgdHJhbnNmb3JtO1xuXG4gICAgaWYgKF8uaXNTdHJpbmcodXJsKSkge1xuICAgICAgICBvcHRpb25zID0ge3VybDogdXJsLCBwYXJhbXM6IHBhcmFtc307XG4gICAgfVxuXG4gICAgb3B0aW9ucyA9IF8ubWVyZ2Uoe30sIFVybC5vcHRpb25zLCB0aGlzLiRvcHRpb25zLCBvcHRpb25zKTtcblxuICAgIFVybC50cmFuc2Zvcm1zLmZvckVhY2goZnVuY3Rpb24gKGhhbmRsZXIpIHtcbiAgICAgICAgdHJhbnNmb3JtID0gZmFjdG9yeShoYW5kbGVyLCB0cmFuc2Zvcm0sIHRoaXMuJHZtKTtcbiAgICB9LCB0aGlzKTtcblxuICAgIHJldHVybiB0cmFuc2Zvcm0ob3B0aW9ucyk7XG59O1xuXG4vKipcbiAqIFVybCBvcHRpb25zLlxuICovXG5cblVybC5vcHRpb25zID0ge1xuICAgIHVybDogJycsXG4gICAgcm9vdDogbnVsbCxcbiAgICBwYXJhbXM6IHt9XG59O1xuXG4vKipcbiAqIFVybCB0cmFuc2Zvcm1zLlxuICovXG5cblVybC50cmFuc2Zvcm1zID0gW1xuICAgIHJlcXVpcmUoJy4vdGVtcGxhdGUnKSxcbiAgICByZXF1aXJlKCcuL2xlZ2FjeScpLFxuICAgIHJlcXVpcmUoJy4vcXVlcnknKSxcbiAgICByZXF1aXJlKCcuL3Jvb3QnKVxuXTtcblxuLyoqXG4gKiBFbmNvZGVzIGEgVXJsIHBhcmFtZXRlciBzdHJpbmcuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICovXG5cblVybC5wYXJhbXMgPSBmdW5jdGlvbiAob2JqKSB7XG5cbiAgICB2YXIgcGFyYW1zID0gW10sIGVzY2FwZSA9IGVuY29kZVVSSUNvbXBvbmVudDtcblxuICAgIHBhcmFtcy5hZGQgPSBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuXG4gICAgICAgIGlmIChfLmlzRnVuY3Rpb24odmFsdWUpKSB7XG4gICAgICAgICAgICB2YWx1ZSA9IHZhbHVlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodmFsdWUgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHZhbHVlID0gJyc7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnB1c2goZXNjYXBlKGtleSkgKyAnPScgKyBlc2NhcGUodmFsdWUpKTtcbiAgICB9O1xuXG4gICAgc2VyaWFsaXplKHBhcmFtcywgb2JqKTtcblxuICAgIHJldHVybiBwYXJhbXMuam9pbignJicpLnJlcGxhY2UoLyUyMC9nLCAnKycpO1xufTtcblxuLyoqXG4gKiBQYXJzZSBhIFVSTCBhbmQgcmV0dXJuIGl0cyBjb21wb25lbnRzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqL1xuXG5VcmwucGFyc2UgPSBmdW5jdGlvbiAodXJsKSB7XG5cbiAgICBpZiAoaWUpIHtcbiAgICAgICAgZWwuaHJlZiA9IHVybDtcbiAgICAgICAgdXJsID0gZWwuaHJlZjtcbiAgICB9XG5cbiAgICBlbC5ocmVmID0gdXJsO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgaHJlZjogZWwuaHJlZixcbiAgICAgICAgcHJvdG9jb2w6IGVsLnByb3RvY29sID8gZWwucHJvdG9jb2wucmVwbGFjZSgvOiQvLCAnJykgOiAnJyxcbiAgICAgICAgcG9ydDogZWwucG9ydCxcbiAgICAgICAgaG9zdDogZWwuaG9zdCxcbiAgICAgICAgaG9zdG5hbWU6IGVsLmhvc3RuYW1lLFxuICAgICAgICBwYXRobmFtZTogZWwucGF0aG5hbWUuY2hhckF0KDApID09PSAnLycgPyBlbC5wYXRobmFtZSA6ICcvJyArIGVsLnBhdGhuYW1lLFxuICAgICAgICBzZWFyY2g6IGVsLnNlYXJjaCA/IGVsLnNlYXJjaC5yZXBsYWNlKC9eXFw/LywgJycpIDogJycsXG4gICAgICAgIGhhc2g6IGVsLmhhc2ggPyBlbC5oYXNoLnJlcGxhY2UoL14jLywgJycpIDogJydcbiAgICB9O1xufTtcblxuZnVuY3Rpb24gZmFjdG9yeShoYW5kbGVyLCBuZXh0LCB2bSkge1xuICAgIHJldHVybiBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gaGFuZGxlci5jYWxsKHZtLCBvcHRpb25zLCBuZXh0KTtcbiAgICB9O1xufVxuXG5mdW5jdGlvbiBzZXJpYWxpemUocGFyYW1zLCBvYmosIHNjb3BlKSB7XG5cbiAgICB2YXIgYXJyYXkgPSBfLmlzQXJyYXkob2JqKSwgcGxhaW4gPSBfLmlzUGxhaW5PYmplY3Qob2JqKSwgaGFzaDtcblxuICAgIF8uZWFjaChvYmosIGZ1bmN0aW9uICh2YWx1ZSwga2V5KSB7XG5cbiAgICAgICAgaGFzaCA9IF8uaXNPYmplY3QodmFsdWUpIHx8IF8uaXNBcnJheSh2YWx1ZSk7XG5cbiAgICAgICAgaWYgKHNjb3BlKSB7XG4gICAgICAgICAgICBrZXkgPSBzY29wZSArICdbJyArIChwbGFpbiB8fCBoYXNoID8ga2V5IDogJycpICsgJ10nO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFzY29wZSAmJiBhcnJheSkge1xuICAgICAgICAgICAgcGFyYW1zLmFkZCh2YWx1ZS5uYW1lLCB2YWx1ZS52YWx1ZSk7XG4gICAgICAgIH0gZWxzZSBpZiAoaGFzaCkge1xuICAgICAgICAgICAgc2VyaWFsaXplKHBhcmFtcywgdmFsdWUsIGtleSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwYXJhbXMuYWRkKGtleSwgdmFsdWUpO1xuICAgICAgICB9XG4gICAgfSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gXy51cmwgPSBVcmw7XG4iLCIvKipcbiAqIExlZ2FjeSBUcmFuc2Zvcm0uXG4gKi9cblxudmFyIF8gPSByZXF1aXJlKCcuLi91dGlsJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKG9wdGlvbnMsIG5leHQpIHtcblxuICAgIHZhciB2YXJpYWJsZXMgPSBbXSwgdXJsID0gbmV4dChvcHRpb25zKTtcblxuICAgIHVybCA9IHVybC5yZXBsYWNlKC8oXFwvPyk6KFthLXpdXFx3KikvZ2ksIGZ1bmN0aW9uIChtYXRjaCwgc2xhc2gsIG5hbWUpIHtcblxuICAgICAgICBfLndhcm4oJ1RoZSBgOicgKyBuYW1lICsgJ2AgcGFyYW1ldGVyIHN5bnRheCBoYXMgYmVlbiBkZXByZWNhdGVkLiBVc2UgdGhlIGB7JyArIG5hbWUgKyAnfWAgc3ludGF4IGluc3RlYWQuJyk7XG5cbiAgICAgICAgaWYgKG9wdGlvbnMucGFyYW1zW25hbWVdKSB7XG4gICAgICAgICAgICB2YXJpYWJsZXMucHVzaChuYW1lKTtcbiAgICAgICAgICAgIHJldHVybiBzbGFzaCArIGVuY29kZVVyaVNlZ21lbnQob3B0aW9ucy5wYXJhbXNbbmFtZV0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuICcnO1xuICAgIH0pO1xuXG4gICAgdmFyaWFibGVzLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgICAgICBkZWxldGUgb3B0aW9ucy5wYXJhbXNba2V5XTtcbiAgICB9KTtcblxuICAgIHJldHVybiB1cmw7XG59O1xuXG5mdW5jdGlvbiBlbmNvZGVVcmlTZWdtZW50KHZhbHVlKSB7XG5cbiAgICByZXR1cm4gZW5jb2RlVXJpUXVlcnkodmFsdWUsIHRydWUpLlxuICAgICAgICByZXBsYWNlKC8lMjYvZ2ksICcmJykuXG4gICAgICAgIHJlcGxhY2UoLyUzRC9naSwgJz0nKS5cbiAgICAgICAgcmVwbGFjZSgvJTJCL2dpLCAnKycpO1xufVxuXG5mdW5jdGlvbiBlbmNvZGVVcmlRdWVyeSh2YWx1ZSwgc3BhY2VzKSB7XG5cbiAgICByZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KHZhbHVlKS5cbiAgICAgICAgcmVwbGFjZSgvJTQwL2dpLCAnQCcpLlxuICAgICAgICByZXBsYWNlKC8lM0EvZ2ksICc6JykuXG4gICAgICAgIHJlcGxhY2UoLyUyNC9nLCAnJCcpLlxuICAgICAgICByZXBsYWNlKC8lMkMvZ2ksICcsJykuXG4gICAgICAgIHJlcGxhY2UoLyUyMC9nLCAoc3BhY2VzID8gJyUyMCcgOiAnKycpKTtcbn1cbiIsIi8qKlxuICogUXVlcnkgUGFyYW1ldGVyIFRyYW5zZm9ybS5cbiAqL1xuXG52YXIgXyA9IHJlcXVpcmUoJy4uL3V0aWwnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAob3B0aW9ucywgbmV4dCkge1xuXG4gICAgdmFyIHVybFBhcmFtcyA9IE9iamVjdC5rZXlzKF8udXJsLm9wdGlvbnMucGFyYW1zKSwgcXVlcnkgPSB7fSwgdXJsID0gbmV4dChvcHRpb25zKTtcblxuICAgXy5lYWNoKG9wdGlvbnMucGFyYW1zLCBmdW5jdGlvbiAodmFsdWUsIGtleSkge1xuICAgICAgICBpZiAodXJsUGFyYW1zLmluZGV4T2Yoa2V5KSA9PT0gLTEpIHtcbiAgICAgICAgICAgIHF1ZXJ5W2tleV0gPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgcXVlcnkgPSBfLnVybC5wYXJhbXMocXVlcnkpO1xuXG4gICAgaWYgKHF1ZXJ5KSB7XG4gICAgICAgIHVybCArPSAodXJsLmluZGV4T2YoJz8nKSA9PSAtMSA/ICc/JyA6ICcmJykgKyBxdWVyeTtcbiAgICB9XG5cbiAgICByZXR1cm4gdXJsO1xufTtcbiIsIi8qKlxuICogUm9vdCBQcmVmaXggVHJhbnNmb3JtLlxuICovXG5cbnZhciBfID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChvcHRpb25zLCBuZXh0KSB7XG5cbiAgICB2YXIgdXJsID0gbmV4dChvcHRpb25zKTtcblxuICAgIGlmIChfLmlzU3RyaW5nKG9wdGlvbnMucm9vdCkgJiYgIXVybC5tYXRjaCgvXihodHRwcz86KT9cXC8vKSkge1xuICAgICAgICB1cmwgPSBvcHRpb25zLnJvb3QgKyAnLycgKyB1cmw7XG4gICAgfVxuXG4gICAgcmV0dXJuIHVybDtcbn07XG4iLCIvKipcbiAqIFVSTCBUZW1wbGF0ZSAoUkZDIDY1NzApIFRyYW5zZm9ybS5cbiAqL1xuXG52YXIgVXJsVGVtcGxhdGUgPSByZXF1aXJlKCcuLi9saWIvdXJsLXRlbXBsYXRlJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcblxuICAgIHZhciB2YXJpYWJsZXMgPSBbXSwgdXJsID0gVXJsVGVtcGxhdGUuZXhwYW5kKG9wdGlvbnMudXJsLCBvcHRpb25zLnBhcmFtcywgdmFyaWFibGVzKTtcblxuICAgIHZhcmlhYmxlcy5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgZGVsZXRlIG9wdGlvbnMucGFyYW1zW2tleV07XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdXJsO1xufTtcbiIsIi8qKlxuICogVXRpbGl0eSBmdW5jdGlvbnMuXG4gKi9cblxudmFyIF8gPSBleHBvcnRzLCBhcnJheSA9IFtdLCBjb25zb2xlID0gd2luZG93LmNvbnNvbGU7XG5cbl8ud2FybiA9IGZ1bmN0aW9uIChtc2cpIHtcbiAgICBpZiAoY29uc29sZSAmJiBfLndhcm5pbmcgJiYgKCFfLmNvbmZpZy5zaWxlbnQgfHwgXy5jb25maWcuZGVidWcpKSB7XG4gICAgICAgIGNvbnNvbGUud2FybignW1Z1ZVJlc291cmNlIHdhcm5dOiAnICsgbXNnKTtcbiAgICB9XG59O1xuXG5fLmVycm9yID0gZnVuY3Rpb24gKG1zZykge1xuICAgIGlmIChjb25zb2xlKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IobXNnKTtcbiAgICB9XG59O1xuXG5fLnRyaW0gPSBmdW5jdGlvbiAoc3RyKSB7XG4gICAgcmV0dXJuIHN0ci5yZXBsYWNlKC9eXFxzKnxcXHMqJC9nLCAnJyk7XG59O1xuXG5fLnRvTG93ZXIgPSBmdW5jdGlvbiAoc3RyKSB7XG4gICAgcmV0dXJuIHN0ciA/IHN0ci50b0xvd2VyQ2FzZSgpIDogJyc7XG59O1xuXG5fLmlzQXJyYXkgPSBBcnJheS5pc0FycmF5O1xuXG5fLmlzU3RyaW5nID0gZnVuY3Rpb24gKHZhbCkge1xuICAgIHJldHVybiB0eXBlb2YgdmFsID09PSAnc3RyaW5nJztcbn07XG5cbl8uaXNGdW5jdGlvbiA9IGZ1bmN0aW9uICh2YWwpIHtcbiAgICByZXR1cm4gdHlwZW9mIHZhbCA9PT0gJ2Z1bmN0aW9uJztcbn07XG5cbl8uaXNPYmplY3QgPSBmdW5jdGlvbiAob2JqKSB7XG4gICAgcmV0dXJuIG9iaiAhPT0gbnVsbCAmJiB0eXBlb2Ygb2JqID09PSAnb2JqZWN0Jztcbn07XG5cbl8uaXNQbGFpbk9iamVjdCA9IGZ1bmN0aW9uIChvYmopIHtcbiAgICByZXR1cm4gXy5pc09iamVjdChvYmopICYmIE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmopID09IE9iamVjdC5wcm90b3R5cGU7XG59O1xuXG5fLm9wdGlvbnMgPSBmdW5jdGlvbiAoZm4sIG9iaiwgb3B0aW9ucykge1xuXG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgICBpZiAoXy5pc0Z1bmN0aW9uKG9wdGlvbnMpKSB7XG4gICAgICAgIG9wdGlvbnMgPSBvcHRpb25zLmNhbGwob2JqKTtcbiAgICB9XG5cbiAgICByZXR1cm4gXy5tZXJnZShmbi5iaW5kKHskdm06IG9iaiwgJG9wdGlvbnM6IG9wdGlvbnN9KSwgZm4sIHskb3B0aW9uczogb3B0aW9uc30pO1xufTtcblxuXy5lYWNoID0gZnVuY3Rpb24gKG9iaiwgaXRlcmF0b3IpIHtcblxuICAgIHZhciBpLCBrZXk7XG5cbiAgICBpZiAodHlwZW9mIG9iai5sZW5ndGggPT0gJ251bWJlcicpIHtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IG9iai5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaXRlcmF0b3IuY2FsbChvYmpbaV0sIG9ialtpXSwgaSk7XG4gICAgICAgIH1cbiAgICB9IGVsc2UgaWYgKF8uaXNPYmplY3Qob2JqKSkge1xuICAgICAgICBmb3IgKGtleSBpbiBvYmopIHtcbiAgICAgICAgICAgIGlmIChvYmouaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgICAgICAgIGl0ZXJhdG9yLmNhbGwob2JqW2tleV0sIG9ialtrZXldLCBrZXkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG9iajtcbn07XG5cbl8uZGVmYXVsdHMgPSBmdW5jdGlvbiAodGFyZ2V0LCBzb3VyY2UpIHtcblxuICAgIGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHtcbiAgICAgICAgaWYgKHRhcmdldFtrZXldID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRhcmdldFtrZXldID0gc291cmNlW2tleV07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdGFyZ2V0O1xufTtcblxuXy5leHRlbmQgPSBmdW5jdGlvbiAodGFyZ2V0KSB7XG5cbiAgICB2YXIgYXJncyA9IGFycmF5LnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcblxuICAgIGFyZ3MuZm9yRWFjaChmdW5jdGlvbiAoYXJnKSB7XG4gICAgICAgIG1lcmdlKHRhcmdldCwgYXJnKTtcbiAgICB9KTtcblxuICAgIHJldHVybiB0YXJnZXQ7XG59O1xuXG5fLm1lcmdlID0gZnVuY3Rpb24gKHRhcmdldCkge1xuXG4gICAgdmFyIGFyZ3MgPSBhcnJheS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG5cbiAgICBhcmdzLmZvckVhY2goZnVuY3Rpb24gKGFyZykge1xuICAgICAgICBtZXJnZSh0YXJnZXQsIGFyZywgdHJ1ZSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGFyZ2V0O1xufTtcblxuZnVuY3Rpb24gbWVyZ2UodGFyZ2V0LCBzb3VyY2UsIGRlZXApIHtcbiAgICBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7XG4gICAgICAgIGlmIChkZWVwICYmIChfLmlzUGxhaW5PYmplY3Qoc291cmNlW2tleV0pIHx8IF8uaXNBcnJheShzb3VyY2Vba2V5XSkpKSB7XG4gICAgICAgICAgICBpZiAoXy5pc1BsYWluT2JqZWN0KHNvdXJjZVtrZXldKSAmJiAhXy5pc1BsYWluT2JqZWN0KHRhcmdldFtrZXldKSkge1xuICAgICAgICAgICAgICAgIHRhcmdldFtrZXldID0ge307XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoXy5pc0FycmF5KHNvdXJjZVtrZXldKSAmJiAhXy5pc0FycmF5KHRhcmdldFtrZXldKSkge1xuICAgICAgICAgICAgICAgIHRhcmdldFtrZXldID0gW107XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBtZXJnZSh0YXJnZXRba2V5XSwgc291cmNlW2tleV0sIGRlZXApO1xuICAgICAgICB9IGVsc2UgaWYgKHNvdXJjZVtrZXldICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRhcmdldFtrZXldID0gc291cmNlW2tleV07XG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=
