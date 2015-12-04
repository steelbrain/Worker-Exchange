(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Exchange = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';
'use babel';

var _sbEventKit = require('sb-event-kit');

var _sbCommunication = require('sb-communication');

var _sbCommunication2 = _interopRequireDefault(_sbCommunication);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Exchange {
  constructor(worker) {
    var _this = this;

    this.worker = worker;
    this.port = worker.port || worker;

    this.communication = new _sbCommunication2.default();
    this.subscriptions = new _sbEventKit.CompositeDisposable();

    this.subscriptions.add(this.communication);

    const callback = function (message) {
      _this.communication.parseMessage(message.data);
    };
    this.port.addEventListener('message', callback);
    this.subscriptions.add(new _sbEventKit.Disposable(function () {
      _this.port.removeEventListener('message', callback);
    }));
    this.communication.onShouldSend(function (message) {
      _this.port.postMessage(message);
    });

    this.onRequest('ping', function (_, message) {
      message.response = 'pong';
    });
    this.request('ping');
  }

  request(name) {
    let data = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return this.communication.request(name, data);
  }

  onRequest(name, callback) {
    return this.communication.onRequest(name, callback);
  }

  terminate() {
    if (this.worker.terminate) {
      this.worker.terminate();
    } else {
      this.port.close();
    }
    this.dispose();
  }
  dispose() {
    this.subscriptions.dispose();
  }

  static create(filePath) {
    return new Exchange(new Worker(filePath));
  }
  static createShared(filePath) {
    const worker = new SharedWorker(filePath);
    const exchange = new Exchange(worker);
    worker.port.start();
    return exchange;
  }
}

module.exports = Exchange;
},{"sb-communication":5,"sb-event-kit":9}],2:[function(require,module,exports){
'use strict';
'use babel';

var _sbEventKit = require('sb-event-kit');

var _sbCommunication = require('sb-communication');

var _sbCommunication2 = _interopRequireDefault(_sbCommunication);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class ExchangePort {
  constructor(port) {
    var _this = this;

    this.active = true;
    this.port = port;

    // Property initialization
    this.communication = new _sbCommunication2.default();
    this.emitter = new _sbEventKit.Emitter();
    this.subscriptions = new _sbEventKit.CompositeDisposable();

    this.subscriptions.add(this.communication, this.emitter);

    // Share data between communication and port
    const callback = function (message) {
      _this.communication.parseMessage(message.data);
    };
    this.port.addEventListener('message', callback);
    this.subscriptions.add(new _sbEventKit.Disposable(function () {
      _this.port.removeEventListener('message', callback);
    }));
    this.communication.onShouldSend(function (message) {
      _this.port.postMessage(message);
    });

    // Check if the port is closed, we got no official close event
    let timeout;
    const ping = function () {
      if (!_this.active) {
        // Ignore if already disposed
        return;
      }
      _this.request('ping').then(function () {
        clearTimeout(timeout);
        setTimeout(ping, 1000);
      });
      timeout = setTimeout(function () {
        _this.dispose();
      }, 1000);
    };
    ping();

    this.onRequest('ping', function (_, message) {
      message.response = 'pong';
    });
  }

  request(name) {
    let data = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    if (!this.active) {
      throw new Error('Worker port has been disposed');
    }

    return this.communication.request(name, data);
  }

  onRequest(name, callback) {
    return this.communication.onRequest(name, callback);
  }

  onDidClose(callback) {
    return this.emitter.on('close', callback);
  }

  dispose() {
    if (this.active) {
      this.port.close();
      this.emitter.emit('close');
      this.active = false;
      this.subscriptions.dispose();
    }
  }
}

module.exports = ExchangePort;
},{"sb-communication":5,"sb-event-kit":9}],3:[function(require,module,exports){
'use strict';
'use babel';

var _sbEventKit = require('sb-event-kit');

var _exchangeWorkerPort = require('./exchange-worker-port');

var _exchangeWorkerPort2 = _interopRequireDefault(_exchangeWorkerPort);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Exchange {
  constructor() {
    this.ports = new Set();
    this.emitter = new _sbEventKit.Emitter();
    this.subscriptions = new _sbEventKit.CompositeDisposable();

    this.subscriptions.add(this.emitter);
  }

  addPort(port) {
    var _this = this;

    const exchangePort = new _exchangeWorkerPort2.default(port);
    this.ports.add(exchangePort);
    this.subscriptions.add(exchangePort);
    exchangePort.onDidClose(function () {
      _this.ports.delete(exchangePort);
      _this.subscriptions.remove(exchangePort);
      _this.emitter.emit('port-close', exchangePort);
    });
    this.emitter.emit('port-add', exchangePort);
  }

  forEach(callback) {
    this.ports.forEach(callback);
  }
  observe(callback) {
    this.forEach(callback);
    return this.onDidPortAdd(callback);
  }
  onRequest(name, callback) {
    const subscriptions = new _sbEventKit.CompositeDisposable();
    subscriptions.add(this.observe(function (port) {
      subscriptions.add(port.onRequest(name, callback));
    }));
    return subscriptions;
  }
  onDidPortAdd(callback) {
    return this.emitter.on('port-add', callback);
  }
  onDidPortClose(callback) {
    return this.emitter.on('port-close', callback);
  }

  dispose() {
    this.subscriptions.dispose();
  }
}

module.exports = Exchange;
},{"./exchange-worker-port":2,"sb-event-kit":9}],4:[function(require,module,exports){
'use strict'

if (typeof document === 'undefined') {
  // We're in a worker
  const Exchange = require('./exchange-worker')
  const exchange = new Exchange()
  self.addEventListener('message', function Once(){
    // I am a dedicated worker
    exchange.addPort(self)
    self.removeEventListener('message', Once)
  })
  self.addEventListener('connect', function(e){
    // I am a shared worker
    const port = e.ports[0]
    exchange.addPort(port)
    port.start()
  })
  module.exports = Exchange
  self.exchange = exchange
} else {
  // We're in a host
  module.exports = require('./exchange-main')
}

},{"./exchange-main":1,"./exchange-worker":3}],5:[function(require,module,exports){
'use strict';
'use babel';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _sbEventKit = require('sb-event-kit');

class Communication {
  constructor(debug) {
    var _this = this;

    this.debug = Boolean(debug);
    this.emitter = new _sbEventKit.Emitter();
    this.subscriptions = new _sbEventKit.CompositeDisposable();

    this.emitter.on('request', function (message) {
      message.response = null;

      const response = new Promise(function (resolve) {
        _this.emitter.emit(`request:${ message.name }`, message.data, message);
        resolve(message.response);
      });

      response.then(function (response) {
        message.response = response;
        return true;
      }, function (val) {
        if (val instanceof Error) {
          const error = { __sb_is_error: true };
          Object.getOwnPropertyNames(val).forEach(function (key) {
            error[key] = val[key];
          });
          message.response = error;
        } else message.response = val;
        return false;
      }).then(function (status) {
        _this.emitter.emit('send', {
          id: message.id, sb_communication: true, status: status, type: 'response', data: message.response
        });
      });
    });
    this.emitter.on('response', function (message) {
      message.data = message.data && message.data.__sb_is_error ? Communication.createError(message.data) : message.data;
      _this.emitter.emit(`job:${ message.id }`, message);
    });
  }
  parseMessage(messageGiven) {
    let message;
    try {
      message = typeof messageGiven === 'string' ? JSON.parse(messageGiven) : messageGiven;
    } catch (_) {
      throw new Error('Error decoding response');
    }
    if (!message.sb_communication) {
      // Ignore unknown messages
      return;
    }
    if (this.debug) {
      console.debug(message);
    }
    this.emitter.emit(message.type, message);
  }
  request(name) {
    var _this2 = this;

    let data = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return new Promise(function (resolve, reject) {
      const id = Communication.randomId();
      const disposable = _this2.emitter.on(`job:${ id }`, function (result) {
        disposable.dispose();
        if (result.status) {
          resolve(result.data);
        } else reject(result.data);
      });
      _this2.emitter.emit('send', {
        id: id, sb_communication: true, name: name, type: 'request', data: data
      });
    });
  }
  onRequest(name, callback) {
    return this.emitter.on(`request:${ name }`, callback);
  }
  onShouldSend(callback) {
    return this.emitter.on('send', callback);
  }
  dispose() {
    this.subscriptions.dispose();
    this.emitter.dispose();
  }
  static randomId() {
    return (Math.random().toString(36) + '00000000000000000').slice(2, 7 + 2);
  }
  static createError(data) {
    const error = new Error();
    for (const key in data) {
      if (key !== '__sb_is_error') {
        error[key] = data[key];
      }
    }
    return error;
  }
}
exports.default = Communication;
},{"sb-event-kit":9}],6:[function(require,module,exports){
'use strict';
'use babel';

Object.defineProperty(exports, "__esModule", {
  value: true
});
class CompositeDisposable {
  constructor() {
    this.disposed = false;
    this.disposables = new Set(arguments);
  }
  dispose() {
    if (!this.disposed) {
      this.disposed = true;
      this.disposables.forEach(function (item) {
        item.dispose();
      });
      this.disposables = null;
    }
  }
  add() {
    var _this = this;

    if (!this.disposed) {
      Array.prototype.forEach.call(arguments, function (item) {
        return _this.disposables.add(item);
      });
    }
  }
  remove() {
    var _this2 = this;

    if (!this.disposed) {
      Array.prototype.forEach.call(arguments, function (item) {
        return _this2.disposables.delete(item);
      });
    }
  }
  clear() {
    if (!this.disposed) {
      this.disposables.clear();
    }
  }
}
exports.CompositeDisposable = CompositeDisposable;
},{}],7:[function(require,module,exports){
'use strict';
'use babel';

Object.defineProperty(exports, "__esModule", {
  value: true
});
class Disposable {
  constructor(callback) {
    this.disposed = false;
    this.callback = callback;
  }
  dispose() {
    if (!this.disposed) {
      this.disposed = true;
      if (typeof this.callback === 'function') {
        this.callback();
      }
      this.callback = null;
    }
  }
}
exports.Disposable = Disposable;
},{}],8:[function(require,module,exports){
'use strict';
'use babel';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Emitter = undefined;

var _disposable = require('./disposable');

class Emitter {
  constructor() {
    this.disposed = false;
    this.handlers = {};
  }
  dispose() {
    this.disposed = true;
    this.handlers = null;
  }
  on(eventName, handler) {
    var _this = this;

    if (this.disposed) {
      throw new Error('Emitter has been disposed');
    }
    if (typeof handler !== 'function') {
      throw new Error('Event handler must be a function');
    }
    if (typeof this.handlers[eventName] === 'undefined') {
      this.handlers[eventName] = [handler];
    } else {
      this.handlers[eventName].push(handler);
    }
    return new _disposable.Disposable(function () {
      _this.off(eventName, handler);
    });
  }
  off(eventName, handler) {
    if (this.disposed || typeof this.handlers[eventName] === 'undefined') {
      return;
    }
    const index = this.handlers[eventName].indexOf(handler);
    if (index !== -1) {
      this.handlers[eventName].splice(index, 1);
    }
  }
  clear() {
    this.handlers = [];
  }
  emit(eventName) {
    for (var _len = arguments.length, params = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      params[_key - 1] = arguments[_key];
    }

    if (this.disposed || typeof this.handlers[eventName] === 'undefined') {
      return;
    }
    const paramsLength = params.length;
    this.handlers[eventName].forEach(function (callback) {
      if (paramsLength === 1) {
        callback(params[0]);
      } else if (paramsLength === 2) {
        callback(params[0], params[1]);
      } else {
        callback.apply(undefined, params);
      }
    });
  }
}
exports.Emitter = Emitter;
},{"./disposable":7}],9:[function(require,module,exports){
'use strict';
'use babel';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _disposable = require('./disposable');

Object.defineProperty(exports, 'Disposable', {
  enumerable: true,
  get: function () {
    return _disposable.Disposable;
  }
});

var _compositeDisposable = require('./composite-disposable');

Object.defineProperty(exports, 'CompositeDisposable', {
  enumerable: true,
  get: function () {
    return _compositeDisposable.CompositeDisposable;
  }
});

var _emitter = require('./emitter');

Object.defineProperty(exports, 'Emitter', {
  enumerable: true,
  get: function () {
    return _emitter.Emitter;
  }
});
},{"./composite-disposable":6,"./disposable":7,"./emitter":8}]},{},[4])(4)
});