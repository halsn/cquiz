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
    setCourseTabs: function (evt) {
      this.tabs = courseTabs;
      renderTabs(panels, layout);
    },
    setClassTabs: function (evt) {
      this.tabs = classTabs;
      renderTabs(panels, layout);
    },
    setInfoTabs: function (evt) {
      this.tabs = myInfo;
      renderTabs(panels, layout);
    }
  },
  ready() {
    window.setTimeout(() => {
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
      [].forEach.call(selects, el => el.value = null);
    }, 1000);
  }
});

var hour = (new Date).getHours();
var header = document.querySelector('.home-drawer-header');
var greeting = document.querySelector('.greeting');
if (hour >= 6 && hour < 12) {
  greeting.innerText = '早上好';
  greeting.textContent = '早上好';
  header.style.backgroundImage = "url('/images/morning.jpg')";
} else if (hour >= 12 && hour < 19) {
  greeting.innerText = '下午好';
  greeting.textContent = '下午好';
  header.style.backgroundImage = "url('/images/dusk.jpg')";
} else {
  greeting.innerText = '晚上好';
  greeting.textContent = '晚上好';
  header.style.backgroundImage = "url('/images/night.jpg')";
}
