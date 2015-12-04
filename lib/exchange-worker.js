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