/* globals MaterialLayoutTab, MaterialLayout, MaterialTabs, MaterialTab, MaterialRipple, MaterialDataTable, MaterialButton, MaterialCheckbox, MaterialRadio, MaterialTextfield, componentHandler */

function renderTabs(panels, layout) {
  window.setTimeout(() => {
    var tabs = document.querySelectorAll('.mdl-layout__tab');
    [].forEach.call(tabs, el => {
      new MaterialLayoutTab(el, tabs, panels, layout.MaterialLayout);
      new MaterialRipple(el);
    });
    setTimeout(() => {
      tabs[0].click();
    }, 100)
  }, 100);
}

function renderPointTable(table) {
  var th_first = table.querySelector('th');
  th_first.parentNode.removeChild(th_first);
  setTimeout(() => {
    new MaterialDataTable(table);
    componentHandler.upgradeAllRegistered();
    var ths = table.querySelectorAll('th:nth-child(2)');
    var tds = table.querySelectorAll('td:nth-child(2)');
    [...ths].forEach(th => {
      if (th.childElementCount !== 0) th.innerHTML = '序号';
    });
    [...tds].forEach(td => {
      if (td.childElementCount !== 0) td.parentNode.removeChild(td);
    });
  });
}

function renderTable(table) {
  var th_first = table.querySelector('th');
  th_first.parentNode.removeChild(th_first);
  setTimeout(() => {
    new MaterialDataTable(table);
    componentHandler.upgradeAllRegistered();
  });
}

function renderRipple(el) {
  setTimeout(() => {
    componentHandler.upgradeAllRegistered();
  }, 100);
}

function renderButton(el) {
  setTimeout(() => {
    componentHandler.upgradeAllRegistered();
  }, 100);
}

function renderCheckbox(el) {
  window.setTimeout(() => {
    var btns = document.querySelector(el).querySelectorAll('.mdl-js-checkbox');
    [].forEach.call(btns, el => {
      new MaterialCheckbox(el);
    });
  }, 100);
}

function renderRadio(el) {
  window.setTimeout(() => {
    var radios = document.querySelector(el).querySelectorAll('.mdl-js-radio');
    [...radios].forEach(el => {
      new MaterialRadio(el);
    });
  }, 100);
}

function renderTextfield(el) {
  window.setTimeout(() => {
    var fields = document.querySelector(el).querySelectorAll('.mdl-js-textfield');
    [].forEach.call(fields, el => {
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
  setTimeout(() => {
    componentHandler.upgradeAllRegistered();
  }, 100);
}

function bindClose() {
  var btnClose = document.querySelectorAll('.closebtn');
  [...btnClose].forEach(el => {
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
