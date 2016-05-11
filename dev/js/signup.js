/* global Vue */
var bindClose = require('./util').bindClose;
var app = new Vue({
  el: '#app',
  data: {
    email: '',
    pass: '',
    ckps: ''
  },
  computed: {},
  methods: {
    submit(evt) {
      if (!this.email) {
        document.querySelector('input[type="email"]').focus();
        return evt.preventDefault();
      } else if (!this.pass || this.pass.length < 6) {
        document.querySelectorAll('input[type="password"]')[0].focus();
        return evt.preventDefault();
      } else if (!this.ckps || this.ckps.length < 6) {
        document.querySelectorAll('input[type="password"]')[1].focus();
        return evt.preventDefault();
      }
    }
  }
});
bindClose();
