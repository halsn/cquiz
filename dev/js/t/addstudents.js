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
    read(evt) {
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
        addStudents.jsonData = XLSX.utils.sheet_to_json(first_sheet).filter(el => {
          if (!el.姓名 || !el.学号 || !el.专业 || !el.班级) return false;
          return true;
        });
      }
      if (!file) return null;
      else reader.readAsBinaryString(file);
    },
    save(evt) {
      if (!this.Class._id || !this.jsonData.length) return evt.preventDefault();
      this.Class.ref_students = this.jsonData.map(el => {
        return {
          name: el.姓名,
          no: el.学号,
          spercialty: el.专业,
          className: el.班级
        }
      });
      this.$http.put('/api/t/class', this.Class)
        .then(res => {
          tip('录入成功', 'success');
          this.jsonData = [];
          this.Class = {};
          var tabs = document.querySelectorAll('.mdl-layout__tab');
          tabs[3].click();
        }, err => tip(err.data, 'error'));
    }
  }
});

module.exports = addStudents;
