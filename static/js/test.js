(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

/* globals componentHandler Vue */
//var Vue = require('./vendor/vue.min.js');
module.exports = (function () {
  var tip = require('./util').tip;
  Vue.use(require('vue-resource'));

  function range(s, e) {
    return Array(e - s + 1).fill().map(function (e, i) {
      return s + i;
    });
  }

  function render() {
    setTimeout(function () {
      componentHandler.upgradeAllRegistered();
    }, 100);
  }
  new Vue({
    el: '#testApp',
    data: {
      no: '',
      charMap: range(0, 25).map(function (e) {
        return String.fromCharCode(e + 65);
      }),
      pass: false,
      miss: false,
      lock: false,
      quizs: [],
      show: [],
      answered: [],
      showAns: false,
      disanswered: [],
      icons: [],
      min: 0,
      sec: 0
    },
    computed: {
      finished: function finished() {
        return this.answered.every(function (e) {
          if (typeof e === 'string') return e.trim() !== '';else if ((typeof e === 'undefined' ? 'undefined' : _typeof(e)) === 'object') return e.length;else return e !== undefined;
        });
      },
      disans: function disans() {
        var _this = this;

        if (!this.finished) return [];else {
          return this.answered.map(function (a, idx) {
            if (_this.quizs[idx].genre === '判断题') {
              return ['错误', '正确'][a];
            } else if (_this.quizs[idx].genre === '单选题') {
              return _this.charMap[a];
            } else if (_this.quizs[idx].genre === '多选题') {
              return a.map(function (e) {
                return _this.charMap[e];
              });
            } else return a;
          }).map(function (e, x) {
            return x + 1 + '.' + e.toString() + '  ';
          });
        }
      },
      sendans: function sendans() {
        var _this2 = this;

        if (!this.finished) return [];else {
          return this.answered.map(function (a, idx) {
            if (_this2.quizs[idx].genre === '判断题') {
              return [['错误', '正确'][a]];
            } else if (_this2.quizs[idx].genre === '单选题') {
              return [_this2.quizs[idx].selections[a]];
            } else if (_this2.quizs[idx].genre === '多选题') {
              return a.map(function (e) {
                return _this2.quizs[idx].selections[e];
              });
            } else return [a.trim()];
          });
        }
      }
    },
    methods: {
      paste: function paste(evt) {
        return evt.preventDefault();
      },
      pre: function pre(evt, qidx) {
        if (qidx === 0) return evt.preventDefault();
        this.show = this.show.map(function (e) {
          return false;
        });
        this.show[qidx - 1] = true;
      },
      next: function next(evt, qidx) {
        if (qidx === this.quizs.length - 1) return evt.preventDefault();
        this.show = this.show.map(function (e) {
          return false;
        });
        this.show[qidx + 1] = true;
      },
      tick: function tick() {
        var _this3 = this;

        var ticker = setInterval(function () {
          if (_this3.min === 0 && _this3.sec === 0) clearInterval(ticker);else if (_this3.sec === 0) {
            _this3.min -= 1;
            _this3.sec = 59;
          } else _this3.sec -= 1;
        }, 1000);
      },
      start: function start(evt) {
        var _this4 = this;

        if (!/^\d{1,20}$/.test(this.no)) return evt.preventDefault();
        var uuid = window.location.pathname.split('/')[4];
        this.$http.get('/api/t/test/' + uuid, {
          no: this.no
        }).then(function (res) {
          var data = res.data;
          if (data.miss) {
            _this4.miss = true;
            setTimeout(function () {
              _this4.miss = false;
            }, 3000);
          } else if (!data.showAns) {
            _this4.pass = true;
            _this4.quizs = res.data.quizs;
            _this4.show = _this4.quizs.map(function (e) {
              return false;
            });
            _this4.show[0] = true;
            _this4.answered = Array(_this4.quizs.length).fill(undefined);
            _this4.answered = _this4.answered.map(function (e, idx) {
              if (_this4.quizs[idx].genre === '多选题') return [];else return undefined;
            });
            var expireDate = new Date(res.data.expire);
            var nowDate = new Date(res.data.now);
            var left = expireDate.getTime() - nowDate.getTime();
            left = left < 0 ? 0 : left;
            if (left === 0) _this4.lock = true;
            var leftDate = new Date(left);
            _this4.min = leftDate.getMinutes();
            _this4.sec = leftDate.getSeconds();
            _this4.tick();
            render();
          } else {
            _this4.pass = true;
            _this4.quizs = res.data.quizs;
            _this4.show = _this4.quizs.map(function (e) {
              return false;
            });
            _this4.show[0] = true;
            _this4.lock = true;
            _this4.showAns = true;
            _this4.disanswered = _this4.quizs.map(function (q) {
              if (q.genre === '单选题' || q.genre === '多选题') {
                return q.answered.map(function (e) {
                  return _this4.charMap[q.selections.indexOf(e)];
                }).sort();
              } else return q.answered;
            });
            _this4.icons = _this4.quizs.map(function (q) {
              return q.isRight;
            });
            render();
          }
        }, function (err) {
          if (err.data === '页面已过期') _this4.lock = true;else tip('网络故障', 'error');
        });
      },
      send: function send(evt) {
        var _this5 = this;

        if (!this.finished) return evt.preventDefault();
        var uuid = window.location.pathname.split('/')[4];
        this.$http.put('/api/t/test/' + uuid, {
          no: this.no,
          answered: this.sendans
        }).then(function (res) {
          if (res.data.timeout) _this5.lock = true;else {
            _this5.start();
          }
        }, function (err) {
          return tip('网络故障', 'error');
        });
      }
    }
  });
})();

},{"./util":2,"vue-resource":16}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
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

},{"../util":26}],4:[function(require,module,exports){
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

},{"../../promise":19,"../../util":26,"./xhr":7}],5:[function(require,module,exports){
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

},{"../../promise":19,"../../util":26}],6:[function(require,module,exports){
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

},{"../../promise":19,"../../util":26}],7:[function(require,module,exports){
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

},{"../../promise":19,"../../util":26}],8:[function(require,module,exports){
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

},{"../util":26,"./client/xdr":6}],9:[function(require,module,exports){
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

},{"../util":26}],10:[function(require,module,exports){
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

},{"../promise":19,"../util":26,"./before":3,"./client":4,"./cors":8,"./header":9,"./interceptor":11,"./jsonp":12,"./method":13,"./mime":14,"./timeout":15}],11:[function(require,module,exports){
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

},{"../promise":19,"../util":26}],12:[function(require,module,exports){
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

},{"./client/jsonp":5}],13:[function(require,module,exports){
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

},{}],14:[function(require,module,exports){
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

},{"../util":26}],15:[function(require,module,exports){
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

},{}],16:[function(require,module,exports){
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

},{"./http":10,"./promise":19,"./resource":20,"./url":21,"./util":26}],17:[function(require,module,exports){
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

},{"../util":26}],18:[function(require,module,exports){
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

},{}],19:[function(require,module,exports){
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

},{"./lib/promise":17,"./util":26}],20:[function(require,module,exports){
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

},{"./util":26}],21:[function(require,module,exports){
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

},{"../util":26,"./legacy":22,"./query":23,"./root":24,"./template":25}],22:[function(require,module,exports){
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

},{"../util":26}],23:[function(require,module,exports){
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

},{"../util":26}],24:[function(require,module,exports){
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

},{"../util":26}],25:[function(require,module,exports){
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

},{"../lib/url-template":18}],26:[function(require,module,exports){
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

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImRldi9qcy90ZXN0LmpzIiwiZGV2L2pzL3V0aWwuanMiLCIuLi8uLi8uLi8uLi91c3IvbG9jYWwvbGliL25vZGVfbW9kdWxlcy92dWUtcmVzb3VyY2Uvc3JjL2h0dHAvYmVmb3JlLmpzIiwiLi4vLi4vLi4vLi4vdXNyL2xvY2FsL2xpYi9ub2RlX21vZHVsZXMvdnVlLXJlc291cmNlL3NyYy9odHRwL2NsaWVudC9pbmRleC5qcyIsIi4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3Z1ZS1yZXNvdXJjZS9zcmMvaHR0cC9jbGllbnQvanNvbnAuanMiLCIuLi8uLi8uLi8uLi91c3IvbG9jYWwvbGliL25vZGVfbW9kdWxlcy92dWUtcmVzb3VyY2Uvc3JjL2h0dHAvY2xpZW50L3hkci5qcyIsIi4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3Z1ZS1yZXNvdXJjZS9zcmMvaHR0cC9jbGllbnQveGhyLmpzIiwiLi4vLi4vLi4vLi4vdXNyL2xvY2FsL2xpYi9ub2RlX21vZHVsZXMvdnVlLXJlc291cmNlL3NyYy9odHRwL2NvcnMuanMiLCIuLi8uLi8uLi8uLi91c3IvbG9jYWwvbGliL25vZGVfbW9kdWxlcy92dWUtcmVzb3VyY2Uvc3JjL2h0dHAvaGVhZGVyLmpzIiwiLi4vLi4vLi4vLi4vdXNyL2xvY2FsL2xpYi9ub2RlX21vZHVsZXMvdnVlLXJlc291cmNlL3NyYy9odHRwL2luZGV4LmpzIiwiLi4vLi4vLi4vLi4vdXNyL2xvY2FsL2xpYi9ub2RlX21vZHVsZXMvdnVlLXJlc291cmNlL3NyYy9odHRwL2ludGVyY2VwdG9yLmpzIiwiLi4vLi4vLi4vLi4vdXNyL2xvY2FsL2xpYi9ub2RlX21vZHVsZXMvdnVlLXJlc291cmNlL3NyYy9odHRwL2pzb25wLmpzIiwiLi4vLi4vLi4vLi4vdXNyL2xvY2FsL2xpYi9ub2RlX21vZHVsZXMvdnVlLXJlc291cmNlL3NyYy9odHRwL21ldGhvZC5qcyIsIi4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3Z1ZS1yZXNvdXJjZS9zcmMvaHR0cC9taW1lLmpzIiwiLi4vLi4vLi4vLi4vdXNyL2xvY2FsL2xpYi9ub2RlX21vZHVsZXMvdnVlLXJlc291cmNlL3NyYy9odHRwL3RpbWVvdXQuanMiLCIuLi8uLi8uLi8uLi91c3IvbG9jYWwvbGliL25vZGVfbW9kdWxlcy92dWUtcmVzb3VyY2Uvc3JjL2luZGV4LmpzIiwiLi4vLi4vLi4vLi4vdXNyL2xvY2FsL2xpYi9ub2RlX21vZHVsZXMvdnVlLXJlc291cmNlL3NyYy9saWIvcHJvbWlzZS5qcyIsIi4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3Z1ZS1yZXNvdXJjZS9zcmMvbGliL3VybC10ZW1wbGF0ZS5qcyIsIi4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3Z1ZS1yZXNvdXJjZS9zcmMvcHJvbWlzZS5qcyIsIi4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3Z1ZS1yZXNvdXJjZS9zcmMvcmVzb3VyY2UuanMiLCIuLi8uLi8uLi8uLi91c3IvbG9jYWwvbGliL25vZGVfbW9kdWxlcy92dWUtcmVzb3VyY2Uvc3JjL3VybC9pbmRleC5qcyIsIi4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3Z1ZS1yZXNvdXJjZS9zcmMvdXJsL2xlZ2FjeS5qcyIsIi4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3Z1ZS1yZXNvdXJjZS9zcmMvdXJsL3F1ZXJ5LmpzIiwiLi4vLi4vLi4vLi4vdXNyL2xvY2FsL2xpYi9ub2RlX21vZHVsZXMvdnVlLXJlc291cmNlL3NyYy91cmwvcm9vdC5qcyIsIi4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3Z1ZS1yZXNvdXJjZS9zcmMvdXJsL3RlbXBsYXRlLmpzIiwiLi4vLi4vLi4vLi4vdXNyL2xvY2FsL2xpYi9ub2RlX21vZHVsZXMvdnVlLXJlc291cmNlL3NyYy91dGlsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7O0FDRUEsTUFBTSxDQUFDLE9BQU8sR0FBRyxDQUFDLFlBQVk7QUFDNUIsTUFBSSxHQUFHLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQztBQUNoQyxLQUFHLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDOztBQUVqQyxXQUFTLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFO0FBQ25CLFdBQU8sS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBRyxDQUFDLFVBQUMsQ0FBQyxFQUFFLENBQUM7YUFBSyxDQUFDLEdBQUcsQ0FBQztLQUFBLENBQUMsQ0FBQztHQUNyRDs7QUFFRCxXQUFTLE1BQU0sR0FBRztBQUNoQixjQUFVLENBQUMsWUFBTTtBQUNmLHNCQUFnQixDQUFDLG9CQUFvQixFQUFFLENBQUM7S0FDekMsRUFBRSxHQUFHLENBQUMsQ0FBQTtHQUNSO0FBQ0QsTUFBSSxHQUFHLENBQUM7QUFDTixNQUFFLEVBQUUsVUFBVTtBQUNkLFFBQUksRUFBRTtBQUNKLFFBQUUsRUFBRSxFQUFFO0FBQ04sYUFBTyxFQUFFLEtBQUssQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQUEsQ0FBQztlQUFJLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztPQUFBLENBQUM7QUFDM0QsVUFBSSxFQUFFLEtBQUs7QUFDWCxVQUFJLEVBQUUsS0FBSztBQUNYLFVBQUksRUFBRSxLQUFLO0FBQ1gsV0FBSyxFQUFFLEVBQUU7QUFDVCxVQUFJLEVBQUUsRUFBRTtBQUNSLGNBQVEsRUFBRSxFQUFFO0FBQ1osYUFB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QUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyogZ2xvYmFscyBjb21wb25lbnRIYW5kbGVyIFZ1ZSAqL1xuLy92YXIgVnVlID0gcmVxdWlyZSgnLi92ZW5kb3IvdnVlLm1pbi5qcycpO1xubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24gKCkge1xuICB2YXIgdGlwID0gcmVxdWlyZSgnLi91dGlsJykudGlwO1xuICBWdWUudXNlKHJlcXVpcmUoJ3Z1ZS1yZXNvdXJjZScpKTtcblxuICBmdW5jdGlvbiByYW5nZShzLCBlKSB7XG4gICAgcmV0dXJuIEFycmF5KGUgLSBzICsgMSkuZmlsbCgpLm1hcCgoZSwgaSkgPT4gcyArIGkpO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgY29tcG9uZW50SGFuZGxlci51cGdyYWRlQWxsUmVnaXN0ZXJlZCgpO1xuICAgIH0sIDEwMClcbiAgfVxuICBuZXcgVnVlKHtcbiAgICBlbDogJyN0ZXN0QXBwJyxcbiAgICBkYXRhOiB7XG4gICAgICBubzogJycsXG4gICAgICBjaGFyTWFwOiByYW5nZSgwLCAyNSkubWFwKGUgPT4gU3RyaW5nLmZyb21DaGFyQ29kZShlICsgNjUpKSxcbiAgICAgIHBhc3M6IGZhbHNlLFxuICAgICAgbWlzczogZmFsc2UsXG4gICAgICBsb2NrOiBmYWxzZSxcbiAgICAgIHF1aXpzOiBbXSxcbiAgICAgIHNob3c6IFtdLFxuICAgICAgYW5zd2VyZWQ6IFtdLFxuICAgICAgc2hvd0FuczogZmFsc2UsXG4gICAgICBkaXNhbnN3ZXJlZDogW10sXG4gICAgICBpY29uczogW10sXG4gICAgICBtaW46IDAsXG4gICAgICBzZWM6IDBcbiAgICB9LFxuICAgIGNvbXB1dGVkOiB7XG4gICAgICBmaW5pc2hlZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYW5zd2VyZWQuZXZlcnkoZSA9PiB7XG4gICAgICAgICAgaWYgKHR5cGVvZiBlID09PSAnc3RyaW5nJykgcmV0dXJuIGUudHJpbSgpICE9PSAnJztcbiAgICAgICAgICBlbHNlIGlmICh0eXBlb2YgZSA9PT0gJ29iamVjdCcpIHJldHVybiBlLmxlbmd0aDtcbiAgICAgICAgICBlbHNlIHJldHVybiBlICE9PSB1bmRlZmluZWQ7XG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICAgIGRpc2FucygpIHtcbiAgICAgICAgaWYgKCF0aGlzLmZpbmlzaGVkKSByZXR1cm4gW107XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIHJldHVybiB0aGlzLmFuc3dlcmVkLm1hcCgoYSwgaWR4KSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpcy5xdWl6c1tpZHhdLmdlbnJlID09PSAn5Yik5pat6aKYJykge1xuICAgICAgICAgICAgICByZXR1cm4gWyfplJnor68nLCAn5q2j56GuJ11bYV07XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMucXVpenNbaWR4XS5nZW5yZSA9PT0gJ+WNlemAiemimCcpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2hhck1hcFthXTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5xdWl6c1tpZHhdLmdlbnJlID09PSAn5aSa6YCJ6aKYJykge1xuICAgICAgICAgICAgICByZXR1cm4gYS5tYXAoZSA9PiB0aGlzLmNoYXJNYXBbZV0pO1xuICAgICAgICAgICAgfSBlbHNlIHJldHVybiBhO1xuICAgICAgICAgIH0pLm1hcCgoZSwgeCkgPT4gYCR7eCsxfS4ke2UudG9TdHJpbmcoKX0gIGApO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgc2VuZGFucygpIHtcbiAgICAgICAgaWYgKCF0aGlzLmZpbmlzaGVkKSByZXR1cm4gW107XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIHJldHVybiB0aGlzLmFuc3dlcmVkLm1hcCgoYSwgaWR4KSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpcy5xdWl6c1tpZHhdLmdlbnJlID09PSAn5Yik5pat6aKYJykge1xuICAgICAgICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgICAgIFsn6ZSZ6K+vJywgJ+ato+ehriddW2FdXG4gICAgICAgICAgICAgIF07XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMucXVpenNbaWR4XS5nZW5yZSA9PT0gJ+WNlemAiemimCcpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIFt0aGlzLnF1aXpzW2lkeF0uc2VsZWN0aW9uc1thXV07XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMucXVpenNbaWR4XS5nZW5yZSA9PT0gJ+WkmumAiemimCcpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGEubWFwKGUgPT4gdGhpcy5xdWl6c1tpZHhdLnNlbGVjdGlvbnNbZV0pO1xuICAgICAgICAgICAgfSBlbHNlIHJldHVybiBbYS50cmltKCldO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICBtZXRob2RzOiB7XG4gICAgICBwYXN0ZShldnQpIHtcbiAgICAgICAgcmV0dXJuIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgfSxcbiAgICAgIHByZShldnQsIHFpZHgpIHtcbiAgICAgICAgaWYgKHFpZHggPT09IDApIHJldHVybiBldnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgdGhpcy5zaG93ID0gdGhpcy5zaG93Lm1hcChlID0+IGZhbHNlKTtcbiAgICAgICAgdGhpcy5zaG93W3FpZHggLSAxXSA9IHRydWU7XG4gICAgICB9LFxuICAgICAgbmV4dChldnQsIHFpZHgpIHtcbiAgICAgICAgaWYgKHFpZHggPT09IHRoaXMucXVpenMubGVuZ3RoIC0gMSkgcmV0dXJuIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB0aGlzLnNob3cgPSB0aGlzLnNob3cubWFwKGUgPT4gZmFsc2UpO1xuICAgICAgICB0aGlzLnNob3dbcWlkeCArIDFdID0gdHJ1ZTtcbiAgICAgIH0sXG4gICAgICB0aWNrKCkge1xuICAgICAgICB2YXIgdGlja2VyID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICAgIGlmICh0aGlzLm1pbiA9PT0gMCAmJiB0aGlzLnNlYyA9PT0gMCkgY2xlYXJJbnRlcnZhbCh0aWNrZXIpO1xuICAgICAgICAgIGVsc2UgaWYgKHRoaXMuc2VjID09PSAwKSB7XG4gICAgICAgICAgICB0aGlzLm1pbiAtPSAxO1xuICAgICAgICAgICAgdGhpcy5zZWMgPSA1OTtcbiAgICAgICAgICB9IGVsc2UgdGhpcy5zZWMgLT0gMTtcbiAgICAgICAgfSwgMTAwMCk7XG4gICAgICB9LFxuICAgICAgc3RhcnQoZXZ0KSB7XG4gICAgICAgIGlmICghL15cXGR7MSwyMH0kLy50ZXN0KHRoaXMubm8pKSByZXR1cm4gZXZ0LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHZhciB1dWlkID0gd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLnNwbGl0KCcvJylbNF07XG4gICAgICAgIHRoaXMuJGh0dHAuZ2V0KCcvYXBpL3QvdGVzdC8nICsgdXVpZCwge1xuICAgICAgICAgICAgbm86IHRoaXMubm9cbiAgICAgICAgICB9KVxuICAgICAgICAgIC50aGVuKHJlcyA9PiB7XG4gICAgICAgICAgICB2YXIgZGF0YSA9IHJlcy5kYXRhO1xuICAgICAgICAgICAgaWYgKGRhdGEubWlzcykge1xuICAgICAgICAgICAgICB0aGlzLm1pc3MgPSB0cnVlO1xuICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLm1pc3MgPSBmYWxzZTtcbiAgICAgICAgICAgICAgfSwgMzAwMCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCFkYXRhLnNob3dBbnMpIHtcbiAgICAgICAgICAgICAgdGhpcy5wYXNzID0gdHJ1ZTtcbiAgICAgICAgICAgICAgdGhpcy5xdWl6cyA9IHJlcy5kYXRhLnF1aXpzO1xuICAgICAgICAgICAgICB0aGlzLnNob3cgPSB0aGlzLnF1aXpzLm1hcChlID0+IGZhbHNlKTtcbiAgICAgICAgICAgICAgdGhpcy5zaG93WzBdID0gdHJ1ZTtcbiAgICAgICAgICAgICAgdGhpcy5hbnN3ZXJlZCA9IEFycmF5KHRoaXMucXVpenMubGVuZ3RoKS5maWxsKHVuZGVmaW5lZCk7XG4gICAgICAgICAgICAgIHRoaXMuYW5zd2VyZWQgPSB0aGlzLmFuc3dlcmVkLm1hcCgoZSwgaWR4KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucXVpenNbaWR4XS5nZW5yZSA9PT0gJ+WkmumAiemimCcpIHJldHVybiBbXTtcbiAgICAgICAgICAgICAgICBlbHNlIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICB2YXIgZXhwaXJlRGF0ZSA9IG5ldyBEYXRlKHJlcy5kYXRhLmV4cGlyZSk7XG4gICAgICAgICAgICAgIHZhciBub3dEYXRlID0gbmV3IERhdGUocmVzLmRhdGEubm93KTtcbiAgICAgICAgICAgICAgdmFyIGxlZnQgPSBleHBpcmVEYXRlLmdldFRpbWUoKSAtIG5vd0RhdGUuZ2V0VGltZSgpO1xuICAgICAgICAgICAgICBsZWZ0ID0gbGVmdCA8IDAgPyAwIDogbGVmdDtcbiAgICAgICAgICAgICAgaWYgKGxlZnQgPT09IDApIHRoaXMubG9jayA9IHRydWU7XG4gICAgICAgICAgICAgIHZhciBsZWZ0RGF0ZSA9IG5ldyBEYXRlKGxlZnQpO1xuICAgICAgICAgICAgICB0aGlzLm1pbiA9IGxlZnREYXRlLmdldE1pbnV0ZXMoKTtcbiAgICAgICAgICAgICAgdGhpcy5zZWMgPSBsZWZ0RGF0ZS5nZXRTZWNvbmRzKCk7XG4gICAgICAgICAgICAgIHRoaXMudGljaygpO1xuICAgICAgICAgICAgICByZW5kZXIoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHRoaXMucGFzcyA9IHRydWU7XG4gICAgICAgICAgICAgIHRoaXMucXVpenMgPSByZXMuZGF0YS5xdWl6cztcbiAgICAgICAgICAgICAgdGhpcy5zaG93ID0gdGhpcy5xdWl6cy5tYXAoZSA9PiBmYWxzZSk7XG4gICAgICAgICAgICAgIHRoaXMuc2hvd1swXSA9IHRydWU7XG4gICAgICAgICAgICAgIHRoaXMubG9jayA9IHRydWU7XG4gICAgICAgICAgICAgIHRoaXMuc2hvd0FucyA9IHRydWU7XG4gICAgICAgICAgICAgIHRoaXMuZGlzYW5zd2VyZWQgPSB0aGlzLnF1aXpzLm1hcChxID0+IHtcbiAgICAgICAgICAgICAgICBpZiAocS5nZW5yZSA9PT0gJ+WNlemAiemimCcgfHwgcS5nZW5yZSA9PT0gJ+WkmumAiemimCcpIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBxLmFuc3dlcmVkLm1hcChlID0+IHRoaXMuY2hhck1hcFtxLnNlbGVjdGlvbnMuaW5kZXhPZihlKV0pLnNvcnQoKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgcmV0dXJuIHEuYW5zd2VyZWQ7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICB0aGlzLmljb25zID0gdGhpcy5xdWl6cy5tYXAocSA9PiBxLmlzUmlnaHQpO1xuICAgICAgICAgICAgICByZW5kZXIoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LCBlcnIgPT4ge1xuICAgICAgICAgICAgaWYgKGVyci5kYXRhID09PSAn6aG16Z2i5bey6L+H5pyfJykgdGhpcy5sb2NrID0gdHJ1ZTtcbiAgICAgICAgICAgIGVsc2UgdGlwKCfnvZHnu5zmlYXpmpwnLCAnZXJyb3InKTtcbiAgICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgICBzZW5kKGV2dCkge1xuICAgICAgICBpZiAoIXRoaXMuZmluaXNoZWQpIHJldHVybiBldnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgdmFyIHV1aWQgPSB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUuc3BsaXQoJy8nKVs0XTtcbiAgICAgICAgdGhpcy4kaHR0cC5wdXQoJy9hcGkvdC90ZXN0LycgKyB1dWlkLCB7XG4gICAgICAgICAgICBubzogdGhpcy5ubyxcbiAgICAgICAgICAgIGFuc3dlcmVkOiB0aGlzLnNlbmRhbnNcbiAgICAgICAgICB9KVxuICAgICAgICAgIC50aGVuKHJlcyA9PiB7XG4gICAgICAgICAgICBpZiAocmVzLmRhdGEudGltZW91dCkgdGhpcy5sb2NrID0gdHJ1ZTtcbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICB0aGlzLnN0YXJ0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSwgZXJyID0+IHRpcCgn572R57uc5pWF6ZqcJywgJ2Vycm9yJykpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG59KSgpO1xuIiwiLyogZ2xvYmFscyBNYXRlcmlhbExheW91dFRhYiwgTWF0ZXJpYWxMYXlvdXQsIE1hdGVyaWFsVGFicywgTWF0ZXJpYWxUYWIsIE1hdGVyaWFsUmlwcGxlLCBNYXRlcmlhbERhdGFUYWJsZSwgTWF0ZXJpYWxCdXR0b24sIE1hdGVyaWFsQ2hlY2tib3gsIE1hdGVyaWFsUmFkaW8sIE1hdGVyaWFsVGV4dGZpZWxkLCBjb21wb25lbnRIYW5kbGVyICovXG5cbmZ1bmN0aW9uIHJlbmRlclRhYnMocGFuZWxzLCBsYXlvdXQpIHtcbiAgd2luZG93LnNldFRpbWVvdXQoKCkgPT4ge1xuICAgIHZhciB0YWJzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLm1kbC1sYXlvdXRfX3RhYicpO1xuICAgIFtdLmZvckVhY2guY2FsbCh0YWJzLCBlbCA9PiB7XG4gICAgICBuZXcgTWF0ZXJpYWxMYXlvdXRUYWIoZWwsIHRhYnMsIHBhbmVscywgbGF5b3V0Lk1hdGVyaWFsTGF5b3V0KTtcbiAgICAgIG5ldyBNYXRlcmlhbFJpcHBsZShlbCk7XG4gICAgfSk7XG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICB0YWJzWzBdLmNsaWNrKCk7XG4gICAgfSwgMTAwKVxuICB9LCAxMDApO1xufVxuXG5mdW5jdGlvbiByZW5kZXJUYWJsZSh0YWJsZSkge1xuICB2YXIgdGhfZmlyc3QgPSB0YWJsZS5xdWVyeVNlbGVjdG9yKCd0aCcpO1xuICB0aF9maXJzdC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoX2ZpcnN0KTtcbiAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgbmV3IE1hdGVyaWFsRGF0YVRhYmxlKHRhYmxlKTtcbiAgICBjb21wb25lbnRIYW5kbGVyLnVwZ3JhZGVBbGxSZWdpc3RlcmVkKCk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiByZW5kZXJSaXBwbGUoZWwpIHtcbiAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgY29tcG9uZW50SGFuZGxlci51cGdyYWRlQWxsUmVnaXN0ZXJlZCgpO1xuICB9LCAxMDApO1xufVxuXG5mdW5jdGlvbiByZW5kZXJCdXR0b24oZWwpIHtcbiAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgY29tcG9uZW50SGFuZGxlci51cGdyYWRlQWxsUmVnaXN0ZXJlZCgpO1xuICB9LCAxMDApO1xufVxuXG5mdW5jdGlvbiByZW5kZXJDaGVja2JveChlbCkge1xuICB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB7XG4gICAgdmFyIGJ0bnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGVsKS5xdWVyeVNlbGVjdG9yQWxsKCcubWRsLWpzLWNoZWNrYm94Jyk7XG4gICAgW10uZm9yRWFjaC5jYWxsKGJ0bnMsIGVsID0+IHtcbiAgICAgIG5ldyBNYXRlcmlhbENoZWNrYm94KGVsKTtcbiAgICB9KTtcbiAgfSwgMTAwKTtcbn1cblxuZnVuY3Rpb24gcmVuZGVyUmFkaW8oZWwpIHtcbiAgd2luZG93LnNldFRpbWVvdXQoKCkgPT4ge1xuICAgIHZhciByYWRpb3MgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGVsKS5xdWVyeVNlbGVjdG9yQWxsKCcubWRsLWpzLXJhZGlvJyk7XG4gICAgWy4uLnJhZGlvc10uZm9yRWFjaChlbCA9PiB7XG4gICAgICBuZXcgTWF0ZXJpYWxSYWRpbyhlbCk7XG4gICAgfSk7XG4gIH0sIDEwMCk7XG59XG5cbmZ1bmN0aW9uIHJlbmRlclRleHRmaWVsZChlbCkge1xuICB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB7XG4gICAgdmFyIGZpZWxkcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoZWwpLnF1ZXJ5U2VsZWN0b3JBbGwoJy5tZGwtanMtdGV4dGZpZWxkJyk7XG4gICAgW10uZm9yRWFjaC5jYWxsKGZpZWxkcywgZWwgPT4ge1xuICAgICAgbmV3IE1hdGVyaWFsVGV4dGZpZWxkKGVsKTtcbiAgICB9KTtcbiAgfSwgMTAwKTtcbn1cblxuZnVuY3Rpb24gdGlwKHN0ciwgdHlwZSkge1xuICB2YXIgZWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjdGlwJyk7XG4gIGVsLmlubmVyVGV4dCA9IHN0cjtcbiAgLy8gZm9yIGZpcmVmb3hcbiAgZWwudGV4dENvbnRlbnQgPSBzdHI7XG4gIGlmICh0eXBlID09PSAnZXJyb3InKSBlbC5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAnI2Q5NTM0Zic7XG4gIGlmICh0eXBlID09PSAnc3VjY2VzcycpIGVsLnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICcjNWNiODVjJztcbiAgaWYgKHR5cGUgPT09ICdtZXNzYWdlJykgZWwuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJyMzYWFhY2YnO1xuICBpZiAoIWVsLnN0eWxlLmRpc3BsYXkgfHwgZWwuc3R5bGUuZGlzcGxheSA9PT0gJ25vbmUnKSB7XG4gICAgZWwuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBlbC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgIH0sIDIwMDApO1xuICB9XG59XG5cbmZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgY29tcG9uZW50SGFuZGxlci51cGdyYWRlQWxsUmVnaXN0ZXJlZCgpO1xuICB9LCAxMDApO1xufVxuXG5tb2R1bGUuZXhwb3J0cy5yZW5kZXJUYWJzID0gcmVuZGVyVGFicztcbm1vZHVsZS5leHBvcnRzLnRpcCA9IHRpcDtcbm1vZHVsZS5leHBvcnRzLnJlbmRlclRhYmxlID0gcmVuZGVyVGFibGU7XG5tb2R1bGUuZXhwb3J0cy5yZW5kZXJCdXR0b24gPSByZW5kZXJCdXR0b247XG5tb2R1bGUuZXhwb3J0cy5yZW5kZXJSaXBwbGUgPSByZW5kZXJSaXBwbGU7XG5tb2R1bGUuZXhwb3J0cy5yZW5kZXJSYWRpbyA9IHJlbmRlclJhZGlvO1xubW9kdWxlLmV4cG9ydHMucmVuZGVyQ2hlY2tib3ggPSByZW5kZXJDaGVja2JveDtcbm1vZHVsZS5leHBvcnRzLnJlbmRlclRleHRmaWVsZCA9IHJlbmRlclRleHRmaWVsZDtcbm1vZHVsZS5leHBvcnRzLnJlbmRlciA9IHJlbmRlcjtcbiIsIi8qKlxuICogQmVmb3JlIEludGVyY2VwdG9yLlxuICovXG5cbnZhciBfID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICAgIHJlcXVlc3Q6IGZ1bmN0aW9uIChyZXF1ZXN0KSB7XG5cbiAgICAgICAgaWYgKF8uaXNGdW5jdGlvbihyZXF1ZXN0LmJlZm9yZVNlbmQpKSB7XG4gICAgICAgICAgICByZXF1ZXN0LmJlZm9yZVNlbmQuY2FsbCh0aGlzLCByZXF1ZXN0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXF1ZXN0O1xuICAgIH1cblxufTtcbiIsIi8qKlxuICogQmFzZSBjbGllbnQuXG4gKi9cblxudmFyIF8gPSByZXF1aXJlKCcuLi8uLi91dGlsJyk7XG52YXIgUHJvbWlzZSA9IHJlcXVpcmUoJy4uLy4uL3Byb21pc2UnKTtcbnZhciB4aHJDbGllbnQgPSByZXF1aXJlKCcuL3hocicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChyZXF1ZXN0KSB7XG5cbiAgICB2YXIgcmVzcG9uc2UgPSAocmVxdWVzdC5jbGllbnQgfHwgeGhyQ2xpZW50KShyZXF1ZXN0KTtcblxuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUocmVzcG9uc2UpLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG5cbiAgICAgICAgaWYgKHJlc3BvbnNlLmhlYWRlcnMpIHtcblxuICAgICAgICAgICAgdmFyIGhlYWRlcnMgPSBwYXJzZUhlYWRlcnMocmVzcG9uc2UuaGVhZGVycyk7XG5cbiAgICAgICAgICAgIHJlc3BvbnNlLmhlYWRlcnMgPSBmdW5jdGlvbiAobmFtZSkge1xuXG4gICAgICAgICAgICAgICAgaWYgKG5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGhlYWRlcnNbXy50b0xvd2VyKG5hbWUpXTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gaGVhZGVycztcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgfVxuXG4gICAgICAgIHJlc3BvbnNlLm9rID0gcmVzcG9uc2Uuc3RhdHVzID49IDIwMCAmJiByZXNwb25zZS5zdGF0dXMgPCAzMDA7XG5cbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xuICAgIH0pO1xuXG59O1xuXG5mdW5jdGlvbiBwYXJzZUhlYWRlcnMoc3RyKSB7XG5cbiAgICB2YXIgaGVhZGVycyA9IHt9LCB2YWx1ZSwgbmFtZSwgaTtcblxuICAgIGlmIChfLmlzU3RyaW5nKHN0cikpIHtcbiAgICAgICAgXy5lYWNoKHN0ci5zcGxpdCgnXFxuJyksIGZ1bmN0aW9uIChyb3cpIHtcblxuICAgICAgICAgICAgaSA9IHJvdy5pbmRleE9mKCc6Jyk7XG4gICAgICAgICAgICBuYW1lID0gXy50cmltKF8udG9Mb3dlcihyb3cuc2xpY2UoMCwgaSkpKTtcbiAgICAgICAgICAgIHZhbHVlID0gXy50cmltKHJvdy5zbGljZShpICsgMSkpO1xuXG4gICAgICAgICAgICBpZiAoaGVhZGVyc1tuYW1lXSkge1xuXG4gICAgICAgICAgICAgICAgaWYgKF8uaXNBcnJheShoZWFkZXJzW25hbWVdKSkge1xuICAgICAgICAgICAgICAgICAgICBoZWFkZXJzW25hbWVdLnB1c2godmFsdWUpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGhlYWRlcnNbbmFtZV0gPSBbaGVhZGVyc1tuYW1lXSwgdmFsdWVdO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgIGhlYWRlcnNbbmFtZV0gPSB2YWx1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gaGVhZGVycztcbn1cbiIsIi8qKlxuICogSlNPTlAgY2xpZW50LlxuICovXG5cbnZhciBfID0gcmVxdWlyZSgnLi4vLi4vdXRpbCcpO1xudmFyIFByb21pc2UgPSByZXF1aXJlKCcuLi8uLi9wcm9taXNlJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHJlcXVlc3QpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUpIHtcblxuICAgICAgICB2YXIgY2FsbGJhY2sgPSAnX2pzb25wJyArIE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cigyKSwgcmVzcG9uc2UgPSB7cmVxdWVzdDogcmVxdWVzdCwgZGF0YTogbnVsbH0sIGhhbmRsZXIsIHNjcmlwdDtcblxuICAgICAgICByZXF1ZXN0LnBhcmFtc1tyZXF1ZXN0Lmpzb25wXSA9IGNhbGxiYWNrO1xuICAgICAgICByZXF1ZXN0LmNhbmNlbCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGhhbmRsZXIoe3R5cGU6ICdjYW5jZWwnfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgc2NyaXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XG4gICAgICAgIHNjcmlwdC5zcmMgPSBfLnVybChyZXF1ZXN0KTtcbiAgICAgICAgc2NyaXB0LnR5cGUgPSAndGV4dC9qYXZhc2NyaXB0JztcbiAgICAgICAgc2NyaXB0LmFzeW5jID0gdHJ1ZTtcblxuICAgICAgICB3aW5kb3dbY2FsbGJhY2tdID0gZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgIHJlc3BvbnNlLmRhdGEgPSBkYXRhO1xuICAgICAgICB9O1xuXG4gICAgICAgIGhhbmRsZXIgPSBmdW5jdGlvbiAoZXZlbnQpIHtcblxuICAgICAgICAgICAgaWYgKGV2ZW50LnR5cGUgPT09ICdsb2FkJyAmJiByZXNwb25zZS5kYXRhICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgcmVzcG9uc2Uuc3RhdHVzID0gMjAwO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChldmVudC50eXBlID09PSAnZXJyb3InKSB7XG4gICAgICAgICAgICAgICAgcmVzcG9uc2Uuc3RhdHVzID0gNDA0O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXNwb25zZS5zdGF0dXMgPSAwO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXNvbHZlKHJlc3BvbnNlKTtcblxuICAgICAgICAgICAgZGVsZXRlIHdpbmRvd1tjYWxsYmFja107XG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKHNjcmlwdCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgc2NyaXB0Lm9ubG9hZCA9IGhhbmRsZXI7XG4gICAgICAgIHNjcmlwdC5vbmVycm9yID0gaGFuZGxlcjtcblxuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHNjcmlwdCk7XG4gICAgfSk7XG59O1xuIiwiLyoqXG4gKiBYRG9tYWluIGNsaWVudCAoSW50ZXJuZXQgRXhwbG9yZXIpLlxuICovXG5cbnZhciBfID0gcmVxdWlyZSgnLi4vLi4vdXRpbCcpO1xudmFyIFByb21pc2UgPSByZXF1aXJlKCcuLi8uLi9wcm9taXNlJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHJlcXVlc3QpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUpIHtcblxuICAgICAgICB2YXIgeGRyID0gbmV3IFhEb21haW5SZXF1ZXN0KCksIHJlc3BvbnNlID0ge3JlcXVlc3Q6IHJlcXVlc3R9LCBoYW5kbGVyO1xuXG4gICAgICAgIHJlcXVlc3QuY2FuY2VsID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgeGRyLmFib3J0KCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgeGRyLm9wZW4ocmVxdWVzdC5tZXRob2QsIF8udXJsKHJlcXVlc3QpLCB0cnVlKTtcblxuICAgICAgICBoYW5kbGVyID0gZnVuY3Rpb24gKGV2ZW50KSB7XG5cbiAgICAgICAgICAgIHJlc3BvbnNlLmRhdGEgPSB4ZHIucmVzcG9uc2VUZXh0O1xuICAgICAgICAgICAgcmVzcG9uc2Uuc3RhdHVzID0geGRyLnN0YXR1cztcbiAgICAgICAgICAgIHJlc3BvbnNlLnN0YXR1c1RleHQgPSB4ZHIuc3RhdHVzVGV4dDtcblxuICAgICAgICAgICAgcmVzb2x2ZShyZXNwb25zZSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgeGRyLnRpbWVvdXQgPSAwO1xuICAgICAgICB4ZHIub25sb2FkID0gaGFuZGxlcjtcbiAgICAgICAgeGRyLm9uYWJvcnQgPSBoYW5kbGVyO1xuICAgICAgICB4ZHIub25lcnJvciA9IGhhbmRsZXI7XG4gICAgICAgIHhkci5vbnRpbWVvdXQgPSBmdW5jdGlvbiAoKSB7fTtcbiAgICAgICAgeGRyLm9ucHJvZ3Jlc3MgPSBmdW5jdGlvbiAoKSB7fTtcblxuICAgICAgICB4ZHIuc2VuZChyZXF1ZXN0LmRhdGEpO1xuICAgIH0pO1xufTtcbiIsIi8qKlxuICogWE1MSHR0cCBjbGllbnQuXG4gKi9cblxudmFyIF8gPSByZXF1aXJlKCcuLi8uLi91dGlsJyk7XG52YXIgUHJvbWlzZSA9IHJlcXVpcmUoJy4uLy4uL3Byb21pc2UnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocmVxdWVzdCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSkge1xuXG4gICAgICAgIHZhciB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKSwgcmVzcG9uc2UgPSB7cmVxdWVzdDogcmVxdWVzdH0sIGhhbmRsZXI7XG5cbiAgICAgICAgcmVxdWVzdC5jYW5jZWwgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB4aHIuYWJvcnQoKTtcbiAgICAgICAgfTtcblxuICAgICAgICB4aHIub3BlbihyZXF1ZXN0Lm1ldGhvZCwgXy51cmwocmVxdWVzdCksIHRydWUpO1xuXG4gICAgICAgIGhhbmRsZXIgPSBmdW5jdGlvbiAoZXZlbnQpIHtcblxuICAgICAgICAgICAgcmVzcG9uc2UuZGF0YSA9IHhoci5yZXNwb25zZVRleHQ7XG4gICAgICAgICAgICByZXNwb25zZS5zdGF0dXMgPSB4aHIuc3RhdHVzO1xuICAgICAgICAgICAgcmVzcG9uc2Uuc3RhdHVzVGV4dCA9IHhoci5zdGF0dXNUZXh0O1xuICAgICAgICAgICAgcmVzcG9uc2UuaGVhZGVycyA9IHhoci5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKTtcblxuICAgICAgICAgICAgcmVzb2x2ZShyZXNwb25zZSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgeGhyLnRpbWVvdXQgPSAwO1xuICAgICAgICB4aHIub25sb2FkID0gaGFuZGxlcjtcbiAgICAgICAgeGhyLm9uYWJvcnQgPSBoYW5kbGVyO1xuICAgICAgICB4aHIub25lcnJvciA9IGhhbmRsZXI7XG4gICAgICAgIHhoci5vbnRpbWVvdXQgPSBmdW5jdGlvbiAoKSB7fTtcbiAgICAgICAgeGhyLm9ucHJvZ3Jlc3MgPSBmdW5jdGlvbiAoKSB7fTtcblxuICAgICAgICBpZiAoXy5pc1BsYWluT2JqZWN0KHJlcXVlc3QueGhyKSkge1xuICAgICAgICAgICAgXy5leHRlbmQoeGhyLCByZXF1ZXN0Lnhocik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoXy5pc1BsYWluT2JqZWN0KHJlcXVlc3QudXBsb2FkKSkge1xuICAgICAgICAgICAgXy5leHRlbmQoeGhyLnVwbG9hZCwgcmVxdWVzdC51cGxvYWQpO1xuICAgICAgICB9XG5cbiAgICAgICAgXy5lYWNoKHJlcXVlc3QuaGVhZGVycyB8fCB7fSwgZnVuY3Rpb24gKHZhbHVlLCBoZWFkZXIpIHtcbiAgICAgICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKGhlYWRlciwgdmFsdWUpO1xuICAgICAgICB9KTtcblxuICAgICAgICB4aHIuc2VuZChyZXF1ZXN0LmRhdGEpO1xuICAgIH0pO1xufTtcbiIsIi8qKlxuICogQ09SUyBJbnRlcmNlcHRvci5cbiAqL1xuXG52YXIgXyA9IHJlcXVpcmUoJy4uL3V0aWwnKTtcbnZhciB4ZHJDbGllbnQgPSByZXF1aXJlKCcuL2NsaWVudC94ZHInKTtcbnZhciB4aHJDb3JzID0gJ3dpdGhDcmVkZW50aWFscycgaW4gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG52YXIgb3JpZ2luVXJsID0gXy51cmwucGFyc2UobG9jYXRpb24uaHJlZik7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gICAgcmVxdWVzdDogZnVuY3Rpb24gKHJlcXVlc3QpIHtcblxuICAgICAgICBpZiAocmVxdWVzdC5jcm9zc09yaWdpbiA9PT0gbnVsbCkge1xuICAgICAgICAgICAgcmVxdWVzdC5jcm9zc09yaWdpbiA9IGNyb3NzT3JpZ2luKHJlcXVlc3QpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHJlcXVlc3QuY3Jvc3NPcmlnaW4pIHtcblxuICAgICAgICAgICAgaWYgKCF4aHJDb3JzKSB7XG4gICAgICAgICAgICAgICAgcmVxdWVzdC5jbGllbnQgPSB4ZHJDbGllbnQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJlcXVlc3QuZW11bGF0ZUhUVFAgPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXF1ZXN0O1xuICAgIH1cblxufTtcblxuZnVuY3Rpb24gY3Jvc3NPcmlnaW4ocmVxdWVzdCkge1xuXG4gICAgdmFyIHJlcXVlc3RVcmwgPSBfLnVybC5wYXJzZShfLnVybChyZXF1ZXN0KSk7XG5cbiAgICByZXR1cm4gKHJlcXVlc3RVcmwucHJvdG9jb2wgIT09IG9yaWdpblVybC5wcm90b2NvbCB8fCByZXF1ZXN0VXJsLmhvc3QgIT09IG9yaWdpblVybC5ob3N0KTtcbn1cbiIsIi8qKlxuICogSGVhZGVyIEludGVyY2VwdG9yLlxuICovXG5cbnZhciBfID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICAgIHJlcXVlc3Q6IGZ1bmN0aW9uIChyZXF1ZXN0KSB7XG5cbiAgICAgICAgcmVxdWVzdC5tZXRob2QgPSByZXF1ZXN0Lm1ldGhvZC50b1VwcGVyQ2FzZSgpO1xuICAgICAgICByZXF1ZXN0LmhlYWRlcnMgPSBfLmV4dGVuZCh7fSwgXy5odHRwLmhlYWRlcnMuY29tbW9uLFxuICAgICAgICAgICAgIXJlcXVlc3QuY3Jvc3NPcmlnaW4gPyBfLmh0dHAuaGVhZGVycy5jdXN0b20gOiB7fSxcbiAgICAgICAgICAgIF8uaHR0cC5oZWFkZXJzW3JlcXVlc3QubWV0aG9kLnRvTG93ZXJDYXNlKCldLFxuICAgICAgICAgICAgcmVxdWVzdC5oZWFkZXJzXG4gICAgICAgICk7XG5cbiAgICAgICAgaWYgKF8uaXNQbGFpbk9iamVjdChyZXF1ZXN0LmRhdGEpICYmIC9eKEdFVHxKU09OUCkkL2kudGVzdChyZXF1ZXN0Lm1ldGhvZCkpIHtcbiAgICAgICAgICAgIF8uZXh0ZW5kKHJlcXVlc3QucGFyYW1zLCByZXF1ZXN0LmRhdGEpO1xuICAgICAgICAgICAgZGVsZXRlIHJlcXVlc3QuZGF0YTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXF1ZXN0O1xuICAgIH1cblxufTtcbiIsIi8qKlxuICogU2VydmljZSBmb3Igc2VuZGluZyBuZXR3b3JrIHJlcXVlc3RzLlxuICovXG5cbnZhciBfID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xudmFyIENsaWVudCA9IHJlcXVpcmUoJy4vY2xpZW50Jyk7XG52YXIgUHJvbWlzZSA9IHJlcXVpcmUoJy4uL3Byb21pc2UnKTtcbnZhciBpbnRlcmNlcHRvciA9IHJlcXVpcmUoJy4vaW50ZXJjZXB0b3InKTtcbnZhciBqc29uVHlwZSA9IHsnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nfTtcblxuZnVuY3Rpb24gSHR0cCh1cmwsIG9wdGlvbnMpIHtcblxuICAgIHZhciBjbGllbnQgPSBDbGllbnQsIHJlcXVlc3QsIHByb21pc2U7XG5cbiAgICBIdHRwLmludGVyY2VwdG9ycy5mb3JFYWNoKGZ1bmN0aW9uIChoYW5kbGVyKSB7XG4gICAgICAgIGNsaWVudCA9IGludGVyY2VwdG9yKGhhbmRsZXIsIHRoaXMuJHZtKShjbGllbnQpO1xuICAgIH0sIHRoaXMpO1xuXG4gICAgb3B0aW9ucyA9IF8uaXNPYmplY3QodXJsKSA/IHVybCA6IF8uZXh0ZW5kKHt1cmw6IHVybH0sIG9wdGlvbnMpO1xuICAgIHJlcXVlc3QgPSBfLm1lcmdlKHt9LCBIdHRwLm9wdGlvbnMsIHRoaXMuJG9wdGlvbnMsIG9wdGlvbnMpO1xuICAgIHByb21pc2UgPSBjbGllbnQocmVxdWVzdCkuYmluZCh0aGlzLiR2bSkudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcblxuICAgICAgICByZXR1cm4gcmVzcG9uc2Uub2sgPyByZXNwb25zZSA6IFByb21pc2UucmVqZWN0KHJlc3BvbnNlKTtcblxuICAgIH0sIGZ1bmN0aW9uIChyZXNwb25zZSkge1xuXG4gICAgICAgIGlmIChyZXNwb25zZSBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgICAgICBfLmVycm9yKHJlc3BvbnNlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChyZXNwb25zZSk7XG4gICAgfSk7XG5cbiAgICBpZiAocmVxdWVzdC5zdWNjZXNzKSB7XG4gICAgICAgIHByb21pc2Uuc3VjY2VzcyhyZXF1ZXN0LnN1Y2Nlc3MpO1xuICAgIH1cblxuICAgIGlmIChyZXF1ZXN0LmVycm9yKSB7XG4gICAgICAgIHByb21pc2UuZXJyb3IocmVxdWVzdC5lcnJvcik7XG4gICAgfVxuXG4gICAgcmV0dXJuIHByb21pc2U7XG59XG5cbkh0dHAub3B0aW9ucyA9IHtcbiAgICBtZXRob2Q6ICdnZXQnLFxuICAgIGRhdGE6ICcnLFxuICAgIHBhcmFtczoge30sXG4gICAgaGVhZGVyczoge30sXG4gICAgeGhyOiBudWxsLFxuICAgIHVwbG9hZDogbnVsbCxcbiAgICBqc29ucDogJ2NhbGxiYWNrJyxcbiAgICBiZWZvcmVTZW5kOiBudWxsLFxuICAgIGNyb3NzT3JpZ2luOiBudWxsLFxuICAgIGVtdWxhdGVIVFRQOiBmYWxzZSxcbiAgICBlbXVsYXRlSlNPTjogZmFsc2UsXG4gICAgdGltZW91dDogMFxufTtcblxuSHR0cC5pbnRlcmNlcHRvcnMgPSBbXG4gICAgcmVxdWlyZSgnLi9iZWZvcmUnKSxcbiAgICByZXF1aXJlKCcuL3RpbWVvdXQnKSxcbiAgICByZXF1aXJlKCcuL2pzb25wJyksXG4gICAgcmVxdWlyZSgnLi9tZXRob2QnKSxcbiAgICByZXF1aXJlKCcuL21pbWUnKSxcbiAgICByZXF1aXJlKCcuL2hlYWRlcicpLFxuICAgIHJlcXVpcmUoJy4vY29ycycpXG5dO1xuXG5IdHRwLmhlYWRlcnMgPSB7XG4gICAgcHV0OiBqc29uVHlwZSxcbiAgICBwb3N0OiBqc29uVHlwZSxcbiAgICBwYXRjaDoganNvblR5cGUsXG4gICAgZGVsZXRlOiBqc29uVHlwZSxcbiAgICBjb21tb246IHsnQWNjZXB0JzogJ2FwcGxpY2F0aW9uL2pzb24sIHRleHQvcGxhaW4sICovKid9LFxuICAgIGN1c3RvbTogeydYLVJlcXVlc3RlZC1XaXRoJzogJ1hNTEh0dHBSZXF1ZXN0J31cbn07XG5cblsnZ2V0JywgJ3B1dCcsICdwb3N0JywgJ3BhdGNoJywgJ2RlbGV0ZScsICdqc29ucCddLmZvckVhY2goZnVuY3Rpb24gKG1ldGhvZCkge1xuXG4gICAgSHR0cFttZXRob2RdID0gZnVuY3Rpb24gKHVybCwgZGF0YSwgc3VjY2Vzcywgb3B0aW9ucykge1xuXG4gICAgICAgIGlmIChfLmlzRnVuY3Rpb24oZGF0YSkpIHtcbiAgICAgICAgICAgIG9wdGlvbnMgPSBzdWNjZXNzO1xuICAgICAgICAgICAgc3VjY2VzcyA9IGRhdGE7XG4gICAgICAgICAgICBkYXRhID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF8uaXNPYmplY3Qoc3VjY2VzcykpIHtcbiAgICAgICAgICAgIG9wdGlvbnMgPSBzdWNjZXNzO1xuICAgICAgICAgICAgc3VjY2VzcyA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzKHVybCwgXy5leHRlbmQoe21ldGhvZDogbWV0aG9kLCBkYXRhOiBkYXRhLCBzdWNjZXNzOiBzdWNjZXNzfSwgb3B0aW9ucykpO1xuICAgIH07XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBfLmh0dHAgPSBIdHRwO1xuIiwiLyoqXG4gKiBJbnRlcmNlcHRvciBmYWN0b3J5LlxuICovXG5cbnZhciBfID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xudmFyIFByb21pc2UgPSByZXF1aXJlKCcuLi9wcm9taXNlJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGhhbmRsZXIsIHZtKSB7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gKGNsaWVudCkge1xuXG4gICAgICAgIGlmIChfLmlzRnVuY3Rpb24oaGFuZGxlcikpIHtcbiAgICAgICAgICAgIGhhbmRsZXIgPSBoYW5kbGVyLmNhbGwodm0sIFByb21pc2UpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChyZXF1ZXN0KSB7XG5cbiAgICAgICAgICAgIGlmIChfLmlzRnVuY3Rpb24oaGFuZGxlci5yZXF1ZXN0KSkge1xuICAgICAgICAgICAgICAgIHJlcXVlc3QgPSBoYW5kbGVyLnJlcXVlc3QuY2FsbCh2bSwgcmVxdWVzdCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB3aGVuKHJlcXVlc3QsIGZ1bmN0aW9uIChyZXF1ZXN0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHdoZW4oY2xpZW50KHJlcXVlc3QpLCBmdW5jdGlvbiAocmVzcG9uc2UpIHtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoXy5pc0Z1bmN0aW9uKGhhbmRsZXIucmVzcG9uc2UpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNwb25zZSA9IGhhbmRsZXIucmVzcG9uc2UuY2FsbCh2bSwgcmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgfTtcbn07XG5cbmZ1bmN0aW9uIHdoZW4odmFsdWUsIGZ1bGZpbGxlZCwgcmVqZWN0ZWQpIHtcblxuICAgIHZhciBwcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKHZhbHVlKTtcblxuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMikge1xuICAgICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gcHJvbWlzZS50aGVuKGZ1bGZpbGxlZCwgcmVqZWN0ZWQpO1xufVxuIiwiLyoqXG4gKiBKU09OUCBJbnRlcmNlcHRvci5cbiAqL1xuXG52YXIganNvbnBDbGllbnQgPSByZXF1aXJlKCcuL2NsaWVudC9qc29ucCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICAgIHJlcXVlc3Q6IGZ1bmN0aW9uIChyZXF1ZXN0KSB7XG5cbiAgICAgICAgaWYgKHJlcXVlc3QubWV0aG9kID09ICdKU09OUCcpIHtcbiAgICAgICAgICAgIHJlcXVlc3QuY2xpZW50ID0ganNvbnBDbGllbnQ7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVxdWVzdDtcbiAgICB9XG5cbn07XG4iLCIvKipcbiAqIEhUVFAgbWV0aG9kIG92ZXJyaWRlIEludGVyY2VwdG9yLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gICAgcmVxdWVzdDogZnVuY3Rpb24gKHJlcXVlc3QpIHtcblxuICAgICAgICBpZiAocmVxdWVzdC5lbXVsYXRlSFRUUCAmJiAvXihQVVR8UEFUQ0h8REVMRVRFKSQvaS50ZXN0KHJlcXVlc3QubWV0aG9kKSkge1xuICAgICAgICAgICAgcmVxdWVzdC5oZWFkZXJzWydYLUhUVFAtTWV0aG9kLU92ZXJyaWRlJ10gPSByZXF1ZXN0Lm1ldGhvZDtcbiAgICAgICAgICAgIHJlcXVlc3QubWV0aG9kID0gJ1BPU1QnO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlcXVlc3Q7XG4gICAgfVxuXG59O1xuIiwiLyoqXG4gKiBNaW1lIEludGVyY2VwdG9yLlxuICovXG5cbnZhciBfID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICAgIHJlcXVlc3Q6IGZ1bmN0aW9uIChyZXF1ZXN0KSB7XG5cbiAgICAgICAgaWYgKHJlcXVlc3QuZW11bGF0ZUpTT04gJiYgXy5pc1BsYWluT2JqZWN0KHJlcXVlc3QuZGF0YSkpIHtcbiAgICAgICAgICAgIHJlcXVlc3QuaGVhZGVyc1snQ29udGVudC1UeXBlJ10gPSAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJztcbiAgICAgICAgICAgIHJlcXVlc3QuZGF0YSA9IF8udXJsLnBhcmFtcyhyZXF1ZXN0LmRhdGEpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF8uaXNPYmplY3QocmVxdWVzdC5kYXRhKSAmJiAvRm9ybURhdGEvaS50ZXN0KHJlcXVlc3QuZGF0YS50b1N0cmluZygpKSkge1xuICAgICAgICAgICAgZGVsZXRlIHJlcXVlc3QuaGVhZGVyc1snQ29udGVudC1UeXBlJ107XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoXy5pc1BsYWluT2JqZWN0KHJlcXVlc3QuZGF0YSkpIHtcbiAgICAgICAgICAgIHJlcXVlc3QuZGF0YSA9IEpTT04uc3RyaW5naWZ5KHJlcXVlc3QuZGF0YSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVxdWVzdDtcbiAgICB9LFxuXG4gICAgcmVzcG9uc2U6IGZ1bmN0aW9uIChyZXNwb25zZSkge1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICByZXNwb25zZS5kYXRhID0gSlNPTi5wYXJzZShyZXNwb25zZS5kYXRhKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge31cblxuICAgICAgICByZXR1cm4gcmVzcG9uc2U7XG4gICAgfVxuXG59O1xuIiwiLyoqXG4gKiBUaW1lb3V0IEludGVyY2VwdG9yLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIHRpbWVvdXQ7XG5cbiAgICByZXR1cm4ge1xuXG4gICAgICAgIHJlcXVlc3Q6IGZ1bmN0aW9uIChyZXF1ZXN0KSB7XG5cbiAgICAgICAgICAgIGlmIChyZXF1ZXN0LnRpbWVvdXQpIHtcbiAgICAgICAgICAgICAgICB0aW1lb3V0ID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlcXVlc3QuY2FuY2VsKCk7XG4gICAgICAgICAgICAgICAgfSwgcmVxdWVzdC50aW1lb3V0KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHJlcXVlc3Q7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVzcG9uc2U6IGZ1bmN0aW9uIChyZXNwb25zZSkge1xuXG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG5cbiAgICAgICAgICAgIHJldHVybiByZXNwb25zZTtcbiAgICAgICAgfVxuXG4gICAgfTtcbn07XG4iLCIvKipcbiAqIEluc3RhbGwgcGx1Z2luLlxuICovXG5cbmZ1bmN0aW9uIGluc3RhbGwoVnVlKSB7XG5cbiAgICB2YXIgXyA9IHJlcXVpcmUoJy4vdXRpbCcpO1xuXG4gICAgXy5jb25maWcgPSBWdWUuY29uZmlnO1xuICAgIF8ud2FybmluZyA9IFZ1ZS51dGlsLndhcm47XG4gICAgXy5uZXh0VGljayA9IFZ1ZS51dGlsLm5leHRUaWNrO1xuXG4gICAgVnVlLnVybCA9IHJlcXVpcmUoJy4vdXJsJyk7XG4gICAgVnVlLmh0dHAgPSByZXF1aXJlKCcuL2h0dHAnKTtcbiAgICBWdWUucmVzb3VyY2UgPSByZXF1aXJlKCcuL3Jlc291cmNlJyk7XG4gICAgVnVlLlByb21pc2UgPSByZXF1aXJlKCcuL3Byb21pc2UnKTtcblxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKFZ1ZS5wcm90b3R5cGUsIHtcblxuICAgICAgICAkdXJsOiB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gXy5vcHRpb25zKFZ1ZS51cmwsIHRoaXMsIHRoaXMuJG9wdGlvbnMudXJsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICAkaHR0cDoge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF8ub3B0aW9ucyhWdWUuaHR0cCwgdGhpcywgdGhpcy4kb3B0aW9ucy5odHRwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICAkcmVzb3VyY2U6IHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBWdWUucmVzb3VyY2UuYmluZCh0aGlzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICAkcHJvbWlzZToge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChleGVjdXRvcikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFZ1ZS5Qcm9taXNlKGV4ZWN1dG9yLCB0aGlzKTtcbiAgICAgICAgICAgICAgICB9LmJpbmQodGhpcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgIH0pO1xufVxuXG5pZiAod2luZG93LlZ1ZSkge1xuICAgIFZ1ZS51c2UoaW5zdGFsbCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaW5zdGFsbDtcbiIsIi8qKlxuICogUHJvbWlzZXMvQSsgcG9seWZpbGwgdjEuMS40IChodHRwczovL2dpdGh1Yi5jb20vYnJhbXN0ZWluL3Byb21pcylcbiAqL1xuXG52YXIgXyA9IHJlcXVpcmUoJy4uL3V0aWwnKTtcblxudmFyIFJFU09MVkVEID0gMDtcbnZhciBSRUpFQ1RFRCA9IDE7XG52YXIgUEVORElORyAgPSAyO1xuXG5mdW5jdGlvbiBQcm9taXNlKGV4ZWN1dG9yKSB7XG5cbiAgICB0aGlzLnN0YXRlID0gUEVORElORztcbiAgICB0aGlzLnZhbHVlID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuZGVmZXJyZWQgPSBbXTtcblxuICAgIHZhciBwcm9taXNlID0gdGhpcztcblxuICAgIHRyeSB7XG4gICAgICAgIGV4ZWN1dG9yKGZ1bmN0aW9uICh4KSB7XG4gICAgICAgICAgICBwcm9taXNlLnJlc29sdmUoeCk7XG4gICAgICAgIH0sIGZ1bmN0aW9uIChyKSB7XG4gICAgICAgICAgICBwcm9taXNlLnJlamVjdChyKTtcbiAgICAgICAgfSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBwcm9taXNlLnJlamVjdChlKTtcbiAgICB9XG59XG5cblByb21pc2UucmVqZWN0ID0gZnVuY3Rpb24gKHIpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICByZWplY3Qocik7XG4gICAgfSk7XG59O1xuXG5Qcm9taXNlLnJlc29sdmUgPSBmdW5jdGlvbiAoeCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIHJlc29sdmUoeCk7XG4gICAgfSk7XG59O1xuXG5Qcm9taXNlLmFsbCA9IGZ1bmN0aW9uIGFsbChpdGVyYWJsZSkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIHZhciBjb3VudCA9IDAsIHJlc3VsdCA9IFtdO1xuXG4gICAgICAgIGlmIChpdGVyYWJsZS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIHJlc29sdmVyKGkpIHtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoeCkge1xuICAgICAgICAgICAgICAgIHJlc3VsdFtpXSA9IHg7XG4gICAgICAgICAgICAgICAgY291bnQgKz0gMTtcblxuICAgICAgICAgICAgICAgIGlmIChjb3VudCA9PT0gaXRlcmFibGUubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpdGVyYWJsZS5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgICAgUHJvbWlzZS5yZXNvbHZlKGl0ZXJhYmxlW2ldKS50aGVuKHJlc29sdmVyKGkpLCByZWplY3QpO1xuICAgICAgICB9XG4gICAgfSk7XG59O1xuXG5Qcm9taXNlLnJhY2UgPSBmdW5jdGlvbiByYWNlKGl0ZXJhYmxlKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpdGVyYWJsZS5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgICAgUHJvbWlzZS5yZXNvbHZlKGl0ZXJhYmxlW2ldKS50aGVuKHJlc29sdmUsIHJlamVjdCk7XG4gICAgICAgIH1cbiAgICB9KTtcbn07XG5cbnZhciBwID0gUHJvbWlzZS5wcm90b3R5cGU7XG5cbnAucmVzb2x2ZSA9IGZ1bmN0aW9uIHJlc29sdmUoeCkge1xuICAgIHZhciBwcm9taXNlID0gdGhpcztcblxuICAgIGlmIChwcm9taXNlLnN0YXRlID09PSBQRU5ESU5HKSB7XG4gICAgICAgIGlmICh4ID09PSBwcm9taXNlKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdQcm9taXNlIHNldHRsZWQgd2l0aCBpdHNlbGYuJyk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgY2FsbGVkID0gZmFsc2U7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHZhciB0aGVuID0geCAmJiB4Wyd0aGVuJ107XG5cbiAgICAgICAgICAgIGlmICh4ICE9PSBudWxsICYmIHR5cGVvZiB4ID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgdGhlbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgIHRoZW4uY2FsbCh4LCBmdW5jdGlvbiAoeCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWNhbGxlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvbWlzZS5yZXNvbHZlKHgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNhbGxlZCA9IHRydWU7XG5cbiAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAocikge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWNhbGxlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvbWlzZS5yZWplY3Qocik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY2FsbGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGlmICghY2FsbGVkKSB7XG4gICAgICAgICAgICAgICAgcHJvbWlzZS5yZWplY3QoZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBwcm9taXNlLnN0YXRlID0gUkVTT0xWRUQ7XG4gICAgICAgIHByb21pc2UudmFsdWUgPSB4O1xuICAgICAgICBwcm9taXNlLm5vdGlmeSgpO1xuICAgIH1cbn07XG5cbnAucmVqZWN0ID0gZnVuY3Rpb24gcmVqZWN0KHJlYXNvbikge1xuICAgIHZhciBwcm9taXNlID0gdGhpcztcblxuICAgIGlmIChwcm9taXNlLnN0YXRlID09PSBQRU5ESU5HKSB7XG4gICAgICAgIGlmIChyZWFzb24gPT09IHByb21pc2UpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1Byb21pc2Ugc2V0dGxlZCB3aXRoIGl0c2VsZi4nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb21pc2Uuc3RhdGUgPSBSRUpFQ1RFRDtcbiAgICAgICAgcHJvbWlzZS52YWx1ZSA9IHJlYXNvbjtcbiAgICAgICAgcHJvbWlzZS5ub3RpZnkoKTtcbiAgICB9XG59O1xuXG5wLm5vdGlmeSA9IGZ1bmN0aW9uIG5vdGlmeSgpIHtcbiAgICB2YXIgcHJvbWlzZSA9IHRoaXM7XG5cbiAgICBfLm5leHRUaWNrKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHByb21pc2Uuc3RhdGUgIT09IFBFTkRJTkcpIHtcbiAgICAgICAgICAgIHdoaWxlIChwcm9taXNlLmRlZmVycmVkLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9IHByb21pc2UuZGVmZXJyZWQuc2hpZnQoKSxcbiAgICAgICAgICAgICAgICAgICAgb25SZXNvbHZlZCA9IGRlZmVycmVkWzBdLFxuICAgICAgICAgICAgICAgICAgICBvblJlamVjdGVkID0gZGVmZXJyZWRbMV0sXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUgPSBkZWZlcnJlZFsyXSxcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0ID0gZGVmZXJyZWRbM107XG5cbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBpZiAocHJvbWlzZS5zdGF0ZSA9PT0gUkVTT0xWRUQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2Ygb25SZXNvbHZlZCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUob25SZXNvbHZlZC5jYWxsKHVuZGVmaW5lZCwgcHJvbWlzZS52YWx1ZSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHByb21pc2UudmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHByb21pc2Uuc3RhdGUgPT09IFJFSkVDVEVEKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIG9uUmVqZWN0ZWQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKG9uUmVqZWN0ZWQuY2FsbCh1bmRlZmluZWQsIHByb21pc2UudmFsdWUpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KHByb21pc2UudmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QoZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG59O1xuXG5wLnRoZW4gPSBmdW5jdGlvbiB0aGVuKG9uUmVzb2x2ZWQsIG9uUmVqZWN0ZWQpIHtcbiAgICB2YXIgcHJvbWlzZSA9IHRoaXM7XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBwcm9taXNlLmRlZmVycmVkLnB1c2goW29uUmVzb2x2ZWQsIG9uUmVqZWN0ZWQsIHJlc29sdmUsIHJlamVjdF0pO1xuICAgICAgICBwcm9taXNlLm5vdGlmeSgpO1xuICAgIH0pO1xufTtcblxucC5jYXRjaCA9IGZ1bmN0aW9uIChvblJlamVjdGVkKSB7XG4gICAgcmV0dXJuIHRoaXMudGhlbih1bmRlZmluZWQsIG9uUmVqZWN0ZWQpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBQcm9taXNlO1xuIiwiLyoqXG4gKiBVUkwgVGVtcGxhdGUgdjIuMC42IChodHRwczovL2dpdGh1Yi5jb20vYnJhbXN0ZWluL3VybC10ZW1wbGF0ZSlcbiAqL1xuXG5leHBvcnRzLmV4cGFuZCA9IGZ1bmN0aW9uICh1cmwsIHBhcmFtcywgdmFyaWFibGVzKSB7XG5cbiAgICB2YXIgdG1wbCA9IHRoaXMucGFyc2UodXJsKSwgZXhwYW5kZWQgPSB0bXBsLmV4cGFuZChwYXJhbXMpO1xuXG4gICAgaWYgKHZhcmlhYmxlcykge1xuICAgICAgICB2YXJpYWJsZXMucHVzaC5hcHBseSh2YXJpYWJsZXMsIHRtcGwudmFycyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGV4cGFuZGVkO1xufTtcblxuZXhwb3J0cy5wYXJzZSA9IGZ1bmN0aW9uICh0ZW1wbGF0ZSkge1xuXG4gICAgdmFyIG9wZXJhdG9ycyA9IFsnKycsICcjJywgJy4nLCAnLycsICc7JywgJz8nLCAnJiddLCB2YXJpYWJsZXMgPSBbXTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIHZhcnM6IHZhcmlhYmxlcyxcbiAgICAgICAgZXhwYW5kOiBmdW5jdGlvbiAoY29udGV4dCkge1xuICAgICAgICAgICAgcmV0dXJuIHRlbXBsYXRlLnJlcGxhY2UoL1xceyhbXlxce1xcfV0rKVxcfXwoW15cXHtcXH1dKykvZywgZnVuY3Rpb24gKF8sIGV4cHJlc3Npb24sIGxpdGVyYWwpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXhwcmVzc2lvbikge1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBvcGVyYXRvciA9IG51bGwsIHZhbHVlcyA9IFtdO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChvcGVyYXRvcnMuaW5kZXhPZihleHByZXNzaW9uLmNoYXJBdCgwKSkgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvcGVyYXRvciA9IGV4cHJlc3Npb24uY2hhckF0KDApO1xuICAgICAgICAgICAgICAgICAgICAgICAgZXhwcmVzc2lvbiA9IGV4cHJlc3Npb24uc3Vic3RyKDEpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgZXhwcmVzc2lvbi5zcGxpdCgvLC9nKS5mb3JFYWNoKGZ1bmN0aW9uICh2YXJpYWJsZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHRtcCA9IC8oW146XFwqXSopKD86OihcXGQrKXwoXFwqKSk/Ly5leGVjKHZhcmlhYmxlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlcy5wdXNoLmFwcGx5KHZhbHVlcywgZXhwb3J0cy5nZXRWYWx1ZXMoY29udGV4dCwgb3BlcmF0b3IsIHRtcFsxXSwgdG1wWzJdIHx8IHRtcFszXSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyaWFibGVzLnB1c2godG1wWzFdKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wZXJhdG9yICYmIG9wZXJhdG9yICE9PSAnKycpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHNlcGFyYXRvciA9ICcsJztcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG9wZXJhdG9yID09PSAnPycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXBhcmF0b3IgPSAnJic7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG9wZXJhdG9yICE9PSAnIycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXBhcmF0b3IgPSBvcGVyYXRvcjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICh2YWx1ZXMubGVuZ3RoICE9PSAwID8gb3BlcmF0b3IgOiAnJykgKyB2YWx1ZXMuam9pbihzZXBhcmF0b3IpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlcy5qb2luKCcsJyk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBleHBvcnRzLmVuY29kZVJlc2VydmVkKGxpdGVyYWwpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcbn07XG5cbmV4cG9ydHMuZ2V0VmFsdWVzID0gZnVuY3Rpb24gKGNvbnRleHQsIG9wZXJhdG9yLCBrZXksIG1vZGlmaWVyKSB7XG5cbiAgICB2YXIgdmFsdWUgPSBjb250ZXh0W2tleV0sIHJlc3VsdCA9IFtdO1xuXG4gICAgaWYgKHRoaXMuaXNEZWZpbmVkKHZhbHVlKSAmJiB2YWx1ZSAhPT0gJycpIHtcbiAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgfHwgdHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyB8fCB0eXBlb2YgdmFsdWUgPT09ICdib29sZWFuJykge1xuICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZS50b1N0cmluZygpO1xuXG4gICAgICAgICAgICBpZiAobW9kaWZpZXIgJiYgbW9kaWZpZXIgIT09ICcqJykge1xuICAgICAgICAgICAgICAgIHZhbHVlID0gdmFsdWUuc3Vic3RyaW5nKDAsIHBhcnNlSW50KG1vZGlmaWVyLCAxMCkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXN1bHQucHVzaCh0aGlzLmVuY29kZVZhbHVlKG9wZXJhdG9yLCB2YWx1ZSwgdGhpcy5pc0tleU9wZXJhdG9yKG9wZXJhdG9yKSA/IGtleSA6IG51bGwpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChtb2RpZmllciA9PT0gJyonKSB7XG4gICAgICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlLmZpbHRlcih0aGlzLmlzRGVmaW5lZCkuZm9yRWFjaChmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKHRoaXMuZW5jb2RlVmFsdWUob3BlcmF0b3IsIHZhbHVlLCB0aGlzLmlzS2V5T3BlcmF0b3Iob3BlcmF0b3IpID8ga2V5IDogbnVsbCkpO1xuICAgICAgICAgICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBPYmplY3Qua2V5cyh2YWx1ZSkuZm9yRWFjaChmdW5jdGlvbiAoaykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuaXNEZWZpbmVkKHZhbHVlW2tdKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKHRoaXMuZW5jb2RlVmFsdWUob3BlcmF0b3IsIHZhbHVlW2tdLCBrKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdmFyIHRtcCA9IFtdO1xuXG4gICAgICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlLmZpbHRlcih0aGlzLmlzRGVmaW5lZCkuZm9yRWFjaChmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRtcC5wdXNoKHRoaXMuZW5jb2RlVmFsdWUob3BlcmF0b3IsIHZhbHVlKSk7XG4gICAgICAgICAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIE9iamVjdC5rZXlzKHZhbHVlKS5mb3JFYWNoKGZ1bmN0aW9uIChrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5pc0RlZmluZWQodmFsdWVba10pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG1wLnB1c2goZW5jb2RlVVJJQ29tcG9uZW50KGspKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0bXAucHVzaCh0aGlzLmVuY29kZVZhbHVlKG9wZXJhdG9yLCB2YWx1ZVtrXS50b1N0cmluZygpKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmlzS2V5T3BlcmF0b3Iob3BlcmF0b3IpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKGVuY29kZVVSSUNvbXBvbmVudChrZXkpICsgJz0nICsgdG1wLmpvaW4oJywnKSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0bXAubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKHRtcC5qb2luKCcsJykpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChvcGVyYXRvciA9PT0gJzsnKSB7XG4gICAgICAgICAgICByZXN1bHQucHVzaChlbmNvZGVVUklDb21wb25lbnQoa2V5KSk7XG4gICAgICAgIH0gZWxzZSBpZiAodmFsdWUgPT09ICcnICYmIChvcGVyYXRvciA9PT0gJyYnIHx8IG9wZXJhdG9yID09PSAnPycpKSB7XG4gICAgICAgICAgICByZXN1bHQucHVzaChlbmNvZGVVUklDb21wb25lbnQoa2V5KSArICc9Jyk7XG4gICAgICAgIH0gZWxzZSBpZiAodmFsdWUgPT09ICcnKSB7XG4gICAgICAgICAgICByZXN1bHQucHVzaCgnJyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xufTtcblxuZXhwb3J0cy5pc0RlZmluZWQgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICByZXR1cm4gdmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbDtcbn07XG5cbmV4cG9ydHMuaXNLZXlPcGVyYXRvciA9IGZ1bmN0aW9uIChvcGVyYXRvcikge1xuICAgIHJldHVybiBvcGVyYXRvciA9PT0gJzsnIHx8IG9wZXJhdG9yID09PSAnJicgfHwgb3BlcmF0b3IgPT09ICc/Jztcbn07XG5cbmV4cG9ydHMuZW5jb2RlVmFsdWUgPSBmdW5jdGlvbiAob3BlcmF0b3IsIHZhbHVlLCBrZXkpIHtcblxuICAgIHZhbHVlID0gKG9wZXJhdG9yID09PSAnKycgfHwgb3BlcmF0b3IgPT09ICcjJykgPyB0aGlzLmVuY29kZVJlc2VydmVkKHZhbHVlKSA6IGVuY29kZVVSSUNvbXBvbmVudCh2YWx1ZSk7XG5cbiAgICBpZiAoa2V5KSB7XG4gICAgICAgIHJldHVybiBlbmNvZGVVUklDb21wb25lbnQoa2V5KSArICc9JyArIHZhbHVlO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG59O1xuXG5leHBvcnRzLmVuY29kZVJlc2VydmVkID0gZnVuY3Rpb24gKHN0cikge1xuICAgIHJldHVybiBzdHIuc3BsaXQoLyglWzAtOUEtRmEtZl17Mn0pL2cpLm1hcChmdW5jdGlvbiAocGFydCkge1xuICAgICAgICBpZiAoIS8lWzAtOUEtRmEtZl0vLnRlc3QocGFydCkpIHtcbiAgICAgICAgICAgIHBhcnQgPSBlbmNvZGVVUkkocGFydCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHBhcnQ7XG4gICAgfSkuam9pbignJyk7XG59O1xuIiwiLyoqXG4gKiBQcm9taXNlIGFkYXB0ZXIuXG4gKi9cblxudmFyIF8gPSByZXF1aXJlKCcuL3V0aWwnKTtcbnZhciBQcm9taXNlT2JqID0gd2luZG93LlByb21pc2UgfHwgcmVxdWlyZSgnLi9saWIvcHJvbWlzZScpO1xuXG5mdW5jdGlvbiBQcm9taXNlKGV4ZWN1dG9yLCBjb250ZXh0KSB7XG5cbiAgICBpZiAoZXhlY3V0b3IgaW5zdGFuY2VvZiBQcm9taXNlT2JqKSB7XG4gICAgICAgIHRoaXMucHJvbWlzZSA9IGV4ZWN1dG9yO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMucHJvbWlzZSA9IG5ldyBQcm9taXNlT2JqKGV4ZWN1dG9yLmJpbmQoY29udGV4dCkpO1xuICAgIH1cblxuICAgIHRoaXMuY29udGV4dCA9IGNvbnRleHQ7XG59XG5cblByb21pc2UuYWxsID0gZnVuY3Rpb24gKGl0ZXJhYmxlLCBjb250ZXh0KSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKFByb21pc2VPYmouYWxsKGl0ZXJhYmxlKSwgY29udGV4dCk7XG59O1xuXG5Qcm9taXNlLnJlc29sdmUgPSBmdW5jdGlvbiAodmFsdWUsIGNvbnRleHQpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoUHJvbWlzZU9iai5yZXNvbHZlKHZhbHVlKSwgY29udGV4dCk7XG59O1xuXG5Qcm9taXNlLnJlamVjdCA9IGZ1bmN0aW9uIChyZWFzb24sIGNvbnRleHQpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoUHJvbWlzZU9iai5yZWplY3QocmVhc29uKSwgY29udGV4dCk7XG59O1xuXG5Qcm9taXNlLnJhY2UgPSBmdW5jdGlvbiAoaXRlcmFibGUsIGNvbnRleHQpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoUHJvbWlzZU9iai5yYWNlKGl0ZXJhYmxlKSwgY29udGV4dCk7XG59O1xuXG52YXIgcCA9IFByb21pc2UucHJvdG90eXBlO1xuXG5wLmJpbmQgPSBmdW5jdGlvbiAoY29udGV4dCkge1xuICAgIHRoaXMuY29udGV4dCA9IGNvbnRleHQ7XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG5wLnRoZW4gPSBmdW5jdGlvbiAoZnVsZmlsbGVkLCByZWplY3RlZCkge1xuXG4gICAgaWYgKGZ1bGZpbGxlZCAmJiBmdWxmaWxsZWQuYmluZCAmJiB0aGlzLmNvbnRleHQpIHtcbiAgICAgICAgZnVsZmlsbGVkID0gZnVsZmlsbGVkLmJpbmQodGhpcy5jb250ZXh0KTtcbiAgICB9XG5cbiAgICBpZiAocmVqZWN0ZWQgJiYgcmVqZWN0ZWQuYmluZCAmJiB0aGlzLmNvbnRleHQpIHtcbiAgICAgICAgcmVqZWN0ZWQgPSByZWplY3RlZC5iaW5kKHRoaXMuY29udGV4dCk7XG4gICAgfVxuXG4gICAgdGhpcy5wcm9taXNlID0gdGhpcy5wcm9taXNlLnRoZW4oZnVsZmlsbGVkLCByZWplY3RlZCk7XG5cbiAgICByZXR1cm4gdGhpcztcbn07XG5cbnAuY2F0Y2ggPSBmdW5jdGlvbiAocmVqZWN0ZWQpIHtcblxuICAgIGlmIChyZWplY3RlZCAmJiByZWplY3RlZC5iaW5kICYmIHRoaXMuY29udGV4dCkge1xuICAgICAgICByZWplY3RlZCA9IHJlamVjdGVkLmJpbmQodGhpcy5jb250ZXh0KTtcbiAgICB9XG5cbiAgICB0aGlzLnByb21pc2UgPSB0aGlzLnByb21pc2UuY2F0Y2gocmVqZWN0ZWQpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG5wLmZpbmFsbHkgPSBmdW5jdGlvbiAoY2FsbGJhY2spIHtcblxuICAgIHJldHVybiB0aGlzLnRoZW4oZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICBjYWxsYmFjay5jYWxsKHRoaXMpO1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9LCBmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgICAgICAgICBjYWxsYmFjay5jYWxsKHRoaXMpO1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2VPYmoucmVqZWN0KHJlYXNvbik7XG4gICAgICAgIH1cbiAgICApO1xufTtcblxucC5zdWNjZXNzID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG5cbiAgICBfLndhcm4oJ1RoZSBgc3VjY2Vzc2AgbWV0aG9kIGhhcyBiZWVuIGRlcHJlY2F0ZWQuIFVzZSB0aGUgYHRoZW5gIG1ldGhvZCBpbnN0ZWFkLicpO1xuXG4gICAgcmV0dXJuIHRoaXMudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrLmNhbGwodGhpcywgcmVzcG9uc2UuZGF0YSwgcmVzcG9uc2Uuc3RhdHVzLCByZXNwb25zZSkgfHwgcmVzcG9uc2U7XG4gICAgfSk7XG59O1xuXG5wLmVycm9yID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG5cbiAgICBfLndhcm4oJ1RoZSBgZXJyb3JgIG1ldGhvZCBoYXMgYmVlbiBkZXByZWNhdGVkLiBVc2UgdGhlIGBjYXRjaGAgbWV0aG9kIGluc3RlYWQuJyk7XG5cbiAgICByZXR1cm4gdGhpcy5jYXRjaChmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrLmNhbGwodGhpcywgcmVzcG9uc2UuZGF0YSwgcmVzcG9uc2Uuc3RhdHVzLCByZXNwb25zZSkgfHwgcmVzcG9uc2U7XG4gICAgfSk7XG59O1xuXG5wLmFsd2F5cyA9IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuXG4gICAgXy53YXJuKCdUaGUgYGFsd2F5c2AgbWV0aG9kIGhhcyBiZWVuIGRlcHJlY2F0ZWQuIFVzZSB0aGUgYGZpbmFsbHlgIG1ldGhvZCBpbnN0ZWFkLicpO1xuXG4gICAgdmFyIGNiID0gZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgIHJldHVybiBjYWxsYmFjay5jYWxsKHRoaXMsIHJlc3BvbnNlLmRhdGEsIHJlc3BvbnNlLnN0YXR1cywgcmVzcG9uc2UpIHx8IHJlc3BvbnNlO1xuICAgIH07XG5cbiAgICByZXR1cm4gdGhpcy50aGVuKGNiLCBjYik7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFByb21pc2U7XG4iLCIvKipcbiAqIFNlcnZpY2UgZm9yIGludGVyYWN0aW5nIHdpdGggUkVTVGZ1bCBzZXJ2aWNlcy5cbiAqL1xuXG52YXIgXyA9IHJlcXVpcmUoJy4vdXRpbCcpO1xuXG5mdW5jdGlvbiBSZXNvdXJjZSh1cmwsIHBhcmFtcywgYWN0aW9ucywgb3B0aW9ucykge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzLCByZXNvdXJjZSA9IHt9O1xuXG4gICAgYWN0aW9ucyA9IF8uZXh0ZW5kKHt9LFxuICAgICAgICBSZXNvdXJjZS5hY3Rpb25zLFxuICAgICAgICBhY3Rpb25zXG4gICAgKTtcblxuICAgIF8uZWFjaChhY3Rpb25zLCBmdW5jdGlvbiAoYWN0aW9uLCBuYW1lKSB7XG5cbiAgICAgICAgYWN0aW9uID0gXy5tZXJnZSh7dXJsOiB1cmwsIHBhcmFtczogcGFyYW1zIHx8IHt9fSwgb3B0aW9ucywgYWN0aW9uKTtcblxuICAgICAgICByZXNvdXJjZVtuYW1lXSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiAoc2VsZi4kaHR0cCB8fCBfLmh0dHApKG9wdHMoYWN0aW9uLCBhcmd1bWVudHMpKTtcbiAgICAgICAgfTtcbiAgICB9KTtcblxuICAgIHJldHVybiByZXNvdXJjZTtcbn1cblxuZnVuY3Rpb24gb3B0cyhhY3Rpb24sIGFyZ3MpIHtcblxuICAgIHZhciBvcHRpb25zID0gXy5leHRlbmQoe30sIGFjdGlvbiksIHBhcmFtcyA9IHt9LCBkYXRhLCBzdWNjZXNzLCBlcnJvcjtcblxuICAgIHN3aXRjaCAoYXJncy5sZW5ndGgpIHtcblxuICAgICAgICBjYXNlIDQ6XG5cbiAgICAgICAgICAgIGVycm9yID0gYXJnc1szXTtcbiAgICAgICAgICAgIHN1Y2Nlc3MgPSBhcmdzWzJdO1xuXG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgY2FzZSAyOlxuXG4gICAgICAgICAgICBpZiAoXy5pc0Z1bmN0aW9uKGFyZ3NbMV0pKSB7XG5cbiAgICAgICAgICAgICAgICBpZiAoXy5pc0Z1bmN0aW9uKGFyZ3NbMF0pKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzcyA9IGFyZ3NbMF07XG4gICAgICAgICAgICAgICAgICAgIGVycm9yID0gYXJnc1sxXTtcblxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBzdWNjZXNzID0gYXJnc1sxXTtcbiAgICAgICAgICAgICAgICBlcnJvciA9IGFyZ3NbMl07XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICBwYXJhbXMgPSBhcmdzWzBdO1xuICAgICAgICAgICAgICAgIGRhdGEgPSBhcmdzWzFdO1xuICAgICAgICAgICAgICAgIHN1Y2Nlc3MgPSBhcmdzWzJdO1xuXG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgY2FzZSAxOlxuXG4gICAgICAgICAgICBpZiAoXy5pc0Z1bmN0aW9uKGFyZ3NbMF0pKSB7XG4gICAgICAgICAgICAgICAgc3VjY2VzcyA9IGFyZ3NbMF07XG4gICAgICAgICAgICB9IGVsc2UgaWYgKC9eKFBPU1R8UFVUfFBBVENIKSQvaS50ZXN0KG9wdGlvbnMubWV0aG9kKSkge1xuICAgICAgICAgICAgICAgIGRhdGEgPSBhcmdzWzBdO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBwYXJhbXMgPSBhcmdzWzBdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlIDA6XG5cbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGRlZmF1bHQ6XG5cbiAgICAgICAgICAgIHRocm93ICdFeHBlY3RlZCB1cCB0byA0IGFyZ3VtZW50cyBbcGFyYW1zLCBkYXRhLCBzdWNjZXNzLCBlcnJvcl0sIGdvdCAnICsgYXJncy5sZW5ndGggKyAnIGFyZ3VtZW50cyc7XG4gICAgfVxuXG4gICAgb3B0aW9ucy5kYXRhID0gZGF0YTtcbiAgICBvcHRpb25zLnBhcmFtcyA9IF8uZXh0ZW5kKHt9LCBvcHRpb25zLnBhcmFtcywgcGFyYW1zKTtcblxuICAgIGlmIChzdWNjZXNzKSB7XG4gICAgICAgIG9wdGlvbnMuc3VjY2VzcyA9IHN1Y2Nlc3M7XG4gICAgfVxuXG4gICAgaWYgKGVycm9yKSB7XG4gICAgICAgIG9wdGlvbnMuZXJyb3IgPSBlcnJvcjtcbiAgICB9XG5cbiAgICByZXR1cm4gb3B0aW9ucztcbn1cblxuUmVzb3VyY2UuYWN0aW9ucyA9IHtcblxuICAgIGdldDoge21ldGhvZDogJ0dFVCd9LFxuICAgIHNhdmU6IHttZXRob2Q6ICdQT1NUJ30sXG4gICAgcXVlcnk6IHttZXRob2Q6ICdHRVQnfSxcbiAgICB1cGRhdGU6IHttZXRob2Q6ICdQVVQnfSxcbiAgICByZW1vdmU6IHttZXRob2Q6ICdERUxFVEUnfSxcbiAgICBkZWxldGU6IHttZXRob2Q6ICdERUxFVEUnfVxuXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IF8ucmVzb3VyY2UgPSBSZXNvdXJjZTtcbiIsIi8qKlxuICogU2VydmljZSBmb3IgVVJMIHRlbXBsYXRpbmcuXG4gKi9cblxudmFyIF8gPSByZXF1aXJlKCcuLi91dGlsJyk7XG52YXIgaWUgPSBkb2N1bWVudC5kb2N1bWVudE1vZGU7XG52YXIgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG5cbmZ1bmN0aW9uIFVybCh1cmwsIHBhcmFtcykge1xuXG4gICAgdmFyIG9wdGlvbnMgPSB1cmwsIHRyYW5zZm9ybTtcblxuICAgIGlmIChfLmlzU3RyaW5nKHVybCkpIHtcbiAgICAgICAgb3B0aW9ucyA9IHt1cmw6IHVybCwgcGFyYW1zOiBwYXJhbXN9O1xuICAgIH1cblxuICAgIG9wdGlvbnMgPSBfLm1lcmdlKHt9LCBVcmwub3B0aW9ucywgdGhpcy4kb3B0aW9ucywgb3B0aW9ucyk7XG5cbiAgICBVcmwudHJhbnNmb3Jtcy5mb3JFYWNoKGZ1bmN0aW9uIChoYW5kbGVyKSB7XG4gICAgICAgIHRyYW5zZm9ybSA9IGZhY3RvcnkoaGFuZGxlciwgdHJhbnNmb3JtLCB0aGlzLiR2bSk7XG4gICAgfSwgdGhpcyk7XG5cbiAgICByZXR1cm4gdHJhbnNmb3JtKG9wdGlvbnMpO1xufTtcblxuLyoqXG4gKiBVcmwgb3B0aW9ucy5cbiAqL1xuXG5Vcmwub3B0aW9ucyA9IHtcbiAgICB1cmw6ICcnLFxuICAgIHJvb3Q6IG51bGwsXG4gICAgcGFyYW1zOiB7fVxufTtcblxuLyoqXG4gKiBVcmwgdHJhbnNmb3Jtcy5cbiAqL1xuXG5VcmwudHJhbnNmb3JtcyA9IFtcbiAgICByZXF1aXJlKCcuL3RlbXBsYXRlJyksXG4gICAgcmVxdWlyZSgnLi9sZWdhY3knKSxcbiAgICByZXF1aXJlKCcuL3F1ZXJ5JyksXG4gICAgcmVxdWlyZSgnLi9yb290Jylcbl07XG5cbi8qKlxuICogRW5jb2RlcyBhIFVybCBwYXJhbWV0ZXIgc3RyaW5nLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAqL1xuXG5VcmwucGFyYW1zID0gZnVuY3Rpb24gKG9iaikge1xuXG4gICAgdmFyIHBhcmFtcyA9IFtdLCBlc2NhcGUgPSBlbmNvZGVVUklDb21wb25lbnQ7XG5cbiAgICBwYXJhbXMuYWRkID0gZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcblxuICAgICAgICBpZiAoXy5pc0Z1bmN0aW9uKHZhbHVlKSkge1xuICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHZhbHVlID09PSBudWxsKSB7XG4gICAgICAgICAgICB2YWx1ZSA9ICcnO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5wdXNoKGVzY2FwZShrZXkpICsgJz0nICsgZXNjYXBlKHZhbHVlKSk7XG4gICAgfTtcblxuICAgIHNlcmlhbGl6ZShwYXJhbXMsIG9iaik7XG5cbiAgICByZXR1cm4gcGFyYW1zLmpvaW4oJyYnKS5yZXBsYWNlKC8lMjAvZywgJysnKTtcbn07XG5cbi8qKlxuICogUGFyc2UgYSBVUkwgYW5kIHJldHVybiBpdHMgY29tcG9uZW50cy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKi9cblxuVXJsLnBhcnNlID0gZnVuY3Rpb24gKHVybCkge1xuXG4gICAgaWYgKGllKSB7XG4gICAgICAgIGVsLmhyZWYgPSB1cmw7XG4gICAgICAgIHVybCA9IGVsLmhyZWY7XG4gICAgfVxuXG4gICAgZWwuaHJlZiA9IHVybDtcblxuICAgIHJldHVybiB7XG4gICAgICAgIGhyZWY6IGVsLmhyZWYsXG4gICAgICAgIHByb3RvY29sOiBlbC5wcm90b2NvbCA/IGVsLnByb3RvY29sLnJlcGxhY2UoLzokLywgJycpIDogJycsXG4gICAgICAgIHBvcnQ6IGVsLnBvcnQsXG4gICAgICAgIGhvc3Q6IGVsLmhvc3QsXG4gICAgICAgIGhvc3RuYW1lOiBlbC5ob3N0bmFtZSxcbiAgICAgICAgcGF0aG5hbWU6IGVsLnBhdGhuYW1lLmNoYXJBdCgwKSA9PT0gJy8nID8gZWwucGF0aG5hbWUgOiAnLycgKyBlbC5wYXRobmFtZSxcbiAgICAgICAgc2VhcmNoOiBlbC5zZWFyY2ggPyBlbC5zZWFyY2gucmVwbGFjZSgvXlxcPy8sICcnKSA6ICcnLFxuICAgICAgICBoYXNoOiBlbC5oYXNoID8gZWwuaGFzaC5yZXBsYWNlKC9eIy8sICcnKSA6ICcnXG4gICAgfTtcbn07XG5cbmZ1bmN0aW9uIGZhY3RvcnkoaGFuZGxlciwgbmV4dCwgdm0pIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIGhhbmRsZXIuY2FsbCh2bSwgb3B0aW9ucywgbmV4dCk7XG4gICAgfTtcbn1cblxuZnVuY3Rpb24gc2VyaWFsaXplKHBhcmFtcywgb2JqLCBzY29wZSkge1xuXG4gICAgdmFyIGFycmF5ID0gXy5pc0FycmF5KG9iaiksIHBsYWluID0gXy5pc1BsYWluT2JqZWN0KG9iaiksIGhhc2g7XG5cbiAgICBfLmVhY2gob2JqLCBmdW5jdGlvbiAodmFsdWUsIGtleSkge1xuXG4gICAgICAgIGhhc2ggPSBfLmlzT2JqZWN0KHZhbHVlKSB8fCBfLmlzQXJyYXkodmFsdWUpO1xuXG4gICAgICAgIGlmIChzY29wZSkge1xuICAgICAgICAgICAga2V5ID0gc2NvcGUgKyAnWycgKyAocGxhaW4gfHwgaGFzaCA/IGtleSA6ICcnKSArICddJztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghc2NvcGUgJiYgYXJyYXkpIHtcbiAgICAgICAgICAgIHBhcmFtcy5hZGQodmFsdWUubmFtZSwgdmFsdWUudmFsdWUpO1xuICAgICAgICB9IGVsc2UgaWYgKGhhc2gpIHtcbiAgICAgICAgICAgIHNlcmlhbGl6ZShwYXJhbXMsIHZhbHVlLCBrZXkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcGFyYW1zLmFkZChrZXksIHZhbHVlKTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IF8udXJsID0gVXJsO1xuIiwiLyoqXG4gKiBMZWdhY3kgVHJhbnNmb3JtLlxuICovXG5cbnZhciBfID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChvcHRpb25zLCBuZXh0KSB7XG5cbiAgICB2YXIgdmFyaWFibGVzID0gW10sIHVybCA9IG5leHQob3B0aW9ucyk7XG5cbiAgICB1cmwgPSB1cmwucmVwbGFjZSgvKFxcLz8pOihbYS16XVxcdyopL2dpLCBmdW5jdGlvbiAobWF0Y2gsIHNsYXNoLCBuYW1lKSB7XG5cbiAgICAgICAgXy53YXJuKCdUaGUgYDonICsgbmFtZSArICdgIHBhcmFtZXRlciBzeW50YXggaGFzIGJlZW4gZGVwcmVjYXRlZC4gVXNlIHRoZSBgeycgKyBuYW1lICsgJ31gIHN5bnRheCBpbnN0ZWFkLicpO1xuXG4gICAgICAgIGlmIChvcHRpb25zLnBhcmFtc1tuYW1lXSkge1xuICAgICAgICAgICAgdmFyaWFibGVzLnB1c2gobmFtZSk7XG4gICAgICAgICAgICByZXR1cm4gc2xhc2ggKyBlbmNvZGVVcmlTZWdtZW50KG9wdGlvbnMucGFyYW1zW25hbWVdKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAnJztcbiAgICB9KTtcblxuICAgIHZhcmlhYmxlcy5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgZGVsZXRlIG9wdGlvbnMucGFyYW1zW2tleV07XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdXJsO1xufTtcblxuZnVuY3Rpb24gZW5jb2RlVXJpU2VnbWVudCh2YWx1ZSkge1xuXG4gICAgcmV0dXJuIGVuY29kZVVyaVF1ZXJ5KHZhbHVlLCB0cnVlKS5cbiAgICAgICAgcmVwbGFjZSgvJTI2L2dpLCAnJicpLlxuICAgICAgICByZXBsYWNlKC8lM0QvZ2ksICc9JykuXG4gICAgICAgIHJlcGxhY2UoLyUyQi9naSwgJysnKTtcbn1cblxuZnVuY3Rpb24gZW5jb2RlVXJpUXVlcnkodmFsdWUsIHNwYWNlcykge1xuXG4gICAgcmV0dXJuIGVuY29kZVVSSUNvbXBvbmVudCh2YWx1ZSkuXG4gICAgICAgIHJlcGxhY2UoLyU0MC9naSwgJ0AnKS5cbiAgICAgICAgcmVwbGFjZSgvJTNBL2dpLCAnOicpLlxuICAgICAgICByZXBsYWNlKC8lMjQvZywgJyQnKS5cbiAgICAgICAgcmVwbGFjZSgvJTJDL2dpLCAnLCcpLlxuICAgICAgICByZXBsYWNlKC8lMjAvZywgKHNwYWNlcyA/ICclMjAnIDogJysnKSk7XG59XG4iLCIvKipcbiAqIFF1ZXJ5IFBhcmFtZXRlciBUcmFuc2Zvcm0uXG4gKi9cblxudmFyIF8gPSByZXF1aXJlKCcuLi91dGlsJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKG9wdGlvbnMsIG5leHQpIHtcblxuICAgIHZhciB1cmxQYXJhbXMgPSBPYmplY3Qua2V5cyhfLnVybC5vcHRpb25zLnBhcmFtcyksIHF1ZXJ5ID0ge30sIHVybCA9IG5leHQob3B0aW9ucyk7XG5cbiAgIF8uZWFjaChvcHRpb25zLnBhcmFtcywgZnVuY3Rpb24gKHZhbHVlLCBrZXkpIHtcbiAgICAgICAgaWYgKHVybFBhcmFtcy5pbmRleE9mKGtleSkgPT09IC0xKSB7XG4gICAgICAgICAgICBxdWVyeVtrZXldID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHF1ZXJ5ID0gXy51cmwucGFyYW1zKHF1ZXJ5KTtcblxuICAgIGlmIChxdWVyeSkge1xuICAgICAgICB1cmwgKz0gKHVybC5pbmRleE9mKCc/JykgPT0gLTEgPyAnPycgOiAnJicpICsgcXVlcnk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHVybDtcbn07XG4iLCIvKipcbiAqIFJvb3QgUHJlZml4IFRyYW5zZm9ybS5cbiAqL1xuXG52YXIgXyA9IHJlcXVpcmUoJy4uL3V0aWwnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAob3B0aW9ucywgbmV4dCkge1xuXG4gICAgdmFyIHVybCA9IG5leHQob3B0aW9ucyk7XG5cbiAgICBpZiAoXy5pc1N0cmluZyhvcHRpb25zLnJvb3QpICYmICF1cmwubWF0Y2goL14oaHR0cHM/Oik/XFwvLykpIHtcbiAgICAgICAgdXJsID0gb3B0aW9ucy5yb290ICsgJy8nICsgdXJsO1xuICAgIH1cblxuICAgIHJldHVybiB1cmw7XG59O1xuIiwiLyoqXG4gKiBVUkwgVGVtcGxhdGUgKFJGQyA2NTcwKSBUcmFuc2Zvcm0uXG4gKi9cblxudmFyIFVybFRlbXBsYXRlID0gcmVxdWlyZSgnLi4vbGliL3VybC10ZW1wbGF0ZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG5cbiAgICB2YXIgdmFyaWFibGVzID0gW10sIHVybCA9IFVybFRlbXBsYXRlLmV4cGFuZChvcHRpb25zLnVybCwgb3B0aW9ucy5wYXJhbXMsIHZhcmlhYmxlcyk7XG5cbiAgICB2YXJpYWJsZXMuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgIGRlbGV0ZSBvcHRpb25zLnBhcmFtc1trZXldO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHVybDtcbn07XG4iLCIvKipcbiAqIFV0aWxpdHkgZnVuY3Rpb25zLlxuICovXG5cbnZhciBfID0gZXhwb3J0cywgYXJyYXkgPSBbXSwgY29uc29sZSA9IHdpbmRvdy5jb25zb2xlO1xuXG5fLndhcm4gPSBmdW5jdGlvbiAobXNnKSB7XG4gICAgaWYgKGNvbnNvbGUgJiYgXy53YXJuaW5nICYmICghXy5jb25maWcuc2lsZW50IHx8IF8uY29uZmlnLmRlYnVnKSkge1xuICAgICAgICBjb25zb2xlLndhcm4oJ1tWdWVSZXNvdXJjZSB3YXJuXTogJyArIG1zZyk7XG4gICAgfVxufTtcblxuXy5lcnJvciA9IGZ1bmN0aW9uIChtc2cpIHtcbiAgICBpZiAoY29uc29sZSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKG1zZyk7XG4gICAgfVxufTtcblxuXy50cmltID0gZnVuY3Rpb24gKHN0cikge1xuICAgIHJldHVybiBzdHIucmVwbGFjZSgvXlxccyp8XFxzKiQvZywgJycpO1xufTtcblxuXy50b0xvd2VyID0gZnVuY3Rpb24gKHN0cikge1xuICAgIHJldHVybiBzdHIgPyBzdHIudG9Mb3dlckNhc2UoKSA6ICcnO1xufTtcblxuXy5pc0FycmF5ID0gQXJyYXkuaXNBcnJheTtcblxuXy5pc1N0cmluZyA9IGZ1bmN0aW9uICh2YWwpIHtcbiAgICByZXR1cm4gdHlwZW9mIHZhbCA9PT0gJ3N0cmluZyc7XG59O1xuXG5fLmlzRnVuY3Rpb24gPSBmdW5jdGlvbiAodmFsKSB7XG4gICAgcmV0dXJuIHR5cGVvZiB2YWwgPT09ICdmdW5jdGlvbic7XG59O1xuXG5fLmlzT2JqZWN0ID0gZnVuY3Rpb24gKG9iaikge1xuICAgIHJldHVybiBvYmogIT09IG51bGwgJiYgdHlwZW9mIG9iaiA9PT0gJ29iamVjdCc7XG59O1xuXG5fLmlzUGxhaW5PYmplY3QgPSBmdW5jdGlvbiAob2JqKSB7XG4gICAgcmV0dXJuIF8uaXNPYmplY3Qob2JqKSAmJiBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqKSA9PSBPYmplY3QucHJvdG90eXBlO1xufTtcblxuXy5vcHRpb25zID0gZnVuY3Rpb24gKGZuLCBvYmosIG9wdGlvbnMpIHtcblxuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgaWYgKF8uaXNGdW5jdGlvbihvcHRpb25zKSkge1xuICAgICAgICBvcHRpb25zID0gb3B0aW9ucy5jYWxsKG9iaik7XG4gICAgfVxuXG4gICAgcmV0dXJuIF8ubWVyZ2UoZm4uYmluZCh7JHZtOiBvYmosICRvcHRpb25zOiBvcHRpb25zfSksIGZuLCB7JG9wdGlvbnM6IG9wdGlvbnN9KTtcbn07XG5cbl8uZWFjaCA9IGZ1bmN0aW9uIChvYmosIGl0ZXJhdG9yKSB7XG5cbiAgICB2YXIgaSwga2V5O1xuXG4gICAgaWYgKHR5cGVvZiBvYmoubGVuZ3RoID09ICdudW1iZXInKSB7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBvYmoubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGl0ZXJhdG9yLmNhbGwob2JqW2ldLCBvYmpbaV0sIGkpO1xuICAgICAgICB9XG4gICAgfSBlbHNlIGlmIChfLmlzT2JqZWN0KG9iaikpIHtcbiAgICAgICAgZm9yIChrZXkgaW4gb2JqKSB7XG4gICAgICAgICAgICBpZiAob2JqLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICAgICAgICBpdGVyYXRvci5jYWxsKG9ialtrZXldLCBvYmpba2V5XSwga2V5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBvYmo7XG59O1xuXG5fLmRlZmF1bHRzID0gZnVuY3Rpb24gKHRhcmdldCwgc291cmNlKSB7XG5cbiAgICBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7XG4gICAgICAgIGlmICh0YXJnZXRba2V5XSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRhcmdldDtcbn07XG5cbl8uZXh0ZW5kID0gZnVuY3Rpb24gKHRhcmdldCkge1xuXG4gICAgdmFyIGFyZ3MgPSBhcnJheS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG5cbiAgICBhcmdzLmZvckVhY2goZnVuY3Rpb24gKGFyZykge1xuICAgICAgICBtZXJnZSh0YXJnZXQsIGFyZyk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGFyZ2V0O1xufTtcblxuXy5tZXJnZSA9IGZ1bmN0aW9uICh0YXJnZXQpIHtcblxuICAgIHZhciBhcmdzID0gYXJyYXkuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuXG4gICAgYXJncy5mb3JFYWNoKGZ1bmN0aW9uIChhcmcpIHtcbiAgICAgICAgbWVyZ2UodGFyZ2V0LCBhcmcsIHRydWUpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRhcmdldDtcbn07XG5cbmZ1bmN0aW9uIG1lcmdlKHRhcmdldCwgc291cmNlLCBkZWVwKSB7XG4gICAgZm9yICh2YXIga2V5IGluIHNvdXJjZSkge1xuICAgICAgICBpZiAoZGVlcCAmJiAoXy5pc1BsYWluT2JqZWN0KHNvdXJjZVtrZXldKSB8fCBfLmlzQXJyYXkoc291cmNlW2tleV0pKSkge1xuICAgICAgICAgICAgaWYgKF8uaXNQbGFpbk9iamVjdChzb3VyY2Vba2V5XSkgJiYgIV8uaXNQbGFpbk9iamVjdCh0YXJnZXRba2V5XSkpIHtcbiAgICAgICAgICAgICAgICB0YXJnZXRba2V5XSA9IHt9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKF8uaXNBcnJheShzb3VyY2Vba2V5XSkgJiYgIV8uaXNBcnJheSh0YXJnZXRba2V5XSkpIHtcbiAgICAgICAgICAgICAgICB0YXJnZXRba2V5XSA9IFtdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbWVyZ2UodGFyZ2V0W2tleV0sIHNvdXJjZVtrZXldLCBkZWVwKTtcbiAgICAgICAgfSBlbHNlIGlmIChzb3VyY2Vba2V5XSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldO1xuICAgICAgICB9XG4gICAgfVxufVxuIl19
