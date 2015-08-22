(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

if (typeof window !== 'undefined') {
  window.EventKit = window.EventKit || {
    CompositeDisposable: require('./CompositeDisposable'),
    Disposable: require('./Disposable'),
    Emitter: require('./Emitter')
  };
  module.exports = window.EventKit;
} else if (typeof self !== 'undefined') {
  self.EventKit = self.EventKit || {
    CompositeDisposable: require('./CompositeDisposable'),
    Disposable: require('./Disposable'),
    Emitter: require('./Emitter')
  };
  module.exports = self.EventKit;
}

},{"./CompositeDisposable":2,"./Disposable":3,"./Emitter":4}],2:[function(require,module,exports){
"use strict";

var _createClass = (function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
    }
  }return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
  };
})();

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

var CompositeDisposable = (function () {
  function CompositeDisposable() {
    _classCallCheck(this, CompositeDisposable);

    this.disposed = false;
    this.disposables = new Set(arguments);
  }

  _createClass(CompositeDisposable, [{
    key: "dispose",
    value: function dispose() {
      if (this.disposed) return;
      this.disposed = true;
      this.disposables.forEach(function (item) {
        return item.dispose();
      });
      this.disposables = null;
    }
  }, {
    key: "add",
    value: function add() {
      var _this = this;

      if (this.disposed) return;
      Array.prototype.forEach.call(arguments, function (item) {
        return _this.disposables.add(item);
      });
    }
  }, {
    key: "remove",
    value: function remove() {
      var _this2 = this;

      if (this.disposed) return;
      Array.prototype.forEach.call(arguments, function (item) {
        return _this2.disposables["delete"](item);
      });
    }
  }, {
    key: "clear",
    value: function clear() {
      if (this.disposed) return;
      this.disposables.clear();
    }
  }]);

  return CompositeDisposable;
})();

module.exports = CompositeDisposable;

},{}],3:[function(require,module,exports){
'use strict';

var _createClass = (function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ('value' in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
    }
  }return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
  };
})();

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function');
  }
}

var Disposable = (function () {
  function Disposable(callback) {
    _classCallCheck(this, Disposable);

    this.disposed = false;
    this.callback = callback;
  }

  _createClass(Disposable, [{
    key: 'dispose',
    value: function dispose() {
      if (this.disposed) return;
      if (typeof this.callback === 'function') {
        this.callback();
      }
      this.callback = null;
      this.disposed = true;
    }
  }]);

  return Disposable;
})();

module.exports = Disposable;

},{}],4:[function(require,module,exports){
'use strict';

var _createClass = (function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ('value' in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
    }
  }return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
  };
})();

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function');
  }
}

var Disposable = require('./Disposable');

var Emitter = (function () {
  function Emitter() {
    _classCallCheck(this, Emitter);

    this.disposed = false;
    this.handlersByEventName = {};
  }

  _createClass(Emitter, [{
    key: 'dispose',
    value: function dispose() {
      this.disposed = true;
      this.handlersByEventName = null;
    }
  }, {
    key: 'on',
    value: function on(eventName, handler) {
      var _this = this;

      if (this.disposed) throw new Error('Emitter has been disposed');
      if (typeof handler !== 'function') throw new Error('Handler must be a function');
      if (this.handlersByEventName.hasOwnProperty(eventName)) {
        this.handlersByEventName[eventName].push(handler);
      } else {
        this.handlersByEventName[eventName] = [handler];
      }
      return new Disposable(function () {
        return _this.off(eventName, handler);
      });
    }
  }, {
    key: 'off',
    value: function off(eventName, handler) {
      if (this.disposed || !this.handlersByEventName.hasOwnProperty(eventName)) return;
      var Index = undefined;
      if ((Index = this.handlersByEventName[eventName].indexOf(handler)) !== -1) {
        this.handlersByEventName[eventName].splice(Index, 1);
      }
    }
  }, {
    key: 'clear',
    value: function clear() {
      this.handlersByEventName = {};
    }
  }, {
    key: 'emit',
    value: function emit(eventName, value) {
      if (this.disposed || !this.handlersByEventName.hasOwnProperty(eventName)) return;
      this.handlersByEventName[eventName].forEach(function (callback) {
        return callback(value);
      });
    }
  }]);

  return Emitter;
})();

module.exports = Emitter;

},{"./Disposable":3}],5:[function(require,module,exports){
"use strict";function _classCallCheck(e, t) {
  if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function");
}function _inherits(e, t) {
  if ("function" != typeof t && null !== t) throw new TypeError("Super expression must either be null or a function, not " + typeof t);e.prototype = Object.create(t && t.prototype, { constructor: { value: e, enumerable: !1, writable: !0, configurable: !0 } }), t && (Object.setPrototypeOf ? Object.setPrototypeOf(e, t) : e.__proto__ = t);
}var _createClass = (function () {
  function e(e, t) {
    for (var r = 0; r < t.length; r++) {
      var n = t[r];n.enumerable = n.enumerable || !1, n.configurable = !0, "value" in n && (n.writable = !0), Object.defineProperty(e, n.key, n);
    }
  }return function (t, r, n) {
    return (r && e(t.prototype, r), n && e(t, n), t);
  };
})(),
    _get = function _get(e, t, r) {
  for (var n = !0; n;) {
    var o = e,
        s = t,
        i = r;u = c = a = void 0, n = !1, null === o && (o = Function.prototype);var u = Object.getOwnPropertyDescriptor(o, s);if (void 0 !== u) {
      if ("value" in u) return u.value;var a = u.get;return void 0 === a ? void 0 : a.call(i);
    }var c = Object.getPrototypeOf(o);if (null === c) return void 0;e = c, t = s, r = i, n = !0;
  }
},
    EventEmitter = require("zm-event-kit").Emitter,
    Communication = (function (e) {
  function t(e) {
    _classCallCheck(this, t), _get(Object.getPrototypeOf(t.prototype), "constructor", this).call(this), this.debug = e;
  }return (_inherits(t, e), _createClass(t, [{ key: "gotMessage", value: function value(e, t) {
      if (t.SB) if ((this.debug && console.debug(t), "send" === t.Genre)) {
        t.response = null;var r = void 0;try {
          this.emit(t.Type, t), r = t.response instanceof Promise ? t.response : Promise.resolve(t.response);
        } catch (n) {
          r = Promise.reject(n);
        }r.then(function (r) {
          e({ Genre: "response", Status: !0, Result: r, ID: t.ID, SB: !0 });
        }, function (r) {
          r instanceof Error && (r = { stack: r.stack, message: r.message }), e({ Genre: "response", Status: !1, Result: r, ID: t.ID, SB: !0 });
        });
      } else "response" === t.Genre && this.emit("JOB:" + t.ID, t);
    } }, { key: "request", value: function value(e, r, n) {
      var o = this;return new Promise(function (s, i) {
        var u = t.randomId(),
            a = o.on("JOB:" + u, function (e) {
          a.dispose(), e.Status ? s(e.Result) : i(e.Result);
        });e({ Type: r, Genre: "send", Message: n, SB: !0, ID: u });
      });
    } }], [{ key: "randomId", value: function value() {
      return (Math.random().toString(36) + "00000000000000000").slice(2, 9);
    } }]), t);
})(EventEmitter);module.exports = Communication;

},{"zm-event-kit":1}],6:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var ExchangeCommunication = require('sb-communication');

var Exchange = (function () {
  function Exchange() {
    _classCallCheck(this, Exchange);

    this.Ports = [];
    this.Communication = new ExchangeCommunication();
  }

  _createClass(Exchange, [{
    key: 'Handle',
    value: function Handle(Port) {
      var _this = this;

      this.Ports.push(Port);
      if (Port.start) {
        Port.start();
      }
      Port.sendCallback = function (data) {
        Port.postMessage(data);
      };
      Port.addEventListener('message', function (message) {
        _this.Communication.gotMessage(Port.sendCallback, message.data);
      });
    }
  }, {
    key: 'on',
    value: function on(type, message) {
      return this.Communication.on(type, message);
    }
  }, {
    key: 'request',
    value: function request(type, message, port) {
      port = port || this.Ports[0];
      return this.Communication.request(port.sendCallback, type, message);
    }
  }]);

  return Exchange;
})();

Exchange = new Exchange();
self.addEventListener('message', function Once() {
  // I am a dedicated worker
  Exchange.Handle(self);
  self.removeEventListener('message', Once);
});
self.addEventListener('connect', function (e) {
  // I am a shared worker
  Exchange.Handle(e.ports[0]);
});

self.Exchange = Exchange;
module.exports = Exchange;

},{"sb-communication":5}]},{},[6]);
