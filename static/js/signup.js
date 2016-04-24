(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

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
    submit: function submit(evt) {
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

},{"./util":2}],2:[function(require,module,exports){
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
module.exports.renderButton = renderButton;
module.exports.renderRipple = renderRipple;
module.exports.renderRadio = renderRadio;
module.exports.renderCheckbox = renderCheckbox;
module.exports.renderTextfield = renderTextfield;
module.exports.render = render;
module.exports.bindClose = bindClose;

},{}]},{},[1]);
