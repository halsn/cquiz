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
    save(evt) {
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
      this.$http.put('/api/t', data)
        .then(res => {
          tip('修改成功', 'success');
          this.originPass = '';
          this.newPass = '';
          this.cknPass = '';
        }, err => tip(err.data, 'error'));
    }
  }
});

module.exports = info;
