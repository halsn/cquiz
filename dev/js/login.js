/* global Vue */
var bindClose = require('./util').bindClose;
var app = new Vue({
  el: '#app',
  data: {
    email: '',
    pass: ''
  },
  computed: {},
  methods: {
    submit(evt) {
      if (!this.email) {
        document.querySelector('input[type="email"]').focus();
        return evt.preventDefault();
      } else if (!this.pass) {
        document.querySelector('input[type="password"]').focus();
        return evt.preventDefault();
      }
    }
  }
});
bindClose();
