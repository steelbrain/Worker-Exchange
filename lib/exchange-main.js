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